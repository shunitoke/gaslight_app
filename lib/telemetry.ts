type TelemetryLevel = 'info' | 'warn' | 'error';

// Store recent errors and warnings in memory for admin access (max 1MB)
const recentLogs: Array<{
  level: TelemetryLevel;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}> = [];
const MAX_LOG_SIZE_BYTES = 1024 * 1024; // 1MB

// Calculate total size of logs array in bytes
function calculateLogsSize(logs: Array<{
  level: TelemetryLevel;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}>): number {
  return Buffer.byteLength(JSON.stringify(logs), 'utf8');
}

// Rotate logs to stay under 1MB limit
function rotateLogs() {
  let currentSize = calculateLogsSize(recentLogs);
  
  // Remove oldest logs until under limit
  while (currentSize > MAX_LOG_SIZE_BYTES && recentLogs.length > 0) {
    recentLogs.shift(); // Remove oldest
    currentSize = calculateLogsSize(recentLogs);
  }
}

// Store logs (errors and warnings) in Redis if available (for serverless environments)
async function storeLogInRedis(payload: {
  level: TelemetryLevel;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}) {
  try {
    // Dynamic import to avoid circular dependencies
    const { isKvAvailable, getRedisClient } = await import('./kv');
    if (!isKvAvailable()) {
      return;
    }

    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = 'logs:recent'; // Store both errors and warnings
    const errorJson = JSON.stringify(payload);
    const errorSize = Buffer.byteLength(errorJson, 'utf8');
    
    // Check current size and rotate if needed
    let currentSize = 0;
    let errorCount = 0;
    
    if (typeof redis.lLen === 'function') {
      errorCount = await redis.lLen(key);
    } else if (typeof redis.llen === 'function') {
      errorCount = await redis.llen(key);
    }
    
    // Estimate current size (rough calculation)
    // We'll rotate by removing oldest entries if adding this would exceed limit
    if (errorCount > 0) {
      // Get a sample to estimate average size
      let sample: string[] = [];
      if (typeof redis.lRange === 'function') {
        sample = await redis.lRange(key, 0, Math.min(10, errorCount) - 1);
      } else if (typeof redis.lrange === 'function') {
        sample = await redis.lrange(key, 0, Math.min(10, errorCount) - 1);
      }
      
      if (sample.length > 0) {
        const avgSize = sample.reduce((sum, e) => sum + Buffer.byteLength(e, 'utf8'), 0) / sample.length;
        currentSize = avgSize * errorCount;
      }
    }
    
    // Add new error
    if (typeof redis.lPush === 'function') {
      await redis.lPush(key, errorJson);
    } else if (typeof redis.lpush === 'function') {
      await redis.lpush(key, errorJson);
    }
    
    // Rotate if needed - remove oldest entries until under 1MB
    let newSize = currentSize + errorSize;
    while (newSize > MAX_LOG_SIZE_BYTES) {
      if (typeof redis.rPop === 'function') {
        const removed = await redis.rPop(key);
        if (!removed) break;
        newSize -= Buffer.byteLength(removed, 'utf8');
      } else if (typeof redis.rpop === 'function') {
        const removed = await redis.rpop(key);
        if (!removed) break;
        newSize -= Buffer.byteLength(removed, 'utf8');
      } else {
        break;
      }
    }
    
    await redis.expire(key, 3600); // 1 hour TTL
  } catch (error) {
    // Silently fail - Redis storage is optional
  }
}

const emit = (level: TelemetryLevel, event: string, data?: Record<string, unknown>) => {
  const payload = {
    level,
    event,
    data,
    timestamp: new Date().toISOString()
  };

  console[level === 'error' ? 'error' : level](JSON.stringify(payload));

  // Store errors and warnings for admin access (both in memory and Redis)
  // Only store errors and warnings, skip info logs
  if (level === 'error' || level === 'warn') {
    recentLogs.push(payload);
    rotateLogs(); // Auto-rotate to stay under 1MB limit
    
    // Also store in Redis for serverless environments
    storeLogInRedis(payload).catch(() => {
      // Ignore Redis errors
    });
  }
};

/**
 * Clear all error and warning logs
 */
export async function clearErrorLogs(): Promise<void> {
  recentLogs.length = 0;
  
  try {
    const { isKvAvailable, getRedisClient } = await import('./kv');
    if (isKvAvailable()) {
      const redis = await getRedisClient();
      if (redis) {
        await redis.del('logs:recent');
      }
    }
  } catch {
    // Ignore Redis errors
  }
}

/**
 * Get log size in bytes (errors + warnings)
 */
export function getErrorLogSize(): number {
  return calculateLogsSize(recentLogs);
}

/**
 * Get recent errors and warnings for admin dashboard
 * Tries Redis first (for serverless), then falls back to in-memory
 */
export async function getRecentErrors(limit: number = 50, filter?: string): Promise<Array<{
  level: string;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}>> {
  let logs: Array<{
    level: string;
    event: string;
    data?: Record<string, unknown>;
    timestamp: string;
  }> = [];

  // Try Redis first (for serverless environments)
  try {
    const { isKvAvailable, getRedisClient } = await import('./kv');
    if (isKvAvailable()) {
      const redis = await getRedisClient();
      if (redis) {
        const key = 'logs:recent'; // Both errors and warnings
        let logStrings: string[] = [];
        
        if (typeof redis.lRange === 'function') {
          logStrings = await redis.lRange(key, 0, -1);
        } else if (typeof redis.lrange === 'function') {
          logStrings = await redis.lrange(key, 0, -1);
        }
        
        logs = logStrings.map(str => {
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        }).filter((e): e is any => e !== null).reverse(); // Most recent first
      }
    }
  } catch {
    // Fall back to in-memory
  }

  // If no Redis logs, use in-memory
  if (logs.length === 0) {
    logs = [...recentLogs].reverse();
  }
  
  if (filter) {
    const filterLower = filter.toLowerCase();
    logs = logs.filter(log => {
      return log.event.toLowerCase().includes(filterLower) ||
             JSON.stringify(log.data || {}).toLowerCase().includes(filterLower);
    });
  }
  
  return logs.slice(0, limit);
}

export const logInfo = (event: string, data?: Record<string, unknown>) =>
  emit('info', event, data);

export const logWarn = (event: string, data?: Record<string, unknown>) =>
  emit('warn', event, data);

export const logError = (event: string, data?: Record<string, unknown>) =>
  emit('error', event, data);

