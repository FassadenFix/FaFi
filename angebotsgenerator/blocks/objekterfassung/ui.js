/**
 * Block 2 UI: Objekterfassung
 * Verwaltet UI-Updates, Rendering und Events für Immobilien und Seiten
 */
const ObjekterfassungUI = {

    init() {
        console.info('🏠 Objekterfassung UI initialisiert');
        // Initial Rendering wenn Daten vorhanden
        if (typeof immobilien !== 'undefined' && immobilien.length > 0) {
            this.render();
        }
    },

    /**
     * Haupt-Render-Funktion für Block 2
     * Ersetzt die alte renderImmobilien Funktion aus ui.js
     */
    render() {
        const container = document.getElementById('immobilienContainer');
        if (!container) return;

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
                    <!-- ADRESSE -->
                    ${this.renderAddressSection(immo, immoIdx)}

                    <!-- KOPFDATEN -->
                    ${this.renderKopfdatenSection(immo, immoIdx)}
                    
                    <!-- ALLE SEITEN -->
                    <div style="margin-bottom:15px;">
                        <label class="checkbox-label" style="font-weight:600;font-size:13px;">
                            <input type="checkbox" ${Object.values(immo.seiten).every(s => s.zuReinigen === true) ? 'checked' : ''} onchange="toggleAlleSeiten(${immoIdx},this.checked)">
                            <span style="color:var(--ff-green);">✓ Alle 4 Seiten zur Reinigung auswählen</span>
                        </label>
                    </div>
                    
                    <!-- 4 SEITEN -->
                    <div class="seiten-container">
                        ${Object.entries(immo.seiten).map(([key, seite]) => this.renderSeite(immoIdx, key, seite)).join('')}
                    </div>
                    
                    <!-- POSITIONEN PREVIEW -->
                    ${this.renderPositionsPreview(immo)}
                </div>
            </div>
        `}).join('');

        this.updateStats();
        this.validate(); // Validierung nach Render update
    },

    renderAddressSection(immo, immoIdx) {
        return `
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
            </details>
        </div>`;
    },

    renderKopfdatenSection(immo, immoIdx) {
        return `
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
                        ${Object.entries(window.hubspotOwners || {}).map(([id, owner]) =>
                            `<option value="${id}" ${immo.ffMitarbeiter === id ? 'selected' : ''}>${owner.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>`;
    },

    renderPositionsPreview(immo) {
        const gesamtFlaeche = Object.values(immo.seiten).filter(s => s.zuReinigen === true).reduce((sum, s) => sum + (s.flaeche || 0), 0);
        return `
        <div style="margin-top:20px;padding-top:15px;border-top:2px solid var(--ff-green);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div style="font-size:13px;font-weight:600;color:var(--ff-green);">
                    📋 Positionen für Immobilie ${immo.nummer}
                </div>
                <span style="font-size:11px;color:#666;">
                    ${positions.filter(p => p.immoNummer === immo.nummer).length} Positionen
                </span>
            </div>
            
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
            
            <div id="immoPositions-${immo.nummer}">
                ${this.renderPositionsForImmo(immo.nummer)}
            </div>
        </div>`;
    },

    renderPositionsForImmo(immoNummer) {
        // Wrapper um globale Funktion oder UI-Logik Implementieren
        if (typeof renderPositionsForImmo === 'function') {
             return renderPositionsForImmo(immoNummer);
        }
        return '';
    },

    renderSeite(immoIdx, seiteKey, seite) {
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
                ${this.renderSeiteDetails(immoIdx, seiteKey, seite, flaecheBerechnet)}
                
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
        </div>`;
    },

    renderSeiteDetails(immoIdx, seiteKey, seite, flaecheBerechnet) {
        // Bühnen-Preis ermitteln
        const buehneTyp = seite.buehne?.typ || 'keine';
        const buehnePreisInfo = (window.BUEHNEN_PREISE && window.BUEHNEN_PREISE[buehneTyp]) || { preis: 0 }; 
        const istSonderbuehne = buehnePreisInfo.preis === 'anfrage';

        // Helper für Produkte
        const produkteHtml = (window.REINIGUNGSPRODUKTE && window.REINIGUNGSPRODUKTE.zusaetzlich) ? window.REINIGUNGSPRODUKTE.zusaetzlich.map(prod => `
            <label class="checkbox-pill ${(seite.reinigungsprodukt?.zusaetzlichProdukte || []).includes(prod.id) ? 'checked' : ''}" onclick="toggleZusatzProdukt(${immoIdx},'${seiteKey}','${prod.id}',this)">
                <input type="checkbox" ${(seite.reinigungsprodukt?.zusaetzlichProdukte || []).includes(prod.id) ? 'checked' : ''}>
                ${prod.label}
            </label>
        `).join('') : '';

        // Helper für Schäden
        const schaedenHtml = (window.SCHADEN_TYPEN || []).map(schaden => `
            <div class="schaden-item">
                <label class="checkbox-label" style="font-size:12px;">
                    <input type="checkbox" ${seite.schaeden?.[schaden.id]?.aktiv ? 'checked' : ''} onchange="toggleSchaden(${immoIdx},'${seiteKey}','${schaden.id}',this.checked)">
                    ${schaden.label}
                </label>
                ${seite.schaeden?.[schaden.id]?.aktiv ? `
                <div class="schaden-details-input">
                    <input type="text" value="${seite.schaeden?.[schaden.id]?.beschreibung || ''}" placeholder="Beschreibung..." onchange="updateSchadenBeschreibung(${immoIdx},'${seiteKey}','${schaden.id}',this.value)">
                    <button class="btn-camera" onclick="capturePhoto(${immoIdx},'${seiteKey}','${schaden.id}')">📷</button>
                    ${(seite.schaeden?.[schaden.id]?.fotos || []).length > 0 ? `
                        <div class="foto-preview-row">
                            ${seite.schaeden[schaden.id].fotos.map(f => `<img src="${f}" class="mini-thumb">`).join('')}
                        </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `).join('');

        return `
        <!-- 2.1 MASSE (PFLICHTFELDER) -->
        <div class="dimension-fields-required ${(seite.breite > 0 && seite.hoehe > 0) ? 'valid' : ''}">
            <div class="dimension-header">
                ${(seite.breite > 0 && seite.hoehe > 0) ? '✓ Maße eingegeben' : '⚠️ Pflichtfelder: Breite und Höhe eingeben'}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Breite (m) <span class="required">*</span></label>
                    <input type="number" step="0.5" min="0.5" max="100" value="${seite.breite || ''}" placeholder="z.B. 15" required
                        onchange="updateSeiteDimension(${immoIdx},'${seiteKey}','breite',this.value)"
                        onkeyup="updateSeiteDimension(${immoIdx},'${seiteKey}','breite',this.value)">
                </div>
                <div class="form-group">
                    <label>Höhe (m) <span class="required">*</span></label>
                    <input type="number" step="0.5" min="0.5" max="50" value="${seite.hoehe || ''}" placeholder="z.B. 12" required
                        onchange="updateSeiteDimension(${immoIdx},'${seiteKey}','hoehe',this.value)"
                        onkeyup="updateSeiteDimension(${immoIdx},'${seiteKey}','hoehe',this.value)">
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
            
            <!-- A) BALKONE -->
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
                        Standard <span style="color:var(--ff-green);font-weight:600;">390 €/Tag</span>
                    </label>
                    <label class="radio-pill ${istSonderbuehne ? 'selected warning' : ''}" onclick="setBuehneTyp(${immoIdx},'${seiteKey}','sonder')">
                        <input type="radio" name="buehne-${immoIdx}-${seiteKey}" ${istSonderbuehne ? 'checked' : ''}>
                        Sonderbühne <span style="color:#f59e0b;font-weight:600;">Auf Anfrage</span>
                    </label>
                </div>
                
                ${istSonderbuehne ? `
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid #f59e0b;">
                    <label style="font-size:12px;font-weight:500;margin-bottom:6px;display:block;">Typ:</label>
                    <select onchange="updateSeite(${immoIdx},'${seiteKey}','buehne',{...immobilien[${immoIdx}].seiten['${seiteKey}'].buehne, sonderTyp: this.value})" style="width:100%;">
                        <option value="">-- Bitte wählen --</option>
                        <option value="gelenkbuehne" ${seite.buehne?.sonderTyp === 'gelenkbuehne' ? 'selected' : ''}>Gelenkbühne</option>
                        <option value="teleskopbuehne" ${seite.buehne?.sonderTyp === 'teleskopbuehne' ? 'selected' : ''}>Teleskopbühne</option>
                        <option value="lkwbuehne" ${seite.buehne?.sonderTyp === 'lkwbuehne' ? 'selected' : ''}>LKW-Bühne</option>
                        <option value="kletterer" ${seite.buehne?.sonderTyp === 'kletterer' ? 'selected' : ''}>Industriekletterer</option>
                        <option value="geruest" ${seite.buehne?.sonderTyp === 'geruest' ? 'selected' : ''}>Gerüst</option>
                        <option value="sonstiges" ${seite.buehne?.sonderTyp === 'sonstiges' ? 'selected' : ''}>Sonstiges</option>
                    </select>
                    <div class="form-group" style="margin-top:10px;">
                        <label style="font-size:12px;font-weight:500;">Tage (Min. 6)</label>
                        <input type="number" min="6" value="${seite.buehne?.tage || 6}" style="width:80px;" onchange="updateSeite(${immoIdx},'${seiteKey}','buehne',{...immobilien[${immoIdx}].seiten['${seiteKey}'].buehne, tage: Math.max(6, parseInt(this.value)||6)})">
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
                <label class="checkbox-label" style="font-size:12px;">
                    <input type="checkbox" ${seite.reinigungsprodukt?.zusaetzlichErforderlich ? 'checked' : ''} onchange="toggleReinigungsproduktZusatz(${immoIdx},'${seiteKey}',this.checked)">
                    Anderes/Zusätzliches erforderlich
                </label>
                
                ${seite.reinigungsprodukt?.zusaetzlichErforderlich ? `
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid #f59e0b;">
                    <div style="margin-bottom:10px;">
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">Produkt (Multi-Select):</label>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${produkteHtml}
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:500;display:block;margin-bottom:6px;">Anwendung:</label>
                        <div style="display:flex;gap:8px;">
                            <label class="radio-pill ${seite.reinigungsprodukt?.anwendung === 'zusaetzlich' ? 'selected' : ''}" onclick="setReinigungsproduktAnwendung(${immoIdx},'${seiteKey}','zusaetzlich')">
                                <input type="radio" name="anwendung-${immoIdx}-${seiteKey}" ${seite.reinigungsprodukt?.anwendung === 'zusaetzlich' ? 'checked' : ''}>Zusätzlich
                            </label>
                            <label class="radio-pill ${seite.reinigungsprodukt?.anwendung === 'stattdessen' ? 'selected' : ''}" onclick="setReinigungsproduktAnwendung(${immoIdx},'${seiteKey}','stattdessen')">
                                <input type="radio" name="anwendung-${immoIdx}-${seiteKey}" ${seite.reinigungsprodukt?.anwendung === 'stattdessen' ? 'checked' : ''}>Stattdessen
                            </label>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- F) SCHÄDEN -->
            <div class="abfrage-item" style="background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid ${seite.schaeden?.vorhanden ? '#ef4444' : 'var(--ff-border)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;font-size:13px;">F) Schäden / Besonderheiten?</span>
                    <div class="ja-nein-toggle" style="display:flex;gap:4px;">
                        <button type="button" class="toggle-btn-sm ${seite.schaeden?.vorhanden === true ? 'active yes' : ''}" onclick="setSchaedenVorhanden(${immoIdx},'${seiteKey}',true)">Ja</button>
                        <button type="button" class="toggle-btn-sm ${seite.schaeden?.vorhanden === false ? 'active no' : ''}" onclick="setSchaedenVorhanden(${immoIdx},'${seiteKey}',false)">Nein</button>
                    </div>
                </div>
                ${seite.schaeden?.vorhanden ? `
                <div class="submenu" style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:1px solid #ef4444;">
                    ${schaedenHtml}
                </div>
                ` : ''}
            </div>
        </div>
        `;
    },

    updateStats() {
        const totalImmo = immobilien.length;
        let totalQm = 0;
        immobilien.forEach(immo => {
            Object.values(immo.seiten).forEach(seite => {
                if (seite.zuReinigen === true) totalQm += seite.flaeche || 0;
            });
        });

        const info = document.getElementById('block2Info');
        if (info) info.textContent = `${totalImmo} Immobilie(n) • ${totalQm.toLocaleString('de-DE')} m²`;
        
        const immoCount = document.getElementById('immoCount');
        const totalQmEl = document.getElementById('totalQm');
        if (immoCount) immoCount.textContent = totalImmo;
        if (totalQmEl) totalQmEl.textContent = totalQm.toLocaleString('de-DE');
    },

    validate() {
        // Ersetzt checkBlock2Complete aus ui.js
        const hasImmobilien = immobilien.length > 0;
        const allSeitenEntschieden = immobilien.every(immo =>
            Object.values(immo.seiten).every(seite => seite.zuReinigen !== null)
        );
        const hasAtLeastOneSide = immobilien.some(immo =>
            Object.values(immo.seiten).some(seite => seite.zuReinigen === true)
        );

        let undecidedCount = 0;
        immobilien.forEach(immo => {
            Object.values(immo.seiten).forEach(seite => {
                if (seite.zuReinigen === null) undecidedCount++;
            });
        });

        const btn = document.getElementById('block2CompleteBtn');
        if (btn) {
            btn.disabled = !(hasImmobilien && allSeitenEntschieden && hasAtLeastOneSide);
            
            if (undecidedCount > 0) {
                btn.textContent = `⚠️ Noch ${undecidedCount} Seite(n) ohne Entscheidung`;
            } else if (!hasAtLeastOneSide) {
                btn.textContent = `⚠️ Mindestens 1 Seite zur Reinigung auswählen`;
            } else {
                btn.textContent = `✓ Objekterfassung abschließen → weiter zu Angebotserstellung`;
            }
        }

        this.updateStats();
    }
};

// Hilfsfunktion: Wir müssen renderSeiteDetails aus der ursprünglichen ui.js hierher portieren oder zugänglich machen.
// Da wir "ui.js" töten wollen, definieren wir eine globale Fallback-Funktion oder kopieren den Inhalt.
// Im nächsten Schritt müssen wir sicherstellen, dass renderSeiteDetailsGlobal existiert oder hier implementiert ist.

// Global export
if (typeof window !== 'undefined') {
    window.ObjekterfassungUI = ObjekterfassungUI;
    window.checkBlock2Complete = () => ObjekterfassungUI.validate();
    window.renderImmobilien = () => ObjekterfassungUI.render();
}
