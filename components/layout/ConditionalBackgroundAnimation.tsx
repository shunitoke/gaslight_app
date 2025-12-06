'use client';

import { usePathname } from 'next/navigation';
import { BackgroundAnimation } from './BackgroundAnimation';

/**
 * Conditionally renders BackgroundAnimation only on specific pages
 * to save GPU resources on admin and other pages
 */
export function ConditionalBackgroundAnimation() {
  const pathname = usePathname();
  
  const isHome = pathname === '/';
  const variant = isHome ? 'ripple' : 'blob';

  return <BackgroundAnimation variant={variant} />;
}


