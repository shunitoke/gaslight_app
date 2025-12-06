import { getRedisClient, isKvAvailable } from './kv';

// Activity tracking for "how many users are doing X right now"
// Falls back to an in-memory map when Redis is unavailable.

const ACTIVITY_TTL_SECONDS = 10 * 60; // 10 minutes
const ACTIVITY_TTL_MS = ACTIVITY_TTL_SECONDS * 1000;

const memoryAnalysis = new Map<string, number>();
const memoryImport = new Map<string, number>();

function cleanup(map: Map<string, number>) {
  const now = Date.now();
  for (const [key, timestamp] of map.entries()) {
    if (now - timestamp > ACTIVITY_TTL_MS) {
      map.delete(key);
    }
  }
}

async function countByPrefix(prefix: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (!redis) return 0;

    let count = 0;
    for await (const key of redis.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      if (key) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

export async function trackAnalysisStart(conversationId: string) {
  if (!conversationId) return;

  if (isKvAvailable()) {
    const redis = await getRedisClient();
    if (redis) {
      await redis.setEx(`activity:analysis:${conversationId}`, ACTIVITY_TTL_SECONDS, '1');
      return;
    }
  }

  cleanup(memoryAnalysis);
  memoryAnalysis.set(conversationId, Date.now());
}

export async function trackAnalysisEnd(conversationId: string) {
  if (!conversationId) return;

  if (isKvAvailable()) {
    const redis = await getRedisClient();
    if (redis) {
      await redis.del(`activity:analysis:${conversationId}`);
      return;
    }
  }

  memoryAnalysis.delete(conversationId);
}

export async function countActiveAnalyses(): Promise<number> {
  if (isKvAvailable()) {
    return countByPrefix('activity:analysis:');
  }

  cleanup(memoryAnalysis);
  return memoryAnalysis.size;
}

export async function startImportSession(): Promise<string> {
  const sessionId = `imp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (isKvAvailable()) {
    const redis = await getRedisClient();
    if (redis) {
      await redis.setEx(`activity:import:${sessionId}`, ACTIVITY_TTL_SECONDS, '1');
      return sessionId;
    }
  }

  cleanup(memoryImport);
  memoryImport.set(sessionId, Date.now());
  return sessionId;
}

export async function endImportSession(sessionId: string) {
  if (!sessionId) return;

  if (isKvAvailable()) {
    const redis = await getRedisClient();
    if (redis) {
      await redis.del(`activity:import:${sessionId}`);
      return;
    }
  }

  memoryImport.delete(sessionId);
}

export async function countActiveImports(): Promise<number> {
  if (isKvAvailable()) {
    return countByPrefix('activity:import:');
  }

  cleanup(memoryImport);
  return memoryImport.size;
}


