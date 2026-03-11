#!/usr/bin/env node
/**
 * HubSpot Komplettsynchronisation
 * 
 * Importiert ALLE Unternehmen und Kontakte aus HubSpot in die FaFi PM Datenbank.
 * - Paginiert durch alle Seiten (max 100 pro Request - HubSpot API Limit)
 * - Upsert basierend auf hubspotId
 * - Kontakte werden über Assoziationen den Unternehmen zugeordnet
 * 
 * Usage: node scripts/hubspot-full-sync.mjs
 */

import { execSync } from 'child_process';
import mysql from 'mysql2/promise';

// ============================================
// CONFIG
// ============================================

const PAGE_SIZE = 100; // HubSpot API Maximum
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('DATABASE_URL nicht gesetzt');
  process.exit(1);
}

// ============================================
// MCP HELPER - reads from saved JSON file
// ============================================

import fs from 'fs';

function callMCP(toolName, input) {
  const inputJson = JSON.stringify(input);
  const command = `manus-mcp-cli tool call ${toolName} --server hubspot --input '${inputJson}'`;
  
  try {
    const stdout = execSync(command, { 
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120000,
      encoding: 'utf-8'
    });
    
    // Read from saved JSON file to avoid stdout truncation
    const fileMatch = stdout.match(/Tool execution result saved to: (.+\.json)/);
    if (fileMatch && fileMatch[1]) {
      const fileContent = fs.readFileSync(fileMatch[1], 'utf-8');
      return JSON.parse(fileContent);
    }
    
    // Fallback: parse from stdout
    const resultMatch = stdout.match(/Tool execution result:\s*([\s\S]*)/);
    if (resultMatch && resultMatch[1]) {
      try {
        return JSON.parse(resultMatch[1].trim());
      } catch {
        if (resultMatch[1].includes('Error')) {
          console.error('  API Error:', resultMatch[1].trim().substring(0, 200));
        }
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`MCP Error (${toolName}):`, error.message?.substring(0, 200));
    return null;
  }
}

// ============================================
// FETCH ALL COMPANIES (paginated, 100 per page)
// ============================================

function fetchAllCompanies() {
  console.log('\n Lade alle Unternehmen aus HubSpot...');
  const allCompanies = [];
  let after = undefined;
  let page = 0;
  
  while (true) {
    page++;
    const input = {
      objectType: 'companies',
      limit: PAGE_SIZE,
      properties: ['name', 'domain', 'phone', 'address', 'zip', 'city', 'country', 'website', 'industry', 'type'],
    };
    
    if (after) {
      input.after = after;
    }
    
    process.stdout.write(`  Seite ${page} (${allCompanies.length} bisher)...`);
    const response = callMCP('hubspot-list-objects', input);
    
    if (!response || !response.results || response.results.length === 0) {
      console.log(' keine weiteren Ergebnisse');
      break;
    }
    
    allCompanies.push(...response.results);
    console.log(` +${response.results.length} (gesamt: ${allCompanies.length})`);
    
    // Check for next page
    after = response.paging?.next?.after;
    if (!after) {
      break;
    }
    
    // Rate limiting - 500ms between requests
    execSync('sleep 0.5');
  }
  
  console.log(`\n ${allCompanies.length} Unternehmen insgesamt geladen`);
  return allCompanies;
}

// ============================================
// FETCH ALL CONTACTS (paginated, 100 per page)
// ============================================

function fetchAllContacts() {
  console.log('\n Lade alle Kontakte aus HubSpot...');
  const allContacts = [];
  let after = undefined;
  let page = 0;
  
  while (true) {
    page++;
    const input = {
      objectType: 'contacts',
      limit: PAGE_SIZE,
      properties: ['firstname', 'lastname', 'email', 'phone', 'mobilephone', 'jobtitle', 'company', 'salutation'],
    };
    
    if (after) {
      input.after = after;
    }
    
    process.stdout.write(`  Seite ${page} (${allContacts.length} bisher)...`);
    const response = callMCP('hubspot-list-objects', input);
    
    if (!response || !response.results || response.results.length === 0) {
      console.log(' keine weiteren Ergebnisse');
      break;
    }
    
    allContacts.push(...response.results);
    console.log(` +${response.results.length} (gesamt: ${allContacts.length})`);
    
    after = response.paging?.next?.after;
    if (!after) {
      break;
    }
    
    // Rate limiting
    execSync('sleep 0.5');
  }
  
  console.log(`\n ${allContacts.length} Kontakte insgesamt geladen`);
  return allContacts;
}

// ============================================
// FETCH CONTACT-COMPANY ASSOCIATIONS
// ============================================

function fetchContactCompanyAssociations(contactIds) {
  console.log(`\n Lade Kontakt-Unternehmen-Zuordnungen fuer ${contactIds.length} Kontakte...`);
  const associations = new Map(); // contactHubspotId -> companyHubspotId
  
  // Process in batches of 100
  const batchSize = 50;
  for (let i = 0; i < contactIds.length; i += batchSize) {
    const batch = contactIds.slice(i, i + batchSize);
    process.stdout.write(`  Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contactIds.length/batchSize)}...`);
    
    for (const contactId of batch) {
      try {
        const response = callMCP('hubspot-list-associations', {
          fromObjectType: 'contacts',
          toObjectType: 'companies',
          objectId: contactId,
        });
        
        if (response?.results?.length > 0) {
          const companyId = response.results[0].toObjectId || response.results[0].id;
          if (companyId) {
            associations.set(String(contactId), String(companyId));
          }
        }
      } catch (e) {
        // Skip individual errors
      }
    }
    
    console.log(` ${associations.size} Zuordnungen gefunden`);
    execSync('sleep 0.3');
  }
  
  console.log(`\n ${associations.size} Kontakt-Unternehmen-Zuordnungen gefunden`);
  return associations;
}

// ============================================
// DATABASE IMPORT
// ============================================

async function importCompanies(connection, companies) {
  console.log('\n Importiere Unternehmen in die Datenbank...');
  let imported = 0;
  let updated = 0;
  let errors = 0;
  
  for (const company of companies) {
    try {
      const hubspotId = company.id;
      const name = company.properties?.name || 'Unbekannt';
      const phone = company.properties?.phone || null;
      const street = company.properties?.address || null;
      const postalCode = company.properties?.zip || null;
      const city = company.properties?.city || null;
      const country = company.properties?.country || 'Deutschland';
      const website = company.properties?.website || (company.properties?.domain ? `https://${company.properties.domain}` : null);
      
      // Check if exists
      const [existing] = await connection.execute(
        'SELECT id FROM companies WHERE hubspotId = ?',
        [hubspotId]
      );
      
      if (existing.length > 0) {
        await connection.execute(
          `UPDATE companies SET name = ?, phone = ?, street = ?, postalCode = ?, city = ?, country = ?, website = ?, updatedAt = NOW() WHERE hubspotId = ?`,
          [name, phone, street, postalCode, city, country, website, hubspotId]
        );
        updated++;
      } else {
        await connection.execute(
          `INSERT INTO companies (hubspotId, name, phone, street, postalCode, city, country, website, email, category, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'wohnungsgesellschaft', NOW(), NOW())`,
          [hubspotId, name, phone, street, postalCode, city, country, website, null]
        );
        imported++;
      }
      
      // Progress every 100
      if ((imported + updated) % 100 === 0) {
        process.stdout.write(`  ${imported + updated}/${companies.length} verarbeitet\r`);
      }
    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.error(`  Fehler bei ${company.properties?.name}: ${error.message?.substring(0, 100)}`);
      }
    }
  }
  
  console.log(`  ${imported} neu, ${updated} aktualisiert, ${errors} Fehler`);
  return { imported, updated, errors };
}

