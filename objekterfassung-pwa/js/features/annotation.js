// ============================================
// FOTO-ANNOTATION
// Canvas-basiertes Markup-Tool mit Touch-Support
// ============================================

/**
 * Annotation-Manager für Foto-Markierungen
 */
class AnnotationManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.image = null;
        this.isDrawing = false;
        this.currentTool = 'pen'; // pen, arrow, text, highlighter
        this.currentColor = '#ef4444'; // Rot
        this.lineWidth = 3;
        this.undoStack = [];
        this.redoStack = [];
        this.startPoint = null;
        this.currentContext = null; // { photoId, immoIdx, seiteKey, schadenTyp }
    }

    /**
     * Initialisiert Annotation-Editor
     * @param {string} photoId - Foto-ID
     * @param {number} immoIdx - Immobilien-Index
     * @param {string} seiteKey - Seiten-Key
     * @param {string} schadenTyp - Optional: Schaden-Typ
     */
    async init(photoId, immoIdx, seiteKey, schadenTyp = null) {
        this.currentContext = { photoId, immoIdx, seiteKey, schadenTyp };

        // Foto laden
        const photo = this._getPhoto();
        if (!photo) {
            throw new Error('Foto nicht gefunden');
        }

        // Modal erstellen
        this._renderModal();

        // Canvas initialisieren
        await this._initCanvas(photo.url);

        // Event-Listener binden
        this._bindEvents();

        console.log('[Annotation] Editor geöffnet:', photoId);
    }

    /**
     * Holt Foto aus State
     * @private
     * @returns {object} Foto-Objekt
     */
    _getPhoto() {
        const { immoIdx, seiteKey, schadenTyp, photoId } = this.currentContext;
        const seite = AppState.immobilien[immoIdx].seiten[seiteKey];

        if (schadenTyp) {
            return seite.schaeden[schadenTyp]?.fotos.find(p => p.id === photoId);
        } else {
            return seite.fotos?.find(p => p.id === photoId);
        }
    }

    /**
     * Initialisiert Canvas mit Foto
     * @private
     * @param {string} imageUrl - Foto Data URL
     */
    async _initCanvas(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;

                // Canvas-Größe an Bild anpassen
                const maxWidth = window.innerWidth - 40;
                const maxHeight = window.innerHeight - 200;
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

                this.canvas.width = img.width * scale;
                this.canvas.height = img.height * scale;

                // Bild zeichnen
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

                // Initial State speichern
                this._saveState();

                resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    /**
     * Rendert Modal
     * @private
     */
    _renderModal() {
        const modal = document.createElement('div');
        modal.id = 'annotation-modal';
        modal.className = 'annotation-modal';
        modal.innerHTML = `
            <div class="annotation-container">
                <!-- Header -->
                <div class="annotation-header">
                    <h3>✏️ Foto markieren</h3>
                    <button class="annotation-close-btn" onclick="closeAnnotationEditor()">✕</button>
                </div>

                <!-- Toolbar -->
                <div class="annotation-toolbar">
                    <!-- Tools -->
                    <div class="toolbar-group">
                        <button class="tool-btn active" data-tool="pen" title="Stift">
                            ✏️
                        </button>
                        <button class="tool-btn" data-tool="arrow" title="Pfeil">
                            ➡️
                        </button>
                        <button class="tool-btn" data-tool="text" title="Text">
                            💬
                        </button>
                        <button class="tool-btn" data-tool="highlighter" title="Marker">
                            🖍️
                        </button>
                    </div>

                    <!-- Farben -->
                    <div class="toolbar-group">
                        <button class="color-btn active" data-color="#ef4444" style="background: #ef4444;" title="Rot"></button>
                        <button class="color-btn" data-color="#f59e0b" style="background: #f59e0b;" title="Orange"></button>
                        <button class="color-btn" data-color="#eab308" style="background: #eab308;" title="Gelb"></button>
                        <button class="color-btn" data-color="#22c55e" style="background: #22c55e;" title="Grün"></button>
                        <button class="color-btn" data-color="#3b82f6" style="background: #3b82f6;" title="Blau"></button>
                        <button class="color-btn" data-color="#ffffff" style="background: #ffffff; border: 1px solid #ccc;" title="Weiß"></button>
                    </div>

                    <!-- Linienbreite -->
                    <div class="toolbar-group">
                        <label class="toolbar-label">Dicke:</label>
                        <input type="range" id="line-width-slider" min="1" max="10" value="3" class="line-width-slider">
                        <span id="line-width-value" class="line-width-value">3</span>
                    </div>

                    <!-- Undo/Redo -->
                    <div class="toolbar-group">
                        <button class="tool-btn" id="undo-btn" onclick="annotationManager.undo()" title="Rückgängig">
                            ↶
                        </button>
                        <button class="tool-btn" id="redo-btn" onclick="annotationManager.redo()" title="Wiederholen">
                            ↷
                        </button>
                    </div>
                </div>

                <!-- Canvas -->
                <div class="annotation-canvas-wrapper">
                    <canvas id="annotation-canvas" class="annotation-canvas"></canvas>
                </div>

                <!-- Footer -->
                <div class="annotation-footer">
                    <button class="btn-secondary" onclick="closeAnnotationEditor()">
                        Abbrechen
                    </button>
                    <button class="btn-primary btn-large" onclick="annotationManager.save()">
                        💾 Speichern
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Canvas-Referenzen
        this.canvas = document.getElementById('annotation-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Bindet Event-Listener
     * @private
     */
    _bindEvents() {
        // Tool-Auswahl
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });

        // Farb-Auswahl
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });

        // Linienbreite
        const slider = document.getElementById('line-width-slider');
        const valueDisplay = document.getElementById('line-width-value');
        slider.addEventListener('input', (e) => {
            this.lineWidth = parseInt(e.target.value);
            valueDisplay.textContent = this.lineWidth;
        });

        // Touch-Events (Primary)
        this.canvas.addEventListener('touchstart', (e) => this._handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this._handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this._handleTouchEnd(e), { passive: false });

        // Mouse-Events (Fallback für Desktop)
        this.canvas.addEventListener('mousedown', (e) => this._handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this._handleMouseUp(e));
    }

    /**
     * Touch Start Handler
     * @private
     */
    _handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        this._startDrawing(x, y);
    }

    /**
     * Touch Move Handler
     * @private
     */
    _handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        this._draw(x, y);
    }

    /**
     * Touch End Handler
     * @private
     */
    _handleTouchEnd(e) {
        e.preventDefault();
        this._endDrawing();
    }

    /**
     * Mouse Down Handler
     * @private
     */
    _handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._startDrawing(x, y);
    }

    /**
     * Mouse Move Handler
     * @private
     */
    _handleMouseMove(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._draw(x, y);
    }

    /**
     * Mouse Up Handler
     * @private
     */
    _handleMouseUp(e) {
        this._endDrawing();
    }

    /**
     * Startet Zeichnung
     * @private
     */
    _startDrawing(x, y) {
        this.isDrawing = true;
        this.startPoint = { x, y };

        this.ctx.strokeStyle = this.currentColor;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.currentTool === 'pen') {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        } else if (this.currentTool === 'text') {
            this._drawText(x, y);
            this._endDrawing();
        }
    }

    /**
     * Zeichnet während Bewegung
     * @private
     */
    _draw(x, y) {
        if (this.currentTool === 'pen') {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'highlighter') {
            this.ctx.globalAlpha = 0.3;
            this.ctx.lineWidth = this.lineWidth * 3;
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        } else if (this.currentTool === 'arrow') {
            // Redraw from last saved state while dragging
            this._restoreState();
            this._drawArrow(this.startPoint.x, this.startPoint.y, x, y);
        }
    }

    /**
     * Beendet Zeichnung
     * @private
     */
    _endDrawing() {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.currentTool !== 'text') {
            this._saveState();
        }
    }

    /**
     * Zeichnet Pfeil
     * @private
     */
    _drawArrow(fromX, fromY, toX, toY) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Linie
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Pfeilspitze
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
    }

    /**
     * Zeichnet Text
     * @private
     */
    _drawText(x, y) {
        const text = prompt('Text eingeben:');
        if (!text) return;

        this.ctx.font = `${this.lineWidth * 8}px Arial`;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.fillText(text, x, y);

        this._saveState();
    }

    /**
     * Speichert Canvas-State für Undo
     * @private
     */
    _saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        this.redoStack = []; // Clear redo on new action
        this._updateUndoRedoButtons();
    }

    /**
     * Stellt letzten State wieder her
     * @private
     */
    _restoreState() {
        if (this.undoStack.length === 0) return;

        const lastState = this.undoStack[this.undoStack.length - 1];
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = lastState;
    }

    /**
     * Undo
     */
    undo() {
        if (this.undoStack.length <= 1) return; // Keep initial state

        const current = this.undoStack.pop();
        this.redoStack.push(current);

        const previous = this.undoStack[this.undoStack.length - 1];
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = previous;

        this._updateUndoRedoButtons();
    }

    /**
     * Redo
     */
    redo() {
        if (this.redoStack.length === 0) return;

        const next = this.redoStack.pop();
        this.undoStack.push(next);

        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = next;

        this._updateUndoRedoButtons();
    }

    /**
     * Aktualisiert Undo/Redo Button States
     * @private
     */
    _updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length <= 1;
            undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
        }

        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
        }
    }

    /**
     * Speichert annotiertes Foto
     */
    async save() {
        try {
            // Canvas als Data URL
            const annotatedDataUrl = this.canvas.toDataURL('image/jpeg', 0.9);

            // Thumbnail generieren
            const thumbnailCanvas = document.createElement('canvas');
            const maxThumbSize = 200;
            const scale = Math.min(maxThumbSize / this.canvas.width, maxThumbSize / this.canvas.height);
            thumbnailCanvas.width = this.canvas.width * scale;
            thumbnailCanvas.height = this.canvas.height * scale;
            const thumbCtx = thumbnailCanvas.getContext('2d');
            thumbCtx.drawImage(this.canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
            const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.8);

            // Größe schätzen
            const dataUrlSize = annotatedDataUrl.length * 0.75; // Base64 overhead ~25%

            // Neues Foto-Objekt
            const annotatedPhoto = {
                id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                url: annotatedDataUrl,
                thumbnail: thumbnailDataUrl,
                timestamp: new Date().toISOString(),
                compressedSize: Math.round(dataUrlSize),
                width: this.canvas.width,
                height: this.canvas.height,
                annotated: true,
                originalPhotoId: this.currentContext.photoId
            };

            // Speichern
            await this._saveAnnotatedPhoto(annotatedPhoto);

            // Success
            showToast('✅ Markiertes Foto gespeichert', 'success');

            // Schließen und UI aktualisieren
            closeAnnotationEditor();

            const { immoIdx, seiteKey } = this.currentContext;
            if (typeof renderSeitenForm === 'function') {
                renderSeitenForm(immoIdx, seiteKey);
            }

            console.log('[Annotation] Gespeichert:', annotatedPhoto.id);

        } catch (error) {
            console.error('[Annotation] Speicher-Fehler:', error);
            showToast('Fehler beim Speichern: ' + error.message, 'error');
        }
    }

    /**
     * Speichert annotiertes Foto
     * @private
     */
    async _saveAnnotatedPhoto(photo) {
        const { immoIdx, seiteKey, schadenTyp } = this.currentContext;
        const immo = AppState.immobilien[immoIdx];
        const seite = immo.seiten[seiteKey];

        if (schadenTyp) {
            if (!seite.schaeden[schadenTyp].fotos) {
                seite.schaeden[schadenTyp].fotos = [];
            }
            seite.schaeden[schadenTyp].fotos.push(photo);
        } else {
            if (!seite.fotos) {
                seite.fotos = [];
            }
            seite.fotos.push(photo);
        }

        await storageManager.saveImmobilie(immo);
        updateState('immobilien', AppState.immobilien);
    }

    /**
     * Aufräumen
     */
    cleanup() {
        this.canvas = null;
        this.ctx = null;
        this.image = null;
        this.isDrawing = false;
        this.undoStack = [];
        this.redoStack = [];
        this.startPoint = null;
        this.currentContext = null;
    }
}

// Globale Instanz
const annotationManager = new AnnotationManager();

/**
 * Öffnet Annotation-Editor
 * @param {string} photoId - Foto-ID
 * @param {number} immoIdx - Immobilien-Index
 * @param {string} seiteKey - Seiten-Key
 * @param {string} schadenTyp - Optional: Schaden-Typ
 */
async function annotatePhoto(photoId, immoIdx, seiteKey, schadenTyp = null) {
    try {
        await annotationManager.init(photoId, immoIdx, seiteKey, schadenTyp);
    } catch (error) {
        console.error('[Annotation] Init-Fehler:', error);
        showToast(error.message, 'error');
    }
}

/**
 * Schließt Annotation-Editor
 */
function closeAnnotationEditor() {
    const modal = document.getElementById('annotation-modal');
    if (modal) {
        modal.remove();
        annotationManager.cleanup();
    }
}
