/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Zentrales Archiv – ALLE Dokumente, Dateien und Verknüpfungen
 * Aggregiert: documents, photos, offers (PDF), invoices (PDF), warranties (Zertifikat), dunning (PDF)
 * Jeder Eintrag zeigt seine Herkunft (Quelle) und alle Verknüpfungen (Projekt, Baustelle, Immobilie, etc.)
 */

import { useState, useRef, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Archive,
  FileText,
  Image,
  Video,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  Calendar,
  Building2,
  FileSpreadsheet,
  File,
  Loader2,
  X,
  CheckCircle,
  Briefcase,
  Receipt,
  Shield,
  Link as LinkIcon,
  Camera,
  FileCheck,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Home,
  MapPin,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HelpTooltip, SectionHelp, HELP_TEXTS } from "@/components/HelpTooltip";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// Quellen-Tabs für die Filterung
const QUELLEN = [
  { id: "alle", label: "Alle Quellen", icon: Archive, count: "total" },
  { id: "dokument", label: "Dokumente", icon: FileText, count: "documents" },
  { id: "fotos", label: "Fotos", icon: Camera, count: "photos" },
  { id: "angebote", label: "Angebots-PDFs", icon: FileCheck, count: "offerPdfs" },
  { id: "rechnungen", label: "Rechnungs-PDFs", icon: Receipt, count: "invoicePdfs" },
  { id: "garantien", label: "Garantie-Zertifikate", icon: Shield, count: "warrantyPdfs" },
  { id: "mahnungen", label: "Mahnungs-PDFs", icon: AlertTriangle, count: "dunningPdfs" },
] as const;

const KATEGORIEN = [
  { id: "alle", label: "Alle Kategorien" },
  { id: "angebot", label: "Angebot" },
  { id: "auftragsbestaetigung", label: "Auftragsbestätigung" },
  { id: "rechnung", label: "Rechnung" },
  { id: "garantie", label: "Garantie" },
  { id: "objektaufnahme", label: "Objektaufnahme" },
  { id: "protokoll", label: "Protokoll" },
  { id: "abnahmeprotokoll", label: "Abnahmeprotokoll" },
  { id: "foto", label: "Foto" },
  { id: "bewohnerinfo", label: "Bewohnerinfo" },
  { id: "sonstiges", label: "Sonstiges" },
];

