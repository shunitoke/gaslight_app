'use client';

import React from 'react';
import { Languages } from 'lucide-react';

import { defaultLocale, getLocaleDisplayName, supportedLocales, useLanguage } from '../../features/i18n';
import { enBundle } from '../../features/i18n/locales/en';

const localeToCode: Record<string, string> = {
  en: 'EN',
  ru: 'RU',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
  pt: 'PT'
};

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  // Prevent hydration mismatch by only showing correct locale after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Hide switcher until we've mounted and synced language from storage
  // so it doesn't first render as "English" and then jump to the saved
  // language on every page load.
  if (!mounted) {
    return null;
  }

  // After mount we can safely rely on context value.
  const displayLocale = locale;
  const displayT = t;

  const handleMobileClick = () => {
    if (selectRef.current) {
      if (typeof selectRef.current.showPicker === 'function') {
        selectRef.current.showPicker();
      } else {
        selectRef.current.click();
      }
    }
  };

  return (
    <>
      {/* Mobile: Icon-only button that triggers native select */}
      <button
        type="button"
        onClick={handleMobileClick}
        className="sm:hidden flex items-center justify-center w-6 h-6 rounded border-0 bg-transparent hover:bg-muted/30 transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        aria-label={`${displayT('language_label')}: ${getLocaleDisplayName(displayLocale)}`}
        title={getLocaleDisplayName(displayLocale)}
      >
        <Languages className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {/* Hidden native select for mobile */}
      <select
        ref={selectRef}
        value={displayLocale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="sm:hidden absolute opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        {supportedLocales.map((code) => (
          <option key={code} value={code}>
            {getLocaleDisplayName(code)}
          </option>
        ))}
      </select>
      
      {/* Desktop: Full dropdown with icon */}
      <label className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
        <Languages className="h-3.5 w-3.5" />
        <select
          value={displayLocale}
          onChange={(event) => setLocale(event.target.value as typeof locale)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring hover:border-primary/50 cursor-pointer min-w-[100px]"
        >
          {supportedLocales.map((code) => (
            <option key={code} value={code}>
              {getLocaleDisplayName(code)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};

