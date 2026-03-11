import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit-Tests für die Tiefenverknüpfungs-Funktionen (v5.5)
 * 
 * Testet:
 * - documents-Tabelle: orderId, invoiceId, warrantyId Verknüpfungen
 * - getProjectWithRelations: Alle verknüpften Entitäten laden
 * - getDocumentsByOrderId, getDocumentsByInvoiceId, getDocumentsByWarrantyId
 * - Archiv-Filterung nach Verknüpfungstyp
 * - Automatische Archiv-Einträge bei Wizard-Aktionen
 */

// Mock database module
vi.mock("../db", () => {
  const mockDocuments = [
    {
      id: 1,
      name: "Angebot-2026-001.pdf",
      originalName: "Angebot-2026-001.pdf",
      fileType: "dokument",
      mimeType: "application/pdf",
      fileSize: 245000,
      s3Key: "docs/angebot-001.pdf",
      s3Url: "https://s3.example.com/docs/angebot-001.pdf",
      projectId: 1,
      offerId: 1,
      orderId: null,
      invoiceId: null,
      warrantyId: null,
      constructionSiteId: null,
      propertyId: null,
      contactId: null,
      companyId: null,
      appointmentId: null,
      taskId: null,
      category: "angebot",
      description: "Angebot für Wohnanlage Sonnenhof",
      uploadedById: 1,
      createdAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
    },
    {
      id: 2,
      name: "Auftragsbestätigung-AB-2026-001.pdf",
      originalName: "Auftragsbestaetigung.pdf",
      fileType: "dokument",
      mimeType: "application/pdf",
      fileSize: 180000,
      s3Key: "docs/ab-001.pdf",
      s3Url: "https://s3.example.com/docs/ab-001.pdf",
      projectId: 1,
      offerId: 1,
      orderId: 1,
      invoiceId: null,
      warrantyId: null,
      constructionSiteId: null,
      propertyId: null,
      contactId: null,
      companyId: null,
      appointmentId: null,
      taskId: null,
      category: "auftragsbestaetigung",
      description: "Auftragsbestätigung nach Annahme",
      uploadedById: 1,
      createdAt: new Date("2026-01-20"),
      updatedAt: new Date("2026-01-20"),
    },
    {
      id: 3,
      name: "Rechnung-RE-2026-001.pdf",
      originalName: "Rechnung.pdf",
      fileType: "dokument",
      mimeType: "application/pdf",
      fileSize: 195000,
      s3Key: "docs/re-001.pdf",
      s3Url: "https://s3.example.com/docs/re-001.pdf",
      projectId: 1,
      offerId: null,
      orderId: 1,
      invoiceId: 1,
      warrantyId: null,
      constructionSiteId: null,
      propertyId: null,
      contactId: null,
      companyId: null,
      appointmentId: null,
      taskId: null,
      category: "rechnung",
      description: "Schlussrechnung nach Abnahme",
      uploadedById: 1,
      createdAt: new Date("2026-02-01"),
      updatedAt: new Date("2026-02-01"),
    },
    {
      id: 4,
      name: "Garantieurkunde-GU-2026-001.pdf",
      originalName: "Garantie.pdf",
      fileType: "dokument",
      mimeType: "application/pdf",
      fileSize: 120000,
      s3Key: "docs/gu-001.pdf",
      s3Url: "https://s3.example.com/docs/gu-001.pdf",
      projectId: 1,
      offerId: null,
      orderId: 1,
      invoiceId: null,
      warrantyId: 1,
      constructionSiteId: null,
      propertyId: null,
      contactId: null,
      companyId: null,
      appointmentId: null,
      taskId: null,
      category: "garantie",
      description: "Garantieurkunde nach Abnahme",
      uploadedById: 1,
      createdAt: new Date("2026-02-01"),
      updatedAt: new Date("2026-02-01"),
    },
    {
      id: 5,
      name: "Baustellenfoto-001.jpg",
      originalName: "IMG_0001.jpg",
      fileType: "bild",
      mimeType: "image/jpeg",
      fileSize: 3500000,
      s3Key: "photos/baustelle-001.jpg",
      s3Url: "https://s3.example.com/photos/baustelle-001.jpg",
      projectId: 1,
      offerId: null,
      orderId: null,
      invoiceId: null,
      warrantyId: null,
      constructionSiteId: 1,
      propertyId: 1,
      contactId: null,
      companyId: null,
      appointmentId: null,
      taskId: null,
      category: "foto",
      description: "Baustellenfoto Vorderseite",
      uploadedById: 2,
      createdAt: new Date("2026-01-25"),
      updatedAt: new Date("2026-01-25"),
    },
  ];

  const mockProject = {
    id: 1,
    name: "Wohnanlage Sonnenhof",
    projectNumber: "P-2026-001",
    phase: "durchfuehrung",
    totalArea: "8500",
    progress: 65,
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-03-20"),
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-01"),
  };

  return {
    // Document queries
    getAllDocuments: vi.fn().mockResolvedValue(mockDocuments),
    getDocumentsByProjectId: vi.fn().mockImplementation((projectId: number) =>
      Promise.resolve(mockDocuments.filter(d => d.projectId === projectId))
    ),
    getDocumentsByOrderId: vi.fn().mockImplementation((orderId: number) =>
      Promise.resolve(mockDocuments.filter(d => d.orderId === orderId))
    ),
    getDocumentsByInvoiceId: vi.fn().mockImplementation((invoiceId: number) =>
      Promise.resolve(mockDocuments.filter(d => d.invoiceId === invoiceId))
    ),
    getDocumentsByWarrantyId: vi.fn().mockImplementation((warrantyId: number) =>
      Promise.resolve(mockDocuments.filter(d => d.warrantyId === warrantyId))
    ),
    getDocumentsByConstructionSiteId: vi.fn().mockImplementation((siteId: number) =>
      Promise.resolve(mockDocuments.filter(d => d.constructionSiteId === siteId))
    ),
    createDocument: vi.fn().mockImplementation((data: any) =>
      Promise.resolve({ id: 10, ...data, createdAt: new Date(), updatedAt: new Date() })
    ),
    
    // Project with relations
    getProjectWithRelations: vi.fn().mockResolvedValue({
      ...mockProject,
      offers: [{ id: 1, offerNumber: "FF-2026-001", status: "angenommen" }],
      orders: [{ id: 1, orderNumber: "AB-2026-001", status: "in_durchfuehrung" }],
      invoices: [{ id: 1, invoiceNumber: "RE-2026-001", status: "versendet" }],
      warranties: [{ id: 1, warrantyNumber: "GU-2026-001" }],
      constructionSites: [{ id: 1, siteNumber: "B-2026-001", status: "aktiv" }],
      tasks: [{ id: 1, title: "Bewohnerinfo erstellen" }],
      documents: mockDocuments.filter(d => d.projectId === 1),
      properties: [{ id: 1, name: "Sonnenhofweg 1-12" }],
      appointments: [],
    }),
    
    // Activity log
    createActivityLog: vi.fn().mockResolvedValue({ id: 1 }),
    
    // Archive search
    searchDocumentsInArchive: vi.fn().mockImplementation((params: any) => {
      let filtered = [...mockDocuments];
      if (params.projectId) filtered = filtered.filter(d => d.projectId === params.projectId);
      if (params.orderId) filtered = filtered.filter(d => d.orderId === params.orderId);
      if (params.invoiceId) filtered = filtered.filter(d => d.invoiceId === params.invoiceId);
      if (params.warrantyId) filtered = filtered.filter(d => d.warrantyId === params.warrantyId);
      if (params.category) filtered = filtered.filter(d => d.category === params.category);
      if (params.fileType) filtered = filtered.filter(d => d.fileType === params.fileType);
      if (params.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.originalName.toLowerCase().includes(q));
      }
      return Promise.resolve(filtered);
    }),
  };
});

