import { NextResponse } from 'next/server';

import { analyzeConversation } from '../../../../features/analysis/analysisService';
import type {
  Conversation,
  Message,
  MediaArtifact,
  Participant,
} from '../../../../features/analysis/types';
import type { SupportedLocale } from '../../../../features/i18n/types';
import { getPremiumTokenPayload, type PremiumTokenPayload } from '../../../../features/subscription/premiumToken';
import {
  recordReportDelivery,
  getDeliveryStatsForPurchases
} from '../../../../features/subscription/purchases';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../../features/subscription/types';
import { trackAnalysisEnd, trackAnalysisStart } from '../../../../lib/activity';
import { computeChatHash, getCachedAnalysis, setCachedAnalysis } from '../../../../lib/cache';
import { getConfig } from '../../../../lib/config';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { logError, logInfo, logWarn } from '../../../../lib/telemetry';
import { analyzeMediaArtifact } from '../../../../lib/vision';
import { createJob, updateJob, setJobResult } from '../jobStore';
import { updateProgressStore } from '../progress/route';

export const runtime = 'nodejs';
export const maxDuration = 300; // allow blocking analysis for diagnostics

const RATE_LIMIT_MAX_REQUESTS = 3; // 3 analysis start requests per minute per IP
const DAILY_LIMIT_FREE = 10; // 10 analyses per day for free users
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type AnalyzeStartBody = {
  conversation: Conversation;
  messages: Message[];
  mediaArtifacts?: MediaArtifact[];
  enhancedAnalysis?: boolean;
  participants?: Participant[];
  locale?: SupportedLocale;
  analysisMode?: 'default' | 'screenshot';
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
    const premiumPayload: PremiumTokenPayload | null = getPremiumTokenPayload(request);

    // Free tier daily limit check
    // Applied to everyone since premium is currently disabled
    const isWithinDailyLimit = await checkRateLimit(
      `analyze_start_daily:${ip}`,
      DAILY_LIMIT_FREE,
      ONE_DAY_MS
    );
    
    if (!isWithinDailyLimit) {
      logError('daily_limit_exceeded', { ip, endpoint: 'analyze_start_daily' });
      return NextResponse.json(
        { error: 'Daily analysis limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Silent allowance: up to 3 completed analyses per payment
    if (premiumPayload) {
      const stats = await getDeliveryStatsForPurchases([premiumPayload.paymentId]);
      const deliveredCount = stats[premiumPayload.paymentId]?.deliveredCount ?? 0;
      const MAX_PER_PAYMENT = 3;
      if (deliveredCount >= MAX_PER_PAYMENT) {
        return NextResponse.json(
          { error: 'Usage limit reached for this token. Please contact support if needed.' },
          { status: 402 }
        );
      }
    }

    const recordDeliveryIfPremium = async (reportId: string) => {
      if (!premiumPayload) return;
      try {
        await recordReportDelivery({
          transactionId: premiumPayload.paymentId,
          reportId,
          deliveredAt: Date.now()
        });
      } catch (error) {
        logWarn('report_delivery_record_error', {
          reportId,
          transactionId: premiumPayload.paymentId,
          error: (error as Error).message
        });
      }
    };

    const body = (await request.json()) as AnalyzeStartBody;
    const {
      conversation,
      messages,
      mediaArtifacts = [],
      enhancedAnalysis = false,
      participants = [],
      locale = 'en',
      analysisMode = 'default',
    } = body;

    if (!conversation || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request body: conversation and messages are required.' },
        { status: 400 },
      );
    }

    // Check cache before starting analysis
    const chatHash = computeChatHash(messages, mediaArtifacts);
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
      } catch {
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

      await recordDeliveryIfPremium(conversation.id);

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

        // Always forward media, but cap by tier to avoid silent drops; keep logging
        const mediaForAnalysis = mediaArtifacts.slice(0, features.maxMediaItemsPerAnalysis ?? 0);

        logInfo('media_analysis_forwarded', {
          conversationId: conversation.id,
          forwardedMedia: mediaArtifacts.length,
          tier: subscriptionTier,
        });

        // Run vision analysis on media items (images) if they haven't been analyzed yet
        // We do this here (after cache check) to ensure we don't waste tokens on cached results,
        // but before analyzeConversation so the text model gets the image descriptions.
        if (features.canAnalyzeMedia && mediaForAnalysis.length > 0) {
          const imagesToAnalyze = mediaForAnalysis.filter(
            m => (m.type === 'image' || m.type === 'sticker' || m.type === 'gif') && 
                 (!m.labels || m.labels.length === 0)
          );

          if (imagesToAnalyze.length > 0) {
            logInfo('vision_analysis_start', {
              count: imagesToAnalyze.length,
              conversationId: conversation.id
            });

            // Process in small batches to respect concurrency limits
            const BATCH_SIZE = 3;
            for (let i = 0; i < imagesToAnalyze.length; i += BATCH_SIZE) {
              const batch = imagesToAnalyze.slice(i, i + BATCH_SIZE);
              await Promise.all(batch.map(async (media) => {
                try {
                  const result = await analyzeMediaArtifact(media);
                  // Update media object in place
                  media.labels = result.labels;
                  media.sentimentHint = result.sentiment;
                  // Use description as notes/content for the LLM
                  media.notes = result.description; 
                  
                  // Also log success for debugging
                  if (result.description && result.description.length > 0) {
                     // We don't log full description to avoid log bloat
                  }
                } catch (err) {
                  logWarn('vision_analysis_failed_for_item', {
                    mediaId: media.id,
                    error: (err as Error).message
                  });
                }
              }));
            }
            
            logInfo('vision_analysis_completed', {
              count: imagesToAnalyze.length,
              conversationId: conversation.id
            });
          }
        }

        const analysisResult = await analyzeConversation(
          conversation,
          messages,
          mediaArtifacts, // always pass media; upstream controls availability
          enhancedAnalysis && features.canUseEnhancedAnalysis,
          conversation.id,
          participants,
          locale,
          analysisMode,
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

        await recordDeliveryIfPremium(conversation.id);

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
