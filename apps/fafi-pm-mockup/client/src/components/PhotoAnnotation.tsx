/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * FOTO-ANNOTATION
 * Schäden direkt auf Fotos markieren und beschriften
 * Touch-optimiert für iPad
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Circle,
  Square,
  Type,
  Trash2,
  Download,
  Undo,
  MousePointer,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Schadenstypen mit Farben
const DAMAGE_TYPES = [
  { id: "algen", label: "Algenbefall", color: "#22c55e" },
  { id: "moos", label: "Moosbefall", color: "#16a34a" },
  { id: "flechten", label: "Flechtenbefall", color: "#84cc16" },
  { id: "risse", label: "Risse", color: "#ef4444" },
  { id: "abplatzung", label: "Abplatzungen", color: "#f97316" },
  { id: "verfaerbung", label: "Verfärbungen", color: "#eab308" },
  { id: "graffiti", label: "Graffiti", color: "#8b5cf6" },
  { id: "feuchtigkeit", label: "Feuchteschäden", color: "#3b82f6" },
  { id: "sonstiges", label: "Sonstiges", color: "#6b7280" },
];

interface Annotation {
  id: string;
  type: "circle" | "rectangle" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  damageType: string;
  color: string;
}

interface PhotoAnnotationProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (annotations: Annotation[], annotatedImageUrl: string) => void;
  initialAnnotations?: Annotation[];
}

