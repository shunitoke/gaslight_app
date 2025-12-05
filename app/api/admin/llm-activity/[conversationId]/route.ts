/**
 * Admin endpoint for real-time LLM activity logs
 * Returns Server-Sent Events stream of LLM activity
 */

import { NextResponse } from 'next/server';
import { validateAdminSecret, extractAdminSecret, isAdminEnabled } from '@/lib/admin-auth';
import { getLLMActivity } from '@/lib/llm-activity-logger';
import { logError, logInfo } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 300;

type LlmActivityParams = { conversationId: string };
type LlmActivityContext =
  | { params: LlmActivityParams }
  | { params: Promise<LlmActivityParams> };

export async function GET(
  request: Request,
  { params }: LlmActivityContext
) {
  let conversationId: string | undefined;
  try {
    const resolvedParams = await Promise.resolve(params);
    conversationId = resolvedParams.conversationId;
    if (!conversationId) {
      throw new Error('Missing conversationId');
    }

    const resolvedConversationId = conversationId;

    if (!isAdminEnabled()) {
      return new Response('Admin dashboard is not configured', { status: 503 });
    }

    const secret = extractAdminSecret(request);
    if (!validateAdminSecret(secret)) {
      return new Response('Unauthorized', { status: 401 });
    }

    logInfo('admin_llm_activity_stream_start', { conversationId: resolvedConversationId });

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let lastEventCount = 0;

        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', conversationId })}\n\n`)
        );

        // Poll for new events
        const pollInterval = setInterval(async () => {
          try {
            const events = await getLLMActivity(resolvedConversationId);
            
            // Only send new events
            if (events.length > lastEventCount) {
              const newEvents = events.slice(lastEventCount);
              for (const event of newEvents) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'activity', event })}\n\n`)
                );
              }
              lastEventCount = events.length;
            }
          } catch (error) {
            logError('admin_llm_activity_poll_error', {
              conversationId: resolvedConversationId,
              error: (error as Error).message
            });
          }
        }, 1000); // Poll every second

        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
          logInfo('admin_llm_activity_stream_closed', { conversationId: resolvedConversationId });
        });

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          controller.close();
        }, 10 * 60 * 1000);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error) {
    logError('admin_llm_activity_error', {
      conversationId,
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Failed to stream LLM activity' },
      { status: 500 }
    );
  }
}

