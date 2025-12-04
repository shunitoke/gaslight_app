import { getConfig } from './config';
import { logError, logInfo, logWarn } from './telemetry';

type OpenRouterRequest = {
  model?: string; // Primary model (optional if using models array)
  models?: string[]; // Fallback models array (OpenRouter will try in order)
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};

type OpenRouterResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple in-process throttling to avoid hammering OpenRouter with bursts.
// This is per-node, which is fine for local dev and small deployments.
let activeRequests = 0;
let lastFinishedAt = 0;

const MAX_CONCURRENT = Number(process.env.OPENROUTER_MAX_CONCURRENCY ?? '2');
const MIN_DELAY_MS = Number(process.env.OPENROUTER_MIN_DELAY_MS ?? '300');

async function acquireSlot() {
  // Limit concurrent requests
  while (activeRequests >= MAX_CONCURRENT) {
    await sleep(50);
  }

  // Enforce a small minimum delay between requests
  const now = Date.now();
  const sinceLast = now - lastFinishedAt;
  if (sinceLast < MIN_DELAY_MS) {
    await sleep(MIN_DELAY_MS - sinceLast);
  }

  activeRequests += 1;
}

function releaseSlot() {
  activeRequests = Math.max(0, activeRequests - 1);
  lastFinishedAt = Date.now();
}

/**
 * Call OpenRouter API with retry logic and exponential backoff for rate limits.
 * 
 * @param payload - Request payload
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelayMs - Initial delay before retry in milliseconds (default: 1000)
 * @returns OpenRouter response
 */
