import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { BackgroundAnimation } from '../components/layout/BackgroundAnimation';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { PWAInstaller } from '../components/PWAInstaller';
import { LanguageProvider, LOCALE_STORAGE_KEY } from '../features/i18n';
import { ThemeProvider } from '../features/theme';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="Texts with My Ex" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Texts with My Ex" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apply theme synchronously before React hydration to prevent white flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Load color scheme from localStorage (new key, then legacy key)
                  const storedScheme = localStorage.getItem('gaslight-color-scheme') ||
                    localStorage.getItem('gaslite-color-scheme');
                  if (storedScheme === 'dark') {
                    document.documentElement.setAttribute('data-color-scheme', 'dark');
                    document.documentElement.classList.add('dark');
                  } else if (storedScheme === 'light') {
                    document.documentElement.removeAttribute('data-color-scheme');
                    document.documentElement.classList.remove('dark');
                  } else {
                    // No stored preference - use system preference
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.setAttribute('data-color-scheme', 'dark');
                      document.documentElement.classList.add('dark');
                    }
                  }
                  
                  // Load color theme from localStorage (new key, then legacy key)
                  const storedTheme = localStorage.getItem('gaslight-color-theme') ||
                    localStorage.getItem('gaslite-color-theme');
                  if (storedTheme === 'alternative') {
                    document.documentElement.setAttribute('data-color-theme', 'alternative');
                  } else {
                    document.documentElement.removeAttribute('data-color-theme');
                  }
                  
                  // Load language from localStorage and set html lang attribute
                  const storedLocale = localStorage.getItem('${LOCALE_STORAGE_KEY}') ||
                    localStorage.getItem('gaslite-locale');
                  if (storedLocale && ['en', 'ru', 'fr', 'de', 'es', 'pt'].includes(storedLocale)) {
                    document.documentElement.setAttribute('lang', storedLocale);
                  } else {
                    // Use system language
                    const systemLang = navigator.language || 'en';
                    const langCode = systemLang.split('-')[0].toLowerCase();
                    const supportedLangs = ['en', 'ru', 'fr', 'de', 'es', 'pt'];
                    if (supportedLangs.includes(langCode)) {
                      document.documentElement.setAttribute('lang', langCode);
                    }
                  }
                } catch (e) {
                  // Ignore localStorage errors
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <BackgroundAnimation />
        <PWAInstaller />
        <ThemeProvider>
          <LanguageProvider>
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
      </body>
    </html>
  );
}

