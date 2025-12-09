import { NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/rateLimit';
import { logError, logInfo, logWarn } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_AUDIO_BYTES = 12 * 1024 * 1024; // ~12MB voice notes

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!(await checkRateLimit(`transcribe:${ip}`, RATE_LIMIT_MAX_REQUESTS))) {
      logError('rate_limit_exceeded', { ip, endpoint: 'transcribe' });
      return NextResponse.json(
        { error: 'Too many transcription requests. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { blobUrl, fileName, contentType } = body as {
      blobUrl?: string;
      fileName?: string;
      contentType?: string | null;
    };

    if (!blobUrl || !fileName) {
      return NextResponse.json({ error: 'blobUrl and fileName are required' }, { status: 400 });
    }

    const isAudio = contentType?.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|opus|m4a|webm)$/i);
    if (!isAudio) {
      return NextResponse.json({ error: 'Only audio files can be transcribed.' }, { status: 400 });
    }

    const audioResp = await fetch(blobUrl);
    if (!audioResp.ok) {
      throw new Error(`Failed to fetch audio: ${audioResp.status}`);
    }
    const buffer = await audioResp.arrayBuffer();
    if (buffer.byteLength > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio too large for transcription (max ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))}MB).` },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logWarn('transcribe_missing_api_key');
      return NextResponse.json(
        { error: 'Transcription unavailable. Set OPENAI_API_KEY to enable voice-to-text.' },
        { status: 501 }
      );
    }

    const file = new File([buffer], fileName, { type: contentType || 'audio/webm' });
    const form = new FormData();
    form.append('file', file);
    form.append('model', 'whisper-1');
    form.append('response_format', 'text');

    const openaiResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      logError('transcribe_failed', { status: openaiResp.status, errText: errText.slice(0, 200) });
      return NextResponse.json(
        { error: 'Transcription failed. Please try again later.' },
        { status: 500 }
      );
    }

    const transcript = await openaiResp.text();

    logInfo('transcribe_success', { fileName, size: buffer.byteLength });
    return NextResponse.json({ transcript });
  } catch (error) {
    const msg = (error as Error).message || 'Transcription failed';
    logError('transcribe_error', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}











