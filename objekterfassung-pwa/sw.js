// Service Worker für FassadenFix Objekterfassung PWA
// Version 1.2.1 - Deployment: GitHub Pages + Render Integration

const CACHE_VERSION = 'v1.2.1';
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
    '/js/utils/error-handler.js',
    '/js/utils/performance-monitor.js',
    '/js/ui/wizard.js',
    '/js/ui/renderer.js',
    '/js/ui/components/immobilien-list.js',
    '/js/ui/components/immobilien-detail.js',
    '/js/ui/components/seiten-form.js',
    '/js/features/camera.js',
    '/js/features/annotation.js',
    '/js/features/geolocation.js',
    '/js/features/audio.js',
    '/js/features/export.js',
    '/js/config/api.config.js',
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
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-immobilien') {
        event.waitUntil(syncImmobilienData());
    } else if (event.tag.startsWith('sync-immobilie-')) {
        const immoId = event.tag.replace('sync-immobilie-', '');
        event.waitUntil(syncSingleImmobilie(immoId));
    }
});

/**
 * Synchronisiert alle Immobilien mit Backend
 */
async function syncImmobilienData() {
    console.log('[SW] Syncing all immobilien...');

    try {
        // Hole Sync-Queue aus IndexedDB
        const db = await openIndexedDB();
        const queue = await getSyncQueue(db);

        if (queue.length === 0) {
            console.log('[SW] No items in sync queue');
            return;
        }

        console.log(`[SW] Processing ${queue.length} items in sync queue`);

        // Verarbeite Queue
        const results = await Promise.allSettled(
            queue.map(item => syncQueueItem(item, db))
        );

        // Zähle Erfolge/Fehler
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`[SW] Sync complete: ${succeeded} succeeded, ${failed} failed`);

        // Benachrichtige Clients
        await notifyClients({
            type: 'SYNC_COMPLETE',
            succeeded,
            failed
        });

    } catch (error) {
        console.error('[SW] Sync failed:', error);
        throw error; // Retry sync
    }
}

/**
 * Synchronisiert einzelne Immobilie
 */
async function syncSingleImmobilie(immoId) {
    console.log('[SW] Syncing immobilie:', immoId);

    try {
        const db = await openIndexedDB();
        const item = await getSyncQueueItem(db, immoId);

        if (!item) {
            console.log('[SW] No sync item found for:', immoId);
            return;
        }

        await syncQueueItem(item, db);

        await notifyClients({
            type: 'SYNC_ITEM_COMPLETE',
            immoId
        });

    } catch (error) {
        console.error('[SW] Single sync failed:', error);
        throw error;
    }
}

/**
 * Verarbeitet Sync-Queue-Item
 */
async function syncQueueItem(item, db) {
    const { id, type, data, timestamp } = item;

    console.log('[SW] Processing sync item:', type, id);

    // API-Endpoint bestimmen
    let endpoint = '/api/immobilien';
    let method = 'POST';

    if (type === 'update') {
        endpoint = `/api/immobilien/${data.id}`;
        method = 'PUT';
    } else if (type === 'delete') {
        endpoint = `/api/immobilien/${data.id}`;
        method = 'DELETE';
    }

    // API-Request
    const response = await fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: type !== 'delete' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
    }

    // Aus Queue entfernen
    await removeSyncQueueItem(db, id);

    console.log('[SW] Sync item processed:', id);
}

/**
 * Öffnet IndexedDB
 */
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FassadenFixDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Holt Sync-Queue
 */
function getSyncQueue(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['sync_queue'], 'readonly');
        const store = tx.objectStore('sync_queue');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Holt einzelnes Sync-Queue-Item
 */
function getSyncQueueItem(db, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['sync_queue'], 'readonly');
        const store = tx.objectStore('sync_queue');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Entfernt Item aus Sync-Queue
 */
function removeSyncQueueItem(db, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['sync_queue'], 'readwrite');
        const store = tx.objectStore('sync_queue');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Benachrichtigt Clients
 */
async function notifyClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage(message);
    });
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
