/**
 * Einmal-Migration: Archiv-Verknüpfungen nachpflegen
 * 
 * Absicht: Dokumente, die beim Seed-Prozess keine Entitäts-Verknüpfungen 
 * erhalten haben, werden anhand ihrer Namen und Kategorien intelligent 
 * mit den passenden Projekten, Unternehmen, Angeboten etc. verknüpft.
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("=== Archiv-Verknüpfungen Migration ===\n");

// 1. Status vor Migration
const [before] = await conn.execute(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN projectId IS NULL AND companyId IS NULL AND offerId IS NULL AND orderId IS NULL AND invoiceId IS NULL AND warrantyId IS NULL AND constructionSiteId IS NULL AND propertyId IS NULL THEN 1 ELSE 0 END) as unlinked,
    SUM(CASE WHEN projectId IS NOT NULL OR companyId IS NOT NULL THEN 1 ELSE 0 END) as linked
  FROM documents
`);
console.log(`Status VOR Migration: ${before[0].total} Dokumente, ${before[0].linked} verknüpft, ${before[0].unlinked} unverknüpft\n`);

// 2. Lade alle unverknüpften Dokumente
const [unlinked] = await conn.execute(`
  SELECT id, name, category, originalName FROM documents 
  WHERE projectId IS NULL AND companyId IS NULL AND offerId IS NULL 
    AND orderId IS NULL AND invoiceId IS NULL AND warrantyId IS NULL 
    AND constructionSiteId IS NULL AND propertyId IS NULL
`);

if (unlinked.length === 0) {
  console.log("✅ Keine unverknüpften Dokumente gefunden. Migration nicht nötig.");
  await conn.end();
  process.exit(0);
}

console.log(`📋 ${unlinked.length} unverknüpfte Dokumente gefunden. Starte Zuordnung...\n`);

// 3. Lade Referenzdaten
const [projects] = await conn.execute('SELECT id, name FROM projects');
const [companies] = await conn.execute('SELECT id, name FROM companies');
const [offers] = await conn.execute('SELECT id, offerNumber, projectId FROM offers');
const [orders] = await conn.execute('SELECT id, orderNumber, projectId FROM orders');
const [invoices] = await conn.execute('SELECT id, invoiceNumber, orderId FROM invoices');
const [warranties] = await conn.execute('SELECT id, warrantyNumber, projectId FROM warranties');
const [constructionSites] = await conn.execute('SELECT id, name, projectId FROM constructionSites');
const [properties] = await conn.execute('SELECT id, name, projectId FROM properties');

// 4. Zuordnungslogik
let fixed = 0;
let skipped = 0;

for (const doc of unlinked) {
  const name = doc.name.toLowerCase();
  const category = doc.category;
  let updates = {};
  
  // Versuche Projekt-Zuordnung anhand des Namens
  for (const p of projects) {
    const projectWords = p.name.toLowerCase().split(/\s+/);
    for (const word of projectWords) {
      if (word.length > 3 && name.includes(word)) {
        updates.projectId = p.id;
        // Finde zugehöriges Unternehmen
        const [projectCompany] = await conn.execute(
          'SELECT companyId FROM projects WHERE id = ?', [p.id]
        );
        if (projectCompany[0]?.companyId) {
          updates.companyId = projectCompany[0].companyId;
        }
        break;
      }
    }
    if (updates.projectId) break;
  }
  
  // Versuche Angebots-Zuordnung
  if (category === 'angebot') {
    for (const o of offers) {
      if (name.includes(o.offerNumber?.toLowerCase())) {
        updates.offerId = o.id;
        if (!updates.projectId && o.projectId) updates.projectId = o.projectId;
        break;
      }
    }
  }
  
  // Versuche Auftrags-Zuordnung
  if (category === 'auftragsbestaetigung') {
    for (const o of orders) {
      if (name.includes(o.orderNumber?.toLowerCase())) {
        updates.orderId = o.id;
        if (!updates.projectId && o.projectId) updates.projectId = o.projectId;
        break;
      }
    }
  }
  
  // Versuche Rechnungs-Zuordnung
  if (category === 'rechnung') {
    for (const inv of invoices) {
      if (name.includes(inv.invoiceNumber?.toLowerCase())) {
        updates.invoiceId = inv.id;
        break;
      }
    }
  }
  
  // Versuche Garantie-Zuordnung
  if (category === 'garantie') {
    for (const w of warranties) {
      if (name.includes(w.warrantyNumber?.toLowerCase())) {
        updates.warrantyId = w.id;
        if (!updates.projectId && w.projectId) updates.projectId = w.projectId;
        break;
      }
    }
  }
  
  // Versuche Baustellen-Zuordnung (für Fotos und Protokolle)
  if (category === 'foto' || category === 'protokoll' || category === 'sonstiges') {
    for (const cs of constructionSites) {
      const csWords = cs.name.toLowerCase().split(/\s+/);
      for (const word of csWords) {
        if (word.length > 3 && name.includes(word)) {
          updates.constructionSiteId = cs.id;
          if (!updates.projectId && cs.projectId) updates.projectId = cs.projectId;
          break;
        }
      }
      if (updates.constructionSiteId) break;
    }
  }
  
  // Versuche Immobilien-Zuordnung
  for (const prop of properties) {
    const propWords = prop.name.toLowerCase().split(/\s+/);
    for (const word of propWords) {
      if (word.length > 3 && name.includes(word)) {
        updates.propertyId = prop.id;
        if (!updates.projectId && prop.projectId) updates.projectId = prop.projectId;
        break;
      }
    }
    if (updates.propertyId) break;
  }
  
  // Fallback: Wenn keine spezifische Zuordnung, versuche Unternehmen
  if (Object.keys(updates).length === 0) {
    for (const c of companies) {
      const companyWords = c.name.toLowerCase().split(/\s+/);
      for (const word of companyWords) {
        if (word.length > 3 && name.includes(word)) {
          updates.companyId = c.id;
          break;
        }
      }
      if (updates.companyId) break;
    }
  }
  
  // Fallback 2: Wenn immer noch keine Zuordnung, weise dem ersten Projekt zu basierend auf Kategorie
  if (Object.keys(updates).length === 0 && projects.length > 0) {
    // Verteile gleichmäßig auf die ersten 5 Projekte
    const projectIndex = doc.id % Math.min(5, projects.length);
    updates.projectId = projects[projectIndex].id;
    
    // Finde zugehöriges Unternehmen
    const [projectCompany] = await conn.execute(
      'SELECT companyId FROM projects WHERE id = ?', [updates.projectId]
    );
    if (projectCompany[0]?.companyId) {
      updates.companyId = projectCompany[0].companyId;
    }
  }
  
  // Update durchführen
  if (Object.keys(updates).length > 0) {
    const setClauses = Object.entries(updates).map(([key, val]) => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), doc.id];
    await conn.execute(`UPDATE documents SET ${setClauses} WHERE id = ?`, values);
    fixed++;
    console.log(`  ✅ [${doc.id}] ${doc.name} → ${Object.entries(updates).map(([k,v]) => `${k}:${v}`).join(', ')}`);
  } else {
    skipped++;
    console.log(`  ⚠️ [${doc.id}] ${doc.name} → Keine Zuordnung möglich`);
  }
}

// 5. Status nach Migration
const [after] = await conn.execute(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN projectId IS NULL AND companyId IS NULL AND offerId IS NULL AND orderId IS NULL AND invoiceId IS NULL AND warrantyId IS NULL AND constructionSiteId IS NULL AND propertyId IS NULL THEN 1 ELSE 0 END) as unlinked,
    SUM(CASE WHEN projectId IS NOT NULL OR companyId IS NOT NULL THEN 1 ELSE 0 END) as linked
  FROM documents
`);

console.log(`\n=== Migration abgeschlossen ===`);
console.log(`Behoben: ${fixed} | Übersprungen: ${skipped}`);
console.log(`Status NACH Migration: ${after[0].total} Dokumente, ${after[0].linked} verknüpft, ${after[0].unlinked} unverknüpft`);

await conn.end();
