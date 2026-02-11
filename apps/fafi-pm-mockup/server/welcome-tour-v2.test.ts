/**
 * Welcome Tour v2 Tests
 * - Rollenspezifische Tour-Filterung
 * - Interaktive Tour-Steps
 * - Tour-Dauer-Berechnung
 * - Sprache und Tonalität
 */
import { describe, it, expect } from "vitest";
import {
  allTourSteps,
  getFilteredTourSteps,
  estimateTourDuration,
} from "../client/src/components/Onboarding";

// ─── Rollenspezifische Filterung ─────────────────────────────────────────────

describe("Rollenspezifische Tour-Filterung", () => {
  it("GF sieht alle Steps", () => {
    const steps = getFilteredTourSteps("gf");
    expect(steps.length).toBe(allTourSteps.length);
  });

  it("null-Rolle (kein Login) sieht alle Steps", () => {
    const steps = getFilteredTourSteps(null);
    expect(steps.length).toBe(allTourSteps.length);
  });

  it("undefined-Rolle sieht alle Steps", () => {
    const steps = getFilteredTourSteps(undefined);
    expect(steps.length).toBe(allTourSteps.length);
  });

  it("Kundenberater sieht NICHT Baustellen und Einsatzplanung", () => {
    const steps = getFilteredTourSteps("kundenberater");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).not.toContain("baustellen");
    expect(stepIds).not.toContain("einsatzplanung");
  });

  it("Kundenberater sieht Angebote und Vorbereitungsaufgaben", () => {
    const steps = getFilteredTourSteps("kundenberater");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain("angebote");
    expect(stepIds).toContain("vorbereitungsaufgaben");
  });

  it("AT-Leiter sieht Baustellen aber NICHT Finanzen und Archiv", () => {
    const steps = getFilteredTourSteps("at_leiter");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain("baustellen");
    expect(stepIds).not.toContain("finanzen");
    expect(stepIds).not.toContain("archiv");
  });

  it("AT-Leiter sieht NICHT Angebote", () => {
    const steps = getFilteredTourSteps("at_leiter");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).not.toContain("angebote");
  });

  it("Projektleiter sieht Einsatzplanung und Baustellen", () => {
    const steps = getFilteredTourSteps("projektleiter");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain("einsatzplanung");
    expect(stepIds).toContain("baustellen");
    expect(stepIds).toContain("vorbereitungsaufgaben");
  });

  it("Projektleiter sieht NICHT Finanzen und Archiv", () => {
    const steps = getFilteredTourSteps("projektleiter");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).not.toContain("finanzen");
    expect(stepIds).not.toContain("archiv");
  });

  it("Büro sieht Finanzen und Archiv aber NICHT Baustellen und Einsatzplanung", () => {
    const steps = getFilteredTourSteps("buero");
    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain("finanzen");
    expect(stepIds).toContain("archiv");
    expect(stepIds).toContain("angebote");
    expect(stepIds).not.toContain("baustellen");
    expect(stepIds).not.toContain("einsatzplanung");
  });

  it("Alle Rollen sehen Welcome und Complete Steps", () => {
    const roles = ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"] as const;
    for (const role of roles) {
      const steps = getFilteredTourSteps(role);
      const stepIds = steps.map(s => s.id);
      expect(stepIds).toContain("welcome");
      expect(stepIds).toContain("complete");
    }
  });

  it("Alle Rollen sehen Dashboard-KPIs, Countdown und Kanban", () => {
    const roles = ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"] as const;
    for (const role of roles) {
      const steps = getFilteredTourSteps(role);
      const stepIds = steps.map(s => s.id);
      expect(stepIds).toContain("dashboard-kpis");
      expect(stepIds).toContain("countdown");
      expect(stepIds).toContain("kanban");
    }
  });

  it("Jede Rolle hat weniger oder gleich viele Steps wie GF", () => {
    const gfSteps = getFilteredTourSteps("gf").length;
    const roles = ["kundenberater", "at_leiter", "projektleiter", "buero"] as const;
    for (const role of roles) {
      const roleSteps = getFilteredTourSteps(role).length;
      expect(roleSteps).toBeLessThanOrEqual(gfSteps);
      expect(roleSteps).toBeGreaterThanOrEqual(6); // Mindestens Welcome + Dashboard + Kanban + Countdown + Quick + Complete
    }
  });
});

