/**
 * Vorbereitungsaufgaben-Board
 * Kanban-artige Ansicht der automatisch generierten Vorbereitungsaufgaben (AG/AN)
 * mit Ampelsystem, Drag & Drop und Aufgaben-Detailansicht
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  ClipboardList, Clock, CheckCircle2, AlertTriangle,
  Building2, Calendar, User, ArrowRight, Filter, RefreshCw,
  GripVertical, MessageSquare, Paperclip, Eye
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { format, isPast, isToday, addDays, isBefore } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import { HelpTooltip, SectionHelp, HELP_TEXTS } from "@/components/HelpTooltip";

type TaskStatus = "offen" | "in_bearbeitung" | "erledigt" | "abgebrochen";
type ResponsibleParty = "auftraggeber" | "auftragnehmer";

interface PreparationTask {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  dueDate: Date | null;
  assignedRole: string | null;
  responsibleParty: ResponsibleParty | null;
  completedAt: Date | null;
  createdAt: Date;
  constructionSiteId: number | null;
  projectId: number | null;
  siteName: string | null;
  siteNumber: string | null;
  siteStatus: string | null;
  siteStartDate: Date | null;
  projectName: string | null;
}

// Ampel-Status berechnen
function getTrafficLightStatus(task: PreparationTask): "green" | "yellow" | "red" {
  if (task.status === "erledigt") return "green";
  if (!task.dueDate) return "yellow";
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  if (isPast(dueDate) && !isToday(dueDate)) return "red";
  if (isToday(dueDate) || isBefore(dueDate, addDays(now, 3))) return "yellow";
  return "green";
}

// ============================================
// SORTABLE TASK CARD (Drag & Drop)
// ============================================
function SortableTaskCard({ 
  task, 
  onStatusChange,
  onOpenDetail 
}: { 
  task: PreparationTask;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onOpenDetail: (task: PreparationTask) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id.toString(),
    data: { task, status: task.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard 
        task={task} 
        onStatusChange={onStatusChange}
        onOpenDetail={onOpenDetail}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ============================================
// TASK CARD
// ============================================
function TaskCard({ 
  task, 
  onStatusChange,
  onOpenDetail,
  dragHandleProps,
  isOverlay = false,
}: { 
  task: PreparationTask;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onOpenDetail?: (task: PreparationTask) => void;
  dragHandleProps?: Record<string, any>;
  isOverlay?: boolean;
}) {
  const trafficLight = getTrafficLightStatus(task);
  
  const trafficLightColors = {
    green: "bg-green-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
  };

  const priorityColors: Record<string, string> = {
    niedrig: "bg-slate-100 text-slate-700",
    normal: "bg-blue-100 text-blue-700",
    hoch: "bg-orange-100 text-orange-700",
    dringend: "bg-red-100 text-red-700",
  };

  const responsibleColors: Record<string, string> = {
    auftraggeber: "bg-purple-100 text-purple-700 border-purple-200",
    auftragnehmer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    offen: "in_bearbeitung",
    in_bearbeitung: "erledigt",
    erledigt: null,
    abgebrochen: null,
  };

  const nextStatusLabel: Record<TaskStatus, string> = {
    offen: "Starten",
    in_bearbeitung: "Erledigen",
    erledigt: "",
    abgebrochen: "",
  };

  return (
    <Card className={cn(
      "shadow-sm hover:shadow-md transition-all cursor-pointer group",
      isOverlay && "shadow-lg ring-2 ring-primary/20 rotate-2"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Header mit Drag-Handle, Ampel und Priorität */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            {dragHandleProps && (
              <div 
                {...dragHandleProps} 
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground -ml-1"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            {/* Ampel-Indikator */}
            <div className={cn("w-3 h-3 rounded-full shrink-0", trafficLightColors[trafficLight])} 
                 title={trafficLight === 'red' ? 'Überfällig' : trafficLight === 'yellow' ? 'Bald fällig' : 'Im Plan'} />
            <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority] || "")}>
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {task.responsibleParty && (
              <Badge variant="outline" className={cn("text-xs border", responsibleColors[task.responsibleParty] || "")}>
                {task.responsibleParty === 'auftraggeber' ? 'AG' : 'AN'}
              </Badge>
            )}
            {onOpenDetail && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onOpenDetail(task); }}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Titel – klickbar für Detail */}
        <h4 
          className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors"
          onClick={() => onOpenDetail?.(task)}
        >
          {task.title}
        </h4>

        {/* Baustellen-Info */}
        {task.siteName && (
          <Link href={`/baustellen/${task.constructionSiteId}`}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{task.siteNumber}: {task.siteName}</span>
            </div>
          </Link>
        )}

        {/* Fälligkeitsdatum */}
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs",
            trafficLight === 'red' ? 'text-red-600 font-medium' : 
            trafficLight === 'yellow' ? 'text-amber-600' : 'text-muted-foreground'
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {format(new Date(task.dueDate), "dd. MMM yyyy", { locale: de })}
              {trafficLight === 'red' && ' (überfällig)'}
            </span>
          </div>
        )}

        {/* Zuständig */}
        {task.assignedRole && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{task.assignedRole}</span>
          </div>
        )}

        {/* Status-Wechsel Button */}
        {nextStatus[task.status] && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStatusChange(task.id, nextStatus[task.status]!);
            }}
          >
            {nextStatusLabel[task.status]}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// KANBAN COLUMN (Droppable)
