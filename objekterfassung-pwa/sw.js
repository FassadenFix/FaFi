// Service Worker für FassadenFix Objekterfassung PWA
// Version 1.0.0 - Phase 1: Basic Static Caching

const CACHE_VERSION = 'v1.0.0';
const CACHE_STATIC = `fassadenfix-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `fassadenfix-dynamic-${CACHE_VERSION}`;
const CACHE_IMAGES = `fassadenfix-images-${CACHE_VERSION}`;

// Statische Assets für Offline-Verfügbarkeit
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/variables.css',
    '/css/mobile.css',
    '/css/components.css',
    '/data/constants.js',
    '/js/app.js',
    '/js/core/state.js',
    '/js/core/storage.js',
    '/js/core/sync.js',
    '/js/core/router.js',
    '/js/models/immobilie.js',
    '/js/models/seite.js',
    '/js/models/validation.js',
    '/js/utils/formatting.js',
    '/js/ui/wizard.js',
    '/js/ui/renderer.js',
    '/js/ui/components/immobilien-list.js',
    '/js/ui/components/immobilien-detail.js',
    '/js/ui/components/seiten-form.js',
    '/js/features/camera.js',
    '/js/features/geolocation.js',
    '/js/features/audio.js',
    '/js/features/export.js',
    '/js/integrations/hubspot.js',
    '/js/integrations/backend.js'
];

// ============================================
// INSTALL EVENT: Cache Static Assets
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting(); // Aktiviere neuen SW sofort
            })
            .catch(error => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// ============================================
// ACTIVATE EVENT: Clean Old Caches
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Lösche alte Versionen
                            return cacheName !== CACHE_STATIC &&
                                   cacheName !== CACHE_DYNAMIC &&
                                   cacheName !== CACHE_IMAGES;
                        })
                        .map(cacheName => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim(); // Übernehme Kontrolle sofort
            })
    );
});

// ============================================
// FETCH EVENT: Cache Strategy
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignoriere nicht-GET Requests
    if (request.method !== 'GET') {
        return;
    }

    // API-Requests: Network-First mit Cache-Fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone für Cache speichern
                    const responseClone = response.clone();
                    caches.open(CACHE_DYNAMIC)
                        .then(cache => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => {
                    // Fallback auf Cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Bilder: Cache-First
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    if (cached) {
                        return cached;
                    }

                    // Fetch und cache
                    return fetch(request)
                        .then(response => {
                            const responseClone = response.clone();
                            caches.open(CACHE_IMAGES)
                                .then(cache => cache.put(request, responseClone));
                            return response;
                        });
                })
        );
        return;
    }

    // Statische Assets: Cache-First mit Network-Fallback
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    return cached;
                }

                // Fetch und optional cachen
                return fetch(request)
                    .then(response => {
                        // Nur 200er Responses cachen
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_DYNAMIC)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    })
                    .catch(error => {
                        console.error('[SW] Fetch failed:', request.url, error);
                        // Optional: Offline-Fallback-Seite zurückgeben
                        throw error;
                    });
            })
    );
});

// ============================================
// BACKGROUND SYNC (Phase 4)
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-immobilien') {
        console.log('[SW] Background Sync triggered: sync-immobilien');
        event.waitUntil(syncImmobilienData());
    }
});

async function syncImmobilienData() {
    // Wird in Phase 4 implementiert
    console.log('[SW] syncImmobilienData() - noch nicht implementiert');
    return Promise.resolve();
}

// ============================================
// MESSAGE HANDLER
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls || [];
        event.waitUntil(
            caches.open(CACHE_DYNAMIC)
                .then(cache => cache.addAll(urls))
        );
    }
});
