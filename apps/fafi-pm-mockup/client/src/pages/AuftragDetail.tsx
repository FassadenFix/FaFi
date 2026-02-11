/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Auftragsdetail-Seite mit vollständigen Informationen und HubSpot-Verknüpfung
 * Integriert: AbnahmeWizard, Rechnung-aus-Auftrag
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Briefcase,
  ArrowLeft,
  Edit,
  FileText,
  Building2,
  User,
  Calendar,
  Euro,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Shield,
  HardHat,
  TrendingUp,
  AlertCircle,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import AbnahmeWizard from "@/components/AbnahmeWizard";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  bestaetigt: { label: "Bestätigt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2, bgColor: "bg-blue-500" },
  in_vorbereitung: { label: "In Vorbereitung", color: "bg-amber-100 text-amber-700", icon: Clock, bgColor: "bg-amber-500" },
  in_durchfuehrung: { label: "In Durchführung", color: "bg-green-100 text-green-700", icon: PlayCircle, bgColor: "bg-green-500" },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700", icon: CheckCircle2, bgColor: "bg-gray-500" },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700", icon: XCircle, bgColor: "bg-red-500" },
};

// Status progress mapping
const statusProgress: Record<string, number> = {
  bestaetigt: 20,
  in_vorbereitung: 40,
  in_durchfuehrung: 70,
  abgeschlossen: 100,
  storniert: 0,
};