async function importContacts(connection, contacts, contactCompanyAssociations, companyHubspotIdMap) {
  console.log('\n Importiere Kontakte in die Datenbank...');
  let imported = 0;
  let updated = 0;
  let linked = 0;
  let errors = 0;
  
  for (const contact of contacts) {
    try {
      const hubspotId = contact.id;
      const firstName = contact.properties?.firstname || null;
      const lastName = contact.properties?.lastname || 'Unbekannt';
      const email = contact.properties?.email || null;
      const phone = contact.properties?.phone || null;
      const mobile = contact.properties?.mobilephone || null;
      const position = contact.properties?.jobtitle || null;
      
      // Salutation mapping
      let salutation = null;
      const hubSalutation = (contact.properties?.salutation || '').toLowerCase();
      if (hubSalutation.includes('herr') || hubSalutation === 'mr' || hubSalutation === 'mr.') {
        salutation = 'herr';
      } else if (hubSalutation.includes('frau') || hubSalutation === 'ms' || hubSalutation === 'mrs' || hubSalutation === 'ms.') {
        salutation = 'frau';
      }
      
      // Find company via associations
      let companyId = null;
      const companyHubspotId = contactCompanyAssociations.get(String(hubspotId));
      if (companyHubspotId && companyHubspotIdMap.has(companyHubspotId)) {
        companyId = companyHubspotIdMap.get(companyHubspotId);
        linked++;
      }
      
      // Check if exists
      const [existing] = await connection.execute(
        'SELECT id FROM contacts WHERE hubspotId = ?',
        [hubspotId]
      );
      
      if (existing.length > 0) {
        await connection.execute(
          `UPDATE contacts SET firstName = ?, lastName = ?, email = ?, phone = ?, mobile = ?, position = ?, salutation = ?, companyId = ?, updatedAt = NOW() WHERE hubspotId = ?`,
          [firstName, lastName, email, phone, mobile, position, salutation, companyId, hubspotId]
        );
        updated++;
      } else {
        await connection.execute(
          `INSERT INTO contacts (hubspotId, companyId, firstName, lastName, email, phone, mobile, position, salutation, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [hubspotId, companyId, firstName, lastName, email, phone, mobile, position, salutation]
        );
        imported++;
      }
      
      if ((imported + updated) % 100 === 0) {
        process.stdout.write(`  ${imported + updated}/${contacts.length} verarbeitet\r`);
      }
    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.error(`  Fehler bei ${contact.properties?.lastname}: ${error.message?.substring(0, 100)}`);
      }
    }
  }
  
  console.log(`  ${imported} neu, ${updated} aktualisiert, ${linked} verknuepft, ${errors} Fehler`);
  return { imported, updated, linked, errors };
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('HubSpot Komplettsynchronisation gestartet');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // 1. Fetch all companies
  const hubspotCompanies = fetchAllCompanies();
  
  // 2. Fetch all contacts
  const hubspotContacts = fetchAllContacts();
  
  // 3. Fetch contact-company associations (skip if too many contacts - will be slow)
  let contactCompanyAssociations = new Map();
  if (hubspotContacts.length <= 5000) {
    const contactIds = hubspotContacts.map(c => c.id);
    contactCompanyAssociations = fetchContactCompanyAssociations(contactIds);
  } else {
    console.log(`\n Ueberspringe Assoziationen (${hubspotContacts.length} Kontakte - zu viele fuer Einzelabfragen)`);
  }
  
  // 4. Connect to database
  console.log('\n Verbinde mit Datenbank...');
  const connection = await mysql.createConnection(DB_URL);
  console.log('  Verbunden');
  
  try {
    // 5. Import companies first
    const companyResult = await importCompanies(connection, hubspotCompanies);
    
    // 6. Build hubspotId -> local ID map
    console.log('\n Erstelle Zuordnungstabelle...');
    const [companyRows] = await connection.execute(
      'SELECT id, hubspotId FROM companies WHERE hubspotId IS NOT NULL'
    );
    const companyHubspotIdMap = new Map();
    for (const row of companyRows) {
      companyHubspotIdMap.set(row.hubspotId, row.id);
    }
    console.log(`  ${companyHubspotIdMap.size} Unternehmen in Zuordnungstabelle`);
    
    // 7. Import contacts with company linking
    const contactResult = await importContacts(connection, hubspotContacts, contactCompanyAssociations, companyHubspotIdMap);
    
    // 8. Final statistics
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('SYNCHRONISATION ABGESCHLOSSEN');
    console.log('='.repeat(60));
    console.log(`  Unternehmen: ${companyResult.imported} neu, ${companyResult.updated} aktualisiert`);
    console.log(`  Kontakte:    ${contactResult.imported} neu, ${contactResult.updated} aktualisiert`);
    console.log(`  Verknuepft:  ${contactResult.linked} Kontakte mit Unternehmen`);
    console.log(`  Fehler:      ${companyResult.errors + contactResult.errors}`);
    console.log(`  Dauer:       ${elapsed}s`);
    console.log('='.repeat(60));
    
    // 9. Log activity
    try {
      await connection.execute(
        `INSERT INTO activity_logs (userId, userName, action, entityType, entityName, details, createdAt)
         VALUES (1, 'System', 'synced', 'hubspot', 'HubSpot Komplettsync', ?, NOW())`,
        [`${companyResult.imported + companyResult.updated} Unternehmen, ${contactResult.imported + contactResult.updated} Kontakte synchronisiert`]
      );
    } catch (e) {
      // Activity log is optional
    }
    
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Fataler Fehler:', error);
  process.exit(1);
});
