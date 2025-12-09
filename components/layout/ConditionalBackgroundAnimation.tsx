'use client';

import { LoveBackgroundText } from './LoveBackgroundText';

/**
 * Conditionally renders BackgroundAnimation only on specific pages
 * to save GPU resources on admin and other pages
 */
export function ConditionalBackgroundAnimation() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden sm:block">
      <LoveBackgroundText />
    </div>
  );
}


