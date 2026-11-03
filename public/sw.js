// Service Worker for Chuks Communication PWA
const CACHE_NAME = 'chuks-pwa-v7-stable';
const CORE_PRECACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

const STATIC_EXTENSIONS = /\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)(\?.*)?$/i;

// 1. Install Event: Precache essential assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_PRECACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.debug('[PWA-SW] Non-fatal precache notice for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.debug('[PWA-SW] Purging outdated cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Reliable network handling
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http requests (extensions, data, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Strict pass-through for development modules, vite client, API calls, and WebSockets
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('vite') ||
    url.search.includes('v=') ||
    url.search.includes('t=')
  ) {
    return;
  }

  // HTML Navigation: Network-first with offline fallback
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Chuks Communication Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#0c0a09;color:#fff;font-family:sans-serif;padding:24px;text-align:center;"><h2>Chuks Communication is currently offline</h2><p>Please check your internet connection or reload once reconnected.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Static Media, Icons, Fonts & Manifest: Cache-First with Network fallback
  const isMediaOrAsset =
    STATIC_EXTENSIONS.test(url.pathname) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.includes('pwa-') ||
    url.pathname.includes('icon');

  if (isMediaOrAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return new Response('', { status: 404, statusText: 'Not found' });
        });
      })
    );
  }
});
