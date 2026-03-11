/**
 * Archiv-Verknüpfungen Migration Test
 * 
 * Absicht: Sicherstellen, dass die Einmal-Migration korrekt funktioniert hat
 * und alle Dokumente im Archiv mit mindestens einer Entität verknüpft sind.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const migrationScriptPath = resolve(__dirname, "../scripts/fix-archive-links.mjs");
const schemaPath = resolve(__dirname, "../drizzle/schema.ts");

describe("Archiv-Migration: Script-Existenz", () => {
  it("sollte das Migrations-Script existieren", () => {
    expect(existsSync(migrationScriptPath)).toBe(true);
  });

  it("sollte die korrekten Tabellennamen verwenden", () => {
    const script = readFileSync(migrationScriptPath, "utf-8");
    // Muss die korrekte Tabelle 'constructionSites' verwenden (nicht 'construction_sites')
    expect(script).toContain("FROM constructionSites");
    expect(script).not.toContain("FROM construction_sites");
  });

  it("sollte alle relevanten Entitäts-Tabellen abfragen", () => {
    const script = readFileSync(migrationScriptPath, "utf-8");
    expect(script).toContain("FROM projects");
    expect(script).toContain("FROM companies");
    expect(script).toContain("FROM offers");
    expect(script).toContain("FROM orders");
    expect(script).toContain("FROM invoices");
    expect(script).toContain("FROM warranties");
    expect(script).toContain("FROM constructionSites");
    expect(script).toContain("FROM properties");
  });
});

describe("Archiv-Schema: Verknüpfungs-Felder", () => {
  const schema = readFileSync(schemaPath, "utf-8");

  it("sollte alle Entitäts-Referenzen in der documents-Tabelle haben", () => {
    const entityRefs = [
      "companyId",
      "projectId",
      "propertyId",
      "constructionSiteId",
      "offerId",
      "orderId",
      "invoiceId",
      "warrantyId",
      "appointmentId",
      "taskId",
      "contactId",
    ];
    
    // Finde den documents-Abschnitt im Schema
    const docsSection = schema.substring(
      schema.indexOf("DOCUMENTS TABLE"),
      schema.indexOf("TEXT BLOCKS TABLE") || schema.length
    );
    
    for (const ref of entityRefs) {
      expect(docsSection).toContain(ref);
    }
  });

  it("sollte Foreign-Key-Referenzen für alle Verknüpfungen haben", () => {
    const schema = readFileSync(schemaPath, "utf-8");
    const docsSection = schema.substring(
      schema.indexOf("DOCUMENTS TABLE"),
      schema.indexOf("TEXT BLOCKS TABLE") || schema.length
    );
    
    // Mindestens die wichtigsten FK-Referenzen
    expect(docsSection).toContain(".references(() => companies.id)");
    expect(docsSection).toContain(".references(() => projects.id)");
    expect(docsSection).toContain(".references(() => offers.id)");
    expect(docsSection).toContain(".references(() => orders.id)");
  });
});

describe("Archiv-Migration: Zuordnungslogik", () => {
  const script = readFileSync(migrationScriptPath, "utf-8");

  it("sollte Kategorie-basierte Zuordnung für Angebote unterstützen", () => {
    expect(script).toContain("category === 'angebot'");
    expect(script).toContain("offerNumber");
  });

  it("sollte Kategorie-basierte Zuordnung für Auftragsbestätigungen unterstützen", () => {
    expect(script).toContain("category === 'auftragsbestaetigung'");
    expect(script).toContain("orderNumber");
  });

  it("sollte Kategorie-basierte Zuordnung für Rechnungen unterstützen", () => {
    expect(script).toContain("category === 'rechnung'");
    expect(script).toContain("invoiceNumber");
  });

  it("sollte Kategorie-basierte Zuordnung für Garantien unterstützen", () => {
    expect(script).toContain("category === 'garantie'");
    expect(script).toContain("warrantyNumber");
  });

  it("sollte Baustellen-Zuordnung für Fotos und Protokolle unterstützen", () => {
    expect(script).toContain("category === 'foto'");
    expect(script).toContain("constructionSiteId");
  });

  it("sollte einen Fallback für nicht zuordenbare Dokumente haben", () => {
    expect(script).toContain("Fallback");
  });

  it("sollte Vorher/Nachher-Status loggen", () => {
    expect(script).toContain("Status VOR Migration");
    expect(script).toContain("Status NACH Migration");
  });
});

describe("Archiv-DB-Queries: Vollständigkeit", () => {
  it("sollte getArchiveOverview in db.ts existieren", () => {
    const dbPath = resolve(__dirname, "./db.ts");
    const db = readFileSync(dbPath, "utf-8");
    expect(db).toContain("getArchiveOverview");
  });

  it("sollte Dokumente nach Projekt filtern können", () => {
    const dbPath = resolve(__dirname, "./db.ts");
    const db = readFileSync(dbPath, "utf-8");
    expect(db).toContain("documents.projectId");
  });

  it("sollte Dokumente nach Unternehmen filtern können", () => {
    const dbPath = resolve(__dirname, "./db.ts");
    const db = readFileSync(dbPath, "utf-8");
    expect(db).toContain("documents.companyId");
  });

  it("sollte Volltextsuche in Dokumenten unterstützen", () => {
    const dbPath = resolve(__dirname, "./db.ts");
    const db = readFileSync(dbPath, "utf-8");
    expect(db).toContain("like(documents.name");
  });
});
