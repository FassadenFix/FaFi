import { describe, expect, it } from "vitest";
import {
  ProjectPhaseEnum,
  TransitionTriggerEnum,
  PHASE_TRANSITIONS,
  PHASE_METADATA,
  getAllowedTransitions,
  isTransitionAllowed,
  getPhaseMetadata,
  getNextPhase,
  AdvancePhaseInputSchema,
  type ProjectPhase,
} from "../../shared/schemas/workflow";

// ============================================
// SCHEMA VALIDATION TESTS
// ============================================

describe("ProjectPhaseEnum", () => {
  it("accepts all valid phases", () => {
    const validPhases = [
      "objektaufnahme",
      "angebot_erstellt",
      "angebot_versendet",
      "nachfassen",
      "auftrag_gewonnen",
      "planung",
      "vorbereitung",
      "durchfuehrung",
      "abnahme",
      "abgeschlossen",
      "verloren",
    ];

    for (const phase of validPhases) {
      expect(ProjectPhaseEnum.safeParse(phase).success).toBe(true);
    }
  });

  it("rejects invalid phases", () => {
    expect(ProjectPhaseEnum.safeParse("invalid").success).toBe(false);
    expect(ProjectPhaseEnum.safeParse("").success).toBe(false);
    expect(ProjectPhaseEnum.safeParse(123).success).toBe(false);
  });

  it("contains exactly 11 phases", () => {
    expect(ProjectPhaseEnum.options).toHaveLength(11);
  });
});

describe("TransitionTriggerEnum", () => {
  it("accepts auto, manual, system", () => {
    expect(TransitionTriggerEnum.safeParse("auto").success).toBe(true);
    expect(TransitionTriggerEnum.safeParse("manual").success).toBe(true);
    expect(TransitionTriggerEnum.safeParse("system").success).toBe(true);
  });

  it("rejects invalid triggers", () => {
    expect(TransitionTriggerEnum.safeParse("cron").success).toBe(false);
  });
});

