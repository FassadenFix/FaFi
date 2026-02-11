/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Garantien & Inspektionen Seite mit echter Datenbank-Anbindung
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileCheck,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  Shield,
  FileText,
  Download,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  abgelaufen: { label: "Abgelaufen", color: "bg-gray-100 text-gray-700", icon: Clock },
  beansprucht: { label: "Beansprucht", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  erfuellt: { label: "Erfüllt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
};

// Warranty type configuration
const warrantyTypeConfig: Record<string, { label: string; color: string }> = {
  algenfrei_garantie: { label: "Algenfrei-Garantie", color: "bg-green-100 text-green-700" },
  ergebnisgarantie: { label: "Ergebnisgarantie", color: "bg-blue-100 text-blue-700" },
  materialgarantie: { label: "Materialgarantie", color: "bg-purple-100 text-purple-700" },
};

export default function Garantien() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch warranties from database
  const { data: warranties, isLoading, refetch } = trpc.warranty.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter warranties
  const filteredWarranties = warranties?.filter((warranty) => {
    const matchesSearch = 
      warranty.warrantyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warranty.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "alle" || warranty.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const totalWarranties = warranties?.length || 0;
  const activeWarranties = warranties?.filter(w => w.status === "aktiv").length || 0;
  const claimedWarranties = warranties?.filter(w => w.status === "beansprucht").length || 0;
  const expiredWarranties = warranties?.filter(w => w.status === "abgelaufen").length || 0;

  // Get company name by ID
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE");
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate: Date | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (warranty: any) => {
    setSelectedWarranty(warranty);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="w-7 h-7 text-primary" />
              Garantien & Inspektionen
            </h1>
            <p className="text-muted-foreground mt-1">
              Garantieleistungen und geplante Inspektionen verwalten
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Garantie erstellen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Neue Garantie
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalWarranties}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all", statusFilter === "aktiv" && "ring-2 ring-green-500")} onClick={() => setStatusFilter(statusFilter === "aktiv" ? "alle" : "aktiv")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeWarranties}</p>}
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all", statusFilter === "beansprucht" && "ring-2 ring-amber-500")} onClick={() => setStatusFilter(statusFilter === "beansprucht" ? "alle" : "beansprucht")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{claimedWarranties}</p>}
                  <p className="text-xs text-muted-foreground">Beansprucht</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-gray-500/50 transition-all", statusFilter === "abgelaufen" && "ring-2 ring-gray-500")} onClick={() => setStatusFilter(statusFilter === "abgelaufen" ? "alle" : "abgelaufen")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{expiredWarranties}</p>}
                  <p className="text-xs text-muted-foreground">Abgelaufen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Garantien durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="abgelaufen">Abgelaufen</SelectItem>
                  <SelectItem value="beansprucht">Beansprucht</SelectItem>
                  <SelectItem value="erfuellt">Erfüllt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Warranties Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredWarranties.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Garantien gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Erstelle deine erste Garantie."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Garantienr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Gültig von</TableHead>
                    <TableHead>Gültig bis</TableHead>
                    <TableHead>Restlaufzeit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarranties.map((warranty) => {
                    const status = statusConfig[warranty.status || "aktiv"];
                    const StatusIcon = status?.icon || CheckCircle2;
                    const warrantyType = warrantyTypeConfig[warranty.warrantyType || "algenfrei_garantie"];
                    const daysUntilExpiry = getDaysUntilExpiry(warranty.endDate);
                    
                    return (
                      <TableRow
                        key={warranty.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(warranty)}
                      >
                        <TableCell className="font-medium">
                          <div>{warranty.displayName || warranty.warrantyNumber}</div>
                          {warranty.displayName && (
                            <p className="text-xs text-muted-foreground/70 font-mono">{warranty.warrantyNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>{getCompanyName(warranty.companyId)}</TableCell>
                        <TableCell>
                          <Badge className={warrantyType?.color}>
                            {warrantyType?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(warranty.startDate)}</TableCell>
                        <TableCell>{formatDate(warranty.endDate)}</TableCell>
                        <TableCell>
                          {daysUntilExpiry !== null && (
                            <span className={cn(
                              "font-medium",
                              daysUntilExpiry < 0 && "text-red-600",
                              daysUntilExpiry >= 0 && daysUntilExpiry <= 90 && "text-amber-600",
                              daysUntilExpiry > 90 && "text-green-600"
                            )}>
                              {daysUntilExpiry < 0 
                                ? `${Math.abs(daysUntilExpiry)} Tage abgelaufen`
                                : `${daysUntilExpiry} Tage`}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", status?.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {status?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(warranty)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Details anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Zertifikat herunterladen - Funktion in Entwicklung")}>
                                <Download className="w-4 h-4 mr-2" />
                                Zertifikat
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                                <Edit className="w-4 h-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Garantie {selectedWarranty?.warrantyNumber}
              </DialogTitle>
              <DialogDescription>
                Garantiedetails und Übersicht
              </DialogDescription>
            </DialogHeader>
            {selectedWarranty && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Kunde
                    </p>
                    <p className="font-medium">{getCompanyName(selectedWarranty.companyId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileCheck className="w-4 h-4" /> Garantietyp
                    </p>
                    <p className="font-medium">
                      {warrantyTypeConfig[selectedWarranty.warrantyType]?.label || selectedWarranty.warrantyType}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Gültig von
                    </p>
                    <p className="font-medium">{formatDate(selectedWarranty.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Gültig bis
                    </p>
                    <p className="font-medium">{formatDate(selectedWarranty.endDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Laufzeit
                    </p>
                    <p className="font-medium">{selectedWarranty.durationYears || "—"} Jahre</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Status
                    </p>
                    <Badge className={statusConfig[selectedWarranty.status]?.color}>
                      {statusConfig[selectedWarranty.status]?.label}
                    </Badge>
                  </div>
                </div>
                {selectedWarranty.claimDescription && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" /> Garantiefall
                    </h4>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm">{selectedWarranty.claimDescription}</p>
                      {selectedWarranty.claimDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Gemeldet am: {formatDate(selectedWarranty.claimDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {selectedWarranty.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedWarranty.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button variant="outline" onClick={() => toast.info("Zertifikat herunterladen - Funktion in Entwicklung")}>
                <Download className="w-4 h-4 mr-2" />
                Zertifikat
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
