/**
 * Benachrichtigungs-Service
 * Zentrale Stelle zum Erstellen von Benachrichtigungen mit Prioritäten
 */
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";

type NotificationType = 
  | "task_assigned" | "task_due" | "project_status" | "offer_status"
  | "system" | "reminder" | "dunning" | "follow_up" | "hubspot_sync" | "workflow";

type NotificationPriority = "normal" | "high" | "critical";

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: number;
  link?: string;
}

/**
 * Erstellt eine einzelne Benachrichtigung
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.notifications).values({
    userId: params.userId,
    type: params.type,
    priority: params.priority ?? "normal",
    title: params.title,
    message: params.message ?? null,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    link: params.link ?? null,
  });
}

/**
 * Erstellt Benachrichtigungen für mehrere Benutzer gleichzeitig
 */
export async function createBulkNotifications(
  userIds: number[],
  params: Omit<CreateNotificationParams, "userId">
): Promise<void> {
  if (userIds.length === 0) return;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const values = userIds.map((userId) => ({
    userId,
    type: params.type,
    priority: params.priority ?? "normal" as NotificationPriority,
    title: params.title,
    message: params.message ?? null,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    link: params.link ?? null,
  }));
  await db.insert(schema.notifications).values(values);
}

/**
 * Erstellt Workflow-Benachrichtigungen bei Phasenübergängen
 */
export async function notifyWorkflowChange(params: {
  projectId: number;
  projectName: string;
  fromPhase: string;
  toPhase: string;
  triggeredByUserId: number;
  notifyUserIds: number[];
}): Promise<void> {
  await createBulkNotifications(params.notifyUserIds, {
    type: "workflow",
    priority: "normal",
    title: `Projekt "${params.projectName}" – Phase geändert`,
    message: `Phase von "${params.fromPhase}" auf "${params.toPhase}" geändert.`,
    entityType: "project",
    entityId: params.projectId,
    link: `/projekte/${params.projectId}`,
  });
}

/**
 * Erstellt Nachfass-Erinnerungen
 */
export async function notifyFollowUpDue(params: {
  userId: number;
  offerId: number;
  offerNumber: string;
  daysUntilDue: number;
}): Promise<void> {
  const priority: NotificationPriority = params.daysUntilDue <= 0 ? "critical" : params.daysUntilDue <= 3 ? "high" : "normal";
  await createNotification({
    userId: params.userId,
    type: "follow_up",
    priority,
    title: params.daysUntilDue <= 0 
      ? `Nachfassen überfällig: Angebot ${params.offerNumber}`
      : `Nachfassen in ${params.daysUntilDue} Tagen: Angebot ${params.offerNumber}`,
    message: `Bitte Angebot ${params.offerNumber} nachfassen.`,
    entityType: "offer",
    entityId: params.offerId,
    link: `/angebote`,
  });
}

/**
 * Erstellt Mahnungs-Benachrichtigungen
 */
export async function notifyDunningRequired(params: {
  userId: number;
  invoiceId: number;
  invoiceNumber: string;
  dunningLevel: number;
  amount: number;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    type: "dunning",
    priority: params.dunningLevel >= 3 ? "critical" : params.dunningLevel >= 2 ? "high" : "normal",
    title: `Mahnstufe ${params.dunningLevel}: Rechnung ${params.invoiceNumber}`,
    message: `Rechnung ${params.invoiceNumber} über ${params.amount.toFixed(2)}€ ist überfällig (Stufe ${params.dunningLevel}).`,
    entityType: "invoice",
    entityId: params.invoiceId,
    link: `/rechnungen/${params.invoiceId}`,
  });
}

/**
 * Erstellt Aufgaben-Erinnerungen
 */
export async function notifyTaskOverdue(params: {
  userId: number;
  taskId: number;
  taskTitle: string;
  daysOverdue: number;
}): Promise<void> {
  const priority: NotificationPriority = params.daysOverdue >= 7 ? "critical" : params.daysOverdue >= 3 ? "high" : "normal";
  await createNotification({
    userId: params.userId,
    type: "task_due",
    priority,
    title: `Aufgabe überfällig: ${params.taskTitle}`,
    message: `Die Aufgabe "${params.taskTitle}" ist seit ${params.daysOverdue} Tagen überfällig.`,
    entityType: "task",
    entityId: params.taskId,
    link: `/aufgaben`,
  });
}

/**
 * Erstellt HubSpot-Sync-Benachrichtigungen
 */
export async function notifyHubSpotSyncError(params: {
  userId: number;
  errorMessage: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    type: "hubspot_sync",
    priority: "high",
    title: "HubSpot Sync-Fehler",
    message: params.errorMessage,
    link: "/hubspot",
  });
}
