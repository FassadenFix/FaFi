/**
 * Foto-Komprimierung für Baustellenfotos
 * Interview: "Frage noch offen" → Entscheidung: Client-seitige Komprimierung
 * 
 * Strategie:
 * - Originalfoto wird in S3 gespeichert (volle Qualität)
 * - Komprimierte Version für schnelle Vorschau und Upload bei schlechter Verbindung
 * - Max. 2048px Kantenlänge für Vorschau
 * - JPEG-Qualität: 80% (guter Kompromiss Qualität/Größe)
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp";
}

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.80,
  format: "jpeg",
};

/**
 * Komprimiert ein Bild client-seitig via Canvas API
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Berechne neue Dimensionen
      let { width, height } = img;
      
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Canvas erstellen und zeichnen
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context nicht verfügbar"));
        return;
      }
      
      // Hochwertiges Resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      
      // Als Blob exportieren
      const mimeType = opts.format === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Komprimierung fehlgeschlagen"));
            return;
          }
          
          resolve({
            blob,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100),
          });
        },
        mimeType,
        opts.quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden"));
    };
    
    img.src = url;
  });
}

/**
 * Komprimiert ein Bild für Thumbnail-Vorschau (klein, schnell)
 */
export async function createThumbnail(file: File): Promise<CompressedImage> {
  return compressImage(file, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.60,
    format: "jpeg",
  });
}

/**
 * Prüft ob ein Bild komprimiert werden sollte
 * Bilder unter 500KB werden nicht komprimiert
 */
export function shouldCompress(file: File): boolean {
  const MAX_SIZE_WITHOUT_COMPRESSION = 500 * 1024; // 500KB
  return file.size > MAX_SIZE_WITHOUT_COMPRESSION;
}

/**
 * Formatiert Dateigröße für Anzeige
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Fügt Wasserzeichen zu einem Bild hinzu
 * Interview: Datum, Uhrzeit, GPS, Baustellenname
 */
export async function addWatermark(
  file: File,
  watermarkData: {
    baustellenName: string;
    datum?: string;
    uhrzeit?: string;
    gps?: { lat: number; lng: number };
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context nicht verfügbar"));
        return;
      }
      
      // Originalbild zeichnen
      ctx.drawImage(img, 0, 0);
      
      // Wasserzeichen-Bereich (unten)
      const barHeight = Math.max(40, img.height * 0.05);
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, img.height - barHeight, img.width, barHeight);
      
      // Text
      const fontSize = Math.max(14, barHeight * 0.5);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      
      const now = new Date();
      const datum = watermarkData.datum || now.toLocaleDateString("de-DE");
      const uhrzeit = watermarkData.uhrzeit || now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      
      let text = `${watermarkData.baustellenName} | ${datum} ${uhrzeit}`;
      if (watermarkData.gps) {
        text += ` | ${watermarkData.gps.lat.toFixed(4)}, ${watermarkData.gps.lng.toFixed(4)}`;
      }
      
      const padding = 10;
      ctx.fillText(text, padding, img.height - barHeight / 2);
      
      // FassadenFix Logo-Text rechts
      ctx.textAlign = "right";
      ctx.fillStyle = "#77bc1f";
      ctx.fillText("FassadenFix", img.width - padding, img.height - barHeight / 2);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Wasserzeichen-Erstellung fehlgeschlagen"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.90
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden"));
    };
    
    img.src = url;
  });
}
