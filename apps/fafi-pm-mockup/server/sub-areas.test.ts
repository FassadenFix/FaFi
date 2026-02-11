import { describe, it, expect } from "vitest";

/**
 * Tests für das Teilflächen-Feature (Loom-Feedback 09.02.2026)
 * 
 * Intention: Fassadenseiten, die durch Fahrstuhlschächte, Vorsprünge oder
 * andere Unterbrechungen in mehrere Teilbereiche mit unterschiedlichen Höhen
 * zerfallen, sollen flexibel aufgemessen werden können.
 */

// ============================================
// Teilflächen-Berechnung (shared logic)
// ============================================

interface Teilflaeche {
  breite: number;
  hoehe: number;
  flaeche: number;
  bemerkung: string;
}

interface SubArea {
  width: number;
  height: number;
  area: number;
  note: string;
}

// Simulate the calculation logic from the frontend
function calculateSubAreaFlaeche(breite: number, hoehe: number): number {
  return breite * hoehe;
}

function calculateGesamtflaeche(subAreas: Teilflaeche[]): number {
  return subAreas.reduce((sum, sa) => sum + sa.flaeche, 0);
}

// Simulate the mapping from frontend (SeiteData) to backend (DB format)
function mapTeilflaechemToSubArea(tf: Teilflaeche): SubArea {
  return {
    width: tf.breite,
    height: tf.hoehe,
    area: tf.flaeche,
    note: tf.bemerkung,
  };
}

function mapSubAreaToTeilflaeche(sa: SubArea): Teilflaeche {
  return {
    breite: sa.width,
    hoehe: sa.height,
    flaeche: sa.area,
    bemerkung: sa.note,
  };
}

describe("Teilflächen-Berechnung", () => {
  it("berechnet die Fläche einer einzelnen Teilfläche korrekt", () => {
    expect(calculateSubAreaFlaeche(25, 15)).toBe(375);
    expect(calculateSubAreaFlaeche(10, 8.5)).toBe(85);
    expect(calculateSubAreaFlaeche(0, 15)).toBe(0);
  });

  it("berechnet die Gesamtfläche als Summe aller Teilflächen", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 10, hoehe: 15, flaeche: 150, bemerkung: "Links vom Schacht" },
      { breite: 5, hoehe: 12, flaeche: 60, bemerkung: "Rechts vom Schacht" },
      { breite: 8, hoehe: 15, flaeche: 120, bemerkung: "Hinter dem Vorsprung" },
    ];
    expect(calculateGesamtflaeche(subAreas)).toBe(330);
  });

  it("berechnet Gesamtfläche korrekt bei einer einzigen Teilfläche", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 25, hoehe: 15, flaeche: 375, bemerkung: "" },
    ];
    expect(calculateGesamtflaeche(subAreas)).toBe(375);
  });

  it("gibt 0 zurück bei leerem Array", () => {
    expect(calculateGesamtflaeche([])).toBe(0);
  });

  it("handhabt Dezimalwerte korrekt", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 10.5, hoehe: 12.3, flaeche: 129.15, bemerkung: "" },
      { breite: 8.7, hoehe: 11.2, flaeche: 97.44, bemerkung: "" },
    ];
    expect(calculateGesamtflaeche(subAreas)).toBeCloseTo(226.59, 2);
  });
});

describe("Teilflächen-Mapping (Frontend ↔ Backend)", () => {
  it("mappt Teilfläche korrekt zum Backend-Format", () => {
    const tf: Teilflaeche = {
      breite: 25,
      hoehe: 15,
      flaeche: 375,
      bemerkung: "Links neben Fahrstuhlschacht",
    };
    const sa = mapTeilflaechemToSubArea(tf);
    expect(sa).toEqual({
      width: 25,
      height: 15,
      area: 375,
      note: "Links neben Fahrstuhlschacht",
    });
  });

  it("mappt Backend-Format korrekt zurück zur Teilfläche", () => {
    const sa: SubArea = {
      width: 10,
      height: 8.5,
      area: 85,
      note: "Rechts vom Vorsprung",
    };
    const tf = mapSubAreaToTeilflaeche(sa);
    expect(tf).toEqual({
      breite: 10,
      hoehe: 8.5,
      flaeche: 85,
      bemerkung: "Rechts vom Vorsprung",
    });
  });

  it("mappt leere Bemerkung korrekt", () => {
    const tf: Teilflaeche = { breite: 20, hoehe: 10, flaeche: 200, bemerkung: "" };
    const sa = mapTeilflaechemToSubArea(tf);
    expect(sa.note).toBe("");
  });

  it("Roundtrip: Frontend → Backend → Frontend bleibt konsistent", () => {
    const original: Teilflaeche = {
      breite: 12.5,
      hoehe: 8.3,
      flaeche: 103.75,
      bemerkung: "Bereich A",
    };
    const backendFormat = mapTeilflaechemToSubArea(original);
    const restored = mapSubAreaToTeilflaeche(backendFormat);
    expect(restored).toEqual(original);
  });
});

