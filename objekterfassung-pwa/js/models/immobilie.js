// ============================================
// IMMOBILIEN-MODELL
// Factory-Funktion für leere Immobilie
// EXAKT aus Angebotsgenerator übernommen für 100% Kompatibilität
// ============================================

/**
 * Erstellt eine leere Immobilie mit allen benötigten Feldern
 * @param {number} nummer - Laufende Nummer der Immobilie
 * @returns {object} Immobilien-Objekt
 */
function createEmptyImmobilie(nummer) {
    return {
        id: Date.now(),
        nummer: nummer,
        hubspotImmobilieId: null,
        hubspotAssociations: { companyId: null, contactId: null, dealId: null },
        // Adresse mit Koordinaten für Kartenintegration
        adresse: { strasse: '', hausnummer: '', plz: '', ort: '', lat: null, lng: null, verified: false },
        // NEU: Kopfdaten
        datumObjektaufnahme: '', // Datum (YYYY-MM-DD)
        ffMitarbeiter: '', // HubSpot Owner ID
        agMitarbeiter: {
            name: '',
            email: '',
            telefon: '',
            position: '', // z.B. Hausmeister, Verwalter
            hubspotContactId: null // für Sync
        },
        // PFLICHTABFRAGEN
        reinigungMoeglich: null, // null = noch nicht beantwortet, true/false
        marketingGeeignet: null, // null = noch nicht beantwortet, true/false
        marketingAufgabeErstellt: false, // Flag ob HubSpot-Aufgabe bereits erstellt
        // Status
        gesamtflaeche: 0,
        status: 'neu',
        historie: { angebote: [], auftraege: [], termine: [], letzteReinigung: null },
        alleSeiten: false,
        // Seiten
        seiten: {
            frontseite: createEmptySeite('frontseite'),
            rueckseite: createEmptySeite('rueckseite'),
            linkerGiebel: createEmptySeite('linkerGiebel'),
            rechterGiebel: createEmptySeite('rechterGiebel')
        }
    };
}

/**
 * Berechnet die Gesamtfläche einer Immobilie
 * (nur Seiten mit zuReinigen = true)
 * @param {object} immobilie - Immobilien-Objekt
 * @returns {number} Gesamtfläche in m²
 */
function getImmobilieGesamtflaeche(immobilie) {
    let gesamtflaeche = 0;

    Object.values(immobilie.seiten || {}).forEach(seite => {
        if (seite.zuReinigen === true) {
            gesamtflaeche += seite.flaeche || 0;
        }
    });

    return gesamtflaeche;
}

/**
 * Formatiert Adresse als String
 * @param {object} adresse - Adress-Objekt
 * @returns {string} Formatierte Adresse
 */
function getFormattedAdresse(adresse) {
    if (!adresse || !adresse.strasse) return '';
    return `${adresse.strasse} ${adresse.hausnummer}, ${adresse.plz} ${adresse.ort}`;
}
