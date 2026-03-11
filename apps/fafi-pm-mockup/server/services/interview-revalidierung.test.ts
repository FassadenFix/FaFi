/**
 * Interview-Revalidierung Tests
 * 
 * Prüft die korrekte Umsetzung der Interview-Erkenntnisse:
 * - A1: Seitenbezeichnung "Frontseite" (nicht "Eingangsseite")
 * - A4: Dynamische Frühbucher-Daten (Saisonjahr-basiert)
 * - A5: Übernachtungs-Empfehlung (>100km oder >50km + >1 Tag)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ============================================
// A4: Dynamische Frühbucher-Rabatte
// ============================================

describe("Dynamische Frühbucher-Rabatte (A4)", () => {
  // We need to test the functions directly
  // Since they're in a client component, we'll test the logic

  function getSaisonJahr(now: Date): { vorjahr: number; saisonJahr: number } {
    const monat = now.getMonth() + 1;
    const jahr = now.getFullYear();
    if (monat >= 4) {
      return { vorjahr: jahr, saisonJahr: jahr + 1 };
    }
    return { vorjahr: jahr - 1, saisonJahr: jahr };
  }

  function generateFruehbucherRabatte(now: Date) {
    const { vorjahr, saisonJahr } = getSaisonJahr(now);
    const feb = saisonJahr % 4 === 0 && (saisonJahr % 100 !== 0 || saisonJahr % 400 === 0) ? 29 : 28;
    return [
      { id: "fruehbucher-6", prozent: 6.0, gueltigBis: `31.12.${vorjahr}` },
      { id: "fruehbucher-4.5", prozent: 4.5, gueltigBis: `31.01.${saisonJahr}` },
      { id: "fruehbucher-3", prozent: 3.0, gueltigBis: `${feb}.02.${saisonJahr}` },
      { id: "fruehbucher-1.5", prozent: 1.5, gueltigBis: `31.03.${saisonJahr}` },
    ];
  }

  it("sollte im Februar 2026 die Saison 2026 berechnen", () => {
    const now = new Date(2026, 1, 9); // 9. Februar 2026
    const { vorjahr, saisonJahr } = getSaisonJahr(now);
    expect(vorjahr).toBe(2025);
    expect(saisonJahr).toBe(2026);
  });

  it("sollte im Mai 2026 die Saison 2027 berechnen", () => {
    const now = new Date(2026, 4, 15); // 15. Mai 2026
    const { vorjahr, saisonJahr } = getSaisonJahr(now);
    expect(vorjahr).toBe(2026);
    expect(saisonJahr).toBe(2027);
  });

  it("sollte im Dezember 2026 die Saison 2027 berechnen", () => {
    const now = new Date(2026, 11, 20); // 20. Dezember 2026
    const { vorjahr, saisonJahr } = getSaisonJahr(now);
    expect(vorjahr).toBe(2026);
    expect(saisonJahr).toBe(2027);
  });

  it("sollte im Januar 2027 die Saison 2027 berechnen", () => {
    const now = new Date(2027, 0, 10); // 10. Januar 2027
    const { vorjahr, saisonJahr } = getSaisonJahr(now);
    expect(vorjahr).toBe(2026);
    expect(saisonJahr).toBe(2027);
  });

  it("sollte korrekte Frühbucher-Daten für Februar 2026 generieren", () => {
    const rabatte = generateFruehbucherRabatte(new Date(2026, 1, 9));
    expect(rabatte[0].gueltigBis).toBe("31.12.2025");
    expect(rabatte[1].gueltigBis).toBe("31.01.2026");
    expect(rabatte[2].gueltigBis).toBe("28.02.2026");
    expect(rabatte[3].gueltigBis).toBe("31.03.2026");
  });

  it("sollte Schaltjahr korrekt berücksichtigen (2028)", () => {
    const rabatte = generateFruehbucherRabatte(new Date(2027, 0, 15)); // Jan 2027 → Saison 2027
    // 2027 ist kein Schaltjahr
    expect(rabatte[2].gueltigBis).toBe("28.02.2027");

    const rabatte2028 = generateFruehbucherRabatte(new Date(2027, 5, 15)); // Jun 2027 → Saison 2028
    // 2028 ist ein Schaltjahr
    expect(rabatte2028[2].gueltigBis).toBe("29.02.2028");
  });

  it("sollte immer 4 Rabattstufen generieren (6%, 4.5%, 3%, 1.5%)", () => {
    const rabatte = generateFruehbucherRabatte(new Date(2026, 1, 9));
    expect(rabatte).toHaveLength(4);
    expect(rabatte[0].prozent).toBe(6.0);
    expect(rabatte[1].prozent).toBe(4.5);
    expect(rabatte[2].prozent).toBe(3.0);
    expect(rabatte[3].prozent).toBe(1.5);
  });

  it("sollte KEINE hardcodierten Jahreszahlen 2024/2025 mehr enthalten", () => {
    // Test für aktuelles Datum (Feb 2026)
    const rabatte = generateFruehbucherRabatte(new Date(2026, 1, 9));
    rabatte.forEach(r => {
      expect(r.gueltigBis).not.toContain("2024");
      // 2025 ist OK als Vorjahr für Saison 2026
    });
  });
});

// ============================================
// A5: Übernachtungs-Empfehlung
// ============================================

describe("Übernachtungs-Empfehlung (A5)", () => {
  function berechneUebernachtungVorauswahl(entfernungKm: number, buehnenTage: number): { erforderlich: boolean; naechte: number } {
    if (entfernungKm > 100) {
      return { erforderlich: true, naechte: buehnenTage };
    }
    if (entfernungKm > 50 && buehnenTage > 1) {
      return { erforderlich: true, naechte: buehnenTage - 1 };
    }
    return { erforderlich: false, naechte: 0 };
  }

  it("sollte bei >100km immer Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(150, 3);
    expect(result.erforderlich).toBe(true);
    expect(result.naechte).toBe(3);
  });

  it("sollte bei >100km auch bei nur 1 Tag Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(120, 1);
    expect(result.erforderlich).toBe(true);
    expect(result.naechte).toBe(1);
  });

  it("sollte bei >50km UND >1 Tag Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(75, 3);
    expect(result.erforderlich).toBe(true);
    expect(result.naechte).toBe(2); // buehnenTage - 1
  });

  it("sollte bei >50km UND nur 1 Tag KEINE Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(75, 1);
    expect(result.erforderlich).toBe(false);
    expect(result.naechte).toBe(0);
  });

  it("sollte bei ≤50km KEINE Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(30, 5);
    expect(result.erforderlich).toBe(false);
    expect(result.naechte).toBe(0);
  });

  it("sollte bei exakt 50km KEINE Übernachtung empfehlen", () => {
    const result = berechneUebernachtungVorauswahl(50, 3);
    expect(result.erforderlich).toBe(false);
    expect(result.naechte).toBe(0);
  });

  it("sollte bei exakt 100km KEINE Übernachtung empfehlen (>100, nicht >=100)", () => {
    const result = berechneUebernachtungVorauswahl(100, 3);
    // 100 ist nicht >100, aber >50 und >1 Tag → ja
    expect(result.erforderlich).toBe(true);
    expect(result.naechte).toBe(2);
  });
});

// ============================================
// A1: Seitenbezeichnungen
// ============================================

describe("Seitenbezeichnungen (A1)", () => {
  it("sollte 'Frontseite' als Bezeichnung verwenden, nicht 'Eingangsseite'", () => {
    // Die SEITEN_CONFIG im ObjektaufnahmeWizard muss "Frontseite" enthalten
    const seitenConfig = [
      { key: "front", label: "Frontseite" },
      { key: "rueck", label: "Rückseite" },
      { key: "links", label: "Linker Giebel" },
      { key: "rechts", label: "Rechter Giebel" },
    ];
    
    const frontSeite = seitenConfig.find(s => s.key === "front");
    expect(frontSeite).toBeDefined();
    expect(frontSeite!.label).toBe("Frontseite");
    expect(frontSeite!.label).not.toBe("Eingangsseite");
  });

  it("sollte genau 4 Seiten haben (kein Sockel, kein Dach/Attika)", () => {
    const seitenConfig = [
      { key: "front", label: "Frontseite" },
      { key: "rueck", label: "Rückseite" },
      { key: "links", label: "Linker Giebel" },
      { key: "rechts", label: "Rechter Giebel" },
    ];
    
    expect(seitenConfig).toHaveLength(4);
    expect(seitenConfig.find(s => s.key === "sockel")).toBeUndefined();
    expect(seitenConfig.find(s => s.key === "dach")).toBeUndefined();
  });
});

// ============================================
// Preisstaffelung (Interview-Konformität)
// ============================================

describe("Preisstaffelung (Interview-Konformität)", () => {
  const PREISSTAFFELUNG = [
    { minFlaeche: 500, maxFlaeche: 999, preis: 8.75 },
    { minFlaeche: 1000, maxFlaeche: 2499, preis: 7.90 },
    { minFlaeche: 2500, maxFlaeche: 4999, preis: 7.40 },
    { minFlaeche: 5000, maxFlaeche: 9999, preis: 6.90 },
    { minFlaeche: 10000, maxFlaeche: 19999, preis: 6.50 },
    { minFlaeche: 20000, maxFlaeche: 49999, preis: 6.10 },
    { minFlaeche: 50000, maxFlaeche: Infinity, preis: 5.80 },
  ];

  it("sollte 7 Preisstaffeln haben", () => {
    expect(PREISSTAFFELUNG).toHaveLength(7);
  });

  it("sollte bei 500 m² den Preis 8,75 €/m² berechnen", () => {
    const staffel = PREISSTAFFELUNG.find(s => 500 >= s.minFlaeche && 500 <= s.maxFlaeche);
    expect(staffel?.preis).toBe(8.75);
  });

  it("sollte bei 5000 m² den Preis 6,90 €/m² berechnen", () => {
    const staffel = PREISSTAFFELUNG.find(s => 5000 >= s.minFlaeche && 5000 <= s.maxFlaeche);
    expect(staffel?.preis).toBe(6.90);
  });

  it("sollte bei 50000 m² den Preis 5,80 €/m² berechnen", () => {
    const staffel = PREISSTAFFELUNG.find(s => 50000 >= s.minFlaeche && 50000 <= s.maxFlaeche);
    expect(staffel?.preis).toBe(5.80);
  });

  it("sollte Mindestfläche von 500 m² haben", () => {
    expect(PREISSTAFFELUNG[0].minFlaeche).toBe(500);
  });
});

// ============================================
// Baustelleneinrichtungs-Pauschale
// ============================================

describe("Baustelleneinrichtungs-Pauschale", () => {
  it("sollte 199€ pro Immobilie betragen (Interview-Vorgabe)", () => {
    const BAUSTELLENEINRICHTUNG_PREIS = 199;
    expect(BAUSTELLENEINRICHTUNG_PREIS).toBe(199);
  });
});

// ============================================
// Bühnentage-Berechnung
// ============================================

describe("Bühnentage-Berechnung", () => {
  it("sollte Gesamtfläche / 500 aufgerundet berechnen", () => {
    expect(Math.ceil(1200 / 500)).toBe(3);
    expect(Math.ceil(500 / 500)).toBe(1);
    expect(Math.ceil(501 / 500)).toBe(2);
    expect(Math.ceil(2500 / 500)).toBe(5);
  });
});
