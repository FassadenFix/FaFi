/**
 * FassadenFix Versprechen Störer
 * 
 * Wiederverwendbares grafisches Element im FassadenFix Corporate Design.
 * Verwendung: Angebote, Dokumente, Marketing-Materialien
 * 
 * INTERVIEW 05.02.2026 - 2-Spalten-Layout:
 * - LINKE SPALTE: Preisstaffel-Transparenz mit Gesamtfläche und aktiver Staffel
 * - RECHTE SPALTE: 4 Leistungen (Pauschalfestpreis, Ergebnisgarantie, 5J Algenfrei, Inspektion)
 * 
 * CI-Farben:
 * - Grün: #77bc1f (Pantone 368 C)
 * - Dunkelgrau: #4e5758 (Pantone 445 C)
 * 
 * AUFGERÄUMT: PREISSTAFFEL_DATA und PREISSTAFFEL_OPTIONS entfernt.
 * Preisstaffeln kommen jetzt aus der Bibliothek via useLibraryDiscounts().
 */

import { Check, Shield, Award, Leaf, Eye, Clock, Users, Sparkles, Euro, Ruler, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLibraryDiscounts } from '@/hooks/useLibrary';

// CI-Farben als Konstanten
const CI_COLORS = {
  green: '#77bc1f',
  greenDark: '#6aa91b',
  greenLight: '#8fcc3f',
  gray: '#4e5758',
  grayLight: '#6b7577',
  lightBg: '#f8faf5', // Leichter grüner Unterton
  white: '#ffffff',
};

// Die 4 Leistungen gemäß Interview (UI-Konstanten, nicht Stammdaten)
export const LEISTUNGEN_INTERVIEW = [
  { 
    id: 'pauschalfestpreis', 
    label: 'Pauschalfestpreisgarantie', 
    sublabel: 'Nachträge existieren nicht',
    icon: Euro 
  },
  { 
    id: 'ergebnisgarantie', 
    label: 'Ergebnisgarantie', 
    sublabel: 'Saubere Fassade garantiert',
    icon: Award 
  },
  { 
    id: '5-jahres-garantie', 
    label: '5 Jahre Algenfrei-Garantie', 
    sublabel: 'Langzeitschutz inklusive',
    icon: Shield 
  },
  { 
    id: 'inspektion', 
    label: 'Jährliche Inspektion', 
    sublabel: 'Exklusiv-Leistung',
    icon: Eye 
  },
];

// Garantie-Optionen mit Icons (UI-Konstanten für Störer-Auswahl)
export const GARANTIE_OPTIONS = [
  { id: '5-jahres-garantie', label: '5-Jahres-Garantie auf Algenfreiheit', icon: Shield },
  { id: 'ergebnisgarantie', label: 'Ergebnisgarantie bei Systemreinigung', icon: Award },
  { id: 'inspektion', label: 'Jährliche Inspektion inklusive', icon: Eye },
  { id: 'pauschalfestpreis', label: 'Pauschalfestpreis – keine versteckten Kosten', icon: Check },
  { id: 'musterflaeche', label: 'Kostenlose Musterfläche zum Kennenlernen', icon: Sparkles },
  { id: 'umweltfreundlich', label: 'Umweltfreundliche Reinigung mit 80% Wassereinsparung', icon: Leaf },
];

