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
import { checkRateLimit } from '../../../../lib/rateLimit';
import { createJob, updateJob, setJobResult, getJob } from '../jobStore';
import { updateProgressStore, getProgressStore } from '../progress/route';
import { computeChatHash, getCachedAnalysis, setCachedAnalysis } from '../../../../lib/cache';
import { getConfig } from '../../../../lib/config';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute - route handler returns quickly, analysis runs in background

const RATE_LIMIT_MAX_REQUESTS = 3; // 3 analysis start requests per minute per IP

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

    // Rate limiting
    if (!(await checkRateLimit(`analyze_start:${ip}`, RATE_LIMIT_MAX_REQUESTS))) {
      logError('rate_limit_exceeded', { ip, endpoint: 'analyze_start' });
      return NextResponse.json(
        { error: 'Too many analysis requests. Please try again later.' },
        { status: 429 }
      );
    }

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

    // Check cache before starting analysis
    const chatHash = computeChatHash(messages);
    logInfo('analyze_start_cache_check', {
      conversationId: conversation.id,
      chatHash,
      messageCount: messages.length,
      enhancedAnalysis: enhancedAnalysis && features.canUseEnhancedAnalysis
    });

    const cachedResult = await getCachedAnalysis(
      chatHash,
      enhancedAnalysis && features.canUseEnhancedAnalysis
    );
    if (cachedResult) {
      logInfo('analyze_start_cache_hit', {
        conversationId: conversation.id,
        chatHash
      });

      // Record metrics for cached result
      try {
        const { recordAnalysisStart, recordAnalysisComplete } = await import('../../../../lib/metrics');
        await recordAnalysisStart(
          conversation.id,
          0, // File size not available
          messages.length,
          conversation.sourcePlatform || 'unknown',
          enhancedAnalysis || false
        );
        await recordAnalysisComplete(conversation.id, 0, true); // cacheHit = true
      } catch (metricsError) {
        // Ignore metrics errors
      }

      // Return cached result immediately
      const { aggregateDailyActivity } = await import('../../../../lib/utils');
      const activityByDay = aggregateDailyActivity(messages);

      const result = {
        conversation,
        analysis: cachedResult,
        activityByDay
      };

      // Store result in job store
      const job = await createJob(conversation.id);
      await setJobResult(job.id, result);
      
      // Update progress to completed
      await updateProgressStore(conversation.id, {
        status: 'completed',
        progress: 100,
        result
      });

      return NextResponse.json({ jobId: job.id });
    }

    logInfo('analyze_start_cache_miss', {
      conversationId: conversation.id,
      chatHash
    });

    const job = await createJob(conversation.id);
    logInfo('analyze_start_job_created', {
      jobId: job.id,
      conversationId: conversation.id
    });

    // Set initial progress immediately to verify it works
    await updateProgressStore(conversation.id, {
      status: 'starting',
      progress: 0
    });
    
    // Verify progress was saved (critical check)
    const verifyProgress = await getProgressStore(conversation.id);
    if (!verifyProgress) {
      logError('analyze_start_progress_not_saved', {
        conversationId: conversation.id,
        jobId: job.id
      });
      // Continue anyway, but log the issue
    } else {
      logInfo('analyze_start_progress_verified', {
        conversationId: conversation.id,
        jobId: job.id,
        status: verifyProgress.status
      });
    }

    // Fire-and-forget background analysis
    (async () => {
      try {
        logInfo('analyze_start_background_started', {
          jobId: job.id,
          conversationId: conversation.id,
          messageCount: messages.length
        });

        await updateJob(job.id, {
          status: 'running',
          startedAt: new Date().toISOString(),
        });

        // Set initial progress status: starting (give client time to start polling)
        await updateProgressStore(conversation.id, {
          status: 'starting',
          progress: 0
        });
        
        logInfo('analyze_start_progress_initialized', {
          jobId: job.id,
          conversationId: conversation.id
        });
        
        // Small delay to ensure client has started polling
        await new Promise(resolve => setTimeout(resolve, 100));

        logInfo('analyze_start_calling_analyzeConversation', {
          jobId: job.id,
          conversationId: conversation.id,
          messageCount: messages.length,
          mediaCount: features.canAnalyzeMedia ? mediaArtifacts.length : 0
        });

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
        const { aggregateDailyActivity } = await import('../../../../lib/utils');
        const activityByDay = aggregateDailyActivity(messages);

        logInfo('analyze_start_setting_result', {
          jobId: job.id,
          sectionsCount: analysisResult.sections?.length || 0,
          hasOverview: !!analysisResult.overviewSummary
        });
        
        // Cache the analysis result for future use
        await setCachedAnalysis(
          chatHash,
          analysisResult,
          enhancedAnalysis && features.canUseEnhancedAnalysis
        );
        
        // Prepare result object
        const resultToStore = {
          conversation: {
            ...conversation,
            status: 'completed',
          },
          analysis: analysisResult,
          activityByDay,
        };
        
        // Store result atomically in both jobStore and progressStore
        // This ensures result is available regardless of which worker handles the request
        const [jobResultSaved, progressResultSaved] = await Promise.allSettled([
          setJobResult(job.id, resultToStore),
          updateProgressStore(conversation.id, {
            status: 'completed',
            progress: 100,
            result: resultToStore
          })
        ]);
        
        // Verify both saves succeeded
        if (jobResultSaved.status === 'rejected') {
          logError('analyze_start_job_result_save_failed', {
            jobId: job.id,
            error: jobResultSaved.reason?.message || 'Unknown error'
          });
        }
        
        if (progressResultSaved.status === 'rejected') {
          logError('analyze_start_progress_result_save_failed', {
            conversationId: conversation.id,
            error: progressResultSaved.reason?.message || 'Unknown error'
          });
        }
        
        // Update job status
        await updateJob(job.id, {
          status: 'completed',
          finishedAt: new Date().toISOString(),
          progress: 100,
        });
        
        // Verify results were saved
        const [verifyJob, verifyProgress] = await Promise.all([
          getJob(job.id),
          getProgressStore(conversation.id)
        ]);
        
        if (!verifyJob || !verifyJob.result) {
          logError('analyze_start_result_not_saved_job', {
            jobId: job.id,
            jobExists: !!verifyJob,
            hasResult: !!verifyJob?.result
          });
        } else {
          logInfo('analyze_start_result_saved_job', {
            jobId: job.id,
            sectionsCount: verifyJob.result.analysis?.sections?.length || 0
          });
        }
        
        if (!verifyProgress || !verifyProgress.result) {
          logError('analyze_start_result_not_saved_progress', {
            conversationId: conversation.id,
            progressExists: !!verifyProgress,
            hasResult: !!verifyProgress?.result
          });
        } else {
          logInfo('analyze_start_result_saved_progress', {
            conversationId: conversation.id,
            sectionsCount: verifyProgress.result.analysis?.sections?.length || 0,
            hasBlobUrl: !!verifyProgress.blobUrl
          });
        }
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
    })().catch((error) => {
      // Log unhandled errors in background task
      logError('analyze_start_background_unhandled_error', {
        jobId: job.id,
        conversationId: conversation.id,
        error: (error as Error).message,
        stack: (error as Error).stack?.substring(0, 500)
      });
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


