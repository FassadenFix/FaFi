// ============================================
// STATE MANAGEMENT für Objekterfassung PWA
// Adaptiert aus Angebotsgenerator state.js
// ============================================

/**
 * Globaler Application State für PWA
 */
const AppState = {
    // ============================================
    // SESSION
    // ============================================
    session: {
        userId: null,              // HubSpot Owner ID (ffMitarbeiter)
        userName: '',
        userEmail: '',
        startTime: null,
        online: navigator.onLine   // Online-Status
    },

    // ============================================
    // IMMOBILIEN (KERN!)
    // ============================================
    immobilien: [],

    // ============================================
    // UI-STATE
    // ============================================
    ui: {
        currentStep: 'list',       // 'list', 'immo-detail', 'seite-form', 'export'
        currentImmoIndex: null,
        currentSeiteKey: null,
        showOfflineWarning: false
    },

    // ============================================
    // SYNC
    // ============================================
    sync: {
        enabled: true,
        lastSync: null,
        pendingUploads: 0,
        errors: []
    },

    // ============================================
    // HUBSPOT CACHE
    // ============================================
    hubspot: {
        companies: [],
        contacts: [],
        owners: []
    },

    // ============================================
    // META
    // ============================================
    meta: {
        initialized: false,
        lastUpdate: null,
        version: '1.0'
    }
};

// ============================================
// EVENT SYSTEM
// ============================================
const StateEvents = new EventTarget();

/**
 * State-Update mit Event-Emission
 * @param {string} path - Pfad im State (z.B. 'immobilien.0.adresse.strasse')
 * @param {*} value - Neuer Wert
 */
function updateState(path, value) {
    const keys = path.split('.');
    let current = AppState;

    // Navigate to parent
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    // Set value
    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Update meta
    AppState.meta.lastUpdate = new Date().toISOString();

    // Emit general event
    StateEvents.dispatchEvent(new CustomEvent('stateChange', {
        detail: { path, value, oldValue }
    }));

    // Emit specific event for this path
    StateEvents.dispatchEvent(new CustomEvent(`stateChange:${path}`, {
        detail: { value, oldValue }
    }));

    // Log für Debugging (kann in Production entfernt werden)
    if (window.DEBUG_STATE) {
        console.log('[State] Updated:', path, '=', value);
    }
}

/**
 * State-Wert abrufen
 * @param {string} path - Pfad im State
 * @returns {*} Wert
 */
function getState(path) {
    const keys = path.split('.');
    let current = AppState;

    for (const key of keys) {
        if (current[key] === undefined) return undefined;
        current = current[key];
    }

    return current;
}

/**
 * Auf State-Änderungen reagieren
 * @param {string} path - Pfad oder '*' für alle Änderungen
 * @param {function} callback - Callback-Funktion
 */
function onStateChange(path, callback) {
    if (path === '*') {
        StateEvents.addEventListener('stateChange', (e) => callback(e.detail));
    } else {
        StateEvents.addEventListener(`stateChange:${path}`, (e) => callback(e.detail));
    }
}

/**
 * Bulk-Update für mehrere Werte
 * @param {object} updates - Objekt mit path:value Paaren
 */
function updateStateMultiple(updates) {
    Object.entries(updates).forEach(([path, value]) => {
        updateState(path, value);
    });
}

/**
 * State zurücksetzen
 * @param {string} section - Section zum Zurücksetzen (z.B. 'immobilien', 'session')
 */
function resetState(section) {
    const defaults = {
        immobilien: [],
        session: {
            userId: null,
            userName: '',
            userEmail: '',
            startTime: null,
            online: navigator.onLine
        },
        ui: {
            currentStep: 'list',
            currentImmoIndex: null,
            currentSeiteKey: null,
            showOfflineWarning: false
        }
    };

    if (defaults[section] !== undefined) {
        updateState(section, JSON.parse(JSON.stringify(defaults[section])));
    }
}

/**
 * State-Export für Speicherung/Export
 * @returns {object} Kopie des States
 */
function exportState() {
    return JSON.parse(JSON.stringify(AppState));
}

/**
 * State-Import
 * @param {object} data - State-Daten
 */
function importState(data) {
    Object.keys(data).forEach(key => {
        if (AppState.hasOwnProperty(key)) {
            AppState[key] = data[key];
        }
    });

    AppState.meta.lastUpdate = new Date().toISOString();
    StateEvents.dispatchEvent(new CustomEvent('stateImported'));
}

// ============================================
// ONLINE/OFFLINE HANDLING
// ============================================

window.addEventListener('online', () => {
    updateState('session.online', true);
    updateState('ui.showOfflineWarning', false);
    console.log('[State] Online');

    // Trigger Sync
    StateEvents.dispatchEvent(new CustomEvent('onlineStatusChange', {
        detail: { online: true }
    }));
});

window.addEventListener('offline', () => {
    updateState('session.online', false);
    updateState('ui.showOfflineWarning', true);
    console.log('[State] Offline');

    StateEvents.dispatchEvent(new CustomEvent('onlineStatusChange', {
        detail: { online: false }
    }));
});
