/**
 * PDF-Entwürfe Vergleichsseite
 * 
 * ORIGINAL: Exakte 1:1 Nachbildung des Original-Screenshots
 * ENTWURF B: Optimierte Version mit kompakterem Störer
 */

import { useState } from "react";
import { Check } from "lucide-react";
import { DemoBanner } from "@/components/DemoBanner";

// ============================================
// CI-FARBEN (aus Original-Screenshot)
// ============================================
const CI = {
  green: '#77bc1f',
  gray: '#4e5758',
  textGray: '#6b7577',
  bgLight: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
};

const LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/bfjsQnhVmokSljGd.png';

// Preisstaffel (aus Original-Screenshot)
const PREISSTAFFEL = [
  { label: '500 - 999 m²', preis: 10.50 },
  { label: '1.000 - 2.499 m²', preis: 9.75 },
  { label: '2.500 - 4.999 m²', preis: 9.25 },
  { label: 'ab 5.000 m²', preis: 8.75 },
];

// Garantien (aus Original-Screenshot)
const GARANTIEN = [
  '5-Jahres-Garantie auf Algenfreiheit',
  'Ergebnisgarantie bei Systemreinigung',
  'Jährliche Inspektion inklusive',
  'Pauschalfestpreis – keine versteckten Kosten',
];

// Mock-Daten
const mockData = {
  kunde: {
    firma: "3A Immobilien",
    ansprechpartner: "Frau Daniela Brehmer",
    strasse: "Herrenstraße 20",
    plz: "06108",
    ort: "06108",
  },
  angebotNummer: "",
  datum: "04.02.2026",
  gueltigBis: "04.03.2026",
};

