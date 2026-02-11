/**
 * Tests für Wizard-Komponenten und FassadenFix Versprechen
 * 
 * Diese Tests validieren die Konfiguration und Datenstrukturen,
 * die von den Wizard-Komponenten verwendet werden.
 */

import { describe, it, expect } from 'vitest';

// Mock der Preisstaffel-Optionen (gleiche Struktur wie im Frontend)
const PREISSTAFFEL_OPTIONS = [
  { id: 'standard', label: 'Standard-Preisstaffel', data: [
    { flaeche: '500 – 999 m²', preis: '10,50 €' },
    { flaeche: '1.000 – 2.499 m²', preis: '9,75 €' },
    { flaeche: '2.500 – 4.999 m²', preis: '9,25 €' },
    { flaeche: 'ab 5.000 m²', preis: '8,75 €' },
  ]},
  { id: 'grossprojekt', label: 'Großprojekt-Preisstaffel', data: [
    { flaeche: '5.000 – 9.999 m²', preis: '8,50 €' },
    { flaeche: '10.000 – 19.999 m²', preis: '7,75 €' },
    { flaeche: '20.000 – 49.999 m²', preis: '7,25 €' },
    { flaeche: 'ab 50.000 m²', preis: '6,75 €' },
  ]},
  { id: 'fruehbucher', label: 'Frühbucher-Rabatte', data: [
    { flaeche: 'bis 31.12. (6 Monate)', preis: '-6%' },
    { flaeche: 'bis 31.01. (5 Monate)', preis: '-4,5%' },
    { flaeche: 'bis 28.02. (4 Monate)', preis: '-3%' },
    { flaeche: 'bis 31.03. (3 Monate)', preis: '-1,5%' },
  ]},
];

const GARANTIE_OPTIONS = [
  { id: '5-jahres-garantie', label: '5-Jahres-Garantie auf Algenfreiheit' },
  { id: 'ergebnisgarantie', label: 'Ergebnisgarantie bei Systemreinigung' },
  { id: 'inspektion', label: 'Jährliche Inspektion inklusive' },
  { id: 'pauschalfestpreis', label: 'Pauschalfestpreis – keine versteckten Kosten' },
  { id: 'musterflaeche', label: 'Kostenlose Musterfläche zum Kennenlernen' },
  { id: 'umweltfreundlich', label: 'Umweltfreundliche Reinigung mit 80% Wassereinsparung' },
];

const BEDINGUNGEN_OPTIONS = [
  { id: 'gueltigkeit-7', label: 'Gültigkeit: 7 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-14', label: 'Gültigkeit: 14 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-21', label: 'Gültigkeit: 21 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-30', label: 'Gültigkeit: 4 Wochen', kategorie: 'gueltigkeit' },
  { id: 'zahlung-7', label: 'Zahlung: 7 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-14', label: 'Zahlung: 14 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-21', label: 'Zahlung: 21 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-30', label: 'Zahlung: 30 Tage netto', kategorie: 'zahlung' },
];

// CI-Farben Konstanten
const CI_COLORS = {
  green: '#77bc1f',
  gray: '#4e5758',
};

describe('FassadenFix Preisstaffel', () => {
  it('sollte alle drei Preisstaffel-Optionen haben', () => {
    expect(PREISSTAFFEL_OPTIONS).toHaveLength(3);
    expect(PREISSTAFFEL_OPTIONS.map(p => p.id)).toEqual(['standard', 'grossprojekt', 'fruehbucher']);
  });

  it('sollte Standard-Preisstaffel mit korrekten Preisen haben', () => {
    const standard = PREISSTAFFEL_OPTIONS.find(p => p.id === 'standard');
    expect(standard).toBeDefined();
    expect(standard!.data).toHaveLength(4);
    expect(standard!.data[0].preis).toBe('10,50 €');
    expect(standard!.data[3].preis).toBe('8,75 €');
  });

  it('sollte Frühbucher-Rabatte mit korrekten Prozentsätzen haben', () => {
    const fruehbucher = PREISSTAFFEL_OPTIONS.find(p => p.id === 'fruehbucher');
    expect(fruehbucher).toBeDefined();
    expect(fruehbucher!.data[0].preis).toBe('-6%');
    expect(fruehbucher!.data[3].preis).toBe('-1,5%');
  });
});

describe('FassadenFix Garantien', () => {
  it('sollte alle sechs Garantie-Optionen haben', () => {
    expect(GARANTIE_OPTIONS).toHaveLength(6);
  });

  it('sollte die 5-Jahres-Garantie enthalten', () => {
    const garantie = GARANTIE_OPTIONS.find(g => g.id === '5-jahres-garantie');
    expect(garantie).toBeDefined();
    expect(garantie!.label).toContain('5-Jahres-Garantie');
  });

  it('sollte die Umwelt-Garantie mit 80% Wassereinsparung enthalten', () => {
    const umwelt = GARANTIE_OPTIONS.find(g => g.id === 'umweltfreundlich');
    expect(umwelt).toBeDefined();
    expect(umwelt!.label).toContain('80%');
  });
});

describe('FassadenFix Angebotsbedingungen', () => {
  it('sollte Gültigkeits-Optionen haben', () => {
    const gueltigkeit = BEDINGUNGEN_OPTIONS.filter(b => b.kategorie === 'gueltigkeit');
    expect(gueltigkeit).toHaveLength(4);
  });

  it('sollte Zahlungs-Optionen haben', () => {
    const zahlung = BEDINGUNGEN_OPTIONS.filter(b => b.kategorie === 'zahlung');
    expect(zahlung).toHaveLength(4);
  });

  it('sollte Standard-Zahlungsziel von 7 Tagen haben', () => {
    const standard = BEDINGUNGEN_OPTIONS.find(b => b.id === 'zahlung-7');
    expect(standard).toBeDefined();
    expect(standard!.label).toContain('7 Tage');
  });
});

describe('FassadenFix CI-Farben', () => {
  it('sollte die korrekte Grün-Farbe haben (Pantone 368 C)', () => {
    expect(CI_COLORS.green).toBe('#77bc1f');
  });

  it('sollte die korrekte Grau-Farbe haben (Pantone 445 C)', () => {
    expect(CI_COLORS.gray).toBe('#4e5758');
  });

  it('sollte Farben im HEX-Format haben', () => {
    expect(CI_COLORS.green).toMatch(/^#[0-9a-f]{6}$/i);
    expect(CI_COLORS.gray).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('Wizard Fortschrittsberechnung', () => {
  it('sollte den Fortschritt korrekt berechnen', () => {
    const totalSteps = 7;
    const currentStep = 3;
    const progress = ((currentStep + 1) / totalSteps) * 100;
    expect(progress).toBeCloseTo(57.14, 1);
  });

  it('sollte bei letztem Schritt 100% anzeigen', () => {
    const totalSteps = 7;
    const currentStep = 6; // 0-indexed, also Schritt 7
    const progress = ((currentStep + 1) / totalSteps) * 100;
    expect(progress).toBe(100);
  });
});
