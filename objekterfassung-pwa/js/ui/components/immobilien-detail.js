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
                        <!-- Wird dynamisch aus HubSpot Owners geladen -->
                    </select>
                </div>
            </div>

            <!-- HubSpot Company-Suche -->
            <div class="form-section">
                <h4 class="form-section-title">🏢 Firma (HubSpot)</h4>

                <div class="form-group">
                    <label class="form-label">Firmensuche</label>
                    <div class="search-input-wrapper">
                        <input type="text" class="form-input search-input"
                               id="company-search-${immoIdx}"
                               placeholder="Firmenname eingeben..."
                               onkeyup="debounceCompanySearch(${immoIdx}, this.value)">
                        <div id="company-results-${immoIdx}" class="search-results" style="display: none;"></div>
                    </div>
                    ${immo.hubspotAssociations?.companyId ? `
                        <div class="selected-item">
                            <span class="selected-item-label" id="selected-company-${immoIdx}">
                                Ausgewählt: ${immo.hubspotAssociations.companyName || 'Firma #' + immo.hubspotAssociations.companyId}
                            </span>
                            <button class="btn-icon-small" onclick="clearCompanySelection(${immoIdx})" title="Auswahl löschen">
                                ✕
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- HubSpot Contact-Suche (optional, wird durch Company-Auswahl gefiltert) -->
            <div class="form-section">
                <h4 class="form-section-title">👤 Ansprechpartner (HubSpot - optional)</h4>

                <div class="form-group">
                    <label class="form-label">Kontaktsuche</label>
                    <div class="search-input-wrapper">
                        <input type="text" class="form-input search-input"
                               id="contact-search-${immoIdx}"
                               placeholder="Nachname eingeben..."
                               onkeyup="debounceContactSearch(${immoIdx}, this.value)">
                        <div id="contact-results-${immoIdx}" class="search-results" style="display: none;"></div>
                    </div>
                    ${immo.hubspotAssociations?.contactId ? `
                        <div class="selected-item">
                            <span class="selected-item-label" id="selected-contact-${immoIdx}">
                                Ausgewählt: ${immo.hubspotAssociations.contactName || 'Kontakt #' + immo.hubspotAssociations.contactId}
                            </span>
                            <button class="btn-icon-small" onclick="clearContactSelection(${immoIdx})" title="Auswahl löschen">
                                ✕
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- AG-Mitarbeiter (optional) - Manuelle Eingabe wenn nicht in HubSpot -->
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

    // Lade HubSpot Owners für FF-Mitarbeiter Dropdown
    loadFFMitarbeiterDropdown(immoIdx);
}

/**
 * Lädt HubSpot Owners in FF-Mitarbeiter Dropdown
 * @param {number} immoIdx - Immobilien-Index
 */
