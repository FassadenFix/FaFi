/**
 * Outlook Kalender Integration Service
 * Erstellt Kalendereinträge für Baustellen und Termine
 * 
 * HINWEIS: Für echte API-Aufrufe ist ein Backend-Upgrade erforderlich.
 * Diese Implementierung erstellt ICS-Dateien zum Download.
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  reminder?: number; // Minuten vor dem Termin
  attendees?: string[];
  category?: "baustelle" | "termin" | "besprechung" | "inspektion";
}

/**
 * Erstellt eine ICS-Datei für einen Kalendertermin
 */
export function createICSFile(event: CalendarEvent): string {
  const formatDate = (date: Date, allDay?: boolean): string => {
    if (allDay) {
      return date.toISOString().split("T")[0].replace(/-/g, "");
    }
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const uid = `fassadenfix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@fassadenfix.de`;
  const now = formatDate(new Date());

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FassadenFix//Projektmanager//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`
      : `DTSTART:${formatDate(event.startDate)}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${formatDate(event.endDate, true)}`
      : `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (event.description) {
    ics.push(`DESCRIPTION:${escapeText(event.description)}`);
  }

  if (event.location) {
    ics.push(`LOCATION:${escapeText(event.location)}`);
  }

  if (event.reminder) {
    ics.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(event.title)}`,
      `TRIGGER:-PT${event.reminder}M`,
      "END:VALARM"
    );
  }

  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach((email) => {
      ics.push(`ATTENDEE;RSVP=TRUE:mailto:${email}`);
    });
  }

  // Kategorie als Farbe
  if (event.category) {
    const categories: Record<string, string> = {
      baustelle: "Baustelle",
      termin: "Termin",
      besprechung: "Besprechung",
      inspektion: "Inspektion",
    };
    ics.push(`CATEGORIES:${categories[event.category]}`);
  }

  ics.push("END:VEVENT", "END:VCALENDAR");

  return ics.join("\r\n");
}

/**
 * Lädt eine ICS-Datei herunter
 */
export function downloadICS(event: CalendarEvent, filename?: string): void {
  const icsContent = createICSFile(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Erstellt einen Baustellen-Termin
 */
export function createBaustellenTermin(
  baustellenName: string,
  adresse: string,
  startDate: Date,
  endDate: Date,
  teamleiter?: string,
  beschreibung?: string
): CalendarEvent {
  return {
    title: `🏗️ Baustelle: ${baustellenName}`,
    description: beschreibung || `FassadenFix Baustelle\n\nAdresse: ${adresse}${teamleiter ? `\nTeamleiter: ${teamleiter}` : ""}`,
    location: adresse,
    startDate,
    endDate,
    allDay: true,
    reminder: 1440, // 1 Tag vorher
    category: "baustelle",
  };
}

/**
 * Erstellt einen Besprechungstermin
 */
export function createBesprechungsTermin(
  titel: string,
  ort: string,
  startDate: Date,
  dauer: number, // in Minuten
  teilnehmer?: string[],
  beschreibung?: string
): CalendarEvent {
  const endDate = new Date(startDate.getTime() + dauer * 60 * 1000);
  return {
    title: `📅 ${titel}`,
    description: beschreibung,
    location: ort,
    startDate,
    endDate,
    allDay: false,
    reminder: 30, // 30 Minuten vorher
    attendees: teilnehmer,
    category: "besprechung",
  };
}

/**
 * Erstellt einen Inspektionstermin
 */
export function createInspektionsTermin(
  immobilienName: string,
  adresse: string,
  datum: Date,
  inspektor?: string
): CalendarEvent {
  const endDate = new Date(datum.getTime() + 2 * 60 * 60 * 1000); // 2 Stunden
  return {
    title: `🔍 Inspektion: ${immobilienName}`,
    description: `FassadenFix Jahresinspektion\n\nObjekt: ${immobilienName}\nAdresse: ${adresse}${inspektor ? `\nInspektor: ${inspektor}` : ""}`,
    location: adresse,
    startDate: datum,
    endDate,
    allDay: false,
    reminder: 60, // 1 Stunde vorher
    category: "inspektion",
  };
}

/**
 * Öffnet Outlook Web mit vorausgefülltem Termin (falls verfügbar)
 */
export function openOutlookWeb(event: CalendarEvent): void {
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description || "",
    location: event.location || "",
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
  });

  const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
  window.open(outlookUrl, "_blank");
}

/**
 * Erstellt einen Google Calendar Link
 */
export function createGoogleCalendarLink(event: CalendarEvent): string {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
