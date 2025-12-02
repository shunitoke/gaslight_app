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
  prompt: string = 'Analyze this image and describe its content, emotional tone, and any text visible. Focus on how it might relate to interpersonal communication patterns.'
): Promise<{
  labels: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  description: string;
  notes?: string;
}> {
  const config = getConfig();

  try {
    const request: VisionRequest = {
      model: config.visionModel,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an image analysis assistant. Analyze images for emotional content, visible text, and context that might relate to relationship communication patterns. Return a JSON object with: labels (array of strings), sentiment (positive/neutral/negative/unknown), description (string), and optional notes (string).'
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
      logError('vision_error', { status: response.status, body: text });
      throw new Error(`Vision API request failed (${response.status})`);
    }

    const json = (await response.json()) as VisionResponse;
    const content = json.choices[0]?.message?.content || '{}';

    // Try to parse JSON from response
    let parsed: {
      labels?: string[];
      sentiment?: string;
      description?: string;
      notes?: string;
    };
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      // Fallback: extract from text
      parsed = {
        labels: [],
        sentiment: 'unknown',
        description: content,
        notes: 'Could not parse structured response'
      };
    }

    logInfo('vision_success', { labelsCount: parsed.labels?.length || 0 });

    return {
      labels: parsed.labels || [],
      sentiment: (parsed.sentiment as 'positive' | 'neutral' | 'negative' | 'unknown') || 'unknown',
      description: parsed.description || content,
      notes: parsed.notes
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
    if (!imageDataUrl && artifact.transientPathOrUrl) {
      // Use the transient URL if available
      return analyzeImage(artifact.transientPathOrUrl);
    }
    if (imageDataUrl) {
      return analyzeImage(imageDataUrl);
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






