/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * HubSpot Integration: Echte CRM-Synchronisation, Auto-Sync, Sync-Status
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Building2,
  Euro,
  ExternalLink,
  Search,
  TrendingUp,
  Phone,
  Mail,
  Zap,
  Power,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const HUBSPOT_ORANGE = "#ff7a59";

function SyncStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    synced: { label: "Verbunden", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    pending: { label: "Ausstehend", color: "bg-amber-100 text-amber-700", icon: Clock },
    error: { label: "Fehler", color: "bg-red-100 text-red-700", icon: AlertCircle },
    syncing: { label: "Synchronisiert...", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  };
  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={cn("gap-1", cfg.color)}>
      <Icon className={cn("w-3 h-3", status === "syncing" && "animate-spin")} />
      {cfg.label}
    </Badge>
  );
}

export default function HubSpotIntegration() {
  const [searchQuery, setSearchQuery] = useState("");

  // tRPC Queries – echte Daten statt Mock
  const { data: syncStatus, isLoading: syncLoading, refetch: refetchSync } = trpc.hubspot.getSyncStatus.useQuery();
  const { data: contacts, isLoading: contactsLoading } = trpc.hubspot.getContacts.useQuery({ limit: 50 });
  const { data: companies, isLoading: companiesLoading } = trpc.hubspot.getCompanies.useQuery({ limit: 50 });
  const { data: deals, isLoading: dealsLoading } = trpc.hubspot.getDeals.useQuery({ limit: 50 });
  const { data: accountInfo, isLoading: accountLoading } = trpc.hubspot.getAccountInfo.useQuery();

  // Mutations
  const manualSyncMutation = trpc.hubspot.triggerManualSync.useMutation({
    onSuccess: (result) => {
      refetchSync();
      if (result.success) {
        toast.success("Synchronisation abgeschlossen", {
          description: `${result.companiesImported} Unternehmen, ${result.contactsImported} Kontakte synchronisiert.`,
        });
      } else {
        toast.error("Synchronisation fehlgeschlagen", {
          description: result.errors.join(", "),
        });
      }
    },
    onError: (error) => {
      toast.error("Sync-Fehler", { description: error.message });
    },
  });

  const toggleAutoSyncMutation = trpc.hubspot.toggleAutoSync.useMutation({
    onSuccess: (result) => {
      refetchSync();
      toast.success(result.active ? "Auto-Sync aktiviert" : "Auto-Sync deaktiviert", {
        description: result.active
          ? "Daten werden alle 15 Minuten automatisch synchronisiert."
          : "Automatische Synchronisation wurde gestoppt.",
      });
    },
  });

  const isAutoSyncActive = syncStatus?.autoSync?.active ?? false;

  // Filtered contacts
  const filteredContacts = (contacts || []).filter(
    (c: any) =>
      !searchQuery ||
      `${c.firstName || ""} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${HUBSPOT_ORANGE}15` }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill={HUBSPOT_ORANGE}>
                <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984v-.066A2.198 2.198 0 0017.233.836h-.066a2.198 2.198 0 00-2.198 2.198v.066c0 .907.55 1.685 1.334 2.02v2.81a5.166 5.166 0 00-2.59 1.32l-6.86-5.337a2.587 2.587 0 00.085-.634 2.607 2.607 0 10-2.607 2.607c.39 0 .757-.09 1.086-.247l6.75 5.252a5.193 5.193 0 00-.246 1.59c0 .584.097 1.145.274 1.67l-2.14 1.24a2.093 2.093 0 00-1.19-.373 2.108 2.108 0 102.108 2.108c0-.475-.16-.912-.427-1.264l2.063-1.196a5.207 5.207 0 003.698 1.538 5.208 5.208 0 005.208-5.208 5.208 5.208 0 00-4.327-5.13z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">HubSpot Integration</h1>
              <p className="text-muted-foreground mt-1">
                {accountLoading ? "Lade..." : accountInfo?.hubId ? `Portal: ${accountInfo.hubId}` : "CRM-Synchronisation und Datenaustausch"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SyncStatusBadge status={manualSyncMutation.isPending ? "syncing" : syncStatus?.errors?.length ? "error" : "synced"} />
            <Button
              variant="outline"
              onClick={() => manualSyncMutation.mutate()}
              disabled={manualSyncMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", manualSyncMutation.isPending && "animate-spin")} />
              Jetzt synchronisieren
            </Button>
          </div>
        </div>

        {/* Sync Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {syncLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{syncStatus?.contactsTotal ?? 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Kontakte</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100">
                  <Euro className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {syncLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{syncStatus?.dealsTotal ?? 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  {syncLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{syncStatus?.companiesTotal ?? 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Unternehmen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Auto-Sync</p>
                    <p className="text-xs text-muted-foreground">
                      {isAutoSyncActive ? "Alle 15 Min." : "Deaktiviert"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isAutoSyncActive}
                  onCheckedChange={(checked) => toggleAutoSyncMutation.mutate({ enabled: checked })}
                  disabled={toggleAutoSyncMutation.isPending}
                />
              </div>
              {syncStatus?.autoSync?.lastResult && (
                <p className="text-xs text-muted-foreground mt-2">
                  Letzter Auto-Sync: {new Date(syncStatus.autoSync.lastResult.timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="kontakte" className="animate-fade-in-up animate-delay-200">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="kontakte" className="rounded-xl gap-1">
              <Users className="w-4 h-4" /> Kontakte
            </TabsTrigger>
            <TabsTrigger value="unternehmen" className="rounded-xl gap-1">
              <Building2 className="w-4 h-4" /> Unternehmen
            </TabsTrigger>
            <TabsTrigger value="deals" className="rounded-xl gap-1">
              <Euro className="w-4 h-4" /> Deals
            </TabsTrigger>
            <TabsTrigger value="sync-log" className="rounded-xl gap-1">
              <Activity className="w-4 h-4" /> Sync-Protokoll
            </TabsTrigger>
          </TabsList>

          {/* Kontakte Tab */}
          <TabsContent value="kontakte" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">HubSpot Kontakte</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Kontakte suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !filteredContacts.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Keine Kontakte gefunden</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredContacts.map((contact: any) => (
                        <div
                          key={contact.hubspotId}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {(contact.firstName?.[0] || "").toUpperCase()}
                                {(contact.lastName?.[0] || "").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {contact.firstName || ""} {contact.lastName}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {contact.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {contact.email}
                                  </span>
                                )}
                                {contact.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {contact.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ID: {contact.hubspotId}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unternehmen Tab */}
          <TabsContent value="unternehmen" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base">HubSpot Unternehmen</CardTitle>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !(companies || []).length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Keine Unternehmen gefunden</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {(companies || []).map((company: any) => (
                        <div
                          key={company.hubspotId}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                              <Building2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{company.name}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {company.city && <span>{company.city}</span>}
                                {company.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {company.phone}
                                  </span>
                                )}
                                {company.website && (
                                  <a href={company.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline">
                                    <ExternalLink className="w-3 h-3" /> Website
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ID: {company.hubspotId}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  HubSpot Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !(deals || []).length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Euro className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Keine Deals gefunden</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {(deals || []).map((deal: any) => (
                        <div
                          key={deal.hubspotId}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">{deal.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              {deal.stage && (
                                <Badge variant="secondary" className="text-xs">
                                  {deal.stage}
                                </Badge>
                              )}
                              {deal.closeDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(deal.closeDate).toLocaleDateString("de-DE")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {deal.amount != null && (
                              <p className="font-bold text-sm">
                                {deal.amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs">
                              ID: {deal.hubspotId}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync-Protokoll Tab */}
          <TabsContent value="sync-log" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Sync-Protokoll
                </CardTitle>
                <CardDescription>
                  Übersicht der letzten Synchronisationen und deren Ergebnisse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Auto-Sync Status */}
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Power className={cn("w-4 h-4", isAutoSyncActive ? "text-green-600" : "text-muted-foreground")} />
                        <span className="font-medium text-sm">Auto-Sync Status</span>
                      </div>
                      <Badge variant={isAutoSyncActive ? "default" : "secondary"}>
                        {isAutoSyncActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Intervall:</span>
                        <span className="ml-2 font-medium">15 Minuten</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Letzter Sync:</span>
                        <span className="ml-2 font-medium">
                          {syncStatus?.autoSync?.lastResult
                            ? new Date(syncStatus.autoSync.lastResult.timestamp).toLocaleString("de-DE")
                            : "Noch kein Auto-Sync"}
                        </span>
                      </div>
                    </div>
                    {syncStatus?.autoSync?.lastResult && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Ergebnis:</span>
                        <span className={cn("ml-2 font-medium", syncStatus.autoSync.lastResult.success ? "text-green-600" : "text-red-600")}>
                          {syncStatus.autoSync.lastResult.success
                            ? `${syncStatus.autoSync.lastResult.companiesImported} Unternehmen, ${syncStatus.autoSync.lastResult.contactsImported} Kontakte`
                            : syncStatus.autoSync.lastResult.errors.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sync-Fehler */}
                  {syncStatus?.errors && syncStatus.errors.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-sm text-red-800">Sync-Fehler</span>
                      </div>
                      {syncStatus.errors.map((error: string, i: number) => (
                        <p key={i} className="text-sm text-red-700">{error}</p>
                      ))}
                    </div>
                  )}

                  {/* Keine Fehler */}
                  {(!syncStatus?.errors || syncStatus.errors.length === 0) && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm text-green-800">
                          Verbindung zu HubSpot aktiv – keine Fehler
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
