// ============================================
// VALIDIERUNGS-LOGIK
// Aus objekterfassung.js übernommen
// ============================================

/**
 * Validiert alle Immobilien
 * KRITISCHE REGELN:
 * 1. Min. 1 Immobilie erforderlich
 * 2. ALLE Seiten müssen Entscheidung haben (zuReinigen !== null)
 * 3. Min. 1 Seite muss zuReinigen=true sein
 *
 * @param {Array} immobilien - Array von Immobilien
 * @returns {object} Validierungsergebnis mit { valid, undecidedCount, aktiveSeitenCount, errors }
 */
function validateBlock(immobilien) {
    let undecidedCount = 0;
    let aktiveSeitenCount = 0;
    const errors = [];

    // Prüfung 1: Min. 1 Immobilie
    if (!immobilien || immobilien.length === 0) {
        errors.push('Mindestens eine Immobilie erforderlich');
        return {
            valid: false,
            undecidedCount: 0,
            aktiveSeitenCount: 0,
            errors: errors
        };
    }

    // Prüfung 2 + 3: Alle Seiten durchgehen
    immobilien.forEach((immo, immoIdx) => {
        Object.entries(immo.seiten || {}).forEach(([seiteKey, seite]) => {
            // Unentschiedene Seiten zählen
            if (seite.zuReinigen === null) {
                undecidedCount++;
                errors.push(`Immobilie ${immo.nummer}, ${SEITEN_TYPEN[seiteKey]?.label}: Entscheidung fehlt`);
            }
            // Aktive Seiten zählen
            else if (seite.zuReinigen === true) {
                aktiveSeitenCount++;

                // Dimensionen prüfen bei aktiven Seiten
                if (!seite.breite || seite.breite <= 0) {
                    errors.push(`Immobilie ${immo.nummer}, ${SEITEN_TYPEN[seiteKey]?.label}: Breite fehlt`);
                }
                if (!seite.hoehe || seite.hoehe <= 0) {
                    errors.push(`Immobilie ${immo.nummer}, ${SEITEN_TYPEN[seiteKey]?.label}: Höhe fehlt`);
                }
            }
        });
    });

    // Prüfung 4: Min. 1 aktive Seite
    if (aktiveSeitenCount === 0) {
        errors.push('Mindestens eine Seite muss zur Reinigung markiert sein');
    }

    const valid = undecidedCount === 0 && aktiveSeitenCount > 0 && errors.length === 0;

    return {
        valid: valid,
        undecidedCount: undecidedCount,
        aktiveSeitenCount: aktiveSeitenCount,
        errors: errors
    };
}

/**
 * Statistiken berechnen
 * @param {Array} immobilien - Array von Immobilien
 * @returns {object} Statistiken
 */
function getStats(immobilien) {
    let gesamtFlaeche = 0;
    let aktiveSeitenCount = 0;
    let undecidedCount = 0;
    let totalPhotoCount = 0;
    let totalAudioNotesCount = 0;

    (immobilien || []).forEach(immo => {
        Object.values(immo.seiten || {}).forEach(seite => {
            // Fläche summieren (nur aktive Seiten)
            if (seite.zuReinigen === true) {
                gesamtFlaeche += seite.flaeche || 0;
                aktiveSeitenCount++;
            }
            // Unentschiedene zählen
            else if (seite.zuReinigen === null) {
                undecidedCount++;
            }

            // Fotos zählen (PWA-Feature)
            if (seite.fotos && Array.isArray(seite.fotos)) {
                totalPhotoCount += seite.fotos.length;
            }

            // Schaden-Fotos zählen
            if (seite.schaeden) {
                ['graffiti', 'loecher', 'risse'].forEach(schadensTyp => {
                    const schaden = seite.schaeden[schadensTyp];
                    if (schaden && schaden.fotos && Array.isArray(schaden.fotos)) {
                        totalPhotoCount += schaden.fotos.length;
                    }
                });
            }

            // Audio-Notizen zählen (PWA-Feature)
            if (seite.audioNotes && Array.isArray(seite.audioNotes)) {
                totalAudioNotesCount += seite.audioNotes.length;
            }
        });
    });

    return {
        anzahlImmobilien: (immobilien || []).length,
        gesamtFlaeche: gesamtFlaeche,
        aktiveSeitenCount: aktiveSeitenCount,
        undecidedCount: undecidedCount,
        totalPhotoCount: totalPhotoCount,
        totalAudioNotesCount: totalAudioNotesCount
    };
}

/**
 * Auto-Berechnung der Fläche bei Breite/Höhe-Änderung
 * @param {object} seite - Seiten-Objekt (wird mutiert!)
 */
function updateSeiteFlaeche(seite) {
    seite.flaeche = (seite.breite || 0) * (seite.hoehe || 0);
}

/**
 * Validiert eine einzelne Seite
 * @param {object} seite - Seiten-Objekt
 * @returns {object} { valid, errors }
 */
function validateSeite(seite) {
    const errors = [];

    // Entscheidung muss getroffen sein
    if (seite.zuReinigen === null) {
        errors.push('Entscheidung "Zu reinigen?" fehlt');
    }

    // Wenn zur Reinigung: Dimensionen müssen vorhanden sein
    if (seite.zuReinigen === true) {
        if (!seite.breite || seite.breite <= 0) {
            errors.push('Breite muss größer als 0 sein');
        }
        if (!seite.hoehe || seite.hoehe <= 0) {
            errors.push('Höhe muss größer als 0 sein');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}
