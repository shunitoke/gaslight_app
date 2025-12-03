/**
 * Progress update utility for analysis service
 * Provides a clean interface for updating analysis progress without
 * directly importing from app/api routes
 */

import { logWarn, logInfo } from './telemetry';
import {
  isKvAvailable,
  getProgressFromKv,
  setProgressInKv
} from './kv';

// In-memory store for analysis progress (fallback when KV is not available)
// Exported for use in progress/route.ts to ensure consistency
export const progressStore = new Map<string, {
  conversationId: string;
  status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
  progress: number; // 0-100
  currentChunk?: number;
  totalChunks?: number;
  message?: string;
  error?: string;
  result?: {
    conversation: any;
    analysis: any;
    activityByDay: Array<{ date: string; messageCount: number }>;
  };
}>();

/**
 * Update analysis progress
 * Uses KV if available, otherwise falls back to in-memory store
 */
export async function updateProgress(
  conversationId: string,
  updates: {
    status?: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
    result?: {
      conversation: any;
      analysis: any;
      activityByDay: Array<{ date: string; messageCount: number }>;
    };
  }
): Promise<void> {
  try {
    const existing = isKvAvailable()
      ? await getProgressFromKv(conversationId)
      : progressStore.get(conversationId);
      
    const newProgress = {
      conversationId,
      status: updates.status || existing?.status || 'analyzing',
      progress: updates.progress !== undefined ? Math.max(0, Math.min(100, updates.progress)) : (existing?.progress || 0),
      currentChunk: updates.currentChunk !== undefined ? updates.currentChunk : (existing?.currentChunk || undefined),
      totalChunks: updates.totalChunks !== undefined ? updates.totalChunks : (existing?.totalChunks || undefined),
      message: updates.message || existing?.message,
      error: updates.error || existing?.error,
      result: updates.result || existing?.result,
    };

    if (isKvAvailable()) {
      await setProgressInKv(conversationId, newProgress);
      logInfo('progress_updated_kv', {
        conversationId,
        status: newProgress.status,
        progress: newProgress.progress
      });
    } else {
      progressStore.set(conversationId, newProgress);
      logInfo('progress_updated_memory', {
        conversationId,
        status: newProgress.status,
        progress: newProgress.progress
      });
    }
  } catch (error) {
    // Log but don't throw - progress updates are non-critical
    logWarn('progress_update_failed', {
      conversationId,
      error: (error as Error).message
    });
  }
}

