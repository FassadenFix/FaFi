/**
 * PDF-Generierung Tests
 * 
 * Testet die Datenstruktur und Berechnungen für die PDF-Generierung
 */

import { describe, it, expect } from 'vitest';

// Typen für die PDF-Generierung
interface Seite {
  id: string;
  name: string;
  himmelsrichtung: string;
  flaeche: number;
  reinigungsfaehig: boolean;
  besonderheiten: string;
  buehnentyp: string;
}

interface Immobilie {
  id: string;
  adresse: string;
  plz: string;
  ort: string;
  fassadentyp: string;
  besonderheiten: string;
  seiten: Seite[];
}

interface Kalkulation {
  gesamtflaeche: number;
  basispreisProQm: number;
  rabattProzent: number;
  rabattTyp: string;
  endpreisProQm: number;
  reinigungGesamt: number;
  buehnenTage: number;
  buehnenKosten: number;
  baustelleneinrichtung: number;
  uebernachtungErforderlich: boolean;
  uebernachtungNaechte: number;
  uebernachtungKosten: number;
  anfahrtKosten: number;
  summeNetto: number;
  mwst: number;
  summeBrutto: number;
}

// Hilfsfunktion: Berechnet Gesamtfläche aus Immobilien
function berechneGesamtflaeche(immobilien: Immobilie[]): number {
  return immobilien.reduce((sum, immo) => {
    const immoFlaeche = immo.seiten?.reduce((s, seite) => s + (seite.flaeche || 0), 0) || 0;
    return sum + immoFlaeche;
  }, 0);
}

// Hilfsfunktion: Ermittelt Preis pro qm basierend auf Staffel
function getBasispreis(gesamtflaeche: number): number {
  if (gesamtflaeche >= 5000) return 8.75;
  if (gesamtflaeche >= 2500) return 9.25;
  if (gesamtflaeche >= 1000) return 9.75;
  return 10.50;
}

// Hilfsfunktion: Berechnet Kalkulation
function berechneKalkulation(
  immobilien: Immobilie[],
  rabattProzent: number = 0,
  buehnenTage: number = 3
): Kalkulation {
  const gesamtflaeche = berechneGesamtflaeche(immobilien);
  const basispreisProQm = getBasispreis(gesamtflaeche);
  const endpreisProQm = basispreisProQm * (1 - rabattProzent / 100);
  const reinigungGesamt = gesamtflaeche * endpreisProQm;
  const baustelleneinrichtung = 199;
  const buehnenKosten = 0; // inkludiert
  
  const summeNetto = reinigungGesamt + baustelleneinrichtung + buehnenKosten;
  const mwst = summeNetto * 0.19;
  const summeBrutto = summeNetto + mwst;
  
  return {
    gesamtflaeche,
    basispreisProQm,
    rabattProzent,
    rabattTyp: rabattProzent > 0 ? 'Frühbucher' : 'Kein Rabatt',
    endpreisProQm,
    reinigungGesamt,
    buehnenTage,
    buehnenKosten,
    baustelleneinrichtung,
    uebernachtungErforderlich: false,
    uebernachtungNaechte: 0,
    uebernachtungKosten: 0,
    anfahrtKosten: 0,
    summeNetto,
    mwst,
    summeBrutto,
  };
}

