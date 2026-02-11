/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Drag & Drop Kalender für Baustellenplanung
 * Ermöglicht das Verschieben von Baustellen und Team-Zuordnungen
 */

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  HardHat,
  Users,
  MapPin,
  GripVertical,
  Plus,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  addDays,
  differenceInDays,
} from "date-fns";
import { de } from "date-fns/locale";

// ============================================
// TYPES
// ============================================

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: "baustelle" | "besprechung" | "termin" | "urlaub" | "krank" | "sonstiges";
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  projectId?: number;
  constructionSiteId?: number;
  assignedToId?: number;
  assignedToName?: string;
}

interface DragDropCalendarProps {
  events: CalendarEvent[];
  onEventMove?: (eventId: number, newStartDate: Date, newEndDate: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
  view?: "week" | "month";
  className?: string;
}

// ============================================
// DRAG & DROP CALENDAR COMPONENT
// ============================================

export function DragDropCalendar({
  events,
  onEventMove,
  onEventClick,
  onAddEvent,
  onDateChange,
  view = "week",
  className,
}: DragDropCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  // Calculate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation
  const goToPreviousWeek = useCallback(() => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    const newWeekStart = startOfWeek(newDate, { weekStartsOn: 1 });
    const newWeekEnd = endOfWeek(newDate, { weekStartsOn: 1 });
    onDateChange?.(newWeekStart, newWeekEnd);
  }, [currentDate, onDateChange]);

