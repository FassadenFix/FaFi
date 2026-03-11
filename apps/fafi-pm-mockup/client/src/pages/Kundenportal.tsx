/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * - Kundenportal-Ansicht mit Projekt-Lifecycle
 * - Garantie-Übersicht und Dokumenten-Center
 * - E-03: Auf DB-Daten umgestellt (Mock-Daten entfernt)
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Building2,
  Phone,
  Mail,
  Eye,
  AlertTriangle,
  Star,
  MessageSquare,
  ThumbsUp,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";
import { IMAGES } from "@shared/const";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Timeline Step Component
function TimelineStep({
  label,
  date,
  isCompleted,
  isCurrent,
}: {
  label: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isCompleted && "bg-primary text-primary-foreground",
          isCurrent && "bg-primary/20 text-primary ring-4 ring-primary/10",
          !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className={cn("font-medium", isCurrent && "text-primary")}>{label}</p>
        {date && <p className="text-sm text-muted-foreground">{date}</p>}
      </div>
    </div>
  );
}

// Ampel-Status-Anzeige (Interview: Kunden sehen vereinfachte Ampel)
function AmpelBadge({ status, label }: { status: "green" | "yellow" | "red"; label: string }) {
  const config = {
    green: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", icon: CheckCircle2 },
    yellow: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", icon: AlertTriangle },
    red: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", icon: AlertTriangle },
  };
  const c = config[status];
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", c.bg, c.text)}>
      <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", c.dot)} />
      {label}
    </div>
  );
}

// Phase-Label Mapping
const PHASE_LABELS: Record<string, string> = {
  objektaufnahme: "Objektaufnahme",
  angebot_erstellt: "Angebot erstellt",
  angebot_versendet: "Angebot versendet",
  nachfassen: "Nachfassen",
  auftrag_gewonnen: "Auftrag gewonnen",
  planung: "Planung",
  vorbereitung: "Vorbereitung",
  durchfuehrung: "Durchführung",
  abnahme: "Abnahme",
  abgeschlossen: "Abgeschlossen",
};

const PHASE_ORDER = [
  "objektaufnahme", "angebot_erstellt", "angebot_versendet", "nachfassen",
  "auftrag_gewonnen", "planung", "vorbereitung", "durchfuehrung", "abnahme", "abgeschlossen"
];

function getAmpelStatus(phase: string): { status: "green" | "yellow" | "red"; label: string } {
  const idx = PHASE_ORDER.indexOf(phase);
  if (phase === "abgeschlossen") return { status: "green", label: "Abgeschlossen" };
  if (idx >= 7) return { status: "green", label: "Im Plan" };
  if (idx >= 5) return { status: "green", label: "In Planung" };
  return { status: "yellow", label: "In Vorbereitung" };
}

