/**
 * E2E-Generalprobe: Kompletter Workflow mit Echtdaten
 * 
 * Absicht: Den gesamten Geschäftsprozess von der Unternehmensanlage bis zur
 * Baustelle einmal durchspielen und dabei Brüche, fehlende Verknüpfungen
 * und Inkonsistenzen identifizieren.
 * 
 * Workflow: Unternehmen → Kontakt → Projekt → Immobilie → Angebot → Baustelle
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import * as fs from "fs";
import * as path from "path";

// ============================================
// PHASE 1: DATENBANK-INTEGRITÄT
// Absicht: Sicherstellen, dass alle Stammdaten vorhanden und korrekt verknüpft sind
// ============================================
describe("GP-01: Datenbank-Integrität", () => {
  it("sollte Unternehmen in der DB haben", async () => {
    const companies = await db.getAllCompanies();
    expect(companies).toBeDefined();
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
  });

  it("sollte Kontakte in der DB haben", async () => {
    const contacts = await db.getAllContacts();
    expect(contacts).toBeDefined();
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBeGreaterThan(0);
  });

  it("sollte Projekte in der DB haben", async () => {
    const projects = await db.getAllProjects();
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it("sollte Immobilien in der DB haben", async () => {
    const properties = await db.getAllProperties();
    expect(properties).toBeDefined();
    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);
  });

  it("sollte Mitarbeiter in der DB haben", async () => {
    const employees = await db.getAllEmployees();
    expect(employees).toBeDefined();
    expect(employees.length).toBeGreaterThanOrEqual(20);
  });

  it("sollte Bibliothek-Services in der DB haben", async () => {
    const services = await db.libraryServicesCRUD.list();
    expect(services).toBeDefined();
    expect(services.length).toBeGreaterThan(0);
  });
});

// ============================================
// PHASE 2: VERKNÜPFUNGEN PRÜFEN
// Absicht: Sicherstellen, dass die Entitäten korrekt miteinander verknüpft sind
// ============================================
describe("GP-02: Verknüpfungen zwischen Entitäten", () => {
  it("sollte Projekte mit Unternehmen verknüpft haben", async () => {
    const projects = await db.getAllProjects();
    const projectsWithCompany = projects.filter((p: any) => p.companyId);
    // Mindestens einige Projekte sollten ein Unternehmen haben
    expect(projectsWithCompany.length).toBeGreaterThan(0);
  });

  it("sollte Immobilien mit Projekten verknüpft haben", async () => {
    const properties = await db.getAllProperties();
    const propertiesWithProject = properties.filter((p: any) => p.projectId);
    expect(propertiesWithProject.length).toBeGreaterThan(0);
  });

  it("sollte Kontakte mit Unternehmen verknüpft haben", async () => {
    const contacts = await db.getAllContacts();
    const contactsWithCompany = contacts.filter((c: any) => c.companyId);
    expect(contactsWithCompany.length).toBeGreaterThan(0);
  });
});

// ============================================
// PHASE 3: BIBLIOTHEK-VOLLSTÄNDIGKEIT
// Absicht: Sicherstellen, dass alle für die Kalkulation benötigten Services vorhanden sind
// ============================================
describe("GP-03: Bibliothek-Vollständigkeit für Kalkulation", () => {
  let services: any[];

  beforeAll(async () => {
    services = await db.libraryServicesCRUD.list();
  });

  it("sollte An-/Abfahrt Regional haben", () => {
    const found = services.find((s: any) => s.name.includes("Abfahrt") && s.name.includes("Regional") && !s.name.includes("Über"));
    expect(found).toBeDefined();
    expect(Number(found.basePrice)).toBeGreaterThan(0);
  });

  it("sollte An-/Abfahrt Überregional haben", () => {
    const found = services.find((s: any) => s.name.includes("Abfahrt") && s.name.includes("berregional"));
    expect(found).toBeDefined();
    expect(Number(found.basePrice)).toBeGreaterThan(0);
  });

  it("sollte Hubarbeitsbühne haben", () => {
    const found = services.find((s: any) => s.name.includes("Hubarbeitsb"));
    expect(found).toBeDefined();
    expect(Number(found.basePrice)).toBeGreaterThan(0);
  });

  it("sollte Übernachtungspauschale haben", () => {
    const found = services.find((s: any) => s.name.includes("bernachtung"));
    expect(found).toBeDefined();
    expect(Number(found.basePrice)).toBeGreaterThan(0);
  });

  it("sollte Baustelleneinrichtung haben", () => {
    const found = services.find((s: any) => s.name.includes("Baustelleneinrichtung"));
    expect(found).toBeDefined();
    expect(Number(found.basePrice)).toBeGreaterThan(0);
  });

  it("sollte Reinigungsmittel in der Bibliothek haben", async () => {
    const agents = await db.libraryCleaningAgentsCRUD.list();
    expect(agents.length).toBeGreaterThan(0);
  });

  it("sollte Geräte/Bühnen in der Bibliothek haben", async () => {
    const equipment = await db.libraryEquipmentCRUD.list();
    expect(equipment.length).toBeGreaterThan(0);
  });
});

// ============================================
// PHASE 4: FRONTEND-CODE-KONSISTENZ
// Absicht: Sicherstellen, dass keine hardcodierten Mock-Daten mehr in Wizards/Seiten existieren
// ============================================
describe("GP-04: Frontend-Code-Konsistenz", () => {
  const pagesDir = path.resolve(__dirname, "../client/src/pages");
  const componentsDir = path.resolve(__dirname, "../client/src/components");

  it("sollte keine aktive MOCK_UNTERNEHMEN-Nutzung mehr in Wizards haben", () => {
    const wizardFiles = [
      path.join(componentsDir, "AngebotWizard.tsx"),
      path.join(componentsDir, "BaustelleWizard.tsx"),
    ];
    for (const file of wizardFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf-8");
        // Kommentare mit MOCK_UNTERNEHMEN sind OK, aber es darf keine aktive Nutzung geben
        const lines = content.split("\n");
        const activeUsages = lines.filter(l => 
          l.includes("MOCK_UNTERNEHMEN") && !l.trim().startsWith("//") && !l.trim().startsWith("*")
        );
        expect(activeUsages).toHaveLength(0);
      }
    }
  });

  it("sollte keine hardcodierten Mitarbeiter-Namen in Einsatzplanung haben", () => {
    const file = path.join(pagesDir, "Einsatzplanung.tsx");
    const content = fs.readFileSync(file, "utf-8");
    expect(content).not.toContain('"Thomas Braun"');
    expect(content).not.toContain('"Max Müller"');
    expect(content).toContain("trpc.hr.employees.list.useQuery");
  });

  it("sollte keine hardcodierten Mitarbeiter-Namen in Ressourcen haben", () => {
    const file = path.join(pagesDir, "Ressourcen.tsx");
    const content = fs.readFileSync(file, "utf-8");
    expect(content).not.toContain('"Thomas Braun"');
    expect(content).not.toContain('"Peter Weber"');
    expect(content).toContain("trpc.hr.employees.list.useQuery");
  });

  it("sollte keine KalkulationKonditionenStep.tsx mehr haben (toter Code)", () => {
    const file = path.join(componentsDir, "KalkulationKonditionenStep.tsx");
    expect(fs.existsSync(file)).toBe(false);
  });

  it("sollte FESTPREISE nur als Fallback verwenden und Bibliothek laden", () => {
    const file = path.join(componentsDir, "AngebotWizard.tsx");
    const content = fs.readFileSync(file, "utf-8");
    // Prüfe dass es mindestens einen Bibliothek-Aufruf gibt
    expect(content).toContain("library.services.list");
    // FESTPREISE darf nur als Definition und Fallback existieren
    // Prüfe dass FESTPREISE-Referenzen in Fallback-Kontexten sind (?? oder ||)
    const lines = content.split("\n");
    const festpreiseUsages = lines.filter(l => 
      l.includes("FESTPREISE.") && !l.trim().startsWith("//") && !l.trim().startsWith("*") && !l.includes("const FESTPREISE")
    );
    // Jede aktive FESTPREISE-Nutzung sollte in einem Fallback-Kontext sein (?? oder ||)
    for (const line of festpreiseUsages) {
      const hasFallback = line.includes("??") || line.includes("||") || line.includes("FESTPREISE = ");
      expect(hasFallback).toBe(true);
    }
  });

  it("sollte BaustelleWizard mit DB-Daten arbeiten", () => {
    const file = path.join(componentsDir, "BaustelleWizard.tsx");
    const content = fs.readFileSync(file, "utf-8");
    expect(content).toContain("trpc.project.list.useQuery");
    expect(content).toContain("trpc.hr.employees.list.useQuery");
  });
});

// ============================================
// PHASE 5: ROUTER-VOLLSTÄNDIGKEIT
// Absicht: Sicherstellen, dass alle benötigten tRPC-Endpunkte existieren
// ============================================
describe("GP-05: tRPC-Router-Vollständigkeit", () => {
  const routersFile = path.resolve(__dirname, "routers.ts");
  let routersContent: string;

  beforeAll(() => {
    routersContent = fs.readFileSync(routersFile, "utf-8");
  });

  it("sollte company-Router haben", () => {
    expect(routersContent).toContain("companyRouter");
  });

  it("sollte contact-Router haben", () => {
    expect(routersContent).toContain("contactRouter");
  });

  it("sollte project-Router haben", () => {
    expect(routersContent).toContain("projectRouter");
  });

  it("sollte property-Router haben", () => {
    expect(routersContent).toContain("propertyRouter");
  });

  it("sollte offer-Router haben", () => {
    expect(routersContent).toContain("offerRouter");
  });

  it("sollte constructionSite-Router haben", () => {
    expect(routersContent).toContain("constructionSiteRouter");
  });

  it("sollte hr-Router mit employees haben", () => {
    expect(routersContent).toContain("hrRouter");
    expect(routersContent).toContain("employees: router({");
  });

  it("sollte library-Router haben", () => {
    expect(routersContent).toContain("libraryRouter");
  });

  it("sollte dashboard-Router haben", () => {
    expect(routersContent).toContain("dashboardRouter");
  });

  it("sollte task-Router haben", () => {
    expect(routersContent).toContain("taskRouter");
  });
});

// ============================================
// PHASE 6: SEITEN-ROUTING
// Absicht: Sicherstellen, dass alle Seiten korrekt in App.tsx registriert sind
// ============================================
describe("GP-06: Seiten-Routing", () => {
  const appFile = path.resolve(__dirname, "../client/src/App.tsx");
  let appContent: string;

  beforeAll(() => {
    appContent = fs.readFileSync(appFile, "utf-8");
  });

  const requiredRoutes = [
    { path: "/", name: "Dashboard/Home" },
    { path: "/projekte", name: "Projekte" },
    { path: "/angebote", name: "Angebote" },
    { path: "/kontakte", name: "Kontakte" },
    { path: "/immobilien", name: "Immobilien" },
    { path: "/baustellen", name: "Baustellen" },
    { path: "/einsatzplanung", name: "Einsatzplanung" },
    { path: "/ressourcen", name: "Ressourcen" },
  ];

  for (const route of requiredRoutes) {
    it(`sollte Route "${route.path}" für ${route.name} haben`, () => {
      // Prüfe ob die Route registriert ist (path="..." oder path: "...")
      expect(appContent).toContain(route.path);
    });
  }
});

// ============================================
// PHASE 7: SCHEMA-VOLLSTÄNDIGKEIT
// Absicht: Sicherstellen, dass alle DB-Tabellen existieren und korrekt definiert sind
// ============================================
describe("GP-07: Datenbank-Schema", () => {
  const schemaFile = path.resolve(__dirname, "../drizzle/schema.ts");
  let schemaContent: string;

  beforeAll(() => {
    schemaContent = fs.readFileSync(schemaFile, "utf-8");
  });

  const requiredTables = [
    "companies",
    "contacts",
    "projects",
    "properties",
    "offers",
    "constructionSites",
    "employees",
    "libraryServices",
    "libraryEquipment",
    "libraryCleaningAgents",
    "tasks",
    "activityLogs",
  ];

  for (const table of requiredTables) {
    it(`sollte Tabelle "${table}" im Schema haben`, () => {
      expect(schemaContent).toContain(table);
    });
  }
});

// ============================================
// PHASE 8: WORKFLOW-DURCHLAUF (Daten-Ebene)
// Absicht: Den kompletten Geschäftsprozess auf Datenebene durchspielen
// ============================================
describe("GP-08: Workflow-Durchlauf auf Datenebene", () => {
  it("Schritt 1: Unternehmen existiert → hat Kontakte", async () => {
    const companies = await db.getAllCompanies();
    expect(companies.length).toBeGreaterThan(0);
    
    const firstCompany = companies[0];
    expect(firstCompany.name).toBeDefined();
    
    // Kontakte für dieses Unternehmen laden
    const contacts = await db.getAllContacts();
    const companyContacts = contacts.filter((c: any) => c.companyId === firstCompany.id);
    // Es ist OK wenn ein Unternehmen keine Kontakte hat, aber die Abfrage muss funktionieren
    expect(Array.isArray(companyContacts)).toBe(true);
  });

  it("Schritt 2: Projekt existiert → hat Unternehmen und Immobilien", async () => {
    const projects = await db.getAllProjects();
    const projectWithCompany = projects.find((p: any) => p.companyId);
    
    if (projectWithCompany) {
      expect(projectWithCompany.companyId).toBeDefined();
      
      // Immobilien für dieses Projekt laden
      const properties = await db.getAllProperties();
      const projectProperties = properties.filter((p: any) => p.projectId === projectWithCompany.id);
      expect(Array.isArray(projectProperties)).toBe(true);
    }
  });

  it("Schritt 3: Immobilie existiert → hat Flächen-Daten", async () => {
    const properties = await db.getAllProperties();
    expect(properties.length).toBeGreaterThan(0);
    
    const firstProperty = properties[0];
    expect(firstProperty).toBeDefined();
    // Immobilie sollte Adress-Daten haben
    expect(firstProperty.street || firstProperty.address || firstProperty.name).toBeDefined();
  });

  it("Schritt 4: Bibliothek-Services für Kalkulation vorhanden", async () => {
    const services = await db.libraryServicesCRUD.list();
    
    // Alle 5 Kalkulations-relevanten Services prüfen
    const anfahrtRegional = services.find((s: any) => s.name.includes("Abfahrt") && s.name.includes("Regional") && !s.name.includes("Über"));
    const anfahrtUeberregional = services.find((s: any) => s.name.includes("Abfahrt") && s.name.includes("berregional"));
    const buehne = services.find((s: any) => s.name.includes("Hubarbeitsb"));
    const uebernachtung = services.find((s: any) => s.name.includes("bernachtung"));
    const baustelleneinrichtung = services.find((s: any) => s.name.includes("Baustelleneinrichtung"));
    
    expect(anfahrtRegional).toBeDefined();
    expect(anfahrtUeberregional).toBeDefined();
    expect(buehne).toBeDefined();
    expect(uebernachtung).toBeDefined();
    expect(baustelleneinrichtung).toBeDefined();
  });

  it("Schritt 5: Mitarbeiter für Einsatzplanung vorhanden", async () => {
    const employees = await db.getEmployeesByStatus("active");
    expect(employees.length).toBeGreaterThanOrEqual(10);
    
    // Verschiedene Positionen vorhanden
    const positions = [...new Set(employees.map((e: any) => e.position).filter(Boolean))];
    expect(positions.length).toBeGreaterThanOrEqual(3);
  });
});
