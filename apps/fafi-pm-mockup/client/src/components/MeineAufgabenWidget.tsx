/**
 * "Meine Aufgaben" Widget – Rollenspezifische To-Do-Liste im Dashboard
 * CI: FassadenFix #77bc1f, #4e5758
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListChecks,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

export default function MeineAufgabenWidget() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: tasks, isLoading } = trpc.task.list.useQuery();

  // Filter tasks for current user (assigned to me or created by me)
  const myTasks = tasks?.filter(
    (t) =>
      t.status !== "erledigt" &&
      t.status !== "abgebrochen" &&
      (t.assignedToId === user?.id || t.createdById === user?.id)
  ) || [];

  // Sort by priority and due date
  const sortedTasks = [...myTasks].sort((a, b) => {
    const priorityOrder = { dringend: 0, hoch: 1, normal: 2, niedrig: 3 };
    const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (pA !== pB) return pA - pB;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return 0;
  }).slice(0, 5);

  const overdueTasks = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const priorityColors = {
    dringend: "bg-red-100 text-red-700 border-red-200",
    hoch: "bg-amber-100 text-amber-700 border-amber-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    niedrig: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const statusIcons = {
    offen: Clock,
    in_bearbeitung: ListChecks,
    erledigt: CheckCircle2,
    abgebrochen: AlertTriangle,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#77bc1f]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#77bc1f]" />
            Meine Aufgaben
            {myTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {myTasks.length}
              </Badge>
            )}
          </CardTitle>
          {overdueTasks > 0 && (
            <Badge className="bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {overdueTasks} überfällig
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#77bc1f]" />
            <p className="font-medium">Keine offenen Aufgaben</p>
            <p className="text-sm">Alle Aufgaben sind erledigt!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Clock;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              const daysUntilDue = task.dueDate
                ? Math.ceil(
                    (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                    isOverdue ? "border-red-200 bg-red-50/50" : "border-border"
                  }`}
                  onClick={() => {
                    if (task.projectId) navigate(`/projekte/${task.projectId}`);
                  }}
                >
                  <StatusIcon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isOverdue ? "text-red-500" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          priorityColors[task.priority as keyof typeof priorityColors] || ""
                        }`}
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span
                          className={`text-[10px] flex items-center gap-1 ${
                            isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          <CalendarDays className="w-3 h-3" />
                          {isOverdue
                            ? `${Math.abs(daysUntilDue!)} Tage überfällig`
                            : daysUntilDue === 0
                            ? "Heute fällig"
                            : daysUntilDue === 1
                            ? "Morgen fällig"
                            : `in ${daysUntilDue} Tagen`}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}

            {myTasks.length > 5 && (
              <Button
                variant="ghost"
                className="w-full text-sm text-[#77bc1f] hover:text-[#77bc1f]/80"
                onClick={() => navigate("/aufgaben")}
              >
                Alle {myTasks.length} Aufgaben anzeigen
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
