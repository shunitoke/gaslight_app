'use client';

import React, { memo } from 'react';
import { useAnimation } from '../../contexts/AnimationContext';

type BackgroundAnimationProps = {
  /**
   * Kept for backward compatibility; only blob mode is rendered now.
   */
  variant?: 'blob';
  isHome?: boolean;
};

const blobLayers = [
  {
    className:
      'absolute top-[-6%] left-[10%] w-[380px] h-[380px] md:w-[620px] md:h-[620px] animate-blob-gaslight',
    backgroundImage:
      'radial-gradient(closest-side at 30% 35%, hsl(var(--primary) / 0.55) 0%, transparent 60%), radial-gradient(closest-side at 70% 60%, hsl(var(--accent) / 0.35) 0%, transparent 75%)',
    delayClass: '',
  },
  {
    className:
      'absolute top-[4%] right-[8%] w-[360px] h-[360px] md:w-[600px] md:h-[600px] animate-blob-gaslight',
    backgroundImage:
      'radial-gradient(closest-side at 65% 40%, hsl(var(--accent) / 0.4) 0%, transparent 62%), radial-gradient(closest-side at 35% 65%, hsl(var(--secondary) / 0.32) 0%, transparent 70%)',
    delayClass: 'animation-delay-2000',
  },
  {
    className:
      'absolute -bottom-24 left-[28%] w-[360px] h-[360px] md:w-[640px] md:h-[640px] animate-blob-gaslight',
    backgroundImage:
      'radial-gradient(closest-side at 45% 55%, hsl(var(--secondary) / 0.45) 0%, transparent 65%), radial-gradient(closest-side at 70% 30%, hsl(var(--primary) / 0.35) 0%, transparent 68%)',
    delayClass: 'animation-delay-4000',
  },
];

function BackgroundAnimationComponent({ variant = 'blob', isHome = true }: BackgroundAnimationProps) {
  const { isPageVisible, prefersReducedMotion, isProcessing } = useAnimation();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(() => {
    if (typeof window === 'undefined') return true; // assume desktop on SSR to avoid mobile blob flash
    return window.matchMedia('(min-width: 768px)').matches;
  });

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const baseAllowed = isPageVisible && !prefersReducedMotion;
  const showBlob = baseAllowed && isDesktop && (variant === 'blob' || isProcessing);
  const isDimmed = isProcessing || !isHome;

  const activeLayers = isDimmed ? blobLayers.slice(0, 1) : blobLayers;
  const blobOpacity = isDimmed ? 0.32 : 0.55;
  const noiseOpacity = isDimmed ? 0.18 : 0.32;

  // Mobile: render static blob only to avoid GPU cost
  const showStaticMobile = baseAllowed && !isDesktop;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {!isHydrated ? null : (
        <>
          {showBlob && (
            <>
              {activeLayers.map((layer, idx) => (
                <div
                  key={`gaslight-blob-${idx}`}
                  className={`${layer.className} ${layer.delayClass} gaslight-blob rounded-full`}
                  style={{
                    backgroundImage: layer.backgroundImage,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    perspective: '1000px',
                    animationPlayState: 'running',
                    opacity: blobOpacity,
                  } as React.CSSProperties}
                />
              ))}

              <div
                className="gaslight-noise absolute inset-[-12%]"
                style={{
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  perspective: '1000px',
                  opacity: noiseOpacity,
                }}
              />
            </>
          )}

          {showStaticMobile && (
            <>
              <div
                className="absolute top-0 left-1/4 w-[240px] h-[240px] rounded-full opacity-30 dark:opacity-20 gaslight-blob"
                style={{
                  backgroundImage:
                    'radial-gradient(closest-side at 40% 40%, hsl(var(--primary) / 0.5) 0%, transparent 68%), radial-gradient(closest-side at 70% 60%, hsl(var(--accent) / 0.35) 0%, transparent 75%)',
                  animationPlayState: 'paused',
                  willChange: 'auto',
                  transform: 'translate3d(0,0,0)',
                } as React.CSSProperties}
              />
              <div
                className="absolute top-0 right-1/4 w-[240px] h-[240px] rounded-full opacity-30 dark:opacity-20 gaslight-blob"
                style={{
                  backgroundImage:
                    'radial-gradient(closest-side at 55% 45%, hsl(var(--accent) / 0.45) 0%, transparent 64%), radial-gradient(closest-side at 30% 70%, hsl(var(--secondary) / 0.32) 0%, transparent 72%)',
                  animationPlayState: 'paused',
                  willChange: 'auto',
                  transform: 'translate3d(0,0,0)',
                } as React.CSSProperties}
              />
              <div
                className="absolute -bottom-24 left-1/3 w-[240px] h-[240px] rounded-full opacity-30 dark:opacity-20 gaslight-blob"
                style={{
                  backgroundImage:
                    'radial-gradient(closest-side at 50% 50%, hsl(var(--secondary) / 0.48) 0%, transparent 70%), radial-gradient(closest-side at 70% 25%, hsl(var(--primary) / 0.32) 0%, transparent 68%)',
                  animationPlayState: 'paused',
                  willChange: 'auto',
                  transform: 'translate3d(0,0,0)',
                } as React.CSSProperties}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

const BackgroundAnimation = memo(BackgroundAnimationComponent);
BackgroundAnimation.displayName = 'BackgroundAnimation';

export { BackgroundAnimation };
export default BackgroundAnimation;

