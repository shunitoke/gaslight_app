import type {
  Conversation,
  Message,
  AnalysisResult,
  AnalysisSection,
  MediaArtifact,
  Participant,
  ParticipantProfile,
  ImportantDate
} from './types';
import type { SupportedLocale } from '../i18n/types';
import { getConfig } from '../../lib/config';
import { callLLM, type LLMResponse } from '../../lib/llmClient';
import { logError, logInfo, logWarn } from '../../lib/telemetry';
import { analyzeMediaArtifact } from '../../lib/vision';
import { getSystemPrompt, getUserPrompt } from './prompts';
import { normalizeAnalysisResult } from './validation';

/**
 * Get language instruction for response language (helper for final analysis)
 */
function getLanguageInstruction(locale: SupportedLocale): string {
  const languageMap: Record<SupportedLocale, string> = {
    en: 'English',
    ru: 'Russian',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese'
  };
  return languageMap[locale] || 'English';
}
import { updateProgress as updateProgressDirect } from '../../lib/progress';

const ANALYSIS_VERSION = '1.0.0';

/**
 * Get translated default messages for analysis results
 */
/**
 * Extract overview summary text from potentially nested object/string
 */
function extractOverviewSummaryText(value: any): string | null {
  if (!value) return null;
  
  // If it's already a string, return it
  if (typeof value === 'string') {
    return value.trim();
  }
  
  // If it's an object, try to extract the string value
  if (typeof value === 'object' && value !== null) {
    if ('overviewSummary' in value && typeof value.overviewSummary === 'string') {
      return value.overviewSummary.trim();
    }
  }
  
  return null;
}

/**
 * Clean overview summary text from JSON artifacts that might have leaked in
 */
