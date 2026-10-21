const requiredEnv = ['GIGACHAT_AUTH_KEY'] as const;

const optionalEnvDefaults = {
  GIGACHAT_BASE_URL: 'https://api.giga.chat/v1',
  GIGACHAT_OAUTH_URL: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
  GIGACHAT_SCOPE: 'GIGACHAT_API_PERS',
  GASLIGHT_TEXT_MODEL: 'GigaChat-3-Pro',
  GASLIGHT_TEXT_MODEL_FALLBACKS: 'GigaChat-2-Max,GigaChat-3-Lightning',
  GASLIGHT_VISION_MODEL: 'GigaChat-2-Max'
} as const;

export type AppConfig = {
  provider: 'gigachat';
  /** true when an authorization key is present. */
  llmConfigured: boolean;
  /** Masked key preview for the admin dashboard. */
  llmKeyPreview: string | null;
  llmBaseUrl: string;
  gigachatAuthKey: string;
  gigachatOauthUrl: string;
  gigachatScope: string;
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

const maskKey = (key: string | undefined): string | null =>
  key ? `${key.slice(0, 4)}…${key.slice(-4)}` : null;

export const getConfig = (): AppConfig => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const fallbackModelsEnv =
    process.env.GASLIGHT_TEXT_MODEL_FALLBACKS ?? optionalEnvDefaults.GASLIGHT_TEXT_MODEL_FALLBACKS;
  const textModelFallbacks = fallbackModelsEnv
    .split(',')
    .map(m => m.trim())
    .filter(m => m.length > 0);

  return {
    provider: 'gigachat',
    llmConfigured: Boolean(process.env.GIGACHAT_AUTH_KEY),
    llmKeyPreview: maskKey(process.env.GIGACHAT_AUTH_KEY),
    llmBaseUrl: process.env.GIGACHAT_BASE_URL ?? optionalEnvDefaults.GIGACHAT_BASE_URL,
    gigachatAuthKey: process.env.GIGACHAT_AUTH_KEY as string,
    gigachatOauthUrl: process.env.GIGACHAT_OAUTH_URL ?? optionalEnvDefaults.GIGACHAT_OAUTH_URL,
    gigachatScope: process.env.GIGACHAT_SCOPE ?? optionalEnvDefaults.GIGACHAT_SCOPE,
    textModel: process.env.GASLIGHT_TEXT_MODEL ?? optionalEnvDefaults.GASLIGHT_TEXT_MODEL,
    textModelFallbacks,
    visionModel: process.env.GASLIGHT_VISION_MODEL ?? optionalEnvDefaults.GASLIGHT_VISION_MODEL,
    maxUploadSizeMb: parseNumber(process.env.MAX_UPLOAD_SIZE_MB, 25),
    analysisTimeoutMs: parseNumber(process.env.ANALYSIS_TIMEOUT_MS, 2 * 60 * 1000)
  };
};
