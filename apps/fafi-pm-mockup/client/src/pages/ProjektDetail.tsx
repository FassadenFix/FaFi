/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * - Projekt-Zeitstrahl mit organischen Verbindungen
 * - Tab-Navigation für verschiedene Bereiche
 * - Vollständige DB-Anbindung mit allen Verknüpfungen
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  MapPin,
  FileText,
  HardHat,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  Receipt,
  Shield,
  ClipboardList,
  Briefcase,
  FolderOpen,
  Activity,
  Plus,
  Eye,
  Download,
  AlertTriangle,
  TrendingUp,
  Link2,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import TeamsIntegration from "@/components/TeamsIntegration";
import { WorkflowActionBar } from "@/components/WorkflowActionBar";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import FotoGalerieView from "@/components/FotoGalerieView";
import { Camera } from "lucide-react";
import ObjektaufnahmeWizard from "@/components/ObjektaufnahmeWizard";
import AngebotWizard from "@/components/AngebotWizard";
import { useState } from "react";

// Phase configuration
const PHASE_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  objektaufnahme: { label: "Objektaufnahme", color: "#77bc1f", order: 1 },
  angebot_erstellt: { label: "Angebot erstellt", color: "#77bc1f", order: 2 },
  angebot_versendet: { label: "Angebot versendet", color: "#77bc1f", order: 3 },
  nachfassen: { label: "Nachfassen", color: "#f59e0b", order: 4 },
  auftrag_gewonnen: { label: "Auftrag gewonnen", color: "#77bc1f", order: 5 },
  planung: { label: "Planung", color: "#3b82f6", order: 6 },
  vorbereitung: { label: "Vorbereitung", color: "#3b82f6", order: 7 },
  durchfuehrung: { label: "Durchführung", color: "#3b82f6", order: 8 },
  abnahme: { label: "Abnahme", color: "#8b5cf6", order: 9 },
  abgeschlossen: { label: "Abgeschlossen", color: "#10b981", order: 10 },
  verloren: { label: "Verloren", color: "#ef4444", order: 99 },
};

const TIMELINE_PHASES = Object.entries(PHASE_CONFIG)
  .filter(([, v]) => v.order <= 10)
  .sort((a, b) => a[1].order - b[1].order);

// Timeline Phase Component
function TimelinePhase({
  phaseKey,
  config,
  currentOrder,
}: {
  phaseKey: string;
  config: { label: string; color: string; order: number };
  currentOrder: number;
}) {
  const isCompleted = config.order < currentOrder;
  const isCurrent = config.order === currentOrder;
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          isCompleted && "bg-primary text-primary-foreground",
          isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse-soft",
          !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <span className="text-sm font-bold">{config.order}</span>
        )}
      </div>
      <p
        className={cn(
          "text-xs mt-2 text-center max-w-[80px]",
          isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
        )}
      >
        {config.label}
      </p>
    </div>
  );
}

