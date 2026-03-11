/**
 * M-13: Rollenbasierte Tests
 * 
 * Prüft, dass alle 5 FaFi-Rollen korrekt definiert und in der UI berücksichtigt sind.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const FAFI_ROLES = ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"];

describe("M-13: Rollen-Definition", () => {
  const schemaContent = readFileSync(resolve(__dirname, "../drizzle/schema.ts"), "utf-8");

  it("sollte fafiRole-Enum in der users-Tabelle haben", () => {
    expect(schemaContent).toContain("fafiRole");
  });

  it("sollte alle 5 FaFi-Rollen im Schema definiert haben", () => {
    for (const role of FAFI_ROLES) {
      expect(schemaContent, `Rolle '${role}' fehlt im Schema`).toContain(`"${role}"`);
    }
  });

  it("sollte admin/user Basis-Rollen haben", () => {
    expect(schemaContent).toContain('"admin"');
    expect(schemaContent).toContain('"user"');
  });
});

describe("M-13: Rollenbasierte Sidebar-Navigation", () => {
  const layoutContent = readFileSync(resolve(__dirname, "../client/src/components/DashboardLayout.tsx"), "utf-8");

  it("sollte rollenbasierte Menüpunkte haben", () => {
    expect(layoutContent).toContain("roles:");
  });

  it("sollte Rollen-Filterung in der Sidebar implementiert haben", () => {
    // Prüfe ob Rollen-Array in Navigation-Items verwendet wird
    let roleFilterCount = 0;
    for (const role of FAFI_ROLES) {
      if (layoutContent.includes(`'${role}'`)) roleFilterCount++;
    }
    expect(roleFilterCount).toBeGreaterThan(2);
  });
});

describe("M-13: Rollenbasierte Router-Prozeduren", () => {
  const routerContent = readFileSync(resolve(__dirname, "routers.ts"), "utf-8");

  it("sollte protectedProcedure für geschützte Routen verwenden", () => {
    const protectedCount = (routerContent.match(/protectedProcedure/g) || []).length;
    expect(protectedCount).toBeGreaterThan(10);
  });

  it("sollte publicProcedure für öffentliche Routen verwenden", () => {
    const publicCount = (routerContent.match(/publicProcedure/g) || []).length;
    expect(publicCount).toBeGreaterThan(0);
  });

  it("sollte ctx.user für Benutzer-Kontext verwenden", () => {
    expect(routerContent).toContain("ctx.user");
  });
});

describe("M-13: Kundenportal-Rollen", () => {
  it("sollte Token-basiertes Portal-Auth haben", () => {
    const portalPath = resolve(__dirname, "../client/src/pages/CustomerPortal.tsx");
    expect(existsSync(portalPath)).toBe(true);
    const content = readFileSync(portalPath, "utf-8");
    expect(content).toContain("token");
  });

  it("sollte Portal-Token-Tabelle im Schema haben", () => {
    const schemaContent = readFileSync(resolve(__dirname, "../drizzle/schema.ts"), "utf-8");
    expect(schemaContent).toContain("customerPortalTokens");
  });
});
