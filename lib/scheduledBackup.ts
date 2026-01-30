/**
 * Scheduled Backup Tasks
 * 
 * Runs periodic backup tasks to protect critical counters
 * from being lost due to Redis issues or data corruption.
 */

import { backupAllCounters } from './counterProtection';
import { logInfo, logWarn, logError } from './telemetry';

/**
 * Run scheduled backup of all protected counters
 * This should be called by a cron job or scheduled task
 */
export async function runScheduledBackup(): Promise<void> {
  try {
    logInfo('scheduled_backup_started');
    
    await backupAllCounters();
    
    logInfo('scheduled_backup_completed');
  } catch (error) {
    logError('scheduled_backup_failed', {
      error: (error as Error).message
    });
  }
}

/**
 * API endpoint for manual backup trigger
 * Can be called via webhook or admin interface
 */
export async function triggerManualBackup(): Promise<{ success: boolean; message: string }> {
  try {
    await runScheduledBackup();
    return {
      success: true,
      message: 'Manual backup completed successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Manual backup failed: ${(error as Error).message}`
    };
  }
}

/**
 * Health check for backup system
 */
export async function backupHealthCheck(): Promise<{
  healthy: boolean;
  lastBackup?: string;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // This would be enhanced to check actual backup timestamps
    // For now, just verify the backup system is accessible
    
    await backupAllCounters();
    
    return {
      healthy: issues.length === 0,
      lastBackup: new Date().toISOString(),
      issues
    };
  } catch (error) {
    issues.push(`Backup system error: ${(error as Error).message}`);
    return {
      healthy: false,
      issues
    };
  }
}
