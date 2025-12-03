'use client';

import React, { memo } from 'react';
import { Ripple } from '../ui/ripple';

export const BackgroundAnimation = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {/* Ripple effects - reduced on mobile for performance */}
      {/* Center ripple - primary color - only on desktop */}
      <Ripple
        mainCircleSize={200}
        mainCircleOpacity={0.5}
        numCircles={8}
        position="center"
        color="primary"
        className="opacity-90 dark:opacity-70 hidden md:block"
      />
      
      {/* Top-left ripple - only on desktop */}
      <Ripple
        mainCircleSize={170}
        mainCircleOpacity={0.4}
        numCircles={6}
        position="top-left"
        color="primary"
        className="opacity-80 dark:opacity-60 hidden md:block"
      />
      
      {/* Top-right ripple - only on desktop */}
      <Ripple
        mainCircleSize={170}
        mainCircleOpacity={0.4}
        numCircles={6}
        position="top-right"
        color="accent"
        className="opacity-80 dark:opacity-60 hidden md:block"
      />
      
      {/* Bottom-left ripple - only on desktop */}
      <Ripple
        mainCircleSize={170}
        mainCircleOpacity={0.4}
        numCircles={6}
        position="bottom-left"
        color="secondary"
        className="opacity-80 dark:opacity-60 hidden md:block"
      />
      
      {/* Optimized blobs - smaller and fewer on mobile */}
      {/* Desktop: full size and animation */}
      <div 
        className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 animate-blob md:animate-blob"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      />
      <div 
        className="absolute top-0 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 animate-blob animation-delay-2000 md:animate-blob"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      />
      {/* Third blob - hidden on mobile for performance */}
      <div 
        className="absolute -bottom-32 left-1/3 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-40 dark:opacity-20 hidden md:block animate-blob animation-delay-4000"
        style={{
          background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      />
    </div>
  );
});

BackgroundAnimation.displayName = 'BackgroundAnimation';

