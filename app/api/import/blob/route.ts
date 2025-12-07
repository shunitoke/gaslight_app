/**
 * Import endpoint for large files uploaded via Vercel Blob
 * 
 * This endpoint handles files that were uploaded directly to Vercel Blob
 * to bypass the 4.5MB request body limit.
 */

import { NextResponse } from 'next/server';
import { parseExport } from '../../../../features/import/parsers';
import type { ImportPayload, SupportedPlatform } from '../../../../features/import/types';
import { detectFileFormat } from '../../../../features/import/detectFormat';
import { validateConversationFormat } from '../../../../features/import/preValidation';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../../features/subscription/types';
import { getConfig } from '../../../../lib/config';
import { logError, logInfo, logWarn } from '../../../../lib/telemetry';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { checkDatabaseHealth } from '../../../../lib/db-health';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT_MAX_REQUESTS = 5;

function pickLocalizedMessage(request: Request, messages: Record<string, string>): string {
  const acceptLang = request.headers.get('accept-language') || '';
  const preferred = acceptLang.split(',').map((part) => part.split(';')[0].trim().toLowerCase());
  const localeOrder = [...preferred, 'ru', 'en', 'es', 'fr', 'de', 'pt'];
  for (const lang of localeOrder) {
    if (messages[lang]) return messages[lang];
    const short = lang.split('-')[0];
    if (messages[short]) return messages[short];
  }
  const first = Object.values(messages)[0];
  return first || 'Unexpected error';
}

