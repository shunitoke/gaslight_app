'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ColorTheme = 'default' | 'alternative';
export type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const COLOR_THEME_STORAGE_KEY = 'gaslight-color-theme';
const COLOR_SCHEME_STORAGE_KEY = 'gaslight-color-scheme';

/**
 * Detect system color scheme preference
 */
function detectSystemColorScheme(): ColorScheme {
  if (typeof window === 'undefined') {
    return 'light'; // Server-side default
  }
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from localStorage / document to avoid flicker on first paint
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window === 'undefined') return 'alternative';
    const stored =
      localStorage.getItem(COLOR_THEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-theme');
    if (stored === 'default' || stored === 'alternative') return stored;
    const current = document.documentElement.getAttribute('data-color-theme');
    return current === 'alternative' ? 'alternative' : 'alternative';
  });
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored =
      (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
        localStorage.getItem('gaslite-color-scheme')) as ColorScheme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) return 'dark';
    return detectSystemColorScheme();
  });

  // Load from localStorage immediately on mount (inline script / SSR already applied, we just sync state)
  useEffect(() => {
    // Load color theme (migrate from old key if present)
    const storedTheme =
      localStorage.getItem(COLOR_THEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-theme');
    if (storedTheme === 'visual-concept') {
      // Migrate old 'visual-concept' to 'alternative' (blue is now default)
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'alternative');
      setColorThemeState('alternative');
    } else if (storedTheme && (storedTheme === 'default' || storedTheme === 'alternative')) {
      setColorThemeState(storedTheme as ColorTheme);
    } else {
      // No stored theme - check what inline script set, or default to 'alternative'
      const currentTheme = document.documentElement.getAttribute('data-color-theme');
      if (currentTheme === 'alternative') {
        setColorThemeState('alternative');
      } else {
        setColorThemeState('alternative');
      }
    }
    
    // Load color scheme - prioritize localStorage, fallback to system preference
    const storedScheme = (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-scheme')) as ColorScheme | null;
    if (storedScheme && (storedScheme === 'light' || storedScheme === 'dark')) {
      setColorSchemeState(storedScheme);
    } else {
      // No stored preference - check what inline script set, or use system preference
      const isDark = document.documentElement.classList.contains('dark');
      setColorSchemeState(isDark ? 'dark' : detectSystemColorScheme());
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemPreferenceChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const storedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
      if (!storedScheme) {
        setColorSchemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemPreferenceChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemPreferenceChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
      } else {
        mediaQuery.removeListener(handleSystemPreferenceChange);
      }
    };
  }, []);

  useEffect(() => {
    // Apply theme changes immediately and save to localStorage + cookies
    const root = document.documentElement;
    
    // Set color theme
    if (colorTheme === 'alternative') {
      root.setAttribute('data-color-theme', 'alternative');
    } else {
      root.removeAttribute('data-color-theme');
    }
    // Save immediately to localStorage
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch (e) {
      // Ignore localStorage errors
    }
    // Mirror to cookie so the server (Next.js layout) can SSR the correct theme
    try {
      document.cookie = `${COLOR_THEME_STORAGE_KEY}=${colorTheme}; path=/; max-age=31536000; samesite=lax`;
    } catch (e) {
      // Ignore cookie errors
    }

    // Set color scheme (light/dark)
    if (colorScheme === 'dark') {
      root.setAttribute('data-color-scheme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-color-scheme');
      root.classList.remove('dark');
    }
    // Save immediately to localStorage
    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
    } catch (e) {
      // Ignore localStorage errors
    }
    // Mirror to cookie so SSR can read it
    try {
      document.cookie = `${COLOR_SCHEME_STORAGE_KEY}=${colorScheme}; path=/; max-age=31536000; samesite=lax`;
    } catch (e) {
      // Ignore cookie errors
    }
  }, [colorTheme, colorScheme]);

  // These setters immediately update state, which triggers useEffect to save to localStorage
  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme);
  };

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
  };

  const value = useMemo(
    () => ({ colorTheme, setColorTheme, colorScheme, setColorScheme }),
    [colorTheme, colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
};

