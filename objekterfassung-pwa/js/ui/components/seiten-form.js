// ============================================
// SEITEN-ERFASSUNG (KERNSTÜCK!)
// 3-State Decision + Dimensionen + Details
// ============================================

/**
 * Rendert Seiten-Erfassung-Formular
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 */
function renderSeitenForm(immoIdx, seiteKey) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const immo = AppState.immobilien[immoIdx];
    const seite = immo?.seiten?.[seiteKey];

    if (!seite) {
        showToast('Seite nicht gefunden', 'error');
        navigateToDetail(immoIdx);
        return;
    }

    const seitenTyp = SEITEN_TYPEN[seiteKey];

    // HTML generieren
    mainContent.innerHTML = `
        <div class="seiten-form-container">
            <!-- Header -->
            <div class="seiten-form-header">
                <h2 class="seiten-form-title">
                    ${seitenTyp.icon} ${seitenTyp.label}
                </h2>
                <p class="seiten-form-subtitle">
                    Immobilie ${immo.nummer} • ${seitenTyp.beschreibung}
                </p>
            </div>

            <!-- SCHRITT A: ENTSCHEIDUNG (PROMINENT!) -->
            ${renderDecisionSection(immoIdx, seiteKey, seite)}

            <!-- SCHRITT B: DIMENSIONEN (nur wenn zuReinigen !== null) -->
            ${seite.zuReinigen !== null ? renderDimensionenSection(immoIdx, seiteKey, seite) : ''}

            <!-- SCHRITT C: DETAILS (Akkordeon, nur wenn zuReinigen === true) -->
            ${seite.zuReinigen === true ? renderDetailsSection(immoIdx, seiteKey, seite) : ''}

            <!-- SCHRITT D: FOTOS (nur wenn zuReinigen === true) -->
            ${seite.zuReinigen === true ? renderPhotosSection(immoIdx, seiteKey, seite) : ''}

            <!-- SCHRITT E: SPRACHNOTIZEN (nur wenn zuReinigen === true) -->
            ${seite.zuReinigen === true ? renderAudioNotesSection(immoIdx, seiteKey, seite) : ''}
        </div>
    `;

    // Back-Button anzeigen
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.style.display = 'block';
        backButton.onclick = () => navigateToDetail(immoIdx);
    }

    // FAB verstecken
    const fab = document.getElementById('fab');
    if (fab) {
        fab.style.display = 'none';
    }

    // Event-Listener binden
    bindSeitenFormEvents(immoIdx, seiteKey);
}

/**
 * Rendert Entscheidungs-Section (3-State Buttons)
 * @returns {string} HTML
 */
