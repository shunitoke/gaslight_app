/**
 * Metrics and monitoring for analysis performance
 * 
 * Tracks:
 * - Analysis duration
 * - File sizes
 * - Cache hit rate
 * - Chunk processing times
 * - Error rates
 */

import { logInfo, logError } from './telemetry';
import { getRedisClient } from './kv';

const METRICS_KEY_PREFIX = 'metrics:';
const METRICS_TTL = 30 * 24 * 60 * 60; // 30 days

export type AnalysisMetrics = {
  conversationId: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  fileSizeBytes: number;
  messageCount: number;
  chunkCount: number;
  cacheHit: boolean;
  enhancedAnalysis: boolean;
  platform: string;
  error?: string;
};

export type CacheMetrics = {
  hits: number;
  misses: number;
  hitRate: number; // hits / (hits + misses)
  totalRequests: number;
};

/**
 * Record analysis start
 */
export async function recordAnalysisStart(
  conversationId: string,
  fileSizeBytes: number,
  messageCount: number,
  platform: string,
  enhancedAnalysis: boolean
): Promise<void> {
  try {
    const metrics: AnalysisMetrics = {
      conversationId,
      startTime: Date.now(),
      fileSizeBytes,
      messageCount,
      chunkCount: 0, // Will be updated later
      cacheHit: false,
      enhancedAnalysis,
      platform
    };

    const redis = await getRedisClient();
    if (redis) {
      await redis.setEx(
        `${METRICS_KEY_PREFIX}analysis:${conversationId}`,
        METRICS_TTL,
        JSON.stringify(metrics)
      );
    }

    logInfo('metrics_analysis_start', {
      conversationId,
      fileSizeBytes,
      messageCount,
      platform
    });
  } catch (error) {
    logError('metrics_record_error', {
      conversationId,
      error: (error as Error).message
    });
  }
}

/**
 * Record analysis completion
 */
export async function recordAnalysisComplete(
  conversationId: string,
  chunkCount: number,
  cacheHit: boolean = false,
  error?: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${METRICS_KEY_PREFIX}analysis:${conversationId}`;
    const existing = await redis.get(key);
    
    if (existing) {
      const metrics: AnalysisMetrics = JSON.parse(existing);
      metrics.endTime = Date.now();
      metrics.durationMs = metrics.endTime - metrics.startTime;
      metrics.chunkCount = chunkCount;
      metrics.cacheHit = cacheHit;
      if (error) {
        metrics.error = error;
      }

      await redis.setEx(key, METRICS_TTL, JSON.stringify(metrics));

      // Also update aggregate metrics
      await updateAggregateMetrics(metrics);

      logInfo('metrics_analysis_complete', {
        conversationId,
        durationMs: metrics.durationMs,
        chunkCount,
        cacheHit,
        hasError: !!error
      });
    }
  } catch (error) {
    logError('metrics_complete_error', {
      conversationId,
      error: (error as Error).message
    });
  }
}

/**
 * Record cache hit
 */
export async function recordCacheHit(): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${METRICS_KEY_PREFIX}cache:hits`;
    const hits = await redis.incr(key);
    await redis.expire(key, METRICS_TTL);

    logInfo('metrics_cache_hit', { totalHits: hits });
  } catch (error) {
    logError('metrics_cache_hit_error', {
      error: (error as Error).message
    });
  }
}

/**
 * Record cache miss
 */
export async function recordCacheMiss(): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${METRICS_KEY_PREFIX}cache:misses`;
    const misses = await redis.incr(key);
    await redis.expire(key, METRICS_TTL);

    logInfo('metrics_cache_miss', { totalMisses: misses });
  } catch (error) {
    logError('metrics_cache_miss_error', {
      error: (error as Error).message
    });
  }
}

/**
 * Get cache metrics
 */
export async function getCacheMetrics(): Promise<CacheMetrics | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return null;
    }

    const [hits, misses] = await Promise.all([
      redis.get(`${METRICS_KEY_PREFIX}cache:hits`),
      redis.get(`${METRICS_KEY_PREFIX}cache:misses`)
    ]);

    const hitsNum = parseInt(hits || '0', 10);
    const missesNum = parseInt(misses || '0', 10);
    const total = hitsNum + missesNum;

    return {
      hits: hitsNum,
      misses: missesNum,
      hitRate: total > 0 ? hitsNum / total : 0,
      totalRequests: total
    };
  } catch (error) {
    logError('metrics_get_cache_error', {
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * Reset cache hit/miss counters
 */
export async function resetCacheMetrics(): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return 0;
    }

    const keys = [
      `${METRICS_KEY_PREFIX}cache:hits`,
      `${METRICS_KEY_PREFIX}cache:misses`
    ];

    const deleted = await redis.del(keys);
    logInfo('metrics_cache_reset', { deletedKeys: deleted });
    return deleted;
  } catch (error) {
    logError('metrics_reset_cache_error', {
      error: (error as Error).message
    });
    return 0;
  }
}

/**
 * Get analysis metrics for a conversation
 */
export async function getAnalysisMetrics(conversationId: string): Promise<AnalysisMetrics | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return null;
    }

    const key = `${METRICS_KEY_PREFIX}analysis:${conversationId}`;
    const data = await redis.get(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data) as AnalysisMetrics;
  } catch (error) {
    logError('metrics_get_analysis_error', {
      conversationId,
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * Update aggregate metrics (for analytics)
 */
async function updateAggregateMetrics(metrics: AnalysisMetrics): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    // Update average duration
    const avgKey = `${METRICS_KEY_PREFIX}avg:duration`;
    const countKey = `${METRICS_KEY_PREFIX}avg:count`;
    
    const [currentAvg, currentCount] = await Promise.all([
      redis.get(avgKey),
      redis.get(countKey)
    ]);

    const avg = parseFloat(currentAvg || '0');
    const count = parseInt(currentCount || '0', 10);
    const newAvg = count > 0 
      ? (avg * count + (metrics.durationMs || 0)) / (count + 1)
      : (metrics.durationMs || 0);

    await Promise.all([
      redis.setEx(avgKey, METRICS_TTL, newAvg.toString()),
      redis.incr(countKey),
      redis.expire(countKey, METRICS_TTL)
    ]);
  } catch (error) {
    logError('metrics_aggregate_error', {
      error: (error as Error).message
    });
  }
}

/**
 * Get aggregate metrics
 */
export async function getAggregateMetrics(): Promise<{
  averageDurationMs: number;
  totalAnalyses: number;
  cacheMetrics: CacheMetrics | null;
} | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return null;
    }

    const [avgDuration, totalCount, cacheMetrics] = await Promise.all([
      redis.get(`${METRICS_KEY_PREFIX}avg:duration`),
      redis.get(`${METRICS_KEY_PREFIX}avg:count`),
      getCacheMetrics()
    ]);

    return {
      averageDurationMs: parseFloat(avgDuration || '0'),
      totalAnalyses: parseInt(totalCount || '0', 10),
      cacheMetrics
    };
  } catch (error) {
    logError('metrics_get_aggregate_error', {
      error: (error as Error).message
    });
    return null;
  }
}

