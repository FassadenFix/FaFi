/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Einsatzplanung: Zug/Gruppe-Zuordnung mit Drag-and-Drop
 * 
 * EP-01 bis EP-05: Mock-Mitarbeiter durch echte HR-DB-Daten ersetzt
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  Calendar,
  GripVertical,
  ChevronRight,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { trpc } from "@/lib/trpc";
import { PageSkeleton, CalendarSkeleton, ResourceListSkeleton } from "@/components/PageSkeletons";

// Zug/Gruppe Types (Bundeswehr-Terminologie)
interface Mitarbeiter {
  id: string;
  name: string;
  rolle: string;
  initialen: string;
  verfuegbar: boolean;
  abteilung: string;
}

interface Zug {
  id: string;
  name: string;
  farbe: string;
  leiter: string;
  mitglieder: Mitarbeiter[];
  aktiveProjekte: number;
}

interface Projekt {
  id: string;
  name: string;
  kunde: string;
  zugeordneterZug: string | null;
  startDatum: string;
  status: string;
}

// Hilfsfunktion: Initialen aus Vor- und Nachname generieren
function getInitialen(firstName: string, lastName: string): string {
  return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

// Hilfsfunktion: Rolle aus Position ableiten
function mapPosition(position: string): string {
  const pos = (position || "").toLowerCase();
  if (pos.includes("geschäftsführ")) return "Geschäftsführer";
  if (pos.includes("abteilungsleiter")) return "Abteilungsleiter";
  if (pos.includes("standortleiter")) return "Standortleiter";
  if (pos.includes("kundenberater")) return "Kundenberater";
  if (pos.includes("anwendungstechniker")) return "Anwendungstechniker";
  if (pos.includes("dualer student")) return "Dualer Student";
  if (pos.includes("hilfskraft")) return "Hilfskraft";
  if (pos.includes("it-system")) return "IT-Administrator";
  if (pos.includes("administration")) return "Administration";
  return position || "Mitarbeiter";
}

// Hilfsfunktion: DB-Mitarbeiter in lokales Format konvertieren
function mapEmployeeToMitarbeiter(emp: any): Mitarbeiter {
  return {
    id: `emp-${emp.id}`,
    name: `${emp.firstName} ${emp.lastName}`,
    rolle: mapPosition(emp.position),
    initialen: getInitialen(emp.firstName, emp.lastName),
    verfuegbar: emp.status === "active",
    abteilung: emp.department || "Unbekannt",
  };
}

// Mitarbeiter Card Component
function MitarbeiterCard({
  mitarbeiter,
  onDragStart,
  isDragging,
}: {
  mitarbeiter: Mitarbeiter;
  onDragStart?: () => void;
  isDragging?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex items-center gap-3 p-3 bg-background rounded-xl cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-95",
        !mitarbeiter.verfuegbar && "opacity-60"
      )}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {mitarbeiter.initialen}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            mitarbeiter.verfuegbar ? "bg-green-500" : "bg-red-500"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{mitarbeiter.name}</p>
        <p className="text-xs text-muted-foreground">{mitarbeiter.rolle}</p>
      </div>
      {!mitarbeiter.verfuegbar && (
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
          Abwesend
        </Badge>
      )}
    </div>
  );
}

