/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Rechnungen-Seite mit echter Datenbank-Anbindung
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
  Receipt,
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
  Euro,
  Send,
  Download,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  entwurf: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: Clock },
  erstellt: { label: "Erstellt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  versendet: { label: "Versendet", color: "bg-purple-100 text-purple-700", icon: Send },
  bezahlt: { label: "Bezahlt", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  teilbezahlt: { label: "Teilbezahlt", color: "bg-amber-100 text-amber-700", icon: Clock },
  ueberfaellig: { label: "Überfällig", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  storniert: { label: "Storniert", color: "bg-gray-100 text-gray-700", icon: XCircle },
  gemahnt: { label: "Gemahnt", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

// Invoice type configuration
const invoiceTypeConfig: Record<string, { label: string; color: string }> = {
  abschlagsrechnung: { label: "Abschlagsrechnung", color: "bg-blue-100 text-blue-700" },
  schlussrechnung: { label: "Schlussrechnung", color: "bg-green-100 text-green-700" },
  teilrechnung: { label: "Teilrechnung", color: "bg-purple-100 text-purple-700" },
  gutschrift: { label: "Gutschrift", color: "bg-amber-100 text-amber-700" },
};

export default function Rechnungen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch invoices from database
  const { data: invoices, isLoading, refetch } = trpc.invoice.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter invoices
  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "alle" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const totalInvoices = invoices?.length || 0;
  const paidInvoices = invoices?.filter(i => i.status === "bezahlt").length || 0;
  const openInvoices = invoices?.filter(i => i.status === "versendet" || i.status === "teilbezahlt").length || 0;
  const overdueInvoices = invoices?.filter(i => i.status === "ueberfaellig" || i.status === "gemahnt").length || 0;

  // Calculate total amounts
  const totalOpen = invoices?.filter(i => i.status === "versendet" || i.status === "teilbezahlt")
    .reduce((sum, i) => sum + parseFloat(i.openAmount || i.grossTotal || "0"), 0) || 0;

  // Get company name by ID
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE");
  };

  // Check if overdue
  const isOverdue = (dueDate: Date | null, status: string | null) => {
    if (!dueDate || status === "bezahlt" || status === "storniert") return false;
    return new Date(dueDate) < new Date();
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-7 h-7 text-primary" />
              Rechnungen
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle Rechnungen erstellen und verwalten
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Rechnung erstellen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Neue Rechnung
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalInvoices}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all", statusFilter === "bezahlt" && "ring-2 ring-green-500")} onClick={() => setStatusFilter(statusFilter === "bezahlt" ? "alle" : "bezahlt")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{paidInvoices}</p>}
                  <p className="text-xs text-muted-foreground">Bezahlt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all", statusFilter === "versendet" && "ring-2 ring-amber-500")} onClick={() => setStatusFilter(statusFilter === "versendet" ? "alle" : "versendet")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{openInvoices}</p>}
                  <p className="text-xs text-muted-foreground">Offen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all", statusFilter === "ueberfaellig" && "ring-2 ring-red-500")} onClick={() => setStatusFilter(statusFilter === "ueberfaellig" ? "alle" : "ueberfaellig")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{overdueInvoices}</p>}
                  <p className="text-xs text-muted-foreground">Überfällig</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Amount Summary */}
        {totalOpen > 0 && (
          <Card className="ff-card bg-amber-50 border-amber-200 animate-fade-in-up animate-delay-150">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Euro className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700">Offene Forderungen</p>
                    <p className="text-2xl font-bold text-amber-800">{formatCurrency(totalOpen.toString())}</p>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Mahnlauf starten
                </Button>
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
                  placeholder="Rechnungen durchsuchen..."
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
                  <SelectItem value="entwurf">Entwurf</SelectItem>
                  <SelectItem value="erstellt">Erstellt</SelectItem>
                  <SelectItem value="versendet">Versendet</SelectItem>
                  <SelectItem value="bezahlt">Bezahlt</SelectItem>
                  <SelectItem value="teilbezahlt">Teilbezahlt</SelectItem>
                  <SelectItem value="ueberfaellig">Überfällig</SelectItem>
                  <SelectItem value="gemahnt">Gemahnt</SelectItem>
                  <SelectItem value="storniert">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Rechnungen gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Erstelle deine erste Rechnung."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Rechnungsdatum</TableHead>
                    <TableHead>Fällig am</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status || "entwurf"];
                    const StatusIcon = status?.icon || Clock;
                    const invoiceType = invoiceTypeConfig[invoice.invoiceType || "schlussrechnung"];
                    const overdue = isOverdue(invoice.dueDate, invoice.status);
                    
                    return (
                      <TableRow
                        key={invoice.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          overdue && "bg-red-50/50"
                        )}
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <TableCell className="font-medium">
                          <div>{invoice.displayName || invoice.invoiceNumber}</div>
                          {invoice.displayName && (
                            <p className="text-xs text-muted-foreground/70 font-mono">{invoice.invoiceNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>{getCompanyName(invoice.companyId)}</TableCell>
                        <TableCell>
                          <Badge className={invoiceType?.color}>
                            {invoiceType?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell className={cn(overdue && "text-red-600 font-medium")}>
                          {formatDate(invoice.dueDate)}
                          {overdue && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(invoice.grossTotal)}
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
                              <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Details anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("PDF herunterladen - Funktion in Entwicklung")}>
                                <Download className="w-4 h-4 mr-2" />
                                PDF herunterladen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Per E-Mail senden - Funktion in Entwicklung")}>
                                <Mail className="w-4 h-4 mr-2" />
                                Per E-Mail senden
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
                <Receipt className="w-5 h-5 text-primary" />
                Rechnung {selectedInvoice?.invoiceNumber}
              </DialogTitle>
              <DialogDescription>
                Rechnungsdetails und Übersicht
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Kunde
                    </p>
                    <p className="font-medium">{getCompanyName(selectedInvoice.companyId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Receipt className="w-4 h-4" /> Rechnungstyp
                    </p>
                    <p className="font-medium">
                      {invoiceTypeConfig[selectedInvoice.invoiceType]?.label || selectedInvoice.invoiceType}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Rechnungsdatum
                    </p>
                    <p className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Fällig am
                    </p>
                    <p className={cn(
                      "font-medium",
                      isOverdue(selectedInvoice.dueDate, selectedInvoice.status) && "text-red-600"
                    )}>
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4" /> Beträge
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Netto</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedInvoice.netTotal)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">MwSt. ({selectedInvoice.vatRate || "19"}%)</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedInvoice.vatAmount)}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Brutto</p>
                      <p className="text-lg font-semibold text-primary">{formatCurrency(selectedInvoice.grossTotal)}</p>
                    </div>
                  </div>
                  {(selectedInvoice.paidAmount || selectedInvoice.openAmount) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">Bezahlt</p>
                        <p className="text-lg font-semibold text-green-800">{formatCurrency(selectedInvoice.paidAmount)}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700">Offen</p>
                        <p className="text-lg font-semibold text-amber-800">{formatCurrency(selectedInvoice.openAmount)}</p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedInvoice.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button variant="outline" onClick={() => toast.info("PDF herunterladen - Funktion in Entwicklung")}>
                <Download className="w-4 h-4 mr-2" />
                PDF
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
