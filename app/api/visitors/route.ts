import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { getRedisClient, isKvAvailable } from '../../../lib/kv';
import { getProtectedCounter, incrementProtectedCounter } from '../../../lib/counterProtection';
import { logWarn, logInfo } from '../../../lib/telemetry';

export const runtime = 'nodejs';

const VISITOR_COOKIE = 'visitor_id';
const VISITOR_SET_KEY = 'visitors:unique';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: Request) {
  // Get visitor ID from cookie header
  const cookieHeader = request.headers.get('cookie');
  let existingId: string | undefined;
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    existingId = cookies[VISITOR_COOKIE];
  }
  
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

        // Get protected visitor count first
        const protectedCount = await getProtectedCounter('visitors');
        
        // Get current set size as fallback
        const total =
          typeof redis.sCard === 'function'
            ? await redis.sCard(VISITOR_SET_KEY)
            : await redis.scard?.(VISITOR_SET_KEY);

        let currentSetCount = 0;
        if (typeof total === 'number') {
          currentSetCount = total;
        } else if (typeof total === 'string') {
          const parsed = parseInt(total, 10);
          currentSetCount = Number.isNaN(parsed) ? 0 : parsed;
        }

        // Use the higher of protected count or current set count
        totalVisitors = Math.max(protectedCount, currentSetCount);
        
        // If this is a new visitor and protected count is lower, update it
        if (counted && totalVisitors > protectedCount) {
          await incrementProtectedCounter('visitors', 1);
          logInfo('visitor_protected_counter_incremented', {
            newTotal: totalVisitors,
            previousProtected: protectedCount
          });
        }
        
        // If set count is higher than protected, sync protected up
        if (currentSetCount > protectedCount) {
          await incrementProtectedCounter('visitors', currentSetCount - protectedCount);
          logInfo('visitor_protected_counter_synced', {
            protectedCount: currentSetCount,
            previousProtected: protectedCount
          });
        }
      }
    } catch (error) {
      logWarn('visitor_counter_error', { error: (error as Error).message });
      
      // Fallback to protected counter if Redis operations fail
      totalVisitors = await getProtectedCounter('visitors');
    }
  } else {
    // Fallback to protected counter if Redis is not available
    totalVisitors = await getProtectedCounter('visitors');
  }

  const response = NextResponse.json({
    total: totalVisitors ?? 0,
    counted,
    redisEnabled: isKvAvailable()
  });

  if (!existingId) {
    response.headers.set('Set-Cookie', 
      `${VISITOR_COOKIE}=${visitorId}; HttpOnly; SameSite=lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=${ONE_YEAR_SECONDS}; Path=/`
    );
  }

  response.headers.set('Cache-Control', 'no-store');

  return response;
}