function cleanOverviewSummaryFromJson(text: string): string {
  let cleaned = text.trim();
  
  // Remove JSON field names with numeric values (scores)
  cleaned = cleaned.replace(/"\w+"\s*:\s*[0-9.]+/gi, '');
  
  // Remove sections array start
  cleaned = cleaned.replace(/"sections"\s*:\s*\[/gi, '');
  
  // Remove trailing commas and braces
  cleaned = cleaned.replace(/,\s*\{/g, '');
  cleaned = cleaned.replace(/^\s*,\s*/g, '');
  
  return cleaned.trim();
}

/**
 * Normalize section ID to handle variations (e.g., "supportiveness" vs "support")
 */
function normalizeSectionId(id: string, title: string): string {
  const normalizedId = id.toLowerCase().trim();
  const normalizedTitle = title.toLowerCase().trim();
  
  // Map common variations to standard IDs
  const idMappings: Record<string, string> = {
    'support': 'supportiveness',
    'supportive': 'supportiveness',
    'supportive_behavior': 'supportiveness',
    'supportive_behaviour': 'supportiveness',
    'conflict': 'conflict',
    'conflicts': 'conflict',
    'conflict_intensity': 'conflict',
    'gaslighting': 'gaslighting',
    'gaslight': 'gaslighting',
    'gaslighting_risk': 'gaslighting',
    'apology': 'apology',
    'apologies': 'apology',
    'apology_frequency': 'apology',
    'communication': 'communication',
    'communication_patterns': 'communication',
    'trust': 'trust',
    'trust_issues': 'trust',
    'boundaries': 'boundaries',
    'boundary': 'boundaries',
    'respect': 'respect',
    'validation': 'validation',
    'emotional_support': 'supportiveness',
    'empathy': 'supportiveness',
  };
  
  // Check if ID matches a known variation
  if (idMappings[normalizedId]) {
    return idMappings[normalizedId];
  }
  
  // Check if title contains keywords that suggest a known section type
  if (normalizedTitle.includes('support') || normalizedTitle.includes('поддержк')) {
    return 'supportiveness';
  }
  if (normalizedTitle.includes('conflict') || normalizedTitle.includes('конфликт')) {
    return 'conflict';
  }
  if (normalizedTitle.includes('gaslight') || normalizedTitle.includes('газлайт')) {
    return 'gaslighting';
  }
  if (normalizedTitle.includes('apolog') || normalizedTitle.includes('извинен')) {
    return 'apology';
  }
  
  // Return original ID if no mapping found
  return normalizedId;
}

function getDefaultMessages(locale: SupportedLocale): {
  defaultOverview: string;
  defaultNoPatterns: string;
  defaultTitle: string;
  parseError: string;
} {
  const messages: Record<SupportedLocale, {
    defaultOverview: string;
    defaultNoPatterns: string;
    defaultTitle: string;
    parseError: string;
  }> = {
    en: {
      defaultOverview: 'Analysis completed. Review sections for detailed insights.',
      defaultNoPatterns: 'Analysis completed. No specific patterns detected in this excerpt.',
      defaultTitle: 'Analysis',
      parseError: 'Analysis completed with partial results due to parsing error.'
    },
    ru: {
      defaultOverview: 'Анализ завершен. Просмотрите разделы для подробных выводов.',
      defaultNoPatterns: 'Анализ завершен. В этом отрывке не обнаружено конкретных паттернов.',
      defaultTitle: 'Анализ',
      parseError: 'Анализ завершен с частичными результатами из-за ошибки парсинга.'
    },
    fr: {
      defaultOverview: 'Analyse terminée. Consultez les sections pour des informations détaillées.',
      defaultNoPatterns: 'Analyse terminée. Aucun modèle spécifique détecté dans cet extrait.',
      defaultTitle: 'Analyse',
      parseError: 'Analyse terminée avec des résultats partiels en raison d\'une erreur d\'analyse.'
    },
    de: {
      defaultOverview: 'Analyse abgeschlossen. Überprüfen Sie die Abschnitte für detaillierte Einblicke.',
      defaultNoPatterns: 'Analyse abgeschlossen. Keine spezifischen Muster in diesem Auszug erkannt.',
      defaultTitle: 'Analyse',
      parseError: 'Analyse mit teilweisen Ergebnissen abgeschlossen aufgrund eines Parsing-Fehlers.'
    },
    es: {
      defaultOverview: 'Análisis completado. Revise las secciones para obtener información detallada.',
      defaultNoPatterns: 'Análisis completado. No se detectaron patrones específicos en este extracto.',
      defaultTitle: 'Análisis',
      parseError: 'Análisis completado con resultados parciales debido a un error de análisis.'
    },
    pt: {
      defaultOverview: 'Análise concluída. Revise as seções para obter insights detalhados.',
      defaultNoPatterns: 'Análise concluída. Nenhum padrão específico detectado neste trecho.',
      defaultTitle: 'Análise',
      parseError: 'Análise concluída com resultados parciais devido a um erro de análise.'
    }
  };
  
  return messages[locale] || messages.en;
}


/**
 * Chunk messages for LLM processing (respect token limits).
 * Larger chunks = fewer API calls = less rate limiting risk.
 * We also hard-cap the total number of chunks for very large conversations
 * to avoid hammering the underlying LLM provider with hundreds of requests.
 */
function chunkMessages(
  messages: Message[],
  maxChunkSize: number = 1000,
  maxChunks: number = 25
): Message[][] {
  const rawChunks: Message[][] = [];
  for (let i = 0; i < messages.length; i += maxChunkSize) {
    rawChunks.push(messages.slice(i, i + maxChunkSize));
  }

  if (rawChunks.length <= maxChunks) {
    return rawChunks;
  }

  // For extremely large conversations, sample a fixed number of chunks
  // distributed across the entire timeline. This keeps analysis tractable
  // and within rate limits while still capturing patterns over time.
  const sampledChunks: Message[][] = [];
  const step = rawChunks.length / maxChunks;
  for (let i = 0; i < maxChunks; i++) {
    const index = Math.floor(i * step);
    sampledChunks.push(rawChunks[index]);
  }

  return sampledChunks;
}

/**
 * Format messages for LLM context, including media context.
 */
function formatMessagesForLLM(
  messages: Message[],
  mediaArtifacts: MediaArtifact[],
  participants: Participant[] = []
): string {
  // Create a map of senderId to displayName
  const participantMap = new Map<string, string>();
  participants.forEach(p => {
    participantMap.set(p.id, p.displayName);
  });
  
  return messages
    .map((msg) => {
      const date = new Date(msg.sentAt).toLocaleDateString();
      let text = msg.text || '';
      
      // Add media context if message has media
      if (msg.mediaArtifactId) {
        const media = mediaArtifacts.find(m => m.id === msg.mediaArtifactId);
        if (media) {
          const mediaContext = media.labels && media.labels.length > 0
            ? ` [${media.type}: ${media.labels.join(', ')}${media.sentimentHint !== 'unknown' ? `, ${media.sentimentHint}` : ''}]`
            : ` [${media.type}]`;
          text += mediaContext;
        } else {
          text += ' [media/attachment]';
        }
      }
      
      // Use display name if available, otherwise use senderId
      const senderName = participantMap.get(msg.senderId) || msg.senderId;
      
      return `[${date}] ${senderName}: ${text}`;
    })
    .join('\n');
}

/**
 * Update analysis progress (helper function)
 * Uses direct function call instead of fetch for reliability in serverless environments
 */
async function updateProgress(
  conversationId: string,
  updates: {
    status?: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    error?: string;
  }
) {
  // Use direct function call instead of fetch for better reliability
  // in serverless environments where baseUrl might be incorrect
  await updateProgressDirect(conversationId, updates);
}

/**
 * Analyze a single chunk of messages
 * Returns parsed analysis result for the chunk
 */
async function analyzeChunk(
  chunk: Message[],
  chunkIndex: number,
  totalChunks: number,
  conversationId: string,
  mediaArtifacts: MediaArtifact[],
  participants: Participant[],
  locale: SupportedLocale,
  enhancedAnalysis: boolean,
  progressId: string
): Promise<{
  parsed: {
    overviewSummary?: string;
    gaslightingRiskScore?: number;
    conflictIntensityScore?: number;
    supportivenessScore?: number;
    apologyFrequencyScore?: number;
    sections?: Array<{
      id?: string;
      title?: string;
      summary?: string;
      plainSummary?: string;
      score?: number | null;
      evidenceSnippets?: Array<{
        excerpt?: string;
        explanation?: string;
      }>;
    }>;
    participantProfiles?: Array<{
      participantId?: string;
      profile?: string;
      inferredGender?: 'male' | 'female' | 'neutral' | null;
    }>;
    importantDates?: Array<{
      date?: string;
      reason?: string;
      severity?: number;
      sectionId?: string;
      excerpt?: string;
    }>;
    // New analysis parts (for enhanced analysis)
    communicationStats?: any;
    promiseTracking?: any;
    redFlagCounts?: any;
    emotionalCycle?: string;
    timePatterns?: any;
    contradictions?: any[];
    realityCheck?: any;
    frameworkDiagnosis?: any;
    hardTruth?: any;
    whatYouShouldKnow?: any;
    closure?: any;
    safetyConcern?: any;
  };
}> {
  const formattedText = formatMessagesForLLM(chunk, mediaArtifacts, participants);
  
  logInfo('analysis_processing_chunk', {
    conversationId,
    chunkIndex: chunkIndex + 1,
    totalChunks,
    chunkSize: chunk.length
  });

  // Calculate base progress for this chunk
  const baseProgress = 20 + Math.floor((chunkIndex / totalChunks) * 70);
  const chunkProgressRange = Math.floor(70 / totalChunks);
  
  // Update progress: analyzing chunk (before LLM call)
  await updateProgress(progressId, {
    status: 'analyzing',
    progress: baseProgress,
    currentChunk: chunkIndex + 1,
    totalChunks,
    message: `Analyzing chunk ${chunkIndex + 1} of ${totalChunks}...`
  });
  
  logInfo('analysis_chunk_progress_updated', {
    conversationId,
    chunkIndex: chunkIndex + 1,
    totalChunks,
    baseProgress,
    chunkProgressRange
  });

  const systemPrompt = getSystemPrompt(locale, enhancedAnalysis);
  
  // Add media context to prompt if available (always in English since prompt is in English)
  const mediaContext = mediaArtifacts.length > 0
    ? `\n\nNote: This conversation includes ${mediaArtifacts.length} media items (images, stickers, GIFs, etc.). Some have been analyzed for content, sentiment, and labels. Media context is included in message formatting where available.`
    : '';
  
  const userPrompt = getUserPrompt(
    locale,
    chunk.length,
    mediaContext,
    formattedText,
    enhancedAnalysis
  );

  let response: LLMResponse | undefined;
  let content = '{}';
  let parseAttempts = 0;
  const maxParseAttempts = 2;
  let lastError: { message: string; isDailyLimit?: boolean; isRateLimit?: boolean; errorCode?: string } | null = null;
  
  logInfo('analysis_calling_llm', {
    conversationId,
    chunkIndex: chunkIndex + 1,
    totalChunks,
    attempt: parseAttempts + 1,
    chunkSize: chunk.length,
    formattedTextLength: formattedText.length
  });
  
  // Wrap LLM call with timeout to prevent infinite hangs
  const LLM_TIMEOUT_MS = 120000; // 2 minutes per chunk
  let llmCallCompleted = false;
  
  while (parseAttempts < maxParseAttempts) {
    try {
      logInfo('analysis_llm_request_start', {
        conversationId,
        chunkIndex: chunkIndex + 1,
        attempt: parseAttempts + 1,
        timeoutMs: LLM_TIMEOUT_MS
      });
      
      const llmStartTime = Date.now();
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (!llmCallCompleted) {
            reject(new Error(`LLM call timed out after ${LLM_TIMEOUT_MS}ms`));
          }
        }, LLM_TIMEOUT_MS);
      });
      
      // Race between LLM call and timeout
      // Note: We use non-streaming callLLM for now, but log activity for monitoring
      const llmCallPromise = callLLM({
        model: getConfig().textModel,
        messages: parseAttempts === 0 
          ? [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          : [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
              { role: 'assistant', content: response?.choices[0]?.message?.content || '' },
              { role: 'user', content: 'The JSON you returned was invalid or incomplete. Please return ONLY valid JSON that can be parsed by JSON.parse(). Ensure all quotes are escaped, all strings are closed, and all sections include at least 2 evidenceSnippets with actual quotes from the conversation.' }
            ],
        max_tokens: 4000,
        temperature: parseAttempts === 0 ? 0.7 : 0.3
      });
      
      // Log LLM activity start
      try {
        const { logLLMActivity } = await import('../../lib/llm-activity-logger');
        await logLLMActivity({
          timestamp: Date.now(),
          conversationId,
          chunkIndex: chunkIndex + 1,
          eventType: 'request_start',
          model: getConfig().textModel
        });
      } catch (e) {
        // Ignore activity logging errors
      }
      
      // Race LLM call against timeout
      response = await Promise.race([llmCallPromise, timeoutPromise]);
      llmCallCompleted = true;
      
      // Log LLM activity completion
      try {
        const { logLLMActivity } = await import('../../lib/llm-activity-logger');
        const responseContent = response?.choices?.[0]?.message?.content || '';
        await logLLMActivity({
          timestamp: Date.now(),
          conversationId,
          chunkIndex: chunkIndex + 1,
          eventType: 'request_complete',
          model: getConfig().textModel,
          data: {
            content: responseContent.substring(0, 500), // First 500 chars
            tokens: responseContent.length / 4, // Rough estimate
            duration: Date.now() - llmStartTime
          }
        });
      } catch (e) {
        // Ignore activity logging errors
      }
      
      const llmDuration = Date.now() - llmStartTime;
      const responseContent = response?.choices?.[0]?.message?.content || '';
      logInfo('analysis_llm_request_complete', {
        conversationId,
        chunkIndex: chunkIndex + 1,
        attempt: parseAttempts + 1,
        durationMs: llmDuration,
        hasResponse: !!response,
        hasChoices: !!response?.choices,
        choicesCount: response?.choices?.length || 0,
        responseLength: responseContent.length,
        responsePreview: responseContent.substring(0, 200),
        model: getConfig().textModel,
        usage: (response as any)?.usage ? {
          promptTokens: (response as any).usage.prompt_tokens,
          completionTokens: (response as any).usage.completion_tokens,
          totalTokens: (response as any).usage.total_tokens
        } : null
      });
      
      // Validate response structure
      if (!response || !response.choices || response.choices.length === 0) {
        logError('llm_no_response', {
          conversationId,
          chunkIndex: chunkIndex + 1,
          attempt: parseAttempts + 1,
          responseStatus: response ? 'present' : 'null',
          responseKeys: response ? Object.keys(response) : [],
          error: (response as any)?.error ? JSON.stringify((response as any).error) : null
        });
        parseAttempts++;
        if (parseAttempts >= maxParseAttempts) {
          break;
        }
        continue;
      }
      
      content = response.choices[0]?.message?.content || '{}';
      
      // Check if content is actually empty
      if (!content || content.trim().length === 0 || content === '{}') {
        logError('llm_empty_response', {
          conversationId,
          chunkIndex: chunkIndex + 1,
          attempt: parseAttempts + 1
        });
        parseAttempts++;
        if (parseAttempts >= maxParseAttempts) {
          break;
        }
        continue;
      }
      
      // Try to parse immediately - if successful, break the loop
      let jsonContent = content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      // Quick validation: try to parse
      try {
        JSON.parse(jsonContent.trim());
        // If parsing succeeds, break the loop
        break;
      } catch {
        // If parsing fails, continue to retry
        parseAttempts++;
        if (parseAttempts >= maxParseAttempts) {
          break;
        }
        continue;
      }
    } catch (llmError) {
      llmCallCompleted = true;
      const errorMessage = (llmError as Error).message;
      
      // Extract error code from OpenRouter error messages
      const errorCodeMatch = errorMessage.match(/\b(402|403|429|408|500|502|503)\b/) || 
                            errorMessage.match(/\((\d{3})\)/) ||
                            (errorMessage.includes('token limit') ? ['402'] : null) ||
                            (errorMessage.includes('rate limit') ? ['429'] : null) ||
                            (errorMessage.includes('access denied') || errorMessage.includes('Forbidden') ? ['403'] : null);
      const errorCode = errorCodeMatch ? errorCodeMatch[1] || errorCodeMatch[0] : null;
      
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('timed out');
      const isRateLimit = errorMessage.includes('rate limit') || errorMessage.includes('Rate limit') || errorCode === '429';
      const isDailyLimit = errorMessage.includes('daily') || errorMessage.includes('per-day') || errorMessage.includes('per day') || errorMessage.includes('free-models-per-day');
      const isTokenLimit = errorMessage.includes('token limit') || errorMessage.includes('tokens limit') || errorCode === '402';
      const isForbidden = errorMessage.includes('access denied') || errorMessage.includes('Forbidden') || errorCode === '403';
      
      // Save error info for fallback (include error code)
      lastError = {
        message: errorMessage,
        isDailyLimit,
        isRateLimit,
        errorCode: errorCode || undefined
      };
      
      logError('analysis_llm_error', {
        conversationId,
        chunkIndex: chunkIndex + 1,
        error: errorMessage,
        attempt: parseAttempts,
        isTimeout,
        isRateLimit,
        isDailyLimit,
        isForbidden,
        errorCode,
        totalChunks
      });
      
      // If forbidden (403), don't retry - it's a configuration issue
      if (isForbidden) {
        logError('analysis_forbidden_error', {
          conversationId,
          chunkIndex: chunkIndex + 1,
          error: errorMessage
        });
        break; // Exit immediately, will create fallback
      }
      
      // If daily rate limit, don't retry - it won't help
      if (isDailyLimit) {
        logError('analysis_daily_rate_limit', {
          conversationId,
          chunkIndex: chunkIndex + 1,
          error: errorMessage
        });
        break; // Exit immediately, will create fallback
      }
      
      // If timeout or max attempts reached, break and try to salvage
      if (isTimeout || parseAttempts >= maxParseAttempts - 1) {
        break;
      }
      
      parseAttempts++;
      continue;
    }
  }
  
  // Update progress to show chunk completion
  const chunkCompletionProgress = Math.min(
    baseProgress + chunkProgressRange - 2,
    95
  );
  
  await updateProgress(progressId, {
    status: 'analyzing',
    progress: chunkCompletionProgress,
    currentChunk: chunkIndex + 1,
    totalChunks,
    message: `Completed chunk ${chunkIndex + 1} of ${totalChunks}`
  });
  
  // Parse the response
  const defaultMsgs = getDefaultMessages(locale);
  let parsed: any;
  
  // Final check: if content is still empty after all attempts, create fallback
  if (!content || content.trim().length === 0 || content === '{}') {
    logError('llm_final_empty_response', {
      conversationId,
      chunkIndex: chunkIndex + 1,
      parseAttempts,
      maxParseAttempts,
      lastError: lastError?.message || 'No error info',
      hasResponse: !!response
    });
    
    // Check if we have error information from the last attempt
    const errorInfo = (response as any)?.error || null;
    const errorText = lastError?.message || errorInfo?.message || '';
    
    // Extract error code from OpenRouter error messages (402, 403, 429, etc.)
    // First try to get from lastError, then from error text
    let errorCode = lastError?.errorCode || null;
    if (!errorCode) {
      const errorCodeMatch = errorText.match(/\b(402|403|429|408|500|502|503)\b/) || 
                            errorText.match(/\((\d{3})\)/) ||
                            (errorText.includes('token limit') ? ['402'] : null) ||
                            (errorText.includes('rate limit') ? ['429'] : null) ||
                            (errorText.includes('access denied') || errorText.includes('Forbidden') ? ['403'] : null);
      errorCode = errorCodeMatch ? errorCodeMatch[1] || errorCodeMatch[0] : null;
    }
    
    const isRateLimit = lastError?.isRateLimit || errorText.includes('rate limit') || errorText.includes('Rate limit');
    const isDailyLimit = lastError?.isDailyLimit || errorText.includes('daily') || errorText.includes('per-day') || errorText.includes('free-models-per-day');
    const isTokenLimit = errorText.includes('token limit') || errorText.includes('tokens limit') || errorCode === '402';
    const isForbidden = errorText.includes('access denied') || errorText.includes('Forbidden') || errorCode === '403';
    
    // Build concise error message with error code
    let errorMessage: string;
    if (isForbidden) {
      errorMessage = locale === 'ru'
        ? `Доступ к сервису анализа запрещен. Пожалуйста, проверьте конфигурацию API.${errorCode ? ` (Код ошибки: ${errorCode})` : ''}`
        : `Analysis service access denied. Please check API configuration.${errorCode ? ` (Error code: ${errorCode})` : ''}`;
    } else if (isDailyLimit) {
      errorMessage = locale === 'ru' 
        ? `Лимит запросов к LLM превышен. Пожалуйста, попробуйте через несколько минут.${errorCode ? ` (Код ошибки: ${errorCode})` : ''}`
        : `LLM rate limit exceeded. Please try again in a few minutes.${errorCode ? ` (Error code: ${errorCode})` : ''}`;
    } else if (isTokenLimit) {
      errorMessage = locale === 'ru'
        ? `Лимит токенов промпта превышен. Пожалуйста, попробуйте через несколько минут.${errorCode ? ` (Код ошибки: ${errorCode})` : ''}`
        : `Prompt token limit exceeded. Please try again in a few minutes.${errorCode ? ` (Error code: ${errorCode})` : ''}`;
    } else if (isRateLimit) {
      errorMessage = locale === 'ru'
        ? `Лимит запросов к LLM превышен. Пожалуйста, попробуйте через несколько минут.${errorCode ? ` (Код ошибки: ${errorCode})` : ''}`
        : `LLM rate limit exceeded. Please try again in a few minutes.${errorCode ? ` (Error code: ${errorCode})` : ''}`;
    } else {
      errorMessage = locale === 'ru'
        ? `Ошибка анализа.${errorCode ? ` (Код ошибки: ${errorCode})` : ''}`
        : `Analysis error.${errorCode ? ` (Error code: ${errorCode})` : ''}`;
    }
    
    parsed = {
      overviewSummary: errorMessage,
      gaslightingRiskScore: 0.5,
      conflictIntensityScore: 0.5,
      supportivenessScore: 0.5,
      apologyFrequencyScore: 0.5,
      sections: []
    };
    
    return { parsed };
  }
  
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    // Try to fix common JSON errors before parsing
    let fixedJson = jsonContent
      .replace(/([^\\])"/g, (match, p1) => {
        if (p1 === ':' || p1 === '{' || p1 === '[' || p1 === ',') {
          return match;
        }
        return p1 + '\\"';
      })
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1');

    try {
      parsed = JSON.parse(fixedJson);
    } catch {
      try {
        parsed = JSON.parse(jsonContent);
      } catch (parseError2) {
        throw parseError2;
      }
    }
  } catch (parseError) {
    logError('analysis_parse_error', {
      conversationId,
      chunkIndex: chunkIndex + 1,
      error: (parseError as Error).message,
      contentPreview: content.substring(0, 500),
      contentLength: content.length
    });
    
    // Try to salvage data from broken JSON using regex
    const overviewMatch = content.match(/"overviewSummary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let overviewFromContent: string | undefined;
    if (overviewMatch && overviewMatch[1]) {
      overviewFromContent = overviewMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .trim();
    }

    const gaslightingMatch = content.match(/"gaslightingRiskScore"\s*:\s*([0-9.]+)/);
    const conflictMatch = content.match(/"conflictIntensityScore"\s*:\s*([0-9.]+)/);
    const supportMatch = content.match(/"supportivenessScore"\s*:\s*([0-9.]+)/);
    const apologyMatch = content.match(/"apologyFrequencyScore"\s*:\s*([0-9.]+)/);

    parsed = {
      overviewSummary: overviewFromContent || defaultMsgs.parseError,
      gaslightingRiskScore: gaslightingMatch ? parseFloat(gaslightingMatch[1]) : 0.5,
      conflictIntensityScore: conflictMatch ? parseFloat(conflictMatch[1]) : 0.5,
      supportivenessScore: supportMatch ? parseFloat(supportMatch[1]) : 0.5,
      apologyFrequencyScore: apologyMatch ? parseFloat(apologyMatch[1]) : 0.5,
      sections: []
    };
  }

  return { parsed };
}

