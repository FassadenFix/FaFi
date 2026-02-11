import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X, ImagePlus, Loader2, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface PhotoUploadResult {
  id: number;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface FotoUploadProps {
  context: "objektaufnahme" | "vorher_dokumentation" | "nachher_dokumentation" | "baustelle_fortschritt" | "ereignis" | "abnahme" | "schaden" | "allgemein";
  propertyId?: number;
  constructionSiteId?: number;
  logEntryId?: number;
  projectId?: number;
  uploadedById?: number;
  companyName?: string;
  address?: string;
  side?: "front" | "back" | "left_gable" | "right_gable" | "roof" | "other";
  category?: string;
  maxPhotos?: number;
  required?: boolean;
  showSideSelector?: boolean;
  showCategoryInput?: boolean;
  onUploadComplete?: (photos: PhotoUploadResult[]) => void;
  onPhotosChange?: (photos: PhotoUploadResult[]) => void;
  existingPhotos?: PhotoUploadResult[];
  label?: string;
  description?: string;
}

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  thumbnailBase64?: string;
  description: string;
  category: string;
  side: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  result?: PhotoUploadResult;
}

// Thumbnail-Generierung clientseitig (Canvas API, max 400px)
async function generateThumbnail(file: File, maxSize: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      // Return base64 without data URL prefix
      const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const SIDE_LABELS: Record<string, string> = {
  front: "Frontseite",
  back: "Rückseite",
  left_gable: "Linker Giebel",
  right_gable: "Rechter Giebel",
  roof: "Dach",
  other: "Sonstiges",
};

const CONTEXT_LABELS: Record<string, string> = {
  objektaufnahme: "Objektaufnahme",
  vorher_dokumentation: "Vorher-Dokumentation",
  nachher_dokumentation: "Nachher-Dokumentation",
  baustelle_fortschritt: "Baustellenfortschritt",
  ereignis: "Ereignis",
  abnahme: "Abnahme",
  schaden: "Schaden",
  allgemein: "Allgemein",
};

export default function FotoUpload({
  context,
  propertyId,
  constructionSiteId,
  logEntryId,
  projectId,
  uploadedById,
  companyName,
  address,
  side: defaultSide,
  category: defaultCategory,
  maxPhotos = 20,
  required = false,
  showSideSelector = false,
  showCategoryInput = false,
  onUploadComplete,
  onPhotosChange,
  existingPhotos = [],
  label,
  description,
}: FotoUploadProps) {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoUploadResult[]>(existingPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);


  const totalPhotos = uploadedPhotos.length + pendingPhotos.length;
  const canAddMore = totalPhotos < maxPhotos;

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const remaining = maxPhotos - totalPhotos;
    const filesToAdd = Array.from(files).slice(0, remaining);

    const newPending: PendingPhoto[] = [];
    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} ist kein Bild.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      let thumbnailBase64: string | undefined;
      try {
        thumbnailBase64 = await generateThumbnail(file);
      } catch { /* thumbnail optional */ }

      newPending.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        thumbnailBase64,
        description: "",
        category: defaultCategory || "",
        side: defaultSide || "",
        uploading: false,
        uploaded: false,
      });
    }
    setPendingPhotos(prev => [...prev, ...newPending]);
  }, [maxPhotos, totalPhotos, defaultCategory, defaultSide, toast]);

  const removePending = useCallback((id: string) => {
    setPendingPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const updatePending = useCallback((id: string, updates: Partial<PendingPhoto>) => {
    setPendingPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const uploadAll = useCallback(async () => {
    const toUpload = pendingPhotos.filter(p => !p.uploaded);
    if (toUpload.length === 0) return;

    setIsUploading(true);
    const results: PhotoUploadResult[] = [];

    for (const photo of toUpload) {
      updatePending(photo.id, { uploading: true });
      try {
        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("context", context);
        if (companyName) formData.append("companyName", companyName);
        if (address) formData.append("address", address);
        if (photo.side) formData.append("side", photo.side);
        if (photo.category) formData.append("category", photo.category);
        if (photo.description) formData.append("description", photo.description);
        if (propertyId) formData.append("propertyId", String(propertyId));
        if (constructionSiteId) formData.append("constructionSiteId", String(constructionSiteId));
        if (logEntryId) formData.append("logEntryId", String(logEntryId));
        if (projectId) formData.append("projectId", String(projectId));
        if (uploadedById) formData.append("uploadedById", String(uploadedById));
        if (photo.thumbnailBase64) formData.append("thumbnailBase64", photo.thumbnailBase64);

        const response = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) throw new Error("Upload fehlgeschlagen");
        const result: PhotoUploadResult = await response.json();
        results.push(result);
        updatePending(photo.id, { uploading: false, uploaded: true, result });
      } catch (error) {
        updatePending(photo.id, {
          uploading: false,
          error: error instanceof Error ? error.message : "Upload fehlgeschlagen",
        });
      }
    }

    if (results.length > 0) {
      const allUploaded = [...uploadedPhotos, ...results];
      setUploadedPhotos(allUploaded);
      onUploadComplete?.(results);
      onPhotosChange?.(allUploaded);
      // Remove successfully uploaded from pending
      setPendingPhotos(prev => prev.filter(p => !p.uploaded));
      toast.success(`${results.length} Foto(s) erfolgreich hochgeladen.`);
    }
    setIsUploading(false);
  }, [pendingPhotos, context, companyName, address, propertyId, constructionSiteId, logEntryId, projectId, uploadedById, uploadedPhotos, onUploadComplete, onPhotosChange, toast, updatePending]);

  const removeUploaded = useCallback((index: number) => {
    setUploadedPhotos(prev => {
      const next = prev.filter((_, i) => i !== index);
      onPhotosChange?.(next);
      return next;
    });
  }, [onPhotosChange]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">
            {label || CONTEXT_LABELS[context] || "Fotos"}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <span className="text-xs text-muted-foreground">
          {totalPhotos}/{maxPhotos} Fotos
        </span>
      </div>

      {/* Upload Buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Galerie
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Kamera
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Pending Photos Preview */}
      {pendingPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">Bereit zum Hochladen</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden relative group">
                <div className="aspect-square relative">
                  <img
                    src={photo.preview}
                    alt="Vorschau"
                    className="w-full h-full object-cover"
                  />
                  {photo.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {photo.uploaded && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {photo.error && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs p-1 text-center">
                      {photo.error}
                    </div>
                  )}
                  {!photo.uploading && !photo.uploaded && (
                    <button
                      onClick={() => removePending(photo.id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <CardContent className="p-2 space-y-1.5">
                  <Input
                    placeholder="Beschreibung..."
                    value={photo.description}
                    onChange={(e) => updatePending(photo.id, { description: e.target.value })}
                    className="h-7 text-xs"
                  />
                  {showSideSelector && !defaultSide && (
                    <Select
                      value={photo.side || "none"}
                      onValueChange={(v) => updatePending(photo.id, { side: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Seite wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Seite</SelectItem>
                        {Object.entries(SIDE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {showCategoryInput && !defaultCategory && (
                    <Input
                      placeholder="Kategorie..."
                      value={photo.category}
                      onChange={(e) => updatePending(photo.id, { category: e.target.value })}
                      className="h-7 text-xs"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Button */}
          <Button
            onClick={uploadAll}
            disabled={isUploading || pendingPhotos.every(p => p.uploaded)}
            className="w-full"
            size="sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {pendingPhotos.filter(p => !p.uploaded).length} Foto(s) hochladen
              </>
            )}
          </Button>
        </div>
      )}

      {/* Already Uploaded Photos */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Hochgeladene Fotos</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {uploadedPhotos.map((photo, index) => (
              <div key={photo.id || index} className="aspect-square relative group rounded-md overflow-hidden border">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeUploaded(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">
                  {photo.filename}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalPhotos === 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Klicken oder Fotos hierher ziehen
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, HEIC – max. 50 MB pro Foto
          </p>
        </div>
      )}
    </div>
  );
}
