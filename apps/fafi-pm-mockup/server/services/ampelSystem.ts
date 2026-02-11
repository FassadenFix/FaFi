/**
 * v7.3 – Ampel-System Service
 * 
 * Berechnet den Ampel-Status (grün/gelb/rot) für Projekte und Baustellen
 * basierend auf Aufgaben, Terminen und Blockierungen.
 * 
 * Grün: Alle Voraussetzungen erfüllt, keine überfälligen Aufgaben
 * Gelb: Aufgaben in Bearbeitung, aber noch nicht überfällig
 * Rot: Überfällige Aufgaben oder blockierende Probleme
 */

export type AmpelStatus = "green" | "yellow" | "red";

export interface AmpelResult {
  status: AmpelStatus;
  reasons: string[];
  overdueTasks: number;
  pendingTasks: number;
  blockers: string[];
}

interface TaskInfo {
  id: number;
  title: string;
  status: string;
  dueDate: Date | null;
  priority: string;
}

interface ProjectInfo {
  id: number;
  phase: string;
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
}

interface ConstructionSiteInfo {
  id: number;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
  preDocumentationStatus: string;
  postDocumentationStatus: string;
}

/**
 * Berechnet den Ampel-Status für ein Projekt
 */
export function calculateProjectAmpel(
  project: ProjectInfo,
  tasks: TaskInfo[],
): AmpelResult {
  const result: AmpelResult = {
    status: "green",
    reasons: [],
    overdueTasks: 0,
    pendingTasks: 0,
    blockers: [],
  };

  const now = new Date();

  // Prüfe überfällige Aufgaben
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "erledigt" &&
      t.status !== "abgebrochen" &&
      t.dueDate &&
      new Date(t.dueDate) < now,
  );
  result.overdueTasks = overdueTasks.length;

  // Prüfe offene Aufgaben
  const pendingTasks = tasks.filter(
    (t) => t.status === "offen" || t.status === "in_bearbeitung",
  );
  result.pendingTasks = pendingTasks.length;

  // Rote Ampel: Überfällige Aufgaben
  if (overdueTasks.length > 0) {
    result.status = "red";
    result.reasons.push(
      `${overdueTasks.length} überfällige Aufgabe(n)`,
    );
    overdueTasks.forEach((t) => {
      result.blockers.push(`"${t.title}" seit ${formatDaysOverdue(t.dueDate!, now)} überfällig`);
    });
  }

  // Rote Ampel: Dringende Aufgaben ohne Zuweisung
  const urgentUnassigned = tasks.filter(
    (t) =>
      t.priority === "dringend" &&
      t.status === "offen",
  );
  if (urgentUnassigned.length > 0) {
    result.status = "red";
    result.reasons.push(`${urgentUnassigned.length} dringende offene Aufgabe(n)`);
  }

  // Rote Ampel: Projekt überfällig
  if (project.endDate && new Date(project.endDate) < now && project.progress < 100) {
    result.status = "red";
    result.reasons.push("Projekt-Endtermin überschritten");
    result.blockers.push(`Endtermin war ${formatDate(project.endDate)}`);
  }

  // Gelbe Ampel: Aufgaben in Bearbeitung, aber nicht überfällig
  if (result.status === "green" && pendingTasks.length > 0) {
    // Prüfe ob Aufgaben bald fällig sind (innerhalb 3 Tage)
    const soonDueTasks = pendingTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= now;
    });

    if (soonDueTasks.length > 0) {
      result.status = "yellow";
      result.reasons.push(
        `${soonDueTasks.length} Aufgabe(n) in den nächsten 3 Tagen fällig`,
      );
    }
  }

  // Grüne Ampel: Alles in Ordnung
  if (result.status === "green") {
    result.reasons.push("Alle Voraussetzungen erfüllt");
  }

  return result;
}

/**
 * Berechnet den Ampel-Status für eine Baustelle
 */
export function calculateSiteAmpel(
  site: ConstructionSiteInfo,
  tasks: TaskInfo[],
): AmpelResult {
  const result: AmpelResult = {
    status: "green",
    reasons: [],
    overdueTasks: 0,
    pendingTasks: 0,
    blockers: [],
  };

  const now = new Date();

  // Prüfe überfällige Aufgaben
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "erledigt" &&
      t.status !== "abgebrochen" &&
      t.dueDate &&
      new Date(t.dueDate) < now,
  );
  result.overdueTasks = overdueTasks.length;

  // Prüfe offene Aufgaben
  const pendingTasks = tasks.filter(
    (t) => t.status === "offen" || t.status === "in_bearbeitung",
  );
  result.pendingTasks = pendingTasks.length;

  // Rote Ampel: Überfällige Aufgaben
  if (overdueTasks.length > 0) {
    result.status = "red";
    result.reasons.push(`${overdueTasks.length} überfällige Aufgabe(n)`);
    overdueTasks.forEach((t) => {
      result.blockers.push(`"${t.title}" seit ${formatDaysOverdue(t.dueDate!, now)} überfällig`);
    });
  }

  // Rote Ampel: Baustelle aktiv ohne Vorher-Doku
  if (site.status === "aktiv" && site.preDocumentationStatus !== "completed") {
    result.status = "red";
    result.reasons.push("Vorher-Dokumentation nicht abgeschlossen");
    result.blockers.push("Vorher-Dokumentation muss vor Baustellenstart abgeschlossen werden");
  }

  // Rote Ampel: Baustelle überfällig
  if (site.endDate && new Date(site.endDate) < now && site.progress < 100) {
    result.status = "red";
    result.reasons.push("Baustellen-Endtermin überschritten");
    result.blockers.push(`Endtermin war ${formatDate(site.endDate)}`);
  }

  // Gelbe Ampel: Aufgaben bald fällig
  if (result.status === "green" && pendingTasks.length > 0) {
    const soonDueTasks = pendingTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= now;
    });

    if (soonDueTasks.length > 0) {
      result.status = "yellow";
      result.reasons.push(`${soonDueTasks.length} Aufgabe(n) in den nächsten 3 Tagen fällig`);
    }
  }

  // Gelbe Ampel: Baustelle pausiert
  if (result.status === "green" && site.status === "pausiert") {
    result.status = "yellow";
    result.reasons.push("Baustelle ist pausiert");
  }

  // Grüne Ampel
  if (result.status === "green") {
    result.reasons.push("Alle Voraussetzungen erfüllt");
  }

  return result;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDaysOverdue(dueDate: Date, now: Date): string {
  const diffMs = now.getTime() - new Date(dueDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "heute";
  if (diffDays === 1) return "1 Tag";
  return `${diffDays} Tagen`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
