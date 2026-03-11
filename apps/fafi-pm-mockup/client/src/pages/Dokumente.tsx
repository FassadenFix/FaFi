/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Dokumenten-Management: Upload, Vorschau, Kategorisierung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  Calendar,
  Building2,
  X,
  Plus,
  Grid,
  List,
  Clock,
  User,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Document Types
interface Dokument {
  id: string;
  name: string;
  typ: "pdf" | "image" | "excel" | "word" | "other";
  kategorie: "angebot" | "vertrag" | "foto" | "rechnung" | "protokoll" | "sonstiges";
  groesse: string;
  datum: string;
  projekt?: string;
  hochgeladenVon: string;
  vorschauUrl?: string;
}

// Helper to detect file type from name
function detectTyp(name: string): Dokument["typ"] {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  return "other";
}

// Category config
const kategorieConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  angebot: { label: "Angebot", color: "bg-blue-100 text-blue-700", icon: FileText },
  vertrag: { label: "Vertrag", color: "bg-green-100 text-green-700", icon: FileText },
  foto: { label: "Foto", color: "bg-purple-100 text-purple-700", icon: Image },
  rechnung: { label: "Rechnung", color: "bg-amber-100 text-amber-700", icon: FileSpreadsheet },
  protokoll: { label: "Protokoll", color: "bg-cyan-100 text-cyan-700", icon: FileText },
  sonstiges: { label: "Sonstiges", color: "bg-gray-100 text-gray-700", icon: File },
};

// File type icons
const typIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  image: Image,
  excel: FileSpreadsheet,
  word: FileText,
  other: File,
};

