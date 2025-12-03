/**
 * Redis client for shared state across serverless workers
 * 
 * This replaces in-memory stores to solve worker isolation issues in serverless environments.
 * 
 * Supports:
 * - Vercel Redis (via REDIS_URL from Vercel Storage)
 * - Standard Redis (for VPS or other deployments)
 * 
 * Uses the standard 'redis' package which works with any Redis-compatible server.
 */

import { logWarn, logInfo } from './telemetry';

// Redis client instance (singleton)
let redisClient: any = null;

/**
 * Get or create Redis client
 */
async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      // Dynamic import to avoid requiring redis package if not needed
      const { createClient } = await import('redis');
      redisClient = createClient({ 
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logWarn('redis_reconnect_failed', { retries });
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });
      
      redisClient.on('error', (err: Error) => {
        logWarn('redis_client_error', { error: err.message });
      });
      
      await redisClient.connect();
      logInfo('redis_client_connected', { url: process.env.REDIS_URL?.replace(/:[^:@]+@/, ':****@') });
    } catch (error) {
      logWarn('redis_client_init_error', {
        error: (error as Error).message
      });
      return null;
    }
  }
  return redisClient;
}

// TTL for progress data (1 hour)
const PROGRESS_TTL = 60 * 60;

// TTL for job data (1 hour)
const JOB_TTL = 60 * 60;

/**
 * Check if Redis is available (has REDIS_URL environment variable)
 */
export function isKvAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

/**
 * Get progress from KV
 */
export async function getProgressFromKv(conversationId: string) {
  if (!isKvAvailable()) {
    return null;
  }

  try {
    const key = `progress:${conversationId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return null;
    }
    
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    logWarn('kv_get_progress_error', {
      conversationId,
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * Set progress in KV
 */
export async function setProgressInKv(
  conversationId: string,
  progress: {
    conversationId: string;
    status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
    progress: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
    result?: {
      conversation: any;
      analysis: any;
      activityByDay: Array<{ date: string; messageCount: number }>;
    };
  }
) {
  if (!isKvAvailable()) {
    return false;
  }

  try {
    const key = `progress:${conversationId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return false;
    }
    
    await redis.setEx(key, PROGRESS_TTL, JSON.stringify(progress));
    
    if (progress.result) {
      logInfo('kv_set_progress_with_result', {
        conversationId,
        sectionsCount: progress.result.analysis?.sections?.length || 0
      });
    }
    return true;
  } catch (error) {
    logWarn('kv_set_progress_error', {
      conversationId,
      error: (error as Error).message
    });
    return false;
  }
}

/**
 * Get job from KV
 */
export async function getJobFromKv(jobId: string) {
  if (!isKvAvailable()) {
    return null;
  }

  try {
    const key = `job:${jobId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return null;
    }
    
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    logWarn('kv_get_job_error', {
      jobId,
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * Set job in KV
 */
export async function setJobInKv(jobId: string, job: any) {
  if (!isKvAvailable()) {
    return false;
  }

  try {
    const key = `job:${jobId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return false;
    }
    
    await redis.setEx(key, JOB_TTL, JSON.stringify(job));
    return true;
  } catch (error) {
    logWarn('kv_set_job_error', {
      jobId,
      error: (error as Error).message
    });
    return false;
  }
}

/**
 * Find job by conversationId in KV
 */
export async function getJobByConversationIdFromKv(conversationId: string) {
  if (!isKvAvailable()) {
    return null;
  }

  try {
    // Since Redis doesn't support querying by value, we'll use a separate index
    // Store jobId -> conversationId mapping
    const indexKey = `job_index:${conversationId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return null;
    }
    
    const jobId = await redis.get(indexKey) as string | null;
    
    if (!jobId) {
      return null;
    }
    
    return await getJobFromKv(jobId);
  } catch (error) {
    logWarn('kv_get_job_by_conversation_error', {
      conversationId,
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * Set job index (jobId -> conversationId mapping)
 */
export async function setJobIndex(conversationId: string, jobId: string) {
  if (!isKvAvailable()) {
    return false;
  }

  try {
    const indexKey = `job_index:${conversationId}`;
    const redis = await getRedisClient();
    
    if (!redis) {
      return false;
    }
    
    await redis.setEx(indexKey, JOB_TTL, jobId);
    return true;
  } catch (error) {
    logWarn('kv_set_job_index_error', {
      conversationId,
      jobId,
      error: (error as Error).message
    });
    return false;
  }
}

