// ============================================
// FASSADENFIX ANGEBOTSGENERATOR - PREVIEW.JS
// Preview-Rendering und PDF-Export
// ============================================

// Helper: Foto-Anhang-Hinweis generieren
function getFotoAnhangHinweis(immobilien) {
    let totalFotos = 0;
    let immobilienMitFotos = [];

    immobilien.forEach((immo, idx) => {
        let immoFotoCount = 0;
        Object.values(immo.seiten || {}).forEach(seite => {
            // Seiten-Fotos
            immoFotoCount += (seite.fotos || []).length;
            // Schäden-Fotos
            if (seite.schaeden) {
                Object.values(seite.schaeden).forEach(schaden => {
                    if (schaden && schaden.fotos) {
                        immoFotoCount += schaden.fotos.length;
                    }
                });
            }
        });
        if (immoFotoCount > 0) {
            totalFotos += immoFotoCount;
            immobilienMitFotos.push({ nr: idx + 1, count: immoFotoCount });
        }
    });

    if (totalFotos === 0) return '';

    const details = immobilienMitFotos.map(i => `Immo. ${i.nr}: ${i.count}`).join(', ');
    return `<p style="margin-top:3mm;padding-top:2mm;border-top:1px dashed #e5e5e5;">
        <strong>📷 Fotodokumentation:</strong> ${totalFotos} Foto(s) beigefügt (${details}). 
        Vollständige Dokumentation auf Anfrage per E-Mail.
    </p>`;
}

// ============================================
// PREVIEW UPDATE
// ============================================
function updatePreview() {
    updateDealAmount();
    updateFruehbucherErsparnis();
    updatePreviewStatus();

    const street = document.getElementById('companyStrasse').value;
    const streetNum = document.getElementById('companyHausnummer').value;
    const fullStreet = streetNum ? `${street} ${streetNum}` : street;

    const salutation = document.getElementById('contactSalutation').value;
    const firstname = document.getElementById('contactFirstname').value;
    const lastname = document.getElementById('contactLastname').value;
    const fullContact = `${salutation} ${firstname} ${lastname}`.trim();

    const ownerParts = document.getElementById('hubspotOwnerId').value.split('|');

    const data = {
        firma: document.getElementById('companyName').value,
        strasse: fullStreet,
        plz: document.getElementById('companyPlz').value,
        ort: document.getElementById('companyOrt').value,
        ansprechpartner: fullContact,
        angNr: document.getElementById('angebotsnummer').value,
        kundNr: document.getElementById('kundennummer').value,
        datum: document.getElementById('angebotsdatum').value,
        immobilien: immobilien
    };

    // ff = [Vorname Nachname, Email, Mobil]
    const ffVorname = ownerParts[1] || '';
    const ffNachname = ownerParts[2] || '';
    const ffEmail = ownerParts[3] || '';
    const ffMobil = ownerParts[4] || '';
    const ff = [`${ffVorname} ${ffNachname}`.trim(), ffEmail, ffMobil];
    const totals = calculateTotals();

    // Position 0.x Einträge NICHT in Tabelle anzeigen (gehen ins Versprechen-Block)
    const displayPositions = positions.filter(p => !p.pos.toString().startsWith('0'));

    let posHTML = displayPositions.map(p => {
        const ges = p.menge * p.einzelpreis;
        const cls = p.bedarfsposition ? 'bedarfs' : (p.istEckdatenPosition ? 'eckdaten' : '');
        const gesStr = p.bedarfsposition ? `(${formatCurrency(ges)})` : formatCurrency(ges);
        const bzLabel = p.bedarfsposition ? `${p.bezeichnung} (Bedarfspos.)` : p.bezeichnung;

        // Bei Eckdaten-Position keine Menge anzeigen
        const mengeStr = p.istEckdatenPosition ? '' : `${p.menge.toLocaleString('de-DE')} ${p.einheit}`;

        // KOMPAKT: Keine Beschreibung in Tabelle (max 2 Zeilen)
        // Bezeichnung kürzen wenn zu lang
        const bzShort = bzLabel.length > 60 ? bzLabel.substring(0, 57) + '...' : bzLabel;
        const bzFormatted = bzShort.split('\n').slice(0, 2).join('<br>');

        return `<tr class="${cls}">
            <td class="pos-col">${p.pos}</td>
            <td>${mengeStr}</td>
            <td><span class="bezeichnung">${bzFormatted}</span></td>
            <td class="price-col">${p.einzelpreis > 0 ? formatCurrency(p.einzelpreis) : ''}</td>
            <td class="total-col">${ges > 0 ? gesStr : ''}</td>
        </tr>`;
    }).join('');

    document.getElementById('pdfPreview').innerHTML = generatePreviewHTML(data, ff, totals, posHTML);
}

