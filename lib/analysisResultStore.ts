import { getRedisClient, isKvAvailable } from './kv';
import { logWarn } from './telemetry';

const ANALYSIS_RESULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const inMemoryStore = new Map<string, any>();

const buildKey = (analysisId: string) => `analysisResult:${analysisId}`;

export async function setAnalysisResult(analysisId: string, result: any) {
  if (!analysisId || !result) return;

  if (isKvAvailable()) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.set(buildKey(analysisId), JSON.stringify(result), {
          EX: ANALYSIS_RESULT_TTL_SECONDS
        });
      }
    } catch (error) {
      logWarn('analysis_result_store_set_failed', {
        analysisId,
        error: (error as Error).message
      });
    }
  }

  inMemoryStore.set(analysisId, result);
}

export async function getAnalysisResult(analysisId: string) {
  if (!analysisId) return null;

  if (isKvAvailable()) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        const raw = await redis.get(buildKey(analysisId));
        if (raw) {
          try {
            return typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            return raw as any;
          }
        }
      }
    } catch (error) {
      logWarn('analysis_result_store_get_failed', {
        analysisId,
        error: (error as Error).message
      });
    }
  }

  return inMemoryStore.get(analysisId) || null;
}

