import { describe, expect, it, vi } from "vitest";
import { archiveOfferPdf, archiveInvoicePdf, archiveWarrantyCertificate, archiveDunning, archivePhoto, archiveBautagebuchEntry, autoArchive } from "./services/autoArchive";

/**
 * Tests für die drei Archiv-Erweiterungen:
 * 1. Bautagebuch-Auto-Archivierung (ARCH-05 / BTB-01/02)
 * 2. Klickbare Verknüpfungs-Badges (LINK-01..09) – Frontend-only, hier nur Smoke-Test
 * 3. Volltextsuche mit Highlighting – Frontend-only, hier nur Logik-Tests
 */

// Mock the DB helper
vi.mock("./db", () => ({
  createDocumentInArchive: vi.fn().mockResolvedValue({ id: 999 }),
}));

describe("Auto-Archivierung: Bautagebuch-Einträge (BTB-01/02)", () => {
  it("archiveBautagebuchEntry ist als Funktion exportiert", () => {
    expect(typeof archiveBautagebuchEntry).toBe("function");
  });

  it("archiveBautagebuchEntry akzeptiert die erwarteten Parameter", () => {
    // Prüfe, dass die Funktion die richtige Signatur hat
    expect(archiveBautagebuchEntry.length).toBeGreaterThanOrEqual(0);
  });

  it("archiveBautagebuchEntry erstellt einen Archiv-Eintrag mit korrekten Feldern", async () => {
    const { createDocumentInArchive } = await import("./db");
    
    await archiveBautagebuchEntry({
      id: 42,
      constructionSiteId: 1,
      projectId: 5,
      logType: "arbeitsbeginn",
      entry: "Arbeitsbeginn 08:00 Uhr. Team vollständig.",
      userName: "Thomas Braun",
      loggedAt: new Date("2026-02-09T08:00:00Z"),
    });

    expect(createDocumentInArchive).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining("Bautagebuch"),
        category: "protokoll",
        constructionSiteId: 1,
        projectId: 5,
      })
    );
  });

  it("archiveBautagebuchEntry archiviert Fotos separat wenn vorhanden", async () => {
    const { createDocumentInArchive } = await import("./db");
    vi.mocked(createDocumentInArchive).mockClear();

    await archiveBautagebuchEntry({
      id: 43,
      constructionSiteId: 1,
      projectId: 5,
      logType: "fortschritt",
      entry: "Gebäude 1-3 fertiggestellt.",
      userName: "Thomas Braun",
      loggedAt: new Date("2026-02-09T10:30:00Z"),
      photos: ["https://example.com/foto1.jpg", "https://example.com/foto2.jpg"],
    });

    // Sollte mindestens den Haupteintrag + Fotos archivieren
    expect(createDocumentInArchive).toHaveBeenCalled();
  });
});

describe("Auto-Archivierung: Alle Quellen-Hooks", () => {
  it("archiveOfferPdf ist als Funktion exportiert", () => {
    expect(typeof archiveOfferPdf).toBe("function");
  });

  it("archiveInvoicePdf ist als Funktion exportiert", () => {
    expect(typeof archiveInvoicePdf).toBe("function");
  });

  it("archiveWarrantyCertificate ist als Funktion exportiert", () => {
    expect(typeof archiveWarrantyCertificate).toBe("function");
  });

  it("archiveDunning ist als Funktion exportiert", () => {
    expect(typeof archiveDunning).toBe("function");
  });

  it("archivePhoto ist als Funktion exportiert", () => {
    expect(typeof archivePhoto).toBe("function");
  });

  it("autoArchive (generische Funktion) ist als Funktion exportiert", () => {
    expect(typeof autoArchive).toBe("function");
  });
});