describe("AdvancePhaseInputSchema", () => {
  it("validates a complete input", () => {
    const input = {
      projectId: 1,
      targetPhase: "angebot_erstellt",
      trigger: "manual",
      reason: "Test",
    };
    const result = AdvancePhaseInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("defaults trigger to manual", () => {
    const input = {
      projectId: 1,
      targetPhase: "angebot_erstellt",
    };
    const result = AdvancePhaseInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trigger).toBe("manual");
    }
  });

  it("rejects negative projectId", () => {
    const input = {
      projectId: -1,
      targetPhase: "angebot_erstellt",
    };
    expect(AdvancePhaseInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects invalid targetPhase", () => {
    const input = {
      projectId: 1,
      targetPhase: "invalid_phase",
    };
    expect(AdvancePhaseInputSchema.safeParse(input).success).toBe(false);
  });
});

// ============================================
// PHASE TRANSITIONS TESTS
// ============================================

describe("PHASE_TRANSITIONS", () => {
  it("contains transitions for the complete sales pipeline", () => {
    const salesTransitions = PHASE_TRANSITIONS.filter(
      (t) =>
        t.from === "objektaufnahme" ||
        t.from === "angebot_erstellt" ||
        t.from === "angebot_versendet" ||
        t.from === "nachfassen"
    );
    expect(salesTransitions.length).toBeGreaterThanOrEqual(5);
  });

  it("contains transitions for the execution pipeline", () => {
    const execTransitions = PHASE_TRANSITIONS.filter(
      (t) =>
        t.from === "auftrag_gewonnen" ||
        t.from === "planung" ||
        t.from === "vorbereitung" ||
        t.from === "durchfuehrung" ||
        t.from === "abnahme"
    );
    expect(execTransitions.length).toBeGreaterThanOrEqual(5);
  });

  it("allows verloren from angebot_versendet and nachfassen", () => {
    const verlorenTransitions = PHASE_TRANSITIONS.filter((t) => t.to === "verloren");
    expect(verlorenTransitions.length).toBeGreaterThanOrEqual(2);
    expect(verlorenTransitions.some((t) => t.from === "angebot_versendet")).toBe(true);
    expect(verlorenTransitions.some((t) => t.from === "nachfassen")).toBe(true);
  });

  it("every transition has a guardName", () => {
    for (const t of PHASE_TRANSITIONS) {
      expect(t.guardName).toBeTruthy();
      expect(typeof t.guardName).toBe("string");
    }
  });

  it("every transition has a label and description", () => {
    for (const t of PHASE_TRANSITIONS) {
      expect(t.label).toBeTruthy();
      expect(t.description).toBeTruthy();
    }
  });

  it("no duplicate transitions exist", () => {
    const keys = PHASE_TRANSITIONS.map((t) => `${t.from}->${t.to}`);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});

// ============================================
// PHASE METADATA TESTS
// ============================================

describe("PHASE_METADATA", () => {
  it("contains metadata for all 11 phases", () => {
    expect(PHASE_METADATA).toHaveLength(11);
  });

  it("every phase has a unique order", () => {
    const orders = PHASE_METADATA.map((m) => m.order);
    const uniqueOrders = new Set(orders);
    expect(orders.length).toBe(uniqueOrders.size);
  });

  it("every phase has a color in hex format", () => {
    for (const m of PHASE_METADATA) {
      expect(m.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("every phase has a valid category", () => {
    const validCategories = ["vertrieb", "ausfuehrung", "abschluss", "sonder"];
    for (const m of PHASE_METADATA) {
      expect(validCategories).toContain(m.category);
    }
  });

  it("nextStepRoute returns a valid path", () => {
    for (const m of PHASE_METADATA) {
      const route = m.nextStepRoute(42);
      expect(route).toMatch(/^\//);
      expect(typeof route).toBe("string");
    }
  });
});

// ============================================
// HELPER FUNCTION TESTS
// ============================================

describe("getAllowedTransitions", () => {
  it("returns transitions from objektaufnahme", () => {
    const transitions = getAllowedTransitions("objektaufnahme");
    expect(transitions.length).toBeGreaterThanOrEqual(1);
    expect(transitions[0].to).toBe("angebot_erstellt");
  });

  it("returns multiple transitions from angebot_versendet", () => {
    const transitions = getAllowedTransitions("angebot_versendet");
    expect(transitions.length).toBeGreaterThanOrEqual(2); // nachfassen, auftrag_gewonnen, verloren
  });

  it("returns empty array for abgeschlossen", () => {
    const transitions = getAllowedTransitions("abgeschlossen");
    expect(transitions).toHaveLength(0);
  });

  it("returns empty array for verloren", () => {
    const transitions = getAllowedTransitions("verloren");
    expect(transitions).toHaveLength(0);
  });
});

describe("isTransitionAllowed", () => {
  it("allows objektaufnahme -> angebot_erstellt", () => {
    expect(isTransitionAllowed("objektaufnahme", "angebot_erstellt")).toBe(true);
  });

  it("allows angebot_versendet -> nachfassen", () => {
    expect(isTransitionAllowed("angebot_versendet", "nachfassen")).toBe(true);
  });

  it("allows angebot_versendet -> auftrag_gewonnen", () => {
    expect(isTransitionAllowed("angebot_versendet", "auftrag_gewonnen")).toBe(true);
  });

  it("disallows objektaufnahme -> durchfuehrung (skip)", () => {
    expect(isTransitionAllowed("objektaufnahme", "durchfuehrung")).toBe(false);
  });

  it("disallows abgeschlossen -> objektaufnahme (backward)", () => {
    expect(isTransitionAllowed("abgeschlossen", "objektaufnahme")).toBe(false);
  });

  it("disallows same phase transition", () => {
    expect(isTransitionAllowed("planung", "planung")).toBe(false);
  });
});

describe("getPhaseMetadata", () => {
  it("returns metadata for objektaufnahme", () => {
    const meta = getPhaseMetadata("objektaufnahme");
    expect(meta).toBeDefined();
    expect(meta!.label).toBe("Objektaufnahme");
    expect(meta!.color).toBe("#77bc1f");
    expect(meta!.category).toBe("vertrieb");
  });

  it("returns metadata for verloren", () => {
    const meta = getPhaseMetadata("verloren");
    expect(meta).toBeDefined();
    expect(meta!.label).toBe("Verloren");
    expect(meta!.color).toBe("#ef4444");
    expect(meta!.category).toBe("sonder");
  });

  it("returns undefined for invalid phase", () => {
    const meta = getPhaseMetadata("invalid" as ProjectPhase);
    expect(meta).toBeUndefined();
  });
});

describe("getNextPhase", () => {
  it("returns angebot_erstellt after objektaufnahme", () => {
    expect(getNextPhase("objektaufnahme")).toBe("angebot_erstellt");
  });

  it("returns angebot_versendet after angebot_erstellt", () => {
    expect(getNextPhase("angebot_erstellt")).toBe("angebot_versendet");
  });

  it("returns null for abgeschlossen (end state)", () => {
    expect(getNextPhase("abgeschlossen")).toBeNull();
  });

  it("returns null for verloren (end state)", () => {
    expect(getNextPhase("verloren")).toBeNull();
  });

  it("follows the complete pipeline order", () => {
    const expectedOrder: ProjectPhase[] = [
      "objektaufnahme",
      "angebot_erstellt",
      "angebot_versendet",
      "nachfassen",
      "auftrag_gewonnen",
      "planung",
      "vorbereitung",
      "durchfuehrung",
      "abnahme",
      "abgeschlossen",
    ];

    for (let i = 0; i < expectedOrder.length - 1; i++) {
      expect(getNextPhase(expectedOrder[i])).toBe(expectedOrder[i + 1]);
    }
  });
});
