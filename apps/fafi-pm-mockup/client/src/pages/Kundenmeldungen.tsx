/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Kundenmeldungen-Seite mit echter Datenbank-Anbindung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  MessageSquareWarning,
  Plus,
  Search,
  Edit,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageCircle,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Report type configuration
const reportTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  reklamation: { label: "Reklamation", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  anfrage: { label: "Anfrage", color: "bg-blue-100 text-blue-700", icon: MessageCircle },
  feedback: { label: "Feedback", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  beschwerde: { label: "Beschwerde", color: "bg-amber-100 text-amber-700", icon: MessageSquareWarning },
  lob: { label: "Lob", color: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
};

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  neu: { label: "Neu", color: "bg-blue-100 text-blue-700" },
  in_bearbeitung: { label: "In Bearbeitung", color: "bg-amber-100 text-amber-700" },
  warten_auf_kunde: { label: "Warten auf Kunde", color: "bg-purple-100 text-purple-700" },
  geloest: { label: "Gelöst", color: "bg-green-100 text-green-700" },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700" },
};

// Priority configuration
const priorityConfig: Record<string, { label: string; color: string }> = {
  niedrig: { label: "Niedrig", color: "bg-gray-100 text-gray-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  hoch: { label: "Hoch", color: "bg-amber-100 text-amber-700" },
  dringend: { label: "Dringend", color: "bg-red-100 text-red-700" },
};

export default function Kundenmeldungen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [typeFilter, setTypeFilter] = useState<string>("alle");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch customer reports from database
  const { data: reports, isLoading, refetch } = trpc.customerReport.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter reports
  const filteredReports = reports?.filter((report) => {
    const matchesSearch = 
      report.reportNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "alle" || report.status === statusFilter;
    const matchesType = typeFilter === "alle" || report.reportType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Stats
  const totalReports = reports?.length || 0;
  const newReports = reports?.filter(r => r.status === "neu").length || 0;
  const inProgressReports = reports?.filter(r => r.status === "in_bearbeitung").length || 0;
  const resolvedReports = reports?.filter(r => r.status === "geloest" || r.status === "abgeschlossen").length || 0;

  // Get company name by ID
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format relative time
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "—";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `vor ${days} Tag${days > 1 ? "en" : ""}`;
    if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? "n" : ""}`;
    return "gerade eben";
  };

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquareWarning className="w-7 h-7 text-primary" />
              Kundenmeldungen
            </h1>
            <p className="text-muted-foreground mt-1">
              Reklamationen, Anfragen und Feedback verwalten
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Meldung erfassen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Neue Meldung
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquareWarning className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalReports}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all", statusFilter === "neu" && "ring-2 ring-blue-500")} onClick={() => setStatusFilter(statusFilter === "neu" ? "alle" : "neu")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{newReports}</p>}
                  <p className="text-xs text-muted-foreground">Neu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all", statusFilter === "in_bearbeitung" && "ring-2 ring-amber-500")} onClick={() => setStatusFilter(statusFilter === "in_bearbeitung" ? "alle" : "in_bearbeitung")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{inProgressReports}</p>}
                  <p className="text-xs text-muted-foreground">In Bearbeitung</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{resolvedReports}</p>}
                  <p className="text-xs text-muted-foreground">Gelöst</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning for new reports */}
        {newReports > 0 && (
          <Card className="ff-card bg-blue-50 border-blue-200 animate-fade-in-up animate-delay-150">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">{newReports} neue Meldung{newReports > 1 ? "en" : ""}</p>
                  <p className="text-sm text-blue-700">Bitte zeitnah bearbeiten.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Meldungen durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Typ filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Typen</SelectItem>
                  {Object.entries(reportTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquareWarning className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Meldungen gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "alle" || typeFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Noch keine Kundenmeldungen erfasst."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Meldungsnr.</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Absender</TableHead>
                    <TableHead>Eingegangen</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const typeConfig = reportTypeConfig[report.reportType || "anfrage"];
                    const TypeIcon = typeConfig?.icon || MessageCircle;
                    const status = statusConfig[report.status || "neu"];
                    const priority = priorityConfig[report.priority || "normal"];
                    
                    return (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(report)}
                      >
                        <TableCell>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeConfig?.color)}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{report.reportNumber}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{report.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {getCompanyName(report.companyId)}
                          </div>
                        </TableCell>
                        <TableCell>{formatRelativeTime(report.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={priority?.color}>{priority?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-primary" />
                Meldung {selectedReport?.reportNumber}
              </DialogTitle>
              <DialogDescription>
                Meldungsdetails und Bearbeitungsstatus
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    reportTypeConfig[selectedReport.reportType]?.color
                  )}>
                    {(() => {
                      const TypeIcon = reportTypeConfig[selectedReport.reportType]?.icon || MessageCircle;
                      return <TypeIcon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedReport.subject}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={reportTypeConfig[selectedReport.reportType]?.color}>
                        {reportTypeConfig[selectedReport.reportType]?.label}
                      </Badge>
                      <Badge className={priorityConfig[selectedReport.priority]?.color}>
                        {priorityConfig[selectedReport.priority]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Kunde
                    </p>
                    <p className="font-medium">{getCompanyName(selectedReport.companyId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Eingegangen
                    </p>
                    <p className="font-medium">{formatDate(selectedReport.createdAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Status
                    </p>
                    <Badge className={statusConfig[selectedReport.status]?.color}>
                      {statusConfig[selectedReport.status]?.label}
                    </Badge>
                  </div>
                  {selectedReport.companyId && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> Kunde
                      </p>
                      <p className="font-medium">{getCompanyName(selectedReport.companyId)}</p>
                    </div>
                  )}
                </div>
                
                {selectedReport.description && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Beschreibung
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                )}
                {selectedReport.resolution && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Lösung
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedReport.resolution}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
