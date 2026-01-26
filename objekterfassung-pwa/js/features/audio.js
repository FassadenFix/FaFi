// ============================================
// SPRACHNOTIZEN
// MediaRecorder API für Audio-Aufnahmen
// ============================================

/**
 * Audio-Manager für Sprachnotizen
 */
class AudioManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.currentContext = null; // { immoIdx, seiteKey }
    }

    /**
     * Prüft Audio-Verfügbarkeit
     * @returns {boolean}
     */
    isAvailable() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    }

    /**
     * Startet Audio-Aufnahme
     * @param {number} immoIdx - Immobilien-Index
     * @param {string} seiteKey - Seiten-Key
     */
    async startRecording(immoIdx, seiteKey) {
        if (!this.isAvailable()) {
            throw new Error('Audio-Aufnahme nicht verfügbar');
        }

        if (this.isRecording) {
            throw new Error('Aufnahme läuft bereits');
        }

        try {
            // Mikrofon-Zugriff anfordern
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // MediaRecorder initialisieren
            const mimeType = this._getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

            this.audioChunks = [];
            this.currentContext = { immoIdx, seiteKey };

            // Event-Listener
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this._handleRecordingStop();
            };

            // Aufnahme starten
            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTime = Date.now();
            this._startTimer();

            console.log('[Audio] Aufnahme gestartet:', mimeType);

        } catch (error) {
            console.error('[Audio] Start-Fehler:', error);

            if (error.name === 'NotAllowedError') {
                throw new Error('Mikrofon-Zugriff verweigert. Bitte Berechtigung aktivieren.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('Kein Mikrofon gefunden.');
            } else {
                throw new Error('Fehler beim Starten der Aufnahme: ' + error.message);
            }
        }
    }

    /**
     * Stoppt Audio-Aufnahme
     */
    stopRecording() {
        if (!this.isRecording) {
            throw new Error('Keine aktive Aufnahme');
        }

        this.mediaRecorder.stop();
        this.isRecording = false;
        this._stopTimer();

        // Stream aufräumen
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        console.log('[Audio] Aufnahme gestoppt');
    }

    /**
     * Pausiert Audio-Aufnahme
     */
    pauseRecording() {
        if (!this.isRecording || this.mediaRecorder.state !== 'recording') {
            throw new Error('Keine aktive Aufnahme');
        }

        this.mediaRecorder.pause();
        this._stopTimer();
        console.log('[Audio] Aufnahme pausiert');
    }

    /**
     * Setzt pausierte Aufnahme fort
     */
    resumeRecording() {
        if (!this.isRecording || this.mediaRecorder.state !== 'paused') {
            throw new Error('Keine pausierte Aufnahme');
        }

        this.mediaRecorder.resume();
        this._startTimer();
        console.log('[Audio] Aufnahme fortgesetzt');
    }

    /**
     * Bricht Aufnahme ab
     */
    cancelRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this._stopTimer();

            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            this.audioChunks = [];
            console.log('[Audio] Aufnahme abgebrochen');
        }
    }

    /**
     * Behandelt Aufnahme-Stop
     * @private
     */
    async _handleRecordingStop() {
        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        // Base64 konvertieren für IndexedDB
        const dataUrl = await this._blobToDataUrl(blob);

        // Audio-Objekt erstellen
        const audioNote = {
            id: `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: dataUrl,
            mimeType: this.mediaRecorder.mimeType,
            duration: duration,
            size: blob.size,
            timestamp: new Date().toISOString()
        };

        // Speichern
        await this._saveAudioNote(audioNote);

        // UI aktualisieren
        const { immoIdx, seiteKey } = this.currentContext;
        if (typeof renderSeitenForm === 'function') {
            renderSeitenForm(immoIdx, seiteKey);
        }

        showToast(`🎤 Sprachnotiz aufgenommen (${this._formatDuration(duration)})`, 'success');

        console.log('[Audio] Aufnahme gespeichert:', audioNote.id, `${(blob.size / 1024).toFixed(1)} KB`);
    }

    /**
     * Speichert Sprachnotiz
     * @private
     * @param {object} audioNote - Audio-Objekt
     */
    async _saveAudioNote(audioNote) {
        const { immoIdx, seiteKey } = this.currentContext;
        const immo = AppState.immobilien[immoIdx];
        const seite = immo.seiten[seiteKey];

        if (!seite.audioNotes) {
            seite.audioNotes = [];
        }

        seite.audioNotes.push(audioNote);

        await storageManager.saveImmobilie(immo);
        updateState('immobilien', AppState.immobilien);
    }

    /**
     * Ermittelt unterstützten MIME-Type
     * @private
     * @returns {string}
     */
    _getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return ''; // Fallback: Browser wählt automatisch
    }

    /**
     * Konvertiert Blob zu Data URL
     * @private
     * @param {Blob} blob
     * @returns {Promise<string>}
     */
    _blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Startet Timer für Aufnahme-Dauer
     * @private
     */
    _startTimer() {
        this._updateTimer();
        this.timerInterval = setInterval(() => this._updateTimer(), 1000);
    }

    /**
     * Stoppt Timer
     * @private
     */
    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Aktualisiert Timer-Anzeige
     * @private
     */
    _updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const timerElement = document.getElementById('audio-timer');
        if (timerElement) {
            timerElement.textContent = this._formatDuration(elapsed);
        }
    }

    /**
     * Formatiert Dauer (Sekunden → MM:SS)
     * @private
     * @param {number} seconds
     * @returns {string}
     */
    _formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Globale Instanz
const audioManager = new AudioManager();

/**
 * Öffnet Audio-Aufnahme-Modal
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 */
async function openAudioRecorder(immoIdx, seiteKey) {
    // Audio-Verfügbarkeit prüfen
    if (!audioManager.isAvailable()) {
        showToast('Audio-Aufnahme nicht verfügbar auf diesem Gerät', 'error');
        return;
    }

    // Modal erstellen
    renderAudioModal(immoIdx, seiteKey);

    // Aufnahme starten
    try {
        await audioManager.startRecording(immoIdx, seiteKey);
        updateAudioModalState('recording');
    } catch (error) {
        console.error('[Audio] Modal-Fehler:', error);
        showToast(error.message, 'error');
        closeAudioRecorder();
    }
}

/**
 * Rendert Audio-Aufnahme-Modal
 * @param {number} immoIdx
 * @param {string} seiteKey
 */
function renderAudioModal(immoIdx, seiteKey) {
    // Entferne existierendes Modal
    const existing = document.getElementById('audio-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'audio-modal';
    modal.className = 'audio-modal';
    modal.innerHTML = `
        <div class="audio-container">
            <div class="audio-header">
                <h3>🎤 Sprachnotiz</h3>
                <button class="audio-close-btn" onclick="cancelAudioRecording()">✕</button>
            </div>

            <div class="audio-body">
                <!-- Aufnahme-Visualisierung -->
                <div class="audio-visualizer">
                    <div class="audio-pulse"></div>
                    <div class="audio-icon">🎙️</div>
                </div>

                <!-- Timer -->
                <div class="audio-timer-display">
                    <span id="audio-timer">0:00</span>
                </div>

                <!-- Hinweis -->
                <p class="audio-hint">Sprechen Sie jetzt...</p>
            </div>

            <div class="audio-footer">
                <button class="btn-danger" onclick="cancelAudioRecording()">
                    Abbrechen
                </button>
                <button class="btn-primary btn-large" id="audio-stop-btn" onclick="stopAudioRecording()">
                    ⏹️ Stoppen
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Aktualisiert Modal-State (recording/paused)
 * @param {string} state
 */
function updateAudioModalState(state) {
    const modal = document.getElementById('audio-modal');
    if (!modal) return;

    const pulse = modal.querySelector('.audio-pulse');
    const hint = modal.querySelector('.audio-hint');

    if (state === 'recording') {
        pulse?.classList.add('active');
        if (hint) hint.textContent = 'Sprechen Sie jetzt...';
    } else if (state === 'paused') {
        pulse?.classList.remove('active');
        if (hint) hint.textContent = 'Aufnahme pausiert';
    }
}

/**
 * Stoppt Audio-Aufnahme
 */
function stopAudioRecording() {
    try {
        audioManager.stopRecording();
        closeAudioRecorder();
    } catch (error) {
        console.error('[Audio] Stop-Fehler:', error);
        showToast(error.message, 'error');
    }
}

/**
 * Bricht Aufnahme ab
 */
function cancelAudioRecording() {
    if (confirm('Aufnahme wirklich abbrechen?')) {
        audioManager.cancelRecording();
        closeAudioRecorder();
    }
}

/**
 * Schließt Audio-Modal
 */
function closeAudioRecorder() {
    const modal = document.getElementById('audio-modal');
    if (modal) modal.remove();
}

/**
 * Löscht Sprachnotiz
 * @param {number} immoIdx
 * @param {string} seiteKey
 * @param {string} audioId
 */
async function deleteAudioNote(immoIdx, seiteKey, audioId) {
    if (!confirm('Sprachnotiz wirklich löschen?')) return;

    const immo = AppState.immobilien[immoIdx];
    const seite = immo.seiten[seiteKey];

    seite.audioNotes = seite.audioNotes.filter(note => note.id !== audioId);

    await storageManager.saveImmobilie(immo);
    updateState('immobilien', AppState.immobilien);

    renderSeitenForm(immoIdx, seiteKey);
    showToast('Sprachnotiz gelöscht', 'success');
}

/**
 * Spielt Sprachnotiz ab
 * @param {string} audioUrl - Data URL
 */
function playAudioNote(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('[Audio] Playback-Fehler:', error);
        showToast('Fehler beim Abspielen', 'error');
    });
}

