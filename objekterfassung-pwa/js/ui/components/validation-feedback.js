// ============================================
// VALIDATION FEEDBACK & VISUELLES FEEDBACK
// Live-Validierung mit sofortigem User-Feedback
// ============================================

/**
 * Rendert Validierungs-Badge
 * @param {object} validation - Validierungsergebnis von validateSeite()
 * @returns {string} HTML
 */
function renderValidationBadge(validation) {
    if (validation.valid) {
        return `
            <div class="validation-badge validation-success">
                <span class="badge-icon">✓</span>
                <span class="badge-text">Vollständig</span>
            </div>
        `;
    } else {
        return `
            <div class="validation-badge validation-error">
                <span class="badge-icon">!</span>
                <span class="badge-text">${validation.errors.length} Fehler</span>
            </div>
        `;
    }
}

/**
 * Rendert Progress-Indicator für Immobilie (4 Seiten)
 * @param {object} immo - Immobilie
 * @returns {string} HTML
 */
function renderSeiteProgressIndicator(immo) {
    let entschiedenCount = 0;
    let aktivCount = 0;
    const total = 4;

    Object.values(immo.seiten).forEach(seite => {
        if (seite.zuReinigen !== null) entschiedenCount++;
        if (seite.zuReinigen === true) aktivCount++;
    });

    const percentage = (entschiedenCount / total) * 100;
    const statusClass = entschiedenCount === total ? 'progress-complete' :
                       entschiedenCount > 0 ? 'progress-partial' :
                       'progress-empty';

    return `
        <div class="progress-indicator ${statusClass}">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-text">
                ${entschiedenCount}/${total} Seiten entschieden
                ${aktivCount > 0 ? ` • ${aktivCount} aktiv` : ''}
            </div>
        </div>
    `;
}

/**
 * Rendert Inline-Fehler für Formular-Feld
 * @param {string} message - Fehlermeldung
 * @returns {string} HTML
 */
function renderInlineError(message) {
    return `
        <div class="inline-error">
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
        </div>
    `;
}

/**
 * Rendert Inline-Success für Formular-Feld
 * @param {string} message - Erfolgsmeldung
 * @returns {string} HTML
 */
function renderInlineSuccess(message) {
    return `
        <div class="inline-success">
            <span class="success-icon">✓</span>
            <span class="success-text">${message}</span>
        </div>
    `;
}

/**
 * Rendert globalen Completion-Status (Floating Card)
 * @param {Array} immobilien - Alle Immobilien
 * @returns {string} HTML
 */
