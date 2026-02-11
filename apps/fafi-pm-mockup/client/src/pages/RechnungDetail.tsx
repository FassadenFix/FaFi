/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Rechnungsdetail-Seite mit Zahlungshistorie und HubSpot-Verknüpfung
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
  Receipt,
  ArrowLeft,
  Edit,
  FileText,
  Building2,
  User,
  Calendar,
  Euro,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  CreditCard,
  Printer,
  Download,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { generateRechnungPDF, type RechnungData } from "@/services/invoicePdfDownload";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  entwurf: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: FileText },
  erstellt: { label: "Erstellt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  versendet: { label: "Versendet", color: "bg-amber-100 text-amber-700", icon: Send },
  bezahlt: { label: "Bezahlt", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  teilbezahlt: { label: "Teilbezahlt", color: "bg-cyan-100 text-cyan-700", icon: CreditCard },
  ueberfaellig: { label: "Überfällig", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  storniert: { label: "Storniert", color: "bg-red-100 text-red-700", icon: XCircle },
  gemahnt: { label: "Gemahnt", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
};

// Invoice type labels
const invoiceTypeLabels: Record<string, string> = {
  abschlagsrechnung: "Abschlagsrechnung",
  schlussrechnung: "Schlussrechnung",
  teilrechnung: "Teilrechnung",
  gutschrift: "Gutschrift",
};

export default function RechnungDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params.id || "0");

  // Fetch invoice details
  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery({ id: invoiceId });
  const { data: companies } = trpc.company.list.useQuery();
  const { data: contacts } = trpc.contact.list.useQuery();
  const { data: orders } = trpc.order.list.useQuery();
  const { data: payments } = trpc.payment.list.useQuery();

  // Get related data
  const company = companies?.find(c => c.id === invoice?.companyId);
  const contact = contacts?.find(c => c.id === invoice?.contactId);
  const order = orders?.find(o => o.id === invoice?.orderId);
  
  // Get payments for this invoice
  const invoicePayments = payments?.filter(p => p.invoiceId === invoiceId) || [];

  // Dunning (Mahnlauf)
  const { data: dunningHistory } = trpc.dunning.getHistory.useQuery({ invoiceId });
  const createDunningMutation = trpc.dunning.createReminder.useMutation({
    onSuccess: () => {
      toast.success("Mahnung erstellt");
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

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

  // Calculate payment progress
  const calculatePaymentProgress = () => {
    if (!invoice?.grossTotal) return 0;
    const gross = parseFloat(invoice.grossTotal);
    const paid = parseFloat(invoice.paidAmount || "0");
    if (gross === 0) return 0;
    return Math.min(100, Math.round((paid / gross) * 100));
  };

  // Check if overdue
  const isOverdue = () => {
    if (!invoice?.dueDate || invoice.status === "bezahlt") return false;
    return new Date(invoice.dueDate) < new Date();
  };

  // Days until due or overdue
  const getDaysInfo = () => {
    if (!invoice?.dueDate) return null;
    const today = new Date();
    const due = new Date(invoice.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (invoice.status === "bezahlt") return null;
    if (diffDays < 0) return { days: Math.abs(diffDays), overdue: true };
    return { days: diffDays, overdue: false };
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

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Rechnung nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Die angeforderte Rechnung existiert nicht.</p>
          <Button onClick={() => setLocation("/rechnungen")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[invoice.status || "entwurf"];
  const StatusIcon = status?.icon || FileText;
  const paymentProgress = calculatePaymentProgress();
  const daysInfo = getDaysInfo();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/rechnungen")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
                <Badge className={status?.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status?.label}
                </Badge>
                <Badge variant="outline">{invoiceTypeLabels[invoice.invoiceType || "schlussrechnung"]}</Badge>
              </div>
              <p className="text-muted-foreground">
                {company?.name || "Kein Unternehmen"} • Rechnungsdatum: {formatDate(invoice.invoiceDate)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => {
              // Prepare invoice data for PDF
              const pdfData: RechnungData = {
                rechnungNummer: invoice.invoiceNumber || "",
                auftragNummer: order?.orderNumber,
                datum: formatDate(invoice.invoiceDate),
                faelligBis: formatDate(invoice.dueDate),
                rechnungsTyp: invoice.invoiceType || "schlussrechnung",
                firma: company?.name || "Unbekannt",
                ansprechpartner: contact ? `${contact.firstName} ${contact.lastName}` : "",
                strasse: company?.street || "",
                plz: company?.postalCode || "",
                ort: company?.city || "",
                ffAnsprechpartner: "Alexander Retzlaff",
                ffEmail: "info@fassadenfix.de",
                ffTelefon: "0345 218392 35",
                positionen: [
                  {
                    pos: 1,
                    menge: "1",
                    bezeichnung: invoice.notes || "FassadenFix Systemreinigung",
                    einzelpreis: parseFloat(invoice.netTotal || "0"),
                    gesamt: parseFloat(invoice.netTotal || "0"),
                  },
                ],
                nettobetrag: parseFloat(invoice.netTotal || "0"),
                mwst: parseFloat(invoice.vatAmount || "0"),
                gesamtsumme: parseFloat(invoice.grossTotal || "0"),
                zahlungsziel: "7 Tage netto",
                bankverbindung: {
                  bank: "Sparkasse Halle",
                  iban: "DE89 8005 3762 0123 4567 89",
                  bic: "NOLADE21HAL",
                },
                projektName: order?.orderNumber,
              };
              generateRechnungPDF(pdfData);
              toast.success("PDF wird heruntergeladen...");
            }}>
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => toast.info("Drucken - Funktion in Entwicklung")}>
              <Printer className="w-4 h-4" />
              Drucken
            </Button>
            <Button className="gap-2 ff-button" onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
              <Edit className="w-4 h-4" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue() && (
          <Card className="border-red-200 bg-red-50 animate-fade-in-up animate-delay-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Rechnung überfällig</p>
                <p className="text-sm text-red-600">
                  Diese Rechnung ist seit {daysInfo?.days} Tagen überfällig. Offener Betrag: {formatCurrency(invoice.openAmount)}
                </p>
              </div>
              <Button variant="destructive" size="sm" className="ml-auto" onClick={() => toast.info("Mahnung erstellen - Funktion in Entwicklung")}>
                Mahnung erstellen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Progress */}
        <Card className="ff-card animate-fade-in-up animate-delay-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Zahlungsfortschritt</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(invoice.paidAmount)} von {formatCurrency(invoice.grossTotal)} ({paymentProgress}%)
              </span>
            </div>
            <Progress value={paymentProgress} className={cn("h-3", paymentProgress === 100 && "bg-green-100")} />
            {daysInfo && !daysInfo.overdue && (
              <p className="text-sm text-muted-foreground mt-2">
                Fällig in {daysInfo.days} Tag{daysInfo.days !== 1 ? "en" : ""} ({formatDate(invoice.dueDate)})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="animate-fade-in-up animate-delay-150">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="zahlungen">Zahlungen</TabsTrigger>
                <TabsTrigger value="mahnungen">Mahnungen</TabsTrigger>
                <TabsTrigger value="historie">Historie</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Financial Summary */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Euro className="w-5 h-5 text-primary" />
                      Rechnungsbetrag
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Netto</span>
                        <span className="font-medium">{formatCurrency(invoice.netTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MwSt. ({invoice.vatRate || "19"}%)</span>
                        <span className="font-medium">{formatCurrency(invoice.vatAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Brutto</span>
                        <span className="font-bold">{formatCurrency(invoice.grossTotal)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bereits bezahlt</span>
                        <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Offen</span>
                        <span className={cn("font-bold", parseFloat(invoice.openAmount || "0") > 0 ? "text-amber-600" : "text-green-600")}>
                          {formatCurrency(invoice.openAmount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dates Card */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Termine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rechnungsdatum</p>
                        <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Fälligkeitsdatum</p>
                        <p className={cn("font-medium", isOverdue() && "text-red-600")}>{formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Bezahlt am</p>
                        <p className="font-medium">{formatDate(invoice.paidAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Mahnstufe</p>
                        <p className="font-medium">{invoice.dunningLevel || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Order */}
                {order && (
                  <Card className="ff-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Zugehöriger Auftrag
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">Brutto: {formatCurrency(order.grossTotal)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/auftraege/${order.id}`)}>
                          Zum Auftrag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {invoice.notes && (
                  <Card className="ff-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Notizen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="zahlungen" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-primary" />
                      Zahlungshistorie
                    </CardTitle>
                    <CardDescription>
                      {invoicePayments.length} Zahlung{invoicePayments.length !== 1 ? "en" : ""} erfasst
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoicePayments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Keine Zahlungen erfasst</p>
                    ) : (
                      <div className="space-y-3">
                        {invoicePayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{payment.paymentNumber}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-muted-foreground">{payment.paymentType}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4" onClick={() => toast.info("Zahlung erfassen - Funktion in Entwicklung")}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Zahlung erfassen
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mahnungen" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Mahnhistorie
                      </CardTitle>
                      {invoice && (invoice.status === 'versendet' || invoice.status === 'ueberfaellig' || invoice.status === 'teilbezahlt' || invoice.status === 'gemahnt') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          onClick={() => {
                            const nextLevel = (invoice.dunningLevel || 0) + 1;
                            if (nextLevel > 4) {
                              toast.error("Maximale Mahnstufe erreicht");
                              return;
                            }
                            createDunningMutation.mutate({
                              invoiceId: invoiceId,
                              level: nextLevel,
                              sentVia: 'email',
                            });
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Mahnung senden (Stufe {(invoice?.dunningLevel || 0) + 1})
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      Aktuelle Mahnstufe: {invoice?.dunningLevel || 0} von 4
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dunningHistory && dunningHistory.length > 0 ? (
                      <div className="space-y-3">
                        {dunningHistory.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              entry.level === 1 ? "bg-yellow-100 text-yellow-700" :
                              entry.level === 2 ? "bg-orange-100 text-orange-700" :
                              entry.level === 3 ? "bg-red-100 text-red-700" :
                              "bg-red-200 text-red-800"
                            )}>
                              {entry.level}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{entry.subject}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>{formatDate(entry.sentAt || entry.createdAt)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {entry.sentVia === 'email' ? 'E-Mail' : entry.sentVia === 'post' ? 'Post' : 'Manuell'}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  entry.status === 'sent' ? "border-green-300 text-green-700" :
                                  entry.status === 'draft' ? "border-gray-300 text-gray-700" :
                                  "border-orange-300 text-orange-700"
                                )}>
                                  {entry.status === 'sent' ? 'Versendet' : entry.status === 'draft' ? 'Entwurf' : entry.status}
                                </Badge>
                              </div>
                              {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(entry.amount)}</p>
                              {entry.dunningFee && parseFloat(entry.dunningFee) > 0 && (
                                <p className="text-xs text-muted-foreground">+ {formatCurrency(entry.dunningFee)} Gebühr</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Keine Mahnungen vorhanden</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historie" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Aktivitäten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium">Rechnung erstellt</p>
                          <p className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                        </div>
                      </div>
                      {invoice.sentAt && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                          <div>
                            <p className="font-medium">Rechnung versendet</p>
                            <p className="text-sm text-muted-foreground">{formatDate(invoice.sentAt)}</p>
                          </div>
                        </div>
                      )}
                      {invoicePayments.map((payment, idx) => (
                        <div key={payment.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                          <div>
                            <p className="font-medium">Zahlung eingegangen: {formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                          </div>
                        </div>
                      ))}
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
                  Rechnungsempfänger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company ? (
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    {company.street && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {company.street}<br />
                        {company.postalCode} {company.city}
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

            {/* Bank Details */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Bankverbindung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Kontoinhaber</p>
                  <p className="font-medium">FassadenFix GmbH</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IBAN</p>
                  <p className="font-medium font-mono">DE89 3704 0044 0532 0130 00</p>
                </div>
                <div>
                  <p className="text-muted-foreground">BIC</p>
                  <p className="font-medium font-mono">COBADEFFXXX</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verwendungszweck</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Zahlung erfassen - Funktion in Entwicklung")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Zahlung erfassen
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Per E-Mail senden - Funktion in Entwicklung")}>
                  <Send className="w-4 h-4 mr-2" />
                  Per E-Mail senden
                </Button>
                {parseFloat(invoice.openAmount || "0") > 0 && (
                  <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700" onClick={() => toast.info("Mahnung erstellen - Funktion in Entwicklung")}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Mahnung erstellen
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Stornieren - Funktion in Entwicklung")}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Stornieren
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