export function PhotoAnnotation({
  imageUrl,
  isOpen,
  onClose,
  onSave,
  initialAnnotations = [],
}: PhotoAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedTool, setSelectedTool] = useState<"select" | "circle" | "rectangle" | "text">("circle");
  const [selectedDamageType, setSelectedDamageType] = useState(DAMAGE_TYPES[0].id);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Bild laden
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImage(img);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Canvas zeichnen
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Canvas-Größe anpassen
    canvas.width = image.width * zoom;
    canvas.height = image.height * zoom;

    // Bild zeichnen
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Annotationen zeichnen
    annotations.forEach((ann) => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color + "40"; // Mit Transparenz
      ctx.lineWidth = 3;

      const x = ann.x * zoom;
      const y = ann.y * zoom;

      if (ann.type === "circle" && ann.radius) {
        ctx.beginPath();
        ctx.arc(x, y, ann.radius * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (ann.type === "rectangle" && ann.width && ann.height) {
        ctx.fillRect(x, y, ann.width * zoom, ann.height * zoom);
        ctx.strokeRect(x, y, ann.width * zoom, ann.height * zoom);
      } else if (ann.type === "text" && ann.text) {
        ctx.font = `bold ${16 * zoom}px Raleway, sans-serif`;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, x, y);
      }

      // Ausgewählte Annotation hervorheben
      if (selectedAnnotation === ann.id) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if (ann.type === "circle" && ann.radius) {
          ctx.beginPath();
          ctx.arc(x, y, ann.radius * zoom + 5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ann.type === "rectangle" && ann.width && ann.height) {
          ctx.strokeRect(x - 5, y - 5, ann.width * zoom + 10, ann.height * zoom + 10);
        }
        ctx.setLineDash([]);
      }
    });

    // Aktuelle Zeichnung
    if (currentAnnotation) {
      ctx.strokeStyle = currentAnnotation.color;
      ctx.fillStyle = currentAnnotation.color + "40";
      ctx.lineWidth = 3;

      const x = currentAnnotation.x * zoom;
      const y = currentAnnotation.y * zoom;

      if (currentAnnotation.type === "circle" && currentAnnotation.radius) {
        ctx.beginPath();
        ctx.arc(x, y, currentAnnotation.radius * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (currentAnnotation.type === "rectangle" && currentAnnotation.width && currentAnnotation.height) {
        ctx.fillRect(x, y, currentAnnotation.width * zoom, currentAnnotation.height * zoom);
        ctx.strokeRect(x, y, currentAnnotation.width * zoom, currentAnnotation.height * zoom);
      }
    }
  }, [annotations, currentAnnotation, image, selectedAnnotation, zoom]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Maus/Touch-Position berechnen
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  };

  // Zeichnen starten
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPosition(e);
    setStartPos(pos);

    if (selectedTool === "text") {
      setTextPosition(pos);
      setShowTextDialog(true);
      return;
    }

    if (selectedTool === "select") {
      // Annotation auswählen
      const clicked = annotations.find((ann) => {
        if (ann.type === "circle" && ann.radius) {
          const dist = Math.sqrt(Math.pow(pos.x - ann.x, 2) + Math.pow(pos.y - ann.y, 2));
          return dist <= ann.radius;
        } else if (ann.type === "rectangle" && ann.width && ann.height) {
          return pos.x >= ann.x && pos.x <= ann.x + ann.width && pos.y >= ann.y && pos.y <= ann.y + ann.height;
        }
        return false;
      });
      setSelectedAnnotation(clicked?.id || null);
      return;
    }

    setIsDrawing(true);
    const damageType = DAMAGE_TYPES.find((d) => d.id === selectedDamageType);
    
    setCurrentAnnotation({
      id: `ann-${Date.now()}`,
      type: selectedTool as "circle" | "rectangle",
      x: pos.x,
      y: pos.y,
      radius: 0,
      width: 0,
      height: 0,
      damageType: selectedDamageType,
      color: damageType?.color || "#77bc1f",
    });
  };

  // Zeichnen fortsetzen
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentAnnotation) return;

    const pos = getPosition(e);

    if (currentAnnotation.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      setCurrentAnnotation({
        ...currentAnnotation,
        x: startPos.x,
        y: startPos.y,
        radius,
      });
    } else if (currentAnnotation.type === "rectangle") {
      setCurrentAnnotation({
        ...currentAnnotation,
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      });
    }
  };

  // Zeichnen beenden
  const handleEnd = () => {
    if (isDrawing && currentAnnotation) {
      // Nur hinzufügen wenn groß genug
      const minSize = 10;
      if (
        (currentAnnotation.type === "circle" && (currentAnnotation.radius || 0) > minSize) ||
        (currentAnnotation.type === "rectangle" &&
          (currentAnnotation.width || 0) > minSize &&
          (currentAnnotation.height || 0) > minSize)
      ) {
        setAnnotations([...annotations, currentAnnotation]);
      }
    }
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  // Text hinzufügen
  const handleAddText = () => {
    if (!textInput.trim()) return;

    const damageType = DAMAGE_TYPES.find((d) => d.id === selectedDamageType);
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: "text",
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      damageType: selectedDamageType,
      color: damageType?.color || "#77bc1f",
    };

    setAnnotations([...annotations, newAnnotation]);
    setTextInput("");
    setShowTextDialog(false);
  };

  // Annotation löschen
  const handleDelete = () => {
    if (selectedAnnotation) {
      setAnnotations(annotations.filter((a) => a.id !== selectedAnnotation));
      setSelectedAnnotation(null);
    }
  };

  // Letzte Annotation rückgängig
  const handleUndo = () => {
    setAnnotations(annotations.slice(0, -1));
  };

  // Bild exportieren
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave(annotations, dataUrl);
    onClose();
  };

  const currentColor = DAMAGE_TYPES.find((d) => d.id === selectedDamageType)?.color || "#77bc1f";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Schäden markieren</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
          {/* Werkzeuge */}
          <div className="flex gap-1">
            <Button
              variant={selectedTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("select")}
              title="Auswählen"
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("circle")}
              title="Kreis"
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("rectangle")}
              title="Rechteck"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("text")}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Schadenstyp */}
          <Select value={selectedDamageType} onValueChange={setSelectedDamageType}>
            <SelectTrigger className="w-40 h-9">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {DAMAGE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-border" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Aktionen */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={annotations.length === 0}
          >
            <Undo className="w-4 h-4 mr-1" />
            Rückgängig
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={!selectedAnnotation}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Löschen
          </Button>
        </div>

        {/* Canvas-Bereich */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-muted/50 rounded-lg"
          style={{ minHeight: "300px" }}
        >
          <canvas
            ref={canvasRef}
            className="cursor-crosshair"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        {/* Legende */}
        <div className="flex flex-wrap gap-2 text-xs">
          {DAMAGE_TYPES.map((type) => (
            <div key={type.id} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span>{type.label}</span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Speichern & Schließen
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Text-Eingabe Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Beschriftung hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Text</Label>
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="z.B. Riss 5cm"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTextDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddText}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default PhotoAnnotation;
