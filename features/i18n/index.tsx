'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

import { deBundle } from './locales/de';
import { enBundle } from './locales/en';
import { esBundle } from './locales/es';
import { frBundle } from './locales/fr';
import { ptBundle } from './locales/pt';
import { ruBundle } from './locales/ru';
import type { LocaleBundle, SupportedLocale } from './types';

const bundles: Record<SupportedLocale, LocaleBundle> = {
  en: enBundle,
  ru: ruBundle,
  fr: frBundle,
  de: deBundle,
  es: esBundle,
  pt: ptBundle
};

export const supportedLocales = Object.keys(bundles) as SupportedLocale[];
export const defaultLocale: SupportedLocale = 'en';

// Single source of truth for locale storage key so that
// LanguageProvider and RootLayout agree on the same value.
export const LOCALE_STORAGE_KEY = 'gaslight-locale';

type LanguageContextValue = {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Detect system language and map to supported locale
 */
function detectSystemLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const systemLang = navigator.language || (navigator as any).userLanguage || 'en';
  const langCode = systemLang.split('-')[0].toLowerCase();

  // Map system language to supported locale
  const languageMap: Record<string, SupportedLocale> = {
    en: 'en',
    ru: 'ru',
    fr: 'fr',
    de: 'de',
    es: 'es',
    pt: 'pt'
  };

  // Check if full locale is supported (e.g., 'en-US' -> 'en')
  if (supportedLocales.includes(systemLang.toLowerCase() as SupportedLocale)) {
    return systemLang.toLowerCase() as SupportedLocale;
  }

  // Check if language code is supported
  if (languageMap[langCode]) {
    return languageMap[langCode];
  }

  // Fallback to default
  return defaultLocale;
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Always start with defaultLocale to ensure server/client match
  // System language will be detected and applied after mount
  const [locale, setLocale] = useState<SupportedLocale>(defaultLocale);
  const [mounted, setMounted] = React.useState(false);

  // Auto-detect system language after mount
  React.useEffect(() => {
    // Use setTimeout to defer setState and avoid cascading renders warning
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    // Check localStorage first (user preference)
    // Prefer new unified key, but fall back to old keys for backwards compatibility.
    const stored =
      localStorage.getItem(LOCALE_STORAGE_KEY) ??
      localStorage.getItem('gaslite-locale') ??
      localStorage.getItem('app-locale');

    if (stored && supportedLocales.includes(stored as SupportedLocale)) {
      setLocale(stored as SupportedLocale);
    } else {
      // Otherwise detect from system
      const detected = detectSystemLanguage();
      setLocale(detected);
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when locale changes (only after mount)
  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      // Keep <html lang="..."> in sync with current locale for a11y/SEO.
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', locale);
      }
    }
  }, [locale, mounted]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string) => bundles[locale].messages[key] ?? key;
    return { locale, setLocale, t };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
};

export const getLocaleDisplayName = (locale: SupportedLocale) => bundles[locale].displayName;

