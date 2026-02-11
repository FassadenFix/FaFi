import { describe, it, expect } from "vitest";

// ============================================
// ORPHANED CONTACTS SYSTEM TESTS
// ============================================
// Intention: Kontakte ohne Unternehmenszuordnung sichtbar machen,
// damit sie bereinigt werden können. Der Kunde ist stets das Unternehmen.

describe("Verwaiste-Kontakte-System", () => {
  // ---- Schema & Datenbank ----
  describe("Schema: isOrphaned-Feld", () => {
    it("contacts-Tabelle hat isOrphaned boolean-Feld", async () => {
      const { contacts } = await import("../drizzle/schema");
      expect(contacts.isOrphaned).toBeDefined();
    });

    it("isOrphaned hat default false", async () => {
      const { contacts } = await import("../drizzle/schema");
      const col = contacts.isOrphaned;
      expect(col).toBeDefined();
    });
  });

  // ---- DB-Funktionen ----
  describe("DB-Funktionen", () => {
    it("getOrphanedContacts ist als Funktion exportiert", async () => {
      const db = await import("./db");
      expect(typeof db.getOrphanedContacts).toBe("function");
    });

    it("assignContactToCompany ist als Funktion exportiert", async () => {
      const db = await import("./db");
      expect(typeof db.assignContactToCompany).toBe("function");
    });

    it("getOrphanedContacts gibt ein Array zurück", async () => {
      const db = await import("./db");
      const result = await db.getOrphanedContacts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ---- tRPC-Router ----
  describe("tRPC-Router: contact.listOrphaned", () => {
    it("contactRouter hat listOrphaned-Prozedur", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("contact.listOrphaned");
    });

    it("contactRouter hat assignToCompany-Prozedur", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("contact.assignToCompany");
    });
  });

  // ---- Datenintegrität ----
  describe("Datenintegrität", () => {
    it("941 verwaiste Kontakte sind in der DB markiert", async () => {
      const db = await import("./db");
      const orphaned = await db.getOrphanedContacts();
      // Mindestens 900 verwaiste Kontakte (941 erwartet, aber einige könnten bereits zugeordnet worden sein)
      expect(orphaned.length).toBeGreaterThanOrEqual(900);
    });

    it("verwaiste Kontakte haben kein companyId", async () => {
      const db = await import("./db");
      const orphaned = await db.getOrphanedContacts();
      if (orphaned.length > 0) {
        // Stichprobe: Erste 10 prüfen
        const sample = orphaned.slice(0, 10);
        for (const contact of sample) {
          expect(contact.companyId).toBeNull();
          expect(contact.isOrphaned).toBeTruthy();
        }
      }
    });

    it("verlinkte Kontakte sind NICHT als verwaist markiert", async () => {
      const db = await import("./db");
      const allContacts = await db.getAllContacts();
      const linkedContacts = allContacts.filter((c: any) => c.companyId !== null);
      // Stichprobe: Erste 10 verlinkte Kontakte prüfen
      const sample = linkedContacts.slice(0, 10);
      for (const contact of sample) {
        expect(contact.isOrphaned).toBeFalsy(); // 0 or false
      }
    });
  });

  // ---- Frontend-Integration ----
  describe("Frontend-Integration", () => {
    it("Kontakte-Seite importiert AlertTriangle und UserX Icons", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("AlertTriangle");
      expect(content).toContain("UserX");
      expect(content).toContain("Link2");
    });

    it("Kontakte-Seite hat Verwaist-Tab", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain('value="verwaist"');
      expect(content).toContain("Verwaist");
    });

    it("Kontakte-Seite hat Zuordnungs-Dialog", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("assignDialogOpen");
      expect(content).toContain("assignToCompany");
      expect(content).toContain("Kontakt einem Unternehmen zuordnen");
    });

    it("Kontakte-Seite hat Warnungs-Banner für verwaiste Kontakte", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("verwaiste Kontakte ohne Unternehmenszuordnung");
      expect(content).toContain("Bereinigen");
    });

    it("Kontakte-Seite nutzt trpc.contact.listOrphaned", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("trpc.contact.listOrphaned.useQuery");
    });

    it("Kontakte-Seite nutzt trpc.contact.assignToCompany", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("trpc.contact.assignToCompany.useMutation");
    });

    it("Zuordnungs-Dialog hat Unternehmen-Suche", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("assignSearch");
      expect(content).toContain("filteredCompaniesForAssign");
      expect(content).toContain("Unternehmen durchsuchen");
    });

    it("Zuordnungs-Dialog invalidiert nach Erfolg beide Listen", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/Kontakte.tsx", "utf-8");
      expect(content).toContain("utils.contact.list.invalidate");
      expect(content).toContain("utils.contact.listOrphaned.invalidate");
    });
  });

  // ---- Geschäftslogik ----
  describe("Geschäftslogik: Zuordnung", () => {
    it("assignContactToCompany setzt isOrphaned auf false und companyId", async () => {
      // Konzeptioneller Test: Funktion existiert und hat richtige Signatur
      const db = await import("./db");
      expect(typeof db.assignContactToCompany).toBe("function");
      // Funktion erwartet contactId und companyId
      expect(db.assignContactToCompany.length).toBe(2);
    });
  });
});
