/**
 * PDF-Generator für Angebote im FassadenFix Corporate Design
 * 
 * MARKENKONFORMITÄT gemäß fassadenfix-marketing-agent:
 * - Logo: Offizielles FassadenFix_Logo_bunt_1000px.png
 * - Farben: NUR #77bc1f (Pantone 368 C) und #4e5758 (Pantone 445 C)
 * - Typografie: Raleway Bold (700) für Headlines, Regular für Fließtext
 * 
 * Layout basiert auf der offiziellen PDF-Vorlage:
 * - Header mit offiziellem Logo (zentriert)
 * - Firmenzeile unter Logo
 * - Zweispaltiger Adressblock
 * - Positionstabelle mit grüner Pos-Spalte
 * - Störer "Das FassadenFix Versprechen"
 * - Angebotsbedingungen
 * - Footer mit Firmendaten (4-spaltig)
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDown, Printer, Mail, Loader2, Check, Send } from "lucide-react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { type StoererConfig, type BedingungenConfig } from "@/components/StoererBedingungStep";
import { 
  GARANTIE_OPTIONS, 
  BEDINGUNGEN_OPTIONS,
  LEISTUNGEN_INTERVIEW 
} from "@/components/FassadenFixVersprechen";
import { useLibraryDiscounts } from "@/hooks/useLibrary";

// ============================================
// CI CONSTANTS - MARKENKONFORMITÄT
// ============================================

/**
 * Offizielle FassadenFix CI-Farben (Pantone-Referenz)
 * Quelle: fassadenfix-branding, Logo-Finale.pdf
 */
const CI_COLORS = {
  /** FassadenFix Grün - Pantone 368 C */
  green: '#77bc1f',
  /** Dunkelgrau - Pantone 445 C */
  gray: '#4e5758',
  /** Hellgrau für Hintergründe */
  lightGray: '#f5f5f5',
  /** Textgrau für sekundäre Texte */
  textGray: '#6b7577',
} as const;

/**
 * Offizielles FassadenFix Logo - CDN URL
 * Quelle: fassadenfix-assets/templates/logos/standard/FassadenFix_Logo_bunt_1000px.png
 * Verwendung: Dokumente/Angebote (hochauflösend)
 */
const OFFICIAL_LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/bfjsQnhVmokSljGd.png';

// ============================================
// TYPES
// ============================================

interface Immobilie {
  id: string;
  adresse: string;
  seiten: {
    name: string;
    flaeche: number;
    selected: boolean;
  }[];
  maxHoehe: number;
  besonderheiten: string;
}

