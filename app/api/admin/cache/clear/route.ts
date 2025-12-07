import { NextResponse } from 'next/server';
import {
  extractAdminSecret,
  isAdminEnabled,
  validateAdminSecret
} from '../../../../../lib/admin-auth';
import { getPromptVersion, invalidateCacheByVersion } from '../../../../../lib/cache';
import { getRedisClient, isKvAvailable } from '../../../../../lib/kv';
import { resetCacheMetrics } from '../../../../../lib/metrics';
import { logError, logInfo } from '../../../../../lib/telemetry';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (!isAdminEnabled()) {
      return NextResponse.json(
        { error: 'Admin dashboard is not configured' },
        { status: 503 }
      );
    }

    const secret = extractAdminSecret(request);
    if (!validateAdminSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = await getRedisClient();
    if (!redis || !isKvAvailable()) {
      return NextResponse.json(
        { error: 'Redis is not available' },
        { status: 503 }
      );
    }

    const promptVersion = getPromptVersion();
    const deletedCacheKeys = await invalidateCacheByVersion(promptVersion);
    const clearedMetricKeys = await resetCacheMetrics();

    logInfo('admin_cache_cleared', {
      promptVersion,
      deletedCacheKeys,
      clearedMetricKeys
    });

    return NextResponse.json({
      message: 'Cache cleared',
      promptVersion,
      deletedCacheKeys,
      clearedMetricKeys,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('admin_cache_clear_error', {
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}









