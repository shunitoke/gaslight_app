import { NextResponse } from 'next/server';

import { analyzeConversation } from '../../../features/analysis/analysisService';
import type {
  Conversation,
  Message
} from '../../../features/analysis/types';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../features/subscription/types';
import { logError } from '../../../lib/telemetry';

/**
 * Helper to update analysis progress
 */
async function updateAnalysisProgress(
  conversationId: string,
  updates: {
    status?: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'completed' | 'error';
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
  }
) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    await fetch(`${baseUrl}/api/analyze/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        ...updates
      })
    });
  } catch {
    // Ignore progress update errors
  }
}

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for analysis

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 analysis requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      logError('rate_limit_exceeded', { ip, endpoint: 'analyze' });
      return NextResponse.json(
        { error: 'Too many analysis requests. Please try again later.' },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logError('analyze_request_parse_error', { error: (parseError as Error).message });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { conversation, messages, mediaArtifacts, enhancedAnalysis, participants, locale } = body as {
      conversation: Conversation;
      messages: Message[];
      mediaArtifacts?: import('../../../features/analysis/types').MediaArtifact[];
      enhancedAnalysis?: boolean;
      participants?: import('../../../features/analysis/types').Participant[];
      locale?: import('../../../features/i18n/types').SupportedLocale;
    };

    // Check subscription tier
    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);

    // Check if media analysis is requested but not available
    if (mediaArtifacts && mediaArtifacts.length > 0 && !features.canAnalyzeMedia) {
      logError('media_analysis_requires_premium', { 
        mediaCount: mediaArtifacts.length, 
        tier: subscriptionTier 
      });
      return NextResponse.json(
        { 
          error: 'Media analysis requires a premium subscription. Please upgrade to analyze images, stickers, and other media.',
          requiresPremium: true,
          feature: 'media_analysis'
        },
        { status: 403 }
      );
    }

    // Check if enhanced analysis is requested but not available
    if (enhancedAnalysis && !features.canUseEnhancedAnalysis) {
      logError('enhanced_analysis_requires_premium', { tier: subscriptionTier });
      return NextResponse.json(
        { 
          error: 'Enhanced analysis requires a premium subscription. Please upgrade for deeper insights.',
          requiresPremium: true,
          feature: 'enhanced_analysis'
        },
        { status: 403 }
      );
    }

    // Limit media analysis for free tier
    const mediaToAnalyze = features.canAnalyzeMedia 
      ? (mediaArtifacts || []).slice(0, features.maxMediaItemsPerAnalysis)
      : [];

    if (!conversation || !messages || !Array.isArray(messages)) {
      logError('analyze_invalid_request', { 
        hasConversation: !!conversation,
        messagesType: typeof messages,
        messagesLength: Array.isArray(messages) ? messages.length : 'not array'
      });
      return NextResponse.json(
        { error: 'Invalid request: conversation and messages array required' },
        { status: 400 }
      );
    }

    // Validate message count (prevent extremely large requests)
    if (messages.length > 1000000) {
      logError('analyze_too_many_messages', { messageCount: messages.length });
      return NextResponse.json(
        { error: 'Too many messages. Maximum 1,000,000 messages per analysis.' },
        { status: 400 }
      );
    }

    // Update conversation status to analyzing
    const updatedConversation: Conversation = {
      ...conversation,
      status: 'analyzing'
    };

    // Update progress: starting (give client time to start polling)
    await updateAnalysisProgress(conversation.id, {
      status: 'starting',
      progress: 0
    });
    
    // Small delay to ensure client has started polling
    await new Promise(resolve => setTimeout(resolve, 100));

    const analysisResult = await analyzeConversation(
      updatedConversation, 
      messages, 
      mediaToAnalyze,
      enhancedAnalysis || false,
      conversation.id, // Pass conversation ID for progress updates
      participants || [], // Pass participants for name mapping
      locale || 'en' // Pass locale for prompt translation
    );

    // Mark conversation as completed
    updatedConversation.status = 'completed';

    return NextResponse.json({
      conversation: updatedConversation,
      analysis: analysisResult
    });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Analysis failed';
    const errorStack = (error as Error).stack;
    
    logError('analyze_api_error', { 
      error: errorMessage,
      stack: errorStack?.substring(0, 500) // Limit stack trace length
    });
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        error: errorMessage,
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && errorStack ? { 
          details: errorStack.substring(0, 1000) 
        } : {})
      },
      { status: 500 }
    );
  }
}

