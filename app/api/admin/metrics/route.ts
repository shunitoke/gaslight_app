/**
 * Admin metrics endpoint - requires ADMIN_SECRET
 * Returns comprehensive metrics about analysis performance
 */

import { NextResponse } from 'next/server';
import { validateAdminSecret, extractAdminSecret, isAdminEnabled } from '../../../../lib/admin-auth';
import { getAggregateMetrics, getCacheMetrics } from '../../../../lib/metrics';
import { logError, logInfo } from '../../../../lib/telemetry';
import { getRedisClient, isKvAvailable } from '../../../../lib/kv';
import { checkDatabaseHealth } from '../../../../lib/db-health';
import { getConfig } from '../../../../lib/config';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    // Check if admin is enabled
    if (!isAdminEnabled()) {
      return NextResponse.json(
        { error: 'Admin dashboard is not configured. Set ADMIN_SECRET environment variable.' },
        { status: 503 }
      );
    }

    // Validate admin secret
    const secret = extractAdminSecret(request);
    if (!validateAdminSecret(secret)) {
      logError('admin_unauthorized_access', {
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logInfo('admin_metrics_request', {});

    // Get metrics and health status
    const [aggregateMetrics, cacheMetrics, redisStatus, dbHealth, config] = await Promise.all([
      getAggregateMetrics(),
      getCacheMetrics(),
      getRedisStatus(),
      checkDatabaseHealth(),
      getConfigSafe()
    ]);

    const response = {
      timestamp: new Date().toISOString(),
      aggregate: aggregateMetrics,
      cache: cacheMetrics,
      redis: redisStatus,
      blob: {
        enabled: dbHealth.blob.enabled,
        accessible: dbHealth.blob.accessible,
        error: dbHealth.blob.error
      },
      system: {
        adminEnabled: true,
        redisAvailable: isKvAvailable(),
        overallHealth: dbHealth.overall
      },
      configuration: config
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('admin_metrics_error', {
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

async function getRedisStatus(): Promise<{
  available: boolean;
  connected: boolean;
  error?: string;
}> {
  try {
    if (!isKvAvailable()) {
      return { available: false, connected: false };
    }

    const redis = await getRedisClient();
    if (!redis) {
      return { available: true, connected: false, error: 'Redis client not available' };
    }

    // Try to ping Redis
    await redis.ping();
    return { available: true, connected: true };
  } catch (error) {
    return {
      available: true,
      connected: false,
      error: (error as Error).message
    };
  }
}

/**
 * Get configuration safely (don't fail if config is invalid)
 */
function getConfigSafe(): {
  textModel: string;
  visionModel: string;
  textModelFallbacks: string[];
  maxUploadSizeMb: number;
  analysisTimeoutMs: number;
  openrouterConfigured: boolean;
} {
  try {
    const config = getConfig();
    return {
      textModel: config.textModel,
      visionModel: config.visionModel,
      textModelFallbacks: config.textModelFallbacks,
      maxUploadSizeMb: config.maxUploadSizeMb,
      analysisTimeoutMs: config.analysisTimeoutMs,
      openrouterConfigured: !!config.openrouterApiKey
    };
  } catch (error) {
    return {
      textModel: 'unknown',
      visionModel: 'unknown',
      textModelFallbacks: [],
      maxUploadSizeMb: 0,
      analysisTimeoutMs: 0,
      openrouterConfigured: false
    };
  }
}

