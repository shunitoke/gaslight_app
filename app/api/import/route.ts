import { NextResponse } from 'next/server';

import { parseExport } from '../../../features/import/parsers';
import type { ImportPayload, SupportedPlatform } from '../../../features/import/types';
import { detectFileFormat } from '../../../features/import/detectFormat';
import { validateConversationFormat } from '../../../features/import/preValidation';
import { getSubscriptionFeatures, getSubscriptionTier } from '../../../features/subscription/types';
import { getConfig } from '../../../lib/config';
import { logError, logInfo, logWarn } from '../../../lib/telemetry';
import { sanitizeFileName } from '../../../lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

import { checkRateLimit } from '../../../lib/rateLimit';

const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!(await checkRateLimit(`import:${ip}`, RATE_LIMIT_MAX_REQUESTS))) {
      logError('rate_limit_exceeded', { ip });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let platform = formData.get('platform') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supportedPlatforms: SupportedPlatform[] = ['telegram', 'whatsapp', 'signal', 'viber', 'discord', 'imessage', 'messenger', 'generic'];
    
    // Auto-detect platform if not provided or set to 'auto'
    let detectedPlatform: SupportedPlatform | null = null;
    if (!platform || platform === 'auto' || !supportedPlatforms.includes(platform as SupportedPlatform)) {
      logInfo('auto_detection_started', { fileName: file.name, providedPlatform: platform });
      
      const arrayBuffer = await file.arrayBuffer();
      const detection = await detectFileFormat(arrayBuffer, file.name, file.type);
      
      if (detection.platform && detection.confidence >= 0.3) {
        detectedPlatform = detection.platform;
        platform = detectedPlatform;
        logInfo('auto_detection_success', {
          fileName: file.name,
          detectedPlatform,
          confidence: detection.confidence
        });
      } else {
        logError('auto_detection_failed', {
          fileName: file.name,
          confidence: detection.confidence
        });
        return NextResponse.json(
          { 
            error: 'Could not automatically detect the file format. Please specify the platform manually.',
            detectedFormat: detection.format,
            confidence: detection.confidence
          },
          { status: 400 }
        );
      }
    }

    if (!platform || !supportedPlatforms.includes(platform as SupportedPlatform)) {
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

    // Temporary block: large ZIPs with media until next version
    const ZIP_MEDIA_MAX_BYTES = 25 * 1024 * 1024;
    if (isZip && file.size > ZIP_MEDIA_MAX_BYTES) {
      logError('zip_media_too_large_temp_block', {
        fileName: file.name,
        size: file.size,
        maxSize: ZIP_MEDIA_MAX_BYTES
      });
      return NextResponse.json(
        { error: pickLocalizedMessage(request, {
          ru: 'ZIP загрузки с медиа >25MB временно заблокированы. Анализ медиа будет доступен в следующей версии.',
          en: 'ZIP uploads with media over 25MB are temporarily blocked. Media analysis will be available in the next version.',
          es: 'Las subidas ZIP con medios de más de 25MB están bloqueadas temporalmente. El análisis de medios estará disponible en la próxima versión.',
          fr: 'Les chargements ZIP avec médias de plus de 25 Mo sont temporairement bloqués. L’analyse des médias sera disponible dans la prochaine version.',
          de: 'ZIP-Uploads mit Medien über 25MB sind vorübergehend blockiert. Medienanalyse wird in der nächsten Version verfügbar sein.',
          pt: 'Envios ZIP com mídia acima de 25MB estão temporariamente bloqueados. A análise de mídia estará disponível na próxima versão.'
        }) },
        { status: 413 }
      );
    }

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

    // Sanitize file name for logging and security
    const sanitizedFileName = sanitizeFileName(file.name);
    logInfo('import_started', { fileName: sanitizedFileName, size: file.size, platform, autoDetected: !!detectedPlatform });

    const arrayBuffer = await file.arrayBuffer();
    
    // Pre-validation: Skip for auto-detection - let the parser handle it
    // Only validate if platform was manually selected (user knows what they're doing)
    if (!detectedPlatform && platform && platform !== 'auto') {
      const validation = await validateConversationFormat(arrayBuffer, file.name, platform);
      // Only reject if confidence is extremely low (obviously not a conversation)
      if (!validation.isValid && validation.confidence < 0.05) {
        logWarn('pre_validation_failed_manual', {
          fileName: file.name,
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
      logInfo('pre_validation_passed', {
        fileName: file.name,
        platform,
        confidence: validation.confidence
      });
    } else if (detectedPlatform) {
      // For auto-detection, skip validation - trust the detection and let parser handle it
      logInfo('pre_validation_skipped_auto_detect', {
        fileName: file.name,
        platform: detectedPlatform,
        reason: 'Auto-detection enabled - skipping pre-validation'
      });
      // Note: No validation object exists here, so we don't log pre_validation_passed
    }

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
    
    // Check if it's a format error
    const isFormatError = errorMessage === 'INVALID_FORMAT' || errorMessage.includes('Failed to parse');
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        error: isFormatError ? 'INVALID_FORMAT' : errorMessage,
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && errorStack ? { 
          details: errorStack.substring(0, 1000) 
        } : {})
      },
      { status: isFormatError ? 400 : 500 }
    );
  }
}

