// ============================================
// GLOBAL ERROR HANDLER
// Zentrale Fehlerbehandlung mit User-Feedback
// ============================================

/**
 * Globaler Error Handler
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.init();
    }

    /**
     * Initialisiert globale Error-Handler
     */
    init() {
        // Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[ErrorHandler] Unhandled Promise Rejection:', event.reason);
            this.handleError(event.reason, 'promise');
            event.preventDefault();
        });

        // Global Error Handler
        window.addEventListener('error', (event) => {
            console.error('[ErrorHandler] Global Error:', event.error);
            this.handleError(event.error, 'global');
        });

        // Service Worker Errors
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('error', (event) => {
                console.error('[ErrorHandler] Service Worker Error:', event);
                this.handleError(event, 'sw');
            });
        }

        console.log('[ErrorHandler] Initialized');
    }

    /**
     * Behandelt Fehler
     * @param {Error|string} error - Fehler
     * @param {string} source - Fehlerquelle
     */
    handleError(error, source = 'unknown') {
        const errorObj = {
            message: error?.message || String(error),
            stack: error?.stack,
            source,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            online: navigator.onLine
        };

        // In Array speichern (für Debugging)
        this.errors.push(errorObj);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // User-freundliche Nachricht zeigen
        const userMessage = this.getUserMessage(error, source);
        if (userMessage && typeof showToast === 'function') {
            showToast(userMessage, 'error');
        }

        // Optional: An Backend senden (wenn implementiert)
        this.reportError(errorObj);
    }

    /**
     * Gibt user-freundliche Fehlermeldung zurück
     * @param {Error|string} error - Fehler
     * @param {string} source - Quelle
     * @returns {string|null} User-Message
     */
    getUserMessage(error, source) {
        const message = error?.message || String(error);

        // Network Errors
        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            return navigator.onLine
                ? 'Verbindungsproblem. Bitte später erneut versuchen.'
                : 'Keine Internetverbindung. Daten werden lokal gespeichert.';
        }

        // QuotaExceededError
        if (message.includes('QuotaExceededError') || message.includes('quota')) {
            return 'Speicher voll. Bitte alte Daten exportieren und löschen.';
        }

        // NotAllowedError (Camera/Mikrofon)
        if (message.includes('NotAllowedError')) {
            return 'Zugriff verweigert. Bitte Berechtigung in den Einstellungen aktivieren.';
        }

        // NotFoundError (Camera/Mikrofon)
        if (message.includes('NotFoundError') && source === 'camera') {
            return 'Kamera nicht gefunden. Ist ein Gerät angeschlossen?';
        }

        // HubSpot Errors
        if (message.includes('HubSpot') || source === 'hubspot') {
            return 'HubSpot nicht verfügbar. Daten können manuell eingegeben werden.';
        }

        // IndexedDB Errors
        if (message.includes('IDBDatabase')) {
            return 'Datenbank-Fehler. Bitte App neu laden.';
        }

        // Generischer Fehler (nur bei kritischen Fehlern anzeigen)
        if (source === 'global' || source === 'promise') {
            return 'Ein Fehler ist aufgetreten. Bitte App neu laden.';
        }

        return null; // Keine Toast-Nachricht
    }

    /**
     * Sendet Fehler an Backend (optional)
     * @param {object} errorObj - Fehler-Objekt
     */
    async reportError(errorObj) {
        // Nur kritische Fehler senden
        if (!this.shouldReport(errorObj)) {
            return;
        }

        try {
            // Optional: Backend-Endpoint für Error-Reporting
            if (typeof fetch === 'function' && errorObj.source === 'global') {
                await fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorObj)
                }).catch(() => {
                    // Ignore reporting errors
                });
            }
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Prüft ob Fehler gesendet werden soll
     * @param {object} errorObj - Fehler
     * @returns {boolean}
     */
    shouldReport(errorObj) {
        // Nicht senden bei Offline
        if (!navigator.onLine) return false;

        // Nicht senden bei bekannten harmlosen Fehlern
        const harmlessErrors = [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection',
            'Load failed' // Service Worker
        ];

        return !harmlessErrors.some(msg =>
            errorObj.message.includes(msg)
        );
    }

    /**
     * Gibt alle Fehler zurück (für Debugging)
     * @returns {Array} Fehler-Array
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Löscht alle Fehler
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Exportiert Fehler als JSON
     * @returns {string} JSON-String
     */
    exportErrors() {
        return JSON.stringify({
            errors: this.errors,
            exportDate: new Date().toISOString(),
            userAgent: navigator.userAgent
        }, null, 2);
    }
}

// Globale Instanz
const errorHandler = new ErrorHandler();

/**
 * Wrapper für async Funktionen mit Error-Handling
 * @param {Function} fn - Async-Funktion
 * @param {string} context - Kontext für Fehler
 * @returns {Function} Wrapped Funktion
 */
function withErrorHandling(fn, context = 'unknown') {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            console.error(`[${context}] Error:`, error);
            errorHandler.handleError(error, context);
            throw error; // Re-throw für weitere Behandlung
        }
    };
}

/**
 * Retry-Mechanismus für fehleranfällige Operationen
 * @param {Function} fn - Funktion
 * @param {number} maxRetries - Max. Versuche
 * @param {number} delay - Verzögerung zwischen Versuchen (ms)
 * @returns {Promise<*>} Ergebnis
 */
async function retryOperation(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`[Retry] Attempt ${i + 1}/${maxRetries} failed:`, error.message);

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError;
}