export default function ProjektDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const projectId = parseInt(params.id || "0");
  const [isImmobilienWizardOpen, setIsImmobilienWizardOpen] = useState(false);
  const [isAngebotWizardOpen, setIsAngebotWizardOpen] = useState(false);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const utils = trpc.useUtils();

  // Auftrag aus Angebot erstellen
  const acceptOfferMutation = trpc.order.acceptFromOffer.useMutation({
    onSuccess: () => {
      utils.project.getWithRelations.invalidate({ id: projectId });
      toast.success("Auftrag erstellt", {
        description: "Auftrag und Baustelle wurden automatisch erstellt. Vorbereitungsaufgaben wurden generiert.",
      });
    },
    onError: (err) => toast.error("Fehler", { description: err.message }),
  });

  // Load project with all relations
  const { data: projectData, isLoading } = trpc.project.getWithRelations.useQuery(
    { id: projectId },
    { enabled: projectId > 0 }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!projectData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Projekt nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Das Projekt mit ID {projectId} existiert nicht.</p>
          <Link href="/projekte">
            <Button>Zurück zur Übersicht</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // getProjectWithRelations returns { ...project, offers, orders, invoices, ... }
  const { offers, orders, invoices, warranties, constructionSites, tasks, documents, properties, appointments, ...project } = projectData;
  const phaseConfig = PHASE_CONFIG[project.phase] || PHASE_CONFIG.objektaufnahme;
  const currentOrder = phaseConfig.order;

  const handleAction = (action: string) => {
    toast(action, {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  // Calculate stats - Gesamtfläche aus Immobilien berechnen (E-07)
  const calculatedArea = properties?.reduce((sum: number, p: any) => sum + parseFloat(p.totalArea || "0"), 0) || 0;
  const totalArea = calculatedArea > 0 ? calculatedArea : parseFloat(project.totalArea || "0");
  const propertyCount = properties?.length || project.propertyCount || 0;
  const progress = project.progress || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4 animate-fade-in-up">
          <Link href="/projekte">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge
                variant="secondary"
                className="text-sm"
                style={{
                  backgroundColor: `${phaseConfig.color}15`,
                  color: phaseConfig.color,
                }}
              >
                {phaseConfig.label}
              </Badge>
              <HelpTooltip content={HELP_TEXTS.projektPhase.text} title={HELP_TEXTS.projektPhase.title} helpTextKey="projektPhase" />
              <span className="text-sm text-muted-foreground font-mono">{project.projectNumber}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.hubspotDealId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://app.hubspot.com/contacts/${project.hubspotDealId}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                HubSpot
              </Button>
            )}
            <Link href="/angebote">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Angebot
              </Button>
            </Link>
          </div>
        </div>

        {/* Workflow Action Bar */}
        <div className="animate-fade-in-up animate-delay-50">
          <div className="flex items-center gap-2 mb-2">
            <HelpTooltip content={HELP_TEXTS.workflowButton.text} title={HELP_TEXTS.workflowButton.title} helpTextKey="workflowButton" />
            <span className="text-xs text-muted-foreground">Workflow-Aktionen</span>
          </div>
          <WorkflowActionBar projectId={projectId} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Immobilien</p>
                  <p className="text-2xl font-bold">{propertyCount}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamtfläche</p>
                  <p className="text-2xl font-bold">{totalArea > 0 ? `${totalArea.toLocaleString("de-DE")} m²` : "–"}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fortschritt</p>
                  <p className="text-2xl font-bold">{progress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dokumente</p>
                  <p className="text-2xl font-bold">{documents?.length || 0}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardHeader>
            <CardTitle className="text-lg">Projektzeitstrahl</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
                style={{
                  width: `${((currentOrder - 1) / (TIMELINE_PHASES.length - 1)) * 100}%`,
                }}
              />
              {TIMELINE_PHASES.map(([key, config]) => (
                <TimelinePhase
                  key={key}
                  phaseKey={key}
                  config={config}
                  currentOrder={currentOrder}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="uebersicht" className="animate-fade-in-up animate-delay-300">
          <TabsList className="bg-muted/50 p-1 rounded-2xl flex-wrap">
            <TabsTrigger value="uebersicht" className="rounded-xl">Übersicht</TabsTrigger>
            <TabsTrigger value="immobilien" className="rounded-xl">
              Immobilien ({properties?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="angebote" className="rounded-xl">
              Angebote ({offers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="auftraege" className="rounded-xl">
              Aufträge ({orders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="baustellen" className="rounded-xl">
              Baustellen ({constructionSites?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="finanzen" className="rounded-xl">Finanzen</TabsTrigger>
            <TabsTrigger value="dokumente" className="rounded-xl">
              Dokumente ({documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="aufgaben" className="rounded-xl">
              Aufgaben ({tasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="teams" className="rounded-xl">Teams</TabsTrigger>
          </TabsList>

          {/* === ÜBERSICHT TAB === */}
          <TabsContent value="uebersicht" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projektdaten */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Projektdaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Projektnummer</p>
                    <p className="font-medium font-mono">{project.projectNumber}</p>
                  </div>
                  {project.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Zeitraum</p>
                      <p className="font-medium">
                        {new Date(project.startDate).toLocaleDateString("de-DE")} –{" "}
                        {project.endDate ? new Date(project.endDate).toLocaleDateString("de-DE") : "offen"}
                      </p>
                    </div>
                  )}
                  {project.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notizen</p>
                      <p className="text-sm">{project.notes}</p>
                    </div>
                  )}
                  {progress > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nächste Aufgaben */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Nächste Aufgaben
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks && tasks.length > 0 ? (
                    tasks
                      .filter((t: any) => t.status !== "erledigt" && t.status !== "abgebrochen")
                      .slice(0, 4)
                      .map((task: any) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl",
                              isOverdue ? "bg-red-500/10" : "bg-muted"
                            )}
                          >
                            <Clock className={cn("w-5 h-5", isOverdue ? "text-red-500" : "text-muted-foreground")} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.dueDate && (
                                <p className={cn("text-xs", isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground")}>
                                  {isOverdue ? "Überfällig: " : "Fällig: "}
                                  {new Date(task.dueDate).toLocaleDateString("de-DE")}
                                </p>
                              )}
                            </div>
                            {task.assignedRole && (
                              <Badge variant="outline" className="text-xs">{task.assignedRole}</Badge>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine offenen Aufgaben</p>
                  )}
                </CardContent>
              </Card>

              {/* Schnellzugriff */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Schnellzugriff
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {offers && offers.length > 0 && (
                    <Link href="/angebote">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {offers.length} Angebot{offers.length > 1 ? "e" : ""} anzeigen
                      </Button>
                    </Link>
                  )}
                  {orders && orders.length > 0 && orders.map((order: any) => (
                    <Link key={order.id} href={`/auftraege/${order.id}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Briefcase className="w-4 h-4 text-green-500" />
                        Auftrag {order.orderNumber}
                      </Button>
                    </Link>
                  ))}
                  {invoices && invoices.length > 0 && invoices.map((inv: any) => (
                    <Link key={inv.id} href={`/rechnungen/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Receipt className="w-4 h-4 text-amber-500" />
                        Rechnung {inv.invoiceNumber}
                      </Button>
                    </Link>
                  ))}
                  {warranties && warranties.length > 0 && warranties.map((w: any) => (
                    <Link key={w.id} href={`/garantien/${w.id}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        Garantie {w.warrantyNumber}
                      </Button>
                    </Link>
                  ))}
                  {constructionSites && constructionSites.length > 0 && (
                    <Link href="/baustellen">
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <HardHat className="w-4 h-4 text-orange-500" />
                        {constructionSites.length} Baustelle{constructionSites.length > 1 ? "n" : ""} anzeigen
                      </Button>
                    </Link>
                  )}
                  {project.hubspotDealId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(`https://app.hubspot.com/contacts/${project.hubspotDealId}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 text-[#ff7a59]" />
                      In HubSpot öffnen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === IMMOBILIEN TAB === */}
          <TabsContent value="immobilien" className="mt-6 space-y-6">
            <Card className="ff-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Immobilien ({properties?.length || 0})</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowPropertyPicker(true)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Bestehende zuordnen
                  </Button>
                  <Button size="sm" onClick={() => setIsImmobilienWizardOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Immobilie
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {properties && properties.length > 0 ? (
                  <div className="space-y-3">
                    {properties.map((prop: any) => (
                      <div
                        key={prop.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/immobilien/${prop.id}`)}
                      >
                        <Building2 className="w-10 h-10 text-primary/50" />
                        <div className="flex-1">
                          <p className="font-medium">{prop.address || prop.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {prop.totalArea && <span>{parseFloat(prop.totalArea).toLocaleString("de-DE")} m²</span>}
                            {prop.facadeType && <span>{prop.facadeType}</span>}
                            {prop.status && (
                              <Badge variant="secondary" className="text-xs">{prop.status}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Immobilien zugeordnet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Foto-Galerie für das gesamte Projekt */}
            <FotoGalerieView
              projectId={project.id}
              title="Projekt-Fotos"
              showFilters={true}
            />
          </TabsContent>

          {/* === ANGEBOTE TAB === */}
          <TabsContent value="angebote" className="mt-6">
            <Card className="ff-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Angebote ({offers?.length || 0})</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    // Nr.42: Gate – Angebots-Wizard blockiert bei 0 Immobilien
                    if (!properties || properties.length === 0) {
                      toast.error("Objektaufnahme erforderlich", {
                        description: "Bitte führe zuerst eine Objektaufnahme durch, bevor du ein Angebot erstellst.",
                      });
                      return;
                    }
                    setIsAngebotWizardOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Angebot für dieses Projekt erstellen
                </Button>
              </CardHeader>
              <CardContent>
                {offers && offers.length > 0 ? (
                  <div className="space-y-3">
                    {offers.map((offer: any) => (
                      <div
                        key={offer.id}
                        className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="w-10 h-10 text-blue-500/50" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{offer.offerNumber}</p>
                              <Badge variant={offer.status === "angenommen" ? "default" : "secondary"} className="text-xs">
                                {offer.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              {offer.grossTotal && <span className="font-medium text-foreground">{parseFloat(offer.grossTotal).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>}
                              <span>{new Date(offer.createdAt).toLocaleDateString("de-DE")}</span>
                              {offer.propertyCount && <span>{offer.propertyCount} Immobilie(n)</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {offer.status === "versendet" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Angebot ${offer.offerNumber} als Auftrag best\u00e4tigen? Dies erstellt automatisch einen Auftrag und eine Baustelle mit Vorbereitungsaufgaben.`)) {
                                    acceptOfferMutation.mutate({
                                      offerId: offer.id,
                                      projectId: project.id,
                                      baustelleName: project.name || `Baustelle ${offer.offerNumber}`,
                                      baustelleAddress: properties?.[0] ? `${properties[0].street || ''} ${properties[0].postalCode || ''} ${properties[0].city || ''}`.trim() : '',
                                      createDefaultTasks: true,
                                    });
                                  }
                                }}
                                disabled={acceptOfferMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Auftrag best\u00e4tigen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Angebote erstellt</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === AUFTRÄGE TAB === */}
          <TabsContent value="auftraege" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base">Aufträge ({orders?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order: any) => (
                      <Link key={order.id} href={`/auftraege/${order.id}`}>
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                          <Briefcase className="w-10 h-10 text-green-500/50" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{order.orderNumber}</p>
                              <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              {order.grossTotal && <span className="font-medium text-foreground">{parseFloat(order.grossTotal).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>}
                              <span>{new Date(order.createdAt).toLocaleDateString("de-DE")}</span>
                            </div>
                          </div>
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Aufträge vorhanden</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === BAUSTELLEN TAB === */}
          <TabsContent value="baustellen" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base">Baustellen ({constructionSites?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {constructionSites && constructionSites.length > 0 ? (
                  <div className="space-y-3">
                    {constructionSites.map((site: any) => (
                      <div
                        key={site.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"                        onClick={() => navigate(`/baustellen/${site.id}`)}                   >
                        <HardHat className="w-10 h-10 text-orange-500/50" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{site.name || site.siteNumber}</p>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                site.status === "aktiv" && "bg-green-500/10 text-green-600",
                                site.status === "geplant" && "bg-blue-500/10 text-blue-600",
                                site.status === "pausiert" && "bg-amber-500/10 text-amber-600",
                                site.status === "abgeschlossen" && "bg-gray-500/10 text-gray-600"
                              )}
                            >
                              {site.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {site.address && <span>{site.address}</span>}
                            {site.progress > 0 && <span>{site.progress}% Fortschritt</span>}
                          </div>
                          {site.progress > 0 && (
                            <Progress value={site.progress} className="h-1.5 mt-2 max-w-xs" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <HardHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Baustellen angelegt</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === FINANZEN TAB === */}
          <TabsContent value="finanzen" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rechnungen */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    Rechnungen ({invoices?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices && invoices.length > 0 ? (
                    <div className="space-y-3">
                      {invoices.map((inv: any) => (
                        <Link key={inv.id} href={`/rechnungen/${inv.id}`}>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                            <div>
                              <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("de-DE")}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{inv.grossTotal ? parseFloat(inv.grossTotal).toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "–"}</p>
                              <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine Rechnungen</p>
                  )}
                </CardContent>
              </Card>

              {/* Garantien */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Garantien ({warranties?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {warranties && warranties.length > 0 ? (
                    <div className="space-y-3">
                      {warranties.map((w: any) => (
                        <Link key={w.id} href={`/garantien/${w.id}`}>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                            <div>
                              <p className="font-medium text-sm">{w.warrantyNumber}</p>
                              <p className="text-xs text-muted-foreground">{w.warrantyType}</p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  w.status === "aktiv" && "bg-green-500/10 text-green-600"
                                )}
                              >
                                {w.status}
                              </Badge>
                              {w.endDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  bis {new Date(w.endDate).toLocaleDateString("de-DE")}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine Garantien</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === DOKUMENTE TAB === */}
          <TabsContent value="dokumente" className="mt-6">
            <Card className="ff-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  Dokumente ({documents?.length || 0})
                </CardTitle>
                <Link href="/archiv">
                  <Button size="sm" variant="outline">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Im Archiv öffnen
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {doc.category && <Badge variant="outline" className="text-xs">{doc.category}</Badge>}
                            <span>{new Date(doc.createdAt).toLocaleDateString("de-DE")}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {doc.s3Url && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => window.open(doc.s3Url, "_blank")}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => window.open(doc.s3Url, "_blank")}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Dokumente zugeordnet</p>
                    <Link href="/archiv">
                      <Button variant="link" size="sm" className="mt-2">
                        Dokument im Archiv hochladen
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === AUFGABEN TAB === */}
          <TabsContent value="aufgaben" className="mt-6">
            <Card className="ff-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Aufgaben ({tasks?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task: any) => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "erledigt";
                      const isDone = task.status === "erledigt";
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl",
                            isDone ? "bg-green-500/5" : isOverdue ? "bg-red-500/10" : "bg-muted/50"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : isOverdue ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className={cn("font-medium text-sm", isDone && "line-through text-muted-foreground")}>{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {task.assignedRole && <Badge variant="outline" className="text-xs">{task.assignedRole}</Badge>}
                              {task.responsibleParty && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    task.responsibleParty === "auftraggeber" 
                                      ? "border-amber-500 text-amber-700 dark:text-amber-400" 
                                      : "border-primary text-primary"
                                  )}
                                >
                                  {task.responsibleParty === "auftraggeber" ? "Kunde" : "FaFi"}
                                </Badge>
                              )}
                              {task.dueDate && (
                                <span className={isOverdue ? "text-red-500 font-semibold" : ""}>
                                  {new Date(task.dueDate).toLocaleDateString("de-DE")}
                                </span>
                              )}
                              <Badge variant="secondary" className="text-xs">{task.status}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Aufgaben erstellt</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TEAMS TAB === */}
          <TabsContent value="teams" className="mt-6">
            <TeamsIntegration
              projectId={project.id.toString()}
              currentUserZug="Zug Alpha"
              hasAccess={true}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Immobilien-Wizard */}
      <ObjektaufnahmeWizard
        isOpen={isImmobilienWizardOpen}
        onClose={() => setIsImmobilienWizardOpen(false)}
        onComplete={() => {
          utils.project.getWithRelations.invalidate({ id: projectId });
          setIsImmobilienWizardOpen(false);
          toast.success("Immobilie erfolgreich erfasst und dem Projekt zugeordnet.");
        }}
        initialProjectId={projectId}
        initialCompanyId={project.companyId || undefined}
      />
      {/* Sprint 6: Angebot-Wizard direkt aus ProjektDetail */}
      <AngebotWizard
        isOpen={isAngebotWizardOpen}
        onClose={() => setIsAngebotWizardOpen(false)}
        onComplete={() => {
          utils.project.getWithRelations.invalidate({ id: projectId });
          setIsAngebotWizardOpen(false);
          toast.success("Angebot erstellt", {
            description: "Das Angebot wurde erfolgreich für dieses Projekt erstellt.",
          });
        }}
      />

      {/* Property-Picker Dialog: Bestehende Immobilie zuordnen */}
      {showPropertyPicker && (
        <PropertyPickerDialog
          projectId={projectId}
          existingPropertyIds={(properties || []).map((p: any) => p.id)}
          onClose={() => setShowPropertyPicker(false)}
          onAssigned={() => {
            utils.project.getWithRelations.invalidate({ id: projectId });
            setShowPropertyPicker(false);
            toast.success("Immobilie zugeordnet");
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Property-Picker-Dialog-Komponente
function PropertyPickerDialog({ projectId, existingPropertyIds, onClose, onAssigned }: {
  projectId: number;
  existingPropertyIds: number[];
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [search, setSearch] = useState("");
  const { data: allProperties, isLoading } = trpc.property.list.useQuery();
  const assignMutation = trpc.project.assignProperty.useMutation({
    onSuccess: () => onAssigned(),
    onError: (err) => toast.error(err.message),
  });

  const availableProperties = (allProperties || []).filter(
    (p: any) => !existingPropertyIds.includes(p.id) && p.isDraft !== true
  ).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Bestehende Immobilie zuordnen</h3>
          <input
            type="text"
            placeholder="Suche nach Name oder Adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full px-3 py-2 border rounded-lg text-sm bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lade Immobilien...</div>
          ) : availableProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "Keine Immobilien gefunden" : "Alle Immobilien sind bereits zugeordnet"}
            </div>
          ) : (
            availableProperties.map((prop: any) => (
              <button
                key={prop.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                onClick={() => assignMutation.mutate({ projectId, propertyId: prop.id })}
                disabled={assignMutation.isPending}
              >
                <Building2 className="w-8 h-8 text-primary/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{prop.address || prop.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {prop.totalArea ? `${parseFloat(prop.totalArea).toLocaleString("de-DE")} m²` : ""}
                    {prop.facadeType ? ` \u00b7 ${prop.facadeType}` : ""}
                  </p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>Schlie\u00dfen</Button>
        </div>
      </div>
    </div>
  );
}
