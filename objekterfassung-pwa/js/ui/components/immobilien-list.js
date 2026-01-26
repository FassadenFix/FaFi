// ============================================
// IMMOBILIEN-LISTE
// Card-basiertes Layout mit Touch-Optimierung
// ============================================

/**
 * Rendert die Immobilien-Liste
 */
function renderImmobilienList() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Stats berechnen
    const stats = getStats(AppState.immobilien);
    const validation = validateBlock(AppState.immobilien);

    // HTML generieren
    mainContent.innerHTML = `
        <div class="immobilien-list-container">
            <!-- Header mit Statistiken -->
            <div class="list-header">
                <h2 class="list-title">Objekterfassung</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.anzahlImmobilien}</div>
                        <div class="stat-label">Immobilie(n)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.gesamtFlaeche.toLocaleString('de-DE')}</div>
                        <div class="stat-label">m² gesamt</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.aktiveSeitenCount}</div>
                        <div class="stat-label">Aktive Seiten</div>
                    </div>
                    <div class="stat-card ${stats.undecidedCount > 0 ? 'stat-warning' : 'stat-success'}">
                        <div class="stat-value">${stats.undecidedCount}</div>
                        <div class="stat-label">Offen</div>
                    </div>
                </div>
            </div>

            <!-- Immobilien-Karten -->
            <div class="immobilien-cards">
                ${AppState.immobilien.map((immo, idx) => renderImmobilieCard(immo, idx)).join('')}
            </div>

            <!-- Vollständigkeits-Check -->
            ${renderCompletionStatus(validation)}
        </div>
    `;

    // Event-Listener binden
    bindImmobilienListEvents();

    // FAB anzeigen
    const fab = document.getElementById('fab');
    if (fab) {
        fab.style.display = 'flex';
    }

    // Back-Button verstecken
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.style.display = 'none';
    }

    // Globale Completion-Status anzeigen
    updateGlobalCompletionStatus();
}

/**
 * Rendert eine Immobilien-Karte
 * @param {object} immo - Immobilie
 * @param {number} idx - Index
 * @returns {string} HTML
 */
