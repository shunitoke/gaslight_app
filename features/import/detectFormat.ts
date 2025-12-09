import type { SupportedPlatform } from './types';
import { logInfo, logWarn } from '../../lib/telemetry';

/**
 * Platform detection patterns based on official documentation
 */
interface PlatformPattern {
  platform: SupportedPlatform;
  // JSON structure patterns
  jsonPatterns?: {
    requiredFields?: string[];
    optionalFields?: string[];
    arrayField?: string; // e.g., "messages"
    messageStructure?: {
      requiredFields?: string[];
      optionalFields?: string[];
    };
  };
  // Text format patterns (regex)
  textPatterns?: RegExp[];
  // File name patterns
  fileNamePatterns?: RegExp[];
  // Content type patterns
  contentTypePatterns?: string[];
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: 'telegram',
    jsonPatterns: {
      arrayField: 'messages',
      messageStructure: {
        requiredFields: ['date', 'from'],
        optionalFields: ['text', 'message', 'photo', 'video', 'audio', 'document', 'sticker', 'media_type', 'date_unixtime', 'from_id']
      }
    },
    fileNamePatterns: [/telegram/i, /tg/i, /\.json$/i],
    contentTypePatterns: ['application/json']
  },
  {
    platform: 'whatsapp',
    textPatterns: [
      // DD/MM/YYYY, HH:MM - Sender: Message
      /^\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4},\s*\d{1,2}:\d{2}(?:\s*(AM|PM))?\s*-\s*[^:]+:\s*.+/m,
      // DD.MM.YYYY, HH:MM - Sender: Message (European format)
      /^\d{1,2}\.\d{1,2}\.\d{4},\s*\d{1,2}:\d{2}\s*-\s*[^:]+:\s*.+/m
    ],
    fileNamePatterns: [/whatsapp/i, /wa/i, /chat/i, /\.txt$/i, /\.zip$/i],
    contentTypePatterns: ['text/plain', 'application/zip', 'application/x-zip-compressed']
  },
  {
    platform: 'signal',
    jsonPatterns: {
      arrayField: 'messages',
      messageStructure: {
        requiredFields: ['sent_at', 'source'],
        optionalFields: ['body', 'text', 'attachments', 'timestamp', 'contact_name', 'source_name', 'type']
      }
    },
    fileNamePatterns: [/signal/i, /\.json$/i],
    contentTypePatterns: ['application/json']
  },
  {
    platform: 'discord',
    jsonPatterns: {
      arrayField: 'messages',
      messageStructure: {
        requiredFields: ['timestamp', 'author'],
        optionalFields: ['content', 'body', 'id', 'channel_id', 'guild_id', 'attachments', 'timestamp_ms', 'type']
      }
    },
    fileNamePatterns: [/discord/i, /\.json$/i],
    contentTypePatterns: ['application/json']
  },
  {
    platform: 'messenger',
    jsonPatterns: {
      arrayField: 'messages',
      messageStructure: {
        requiredFields: ['sender_name', 'timestamp_ms'],
        optionalFields: ['content', 'message', 'photos', 'videos', 'audio_files', 'files', 'type', 'timestamp']
      }
    },
    fileNamePatterns: [/messenger/i, /facebook/i, /fb/i, /\.json$/i],
    contentTypePatterns: ['application/json']
  },
  {
    platform: 'imessage',
    jsonPatterns: {
      arrayField: 'items',
      messageStructure: {
        requiredFields: ['properties'],
        optionalFields: ['type']
      }
    },
    textPatterns: [
      // Similar to WhatsApp but can also be plain text
      /^\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4},\s*\d{1,2}:\d{2}(?:\s*(AM|PM))?\s*-\s*[^:]+:\s*.+/m
    ],
    fileNamePatterns: [/imessage/i, /sms/i, /messages/i, /\.json$/i, /\.txt$/i],
    contentTypePatterns: ['application/json', 'text/plain']
  },
  {
    platform: 'viber',
    textPatterns: [
      // Similar to WhatsApp
      /^\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4},\s*\d{1,2}:\d{2}\s*-\s*[^:]+:\s*.+/m
    ],
    fileNamePatterns: [/viber/i, /\.txt$/i],
    contentTypePatterns: ['text/plain']
  },
  {
    platform: 'generic',
    // Generic fallback - matches any text file with basic conversation patterns
    textPatterns: [
      /^[^:]+:\s*.+/m, // "Name: message" pattern
      /^\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}/m // Date pattern
    ],
    fileNamePatterns: [/\.txt$/i, /\.json$/i],
    contentTypePatterns: ['text/plain', 'application/json']
  }
];

/**
 * Detect file format and platform from file content
 */
