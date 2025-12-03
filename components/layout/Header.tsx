import Link from 'next/link';
import React from 'react';

import { HelpTooltip } from './HelpTooltip';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Header = () => (
  <header className="border-b border-border bg-background/80 backdrop-blur-md animate-fade-in" role="banner">
    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-label uppercase tracking-wider text-primary truncate animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }} aria-label="App category">
          AI Gaslight Detection
        </p>
        <h1 className="text-heading-sm sm:text-heading-md font-semibold text-foreground">
          <Link 
            href="/" 
            className="font-playfair hover:text-primary transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring rounded break-words font-medium tracking-tight"
          >
            Texts with My Ex
          </Link>
        </h1>
      </div>
      <nav className="flex items-center gap-1 sm:gap-2 sm:gap-3 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }} aria-label="Settings">
        <HelpTooltip />
        <ThemeSwitcher />
        <LanguageSwitcher />
      </nav>
    </div>
  </header>
);

