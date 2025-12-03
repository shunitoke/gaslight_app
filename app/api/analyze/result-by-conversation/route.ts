import { NextResponse } from 'next/server';
import { getJobByConversationId } from '../jobStore';
import { getProgressStore } from '../progress/route';
import { logWarn, logInfo } from '../../../../lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET endpoint to get analysis result by conversationId
 * This is a fallback when jobId-based lookup fails due to worker isolation
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
  }

  // Try multiple times with delays to handle worker isolation
  // In serverless, GET requests might hit different workers than where the result was saved
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // Small delay between attempts to allow result to propagate
      await new Promise(resolve => setTimeout(resolve, 200 * attempt));
    }
    
    // Try to get result from progressStore first (most reliable within same worker)
    const progress = await getProgressStore(conversationId);
    if (progress?.result) {
      logInfo('analyze_result_by_conversation_found_in_progress', {
        conversationId,
        attempt: attempt + 1,
        sectionsCount: progress.result.analysis?.sections?.length || 0
      });
      return NextResponse.json(progress.result, { status: 200 });
    }

    // Fallback: try to find job by conversationId
    // This might work if we're in the same worker where the job was created
    const job = await getJobByConversationId(conversationId);
    
    if (job?.result) {
      logInfo('analyze_result_by_conversation_found_in_job', {
        conversationId,
        jobId: job.id,
        attempt: attempt + 1,
        sectionsCount: job.result.analysis?.sections?.length || 0
      });
      return NextResponse.json(job.result, { status: 200 });
    }
  }

  logWarn('analyze_result_by_conversation_not_found', {
    conversationId,
    attempts: 3
  });

  return NextResponse.json({ error: 'Result not found' }, { status: 404 });
}