interface Kunde {
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
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

interface AngebotData {
  projektName: string;
  kunde: Kunde;
  immobilien: Immobilie[];
  entfernungKm: number;
  beauftragungsDatum: string;
  kalkulation: Kalkulation;
  textTyp: string;
  gueltigBis: string;
  zahlungsziel: number;
  ansprechpartnerFF: string;
  // Erweiterte Daten aus Loom Feedback 2
  positionenDetails?: PositionenDetails[];
  rabattAktion?: {
    id: string;
    name: string;
    rabattProzent: number;
  };
  individuelleBedingungenAuftraggeber?: string[];
  // Textbausteine (Einleitung/Abschluss)
  einleitungText?: string;
  abschlussText?: string;
  abschlussTextTitel?: string;
  // Zusatzleistungen aus Leistungskatalog
  zusatzleistungen?: {
    serviceId: number;
    name: string;
    menge: number;
    einheit: string;
    einzelpreis: number;
    gesamtpreis: number;
  }[];
}

interface PositionenDetails {
  immobilieId: string;
  adresse: string;
  seiten: {
    name: string;
    flaeche: number;
    buehnentyp: string;
    reinigungsmittel: string;
  }[];
  uebernachtung: boolean;
  uebernachtungNaechte: number;
  baustelleneinrichtung: boolean;
}

interface AngebotPDFGeneratorProps {
  data: AngebotData;
  angebotNummer: string;
  isOpen: boolean;
  onClose: () => void;
  stoererConfig?: StoererConfig;
  bedingungenConfig?: BedingungenConfig;
  // HubSpot-Verknüpfungen für CRM-Integration
  hubspotContactId?: number;
  hubspotCompanyId?: number;
  hubspotDealId?: number;
}

const FF_ANSPRECHPARTNER = [
  { name: "Alexander Retzlaff", telefon: "0176 70408430", email: "a.retzlaff@fassadenfix.de", mobil: "0176 70408430" },
  { name: "Sebastian Siebenhühner", telefon: "0159 26468 63", email: "s.siebenhuehner@fassadenfix.de", mobil: "0159 26468 63" },
  { name: "Ronny Ries", telefon: "0159 26468 61", email: "r.ries@fassadenfix.de", mobil: "0159 26468 61" },
];

// ============================================
// PDF PREVIEW COMPONENT (exaktes Layout der Vorlage)
// ============================================

function PDFPreview({ 
  data, 
  angebotNummer,
  stoererConfig,
  bedingungenConfig,
}: { 
  data: AngebotData; 
  angebotNummer: string;
  stoererConfig?: StoererConfig;
  bedingungenConfig?: BedingungenConfig;
}) {
  const { preisstaffelOptions: PREISSTAFFEL_OPTIONS, preisstaffelData: PREISSTAFFEL_DATA } = useLibraryDiscounts();
  const ansprechpartner = FF_ANSPRECHPARTNER.find(ap => ap.name === data.ansprechpartnerFF) || FF_ANSPRECHPARTNER[0];
  const heute = new Date().toLocaleDateString("de-DE");
  
  // Default configs if not provided
  const stoerer = stoererConfig || {
    preisstaffelId: 'standard',
    garantien: ['5-jahres-garantie', 'ergebnisgarantie', 'inspektion', 'pauschalfestpreis'],
    usePremiumVariant: true, // Default: Premium-Variante
  };
  
  // Premium-Variante aktiviert?
  const usePremium = stoerer.usePremiumVariant ?? true;
  
  const bedingungen = bedingungenConfig || {
    gueltigkeitId: 'gueltigkeit-30',
    zahlungId: 'zahlung-7',
    sonstigeBedingungen: ['leistungsort', 'sperrungen', 'agb'],
  };

  // Get data for Störer
  const selectedPreisstaffel = PREISSTAFFEL_OPTIONS.find(p => p.id === stoerer.preisstaffelId);
  const selectedGarantien = GARANTIE_OPTIONS.filter(g => stoerer.garantien.includes(g.id));
  
  // Get Bedingungen labels
  const gueltigkeitLabel = BEDINGUNGEN_OPTIONS.find(b => b.id === bedingungen.gueltigkeitId)?.label.replace('Gültigkeit: ', '') || '4 Wochen';
  const zahlungLabel = BEDINGUNGEN_OPTIONS.find(b => b.id === bedingungen.zahlungId)?.label.replace('Zahlung: ', '') || '7 Tage netto';
  const sonstigeBedingungen = BEDINGUNGEN_OPTIONS.filter(b => bedingungen.sonstigeBedingungen.includes(b.id));

  // Calculate Gültigkeitsdatum
  const gueltigBisDatum = new Date(data.gueltigBis).toLocaleDateString("de-DE");

  return (
    <div 
      className="bg-white p-8 max-w-[210mm] mx-auto shadow-lg text-[11px] leading-relaxed"
      style={{ 
        fontFamily: "'Raleway', sans-serif",
        color: CI_COLORS.gray,
      }}
    >
      {/* ===== HEADER MIT OFFIZIELLEM LOGO ===== */}
      <div className="flex justify-center mb-6">
        {/* 
          OFFIZIELLES LOGO - fassadenfix-assets
          Datei: FassadenFix_Logo_bunt_1000px.png
          Verwendung: Dokumente/Angebote (hochauflösend)
        */}
        <img 
          src={OFFICIAL_LOGO_URL}
          alt="FassadenFix Logo"
          className="h-16 w-auto object-contain"
          style={{ maxHeight: '64px' }}
        />
      </div>

      {/* Firmenzeile - CI-konform */}
      <div 
        className="text-center text-[9px] mb-6"
        style={{ color: CI_COLORS.textGray }}
      >
        FASSADENFIX • Immobiliengruppe Retzlaff OHG • An der Saalebahn 8a • 06118 Halle
      </div>

      {/* ===== ADRESSBLOCK (zweispaltig) ===== */}
      <div className="flex justify-between mb-8">
        {/* Links: Empfänger */}
        <div className="w-1/2">
          <p className="font-bold text-[13px]" style={{ color: CI_COLORS.gray }}>{data.kunde.firma}</p>
          {data.kunde.ansprechpartner && <p>{data.kunde.ansprechpartner}</p>}
          <p>{data.kunde.strasse}</p>
          <p>{data.kunde.plz} {data.kunde.ort}</p>
        </div>
        
        {/* Rechts: Metadaten */}
        <div className="w-1/2 text-right">
          <table className="ml-auto text-[10px]">
            <tbody>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>Angebotsnummer</td>
                <td className="font-medium">{angebotNummer}</td>
              </tr>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>Kundennummer</td>
                <td></td>
              </tr>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>Datum</td>
                <td className="font-bold">{heute}</td>
              </tr>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>Ihr Ansprechpartner</td>
                <td>{ansprechpartner.name}</td>
              </tr>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>E-Mail</td>
                <td>{ansprechpartner.email}</td>
              </tr>
              <tr>
                <td className="pr-4" style={{ color: CI_COLORS.textGray }}>Mobil</td>
                <td>{ansprechpartner.mobil}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ANGEBOTS-TITEL ===== */}
      <div className="mb-4">
        <h2 
          className="text-[18px] font-bold pb-1 inline-block"
          style={{ 
            color: CI_COLORS.gray,
            borderBottom: `2px solid ${CI_COLORS.green}`,
          }}
        >
          Angebot Nr. {angebotNummer}
        </h2>
      </div>

      {/* Einleitungstext (dynamisch aus Textbaustein oder Standard) */}
      <div className="mb-4" style={{ color: CI_COLORS.gray }}>
        {data.einleitungText ? (
          <p className="whitespace-pre-wrap">{data.einleitungText}</p>
        ) : (
          <p>
            Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!<br />
            Nachfolgend unser individuelles Angebot für Sie:
          </p>
        )}
      </div>

      {/* ===== POSITIONSTABELLE (X.1-X.5 Schema pro Immobilie) ===== */}
      {/* 
        POSITIONSNUMMERIERUNG gemäß Loom Feedback 3:
        X.1 = Stammdaten/Eckdaten der Immobilie
        X.2 = FassadenFix Systemreinigung (m²)
        X.3 = Arbeitshöhe/Bühnentechnik
        X.4 = Baustelleneinrichtung
        X.5 = Übernachtungskosten
      */}
      <table className="w-full mb-4 text-[10px]">
        <thead>
          <tr style={{ borderBottom: `2px solid ${CI_COLORS.green}` }}>
            <th className="text-left py-2 font-semibold w-16" style={{ color: CI_COLORS.green }}>Pos</th>
            <th className="text-left py-2 font-semibold w-24" style={{ color: CI_COLORS.gray }}>Menge</th>
            <th className="text-left py-2 font-semibold" style={{ color: CI_COLORS.gray }}>Bezeichnung</th>
            <th className="text-right py-2 font-semibold w-24" style={{ color: CI_COLORS.gray }}>Einzelpreis</th>
            <th className="text-right py-2 font-semibold w-24" style={{ color: CI_COLORS.gray }}>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {/* Positionen pro Immobilie nach X.1-X.5 Schema */}
          {data.immobilien.map((immo, immoIndex) => {
            const immoNr = immoIndex + 1;
            const immoFlaeche = immo.seiten.filter(s => s.selected).reduce((sum, s) => sum + s.flaeche, 0);
            const posDetails = data.positionenDetails?.find(p => p.immobilieId === immo.id);
            
            // Berechne Bühnenkosten für diese Immobilie
            const buehnenKosten = posDetails?.seiten.reduce((sum, seite) => {
              const tage = Math.ceil(seite.flaeche / 500);
              return sum + (tage * 180); // Durchschnittspreis
            }, 0) || 0;
            
            return (
              <>
                {/* X.1 - Stammdaten/Eckdaten der Immobilie */}
                <tr key={`${immo.id}-stamm`} className="border-b border-gray-200" style={{ backgroundColor: CI_COLORS.lightGray }}>
                  <td className="py-2 font-bold" style={{ color: CI_COLORS.green }}>{immoNr}.1</td>
                  <td className="py-2" colSpan={4}>
                    <span className="font-semibold" style={{ color: CI_COLORS.gray }}>
                      Objekt: {immo.adresse || `Immobilie ${immoNr}`}
                    </span>
                    {immo.besonderheiten && (
                      <span className="text-[8px] ml-2" style={{ color: CI_COLORS.textGray }}>
                        ({immo.besonderheiten})
                      </span>
                    )}
                  </td>
                </tr>
                
                {/* X.2 - FassadenFix Systemreinigung (Hauptposition mit m²) */}
                <tr key={`${immo.id}-reinigung`} className="border-b border-gray-100">
                  <td className="py-1.5 pl-4" style={{ color: CI_COLORS.green }}>{immoNr}.2</td>
                  <td className="py-1.5">{immoFlaeche.toLocaleString("de-DE")} m²</td>
                  <td className="py-1.5">
                    <span className="font-medium">FassadenFix Systemreinigung</span>
                    {posDetails?.seiten && posDetails.seiten.length > 0 && (
                      <div className="text-[8px] mt-0.5" style={{ color: CI_COLORS.textGray }}>
                        {posDetails.seiten.map((s, i) => (
                          <span key={i}>
                            {i > 0 && ' | '}
                            {s.name}: {s.flaeche} m²
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 text-right">{data.kalkulation.endpreisProQm.toFixed(2)} €/m²</td>
                  <td className="py-1.5 text-right font-medium">{(immoFlaeche * data.kalkulation.endpreisProQm).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                </tr>
                
                {/* X.3 - Arbeitshöhe/Bühnentechnik */}
                {(immo.maxHoehe > 8 || buehnenKosten > 0) && (
                  <tr key={`${immo.id}-buehne`} className="border-b border-gray-100">
                    <td className="py-1.5 pl-4" style={{ color: CI_COLORS.green }}>{immoNr}.3</td>
                    <td className="py-1.5">
                      {posDetails?.seiten ? (
                        `${Math.ceil(immoFlaeche / 500)} Tage`
                      ) : (
                        `${Math.ceil(immoFlaeche / 500)} Tage`
                      )}
                    </td>
                    <td className="py-1.5">
                      <span className="font-medium">Hubarbeitsbühne / Bühnentechnik</span>
                      {posDetails?.seiten && (
                        <div className="text-[8px] mt-0.5" style={{ color: CI_COLORS.textGray }}>
                          {posDetails.seiten.map((s, i) => (
                            <span key={i}>
                              {i > 0 && ' | '}
                              {s.name}: {s.buehnentyp}
                            </span>
                          ))}
                        </div>
                      )}
                      {immo.maxHoehe > 0 && (
                        <span className="text-[8px] ml-2" style={{ color: CI_COLORS.textGray }}>
                          (max. Höhe: {immo.maxHoehe}m)
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-right">pauschal</td>
                    <td className="py-1.5 text-right font-medium">
                      {buehnenKosten > 0 
                        ? `${buehnenKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`
                        : 'inkl.'
                      }
                    </td>
                  </tr>
                )}
                
                {/* X.4 - Baustelleneinrichtung */}
                {(posDetails?.baustelleneinrichtung || !posDetails) && (
                  <tr key={`${immo.id}-be`} className="border-b border-gray-100">
                    <td className="py-1.5 pl-4" style={{ color: CI_COLORS.green }}>{immoNr}.4</td>
                    <td className="py-1.5">1 Psch.</td>
                    <td className="py-1.5">
                      <span className="font-medium">Baustelleneinrichtung</span>
                      <span className="text-[8px] ml-2" style={{ color: CI_COLORS.textGray }}>
                        (Absperrung, Beschilderung, Schutzmaßnahmen)
                      </span>
                    </td>
                    <td className="py-1.5 text-right">199,00 €</td>
                    <td className="py-1.5 text-right font-medium">199,00 €</td>
                  </tr>
                )}
                
                {/* X.5 - Übernachtungskosten */}
                {posDetails?.uebernachtung && posDetails.uebernachtungNaechte > 0 && (
                  <tr key={`${immo.id}-ueb`} className="border-b border-gray-100">
                    <td className="py-1.5 pl-4" style={{ color: CI_COLORS.green }}>{immoNr}.5</td>
                    <td className="py-1.5">{posDetails.uebernachtungNaechte} Nächte</td>
                    <td className="py-1.5">
                      <span className="font-medium">Übernachtung Team</span>
                      <span className="text-[8px] ml-2" style={{ color: CI_COLORS.textGray }}>
                        (bei Entfernung &gt; 100km)
                      </span>
                    </td>
                    <td className="py-1.5 text-right">85,00 €/Nacht</td>
                    <td className="py-1.5 text-right font-medium">{(posDetails.uebernachtungNaechte * 85).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                  </tr>
                )}
                
                {/* Leerzeile zwischen Immobilien */}
                {immoIndex < data.immobilien.length - 1 && (
                  <tr key={`${immo.id}-spacer`}>
                    <td colSpan={5} className="py-1"></td>
                  </tr>
                )}
              </>
            );
          })}
          
          {/* Anfahrt (projektübergreifend) */}
          {data.kalkulation.anfahrtKosten > 0 && (
            <>
              <tr>
                <td colSpan={5} className="py-1"></td>
              </tr>
              <tr className="border-b border-gray-200" style={{ backgroundColor: CI_COLORS.lightGray }}>
                <td className="py-2 font-bold" style={{ color: CI_COLORS.green }}>A</td>
                <td className="py-2">{data.entfernungKm * 2} km</td>
                <td className="py-2">
                  <span className="font-semibold">Anfahrt (Hin- und Rückfahrt)</span>
                </td>
                <td className="py-2 text-right">0,50 €/km</td>
                <td className="py-2 text-right font-medium">{data.kalkulation.anfahrtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Zusatzleistungen aus Leistungskatalog */}
      {data.zusatzleistungen && data.zusatzleistungen.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-semibold mb-2" style={{ color: CI_COLORS.green }}>
            Zusätzliche Leistungen
          </div>
          <table className="w-full text-[9px]" style={{ color: CI_COLORS.gray }}>
            <tbody>
              {data.zusatzleistungen.map((z, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-1.5 pl-4" style={{ color: CI_COLORS.green }}>Z.{idx + 1}</td>
                  <td className="py-1.5">{z.menge} {z.einheit}</td>
                  <td className="py-1.5">
                    <span className="font-medium">{z.name}</span>
                  </td>
                  <td className="py-1.5 text-right">{z.einzelpreis.toFixed(2)} €/{z.einheit}</td>
                  <td className="py-1.5 text-right font-medium">{z.gesamtpreis.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                </tr>
              ))}
              <tr className="border-t border-gray-300">
                <td colSpan={4} className="py-1.5 text-right font-semibold">Zusatzleistungen gesamt:</td>
                <td className="py-1.5 text-right font-bold">
                  {data.zusatzleistungen.reduce((sum, z) => sum + z.gesamtpreis, 0).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {/* Rabattaktion (wenn vorhanden) */}
      {data.rabattAktion && data.rabattAktion.rabattProzent > 0 && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: CI_COLORS.lightGray }}>
          <div className="flex justify-between items-center text-[10px]">
            <span style={{ color: CI_COLORS.green }}>
              ✓ {data.rabattAktion.name} ({data.rabattAktion.rabattProzent}% Rabatt)
            </span>
            <span className="font-medium" style={{ color: CI_COLORS.green }}>
              bereits berücksichtigt
            </span>
          </div>
        </div>
      )}

      {/* Summenblock */}
      <div className="flex justify-end mb-6">
        <div className="w-64 text-[10px]">
          <div className="flex justify-between py-1">
            <span>Nettobetrag</span>
            <span>{data.kalkulation.summeNetto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex justify-between py-1">
            <span>zzgl. 19% MwSt.</span>
            <span>{data.kalkulation.mwst.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
          </div>
          <div 
            className="flex justify-between py-2 font-bold text-[12px]"
            style={{ borderTop: `2px solid ${CI_COLORS.gray}` }}
          >
            <span>Gesamtsumme</span>
            <span>{data.kalkulation.summeBrutto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>

      {/* ===== STÖRER: DAS FASSADENFIX VERSPRECHEN (Interview-Layout 05.02.2026) ===== */}
      {/* 
        2-SPALTEN-LAYOUT gemäß Interview:
        - LINKE SPALTE: Preisstaffel-Transparenz mit Gesamtfläche und aktiver Staffel
        - RECHTE SPALTE: 4 Leistungen (Pauschalfestpreis, Ergebnisgarantie, 5J Algenfrei, Inspektion)
      */}
      {data.abschlussText ? (
        /* Dynamischer Abschluss-Textbaustein */
        <div className="rounded-lg overflow-hidden mb-6" style={{ border: '1px solid #e5e7eb' }}>
          <div 
            className="px-4 py-2 text-white font-semibold text-[11px]"
            style={{ backgroundColor: CI_COLORS.green }}
          >
            {data.abschlussTextTitel || 'Das FassadenFix Versprechen'}
          </div>
          <div 
            className="p-4 text-[10px] whitespace-pre-wrap"
            style={{ backgroundColor: CI_COLORS.lightGray, color: CI_COLORS.gray }}
          >
            {data.abschlussText}
          </div>
          <div 
            className="px-4 py-2 text-center text-[9px] font-medium"
            style={{ backgroundColor: CI_COLORS.lightGray, color: CI_COLORS.green }}
          >
            FassadenFix – der sichere Weg zur sauberen Fassade
          </div>
        </div>
      ) : (
        /* INTERVIEW-STÖRER: 2-Spalten mit Preisstaffel-Transparenz + 4 Leistungen */
        <div 
          className="rounded-xl overflow-hidden mb-6 shadow-sm"
          style={{ border: `2px solid ${CI_COLORS.green}` }}
        >
          {/* Header mit Gradient */}
          <div 
            className="px-5 py-3 text-white font-bold text-[12px] flex items-center gap-2"
            style={{ 
              background: `linear-gradient(135deg, ${CI_COLORS.green} 0%, #6aa91b 100%)`,
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Das FassadenFix Versprechen
          </div>

          {/* Content - Zwei Spalten */}
          <div 
            className="grid grid-cols-2 gap-5 p-5"
            style={{ backgroundColor: '#f8faf5' }}
          >
            {/* LINKE SPALTE: Preisstaffel-Transparenz */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${CI_COLORS.green}20` }}
                >
                  <svg className="w-3 h-3" fill={CI_COLORS.green} viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3.5 6h17M16 10a4 4 0 01-8 0"/>
                  </svg>
                </div>
                <h4 className="font-bold text-[10px]" style={{ color: CI_COLORS.gray }}>
                  Preisstaffel-Transparenz
                </h4>
              </div>

              {/* Gesamtfläche Highlight */}
              <div 
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: `${CI_COLORS.green}10`,
                  borderColor: CI_COLORS.green,
                }}
              >
                <div className="text-[9px] font-medium" style={{ color: CI_COLORS.gray }}>
                  Ihre Gesamtfläche:
                </div>
                <div className="text-[14px] font-bold" style={{ color: CI_COLORS.green }}>
                  {data.kalkulation.gesamtflaeche.toLocaleString('de-DE')} m²
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" style={{ color: CI_COLORS.green }} />
                  <span className="text-[9px] font-medium" style={{ color: CI_COLORS.gray }}>
                    Ihr Preis: <span style={{ color: CI_COLORS.green }}>{data.kalkulation.endpreisProQm.toFixed(2)} €/m²</span>
                  </span>
                </div>
              </div>

              {/* Staffel-Tabelle */}
              <table className="w-full text-[8px]">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${CI_COLORS.green}` }}>
                    <th className="text-left py-1 font-semibold" style={{ color: CI_COLORS.gray }}>FLÄCHE</th>
                    <th className="text-right py-1 font-semibold" style={{ color: CI_COLORS.gray }}>€/M²</th>
                  </tr>
                </thead>
                <tbody>
                  {PREISSTAFFEL_DATA.map((staffel, index) => {
                    const isActive = data.kalkulation.gesamtflaeche >= staffel.minFlaeche && 
                                     data.kalkulation.gesamtflaeche <= staffel.maxFlaeche;
                    return (
                      <tr 
                        key={index} 
                        className="border-b border-gray-200"
                        style={isActive ? { backgroundColor: `${CI_COLORS.green}15` } : {}}
                      >
                        <td className="py-1" style={{ color: CI_COLORS.gray }}>
                          {isActive && <span className="mr-1">→</span>}
                          {staffel.label}
                        </td>
                        <td 
                          className={`text-right py-1 ${isActive ? 'font-bold' : ''}`}
                          style={{ color: CI_COLORS.green }}
                        >
                          {staffel.preis.toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[7px]" style={{ color: CI_COLORS.textGray }}>
                Je mehr Fläche Sie beauftragen, desto günstiger wird der Quadratmeterpreis.
              </p>
            </div>

            {/* RECHTE SPALTE: 4 Leistungen */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${CI_COLORS.green}20` }}
                >
                  <svg className="w-3 h-3" fill={CI_COLORS.green} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-[10px]" style={{ color: CI_COLORS.gray }}>
                  Unsere Leistungen
                </h4>
              </div>

              <ul className="space-y-2">
                {LEISTUNGEN_INTERVIEW.map((leistung) => (
                  <li 
                    key={leistung.id} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-white/70 border border-gray-100"
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: CI_COLORS.green }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[9px]" style={{ color: CI_COLORS.gray }}>
                        {leistung.label}
                      </div>
                      <div className="text-[7px]" style={{ color: CI_COLORS.textGray }}>
                        {leistung.sublabel}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer - Claim */}
          <div 
            className="px-5 py-2.5 text-center text-[9px] font-semibold flex items-center justify-center gap-1.5"
            style={{ 
              backgroundColor: '#ffffff',
              color: CI_COLORS.green,
              borderTop: `1px solid ${CI_COLORS.green}30`,
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            FassadenFix – Ihr sicherer Weg zur sauberen Fassade
          </div>
        </div>
      )}

      {/* LEGACY: Premium-Störer (wird nicht mehr verwendet, aber für Kompatibilität behalten) */}
      {false && usePremium && (
        /* PREMIUM Störer - Attraktiveres Design mit Gradient und Icons */
        <div 
          className="rounded-xl overflow-hidden mb-6 shadow-sm"
          style={{ border: `2px solid ${CI_COLORS.green}` }}
        >
          {/* Header mit Gradient */}
          <div 
            className="px-5 py-3 text-white font-bold text-[12px] flex items-center gap-2"
            style={{ 
              background: `linear-gradient(135deg, ${CI_COLORS.green} 0%, #6aa91b 100%)`,
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Das FassadenFix Versprechen
          </div>

          {/* Content - Zwei Spalten mit verbessertem Layout */}
          <div 
            className="grid grid-cols-2 gap-5 p-5"
            style={{ backgroundColor: '#f8faf5' }}
          >
            {/* Linke Spalte: Preisstaffel */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${CI_COLORS.green}20` }}
                >
                  <svg className="w-3 h-3" fill={CI_COLORS.green} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-[10px]" style={{ color: CI_COLORS.gray }}>
                  {stoerer.preisstaffelId === 'fruehbucher' ? 'Frühbucher-Rabatte' : 'Transparente Preisstaffel'}
                </h4>
              </div>
              <table className="w-full text-[9px]">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${CI_COLORS.green}` }}>
                    <th className="text-left py-1.5 font-semibold" style={{ color: CI_COLORS.gray }}>FLÄCHE</th>
                    <th className="text-right py-1.5 font-semibold" style={{ color: CI_COLORS.gray }}>PREIS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPreisstaffel?.data.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-1.5" style={{ color: CI_COLORS.gray }}>{item.flaeche}</td>
                      <td className="text-right py-1.5 font-bold" style={{ color: CI_COLORS.green }}>{item.preis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rechte Spalte: Garantien mit Icons */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${CI_COLORS.green}20` }}
                >
                  <svg className="w-3 h-3" fill={CI_COLORS.green} viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-[10px]" style={{ color: CI_COLORS.gray }}>
                  Unsere Garantien
                </h4>
              </div>
              <ul className="space-y-1.5">
                {selectedGarantien.map((garantie) => (
                  <li key={garantie.id} className="flex items-start gap-2 text-[9px]">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: CI_COLORS.green }}
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="font-medium" style={{ color: CI_COLORS.gray }}>
                      {garantie.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer - Claim mit Icon */}
          <div 
            className="px-5 py-2.5 text-center text-[9px] font-semibold flex items-center justify-center gap-1.5"
            style={{ 
              backgroundColor: '#ffffff',
              color: CI_COLORS.green,
              borderTop: `1px solid ${CI_COLORS.green}30`,
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            FassadenFix – Ihr sicherer Weg zur sauberen Fassade
          </div>
        </div>
      )}

      {/* ===== ANGEBOTSBEDINGUNGEN ===== */}
      <div className="mb-6">
        <h4 className="font-bold text-[11px] mb-1" style={{ color: CI_COLORS.gray }}>
          Angebotsbedingungen
        </h4>
        
        {/* Inline-Felder */}
        <p className="text-[10px] mb-2" style={{ color: CI_COLORS.gray }}>
          <span style={{ color: CI_COLORS.green }} className="font-medium">Gültigkeit:</span> {gueltigBisDatum} ({gueltigkeitLabel})
          <span className="mx-2">·</span>
          <span style={{ color: CI_COLORS.green }} className="font-medium">Zahlung:</span> {zahlungLabel}
          <span className="mx-2">·</span>
          <span style={{ color: CI_COLORS.green }} className="font-medium">Leistungsort:</span> wie vereinbart
        </p>

        {/* Zusatzbedingungen */}
        <p className="text-[9px]" style={{ color: CI_COLORS.textGray }}>
          {sonstigeBedingungen.map(b => b.label).join('. ')}.
        </p>

        {/* Individuelle Angebotsbedingungen (aus Objektaufnahme) */}
        {data.individuelleBedingungenAuftraggeber && data.individuelleBedingungenAuftraggeber.length > 0 && (
          <div className="mt-3 p-3 rounded" style={{ backgroundColor: CI_COLORS.lightGray }}>
            <h5 className="font-semibold text-[10px] mb-2" style={{ color: CI_COLORS.gray }}>
              Individuelle Angebotsbedingungen (Verantwortung Auftraggeber)
            </h5>
            <ul className="text-[9px] space-y-1" style={{ color: CI_COLORS.textGray }}>
              {data.individuelleBedingungenAuftraggeber.map((bedingung, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span style={{ color: CI_COLORS.green }}>•</span>
                  <span>{bedingung}</span>
                </li>
              ))}
            </ul>
            <p className="text-[8px] mt-2 italic" style={{ color: CI_COLORS.textGray }}>
              Diese Aufgaben müssen vor Arbeitsbeginn durch den Auftraggeber erfüllt werden.
            </p>
          </div>
        )}

        {/* Trennlinie - FassadenFix Grün */}
        <div className="h-0.5 mt-3" style={{ backgroundColor: CI_COLORS.green }} />
      </div>

      {/* ===== FOOTER ===== */}
      <div className="pt-4 text-[8px]" style={{ color: CI_COLORS.gray }}>
        <div className="grid grid-cols-4 gap-4">
          {/* Firma */}
          <div>
            <p className="font-bold">FASSADENFIX</p>
            <p>Immobiliengruppe Retzlaff oHG</p>
            <p>An der Saalebahn 8a</p>
            <p>06118 Halle (Saale)</p>
          </div>
          
          {/* Kontakt */}
          <div>
            <p>Tel: 0345 21839235</p>
            <p>info@fassadenfix.de</p>
            <p>www.fassadenfix.de</p>
          </div>
          
          {/* Rechtliches */}
          <div>
            <p>Geschäftsführer: A. Retzlaff</p>
            <p>HRA 4244 · AG Stendal</p>
            <p>USt-ID: DE265643072</p>
          </div>
          
          {/* Bank */}
          <div>
            <p>Commerzbank Halle</p>
            <p>DE49 8004 0000 0325 0123 00</p>
            <p>BIC: COBADEFFXXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AngebotPDFGenerator({
  data,
  angebotNummer,
  isOpen,
  onClose,
  stoererConfig,
  bedingungenConfig,
  hubspotContactId,
  hubspotCompanyId,
  hubspotDealId,
}: AngebotPDFGeneratorProps) {
  const { preisstaffelOptions: PREISSTAFFEL_OPTIONS, preisstaffelData: PREISSTAFFEL_DATA } = useLibraryDiscounts();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Erstelle PDF mit jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;
      
      // Header - FassadenFix Logo-Text
      doc.setFontSize(24);
      doc.setTextColor(119, 188, 31); // #77bc1f
      doc.text('FASSADENFIX', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(8);
      doc.setTextColor(78, 87, 88); // #4e5758
      doc.text('FASSADENFIX \u2022 Immobiliengruppe Retzlaff OHG \u2022 An der Saalebahn 8a \u2022 06118 Halle', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      
      // Kundenadresse links, Angebotsdaten rechts
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(data.kunde.firma, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(data.kunde.ansprechpartner || '', margin, yPos + 5);
      
      // Angebotsdaten rechts
      const rightCol = pageWidth - margin - 60;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Angebotsnummer', rightCol, yPos);
      doc.text('Datum', rightCol, yPos + 5);
      doc.text('Ihr Ansprechpartner', rightCol, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.text(angebotNummer, rightCol + 40, yPos);
      doc.text(new Date().toLocaleDateString('de-DE'), rightCol + 40, yPos + 5);
      doc.text('Alexander Retzlaff', rightCol + 40, yPos + 10);
      
      yPos += 30;
      
      // Angebots-Titel
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Angebot Nr. ${angebotNummer}`, margin, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Vielen Dank f\u00fcr Ihr Interesse an unserer FassadenFix Systemreinigung!', margin, yPos);
      doc.text('Nachfolgend unser individuelles Angebot f\u00fcr Sie:', margin, yPos + 5);
      
      yPos += 15;
      
      // Positionstabelle
      const tableData: (string | number)[][] = [];
      let posNr = 1;
      
      data.immobilien.forEach((immo) => {
        // Objektzeile
        tableData.push([`${posNr}`, '', `Objekt: ${immo.adresse}`, '', '']);
        posNr++;
        
        const gesamtFlaeche = immo.seiten?.reduce((sum, s) => sum + (s.flaeche || 0), 0) || 0;
        const preis = gesamtFlaeche * (data.kalkulation?.endpreisProQm || 9.25);
        
        // Reinigungsposition
        tableData.push([
          `${posNr - 1}.1`,
          `${gesamtFlaeche.toLocaleString('de-DE')} m\u00b2`,
          'FassadenFix Systemreinigung',
          `${(data.kalkulation?.endpreisProQm || 9.25).toFixed(2)} \u20ac/m\u00b2`,
          `${preis.toLocaleString('de-DE', { minimumFractionDigits: 2 })} \u20ac`
        ]);
        
        // B\u00fchne
        tableData.push([
          `${posNr - 1}.2`,
          `${data.kalkulation?.buehnenTage || 3} Tage`,
          'Hubarbeitsb\u00fchne / B\u00fchnentechnik (max. H\u00f6he: 15m)',
          'pauschal',
          'inkl.'
        ]);
        
        // Baustelleneinrichtung
        tableData.push([
          `${posNr - 1}.3`,
          '1 Psch.',
          'Baustelleneinrichtung (Absperrung, Beschilderung, Schutzma\u00dfnahmen)',
          '199,00 \u20ac',
          '199,00 \u20ac'
        ]);
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['Pos', 'Menge', 'Bezeichnung', 'Einzelpreis', 'Gesamt']],
        body: tableData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [78, 87, 88],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 15, fillColor: [119, 188, 31], textColor: [255, 255, 255], fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 80 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
        },
      });
      
      // Summenblock
      const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
      yPos = finalY + 10;
      
      const gesamtNetto = data.kalkulation?.summeNetto || 0;
      const rabatt = data.kalkulation?.rabattProzent || 0;
      const rabattBetrag = gesamtNetto * (rabatt / 100);
      const nachRabatt = gesamtNetto - rabattBetrag;
      const mwst = nachRabatt * 0.19;
      const brutto = nachRabatt + mwst;
      
      doc.setFontSize(10);
      const sumCol = pageWidth - margin - 50;
      
      doc.text('Zwischensumme netto:', sumCol - 30, yPos);
      doc.text(`${gesamtNetto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} \u20ac`, sumCol + 30, yPos, { align: 'right' });
      
      if (rabatt > 0) {
        yPos += 5;
        doc.setTextColor(119, 188, 31);
        doc.text(`Rabatt (${rabatt}%):`, sumCol - 30, yPos);
        doc.text(`-${rabattBetrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} \u20ac`, sumCol + 30, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      }
      
      yPos += 5;
      doc.text('zzgl. 19% MwSt.:', sumCol - 30, yPos);
      doc.text(`${mwst.toLocaleString('de-DE', { minimumFractionDigits: 2 })} \u20ac`, sumCol + 30, yPos, { align: 'right' });
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Gesamtbetrag brutto:', sumCol - 30, yPos);
      doc.text(`${brutto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} \u20ac`, sumCol + 30, yPos, { align: 'right' });
      
      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Markenkonform gem\u00e4\u00df FassadenFix CI \u2022 Pantone 368 C / 445 C \u2022 Raleway Bold', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // PDF speichern
      const fileName = `Angebot_${angebotNummer}_${data.projektName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF erstellt', {
        description: `${fileName} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Fehler bei der PDF-Erstellung', {
        description: 'Bitte versuchen Sie es erneut.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // E-Mail Versand Mutation
  const sendEmailMutation = trpc.email.sendOffer.useMutation({
    onSuccess: () => {
      toast.success("E-Mail versendet", {
        description: `Das Angebot wurde an ${data.kunde.email || 'den Kunden'} gesendet.`,
      });
      setEmailSending(false);
    },
    onError: (error) => {
      toast.error("E-Mail-Versand fehlgeschlagen", {
        description: error.message,
      });
      setEmailSending(false);
    },
  });
  const [emailSending, setEmailSending] = useState(false);

  const handleSendEmail = () => {
    if (!data.kunde.email) {
      toast.error("Keine E-Mail-Adresse", {
        description: "Der Kunde hat keine E-Mail-Adresse hinterlegt.",
      });
      return;
    }
    
    const ansprechpartner = FF_ANSPRECHPARTNER.find(ap => ap.name === data.ansprechpartnerFF) || FF_ANSPRECHPARTNER[0];
    
    setEmailSending(true);
    sendEmailMutation.mutate({
      recipientEmail: data.kunde.email,
      recipientName: data.kunde.ansprechpartner || data.kunde.firma,
      offerNumber: angebotNummer,
      projectName: data.projektName,
      totalAmount: `${data.kalkulation.summeBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
      validUntil: data.gueltigBis,
      senderName: ansprechpartner.name,
      senderEmail: ansprechpartner.email,
      senderPhone: ansprechpartner.mobil,
      // HubSpot-Verknüpfungen für Timeline-Erfassung
      hubspotContactId,
      hubspotCompanyId,
      hubspotDealId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" style={{ color: CI_COLORS.green }} />
              Angebot {angebotNummer} – PDF-Vorschau
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Drucken
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                disabled={emailSending || !data.kunde.email}
                className="gap-2"
              >
                {emailSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sende...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Per E-Mail
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="gap-2"
                style={{ backgroundColor: CI_COLORS.green }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Erstelle PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    PDF herunterladen
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* PDF Preview Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <PDFPreview 
            data={data} 
            angebotNummer={angebotNummer}
            stoererConfig={stoererConfig}
            bedingungenConfig={bedingungenConfig}
          />
        </div>
        
        {/* CI Compliance Notice */}
        <div 
          className="p-2 text-center text-[10px] border-t"
          style={{ backgroundColor: CI_COLORS.lightGray, color: CI_COLORS.textGray }}
        >
          Markenkonform gemäß FassadenFix CI • Pantone 368 C / 445 C • Raleway Bold
        </div>
      </DialogContent>
    </Dialog>
  );
}