function renderDecisionSection(immoIdx, seiteKey, seite) {
    return `
        <div class="decision-section card">
            <h3 class="decision-title">
                ${seite.zuReinigen === null ? '❓' : seite.zuReinigen === true ? '✅' : '❌'}
                Zu reinigen?
            </h3>
            <p class="decision-hint">
                Entscheiden Sie, ob diese Seite im Angebot enthalten sein soll.
            </p>

            <!-- 3-State Decision Buttons -->
            <div class="decision-buttons">
                <button class="decision-btn decision-yes ${seite.zuReinigen === true ? 'active' : ''}"
                        onclick="setSeiteZuReinigen(${immoIdx}, '${seiteKey}', true)">
                    <span class="decision-icon">✓</span>
                    <span class="decision-label">Ja, reinigen</span>
                    <span class="decision-desc">Im Angebot</span>
                </button>

                <button class="decision-btn decision-no ${seite.zuReinigen === false ? 'active' : ''}"
                        onclick="setSeiteZuReinigen(${immoIdx}, '${seiteKey}', false)">
                    <span class="decision-icon">✗</span>
                    <span class="decision-label">Nein</span>
                    <span class="decision-desc">Nicht reinigen</span>
                </button>

                <button class="decision-btn decision-later ${seite.zuReinigen === null ? 'active' : ''}"
                        onclick="setSeiteZuReinigen(${immoIdx}, '${seiteKey}', null)">
                    <span class="decision-icon">⏱</span>
                    <span class="decision-label">Später</span>
                    <span class="decision-desc">Noch offen</span>
                </button>
            </div>

            ${seite.zuReinigen === null ? `
                <div class="decision-warning">
                    ⚠️ Entscheidung erforderlich, um fortzufahren
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Rendert Dimensionen-Section
 * @returns {string} HTML
 */
function renderDimensionenSection(immoIdx, seiteKey, seite) {
    return `
        <div class="dimensionen-section card">
            <h3 class="section-title">📐 Maße</h3>

            <div class="dimension-inputs">
                <div class="dimension-input-group">
                    <label class="dimension-label">Breite (m)</label>
                    <input type="number" class="dimension-input"
                           id="seite-breite-${immoIdx}-${seiteKey}"
                           value="${seite.breite || ''}"
                           placeholder="0.0"
                           step="0.5"
                           min="0"
                           inputmode="decimal"
                           onchange="updateSeiteDimension(${immoIdx}, '${seiteKey}', 'breite', parseFloat(this.value) || 0)">
                    <span class="dimension-unit">Meter</span>
                </div>

                <div class="dimension-multiply">×</div>

                <div class="dimension-input-group">
                    <label class="dimension-label">Höhe (m)</label>
                    <input type="number" class="dimension-input"
                           id="seite-hoehe-${immoIdx}-${seiteKey}"
                           value="${seite.hoehe || ''}"
                           placeholder="0.0"
                           step="0.5"
                           min="0"
                           inputmode="decimal"
                           onchange="updateSeiteDimension(${immoIdx}, '${seiteKey}', 'hoehe', parseFloat(this.value) || 0)">
                    <span class="dimension-unit">Meter</span>
                </div>
            </div>

            <!-- Auto-berechnete Fläche -->
            <div class="flaeche-result ${seite.flaeche > 0 ? 'flaeche-valid' : 'flaeche-invalid'}">
                <span class="flaeche-label">Fläche:</span>
                <span class="flaeche-value" id="flaeche-display-${immoIdx}-${seiteKey}">
                    ${seite.flaeche > 0 ? formatFlaeche(seite.flaeche) : '- m²'}
                </span>
            </div>

            ${seite.zuReinigen === true && seite.flaeche === 0 ? `
                <div class="dimension-warning">
                    ⚠️ Bitte Breite und Höhe eingeben
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Rendert Details-Section (Akkordeon)
 * @returns {string} HTML
 */
function renderDetailsSection(immoIdx, seiteKey, seite) {
    return `
        <!-- Optionale Felder -->
        <div class="details-section">
            <h3 class="section-title">📋 Zusätzliche Informationen</h3>

            <!-- Balkone -->
            <div class="detail-item card">
                <div class="detail-header">
                    <label class="detail-label">
                        <input type="checkbox" class="detail-checkbox"
                               ${seite.balkone ? 'checked' : ''}
                               onchange="updateSeiteField(${immoIdx}, '${seiteKey}', 'balkone', this.checked)">
                        Balkone vorhanden
                    </label>
                </div>
            </div>

            <!-- Bühne -->
            <div class="detail-item card">
                <h4 class="detail-title">🏗️ Bühne</h4>

                <div class="buehne-options">
                    ${['keine', 'standard', 'sonder'].map(typ => {
                        const buehneInfo = BUEHNEN_PREISE[typ];
                        const isActive = seite.buehne.typ === typ;

                        return `
                            <label class="radio-option ${isActive ? 'active' : ''}">
                                <input type="radio" name="buehne-${immoIdx}-${seiteKey}" value="${typ}"
                                       ${isActive ? 'checked' : ''}
                                       onchange="updateBuehneTyp(${immoIdx}, '${seiteKey}', '${typ}')">
                                <span class="radio-label">
                                    <strong>${buehneInfo.label}</strong>
                                    ${buehneInfo.preis === 0 ? '' :
                                      buehneInfo.preis === 'anfrage' ? ' (Auf Anfrage)' :
                                      ` (${buehneInfo.preis}€/${buehneInfo.einheit})`}
                                </span>
                            </label>
                        `;
                    }).join('')}
                </div>

                ${seite.buehne.typ === 'sonder' ? `
                    <div class="buehne-details">
                        <label class="form-label">Beschreibung der Sonderbühne</label>
                        <textarea class="form-input" rows="2"
                                  placeholder="z.B. Gelenkbühne, Teleskopbühne..."
                                  onchange="updateSeiteField(${immoIdx}, '${seiteKey}', 'buehne.beschreibung', this.value)">${seite.buehne.beschreibung || ''}</textarea>
                    </div>
                ` : ''}
            </div>

            <!-- Zugänglichkeit -->
            <div class="detail-item card">
                <h4 class="detail-title">🚧 Zugänglichkeit</h4>

                <div class="zugaenglichkeit-options">
                    <label class="radio-option ${seite.zugaenglichkeit.typ === 'ungehindert' ? 'active' : ''}">
                        <input type="radio" name="zugaenglichkeit-${immoIdx}-${seiteKey}" value="ungehindert"
                               ${seite.zugaenglichkeit.typ === 'ungehindert' ? 'checked' : ''}
                               onchange="updateZugaenglichkeit(${immoIdx}, '${seiteKey}', 'ungehindert')">
                        <span class="radio-label">✓ Ungehindert zugänglich</span>
                    </label>

                    <label class="radio-option ${seite.zugaenglichkeit.typ === 'eingeschraenkt' ? 'active' : ''}">
                        <input type="radio" name="zugaenglichkeit-${immoIdx}-${seiteKey}" value="eingeschraenkt"
                               ${seite.zugaenglichkeit.typ === 'eingeschraenkt' ? 'checked' : ''}
                               onchange="updateZugaenglichkeit(${immoIdx}, '${seiteKey}', 'eingeschraenkt')">
                        <span class="radio-label">⚠️ Eingeschränkt zugänglich</span>
                    </label>
                </div>

                ${seite.zugaenglichkeit.typ === 'eingeschraenkt' ? `
                    <div class="zugaenglichkeit-details">
                        <label class="form-label">Einschränkungen</label>
                        ${MASSNAHMEN_OPTIONEN.slice(0, 4).map(option => `
                            <label class="checkbox-option">
                                <input type="checkbox" value="${option.id}"
                                       ${seite.zugaenglichkeit.einschraenkungen.includes(option.id) ? 'checked' : ''}
                                       onchange="toggleEinschraenkung(${immoIdx}, '${seiteKey}', '${option.id}', this.checked)">
                                ${option.label}
                            </label>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Schäden -->
            <div class="detail-item card">
                <h4 class="detail-title">⚠️ Schäden / Besonderheiten</h4>

                <div class="schaeden-checkboxes">
                    ${SCHADEN_TYPEN.map(schaden => {
                        const schadenData = seite.schaeden[schaden.id];
                        const isActive = schadenData?.aktiv || false;

                        return `
                            <div class="schaden-item">
                                <label class="checkbox-option">
                                    <input type="checkbox" ${isActive ? 'checked' : ''}
                                           onchange="toggleSchaden(${immoIdx}, '${seiteKey}', '${schaden.id}', this.checked)">
                                    ${schaden.icon} ${schaden.label}
                                </label>

                                ${isActive ? `
                                    <div class="schaden-details">
                                        <textarea class="form-input" rows="2"
                                                  placeholder="Beschreibung..."
                                                  onchange="updateSchadenBeschreibung(${immoIdx}, '${seiteKey}', '${schaden.id}', this.value)">${schadenData.beschreibung || ''}</textarea>

                                        <!-- Schaden-Foto-Galerie -->
                                        ${renderPhotoGallery(immoIdx, seiteKey, schaden.id)}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Rendert Fotos-Section
 * @returns {string} HTML
 */
function renderPhotosSection(immoIdx, seiteKey, seite) {
    return `
        <div class="photos-section card">
            <h3 class="section-title">📷 Fotos</h3>

            <!-- Haupt-Fotos (allgemeine Seiten-Fotos) -->
            ${renderPhotoGallery(immoIdx, seiteKey)}
        </div>
    `;
}

/**
 * Rendert Sprachnotizen-Sektion
 * @param {number} immoIdx
 * @param {string} seiteKey
 * @param {object} seite
 * @returns {string} HTML
 */
function renderAudioNotesSection(immoIdx, seiteKey, seite) {
    return `
        <div class="audio-notes-section card">
            <h3 class="section-title">🎤 Sprachnotizen</h3>

            <!-- Audio-Notizen-Liste -->
            ${renderAudioNotes(immoIdx, seiteKey)}
        </div>
    `;
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Bindet Event-Listener
 */
function bindSeitenFormEvents(immoIdx, seiteKey) {
    console.log(`[SeitenForm] Events gebunden: Immo ${immoIdx}, Seite ${seiteKey}`);
}

/**
 * Setzt zuReinigen-Status
 */
async function setSeiteZuReinigen(immoIdx, seiteKey, value) {
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    seite.zuReinigen = value;
    seite.aktiv = value === true;

    // Speichern
    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    // UI neu rendern
    renderSeitenForm(immoIdx, seiteKey);

    showToast(
        value === true ? '✓ Seite wird gereinigt' :
        value === false ? '✗ Seite wird nicht gereinigt' :
        '⏱ Später entscheiden',
        value === null ? 'warning' : 'success'
    );
}

/**
 * Aktualisiert Dimension und berechnet Fläche
 */
async function updateSeiteDimension(immoIdx, seiteKey, field, value) {
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    seite[field] = value;

    // Auto-Berechnung Fläche
    updateSeiteFlaeche(seite);

    // Speichern
    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    // Fläche-Display aktualisieren
    const flaecheDisplay = document.getElementById(`flaeche-display-${immoIdx}-${seiteKey}`);
    if (flaecheDisplay) {
        flaecheDisplay.textContent = seite.flaeche > 0 ? formatFlaeche(seite.flaeche) : '- m²';
    }

    // Live-Validierung anzeigen
    showLiveValidationFeedback(immoIdx, seiteKey);

    console.log(`[SeitenForm] ${field} = ${value}, Fläche = ${seite.flaeche}`);
}

/**
 * Aktualisiert beliebiges Seiten-Feld
 */
async function updateSeiteField(immoIdx, seiteKey, field, value) {
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    // Nested path setzen
    const keys = field.split('.');
    let current = seite;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);
}

/**
 * Aktualisiert Bühnen-Typ
 */
async function updateBuehneTyp(immoIdx, seiteKey, typ) {
    await updateSeiteField(immoIdx, seiteKey, 'buehne.typ', typ);
    renderSeitenForm(immoIdx, seiteKey);
}

/**
 * Aktualisiert Zugänglichkeit
 */
async function updateZugaenglichkeit(immoIdx, seiteKey, typ) {
    await updateSeiteField(immoIdx, seiteKey, 'zugaenglichkeit.typ', typ);
    renderSeitenForm(immoIdx, seiteKey);
}

/**
 * Togglet Einschränkung
 */
async function toggleEinschraenkung(immoIdx, seiteKey, id, checked) {
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    if (checked) {
        if (!seite.zugaenglichkeit.einschraenkungen.includes(id)) {
            seite.zugaenglichkeit.einschraenkungen.push(id);
        }
    } else {
        seite.zugaenglichkeit.einschraenkungen = seite.zugaenglichkeit.einschraenkungen.filter(e => e !== id);
    }

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);
}

/**
 * Togglet Schaden
 */
async function toggleSchaden(immoIdx, seiteKey, schadenTyp, checked) {
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    seite.schaeden.vorhanden = checked || Object.values(seite.schaeden).some(s => s.aktiv);
    seite.schaeden[schadenTyp].aktiv = checked;

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    renderSeitenForm(immoIdx, seiteKey);
}

/**
 * Aktualisiert Schaden-Beschreibung
 */
async function updateSchadenBeschreibung(immoIdx, seiteKey, schadenTyp, text) {
    const immo = AppState.immobilien[immoIdx];
    seite = immo.seiten[seiteKey];

    seite.schaeden[schadenTyp].beschreibung = text;

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);
}

/**
 * Foto für Schaden aufnehmen
 * @deprecated - Jetzt direkt über openCamera() aus camera.js aufgerufen
 */

/**
 * Navigiert zurück zur Detail-View
 */
function navigateToDetail(immoIdx) {
    updateState('ui.currentStep', 'immo-detail');
    updateState('ui.currentSeiteKey', null);

    renderImmobilienDetail(immoIdx);
}