function getFileIcon(mimeType: string | null | undefined, source?: string) {
  if (source === 'foto') return <Camera className="w-5 h-5 text-purple-500" />;
  if (source === 'angebot') return <FileCheck className="w-5 h-5 text-primary" />;
  if (source === 'rechnung') return <Receipt className="w-5 h-5 text-amber-500" />;
  if (source === 'garantie') return <Shield className="w-5 h-5 text-blue-500" />;
  if (source === 'mahnung') return <AlertTriangle className="w-5 h-5 text-red-500" />;
  if (!mimeType) return <File className="w-5 h-5 text-gray-500" />;
  if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  if (mimeType.includes("word") || mimeType.includes("document")) return <FileText className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes("image")) return <Image className="w-5 h-5 text-purple-500" />;
  if (mimeType.includes("video")) return <Video className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(mimeType: string): "dokument" | "bild" | "video" | "sonstiges" {
  if (mimeType.includes("image")) return "bild";
  if (mimeType.includes("video")) return "video";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("spreadsheet") || mimeType.includes("text")) return "dokument";
  return "sonstiges";
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  dokument: { label: "Archiv-Dokument", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  foto: { label: "Foto", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  angebot: { label: "Angebots-PDF", color: "bg-primary/10 text-primary border-primary/20" },
  rechnung: { label: "Rechnungs-PDF", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  garantie: { label: "Garantie-Zertifikat", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  mahnung: { label: "Mahnungs-PDF", color: "bg-red-500/10 text-red-700 border-red-200" },
};

type ArchiveItem = {
  id: string; source: string; name: string; displayName: string | null; fileType: string; category: string;
  url: string; mimeType: string; fileSize: number | null; createdAt: string | Date | null;
  projectId: number | null; companyId: number | null; constructionSiteId: number | null;
  propertyId: number | null; offerId: number | null; orderId: number | null;
  invoiceId: number | null; warrantyId: number | null; contactId: number | null;
  description: string | null; thumbnailUrl: string | null; autoArchived: boolean;
};

export default function Archiv() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuelle, setSelectedQuelle] = useState("alle");
  const [selectedProjekt, setSelectedProjekt] = useState("alle");
  const [selectedKategorie, setSelectedKategorie] = useState("alle");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "",
    description: "",
    projectId: "",
    orderId: "",
    invoiceId: "",
    warrantyId: "",
  });
  const [previewItem, setPreviewItem] = useState<ArchiveItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries - aggregated archive overview
  const { data: archiveData, isLoading, refetch } = trpc.document.getArchiveOverview.useQuery(
    selectedQuelle !== "alle" ? { source: selectedQuelle } : undefined
  );
  const { data: projects = [] } = trpc.project.list.useQuery();
  const { data: ordersData } = trpc.order.list.useQuery();
  const { data: invoicesData } = trpc.invoice.list.useQuery();
  const { data: warrantiesData } = trpc.warranty.list.useQuery();
  const { data: companiesData } = trpc.company.list.useQuery();
  const { data: constructionSitesData } = trpc.constructionSite.list.useQuery();

  const orders = ordersData || [];
  const invoices = invoicesData || [];
  const warranties = warrantiesData || [];
  const companiesList = companiesData || [];
  const constructionSites = constructionSitesData || [];

  const items: ArchiveItem[] = (archiveData?.items as ArchiveItem[]) || [];
  const stats = archiveData?.stats || {
    total: 0, documents: 0, photos: 0, offerPdfs: 0, invoicePdfs: 0,
    warrantyPdfs: 0, dunningPdfs: 0, autoArchived: 0, manualUploaded: 0,
  };

  const createDocument = trpc.document.create.useMutation({
    onSuccess: () => {
      refetch();
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadForm({ name: "", category: "", description: "", projectId: "", orderId: "", invoiceId: "", warrantyId: "" });
      toast.success("Datei hochgeladen", {
        description: "Die Datei wurde erfolgreich im Archiv gespeichert.",
      });
    },
    onError: (error) => {
      toast.error("Fehler beim Hochladen", { description: error.message });
    },
  });
  const deleteDocument = trpc.document.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Datei gelöscht");
    },
  });

  // Highlight helper – wraps matching text in <mark>
  const highlightText = useCallback((text: string | null | undefined, query: string): React.ReactNode => {
    if (!text || !query || query.length < 2) return text || "";
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }, []);

  // Filter items – Volltextsuche über alle Felder inkl. Verknüpfungs-Namen
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (!q) {
        // Kein Suchbegriff – nur Kategorie/Projekt-Filter
      } else {
        // Durchsuche: Name, Beschreibung, Kategorie, Quelle, Dateiname
        const directMatch = 
          item.name.toLowerCase().includes(q) ||
          (item.displayName && item.displayName.toLowerCase().includes(q)) ||
          (item.description || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q) ||
          (item.source || "").toLowerCase().includes(q) ||
          (SOURCE_LABELS[item.source]?.label || "").toLowerCase().includes(q);
        
        // Durchsuche: Verknüpfte Entitäten (Projekt, Baustelle, Unternehmen, Auftrag, Rechnung, Garantie)
        const entityMatch = 
          (item.projectId && (getProjectName(item.projectId) || "").toLowerCase().includes(q)) ||
          (item.constructionSiteId && (getConstructionSiteName(item.constructionSiteId) || "").toLowerCase().includes(q)) ||
          (item.companyId && (getCompanyName(item.companyId) || "").toLowerCase().includes(q)) ||
          (item.orderId && (getOrderNumber(item.orderId) || "").toLowerCase().includes(q)) ||
          (item.invoiceId && (getInvoiceNumber(item.invoiceId) || "").toLowerCase().includes(q)) ||
          (item.warrantyId && (getWarrantyNumber(item.warrantyId) || "").toLowerCase().includes(q));
        
        if (!directMatch && !entityMatch) return false;
      }
      const matchesProjekt = selectedProjekt === "alle" ||
        (item.projectId && item.projectId.toString() === selectedProjekt);
      const matchesKategorie = selectedKategorie === "alle" || item.category === selectedKategorie;
      return matchesProjekt && matchesKategorie;
    });
  }, [items, searchQuery, selectedProjekt, selectedKategorie, projects, constructionSites, companiesList, orders, invoices, warranties]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ""),
      }));
      setUploadDialogOpen(true);
    }
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadResponse.ok) throw new Error("Upload fehlgeschlagen");
      const { key, url } = await uploadResponse.json();
      await createDocument.mutateAsync({
        name: uploadForm.name || selectedFile.name,
        originalName: selectedFile.name,
        fileType: getFileType(selectedFile.type),
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        s3Key: key,
        s3Url: url,
        projectId: uploadForm.projectId && uploadForm.projectId !== "none" ? parseInt(uploadForm.projectId) : undefined,
        orderId: uploadForm.orderId && uploadForm.orderId !== "none" ? parseInt(uploadForm.orderId) : undefined,
        invoiceId: uploadForm.invoiceId && uploadForm.invoiceId !== "none" ? parseInt(uploadForm.invoiceId) : undefined,
        warrantyId: uploadForm.warrantyId && uploadForm.warrantyId !== "none" ? parseInt(uploadForm.warrantyId) : undefined,
        category: uploadForm.category || undefined,
        description: uploadForm.description || undefined,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen", {
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (item: ArchiveItem) => {
    if (item.url) {
      window.open(item.url, "_blank");
      toast.success("Download gestartet", { description: `${item.displayName || item.name} wird heruntergeladen...` });
    }
  };

  const handleDelete = async (item: ArchiveItem) => {
    if (!item.id.startsWith("doc-")) {
      toast.info("Nur Archiv-Dokumente können hier gelöscht werden", {
        description: "Fotos, Angebots-PDFs etc. werden an ihrer Quelle verwaltet.",
      });
      return;
    }
    const docId = parseInt(item.id.replace("doc-", ""));
    if (confirm(`Möchten Sie "${item.name}" wirklich löschen?`)) {
      await deleteDocument.mutateAsync({ id: docId });
    }
  };

  // Get names by ID
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.name || null;
  };
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return null;
    return companiesList.find(c => c.id === companyId)?.name || null;
  };
  const getConstructionSiteName = (csId: number | null) => {
    if (!csId) return null;
    return constructionSites.find(cs => cs.id === csId)?.name || null;
  };
  const getOrderNumber = (orderId: number | null) => {
    if (!orderId) return null;
    return orders.find((o: any) => o.id === orderId)?.orderNumber || null;
  };
  const getInvoiceNumber = (invoiceId: number | null) => {
    if (!invoiceId) return null;
    return invoices.find((i: any) => i.id === invoiceId)?.invoiceNumber || null;
  };
  const getWarrantyNumber = (warrantyId: number | null) => {
    if (!warrantyId) return null;
    return warranties.find((w: any) => w.id === warrantyId)?.warrantyNumber || null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Archive className="w-7 h-7 text-primary" />
              Zentrales Archiv
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle Dokumente, Fotos, PDFs und Verknüpfungen aus dem gesamten System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Aktualisieren
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Datei hochladen
            </Button>
          </div>
        </div>

        {/* Statistik-Karten – erweitert */}
        <SectionHelp
          title="Automatische Archivierung & Benennung"
          helpTextKey="archivBenennung"
          description="Jede Datei bekommt automatisch einen Namen nach dem Schema: Jahr_Firma_Typ_Nummer_Version. Dateien werden beim Erstellen (z.B. Angebots-PDF) automatisch archiviert."
          tips={[
            "Auto-Archiv: Dateien, die das System automatisch gespeichert hat (z.B. bei PDF-Generierung)",
            "Quellen-Filter: Filtere nach Herkunft – Dokumente, Fotos, Angebote, Rechnungen, Garantien oder Mahnungen",
            "Farbige Badges: Zeigen die Verknüpfung – Klick öffnet die Detailseite",
          ]}
          className="mb-2"
          defaultOpen={false}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Gesamt", value: stats.total, icon: Archive, color: "text-primary" },
            { label: "Dokumente", value: stats.documents, icon: FileText, color: "text-blue-500" },
            { label: "Fotos", value: stats.photos, icon: Camera, color: "text-purple-500" },
            { label: "Angebote", value: stats.offerPdfs, icon: FileCheck, color: "text-primary" },
            { label: "Rechnungen", value: stats.invoicePdfs, icon: Receipt, color: "text-amber-500" },
            { label: "Garantien", value: stats.warrantyPdfs, icon: Shield, color: "text-blue-500" },
            { label: "Mahnungen", value: stats.dunningPdfs, icon: AlertTriangle, color: "text-red-500" },
            { label: "Auto-Archiv", value: stats.autoArchived, icon: HardDrive, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.label} className="ff-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <stat.icon className={cn("w-5 h-5 shrink-0", stat.color)} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quellen-Tabs */}
        <Tabs value={selectedQuelle} onValueChange={setSelectedQuelle}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {QUELLEN.map((q) => (
              <TabsTrigger key={q.id} value={q.id} className="gap-2 shrink-0">
                <q.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{q.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {stats[q.count as keyof typeof stats] ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter und Suche */}
        <Card className="ff-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Volltextsuche: Name, Beschreibung, Projekt, Baustelle, Unternehmen, Auftrag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedKategorie} onValueChange={setSelectedKategorie}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORIEN.map((kat) => (
                    <SelectItem key={kat.id} value={kat.id}>{kat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedProjekt} onValueChange={setSelectedProjekt}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Projekt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Projekte</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {searchQuery || selectedKategorie !== "alle" || selectedProjekt !== "alle" ? (
                <div className="flex items-center gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredItems.length} Treffer
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSearchQuery("");
                    setSelectedKategorie("alle");
                    setSelectedProjekt("alle");
                  }}>
                    <X className="w-4 h-4 mr-1" /> Filter zurücksetzen
                  </Button>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Dateiliste */}
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Dateien ({filteredItems.length})
              {filteredItems.length !== items.length && (
                <span className="text-sm font-normal text-muted-foreground">
                  von {items.length} gesamt
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Dateien gefunden</p>
                <p className="text-sm mt-1">
                  {items.length > 0 ? "Passen Sie Ihre Filter an" : "Laden Sie Ihre erste Datei hoch oder erstellen Sie ein Angebot"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Dateiname</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Verknüpfungen</TableHead>
                    <TableHead>Größe</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>{getFileIcon(item.mimeType, item.source)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{highlightText(item.displayName || item.name, searchQuery)}</p>
                          {item.displayName && item.displayName !== item.name && (
                            <p className="text-xs text-muted-foreground/70 font-mono">{item.name}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{highlightText(item.description, searchQuery)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {SOURCE_LABELS[item.source] ? (
                          <Badge variant="outline" className={cn("text-xs", SOURCE_LABELS[item.source].color)}>
                            {SOURCE_LABELS[item.source].label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">{item.source}</Badge>
                        )}
                        {item.autoArchived && (
                          <Badge variant="outline" className="text-xs ml-1 bg-green-500/10 text-green-700 border-green-200">
                            Auto
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.category ? (
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">–</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.projectId && (
                            <Link href={`/projekte/${item.projectId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs">
                                <Building2 className="w-3 h-3" />
                                {highlightText(getProjectName(item.projectId) || `P-${item.projectId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.companyId && (
                            <Link href={`/kontakte`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-blue-500/5">
                                <Users className="w-3 h-3 text-blue-600" />
                                {highlightText(getCompanyName(item.companyId) || `U-${item.companyId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.constructionSiteId && (
                            <Link href={`/baustellen/${item.constructionSiteId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-orange-500/5">
                                <MapPin className="w-3 h-3 text-orange-600" />
                                {highlightText(getConstructionSiteName(item.constructionSiteId) || `BS-${item.constructionSiteId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.propertyId && (
                            <Link href={`/immobilien/${item.propertyId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-teal-500/5">
                                <Home className="w-3 h-3 text-teal-600" />
                                Imm-{item.propertyId}
                              </Badge>
                            </Link>
                          )}
                          {item.offerId && (
                            <Link href={`/angebote/${item.offerId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-primary/5">
                                <FileCheck className="w-3 h-3 text-primary" />
                                Ang-{item.offerId}
                              </Badge>
                            </Link>
                          )}
                          {item.orderId && (
                            <Link href={`/auftraege/${item.orderId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-green-500/5">
                                <Briefcase className="w-3 h-3 text-green-600" />
                                {highlightText(getOrderNumber(item.orderId) || `A-${item.orderId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.invoiceId && (
                            <Link href={`/rechnungen/${item.invoiceId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-amber-500/5">
                                <Receipt className="w-3 h-3 text-amber-600" />
                                {highlightText(getInvoiceNumber(item.invoiceId) || `R-${item.invoiceId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.warrantyId && (
                            <Link href={`/garantien/${item.warrantyId}`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-purple-500/5">
                                <Shield className="w-3 h-3 text-purple-600" />
                                {highlightText(getWarrantyNumber(item.warrantyId) || `G-${item.warrantyId}`, searchQuery)}
                              </Badge>
                            </Link>
                          )}
                          {item.contactId && (
                            <Link href={`/kontakte`}>
                              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs bg-indigo-500/5">
                                <Users className="w-3 h-3 text-indigo-600" />
                                K-{item.contactId}
                              </Badge>
                            </Link>
                          )}
                          {!item.projectId && !item.companyId && !item.constructionSiteId && !item.propertyId && !item.offerId && !item.orderId && !item.invoiceId && !item.warrantyId && !item.contactId && (
                            <span className="text-muted-foreground text-sm">–</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("de-DE") : "–"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setPreviewItem(item)} title="Vorschau">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(item)} title="Herunterladen">
                            <Download className="w-4 h-4" />
                          </Button>
                          {item.id.startsWith("doc-") && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} title="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Vorschau Dialog */}
        <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewItem && getFileIcon(previewItem.mimeType, previewItem.source)}
                {previewItem?.name}
              </DialogTitle>
              <DialogDescription>
                {previewItem?.description || "Keine Beschreibung"} • {formatFileSize(previewItem?.fileSize)}
                {previewItem?.source && ` • Quelle: ${SOURCE_LABELS[previewItem.source]?.label || previewItem.source}`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {previewItem?.mimeType?.includes("image") ? (
                <div className="flex items-center justify-center bg-muted rounded-lg p-4 max-h-[60vh] overflow-auto">
                  <img
                    src={previewItem.thumbnailUrl || previewItem.url}
                    alt={previewItem.name}
                    className="max-w-full max-h-[55vh] object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-center py-12 text-muted-foreground"><p>Bild kann nicht geladen werden</p></div>';
                    }}
                  />
                </div>
              ) : previewItem?.mimeType?.includes("pdf") ? (
                <div className="bg-muted rounded-lg overflow-hidden" style={{ height: '60vh' }}>
                  <iframe
                    src={`${previewItem.url}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    title={previewItem.name}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted rounded-lg">
                  <File className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium">Vorschau nicht verfügbar</p>
                  <p className="text-sm mt-1">Dieser Dateityp kann nicht direkt angezeigt werden</p>
                  {previewItem?.url && (
                    <Button className="mt-4 gap-2" onClick={() => window.open(previewItem.url, '_blank')}>
                      <Download className="w-4 h-4" />
                      Datei herunterladen
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Alle Verknüpfungen in der Vorschau */}
            {previewItem && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Verknüpfungen & Zuordnungen:</p>
                <div className="flex flex-wrap gap-2">
                  {previewItem.projectId && (
                    <Link href={`/projekte/${previewItem.projectId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                        <Building2 className="w-3 h-3" />
                        {getProjectName(previewItem.projectId) || `Projekt ${previewItem.projectId}`}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.companyId && (
                    <Link href={`/kontakte`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-blue-500/5">
                        <Users className="w-3 h-3 text-blue-600" />
                        {getCompanyName(previewItem.companyId) || `Unternehmen ${previewItem.companyId}`}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.constructionSiteId && (
                    <Link href={`/baustellen/${previewItem.constructionSiteId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-orange-500/5">
                        <MapPin className="w-3 h-3 text-orange-600" />
                        {getConstructionSiteName(previewItem.constructionSiteId) || `Baustelle ${previewItem.constructionSiteId}`}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.propertyId && (
                    <Link href={`/immobilien/${previewItem.propertyId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-teal-500/5">
                        <Home className="w-3 h-3 text-teal-600" />
                        Immobilie {previewItem.propertyId}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.offerId && (
                    <Link href={`/angebote/${previewItem.offerId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-primary/5">
                        <FileCheck className="w-3 h-3 text-primary" />
                        Angebot {previewItem.offerId}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.orderId && (
                    <Link href={`/auftraege/${previewItem.orderId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-green-500/5">
                        <Briefcase className="w-3 h-3 text-green-600" />
                        {getOrderNumber(previewItem.orderId) || `Auftrag ${previewItem.orderId}`}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.invoiceId && (
                    <Link href={`/rechnungen/${previewItem.invoiceId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-amber-500/5">
                        <Receipt className="w-3 h-3 text-amber-600" />
                        {getInvoiceNumber(previewItem.invoiceId) || `Rechnung ${previewItem.invoiceId}`}
                      </Badge>
                    </Link>
                  )}
                  {previewItem.warrantyId && (
                    <Link href={`/garantien/${previewItem.warrantyId}`}>
                      <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted bg-purple-500/5">
                        <Shield className="w-3 h-3 text-purple-600" />
                        {getWarrantyNumber(previewItem.warrantyId) || `Garantie ${previewItem.warrantyId}`}
                      </Badge>
                    </Link>
                  )}
                  {!previewItem.projectId && !previewItem.companyId && !previewItem.constructionSiteId && !previewItem.propertyId && !previewItem.offerId && !previewItem.orderId && !previewItem.invoiceId && !previewItem.warrantyId && (
                    <span className="text-muted-foreground text-sm">Keine Verknüpfungen</span>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              {previewItem?.url && (
                <Button variant="outline" className="gap-2" onClick={() => window.open(previewItem.url, '_blank')}>
                  <Download className="w-4 h-4" />
                  Herunterladen
                </Button>
              )}
              <Button onClick={() => setPreviewItem(null)}>Schließen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Datei hochladen & verknüpfen
              </DialogTitle>
              <DialogDescription>
                Fügen Sie Details zur Datei hinzu und verknüpfen Sie sie mit Projekten, Aufträgen oder Rechnungen
              </DialogDescription>
            </DialogHeader>

            {selectedFile && (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedFile(null); setUploadDialogOpen(false); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Form */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Anzeigename</Label>
                    <Input
                      id="name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name der Datei"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategorie</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {KATEGORIEN.filter(k => k.id !== "alle").map((kat) => (
                          <SelectItem key={kat.id} value={kat.id}>{kat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Projekt zuordnen</Label>
                      <Select
                        value={uploadForm.projectId}
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, projectId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Projekt (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Projekt</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Auftrag zuordnen</Label>
                      <Select
                        value={uploadForm.orderId}
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, orderId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auftrag (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Auftrag</SelectItem>
                          {orders.map((o: any) => (
                            <SelectItem key={o.id} value={o.id.toString()}>{o.orderNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Rechnung zuordnen</Label>
                      <Select
                        value={uploadForm.invoiceId}
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, invoiceId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rechnung (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Keine Rechnung</SelectItem>
                          {invoices.map((i: any) => (
                            <SelectItem key={i.id} value={i.id.toString()}>{i.invoiceNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Garantie zuordnen</Label>
                      <Select
                        value={uploadForm.warrantyId}
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, warrantyId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Garantie (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Keine Garantie</SelectItem>
                          {warranties.map((w: any) => (
                            <SelectItem key={w.id} value={w.id.toString()}>{w.warrantyNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optionale Beschreibung..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setSelectedFile(null); }}>
                Abbrechen
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="gap-2">
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Hochladen</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
