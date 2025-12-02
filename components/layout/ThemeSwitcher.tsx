'use client';

import React from 'react';

import { useTheme } from '../../features/theme';

export const ThemeSwitcher = () => {
  const { colorTheme, setColorTheme, colorScheme, setColorScheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // Prevent hydration mismatch by only showing correct state after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAlternative = colorTheme === 'alternative';
  const isDark = colorScheme === 'dark';
  
  // During SSR and before mount, default to light mode to match server render
  const displayIsDark = mounted ? isDark : false;

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* Light/Dark Mode Toggle */}
      <button
        type="button"
        onClick={() => setColorScheme(displayIsDark ? 'light' : 'dark')}
        className="relative flex h-6 w-10 sm:h-7 sm:w-12 items-center rounded-full border border-primary/30 bg-gradient-to-r transition-all duration-300 ease-in-out hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
        aria-label={`Switch to ${displayIsDark ? 'light' : 'dark'} mode`}
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            displayIsDark ? 'bg-gradient-to-r from-primary/60 to-accent/60' : 'bg-gradient-to-r from-accent/20 to-primary/20'
          }`}
        />
        <span
          className={`relative z-10 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            displayIsDark ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px]">
            {displayIsDark ? '🌙' : '☀️'}
          </span>
        </span>
      </button>

      {/* Color Theme Toggle */}
      <button
        type="button"
        onClick={() => setColorTheme(isAlternative ? 'default' : 'alternative')}
        className="relative flex h-6 w-12 sm:h-7 sm:w-16 items-center rounded-full border border-primary/30 bg-gradient-to-r transition-all duration-500 ease-in-out hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
        aria-label={`Switch to ${isAlternative ? 'pink' : 'blue'} color theme`}
      >
        {/* Background gradient that shifts */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r transition-all duration-500 ease-in-out ${
            isAlternative
              ? 'from-primary/50 via-accent/50 to-primary/50'
              : 'from-accent/50 via-primary/50 to-accent/50'
          }`}
        />
        
        {/* Sliding toggle circle */}
        <span
          className={`relative z-10 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br shadow-lg transition-all duration-500 ease-in-out ${
            isAlternative
              ? 'translate-x-0.5 sm:translate-x-1 bg-gradient-to-br from-primary via-accent to-primary'
              : 'translate-x-7 sm:translate-x-10 bg-gradient-to-br from-accent via-primary to-accent'
          }`}
          style={{
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)'
          }}
        />
      </button>
    </div>
  );
};
