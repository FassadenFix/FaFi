/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Ressourcenplanung Page - Kalenderansicht für Team & Geräte
 * 
 * RS-01 bis RS-04: Mock-Teammitglieder durch echte HR-DB-Daten ersetzt
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  HardHat,
  Truck,
  Construction,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PageSkeleton, ResourceListSkeleton } from "@/components/PageSkeletons";
import {
  useLibraryEquipment,
  useLibraryCleaningAgents,
  useLibraryVehicles,
} from "@/hooks/useLibrary";

// RS-03: Farben für Mitarbeiter dynamisch vergeben
const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
  "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500",
  "bg-sky-500", "bg-lime-500", "bg-fuchsia-500", "bg-red-500",
];

// RS-03: Initialen aus Vor- und Nachname generieren
function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

// RS-03: Rolle aus Position ableiten
function mapPosition(position: string): string {
  const pos = (position || "").toLowerCase();
  if (pos.includes("geschäftsführ")) return "GF";
  if (pos.includes("abteilungsleiter")) return "Abt.-Leiter";
  if (pos.includes("standortleiter")) return "Standortleiter";
  if (pos.includes("kundenberater")) return "Vertrieb";
  if (pos.includes("anwendungstechniker")) return "AT";
  if (pos.includes("dualer student")) return "Student";
  if (pos.includes("hilfskraft")) return "Hilfskraft";
  if (pos.includes("it-system")) return "IT";
  if (pos.includes("administration")) return "Admin";
  return position || "Mitarbeiter";
}

// Equipment, Fahrzeuge und Reinigungsmittel kommen aus der Bibliothek

// RS-02: Keine Mock-Bookings mehr – leere Buchungen bis echte Buchungslogik existiert
const buehnenBookings: Record<string, { project: string; color: string; days: number[] }[]> = {};
const waschbusBookings: Record<string, { project: string; color: string; days: number[] }[]> = {};
const mietbuehnenBookings: Record<string, { project: string; color: string; days: number[] }[]> = {};

// Generate week days
function getWeekDays(offset: number = 0) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      date,
      dayName: date.toLocaleDateString("de-DE", { weekday: "short" }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      isWeekend: i >= 5,
    });
  }
  return days;
}

function getWeekLabel(offset: number) {
  const days = getWeekDays(offset);
  const start = days[0].date;
  const end = days[6].date;
  return `${start.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`;
}

