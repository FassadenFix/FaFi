/**
 * KW-3: Anfahrtskosten aus Bibliothek
 * 
 * Testet die Ablösung der hardcodierten Anfahrtskosten durch Bibliothek-Einträge:
 * 1. DB: Bibliothek-Einträge für An-/Abfahrt Regional und Überregional existieren
 * 2. DB: Preise und Einheiten stimmen mit den offiziellen FassadenFix-Werten überein
 * 3. Logik: Anfahrtskosten-Berechnung mit Bibliothek-Werten (regional ≤30km, überregional >30km)
 * 4. Logik: Fallback auf FESTPREISE wenn Bibliothek leer
 * 5. Frontend: AngebotWizard-Komponenten haben anfahrtPreise als Prop
 * 6. Frontend: KalkulationStep und ZusammenfassungStep zeigen Bibliothek-Namen
 * 7. Cleanup: berechneAnfahrt-Funktion wurde entfernt (durch Bibliothek-Logik ersetzt)
 */
import { describe, it, expect } from "vitest";
import { libraryServicesCRUD } from "./db";
import * as fs from "fs";
import * as path from "path";

// ─── Anfahrtskosten-Berechnungslogik (aus AngebotWizard extrahiert) ─────────
const FESTPREISE = {
  anfahrtRegional: 45,
  anfahrtProKm: 0.85,
};

interface AnfahrtPreise {
  anfahrtRegional: number;
  anfahrtProKm: number;
  regionalName: string;
  ueberregionalName: string;
  regionalUnit: string;
  ueberregionalUnit: string;
}

/**
 * Simuliert die useMemo-Logik aus AngebotWizard:
 * Lädt Anfahrtspreise aus Bibliothek-Services mit Fallback auf FESTPREISE
 */
function parseAnfahrtPreise(services: any[]): AnfahrtPreise {
  const aktiveServices = services.filter((s: any) => s.status === 'aktiv');
  const regional = aktiveServices.find((s: any) => s.name.includes('Regional') && (s.name.includes('Anfahrt') || s.name.includes('Abfahrt')));
  const ueberregional = aktiveServices.find((s: any) => s.name.includes('berregional') && (s.name.includes('Anfahrt') || s.name.includes('Abfahrt')));
  return {
    anfahrtRegional: regional ? parseFloat(regional.basePrice || '45') : FESTPREISE.anfahrtRegional,
    anfahrtProKm: ueberregional ? parseFloat(ueberregional.basePrice || '0.85') : FESTPREISE.anfahrtProKm,
    regionalName: regional?.name || 'An-/Abfahrt Regional',
    ueberregionalName: ueberregional?.name || 'An-/Abfahrt Überregional',
    regionalUnit: regional?.pricingUnit || 'pauschal',
    ueberregionalUnit: ueberregional?.pricingUnit || 'pro km',
  };
}

/**
 * Berechnet Anfahrtskosten basierend auf Entfernung und Bibliothek-Preisen
 */
