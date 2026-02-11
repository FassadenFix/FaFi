/**
 * Foto-Annotation Komponente
 * Ermöglicht das Markieren und Beschriften von Schäden direkt auf Fotos
 * 
 * Features:
 * - Marker auf Bild setzen per Klick
 * - Beschriftung pro Marker
 * - Verschiedene Marker-Typen (Schaden, Hinweis, Besonderheit)
 * - Export der Annotationen
 */

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Info,
  Star,
  Trash2,
  Plus,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { toast } from "sonner";

// Marker-Typen
export type MarkerType = "schaden" | "hinweis" | "besonderheit";

export interface Annotation {
  id: string;
  x: number; // Prozentuale Position (0-100)
  y: number;
  type: MarkerType;
  title: string;
  description: string;
  createdAt: string;
}

interface FotoAnnotationProps {
  imageUrl: string;
  imageName?: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  readOnly?: boolean;
}

const MARKER_CONFIG: Record<MarkerType, { icon: typeof AlertTriangle; color: string; label: string }> = {
  schaden: { icon: AlertTriangle, color: "bg-red-500", label: "Schaden" },
  hinweis: { icon: Info, color: "bg-amber-500", label: "Hinweis" },
  besonderheit: { icon: Star, color: "bg-blue-500", label: "Besonderheit" },
};

export function FotoAnnotation({
  imageUrl,
  imageName = "Foto",
  annotations,
  onAnnotationsChange,
  readOnly = false,
}: FotoAnnotationProps) {
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  // Neue Annotation hinzufügen
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !isAddingMarker) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNewMarkerPosition({ x, y });
    setEditingAnnotation({
      id: "new-" + Date.now(),
      x,
      y,
      type: "schaden",
      title: "",
      description: "",
      createdAt: new Date().toISOString(),
    });
  }, [readOnly, isAddingMarker]);

  // Annotation speichern
  const handleSaveAnnotation = useCallback(() => {
    if (!editingAnnotation) return;
    
    if (!editingAnnotation.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }
    
    const isNew = editingAnnotation.id.startsWith("new-");
    const updatedAnnotations = isNew
      ? [...annotations, { ...editingAnnotation, id: "ann-" + Date.now() }]
      : annotations.map(a => a.id === editingAnnotation.id ? editingAnnotation : a);
    
    onAnnotationsChange(updatedAnnotations);
    setEditingAnnotation(null);
    setNewMarkerPosition(null);
    setIsAddingMarker(false);
    
    toast.success(isNew ? "Markierung hinzugefügt" : "Markierung aktualisiert");
  }, [editingAnnotation, annotations, onAnnotationsChange]);

  // Annotation löschen
  const handleDeleteAnnotation = useCallback((id: string) => {
    onAnnotationsChange(annotations.filter(a => a.id !== id));
    setSelectedAnnotation(null);
    toast.success("Markierung gelöscht");
  }, [annotations, onAnnotationsChange]);

  // Marker auf Bild klicken
  const handleMarkerClick = useCallback((e: React.MouseEvent, annotation: Annotation) => {
    e.stopPropagation();
    if (readOnly) {
      setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id);
    } else {
      setEditingAnnotation(annotation);
    }
  }, [readOnly, selectedAnnotation]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant={isAddingMarker ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAddingMarker(!isAddingMarker)}
              className={isAddingMarker ? "bg-[#77bc1f] hover:bg-[#77bc1f]/90" : ""}
            >
              <Plus className="w-4 h-4 mr-1" />
              Markierung setzen
            </Button>
            {isAddingMarker && (
              <span className="text-xs text-muted-foreground">
                Klicke auf das Bild, um eine Markierung zu setzen
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bild mit Annotationen */}
      <div className="relative overflow-auto border rounded-lg bg-muted/50" style={{ maxHeight: "500px" }}>
        <div
          ref={imageRef}
          className={"relative cursor-" + (isAddingMarker ? "crosshair" : "default")}
          style={{ transform: "scale(" + zoom + ")", transformOrigin: "top left" }}
          onClick={handleImageClick}
        >
          <img
            src={imageUrl}
            alt={imageName}
            className="w-full h-auto"
            draggable={false}
          />
          
          {/* Marker */}
          {annotations.map((annotation) => {
            const config = MARKER_CONFIG[annotation.type];
            const Icon = config.icon;
            const isSelected = selectedAnnotation === annotation.id;
            
            return (
              <div
                key={annotation.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: annotation.x + "%", top: annotation.y + "%" }}
                onClick={(e) => handleMarkerClick(e, annotation)}
              >
                <div className={"w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform " + config.color + " " + (isSelected ? "scale-125 ring-2 ring-white" : "hover:scale-110")}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                
                {/* Tooltip bei Hover oder Auswahl */}
                {(isSelected || !readOnly) && (
                  <div className={"absolute left-1/2 -translate-x-1/2 mt-2 p-2 bg-popover border rounded-lg shadow-lg min-w-[150px] z-10 " + (isSelected ? "block" : "hidden group-hover:block")}>
                    <div className="font-medium text-sm">{annotation.title}</div>
                    {annotation.description && (
                      <div className="text-xs text-muted-foreground mt-1">{annotation.description}</div>
                    )}
                    <Badge variant="outline" className="mt-2 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Neuer Marker Vorschau */}
          {newMarkerPosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ left: newMarkerPosition.x + "%", top: newMarkerPosition.y + "%" }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center shadow-lg ring-2 ring-white">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Annotationen Liste */}
      {annotations.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Markierungen ({annotations.length})</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="space-y-2">
              {annotations.map((annotation) => {
                const config = MARKER_CONFIG[annotation.type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={annotation.id}
                    className={"flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors " + (selectedAnnotation === annotation.id ? "bg-muted border-[#77bc1f]" : "hover:bg-muted/50")}
                    onClick={() => setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={"w-6 h-6 rounded-full flex items-center justify-center " + config.color}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{annotation.title}</div>
                        {annotation.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {annotation.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAnnotation(annotation);
                          }}
                        >
                          <Move className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(annotation.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bearbeiten Dialog */}
      <Dialog open={!!editingAnnotation} onOpenChange={(open) => !open && setEditingAnnotation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAnnotation?.id.startsWith("new-") ? "Neue Markierung" : "Markierung bearbeiten"}
            </DialogTitle>
          </DialogHeader>
          
          {editingAnnotation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select
                  value={editingAnnotation.type}
                  onValueChange={(value: MarkerType) => 
                    setEditingAnnotation({ ...editingAnnotation, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MARKER_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={"w-4 h-4 rounded-full " + config.color} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Titel *</Label>
                <Input
                  value={editingAnnotation.title}
                  onChange={(e) => setEditingAnnotation({ ...editingAnnotation, title: e.target.value })}
                  placeholder="z.B. Riss in der Fassade"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={editingAnnotation.description}
                  onChange={(e) => setEditingAnnotation({ ...editingAnnotation, description: e.target.value })}
                  placeholder="Weitere Details zur Markierung..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAnnotation(null)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveAnnotation} className="bg-[#77bc1f] hover:bg-[#77bc1f]/90">
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FotoAnnotation;