export const callOpenRouter = async (
  payload: OpenRouterRequest,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<OpenRouterResponse> => {
  const config = getConfig();
  let lastError: Error | null = null;
  
  // Track which models we've tried for 402 errors (token limit exceeded)
  // When we get 402 with "token limit exceeded", we try fallback models sequentially
  // because the models array approach doesn't work for 402 (all models get the same error)
  // Note: Free tier has a 12,545 token prompt limit regardless of model context window
  let triedModels: string[] = [];
  let last402Error: { text: string; model: string } | null = null;

  logInfo('openrouter_request_start', {
    model: payload.model || payload.models?.[0] || 'unknown',
    models: payload.models || [payload.model].filter(Boolean),
    messageCount: payload.messages.length,
    maxTokens: payload.max_tokens
  });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await acquireSlot();
      
      // Determine which model to use for this attempt
      // IMPORTANT: First attempt (attempt === 0) ALWAYS uses primary model as single model
      // This ensures primary model is tried first before any fallbacks
      let currentModel: string | undefined;
      let useModelsArray = false;
      
      if (attempt === 0) {
        // First attempt: ALWAYS use primary model as single model
        // Primary model is first in payload.models array, or payload.model if no array
        if (payload.models && payload.models.length > 0) {
          currentModel = payload.models[0]; // Primary model is always first
        } else {
          currentModel = payload.model;
        }
        useModelsArray = false; // Always use single model on first attempt
      } else if (last402Error && payload.models && payload.models.length > 1) {
        // We got 402, try next fallback model individually
        const nextModelIndex = triedModels.length;
        if (nextModelIndex < payload.models.length) {
          currentModel = payload.models[nextModelIndex];
          useModelsArray = false; // Use single model for fallback
          logInfo('openrouter_402_fallback_attempt', {
            previousModel: triedModels[triedModels.length - 1] || 'unknown',
            tryingModel: currentModel,
            attempt: nextModelIndex + 1,
            totalModels: payload.models.length
          });
        } else {
          // Tried all models, give up
          throw new Error(`OpenRouter token limit exceeded for all ${payload.models.length} models. Prompt is too large. Consider reducing chunk size or using a model with larger context window.`);
        }
      } else if (payload.models && payload.models.length > 1 && attempt > 0) {
        // Retry attempts (after first): use models array for automatic fallback on other errors
        // OpenRouter will try models in order if primary fails
        useModelsArray = true;
      } else {
        // Single model
        currentModel = payload.model || payload.models?.[0];
        useModelsArray = false;
      }
      
      const requestStartTime = Date.now();
      logInfo('openrouter_fetch_start', {
        attempt: attempt + 1,
        maxRetries,
        model: currentModel || (useModelsArray ? payload.models?.[0] : 'unknown') || 'unknown',
        models: useModelsArray ? payload.models : [currentModel].filter(Boolean),
        is402Fallback: !!last402Error
      });

      // Set timeout for fetch (60 seconds)
      const timeoutMs = 60000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        // Build request body: use models array if provided, otherwise use model
        const requestBody: any = {
          messages: payload.messages,
          max_tokens: payload.max_tokens,
          temperature: payload.temperature,
          stream: payload.stream
        };
        
        // OpenRouter fallback: use models array if available, otherwise single model
        if (useModelsArray && payload.models && payload.models.length > 0) {
          requestBody.models = payload.models;
          // Don't include model if using models array
        } else if (currentModel) {
          requestBody.model = currentModel;
        } else if (payload.model) {
          requestBody.model = payload.model;
        }
        
        // Build headers with optional OpenRouter identification headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openrouterApiKey}`
        };
        
        // Add optional OpenRouter identification headers if configured
        // These help with rankings on openrouter.ai and may help with access
        if (process.env.OPENROUTER_HTTP_REFERER) {
          headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
        }
        if (process.env.OPENROUTER_X_TITLE) {
          headers['X-Title'] = process.env.OPENROUTER_X_TITLE;
        }
        
        const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Handle rate limiting (429) with retry
        if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const delayMs = retryAfter 
          ? parseInt(retryAfter, 10) * 1000 
          : initialDelayMs * Math.pow(2, attempt); // Exponential backoff

          if (attempt < maxRetries) {
            logWarn('openrouter_rate_limited', { 
              attempt: attempt + 1, 
              maxRetries,
              retryAfter: retryAfter || delayMs,
              delayMs 
            });
            await sleep(delayMs);
            continue; // Retry
          } else {
            const text = await response.text();
            const isDailyLimit = text.includes('free-models-per-day') || text.includes('per-day');
            logError('openrouter_rate_limit_exceeded', { 
              status: response.status, 
              body: text.substring(0, 200),
              attempts: attempt + 1,
              isDailyLimit
            });
            
            // If it's a daily limit, don't retry - it won't help
            if (isDailyLimit) {
              throw new Error(`OpenRouter daily rate limit exceeded. Free tier allows 50 requests per day. Please add credits or try again tomorrow.`);
            }
            
            throw new Error(`OpenRouter rate limit exceeded. Please try again in a few moments. (Status: ${response.status})`);
          }
        }

        if (!response.ok) {
          const text = await response.text();
          logError('openrouter_error', { 
            status: response.status, 
            body: text.substring(0, 200),
            attempt: attempt + 1
          });
          
          // Handle 402 (insufficient credits / token limit exceeded)
          // For 402 with token limit, try fallback models sequentially
          if (response.status === 402) {
            const isTokenLimit = text.includes('tokens limit exceeded') || text.includes('Prompt tokens limit');
            const hasFallbacks = payload.models && payload.models.length > 1;
            const modelUsed = currentModel || (useModelsArray ? payload.models?.[0] : payload.model) || 'unknown';
            
            // Track this model attempt
            if (!triedModels.includes(modelUsed)) {
              triedModels.push(modelUsed);
            }
            last402Error = { text, model: modelUsed };
            
            logWarn('openrouter_402_error', {
              isTokenLimit,
              hasFallbacks,
              modelUsed,
              triedModels: triedModels.length,
              totalFallbacks: payload.models?.length || 0,
              attempt: attempt + 1
            });
            
            // If it's a token limit and we have fallbacks, try next model
            if (isTokenLimit && hasFallbacks && triedModels.length < payload.models.length) {
              // Continue loop to try next fallback model
              continue;
            }
            
            // No more fallbacks or not a token limit issue
            if (isTokenLimit && triedModels.length >= (payload.models?.length || 0)) {
              throw new Error(`OpenRouter token limit exceeded for all ${triedModels.length} models. Prompt is too large (${text.substring(0, 150)}). Consider reducing chunk size or using a model with larger context window.`);
            }
            
            throw new Error(`OpenRouter insufficient credits (402): ${text.substring(0, 200)}`);
          }
          
          // Handle 403 (Forbidden - API key issues, model access restrictions, or account limitations)
          if (response.status === 403) {
            let errorDetails = text.substring(0, 500);
            try {
              const errorJson = JSON.parse(text);
              if (errorJson.error?.message) {
                errorDetails = errorJson.error.message;
              } else if (errorJson.message) {
                errorDetails = errorJson.message;
              }
            } catch {
              // If not JSON, use text as is
            }
            
            logError('openrouter_403_forbidden', {
              body: text.substring(0, 500),
              errorDetails,
              attempt: attempt + 1,
              model: currentModel || payload.model || payload.models?.[0] || 'unknown'
            });
            
            // Provide more specific error message based on response
            const isModelIssue = errorDetails.toLowerCase().includes('model') || 
                                 errorDetails.toLowerCase().includes('access') ||
                                 errorDetails.toLowerCase().includes('permission');
            const isKeyIssue = errorDetails.toLowerCase().includes('key') ||
                              errorDetails.toLowerCase().includes('auth') ||
                              errorDetails.toLowerCase().includes('unauthorized');
            
            if (isModelIssue) {
              throw new Error(`OpenRouter model access denied (403): ${errorDetails}. The requested model may require special permissions or may not be available for your account.`);
            } else if (isKeyIssue) {
              throw new Error(`OpenRouter authentication failed (403): ${errorDetails}. Please verify your API key is valid and has proper permissions.`);
            } else {
              throw new Error(`OpenRouter access denied (403): ${errorDetails}. Please check your API key configuration and account status.`);
            }
          }
          
          // Clear 402 error state on success with other errors
          last402Error = null;
          
          // Retry on 5xx errors
          if (response.status >= 500 && attempt < maxRetries) {
            const delayMs = initialDelayMs * Math.pow(2, attempt);
            logWarn('openrouter_server_error_retry', { 
              status: response.status,
              attempt: attempt + 1,
              delayMs
            });
            await sleep(delayMs);
            continue;
          }
          
          throw new Error(`OpenRouter request failed (${response.status}): ${text.substring(0, 100)}`);
        }

        const requestDuration = Date.now() - requestStartTime;
        const json = (await response.json()) as OpenRouterResponse & { model?: string };
        
        // Clear 402 error state on success
        last402Error = null;
        
        // Log which model was actually used (OpenRouter returns this in response)
        const usedModel = json.model || currentModel || payload.model || payload.models?.[0] || 'unknown';
        const requestedModels = payload.models || [payload.model].filter(Boolean);
        const usedFallback = payload.models && payload.models.length > 0 && usedModel !== payload.models[0];
        const used402Fallback = triedModels.length > 0 && triedModels[0] !== usedModel;
        
        if (attempt > 0 || usedFallback || used402Fallback) {
          logInfo('openrouter_success_after_retry_or_fallback', { 
            attempts: attempt + 1,
            requestTokens: payload.messages.length,
            durationMs: requestDuration,
            hasChoices: !!json.choices,
            choicesCount: json.choices?.length || 0,
            requestedModels,
            usedModel,
            usedFallback,
            used402Fallback,
            triedModels: triedModels.length > 0 ? triedModels : undefined
          });
        } else {
          logInfo('openrouter_success', { 
            requestTokens: payload.messages.length,
            durationMs: requestDuration,
            hasChoices: !!json.choices,
            choicesCount: json.choices?.length || 0,
            usedModel
          });
        }
        return json;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          logError('openrouter_timeout', {
            timeoutMs,
            attempt: attempt + 1,
            model: payload.model
          });
          throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error as Error;
      const errorMessage = (error as Error).message || 'Unknown error';
      const errorStack = (error as Error).stack;
      
      logError('openrouter_exception', { 
        message: errorMessage,
        attempts: attempt + 1,
        maxRetries,
        stack: errorStack?.substring(0, 300),
        isNetworkError: errorMessage.includes('fetch') || errorMessage.includes('network'),
        isTimeout: errorMessage.includes('timeout') || errorMessage.includes('aborted')
      });
      
      // Don't retry on non-HTTP errors (network issues, etc.) unless it's the last attempt
      if (attempt < maxRetries && !(error instanceof Error && error.message.includes('OpenRouter'))) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        logWarn('openrouter_retry', { 
          attempt: attempt + 1,
          error: errorMessage,
          delayMs
        });
        await sleep(delayMs);
        continue;
      }
      
      // Last attempt or non-retryable error
      throw error;
    } finally {
      releaseSlot();
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('OpenRouter request failed after all retries');
};

