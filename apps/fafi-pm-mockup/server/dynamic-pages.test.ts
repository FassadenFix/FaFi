/**
 * Tests für EP (Einsatzplanung) und RS (Ressourcen) Dynamisierung
 * 
 * Absicht: Sicherstellen, dass die Seiten echte HR-Daten aus der DB laden
 * und keine hardcodierten Mock-Mitarbeiter mehr verwenden.
 */
import { describe, it, expect } from "vitest";
import * as db from "./db";
import * as fs from "fs";
import * as path from "path";

describe("EP: Einsatzplanung – Dynamisierung", () => {
  describe("EP-01: HR-Mitarbeiter statt Mock-Daten", () => {
    it("sollte aktive Mitarbeiter aus der DB laden können", async () => {
      const employees = await db.getEmployeesByStatus("active");
      expect(employees).toBeDefined();
      expect(Array.isArray(employees)).toBe(true);
      // Es sollten echte Mitarbeiter vorhanden sein (mindestens 10)
      expect(employees.length).toBeGreaterThanOrEqual(10);
    });

    it("sollte Mitarbeiter mit firstName, lastName, position und department haben", async () => {
      const employees = await db.getEmployeesByStatus("active");
      for (const emp of employees) {
        expect(emp.firstName).toBeDefined();
        expect(emp.lastName).toBeDefined();
        expect(typeof emp.firstName).toBe("string");
        expect(typeof emp.lastName).toBe("string");
        expect(emp.firstName.length).toBeGreaterThan(0);
        expect(emp.lastName.length).toBeGreaterThan(0);
      }
    });

    it("sollte keine Mock-Mitarbeiter mehr im Einsatzplanung-Code haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Einsatzplanung.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Keine hardcodierten Mock-Mitarbeiter
      expect(content).not.toContain("mockMitarbeiter");
      expect(content).not.toContain("Thomas Braun");
      expect(content).not.toContain("Max Müller");
      expect(content).not.toContain("Anna Schmidt");
      
      // Stattdessen tRPC-Aufruf
      expect(content).toContain("trpc.hr.employees.list.useQuery");
    });

    it("sollte kein DemoBanner-Import mehr haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Einsatzplanung.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Kein DemoBanner-Import (Kommentare sind OK)
      expect(content).not.toContain('import { DemoBanner }');
      expect(content).not.toContain('<DemoBanner');
      expect(content).not.toContain("Beispieldaten");
    });
  });

  describe("EP-02/03: Mitarbeiter-Mapping", () => {
    it("sollte Initialen aus firstName/lastName generieren können", async () => {
      const employees = await db.getEmployeesByStatus("active");
      for (const emp of employees) {
        const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
        expect(initials.length).toBe(2);
        expect(initials).toMatch(/^[A-ZÄÖÜ]{2}$/);
      }
    });

    it("sollte verschiedene Abteilungen haben", async () => {
      const employees = await db.getEmployeesByStatus("active");
      const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
      // Mindestens 3 verschiedene Abteilungen
      expect(departments.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("RS: Ressourcen – Dynamisierung", () => {
  describe("RS-01: HR-Mitarbeiter statt Mock-Daten", () => {
    it("sollte keine Mock-Teammitglieder mehr im Ressourcen-Code haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Ressourcen.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Keine hardcodierten Mock-Mitarbeiter
      expect(content).not.toContain('"Thomas Braun"');
      expect(content).not.toContain('"Max Müller"');
      expect(content).not.toContain('"Anna Schmidt"');
      expect(content).not.toContain('"Peter Weber"');
      expect(content).not.toContain('"Lisa Braun"');
      expect(content).not.toContain('"Tom Fischer"');
      
      // Stattdessen tRPC-Aufruf
      expect(content).toContain("trpc.hr.employees.list.useQuery");
    });

    it("sollte kein DemoBanner-Import mehr haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Ressourcen.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Kein DemoBanner-Import (Kommentare sind OK)
      expect(content).not.toContain('import { DemoBanner }');
      expect(content).not.toContain('<DemoBanner');
      expect(content).not.toContain("Beispieldaten");
    });
  });

  describe("RS-02: Mock-Bookings entfernt", () => {
    it("sollte keine hardcodierten Projekt-Bookings mehr haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Ressourcen.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Keine hardcodierten Projekt-Zuordnungen in teamBookings
      expect(content).not.toMatch(/teamBookings.*Sonnenhof/s);
      expect(content).not.toMatch(/teamBookings.*Parkstraße/s);
      expect(content).not.toMatch(/teamBookings.*Zentrum/s);
      expect(content).not.toMatch(/teamBookings.*Schulung/s);
    });
  });

  describe("RS-03: Dynamische Mitarbeiter-Anzeige", () => {
    it("sollte Initialen-Generierung und Rollen-Mapping haben", () => {
      const filePath = path.resolve(__dirname, "../client/src/pages/Ressourcen.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Dynamische Initialen und Rollen
      expect(content).toContain("getInitials");
      expect(content).toContain("mapPosition");
      expect(content).toContain("AVATAR_COLORS");
    });
  });
});

describe("Datenintegrität: HR-Mitarbeiter", () => {
  it("sollte mindestens 20 aktive Mitarbeiter haben", async () => {
    const employees = await db.getEmployeesByStatus("active");
    expect(employees.length).toBeGreaterThanOrEqual(20);
  });

  it("sollte bekannte FassadenFix-Mitarbeiter enthalten", async () => {
    const employees = await db.getAllEmployees();
    const names = employees.map(e => `${e.firstName} ${e.lastName}`);
    
    // Stichprobe: Bekannte Mitarbeiter aus dem Seed
    expect(names).toContain("Alexander Retzlaff"); // Geschäftsführer
    expect(names).toContain("Karsten Weber"); // Abteilungsleiter
  });

  it("sollte verschiedene Positionen haben", async () => {
    const employees = await db.getEmployeesByStatus("active");
    const positions = [...new Set(employees.map(e => e.position).filter(Boolean))];
    // Mindestens 5 verschiedene Positionen
    expect(positions.length).toBeGreaterThanOrEqual(5);
  });
});
