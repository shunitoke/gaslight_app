'use client';

import React from 'react';
import { Quote } from 'lucide-react';

import { CardBase as Card } from '../ui/card';
import { useLanguage } from '../../features/i18n';

type Testimonial = {
  id: string;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'anna-28',
    nameKey: 'testimonial_anna_name',
    roleKey: 'testimonial_anna_role',
    quoteKey: 'testimonial_anna_quote'
  },
  {
    id: 'marco-34',
    nameKey: 'testimonial_marco_name',
    roleKey: 'testimonial_marco_role',
    quoteKey: 'testimonial_marco_quote'
  },
  {
    id: 'lea-31',
    nameKey: 'testimonial_lea_name',
    roleKey: 'testimonial_lea_role',
    quoteKey: 'testimonial_lea_quote'
  },
  {
    id: 'sara-29',
    nameKey: 'testimonial_sara_name',
    roleKey: 'testimonial_sara_role',
    quoteKey: 'testimonial_sara_quote'
  },
  {
    id: 'david-35',
    nameKey: 'testimonial_david_name',
    roleKey: 'testimonial_david_role',
    quoteKey: 'testimonial_david_quote'
  },
  {
    id: 'yuki-27',
    nameKey: 'testimonial_yuki_name',
    roleKey: 'testimonial_yuki_role',
    quoteKey: 'testimonial_yuki_quote'
  },
  {
    id: 'sofia-32',
    nameKey: 'testimonial_sofia_name',
    roleKey: 'testimonial_sofia_role',
    quoteKey: 'testimonial_sofia_quote'
  },
  {
    id: 'mia-26',
    nameKey: 'testimonial_mia_name',
    roleKey: 'testimonial_mia_role',
    quoteKey: 'testimonial_mia_quote'
  },
  {
    id: 'lucas-29',
    nameKey: 'testimonial_lucas_name',
    roleKey: 'testimonial_lucas_role',
    quoteKey: 'testimonial_lucas_quote'
  },
  {
    id: 'priya-33',
    nameKey: 'testimonial_priya_name',
    roleKey: 'testimonial_priya_role',
    quoteKey: 'testimonial_priya_quote'
  },
  {
    id: 'noah-31',
    nameKey: 'testimonial_noah_name',
    roleKey: 'testimonial_noah_role',
    quoteKey: 'testimonial_noah_quote'
  },
  {
    id: 'amira-30',
    nameKey: 'testimonial_amira_name',
    roleKey: 'testimonial_amira_role',
    quoteKey: 'testimonial_amira_quote'
  },
  {
    id: 'elena-34',
    nameKey: 'testimonial_elena_name',
    roleKey: 'testimonial_elena_role',
    quoteKey: 'testimonial_elena_quote'
  },
  {
    id: 'tom-30',
    nameKey: 'testimonial_tom_name',
    roleKey: 'testimonial_tom_role',
    quoteKey: 'testimonial_tom_quote'
  },
  {
    id: 'zahra-28',
    nameKey: 'testimonial_zahra_name',
    roleKey: 'testimonial_zahra_role',
    quoteKey: 'testimonial_zahra_quote'
  },
  {
    id: 'pedro-37',
    nameKey: 'testimonial_pedro_name',
    roleKey: 'testimonial_pedro_role',
    quoteKey: 'testimonial_pedro_quote'
  },
  {
    id: 'lina-25',
    nameKey: 'testimonial_lina_name',
    roleKey: 'testimonial_lina_role',
    quoteKey: 'testimonial_lina_quote'
  },
  {
    id: 'chen-33',
    nameKey: 'testimonial_chen_name',
    roleKey: 'testimonial_chen_role',
    quoteKey: 'testimonial_chen_quote'
  },
  {
    id: 'jasmine-29',
    nameKey: 'testimonial_jasmine_name',
    roleKey: 'testimonial_jasmine_role',
    quoteKey: 'testimonial_jasmine_quote'
  },
  {
    id: 'omar-36',
    nameKey: 'testimonial_omar_name',
    roleKey: 'testimonial_omar_role',
    quoteKey: 'testimonial_omar_quote'
  },
  {
    id: 'julia-27',
    nameKey: 'testimonial_julia_name',
    roleKey: 'testimonial_julia_role',
    quoteKey: 'testimonial_julia_quote'
  },
  {
    id: 'mateo-31',
    nameKey: 'testimonial_mateo_name',
    roleKey: 'testimonial_mateo_role',
    quoteKey: 'testimonial_mateo_quote'
  }
];

const ROW_CONFIG = [
  { id: 'row-1', direction: 'normal' as const, speed: 150, offset: 0 },
  { id: 'row-2', direction: 'reverse' as const, speed: 170, offset: 2 }
];

const buildLoop = (items: Testimonial[], offset: number) => {
  if (!items.length) return [];
  const normalizedOffset = offset % items.length;
  const rotated = [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
  return [...rotated, ...rotated];
};

export const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 animate-fade-in"
      style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Quote className="h-4 w-4 text-primary animate-pulse-glow" />
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          {t('testimonials_label')}
        </p>
      </div>
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-5">
        {t('testimonials_title')}
      </h2>

      <div className="relative overflow-hidden scrollbar-hide">
        <div className="flex flex-col gap-4 sm:gap-6 py-1">
          {ROW_CONFIG.map((row) => {
            const loop = buildLoop(TESTIMONIALS, row.offset);
            const half = loop.length / 2;

            return (
              <div
                key={row.id}
                data-testimonial-row
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-background/60 via-background/30 to-background/60"
                style={{
                  maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)'
                }}
              >
                <div
                  data-testimonial-track
                  className="flex min-w-max gap-3 sm:gap-4 animate-testimonial-marquee px-3 sm:px-4"
                  style={{
                    animationDuration: `${row.speed}s`,
                    animationDirection: row.direction
                  }}
                >
                  {loop.map((item, index) => (
                    <Card
                      key={`${item.id}-${index}`}
                      data-testimonial-card
                      aria-hidden={index >= half}
                      className="h-[240px] sm:h-[240px] md:h-[240px] w-[min(280px,70vw)] sm:w-[260px] md:w-[260px] flex-shrink-0 rounded-2xl border border-border/60 bg-card/80 shadow-md backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg hover:border-primary/30"
                      style={{
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div className="p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 h-full">
                        <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.18em] font-medium flex-shrink-0">
                          {t(item.roleKey)}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed sm:leading-relaxed italic flex-1 overflow-y-auto scrollbar-hide min-h-0">
                          "{t(item.quoteKey)}"
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-auto flex-shrink-0 pt-1">
                          {t(item.nameKey)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
