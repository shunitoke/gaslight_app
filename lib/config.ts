const requiredEnv = ['OPENROUTER_API_KEY'] as const;

const optionalEnvDefaults = {
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  GASLIGHT_TEXT_MODEL: 'x-ai/grok-4.1-fast',
  GASLIGHT_VISION_MODEL: 'x-ai/grok-4.1-fast',
  GASLIGHT_TEXT_MODEL_FALLBACKS: 'anthropic/claude-3-haiku,google/gemini-2.0-flash-exp:free'
} as const;

export type AppConfig = {
  openrouterApiKey: string;
  openrouterBaseUrl: string;
  textModel: string;
  textModelFallbacks: string[];
  visionModel: string;
  maxUploadSizeMb: number;
  analysisTimeoutMs: number;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getConfig = (): AppConfig => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const fallbackModelsEnv = process.env.GASLIGHT_TEXT_MODEL_FALLBACKS ?? optionalEnvDefaults.GASLIGHT_TEXT_MODEL_FALLBACKS;
  const textModelFallbacks = fallbackModelsEnv
    .split(',')
    .map(m => m.trim())
    .filter(m => m.length > 0);

  return {
    openrouterApiKey: process.env.OPENROUTER_API_KEY as string,
    openrouterBaseUrl:
      process.env.OPENROUTER_BASE_URL ?? optionalEnvDefaults.OPENROUTER_BASE_URL,
    textModel: process.env.GASLIGHT_TEXT_MODEL ?? optionalEnvDefaults.GASLIGHT_TEXT_MODEL,
    textModelFallbacks,
    visionModel: process.env.GASLIGHT_VISION_MODEL ?? optionalEnvDefaults.GASLIGHT_VISION_MODEL,
    maxUploadSizeMb: parseNumber(process.env.MAX_UPLOAD_SIZE_MB, 25),
    analysisTimeoutMs: parseNumber(process.env.ANALYSIS_TIMEOUT_MS, 2 * 60 * 1000)
  };
};






