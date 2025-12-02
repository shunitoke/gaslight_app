/**
 * Analysis progress endpoint (JSON polling).
 *
 * The frontend polls this route periodically to get real-time
 * progress updates during long-running analysis operations.
 */

import { NextResponse } from 'next/server';

// In-memory store for analysis progress (ephemeral, per-session)
const progressStore = new Map<string, {
  conversationId: string;
  status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'completed' | 'error';
  progress: number; // 0-100
  currentChunk?: number;
  totalChunks?: number;
  message?: string;
  error?: string;
}>();

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * GET endpoint for progress polling (simpler than SSE)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
  }

  const progress = progressStore.get(conversationId);
  
  if (!progress) {
    return NextResponse.json({
      conversationId,
      status: 'starting',
      progress: 0
    });
  }

  return NextResponse.json(progress);
}

/**
 * POST endpoint to update progress (called by analysis service)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, status, progress, currentChunk, totalChunks, message, error } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    progressStore.set(conversationId, {
      conversationId,
      status: status || 'analyzing',
      progress: Math.max(0, Math.min(100, progress || 0)),
      currentChunk,
      totalChunks,
      message,
      error
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}


