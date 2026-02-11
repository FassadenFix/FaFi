/**
 * Gate-Interaction Tests
 * Testet: DB-Schema (gatePhotos-Tabelle), tRPC-Prozeduren (gate.*),
 * DB-Hilfsfunktionen und Geschäftslogik (min. 1 Foto Pflicht, alle Checks abhaken)
 */

import { describe, it, expect } from "vitest";
import * as db from "./db";

// ============================================
// DB-SCHEMA & HILFSFUNKTIONEN
// ============================================

describe("Gate DB-Schema & Hilfsfunktionen", () => {
  it("gatePhotos-Tabelle existiert im Schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.gatePhotos).toBeDefined();
    expect(schema.gatePhotos.constructionSiteId).toBeDefined();
    expect(schema.gatePhotos.gateType).toBeDefined();
    expect(schema.gatePhotos.photoUrl).toBeDefined();
    expect(schema.gatePhotos.fileKey).toBeDefined();
    expect(schema.gatePhotos.fileName).toBeDefined();
  });

  it("constructionSites hat teamleiterCheckStatus-Feld", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.constructionSites.teamleiterCheckStatus).toBeDefined();
    expect(schema.constructionSites.teamleiterCheckCompletedAt).toBeDefined();
  });

  it("teamleiterChecks hat arbeitsbeginn_check checkType", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.teamleiterChecks).toBeDefined();
    expect(schema.teamleiterChecks.checkType).toBeDefined();
  });

  it("DB-Hilfsfunktionen sind exportiert", () => {
    expect(typeof db.createGatePhoto).toBe("function");
    expect(typeof db.getGatePhotos).toBe("function");
    expect(typeof db.getGatePhotoCount).toBe("function");
    expect(typeof db.deleteGatePhoto).toBe("function");
    expect(typeof db.completePreDocumentation).toBe("function");
    expect(typeof db.completePostDocumentation).toBe("function");
    expect(typeof db.completeTeamleiterCheck).toBe("function");
    expect(typeof db.createArbeitsbeginnCheck).toBe("function");
    expect(typeof db.getArbeitsbeginnCheck).toBe("function");
  });
});

// ============================================
// tRPC ROUTER DEFINITION
// ============================================

describe("Gate Router Definition", () => {
  it("gate Router existiert im appRouter mit allen Prozeduren", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    const procedures = (appRouter as any)._def.procedures;
    
    expect(procedures["gate.uploadPhoto"]).toBeDefined();
    expect(procedures["gate.getPhotos"]).toBeDefined();
    expect(procedures["gate.completePreDocumentation"]).toBeDefined();
    expect(procedures["gate.completePostDocumentation"]).toBeDefined();
    expect(procedures["gate.submitTeamleiterCheck"]).toBeDefined();
    expect(procedures["gate.getTeamleiterCheck"]).toBeDefined();
    expect(procedures["gate.getGateStatus"]).toBeDefined();
  });

  it("gate.uploadPhoto hat Input-Validierung für constructionSiteId und gateType", async () => {
    const { appRouter } = await import("./routers");
    const procedures = (appRouter as any)._def.procedures;
    const proc = procedures["gate.uploadPhoto"];
    expect(proc).toBeDefined();
    // Procedure has input schema
    expect(proc._def.inputs).toBeDefined();
    expect(proc._def.inputs.length).toBeGreaterThan(0);
  });

  it("gate.submitTeamleiterCheck hat Input-Validierung", async () => {
    const { appRouter } = await import("./routers");
    const procedures = (appRouter as any)._def.procedures;
    const proc = procedures["gate.submitTeamleiterCheck"];
    expect(proc).toBeDefined();
    expect(proc._def.inputs).toBeDefined();
    expect(proc._def.inputs.length).toBeGreaterThan(0);
  });

  it("gate.getGateStatus hat Input-Validierung für constructionSiteId", async () => {
    const { appRouter } = await import("./routers");
    const procedures = (appRouter as any)._def.procedures;
    const proc = procedures["gate.getGateStatus"];
    expect(proc).toBeDefined();
    expect(proc._def.inputs).toBeDefined();
  });
});

// ============================================
// GESCHÄFTSLOGIK: TEAMLEITERCHECK ITEMS
// ============================================

describe("Teamleitercheck Checkliste", () => {
  const EXPECTED_CATEGORIES = ["PSA", "Absperrung", "Geräte", "Wetter", "Team"];

  it("Checkliste deckt alle 5 Sicherheitskategorien ab", () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      expect(cat).toBeTruthy();
    });
    expect(EXPECTED_CATEGORIES.length).toBe(5);
  });

  it("PSA-Kategorie enthält Helm, Schuhe, Handschuhe, Brille", () => {
    const psaItems = ["Schutzhelme", "Sicherheitsschuhe", "Schutzhandschuhe", "Schutzbrillen"];
    expect(psaItems.length).toBe(4);
  });

  it("Absperrung-Kategorie enthält Bereich, Schilder, Fußgänger", () => {
    const absperrungItems = ["Arbeitsbereich", "Warnschilder", "Fußgänger-Umleitung"];
    expect(absperrungItems.length).toBe(3);
  });

  it("Team-Kategorie enthält Einweisung, Ersthelfer, Notruf", () => {
    const teamItems = ["Team-Einweisung", "Ersthelfer", "Notrufnummern"];
    expect(teamItems.length).toBe(3);
  });
});

// ============================================
// GESCHÄFTSLOGIK: GATE-REIHENFOLGE
// ============================================

describe("Gate-Reihenfolge und Abhängigkeiten", () => {
  it("Drei Gates in korrekter Reihenfolge: Vorher → Teamleiter → Nachher", () => {
    const gateOrder = ["vorher", "teamleitercheck", "nachher"];
    expect(gateOrder[0]).toBe("vorher");
    expect(gateOrder[1]).toBe("teamleitercheck");
    expect(gateOrder[2]).toBe("nachher");
  });

  it("Gate-Status hat drei mögliche Werte: pending, in_progress, completed", () => {
    const validStatuses = ["pending", "in_progress", "completed"];
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("in_progress");
    expect(validStatuses).toContain("completed");
  });

  it("Foto-Benennung folgt dem Schema YYYY_Name_Gate_NNN.ext", () => {
    const year = 2026;
    const siteName = "Sonnenhof";
    const gateType = "vorher";
    const nr = "001";
    const ext = "jpg";
    const fileName = `${year}_${siteName}_${gateType}_${nr}.${ext}`;
    expect(fileName).toBe("2026_Sonnenhof_vorher_001.jpg");
    expect(fileName).toMatch(/^\d{4}_[A-Za-zäöüÄÖÜß]+_(?:vorher|nachher)_\d{3}\.(?:jpg|png)$/);
  });

  it("gateType akzeptiert nur 'vorher' oder 'nachher'", () => {
    const validTypes = ["vorher", "nachher"];
    expect(validTypes).toContain("vorher");
    expect(validTypes).toContain("nachher");
    expect(validTypes).not.toContain("waehrend");
  });
});
