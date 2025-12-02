'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

import { useLanguage } from '../../features/i18n';
import { CardBase as Card, CardContent } from '../ui/card';

export const HelpTooltip: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right + window.scrollX
        });
      }
    };

    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate, true);
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
        cancelAnimationFrame(rafId);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const tooltipContent = isOpen && mounted ? (
    <div
      ref={tooltipRef}
      className="fixed w-[280px] sm:w-[320px] md:w-[360px] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 9999
      }}
    >
      <Card className="border-border/70 bg-background/95 dark:bg-neutral-900/95 shadow-lg backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t('help_tooltip_title')}
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t('help_tooltip_close')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-3 text-sm text-foreground">
            <p className="leading-relaxed">{t('faq_why')}</p>
            <p className="leading-relaxed">{t('faq_forWhom')}</p>
            <p className="leading-relaxed">{t('faq_goal')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-primary/30 bg-background/60 hover:bg-background/80 hover:border-accent/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
        aria-label={t('help_tooltip_label')}
        aria-expanded={isOpen}
      >
        <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </button>
      {mounted && createPortal(tooltipContent, document.body)}
    </>
  );
};

