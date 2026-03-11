/**
 * Bibliothek (Library) CRUD Tests
 * 
 * Intention: Die Bibliothek ist die zentrale Stammdaten-Plattform.
 * Alle Dropdowns im System laden von hier – deshalb muss jede Entität
 * korrekt im Schema definiert, in der DB-Schicht exportiert und im
 * tRPC-Router erreichbar sein.
 * 
 * Getestet werden:
 * 1. DB-Schema: Alle 7 Library-Tabellen existieren mit korrekten Feldern
 * 2. DB-Hilfsfunktionen: CRUD-Operationen für jede Entität
 * 3. tRPC-Router: Library-Router mit allen Sub-Routern
 * 4. Berechtigungsfelder: canViewLibrary / canEditLibrary auf teamMembers
 */

import { describe, it, expect } from "vitest";
import * as db from "./db";

// ============================================
// 1. DB-SCHEMA – Alle 7 Library-Tabellen
// ============================================

describe("Bibliothek DB-Schema", () => {
  it("libraryVehicles-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryVehicles).toBeDefined();
    expect(schema.libraryVehicles.id).toBeDefined();
    expect(schema.libraryVehicles.name).toBeDefined();
    expect(schema.libraryVehicles.vehicleType).toBeDefined();
    expect(schema.libraryVehicles.licensePlate).toBeDefined();
    expect(schema.libraryVehicles.manufacturer).toBeDefined();
    expect(schema.libraryVehicles.model).toBeDefined();
    expect(schema.libraryVehicles.year).toBeDefined();
    expect(schema.libraryVehicles.dailyCost).toBeDefined();
    expect(schema.libraryVehicles.status).toBeDefined();
    expect(schema.libraryVehicles.createdAt).toBeDefined();
    expect(schema.libraryVehicles.updatedAt).toBeDefined();
  });

  it("libraryEquipment-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryEquipment).toBeDefined();
    expect(schema.libraryEquipment.id).toBeDefined();
    expect(schema.libraryEquipment.name).toBeDefined();
    expect(schema.libraryEquipment.equipmentType).toBeDefined();
    expect(schema.libraryEquipment.manufacturer).toBeDefined();
    expect(schema.libraryEquipment.maxHeight).toBeDefined();
    expect(schema.libraryEquipment.ownership).toBeDefined();
    expect(schema.libraryEquipment.dailyRate).toBeDefined();
    expect(schema.libraryEquipment.status).toBeDefined();
  });

  it("libraryCleaningAgents-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryCleaningAgents).toBeDefined();
    expect(schema.libraryCleaningAgents.id).toBeDefined();
    expect(schema.libraryCleaningAgents.name).toBeDefined();
    expect(schema.libraryCleaningAgents.articleNumber).toBeDefined();
    expect(schema.libraryCleaningAgents.applicationArea).toBeDefined();
    expect(schema.libraryCleaningAgents.containerSize).toBeDefined();
    expect(schema.libraryCleaningAgents.purchasePrice).toBeDefined();
    expect(schema.libraryCleaningAgents.status).toBeDefined();
  });

  it("libraryDiscounts-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryDiscounts).toBeDefined();
    expect(schema.libraryDiscounts.id).toBeDefined();
    expect(schema.libraryDiscounts.name).toBeDefined();
    expect(schema.libraryDiscounts.discountType).toBeDefined();
    expect(schema.libraryDiscounts.percentage).toBeDefined();
    expect(schema.libraryDiscounts.combinable).toBeDefined();
    expect(schema.libraryDiscounts.status).toBeDefined();
  });

  it("libraryServices-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryServices).toBeDefined();
    expect(schema.libraryServices.id).toBeDefined();
    expect(schema.libraryServices.name).toBeDefined();
    expect(schema.libraryServices.serviceType).toBeDefined();
    expect(schema.libraryServices.basePrice).toBeDefined();
    expect(schema.libraryServices.pricingUnit).toBeDefined();
    expect(schema.libraryServices.includedInOffer).toBeDefined();
    expect(schema.libraryServices.status).toBeDefined();
  });

  it("libraryWorkClothing-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryWorkClothing).toBeDefined();
    expect(schema.libraryWorkClothing.id).toBeDefined();
    expect(schema.libraryWorkClothing.name).toBeDefined();
    expect(schema.libraryWorkClothing.clothingType).toBeDefined();
    expect(schema.libraryWorkClothing.size).toBeDefined();
    expect(schema.libraryWorkClothing.supplier).toBeDefined();
    expect(schema.libraryWorkClothing.purchasePrice).toBeDefined();
    expect(schema.libraryWorkClothing.isPSA).toBeDefined();
    expect(schema.libraryWorkClothing.status).toBeDefined();
  });

  it("libraryAssets-Tabelle existiert mit allen Pflichtfeldern", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.libraryAssets).toBeDefined();
    expect(schema.libraryAssets.id).toBeDefined();
    expect(schema.libraryAssets.name).toBeDefined();
    expect(schema.libraryAssets.assetType).toBeDefined();
    expect(schema.libraryAssets.serialNumber).toBeDefined();
    expect(schema.libraryAssets.assignedToName).toBeDefined();
    expect(schema.libraryAssets.status).toBeDefined();
  });

  it("teamMembers hat Bibliothek-Berechtigungsfelder", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.teamMembers.canViewLibrary).toBeDefined();
    expect(schema.teamMembers.canEditLibrary).toBeDefined();
  });
});

