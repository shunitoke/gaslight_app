'use client';

import { usePathname } from 'next/navigation';
import { BackgroundAnimation } from './BackgroundAnimation';

/**
 * Conditionally renders BackgroundAnimation only on specific pages
 * to save GPU resources on admin and other pages
 */
export function ConditionalBackgroundAnimation() {
  const pathname = usePathname();
  
  // Only the blob variant is active now; ripple is intentionally removed.
  const isHome = pathname === '/';
  const variant = 'blob';

  return <BackgroundAnimation variant={variant} isHome={isHome} key={isHome ? 'home' : 'page'} />;
}