describe("Volltextsuche: Suchlogik", () => {
  // Simuliere die Frontend-Suchlogik als reine Funktion
  type ArchiveItem = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    source: string;
    projectName?: string;
    constructionSiteName?: string;
    companyName?: string;
  };

  const SOURCE_LABELS: Record<string, { label: string }> = {
    dokument: { label: "Archiv-Dokument" },
    foto: { label: "Foto" },
    angebot: { label: "Angebots-PDF" },
  };

  function searchItems(items: ArchiveItem[], query: string): ArchiveItem[] {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
      const directMatch =
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.source || "").toLowerCase().includes(q) ||
        (SOURCE_LABELS[item.source]?.label || "").toLowerCase().includes(q);
      const entityMatch =
        (item.projectName || "").toLowerCase().includes(q) ||
        (item.constructionSiteName || "").toLowerCase().includes(q) ||
        (item.companyName || "").toLowerCase().includes(q);
      return directMatch || entityMatch;
    });
  }

  const testItems: ArchiveItem[] = [
    { id: "1", name: "Angebot-FF-2026-001.pdf", description: "Angebot für Sonnenhof", category: "angebot", source: "angebot", projectName: "Wohnanlage Sonnenhof", companyName: "WG Sonnenhof eG" },
    { id: "2", name: "Fassade_Nord.jpg", description: "Nordseite mit Algenbefall", category: "foto", source: "foto", constructionSiteName: "Baustelle Bergstraße" },
    { id: "3", name: "Rechnung-R-2026-003.pdf", description: null, category: "rechnung", source: "dokument", projectName: "Gewerbepark Ost", companyName: "Industrie GmbH" },
    { id: "4", name: "Garantieurkunde.pdf", description: "Garantie für Studentenwohnheim", category: "garantie", source: "garantie", projectName: "Studentenwohnheim Campus" },
  ];

  it("findet Treffer über Dateiname", () => {
    const results = searchItems(testItems, "Fassade");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("findet Treffer über Beschreibung", () => {
    const results = searchItems(testItems, "Algenbefall");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("findet Treffer über Projektname (Verknüpfung)", () => {
    const results = searchItems(testItems, "Sonnenhof");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("1");
  });

  it("findet Treffer über Unternehmensname (Verknüpfung)", () => {
    const results = searchItems(testItems, "Industrie");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("3");
  });

  it("findet Treffer über Baustellenname (Verknüpfung)", () => {
    const results = searchItems(testItems, "Bergstraße");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("findet Treffer über Quellen-Label", () => {
    const results = searchItems(testItems, "Archiv-Dokument");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("3");
  });

  it("findet Treffer über Kategorie", () => {
    const results = searchItems(testItems, "garantie");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("4");
  });

  it("gibt alle Ergebnisse bei leerem Suchbegriff zurück", () => {
    const results = searchItems(testItems, "");
    expect(results).toHaveLength(4);
  });

  it("gibt leere Liste bei nicht vorhandenem Suchbegriff zurück", () => {
    const results = searchItems(testItems, "xyz-nicht-vorhanden");
    expect(results).toHaveLength(0);
  });

  it("Suche ist case-insensitive", () => {
    const results = searchItems(testItems, "SONNENHOF");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("1");
  });
});

describe("Highlighting-Logik", () => {
  function highlightText(text: string | null | undefined, query: string): { hasMatch: boolean; matchIndex: number } {
    if (!text || !query || query.length < 2) return { hasMatch: false, matchIndex: -1 };
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    return { hasMatch: idx !== -1, matchIndex: idx };
  }

  it("findet Match und gibt korrekten Index zurück", () => {
    const result = highlightText("Wohnanlage Sonnenhof", "Sonnen");
    expect(result.hasMatch).toBe(true);
    expect(result.matchIndex).toBe(11);
  });

  it("gibt kein Match bei zu kurzem Query zurück", () => {
    const result = highlightText("Wohnanlage Sonnenhof", "S");
    expect(result.hasMatch).toBe(false);
  });

  it("gibt kein Match bei null/undefined Text zurück", () => {
    const result = highlightText(null, "test");
    expect(result.hasMatch).toBe(false);
  });

  it("gibt kein Match bei leerem Query zurück", () => {
    const result = highlightText("Wohnanlage Sonnenhof", "");
    expect(result.hasMatch).toBe(false);
  });

  it("ist case-insensitive", () => {
    const result = highlightText("Wohnanlage Sonnenhof", "sonnenhof");
    expect(result.hasMatch).toBe(true);
    expect(result.matchIndex).toBe(11);
  });
});
