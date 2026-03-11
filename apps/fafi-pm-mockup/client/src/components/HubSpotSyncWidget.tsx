/**
 * HubSpot Sync Widget
 * 
 * Zeigt den Sync-Status und ermöglicht manuellen Sync zwischen HubSpot und FaFi PM.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Building2,
  Briefcase,
  ArrowUpDown,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface SyncStatus {
  lastSync: string | null;
  contactsTotal: number;
  companiesTotal: number;
  dealsTotal: number;
  pendingPush: number;
  errors: string[];
}

export function HubSpotSyncWidget() {
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<{
    success: boolean;
    contactsImported: number;
    companiesImported: number;
    timestamp: string;
  } | null>(null);

  // Fetch HubSpot account info
  const { data: accountInfo, isLoading: isLoadingAccount } = trpc.hubspot.getAccountInfo.useQuery();
  
  // Sync mutation
  const syncMutation = trpc.hubspot.syncAll.useMutation({
    onMutate: () => {
      setIsSyncing(true);
      setSyncProgress(10);
    },
    onSuccess: (result) => {
      setSyncProgress(100);
      setLastSyncResult({
        success: result.success,
        contactsImported: result.contactsImported,
        companiesImported: result.companiesImported,
        timestamp: result.timestamp,
      });
      
      if (result.success) {
        toast.success("Sync erfolgreich!", {
          description: `${result.companiesImported} Unternehmen und ${result.contactsImported} Kontakte synchronisiert.`,
        });
      } else {
        toast.error("Sync mit Fehlern", {
          description: result.errors?.join(", ") || "Unbekannter Fehler",
        });
      }
      
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 2000);
    },
    onError: (error) => {
      setIsSyncing(false);
      setSyncProgress(0);
      toast.error("Sync fehlgeschlagen", {
        description: error.message,
      });
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
    
    // Simulate progress
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
  };

  const isConnected = accountInfo?.hubId && accountInfo.hubId > 0;
  const lastSyncTime = lastSyncResult?.timestamp 
    ? new Date(lastSyncResult.timestamp).toLocaleString("de-DE")
    : null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Cloud className="h-5 w-5 text-[#77bc1f]" />
            ) : (
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">HubSpot Sync</CardTitle>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-[#77bc1f]" : ""}>
            {isConnected ? "Verbunden" : "Nicht verbunden"}
          </Badge>
        </div>
        <CardDescription>
          {isConnected 
            ? `Hub ID: ${accountInfo?.hubId}` 
            : "Keine Verbindung zu HubSpot"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Synchronisiere...</span>
              <span className="font-medium">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {/* Last Sync Result */}
        {lastSyncResult && !isSyncing && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {lastSyncResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-[#77bc1f]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium">
                {lastSyncResult.success ? "Letzter Sync erfolgreich" : "Sync mit Fehlern"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{lastSyncResult.companiesImported} Unternehmen</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{lastSyncResult.contactsImported} Kontakte</span>
              </div>
            </div>
            {lastSyncTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{lastSyncTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {isConnected && !isSyncing && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border p-2 text-center">
              <Building2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-semibold">1000+</div>
              <div className="text-xs text-muted-foreground">Unternehmen</div>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-semibold">1000+</div>
              <div className="text-xs text-muted-foreground">Kontakte</div>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <Briefcase className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-semibold">1000+</div>
              <div className="text-xs text-muted-foreground">Deals</div>
            </div>
          </div>
        )}

        {/* Sync Button */}
        <Button 
          onClick={handleSync} 
          disabled={!isConnected || isSyncing}
          className="w-full bg-[#77bc1f] hover:bg-[#77bc1f]/90"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Synchronisiere...
            </>
          ) : (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Jetzt synchronisieren
            </>
          )}
        </Button>

        {/* Bidirectional Sync Info */}
        <p className="text-xs text-muted-foreground text-center">
          Bidirektionaler Sync: HubSpot ↔ FaFi PM
        </p>
      </CardContent>
    </Card>
  );
}

export default HubSpotSyncWidget;
