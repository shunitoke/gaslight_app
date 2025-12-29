import { NextResponse } from 'next/server';
import { getJobByConversationId, deleteJob } from '../jobStore';
import { getProgressStore, deleteProgressStore } from '../progress/route';
import { logWarn, logInfo } from '../../../../lib/telemetry';
import { setAnalysisResult } from '../../../../lib/analysisResultStore';
import { getSubscriptionTier } from '../../../../features/subscription/types';

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
  const tier = await getSubscriptionTier(request);
  const redactAnalysis = (analysis: any) => {
    if (!analysis || typeof analysis !== 'object') return analysis;
    return {
      ...analysis,
      sections: Array.isArray(analysis.sections)
        ? analysis.sections.map((s: any) => ({
            ...s,
            evidenceSnippets: [],
            recommendedReplies: undefined
          }))
        : [],
      participantProfiles: undefined,
      importantDates: undefined,
      communicationStats: undefined,
      promiseTracking: undefined,
      redFlagCounts: undefined,
      emotionalCycle: undefined,
      timePatterns: undefined,
      contradictions: undefined,
      realityCheck: undefined,
      frameworkDiagnosis: undefined,
      hardTruth: undefined,
      whatYouShouldKnow: undefined,
      whatsNext: undefined,
      closure: undefined
    };
  };

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
      const response = NextResponse.json(
        tier === 'premium'
          ? progress.result
          : {
              ...progress.result,
              analysis: redactAnalysis((progress.result as any).analysis)
            },
        { status: 200 }
      );
      const analysisId = progress.result?.analysis?.id;
      if (analysisId) {
        setAnalysisResult(analysisId, progress.result).catch(() => {});
      }
      try {
        const jobForCleanup = await getJobByConversationId(conversationId);
        await Promise.allSettled([
          deleteProgressStore(conversationId),
          jobForCleanup?.id ? deleteJob(jobForCleanup.id, conversationId) : Promise.resolve()
        ]);
      } catch {
        // ignore cleanup errors
      }
      return response;
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
      const response = NextResponse.json(
        tier === 'premium'
          ? job.result
          : {
              ...job.result,
              analysis: redactAnalysis((job.result as any).analysis)
            },
        { status: 200 }
      );
      const analysisId = job.result?.analysis?.id;
      if (analysisId) {
        setAnalysisResult(analysisId, job.result).catch(() => {});
      }
      try {
        await Promise.allSettled([
          deleteProgressStore(conversationId),
          deleteJob(job.id, conversationId)
        ]);
      } catch {
        // ignore cleanup errors
      }
      return response;
    }
  }

  logWarn('analyze_result_by_conversation_not_found', {
    conversationId,
    attempts: 3
  });

  return NextResponse.json({ error: 'Result not found' }, { status: 404 });
}

