import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  Camera, ChevronLeft, ChevronRight, Download, X, 
  Grid3X3, List, Filter, ZoomIn, Maximize2 
} from "lucide-react";

interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string | null;
  filename: string;
  originalFilename?: string | null;
  context: string;
  category?: string | null;
  side?: string | null;
  description?: string | null;
  companyName?: string | null;
  address?: string | null;
  fileSize?: number | null;
  createdAt: Date | string;
}

interface FotoGalerieViewProps {
  propertyId?: number;
  constructionSiteId?: number;
  projectId?: number;
  logEntryId?: number;
  context?: string;
  title?: string;
  showFilters?: boolean;
  compact?: boolean;
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
  vorher_dokumentation: "Vorher",
  nachher_dokumentation: "Nachher",
  baustelle_fortschritt: "Fortschritt",
  ereignis: "Ereignis",
  abnahme: "Abnahme",
  schaden: "Schaden",
  allgemein: "Allgemein",
};

const CONTEXT_COLORS: Record<string, string> = {
  objektaufnahme: "bg-blue-100 text-blue-800",
  vorher_dokumentation: "bg-amber-100 text-amber-800",
  nachher_dokumentation: "bg-green-100 text-green-800",
  baustelle_fortschritt: "bg-purple-100 text-purple-800",
  ereignis: "bg-red-100 text-red-800",
  abnahme: "bg-emerald-100 text-emerald-800",
  schaden: "bg-orange-100 text-orange-800",
  allgemein: "bg-gray-100 text-gray-800",
};

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FotoGalerieView({
  propertyId,
  constructionSiteId,
  projectId,
  logEntryId,
  context,
  title = "Fotos",
  showFilters = true,
  compact = false,
}: FotoGalerieViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filterContext, setFilterContext] = useState<string>("all");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: photos = [], isLoading } = trpc.photo.list.useQuery(
    { propertyId, constructionSiteId, projectId, logEntryId, context },
    { enabled: !!(propertyId || constructionSiteId || projectId || logEntryId || context) }
  );

  const filteredPhotos = useMemo(() => {
    let result = photos as Photo[];
    if (filterContext !== "all") result = result.filter(p => p.context === filterContext);
    if (filterSide !== "all") result = result.filter(p => p.side === filterSide);
    return result;
  }, [photos, filterContext, filterSide]);

  const contextCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (photos as Photo[]).forEach(p => {
      counts[p.context] = (counts[p.context] || 0) + 1;
    });
    return counts;
  }, [photos]);

  const currentIndex = selectedPhoto ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) : -1;

  const navigatePhoto = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length
      : (currentIndex + 1) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Fotos werden geladen...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Camera className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">Noch keine Fotos vorhanden</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title} ({photos.length})</CardTitle>
            <div className="flex items-center gap-2">
              {!compact && (
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && Object.keys(contextCounts).length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge
                variant={filterContext === "all" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setFilterContext("all")}
              >
                Alle ({photos.length})
              </Badge>
              {Object.entries(contextCounts).map(([ctx, count]) => (
                <Badge
                  key={ctx}
                  variant={filterContext === ctx ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${filterContext === ctx ? "" : CONTEXT_COLORS[ctx] || ""}`}
                  onClick={() => setFilterContext(ctx)}
                >
                  {CONTEXT_LABELS[ctx] || ctx} ({count})
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {viewMode === "grid" ? (
            <div className={`grid gap-2 ${compact ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"}`}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square relative group rounded-md overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.description || photo.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {photo.context && !compact && (
                    <Badge className={`absolute top-1 left-1 text-[9px] px-1 py-0 ${CONTEXT_COLORS[photo.context] || ""}`}>
                      {CONTEXT_LABELS[photo.context] || photo.context}
                    </Badge>
                  )}
                  {photo.side && !compact && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                      {SIDE_LABELS[photo.side] || photo.side}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 p-2 rounded-md border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.description || photo.filename}
                    className="w-12 h-12 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{photo.description || photo.filename}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-[10px] px-1 py-0 ${CONTEXT_COLORS[photo.context] || ""}`}>
                        {CONTEXT_LABELS[photo.context] || photo.context}
                      </Badge>
                      {photo.side && (
                        <span className="text-xs text-muted-foreground">{SIDE_LABELS[photo.side]}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatFileSize(photo.fileSize)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <div className="relative bg-black">
            {/* Navigation */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image */}
            {selectedPhoto && (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || selectedPhoto.filename}
                className="w-full max-h-[70vh] object-contain"
              />
            )}

            {/* Counter */}
            {filteredPhotos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {currentIndex + 1} / {filteredPhotos.length}
              </div>
            )}
          </div>

          {/* Photo Info */}
          {selectedPhoto && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={CONTEXT_COLORS[selectedPhoto.context] || ""}>
                    {CONTEXT_LABELS[selectedPhoto.context] || selectedPhoto.context}
                  </Badge>
                  {selectedPhoto.side && (
                    <Badge variant="outline">{SIDE_LABELS[selectedPhoto.side] || selectedPhoto.side}</Badge>
                  )}
                  {selectedPhoto.category && (
                    <Badge variant="outline">{selectedPhoto.category}</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedPhoto) window.open(selectedPhoto.url, "_blank");
                  }}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Original
                </Button>
              </div>
              {selectedPhoto.description && (
                <p className="text-sm text-muted-foreground">{selectedPhoto.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{selectedPhoto.filename}</span>
                <span>{formatFileSize(selectedPhoto.fileSize)}</span>
                <span>{new Date(selectedPhoto.createdAt).toLocaleString("de-DE")}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
