import { NextResponse } from 'next/server';

import type { MediaArtifact, Message, Conversation } from '@/features/analysis/types';
import { getSubscriptionFeatures, getSubscriptionTier } from '@/features/subscription/types';
import { storeMediaInBlob } from '@/lib/blob';
import { getConfig } from '@/lib/config';
import { checkRateLimit } from '@/lib/rateLimit';
import { logError, logInfo } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT_MAX_REQUESTS = 5;
const ALLOWED_IMAGE = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const ALLOWED_AUDIO = ['mp3', 'wav', 'ogg', 'opus', 'm4a', 'webm'];
const MAX_BYTES = 25 * 1024 * 1024;

function guessType(fileName: string, contentType?: string | null): 'image' | 'audio' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ALLOWED_IMAGE.includes(ext) || contentType?.startsWith('image/')) return 'image';
  if (ALLOWED_AUDIO.includes(ext) || contentType?.startsWith('audio/')) return 'audio';
  return 'other';
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!(await checkRateLimit(`import_media:${ip}`, RATE_LIMIT_MAX_REQUESTS))) {
      logError('rate_limit_exceeded', { ip, endpoint: 'import_media' });
      return NextResponse.json(
        { error: 'Too many media uploads. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { blobUrl, fileName, contentType, transcript } = body as {
      blobUrl?: string;
      fileName?: string;
      contentType?: string | null;
      transcript?: string | null;
    };

    if (!blobUrl || !fileName) {
      return NextResponse.json({ error: 'blobUrl and fileName are required' }, { status: 400 });
    }

    const typeGuess = guessType(fileName, contentType);
    if (typeGuess === 'other') {
      return NextResponse.json(
        { error: 'Unsupported media type. Use images or audio files.' },
        { status: 400 }
      );
    }

    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);
    if (!features.canAnalyzeMedia) {
      return NextResponse.json(
        { error: 'Media analysis is a premium feature. Upgrade to proceed.', requiresPremium: true },
        { status: 403 }
      );
    }

    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const size = arrayBuffer.byteLength;
    if (size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))}MB.` },
        { status: 413 }
      );
    }

    const mediaId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const storedUrl = await storeMediaInBlob(
      mediaId,
      new Blob([arrayBuffer], { type: contentType || undefined }),
      contentType || undefined
    );

    const conversationId = `media_conversation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mediaArtifact: MediaArtifact = {
      id: mediaId,
      conversationId,
      type: typeGuess,
      originalFilename: fileName,
      contentType: contentType || null,
      sizeBytes: size,
      blobUrl: storedUrl || undefined,
      labels: [],
      sentimentHint: 'unknown',
      notes: typeGuess === 'audio' && transcript ? String(transcript).slice(0, 500) : undefined
    };

    const messageText =
      typeGuess === 'audio'
        ? transcript || 'Voice message (transcription unavailable)'
        : `Image attached: ${fileName}`;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      conversationId,
      senderId: 'participant_user',
      // Intentionally no synthetic date to avoid fake timeline points
      sentAt: null as unknown as string,
      text: messageText,
      mediaArtifactId: mediaId
    };

    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'generic',
      title: typeGuess === 'audio' ? 'Voice note' : 'Media upload',
      startedAt: null,
      endedAt: null,
      participantIds: ['participant_user'],
      languageCodes: ['en'],
      messageCount: 1,
      status: 'imported'
    };

    logInfo('import_media_completed', {
      conversationId,
      mediaId,
      type: typeGuess,
      size
    });

    return NextResponse.json({
      conversation,
      participants: [
        {
          id: 'participant_user',
          displayName: 'You',
          role: 'user'
        }
      ],
      messages: [message],
      media: [mediaArtifact],
      features: {
        canAnalyzeMedia: features.canAnalyzeMedia,
        canUseEnhancedAnalysis: features.canUseEnhancedAnalysis
      }
    });
  } catch (error) {
    const msg = (error as Error).message || 'Failed to import media';
    logError('import_media_error', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

