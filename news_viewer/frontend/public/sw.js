// Service Worker for News Viewer PWA
const CACHE_NAME = 'news-viewer-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Helper function to check if request should be cached
function shouldCache(request) {
    const url = new URL(request.url);

    // Only cache GET requests
    if (request.method !== 'GET') {
        return false;
    }

    // Only cache http and https schemes
    if (!url.protocol.startsWith('http')) {
        return false;
    }

    // Don't cache chrome extensions or browser-specific URLs
    if (url.protocol === 'chrome-extension:' ||
        url.protocol === 'moz-extension:' ||
        url.hostname === 'localhost' && url.port === '') {
        return false;
    }

    return true;
}

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache).catch((err) => {
                    console.log('Cache addAll error:', err);
                });
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-cacheable requests
    if (!shouldCache(event.request)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response before caching
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache).catch((err) => {
                            // Silently ignore cache errors for unsupported requests
                            console.log('Cache put error (ignored):', err.message);
                        });
                    });

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request);
            })
    );
});
