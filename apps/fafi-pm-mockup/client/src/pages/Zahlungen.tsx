/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Zahlungen-Seite mit echter Datenbank-Anbindung
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
  CreditCard,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Euro,
  CheckCircle2,
  Clock,
  Banknote,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Payment direction configuration (derived from context)
const paymentDirectionConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  eingang: { label: "Eingang", color: "bg-green-100 text-green-700", icon: ArrowDownLeft },
  ausgang: { label: "Ausgang", color: "bg-red-100 text-red-700", icon: ArrowUpRight },
};

// Payment type configuration (maps to paymentType enum)
const paymentTypeLabels: Record<string, { label: string }> = {
  ueberweisung: { label: "Überweisung" },
  lastschrift: { label: "Lastschrift" },
  bar: { label: "Bar" },
  kreditkarte: { label: "Kreditkarte" },
  paypal: { label: "PayPal" },
  scheck: { label: "Scheck" },
};

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  ausstehend: { label: "Ausstehend", color: "bg-amber-100 text-amber-700" },
  eingegangen: { label: "Eingegangen", color: "bg-green-100 text-green-700" },
  zugeordnet: { label: "Zugeordnet", color: "bg-blue-100 text-blue-700" },
  rueckbuchung: { label: "Rückbuchung", color: "bg-red-100 text-red-700" },
};

export default function Zahlungen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("alle");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch payments from database
  const { data: payments, isLoading, refetch } = trpc.payment.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter payments
  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch = 
      payment.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bankReference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "alle" || payment.paymentType === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  // Stats - all payments are incoming (Zahlungseingänge)
  const totalPayments = payments?.length || 0;
  const totalAmount = payments?.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0) || 0;
  const pendingPayments = payments?.filter(p => p.status === "ausstehend") || [];
  const receivedPayments = payments?.filter(p => p.status === "eingegangen" || p.status === "zugeordnet") || [];
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const totalReceived = receivedPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

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

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-primary" />
              Zahlungen
            </h1>
            <p className="text-muted-foreground mt-1">
              Zahlungseingänge und -ausgänge verfolgen
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Zahlung erfassen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Zahlung erfassen
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setTypeFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalPayments}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-xl font-bold text-green-600">{formatCurrency(totalReceived.toString())}</p>}
                  <p className="text-xs text-muted-foreground">Eingegangen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending.toString())}</p>}
                  <p className="text-xs text-muted-foreground">Ausstehend</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Euro className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalAmount.toString())}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
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
                  placeholder="Zahlungen durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Zahlungsart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Zahlungsarten</SelectItem>
                  <SelectItem value="ueberweisung">Überweisung</SelectItem>
                  <SelectItem value="lastschrift">Lastschrift</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="kreditkarte">Kreditkarte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Zahlungen gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || typeFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Erfasse deine erste Zahlung."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Zahlungsnr.</TableHead>
                    <TableHead>Kunde/Lieferant</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Zahlungsart</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const status = statusConfig[payment.status || "ausstehend"];
                    const paymentTypeLabel = paymentTypeLabels[payment.paymentType || "ueberweisung"];
                    
                    return (
                      <TableRow
                        key={payment.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <TableCell>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100">
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{getCompanyName(payment.companyId)}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{paymentTypeLabel?.label}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          +{formatCurrency(payment.amount)}
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
                <CreditCard className="w-5 h-5 text-primary" />
                Zahlung {selectedPayment?.paymentNumber}
              </DialogTitle>
              <DialogDescription>
                Zahlungsdetails und Übersicht
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                    <ArrowDownLeft className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      +{formatCurrency(selectedPayment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Zahlungseingang
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Kunde/Lieferant
                    </p>
                    <p className="font-medium">{getCompanyName(selectedPayment.companyId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Datum
                    </p>
                    <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Banknote className="w-4 h-4" /> Zahlungsart
                    </p>
                    <p className="font-medium">{paymentTypeLabels[selectedPayment.paymentType]?.label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Status
                    </p>
                    <Badge className={statusConfig[selectedPayment.status]?.color}>
                      {statusConfig[selectedPayment.status]?.label}
                    </Badge>
                  </div>
                </div>
                {selectedPayment.bankReference && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Verwendungszweck</h4>
                    <p className="text-sm text-muted-foreground">{selectedPayment.bankReference}</p>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
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
