'use client';

import { usePathname } from 'next/navigation';
import { BackgroundAnimation } from './BackgroundAnimation';

/**
 * Conditionally renders BackgroundAnimation only on specific pages
 * to save GPU resources on admin and other pages
 */
export function ConditionalBackgroundAnimation() {
  const pathname = usePathname();
  
  // Only show animations on homepage
  // Exclude: /admin, /analysis, /terms, and API routes
  const shouldShowAnimations = pathname === '/';
  
  if (!shouldShowAnimations) {
    return null;
  }
  
  return <BackgroundAnimation />;
}


