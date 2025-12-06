'use client';

import React, { memo } from 'react';
import { Ripple } from '../ui/ripple';
import { useAnimation } from '../../contexts/AnimationContext';

type BackgroundAnimationProps = {
  variant?: 'ripple' | 'blob';
};

function BackgroundAnimationComponent({ variant = 'ripple' }: BackgroundAnimationProps) {
  const { isPageVisible, prefersReducedMotion, isProcessing } = useAnimation();
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const baseAllowed = isPageVisible && !prefersReducedMotion;
  const showRipple = baseAllowed && isDesktop && !isProcessing && variant === 'ripple';
  const showBlob = baseAllowed && isDesktop && (variant === 'blob' || isProcessing);

  // Mobile: render static blob only to avoid GPU cost
  const showStaticMobile = baseAllowed && !isDesktop;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {variant === 'ripple' && showRipple && (
        <>
          <Ripple
            mainCircleSize={200}
            mainCircleOpacity={0.5}
            numCircles={8}
            position="center"
            color="primary"
            className="opacity-90 dark:opacity-70"
          />
          <Ripple
            mainCircleSize={170}
            mainCircleOpacity={0.4}
            numCircles={6}
            position="top-left"
            color="primary"
            className="opacity-80 dark:opacity-60"
          />
          <Ripple
            mainCircleSize={170}
            mainCircleOpacity={0.4}
            numCircles={6}
            position="top-right"
            color="accent"
            className="opacity-80 dark:opacity-60"
          />
          <Ripple
            mainCircleSize={170}
            mainCircleOpacity={0.4}
            numCircles={6}
            position="bottom-left"
            color="secondary"
            className="opacity-80 dark:opacity-60"
          />
        </>
      )}

      {showBlob && (
        <>
          <div
            className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 animate-blob"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              animationPlayState: 'running',
            } as React.CSSProperties}
          />
          <div
            className="absolute top-0 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 animate-blob animation-delay-2000"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              animationPlayState: 'running',
            } as React.CSSProperties}
          />
          <div
            className="absolute -bottom-32 left-1/3 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 animate-blob animation-delay-4000"
            style={{
              background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              animationPlayState: 'running',
            } as React.CSSProperties}
          />
        </>
      )}

      {showStaticMobile && (
        <>
          <div
            className="absolute top-0 left-1/4 w-[240px] h-[240px] rounded-full opacity-25 dark:opacity-15"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              animationPlayState: 'paused',
              willChange: 'auto',
              transform: 'translate3d(0,0,0)',
            } as React.CSSProperties}
          />
          <div
            className="absolute top-0 right-1/4 w-[240px] h-[240px] rounded-full opacity-25 dark:opacity-15"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
              animationPlayState: 'paused',
              willChange: 'auto',
              transform: 'translate3d(0,0,0)',
            } as React.CSSProperties}
          />
          <div
            className="absolute -bottom-24 left-1/3 w-[240px] h-[240px] rounded-full opacity-25 dark:opacity-15"
            style={{
              background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
              animationPlayState: 'paused',
              willChange: 'auto',
              transform: 'translate3d(0,0,0)',
            } as React.CSSProperties}
          />
        </>
      )}
    </div>
  );
}

const BackgroundAnimation = memo(BackgroundAnimationComponent);
BackgroundAnimation.displayName = 'BackgroundAnimation';

export { BackgroundAnimation };
export default BackgroundAnimation;

