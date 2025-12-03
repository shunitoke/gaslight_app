'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker only in production or when not in preview
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Check if we're on a preview deployment (Vercel preview URLs)
      const isPreview = window.location.hostname.includes('vercel.app') && 
                        !window.location.hostname.includes('gaslightdetector.vercel.app');
      
      // Only register on production domain, not preview deployments
      if (!isPreview) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
              console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
              // Silently fail - service worker is optional for PWA
              console.debug('Service Worker registration failed:', error);
            });
        });
      }
    }
  }, []);

  return null;
}



