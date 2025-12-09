'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Soft, GPU-friendly blob background (3 layers).
 */
export function GaslightBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className={cn(
          'absolute top-[-4%] left-[8%] w-[360px] h-[360px] md:w-[620px] md:h-[620px] rounded-full gaslight-blob-soft animate-blob-soft'
        )}
        style={{
          backgroundImage:
            'radial-gradient(closest-side at 30% 32%, hsl(var(--primary) / 0.5) 0%, transparent 60%), radial-gradient(closest-side at 68% 60%, hsl(var(--accent) / 0.35) 0%, transparent 74%)'
        }}
      />
      <div
        className={cn(
          'absolute top-[2%] right-[8%] w-[340px] h-[340px] md:w-[600px] md:h-[600px] rounded-full gaslight-blob-soft animate-blob-soft'
        )}
        style={{
          animationDelay: '2s, 1s, 0.6s',
          backgroundImage:
            'radial-gradient(closest-side at 64% 42%, hsl(var(--accent) / 0.42) 0%, transparent 64%), radial-gradient(closest-side at 34% 66%, hsl(var(--secondary) / 0.32) 0%, transparent 72%)'
        }}
      />
      <div
        className={cn(
          'absolute -bottom-20 left-[22%] w-[400px] h-[400px] md:w-[660px] md:h-[660px] rounded-full gaslight-blob-soft animate-blob-soft'
        )}
        style={{
          animationDelay: '3.4s, 2s, 1.4s',
          backgroundImage:
            'radial-gradient(closest-side at 48% 54%, hsl(var(--secondary) / 0.5) 0%, transparent 68%), radial-gradient(closest-side at 70% 28%, hsl(var(--primary) / 0.38) 0%, transparent 70%)'
        }}
      />
    </div>
  );
}

export default GaslightBlobs;


