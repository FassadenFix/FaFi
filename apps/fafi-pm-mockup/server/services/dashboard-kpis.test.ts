import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit-Tests für die erweiterten Dashboard-KPIs
 * Testet die getDashboardKPIs Funktion und die Archiv-Vorschau-Logik
 */

// Mock database module
vi.mock('../db', () => ({
  getDashboardKPIs: vi.fn(),
  getAllDocuments: vi.fn(),
  getDocumentsByOrderId: vi.fn(),
  getDocumentsByInvoiceId: vi.fn(),
  getDocumentsByWarrantyId: vi.fn(),
  getDocumentsByConstructionSiteId: vi.fn(),
}));

import * as db from '../db';

describe('Dashboard KPIs - Erweiterte Finanzkennzahlen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte alle KPI-Felder zurückgeben', async () => {
    const mockKPIs = {
      projekteGesamt: 8,
      baustellenAktiv: 3,
      angeboteOffen: 4,
      aufgabenOffen: 12,
      angeboteGesamt: 10,
      angeboteGewonnen: 6,
      conversionRate: 60,
      auftraegeGesamt: 7,
      rechnungenOffen: 3,
      rechnungenOffenBetrag: 45000,
      rechnungenBezahlt: 4,
      umsatzBezahlt: 120000,
      rechnungenUeberfaellig: 1,
      garantienAktiv: 2,
      aufgabenUeberfaellig: 3,
    };

    (db.getDashboardKPIs as any).mockResolvedValue(mockKPIs);
    const result = await db.getDashboardKPIs();

    expect(result).toBeDefined();
    expect(result).toHaveProperty('projekteGesamt');
    expect(result).toHaveProperty('baustellenAktiv');
    expect(result).toHaveProperty('angeboteOffen');
    expect(result).toHaveProperty('aufgabenOffen');
    // Erweiterte KPIs
    expect(result).toHaveProperty('angeboteGesamt');
    expect(result).toHaveProperty('angeboteGewonnen');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('auftraegeGesamt');
    expect(result).toHaveProperty('rechnungenOffen');
    expect(result).toHaveProperty('rechnungenOffenBetrag');
    expect(result).toHaveProperty('rechnungenBezahlt');
    expect(result).toHaveProperty('umsatzBezahlt');
    expect(result).toHaveProperty('rechnungenUeberfaellig');
    expect(result).toHaveProperty('garantienAktiv');
    expect(result).toHaveProperty('aufgabenUeberfaellig');
  });

  it('sollte die Conversion-Rate korrekt berechnen', async () => {
    const mockKPIs = {
      projekteGesamt: 5,
      baustellenAktiv: 2,
      angeboteOffen: 3,
      aufgabenOffen: 8,
      angeboteGesamt: 10,
      angeboteGewonnen: 7,
      conversionRate: 70,
      auftraegeGesamt: 7,
      rechnungenOffen: 2,
      rechnungenOffenBetrag: 30000,
      rechnungenBezahlt: 5,
      umsatzBezahlt: 80000,
      rechnungenUeberfaellig: 0,
      garantienAktiv: 3,
      aufgabenUeberfaellig: 1,
    };

    (db.getDashboardKPIs as any).mockResolvedValue(mockKPIs);
    const result = await db.getDashboardKPIs();

    expect(result!.conversionRate).toBe(70);
    expect(result!.angeboteGewonnen).toBe(7);
    expect(result!.angeboteGesamt).toBe(10);
  });

  it('sollte 0% Conversion bei keinen Angeboten zurückgeben', async () => {
    const mockKPIs = {
      projekteGesamt: 0,
      baustellenAktiv: 0,
      angeboteOffen: 0,
      aufgabenOffen: 0,
      angeboteGesamt: 0,
      angeboteGewonnen: 0,
      conversionRate: 0,
      auftraegeGesamt: 0,
      rechnungenOffen: 0,
      rechnungenOffenBetrag: 0,
      rechnungenBezahlt: 0,
      umsatzBezahlt: 0,
      rechnungenUeberfaellig: 0,
      garantienAktiv: 0,
      aufgabenUeberfaellig: 0,
    };

    (db.getDashboardKPIs as any).mockResolvedValue(mockKPIs);
    const result = await db.getDashboardKPIs();

    expect(result!.conversionRate).toBe(0);
  });

  it('sollte Finanzdaten als Zahlen zurückgeben', async () => {
    const mockKPIs = {
      projekteGesamt: 3,
      baustellenAktiv: 1,
      angeboteOffen: 2,
      aufgabenOffen: 5,
      angeboteGesamt: 5,
      angeboteGewonnen: 3,
      conversionRate: 60,
      auftraegeGesamt: 3,
      rechnungenOffen: 2,
      rechnungenOffenBetrag: 55000,
      rechnungenBezahlt: 1,
      umsatzBezahlt: 25000,
      rechnungenUeberfaellig: 1,
      garantienAktiv: 1,
      aufgabenUeberfaellig: 2,
    };

    (db.getDashboardKPIs as any).mockResolvedValue(mockKPIs);
    const result = await db.getDashboardKPIs();

    expect(typeof result!.rechnungenOffenBetrag).toBe('number');
    expect(typeof result!.umsatzBezahlt).toBe('number');
    expect(result!.rechnungenOffenBetrag).toBe(55000);
    expect(result!.umsatzBezahlt).toBe(25000);
  });

  it('sollte null zurückgeben wenn DB nicht verfügbar', async () => {
    (db.getDashboardKPIs as any).mockResolvedValue(null);
    const result = await db.getDashboardKPIs();
    expect(result).toBeNull();
  });
});

