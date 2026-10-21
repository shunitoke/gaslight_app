import { createHash } from 'node:crypto';

import { getConfig } from './config';
import { callGigaChat, uploadGigaChatFile } from './gigachat';
import { logError, logInfo } from './telemetry';
import type { MediaArtifact } from '../features/analysis/types';

/** Uploaded-file cache: same screenshot re-analysed twice must not be re-uploaded. */
const FILE_CACHE_LIMIT = 50;
const fileCache = new Map<string, string>();

function rememberFile(key: string, fileId: string): void {
  if (fileCache.size >= FILE_CACHE_LIMIT) {
    const oldest = fileCache.keys().next().value;
    if (oldest) fileCache.delete(oldest);
  }
  fileCache.set(key, fileId);
}

type ImagePayload = { data: Buffer; filename: string; contentType: string };

const DATA_URL_RE = /^data:([^;,]+)?(;base64)?,(.*)$/s;

async function toImagePayload(imageUrl: string): Promise<ImagePayload> {
  const dataUrlMatch = imageUrl.match(DATA_URL_RE);
  if (dataUrlMatch) {
    const contentType = dataUrlMatch[1] || 'image/jpeg';
    const isBase64 = Boolean(dataUrlMatch[2]);
    const raw = dataUrlMatch[3];
    const data = isBase64
      ? Buffer.from(raw, 'base64')
      : Buffer.from(decodeURIComponent(raw), 'utf8');
    return {
      data,
      filename: `image.${contentType.split('/')[1] || 'jpg'}`,
      contentType
    };
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    const res = await fetch(imageUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to download image for vision (${res.status})`);
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const data = Buffer.from(await res.arrayBuffer());
    return {
      data,
      filename: `image.${contentType.split('/')[1]?.split(';')[0] || 'jpg'}`,
      contentType: contentType.split(';')[0]
    };
  }

  throw new Error('Unsupported image reference: expected a data URL or http(s) URL');
}

/**
 * Analyze an image with one of the GigaChat multimodal models.
 * GigaChat takes images as uploaded file ids (`attachments`), not as inline
 * `image_url` parts, so the image is uploaded once and cached by content hash.
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string = 'Extract all readable text from the image. Return only plain text from OCR (including chat bubbles, captions, screenshots). If no text, return an empty string.'
): Promise<{
  labels: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  description: string;
  notes?: string;
}> {
  const config = getConfig();

  try {
    const image = await toImagePayload(imageUrl);
    const hash = createHash('sha256').update(image.data).digest('hex');

    let fileId = fileCache.get(hash);
    if (!fileId) {
      fileId = await uploadGigaChatFile(image.data, image.filename, image.contentType);
      rememberFile(hash, fileId);
    }

    logInfo('vision_request', {
      model: config.visionModel,
      baseUrl: config.llmBaseUrl,
      bytes: image.data.length
    });

    const response = await callGigaChat({
      models: [config.visionModel, config.textModel].filter(
        (m, i, arr) => Boolean(m) && arr.indexOf(m) === i
      ),
      messages: [
        {
          role: 'system',
          content:
            'You are an OCR extractor. Extract ONLY readable text from the provided image (including chat bubbles, captions, UI text). Return JSON with shape {"text": "<all text you found>"}; keep original line order where possible. Do NOT summarize, do NOT add interpretation, do NOT add extra fields.'
        },
        {
          role: 'user',
          content: prompt,
          attachments: [fileId]
        }
      ],
      max_tokens: 500,
      temperature: 0.2
    });

    const content = response.choices?.[0]?.message?.content || '{}';

    // Try to parse JSON from response
    let parsed: { text?: string };
    try {
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      parsed = { text: content };
    }

    const text = (parsed.text || '').toString().trim();
    logInfo('vision_success', { textLength: text.length });

    return {
      labels: [],
      sentiment: 'unknown',
      description: text,
      notes: undefined
    };
  } catch (error) {
    logError('vision_exception', { message: (error as Error).message });
    // Return safe defaults
    return {
      labels: [],
      sentiment: 'unknown',
      description: 'Image analysis failed',
      notes: (error as Error).message
    };
  }
}

/**
 * Analyze a media artifact and extract labels, sentiment, and context.
 */
export async function analyzeMediaArtifact(
  artifact: MediaArtifact,
  imageDataUrl?: string
): Promise<{
  labels: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  description: string;
  notes?: string;
}> {
  if (artifact.type === 'image' || artifact.type === 'sticker' || artifact.type === 'gif') {
    if (imageDataUrl) {
      return analyzeImage(imageDataUrl);
    }
    // Try to fetch from Blob URL if available
    if (artifact.blobUrl) {
      const { getMediaFromBlob } = await import('./blob');
      const mediaBlob = await getMediaFromBlob(artifact.blobUrl);
      if (mediaBlob) {
        const dataUrl = await fileToDataUrl(mediaBlob);
        return analyzeImage(dataUrl);
      }
    }
    // Fallback to transientPathOrUrl (deprecated)
    if (artifact.transientPathOrUrl) {
      return analyzeImage(artifact.transientPathOrUrl);
    }
  }

  // For non-image media, return defaults
  logInfo('media_skipped', { type: artifact.type, reason: 'not_image' });
  return {
    labels: [],
    sentiment: 'unknown',
    description: `Media type ${artifact.type} not yet analyzed`,
    notes: 'Only images, stickers, and GIFs are currently analyzed'
  };
}

/**
 * Convert a file/blob to base64 data URL for vision API.
 */
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