function generatePreviewHTML(data, ff, totals, posHTML) {
    // Gültigkeitsdatum berechnen (28 Tage = 4 Wochen)
    const heute = new Date();
    const gueltigBis = new Date(heute.getTime() + 28 * 24 * 60 * 60 * 1000);
    const gueltigBisStr = gueltigBis.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Immobilien-Adressen für Leistungsort
    const immobilienAdressen = data.immobilien
        .filter(i => i.adresse.strasse)
        .map(i => `${i.adresse.strasse} ${i.adresse.hausnummer}, ${i.adresse.plz} ${i.adresse.ort}`)
        .join(' | ') || 'wie vereinbart';

    return `
        <div class="pdf-header">
            <img src="assets/logo.png" alt="FassadenFix" style="height: 20mm; width: auto;">
        </div>
        <div class="pdf-header-line"></div>
        
        <div class="pdf-sender-line">
            FASSADENFIX • Immobiliengruppe Retzlaff OHG • An der Saalebahn 8a • 06118 Halle
        </div>
        
        <div class="pdf-address-meta">
            <div class="pdf-address">
                <div class="pdf-address-company">${data.firma}</div>
                <div>${data.ansprechpartner}</div>
                <div>${data.strasse}</div>
                <div>${data.plz} ${data.ort}</div>
            </div>
            <div class="pdf-meta">
                <div class="pdf-meta-row"><span class="pdf-meta-label">Angebotsnummer</span><span class="pdf-meta-value">${data.angNr}</span></div>
                <div class="pdf-meta-row"><span class="pdf-meta-label">Kundennummer</span><span class="pdf-meta-value">${data.kundNr}</span></div>
                <div class="pdf-meta-row"><span class="pdf-meta-label">Datum</span><span class="pdf-meta-value">${formatDate(data.datum)}</span></div>
                <div class="pdf-meta-row"><span class="pdf-meta-label">Ihr Ansprechpartner</span><span class="pdf-meta-value">${ff[0]}</span></div>
                <div class="pdf-meta-row"><span class="pdf-meta-label">E-Mail</span><span class="pdf-meta-value">${ff[1]}</span></div>
                <div class="pdf-meta-row"><span class="pdf-meta-label">Mobil</span><span class="pdf-meta-value">${ff[2]}</span></div>
            </div>
        </div>
        
        <div class="pdf-title">Angebot Nr. ${data.angNr}</div>
        
        <div class="pdf-intro">
            Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!<br>
            Nachfolgend unser individuelles Angebot für Sie:
        </div>
        
        <table class="pdf-table">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Menge</th>
                    <th>Bezeichnung</th>
                    <th>Einzelpreis</th>
                    <th>Gesamt</th>
                </tr>
            </thead>
            <tbody>${posHTML}</tbody>
        </table>
        
        <div class="pdf-totals">
            ${totals.bedarfs !== 0 ? `<div class="pdf-total-row bedarfs"><span>Bedarfspositionen</span><span>(${formatCurrency(totals.bedarfs)})</span></div>` : ''}
            <div class="pdf-total-row"><span>Nettobetrag</span><span>${formatCurrency(totals.netto)}</span></div>
            <div class="pdf-total-row"><span>zzgl. 19% MwSt.</span><span>${formatCurrency(totals.mwst)}</span></div>
            <div class="pdf-total-row final"><span>Gesamtsumme</span><span>${formatCurrency(totals.brutto)}</span></div>
        </div>
        
        <div class="pdf-versprechen">
            <div class="pdf-versprechen-header">Das FassadenFix Versprechen</div>
            <div class="pdf-versprechen-body">
                <div class="pdf-versprechen-left">
                    <div class="pdf-versprechen-subtitle">Transparente Preisstaffel</div>
                    <table class="pdf-preisstaffel">
                        <thead>
                            <tr><th>Fläche</th><th>€/m²</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>500 – 999 m²</td><td>10,50 €</td></tr>
                            <tr><td>1.000 – 2.499 m²</td><td>9,75 €</td></tr>
                            <tr><td>2.500 – 4.999 m²</td><td>9,25 €</td></tr>
                            <tr><td>ab 5.000 m²</td><td>8,75 €</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="pdf-versprechen-right">
                    <div class="pdf-versprechen-subtitle">Unsere Garantien</div>
                    <ul class="pdf-garantien-liste">
                        <li>5-Jahres-Garantie auf Algenfreiheit</li>
                        <li>Ergebnisgarantie bei Systemreinigung</li>
                        <li>Jährliche Inspektion inklusive</li>
                        <li>Pauschalfestpreis – keine versteckten Kosten</li>
                    </ul>
                </div>
            </div>
            <div class="pdf-versprechen-footer">FassadenFix – der sichere Weg zur sauberen Fassade</div>
        </div>
        
        <div class="pdf-terms">
            <div class="pdf-terms-title">Angebotsbedingungen</div>
            <p><strong>Gültigkeit:</strong> ${gueltigBisStr} (4 Wochen) · <strong>Zahlung:</strong> 7 Tage netto · <strong>Leistungsort:</strong> ${immobilienAdressen}</p>
            <p class="pdf-terms-agb">Sperrungen: Beantragung und Verantwortung beim AG. Es gelten unsere AGB (www.fassadenfix.de/agb).</p>
            ${getFotoAnhangHinweis(data.immobilien)}
        </div>
        
        <div class="pdf-content-end"></div>
        
        <div class="pdf-footer-content">
            <div class="pdf-footer-col">
                <strong>FASSADENFIX</strong>
                <div>Immobiliengruppe Retzlaff oHG</div>
                <div>An der Saalebahn 8a</div>
                <div>06118 Halle (Saale)</div>
            </div>
            <div class="pdf-footer-col">
                <div>Tel: 0345 218392 35</div>
                <div>info@fassadenfix.de</div>
                <div>www.fassadenfix.de</div>
            </div>
            <div class="pdf-footer-col">
                <div>Geschäftsführer: A. Retzlaff</div>
                <div>HRA 4244 · AG Stendal</div>
                <div>USt-ID: DE265643072</div>
            </div>
            <div class="pdf-footer-col">
                <div>Commerzbank Halle</div>
                <div>DE49 8004 0000 0325 0123 00</div>
                <div>BIC: COBADEFFXXX</div>
            </div>
        </div>
        <div class="pdf-footer"></div>
    `;
}

