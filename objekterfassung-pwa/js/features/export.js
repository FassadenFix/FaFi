// ============================================
// EXPORT
// JSON-Export für Angebotsgenerator-Integration
// ============================================

/**
 * Exportiert alle Immobilien-Daten als JSON
 * @returns {Promise<object>} Export-Daten
 */
async function exportAsJSON() {
    try {
        // Daten aus Storage holen
        const immobilien = AppState.immobilien || [];

        // Stats berechnen
        const stats = getStats(immobilien);

        // Export-Objekt erstellen
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            source: 'objekterfassung-pwa',

            immobilien: immobilien,

            meta: {
                totalImmobilien: immobilien.length,
                totalFlaeche: stats.gesamtFlaeche,
                aktiveSeitenCount: stats.aktiveSeitenCount,
                undecidedCount: stats.undecidedCount,
                totalPhotos: immobilien.reduce((sum, immo) => {
                    return sum + Object.values(immo.seiten).reduce((seitenSum, seite) => {
                        const seitenFotos = seite.fotos?.length || 0;
                        const schadenFotos = Object.values(seite.schaeden).reduce((schadSum, schad) => {
                            return schadSum + (schad.fotos?.length || 0);
                        }, 0);
                        return seitenSum + seitenFotos + schadenFotos;
                    }, 0);
                }, 0),
                totalAudioNotes: immobilien.reduce((sum, immo) => {
                    return sum + Object.values(immo.seiten).reduce((seitenSum, seite) => {
                        return seitenSum + (seite.audioNotes?.length || 0);
                    }, 0);
                }, 0)
            }
        };

        console.log('[Export] Export-Daten erstellt:', exportData.meta);
        return exportData;

    } catch (error) {
        console.error('[Export] Fehler:', error);
        throw error;
    }
}

/**
 * Öffnet Export-Dialog
 */
async function showExportDialog() {
    try {
        // Validierung prüfen
        const validation = validateBlock(AppState.immobilien);

        if (!validation.valid) {
            const messages = [];
            if (validation.undecidedCount > 0) {
                messages.push(`${validation.undecidedCount} Seite(n) noch nicht entschieden`);
            }
            if (validation.aktiveSeitenCount === 0) {
                messages.push('Mindestens 1 Seite zur Reinigung auswählen');
            }

            showToast('⚠️ Export nicht möglich: ' + messages.join(', '), 'error');
            return;
        }

        // Export-Daten vorbereiten
        const exportData = await exportAsJSON();

        // Modal erstellen
        renderExportModal(exportData);

    } catch (error) {
        console.error('[Export] Dialog-Fehler:', error);
        showToast('Fehler beim Export: ' + error.message, 'error');
    }
}

/**
 * Rendert Export-Modal
 * @param {object} exportData - Export-Daten
 */
function renderExportModal(exportData) {
    const existingModal = document.getElementById('export-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'export-modal';
    modal.className = 'export-modal';
    modal.innerHTML = `
        <div class="export-container">
            <div class="export-header">
                <h3>📤 Daten exportieren</h3>
                <button class="export-close-btn" onclick="closeExportModal()">✕</button>
            </div>

            <div class="export-body">
                <!-- Stats -->
                <div class="export-stats">
                    <div class="export-stat-item">
                        <span class="export-stat-value">${exportData.meta.totalImmobilien}</span>
                        <span class="export-stat-label">Immobilie(n)</span>
                    </div>
                    <div class="export-stat-item">
                        <span class="export-stat-value">${exportData.meta.totalFlaeche.toLocaleString('de-DE')}</span>
                        <span class="export-stat-label">m² gesamt</span>
                    </div>
                    <div class="export-stat-item">
                        <span class="export-stat-value">${exportData.meta.aktiveSeitenCount}</span>
                        <span class="export-stat-label">Aktive Seiten</span>
                    </div>
                </div>

                <div class="export-stats">
                    <div class="export-stat-item">
                        <span class="export-stat-value">${exportData.meta.totalPhotos}</span>
                        <span class="export-stat-label">Foto(s)</span>
                    </div>
                    <div class="export-stat-item">
                        <span class="export-stat-value">${exportData.meta.totalAudioNotes}</span>
                        <span class="export-stat-label">Sprachnotiz(en)</span>
                    </div>
                    <div class="export-stat-item">
                        <span class="export-stat-value">${Math.round(JSON.stringify(exportData).length / 1024)}</span>
                        <span class="export-stat-label">KB Größe</span>
                    </div>
                </div>

                <!-- Hinweis -->
                <div class="export-hint">
                    <p>💡 Die Export-Datei enthält alle erfassten Daten im JSON-Format und kann direkt im Angebotsgenerator importiert werden.</p>
                </div>

                <!-- Export-Optionen -->
                <div class="export-options">
                    <button class="btn-primary btn-large" onclick="downloadExportJSON()">
                        💾 Als Datei herunterladen
                    </button>
                    <button class="btn-secondary btn-large" onclick="copyExportToClipboard()">
                        📋 In Zwischenablage kopieren
                    </button>
                </div>
            </div>

            <div class="export-footer">
                <button class="btn-secondary" onclick="closeExportModal()">
                    Schließen
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Export-Daten im Window speichern für Buttons
    window.currentExportData = exportData;
}

/**
 * Lädt Export als JSON-Datei herunter
 */
async function downloadExportJSON() {
    try {
        const exportData = window.currentExportData;
        if (!exportData) {
            throw new Error('Keine Export-Daten vorhanden');
        }

        // JSON-String erstellen
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Dateiname mit Datum
        const date = new Date().toISOString().split('T')[0];
        const filename = `fassadenfix-objekterfassung-${date}.json`;

        // Download triggern
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('✅ Datei heruntergeladen: ' + filename, 'success');

        console.log('[Export] Download erfolgreich:', filename);

    } catch (error) {
        console.error('[Export] Download-Fehler:', error);
        showToast('Fehler beim Download: ' + error.message, 'error');
    }
}

/**
 * Kopiert Export-JSON in Zwischenablage
 */
async function copyExportToClipboard() {
    try {
        const exportData = window.currentExportData;
        if (!exportData) {
            throw new Error('Keine Export-Daten vorhanden');
        }

        const jsonString = JSON.stringify(exportData, null, 2);

        // In Zwischenablage kopieren
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(jsonString);
            showToast('✅ In Zwischenablage kopiert', 'success');
        } else {
            // Fallback für ältere Browser
            const textarea = document.createElement('textarea');
            textarea.value = jsonString;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('✅ In Zwischenablage kopiert', 'success');
        }

        console.log('[Export] In Zwischenablage kopiert');

    } catch (error) {
        console.error('[Export] Clipboard-Fehler:', error);
        showToast('Fehler beim Kopieren: ' + error.message, 'error');
    }
}

/**
 * Schließt Export-Modal
 */
function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.remove();
        delete window.currentExportData;
    }
}

/**
 * Sendet Export an Backend (optional)
 * @param {object} exportData - Export-Daten
 */
async function uploadExportToBackend(exportData) {
    try {
        const response = await fetch('/api/immobilien/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exportData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('[Export] Upload erfolgreich:', result);

        showToast('✅ Daten an Backend gesendet', 'success');

        return result;

    } catch (error) {
        console.error('[Export] Upload-Fehler:', error);
        showToast('Fehler beim Upload: ' + error.message, 'error');
        throw error;
    }
}