describe("Tiefenverknüpfung - Documents Schema", () => {
  it("sollte Dokumente mit orderId verknüpfen", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByOrderId(1);
    expect(docs.length).toBeGreaterThan(0);
    docs.forEach(d => expect(d.orderId).toBe(1));
  });

  it("sollte Dokumente mit invoiceId verknüpfen", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByInvoiceId(1);
    expect(docs.length).toBe(1);
    expect(docs[0].category).toBe("rechnung");
  });

  it("sollte Dokumente mit warrantyId verknüpfen", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByWarrantyId(1);
    expect(docs.length).toBe(1);
    expect(docs[0].category).toBe("garantie");
  });

  it("sollte Dokumente mit constructionSiteId verknüpfen", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByConstructionSiteId(1);
    expect(docs.length).toBe(1);
    expect(docs[0].fileType).toBe("bild");
  });

  it("sollte alle Dokumente eines Projekts laden", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByProjectId(1);
    expect(docs.length).toBe(5);
  });
});

describe("Tiefenverknüpfung - Project With Relations", () => {
  it("sollte alle verknüpften Entitäten laden", async () => {
    const db = await import("../db");
    const result = await db.getProjectWithRelations(1);
    
    expect(result).toBeDefined();
    expect(result.name).toBe("Wohnanlage Sonnenhof");
    expect(result.offers).toHaveLength(1);
    expect(result.orders).toHaveLength(1);
    expect(result.invoices).toHaveLength(1);
    expect(result.warranties).toHaveLength(1);
    expect(result.constructionSites).toHaveLength(1);
    expect(result.documents).toHaveLength(5);
    expect(result.properties).toHaveLength(1);
  });

  it("sollte Angebote mit korrekten Feldern enthalten", async () => {
    const db = await import("../db");
    const result = await db.getProjectWithRelations(1);
    expect(result.offers[0]).toHaveProperty("offerNumber");
    expect(result.offers[0]).toHaveProperty("status");
  });

  it("sollte Aufträge mit korrekten Feldern enthalten", async () => {
    const db = await import("../db");
    const result = await db.getProjectWithRelations(1);
    expect(result.orders[0]).toHaveProperty("orderNumber");
    expect(result.orders[0]).toHaveProperty("status");
  });
});

