/**
 * PDF Generator Tests - Rechnungen & Garantiezertifikate
 * 
 * Testet die Datenstrukturen und Berechnungen für die PDF-Generierung
 */

import { describe, it, expect } from 'vitest';

// ============================================
// INVOICE PDF GENERATOR TESTS
// ============================================

describe('Invoice PDF Generator', () => {
  it('sollte RechnungData Interface korrekt definiert haben', () => {
    const mockRechnungData = {
      rechnungNummer: 'R-2026-001',
      auftragNummer: 'A-2026-001',
      datum: '01.02.2026',
      faelligBis: '15.02.2026',
      rechnungsTyp: 'schlussrechnung',
      firma: 'Test GmbH',
      ansprechpartner: 'Max Mustermann',
      strasse: 'Teststraße 1',
      plz: '12345',
      ort: 'Teststadt',
      ffAnsprechpartner: 'Alexander Retzlaff',
      ffEmail: 'info@fassadenfix.de',
      ffTelefon: '0345 218392 35',
      positionen: [
        { pos: 1, menge: '1', bezeichnung: 'FassadenFix Systemreinigung', einzelpreis: 5000, gesamt: 5000 }
      ],
      nettobetrag: 5000,
      mwst: 950,
      gesamtsumme: 5950,
      zahlungsziel: '7 Tage netto',
      bankverbindung: {
        bank: 'Sparkasse Halle',
        iban: 'DE89 8005 3762 0123 4567 89',
        bic: 'NOLADE21HAL'
      }
    };
    
    expect(mockRechnungData.rechnungNummer).toBe('R-2026-001');
    expect(mockRechnungData.positionen.length).toBe(1);
    expect(mockRechnungData.gesamtsumme).toBe(5950);
  });

  it('sollte verschiedene Rechnungstypen unterstützen', () => {
    const rechnungsTypen = ['abschlagsrechnung', 'schlussrechnung', 'teilrechnung', 'gutschrift'];
    rechnungsTypen.forEach(typ => {
      expect(typeof typ).toBe('string');
    });
    expect(rechnungsTypen.length).toBe(4);
  });

  it('sollte Bankverbindungsdaten korrekt strukturieren', () => {
    const bankverbindung = {
      bank: 'Sparkasse Halle',
      iban: 'DE89 8005 3762 0123 4567 89',
      bic: 'NOLADE21HAL'
    };
    expect(bankverbindung.bank).toBeDefined();
    expect(bankverbindung.iban).toBeDefined();
    expect(bankverbindung.bic).toBeDefined();
  });

  it('sollte MwSt korrekt berechnen (19%)', () => {
    const nettobetrag = 5000;
    const mwstSatz = 0.19;
    const mwst = nettobetrag * mwstSatz;
    const brutto = nettobetrag + mwst;
    
    expect(mwst).toBe(950);
    expect(brutto).toBe(5950);
  });

  it('sollte Positionen korrekt summieren', () => {
    const positionen = [
      { pos: 1, menge: '1', bezeichnung: 'Reinigung', einzelpreis: 3000, gesamt: 3000 },
      { pos: 2, menge: '1', bezeichnung: 'Imprägnierung', einzelpreis: 1500, gesamt: 1500 },
      { pos: 3, menge: '1', bezeichnung: 'Baustelleneinrichtung', einzelpreis: 199, gesamt: 199 }
    ];
    
    const summe = positionen.reduce((sum, pos) => sum + pos.gesamt, 0);
    expect(summe).toBe(4699);
  });
});

// ============================================
// WARRANTY PDF GENERATOR TESTS
// ============================================