function berechneAnfahrtAusBibliothek(entfernungKm: number, preise: AnfahrtPreise): number {
  if (entfernungKm <= 30) {
    return preise.anfahrtRegional;
  }
  return Math.round(entfernungKm * preise.anfahrtProKm * 100) / 100;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("KW-3: Anfahrtskosten aus Bibliothek", () => {
  
  describe("Datenbank: Bibliothek-Einträge vorhanden", () => {
    it("libraryServicesCRUD existiert und hat list-Funktion", () => {
      expect(libraryServicesCRUD).toBeDefined();
      expect(typeof libraryServicesCRUD.list).toBe("function");
    });

    it("An-/Abfahrt Regional existiert in der Bibliothek", async () => {
      const services = await libraryServicesCRUD.list();
      const regional = services.find((s: any) => 
        s.name.includes('Regional') && (s.name.includes('Anfahrt') || s.name.includes('Abfahrt'))
      );
      expect(regional).toBeDefined();
      expect(regional!.name).toBe("An-/Abfahrt Regional");
      expect(regional!.status).toBe("aktiv");
    });

    it("An-/Abfahrt Überregional existiert in der Bibliothek", async () => {
      const services = await libraryServicesCRUD.list();
      const ueberregional = services.find((s: any) => 
        s.name.includes('berregional') && (s.name.includes('Anfahrt') || s.name.includes('Abfahrt'))
      );
      expect(ueberregional).toBeDefined();
      expect(ueberregional!.name).toBe("An-/Abfahrt Überregional");
      expect(ueberregional!.status).toBe("aktiv");
    });

    it("Regional-Preis ist 45,00 € (pauschal)", async () => {
      const services = await libraryServicesCRUD.list();
      const regional = services.find((s: any) => s.name === "An-/Abfahrt Regional");
      expect(parseFloat(regional!.basePrice)).toBe(45.00);
      expect(regional!.pricingUnit).toBe("pauschal");
    });

    it("Überregional-Preis ist 0,85 €/km", async () => {
      const services = await libraryServicesCRUD.list();
      const ueberregional = services.find((s: any) => s.name === "An-/Abfahrt Überregional");
      expect(parseFloat(ueberregional!.basePrice)).toBe(0.85);
      expect(ueberregional!.pricingUnit).toBe("pro km");
    });
  });

  describe("Berechnungslogik: Anfahrtskosten aus Bibliothek-Werten", () => {
    const bibliothekPreise: AnfahrtPreise = {
      anfahrtRegional: 45,
      anfahrtProKm: 0.85,
      regionalName: "An-/Abfahrt Regional",
      ueberregionalName: "An-/Abfahrt Überregional",
      regionalUnit: "pauschal",
      ueberregionalUnit: "pro km",
    };

    it("Entfernung ≤30 km → Regional-Pauschale (45 €)", () => {
      expect(berechneAnfahrtAusBibliothek(10, bibliothekPreise)).toBe(45);
      expect(berechneAnfahrtAusBibliothek(25, bibliothekPreise)).toBe(45);
      expect(berechneAnfahrtAusBibliothek(30, bibliothekPreise)).toBe(45);
    });

    it("Entfernung >30 km → Überregional (km × 0,85 €)", () => {
      expect(berechneAnfahrtAusBibliothek(50, bibliothekPreise)).toBe(42.50);
      expect(berechneAnfahrtAusBibliothek(100, bibliothekPreise)).toBe(85.00);
      expect(berechneAnfahrtAusBibliothek(200, bibliothekPreise)).toBe(170.00);
    });

    it("Grenzwert: 31 km ist überregional", () => {
      expect(berechneAnfahrtAusBibliothek(31, bibliothekPreise)).toBe(26.35);
    });

    it("Rundung auf 2 Dezimalstellen", () => {
      const result = berechneAnfahrtAusBibliothek(33, bibliothekPreise);
      expect(result).toBe(28.05); // 33 × 0.85 = 28.05
    });
  });

  describe("Fallback: Wenn Bibliothek leer ist", () => {
    it("Leere Service-Liste → FESTPREISE als Fallback", () => {
      const preise = parseAnfahrtPreise([]);
      expect(preise.anfahrtRegional).toBe(45);
      expect(preise.anfahrtProKm).toBe(0.85);
      expect(preise.regionalName).toBe("An-/Abfahrt Regional");
      expect(preise.ueberregionalName).toBe("An-/Abfahrt Überregional");
    });

    it("Nur inaktive Services → FESTPREISE als Fallback", () => {
      const inaktiveServices = [
        { name: "An-/Abfahrt Regional", basePrice: "99.00", pricingUnit: "pauschal", status: "inaktiv" },
        { name: "An-/Abfahrt Überregional", basePrice: "1.50", pricingUnit: "pro km", status: "inaktiv" },
      ];
      const preise = parseAnfahrtPreise(inaktiveServices);
      expect(preise.anfahrtRegional).toBe(45); // Fallback, nicht 99
      expect(preise.anfahrtProKm).toBe(0.85); // Fallback, nicht 1.50
    });
  });

  describe("Bibliothek-Werte korrekt geparst", () => {
    it("Aktive Services werden korrekt übernommen", () => {
      const services = [
        { name: "An-/Abfahrt Regional", basePrice: "55.00", pricingUnit: "pauschal", status: "aktiv" },
        { name: "An-/Abfahrt Überregional", basePrice: "1.20", pricingUnit: "pro km", status: "aktiv" },
      ];
      const preise = parseAnfahrtPreise(services);
      expect(preise.anfahrtRegional).toBe(55);
      expect(preise.anfahrtProKm).toBe(1.20);
      expect(preise.regionalName).toBe("An-/Abfahrt Regional");
      expect(preise.ueberregionalName).toBe("An-/Abfahrt Überregional");
      expect(preise.regionalUnit).toBe("pauschal");
      expect(preise.ueberregionalUnit).toBe("pro km");
    });
  });

  describe("Frontend: AngebotWizard-Komponenten", () => {
    const wizardSource = fs.readFileSync(
      path.join(__dirname, "../client/src/components/AngebotWizard.tsx"),
      "utf-8"
    );

    it("BiblioPreise Interface ist definiert (erweitert von AnfahrtPreise)", () => {
      expect(wizardSource).toContain("interface BiblioPreise");
      expect(wizardSource).toContain("type AnfahrtPreise = BiblioPreise");
      expect(wizardSource).toContain("anfahrtRegional: number");
      expect(wizardSource).toContain("anfahrtProKm: number");
      expect(wizardSource).toContain("regionalName: string");
      expect(wizardSource).toContain("ueberregionalName: string");
      // KP-1: Neue Felder für Bühne, Übernachtung, Baustelleneinrichtung
      expect(wizardSource).toContain("buehneProTag: number");
      expect(wizardSource).toContain("uebernachtungProNacht: number");
      expect(wizardSource).toContain("baustelleneinrichtung: number");
    });

    it("KalkulationStepProps enthält anfahrtPreise", () => {
      expect(wizardSource).toContain("anfahrtPreise: AnfahrtPreise;");
      // Prüfe dass es in KalkulationStepProps ist
      const kalkulationPropsMatch = wizardSource.match(/interface KalkulationStepProps \{[\s\S]*?\}/);
      expect(kalkulationPropsMatch).toBeTruthy();
      expect(kalkulationPropsMatch![0]).toContain("anfahrtPreise: AnfahrtPreise");
    });

    it("ZusammenfassungStepProps enthält anfahrtPreise", () => {
      const zusammenfassungPropsMatch = wizardSource.match(/interface ZusammenfassungStepProps \{[\s\S]*?\}/);
      expect(zusammenfassungPropsMatch).toBeTruthy();
      expect(zusammenfassungPropsMatch![0]).toContain("anfahrtPreise: AnfahrtPreise");
    });

    it("anfahrtPreise wird als Prop an KalkulationStep übergeben", () => {
      expect(wizardSource).toContain("anfahrtPreise={anfahrtPreise}");
    });

    it("anfahrtPreise wird als Prop an ZusammenfassungStep übergeben", () => {
      // Prüfe dass es im ZusammenfassungStep-Aufruf vorhanden ist
      const zusammenfassungCall = wizardSource.match(/<ZusammenfassungStep[\s\S]*?\/>/);
      expect(zusammenfassungCall).toBeTruthy();
      expect(zusammenfassungCall![0]).toContain("anfahrtPreise={anfahrtPreise}");
    });

    it("Bibliothek-Services werden via tRPC geladen", () => {
      expect(wizardSource).toContain("trpc.library.services.list.useQuery()");
    });

    it("useMemo berechnet anfahrtPreise aus Bibliothek-Services", () => {
      expect(wizardSource).toContain("const anfahrtPreise = useMemo<BiblioPreise>");
      expect(wizardSource).toContain("Regional");
      expect(wizardSource).toContain("berregional");
    });

    it("berechneAnfahrt-Funktion wurde entfernt (durch Bibliothek ersetzt)", () => {
      expect(wizardSource).not.toContain("function berechneAnfahrt(");
      expect(wizardSource).toContain("berechneAnfahrt entfernt");
    });

    it("Kalkulation verwendet anfahrtPreise statt FESTPREISE für Anfahrt", () => {
      // Die Kalkulation im useMemo sollte anfahrtPreise verwenden
      expect(wizardSource).toContain("anfahrtPreise.anfahrtRegional");
      expect(wizardSource).toContain("anfahrtPreise.anfahrtProKm");
    });

    it("Tabelle zeigt Bibliothek-Namen (regionalName/ueberregionalName)", () => {
      expect(wizardSource).toContain("anfahrtPreise.regionalName");
      expect(wizardSource).toContain("anfahrtPreise.ueberregionalName");
    });

    it("Tabelle zeigt '(Bibliothek)' Hinweis", () => {
      expect(wizardSource).toContain("(Bibliothek)");
    });

    it("FESTPREISE enthält weiterhin Fallback-Werte", () => {
      expect(wizardSource).toContain("anfahrtRegional: 45");
      expect(wizardSource).toContain("anfahrtProKm: 0.85");
    });
  });
});
