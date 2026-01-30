/**
 * Counter Protection System
 * 
 * Protects critical counters (analyses and visitors) from being reset
 * due to Redis issues, data corruption, or accidental deletion.
 * 
 * Strategy:
 * 1. Multiple redundant backups
 * 2. Periodic backup tasks
 * 3. Auto-recovery on reset
 * 4. Validation to prevent decreases
 * 5. Extended TTL for backup keys
 */

import { getRedisClient } from './kv';
import { logInfo, logWarn, logError } from './telemetry';

const BACKUP_PREFIX = 'backup:counters:';
const MAIN_KEYS = {
  analyses: 'metrics:avg:count',
  visitors: 'visitors:total'
} as const;

const BACKUP_KEYS = {
  analyses: {
    primary: `${BACKUP_PREFIX}analyses:primary`,
    secondary: `${BACKUP_PREFIX}analyses:secondary`,
    tertiary: `${BACKUP_PREFIX}analyses:tertiary`
  },
  visitors: {
    primary: `${BACKUP_PREFIX}visitors:primary`,
    secondary: `${BACKUP_PREFIX}visitors:secondary`,
    tertiary: `${BACKUP_PREFIX}visitors:tertiary`
  }
} as const;

const BACKUP_TTL = 90 * 24 * 60 * 60; // 90 days (extended for backups)
const MAIN_TTL = 30 * 24 * 60 * 60; // 30 days (normal)

/**
 * Get the highest value from multiple backup keys
 */
async function getHighestBackupValue(type: 'analyses' | 'visitors'): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) return 0;

  try {
    const keys = Object.values(BACKUP_KEYS[type]);
    const values = await Promise.all(keys.map(key => redis.get(key)));
    
    const numbers = values
      .filter(val => val !== null)
      .map(val => parseInt(val || '0', 10))
      .filter(num => !isNaN(num) && num > 0);

    return numbers.length > 0 ? Math.max(...numbers) : 0;
  } catch (error) {
    logError('counter_protection_backup_read_error', {
      type,
      error: (error as Error).message
    });
    return 0;
  }
}

/**
 * Update all backup keys with a new value
 */
async function updateAllBackups(type: 'analyses' | 'visitors', value: number): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const keys = Object.values(BACKUP_KEYS[type]);
    await Promise.all(
      keys.map(key => redis.setEx(key, BACKUP_TTL, value.toString()))
    );

    logInfo('counter_protection_backups_updated', {
      type,
      value,
      keysUpdated: keys.length
    });
  } catch (error) {
    logError('counter_protection_backup_write_error', {
      type,
      value,
      error: (error as Error).message
    });
  }
}

/**
 * Get protected counter value with auto-recovery
 */
export async function getProtectedCounter(type: 'analyses' | 'visitors'): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) return 0;

  try {
    const mainKey = MAIN_KEYS[type];
    const mainValue = await redis.get(mainKey);
    const mainCount = mainValue ? parseInt(mainValue, 10) : 0;

    // If main counter exists and is reasonable, return it
    if (mainCount > 0) {
      // Also update backups if main is newer/higher
      const backupMax = await getHighestBackupValue(type);
      if (mainCount > backupMax) {
        await updateAllBackups(type, mainCount);
      }
      return mainCount;
    }

    // Main counter is missing or zero - try to recover from backups
    logWarn('counter_protection_main_missing', {
      type,
      mainCount,
      mainKey
    });

    const backupMax = await getHighestBackupValue(type);
    if (backupMax > 0) {
      logInfo('counter_protection_recovery_from_backup', {
        type,
        recoveredValue: backupMax
      });

      // Restore main counter from backup
      await redis.setEx(mainKey, MAIN_TTL, backupMax.toString());
      await updateAllBackups(type, backupMax);
      return backupMax;
    }

    // No backups found - counter is truly zero
    logWarn('counter_protection_no_backups_found', { type });
    return 0;
  } catch (error) {
    logError('counter_protection_get_error', {
      type,
      error: (error as Error).message
    });
    return 0;
  }
}

/**
 * Increment protected counter with validation
 */
