/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Offline-Sync Hook für Außendienst ohne Internetverbindung
 * Speichert Daten lokal und synchronisiert automatisch mit Backend-API
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// ============================================
// TYPES
// ============================================

export type ConnectionStatus = "online" | "offline";
export type SyncStatus = "idle" | "syncing" | "synced" | "pending" | "error";

export type EntityType = 
  | "project" 
  | "property" 
  | "constructionSite" 
  | "offer" 
  | "task" 
  | "company" 
  | "contact"
  | "constructionSiteLog"
  | "teamleiterCheck"
  | "calendarEvent";

interface QueuedAction {
  id: string;
  type: "create" | "update" | "delete";
  entity: EntityType;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  localId?: string; // For optimistic updates
}

interface OfflineSyncOptions {
  storageKey: string;
  maxRetries?: number;
  syncInterval?: number;
  onSyncComplete?: (successful: number, failed: number) => void;
  onSyncError?: (error: Error) => void;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingActions: number;
  lastSyncTime: Date | null;
  queueAction: (type: QueuedAction["type"], entity: EntityType, data: Record<string, unknown>, localId?: string) => void;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  getQueuedActions: () => QueuedAction[];
  getLocalData: <T>(key: string) => T | null;
  setLocalData: <T>(key: string, data: T) => void;
}

// ============================================
// HOOK
// ============================================

