/**
 * Block 1 UI: Auftraggeber
 * Verwaltet UI-Updates und Events für den Auftraggeber-Block
 */
const AuftraggeberUI = {

    init() {
        console.info('👤 Auftraggeber UI initialisiert');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Formular-Felder für Live-Validation überwachen
        const fields = [
            'companyName', 'contactFirstname', 'contactLastname', 'contactEmail', 'hubspotOwnerId'
        ];

        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.validate());
                el.addEventListener('change', () => this.validate());
            }
        });
    },

    /**
     * Validiert Block 1 und aktualisiert den "Weiter"-Button
     * Ersetzt die alte checkBlock1Complete Funktion
     */
    validate() {
        const companyName = document.getElementById('companyName')?.value.trim();
        const contactFirstname = document.getElementById('contactFirstname')?.value.trim();
        const contactLastname = document.getElementById('contactLastname')?.value.trim();
        const contactEmail = document.getElementById('contactEmail')?.value.trim();
        const owner = document.getElementById('hubspotOwnerId')?.value;

        const isComplete = !!(companyName && contactFirstname && contactLastname && contactEmail && owner);

        const btn = document.getElementById('block1CompleteBtn');
        if (btn) {
            btn.disabled = !isComplete;
        }

        return isComplete;
    }
};

// Global export und Init
if (typeof window !== 'undefined') {
    window.AuftraggeberUI = AuftraggeberUI;
    // Legacy-Support falls noch nötig
    window.checkBlock1Complete = () => AuftraggeberUI.validate();
}