function updateDealAmount() {
    const totals = calculateTotals();
    document.getElementById('dealAmount').value = formatCurrency(totals.brutto);
}

function updateFruehbucherErsparnis() {
    const aktiv = document.getElementById('fruehbucherAktiv').checked;
    const prozent = parseFloat(document.getElementById('fruehbucherProzent').value) || 0;

    let nettoOhneRabatt = 0;
    positions.forEach(p => {
        if (!p.bedarfsposition && p.einzelpreis > 0) {
            nettoOhneRabatt += p.menge * p.einzelpreis;
        }
    });

    const ersparnis = aktiv ? (nettoOhneRabatt * prozent / 100) : 0;
    document.getElementById('fruehbucherErsparnis').textContent = formatCurrency(ersparnis);
    return { aktiv, prozent, ersparnis };
}

function updatePreviewStatus() {
    const statusEl = document.getElementById('previewStatus');
    const issues = [];

    if (!document.getElementById('companyName').value) issues.push('Unternehmen');
    if (!document.getElementById('contactLastname').value) issues.push('Ansprechpartner');
    if (!document.getElementById('angebotsnummer').value) issues.push('Angebotsnummer');
    if (immobilien.length === 0) issues.push('Immobilie');
    if (positions.length === 0) issues.push('Positionen');

    if (issues.length > 0) {
        statusEl.innerHTML = `<span style="color:#f57c00;">⚠️ Fehlend: ${issues.join(', ')}</span>`;
    } else {
        statusEl.innerHTML = `<span style="color:#7AB800;">✓ Vollständig</span>`;
    }
}