export function useOfflineSync({
  storageKey,
  maxRetries = 3,
  syncInterval = 30000, // 30 Sekunden
  onSyncComplete,
  onSyncError,
}: OfflineSyncOptions): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueKey = `fafi-offline-queue-${storageKey}`;
  const dataKey = `fafi-offline-data-${storageKey}`;

  // tRPC mutations for different entities
  const projectCreate = trpc.project.create.useMutation();
  const projectUpdate = trpc.project.update.useMutation();
  const projectDelete = trpc.project.delete.useMutation();
  
  const propertyCreate = trpc.property.create.useMutation();
  const propertyUpdate = trpc.property.update.useMutation();
  const propertyDelete = trpc.property.delete.useMutation();
  
  const constructionSiteCreate = trpc.constructionSite.create.useMutation();
  const constructionSiteUpdate = trpc.constructionSite.update.useMutation();
  const constructionSiteDelete = trpc.constructionSite.delete.useMutation();
  const constructionSiteLogCreate = trpc.constructionSite.createLog.useMutation();
  
  const offerCreate = trpc.offer.create.useMutation();
  const offerUpdate = trpc.offer.update.useMutation();
  const offerDelete = trpc.offer.delete.useMutation();
  
  const taskCreate = trpc.task.create.useMutation();
  const taskUpdate = trpc.task.update.useMutation();
  const taskDelete = trpc.task.delete.useMutation();
  
  const companyCreate = trpc.company.create.useMutation();
  const companyUpdate = trpc.company.update.useMutation();
  const companyDelete = trpc.company.delete.useMutation();
  
  const contactCreate = trpc.contact.create.useMutation();
  const contactUpdate = trpc.contact.update.useMutation();
  const contactDelete = trpc.contact.delete.useMutation();
  
  const teamleiterCheckCreate = trpc.teamleiterCheck.create.useMutation();
  const teamleiterCheckUpdate = trpc.teamleiterCheck.update.useMutation();
  
  const calendarEventCreate = trpc.calendar.create.useMutation();
  const calendarEventUpdate = trpc.calendar.update.useMutation();
  const calendarEventDelete = trpc.calendar.delete.useMutation();

  // Lade Queue aus LocalStorage beim Start
  useEffect(() => {
    try {
      const saved = localStorage.getItem(queueKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setQueue(parsed);
        if (parsed.length > 0) {
          setSyncStatus("pending");
        }
      }
    } catch {
      console.error("Fehler beim Laden der Offline-Queue");
    }
  }, [queueKey]);

  // Speichere Queue in LocalStorage bei Änderungen
  useEffect(() => {
    try {
      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch {
      console.error("Fehler beim Speichern der Offline-Queue");
    }
  }, [queue, queueKey]);

  // Online/Offline Event Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Verbindung hergestellt", {
        description: "Du bist wieder online. Daten werden synchronisiert.",
        icon: <Wifi className="w-4 h-4" />,
      });
      // Automatisch synchronisieren wenn wieder online
      if (queue.length > 0) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Keine Verbindung", {
        description: "Du bist offline. Änderungen werden lokal gespeichert.",
        icon: <WifiOff className="w-4 h-4" />,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queue.length]);

  // Automatische Synchronisierung im Intervall
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncNow();
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, queue.length, syncInterval]);

  // Execute a single action via tRPC
  const executeAction = async (action: QueuedAction): Promise<boolean> => {
    const { type, entity, data } = action;
    
    try {
      switch (entity) {
        case "project":
          if (type === "create") await projectCreate.mutateAsync(data as any);
          else if (type === "update") await projectUpdate.mutateAsync(data as any);
          else if (type === "delete") await projectDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "property":
          if (type === "create") await propertyCreate.mutateAsync(data as any);
          else if (type === "update") await propertyUpdate.mutateAsync(data as any);
          else if (type === "delete") await propertyDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "constructionSite":
          if (type === "create") await constructionSiteCreate.mutateAsync(data as any);
          else if (type === "update") await constructionSiteUpdate.mutateAsync(data as any);
          else if (type === "delete") await constructionSiteDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "constructionSiteLog":
          if (type === "create") await constructionSiteLogCreate.mutateAsync(data as any);
          break;
          
        case "offer":
          if (type === "create") await offerCreate.mutateAsync(data as any);
          else if (type === "update") await offerUpdate.mutateAsync(data as any);
          else if (type === "delete") await offerDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "task":
          if (type === "create") await taskCreate.mutateAsync(data as any);
          else if (type === "update") await taskUpdate.mutateAsync(data as any);
          else if (type === "delete") await taskDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "company":
          if (type === "create") await companyCreate.mutateAsync(data as any);
          else if (type === "update") await companyUpdate.mutateAsync(data as any);
          else if (type === "delete") await companyDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "contact":
          if (type === "create") await contactCreate.mutateAsync(data as any);
          else if (type === "update") await contactUpdate.mutateAsync(data as any);
          else if (type === "delete") await contactDelete.mutateAsync({ id: data.id as number });
          break;
          
        case "teamleiterCheck":
          if (type === "create") await teamleiterCheckCreate.mutateAsync(data as any);
          else if (type === "update") await teamleiterCheckUpdate.mutateAsync(data as any);
          break;
          
        case "calendarEvent":
          if (type === "create") await calendarEventCreate.mutateAsync(data as any);
          else if (type === "update") await calendarEventUpdate.mutateAsync(data as any);
          else if (type === "delete") await calendarEventDelete.mutateAsync({ id: data.id as number });
          break;
          
        default:
          console.warn(`Unknown entity type: ${entity}`);
          return false;
      }
      return true;
    } catch (error) {
      console.error(`Failed to sync ${type} ${entity}:`, error);
      return false;
    }
  };

  // Aktion zur Queue hinzufügen
  const queueAction = useCallback((
    type: QueuedAction["type"],
    entity: EntityType,
    data: Record<string, unknown>,
    localId?: string
  ) => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retries: 0,
      localId,
    };

    setQueue(prev => [...prev, action]);
    setSyncStatus("pending");

    // If online, try to sync immediately
    if (isOnline) {
      // Debounce immediate sync
      setTimeout(() => syncNow(), 100);
    } else {
      toast.info("Offline gespeichert", {
        description: `${entity} wird synchronisiert sobald du wieder online bist.`,
        icon: <CloudOff className="w-4 h-4" />,
      });
    }
  }, [isOnline]);

  // Synchronisierung durchführen
  const syncNow = useCallback(async () => {
    if (!isOnline || queue.length === 0) return;

    setSyncStatus("syncing");
    let successful = 0;
    let failed = 0;
    const remainingActions: QueuedAction[] = [];

    for (const action of queue) {
      const success = await executeAction(action);
      
      if (success) {
        successful++;
      } else {
        if (action.retries < maxRetries) {
          remainingActions.push({ ...action, retries: action.retries + 1 });
        } else {
          failed++;
          onSyncError?.(new Error(`Failed to sync ${action.type} ${action.entity} after ${maxRetries} retries`));
        }
      }
    }

    setQueue(remainingActions);
    setLastSyncTime(new Date());
    
    if (remainingActions.length === 0) {
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else {
      setSyncStatus("pending");
    }

    onSyncComplete?.(successful, failed);

    if (successful > 0) {
      toast.success("Synchronisierung abgeschlossen", {
        description: `${successful} Aktion(en) erfolgreich synchronisiert.`,
        icon: <Cloud className="w-4 h-4" />,
      });
    }

    if (failed > 0) {
      toast.error("Synchronisierung teilweise fehlgeschlagen", {
        description: `${failed} Aktion(en) konnten nicht synchronisiert werden.`,
      });
    }
  }, [isOnline, queue, maxRetries, onSyncComplete, onSyncError]);

  // Queue leeren
  const clearQueue = useCallback(() => {
    setQueue([]);
    setSyncStatus("idle");
    localStorage.removeItem(queueKey);
  }, [queueKey]);

  // Queue-Aktionen abrufen
  const getQueuedActions = useCallback(() => queue, [queue]);

  // Local data storage helpers
  const getLocalData = useCallback(<T,>(key: string): T | null => {
    try {
      const data = localStorage.getItem(`${dataKey}-${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, [dataKey]);

  const setLocalData = useCallback(<T,>(key: string, data: T) => {
    try {
      localStorage.setItem(`${dataKey}-${key}`, JSON.stringify(data));
    } catch {
      console.error("Failed to save local data");
    }
  }, [dataKey]);

  return {
    isOnline,
    syncStatus,
    pendingActions: queue.length,
    lastSyncTime,
    queueAction,
    syncNow,
    clearQueue,
    getQueuedActions,
    getLocalData,
    setLocalData,
  };
}

// ============================================
// UI COMPONENTS
// ============================================

interface OfflineIndicatorProps {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingActions: number;
  lastSyncTime: Date | null;
  onSyncClick?: () => void;
  compact?: boolean;
}

export function OfflineIndicator({
  isOnline,
  syncStatus,
  pendingActions,
  lastSyncTime,
  onSyncClick,
  compact = false,
}: OfflineIndicatorProps) {
  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "synced":
        return <Check className="w-4 h-4" />;
      case "pending":
        return <Cloud className="w-4 h-4" />;
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-100 text-red-700 border-red-200";
    switch (syncStatus) {
      case "syncing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "synced":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    switch (syncStatus) {
      case "syncing":
        return "Synchronisiert...";
      case "synced":
        return "Synchronisiert";
      case "pending":
        return `${pendingActions} ausstehend`;
      case "error":
        return "Sync-Fehler";
      default:
        return "Online";
    }
  };

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={cn("gap-1.5 cursor-pointer", getStatusColor())}
        onClick={onSyncClick}
      >
        {getStatusIcon()}
        {!isOnline ? "Offline" : pendingActions > 0 ? pendingActions : "✓"}
      </Badge>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg border",
      getStatusColor()
    )}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {pendingActions > 0 && isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSyncClick}
          disabled={syncStatus === "syncing"}
          className="h-7 px-2"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", syncStatus === "syncing" && "animate-spin")} />
        </Button>
      )}
      
      {lastSyncTime && (
        <span className="text-xs opacity-70">
          Zuletzt: {lastSyncTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}

// ============================================
// SYNC QUEUE PANEL
// ============================================

interface SyncQueuePanelProps {
  actions: QueuedAction[];
  onClear: () => void;
  onSync: () => void;
  syncStatus: SyncStatus;
}

export function SyncQueuePanel({
  actions,
  onClear,
  onSync,
  syncStatus,
}: SyncQueuePanelProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Keine ausstehenden Aktionen</p>
        <p className="text-xs mt-1">Alle Daten sind synchronisiert</p>
      </div>
    );
  }

  const entityLabels: Record<EntityType, string> = {
    project: "Projekt",
    property: "Immobilie",
    constructionSite: "Baustelle",
    offer: "Angebot",
    task: "Aufgabe",
    company: "Unternehmen",
    contact: "Kontakt",
    constructionSiteLog: "Baustelleneintrag",
    teamleiterCheck: "Teamleitercheck",
    calendarEvent: "Termin",
  };

  const getActionLabel = (action: QueuedAction) => {
    const typeLabels: Record<string, string> = {
      create: "Erstellen",
      update: "Aktualisieren",
      delete: "Löschen",
    };
    return `${typeLabels[action.type]} ${entityLabels[action.entity] || action.entity}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Ausstehende Aktionen ({actions.length})</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            Verwerfen
          </Button>
          <Button 
            size="sm" 
            onClick={onSync}
            disabled={syncStatus === "syncing"}
          >
            {syncStatus === "syncing" ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Synchronisiert...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Jetzt synchronisieren
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium">{getActionLabel(action)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(action.timestamp).toLocaleString("de-DE")}
                {action.retries > 0 && ` • ${action.retries} Versuch(e)`}
              </p>
            </div>
            <Badge variant={action.retries > 0 ? "destructive" : "secondary"}>
              {action.retries > 0 ? "Fehlgeschlagen" : "Ausstehend"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default useOfflineSync;
