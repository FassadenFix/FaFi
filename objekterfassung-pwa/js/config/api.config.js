// ============================================
// API CONFIGURATION
// Backend-URL und Endpunkte
// ============================================

/**
 * API Configuration
 * Update BASE_URL nach Backend-Deployment auf Render
 */
const API_CONFIG = {
    // Backend-URL (Render Deployment)
    // WICHTIG: Nach Deployment auf Render aktualisieren!
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'  // Lokale Entwicklung
        : 'https://fassadenfix-api.onrender.com',  // Production (Render)

    // API Endpunkte
    ENDPOINTS: {
        // HubSpot Companies
        COMPANIES_SEARCH: '/api/hubspot/companies/search',
        COMPANIES_DETAILS: '/api/hubspot/companies',
        COMPANY_CONTACTS: '/api/hubspot/companies/:id/contacts',

        // HubSpot Contacts
        CONTACTS_SEARCH: '/api/hubspot/contacts/search',

        // HubSpot Owners (FF-Mitarbeiter)
        OWNERS: '/api/hubspot/owners',

        // HubSpot Deals
        DEALS_CREATE: '/api/hubspot/deals',
        DEALS_DETAILS: '/api/hubspot/deals/:id',

        // Health & Status
        HEALTH: '/api/health',
        STATUS: '/api/status'
    },

    // Request-Konfiguration
    TIMEOUT: 10000,          // 10 Sekunden
    RETRY_COUNT: 3,          // Max. 3 Versuche
    RETRY_DELAY: 1000,       // 1 Sekunde zwischen Versuchen

    // Cache-Konfiguration
    CACHE_DURATION: 24 * 60 * 60 * 1000,  // 24 Stunden

    // Mock-Daten aktivieren bei Backend-Ausfall?
    USE_MOCK_ON_ERROR: true
};

/**
 * Baut vollständige URL aus Endpoint
 * @param {string} endpoint - Endpoint-Key aus ENDPOINTS
 * @param {object} params - URL-Parameter (z.B. {id: '123'})
 * @param {object} query - Query-Parameter (z.B. {query: 'test'})
 * @returns {string} Vollständige URL
 */
function buildApiUrl(endpoint, params = {}, query = {}) {
    let url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint];

    // URL-Parameter ersetzen (z.B. :id)
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });

    // Query-Parameter anhängen
    const queryString = Object.keys(query)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
        .join('&');

    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}

/**
 * Macht API-Request mit Retry-Logic
 * @param {string} url - Vollständige URL
 * @param {object} options - Fetch-Optionen
 * @returns {Promise<Response>} Fetch-Response
 */
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Timeout-Wrapper
    const fetchWithTimeout = (url, options) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), options.timeout)
            )
        ]);
    };

    // Retry-Logic
    let lastError;
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_COUNT; attempt++) {
        try {
            const response = await fetchWithTimeout(url, mergedOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;

        } catch (error) {
            lastError = error;
            console.warn(`[API] Request failed (Attempt ${attempt}/${API_CONFIG.RETRY_COUNT}):`, error.message);

            // Warten vor nächstem Versuch (außer beim letzten)
            if (attempt < API_CONFIG.RETRY_COUNT) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
            }
        }
    }

    // Alle Versuche fehlgeschlagen
    throw lastError;
}

/**
 * Prüft Backend-Verfügbarkeit
 * @returns {Promise<boolean>} true wenn Backend erreichbar
 */
async function checkBackendHealth() {
    try {
        const url = buildApiUrl('HEALTH');
        const response = await fetch(url, { timeout: 5000 });
        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('[API] Backend health check failed:', error);
        return false;
    }
}

// Global verfügbar machen
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.buildApiUrl = buildApiUrl;
    window.apiRequest = apiRequest;
    window.checkBackendHealth = checkBackendHealth;
}

// Module Export (falls verwendet)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        buildApiUrl,
        apiRequest,
        checkBackendHealth
    };
}
