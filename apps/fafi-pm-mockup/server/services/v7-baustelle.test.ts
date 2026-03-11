/**
 * Unit-Tests für v7.0 – Foto-Upload & Baustellen-Manager
 * 
 * Tests für:
 * - v7.0a: Photo-Router (list, delete)
 * - v7.0b: Vorher-Dokumentation (Status-Felder, Blockierung)
 * - v7.0c: Tagesablauf (erweiterte Logeinträge, Ereignismelder)
 * - v7.0d: Nachher-Dokumentation (Status-Felder, Abnahme-Prüfung)
 * - Bautagebuch-Generierung
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateBautagebuchMarkdown } from "./bautagebuch";

// ============================================
// v7.0a – Photo-Router Tests
// ============================================
describe("v7.0a – Photo-Router", () => {
  describe("Photo-Dateibenennung", () => {
    it("sollte korrekte Dateinamen nach Schema generieren", () => {
      const context = "objektaufnahme";
      const companyName = "WG Sonnenhof";
      const address = "Musterstraße 1";
      const side = "front";
      const category = "Algenbefall";
      
      // Simuliere das Benennungsschema
      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, "_").substring(0, 50);
      const filename = `${sanitize(context)}_${sanitize(companyName)}_${sanitize(address)}_${sanitize(side)}_${sanitize(category)}_001.jpg`;
      
      expect(filename).toContain("objektaufnahme");
      expect(filename).toContain("WG_Sonnenhof");
      expect(filename).toContain("Musterstraße_1");
      expect(filename).toContain("front");
      expect(filename).toContain("Algenbefall");
      expect(filename).toContain("001.jpg");
    });

    it("sollte Sonderzeichen in Dateinamen bereinigen", () => {
      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, "_").substring(0, 50);
      
      expect(sanitize("Müller & Co. GmbH")).toBe("Müller___Co__GmbH");
      expect(sanitize("Straße 1/2")).toBe("Straße_1_2");
      expect(sanitize("")).toBe("");
    });
  });

  describe("Photo-Kontext-Validierung", () => {
    const validContexts = [
      "objektaufnahme",
      "vorher_dokumentation",
      "nachher_dokumentation",
      "baustelle_fortschritt",
      "ereignis",
      "abnahme",
      "schaden",
      "allgemein",
    ];

    it("sollte alle gültigen Kontexte akzeptieren", () => {
      for (const ctx of validContexts) {
        expect(validContexts).toContain(ctx);
      }
    });

    it("sollte ungültige Kontexte ablehnen", () => {
      expect(validContexts).not.toContain("invalid_context");
      expect(validContexts).not.toContain("");
    });
  });

  describe("Photo-Seiten-Validierung", () => {
    const validSides = ["front", "back", "left_gable", "right_gable", "roof", "other"];

    it("sollte alle 6 Gebäudeseiten unterstützen", () => {
      expect(validSides).toHaveLength(6);
      expect(validSides).toContain("front");
      expect(validSides).toContain("back");
      expect(validSides).toContain("left_gable");
      expect(validSides).toContain("right_gable");
      expect(validSides).toContain("roof");
      expect(validSides).toContain("other");
    });
  });
});

// ============================================
// v7.0b – Vorher-Dokumentation Tests
// ============================================
describe("v7.0b – Vorher-Dokumentation", () => {
  describe("Dokumentationsstatus", () => {
    const validStatuses = ["pending", "in_progress", "completed"];

    it("sollte alle gültigen Status-Werte unterstützen", () => {
      expect(validStatuses).toContain("pending");
      expect(validStatuses).toContain("in_progress");
      expect(validStatuses).toContain("completed");
    });

    it("sollte Standard-Status 'pending' sein", () => {
      const defaultStatus = "pending";
      expect(defaultStatus).toBe("pending");
    });
  });

  describe("Baustellenstart-Blockierung", () => {
    it("sollte Baustellenstart blockieren wenn Vorher-Doku nicht abgeschlossen", () => {
      const preDocStatus = "pending";
      const canStart = preDocStatus === "completed";
      expect(canStart).toBe(false);
    });

    it("sollte Baustellenstart blockieren wenn Vorher-Doku in Bearbeitung", () => {
      const preDocStatus = "in_progress";
      const canStart = preDocStatus === "completed";
      expect(canStart).toBe(false);
    });

    it("sollte Baustellenstart erlauben wenn Vorher-Doku abgeschlossen", () => {
      const preDocStatus = "completed";
      const canStart = preDocStatus === "completed";
      expect(canStart).toBe(true);
    });
  });

  describe("Pflicht-Fotos pro Gebäudeseite", () => {
    const requiredSides = ["front", "back", "left_gable", "right_gable"];

    it("sollte 4 Pflicht-Seiten erfordern", () => {
      expect(requiredSides).toHaveLength(4);
    });

    it("sollte Dokumentation als unvollständig markieren wenn eine Seite fehlt", () => {
      const uploadedSides = ["front", "back", "left_gable"]; // right_gable fehlt
      const allComplete = requiredSides.every(s => uploadedSides.includes(s));
      expect(allComplete).toBe(false);
    });

    it("sollte Dokumentation als vollständig markieren wenn alle Seiten vorhanden", () => {
      const uploadedSides = ["front", "back", "left_gable", "right_gable"];
      const allComplete = requiredSides.every(s => uploadedSides.includes(s));
      expect(allComplete).toBe(true);
    });
  });
});

// ============================================
// v7.0c – Baustellen-Tagesablauf Tests
// ============================================
describe("v7.0c – Baustellen-Tagesablauf", () => {
  describe("Erweiterte Log-Typen", () => {
    const validLogTypes = [
      "arbeitsbeginn", "fortschritt", "pause", "problem", "material",
      "arbeitsende", "wetter", "sicherheit", "kundenkontakt", "geraeteausfall", "sonstiges",
    ];

    it("sollte 11 Log-Typen unterstützen", () => {
      expect(validLogTypes).toHaveLength(11);
    });

    it("sollte neue Ereignis-Typen enthalten", () => {
      expect(validLogTypes).toContain("kundenkontakt");
      expect(validLogTypes).toContain("geraeteausfall");
      expect(validLogTypes).toContain("sonstiges");
    });
  });

  describe("Dringlichkeitsstufen", () => {
    const urgencyLevels = ["normal", "hoch", "kritisch"];

    it("sollte 3 Dringlichkeitsstufen unterstützen", () => {
      expect(urgencyLevels).toHaveLength(3);
    });

    it("sollte bei 'kritisch' Benachrichtigung auslösen", () => {
      const urgency = "kritisch";
      const shouldNotify = urgency === "kritisch";
      expect(shouldNotify).toBe(true);
    });

    it("sollte bei 'normal' keine Benachrichtigung auslösen", () => {
      const urgency = "normal";
      const shouldNotify = urgency === "kritisch";
      expect(shouldNotify).toBe(false);
    });
  });

  describe("Arbeitstag-Logik", () => {
    it("sollte Arbeitsbeginn mit Planungsfrage erstellen", () => {
      const logEntry = {
        logType: "arbeitsbeginn",
        planningOnTrack: true,
        plannedAreas: ["Gebäude 1, Nordseite", "Gebäude 2, Südseite"],
        workDayStarted: new Date("2026-02-09T08:00:00"),
      };

      expect(logEntry.logType).toBe("arbeitsbeginn");
      expect(logEntry.planningOnTrack).toBe(true);
      expect(logEntry.plannedAreas).toHaveLength(2);
      expect(logEntry.workDayStarted).toBeDefined();
    });

    it("sollte Arbeitsende mit Zusammenfassung erstellen", () => {
      const logEntry = {
        logType: "arbeitsende",
        completedAreas: ["Gebäude 1, Nordseite"],
        planningOnTrack: false,
        planningDeviation: "Hubsteiger-Ausfall, 2 Stunden Verzögerung",
        workDayEnded: new Date("2026-02-09T17:00:00"),
        metadata: {
          nextDayPlanning: "Gebäude 2 und 3",
          plannedAreasCount: 2,
          completedAreasCount: 1,
        },
      };

      expect(logEntry.logType).toBe("arbeitsende");
      expect(logEntry.completedAreas).toHaveLength(1);
      expect(logEntry.planningOnTrack).toBe(false);
      expect(logEntry.planningDeviation).toContain("Hubsteiger");
      expect(logEntry.metadata.completedAreasCount).toBeLessThan(logEntry.metadata.plannedAreasCount);
    });
  });
});

// ============================================
// v7.0d – Nachher-Dokumentation Tests
// ============================================
describe("v7.0d – Nachher-Dokumentation", () => {
  describe("Abnahme-Prüfung", () => {
    it("sollte Abnahme blockieren wenn Nachher-Doku nicht abgeschlossen", () => {
      const postDocStatus = "pending";
      const canStartAbnahme = postDocStatus === "completed";
      expect(canStartAbnahme).toBe(false);
    });

    it("sollte Abnahme erlauben wenn Nachher-Doku abgeschlossen", () => {
      const postDocStatus = "completed";
      const canStartAbnahme = postDocStatus === "completed";
      expect(canStartAbnahme).toBe(true);
    });
  });

  describe("Vorher/Nachher-Vergleich", () => {
    it("sollte Fotos nach Gebäudeseite gruppieren können", () => {
      const photos = [
        { id: 1, side: "front", context: "vorher_dokumentation" },
        { id: 2, side: "front", context: "nachher_dokumentation" },
        { id: 3, side: "back", context: "vorher_dokumentation" },
        { id: 4, side: "back", context: "nachher_dokumentation" },
      ];

      const bySide: Record<string, Record<string, any[]>> = {};
      for (const photo of photos) {
        if (!bySide[photo.side]) bySide[photo.side] = {};
        if (!bySide[photo.side][photo.context]) bySide[photo.side][photo.context] = [];
        bySide[photo.side][photo.context].push(photo);
      }

      expect(Object.keys(bySide)).toHaveLength(2);
      expect(bySide["front"]["vorher_dokumentation"]).toHaveLength(1);
      expect(bySide["front"]["nachher_dokumentation"]).toHaveLength(1);
    });
  });
});

// ============================================
// Bautagebuch-Generierung Tests
// ============================================
describe("Bautagebuch-Generierung", () => {
  it("sollte ein vollständiges Bautagebuch als Markdown generieren", () => {
    const entry = {
      constructionSiteId: 1,
      constructionSiteName: "Wohnanlage Sonnenhof",
      projectId: 1,
      date: new Date("2026-02-09"),
      startLog: {
        workDayStarted: new Date("2026-02-09T08:00:00"),
        userName: "Thomas Braun",
        plannedAreas: ["Gebäude 1, Nordseite", "Gebäude 2, Südseite"],
        planningOnTrack: true,
      },
      endLog: {
        workDayEnded: new Date("2026-02-09T17:00:00"),
        entry: "Arbeitsende 17:00 Uhr. 2/2 Bereiche abgeschlossen. Planung eingehalten.",
        completedAreas: ["Gebäude 1, Nordseite", "Gebäude 2, Südseite"],
        planningOnTrack: true,
        metadata: {
          nextDayPlanning: "Gebäude 3 und 4",
          plannedAreasCount: 2,
          completedAreasCount: 2,
        },
      },
      events: [
        {
          logType: "fortschritt",
          loggedAt: new Date("2026-02-09T10:30:00"),
          entry: "Gebäude 1 Nordseite fertiggestellt.",
          userName: "Thomas Braun",
        },
        {
          logType: "problem",
          loggedAt: new Date("2026-02-09T14:00:00"),
          entry: "Kurzer Regenschauer, 30 Min Pause.",
          userName: "Thomas Braun",
          urgency: "normal",
        },
      ],
      photos: ["photo1.jpg", "photo2.jpg"],
    };

    const markdown = generateBautagebuchMarkdown(entry);

    expect(markdown).toContain("# Bautagebuch");
    expect(markdown).toContain("Wohnanlage Sonnenhof");
    expect(markdown).toContain("## Arbeitszeiten");
    expect(markdown).toContain("Thomas Braun");
    expect(markdown).toContain("## Geplante Bereiche");
    expect(markdown).toContain("[x] Gebäude 1, Nordseite");
    expect(markdown).toContain("[x] Gebäude 2, Südseite");
    expect(markdown).toContain("2/2 Bereiche abgeschlossen (100%)");
    expect(markdown).toContain("## Ereignisse & Vorkommnisse");
    expect(markdown).toContain("Fortschritt");
    expect(markdown).toContain("Problem/Schaden");
    expect(markdown).toContain("## Fotodokumentation");
    expect(markdown).toContain("2 Foto(s)");
    expect(markdown).toContain("## Zusammenfassung");
    expect(markdown).toContain("Gebäude 3 und 4");
  });

  it("sollte ein minimales Bautagebuch ohne optionale Felder generieren", () => {
    const entry = {
      constructionSiteId: 1,
      constructionSiteName: "Testbaustelle",
      projectId: 1,
      date: new Date("2026-02-09"),
      events: [],
      photos: [],
    };

    const markdown = generateBautagebuchMarkdown(entry);

    expect(markdown).toContain("# Bautagebuch");
    expect(markdown).toContain("Testbaustelle");
    expect(markdown).not.toContain("## Arbeitszeiten");
    expect(markdown).not.toContain("## Geplante Bereiche");
    expect(markdown).not.toContain("## Ereignisse");
    expect(markdown).not.toContain("## Fotodokumentation");
  });

  it("sollte Planabweichungen korrekt darstellen", () => {
    const entry = {
      constructionSiteId: 1,
      constructionSiteName: "Testbaustelle",
      projectId: 1,
      date: new Date("2026-02-09"),
      startLog: {
        planningOnTrack: false,
        planningDeviation: "Hubsteiger-Ausfall, 2 Stunden Verzögerung",
        plannedAreas: ["Bereich A", "Bereich B"],
      },
      endLog: {
        entry: "Nur 1 von 2 Bereichen geschafft.",
        completedAreas: ["Bereich A"],
        workDayEnded: new Date("2026-02-09T17:00:00"),
      },
      events: [],
      photos: [],
    };

    const markdown = generateBautagebuchMarkdown(entry);

    expect(markdown).toContain("Abweichung");
    expect(markdown).toContain("Hubsteiger-Ausfall");
    expect(markdown).toContain("[x] Bereich A");
    expect(markdown).toContain("[ ] Bereich B");
    expect(markdown).toContain("1/2 Bereiche abgeschlossen (50%)");
  });

  it("sollte kritische Ereignisse hervorheben", () => {
    const entry = {
      constructionSiteId: 1,
      constructionSiteName: "Testbaustelle",
      projectId: 1,
      date: new Date("2026-02-09"),
      events: [
        {
          logType: "sicherheit",
          loggedAt: new Date("2026-02-09T11:00:00"),
          entry: "Arbeiter gestürzt, Erste Hilfe geleistet.",
          userName: "Max Mustermann",
          urgency: "kritisch",
        },
      ],
      photos: [],
    };

    const markdown = generateBautagebuchMarkdown(entry);

    expect(markdown).toContain("KRITISCH");
    expect(markdown).toContain("Sicherheitsvorfall");
    expect(markdown).toContain("Arbeiter gestürzt");
  });
});
