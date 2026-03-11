/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Baustellenfoto-Upload mit Galerie-Zugriff und automatischer Benennung
 * Optimiert für mobile Nutzung auf der Baustelle
 */

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  ImagePlus,
  FolderOpen,
  Upload,
  X,
  Check,
  Edit2,
  Trash2,
  RotateCw,
  ZoomIn,
  Download,
  Tag,
  MapPin,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export interface FotoMetadata {
  id: string;
  dateiname: string;
  originalName: string;
  url: string;
  thumbnail?: string;
  kategorie: FotoKategorie;
  seite?: string;
  beschreibung?: string;
  aufnahmedatum: Date;
  uploadDatum: Date;
  geoLocation?: {
    lat: number;
    lng: number;
  };
  groesse: number;
  breite?: number;
  hoehe?: number;
  tags: string[];
}

export type FotoKategorie = 
  | "uebersicht"
  | "frontseite"
  | "rueckseite"
  | "linker_giebel"
  | "rechter_giebel"
  | "detail"
  | "schaden"
  | "besonderheit"
  | "vorher"
  | "nachher"
  | "dokumentation";

const KATEGORIE_LABELS: Record<FotoKategorie, string> = {
  uebersicht: "Übersicht",
  frontseite: "Frontseite",
  rueckseite: "Rückseite",
  linker_giebel: "Linker Giebel",
  rechter_giebel: "Rechter Giebel",
  detail: "Detail",
  schaden: "Schaden",
  besonderheit: "Besonderheit",
  vorher: "Vorher",
  nachher: "Nachher",
  dokumentation: "Dokumentation",
};

const KATEGORIE_ICONS: Record<FotoKategorie, string> = {
  uebersicht: "📸",
  frontseite: "🏠",
  rueckseite: "🏡",
  linker_giebel: "◀️",
  rechter_giebel: "▶️",
  detail: "🔍",
  schaden: "⚠️",
  besonderheit: "⭐",
  vorher: "📅",
  nachher: "✅",
  dokumentation: "📋",
};

