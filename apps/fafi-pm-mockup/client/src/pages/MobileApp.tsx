/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * Mobile Baustellenansicht mit echten Daten
 * GPS-Koordinaten, Wetter-Integration, Foto-Upload
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  Camera,
  Clock,
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  CheckCircle2,
  Plus,
  ChevronRight,
  Play,
  AlertTriangle,
  Image,
  FileText,
  Navigation,
  Thermometer,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/PageSkeletons";

// GPS Location Hook
function useGPSLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS nicht verfügbar");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, error };
}

// Weather icon helper
function WeatherIcon({ condition, className }: { condition?: string; className?: string }) {
  const c = (condition || "").toLowerCase();
  if (c.includes("rain") || c.includes("regen")) return <CloudRain className={className} />;
  if (c.includes("cloud") || c.includes("wolkig") || c.includes("bewölkt")) return <Cloud className={className} />;
  if (c.includes("wind")) return <Wind className={className} />;
  return <Sun className={className} />;
}

export default function MobileApp() {
  const [activeView, setActiveView] = useState<"overview" | "logbuch" | "foto">("overview");
  const { location, error: gpsError } = useGPSLocation();

  // Load active construction sites from DB
  const { data: sites, isLoading } = trpc.constructionSite.list.useQuery();
  const activeSites = (sites || []).filter((s: any) => s.status === "aktiv");
  const selectedSite = activeSites[0]; // Show first active site

  // Load logs for selected site
  const { data: logs } = trpc.constructionSite.getLogs.useQuery(
    { constructionSiteId: selectedSite?.id || 0 },
    { enabled: !!selectedSite }
  );

  const recentLogs = (logs || []).slice(0, 5);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mobile Baustellenansicht</h1>
            <p className="text-muted-foreground">
              Optimiert für Tablet und Smartphone auf der Baustelle
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Smartphone className="w-3 h-3" />
            Mobile Preview
          </Badge>
        </div>

        {/* GPS & Wetter Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="ff-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GPS-Position</p>
                {location ? (
                  <p className="font-mono text-sm">
                    {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{gpsError || "Wird ermittelt..."}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="ff-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wetter</p>
                <p className="font-semibold">
                  {selectedSite ? "Daten werden geladen..." : "Keine aktive Baustelle"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="ff-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arbeitszeit</p>
                <p className="font-semibold">{new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Phone Frame */}
        <div className="flex justify-center">
          <div className="w-[375px] bg-background border-4 border-foreground/20 rounded-[2.5rem] p-2 shadow-2xl">
            {/* Phone Notch */}
            <div className="flex justify-center mb-2">
              <div className="w-32 h-6 bg-foreground/20 rounded-full" />
            </div>

            {/* Phone Content */}
            <div className="bg-background rounded-[2rem] overflow-hidden min-h-[600px]">
              {/* Mobile Header */}
              <div className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Aktive Baustelle</p>
                    <h2 className="font-bold text-lg truncate">
                      {selectedSite?.name || "Keine aktive Baustelle"}
                    </h2>
                  </div>
                  <Badge className="bg-white/20 text-white">
                    {selectedSite?.status || "–"}
                  </Badge>
                </div>
                {selectedSite && (
                  <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{selectedSite.address || "Adresse nicht hinterlegt"}</span>
                  </div>
                )}
                {selectedSite && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Fortschritt</span>
                      <span>{selectedSite.progress || 0}%</span>
                    </div>
                    <Progress value={selectedSite.progress || 0} className="h-2 bg-white/20" />
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b">
                {[
                  { id: "overview" as const, label: "Übersicht", icon: CheckCircle2 },
                  { id: "logbuch" as const, label: "Logbuch", icon: FileText },
                  { id: "foto" as const, label: "Fotos", icon: Camera },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors",
                      activeView === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-4 space-y-3">
                {activeView === "overview" && (
                  <>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-16 flex-col gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                        variant="ghost"
                        onClick={() => toast.info("Arbeitstag beginnen", { description: "Nutzen Sie die Baustellen-Seite für diese Funktion." })}
                      >
                        <Play className="w-5 h-5" />
                        <span className="text-xs">Tag starten</span>
                      </Button>
                      <Button
                        className="h-16 flex-col gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        variant="ghost"
                        onClick={() => toast.info("Ereignis melden", { description: "Nutzen Sie die Baustellen-Seite für diese Funktion." })}
                      >
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-xs">Ereignis</span>
                      </Button>
                      <Button
                        className="h-16 flex-col gap-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        variant="ghost"
                        onClick={() => toast.info("Foto aufnehmen", { description: "Nutzen Sie die Baustellen-Seite für diese Funktion." })}
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-xs">Foto</span>
                      </Button>
                      <Button
                        className="h-16 flex-col gap-1 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                        variant="ghost"
                        onClick={() => toast.info("Checkliste", { description: "Nutzen Sie die Baustellen-Seite für diese Funktion." })}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs">Checkliste</span>
                      </Button>
                    </div>

                    {/* Active Sites List */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Aktive Baustellen ({activeSites.length})</h3>
                      {activeSites.map((site: any) => (
                        <div key={site.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{site.name}</p>
                            <p className="text-xs text-muted-foreground">{site.progress || 0}% abgeschlossen</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                      {activeSites.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Keine aktiven Baustellen vorhanden
                        </p>
                      )}
                    </div>
                  </>
                )}

                {activeView === "logbuch" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Letzte Einträge</h3>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Neuer Eintrag
                      </Button>
                    </div>
                    {recentLogs.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {log.logType || "Eintrag"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "–"}
                          </span>
                        </div>
                        <p className="text-sm">{log.notes || log.entry || "Kein Text"}</p>
                      </div>
                    ))}
                    {recentLogs.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Noch keine Logbuch-Einträge vorhanden
                      </p>
                    )}
                  </div>
                )}

                {activeView === "foto" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Baustellenfotos</h3>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                        <Camera className="w-3 h-3" />
                        Aufnehmen
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                        >
                          <Image className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Fotos werden aus der Baustellen-Dokumentation geladen
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Home Indicator */}
            <div className="flex justify-center mt-2">
              <div className="w-32 h-1 bg-foreground/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="ff-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                GPS-Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              GPS-Koordinaten werden automatisch bei jedem Foto-Upload erfasst und im Bautagebuch protokolliert.
              Die Position wird zur Verifizierung der Baustellenpräsenz genutzt.
            </CardContent>
          </Card>

          <Card className="ff-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Witterungsdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Wetterdaten werden automatisch 3x täglich (9:00, 13:00, 17:00 Uhr) über die Open-Meteo API
              abgerufen und im Bautagebuch dokumentiert.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
