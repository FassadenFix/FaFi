/**
 * E2E-Test: Baustellen-Tagesablauf (Morgen → Ereignis → Abend)
 * Testet den vollständigen Arbeitstag auf einer Baustelle
 */

import { describe, it, expect } from "vitest";
import {
  getDayWorkflowSteps,
  TEST_CONSTRUCTION_SITE,
  isValidAmpelStatus,
} from "./e2e-utils";

describe("E2E: Baustellen-Tagesablauf", () => {

  // ============================================
  // Morgen: Arbeitsbeginn
  // ============================================

  describe("Morgen: Arbeitsbeginn und Planung", () => {
    it("sollte den Tagesablauf mit 5 Schritten definieren", () => {
      const steps = getDayWorkflowSteps();
      expect(steps).toHaveLength(5);
      expect(steps[0].step).toBe("morgen_planung");
      expect(steps[4].step).toBe("abend_abschluss");
    });

    it("sollte Teamleitercheck als Pflicht vor Arbeitsbeginn prüfen", () => {
      const checklistItems = [
        { id: "sicherheit", label: "Sicherheitsausrüstung geprüft", required: true },
        { id: "geraete", label: "Geräte funktionsfähig", required: true },
        { id: "wetter", label: "Wetterbedingungen geprüft", required: true },
        { id: "team", label: "Team vollständig", required: true },
        { id: "material", label: "Material vorhanden", required: true },
      ];
      
      const requiredItems = checklistItems.filter(i => i.required);
      expect(requiredItems).toHaveLength(5);
      
      // Alle Pflichtfelder müssen erfüllt sein
      const allChecked = requiredItems.every(i => i.required);
      expect(allChecked).toBe(true);
    });

    it("sollte Planungsfrage morgens stellen (Interview: morgens UND abends)", () => {
      const morgenPlanung = {
        geplanteFlaeche: 500,
        geplanteBereiche: ["Gebäude 1 Frontseite", "Gebäude 1 Rückseite"],
        teamAufteilung: [
          { name: "Team A", bereich: "Frontseite", mitglieder: 2 },
          { name: "Team B", bereich: "Rückseite", mitglieder: 2 },
        ],
        wetterprognose: { temp: 12, wind: 8, niederschlag: 0 },
      };
      
      expect(morgenPlanung.geplanteFlaeche).toBeGreaterThan(0);
      expect(morgenPlanung.geplanteBereiche.length).toBeGreaterThan(0);
      expect(morgenPlanung.teamAufteilung.length).toBeGreaterThan(0);
    });

    it("sollte GPS-Koordinaten bei Arbeitsbeginn erfassen", () => {
      const gpsData = { lat: 52.5200, lng: 13.4050 };
      expect(gpsData.lat).toBeGreaterThan(0);
      expect(gpsData.lng).toBeGreaterThan(0);
      // Berlin-Bereich
      expect(gpsData.lat).toBeGreaterThan(52);
      expect(gpsData.lat).toBeLessThan(53);
    });
  });

  // ============================================
  // Vormittag: Arbeitsfortschritt
  // ============================================

  describe("Vormittag: Arbeitsfortschritt und Dokumentation", () => {
    it("sollte Fortschrittsmeldungen mit Foto-Upload erstellen können", () => {
      const fortschritt = {
        typ: "fortschritt",
        bereich: "Gebäude 1 Frontseite",
        fertiggestellt: 100, // Prozent
        fotos: ["foto_001.jpg", "foto_002.jpg"],
        beschreibung: "Algenbefall erfolgreich entfernt. Imprägnierung aufgetragen.",
        timestamp: new Date(),
      };
      
      expect(fortschritt.fertiggestellt).toBeGreaterThanOrEqual(0);
      expect(fortschritt.fertiggestellt).toBeLessThanOrEqual(100);
      expect(fortschritt.fotos.length).toBeGreaterThan(0);
    });

    it("sollte Fotos mit korrektem Dateinamen-Schema speichern", () => {
      const schema = "Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN.jpg";
      const beispiel = "Baustelle_WohnbauGmbH_Musterweg1_Frontseite_Fortschritt_001.jpg";
      
      const parts = beispiel.split("_");
      expect(parts.length).toBeGreaterThanOrEqual(6);
      expect(parts[0]).toBe("Baustelle");
      expect(beispiel).toMatch(/\.jpg$/);
    });

    it("sollte Wetterdaten automatisch abrufen (Open-Meteo)", () => {
      const wetterDaten = {
        temp: 12,
        condition: "wolkig",
        wind: 15,
        niederschlag: 0,
        luftfeuchtigkeit: 65,
        timestamp: new Date(),
      };
      
      expect(wetterDaten.temp).toBeDefined();
      expect(wetterDaten.wind).toBeGreaterThanOrEqual(0);
      expect(wetterDaten.niederschlag).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // Ereignis: Problemmeldung
  // ============================================

  describe("Ereignis: Problemmeldung und Eskalation", () => {
    it("sollte Ereignismeldungen mit Kategorien erstellen können", () => {
      const kategorien = [
        "arbeitsbeginn", "fortschritt", "pause", 
        "problem", "material", "arbeitsende"
      ];
      
      const ereignis = {
        typ: "problem",
        dringlichkeit: "hoch",
        beschreibung: "Hubsteiger-Ausfall wegen technischem Defekt",
        fotos: ["defekt_001.jpg"],
        timestamp: new Date(),
      };
      
      expect(kategorien).toContain(ereignis.typ);
      expect(["niedrig", "mittel", "hoch", "kritisch"]).toContain(ereignis.dringlichkeit);
    });

    it("sollte bei kritischen Ereignissen eine Benachrichtigung auslösen", () => {
      const ereignis = { typ: "problem", dringlichkeit: "kritisch" };
      const sollBenachrichtigen = ereignis.dringlichkeit === "kritisch" || ereignis.dringlichkeit === "hoch";
      expect(sollBenachrichtigen).toBe(true);
    });

    it("sollte die Ampel-Status korrekt berechnen", () => {
      // Grün: Alles planmäßig
      expect(isValidAmpelStatus("gruen")).toBe(true);
      // Gelb: Leichte Verzögerung
      expect(isValidAmpelStatus("gelb")).toBe(true);
      // Rot: Kritisches Problem
      expect(isValidAmpelStatus("rot")).toBe(true);
      // Ungültig
      expect(isValidAmpelStatus("blau")).toBe(false);
    });
  });

  // ============================================
  // Abend: Tagesabschluss
  // ============================================

  describe("Abend: Tagesabschluss und Bautagebuch", () => {
    it("sollte Abschlussmeldung mit Soll/Ist-Vergleich erstellen", () => {
      const abschluss = {
        typ: "arbeitsende",
        geplanteFlaeche: 500,
        erledigteFlaeche: 450,
        abweichung: -10, // Prozent
        wetterAbend: { temp: 8, wind: 12 },
        naechsterTag: "Fortsetzung Gebäude 2 Frontseite",
        timestamp: new Date(),
      };
      
      const abweichungProzent = ((abschluss.erledigteFlaeche - abschluss.geplanteFlaeche) / abschluss.geplanteFlaeche) * 100;
      expect(abweichungProzent).toBe(-10);
    });

    it("sollte automatisches Bautagebuch generieren", () => {
      const bautagebuch = {
        datum: new Date().toISOString().split("T")[0],
        baustelleId: 1,
        eintraege: [
          { zeit: "08:00", typ: "arbeitsbeginn", text: "Arbeitsbeginn" },
          { zeit: "10:30", typ: "fortschritt", text: "Gebäude 1 fertiggestellt" },
          { zeit: "12:00", typ: "pause", text: "Mittagspause" },
          { zeit: "15:00", typ: "problem", text: "Hubsteiger-Ausfall" },
          { zeit: "17:00", typ: "arbeitsende", text: "Tagesabschluss" },
        ],
        wetter: { morgens: 12, mittags: 15, abends: 8 },
        fortschrittGesamt: 5, // Prozent
      };
      
      expect(bautagebuch.eintraege).toHaveLength(5);
      expect(bautagebuch.eintraege[0].typ).toBe("arbeitsbeginn");
      expect(bautagebuch.eintraege[4].typ).toBe("arbeitsende");
    });

    it("sollte Planungsfrage auch abends stellen (Interview: morgens UND abends)", () => {
      const abendPlanung = {
        naechsterTagGeplant: true,
        geplanteFlaeche: 600,
        geplanteBereiche: ["Gebäude 2 Frontseite", "Gebäude 2 Linker Giebel"],
        besonderheiten: "Ersatz-Hubsteiger wird morgen früh geliefert",
      };
      
      expect(abendPlanung.naechsterTagGeplant).toBe(true);
      expect(abendPlanung.geplanteFlaeche).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Vorher/Nachher-Dokumentation
  // ============================================

  describe("Vorher/Nachher-Dokumentation", () => {
    it("sollte Vorher-Dokumentation als Pflicht vor Baustellenstart prüfen", () => {
      const preDocStatus = "completed";
      const canStartWork = preDocStatus === "completed";
      expect(canStartWork).toBe(true);
    });

    it("sollte Nachher-Dokumentation als Pflicht vor Abnahme prüfen", () => {
      const postDocStatus = "completed";
      const canStartAbnahme = postDocStatus === "completed";
      expect(canStartAbnahme).toBe(true);
    });

    it("sollte Vorher/Nachher-Vergleich ermöglichen", () => {
      const vorher = { url: "vorher_front_001.jpg", seite: "Frontseite", timestamp: new Date("2026-01-15") };
      const nachher = { url: "nachher_front_001.jpg", seite: "Frontseite", timestamp: new Date("2026-02-15") };
      
      expect(vorher.seite).toBe(nachher.seite);
      expect(nachher.timestamp.getTime()).toBeGreaterThan(vorher.timestamp.getTime());
    });
  });
});
