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

export const LanguageProvider = ({ 
  children,
  initialLocale 
}: { 
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}) => {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (initialLocale && supportedLocales.includes(initialLocale)) {
      return initialLocale;
    }
    if (typeof window !== 'undefined') {
      const htmlLang = document.documentElement.getAttribute('lang');
      if (htmlLang && supportedLocales.includes(htmlLang as SupportedLocale)) {
        return htmlLang as SupportedLocale;
      }
      const stored =
        localStorage.getItem(LOCALE_STORAGE_KEY) ??
        localStorage.getItem('gaslite-locale') ??
        localStorage.getItem('app-locale');
      if (stored && supportedLocales.includes(stored as SupportedLocale)) {
        return stored as SupportedLocale;
      }
    }
    return defaultLocale;
  });

  // Sync from storage once after mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored =
      localStorage.getItem(LOCALE_STORAGE_KEY) ??
      localStorage.getItem('gaslite-locale') ??
      localStorage.getItem('app-locale');
    if (stored && supportedLocales.includes(stored as SupportedLocale) && stored !== locale) {
      setLocale(stored as SupportedLocale);
    }
  }, []); // run once

  // Persist locale and keep <html lang> in sync
  React.useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.setAttribute('lang', locale);
    } catch {
      // ignore storage errors
    }
  }, [locale]);

  // Cache translations in memory to prevent re-computation
  const translationCache = useMemo(() => {
    const cache = new Map<string, string>();
    const bundle = bundles[locale];
    return {
      get: (key: string) => {
        if (cache.has(key)) {
          return cache.get(key)!;
        }
        const value = bundle.messages[key] ?? key;
        cache.set(key, value);
        return value;
      },
      clear: () => cache.clear(),
    };
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string) => translationCache.get(key);
    return { locale, setLocale, t };
  }, [locale, translationCache]);

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

