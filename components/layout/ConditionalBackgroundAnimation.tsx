'use client';

import { usePathname } from 'next/navigation';

import { useAnimation } from '@/contexts/AnimationContext';

import { LoveBackgroundText } from './LoveBackgroundText';

// Public/marketing routes where the background is allowed.
const MARKETING_PREFIXES = ['/articles', '/pricing', '/privacy', '/terms', '/refund'];
const BLOCKED_PREFIXES = ['/admin', '/analysis'];

function isMarketingPath(pathname: string) {
  if (pathname === '/') return true;
  return MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isBlocked(pathname: string) {
  return BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Conditionally renders the background only on lightweight, public pages
 * and skips when animations are paused (e.g., uploads/analysis running
 * or user prefers reduced motion).
 */
export function ConditionalBackgroundAnimation() {
  const pathname = usePathname() || '/';
  const { isPageVisible, prefersReducedMotion, isProcessing } = useAnimation();

  const allowed = isMarketingPath(pathname) && !isBlocked(pathname);
  const animationsPaused = !isPageVisible || prefersReducedMotion || isProcessing;

  if (!allowed || animationsPaused) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden sm:block">
      <LoveBackgroundText />
    </div>
  );
}


