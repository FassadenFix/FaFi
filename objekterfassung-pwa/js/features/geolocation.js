// ============================================
// GPS-INTEGRATION
// Geolocation API mit Genauigkeits-Tracking
// ============================================

/**
 * GPS-Manager für Koordinaten-Erfassung
 */
class GeolocationManager {
    constructor() {
        this.watchId = null;
        this.lastPosition = null;
    }

    /**
     * Prüft GPS-Verfügbarkeit
     * @returns {boolean}
     */
    isAvailable() {
        return 'geolocation' in navigator;
    }

    /**
     * Holt aktuelle Position (einmalig)
     * @param {object} options - Geolocation-Optionen
     * @returns {Promise<object>} Position-Objekt
     */
    async getCurrentPosition(options = {}) {
        if (!this.isAvailable()) {
            throw new Error('Geolocation API nicht verfügbar');
        }

        const defaultOptions = {
            enableHighAccuracy: true,  // High-Accuracy GPS
            timeout: 10000,            // 10 Sekunden Timeout
            maximumAge: 0              // Keine gecachte Position verwenden
        };

        const finalOptions = { ...defaultOptions, ...options };

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const result = this._parsePosition(position);
                    this.lastPosition = result;
                    console.log('[GPS] Position erfasst:', result);
                    resolve(result);
                },
                (error) => {
                    const errorMessage = this._handleError(error);
                    console.error('[GPS] Fehler:', errorMessage);
                    reject(new Error(errorMessage));
                },
                finalOptions
            );
        });
    }

    /**
     * Überwacht Position kontinuierlich
     * @param {function} callback - Callback für Position-Updates
     * @param {object} options - Geolocation-Optionen
     */
    watchPosition(callback, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('Geolocation API nicht verfügbar');
        }

        // Beende vorheriges Tracking
        if (this.watchId !== null) {
            this.stopWatching();
        }

        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000  // Max 5 Sekunden alte Position akzeptieren
        };

        const finalOptions = { ...defaultOptions, ...options };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const result = this._parsePosition(position);
                this.lastPosition = result;
                callback(result, null);
            },
            (error) => {
                const errorMessage = this._handleError(error);
                callback(null, errorMessage);
            },
            finalOptions
        );

        console.log('[GPS] Tracking gestartet:', this.watchId);
    }

    /**
     * Stoppt Position-Tracking
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            console.log('[GPS] Tracking gestoppt');
            this.watchId = null;
        }
    }

    /**
     * Parst Geolocation Position-Objekt
     * @private
     * @param {GeolocationPosition} position
     * @returns {object} Vereinfachtes Position-Objekt
     */
    _parsePosition(position) {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
        const timestamp = new Date(position.timestamp).toISOString();

        return {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),  // Genauigkeit in Metern
            altitude: altitude !== null ? Math.round(altitude) : null,
            altitudeAccuracy: altitudeAccuracy !== null ? Math.round(altitudeAccuracy) : null,
            heading: heading !== null ? Math.round(heading) : null,
            speed: speed !== null ? Math.round(speed * 3.6) : null,  // m/s → km/h
            timestamp: timestamp,
            quality: this._getQualityRating(accuracy)
        };
    }

    /**
     * Bewertet GPS-Genauigkeit
     * @private
     * @param {number} accuracy - Genauigkeit in Metern
     * @returns {string} 'excellent', 'good', 'fair', 'poor'
     */
    _getQualityRating(accuracy) {
        if (accuracy <= 10) return 'excellent';  // ≤ 10m: Ausgezeichnet
        if (accuracy <= 20) return 'good';       // ≤ 20m: Gut
        if (accuracy <= 50) return 'fair';       // ≤ 50m: Akzeptabel
        return 'poor';                           // > 50m: Schlecht
    }

    /**
     * Behandelt Geolocation-Fehler
     * @private
     * @param {GeolocationPositionError} error
     * @returns {string} Benutzerfreundliche Fehlermeldung
     */
    _handleError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'GPS-Zugriff verweigert. Bitte Berechtigung in den Einstellungen aktivieren.';
            case error.POSITION_UNAVAILABLE:
                return 'GPS-Position nicht verfügbar. Bitte im Freien versuchen.';
            case error.TIMEOUT:
                return 'GPS-Timeout. Position konnte nicht rechtzeitig ermittelt werden.';
            default:
                return `GPS-Fehler: ${error.message}`;
        }
    }

    /**
     * Berechnet Distanz zwischen zwei Koordinaten (Haversine-Formel)
     * @param {number} lat1 - Breitengrad Punkt 1
     * @param {number} lng1 - Längengrad Punkt 1
     * @param {number} lat2 - Breitengrad Punkt 2
     * @param {number} lng2 - Längengrad Punkt 2
     * @returns {number} Distanz in Metern
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Erdradius in Metern
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c); // Distanz in Metern
    }

    /**
     * Formatiert Koordinaten für Google Maps URL
     * @param {number} lat - Breitengrad
     * @param {number} lng - Längengrad
     * @returns {string} Google Maps URL
     */
    getGoogleMapsUrl(lat, lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }

    /**
     * Formatiert Koordinaten als Dezimalgrad-String
     * @param {number} lat - Breitengrad
     * @param {number} lng - Längengrad
     * @param {number} precision - Dezimalstellen (default: 6)
     * @returns {string} Formatierte Koordinaten
     */
    formatCoordinates(lat, lng, precision = 6) {
        return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
    }
}

