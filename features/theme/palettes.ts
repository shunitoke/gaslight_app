// Shared palette definitions (no client-only code; safe for server/edge)
import type React from 'react';

export type PaletteName = 'default' | 'alternative';
export type Scheme = 'light' | 'dark';

export type ColorTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  legacy: {
    colorPrimary: string;
    colorAccent: string;
    colorWarning: string;
    colorNeutral: string;
    colorText: string;
    colorHighlight: string;
  };
};

type PaletteConfig = Record<PaletteName, Record<Scheme, ColorTokens>>;

// Centralized palette definitions (HSL strings) to avoid drift across CSS/JS.
export const palettes: PaletteConfig = {
  default: {
    light: {
      background: '0 0% 98%',
      foreground: '0 0% 15%',
      card: '0 0% 95%',
      cardForeground: '0 0% 15%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 15%',
      primary: '350 65% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '355 70% 75%',
      secondaryForeground: '0 0% 15%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      accent: '350 65% 45%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '350 60% 80% / 0.4',
      input: '350 60% 80% / 0.4',
      ring: '350 65% 45%',
      legacy: {
        colorPrimary: '#f5a8b8',
        colorAccent: '#c7365a',
        colorWarning: '#d17a47',
        colorNeutral: '#fafafa',
        colorText: '#262626',
        colorHighlight: '#d4af37'
      }
    },
    dark: {
      background: '230 16% 8%', // #0f1218
      foreground: '0 0% 96%',
      card: '230 14% 12%', // #161b24
      cardForeground: '0 0% 96%',
      popover: '230 14% 10%',
      popoverForeground: '0 0% 96%',
      // Align accent tones with light theme for a friendlier dark palette
      primary: '350 65% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '355 70% 75%',
      secondaryForeground: '0 0% 96%',
      muted: '230 12% 18%',
      mutedForeground: '210 12% 72%',
      accent: '350 65% 45%',
      accentForeground: '0 0% 100%',
      destructive: '0 70% 56%',
      destructiveForeground: '0 0% 98%',
      border: '350 60% 80% / 0.35',
      input: '350 60% 80% / 0.35',
      ring: '350 65% 45%',
      legacy: {
        colorPrimary: '#f5a8b8',
        colorAccent: '#c7365a',
        colorWarning: '#e68a5a',
        colorNeutral: '#0f1218',
        colorText: '#f3f3f3',
        colorHighlight: '#d4af37'
      }
    }
  },
  alternative: {
    light: {
      background: '210 20% 98%',
      foreground: '0 0% 18%',
      card: '0 0% 95%',
      cardForeground: '0 0% 18%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 18%',
      primary: '195 60% 36%', // brighter blue accent
      primaryForeground: '0 0% 100%',
      secondary: '215 24% 52%',
      secondaryForeground: '0 0% 100%',
      muted: '210 20% 98%',
      mutedForeground: '0 0% 42%',
      accent: '195 60% 36%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '215 24% 52% / 0.35',
      input: '215 24% 52% / 0.35',
      ring: '195 60% 36%',
      legacy: {
        colorPrimary: '#7294c0',
        colorAccent: '#2f6c82',
        colorWarning: '#d17a47',
        colorNeutral: '#f8f9fa',
        colorText: '#2d2d2d',
        colorHighlight: '#c9a961'
      }
    },
    dark: {
      background: '215 28% 8%', // #0d141d
      foreground: '0 0% 95%',
      card: '215 26% 12%', // #161f2b
      cardForeground: '0 0% 95%',
      popover: '215 26% 10%',
      popoverForeground: '0 0% 95%',
      // Brighter blue accents for dark as well
      primary: '195 60% 40%',
      primaryForeground: '0 0% 100%',
      secondary: '215 24% 55%',
      secondaryForeground: '0 0% 96%',
      muted: '215 22% 16%',
      mutedForeground: '210 12% 72%',
      accent: '195 60% 40%',
      accentForeground: '0 0% 100%',
      destructive: '0 70% 56%',
      destructiveForeground: '0 0% 98%',
      border: '215 24% 55% / 0.4',
      input: '215 24% 55% / 0.4',
      ring: '195 60% 40%',
      legacy: {
        colorPrimary: '#7aa5d4',
        colorAccent: '#3b7b97',
        colorWarning: '#e68a5a',
        colorNeutral: '#0d141d',
        colorText: '#f3f3f3',
        colorHighlight: '#c9a961'
      }
    }
  }
};

export function getPalette(theme: PaletteName, scheme: Scheme): ColorTokens {
  return palettes[theme][scheme];
}

export function applyPaletteToElement(el: HTMLElement, palette: ColorTokens, scheme: Scheme) {
  const set = (k: string, v: string) => el.style.setProperty(k, v);

  set('--background', palette.background);
  set('--foreground', palette.foreground);
  set('--card', palette.card);
  set('--card-foreground', palette.cardForeground);
  set('--popover', palette.popover);
  set('--popover-foreground', palette.popoverForeground);
  set('--primary', palette.primary);
  set('--primary-foreground', palette.primaryForeground);
  set('--secondary', palette.secondary);
  set('--secondary-foreground', palette.secondaryForeground);
  set('--muted', palette.muted);
  set('--muted-foreground', palette.mutedForeground);
  set('--accent', palette.accent);
  set('--accent-foreground', palette.accentForeground);
  set('--destructive', palette.destructive);
  set('--destructive-foreground', palette.destructiveForeground);
  set('--border', palette.border);
  set('--input', palette.input);
  set('--ring', palette.ring);

  set('--color-primary', palette.legacy.colorPrimary);
  set('--color-accent', palette.legacy.colorAccent);
  set('--color-warning', palette.legacy.colorWarning);
  set('--color-neutral', palette.legacy.colorNeutral);
  set('--color-text', palette.legacy.colorText);
  set('--color-highlight', palette.legacy.colorHighlight);

  // Help native form controls pick the right scheme.
  set('color-scheme', scheme === 'dark' ? 'dark' : 'light');
}

export function paletteToStyleObject(palette: ColorTokens, scheme: Scheme) {
  return {
    '--background': palette.background,
    '--foreground': palette.foreground,
    '--card': palette.card,
    '--card-foreground': palette.cardForeground,
    '--popover': palette.popover,
    '--popover-foreground': palette.popoverForeground,
    '--primary': palette.primary,
    '--primary-foreground': palette.primaryForeground,
    '--secondary': palette.secondary,
    '--secondary-foreground': palette.secondaryForeground,
    '--muted': palette.muted,
    '--muted-foreground': palette.mutedForeground,
    '--accent': palette.accent,
    '--accent-foreground': palette.accentForeground,
    '--destructive': palette.destructive,
    '--destructive-foreground': palette.destructiveForeground,
    '--border': palette.border,
    '--input': palette.input,
    '--ring': palette.ring,
    '--color-primary': palette.legacy.colorPrimary,
    '--color-accent': palette.legacy.colorAccent,
    '--color-warning': palette.legacy.colorWarning,
    '--color-neutral': palette.legacy.colorNeutral,
    '--color-text': palette.legacy.colorText,
    '--color-highlight': palette.legacy.colorHighlight,
    'color-scheme': scheme === 'dark' ? 'dark' : 'light'
  } as React.CSSProperties;
}