// Zug Card Component
function ZugCard({
  zug,
  onDrop,
  onRemoveMitarbeiter,
  isDropTarget,
}: {
  zug: Zug;
  onDrop: (zugId: string) => void;
  onRemoveMitarbeiter: (zugId: string, mitarbeiterId: string) => void;
  isDropTarget: boolean;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(zug.id);
  };

  return (
    <Card
      className={cn(
        "ff-card transition-all",
        isDropTarget && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: zug.farbe }}
            />
            <div>
              <CardTitle className="text-base">{zug.name}</CardTitle>
              <CardDescription>Leiter: {zug.leiter}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {zug.mitglieder.length} Mitglieder
            </Badge>
            <Badge className="bg-primary/10 text-primary">
              {zug.aktiveProjekte} Projekte
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 min-h-[100px]">
          {zug.mitglieder.length === 0 ? (
            <div className="flex items-center justify-center h-[100px] border-2 border-dashed border-muted rounded-xl text-muted-foreground text-sm">
              Mitarbeiter hierher ziehen
            </div>
          ) : (
            zug.mitglieder.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg group"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {m.initialen}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.rolle}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                  onClick={() => onRemoveMitarbeiter(zug.id, m.id)}
                >
                  Entfernen
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Projekt Zuordnung Component
function ProjektZuordnung({
  projekte,
  zuege,
  onAssign,
}: {
  projekte: Projekt[];
  zuege: Zug[];
  onAssign: (projektId: string, zugId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {projekte.map((projekt) => {
        const zugeordneterZug = zuege.find((z) => z.id === projekt.zugeordneterZug);

        return (
          <div
            key={projekt.id}
            className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <p className="font-medium">{projekt.name}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    projekt.status === "aktiv" && "bg-green-100 text-green-700",
                    projekt.status === "geplant" && "bg-blue-100 text-blue-700",
                    projekt.status === "offen" && "bg-amber-100 text-amber-700"
                  )}
                >
                  {projekt.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{projekt.kunde}</p>
              {projekt.startDatum && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Start: {new Date(projekt.startDatum).toLocaleDateString("de-DE")}
                </div>
              )}
            </div>
            <div>
              {zugeordneterZug ? (
                <Badge
                  className="gap-1"
                  style={{ backgroundColor: zugeordneterZug.farbe }}
                >
                  <Shield className="w-3 h-3" />
                  {zugeordneterZug.name}
                </Badge>
              ) : (
                <select
                  className="px-3 py-2 rounded-lg border bg-background text-sm"
                  onChange={(e) => onAssign(projekt.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Zug zuordnen...
                  </option>
                  {zuege.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Einsatzkalender mit Monatsnavigation
function EinsatzKalenderTab({ zuege }: { zuege: Zug[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthName = currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  
  const aktiveZuege = zuege.filter(z => z.mitglieder.length > 0);
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => setCurrentMonth(new Date());
  
  return (
    <Card className="ff-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Einsatzkalender
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="min-w-[160px] font-medium" onClick={goToday}>
              {monthName}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {aktiveZuege.length} aktive Züge
          {zuege.length > aktiveZuege.length && (
            <span className="text-amber-600"> ({zuege.length - aktiveZuege.length} Züge ohne Mitglieder ausgeblendet)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startPadding }, (_, i) => (
            <div key={`pad-${i}`} className="min-h-[80px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const hasEvent = [3, 5, 10, 12, 15, 17, 20, 22, 25].includes(day);
            const zug = aktiveZuege.length > 0 ? aktiveZuege[day % aktiveZuege.length] : null;
            const isCurrentDay = new Date().getDate() === day && 
              new Date().getMonth() === currentMonth.getMonth() && 
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] p-2 rounded-xl border transition-colors",
                  isCurrentDay ? "border-primary bg-primary/10 ring-2 ring-primary/30" :
                  hasEvent && zug ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20"
                )}
              >
                <p className={cn("text-sm font-medium mb-1", isCurrentDay && "text-primary")}>{day}</p>
                {hasEvent && zug && (
                  <div
                    className="text-xs p-1 rounded text-white truncate"
                    style={{ backgroundColor: zug.farbe }}
                  >
                    {zug.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Einsatzplanung() {
  // EP-01: Echte Mitarbeiter aus HR-DB laden
  const { data: dbEmployees, isLoading: l1 } = trpc.hr.employees.list.useQuery({ status: "active" });
  const { data: dbProjects, isLoading: l2 } = trpc.project.list.useQuery();
  const isLoading = l1 || l2;

  // EP-02/03/04: DB-Mitarbeiter in lokales Format konvertieren
  const allMitarbeiter = useMemo<Mitarbeiter[]>(() => {
    if (!dbEmployees) return [];
    return dbEmployees.map(mapEmployeeToMitarbeiter);
  }, [dbEmployees]);

  // Züge mit leeren Mitgliedern initialisieren
  const [zuege, setZuege] = useState<Zug[]>([
    { id: "z1", name: "Zug Alpha", farbe: "#77bc1f", leiter: "Wird zugewiesen", mitglieder: [], aktiveProjekte: 0 },
    { id: "z2", name: "Zug Bravo", farbe: "#3b82f6", leiter: "Wird zugewiesen", mitglieder: [], aktiveProjekte: 0 },
    { id: "z3", name: "Zug Charlie", farbe: "#f59e0b", leiter: "Wird zugewiesen", mitglieder: [], aktiveProjekte: 0 },
  ]);

  // Projekte aus DB mappen
  const [projekte, setProjekte] = useState<Projekt[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (dbProjects && dbProjects.length > 0 && !initialized) {
      const mapped: Projekt[] = dbProjects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        kunde: p.companyName || 'Unbekannt',
        zugeordneterZug: null,
        startDatum: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
        status: ['DURCHFUEHRUNG', 'PLANUNG', 'VORBEREITUNG'].includes(p.phase) ? 'aktiv' : p.phase === 'ABGESCHLOSSEN' ? 'abgeschlossen' : 'offen',
      }));
      setProjekte(mapped);
      setInitialized(true);
    }
  }, [dbProjects, initialized]);

  const [draggedMitarbeiter, setDraggedMitarbeiter] = useState<Mitarbeiter | null>(null);
  const [dropTargetZug, setDropTargetZug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Nicht zugeordnete Mitarbeiter berechnen
  const assignedIds = zuege.flatMap((z) => z.mitglieder.map((m) => m.id));
  const unassignedMitarbeiter = allMitarbeiter.filter(
    (m) => !assignedIds.includes(m.id)
  );

  // Gefilterte Mitarbeiter für Suche
  const filteredUnassigned = useMemo(() => {
    if (!searchQuery) return unassignedMitarbeiter;
    const q = searchQuery.toLowerCase();
    return unassignedMitarbeiter.filter(
      (m) => m.name.toLowerCase().includes(q) || m.rolle.toLowerCase().includes(q) || m.abteilung.toLowerCase().includes(q)
    );
  }, [unassignedMitarbeiter, searchQuery]);

  const handleDragStart = (mitarbeiter: Mitarbeiter) => {
    setDraggedMitarbeiter(mitarbeiter);
  };

  const handleDrop = (zugId: string) => {
    if (!draggedMitarbeiter) return;

    setZuege((prev) =>
      prev.map((z) => {
        const filtered = z.mitglieder.filter((m) => m.id !== draggedMitarbeiter.id);
        if (z.id === zugId) {
          return { ...z, mitglieder: [...filtered, draggedMitarbeiter] };
        }
        return { ...z, mitglieder: filtered };
      })
    );

    toast.success(`${draggedMitarbeiter.name} zu ${zuege.find((z) => z.id === zugId)?.name} hinzugefügt`);
    setDraggedMitarbeiter(null);
    setDropTargetZug(null);
  };

  const handleRemoveMitarbeiter = (zugId: string, mitarbeiterId: string) => {
    setZuege((prev) =>
      prev.map((z) => {
        if (z.id === zugId) {
          return {
            ...z,
            mitglieder: z.mitglieder.filter((m) => m.id !== mitarbeiterId),
          };
        }
        return z;
      })
    );
    toast.info("Mitarbeiter aus Zug entfernt");
  };

  const handleAssignProjekt = (projektId: string, zugId: string) => {
    setProjekte((prev) =>
      prev.map((p) => {
        if (p.id === projektId) {
          return { ...p, zugeordneterZug: zugId };
        }
        return p;
      })
    );
    const zug = zuege.find((z) => z.id === zugId);
    const projekt = projekte.find((p) => p.id === projektId);
    toast.success(`${projekt?.name} wurde ${zug?.name} zugeordnet`);
  };

  const handleCreateZug = () => {
    toast.info("Neuen Zug erstellen", {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton>
          <ResourceListSkeleton />
          <CalendarSkeleton />
        </PageSkeleton>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* EP-05: Kein DemoBanner mehr – Mitarbeiter kommen aus der echten HR-DB */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Einsatzplanung
              <HelpTooltip content={HELP_TEXTS.zug.text} title={HELP_TEXTS.zug.title} helpTextKey="zug" />
            </h1>
            <p className="text-muted-foreground mt-1">
              {allMitarbeiter.length} Mitarbeiter verfügbar · Züge per Drag & Drop zusammenstellen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
            <Button onClick={handleCreateZug} className="gap-2 ff-button">
              <Plus className="w-4 h-4" />
              Neuer Zug
            </Button>
          </div>
        </div>

        <Tabs defaultValue="zuege" className="animate-fade-in-up animate-delay-100">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="zuege" className="rounded-xl">Züge & Mitarbeiter</TabsTrigger>
            <TabsTrigger value="projekte" className="rounded-xl">Projekt-Zuordnung</TabsTrigger>
            <TabsTrigger value="kalender" className="rounded-xl flex items-center gap-1">
              Einsatzkalender
            </TabsTrigger>
          </TabsList>

          {/* Züge & Mitarbeiter Tab */}
          <TabsContent value="zuege" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Unassigned Pool */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Verfügbare Mitarbeiter
                    <HelpTooltip content={HELP_TEXTS.verfuegbarkeit.text} title={HELP_TEXTS.verfuegbarkeit.title} helpTextKey="verfuegbarkeit" />
                  </CardTitle>
                  <CardDescription>
                    {unassignedMitarbeiter.length} nicht zugeordnet · {allMitarbeiter.length} gesamt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredUnassigned.map((m) => (
                        <MitarbeiterCard
                          key={m.id}
                          mitarbeiter={m}
                          onDragStart={() => handleDragStart(m)}
                          isDragging={draggedMitarbeiter?.id === m.id}
                        />
                      ))}
                      {filteredUnassigned.length === 0 && unassignedMitarbeiter.length > 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Keine Mitarbeiter gefunden für "{searchQuery}"
                        </div>
                      )}
                      {unassignedMitarbeiter.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                          Alle Mitarbeiter sind zugeordnet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Züge */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zuege.map((zug) => (
                  <ZugCard
                    key={zug.id}
                    zug={zug}
                    onDrop={handleDrop}
                    onRemoveMitarbeiter={handleRemoveMitarbeiter}
                    isDropTarget={dropTargetZug === zug.id}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projekt-Zuordnung Tab */}
          <TabsContent value="projekte" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Projekte zu Zügen zuordnen
                </CardTitle>
                <CardDescription>
                  {projekte.length} Projekte · {projekte.filter(p => p.zugeordneterZug).length} zugeordnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projekte.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Keine Projekte vorhanden</p>
                    <p className="text-sm mt-1">Erstellen Sie zuerst ein Projekt unter "Projekte"</p>
                  </div>
                ) : (
                  <ProjektZuordnung
                    projekte={projekte}
                    zuege={zuege}
                    onAssign={handleAssignProjekt}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kalender Tab */}
          <TabsContent value="kalender" className="mt-6">
            <EinsatzKalenderTab zuege={zuege} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
