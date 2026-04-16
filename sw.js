/* ========================================
   SERVICE WORKER - Enhanced Offline Support
   ======================================== */

const CACHE_NAME = 'smartstudent-pwa-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons.svg',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

/**
 * Install event: Cache essential assets on first install
 */
self.addEventListener('install', event => {
    console.log('ðŸ”§ Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('ðŸ’¾ Caching app assets...');
                return cache.addAll(urlsToCache).catch(error => {
                    console.warn('âš ï¸ Some assets failed to cache:', error);
                    // Continue even if some assets fail
                    return cache.addAll(urlsToCache.filter(url => 
                        !url.includes('icons/')
                    ));
                });
            })
            .then(() => {
                console.log('âœ… App shell cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('âŒ Install error:', error);
            })
    );
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('âœ… Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('ðŸ—‘ï¸ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * Fetch event: Serve from cache, fallback to network
 * Strategy: Cache First for assets, Network First for API
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API requests with Network First strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Handle static assets with Cache First strategy
    event.respondWith(cacheFirst(request));
});

/**
 * Cache First strategy: Try cache first, fallback to network
 * Best for static assets (CSS, JS, images, SVG)
 */
async function cacheFirst(request) {
    try {
        // Try cache first
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        if (cached) {
            console.log('ðŸ“¦ Served from cache:', request.url);
            return cached;
        }

        // Not in cache, try network
        const response = await fetch(request);

        // Cache successful responses
        if (response.status === 200) {
            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            console.log('ðŸ“¥ Cached from network:', request.url);
        }

        return response;
    } catch (error) {
        console.error('âŒ Fetch failed:', request.url, error);

        // Try to return cached response
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }

        // Return offline page if available
        if (request.destination === 'document') {
            return cache.match('./index.html');
        }

        // Return error response
        return new Response('Network error - content not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/**
 * Network First strategy: Try network first, fallback to cache
 * Best for dynamic content
 */
async function networkFirst(request) {
    try {
        // Try network first
        const response = await fetch(request);

        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            console.log('ðŸ“¥ Cached from network:', request.url);
        }

        return response;
    } catch (error) {
        console.error('âŒ Network request failed:', request.url);

        // Try to return cached response
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            console.log('ðŸ“¦ Served from cache (network failed):', request.url);
            return cached;
        }

        // Return error
        return new Response('Network error - content not cached', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/**
 * Message event: Handle messages from clients
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME);
    }
});

/**
 * Sync event: Handle background sync (optional)
 */
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Background sync function
 */
async function syncData() {
    try {
        // Sync logic here if needed
        console.log('ðŸ”„ Background sync started');
    } catch (error) {
        console.error('âŒ Sync error:', error);
    }
              }
