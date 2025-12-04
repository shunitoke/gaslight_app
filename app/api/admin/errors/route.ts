/**
 * Admin endpoint to view recent error logs
 * Returns recent errors from OpenRouter and analysis
 */

import { NextResponse } from 'next/server';
import { validateAdminSecret, extractAdminSecret, isAdminEnabled } from '../../../../lib/admin-auth';
import { logInfo, logError, getRecentErrors, clearErrorLogs, getErrorLogSize } from '../../../../lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    if (!isAdminEnabled()) {
      return NextResponse.json(
        { error: 'Admin dashboard is not configured' },
        { status: 503 }
      );
    }

    const secret = extractAdminSecret(request);
    if (!validateAdminSecret(secret)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const filter = url.searchParams.get('filter') || ''; // e.g., "403", "openrouter", "analysis"
    const test = url.searchParams.get('test') === 'true'; // Create test error
    const clear = url.searchParams.get('clear') === 'true'; // Clear logs

    if (clear) {
      await clearErrorLogs();
      logInfo('admin_errors_cleared', {});
      return NextResponse.json({
        message: 'Error logs cleared',
        timestamp: new Date().toISOString()
      });
    }

    if (test) {
      // Create a test error to verify logging works
      logError('test_error_403', {
        message: 'Test 403 error from OpenRouter',
        status: 403,
        body: 'Forbidden: Test error for debugging',
        model: 'test-model',
        timestamp: new Date().toISOString()
      });
    }

    logInfo('admin_errors_request', { limit, filter, test });

    // Get recent errors (from Redis or in-memory)
    const errors = await getRecentErrors(limit * 2, filter); // Get more to allow filtering
    const logSize = getErrorLogSize();

    return NextResponse.json({
      errors: errors.slice(0, limit),
      total: errors.length,
      filter: filter || 'all',
      testErrorCreated: test,
      logSizeBytes: logSize,
      logSizeMB: (logSize / (1024 * 1024)).toFixed(2),
      maxSizeMB: 1,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('admin_errors_error', {
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}

