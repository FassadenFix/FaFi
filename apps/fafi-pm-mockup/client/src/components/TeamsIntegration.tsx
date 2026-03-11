/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * MS Teams Integration: Teamchat und Kalender mit Zugangskontrolle
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Calendar,
  Send,
  Lock,
  Users,
  Video,
  Phone,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock data for team members with access control
interface TeamMember {
  id: string;
  name: string;
  rolle: string;
  zug: string; // Bundeswehr-Terminologie: Zug/Gruppe
  avatar: string;
  isOnline: boolean;
  hasAccess: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "meeting" | "deadline" | "milestone";
  attendees: string[];
}

// Nr.48: Teamstruktur: 4 Personen (TL+AT1 als Team 1, PL+AT2 als Team 2)
const mockTeamMembers: TeamMember[] = [
  // Team 1: Teamleiter + Ausführungstechniker 1
  { id: "1", name: "Thomas Schmidt", rolle: "Teamleiter (TL)", zug: "Team 1", avatar: "TS", isOnline: true, hasAccess: true },
  { id: "2", name: "Michael Braun", rolle: "AT 1", zug: "Team 1", avatar: "MB", isOnline: true, hasAccess: true },
  // Team 2: Projektleiter + Ausführungstechniker 2
  { id: "3", name: "Stefan Weber", rolle: "Projektleiter (PL)", zug: "Team 2", avatar: "SW", isOnline: true, hasAccess: true },
  { id: "4", name: "Andreas Koch", rolle: "AT 2", zug: "Team 2", avatar: "AK", isOnline: false, hasAccess: true },
];

// Mock chat messages
const mockMessages: ChatMessage[] = [
  { id: "1", senderId: "2", senderName: "Stefan Weber", message: "Guten Morgen Team! Heute starten wir mit der Nordseite.", timestamp: "08:15", isOwn: false },
  { id: "2", senderId: "3", senderName: "Thomas Schmidt", message: "Material ist vor Ort. Gerüst wird gerade aufgebaut.", timestamp: "08:22", isOwn: false },
  { id: "3", senderId: "1", senderName: "Max Müller", message: "Super, der Kunde hat eben angerufen und ist sehr zufrieden mit dem bisherigen Fortschritt.", timestamp: "08:45", isOwn: true },
  { id: "4", senderId: "4", senderName: "Michael Braun", message: "Wetter sieht gut aus für heute. Kein Regen bis 18 Uhr.", timestamp: "09:00", isOwn: false },
  { id: "5", senderId: "2", senderName: "Stefan Weber", message: "Perfekt! Dann können wir heute gut vorankommen. Mittagspause um 12:30 Uhr.", timestamp: "09:15", isOwn: false },
];

// Mock calendar events
const mockCalendarEvents: CalendarEvent[] = [
  { id: "1", title: "Tägliches Stand-up", date: "2026-02-03", time: "08:00", type: "meeting", attendees: ["Max Müller", "Stefan Weber", "Thomas Schmidt"] },
  { id: "2", title: "Baustellenbegehung mit Kunde", date: "2026-02-03", time: "14:00", type: "meeting", attendees: ["Max Müller", "Stefan Weber"] },
  { id: "3", title: "Nordseite fertigstellen", date: "2026-02-05", time: "17:00", type: "deadline", attendees: ["Stefan Weber", "Thomas Schmidt", "Michael Braun"] },
  { id: "4", title: "Zwischenabnahme", date: "2026-02-07", time: "10:00", type: "milestone", attendees: ["Max Müller", "Stefan Weber"] },
  { id: "5", title: "Wochenbesprechung", date: "2026-02-07", time: "15:00", type: "meeting", attendees: ["Max Müller", "Stefan Weber", "Thomas Schmidt", "Michael Braun"] },
];

// Zug/Gruppe configuration
const zugConfig: Record<string, { label: string; color: string }> = {
  "Zug Alpha": { label: "Zug Alpha", color: "bg-primary/10 text-primary" },
  "Zug Bravo": { label: "Zug Bravo", color: "bg-blue-100 text-blue-700" },
  "Zug Charlie": { label: "Zug Charlie", color: "bg-amber-100 text-amber-700" },
};

