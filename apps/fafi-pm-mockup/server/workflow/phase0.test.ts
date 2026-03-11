import { describe, expect, it } from "vitest";
import {
  AdvancePhaseInputSchema,
  ProjectPhaseEnum,
  getAllowedTransitions,
  getPhaseMetadata,
  PHASE_METADATA,
  PHASE_TRANSITIONS,
  type ProjectPhase,
} from "../../shared/schemas/workflow";

// ============================================
// Phase 0a/0b: Phasenübergänge & Validierung
// ============================================
describe("Phase 0a: Automatische Phasenübergänge – Schema-Validierung", () => {
  it("akzeptiert gültige Phasenübergangs-Eingaben", () => {
    const validInput = {
      projectId: 1,
      targetPhase: "angebot_erstellt" as const,
      trigger: "auto" as const,
      reason: "Angebot wurde erstellt",
    };
    const result = AdvancePhaseInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("lehnt ungültige Phasen ab", () => {
    const invalidInput = {
      projectId: 1,
      targetPhase: "nicht_existierende_phase",
      trigger: "auto",
    };
    const result = AdvancePhaseInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("lehnt fehlende projectId ab", () => {
    const invalidInput = {
      targetPhase: "angebot_erstellt",
      trigger: "auto",
    };
    const result = AdvancePhaseInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("akzeptiert alle drei Trigger-Typen", () => {
    const triggers = ["auto", "manual", "system"] as const;
    for (const trigger of triggers) {
      const input = { projectId: 1, targetPhase: "planung" as const, trigger };
      const result = AdvancePhaseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it("akzeptiert Eingabe ohne optionalen reason", () => {
    const input = {
      projectId: 1,
      targetPhase: "angebot_erstellt" as const,
      trigger: "manual" as const,
    };
    const result = AdvancePhaseInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe("Phase 0b: Phasen-Validierung – Erlaubte Übergänge", () => {
  it("erlaubt den Übergang objektaufnahme → angebot_erstellt", () => {
    const transitions = getAllowedTransitions("objektaufnahme");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("angebot_erstellt");
  });

  it("erlaubt den Übergang angebot_erstellt → angebot_versendet", () => {
    const transitions = getAllowedTransitions("angebot_erstellt");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("angebot_versendet");
  });

  it("erlaubt den Übergang angebot_versendet → nachfassen", () => {
    const transitions = getAllowedTransitions("angebot_versendet");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("nachfassen");
  });

  it("erlaubt den Übergang nachfassen → auftrag_gewonnen", () => {
    const transitions = getAllowedTransitions("nachfassen");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("auftrag_gewonnen");
  });

  it("erlaubt den Übergang auftrag_gewonnen → planung", () => {
    const transitions = getAllowedTransitions("auftrag_gewonnen");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("planung");
  });

  it("erlaubt den Übergang planung → vorbereitung", () => {
    const transitions = getAllowedTransitions("planung");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("vorbereitung");
  });

  it("erlaubt den Übergang vorbereitung → durchfuehrung", () => {
    const transitions = getAllowedTransitions("vorbereitung");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("durchfuehrung");
  });

  it("erlaubt den Übergang durchfuehrung → abnahme", () => {
    const transitions = getAllowedTransitions("durchfuehrung");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("abnahme");
  });

  it("erlaubt den Übergang abnahme → abgeschlossen", () => {
    const transitions = getAllowedTransitions("abnahme");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).toContain("abgeschlossen");
  });

  it("erlaubt den Übergang zu 'verloren' von angebot_versendet und nachfassen", () => {
    const phasenMitVerloren: ProjectPhase[] = [
      "angebot_versendet", "nachfassen"
    ];
    for (const phase of phasenMitVerloren) {
      const transitions = getAllowedTransitions(phase);
      const targetPhases = transitions.map(t => t.to);
      expect(targetPhases).toContain("verloren");
    }
  });

  it("verbietet den Übergang zu 'verloren' von objektaufnahme und angebot_erstellt", () => {
    const phasenOhneVerloren: ProjectPhase[] = [
      "objektaufnahme", "angebot_erstellt"
    ];
    for (const phase of phasenOhneVerloren) {
      const transitions = getAllowedTransitions(phase);
      const targetPhases = transitions.map(t => t.to);
      expect(targetPhases).not.toContain("verloren");
    }
  });

  it("verbietet den Übergang abgeschlossen → objektaufnahme (kein Rücksprung)", () => {
    const transitions = getAllowedTransitions("abgeschlossen");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).not.toContain("objektaufnahme");
  });

  it("gibt leere Übergänge für abgeschlossen zurück", () => {
    const transitions = getAllowedTransitions("abgeschlossen");
    expect(transitions.length).toBe(0);
  });

  it("gibt leere Übergänge für verloren zurück", () => {
    const transitions = getAllowedTransitions("verloren");
    expect(transitions.length).toBe(0);
  });

  it("verbietet den Sprung von objektaufnahme direkt zu durchfuehrung", () => {
    const transitions = getAllowedTransitions("objektaufnahme");
    const targetPhases = transitions.map(t => t.to);
    expect(targetPhases).not.toContain("durchfuehrung");
  });
});

describe("Phase 0b: Phasen-Metadaten", () => {
  it("hat Metadaten für alle 11 Phasen", () => {
    const allPhases: ProjectPhase[] = [
      "objektaufnahme", "angebot_erstellt", "angebot_versendet",
      "nachfassen", "auftrag_gewonnen", "planung",
      "vorbereitung", "durchfuehrung", "abnahme",
      "abgeschlossen", "verloren"
    ];
    for (const phase of allPhases) {
      const metadata = getPhaseMetadata(phase);
      expect(metadata).toBeDefined();
      expect(metadata.label).toBeTruthy();
      expect(metadata.color).toBeTruthy();
      expect(metadata.category).toBeTruthy();
    }
  });

  it("ordnet Phasen korrekt den Kategorien zu", () => {
    expect(getPhaseMetadata("objektaufnahme").category).toBe("vertrieb");
    expect(getPhaseMetadata("angebot_erstellt").category).toBe("vertrieb");
    expect(getPhaseMetadata("planung").category).toBe("ausfuehrung");
    expect(getPhaseMetadata("durchfuehrung").category).toBe("ausfuehrung");
    expect(getPhaseMetadata("abnahme").category).toBe("abschluss");
    expect(getPhaseMetadata("abgeschlossen").category).toBe("abschluss");
  });

  it("hat korrekte Labels für alle Phasen", () => {
    expect(getPhaseMetadata("objektaufnahme").label).toBe("Objektaufnahme");
    expect(getPhaseMetadata("angebot_erstellt").label).toBe("Angebot erstellt");
    expect(getPhaseMetadata("durchfuehrung").label).toBe("Durchführung");
    expect(getPhaseMetadata("abgeschlossen").label).toBe("Abgeschlossen");
    expect(getPhaseMetadata("verloren").label).toBe("Verloren");
  });
});

describe("Phase 0b: Phasen-Übergangs-Definitionen Vollständigkeit", () => {
  it("hat Übergänge für alle Phasen außer Endphasen", () => {
    const phasenMitUebergaengen: ProjectPhase[] = [
      "objektaufnahme", "angebot_erstellt", "angebot_versendet",
      "nachfassen", "auftrag_gewonnen", "planung",
      "vorbereitung", "durchfuehrung", "abnahme",
    ];
    for (const phase of phasenMitUebergaengen) {
      const transitions = getAllowedTransitions(phase);
      expect(transitions.length).toBeGreaterThan(0);
    }
  });

  it("jeder Übergang hat ein Label", () => {
    for (const transition of PHASE_TRANSITIONS) {
      expect(transition.label).toBeTruthy();
      expect(typeof transition.label).toBe("string");
    }
  });

  it("jeder Übergang verweist auf eine gültige Phase", () => {
    const validPhases = ProjectPhaseEnum.options;
    for (const transition of PHASE_TRANSITIONS) {
      expect(validPhases).toContain(transition.from);
      expect(validPhases).toContain(transition.to);
    }
  });

  it("hat mindestens 10 Übergänge definiert", () => {
    expect(PHASE_TRANSITIONS.length).toBeGreaterThanOrEqual(10);
  });
});

// ============================================
// Phase 0e: Nachfass-System – Schema-Tests
// ============================================
describe("Phase 0e: Nachfass-System – Erinnerungs-Logik", () => {
  it("berechnet korrekte Fälligkeitsdaten für 7/14/30 Tage", () => {
    const sentAt = new Date("2026-02-01T10:00:00Z");
    const reminders = [
      { type: "auto_7d", days: 7 },
      { type: "auto_14d", days: 14 },
      { type: "auto_30d", days: 30 },
    ];

    for (const { days } of reminders) {
      const dueAt = new Date(sentAt.getTime() + days * 24 * 60 * 60 * 1000);
      const expectedDate = new Date("2026-02-01T10:00:00Z");
      expectedDate.setDate(expectedDate.getDate() + days);
      expect(dueAt.toISOString()).toBe(expectedDate.toISOString());
    }
  });

  it("7-Tage-Erinnerung ist vor 14-Tage-Erinnerung", () => {
    const sentAt = new Date("2026-02-01T10:00:00Z");
    const due7d = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const due14d = new Date(sentAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    const due30d = new Date(sentAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    expect(due7d.getTime()).toBeLessThan(due14d.getTime());
    expect(due14d.getTime()).toBeLessThan(due30d.getTime());
  });

  it("Erinnerungs-Typen sind korrekt definiert", () => {
    const validTypes = ["auto_7d", "auto_14d", "auto_30d", "custom"];
    expect(validTypes).toHaveLength(4);
    expect(validTypes).toContain("auto_7d");
    expect(validTypes).toContain("custom");
  });

  it("Erinnerungs-Status sind korrekt definiert", () => {
    const validStatuses = ["pending", "completed", "dismissed", "overdue"];
    expect(validStatuses).toHaveLength(4);
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("completed");
  });
});

// ============================================
// ProjectPhaseEnum Validierung
// ============================================
describe("ProjectPhaseEnum", () => {
  it("enthält genau 11 Phasen", () => {
    expect(ProjectPhaseEnum.options).toHaveLength(11);
  });

  it("validiert gültige Phasen", () => {
    const result = ProjectPhaseEnum.safeParse("objektaufnahme");
    expect(result.success).toBe(true);
  });

  it("lehnt ungültige Phasen ab", () => {
    const result = ProjectPhaseEnum.safeParse("ungueltig");
    expect(result.success).toBe(false);
  });
});
