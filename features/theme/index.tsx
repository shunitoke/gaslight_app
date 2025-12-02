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
  // Initialize with 'light' to ensure server/client match (prevents hydration mismatch)
  // System preference will be detected and applied after mount
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('default');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('light');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage and detect system preference after mount
  useEffect(() => {
    // Use setTimeout to defer setState and avoid cascading renders warning
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    // Load color theme (migrate from old key if present)
    const storedTheme =
      localStorage.getItem(COLOR_THEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-theme');
    if (storedTheme === 'visual-concept') {
      // Migrate old 'visual-concept' to 'default' (pink is now default)
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'default');
      setColorThemeState('default');
    } else if (storedTheme && (storedTheme === 'default' || storedTheme === 'alternative')) {
      setColorThemeState(storedTheme as ColorTheme);
    }
    
    // Load color scheme - prioritize localStorage, fallback to system preference
    const storedScheme = (localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
      localStorage.getItem('gaslite-color-scheme')) as ColorScheme | null;
    if (storedScheme && (storedScheme === 'light' || storedScheme === 'dark')) {
      setColorSchemeState(storedScheme);
    } else {
      // No stored preference - use system preference
      const systemScheme = detectSystemColorScheme();
      setColorSchemeState(systemScheme);
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
      clearTimeout(timer);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
      } else {
        mediaQuery.removeListener(handleSystemPreferenceChange);
      }
    };
  }, []);

  useEffect(() => {
    // Only apply theme changes after mount to prevent hydration mismatch
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Set color theme
    if (colorTheme === 'alternative') {
      root.setAttribute('data-color-theme', 'alternative');
    } else {
      root.removeAttribute('data-color-theme');
    }
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);

    // Set color scheme (light/dark)
    if (colorScheme === 'dark') {
      root.setAttribute('data-color-scheme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-color-scheme');
      root.classList.remove('dark');
    }
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
  }, [colorTheme, colorScheme, mounted]);

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

