// ============================================
// FASSADENFIX - BLOCK 1: AUFTRAGGEBER
// Modul für Unternehmens- und Kontaktdaten
// ============================================

/**
 * Auftraggeber Module
 * Verwaltet Block 1: Firma, Kontakt, Zuständiger Mitarbeiter
 */
const AuftraggeberModule = {
    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Modul initialisieren
     */
    init() {
        this.bindFormFields();
        this.setupValidation();
        this.loadHubSpotOwners();

        console.info('📦 Block 1 (Auftraggeber) initialisiert');
    },

    /**
     * Formularfelder mit State verbinden
     */
    bindFormFields() {
        const fieldMappings = {
            // Unternehmen
            'companyName': 'company.name',
            'companyStrasse': 'company.strasse',
            'companyHausnummer': 'company.hausnummer',
            'companyPlz': 'company.plz',
            'companyOrt': 'company.ort',
            'kundennummer': 'company.hubspotId',

            // Kontakt
            'contactSalutation': 'contact.anrede',
            'contactFirstname': 'contact.vorname',
            'contactLastname': 'contact.nachname',
            'contactEmail': 'contact.email',
            'contactPhone': 'contact.telefon',

            // Abweichender Rechnungsempfänger
            'reFirma': 'rechnungsempfaenger.firma',
            'reAnsprechpartner': 'rechnungsempfaenger.ansprechpartner',
            'reStrasse': 'rechnungsempfaenger.strasse',
            'reHausnummer': 'rechnungsempfaenger.hausnummer',
            'rePlz': 'rechnungsempfaenger.plz',
            'reOrt': 'rechnungsempfaenger.ort'
        };

        Object.entries(fieldMappings).forEach(([fieldId, statePath]) => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            // Initial value from state
            const value = getState(statePath);
            if (value) field.value = value;

            // Bidirectional binding
            field.addEventListener('input', (e) => {
                updateState(statePath, e.target.value);
                this.validateBlock();
            });

            field.addEventListener('change', (e) => {
                updateState(statePath, e.target.value);
                this.validateBlock();
            });
        });
    },

    /**
     * Validierung einrichten
     */
    setupValidation() {
        // Auf relevante State-Änderungen reagieren
        ['company.name', 'contact.vorname', 'contact.nachname', 'contact.email', 'owner.hubspotId'].forEach(path => {
            onStateChange(path, () => this.validateBlock());
        });
    },

    // ============================================
    // VALIDATION
    // ============================================

    /**
     * Block-Validierung
     * @returns {boolean} Ob Block vollständig ist
     */
    validateBlock() {
        const company = getState('company');
        const contact = getState('contact');
        const owner = getState('owner');

        const isComplete =
            company?.name?.trim() &&
            contact?.vorname?.trim() &&
            contact?.nachname?.trim() &&
            contact?.email?.trim() &&
            (owner?.hubspotId || document.getElementById('hubspotOwnerId')?.value);

        // Button aktualisieren
        const btn = document.getElementById('block1CompleteBtn');
        if (btn) {
            btn.disabled = !isComplete;
        }

        return isComplete;
    },

    /**
     * Block abschließen
     */
    complete() {
        if (!this.validateBlock()) {
            console.warn('Block 1 nicht vollständig');
            return false;
        }

        // Daten aus Formularen synchronisieren
        this.syncFormToState();

        // Orchestrator informieren
        if (Orchestrator) {
            Orchestrator.completeBlock(1);
        } else {
            completeBlock(1); // Legacy fallback
        }

        return true;
    },

    // ============================================
    // DATA MANAGEMENT
    // ============================================

    /**
     * Formulardaten → State
     */
    syncFormToState() {
        const getValue = (id) => document.getElementById(id)?.value || '';

        updateStateMultiple({
            'company.name': getValue('companyName'),
            'company.strasse': getValue('companyStrasse'),
            'company.hausnummer': getValue('companyHausnummer'),
            'company.plz': getValue('companyPlz'),
            'company.ort': getValue('companyOrt'),
            'company.hubspotId': getValue('hubspotCompanyId'),

            'contact.vorname': getValue('contactFirstname'),
            'contact.nachname': getValue('contactLastname'),
            'contact.anrede': getValue('contactSalutation'),
            'contact.email': getValue('contactEmail'),
            'contact.telefon': getValue('contactPhone'),
            'contact.hubspotId': getValue('hubspotContactId'),

            'owner.hubspotId': getValue('hubspotOwnerId')
        });
    },

    /**
     * State → Formulare
     */
    syncStateToForm() {
        const setValue = (id, value) => {
            const field = document.getElementById(id);
            if (field) field.value = value || '';
        };

        const company = getState('company') || {};
        const contact = getState('contact') || {};

        setValue('companyName', company.name);
        setValue('companyStrasse', company.strasse);
        setValue('companyHausnummer', company.hausnummer);
        setValue('companyPlz', company.plz);
        setValue('companyOrt', company.ort);

        setValue('contactFirstname', contact.vorname);
        setValue('contactLastname', contact.nachname);
        setValue('contactSalutation', contact.anrede);
        setValue('contactEmail', contact.email);
        setValue('contactPhone', contact.telefon);
    },

    /**
     * Daten aus HubSpot-Auswahl übernehmen
     * @param {object} companyData - Unternehmensdaten
     */
    setCompanyFromHubSpot(companyData) {
        if (!companyData) return;

        updateStateMultiple({
            'company.hubspotId': companyData.id,
            'company.name': companyData.name,
            'company.strasse': companyData.strasse || '',
            'company.plz': companyData.plz || '',
            'company.ort': companyData.ort || '',
            'company.verified': true
        });

        this.syncStateToForm();
        this.validateBlock();
    },

    /**
     * Kontakt aus HubSpot übernehmen
     * @param {object} contactData - Kontaktdaten
     */
    setContactFromHubSpot(contactData) {
        if (!contactData) return;

        updateStateMultiple({
            'contact.hubspotId': contactData.id,
            'contact.vorname': contactData.firstname,
            'contact.nachname': contactData.lastname,
            'contact.email': contactData.email,
            'contact.telefon': contactData.phone || ''
        });

        this.syncStateToForm();
        this.validateBlock();
    },

    // ============================================
    // HUBSPOT INTEGRATION
    // ============================================

    /**
     * HubSpot Owner-Dropdown laden
     */
    async loadHubSpotOwners() {
        try {
            if (typeof loadHubSpotOwners === 'function') {
                await loadHubSpotOwners();
            }
        } catch (e) {
            console.warn('HubSpot Owners nicht geladen:', e);
        }
    },

    /**
     * Daten für Block-Export
     * @returns {object} Block-Daten
     */
    getData() {
        return {
            company: getState('company'),
            contact: getState('contact'),
            owner: getState('owner'),
            rechnungsempfaenger: getState('rechnungsempfaenger')
        };
    },

    /**
     * Block zurücksetzen
     */
    reset() {
        resetState('company');
        resetState('contact');
        this.syncStateToForm();
    }
};

// Register with BlockRegistry
if (typeof BlockRegistry !== 'undefined') {
    BlockRegistry.auftraggeber = AuftraggeberModule;
}

// Global export
if (typeof window !== 'undefined') {
    window.AuftraggeberModule = AuftraggeberModule;
}
