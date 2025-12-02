'use client';

import React from 'react';

import { useLanguage } from '../../features/i18n';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 sm:px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>{t('footer_disclaimer')}</span>
        <div className="flex items-center gap-3">
          <a
            href="/terms"
            className="underline-offset-4 hover:underline"
          >
            Terms &amp; Conditions
          </a>
          <span>&copy; {new Date().getFullYear()} Texts with My Ex</span>
        </div>
      </div>
    </footer>
  );
};

