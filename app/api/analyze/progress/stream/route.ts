/**
 * Analysis progress endpoint with Server-Sent Events (SSE) streaming.
 * 
 * Alternative to polling - provides real-time progress updates via SSE.
 * More efficient than polling as server pushes updates when available.
 */

import { NextResponse } from 'next/server';
import { logInfo, logWarn } from '../../../../../lib/telemetry';
import { getProgressFromKv } from '../../../../../lib/kv';
import { progressStore } from '../../../../../lib/progress';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * Stream progress updates via Server-Sent Events
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'conversationId is required' },
      { status: 400 }
    );
  }

  logInfo('progress_stream_started', { conversationId });

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastProgress = -1;
      let lastStatus = '';
      let isCompleted = false;

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', conversationId })}\n\n`)
      );

      // Poll progress and send updates via SSE
      const pollInterval = setInterval(async () => {
        try {
          // Get progress from KV or in-memory store
          const progress = await getProgressFromKv(conversationId) || 
                          progressStore.get(conversationId);

          if (!progress) {
            // No progress yet, send waiting message
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'waiting', 
                message: 'Waiting for analysis to start...' 
              })}\n\n`)
            );
            return;
          }

          // Only send update if progress or status changed
          if (progress.progress !== lastProgress || progress.status !== lastStatus) {
            lastProgress = progress.progress || 0;
            lastStatus = progress.status || 'starting';

            const update = {
              type: 'progress',
              status: progress.status,
              progress: progress.progress || 0,
              message: progress.message,
              currentChunk: progress.currentChunk,
              totalChunks: progress.totalChunks,
              error: progress.error
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
            );

            // If completed, close stream after a short delay
            if (progress.status === 'completed' && !isCompleted) {
              isCompleted = true;
              setTimeout(() => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ 
                    type: 'completed',
                    result: progress.result 
                  })}\n\n`)
                );
                clearInterval(pollInterval);
                controller.close();
              }, 1000);
            }

            // If error, close stream
            if (progress.status === 'error') {
              clearInterval(pollInterval);
              controller.close();
            }
          }
        } catch (error) {
          logWarn('progress_stream_error', {
            conversationId,
            error: (error as Error).message
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: (error as Error).message 
            })}\n\n`)
          );
          clearInterval(pollInterval);
          controller.close();
        }
      }, 1000); // Poll every second

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval);
        controller.close();
        logInfo('progress_stream_closed', { conversationId });
      });

      // Timeout after 15 minutes (max analysis duration)
      setTimeout(() => {
        if (!isCompleted) {
          clearInterval(pollInterval);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'timeout', 
              message: 'Analysis timeout' 
            })}\n\n`)
          );
          controller.close();
        }
      }, 15 * 60 * 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    }
  });
}