/**
 * Call OpenRouter API with streaming support
 * Returns an async generator that yields chunks as they arrive
 * 
 * @param payload - Request payload (must have stream: true)
 * @returns Async generator yielding stream chunks
 */
export async function* callOpenRouterStream(
  payload: OpenRouterRequest & { stream: true },
  options?: {
    conversationId?: string;
    chunkIndex?: number;
    logActivity?: boolean;
  }
): AsyncGenerator<string, void, unknown> {
  const config = getConfig();
  
  if (!payload.stream) {
    throw new Error('Stream mode requires stream: true in payload');
  }

  const { conversationId, chunkIndex, logActivity = false } = options || {};

  logInfo('openrouter_stream_start', {
    model: payload.model,
    messageCount: payload.messages.length,
    conversationId,
    chunkIndex
  });

  // Log activity start
  if (logActivity && conversationId) {
    try {
      const { logLLMActivity } = await import('./llm-activity-logger');
      await logLLMActivity({
        timestamp: Date.now(),
        conversationId,
        chunkIndex: chunkIndex || 0,
        eventType: 'request_start',
        model: payload.model
      });
    } catch (e) {
      // Ignore activity logging errors
    }
  }

  try {
    await acquireSlot();
    
    // Build headers with optional OpenRouter identification headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openrouterApiKey}`
    };
    
    // Add optional OpenRouter identification headers if configured
    if (process.env.OPENROUTER_HTTP_REFERER) {
      headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
    }
    if (process.env.OPENROUTER_X_TITLE) {
      headers['X-Title'] = process.env.OPENROUTER_X_TITLE;
    }
    
    const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`OpenRouter stream failed (${response.status}): ${text.substring(0, 100)}`);
      
      // Log error activity
      if (logActivity && conversationId) {
        try {
          const { logLLMActivity } = await import('./llm-activity-logger');
          await logLLMActivity({
            timestamp: Date.now(),
            conversationId,
            chunkIndex: chunkIndex || 0,
            eventType: 'error',
            model: payload.model,
            data: { error: error.message }
          });
        } catch (e) {
          // Ignore
        }
      }
      
      throw error;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalContent = '';
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Log completion
              if (logActivity && conversationId) {
                try {
                  const { logLLMActivity } = await import('./llm-activity-logger');
                  await logLLMActivity({
                    timestamp: Date.now(),
                    conversationId,
                    chunkIndex: chunkIndex || 0,
                    eventType: 'request_complete',
                    model: payload.model,
                    data: {
                      content: totalContent,
                      tokens: totalContent.length / 4, // Rough estimate
                      duration: Date.now() - Date.now() // Will be calculated properly
                    }
                  });
                } catch (e) {
                  // Ignore
                }
              }
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                totalContent += content;
                chunkCount++;
                
                // Log chunk activity in real-time
                if (logActivity && conversationId && chunkCount % 10 === 0) {
                  // Log every 10th chunk to avoid spam
                  try {
                    const { logLLMActivity } = await import('./llm-activity-logger');
                    await logLLMActivity({
                      timestamp: Date.now(),
                      conversationId,
                      chunkIndex: chunkIndex || 0,
                      eventType: 'chunk_received',
                      model: payload.model,
                      data: { chunk: content.substring(0, 50) }
                    });
                  } catch (e) {
                    // Ignore
                  }
                }
              }
              
              yield data;
            } catch (parseError) {
              logWarn('openrouter_stream_parse_error', {
                error: (parseError as Error).message,
                data: data.substring(0, 100)
              });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      releaseSlot();
    }

    logInfo('openrouter_stream_complete', {
      model: payload.model,
      conversationId,
      chunkIndex,
      totalChunks: chunkCount,
      totalContentLength: totalContent.length
    });
  } catch (error) {
    releaseSlot();
    logError('openrouter_stream_error', {
      model: payload.model,
      conversationId,
      chunkIndex,
      error: (error as Error).message,
    });
    throw error;
  }
}

