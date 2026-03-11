/**
 * Bautagebuch-Generierungs-Service (v7.0c)
 * 
 * Generiert automatisch strukturierte Tagesberichte aus allen Logeinträgen
 * eines Arbeitstages auf einer Baustelle.
 */

import * as db from "../db";
import { storagePut } from "../storage";

interface BautagebuchEntry {
  constructionSiteId: number;
  constructionSiteName: string;
  projectId: number;
  date: Date;
  startLog?: any;
  endLog?: any;
  events: any[];
  photos: string[];
}

/**
 * Generiert einen Bautagebuch-Eintrag als Markdown-Dokument
 */
export function generateBautagebuchMarkdown(entry: BautagebuchEntry): string {
  const dateStr = entry.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(`# Bautagebuch – ${dateStr}`);
  lines.push("");
  lines.push(`**Baustelle:** ${entry.constructionSiteName}`);
  lines.push(`**Datum:** ${dateStr}`);
  lines.push("");

  // Arbeitszeiten
  if (entry.startLog || entry.endLog) {
    lines.push("## Arbeitszeiten");
    lines.push("");
    if (entry.startLog?.workDayStarted) {
      lines.push(`- **Arbeitsbeginn:** ${new Date(entry.startLog.workDayStarted).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`);
    }
    if (entry.endLog?.workDayEnded) {
      lines.push(`- **Arbeitsende:** ${new Date(entry.endLog.workDayEnded).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`);
    }
    if (entry.startLog?.userName) {
      lines.push(`- **Berichtsersteller:** ${entry.startLog.userName}`);
    }
    lines.push("");
  }

  // Planung
  if (entry.startLog?.plannedAreas?.length > 0) {
    lines.push("## Geplante Bereiche");
    lines.push("");
    const completedAreas: string[] = entry.endLog?.completedAreas || [];
    for (const area of entry.startLog.plannedAreas) {
      const done = completedAreas.includes(area);
      lines.push(`- [${done ? "x" : " "}] ${area}`);
    }
    lines.push("");

    if (entry.endLog) {
      const planned = entry.startLog.plannedAreas.length;
      const completed = completedAreas.length;
      lines.push(`**Ergebnis:** ${completed}/${planned} Bereiche abgeschlossen (${Math.round((completed / planned) * 100)}%)`);
      lines.push("");
    }
  }

  // Planungsstatus
  if (entry.startLog?.planningOnTrack !== undefined) {
    lines.push("## Planungsstatus");
    lines.push("");
    if (entry.startLog.planningOnTrack) {
      lines.push("Planung wird eingehalten.");
    } else {
      lines.push(`**Abweichung:** ${entry.startLog.planningDeviation || "Keine Details angegeben"}`);
    }
    lines.push("");
  }

  // Ereignisse
  if (entry.events.length > 0) {
    lines.push("## Ereignisse & Vorkommnisse");
    lines.push("");
    for (const event of entry.events) {
      const time = new Date(event.loggedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      const typeLabel = getLogTypeLabel(event.logType);
      const urgencyBadge = event.urgency === "kritisch" ? " 🔴 KRITISCH" : event.urgency === "hoch" ? " 🟠 HOCH" : "";
      lines.push(`### ${time} – ${typeLabel}${urgencyBadge}`);
      lines.push("");
      lines.push(event.entry);
      if (event.userName) {
        lines.push(`\n*Gemeldet von: ${event.userName}*`);
      }
      lines.push("");
    }
  }

  // Fotos
  if (entry.photos.length > 0) {
    lines.push("## Fotodokumentation");
    lines.push("");
    lines.push(`${entry.photos.length} Foto(s) aufgenommen.`);
    lines.push("");
  }

  // Tagesende-Zusammenfassung
  if (entry.endLog) {
    lines.push("## Zusammenfassung");
    lines.push("");
    lines.push(entry.endLog.entry);
    if (entry.endLog.metadata?.nextDayPlanning) {
      lines.push("");
      lines.push(`**Planung für morgen:** ${entry.endLog.metadata.nextDayPlanning}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Automatisch generiert am ${new Date().toLocaleString("de-DE")}*`);

  return lines.join("\n");
}

function getLogTypeLabel(logType: string): string {
  const labels: Record<string, string> = {
    arbeitsbeginn: "Arbeitsbeginn",
    fortschritt: "Fortschritt",
    pause: "Pause",
    problem: "Problem/Schaden",
    material: "Material",
    arbeitsende: "Arbeitsende",
    wetter: "Wetter",
    sicherheit: "Sicherheitsvorfall",
    kundenkontakt: "Kundenkontakt",
    geraeteausfall: "Geräteausfall",
    sonstiges: "Sonstiges",
  };
  return labels[logType] || logType;
}

/**
 * Generiert und speichert einen Bautagebuch-Eintrag als Dokument
 */
export async function generateAndSaveBautagebuch(
  constructionSiteId: number,
  date: Date,
  userId: number,
  userName: string,
): Promise<{ success: boolean; documentId?: number }> {
  try {
    // Lade alle Logs des Tages
    const logs = await db.getConstructionSiteLogs(constructionSiteId) as any[];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayLogs = logs.filter((log: any) => {
      const logDate = new Date(log.loggedAt);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    if (dayLogs.length === 0) {
      return { success: false };
    }

    const startLog = dayLogs.find((l: any) => l.logType === "arbeitsbeginn");
    const endLog = dayLogs.find((l: any) => l.logType === "arbeitsende");
    const events = dayLogs.filter((l: any) =>
      !["arbeitsbeginn", "arbeitsende"].includes(l.logType)
    );

    // Sammle alle Fotos
    const allPhotos: string[] = [];
    for (const log of dayLogs) {
      if (log.photos && Array.isArray(log.photos)) {
        allPhotos.push(...log.photos);
      }
    }

    // Lade Baustellen-Info
    const sites = await db.getAllConstructionSites() as any[];
    const site = sites.find((s: any) => s.id === constructionSiteId);
    const siteName = site?.name || `Baustelle #${constructionSiteId}`;
    const projectId = site?.projectId || 0;

    const entry: BautagebuchEntry = {
      constructionSiteId,
      constructionSiteName: siteName,
      projectId,
      date,
      startLog,
      endLog,
      events,
      photos: allPhotos,
    };

    const markdown = generateBautagebuchMarkdown(entry);

    // Speichere als Dokument in S3
    const dateKey = date.toISOString().split("T")[0];
    const fileKey = `bautagebuch/${constructionSiteId}/${dateKey}.md`;
    const buffer = Buffer.from(markdown, "utf-8");

    const { url } = await storagePut(fileKey, buffer, "text/markdown");

    // Erstelle Dokument-Eintrag in DB
    const doc = await db.createDocument({
      name: `Bautagebuch ${siteName} – ${date.toLocaleDateString("de-DE")}`,
      originalName: `bautagebuch_${dateKey}.md`,
      fileType: "dokument",
      mimeType: "text/markdown",
      fileSize: buffer.length,
      s3Key: fileKey,
      s3Url: url,
      constructionSiteId,
      projectId: projectId || undefined,
      category: "bautagebuch",
      description: `Automatisch generierter Tagesbericht für ${siteName} am ${date.toLocaleDateString("de-DE")}`,
      uploadedById: userId,
    });

    // Aktivitätslog
    await db.createActivityLog({
      userId,
      userName,
      action: "created",
      entityType: "document",
      entityId: doc.id,
      entityName: doc.name,
      details: `Bautagebuch automatisch generiert`,
    });

    return { success: true, documentId: doc.id };
  } catch (error) {
    console.error("[Bautagebuch] Fehler bei Generierung:", error);
    return { success: false };
  }
}
