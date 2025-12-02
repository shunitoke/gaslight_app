'use client';

import React from 'react';

export const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {/* Optimized blobs using radial gradients instead of blur filters for better mobile performance */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-40 animate-blob dark:opacity-20 will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)'
        }}
      />
      <div 
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-40 animate-blob animation-delay-2000 dark:opacity-20 will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)'
        }}
      />
      <div 
        className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full opacity-40 animate-blob animation-delay-4000 dark:opacity-20 will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
          transform: 'translate3d(0,0,0)'
        }}
      />
    </div>
  );
};

