/**
 * KP-Konsistenzprüfung Tests
 * 
 * Absicht: Sicherstellen, dass alle Preispositionen im AngebotWizard
 * dynamisch aus der Bibliothek geladen werden und FESTPREISE nur als
 * Fallback dienen. Außerdem: BaustelleWizard nutzt DB-Daten.
 */
import { describe, it, expect } from "vitest";
import { libraryServicesCRUD, getAllProjects, getAllEmployees } from "./db";

describe("KP-1: Bibliothek-Services für Kalkulation", () => {
  it("sollte Übernachtungspauschale in der Bibliothek haben", async () => {
    const services = await libraryServicesCRUD.list();
    const uebernachtung = services.find(
      (s: any) => s.name.includes("bernachtung") && s.status === "aktiv"
    );
    expect(uebernachtung).toBeDefined();
    expect(parseFloat(uebernachtung!.basePrice)).toBe(85);
    expect(uebernachtung!.pricingUnit).toBe("pro Nacht");
  });

  it("sollte Baustelleneinrichtung in der Bibliothek haben", async () => {
    const services = await libraryServicesCRUD.list();
    const baustelleneinrichtung = services.find(
      (s: any) => s.name.includes("Baustelleneinrichtung") && s.status === "aktiv"
    );
    expect(baustelleneinrichtung).toBeDefined();
    expect(parseFloat(baustelleneinrichtung!.basePrice)).toBe(199);
    expect(baustelleneinrichtung!.pricingUnit).toBe("pauschal");
  });

  it("sollte Hubarbeitsbühne in der Bibliothek haben", async () => {
    const services = await libraryServicesCRUD.list();
    const buehne = services.find(
      (s: any) => s.name.includes("Hubarbeitsbühne") && s.status === "aktiv"
    );
    expect(buehne).toBeDefined();
    expect(parseFloat(buehne!.basePrice)).toBe(280);
    expect(buehne!.pricingUnit).toBe("pro Tag");
  });

  it("sollte An-/Abfahrt Regional in der Bibliothek haben", async () => {
    const services = await libraryServicesCRUD.list();
    const regional = services.find(
      (s: any) => s.name.includes("Regional") && s.name.includes("Abfahrt") && s.status === "aktiv"
    );
    expect(regional).toBeDefined();
    expect(parseFloat(regional!.basePrice)).toBe(45);
    expect(regional!.pricingUnit).toBe("pauschal");
  });

  it("sollte An-/Abfahrt Überregional in der Bibliothek haben", async () => {
    const services = await libraryServicesCRUD.list();
    const ueberregional = services.find(
      (s: any) => s.name.includes("berregional") && s.name.includes("Abfahrt") && s.status === "aktiv"
    );
    expect(ueberregional).toBeDefined();
    expect(parseFloat(ueberregional!.basePrice)).toBe(0.85);
    expect(ueberregional!.pricingUnit).toBe("pro km");
  });

  it("sollte alle 5 Kalkulationspositionen als aktive Services haben", async () => {
    const services = await libraryServicesCRUD.list({ status: "aktiv" });
    
    const requiredPatterns = [
      { pattern: "Hubarbeitsbühne", label: "Hubarbeitsbühne" },
      { pattern: "Baustelleneinrichtung", label: "Baustelleneinrichtung" },
      { pattern: "bernachtung", label: "Übernachtungspauschale" },
      { pattern: "Regional", label: "An-/Abfahrt Regional" },
      { pattern: "berregional", label: "An-/Abfahrt Überregional" },
    ];
    
    for (const { pattern, label } of requiredPatterns) {
      const found = services.find((s: any) => s.name.includes(pattern));
      expect(found, `Service "${label}" nicht in Bibliothek gefunden`).toBeDefined();
    }
  });
});

describe("KP-2: BaustelleWizard Datenquellen", () => {
  it("sollte Projekte in der DB haben", async () => {
    const projects = await getAllProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it("sollte aktive Mitarbeiter in der DB haben", async () => {
    const employees = await getAllEmployees();
    const active = employees.filter((e: any) => e.status === "active");
    expect(active.length).toBeGreaterThan(0);
  });

  it("sollte Mitarbeiter mit Leitungsfunktion haben (für Bauleiter-Auswahl)", async () => {
    const employees = await getAllEmployees();
    const leiter = employees.filter((e: any) => 
      e.status === "active" && (
        e.position?.toLowerCase().includes("leiter") ||
        e.position?.toLowerCase().includes("vorarbeiter") ||
        e.position?.toLowerCase().includes("meister")
      )
    );
    expect(leiter.length).toBeGreaterThan(0);
  });
});

describe("KP-3: Kein toter Code", () => {
  it("KalkulationKonditionenStep.tsx sollte nicht mehr existieren", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/KalkulationKonditionenStep.tsx");
    expect(exists).toBe(false);
  });
});
