// ============================================
// FASSADENFIX OBJEKTERFASSUNG PWA
// Haupt-Initialisierung
// ============================================

/**
 * App-Initialisierung
 */
async function initApp() {
    console.log('🚀 FassadenFix Objekterfassung PWA wird gestartet...');

    try {
        // 1. Storage initialisieren
        await storageManager.init();
        console.log('✓ Storage initialisiert');

        // 2. Immobilien aus Storage laden
        const immobilien = await storageManager.getAllImmobilien();

        if (immobilien.length > 0) {
            AppState.immobilien = immobilien;
            console.log(`✓ ${immobilien.length} Immobilie(n) geladen`);
        } else {
            // Erste Immobilie erstellen
            AppState.immobilien = [createEmptyImmobilie(1)];
            await storageManager.saveImmobilie(AppState.immobilien[0]);
            console.log('✓ Erste Immobilie erstellt');
        }

        // 3. UI initialisieren
        initUI();
        console.log('✓ UI initialisiert');

        // 4. State als initialisiert markieren
        AppState.meta.initialized = true;
        AppState.session.startTime = new Date().toISOString();

        // 5. Online-Status prüfen
        AppState.session.online = navigator.onLine;
        updateOfflineIndicator();

        console.log('✅ App erfolgreich gestartet!');

        // 6. Storage-Quota prüfen
        checkStorageQuota();

    } catch (error) {
        console.error('❌ Fehler beim App-Start:', error);
        showError('Fehler beim Laden der App. Bitte Seite neu laden.');
    }
}

/**
 * UI initialisieren
 */
function initUI() {
    // Loading-Screen entfernen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    // Immobilien-Liste rendern
    if (typeof renderImmobilienList === 'function') {
        renderImmobilienList();
    } else {
        // Platzhalter für Phase 2
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="padding: 24px; text-align: center;">
                    <h2 style="color: var(--ff-green); margin-bottom: 16px;">
                        ✓ Phase 1: Foundation abgeschlossen!
                    </h2>
                    <p style="margin-bottom: 24px;">
                        Storage-Layer ist funktionsfähig.<br>
                        ${AppState.immobilien.length} Immobilie(n) verfügbar.
                    </p>
                    <div style="background: var(--ff-light-gray); padding: 16px; border-radius: var(--ff-radius-md); margin: 0 auto; max-width: 400px;">
                        <h3 style="margin-bottom: 12px;">Nächste Schritte:</h3>
                        <ul style="text-align: left; line-height: 1.8;">
                            <li>✅ Projekt-Setup komplett</li>
                            <li>✅ Core-Module übernommen</li>
                            <li>✅ Storage-Layer implementiert</li>
                            <li>⏳ Phase 2: Mobile UI (in Planung)</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // FAB-Button anzeigen
    const fab = document.getElementById('fab');
    if (fab) {
        fab.style.display = 'flex';
        fab.onclick = () => {
            console.log('Neue Immobilie erstellen');
            addImmobilie();
        };
    }

    // Sync-Button
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
        syncButton.onclick = () => {
            console.log('Sync triggern');
            triggerSync();
        };
    }

    // Back-Button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.onclick = () => {
            console.log('Zurück');
            navigateBack();
        };
    }
}

/**
 * Neue Immobilie hinzufügen
 */
async function addImmobilie() {
    const newNummer = AppState.immobilien.length + 1;
    const newImmo = createEmptyImmobilie(newNummer);

    AppState.immobilien.push(newImmo);
    await storageManager.saveImmobilie(newImmo);

    // State-Update triggern
    updateState('immobilien', AppState.immobilien);

    showToast('Neue Immobilie hinzugefügt', 'success');
    console.log('Neue Immobilie:', newImmo.id);
}

/**
 * Offline-Indicator aktualisieren
 */
function updateOfflineIndicator() {
    const indicator = document.getElementById('offlineIndicator');
    if (indicator) {
        indicator.style.display = AppState.session.online ? 'none' : 'block';
    }
}

/**
 * Storage-Quota prüfen
 */
async function checkStorageQuota() {
    const quota = await storageManager.checkQuota();

    if (quota.percentage > 80) {
        showToast(`Speicher zu ${Math.round(quota.percentage)}% voll`, 'warning');
    }

    console.log(`📊 Storage: ${quota.usageFormatted} / ${quota.quotaFormatted} (${Math.round(quota.percentage)}%)`);
}

/**
 * Toast-Benachrichtigung anzeigen
 * @param {string} message - Nachricht
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        background: var(--status-${type});
        color: white;
        padding: 12px 20px;
        border-radius: var(--ff-radius-md);
        margin-bottom: 8px;
        box-shadow: var(--ff-shadow-lg);
        animation: slideIn 0.3s ease;
    `;

    container.appendChild(toast);

    // Nach 3 Sekunden entfernen
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Fehler-Anzeige
 * @param {string} message - Fehlermeldung
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * Sync triggern (Platzhalter für Phase 4)
 */
function triggerSync() {
    if (!AppState.session.online) {
        showToast('Offline - Sync nicht möglich', 'warning');
        return;
    }

    showToast('Sync wird in Phase 4 implementiert', 'info');
}

/**
 * Navigation zurück (Platzhalter für Phase 2)
 */
function navigateBack() {
    console.log('Navigation zurück - wird in Phase 2 implementiert');
}

// ============================================
// STATE-CHANGE LISTENERS
// ============================================

// Immobilien-Änderungen
onStateChange('immobilien', async (detail) => {
    console.log('[App] Immobilien geändert');

    // Stats neu berechnen
    const stats = getStats(AppState.immobilien);
    console.log('[App] Stats:', stats);

    // UI aktualisieren (wenn vorhanden)
    if (typeof renderImmobilienList === 'function') {
        renderImmobilienList();
    }
});

// Online-Status-Änderungen
onStateChange('session.online', (detail) => {
    console.log('[App] Online-Status:', detail.value);
    updateOfflineIndicator();

    if (detail.value) {
        showToast('Wieder online', 'success');
        triggerSync();
    } else {
        showToast('Offline-Modus aktiv', 'warning');
    }
});

// ============================================
// APP START
// ============================================

// App starten wenn DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