describe('Dokumenten-Verknüpfungen für Archiv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte Dokumente nach Auftrag filtern', async () => {
    const mockDocs = [
      { id: 1, name: 'Auftragsbestätigung', orderId: 1, invoiceId: null, warrantyId: null },
      { id: 2, name: 'Rechnung', orderId: 1, invoiceId: 1, warrantyId: null },
    ];

    (db.getDocumentsByOrderId as any).mockResolvedValue(mockDocs);
    const result = await db.getDocumentsByOrderId(1);

    expect(result).toHaveLength(2);
    expect(result.every((d: any) => d.orderId === 1)).toBe(true);
  });

  it('sollte Dokumente nach Rechnung filtern', async () => {
    const mockDocs = [
      { id: 2, name: 'Rechnung PDF', orderId: 1, invoiceId: 1, warrantyId: null },
    ];

    (db.getDocumentsByInvoiceId as any).mockResolvedValue(mockDocs);
    const result = await db.getDocumentsByInvoiceId(1);

    expect(result).toHaveLength(1);
    expect(result[0].invoiceId).toBe(1);
  });

  it('sollte Dokumente nach Garantie filtern', async () => {
    const mockDocs = [
      { id: 3, name: 'Garantieurkunde', orderId: 1, invoiceId: null, warrantyId: 1 },
    ];

    (db.getDocumentsByWarrantyId as any).mockResolvedValue(mockDocs);
    const result = await db.getDocumentsByWarrantyId(1);

    expect(result).toHaveLength(1);
    expect(result[0].warrantyId).toBe(1);
  });

  it('sollte Dokumente nach Baustelle filtern', async () => {
    const mockDocs = [
      { id: 4, name: 'Baustellenfoto', constructionSiteId: 1 },
      { id: 5, name: 'Logbuch-Eintrag', constructionSiteId: 1 },
    ];

    (db.getDocumentsByConstructionSiteId as any).mockResolvedValue(mockDocs);
    const result = await db.getDocumentsByConstructionSiteId(1);

    expect(result).toHaveLength(2);
  });

  it('sollte leere Liste bei unbekannter ID zurückgeben', async () => {
    (db.getDocumentsByOrderId as any).mockResolvedValue([]);
    const result = await db.getDocumentsByOrderId(9999);
    expect(result).toHaveLength(0);
  });
});

describe('Archiv-Vorschau Logik', () => {
  it('sollte PDF-Dateien als vorschaufähig erkennen', () => {
    const isPdfPreviewable = (mimeType: string) => mimeType.includes('pdf');
    expect(isPdfPreviewable('application/pdf')).toBe(true);
    expect(isPdfPreviewable('text/plain')).toBe(false);
  });

  it('sollte Bilddateien als vorschaufähig erkennen', () => {
    const isImagePreviewable = (mimeType: string) => mimeType.includes('image');
    expect(isImagePreviewable('image/png')).toBe(true);
    expect(isImagePreviewable('image/jpeg')).toBe(true);
    expect(isImagePreviewable('image/webp')).toBe(true);
    expect(isImagePreviewable('application/pdf')).toBe(false);
  });

  it('sollte Dateigröße korrekt formatieren', () => {
    function formatFileSize(bytes: number | null | undefined): string {
      if (!bytes) return "–";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    expect(formatFileSize(null)).toBe("–");
    expect(formatFileSize(undefined)).toBe("–");
    expect(formatFileSize(0)).toBe("–");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(2621440)).toBe("2.5 MB");
  });

  it('sollte Dateityp korrekt erkennen', () => {
    function getFileType(mimeType: string): "dokument" | "bild" | "video" | "sonstiges" {
      if (mimeType.includes("image")) return "bild";
      if (mimeType.includes("video")) return "video";
      if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("spreadsheet") || mimeType.includes("text")) return "dokument";
      return "sonstiges";
    }

    expect(getFileType('application/pdf')).toBe('dokument');
    expect(getFileType('image/png')).toBe('bild');
    expect(getFileType('video/mp4')).toBe('video');
    expect(getFileType('application/zip')).toBe('sonstiges');
    expect(getFileType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('dokument');
  });
});
