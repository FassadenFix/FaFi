/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Benachrichtigungszentrale: Echte Benachrichtigungen + Einstellungen
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Users,
  Building2,
  Save,
  Trash2,
  CheckCheck,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

// Priority icons and colors
const priorityConfig = {
  critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Kritisch" },
  high: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", label: "Hoch" },
  normal: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "Normal" },
};

// Type icons
const typeIcons: Record<string, React.ElementType> = {
  task_assigned: Users,
  task_due: Clock,
  project_status: Building2,
  offer_status: FileText,
  system: Info,
  reminder: Bell,
  dunning: AlertTriangle,
  follow_up: RefreshCw,
  hubspot_sync: RefreshCw,
  workflow: ArrowRight,
};

export default function Benachrichtigungen() {
  const [activeTab, setActiveTab] = useState("alle");
  
  // tRPC Queries
  const { data: notifications, isLoading, refetch } = trpc.notification.getByUserId.useQuery(
    { unreadOnly: activeTab === "ungelesen" }
  );
  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery();
  
  // Mutations
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Alle Benachrichtigungen als gelesen markiert");
    },
  });
  
  const deleteReadMutation = trpc.notification.deleteRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Gelesene Benachrichtigungen gelöscht");
    },
  });

  const notificationList = (notifications as any[]) ?? [];
  const unreadTotal = unreadCount?.total ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" />
              Benachrichtigungen
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadTotal > 0 ? `${unreadTotal} ungelesene Benachrichtigungen` : "Keine ungelesenen Benachrichtigungen"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadTotal === 0}
            >
              <CheckCheck className="w-4 h-4" />
              Alle gelesen
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-500 hover:text-red-600"
              onClick={() => deleteReadMutation.mutate()}
              disabled={deleteReadMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
              Gelesene löschen
            </Button>
          </div>
        </div>

        {/* Priority Summary */}
        {unreadCount && (unreadCount.critical > 0 || unreadCount.high > 0) && (
          <div className="flex gap-3 animate-fade-in-up animate-delay-100">
            {unreadCount.critical > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">{unreadCount.critical} kritisch</span>
              </div>
            )}
            {unreadCount.high > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">{unreadCount.high} wichtig</span>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="alle" className="gap-2">
              Alle
              {notificationList.length > 0 && (
                <Badge variant="secondary" className="text-xs">{notificationList.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ungelesen" className="gap-2">
              Ungelesen
              {unreadTotal > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">{unreadTotal}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card className="ff-card">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Lade Benachrichtigungen...
                  </div>
                ) : notificationList.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-primary/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {activeTab === "ungelesen" ? "Keine ungelesenen Benachrichtigungen" : "Keine Benachrichtigungen vorhanden"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notificationList.map((notification: any) => {
                      const pConfig = priorityConfig[notification.priority as keyof typeof priorityConfig] ?? priorityConfig.normal;
                      const TypeIcon = typeIcons[notification.type] ?? Info;
                      const PriorityIcon = pConfig.icon;
                      const isUnread = !notification.isRead;
                      
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-4 p-4 transition-all hover:bg-muted/50",
                            isUnread && "bg-primary/5 border-l-4 border-l-primary"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn("p-2.5 rounded-xl shrink-0", pConfig.bg)}>
                            <TypeIcon className={cn("w-5 h-5", pConfig.color)} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={cn("text-sm", isUnread ? "font-semibold" : "font-medium text-muted-foreground")}>
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                )}
                              </div>
                              {notification.priority !== "normal" && (
                                <Badge variant="outline" className={cn("shrink-0 text-xs", pConfig.color)}>
                                  <PriorityIcon className="w-3 h-3 mr-1" />
                                  {pConfig.label}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Meta */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.createdAt
                                  ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })
                                  : ""}
                              </span>
                              {notification.link && (
                                <Link href={notification.link}>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary">
                                    Öffnen <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </Link>
                              )}
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs gap-1"
                                  onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Gelesen
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
