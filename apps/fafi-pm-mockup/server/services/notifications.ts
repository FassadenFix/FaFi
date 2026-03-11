/**
 * Notification Service for FaFi PM
 * Handles creating and managing notifications for various events
 */

import * as db from "../db";
import { notifyOwner } from "../_core/notification";

// Must match the enum in drizzle/schema.ts
type NotificationType = 
  | "task_assigned"
  | "task_due"
  | "project_status"
  | "offer_status"
  | "system"
  | "reminder";

interface NotificationPayload {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  priority?: "low" | "normal" | "high" | "urgent";
  actionUrl?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(payload: NotificationPayload) {
  return db.createNotification({
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    entityType: payload.entityType,
    entityId: payload.entityId,
  });
}

/**
 * Notify user about task assignment
 */
export async function notifyTaskAssigned(
  userId: number,
  taskTitle: string,
  taskId: number,
  assignedBy: string
) {
  return createNotification({
    userId,
    type: "task_assigned",
    title: "Neue Aufgabe zugewiesen",
    message: `${assignedBy} hat dir die Aufgabe "${taskTitle}" zugewiesen.`,
    entityType: "task",
    entityId: taskId,
    priority: "normal",
    actionUrl: `/tasks/${taskId}`,
  });
}

/**
 * Notify user about upcoming task due date
 */
export async function notifyTaskDueSoon(
  userId: number,
  taskTitle: string,
  taskId: number,
  dueDate: Date
) {
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const timeText = daysUntilDue === 1 ? "morgen" : `in ${daysUntilDue} Tagen`;
  
  return createNotification({
    userId,
    type: "task_due",
    title: "Aufgabe fällig",
    message: `Die Aufgabe "${taskTitle}" ist ${timeText} fällig.`,
    entityType: "task",
    entityId: taskId,
    priority: daysUntilDue <= 1 ? "high" : "normal",
    actionUrl: `/tasks/${taskId}`,
  });
}

/**
 * Notify user about overdue task
 */
export async function notifyTaskOverdue(
  userId: number,
  taskTitle: string,
  taskId: number
) {
  return createNotification({
    userId,
    type: "task_due",
    title: "Aufgabe überfällig",
    message: `Die Aufgabe "${taskTitle}" ist überfällig!`,
    entityType: "task",
    entityId: taskId,
    priority: "urgent",
    actionUrl: `/tasks/${taskId}`,
  });
}

/**
 * Notify relevant users about project status change
 */
export async function notifyProjectStatusChanged(
  projectId: number,
  projectName: string,
  oldPhase: string,
  newPhase: string,
  changedBy: string,
  notifyUserIds: number[]
) {
  const phaseLabels: Record<string, string> = {
    objektaufnahme: "Objektaufnahme",
    angebot_erstellt: "Angebot erstellt",
    angebot_versendet: "Angebot versendet",
    nachfassen: "Nachfassen",
    auftrag_gewonnen: "Auftrag gewonnen",
    planung: "Planung",
    vorbereitung: "Vorbereitung",
    durchfuehrung: "Durchführung",
    abnahme: "Abnahme",
    abgeschlossen: "Abgeschlossen",
    verloren: "Verloren",
  };

  const notifications = notifyUserIds.map(userId =>
    createNotification({
      userId,
      type: "project_status",
      title: "Projektstatus geändert",
      message: `${changedBy} hat "${projectName}" von "${phaseLabels[oldPhase] || oldPhase}" auf "${phaseLabels[newPhase] || newPhase}" gesetzt.`,
      entityType: "project",
      entityId: projectId,
      priority: newPhase === "auftrag_gewonnen" ? "high" : "normal",
      actionUrl: `/projects/${projectId}`,
    })
  );

  return Promise.all(notifications);
}

/**
 * Notify relevant users about offer status change
 */
export async function notifyOfferStatusChanged(
  offerId: number,
  offerNumber: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  notifyUserIds: number[]
) {
  const statusLabels: Record<string, string> = {
    entwurf: "Entwurf",
    erstellt: "Erstellt",
    versendet: "Versendet",
    angenommen: "Angenommen",
    abgelehnt: "Abgelehnt",
    abgelaufen: "Abgelaufen",
  };

  const priority = newStatus === "angenommen" ? "high" : 
                   newStatus === "abgelehnt" ? "normal" : "low";

  const notifications = notifyUserIds.map(userId =>
    createNotification({
      userId,
      type: "offer_status",
      title: "Angebotsstatus geändert",
      message: `Angebot ${offerNumber}: ${statusLabels[oldStatus] || oldStatus} → ${statusLabels[newStatus] || newStatus}`,
      entityType: "offer",
      entityId: offerId,
      priority,
      actionUrl: `/offers/${offerId}`,
    })
  );

  return Promise.all(notifications);
}

/**
 * Notify about weather warning for construction site
 */
export async function notifyWeatherWarning(
  constructionSiteId: number,
  siteName: string,
  warnings: string[],
  notifyUserIds: number[]
) {
  const notifications = notifyUserIds.map(userId =>
    createNotification({
      userId,
      type: "system",
      title: "Wetterwarnung",
      message: `${siteName}: ${warnings.join(", ")}`,
      entityType: "construction_site",
      entityId: constructionSiteId,
      priority: "high",
      actionUrl: `/baustellen/${constructionSiteId}`,
    })
  );

  return Promise.all(notifications);
}

/**
 * Check and notify about overdue tasks
 * Should be called periodically (e.g., daily)
 */
export async function checkAndNotifyOverdueTasks() {
  const overdueTasks = await db.getOverdueTasks();
  
  for (const task of overdueTasks) {
    if (task.assignedToId) {
      await notifyTaskOverdue(
        task.assignedToId,
        task.title,
        task.id
      );
    }
  }
  
  return { notified: overdueTasks.length };
}

/**
 * Check and notify about tasks due soon (within 3 days)
 * Should be called periodically (e.g., daily)
 */
export async function checkAndNotifyTasksDueSoon() {
  const allTasks = await db.getAllTasks();
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const tasksDueSoon = allTasks.filter(task => {
    if (!task.dueDate || task.status === "erledigt" || task.status === "abgebrochen") {
      return false;
    }
    const dueDate = new Date(task.dueDate);
    return dueDate > now && dueDate <= threeDaysFromNow;
  });
  
  for (const task of tasksDueSoon) {
    if (task.assignedToId && task.dueDate) {
      await notifyTaskDueSoon(
        task.assignedToId,
        task.title,
        task.id,
        new Date(task.dueDate)
      );
    }
  }
  
  return { notified: tasksDueSoon.length };
}

/**
 * Notify owner about important events (uses built-in notification system)
 */
export async function notifyOwnerAboutEvent(
  title: string,
  content: string
) {
  return notifyOwner({ title, content });
}

export type { NotificationType, NotificationPayload };
