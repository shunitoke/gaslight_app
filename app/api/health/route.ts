import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '../../../lib/db-health';

export const runtime = 'nodejs';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  
  const statusCode = dbHealth.overall === 'healthy' ? 200 : 
                     dbHealth.overall === 'degraded' ? 200 : 503;

  return NextResponse.json(
    {
      status: dbHealth.overall === 'healthy' ? 'ok' : dbHealth.overall,
      timestamp: new Date().toISOString(),
      databases: {
        redis: {
          enabled: dbHealth.redis.enabled,
          connected: dbHealth.redis.connected,
          ...(dbHealth.redis.error && { error: dbHealth.redis.error }),
        },
        blob: {
          enabled: dbHealth.blob.enabled,
          accessible: dbHealth.blob.accessible,
          ...(dbHealth.blob.error && { error: dbHealth.blob.error }),
        },
      },
    },
    { status: statusCode }
  );
}