async function loadFFMitarbeiterDropdown(immoIdx) {
    const dropdown = document.getElementById(`ff-mitarbeiter-${immoIdx}`);
    if (!dropdown) return;

    const immo = AppState.immobilien[immoIdx];
    const currentValue = immo.ffMitarbeiter;

    try {
        // Lade Owners aus HubSpot (mit Cache)
        const owners = await hubspotIntegration.getOwners();

        // Befülle Dropdown
        dropdown.innerHTML = `
            <option value="">-- Bitte wählen --</option>
            ${owners.map(owner => `
                <option value="${owner.id}" ${currentValue === owner.id ? 'selected' : ''}>
                    ${owner.name || `${owner.firstName} ${owner.lastName}`}
                </option>
            `).join('')}
        `;

        console.log(`[Detail] FF-Mitarbeiter geladen: ${owners.length} Owners`);

    } catch (error) {
        console.error('[Detail] FF-Mitarbeiter load error:', error);

        // Fallback: Statische Liste aus constants.js (falls vorhanden)
        if (typeof FF_MITARBEITER !== 'undefined') {
            dropdown.innerHTML = `
                <option value="">-- Bitte wählen --</option>
                ${Object.entries(FF_MITARBEITER).map(([id, mitarbeiter]) => `
                    <option value="${id}" ${currentValue === id ? 'selected' : ''}>
                        ${mitarbeiter.name}
                    </option>
                `).join('')}
            `;
        } else {
            dropdown.innerHTML = `<option value="">HubSpot nicht verfügbar</option>`;
        }
    }
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

// ============================================
// HUBSPOT INTEGRATION
// ============================================

/**
 * Debounce-Timer für Company-Suche
 */
let companySearchTimer = null;

/**
 * Debounced Company-Suche
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} query - Suchbegriff
 */
function debounceCompanySearch(immoIdx, query) {
    clearTimeout(companySearchTimer);
    companySearchTimer = setTimeout(() => {
        searchCompanies(immoIdx, query);
    }, 300); // 300ms Debounce
}

/**
 * Sucht Companies via HubSpot
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} query - Suchbegriff
 */
async function searchCompanies(immoIdx, query) {
    const resultsContainer = document.getElementById(`company-results-${immoIdx}`);

    if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    try {
        resultsContainer.innerHTML = '<div class="search-loading">🔍 Suche läuft...</div>';
        resultsContainer.style.display = 'block';

        const companies = await hubspotIntegration.searchCompanies(query);

        if (companies.length === 0) {
            resultsContainer.innerHTML = '<div class="search-empty">Keine Firmen gefunden</div>';
            return;
        }

        resultsContainer.innerHTML = companies.map(company => `
            <div class="search-result-item" onclick="selectCompany(${immoIdx}, '${company.id}', '${escapeHtml(company.name)}')">
                <div class="search-result-name">${escapeHtml(company.name)}</div>
                <div class="search-result-meta">
                    ${company.city ? escapeHtml(company.city) : ''}
                    ${company.zip ? '· ' + escapeHtml(company.zip) : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('[HubSpot] Company search error:', error);
        resultsContainer.innerHTML = `<div class="search-error">Fehler: ${error.message}</div>`;
    }
}

/**
 * Wählt Company aus und füllt Felder automatisch
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} companyId - HubSpot Company-ID
 * @param {string} companyName - Company-Name
 */
async function selectCompany(immoIdx, companyId, companyName) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) return;

    try {
        // Loading-Anzeige
        showToast('Lade Firmendaten...', 'info');

        // Company Details laden
        const company = await hubspotIntegration.getCompanyDetails(companyId);

        // HubSpot-Association speichern
        if (!immo.hubspotAssociations) {
            immo.hubspotAssociations = {};
        }
        immo.hubspotAssociations.companyId = companyId;
        immo.hubspotAssociations.companyName = companyName;

        // Adresse auto-fill (wenn leer)
        if (company.address && !immo.adresse.strasse) {
            immo.adresse.strasse = company.address || '';
        }
        if (company.zip && !immo.adresse.plz) {
            immo.adresse.plz = company.zip || '';
        }
        if (company.city && !immo.adresse.ort) {
            immo.adresse.ort = company.city || '';
        }

        // Speichern
        await storageManager.saveImmobilie(immo);
        updateState('immobilien', AppState.immobilien);

        // UI neu rendern
        renderImmobilienDetail(immoIdx);

        showToast(`Firma ausgewählt: ${companyName}`, 'success');

    } catch (error) {
        console.error('[HubSpot] Company selection error:', error);
        showToast('Fehler beim Laden der Firmendaten', 'error');
    }
}

/**
 * Löscht Company-Auswahl
 * @param {number} immoIdx - Immobilien-Index
 */
async function clearCompanySelection(immoIdx) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) return;

    if (!confirm('Firmen-Verknüpfung wirklich löschen?')) return;

    if (immo.hubspotAssociations) {
        delete immo.hubspotAssociations.companyId;
        delete immo.hubspotAssociations.companyName;
    }

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    renderImmobilienDetail(immoIdx);
    showToast('Firmen-Verknüpfung gelöscht', 'success');
}

/**
 * Debounce-Timer für Contact-Suche
 */
let contactSearchTimer = null;

/**
 * Debounced Contact-Suche
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} query - Suchbegriff
 */
function debounceContactSearch(immoIdx, query) {
    clearTimeout(contactSearchTimer);
    contactSearchTimer = setTimeout(() => {
        searchContacts(immoIdx, query);
    }, 300); // 300ms Debounce
}

/**
 * Sucht Contacts via HubSpot
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} query - Suchbegriff
 */
async function searchContacts(immoIdx, query) {
    const resultsContainer = document.getElementById(`contact-results-${immoIdx}`);
    const immo = AppState.immobilien[immoIdx];

    if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    try {
        resultsContainer.innerHTML = '<div class="search-loading">🔍 Suche läuft...</div>';
        resultsContainer.style.display = 'block';

        // Suche optional gefiltert nach ausgewählter Company
        const companyId = immo.hubspotAssociations?.companyId || null;
        const contacts = await hubspotIntegration.searchContacts(query, companyId);

        if (contacts.length === 0) {
            resultsContainer.innerHTML = '<div class="search-empty">Keine Kontakte gefunden</div>';
            return;
        }

        resultsContainer.innerHTML = contacts.map(contact => {
            const name = `${contact.firstname || ''} ${contact.lastname || ''}`.trim();
            const meta = [
                contact.jobtitle,
                contact.email
            ].filter(Boolean).join(' · ');

            return `
                <div class="search-result-item" onclick="selectContact(${immoIdx}, '${contact.id}', '${escapeHtml(name)}', '${escapeHtml(contact.email || '')}', '${escapeHtml(contact.phone || '')}')">
                    <div class="search-result-name">${escapeHtml(name)}</div>
                    ${meta ? `<div class="search-result-meta">${escapeHtml(meta)}</div>` : ''}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('[HubSpot] Contact search error:', error);
        resultsContainer.innerHTML = `<div class="search-error">Fehler: ${error.message}</div>`;
    }
}

/**
 * Wählt Contact aus und füllt AG-Mitarbeiter-Felder
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} contactId - HubSpot Contact-ID
 * @param {string} contactName - Contact-Name
 * @param {string} email - E-Mail
 * @param {string} phone - Telefon
 */
async function selectContact(immoIdx, contactId, contactName, email, phone) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) return;

    // HubSpot-Association speichern
    if (!immo.hubspotAssociations) {
        immo.hubspotAssociations = {};
    }
    immo.hubspotAssociations.contactId = contactId;
    immo.hubspotAssociations.contactName = contactName;

    // AG-Mitarbeiter auto-fill
    if (contactName && !immo.agMitarbeiter.name) {
        immo.agMitarbeiter.name = contactName;
    }
    if (email && !immo.agMitarbeiter.email) {
        immo.agMitarbeiter.email = email;
    }
    if (phone && !immo.agMitarbeiter.telefon) {
        immo.agMitarbeiter.telefon = phone;
    }

    // Speichern
    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    // UI neu rendern
    renderImmobilienDetail(immoIdx);

    showToast(`Kontakt ausgewählt: ${contactName}`, 'success');
}

/**
 * Löscht Contact-Auswahl
 * @param {number} immoIdx - Immobilien-Index
 */
async function clearContactSelection(immoIdx) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) return;

    if (!confirm('Kontakt-Verknüpfung wirklich löschen?')) return;

    if (immo.hubspotAssociations) {
        delete immo.hubspotAssociations.contactId;
        delete immo.hubspotAssociations.contactName;
    }

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    renderImmobilienDetail(immoIdx);
    showToast('Kontakt-Verknüpfung gelöscht', 'success');
}

/**
 * Escaped HTML für sichere Anzeige
 * @param {string} str - String
 * @returns {string} Escaped String
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
