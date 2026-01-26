// ============================================
// SEITEN-MODELL
// Factory-Funktion für leere Seite
// EXAKT aus Angebotsgenerator übernommen für 100% Kompatibilität
// ============================================

/**
 * Erstellt eine leere Seite mit allen benötigten Feldern
 * @param {string} typ - Seiten-Typ: 'frontseite', 'rueckseite', 'linkerGiebel', 'rechterGiebel'
 * @returns {object} Seiten-Objekt
 */
function createEmptySeite(typ) {
    return {
        typ: typ,
        // NEU: Pflichtfeld "Zu reinigen?"
        zuReinigen: null, // null = nicht entschieden, true = ja, false = nein
        aktiv: false,
        breite: 0,
        hoehe: 0,
        flaeche: 0,
        // Optionale Felder
        letzteSanierung: '', // Jahr
        farbwerte: '', // Freitext
        balkone: false,
        link360: '',
        // Bühnen-Daten mit Preislogik
        buehne: {
            typ: 'keine',
            tage: 1,
            preis: 0, // 0, 390 oder 'anfrage'
            beschreibung: ''
        },
        // Reinigungsprodukt
        reinigungsprodukt: {
            standard: true, // FFC/FFC Plus
            zusaetzlichErforderlich: false,
            zusaetzlichProdukte: [], // ['icarly_stone', 'm1', ...]
            anwendung: 'zusaetzlich', // 'zusaetzlich' oder 'stattdessen'
            begruendung: ''
        },
        // Zugänglichkeit mit Untermenü
        zugaenglichkeit: {
            typ: 'ungehindert', // 'ungehindert' oder 'eingeschraenkt'
            einschraenkungen: [], // ['gehweg', 'parkplatz', ...]
            sonstigesBeschreibung: ''
        },
        // Schäden/Besonderheiten
        schaeden: {
            vorhanden: false,
            graffiti: { aktiv: false, beschreibung: '', fotos: [] },
            loecher: { aktiv: false, beschreibung: '', fotos: [] },
            risse: { aktiv: false, beschreibung: '', fotos: [] },
            weitereBesonderheiten: ''
        },
        // Legacy-Felder
        massnahmen: { gruenschnitt: false, parkplatz: false, gehweg: false, strasse: false, sonstiges: false, sonstigesBeschreibung: '' },
        hindernisse: [],
        untergrund: 'asphalt',

        // PWA-ERWEITERUNGEN (nicht im Original, aber kompatibel)
        // Erweiterte Foto-Metadaten
        fotos: [], // Übersichts-/Detailfotos

        // Sprachnotizen
        audioNotes: [],

        // Sync-Status
        syncStatus: {
            lastSynced: null,
            pendingChanges: false,
            conflicted: false
        }
    };
}
