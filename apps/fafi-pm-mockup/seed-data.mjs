/**
 * FaFi PM - Seed-Skript für realistische Testdaten
 * 
 * Erstellt vollständig verknüpfte Daten:
 * - Projekte in verschiedenen Phasen (erweitert bestehende)
 * - Angebote zu jedem Projekt
 * - Aufträge (nutzt bestehende + neue)
 * - Baustellen mit Logbuch
 * - Rechnungen mit Positionen
 * - Garantien
 * - Dokumente im Archiv
 * - Aufgaben mit verschiedenen Status
 * - Aktivitätslog
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL nicht gesetzt!");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// Helper
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);
const daysFromNow = (d) => new Date(now.getTime() + d * 86400000);
const fmt = (d) => d.toISOString().slice(0, 19).replace("T", " ");

console.log("🌱 Starte Seed-Daten-Erstellung...\n");

// ============================================
// 1. PROJEKTE ERWEITERN (Phasen aktualisieren)
// ============================================
console.log("📁 Projekte aktualisieren...");

// Projekt 1: Sonnenhof → durchfuehrung (hat bereits Aufträge)
await conn.execute(
  `UPDATE projects SET phase = 'durchfuehrung', progress = 65, startDate = ?, endDate = ?, kundenberaterId = 1, projektleiterId = 1, totalArea = 8500 WHERE id = 1`,
  [fmt(daysAgo(45)), fmt(daysFromNow(30))]
);

// Projekt 2: Bergstraße → angebot_versendet
await conn.execute(
  `UPDATE projects SET phase = 'angebot_versendet', progress = 0, kundenberaterId = 1, totalArea = 2100 WHERE id = 2`
);

// Projekt 3: Beispielweg → abgeschlossen (hat Auftrag A-2026-003)
await conn.execute(
  `UPDATE projects SET phase = 'abgeschlossen', progress = 100, startDate = ?, endDate = ?, kundenberaterId = 1, projektleiterId = 1, totalArea = 4200 WHERE id = 3`,
  [fmt(daysAgo(120)), fmt(daysAgo(15))]
);

// Projekt 4: Gewerbepark → planung
await conn.execute(
  `UPDATE projects SET phase = 'planung', progress = 0, startDate = ?, endDate = ?, kundenberaterId = 1, projektleiterId = 1, totalArea = 12000 WHERE id = 4`,
  [fmt(daysFromNow(30)), fmt(daysFromNow(120))]
);

// Neue Projekte
const newProjects = [
  {
    projectNumber: "2026-SWK-001",
    name: "Seniorenresidenz Am Park",
    companyId: 30001,
    contactId: 30001,
    phase: "abnahme",
    totalArea: 3200,
    progress: 95,
    startDate: fmt(daysAgo(90)),
    endDate: fmt(daysAgo(5)),
  },
  {
    projectNumber: "2026-STW-001",
    name: "Studentenwohnheim Campus",
    companyId: 30002,
    contactId: 30002,
    phase: "vorbereitung",
    totalArea: 6800,
    progress: 0,
    startDate: fmt(daysFromNow(14)),
    endDate: fmt(daysFromNow(90)),
  },
  {
    projectNumber: "2026-BWG-001",
    name: "Bürokomplex Westend",
    companyId: 30003,
    contactId: 30003,
    phase: "nachfassen",
    totalArea: 4500,
    progress: 0,
    startDate: null,
    endDate: null,
  },
  {
    projectNumber: "2026-KWG-001",
    name: "Kindergarten Waldweg",
    companyId: 30004,
    contactId: 30004,
    phase: "objektaufnahme",
    totalArea: 800,
    progress: 0,
    startDate: null,
    endDate: null,
  },
];

for (const p of newProjects) {
  try {
    await conn.execute(
      `INSERT INTO projects (projectNumber, name, companyId, contactId, phase, totalArea, progress, startDate, endDate, kundenberaterId, projektleiterId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [p.projectNumber, p.name, p.companyId, p.contactId, p.phase, p.totalArea, p.progress, p.startDate, p.endDate]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log(`  ⏭ Projekt ${p.projectNumber} existiert bereits`);
    else throw e;
  }
}

// Hole alle Projekt-IDs
const [allProjects] = await conn.execute("SELECT id, projectNumber, name, companyId, contactId, phase FROM projects ORDER BY id");
console.log(`  ✅ ${allProjects.length} Projekte vorhanden\n`);

// ============================================
// 2. ANGEBOTE ERSTELLEN
// ============================================
console.log("📋 Angebote erstellen...");

const offersData = [
  // Projekt 1: Sonnenhof - angenommenes Angebot
  {
    offerNumber: "FF-2026-0001",
    projectId: 1, companyId: 1, contactId: 1,
    status: "angenommen",
    totalArea: 8500, pricePerSqm: 4.50, basePrice: 38250, discount: 5, discountReason: "Großauftrag",
    travelCosts: 1200, netTotal: 37537.50, vatRate: 19, vatAmount: 7132.13, grossTotal: 44669.63,
    scaffoldingDays: 12, overnightStays: 10, distanceKm: 180,
    validUntil: fmt(daysAgo(30)), sentAt: fmt(daysAgo(60)), acceptedAt: fmt(daysAgo(50)),
    positions: JSON.stringify([
      { propertyId: 1, propertyName: "Sonnenhof Haus 1", sides: [{ name: "Vorderseite", area: 450, pricePerSqm: 4.50, total: 2025 }, { name: "Rückseite", area: 380, pricePerSqm: 4.50, total: 1710 }], subtotal: 3735 },
      { propertyId: 2, propertyName: "Sonnenhof Haus 2", sides: [{ name: "Vorderseite", area: 450, pricePerSqm: 4.50, total: 2025 }, { name: "Rückseite", area: 380, pricePerSqm: 4.50, total: 1710 }], subtotal: 3735 },
      { propertyId: 3, propertyName: "Sonnenhof Haus 3", sides: [{ name: "Vorderseite", area: 500, pricePerSqm: 4.50, total: 2250 }, { name: "Rückseite", area: 420, pricePerSqm: 4.50, total: 1890 }], subtotal: 4140 },
    ]),
  },
  // Projekt 2: Bergstraße - versendetes Angebot
  {
    offerNumber: "FF-2026-0002",
    projectId: 2, companyId: 1, contactId: 2,
    status: "versendet",
    totalArea: 2100, pricePerSqm: 5.20, basePrice: 10920, discount: 0, discountReason: null,
    travelCosts: 450, netTotal: 11370, vatRate: 19, vatAmount: 2160.30, grossTotal: 13530.30,
    scaffoldingDays: 4, overnightStays: 3, distanceKm: 95,
    validUntil: fmt(daysFromNow(21)), sentAt: fmt(daysAgo(7)), acceptedAt: null,
    positions: JSON.stringify([
      { propertyId: 4, propertyName: "Bergstraße 15", sides: [{ name: "Vorderseite", area: 620, pricePerSqm: 5.20, total: 3224 }, { name: "Rückseite", area: 580, pricePerSqm: 5.20, total: 3016 }, { name: "Linker Giebel", area: 450, pricePerSqm: 5.20, total: 2340 }, { name: "Rechter Giebel", area: 450, pricePerSqm: 5.20, total: 2340 }], subtotal: 10920 },
    ]),
  },
  // Projekt 3: Beispielweg - angenommenes Angebot
  {
    offerNumber: "FF-2026-0003",
    projectId: 3, companyId: 2, contactId: 3,
    status: "angenommen",
    totalArea: 4200, pricePerSqm: 4.80, basePrice: 20160, discount: 10, discountReason: "Bestandskunde",
    travelCosts: 800, netTotal: 18944, vatRate: 19, vatAmount: 3599.36, grossTotal: 22543.36,
    scaffoldingDays: 6, overnightStays: 5, distanceKm: 140,
    validUntil: fmt(daysAgo(90)), sentAt: fmt(daysAgo(130)), acceptedAt: fmt(daysAgo(120)),
    positions: JSON.stringify([
      { propertyId: 5, propertyName: "Beispielweg 10", sides: [{ name: "Vorderseite", area: 1100, pricePerSqm: 4.80, total: 5280 }, { name: "Rückseite", area: 1000, pricePerSqm: 4.80, total: 4800 }], subtotal: 10080 },
      { propertyId: 6, propertyName: "Beispielweg 20", sides: [{ name: "Vorderseite", area: 1100, pricePerSqm: 4.80, total: 5280 }, { name: "Rückseite", area: 1000, pricePerSqm: 4.80, total: 4800 }], subtotal: 10080 },
    ]),
  },
  // Projekt 4: Gewerbepark - Entwurf
  {
    offerNumber: "FF-2026-0004",
    projectId: 4, companyId: 3, contactId: 4,
    status: "erstellt",
    totalArea: 12000, pricePerSqm: 3.80, basePrice: 45600, discount: 8, discountReason: "Großfläche",
    travelCosts: 2200, netTotal: 44152, vatRate: 19, vatAmount: 8388.88, grossTotal: 52540.88,
    scaffoldingDays: 18, overnightStays: 15, distanceKm: 250,
    validUntil: fmt(daysFromNow(30)), sentAt: null, acceptedAt: null,
    positions: JSON.stringify([]),
  },
  // Projekt 5: Seniorenresidenz - angenommen
  {
    offerNumber: "FF-2026-0005",
    projectId: null, companyId: 30001, contactId: 30001,
    status: "angenommen",
    totalArea: 3200, pricePerSqm: 5.50, basePrice: 17600, discount: 0, discountReason: null,
    travelCosts: 600, netTotal: 18200, vatRate: 19, vatAmount: 3458, grossTotal: 21658,
    scaffoldingDays: 5, overnightStays: 4, distanceKm: 120,
    validUntil: fmt(daysAgo(60)), sentAt: fmt(daysAgo(100)), acceptedAt: fmt(daysAgo(90)),
    positions: JSON.stringify([]),
  },
  // Projekt 7: Bürokomplex - versendet (Nachfassen)
  {
    offerNumber: "FF-2026-0006",
    projectId: null, companyId: 30003, contactId: 30003,
    status: "versendet",
    totalArea: 4500, pricePerSqm: 4.90, basePrice: 22050, discount: 5, discountReason: "Erstauftrag",
    travelCosts: 900, netTotal: 21847.50, vatRate: 19, vatAmount: 4151.03, grossTotal: 25998.53,
    scaffoldingDays: 7, overnightStays: 6, distanceKm: 160,
    validUntil: fmt(daysFromNow(14)), sentAt: fmt(daysAgo(14)), acceptedAt: null,
    positions: JSON.stringify([]),
  },
  // Abgelehntes Angebot
  {
    offerNumber: "FF-2025-0099",
    projectId: null, companyId: 30005, contactId: 30005,
    status: "abgelehnt",
    totalArea: 1500, pricePerSqm: 6.00, basePrice: 9000, discount: 0, discountReason: null,
    travelCosts: 300, netTotal: 9300, vatRate: 19, vatAmount: 1767, grossTotal: 11067,
    scaffoldingDays: 3, overnightStays: 2, distanceKm: 80,
    validUntil: fmt(daysAgo(30)), sentAt: fmt(daysAgo(45)), acceptedAt: null,
    positions: JSON.stringify([]),
  },
];

for (const o of offersData) {
  try {
    await conn.execute(
      `INSERT INTO offers (offerNumber, version, projectId, companyId, contactId, status, totalArea, pricePerSqm, basePrice, discount, discountReason, travelCosts, netTotal, vatRate, vatAmount, grossTotal, scaffoldingDays, overnightStays, distanceKm, positions, validUntil, sentAt, acceptedAt, createdById)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [o.offerNumber, o.projectId, o.companyId, o.contactId, o.status, o.totalArea, o.pricePerSqm, o.basePrice, o.discount, o.discountReason, o.travelCosts, o.netTotal, o.vatRate, o.vatAmount, o.grossTotal, o.scaffoldingDays, o.overnightStays, o.distanceKm, o.positions, o.validUntil, o.sentAt, o.acceptedAt]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log(`  ⏭ Angebot ${o.offerNumber} existiert bereits`);
    else throw e;
  }
}

// Verknüpfe Angebote mit Projekten wo projectId null war
const [allOffers] = await conn.execute("SELECT id, offerNumber, projectId, companyId FROM offers ORDER BY id");
// Verknüpfe Angebot 5 mit Projekt 5 (Seniorenresidenz)
const offer5 = allOffers.find(o => o.offerNumber === "FF-2026-0005");
const project5 = allProjects.find(p => p.projectNumber === "2026-SWK-001");
if (offer5 && project5) {
  await conn.execute("UPDATE offers SET projectId = ? WHERE id = ?", [project5.id, offer5.id]);
}
// Verknüpfe Angebot 6 mit Projekt 7 (Bürokomplex)
const offer6 = allOffers.find(o => o.offerNumber === "FF-2026-0006");
const project7 = allProjects.find(p => p.projectNumber === "2026-BWG-001");
if (offer6 && project7) {
  await conn.execute("UPDATE offers SET projectId = ? WHERE id = ?", [project7.id, offer6.id]);
}

const [updatedOffers] = await conn.execute("SELECT id, offerNumber, projectId FROM offers ORDER BY id");
console.log(`  ✅ ${updatedOffers.length} Angebote vorhanden\n`);

// ============================================
// 3. AUFTRÄGE VERKNÜPFEN & NEUE ERSTELLEN
// ============================================
console.log("📝 Aufträge verknüpfen...");

// Bestehende Aufträge mit Angeboten verknüpfen
const offer1 = updatedOffers.find(o => o.offerNumber === "FF-2026-0001");
const offer3 = updatedOffers.find(o => o.offerNumber === "FF-2026-0003");
if (offer1) await conn.execute("UPDATE orders SET offerId = ? WHERE orderNumber = 'A-2026-001'", [offer1.id]);
if (offer3) await conn.execute("UPDATE orders SET offerId = ? WHERE orderNumber = 'A-2026-003'", [offer3.id]);

// Neuer Auftrag für Seniorenresidenz (Projekt 5)
if (project5 && offer5) {
  try {
    await conn.execute(
      `INSERT INTO orders (orderNumber, projectId, offerId, companyId, contactId, status, netTotal, vatAmount, grossTotal, orderDate, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, kundenberaterId, projektleiterId)
       VALUES (?, ?, ?, ?, ?, 'abgeschlossen', 18200, 3458, 21658, ?, ?, ?, ?, ?, 1, 1)`,
      ["A-2026-006", project5.id, offer5.id, 30001, 30001, fmt(daysAgo(90)), fmt(daysAgo(85)), fmt(daysAgo(10)), fmt(daysAgo(85)), fmt(daysAgo(5))]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log("  ⏭ Auftrag A-2026-006 existiert bereits");
    else throw e;
  }
}

// Neuer Auftrag für Studentenwohnheim (Projekt 6)
const project6 = allProjects.find(p => p.projectNumber === "2026-STW-001");
if (project6) {
  try {
    await conn.execute(
      `INSERT INTO orders (orderNumber, projectId, companyId, contactId, status, netTotal, vatAmount, grossTotal, orderDate, plannedStartDate, plannedEndDate, kundenberaterId, projektleiterId)
       VALUES (?, ?, ?, ?, 'in_vorbereitung', 32500, 6175, 38675, ?, ?, ?, 1, 1)`,
      ["A-2026-007", project6.id, 30002, 30002, fmt(daysAgo(7)), fmt(daysFromNow(14)), fmt(daysFromNow(90))]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log("  ⏭ Auftrag A-2026-007 existiert bereits");
    else throw e;
  }
}

const [allOrders] = await conn.execute("SELECT id, orderNumber, projectId, offerId, status FROM orders ORDER BY id");
console.log(`  ✅ ${allOrders.length} Aufträge vorhanden\n`);

// ============================================
// 4. BAUSTELLEN ERSTELLEN
// ============================================
console.log("🏗️ Baustellen erstellen...");

const constructionSitesData = [
  {
    siteNumber: "B-2026-001",
    projectId: 1, name: "Baustelle Sonnenhof",
    address: "Sonnenhofweg 1-12, 12345 Musterstadt",
    status: "aktiv", startDate: fmt(daysAgo(45)), endDate: fmt(daysFromNow(30)),
    progress: 65, totalArea: 8500,
    teamMembers: JSON.stringify([1]),
    equipment: JSON.stringify(["Hubsteiger 18m", "Hochdruckreiniger 250bar", "Sprühgerät"]),
    weatherData: JSON.stringify({ temp: 8, condition: "wolkig", wind: 12, precipitation: 0, humidity: 65, updatedAt: now.toISOString() }),
  },
  {
    siteNumber: "B-2026-002",
    projectId: 3, name: "Baustelle Beispielweg",
    address: "Beispielweg 10-20, 54321 Beispielstadt",
    status: "abgeschlossen", startDate: fmt(daysAgo(120)), endDate: fmt(daysAgo(15)),
    progress: 100, totalArea: 4200,
    teamMembers: JSON.stringify([1]),
    equipment: JSON.stringify(["Hubsteiger 24m", "Hochdruckreiniger 350bar"]),
    weatherData: JSON.stringify({ temp: 5, condition: "sonnig", wind: 8, precipitation: 0, humidity: 55, updatedAt: now.toISOString() }),
  },
  {
    siteNumber: "B-2026-003",
    projectId: 4, name: "Baustelle Gewerbepark Ost",
    address: "Industriestraße 10-20, 04103 Leipzig",
    status: "geplant", startDate: fmt(daysFromNow(30)), endDate: fmt(daysFromNow(120)),
    progress: 0, totalArea: 12000,
    teamMembers: JSON.stringify([]),
    equipment: JSON.stringify([]),
    weatherData: JSON.stringify({ temp: 6, condition: "regnerisch", wind: 18, precipitation: 5, humidity: 80, updatedAt: now.toISOString() }),
  },
];

if (project5) {
  constructionSitesData.push({
    siteNumber: "B-2026-004",
    projectId: project5.id, name: "Baustelle Seniorenresidenz",
    address: "Parkstraße 15, 10115 Berlin",
    status: "abgeschlossen", startDate: fmt(daysAgo(85)), endDate: fmt(daysAgo(5)),
    progress: 100, totalArea: 3200,
    teamMembers: JSON.stringify([1]),
    equipment: JSON.stringify(["Hubsteiger 18m", "Hochdruckreiniger 250bar"]),
    weatherData: JSON.stringify({ temp: 10, condition: "sonnig", wind: 5, precipitation: 0, humidity: 50, updatedAt: now.toISOString() }),
  });
}

if (project6) {
  constructionSitesData.push({
    siteNumber: "B-2026-005",
    projectId: project6.id, name: "Baustelle Studentenwohnheim",
    address: "Campusstraße 5-8, 10115 Berlin",
    status: "geplant", startDate: fmt(daysFromNow(14)), endDate: fmt(daysFromNow(90)),
    progress: 0, totalArea: 6800,
    teamMembers: JSON.stringify([]),
    equipment: JSON.stringify([]),
    weatherData: JSON.stringify({ temp: 4, condition: "bewölkt", wind: 15, precipitation: 2, humidity: 70, updatedAt: now.toISOString() }),
  });
}

for (const cs of constructionSitesData) {
  try {
    await conn.execute(
      `INSERT INTO constructionSites (siteNumber, projectId, name, address, status, startDate, endDate, progress, totalArea, projektleiterId, teamMembers, equipment, weatherData)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [cs.siteNumber, cs.projectId, cs.name, cs.address, cs.status, cs.startDate, cs.endDate, cs.progress, cs.totalArea, cs.teamMembers, cs.equipment, cs.weatherData]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log(`  ⏭ Baustelle ${cs.siteNumber} existiert bereits`);
    else throw e;
  }
}

const [allCS] = await conn.execute("SELECT id, siteNumber, projectId FROM constructionSites ORDER BY id");
console.log(`  ✅ ${allCS.length} Baustellen vorhanden\n`);

// Verknüpfe Properties mit Baustellen
const cs1 = allCS.find(c => c.siteNumber === "B-2026-001");
const cs2 = allCS.find(c => c.siteNumber === "B-2026-002");
if (cs1) {
  await conn.execute("UPDATE properties SET constructionSiteId = ? WHERE projectId = 1", [cs1.id]);
}
if (cs2) {
  await conn.execute("UPDATE properties SET constructionSiteId = ? WHERE projectId = 3", [cs2.id]);
}

// ============================================
// 5. RECHNUNGEN ERSTELLEN
// ============================================
console.log("💰 Rechnungen erstellen...");

const order3 = allOrders.find(o => o.orderNumber === "A-2026-003");
const order1 = allOrders.find(o => o.orderNumber === "A-2026-001");
const order6 = allOrders.find(o => o.orderNumber === "A-2026-006");

const invoicesData = [
  // Schlussrechnung für Projekt 3 (abgeschlossen)
  {
    invoiceNumber: "R-2026-001",
    orderId: order3?.id, projectId: 3, companyId: 2, contactId: 3,
    invoiceType: "schlussrechnung", status: "bezahlt",
    netTotal: 8900, vatRate: 19, vatAmount: 1691, grossTotal: 10591, paidAmount: 10591, openAmount: 0,
    positions: JSON.stringify([
      { position: 1, description: "Fassadenreinigung Beispielweg 10 - Vorderseite", quantity: 1100, unit: "m²", unitPrice: 4.80, total: 5280 },
      { position: 2, description: "Fassadenreinigung Beispielweg 10 - Rückseite", quantity: 1000, unit: "m²", unitPrice: 4.80, total: 4800 },
      { position: 3, description: "Reisekosten", quantity: 1, unit: "pauschal", unitPrice: 800, total: 800 },
      { position: 4, description: "Rabatt Bestandskunde (10%)", quantity: 1, unit: "pauschal", unitPrice: -1980, total: -1980 },
    ]),
    invoiceDate: fmt(daysAgo(14)), dueDate: fmt(daysAgo(0)), sentAt: fmt(daysAgo(14)), paidAt: fmt(daysAgo(3)),
    dunningLevel: 0,
  },
  // Abschlagsrechnung für Projekt 1 (in Durchführung)
  {
    invoiceNumber: "R-2026-002",
    orderId: order1?.id, projectId: 1, companyId: 1, contactId: 1,
    invoiceType: "abschlagsrechnung", status: "versendet",
    netTotal: 22500, vatRate: 19, vatAmount: 4275, grossTotal: 26775, paidAmount: 0, openAmount: 26775,
    positions: JSON.stringify([
      { position: 1, description: "1. Abschlag - Fassadenreinigung Sonnenhof (50%)", quantity: 1, unit: "pauschal", unitPrice: 22500, total: 22500 },
    ]),
    invoiceDate: fmt(daysAgo(7)), dueDate: fmt(daysFromNow(23)), sentAt: fmt(daysAgo(7)), paidAt: null,
    dunningLevel: 0,
  },
  // Schlussrechnung für Seniorenresidenz (Projekt 5)
  {
    invoiceNumber: "R-2026-003",
    orderId: order6?.id, projectId: project5?.id, companyId: 30001, contactId: 30001,
    invoiceType: "schlussrechnung", status: "ueberfaellig",
    netTotal: 18200, vatRate: 19, vatAmount: 3458, grossTotal: 21658, paidAmount: 0, openAmount: 21658,
    positions: JSON.stringify([
      { position: 1, description: "Fassadenreinigung Seniorenresidenz Am Park", quantity: 3200, unit: "m²", unitPrice: 5.50, total: 17600 },
      { position: 2, description: "Reisekosten", quantity: 1, unit: "pauschal", unitPrice: 600, total: 600 },
    ]),
    invoiceDate: fmt(daysAgo(35)), dueDate: fmt(daysAgo(5)), sentAt: fmt(daysAgo(35)), paidAt: null,
    dunningLevel: 1,
  },
  // Entwurf-Rechnung
  {
    invoiceNumber: "R-2026-004",
    orderId: order1?.id, projectId: 1, companyId: 1, contactId: 1,
    invoiceType: "schlussrechnung", status: "entwurf",
    netTotal: 45000, vatRate: 19, vatAmount: 8550, grossTotal: 53550, paidAmount: 0, openAmount: 53550,
    positions: JSON.stringify([
      { position: 1, description: "Schlussrechnung Fassadenreinigung Sonnenhof (gesamt)", quantity: 8500, unit: "m²", unitPrice: 4.50, total: 38250 },
      { position: 2, description: "Reisekosten", quantity: 1, unit: "pauschal", unitPrice: 1200, total: 1200 },
      { position: 3, description: "Abzug 1. Abschlag", quantity: 1, unit: "pauschal", unitPrice: -22500, total: -22500 },
      { position: 4, description: "Rabatt Großauftrag (5%)", quantity: 1, unit: "pauschal", unitPrice: -1912.50, total: -1912.50 },
    ]),
    invoiceDate: fmt(now), dueDate: null, sentAt: null, paidAt: null,
    dunningLevel: 0,
  },
];

for (const inv of invoicesData) {
  try {
    await conn.execute(
      `INSERT INTO invoices (invoiceNumber, orderId, projectId, companyId, contactId, invoiceType, status, netTotal, vatRate, vatAmount, grossTotal, paidAmount, openAmount, positions, invoiceDate, dueDate, sentAt, paidAt, dunningLevel, createdById)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [inv.invoiceNumber, inv.orderId, inv.projectId, inv.companyId, inv.contactId, inv.invoiceType, inv.status, inv.netTotal, inv.vatRate, inv.vatAmount, inv.grossTotal, inv.paidAmount, inv.openAmount, inv.positions, inv.invoiceDate, inv.dueDate, inv.sentAt, inv.paidAt, inv.dunningLevel]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log(`  ⏭ Rechnung ${inv.invoiceNumber} existiert bereits`);
    else throw e;
  }
}

const [allInvoices] = await conn.execute("SELECT id, invoiceNumber, orderId, projectId FROM invoices ORDER BY id");
console.log(`  ✅ ${allInvoices.length} Rechnungen vorhanden\n`);

// ============================================
// 6. GARANTIEN ERSTELLEN
// ============================================
console.log("🛡️ Garantien erstellen...");

const warrantiesData = [
  // Garantie für Projekt 3 (abgeschlossen)
  {
    warrantyNumber: "G-2026-001",
    orderId: order3?.id, projectId: 3, companyId: 2, propertyId: 5,
    warrantyType: "algenfrei_garantie", status: "aktiv",
    startDate: fmt(daysAgo(14)), endDate: fmt(new Date(now.getFullYear() + 5, now.getMonth(), now.getDate())),
    durationYears: 5, notes: "5 Jahre Algenfrei-Garantie nach erfolgreicher Abnahme",
  },
  {
    warrantyNumber: "G-2026-002",
    orderId: order3?.id, projectId: 3, companyId: 2, propertyId: 6,
    warrantyType: "algenfrei_garantie", status: "aktiv",
    startDate: fmt(daysAgo(14)), endDate: fmt(new Date(now.getFullYear() + 5, now.getMonth(), now.getDate())),
    durationYears: 5, notes: "5 Jahre Algenfrei-Garantie nach erfolgreicher Abnahme",
  },
  // Garantie für Seniorenresidenz (Projekt 5)
  {
    warrantyNumber: "G-2026-003",
    orderId: order6?.id, projectId: project5?.id, companyId: 30001, propertyId: null,
    warrantyType: "ergebnisgarantie", status: "aktiv",
    startDate: fmt(daysAgo(5)), endDate: fmt(new Date(now.getFullYear() + 3, now.getMonth(), now.getDate())),
    durationYears: 3, notes: "3 Jahre Ergebnisgarantie",
  },
];

for (const w of warrantiesData) {
  try {
    await conn.execute(
      `INSERT INTO warranties (warrantyNumber, orderId, projectId, companyId, propertyId, warrantyType, status, startDate, endDate, durationYears, notes, createdById)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [w.warrantyNumber, w.orderId, w.projectId, w.companyId, w.propertyId, w.warrantyType, w.status, w.startDate, w.endDate, w.durationYears, w.notes]
    );
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") console.log(`  ⏭ Garantie ${w.warrantyNumber} existiert bereits`);
    else throw e;
  }
}

const [allWarranties] = await conn.execute("SELECT id, warrantyNumber, orderId, projectId FROM warranties ORDER BY id");
console.log(`  ✅ ${allWarranties.length} Garantien vorhanden\n`);

// ============================================
// 7. DOKUMENTE IM ARCHIV
// ============================================
console.log("📄 Dokumente im Archiv erstellen...");

const inv1 = allInvoices.find(i => i.invoiceNumber === "R-2026-001");
const inv2 = allInvoices.find(i => i.invoiceNumber === "R-2026-002");
const inv3 = allInvoices.find(i => i.invoiceNumber === "R-2026-003");
const war1 = allWarranties.find(w => w.warrantyNumber === "G-2026-001");
const war2 = allWarranties.find(w => w.warrantyNumber === "G-2026-002");
const war3 = allWarranties.find(w => w.warrantyNumber === "G-2026-003");

const documentsData = [
  // Angebote als PDFs
  { name: "Angebot FF-2026-0001 Sonnenhof.pdf", originalName: "Angebot_FF-2026-0001.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 245000, category: "angebot", projectId: 1, offerId: offer1?.id, companyId: 1 },
  { name: "Angebot FF-2026-0002 Bergstraße.pdf", originalName: "Angebot_FF-2026-0002.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 198000, category: "angebot", projectId: 2, offerId: updatedOffers.find(o => o.offerNumber === "FF-2026-0002")?.id, companyId: 1 },
  { name: "Angebot FF-2026-0003 Beispielweg.pdf", originalName: "Angebot_FF-2026-0003.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 220000, category: "angebot", projectId: 3, offerId: offer3?.id, companyId: 2 },
  
  // Auftragsbestätigungen
  { name: "Auftragsbestätigung A-2026-001.pdf", originalName: "AB_A-2026-001.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 180000, category: "auftragsbestaetigung", projectId: 1, orderId: order1?.id, companyId: 1 },
  { name: "Auftragsbestätigung A-2026-003.pdf", originalName: "AB_A-2026-003.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 175000, category: "auftragsbestaetigung", projectId: 3, orderId: order3?.id, companyId: 2 },
  { name: "Auftragsbestätigung A-2026-006.pdf", originalName: "AB_A-2026-006.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 165000, category: "auftragsbestaetigung", projectId: project5?.id, orderId: order6?.id, companyId: 30001 },
  
  // Rechnungen
  { name: "Rechnung R-2026-001.pdf", originalName: "RE_R-2026-001.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 210000, category: "rechnung", projectId: 3, orderId: order3?.id, invoiceId: inv1?.id, companyId: 2 },
  { name: "Rechnung R-2026-002.pdf", originalName: "RE_R-2026-002.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 195000, category: "rechnung", projectId: 1, orderId: order1?.id, invoiceId: inv2?.id, companyId: 1 },
  { name: "Rechnung R-2026-003.pdf", originalName: "RE_R-2026-003.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 200000, category: "rechnung", projectId: project5?.id, orderId: order6?.id, invoiceId: inv3?.id, companyId: 30001 },
  
  // Garantieurkunden
  { name: "Garantieurkunde G-2026-001.pdf", originalName: "GU_G-2026-001.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 150000, category: "garantie", projectId: 3, orderId: order3?.id, warrantyId: war1?.id, companyId: 2 },
  { name: "Garantieurkunde G-2026-002.pdf", originalName: "GU_G-2026-002.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 148000, category: "garantie", projectId: 3, orderId: order3?.id, warrantyId: war2?.id, companyId: 2 },
  { name: "Garantieurkunde G-2026-003.pdf", originalName: "GU_G-2026-003.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 155000, category: "garantie", projectId: project5?.id, orderId: order6?.id, warrantyId: war3?.id, companyId: 30001 },
  
  // Abnahmeprotokolle
  { name: "Abnahmeprotokoll Beispielweg.pdf", originalName: "AP_Beispielweg.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 320000, category: "abnahmeprotokoll", projectId: 3, orderId: order3?.id, companyId: 2 },
  { name: "Abnahmeprotokoll Seniorenresidenz.pdf", originalName: "AP_Seniorenresidenz.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 285000, category: "abnahmeprotokoll", projectId: project5?.id, orderId: order6?.id, companyId: 30001 },
  
  // Fotos
  { name: "Sonnenhof Vorher Haus 1.jpg", originalName: "sonnenhof_vorher_1.jpg", fileType: "bild", mimeType: "image/jpeg", fileSize: 2500000, category: "foto", projectId: 1, constructionSiteId: cs1?.id, propertyId: 1 },
  { name: "Sonnenhof Nachher Haus 1.jpg", originalName: "sonnenhof_nachher_1.jpg", fileType: "bild", mimeType: "image/jpeg", fileSize: 2800000, category: "foto", projectId: 1, constructionSiteId: cs1?.id, propertyId: 1 },
  { name: "Beispielweg Vorher.jpg", originalName: "beispielweg_vorher.jpg", fileType: "bild", mimeType: "image/jpeg", fileSize: 3100000, category: "foto", projectId: 3, constructionSiteId: cs2?.id, propertyId: 5 },
  { name: "Beispielweg Nachher.jpg", originalName: "beispielweg_nachher.jpg", fileType: "bild", mimeType: "image/jpeg", fileSize: 3200000, category: "foto", projectId: 3, constructionSiteId: cs2?.id, propertyId: 5 },
  
  // Sonstige Dokumente
  { name: "Bewohnerinformation Sonnenhof.pdf", originalName: "Bewohnerinfo_Sonnenhof.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 95000, category: "sonstiges", projectId: 1, constructionSiteId: cs1?.id },
  { name: "Straßensperrung Genehmigung.pdf", originalName: "Strassensperrung.pdf", fileType: "dokument", mimeType: "application/pdf", fileSize: 120000, category: "sonstiges", projectId: 1, constructionSiteId: cs1?.id },
];

for (const doc of documentsData) {
  const s3Key = `documents/${doc.category}/${doc.originalName}`;
  const s3Url = `https://storage.example.com/${s3Key}`;
  try {
    await conn.execute(
      `INSERT INTO documents (name, originalName, fileType, mimeType, fileSize, s3Key, s3Url, companyId, projectId, propertyId, constructionSiteId, offerId, orderId, invoiceId, warrantyId, category, uploadedById)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [doc.name, doc.originalName, doc.fileType, doc.mimeType, doc.fileSize, s3Key, s3Url, doc.companyId || null, doc.projectId || null, doc.propertyId || null, doc.constructionSiteId || null, doc.offerId || null, doc.orderId || null, doc.invoiceId || null, doc.warrantyId || null, doc.category]
    );
  } catch (e) {
    console.log(`  ⚠️ Dokument ${doc.name}: ${e.message}`);
  }
}

const [allDocs] = await conn.execute("SELECT COUNT(*) as cnt FROM documents");
console.log(`  ✅ ${allDocs[0].cnt} Dokumente im Archiv\n`);

// ============================================
// 8. AUFGABEN ERSTELLEN
// ============================================
console.log("✅ Aufgaben erstellen...");

const tasksData = [
  // Projekt 1: Sonnenhof (in Durchführung)
  { projectId: 1, constructionSiteId: cs1?.id, title: "Bewohnerinformation verteilen", status: "erledigt", priority: "hoch", dueDate: fmt(daysAgo(40)), assignedRole: "Büro", completedAt: fmt(daysAgo(42)) },
  { projectId: 1, constructionSiteId: cs1?.id, title: "Hubsteiger-Genehmigung einholen", status: "erledigt", priority: "dringend", dueDate: fmt(daysAgo(43)), assignedRole: "AT-Leiter", completedAt: fmt(daysAgo(44)) },
  { projectId: 1, constructionSiteId: cs1?.id, title: "Material nachbestellen - Reinigungsmittel", status: "in_bearbeitung", priority: "normal", dueDate: fmt(daysFromNow(2)), assignedRole: "AT-Leiter" },
  { projectId: 1, constructionSiteId: cs1?.id, title: "Zwischenabnahme Gebäude 1-3", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(5)), assignedRole: "Projektleiter" },
  { projectId: 1, constructionSiteId: cs1?.id, title: "Schlussrechnung vorbereiten", status: "offen", priority: "normal", dueDate: fmt(daysFromNow(35)), assignedRole: "Büro" },
  
  // Projekt 2: Bergstraße (Angebot versendet)
  { projectId: 2, title: "Nachfassen bei Hausverwaltung Müller", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(3)), assignedRole: "Kundenberater" },
  { projectId: 2, title: "Alternativangebot erstellen (ohne Giebel)", status: "offen", priority: "normal", dueDate: fmt(daysFromNow(7)), assignedRole: "Büro" },
  
  // Projekt 3: Beispielweg (abgeschlossen)
  { projectId: 3, title: "Garantieurkunden versenden", status: "erledigt", priority: "normal", dueDate: fmt(daysAgo(10)), assignedRole: "Büro", completedAt: fmt(daysAgo(12)) },
  { projectId: 3, title: "Kundenfeedback einholen", status: "offen", priority: "niedrig", dueDate: fmt(daysFromNow(14)), assignedRole: "Kundenberater" },
  
  // Projekt 4: Gewerbepark (Planung)
  { projectId: 4, title: "Straßensperre beantragen", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(20)), assignedRole: "AT-Leiter" },
  { projectId: 4, title: "Ressourcen buchen (Team + Geräte)", status: "offen", priority: "dringend", dueDate: fmt(daysFromNow(25)), assignedRole: "AT-Leiter" },
  { projectId: 4, title: "Angebot finalisieren und versenden", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(5)), assignedRole: "Büro" },
  
  // Projekt 5: Seniorenresidenz (Abnahme)
  { projectId: project5?.id, title: "Abnahmeprotokoll erstellen", status: "in_bearbeitung", priority: "dringend", dueDate: fmt(daysFromNow(1)), assignedRole: "Projektleiter" },
  { projectId: project5?.id, title: "Mängelbeseitigung Eingangstür", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(3)), assignedRole: "AT-Leiter" },
  
  // Projekt 6: Studentenwohnheim (Vorbereitung)
  { projectId: project6?.id, title: "Gerüst bestellen", status: "offen", priority: "hoch", dueDate: fmt(daysFromNow(10)), assignedRole: "AT-Leiter" },
  { projectId: project6?.id, title: "Bewohnerinformation erstellen", status: "offen", priority: "normal", dueDate: fmt(daysFromNow(12)), assignedRole: "Büro" },
  
  // Überfällige Aufgaben
  { projectId: 1, title: "Sicherheitsunterweisung Team", status: "offen", priority: "dringend", dueDate: fmt(daysAgo(2)), assignedRole: "AT-Leiter" },
  { projectId: project5?.id, title: "Rechnung R-2026-003 mahnen", status: "offen", priority: "dringend", dueDate: fmt(daysAgo(5)), assignedRole: "Büro" },
];

for (const t of tasksData) {
  if (!t.projectId) continue;
  try {
    await conn.execute(
      `INSERT INTO tasks (projectId, constructionSiteId, title, status, priority, dueDate, assignedRole, completedAt, assignedToId, createdById)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [t.projectId, t.constructionSiteId || null, t.title, t.status, t.priority, t.dueDate, t.assignedRole, t.completedAt || null]
    );
  } catch (e) {
    console.log(`  ⚠️ Aufgabe "${t.title}": ${e.message}`);
  }
}

const [allTasks] = await conn.execute("SELECT COUNT(*) as cnt FROM tasks");
console.log(`  ✅ ${allTasks[0].cnt} Aufgaben vorhanden\n`);

// ============================================
// 9. AKTIVITÄTSLOG
// ============================================
console.log("📊 Aktivitätslog erstellen...");

const activitiesData = [
  { action: "created", entityType: "project", entityName: "Wohnanlage Sonnenhof", details: "Projekt erstellt", createdAt: fmt(daysAgo(60)) },
  { action: "created", entityType: "offer", entityName: "FF-2026-0001", details: "Angebot erstellt", createdAt: fmt(daysAgo(58)) },
  { action: "sent", entityType: "offer", entityName: "FF-2026-0001", details: "Angebot versendet an WG Sonnenhof eG", createdAt: fmt(daysAgo(55)) },
  { action: "status_changed", entityType: "offer", entityName: "FF-2026-0001", details: "Angebot angenommen", createdAt: fmt(daysAgo(50)) },
  { action: "created", entityType: "project", entityName: "Auftrag A-2026-001", details: "Auftrag aus Angebot erstellt", createdAt: fmt(daysAgo(50)) },
  { action: "created", entityType: "construction_site", entityName: "Baustelle Sonnenhof", details: "Baustelle angelegt", createdAt: fmt(daysAgo(48)) },
  { action: "status_changed", entityType: "project", entityName: "Sonnenhof", details: "Phase: Durchführung", createdAt: fmt(daysAgo(45)) },
  { action: "uploaded", entityType: "document", entityName: "Bewohnerinformation Sonnenhof.pdf", details: "Dokument hochgeladen", createdAt: fmt(daysAgo(42)) },
  { action: "created", entityType: "offer", entityName: "FF-2026-0002", details: "Angebot für Bergstraße erstellt", createdAt: fmt(daysAgo(10)) },
  { action: "sent", entityType: "offer", entityName: "FF-2026-0002", details: "Angebot versendet an Hausverwaltung Müller", createdAt: fmt(daysAgo(7)) },
  { action: "completed", entityType: "project", entityName: "Beispielweg 10-20", details: "Projekt abgeschlossen", createdAt: fmt(daysAgo(15)) },
  { action: "created", entityType: "document", entityName: "Abnahmeprotokoll Beispielweg.pdf", details: "Abnahmeprotokoll erstellt", createdAt: fmt(daysAgo(14)) },
  { action: "created", entityType: "document", entityName: "Rechnung R-2026-001.pdf", details: "Schlussrechnung erstellt", createdAt: fmt(daysAgo(14)) },
  { action: "created", entityType: "document", entityName: "Garantieurkunde G-2026-001.pdf", details: "Garantieurkunde erstellt", createdAt: fmt(daysAgo(14)) },
  { action: "synced", entityType: "hubspot", entityName: "HubSpot", details: "12 Kontakte synchronisiert", createdAt: fmt(daysAgo(1)) },
  { action: "created", entityType: "task", entityName: "Sicherheitsunterweisung Team", details: "Dringende Aufgabe erstellt", createdAt: fmt(daysAgo(3)) },
  { action: "status_changed", entityType: "task", entityName: "Material nachbestellen", details: "Status: In Bearbeitung", createdAt: fmt(daysAgo(1)) },
  { action: "uploaded", entityType: "document", entityName: "Sonnenhof Nachher Haus 1.jpg", details: "Foto hochgeladen", createdAt: fmt(daysAgo(2)) },
];

for (const a of activitiesData) {
  try {
    await conn.execute(
      `INSERT INTO activityLogs (userId, userName, action, entityType, entityName, details, createdAt)
       VALUES (1, 'Alexander Retzlaff', ?, ?, ?, ?, ?)`,
      [a.action, a.entityType, a.entityName, a.details, a.createdAt]
    );
  } catch (e) {
    console.log(`  ⚠️ Aktivität: ${e.message}`);
  }
}

const [allActivities] = await conn.execute("SELECT COUNT(*) as cnt FROM activityLogs");
console.log(`  ✅ ${allActivities[0].cnt} Aktivitätslog-Einträge\n`);

// ============================================
// 10. BAUSTELLEN-LOGBUCH
// ============================================
console.log("📋 Baustellen-Logbuch erstellen...");

if (cs1) {
  const csLogs = [
    { constructionSiteId: cs1.id, logType: "arbeitsbeginn", entry: "Arbeitsbeginn 08:00 Uhr. Team vollständig. Wetter gut, Arbeiten können wie geplant durchgeführt werden.", loggedAt: fmt(daysAgo(2)) },
    { constructionSiteId: cs1.id, logType: "fortschritt", entry: "Gebäude 1-3 fertiggestellt. Algenbefall erfolgreich entfernt. Imprägnierung aufgetragen.", loggedAt: fmt(daysAgo(2)) },
    { constructionSiteId: cs1.id, logType: "problem", entry: "Hubsteiger-Ausfall wegen technischem Defekt. Ersatzgerät angefordert, Lieferung morgen früh.", loggedAt: fmt(daysAgo(2)) },
    { constructionSiteId: cs1.id, logType: "arbeitsende", entry: "Arbeitsende 17:00 Uhr. Tagesfortschritt: 5% Gesamtfortschritt. Morgen Fortsetzung Gebäude 4-6.", loggedAt: fmt(daysAgo(2)) },
    { constructionSiteId: cs1.id, logType: "arbeitsbeginn", entry: "Arbeitsbeginn 07:30 Uhr. Ersatz-Hubsteiger eingetroffen. Weiter mit Gebäude 4.", loggedAt: fmt(daysAgo(1)) },
    { constructionSiteId: cs1.id, logType: "fortschritt", entry: "Gebäude 4 und 5 in Arbeit. Vorderseiten fertig, Rückseiten morgen.", loggedAt: fmt(daysAgo(1)) },
    { constructionSiteId: cs1.id, logType: "arbeitsende", entry: "Arbeitsende 16:30 Uhr. Guter Fortschritt heute.", loggedAt: fmt(daysAgo(1)) },
  ];

  for (const log of csLogs) {
    await conn.execute(
      `INSERT INTO constructionSiteLogs (constructionSiteId, userId, userName, logType, entry, loggedAt)
       VALUES (?, 1, 'Alexander Retzlaff', ?, ?, ?)`,
      [log.constructionSiteId, log.logType, log.entry, log.loggedAt]
    );
  }
}

const [allCSLogs] = await conn.execute("SELECT COUNT(*) as cnt FROM constructionSiteLogs");
console.log(`  ✅ ${allCSLogs[0].cnt} Baustellen-Logbuch-Einträge\n`);

// ============================================
// ZUSAMMENFASSUNG
// ============================================
console.log("=" .repeat(50));
console.log("🎉 Seed-Daten erfolgreich erstellt!\n");

const tables = [
  ["Projekte", "projects"],
  ["Immobilien", "properties"],
  ["Baustellen", "constructionSites"],
  ["Angebote", "offers"],
  ["Aufträge", "orders"],
  ["Rechnungen", "invoices"],
  ["Garantien", "warranties"],
  ["Dokumente", "documents"],
  ["Aufgaben", "tasks"],
  ["Aktivitätslog", "activityLogs"],
  ["Baustellen-Log", "constructionSiteLogs"],
  ["Unternehmen", "companies"],
  ["Kontakte", "contacts"],
];

for (const [label, table] of tables) {
  const [[row]] = await conn.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
  console.log(`  ${label}: ${row.cnt}`);
}

await conn.end();
console.log("\n✅ Fertig!");