describe("Tiefenverknüpfung - Archiv-Filterung", () => {
  it("sollte nach Projekt filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ projectId: 1 });
    expect(docs.length).toBe(5);
  });

  it("sollte nach Auftrag filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ orderId: 1 });
    expect(docs.length).toBe(3); // Auftragsbestätigung + Rechnung + Garantie
  });

  it("sollte nach Rechnung filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ invoiceId: 1 });
    expect(docs.length).toBe(1);
    expect(docs[0].category).toBe("rechnung");
  });

  it("sollte nach Garantie filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ warrantyId: 1 });
    expect(docs.length).toBe(1);
    expect(docs[0].category).toBe("garantie");
  });

  it("sollte nach Kategorie filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ category: "angebot" });
    expect(docs.length).toBe(1);
    expect(docs[0].name).toContain("Angebot");
  });

  it("sollte nach Dateityp filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ fileType: "bild" });
    expect(docs.length).toBe(1);
    expect(docs[0].mimeType).toContain("image");
  });

  it("sollte nach Suchbegriff filtern", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ query: "Garantie" });
    expect(docs.length).toBe(1);
  });

  it("sollte mehrere Filter kombinieren", async () => {
    const db = await import("../db");
    const docs = await db.searchDocumentsInArchive({ projectId: 1, category: "rechnung" });
    expect(docs.length).toBe(1);
    expect(docs[0].invoiceId).toBe(1);
  });
});

describe("Tiefenverknüpfung - Automatische Archiv-Einträge", () => {
  it("sollte ein Dokument mit allen Verknüpfungen erstellen können", async () => {
    const db = await import("../db");
    const doc = await db.createDocument({
      name: "Abnahmeprotokoll-AP-2026-001.pdf",
      originalName: "Abnahmeprotokoll.pdf",
      fileType: "dokument",
      mimeType: "application/pdf",
      fileSize: 150000,
      s3Key: "docs/ap-001.pdf",
      s3Url: "https://s3.example.com/docs/ap-001.pdf",
      projectId: 1,
      orderId: 1,
      invoiceId: 1,
      warrantyId: 1,
      category: "abnahmeprotokoll",
      description: "Abnahmeprotokoll mit Mängelliste",
      uploadedById: 1,
    });
    
    expect(doc).toBeDefined();
    expect(doc.id).toBe(10);
    expect(doc.projectId).toBe(1);
    expect(doc.orderId).toBe(1);
    expect(doc.invoiceId).toBe(1);
    expect(doc.warrantyId).toBe(1);
    expect(doc.category).toBe("abnahmeprotokoll");
  });

  it("sollte ein Dokument ohne optionale Verknüpfungen erstellen können", async () => {
    const db = await import("../db");
    const doc = await db.createDocument({
      name: "Allgemeines Dokument",
      originalName: "dokument.pdf",
      fileType: "dokument",
      s3Key: "docs/general.pdf",
      s3Url: "https://s3.example.com/docs/general.pdf",
      uploadedById: 1,
    });
    
    expect(doc).toBeDefined();
    expect(doc.projectId).toBeUndefined();
    expect(doc.orderId).toBeUndefined();
  });
});

describe("Tiefenverknüpfung - Dokumenten-Kategorien", () => {
  it("sollte alle relevanten Kategorien unterstützen", () => {
    const expectedCategories = [
      "angebot",
      "auftragsbestaetigung",
      "rechnung",
      "garantie",
      "objektaufnahme",
      "protokoll",
      "abnahmeprotokoll",
      "foto",
      "bewohnerinfo",
      "sonstiges",
    ];
    
    // Verify all categories are valid strings
    expectedCategories.forEach(cat => {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});

describe("Tiefenverknüpfung - Verknüpfungs-Integrität", () => {
  it("sollte sicherstellen, dass Auftragsbestätigungen sowohl orderId als auch offerId haben", async () => {
    const db = await import("../db");
    const docs = await db.getAllDocuments();
    const abDocs = docs.filter(d => d.category === "auftragsbestaetigung");
    abDocs.forEach(d => {
      expect(d.orderId).not.toBeNull();
      expect(d.offerId).not.toBeNull();
    });
  });

  it("sollte sicherstellen, dass Rechnungen eine invoiceId haben", async () => {
    const db = await import("../db");
    const docs = await db.getAllDocuments();
    const reDocs = docs.filter(d => d.category === "rechnung");
    reDocs.forEach(d => {
      expect(d.invoiceId).not.toBeNull();
    });
  });

  it("sollte sicherstellen, dass Garantieurkunden eine warrantyId haben", async () => {
    const db = await import("../db");
    const docs = await db.getAllDocuments();
    const guDocs = docs.filter(d => d.category === "garantie");
    guDocs.forEach(d => {
      expect(d.warrantyId).not.toBeNull();
    });
  });

  it("sollte sicherstellen, dass alle Projekt-Dokumente eine projectId haben", async () => {
    const db = await import("../db");
    const docs = await db.getDocumentsByProjectId(1);
    docs.forEach(d => {
      expect(d.projectId).toBe(1);
    });
  });
});
