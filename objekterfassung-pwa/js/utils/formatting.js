// ============================================
// FORMATTING UTILITIES
// Aus app.js übernommen
// ============================================

/**
 * Formatiert Zahl als Währung (EUR)
 * @param {number} value - Wert in Euro
 * @returns {string} Formatierter Währungsbetrag
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

/**
 * Formatiert Datum als deutschen String
 * @param {string|Date} date - Datum
 * @returns {string} Formatiertes Datum (DD.MM.YYYY)
 */
function formatDate(date) {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    return new Intl.DateFormat('de-DE').format(d);
}

/**
 * Formatiert Fläche mit m²
 * @param {number} flaeche - Fläche in m²
 * @returns {string} Formatierte Fläche
 */
function formatFlaeche(flaeche) {
    return `${flaeche.toLocaleString('de-DE')} m²`;
}

/**
 * Generiert UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Formatiert Dateigröße
 * @param {number} bytes - Größe in Bytes
 * @returns {string} Formatierte Größe
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatiert Zeitdauer (Sekunden)
 * @param {number} seconds - Dauer in Sekunden
 * @returns {string} Formatierte Dauer (MM:SS)
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Aktuelles Datum als YYYY-MM-DD String
 * @returns {string} Datum im ISO-Format
 */
function getTodayISO() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}