// Angebotsbedingungen-Optionen (UI-Konstanten für Bedingungen-Auswahl)
export const BEDINGUNGEN_OPTIONS = [
  { id: 'gueltigkeit-7', label: 'Gültigkeit: 7 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-14', label: 'Gültigkeit: 14 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-21', label: 'Gültigkeit: 21 Tage', kategorie: 'gueltigkeit' },
  { id: 'gueltigkeit-30', label: 'Gültigkeit: 4 Wochen', kategorie: 'gueltigkeit' },
  { id: 'zahlung-7', label: 'Zahlung: 7 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-14', label: 'Zahlung: 14 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-21', label: 'Zahlung: 21 Tage netto', kategorie: 'zahlung' },
  { id: 'zahlung-30', label: 'Zahlung: 30 Tage netto', kategorie: 'zahlung' },
  { id: 'leistungsort', label: 'Leistungsort: wie vereinbart', kategorie: 'sonstiges' },
  { id: 'sperrungen', label: 'Sperrungen: Beantragung und Verantwortung beim AG', kategorie: 'sonstiges' },
  { id: 'agb', label: 'Es gelten unsere AGB (www.fassadenfix.de/agb)', kategorie: 'sonstiges' },
  { id: 'wettervorbehalt', label: 'Wettervorbehalt: Terminverschiebung bei ungünstiger Witterung möglich', kategorie: 'sonstiges' },
  { id: 'zugaenglichkeit', label: 'Zugänglichkeit: Ausreichende Zugänglichkeit der Fassade erforderlich', kategorie: 'sonstiges' },
];

interface FassadenFixVersprechenProps {
  /** Gesamtfläche für Preisstaffel-Transparenz */
  gesamtflaeche?: number;
  /** Aktiver Preis pro m² */
  preisProQm?: number;
  /** Zusätzliche CSS-Klassen */
  className?: string;
  /** Kompakte Darstellung für PDF */
  compact?: boolean;
  /** Variante: 'interview' (2-Spalten) | 'default' | 'premium' | 'minimal' */
  variant?: 'interview' | 'default' | 'premium' | 'minimal';
  /** Legacy: Preisstaffel-Daten für alte Varianten */
  preisstaffel?: { flaeche: string; preis: string }[];
  /** Legacy: Preisstaffel-Titel */
  preisstaffelTitel?: string;
  /** Legacy: Ausgewählte Garantien */
  garantien?: string[];
  /** Claim/Slogan im Footer */
  claim?: string;
}

