/**
 * Block 3 UI: Angebot
 * Verwaltet Positionslisten, Preise und Textbausteine
 */
const AngebotUI = {

    init() {
        console.info('📄 Angebot UI initialisiert');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Textbausteine
        const einleitungSelect = document.getElementById('einleitungstext');
        const schlussSelect = document.getElementById('schlusstext');
        
        if (einleitungSelect) einleitungSelect.addEventListener('change', () => this.updateTextbaustein('einleitung'));
        if (schlussSelect) schlussSelect.addEventListener('change', () => this.updateTextbaustein('schluss'));

        // Frühbucher Rabatt
        const fruehbucherCheck = document.getElementById('fruehbucherAktiv');
        const fruehbucherProzent = document.getElementById('fruehbucherProzent');
        
        if (fruehbucherCheck) fruehbucherCheck.addEventListener('change', () => this.renderPositions());
        if (fruehbucherProzent) fruehbucherProzent.addEventListener('change', () => this.renderPositions());
    },

    /**
     * Rendert die Positionsliste und kalkuliert Summen
     * Ersetzt renderPositionenListe aus ui.js
     */
    renderPositions() {
        const container = document.getElementById('positionenListe');
        if (!container) return;

        let html = '';
        let nettoSum = 0;

        positions.forEach((pos) => {
            const summe = pos.menge * pos.einzelpreis;
            nettoSum += summe;

            if (pos.istEckdatenPosition) {
                // Eckdaten (Info-Position)
                html += `
                <div class="position-row eckdaten" style="background:#f0fdf4;border-left:3px solid #7AB800;padding:12px;margin-bottom:8px;border-radius:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <strong style="color:#7AB800;">Pos ${pos.pos}</strong>
                            <span style="margin-left:8px;font-size:12px;color:#666;">${pos.bezeichnung}</span>
                        </div>
                        ${pos.immoNummer > 0 ? `<span style="font-size:10px;background:#7AB800;color:white;padding:2px 6px;border-radius:8px;">Immobilie ${pos.immoNummer}</span>` : ''}
                    </div>
                    <div style="font-size:11px;color:#444;margin-top:8px;white-space:pre-line;">${pos.beschreibung}</div>
                </div>`;
            } else {
                // Kalkulations-Position
                const preisAnzeige = pos.einzelpreis === 0 ? '<span style="color:#f59e0b;font-weight:600;">Auf Anfrage</span>' :
                    `${pos.einzelpreis.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`;
                const summeAnzeige = pos.einzelpreis === 0 ? '-' :
                    `${summe.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`;

                html += `
                <div class="position-row" style="display:grid;grid-template-columns:60px 1fr 80px 80px 100px;gap:8px;padding:10px;border-bottom:1px solid #eee;font-size:13px;${pos.bedarfsposition ? 'background:#fef3c7;' : ''}">
                    <div style="font-weight:600;color:#7AB800;">Pos ${pos.pos}</div>
                    <div>
                        <strong>${pos.bezeichnung}</strong>
                        ${pos.beschreibung ? `<div style="font-size:11px;color:#666;margin-top:2px;">${pos.beschreibung.substring(0, 100)}${pos.beschreibung.length > 100 ? '...' : ''}</div>` : ''}
                    </div>
                    <div style="text-align:right;">${pos.menge.toLocaleString('de-DE')} ${pos.einheit}</div>
                    <div style="text-align:right;">${preisAnzeige}</div>
                    <div style="text-align:right;font-weight:600;">${summeAnzeige}</div>
                </div>`;
            }
        });

        container.innerHTML = html || '<div style="text-align:center;color:#666;padding:20px;">Keine Positionen - erst Objekterfassung abschließen</div>';

        this.calculateTotals(nettoSum);
    },

    calculateTotals(nettoSum) {
        // Rabatt Logik
        const fruehbucherAktiv = document.getElementById('fruehbucherAktiv')?.checked;
        const fruehbucherProzent = parseFloat(document.getElementById('fruehbucherProzent')?.value || 0);
        const rabatt = fruehbucherAktiv ? nettoSum * (fruehbucherProzent / 100) : 0;
        
        const nettoNachRabatt = nettoSum - rabatt;
        const mwst = nettoNachRabatt * 0.19;
        const brutto = nettoNachRabatt + mwst;

        // update DOM elements
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
        };

        setVal('posNettoSum', nettoNachRabatt);
        setVal('posMwst', mwst);
        setVal('dealAmount', brutto);
        setVal('fruehbucherErsparnis', rabatt);
    },

    updateTextbaustein(type) {
        // Delegate to global function for now (or move logic here entirely)
        if (typeof updateTextbaustein === 'function') {
            updateTextbaustein(type);
        }
    }
};

// Global export
if (typeof window !== 'undefined') {
    window.AngebotUI = AngebotUI;
    window.renderPositionenListe = () => AngebotUI.renderPositions();
}
