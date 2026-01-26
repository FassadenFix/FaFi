// ============================================
// STORAGE MANAGER
// IndexedDB für strukturierte Daten
// LocalStorage als Fallback + schneller Cache
// ============================================

class StorageManager {
    constructor() {
        this.dbName = 'FassadenFixPWA';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialisiert Storage-Layer
     * @returns {Promise<void>}
     */
    async init() {
        try {
            this.db = await this.openDB();
            this.isInitialized = true;
            console.log('[Storage] Initialisiert:', this.dbName);

            // Session-Daten aus LocalStorage laden
            this.loadSessionFromLocalStorage();

        } catch (error) {
            console.error('[Storage] Initialisierung fehlgeschlagen:', error);
            // Fallback auf LocalStorage-only Modus
            this.isInitialized = false;
        }
    }

    /**
     * IndexedDB öffnen
     * @returns {Promise<IDBDatabase>}
     */
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('[Storage] Upgrade DB zu Version', this.dbVersion);

                // Object Store: immobilien
                if (!db.objectStoreNames.contains('immobilien')) {
                    const immoStore = db.createObjectStore('immobilien', { keyPath: 'id' });
                    immoStore.createIndex('nummer', 'nummer', { unique: false });
                    immoStore.createIndex('datumObjektaufnahme', 'datumObjektaufnahme', { unique: false });
                    immoStore.createIndex('status', 'status', { unique: false });
                    console.log('[Storage] Object Store "immobilien" erstellt');
                }

                // Object Store: photos
                if (!db.objectStoreNames.contains('photos')) {
                    const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
                    photoStore.createIndex('immobilieId', 'immobilieId', { unique: false });
                    photoStore.createIndex('seiteKey', 'seiteKey', { unique: false });
                    photoStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('[Storage] Object Store "photos" erstellt');
                }

                // Object Store: sync_queue
                if (!db.objectStoreNames.contains('sync_queue')) {
                    const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('status', 'status', { unique: false });
                    console.log('[Storage] Object Store "sync_queue" erstellt');
                }
            };
        });
    }

    // ============================================
    // IMMOBILIEN CRUD
    // ============================================

    /**
     * Speichert Immobilie
     * @param {object} immobilie - Immobilien-Objekt
     * @returns {Promise<void>}
     */
    async saveImmobilie(immobilie) {
        if (!this.isInitialized) {
            return this.saveToLocalStorage('immobilie_' + immobilie.id, immobilie);
        }

        try {
            const tx = this.db.transaction(['immobilien'], 'readwrite');
            const store = tx.objectStore('immobilien');
            await store.put(immobilie);

            console.log('[Storage] Immobilie gespeichert:', immobilie.id);

            // Cache aktualisieren
            this.updateLocalStorageCache();

            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler beim Speichern:', error);
            // Fallback LocalStorage
            return this.saveToLocalStorage('immobilie_' + immobilie.id, immobilie);
        }
    }

    /**
     * Lädt alle Immobilien
     * @returns {Promise<Array>} Array von Immobilien
     */
    async getAllImmobilien() {
        if (!this.isInitialized) {
            return this.getAllFromLocalStorage('immobilie_');
        }

        try {
            const tx = this.db.transaction(['immobilien'], 'readonly');
            const store = tx.objectStore('immobilien');
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const immobilien = request.result || [];
                    console.log('[Storage] Immobilien geladen:', immobilien.length);
                    resolve(immobilien);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[Storage] Fehler beim Laden:', error);
            return this.getAllFromLocalStorage('immobilie_');
        }
    }

    /**
     * Lädt einzelne Immobilie
     * @param {number} id - Immobilien-ID
     * @returns {Promise<object>} Immobilie
     */
    async getImmobilie(id) {
        if (!this.isInitialized) {
            return this.loadFromLocalStorage('immobilie_' + id);
        }

        try {
            const tx = this.db.transaction(['immobilien'], 'readonly');
            const store = tx.objectStore('immobilien');
            const request = store.get(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[Storage] Fehler beim Laden:', error);
            return this.loadFromLocalStorage('immobilie_' + id);
        }
    }

    /**
     * Löscht Immobilie
     * @param {number} id - Immobilien-ID
     * @returns {Promise<void>}
     */
    async deleteImmobilie(id) {
        if (!this.isInitialized) {
            return this.removeFromLocalStorage('immobilie_' + id);
        }

        try {
            const tx = this.db.transaction(['immobilien'], 'readwrite');
            const store = tx.objectStore('immobilien');
            await store.delete(id);

            console.log('[Storage] Immobilie gelöscht:', id);

            // Cache aktualisieren
            this.updateLocalStorageCache();

            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler beim Löschen:', error);
            return this.removeFromLocalStorage('immobilie_' + id);
        }
    }

    // ============================================
    // FOTO-SPEICHERUNG
    // ============================================

    /**
     * Speichert Foto (Blob)
     * @param {object} photo - Foto-Objekt mit { id, immobilieId, seiteKey, url (blob), ... }
     * @returns {Promise<void>}
     */
    async savePhoto(photo) {
        if (!this.isInitialized) {
            console.warn('[Storage] IndexedDB nicht verfügbar - Fotos können nicht gespeichert werden');
            return Promise.reject(new Error('IndexedDB not available'));
        }

        try {
            const tx = this.db.transaction(['photos'], 'readwrite');
            const store = tx.objectStore('photos');
            await store.put(photo);

            console.log('[Storage] Foto gespeichert:', photo.id);
            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler beim Foto-Speichern:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Lädt Fotos für Immobilie
     * @param {number} immobilieId - Immobilien-ID
     * @returns {Promise<Array>} Array von Fotos
     */
    async getPhotosForImmobilie(immobilieId) {
        if (!this.isInitialized) {
            return Promise.resolve([]);
        }

        try {
            const tx = this.db.transaction(['photos'], 'readonly');
            const store = tx.objectStore('photos');
            const index = store.index('immobilieId');
            const request = index.getAll(immobilieId);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[Storage] Fehler beim Fotos-Laden:', error);
            return Promise.resolve([]);
        }
    }

    /**
     * Löscht Foto
     * @param {string} photoId - Foto-ID
     * @returns {Promise<void>}
     */
    async deletePhoto(photoId) {
        if (!this.isInitialized) {
            return Promise.reject(new Error('IndexedDB not available'));
        }

        try {
            const tx = this.db.transaction(['photos'], 'readwrite');
            const store = tx.objectStore('photos');
            await store.delete(photoId);

            console.log('[Storage] Foto gelöscht:', photoId);
            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler beim Foto-Löschen:', error);
            return Promise.reject(error);
        }
    }

    // ============================================
    // SYNC QUEUE
    // ============================================

    /**
     * Fügt Eintrag zur Sync-Queue hinzu
     * @param {object} data - Zu synchronisierende Daten
     * @returns {Promise<void>}
     */
    async addToSyncQueue(data) {
        if (!this.isInitialized) {
            console.warn('[Storage] Sync-Queue nicht verfügbar');
            return Promise.resolve();
        }

        try {
            const tx = this.db.transaction(['sync_queue'], 'readwrite');
            const store = tx.objectStore('sync_queue');

            const entry = {
                data: data,
                timestamp: new Date().toISOString(),
                status: 'pending',
                retries: 0
            };

            await store.add(entry);
            console.log('[Storage] Sync-Queue: Eintrag hinzugefügt');
            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler bei Sync-Queue:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Lädt alle ausstehenden Sync-Einträge
     * @returns {Promise<Array>}
     */
    async getSyncQueue() {
        if (!this.isInitialized) {
            return Promise.resolve([]);
        }

        try {
            const tx = this.db.transaction(['sync_queue'], 'readonly');
            const store = tx.objectStore('sync_queue');
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[Storage] Fehler beim Sync-Queue-Laden:', error);
            return Promise.resolve([]);
        }
    }

    /**
     * Entfernt Eintrag aus Sync-Queue
     * @param {number} id - Queue-Eintrags-ID
     * @returns {Promise<void>}
     */
    async removeFromSyncQueue(id) {
        if (!this.isInitialized) {
            return Promise.resolve();
        }

        try {
            const tx = this.db.transaction(['sync_queue'], 'readwrite');
            const store = tx.objectStore('sync_queue');
            await store.delete(id);

            console.log('[Storage] Sync-Queue: Eintrag entfernt:', id);
            return Promise.resolve();
        } catch (error) {
            console.error('[Storage] Fehler beim Sync-Queue-Entfernen:', error);
            return Promise.reject(error);
        }
    }

    // ============================================
    // LOCALSTORAGE FALLBACK/CACHE
    // ============================================

    /**
     * Speichert in LocalStorage
     * @param {string} key - Key
     * @param {*} value - Wert
     */
    saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('[Storage] LocalStorage voll:', error);
        }
    }

    /**
     * Lädt aus LocalStorage
     * @param {string} key - Key
     * @returns {*} Wert
     */
    loadFromLocalStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('[Storage] LocalStorage-Fehler:', error);
            return null;
        }
    }

    /**
     * Entfernt aus LocalStorage
     * @param {string} key - Key
     */
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('[Storage] LocalStorage-Fehler:', error);
        }
    }

    /**
     * Lädt alle Einträge mit Prefix aus LocalStorage
     * @param {string} prefix - Key-Prefix
     * @returns {Array} Array von Werten
     */
    getAllFromLocalStorage(prefix) {
        const items = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = this.loadFromLocalStorage(key);
                    if (value) items.push(value);
                }
            }
        } catch (error) {
            console.error('[Storage] LocalStorage-Fehler:', error);
        }
        return items;
    }

    /**
     * Session-Daten in LocalStorage cachen
     */
    updateLocalStorageCache() {
        // Letzte Sync-Zeit, etc.
        this.saveToLocalStorage('app_meta', {
            lastUpdate: new Date().toISOString(),
            version: AppState.meta.version
        });
    }

    /**
     * Session-Daten aus LocalStorage laden
     */
    loadSessionFromLocalStorage() {
        const meta = this.loadFromLocalStorage('app_meta');
        if (meta) {
            console.log('[Storage] Session geladen aus LocalStorage');
        }
    }

    // ============================================
    // EXPORT/IMPORT
    // ============================================

    /**
     * Exportiert alle Daten als JSON
     * @returns {Promise<object>} Export-Daten
     */
    async exportAllData() {
        const immobilien = await this.getAllImmobilien();

        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            source: 'objekterfassung-pwa',
            immobilien: immobilien,
            meta: {
                totalImmobilien: immobilien.length,
                totalFlaeche: immobilien.reduce((sum, immo) => sum + getImmobilieGesamtflaeche(immo), 0)
            }
        };
    }

    /**
     * Importiert Daten aus JSON
     * @param {object} data - Import-Daten
     * @returns {Promise<void>}
     */
    async importData(data) {
        if (!data || !data.immobilien) {
            throw new Error('Ungültige Import-Daten');
        }

        // Validierung
        if (data.version !== '1.0') {
            throw new Error('Inkompatible Version: ' + data.version);
        }

        // Immobilien speichern
        for (const immo of data.immobilien) {
            await this.saveImmobilie(immo);
        }

        console.log('[Storage] Import erfolgreich:', data.immobilien.length, 'Immobilien');
    }

    // ============================================
    // STORAGE QUOTA
    // ============================================

    /**
     * Prüft verfügbaren Speicherplatz
     * @returns {Promise<object>} { usage, quota, percentage }
     */
    async checkQuota() {
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const usage = estimate.usage || 0;
                const quota = estimate.quota || 0;
                const percentage = quota > 0 ? (usage / quota) * 100 : 0;

                return {
                    usage: usage,
                    quota: quota,
                    percentage: percentage,
                    usageFormatted: formatFileSize(usage),
                    quotaFormatted: formatFileSize(quota)
                };
            } catch (error) {
                console.error('[Storage] Quota-Prüfung fehlgeschlagen:', error);
                return { usage: 0, quota: 0, percentage: 0 };
            }
        }

        return { usage: 0, quota: 0, percentage: 0 };
    }
}

// Globale StorageManager-Instanz
const storageManager = new StorageManager();
