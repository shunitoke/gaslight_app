/**
 * Real-time LLM activity logger
 * Stores streaming chunks and activity events in Redis for admin dashboard
 */

import { getRedisClient, isKvAvailable } from './kv';
import { logInfo, logWarn, logError } from './telemetry';

const ACTIVITY_LOG_PREFIX = 'llm_activity:';
const ACTIVITY_LOG_TTL = 60 * 60; // 1 hour

export type LLMActivityEvent = {
  timestamp: number;
  conversationId: string;
  chunkIndex: number;
  eventType: 'request_start' | 'chunk_received' | 'request_complete' | 'error';
  model: string;
  data?: {
    chunk?: string;
    content?: string;
    tokens?: number;
    duration?: number;
    error?: string;
  };
};

/**
 * Log LLM activity event in real-time
 */
export async function logLLMActivity(event: LLMActivityEvent): Promise<void> {
  try {
    if (!isKvAvailable()) {
      return; // Skip if Redis not available
    }

    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${ACTIVITY_LOG_PREFIX}${event.conversationId}`;
    const eventJson = JSON.stringify(event);

    // Add to list (keep last 100 events per conversation)
    // Redis v4+ uses camelCase methods
    if (typeof redis.lPush === 'function') {
      await redis.lPush(key, eventJson);
      await redis.lTrim(key, 0, 99); // Keep only last 100 events
      await redis.expire(key, ACTIVITY_LOG_TTL);
    } else if (typeof redis.lpush === 'function') {
      // Fallback for older Redis clients
      await redis.lpush(key, eventJson);
      await redis.ltrim(key, 0, 99);
      await redis.expire(key, ACTIVITY_LOG_TTL);
    } else {
      // If list operations not available, use simple string append with separator
      const existing = await redis.get(key);
      const events = existing ? JSON.parse(existing) : [];
      events.push(event);
      const trimmed = events.slice(-100); // Keep last 100
      await redis.setEx(key, ACTIVITY_LOG_TTL, JSON.stringify(trimmed));
    }

    // Also log to telemetry for debugging
    logInfo('llm_activity_logged', {
      conversationId: event.conversationId,
      eventType: event.eventType,
      chunkIndex: event.chunkIndex
    });
  } catch (error) {
    logWarn('llm_activity_log_error', {
      conversationId: event.conversationId,
      error: (error as Error).message
    });
  }
}

/**
 * Get LLM activity events for a conversation
 */
export async function getLLMActivity(conversationId: string): Promise<LLMActivityEvent[]> {
  try {
    if (!isKvAvailable()) {
      return [];
    }

    const redis = await getRedisClient();
    if (!redis) {
      return [];
    }

    const key = `${ACTIVITY_LOG_PREFIX}${conversationId}`;
    
    // Redis v4+ uses camelCase methods
    let events: string[] = [];
    if (typeof redis.lRange === 'function') {
      events = await redis.lRange(key, 0, -1);
    } else if (typeof redis.lrange === 'function') {
      events = await redis.lrange(key, 0, -1);
    } else {
      // Fallback: try to get as JSON array
      const data = await redis.get(key);
      if (data) {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          events = Array.isArray(parsed) ? parsed.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)) : [];
        } catch {
          // Ignore parse errors
        }
      }
    }

    return events.map(event => {
      try {
        return JSON.parse(event) as LLMActivityEvent;
      } catch {
        return null;
      }
    }).filter((e): e is LLMActivityEvent => e !== null).reverse(); // Most recent first
  } catch (error) {
    logError('llm_activity_get_error', {
      conversationId,
      error: (error as Error).message
    });
    return [];
  }
}

/**
 * Clear LLM activity log for a conversation
 */
export async function clearLLMActivity(conversationId: string): Promise<void> {
  try {
    if (!isKvAvailable()) {
      return;
    }

    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${ACTIVITY_LOG_PREFIX}${conversationId}`;
    await redis.del(key);
  } catch (error) {
    logWarn('llm_activity_clear_error', {
      conversationId,
      error: (error as Error).message
    });
  }
}