// ============================================
// ORIGINAL: Exakte 1:1 Nachbildung
// ============================================
function Original() {
  return (
    <div 
      className="bg-white shadow-lg mx-auto"
      style={{ 
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm',
        fontFamily: "'Raleway', sans-serif",
        color: CI.gray,
        fontSize: '11px',
        lineHeight: 1.5,
      }}
    >
      {/* 1. Logo - Groß, zentriert */}
      <div className="text-center mb-4">
        <img 
          src={LOGO_URL} 
          alt="FassadenFix" 
          style={{ height: '80px', margin: '0 auto' }} 
        />
      </div>

      {/* 2. Firmenzeile - Zentriert unter Logo */}
      <div 
        className="text-center mb-8"
        style={{ fontSize: '9px', color: CI.textGray }}
      >
        FASSADENFIX · Immobiliengruppe Retzlaff OHG · An der Saalebahn 8a · 06118 Halle
      </div>

      {/* 3. Adressblock - 2 Spalten */}
      <div className="flex justify-between mb-8">
        {/* Links: Kunde */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '13px' }}>{mockData.kunde.firma}</p>
          <p>{mockData.kunde.ansprechpartner}</p>
          <p>{mockData.kunde.strasse}</p>
          <p>{mockData.kunde.plz} {mockData.kunde.ort}</p>
        </div>
        
        {/* Rechts: Metadaten */}
        <div className="text-right">
          <table className="ml-auto" style={{ fontSize: '10px' }}>
            <tbody>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>Angebotsnummer</td>
                <td style={{ fontWeight: 500 }}></td>
              </tr>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>Kundennummer</td>
                <td></td>
              </tr>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>Datum</td>
                <td style={{ fontWeight: 700 }}>{mockData.datum}</td>
              </tr>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>Ihr Ansprechpartner</td>
                <td></td>
              </tr>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>E-Mail</td>
                <td></td>
              </tr>
              <tr>
                <td className="pr-4 text-right" style={{ color: CI.textGray }}>Mobil</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Titel */}
      <div className="mb-4">
        <h2 
          className="inline-block pb-1"
          style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: CI.gray,
            borderBottom: `2px solid ${CI.green}`,
          }}
        >
          Angebot Nr.
        </h2>
      </div>

      {/* 5. Einleitungstext */}
      <p className="mb-6" style={{ color: CI.gray }}>
        Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!<br/>
        Nachfolgend unser individuelles Angebot für Sie:
      </p>

      {/* 6. Positionstabelle */}
      <table className="w-full mb-4" style={{ fontSize: '10px' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${CI.green}` }}>
            <th className="text-left py-2 w-16" style={{ color: CI.green, fontWeight: 600 }}>Pos</th>
            <th className="text-left py-2 w-24" style={{ color: CI.gray, fontWeight: 600 }}>Menge</th>
            <th className="text-left py-2" style={{ color: CI.gray, fontWeight: 600 }}>Bezeichnung</th>
            <th className="text-right py-2 w-24" style={{ color: CI.gray, fontWeight: 600 }}>Einzelpreis</th>
            <th className="text-right py-2 w-24" style={{ color: CI.gray, fontWeight: 600 }}>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {/* Leere Tabelle wie im Original */}
        </tbody>
      </table>

      {/* 7. Summenblock */}
      <div className="flex justify-end mb-8">
        <div className="w-64" style={{ fontSize: '10px' }}>
          <div className="flex justify-between py-1">
            <span>Nettobetrag</span>
            <span>0,00 €</span>
          </div>
          <div className="flex justify-between py-1">
            <span>zzgl. 19% MwSt.</span>
            <span>0,00 €</span>
          </div>
          <div 
            className="flex justify-between py-2 mt-1"
            style={{ 
              borderTop: `1px solid ${CI.gray}`,
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span>Gesamtsumme</span>
            <span>0,00 €</span>
          </div>
        </div>
      </div>

      {/* 8. Störer */}
      <div 
        className="mb-6 overflow-hidden"
        style={{ border: `1px solid ${CI.border}` }}
      >
        {/* Header */}
        <div 
          className="px-4 py-2"
          style={{ backgroundColor: CI.green }}
        >
          <span style={{ color: CI.white, fontWeight: 600, fontSize: '11px' }}>
            Das FassadenFix Versprechen
          </span>
        </div>
        
        {/* Content - 2 Spalten */}
        <div className="grid grid-cols-2" style={{ backgroundColor: CI.white }}>
          {/* Linke Spalte: Preisstaffel */}
          <div className="p-4" style={{ borderRight: `1px solid ${CI.border}` }}>
            <h4 style={{ fontWeight: 600, fontSize: '10px', color: CI.gray, marginBottom: '12px' }}>
              Transparente Preisstaffel
            </h4>
            <table className="w-full" style={{ fontSize: '9px' }}>
              <thead>
                <tr>
                  <th className="text-left pb-2" style={{ color: CI.textGray, fontWeight: 500 }}>FLÄCHE</th>
                  <th className="text-right pb-2" style={{ color: CI.textGray, fontWeight: 500 }}>€/M²</th>
                </tr>
              </thead>
              <tbody>
                {PREISSTAFFEL.map((s, i) => (
                  <tr key={i}>
                    <td className="py-1" style={{ color: CI.gray }}>{s.label}</td>
                    <td className="py-1 text-right" style={{ color: CI.green, fontWeight: 500 }}>
                      {s.preis.toFixed(2).replace('.', ',')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Rechte Spalte: Garantien */}
          <div className="p-4">
            <h4 style={{ fontWeight: 600, fontSize: '10px', color: CI.gray, marginBottom: '12px' }}>
              Unsere Garantien
            </h4>
            <ul style={{ fontSize: '9px' }}>
              {GARANTIEN.map((g, i) => (
                <li key={i} className="flex items-start gap-2 py-1">
                  <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: CI.green }} />
                  <span style={{ color: CI.gray }}>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className="px-4 py-2 text-center"
          style={{ backgroundColor: CI.bgLight }}
        >
          <span style={{ color: CI.green, fontSize: '9px', fontStyle: 'italic' }}>
            FassadenFix – der sichere Weg zur sauberen Fassade
          </span>
        </div>
      </div>

      {/* 9. Angebotsbedingungen */}
      <div className="mb-6">
        <h4 style={{ fontWeight: 700, fontSize: '11px', color: CI.gray, marginBottom: '4px' }}>
          Angebotsbedingungen
        </h4>
        <p style={{ fontSize: '10px', color: CI.gray, marginBottom: '8px' }}>
          <span style={{ color: CI.green, fontWeight: 500 }}>Gültigkeit:</span> {mockData.gueltigBis} (4 Wochen)
          <span className="mx-2">·</span>
          <span style={{ color: CI.green, fontWeight: 500 }}>Zahlung:</span> 7 Tage netto
          <span className="mx-2">·</span>
          <span style={{ color: CI.green, fontWeight: 500 }}>Leistungsort:</span> wie vereinbart
        </p>
        <p style={{ fontSize: '9px', color: CI.textGray }}>
          Sperrungen: Beantragung und Verantwortung beim AG. Es gelten unsere AGB (www.fassadenfix.de/agb).
        </p>
        <div className="mt-4" style={{ height: '2px', backgroundColor: CI.green }} />
      </div>

      {/* 10. Footer */}
      <div style={{ fontSize: '7px', color: '#7f7f7f', marginTop: '24px', lineHeight: '1.5' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '25% 25% 25% 25%', gap: '0' }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0', color: '#74b91f' }}>FASSADENFIX</p>
            <p style={{ marginBottom: '0' }}>Immobiliengruppe Retzlaff oHG</p>
            <p style={{ marginBottom: '0' }}>An der Saalebahn 8a</p>
            <p>06118 Halle (Saale)</p>
          </div>
          <div>
            <p style={{ marginBottom: '0' }}>Tel: 0345 218392 35</p>
            <p style={{ marginBottom: '0' }}>info@fassadenfix.de</p>
            <p>www.fassadenfix.de</p>
          </div>
          <div>
            <p style={{ marginBottom: '0' }}>Geschäftsführer: A. Retzlaff</p>
            <p style={{ marginBottom: '0' }}>HRA 4244 · AG Stendal</p>
            <p>USt-ID: DE265643072</p>
          </div>
          <div>
            <p style={{ marginBottom: '0' }}>Commerzbank Halle</p>
            <p style={{ marginBottom: '0' }}>DE49 8004 0000 0325 <span style={{ backgroundColor: '#f3f9ec', padding: '0 2px' }}>0123</span> 00</p>
            <p>BIC: COBADEFFXXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ENTWURF B: Optimierte Version (später)
// ============================================
function EntwurfB() {
  // Platzhalter - wird später implementiert
  return <Original />;
}

// ============================================
// HAUPTKOMPONENTE
// ============================================
export default function PDFEntwuerfe() {
  const [activeTab, setActiveTab] = useState<'original' | 'b'>('original');

  const tabs = [
    { id: 'original' as const, label: 'Original', desc: 'Exakte 1:1 Nachbildung' },
    { id: 'b' as const, label: 'Entwurf B', desc: 'Optimierte Version' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[240mm] mx-auto">
        <div className="px-4 mb-4">
          <DemoBanner description="Die PDF-Layouts zeigen Beispielentwürfe. Die finale Angebots-PDF wird aus echten Projektdaten generiert." />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: CI.gray }}>
          PDF-Layout Vergleich
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Original vs. Optimierte Version
        </p>

        {/* TAB-NAVIGATION */}
        <div className="flex justify-center gap-4 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-white shadow-lg' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              style={activeTab === tab.id ? { borderBottom: `3px solid ${CI.green}` } : {}}
            >
              <div className="font-semibold" style={{ color: activeTab === tab.id ? CI.green : CI.gray }}>
                {tab.label}
              </div>
              <div className="text-xs text-gray-500">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* ENTWURF ANZEIGE */}
        <div className="overflow-auto pb-8">
          {activeTab === 'original' && <Original />}
          {activeTab === 'b' && <EntwurfB />}
        </div>
      </div>
    </div>
  );
}
