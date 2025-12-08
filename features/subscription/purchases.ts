import { getRedisClient, isKvAvailable } from '@/lib/kv';
import { logError, logWarn } from '@/lib/telemetry';

export type PurchaseRecord = {
  transactionId: string;
  tokenIssuedAt: number; // ms epoch
  expiresAt?: number; // ms epoch
  priceId?: string | null;
  amount?: number | null;
  currency?: string | null;
};

export type ReportDeliveryRecord = {
  transactionId: string;
  reportId: string;
  deliveredAt: number; // ms epoch
};

const KEY_PREFIX = 'purchase:';
const INDEX_KEY = 'purchase:index';
const DEFAULT_TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days
const REPORT_SET_PREFIX = 'purchase_reports:';
const REPORT_COUNT_PREFIX = 'purchase_reports_count:';
const REPORT_LAST_PREFIX = 'purchase_reports_last:';
const REPORT_KEY_PREFIX = 'report:';

export async function recordPurchase(record: PurchaseRecord): Promise<void> {
  if (!isKvAvailable()) {
    logWarn('purchase_record_kv_unavailable', { transactionId: record.transactionId });
    return;
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return;
    const key = `${KEY_PREFIX}${record.transactionId}`;
    const payload = JSON.stringify(record);

    await redis.setEx(key, DEFAULT_TTL_SECONDS, payload);
    await redis.zAdd(INDEX_KEY, [{ score: record.tokenIssuedAt, value: record.transactionId }]);
  } catch (error) {
    logError('purchase_record_failed', {
      transactionId: record.transactionId,
      error: (error as Error).message
    });
  }
}

export async function listRecentPurchases(limit = 200): Promise<PurchaseRecord[]> {
  if (!isKvAvailable()) {
    return [];
  }
  try {
    const redis = await getRedisClient();
    if (!redis) return [];
    const ids = await redis.zRange(INDEX_KEY, -limit, -1, { rev: true });
    if (!ids || ids.length === 0) return [];
    const keys = ids.map((id: string) => `${KEY_PREFIX}${id}`);
    const rows = await redis.mGet(keys);
    const parsed: PurchaseRecord[] = [];
    rows.forEach((row: string | null) => {
      if (!row) return;
      try {
        parsed.push(JSON.parse(row) as PurchaseRecord);
      } catch {
        // ignore parse errors
      }
    });
    return parsed.sort((a, b) => (b.tokenIssuedAt || 0) - (a.tokenIssuedAt || 0));
  } catch (error) {
    logError('purchase_list_failed', { error: (error as Error).message });
    return [];
  }
}

/**
 * Record that a premium report was delivered for a transaction.
 */
export async function recordReportDelivery(record: ReportDeliveryRecord): Promise<void> {
  if (!isKvAvailable()) {
    logWarn('report_delivery_kv_unavailable', { transactionId: record.transactionId });
    return;
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const reportSetKey = `${REPORT_SET_PREFIX}${record.transactionId}`;
    const reportCountKey = `${REPORT_COUNT_PREFIX}${record.transactionId}`;
    const reportLastKey = `${REPORT_LAST_PREFIX}${record.transactionId}`;
    const reportKey = `${REPORT_KEY_PREFIX}${record.reportId}`;

    // Use a multi pipeline to keep latency low in serverless
    await redis
      .multi()
      .zAdd(reportSetKey, [{ score: record.deliveredAt, value: record.reportId }])
      .incr(reportCountKey)
      .set(reportLastKey, record.deliveredAt)
      .setEx(reportKey, DEFAULT_TTL_SECONDS, JSON.stringify(record))
      .expire(reportSetKey, DEFAULT_TTL_SECONDS)
      .expire(reportCountKey, DEFAULT_TTL_SECONDS)
      .expire(reportLastKey, DEFAULT_TTL_SECONDS)
      .exec();
  } catch (error) {
    logError('report_delivery_record_failed', {
      transactionId: record.transactionId,
      reportId: record.reportId,
      error: (error as Error).message
    });
  }
}

export type DeliveryStats = {
  deliveredCount: number;
  lastDeliveredAt: number | null;
};

/**
 * Fetch delivery stats (count + last delivered timestamp) for a set of transactions.
 */
export async function getDeliveryStatsForPurchases(
  transactionIds: string[]
): Promise<Record<string, DeliveryStats>> {
  if (!isKvAvailable() || transactionIds.length === 0) {
    return {};
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return {};

    const pipeline = redis.multi();
    transactionIds.forEach((id) => {
      pipeline.get(`${REPORT_COUNT_PREFIX}${id}`);
      pipeline.get(`${REPORT_LAST_PREFIX}${id}`);
    });
    const results = await pipeline.exec();
    if (!results) return {};

    const stats: Record<string, DeliveryStats> = {};
    for (let i = 0; i < transactionIds.length; i++) {
      const countRes = results[i * 2] as string | number | null;
      const lastRes = results[i * 2 + 1] as string | number | null;
      const deliveredCount = Number(countRes ?? 0);
      const lastDeliveredAtRaw = lastRes !== null && lastRes !== undefined ? Number(lastRes) : null;
      stats[transactionIds[i]] = {
        deliveredCount: Number.isNaN(deliveredCount) ? 0 : deliveredCount,
        lastDeliveredAt: lastDeliveredAtRaw && !Number.isNaN(lastDeliveredAtRaw) ? lastDeliveredAtRaw : null
      };
    }
    return stats;
  } catch (error) {
    logError('report_delivery_stats_failed', { error: (error as Error).message });
    return {};
  }
}

/**
 * List recent report deliveries for a transaction (most recent first).
 */
export async function listRecentDeliveriesForPurchase(
  transactionId: string,
  limit = 20
): Promise<ReportDeliveryRecord[]> {
  if (!isKvAvailable()) return [];
  try {
    const redis = await getRedisClient();
    if (!redis) return [];
    const rows = await redis.zRangeWithScores(
      `${REPORT_SET_PREFIX}${transactionId}`,
      -limit,
      -1,
      { rev: true }
    );
    return rows.map((row) => ({
      transactionId,
      reportId: row.value as string,
      deliveredAt: row.score as number
    }));
  } catch (error) {
    logError('report_delivery_list_failed', {
      transactionId,
      error: (error as Error).message
    });
    return [];
  }
}