export async function detectFileFormat(
  fileContent: string | ArrayBuffer,
  fileName: string,
  contentType?: string
): Promise<{
  platform: SupportedPlatform | null;
  format: 'json' | 'text' | 'zip' | null;
  confidence: number; // 0-1
}> {
  let textContent: string;
  let isZip = false;

  // Check if it's a ZIP file
  if (fileContent instanceof ArrayBuffer) {
    const uint8Array = new Uint8Array(fileContent);
    // ZIP file signature: PK (0x50 0x4B)
    if (uint8Array.length >= 2 && uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
      isZip = true;
      // For ZIP files, we'll need to extract and check contents
      // For now, assume WhatsApp if it's a ZIP
      if (fileName.toLowerCase().includes('whatsapp') || fileName.toLowerCase().includes('wa')) {
        return {
          platform: 'whatsapp',
          format: 'zip',
          confidence: 0.9
        };
      }
      // Generic ZIP - could be WhatsApp or other
      return {
        platform: 'whatsapp', // Most common case
        format: 'zip',
        confidence: 0.6
      };
    }
    // Try to decode as text
    try {
      const decoder = new TextDecoder('utf-8');
      textContent = decoder.decode(fileContent);
    } catch {
      return {
        platform: null,
        format: null,
        confidence: 0
      };
    }
  } else {
    textContent = fileContent;
  }

  // Try JSON first
  let jsonData: any = null;
  try {
    jsonData = JSON.parse(textContent);
  } catch {
    // Not JSON, continue with text analysis
  }

  const scores: Array<{ platform: SupportedPlatform; score: number }> = [];

  // Helper: score a root-level JSON array (Telegram-like or generic array)
  const scoreRootArray = (arr: any[]): Array<{ platform: SupportedPlatform; score: number }> => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const first = arr[0] || {};
    let telegramScore = 0;
    let genericScore = 0;

    // Telegram-ish fields
    const hasFrom = typeof first.from === 'string' || typeof first.from_id === 'string';
    const hasText = typeof first.text === 'string' || typeof first.message === 'string' || typeof first.content === 'string';
    const hasDate =
      typeof first.date === 'string' ||
      typeof first.date_unixtime === 'string' ||
      typeof first.timestamp === 'string' ||
      typeof first.timestamp_ms === 'number';

    if (hasFrom) telegramScore += 0.25;
    if (hasText) telegramScore += 0.25;
    if (hasDate) telegramScore += 0.25;
    // bonus if id present
    if (first.id !== undefined) telegramScore += 0.15;

    // Generic array: any sender/text pair
    if (hasFrom && hasText) genericScore += 0.6;
    if (hasDate) genericScore += 0.2;

    const results: Array<{ platform: SupportedPlatform; score: number }> = [];
    if (telegramScore > 0.3) results.push({ platform: 'telegram', score: Math.min(telegramScore, 0.9) });
    if (genericScore > 0.3) results.push({ platform: 'generic', score: Math.min(genericScore, 0.8) });
    return results;
  };

  for (const pattern of PLATFORM_PATTERNS) {
    let score = 0;
    const maxScore = 10;

    // Check file name patterns
    if (pattern.fileNamePatterns) {
      for (const fileNamePattern of pattern.fileNamePatterns) {
        if (fileNamePattern.test(fileName)) {
          score += 2;
          break;
        }
      }
    }

    // Check content type
    if (contentType && pattern.contentTypePatterns) {
      if (pattern.contentTypePatterns.includes(contentType)) {
        score += 1;
      }
    }

    // Check JSON structure
    if (jsonData && pattern.jsonPatterns) {
      const jsonPattern = pattern.jsonPatterns;
      
      // Check for array field
      if (jsonPattern.arrayField && Array.isArray(jsonData[jsonPattern.arrayField])) {
        score += 3;
        
        const messages = jsonData[jsonPattern.arrayField];
        if (messages.length > 0) {
          const firstMessage = messages[0];
          
          // Check required fields in message structure
          if (jsonPattern.messageStructure?.requiredFields) {
            const hasAllRequired = jsonPattern.messageStructure.requiredFields.every(
              field => firstMessage.hasOwnProperty(field)
            );
            if (hasAllRequired) {
              score += 3;
            } else {
              // Partial match
              const hasSomeRequired = jsonPattern.messageStructure.requiredFields.some(
                field => firstMessage.hasOwnProperty(field)
              );
              if (hasSomeRequired) {
                score += 1;
              }
            }
          }
          
          // Check optional fields (bonus points)
          if (jsonPattern.messageStructure?.optionalFields) {
            const hasOptional = jsonPattern.messageStructure.optionalFields.filter(
              field => firstMessage.hasOwnProperty(field)
            ).length;
            score += Math.min(hasOptional * 0.5, 1);
          }
        }
      }
      
      // Check for required fields at root level
      if (jsonPattern.requiredFields) {
        const hasRequired = jsonPattern.requiredFields.every(
          field => jsonData.hasOwnProperty(field)
        );
        if (hasRequired) {
          score += 1;
        }
      }
    }

    // Check text patterns
    if (!jsonData && pattern.textPatterns) {
      for (const textPattern of pattern.textPatterns) {
        if (textPattern.test(textContent)) {
          score += 4;
          // Count matches for higher confidence
          const matches = textContent.match(textPattern);
          if (matches && matches.length > 5) {
            score += 1;
          }
          break;
        }
      }
    }

    if (score > 0) {
      scores.push({
        platform: pattern.platform,
        score: score / maxScore
      });
    }
  }

  // Additional scoring for root-level arrays (not covered above)
  if (Array.isArray(jsonData)) {
    scores.push(...scoreRootArray(jsonData));
  }

  // Sort by score and return best match
  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0 || scores[0].score < 0.3) {
    logWarn('format_detection_low_confidence', {
      fileName,
      contentType,
      scores: scores.map(s => ({ platform: s.platform, score: s.score }))
    });
    return {
      platform: null,
      format: jsonData ? 'json' : isZip ? 'zip' : 'text',
      confidence: scores[0]?.score || 0
    };
  }

  const bestMatch = scores[0];
  const format = jsonData ? 'json' : isZip ? 'zip' : 'text';

  logInfo('format_detected', {
    fileName,
    platform: bestMatch.platform,
    format,
    confidence: bestMatch.score,
    allScores: scores.map(s => ({ platform: s.platform, score: s.score }))
  });

  return {
    platform: bestMatch.platform,
    format,
    confidence: bestMatch.score
  };
}


