/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * OFFLINE-MODUS VISUALISIERUNG
 * Zeigt an, welche Daten auch ohne Internet verfügbar sind
 * Wichtig für Baustellen-Einsatz
 */

import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Sync-Status Typen
type SyncStatus = "synced" | "pending" | "conflict" | "offline";

interface SyncItem {
  id: string;
  type: "projekt" | "immobilie" | "angebot" | "baustelle" | "dokument";
  name: string;
  status: SyncStatus;
  lastSync?: Date;
  pendingChanges?: number;
}

// Mock-Daten für ausstehende Synchronisierungen
const MOCK_SYNC_QUEUE: SyncItem[] = [
  {
    id: "1",
    type: "immobilie",
    name: "Musterstraße 15 - Nordseite",
    status: "pending",
    pendingChanges: 3,
  },
  {
    id: "2",
    type: "baustelle",
    name: "Wohnanlage Sonnenhof - Logbuch",
    status: "pending",
    pendingChanges: 5,
  },
  {
    id: "3",
    type: "dokument",
    name: "Foto_Nord_001.jpg",
    status: "pending",
    pendingChanges: 1,
  },
];

// Offline-verfügbare Bereiche
const OFFLINE_AVAILABLE = [
  { name: "Aktive Projekte", available: true, size: "12 MB" },
  { name: "Zugewiesene Baustellen", available: true, size: "8 MB" },
  { name: "Objektaufnahme-Formulare", available: true, size: "2 MB" },
  { name: "Letzte 50 Dokumente", available: true, size: "45 MB" },
  { name: "Team-Kontakte", available: true, size: "1 MB" },
  { name: "Berichtswesen", available: false, size: "-" },
  { name: "HubSpot-Sync", available: false, size: "-" },
];

// Context für globalen Offline-Status
interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (value: boolean) => void;
  syncQueue: SyncItem[];
  syncNow: () => void;
  isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSimulatedOffline: false,
  setSimulatedOffline: () => {},
  syncQueue: [],
  syncNow: () => {},
  isSyncing: false,
});

export function useOffline() {
  return useContext(OfflineContext);
}

// Provider-Komponente
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSimulatedOffline, setSimulatedOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>(MOCK_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState(false);

  // Browser Online/Offline Events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Wieder online!", {
        description: "Deine Änderungen werden jetzt synchronisiert.",
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Offline-Modus", {
        description: "Du arbeitest jetzt ohne Internet. Deine Änderungen werden gespeichert.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync-Funktion (simuliert)
  const syncNow = () => {
    if (!isOnline || isSimulatedOffline) {
      toast.error("Keine Verbindung", {
        description: "Synchronisation nicht möglich ohne Internet.",
      });
      return;
    }

    setIsSyncing(true);
    toast.info("Synchronisiere...", {
      description: `${syncQueue.length} Änderungen werden hochgeladen.`,
    });

    // Simulierte Sync-Zeit
    setTimeout(() => {
      setSyncQueue([]);
      setIsSyncing(false);
      toast.success("Synchronisation abgeschlossen", {
        description: "Alle Änderungen wurden hochgeladen.",
      });
    }, 2000);
  };

  const effectiveOnline = isOnline && !isSimulatedOffline;

  return (
    <OfflineContext.Provider
      value={{
        isOnline: effectiveOnline,
        isSimulatedOffline,
        setSimulatedOffline,
        syncQueue,
        syncNow,
        isSyncing,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

// Offline-Status-Indikator für Header
export function OfflineIndicator() {
  const { isOnline, isSimulatedOffline, setSimulatedOffline, syncQueue, syncNow, isSyncing } = useOffline();
  const pendingCount = syncQueue.length;

  // Nr.62: Nur anzeigen wenn offline oder pending sync items vorhanden
  // Im Online-Zustand ohne pending items wird nichts angezeigt
  if (isOnline && !isSimulatedOffline && pendingCount === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 relative",
            !isOnline && "text-amber-600"
          )}
        >
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
          )}
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Status-Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">Online</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-medium text-amber-600">Offline</span>
                </>
              )}
            </div>
            {/* Demo-Toggle für Offline-Simulation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulatedOffline(!isSimulatedOffline)}
              className="text-xs"
            >
              {isSimulatedOffline ? "Online gehen" : "Offline testen"}
            </Button>
          </div>

          {/* Ausstehende Änderungen */}
          {pendingCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ausstehende Änderungen</span>
                <Badge variant="secondary">{pendingCount}</Badge>
              </div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-xs p-2 bg-muted rounded"
                  >
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="truncate flex-1">{item.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.pendingChanges}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={syncNow}
                disabled={!isOnline || isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synchronisiere...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Jetzt synchronisieren
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Alles synchronisiert */}
          {pendingCount === 0 && isOnline && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Alles synchronisiert</span>
            </div>
          )}

          {/* Offline-Info */}
          {!isOnline && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Du arbeitest offline
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                Deine Änderungen werden lokal gespeichert und automatisch synchronisiert, sobald du wieder online bist.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Offline-verfügbare Daten Dialog
export function OfflineDataDialog() {
  const { isOnline } = useOffline();
  const totalSize = OFFLINE_AVAILABLE
    .filter((item) => item.available)
    .reduce((acc, item) => {
      const size = parseInt(item.size) || 0;
      return acc + size;
    }, 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Smartphone className="w-4 h-4" />
          Offline-Daten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudOff className="w-5 h-5" />
            Offline verfügbare Daten
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Speicherplatz */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Offline-Speicher</span>
              <span className="font-medium">{totalSize} MB / 200 MB</span>
            </div>
            <Progress value={(totalSize / 200) * 100} className="h-2" />
          </div>

          {/* Verfügbare Bereiche */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bereiche</h4>
            {OFFLINE_AVAILABLE.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  item.available ? "bg-green-50 dark:bg-green-950" : "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.available ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Cloud className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.available ? item.size : "Nur online"}
                </span>
              </div>
            ))}
          </div>

          {/* Hinweis */}
          <p className="text-xs text-muted-foreground">
            Offline-Daten werden automatisch aktualisiert, wenn du online bist.
            Du kannst auf der Baustelle auch ohne Internet arbeiten.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sync-Status Badge für einzelne Datensätze
interface SyncStatusBadgeProps {
  status: SyncStatus;
  lastSync?: Date;
  showLabel?: boolean;
}

export function SyncStatusBadge({ status, lastSync, showLabel = false }: SyncStatusBadgeProps) {
  const config = {
    synced: {
      icon: CheckCircle2,
      label: "Synchronisiert",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    pending: {
      icon: Clock,
      label: "Ausstehend",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-950",
    },
    conflict: {
      icon: AlertCircle,
      label: "Konflikt",
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-950",
    },
    offline: {
      icon: CloudOff,
      label: "Nur lokal",
      color: "text-gray-600",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
  };

  const { icon: Icon, label, color, bg } = config[status];

  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs", bg, color)}>
      <Icon className="w-3 h-3" />
      {showLabel && <span>{label}</span>}
    </div>
  );
}

// Offline-Banner für Seiten
export function OfflineBanner() {
  const { isOnline, syncQueue } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
      <WifiOff className="w-4 h-4" />
      <span>
        <strong>Offline-Modus</strong> – Deine Änderungen werden lokal gespeichert
        {syncQueue.length > 0 && ` (${syncQueue.length} ausstehend)`}
      </span>
    </div>
  );
}

export default OfflineProvider;
