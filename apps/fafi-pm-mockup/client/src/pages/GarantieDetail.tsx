/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Garantiedetail-Seite mit Inspektionsprotokoll
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
  Shield,
  ArrowLeft,
  Edit,
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Download,
  AlertCircle,
  Home,
  Award,
  ClipboardCheck,
  Camera,
  History,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { generateGarantiePDF, type GarantieData } from "@/services/warrantyPdfDownload";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  abgelaufen: { label: "Abgelaufen", color: "bg-gray-100 text-gray-700", icon: Clock },
  beansprucht: { label: "Beansprucht", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  erfuellt: { label: "Erfüllt", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
};

// Warranty type labels
const warrantyTypeLabels: Record<string, { label: string; description: string }> = {
  algenfrei_garantie: { 
    label: "Algenfrei-Garantie", 
    description: "Garantiert algenfreie Fassade für den vereinbarten Zeitraum" 
  },
  ergebnisgarantie: { 
    label: "Ergebnisgarantie", 
    description: "Garantiert das vereinbarte Reinigungsergebnis" 
  },
  materialgarantie: { 
    label: "Materialgarantie", 
    description: "Garantiert die Qualität der verwendeten Materialien" 
  },
};

export default function GarantieDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const warrantyId = parseInt(params.id || "0");

  // Fetch warranty details
  const { data: warranty, isLoading } = trpc.warranty.getById.useQuery({ id: warrantyId });
  const { data: companies } = trpc.company.list.useQuery();
  const { data: orders } = trpc.order.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: properties } = trpc.property.list.useQuery();

  // Get related data
  const company = companies?.find(c => c.id === warranty?.companyId);
  const order = orders?.find(o => o.id === warranty?.orderId);
  const project = projects?.find(p => p.id === warranty?.projectId);
  const property = properties?.find(p => p.id === warranty?.propertyId);

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate remaining warranty time
  const calculateRemainingTime = () => {
    if (!warranty?.endDate) return null;
    const today = new Date();
    const end = new Date(warranty.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { expired: true, days: Math.abs(diffDays) };
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    return { expired: false, years, months, days, totalDays: diffDays };
  };

  // Calculate warranty progress (how much time has passed)
  const calculateProgress = () => {
    if (!warranty?.startDate || !warranty?.endDate) return 0;
    const start = new Date(warranty.startDate).getTime();
    const end = new Date(warranty.endDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.round(((now - start) / (end - start)) * 100);
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

  if (!warranty) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Garantie nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Die angeforderte Garantie existiert nicht.</p>
          <Button onClick={() => setLocation("/garantien")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[warranty.status || "aktiv"];
  const StatusIcon = status?.icon || Shield;
  const warrantyType = warrantyTypeLabels[warranty.warrantyType || "algenfrei_garantie"];
  const remainingTime = calculateRemainingTime();
  const progress = calculateProgress();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/garantien")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{warranty.warrantyNumber}</h1>
                <Badge className={status?.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status?.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {warrantyType?.label} • {company?.name || "Kein Unternehmen"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => {
              // Prepare warranty data for PDF
              const pdfData: GarantieData = {
                zertifikatNummer: warranty.warrantyNumber || "",
                garantieNummer: warranty.warrantyNumber || "",
                garantieTyp: warranty.warrantyType || "algenfrei_garantie",
                ausstellungsDatum: formatDate(warranty.createdAt),
                startDatum: formatDate(warranty.startDate),
                endDatum: formatDate(warranty.endDate),
                laufzeitJahre: warranty.durationYears || 5,
                firma: company?.name || "Unbekannt",
                ansprechpartner: company?.name || "",
                strasse: company?.street || "",
                plz: company?.postalCode || "",
                ort: company?.city || "",
                objektAdresse: property?.street ? `${property.street}, ${property.postalCode} ${property.city}` : company?.street || "",
                objektBeschreibung: property?.name || "Fassadenreinigung",
                auftragNummer: order?.orderNumber,
                leistungen: [
                  "Kostenlose Nachbesserung bei erneutem Algenbefall",
                  "Jaehrliche Inspektionen inklusive",
                  "Dokumentation aller durchgefuehrten Arbeiten",
                  "24h-Hotline fuer Garantiefaelle",
                ],
                bedingungen: [
                  "Gilt nur fuer die behandelten Flaechenabschnitte",
                  "Regelmaessige Inspektionen muessen wahrgenommen werden",
                  "Schaeden durch hoehere Gewalt sind ausgeschlossen",
                ],
              };
              generateGarantiePDF(pdfData);
              toast.success("Zertifikat wird heruntergeladen...");
            }}>
              <Download className="w-4 h-4" />
              Zertifikat
            </Button>
            <Button className="gap-2 ff-button" onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
              <Edit className="w-4 h-4" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Warranty Status Banner */}
        <Card className={cn(
          "animate-fade-in-up animate-delay-50",
          warranty.status === "aktiv" && "border-green-200 bg-green-50",
          warranty.status === "abgelaufen" && "border-gray-200 bg-gray-50",
          warranty.status === "beansprucht" && "border-amber-200 bg-amber-50"
        )}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  warranty.status === "aktiv" && "bg-green-100",
                  warranty.status === "abgelaufen" && "bg-gray-100",
                  warranty.status === "beansprucht" && "bg-amber-100"
                )}>
                  <Shield className={cn(
                    "w-6 h-6",
                    warranty.status === "aktiv" && "text-green-600",
                    warranty.status === "abgelaufen" && "text-gray-600",
                    warranty.status === "beansprucht" && "text-amber-600"
                  )} />
                </div>
                <div>
                  <p className="font-semibold">{warrantyType?.label}</p>
                  <p className="text-sm text-muted-foreground">{warrantyType?.description}</p>
                </div>
              </div>
              {remainingTime && !remainingTime.expired && warranty.status === "aktiv" && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Verbleibende Garantiezeit</p>
                  <p className="font-semibold text-green-700">
                    {(remainingTime.years ?? 0) > 0 && `${remainingTime.years} Jahr${remainingTime.years !== 1 ? "e" : ""} `}
                    {(remainingTime.months ?? 0) > 0 && `${remainingTime.months} Monat${remainingTime.months !== 1 ? "e" : ""} `}
                    {(remainingTime.days ?? 0) > 0 && `${remainingTime.days} Tag${remainingTime.days !== 1 ? "e" : ""}`}
                  </p>
                </div>
              )}
              {remainingTime?.expired && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Garantie abgelaufen</p>
                  <p className="font-semibold text-gray-700">seit {remainingTime.days} Tagen</p>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Garantiezeitraum</span>
                <span className="text-sm text-muted-foreground">{progress}% abgelaufen</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{formatDate(warranty.startDate)}</span>
                <span>{formatDate(warranty.endDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="animate-fade-in-up animate-delay-100">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="inspektionen">Inspektionen</TabsTrigger>
                <TabsTrigger value="historie">Historie</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Warranty Period */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Garantiezeitraum
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Beginn</p>
                        <p className="font-medium">{formatDate(warranty.startDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ende</p>
                        <p className="font-medium">{formatDate(warranty.endDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Laufzeit</p>
                        <p className="font-medium">{warranty.durationYears || 5} Jahre</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Erstellt am</p>
                        <p className="font-medium">{formatDate(warranty.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Info */}
                {property && (
                  <Card className="ff-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary" />
                        Objekt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{property.name || property.street}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.street}, {property.postalCode} {property.city}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/immobilien/${property.id}`)}>
                          Zum Objekt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                          <p className="text-sm text-muted-foreground">Auftragsdatum: {formatDate(order.orderDate)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/auftraege/${order.id}`)}>
                          Zum Auftrag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Claim Information (if warranty was claimed) */}
                {warranty.status === "beansprucht" && (
                  <Card className="ff-card border-amber-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        Garantiefall
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Gemeldet am</p>
                        <p className="font-medium">{formatDate(warranty.claimDate)}</p>
                      </div>
                      {warranty.claimDescription && (
                        <div>
                          <p className="text-sm text-muted-foreground">Beschreibung</p>
                          <p className="font-medium">{warranty.claimDescription}</p>
                        </div>
                      )}
                      {warranty.claimResolution && (
                        <div>
                          <p className="text-sm text-muted-foreground">Lösung</p>
                          <p className="font-medium">{warranty.claimResolution}</p>
                        </div>
                      )}
                      {warranty.claimResolvedAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Behoben am</p>
                          <p className="font-medium">{formatDate(warranty.claimResolvedAt)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {warranty.notes && (
                  <Card className="ff-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Notizen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{warranty.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="inspektionen" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                      Inspektionsprotokolle
                    </CardTitle>
                    <CardDescription>
                      Regelmäßige Kontrollen zur Sicherstellung der Garantiebedingungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for inspections - would need an inspections table */}
                    <div className="text-center py-8">
                      <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Noch keine Inspektionen durchgeführt</p>
                      <Button variant="outline" onClick={() => toast.info("Inspektion planen - Funktion in Entwicklung")}>
                        <Camera className="w-4 h-4 mr-2" />
                        Inspektion planen
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Inspection Schedule */}
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Inspektionsplan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((year) => {
                        const inspectionDate = new Date(warranty.startDate);
                        inspectionDate.setFullYear(inspectionDate.getFullYear() + year);
                        const isPast = inspectionDate < new Date();
                        const isUpcoming = !isPast && inspectionDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <div key={year} className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            isPast && "bg-gray-50",
                            isUpcoming && "bg-amber-50 border border-amber-200",
                            !isPast && !isUpcoming && "bg-muted/50"
                          )}>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                isPast && "bg-gray-200 text-gray-600",
                                isUpcoming && "bg-amber-200 text-amber-700",
                                !isPast && !isUpcoming && "bg-primary/10 text-primary"
                              )}>
                                {year}
                              </div>
                              <div>
                                <p className="font-medium">Jahr {year} Inspektion</p>
                                <p className="text-sm text-muted-foreground">{formatDate(inspectionDate)}</p>
                              </div>
                            </div>
                            <Badge variant={isPast ? "secondary" : isUpcoming ? "default" : "outline"}>
                              {isPast ? "Ausstehend" : isUpcoming ? "Bald fällig" : "Geplant"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historie" className="space-y-4 mt-4">
                <Card className="ff-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" />
                      Aktivitäten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium">Garantie erstellt</p>
                          <p className="text-sm text-muted-foreground">{formatDate(warranty.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div>
                          <p className="font-medium">Garantiezeitraum begonnen</p>
                          <p className="text-sm text-muted-foreground">{formatDate(warranty.startDate)}</p>
                        </div>
                      </div>
                      {warranty.claimDate && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                          <div>
                            <p className="font-medium">Garantiefall gemeldet</p>
                            <p className="text-sm text-muted-foreground">{formatDate(warranty.claimDate)}</p>
                          </div>
                        </div>
                      )}
                      {warranty.claimResolvedAt && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          <div>
                            <p className="font-medium">Garantiefall behoben</p>
                            <p className="text-sm text-muted-foreground">{formatDate(warranty.claimResolvedAt)}</p>
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
                      <p className="text-sm text-muted-foreground mt-1">
                        {company.street}<br />
                        {company.postalCode} {company.city}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Kein Unternehmen zugeordnet</p>
                )}
              </CardContent>
            </Card>

            {/* Certificate Card */}
            <Card className="ff-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Garantiezertifikat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {warranty.certificateUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Zertifikat vorhanden</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => toast.info("Zertifikat herunterladen")}>
                      <Download className="w-4 h-4 mr-2" />
                      Herunterladen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Kein Zertifikat</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => toast.info("Zertifikat erstellen - Funktion in Entwicklung")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Zertifikat erstellen
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
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Inspektion planen - Funktion in Entwicklung")}>
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Inspektion planen
                </Button>
                {warranty.status === "aktiv" && (
                  <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700" onClick={() => toast.info("Garantiefall melden - Funktion in Entwicklung")}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Garantiefall melden
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Zertifikat erstellen - Funktion in Entwicklung")}>
                  <Award className="w-4 h-4 mr-2" />
                  Zertifikat erstellen
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("E-Mail senden - Funktion in Entwicklung")}>
                  <Mail className="w-4 h-4 mr-2" />
                  Kunde benachrichtigen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
