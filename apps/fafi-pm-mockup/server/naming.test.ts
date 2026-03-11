import { describe, it, expect } from 'vitest';
import {
  slugifyCompanyName,
  generateEntityName,
  generateDisplayName,
  generateDownloadFilename,
  padNumber,
  ENTITY_CONTEXT,
} from '../shared/naming';

describe('Automatisches Benennungssystem', () => {
  
  describe('slugifyCompanyName', () => {
    it('konvertiert Umlaute korrekt', () => {
      expect(slugifyCompanyName('Müller & Söhne')).toBe('Mueller-und-Soehne');
    });

    it('ersetzt & durch und', () => {
      expect(slugifyCompanyName('Schmidt & Partner')).toBe('Schmidt-und-Partner');
    });

    it('entfernt Sonderzeichen', () => {
      expect(slugifyCompanyName('Firma (Test) GmbH!')).toBe('Firma-Test-GmbH');
    });

    it('ersetzt Leerzeichen durch Bindestriche', () => {
      expect(slugifyCompanyName('Wohnungsgesellschaft Am Park')).toBe('Wohnungsgesellschaft-Am-Park');
    });

    it('entfernt doppelte Bindestriche', () => {
      expect(slugifyCompanyName('Test -- Firma')).toBe('Test-Firma');
    });

    it('begrenzt auf maxLength Zeichen', () => {
      const longName = 'A'.repeat(100);
      expect(slugifyCompanyName(longName).length).toBeLessThanOrEqual(50);
    });

    it('gibt Unbekannt zurück bei leerem String', () => {
      expect(slugifyCompanyName('')).toBe('Unbekannt');
    });

    it('gibt Unbekannt zurück bei null/undefined', () => {
      expect(slugifyCompanyName(null as any)).toBe('Unbekannt');
      expect(slugifyCompanyName(undefined as any)).toBe('Unbekannt');
    });

    it('behandelt ß korrekt', () => {
      expect(slugifyCompanyName('Straßenbau GmbH')).toBe('Strassenbau-GmbH');
    });

    it('behandelt Großbuchstaben-Umlaute', () => {
      expect(slugifyCompanyName('Über Öl Ärger')).toBe('Ueber-Oel-Aerger');
    });
  });

  describe('padNumber', () => {
    it('füllt einstellige Zahlen auf', () => {
      expect(padNumber(1, 4)).toBe('0001');
    });

    it('füllt dreistellige Zahlen auf', () => {
      expect(padNumber(123, 4)).toBe('0123');
    });

    it('lässt vierstellige Zahlen unverändert', () => {
      expect(padNumber(1234, 4)).toBe('1234');
    });

    it('lässt größere Zahlen unverändert', () => {
      expect(padNumber(12345, 4)).toBe('12345');
    });
  });

  describe('getDefaultDigits (implizit über generateEntityName)', () => {
    it('Angebote verwenden 4 Stellen', () => {
      const result = generateEntityName({ year: 2026, companyName: 'Test', context: 'angebot', sequenceNumber: 1 });
      expect(result).toContain('_0001');
    });

    it('Rechnungen verwenden 4 Stellen', () => {
      const result = generateEntityName({ year: 2026, companyName: 'Test', context: 'rechnung', sequenceNumber: 1 });
      expect(result).toContain('_0001');
    });

    it('Aufträge verwenden 3 Stellen', () => {
      const result = generateEntityName({ year: 2026, companyName: 'Test', context: 'auftrag', sequenceNumber: 1 });
      expect(result).toContain('_001');
    });

    it('Garantien verwenden 3 Stellen', () => {
      const result = generateEntityName({ year: 2026, companyName: 'Test', context: 'garantie', sequenceNumber: 1 });
      expect(result).toContain('_001');
    });

    it('Dokumente verwenden 3 Stellen', () => {
      const result = generateEntityName({ year: 2026, companyName: 'Test', context: 'dokument', sequenceNumber: 1 });
      expect(result).toContain('_001');
    });
  });

  describe('generateEntityName', () => {
    it('generiert korrektes Format ohne Version', () => {
      const result = generateEntityName({
        year: 2026,
        companyName: 'Sonnenhof eG',
        context: 'rechnung',
        sequenceNumber: 1,
      });
      expect(result).toBe('2026_Sonnenhof-eG_Rechnung_0001');
    });

    it('generiert korrektes Format mit Version', () => {
      const result = generateEntityName({
        year: 2026,
        companyName: 'Kreiswohnungswerk Roding GmbH',
        context: 'angebot',
        sequenceNumber: 42,
        version: 2,
      });
      expect(result).toBe('2026_Kreiswohnungswerk-Roding-GmbH_Angebot_0042_v2');
    });

    it('verwendet aktuelles Jahr als Default', () => {
      const result = generateEntityName({
        companyName: 'Test GmbH',
        context: 'auftrag',
        sequenceNumber: 1,
      });
      expect(result).toMatch(/^\d{4}_Test-GmbH_Auftrag_001$/);
    });

    it('behandelt Umlaute im Unternehmensnamen', () => {
      const result = generateEntityName({
        year: 2026,
        companyName: 'Müller & Söhne',
        context: 'garantie',
        sequenceNumber: 5,
      });
      expect(result).toBe('2026_Mueller-und-Soehne_Garantie_005');
    });

    it('verwendet benutzerdefinierte Stellenanzahl', () => {
      const result = generateEntityName({
        year: 2026,
        companyName: 'Test',
        context: 'dokument',
        sequenceNumber: 7,
        sequenceDigits: 5,
      });
      expect(result).toBe('2026_Test_Dokument_00007');
    });
  });

  describe('generateDisplayName', () => {
    it('generiert lesbaren Anzeigenamen aus bestehender Nummer', () => {
      const result = generateDisplayName('FF-2026-0001', 'Sonnenhof eG', 'angebot', 1);
      expect(result).toBe('2026_Sonnenhof-eG_Angebot_0001_v1');
    });

    it('generiert lesbaren Anzeigenamen ohne Version', () => {
      const result = generateDisplayName('RE-2026-0012', 'Industrie GmbH', 'rechnung');
      expect(result).toBe('2026_Industrie-GmbH_Rechnung_0012');
    });
  });

  describe('generateDownloadFilename', () => {
    it('generiert Dateinamen mit Erweiterung', () => {
      const result = generateDownloadFilename({
        year: 2026,
        companyName: 'Test GmbH',
        context: 'angebot',
        sequenceNumber: 1,
        version: 1,
        extension: 'pdf',
      });
      expect(result).toBe('2026_Test-GmbH_Angebot_0001_v1.pdf');
    });

    it('generiert Dateinamen ohne Version', () => {
      const result = generateDownloadFilename({
        year: 2026,
        companyName: 'Müller',
        context: 'foto_allgemein',
        sequenceNumber: 42,
        extension: 'jpg',
      });
      expect(result).toBe('2026_Mueller_Foto-Allgemein_042.jpg');
    });

    it('entfernt Punkt vor Erweiterung', () => {
      const result = generateDownloadFilename({
        year: 2026,
        companyName: 'Test',
        context: 'dokument',
        sequenceNumber: 1,
        extension: '.pdf',
      });
      expect(result).toBe('2026_Test_Dokument_001.pdf');
    });
  });

  describe('ENTITY_CONTEXT', () => {
    it('enthält alle erwarteten Kontexte', () => {
      const expectedContexts = [
        'angebot', 'rechnung', 'auftrag', 'garantie',
        'dokument', 'mahnung',
        'abnahmeprotokoll', 'auftragsbestaetigung',
        'protokoll', 'objektaufnahme',
      ];
      for (const ctx of expectedContexts) {
        expect(ENTITY_CONTEXT).toHaveProperty(ctx);
      }
    });

    it('hat deutsche Labels für alle Kontexte', () => {
      for (const [key, value] of Object.entries(ENTITY_CONTEXT)) {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        // Label sollte mit Großbuchstabe beginnen
        expect(value[0]).toBe(value[0].toUpperCase());
      }
    });
  });

  describe('Integrations-Szenarien', () => {
    it('Szenario: Kundenberater erstellt Angebot für Sonnenhof', () => {
      const displayName = generateEntityName({
        year: 2026,
        companyName: 'WG Sonnenhof eG',
        context: 'angebot',
        sequenceNumber: 1,
        version: 1,
      });
      expect(displayName).toBe('2026_WG-Sonnenhof-eG_Angebot_0001_v1');
    });

    it('Szenario: Neue Version eines Angebots', () => {
      const v1 = generateEntityName({
        year: 2026,
        companyName: 'WG Sonnenhof eG',
        context: 'angebot',
        sequenceNumber: 1,
        version: 1,
      });
      const v2 = generateEntityName({
        year: 2026,
        companyName: 'WG Sonnenhof eG',
        context: 'angebot',
        sequenceNumber: 1,
        version: 2,
      });
      expect(v1).toBe('2026_WG-Sonnenhof-eG_Angebot_0001_v1');
      expect(v2).toBe('2026_WG-Sonnenhof-eG_Angebot_0001_v2');
      // Nur die Version ändert sich
      expect(v1.replace('_v1', '')).toBe(v2.replace('_v2', ''));
    });

    it('Szenario: Rechnung nach Abnahme', () => {
      const displayName = generateEntityName({
        year: 2026,
        companyName: 'Hausverwaltung Müller',
        context: 'rechnung',
        sequenceNumber: 12,
      });
      expect(displayName).toBe('2026_Hausverwaltung-Mueller_Rechnung_0012');
    });

    it('Szenario: Foto bei Objektaufnahme', () => {
      const filename = generateDownloadFilename({
        year: 2026,
        companyName: 'Caritas Wohnbau',
        context: 'foto_objektaufnahme',
        sequenceNumber: 3,
        extension: 'jpg',
      });
      expect(filename).toBe('2026_Caritas-Wohnbau_Foto-Objektaufnahme_003.jpg');
    });

    it('Szenario: Garantieurkunde', () => {
      const displayName = generateEntityName({
        year: 2026,
        companyName: 'Studentenwerk Berlin',
        context: 'garantie',
        sequenceNumber: 1,
      });
      expect(displayName).toBe('2026_Studentenwerk-Berlin_Garantie_001');
    });
  });
});