export async function incrementProtectedCounter(
  type: 'analyses' | 'visitors',
  increment: number = 1
): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) return 0;

  try {
    const mainKey = MAIN_KEYS[type];
    
    // Get current value with recovery
    const current = await getProtectedCounter(type);
    const newValue = current + increment;

    // Validate that we're not decreasing (should never happen with increment)
    if (newValue < current) {
      logError('counter_protection_decrease_detected', {
        type,
        current,
        attempted: newValue,
        increment
      });
      return current;
    }

    // Update main counter
    await redis.setEx(mainKey, MAIN_TTL, newValue.toString());

    // Update all backups
    await updateAllBackups(type, newValue);

    logInfo('counter_protection_incremented', {
      type,
      previousValue: current,
      newValue,
      increment
    });

    return newValue;
  } catch (error) {
    logError('counter_protection_increment_error', {
      type,
      increment,
      error: (error as Error).message
    });
    return 0;
  }
}

/**
 * Set protected counter value (for manual recovery)
 */
export async function setProtectedCounter(
  type: 'analyses' | 'visitors',
  value: number
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    if (value < 0) {
      logError('counter_protection_invalid_value', { type, value });
      return;
    }

    const mainKey = MAIN_KEYS[type];
    const current = await getProtectedCounter(type);

    // Only allow setting to higher values (protection against accidental decreases)
    if (value < current) {
      logWarn('counter_protection_set_to_lower_value_blocked', {
        type,
        current,
        attempted: value
      });
      return;
    }

    // Update main counter
    await redis.setEx(mainKey, MAIN_TTL, value.toString());

    // Update all backups
    await updateAllBackups(type, value);

    logInfo('counter_protection_set', {
      type,
      previousValue: current,
      newValue: value
    });
  } catch (error) {
    logError('counter_protection_set_error', {
      type,
      value,
      error: (error as Error).message
    });
  }
}

/**
 * Force backup all counters (called by scheduled task)
 */
export async function backupAllCounters(): Promise<void> {
  try {
    const analysesCount = await getProtectedCounter('analyses');
    const visitorsCount = await getProtectedCounter('visitors');

    await Promise.all([
      updateAllBackups('analyses', analysesCount),
      updateAllBackups('visitors', visitorsCount)
    ]);

    logInfo('counter_protection_scheduled_backup', {
      analyses: analysesCount,
      visitors: visitorsCount
    });
  } catch (error) {
    logError('counter_protection_scheduled_backup_error', {
      error: (error as Error).message
    });
  }
}

/**
 * Get protection status for monitoring
 */
export async function getCounterProtectionStatus(): Promise<{
  analyses: { main: number; backups: number[]; maxBackup: number };
  visitors: { main: number; backups: number[]; maxBackup: number };
}> {
  const redis = await getRedisClient();
  if (!redis) {
    return {
      analyses: { main: 0, backups: [], maxBackup: 0 },
      visitors: { main: 0, backups: [], maxBackup: 0 }
    };
  }

  try {
    const [analysesMain, visitorsMain] = await Promise.all([
      redis.get(MAIN_KEYS.analyses),
      redis.get(MAIN_KEYS.visitors)
    ]);

    const [analysesBackups, visitorsBackups] = await Promise.all([
      Promise.all(Object.values(BACKUP_KEYS.analyses).map(key => redis.get(key))),
      Promise.all(Object.values(BACKUP_KEYS.visitors).map(key => redis.get(key)))
    ]);

    const parseBackupArray = (backups: (string | null)[]) =>
      backups
        .filter(val => val !== null)
        .map(val => parseInt(val || '0', 10))
        .filter(num => !isNaN(num) && num > 0);

    const analysesBackupNumbers = parseBackupArray(analysesBackups);
    const visitorsBackupNumbers = parseBackupArray(visitorsBackups);

    return {
      analyses: {
        main: parseInt(analysesMain || '0', 10),
        backups: analysesBackupNumbers,
        maxBackup: analysesBackupNumbers.length > 0 ? Math.max(...analysesBackupNumbers) : 0
      },
      visitors: {
        main: parseInt(visitorsMain || '0', 10),
        backups: visitorsBackupNumbers,
        maxBackup: visitorsBackupNumbers.length > 0 ? Math.max(...visitorsBackupNumbers) : 0
      }
    };
  } catch (error) {
    logError('counter_protection_status_error', {
      error: (error as Error).message
    });
    return {
      analyses: { main: 0, backups: [], maxBackup: 0 },
      visitors: { main: 0, backups: [], maxBackup: 0 }
    };
  }
}
