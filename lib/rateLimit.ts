/**
 * Rate limiting using Redis (if available) or in-memory fallback
 * 
 * This provides distributed rate limiting that works across serverless workers.
 */

import { isKvAvailable } from './kv';
import { logWarn } from './telemetry';

// In-memory fallback for when Redis is not available
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 5; // Default: 5 requests per minute per IP

/**
 * Check rate limit using Redis if available, otherwise in-memory
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<boolean> {
  // Use Redis if available
  if (isKvAvailable()) {
    try {
      const { getRedisClient } = await import('./kv');
      const redis = await getRedisClient();
      
      if (redis) {
        const now = Date.now();
        const windowStart = now - windowMs;
        const redisKey = `ratelimit:${key}`;
        
        // Use Lua script for atomic rate limiting (prevents race conditions)
        // This ensures check-and-increment happens atomically
        try {
          const luaScript = `
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local windowStart = tonumber(ARGV[2])
            local maxRequests = tonumber(ARGV[3])
            local windowMs = tonumber(ARGV[4])
            local requestId = ARGV[5]
            
            -- Remove old entries
            redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
            
            -- Count current requests
            local count = redis.call('ZCARD', key)
            
            if count >= maxRequests then
              return 0
            end
            
            -- Add current request atomically
            redis.call('ZADD', key, now, requestId)
            
            -- Set expiry
            redis.call('EXPIRE', key, math.ceil(windowMs / 1000))
            
            return 1
          `;
          
          const requestId = `${now}-${Math.random().toString(36).substring(7)}`;
          const result = await redis.eval(
            luaScript,
            {
              keys: [redisKey],
              arguments: [
                now.toString(),
                windowStart.toString(),
                maxRequests.toString(),
                windowMs.toString(),
                requestId
              ]
            }
          ) as number;
          
          return result === 1;
        } catch (luaError) {
          // Fallback to non-atomic if Lua script fails
          logWarn('rate_limit_lua_fallback', {
            key,
            error: (luaError as Error).message
          });
          
          // Non-atomic fallback
          await redis.zRemRangeByScore(redisKey, 0, windowStart);
          const count = await redis.zCard(redisKey);
          
          if (count >= maxRequests) {
            return false;
          }
          
          await redis.zAdd(redisKey, {
            score: now,
            value: `${now}-${Math.random().toString(36).substring(7)}`
          });
          
          await redis.expire(redisKey, Math.ceil(windowMs / 1000));
          
          return true;
        }
      }
    } catch (error) {
      logWarn('rate_limit_redis_error', {
        key,
        error: (error as Error).message
      });
      // Fall through to in-memory fallback
    }
  }
  
  // In-memory fallback
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Get rate limit info (remaining requests, reset time)
 */
export async function getRateLimitInfo(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<{ remaining: number; resetAt: number }> {
  // Use Redis if available
  if (isKvAvailable()) {
    try {
      const { getRedisClient } = await import('./kv');
      const redis = await getRedisClient();
      
      if (redis) {
        const now = Date.now();
        const windowStart = now - windowMs;
        const redisKey = `ratelimit:${key}`;
        
        await redis.zRemRangeByScore(redisKey, 0, windowStart);
        const count = await redis.zCard(redisKey);
        const remaining = Math.max(0, maxRequests - count);
        
        // Get oldest entry to calculate reset time
        const oldest = await redis.zRange(redisKey, 0, 0);
        const resetAt = oldest.length > 0 
          ? now + windowMs // Approximate reset time
          : now + windowMs;
        
        return { remaining, resetAt };
      }
    } catch (error) {
      logWarn('rate_limit_info_redis_error', {
        key,
        error: (error as Error).message
      });
      // Fall through to in-memory fallback
    }
  }
  
  // In-memory fallback
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    return {
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    };
  }
  
  return {
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt
  };
}

