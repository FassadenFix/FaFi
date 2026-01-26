// ============================================
// FASSADENFIX ANGEBOTSGENERATOR - ORCHESTRATOR.JS
// Koordiniert Block-Module und Workflow
// ============================================

/**
 * Block-Registry - Enthält Referenzen zu allen Block-Modulen
 */
const BlockRegistry = {
    auftraggeber: null,
    objekterfassung: null,
    angebot: null
};

/**
 * Orchestrator - Zentrale Steuerung der Anwendung
 */
const Orchestrator = {
    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Anwendung initialisieren
     */
    async init() {
        console.info('🚀 Orchestrator: Initialisierung...');

        // State initialisieren
        AppState.meta.initialized = false;

        // Event-Listener für Block-Wechsel
        this.setupBlockEventListeners();

        // Module laden
        await this.loadModules();

        // Ersten Block aktivieren
        this.activateBlock(1);

        // State als initialisiert markieren
        AppState.meta.initialized = true;

        console.info('✅ Orchestrator: Initialisierung abgeschlossen');
    },

    /**
     * Block-Event-Listener einrichten
     */
    setupBlockEventListeners() {
        // Block-Completion Events
        StateEvents.addEventListener('blockComplete', (e) => {
            const { blockNum } = e.detail;
            this.onBlockComplete(blockNum);
        });

        // State-Änderungen für Preview-Update
        onStateChange('*', () => {
            if (typeof updatePreview === 'function') {
                updatePreview();
            }
        });
    },

    /**
     * Block-Module laden
     */
    async loadModules() {
        // Module werden später dynamisch geladen
        // Für jetzt: Referenz zu existierenden Funktionen

        BlockRegistry.auftraggeber = {
            init: () => this.initBlock1(),
            validate: () => checkBlock1Complete(),
            getData: () => this.getBlock1Data()
        };

        BlockRegistry.objekterfassung = {
            init: () => this.initBlock2(),
            validate: () => checkBlock2Complete(),
            getData: () => this.getBlock2Data()
        };

        BlockRegistry.angebot = {
            init: () => this.initBlock3(),
            validate: () => canCreateOffer(),
            getData: () => this.getBlock3Data()
        };
    },

    // ============================================
    // BLOCK MANAGEMENT
    // ============================================

    /**
     * Block aktivieren
     * @param {number} blockNum - Block-Nummer (1-3)
     */
    activateBlock(blockNum) {
        // UI aktualisieren
        const block = document.getElementById(`block${blockNum}`);
        if (!block) return;

        // Alle Blöcke zurücksetzen
        [1, 2, 3].forEach(num => {
            const b = document.getElementById(`block${num}`);
            if (b && b.getAttribute('data-status') !== 'complete') {
                b.setAttribute('data-status', num === blockNum ? 'active' : 'locked');
            }
        });

        // State aktualisieren
        updateState('workflow.currentBlock', blockNum);
        setBlockStatus(blockNum, 'active');

        // Block-spezifische Initialisierung
        if (BlockRegistry[this.getBlockName(blockNum)]?.init) {
            BlockRegistry[this.getBlockName(blockNum)].init();
        }

        console.info(`📍 Block ${blockNum} aktiviert`);
    },

    /**
     * Block abschließen und nächsten freischalten
     * @param {number} blockNum - Block-Nummer
     */
    completeBlock(blockNum) {
        // Validierung
        const blockName = this.getBlockName(blockNum);
        if (BlockRegistry[blockName]?.validate && !BlockRegistry[blockName].validate()) {
            console.warn(`⚠️ Block ${blockNum} kann nicht abgeschlossen werden - Validierung fehlgeschlagen`);
            return false;
        }

        // Status setzen
        setBlockStatus(blockNum, 'complete');

        // UI aktualisieren
        const block = document.getElementById(`block${blockNum}`);
        const content = document.getElementById(`block${blockNum}Content`);
        const statusSpan = document.getElementById(`block${blockNum}Status`);

        if (block) block.setAttribute('data-status', 'complete');
        if (content) content.classList.add('collapsed');
        if (statusSpan) statusSpan.textContent = '✓ Abgeschlossen';

        // Nächsten Block freischalten
        const nextBlock = blockNum + 1;
        if (nextBlock <= 3) {
            this.activateBlock(nextBlock);

            // Block-Content sichtbar machen
            const nextContent = document.getElementById(`block${nextBlock}Content`);
            if (nextContent) nextContent.classList.remove('collapsed');
        }

        // Event emittieren
        StateEvents.dispatchEvent(new CustomEvent('blockComplete', {
            detail: { blockNum }
        }));

        return true;
    },

    /**
     * Block-Name aus Nummer
     * @param {number} num - Block-Nummer
     * @returns {string} Block-Name
     */
    getBlockName(num) {
        const names = { 1: 'auftraggeber', 2: 'objekterfassung', 3: 'angebot' };
        return names[num] || '';
    },

    /**
     * Callback wenn Block abgeschlossen
     * @param {number} blockNum - Block-Nummer
     */
    onBlockComplete(blockNum) {
        // Block-spezifische Aktionen
        switch (blockNum) {
            case 1:
                // Auftraggeber abgeschlossen - Objekterfassung vorbereiten
                console.info('👤 Auftraggeber erfasst');
                break;

            case 2:
                // Objekterfassung abgeschlossen - Positionen generieren
                console.info('🏠 Objekte erfasst');
                if (typeof generatePositionsFromImmobilien === 'function') {
                    generatePositionsFromImmobilien();
                }
                if (typeof generateObjektZusammenfassung === 'function') {
                    generateObjektZusammenfassung();
                }
                if (typeof generateAngebotsnummer === 'function') {
                    generateAngebotsnummer();
                }
                break;

            case 3:
                // Angebot erstellt
                console.info('📄 Angebot vollständig');
                break;
        }

        // Preview aktualisieren
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    },

    // ============================================
    // BLOCK DATA ACCESS
    // ============================================

    /**
     * Block 1 Daten synchronisieren mit globalem State
     */
    initBlock1() {
        // Formulare zu State verknüpfen
        const fields = {
            'companyName': 'company.name',
            'companyStrasse': 'company.strasse',
            'companyHausnummer': 'company.hausnummer',
            'companyPlz': 'company.plz',
            'companyOrt': 'company.ort',
            'contactSalutation': 'contact.anrede',
            'contactFirstname': 'contact.vorname',
            'contactLastname': 'contact.nachname',
            'contactEmail': 'contact.email',
            'contactPhone': 'contact.telefon'
        };

        // Bidirektionale Bindung einrichten
        Object.entries(fields).forEach(([fieldId, statePath]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                // State → Field
                const currentValue = getState(statePath);
                if (currentValue) field.value = currentValue;

                // Field → State
                field.addEventListener('input', (e) => {
                    updateState(statePath, e.target.value);
                });
            }
        });
    },

    getBlock1Data() {
        return {
            company: AppState.company,
            contact: AppState.contact,
            owner: AppState.owner,
            rechnungsempfaenger: AppState.rechnungsempfaenger
        };
    },

    initBlock2() {
        // Immobilien aus State laden
        if (AppState.immobilien.length === 0 && typeof createEmptyImmobilie === 'function') {
            AppState.immobilien = [createEmptyImmobilie(1)];
        }

        if (typeof renderImmobilien === 'function') {
            renderImmobilien();
        }
    },

    getBlock2Data() {
        return {
            immobilien: AppState.immobilien
        };
    },

    initBlock3() {
        if (typeof renderPositionenListe === 'function') {
            renderPositionenListe();
        }
    },

    getBlock3Data() {
        return {
            angebot: AppState.angebot,
            positions: AppState.positions,
            rabatte: AppState.rabatte,
            textbausteine: AppState.textbausteine
        };
    },

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Alle Blöcke zurücksetzen
     */
    reset() {
        // State zurücksetzen
        resetState('company');
        resetState('contact');
        resetState('immobilien');
        resetState('positions');

        // Workflow zurücksetzen
        updateState('workflow.currentBlock', 1);
        updateState('workflow.blocks.1', { status: 'active', completed: false });
        updateState('workflow.blocks.2', { status: 'locked', completed: false });
        updateState('workflow.blocks.3', { status: 'locked', completed: false });

        // UI zurücksetzen
        [1, 2, 3].forEach(num => {
            const block = document.getElementById(`block${num}`);
            const content = document.getElementById(`block${num}Content`);
            const status = document.getElementById(`block${num}Status`);

            if (block) block.setAttribute('data-status', num === 1 ? 'active' : 'locked');
            if (content) content.classList.toggle('collapsed', num !== 1);
            if (status) status.textContent = num === 1 ? '⏳ In Bearbeitung' : '🔒 Gesperrt';
        });

        console.info('🔄 Orchestrator: Reset durchgeführt');
    },

    /**
     * Debug-Info ausgeben
     */
    debug() {
        console.group('🔍 Orchestrator Debug');
        console.log('Current Block:', AppState.workflow.currentBlock);
        console.log('Block Status:', AppState.workflow.blocks);
        console.log('Company:', AppState.company);
        console.log('Immobilien:', AppState.immobilien.length);
        console.log('Positions:', AppState.positions.length);
        console.groupEnd();
    }
};

// Export für global access
if (typeof window !== 'undefined') {
    window.Orchestrator = Orchestrator;
    window.BlockRegistry = BlockRegistry;
    // Legacy/HTML Support
    window.completeBlock = (num) => Orchestrator.completeBlock(num);
}
