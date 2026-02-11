/**
 * Seed-Script: Befüllt die Bibliothek-Tabellen mit realistischen Echtdaten
 * für FassadenFix Fassadenreinigung.
 * 
 * Ausführung: node seed-library.mjs
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL nicht gesetzt!");
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);

async function clearAndSeed() {
  const conn = await pool.getConnection();
  
  try {
    // Zuerst alte Testdaten bereinigen
    console.log("🧹 Bereinige alte Testdaten...");
    await conn.query("DELETE FROM libraryVehicles WHERE name LIKE 'Test-Toggle%'");
    await conn.query("DELETE FROM libraryEquipment WHERE name LIKE 'Test-Toggle%'");
    await conn.query("DELETE FROM libraryDiscounts WHERE name LIKE 'Test-Toggle%'");
    
    // ═══════════════════════════════════════════════════════════════
    // 1. FAHRZEUGE (libraryVehicles)
    // ═══════════════════════════════════════════════════════════════
    console.log("🚐 Fahrzeuge anlegen...");
    
    const vehicles = [
      // Waschbusse – das Herzstück der Flotte
      {
        name: "Waschbus 1 – MAN TGE 3.180",
        vehicleType: "waschbus",
        licensePlate: "HAL-FF 101",
        manufacturer: "MAN",
        model: "TGE 3.180 4x2",
        year: 2024,
        capacity: "3,5t – Wasseranlage 1.000L",
        fuelType: "diesel",
        dailyCost: "185.00",
        notes: "Hauptfahrzeug Einsatzteam 1. Wasseraufbereitung + Hochdruckanlage integriert.",
        status: "aktiv"
      },
      {
        name: "Waschbus 2 – MAN TGE 3.180",
        vehicleType: "waschbus",
        licensePlate: "HAL-FF 102",
        manufacturer: "MAN",
        model: "TGE 3.180 4x2",
        year: 2023,
        capacity: "3,5t – Wasseranlage 1.000L",
        fuelType: "diesel",
        dailyCost: "185.00",
        notes: "Hauptfahrzeug Einsatzteam 2. Wasseraufbereitung + Hochdruckanlage integriert.",
        status: "aktiv"
      },
      {
        name: "Waschbus 3 – Iveco Daily",
        vehicleType: "waschbus",
        licensePlate: "HAL-FF 103",
        manufacturer: "Iveco",
        model: "Daily 35S16",
        year: 2022,
        capacity: "3,5t – Wasseranlage 800L",
        fuelType: "diesel",
        dailyCost: "165.00",
        notes: "Reservefahrzeug / Einsatzteam 3. Kleinere Wasseranlage.",
        status: "aktiv"
      },
      // Dienstwagen
      {
        name: "Dienstwagen GF – VW Passat",
        vehicleType: "dienstwagen",
        licensePlate: "HAL-FF 201",
        manufacturer: "Volkswagen",
        model: "Passat Variant 2.0 TDI",
        year: 2024,
        capacity: "5 Personen",
        fuelType: "diesel",
        dailyCost: "95.00",
        notes: "Geschäftsführung – Kundenbesuche und Objektaufnahmen.",
        status: "aktiv"
      },
      {
        name: "Dienstwagen KB – Škoda Octavia",
        vehicleType: "dienstwagen",
        licensePlate: "HAL-FF 202",
        manufacturer: "Škoda",
        model: "Octavia Combi 2.0 TDI",
        year: 2023,
        capacity: "5 Personen",
        fuelType: "diesel",
        dailyCost: "75.00",
        notes: "Kundenberater – Objektaufnahmen und Kundentermine.",
        status: "aktiv"
      },
      // Poolfahrzeug
      {
        name: "Poolfahrzeug – VW Caddy",
        vehicleType: "poolfahrzeug",
        licensePlate: "HAL-FF 301",
        manufacturer: "Volkswagen",
        model: "Caddy Cargo 2.0 TDI",
        year: 2023,
        capacity: "3 Personen + Laderaum",
        fuelType: "diesel",
        dailyCost: "55.00",
        notes: "Für Materialtransport und kleinere Einsätze.",
        status: "aktiv"
      },
      // Anhänger
      {
        name: "Bühnenanhänger 1 – Humbaur",
        vehicleType: "anhaenger",
        licensePlate: "HAL-FF 401",
        manufacturer: "Humbaur",
        model: "HT 3000 Tandem",
        year: 2022,
        capacity: "3,0t zGG – Bühnentransport",
        dailyCost: "35.00",
        notes: "Für Transport der Anhängerbühne und Zusatzausrüstung.",
        status: "aktiv"
      },
      // Transporter
      {
        name: "Transporter – Mercedes Sprinter",
        vehicleType: "transporter",
        licensePlate: "HAL-FF 501",
        manufacturer: "Mercedes-Benz",
        model: "Sprinter 316 CDI",
        year: 2024,
        capacity: "3,5t – Laderaum 14m³",
        fuelType: "diesel",
        dailyCost: "120.00",
        notes: "Materialtransport für Großprojekte. Gerüstteile, Reinigungsmittel.",
        status: "aktiv"
      },
    ];

    for (const v of vehicles) {
      await conn.query(
        `INSERT INTO libraryVehicles (name, vehicleType, licensePlate, manufacturer, model, year, capacity, fuelType, dailyCost, notes, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.name, v.vehicleType, v.licensePlate, v.manufacturer, v.model, v.year, v.capacity, v.fuelType, v.dailyCost, v.notes, v.status]
      );
    }
    console.log(`   ✅ ${vehicles.length} Fahrzeuge angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 2. BÜHNENTECHNIK (libraryEquipment)
    // ═══════════════════════════════════════════════════════════════
    console.log("🏗️  Bühnentechnik anlegen...");
    
    const equipment = [
      // Eigene Bühnen
      {
        name: "Gelenkteleskop 16m – Haulotte HA16",
        equipmentType: "gelenkteleskop",
        manufacturer: "Haulotte",
        model: "HA16 RTJ PRO",
        maxHeight: "16.0",
        maxReach: "9.5",
        weight: "7200",
        ownership: "eigen",
        dailyRate: "280.00",
        purchasePrice: "85000.00",
        serialNumber: "FF-GT-001",
        description: "Allrounder für 2-5 Geschosse. Diesel-Allrad, geländegängig.",
        status: "aktiv"
      },
      {
        name: "Gelenkteleskop 20m – JLG 600AJ",
        equipmentType: "gelenkteleskop",
        manufacturer: "JLG",
        model: "600AJ",
        maxHeight: "20.3",
        maxReach: "11.0",
        weight: "9980",
        ownership: "eigen",
        dailyRate: "320.00",
        purchasePrice: "110000.00",
        serialNumber: "FF-GT-002",
        description: "Für höhere Gebäude bis 6 Geschosse. Diesel-Allrad.",
        status: "aktiv"
      },
      // Teleskop
      {
        name: "Teleskop 26m – Genie S-85 XC",
        equipmentType: "teleskop",
        manufacturer: "Genie",
        model: "S-85 XC",
        maxHeight: "27.9",
        maxReach: "23.3",
        weight: "14500",
        ownership: "eigen",
        dailyRate: "380.00",
        purchasePrice: "145000.00",
        serialNumber: "FF-TL-001",
        description: "Für hohe Gebäude und große Reichweite. Diesel-Allrad.",
        status: "aktiv"
      },
      // Scherenlift
      {
        name: "Scherenlift 12m – Skyjack SJ6832",
        equipmentType: "scherenlift",
        manufacturer: "Skyjack",
        model: "SJ6832 RT",
        maxHeight: "11.7",
        maxReach: null,
        weight: "4600",
        ownership: "eigen",
        dailyRate: "180.00",
        purchasePrice: "42000.00",
        serialNumber: "FF-SL-001",
        description: "Kompakt, für niedrige Gebäude und Sockelreinigung. Diesel.",
        status: "aktiv"
      },
      // Anhängerlift
      {
        name: "Anhängerlift 14m – Niftylift 150T",
        equipmentType: "anhaengerlift",
        manufacturer: "Niftylift",
        model: "150T",
        maxHeight: "15.0",
        maxReach: "8.7",
        weight: "1850",
        ownership: "eigen",
        dailyRate: "150.00",
        purchasePrice: "35000.00",
        serialNumber: "FF-AL-001",
        description: "Leicht, mit PKW-Anhänger transportierbar. Ideal für Einzelobjekte.",
        status: "aktiv"
      },
      // Hochdruckreiniger
      {
        name: "Hochdruckreiniger 250bar – Kärcher HD 10/25",
        equipmentType: "hochdruckreiniger",
        manufacturer: "Kärcher",
        model: "HD 10/25-4 S Plus",
        maxHeight: null,
        maxReach: null,
        weight: "62",
        ownership: "eigen",
        dailyRate: "65.00",
        purchasePrice: "4200.00",
        serialNumber: "FF-HD-001",
        description: "Profi-Hochdruckreiniger für Fassadenreinigung. 250 bar, 1.000 l/h.",
        status: "aktiv"
      },
      {
        name: "Hochdruckreiniger 350bar – Kärcher HD 13/35",
        equipmentType: "hochdruckreiniger",
        manufacturer: "Kärcher",
        model: "HD 13/35-4 Cage Plus",
        maxHeight: null,
        maxReach: null,
        weight: "85",
        ownership: "eigen",
        dailyRate: "85.00",
        purchasePrice: "6800.00",
        serialNumber: "FF-HD-002",
        description: "Schwerlast-Hochdruckreiniger für hartnäckige Verschmutzungen. 350 bar.",
        status: "aktiv"
      },
      // Sprühgeräte
      {
        name: "Sprühgerät 200L – Gloria 2020",
        equipmentType: "sprühgeraet",
        manufacturer: "Gloria",
        model: "Profiline 2020",
        maxHeight: null,
        maxReach: null,
        weight: "28",
        ownership: "eigen",
        dailyRate: "25.00",
        purchasePrice: "890.00",
        serialNumber: "FF-SG-001",
        description: "Für Imprägnierung und Nachbehandlung. 200L Tank, Akku-Pumpe.",
        status: "aktiv"
      },
      {
        name: "Sprühgerät 50L – Gloria 510T",
        equipmentType: "sprühgeraet",
        manufacturer: "Gloria",
        model: "510T Profiline",
        maxHeight: null,
        maxReach: null,
        weight: "8",
        ownership: "eigen",
        dailyRate: "15.00",
        purchasePrice: "320.00",
        serialNumber: "FF-SG-002",
        description: "Tragbares Sprühgerät für Detailarbeiten und Nachbehandlung.",
        status: "aktiv"
      },
    ];

    for (const e of equipment) {
      await conn.query(
        `INSERT INTO libraryEquipment (name, equipmentType, manufacturer, model, maxHeight, maxReach, weight, ownership, dailyRate, purchasePrice, serialNumber, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.name, e.equipmentType, e.manufacturer, e.model, e.maxHeight, e.maxReach, e.weight, e.ownership, e.dailyRate, e.purchasePrice, e.serialNumber, e.description, e.status]
      );
    }
    console.log(`   ✅ ${equipment.length} Geräte angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 3. REINIGUNGSMITTEL (libraryCleaningAgents)
    // ═══════════════════════════════════════════════════════════════
    console.log("🧴 Reinigungsmittel anlegen...");
    
    const cleaningAgents = [
      {
        name: "FassadenFix Pro – Systemreiniger",
        articleNumber: "FF-RM-001",
        applicationArea: "WDVS, Putz – Algen, Moos, Flechten, Schwarzalgen",
        containerSize: "25 Liter",
        purchasePrice: "89.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 5-8 m²/Liter",
        supplier: "FassadenFix Eigenproduktion",
        minStock: 20,
        currentStock: 45,
        description: "Haupt-Systemreiniger für die Standardreinigung. Biologisch abbaubar, fassadenschonend.",
        status: "aktiv"
      },
      {
        name: "FassadenFix Intensiv – Spezialreiniger",
        articleNumber: "FF-RM-002",
        applicationArea: "Klinker, Sichtbeton – hartnäckige Verschmutzungen, Ruß, Industriestaub",
        containerSize: "25 Liter",
        purchasePrice: "125.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 3-5 m²/Liter",
        supplier: "FassadenFix Eigenproduktion",
        minStock: 10,
        currentStock: 22,
        description: "Für hartnäckige Verschmutzungen auf mineralischen Untergründen.",
        status: "aktiv"
      },
      {
        name: "FassadenFix Protect – Imprägnierung",
        articleNumber: "FF-RM-003",
        applicationArea: "Alle Fassadentypen – Langzeitschutz nach Reinigung",
        containerSize: "10 Liter",
        purchasePrice: "145.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 3-4 m²/Liter",
        supplier: "FassadenFix Eigenproduktion",
        minStock: 15,
        currentStock: 30,
        description: "Hydrophobe Imprägnierung für Langzeitschutz. Verhindert Neubefall für 5+ Jahre.",
        status: "aktiv"
      },
      {
        name: "FassadenFix Graffiti-Ex",
        articleNumber: "FF-RM-004",
        applicationArea: "Alle Fassadentypen – Graffiti-Entfernung",
        containerSize: "5 Liter",
        purchasePrice: "78.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 2-4 m²/Liter",
        supplier: "FassadenFix Eigenproduktion",
        minStock: 5,
        currentStock: 12,
        description: "Spezialreiniger für Graffiti-Entfernung. Lösemittelfrei.",
        status: "aktiv"
      },
      {
        name: "FassadenFix Holz-Spezial",
        articleNumber: "FF-RM-005",
        applicationArea: "Holzfassaden – Vergrauung, Moos, Algen",
        containerSize: "10 Liter",
        purchasePrice: "95.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 4-6 m²/Liter",
        supplier: "FassadenFix Eigenproduktion",
        minStock: 5,
        currentStock: 8,
        description: "Schonende Reinigung für Holzfassaden. Erhält die natürliche Holzstruktur.",
        status: "aktiv"
      },
      {
        name: "Neutralisator pH7",
        articleNumber: "FF-RM-010",
        applicationArea: "Alle Fassadentypen – Nachspülung nach Intensivreinigung",
        containerSize: "25 Liter",
        purchasePrice: "35.00",
        sellingPrice: "0.00",
        coveragePerLiter: "ca. 10-15 m²/Liter",
        supplier: "ChemPro GmbH",
        minStock: 10,
        currentStock: 18,
        description: "pH-neutrales Nachspülmittel. Pflicht nach Intensivreinigung.",
        status: "aktiv"
      },
    ];

    for (const c of cleaningAgents) {
      await conn.query(
        `INSERT INTO libraryCleaningAgents (name, articleNumber, applicationArea, containerSize, purchasePrice, sellingPrice, coveragePerLiter, supplier, minStock, currentStock, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.name, c.articleNumber, c.applicationArea, c.containerSize, c.purchasePrice, c.sellingPrice, c.coveragePerLiter, c.supplier, c.minStock, c.currentStock, c.description, c.status]
      );
    }
    console.log(`   ✅ ${cleaningAgents.length} Reinigungsmittel angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 4. PREISSTAFFELN & RABATTE (libraryDiscounts)
    // ═══════════════════════════════════════════════════════════════
    console.log("💰 Preisstaffeln & Rabatte anlegen...");
    
    const discounts = [
      // Preisstaffeln (gemäß ff-preisrechner Skill)
      {
        name: "Staffel S – 500 bis 999 m²",
        discountType: "preisstaffel",
        minFlaeche: 500,
        maxFlaeche: 999,
        pricePerSqm: "10.50",
        stoererText: "Ihr Preis: 10,50 €/m²",
        stoererSubtext: "Staffelpreis für 500-999 m²",
        description: "Einstiegsstaffel für kleinere Projekte.",
        status: "aktiv"
      },
      {
        name: "Staffel M – 1.000 bis 2.499 m²",
        discountType: "preisstaffel",
        minFlaeche: 1000,
        maxFlaeche: 2499,
        pricePerSqm: "9.75",
        stoererText: "Ihr Preis: 9,75 €/m²",
        stoererSubtext: "Staffelpreis für 1.000-2.499 m²",
        description: "Mittlere Projekte – typisch für Mehrfamilienhäuser.",
        status: "aktiv"
      },
      {
        name: "Staffel L – 2.500 bis 4.999 m²",
        discountType: "preisstaffel",
        minFlaeche: 2500,
        maxFlaeche: 4999,
        pricePerSqm: "9.25",
        stoererText: "Ihr Preis: 9,25 €/m²",
        stoererSubtext: "Staffelpreis für 2.500-4.999 m²",
        description: "Große Projekte – Wohnanlagen und Gewerbe.",
        status: "aktiv"
      },
      {
        name: "Staffel XL – ab 5.000 m² (Bestpreis)",
        discountType: "preisstaffel",
        minFlaeche: 5000,
        maxFlaeche: 999999,
        pricePerSqm: "8.75",
        stoererText: "Bestpreis: 8,75 €/m²",
        stoererSubtext: "Unser bester Staffelpreis ab 5.000 m²",
        description: "Bestpreis für Großprojekte ab 5.000 m².",
        status: "aktiv"
      },
      // Frühbucher-Rabatt (gemäß ff-preisrechner Skill – aktualisiert auf Saison 2026/2027)
      {
        name: "Frühbucher 6% – bis 31.12.2025",
        discountType: "fruehbucher",
        percentage: "6.00",
        conditions: "Beauftragung bis 31.12.2025 für Saison 2026",
        validFrom: "2025-09-01",
        validUntil: "2025-12-31",
        stoererText: "6% Frühbucher-Rabatt",
        stoererSubtext: "Bei Beauftragung bis 31.12.2025",
        combinable: true,
        description: "Höchster Frühbucher-Rabatt bei sehr frühzeitiger Beauftragung.",
        status: "aktiv"
      },
      {
        name: "Frühbucher 4,5% – bis 31.01.2026",
        discountType: "fruehbucher",
        percentage: "4.50",
        conditions: "Beauftragung bis 31.01.2026 für Saison 2026",
        validFrom: "2026-01-01",
        validUntil: "2026-01-31",
        stoererText: "4,5% Frühbucher-Rabatt",
        stoererSubtext: "Bei Beauftragung bis 31.01.2026",
        combinable: true,
        description: "Frühbucher-Rabatt bei Beauftragung im Januar.",
        status: "aktiv"
      },
      {
        name: "Frühbucher 3% – bis 28.02.2026",
        discountType: "fruehbucher",
        percentage: "3.00",
        conditions: "Beauftragung bis 28.02.2026 für Saison 2026",
        validFrom: "2026-02-01",
        validUntil: "2026-02-28",
        stoererText: "3% Frühbucher-Rabatt",
        stoererSubtext: "Bei Beauftragung bis 28.02.2026",
        combinable: true,
        description: "Frühbucher-Rabatt bei Beauftragung im Februar.",
        status: "aktiv"
      },
      {
        name: "Frühbucher 1,5% – bis 31.03.2026",
        discountType: "fruehbucher",
        percentage: "1.50",
        conditions: "Beauftragung bis 31.03.2026 für Saison 2026",
        validFrom: "2026-03-01",
        validUntil: "2026-03-31",
        stoererText: "1,5% Frühbucher-Rabatt",
        stoererSubtext: "Bei Beauftragung bis 31.03.2026",
        combinable: true,
        description: "Letzter Frühbucher-Rabatt der Saison.",
        status: "aktiv"
      },
      // Mengenrabatt
      {
        name: "Mengenrabatt – ab 10.000 m²",
        discountType: "mengenrabatt",
        percentage: "5.00",
        conditions: "Gesamtfläche ab 10.000 m² in einem Auftrag",
        stoererText: "5% Mengenrabatt",
        stoererSubtext: "Ab 10.000 m² Gesamtfläche",
        combinable: false,
        description: "Zusätzlicher Mengenrabatt für sehr große Aufträge. Nicht mit Frühbucher kombinierbar.",
        status: "aktiv"
      },
      // Treuerabatt
      {
        name: "Treuerabatt – Bestandskunden",
        discountType: "treuerabatt",
        percentage: "3.00",
        conditions: "Mindestens 1 abgeschlossenes Projekt in den letzten 3 Jahren",
        stoererText: "3% Treuerabatt",
        stoererSubtext: "Für unsere Bestandskunden",
        combinable: true,
        description: "Rabatt für wiederkehrende Kunden als Dankeschön für die Treue.",
        status: "aktiv"
      },
      // Kennenlern-Angebot
      {
        name: "Kennenlern-Angebot – Neukunden",
        discountType: "kennenlern",
        percentage: "2.00",
        conditions: "Erstauftrag, Mindestfläche 1.000 m²",
        stoererText: "2% Kennenlern-Rabatt",
        stoererSubtext: "Für Ihren ersten Auftrag bei uns",
        combinable: true,
        description: "Willkommensrabatt für Neukunden ab 1.000 m².",
        status: "aktiv"
      },
      // Saisonale Aktion
      {
        name: "Frühjahrs-Aktion 2026",
        discountType: "aktion",
        percentage: "8.00",
        conditions: "Beauftragung im März 2026, Durchführung April-Juni 2026",
        validFrom: "2026-03-01",
        validUntil: "2026-03-31",
        stoererText: "🌱 Frühjahrs-Aktion: 8% sparen!",
        stoererSubtext: "Nur im März 2026 – jetzt Termin sichern",
        combinable: false,
        code: "FRUEHLING26",
        description: "Saisonale Aktion für den Frühjahrsstart. Nicht mit anderen Rabatten kombinierbar.",
        status: "aktiv"
      },
    ];

    for (const d of discounts) {
      const cols = ["name", "discountType", "status"];
      const vals = [d.name, d.discountType, d.status];
      
      if (d.percentage) { cols.push("percentage"); vals.push(d.percentage); }
      if (d.minFlaeche) { cols.push("minFlaeche"); vals.push(d.minFlaeche); }
      if (d.maxFlaeche) { cols.push("maxFlaeche"); vals.push(d.maxFlaeche); }
      if (d.pricePerSqm) { cols.push("pricePerSqm"); vals.push(d.pricePerSqm); }
      if (d.conditions) { cols.push("`conditions`"); vals.push(d.conditions); }
      if (d.validFrom) { cols.push("validFrom"); vals.push(d.validFrom); }
      if (d.validUntil) { cols.push("validUntil"); vals.push(d.validUntil); }
      if (d.stoererText) { cols.push("stoererText"); vals.push(d.stoererText); }
      if (d.stoererSubtext) { cols.push("stoererSubtext"); vals.push(d.stoererSubtext); }
      if (d.combinable !== undefined) { cols.push("combinable"); vals.push(d.combinable); }
      if (d.code) { cols.push("code"); vals.push(d.code); }
      if (d.description) { cols.push("description"); vals.push(d.description); }
      
      const placeholders = vals.map(() => "?").join(", ");
      await conn.query(`INSERT INTO libraryDiscounts (${cols.join(", ")}) VALUES (${placeholders})`, vals);
    }
    console.log(`   ✅ ${discounts.length} Preisstaffeln & Rabatte angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 5. LEISTUNGSKATALOG (libraryServices)
    // ═══════════════════════════════════════════════════════════════
    console.log("📋 Leistungskatalog anlegen...");
    
    const services = [
      {
        name: "Fassadenreinigung im Systemverfahren",
        serviceType: "hauptleistung",
        description: "Professionelle Fassadenreinigung mit dem FassadenFix Systemverfahren. Schonende Entfernung von Algen, Moos, Flechten und Verschmutzungen.",
        scope: "Reinigung aller Fassadenflächen inkl. Vor- und Nachbehandlung. Biologisch abbaubare Reinigungsmittel.",
        pricingUnit: "pro m²",
        includedInOffer: true,
        status: "aktiv"
      },
      {
        name: "Imprägnierung / Langzeitschutz",
        serviceType: "hauptleistung",
        description: "Hydrophobe Imprägnierung nach der Reinigung für Langzeitschutz gegen Neubefall.",
        scope: "Auftragen der FassadenFix Protect Imprägnierung auf alle gereinigten Flächen.",
        basePrice: "3.50",
        pricingUnit: "pro m²",
        includedInOffer: true,
        status: "aktiv"
      },
      {
        name: "Graffiti-Entfernung",
        serviceType: "zusatzleistung",
        description: "Professionelle Entfernung von Graffiti mit Spezialreiniger.",
        scope: "Entfernung von Graffiti bis 10 m². Größere Flächen nach Aufwand.",
        basePrice: "45.00",
        pricingUnit: "pro m²",
        includedInOffer: false,
        status: "aktiv"
      },
      {
        name: "Sockelreinigung",
        serviceType: "zusatzleistung",
        description: "Spezialreinigung des Gebäudesockels bei starker Verschmutzung.",
        scope: "Hochdruckreinigung des Sockelbereichs bis 1m Höhe.",
        basePrice: "8.50",
        pricingUnit: "pro lfd.m",
        includedInOffer: false,
        status: "aktiv"
      },
      {
        name: "Dachrinnenreinigung",
        serviceType: "zusatzleistung",
        description: "Reinigung und Kontrolle der Dachrinnen während der Fassadenarbeiten.",
        scope: "Entfernung von Laub und Ablagerungen, Spülung der Fallrohre.",
        basePrice: "5.50",
        pricingUnit: "pro lfd.m",
        includedInOffer: false,
        status: "aktiv"
      },
      {
        name: "Pauschalfestpreisgarantie",
        serviceType: "garantie",
        description: "Die Rechnung wird niemals höher als das Angebot. Garantiert.",
        scope: "Gilt für alle im Angebot aufgeführten Leistungen.",
        duration: "Projektlaufzeit",
        includedInOffer: true,
        status: "aktiv"
      },
      {
        name: "5-Jahres-Garantie auf Reinigungsergebnis",
        serviceType: "garantie",
        description: "Garantie auf das Reinigungsergebnis bei fachgerechter Imprägnierung.",
        scope: "Bei erneutem Befall innerhalb von 5 Jahren: kostenlose Nachreinigung.",
        duration: "5 Jahre",
        includedInOffer: true,
        status: "aktiv"
      },
      {
        name: "Jährliche Inspektion",
        serviceType: "inspektion",
        description: "Jährliche Sichtprüfung der gereinigten Fassaden.",
        scope: "Visuelle Kontrolle auf Neubefall, Dokumentation mit Fotos.",
        basePrice: "199.00",
        pricingUnit: "pauschal",
        includedInOffer: false,
        status: "aktiv"
      },
    ];

    for (const s of services) {
      const cols = ["name", "serviceType", "status"];
      const vals = [s.name, s.serviceType, s.status];
      
      if (s.description) { cols.push("description"); vals.push(s.description); }
      if (s.scope) { cols.push("scope"); vals.push(s.scope); }
      if (s.basePrice) { cols.push("basePrice"); vals.push(s.basePrice); }
      if (s.pricingUnit) { cols.push("pricingUnit"); vals.push(s.pricingUnit); }
      if (s.duration) { cols.push("duration"); vals.push(s.duration); }
      if (s.includedInOffer !== undefined) { cols.push("includedInOffer"); vals.push(s.includedInOffer); }
      
      const placeholders = vals.map(() => "?").join(", ");
      await conn.query(`INSERT INTO libraryServices (${cols.join(", ")}) VALUES (${placeholders})`, vals);
    }
    console.log(`   ✅ ${services.length} Leistungen angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 6. ARBEITSKLEIDUNG & PSA (libraryWorkClothing)
    // ═══════════════════════════════════════════════════════════════
    console.log("👷 Arbeitskleidung & PSA anlegen...");
    
    const clothing = [
      {
        name: "Sicherheitsschuhe S3 – Uvex 1",
        clothingType: "schuhe",
        supplier: "Uvex",
        articleNumber: "FF-PSA-001",
        purchasePrice: "125.00",
        minStock: 5,
        currentStock: 12,
        isPSA: true,
        certificationRequired: true,
        description: "Sicherheitsschuhe S3 mit Stahlkappe und durchtrittsicherer Sohle. Pflicht auf der Baustelle."
      },
      {
        name: "Schutzhelm – Uvex pheos",
        clothingType: "helm",
        supplier: "Uvex",
        articleNumber: "FF-PSA-002",
        purchasePrice: "28.00",
        minStock: 8,
        currentStock: 15,
        isPSA: true,
        certificationRequired: true,
        description: "Industrieschutzhelm EN 397. Pflicht bei Arbeiten mit Hubarbeitsbühnen."
      },
      {
        name: "Schutzbrille – Uvex i-3",
        clothingType: "brille",
        supplier: "Uvex",
        articleNumber: "FF-PSA-003",
        purchasePrice: "18.00",
        minStock: 10,
        currentStock: 25,
        isPSA: true,
        certificationRequired: false,
        description: "Schutzbrille gegen Spritzer und Partikel. Pflicht beim Hochdruckreinigen."
      },
      {
        name: "Chemikalienschutzhandschuhe",
        clothingType: "handschuhe",
        supplier: "Ansell",
        articleNumber: "FF-PSA-004",
        purchasePrice: "8.50",
        minStock: 20,
        currentStock: 50,
        isPSA: true,
        certificationRequired: false,
        description: "Nitril-Handschuhe für den Umgang mit Reinigungsmitteln."
      },
      {
        name: "Warnweste Klasse 2",
        clothingType: "weste",
        supplier: "Portwest",
        articleNumber: "FF-PSA-005",
        purchasePrice: "12.00",
        minStock: 10,
        currentStock: 20,
        isPSA: true,
        certificationRequired: false,
        description: "Warnweste EN ISO 20471 Klasse 2. Pflicht im Straßenbereich."
      },
      {
        name: "FassadenFix Arbeitshose – Engelbert Strauss",
        clothingType: "hose",
        supplier: "Engelbert Strauss",
        articleNumber: "FF-AK-001",
        purchasePrice: "65.00",
        minStock: 5,
        currentStock: 10,
        isPSA: false,
        certificationRequired: false,
        description: "Robuste Arbeitshose mit FassadenFix Logo. Wasserabweisend."
      },
      {
        name: "FassadenFix Polo-Shirt",
        clothingType: "oberteil",
        supplier: "Engelbert Strauss",
        articleNumber: "FF-AK-002",
        purchasePrice: "35.00",
        minStock: 10,
        currentStock: 20,
        isPSA: false,
        certificationRequired: false,
        description: "Polo-Shirt mit FassadenFix Logo. Für Kundenkontakt und Baustelle."
      },
      {
        name: "Regenanzug – Helly Hansen",
        clothingType: "regenkleidung",
        supplier: "Helly Hansen",
        articleNumber: "FF-AK-003",
        purchasePrice: "89.00",
        minStock: 5,
        currentStock: 8,
        isPSA: false,
        certificationRequired: false,
        description: "Wasserdichter Regenanzug für Arbeiten bei Nässe."
      },
      {
        name: "Gehörschutz – 3M Peltor",
        clothingType: "gehoerschutz",
        supplier: "3M",
        articleNumber: "FF-PSA-006",
        purchasePrice: "32.00",
        minStock: 5,
        currentStock: 10,
        isPSA: true,
        certificationRequired: false,
        description: "Kapselgehörschutz für Arbeiten mit Hochdruckreiniger."
      },
    ];

    for (const c of clothing) {
      await conn.query(
        `INSERT INTO libraryWorkClothing (name, clothingType, supplier, articleNumber, purchasePrice, minStock, currentStock, isPSA, certificationRequired, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktiv')`,
        [c.name, c.clothingType, c.supplier, c.articleNumber, c.purchasePrice, c.minStock, c.currentStock, c.isPSA, c.certificationRequired, c.description]
      );
    }
    console.log(`   ✅ ${clothing.length} Arbeitskleidung/PSA angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // 7. ARBEITSMITTEL (libraryAssets)
    // ═══════════════════════════════════════════════════════════════
    console.log("🔧 Arbeitsmittel anlegen...");
    
    const assets = [
      {
        name: "Laptop Dell Latitude 5540",
        assetType: "laptop",
        manufacturer: "Dell",
        model: "Latitude 5540",
        purchasePrice: "1250.00",
        description: "Büro-Laptop für Projektleitung und Verwaltung."
      },
      {
        name: "Smartphone Samsung Galaxy A54",
        assetType: "smartphone",
        manufacturer: "Samsung",
        model: "Galaxy A54 5G",
        purchasePrice: "380.00",
        description: "Diensthandy für Bauleiter und Kundenberater. Mit FaFi PM App."
      },
      {
        name: "Tablet Samsung Galaxy Tab S9",
        assetType: "tablet",
        manufacturer: "Samsung",
        model: "Galaxy Tab S9 FE",
        purchasePrice: "450.00",
        description: "Für Objektaufnahme vor Ort. Kamera + FaFi PM App."
      },
      {
        name: "Tankkarte Shell – Waschbus 1",
        assetType: "tankkarte",
        cardNumber: "****-****-****-1101",
        description: "Shell Tankkarte für HAL-FF 101. Monatslimit 500€."
      },
      {
        name: "Tankkarte Shell – Waschbus 2",
        assetType: "tankkarte",
        cardNumber: "****-****-****-1102",
        description: "Shell Tankkarte für HAL-FF 102. Monatslimit 500€."
      },
      {
        name: "Büroschlüssel-Set Hauptsitz",
        assetType: "schluessel",
        description: "Schlüssel für Büro Halle (Saale): Eingangstür, Büro, Lager."
      },
      {
        name: "Multifunktionswerkzeug Leatherman Wave+",
        assetType: "werkzeug",
        manufacturer: "Leatherman",
        model: "Wave+",
        purchasePrice: "120.00",
        description: "Für schnelle Reparaturen und Anpassungen auf der Baustelle."
      },
      {
        name: "Laserentfernungsmesser Bosch GLM 50",
        assetType: "werkzeug",
        manufacturer: "Bosch",
        model: "GLM 50 C Professional",
        purchasePrice: "145.00",
        description: "Für Aufmaß bei Objektaufnahmen. Bluetooth-Übertragung an Tablet."
      },
    ];

    for (const a of assets) {
      const cols = ["name", "assetType", "status"];
      const vals = [a.name, a.assetType, "aktiv"];
      
      if (a.manufacturer) { cols.push("manufacturer"); vals.push(a.manufacturer); }
      if (a.model) { cols.push("model"); vals.push(a.model); }
      if (a.purchasePrice) { cols.push("purchasePrice"); vals.push(a.purchasePrice); }
      if (a.cardNumber) { cols.push("cardNumber"); vals.push(a.cardNumber); }
      if (a.description) { cols.push("description"); vals.push(a.description); }
      
      const placeholders = vals.map(() => "?").join(", ");
      await conn.query(`INSERT INTO libraryAssets (${cols.join(", ")}) VALUES (${placeholders})`, vals);
    }
    console.log(`   ✅ ${assets.length} Arbeitsmittel angelegt`);

    // ═══════════════════════════════════════════════════════════════
    // ZUSAMMENFASSUNG
    // ═══════════════════════════════════════════════════════════════
    const totalRecords = vehicles.length + equipment.length + cleaningAgents.length + discounts.length + services.length + clothing.length + assets.length;
    console.log(`\n🎉 Fertig! ${totalRecords} Datensätze in 7 Tabellen angelegt.`);
    console.log(`   🚐 ${vehicles.length} Fahrzeuge`);
    console.log(`   🏗️  ${equipment.length} Geräte`);
    console.log(`   🧴 ${cleaningAgents.length} Reinigungsmittel`);
    console.log(`   💰 ${discounts.length} Preisstaffeln & Rabatte`);
    console.log(`   📋 ${services.length} Leistungen`);
    console.log(`   👷 ${clothing.length} Arbeitskleidung/PSA`);
    console.log(`   🔧 ${assets.length} Arbeitsmittel`);

  } finally {
    conn.release();
    await pool.end();
  }
}

clearAndSeed().catch(err => {
  console.error("Fehler:", err);
  process.exit(1);
});
