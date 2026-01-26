// ============================================
// FASSADENFIX ANGEBOTSGENERATOR - STATE.JS
// Zentrales State-Management mit Event-System
// ============================================

/**
 * Globaler Application State
 * Alle Module greifen auf diesen State zu
 */
const AppState = {
    // ============================================
    // BLOCK 1: AUFTRAGGEBER
    // ============================================
    company: {
        hubspotId: null,
        name: '',
        strasse: '',
        hausnummer: '',
        plz: '',
        ort: '',
        verified: false
    },

    contact: {
        hubspotId: null,
        anrede: '',
        vorname: '',
        nachname: '',
        email: '',
        telefon: ''
    },

    owner: {
        hubspotId: null,
        name: '',
        email: ''
    },

    rechnungsempfaenger: {
        abweichend: false,
        firma: '',
        ansprechpartner: '',
        strasse: '',
        hausnummer: '',
        plz: '',
        ort: ''
    },

    // ============================================
    // BLOCK 2: OBJEKTERFASSUNG
    // ============================================
    immobilien: [],

    // ============================================
    // BLOCK 3: ANGEBOTSERSTELLUNG
    // ============================================
    angebot: {
        nummer: '',
        datum: '',
        gueltigBis: ''
    },

    positions: [],

    rabatte: {
        fruehbucher: {
            aktiv: false,
            prozent: 0,
            datum: ''
        }
    },

    textbausteine: {
        einleitung: {
            typ: 'standard',
            text: ''
        },
        schluss: {
            typ: 'standard',
            text: ''
        }
    },

    hubspotDeal: {
        id: null,
        name: '',
        status: 'pending'
    },

    // ============================================
    // WORKFLOW STATUS
    // ============================================
    workflow: {
        currentBlock: 1,
        blocks: {
            1: { status: 'active', completed: false },
            2: { status: 'locked', completed: false },
            3: { status: 'locked', completed: false }
        }
    },

    // ============================================
    // META
    // ============================================
    meta: {
        initialized: false,
        lastUpdate: null,
        version: '2.0'
    }
};

// ============================================
// EVENT SYSTEM
// ============================================
const StateEvents = new EventTarget();

/**
 * State-Update mit Event-Emission
 * @param {string} path - Pfad im State (z.B. 'company.name')
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

    // Emit event
    StateEvents.dispatchEvent(new CustomEvent('stateChange', {
        detail: { path, value, oldValue }
    }));

    // Emit specific event for this path
    StateEvents.dispatchEvent(new CustomEvent(`stateChange:${path}`, {
        detail: { value, oldValue }
    }));
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
 * @param {string} path - Pfad oder '*' für alle
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
 * @param {string} section - Section zum Zurücksetzen (z.B. 'company', 'immobilien')
 */
function resetState(section) {
    const defaults = {
        company: { hubspotId: null, name: '', strasse: '', hausnummer: '', plz: '', ort: '', verified: false },
        contact: { hubspotId: null, anrede: '', vorname: '', nachname: '', email: '', telefon: '' },
        immobilien: [],
        positions: []
    };

    if (defaults[section] !== undefined) {
        updateState(section, JSON.parse(JSON.stringify(defaults[section])));
    }
}

/**
 * State-Export für Debugging/Speicherung
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
    StateEvents.dispatchEvent(new CustomEvent('stateImported'));
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Block-Status aktualisieren
 * @param {number} blockNum - Block-Nummer (1-3)
 * @param {string} status - 'locked', 'active', 'complete'
 */
function setBlockStatus(blockNum, status) {
    updateState(`workflow.blocks.${blockNum}.status`, status);

    if (status === 'complete') {
        updateState(`workflow.blocks.${blockNum}.completed`, true);
    }

    StateEvents.dispatchEvent(new CustomEvent('blockStatusChange', {
        detail: { blockNum, status }
    }));
}

/**
 * Prüfen ob Block freigeschaltet ist
 * @param {number} blockNum - Block-Nummer
 * @returns {boolean}
 */
function isBlockUnlocked(blockNum) {
    return AppState.workflow.blocks[blockNum]?.status !== 'locked';
}

/**
 * Aktuellen Block abrufen
 * @returns {number} Block-Nummer
 */
function getCurrentBlock() {
    return AppState.workflow.currentBlock;
}

// Export für Module
if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.StateEvents = StateEvents;
    window.updateState = updateState;
    window.getState = getState;
    window.onStateChange = onStateChange;
    window.setBlockStatus = setBlockStatus;
    window.isBlockUnlocked = isBlockUnlocked;
    window.exportState = exportState;
}