export default function AuftragDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const orderId = parseInt(params.id || "0");

  // Wizard states
  const [isAbnahmeWizardOpen, setIsAbnahmeWizardOpen] = useState(false);

  // Fetch order details
  const { data: order, isLoading, refetch: refetchOrder } = trpc.order.getById.useQuery({ id: orderId });
  const { data: companies } = trpc.company.list.useQuery();
  const { data: contacts } = trpc.contact.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();
  const { data: invoices, refetch: refetchInvoices } = trpc.invoice.list.useQuery();
  const { data: constructionSites } = trpc.constructionSite.list.useQuery();

  // Mutation: Create invoice from order
  const createInvoiceMutation = trpc.order.createInvoiceFromOrder.useMutation({
    onSuccess: (result) => {
      toast.success(`Rechnung ${result.invoiceNumber} erstellt!`, { duration: 4000 });
      refetchInvoices();
      refetchOrder();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Get related data
  const company = companies?.find(c => c.id === order?.companyId);
  const contact = contacts?.find(c => c.id === order?.contactId);
  const project = projects?.find(p => p.id === order?.projectId);
  const kundenberater = users?.find(u => u.id === order?.kundenberaterId);
  const projektleiter = users?.find(u => u.id === order?.projektleiterId);
  
  // Get related invoices for this order
  const orderInvoices = invoices?.filter(i => i.orderId === orderId) || [];
  
  // Get related construction sites for this project
  const orderSites = constructionSites?.filter(s => s.projectId === order?.projectId) || [];

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0,00 €";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
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

  // Format date with time
  const formatDateTime = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle invoice creation from order
  const handleCreateInvoice = () => {
    if (!order) return;
    createInvoiceMutation.mutate({ orderId: order.id });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Auftrag nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Der angeforderte Auftrag existiert nicht.</p>
          <Button onClick={() => setLocation("/auftraege")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[order.status || "bestaetigt"];
  const StatusIcon = status?.icon || CheckCircle2;
  const progress = statusProgress[order.status || "bestaetigt"];

  // Determine if Abnahme button should be shown
  const canStartAbnahme = order.status === "in_durchfuehrung";
  // Determine if invoice creation button should be shown
  const canCreateInvoice = order.status !== "storniert" && order.grossTotal;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/auftraege")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                <Badge className={status?.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status?.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {company?.name || "Kein Unternehmen"} • Erstellt am {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Abnahme Button - nur bei Status "in_durchfuehrung" */}
            {canStartAbnahme && (
              <Button
                className="gap-2 bg-[#77bc1f] hover:bg-[#77bc1f]/90 text-white"
                onClick={() => setIsAbnahmeWizardOpen(true)}
              >
                <ClipboardCheck className="w-4 h-4" />
                Abnahme durchführen
              </Button>
            )}
            {order.hubspotDealId && (
              <Button variant="outline" className="gap-2" onClick={() => toast.info("HubSpot Deal öffnen")}>
                <ExternalLink className="w-4 h-4" />
                HubSpot Deal
              </Button>
            )}
            <Button className="gap-2 ff-button" onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
              <Edit className="w-4 h-4" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="ff-card animate-fade-in-up animate-delay-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Auftragsfortschritt</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Bestätigt</span>
              <span>Vorbereitung</span>
              <span>Durchführung</span>
              <span>Abgeschlossen</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="animate-fade-in-up animate-delay-100">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="finanzen">Finanzen</TabsTrigger>
                <TabsTrigger value="baustellen">Baustellen</TabsTrigger>
                <TabsTrigger value="historie">Historie</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Dates Card */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Zeitplanung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Geplanter Start</p>
                        <p className="font-medium">{formatDate(order.plannedStartDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Geplantes Ende</p>
                        <p className="font-medium">{formatDate(order.plannedEndDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tatsächlicher Start</p>
                        <p className="font-medium">{formatDate(order.actualStartDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tatsächliches Ende</p>
                        <p className="font-medium">{formatDate(order.actualEndDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes Card */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Notizen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {order.notes || "Keine Notizen vorhanden"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="finanzen" className="space-y-4 mt-4">
                {/* Financial Overview */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Euro className="w-5 h-5 text-primary" />
                      Finanzübersicht
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Auftragswert</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(order.grossTotal)}</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Fakturiert</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(
                            orderInvoices
                              .reduce((sum, inv) => sum + parseFloat(inv.grossTotal || "0"), 0)
                              .toString()
                          )}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Rechnungen</p>
                        <p className="text-xl font-bold">{orderInvoices.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoices List */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      Rechnungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orderInvoices.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Noch keine Rechnungen erstellt</p>
                    ) : (
                      <div className="space-y-2">
                        {orderInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setLocation(`/rechnungen/${inv.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <Receipt className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{inv.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(inv.invoiceDate)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(inv.grossTotal)}</p>
                              <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* 1-Klick Rechnung erstellen Button */}
                    {canCreateInvoice && (
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-[#77bc1f]/30 text-[#77bc1f] hover:bg-[#77bc1f]/10"
                        onClick={handleCreateInvoice}
                        disabled={createInvoiceMutation.isPending}
                      >
                        {createInvoiceMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Receipt className="w-4 h-4 mr-2" />
                        )}
                        {createInvoiceMutation.isPending ? "Rechnung wird erstellt..." : "Rechnung aus Auftrag erstellen"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="baustellen" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-primary" />
                      Baustellen
                    </CardTitle>
                    <CardDescription>
                      {orderSites.length} Baustelle{orderSites.length !== 1 ? "n" : ""} zu diesem Projekt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orderSites.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Keine Baustellen vorhanden</p>
                    ) : (
                      <div className="space-y-2">
                        {orderSites.map((site) => (
                          <div
                            key={site.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setLocation(`/baustellen/${site.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <HardHat className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{site.siteNumber}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {site.address || "Keine Adresse"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{site.status}</Badge>
                              <p className="text-sm text-muted-foreground mt-1">{site.progress || 0}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historie" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Aktivitäten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium">Auftrag erstellt</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                        </div>
                      </div>
                      {order.actualStartDate && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                          <div>
                            <p className="font-medium">Arbeiten begonnen</p>
                            <p className="text-sm text-muted-foreground">{formatDateTime(order.actualStartDate)}</p>
                          </div>
                        </div>
                      )}
                      {order.actualEndDate && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-500 mt-2" />
                          <div>
                            <p className="font-medium">Arbeiten abgeschlossen</p>
                            <p className="text-sm text-muted-foreground">{formatDateTime(order.actualEndDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 animate-fade-in-up animate-delay-200">
            {/* Customer Card */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Kunde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company ? (
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    {company.street && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {company.street}, {company.postalCode} {company.city}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Kein Unternehmen zugeordnet</p>
                )}
                
                <Separator />
                
                {contact ? (
                  <div>
                    <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                    <p className="text-sm text-muted-foreground">{contact.position || "Ansprechpartner"}</p>
                    {contact.phone && (
                      <p className="text-sm flex items-center gap-1 mt-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.email && (
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {contact.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Kein Ansprechpartner zugeordnet</p>
                )}
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Kundenberater</p>
                  <p className="font-medium">{kundenberater?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projektleiter</p>
                  <p className="font-medium">{projektleiter?.name || "—"}</p>
                </div>
              </CardContent>
            </Card>

            {/* HubSpot Card */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-orange-500" />
                  HubSpot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.hubspotDealId ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Mit HubSpot verknüpft</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Deal-ID: {order.hubspotDealId}
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => toast.info("HubSpot Deal öffnen")}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      In HubSpot öffnen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Nicht verknüpft</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => toast.info("HubSpot-Verknüpfung - Funktion in Entwicklung")}>
                      Mit HubSpot verknüpfen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Abnahme starten - nur bei Durchführung */}
                {canStartAbnahme && (
                  <Button
                    className="w-full justify-start gap-2 bg-[#77bc1f] hover:bg-[#77bc1f]/90 text-white"
                    onClick={() => setIsAbnahmeWizardOpen(true)}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Abnahme durchführen
                  </Button>
                )}
                {/* Rechnung erstellen */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreateInvoice}
                  disabled={createInvoiceMutation.isPending || !canCreateInvoice}
                >
                  {createInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4 mr-2" />
                  )}
                  Rechnung erstellen
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Garantie erstellen - Funktion in Entwicklung")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Garantie erstellen
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("PDF exportieren - Funktion in Entwicklung")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Auftragsbestätigung PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Abnahme Wizard */}
      <AbnahmeWizard
        isOpen={isAbnahmeWizardOpen}
        onClose={() => setIsAbnahmeWizardOpen(false)}
        onComplete={() => {
          setIsAbnahmeWizardOpen(false);
          refetchOrder();
          refetchInvoices();
        }}
        orderId={order.id}
        orderNumber={order.orderNumber}
        projectId={order.projectId || 0}
        projectName={project?.name || "Unbekanntes Projekt"}
        companyName={company?.name || "Unbekannter Kunde"}
        orderTotal={order.grossTotal || "0"}
      />
    </DashboardLayout>
  );
}