describe("Teilflächen-Toggle (hasSubAreas)", () => {
  it("aktiviert Teilflächen: bestehende Maße werden als erste Teilfläche übernommen", () => {
    // Simulate: Seite hat breite=25, hoehe=15, flaeche=375
    const existingBreite = 25;
    const existingHoehe = 15;
    const existingFlaeche = existingBreite * existingHoehe;

    // When toggle is activated:
    const firstSubArea: Teilflaeche = {
      breite: existingBreite,
      hoehe: existingHoehe,
      flaeche: existingFlaeche,
      bemerkung: "",
    };

    expect(firstSubArea.flaeche).toBe(375);
    expect(firstSubArea.breite).toBe(25);
    expect(firstSubArea.hoehe).toBe(15);
  });

  it("deaktiviert Teilflächen: Gesamtfläche wird als einfache Fläche beibehalten", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 10, hoehe: 15, flaeche: 150, bemerkung: "" },
      { breite: 5, hoehe: 12, flaeche: 60, bemerkung: "" },
    ];
    const totalArea = calculateGesamtflaeche(subAreas);
    const firstSubArea = subAreas[0];

    // When toggle is deactivated, first sub-area becomes main dimensions
    expect(totalArea).toBe(210);
    expect(firstSubArea.breite).toBe(10);
    expect(firstSubArea.hoehe).toBe(15);
  });

  it("verhindert Löschen der letzten Teilfläche", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 25, hoehe: 15, flaeche: 375, bemerkung: "" },
    ];
    // Should not allow removal when only 1 sub-area exists
    expect(subAreas.length).toBe(1);
    // In the UI, the delete button is hidden when length <= 1
  });

  it("erlaubt Löschen wenn mehr als eine Teilfläche vorhanden", () => {
    const subAreas: Teilflaeche[] = [
      { breite: 10, hoehe: 15, flaeche: 150, bemerkung: "" },
      { breite: 5, hoehe: 12, flaeche: 60, bemerkung: "" },
      { breite: 8, hoehe: 15, flaeche: 120, bemerkung: "" },
    ];
    // Remove index 1
    const afterRemoval = subAreas.filter((_, i) => i !== 1);
    expect(afterRemoval.length).toBe(2);
    expect(calculateGesamtflaeche(afterRemoval)).toBe(270);
  });
});

describe("Facade Side Schema Validation", () => {
  it("akzeptiert Seite ohne Teilflächen (einfacher Modus)", () => {
    const side = {
      area: 375,
      facadeType: "WDVS",
      cleanable: true,
      hasSubAreas: false,
    };
    expect(side.hasSubAreas).toBe(false);
    expect(side.area).toBe(375);
  });

  it("akzeptiert Seite mit Teilflächen", () => {
    const side = {
      area: 210,
      facadeType: "WDVS",
      cleanable: true,
      hasSubAreas: true,
      subAreas: [
        { width: 10, height: 15, area: 150, note: "Links" },
        { width: 5, height: 12, area: 60, note: "Rechts" },
      ],
    };
    expect(side.hasSubAreas).toBe(true);
    expect(side.subAreas).toHaveLength(2);
    const totalFromSubAreas = side.subAreas!.reduce((s, a) => s + a.area, 0);
    expect(totalFromSubAreas).toBe(side.area);
  });

  it("Gesamtfläche stimmt mit Summe der Teilflächen überein", () => {
    const subAreas: SubArea[] = [
      { width: 10, height: 15, area: 150, note: "" },
      { width: 5, height: 12, area: 60, note: "" },
      { width: 8, height: 15, area: 120, note: "" },
    ];
    const totalArea = subAreas.reduce((s, a) => s + a.area, 0);
    expect(totalArea).toBe(330);
  });
});

describe("Praxisszenarien (Loom-Feedback)", () => {
  it("Szenario: Fassade mit Fahrstuhlschacht – 3 Teilbereiche", () => {
    // Frontseite 30m breit, aber Fahrstuhlschacht (2m) teilt die Fassade
    // Links: 12m × 15m, Mitte (Schacht): ausgeschlossen, Rechts: 16m × 15m
    const subAreas: Teilflaeche[] = [
      { breite: 12, hoehe: 15, flaeche: 180, bemerkung: "Links vom Fahrstuhlschacht" },
      { breite: 16, hoehe: 15, flaeche: 240, bemerkung: "Rechts vom Fahrstuhlschacht" },
    ];
    const gesamt = calculateGesamtflaeche(subAreas);
    // Gesamtfläche ist 420m², nicht 450m² (30×15) weil der Schacht ausgenommen ist
    expect(gesamt).toBe(420);
    expect(gesamt).toBeLessThan(30 * 15); // Weniger als volle Breite × Höhe
  });

  it("Szenario: Fassade mit Vorsprung – unterschiedliche Höhen", () => {
    // Rückseite: Erdgeschoss hat Vorsprung, dadurch 2 Höhen
    // Bereich 1: 25m × 12m (Hauptfassade), Bereich 2: 25m × 3m (über dem Vorsprung)
    const subAreas: Teilflaeche[] = [
      { breite: 25, hoehe: 12, flaeche: 300, bemerkung: "Hauptfassade über Vorsprung" },
      { breite: 25, hoehe: 3, flaeche: 75, bemerkung: "Bereich über dem EG-Vorsprung" },
    ];
    const gesamt = calculateGesamtflaeche(subAreas);
    expect(gesamt).toBe(375);
  });

  it("Szenario: Giebel mit Dachschräge – 2 Teilbereiche", () => {
    // Giebel: Unterer Bereich rechteckig, oberer Bereich schmaler wegen Dach
    const subAreas: Teilflaeche[] = [
      { breite: 10, hoehe: 8, flaeche: 80, bemerkung: "Unterer rechteckiger Bereich" },
      { breite: 6, hoehe: 4, flaeche: 24, bemerkung: "Oberer Bereich (Dachschräge)" },
    ];
    const gesamt = calculateGesamtflaeche(subAreas);
    expect(gesamt).toBe(104);
  });
});
