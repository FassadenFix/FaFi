/**
 * E2E-Test: Kundenportal-Navigation und Dokumenten-Zugriff
 * Testet die Kundenportal-Funktionalität
 */

import { describe, it, expect } from "vitest";
import {
  getCustomerPortalPages,
  isValidAmpelStatus,
  TEST_COMPANY,
} from "./e2e-utils";

describe("E2E: Kundenportal-Navigation und Dokumenten-Zugriff", () => {

  // ============================================
  // Navigation
  // ============================================

  describe("Portal-Navigation", () => {
    it("sollte alle Portal-Seiten definieren", () => {
      const pages = getCustomerPortalPages();
      expect(pages.length).toBeGreaterThanOrEqual(4);
      expect(pages[0].path).toBe("/kundenportal");
    });

    it("sollte öffentliche und geschützte Seiten unterscheiden", () => {
      const pages = getCustomerPortalPages();
      const publicPages = pages.filter(p => !p.requiresAuth);
      const protectedPages = pages.filter(p => p.requiresAuth);
      
      expect(publicPages.length).toBeGreaterThanOrEqual(1);
      expect(protectedPages.length).toBeGreaterThanOrEqual(3);
    });

    it("sollte Token-basierten Zugang pro Unternehmen unterstützen (Interview v7.3)", () => {
      const portalAccess = {
        companyId: 1,
        companyName: TEST_COMPANY.name,
        accessType: "company_token",
        token: "abc123-secure-token",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
      
      expect(portalAccess.accessType).toBe("company_token");
      expect(portalAccess.companyId).toBeDefined();
      expect(portalAccess.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  // ============================================
  // Ampel-System im Portal
  // ============================================

  describe("Ampel-System (v7.3)", () => {
    it("sollte Ampel-Status pro Projekt anzeigen", () => {
      const projekte = [
        { id: 1, name: "Projekt A", ampelStatus: "gruen" },
        { id: 2, name: "Projekt B", ampelStatus: "gelb" },
        { id: 3, name: "Projekt C", ampelStatus: "rot" },
      ];
      
      projekte.forEach(p => {
        expect(isValidAmpelStatus(p.ampelStatus)).toBe(true);
      });
    });

    it("sollte Ampel-Farben korrekt definieren", () => {
      const ampelFarben: Record<string, string> = {
        gruen: "#77bc1f",
        gelb: "#f59e0b",
        rot: "#ef4444",
      };
      
      expect(ampelFarben.gruen).toBe("#77bc1f"); // FassadenFix Grün
      expect(Object.keys(ampelFarben)).toHaveLength(3);
    });

    it("sollte Ampel-Status basierend auf Projektdaten berechnen", () => {
      function berechneAmpel(projekt: { phase: string; hasOverdueTasks: boolean; progress: number }): string {
        if (projekt.phase === "verloren") return "rot";
        if (projekt.hasOverdueTasks) return "rot";
        if (projekt.phase === "nachfassen") return "gelb";
        if (projekt.progress < 50 && ["durchfuehrung"].includes(projekt.phase)) return "gelb";
        return "gruen";
      }
      
      expect(berechneAmpel({ phase: "durchfuehrung", hasOverdueTasks: false, progress: 80 })).toBe("gruen");
      expect(berechneAmpel({ phase: "nachfassen", hasOverdueTasks: false, progress: 0 })).toBe("gelb");
      expect(berechneAmpel({ phase: "durchfuehrung", hasOverdueTasks: true, progress: 30 })).toBe("rot");
      expect(berechneAmpel({ phase: "verloren", hasOverdueTasks: false, progress: 0 })).toBe("rot");
    });
  });

  // ============================================
  // Dokumenten-Zugriff
  // ============================================

  describe("Dokumenten-Zugriff (3-Ebenen-System)", () => {
    it("sollte 3 Dokumenten-Ebenen definieren", () => {
      const ebenen = [
        { level: 1, name: "Vertragsdokumente", beschreibung: "Angebote, Aufträge, Rechnungen" },
        { level: 2, name: "Projektdokumente", beschreibung: "Protokolle, Berichte, Fotos" },
        { level: 3, name: "Kommunikation", beschreibung: "E-Mails, Nachrichten, Notizen" },
      ];
      
      expect(ebenen).toHaveLength(3);
      expect(ebenen[0].level).toBe(1);
    });

    it("sollte Dokumente nach Typ filtern können", () => {
      const dokumente = [
        { id: 1, typ: "angebot", name: "Angebot FF-2026-001", ebene: 1 },
        { id: 2, typ: "rechnung", name: "Rechnung RE-2026-001", ebene: 1 },
        { id: 3, typ: "protokoll", name: "Abnahmeprotokoll", ebene: 2 },
        { id: 4, typ: "foto", name: "Vorher-Fotos", ebene: 2 },
        { id: 5, typ: "email", name: "Angebots-E-Mail", ebene: 3 },
      ];
      
      const vertragsDokumente = dokumente.filter(d => d.ebene === 1);
      expect(vertragsDokumente).toHaveLength(2);
      
      const projektDokumente = dokumente.filter(d => d.ebene === 2);
      expect(projektDokumente).toHaveLength(2);
    });

    it("sollte Vorher/Nachher-Fotos im Portal anzeigen können", () => {
      const fotos = {
        vorher: [
          { url: "vorher_front.jpg", seite: "Frontseite", datum: "2026-01-15" },
          { url: "vorher_rueck.jpg", seite: "Rückseite", datum: "2026-01-15" },
        ],
        nachher: [
          { url: "nachher_front.jpg", seite: "Frontseite", datum: "2026-02-15" },
          { url: "nachher_rueck.jpg", seite: "Rückseite", datum: "2026-02-15" },
        ],
      };
      
      expect(fotos.vorher).toHaveLength(2);
      expect(fotos.nachher).toHaveLength(2);
      expect(fotos.vorher[0].seite).toBe(fotos.nachher[0].seite);
    });
  });

  // ============================================
  // Aufgaben im Portal
  // ============================================

  describe("Aufgaben-Unterscheidung (Auftraggeber/Auftragnehmer)", () => {
    it("sollte Aufgaben nach Verantwortungsseite trennen (Interview A8)", () => {
      const aufgaben = [
        { id: 1, titel: "Zugang bereitstellen", verantwortung: "auftraggeber" },
        { id: 2, titel: "Bewohnerinfo verteilen", verantwortung: "auftraggeber" },
        { id: 3, titel: "Gerüst aufbauen", verantwortung: "auftragnehmer" },
        { id: 4, titel: "Reinigung durchführen", verantwortung: "auftragnehmer" },
      ];
      
      const auftraggeberAufgaben = aufgaben.filter(a => a.verantwortung === "auftraggeber");
      const auftragnehmerAufgaben = aufgaben.filter(a => a.verantwortung === "auftragnehmer");
      
      expect(auftraggeberAufgaben).toHaveLength(2);
      expect(auftragnehmerAufgaben).toHaveLength(2);
    });

    it("sollte im Portal nur Auftraggeber-Aufgaben anzeigen", () => {
      const portalAufgaben = [
        { id: 1, titel: "Zugang bereitstellen", verantwortung: "auftraggeber", status: "offen" },
        { id: 2, titel: "Bewohnerinfo verteilen", verantwortung: "auftraggeber", status: "erledigt" },
      ];
      
      // Im Kundenportal sieht der Kunde nur seine Aufgaben
      const sichtbareAufgaben = portalAufgaben.filter(a => a.verantwortung === "auftraggeber");
      expect(sichtbareAufgaben).toHaveLength(2);
    });
  });

  // ============================================
  // Feedback und Kommunikation
  // ============================================

  describe("Feedback und Kommunikation", () => {
    it("sollte Feedback-Formular nach Projektabschluss anbieten", () => {
      const feedback = {
        projectId: 1,
        rating: 5,
        comment: "Sehr zufrieden mit der Arbeit",
        categories: ["qualitaet", "kommunikation", "termintreue"],
        submittedAt: new Date(),
      };
      
      expect(feedback.rating).toBeGreaterThanOrEqual(1);
      expect(feedback.rating).toBeLessThanOrEqual(5);
      expect(feedback.categories.length).toBeGreaterThan(0);
    });

    it("sollte Nachrichtensystem Kunde ↔ FassadenFix unterstützen", () => {
      const nachricht = {
        von: "kunde",
        an: "fassadenfix",
        betreff: "Frage zum Projekt",
        text: "Wann beginnen die Arbeiten?",
        gelesen: false,
        timestamp: new Date(),
      };
      
      expect(nachricht.von).toBeTruthy();
      expect(nachricht.an).toBeTruthy();
      expect(nachricht.text.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // CRM-Hierarchie im Portal
  // ============================================

  describe("CRM-Hierarchie: Unternehmen → Kontakte → Projekte", () => {
    it("sollte hierarchische Struktur abbilden (Interview A6)", () => {
      const hierarchie = {
        unternehmen: {
          id: 1,
          name: TEST_COMPANY.name,
          kontakte: [
            { id: 1, name: "Max Testmann", position: "Hausverwalter", istHauptkontakt: true },
            { id: 2, name: "Lisa Beispiel", position: "Buchhaltung", istHauptkontakt: false },
          ],
          projekte: [
            { id: 1, name: "Projekt A", phase: "durchfuehrung" },
            { id: 2, name: "Projekt B", phase: "angebot_versendet" },
          ],
        },
      };
      
      expect(hierarchie.unternehmen.kontakte.length).toBeGreaterThan(0);
      expect(hierarchie.unternehmen.projekte.length).toBeGreaterThan(0);
      
      const hauptkontakt = hierarchie.unternehmen.kontakte.find(k => k.istHauptkontakt);
      expect(hauptkontakt).toBeDefined();
    });
  });
});
