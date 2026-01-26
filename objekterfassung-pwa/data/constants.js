// ============================================
// FASSADENFIX ANGEBOTSGENERATOR - CONSTANTS.JS
// Zentrale Konstanten und Konfiguration
// ============================================

// ============================================
// SEITEN-TYPEN
// (Keys müssen mit createEmptyImmobilie übereinstimmen!)
// ============================================
const SEITEN_TYPEN = {
    frontseite: { label: 'Frontseite', icon: '🏠', beschreibung: 'Vorderseite des Gebäudes, typischerweise Straßenseite.' },
    rueckseite: { label: 'Rückseite', icon: '🏡', beschreibung: 'Hinterer Teil des Gebäudes, oft Garten-/Hofseite.' },
    linkerGiebel: { label: 'Linker Giebel', icon: '◀️', beschreibung: 'Linke Seitenwand.' },
    rechterGiebel: { label: 'Rechter Giebel', icon: '▶️', beschreibung: 'Rechte Seitenwand.' }
};


// ============================================
// BÜHNEN-PREISE
// ============================================
const BUEHNEN_PREISE = {
    'keine': { preis: 0, label: 'Keine Bühne', einheit: '' },
    'standard': { preis: 390, label: 'FassadenFix Standard', einheit: 'Tag' },
    'sonder': { preis: 'anfrage', label: 'Sonderbühne', einheit: '' },
    'abseilen': { preis: 'anfrage', label: 'Abseilen', einheit: '' },
    'geruest': { preis: 'anfrage', label: 'Gerüst', einheit: '' },
    'kran': { preis: 'anfrage', label: 'Kran', einheit: '' },
    'sonstiges': { preis: 'anfrage', label: 'Sonstiges', einheit: '' }
};

const FF_STANDARD_BUEHNE_PREIS = 390;

// ============================================
// MASSNAHMEN-OPTIONEN
// ============================================
const MASSNAHMEN_OPTIONEN = [
    { id: 'gruenschnitt', label: 'Grünschnitt erforderlich' },
    { id: 'parkplatz', label: 'Parkplatzsperrung' },
    { id: 'gehweg', label: 'Gehwegsperrung' },
    { id: 'strasse', label: 'Straßensperrung' },
    { id: 'genehmigung', label: 'Sondergenehmigung erforderlich' },
    { id: 'winterdienst', label: 'Winterdienst beachten' }
];

// ============================================
// UNTERGRUND-OPTIONEN
// ============================================
const UNTERGRUND_OPTIONEN = [
    { id: 'asphalt', label: 'Asphalt' },
    { id: 'pflaster', label: 'Pflastersteine' },
    { id: 'schotter', label: 'Schotter/Kies' },
    { id: 'rasen', label: 'Rasen/Wiese' },
    { id: 'erde', label: 'Unbefestigt/Erde' },
    { id: 'gemischt', label: 'Gemischt' }
];

// ============================================
// ZUGÄNGLICHKEIT-OPTIONEN
// ============================================
const ZUGAENGLICHKEIT_OPTIONEN = [
    { id: 'gut', label: '✓ Gut zugänglich' },
    { id: 'parkplatz', label: 'Über Parkplatz' },
    { id: 'gehweg', label: 'Über Gehweg' },
    { id: 'einfahrt', label: 'Über Einfahrt' },
    { id: 'hinterhof', label: 'Über Hinterhof' },
    { id: 'schwer', label: '⚠️ Schwer zugänglich' }
];

// ============================================
// HINDERNIS-OPTIONEN
// ============================================
const HINDERNIS_OPTIONEN = [
    { id: 'hecke', label: 'Hecke/Büsche' },
    { id: 'baeume', label: 'Bäume' },
    { id: 'zaun', label: 'Zaun' },
    { id: 'markise', label: 'Markise/Überdachung' },
    { id: 'spielgeraete', label: 'Spielgeräte' },
    { id: 'parkende_autos', label: 'Parkende Autos' },
    { id: 'sonstiges', label: 'Sonstiges' }
];

// ============================================
// SCHADEN-TYPEN
// ============================================
const SCHADEN_TYPEN = [
    { id: 'graffiti', label: 'Graffiti', icon: '🎨' },
    { id: 'loecher', label: 'Specht-Löcher/Löcher', icon: '🕳️' },
    { id: 'risse', label: 'Risse/substanzielle Schäden', icon: '⚡' }
];

// ============================================
// FASSADENFIX MITARBEITER (HubSpot Owner IDs)
// ============================================
const FF_MITARBEITER = {
    '147946553': { name: 'René Bläsche', email: 'r.blaesche@fassadenfix.de', phone: '' },
    '1126851218': { name: 'Sven Zorn', email: 's.zorn@fassadenfix.de', phone: '' },
    '978174667': { name: 'Ronny Ries', email: 'r.ries@fassadenfix.de', phone: '' }
};

