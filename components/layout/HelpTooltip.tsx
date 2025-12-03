'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

import { useLanguage } from '../../features/i18n';
import { CardBase as Card, CardContent } from '../ui/card';

export const HelpTooltip: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      // Prevent body scroll when modal is open on mobile
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && mounted) {
      // Small delay to ensure element is positioned before animation starts
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      return () => {
        cancelAnimationFrame(timer);
        setIsAnimating(false);
      };
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, mounted]);

  const tooltipContent = isOpen && mounted ? (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      {/* Modal/Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[9999] transition-all duration-200 ease-out
          left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[calc(100vw-2rem)] max-w-[420px] sm:max-w-[480px]
          max-h-[85vh] overflow-y-auto
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <Card className="border-border/70 shadow-2xl backdrop-blur-sm" style={{ backgroundColor: 'hsl(var(--card) / 0.95)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                {t('help_tooltip_title')}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
                aria-label={t('help_tooltip_close')}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-foreground">
              <p className="leading-relaxed">{t('faq_why')}</p>
              <p className="leading-relaxed">{t('faq_forWhom')}</p>
              <p className="leading-relaxed">{t('faq_goal')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
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