export default function Kundenportal() {
  // DB-Daten laden
  const { data: projects = [], isLoading: projectsLoading } = trpc.project.list.useQuery();
  const { data: warranties = [], isLoading: warrantiesLoading } = trpc.warranty.list.useQuery();
  const { data: documents = [], isLoading: documentsLoading } = trpc.document.list.useQuery();

  const isLoading = projectsLoading || warrantiesLoading || documentsLoading;

  // Nr.51: Detailansicht-State für aktives Projekt
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handleAction = (action: string) => {
    toast(action, {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  // Aktive und abgeschlossene Projekte aus DB
  // Nr.65: Projekte ab Phase 1 (Objektaufnahme) als aktiv anzeigen
  const activeProjects = projects.filter((p: any) =>
    p.phase !== "abgeschlossen" && p.phase !== "verloren"
  );
  const completedProjects = projects.filter((p: any) => p.phase === "abgeschlossen");
  const activeProject = activeProjects[0];

  // Aktive Garantien
  const activeWarranties = warranties.filter((w: any) => w.status === "aktiv" || w.status === "active");

  // Nächste Inspektion berechnen
  const nextInspection = activeWarranties.length > 0
    ? activeWarranties.reduce((earliest: any, w: any) => {
        if (!w.nextInspectionDate) return earliest;
        return !earliest || new Date(w.nextInspectionDate) < new Date(earliest)
          ? w.nextInspectionDate
          : earliest;
      }, null)
    : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="relative rounded-3xl overflow-hidden h-56 animate-fade-in-up">
          <img
            src={IMAGES.customerPortal}
            alt="Kundenportal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4e5758]/95 to-[#4e5758]/60" />
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <Badge className="w-fit mb-3 bg-primary/20 text-primary border-0">
              Kundenportal-Vorschau
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              Willkommen im Kundenportal
            </h1>
            <p className="text-white/80 max-w-xl">
              Hier finden Sie alle Informationen zu Ihren Projekten, Garantien und Dokumenten.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Projekte</p>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-500/10">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeWarranties.length}</p>
                <p className="text-sm text-muted-foreground">Aktive Garantien</p>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Dokumente</p>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10">
                <Calendar className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {nextInspection
                    ? new Date(nextInspection).toLocaleDateString("de-DE", { month: "short", year: "numeric" })
                    : "–"}
                </p>
                <p className="text-sm text-muted-foreground">Nächste Inspektion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projekte" className="animate-fade-in-up animate-delay-200">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="projekte" className="rounded-xl">Meine Projekte</TabsTrigger>
            <TabsTrigger value="garantien" className="rounded-xl">Garantien</TabsTrigger>
            <TabsTrigger value="dokumente" className="rounded-xl">Dokumente</TabsTrigger>
            <TabsTrigger value="aufgaben" className="rounded-xl">Aufgaben</TabsTrigger>
            <TabsTrigger value="kontakt" className="rounded-xl">Kontakt</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl">Feedback</TabsTrigger>
          </TabsList>

          {/* Projekte Tab */}
          <TabsContent value="projekte" className="mt-6 space-y-6">
            {/* Nr.51: Aktuelles Projekt direkt in Detailansicht */}
            {activeProject && (
              <Card className="ff-card border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => setSelectedProjectId(activeProject.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="mb-2 bg-primary/10 text-primary border-0">
                        Aktuelles Projekt – Klicken für Details
                      </Badge>
                      <CardTitle>{activeProject.name}</CardTitle>
                      <CardDescription>{activeProject.projectNumber}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <AmpelBadge {...getAmpelStatus(activeProject.phase)} />
                      <HelpTooltip content={HELP_TEXTS.projektAmpel.text} title={HELP_TEXTS.projektAmpel.title} helpTextKey="projektAmpel" />
                      <Button onClick={(e) => { e.stopPropagation(); handleAction("Bewohnerinfo öffnen"); }}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Bewohnerinfo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Fortschritt</span>
                          <HelpTooltip content={HELP_TEXTS.baustellenAmpel.text} title={HELP_TEXTS.baustellenAmpel.title} helpTextKey="baustellenAmpel" />
                        </div>
                        <span className="text-2xl font-bold text-primary">{activeProject.progress || 0}%</span>
                      </div>
                      <Progress value={activeProject.progress || 0} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>
                          Start: {activeProject.startDate
                            ? new Date(activeProject.startDate).toLocaleDateString("de-DE")
                            : "Offen"}
                        </span>
                        <span>
                          Ende: {activeProject.endDate
                            ? new Date(activeProject.endDate).toLocaleDateString("de-DE")
                            : "Offen"}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-sm text-muted-foreground">Immobilien</p>
                          <p className="text-xl font-bold">{activeProject.propertyCount || 0}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-sm text-muted-foreground">Fläche</p>
                          <p className="text-xl font-bold">
                            {parseFloat(activeProject.totalArea || "0").toLocaleString("de-DE")} m²
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline - dynamisch aus Phase */}
                    <div className="space-y-4">
                      <h4 className="font-medium mb-4">Projektverlauf</h4>
                      <div className="space-y-2">
                        {PHASE_ORDER.filter(p => !["nachfassen", "angebot_erstellt", "angebot_versendet"].includes(p)).map((phase, idx, arr) => {
                          const currentIdx = PHASE_ORDER.indexOf(activeProject.phase);
                          const phaseIdx = PHASE_ORDER.indexOf(phase);
                          const isCompleted = phaseIdx < currentIdx;
                          const isCurrent = phase === activeProject.phase;
                          return (
                            <div key={phase}>
                              <TimelineStep
                                label={PHASE_LABELS[phase] || phase}
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                              />
                              {idx < arr.length - 1 && (
                                <div className={cn("ml-5 w-0.5 h-3", isCompleted ? "bg-primary" : "bg-muted")} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No active projects */}
            {!activeProject && activeProjects.length === 0 && (
              <Card className="ff-card">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Derzeit keine aktiven Projekte</p>
                </CardContent>
              </Card>
            )}

            {/* Past Projects */}
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base">Abgeschlossene Projekte ({completedProjects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {completedProjects.length > 0 ? (
                  completedProjects.map((project: any) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-2"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={IMAGES.heroProject}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.projectNumber}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Abgeschlossen
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Noch keine abgeschlossenen Projekte</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Garantien Tab */}
          <TabsContent value="garantien" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Ihre Garantien
                </CardTitle>
                <CardDescription>
                  5 Jahre Garantie auf Algenfreiheit mit jährlicher kostenfreier Inspektion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeWarranties.length > 0 ? (
                  activeWarranties.map((garantie: any) => (
                    <div
                      key={garantie.id}
                      className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{garantie.projectName || `Projekt #${garantie.projectId}`}</h4>
                          <p className="text-sm text-muted-foreground">{garantie.warrantyNumber}</p>
                        </div>
                        <Badge className="bg-green-500 text-white">Aktiv</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Garantiebeginn</p>
                          <p className="font-medium">
                            {garantie.startDate
                              ? new Date(garantie.startDate).toLocaleDateString("de-DE")
                              : "–"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Garantieende</p>
                          <p className="font-medium">
                            {garantie.endDate
                              ? new Date(garantie.endDate).toLocaleDateString("de-DE")
                              : "–"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nächste Inspektion</p>
                          <p className="font-medium text-primary">
                            {garantie.nextInspectionDate
                              ? new Date(garantie.nextInspectionDate).toLocaleDateString("de-DE")
                              : "–"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleAction("Garantieurkunde herunterladen")}>
                          <Download className="w-4 h-4 mr-2" />
                          Garantieurkunde
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction("Garantiefall melden")}>
                          Garantiefall melden
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine aktiven Garantien</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nr.55: Dokumente auf 3 Ebenen: Projekt / Baustelle / Allgemein */}
          <TabsContent value="dokumente" className="mt-6 space-y-6">
            {/* Ebene 1: Projektdokumente */}
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Projektdokumente
                </CardTitle>
                <CardDescription>Angebote, Aufträge und Projektberichte</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.filter((d: any) => ['projekt','angebot','auftrag'].includes(d.category || '')).length > 0 ? (
                  <div className="space-y-2">
                    {documents.filter((d: any) => ['projekt','angebot','auftrag'].includes(d.category || '')).map((dok: any) => (
                      <div key={dok.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                        <div className="p-2 rounded-xl bg-primary/10"><FileText className="w-5 h-5 text-primary" /></div>
                        <div className="flex-1">
                          <p className="font-medium">{dok.name || dok.fileName}</p>
                          <p className="text-sm text-muted-foreground">{dok.createdAt ? new Date(dok.createdAt).toLocaleDateString("de-DE") : "–"}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleAction(`${dok.name || dok.fileName} herunterladen`)}><Download className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground text-sm">Keine Projektdokumente</p>
                )}
              </CardContent>
            </Card>
            {/* Ebene 2: Baustellendokumente */}
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Baustellendokumente
                </CardTitle>
                <CardDescription>Tagesberichte, Protokolle und Fotodokumentation</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.filter((d: any) => ['baustelle','protokoll','foto'].includes(d.category || '')).length > 0 ? (
                  <div className="space-y-2">
                    {documents.filter((d: any) => ['baustelle','protokoll','foto'].includes(d.category || '')).map((dok: any) => (
                      <div key={dok.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                        <div className="p-2 rounded-xl bg-amber-500/10"><FileText className="w-5 h-5 text-amber-600" /></div>
                        <div className="flex-1">
                          <p className="font-medium">{dok.name || dok.fileName}</p>
                          <p className="text-sm text-muted-foreground">{dok.createdAt ? new Date(dok.createdAt).toLocaleDateString("de-DE") : "–"}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleAction(`${dok.name || dok.fileName} herunterladen`)}><Download className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground text-sm">Keine Baustellendokumente</p>
                )}
              </CardContent>
            </Card>
            {/* Ebene 3: Allgemeine Dokumente */}
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  Allgemeine Dokumente
                </CardTitle>
                <CardDescription>AGB, Garantiebedingungen und allgemeine Informationen</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const allgemeinDocs = documents.filter((d: any) => !['projekt','angebot','auftrag','baustelle','protokoll','foto'].includes(d.category || ''));
                  return allgemeinDocs.length > 0 ? (
                    <div className="space-y-2">
                      {allgemeinDocs.map((dok: any) => (
                        <div key={dok.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                          <div className="p-2 rounded-xl bg-blue-500/10"><FileText className="w-5 h-5 text-blue-500" /></div>
                          <div className="flex-1">
                            <p className="font-medium">{dok.name || dok.fileName}</p>
                            <p className="text-sm text-muted-foreground">{dok.createdAt ? new Date(dok.createdAt).toLocaleDateString("de-DE") : "–"}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleAction(`${dok.name || dok.fileName} herunterladen`)}><Download className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground text-sm">Keine allgemeinen Dokumente</p>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nr.54: Aufgaben-Tab mit Verantwortungsseite (AG/AN) */}
          <TabsContent value="aufgaben" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Offene Aufgaben
                </CardTitle>
                <CardDescription>
                  Übersicht der Aufgaben mit Verantwortungsseite (Auftraggeber / Auftragnehmer)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Beispiel-Aufgaben mit Verantwortungsseite */}
                  {[
                    { titel: "Wasseranschluss bereitstellen", verantwortung: "AG", status: "offen", frist: "Vor Baustart" },
                    { titel: "Parkflächen freihalten", verantwortung: "AG", status: "offen", frist: "Vor Baustart" },
                    { titel: "Bewohnerinfo verteilen", verantwortung: "AN", status: "erledigt", frist: "1 Woche vorher" },
                    { titel: "Straßensperre beantragen", verantwortung: "AN", status: "erledigt", frist: "2 Wochen vorher" },
                    { titel: "Abnahme-Termin bestätigen", verantwortung: "AG", status: "offen", frist: "Nach Fertigstellung" },
                  ].map((aufgabe, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border",
                      aufgabe.status === "erledigt" ? "bg-green-50/50 border-green-200" : "bg-muted/50 border-border"
                    )}>
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                        aufgabe.verantwortung === "AG" ? "bg-blue-100 text-blue-700" : "bg-primary/10 text-primary"
                      )}>
                        {aufgabe.verantwortung}
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-medium", aufgabe.status === "erledigt" && "line-through text-muted-foreground")}>
                          {aufgabe.titel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {aufgabe.verantwortung === "AG" ? "Auftraggeber" : "Auftragnehmer (FassadenFix)"} • {aufgabe.frist}
                        </p>
                      </div>
                      <Badge variant={aufgabe.status === "erledigt" ? "secondary" : "outline"} className={aufgabe.status === "erledigt" ? "bg-green-100 text-green-700" : ""}>
                        {aufgabe.status === "erledigt" ? "Erledigt" : "Offen"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">AG</div>
                    <span className="text-sm text-muted-foreground">= Auftraggeber</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">AN</div>
                    <span className="text-sm text-muted-foreground">= Auftragnehmer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kontakt Tab */}
          <TabsContent value="kontakt" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Ihr Ansprechpartner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                      FF
                    </div>
                    <div>
                      <p className="font-semibold text-lg">FassadenFix Team</p>
                      <p className="text-muted-foreground">Kundenberatung</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction("Anrufen")}>
                      <Phone className="w-4 h-4 mr-3" />
                      Kontakt aufnehmen
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction("E-Mail senden")}>
                      <Mail className="w-4 h-4 mr-3" />
                      E-Mail schreiben
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">FassadenFix GmbH</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="font-medium">Über uns</p>
                    <p className="text-muted-foreground">
                      Ihr Spezialist für professionelle Fassadenreinigung mit nachhaltiger Wirkung.
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="font-medium text-primary mb-2">Unser Versprechen</p>
                    <p className="text-sm text-muted-foreground italic">
                      "Ihr sicherer Weg zur sauberen Fassade – mit 5 Jahren Garantie und jährlicher kostenfreier Inspektion."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6">
            <FeedbackFormular />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Feedback-Formular Komponente
function FeedbackFormular() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);


  const feedbackCategories = [
    { id: "qualitaet", label: "Reinigungsqualität" },
    { id: "kommunikation", label: "Kommunikation" },
    { id: "termintreue", label: "Termintreue" },
    { id: "sauberkeit", label: "Sauberkeit der Baustelle" },
    { id: "freundlichkeit", label: "Freundlichkeit des Teams" },
    { id: "preis", label: "Preis-Leistungs-Verhältnis" },
  ];

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Bitte geben Sie eine Bewertung ab");
      return;
    }
    setSubmitted(true);
    toast.success("Vielen Dank für Ihr Feedback!");
  };

  if (submitted) {
    return (
      <Card className="ff-card">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <ThumbsUp className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Vielen Dank!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ihr Feedback hilft uns, unseren Service kontinuierlich zu verbessern.
            Wir schätzen Ihre Meinung sehr.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => { setSubmitted(false); setRating(0); setComment(""); setCategories([]); }}
          >
            Weiteres Feedback geben
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Ihre Zufriedenheit
          </CardTitle>
          <CardDescription>
            Bewerten Sie unsere Leistung – Ihr Feedback ist uns wichtig
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sterne-Bewertung */}
          <div>
            <label className="text-sm font-medium mb-3 block">Gesamtbewertung</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-medium self-center">
                  {rating === 5 ? "Ausgezeichnet" : rating === 4 ? "Sehr gut" : rating === 3 ? "Gut" : rating === 2 ? "Befriedigend" : "Verbesserungswürdig"}
                </span>
              )}
            </div>
          </div>

          {/* Kategorien */}
          <div>
            <label className="text-sm font-medium mb-3 block">Was hat Ihnen besonders gefallen? (optional)</label>
            <div className="flex flex-wrap gap-2">
              {feedbackCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={categories.includes(cat.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all px-4 py-2 text-sm",
                    categories.includes(cat.id) && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {categories.includes(cat.id) && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Freitext */}
          <div>
            <label className="text-sm font-medium mb-3 block">Ihre Anmerkungen (optional)</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              placeholder="Was können wir verbessern? Was war besonders gut?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full min-h-[48px] text-base">
            <Star className="w-4 h-4 mr-2" />
            Feedback absenden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