// ============================================
// REINIGUNGSPRODUKTE (gemäß HERMES Dokumentation 07/22)
// ============================================
const REINIGUNGSPRODUKTE = {
    kategorien: {
        organisch: {
            label: 'Organische Verschmutzung (Algen/Pilze)',
            anteil: '90%',
            color: '#22c55e'
        },
        mineralisch: {
            label: 'Mineralische Verschmutzung (Kalk/Zement)',
            anteil: '10%',
            color: '#3b82f6'
        },
        extrem: {
            label: 'Extreme Verschmutzung (Ruß/Harz/Teer)',
            anteil: 'sporadisch',
            color: '#ef4444'
        }
    },
    reiniger: [
        {
            id: 'hf1_plus',
            label: 'HF1 plus',
            typ: 'Putzfassadenreiniger (gebrauchsfertig)',
            kategorie: 'organisch',
            beschreibung: 'Standardreiniger für organische Verschmutzung'
        },
        {
            id: 'hf1_plus_5',
            label: 'HF1 plus-5',
            typ: 'Putzfassadenreiniger (Konzentrat 1:5)',
            kategorie: 'organisch',
            beschreibung: 'Konzentrat für größere Flächen'
        },
        {
            id: 'alkalistar_5',
            label: 'AlkaliStar-5',
            typ: 'Klinkerreiniger (Konzentrat 1:5)',
            kategorie: 'mineralisch',
            beschreibung: 'Für Kalk- und Zementschleier auf Klinker'
        },
        {
            id: 'spezial_s1',
            label: 'Spezial S1',
            typ: 'Spezialreiniger (Konzentrat)',
            kategorie: 'extrem',
            beschreibung: 'Für extreme Verschmutzung (Ruß, Harz, Teer)'
        }
    ],
    standard: [
        { id: 'hf1_plus', label: 'HF1 plus (Standard)', selected: true }
    ],
    zusaetzlich: [
        { id: 'hf1_plus_5', label: 'HF1 plus-5 (Konzentrat)' },
        { id: 'alkalistar_5', label: 'AlkaliStar-5' },
        { id: 'spezial_s1', label: 'Spezial S1' },
        { id: 'hfs', label: 'HFS (Schutz)' },
        { id: 'hfi', label: 'HFI (Imprägnierung)' },
        { id: 'antimuff', label: 'ANTIMUFF (Duftstoff)' },
        { id: 'reinigungsverstaerker', label: 'Reinigungsverstärker' },
        { id: 'sonstiges', label: 'Sonstiges' }
    ]
};

// ============================================
// TEXTBAUSTEINE für Angebote
// ============================================
const TEXTBAUSTEINE = {
    einleitung: {
        standard: `Sehr geehrte Damen und Herren,

vielen Dank für Ihr Interesse an unseren Leistungen zur professionellen Fassadenreinigung. Gerne unterbreiten wir Ihnen hiermit ein unverbindliches Angebot für die nachfolgend aufgeführten Objekte.`,
        bestandskunde: `Sehr geehrte(r) {ansprechpartner},

wir freuen uns über Ihre erneute Anfrage und die Möglichkeit, auch weiterhin für {firma} tätig sein zu dürfen. Nachfolgend unser Angebot für die gewünschten Reinigungsarbeiten.`,
        hausverwaltung: `Sehr geehrte Damen und Herren,

gemäß Ihrer Ausschreibung bzw. Ihrer Anfrage erlauben wir uns, Ihnen nachfolgendes Angebot für die Reinigung der von Ihnen verwalteten Liegenschaften zu unterbreiten.`,
        empfehlung: `Sehr geehrte(r) {ansprechpartner},

wir bedanken uns für Ihr Vertrauen und die Empfehlung. Gerne erstellen wir Ihnen nachfolgendes Angebot für die professionelle Fassadenreinigung Ihrer Immobilie(n).`
    },
    schluss: {
        standard: `Wir freuen uns auf Ihren Auftrag und stehen für Rückfragen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr FassadenFix-Team`,
        fruehbucher: `Profitieren Sie von unserem aktuellen Frühbucherrabatt! Bei zeitnaher Beauftragung sichern Sie sich den angegebenen Preisvorteil.

Wir freuen uns auf Ihre positive Rückmeldung.

Mit freundlichen Grüßen
Ihr FassadenFix-Team`,
        sofort: `Bei kurzfristiger Beauftragung können wir mit den Arbeiten umgehend beginnen. Sprechen Sie uns gerne an – wir finden einen zeitnahen Termin.

Mit freundlichen Grüßen
Ihr FassadenFix-Team`,
        wirtschaftlichkeit: `Eine regelmäßige Fassadenreinigung schützt den Wert Ihrer Immobilie nachhaltig und verhindert kostspielige Sanierungen. Vertrauen Sie auf unsere zertifizierten Eigenprodukte für langanhaltenden Schutz.

Mit freundlichen Grüßen
Ihr FassadenFix-Team`
    }
};
