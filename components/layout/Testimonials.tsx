'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  }
];

export const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const startAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      scrollIntervalRef.current = setInterval(() => {
        if (isPaused || !container) return;

        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement;
        if (!firstCard) return;
        
        const cardWidth = firstCard.offsetWidth;
        const gap = window.innerWidth < 640 ? 0 : 16; // gap-0 on mobile, gap-4 on desktop
        const scrollAmount = cardWidth + gap;
        const currentIndex = Math.round(scrollLeft / scrollAmount);
        const nextScrollPosition = (currentIndex + 1) * scrollAmount;

        if (nextScrollPosition + clientWidth > scrollWidth) {
          // Reached the end, scroll back to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next card position (snap to card)
          container.scrollTo({ left: nextScrollPosition, behavior: 'smooth' });
        }
      }, 6000); // Scroll every 6 seconds
    };

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
    const handleTouchStart = () => setIsPaused(true);
    const handleTouchEnd = () => {
      setTimeout(() => setIsPaused(false), 2000); // Resume after 2 seconds of no touch
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    startAutoScroll();

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPaused]);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Quote className="h-4 w-4 text-primary animate-pulse-glow" />
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          {t('testimonials_label')}
        </p>
      </div>
      <h2 className="text-center text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5">
        {t('testimonials_title')}
      </h2>
      <div
        ref={scrollContainerRef}
        className="relative overflow-x-auto pb-4 -mx-4 sm:-mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory md:overflow-hidden"
        style={{ 
          scrollBehavior: 'smooth', 
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-0 sm:gap-4 min-w-max md:min-w-0 md:max-w-[calc(3*310px+2*1rem)] md:mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 md:pl-0 md:pr-0">
          {TESTIMONIALS.map((item) => (
            <Card
              key={item.id}
              data-testimonial-card
              className="h-[280px] sm:h-[270px] md:h-[290px] border-border/50 backdrop-blur-lg shadow-lg w-[calc(100vw-2rem)] sm:w-[320px] md:w-[310px] flex-shrink-0 snap-center md:snap-start md:min-w-[310px] md:max-w-[310px]"
              style={{ backgroundColor: 'hsl(var(--card) / 0.75)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}
            >
              <div className="p-5 sm:p-5 flex flex-col gap-2.5 sm:gap-3 h-full">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] font-medium flex-shrink-0">
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
    </section>
  );
};
