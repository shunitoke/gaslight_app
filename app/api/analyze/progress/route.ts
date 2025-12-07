/**
 * Analysis progress endpoint (JSON polling).
 *
 * The frontend polls this route periodically to get real-time
 * progress updates during long-running analysis operations.
 */

import { NextResponse } from 'next/server';
import { logInfo, logWarn } from '../../../../lib/telemetry';
import {
  isKvAvailable,
  getProgressFromKv,
  setProgressInKv,
  deleteProgressFromKv
} from '../../../../lib/kv';
import { progressStore } from '../../../../lib/progress';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * Get progress from store (for internal use)
 * Uses KV if available, otherwise falls back to in-memory store
 */
export async function getProgressStore(conversationId: string) {
  if (isKvAvailable()) {
    const progress = await getProgressFromKv(conversationId);
    if (progress) {
      return progress;
    }
  }
  return progressStore.get(conversationId);
}

/**
 * Direct function to update progress store (for internal use)
 * Uses KV if available, otherwise falls back to in-memory store
 */
export async function updateProgressStore(
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
  const existing = isKvAvailable()
    ? await getProgressFromKv(conversationId)
    : progressStore.get(conversationId);
    
  const newProgress = {
    conversationId,
    status: updates.status || existing?.status || 'analyzing',
    progress: updates.progress !== undefined ? Math.max(0, Math.min(100, updates.progress)) : (existing?.progress || 0),
    currentChunk: updates.currentChunk !== undefined ? updates.currentChunk : existing?.currentChunk,
    totalChunks: updates.totalChunks !== undefined ? updates.totalChunks : existing?.totalChunks,
    message: updates.message !== undefined ? updates.message : existing?.message,
    error: updates.error !== undefined ? updates.error : existing?.error,
    result: updates.result || existing?.result
  };
  
  // Try KV first, fallback to in-memory
  if (isKvAvailable()) {
    const ok = await setProgressInKv(conversationId, newProgress);
    // Always mirror to in-memory to avoid "result lost" if KV write fails
    if (!ok) {
      logWarn('updateProgressStore_kv_failed_fallback_memory', { conversationId });
      progressStore.set(conversationId, newProgress);
    } else {
      progressStore.set(conversationId, newProgress);
    }
  } else {
    progressStore.set(conversationId, newProgress);
  }
  
  // Log for debugging
  if (updates.result) {
    logInfo('updateProgressStore_called', {
      conversationId,
      hasResult: !!newProgress.result,
      hasAnalysis: !!newProgress.result?.analysis,
      sectionsCount: newProgress.result?.analysis?.sections?.length || 0,
      usingKv: isKvAvailable()
    });
  }
}

/**
 * Delete progress state (KV + in-memory) and cleanup any blob
 */
export async function deleteProgressStore(conversationId: string) {
  if (isKvAvailable()) {
    await deleteProgressFromKv(conversationId);
  }
  progressStore.delete(conversationId);
}

/**
 * GET endpoint for progress polling (simpler than SSE)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const progress = await getProgressStore(conversationId);
    
    if (!progress) {
      return NextResponse.json({
        conversationId,
        status: 'starting',
        progress: 0
      });
    }

    // Always log progress state for debugging
    const resultSize = progress.result ? JSON.stringify(progress.result).length : 0;
    logInfo('progress_get', {
      conversationId,
      status: progress.status,
      progress: progress.progress,
      hasResult: !!progress.result,
      hasAnalysis: !!progress.result?.analysis,
      sectionsCount: progress.result?.analysis?.sections?.length || 0,
      resultKeys: progress.result ? Object.keys(progress.result) : [],
      resultSizeBytes: resultSize,
      usingKv: isKvAvailable()
    });

    // Return progress with result included
    const response = NextResponse.json(progress);
    // Ensure result is included in response
    if (progress.result) {
      logInfo('progress_get_returning_result', {
        conversationId,
        resultSizeBytes: resultSize,
        hasAnalysis: !!progress.result.analysis,
        sectionsCount: progress.result.analysis?.sections?.length || 0
      });
    }
    return response;
  } catch (error) {
    logWarn('progress_get_error', {
      error: (error as Error).message,
      stack: (error as Error).stack?.substring(0, 200)
    });
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to update progress (called by analysis service)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, status, progress, currentChunk, totalChunks, message, error, result } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const existing = await getProgressStore(conversationId);
    const finalResult = result || existing?.result;
    
    if (result) {
      logInfo('progress_post_with_result', {
        conversationId,
        status,
        hasAnalysis: !!result.analysis,
        sectionsCount: result.analysis?.sections?.length || 0,
        usingKv: isKvAvailable()
      });
    }
    
    await updateProgressStore(conversationId, {
      status: status || 'analyzing',
      progress: Math.max(0, Math.min(100, progress || 0)),
      currentChunk,
      totalChunks,
      message,
      error,
      // Preserve existing result or set new one
      result: finalResult
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}


