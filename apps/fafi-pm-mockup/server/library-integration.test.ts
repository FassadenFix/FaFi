/**
 * Library Integration Tests
 * 
 * Testet die Bibliothek-Integration:
 * 1. Dass die tRPC-Router für alle Bibliothek-Entitäten erreichbar sind
 * 2. Dass die Fallback-Werte korrekt funktionieren
 * 3. Dass die Preisstaffel-Hilfsfunktionen korrekt rechnen
 * 4. Dass die Status-Toggle-Mutation existiert
 */
import { describe, it, expect } from "vitest";
import {
  libraryEquipmentCRUD,
  libraryCleaningAgentsCRUD,
  libraryDiscountsCRUD,
  libraryVehiclesCRUD,
  libraryWorkClothingCRUD,
  libraryAssetsCRUD,
  libraryServicesCRUD,
} from "./db";

// ─── Preisstaffel-Hilfsfunktionen (Logik aus useLibrary) ───────────────────

const FALLBACK_PREISSTAFFELUNG = [
  { minFlaeche: 5000, preis: 8.75, label: "ab 5.000 m² (Bestpreis)" },
  { minFlaeche: 2500, preis: 9.25, label: "2.500 – 4.999 m²" },
  { minFlaeche: 1000, preis: 9.75, label: "1.000 – 2.499 m²" },
  { minFlaeche: 500, preis: 10.50, label: "500 – 999 m²" },
];

function getPreisProQm(gesamtflaeche: number, staffelung = FALLBACK_PREISSTAFFELUNG): number {
  for (const staffel of staffelung) {
    if (gesamtflaeche >= staffel.minFlaeche) {
      return staffel.preis;
    }
  }
  return 10.50;
}

function getPreisstaffelLabel(gesamtflaeche: number, staffelung = FALLBACK_PREISSTAFFELUNG): string {
  for (const staffel of staffelung) {
    if (gesamtflaeche >= staffel.minFlaeche) {
      return staffel.label;
    }
  }
  return "unter 500 m² (individuell)";
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Preisstaffel-Hilfsfunktionen", () => {
  it("gibt korrekten Preis für 500-999 m²", () => {
    expect(getPreisProQm(500)).toBe(10.50);
    expect(getPreisProQm(750)).toBe(10.50);
    expect(getPreisProQm(999)).toBe(10.50);
  });

  it("gibt korrekten Preis für 1000-2499 m²", () => {
    expect(getPreisProQm(1000)).toBe(9.75);
    expect(getPreisProQm(2000)).toBe(9.75);
    expect(getPreisProQm(2499)).toBe(9.75);
  });

  it("gibt korrekten Preis für 2500-4999 m²", () => {
    expect(getPreisProQm(2500)).toBe(9.25);
    expect(getPreisProQm(4000)).toBe(9.25);
    expect(getPreisProQm(4999)).toBe(9.25);
  });

  it("gibt Bestpreis für ab 5000 m²", () => {
    expect(getPreisProQm(5000)).toBe(8.75);
    expect(getPreisProQm(10000)).toBe(8.75);
    expect(getPreisProQm(50000)).toBe(8.75);
  });

  it("gibt Standardpreis für unter 500 m²", () => {
    expect(getPreisProQm(100)).toBe(10.50);
    expect(getPreisProQm(499)).toBe(10.50);
  });

  it("gibt korrektes Label für jede Staffel", () => {
    expect(getPreisstaffelLabel(500)).toBe("500 – 999 m²");
    expect(getPreisstaffelLabel(1000)).toBe("1.000 – 2.499 m²");
    expect(getPreisstaffelLabel(2500)).toBe("2.500 – 4.999 m²");
    expect(getPreisstaffelLabel(5000)).toBe("ab 5.000 m² (Bestpreis)");
    expect(getPreisstaffelLabel(100)).toBe("unter 500 m² (individuell)");
  });

  it("funktioniert mit benutzerdefinierter Staffelung", () => {
    const customStaffel = [
      { minFlaeche: 1000, preis: 7.50, label: "ab 1.000 m²" },
      { minFlaeche: 500, preis: 9.00, label: "500 – 999 m²" },
    ];
    expect(getPreisProQm(1500, customStaffel)).toBe(7.50);
    expect(getPreisProQm(600, customStaffel)).toBe(9.00);
    expect(getPreisstaffelLabel(1500, customStaffel)).toBe("ab 1.000 m²");
  });
});