// ============================================
// RABATTE UND AKTIONEN
// ============================================
function toggleRabatt(typ, aktiv) {
    const detailsMap = {
        'fruehbucher': 'fruehbucherDetails',
        'wohnungsunternehmen': 'wohnungsunternehmenDetails',
        'sonder': 'sonderrabattDetails'
    };

    const detailsId = detailsMap[typ];
    if (detailsId) {
        const details = document.getElementById(detailsId);
        if (details) {
            details.style.display = aktiv ? 'block' : 'none';
        }
    }

    updateRabatte();
    updatePreview();
}

// Frühbucher-Optionen basierend auf Aktionsjahr aktualisieren
function updateFruehbucherOptionen() {
    const aktionSelect = document.getElementById('fruehbucherAktion');
    const prozentSelect = document.getElementById('fruehbucherProzent');
    if (!aktionSelect || !prozentSelect) return;

    const jahr = aktionSelect.value;
    const vorjahr = parseInt(jahr) - 1;

    // Optionen aktualisieren (Jahr in data-bis anpassen)
    const optionen = [
        { value: '6', bis: `${vorjahr}-12-31`, label: `6% (bis 31.12.${vorjahr})` },
        { value: '4.5', bis: `${jahr}-01-31`, label: `4,5% (bis 31.01.${jahr})` },
        { value: '3', bis: `${jahr}-02-28`, label: `3% (bis 28.02.${jahr})` },
        { value: '1.5', bis: `${jahr}-03-31`, label: `1,5% (bis 31.03.${jahr})` }
    ];

    prozentSelect.innerHTML = optionen.map(opt =>
        `<option value="${opt.value}" data-bis="${opt.bis}">${opt.label}</option>`
    ).join('');

    updateRabatte();
}

function updateRabatte() {
    const totals = calculateTotals ? calculateTotals() : { netto: 0 };
    const netto = totals.netto || 0;

    let rabattProzent = 0;
    let ersparnis = 0;

    // Frühbucherrabatt
    const fruehbucherAktiv = document.getElementById('fruehbucherAktiv')?.checked;
    if (fruehbucherAktiv) {
        const fruehbucherProzent = parseFloat(document.getElementById('fruehbucherProzent')?.value) || 0;
        rabattProzent += fruehbucherProzent;

        // Badge aktualisieren
        const badge = document.getElementById('fruehbucherAktuell');
        if (badge) badge.textContent = fruehbucherProzent + '%';
    }

    // Sonderrabatt
    const sonderAktiv = document.getElementById('sonderrabattAktiv')?.checked;
    if (sonderAktiv) {
        const sonderProzent = parseFloat(document.getElementById('sonderrabattProzent')?.value) || 0;
        rabattProzent += sonderProzent;
    }

    // Ersparnis berechnen
    ersparnis = netto * (rabattProzent / 100);

    // Anzeige aktualisieren
    const ersparnisEl = document.getElementById('gesamtErsparnis');
    const rabattEl = document.getElementById('rabattGesamt');

    if (ersparnisEl) ersparnisEl.textContent = formatCurrency(ersparnis);
    if (rabattEl) rabattEl.textContent = rabattProzent.toLocaleString('de-DE') + '%';

    // Alte Elemente für Kompatibilität
    const altErsparnis = document.getElementById('fruehbucherErsparnis');
    if (altErsparnis) altErsparnis.textContent = formatCurrency(ersparnis);
}

function getRabattData() {
    return {
        fruehbucher: {
            aktiv: document.getElementById('fruehbucherAktiv')?.checked || false,
            prozent: parseFloat(document.getElementById('fruehbucherProzent')?.value) || 0,
            gueltigBis: document.getElementById('fruehbucherBis')?.value || ''
        },
        wohnungsunternehmen: {
            aktiv: document.getElementById('wohnungsunternehmenAktiv')?.checked || false,
            preisProM2: parseFloat(document.getElementById('wohnungsunternehmenPreis')?.value) || 7.99
        },
        sonder: {
            aktiv: document.getElementById('sonderrabattAktiv')?.checked || false,
            prozent: parseFloat(document.getElementById('sonderrabattProzent')?.value) || 0,
            grund: document.getElementById('sonderrabattGrund')?.value || ''
        }
    };
}

// Legacy-Funktion für Kompatibilität
function toggleFruehbucher(active) {
    toggleRabatt('fruehbucher', active);
}

function getFruehbucherData() {
    const data = getRabattData();
    return {
        aktiv: data.fruehbucher.aktiv,
        prozent: data.fruehbucher.prozent,
        gueltigBis: data.fruehbucher.gueltigBis
    };
}
