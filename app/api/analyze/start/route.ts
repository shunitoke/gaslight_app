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
import { updateProgressStore } from '../progress/route';
import { computeChatHash, getCachedAnalysis, setCachedAnalysis } from '../../../../lib/cache';
import { getConfig } from '../../../../lib/config';
import { trackAnalysisEnd, trackAnalysisStart } from '../../../../lib/activity';

export const runtime = 'nodejs';
export const maxDuration = 300; // allow blocking analysis for diagnostics

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

    // Set initial progress once; analysisService will handle staged updates
    await updateProgressStore(conversation.id, {
      status: 'starting',
      progress: 0
    });
    await trackAnalysisStart(conversation.id);

    // Run analysis inline (blocking) to ensure logs and progress are flushed on Vercel
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

        logInfo('analyze_start_calling_analyzeConversation', {
          jobId: job.id,
          conversationId: conversation.id,
          messageCount: messages.length,
          mediaCount: features.canAnalyzeMedia ? mediaArtifacts.length : 0,
          model: getConfig().textModel
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
        
        // Store result in both jobStore and progressStore
        await Promise.all([
          setJobResult(job.id, resultToStore),
          updateProgressStore(conversation.id, {
            status: 'completed',
            progress: 100,
            result: resultToStore
          })
        ]);

        // Update job status
        await updateJob(job.id, {
          status: 'completed',
          finishedAt: new Date().toISOString(),
          progress: 100,
        });
        await trackAnalysisEnd(conversation.id);
    } catch (error) {
      const message = (error as Error).message || 'Analysis failed';
      logError('analyze_start_job_error', {
        ip,
        error: message,
      });
      await updateProgressStore(conversation.id, {
        status: 'error',
        progress: 100,
        error: message,
      });
      await updateJob(job.id, {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        error: message,
      });
      await trackAnalysisEnd(conversation.id);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(
      {
        jobId: job.id,
        conversationId: conversation.id,
        status: 'completed',
        createdAt: job.createdAt,
      },
      { status: 200 },
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