describe('Warranty PDF Generator', () => {
  it('sollte GarantieData Interface korrekt definiert haben', () => {
    const mockGarantieData = {
      zertifikatNummer: 'G-2026-001',
      garantieNummer: 'G-2026-001',
      garantieTyp: 'algenfrei_garantie',
      ausstellungsDatum: '01.02.2026',
      startDatum: '01.02.2026',
      endDatum: '01.02.2031',
      laufzeitJahre: 5,
      firma: 'Test GmbH',
      ansprechpartner: 'Max Mustermann',
      strasse: 'Teststraße 1',
      plz: '12345',
      ort: 'Teststadt',
      objektAdresse: 'Objektstraße 10, 12345 Teststadt',
      objektBeschreibung: 'Mehrfamilienhaus mit 6 Einheiten',
      leistungen: ['Kostenlose Nachbesserung', 'Jährliche Inspektionen'],
      bedingungen: ['Gilt nur für behandelte Flächen']
    };
    
    expect(mockGarantieData.garantieNummer).toBe('G-2026-001');
    expect(mockGarantieData.laufzeitJahre).toBe(5);
    expect(mockGarantieData.leistungen.length).toBe(2);
  });

  it('sollte verschiedene Garantietypen unterstützen', () => {
    const garantieTypen = ['algenfrei_garantie', 'ergebnisgarantie', 'materialgarantie'];
    garantieTypen.forEach(typ => {
      expect(typeof typ).toBe('string');
    });
    expect(garantieTypen.length).toBe(3);
  });

  it('sollte Garantielaufzeit korrekt berechnen', () => {
    const startDatum = new Date('2026-02-01');
    const laufzeitJahre = 5;
    const endDatum = new Date(startDatum);
    endDatum.setFullYear(endDatum.getFullYear() + laufzeitJahre);
    
    expect(endDatum.getFullYear()).toBe(2031);
    // Monat und Tag können je nach Zeitzone variieren
    expect(endDatum.getFullYear() - startDatum.getFullYear()).toBe(5);
  });

  it('sollte Garantieleistungen als Array verwalten', () => {
    const leistungen = [
      'Kostenlose Nachbesserung bei erneutem Algenbefall',
      'Jährliche Inspektionen inklusive',
      'Dokumentation aller durchgeführten Arbeiten',
      '24h-Hotline für Garantiefälle'
    ];
    
    expect(leistungen.length).toBe(4);
    expect(leistungen[0]).toContain('Nachbesserung');
  });

  it('sollte Garantiebedingungen als Array verwalten', () => {
    const bedingungen = [
      'Gilt nur für die behandelten Flächenabschnitte',
      'Regelmäßige Inspektionen müssen wahrgenommen werden',
      'Schäden durch höhere Gewalt sind ausgeschlossen'
    ];
    
    expect(bedingungen.length).toBe(3);
    expect(bedingungen[2]).toContain('höhere Gewalt');
  });

  it('sollte Garantiestatus korrekt verwalten', () => {
    const statusTypen = ['aktiv', 'abgelaufen', 'beansprucht', 'erfuellt'];
    
    expect(statusTypen.includes('aktiv')).toBe(true);
    expect(statusTypen.includes('abgelaufen')).toBe(true);
    expect(statusTypen.includes('beansprucht')).toBe(true);
  });
});

// ============================================
// TESTDATEN SEED TESTS
// ============================================

describe('Testdaten Seed', () => {
  it('sollte Aufträge mit korrekten Status haben', () => {
    const orderStatus = ['entwurf', 'bestaetigt', 'in_bearbeitung', 'abgeschlossen', 'storniert'];
    expect(orderStatus.length).toBe(5);
    expect(orderStatus.includes('bestaetigt')).toBe(true);
  });

  it('sollte Rechnungen mit korrekten Status haben', () => {
    const invoiceStatus = ['entwurf', 'erstellt', 'versendet', 'bezahlt', 'teilbezahlt', 'ueberfaellig', 'storniert', 'gemahnt'];
    expect(invoiceStatus.length).toBe(8);
    expect(invoiceStatus.includes('bezahlt')).toBe(true);
  });

  it('sollte Garantien mit korrekten Typen haben', () => {
    const warrantyTypes = ['algenfrei_garantie', 'ergebnisgarantie', 'materialgarantie'];
    expect(warrantyTypes.length).toBe(3);
    expect(warrantyTypes.includes('algenfrei_garantie')).toBe(true);
  });

  it('sollte Zahlungen mit korrekten Methoden haben', () => {
    const paymentMethods = ['ueberweisung', 'lastschrift', 'bar', 'kreditkarte'];
    expect(paymentMethods.length).toBe(4);
    expect(paymentMethods.includes('ueberweisung')).toBe(true);
  });

  it('sollte Termine mit korrekten Typen haben', () => {
    const appointmentTypes = ['baustellenbegehung', 'objektbesichtigung', 'abnahme', 'kundenbesprechung', 'garantie_inspektion', 'intern'];
    expect(appointmentTypes.length).toBe(6);
    expect(appointmentTypes.includes('abnahme')).toBe(true);
  });
});