  const goToNextWeek = useCallback(() => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    const newWeekStart = startOfWeek(newDate, { weekStartsOn: 1 });
    const newWeekEnd = endOfWeek(newDate, { weekStartsOn: 1 });
    onDateChange?.(newWeekStart, newWeekEnd);
  }, [currentDate, onDateChange]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const todayWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    onDateChange?.(todayWeekStart, todayWeekEnd);
  }, [onDateChange]);

  // Get events for a specific day
  const getEventsForDay = useCallback((day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return day >= eventStart && day <= eventEnd;
    });
  }, [events]);

  // Drag handlers
  const handleDragStart = useCallback((event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id.toString());
  }, []);

  const handleDragOver = useCallback((day: Date, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(day);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback((day: Date, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (draggedEvent && onEventMove) {
      const eventStart = new Date(draggedEvent.startDate);
      const eventEnd = new Date(draggedEvent.endDate);
      const duration = differenceInDays(eventEnd, eventStart);
      
      const newStartDate = day;
      const newEndDate = addDays(day, duration);
      
      onEventMove(draggedEvent.id, newStartDate, newEndDate);
    }
    
    setDraggedEvent(null);
  }, [draggedEvent, onEventMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
    setDragOverDate(null);
  }, []);

  // Event type colors
  const getEventColor = (eventType: CalendarEvent["eventType"]) => {
    switch (eventType) {
      case "baustelle":
        return "bg-[#77bc1f] text-white";
      case "besprechung":
        return "bg-blue-500 text-white";
      case "termin":
        return "bg-purple-500 text-white";
      case "urlaub":
        return "bg-amber-500 text-white";
      case "krank":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getEventIcon = (eventType: CalendarEvent["eventType"]) => {
    switch (eventType) {
      case "baustelle":
        return <HardHat className="w-3 h-3" />;
      case "besprechung":
        return <Users className="w-3 h-3" />;
      case "termin":
        return <Clock className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  // Week number
  const weekNumber = useMemo(() => {
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }, [currentDate]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#77bc1f]" />
              Einsatzplanung
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              KW {weekNumber}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Heute
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousWeek}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-sm font-medium min-w-[180px] text-center">
                {format(weekStart, "d. MMM", { locale: de })} – {format(weekEnd, "d. MMM yyyy", { locale: de })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextWeek}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-t">
          {/* Day Headers */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-b border-r last:border-r-0",
                isToday(day) && "bg-[#77bc1f]/10"
              )}
            >
              <div className="text-xs text-muted-foreground uppercase">
                {format(day, "EEE", { locale: de })}
              </div>
              <div className={cn(
                "text-lg font-semibold mt-0.5",
                isToday(day) && "text-[#77bc1f]"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
          
          {/* Day Cells with Events */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isDragOver = dragOverDate && isSameDay(day, dragOverDate);
            
            return (
              <div
                key={`cell-${index}`}
                className={cn(
                  "min-h-[150px] p-1 border-r last:border-r-0 transition-colors",
                  isToday(day) && "bg-[#77bc1f]/5",
                  isDragOver && "bg-[#77bc1f]/20 ring-2 ring-[#77bc1f] ring-inset"
                )}
                onDragOver={(e) => handleDragOver(day, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(day, e)}
              >
                <div className="space-y-1">
                  {dayEvents.map((event) => {
                    const isFirstDay = isSameDay(new Date(event.startDate), day);
                    const isLastDay = isSameDay(new Date(event.endDate), day);
                    
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "group px-2 py-1.5 text-xs cursor-move transition-all",
                          getEventColor(event.eventType),
                          isFirstDay && "rounded-l-md ml-0.5",
                          isLastDay && "rounded-r-md mr-0.5",
                          !isFirstDay && !isLastDay && "mx-0",
                          draggedEvent?.id === event.id && "opacity-50",
                          "hover:shadow-md hover:scale-[1.02]"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          {isFirstDay && getEventIcon(event.eventType)}
                          <span className="font-medium truncate">
                            {isFirstDay ? event.title : ""}
                          </span>
                        </div>
                        {isFirstDay && event.assignedToName && (
                          <div className="flex items-center gap-1 mt-0.5 opacity-80">
                            <Users className="w-3 h-3" />
                            <span className="truncate">{event.assignedToName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Add Event Button */}
                  {onAddEvent && (
                    <button
                      onClick={() => onAddEvent(day)}
                      className="w-full p-1 text-xs text-muted-foreground hover:text-[#77bc1f] hover:bg-[#77bc1f]/10 rounded transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100"
                    >
                      <Plus className="w-3 h-3" />
                      Hinzufügen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="p-3 border-t flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Legende:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#77bc1f]" />
            <span>Baustelle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Besprechung</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span>Termin</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Urlaub</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Krank</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TEAM ASSIGNMENT PANEL
// ============================================

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatarUrl?: string;
  isAvailable: boolean;
}

interface TeamAssignmentPanelProps {
  teamMembers: TeamMember[];
  assignedMembers: number[];
  onAssign?: (memberId: number) => void;
  onUnassign?: (memberId: number) => void;
  className?: string;
}

export function TeamAssignmentPanel({
  teamMembers,
  assignedMembers,
  onAssign,
  onUnassign,
  className,
}: TeamAssignmentPanelProps) {
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null);

  const handleDragStart = useCallback((member: TeamMember, e: React.DragEvent) => {
    setDraggedMember(member);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", member.id.toString());
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedMember(null);
  }, []);

  const availableMembers = teamMembers.filter(m => !assignedMembers.includes(m.id));
  const assigned = teamMembers.filter(m => assignedMembers.includes(m.id));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-[#77bc1f]" />
          Team-Zuordnung
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Assigned Members */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Zugeordnet ({assigned.length})</h4>
          <div className="space-y-2">
            {assigned.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-3 border border-dashed rounded-lg text-center">
                Zieh Teammitglieder hierher
              </div>
            ) : (
              assigned.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-[#77bc1f]/10 rounded-lg border border-[#77bc1f]/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#77bc1f] flex items-center justify-center text-white text-xs font-medium">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnassign?.(member.id)}
                    className="h-7 text-xs"
                  >
                    Entfernen
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Available Members */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Verfügbar ({availableMembers.length})</h4>
          <div className="space-y-2">
            {availableMembers.map(member => (
              <div
                key={member.id}
                draggable
                onDragStart={(e) => handleDragStart(member, e)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center justify-between p-2 bg-muted/50 rounded-lg cursor-move hover:bg-muted transition-colors",
                  !member.isAvailable && "opacity-50",
                  draggedMember?.id === member.id && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="w-8 h-8 rounded-full bg-[#4e5758] flex items-center justify-center text-white text-xs font-medium">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                {member.isAvailable ? (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Verfügbar
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Belegt
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DragDropCalendar;
