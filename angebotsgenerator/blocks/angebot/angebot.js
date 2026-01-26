// ============================================
// FASSADENFIX - BLOCK 3: ANGEBOTSERSTELLUNG
// Modul für Positionen, Summen, PDF-Export
// ============================================

/**
 * Angebot Module
 * Verwaltet Block 3: Positionen, Rabatte, Textbausteine, Export
 */
const AngebotModule = {
    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Modul initialisieren
     */
    init() {
        // Positionen aus State laden oder generieren
        if (!AppState.positions || AppState.positions.length === 0) {
            if (typeof generatePositionsFromImmobilien === 'function') {
                generatePositionsFromImmobilien();
            }
        }

        // Legacy sync
        if (typeof positions !== 'undefined') {
            window.positions = AppState.positions;
        }

        this.render();
        this.bindFormFields();
        this.setupTextbausteine();

        console.info('📦 Block 3 (Angebot) initialisiert');
    },

    /**
     * Formularfelder binden
     */
    bindFormFields() {
        const fieldMappings = {
            'angebotsnummer': 'angebot.nummer',
            'angebotsdatum': 'angebot.datum',
            'gueltigBis': 'angebot.gueltigBis',
            'hubspotDealName': 'hubspotDeal.name'
        };

        Object.entries(fieldMappings).forEach(([fieldId, statePath]) => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const value = getState(statePath);
            if (value) field.value = value;

            field.addEventListener('input', (e) => {
                updateState(statePath, e.target.value);
            });
        });
    },

    /**
     * Textbausteine einrichten
     */
    setupTextbausteine() {
        const einleitung = document.getElementById('einleitungstext');
        const schluss = document.getElementById('schlusstext');

        if (einleitung) {
            einleitung.addEventListener('change', () => {
                updateState('textbausteine.einleitung.typ', einleitung.value);
                if (typeof updateTextbaustein === 'function') {
                    updateTextbaustein('einleitung');
                }
            });
        }

        if (schluss) {
            schluss.addEventListener('change', () => {
                updateState('textbausteine.schluss.typ', schluss.value);
                if (typeof updateTextbaustein === 'function') {
                    updateTextbaustein('schluss');
                }
            });
        }
    },

    // ============================================
    // RENDERING
    // ============================================

    /**
     * Positionen rendern
     */
    render() {
        // Sync State → Global
        if (typeof positions !== 'undefined') {
            window.positions = AppState.positions;
        }

        // Legacy-Rendering nutzen
        if (typeof renderPositionenListe === 'function') {
            renderPositionenListe();
        }

        this.updateSums();
    },

    /**
     * Summen aktualisieren
     */
    updateSums() {
        const totals = this.calculateTotals();

        // UI-Elemente
        const posCount = document.getElementById('posCount');
        const posNettoSum = document.getElementById('posNettoSum');
        const posMwst = document.getElementById('posMwst');
        const dealAmount = document.getElementById('dealAmount');
        const fruehbucherErsparnis = document.getElementById('fruehbucherErsparnis');

        if (posCount) posCount.textContent = AppState.positions.length;
        if (posNettoSum) posNettoSum.textContent = totals.nettoNachRabatt.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
        if (posMwst) posMwst.textContent = totals.mwst.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
        if (dealAmount) dealAmount.textContent = totals.brutto.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
        if (fruehbucherErsparnis) fruehbucherErsparnis.textContent = totals.rabatt.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
    },

    /**
     * Summen berechnen
     * @returns {object} Berechnete Werte
     */
    calculateTotals() {
        let netto = 0;

        (AppState.positions || []).forEach(pos => {
            if (!pos.istEckdatenPosition && !pos.bedarfsposition) {
                netto += (pos.menge || 0) * (pos.einzelpreis || 0);
            }
        });

        // Frühbucherrabatt
        const fruehbucherAktiv = document.getElementById('fruehbucherAktiv')?.checked || false;
        const fruehbucherProzent = parseFloat(document.getElementById('fruehbucherProzent')?.value) || 0;

        const rabatt = fruehbucherAktiv ? netto * (fruehbucherProzent / 100) : 0;
        const nettoNachRabatt = netto - rabatt;
        const mwst = nettoNachRabatt * 0.19;
        const brutto = nettoNachRabatt + mwst;

        return {
            netto,
            rabatt,
            nettoNachRabatt,
            mwst,
            brutto
        };
    },

    // ============================================
    // POSITIONS MANAGEMENT
    // ============================================

    /**
     * Position hinzufügen
     * @param {object} position - Position-Daten
     */
    addPosition(position) {
        AppState.positions.push(position);

        // Legacy sync
        if (typeof positions !== 'undefined') {
            window.positions = AppState.positions;
        }

        this.render();
    },

    /**
     * Position aktualisieren
     * @param {number} index - Index
     * @param {string} field - Feldname
     * @param {*} value - Wert
     */
    updatePosition(index, field, value) {
        if (!AppState.positions[index]) return;

        AppState.positions[index][field] = value;

        // Legacy sync
        if (typeof positions !== 'undefined') {
            window.positions = AppState.positions;
        }

        this.updateSums();

        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    },

    /**
     * Position entfernen
     * @param {number} index - Index
     */
    removePosition(index) {
        AppState.positions.splice(index, 1);

        // Legacy sync
        if (typeof positions !== 'undefined') {
            window.positions = AppState.positions;
        }

        this.render();
    },

    /**
     * Positionen neu generieren
     */
    regeneratePositions() {
        if (typeof generatePositionsFromImmobilien === 'function') {
            generatePositionsFromImmobilien();
        }

        // Sync back to state
        if (typeof positions !== 'undefined') {
            AppState.positions = window.positions;
        }

        this.render();
    },

    // ============================================
    // EXPORT
    // ============================================

    /**
     * PDF generieren
     */
    async exportPDF() {
        if (typeof generatePDF === 'function') {
            await generatePDF();
        } else {
            console.error('PDF-Funktion nicht verfügbar');
        }
    },

    /**
     * HubSpot synchronisieren
     */
    async syncHubSpot() {
        if (typeof syncToHubspot === 'function') {
            await syncToHubspot();
        } else if (typeof createHubSpotDeal === 'function') {
            await createHubSpotDeal();
        } else {
            console.error('HubSpot-Sync nicht verfügbar');
        }
    },

    /**
     * Daten für Block-Export
     * @returns {object} Block-Daten
     */
    getData() {
        return {
            angebot: getState('angebot'),
            positions: AppState.positions,
            totals: this.calculateTotals(),
            textbausteine: getState('textbausteine'),
            hubspotDeal: getState('hubspotDeal')
        };
    },

    /**
     * Block zurücksetzen
     */
    reset() {
        AppState.positions = [];

        // Legacy sync
        if (typeof positions !== 'undefined') {
            window.positions = [];
        }

        this.render();
    }
};

// Register with BlockRegistry
if (typeof BlockRegistry !== 'undefined') {
    BlockRegistry.angebot = AngebotModule;
}

// Global export
if (typeof window !== 'undefined') {
    window.AngebotModule = AngebotModule;
}
