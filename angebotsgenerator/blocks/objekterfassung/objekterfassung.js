// ============================================
// FASSADENFIX - BLOCK 2: OBJEKTERFASSUNG
// Modul für Immobilien und Seiten-Daten
// ============================================

/**
 * Objekterfassung Module
 * Verwaltet Block 2: Immobilien, Seiten, Bühnen, Schäden
 */
const ObjekterfassungModule = {
    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Modul initialisieren
     */
    init() {
        // Immobilien aus State laden oder neue erstellen
        if (!AppState.immobilien || AppState.immobilien.length === 0) {
            if (typeof createEmptyImmobilie === 'function') {
                AppState.immobilien = [createEmptyImmobilie(1)];
            }
        }

        // Globale immobilien-Variable synchronisieren (Legacy)
        if (typeof immobilien !== 'undefined') {
            window.immobilien = AppState.immobilien;
        }

        this.render();
        this.setupValidation();

        console.info('📦 Block 2 (Objekterfassung) initialisiert');
    },

    /**
     * Validierung einrichten
     */
    setupValidation() {
        // Auf Immobilien-Änderungen reagieren
        onStateChange('immobilien', () => {
            this.validateBlock();
            this.render();
        });
    },

    // ============================================
    // RENDERING
    // ============================================

    /**
     * Immobilien rendern
     */
    render() {
        // Legacy-Funktion nutzen
        if (typeof renderImmobilien === 'function') {
            renderImmobilien();
        }

        // Statistiken aktualisieren
        this.updateStats();
    },

    /**
     * Statistiken aktualisieren
     */
    updateStats() {
        const stats = this.getStats();

        // UI-Elemente aktualisieren
        const immoCount = document.getElementById('immoCount');
        const totalQm = document.getElementById('totalQm');
        const block2Info = document.getElementById('block2Info');

        if (immoCount) immoCount.textContent = stats.anzahlImmobilien;
        if (totalQm) totalQm.textContent = stats.gesamtFlaeche.toLocaleString('de-DE');
        if (block2Info) {
            block2Info.textContent = `${stats.anzahlImmobilien} Immobilie(n) • ${stats.gesamtFlaeche.toLocaleString('de-DE')} m²`;
        }
    },

    /**
     * Statistiken berechnen
     * @returns {object} Statistiken
     */
    getStats() {
        let gesamtFlaeche = 0;
        let aktiveSeitenCount = 0;
        let undecidedCount = 0;

        (AppState.immobilien || []).forEach(immo => {
            Object.values(immo.seiten || {}).forEach(seite => {
                if (seite.zuReinigen === true) {
                    gesamtFlaeche += seite.flaeche || 0;
                    aktiveSeitenCount++;
                } else if (seite.zuReinigen === null) {
                    undecidedCount++;
                }
            });
        });

        return {
            anzahlImmobilien: (AppState.immobilien || []).length,
            gesamtFlaeche,
            aktiveSeitenCount,
            undecidedCount
        };
    },

    // ============================================
    // VALIDATION
    // ============================================

    /**
     * Block-Validierung
     * @returns {boolean} Ob Block vollständig ist
     */
    validateBlock() {
        const stats = this.getStats();

        const hasImmobilien = stats.anzahlImmobilien > 0;
        const allDecided = stats.undecidedCount === 0;
        const hasActiveSides = stats.aktiveSeitenCount > 0;

        const isComplete = hasImmobilien && allDecided && hasActiveSides;

        // Button aktualisieren
        const btn = document.getElementById('block2CompleteBtn');
        if (btn) {
            btn.disabled = !isComplete;

            if (stats.undecidedCount > 0) {
                btn.textContent = `⚠️ Noch ${stats.undecidedCount} Seite(n) ohne Entscheidung`;
            } else if (!hasActiveSides) {
                btn.textContent = '⚠️ Mindestens 1 Seite zur Reinigung auswählen';
            } else {
                btn.textContent = '✓ Objekterfassung abschließen → weiter zu Angebotserstellung';
            }
        }

        return isComplete;
    },

    /**
     * Block abschließen
     */
    complete() {
        if (!this.validateBlock()) {
            console.warn('Block 2 nicht vollständig');
            return false;
        }

        // Positionen generieren
        if (typeof generatePositionsFromImmobilien === 'function') {
            generatePositionsFromImmobilien();
        }

        // Orchestrator informieren
        if (typeof Orchestrator !== 'undefined') {
            Orchestrator.completeBlock(2);
        } else {
            completeBlock(2); // Legacy fallback
        }

        return true;
    },

    // ============================================
    // IMMOBILIEN CRUD
    // ============================================

    /**
     * Immobilie hinzufügen
     */
    addImmobilie() {
        const newNummer = (AppState.immobilien || []).length + 1;

        if (typeof createEmptyImmobilie === 'function') {
            const newImmo = createEmptyImmobilie(newNummer);
            AppState.immobilien.push(newImmo);

            // Legacy sync
            if (typeof immobilien !== 'undefined') {
                window.immobilien = AppState.immobilien;
            }

            this.render();
        }
    },

    /**
     * Immobilie entfernen
     * @param {number} index - Index der Immobilie
     */
    removeImmobilie(index) {
        if (AppState.immobilien.length <= 1) {
            alert('Mindestens eine Immobilie erforderlich');
            return;
        }

        AppState.immobilien.splice(index, 1);

        // Nummern neu vergeben
        AppState.immobilien.forEach((immo, idx) => {
            immo.nummer = idx + 1;
        });

        // Legacy sync
        if (typeof immobilien !== 'undefined') {
            window.immobilien = AppState.immobilien;
        }

        this.render();
    },

    /**
     * Immobilie abrufen
     * @param {number} index - Index
     * @returns {object} Immobilie
     */
    getImmobilie(index) {
        return AppState.immobilien[index];
    },

    // ============================================
    // SEITEN-MANAGEMENT
    // ============================================

    /**
     * Seite aktualisieren
     * @param {number} immoIdx - Immobilien-Index
     * @param {string} seiteKey - Seiten-Key
     * @param {string} field - Feldname
     * @param {*} value - Wert
     */
    updateSeite(immoIdx, seiteKey, field, value) {
        if (!AppState.immobilien[immoIdx]?.seiten?.[seiteKey]) return;

        AppState.immobilien[immoIdx].seiten[seiteKey][field] = value;

        // Fläche automatisch berechnen bei Breite/Höhe-Änderung
        if (field === 'breite' || field === 'hoehe') {
            const seite = AppState.immobilien[immoIdx].seiten[seiteKey];
            seite.flaeche = (seite.breite || 0) * (seite.hoehe || 0);
        }

        // Legacy sync
        if (typeof immobilien !== 'undefined') {
            window.immobilien = AppState.immobilien;
        }

        this.validateBlock();

        // Preview aktualisieren
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    },

    /**
     * Seiten-Reinigungsentscheidung setzen
     * @param {number} immoIdx - Immobilien-Index
     * @param {string} seiteKey - Seiten-Key
     * @param {boolean} zuReinigen - true/false/null
     */
    setZuReinigen(immoIdx, seiteKey, zuReinigen) {
        this.updateSeite(immoIdx, seiteKey, 'zuReinigen', zuReinigen);
        this.updateSeite(immoIdx, seiteKey, 'aktiv', zuReinigen === true);
    },

    /**
     * Alle Seiten einer Immobilie setzen
     * @param {number} immoIdx - Immobilien-Index
     * @param {boolean} zuReinigen - Wert
     */
    setAlleSeiten(immoIdx, zuReinigen) {
        const immo = AppState.immobilien[immoIdx];
        if (!immo) return;

        Object.keys(immo.seiten).forEach(seiteKey => {
            this.setZuReinigen(immoIdx, seiteKey, zuReinigen);
        });

        this.render();
    },

    // ============================================
    // EXPORT
    // ============================================

    /**
     * Daten für Block-Export
     * @returns {object} Block-Daten
     */
    getData() {
        return {
            immobilien: AppState.immobilien,
            stats: this.getStats()
        };
    },

    /**
     * Block zurücksetzen
     */
    reset() {
        if (typeof createEmptyImmobilie === 'function') {
            AppState.immobilien = [createEmptyImmobilie(1)];
        } else {
            AppState.immobilien = [];
        }

        // Legacy sync
        if (typeof immobilien !== 'undefined') {
            window.immobilien = AppState.immobilien;
        }

        this.render();
    }
};

// Register with BlockRegistry
if (typeof BlockRegistry !== 'undefined') {
    BlockRegistry.objekterfassung = ObjekterfassungModule;
}

// Global export
if (typeof window !== 'undefined') {
    window.ObjekterfassungModule = ObjekterfassungModule;
}
