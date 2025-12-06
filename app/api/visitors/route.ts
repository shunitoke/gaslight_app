import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getRedisClient, isKvAvailable } from '../../../lib/kv';
import { logWarn } from '../../../lib/telemetry';

export const runtime = 'nodejs';

const VISITOR_COOKIE = 'visitor_id';
const VISITOR_SET_KEY = 'visitors:unique';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = cookies();
  const existingId = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = existingId || randomUUID();

  let totalVisitors: number | null = null;
  let counted = false;

  if (isKvAvailable()) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        const added =
          typeof redis.sAdd === 'function'
            ? await redis.sAdd(VISITOR_SET_KEY, visitorId)
            : await redis.sadd?.(VISITOR_SET_KEY, visitorId);
        counted = added === 1;

        const total =
          typeof redis.sCard === 'function'
            ? await redis.sCard(VISITOR_SET_KEY)
            : await redis.scard?.(VISITOR_SET_KEY);

        if (typeof total === 'number') {
          totalVisitors = total;
        } else if (typeof total === 'string') {
          const parsed = parseInt(total, 10);
          totalVisitors = Number.isNaN(parsed) ? null : parsed;
        }
      }
    } catch (error) {
      logWarn('visitor_counter_error', { error: (error as Error).message });
    }
  }

  const response = NextResponse.json({
    total: totalVisitors ?? 0,
    counted,
    redisEnabled: isKvAvailable()
  });

  if (!existingId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
    });
  }

  response.headers.set('Cache-Control', 'no-store');

  return response;
}

