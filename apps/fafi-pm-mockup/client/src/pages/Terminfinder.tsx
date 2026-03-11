/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Terminfinder-Seite mit echter Datenbank-Anbindung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarSearch,
  Plus,
  Clock,
  Users,
  MapPin,
  HardHat,
  Video,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { de } from "date-fns/locale";

// Appointment type configuration
const appointmentTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  besichtigung: { label: "Besichtigung", color: "bg-blue-100 text-blue-700", icon: MapPin },
  kundenbesprechung: { label: "Kundenbesprechung", color: "bg-green-100 text-green-700", icon: Users },
  baustellenbegehung: { label: "Baustellenbegehung", color: "bg-amber-100 text-amber-700", icon: HardHat },
  videokonferenz: { label: "Videokonferenz", color: "bg-purple-100 text-purple-700", icon: Video },
  telefonat: { label: "Telefonat", color: "bg-gray-100 text-gray-700", icon: Phone },
  intern: { label: "Intern", color: "bg-slate-100 text-slate-700", icon: Building2 },
};

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700" },
  bestaetigt: { label: "Bestätigt", color: "bg-green-100 text-green-700" },
  abgesagt: { label: "Abgesagt", color: "bg-red-100 text-red-700" },
  verschoben: { label: "Verschoben", color: "bg-amber-100 text-amber-700" },
  durchgefuehrt: { label: "Durchgeführt", color: "bg-gray-100 text-gray-700" },
};

export default function Terminfinder() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [typeFilter, setTypeFilter] = useState<string>("alle");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch appointments from database
  const { data: appointments, isLoading, refetch } = trpc.appointment.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter appointments by selected date and type
  const filteredAppointments = appointments?.filter((apt) => {
    const aptDate = apt.confirmedDate ? new Date(apt.confirmedDate) : null;
    const matchesDate = selectedDate && aptDate
      ? aptDate.toDateString() === selectedDate.toDateString()
      : true;
    const matchesType = typeFilter === "alle" || apt.appointmentType === typeFilter;
    return matchesDate && matchesType;
  }) || [];

  // Get appointments for calendar highlighting
  const appointmentDates = appointments?.filter(apt => apt.confirmedDate).map(apt => new Date(apt.confirmedDate!).toDateString()) || [];

  // Stats
  const todayAppointments = appointments?.filter(apt => 
    apt.confirmedDate && new Date(apt.confirmedDate).toDateString() === new Date().toDateString()
  ).length || 0;
  
  const weekAppointments = appointments?.filter(apt => {
    if (!apt.confirmedDate) return false;
    const aptDate = new Date(apt.confirmedDate);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() + 6));
    return aptDate >= weekStart && aptDate <= weekEnd;
  }).length || 0;

  const confirmedAppointments = appointments?.filter(apt => apt.status === "bestaetigt").length || 0;

  // Get company name by ID
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  // Format time
  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", { 
      weekday: "short", 
      day: "2-digit", 
      month: "2-digit" 
    });
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  // Quick booking options
  const quickBookOptions = [
    { type: "besichtigung", label: "Besichtigungstermin", icon: MapPin },
    { type: "kundenbesprechung", label: "Kundenbesprechung", icon: Users },
    { type: "baustellenbegehung", label: "Baustellenbegehung", icon: HardHat },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarSearch className="w-7 h-7 text-primary" />
              Terminfinder
            </h1>
            <p className="text-muted-foreground mt-1">
              Finde freie Zeitfenster für Besichtigungen und Besprechungen
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Neuer Termin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{todayAppointments}</p>}
                  <p className="text-xs text-muted-foreground">Heute</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{weekAppointments}</p>}
                  <p className="text-xs text-muted-foreground">Diese Woche</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{confirmedAppointments}</p>}
                  <p className="text-xs text-muted-foreground">Bestätigt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CalendarSearch className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{appointments?.length || 0}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="ff-card animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Kalender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={de}
                className="rounded-md border"
                modifiers={{
                  hasAppointment: (date) => appointmentDates.includes(date.toDateString())
                }}
                modifiersStyles={{
                  hasAppointment: { backgroundColor: "oklch(0.85 0.15 142)", fontWeight: "bold" }
                }}
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="ff-card md:col-span-2 animate-fade-in-up animate-delay-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Termine {selectedDate && `am ${formatDate(selectedDate)}`}
                </CardTitle>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Typ filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Typen</SelectItem>
                    {Object.entries(appointmentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Keine Termine</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate 
                      ? "An diesem Tag sind keine Termine geplant."
                      : "Wähle ein Datum im Kalender."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((apt) => {
                    const typeConfig = appointmentTypeConfig[apt.appointmentType || "intern"];
                    const TypeIcon = typeConfig?.icon || CalendarIcon;
                    const status = statusConfig[apt.status || "geplant"];
                    
                    return (
                      <div
                        key={apt.id}
                        className="p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleViewDetails(apt)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", typeConfig?.color)}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{apt.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {apt.confirmedStartTime || "--:--"} - {apt.confirmedEndTime || "--:--"}
                              </p>
                              {apt.companyId && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  {getCompanyName(apt.companyId)}
                                </p>
                              )}
                              {apt.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {apt.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Booking */}
        <Card className="ff-card animate-fade-in-up animate-delay-400">
          <CardHeader>
            <CardTitle className="text-lg">Schnellbuchung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {quickBookOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="h-auto py-4 justify-start gap-3"
                  onClick={() => {
                    setIsCreateOpen(true);
                    toast.info(`${option.label} - Formular wird geöffnet`);
                  }}
                >
                  <option.icon className="w-5 h-5 text-primary" />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Termindetails
              </DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAppointment.title}</h3>
                  <Badge className={appointmentTypeConfig[selectedAppointment.appointmentType]?.color}>
                    {appointmentTypeConfig[selectedAppointment.appointmentType]?.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" /> Datum
                    </p>
                    <p className="font-medium">{formatDate(selectedAppointment.confirmedDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Uhrzeit
                    </p>
                    <p className="font-medium">
                      {selectedAppointment.confirmedStartTime || "--:--"} - {selectedAppointment.confirmedEndTime || "--:--"}
                    </p>
                  </div>
                  {selectedAppointment.location && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Ort
                      </p>
                      <p className="font-medium">{selectedAppointment.location}</p>
                    </div>
                  )}
                  {selectedAppointment.companyId && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> Kunde
                      </p>
                      <p className="font-medium">{getCompanyName(selectedAppointment.companyId)}</p>
                    </div>
                  )}
                </div>
                {selectedAppointment.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                Bearbeiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Neuen Termin erstellen
              </DialogTitle>
              <DialogDescription>
                Erstelle einen neuen Termin für Besichtigungen, Besprechungen oder Baustellenbegehungen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-center text-muted-foreground">
                Die Terminerfassung wird in der nächsten Version implementiert.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={() => {
                toast.info("Termin erstellen - Funktion in Entwicklung");
                setIsCreateOpen(false);
              }}>
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