export async function POST(request: Request) {
  try {
    // Check database connections
    const dbHealth = await checkDatabaseHealth();
    logInfo('import_blob_db_check', {
      status: dbHealth.overall,
      redisConnected: dbHealth.redis.connected,
      blobAccessible: dbHealth.blob.accessible,
    });

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!(await checkRateLimit(`import_blob:${ip}`, RATE_LIMIT_MAX_REQUESTS))) {
      logError('rate_limit_exceeded', { ip, endpoint: 'import_blob' });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { blobUrl, platform, fileName, contentType } = body;

    if (!blobUrl) {
      return NextResponse.json({ error: 'No blob URL provided' }, { status: 400 });
    }

    const supportedPlatforms: SupportedPlatform[] = ['telegram', 'whatsapp', 'signal', 'viber', 'discord', 'imessage', 'messenger', 'generic'];
    
    logInfo('import_blob_started', { blobUrl, fileName, platform, autoDetect: !platform || platform === 'auto' });

    // Check subscription tier first (before fetching large files)
    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);
    const config = getConfig();
    const maxSizeBytes = config.maxUploadSizeMb * 1024 * 1024;

    // Fetch file from Blob URL (public access)
    // For large files, use streaming to avoid loading entire file into RAM
    let fileContent: ArrayBuffer | ReadableStream<Uint8Array>;
    let useStreaming = false;
    let detectedFileSize: number | null = null;
    
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
      }
      
      // Check Content-Length header to decide if we should stream
      const contentLengthHeader = response.headers.get('content-length');
      detectedFileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;
      
      // Use streaming for files > 50MB to avoid OOM
      const STREAMING_THRESHOLD = 50 * 1024 * 1024; // 50MB
      useStreaming = detectedFileSize !== null && detectedFileSize > STREAMING_THRESHOLD && response.body !== null;
      
      if (useStreaming && response.body) {
        logInfo('import_blob_streaming', {
          blobUrl,
          fileSize: detectedFileSize,
          fileName
        });
        
        // Pass ReadableStream directly to parser for streaming
        fileContent = response.body;
      } else {
        const arrayBuffer = await response.arrayBuffer();
        
        // Check file size (same as direct upload)
        if (arrayBuffer.byteLength > maxSizeBytes) {
          logError('file_too_large_blob', { 
            fileName, 
            size: arrayBuffer.byteLength, 
            maxSize: maxSizeBytes 
          });
          return NextResponse.json(
            { error: `File too large. Maximum size is ${config.maxUploadSizeMb}MB` },
            { status: 413 }
          );
        }
        
        fileContent = arrayBuffer;
        detectedFileSize = arrayBuffer.byteLength; // Update with actual size
      }
      
      logInfo('import_blob_fetched', {
        blobUrl,
        size: detectedFileSize || 'unknown',
        fileName,
        usedStreaming: useStreaming
      });
    } catch (blobError) {
      logError('import_blob_fetch_error', {
        blobUrl,
        error: (blobError as Error).message
      });
      return NextResponse.json(
        { error: 'Failed to fetch file from storage. Please try uploading again.' },
        { status: 500 }
      );
    }

    // Auto-detect platform if not provided or set to 'auto'
    let detectedPlatform: SupportedPlatform | null = null;
    if (!platform || platform === 'auto' || !supportedPlatforms.includes(platform as SupportedPlatform)) {
      logInfo('auto_detection_started_blob', { fileName, providedPlatform: platform });
      
      // For streaming, we need to read a sample for detection
      // For now, if streaming, we'll skip auto-detection and require platform
      if (useStreaming && fileContent instanceof ReadableStream) {
        logWarn('auto_detection_skipped_streaming', { fileName });
        if (!platform || platform === 'auto') {
          return NextResponse.json(
            { 
              error: 'Auto-detection is not available for very large files. Please specify the platform manually.'
            },
            { status: 400 }
          );
        }
      } else {
        const detection = await detectFileFormat(fileContent as ArrayBuffer, fileName || 'export', contentType);
        
        if (detection.platform && detection.confidence >= 0.3) {
          detectedPlatform = detection.platform;
          platform = detectedPlatform;
          logInfo('auto_detection_success_blob', {
            fileName,
            detectedPlatform,
            confidence: detection.confidence
          });
        } else {
          // Fallback to generic instead of failing hard
          detectedPlatform = 'generic';
          platform = 'generic';
          logWarn('auto_detection_failed_blob_generic_fallback', {
            fileName,
            confidence: detection.confidence,
            detectedFormat: detection.format
          });
        }
      }
    }

    if (!platform || !supportedPlatforms.includes(platform as SupportedPlatform)) {
      return NextResponse.json(
        { error: `Unsupported platform. Supported: ${supportedPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // Pre-validation: Skip for auto-detection - let the parser handle it
    // Only validate if platform was manually selected and not streaming
    if (!useStreaming && fileContent instanceof ArrayBuffer && !detectedPlatform && platform && platform !== 'auto') {
      const validation = await validateConversationFormat(fileContent, fileName || 'export', platform);
      // Only reject if confidence is extremely low (obviously not a conversation)
      if (!validation.isValid && validation.confidence < 0.05) {
        logWarn('pre_validation_failed_manual_blob', {
          fileName,
          platform,
          isValid: validation.isValid,
          confidence: validation.confidence,
          reason: validation.reason
        });
        return NextResponse.json(
          { 
            error: 'This file does not appear to be a conversation export. Please upload a valid chat export file.',
            reason: validation.reason || 'File format validation failed',
            confidence: validation.confidence
          },
          { status: 400 }
        );
      }
      logInfo('pre_validation_passed_blob', {
        fileName,
        platform,
        confidence: validation.confidence
      });
    } else if (detectedPlatform) {
      // For auto-detection, skip validation - trust the detection and let parser handle it
      logInfo('pre_validation_skipped_auto_detect_blob', {
        fileName,
        platform: detectedPlatform,
        reason: 'Auto-detection enabled - skipping pre-validation'
      });
    }

    // Check if file is ZIP (requires premium)
    const isZip = fileName?.toLowerCase().endsWith('.zip') ||
                  contentType === 'application/zip' ||
                  contentType === 'application/x-zip-compressed';

    // Content type validation (same as direct upload - applies to all platforms including generic)
    const allowedTypes = ['application/json', 'text/plain', 'application/zip', 'application/x-zip-compressed'];
    
    const isAllowedType = !contentType || allowedTypes.includes(contentType) || 
                          fileName?.match(/\.(json|txt)$/i) || 
                          isZip;
    
    if (!isAllowedType) {
      logError('invalid_file_type_blob', { fileName, contentType, platform });
      return NextResponse.json(
        { error: subscriptionTier === 'free' 
          ? 'Invalid file type. Free tier supports .json and .txt files only. Upgrade to premium for ZIP imports.'
          : 'Invalid file type. Only .json, .txt, and .zip files are allowed.' },
        { status: 400 }
      );
    }

    const finalFileSize = useStreaming && fileContent instanceof ReadableStream
      ? (detectedFileSize !== null ? detectedFileSize : 0)
      : (fileContent as ArrayBuffer).byteLength;

    // Temporary block: large ZIPs with media until next version
    const ZIP_MEDIA_MAX_BYTES = 25 * 1024 * 1024;
    if (isZip && finalFileSize > ZIP_MEDIA_MAX_BYTES) {
      logError('zip_media_too_large_temp_block_blob', {
        fileName,
        size: finalFileSize,
        maxSize: ZIP_MEDIA_MAX_BYTES
      });
      return NextResponse.json(
        { error: 'ZIP uploads with media over 25MB are temporarily blocked. Media analysis will be available in the next version.' },
        { status: 413 }
      );
    }

    const payload: ImportPayload = {
      platform: platform as SupportedPlatform,
      fileName: fileName || 'export.json',
      sizeBytes: finalFileSize,
      contentType: contentType || 'application/json'
    };

    const normalized = await parseExport(payload, fileContent);

    // Check message limit for free tier (same as direct upload - applies to ALL platforms including generic)
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

    logInfo('import_blob_completed', {
      blobUrl,
      messageCount: normalized.messages.length,
      mediaCount: normalized.media.length
    });

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
    logError('import_blob_api_error', { 
      error: errorMessage,
      stack: (error as Error).stack?.substring(0, 500)
    });
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' ? { 
          details: (error as Error).stack?.substring(0, 1000) 
        } : {})
      },
      { status: 500 }
    );
  }
}

