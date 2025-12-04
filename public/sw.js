// Simple service worker for PWA installability
const CACHE_NAME = 'texts-with-my-ex-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/?utm_source=pwa'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache resources individually to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(url).catch((err) => {
              console.log(`Failed to cache ${url}:`, err);
              // Don't fail installation if individual resources fail
              return null;
            })
          )
        );
      })
      .catch((err) => console.log('Service Worker install error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't intercept requests to external domains or API routes
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Don't intercept requests to Vercel Blob or other external services
  if (url.hostname.includes('vercel.com') || 
      url.hostname.includes('vercel-storage.com') ||
      url.hostname.includes('openrouter.ai')) {
    return;
  }

  // Use respondWith with proper error handling to prevent message channel errors
  try {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            return response;
          }
          return fetch(event.request).catch((err) => {
            console.log('Fetch failed for:', event.request.url, err);
            // If both fail, return offline page for document requests
            if (event.request.destination === 'document') {
              return caches.match('/').catch(() => {
                return new Response('Offline', { status: 503 });
              });
            }
            // For other requests, return a basic error response
            return new Response('Network error', { status: 408 });
          });
        })
        .catch(() => {
          // If cache match fails, try network
          return fetch(event.request).catch(() => {
            if (event.request.destination === 'document') {
              return caches.match('/').catch(() => {
                return new Response('Offline', { status: 503 });
              });
            }
            return new Response('Network error', { status: 408 });
          });
        })
    );
  } catch (error) {
    // If respondWith fails (e.g., event already handled), just return
    // This prevents the "message channel closed" error
    console.log('Service Worker fetch handler error:', error);
    return;
  }
});