/**
 * Analyze a conversation and generate an AnalysisResult.
 * Optionally analyzes media artifacts using vision API.
 * @param enhancedAnalysis - If true, uses more detailed prompts and deeper analysis
 * @param conversationId - Conversation ID for progress updates
 */
export async function analyzeConversation(
  conversation: Conversation,
  messages: Message[],
  mediaArtifacts: MediaArtifact[] = [],
  enhancedAnalysis: boolean = false,
  conversationId?: string,
  participants: Participant[] = [],
  locale: SupportedLocale = 'en'
): Promise<AnalysisResult> {
  const analysisId = `analysis_${conversation.id}_${Date.now()}`;
  const startTime = Date.now();
  
  // Check config before starting
  let configStatus = 'unknown';
  try {
    const config = getConfig();
    configStatus = config.openrouterApiKey ? 'configured' : 'MISSING';
    logInfo('analysis_started', { 
      conversationId: conversation.id, 
      messageCount: messages.length,
      mediaCount: mediaArtifacts.length,
      analysisId,
      enhancedAnalysis,
      locale,
      platform: conversation.sourcePlatform,
      openrouterApiKey: configStatus,
      openrouterBaseUrl: config.openrouterBaseUrl,
      textModel: config.textModel
    });
  } catch (configError) {
    logError('analysis_config_error', {
      conversationId: conversation.id,
      error: (configError as Error).message
    });
    configStatus = 'ERROR';
  }

  // Record metrics start
  try {
    const { recordAnalysisStart } = await import('../../lib/metrics');
    await recordAnalysisStart(
      conversation.id,
      0, // File size not available here, will be updated if needed
      messages.length,
      conversation.sourcePlatform,
      enhancedAnalysis
    );
  } catch (metricsError) {
    logWarn('metrics_start_error', {
      error: (metricsError as Error).message
    });
  }

  try {
    const progressId = conversationId || conversation.id;
    
    logInfo('analysis_updating_progress_parsing', {
      conversationId: conversation.id,
      progressId
    });
    
    // Update progress: parsing
    await updateProgress(progressId, {
      status: 'parsing',
      progress: 5
    });
    
    logInfo('analysis_progress_updated_parsing', {
      conversationId: conversation.id,
      progressId
    });

    // Analyze media artifacts (images, stickers, GIFs) using vision API
    // Limit to first 20 media items to avoid excessive API calls
    const mediaToAnalyze = mediaArtifacts
      .filter(m => ['image', 'sticker', 'gif'].includes(m.type))
      .slice(0, 20);
    
    logInfo('media_analysis_started', { count: mediaToAnalyze.length });
    
    if (mediaToAnalyze.length > 0) {
      await updateProgress(progressId, {
        status: 'media',
        progress: 10
      });
    }
    
    for (let i = 0; i < mediaToAnalyze.length; i++) {
      const media = mediaToAnalyze[i];
      try {
        // Analyze media from Blob URL or transientPathOrUrl (fallback)
        if (media.blobUrl) {
          // Fetch media from Blob and convert to data URL for vision API
          const { getMediaFromBlob } = await import('../../lib/blob');
          const { fileToDataUrl } = await import('../../lib/vision');
          const mediaBlob = await getMediaFromBlob(media.blobUrl);
          if (mediaBlob) {
            const dataUrl = await fileToDataUrl(mediaBlob);
            const analysis = await analyzeMediaArtifact(media, dataUrl);
            media.labels = analysis.labels;
            media.sentimentHint = analysis.sentiment;
            media.notes = analysis.description;
          }
        } else if (media.transientPathOrUrl) {
          // Fallback for old format (base64 data URL)
          const analysis = await analyzeMediaArtifact(media, media.transientPathOrUrl);
          media.labels = analysis.labels;
          media.sentimentHint = analysis.sentiment;
          media.notes = analysis.description;
        }
      } catch (mediaError) {
        logError('media_analysis_error', {
          mediaId: media.id,
          error: (mediaError as Error).message
        });
        // Continue with other media even if one fails
      }
      
      // Update progress for media analysis
      if ((i + 1) % 5 === 0 || i === mediaToAnalyze.length - 1) {
        await updateProgress(progressId, {
          status: 'media',
          progress: 10 + Math.floor((i + 1) / mediaToAnalyze.length * 10)
        });
      }
    }

    // Chunk messages if needed (for very large conversations).
    // Using much larger chunks and a hard cap on total chunks to
    // significantly reduce the number of LLM calls per analysis.
    const chunks = chunkMessages(messages);
    
    logInfo('analysis_chunking_complete', {
      conversationId: conversation.id,
      totalChunks: chunks.length,
      totalMessages: messages.length
    });
    
    await updateProgress(progressId, {
      status: 'chunking',
      progress: 20,
      totalChunks: chunks.length
    });
    
    const allSections: AnalysisSection[] = [];
    const allParticipantProfiles = new Map<string, ParticipantProfile>();
    const allImportantDates = new Map<string, import('./types').ImportantDate>();
    const allOverviewSummaries: string[] = []; // Collect overview summaries from all chunks
    // Aggregate scores with proper weighting by chunk size (message count)
    let gaslightingScore = 0;
    let conflictScore = 0;
    let supportScore = 0;
    let totalMessagesForScores = 0;

    // Analyze chunks in parallel batches (10-20 at a time)
    const BATCH_SIZE = 15; // Process 15 chunks simultaneously
    
    // Collect all new analysis parts from chunks (for enhanced analysis)
    // These will be aggregated or taken from the most complete chunk
    // Note: These fields are optional and may not be present in all chunks
    let aggregatedCommunicationStats: any = undefined;
    let aggregatedPromiseTracking: any = undefined;
    let aggregatedRedFlagCounts: any = undefined;
    let aggregatedEmotionalCycle: string | undefined = undefined;
    let aggregatedTimePatterns: any = undefined;
    let aggregatedContradictions: any[] = [];
    let aggregatedRealityCheck: any = undefined;
    let aggregatedFrameworkDiagnosis: any = undefined;
    let aggregatedHardTruth: any = undefined;
    let aggregatedWhatYouShouldKnow: any = undefined;
    let aggregatedClosure: any = undefined;
    let aggregatedSafetyConcern: any = undefined;
    
    logInfo('analysis_starting_chunk_analysis', {
      conversationId: conversation.id,
      totalChunks: chunks.length,
      batchSize: BATCH_SIZE
    });
    
    // Process chunks in batches
    for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length);
      const batch = chunks.slice(batchStart, batchEnd);
      
      logInfo('analysis_processing_batch', {
        conversationId: conversation.id,
        batchStart: batchStart + 1,
        batchEnd,
        totalChunks: chunks.length,
        batchSize: batch.length
      });
      
      // Process all chunks in this batch in parallel
      const batchResults = await Promise.all(
        batch.map((chunk, batchIndex) => {
          const chunkIndex = batchStart + batchIndex;
          return analyzeChunk(
            chunk,
            chunkIndex,
            chunks.length,
            conversation.id,
            mediaArtifacts,
            participants,
            locale,
            enhancedAnalysis,
            progressId
          );
        })
      );
      
      // Aggregate results from this batch
      for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex++) {
        const { parsed } = batchResults[batchIndex];
        const chunkIndex = batchStart + batchIndex;

      // Aggregate scores with weighting by chunk size (message count)
      const chunkSize = chunks[chunkIndex]?.length ?? 0;
      if (chunkSize > 0) {
        gaslightingScore += (parsed.gaslightingRiskScore || 0) * chunkSize;
        conflictScore += (parsed.conflictIntensityScore || 0) * chunkSize;
        supportScore += (parsed.supportivenessScore || 0) * chunkSize;
        totalMessagesForScores += chunkSize;
      }

      // Collect new analysis parts (aggregate for all chunks, regardless of enhanced flag)
      // communicationStats - merge from all chunks (sum counts, keep max resolutionRate)
      if (parsed.communicationStats) {
        if (!aggregatedCommunicationStats) {
          aggregatedCommunicationStats = { ...parsed.communicationStats };
        } else {
          // Merge initiatorBalance (simple average per key)
          if (parsed.communicationStats.initiatorBalance && aggregatedCommunicationStats.initiatorBalance) {
            const merged = { ...aggregatedCommunicationStats.initiatorBalance };
            Object.entries(parsed.communicationStats.initiatorBalance).forEach(([key, value]) => {
              merged[key] = ((merged[key] || 0) + (value as number)) / 2;
            });
            aggregatedCommunicationStats.initiatorBalance = merged;
          } else if (parsed.communicationStats.initiatorBalance && !aggregatedCommunicationStats.initiatorBalance) {
            aggregatedCommunicationStats.initiatorBalance = { ...parsed.communicationStats.initiatorBalance };
          }
          // Sum apology counts
          if (parsed.communicationStats.apologyCount) {
            const merged = { ...(aggregatedCommunicationStats.apologyCount || {}) };
            Object.entries(parsed.communicationStats.apologyCount).forEach(([key, value]) => {
              merged[key] = (merged[key] || 0) + (value as number);
            });
            aggregatedCommunicationStats.apologyCount = merged;
          }
          // Resolution rate: keep max seen
          if (parsed.communicationStats.resolutionRate !== undefined) {
            const current = aggregatedCommunicationStats.resolutionRate ?? 0;
            aggregatedCommunicationStats.resolutionRate = Math.max(current, parsed.communicationStats.resolutionRate);
          }
          // conflictFrequency: keep the longest/non-empty description
          if (parsed.communicationStats.conflictFrequency) {
            const existing = aggregatedCommunicationStats.conflictFrequency || '';
            if (parsed.communicationStats.conflictFrequency.length > existing.length) {
              aggregatedCommunicationStats.conflictFrequency = parsed.communicationStats.conflictFrequency;
            }
          }
        }
      }
      
      // promiseTracking - merge from all chunks (sum promises)
      if (parsed.promiseTracking) {
        if (!aggregatedPromiseTracking) {
          aggregatedPromiseTracking = { ...parsed.promiseTracking };
        } else {
          Object.entries(parsed.promiseTracking).forEach(([key, value]) => {
            if (value && typeof value === 'object' && 'made' in value && 'kept' in value) {
              const existing = aggregatedPromiseTracking[key];
              if (existing) {
                const made = (existing.made || 0) + (value as any).made;
                const kept = (existing.kept || 0) + (value as any).kept;
                aggregatedPromiseTracking[key] = {
                  made,
                  kept,
                  percentage: made > 0 ? (kept / made) * 100 : 0
                };
              } else {
                aggregatedPromiseTracking[key] = { ...value };
              }
            }
          });
        }
      }
      
      // redFlagCounts - sum from all chunks
      if (parsed.redFlagCounts) {
        if (!aggregatedRedFlagCounts) {
          aggregatedRedFlagCounts = { ...parsed.redFlagCounts };
        } else {
          aggregatedRedFlagCounts = {
            yellow: (aggregatedRedFlagCounts.yellow || 0) + (parsed.redFlagCounts.yellow || 0),
            orange: (aggregatedRedFlagCounts.orange || 0) + (parsed.redFlagCounts.orange || 0),
            red: (aggregatedRedFlagCounts.red || 0) + (parsed.redFlagCounts.red || 0)
          };
        }
      }
      
      // emotionalCycle - take first non-empty (usually same across chunks)
      if (parsed.emotionalCycle && !aggregatedEmotionalCycle) {
        aggregatedEmotionalCycle = parsed.emotionalCycle;
      }
      
      // timePatterns - merge triggers, take most detailed conflictTimes
      if (parsed.timePatterns) {
        if (!aggregatedTimePatterns) {
          aggregatedTimePatterns = { ...parsed.timePatterns };
        } else {
          // Merge triggers
          if (parsed.timePatterns.triggers) {
            const existingTriggers = new Set(aggregatedTimePatterns.triggers || []);
            parsed.timePatterns.triggers.forEach((t: string) => existingTriggers.add(t));
            aggregatedTimePatterns.triggers = Array.from(existingTriggers);
          }
          // Take more detailed conflictTimes
          if (parsed.timePatterns.conflictTimes && 
              (!aggregatedTimePatterns.conflictTimes || 
               parsed.timePatterns.conflictTimes.length > aggregatedTimePatterns.conflictTimes.length)) {
            aggregatedTimePatterns.conflictTimes = parsed.timePatterns.conflictTimes;
          }
        }
      }
      
      // contradictions - already correctly aggregated via push
      if (parsed.contradictions && Array.isArray(parsed.contradictions)) {
        aggregatedContradictions.push(...parsed.contradictions);
      }
      
      // realityCheck, frameworkDiagnosis, hardTruth, whatYouShouldKnow, closure, safetyConcern
      // Take first non-empty, but prefer longer/more detailed versions
      if (parsed.realityCheck && (!aggregatedRealityCheck || 
          JSON.stringify(parsed.realityCheck).length > JSON.stringify(aggregatedRealityCheck).length)) {
        aggregatedRealityCheck = parsed.realityCheck;
      }
      if (parsed.frameworkDiagnosis && (!aggregatedFrameworkDiagnosis ||
          JSON.stringify(parsed.frameworkDiagnosis).length > JSON.stringify(aggregatedFrameworkDiagnosis).length)) {
        aggregatedFrameworkDiagnosis = parsed.frameworkDiagnosis;
      }
      if (parsed.hardTruth && (!aggregatedHardTruth ||
          JSON.stringify(parsed.hardTruth).length > JSON.stringify(aggregatedHardTruth).length)) {
        aggregatedHardTruth = parsed.hardTruth;
      }
      if (parsed.whatYouShouldKnow && (!aggregatedWhatYouShouldKnow ||
          JSON.stringify(parsed.whatYouShouldKnow).length > JSON.stringify(aggregatedWhatYouShouldKnow).length)) {
        aggregatedWhatYouShouldKnow = parsed.whatYouShouldKnow;
      }
      if (parsed.closure && (!aggregatedClosure ||
          JSON.stringify(parsed.closure).length > JSON.stringify(aggregatedClosure).length)) {
        aggregatedClosure = parsed.closure;
      }
      if (parsed.safetyConcern && (!aggregatedSafetyConcern ||
          JSON.stringify(parsed.safetyConcern).length > JSON.stringify(aggregatedSafetyConcern).length)) {
        aggregatedSafetyConcern = parsed.safetyConcern;
      }
      
      // Collect overview summary if available - clean it from any JSON structure
      const rawOverviewSummary = extractOverviewSummaryText(parsed.overviewSummary);
      
      if (rawOverviewSummary && rawOverviewSummary.length > 0) {
        const cleanSummary = cleanOverviewSummaryFromJson(rawOverviewSummary);
        if (cleanSummary.length > 0) {
          allOverviewSummaries.push(cleanSummary);
        }
      }

      // Collect sections - filter out sections without evidence snippets to avoid generic warnings
      if (parsed.sections && Array.isArray(parsed.sections)) {
        logInfo('analysis_processing_sections', {
          conversationId: conversation.id,
          chunkIndex: chunkIndex + 1,
          totalSections: parsed.sections.length,
          sectionsDetails: parsed.sections.map(s => ({
            id: s.id || 'unknown',
            title: s.title || 'unknown',
            hasEvidenceSnippets: !!s.evidenceSnippets,
            isArray: Array.isArray(s.evidenceSnippets),
            evidenceCount: s.evidenceSnippets?.length || 0,
            firstEvidenceExcerpt: s.evidenceSnippets?.[0]?.excerpt?.substring(0, 50) || 'none'
          }))
        });
        
        const validSections = parsed.sections
          .map((s) => ({
            id: s.id || `section_${Date.now()}_${Math.random()}`,
            title: s.title || 'Pattern',
            summary: s.summary || '',
            plainSummary: s.plainSummary || undefined,
            score: s.score ?? undefined,
            evidenceSnippets: Array.isArray(s.evidenceSnippets)
              ? s.evidenceSnippets.map((e) => ({
                  messageId: null,
                  mediaArtifactId: null,
                  excerpt: e.excerpt || '',
                  explanation: e.explanation || ''
                }))
              : []
          }))
          // keep sections that have at least some content (summary/title), even if evidence is empty
          .filter((s) => (s.summary && s.summary.trim().length > 0) || (s.title && s.title.trim().length > 0));
        
        logInfo('analysis_sections_filtered', {
          conversationId: conversation.id,
          chunkIndex: chunkIndex + 1,
          beforeFilter: parsed.sections.length,
          afterFilter: validSections.length,
          filteredOut: parsed.sections.length - validSections.length
        });
        
        if (validSections.length > 0) {
          allSections.push(...validSections);
        }
      }

      // Collect participant profiles (premium feature)
      if (parsed.participantProfiles && Array.isArray(parsed.participantProfiles)) {
        parsed.participantProfiles.forEach((p) => {
          if (p.participantId && p.profile && p.profile.trim().length > 0) {
            allParticipantProfiles.set(p.participantId, {
              participantId: p.participantId,
              profile: p.profile.trim(),
              inferredGender: p.inferredGender ?? null
            });
          }
        });
      }

      // Collect important dates (premium feature)
      // Deduplicate by date, keep highest severity, and keep a representative section/excerpt for linking
      if (parsed.importantDates && Array.isArray(parsed.importantDates)) {
        parsed.importantDates.forEach((d) => {
          if (d.date && d.reason && d.reason.trim().length > 0) {
            const existing = allImportantDates.get(d.date);
            const severity = d.severity ?? 0.5;
            if (!existing || (existing.severity ?? 0) < severity) {
              allImportantDates.set(d.date, {
                date: d.date,
                reason: d.reason.trim(),
                severity,
                // Optional fields for deep-linking from calendar → evidence snippet
                sectionId: d.sectionId ?? existing?.sectionId,
                excerpt: d.excerpt ?? existing?.excerpt
              });
            }
          }
        });
      }
      
      // Memory optimization: Clear parsed object after processing to free memory
      (batchResults[batchIndex] as any).parsed = null;
      }
      
      // Memory optimization: Clear batchResults array after processing batch
      (batchResults as any).length = 0;
    }

    // Update progress: finalizing (can take a bit while we aggregate results)
    await updateProgress(progressId, {
      status: 'finalizing',
      progress: 90
    });

    // Average scores across conversation using message-weighted aggregation
    const chunkCount = chunks.length;
    const totalMessagesForAverages = totalMessagesForScores > 0 ? totalMessagesForScores : messages.length;
    const defaultMsgs = getDefaultMessages(locale);
    
    // Deduplicate sections by normalized id - merge evidence snippets from all versions
    const sectionsMap = new Map<string, typeof allSections[0]>();
    for (const section of allSections) {
      // Normalize the section ID to handle variations
      const normalizedId = normalizeSectionId(section.id, section.title);
      const existing = sectionsMap.get(normalizedId);
      
      if (existing) {
        // Merge evidence snippets, avoiding duplicates
        const existingExcerpts = new Set(existing.evidenceSnippets.map(e => e.excerpt));
        const newEvidence = section.evidenceSnippets.filter(
          e => !existingExcerpts.has(e.excerpt)
        );
        existing.evidenceSnippets.push(...newEvidence);
        // Update summary/plainSummary if the new one is more detailed
        if (section.summary && section.summary.length > (existing.summary?.length || 0)) {
          existing.summary = section.summary;
        }
        if (section.plainSummary && section.plainSummary.length > (existing.plainSummary?.length || 0)) {
          existing.plainSummary = section.plainSummary;
        }
        // Update score to average if both have scores
        if (section.score !== undefined && existing.score !== undefined) {
          existing.score = (existing.score + section.score) / 2;
        } else if (section.score !== undefined) {
          existing.score = section.score;
        }
        // Keep the most descriptive title
        if (section.title && section.title.length > (existing.title?.length || 0)) {
          existing.title = section.title;
        }
      } else {
        // Create new entry with normalized ID
        sectionsMap.set(normalizedId, { ...section, id: normalizedId });
      }
    }
    const deduplicatedSections = Array.from(sectionsMap.values());
    
    // Select the best overview summary - prefer the longest one that doesn't contain error messages
    let bestOverview = '';
    if (allOverviewSummaries.length > 0) {
      // Filter out summaries that contain error messages
      const validSummaries = allOverviewSummaries.filter(
        s => !s.includes('Анализ завершен с частичными результатами') &&
             !s.includes('Empty response from LLM') &&
             !s.includes('parseError') &&
             s.trim().length > 50
      );
      
      if (validSummaries.length > 0) {
        // Take the longest valid summary
        bestOverview = validSummaries.reduce((longest, current) => 
          current.length > longest.length ? current : longest
        );
      } else {
        // If all contain errors, take the first one anyway
        bestOverview = allOverviewSummaries[0];
      }
    }
    
    // Stage 2: Final holistic analysis for better integrity of perception
    // This step analyzes all chunk results together to provide a cohesive understanding
    // Only do this if bestOverview is short or seems incomplete (avoid unnecessary LLM calls)
    let finalOverviewSummary = bestOverview;
    const shouldDoFinalAnalysis = enhancedAnalysis && 
      chunkCount > 1 && 
      deduplicatedSections.length > 0 &&
      (!bestOverview || bestOverview.length < 200 || bestOverview.includes('parseError'));
    
    if (shouldDoFinalAnalysis) {
      try {
        await updateProgress(progressId, {
          status: 'finalizing',
          progress: 92,
          message: 'Performing final holistic analysis...'
        });
        
        logInfo('final_analysis_started', {
          conversationId: conversation.id,
          chunkCount,
          sectionCount: deduplicatedSections.length
        });
        
        // Create summary of all chunk results for final analysis
        const chunkResultsSummary = deduplicatedSections.map(s => ({
          id: s.id,
          title: s.title,
          summary: s.summary,
          score: s.score,
          evidenceCount: s.evidenceSnippets.length
        }));
        
        const finalAnalysisPrompt = `You are synthesizing a complete relationship conversation that was analyzed in ${chunkCount} parts. Your task is to write a vivid, human overviewSummary that describes the participants' CHARACTERS and their INTERACTION DYNAMICS.

CRITICAL REQUIREMENTS FOR overviewSummary:
- NO NUMBERS, NO SCORES, NO PERCENTAGES
- Describe WHO these people are: their communication styles, emotional patterns, typical reactions
- Describe HOW they interact: what patterns emerge across the entire conversation, what triggers conflicts, how they resolve (or don't resolve) issues
- Use psychological frameworks naturally (e.g., "anxious-avoidant dynamic", "Parent-Child transaction") but explain what this MEANS, don't just label it
- Be specific and evidence-based: reference patterns from the aggregated data
- Make it readable and insightful, like a forensic psychologist's case summary
- Length: 3-5 sentences, enough to paint a clear picture of these people and their relationship

The aggregated data from all chunks:

CHUNK ANALYSIS RESULTS:
${JSON.stringify(chunkResultsSummary, null, 2)}

CURRENT OVERVIEW SUMMARY:
${bestOverview || 'No overview available'}

TASK:
Synthesize all this information into a vivid, human description of who these people are and how they interact. 

Focus on:
- The CHARACTERS: Who are these people? What are their communication styles, emotional patterns, typical reactions?
- The DYNAMICS: How do they interact? What patterns emerge across the entire timeline? What triggers conflicts? How do they resolve (or avoid resolving) issues?
- The EVOLUTION: How did the relationship or specific issues evolve over time?
- The PSYCHOLOGICAL INSIGHTS: What underlying needs, attachment patterns, or communication styles drive their behavior?

CRITICAL: 
- NO NUMBERS, NO SCORES, NO PERCENTAGES in your response
- Write like a forensic psychologist describing a case - vivid, insightful, evidence-based
- Avoid simply concatenating the provided summaries. Synthesize them into a coherent portrait.
- Use psychological frameworks naturally but explain what they mean, don't just label

Respond ONLY with a single, well-structured paragraph (3-5 sentences) in ${getLanguageInstruction(locale)}. No JSON, no markdown, just the summary text.`;

        const finalSystemPrompt = getSystemPrompt(locale, false); // Use simpler prompt for final analysis
        
        const finalResponse = await callLLM({
          model: getConfig().textModel,
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: finalAnalysisPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        });
        
        const finalContent = finalResponse?.choices?.[0]?.message?.content;
        if (finalContent && finalContent.trim().length > 50) {
          finalOverviewSummary = finalContent.trim();
          logInfo('final_analysis_completed', {
            conversationId: conversation.id,
            newOverviewLength: finalOverviewSummary.length
          });
        } else {
          logWarn('final_analysis_empty_response', {
            conversationId: conversation.id
          });
        }
      } catch (finalAnalysisError) {
        logWarn('final_analysis_failed', {
          conversationId: conversation.id,
          error: (finalAnalysisError as Error).message
        });
        // Continue with original overview if final analysis fails
      }
    }
    
    await updateProgress(progressId, {
      status: 'finalizing',
      progress: 95
    });
    
    // Ensure overviewSummary is always a string, not an object
    const extractedOverview = extractOverviewSummaryText(finalOverviewSummary);
    const safeOverviewSummary = extractedOverview || 
      (deduplicatedSections.length > 0
        ? deduplicatedSections[0].summary
        : defaultMsgs.defaultOverview);
    
    const result: AnalysisResult = {
      id: analysisId,
      conversationId: conversation.id,
      createdAt: new Date().toISOString(),
      version: ANALYSIS_VERSION,
      gaslightingRiskScore: totalMessagesForAverages > 0 ? gaslightingScore / totalMessagesForAverages : 0,
      conflictIntensityScore: totalMessagesForAverages > 0 ? conflictScore / totalMessagesForAverages : 0,
      supportivenessScore: totalMessagesForAverages > 0 ? supportScore / totalMessagesForAverages : 0,
      // NOTE: apologyFrequencyScore is kept for backward compatibility but is no longer
      // a primary headline metric. Conflict resolution rate lives in communicationStats.resolutionRate.
      // Here we mirror resolutionRate (0–100) as a 0–1 score when available, otherwise fall back to 0.5.
      apologyFrequencyScore:
        aggregatedCommunicationStats && typeof aggregatedCommunicationStats.resolutionRate === 'number'
          ? Math.max(0, Math.min(1, aggregatedCommunicationStats.resolutionRate / 100))
          : 0.5,
      otherPatternScores: {},
      overviewSummary: safeOverviewSummary,
      sections: deduplicatedSections.length > 0
        ? deduplicatedSections
        : [
            {
              id: 'default',
              title: defaultMsgs.defaultTitle,
              summary: defaultMsgs.defaultNoPatterns,
              evidenceSnippets: []
            }
          ],
      // Include participant profiles only if we have any (premium feature)
      participantProfiles: allParticipantProfiles.size > 0
        ? Array.from(allParticipantProfiles.values())
        : undefined,
      // Include important dates only if we have any (premium feature)
      importantDates: allImportantDates.size > 0
        ? Array.from(allImportantDates.values())
        : undefined,
      // New analysis parts (for enhanced analysis)
      communicationStats: aggregatedCommunicationStats,
      promiseTracking: aggregatedPromiseTracking,
      redFlagCounts: aggregatedRedFlagCounts,
      emotionalCycle: aggregatedEmotionalCycle,
      timePatterns: aggregatedTimePatterns,
      contradictions: aggregatedContradictions.length > 0 ? aggregatedContradictions : undefined,
      realityCheck: aggregatedRealityCheck,
      frameworkDiagnosis: aggregatedFrameworkDiagnosis,
      hardTruth: aggregatedHardTruth,
      whatYouShouldKnow: aggregatedWhatYouShouldKnow,
      closure: aggregatedClosure,
      safetyConcern: aggregatedSafetyConcern
    };

    const normalizedResult = normalizeAnalysisResult(result, {
      defaultTitle: defaultMsgs.defaultTitle,
      defaultOverview: defaultMsgs.defaultOverview,
      defaultSectionSummary: defaultMsgs.defaultNoPatterns
    });

    const durationMs = Date.now() - startTime;
    
    logInfo('analysis_completed', {
      conversationId: conversation.id,
      analysisId,
      durationMs,
      sectionCount: normalizedResult.sections.length,
      hasOverview: !!normalizedResult.overviewSummary && normalizedResult.overviewSummary.trim().length > 0,
      overviewLength: normalizedResult.overviewSummary?.length || 0,
      overviewPreview: normalizedResult.overviewSummary?.substring(0, 100) || 'none',
      sectionsDetails: normalizedResult.sections.map(s => ({
        id: s.id,
        title: s.title,
        evidenceCount: s.evidenceSnippets?.length || 0,
        hasSummary: !!s.summary && s.summary.trim().length > 0,
        summaryPreview: s.summary?.substring(0, 50) || 'none'
      })),
      allSectionsCount: allSections.length,
      allOverviewSummariesCount: allOverviewSummaries.length
    });

    // Record metrics completion
    try {
      const { recordAnalysisComplete } = await import('../../lib/metrics');
      await recordAnalysisComplete(
        conversation.id,
        chunks.length,
        false, // cacheHit - will be set by analyze/start route
        undefined // no error
      );
    } catch (metricsError) {
      logWarn('metrics_complete_error', {
        error: (metricsError as Error).message
      });
    }

    // Update progress: completed
    await updateProgress(progressId, {
      status: 'completed',
      progress: 100
    });

    return normalizedResult;
  } catch (error) {
    const progressId = conversationId || conversation.id;
    await updateProgress(progressId, {
      status: 'error',
      progress: 0,
      error: (error as Error).message
    });
    
    logError('analysis_failed', {
      conversationId: conversation.id,
      error: (error as Error).message
    });
    throw new Error(`Analysis failed: ${(error as Error).message}`);
  }
}

