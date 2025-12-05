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
    const openrouterStatus = await getOpenRouterStatus(
      config.openrouterBaseUrl,
      config.openrouterConfigured
    );

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
      configuration: {
        ...config,
        openrouterStatus
      }
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
  openrouterBaseUrl: string;
} {
  try {
    const config = getConfig();
    return {
      textModel: config.textModel,
      visionModel: config.visionModel,
      textModelFallbacks: config.textModelFallbacks,
      maxUploadSizeMb: config.maxUploadSizeMb,
      analysisTimeoutMs: config.analysisTimeoutMs,
      openrouterConfigured: !!config.openrouterApiKey,
      openrouterBaseUrl: config.openrouterBaseUrl
    };
  } catch (error) {
    return {
      textModel: 'unknown',
      visionModel: 'unknown',
      textModelFallbacks: [],
      maxUploadSizeMb: 0,
      analysisTimeoutMs: 0,
      openrouterConfigured: false,
      openrouterBaseUrl: 'unknown'
    };
  }
}

async function getOpenRouterStatus(baseUrl: string, hasKey: boolean) {
  if (!hasKey) {
    return {
      configured: false,
      reachable: false,
      error: 'OPENROUTER_API_KEY is missing'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      return {
        configured: true,
        reachable: false,
        error: `Status ${res.status}: ${text.substring(0, 160)}`
      };
    }

    return {
      configured: true,
      reachable: true
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      error: (error as Error).message
    };
  }
}

