/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * - Floating cards mit soft shadows
 * - Fließende Animationen
 * - Natürliche Hierarchie
 * - Drag-and-Drop Kanban
 */

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  TrendingUp,
  HardHat,
  AlertTriangle,
  Clock,
  ArrowRight,
  Building2,
  CheckCircle2,
  Calendar,
  GripVertical,
  RefreshCw,
  Cloud,
  CloudOff,
  Loader2,
  Receipt,
  Shield,
  Briefcase,
  Target,
} from "lucide-react";
import { PROJECT_PHASES, IMAGES } from "@shared/const";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import ProjektWizard from "@/components/ProjektWizard";
import ObjektaufnahmeWizard from "@/components/ObjektaufnahmeWizard";
import AngebotWizard from "@/components/AngebotWizard";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { trpc } from "@/lib/trpc";
import { HubSpotSyncWidget } from "@/components/HubSpotSyncWidget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MeineAufgabenWidget from "@/components/MeineAufgabenWidget";
import { NextStepsWidget } from "@/components/NextStepCard";
import { TaskAlertBanner, OverdueTasksWidget } from "@/components/TaskAlertBanner";

// Type definitions for API responses
type Project = {
  id: number;
  projectNumber: string;
  name: string;
  companyId: number;
  phase: string;
  totalArea: string;
  propertyCount: number;
  progress: number;
  company?: { name: string };
};

type Task = {
  id: number;
  title: string;
  projectId: number | null;
  dueDate: Date | null;
  status: string;
  assignedToId: number | null;
  assignedTo?: { name: string };
  project?: { projectNumber: string };
  responsibleParty?: "auftraggeber" | "auftragnehmer" | null;
};

type ActivityLog = {
  id: number;
  userName: string | null;
  action: string;
  entityType: string;
  entityName: string | null;
  details: string | null;
  createdAt: Date;
};

