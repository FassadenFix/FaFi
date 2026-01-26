// ============================================
// FASSADENFIX ANGEBOTSGENERATOR - UI.JS
// UI-Rendering und Event-Handler
// ============================================

// ============================================
// WORKFLOW BLOCK CONTROLS
// ============================================

// Toggle Block Collapse
function toggleBlock(blockNum) {
    const block = document.getElementById(`block${blockNum}`);
    const content = document.getElementById(`block${blockNum}Content`);
    const status = block.getAttribute('data-status');

    // Don't toggle locked blocks
    if (status === 'locked') return;

    content.classList.toggle('collapsed');
}

// Complete a block and unlock next
function completeBlock(blockNum) {
    const block = document.getElementById(`block${blockNum}`);
    const content = document.getElementById(`block${blockNum}Content`);
    const statusSpan = document.getElementById(`block${blockNum}Status`);

    // Mark as complete
    block.setAttribute('data-status', 'complete');
    statusSpan.textContent = '✓ Abgeschlossen';
    content.classList.add('collapsed');

    // Unlock next block
    const nextBlockNum = blockNum + 1;
    const nextBlock = document.getElementById(`block${nextBlockNum}`);
    if (nextBlock) {
        nextBlock.setAttribute('data-status', 'active');
        const nextStatus = document.getElementById(`block${nextBlockNum}Status`);
        nextStatus.textContent = '⏳ In Bearbeitung';
        document.getElementById(`block${nextBlockNum}Content`).style.display = 'block';
        document.getElementById(`block${nextBlockNum}Content`).classList.remove('collapsed');

        // Show footer for block 2
        if (nextBlockNum === 2) {
            document.getElementById('block2Footer').style.display = 'block';
        }

        // Generate summary for block 3
        if (nextBlockNum === 3) {
            generateObjektZusammenfassung();
            generateAngebotsnummer();
            generatePositionsFromImmobilien();
            setTimeout(() => renderPositionenListe(), 100);
        }
    }

    // Regenerate positions
    if (typeof generatePositionsFromImmobilien === 'function') {
        generatePositionsFromImmobilien();
    }
    updatePreview();
}

// Check if Block 1 is complete
function checkBlock1Complete() {
    const companyName = document.getElementById('companyName').value.trim();
    const contactFirstname = document.getElementById('contactFirstname').value.trim();
    const contactLastname = document.getElementById('contactLastname').value.trim();
    const contactEmail = document.getElementById('contactEmail').value.trim();
    const owner = document.getElementById('hubspotOwnerId').value;

    const isComplete = companyName && contactFirstname && contactLastname && contactEmail && owner;

    const btn = document.getElementById('block1CompleteBtn');
    if (btn) {
        btn.disabled = !isComplete;
    }
}

// Check if Block 2 is complete (ALL sides must be decided - not null)
function checkBlock2Complete() {
    const hasImmobilien = immobilien.length > 0;

    // Check if ALL sides of ALL immobilien have a decision (not null)
    const allSeitenEntschieden = immobilien.every(immo =>
        Object.values(immo.seiten).every(seite => seite.zuReinigen !== null)
    );

    // Must have at least one side marked for cleaning
    const hasAtLeastOneSide = immobilien.some(immo =>
        Object.values(immo.seiten).some(seite => seite.zuReinigen === true)
    );

    // Count undecided sides for user feedback
    let undecidedCount = 0;
    immobilien.forEach(immo => {
        Object.values(immo.seiten).forEach(seite => {
            if (seite.zuReinigen === null) undecidedCount++;
        });
    });

    const btn = document.getElementById('block2CompleteBtn');
    if (btn) {
        btn.disabled = !(hasImmobilien && allSeitenEntschieden && hasAtLeastOneSide);

        // Update button text based on state
        if (undecidedCount > 0) {
            btn.textContent = `⚠️ Noch ${undecidedCount} Seite(n) ohne Entscheidung`;
        } else if (!hasAtLeastOneSide) {
            btn.textContent = `⚠️ Mindestens 1 Seite zur Reinigung auswählen`;
        } else {
            btn.textContent = `✓ Objekterfassung abschließen → weiter zu Angebotserstellung`;
        }
    }

    // Update block info
    updateBlock2Info();
}

// Update Block 2 header info
function updateBlock2Info() {
    const totalImmo = immobilien.length;
    let totalQm = 0;

    immobilien.forEach(immo => {
        Object.values(immo.seiten).forEach(seite => {
            if (seite.zuReinigen === true) {
                totalQm += seite.flaeche || 0;
            }
        });
    });

    const info = document.getElementById('block2Info');
    if (info) {
        info.textContent = `${totalImmo} Immobilie(n) • ${totalQm.toLocaleString('de-DE')} m²`;
    }

    const immoCount = document.getElementById('immoCount');
    const totalQmEl = document.getElementById('totalQm');
    if (immoCount) immoCount.textContent = totalImmo;
    if (totalQmEl) totalQmEl.textContent = totalQm.toLocaleString('de-DE');
}

// Generate Objekt-Zusammenfassung for Block 3
function generateObjektZusammenfassung() {
    const container = document.getElementById('objektZusammenfassung');
    if (!container) return;

    let totalQm = 0;
    let html = '';

    immobilien.forEach((immo, idx) => {
        const immoQm = Object.values(immo.seiten)
            .filter(s => s.zuReinigen === true)
            .reduce((sum, s) => sum + (s.flaeche || 0), 0);
        totalQm += immoQm;

        const adresse = immo.adresse.strasse ?
            `${immo.adresse.strasse} ${immo.adresse.hausnummer}, ${immo.adresse.plz} ${immo.adresse.ort}` :
            'Keine Adresse';

        html += `<div class="objekt-summary-row">
            <span>Immobilie ${idx + 1}: ${adresse}</span>
            <span>${immoQm.toLocaleString('de-DE')} m²</span>
        </div>`;
    });

    html += `<div class="objekt-summary-row">
        <span>GESAMT</span>
        <span>${totalQm.toLocaleString('de-DE')} m²</span>
    </div>`;

    container.innerHTML = html;
}

// Generate dynamic Angebotsnummer
function generateAngebotsnummer() {
    const year = new Date().getFullYear();
    const kundenNr = document.getElementById('kundennummer').value || '000';
    const laufNr = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');

    const angNr = `${year}-${kundenNr}-${laufNr}`;
    document.getElementById('angebotsnummer').value = angNr;

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('angebotsdatum').value = today;

    // Generate Deal Name
    generateDealName();

    // Initialize Textbausteine
    updateTextbaustein('einleitung');
    updateTextbaustein('schluss');
}

// Textbausteine with macro substitution
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

// Update Textbaustein with macros
function updateTextbaustein(type) {
    const selectId = type === 'einleitung' ? 'einleitungstext' : 'schlusstext';
    const previewId = type === 'einleitung' ? 'einleitungstextPreview' : 'schlusstextPreview';

    const select = document.getElementById(selectId);
    const preview = document.getElementById(previewId);
    if (!select || !preview) return;

    const template = TEXTBAUSTEINE[type][select.value] || '';

    // Macro substitution
    const companyName = document.getElementById('companyName')?.value || '{Firma}';
    const contactFirst = document.getElementById('contactFirstname')?.value || '';
    const contactLast = document.getElementById('contactLastname')?.value || '';
    const ansprechpartner = contactFirst && contactLast ? `${contactFirst} ${contactLast}` : '{Ansprechpartner}';

    let text = template
        .replace(/{firma}/gi, companyName)
        .replace(/{ansprechpartner}/gi, ansprechpartner);

    preview.value = text;
}

// Generate HubSpot Deal Name
function generateDealName() {
    const companyName = document.getElementById('companyName')?.value || 'Unbekannt';
    const angNr = document.getElementById('angebotsnummer')?.value || 'NEU';

    // Get total sqm
    let totalQm = 0;
    immobilien.forEach(immo => {
        Object.values(immo.seiten).forEach(seite => {
            if (seite.zuReinigen === true) {
                totalQm += seite.flaeche || 0;
            }
        });
    });

    const dealName = `${companyName} - ${angNr} (${totalQm.toLocaleString('de-DE')} m²)`;

    const dealNameEl = document.getElementById('dealName');
    if (dealNameEl) dealNameEl.value = dealName;
}

// Create HubSpot Deal via Backend API
async function createHubSpotDeal() {
    const statusEl = document.getElementById('hubspotDealStatus');
    if (statusEl) statusEl.innerHTML = '<span style="color:#f59e0b;">⏳ Wird erstellt...</span>';

    try {
        // Collect data
        const dealName = document.getElementById('dealName')?.value || 'Neues Angebot';
        const angebotsnummer = document.getElementById('angebotsnummer')?.value;
        const dealStage = document.getElementById('dealStage')?.value || 'qualifiedtobuy';
        const ownerId = document.getElementById('hubspotOwnerId')?.value;

        // Calculate total amount
        let totalAmount = 0;
        positions.forEach(pos => {
            if (!pos.bedarfsposition && pos.einzelpreis > 0) {
                totalAmount += pos.menge * pos.einzelpreis;
            }
        });

        // Apply discount if active
        const fruehbucherAktiv = document.getElementById('fruehbucherAktiv')?.checked;
        const fruehbucherProzent = parseFloat(document.getElementById('fruehbucherProzent')?.value || 0);
        if (fruehbucherAktiv && fruehbucherProzent > 0) {
            totalAmount = totalAmount * (1 - fruehbucherProzent / 100);
        }

        // Get company/contact IDs from selected data
        const companyId = selectedCompany?.id;
        const contactId = selectedContact?.id;

        const API_BASE = window.API_BASE || 'http://localhost:3001';

        const response = await fetch(`${API_BASE}/api/hubspot/deals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dealName,
                amount: totalAmount,
                stage: dealStage,
                ownerId,
                companyId,
                contactId,
                angebotsnummer,
                closeDate: document.getElementById('angebotsdatum')?.value
            })
        });

        const result = await response.json();

        if (result.success) {
            const dealId = result.deal?.id;
            document.getElementById('hubspotDealId').value = dealId || '';

            if (statusEl) {
                if (result.mock) {
                    statusEl.innerHTML = '<span style="color:#f59e0b;">⚠️ Mock-Deal erstellt (Backend offline)</span>';
                } else {
                    statusEl.innerHTML = `<span style="color:#7AB800;">✓ Deal #${dealId} erstellt</span>`;
                }
            }
            return result.deal;
        } else {
            throw new Error(result.error || 'Unbekannter Fehler');
        }

    } catch (error) {
        console.error('HubSpot Deal Create Error:', error);
        if (statusEl) {
            statusEl.innerHTML = `<span style="color:#ef4444;">❌ Fehler: ${error.message}</span>`;
        }
        return null;
    }
}

