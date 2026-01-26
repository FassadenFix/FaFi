/**
 * FassadenFix Angebotsgenerator - Unit Tests
 * Test-Suite für State-Management und Module
 * 
 * Ausführen: node tests/run-tests.js
 */

// Minimaler Test-Runner (ohne externe Dependencies)
const TestRunner = {
    passed: 0,
    failed: 0,
    results: [],

    test(name, fn) {
        try {
            fn();
            this.passed++;
            this.results.push({ name, status: 'PASS' });
            console.log(`✅ ${name}`);
        } catch (e) {
            this.failed++;
            this.results.push({ name, status: 'FAIL', error: e.message });
            console.log(`❌ ${name}: ${e.message}`);
        }
    },

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected ${expected}, got ${actual}`);
        }
    },

    assertTrue(value, message = '') {
        if (!value) {
            throw new Error(`${message} - Expected true, got ${value}`);
        }
    },

    assertFalse(value, message = '') {
        if (value) {
            throw new Error(`${message} - Expected false, got ${value}`);
        }
    },

    assertDefined(value, message = '') {
        if (value === undefined || value === null) {
            throw new Error(`${message} - Expected defined value, got ${value}`);
        }
    },

    summary() {
        console.log('\n========================================');
        console.log(`Tests: ${this.passed + this.failed} | Passed: ${this.passed} | Failed: ${this.failed}`);
        console.log('========================================');
        return this.failed === 0;
    }
};

// ============================================
// STATE.JS TESTS (Mock)
// ============================================
console.log('\n📦 Testing State Management...\n');

// Mock AppState
const AppState = {
    company: { hubspotId: null, name: '', strasse: '' },
    contact: { hubspotId: null, vorname: '', nachname: '' },
    workflow: { currentBlock: 1, blocks: { 1: { status: 'active' }, 2: { status: 'locked' } } },
    immobilien: [],
    positions: []
};

// Mock StateEvents
const StateEvents = {
    events: [],
    dispatchEvent(e) { this.events.push(e); },
    addEventListener(type, handler) { this.events.push({ type, handler }); }
};

// updateState Function
function updateState(path, value) {
    const keys = path.split('.');
    let current = AppState;
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    StateEvents.dispatchEvent({ type: 'stateChange', detail: { path, value } });
}

// getState Function
function getState(path) {
    const keys = path.split('.');
    let current = AppState;
    for (const key of keys) {
        if (current[key] === undefined) return undefined;
        current = current[key];
    }
    return current;
}

// Tests
TestRunner.test('updateState: should set simple value', () => {
    updateState('company.name', 'Test GmbH');
    TestRunner.assertEqual(AppState.company.name, 'Test GmbH');
});

TestRunner.test('updateState: should set nested value', () => {
    updateState('workflow.currentBlock', 2);
    TestRunner.assertEqual(AppState.workflow.currentBlock, 2);
});

TestRunner.test('getState: should retrieve value', () => {
    updateState('contact.vorname', 'Max');
    const result = getState('contact.vorname');
    TestRunner.assertEqual(result, 'Max');
});

TestRunner.test('getState: should return undefined for missing path', () => {
    const result = getState('nonexistent.path');
    TestRunner.assertEqual(result, undefined);
});

TestRunner.test('StateEvents: should dispatch events', () => {
    const initialCount = StateEvents.events.length;
    updateState('company.strasse', 'Teststraße');
    TestRunner.assertTrue(StateEvents.events.length > initialCount);
});

// ============================================
// VALIDATION TESTS
// ============================================
console.log('\n📦 Testing Validation Logic...\n');

// Mock Block1 Validation
function validateBlock1() {
    const company = getState('company');
    const contact = getState('contact');
    return !!(company?.name?.trim() && contact?.vorname?.trim() && contact?.nachname?.trim());
}

TestRunner.test('validateBlock1: should return false when empty', () => {
    updateState('company.name', '');
    updateState('contact.vorname', '');
    updateState('contact.nachname', '');
    TestRunner.assertFalse(validateBlock1());
});

TestRunner.test('validateBlock1: should return true when complete', () => {
    updateState('company.name', 'Test GmbH');
    updateState('contact.vorname', 'Max');
    updateState('contact.nachname', 'Mustermann');
    TestRunner.assertTrue(validateBlock1());
});

// ============================================
// IMMOBILIEN TESTS
// ============================================
console.log('\n📦 Testing Immobilien Logic...\n');

function createTestImmobilie(nummer) {
    return {
        nummer,
        seiten: {
            frontseite: { zuReinigen: null, flaeche: 0 },
            rueckseite: { zuReinigen: null, flaeche: 0 }
        }
    };
}

function getImmobilienStats(immobilien) {
    let gesamtFlaeche = 0;
    let undecidedCount = 0;

    immobilien.forEach(immo => {
        Object.values(immo.seiten).forEach(seite => {
            if (seite.zuReinigen === true) gesamtFlaeche += seite.flaeche || 0;
            if (seite.zuReinigen === null) undecidedCount++;
        });
    });

    return { gesamtFlaeche, undecidedCount, anzahl: immobilien.length };
}

TestRunner.test('createTestImmobilie: should create valid structure', () => {
    const immo = createTestImmobilie(1);
    TestRunner.assertEqual(immo.nummer, 1);
    TestRunner.assertDefined(immo.seiten.frontseite);
});

TestRunner.test('getImmobilienStats: should count undecided sides', () => {
    const immos = [createTestImmobilie(1)];
    const stats = getImmobilienStats(immos);
    TestRunner.assertEqual(stats.undecidedCount, 2); // frontseite + rueckseite
});

TestRunner.test('getImmobilienStats: should calculate area', () => {
    const immo = createTestImmobilie(1);
    immo.seiten.frontseite.zuReinigen = true;
    immo.seiten.frontseite.flaeche = 100;
    const stats = getImmobilienStats([immo]);
    TestRunner.assertEqual(stats.gesamtFlaeche, 100);
});

// ============================================
// PRICE CALCULATION TESTS
// ============================================
console.log('\n📦 Testing Price Calculations...\n');

function calculateTotals(positions, fruehbucherProzent = 0) {
    let netto = 0;
    positions.forEach(pos => {
        if (!pos.istEckdatenPosition && !pos.bedarfsposition) {
            netto += (pos.menge || 0) * (pos.einzelpreis || 0);
        }
    });
    const rabatt = netto * (fruehbucherProzent / 100);
    const nettoNachRabatt = netto - rabatt;
    const mwst = nettoNachRabatt * 0.19;
    const brutto = nettoNachRabatt + mwst;
    return { netto, rabatt, nettoNachRabatt, mwst, brutto };
}

TestRunner.test('calculateTotals: should calculate netto correctly', () => {
    const positions = [
        { menge: 100, einzelpreis: 9.75 },
        { menge: 2, einzelpreis: 390 }
    ];
    const totals = calculateTotals(positions);
    TestRunner.assertEqual(totals.netto, 1755);
});

TestRunner.test('calculateTotals: should exclude Eckdaten positions', () => {
    const positions = [
        { menge: 100, einzelpreis: 9.75 },
        { menge: 1, einzelpreis: 0, istEckdatenPosition: true }
    ];
    const totals = calculateTotals(positions);
    TestRunner.assertEqual(totals.netto, 975);
});

TestRunner.test('calculateTotals: should apply Frühbucher discount', () => {
    const positions = [{ menge: 1000, einzelpreis: 10 }];
    const totals = calculateTotals(positions, 10); // 10% Rabatt
    TestRunner.assertEqual(totals.rabatt, 1000);
    TestRunner.assertEqual(totals.nettoNachRabatt, 9000);
});

TestRunner.test('calculateTotals: should calculate MwSt correctly', () => {
    const positions = [{ menge: 100, einzelpreis: 10 }];
    const totals = calculateTotals(positions);
    TestRunner.assertEqual(totals.mwst, 190);
    TestRunner.assertEqual(totals.brutto, 1190);
});

// ============================================
// SUMMARY
// ============================================
const success = TestRunner.summary();
process.exit(success ? 0 : 1);
