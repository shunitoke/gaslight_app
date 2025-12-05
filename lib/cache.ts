/**
 * Cache analysis results by chat hash
 * 
 * Uses Redis to cache analysis results so that identical chats
 * can be analyzed instantly without re-running LLM analysis.
 * 
 * Features:
 * - Versioning: Cache keys include prompt version to invalidate on prompt changes
 * - Smart invalidation: Automatically invalidates when prompts change
 */

import { createHash } from 'crypto';
import { logInfo, logWarn, logError } from './telemetry';
import { getRedisClient } from './kv';
import type { AnalysisResult } from '../features/analysis/types';
import type { Message } from '../features/analysis/types';

const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const CACHE_KEY_PREFIX = 'analysis_cache:';
const PROMPT_VERSION_KEY = 'prompt_version';

// Current prompt version - increment this when prompts change
const CURRENT_PROMPT_VERSION = '1.1.1'; // Added stronger contradiction requirements and long-context overlap logic

/**
 * Compute hash of chat content for caching
 * Hash is based on message text and timestamps to ensure identical chats get same hash
 */
export function computeChatHash(messages: Message[]): string {
  // Create a stable representation of the chat
  // Include: message text, sender, timestamp (but not IDs which change)
  const chatContent = messages
    .map(msg => `${msg.senderId}:${msg.sentAt}:${msg.text || ''}`)
    .join('|');
  
  return createHash('sha256')
    .update(chatContent)
    .digest('hex')
    .substring(0, 32); // Use first 32 chars for shorter keys
}

/**
 * Get cache key with version
 */
function getCacheKey(chatHash: string, enhancedAnalysis: boolean = false): string {
  const version = enhancedAnalysis ? `${CURRENT_PROMPT_VERSION}:enhanced` : CURRENT_PROMPT_VERSION;
  return `${CACHE_KEY_PREFIX}${version}:${chatHash}`;
}

/**
 * Get current prompt version
 */
export function getPromptVersion(): string {
  return CURRENT_PROMPT_VERSION;
}

/**
 * Get cached analysis result by chat hash
 * @param chatHash - Hash of chat content
 * @param enhancedAnalysis - Whether enhanced analysis was used (affects cache key)
 */
export async function getCachedAnalysis(
  chatHash: string,
  enhancedAnalysis: boolean = false
): Promise<AnalysisResult | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return null; // No Redis, no cache
    }

    const cacheKey = getCacheKey(chatHash, enhancedAnalysis);
    const cached = await redis.get(cacheKey);
    
    if (!cached) {
      logInfo('cache_miss', { chatHash });
      // Record cache miss for metrics
      const { recordCacheMiss } = await import('./metrics');
      await recordCacheMiss();
      return null;
    }

    try {
      const result = JSON.parse(cached) as AnalysisResult;
      
      // Validate result - if it's an error/empty result, don't return it
      if (!isValidAnalysisResult(result)) {
        logInfo('cache_hit_invalid_result_deleted', {
          chatHash,
          overviewPreview: result.overviewSummary?.substring(0, 100),
          reason: 'invalid_or_error_result'
        });
        // Delete invalid cache entry
        await redis.del(cacheKey);
        // Record as miss since we couldn't use it
        const { recordCacheMiss } = await import('./metrics');
        await recordCacheMiss();
        return null;
      }
      
      logInfo('cache_hit', { chatHash });
      // Record cache hit for metrics
      const { recordCacheHit } = await import('./metrics');
      await recordCacheHit();
      return result;
    } catch (parseError) {
      logError('cache_parse_error', {
        chatHash,
        error: (parseError as Error).message
      });
      // Delete corrupted cache entry
      await redis.del(cacheKey);
      // Record as miss since we couldn't use it
      const { recordCacheMiss } = await import('./metrics');
      await recordCacheMiss();
      return null;
    }
  } catch (error) {
    logWarn('cache_get_error', {
      chatHash,
      error: (error as Error).message
    });
    return null; // Fail gracefully - continue with analysis
  }
}

/**
 * Check if analysis result is valid and should be cached
 * Returns false for empty/error results that shouldn't be cached
 */
