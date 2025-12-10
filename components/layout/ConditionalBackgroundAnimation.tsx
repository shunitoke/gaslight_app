'use client';

import React from 'react';

import { LoveBackgroundText } from './LoveBackgroundText';

/**
 * Always renders the soft text background across the app unless the user
 * prefers reduced motion.
 */
export function ConditionalBackgroundAnimation() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handle = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handle = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  if (prefersReducedMotion || isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden sm:block">
      <LoveBackgroundText />
    </div>
  );
}