function renderImmobilieCard(immo, idx) {
    const immoFlaeche = getImmobilieGesamtflaeche(immo);
    const adresse = getFormattedAdresse(immo.adresse) || 'Keine Adresse angegeben';

    // Seiten-Status zählen
    let seitenEntschieden = 0;
    let seitenAktiv = 0;
    Object.values(immo.seiten).forEach(seite => {
        if (seite.zuReinigen !== null) seitenEntschieden++;
        if (seite.zuReinigen === true) seitenAktiv++;
    });

    const alleSeitenEntschieden = seitenEntschieden === 4;
    const statusClass = alleSeitenEntschieden ?
        (seitenAktiv > 0 ? 'status-complete' : 'status-incomplete') :
        'status-pending';

    const statusIcon = alleSeitenEntschieden ?
        (seitenAktiv > 0 ? '✓' : '✗') :
        '⏳';

    return `
        <div class="immo-card ${statusClass}" data-immo-idx="${idx}">
            <div class="immo-card-header">
                <div class="immo-number">
                    <span class="immo-icon">🏢</span>
                    <span class="immo-title">Immobilie ${immo.nummer}</span>
                </div>
                <div class="immo-status">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${seitenEntschieden}/4 Seiten</span>
                </div>
            </div>

            <div class="immo-card-body">
                <div class="immo-address">
                    📍 ${adresse}
                </div>

                <div class="immo-stats">
                    <div class="immo-stat">
                        <span class="immo-stat-label">Fläche:</span>
                        <span class="immo-stat-value">${immoFlaeche > 0 ? formatFlaeche(immoFlaeche) : '-'}</span>
                    </div>
                    <div class="immo-stat">
                        <span class="immo-stat-label">Aktive Seiten:</span>
                        <span class="immo-stat-value">${seitenAktiv}/4</span>
                    </div>
                    ${immo.datumObjektaufnahme ? `
                        <div class="immo-stat">
                            <span class="immo-stat-label">Datum:</span>
                            <span class="immo-stat-value">${formatDate(immo.datumObjektaufnahme)}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Seiten-Icons -->
                <div class="seiten-icons">
                    ${Object.entries(immo.seiten).map(([key, seite]) => {
                        const seitenTyp = SEITEN_TYPEN[key];
                        const statusClass = seite.zuReinigen === true ? 'seite-aktiv' :
                                          seite.zuReinigen === false ? 'seite-inaktiv' :
                                          'seite-undecided';
                        return `
                            <div class="seite-icon ${statusClass}" title="${seitenTyp.label}">
                                ${seitenTyp.icon}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="immo-card-footer">
                <button class="btn-secondary btn-small" onclick="editImmobilie(${idx})">
                    ✏️ Bearbeiten
                </button>
                ${AppState.immobilien.length > 1 ? `
                    <button class="btn-danger btn-small" onclick="confirmDeleteImmobilie(${idx})">
                        🗑️ Löschen
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Rendert Vollständigkeits-Status
 * @param {object} validation - Validierungsergebnis
 * @returns {string} HTML
 */
function renderCompletionStatus(validation) {
    if (validation.valid) {
        return `
            <div class="completion-card completion-success">
                <div class="completion-icon">✅</div>
                <div class="completion-content">
                    <h3>Objekterfassung vollständig!</h3>
                    <p>Alle Immobilien sind erfasst und können exportiert werden.</p>
                    <button class="btn-primary btn-large" onclick="showExportDialog()">
                        📤 Daten exportieren
                    </button>
                </div>
            </div>
        `;
    } else {
        const messages = [];
        if (validation.undecidedCount > 0) {
            messages.push(`${validation.undecidedCount} Seite(n) noch nicht entschieden`);
        }
        if (validation.aktiveSeitenCount === 0) {
            messages.push('Mindestens 1 Seite zur Reinigung auswählen');
        }

        return `
            <div class="completion-card completion-warning">
                <div class="completion-icon">⚠️</div>
                <div class="completion-content">
                    <h3>Noch nicht vollständig</h3>
                    <ul class="completion-issues">
                        ${messages.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                    <p class="completion-hint">Bearbeiten Sie die Immobilien, um fortzufahren.</p>
                </div>
            </div>
        `;
    }
}

/**
 * Bindet Event-Listener
 */
function bindImmobilienListEvents() {
    // Card-Klick für Details
    document.querySelectorAll('.immo-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Nur bei Klick auf Card-Body, nicht auf Buttons
            if (!e.target.closest('button')) {
                const idx = parseInt(card.dataset.immoIdx);
                editImmobilie(idx);
            }
        });
    });
}

/**
 * Bearbeitet Immobilie (navigiert zu Detail-View)
 * @param {number} idx - Immobilien-Index
 */
function editImmobilie(idx) {
    updateState('ui.currentImmoIndex', idx);
    updateState('ui.currentStep', 'immo-detail');

    // Rendert Detail-View
    if (typeof renderImmobilienDetail === 'function') {
        renderImmobilienDetail(idx);
    } else {
        showToast('Detail-View wird in Kürze implementiert', 'info');
    }
}

/**
 * Löscht Immobilie mit Bestätigung
 * @param {number} idx - Immobilien-Index
 */
function confirmDeleteImmobilie(idx) {
    const immo = AppState.immobilien[idx];
    const adresse = getFormattedAdresse(immo.adresse) || `Immobilie ${immo.nummer}`;

    if (confirm(`Immobilie "${adresse}" wirklich löschen?`)) {
        deleteImmobilie(idx);
    }
}

/**
 * Löscht Immobilie
 * @param {number} idx - Immobilien-Index
 */
async function deleteImmobilie(idx) {
    const immo = AppState.immobilien[idx];

    // Aus Array entfernen
    AppState.immobilien.splice(idx, 1);

    // Nummern neu vergeben
    AppState.immobilien.forEach((immo, i) => {
        immo.nummer = i + 1;
    });

    // Aus Storage löschen
    await storageManager.deleteImmobilie(immo.id);

    // State-Update triggern
    updateState('immobilien', AppState.immobilien);

    // UI neu rendern
    renderImmobilienList();

    showToast('Immobilie gelöscht', 'success');
}

/**
 * Zeigt Export-Dialog
 * (Implementation in export.js)
 */
