// ============================================
// KAMERA-INTEGRATION
// MediaDevices API + Kompression + Thumbnails
// ============================================

/**
 * Kamera-State
 */
const CameraState = {
    stream: null,
    videoElement: null,
    isActive: false,
    currentContext: null // { immoIdx, seiteKey, schadenTyp? }
};

/**
 * Öffnet Kamera-Modal
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 * @param {string} schadenTyp - Optional: Schaden-Typ (graffiti, loecher, risse)
 */
async function openCamera(immoIdx, seiteKey, schadenTyp = null) {
    // Context speichern
    CameraState.currentContext = { immoIdx, seiteKey, schadenTyp };

    try {
        // Kamera-Zugriff anfordern (Rückkamera bevorzugt)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' }, // Rückkamera
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });

        CameraState.stream = stream;
        CameraState.isActive = true;

        // Modal erstellen
        renderCameraModal();

        // Video-Stream starten
        const video = document.getElementById('camera-video');
        if (video) {
            CameraState.videoElement = video;
            video.srcObject = stream;
            video.play();
        }

        console.log('[Camera] Geöffnet:', { immoIdx, seiteKey, schadenTyp });

    } catch (error) {
        console.error('[Camera] Fehler:', error);

        if (error.name === 'NotAllowedError') {
            showToast('Kamera-Zugriff verweigert', 'error');
        } else if (error.name === 'NotFoundError') {
            showToast('Keine Kamera gefunden', 'error');
        } else {
            showToast('Kamera-Fehler: ' + error.message, 'error');
        }
    }
}

/**
 * Rendert Kamera-Modal
 */
