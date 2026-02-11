import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const ESCALATION_CONFIG = {
  gelb: {
    label: "Leicht überfällig",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    dotColor: "bg-yellow-500",
    icon: Clock,
  },
  orange: {
    label: "Überfällig",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    dotColor: "bg-orange-500",
    icon: AlertTriangle,
  },
  rot: {
    label: "Kritisch überfällig",
    color: "bg-red-100 text-red-800 border-red-300",
    dotColor: "bg-red-500",
    icon: AlertTriangle,
  },
};

/**
 * TaskAlertBanner – Zeigt kritische überfällige Aufgaben als Banner im Dashboard
 */
export function TaskAlertBanner() {
  const { data: overdueTasks, isLoading } = trpc.task.getOverdueWithEscalation.useQuery();
  const [, navigate] = useLocation();

  if (isLoading || !overdueTasks || overdueTasks.length === 0) return null;

  // Nur kritische (rot) Aufgaben als Banner anzeigen
  const criticalTasks = overdueTasks.filter(
    (t: { escalation: string }) => t.escalation === "rot"
  );

  if (criticalTasks.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <span className="font-semibold text-red-800">
          {criticalTasks.length} kritisch überfällige{" "}
          {criticalTasks.length === 1 ? "Aufgabe" : "Aufgaben"}
        </span>
      </div>
      <div className="space-y-1">
        {criticalTasks.slice(0, 3).map((task: any) => (
          <div
            key={task.id}
            className="flex items-center justify-between text-sm text-red-700"
          >
            <span className="truncate flex-1">{task.title}</span>
            <span className="text-red-500 ml-2 whitespace-nowrap">
              {task.daysOverdue} Tage überfällig
            </span>
          </div>
        ))}
        {criticalTasks.length > 3 && (
          <span className="text-xs text-red-500">
            + {criticalTasks.length - 3} weitere
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * OverdueTasksWidget – Vollständiges Dashboard-Widget mit Eskalationsfarben
 */
export function OverdueTasksWidget() {
  const { data: overdueTasks, isLoading } = trpc.task.getOverdueWithEscalation.useQuery();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Überfällige Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = overdueTasks || [];

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Aufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine überfälligen Aufgaben – alles im Zeitplan!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Gruppiere nach Eskalationsstufe
  const grouped = {
    rot: tasks.filter((t: any) => t.escalation === "rot"),
    orange: tasks.filter((t: any) => t.escalation === "orange"),
    gelb: tasks.filter((t: any) => t.escalation === "gelb"),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Überfällige Aufgaben
            <Badge variant="destructive" className="ml-1">
              {tasks.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(["rot", "orange", "gelb"] as const).map((level) => {
          const levelTasks = grouped[level];
          if (levelTasks.length === 0) return null;
          const config = ESCALATION_CONFIG[level];
          const Icon = config.icon;

          return (
            <div key={level}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className="text-xs font-medium text-muted-foreground">
                  {config.label} ({levelTasks.length})
                </span>
              </div>
              <div className="space-y-1">
                {levelTasks.slice(0, 3).map((task: any) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between text-sm px-2 py-1 rounded border ${config.color} cursor-pointer hover:opacity-80`}
                    onClick={() => navigate(`/aufgaben`)}
                  >
                    <span className="truncate flex-1">{task.title}</span>
                    <span className="text-xs ml-2 whitespace-nowrap opacity-75">
                      {task.daysOverdue}d
                    </span>
                  </div>
                ))}
                {levelTasks.length > 3 && (
                  <span className="text-xs text-muted-foreground pl-2">
                    + {levelTasks.length - 3} weitere
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
