import { NextResponse } from 'next/server';

import { parseExport } from '../../../features/import/parsers';
import type { ImportPayload, SupportedPlatform } from '../../../features/import/types';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../features/subscription/types';
import { getConfig } from '../../../lib/config';
import { logError, logInfo } from '../../../lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

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
      logError('rate_limit_exceeded', { ip });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const platform = formData.get('platform') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supportedPlatforms: SupportedPlatform[] = ['telegram', 'whatsapp', 'signal', 'viber', 'discord', 'imessage', 'messenger', 'generic'];
    if (!supportedPlatforms.includes(platform as SupportedPlatform)) {
      return NextResponse.json(
        { error: `Unsupported platform. Supported: ${supportedPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // File size validation
    const config = getConfig();
    const maxSizeBytes = config.maxUploadSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      logError('file_too_large', { 
        fileName: file.name, 
        size: file.size, 
        maxSize: maxSizeBytes 
      });
      return NextResponse.json(
        { error: `File too large. Maximum size is ${config.maxUploadSizeMb}MB` },
        { status: 413 }
      );
    }

    // Check subscription tier
    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);

    // Check if file is ZIP (requires premium)
    const isZip = file.name.toLowerCase().endsWith('.zip') ||
                  file.type === 'application/zip' ||
                  file.type === 'application/x-zip-compressed';

    if (isZip && !features.canImportZip) {
      logError('zip_requires_premium', { fileName: file.name, tier: subscriptionTier });
      return NextResponse.json(
        { 
          error: 'ZIP file imports require a premium subscription. Please upgrade to analyze ZIP exports with media.',
          requiresPremium: true,
          feature: 'zip_import'
        },
        { status: 403 }
      );
    }

    // Content type validation
    const allowedTypes = ['application/json', 'text/plain'];
    if (subscriptionTier === 'premium') {
      allowedTypes.push('application/zip', 'application/x-zip-compressed');
    }
    
    if (file.type && !allowedTypes.includes(file.type) && !file.name.match(/\.(json|txt)$/i) && !(isZip && features.canImportZip)) {
      logError('invalid_file_type', { fileName: file.name, contentType: file.type });
      return NextResponse.json(
        { error: subscriptionTier === 'free' 
          ? 'Invalid file type. Free tier supports .json and .txt files only. Upgrade to premium for ZIP imports.'
          : 'Invalid file type. Only .json, .txt, and .zip files are allowed.' },
        { status: 400 }
      );
    }

    logInfo('import_started', { fileName: file.name, size: file.size, platform });

    const arrayBuffer = await file.arrayBuffer();
    const payload: ImportPayload = {
      platform: platform as SupportedPlatform,
      fileName: file.name,
      sizeBytes: file.size,
      contentType: file.type
    };

    const normalized = await parseExport(payload, arrayBuffer);

    // Check message limit for free tier
    if (normalized.messages.length > features.maxMessagesPerAnalysis) {
      logError('message_limit_exceeded', { 
        messageCount: normalized.messages.length, 
        maxMessages: features.maxMessagesPerAnalysis,
        tier: subscriptionTier 
      });
      return NextResponse.json(
        { 
          error: `Free tier supports up to ${features.maxMessagesPerAnalysis.toLocaleString()} messages. This export has ${normalized.messages.length.toLocaleString()} messages. Upgrade to premium for larger conversations.`,
          requiresPremium: true,
          feature: 'large_conversations',
          messageCount: normalized.messages.length,
          maxMessages: features.maxMessagesPerAnalysis
        },
        { status: 403 }
      );
    }

    // Filter out media if user doesn't have premium
    const mediaToReturn = features.canAnalyzeMedia 
      ? normalized.media 
      : [];

    return NextResponse.json({
      conversation: normalized.conversation,
      participants: normalized.participants,
      messages: normalized.messages,
      media: mediaToReturn,
      messageCount: normalized.messages.length,
      mediaCount: normalized.media.length,
      subscriptionTier,
      features: {
        canAnalyzeMedia: features.canAnalyzeMedia,
        canUseEnhancedAnalysis: features.canUseEnhancedAnalysis
      }
    });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Import failed';
    const errorStack = (error as Error).stack;
    
    logError('import_api_error', { 
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

