import { getConfig } from './config';
import { logError, logInfo } from './telemetry';
import type { MediaArtifact } from '../features/analysis/types';

type VisionRequest = {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >;
  }>;
  max_tokens?: number;
  temperature?: number;
};

type VisionResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

/**
 * Analyze an image using OpenRouter vision model.
 * @param imageUrl Base64 data URL or public URL of the image
 * @param prompt Text prompt describing what to analyze
 * @returns Analysis result with labels, sentiment, and description
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
    if (!config.visionModel) {
      throw new Error('Vision model is not configured (GASLIGHT_VISION_MODEL missing).');
    }
    if (config.visionModel === config.textModel) {
      throw new Error(
        `Vision model is misconfigured: GASLIGHT_VISION_MODEL equals GASLIGHT_TEXT_MODEL (${config.visionModel}). Choose a vision-capable model that supports image_url.`
      );
    }

    const request: VisionRequest = {
      model: config.visionModel,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an OCR extractor. Extract ONLY readable text from the provided image (including chat bubbles, captions, UI text). Return JSON with shape {"text": "<all text you found>"}; keep original line order where possible. Do NOT summarize, do NOT add interpretation, do NOT add extra fields.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    logInfo('vision_request', { model: config.visionModel, url: config.openrouterBaseUrl });

    const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openrouterApiKey}`
      },
      body: JSON.stringify(request),
      cache: 'no-store'
    });

    if (!response.ok) {
      const text = await response.text();
      logError('vision_error', {
        status: response.status,
        body: text.slice(0, 800),
        model: config.visionModel
      });
      throw new Error(`Vision API request failed (${response.status})`);
    }

    const json = (await response.json()) as VisionResponse;
    const content = json.choices[0]?.message?.content || '{}';

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






