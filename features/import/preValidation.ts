import { callLLM } from '../../lib/llmClient';
import { getConfig } from '../../lib/config';
import { logInfo, logError, logWarn } from '../../lib/telemetry';

/**
 * Pre-validation: Check if file content looks like a conversation
 * Uses AI to analyze a sample of the file and determine if it's conversation-like
 */
export async function validateConversationFormat(
  fileContent: string | ArrayBuffer,
  fileName: string,
  platform: string | null
): Promise<{
  isValid: boolean;
  confidence: number; // 0-1
  reason?: string;
}> {
  let textSample: string;

  // Extract text sample for analysis
  if (fileContent instanceof ArrayBuffer) {
    // For binary files (ZIP), we can't easily sample
    // For now, assume ZIP files are valid if they're from known platforms
    if (platform && ['whatsapp'].includes(platform)) {
      return {
        isValid: true,
        confidence: 0.8,
        reason: 'ZIP file from known messaging platform'
      };
    }
    return {
      isValid: false,
      confidence: 0.3,
      reason: 'Binary file format not recognized as conversation export'
    };
  }

  // Get a sample of the content (first 2000 characters)
  textSample = fileContent.substring(0, 2000);
  
  // If it's JSON, try to extract a readable sample
  try {
    const jsonData = JSON.parse(fileContent);
    if (jsonData.messages && Array.isArray(jsonData.messages)) {
      // Extract first few messages as text
      const messages = jsonData.messages.slice(0, 5);
      textSample = messages.map((msg: any) => {
        const sender = msg.from || msg.sender_name || msg.author?.name || msg.source || 'Unknown';
        const text = msg.text || msg.message || msg.content || msg.body || '';
        const date = msg.date || msg.timestamp || msg.timestamp_ms || msg.sent_at || '';
        return `[${date}] ${sender}: ${text}`;
      }).join('\n');
    } else if (jsonData.items && Array.isArray(jsonData.items)) {
      // iMessage format
      const items = jsonData.items.slice(0, 5);
      textSample = items.map((item: any) => {
        const props = item.properties || {};
        const author = props.author?.[0] || {};
        const authorName = author.properties?.name?.[0] || author.value || 'Unknown';
        const content = props.content?.[0] || props.name?.[0] || '';
        const text = typeof content === 'string' ? content : content.value || content.html || '';
        return `${authorName}: ${text}`;
      }).join('\n');
    }
  } catch {
    // Not JSON, use text sample as-is
  }

  // If sample is too short or empty, reject
  if (!textSample || textSample.trim().length < 20) {
    return {
      isValid: false,
      confidence: 0.1,
      reason: 'File content too short or empty'
    };
  }

  // Use AI to validate if this looks like a conversation
  try {
    const config = getConfig();
    if (!config.openrouterApiKey) {
      // If no API key, fall back to basic heuristics
      return validateWithHeuristics(textSample);
    }

    const systemPrompt = `You are a file format validator. Your task is to determine if a file sample looks like a conversation/messaging export.

A valid conversation export should contain:
- Multiple messages from different participants (names/senders)
- Message content/text (replies, messages)
- Sender/author information

IMPORTANT: Timestamps/dates are OPTIONAL. A file is valid if it has:
- Participant names and their messages/replies
- Multiple exchanges between participants
- Conversation-like structure (back-and-forth dialogue)

Return ONLY a JSON object with this structure:
{
  "isValid": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

    const userPrompt = `Analyze this file sample and determine if it looks like a conversation export (chat messages between people):

File name: ${fileName}
Platform hint: ${platform || 'unknown'}

Sample content:
${textSample}

Is this a valid conversation export? Look for:
- Names/participants and their messages
- Multiple exchanges between people
- Conversation-like dialogue structure

Timestamps are NOT required - focus on participant names and message content.`;

    const response = await callLLM({
      model: config.textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const content = response?.choices?.[0]?.message?.content || '';
    
    // Try to extract JSON from response
    let validationResult: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fall back to heuristics if AI response is invalid
      logWarn('ai_validation_parse_error', {
        fileName,
        responsePreview: content.substring(0, 200)
      });
      return validateWithHeuristics(textSample);
    }

    logInfo('ai_validation_complete', {
      fileName,
      isValid: validationResult.isValid,
      confidence: validationResult.confidence,
      reason: validationResult.reason
    });

    return {
      isValid: validationResult.isValid === true,
      confidence: typeof validationResult.confidence === 'number' 
        ? Math.max(0, Math.min(1, validationResult.confidence))
        : 0.5,
      reason: validationResult.reason || 'AI validation'
    };
  } catch (error) {
    logError('ai_validation_error', {
      fileName,
      error: (error as Error).message
    });
    // Fall back to heuristics
    return validateWithHeuristics(textSample);
  }
}

/**
 * Fallback validation using heuristics when AI is unavailable
 * More lenient - focuses on participant names and messages, not timestamps
 */
function validateWithHeuristics(textSample: string): {
  isValid: boolean;
  confidence: number;
  reason: string;
} {
  // Check for common conversation patterns
  // Priority: participant names + messages (most important)
  const highPriorityPatterns = [
    // Sender: message patterns (Name: message)
    /[^:\n]{1,40}:\s*.+/,
    // JSON message arrays
    /"messages"\s*:\s*\[/,
    /"items"\s*:\s*\[/,
    // Multiple lines that look like messages (name followed by text)
    /^[^:\n]+:\s*.+\n[^:\n]+:\s*.+/m
  ];

  // Optional patterns (nice to have but not required)
  const optionalPatterns = [
    // Timestamp patterns
    /\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}/,
    // Common messaging keywords
    /\b(message|chat|conversation|sender|author|timestamp|date)\b/i
  ];

  let highPriorityMatches = 0;
  for (const pattern of highPriorityPatterns) {
    if (pattern.test(textSample)) {
      highPriorityMatches++;
    }
  }

  let optionalMatches = 0;
  for (const pattern of optionalPatterns) {
    if (pattern.test(textSample)) {
      optionalMatches++;
    }
  }

  // If we have high priority patterns (names + messages), it's likely a conversation
  // Even without timestamps
  const hasConversationStructure = highPriorityMatches > 0;
  const confidence = hasConversationStructure 
    ? Math.min(0.5 + (highPriorityMatches * 0.2) + (optionalMatches * 0.1), 1)
    : Math.min((highPriorityMatches + optionalMatches) / (highPriorityPatterns.length + optionalPatterns.length), 0.4);
  
  // Very lenient threshold - accept if we have any conversation-like structure or even basic patterns
  const isValid = confidence >= 0.1 || hasConversationStructure || highPriorityMatches > 0;

  return {
    isValid,
    confidence,
    reason: `Heuristic validation: ${highPriorityMatches} high-priority patterns, ${optionalMatches} optional patterns matched`
  };
}

