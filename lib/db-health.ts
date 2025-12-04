/**
 * Database connection health checks
 * 
 * Provides functions to check the health and connectivity of:
 * - Redis (for job/progress storage)
 * - Vercel Blob (for large file/results storage)
 */

import { logInfo, logWarn, logError } from './telemetry';
import { getRedisClient } from './kv';

export interface DatabaseHealthStatus {
  redis: {
    enabled: boolean;
    connected: boolean;
    error?: string;
  };
  blob: {
    enabled: boolean;
    accessible: boolean;
    error?: string;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Check Redis connection health
 */
async function checkRedisHealth(): Promise<{ connected: boolean; error?: string }> {
  if (!process.env.REDIS_URL) {
    return { connected: false, error: 'REDIS_URL not configured' };
  }

  try {
    const redis = await getRedisClient();
    if (!redis) {
      return { connected: false, error: 'Failed to get Redis client' };
    }

    // Try to ping Redis
    await redis.ping();
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message || 'Unknown Redis error',
    };
  }
}

/**
 * Check Vercel Blob accessibility
 * 
 * Note: We don't create test blobs to avoid unnecessary storage usage.
 * We only check if the token is configured and if the module can be imported.
 * Actual accessibility will be tested during real upload operations.
 */
async function checkBlobHealth(): Promise<{ accessible: boolean; error?: string }> {
  // Check if BLOB_READ_WRITE_TOKEN is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { accessible: false, error: 'BLOB_READ_WRITE_TOKEN not configured' };
  }

  try {
    // Try to import @vercel/blob to verify it's available
    // This doesn't test actual connectivity, but verifies the package is installed
    // and the token format is likely valid (actual connectivity tested during upload)
    await import('@vercel/blob');
    
    // Token is configured and module is available
    // Actual connectivity will be tested during real operations
    return { accessible: true };
  } catch (error) {
    return {
      accessible: false,
      error: (error as Error).message || 'Unknown Blob error',
    };
  }
}

/**
 * Check health of all database connections
 * 
 * Returns detailed status for each service and overall health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const redisStatus = await checkRedisHealth();
  const blobStatus = await checkBlobHealth();

  const redis = {
    enabled: !!process.env.REDIS_URL,
    connected: redisStatus.connected,
    error: redisStatus.error,
  };

  const blob = {
    enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
    accessible: blobStatus.accessible,
    error: blobStatus.error,
  };

  // Determine overall health
  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (!redis.enabled && !blob.enabled) {
    overall = 'unhealthy'; // No storage available
  } else if (redis.enabled && !redis.connected) {
    overall = 'degraded'; // Redis is critical for analysis
  } else if (blob.enabled && !blob.accessible) {
    overall = 'degraded'; // Blob needed for large files
  }

  const status: DatabaseHealthStatus = {
    redis,
    blob,
    overall,
  };

  // Log health status
  logInfo('database_health_check', {
    redisEnabled: redis.enabled,
    redisConnected: redis.connected,
    redisError: redis.error,
    blobEnabled: blob.enabled,
    blobAccessible: blob.accessible,
    blobError: blob.error,
    overall,
  });

  return status;
}

/**
 * Check if database connections are ready for file upload
 * 
 * For file uploads, we need Blob to be accessible.
 * Redis is optional but recommended for progress tracking.
 */
export async function checkUploadReadiness(): Promise<{
  ready: boolean;
  status: DatabaseHealthStatus;
  errors: string[];
}> {
  const status = await checkDatabaseHealth();
  const errors: string[] = [];

  // Blob is required for large file uploads
  if (!status.blob.enabled) {
    errors.push('Vercel Blob storage is not configured (BLOB_READ_WRITE_TOKEN missing)');
  } else if (!status.blob.accessible) {
    errors.push(`Vercel Blob storage is not accessible: ${status.blob.error}`);
  }

  // Redis is recommended but not strictly required for uploads
  if (status.redis.enabled && !status.redis.connected) {
    errors.push(`Redis is configured but not connected: ${status.redis.error}`);
  }

  const ready = errors.length === 0;

  if (!ready) {
    logError('upload_readiness_check_failed', {
      errors,
      status,
    });
  } else {
    logInfo('upload_readiness_check_passed', {
      status,
    });
  }

  return {
    ready,
    status,
    errors,
  };
}

