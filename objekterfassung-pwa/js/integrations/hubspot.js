// ============================================
// HUBSPOT INTEGRATION
// API-Integration mit Offline-Caching
// ============================================

/**
 * HubSpot-Integration mit Caching
 */
class HubSpotIntegration {
    constructor() {
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 Stunden
        this.dbName = 'FassadenFixDB';
        this.dbVersion = 1;
    }

    /**
     * Öffnet IndexedDB für Caching
     * @private
     */
    async _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // HubSpot Cache Store
                if (!db.objectStoreNames.contains('hubspot_cache')) {
                    const store = db.createObjectStore('hubspot_cache', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Holt gecachte Daten
     * @private
     */
    async _getFromCache(key) {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(['hubspot_cache'], 'readonly');
                const store = tx.objectStore('hubspot_cache');
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result;

                    // Prüfe Ablaufzeit
                    if (result && Date.now() - result.timestamp < this.cacheExpiry) {
                        console.log(`[HubSpot] Cache hit: ${key}`);
                        resolve(result.data);
                    } else {
                        console.log(`[HubSpot] Cache miss or expired: ${key}`);
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[HubSpot] Cache read error:', error);
            return null;
        }
    }

    /**
     * Speichert Daten im Cache
     * @private
     */
    async _saveToCache(key, data) {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(['hubspot_cache'], 'readwrite');
                const store = tx.objectStore('hubspot_cache');
                const request = store.put({
                    key,
                    data,
                    timestamp: Date.now()
                });

                request.onsuccess = () => {
                    console.log(`[HubSpot] Cached: ${key}`);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[HubSpot] Cache write error:', error);
        }
    }

    /**
     * Sucht nach Companies
     * @param {string} query - Suchbegriff
     * @returns {Promise<Array>} Companies
     */
    async searchCompanies(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const cacheKey = `companies_search_${query.toLowerCase()}`;

        try {
            // Versuche Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // API-Call
            const url = buildApiUrl('COMPANIES_SEARCH', {}, { query });
            const response = await apiRequest(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache speichern (wenn nicht Mock)
            if (!data.mock) {
                await this._saveToCache(cacheKey, data.results);
            }

            console.log(`[HubSpot] Companies gefunden: ${data.results.length}`, data.mock ? '(Mock)' : '');
            return data.results;

        } catch (error) {
            console.error('[HubSpot] Company search error:', error);

            // Fallback: Versuche alten Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                console.log('[HubSpot] Using expired cache as fallback');
                return cached;
            }

            throw error;
        }
    }

    /**
     * Holt Company Details
     * @param {string} companyId - Company-ID
     * @returns {Promise<object>} Company-Details
     */
    async getCompanyDetails(companyId) {
        const cacheKey = `company_${companyId}`;

        try {
            // Versuche Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // API-Call
            const url = buildApiUrl('COMPANIES_DETAILS', { id: companyId });
            const response = await apiRequest(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const company = await response.json();

            // Cache speichern
            await this._saveToCache(cacheKey, company);

            console.log(`[HubSpot] Company details geladen: ${companyId}`);
            return company;

        } catch (error) {
            console.error('[HubSpot] Company details error:', error);

            // Fallback: Versuche alten Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                console.log('[HubSpot] Using expired cache as fallback');
                return cached;
            }

            throw error;
        }
    }

    /**
     * Sucht nach Contacts
     * @param {string} query - Suchbegriff
     * @param {string} companyId - Optional: Filter nach Company
     * @returns {Promise<Array>} Contacts
     */
    async searchContacts(query, companyId = null) {
        if (!query || query.length < 2) {
            return [];
        }

        const cacheKey = companyId
            ? `contacts_company_${companyId}_${query.toLowerCase()}`
            : `contacts_search_${query.toLowerCase()}`;

        try {
            // Versuche Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // API-Call
            const queryParams = { query };
            if (companyId) {
                queryParams.companyId = companyId;
            }

            const url = buildApiUrl('CONTACTS_SEARCH', {}, queryParams);
            const response = await apiRequest(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache speichern (wenn nicht Mock)
            if (!data.mock) {
                await this._saveToCache(cacheKey, data.results);
            }

            console.log(`[HubSpot] Contacts gefunden: ${data.results.length}`, data.mock ? '(Mock)' : '');
            return data.results;

        } catch (error) {
            console.error('[HubSpot] Contact search error:', error);

            // Fallback: Versuche alten Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                console.log('[HubSpot] Using expired cache as fallback');
                return cached;
            }

            throw error;
        }
    }

    /**
     * Holt assoziierte Contacts für eine Company
     * @param {string} companyId - Company-ID
     * @returns {Promise<Array>} Assoziierte Contacts
     */
    async getCompanyContacts(companyId) {
        const cacheKey = `company_${companyId}_contacts`;

        try {
            // Versuche Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // API-Call
            const url = buildApiUrl('COMPANY_CONTACTS', { id: companyId });
            const response = await apiRequest(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache speichern
            await this._saveToCache(cacheKey, data.results);

            console.log(`[HubSpot] Company Contacts geladen: ${data.results.length}`);
            return data.results;

        } catch (error) {
            console.error('[HubSpot] Company contacts error:', error);

            // Fallback: Versuche alten Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                console.log('[HubSpot] Using expired cache as fallback');
                return cached;
            }

            return []; // Leeres Array als letzter Fallback
        }
    }

    /**
     * Holt HubSpot Owners (FF-Mitarbeiter)
     * @returns {Promise<Array>} Owners
     */
    async getOwners() {
        const cacheKey = 'hubspot_owners';

        try {
            // Versuche Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // API-Call
            const url = buildApiUrl('OWNERS');
            const response = await apiRequest(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache speichern (wenn nicht Mock)
            if (!data.mock) {
                await this._saveToCache(cacheKey, data.results);
            }

            console.log(`[HubSpot] Owners geladen: ${data.results.length}`, data.mock ? '(Mock)' : '');
            return data.results;

        } catch (error) {
            console.error('[HubSpot] Owners error:', error);

            // Fallback: Versuche alten Cache
            const cached = await this._getFromCache(cacheKey);
            if (cached) {
                console.log('[HubSpot] Using expired cache as fallback');
                return cached;
            }

            // Letzter Fallback: Leeres Array
            return [];
        }
    }

    /**
     * Lädt Owners für Dropdown vor
     * @returns {Promise<void>}
     */
    async preloadOwners() {
        try {
            await this.getOwners();
            console.log('[HubSpot] Owners preloaded');
        } catch (error) {
            console.error('[HubSpot] Owners preload failed:', error);
        }
    }

    /**
     * Lädt häufig verwendete Companies vor
     * @param {Array<string>} queries - Array von Suchbegriffen
     * @returns {Promise<void>}
     */
    async preloadTopCompanies(queries = []) {
        if (queries.length === 0) {
            queries = ['GmbH', 'AG', 'KG']; // Standard-Queries
        }

        try {
            await Promise.all(
                queries.map(query => this.searchCompanies(query))
            );
            console.log('[HubSpot] Top companies preloaded');
        } catch (error) {
            console.error('[HubSpot] Companies preload failed:', error);
        }
    }

    /**
     * Löscht abgelaufene Cache-Einträge
     * @returns {Promise<number>} Anzahl gelöschter Einträge
     */
    async cleanExpiredCache() {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(['hubspot_cache'], 'readwrite');
                const store = tx.objectStore('hubspot_cache');
                const index = store.index('timestamp');
                const request = index.openCursor();

                let deletedCount = 0;
                const now = Date.now();

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (now - cursor.value.timestamp > this.cacheExpiry) {
                            cursor.delete();
                            deletedCount++;
                        }
                        cursor.continue();
                    } else {
                        console.log(`[HubSpot] Cache cleanup: ${deletedCount} Einträge gelöscht`);
                        resolve(deletedCount);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[HubSpot] Cache cleanup error:', error);
            return 0;
        }
    }

    /**
     * Gibt Cache-Statistiken zurück
     * @returns {Promise<object>} Cache-Stats
     */
    async getCacheStats() {
        try {
            const db = await this._openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(['hubspot_cache'], 'readonly');
                const store = tx.objectStore('hubspot_cache');
                const request = store.getAll();

                request.onsuccess = () => {
                    const entries = request.result || [];
                    const now = Date.now();

                    const stats = {
                        total: entries.length,
                        valid: entries.filter(e => now - e.timestamp < this.cacheExpiry).length,
                        expired: entries.filter(e => now - e.timestamp >= this.cacheExpiry).length,
                        oldestTimestamp: entries.length > 0
                            ? Math.min(...entries.map(e => e.timestamp))
                            : null
                    };

                    resolve(stats);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('[HubSpot] Cache stats error:', error);
            return { total: 0, valid: 0, expired: 0, oldestTimestamp: null };
        }
    }
}

// Globale Instanz
const hubspotIntegration = new HubSpotIntegration();

// Pre-Load beim App-Start (optional)
if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', () => {
        // Owners vorladen für schnellere Dropdown-Anzeige
        hubspotIntegration.preloadOwners();

        // Optional: Top-Companies vorladen wenn online
        if (navigator.onLine) {
            hubspotIntegration.preloadTopCompanies();
        }

        // Cache-Cleanup alle 12 Stunden
        setInterval(() => {
            hubspotIntegration.cleanExpiredCache();
        }, 12 * 60 * 60 * 1000);
    });
}
