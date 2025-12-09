# Gaslight Analysis App

AI assistant that analyzes chat exports and media to highlight manipulation and gaslighting patterns. Runs on the Next.js App Router with anonymous, short-lived data handling.

## Highlights

- Multi‑format import: Telegram, WhatsApp, Signal, Viber, iMessage, Messenger, Discord, generic text/JSON, plus manual paste (up to ~8k chars).
- Multimodal: text, images/stickers/GIF, and voice notes (automatic transcription) via OpenRouter text + vision models.
- Premium flow: Paddle checkout → time-limited premium token stored in `localStorage`; development override headers supported.
- Fast UX: background upload to Vercel Blob, Redis-backed job/progress tracking, analysis caching by chat hash.
- Internationalized UI: en, ru, fr, de, es, pt; light/dark themes and PWA install.
- Privacy-minded: no accounts; uploads and analysis results are ephemeral and can be offloaded to Blob/Redis only for processing.

## Tech Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind + shadcn/ui components
- OpenRouter (text + vision) with model fallback chain
- Vercel Blob for uploads/results; Redis for rate limits, progress, and caching
- Paddle payments for premium access
- Vitest + Testing Library, Playwright E2E; PWA support enabled

## Getting Started

Prerequisites: Node 18+ and npm (or pnpm/yarn/bun), OpenRouter key, Vercel Blob token, optional Redis + Paddle keys for full flow.

1) Install deps (project root):
```bash
npm install
```
2) Create `.env.local` (see template below).
3) Run dev server:
```bash
npm run dev
```
4) Open http://localhost:3000

## Environment Variables

Required
- `OPENROUTER_API_KEY` – OpenRouter key
- `GASLIGHT_VISION_MODEL` – vision-capable model id (e.g. `openai/gpt-4o-mini`)
- `BLOB_READ_WRITE_TOKEN` – Vercel Blob token for direct uploads

Important optional (defaults shown where relevant)
- `OPENROUTER_BASE_URL` (default `https://openrouter.ai/api/v1`)
- `GASLIGHT_TEXT_MODEL` (default `x-ai/grok-4.1-fast`)
- `GASLIGHT_TEXT_MODEL_FALLBACKS` (default `anthropic/claude-3-haiku,google/gemini-2.0-flash-exp:free`)
- `MAX_UPLOAD_SIZE_MB` (default `25`)
- `ANALYSIS_TIMEOUT_MS` (default `120000`)
- `REDIS_URL` (enables shared rate limits/progress/cache)
- `PREMIUM_EVERYONE` (`true` to force premium server-side)
- `NEXT_PUBLIC_PREMIUM_EVERYONE` (`true` to force premium UI)
- `PADDLE_API_KEY`, `PADDLE_PRICE_ID_REPORT`, `PADDLE_ENV` (`sandbox`|`live`), `PADDLE_API_BASE` (override)

Example `.env.local`:
```env
OPENROUTER_API_KEY=sk-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
GASLIGHT_TEXT_MODEL=x-ai/grok-4.1-fast
GASLIGHT_TEXT_MODEL_FALLBACKS=anthropic/claude-3-haiku,google/gemini-2.0-flash-exp:free
GASLIGHT_VISION_MODEL=openai/gpt-4o-mini
MAX_UPLOAD_SIZE_MB=25
ANALYSIS_TIMEOUT_MS=120000
BLOB_READ_WRITE_TOKEN=vercel_blob_token
REDIS_URL=redis://user:pass@host:port
PADDLE_API_KEY=live_or_sandbox_key
PADDLE_PRICE_ID_REPORT=pri_...
PADDLE_ENV=sandbox
# Dev helpers
PREMIUM_EVERYONE=false
NEXT_PUBLIC_PREMIUM_EVERYONE=false
```

## Development & Scripts

- `npm run dev` — start Next dev server
- `npm run build` / `npm run start` — production build/run
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run test` / `npm run test:watch` — Vitest unit/integration
- `npm run test:e2e` — Playwright E2E (run after `npm run dev`)

## Data Handling & Limits

- Analysis start rate limit: 3 req/min/IP (`/api/analyze/start`); defaults to 5 req/min for other rate-limited keys.
- Upload size: defaults to 25 MB (configurable).
- Results may be cached by chat hash to speed repeat analyses; large results can be stored in Vercel Blob with Redis pointers.
- No user accounts; premium tokens are short-lived and stored client-side only.

## Premium & Payments

- Checkout: `POST /api/payment/paddle/checkout` (creates Paddle transaction).
- Confirmation: `POST /api/payment/paddle/confirm` (verifies transaction, returns premium token).
- Client stores token in `localStorage` and sends `x-premium-token` on imports/analysis.
- Dev/testing shortcut: `x-subscription-tier: premium` header or `PREMIUM_EVERYONE=true`.

## Project Structure (top-level)

- `app/` — App Router pages and API routes (`analysis`, `pricing`, `admin`, etc.)
- `components/` — UI, layout, analysis/report widgets, PWA prompts
- `features/` — domain logic (analysis, import/parsers, i18n, subscription, theme, report mapping)
- `lib/` — config, OpenRouter client, telemetry, rate limiting, blob/kv helpers
- `public/` — PWA assets and icons
- `tests/` — unit/integration (`vitest`), e2e (`playwright`)

## Troubleshooting

- Upload failing with 503: ensure `BLOB_READ_WRITE_TOKEN` is set and Blob is accessible.
- Progress stuck: check `REDIS_URL`; without Redis, progress falls back to in-memory (single worker only).
- Vision/media analysis errors: verify `GASLIGHT_VISION_MODEL` supports images/audio.
- Paddle sandbox: set `PADDLE_ENV=sandbox` and use sandbox price ID.

## Support

Please open an issue or start a discussion in the repo with logs and steps to reproduce.

