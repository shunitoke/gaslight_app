# AI Gaslight Detection App

A privacy-first, anonymous web application that uses AI to analyze relationship chat exports (Telegram, WhatsApp) to provide impartial, science-informed insights about communication patterns.

## Features

- **Anonymous & Ephemeral**: No user accounts, no persistent storage. All data is processed temporarily and deleted after analysis.
- **Multi-platform Support**: Import and analyze chats from Telegram and WhatsApp
- **Freemium Model**: 
  - **Free**: Text/JSON imports, up to 50k messages, basic analysis
  - **Premium**: ZIP imports with media, media analysis, enhanced analysis, up to 500k messages
- **Multimodal Analysis**: Analyzes text, images, stickers, GIFs, and voice messages using Vision API (premium)
- **Multilingual UI**: Supports English, Russian, French, German, Spanish, and Portuguese
- **Theme Support**: Choose between default and visual concept themes
- **GDPR Compliant**: Strict data handling with explicit consent and deletion capabilities

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript
- **AI/LLM**: OpenRouter API for text and vision analysis
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **PWA**: Progressive Web App support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenRouter API key

### Installation

1. Clone the repository and navigate to the `site` directory:
```bash
cd site
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
OPENROUTER_API_KEY=your_api_key_here
GASLIGHT_TEXT_MODEL=openai/gpt-4o-mini
GASLIGHT_VISION_MODEL=openai/gpt-4o-mini
MAX_UPLOAD_SIZE_MB=25
ANALYSIS_TIMEOUT_MS=120000
```

4. **Testing Premium Features**: To test premium features (ZIP imports, media analysis, enhanced analysis), add the `x-subscription-tier: premium` header to your API requests. In development, you can use browser dev tools or a tool like Postman.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run E2E tests with Playwright

## Project Structure

```
site/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── analysis/          # Analysis report page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── report/           # Report display components
│   └── ui/               # UI primitives (Button, Card, Input)
├── features/             # Feature modules
│   ├── analysis/         # Analysis logic and types
│   ├── i18n/            # Internationalization
│   ├── import/          # Chat import parsers
│   ├── report/          # Report mapping
│   └── theme/           # Theme system
├── lib/                  # Shared utilities
│   ├── config.ts        # Runtime configuration
│   ├── openrouter.ts    # OpenRouter API client
│   ├── telemetry.ts     # Logging
│   └── vision.ts        # Vision/audio analysis
└── tests/               # Test files
    ├── unit/            # Unit tests
    ├── integration/      # Integration tests
    └── e2e/             # E2E tests
```

## Configuration

### Environment Variables

- `OPENROUTER_API_KEY` (required) - Your OpenRouter API key
- `OPENROUTER_BASE_URL` (optional) - OpenRouter API base URL (default: https://openrouter.ai/api/v1)
- `GASLIGHT_TEXT_MODEL` (optional) - Model for text analysis (default: openai/gpt-4o-mini)
- `GASLIGHT_VISION_MODEL` (optional) - Model for vision analysis (default: openai/gpt-4o-mini)
- `MAX_UPLOAD_SIZE_MB` (optional) - Maximum upload size in MB (default: 25)
- `ANALYSIS_TIMEOUT_MS` (optional) - Analysis timeout in milliseconds (default: 120000)

## Security & Privacy

- **Rate Limiting**: API routes are rate-limited (5 requests/minute for import, 3/minute for analysis)
- **File Size Limits**: Configurable maximum upload size
- **Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Ephemeral Processing**: No persistent storage of user data
- **Anonymous**: No user accounts or login required

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
- WCAG 2.1 AA compliant color contrasts

## License

[Add your license here]

## Support

For issues and questions, please [open an issue](link-to-issues).