// Load price data from JSON
let priceData = null;

async function loadPriceData() {
    try {
        const response = await fetch('data/preisstufen.json');
        priceData = await response.json();

        // Update Rabatt dropdown if needed
        updateRabattDropdownFromData();
        return priceData;
    } catch (e) {
        console.error('Fehler beim Laden der Preisdaten:', e);
        return null;
    }
}

// Update Rabatt dropdown from loaded price data
function updateRabattDropdownFromData() {
    if (!priceData?.preisstufen?.rabatte?.aktionen?.fruehbucher_2026) return;

    const staffelung = priceData.preisstufen.rabatte.aktionen.fruehbucher_2026.staffelung;
    const select = document.getElementById('fruehbucherProzent');
    if (!select) return;

    const today = new Date().toISOString().split('T')[0];

    select.innerHTML = '';
    staffelung.forEach(stufe => {
        const isExpired = stufe.bis < today;
        const option = document.createElement('option');
        option.value = stufe.prozent;
        option.textContent = `${stufe.prozent}% Rabatt (bis ${stufe.bis})${isExpired ? ' — ABGELAUFEN' : ''}`;
        option.disabled = isExpired;
        if (!isExpired && select.options.length === 0) option.selected = true;
        select.appendChild(option);
    });
}

// Render positions list for Block 3
function renderPositionenListe() {
    const container = document.getElementById('positionenListe');
    if (!container) return;

    let html = '';
    let nettoSum = 0;

    positions.forEach((pos, idx) => {
        const summe = pos.menge * pos.einzelpreis;
        nettoSum += summe;

        if (pos.istEckdatenPosition) {
            // Eckdaten-Positionen ohne Preis
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
            // Normale Positionen mit Preis
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

    // Rabatt berechnen
    const fruehbucherAktiv = document.getElementById('fruehbucherAktiv')?.checked;
    const fruehbucherProzent = parseFloat(document.getElementById('fruehbucherProzent')?.value || 0);
    const rabatt = fruehbucherAktiv ? nettoSum * (fruehbucherProzent / 100) : 0;
    const nettoNachRabatt = nettoSum - rabatt;
    const mwst = nettoNachRabatt * 0.19;
    const brutto = nettoNachRabatt + mwst;

    // Summen aktualisieren
    const nettoEl = document.getElementById('posNettoSum');
    const mwstEl = document.getElementById('posMwst');
    const bruttoEl = document.getElementById('dealAmount');
    const sparEl = document.getElementById('fruehbucherErsparnis');

    if (nettoEl) nettoEl.textContent = nettoNachRabatt.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
    if (mwstEl) mwstEl.textContent = mwst.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
    if (bruttoEl) bruttoEl.textContent = brutto.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
    if (sparEl) sparEl.textContent = rabatt.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
}

// ============================================
// IMMOBILIEN RENDERING
// ============================================
function renderImmobilien() {
    const container = document.getElementById('immobilienContainer');

    container.innerHTML = immobilien.map((immo, immoIdx) => {
        const aktiveSeitenCount = Object.values(immo.seiten).filter(s => s.zuReinigen === true).length;
        const gesamtFlaeche = Object.values(immo.seiten).filter(s => s.zuReinigen === true).reduce((sum, s) => sum + (s.flaeche || 0), 0);

        return `
        <div class="immobilie-card">
            <div class="immobilie-header">
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <span class="immobilie-nummer">Immobilie ${immo.nummer}</span>
                    <span style="font-size:12px;color:#666;font-weight:normal;">
                        ${immo.adresse.strasse ? `📍 ${immo.adresse.strasse} ${immo.adresse.hausnummer}, ${immo.adresse.plz} ${immo.adresse.ort}` : '📍 Adresse noch nicht erfasst'}
                    </span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:12px;padding:4px 10px;background:${aktiveSeitenCount > 0 ? '#7AB800' : '#e5e7eb'};color:${aktiveSeitenCount > 0 ? 'white' : '#666'};border-radius:12px;font-weight:600;">
                        ${aktiveSeitenCount}/4 Seiten • ${gesamtFlaeche.toLocaleString('de-DE')} m²
                    </span>
                    ${immobilien.length > 1 ? `<button class="position-remove" onclick="removeImmobilie(${immoIdx})">×</button>` : ''}
                </div>
            </div>
            <div class="immobilie-body">
                <!-- ADRESSE (PROMINENT) -->
                <div class="address-section-prominent">
                    <div class="address-section-header">
                        <span>📍 Objektadresse</span>
                        ${immo.adresse.verified ? '<span class="address-verified-badge">✓ Verifiziert</span>' : '<span class="address-unverified-badge">Nicht verifiziert</span>'}
                    </div>
                    <div class="form-group" style="margin-bottom:12px;">
                        <label>Adresse suchen <span class="required">*</span></label>
                        <input type="text" 
                            id="addressAutocomplete-${immoIdx}" 
                            class="address-autocomplete-input"
                            placeholder="Straße, PLZ Ort eingeben..." 
                            value="${immo.adresse.strasse ? `${immo.adresse.strasse} ${immo.adresse.hausnummer}, ${immo.adresse.plz} ${immo.adresse.ort}`.trim() : ''}"
                            onfocus="initAddressAutocomplete(${immoIdx})"
                            onchange="handleManualAddressInput(${immoIdx}, this.value)">
                    </div>
                    <details class="address-details-manual">
                        <summary>Manuelle Eingabe / Details bearbeiten</summary>
                        <div style="padding-top:10px;">
                            <div class="form-row">
                                <div class="form-group" style="flex:2;">
                                    <label>Straße</label>
                                    <input type="text" value="${immo.adresse.strasse}" onchange="updateImmobilieAdresse(${immoIdx},'strasse',this.value)">
                                </div>
                                <div class="form-group" style="flex:1;">
                                    <label>Hausnummer(n)</label>
                                    <input type="text" value="${immo.adresse.hausnummer}" placeholder="z.B. 10-12" onchange="updateImmobilieAdresse(${immoIdx},'hausnummer',this.value)">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group" style="max-width:100px;">
                                    <label>PLZ</label>
                                    <input type="text" value="${immo.adresse.plz}" onchange="updateImmobilieAdresse(${immoIdx},'plz',this.value)">
                                </div>
                                <div class="form-group">
                                    <label>Ort</label>
                                    <input type="text" value="${immo.adresse.ort}" onchange="updateImmobilieAdresse(${immoIdx},'ort',this.value)">
                                </div>
                            </div>
                        </div>
                </div>


                <!-- NEU: KOPFDATEN (Objektaufnahme) -->
                <div style="margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid var(--ff-border);background:#f0fdf4;border-radius:8px;padding:12px;">
                    <div style="font-size:11px;font-weight:600;color:var(--ff-green);text-transform:uppercase;margin-bottom:10px;">📝 Objektaufnahme</div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label>Datum Objektaufnahme</label>
                            <input type="date" value="${immo.datumObjektaufnahme || ''}" onchange="updateImmobilieKopfdaten(${immoIdx},'datumObjektaufnahme',this.value)">
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>FassadenFix Mitarbeiter</label>
                            <select onchange="updateImmobilieKopfdaten(${immoIdx},'ffMitarbeiter',this.value)">
                                <option value="">-- Bitte wählen --</option>
                                ${Object.entries(hubspotOwners).map(([id, owner]) =>
            `<option value="${id}" ${immo.ffMitarbeiter === id ? 'selected' : ''}>${owner.name}</option>`
        ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <!-- AG-Mitarbeiter (optional) -->
                    <details style="margin-top:10px;">
                        <summary style="cursor:pointer;font-size:12px;color:var(--ff-gray);">+ Anwesender AG-Mitarbeiter (optional)</summary>
                        <div style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid var(--ff-border);">
                            <div class="form-row">
                                <div class="form-group" style="flex:1;">
                                    <label>Name</label>
                                    <input type="text" value="${immo.agMitarbeiter?.name || ''}" placeholder="z.B. Max Mustermann" onchange="updateAGMitarbeiter(${immoIdx},'name',this.value)">
                                </div>
                                <div class="form-group" style="flex:1;">
                                    <label>Position/Funktion</label>
                                    <input type="text" value="${immo.agMitarbeiter?.position || ''}" placeholder="z.B. Hausmeister" onchange="updateAGMitarbeiter(${immoIdx},'position',this.value)">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group" style="flex:1;">
                                    <label>E-Mail</label>
                                    <input type="email" value="${immo.agMitarbeiter?.email || ''}" placeholder="email@firma.de" onchange="updateAGMitarbeiter(${immoIdx},'email',this.value)">
                                </div>
                                <div class="form-group" style="flex:1;">
                                    <label>Telefon</label>
                                    <input type="tel" value="${immo.agMitarbeiter?.telefon || ''}" placeholder="+49..." onchange="updateAGMitarbeiter(${immoIdx},'telefon',this.value)">
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
                
                <!-- ALLE SEITEN -->
                <div style="margin-bottom:15px;">
                    <label class="checkbox-label" style="font-weight:600;font-size:13px;">
                        <input type="checkbox" ${Object.values(immo.seiten).every(s => s.zuReinigen === true) ? 'checked' : ''} onchange="toggleAlleSeiten(${immoIdx},this.checked)">
                        <span style="color:var(--ff-green);">✓ Alle 4 Seiten zur Reinigung auswählen</span>
                    </label>
                </div>
                
                <!-- 4 SEITEN -->
                <div class="seiten-container">
                    ${Object.entries(immo.seiten).map(([key, seite]) => renderSeite(immoIdx, key, seite)).join('')}
                </div>
                
                <!-- POSITIONEN FÜR DIESE IMMOBILIE -->
                <div style="margin-top:20px;padding-top:15px;border-top:2px solid var(--ff-green);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <div style="font-size:13px;font-weight:600;color:var(--ff-green);">
                            📋 Positionen für Immobilie ${immo.nummer}
                        </div>
                        <span style="font-size:11px;color:#666;">
                            ${positions.filter(p => p.immoNummer === immo.nummer).length} Positionen
                        </span>
                    </div>
                    
                    <!-- Position X.0.0 - Immobilien-Eckdaten (Zusammenfassung) -->
                    ${gesamtFlaeche > 0 ? `
                    <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);border-radius:8px;padding:12px;margin-bottom:10px;border:1px solid #7AB80033;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong style="font-size:14px;color:var(--ff-green);">Pos ${immo.nummer}.0.0</strong>
                                <span style="font-size:12px;color:#666;margin-left:8px;">Immobilien-Eckdaten</span>
                            </div>
                            <strong style="color:var(--ff-green);">${gesamtFlaeche.toLocaleString('de-DE')} m²</strong>
                        </div>
                        <div style="font-size:11px;color:#666;margin-top:6px;">
                            ${immo.adresse.strasse} ${immo.adresse.hausnummer}, ${immo.adresse.plz} ${immo.adresse.ort}<br>
                            ${Object.entries(immo.seiten).filter(([k, s]) => s.zuReinigen === true).map(([k, s]) =>
            SEITEN_TYPEN[k].label + ' (' + (s.flaeche || 0).toLocaleString('de-DE') + ' m²)'
        ).join(', ') || 'Keine Seiten ausgewählt'}
                        </div>
                    </div>
                    ` : `
                    <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center;font-size:12px;color:#92400e;">
                        ⚠️ Bitte mindestens eine Seite mit Fläche zur Reinigung auswählen
                    </div>
                    `}
                    
                    <!-- Einzelpositionen dieser Immobilie -->
                    <div id="immoPositions-${immo.nummer}">
                        ${renderPositionsForImmo(immo.nummer)}
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    // Immobilien-Counter aktualisieren
    const immoCountEl = document.getElementById('immoCount');
    if (immoCountEl) immoCountEl.textContent = immobilien.length;

    // Positions-Statistik aktualisieren
    updatePositionStats();
}

function renderSeite(immoIdx, seiteKey, seite) {
    const typ = SEITEN_TYPEN[seiteKey];
    const flaecheBerechnet = seite.breite && seite.hoehe ? Math.round(seite.breite * seite.hoehe) : seite.flaeche || 0;
    const zuReinigenStatus = seite.zuReinigen;
    const statusClass = zuReinigenStatus === true ? 'zu-reinigen-ja' : (zuReinigenStatus === false ? 'zu-reinigen-nein' : 'zu-reinigen-unentschieden');

    return `
    <div class="seite-card ${statusClass}" style="opacity: ${zuReinigenStatus === false ? '0.6' : '1'};">
        <div class="seite-header">
            <div class="seite-title">
                <span>${typ.icon} ${typ.label}</span>
                <span class="seite-flaeche" style="margin-left:10px;${flaecheBerechnet > 0 ? '' : 'opacity:0.5;'}">${flaecheBerechnet.toLocaleString('de-DE')} m²</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                ${zuReinigenStatus === true ? '<span style="background:#7AB800;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">✓ Im Angebot</span>' : ''}
                ${zuReinigenStatus === false ? '<span style="background:#ef4444;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">✗ Nicht im Angebot</span>' : ''}
                ${zuReinigenStatus === null ? '<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">⏳ Entscheidung offen</span>' : ''}
            </div>
        </div>
        <div class="seite-body expanded" id="seite-body-${immoIdx}-${seiteKey}">
            <!-- IMMER ALLE DETAILS ANZEIGEN -->
            ${renderSeiteDetails(immoIdx, seiteKey, seite, flaecheBerechnet)}
            
            <!-- SOLL GEREINIGT WERDEN? - AM ENDE JEDER SEITE -->
            <div style="margin-top:15px;padding:15px;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:8px;border:2px solid ${zuReinigenStatus === null ? '#f59e0b' : (zuReinigenStatus === true ? '#7AB800' : '#ef4444')};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="font-weight:700;font-size:14px;color:#1f2937;">Seite in das Angebot aufnehmen?</span>
                        ${zuReinigenStatus === null ? '<span style="margin-left:8px;font-size:11px;color:#f59e0b;">⚠️ Pflichtangabe</span>' : ''}
                    </div>
                    <div class="zu-reinigen-toggle" style="display:flex;gap:4px;background:#e5e7eb;border-radius:8px;padding:3px;">
                        <button type="button" class="toggle-btn ${zuReinigenStatus === true ? 'active yes' : ''}" 
                                onclick="setZuReinigen(${immoIdx},'${seiteKey}',true)" 
                                style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;${zuReinigenStatus === true ? 'background:#7AB800;color:white;' : 'background:transparent;color:#666;'}">
                            ✓ Ja, aufnehmen
                        </button>
                        <button type="button" class="toggle-btn ${zuReinigenStatus === false ? 'active no' : ''}" 
                                onclick="setZuReinigen(${immoIdx},'${seiteKey}',false)" 
                                style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;${zuReinigenStatus === false ? 'background:#ef4444;color:white;' : 'background:transparent;color:#666;'}">
                            ✗ Nein
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function renderSeiteDetails(immoIdx, seiteKey, seite, flaecheBerechnet) {
    // Bühnen-Preis ermitteln
    const buehneTyp = seite.buehne?.typ || 'keine';
    const buehnePreisInfo = BUEHNEN_PREISE[buehneTyp] || BUEHNEN_PREISE['keine'];
    const istSonderbuehne = buehnePreisInfo.preis === 'anfrage';

    return `
        <!-- 2.1 MASSE (PFLICHTFELDER) -->
        <div class="dimension-fields-required ${(seite.breite > 0 && seite.hoehe > 0) ? 'valid' : ''}">
            <div class="dimension-header">
                ${(seite.breite > 0 && seite.hoehe > 0) ? '✓ Maße eingegeben' : '⚠️ Pflichtfelder: Breite und Höhe eingeben'}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Breite (m) <span class="required">*</span></label>
                    <input type="number" 
                        step="0.5" 
                        min="0.5" 
                        max="100" 
                        value="${seite.breite || ''}" 
                        placeholder="z.B. 15" 
                        required
                        onchange="updateSeiteDimension(${immoIdx},'${seiteKey}','breite',this.value)"
                        onkeyup="updateSeiteDimension(${immoIdx},'${seiteKey}','breite',this.value)"
                        onblur="validateDimension(this)">
                </div>
                <div class="form-group">
                    <label>Höhe (m) <span class="required">*</span></label>
                    <input type="number" 
                        step="0.5" 
                        min="0.5" 
                        max="50" 
                        value="${seite.hoehe || ''}" 
                        placeholder="z.B. 12" 
                        required
                        onchange="updateSeiteDimension(${immoIdx},'${seiteKey}','hoehe',this.value)"
                        onkeyup="updateSeiteDimension(${immoIdx},'${seiteKey}','hoehe',this.value)"
                        onblur="validateDimension(this)">
                </div>
                <div class="form-group">
                    <label>Fläche (m²)</label>
                    <input type="number" value="${flaecheBerechnet}" style="background:#f0f0f0;font-weight:600;color:var(--ff-green);" readonly>
                </div>
            </div>
        </div>
        
        <!-- 2.2 ABFRAGEN A-G (PFLICHTANGABEN) -->
        <div class="abfragen-container" style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
            <div style="font-size:12px;font-weight:600;color:#92400e;margin-bottom:4px;">
                ⚠️ Pflichtangaben (A-G ausfüllen)
            </div>
            
            <!-- A) BALKONE VORHANDEN? -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid var(--ff-border);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;font-size:13px;">A) Balkone vorhanden?</span>
                    <div class="ja-nein-toggle" style="display:flex;gap:4px;">
                        <button type="button" class="toggle-btn-sm ${seite.balkone === true ? 'active yes' : ''}" onclick="updateSeite(${immoIdx},'${seiteKey}','balkone',true)">Ja</button>
                        <button type="button" class="toggle-btn-sm ${seite.balkone === false ? 'active no' : ''}" onclick="updateSeite(${immoIdx},'${seiteKey}','balkone',false)">Nein</button>
                    </div>
                </div>
            </div>
            
            <!-- B) BÜHNEN-TYP -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${istSonderbuehne ? '#f59e0b' : 'var(--ff-green)'};">
                <div style="font-weight:600;font-size:13px;margin-bottom:8px;">B) Bühnen-Typ</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    <label class="radio-pill ${buehneTyp === 'keine' ? 'selected' : ''}" onclick="setBuehneTyp(${immoIdx},'${seiteKey}','keine')">
                        <input type="radio" name="buehne-${immoIdx}-${seiteKey}" ${buehneTyp === 'keine' ? 'checked' : ''}>
                        Keine Bühne <span style="color:var(--ff-green);font-weight:600;">0 €</span>
                    </label>
                    <label class="radio-pill ${buehneTyp === 'standard' ? 'selected' : ''}" onclick="setBuehneTyp(${immoIdx},'${seiteKey}','standard')">
                        <input type="radio" name="buehne-${immoIdx}-${seiteKey}" ${buehneTyp === 'standard' ? 'checked' : ''}>
                        FassadenFix Standard <span style="color:var(--ff-green);font-weight:600;">390 €/Tag</span>
                    </label>
                    <label class="radio-pill ${istSonderbuehne ? 'selected warning' : ''}" onclick="setBuehneTyp(${immoIdx},'${seiteKey}','sonder')">
                        <input type="radio" name="buehne-${immoIdx}-${seiteKey}" ${istSonderbuehne ? 'checked' : ''}>
                        Sonderbühne <span style="color:#f59e0b;font-weight:600;">Auf Anfrage</span>
                    </label>
                </div>
                
                ${istSonderbuehne ? `
                <!-- Sonderbühnen-Dropdown (aufgeklappt) -->
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid #f59e0b;">
                    <label style="font-size:12px;font-weight:500;margin-bottom:6px;display:block;">Sonderbühnen-Typ:</label>
                    <select onchange="updateSeite(${immoIdx},'${seiteKey}','buehne',{...immobilien[${immoIdx}].seiten['${seiteKey}'].buehne, sonderTyp: this.value})" style="width:100%;">
                        <option value="" ${!seite.buehne?.sonderTyp ? 'selected' : ''}>-- Bitte wählen --</option>
                        <option value="gelenkbuehne" ${seite.buehne?.sonderTyp === 'gelenkbuehne' ? 'selected' : ''}>Gelenkbühne</option>
                        <option value="teleskopbuehne" ${seite.buehne?.sonderTyp === 'teleskopbuehne' ? 'selected' : ''}>Teleskopbühne</option>
                        <option value="lkwbuehne" ${seite.buehne?.sonderTyp === 'lkwbuehne' ? 'selected' : ''}>LKW-Bühne</option>
                        <option value="kletterer" ${seite.buehne?.sonderTyp === 'kletterer' ? 'selected' : ''}>Industriekletterer</option>
                        <option value="geruest" ${seite.buehne?.sonderTyp === 'geruest' ? 'selected' : ''}>Gerüst</option>
                        <option value="sonstiges" ${seite.buehne?.sonderTyp === 'sonstiges' ? 'selected' : ''}>Sonstiges</option>
                    </select>
                    <div class="form-group" style="margin-top:10px;">
                        <label style="font-size:12px;font-weight:500;">Anzahl Tage (Min. 6 Tage Mindestmietdauer)</label>
                        <input type="number" min="6" value="${seite.buehne?.tage || 6}" style="width:80px;" onchange="updateSeite(${immoIdx},'${seiteKey}','buehne',{...immobilien[${immoIdx}].seiten['${seiteKey}'].buehne, tage: Math.max(6, parseInt(this.value)||6)})">
                    </div>
                    <div style="margin-top:8px;padding:8px;background:#fef3c7;border-radius:4px;font-size:11px;color:#92400e;">
                        ⚠️ Preis wird mit "Auf Anfrage" im Angebot angezeigt - Rücksprache erforderlich
                    </div>
                </div>
                ` : ''}
                
                ${buehneTyp === 'standard' ? `
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid var(--ff-green);">
                    <div class="form-group">
                        <label style="font-size:12px;">Anzahl Tage</label>
                        <input type="number" min="1" value="${seite.buehne?.tage || 1}" style="width:80px;" onchange="updateSeite(${immoIdx},'${seiteKey}','buehne',{...immobilien[${immoIdx}].seiten['${seiteKey}'].buehne, tage: parseInt(this.value)||1})">
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- C) REINIGUNGSPRODUKT -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${seite.reinigungsprodukt?.zusaetzlichErforderlich ? '#f59e0b' : 'var(--ff-green)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-weight:600;font-size:13px;">C) Reinigungsprodukt</span>
                    <span style="font-size:11px;color:var(--ff-green);font-weight:500;">✓ Standard: HF1 plus</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <label class="checkbox-label" style="font-size:12px;">
                        <input type="checkbox" ${seite.reinigungsprodukt?.zusaetzlichErforderlich ? 'checked' : ''} onchange="toggleReinigungsproduktZusatz(${immoIdx},'${seiteKey}',this.checked)">
                        Anderes/Zusätzliches erforderlich
                    </label>
                </div>
                
                ${seite.reinigungsprodukt?.zusaetzlichErforderlich ? `
                <!-- Reinigungsprodukt Untermenü (HERMES Produkte) -->
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid #f59e0b;">
                    <div style="margin-bottom:10px;">
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">1. Produkt (Multi-Select):</label>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${REINIGUNGSPRODUKTE.zusaetzlich.map(prod => `
                                <label class="checkbox-pill ${(seite.reinigungsprodukt?.zusaetzlichProdukte || []).includes(prod.id) ? 'checked' : ''}" onclick="toggleZusatzProdukt(${immoIdx},'${seiteKey}','${prod.id}',this)">
                                    <input type="checkbox" ${(seite.reinigungsprodukt?.zusaetzlichProdukte || []).includes(prod.id) ? 'checked' : ''}>
                                    ${prod.label}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">2. Anwendung:</label>
                        <div style="display:flex;gap:8px;">
                            <label class="radio-pill ${seite.reinigungsprodukt?.anwendung === 'zusaetzlich' ? 'selected' : ''}" onclick="setReinigungsproduktAnwendung(${immoIdx},'${seiteKey}','zusaetzlich')">
                                <input type="radio" name="anwendung-${immoIdx}-${seiteKey}" ${seite.reinigungsprodukt?.anwendung === 'zusaetzlich' ? 'checked' : ''}>
                                Zusätzlich
                            </label>
                            <label class="radio-pill ${seite.reinigungsprodukt?.anwendung === 'stattdessen' ? 'selected' : ''}" onclick="setReinigungsproduktAnwendung(${immoIdx},'${seiteKey}','stattdessen')">
                                <input type="radio" name="anwendung-${immoIdx}-${seiteKey}" ${seite.reinigungsprodukt?.anwendung === 'stattdessen' ? 'checked' : ''}>
                                Stattdessen
                            </label>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">3. Begründung: <span style="color:#9ca3af;">🎤 Sprache-zu-Text</span></label>
                        <div style="display:flex;gap:6px;">
                            <input type="text" value="${seite.reinigungsprodukt?.begruendung || ''}" placeholder="Begründung eingeben..." style="flex:1;" onchange="setReinigungsproduktBegruendung(${immoIdx},'${seiteKey}',this.value)">
                            <button type="button" class="btn-mic" onclick="startSpeechToText(${immoIdx},'${seiteKey}','reinigungsprodukt.begruendung')" title="Spracheingabe">🎤</button>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- D) ZUGÄNGLICHKEIT -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${seite.zugaenglichkeit?.typ === 'eingeschraenkt' ? '#f59e0b' : 'var(--ff-green)'};">
                <div style="font-weight:600;font-size:13px;margin-bottom:8px;">D) Zugänglichkeit</div>
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <label class="radio-pill ${seite.zugaenglichkeit?.typ === 'ungehindert' ? 'selected' : ''}" onclick="setZugaenglichkeit(${immoIdx},'${seiteKey}','ungehindert')">
                        <input type="radio" name="zugang-${immoIdx}-${seiteKey}" ${seite.zugaenglichkeit?.typ === 'ungehindert' ? 'checked' : ''}>
                        ✓ Ungehindert
                    </label>
                    <label class="radio-pill ${seite.zugaenglichkeit?.typ === 'eingeschraenkt' ? 'selected warning' : ''}" onclick="setZugaenglichkeit(${immoIdx},'${seiteKey}','eingeschraenkt')">
                        <input type="radio" name="zugang-${immoIdx}-${seiteKey}" ${seite.zugaenglichkeit?.typ === 'eingeschraenkt' ? 'checked' : ''}>
                        ⚠ Eingeschränkt
                    </label>
                </div>
                
                ${seite.zugaenglichkeit?.typ === 'eingeschraenkt' ? `
                <!-- Zugänglichkeit Untermenü -->
                <div class="submenu" style="margin-top:8px;padding:10px;background:#fff;border-radius:6px;border:1px solid #f59e0b;">
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                        ${['gehweg', 'parkplatz', 'strasse', 'gruenschnitt', 'sonstiges'].map(typ => `
                            <label class="checkbox-pill ${(seite.zugaenglichkeit?.einschraenkungen || []).includes(typ) ? 'checked' : ''}" onclick="toggleZugaenglichkeitOption(${immoIdx},'${seiteKey}','${typ}',this)">
                                <input type="checkbox" ${(seite.zugaenglichkeit?.einschraenkungen || []).includes(typ) ? 'checked' : ''}>
                                ${typ === 'gehweg' ? 'Gehweg-Sperrung nötig' : typ === 'parkplatz' ? 'Parkplatz-Sperrung nötig' : typ === 'strasse' ? 'Straßensperrung nötig' : typ === 'gruenschnitt' ? 'Grünschnitt nötig' : 'Sonstiges'}
                            </label>
                        `).join('')}
                    </div>
                    ${(seite.zugaenglichkeit?.einschraenkungen || []).includes('sonstiges') ? `
                    <div style="display:flex;gap:6px;">
                        <input type="text" value="${seite.zugaenglichkeit?.sonstigesBeschreibung || ''}" placeholder="Sonstiges beschreiben..." style="flex:1;" onchange="setZugaenglichkeitSonstiges(${immoIdx},'${seiteKey}',this.value)">
                        <button type="button" class="btn-mic" onclick="startSpeechToText(${immoIdx},'${seiteKey}','zugaenglichkeit.sonstigesBeschreibung')" title="Spracheingabe">🎤</button>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            
            <!-- E) SCHÄDEN/BESONDERHEITEN -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${seite.schaeden?.vorhanden ? '#ef4444' : 'var(--ff-border)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-weight:600;font-size:13px;">E) Schäden/Besonderheiten</span>
                    <div class="ja-nein-toggle" style="display:flex;gap:4px;">
                        <button type="button" class="toggle-btn-sm ${seite.schaeden?.vorhanden === false ? 'active no' : ''}" onclick="setSchaedenVorhanden(${immoIdx},'${seiteKey}',false)">Nein</button>
                        <button type="button" class="toggle-btn-sm ${seite.schaeden?.vorhanden === true ? 'active yes' : ''}" onclick="setSchaedenVorhanden(${immoIdx},'${seiteKey}',true)">Ja</button>
                    </div>
                </div>
                
                ${seite.schaeden?.vorhanden ? `
                <!-- Schäden Untermenü -->
                <div class="submenu" style="margin-top:8px;padding:10px;background:#fff;border-radius:6px;border:1px solid #ef4444;">
                    ${SCHADEN_TYPEN.map(schaden => `
                    <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--ff-border);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-size:12px;font-weight:500;">${schaden.icon} ${schaden.label}</span>
                            <div class="ja-nein-toggle" style="display:flex;gap:4px;">
                                <button type="button" class="toggle-btn-xs ${seite.schaeden?.[schaden.id]?.aktiv === true ? 'active yes' : ''}" onclick="setSchadenTyp(${immoIdx},'${seiteKey}','${schaden.id}',true)">Ja</button>
                                <button type="button" class="toggle-btn-xs ${seite.schaeden?.[schaden.id]?.aktiv === false ? 'active no' : ''}" onclick="setSchadenTyp(${immoIdx},'${seiteKey}','${schaden.id}',false)">Nein</button>
                            </div>
                        </div>
                        ${seite.schaeden?.[schaden.id]?.aktiv ? `
                        <div style="margin-top:8px;">
                            <div style="display:flex;gap:6px;margin-bottom:8px;">
                                <button type="button" class="btn-upload" onclick="uploadSchadenFoto(${immoIdx},'${seiteKey}','${schaden.id}')" title="Foto hochladen">📷 Foto hinzufügen</button>
                                <span style="font-size:11px;color:#666;align-self:center;">${(seite.schaeden?.[schaden.id]?.fotos || []).length} Foto(s)</span>
                            </div>
                            ${(seite.schaeden?.[schaden.id]?.fotos || []).length > 0 ? `
                            <div class="photo-thumbnail-grid">
                                ${(seite.schaeden?.[schaden.id]?.fotos || []).map((foto, fotoIdx) => `
                                    <div class="photo-thumbnail">
                                        <img src="${typeof foto === 'string' ? foto : foto.data}" alt="Schaden-Foto">
                                        <button type="button" class="photo-delete" onclick="removeSchadenFoto(${immoIdx},'${seiteKey}','${schaden.id}',${fotoIdx})">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}
                            <div style="display:flex;gap:6px;margin-top:8px;">
                                <input type="text" value="${seite.schaeden?.[schaden.id]?.beschreibung || ''}" 
                                    placeholder="Anzahl, Größe & Art beschreiben (z.B. 3 Graffitis, ca. 2x1m)" 
                                    style="flex:1;" 
                                    onchange="setSchadenBeschreibung(${immoIdx},'${seiteKey}','${schaden.id}',this.value)">
                                <button type="button" class="btn-mic" onclick="startSpeechToText(${immoIdx},'${seiteKey}','schaeden.${schaden.id}.beschreibung')" title="Spracheingabe">🎤</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    `).join('')}
                    
                    <div>
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">Weitere Besonderheiten:</label>
                        <div style="display:flex;gap:6px;">
                            <textarea 
                                value="${seite.schaeden?.weitereBesonderheiten || ''}"
                                placeholder="Beschreibung für Angebotserstellung durch Dritte:&#10;- Anzahl und Abmessungen der Schäden&#10;- Besondere Zugangsbedingungen&#10;- Zustand der Oberfläche" 
                                style="flex:1;min-height:60px;resize:vertical;" 
                                onchange="setWeitereSchaeden(${immoIdx},'${seiteKey}',this.value)">${seite.schaeden?.weitereBesonderheiten || ''}</textarea>
                            <button type="button" class="btn-mic" onclick="startSpeechToText(${immoIdx},'${seiteKey}','schaeden.weitereBesonderheiten')" title="Spracheingabe" style="align-self:flex-start;">🎤</button>
                        </div>
                        <div style="font-size:10px;color:#666;margin-top:4px;">
                            💡 Tipp: Beschreibung soll Dritte befähigen, ein Angebot zu erstellen
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- F) 360° RUNDGANG-LINK (PRO SEITE) -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${seite.rundgang360Url ? 'var(--ff-green)' : 'var(--ff-border)'};">
                <div style="font-weight:600;font-size:13px;margin-bottom:8px;">
                    F) 360° Rundgang-Link
                    ${seite.rundgang360Url ? '<span style="color:var(--ff-green);margin-left:6px;">✓</span>' : ''}
                </div>
                <input type="url" value="${seite.rundgang360Url || ''}" 
                    placeholder="https://my.matterport.com/show/?m=..." 
                    onchange="updateSeite(${immoIdx},'${seiteKey}','rundgang360Url',this.value)" 
                    style="font-family:monospace;font-size:11px;width:100%;">
                <div style="font-size:10px;color:#666;margin-top:4px;">
                    Matterport, Ricoh Tours oder ähnliche 360°-Aufnahmen dieser Seite
                </div>
            </div>
            
            <!-- G) FOTOS (PRO SEITE) -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${(seite.fotos?.length > 0) ? 'var(--ff-green)' : 'var(--ff-border)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-weight:600;font-size:13px;">
                        G) Fotos dieser Seite
                        ${(seite.fotos?.length > 0) ? `<span style="color:var(--ff-green);margin-left:6px;">(${seite.fotos.length})</span>` : ''}
                    </span>
                    <button type="button" class="btn-upload" onclick="uploadSeiteFoto(${immoIdx},'${seiteKey}')" style="padding:4px 10px;">
                        📷 + Fotos hinzufügen
                    </button>
                </div>
                ${(seite.fotos?.length > 0) ? `
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                    ${seite.fotos.map((foto, fotoIdx) => `
                        <div style="position:relative;width:60px;height:60px;border-radius:4px;overflow:hidden;border:1px solid var(--ff-border);">
                            <img src="${foto}" style="width:100%;height:100%;object-fit:cover;">
                            <button type="button" onclick="removeSeiteFoto(${immoIdx},'${seiteKey}',${fotoIdx})" 
                                style="position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,0.6);color:white;border:none;font-size:10px;cursor:pointer;">×</button>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div style="font-size:11px;color:#666;text-align:center;padding:10px;">
                    Noch keine Fotos hinzugefügt
                </div>
                `}
            </div>
            
            <!-- H) WEITERE INFORMATIONEN (OPTIONAL) -->
            <details class="optional-info" style="margin-top:12px;">
                <summary>📋 Weitere Informationen (optional)</summary>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                    <div class="form-group">
                        <label>Letzte Sanierung (Jahr)</label>
                        <input type="number" min="1900" max="2030" value="${seite.letzteSanierung || ''}" placeholder="z.B. 2018" onchange="updateSeite(${immoIdx},'${seiteKey}','letzteSanierung',this.value)">
                    </div>
                    <div class="form-group">
                        <label>Farbwerte</label>
                        <input type="text" value="${seite.farbwerte || ''}" placeholder="z.B. RAL 9010" onchange="updateSeite(${immoIdx},'${seiteKey}','farbwerte',this.value)">
                    </div>
                </div>
            </details>
        </div>
    `;
}

// ============================================
// POSITIONEN RENDERING
// ============================================

// Positionen für eine spezifische Immobilie rendern
function renderPositionsForImmo(immoNummer) {
    const immoPositions = positions.filter(p => p.immoNummer === immoNummer);
    const gruppenFarben = { reinigung: '#7AB800', rabatte: '#2196F3', technik: '#FF9800', nebenkosten: '#9C27B0' };

    if (immoPositions.length === 0) {
        return `<div style="font-size:12px;color:#666;text-align:center;padding:10px;">
            Positionen werden automatisch generiert, sobald Seiten zur Reinigung ausgewählt sind.
        </div>`;
    }

    return immoPositions.map((p, idx) => {
        const globalIdx = positions.findIndex(pos => pos === p);
        const gesamt = p.menge * p.einzelpreis;
        const gesamtStr = p.bedarfsposition ? `(${formatCurrency(gesamt)})` : formatCurrency(gesamt);
        const gruppeInfo = ARTIKELGRUPPEN[p.artikelgruppe] || ARTIKELGRUPPEN.reinigung;
        const gruppeColor = gruppenFarben[p.artikelgruppe] || '#7AB800';

        return `
        <div class="position-item" style="${p.bedarfsposition ? 'border-left:3px solid #999;' : `border-left:3px solid ${gruppeColor};`}margin-bottom:8px;padding:10px;background:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="display:flex;align-items:center;gap:8px;">
                    <strong style="font-size:13px;">Pos ${p.pos}</strong>
                    <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${gruppeColor}15;color:${gruppeColor};font-weight:500;">${gruppeInfo.label}</span>
                    ${p.bedarfsposition ? '<span style="font-size:10px;color:#999;">(Bedarf)</span>' : ''}
                </span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <strong style="${p.bedarfsposition ? 'color:#999;' : `color:${gruppeColor};`}">${gesamtStr}</strong>
                    <button class="position-remove" onclick="removePosition(${globalIdx})" style="width:20px;height:20px;font-size:12px;">×</button>
                </div>
            </div>
            <div style="font-size:12px;margin-bottom:6px;">${p.bezeichnung}</div>
            <div style="display:flex;gap:10px;font-size:11px;color:#666;">
                <span>${p.menge.toLocaleString('de-DE')} ${p.einheit}</span>
                <span>× ${formatCurrency(p.einzelpreis)}</span>
            </div>
        </div>
        `;
    }).join('');
}

function renderPositions() {
    const container = document.getElementById('positionsContainer');
    const gruppenFarben = { reinigung: '#7AB800', rabatte: '#2196F3', technik: '#FF9800', nebenkosten: '#9C27B0' };

    container.innerHTML = positions.map((p, i) => {
        const gesamt = p.menge * p.einzelpreis;
        const gesamtStr = p.bedarfsposition ? `(${formatCurrency(gesamt)})` : formatCurrency(gesamt);
        const gruppeInfo = ARTIKELGRUPPEN[p.artikelgruppe] || ARTIKELGRUPPEN.reinigung;
        const gruppeColor = gruppenFarben[p.artikelgruppe] || '#7AB800';

        return `
        <div class="position-item" style="${p.bedarfsposition ? 'border-left:3px solid #999;' : `border-left:3px solid ${gruppeColor};`}">
            <div class="position-header">
                <span class="position-number" style="display:flex;align-items:center;gap:8px;">
                    <strong style="font-size:14px;">Pos. ${p.pos}</strong>
                    <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${gruppeColor}15;color:${gruppeColor};font-weight:500;">${gruppeInfo.label}</span>
                    ${p.bedarfsposition ? '<span style="font-size:10px;color:#999;font-weight:normal;">(Bedarf)</span>' : ''}
                </span>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-weight:600;${p.bedarfsposition ? 'color:#999;' : `color:${gruppeColor};`}">${gesamtStr}</span>
                    <button class="position-remove" onclick="removePosition(${i})">×</button>
                </div>
            </div>
            
            <!-- Artikel-Dropdown -->
            <div class="form-group">
                <label>Artikel aus Katalog wählen</label>
                <select onchange="selectArtikelFromKatalog(${i}, this.value)">
                    ${renderArtikelDropdown()}
                </select>
            </div>
            
            <div class="form-group">
                <label>Bezeichnung</label>
                <input type="text" value="${p.bezeichnung}" onchange="updatePos(${i},'bezeichnung',this.value)">
            </div>
            
            <div style="display:grid;grid-template-columns:80px 80px 1fr 100px;gap:10px;">
                <div class="form-group">
                    <label>Menge</label>
                    <input type="number" value="${p.menge}" onchange="updatePos(${i},'menge',parseFloat(this.value))">
                </div>
                <div class="form-group">
                    <label>Einheit</label>
                    <select onchange="updatePos(${i},'einheit',this.value)">
                        <option value="m²" ${p.einheit === 'm²' ? 'selected' : ''}>m²</option>
                        <option value="Stk" ${p.einheit === 'Stk' ? 'selected' : ''}>Stk</option>
                        <option value="Tag(e)" ${p.einheit === 'Tag(e)' ? 'selected' : ''}>Tag(e)</option>
                        <option value="Pausch." ${p.einheit === 'Pausch.' ? 'selected' : ''}>Pausch.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <input type="text" value="${p.beschreibung.split('\\n')[0]}" onchange="updatePos(${i},'beschreibung',this.value)">
                </div>
                <div class="form-group">
                    <label>€/Einheit</label>
                    <input type="number" step="0.01" value="${p.einzelpreis}" onchange="updatePos(${i},'einzelpreis',parseFloat(this.value))">
                </div>
            </div>
            
            <label class="checkbox-label" style="margin-top:8px;">
                <input type="checkbox" ${p.bedarfsposition ? 'checked' : ''} onchange="updatePos(${i},'bedarfsposition',this.checked)">
                Bedarfsposition (optional)
            </label>
        </div>
    `}).join('');

    updatePositionStats();
}

function updatePositionStats() {
    const totals = calculateTotals();
    const bedarfsCount = positions.filter(p => p.bedarfsposition).length;

    document.getElementById('posCount').textContent = positions.length;
    document.getElementById('bedarfsCount').textContent = bedarfsCount;
    document.getElementById('posNettoSum').textContent = formatCurrency(totals.netto);

    const gruppenCounts = {
        reinigung: positions.filter(p => p.artikelgruppe === 'reinigung').length,
        rabatte: positions.filter(p => p.artikelgruppe === 'rabatte').length,
        technik: positions.filter(p => p.artikelgruppe === 'technik').length,
        nebenkosten: positions.filter(p => p.artikelgruppe === 'nebenkosten').length
    };

    document.getElementById('gruppeReinigung').textContent = gruppenCounts.reinigung;
    document.getElementById('gruppeRabatte').textContent = gruppenCounts.rabatte;
    document.getElementById('gruppeTechnik').textContent = gruppenCounts.technik;
    document.getElementById('gruppeNebenkosten').textContent = gruppenCounts.nebenkosten;
}

// ============================================
// IMMOBILIEN EVENT-HANDLER 
// ============================================
function addImmobilie() {
    const neueNummer = immobilien.length + 1;
    immobilien.push(createEmptyImmobilie(neueNummer));
    renderImmobilien();
    updatePreview();
}

function removeImmobilie(index) {
    if (immobilien.length > 1) {
        immobilien.splice(index, 1);
        // Nummerierung korrigieren
        immobilien.forEach((immo, i) => immo.nummer = i + 1);
        // Positionen neu generieren mit korrekter Nummerierung
        generatePositionsFromImmobilien();
        renderImmobilien();
        updatePreview();
    }
}

// ============================================
// ABWEICHENDER RECHNUNGSEMPFÄNGER (NEU)
// ============================================
function toggleAbweichenderRechnungsempfaenger(checked) {
    const details = document.getElementById('rechnungsempfaengerDetails');
    if (details) {
        details.style.display = checked ? 'block' : 'none';
    }
    updatePreview();
}

function updateImmobilieAdresse(immoIdx, field, value) {
    immobilien[immoIdx].adresse[field] = value;
    // Bei manueller Änderung: Verifizierung entfernen
    immobilien[immoIdx].adresse.verified = false;
    updatePreview();
}

// ============================================
// GOOGLE MAPS ADDRESS AUTOCOMPLETE
// ============================================
let autocompleteInstances = {};

function initAddressAutocomplete(immoIdx) {
    // Prüfe ob Google Maps API geladen ist
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.warn('Google Maps API nicht verfügbar - manuelle Eingabe verwenden');
        return;
    }

    // Verhindere mehrfache Initialisierung
    if (autocompleteInstances[immoIdx]) {
        return;
    }

    const inputElement = document.getElementById(`addressAutocomplete-${immoIdx}`);
    if (!inputElement) return;

    try {
        const autocomplete = new google.maps.places.Autocomplete(inputElement, {
            componentRestrictions: { country: 'de' },
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address']
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.warn('Keine Geometrie für diese Adresse gefunden');
                return;
            }

            // Adresse parsen
            const addressData = parseGooglePlaceAddress(place);

            // Immobilie aktualisieren
            immobilien[immoIdx].adresse = {
                strasse: addressData.strasse,
                hausnummer: addressData.hausnummer,
                plz: addressData.plz,
                ort: addressData.ort,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                verified: true
            };

            // UI aktualisieren
            renderImmobilien();
            updatePreview();

        });

        autocompleteInstances[immoIdx] = autocomplete;
    } catch (e) {
        console.error('Fehler bei Autocomplete-Initialisierung:', e);
    }
}

function parseGooglePlaceAddress(place) {
    const result = {
        strasse: '',
        hausnummer: '',
        plz: '',
        ort: ''
    };

    if (!place.address_components) return result;

    for (const component of place.address_components) {
        const types = component.types;

        if (types.includes('route')) {
            result.strasse = component.long_name;
        } else if (types.includes('street_number')) {
            result.hausnummer = component.long_name;
        } else if (types.includes('postal_code')) {
            result.plz = component.long_name;
        } else if (types.includes('locality')) {
            result.ort = component.long_name;
        } else if (types.includes('sublocality_level_1') && !result.ort) {
            result.ort = component.long_name;
        }
    }

    return result;
}

function handleManualAddressInput(immoIdx, value) {
    // Bei manueller Eingabe ohne Autocomplete: Parse versuchen
    if (!value.trim()) return;

    // Versuche einfaches Parsing: "Straße Nr, PLZ Ort"
    const match = value.match(/^(.+?)\s+(\d+[a-zA-Z]?(?:-\d+[a-zA-Z]?)?)\s*,\s*(\d{5})\s+(.+)$/);

    if (match) {
        immobilien[immoIdx].adresse.strasse = match[1].trim();
        immobilien[immoIdx].adresse.hausnummer = match[2].trim();
        immobilien[immoIdx].adresse.plz = match[3].trim();
        immobilien[immoIdx].adresse.ort = match[4].trim();
        immobilien[immoIdx].adresse.verified = false;
        updatePreview();
    }
}

function toggleAlleSeiten(immoIdx, checked) {
    immobilien[immoIdx].alleSeiten = checked;
    Object.keys(immobilien[immoIdx].seiten).forEach(key => {
        immobilien[immoIdx].seiten[key].zuReinigen = checked;
        immobilien[immoIdx].seiten[key].aktiv = checked;
    });
    renderImmobilien();
    updatePreview();
}

// NEU: Kopfdaten Event-Handler
function updateImmobilieKopfdaten(immoIdx, field, value) {
    immobilien[immoIdx][field] = value;
    updatePreview();
}

// NEU: AG-Mitarbeiter Event-Handler
function updateAGMitarbeiter(immoIdx, field, value) {
    if (!immobilien[immoIdx].agMitarbeiter) {
        immobilien[immoIdx].agMitarbeiter = { name: '', email: '', telefon: '', position: '', hubspotContactId: null };
    }
    immobilien[immoIdx].agMitarbeiter[field] = value;
    updatePreview();
}

// NEU: Pflichtabfragen Event-Handler
function setPflichtabfrage(immoIdx, field, value) {
    immobilien[immoIdx][field] = value;

    // Bei Marketing geeignet = true: E-Mail-Entwurf öffnen
    if (field === 'marketingGeeignet' && value === true) {

        // E-Mail-Benachrichtigung vorbereiten
        const immo = immobilien[immoIdx];
        const adresse = `${immo.adresse.strasse} ${immo.adresse.hausnummer}, ${immo.adresse.plz} ${immo.adresse.ort}`;
        const firma = document.getElementById('companyName')?.value || 'Unbekannt';

        // 48h Frist berechnen
        const frist = new Date();
        frist.setHours(frist.getHours() + 48);
        const fristStr = frist.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const subject = `📸 Marketing-Kandidat: ${adresse}`;
        const body = `Hallo Marketing-Team,

die folgende Immobilie wurde als potenzieller Marketing-Kandidat markiert:

IMMOBILIE-DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Adresse: ${adresse}
• Auftraggeber: ${firma}
• Angebotsnummer: ${document.getElementById('angebotsnummer')?.value || 'n/a'}
• Markiert von: ${document.getElementById('hubspotOwnerId')?.selectedOptions[0]?.text || 'n/a'}
• Datum: ${new Date().toLocaleDateString('de-DE')}

FRIST FÜR ABSTIMMUNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ${fristStr} (48h)

NÄCHSTE SCHRITTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Prüfen ob Objekt für Marketing-Material geeignet ist
2. Rücksprache mit Vertrieb halten
3. Bei Interesse: Fototermin koordinieren

Bitte bis zur Frist Rückmeldung geben.

Mit freundlichen Grüßen
FassadenFix Vertrieb`;

        // mailto-Link öffnen
        const mailtoLink = `mailto:marketing@fassadenfix.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Frage ob E-Mail gesendet werden soll
        if (confirm('📸 Marketing-Kandidat markiert!\n\nMöchten Sie jetzt eine E-Mail an das Marketing-Team senden?\n\nFrist: 48 Stunden zur Abstimmung')) {
            window.open(mailtoLink, '_blank');
            immobilien[immoIdx].marketingAufgabeErstellt = true;
        }
    }

    // Bei Reinigung möglich = false: Warnung anzeigen
    if (field === 'reinigungMoeglich' && value === false) {
    }

    renderImmobilien();
    updatePreview();
}

// Prüfung ob Angebotserstellung möglich ist
function canCreateOffer() {
    const immoNichtMoeglich = immobilien.filter(immo => immo.reinigungMoeglich === false);
    if (immoNichtMoeglich.length > 0) {
        return {
            possible: false,
            reason: `Reinigung nicht möglich für ${immoNichtMoeglich.length} Immobilie(n). Bitte entfernen oder ändern Sie die Markierung.`
        };
    }

    const immoUnentschieden = immobilien.filter(immo => immo.reinigungMoeglich === null);
    if (immoUnentschieden.length > 0) {
        return {
            possible: false,
            reason: `Bitte beantworten Sie "Ist Reinigung möglich?" für ${immoUnentschieden.length} Immobilie(n).`
        };
    }

    return { possible: true };
}

// NEU: Zu Reinigen Toggle (Pflichtfeld)
function setZuReinigen(immoIdx, seiteKey, value) {
    immobilien[immoIdx].seiten[seiteKey].zuReinigen = value;
    immobilien[immoIdx].seiten[seiteKey].aktiv = value;

    // Prüfe ob alle Seiten ausgewählt sind
    const alleAktiv = Object.values(immobilien[immoIdx].seiten).every(s => s.zuReinigen === true);
    immobilien[immoIdx].alleSeiten = alleAktiv;

    renderImmobilien();

    // Automatisch Positionen generieren basierend auf Seiten-Auswahl
    if (typeof generatePositionsFromImmobilien === 'function') {
        generatePositionsFromImmobilien();
    }

    updatePreview();
}

function toggleSeiteAktiv(immoIdx, seiteKey, aktiv) {
    immobilien[immoIdx].seiten[seiteKey].aktiv = aktiv;
    const alleAktiv = Object.values(immobilien[immoIdx].seiten).every(s => s.aktiv);
    immobilien[immoIdx].alleSeiten = alleAktiv;
    renderImmobilien();
    updatePreview();
}

function toggleSeiteExpand(immoIdx, seiteKey) {
    const body = document.getElementById(`seite-body-${immoIdx}-${seiteKey}`);
    if (body) body.classList.toggle('expanded');
}

function updateSeite(immoIdx, seiteKey, field, value) {
    immobilien[immoIdx].seiten[seiteKey][field] = value;
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if ((field === 'breite' || field === 'hoehe') && seite.breite && seite.hoehe) {
        seite.flaeche = Math.round(seite.breite * seite.hoehe);
    }
    renderImmobilien();
    updatePreview();
}

// ============================================
// DIMENSION VALIDATION (0.5m steps)
// ============================================
function updateSeiteDimension(immoIdx, seiteKey, field, value) {
    // Auf 0.5er Schritte runden
    let numValue = parseFloat(value) || 0;
    numValue = Math.round(numValue * 2) / 2; // Rundet auf 0.5

    // Min/Max validieren
    if (field === 'breite') {
        numValue = Math.max(0.5, Math.min(100, numValue));
    } else if (field === 'hoehe') {
        numValue = Math.max(0.5, Math.min(50, numValue));
    }

    // Wert setzen
    immobilien[immoIdx].seiten[seiteKey][field] = numValue;

    // Fläche berechnen
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (seite.breite && seite.hoehe) {
        seite.flaeche = Math.round(seite.breite * seite.hoehe);
    }

    renderImmobilien();
    updatePreview();
}

function validateDimension(inputElement) {
    let value = parseFloat(inputElement.value) || 0;

    // Auf 0.5er Schritte runden
    value = Math.round(value * 2) / 2;

    // Mindestens 0.5
    if (value < 0.5 && inputElement.value !== '') {
        value = 0.5;
    }

    // Wert im Input aktualisieren
    if (inputElement.value !== '' && value > 0) {
        inputElement.value = value;
    }
}

// MBS-Felder Event-Handler
function updateSeiteMBS(immoIdx, seiteKey, path, value) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    const parts = path.split('.');

    if (parts.length === 1) {
        // Einfaches Feld (z.B. untergrund)
        seite[parts[0]] = value;
    } else if (parts.length === 2) {
        // Verschachteltes Feld (z.B. buehne.typ)
        if (!seite[parts[0]]) seite[parts[0]] = {};
        seite[parts[0]][parts[1]] = value;
    }

    renderImmobilien();
    updatePreview();
}

function toggleHindernis(immoIdx, seiteKey, hindernisId, labelEl) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.hindernisse) seite.hindernisse = [];

    const idx = seite.hindernisse.indexOf(hindernisId);
    if (idx === -1) {
        seite.hindernisse.push(hindernisId);
        labelEl.classList.add('checked');
    } else {
        seite.hindernisse.splice(idx, 1);
        labelEl.classList.remove('checked');
    }

    updatePreview();
}

// ============================================
// ABFRAGEN EVENT-HANDLER (GEMÄSS SPEZIFIKATION)
// ============================================

// B) Bühnen-Typ
function setBuehneTyp(immoIdx, seiteKey, typ) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.buehne) seite.buehne = { typ: 'keine', tage: 1, preis: 0, sonderTyp: '' };

    seite.buehne.typ = typ;

    // Preis setzen gemäß Spezifikation
    if (typ === 'keine') {
        seite.buehne.preis = 0;
    } else if (typ === 'standard') {
        seite.buehne.preis = 390;
    } else {
        seite.buehne.preis = 'anfrage';
    }

    renderImmobilien();

    // Automatisch Positionen generieren bei Bühnen-Änderung
    if (typeof generatePositionsFromImmobilien === 'function') {
        generatePositionsFromImmobilien();
    }

    updatePreview();
}

// C) Reinigungsprodukt
function toggleReinigungsproduktZusatz(immoIdx, seiteKey, checked) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.reinigungsprodukt) {
        seite.reinigungsprodukt = { standard: true, zusaetzlichErforderlich: false, zusaetzlichProdukte: [], anwendung: 'zusaetzlich', begruendung: '' };
    }
    seite.reinigungsprodukt.zusaetzlichErforderlich = checked;
    renderImmobilien();
    updatePreview();
}

function toggleZusatzProdukt(immoIdx, seiteKey, produktId, labelEl) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.reinigungsprodukt) {
        seite.reinigungsprodukt = { standard: true, zusaetzlichErforderlich: true, zusaetzlichProdukte: [], anwendung: 'zusaetzlich', begruendung: '' };
    }
    if (!seite.reinigungsprodukt.zusaetzlichProdukte) seite.reinigungsprodukt.zusaetzlichProdukte = [];

    const idx = seite.reinigungsprodukt.zusaetzlichProdukte.indexOf(produktId);
    if (idx === -1) {
        seite.reinigungsprodukt.zusaetzlichProdukte.push(produktId);
        labelEl.classList.add('checked');
    } else {
        seite.reinigungsprodukt.zusaetzlichProdukte.splice(idx, 1);
        labelEl.classList.remove('checked');
    }
    updatePreview();
}

function setReinigungsproduktAnwendung(immoIdx, seiteKey, anwendung) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.reinigungsprodukt) {
        seite.reinigungsprodukt = { standard: true, zusaetzlichErforderlich: true, zusaetzlichProdukte: [], anwendung: 'zusaetzlich', begruendung: '' };
    }
    seite.reinigungsprodukt.anwendung = anwendung;
    renderImmobilien();
    updatePreview();
}

function setReinigungsproduktBegruendung(immoIdx, seiteKey, text) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.reinigungsprodukt) {
        seite.reinigungsprodukt = { standard: true, zusaetzlichErforderlich: true, zusaetzlichProdukte: [], anwendung: 'zusaetzlich', begruendung: '' };
    }
    seite.reinigungsprodukt.begruendung = text;
    updatePreview();
}

// D) Zugänglichkeit
function setZugaenglichkeit(immoIdx, seiteKey, typ) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.zugaenglichkeit) {
        seite.zugaenglichkeit = { typ: 'ungehindert', einschraenkungen: [], sonstigesBeschreibung: '' };
    }
    seite.zugaenglichkeit.typ = typ;
    renderImmobilien();
    updatePreview();
}

function toggleZugaenglichkeitOption(immoIdx, seiteKey, optionId, labelEl) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.zugaenglichkeit) {
        seite.zugaenglichkeit = { typ: 'eingeschraenkt', einschraenkungen: [], sonstigesBeschreibung: '' };
    }
    if (!seite.zugaenglichkeit.einschraenkungen) seite.zugaenglichkeit.einschraenkungen = [];

    const idx = seite.zugaenglichkeit.einschraenkungen.indexOf(optionId);
    if (idx === -1) {
        seite.zugaenglichkeit.einschraenkungen.push(optionId);
        labelEl.classList.add('checked');
    } else {
        seite.zugaenglichkeit.einschraenkungen.splice(idx, 1);
        labelEl.classList.remove('checked');
    }

    // Re-Render für Sonstiges-Freifeld
    if (optionId === 'sonstiges') {
        renderImmobilien();
    }
    updatePreview();
}

function setZugaenglichkeitSonstiges(immoIdx, seiteKey, text) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.zugaenglichkeit) {
        seite.zugaenglichkeit = { typ: 'eingeschraenkt', einschraenkungen: ['sonstiges'], sonstigesBeschreibung: '' };
    }
    seite.zugaenglichkeit.sonstigesBeschreibung = text;
    updatePreview();
}

// E) Schäden/Besonderheiten
function setSchaedenVorhanden(immoIdx, seiteKey, vorhanden) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.schaeden) {
        seite.schaeden = {
            vorhanden: false,
            graffiti: { aktiv: false, beschreibung: '', fotos: [] },
            loecher: { aktiv: false, beschreibung: '', fotos: [] },
            risse: { aktiv: false, beschreibung: '', fotos: [] },
            weitereBesonderheiten: ''
        };
    }
    seite.schaeden.vorhanden = vorhanden;
    renderImmobilien();
    updatePreview();
}

function setSchadenTyp(immoIdx, seiteKey, schadensTyp, aktiv) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.schaeden) {
        seite.schaeden = { vorhanden: true, graffiti: { aktiv: false, beschreibung: '', fotos: [] }, loecher: { aktiv: false, beschreibung: '', fotos: [] }, risse: { aktiv: false, beschreibung: '', fotos: [] }, weitereBesonderheiten: '' };
    }
    if (!seite.schaeden[schadensTyp]) {
        seite.schaeden[schadensTyp] = { aktiv: false, beschreibung: '', fotos: [] };
    }
    seite.schaeden[schadensTyp].aktiv = aktiv;
    renderImmobilien();
    updatePreview();
}

function setSchadenBeschreibung(immoIdx, seiteKey, schadensTyp, text) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.schaeden || !seite.schaeden[schadensTyp]) return;
    seite.schaeden[schadensTyp].beschreibung = text;
    updatePreview();
}

function setWeitereSchaeden(immoIdx, seiteKey, text) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (!seite.schaeden) {
        seite.schaeden = { vorhanden: true, weitereBesonderheiten: '' };
    }
    seite.schaeden.weitereBesonderheiten = text;
    updatePreview();
}

// Foto-Upload mit File-Input und Base64-Speicherung
function uploadSchadenFoto(immoIdx, seiteKey, schadensTyp) {
    // Erstelle versteckten File-Input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';

    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const seite = immobilien[immoIdx].seiten[seiteKey];
        if (!seite.schaeden) {
            seite.schaeden = { vorhanden: true, [schadensTyp]: { aktiv: true, beschreibung: '', fotos: [] } };
        }
        if (!seite.schaeden[schadensTyp]) {
            seite.schaeden[schadensTyp] = { aktiv: true, beschreibung: '', fotos: [] };
        }
        if (!seite.schaeden[schadensTyp].fotos) {
            seite.schaeden[schadensTyp].fotos = [];
        }

        // Konvertiere Bilder zu Base64
        for (const file of files) {
            try {
                const base64 = await fileToBase64(file);
                seite.schaeden[schadensTyp].fotos.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    uploadedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Fehler beim Konvertieren des Fotos:', err);
            }
        }

        // UI aktualisieren
        renderImmobilien();
        updatePreview();

    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// Hilfsfunktion: File zu Base64 konvertieren
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ============================================
// SEITEN-FOTOS (Pro Seite, nicht pro Schaden)
// ============================================
function uploadSeiteFoto(immoIdx, seiteKey) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';

    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const seite = immobilien[immoIdx].seiten[seiteKey];
        if (!seite.fotos) {
            seite.fotos = [];
        }

        // Konvertiere Bilder zu Base64
        for (const file of files) {
            try {
                const base64 = await fileToBase64(file);
                seite.fotos.push(base64);
            } catch (err) {
                console.error('Fehler beim Konvertieren des Fotos:', err);
            }
        }

        // UI aktualisieren
        renderImmobilien();
        updatePreview();

    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function removeSeiteFoto(immoIdx, seiteKey, fotoIdx) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (seite.fotos && seite.fotos[fotoIdx]) {
        seite.fotos.splice(fotoIdx, 1);
        renderImmobilien();
        updatePreview();
    }
}

function removeSchadenFoto(immoIdx, seiteKey, schadensTyp, fotoIdx) {
    const seite = immobilien[immoIdx].seiten[seiteKey];
    if (seite.schaeden?.[schadensTyp]?.fotos && seite.schaeden[schadensTyp].fotos[fotoIdx]) {
        seite.schaeden[schadensTyp].fotos.splice(fotoIdx, 1);
        renderImmobilien();
        updatePreview();
    }
}

// Speech-to-Text mit Web Speech API + AI-Optimierung
let currentRecognition = null;

function startSpeechToText(immoIdx, seiteKey, fieldPath) {
    // Prüfe ob Web Speech API verfügbar ist
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('Spracheingabe wird von Ihrem Browser nicht unterstützt.\\n\\nBitte verwenden Sie Chrome, Edge oder Safari.');
        return;
    }

    // Falls bereits eine Aufnahme läuft, stoppen
    if (currentRecognition) {
        currentRecognition.stop();
        currentRecognition = null;
        return;
    }

    // Finde den Mikrofon-Button und das zugehörige Input-Feld
    const micButtons = document.querySelectorAll('.btn-mic');
    let targetButton = null;
    let targetInput = null;

    // Suche den richtigen Button basierend auf onclick-Attribut
    micButtons.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(`'${fieldPath}'`)) {
            targetButton = btn;
            // Input ist das vorherige Geschwister-Element
            targetInput = btn.previousElementSibling;
        }
    });

    if (!targetButton) {
        console.error('Mikrofon-Button nicht gefunden für:', fieldPath);
        return;
    }

    // Feldtyp für AI-Optimierung bestimmen
    let fieldType = 'default';
    if (fieldPath.includes('schaeden')) fieldType = 'schadensbeschreibung';
    else if (fieldPath.includes('zugaenglichkeit')) fieldType = 'zugaenglichkeit';
    else if (fieldPath.includes('reinigungsprodukt')) fieldType = 'reinigungsprodukt';
    else if (fieldPath.includes('besonderheiten')) fieldType = 'besonderheiten';

    // Starte Spracherkennung
    currentRecognition = new SpeechRecognition();
    currentRecognition.lang = 'de-DE';
    currentRecognition.continuous = false;
    currentRecognition.interimResults = true;
    currentRecognition.maxAlternatives = 1;

    // Visuelles Feedback
    targetButton.classList.add('recording');
    targetButton.innerHTML = '🔴';

    currentRecognition.onresult = async (event) => {
        const result = event.results[0];
        const transcript = result[0].transcript;

        if (targetInput) {
            // Zeige Rohtext während der Aufnahme
            targetInput.value = transcript;
            targetInput.style.opacity = '0.7';

            // Wenn final, AI-Optimierung anwenden
            if (result.isFinal) {
                targetInput.value = transcript + ' ⏳';
                targetInput.style.opacity = '0.5';

                try {
                    // AI-Optimierung via Backend
                    const optimizedText = await optimizeTextWithAI(transcript, fieldType);
                    targetInput.value = optimizedText;
                    targetInput.style.opacity = '1';

                    // Visuelles Feedback für AI-Optimierung
                    if (optimizedText !== transcript) {
                        targetInput.style.backgroundColor = '#f0fdf4';
                        setTimeout(() => {
                            targetInput.style.backgroundColor = '';
                        }, 2000);
                    }
                } catch (e) {
                    // Fallback: Original-Text
                    targetInput.value = transcript;
                    targetInput.style.opacity = '1';
                }

                // Trigger onchange Event
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

    currentRecognition.onerror = (event) => {
        console.error('Spracherkennungsfehler:', event.error);

        let errorMsg = 'Spracherkennung fehlgeschlagen.';
        switch (event.error) {
            case 'no-speech':
                errorMsg = 'Keine Sprache erkannt. Bitte sprechen Sie deutlicher.';
                break;
            case 'audio-capture':
                errorMsg = 'Kein Mikrofon gefunden. Bitte überprüfen Sie Ihre Mikrofoneinstellungen.';
                break;
            case 'not-allowed':
                errorMsg = 'Mikrofonzugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.';
                break;
        }

        alert(errorMsg);

        // Aufräumen
        targetButton.classList.remove('recording');
        targetButton.innerHTML = '🎤';
        if (targetInput) targetInput.style.opacity = '1';
        currentRecognition = null;
    };

    currentRecognition.onend = () => {
        targetButton.classList.remove('recording');
        targetButton.innerHTML = '🎤';
        currentRecognition = null;
    };

    // Aufnahme starten
    try {
        currentRecognition.start();
    } catch (e) {
        console.error('Konnte Spracherkennung nicht starten:', e);
        targetButton.classList.remove('recording');
        targetButton.innerHTML = '🎤';
        currentRecognition = null;
    }
}

// ============================================
// POSITIONEN EVENT-HANDLER
// ============================================
function updatePos(i, field, value) {
    positions[i][field] = value;
    renderPositions();
    updatePreview();
}

function removePosition(i) {
    positions.splice(i, 1);
    regenerateAllPosNummern();
    renderPositions();
    updatePreview();
}

function addPosition() {
    const immoNummer = immobilien.length > 0 ? immobilien[0].nummer : 1;
    const artikelgruppe = 'reinigung';
    const nextPosNr = getNextPosNummerInGruppe(immoNummer, artikelgruppe);

    positions.push({
        pos: nextPosNr, immoNummer: immoNummer, artikelgruppe: artikelgruppe,
        menge: 1, einheit: 'm²', bezeichnung: 'Neue Position',
        beschreibung: '', einzelpreis: 0, bedarfsposition: false
    });
    renderPositions();
    updatePreview();
}

function getNextPosNummerInGruppe(immoNummer, artikelgruppe) {
    const gruppe = ARTIKELGRUPPEN[artikelgruppe];
    const existingInGruppe = positions.filter(p => p.immoNummer === immoNummer && p.artikelgruppe === artikelgruppe);
    const usedNumbers = existingInGruppe.map(p => parseInt(p.pos.split('.')[1]) || 0);

    let nextNum = gruppe.range[0];
    while (usedNumbers.includes(nextNum) && nextNum <= gruppe.range[1]) nextNum++;
    if (nextNum > gruppe.range[1]) nextNum = Math.max(...usedNumbers) + 1;

    return `${immoNummer}.${String(nextNum).padStart(2, '0')}`;
}

function regenerateAllPosNummern() {
    const groups = {};
    positions.forEach((p, idx) => {
        const key = `${p.immoNummer}-${p.artikelgruppe}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push({ idx, pos: p });
    });

    Object.entries(groups).forEach(([key, items]) => {
        const [immoStr, artikelgruppe] = key.split('-');
        const immoNummer = parseInt(immoStr);
        const gruppe = ARTIKELGRUPPEN[artikelgruppe];

        items.forEach((item, i) => {
            const artikelNr = gruppe.range[0] + i;
            positions[item.idx].pos = `${immoNummer}.${String(artikelNr).padStart(2, '0')}`;
        });
    });
}

// ============================================
// GLOBAL EXPORTS - Für onclick/onchange Attribute
// ============================================
// Diese Funktionen müssen global verfügbar sein, da sie von HTML-Attributen aufgerufen werden
window.toggleAbweichenderRechnungsempfaenger = toggleAbweichenderRechnungsempfaenger;
window.toggleBlock = toggleBlock;
window.completeBlock = completeBlock;
window.updatePreview = updatePreview;
window.checkBlock1Complete = checkBlock1Complete;
window.addImmobilie = addImmobilie;
window.removeImmobilie = removeImmobilie;
window.toggleAlleSeiten = toggleAlleSeiten;
window.setZuReinigen = setZuReinigen;
window.updateSeite = updateSeite;
window.updateSeiteDimension = updateSeiteDimension;
window.setBuehneTyp = setBuehneTyp;
window.setZugaenglichkeit = setZugaenglichkeit;
window.setSchaedenVorhanden = setSchaedenVorhanden;
window.setPflichtabfrage = setPflichtabfrage;
window.updateImmobilieAdresse = updateImmobilieAdresse;
window.renderImmobilien = renderImmobilien;
window.renderPositions = renderPositions;

console.info('✅ UI.js geladen - Alle Funktionen global exportiert');

// ============================================
// EXPLIZITE EXPORTS FÜR ROBUSTHEIT
// ============================================
window.addImmobilie = addImmobilie;
window.removeImmobilie = removeImmobilie;
window.renderImmobilien = renderImmobilien;
// Weitere wichtige Funktionen für onclicks
window.updateSeite = updateSeite;
window.setZuReinigen = setZuReinigen;
window.toggleAlleSeiten = toggleAlleSeiten;
window.updateSeiteDimension = updateSeiteDimension;
window.setBuehneTyp = setBuehneTyp;
window.setSchaedenVorhanden = setSchaedenVorhanden;

console.info('✅ ui.js geladen und Funktionen exportiert');
