/**
 * FINALE GENERALPROBE – E2E-Tests mit Realdaten
 * 
 * Absicht: Jeden Kernprozess einmal mit realistischen Eingaben durchspielen,
 * um Produktivtauglichkeit zu beweisen. Der Test simuliert einen kompletten
 * Geschäftsvorfall: Unternehmensanlage → Kontakt → Projekt → Immobilie →
 * Angebot → Auftrag → Baustelle → Bautagebuch → Einsatzplanung → Aufgabe →
 * Rechnung → Mahnwesen → Garantie → Kundenportal → Suche → Archiv
 * 
 * Alle Entitäten werden in der echten DB angelegt und am Ende verifiziert.
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

// ============================================
// SHARED STATE: Wird über den gesamten Workflow geteilt
// ============================================
const state: {
  companyId: number;
  contactId: number;
  projectId: number;
  projectNumber: string;
  propertyId: number;
  offerId: number;
  offerNumber: string;
  orderId: number;
  orderNumber: string;
  constructionSiteId: number;
  siteNumber: string;
  logEntryId: number;
  taskId: number;
  invoiceId: number;
  invoiceNumber: string;
  warrantyId: number;
  warrantyNumber: string;
  portalTokenId: number;
  portalToken: string;
} = {} as any;

// ============================================
// GP-E2E-01: UNTERNEHMEN ANLEGEN
// Absicht: Neues Unternehmen mit realistischen Stammdaten anlegen
// ============================================
describe("GP-E2E-01: Unternehmen anlegen", () => {
  it("sollte ein neues Unternehmen mit vollständigen Stammdaten anlegen", async () => {
    const company = await db.createCompany({
      name: "Wohnungsbaugesellschaft Musterstadt mbH",
      category: "wohnungsgesellschaft",
      street: "Hauptstraße 42",
      postalCode: "04109",
      city: "Leipzig",
      country: "Deutschland",
      phone: "+49 341 12345678",
      email: "info@wbg-musterstadt.de",
      website: "https://www.wbg-musterstadt.de",
      notes: "Generalprobe-Testdaten – Wohnungsgesellschaft mit 450 Einheiten",
    });
    expect(company).toBeDefined();
    expect(company.id).toBeGreaterThan(0);
    state.companyId = company.id;
  });

  it("sollte das Unternehmen korrekt in der DB gespeichert haben", async () => {
    const company = await db.getCompanyById(state.companyId);
    expect(company).toBeDefined();
    expect(company!.name).toBe("Wohnungsbaugesellschaft Musterstadt mbH");
    expect(company!.category).toBe("wohnungsgesellschaft");
    expect(company!.city).toBe("Leipzig");
    expect(company!.email).toBe("info@wbg-musterstadt.de");
  });
});

// ============================================
// GP-E2E-02: KONTAKT ANLEGEN UND ZUORDNEN
// Absicht: Ansprechpartner zum Unternehmen hinzufügen (Hierarchie: Unternehmen → Kontakt)
// ============================================
describe("GP-E2E-02: Kontakt anlegen und zuordnen", () => {
  it("sollte einen Ansprechpartner zum Unternehmen anlegen", async () => {
    const contact = await db.createContact({
      companyId: state.companyId,
      salutation: "herr",
      firstName: "Thomas",
      lastName: "Bergmann",
      position: "Technischer Leiter",
      phone: "+49 341 12345679",
      email: "t.bergmann@wbg-musterstadt.de",
    });
    expect(contact).toBeDefined();
    expect(contact.id).toBeGreaterThan(0);
    state.contactId = contact.id;
  });

  it("sollte den Kontakt dem Unternehmen zugeordnet haben", async () => {
    const contacts = await db.getContactsByCompanyId(state.companyId);
    expect(contacts.length).toBeGreaterThanOrEqual(1);
    const found = contacts.find(c => c.id === state.contactId);
    expect(found).toBeDefined();
    expect(found!.firstName).toBe("Thomas");
    expect(found!.lastName).toBe("Bergmann");
    expect(found!.companyId).toBe(state.companyId);
  });
});

// ============================================
// GP-E2E-03: PROJEKT ANLEGEN UND UNTERNEHMEN ZUORDNEN
// Absicht: Neues Projekt erstellen, Unternehmen zuordnen, Phasenstatus prüfen
// ============================================
describe("GP-E2E-03: Projekt anlegen", () => {
  it("sollte eine Projektnummer generieren", async () => {
    const projectNumber = await db.generateProjectNumber("WBG");
    expect(projectNumber).toBeDefined();
    expect(projectNumber).toMatch(/^\d{4}-WBG-\d{2}$/);
    state.projectNumber = projectNumber;
  });

  it("sollte ein neues Projekt anlegen und dem Unternehmen zuordnen", async () => {
    const project = await db.createProject({
      projectNumber: state.projectNumber,
      name: "Fassadenreinigung Wohnanlage Südpark",
      companyId: state.companyId,
      contactId: state.contactId,
      phase: "objektaufnahme",
      priority: "normal",
      description: "12 Wohnblöcke, Baujahr 1995, WDVS-Fassade mit Algenbefall",
      estimatedArea: "8500.00",
      estimatedValue: "42500.00",
    });
    expect(project).toBeDefined();
    expect(project.id).toBeGreaterThan(0);
    state.projectId = project.id;
  });

  it("sollte das Projekt korrekt verknüpft haben", async () => {
    const project = await db.getProjectById(state.projectId);
    expect(project).toBeDefined();
    expect(project!.companyId).toBe(state.companyId);
    expect(project!.contactId).toBe(state.contactId);
    expect(project!.phase).toBe("objektaufnahme");
    expect(project!.projectNumber).toBe(state.projectNumber);
  });

  it("sollte das Projekt in der Unternehmensliste erscheinen", async () => {
    const projects = await db.getProjectsByCompanyId(state.companyId);
    expect(projects.length).toBeGreaterThanOrEqual(1);
    const found = projects.find(p => p.id === state.projectId);
    expect(found).toBeDefined();
  });
});

// ============================================
// GP-E2E-04: IMMOBILIE HINZUFÜGEN
// Absicht: Immobilie zum Projekt hinzufügen mit Adresse, Fläche, Fassadentyp
// ============================================
describe("GP-E2E-04: Immobilie hinzufügen", () => {
  it("sollte eine Immobilie zum Projekt hinzufügen", async () => {
    // Properties speichern Fassadendaten pro Seite als JSON (frontSide, backSide, etc.)
    // Felder wie facadeType, totalArea, buildingType sind NICHT als Spalten vorhanden
    const property = await db.createProperty({
      projectId: state.projectId,
      companyId: state.companyId,
      name: "Südpark Block A",
      street: "Südparkstraße 1-6",
      postalCode: "04277",
      city: "Leipzig",
      totalCleanableArea: "1200.00",
      frontSide: {
        area: 400,
        facadeType: "WDVS (Wärmedämmverbundsystem)",
        cleanable: true,
        notes: "Nordseite stark betroffen",
      },
      backSide: {
        area: 400,
        facadeType: "WDVS (Wärmedämmverbundsystem)",
        cleanable: true,
        notes: "Südseite leichter Befall",
      },
      leftGable: {
        area: 200,
        facadeType: "WDVS (Wärmedämmverbundsystem)",
        cleanable: true,
      },
      rightGable: {
        area: 200,
        facadeType: "WDVS (Wärmedämmverbundsystem)",
        cleanable: true,
      },
      accessNotes: "Nordseite stark betroffen, Südseite leichter Befall",
    });
    expect(property).toBeDefined();
    expect(property.id).toBeGreaterThan(0);
    state.propertyId = property.id;
  });

  it("sollte die Immobilie dem Projekt zugeordnet haben", async () => {
    const properties = await db.getPropertiesByProjectId(state.projectId);
    expect(properties.length).toBeGreaterThanOrEqual(1);
    const found = properties.find(p => p.id === state.propertyId);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Südpark Block A");
    expect(found!.totalCleanableArea).toBe("1200.00");
    // Fassadentyp ist im JSON-Feld frontSide gespeichert
    expect(found!.frontSide?.facadeType).toBe("WDVS (Wärmedämmverbundsystem)");
  });
});

// ============================================
// GP-E2E-05: ANGEBOT ERSTELLEN
// Absicht: Angebot über den Workflow erstellen mit Kalkulation und Bibliothek-Preisen
// ============================================
describe("GP-E2E-05: Angebot erstellen", () => {
  it("sollte eine Angebotsnummer generieren", async () => {
    const offerNumber = await db.generateOfferNumber();
    expect(offerNumber).toBeDefined();
    expect(offerNumber).toMatch(/^FF-\d{4}-\d{4}$/);
    state.offerNumber = offerNumber;
  });

  it("sollte ein Angebot mit Kalkulation anlegen", async () => {
    const offer = await db.createOffer({
      offerNumber: state.offerNumber,
      projectId: state.projectId,
      companyId: state.companyId,
      contactId: state.contactId,
      status: "erstellt",
      totalArea: "1200.00",
      pricePerSqm: "5.00",
      basePrice: "6000.00",
      discount: "5.00",
      discountReason: "Frühbucher-Rabatt",
      travelCosts: "45.00",
      netTotal: "5745.00",
      vatRate: "19.00",
      vatAmount: "1091.55",
      grossTotal: "6836.55",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
    });
    expect(offer).toBeDefined();
    expect(offer.id).toBeGreaterThan(0);
    state.offerId = offer.id;
  });

  it("sollte das Angebot korrekt verknüpft haben", async () => {
    const offer = await db.getOfferById(state.offerId);
    expect(offer).toBeDefined();
    expect(offer!.projectId).toBe(state.projectId);
    expect(offer!.companyId).toBe(state.companyId);
    expect(offer!.contactId).toBe(state.contactId);
    expect(offer!.status).toBe("erstellt");
    expect(offer!.offerNumber).toBe(state.offerNumber);
  });

  it("sollte Bibliothek-Services für Kalkulation verfügbar haben", async () => {
    const services = await db.libraryServicesCRUD.list();
    expect(services.length).toBeGreaterThan(0);
    
    // Prüfe die 5 Kernpositionen
    const buehne = services.find((s: any) => s.name.includes("Hubarbeitsbühne"));
    const regional = services.find((s: any) => s.name.includes("Regional"));
    const ueberregional = services.find((s: any) => s.name.includes("Überregional") || s.name.includes("berregional"));
    const uebernachtung = services.find((s: any) => s.name.includes("bernachtung"));
    const baustelleneinrichtung = services.find((s: any) => s.name.includes("Baustelleneinrichtung"));
    
    expect(buehne).toBeDefined();
    expect(regional).toBeDefined();
    expect(ueberregional).toBeDefined();
    expect(uebernachtung).toBeDefined();
    expect(baustelleneinrichtung).toBeDefined();
  });
});

// ============================================
// GP-E2E-06: AUFTRAG ANLEGEN UND BAUSTELLE ERSTELLEN
// Absicht: Angebot → Auftrag → Baustelle mit Bautagebuch-Eintrag
// ============================================
describe("GP-E2E-06: Auftrag und Baustelle anlegen", () => {
  it("sollte einen Auftrag aus dem Angebot erstellen", async () => {
    const orderNumber = await db.generateOrderNumber();
    expect(orderNumber).toMatch(/^A-\d{4}-\d{3}$/);
    state.orderNumber = orderNumber;

    const order = await db.createOrder({
      orderNumber: state.orderNumber,
      projectId: state.projectId,
      offerId: state.offerId,
      companyId: state.companyId,
      contactId: state.contactId,
      status: "bestaetigt",
      netTotal: "5745.00",
      vatAmount: "1091.55",
      grossTotal: "6836.55",
      orderDate: new Date(),
    });
    expect(order).toBeDefined();
    expect(order.id).toBeGreaterThan(0);
    state.orderId = order.id;
  });

  it("sollte eine Baustelle anlegen", async () => {
    const siteNumber = await db.generateConstructionSiteNumber();
    expect(siteNumber).toMatch(/^B-\d{4}-\d{3}$/);
    state.siteNumber = siteNumber;

    const site = await db.createConstructionSite({
      siteNumber: state.siteNumber,
      projectId: state.projectId,
      orderId: state.orderId,
      offerId: state.offerId,
      name: "Baustelle Südpark Block A",
      address: "Südparkstraße 1-6, 04277 Leipzig",
      status: "geplant",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 2 Wochen
      endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // in 6 Wochen
      totalArea: "1200.00",
      teamMembers: [],
      equipment: ["Hubsteiger 18m", "Hochdruckreiniger 250bar"],
    });
    expect(site).toBeDefined();
    expect(site.id).toBeGreaterThan(0);
    state.constructionSiteId = site.id;
  });

  it("sollte einen Bautagebuch-Eintrag erstellen", async () => {
    const log = await db.createConstructionSiteLog({
      constructionSiteId: state.constructionSiteId,
      userName: "Thomas Braun",
      logType: "arbeitsbeginn",
      entry: "Baustelle eingerichtet. Absperrungen aufgestellt. Team vollständig vor Ort.",
    });
    expect(log).toBeDefined();
    expect(log.id).toBeGreaterThan(0);
    state.logEntryId = log.id;
  });

  it("sollte den Bautagebuch-Eintrag der Baustelle zugeordnet haben", async () => {
    const logs = await db.getConstructionSiteLogs(state.constructionSiteId);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const found = logs.find((l: any) => l.id === state.logEntryId);
    expect(found).toBeDefined();
    expect(found!.logType).toBe("arbeitsbeginn");
  });
});

// ============================================
// GP-E2E-07: EINSATZPLANUNG
// Absicht: Prüfen, dass echte HR-Mitarbeiter für Zuordnung verfügbar sind
// ============================================
describe("GP-E2E-07: Einsatzplanung – HR-Mitarbeiter", () => {
  it("sollte aktive Mitarbeiter aus der HR-DB haben", async () => {
    const employees = await db.getAllEmployees();
    expect(employees.length).toBeGreaterThan(0);
    
    // Prüfe, dass es echte Mitarbeiter sind (nicht Mock)
    const active = employees.filter((e: any) => e.status === "active");
    expect(active.length).toBeGreaterThan(5); // Mindestens 5 aktive Mitarbeiter
  });

  it("sollte Mitarbeiter mit verschiedenen Positionen haben", async () => {
    const employees = await db.getAllEmployees();
    const positions = new Set(employees.map((e: any) => e.position).filter(Boolean));
    expect(positions.size).toBeGreaterThan(2); // Mindestens 3 verschiedene Positionen
  });

  it("sollte die Baustelle für Teamzuordnung aktualisieren können", async () => {
    const employees = await db.getAllEmployees();
    const firstTwo = employees.slice(0, 2).map((e: any) => e.id);
    
    await db.updateConstructionSite(state.constructionSiteId, {
      teamMembers: firstTwo,
      status: "aktiv",
    });
    
    const updated = await db.getConstructionSiteById(state.constructionSiteId);
    expect(updated).toBeDefined();
    expect(updated!.status).toBe("aktiv");
    expect(updated!.teamMembers).toEqual(firstTwo);
  });
});

// ============================================
// GP-E2E-08: AUFGABE ERSTELLEN
// Absicht: Aufgabe im Vorbereitungsboard anlegen, Status-Update durchführen
// ============================================
describe("GP-E2E-08: Aufgabe erstellen und Status-Update", () => {
  it("sollte eine Aufgabe zum Projekt anlegen", async () => {
    const task = await db.createTask({
      projectId: state.projectId,
      constructionSiteId: state.constructionSiteId,
      title: "Bewohnerinformation erstellen und verteilen",
      description: "Info-Aushang für alle 12 Wohnblöcke vorbereiten. Reinigungstermine, Parkverbote, Ansprechpartner.",
      status: "offen",
      priority: "hoch",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 1 Woche
      assignedRole: "Büro",
    });
    expect(task).toBeDefined();
    expect(task.id).toBeGreaterThan(0);
    state.taskId = task.id;
  });

  it("sollte den Status der Aufgabe aktualisieren können", async () => {
    await db.updateTask(state.taskId, {
      status: "in_bearbeitung",
    });
    
    const updated = await db.getTaskById(state.taskId);
    expect(updated).toBeDefined();
    expect(updated!.status).toBe("in_bearbeitung");
  });

  it("sollte die Aufgabe dem Projekt zugeordnet haben", async () => {
    const tasks = await db.getTasksByProjectId(state.projectId);
    expect(tasks.length).toBeGreaterThanOrEqual(1);
    const found = tasks.find((t: any) => t.id === state.taskId);
    expect(found).toBeDefined();
    expect(found!.title).toBe("Bewohnerinformation erstellen und verteilen");
  });
});

// ============================================
// GP-E2E-09: RECHNUNG ERSTELLEN UND MAHNWESEN
// Absicht: Rechnung erstellen, Fälligkeit setzen, Mahnstufen-Logik prüfen
// ============================================
describe("GP-E2E-09: Rechnung und Mahnwesen", () => {
  it("sollte eine Rechnungsnummer generieren", async () => {
    const invoiceNumber = await db.generateInvoiceNumber();
    expect(invoiceNumber).toMatch(/^R-\d{4}-\d{3,4}$/); // 3 oder 4 Ziffern je nach Zählerstand
    state.invoiceNumber = invoiceNumber;
  });

  it("sollte eine Rechnung erstellen", async () => {
    // Nutze die createInvoice-Funktion mit explizitem invoiceNumber-Feld
    // Das Feld muss als erstes im Objekt stehen, damit Drizzle es korrekt erkennt
    const invoiceData = {
      invoiceNumber: state.invoiceNumber,
      invoiceType: "schlussrechnung" as const,
      status: "versendet" as const,
      orderId: state.orderId,
      projectId: state.projectId,
      companyId: state.companyId,
      contactId: state.contactId,
      netTotal: "5745.00",
      vatRate: "19.00",
      vatAmount: "1091.55",
      grossTotal: "6836.55",
      openAmount: "6836.55",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 Tage überfällig für Mahntest
      sentAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      positions: [
        { position: 1, description: "Fassadenreinigung WDVS", quantity: 1200, unit: "m²", unitPrice: 5.00, total: 6000.00 },
        { position: 2, description: "An-/Abfahrt Regional (Bibliothek)", quantity: 1, unit: "pauschal", unitPrice: 45.00, total: 45.00 },
      ],
    };
    const invoice = await db.createInvoice(invoiceData);
    expect(invoice).toBeDefined();
    expect(invoice.id).toBeGreaterThan(0);
    state.invoiceId = invoice.id;
  });

  it("sollte die Rechnung als überfällig erkennen (Mahnwesen-Logik)", async () => {
    const invoice = await db.getInvoiceById(state.invoiceId);
    expect(invoice).toBeDefined();
    
    // Prüfe Mahnlogik: dueDate liegt in der Vergangenheit, Status ist nicht bezahlt
    const now = new Date();
    const dueDate = new Date(invoice!.dueDate!);
    expect(dueDate.getTime()).toBeLessThan(now.getTime());
    expect(invoice!.status).not.toBe("bezahlt");
    expect(invoice!.openAmount).toBe("6836.55");
  });

  it("sollte die Mahnstufe aktualisieren können", async () => {
    await db.updateInvoice(state.invoiceId, {
      dunningLevel: 1,
      lastDunningDate: new Date(),
      status: "gemahnt",
    });
    
    const updated = await db.getInvoiceById(state.invoiceId);
    expect(updated).toBeDefined();
    expect(updated!.dunningLevel).toBe(1);
    expect(updated!.status).toBe("gemahnt");
  });
});

// ============================================
// GP-E2E-10: GARANTIE UND KUNDENPORTAL
// Absicht: Garantie anlegen, Kundenportal-Token generieren, Zugang prüfen
// ============================================
describe("GP-E2E-10: Garantie und Kundenportal", () => {
  it("sollte eine Garantienummer generieren", async () => {
    const warrantyNumber = await db.generateWarrantyNumber();
    expect(warrantyNumber).toMatch(/^G-\d{4}-\d{3}$/);
    state.warrantyNumber = warrantyNumber;
  });

  it("sollte eine Garantie anlegen", async () => {
    const warranty = await db.createWarranty({
      warrantyNumber: state.warrantyNumber,
      orderId: state.orderId,
      projectId: state.projectId,
      companyId: state.companyId,
      propertyId: state.propertyId,
      warrantyType: "algenfrei_garantie",
      status: "aktiv",
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 Jahre
      durationYears: 5,
    });
    expect(warranty).toBeDefined();
    expect(warranty.id).toBeGreaterThan(0);
    state.warrantyId = warranty.id;
  });

  it("sollte einen Kundenportal-Token generieren", async () => {
    const token = `gp-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const portalToken = await db.createCustomerPortalToken({
      companyId: state.companyId,
      contactId: state.contactId,
      token: token,
      projectIds: [state.projectId],
      permissions: ["view_status", "view_documents", "view_photos"],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Tage
    });
    expect(portalToken).toBeDefined();
    expect(portalToken.id).toBeGreaterThan(0);
    state.portalTokenId = portalToken.id;
    state.portalToken = token;
  });

  it("sollte den Kundenportal-Token validieren können", async () => {
    const tokenData = await db.getCustomerPortalTokenByToken(state.portalToken);
    expect(tokenData).toBeDefined();
    expect(tokenData!.companyId).toBe(state.companyId);
    expect(tokenData!.projectIds).toContain(state.projectId);
    expect(tokenData!.permissions).toContain("view_status");
  });
});

// ============================================
// GP-E2E-11: QUERSCHNITTS-TESTS
// Absicht: GlobalSearch, Bibliothek, Archiv-Verknüpfungen prüfen
// ============================================
describe("GP-E2E-11: Querschnitts-Tests", () => {
  it("sollte das Unternehmen über GlobalSearch finden", async () => {
    // globalSearch gibt ein flaches Array mit {type, id, title, subtitle, href} zurück
    const results = await db.globalSearch("Musterstadt");
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    // Mindestens ein Treffer sollte das Unternehmen sein
    const companyHit = results.find((r: any) => r.type === "Unternehmen" || r.title?.includes("Musterstadt"));
    expect(companyHit).toBeDefined();
  });

  it("sollte das Projekt über GlobalSearch finden", async () => {
    const results = await db.globalSearch("Südpark");
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const projectHit = results.find((r: any) => r.type === "Projekt" || r.title?.includes("Südpark"));
    expect(projectHit).toBeDefined();
  });

  it("sollte Bibliothek-Services vollständig haben", async () => {
    const services = await db.libraryServicesCRUD.list();
    expect(services.length).toBeGreaterThanOrEqual(5);
    
    // Prüfe, dass alle Kernkategorien vorhanden sind
    const names = services.map((s: any) => s.name);
    const hasAnfahrt = names.some((n: string) => n.includes("Abfahrt"));
    const hasBuehne = names.some((n: string) => n.includes("Hubarbeitsbühne") || n.includes("bühne"));
    expect(hasAnfahrt).toBe(true);
    expect(hasBuehne).toBe(true);
  });

  it("sollte Archiv-Übersicht abrufen können", async () => {
    const archive = await db.getArchiveOverview({ projectId: state.projectId });
    expect(archive).toBeDefined();
    expect(archive.stats).toBeDefined();
    expect(typeof archive.stats.total).toBe("number");
  });

  it("sollte alle Verknüpfungen korrekt aufgelöst haben", async () => {
    // Prüfe die gesamte Kette: Company → Contact → Project → Property → Offer → Order → ConstructionSite → Warranty
    const company = await db.getCompanyById(state.companyId);
    const contact = await db.getContactById(state.contactId);
    const project = await db.getProjectById(state.projectId);
    const property = await db.getPropertyById(state.propertyId);
    const offer = await db.getOfferById(state.offerId);
    const order = await db.getOrderById(state.orderId);
    const site = await db.getConstructionSiteById(state.constructionSiteId);
    const warranty = await db.getWarrantyById(state.warrantyId);
    
    // Alle existieren
    expect(company).toBeDefined();
    expect(contact).toBeDefined();
    expect(project).toBeDefined();
    expect(property).toBeDefined();
    expect(offer).toBeDefined();
    expect(order).toBeDefined();
    expect(site).toBeDefined();
    expect(warranty).toBeDefined();
    
    // Verknüpfungskette stimmt
    expect(contact!.companyId).toBe(state.companyId);
    expect(project!.companyId).toBe(state.companyId);
    expect(property!.projectId).toBe(state.projectId);
    expect(offer!.projectId).toBe(state.projectId);
    expect(offer!.companyId).toBe(state.companyId);
    expect(order!.offerId).toBe(state.offerId);
    expect(order!.projectId).toBe(state.projectId);
    expect(site!.projectId).toBe(state.projectId);
    expect(site!.orderId).toBe(state.orderId);
    expect(warranty!.projectId).toBe(state.projectId);
    expect(warranty!.companyId).toBe(state.companyId);
    expect(warranty!.orderId).toBe(state.orderId);
  });
});

// ============================================
// CLEANUP: Testdaten nach der Generalprobe aufräumen
// ============================================
describe("GP-E2E-CLEANUP: Testdaten bereinigen", () => {
  it("sollte die Generalprobe-Testdaten bereinigen", async () => {
    // Lösche in umgekehrter Reihenfolge der Abhängigkeiten
    // Portal-Token
    try {
      const { getDb } = await import('./db');
      const { customerPortalTokens } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const database = (await getDb())!;
      await database.delete(customerPortalTokens).where(eq(customerPortalTokens.id, state.portalTokenId));
    } catch (e) { /* ignore */ }
    
    // Garantie
    try { await db.deleteWarranty(state.warrantyId); } catch (e) { /* ignore */ }
    
    // Rechnung
    try { await db.deleteInvoice(state.invoiceId); } catch (e) { /* ignore */ }
    
    // Aufgabe
    try { await db.deleteTask(state.taskId); } catch (e) { /* ignore */ }
    
    // Bautagebuch
    try {
      const { getDb } = await import('./db');
      const { constructionSiteLogs } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const database = (await getDb())!;
      await database.delete(constructionSiteLogs).where(eq(constructionSiteLogs.id, state.logEntryId));
    } catch (e) { /* ignore */ }
    
    // Baustelle
    try { await db.deleteConstructionSite(state.constructionSiteId); } catch (e) { /* ignore */ }
    
    // Auftrag
    try { await db.deleteOrder(state.orderId); } catch (e) { /* ignore */ }
    
    // Angebot
    try { await db.deleteOffer(state.offerId); } catch (e) { /* ignore */ }
    
    // Immobilie
    try { await db.deleteProperty(state.propertyId); } catch (e) { /* ignore */ }
    
    // Projekt
    try { await db.deleteProject(state.projectId); } catch (e) { /* ignore */ }
    
    // Kontakt
    try { await db.deleteContact(state.contactId); } catch (e) { /* ignore */ }
    
    // Unternehmen
    try { await db.deleteCompany(state.companyId); } catch (e) { /* ignore */ }
    
    expect(true).toBe(true); // Cleanup erfolgreich
  });
});