// ─── Interaktive Steps ───────────────────────────────────────────────────────

describe("Interaktive Tour-Steps", () => {
  it("Es gibt mindestens 2 interaktive Steps", () => {
    const interactiveSteps = allTourSteps.filter(s => s.interactive);
    expect(interactiveSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("Jeder interaktive Step hat ein interactiveTarget", () => {
    const interactiveSteps = allTourSteps.filter(s => s.interactive);
    for (const step of interactiveSteps) {
      expect(step.interactiveTarget).toBeTruthy();
      expect(step.interactiveTarget).toContain("[data-tour=");
    }
  });

  it("Jeder interaktive Step hat einen interactivePrompt", () => {
    const interactiveSteps = allTourSteps.filter(s => s.interactive);
    for (const step of interactiveSteps) {
      expect(step.interactivePrompt).toBeTruthy();
      expect(step.interactivePrompt!.length).toBeGreaterThan(10);
    }
  });

  it("Interaktive Steps haben einen Klick-Aufforderungstext", () => {
    const interactiveSteps = allTourSteps.filter(s => s.interactive);
    for (const step of interactiveSteps) {
      // Prompt sollte "Klick" enthalten
      expect(step.interactivePrompt!.toLowerCase()).toContain("klick");
    }
  });

  it("Welcome und Complete Steps sind NICHT interaktiv", () => {
    const welcome = allTourSteps.find(s => s.id === "welcome");
    const complete = allTourSteps.find(s => s.id === "complete");
    expect(welcome?.interactive).toBeFalsy();
    expect(complete?.interactive).toBeFalsy();
  });

  it("Interaktive Steps referenzieren existierende data-tour Attribute", () => {
    const interactiveSteps = allTourSteps.filter(s => s.interactive);
    const validTargets = [
      "nav-projekte", "nav-immobilien", "nav-angebote", "nav-baustellen",
      "nav-einsatzplanung", "nav-vorbereitungsaufgaben",
      "dashboard-kpis", "kanban-board", "countdown-tasks", "quick-actions",
    ];
    for (const step of interactiveSteps) {
      const targetMatch = step.interactiveTarget!.match(/data-tour='([^']+)'/);
      expect(targetMatch).toBeTruthy();
      const targetName = targetMatch![1];
      expect(validTargets).toContain(targetName);
    }
  });
});

// ─── Tour-Dauer-Berechnung ───────────────────────────────────────────────────

describe("Tour-Dauer-Berechnung", () => {
  it("Berechnet korrekte Dauer für verschiedene Step-Anzahlen", () => {
    expect(estimateTourDuration(6)).toBe(1); // 60s → 1 Minute
    expect(estimateTourDuration(7)).toBe(2); // 70s → 2 Minuten
    expect(estimateTourDuration(14)).toBe(3); // 140s → 3 Minuten
  });

  it("Mindestdauer ist 1 Minute", () => {
    expect(estimateTourDuration(1)).toBe(1);
    expect(estimateTourDuration(0)).toBe(1);
  });

  it("GF-Tour dauert länger als andere Rollen", () => {
    const gfDuration = estimateTourDuration(getFilteredTourSteps("gf").length);
    const kbDuration = estimateTourDuration(getFilteredTourSteps("kundenberater").length);
    expect(gfDuration).toBeGreaterThanOrEqual(kbDuration);
  });
});

// ─── Tour-Konfiguration ─────────────────────────────────────────────────────

describe("Tour-Konfiguration", () => {
  it("Alle Steps haben eindeutige IDs", () => {
    const ids = allTourSteps.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("Alle Steps haben Titel und Beschreibung", () => {
    for (const step of allTourSteps) {
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(step.title.length).toBeGreaterThan(3);
      expect(step.description.length).toBeGreaterThan(10);
    }
  });

  it("Alle Steps haben ein Icon", () => {
    for (const step of allTourSteps) {
      expect(step.icon).toBeTruthy();
    }
  });

  it("Erster Step ist 'welcome', letzter ist 'complete'", () => {
    expect(allTourSteps[0].id).toBe("welcome");
    expect(allTourSteps[allTourSteps.length - 1].id).toBe("complete");
  });

  it("Welcome und Complete sind center-positioned", () => {
    const welcome = allTourSteps.find(s => s.id === "welcome");
    const complete = allTourSteps.find(s => s.id === "complete");
    expect(welcome?.position).toBe("center");
    expect(complete?.position).toBe("center");
  });

  it("Steps mit targetSelector haben eine Position", () => {
    for (const step of allTourSteps) {
      if (step.targetSelector) {
        expect(step.position).toBeTruthy();
        expect(["top", "bottom", "left", "right", "center"]).toContain(step.position);
      }
    }
  });
});

// ─── Sprache und Tonalität ───────────────────────────────────────────────────

describe("Sprache und Tonalität", () => {
  it("Alle Texte verwenden Du-Form (kein Sie)", () => {
    for (const step of allTourSteps) {
      // Prüfe dass kein "Sie" als Anrede vorkommt (Großbuchstabe am Wortanfang)
      const combinedText = `${step.title} ${step.description} ${step.interactivePrompt || ""}`;
      // Erlaube "Sie" nur als Teil von zusammengesetzten Wörtern
      const sieMatches = combinedText.match(/\bSie\b/g);
      expect(sieMatches).toBeNull();
    }
  });

  it("Beschreibungen sind nicht zu lang (max 200 Zeichen)", () => {
    for (const step of allTourSteps) {
      expect(step.description.length).toBeLessThanOrEqual(200);
    }
  });

  it("Keine akademischen Fachbegriffe in den Beschreibungen", () => {
    const academicTerms = ["implementiert", "konfiguriert", "aggregiert", "initialisiert", "instantiiert"];
    for (const step of allTourSteps) {
      for (const term of academicTerms) {
        expect(step.description.toLowerCase()).not.toContain(term);
      }
    }
  });

  it("Rollenspezifische Texte enthalten rollenrelevante Begriffe", () => {
    // GF-Text sollte Überblick/Finanzen/Team enthalten
    const gfSteps = getFilteredTourSteps("gf");
    const gfText = gfSteps.map(s => s.description).join(" ");
    expect(gfText.toLowerCase()).toContain("baustelle");

    // AT-Leiter-Text sollte Baustelle/Team enthalten
    const atSteps = getFilteredTourSteps("at_leiter");
    const atText = atSteps.map(s => s.description).join(" ");
    expect(atText.toLowerCase()).toContain("baustelle");
  });
});

// ─── Rollen-Abdeckung ────────────────────────────────────────────────────────

describe("Rollen-Abdeckung", () => {
  it("Alle 5 FaFi-Rollen sind in der Filterung berücksichtigt", () => {
    const roles = ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"] as const;
    for (const role of roles) {
      const steps = getFilteredTourSteps(role);
      expect(steps.length).toBeGreaterThan(0);
    }
  });

  it("Steps mit roles-Array enthalten nur gültige Rollen", () => {
    const validRoles = ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"];
    for (const step of allTourSteps) {
      if (step.roles) {
        for (const role of step.roles) {
          expect(validRoles).toContain(role);
        }
      }
    }
  });

  it("Mindestens ein Step ist rollenspezifisch eingeschränkt", () => {
    const restrictedSteps = allTourSteps.filter(s => s.roles && s.roles.length > 0);
    expect(restrictedSteps.length).toBeGreaterThan(0);
  });

  it("Nicht alle Steps sind rollenspezifisch (es gibt allgemeine Steps)", () => {
    const generalSteps = allTourSteps.filter(s => !s.roles || s.roles.length === 0);
    expect(generalSteps.length).toBeGreaterThan(3);
  });
});
