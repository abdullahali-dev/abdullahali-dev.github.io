const VERSION = '2.0.1';
const CACHE_NAME = `kekan-app-v${VERSION}`;
const CRITICAL_FILES = ['./', './index.html'];
const STATIC_FILES = [
  './manifest.json',
  './main.js',
  './vite.config.js'
];

/* Install event - cache all essential files */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_FILES);
    }).then(() => {
      // Skip waiting - install new SW immediately without waiting for old one to close
      return self.skipWaiting();
    })
  );
});

/* Activate event - clean up old caches and claim all clients */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Delete old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('kekan-app-') && cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

/* Fetch event - Network first strategy for index.html, cache first for others */
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  const { request } = e;
  const url = new URL(request.url);

  // Network first strategy for HTML and critical files
  if (request.destination === 'document' || CRITICAL_FILES.includes(url.pathname)) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(request);
        })
    );
  } else {
    // Cache first strategy for static assets
    e.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});

/* Post message to notify clients about updates */
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
