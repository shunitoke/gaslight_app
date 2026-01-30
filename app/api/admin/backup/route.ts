import { NextResponse } from 'next/server';

import { triggerManualBackup } from '../../../lib/scheduledBackup';
import { isKvAvailable } from '../../../lib/kv';

export const runtime = 'nodejs';

/**
 * API endpoint to trigger manual backup of protected counters
 * Useful for admin interface or emergency backup
 */
export async function POST() {
  if (!isKvAvailable()) {
    return NextResponse.json({
      success: false,
      message: 'Redis/KV not available - cannot perform backup'
    }, { status: 503 });
  }

  try {
    const result = await triggerManualBackup();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Manual backup failed: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Get backup status
 */
export async function GET() {
  if (!isKvAvailable()) {
    return NextResponse.json({
      status: 'unavailable',
      message: 'Redis/KV not available'
    }, { status: 503 });
  }

  try {
    const { backupHealthCheck } = await import('../../../lib/scheduledBackup');
    const health = await backupHealthCheck();
    
    return NextResponse.json({
      status: health.healthy ? 'healthy' : 'unhealthy',
      lastBackup: health.lastBackup,
      issues: health.issues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: `Failed to get backup status: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
