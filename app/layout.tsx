import './globals.css';

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import React from 'react';
import { cookies, headers } from 'next/headers';

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ConditionalBackgroundAnimation } from '../components/layout/ConditionalBackgroundAnimation';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { PWAInstaller } from '../components/PWAInstaller';
import { LanguageProvider, LOCALE_STORAGE_KEY, supportedLocales } from '../features/i18n';
import type { SupportedLocale } from '../features/i18n/types';
import { ThemeProvider } from '../features/theme';
import { AnimationProvider } from '../contexts/AnimationContext';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});
const playfair = Playfair_Display({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  // Only preload Inter (main font), Playfair loads when needed via variable
  preload: false,
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  title: 'Texts with My Ex - AI Gaslight Detection',
  description:
    'Upload Telegram or WhatsApp chats to receive an impartial, AI-powered relationship analysis. Detect gaslighting patterns, communication issues, and relationship dynamics.',
  keywords: ['gaslighting detection', 'relationship analysis', 'AI analysis', 'chat analysis', 'telegram', 'whatsapp'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Texts with My Ex'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    title: 'Texts with My Ex - AI Gaslight Detection',
    description: 'AI-powered relationship analysis from your chat exports. Detect gaslighting patterns and communication issues.',
    type: 'website',
    siteName: 'Texts with My Ex',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Texts with My Ex - AI Gaslight Detection',
    description: 'AI-powered relationship analysis from your chat exports.',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FA' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1a1a' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

type RootLayoutProps = {
  children: React.ReactNode;
};

// Helper to detect browser language from Accept-Language header
function detectBrowserLanguageFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return 'en';
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  const languageMap: Record<string, SupportedLocale> = {
    en: 'en',
    ru: 'ru',
    fr: 'fr',
    de: 'de',
    es: 'es',
    pt: 'pt'
  };

  // List of supported locales (inline to avoid import issues on server)
  const supported: SupportedLocale[] = ['en', 'ru', 'fr', 'de', 'es', 'pt'];

  for (const lang of languages) {
    if (languageMap[lang.code] && supported.includes(languageMap[lang.code])) {
      return languageMap[lang.code];
    }
  }

  return 'en';
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Read persisted preferences from cookies so each page is SSR'd
  // with the user's last chosen theme and language (no flash).
  const cookieStore = await cookies();
  const headersList = await headers();
  const schemeCookie = cookieStore.get('gaslight-color-scheme')?.value;
  const themeCookie = cookieStore.get('gaslight-color-theme')?.value;
  const localeCookie = cookieStore.get(LOCALE_STORAGE_KEY)?.value;

  const initialScheme = schemeCookie === 'dark' ? 'dark' : 'light';
  const initialTheme =
    themeCookie === 'default' || themeCookie === 'alternative'
      ? themeCookie
      : 'alternative';
  
  // Determine initial locale:
  // 1. Use cookie if exists (user has chosen before)
  // 2. Otherwise detect from Accept-Language header (browser language)
  // 3. Fallback to 'en'
  let initialLocale: SupportedLocale;
  if (localeCookie && localeCookie.length > 0 && supportedLocales.includes(localeCookie as SupportedLocale)) {
    initialLocale = localeCookie as SupportedLocale;
  } else {
    const acceptLanguage = headersList.get('accept-language');
    initialLocale = detectBrowserLanguageFromHeader(acceptLanguage);
  }

  return (
    <html
      lang={initialLocale}
      suppressHydrationWarning
      data-color-theme={initialTheme === 'alternative' ? 'alternative' : undefined}
      data-color-scheme={initialScheme === 'dark' ? 'dark' : undefined}
      className={initialScheme === 'dark' ? 'dark' : undefined}
    >
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="Texts with My Ex" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Texts with My Ex" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        {/* Resource hints - Next.js handles font preconnect automatically */}
        <link rel="dns-prefetch" href="https://openrouter.ai" />
      </head>
      <body className={`${inter.className} ${playfair.variable} bg-background text-foreground`} suppressHydrationWarning>
        <AnimationProvider>
          <ConditionalBackgroundAnimation />
          <PWAInstaller />
          <ThemeProvider>
            <LanguageProvider initialLocale={initialLocale as SupportedLocale}>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1" id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
              <PWAInstallPrompt />
            </LanguageProvider>
          </ThemeProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}