function renderCameraModal() {
    // Entferne existierendes Modal
    const existing = document.getElementById('camera-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'camera-modal';
    modal.className = 'camera-modal';
    modal.innerHTML = `
        <div class="camera-container">
            <!-- Video Preview -->
            <video id="camera-video" class="camera-video" autoplay playsinline></video>

            <!-- Overlay Controls -->
            <div class="camera-overlay">
                <!-- Header -->
                <div class="camera-header">
                    <button class="camera-close-btn" onclick="closeCamera()">
                        ✕
                    </button>
                </div>

                <!-- Footer Controls -->
                <div class="camera-footer">
                    <button class="camera-capture-btn" onclick="capturePhoto()">
                        <span class="capture-icon">📷</span>
                    </button>
                </div>
            </div>

            <!-- Loading Overlay -->
            <div id="camera-processing" class="camera-processing" style="display: none;">
                <div class="spinner"></div>
                <p>Foto wird verarbeitet...</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Schließt Kamera-Modal
 */
function closeCamera() {
    // Stream stoppen
    if (CameraState.stream) {
        CameraState.stream.getTracks().forEach(track => track.stop());
        CameraState.stream = null;
    }

    // Video-Element aufräumen
    if (CameraState.videoElement) {
        CameraState.videoElement.srcObject = null;
        CameraState.videoElement = null;
    }

    // Modal entfernen
    const modal = document.getElementById('camera-modal');
    if (modal) modal.remove();

    CameraState.isActive = false;
    console.log('[Camera] Geschlossen');
}

/**
 * Nimmt Foto auf und verarbeitet es
 */
async function capturePhoto() {
    if (!CameraState.videoElement || !CameraState.isActive) {
        showToast('Kamera nicht aktiv', 'error');
        return;
    }

    // Processing-Overlay anzeigen
    const processingOverlay = document.getElementById('camera-processing');
    if (processingOverlay) {
        processingOverlay.style.display = 'flex';
    }

    try {
        // Foto vom Video-Element aufnehmen
        const canvas = document.createElement('canvas');
        const video = CameraState.videoElement;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Kompression: JPEG 85%, max 1920px
        const compressedBlob = await compressImage(canvas, 0.85, 1920);
        const compressedDataUrl = await blobToDataUrl(compressedBlob);

        // Thumbnail: max 200px
        const thumbnailBlob = await compressImage(canvas, 0.8, 200);
        const thumbnailDataUrl = await blobToDataUrl(thumbnailBlob);

        // Foto-Objekt erstellen
        const photo = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: compressedDataUrl,
            thumbnail: thumbnailDataUrl,
            timestamp: new Date().toISOString(),
            originalSize: canvas.width * canvas.height * 4, // Approx
            compressedSize: compressedBlob.size,
            width: canvas.width,
            height: canvas.height
        };

        // Foto speichern
        await saveCapturedPhoto(photo);

        // Success-Feedback
        showToast('Foto aufgenommen', 'success');

        // Kamera schließen
        closeCamera();

        // UI aktualisieren (zurück zu Seiten-Form)
        const { immoIdx, seiteKey } = CameraState.currentContext;
        if (typeof renderSeitenForm === 'function') {
            renderSeitenForm(immoIdx, seiteKey);
        }

        console.log('[Camera] Foto erfasst:', photo.id, `${(photo.compressedSize / 1024).toFixed(1)} KB`);

    } catch (error) {
        console.error('[Camera] Capture-Fehler:', error);
        showToast('Fehler beim Aufnehmen: ' + error.message, 'error');
    } finally {
        if (processingOverlay) {
            processingOverlay.style.display = 'none';
        }
    }
}

/**
 * Komprimiert Bild
 * @param {HTMLCanvasElement} canvas - Canvas mit Bild
 * @param {number} quality - JPEG-Qualität (0-1)
 * @param {number} maxSize - Maximale Breite/Höhe in px
 * @returns {Promise<Blob>} Komprimiertes Bild
 */
async function compressImage(canvas, quality, maxSize) {
    return new Promise((resolve, reject) => {
        // Skalierung berechnen
        let width = canvas.width;
        let height = canvas.height;

        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        // Neues Canvas für Kompression
        const compressCanvas = document.createElement('canvas');
        compressCanvas.width = width;
        compressCanvas.height = height;

        const ctx = compressCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, width, height);

        // Als JPEG Blob ausgeben
        compressCanvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Kompression fehlgeschlagen'));
                }
            },
            'image/jpeg',
            quality
        );
    });
}

/**
 * Konvertiert Blob zu Data URL
 * @param {Blob} blob - Blob
 * @returns {Promise<string>} Data URL
 */
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Speichert aufgenommenes Foto
 * @param {object} photo - Foto-Objekt
 */
async function saveCapturedPhoto(photo) {
    const { immoIdx, seiteKey, schadenTyp } = CameraState.currentContext;
    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    if (schadenTyp) {
        // Schaden-Foto
        if (!seite.schaeden[schadenTyp].fotos) {
            seite.schaeden[schadenTyp].fotos = [];
        }
        seite.schaeden[schadenTyp].fotos.push(photo);
    } else {
        // Allgemeines Seiten-Foto
        if (!seite.fotos) {
            seite.fotos = [];
        }
        seite.fotos.push(photo);
    }

    // In IndexedDB speichern
    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);
}

/**
 * Löscht Foto
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 * @param {string} photoId - Foto-ID
 * @param {string} schadenTyp - Optional: Schaden-Typ
 */
async function deletePhoto(immoIdx, seiteKey, photoId, schadenTyp = null) {
    if (!confirm('Foto wirklich löschen?')) return;

    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    if (schadenTyp) {
        // Schaden-Foto löschen
        seite.schaeden[schadenTyp].fotos = seite.schaeden[schadenTyp].fotos.filter(
            photo => photo.id !== photoId
        );
    } else {
        // Allgemeines Foto löschen
        seite.fotos = seite.fotos.filter(photo => photo.id !== photoId);
    }

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    // UI aktualisieren
    renderSeitenForm(immoIdx, seiteKey);

    showToast('Foto gelöscht', 'success');
}

/**
 * Rendert Foto-Galerie
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 * @param {string} schadenTyp - Optional: Schaden-Typ
 * @returns {string} HTML
 */
function renderPhotoGallery(immoIdx, seiteKey, schadenTyp = null) {
    const seite = AppState.immobilien[immoIdx].seiten[seiteKey];

    let photos = [];
    if (schadenTyp) {
        photos = seite.schaeden[schadenTyp]?.fotos || [];
    } else {
        photos = seite.fotos || [];
    }

    if (photos.length === 0) {
        return `
            <div class="photo-gallery-empty">
                <p>Noch keine Fotos aufgenommen</p>
                <button class="btn-secondary btn-small" onclick="openCamera(${immoIdx}, '${seiteKey}'${schadenTyp ? `, '${schadenTyp}'` : ''})">
                    📷 Foto aufnehmen
                </button>
            </div>
        `;
    }

    return `
        <div class="photo-gallery">
            <div class="photo-gallery-header">
                <span class="photo-count">${photos.length} Foto(s)</span>
                <button class="btn-secondary btn-small" onclick="openCamera(${immoIdx}, '${seiteKey}'${schadenTyp ? `, '${schadenTyp}'` : ''})">
                    📷 Weiteres Foto
                </button>
            </div>

            <div class="photo-grid">
                ${photos.map(photo => `
                    <div class="photo-item" data-photo-id="${photo.id}">
                        <img src="${photo.thumbnail}" alt="Foto" class="photo-thumbnail"
                             onclick="viewPhoto('${photo.id}', ${immoIdx}, '${seiteKey}'${schadenTyp ? `, '${schadenTyp}'` : ''})">
                        <button class="photo-delete-btn"
                                onclick="deletePhoto(${immoIdx}, '${seiteKey}', '${photo.id}'${schadenTyp ? `, '${schadenTyp}'` : ''})">
                            🗑️
                        </button>
                        <div class="photo-info">
                            ${formatDate(photo.timestamp)} • ${(photo.compressedSize / 1024).toFixed(0)} KB
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Zeigt Foto in Vollansicht (Lightbox)
 * @param {string} photoId - Foto-ID
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 * @param {string} schadenTyp - Optional: Schaden-Typ
 */
function viewPhoto(photoId, immoIdx, seiteKey, schadenTyp = null) {
    const seite = AppState.immobilien[immoIdx].seiten[seiteKey];

    let photo;
    if (schadenTyp) {
        photo = seite.schaeden[schadenTyp]?.fotos.find(p => p.id === photoId);
    } else {
        photo = seite.fotos?.find(p => p.id === photoId);
    }

    if (!photo) {
        showToast('Foto nicht gefunden', 'error');
        return;
    }

    // Lightbox erstellen
    const lightbox = document.createElement('div');
    lightbox.className = 'photo-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" onclick="closeLightbox()"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()">✕</button>
            <img src="${photo.url}" alt="Foto Vollansicht" class="lightbox-image">
            <div class="lightbox-info">
                <p>${formatDate(photo.timestamp)}</p>
                <p>${photo.width} × ${photo.height} px • ${(photo.compressedSize / 1024).toFixed(1)} KB</p>
            </div>
            <div class="lightbox-actions">
                <button class="btn-secondary" onclick="closeLightbox()">Schließen</button>
                <button class="btn-primary" onclick="annotatePhoto('${photoId}', ${immoIdx}, '${seiteKey}'${schadenTyp ? `, '${schadenTyp}'` : ''})">
                    ✏️ Markieren
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);
}

/**
 * Schließt Lightbox
 */
function closeLightbox() {
    const lightbox = document.querySelector('.photo-lightbox');
    if (lightbox) lightbox.remove();
}

/**
 * Startet Foto-Annotation
 * (Implementation in annotation.js)
 */

/**
 * Prüft Kamera-Verfügbarkeit
 * @returns {Promise<boolean>}
 */
async function checkCameraAvailability() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
        console.error('[Camera] Verfügbarkeits-Check fehlgeschlagen:', error);
        return false;
    }
}