// Access Control Info Component
function AccessControlInfo({ currentUserZug }: { currentUserZug: string }) {
  return (
    <Card className="ff-card border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Zugangskontrolle aktiv</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nur Mitarbeiter aus <Badge className={zugConfig[currentUserZug]?.color || "bg-muted"}>{currentUserZug}</Badge> haben Zugriff auf diesen Projekt-Chat und Kalender.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Zuordnung erfolgt über die Einsatzplanung.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Team Chat Component
function TeamChat({ projectId }: { projectId: string }) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "1",
      senderName: "Max Müller",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("Nachricht gesendet");
  };

  const handleVideoCall = () => {
    toast.info("Teams-Videoanruf", {
      description: "Videoanruf wird in Microsoft Teams gestartet...",
    });
  };

  const handleVoiceCall = () => {
    toast.info("Teams-Anruf", {
      description: "Anruf wird in Microsoft Teams gestartet...",
    });
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6264A7]/10">
            <MessageSquare className="w-5 h-5 text-[#6264A7]" />
          </div>
          <div>
            <p className="font-medium">Projekt-Teamchat</p>
            <p className="text-xs text-muted-foreground">
              {mockTeamMembers.filter(m => m.hasAccess && m.isOnline).length} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleVideoCall}>
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.isOwn && "flex-row-reverse"
              )}
            >
              {!msg.isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {msg.senderName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[70%]", msg.isOwn && "text-right")}>
                {!msg.isOwn && (
                  <p className="text-xs text-muted-foreground mb-1">{msg.senderName}</p>
                )}
                <div
                  className={cn(
                    "p-3 rounded-2xl",
                    msg.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Nachricht eingeben..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="ff-button">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Team Calendar Component
function TeamCalendar({ projectId }: { projectId: string }) {
  const [currentWeek, setCurrentWeek] = useState(0);

  const getWeekDays = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return mockCalendarEvents.filter(e => e.date === dateStr);
  };

  const eventTypeConfig: Record<string, { color: string; label: string }> = {
    meeting: { color: "bg-[#6264A7]", label: "Meeting" },
    deadline: { color: "bg-amber-500", label: "Deadline" },
    milestone: { color: "bg-primary", label: "Meilenstein" },
  };

  const handleAddEvent = () => {
    toast.info("Termin erstellen", {
      description: "Neuer Termin wird in Microsoft Teams erstellt...",
    });
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6264A7]/10">
            <Calendar className="w-5 h-5 text-[#6264A7]" />
          </div>
          <div>
            <p className="font-medium">Projekt-Kalender</p>
            <p className="text-xs text-muted-foreground">
              Synchronisiert mit Microsoft Teams
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(currentWeek - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(0)}>
            Heute
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(currentWeek + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button onClick={handleAddEvent} className="ff-button gap-2">
            <Plus className="w-4 h-4" />
            Termin
          </Button>
        </div>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const events = getEventsForDate(day);
          const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

          return (
            <div
              key={index}
              className={cn(
                "min-h-[150px] p-2 rounded-xl border transition-colors",
                isToday ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">{dayNames[day.getDay()]}</p>
                <p className={cn(
                  "text-lg font-bold",
                  isToday && "text-primary"
                )}>
                  {day.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-1.5 rounded-lg text-white text-xs cursor-pointer hover:opacity-80 transition-opacity",
                      eventTypeConfig[event.type].color
                    )}
                    onClick={() => toast.info(event.title, { description: `${event.time} Uhr` })}
                  >
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="opacity-80">{event.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <Card className="ff-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Kommende Termine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCalendarEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className={cn("w-3 h-3 rounded-full", eventTypeConfig[event.type].color)} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("de-DE")} um {event.time} Uhr
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 3).map((attendee, i) => (
                    <Avatar key={i} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {attendee.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {event.attendees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                      +{event.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Team Members List Component
function TeamMembersList({ showOnlyWithAccess = true }: { showOnlyWithAccess?: boolean }) {
  const members = showOnlyWithAccess
    ? mockTeamMembers.filter(m => m.hasAccess)
    : mockTeamMembers;

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-colors",
            member.hasAccess ? "bg-muted/50 hover:bg-muted" : "bg-muted/20 opacity-60"
          )}
        >
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {member.avatar}
              </AvatarFallback>
            </Avatar>
            {member.isOnline && member.hasAccess && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{member.name}</p>
              {member.hasAccess && <UserCheck className="w-3 h-3 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">{member.rolle}</p>
          </div>
          <Badge className={zugConfig[member.zug]?.color || "bg-muted"}>
            {member.zug}
          </Badge>
          {!member.hasAccess && (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}

// Main Teams Integration Component
interface TeamsIntegrationProps {
  projectId: string;
  currentUserZug?: string;
  hasAccess?: boolean;
}

export default function TeamsIntegration({
  projectId,
  currentUserZug = "Zug Alpha",
  hasAccess = true,
}: TeamsIntegrationProps) {
  if (!hasAccess) {
    return (
      <Card className="ff-card">
        <CardContent className="p-12 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Kein Zugriff</h3>
          <p className="text-muted-foreground">
            Sie haben keinen Zugriff auf den Teamchat und Kalender dieses Projekts.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Zugriff wird über die Einsatzplanung erteilt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AccessControlInfo currentUserZug={currentUserZug} />

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl w-full">
          <TabsTrigger value="chat" className="rounded-xl flex-1 gap-2">
            <MessageSquare className="w-4 h-4" />
            Teamchat
          </TabsTrigger>
          <TabsTrigger value="kalender" className="rounded-xl flex-1 gap-2">
            <Calendar className="w-4 h-4" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="mitglieder" className="rounded-xl flex-1 gap-2">
            <Users className="w-4 h-4" />
            Mitglieder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <Card className="ff-card overflow-hidden">
            <TeamChat projectId={projectId} />
          </Card>
        </TabsContent>

        <TabsContent value="kalender" className="mt-4">
          <TeamCalendar projectId={projectId} />
        </TabsContent>

        <TabsContent value="mitglieder" className="mt-4">
          <Card className="ff-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Projektmitglieder
              </CardTitle>
              <CardDescription>
                Mitarbeiter mit Zugriff auf dieses Projekt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersList showOnlyWithAccess={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { TeamChat, TeamCalendar, TeamMembersList, AccessControlInfo };