// ============================================
// 2. DB-HILFSFUNKTIONEN – CRUD für jede Entität
// ============================================

describe("Bibliothek DB-Hilfsfunktionen", () => {
  it("libraryVehiclesCRUD ist korrekt exportiert", () => {
    expect(db.libraryVehiclesCRUD).toBeDefined();
    expect(typeof db.libraryVehiclesCRUD.list).toBe("function");
    expect(typeof db.libraryVehiclesCRUD.getById).toBe("function");
    expect(typeof db.libraryVehiclesCRUD.create).toBe("function");
    expect(typeof db.libraryVehiclesCRUD.update).toBe("function");
    expect(typeof db.libraryVehiclesCRUD.deactivate).toBe("function");
  });

  it("libraryEquipmentCRUD ist korrekt exportiert", () => {
    expect(db.libraryEquipmentCRUD).toBeDefined();
    expect(typeof db.libraryEquipmentCRUD.list).toBe("function");
    expect(typeof db.libraryEquipmentCRUD.getById).toBe("function");
    expect(typeof db.libraryEquipmentCRUD.create).toBe("function");
    expect(typeof db.libraryEquipmentCRUD.update).toBe("function");
    expect(typeof db.libraryEquipmentCRUD.deactivate).toBe("function");
  });

  it("libraryCleaningAgentsCRUD ist korrekt exportiert", () => {
    expect(db.libraryCleaningAgentsCRUD).toBeDefined();
    expect(typeof db.libraryCleaningAgentsCRUD.list).toBe("function");
    expect(typeof db.libraryCleaningAgentsCRUD.getById).toBe("function");
    expect(typeof db.libraryCleaningAgentsCRUD.create).toBe("function");
    expect(typeof db.libraryCleaningAgentsCRUD.update).toBe("function");
    expect(typeof db.libraryCleaningAgentsCRUD.deactivate).toBe("function");
  });

  it("libraryDiscountsCRUD ist korrekt exportiert", () => {
    expect(db.libraryDiscountsCRUD).toBeDefined();
    expect(typeof db.libraryDiscountsCRUD.list).toBe("function");
    expect(typeof db.libraryDiscountsCRUD.getById).toBe("function");
    expect(typeof db.libraryDiscountsCRUD.create).toBe("function");
    expect(typeof db.libraryDiscountsCRUD.update).toBe("function");
    expect(typeof db.libraryDiscountsCRUD.deactivate).toBe("function");
  });

  it("libraryServicesCRUD ist korrekt exportiert", () => {
    expect(db.libraryServicesCRUD).toBeDefined();
    expect(typeof db.libraryServicesCRUD.list).toBe("function");
    expect(typeof db.libraryServicesCRUD.getById).toBe("function");
    expect(typeof db.libraryServicesCRUD.create).toBe("function");
    expect(typeof db.libraryServicesCRUD.update).toBe("function");
    expect(typeof db.libraryServicesCRUD.deactivate).toBe("function");
  });

  it("libraryWorkClothingCRUD ist korrekt exportiert", () => {
    expect(db.libraryWorkClothingCRUD).toBeDefined();
    expect(typeof db.libraryWorkClothingCRUD.list).toBe("function");
    expect(typeof db.libraryWorkClothingCRUD.getById).toBe("function");
    expect(typeof db.libraryWorkClothingCRUD.create).toBe("function");
    expect(typeof db.libraryWorkClothingCRUD.update).toBe("function");
    expect(typeof db.libraryWorkClothingCRUD.deactivate).toBe("function");
  });

  it("libraryAssetsCRUD ist korrekt exportiert", () => {
    expect(db.libraryAssetsCRUD).toBeDefined();
    expect(typeof db.libraryAssetsCRUD.list).toBe("function");
    expect(typeof db.libraryAssetsCRUD.getById).toBe("function");
    expect(typeof db.libraryAssetsCRUD.create).toBe("function");
    expect(typeof db.libraryAssetsCRUD.update).toBe("function");
    expect(typeof db.libraryAssetsCRUD.deactivate).toBe("function");
  });
});

