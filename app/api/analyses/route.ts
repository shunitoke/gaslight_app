import { NextResponse } from 'next/server';

import { getAggregateMetrics } from '../../../lib/metrics';
import { getProtectedCounter } from '../../../lib/counterProtection';
import { isKvAvailable } from '../../../lib/kv';

export const runtime = 'nodejs';

export async function GET() {
  const aggregate = isKvAvailable() ? await getAggregateMetrics() : null;

  // Use protected counter for analyses count
  const protectedAnalysesCount = await getProtectedCounter('analyses');
  const totalAnalyses = protectedAnalysesCount > 0 ? protectedAnalysesCount : (aggregate?.totalAnalyses ?? 0);

  const response = NextResponse.json({
    total: totalAnalyses,
    redisEnabled: isKvAvailable(),
  });

  response.headers.set('Cache-Control', 'no-store');

  return response;
}
























