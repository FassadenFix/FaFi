/**
 * HubSpot Komplettsynchronisation Script
 * Synchronisiert alle Kontakte und Unternehmen aus HubSpot in die FaFi PM Datenbank
 */

import { execSync } from 'child_process';
import fs from 'fs';

const MCP_RESULTS_DIR = '/home/ubuntu/.mcp/tool-results';

// Hole alle Kontakte aus HubSpot (mit Paging)
async function fetchAllContacts() {
  console.log('📥 Lade Kontakte aus HubSpot...');
  
  let allContacts = [];
  let after = null;
  let page = 1;
  
  do {
    const input = {
      objectType: 'contacts',
      limit: 100,
      properties: ['firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle']
    };
    if (after) input.after = after;
    
    try {
      const result = execSync(
        `manus-mcp-cli tool call hubspot-list-objects --server hubspot --input '${JSON.stringify(input)}'`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // Finde die neueste Ergebnisdatei
      const files = fs.readdirSync(MCP_RESULTS_DIR)
        .filter(f => f.includes('hubspot-list-objects'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const data = JSON.parse(fs.readFileSync(`${MCP_RESULTS_DIR}/${files[0]}`, 'utf8'));
        allContacts = allContacts.concat(data.results || []);
        after = data.paging?.next?.after || null;
        console.log(`  Seite ${page}: ${data.results?.length || 0} Kontakte geladen`);
        page++;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error.message);
      break;
    }
  } while (after && page <= 10); // Max 10 Seiten = 1000 Kontakte
  
  console.log(`✅ ${allContacts.length} Kontakte geladen`);
  return allContacts;
}

// Hole alle Unternehmen aus HubSpot (mit Paging)
async function fetchAllCompanies() {
  console.log('📥 Lade Unternehmen aus HubSpot...');
  
  let allCompanies = [];
  let after = null;
  let page = 1;
  
  do {
    const input = {
      objectType: 'companies',
      limit: 100,
      properties: ['name', 'domain', 'phone', 'city', 'address', 'zip']
    };
    if (after) input.after = after;
    
    try {
      execSync(
        `manus-mcp-cli tool call hubspot-list-objects --server hubspot --input '${JSON.stringify(input)}'`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // Finde die neueste Ergebnisdatei
      const files = fs.readdirSync(MCP_RESULTS_DIR)
        .filter(f => f.includes('hubspot-list-objects'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const data = JSON.parse(fs.readFileSync(`${MCP_RESULTS_DIR}/${files[0]}`, 'utf8'));
        allCompanies = allCompanies.concat(data.results || []);
        after = data.paging?.next?.after || null;
        console.log(`  Seite ${page}: ${data.results?.length || 0} Unternehmen geladen`);
        page++;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Unternehmen:', error.message);
      break;
    }
  } while (after && page <= 10); // Max 10 Seiten = 1000 Unternehmen
  
  console.log(`✅ ${allCompanies.length} Unternehmen geladen`);
  return allCompanies;
}

// Hole alle Deals aus HubSpot
async function fetchAllDeals() {
  console.log('📥 Lade Deals aus HubSpot...');
  
  let allDeals = [];
  let after = null;
  let page = 1;
  
  do {
    const input = {
      objectType: 'deals',
      limit: 100,
      properties: ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline']
    };
    if (after) input.after = after;
    
    try {
      execSync(
        `manus-mcp-cli tool call hubspot-list-objects --server hubspot --input '${JSON.stringify(input)}'`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // Finde die neueste Ergebnisdatei
      const files = fs.readdirSync(MCP_RESULTS_DIR)
        .filter(f => f.includes('hubspot-list-objects'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const data = JSON.parse(fs.readFileSync(`${MCP_RESULTS_DIR}/${files[0]}`, 'utf8'));
        allDeals = allDeals.concat(data.results || []);
        after = data.paging?.next?.after || null;
        console.log(`  Seite ${page}: ${data.results?.length || 0} Deals geladen`);
        page++;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Deals:', error.message);
      break;
    }
  } while (after && page <= 10);
  
  console.log(`✅ ${allDeals.length} Deals geladen`);
  return allDeals;
}

// Speichere die Sync-Ergebnisse
async function saveSyncResults(contacts, companies, deals) {
  const syncData = {
    syncedAt: new Date().toISOString(),
    contacts: contacts.length,
    companies: companies.length,
    deals: deals.length,
    contactsList: contacts.map(c => ({
      hubspotId: c.id,
      firstname: c.properties?.firstname || '',
      lastname: c.properties?.lastname || '',
      email: c.properties?.email || '',
      phone: c.properties?.phone || '',
      company: c.properties?.company || '',
      jobtitle: c.properties?.jobtitle || ''
    })),
    companiesList: companies.map(c => ({
      hubspotId: c.id,
      name: c.properties?.name || '',
      domain: c.properties?.domain || '',
      phone: c.properties?.phone || '',
      city: c.properties?.city || '',
      address: c.properties?.address || '',
      zip: c.properties?.zip || ''
    })),
    dealsList: deals.map(d => ({
      hubspotId: d.id,
      dealname: d.properties?.dealname || '',
      amount: d.properties?.amount || '',
      dealstage: d.properties?.dealstage || '',
      closedate: d.properties?.closedate || '',
      pipeline: d.properties?.pipeline || ''
    }))
  };
  
  fs.writeFileSync('/home/ubuntu/fafi-pm-mockup/hubspot-sync-data.json', JSON.stringify(syncData, null, 2));
  console.log('💾 Sync-Daten gespeichert in hubspot-sync-data.json');
  return syncData;
}

// Hauptfunktion
async function main() {
  console.log('🔄 Starte HubSpot Komplettsynchronisation...\n');
  
  const contacts = await fetchAllContacts();
  const companies = await fetchAllCompanies();
  const deals = await fetchAllDeals();
  
  const syncData = await saveSyncResults(contacts, companies, deals);
  
  console.log('\n📊 Sync-Zusammenfassung:');
  console.log(`   Kontakte: ${syncData.contacts}`);
  console.log(`   Unternehmen: ${syncData.companies}`);
  console.log(`   Deals: ${syncData.deals}`);
  console.log('\n✅ Synchronisation abgeschlossen!');
}

main().catch(console.error);
