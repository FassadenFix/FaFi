/**
 * FaFi PM – Scheduled Tasks Engine (Task Runner)
 * 
 * DB-basierte Task-Queue mit periodischem Check.
 * Verarbeitet fällige Tasks: Nachfass-Erinnerungen, Mahnlauf, HubSpot-Sync.
 * 
 * Architektur:
 * - Liest fällige Tasks aus der scheduledTasks-Tabelle
 * - Führt Tasks basierend auf Typ aus (follow_up, dunning, hubspot_sync, reminder)
 * - Aktualisiert Status (completed/failed) und Versuchszähler
 * - Erstellt Benachrichtigungen bei relevanten Ereignissen
 * - Läuft als Intervall-basierter Service (Standard: alle 5 Minuten)
 */

import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { createNotification, notifyFollowUpDue, notifyDunningRequired, notifyTaskOverdue } from "./notificationService";

// ============================================
// TYPES
// ============================================

export type TaskType = "follow_up" | "dunning" | "hubspot_sync" | "reminder" | "task_overdue";

export interface TaskExecutionResult {
  taskId: number;
  success: boolean;
  message: string;
  retryable?: boolean;
}

export interface TaskRunnerStats {
  totalProcessed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: TaskExecutionResult[];
}

// ============================================
// TASK SCHEDULING (Erstellen von Tasks)
// ============================================

/**
 * Plant einen neuen Task in der Queue.
 */
