// Bright Stars Science School & Academy PWA Service Worker
// Version: 1.0.1

const CACHE_NAME = 'bss-sms-static-v3';
const OFFLINE_URL = '/offline.html';

// Core essential assets to precache on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon.svg',
];

// Install Event — Pre-cache offline shell and icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Cleanup old caches and take immediate control
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
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Security-conscious caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only process GET requests; never intercept or cache POST/PUT/DELETE
  if (request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL SECURITY: Never cache API endpoints or NextAuth sessions
  // All backend data must come live from PostgreSQL database via Prisma
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Offline',
            message: 'You are currently offline. Database operations require an active network connection.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 3. Navigation Requests (Page Visits e.g. /, /students, /fees)
  // Network-First with fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, return it directly
          if (response && response.status === 200) {
            return response;
          }
          return response;
        })
        .catch(async () => {
          // If offline and page navigation fails, return the offline fallback
          const cache = await caches.open(CACHE_NAME);
          const cachedOffline = await cache.match(OFFLINE_URL);
          return cachedOffline || Response.error();
        })
    );
    return;
  }

  // 4. Immutable Next.js Static Chunks (/_next/static/...)
  // Cache-First with Network Fallback only in production hosts (avoid stale unhashed dev chunks on localhost)
  const isLocalDevHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if ((url.pathname.startsWith('/_next/static/') && !isLocalDevHost) || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. External Fonts (Google Fonts, static assets)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          return cachedResponse;
        });
      })
    );
    return;
  }

  // 6. Default Network Fallback for anything else
  event.respondWith(fetch(request));
});
