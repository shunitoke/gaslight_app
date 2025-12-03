const requiredEnv = ['OPENROUTER_API_KEY'] as const;

const optionalEnvDefaults = {
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  GASLIGHT_TEXT_MODEL: 'x-ai/grok-4.1-fast:free',
  GASLIGHT_VISION_MODEL: 'openai/gpt-4o-mini'
} as const;

export type AppConfig = {
  openrouterApiKey: string;
  openrouterBaseUrl: string;
  textModel: string;
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

  return {
    openrouterApiKey: process.env.OPENROUTER_API_KEY as string,
    openrouterBaseUrl:
      process.env.OPENROUTER_BASE_URL ?? optionalEnvDefaults.OPENROUTER_BASE_URL,
    textModel: process.env.GASLIGHT_TEXT_MODEL ?? optionalEnvDefaults.GASLIGHT_TEXT_MODEL,
    visionModel: process.env.GASLIGHT_VISION_MODEL ?? optionalEnvDefaults.GASLIGHT_VISION_MODEL,
    maxUploadSizeMb: parseNumber(process.env.MAX_UPLOAD_SIZE_MB, 25),
    analysisTimeoutMs: parseNumber(process.env.ANALYSIS_TIMEOUT_MS, 2 * 60 * 1000)
  };
};