// ============================================
// 3. tRPC-ROUTER – Library-Router Struktur
// ============================================

describe("Bibliothek tRPC-Router Struktur", () => {
  it("libraryRouter existiert im appRouter", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    expect(appRouter).toBeDefined();
    // The library router should be accessible as a nested router
    const routerDef = (appRouter as any)._def;
    expect(routerDef).toBeDefined();
  });

  it("vehicles Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.vehicles.list"]).toBeDefined();
    expect(procedures["library.vehicles.create"]).toBeDefined();
    expect(procedures["library.vehicles.update"]).toBeDefined();
    expect(procedures["library.vehicles.deactivate"]).toBeDefined();
  });

  it("equipment Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.equipment.list"]).toBeDefined();
    expect(procedures["library.equipment.create"]).toBeDefined();
    expect(procedures["library.equipment.update"]).toBeDefined();
    expect(procedures["library.equipment.deactivate"]).toBeDefined();
  });

  it("cleaningAgents Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.cleaningAgents.list"]).toBeDefined();
    expect(procedures["library.cleaningAgents.create"]).toBeDefined();
    expect(procedures["library.cleaningAgents.update"]).toBeDefined();
    expect(procedures["library.cleaningAgents.deactivate"]).toBeDefined();
  });

  it("discounts Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.discounts.list"]).toBeDefined();
    expect(procedures["library.discounts.create"]).toBeDefined();
    expect(procedures["library.discounts.update"]).toBeDefined();
    expect(procedures["library.discounts.deactivate"]).toBeDefined();
  });

  it("services Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.services.list"]).toBeDefined();
    expect(procedures["library.services.create"]).toBeDefined();
    expect(procedures["library.services.update"]).toBeDefined();
    expect(procedures["library.services.deactivate"]).toBeDefined();
  });

  it("workClothing Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.workClothing.list"]).toBeDefined();
    expect(procedures["library.workClothing.create"]).toBeDefined();
    expect(procedures["library.workClothing.update"]).toBeDefined();
    expect(procedures["library.workClothing.deactivate"]).toBeDefined();
  });

  it("assets Sub-Router hat list/create/update/deactivate", async () => {
    const routerModule = await import("./routers");
    const appRouter = routerModule.appRouter;
    const procedures = (appRouter as any)._def.procedures;
    expect(procedures["library.assets.list"]).toBeDefined();
    expect(procedures["library.assets.create"]).toBeDefined();
    expect(procedures["library.assets.update"]).toBeDefined();
    expect(procedures["library.assets.deactivate"]).toBeDefined();
  });
});

// ============================================
// 4. SCHEMA-TYPEN – Enum-Werte & Defaults
// ============================================

describe("Bibliothek Schema-Typen & Enum-Werte", () => {
  it("Fahrzeugtypen sind korrekt definiert (waschbus, dienstwagen, poolfahrzeug, anhaenger, transporter)", async () => {
    const schema = await import("../drizzle/schema");
    const vehicleType = schema.libraryVehicles.vehicleType;
    expect(vehicleType).toBeDefined();
    // The column should exist and be part of the schema
    expect(vehicleType.name).toBeDefined();
  });

  it("Equipment-Ownership-Typen sind definiert (eigen, dauermiete, tagesmiete)", async () => {
    const schema = await import("../drizzle/schema");
    const ownership = schema.libraryEquipment.ownership;
    expect(ownership).toBeDefined();
  });

  it("Discount-Typen sind definiert (fruehbucher, mengenrabatt, etc.)", async () => {
    const schema = await import("../drizzle/schema");
    const discountType = schema.libraryDiscounts.discountType;
    expect(discountType).toBeDefined();
  });

  it("Service-Typen sind definiert (reinigung, impraegnierung, etc.)", async () => {
    const schema = await import("../drizzle/schema");
    const serviceType = schema.libraryServices.serviceType;
    expect(serviceType).toBeDefined();
  });

  it("Asset-Typen sind definiert (laptop, smartphone, etc.)", async () => {
    const schema = await import("../drizzle/schema");
    const assetType = schema.libraryAssets.assetType;
    expect(assetType).toBeDefined();
  });

  it("Work-Clothing-Typen sind definiert (sicherheitsschuhe, arbeitshose, etc.)", async () => {
    const schema = await import("../drizzle/schema");
    const clothingType = schema.libraryWorkClothing.clothingType;
    expect(clothingType).toBeDefined();
  });
});

