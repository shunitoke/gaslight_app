/**
 * Admin endpoint to get detailed analysis metrics for a specific conversation
 */

import { NextResponse } from 'next/server';
import {
  validateAdminSecret,
  extractAdminSecret,
  extractAdminSessionToken,
  validateAdminSessionToken,
  isAdminEnabled
} from '@/lib/admin-auth';
import { getAnalysisMetrics } from '@/lib/metrics';
import { logError, logInfo } from '@/lib/telemetry';
import { getProgressFromKv } from '@/lib/kv';
import { progressStore } from '@/lib/progress';

export const runtime = 'nodejs';
export const maxDuration = 30;

type AnalysisRouteParams = { conversationId: string };
type AnalysisRouteContext =
  | { params: AnalysisRouteParams }
  | { params: Promise<AnalysisRouteParams> };

export async function GET(
  request: Request,
  { params }: AnalysisRouteContext
) {
  let conversationId: string | undefined;
  try {
    const resolvedParams = await Promise.resolve(params);
    conversationId = resolvedParams.conversationId;

    if (!isAdminEnabled()) {
      return NextResponse.json(
        { error: 'Admin dashboard is not configured' },
        { status: 503 }
      );
    }

    const secret = extractAdminSecret(request);
    const session = extractAdminSessionToken(request);
    const authorized = validateAdminSecret(secret) || validateAdminSessionToken(session);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logInfo('admin_analysis_request', { conversationId });

    // Get metrics and progress
    const [metrics, progress] = await Promise.all([
      getAnalysisMetrics(conversationId),
      getProgressFromKv(conversationId) || progressStore.get(conversationId)
    ]);

    return NextResponse.json({
      conversationId,
      metrics,
      progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('admin_analysis_error', {
      conversationId,
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Failed to fetch analysis data' },
      { status: 500 }
    );
  }
}

