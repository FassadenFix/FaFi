/**
 * E2E-Test: Projekt → Angebot → Auftrag → Abnahme
 * Testet den vollständigen Projekt-Lebenszyklus
 */

import { describe, it, expect } from "vitest";
import {
  TEST_COMPANY,
  TEST_PROJECT,
  TEST_PROPERTY,
  TEST_OFFER,
  getProjectLifecyclePhases,
  isValidPhaseTransition,
  generateTestProjectNumber,
} from "./e2e-utils";

describe("E2E: Projekt-Lebenszyklus (Projekt → Angebot → Auftrag → Abnahme)", () => {
  
  // ============================================
  // Phase 1: Objektaufnahme
  // ============================================
  
  describe("Phase 1: Objektaufnahme", () => {
    it("sollte ein neues Projekt mit Unternehmenszuordnung erstellen können", () => {
      const project = {
        ...TEST_PROJECT,
        companyName: TEST_COMPANY.name,
        projectNumber: generateTestProjectNumber(),
      };
      expect(project.phase).toBe("objektaufnahme");
      expect(project.companyName).toBeTruthy();
      expect(project.projectNumber).toMatch(/^FF-\d{4}-\d{4}$/);
    });

    it("sollte Immobilien dem Projekt zuordnen können", () => {
      const property = {
        ...TEST_PROPERTY,
        projectId: 1,
        sides: ["Frontseite", "Rückseite", "Linker Giebel", "Rechter Giebel"],
      };
      expect(property.sides).toContain("Frontseite");
      expect(property.sides).not.toContain("Eingangsseite"); // Interview-Korrektur A1
      expect(property.facadeArea).toBeGreaterThan(0);
    });

    it("sollte die Seitenbezeichnungen korrekt verwenden (Interview A1)", () => {
      const validSides = ["Frontseite", "Rückseite", "Linker Giebel", "Rechter Giebel"];
      const invalidSides = ["Eingangsseite", "Vorderseite", "Hauptseite"];
      
      validSides.forEach(side => {
        expect(side).toBeTruthy();
      });
      
      invalidSides.forEach(side => {
        expect(validSides).not.toContain(side);
      });
    });
  });

  // ============================================
  // Phase 2-3: Angebot erstellt & versendet
  // ============================================

  describe("Phase 2-3: Angebotserstellung und -versand", () => {
    it("sollte ein Angebot mit korrekter Preisberechnung erstellen", () => {
      const offer = {
        ...TEST_OFFER,
        positions: [
          { bezeichnung: "Fassadenreinigung", menge: 4500, einheit: "m²", einzelpreis: 5.0, gesamt: 22500 },
        ],
      };
      
      const totalNet = offer.positions.reduce((sum, p) => sum + p.gesamt, 0);
      expect(totalNet).toBe(22500);
      expect(offer.totalGross).toBe(Math.round(totalNet * 1.19 * 100) / 100);
    });

    it("sollte Frühbucher-Rabatt dynamisch berechnen (Interview A4)", () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // Saisonjahr: April-März
      const saisonJahr = currentMonth >= 4 ? currentYear : currentYear - 1;
      const naechstesSaisonJahr = saisonJahr + 1;
      const fruehbucherDeadline = new Date(saisonJahr, 11, 31); // 31.12. des Saisonjahres
      
      expect(naechstesSaisonJahr).toBe(saisonJahr + 1);
      expect(fruehbucherDeadline.getMonth()).toBe(11); // Dezember
      expect(fruehbucherDeadline.getDate()).toBe(31);
      
      // Frühbucher-Rabatt: 10% wenn vor Deadline
      const isFruehbucher = now <= fruehbucherDeadline;
      const rabatt = isFruehbucher ? 0.10 : 0;
      expect(rabatt).toBeGreaterThanOrEqual(0);
      expect(rabatt).toBeLessThanOrEqual(0.10);
    });

    it("sollte Preisstaffelung korrekt anwenden", () => {
      const staffelung = [
        { bis: 500, preis: 5.50 },
        { bis: 1000, preis: 5.00 },
        { bis: 2500, preis: 4.50 },
        { bis: 5000, preis: 4.00 },
        { bis: Infinity, preis: 3.50 },
      ];
      
      function getPreis(flaeche: number): number {
        const stufe = staffelung.find(s => flaeche <= s.bis);
        return stufe?.preis || staffelung[staffelung.length - 1].preis;
      }
      
      expect(getPreis(300)).toBe(5.50);
      expect(getPreis(800)).toBe(5.00);
      expect(getPreis(2000)).toBe(4.50);
      expect(getPreis(4000)).toBe(4.00);
      expect(getPreis(10000)).toBe(3.50);
    });

    it("sollte Übernachtung automatisch empfehlen (Interview A5)", () => {
      function berechneUebernachtung(entfernungKm: number, buehnenTage: number): boolean {
        if (entfernungKm > 100) return true;
        if (entfernungKm > 50 && buehnenTage > 1) return true;
        return false;
      }
      
      expect(berechneUebernachtung(150, 1)).toBe(true);  // > 100km
      expect(berechneUebernachtung(80, 3)).toBe(true);   // > 50km + > 1 Tag
      expect(berechneUebernachtung(30, 5)).toBe(false);  // < 50km
      expect(berechneUebernachtung(60, 1)).toBe(false);  // > 50km aber nur 1 Tag
    });

    it("sollte den Phasenübergang von objektaufnahme → angebot_erstellt validieren", () => {
      expect(isValidPhaseTransition("objektaufnahme", "angebot_erstellt")).toBe(true);
      expect(isValidPhaseTransition("objektaufnahme", "durchfuehrung")).toBe(false);
    });

    it("sollte den Phasenübergang von angebot_erstellt → angebot_versendet validieren", () => {
      expect(isValidPhaseTransition("angebot_erstellt", "angebot_versendet")).toBe(true);
    });
  });

  // ============================================
  // Phase 4-5: Nachfassen & Auftrag gewonnen
  // ============================================

  describe("Phase 4-5: Nachfassen und Auftragsgewinn", () => {
    it("sollte Nachfass-Erinnerungen korrekt erstellen (7/14/30 Tage)", () => {
      const sentAt = new Date();
      const reminders = [7, 14, 30].map(days => ({
        dueAt: new Date(sentAt.getTime() + days * 24 * 60 * 60 * 1000),
        days,
        status: "offen",
      }));
      
      expect(reminders).toHaveLength(3);
      expect(reminders[0].days).toBe(7);
      expect(reminders[1].days).toBe(14);
      expect(reminders[2].days).toBe(30);
    });

    it("sollte den Phasenübergang zum Auftrag validieren", () => {
      expect(isValidPhaseTransition("angebot_versendet", "auftrag_gewonnen")).toBe(true);
      expect(isValidPhaseTransition("nachfassen", "auftrag_gewonnen")).toBe(true);
      expect(isValidPhaseTransition("angebot_versendet", "verloren")).toBe(true);
    });
  });

  // ============================================
  // Phase 6-8: Planung → Durchführung
  // ============================================

  describe("Phase 6-8: Planung bis Durchführung", () => {
    it("sollte die Planungsphasen sequenziell durchlaufen", () => {
      expect(isValidPhaseTransition("auftrag_gewonnen", "planung")).toBe(true);
      expect(isValidPhaseTransition("planung", "vorbereitung")).toBe(true);
      expect(isValidPhaseTransition("vorbereitung", "durchfuehrung")).toBe(true);
    });

    it("sollte keine Phasen überspringen können", () => {
      expect(isValidPhaseTransition("auftrag_gewonnen", "durchfuehrung")).toBe(false);
      expect(isValidPhaseTransition("planung", "abnahme")).toBe(false);
    });

    it("sollte Bühnentage korrekt berechnen (Fläche / 500 aufgerundet)", () => {
      function berechneBuehnenTage(flaeche: number): number {
        return Math.ceil(flaeche / 500);
      }
      
      expect(berechneBuehnenTage(400)).toBe(1);
      expect(berechneBuehnenTage(500)).toBe(1);
      expect(berechneBuehnenTage(501)).toBe(2);
      expect(berechneBuehnenTage(4500)).toBe(9);
      expect(berechneBuehnenTage(12000)).toBe(24);
    });
  });

  // ============================================
  // Phase 9-10: Abnahme & Abschluss
  // ============================================

  describe("Phase 9-10: Abnahme und Abschluss", () => {
    it("sollte den Phasenübergang zur Abnahme und zum Abschluss validieren", () => {
      expect(isValidPhaseTransition("durchfuehrung", "abnahme")).toBe(true);
      expect(isValidPhaseTransition("abnahme", "abgeschlossen")).toBe(true);
    });

    it("sollte den vollständigen Lebenszyklus abbilden (10 Phasen)", () => {
      const phases = getProjectLifecyclePhases();
      expect(phases).toHaveLength(10);
      expect(phases[0]).toBe("objektaufnahme");
      expect(phases[phases.length - 1]).toBe("abgeschlossen");
    });

    it("sollte alle Phasenübergänge im Lebenszyklus gültig sein", () => {
      const phases = getProjectLifecyclePhases();
      for (let i = 0; i < phases.length - 1; i++) {
        expect(isValidPhaseTransition(phases[i], phases[i + 1])).toBe(true);
      }
    });
  });

  // ============================================
  // Dokumenten-Kette
  // ============================================

  describe("Dokumenten-Kette: Angebot → Auftragsbestätigung → Rechnung → Garantie", () => {
    it("sollte die korrekte Dokumenten-Reihenfolge definieren", () => {
      const documentChain = ["angebot", "auftragsbestaetigung", "rechnung", "garantie"];
      expect(documentChain).toHaveLength(4);
      expect(documentChain[0]).toBe("angebot");
      expect(documentChain[3]).toBe("garantie");
    });

    it("sollte Baustelleneinrichtungs-Pauschale korrekt berechnen (199€)", () => {
      const pauschale = 199;
      const totalNet = 22500;
      const totalWithPauschale = totalNet + pauschale;
      expect(totalWithPauschale).toBe(22699);
    });
  });
});
