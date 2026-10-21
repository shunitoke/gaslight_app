import { getConfig } from './config';
import { callGigaChat } from './gigachat';
import { logInfo } from './telemetry';

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** GigaChat file ids for image/OCR input. */
  attachments?: string[];
};

export type LLMRequest = {
  model: string;
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
};

export type LLMResponse = {
  id: string;
  model?: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

/**
 * Single LLM entrypoint for the app (GigaChat).
 *
 * Fallbacks are listed in GASLIGHT_TEXT_MODEL_FALLBACKS and tried sequentially
 * by the transport — GigaChat has no server-side model fallback.
 */
export async function callLLM(payload: LLMRequest): Promise<LLMResponse> {
  const config = getConfig();
  const primaryModel = payload.model || config.textModel;
  const limitedFallbacks = config.textModelFallbacks.slice(0, 2);
  const modelsArray = [primaryModel, ...limitedFallbacks.filter(m => m !== primaryModel)];

  logInfo('llm_request_with_fallbacks', {
    primaryModel,
    fallbackCount: modelsArray.length - 1,
    totalModels: modelsArray.length
  });

  return callGigaChat({
    messages: payload.messages,
    max_tokens: payload.max_tokens,
    temperature: payload.temperature,
    models: modelsArray
  });
}
