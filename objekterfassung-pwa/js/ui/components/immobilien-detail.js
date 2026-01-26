// ============================================
// IMMOBILIEN-DETAIL-VIEW
// Stammdaten + 4 Seiten-Cards
// ============================================

/**
 * Rendert Immobilien-Detail-View
 * @param {number} immoIdx - Immobilien-Index
 */
function renderImmobilienDetail(immoIdx) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const immo = AppState.immobilien[immoIdx];
    if (!immo) {
        showToast('Immobilie nicht gefunden', 'error');
        navigateToList();
        return;
    }

    // HTML generieren
    mainContent.innerHTML = `
        <div class="immo-detail-container">
            <!-- Header -->
            <div class="detail-header">
                <h2 class="detail-title">
                    🏢 Immobilie ${immo.nummer}
                </h2>
                <div class="detail-subtitle">
                    ${getFormattedAdresse(immo.adresse) || 'Noch keine Adresse'}
                </div>
            </div>

            <!-- Stammdaten-Formular -->
            ${renderStammdatenForm(immo, immoIdx)}

            <!-- 4 Seiten-Cards -->
            <div class="seiten-section">
                <h3 class="section-title">Seiten (4)</h3>
                <div class="seiten-grid">
                    ${Object.entries(immo.seiten).map(([key, seite]) =>
                        renderSeiteCard(key, seite, immoIdx)
                    ).join('')}
                </div>

                <!-- Completion Status -->
                ${renderSeitenCompletionCard(immo, immoIdx)}
            </div>
        </div>
    `;

    // Back-Button anzeigen
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.style.display = 'block';
        backButton.onclick = navigateToList;
    }

    // FAB verstecken (nicht nötig in Detail-View)
    const fab = document.getElementById('fab');
    if (fab) {
        fab.style.display = 'none';
    }

    // Event-Listener binden
    bindDetailEvents(immoIdx);
}

/**
 * Rendert Stammdaten-Formular
 * @param {object} immo - Immobilie
 * @param {number} immoIdx - Index
 * @returns {string} HTML
 */
