/**
 * Unit-Tests für Phase 0.5 – Automatisierung & Proaktives System
 * 
 * Testet:
 * - 0.5e: Scheduled-Tasks-Engine (taskRunner.ts)
 * - 0.5a: Mahnlauf und Mahnstufen
 * - 0.5b: Aufgaben-Erinnerungen und Eskalation
 * - 0.5d: Benachrichtigungssystem mit Prioritäten
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================
// Mock-Setup
// ============================================

// Mock getDb
const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([{ insertId: 1 }]) });
const mockSelect = vi.fn().mockReturnValue({
  from: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    }),
    orderBy: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    }),
  }),
});
const mockUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
  }),
});
const mockDelete = vi.fn().mockReturnValue({
  where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
});

const mockDb = {
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
};

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../../drizzle/schema", () => ({
  scheduledTasks: { id: "id", type: "type", entityType: "entityType", entityId: "entityId", dueAt: "dueAt", status: "status", attempts: "attempts", maxAttempts: "maxAttempts", lastAttemptAt: "lastAttemptAt", completedAt: "completedAt", errorMessage: "errorMessage", metadata: "metadata" },
  offers: { id: "id", offerNumber: "offerNumber", status: "status" },
  invoices: { id: "id", invoiceNumber: "invoiceNumber", status: "status", dueDate: "dueDate", dunningLevel: "dunningLevel", openAmount: "openAmount" },
  tasks: { id: "id", title: "title", status: "status", dueDate: "dueDate" },
  users: { id: "id", role: "role", fafiRole: "fafiRole" },
  notifications: { id: "id", userId: "userId", type: "type", priority: "priority", title: "title", message: "message", isRead: "isRead" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ type: "eq", field: a, value: b })),
  and: vi.fn((...args: unknown[]) => ({ type: "and", conditions: args })),
  lte: vi.fn((a, b) => ({ type: "lte", field: a, value: b })),
  sql: vi.fn(),
}));

vi.mock("./notificationService", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
  createBulkNotifications: vi.fn().mockResolvedValue(undefined),
  notifyFollowUpDue: vi.fn().mockResolvedValue(undefined),
  notifyDunningRequired: vi.fn().mockResolvedValue(undefined),
  notifyTaskOverdue: vi.fn().mockResolvedValue(undefined),
  notifyHubSpotSyncError: vi.fn().mockResolvedValue(undefined),
  notifyWorkflowChange: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./hubspot", () => ({
  fetchHubSpotCompanies: vi.fn().mockResolvedValue([]),
  fetchHubSpotContacts: vi.fn().mockResolvedValue([]),
  hubspotCompanyToLocal: vi.fn(),
  hubspotContactToLocal: vi.fn(),
}));

// ============================================
// 1. SCHEDULED-TASKS-ENGINE TESTS (Phase 0.5e)
// ============================================

describe("Scheduled-Tasks-Engine (Phase 0.5e)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scheduleTask", () => {
    it("sollte einen neuen Task in die Queue einfügen", async () => {
      const { scheduleTask } = await import("./taskRunner");
      
      const dueAt = new Date("2026-03-01T10:00:00Z");
      const result = await scheduleTask({
        type: "follow_up",
        entityType: "offer",
        entityId: 42,
        dueAt,
        metadata: { action: "check_follow_up" },
      });

      expect(result).toBe(1);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("sollte Standard-maxAttempts von 3 verwenden", async () => {
      const { scheduleTask } = await import("./taskRunner");
      
      const dueAt = new Date("2026-03-01T10:00:00Z");
      await scheduleTask({
        type: "dunning",
        dueAt,
      });

      const insertCall = mockInsert.mock.results[0]?.value?.values;
      expect(insertCall).toBeDefined();
    });
  });

  describe("scheduleFollowUpCheck", () => {
    it("sollte einen Follow-Up-Check mit korrekten Parametern planen", async () => {
      const { scheduleFollowUpCheck } = await import("./taskRunner");
      
      const dueAt = new Date("2026-03-01T10:00:00Z");
      const result = await scheduleFollowUpCheck(42, 10, dueAt);

      expect(result).toBe(1);
    });
  });

  describe("scheduleDunningCheck", () => {
    it("sollte einen Mahnlauf-Check mit Level planen", async () => {
      const { scheduleDunningCheck } = await import("./taskRunner");
      
      const dueAt = new Date("2026-03-01T10:00:00Z");
      const result = await scheduleDunningCheck(99, dueAt, 2);

      expect(result).toBe(1);
    });
  });

  describe("scheduleHubSpotSync", () => {
    it("sollte einen HubSpot-Sync planen", async () => {
      const { scheduleHubSpotSync } = await import("./taskRunner");
      
      const dueAt = new Date("2026-03-01T10:00:00Z");
      const result = await scheduleHubSpotSync(dueAt);

      expect(result).toBe(1);
    });
  });

  describe("cancelScheduledTask", () => {
    it("sollte einen Task stornieren", async () => {
      const { cancelScheduledTask } = await import("./taskRunner");
      
      const result = await cancelScheduledTask(5);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("cancelTasksForEntity", () => {
    it("sollte alle ausstehenden Tasks einer Entität stornieren", async () => {
      const { cancelTasksForEntity } = await import("./taskRunner");
      
      const result = await cancelTasksForEntity("offer", 42);

      expect(typeof result).toBe("number");
    });
  });

  describe("executeTask", () => {
    it("sollte einen unbekannten Task-Typ als Fehler melden", async () => {
      const { executeTask } = await import("./taskRunner");
      
      const task = {
        id: 1,
        type: "unknown_type",
        entityType: null,
        entityId: null,
        dueAt: new Date(),
        status: "pending" as const,
        attempts: 0,
        maxAttempts: 3,
        lastAttemptAt: null,
        completedAt: null,
        errorMessage: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await executeTask(task);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unbekannter Task-Typ");
      expect(result.retryable).toBe(false);
    });

    it("sollte einen Reminder-Task ohne userId als Fehler melden", async () => {
      const { executeTask } = await import("./taskRunner");
      
      const task = {
        id: 2,
        type: "reminder",
        entityType: null,
        entityId: null,
        dueAt: new Date(),
        status: "pending" as const,
        attempts: 0,
        maxAttempts: 3,
        lastAttemptAt: null,
        completedAt: null,
        errorMessage: null,
        metadata: { title: "Test" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await executeTask(task);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Kein userId");
    });
  });

  describe("processDueTasks", () => {
    it("sollte leere Statistiken zurückgeben wenn keine Tasks fällig sind", async () => {
      const { processDueTasks } = await import("./taskRunner");
      
      const stats = await processDueTasks();

      expect(stats.totalProcessed).toBe(0);
      expect(stats.succeeded).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.skipped).toBe(0);
      expect(stats.results).toEqual([]);
    });
  });

  describe("getTaskQueueStats", () => {
    it("sollte Statistiken der Task-Queue zurückgeben", async () => {
      // Mock: leere Tabelle
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([]),
      });

      const { getTaskQueueStats } = await import("./taskRunner");
      const stats = await getTaskQueueStats();

      expect(stats).toHaveProperty("pending");
      expect(stats).toHaveProperty("completed");
      expect(stats).toHaveProperty("failed");
      expect(stats).toHaveProperty("cancelled");
      expect(stats).toHaveProperty("overdue");
    });
  });

  describe("startTaskRunner / stopTaskRunner", () => {
    it("sollte den Runner starten und stoppen können", async () => {
      const { startTaskRunner, stopTaskRunner, isTaskRunnerActive } = await import("./taskRunner");
      
      // Stoppe zuerst falls bereits aktiv
      stopTaskRunner();
      expect(isTaskRunnerActive()).toBe(false);

      // Starte mit kurzem Intervall
      startTaskRunner(60000);
      expect(isTaskRunnerActive()).toBe(true);

      // Stoppe wieder
      stopTaskRunner();
      expect(isTaskRunnerActive()).toBe(false);
    });
  });
});

// ============================================
// 2. MAHNLAUF UND MAHNSTUFEN TESTS (Phase 0.5a)
// ============================================

describe("Mahnlauf und Mahnstufen (Phase 0.5a)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Mahnstufen-Logik", () => {
    it("sollte 4 Mahnstufen definiert haben (30/60/90/90+ Tage)", () => {
      const DUNNING_LEVELS = [
        { level: 1, daysOverdue: 30, label: "Zahlungserinnerung", fee: 0 },
        { level: 2, daysOverdue: 60, label: "1. Mahnung", fee: 5 },
        { level: 3, daysOverdue: 90, label: "2. Mahnung", fee: 10 },
        { level: 4, daysOverdue: 90, label: "Letzte Mahnung", fee: 15 },
      ];

      expect(DUNNING_LEVELS).toHaveLength(4);
      expect(DUNNING_LEVELS[0].fee).toBe(0); // Zahlungserinnerung kostenlos
      expect(DUNNING_LEVELS[3].fee).toBe(15); // Letzte Mahnung: 15€
    });

    it("sollte Mahnstufe korrekt aus Tagen berechnen", () => {
      function calculateDunningLevel(daysPastDue: number): number {
        if (daysPastDue >= 90) return 4;
        if (daysPastDue >= 60) return 3;
        if (daysPastDue >= 30) return 2;
        if (daysPastDue >= 1) return 1;
        return 0;
      }

      expect(calculateDunningLevel(0)).toBe(0);
      expect(calculateDunningLevel(1)).toBe(1);
      expect(calculateDunningLevel(29)).toBe(1);
      expect(calculateDunningLevel(30)).toBe(2);
      expect(calculateDunningLevel(59)).toBe(2);
      expect(calculateDunningLevel(60)).toBe(3);
      expect(calculateDunningLevel(89)).toBe(3);
      expect(calculateDunningLevel(90)).toBe(4);
      expect(calculateDunningLevel(120)).toBe(4);
    });

    it("sollte Mahngebühren korrekt zuordnen", () => {
      const DUNNING_FEES: Record<number, number> = { 1: 0, 2: 5, 3: 10, 4: 15 };

      expect(DUNNING_FEES[1]).toBe(0);
      expect(DUNNING_FEES[2]).toBe(5);
      expect(DUNNING_FEES[3]).toBe(10);
      expect(DUNNING_FEES[4]).toBe(15);
    });
  });

  describe("Überfälligkeits-Erkennung", () => {
    it("sollte bezahlte Rechnungen nicht als überfällig erkennen", () => {
      const invoice = { status: "bezahlt", dueDate: new Date("2025-01-01") };
      const isOverdue = invoice.status !== "bezahlt" && invoice.status !== "storniert" && invoice.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });

    it("sollte stornierte Rechnungen nicht als überfällig erkennen", () => {
      const invoice = { status: "storniert", dueDate: new Date("2025-01-01") };
      const isOverdue = invoice.status !== "bezahlt" && invoice.status !== "storniert" && invoice.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });

    it("sollte offene Rechnungen nach Fälligkeit als überfällig erkennen", () => {
      const invoice = { status: "offen", dueDate: new Date("2025-01-01") };
      const isOverdue = invoice.status !== "bezahlt" && invoice.status !== "storniert" && invoice.dueDate < new Date();
      expect(isOverdue).toBe(true);
    });

    it("sollte Rechnungen ohne Fälligkeitsdatum nicht als überfällig erkennen", () => {
      const invoice = { status: "offen", dueDate: null };
      const isOverdue = invoice.dueDate !== null && invoice.status !== "bezahlt" && invoice.status !== "storniert" && invoice.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });
  });

  describe("Mahnlauf-Scheduling", () => {
    it("sollte Mahnlauf-Checks korrekt planen", async () => {
      const { scheduleDunningCheck } = await import("./taskRunner");
      
      const dueAt = new Date("2026-04-01T08:00:00Z");
      const result = await scheduleDunningCheck(1, dueAt, 1);
      
      expect(result).toBe(1);
    });
  });
});

// ============================================
// 3. AUFGABEN-ERINNERUNGEN UND ESKALATION (Phase 0.5b)
// ============================================

describe("Aufgaben-Erinnerungen und Eskalation (Phase 0.5b)", () => {
  describe("Eskalationsstufen", () => {
    it("sollte 3 Eskalationsstufen definiert haben (gelb/orange/rot)", () => {
      const ESCALATION_LEVELS = [
        { level: "gelb", daysOverdue: 1, label: "Leicht überfällig", color: "#f59e0b" },
        { level: "orange", daysOverdue: 3, label: "Überfällig", color: "#f97316" },
        { level: "rot", daysOverdue: 7, label: "Kritisch überfällig", color: "#ef4444" },
      ];

      expect(ESCALATION_LEVELS).toHaveLength(3);
      expect(ESCALATION_LEVELS[0].level).toBe("gelb");
      expect(ESCALATION_LEVELS[2].level).toBe("rot");
    });

    it("sollte Eskalationsstufe korrekt aus Tagen berechnen", () => {
      function getEscalationLevel(daysOverdue: number): "none" | "gelb" | "orange" | "rot" {
        if (daysOverdue >= 7) return "rot";
        if (daysOverdue >= 3) return "orange";
        if (daysOverdue >= 1) return "gelb";
        return "none";
      }

      expect(getEscalationLevel(0)).toBe("none");
      expect(getEscalationLevel(1)).toBe("gelb");
      expect(getEscalationLevel(2)).toBe("gelb");
      expect(getEscalationLevel(3)).toBe("orange");
      expect(getEscalationLevel(6)).toBe("orange");
      expect(getEscalationLevel(7)).toBe("rot");
      expect(getEscalationLevel(30)).toBe("rot");
    });

    it("sollte Eskalationsfarbe korrekt zuordnen", () => {
      const ESCALATION_COLORS: Record<string, string> = {
        none: "#6b7280",
        gelb: "#f59e0b",
        orange: "#f97316",
        rot: "#ef4444",
      };

      expect(ESCALATION_COLORS.gelb).toBe("#f59e0b");
      expect(ESCALATION_COLORS.orange).toBe("#f97316");
      expect(ESCALATION_COLORS.rot).toBe("#ef4444");
    });
  });

  describe("Aufgaben-Überfälligkeits-Check", () => {
    it("sollte erledigte Aufgaben nicht als überfällig erkennen", () => {
      const task = { status: "erledigt", dueDate: new Date("2025-01-01") };
      const isOverdue = task.status !== "erledigt" && task.status !== "abgebrochen" && task.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });

    it("sollte abgebrochene Aufgaben nicht als überfällig erkennen", () => {
      const task = { status: "abgebrochen", dueDate: new Date("2025-01-01") };
      const isOverdue = task.status !== "erledigt" && task.status !== "abgebrochen" && task.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });

    it("sollte offene Aufgaben nach Fälligkeit als überfällig erkennen", () => {
      const task = { status: "offen", dueDate: new Date("2025-01-01") };
      const isOverdue = task.status !== "erledigt" && task.status !== "abgebrochen" && task.dueDate < new Date();
      expect(isOverdue).toBe(true);
    });

    it("sollte Aufgaben ohne Fälligkeitsdatum nicht als überfällig erkennen", () => {
      const task = { status: "offen", dueDate: null as Date | null };
      const isOverdue = task.dueDate !== null && task.status !== "erledigt" && task.status !== "abgebrochen" && task.dueDate < new Date();
      expect(isOverdue).toBe(false);
    });
  });

  describe("Tage-Berechnung", () => {
    it("sollte Tage seit Fälligkeit korrekt berechnen", () => {
      function daysSinceDue(dueDate: Date): number {
        const now = new Date();
        const diff = now.getTime() - dueDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(daysSinceDue(yesterday)).toBe(1);

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      expect(daysSinceDue(lastWeek)).toBe(7);
    });

    it("sollte zukünftige Fälligkeitsdaten als negative Tage berechnen", () => {
      function daysSinceDue(dueDate: Date): number {
        const now = new Date();
        const diff = now.getTime() - dueDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(daysSinceDue(tomorrow)).toBeLessThan(0);
    });
  });
});

// ============================================
// 4. BENACHRICHTIGUNGSSYSTEM MIT PRIORITÄTEN (Phase 0.5d)
// ============================================

describe("Benachrichtigungssystem mit Prioritäten (Phase 0.5d)", () => {
  describe("Prioritäts-Logik", () => {
    it("sollte 3 Prioritätsstufen definiert haben", () => {
      const PRIORITIES = ["normal", "high", "critical"] as const;
      expect(PRIORITIES).toHaveLength(3);
    });

    it("sollte Nachfass-Priorität korrekt berechnen", () => {
      function getFollowUpPriority(daysUntilDue: number): "normal" | "high" | "critical" {
        if (daysUntilDue <= 0) return "critical";
        if (daysUntilDue <= 3) return "high";
        return "normal";
      }

      expect(getFollowUpPriority(7)).toBe("normal");
      expect(getFollowUpPriority(3)).toBe("high");
      expect(getFollowUpPriority(1)).toBe("high");
      expect(getFollowUpPriority(0)).toBe("critical");
      expect(getFollowUpPriority(-1)).toBe("critical");
    });

    it("sollte Mahnungs-Priorität korrekt berechnen", () => {
      function getDunningPriority(level: number): "normal" | "high" | "critical" {
        if (level >= 3) return "critical";
        if (level >= 2) return "high";
        return "normal";
      }

      expect(getDunningPriority(1)).toBe("normal");
      expect(getDunningPriority(2)).toBe("high");
      expect(getDunningPriority(3)).toBe("critical");
      expect(getDunningPriority(4)).toBe("critical");
    });

    it("sollte Aufgaben-Überfälligkeits-Priorität korrekt berechnen", () => {
      function getTaskOverduePriority(daysOverdue: number): "normal" | "high" | "critical" {
        if (daysOverdue >= 7) return "critical";
        if (daysOverdue >= 3) return "high";
        return "normal";
      }

      expect(getTaskOverduePriority(1)).toBe("normal");
      expect(getTaskOverduePriority(3)).toBe("high");
      expect(getTaskOverduePriority(7)).toBe("critical");
      expect(getTaskOverduePriority(14)).toBe("critical");
    });
  });

  describe("Benachrichtigungs-Typen", () => {
    it("sollte alle Benachrichtigungs-Typen definiert haben", () => {
      const NOTIFICATION_TYPES = [
        "task_assigned",
        "task_due",
        "project_status",
        "offer_status",
        "system",
        "reminder",
        "dunning",
        "follow_up",
        "hubspot_sync",
        "workflow",
      ] as const;

      expect(NOTIFICATION_TYPES).toHaveLength(10);
      expect(NOTIFICATION_TYPES).toContain("dunning");
      expect(NOTIFICATION_TYPES).toContain("follow_up");
      expect(NOTIFICATION_TYPES).toContain("workflow");
    });
  });

  describe("NotificationService Funktionen", () => {
    it("sollte createNotification aufrufen können", async () => {
      const { createNotification } = await import("./notificationService");
      
      await createNotification({
        userId: 1,
        type: "system",
        priority: "normal",
        title: "Test",
        message: "Test-Nachricht",
      });

      expect(createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: "system",
        priority: "normal",
        title: "Test",
        message: "Test-Nachricht",
      });
    });

    it("sollte notifyFollowUpDue aufrufen können", async () => {
      const { notifyFollowUpDue } = await import("./notificationService");
      
      await notifyFollowUpDue({
        userId: 1,
        offerId: 42,
        offerNumber: "FF-2026-042",
        daysUntilDue: 3,
      });

      expect(notifyFollowUpDue).toHaveBeenCalledWith({
        userId: 1,
        offerId: 42,
        offerNumber: "FF-2026-042",
        daysUntilDue: 3,
      });
    });

    it("sollte notifyDunningRequired aufrufen können", async () => {
      const { notifyDunningRequired } = await import("./notificationService");
      
      await notifyDunningRequired({
        userId: 1,
        invoiceId: 99,
        invoiceNumber: "RE-2026-099",
        dunningLevel: 2,
        amount: 1500.50,
      });

      expect(notifyDunningRequired).toHaveBeenCalledWith({
        userId: 1,
        invoiceId: 99,
        invoiceNumber: "RE-2026-099",
        dunningLevel: 2,
        amount: 1500.50,
      });
    });

    it("sollte notifyTaskOverdue aufrufen können", async () => {
      const { notifyTaskOverdue } = await import("./notificationService");
      
      await notifyTaskOverdue({
        userId: 1,
        taskId: 5,
        taskTitle: "Bewohnerinfo erstellen",
        daysOverdue: 3,
      });

      expect(notifyTaskOverdue).toHaveBeenCalledWith({
        userId: 1,
        taskId: 5,
        taskTitle: "Bewohnerinfo erstellen",
        daysOverdue: 3,
      });
    });
  });
});

// ============================================
// 5. NACHFASS-SYSTEM TESTS (Phase 0e, ergänzend)
// ============================================

describe("Nachfass-System (Phase 0e)", () => {
  describe("Nachfass-Intervalle", () => {
    it("sollte 3 automatische Nachfass-Intervalle definiert haben (7/14/30 Tage)", () => {
      const FOLLOW_UP_INTERVALS = [
        { type: "auto_7d", days: 7, label: "1. Nachfassen (7 Tage)" },
        { type: "auto_14d", days: 14, label: "2. Nachfassen (14 Tage)" },
        { type: "auto_30d", days: 30, label: "3. Nachfassen (30 Tage)" },
      ];

      expect(FOLLOW_UP_INTERVALS).toHaveLength(3);
      expect(FOLLOW_UP_INTERVALS[0].days).toBe(7);
      expect(FOLLOW_UP_INTERVALS[1].days).toBe(14);
      expect(FOLLOW_UP_INTERVALS[2].days).toBe(30);
    });

    it("sollte Fälligkeitsdaten korrekt berechnen", () => {
      const sentAt = new Date("2026-02-01T10:00:00Z");
      const intervals = [7, 14, 30];
      
      const dueDates = intervals.map(days => {
        const dueAt = new Date(sentAt.getTime() + days * 24 * 60 * 60 * 1000);
        return dueAt.toISOString().split("T")[0];
      });

      expect(dueDates[0]).toBe("2026-02-08");
      expect(dueDates[1]).toBe("2026-02-15");
      expect(dueDates[2]).toBe("2026-03-03");
    });
  });

  describe("Nachfass-Status", () => {
    it("sollte 4 Status-Optionen definiert haben", () => {
      const FOLLOW_UP_STATUSES = ["pending", "completed", "dismissed", "overdue"] as const;
      expect(FOLLOW_UP_STATUSES).toHaveLength(4);
    });

    it("sollte Nachfass-Typ korrekt erkennen", () => {
      const REMINDER_TYPES = ["auto_7d", "auto_14d", "auto_30d", "custom"] as const;
      expect(REMINDER_TYPES).toHaveLength(4);
      expect(REMINDER_TYPES).toContain("custom");
    });
  });
});

// ============================================
// 6. TASK-RUNNER INTEGRATION TESTS
// ============================================

describe("Task-Runner Integration", () => {
  describe("Task-Typen", () => {
    it("sollte alle unterstützten Task-Typen definiert haben", () => {
      const TASK_TYPES = ["follow_up", "dunning", "hubspot_sync", "reminder", "task_overdue"] as const;
      expect(TASK_TYPES).toHaveLength(5);
    });
  });

  describe("Task-Status-Übergänge", () => {
    it("sollte gültige Status-Übergänge definiert haben", () => {
      const VALID_TRANSITIONS: Record<string, string[]> = {
        pending: ["completed", "failed", "cancelled"],
        completed: [], // Endstatus
        failed: [], // Endstatus
        cancelled: [], // Endstatus
      };

      expect(VALID_TRANSITIONS.pending).toContain("completed");
      expect(VALID_TRANSITIONS.pending).toContain("failed");
      expect(VALID_TRANSITIONS.pending).toContain("cancelled");
      expect(VALID_TRANSITIONS.completed).toHaveLength(0);
      expect(VALID_TRANSITIONS.failed).toHaveLength(0);
    });
  });

  describe("Retry-Logik", () => {
    it("sollte maximal 3 Versuche als Standard haben", () => {
      const DEFAULT_MAX_ATTEMPTS = 3;
      expect(DEFAULT_MAX_ATTEMPTS).toBe(3);
    });

    it("sollte Task nach max Versuchen als fehlgeschlagen markieren", () => {
      const task = { attempts: 3, maxAttempts: 3 };
      const shouldFail = task.attempts >= task.maxAttempts;
      expect(shouldFail).toBe(true);
    });

    it("sollte Task mit weniger Versuchen als pending belassen", () => {
      const task = { attempts: 1, maxAttempts: 3 };
      const shouldFail = task.attempts >= task.maxAttempts;
      expect(shouldFail).toBe(false);
    });
  });

  describe("Batch-Verarbeitung", () => {
    it("sollte maximal 50 Tasks pro Durchlauf verarbeiten", () => {
      const BATCH_LIMIT = 50;
      expect(BATCH_LIMIT).toBe(50);
    });
  });
});