describe('PDF-Generierung', () => {
  describe('Flächenberechnung', () => {
    it('sollte Gesamtfläche aus Immobilien korrekt berechnen', () => {
      const immobilien: Immobilie[] = [
        {
          id: '1',
          adresse: 'Teststraße 1',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '1-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 450, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
            { id: '1-2', name: 'Rückseite', himmelsrichtung: 'Nord', flaeche: 380, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
      ];
      
      expect(berechneGesamtflaeche(immobilien)).toBe(830);
    });
    
    it('sollte mehrere Immobilien zusammenrechnen', () => {
      const immobilien: Immobilie[] = [
        {
          id: '1',
          adresse: 'Teststraße 1',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '1-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 500, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
        {
          id: '2',
          adresse: 'Teststraße 2',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '2-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 600, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
      ];
      
      expect(berechneGesamtflaeche(immobilien)).toBe(1100);
    });
    
    it('sollte 0 zurückgeben bei leerer Immobilienliste', () => {
      expect(berechneGesamtflaeche([])).toBe(0);
    });
  });
  
  describe('Preisstaffelung', () => {
    it('sollte 10.50€ für unter 1000 m² zurückgeben', () => {
      expect(getBasispreis(500)).toBe(10.50);
      expect(getBasispreis(999)).toBe(10.50);
    });
    
    it('sollte 9.75€ für 1000-2499 m² zurückgeben', () => {
      expect(getBasispreis(1000)).toBe(9.75);
      expect(getBasispreis(2499)).toBe(9.75);
    });
    
    it('sollte 9.25€ für 2500-4999 m² zurückgeben', () => {
      expect(getBasispreis(2500)).toBe(9.25);
      expect(getBasispreis(4999)).toBe(9.25);
    });
    
    it('sollte 8.75€ für 5000+ m² zurückgeben', () => {
      expect(getBasispreis(5000)).toBe(8.75);
      expect(getBasispreis(10000)).toBe(8.75);
    });
  });
  
  describe('Kalkulation', () => {
    it('sollte Kalkulation ohne Rabatt korrekt berechnen', () => {
      const immobilien: Immobilie[] = [
        {
          id: '1',
          adresse: 'Teststraße 1',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '1-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 1000, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
      ];
      
      const kalkulation = berechneKalkulation(immobilien, 0);
      
      expect(kalkulation.gesamtflaeche).toBe(1000);
      expect(kalkulation.basispreisProQm).toBe(9.75);
      expect(kalkulation.endpreisProQm).toBe(9.75);
      expect(kalkulation.reinigungGesamt).toBe(9750);
      expect(kalkulation.baustelleneinrichtung).toBe(199);
      expect(kalkulation.summeNetto).toBe(9949);
    });
    
    it('sollte Kalkulation mit 6% Frühbucher-Rabatt korrekt berechnen', () => {
      const immobilien: Immobilie[] = [
        {
          id: '1',
          adresse: 'Teststraße 1',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '1-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 1000, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
      ];
      
      const kalkulation = berechneKalkulation(immobilien, 6);
      
      expect(kalkulation.rabattProzent).toBe(6);
      expect(kalkulation.endpreisProQm).toBeCloseTo(9.165, 2);
      expect(kalkulation.reinigungGesamt).toBeCloseTo(9165, 0);
    });
    
    it('sollte MwSt korrekt berechnen (19%)', () => {
      const immobilien: Immobilie[] = [
        {
          id: '1',
          adresse: 'Teststraße 1',
          plz: '12345',
          ort: 'Teststadt',
          fassadentyp: 'WDVS',
          besonderheiten: '',
          seiten: [
            { id: '1-1', name: 'Vorderseite', himmelsrichtung: 'Süd', flaeche: 1000, reinigungsfaehig: true, besonderheiten: '', buehnentyp: 'standard' },
          ],
        },
      ];
      
      const kalkulation = berechneKalkulation(immobilien, 0);
      
      expect(kalkulation.mwst).toBeCloseTo(kalkulation.summeNetto * 0.19, 2);
      expect(kalkulation.summeBrutto).toBeCloseTo(kalkulation.summeNetto * 1.19, 2);
    });
  });
  
  describe('Seiten-Parsing', () => {
    it('sollte Seiten aus JSON korrekt parsen', () => {
      const sideData = {
        area: 450,
        cleanable: true,
        facadeType: 'WDVS',
        scaffoldType: 'standard',
        notes: 'Keine Besonderheiten',
      };
      
      // Simuliere das Parsing
      const seite: Seite = {
        id: '1-front',
        name: 'Vorderseite',
        himmelsrichtung: 'Süd',
        flaeche: Number(sideData.area || 0),
        reinigungsfaehig: sideData.cleanable !== false,
        besonderheiten: sideData.notes || '',
        buehnentyp: sideData.scaffoldType || 'standard',
      };
      
      expect(seite.flaeche).toBe(450);
      expect(seite.reinigungsfaehig).toBe(true);
      expect(seite.buehnentyp).toBe('standard');
    });
    
    it('sollte nicht reinigungsfähige Seiten korrekt markieren', () => {
      const sideData = {
        area: 200,
        cleanable: false,
        notCleanableReason: 'Gerüst nicht möglich',
      };
      
      const seite: Seite = {
        id: '1-back',
        name: 'Rückseite',
        himmelsrichtung: 'Nord',
        flaeche: Number(sideData.area || 0),
        reinigungsfaehig: sideData.cleanable !== false,
        besonderheiten: sideData.notCleanableReason || '',
        buehnentyp: 'standard',
      };
      
      expect(seite.reinigungsfaehig).toBe(false);
      expect(seite.besonderheiten).toBe('Gerüst nicht möglich');
    });
  });
});
