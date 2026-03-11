/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Aufträge-Seite mit echter Datenbank-Anbindung
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
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  Euro,
  Building2,
  Calendar,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  bestaetigt: { label: "Bestätigt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  in_vorbereitung: { label: "In Vorbereitung", color: "bg-amber-100 text-amber-700", icon: Clock },
  in_durchfuehrung: { label: "In Durchführung", color: "bg-green-100 text-green-700", icon: PlayCircle },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function Auftraege() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch orders from database
  const { data: orders, isLoading, refetch } = trpc.order.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "alle" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter(o => o.status === "in_durchfuehrung").length || 0;
  const confirmedOrders = orders?.filter(o => o.status === "bestaetigt").length || 0;
  const completedOrders = orders?.filter(o => o.status === "abgeschlossen").length || 0;

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

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-primary" />
              Aufträge
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle beauftragten Projekte und deren Status
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Auftrag erstellen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Neuer Auftrag
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalOrders}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all", statusFilter === "in_durchfuehrung" && "ring-2 ring-green-500")} onClick={() => setStatusFilter(statusFilter === "in_durchfuehrung" ? "alle" : "in_durchfuehrung")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeOrders}</p>}
                  <p className="text-xs text-muted-foreground">In Arbeit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all", statusFilter === "bestaetigt" && "ring-2 ring-blue-500")} onClick={() => setStatusFilter(statusFilter === "bestaetigt" ? "alle" : "bestaetigt")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{confirmedOrders}</p>}
                  <p className="text-xs text-muted-foreground">Bestätigt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-gray-500/50 transition-all", statusFilter === "abgeschlossen" && "ring-2 ring-gray-500")} onClick={() => setStatusFilter(statusFilter === "abgeschlossen" ? "alle" : "abgeschlossen")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{completedOrders}</p>}
                  <p className="text-xs text-muted-foreground">Abgeschlossen</p>
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
                  placeholder="Aufträge durchsuchen..."
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
                  <SelectItem value="bestaetigt">Bestätigt</SelectItem>
                  <SelectItem value="in_vorbereitung">In Vorbereitung</SelectItem>
                  <SelectItem value="in_durchfuehrung">In Durchführung</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  <SelectItem value="storniert">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Aufträge gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Erstelle deinen ersten Auftrag."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auftragsnr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Auftragsdatum</TableHead>
                    <TableHead>Geplanter Start</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status || "bestaetigt"];
                    const StatusIcon = status?.icon || CheckCircle2;
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(order)}
                      >
                        <TableCell className="font-medium">
                          <div>{order.displayName || order.orderNumber}</div>
                          {order.displayName && (
                            <p className="text-xs text-muted-foreground/70 font-mono">{order.orderNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>{getCompanyName(order.companyId)}</TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>{formatDate(order.plannedStartDate)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.grossTotal)}
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
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Details anzeigen
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
                <Briefcase className="w-5 h-5 text-primary" />
                Auftrag {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Auftragsdetails und Übersicht
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Kunde
                    </p>
                    <p className="font-medium">{getCompanyName(selectedOrder.companyId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Auftragsdatum
                    </p>
                    <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Geplanter Start
                    </p>
                    <p className="font-medium">{formatDate(selectedOrder.plannedStartDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Geplantes Ende
                    </p>
                    <p className="font-medium">{formatDate(selectedOrder.plannedEndDate)}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4" /> Finanzen
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Netto</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedOrder.netTotal)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">MwSt.</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedOrder.vatAmount)}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Brutto</p>
                      <p className="text-lg font-semibold text-primary">{formatCurrency(selectedOrder.grossTotal)}</p>
                    </div>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
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