function isValidAnalysisResult(result: AnalysisResult): boolean {
  // Don't cache if overviewSummary contains error messages
  const overview = result.overviewSummary?.toLowerCase() || '';
  const errorIndicators = [
    'empty response from llm',
    '(empty response from llm)',
    'rate limit exceeded',
    'daily llm rate limit',
    'daily rate limit',
    'parsing error',
    'ошибка парсинга',
    'из-за ошибки парсинга',
    'due to parsing error',
    'анализ завершен с частичными результатами',
    'analysis completed with partial results',
    'please add credits',
    'пожалуйста, добавьте кредиты',
    'try again tomorrow',
    'попробуйте завтра',
    'free tier allows',
    'бесплатный тариф позволяет'
  ];
  
  if (errorIndicators.some(indicator => overview.includes(indicator))) {
    return false;
  }
  
  // Don't cache if only default/empty sections
  if (!result.sections || result.sections.length === 0) {
    return false;
  }
  
  // Don't cache if all sections are default/empty (no evidence snippets)
  const hasValidSections = result.sections.some(section => 
    section.evidenceSnippets && 
    section.evidenceSnippets.length > 0 &&
    section.id !== 'default'
  );
  
  if (!hasValidSections) {
    return false;
  }
  
  // Don't cache if overview is too short (likely error message)
  // But allow short valid summaries (at least 30 chars to avoid false positives)
  if (overview.length < 30) {
    return false;
  }
  
  // Don't cache if overview looks like a default/placeholder message
  const defaultPatterns = [
    'analysis completed. review sections',
    'анализ завершен. просмотрите разделы',
    'analysis completed. no specific patterns',
    'анализ завершен. в этом отрывке не обнаружено'
  ];
  
  if (defaultPatterns.some(pattern => overview.includes(pattern))) {
    // Only skip if there are no valid sections with evidence
    if (!hasValidSections) {
      return false;
    }
  }
  
  return true;
}

/**
 * Store analysis result in cache
 * @param chatHash - Hash of chat content
 * @param result - Analysis result to cache
 * @param enhancedAnalysis - Whether enhanced analysis was used (affects cache key)
 */
export async function setCachedAnalysis(
  chatHash: string,
  result: AnalysisResult,
  enhancedAnalysis: boolean = false
): Promise<void> {
  try {
    // Don't cache invalid/error results
    if (!isValidAnalysisResult(result)) {
      logInfo('cache_skip_invalid_result', {
        chatHash,
        overviewPreview: result.overviewSummary?.substring(0, 100),
        sectionsCount: result.sections?.length || 0,
        hasValidSections: result.sections?.some(s => s.evidenceSnippets && s.evidenceSnippets.length > 0) || false
      });
      return;
    }
    
    const redis = await getRedisClient();
    if (!redis) {
      return; // No Redis, skip caching
    }

    const cacheKey = getCacheKey(chatHash, enhancedAnalysis);
    const serialized = JSON.stringify(result);
    
    // Store with TTL
    await redis.setEx(cacheKey, CACHE_TTL_SECONDS, serialized);
    
    logInfo('cache_set', {
      chatHash,
      ttlSeconds: CACHE_TTL_SECONDS,
      sizeBytes: Buffer.byteLength(serialized, 'utf8')
    });
  } catch (error) {
    logWarn('cache_set_error', {
      chatHash,
      error: (error as Error).message
    });
    // Fail gracefully - don't block analysis
  }
}

/**
 * Invalidate cache entry (if needed for manual cache clearing)
 */
export async function invalidateCache(chatHash: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    // Invalidate both enhanced and regular versions
    const regularKey = getCacheKey(chatHash, false);
    const enhancedKey = getCacheKey(chatHash, true);
    
    await Promise.all([
      redis.del(regularKey),
      redis.del(enhancedKey)
    ]);
    
    logInfo('cache_invalidated', { chatHash });
  } catch (error) {
    logWarn('cache_invalidate_error', {
      chatHash,
      error: (error as Error).message
    });
  }
}

/**
 * Invalidate all cache entries for a specific prompt version
 * Useful when prompts are updated
 */
export async function invalidateCacheByVersion(version: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      return 0;
    }

    // Find all keys matching the version pattern
    const pattern = `${CACHE_KEY_PREFIX}${version}:*`;
    const keys: string[] = [];
    
    // Redis SCAN to find matching keys (works with any Redis client)
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = result.cursor.toString();
      keys.push(...result.keys.map((k: string) => k));
    } while (cursor !== '0');

    if (keys.length > 0) {
      await redis.del(keys);
      logInfo('cache_invalidated_by_version', {
        version,
        keysDeleted: keys.length
      });
    }

    return keys.length;
  } catch (error) {
    logWarn('cache_invalidate_version_error', {
      version,
      error: (error as Error).message
    });
    return 0;
  }
}

