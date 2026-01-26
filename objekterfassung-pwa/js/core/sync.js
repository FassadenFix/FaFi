// ============================================
// SYNC MANAGER
// Background Sync & Queue Management
// ============================================

/**
 * Sync-Manager für Offline-Synchronisation
 */
class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.lastSyncTime = null;
        this.syncQueue = [];
        this.listeners = [];
    }

    /**
     * Initialisiert Sync-Manager
     */
    async init() {
        // Service Worker Message-Listener
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this._handleServiceWorkerMessage(event.data);
            });
        }

        // Load last sync time from storage
        this.lastSyncTime = localStorage.getItem('lastSyncTime');

        // Check online status
        window.addEventListener('online', () => {
            console.log('[Sync] Network online - triggering sync');
            this.triggerSync();
        });

        window.addEventListener('offline', () => {
            console.log('[Sync] Network offline');
            this._notifyListeners({ type: 'offline' });
        });

        console.log('[Sync] Manager initialized');
    }

    /**
     * Fügt Item zur Sync-Queue hinzu
     * @param {string} type - 'create', 'update', 'delete'
     * @param {object} data - Immobilien-Daten
     */
    async enqueue(type, data) {
        const item = {
            id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        try {
            // In IndexedDB Queue speichern
            await this._addToQueue(item);

            console.log('[Sync] Item enqueued:', type, item.id);

            // Trigger Background Sync wenn online
            if (navigator.onLine) {
                await this.triggerSync();
            } else {
                this._notifyListeners({
                    type: 'enqueued',
                    item
                });
            }

        } catch (error) {
            console.error('[Sync] Enqueue failed:', error);
            throw error;
        }
    }

    /**
     * Triggert Background Sync
     */
    async triggerSync() {
        if (this.isSyncing) {
            console.log('[Sync] Already syncing');
            return;
        }

        if (!navigator.onLine) {
            console.log('[Sync] Offline - sync skipped');
            return;
        }

        try {
            this.isSyncing = true;
            this._notifyListeners({ type: 'sync_started' });

            // Versuche Background Sync API
            if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker.registration) {
                await navigator.serviceWorker.ready;
                await navigator.serviceWorker.registration.sync.register('sync-immobilien');
                console.log('[Sync] Background Sync registered');
            } else {
                // Fallback: Direkte Synchronisation
                console.log('[Sync] Background Sync not supported - using fallback');
                await this._syncNow();
            }

        } catch (error) {
            console.error('[Sync] Trigger failed:', error);
            this.isSyncing = false;
            this._notifyListeners({
                type: 'sync_error',
                error: error.message
            });
        }
    }

    /**
     * Synchronisiert Queue jetzt (Fallback ohne Background Sync)
     * @private
     */
    async _syncNow() {
        try {
            const queue = await this._getQueue();

            if (queue.length === 0) {
                console.log('[Sync] Queue is empty');
                this.isSyncing = false;
                return;
            }

            console.log(`[Sync] Processing ${queue.length} items`);

            const results = await Promise.allSettled(
                queue.map(item => this._syncItem(item))
            );

            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`[Sync] Complete: ${succeeded} succeeded, ${failed} failed`);

            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);

            this._notifyListeners({
                type: 'sync_complete',
                succeeded,
                failed
            });

        } catch (error) {
            console.error('[Sync] Sync now failed:', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Synchronisiert einzelnes Item
     * @private
     */
    async _syncItem(item) {
        const { id, type, data } = item;

        let endpoint = '/api/immobilien';
        let method = 'POST';

        if (type === 'update') {
            endpoint = `/api/immobilien/${data.id}`;
            method = 'PUT';
        } else if (type === 'delete') {
            endpoint = `/api/immobilien/${data.id}`;
            method = 'DELETE';
        }

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: type !== 'delete' ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Aus Queue entfernen
        await this._removeFromQueue(id);

        console.log('[Sync] Item synced:', id);
    }

    /**
     * Fügt Item zur Queue hinzu
     * @private
     */
    async _addToQueue(item) {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['sync_queue'], 'readwrite');
            const store = tx.objectStore('sync_queue');
            const request = store.add(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Holt Queue
     * @private
     */
    async _getQueue() {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['sync_queue'], 'readonly');
            const store = tx.objectStore('sync_queue');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Entfernt Item aus Queue
     * @private
     */
    async _removeFromQueue(id) {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['sync_queue'], 'readwrite');
            const store = tx.objectStore('sync_queue');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Öffnet IndexedDB
     * @private
     */
    _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FassadenFixDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sync Queue Store
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Behandelt Service Worker Messages
     * @private
     */
    _handleServiceWorkerMessage(message) {
        console.log('[Sync] SW Message:', message);

        if (message.type === 'SYNC_COMPLETE') {
            this.isSyncing = false;
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            this._notifyListeners(message);
        } else if (message.type === 'SYNC_ITEM_COMPLETE') {
            this._notifyListeners(message);
        }
    }

    /**
     * Registriert Listener
     * @param {function} callback - Callback-Funktion
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Entfernt Listener
     * @param {function} callback - Callback-Funktion
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Benachrichtigt Listeners
     * @private
     */
    _notifyListeners(event) {
        this.listeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('[Sync] Listener error:', error);
            }
        });
    }

    /**
     * Gibt Sync-Status zurück
     * @returns {object} Status-Objekt
     */
    async getStatus() {
        const queue = await this._getQueue();

        return {
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            queueLength: queue.length,
            isOnline: navigator.onLine
        };
    }

    /**
     * Rendert Sync-Status-Badge
     * @returns {string} HTML
     */
    async renderStatusBadge() {
        const status = await this.getStatus();

        if (status.isSyncing) {
            return `
                <div class="sync-status sync-syncing">
                    🔄 Synchronisiere...
                </div>
            `;
        }

        if (status.queueLength > 0) {
            return `
                <div class="sync-status sync-pending">
                    ⏳ ${status.queueLength} ausstehend
                </div>
            `;
        }

        if (status.lastSyncTime) {
            return `
                <div class="sync-status sync-success">
                    ✅ Synchronisiert
                </div>
            `;
        }

        return '';
    }
}

// Globale Instanz
const syncManager = new SyncManager();
