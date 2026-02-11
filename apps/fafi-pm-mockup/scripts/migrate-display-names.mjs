/**
 * Einmal-Migration: Bestehende Datensätze mit automatischen displayNames versehen
 * Schema: {Jahr}_{Unternehmen-Slug}_{Kontext}_{Laufnummer}_{Version}
 * 
 * Beispiele:
 * - 2026_Sonnenhof-eG_Angebot_0001_v1
 * - 2026_Hausverwaltung-Mueller_Rechnung_0001
 * - 2026_Industrie-GmbH_Auftrag_001
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL nicht gesetzt');
  process.exit(1);
}

// Slug-Funktion: Unternehmensnamen normalisieren
function slugifyCompanyName(name) {
  if (!name) return 'Unbekannt';
  const umlautMap = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue' };
  let slug = name;
  for (const [key, val] of Object.entries(umlautMap)) {
    slug = slug.replace(new RegExp(key, 'g'), val);
  }
  slug = slug
    .replace(/&/g, 'und')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug.substring(0, 50) || 'Unbekannt';
}

function padNumber(num, digits) {
  return String(num).padStart(digits, '0');
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('Verbunden mit Datenbank');

  // 1. Unternehmen-Lookup laden
  const [companies] = await connection.execute('SELECT id, name FROM companies');
  const companyMap = new Map(companies.map(c => [c.id, c.name]));
  console.log(`${companies.length} Unternehmen geladen`);

  // 2. Angebote migrieren
  const [offers] = await connection.execute(
    'SELECT id, offerNumber, version, companyId, createdAt FROM offers WHERE displayName IS NULL'
  );
  console.log(`\n--- Angebote: ${offers.length} ohne displayName ---`);
  
  // Laufnummern pro Unternehmen+Jahr tracken
  const offerCounters = new Map();
  for (const offer of offers) {
    const year = offer.createdAt ? new Date(offer.createdAt).getFullYear() : 2026;
    const companyName = companyMap.get(offer.companyId) || 'Unbekannt';
    const slug = slugifyCompanyName(companyName);
    const key = `${year}_${slug}`;
    const count = (offerCounters.get(key) || 0) + 1;
    offerCounters.set(key, count);
    
    const version = offer.version || 1;
    const displayName = `${year}_${slug}_Angebot_${padNumber(count, 4)}_v${version}`;
    
    await connection.execute(
      'UPDATE offers SET displayName = ? WHERE id = ?',
      [displayName, offer.id]
    );
    console.log(`  ${offer.offerNumber} → ${displayName}`);
  }

  // 3. Aufträge migrieren
  const [orders] = await connection.execute(
    'SELECT id, orderNumber, companyId, createdAt FROM orders WHERE displayName IS NULL'
  );
  console.log(`\n--- Aufträge: ${orders.length} ohne displayName ---`);
  
  const orderCounters = new Map();
  for (const order of orders) {
    const year = order.createdAt ? new Date(order.createdAt).getFullYear() : 2026;
    const companyName = companyMap.get(order.companyId) || 'Unbekannt';
    const slug = slugifyCompanyName(companyName);
    const key = `${year}_${slug}`;
    const count = (orderCounters.get(key) || 0) + 1;
    orderCounters.set(key, count);
    
    const displayName = `${year}_${slug}_Auftrag_${padNumber(count, 3)}`;
    
    await connection.execute(
      'UPDATE orders SET displayName = ? WHERE id = ?',
      [displayName, order.id]
    );
    console.log(`  ${order.orderNumber} → ${displayName}`);
  }

  // 4. Rechnungen migrieren
  const [invoices] = await connection.execute(
    'SELECT id, invoiceNumber, companyId, createdAt FROM invoices WHERE displayName IS NULL'
  );
  console.log(`\n--- Rechnungen: ${invoices.length} ohne displayName ---`);
  
  const invoiceCounters = new Map();
  for (const invoice of invoices) {
    const year = invoice.createdAt ? new Date(invoice.createdAt).getFullYear() : 2026;
    const companyName = companyMap.get(invoice.companyId) || 'Unbekannt';
    const slug = slugifyCompanyName(companyName);
    const key = `${year}_${slug}`;
    const count = (invoiceCounters.get(key) || 0) + 1;
    invoiceCounters.set(key, count);
    
    const displayName = `${year}_${slug}_Rechnung_${padNumber(count, 4)}`;
    
    await connection.execute(
      'UPDATE invoices SET displayName = ? WHERE id = ?',
      [displayName, invoice.id]
    );
    console.log(`  ${invoice.invoiceNumber} → ${displayName}`);
  }

  // 5. Garantien migrieren
  const [warranties] = await connection.execute(
    'SELECT id, warrantyNumber, companyId, createdAt FROM warranties WHERE displayName IS NULL'
  );
  console.log(`\n--- Garantien: ${warranties.length} ohne displayName ---`);
  
  const warrantyCounters = new Map();
  for (const warranty of warranties) {
    const year = warranty.createdAt ? new Date(warranty.createdAt).getFullYear() : 2026;
    const companyName = companyMap.get(warranty.companyId) || 'Unbekannt';
    const slug = slugifyCompanyName(companyName);
    const key = `${year}_${slug}`;
    const count = (warrantyCounters.get(key) || 0) + 1;
    warrantyCounters.set(key, count);
    
    const displayName = `${year}_${slug}_Garantie_${padNumber(count, 3)}`;
    
    await connection.execute(
      'UPDATE warranties SET displayName = ? WHERE id = ?',
      [displayName, warranty.id]
    );
    console.log(`  ${warranty.warrantyNumber} → ${displayName}`);
  }

  // 6. Dokumente migrieren
  const [documents] = await connection.execute(
    'SELECT id, name, category, companyId, projectId, createdAt FROM documents WHERE displayName IS NULL'
  );
  console.log(`\n--- Dokumente: ${documents.length} ohne displayName ---`);
  
  // Für Dokumente ohne companyId: Versuche über projectId das Unternehmen zu finden
  const [projects] = await connection.execute('SELECT id, companyId FROM projects');
  const projectCompanyMap = new Map(projects.map(p => [p.id, p.companyId]));
  
  const docCounters = new Map();
  for (const doc of documents) {
    const year = doc.createdAt ? new Date(doc.createdAt).getFullYear() : 2026;
    let companyId = doc.companyId;
    if (!companyId && doc.projectId) {
      companyId = projectCompanyMap.get(doc.projectId);
    }
    const companyName = companyId ? (companyMap.get(companyId) || 'Unbekannt') : 'Allgemein';
    const slug = slugifyCompanyName(companyName);
    
    // Kontext aus Kategorie ableiten
    const contextMap = {
      'angebot': 'Angebot',
      'auftragsbestaetigung': 'Auftragsbestaetigung',
      'vertrag': 'Vertrag',
      'rechnung': 'Rechnung',
      'garantie': 'Garantie',
      'abnahmeprotokoll': 'Abnahmeprotokoll',
      'protokoll': 'Protokoll',
      'foto': 'Foto',
      'sonstiges': 'Dokument',
    };
    const context = contextMap[doc.category] || 'Dokument';
    
    const key = `${year}_${slug}_${context}`;
    const count = (docCounters.get(key) || 0) + 1;
    docCounters.set(key, count);
    
    const displayName = `${year}_${slug}_${context}_${padNumber(count, 3)}`;
    
    await connection.execute(
      'UPDATE documents SET displayName = ? WHERE id = ?',
      [displayName, doc.id]
    );
    console.log(`  ${doc.name} → ${displayName}`);
  }

  // 7. Fotos migrieren
  const [photos] = await connection.execute(
    'SELECT p.id, p.filename, p.context, p.category, p.companyName, p.createdAt FROM photos p WHERE p.displayName IS NULL'
  );
  console.log(`\n--- Fotos: ${photos.length} ohne displayName ---`);
  
  const photoCounters = new Map();
  for (const photo of photos) {
    const year = photo.createdAt ? new Date(photo.createdAt).getFullYear() : 2026;
    const companyName = photo.companyName || 'Allgemein';
    const slug = slugifyCompanyName(companyName);
    
    const contextMap = {
      'objektaufnahme': 'Objektaufnahme',
      'vorher': 'Vorher-Doku',
      'nachher': 'Nachher-Doku',
      'baustelle': 'Baustelle',
      'abnahme': 'Abnahme',
    };
    const context = contextMap[photo.context] || photo.category || 'Foto';
    
    const key = `${year}_${slug}_${context}`;
    const count = (photoCounters.get(key) || 0) + 1;
    photoCounters.set(key, count);
    
    const displayName = `${year}_${slug}_${context}_${padNumber(count, 3)}`;
    
    await connection.execute(
      'UPDATE photos SET displayName = ? WHERE id = ?',
      [displayName, photo.id]
    );
    console.log(`  ${photo.filename} → ${displayName}`);
  }

  // Zusammenfassung
  console.log('\n=== MIGRATION ABGESCHLOSSEN ===');
  console.log(`Angebote:   ${offers.length} aktualisiert`);
  console.log(`Aufträge:   ${orders.length} aktualisiert`);
  console.log(`Rechnungen: ${invoices.length} aktualisiert`);
  console.log(`Garantien:  ${warranties.length} aktualisiert`);
  console.log(`Dokumente:  ${documents.length} aktualisiert`);
  console.log(`Fotos:      ${photos.length} aktualisiert`);
  console.log(`GESAMT:     ${offers.length + orders.length + invoices.length + warranties.length + documents.length + photos.length} Datensätze`);

  // Verifizierung
  const [remainingOffers] = await connection.execute('SELECT COUNT(*) as cnt FROM offers WHERE displayName IS NULL');
  const [remainingOrders] = await connection.execute('SELECT COUNT(*) as cnt FROM orders WHERE displayName IS NULL');
  const [remainingInvoices] = await connection.execute('SELECT COUNT(*) as cnt FROM invoices WHERE displayName IS NULL');
  const [remainingWarranties] = await connection.execute('SELECT COUNT(*) as cnt FROM warranties WHERE displayName IS NULL');
  const [remainingDocs] = await connection.execute('SELECT COUNT(*) as cnt FROM documents WHERE displayName IS NULL');
  const [remainingPhotos] = await connection.execute('SELECT COUNT(*) as cnt FROM photos WHERE displayName IS NULL');
  
  console.log('\n=== VERIFIZIERUNG ===');
  console.log(`Angebote ohne displayName:   ${remainingOffers[0].cnt}`);
  console.log(`Aufträge ohne displayName:   ${remainingOrders[0].cnt}`);
  console.log(`Rechnungen ohne displayName: ${remainingInvoices[0].cnt}`);
  console.log(`Garantien ohne displayName:  ${remainingWarranties[0].cnt}`);
  console.log(`Dokumente ohne displayName:  ${remainingDocs[0].cnt}`);
  console.log(`Fotos ohne displayName:      ${remainingPhotos[0].cnt}`);

  await connection.end();
}

main().catch(err => {
  console.error('Migration fehlgeschlagen:', err);
  process.exit(1);
});