function renderStammdatenForm(immo, immoIdx) {
    return `
        <div class="stammdaten-section card">
            <h3 class="section-title">Stammdaten</h3>

            <!-- Adresse -->
            <div class="form-section">
                <div class="form-section-header">
                    <h4 class="form-section-title">📍 Adresse</h4>
                    <button class="btn-icon" onclick="triggerGPS(${immoIdx})" title="GPS-Position erfassen">
                        📍
                    </button>
                </div>

                <div class="form-row">
                    <div class="form-group flex-2">
                        <label class="form-label">Straße</label>
                        <input type="text" class="form-input"
                               id="adresse-strasse-${immoIdx}"
                               value="${immo.adresse.strasse || ''}"
                               placeholder="z.B. Hauptstraße"
                               onchange="updateImmobilieField(${immoIdx}, 'adresse.strasse', this.value)">
                    </div>
                    <div class="form-group flex-1">
                        <label class="form-label">Nr.</label>
                        <input type="text" class="form-input"
                               id="adresse-hausnummer-${immoIdx}"
                               value="${immo.adresse.hausnummer || ''}"
                               placeholder="123"
                               onchange="updateImmobilieField(${immoIdx}, 'adresse.hausnummer', this.value)">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group flex-1">
                        <label class="form-label">PLZ</label>
                        <input type="text" class="form-input"
                               id="adresse-plz-${immoIdx}"
                               value="${immo.adresse.plz || ''}"
                               placeholder="12345"
                               inputmode="numeric"
                               onchange="updateImmobilieField(${immoIdx}, 'adresse.plz', this.value)">
                    </div>
                    <div class="form-group flex-2">
                        <label class="form-label">Ort</label>
                        <input type="text" class="form-input"
                               id="adresse-ort-${immoIdx}"
                               value="${immo.adresse.ort || ''}"
                               placeholder="z.B. Berlin"
                               onchange="updateImmobilieField(${immoIdx}, 'adresse.ort', this.value)">
                    </div>
                </div>

                ${renderGPSInfo(immo.adresse)}
            </div>

            <!-- Objektaufnahme-Daten -->
            <div class="form-section">
                <h4 class="form-section-title">📅 Objektaufnahme</h4>

                <div class="form-group">
                    <label class="form-label">Datum der Objektaufnahme</label>
                    <input type="date" class="form-input"
                           id="datum-objektaufnahme-${immoIdx}"
                           value="${immo.datumObjektaufnahme || ''}"
                           max="${getTodayISO()}"
                           onchange="updateImmobilieField(${immoIdx}, 'datumObjektaufnahme', this.value)">
                </div>

                <div class="form-group">
                    <label class="form-label">FassadenFix Mitarbeiter</label>
                    <select class="form-input"
                            id="ff-mitarbeiter-${immoIdx}"
                            onchange="updateImmobilieField(${immoIdx}, 'ffMitarbeiter', this.value)">
                        <option value="">-- Bitte wählen --</option>
                        ${Object.entries(FF_MITARBEITER).map(([id, mitarbeiter]) => `
                            <option value="${id}" ${immo.ffMitarbeiter === id ? 'selected' : ''}>
                                ${mitarbeiter.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- AG-Mitarbeiter (optional) -->
            <div class="form-section">
                <h4 class="form-section-title">👤 Anwesender Kunde (optional)</h4>

                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input"
                           id="ag-name-${immoIdx}"
                           value="${immo.agMitarbeiter.name || ''}"
                           placeholder="z.B. Max Mustermann"
                           onchange="updateImmobilieField(${immoIdx}, 'agMitarbeiter.name', this.value)">
                </div>

                <div class="form-row">
                    <div class="form-group flex-1">
                        <label class="form-label">E-Mail</label>
                        <input type="email" class="form-input"
                               id="ag-email-${immoIdx}"
                               value="${immo.agMitarbeiter.email || ''}"
                               placeholder="max@beispiel.de"
                               onchange="updateImmobilieField(${immoIdx}, 'agMitarbeiter.email', this.value)">
                    </div>
                    <div class="form-group flex-1">
                        <label class="form-label">Telefon</label>
                        <input type="tel" class="form-input"
                               id="ag-telefon-${immoIdx}"
                               value="${immo.agMitarbeiter.telefon || ''}"
                               placeholder="+49 ..."
                               onchange="updateImmobilieField(${immoIdx}, 'agMitarbeiter.telefon', this.value)">
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Rendert Seiten-Card (Preview)
 * @param {string} seiteKey - Seiten-Key
 * @param {object} seite - Seite
 * @param {number} immoIdx - Immobilien-Index
 * @returns {string} HTML
 */
function renderSeiteCard(seiteKey, seite, immoIdx) {
    const seitenTyp = SEITEN_TYPEN[seiteKey];

    // Status-Klasse bestimmen
    const statusClass = seite.zuReinigen === true ? 'seite-card-aktiv' :
                       seite.zuReinigen === false ? 'seite-card-inaktiv' :
                       'seite-card-undecided';

    const statusBadge = seite.zuReinigen === true ? '✓ Im Angebot' :
                       seite.zuReinigen === false ? '✗ Nicht im Angebot' :
                       '⏳ Entscheidung offen';

    return `
        <div class="seite-card ${statusClass}" onclick="editSeite(${immoIdx}, '${seiteKey}')">
            <div class="seite-card-header">
                <span class="seite-card-icon">${seitenTyp.icon}</span>
                <span class="seite-card-title">${seitenTyp.label}</span>
            </div>
            <div class="seite-card-body">
                <div class="seite-card-status">
                    ${statusBadge}
                </div>
                ${seite.flaeche > 0 ? `
                    <div class="seite-card-flaeche">
                        ${formatFlaeche(seite.flaeche)}
                    </div>
                ` : `
                    <div class="seite-card-hint">
                        ${seite.zuReinigen === null ? 'Noch nicht erfasst' : 'Keine Fläche'}
                    </div>
                `}
            </div>
        </div>
    `;
}

/**
 * Bindet Event-Listener für Detail-View
 * @param {number} immoIdx - Immobilien-Index
 */
function bindDetailEvents(immoIdx) {
    // Auto-Save bei Änderungen (bereits durch onchange)
    console.log('[Detail] Events gebunden für Immobilie', immoIdx);
}

/**
 * Aktualisiert Immobilien-Feld
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} field - Feldpfad (z.B. 'adresse.strasse')
 * @param {*} value - Neuer Wert
 */
async function updateImmobilieField(immoIdx, field, value) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) return;

    // Wert im Objekt setzen (nested path)
    const keys = field.split('.');
    let current = immo;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    // Speichern
    await storageManager.saveImmobilie(immo);

    // State-Update
    updateState('immobilien', AppState.immobilien);

    console.log(`[Detail] Updated: ${field} = ${value}`);
}

/**
 * Bearbeitet Seite (navigiert zu Seiten-Form)
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 */
function editSeite(immoIdx, seiteKey) {
    updateState('ui.currentImmoIndex', immoIdx);
    updateState('ui.currentSeiteKey', seiteKey);
    updateState('ui.currentStep', 'seite-form');

    // Rendert Seiten-Form
    if (typeof renderSeitenForm === 'function') {
        renderSeitenForm(immoIdx, seiteKey);
    } else {
        showToast('Seiten-Erfassung wird in Phase 2.3 implementiert', 'info');
    }
}

/**
 * Triggert GPS-Erfassung
 * @param {number} immoIdx - Immobilien-Index
 */
async function triggerGPS(immoIdx) {
    // Verwendet die neue captureGPSForImmobilie() Funktion aus geolocation.js
    await captureGPSForImmobilie(immoIdx);
}

/**
 * Navigiert zurück zur Liste
 */
function navigateToList() {
    updateState('ui.currentStep', 'list');
    updateState('ui.currentImmoIndex', null);
    updateState('ui.currentSeiteKey', null);

    renderImmobilienList();
}
