#!/usr/bin/env node
/**
 * Schnelle Kontakt-Unternehmen-Zuordnung
 * 
 * Strategie: Alle Kontakte mit associatedcompanyid aus HubSpot paginiert laden,
 * dann Batch-Update in der DB über die HubSpot-ID-Zuordnung.
 * 
 * Geschäftsregel: Jeder Kontakt MUSS einem Unternehmen zugeordnet sein.
 * Der Kontakt ist der Ansprechpartner beim Kunden (= Unternehmen).
 */

import { execSync } from 'child_process';
import fs from 'fs';
import mysql from 'mysql2/promise';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL nicht gesetzt'); process.exit(1); }

function callMCP(toolName, input) {
  const inputJson = JSON.stringify(input);
  const command = `manus-mcp-cli tool call ${toolName} --server hubspot --input '${inputJson}'`;
  try {
    const stdout = execSync(command, { maxBuffer: 50 * 1024 * 1024, timeout: 120000, encoding: 'utf-8' });
    const fileMatch = stdout.match(/Tool execution result saved to: (.+\.json)/);
    if (fileMatch && fileMatch[1]) {
      return JSON.parse(fs.readFileSync(fileMatch[1], 'utf-8'));
    }
    const resultMatch = stdout.match(/Tool execution result:\s*([\s\S]*)/);
    if (resultMatch && resultMatch[1]) {
      try { return JSON.parse(resultMatch[1].trim()); } catch { return null; }
    }
    return null;
  } catch (e) { 
    console.error('MCP Fehler:', e.message?.substring(0, 200));
    return null; 
  }
}

async function main() {
  console.log('Kontakt-Unternehmen-Zuordnung (Schnellmodus)');
  console.log('='.repeat(60));
  console.log('Geschaeftsregel: Jeder Kontakt MUSS einem Unternehmen zugeordnet sein.');
  console.log('');
  
  const connection = await mysql.createConnection(DB_URL);
  
  // 1. Build HubSpot-ID → local company ID lookup
  console.log(' Erstelle Zuordnungstabelle...');
  const [companyRows] = await connection.execute(
    'SELECT id, hubspotId, name FROM companies WHERE hubspotId IS NOT NULL'
  );
  const companyByHubspotId = new Map();
  for (const row of companyRows) {
    companyByHubspotId.set(row.hubspotId, { id: row.id, name: row.name });
  }
  console.log(`  ${companyByHubspotId.size} Unternehmen mit HubSpot-ID in der DB`);
  
  // 2. Load ALL contacts from HubSpot with associatedcompanyid
  console.log('\n Lade alle Kontakte mit Firmenzuordnung aus HubSpot...');
  const allAssociations = []; // { contactHubspotId, companyHubspotId }
  let after = undefined;
  let page = 0;
  let totalLoaded = 0;
  
  while (true) {
    page++;
    const params = {
      objectType: 'contacts',
      limit: 100,
      properties: ['associatedcompanyid'],
    };
    if (after) params.after = after;
    
    process.stdout.write(`  Seite ${page} (${totalLoaded} bisher)...`);
    const response = callMCP('hubspot-list-objects', params);
    
    if (!response || !response.results) {
      console.log(' FEHLER - keine Antwort');
      break;
    }
    
    for (const contact of response.results) {
      const companyHubspotId = contact.properties?.associatedcompanyid;
      if (companyHubspotId) {
        allAssociations.push({
          contactHubspotId: contact.id,
          companyHubspotId: String(companyHubspotId),
        });
      }
    }
    
    totalLoaded += response.results.length;
    console.log(` +${response.results.length} (${allAssociations.length} mit Firma)`);
    
    after = response.paging?.next?.after;
    if (!after) break;
  }
  
  console.log(`\n  ${totalLoaded} Kontakte geladen, ${allAssociations.length} haben eine Firmenzuordnung`);
  
  // 3. Batch-Update in der DB
  console.log('\n Aktualisiere Zuordnungen in der Datenbank...');
  let linked = 0;
  let notFound = 0;
  let errors = 0;
  const missingCompanies = new Set();
  
  for (let i = 0; i < allAssociations.length; i++) {
    const { contactHubspotId, companyHubspotId } = allAssociations[i];
    const company = companyByHubspotId.get(companyHubspotId);
    
    if (company) {
      try {
        const [result] = await connection.execute(
          'UPDATE contacts SET companyId = ? WHERE hubspotId = ? AND (companyId IS NULL OR companyId != ?)',
          [company.id, contactHubspotId, company.id]
        );
        if (result.affectedRows > 0) linked++;
      } catch (e) {
        errors++;
      }
    } else {
      notFound++;
      missingCompanies.add(companyHubspotId);
    }
    
    if ((i + 1) % 500 === 0) {
      process.stdout.write(`  ${i + 1}/${allAssociations.length} verarbeitet (${linked} verknuepft)\r`);
    }
  }
  
  console.log(`  ${allAssociations.length}/${allAssociations.length} verarbeitet`);
  
  // 4. Final statistics
  const [totalContacts] = await connection.execute('SELECT COUNT(*) as cnt FROM contacts');
  const [linkedContacts] = await connection.execute('SELECT COUNT(*) as cnt FROM contacts WHERE companyId IS NOT NULL');
  const [unlinkedContacts] = await connection.execute('SELECT COUNT(*) as cnt FROM contacts WHERE companyId IS NULL');
  
  // 5. Identify orphaned contacts (no company in HubSpot)
  const orphanCount = parseInt(unlinkedContacts[0].cnt);
  
  console.log('\n' + '='.repeat(60));
  console.log('ZUORDNUNG ABGESCHLOSSEN');
  console.log('='.repeat(60));
  console.log(`  Kontakte gesamt:           ${totalContacts[0].cnt}`);
  console.log(`  Neu verknuepft:            ${linked}`);
  console.log(`  Gesamt verknuepft:         ${linkedContacts[0].cnt}`);
  console.log(`  Noch unverknuepft:         ${orphanCount}`);
  console.log(`  Firma nicht in DB:         ${notFound} (${missingCompanies.size} verschiedene)`);
  console.log(`  Fehler:                    ${errors}`);
  console.log('='.repeat(60));
  
  if (orphanCount > 0) {
    console.log(`\n WARNUNG: ${orphanCount} Kontakte ohne Unternehmenszuordnung!`);
    console.log('  Diese Kontakte haben in HubSpot keine associatedcompanyid.');
    
    // Show sample of unlinked contacts
    const [samples] = await connection.execute(
      'SELECT id, hubspotId, firstName, lastName, email FROM contacts WHERE companyId IS NULL LIMIT 10'
    );
    console.log('\n  Beispiele unverknuepfter Kontakte:');
    for (const s of samples) {
      console.log(`    - ${s.firstName || ''} ${s.lastName} (${s.email || 'keine E-Mail'}) [HS: ${s.hubspotId}]`);
    }
    
    if (orphanCount > 10) {
      console.log(`    ... und ${orphanCount - 10} weitere`);
    }
  }
  
  await connection.end();
}

main().catch(error => {
  console.error('Fataler Fehler:', error);
  process.exit(1);
});
