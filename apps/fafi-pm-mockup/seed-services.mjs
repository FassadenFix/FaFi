/**
 * Seed-Script: libraryServices mit den 24 echten Produkten aus dem FassadenFix Produktkatalog befüllen
 * Quelle: FassadenFix_Produktkatalog_HubSpot.xlsx
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.DATABASE_URL);

// Mapping: Produktkatalog-Typ → serviceType Enum
// hauptleistung: Kerngeschäft (Fassadenreinigung, Graffiti, Sanierung, Spezialreinigung)
// zusatzleistung: Ergänzende Leistungen (Gerüst, Bühne, An-/Abfahrt, Aufmaß, Doku)
function mapServiceType(sku) {
  if (sku.startsWith("ZL-")) return "zusatzleistung";
  return "hauptleistung";
}

// Mapping: Einheit → pricingUnit
function mapPricingUnit(unit) {
  const map = {
    "m²": "pro m²",
    "lfd.m": "pro lfd.m",
    "Tag": "pro Tag",
    "Pauschale": "pauschal",
    "km": "pro km",
    "Stück": "pro Stück",
  };
  return map[unit] || unit;
}

const PRODUKTE = [
  // === FASSADENREINIGUNG (FR) ===
  {
    name: "Fassadenreinigung Standard",
    sku: "FR-001",
    unit: "m²",
    price: 8.50,
    description: "Standardreinigung mineralischer Fassaden mit umweltverträglichen Reinigungsmitteln. Entfernung von Schmutz, Staub und leichten Ablagerungen.",
  },
  {
    name: "Fassadenreinigung Intensiv",
    sku: "FR-002",
    unit: "m²",
    price: 12.50,
    description: "Intensivreinigung bei starker Verschmutzung. Mehrfachbehandlung mit Spezialreinigern für hartnäckige Ablagerungen und Verfärbungen.",
  },
  {
    name: "Algen- und Moosentfernung",
    sku: "FR-003",
    unit: "m²",
    price: 9.50,
    description: "Professionelle Behandlung gegen Algen, Moos und mikrobiellen Bewuchs. Inkl. Vorbehandlung und Nachspülung.",
  },
  {
    name: "Hydrophobe Imprägnierung",
    sku: "FR-004",
    unit: "m²",
    price: 6.50,
    description: "Wasserabweisende Imprägnierung nach Reinigung. Schützt die Fassade langfristig vor Feuchtigkeit und erneuter Verschmutzung.",
  },

  // === GRAFFITI (GR) ===
  {
    name: "Graffitientfernung Standard",
    sku: "GR-001",
    unit: "m²",
    price: 35.00,
    description: "Entfernung von Graffiti auf glatten Untergründen (Glas, Metall, lackierte Flächen) mit schonenden Lösemitteln.",
  },
  {
    name: "Graffitientfernung Porös",
    sku: "GR-002",
    unit: "m²",
    price: 55.00,
    description: "Entfernung von Graffiti auf porösen Untergründen (Klinker, Naturstein, Beton). Spezialverfahren mit Heißdampf und chemischer Nachbehandlung.",
  },
  {
    name: "Graffitischutz Permanent",
    sku: "GR-003",
    unit: "m²",
    price: 18.00,
    description: "Permanenter Graffitischutz. Transparente Beschichtung, die mehrfache Reinigungen ohne Erneuerung ermöglicht.",
  },
  {
    name: "Graffitischutz Semipermanent",
    sku: "GR-004",
    unit: "m²",
    price: 12.00,
    description: "Semipermanenter Graffitischutz. Opferschicht, die bei Reinigung mit entfernt und erneuert wird.",
  },

  // === FASSADENSANIERUNG (FS) ===
  {
    name: "Fassadenreparatur Kleinschäden",
    sku: "FS-001",
    unit: "Stück",
    price: 85.00,
    description: "Reparatur einzelner Schadstellen (Risse, Abplatzungen, Löcher) bis 0,5 m². Inkl. Grundierung und Farbabgleich.",
  },
  {
    name: "Fassadenreparatur Großfläche",
    sku: "FS-002",
    unit: "m²",
    price: 45.00,
    description: "Großflächige Fassadenreparatur bei Schäden über 0,5 m². Inkl. Armierungsgewebe, Grundierung und Oberflächenfinish.",
  },
  {
    name: "Fassadenanstrich Dispersionsfarbe",
    sku: "FS-003",
    unit: "m²",
    price: 14.00,
    description: "Fassadenanstrich mit hochwertiger Dispersionsfarbe. 2-maliger Anstrich inkl. Grundierung. Für mineralische Untergründe.",
  },
  {
    name: "Fassadenanstrich Silikatfarbe",
    sku: "FS-004",
    unit: "m²",
    price: 18.00,
    description: "Fassadenanstrich mit Silikatfarbe. Besonders dampfdiffusionsoffen und witterungsbeständig. Für Denkmal und Altbau.",
  },
  {
    name: "Fassadenanstrich Silikonharzfarbe",
    sku: "FS-005",
    unit: "m²",
    price: 22.00,
    description: "Fassadenanstrich mit Silikonharzfarbe. Höchste Witterungsbeständigkeit und Selbstreinigungseffekt (Lotuseffekt).",
  },

  // === ZUSATZLEISTUNGEN (ZL) ===
  {
    name: "Gerüststellung Standardgerüst",
    sku: "ZL-001",
    unit: "lfd.m",
    price: 12.00,
    description: "Auf- und Abbau eines Standardgerüsts nach DIN EN 12810/12811. Inkl. Prüfung und Freigabe. Standzeit bis 4 Wochen.",
  },
  {
    name: "Hubarbeitsbühne",
    sku: "ZL-002",
    unit: "Tag",
    price: 280.00,
    description: "Bereitstellung einer Hubarbeitsbühne inkl. Bediener. Arbeitshöhe bis 26m. Inkl. An-/Abtransport im Nahbereich.",
  },
  {
    name: "Hängegerüst",
    sku: "ZL-003",
    unit: "lfd.m",
    price: 35.00,
    description: "Auf- und Abbau eines Hängegerüsts für schwer zugängliche Fassadenbereiche. Inkl. Sicherheitseinrichtungen.",
  },
  {
    name: "An-/Abfahrt Regional",
    sku: "ZL-004",
    unit: "Pauschale",
    price: 45.00,
    description: "Pauschale für An- und Abfahrt im regionalen Umkreis (bis 50 km). Inkl. Fahrzeug und Personal.",
  },
  {
    name: "An-/Abfahrt Überregional",
    sku: "ZL-005",
    unit: "km",
    price: 0.85,
    description: "Kilometerbasierte Abrechnung für An- und Abfahrt bei überregionalen Einsätzen (ab 50 km). Einfache Strecke.",
  },
  {
    name: "Übernachtungspauschale",
    sku: "ZL-006",
    unit: "pro Nacht",
    price: 85.00,
    description: "Pauschale für Übernachtung bei mehrtägigen Einsätzen. Pro Mitarbeiter und Nacht.",
  },
  {
    name: "Baustelleneinrichtung",
    sku: "ZL-007",
    unit: "Pauschale",
    price: 199.00,
    description: "Pauschale für Baustelleneinrichtung pro Immobilie. Inkl. Absperrungen, Beschilderung und Schutzmaßnahmen.",
  },
  {
    name: "Aufmaß und Bestandsaufnahme",
    sku: "ZL-008",
    unit: "Pauschale",
    price: 150.00,
    description: "Professionelles Aufmaß und Bestandsaufnahme vor Ort. Inkl. Fotodokumentation und Zustandsbewertung.",
  },
  {
    name: "Objektdokumentation",
    sku: "ZL-009",
    unit: "Pauschale",
    price: 95.00,
    description: "Umfassende Dokumentation des Objektzustands vor und nach den Arbeiten. Inkl. Fotodokumentation und Bericht.",
  },

  // === SPEZIALREINIGUNG (SP) ===
  {
    name: "Denkmalreinigung schonend",
    sku: "SP-001",
    unit: "m²",
    price: 25.00,
    description: "Schonende Reinigung denkmalgeschützter Fassaden. Niederdruckverfahren mit speziellen Reinigungsmitteln für historische Substanz.",
  },
  {
    name: "Klinkerfassade Reinigung",
    sku: "SP-002",
    unit: "m²",
    price: 11.00,
    description: "Spezialreinigung für Klinkerfassaden. Entfernung von Ausblühungen, Verschmutzungen und biologischem Bewuchs.",
  },
  {
    name: "Natursteinfassade Reinigung",
    sku: "SP-003",
    unit: "m²",
    price: 18.00,
    description: "Reinigung von Natursteinfassaden (Sandstein, Kalkstein, Granit). Materialschonende Verfahren mit pH-neutralen Reinigern.",
  },
  {
    name: "Glasfassade Reinigung",
    sku: "SP-004",
    unit: "m²",
    price: 4.50,
    description: "Professionelle Reinigung von Glasfassaden und Fensterfronten. Streifenfreie Ergebnisse mit osmotisch gereinigtem Wasser.",
  },
];

async function seedServices() {
  const conn = await pool.getConnection();

  try {
    // 1. Alte Leistungen löschen
    console.log("🧹 Alte Leistungen löschen...");
    await conn.query("DELETE FROM libraryServices");

    // 2. Neue Produkte einfügen
    console.log("📋 24 Produkte aus Produktkatalog einfügen...");
    let count = 0;

    for (const p of PRODUKTE) {
      const serviceType = mapServiceType(p.sku);
      const pricingUnit = mapPricingUnit(p.unit);
      const includedInOffer = !p.sku.startsWith("ZL-"); // Zusatzleistungen nicht standardmäßig im Angebot

      await conn.query(
        `INSERT INTO libraryServices (name, serviceType, description, basePrice, pricingUnit, includedInOffer, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'aktiv')`,
        [
          p.name,
          serviceType,
          p.description,
          p.price.toFixed(2),
          pricingUnit,
          includedInOffer,
          `SKU: ${p.sku}`,
        ]
      );
      count++;
    }

    console.log(`   ✅ ${count} Produkte angelegt`);

    // 3. Zusammenfassung
    const [rows] = await conn.query(
      "SELECT serviceType, COUNT(*) as cnt FROM libraryServices GROUP BY serviceType"
    );
    console.log("\n📊 Zusammenfassung:");
    for (const row of rows) {
      console.log(`   ${row.serviceType}: ${row.cnt} Einträge`);
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

seedServices().catch(console.error);
