// Simple service worker for PWA installability
// Bumped cache name to drop stale assets/chunks
const CACHE_NAME = 'gaslight-app-v3';
const PRECACHE_URLS = ['/', '/manifest.json', '/icon.svg'];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.log(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        )
      )
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
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin, non-API requests
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Let Next.js handle framework/runtime assets to avoid stale chunk errors
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // Don't intercept requests to external services
  if (
    url.hostname.includes('vercel.com') ||
    url.hostname.includes('vercel-storage.com') ||
    url.hostname.includes('openrouter.ai')
  ) {
    return;
  }

  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document';

  // Network-first for HTML to always pick up the latest build; fallback to cache when offline
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          return (
            cached ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            })
          );
        })
    );
    return;
  }

  const shouldCache = PRECACHE_URLS.includes(url.pathname);

  // Cache-first for small static assets we pre-cache; network fallback otherwise
  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (shouldCache && response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => new Response('Network error', { status: 408 }));
      })
      .catch(() => new Response('Network error', { status: 408 }))
  );
});

