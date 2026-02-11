#!/usr/bin/env node
/**
 * Kontakt-Unternehmen-Zuordnung
 * 
 * Verknüpft Kontakte mit Unternehmen über zwei Strategien:
 * 1. HubSpot-Assoziationen (Batch-Abfrage über MCP)
 * 2. Firmenname-Matching als Fallback
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
  } catch { return null; }
}

async function main() {
  console.log('Kontakt-Unternehmen-Zuordnung');
  console.log('='.repeat(60));
  
  const connection = await mysql.createConnection(DB_URL);
  
  // 1. Build company lookup maps
  console.log('\n Erstelle Zuordnungstabellen...');
  const [companyRows] = await connection.execute(
    'SELECT id, hubspotId, name FROM companies WHERE hubspotId IS NOT NULL'
  );
  
  const companyByHubspotId = new Map();
  const companyByName = new Map();
  
  for (const row of companyRows) {
    companyByHubspotId.set(row.hubspotId, row.id);
    // Normalize name for fuzzy matching
    const normalizedName = row.name.toLowerCase().trim();
    companyByName.set(normalizedName, row.id);
  }
  console.log(`  ${companyByHubspotId.size} Unternehmen mit HubSpot-ID`);
  
  // 2. Get unlinked contacts with their HubSpot IDs
  const [unlinkedContacts] = await connection.execute(
    'SELECT id, hubspotId, firstName, lastName FROM contacts WHERE companyId IS NULL AND hubspotId IS NOT NULL'
  );
  console.log(`  ${unlinkedContacts.length} unverknuepfte Kontakte`);
  
  // 3. Strategy 1: HubSpot Associations (batch by 1 at a time, but fast)
  console.log('\n Strategie 1: HubSpot-Assoziationen abfragen...');
  let linkedViaAssociation = 0;
  let processed = 0;
  const batchSize = 50;
  
  for (let i = 0; i < unlinkedContacts.length; i += batchSize) {
    const batch = unlinkedContacts.slice(i, i + batchSize);
    process.stdout.write(`  Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(unlinkedContacts.length/batchSize)} (${linkedViaAssociation} verknuepft)...\r`);
    
    for (const contact of batch) {
      try {
        const response = callMCP('hubspot-list-associations', {
          fromObjectType: 'contacts',
          toObjectType: 'companies',
          objectId: contact.hubspotId,
        });
        
        if (response?.results?.length > 0) {
          const companyHubspotId = String(response.results[0].toObjectId || response.results[0].id);
          const localCompanyId = companyByHubspotId.get(companyHubspotId);
          
          if (localCompanyId) {
            await connection.execute(
              'UPDATE contacts SET companyId = ? WHERE id = ?',
              [localCompanyId, contact.id]
            );
            linkedViaAssociation++;
          }
        }
        processed++;
      } catch {
        processed++;
      }
    }
    
    // Rate limiting
    execSync('sleep 0.2');
  }
  console.log(`\n  ${linkedViaAssociation} Kontakte ueber HubSpot-Assoziationen verknuepft`);
  
  // 4. Strategy 2: Name matching for remaining unlinked contacts
  console.log('\n Strategie 2: Firmenname-Matching...');
  const [stillUnlinked] = await connection.execute(
    `SELECT c.id, c.hubspotId, c.firstName, c.lastName 
     FROM contacts c 
     WHERE c.companyId IS NULL AND c.hubspotId IS NOT NULL`
  );
  
  let linkedViaName = 0;
  
  for (const contact of stillUnlinked) {
    // Get the company property from HubSpot
    try {
      const response = callMCP('hubspot-get-object', {
        objectType: 'contacts',
        objectId: contact.hubspotId,
        properties: ['company'],
      });
      
      const companyName = response?.properties?.company;
      if (companyName) {
        const normalizedName = companyName.toLowerCase().trim();
        const localCompanyId = companyByName.get(normalizedName);
        
        if (localCompanyId) {
          await connection.execute(
            'UPDATE contacts SET companyId = ? WHERE id = ?',
            [localCompanyId, contact.id]
          );
          linkedViaName++;
        }
      }
    } catch {
      // Skip
    }
  }
  console.log(`  ${linkedViaName} Kontakte ueber Firmenname verknuepft`);
  
  // 5. Final stats
  const [finalLinked] = await connection.execute(
    'SELECT COUNT(*) as cnt FROM contacts WHERE companyId IS NOT NULL'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('ZUORDNUNG ABGESCHLOSSEN');
  console.log('='.repeat(60));
  console.log(`  Via HubSpot-Assoziationen: ${linkedViaAssociation}`);
  console.log(`  Via Firmenname-Matching:    ${linkedViaName}`);
  console.log(`  Gesamt verknuepft:          ${finalLinked[0].cnt}`);
  console.log('='.repeat(60));
  
  await connection.end();
}

main().catch(error => {
  console.error('Fataler Fehler:', error);
  process.exit(1);
});