function renderFloatingCompletionStatus(immobilien) {
    const validation = validateBlock(immobilien);
    const stats = getStats(immobilien);

    if (validation.valid) {
        return `
            <div class="floating-completion floating-success">
                <div class="floating-icon">✅</div>
                <div class="floating-content">
                    <div class="floating-title">Erfassung vollständig!</div>
                    <div class="floating-subtitle">
                        ${stats.anzahlImmobilien} Immobilie(n) • ${stats.aktiveSeitenCount} Seiten • ${formatFlaeche(stats.gesamtFlaeche)}
                    </div>
                </div>
                <button class="floating-action btn-primary btn-small" onclick="showExportDialog()">
                    📤 Exportieren
                </button>
            </div>
        `;
    } else if (validation.undecidedCount > 0 || validation.aktiveSeitenCount === 0) {
        return `
            <div class="floating-completion floating-warning">
                <div class="floating-icon">⏳</div>
                <div class="floating-content">
                    <div class="floating-title">Noch nicht vollständig</div>
                    <div class="floating-subtitle">
                        ${validation.undecidedCount > 0 ? `${validation.undecidedCount} Seite(n) offen` : ''}
                        ${validation.aktiveSeitenCount === 0 ? 'Min. 1 Seite aktiv erforderlich' : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        return '';
    }
}

/**
 * Rendert Seiten-Completion-Card (für Detail-View)
 * @param {object} immo - Immobilie
 * @param {number} immoIdx - Index
 * @returns {string} HTML
 */
function renderSeitenCompletionCard(immo, immoIdx) {
    let entschiedenCount = 0;
    let aktivCount = 0;
    const total = 4;
    const missingSeiten = [];

    Object.entries(immo.seiten).forEach(([key, seite]) => {
        if (seite.zuReinigen === null) {
            missingSeiten.push(SEITEN_TYPEN[key].label);
        } else {
            entschiedenCount++;
            if (seite.zuReinigen === true) aktivCount++;
        }
    });

    const isComplete = entschiedenCount === total && aktivCount > 0;

    if (isComplete) {
        return `
            <div class="completion-status-card completion-success">
                <div class="completion-icon">✅</div>
                <div class="completion-info">
                    <h4 class="completion-title">Alle Seiten erfasst!</h4>
                    <p class="completion-desc">
                        ${aktivCount} von 4 Seiten zur Reinigung markiert
                    </p>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="completion-status-card completion-warning">
                <div class="completion-icon">⚠️</div>
                <div class="completion-info">
                    <h4 class="completion-title">Noch ${4 - entschiedenCount} Seite(n) offen</h4>
                    ${missingSeiten.length > 0 ? `
                        <p class="completion-desc">Fehlend: ${missingSeiten.join(', ')}</p>
                    ` : ''}
                    ${aktivCount === 0 ? `
                        <p class="completion-warning-text">Mindestens 1 Seite zur Reinigung markieren!</p>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

/**
 * Zeigt Live-Validierungs-Feedback in Seiten-Form
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 */
function showLiveValidationFeedback(immoIdx, seiteKey) {
    const seite = AppState.immobilien[immoIdx].seiten[seiteKey];
    const validation = validateSeite(seite);

    // Flächen-Validierung visuell hervorheben
    const flaecheDisplay = document.getElementById(`flaeche-display-${immoIdx}-${seiteKey}`);
    if (flaecheDisplay) {
        const flaecheResult = flaecheDisplay.closest('.flaeche-result');
        if (flaecheResult) {
            if (seite.flaeche > 0) {
                flaecheResult.classList.remove('flaeche-invalid');
                flaecheResult.classList.add('flaeche-valid');
            } else {
                flaecheResult.classList.remove('flaeche-valid');
                flaecheResult.classList.add('flaeche-invalid');
            }
        }
    }

    // Input-Felder visuell markieren
    const breiteInput = document.getElementById(`seite-breite-${immoIdx}-${seiteKey}`);
    const hoeheInput = document.getElementById(`seite-hoehe-${immoIdx}-${seiteKey}`);

    if (seite.zuReinigen === true) {
        if (breiteInput) {
            if (seite.breite > 0) {
                breiteInput.classList.remove('input-error');
                breiteInput.classList.add('input-success');
            } else {
                breiteInput.classList.remove('input-success');
                breiteInput.classList.add('input-error');
            }
        }

        if (hoeheInput) {
            if (seite.hoehe > 0) {
                hoeheInput.classList.remove('input-error');
                hoeheInput.classList.add('input-success');
            } else {
                hoeheInput.classList.remove('input-success');
                hoeheInput.classList.add('input-error');
            }
        }
    }

    // Console-Log für Debugging
    console.log(`[Validation] Seite ${seiteKey}: ${validation.valid ? 'Valid' : 'Invalid'}`, validation);
}

/**
 * Aktualisiert globale Completion-Anzeige
 */
function updateGlobalCompletionStatus() {
    const existingFloating = document.querySelector('.floating-completion');
    if (existingFloating) {
        existingFloating.remove();
    }

    // Nur anzeigen wenn auf List-View
    if (AppState.ui.currentStep === 'list') {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            const floatingHTML = renderFloatingCompletionStatus(AppState.immobilien);
            if (floatingHTML) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = floatingHTML;
                document.body.appendChild(tempDiv.firstElementChild);
            }
        }
    }
}

/**
 * Zeigt kurzes Success-Feedback (Green Check Animation)
 * @param {HTMLElement} element - Element zum Animieren
 */
function showSuccessAnimation(element) {
    if (!element) return;

    element.classList.add('success-pulse');
    setTimeout(() => {
        element.classList.remove('success-pulse');
    }, 600);
}

/**
 * Zeigt kurzes Error-Feedback (Red Shake Animation)
 * @param {HTMLElement} element - Element zum Animieren
 */
function showErrorAnimation(element) {
    if (!element) return;

    element.classList.add('error-shake');
    setTimeout(() => {
        element.classList.remove('error-shake');
    }, 600);
}

/**
 * Rendert Validation-Summary (Liste aller Fehler)
 * @param {object} validation - Validierungsergebnis von validateBlock()
 * @returns {string} HTML
 */
function renderValidationSummary(validation) {
    if (validation.valid) {
        return `
            <div class="validation-summary validation-summary-success">
                <div class="summary-icon">✅</div>
                <div class="summary-content">
                    <h3 class="summary-title">Alle Daten vollständig!</h3>
                    <p class="summary-text">
                        ${validation.aktiveSeitenCount} Seite(n) zur Reinigung erfasst
                    </p>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="validation-summary validation-summary-error">
                <div class="summary-icon">⚠️</div>
                <div class="summary-content">
                    <h3 class="summary-title">Noch ${validation.errors.length} Fehler</h3>
                    <ul class="summary-errors">
                        ${validation.errors.map(err => `<li>${err}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}
