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

import { logWarn, logInfo, logError } from './telemetry';

// Redis client instance (singleton)
let redisClient: any = null;
let connectionPromise: Promise<any> | null = null;
let isConnecting = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if Redis client is connected and healthy
 */
async function checkRedisHealth(redis: any): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logWarn('redis_health_check_failed', { error: (error as Error).message });
    return false;
  }
}

/**
 * Get or create Redis client with health checks and retry logic
 * Exported for use in rate limiting
 */
export async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  // If client exists, check health
  if (redisClient) {
    const now = Date.now();
    // Check health periodically or if last check was too long ago
    if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
      const isHealthy = await checkRedisHealth(redisClient);
      if (!isHealthy) {
        // Connection lost, reset client
        logWarn('redis_connection_lost', {});
        try {
          await redisClient.quit();
        } catch {
          // Ignore quit errors
        }
        redisClient = null;
        connectionPromise = null;
      } else {
        lastHealthCheck = now;
      }
    }
  }

  // If no client or connection lost, create new one
  if (!redisClient && !isConnecting) {
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        // Dynamic import to avoid requiring redis package if not needed
        const { createClient } = await import('redis');
        const client = createClient({ 
          url: process.env.REDIS_URL,
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                logWarn('redis_reconnect_failed', { retries });
                return new Error('Redis reconnection failed');
              }
              return Math.min(retries * 100, 3000);
            },
            connectTimeout: 10000, // 10 seconds timeout
          }
        });
        
        client.on('error', (err: Error) => {
          logWarn('redis_client_error', { error: err.message });
          // Reset client on error to force reconnection
          redisClient = null;
          connectionPromise = null;
          isConnecting = false;
        });

        client.on('connect', () => {
          logInfo('redis_client_connecting', {});
        });

        client.on('ready', () => {
          logInfo('redis_client_ready', {});
          lastHealthCheck = Date.now();
        });

        client.on('reconnecting', () => {
          logInfo('redis_client_reconnecting', {});
        });
        
        await client.connect();
        logInfo('redis_client_connected', { url: process.env.REDIS_URL?.replace(/:[^:@]+@/, ':****@') });
        
        // Verify connection with ping
        await client.ping();
        lastHealthCheck = Date.now();
        
        redisClient = client;
        isConnecting = false;
        return client;
      } catch (error) {
        isConnecting = false;
        logError('redis_client_init_error', {
          error: (error as Error).message,
          stack: (error as Error).stack?.substring(0, 500)
        });
        return null;
      }
    })();
  }

  // Wait for connection if in progress
  if (connectionPromise) {
    await connectionPromise;
  }

  return redisClient;
}

// TTL for progress data (2 hours - extended for long analyses)
const PROGRESS_TTL = 2 * 60 * 60;

// TTL for job data (2 hours - extended for long analyses)
const JOB_TTL = 2 * 60 * 60;

/**
 * Check if Redis is available (has REDIS_URL environment variable)
 */
export function isKvAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

/**
 * Get progress from KV
 * If result is stored in Blob, retrieves it from there
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
    if (!data) {
      return null;
    }
    
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      // If result is stored in Blob, retrieve it
      if (parsed.blobUrl && !parsed.result) {
        try {
          const { getResultFromBlob } = await import('./blob');
          const result = await getResultFromBlob(parsed.blobUrl);
          if (result) {
            parsed.result = result;
            logInfo('kv_progress_retrieved_from_blob', {
              conversationId,
              blobUrl: parsed.blobUrl,
            });
          } else {
            logWarn('kv_progress_blob_not_found', {
              conversationId,
              blobUrl: parsed.blobUrl,
            });
          }
        } catch (blobError) {
          logWarn('kv_progress_blob_retrieve_error', {
            conversationId,
            blobUrl: parsed.blobUrl,
            error: (blobError as Error).message,
          });
        }
      }
      
      return parsed;
    } catch (error) {
      logWarn('kv_get_progress_parse_error', {
        conversationId,
        error: (error as Error).message,
        dataType: typeof data,
        dataLength: typeof data === 'string' ? data.length : 0
      });
      return null;
    }
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
 * For large results, stores reference to Vercel Blob instead of full data
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
    blobUrl?: string; // URL to Vercel Blob if result is stored there
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

    // For large results, store in Vercel Blob and keep only reference in Redis
    let progressToStore = { ...progress };
    if (progress.result) {
      const serialized = JSON.stringify(progress.result);
      const sizeBytes = Buffer.byteLength(serialized, 'utf8');
      
      // Offload only when extremely large; keep inline otherwise to avoid missing results
      const BLOB_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB
      if (sizeBytes > BLOB_THRESHOLD_BYTES) {
        try {
          const { storeResultInBlob } = await import('./blob');
          const blobUrl = await storeResultInBlob(conversationId, progress.result);
          if (blobUrl) {
            // Store blob URL instead of full result
            progressToStore = {
              ...progress,
              blobUrl,
              result: undefined, // Remove large result from Redis
            };
            logInfo('kv_progress_using_blob', {
              conversationId,
              blobUrl,
              originalSizeBytes: sizeBytes,
            });
          }
        } catch (blobError) {
          logWarn('kv_progress_blob_fallback', {
            conversationId,
            error: (blobError as Error).message,
          });
          // Fallback to Redis even if large
        }
      }
    }
    
    const serialized = JSON.stringify(progressToStore);
    const sizeBytes = Buffer.byteLength(serialized, 'utf8');
    
    // Check if still too large (shouldn't happen with blob, but safety check)
    if (sizeBytes > 10 * 1024 * 1024) { // 10MB warning
      logWarn('kv_progress_large', {
        conversationId,
        sizeBytes,
        hasResult: !!progress.result,
        hasBlobUrl: !!progressToStore.blobUrl
      });
    }
    
    // Use SETEX with extended TTL on each update to prevent expiration during long analyses
    // Extend TTL to maximum if result is present (analysis completed)
    const ttl = progress.result || progressToStore.blobUrl ? PROGRESS_TTL * 2 : PROGRESS_TTL;
    await redis.setEx(key, ttl, serialized);
    
    if (progress.result || progressToStore.blobUrl) {
      logInfo('kv_set_progress_with_result', {
        conversationId,
        sectionsCount: progress.result?.analysis?.sections?.length || 0,
        sizeBytes,
        hasBlobUrl: !!progressToStore.blobUrl,
        ttl
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
    
    // Extend TTL for completed jobs to allow result retrieval
    const ttl = job.status === 'completed' ? JOB_TTL * 2 : JOB_TTL;
    await redis.setEx(key, ttl, JSON.stringify(job));
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