// ============================================
function KanbanColumn({ 
  title, 
  tasks, 
  status,
  icon: Icon,
  onStatusChange,
  onOpenDetail,
  isOver,
}: { 
  title: string; 
  tasks: PreparationTask[]; 
  status: TaskStatus;
  icon: React.ElementType;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onOpenDetail: (task: PreparationTask) => void;
  isOver?: boolean;
}) {
  const columnColors: Record<string, string> = {
    offen: "border-t-amber-500",
    in_bearbeitung: "border-t-blue-500",
    erledigt: "border-t-green-500",
    abgebrochen: "border-t-slate-500",
  };

  const headerColors: Record<string, string> = {
    offen: "text-amber-600 bg-amber-50",
    in_bearbeitung: "text-blue-600 bg-blue-50",
    erledigt: "text-green-600 bg-green-50",
    abgebrochen: "text-slate-600 bg-slate-50",
  };

  const taskIds = tasks.map(t => t.id.toString());

  return (
    <div className={cn(
      "flex flex-col min-w-[320px] max-w-[400px] flex-1 bg-muted/30 rounded-xl border-t-4 transition-all",
      columnColors[status],
      isOver && "ring-2 ring-primary/30 bg-primary/5"
    )}>
      <div className={cn("flex items-center gap-2 p-4 rounded-t-lg", headerColors[status])}>
        <Icon className="w-5 h-5" />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
      </div>
      
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[120px]">
          {tasks.length === 0 ? (
            <div className={cn(
              "text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg",
              isOver ? "border-primary/40 bg-primary/5" : "border-transparent"
            )}>
              {isOver ? "Hier ablegen" : "Keine Aufgaben"}
            </div>
          ) : (
            tasks.map(task => (
              <SortableTaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={onStatusChange}
                onOpenDetail={onOpenDetail}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ title, value, icon: Icon, color }: { 
  title: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Vorbereitungsaufgaben() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [activeTask, setActiveTask] = useState<PreparationTask | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [detailTask, setDetailTask] = useState<PreparationTask | null>(null);

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Daten laden
  const { data: tasks = [], isLoading, refetch } = trpc.task.getPreparationBoard.useQuery({
    constructionSiteId: selectedSite !== "all" ? parseInt(selectedSite) : undefined,
    responsibleParty: selectedParty !== "all" ? selectedParty as ResponsibleParty : undefined,
  });

  const { data: constructionSites = [] } = trpc.constructionSite.list.useQuery();

  // Status-Update Mutation
  const updateStatus = trpc.task.updateStatus.useMutation({
    onSuccess: () => { refetch(); },
  });

  const handleStatusChange = useCallback((taskId: number, newStatus: TaskStatus) => {
    updateStatus.mutate({ id: taskId, status: newStatus });
  }, [updateStatus]);

  // Drag & Drop Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = (event.active.data.current as any)?.task;
    if (task) setActiveTask(task);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id;
    if (!overId) { setOverColumn(null); return; }
    
    // Check if we're over a column ID or a task in a column
    const overIdStr = overId.toString();
    if (["offen", "in_bearbeitung", "erledigt"].includes(overIdStr)) {
      setOverColumn(overIdStr as TaskStatus);
    } else {
      // Find which column the over-task belongs to
      const overTask = (tasks as PreparationTask[]).find(t => t.id.toString() === overIdStr);
      if (overTask) setOverColumn(overTask.status as TaskStatus);
    }
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    setOverColumn(null);
    
    const { active, over } = event;
    if (!over) return;

    const activeTaskData = (active.data.current as any)?.task as PreparationTask;
    if (!activeTaskData) return;

    // Determine target status
    let targetStatus: TaskStatus | null = null;
    const overId = over.id.toString();
    
    if (["offen", "in_bearbeitung", "erledigt"].includes(overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = (tasks as PreparationTask[]).find(t => t.id.toString() === overId);
      if (overTask) targetStatus = overTask.status as TaskStatus;
    }

    if (targetStatus && targetStatus !== activeTaskData.status) {
      handleStatusChange(activeTaskData.id, targetStatus);
    }
  }, [tasks, handleStatusChange]);

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setOverColumn(null);
  }, []);

  // Aufgaben nach Status gruppieren
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, PreparationTask[]> = {
      offen: [],
      in_bearbeitung: [],
      erledigt: [],
      abgebrochen: [],
    };
    (tasks as PreparationTask[]).forEach(task => {
      if (groups[task.status as TaskStatus]) {
        groups[task.status as TaskStatus].push(task);
      }
    });
    return groups;
  }, [tasks]);

  // Statistiken
  const stats = useMemo(() => {
    const allTasks = tasks as PreparationTask[];
    const overdue = allTasks.filter(t => t.status !== 'erledigt' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length;
    const agTasks = allTasks.filter(t => t.responsibleParty === 'auftraggeber' && t.status !== 'erledigt').length;
    const anTasks = allTasks.filter(t => t.responsibleParty === 'auftragnehmer' && t.status !== 'erledigt').length;
    return {
      total: allTasks.length,
      open: groupedTasks.offen.length,
      inProgress: groupedTasks.in_bearbeitung.length,
      completed: groupedTasks.erledigt.length,
      overdue, agTasks, anTasks,
    };
  }, [tasks, groupedTasks]);

  // Aktive Baustellen für Filter
  const activeSites = useMemo(() => {
    return constructionSites.filter(s => s.status === 'geplant' || s.status === 'aktiv');
  }, [constructionSites]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-primary" />
              Vorbereitungsaufgaben
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              Kanban-Board mit Drag & Drop
              <HelpTooltip content={HELP_TEXTS.dragDropHinweis.text} title={HELP_TEXTS.dragDropHinweis.title} helpTextKey="dragDropHinweis" />
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Aktualisieren
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Alle Baustellen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Baustellen</SelectItem>
                  {activeSites.map(site => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.siteNumber}: {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Alle Verantwortlichen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Verantwortlichen</SelectItem>
                  <SelectItem value="auftraggeber">AG (Auftraggeber)</SelectItem>
                  <SelectItem value="auftragnehmer">AN (FassadenFix)</SelectItem>
                </SelectContent>
              </Select>

              {/* AG/AN Erklärung */}
              <div className="flex items-center gap-2">
                <HelpTooltip content={HELP_TEXTS.agVerantwortung.text} title={HELP_TEXTS.agVerantwortung.title} helpTextKey="agVerantwortung" />
                <HelpTooltip content={HELP_TEXTS.anVerantwortung.text} title={HELP_TEXTS.anVerantwortung.title} helpTextKey="anVerantwortung" />
              </div>

              {/* Ampel-Legende */}
              <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                <HelpTooltip content={HELP_TEXTS.ampelSystem.text} title={HELP_TEXTS.ampelSystem.title} helpTextKey="ampelSystem" variant="inline" />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Im Plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Bald fällig</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Überfällig</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard title="Gesamt" value={stats.total} icon={ClipboardList} color="bg-slate-100 text-slate-600" />
          <StatCard title="Offen" value={stats.open} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatCard title="In Arbeit" value={stats.inProgress} icon={RefreshCw} color="bg-blue-100 text-blue-600" />
          <StatCard title="Erledigt" value={stats.completed} icon={CheckCircle2} color="bg-green-100 text-green-600" />
          <StatCard title="Überfällig" value={stats.overdue} icon={AlertTriangle} color="bg-red-100 text-red-600" />
          <StatCard title="AG offen" value={stats.agTasks} icon={User} color="bg-purple-100 text-purple-600" />
          <StatCard title="AN offen" value={stats.anTasks} icon={User} color="bg-emerald-100 text-emerald-600" />
        </div>

        {/* Kanban Board with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn 
              title="Offen" 
              tasks={groupedTasks.offen} 
              status="offen"
              icon={Clock}
              onStatusChange={handleStatusChange}
              onOpenDetail={setDetailTask}
              isOver={overColumn === "offen"}
            />
            <KanbanColumn 
              title="In Bearbeitung" 
              tasks={groupedTasks.in_bearbeitung} 
              status="in_bearbeitung"
              icon={RefreshCw}
              onStatusChange={handleStatusChange}
              onOpenDetail={setDetailTask}
              isOver={overColumn === "in_bearbeitung"}
            />
            <KanbanColumn 
              title="Erledigt" 
              tasks={groupedTasks.erledigt} 
              status="erledigt"
              icon={CheckCircle2}
              onStatusChange={handleStatusChange}
              onOpenDetail={setDetailTask}
              isOver={overColumn === "erledigt"}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask && (
              <div className="w-[360px]">
                <TaskCard 
                  task={activeTask} 
                  onStatusChange={() => {}}
                  isOverlay
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {!isLoading && tasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Vorbereitungsaufgaben</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Vorbereitungsaufgaben werden automatisch erstellt, wenn ein Auftrag angenommen wird.
                Sie enthalten alle notwendigen Schritte zur Baustellenvorbereitung.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(open) => { if (!open) setDetailTask(null); }}
        onStatusChange={handleStatusChange}
        onUpdate={() => refetch()}
      />
    </DashboardLayout>
  );
}
