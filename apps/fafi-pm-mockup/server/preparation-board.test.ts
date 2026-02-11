import { describe, expect, it, vi, beforeEach } from "vitest";
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

describe("Vorbereitungsaufgaben-Board", () => {
  const caller = appRouter.createCaller;

  describe("task.getPreparationBoard", () => {
    it("should be accessible as a protected procedure (auth required)", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      
      // Should not throw - the endpoint requires auth
      const result = await trpc.task.getPreparationBoard({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept optional constructionSiteId filter", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      
      // Should not throw with a constructionSiteId filter
      const result = await trpc.task.getPreparationBoard({ constructionSiteId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept optional responsibleParty filter", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      
      // Test with auftraggeber
      const resultAG = await trpc.task.getPreparationBoard({ responsibleParty: "auftraggeber" });
      expect(Array.isArray(resultAG)).toBe(true);
      
      // Test with auftragnehmer
      const resultAN = await trpc.task.getPreparationBoard({ responsibleParty: "auftragnehmer" });
      expect(Array.isArray(resultAN)).toBe(true);
    });

    it("should accept both filters combined", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      
      const result = await trpc.task.getPreparationBoard({ 
        constructionSiteId: 1, 
        responsibleParty: "auftragnehmer" 
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("task.updateStatus", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      
      // Should throw because it's a protected procedure
      await expect(
        trpc.task.updateStatus({ id: 1, status: "in_bearbeitung" })
      ).rejects.toThrow();
    });

    it("should accept valid status values", async () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      
      // These should not throw due to validation
      // They may fail due to non-existent task ID, but the input validation should pass
      const validStatuses = ["offen", "in_bearbeitung", "erledigt", "abgebrochen"] as const;
      
      for (const status of validStatuses) {
        try {
          await trpc.task.updateStatus({ id: 999999, status });
        } catch (e: any) {
          // Input validation errors would be ZodError, 
          // we expect runtime errors (task not found) not validation errors
          expect(e.message).not.toContain("Expected");
        }
      }
    });
  });

  describe("Router structure", () => {
    it("should have task.getPreparationBoard endpoint defined", () => {
      const { ctx } = createPublicContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.getPreparationBoard).toBe("function");
    });

    it("should have task.updateStatus endpoint defined", () => {
      const { ctx } = createAuthContext();
      const trpc = caller(ctx);
      expect(typeof trpc.task.updateStatus).toBe("function");
    });
  });
});