// Document Card Component
function DokumentCard({
  dokument,
  viewMode,
  onPreview,
  onDownload,
  onDelete,
}: {
  dokument: Dokument;
  viewMode: "grid" | "list";
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const TypeIcon = typIcons[dokument.typ];
  const katConfig = kategorieConfig[dokument.kategorie];

  if (viewMode === "grid") {
    return (
      <Card className="ff-card overflow-hidden group cursor-pointer" onClick={onPreview}>
        {/* Preview Area */}
        <div className="relative h-40 bg-muted">
          {dokument.vorschauUrl ? (
            <img
              src={dokument.vorschauUrl}
              alt={dokument.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); onPreview(); }}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="font-medium text-sm truncate">{dokument.name}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge className={cn("text-xs", katConfig.color)}>
              {katConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{dokument.groesse}</span>
          </div>
          {dokument.projekt && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {dokument.projekt}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <div
      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer group"
      onClick={onPreview}
    >
      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
        <TypeIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{dokument.name}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(dokument.datum).toLocaleDateString("de-DE")}
          </span>
          <span>{dokument.groesse}</span>
          {dokument.projekt && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {dokument.projekt}
            </span>
          )}
        </div>
      </div>
      <Badge className={cn("text-xs", katConfig.color)}>
        {katConfig.label}
      </Badge>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onPreview(); }}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
          <Download className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Upload Area Component
function UploadArea({ onUpload }: { onUpload: () => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="font-medium mb-2">Dateien hier ablegen</p>
      <p className="text-sm text-muted-foreground mb-4">
        oder klicken Sie zum Auswählen
      </p>
      <Button onClick={onUpload} className="ff-button">
        <Plus className="w-4 h-4 mr-2" />
        Dateien auswählen
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        PDF, JPG, PNG, XLSX bis max. 50 MB
      </p>
    </div>
  );
}

// Preview Dialog Component
function PreviewDialog({
  dokument,
  open,
  onClose,
}: {
  dokument: Dokument | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!dokument) return null;

  const katConfig = kategorieConfig[dokument.kategorie];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {dokument.name}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={cn("text-xs", katConfig.color)}>
                {katConfig.label}
              </Badge>
              <span className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(dokument.datum).toLocaleDateString("de-DE")}
              </span>
              <span className="text-xs flex items-center gap-1">
                <User className="w-3 h-3" />
                {dokument.hochgeladenVon}
              </span>
              <span className="text-xs">{dokument.groesse}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {dokument.vorschauUrl ? (
            <img
              src={dokument.vorschauUrl}
              alt={dokument.name}
              className="w-full max-h-[60vh] object-contain rounded-xl"
            />
          ) : (
            <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-24 h-24 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Vorschau nicht verfügbar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Klicken Sie auf "Herunterladen" um die Datei zu öffnen
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          <Button className="ff-button" onClick={() => toast.success("Download gestartet")}>
            <Download className="w-4 h-4 mr-2" />
            Herunterladen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dokumente() {
  // Load documents from DB
  const { data: dbDocuments, isLoading } = trpc.document.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const deleteMutation = trpc.document.delete.useMutation({
    onSuccess: () => { toast.success("Dokument gelöscht"); utils.document.list.invalidate(); },
  });
  const utils = trpc.useUtils();

  // Map DB documents to local format
  const dokumente: Dokument[] = useMemo(() => {
    if (!dbDocuments) return [];
    return dbDocuments.map((d: any) => ({
      id: String(d.id),
      name: d.title || d.fileName || "Unbenannt",
      typ: detectTyp(d.fileName || d.title || ""),
      kategorie: (d.category as Dokument["kategorie"]) || "sonstiges",
      groesse: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : "--",
      datum: d.createdAt ? new Date(d.createdAt).toISOString().split("T")[0] : "",
      projekt: d.projectId ? projects?.find((p: any) => p.id === d.projectId)?.name : undefined,
      hochgeladenVon: d.uploadedByName || "System",
      vorschauUrl: d.fileUrl || undefined,
    }));
  }, [dbDocuments, projects]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategorie, setFilterKategorie] = useState<string>("alle");
  const [filterProjekt, setFilterProjekt] = useState<string>("alle");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewDokument, setPreviewDokument] = useState<Dokument | null>(null);

  // Get unique projects
  const projekte = Array.from(new Set(dokumente.map((d) => d.projekt).filter(Boolean)));

  // Filter documents
  const filteredDokumente = dokumente.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategorie = filterKategorie === "alle" || d.kategorie === filterKategorie;
    const matchesProjekt = filterProjekt === "alle" || d.projekt === filterProjekt;
    return matchesSearch && matchesKategorie && matchesProjekt;
  });

  // Group by category for stats
  const kategorieStats = Object.entries(kategorieConfig).map(([key, config]) => ({
    key,
    ...config,
    count: dokumente.filter((d) => d.kategorie === key).length,
  }));

  const handleUpload = () => {
    toast.success("Upload-Dialog öffnen", {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  const handleDownload = (dokument: Dokument) => {
    toast.success(`${dokument.name} wird heruntergeladen...`);
  };

  const handleDelete = (dokument: Dokument) => {
    deleteMutation.mutate({ id: parseInt(dokument.id) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-primary" />
              Dokumenten-Management
            </h1>
            <p className="text-muted-foreground mt-1">
              {dokumente.length} Dokumente in {projekte.length} Projekten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
            <Select value={filterKategorie} onValueChange={setFilterKategorie}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Kategorien</SelectItem>
                {Object.entries(kategorieConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProjekt} onValueChange={setFilterProjekt}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Projekt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Projekte</SelectItem>
                {projekte.map((p) => (
                  <SelectItem key={p} value={p!}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up animate-delay-100">
          {kategorieStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.key}
                className={cn(
                  "ff-card cursor-pointer transition-all",
                  filterKategorie === stat.key && "ring-2 ring-primary"
                )}
                onClick={() => setFilterKategorie(filterKategorie === stat.key ? "alle" : stat.key)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", stat.color.split(" ")[0])}>
                    <Icon className={cn("w-5 h-5", stat.color.split(" ")[1])} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Area */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-6">
            <UploadArea onUpload={handleUpload} />
          </CardContent>
        </Card>

        {/* Documents Grid/List */}
        <div className="animate-fade-in-up animate-delay-300">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDokumente.map((dok) => (
                <DokumentCard
                  key={dok.id}
                  dokument={dok}
                  viewMode={viewMode}
                  onPreview={() => setPreviewDokument(dok)}
                  onDownload={() => handleDownload(dok)}
                  onDelete={() => handleDelete(dok)}
                />
              ))}
            </div>
          ) : (
            <Card className="ff-card">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {filteredDokumente.map((dok) => (
                    <DokumentCard
                      key={dok.id}
                      dokument={dok}
                      viewMode={viewMode}
                      onPreview={() => setPreviewDokument(dok)}
                      onDownload={() => handleDownload(dok)}
                      onDelete={() => handleDelete(dok)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredDokumente.length === 0 && (
            <Card className="ff-card">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Keine Dokumente gefunden</h3>
                <p className="text-muted-foreground">
                  Passen Sie Ihre Suchkriterien an oder laden Sie neue Dokumente hoch.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Dialog */}
        <PreviewDialog
          dokument={previewDokument}
          open={!!previewDokument}
          onClose={() => setPreviewDokument(null)}
        />
      </div>
    </DashboardLayout>
  );
}
