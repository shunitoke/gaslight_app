import { NextResponse } from 'next/server';

import { getCounterProtectionStatus } from '../../../../lib/counterProtection';
import { isKvAvailable } from '../../../../lib/kv';

export const runtime = 'nodejs';

/**
 * API endpoint to monitor counter protection status
 * Useful for health checks and debugging
 */
export async function GET() {
  if (!isKvAvailable()) {
    return NextResponse.json({
      status: 'unavailable',
      message: 'Redis/KV not available',
      data: null
    }, { status: 503 });
  }

  try {
    const status = await getCounterProtectionStatus();
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Counter protection system operational',
      data: {
        analyses: {
          main: status.analyses.main,
          backups: status.analyses.backups,
          backupCount: status.analyses.backups.length,
          maxBackup: status.analyses.maxBackup,
          isProtected: status.analyses.main > 0 || status.analyses.maxBackup > 0,
          needsRecovery: status.analyses.main === 0 && status.analyses.maxBackup > 0
        },
        visitors: {
          main: status.visitors.main,
          backups: status.visitors.backups,
          backupCount: status.visitors.backups.length,
          maxBackup: status.visitors.maxBackup,
          isProtected: status.visitors.main > 0 || status.visitors.maxBackup > 0,
          needsRecovery: status.visitors.main === 0 && status.visitors.maxBackup > 0
        },
        summary: {
          totalProtected: (status.analyses.main > 0 ? 1 : 0) + (status.visitors.main > 0 ? 1 : 0),
          totalBackups: status.analyses.backups.length + status.visitors.backups.length,
          healthy: (status.analyses.main > 0 || status.analyses.maxBackup > 0) && 
                  (status.visitors.main > 0 || status.visitors.maxBackup > 0)
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: `Failed to get protection status: ${(error as Error).message}`,
      data: null
    }, { status: 500 });
  }
}
