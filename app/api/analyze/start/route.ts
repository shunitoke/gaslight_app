import { NextResponse } from 'next/server';

import { analyzeConversation } from '../../../../features/analysis/analysisService';
import type {
  Conversation,
  Message,
  MediaArtifact,
  Participant,
} from '../../../../features/analysis/types';
import type { SupportedLocale } from '../../../../features/i18n/types';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../../features/subscription/types';
import { logError, logInfo, logWarn } from '../../../../lib/telemetry';
import { createJob, updateJob, setJobResult, getJob } from '../jobStore';
import { updateProgressStore, getProgressStore } from '../progress/route';

export const runtime = 'nodejs';
export const maxDuration = 60; // keep the start endpoint itself very short

type AnalyzeStartBody = {
  conversation: Conversation;
  messages: Message[];
  mediaArtifacts?: MediaArtifact[];
  enhancedAnalysis?: boolean;
  participants?: Participant[];
  locale?: SupportedLocale;
};

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Basic tier check (reuse subscription logic)
    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);

    const body = (await request.json()) as AnalyzeStartBody;
    const {
      conversation,
      messages,
      mediaArtifacts = [],
      enhancedAnalysis = false,
      participants = [],
      locale = 'en',
    } = body;

    if (!conversation || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request body: conversation and messages are required.' },
        { status: 400 },
      );
    }

    const job = await createJob(conversation.id);
    logInfo('analyze_start_job_created', {
      jobId: job.id,
      conversationId: conversation.id
    });

    // Fire-and-forget background analysis
    (async () => {
      try {
        await updateJob(job.id, {
          status: 'running',
          startedAt: new Date().toISOString(),
        });

        // Set initial progress status: starting (give client time to start polling)
        await updateProgressStore(conversation.id, {
          status: 'starting',
          progress: 0
        });
        
        // Small delay to ensure client has started polling
        await new Promise(resolve => setTimeout(resolve, 100));

        const analysisResult = await analyzeConversation(
          conversation,
          messages,
          features.canAnalyzeMedia ? mediaArtifacts : [],
          enhancedAnalysis && features.canUseEnhancedAnalysis,
          conversation.id,
          participants,
          locale,
        );

        // Aggregate simple daily activity for lightweight timeline/heatmap visuals
        const activityMap = new Map<string, { date: string; messageCount: number }>();
        for (const message of messages) {
          const dateKey = new Date(message.sentAt).toISOString().split('T')[0];
          const existing = activityMap.get(dateKey);
          if (existing) {
            existing.messageCount += 1;
          } else {
            activityMap.set(dateKey, {
              date: dateKey,
              messageCount: 1,
            });
          }
        }
        const activityByDay = Array.from(activityMap.values()).sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        logInfo('analyze_start_setting_result', {
          jobId: job.id,
          sectionsCount: analysisResult.sections?.length || 0,
          hasOverview: !!analysisResult.overviewSummary
        });
        await setJobResult(job.id, {
          conversation: {
            ...conversation,
            status: 'completed',
          },
          analysis: analysisResult,
          activityByDay,
        });
        const verifyJob = await getJob(job.id);
        if (!verifyJob || !verifyJob.result) {
          logError('analyze_start_result_not_saved', {
            jobId: job.id,
            jobExists: !!verifyJob,
            hasResult: !!verifyJob?.result
          });
        } else {
          logInfo('analyze_start_result_saved', {
            jobId: job.id,
            sectionsCount: verifyJob.result.analysis?.sections?.length || 0
          });
        }

        await updateJob(job.id, {
          status: 'completed',
          finishedAt: new Date().toISOString(),
          progress: 100,
        });
        
        // Also store result in progressStore as fallback (in case jobStore fails across workers)
        // Use direct function call instead of fetch for reliability
        const resultToStore = {
          conversation: {
            ...conversation,
            status: 'completed',
          },
          analysis: analysisResult,
          activityByDay,
        };
        
        await updateProgressStore(conversation.id, {
          status: 'completed',
          progress: 100,
          result: resultToStore
        });
        
        // Verify it was saved
        const verifyProgress = await getProgressStore(conversation.id);
        logInfo('analyze_start_progress_store_updated', {
          jobId: job.id,
          conversationId: conversation.id,
          sectionsCount: analysisResult.sections?.length || 0,
          hasResult: !!verifyProgress?.result,
          hasAnalysis: !!verifyProgress?.result?.analysis,
          verifySectionsCount: verifyProgress?.result?.analysis?.sections?.length || 0
        });
      } catch (error) {
        const message = (error as Error).message || 'Analysis failed';
        logError('analyze_start_job_error', {
          ip,
          error: message,
        });
        await updateJob(job.id, {
          status: 'failed',
          finishedAt: new Date().toISOString(),
          error: message,
        });
      }
    })().catch(() => {
      // Swallow background errors; they are logged above
    });

    return NextResponse.json(
      {
        jobId: job.id,
        conversationId: conversation.id,
        status: job.status,
        createdAt: job.createdAt,
      },
      { status: 202 },
    );
  } catch (error) {
    const errorMessage = (error as Error).message || 'Failed to start analysis';
    logError('analyze_start_error', { error: errorMessage });

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}


