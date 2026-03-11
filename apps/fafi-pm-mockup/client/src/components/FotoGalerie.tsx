/*
 * FotoGalerie Component
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Features:
 * - Grid-Ansicht aller Fotos
 * - Lightbox für Vollbildansicht
 * - Upload-Funktion
 * - Foto-Details (Datum, Seite, Beschreibung)
 * - Löschen und Bearbeiten
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Camera,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  MapPin,
  User,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Photo type definition
export interface Foto {
  id: string;
  url: string;
  thumbnail?: string;
  titel: string;
  beschreibung?: string;
  seite: string; // Frontseite, Rückseite, etc.
  aufgenommenAm: string;
  aufgenommenVon: string;
  tags?: string[];
}

// Mock photos for demo
const MOCK_FOTOS: Foto[] = [
  {
    id: "foto-001",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
    titel: "Frontseite Übersicht",
    beschreibung: "Gesamtansicht der Frontfassade mit sichtbaren Algenbefall im oberen Bereich",
    seite: "Frontseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
    tags: ["Algen", "Übersicht"],
  },
  {
    id: "foto-002",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200",
    titel: "Frontseite Detail",
    beschreibung: "Detailaufnahme des Algenbefall an der Nordseite",
    seite: "Frontseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
    tags: ["Algen", "Detail"],
  },
  {
    id: "foto-003",
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800",
    thumbnail: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=200",
    titel: "Rückseite Übersicht",
    beschreibung: "Rückfassade mit Balkonen",
    seite: "Rückseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Anna Schmidt",
    tags: ["Übersicht"],
  },
  {
    id: "foto-004",
    url: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800",
    thumbnail: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=200",
    titel: "Linker Giebel",
    beschreibung: "Giebelseite links mit Zuwegung",
    seite: "Linker Giebel",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
    tags: ["Giebel"],
  },
  {
    id: "foto-005",
    url: "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800",
    thumbnail: "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=200",
    titel: "Rechter Giebel",
    beschreibung: "Giebelseite rechts",
    seite: "Rechter Giebel",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Anna Schmidt",
    tags: ["Giebel"],
  },
  {
    id: "foto-006",
    url: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800",
    thumbnail: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=200",
    titel: "Eingangsbereich",
    beschreibung: "Haupteingang mit Vordach",
    seite: "Frontseite",
    aufgenommenAm: "2026-01-29",
    aufgenommenVon: "Thomas Braun",
    tags: ["Eingang", "Detail"],
  },
];

// Seiten filter options
const SEITEN_OPTIONS = [
  { value: "alle", label: "Alle Seiten" },
  { value: "Frontseite", label: "Frontseite" },
  { value: "Rückseite", label: "Rückseite" },
  { value: "Linker Giebel", label: "Linker Giebel" },
  { value: "Rechter Giebel", label: "Rechter Giebel" },
];

interface FotoGalerieProps {
  immobilieId?: string;
  fotos?: Foto[];
  onUpload?: (files: FileList) => void;
  onDelete?: (fotoId: string) => void;
  readOnly?: boolean;
}

export default function FotoGalerie({
  immobilieId,
  fotos = MOCK_FOTOS,
  onUpload,
  onDelete,
  readOnly = false,
}: FotoGalerieProps) {
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [seitenFilter, setSeitenFilter] = useState("alle");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFoto, setEditingFoto] = useState<Foto | null>(null);

  // Filter fotos by seite
  const filteredFotos = fotos.filter(
    (foto) => seitenFilter === "alle" || foto.seite === seitenFilter
  );

  // Group fotos by seite
  const fotosBySeite = filteredFotos.reduce((acc, foto) => {
    if (!acc[foto.seite]) {
      acc[foto.seite] = [];
    }
    acc[foto.seite].push(foto);
    return acc;
  }, {} as Record<string, Foto[]>);

  const handleOpenLightbox = (foto: Foto) => {
    setSelectedFoto(foto);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedFoto(null);
  };

  const handlePrevious = () => {
    if (!selectedFoto) return;
    const currentIndex = filteredFotos.findIndex((f) => f.id === selectedFoto.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredFotos.length - 1;
    setSelectedFoto(filteredFotos[prevIndex]);
  };

  const handleNext = () => {
    if (!selectedFoto) return;
    const currentIndex = filteredFotos.findIndex((f) => f.id === selectedFoto.id);
    const nextIndex = currentIndex < filteredFotos.length - 1 ? currentIndex + 1 : 0;
    setSelectedFoto(filteredFotos[nextIndex]);
  };

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        if (onUpload) {
          onUpload(files);
        } else {
          toast.success(`${files.length} Foto(s) hochgeladen`, {
            description: "Die Fotos wurden erfolgreich hinzugefügt.",
          });
        }
      }
    };
    input.click();
  };

  const handleDelete = (foto: Foto) => {
    if (onDelete) {
      onDelete(foto.id);
    } else {
      toast.success("Foto gelöscht", {
        description: `"${foto.titel}" wurde entfernt.`,
      });
    }
  };

  const handleEdit = (foto: Foto) => {
    setEditingFoto(foto);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    toast.success("Foto aktualisiert", {
      description: `"${editingFoto?.titel}" wurde gespeichert.`,
    });
    setIsEditDialogOpen(false);
    setEditingFoto(null);
  };

  const handleDownload = (foto: Foto) => {
    window.open(foto.url, "_blank");
    toast.success("Download gestartet", {
      description: `"${foto.titel}" wird heruntergeladen.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with filter and upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-medium">{fotos.length} Fotos</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Seiten Filter */}
          <div className="flex gap-1">
            {SEITEN_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={seitenFilter === option.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs",
                  seitenFilter === option.value && "ff-button"
                )}
                onClick={() => setSeitenFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {!readOnly && (
            <Button onClick={handleUploadClick} size="sm" className="gap-1 ff-button">
              <Upload className="w-4 h-4" />
              Hochladen
            </Button>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {Object.keys(fotosBySeite).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(fotosBySeite).map(([seite, seiteFotos]) => (
            <div key={seite}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {seite} ({seiteFotos.length})
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {seiteFotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                    onClick={() => handleOpenLightbox(foto)}
                  >
                    <img
                      src={foto.thumbnail || foto.url}
                      alt={foto.titel}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                    {/* Tags */}
                    {foto.tags && foto.tags.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                          {foto.tags[0]}
                        </Badge>
                      </div>
                    )}
                    {/* Actions */}
                    {!readOnly && (
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="secondary" size="icon" className="h-6 w-6">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(foto); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(foto); }}>
                              <Download className="w-4 h-4 mr-2" />
                              Herunterladen
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDelete(foto); }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add photo button */}
                {!readOnly && (
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={handleUploadClick}
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">Keine Fotos vorhanden</p>
          {!readOnly && (
            <Button onClick={handleUploadClick} className="gap-2 ff-button">
              <Upload className="w-4 h-4" />
              Erstes Foto hochladen
            </Button>
          )}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <VisuallyHidden>
            <DialogTitle>Foto-Vorschau</DialogTitle>
          </VisuallyHidden>
          {selectedFoto && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={handleCloseLightbox}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              {/* Image */}
              <div className="flex items-center justify-center min-h-[60vh] p-8">
                <img
                  src={selectedFoto.url}
                  alt={selectedFoto.titel}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>

              {/* Info bar */}
              <div className="bg-black/80 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{selectedFoto.titel}</h3>
                    {selectedFoto.beschreibung && (
                      <p className="text-sm text-gray-300 mt-1">{selectedFoto.beschreibung}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedFoto.seite}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedFoto.aufgenommenAm).toLocaleDateString("de-DE")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedFoto.aufgenommenVon}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/10"
                      onClick={() => handleDownload(selectedFoto)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                {/* Tags */}
                {selectedFoto.tags && selectedFoto.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {selectedFoto.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/10 text-white border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Counter */}
                <div className="text-center mt-4 text-sm text-gray-400">
                  {filteredFotos.findIndex((f) => f.id === selectedFoto.id) + 1} / {filteredFotos.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Foto bearbeiten</DialogTitle>
            <DialogDescription>
              Titel und Beschreibung des Fotos anpassen
            </DialogDescription>
          </DialogHeader>
          {editingFoto && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input
                  value={editingFoto.titel}
                  onChange={(e) => setEditingFoto({ ...editingFoto, titel: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea
                  value={editingFoto.beschreibung || ""}
                  onChange={(e) => setEditingFoto({ ...editingFoto, beschreibung: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Seite</label>
                <div className="flex gap-2 mt-1">
                  {["Frontseite", "Rückseite", "Linker Giebel", "Rechter Giebel"].map((seite) => (
                    <Button
                      key={seite}
                      variant={editingFoto.seite === seite ? "default" : "outline"}
                      size="sm"
                      className={editingFoto.seite === seite ? "ff-button" : ""}
                      onClick={() => setEditingFoto({ ...editingFoto, seite })}
                    >
                      {seite}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEdit} className="ff-button">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