export default function Ressourcen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<"week" | "month">("week");
  const weekDays = getWeekDays(weekOffset);

  // Bibliothek-Daten laden
  const { buehnenOptionen } = useLibraryEquipment();
  const { reinigungsmittelOptionen } = useLibraryCleaningAgents();
  const { waschbusse: libWaschbusse, alleFahrzeuge } = useLibraryVehicles();

  // Bibliothek-Daten auf Ressourcen-Format mappen
  const ffBuehnen = buehnenOptionen.map((b, i) => ({
    id: String(i + 1),
    name: b.name,
    type: b.beschreibung || "Bühne",
    status: "verfügbar" as string,
  }));
  const waschbusse = libWaschbusse.length > 0 ? libWaschbusse : [
    { id: "1", name: "L-FF 101", type: "Mercedes Sprinter 3.500L", status: "verfügbar" },
    { id: "2", name: "L-FF 102", type: "Mercedes Sprinter 3.500L", status: "gebucht" },
  ];
  const mietbuehnen = alleFahrzeuge
    .filter(f => f.type === "mietbuehne")
    .map((f, i) => ({
      id: String(i + 1),
      name: f.name,
      type: f.manufacturer ? `${f.manufacturer} ${f.model || ""}`.trim() : "Mietbühne",
      status: f.status === "aktiv" ? "verfügbar" : f.status || "verfügbar",
    }));
  const reinigungsmittel = reinigungsmittelOptionen.map((r, i) => ({
    id: String(i + 1),
    name: r.name,
    bestand: 100, // Platzhalter - später aus Lagerverwaltung
    einheit: "L",
    mindest: 50,
    status: "ok" as string,
  }));

  // RS-01: Echte Mitarbeiter aus HR-DB laden
  const { data: dbEmployees, isLoading: l1 } = trpc.hr.employees.list.useQuery({ status: "active" });
  const { data: equipmentData, isLoading: l2 } = trpc.resource.equipmentUsage.useQuery();
  const isLoading = l1 || l2;

  // RS-01/03: DB-Mitarbeiter in lokales Format konvertieren
  const teamMembers = useMemo(() => {
    if (!dbEmployees) return [];
    return dbEmployees.map((emp: any, index: number) => ({
      id: String(emp.id),
      name: `${emp.firstName} ${emp.lastName}`,
      role: mapPosition(emp.position),
      initials: getInitials(emp.firstName, emp.lastName),
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    }));
  }, [dbEmployees]);

  const handleBooking = () => {
    toast.info("Buchung erstellen", {
      description: "Bitte verwenden Sie die Einsatzplanung für Buchungen.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton>
          <ResourceListSkeleton />
        </PageSkeleton>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* RS-04: Kein DemoBanner mehr – Mitarbeiter kommen aus der echten HR-DB */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Materialien & Geräte</h1>
            <p className="text-muted-foreground">
              Verfügbarkeit & Planung – {teamMembers.length} Mitarbeiter · {ffBuehnen.length + mietbuehnen.length} Bühnen · {waschbusse.length} Waschbusse
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={(v) => setView(v as "week" | "month")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Woche</SelectItem>
                <SelectItem value="month">Monat</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleBooking} className="gap-2 ff-button">
              <Plus className="w-4 h-4" />
              Neue Buchung
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <Card className="ff-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((prev) => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWeekOffset(0)}
                  className={cn(weekOffset === 0 && "bg-primary/10 text-primary")}
                >
                  Heute
                </Button>
                <h2 className="text-lg font-semibold">{getWeekLabel(weekOffset)}</h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((prev) => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for all resource categories */}
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Mitarbeiter ({teamMembers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="waschbusse" className="gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Waschbusse</span>
            </TabsTrigger>
            <TabsTrigger value="ffbuehnen" className="gap-2">
              <Construction className="w-4 h-4" />
              <span className="hidden sm:inline">FF Bühnen</span>
            </TabsTrigger>
            <TabsTrigger value="mietbuehnen" className="gap-2">
              <HardHat className="w-4 h-4" />
              <span className="hidden sm:inline">Mietbühnen</span>
            </TabsTrigger>
            <TabsTrigger value="reinigungsmittel" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Reinigungsmittel</span>
            </TabsTrigger>
          </TabsList>

          {/* Team Calendar */}
          <TabsContent value="team">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Mitarbeiter-Kalender
                  <Badge variant="secondary">{teamMembers.length} aktiv</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-3 font-medium text-muted-foreground">
                        Mitarbeiter
                      </div>
                      {weekDays.map((day, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 text-center border-l",
                            day.isToday && "bg-primary/10",
                            day.isWeekend && "bg-muted/50"
                          )}
                        >
                          <div className="text-xs text-muted-foreground">
                            {day.dayName}
                          </div>
                          <div
                            className={cn(
                              "text-lg font-semibold",
                              day.isToday && "text-primary"
                            )}
                          >
                            {day.dayNumber}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Team Rows – RS-01: Echte Mitarbeiter aus DB */}
                    {teamMembers.map((member) => {
                      // RS-02: Keine Mock-Bookings mehr – Zellen bleiben leer bis echte Buchungslogik existiert
                      return (
                        <div
                          key={member.id}
                          className="grid grid-cols-8 border-b hover:bg-muted/30 transition-colors"
                        >
                          <div className="p-3 flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={member.color}>
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{member.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.role}
                              </div>
                            </div>
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            return (
                              <div
                                key={dayIndex}
                                className={cn(
                                  "p-1 border-l min-h-[60px] flex items-center justify-center",
                                  day.isToday && "bg-primary/5",
                                  day.isWeekend && "bg-muted/30"
                                )}
                              >
                                {/* Buchungen werden hier angezeigt, sobald echte Buchungslogik implementiert ist */}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    {teamMembers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        Keine aktiven Mitarbeiter gefunden
                      </div>
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waschbusse Calendar */}
          <TabsContent value="waschbusse">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Waschbusse-Kalender
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-3 font-medium text-muted-foreground">Fahrzeug</div>
                      {weekDays.map((day, i) => (
                        <div key={i} className={cn("p-3 text-center border-l", day.isToday && "bg-primary/10", day.isWeekend && "bg-muted/50")}>
                          <div className="text-xs text-muted-foreground">{day.dayName}</div>
                          <div className={cn("text-lg font-semibold", day.isToday && "text-primary")}>{day.dayNumber}</div>
                        </div>
                      ))}
                    </div>
                    {waschbusse.map((item) => {
                      const bookings = waschbusBookings[item.id] || [];
                      return (
                        <div key={item.id} className="grid grid-cols-8 border-b hover:bg-muted/30 transition-colors">
                          <div className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Truck className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.type}</div>
                            </div>
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            const booking = bookings.find((b: { days: number[] }) => b.days.includes(dayIndex + 1));
                            return (
                              <div key={dayIndex} className={cn("p-1 border-l min-h-[60px] flex items-center justify-center", day.isToday && "bg-primary/5", day.isWeekend && "bg-muted/30")}>
                                {booking && <div className={cn("text-xs text-white px-2 py-1 rounded-md w-full text-center truncate", booking.color)}>{booking.project}</div>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FF Bühnen Calendar */}
          <TabsContent value="ffbuehnen">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Construction className="w-5 h-5 text-primary" />
                  FF Bühnen (Eigen/Dauermiete)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-3 font-medium text-muted-foreground">Bühne</div>
                      {weekDays.map((day, i) => (
                        <div key={i} className={cn("p-3 text-center border-l", day.isToday && "bg-primary/10", day.isWeekend && "bg-muted/50")}>
                          <div className="text-xs text-muted-foreground">{day.dayName}</div>
                          <div className={cn("text-lg font-semibold", day.isToday && "text-primary")}>{day.dayNumber}</div>
                        </div>
                      ))}
                    </div>
                    {ffBuehnen.map((item) => {
                      const bookings = buehnenBookings[item.id] || [];
                      return (
                        <div key={item.id} className="grid grid-cols-8 border-b hover:bg-muted/30 transition-colors">
                          <div className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Construction className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.type}</div>
                            </div>
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            const booking = bookings.find((b: { days: number[] }) => b.days.includes(dayIndex + 1));
                            return (
                              <div key={dayIndex} className={cn("p-1 border-l min-h-[60px] flex items-center justify-center", day.isToday && "bg-primary/5", day.isWeekend && "bg-muted/30")}>
                                {booking && <div className={cn("text-xs text-white px-2 py-1 rounded-md w-full text-center truncate", booking.color)}>{booking.project}</div>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mietbühnen Calendar */}
          <TabsContent value="mietbuehnen">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-primary" />
                  Mietbühnen (Externe)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-3 font-medium text-muted-foreground">Mietbühne</div>
                      {weekDays.map((day, i) => (
                        <div key={i} className={cn("p-3 text-center border-l", day.isToday && "bg-primary/10", day.isWeekend && "bg-muted/50")}>
                          <div className="text-xs text-muted-foreground">{day.dayName}</div>
                          <div className={cn("text-lg font-semibold", day.isToday && "text-primary")}>{day.dayNumber}</div>
                        </div>
                      ))}
                    </div>
                    {mietbuehnen.map((item) => {
                      const bookings = mietbuehnenBookings[item.id] || [];
                      return (
                        <div key={item.id} className="grid grid-cols-8 border-b hover:bg-muted/30 transition-colors">
                          <div className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <HardHat className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.type}</div>
                            </div>
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            const booking = bookings.find((b: { days: number[] }) => b.days.includes(dayIndex + 1));
                            return (
                              <div key={dayIndex} className={cn("p-1 border-l min-h-[60px] flex items-center justify-center", day.isToday && "bg-primary/5", day.isWeekend && "bg-muted/30")}>
                                {booking && <div className={cn("text-xs text-white px-2 py-1 rounded-md w-full text-center truncate", booking.color)}>{booking.project}</div>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reinigungsmittel Lagerbestand */}
          <TabsContent value="reinigungsmittel">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Reinigungsmittel-Lagerbestand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reinigungsmittel.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">Mindestbestand: {item.mindest} {item.einheit}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">{item.bestand} {item.einheit}</div>
                          <div className="text-sm text-muted-foreground">Aktueller Bestand</div>
                        </div>
                        {item.status === "ok" ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-amber-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legend – dynamisch basierend auf echten Daten */}
        <Card className="ff-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Info:</span>
              <span className="text-sm text-muted-foreground">
                Buchungen werden angezeigt, sobald Mitarbeiter über die Einsatzplanung Projekten zugeordnet werden.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