export function FassadenFixVersprechen({
  gesamtflaeche = 0,
  preisProQm,
  className,
  compact = false,
  variant = 'interview',
  preisstaffel: preisstaffelProp,
  preisstaffelTitel = 'Transparente Preisstaffel',
  garantien = ['5-jahres-garantie', 'ergebnisgarantie', 'inspektion', 'pauschalfestpreis'],
  claim = 'FassadenFix – Ihr sicherer Weg zur sauberen Fassade',
}: FassadenFixVersprechenProps) {
  
  // Preisstaffeln aus der Bibliothek laden
  const { preisstaffelData, preisstaffelOptions } = useLibraryDiscounts();
  
  // Für Legacy-Varianten: Prop oder Bibliothek-Daten verwenden
  const preisstaffel = preisstaffelProp || (preisstaffelOptions[0]?.data ?? []);

  // INTERVIEW-VARIANTE: 2-Spalten-Layout gemäß Besprechung 05.02.2026
  if (variant === 'interview') {
    // Aktive Preisstaffel aus Bibliothek ermitteln
    const getAktiveStaffel = () => {
      for (const staffel of preisstaffelData) {
        if (gesamtflaeche >= staffel.minFlaeche && gesamtflaeche <= staffel.maxFlaeche) {
          return staffel;
        }
      }
      return preisstaffelData[0] || { minFlaeche: 500, maxFlaeche: 999, preis: 10.50, label: '500 – 999 m²' };
    };
    
    const aktiveStaffel = getAktiveStaffel();
    const aktuellerPreis = preisProQm || aktiveStaffel.preis;

    return (
      <div className={cn(
        'rounded-xl overflow-hidden shadow-lg',
        compact ? 'text-sm' : '',
        className
      )} style={{ border: `2px solid ${CI_COLORS.green}` }}>
        {/* Header mit Gradient */}
        <div 
          className="px-6 py-4 text-white font-bold text-lg flex items-center gap-3"
          style={{ 
            background: `linear-gradient(135deg, ${CI_COLORS.green} 0%, ${CI_COLORS.greenDark} 100%)`,
          }}
        >
          <Shield className="w-6 h-6" />
          Das FassadenFix Versprechen
        </div>

        {/* Content - Zwei Spalten */}
        <div 
          className="grid grid-cols-2 gap-6 p-6"
          style={{ backgroundColor: CI_COLORS.lightBg }}
        >
          {/* LINKE SPALTE: Preisstaffel-Transparenz */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${CI_COLORS.green}20` }}
              >
                <Ruler className="w-4 h-4" style={{ color: CI_COLORS.green }} />
              </div>
              <h4 className="font-bold" style={{ color: CI_COLORS.gray }}>
                Preisstaffel-Transparenz
              </h4>
            </div>

            {/* Gesamtfläche Highlight */}
            {gesamtflaeche > 0 && (
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: `${CI_COLORS.green}10`,
                  borderColor: CI_COLORS.green,
                }}
              >
                <div className="text-sm font-medium" style={{ color: CI_COLORS.gray }}>
                  Ihre Gesamtfläche:
                </div>
                <div className="text-2xl font-bold" style={{ color: CI_COLORS.green }}>
                  {gesamtflaeche.toLocaleString('de-DE')} m²
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: CI_COLORS.green }} />
                  <span className="text-sm font-medium" style={{ color: CI_COLORS.gray }}>
                    Ihr Preis: <span style={{ color: CI_COLORS.green }}>{aktuellerPreis.toFixed(2)} €/m²</span>
                  </span>
                </div>
              </div>
            )}

            {/* Staffel-Tabelle – aus Bibliothek */}
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${CI_COLORS.green}` }}>
                  <th className="text-left py-2 font-semibold" style={{ color: CI_COLORS.gray }}>FLÄCHE</th>
                  <th className="text-right py-2 font-semibold" style={{ color: CI_COLORS.gray }}>€/M²</th>
                </tr>
              </thead>
              <tbody>
                {preisstaffelData.map((staffel, index) => {
                  const isActive = gesamtflaeche >= staffel.minFlaeche && gesamtflaeche <= staffel.maxFlaeche;
                  return (
                    <tr 
                      key={index} 
                      className={cn(
                        "border-b border-gray-200 transition-colors",
                        isActive ? "bg-green-100" : "hover:bg-white/50"
                      )}
                    >
                      <td className="py-2" style={{ color: CI_COLORS.gray }}>
                        {isActive && <span className="mr-1">→</span>}
                        {staffel.label}
                      </td>
                      <td 
                        className={cn("text-right py-2", isActive ? "font-bold" : "")}
                        style={{ color: CI_COLORS.green }}
                      >
                        {staffel.preis.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="text-xs" style={{ color: CI_COLORS.grayLight }}>
              Je mehr Fläche Sie beauftragen, desto günstiger wird der Quadratmeterpreis.
            </p>
          </div>

          {/* RECHTE SPALTE: 4 Leistungen */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${CI_COLORS.green}20` }}
              >
                <Award className="w-4 h-4" style={{ color: CI_COLORS.green }} />
              </div>
              <h4 className="font-bold" style={{ color: CI_COLORS.gray }}>
                Unsere Leistungen
              </h4>
            </div>

            <ul className="space-y-3">
              {LEISTUNGEN_INTERVIEW.map((leistung) => {
                const Icon = leistung.icon;
                return (
                  <li 
                    key={leistung.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/70 border border-gray-100"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: CI_COLORS.green }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: CI_COLORS.gray }}>
                        {leistung.label}
                      </div>
                      <div className="text-xs" style={{ color: CI_COLORS.grayLight }}>
                        {leistung.sublabel}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer mit Claim */}
        <div 
          className="px-6 py-3 text-center font-semibold flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: CI_COLORS.white,
            color: CI_COLORS.green,
            borderTop: `1px solid ${CI_COLORS.green}30`,
          }}
        >
          <Sparkles className="w-4 h-4" />
          {claim}
        </div>
      </div>
    );
  }

  // Legacy: Premium-Variante
  if (variant === 'premium') {
    const selectedGarantien = GARANTIE_OPTIONS.filter(g => garantien.includes(g.id));
    return (
      <div className={cn(
        'rounded-xl overflow-hidden shadow-lg',
        compact ? 'text-sm' : '',
        className
      )} style={{ border: `2px solid ${CI_COLORS.green}` }}>
        <div 
          className="px-6 py-4 text-white font-bold text-lg flex items-center gap-3"
          style={{ 
            background: `linear-gradient(135deg, ${CI_COLORS.green} 0%, ${CI_COLORS.greenDark} 100%)`,
          }}
        >
          <Shield className="w-6 h-6" />
          Das FassadenFix Versprechen
        </div>
        <div 
          className="grid grid-cols-2 gap-6 p-6"
          style={{ backgroundColor: CI_COLORS.lightBg }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${CI_COLORS.green}20` }}
              >
                <Award className="w-4 h-4" style={{ color: CI_COLORS.green }} />
              </div>
              <h4 className="font-bold" style={{ color: CI_COLORS.gray }}>
                {preisstaffelTitel}
              </h4>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${CI_COLORS.green}` }}>
                  <th className="text-left py-2 font-semibold" style={{ color: CI_COLORS.gray }}>FLÄCHE</th>
                  <th className="text-right py-2 font-semibold" style={{ color: CI_COLORS.gray }}>PREIS</th>
                </tr>
              </thead>
              <tbody>
                {preisstaffel.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-white/50 transition-colors">
                    <td className="py-2" style={{ color: CI_COLORS.gray }}>{item.flaeche}</td>
                    <td className="text-right py-2 font-bold" style={{ color: CI_COLORS.green }}>{item.preis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${CI_COLORS.green}20` }}
              >
                <Shield className="w-4 h-4" style={{ color: CI_COLORS.green }} />
              </div>
              <h4 className="font-bold" style={{ color: CI_COLORS.gray }}>
                Unsere Garantien
              </h4>
            </div>
            <ul className="space-y-2">
              {selectedGarantien.map((garantie) => {
                const Icon = garantie.icon;
                return (
                  <li key={garantie.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: CI_COLORS.green }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: CI_COLORS.gray }}>
                      {garantie.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div 
          className="px-6 py-3 text-center font-semibold flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: CI_COLORS.white,
            color: CI_COLORS.green,
            borderTop: `1px solid ${CI_COLORS.green}30`,
          }}
        >
          <Sparkles className="w-4 h-4" />
          {claim}
        </div>
      </div>
    );
  }

  // Legacy: Minimal-Variante
  if (variant === 'minimal') {
    const selectedGarantien = GARANTIE_OPTIONS.filter(g => garantien.includes(g.id));
    return (
      <div className={cn(
        'rounded-lg overflow-hidden border',
        compact ? 'text-xs' : 'text-sm',
        className
      )} style={{ borderColor: CI_COLORS.green }}>
        <div 
          className="px-3 py-1.5 text-white font-semibold text-sm"
          style={{ backgroundColor: CI_COLORS.green }}
        >
          Das FassadenFix Versprechen
        </div>
        <div className="p-3 flex gap-4" style={{ backgroundColor: CI_COLORS.lightBg }}>
          <div className="flex-1">
            {selectedGarantien.slice(0, 3).map((garantie) => (
              <div key={garantie.id} className="flex items-center gap-1.5 py-0.5">
                <Check className="w-3 h-3" style={{ color: CI_COLORS.green }} />
                <span style={{ color: CI_COLORS.gray }}>{garantie.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Legacy: Default-Variante
  const selectedGarantien = GARANTIE_OPTIONS.filter(g => garantien.includes(g.id));
  return (
    <div className={cn(
      'rounded-lg overflow-hidden border border-gray-200 shadow-sm',
      compact ? 'text-sm' : '',
      className
    )}>
      <div 
        className="px-4 py-2.5 text-white font-semibold flex items-center gap-2"
        style={{ backgroundColor: CI_COLORS.green }}
      >
        <Shield className="w-5 h-5" />
        Das FassadenFix Versprechen
      </div>
      <div 
        className="grid grid-cols-2 gap-4 p-4"
        style={{ backgroundColor: CI_COLORS.lightBg }}
      >
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: CI_COLORS.gray }}>
            <Award className="w-4 h-4" style={{ color: CI_COLORS.green }} />
            {preisstaffelTitel}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${CI_COLORS.green}` }}>
                <th className="text-left py-1 font-medium" style={{ color: CI_COLORS.gray }}>FLÄCHE</th>
                <th className="text-right py-1 font-medium" style={{ color: CI_COLORS.gray }}>€/M²</th>
              </tr>
            </thead>
            <tbody>
              {preisstaffel.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-1.5" style={{ color: CI_COLORS.gray }}>{item.flaeche}</td>
                  <td className="text-right py-1.5 font-bold" style={{ color: CI_COLORS.green }}>{item.preis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: CI_COLORS.gray }}>
            <Shield className="w-4 h-4" style={{ color: CI_COLORS.green }} />
            Unsere Garantien
          </h4>
          <ul className="space-y-1.5">
            {selectedGarantien.map((garantie) => {
              const Icon = garantie.icon;
              return (
                <li key={garantie.id} className="flex items-start gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${CI_COLORS.green}20` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: CI_COLORS.green }} />
                  </div>
                  <span className="text-sm" style={{ color: CI_COLORS.gray }}>
                    {garantie.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div 
        className="px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2"
        style={{ backgroundColor: CI_COLORS.white, color: CI_COLORS.green }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {claim}
      </div>
    </div>
  );
}

/**
 * Angebotsbedingungen Komponente
 * Zeigt die ausgewählten Bedingungen im FassadenFix-Stil
 */
interface AngebotsbedingungProps {
  gueltigkeit?: string;
  zahlung?: string;
  leistungsort?: string;
  zusatzBedingungen?: string[];
  className?: string;
}

export function Angebotsbedingungen({
  gueltigkeit = '04.03.2026 (4 Wochen)',
  zahlung = '7 Tage netto',
  leistungsort = 'wie vereinbart',
  zusatzBedingungen = ['Sperrungen: Beantragung und Verantwortung beim AG. Es gelten unsere AGB (www.fassadenfix.de/agb).'],
  className,
}: AngebotsbedingungProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="font-semibold flex items-center gap-2" style={{ color: CI_COLORS.gray }}>
        <Clock className="w-4 h-4" style={{ color: CI_COLORS.green }} />
        Angebotsbedingungen
      </h4>
      
      <div className="text-sm" style={{ color: CI_COLORS.gray }}>
        <span style={{ color: CI_COLORS.green }} className="font-medium">Gültigkeit:</span> {gueltigkeit}
        <span className="mx-2">·</span>
        <span style={{ color: CI_COLORS.green }} className="font-medium">Zahlung:</span> {zahlung}
        <span className="mx-2">·</span>
        <span style={{ color: CI_COLORS.green }} className="font-medium">Leistungsort:</span> {leistungsort}
      </div>

      {zusatzBedingungen.map((bedingung, index) => (
        <p key={index} className="text-sm" style={{ color: CI_COLORS.grayLight }}>
          {bedingung}
        </p>
      ))}

      <div className="h-0.5 mt-4" style={{ backgroundColor: CI_COLORS.green }} />
    </div>
  );
}

export default FassadenFixVersprechen;