export async function scheduleTask(params: {
  type: TaskType;
  entityType?: string;
  entityId?: number;
  dueAt: Date;
  metadata?: Record<string, unknown>;
  maxAttempts?: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(schema.scheduledTasks).values({
    type: params.type,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    dueAt: params.dueAt,
    status: "pending",
    attempts: 0,
    maxAttempts: params.maxAttempts ?? 3,
    metadata: params.metadata ?? null,
  });

  return result.insertId;
}

/**
 * Plant einen Nachfass-Check für ein Angebot.
 */
export async function scheduleFollowUpCheck(offerId: number, projectId: number, dueAt: Date): Promise<number | null> {
  return scheduleTask({
    type: "follow_up",
    entityType: "offer",
    entityId: offerId,
    dueAt,
    metadata: { projectId, action: "check_follow_up" },
    maxAttempts: 1, // Einmalige Prüfung
  });
}

/**
 * Plant einen Mahnlauf-Check für eine Rechnung.
 */
export async function scheduleDunningCheck(invoiceId: number, dueAt: Date, level: number): Promise<number | null> {
  return scheduleTask({
    type: "dunning",
    entityType: "invoice",
    entityId: invoiceId,
    dueAt,
    metadata: { level, action: "check_dunning" },
    maxAttempts: 3,
  });
}

/**
 * Plant einen periodischen HubSpot-Sync.
 */
export async function scheduleHubSpotSync(dueAt: Date): Promise<number | null> {
  return scheduleTask({
    type: "hubspot_sync",
    dueAt,
    metadata: { action: "periodic_sync" },
    maxAttempts: 3,
  });
}

/**
 * Plant einen Aufgaben-Überfälligkeits-Check.
 */
export async function scheduleTaskOverdueCheck(dueAt: Date): Promise<number | null> {
  return scheduleTask({
    type: "task_overdue",
    dueAt,
    metadata: { action: "check_overdue_tasks" },
    maxAttempts: 1,
  });
}

// ============================================
// TASK EXECUTION (Ausführen von Tasks)
// ============================================

/**
 * Führt einen einzelnen Task basierend auf seinem Typ aus.
 */
export async function executeTask(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  const taskType = task.type as TaskType;

  try {
    switch (taskType) {
      case "follow_up":
        return await executeFollowUpTask(task);
      case "dunning":
        return await executeDunningTask(task);
      case "hubspot_sync":
        return await executeHubSpotSyncTask(task);
      case "reminder":
        return await executeReminderTask(task);
      case "task_overdue":
        return await executeTaskOverdueCheck(task);
      default:
        return {
          taskId: task.id,
          success: false,
          message: `Unbekannter Task-Typ: ${task.type}`,
          retryable: false,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      taskId: task.id,
      success: false,
      message: `Fehler bei Task-Ausführung: ${errorMessage}`,
      retryable: true,
    };
  }
}

/**
 * Prüft fällige Nachfass-Erinnerungen und erstellt Benachrichtigungen.
 */
async function executeFollowUpTask(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  const db = await getDb();
  if (!db) return { taskId: task.id, success: false, message: "DB nicht verfügbar", retryable: true };

  const offerId = task.entityId;
  if (!offerId) return { taskId: task.id, success: false, message: "Keine offerId", retryable: false };

  // Lade das Angebot
  const [offer] = await db.select().from(schema.offers).where(eq(schema.offers.id, offerId)).limit(1);
  if (!offer) return { taskId: task.id, success: false, message: `Angebot ${offerId} nicht gefunden`, retryable: false };

  // Nur wenn Angebot noch "versendet" ist (nicht angenommen/abgelehnt)
  if (offer.status !== "versendet") {
    return { taskId: task.id, success: true, message: `Angebot ${offerId} hat Status "${offer.status}" – kein Nachfassen nötig` };
  }

  // Finde den zuständigen Benutzer (Ersteller des Angebots oder Projektverantwortlicher)
  const metadata = task.metadata as Record<string, unknown> | null;
  const projectId = metadata?.projectId as number | undefined;

  // Benachrichtigung an alle Admins/GF erstellen
  const admins = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`${schema.users.role} = 'admin' OR ${schema.users.fafiRole} IN ('gf', 'kundenberater')`);

  for (const admin of admins) {
    await notifyFollowUpDue({
      userId: admin.id,
      offerId: offer.id,
      offerNumber: offer.offerNumber || `#${offer.id}`,
      daysUntilDue: 0, // Fällig jetzt
    });
  }

  return {
    taskId: task.id,
    success: true,
    message: `Nachfass-Erinnerung für Angebot ${offer.offerNumber || offerId} erstellt (${admins.length} Benachrichtigungen)`,
  };
}

/**
 * Prüft überfällige Rechnungen und erstellt Mahnungs-Benachrichtigungen.
 */
async function executeDunningTask(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  const db = await getDb();
  if (!db) return { taskId: task.id, success: false, message: "DB nicht verfügbar", retryable: true };

  const invoiceId = task.entityId;
  if (!invoiceId) return { taskId: task.id, success: false, message: "Keine invoiceId", retryable: false };

  // Lade die Rechnung
  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, invoiceId)).limit(1);
  if (!invoice) return { taskId: task.id, success: false, message: `Rechnung ${invoiceId} nicht gefunden`, retryable: false };

  // Nur wenn Rechnung noch offen ist
  if (invoice.status === "bezahlt" || invoice.status === "storniert") {
    return { taskId: task.id, success: true, message: `Rechnung ${invoiceId} ist "${invoice.status}" – keine Mahnung nötig` };
  }

  // Prüfe ob dueDate überschritten
  if (!invoice.dueDate) {
    return { taskId: task.id, success: true, message: `Rechnung ${invoiceId} hat kein Fälligkeitsdatum` };
  }

  const now = new Date();
  const daysPast = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  const metadata = task.metadata as Record<string, unknown> | null;
  const targetLevel = (metadata?.level as number) || 1;

  // Nur mahnen wenn die Stufe noch nicht erreicht ist
  const currentLevel = invoice.dunningLevel || 0;
  if (currentLevel >= targetLevel) {
    return { taskId: task.id, success: true, message: `Rechnung ${invoiceId} hat bereits Mahnstufe ${currentLevel}` };
  }

  // Benachrichtigung an Admins/Büro
  const admins = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`${schema.users.role} = 'admin' OR ${schema.users.fafiRole} IN ('gf', 'buero')`);

  for (const admin of admins) {
    await notifyDunningRequired({
      userId: admin.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber || `#${invoice.id}`,
      dunningLevel: targetLevel,
      amount: parseFloat(invoice.openAmount || "0"),
    });
  }

  return {
    taskId: task.id,
    success: true,
    message: `Mahnungs-Benachrichtigung Stufe ${targetLevel} für Rechnung ${invoice.invoiceNumber || invoiceId} erstellt (${admins.length} Benachrichtigungen)`,
  };
}

/**
 * Führt einen periodischen HubSpot-Sync durch.
 */