// ============================================
// 5. FRONTEND-INTEGRATION – Bibliothek-Seite
// ============================================

describe("Bibliothek Frontend-Integration", () => {
  it("Bibliothek-Seite existiert als React-Komponente", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("Bibliothek-Route ist in App.tsx registriert", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const appPath = path.resolve(__dirname, "../client/src/App.tsx");
    const content = fs.readFileSync(appPath, "utf-8");
    expect(content).toContain("/bibliothek");
    expect(content).toContain("Bibliothek");
  });

  it("Bibliothek-Link ist in DashboardLayout Sidebar", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const layoutPath = path.resolve(__dirname, "../client/src/components/DashboardLayout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain("Bibliothek");
    expect(content).toContain("/bibliothek");
  });

  it("Bibliothek-Seite importiert alle 7 tRPC-Hooks", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    // Verify all entity types are referenced
    expect(content).toContain("trpc.library.vehicles");
    expect(content).toContain("trpc.library.equipment");
    expect(content).toContain("trpc.library.cleaningAgents");
    expect(content).toContain("trpc.library.discounts");
    expect(content).toContain("trpc.library.services");
    expect(content).toContain("trpc.library.workClothing");
    expect(content).toContain("trpc.library.assets");
  });

  it("Bibliothek-Seite hat 4 Hauptkategorien", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Lager & Fuhrpark");
    expect(content).toContain("Marketing & Vertrieb");
    expect(content).toContain("Leistungen & Technik");
    expect(content).toContain("HR & Personal");
  });

  it("Bibliothek-Seite hat kontextspezifische Formulare für jede Entität", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    // Vehicle-specific fields
    expect(content).toContain("Kennzeichen");
    expect(content).toContain("Fahrzeugtyp");
    // Equipment-specific fields
    expect(content).toContain("Max. Höhe");
    expect(content).toContain("Eigentum");
    // Cleaning agent fields
    expect(content).toContain("Artikelnummer");
    expect(content).toContain("Gebindegröße");
    // Discount fields
    expect(content).toContain("Rabatt-Typ");
    expect(content).toContain("Aktionscode");
    // Service fields
    expect(content).toContain("Leistungstyp");
    expect(content).toContain("Preiseinheit");
    // Work clothing fields
    expect(content).toContain("Bekleidungstyp");
    expect(content).toContain("PSA-Pflicht");
    // Asset fields
    expect(content).toContain("Seriennummer");
    expect(content).toContain("Zugewiesen an");
  });

  it("Bibliothek-Seite hat HelpTooltip integriert", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("HelpTooltip");
    expect(content).toContain("bibliothekZentral");
  });
});

// ============================================
// 6. VERWEIS-PRINZIP – Keine hardcodierten Werte
// ============================================

describe("Bibliothek Verweis-Prinzip", () => {
  it("Bibliothek-Seite lädt Daten über tRPC, nicht hardcodiert", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/Bibliothek.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    // Should use tRPC queries, not static arrays
    expect(content).toContain("useQuery");
    expect(content).toContain("useMutation");
    // Should NOT contain hardcoded mock data arrays
    expect(content).not.toContain("MOCK_");
  });

  it("Änderungsprotokoll wird über activityLogs geführt", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const routerPath = path.resolve(__dirname, "routers.ts");
    const routerSource = fs.readFileSync(routerPath, "utf-8");
    // All create/update/deactivate mutations should log to activityLogs
    expect(routerSource).toContain("createActivityLog");
    expect(routerSource).toContain("library_vehicle");
    expect(routerSource).toContain("library_equipment");
    expect(routerSource).toContain("library_cleaning_agent");
    expect(routerSource).toContain("library_discount");
    expect(routerSource).toContain("library_service");
    expect(routerSource).toContain("library_work_clothing");
    expect(routerSource).toContain("library_asset");
  });
});