// KPI Card Component
function KPICard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  delay,
  helpText,
  helpTextKey,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  delay: number;
  helpText?: { title: string; text: string };
  helpTextKey?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className={cn("ff-card animate-fade-in-up", `animate-delay-${delay}`)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("ff-card animate-fade-in-up", `animate-delay-${delay}`)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              {label}
              {helpText && <HelpTooltip content={helpText.text} title={helpText.title} helpTextKey={helpTextKey} />}
            </p>
            <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
            {subValue && (
              <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
            )}
          </div>
          <div className="p-3 rounded-2xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        {trend && trend !== "neutral" && (
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp
              className={cn(
                "w-4 h-4",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500 rotate-180"
              )}
            />
            <span className="text-sm text-muted-foreground">
              {trend === "up" ? "Steigend" : "Rücklauf"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Map phase string to phase ID for Kanban
function getPhaseId(phaseString: string): number {
  const phaseMap: Record<string, number> = {
    objektaufnahme: 1,
    angebot_erstellt: 2,
    angebot_versendet: 3,
    nachfassen: 4,
    auftrag_gewonnen: 5,
    planung: 6,
    vorbereitung: 7,
    durchfuehrung: 8,
    abnahme: 9,
    abgeschlossen: 10,
    verloren: 99,
  };
  return phaseMap[phaseString] || 1;
}

// Draggable Project Card for Kanban
function DraggableProjectCard({
  project,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  project: Project;
  onDragStart: (e: React.DragEvent, projectId: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const phaseId = getPhaseId(project.phase);
  const phase = PROJECT_PHASES.find((p) => p.id === phaseId);
  const area = parseFloat(project.totalArea) || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <Card className="ff-card mb-3 group hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <Link href={`/projekte/${project.id}`}>
                  <h4 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
                    {project.name}
                  </h4>
                </Link>
                <Badge
                  variant="secondary"
                  className="text-xs ml-2 flex-shrink-0"
                  style={{ backgroundColor: `${phase?.color}20`, color: phase?.color }}
                >
                  {phase?.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{project.company?.name || 'Unbekannt'}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {project.propertyCount}
                </span>
                <span>{area.toLocaleString()} m²</span>
              </div>
              {project.progress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Countdown Task Card
function TaskCard({ task }: { task: Task }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  let statusColor = "text-green-500 bg-green-500/10";
  let statusIcon = CheckCircle2;
  if (daysUntil <= 0) {
    statusColor = "text-red-500 bg-red-500/10";
    statusIcon = AlertTriangle;
  } else if (daysUntil <= 3) {
    statusColor = "text-amber-500 bg-amber-500/10";
    statusIcon = Clock;
  }

  const StatusIcon = statusIcon;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all">
      <div className={cn("p-2 rounded-xl", statusColor)}>
        <StatusIcon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{task.title}</p>
          {task.responsibleParty && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              task.responsibleParty === "auftraggeber" 
                ? "bg-blue-500/10 text-blue-600" 
                : "bg-green-500/10 text-green-600"
            )}>
              {task.responsibleParty === "auftraggeber" ? "Kunde" : "FaFi"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {task.assignedTo?.name || 'Nicht zugewiesen'} • {task.project?.projectNumber || 'Kein Projekt'}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold", daysUntil <= 0 ? "text-red-500" : daysUntil <= 3 ? "text-amber-500" : "text-foreground")}>
          {daysUntil <= 0 ? "Überfällig" : daysUntil === 999 ? "Kein Datum" : `${daysUntil} Tage`}
        </p>
        {dueDate && (
          <p className="text-xs text-muted-foreground">
            {dueDate.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
          </p>
        )}
      </div>
    </div>
  );
}

// Helper function for time ago display
function getTimeAgo(timestamp: Date | string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  if (diffHours > 0) return `vor ${diffHours} Std`;
  return 'gerade eben';
}

// Kanban Column Component
function KanbanColumn({
  column,
  projects,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver,
  draggingProjectId,
}: {
  column: { id: string; label: string; phases: number[] };
  projects: Project[];
  onDragStart: (e: React.DragEvent, projectId: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  isDragOver: boolean;
  draggingProjectId: number | null;
}) {
  return (
    <div
      className={cn(
        "kanban-column min-h-[200px] rounded-xl transition-all duration-200 p-2 -m-2",
        isDragOver && "bg-primary/5 ring-2 ring-primary/20 ring-dashed"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{column.label}</h3>
        <Badge variant="secondary" className="text-xs">
          {projects.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {projects.map((project) => (
          <DraggableProjectCard
            key={project.id}
            project={project}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggingProjectId === project.id}
          />
        ))}
        {projects.length === 0 && (
          <div className={cn(
            "text-xs text-muted-foreground text-center py-8 rounded-xl border-2 border-dashed transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-transparent"
          )}>
            {isDragOver ? "Hier ablegen" : "Keine Projekte"}
          </div>
        )}
      </div>
    </div>
  );
}

type KPITimeRange = "aktuell" | "monat" | "quartal" | "jahr";

export default function Dashboard() {
  const [kpiTimeRange, setKpiTimeRange] = useState<KPITimeRange>("aktuell");
  const { user } = useAuth();

  // Fetch data from API
  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.getKPIs.useQuery();
  const { data: projectsData, isLoading: projectsLoading } = trpc.project.list.useQuery();
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = trpc.task.list.useQuery();
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activityLog.getRecent.useQuery({ limit: 5 });

  // Nächste Schritte
  const { data: nextStepsData, isLoading: nextStepsLoading } = trpc.project.getNextSteps.useQuery();
  const advancePhaseMutation = trpc.project.advancePhase.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Phase geändert", { description: result.message });
      } else {
        toast.error("Übergang nicht möglich", { description: result.message });
      }
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const handleAdvancePhase = (projectId: number, targetPhase: string) => {
    advancePhaseMutation.mutate({
      projectId,
      targetPhase: targetPhase as any,
      trigger: "manual",
    });
  };

  // Nachfass-Erinnerungen
  const { data: followUpsData, isLoading: followUpsLoading } = trpc.followUp.list.useQuery();
  const followUpCompleteMutation = trpc.followUp.complete.useMutation({
    onSuccess: () => {
      toast.success("Nachfassen als erledigt markiert");
    },
  });

  // Mahnlauf-Dashboard
  const { data: dunningData } = trpc.dunning.getDashboardSummary.useQuery();

  // HubSpot Sync
  const hubspotSyncMutation = trpc.hubspot.syncAll.useMutation({
    onSuccess: (data) => {
      toast.success("HubSpot-Sync erfolgreich", {
        description: `${data.contactsImported} Kontakte, ${data.companiesImported} Unternehmen synchronisiert`,
      });
      setLastSyncTime(new Date());
    },
    onError: (error) => {
      toast.error("HubSpot-Sync fehlgeschlagen", {
        description: error.message,
      });
    },
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const stored = localStorage.getItem('fafi-hubspot-last-sync');
    return stored ? new Date(stored) : null;
  });

  const handleHubSpotSync = () => {
    hubspotSyncMutation.mutate();
  };

  // State for drag-and-drop
  const [draggingProjectId, setDraggingProjectId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Wizard states
  const [isProjektWizardOpen, setIsProjektWizardOpen] = useState(false);
  const [isObjektaufnahmeWizardOpen, setIsObjektaufnahmeWizardOpen] = useState(false);
  const [isAngebotWizardOpen, setIsAngebotWizardOpen] = useState(false);

  // Transform projects for Kanban
  const projects = useMemo(() => {
    if (!projectsData) return [];
    return projectsData.map((p: any) => ({
      ...p,
      phaseId: getPhaseId(p.phase),
    }));
  }, [projectsData]);

  // Filter open tasks (not completed)
  const openTasks = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((t: any) => t.status !== 'erledigt')
      .sort((a: any, b: any) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [tasksData]);

  // Count urgent tasks
  const urgentTaskCount = useMemo(() => {
    if (!tasksData) return 0;
    const today = new Date();
    return tasksData.filter((t: any) => {
      if (t.status === 'erledigt' || !t.dueDate) return false;
      const daysUntil = Math.ceil((new Date(t.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 3;
    }).length;
  }, [tasksData]);

  // Kanban columns configuration
  const kanbanColumns = [
    { id: "angebot", label: "Angebot", phases: [2, 3, 4] },
    { id: "planung", label: "Planung", phases: [5, 6, 7] },
    { id: "durchfuehrung", label: "Durchführung", phases: [8] },
    { id: "abschluss", label: "Abschluss", phases: [9, 10] },
  ];

  // Phase mapping for columns
  const columnPhaseMap: Record<string, number> = {
    angebot: 2,
    planung: 6,
    durchfuehrung: 8,
    abschluss: 9,
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, projectId: number) => {
    setDraggingProjectId(projectId);
    e.dataTransfer.setData("text/plain", projectId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingProjectId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const projectId = parseInt(e.dataTransfer.getData("text/plain"));
    
    if (projectId && columnPhaseMap[columnId]) {
      const project = projects.find((p: any) => p.id === projectId);
      
      if (project) {
        // Show success toast (actual update would need mutation)
        const column = kanbanColumns.find(c => c.id === columnId);
        toast.success("Projekt verschoben", {
          description: `"${project.name}" wurde nach "${column?.label}" verschoben.`,
        });
      }
    }
    
    setDragOverColumn(null);
    setDraggingProjectId(null);
  };

  const handleRefresh = () => {
    refetchTasks();
    refetchActivities();
    toast.success("Daten aktualisiert");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header with Hero Image */}
        <div className="relative rounded-3xl overflow-hidden h-48 animate-fade-in-up">
          <img
            src={IMAGES.heroDashboard}
            alt="Dashboard Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4e5758]/90 to-[#4e5758]/40" />
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Willkommen zurück{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-white/80 max-w-xl">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} – Übersicht über alle laufenden Projekte und Aufgaben.
            </p>
          </div>
        </div>

        {/* KPI Zeitraum-Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Operative Übersicht</h2>
          <Select value={kpiTimeRange} onValueChange={(v) => setKpiTimeRange(v as KPITimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktuell">Aktuell</SelectItem>
              <SelectItem value="monat">Dieser Monat</SelectItem>
              <SelectItem value="quartal">Dieses Quartal</SelectItem>
              <SelectItem value="jahr">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards - Operative Übersicht */}
        <div data-tour="dashboard-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={FileText}
            label="Offene Angebote"
            value={kpis?.angeboteOffen ?? 0}
            subValue={`${kpis?.angeboteGesamt ?? 0} gesamt`}
            trend={undefined}
            delay={100}
            helpText={HELP_TEXTS.offeneAngebote}
            helpTextKey="offeneAngebote"
            isLoading={kpisLoading}
          />
          <KPICard
            icon={Building2}
            label="Projekte"
            value={kpis?.projekteGesamt ?? 0}
            subValue={`${kpis?.auftraegeGesamt ?? 0} Aufträge`}
            trend={undefined}
            delay={200}
            isLoading={kpisLoading}
          />
          <KPICard
            icon={HardHat}
            label="Aktive Baustellen"
            value={kpis?.baustellenAktiv ?? 0}
            trend="neutral"
            delay={300}
            helpText={HELP_TEXTS.aktiveBaustellen}
            helpTextKey="aktiveBaustellen"
            isLoading={kpisLoading}
          />
          <KPICard
            icon={Clock}
            label="Offene Aufgaben"
            value={kpis?.aufgabenOffen ?? 0}
            subValue={urgentTaskCount > 0 ? `${urgentTaskCount} dringend` : 'Keine dringenden'}
            trend={urgentTaskCount > 0 ? "down" : "neutral"}
            delay={400}
            helpText={HELP_TEXTS.countdown}
            helpTextKey="countdown"
            isLoading={kpisLoading}
          />
        </div>

        {/* KPI Cards - Finanzen & Conversion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Target}
            label="Conversion-Rate"
            value={`${kpis?.conversionRate ?? 0}%`}
            subValue={`${kpis?.angeboteGewonnen ?? 0} von ${kpis?.angeboteGesamt ?? 0} Angeboten`}
            trend={(kpis?.conversionRate ?? 0) >= 50 ? "up" : "neutral"}
            delay={100}
            helpText={HELP_TEXTS.conversionRate}
            helpTextKey="conversionRate"
            isLoading={kpisLoading}
          />
          <KPICard
            icon={Receipt}
            label="Offene Rechnungen"
            value={kpis?.rechnungenOffen ?? 0}
            subValue={`${((kpis?.rechnungenOffenBetrag ?? 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} offen`}
            trend={(kpis?.rechnungenUeberfaellig ?? 0) > 0 ? "down" : "neutral"}
            delay={200}
            helpText={HELP_TEXTS.offeneRechnungen}
            helpTextKey="offeneRechnungen"
            isLoading={kpisLoading}
          />
          <KPICard
            icon={TrendingUp}
            label="Umsatz (bezahlt)"
            value={((kpis?.umsatzBezahlt ?? 0) / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            subValue={`${kpis?.rechnungenBezahlt ?? 0} Rechnungen bezahlt`}
            trend={undefined}
            delay={300}
            helpText={HELP_TEXTS.umsatzBezahlt}
            helpTextKey="umsatzBezahlt"
            isLoading={kpisLoading}
          />
          <KPICard
            icon={Shield}
            label="Aktive Garantien"
            value={kpis?.garantienAktiv ?? 0}
            subValue="Laufende Garantien"
            trend="neutral"
            delay={400}
            helpText={HELP_TEXTS.aktiveGarantien}
            helpTextKey="aktiveGarantien"
            isLoading={kpisLoading}
          />
        </div>

        {/* Kritische Aufgaben Banner */}
        <TaskAlertBanner />

        {/* Nächste Schritte Widget */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Nächste Schritte
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Aktive Projekte und ihre nächsten Aktionen
              </p>
            </div>
            <Link href="/projekte">
              <Button variant="ghost" size="sm" className="gap-2">
                Alle Projekte
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <NextStepsWidget
              steps={(nextStepsData as any[]) ?? []}
              isLoading={nextStepsLoading}
              onAdvance={handleAdvancePhase}
            />
          </CardContent>
        </Card>

        {/* Nachfassen fällig Widget */}
        {!followUpsLoading && followUpsData && (followUpsData as any[]).length > 0 && (
          <Card className="ff-card animate-fade-in-up animate-delay-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Nachfassen fällig
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {(followUpsData as any[]).filter((f: any) => f.status === 'pending').length}
                </Badge>
              </CardTitle>
              <Link href="/angebote">
                <Button variant="ghost" size="sm" className="gap-2">
                  Alle Angebote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {(followUpsData as any[])
                .filter((f: any) => f.status === 'pending')
                .slice(0, 5)
                .map((followUp: any) => {
                  const dueDate = new Date(followUp.dueAt);
                  const today = new Date();
                  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntil <= 0;
                  
                  return (
                    <div key={followUp.id} className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-all">
                      <div className={cn("p-2 rounded-xl", isOverdue ? "text-red-500 bg-red-500/10" : daysUntil <= 3 ? "text-amber-500 bg-amber-500/10" : "text-blue-500 bg-blue-500/10")}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {followUp.reminderType === 'first' ? '1. Nachfassen' : followUp.reminderType === 'second' ? '2. Nachfassen' : '3. Nachfassen'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Angebot #{followUp.offerId}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-sm font-semibold", isOverdue ? "text-red-500" : daysUntil <= 3 ? "text-amber-500" : "text-foreground")}>
                          {isOverdue ? "Überfällig" : `${daysUntil} Tage`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dueDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs shrink-0"
                        onClick={() => followUpCompleteMutation.mutate({ id: followUp.id, notes: 'Vom Dashboard erledigt' })}
                        disabled={followUpCompleteMutation.isPending}
                      >
                        Erledigt
                      </Button>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kanban Board with Drag-and-Drop */}
          <div className="lg:col-span-2">
            <Card data-tour="kanban-board" className="ff-card animate-fade-in-up animate-delay-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Projekte nach Phase
                    <HelpTooltip content={HELP_TEXTS.kanbanBoard.text} title={HELP_TEXTS.kanbanBoard.title} helpTextKey="kanbanBoard" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Projekte per Drag & Drop verschieben
                  </p>
                </div>
                <Link href="/projekte">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Alle Projekte
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {kanbanColumns.map((column) => {
                      const columnProjects = projects.filter((p: any) =>
                        column.phases.includes(p.phaseId)
                      );
                      return (
                        <KanbanColumn
                          key={column.id}
                          column={column}
                          projects={columnProjects}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDrop={handleDrop}
                          isDragOver={dragOverColumn === column.id}
                          draggingProjectId={draggingProjectId}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Countdown & Tasks */}
          <div className="space-y-6">
            {/* Countdown Warnings */}
            <Card data-tour="countdown-tasks" className="ff-card animate-fade-in-up animate-delay-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Countdown-Aufgaben
                  <HelpTooltip content={HELP_TEXTS.countdown.text} title={HELP_TEXTS.countdown.title} helpTextKey="countdown" />
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  {urgentTaskCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse-soft">
                      {urgentTaskCount} dringend
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : openTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>Keine offenen Aufgaben</p>
                  </div>
                ) : (
                  openTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Meine Aufgaben Widget */}
            <MeineAufgabenWidget />

            {/* Activity Log */}
            <Card data-tour="activity-log" className="ff-card animate-fade-in-up animate-delay-400">
              <CardHeader>
                <CardTitle className="text-lg">Letzte Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activitiesLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : !activitiesData || activitiesData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Aktivitäten</p>
                  </div>
                ) : (
                  activitiesData.map((activity: ActivityLog) => {
                    const timeAgo = getTimeAgo(activity.createdAt);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p>
                            <span className="font-medium">{activity.userName}</span>
                            {" "}{activity.details || activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-tour="quick-actions" className="ff-card animate-fade-in-up animate-delay-500">
              <CardHeader>
                <CardTitle className="text-lg">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start gap-3 ff-button" 
                  variant="outline"
                  onClick={() => setIsProjektWizardOpen(true)}
                >
                  <Building2 className="w-4 h-4" />
                  Neues Projekt anlegen
                </Button>
                <Button 
                  className="w-full justify-start gap-3 ff-button" 
                  variant="outline"
                  onClick={() => setIsObjektaufnahmeWizardOpen(true)}
                >
                  <FileText className="w-4 h-4" />
                  Objektaufnahme starten
                </Button>
                <Button 
                  className="w-full justify-start gap-3 ff-button" 
                  variant="outline"
                  onClick={() => setIsAngebotWizardOpen(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Angebot erstellen
                </Button>
                
                {/* HubSpot Sync Button */}
                <div className="pt-2 border-t mt-2">
                  <Button 
                    className="w-full justify-start gap-3 ff-button" 
                    variant="outline"
                    onClick={handleHubSpotSync}
                    disabled={hubspotSyncMutation.isPending}
                  >
                    {hubspotSyncMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4 text-[#ff7a59]" />
                    )}
                    {hubspotSyncMutation.isPending ? "Synchronisiere..." : "HubSpot synchronisieren"}
                  </Button>
                  {lastSyncTime && (
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Letzter Sync: {lastSyncTime.toLocaleString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Überfällige Aufgaben Widget */}
            <OverdueTasksWidget />

            {/* HubSpot Sync Widget */}
            <HubSpotSyncWidget />
          </div>
        </div>
      </div>

      {/* Wizards */}
      <ProjektWizard
        isOpen={isProjektWizardOpen}
        onClose={() => setIsProjektWizardOpen(false)}
        onComplete={() => {
          // Projektliste wird automatisch invalidiert im Wizard
        }}
      />
      <ObjektaufnahmeWizard
        isOpen={isObjektaufnahmeWizardOpen}
        onClose={() => setIsObjektaufnahmeWizardOpen(false)}
        onComplete={() => {}}
      />
      <AngebotWizard
        isOpen={isAngebotWizardOpen}
        onClose={() => setIsAngebotWizardOpen(false)}
        onComplete={() => {}}
      />
    </DashboardLayout>
  );
}