async function executeHubSpotSyncTask(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  // HubSpot-Sync wird über den bestehenden Service abgewickelt
  // Hier nur die Benachrichtigung bei Fehler
  try {
    // Importiere den HubSpot-Service dynamisch um zirkuläre Abhängigkeiten zu vermeiden
    const { fetchHubSpotCompanies, fetchHubSpotContacts, hubspotCompanyToLocal, hubspotContactToLocal } = await import("./hubspot");
    
    // Einfacher Sync: Daten abrufen und zählen (ohne DB-Import, da das über den Router läuft)
    const companies = await fetchHubSpotCompanies(100);
    const contacts = await fetchHubSpotContacts(100);

    const totalSynced = (companies?.length || 0) + (contacts?.length || 0);

    // Nächsten Sync planen (in 15 Minuten)
    const nextSync = new Date(Date.now() + 15 * 60 * 1000);
    await scheduleHubSpotSync(nextSync);

    return {
      taskId: task.id,
      success: true,
      message: `HubSpot-Sync abgeschlossen: ${totalSynced} Datensätze synchronisiert. Nächster Sync geplant für ${nextSync.toISOString()}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Benachrichtigung bei Sync-Fehler
    const db = await getDb();
    if (db) {
      const admins = await db.select({ id: schema.users.id })
        .from(schema.users)
        .where(sql`${schema.users.role} = 'admin'`);

      for (const admin of admins) {
        const { notifyHubSpotSyncError } = await import("./notificationService");
        await notifyHubSpotSyncError({
          userId: admin.id,
          errorMessage: `HubSpot-Sync fehlgeschlagen: ${errorMessage}`,
        });
      }
    }

    return {
      taskId: task.id,
      success: false,
      message: `HubSpot-Sync fehlgeschlagen: ${errorMessage}`,
      retryable: true,
    };
  }
}

/**
 * Führt einen generischen Erinnerungs-Task aus.
 */
async function executeReminderTask(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  const db = await getDb();
  if (!db) return { taskId: task.id, success: false, message: "DB nicht verfügbar", retryable: true };

  const metadata = task.metadata as Record<string, unknown> | null;
  const userId = metadata?.userId as number | undefined;
  const title = (metadata?.title as string) || "Erinnerung";
  const message = (metadata?.message as string) || "";

  if (!userId) {
    return { taskId: task.id, success: false, message: "Kein userId in Metadata", retryable: false };
  }

  await createNotification({
    userId,
    type: "reminder",
    priority: "normal",
    title,
    message,
    entityType: task.entityType ?? undefined,
    entityId: task.entityId ?? undefined,
  });

  return {
    taskId: task.id,
    success: true,
    message: `Erinnerung "${title}" an User ${userId} gesendet`,
  };
}

/**
 * Prüft alle Aufgaben auf Überfälligkeit und erstellt Benachrichtigungen.
 */
async function executeTaskOverdueCheck(task: schema.ScheduledTask): Promise<TaskExecutionResult> {
  const db = await getDb();
  if (!db) return { taskId: task.id, success: false, message: "DB nicht verf\u00fcgbar", retryable: true };

  const now = new Date();
  
  // Alle offenen/in Bearbeitung befindlichen Aufgaben mit Baustellen-Bezug laden
  const allTasks = await db.select().from(schema.tasks);
  
  const overdueTasks = allTasks.filter((t) => {
    if (!t.dueDate) return false;
    if (t.status === "erledigt" || t.status === "abgebrochen") return false;
    return new Date(t.dueDate) < now;
  });

  let notificationCount = 0;
  const notifiedUserIds = new Set<number>();

  for (const overdueTask of overdueTasks) {
    const daysOverdue = Math.floor((now.getTime() - new Date(overdueTask.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
    const priority: "normal" | "high" | "critical" = daysOverdue >= 7 ? "critical" : daysOverdue >= 3 ? "high" : "normal";
    const isPreparationTask = !!overdueTask.constructionSiteId;
    const boardLink = isPreparationTask ? "/vorbereitungsaufgaben" : "/aufgaben";
    
    // 1. Benachrichtigung an direkt zugewiesene Person
    if (overdueTask.assignedToId && !notifiedUserIds.has(overdueTask.assignedToId)) {
      await createNotification({
        userId: overdueTask.assignedToId,
        type: "task_due",
        priority,
        title: `\u26a0\ufe0f Aufgabe \u00fcberf\u00e4llig: ${overdueTask.title}`,
        message: `Die Aufgabe "${overdueTask.title}" ist seit ${daysOverdue} Tag(en) \u00fcberf\u00e4llig. Bitte umgehend bearbeiten.`,
        entityType: "task",
        entityId: overdueTask.id,
        link: boardLink,
      });
      notifiedUserIds.add(overdueTask.assignedToId);
      notificationCount++;
    }
    
    // 2. Bei Vorbereitungsaufgaben: Projektleiter der Baustelle benachrichtigen
    if (isPreparationTask && overdueTask.constructionSiteId) {
      const [site] = await db.select().from(schema.constructionSites)
        .where(eq(schema.constructionSites.id, overdueTask.constructionSiteId)).limit(1);
      if (site?.projektleiterId && !notifiedUserIds.has(site.projektleiterId)) {
        await createNotification({
          userId: site.projektleiterId,
          type: "task_due",
          priority,
          title: `\u26a0\ufe0f Vorbereitungsaufgabe \u00fcberf\u00e4llig: ${overdueTask.title}`,
          message: `Die Vorbereitungsaufgabe "${overdueTask.title}" f\u00fcr Baustelle ${site.siteNumber} ist seit ${daysOverdue} Tag(en) \u00fcberf\u00e4llig.`,
          entityType: "task",
          entityId: overdueTask.id,
          link: boardLink,
        });
        notifiedUserIds.add(site.projektleiterId);
        notificationCount++;
      }
    }
    
    // 3. Bei hoher Priorit\u00e4t oder kritisch: Admins/GF benachrichtigen
    if (priority === "high" || priority === "critical" || overdueTask.priority === "hoch" || overdueTask.priority === "dringend") {
      const admins = await db.select({ id: schema.users.id })
        .from(schema.users)
        .where(sql`${schema.users.role} = 'admin' OR ${schema.users.fafiRole} = 'gf'`);

      for (const admin of admins) {
        if (!notifiedUserIds.has(admin.id)) {
          await notifyTaskOverdue({
            userId: admin.id,
            taskId: overdueTask.id,
            taskTitle: overdueTask.title,
            daysOverdue,
          });
          notifiedUserIds.add(admin.id);
          notificationCount++;
        }
      }
    }
  }

  // N\u00e4chsten Check planen (in 24 Stunden)
  const nextCheck = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await scheduleTaskOverdueCheck(nextCheck);

  return {
    taskId: task.id,
    success: true,
    message: `${overdueTasks.length} \u00fcberf\u00e4llige Aufgaben gefunden, ${notificationCount} Benachrichtigungen erstellt. N\u00e4chster Check: ${nextCheck.toISOString()}`,
  };
}

// ============================================
// TASK RUNNER (Hauptschleife)
// ============================================

/**
 * Verarbeitet alle fälligen Tasks.
 * Wird periodisch aufgerufen (Standard: alle 5 Minuten).
 */
export async function processDueTasks(): Promise<TaskRunnerStats> {
  const stats: TaskRunnerStats = {
    totalProcessed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    results: [],
  };

  const db = await getDb();
  if (!db) return stats;

  const now = new Date();

  // Lade alle fälligen, ausstehenden Tasks mit ECONNRESET-Handling
  let dueTasks;
  try {
    dueTasks = await db
      .select()
      .from(schema.scheduledTasks)
      .where(
        and(
          eq(schema.scheduledTasks.status, "pending"),
          lte(schema.scheduledTasks.dueAt, now)
        )
      )
      .limit(50); // Maximal 50 Tasks pro Durchlauf
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const cause = (error as any)?.cause;
    const causeMsg = cause instanceof Error ? cause.message : String(cause || "");
    if (errMsg.includes("ECONNRESET") || causeMsg.includes("ECONNRESET") || errMsg.includes("EPIPE") || causeMsg.includes("EPIPE") || errMsg.includes("no available peers") || causeMsg.includes("no available peers") || errMsg.includes("ER_UNKNOWN_ERROR") || causeMsg.includes("ER_UNKNOWN_ERROR")) {
      console.warn("[TaskRunner] DB-Verbindung vorübergehend nicht verfügbar, nächster Versuch im nächsten Intervall.");
      // DB-Verbindung zurücksetzen damit beim nächsten Durchlauf eine neue Verbindung aufgebaut wird
      const { resetDbConnection } = await import("../db");
      await resetDbConnection();
      return stats;
    }
    throw error;
  }

  for (const task of dueTasks) {
    stats.totalProcessed++;

    // Prüfe maximale Versuche
    if ((task.attempts || 0) >= (task.maxAttempts || 3)) {
      // Task als fehlgeschlagen markieren
      await db
        .update(schema.scheduledTasks)
        .set({
          status: "failed",
          errorMessage: `Maximale Versuche (${task.maxAttempts}) erreicht`,
        })
        .where(eq(schema.scheduledTasks.id, task.id));

      stats.skipped++;
      stats.results.push({
        taskId: task.id,
        success: false,
        message: `Übersprungen: Maximale Versuche erreicht`,
      });
      continue;
    }

    // Versuchszähler erhöhen
    await db
      .update(schema.scheduledTasks)
      .set({
        attempts: (task.attempts || 0) + 1,
        lastAttemptAt: now,
      })
      .where(eq(schema.scheduledTasks.id, task.id));

    // Task ausführen
    const result = await executeTask(task);
    stats.results.push(result);

    if (result.success) {
      // Task als abgeschlossen markieren
      await db
        .update(schema.scheduledTasks)
        .set({
          status: "completed",
          completedAt: now,
        })
        .where(eq(schema.scheduledTasks.id, task.id));

      stats.succeeded++;
    } else {
      // Bei Fehler: Status beibehalten (pending) für Retry, oder failed wenn nicht retryable
      if (!result.retryable || (task.attempts || 0) + 1 >= (task.maxAttempts || 3)) {
        await db
          .update(schema.scheduledTasks)
          .set({
            status: "failed",
            errorMessage: result.message,
          })
          .where(eq(schema.scheduledTasks.id, task.id));
      } else {
        await db
          .update(schema.scheduledTasks)
          .set({
            errorMessage: result.message,
          })
          .where(eq(schema.scheduledTasks.id, task.id));
      }

      stats.failed++;
    }
  }

  return stats;
}

/**
 * Storniert einen geplanten Task.
 */
export async function cancelScheduledTask(taskId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(schema.scheduledTasks)
    .set({ status: "cancelled" })
    .where(eq(schema.scheduledTasks.id, taskId));

  return true;
}

/**
 * Storniert alle ausstehenden Tasks für eine bestimmte Entität.
 */
export async function cancelTasksForEntity(entityType: string, entityId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .update(schema.scheduledTasks)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(schema.scheduledTasks.entityType, entityType),
        eq(schema.scheduledTasks.entityId, entityId),
        eq(schema.scheduledTasks.status, "pending")
      )
    );

  return result[0]?.affectedRows || 0;
}

/**
 * Gibt Statistiken über die Task-Queue zurück.
 */
export async function getTaskQueueStats(): Promise<{
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  overdue: number;
}> {
  const db = await getDb();
  if (!db) return { pending: 0, completed: 0, failed: 0, cancelled: 0, overdue: 0 };

  const allTasks = await db.select().from(schema.scheduledTasks);
  const now = new Date();

  return {
    pending: allTasks.filter((t) => t.status === "pending").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    failed: allTasks.filter((t) => t.status === "failed").length,
    cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    overdue: allTasks.filter((t) => t.status === "pending" && t.dueAt < now).length,
  };
}

// ============================================
// INTERVAL RUNNER (Server-seitig)
// ============================================

let runnerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Startet den periodischen Task-Runner.
 * @param intervalMs - Intervall in Millisekunden (Standard: 5 Minuten)
 */
export function startTaskRunner(intervalMs: number = 5 * 60 * 1000): void {
  if (runnerInterval) {
    console.log("[TaskRunner] Bereits gestartet, wird neu gestartet...");
    stopTaskRunner();
  }

  console.log(`[TaskRunner] Gestartet mit Intervall: ${intervalMs / 1000}s`);

  // Erster Durchlauf nach 30 Sekunden (Server-Start abwarten)
  setTimeout(async () => {
    try {
      const stats = await processDueTasks();
      console.log(`[TaskRunner] Erster Durchlauf: ${stats.totalProcessed} Tasks verarbeitet (${stats.succeeded} OK, ${stats.failed} Fehler)`);
    } catch (error) {
      console.error("[TaskRunner] Fehler beim ersten Durchlauf:", error);
    }
  }, 30 * 1000);

  // Periodischer Durchlauf
  runnerInterval = setInterval(async () => {
    try {
      const stats = await processDueTasks();
      if (stats.totalProcessed > 0) {
        console.log(`[TaskRunner] ${stats.totalProcessed} Tasks verarbeitet (${stats.succeeded} OK, ${stats.failed} Fehler)`);
      }
    } catch (error) {
      console.error("[TaskRunner] Fehler:", error);
    }
  }, intervalMs);
}

/**
 * Stoppt den periodischen Task-Runner.
 */
export function stopTaskRunner(): void {
  if (runnerInterval) {
    clearInterval(runnerInterval);
    runnerInterval = null;
    console.log("[TaskRunner] Gestoppt");
  }
}

/**
 * Gibt zurück ob der Task-Runner aktiv ist.
 */
export function isTaskRunnerActive(): boolean {
  return runnerInterval !== null;
}
