import { callOpenRouter } from './openrouter';
import { logError, logInfo, logWarn } from './telemetry';

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMRequest = {
  model: string;
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
};

export type LLMResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

const YANDEX_API_URL =
  'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

/**
 * Generic LLM entrypoint that can route to different providers
 * (OpenRouter, YandexGPT, etc.) based on environment configuration.
 *
 * LLM_PROVIDER:
 *   - "openrouter" (default)
 *   - "yandex" / "yandexgpt"
 */
export async function callLLM(payload: LLMRequest): Promise<LLMResponse> {
  const provider = (process.env.LLM_PROVIDER || 'openrouter').toLowerCase();

  if (provider === 'yandex' || provider === 'yandexgpt') {
    return callYandexGPT(payload);
  }

  // Fallback / default: OpenRouter
  return callOpenRouter(payload);
}

async function callYandexGPT(
  payload: LLMRequest,
  maxRetries: number = 2,
  initialDelayMs: number = 1000
): Promise<LLMResponse> {
  const iamToken = process.env.YANDEX_IAM_TOKEN;
  const folderId = process.env.YANDEX_FOLDER_ID;
  const explicitModelUri = process.env.YANDEX_MODEL_URI;

  if (!iamToken || !folderId) {
    throw new Error(
      'Missing required environment variables for YandexGPT: YANDEX_IAM_TOKEN, YANDEX_FOLDER_ID'
    );
  }

  const modelUri =
    explicitModelUri || `gpt://${folderId}/yandexgpt/latest`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body = {
        modelUri,
        completionOptions: {
          stream: false,
          temperature: payload.temperature ?? 0.6,
          maxTokens: payload.max_tokens ?? 4000
        },
        messages: payload.messages.map((m) => ({
          role: m.role,
          text: m.content
        }))
      };

      const response = await fetch(YANDEX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${iamToken}`,
          'x-folder-id': folderId
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      });

      if (!response.ok) {
        const text = await response.text();

        // Retry on 429 / 5xx
        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < maxRetries
        ) {
          const delayMs = initialDelayMs * Math.pow(2, attempt);
          logWarn('yandexgpt_retryable_error', {
            status: response.status,
            attempt: attempt + 1,
            delayMs,
            bodyPreview: text.substring(0, 200)
          });
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        logError('yandexgpt_error', {
          status: response.status,
          body: text.substring(0, 200)
        });
        throw new Error(
          `YandexGPT request failed (${response.status}): ${text.substring(
            0,
            100
          )}`
        );
      }

      const json = (await response.json()) as any;
      const alternative = json.result?.alternatives?.[0];
      const message = alternative?.message;
      const content: string = message?.text || '';
      const role: string = message?.role || 'assistant';

      logInfo('yandexgpt_success', {
        provider: 'yandexgpt',
        requestMessages: payload.messages.length
      });

      const id: string =
        json.id ||
        `yandexgpt_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      return {
        id,
        choices: [
          {
            message: {
              role,
              content
            }
          }
        ]
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        logWarn('yandexgpt_exception_retry', {
          attempt: attempt + 1,
          error: (error as Error).message,
          delayMs
        });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      logError('yandexgpt_exception', {
        message: (error as Error).message,
        attempts: attempt + 1
      });
      throw error;
    }
  }

  throw lastError || new Error('YandexGPT request failed after all retries');
}