interface BaustellenFotoUploadProps {
  projektName?: string;
  baustelleName?: string;
  immobilienAdresse?: string;
  seite?: string;
  onUpload: (fotos: FotoMetadata[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  defaultKategorie?: FotoKategorie;
  showPreview?: boolean;
  compact?: boolean;
}

// ============================================
// AUTO-NAMING LOGIC
// ============================================

function generateAutoFilename(
  originalName: string,
  kategorie: FotoKategorie,
  seite: string | undefined,
  projektName: string | undefined,
  index: number
): string {
  const now = new Date();
  const datum = now.toISOString().split("T")[0].replace(/-/g, "");
  const zeit = now.toTimeString().split(" ")[0].replace(/:/g, "").substring(0, 4);
  
  // Projekt-Kürzel erstellen (erste 3 Buchstaben oder Zahlen)
  const projektKuerzel = projektName
    ? projektName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase()
    : "PROJ";
  
  // Seiten-Kürzel
  const seitenKuerzel = seite
    ? seite.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, "")
    : "";
  
  // Kategorie-Kürzel
  const kategorieKuerzel = kategorie.substring(0, 3).toUpperCase();
  
  // Fortlaufende Nummer
  const nummer = String(index + 1).padStart(3, "0");
  
  // Dateiendung extrahieren
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  
  // Format: PROJEKT_SEITE_KATEGORIE_DATUM_ZEIT_NR.ext
  // Beispiel: WBGHALLE_FRONT_UEB_20260204_1430_001.jpg
  const parts = [projektKuerzel];
  if (seitenKuerzel) parts.push(seitenKuerzel);
  parts.push(kategorieKuerzel, datum, zeit, nummer);
  
  return `${parts.join("_")}.${ext}`;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BaustellenFotoUpload({
  projektName,
  baustelleName,
  immobilienAdresse,
  seite,
  onUpload,
  maxFiles = 20,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"],
  defaultKategorie = "uebersicht",
  showPreview = true,
  compact = false,
}: BaustellenFotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [kategorie, setKategorie] = useState<FotoKategorie>(defaultKategorie);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [customNames, setCustomNames] = useState<Record<number, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [currentGPS, setCurrentGPS] = useState<{ lat: number; lng: number } | null>(null);

  // GPS automatisch erfassen
  const captureGPS = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}, // GPS nicht verfügbar - kein Fehler anzeigen
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // GPS beim Mount erfassen
  useState(() => { captureGPS(); });

  // Datei-Auswahl aus Galerie
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Prüfe Anzahl
    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`Maximal ${maxFiles} Fotos erlaubt`, {
        description: `Du hast bereits ${selectedFiles.length} Fotos ausgewählt.`,
      });
      return;
    }

    // Prüfe Dateitypen
    const validFiles = files.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast.warning(`${file.name} wird nicht unterstützt`, {
          description: "Nur JPG, PNG und WebP erlaubt.",
        });
        return false;
      }
      return true;
    });

    // Erstelle Previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (e.target) e.target.value = "";
  }, [selectedFiles.length, maxFiles, acceptedTypes]);

  // Foto entfernen
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setCustomNames(prev => {
      const newNames = { ...prev };
      delete newNames[index];
      return newNames;
    });
  }, []);

  // Namen bearbeiten
  const handleNameEdit = useCallback((index: number, name: string) => {
    setCustomNames(prev => ({ ...prev, [index]: name }));
    setEditingName(null);
  }, []);

  // Upload durchführen
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("Keine Fotos ausgewählt");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFotos: FotoMetadata[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simuliere Upload-Progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));

        // Generiere automatischen Dateinamen
        const autoName = customNames[i] || generateAutoFilename(
          file.name,
          kategorie,
          seite,
          projektName,
          uploadedFotos.length
        );

        // Erstelle Foto-Metadaten (mit GPS wenn verfügbar)
        const foto: FotoMetadata = {
          id: `foto-${Date.now()}-${i}`,
          dateiname: autoName,
          originalName: file.name,
          url: previews[i], // In echter Implementierung: S3-URL
          kategorie,
          seite,
          aufnahmedatum: new Date(file.lastModified),
          uploadDatum: new Date(),
          geoLocation: currentGPS || undefined,
          groesse: file.size,
          tags: [KATEGORIE_LABELS[kategorie]],
        };

        uploadedFotos.push(foto);

        // Kurze Pause für UX
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      onUpload(uploadedFotos);
      
      toast.success(`${uploadedFotos.length} Foto(s) hochgeladen`, {
        description: "Die Fotos wurden automatisch benannt und kategorisiert.",
      });

      // Reset
      setSelectedFiles([]);
      setPreviews([]);
      setCustomNames({});
      setUploadProgress(0);

    } catch (error) {
      toast.error("Upload fehlgeschlagen", {
        description: "Bitte versuche es erneut.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, previews, kategorie, seite, projektName, customNames, onUpload]);

  // Kompakte Ansicht
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Galerie
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 gap-2"
          >
            <Camera className="w-4 h-4" />
            Kamera
          </Button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="text-sm">{selectedFiles.length} Foto(s) ausgewählt</span>
            <Button size="sm" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header mit Kontext-Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Baustellenfotos
          </h3>
          {(projektName || baustelleName || immobilienAdresse) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {projektName && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Building2 className="w-3 h-3" />
                  {projektName}
                </Badge>
              )}
              {immobilienAdresse && (
                <Badge variant="outline" className="text-xs gap-1">
                  <MapPin className="w-3 h-3" />
                  {immobilienAdresse}
                </Badge>
              )}
              {seite && (
                <Badge variant="secondary" className="text-xs">
                  {seite}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Badge variant="secondary">
          {selectedFiles.length} / {maxFiles}
        </Badge>
      </div>

      {/* Kategorie-Auswahl */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Kategorie</Label>
          <Select value={kategorie} onValueChange={(v) => setKategorie(v as FotoKategorie)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span>{KATEGORIE_ICONS[key as FotoKategorie]}</span>
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Galerie
          </Button>
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      {selectedFiles.length === 0 && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
            "hover:border-primary hover:bg-primary/5 cursor-pointer"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Fotos auswählen</p>
          <p className="text-sm text-muted-foreground mt-1">
            Klicke hier oder ziehe Fotos in diesen Bereich
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG, WebP • Max. {maxFiles} Fotos
          </p>
        </div>
      )}

      {/* Preview Grid */}
      {showPreview && selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectedFiles.map((file, index) => {
            const autoName = customNames[index] || generateAutoFilename(
              file.name,
              kategorie,
              seite,
              projektName,
              index
            );

            return (
              <Card key={index} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setPreviewIndex(index);
                      setIsPreviewOpen(true);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setPreviewIndex(index);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingName(index)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge
                    className="absolute top-2 left-2 text-xs"
                    variant="secondary"
                  >
                    {KATEGORIE_ICONS[kategorie]}
                  </Badge>
                </div>
                <CardContent className="p-2">
                  {editingName === index ? (
                    <Input
                      defaultValue={autoName.replace(/\.[^.]+$/, "")}
                      className="h-7 text-xs"
                      autoFocus
                      onBlur={(e) => handleNameEdit(index, e.target.value + "." + file.name.split(".").pop())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleNameEdit(index, (e.target as HTMLInputElement).value + "." + file.name.split(".").pop());
                        }
                      }}
                    />
                  ) : (
                    <p className="text-xs truncate text-muted-foreground" title={autoName}>
                      {autoName}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Add More Button */}
          {selectedFiles.length < maxFiles && (
            <Card
              className="aspect-square flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-2">Weitere</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium text-sm">
              {selectedFiles.length} Foto(s) bereit
            </p>
            <p className="text-xs text-muted-foreground">
              Kategorie: {KATEGORIE_LABELS[kategorie]}
            </p>
          </div>
          <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Hochladen
              </>
            )}
          </Button>
        </div>
      )}

      {/* Lightbox Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Foto-Vorschau
            </DialogTitle>
          </DialogHeader>
          
          {previews[previewIndex] && (
            <div className="relative">
              <img
                src={previews[previewIndex]}
                alt={selectedFiles[previewIndex]?.name}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              
              {/* Navigation */}
              {selectedFiles.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={previewIndex === 0}
                    onClick={() => setPreviewIndex(prev => prev - 1)}
                  >
                    Zurück
                  </Button>
                  <Badge variant="secondary">
                    {previewIndex + 1} / {selectedFiles.length}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={previewIndex === selectedFiles.length - 1}
                    onClick={() => setPreviewIndex(prev => prev + 1)}
                  >
                    Weiter
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {customNames[previewIndex] || generateAutoFilename(
                    selectedFiles[previewIndex]?.name || "",
                    kategorie,
                    seite,
                    projektName,
                    previewIndex
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFiles[previewIndex] && (
                    <>
                      {(selectedFiles[previewIndex].size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {new Date(selectedFiles[previewIndex].lastModified).toLocaleString("de-DE")}
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  removeFile(previewIndex);
                  if (previewIndex >= selectedFiles.length - 1) {
                    setPreviewIndex(Math.max(0, previewIndex - 1));
                  }
                  if (selectedFiles.length <= 1) {
                    setIsPreviewOpen(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Entfernen
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// QUICK UPLOAD BUTTON (für Toolbar)
// ============================================

interface QuickFotoUploadProps {
  onUpload: (fotos: FotoMetadata[]) => void;
  projektName?: string;
  seite?: string;
  kategorie?: FotoKategorie;
}

export function QuickFotoUpload({
  onUpload,
  projektName,
  seite,
  kategorie = "dokumentation",
}: QuickFotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fotos: FotoMetadata[] = files.map((file, index) => ({
      id: `foto-${Date.now()}-${index}`,
      dateiname: generateAutoFilename(file.name, kategorie, seite, projektName, index),
      originalName: file.name,
      url: URL.createObjectURL(file),
      kategorie,
      seite,
      aufnahmedatum: new Date(file.lastModified),
      uploadDatum: new Date(),
      groesse: file.size,
      tags: [KATEGORIE_LABELS[kategorie]],
    }));

    onUpload(fotos);
    toast.success(`${fotos.length} Foto(s) hinzugefügt`);
    
    if (e.target) e.target.value = "";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Foto
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
