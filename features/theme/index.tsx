'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { applyPaletteToElement, getPalette, type PaletteName, type Scheme } from './palettes';

type ThemeContextValue = {
  colorTheme: PaletteName;
  setColorTheme: (theme: PaletteName) => void;
  colorScheme: Scheme;
  setColorScheme: (scheme: Scheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const COLOR_THEME_STORAGE_KEY = 'gaslight-color-theme';
const COLOR_SCHEME_STORAGE_KEY = 'gaslight-color-scheme';

/**
 * Detect system color scheme preference
 */
// Always default to light unless user opts in (per requirements).
const detectInitialScheme = (): Scheme => 'light';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from localStorage / document to avoid flicker on first paint
  const [colorTheme, setColorThemeState] = useState<PaletteName>(() => {
    if (typeof window === 'undefined') return 'default';
    const stored =
      localStorage.getItem(COLOR_THEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-theme');
    if (stored === 'default' || stored === 'alternative') return stored as PaletteName;
    const current = document.documentElement.getAttribute('data-color-theme');
    // Default to pink palette unless explicitly set to alternative
    return current === 'alternative' ? 'alternative' : 'default';
  });
  const [colorScheme, setColorSchemeState] = useState<Scheme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored =
      (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
        localStorage.getItem('gaslite-color-scheme')) as Scheme | null;
    if (stored === 'dark' || stored === 'light') return stored as Scheme;
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) return 'dark' as Scheme;
    return detectInitialScheme();
  });

  // Load from localStorage immediately on mount (inline script / SSR already applied, we just sync state)
  useEffect(() => {
    // Load color theme (migrate from old key if present)
    const storedTheme =
      localStorage.getItem(COLOR_THEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-theme');
    if (storedTheme === 'visual-concept') {
      // Migrate old 'visual-concept' to 'alternative' (legacy blue)
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'alternative');
      setColorThemeState('alternative');
    } else if (storedTheme && (storedTheme === 'default' || storedTheme === 'alternative')) {
      setColorThemeState(storedTheme as PaletteName);
    } else {
      // No stored theme - check inline attribute or fall back
      const currentTheme = document.documentElement.getAttribute('data-color-theme');
      setColorThemeState(currentTheme === 'alternative' ? 'alternative' : 'default');
    }
    
    // Load color scheme - prioritize localStorage, fallback to system preference
    const storedScheme = (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-scheme')) as Scheme | null;
    if (storedScheme && (storedScheme === 'light' || storedScheme === 'dark')) {
      setColorSchemeState(storedScheme as Scheme);
    } else {
      setColorSchemeState('light');
    }
    
    // No automatic system syncing; user choice / cookies only.
    return () => {};
  }, []);

  const applyPalette = (theme: PaletteName, scheme: Scheme) => {
    const root = document.documentElement;
    const palette = getPalette(theme, scheme);
    applyPaletteToElement(root, palette, scheme);
    
    // Set attributes/classes for compatibility
    if (theme === 'alternative') {
      root.setAttribute('data-color-theme', 'alternative');
    } else {
      root.setAttribute('data-color-theme', 'default');
    }

    if (scheme === 'dark') {
      root.setAttribute('data-color-scheme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-color-scheme', 'light');
      root.classList.remove('dark');
    }
  };

  useLayoutEffect(() => {
    applyPalette(colorTheme, colorScheme);
  }, []); // apply once on mount based on restored state

  useEffect(() => {
    applyPalette(colorTheme, colorScheme);

    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
      document.cookie = `${COLOR_THEME_STORAGE_KEY}=${colorTheme}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }

    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
      document.cookie = `${COLOR_SCHEME_STORAGE_KEY}=${colorScheme}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
  }, [colorTheme, colorScheme]);

  // These setters immediately update state, which triggers useEffect to save to localStorage
  const setColorTheme = (newTheme: PaletteName) => {
    setColorThemeState(newTheme);
  };

  const setColorScheme = (newScheme: Scheme) => {
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