/**
 * Rendert Sprachnotizen-Liste
 * @param {number} immoIdx
 * @param {string} seiteKey
 * @returns {string} HTML
 */
function renderAudioNotes(immoIdx, seiteKey) {
    const seite = AppState.immobilien[immoIdx].seiten[seiteKey];
    const audioNotes = seite.audioNotes || [];

    if (audioNotes.length === 0) {
        return `
            <div class="audio-notes-empty">
                <p>Noch keine Sprachnotizen aufgenommen</p>
                <button class="btn-secondary btn-small" onclick="openAudioRecorder(${immoIdx}, '${seiteKey}')">
                    🎤 Sprachnotiz aufnehmen
                </button>
            </div>
        `;
    }

    return `
        <div class="audio-notes-list">
            <div class="audio-notes-header">
                <span class="audio-count">${audioNotes.length} Notiz(en)</span>
                <button class="btn-secondary btn-small" onclick="openAudioRecorder(${immoIdx}, '${seiteKey}')">
                    🎤 Weitere Notiz
                </button>
            </div>

            <div class="audio-notes-items">
                ${audioNotes.map(note => `
                    <div class="audio-note-item" data-audio-id="${note.id}">
                        <div class="audio-note-info">
                            <span class="audio-note-icon">🎙️</span>
                            <div class="audio-note-details">
                                <div class="audio-note-duration">
                                    ${formatDuration(note.duration)}
                                </div>
                                <div class="audio-note-meta">
                                    ${formatDate(note.timestamp)} • ${(note.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                        <div class="audio-note-actions">
                            <button class="btn-icon" onclick="playAudioNote('${note.url}')" title="Abspielen">
                                ▶️
                            </button>
                            <button class="btn-icon" onclick="deleteAudioNote(${immoIdx}, '${seiteKey}', '${note.id}')" title="Löschen">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Formatiert Dauer (Sekunden → MM:SS)
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