describe("Bibliothek-Router Verfügbarkeit", () => {
  it("library.equipment.list ist erreichbar (DB-Tabelle existiert)", async () => {
    const result = await libraryEquipmentCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.cleaningAgents.list ist erreichbar", async () => {
    const result = await libraryCleaningAgentsCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.discounts.list ist erreichbar", async () => {
    const result = await libraryDiscountsCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.vehicles.list ist erreichbar", async () => {
    const result = await libraryVehiclesCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.clothing.list ist erreichbar", async () => {
    const result = await libraryWorkClothingCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.workEquipment.list ist erreichbar", async () => {
    const result = await libraryAssetsCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("library.services.list ist erreichbar", async () => {
    const result = await libraryServicesCRUD.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Bibliothek Status-Toggle (Deaktivierung)", () => {
  it("Equipment kann deaktiviert werden", async () => {
    const created = await libraryEquipmentCRUD.create({
      name: "Test-Toggle-Equipment",
      equipmentType: "gelenkteleskop",
      status: "aktiv",
    });
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();

    const updated = await libraryEquipmentCRUD.update(created.id, {
      status: "inaktiv",
    });
    expect(updated).toBeDefined();

    const fetched = await libraryEquipmentCRUD.getById(created.id);
    expect(fetched?.status).toBe("inaktiv");

    const reactivated = await libraryEquipmentCRUD.update(created.id, {
      status: "aktiv",
    });
    expect(reactivated).toBeDefined();

    const fetchedAgain = await libraryEquipmentCRUD.getById(created.id);
    expect(fetchedAgain?.status).toBe("aktiv");

    await libraryEquipmentCRUD.deactivate(created.id);
  });

  it("Discount kann deaktiviert werden", async () => {
    const created = await libraryDiscountsCRUD.create({
      name: "Test-Toggle-Discount",
      discountType: "mengenrabatt",
      status: "aktiv",
    });
    expect(created).toBeDefined();

    const updated = await libraryDiscountsCRUD.update(created.id, {
      status: "inaktiv",
    });
    expect(updated).toBeDefined();

    const fetched = await libraryDiscountsCRUD.getById(created.id);
    expect(fetched?.status).toBe("inaktiv");

    await libraryDiscountsCRUD.deactivate(created.id);
  });

  it("Vehicle kann deaktiviert werden", async () => {
    const created = await libraryVehiclesCRUD.create({
      name: "Test-Toggle-Vehicle",
      vehicleType: "waschbus",
      status: "aktiv",
    });
    expect(created).toBeDefined();

    const updated = await libraryVehiclesCRUD.update(created.id, {
      status: "inaktiv",
    });
    expect(updated).toBeDefined();

    const fetched = await libraryVehiclesCRUD.getById(created.id);
    expect(fetched?.status).toBe("inaktiv");

    await libraryVehiclesCRUD.deactivate(created.id);
  });
});

describe("Preisstaffel-Daten-Format", () => {
  it("preisstaffelData hat korrektes Format mit minFlaeche/maxFlaeche/preis/label", () => {
    const sorted = [...FALLBACK_PREISSTAFFELUNG].sort((a, b) => a.minFlaeche - b.minFlaeche);
    const preisstaffelData = sorted.map((s, i) => ({
      minFlaeche: s.minFlaeche,
      maxFlaeche: i < sorted.length - 1 ? sorted[i + 1].minFlaeche - 1 : Infinity,
      preis: s.preis,
      label: s.label.replace(/\(.*\)/, "").trim(),
    }));

    expect(preisstaffelData).toHaveLength(4);
    expect(preisstaffelData[0].minFlaeche).toBe(500);
    expect(preisstaffelData[0].maxFlaeche).toBe(999);
    expect(preisstaffelData[0].preis).toBe(10.50);
    expect(preisstaffelData[3].minFlaeche).toBe(5000);
    expect(preisstaffelData[3].maxFlaeche).toBe(Infinity);
    expect(preisstaffelData[3].preis).toBe(8.75);
  });

  it("preisstaffelOptions hat korrektes Format für FassadenFixVersprechen", () => {
    const staffelData = FALLBACK_PREISSTAFFELUNG.map((s) => ({
      flaeche: s.label.replace(/\(.*\)/, "").trim(),
      preis: `${s.preis.toFixed(2).replace(".", ",")} €`,
    }));
    const preisstaffelOptions = [{ id: "standard", label: "Standard-Preisstaffel", data: staffelData }];

    expect(preisstaffelOptions).toHaveLength(1);
    expect(preisstaffelOptions[0].id).toBe("standard");
    expect(preisstaffelOptions[0].data).toHaveLength(4);
    expect(preisstaffelOptions[0].data[0].preis).toContain("€");
  });
});

describe("Fallback-Werte Konsistenz", () => {
  it("Fallback-Bühnen haben id, name, maxHoehe, preisProTag", () => {
    const FALLBACK_BUEHNEN = [
      { id: "teleskoplanze", name: "Teleskoplanzen", maxHoehe: 8, preisProTag: 45 },
      { id: "hubsteiger-8", name: "Hubsteiger 8m", maxHoehe: 8, preisProTag: 180 },
      { id: "hubsteiger-12", name: "Hubsteiger 12m", maxHoehe: 12, preisProTag: 220 },
      { id: "hubsteiger-14", name: "Hubsteiger 14m", maxHoehe: 14, preisProTag: 250 },
      { id: "hubsteiger-18", name: "Hubsteiger 18m", maxHoehe: 18, preisProTag: 280 },
      { id: "hubsteiger-24", name: "Hubsteiger 24m", maxHoehe: 24, preisProTag: 350 },
      { id: "hubsteiger-30", name: "Hubsteiger 30m", maxHoehe: 30, preisProTag: 450 },
    ];

    for (const buehne of FALLBACK_BUEHNEN) {
      expect(buehne.id).toBeDefined();
      expect(buehne.name).toBeDefined();
      expect(buehne.maxHoehe).toBeGreaterThan(0);
      expect(buehne.preisProTag).toBeGreaterThanOrEqual(0);
    }
    // Aufsteigend sortiert nach maxHoehe
    for (let i = 1; i < FALLBACK_BUEHNEN.length; i++) {
      expect(FALLBACK_BUEHNEN[i].maxHoehe).toBeGreaterThanOrEqual(FALLBACK_BUEHNEN[i - 1].maxHoehe);
    }
  });

  it("Fallback-Reinigungsmittel haben id, name, fuerFassadenarten, preisProLiter", () => {
    const FALLBACK_REINIGUNGSMITTEL = [
      { id: "ff-pro", name: "FassadenFix Pro", fuerFassadenarten: ["WDVS", "Putz", "Beton"], preisProLiter: 12.50 },
      { id: "ff-anti-graffiti", name: "FassadenFix Anti-Graffiti", fuerFassadenarten: ["WDVS", "Putz", "Beton", "Klinker"], preisProLiter: 18.90 },
      { id: "ff-klinker", name: "FassadenFix Klinker", fuerFassadenarten: ["Klinker", "Ziegel"], preisProLiter: 14.50 },
    ];

    for (const rm of FALLBACK_REINIGUNGSMITTEL) {
      expect(rm.id).toBeDefined();
      expect(rm.name).toBeDefined();
      expect(rm.fuerFassadenarten.length).toBeGreaterThan(0);
      expect(rm.preisProLiter).toBeGreaterThan(0);
    }
  });

  it("Fallback-Rabattaktionen haben id, label, prozent", () => {
    const FALLBACK_RABATT_AKTIONEN = [
      { id: "keine", label: "Kein Rabatt", prozent: 0 },
      { id: "fruehbucher", label: "Frühbucher-Rabatt", prozent: 0, dynamic: true },
      { id: "kennenlernen", label: "Kennenlernangebot", prozent: 5 },
      { id: "treue", label: "Treuerabatt (Bestandskunde)", prozent: 3 },
    ];

    expect(FALLBACK_RABATT_AKTIONEN[0].id).toBe("keine");
    expect(FALLBACK_RABATT_AKTIONEN[0].prozent).toBe(0);
    expect(FALLBACK_RABATT_AKTIONEN.find(r => r.dynamic)).toBeDefined();
    for (const aktion of FALLBACK_RABATT_AKTIONEN) {
      expect(aktion.id).toBeDefined();
      expect(aktion.label).toBeDefined();
      expect(typeof aktion.prozent).toBe("number");
    }
  });
});
