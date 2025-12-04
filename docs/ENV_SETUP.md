# Environment Variables Setup

## Required Variables

### `OPENROUTER_API_KEY` (REQUIRED)
Your OpenRouter API key. Get one at https://openrouter.ai/
```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

## Optional Variables

### OpenRouter Configuration
```bash
# Base URL (default: https://openrouter.ai/api/v1)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Rate limiting (default: 2 concurrent requests)
OPENROUTER_MAX_CONCURRENCY=2

# Minimum delay between requests in ms (default: 300)
OPENROUTER_MIN_DELAY_MS=300
```

### Model Configuration
```bash
# Text analysis model (default: x-ai/grok-4.1-fast)
GASLIGHT_TEXT_MODEL=x-ai/grok-4.1-fast

# Fallback models for automatic switching on rate limits (comma-separated)
# OpenRouter will automatically try the next model if the primary fails
# IMPORTANT: OpenRouter limits models array to 3 items max (primary + 2 fallbacks)
# 
# For 402 errors (token limit exceeded), fallback models are tried sequentially:
# - Free tier has a 12,545 token prompt limit regardless of model context window
# - If you get 402, the system will try each fallback model one by one
# - If all models fail with 402, the prompt is too large and needs to be reduced
#
# Default: anthropic/claude-3-haiku,google/gemini-2.0-flash-exp:free
GASLIGHT_TEXT_MODEL_FALLBACKS=anthropic/claude-3-haiku,google/gemini-2.0-flash-exp:free

# Vision/audio analysis model (default: openai/gpt-4o-mini)
GASLIGHT_VISION_MODEL=openai/gpt-4o-mini
```

### LLM Provider Selection

By default the app uses OpenRouter. For Russian deployments you may want to
route text analysis to **YandexGPT** instead, keeping data within Yandex Cloud.

```bash
# LLM provider selection:
# - openrouter (default)
# - yandex (YandexGPT via Yandex Cloud)
LLM_PROVIDER=openrouter
```

### YandexGPT Configuration (optional, for RU-friendly setup)

To use YandexGPT instead of OpenRouter for **text analysis**, you need to
configure Yandex Cloud credentials. Vision/media analysis will still use
OpenRouter in the current version.

```bash
# Required for YandexGPT (used when LLM_PROVIDER=yandex)
YANDEX_IAM_TOKEN=your-yandex-iam-token-here
YANDEX_FOLDER_ID=your-yandex-cloud-folder-id-here

# Optional: override model URI. If not set, defaults to:
# gpt://$YANDEX_FOLDER_ID/yandexgpt/latest
YANDEX_MODEL_URI=gpt://your-folder-id/yandexgpt/latest
```

### Upload & Analysis Limits
```bash
# Maximum upload size in MB (default: 25)
MAX_UPLOAD_SIZE_MB=25

# Analysis timeout in milliseconds (default: 120000 = 2 minutes)
ANALYSIS_TIMEOUT_MS=120000
```

### Premium Features (Optional - for production)
```bash
# Secret for signing premium tokens
PREMIUM_TOKEN_SECRET=your-secret-key-here

# Secret for upload tokens (falls back to PREMIUM_TOKEN_SECRET if not set)
UPLOAD_TOKEN_SECRET=your-secret-key-here
```

### Redis Configuration (Optional but Recommended)

For serverless deployments (Vercel), use Redis to solve worker isolation issues.

```bash
# This is automatically set by Vercel when you create a Redis database
# No manual configuration needed in production
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
```

**Setup**: 
1. Go to Vercel Dashboard → Storage → Create Database → Redis
2. Link it to your project
3. Vercel automatically sets `REDIS_URL` environment variable

**Note**: If Redis is not configured, the app falls back to in-memory stores (works for local dev or VPS).

See `docs/REDIS_SETUP.md` for detailed setup instructions.

### Deployment Configuration
```bash
# Base URL for your app (auto-detected on Vercel)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Vercel automatically provides this
VERCEL_URL=your-deployment.vercel.app
```

## Setup Instructions

### Local Development

1. Create `.env.local` in the `gaslight_detector` directory:
```bash
cd gaslight_detector
touch .env.local
```

2. Add at minimum:
```bash
OPENROUTER_API_KEY=your-api-key-here
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `OPENROUTER_API_KEY` and any other variables
4. Ensure they're added for:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development** (optional)

5. **Important**: After adding env vars, trigger a new deployment

## Troubleshooting

### Missing OPENROUTER_API_KEY Error

If you see:
```
Error: Missing required environment variables: OPENROUTER_API_KEY
```

**Solution**: 
- Verify the variable is set in Vercel Dashboard
- Ensure it's enabled for the correct environment (Production/Preview)
- Redeploy your application

### API Routes Returning Errors

If API routes fail with configuration errors:
- Check Vercel Function Logs: Dashboard → Project → Functions → Logs
- Verify all required env vars are present
- Ensure the API key is valid and has proper permissions

## Security Notes

⚠️ **Never commit `.env` or `.env.local` files to git!**
- These files are already in `.gitignore`
- Use Vercel Dashboard for production secrets
- Use `.env.local` for local development only




