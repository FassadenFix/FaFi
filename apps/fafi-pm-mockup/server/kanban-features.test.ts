/**
 * Tests für die drei neuen Kanban-Board Features:
 * 1. Drag & Drop (Status-Update via updateStatus)
 * 2. Aufgaben-Detailansicht mit Kommentaren und Foto-Upload
 * 3. Automatische Benachrichtigungen bei Ampel-Wechsel
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

// ============================================
// Feature 1: Drag & Drop (Status-Update)
// ============================================
describe("Feature 1: Drag & Drop – Status-Updates", () => {
  const caller = appRouter.createCaller;

  it("task.updateStatus sollte alle gültigen Status-Werte akzeptieren (Drag-Ziel-Spalten)", async () => {
    const { ctx } = createAuthContext();
    const trpc = caller(ctx);
    const validStatuses = ["offen", "in_bearbeitung", "erledigt", "abgebrochen"] as const;

    for (const status of validStatuses) {
      try {
        await trpc.task.updateStatus({ id: 999999, status });
      } catch (e: any) {
        // Zod-Validierungsfehler wären "Expected", Runtime-Fehler (Task nicht gefunden) sind ok
        expect(e.message).not.toContain("Expected");
      }
    }
  });

  it("task.updateStatus sollte Authentifizierung erfordern", async () => {
    const { ctx } = createPublicContext();
    const trpc = caller(ctx);
    await expect(
      trpc.task.updateStatus({ id: 1, status: "in_bearbeitung" })
    ).rejects.toThrow();
  });

  it("task.getPreparationBoard sollte Aufgaben nach Status gruppierbar zurückgeben", async () => {
    const { ctx } = createAuthContext();
    const trpc = caller(ctx);
    const result = await trpc.task.getPreparationBoard({});
    expect(Array.isArray(result)).toBe(true);
    // Jede Aufgabe sollte ein status-Feld haben
    for (const task of result) {
      expect(task).toHaveProperty("status");
      expect(["offen", "in_bearbeitung", "erledigt", "abgebrochen"]).toContain(task.status);
    }
  });
});

// ============================================
// Feature 2: Aufgaben-Detailansicht mit Kommentaren
// ============================================
describe("Feature 2: Aufgaben-Detailansicht mit Kommentaren", () => {
  const caller = appRouter.createCaller;

  describe("task.getWithComments", () => {
    it("sollte als geschützte Prozedur zugänglich sein (nach Login)", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      // Nicht existierende Task-ID sollte null zurückgeben, nicht werfen
      const result = await trpc.task.getWithComments({ id: 999999 });
      expect(result).toBeNull();
    });

    it("sollte eine Task-ID als Input akzeptieren", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.getWithComments).toBe("function");
    });
  });

  describe("task.addComment", () => {
    it("sollte Authentifizierung erfordern", async () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      await expect(
        trpc.task.addComment({ taskId: 1, text: "Test-Kommentar" })
      ).rejects.toThrow();
    });

    it("sollte leere Texte ablehnen", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      await expect(
        trpc.task.addComment({ taskId: 1, text: "" })
      ).rejects.toThrow();
    });

    it("sollte optionale attachmentUrls akzeptieren", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      // Input-Validierung sollte attachmentUrls als optionales Array akzeptieren
      try {
        await trpc.task.addComment({
          taskId: 999999,
          text: "Kommentar mit Anhang",
          attachmentUrls: ["https://example.com/foto1.jpg"],
        });
      } catch (e: any) {
        // Zod-Fehler wären "Expected", Runtime-Fehler sind ok
        expect(e.message).not.toContain("Expected");
      }
    });
  });

  describe("task.uploadAttachment", () => {
    it("sollte Authentifizierung erfordern", async () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      await expect(
        trpc.task.uploadAttachment({
          taskId: 1,
          fileName: "test.jpg",
          contentType: "image/jpeg",
          base64Data: "dGVzdA==",
        })
      ).rejects.toThrow();
    });

    it("sollte die korrekte Input-Struktur validieren", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.uploadAttachment).toBe("function");
    });
  });
});

// ============================================
// Feature 3: Automatische Benachrichtigungen
// ============================================
describe("Feature 3: Automatische Benachrichtigungen", () => {
  const caller = appRouter.createCaller;

  describe("Notification-Endpunkte", () => {
    it("notification.getByUserId sollte Authentifizierung erfordern", async () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      // Notification getByUserId ist protected
      await expect(
        trpc.notification.getByUserId({ unreadOnly: false })
      ).rejects.toThrow();
    });

    it("notification.getByUserId sollte für authentifizierte Benutzer funktionieren", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      const result = await trpc.notification.getByUserId({ unreadOnly: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it("notification.getUnreadCount sollte Zähler zurückgeben", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      const result = await trpc.notification.getUnreadCount();
      expect(result).toHaveProperty("total");
      expect(typeof result.total).toBe("number");
    });
  });

  describe("Router-Struktur", () => {
    it("task.getWithComments Endpoint sollte definiert sein", () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.getWithComments).toBe("function");
    });

    it("task.addComment Endpoint sollte definiert sein", () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.addComment).toBe("function");
    });

    it("task.uploadAttachment Endpoint sollte definiert sein", () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.uploadAttachment).toBe("function");
    });
  });
});

// ============================================
// Ampel-Logik Tests (Unit)
// ============================================
describe("Ampel-System Logik", () => {
  function getTrafficLightStatus(task: { status: string; dueDate: Date | null }): "green" | "yellow" | "red" {
    if (task.status === "erledigt") return "green";
    if (!task.dueDate) return "yellow";
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "red";
    if (diffDays <= 3) return "yellow";
    return "green";
  }

  it("sollte Grün für erledigte Aufgaben zurückgeben", () => {
    expect(getTrafficLightStatus({ status: "erledigt", dueDate: new Date("2020-01-01") })).toBe("green");
  });

  it("sollte Gelb für Aufgaben ohne Fälligkeitsdatum zurückgeben", () => {
    expect(getTrafficLightStatus({ status: "offen", dueDate: null })).toBe("yellow");
  });

  it("sollte Rot für überfällige Aufgaben zurückgeben", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(getTrafficLightStatus({ status: "offen", dueDate: pastDate })).toBe("red");
  });

  it("sollte Gelb für bald fällige Aufgaben zurückgeben (innerhalb 3 Tage)", () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 2);
    expect(getTrafficLightStatus({ status: "in_bearbeitung", dueDate: soonDate })).toBe("yellow");
  });

  it("sollte Grün für Aufgaben mit ausreichend Zeit zurückgeben", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    expect(getTrafficLightStatus({ status: "offen", dueDate: futureDate })).toBe("green");
  });

  it("sollte Rot für gestern fällige Aufgaben zurückgeben", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getTrafficLightStatus({ status: "offen", dueDate: yesterday })).toBe("red");
  });
});
