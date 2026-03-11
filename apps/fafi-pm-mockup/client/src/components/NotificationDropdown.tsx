/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Notification Dropdown Component – Echte tRPC-Queries
 */

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  RefreshCw,
  Zap,
  Info,
  Users,
  Building2,
  CheckCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

// Priority styles
const priorityStyles = {
  critical: { bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30", icon: "text-red-500" },
  high: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", icon: "text-amber-500" },
  normal: { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/30", icon: "text-blue-500" },
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

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // tRPC Queries
  const { data: notifications, refetch } = trpc.notification.getByUserId.useQuery(
    { unreadOnly: false },
    { enabled: isOpen, refetchInterval: isOpen ? 30000 : false }
  );
  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  // Mutations
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const notificationList = (notifications as any[]) ?? [];
  const unreadTotal = unreadCount?.total ?? 0;
  const hasCritical = (unreadCount?.critical ?? 0) > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl touch-target">
          <Bell className="w-5 h-5" />
          {unreadTotal > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 min-w-5 h-5 px-1 text-white text-xs font-bold rounded-full flex items-center justify-center",
              hasCritical ? "bg-red-500 animate-pulse" : "bg-primary"
            )}>
              {unreadTotal > 99 ? "99+" : unreadTotal}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Benachrichtigungen</h3>
            {unreadTotal > 0 && (
              <p className="text-xs text-muted-foreground">{unreadTotal} ungelesen</p>
            )}
          </div>
          {unreadTotal > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Alle gelesen
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notificationList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificationList.slice(0, 20).map((notification: any) => {
                const priority = notification.priority ?? "normal";
                const styles = priorityStyles[priority as keyof typeof priorityStyles] ?? priorityStyles.normal;
                const Icon = typeIcons[notification.type] ?? Bell;
                const isUnread = !notification.isRead;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (isUnread) markAsReadMutation.mutate({ id: notification.id });
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                          styles.bg,
                          styles.border
                        )}
                      >
                        <Icon className={cn("w-5 h-5", styles.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm", isUnread ? "font-semibold" : "font-medium text-muted-foreground")}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {notification.createdAt
                              ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })
                              : ""}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        {notification.link && (
                          <Link href={notification.link} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <span className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                              Öffnen <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                    {isUnread && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Link href="/benachrichtigungen">
            <Button variant="ghost" className="w-full text-sm" onClick={() => setIsOpen(false)}>
              Alle Benachrichtigungen anzeigen
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
