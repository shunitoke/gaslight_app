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

const KEY_PREFIX = 'purchase:';
const INDEX_KEY = 'purchase:index';
const DEFAULT_TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days

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




