import { getConfig } from './config';
import { logError, logInfo, logWarn } from './telemetry';

type OpenRouterRequest = {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
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

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await acquireSlot();

      const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openrouterApiKey}`
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });

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
          logError('openrouter_rate_limit_exceeded', { 
            status: response.status, 
            body: text.substring(0, 200),
            attempts: attempt + 1
          });
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

      const json = (await response.json()) as OpenRouterResponse;
      if (attempt > 0) {
        logInfo('openrouter_success_after_retry', { 
          attempts: attempt + 1,
          requestTokens: payload.messages.length 
        });
      } else {
        logInfo('openrouter_success', { requestTokens: payload.messages.length });
      }
      return json;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-HTTP errors (network issues, etc.) unless it's the last attempt
      if (attempt < maxRetries && !(error instanceof Error && error.message.includes('OpenRouter'))) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        logWarn('openrouter_retry', { 
          attempt: attempt + 1,
          error: (error as Error).message,
          delayMs
        });
        await sleep(delayMs);
        continue;
      }
      
      // Last attempt or non-retryable error
      logError('openrouter_exception', { 
        message: (error as Error).message,
        attempts: attempt + 1
      });
      throw error;
    } finally {
      releaseSlot();
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('OpenRouter request failed after all retries');
};