// Globale Instanz
const geolocationManager = new GeolocationManager();

/**
 * Erfasst GPS-Position für Immobilie
 * @param {number} immoIdx - Immobilien-Index
 * @returns {Promise<void>}
 */
async function captureGPSForImmobilie(immoIdx) {
    const immo = AppState.immobilien[immoIdx];
    if (!immo) {
        showToast('Immobilie nicht gefunden', 'error');
        return;
    }

    // GPS-Verfügbarkeit prüfen
    if (!geolocationManager.isAvailable()) {
        showToast('GPS nicht verfügbar auf diesem Gerät', 'error');
        return;
    }

    // Loading-State anzeigen
    showToast('GPS-Position wird ermittelt...', 'info');

    try {
        // Position erfassen
        const position = await geolocationManager.getCurrentPosition();

        // Position in Immobilie speichern
        immo.adresse.lat = position.lat;
        immo.adresse.lng = position.lng;
        immo.adresse.gpsAccuracy = position.accuracy;
        immo.adresse.gpsQuality = position.quality;
        immo.adresse.gpsTimestamp = position.timestamp;
        immo.adresse.verified = true;

        // Speichern
        await storageManager.saveImmobilie(immo);
        updateState('immobilien', AppState.immobilien);

        // Success-Feedback mit Genauigkeit
        const qualityEmoji = {
            'excellent': '🎯',
            'good': '✅',
            'fair': '⚠️',
            'poor': '❌'
        };

        const emoji = qualityEmoji[position.quality] || '📍';
        showToast(`${emoji} GPS erfasst (±${position.accuracy}m)`, 'success');

        // UI aktualisieren
        if (typeof renderImmobilienDetail === 'function') {
            renderImmobilienDetail(immoIdx);
        }

        console.log('[GPS] Position gespeichert:', {
            lat: position.lat,
            lng: position.lng,
            accuracy: position.accuracy,
            quality: position.quality
        });

    } catch (error) {
        console.error('[GPS] Capture-Fehler:', error);
        showToast(error.message, 'error');
    }
}

/**
 * Rendert GPS-Info-Badge
 * @param {object} adresse - Adress-Objekt
 * @returns {string} HTML
 */
function renderGPSInfo(adresse) {
    if (!adresse.lat || !adresse.lng) {
        return `
            <div class="gps-info gps-missing">
                ⚠️ Noch keine GPS-Position erfasst
            </div>
        `;
    }

    const qualityClass = `gps-${adresse.gpsQuality || 'unknown'}`;
    const qualityLabel = {
        'excellent': 'Ausgezeichnet',
        'good': 'Gut',
        'fair': 'Akzeptabel',
        'poor': 'Ungenau'
    }[adresse.gpsQuality] || 'Unbekannt';

    const mapsUrl = geolocationManager.getGoogleMapsUrl(adresse.lat, adresse.lng);

    return `
        <div class="gps-info ${qualityClass}">
            <div class="gps-coords">
                📍 ${geolocationManager.formatCoordinates(adresse.lat, adresse.lng)}
            </div>
            <div class="gps-accuracy">
                Genauigkeit: ±${adresse.gpsAccuracy || '?'}m (${qualityLabel})
            </div>
            ${adresse.gpsTimestamp ? `
                <div class="gps-timestamp">
                    ${formatDate(adresse.gpsTimestamp)}
                </div>
            ` : ''}
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="gps-maps-link">
                🗺️ In Google Maps öffnen
            </a>
        </div>
    `;
}
