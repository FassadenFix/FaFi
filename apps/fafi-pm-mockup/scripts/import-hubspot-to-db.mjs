/**
 * Import HubSpot-Daten in die FaFi PM Datenbank
 * Liest hubspot-sync-data.json und fügt die Daten in die Datenbank ein
 */

import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  console.log('🔄 Starte Import der HubSpot-Daten in die Datenbank...\n');
  
  // Lade die Sync-Daten
  const syncData = JSON.parse(fs.readFileSync('/home/ubuntu/fafi-pm-mockup/hubspot-sync-data.json', 'utf8'));
  console.log(`📊 Geladene Daten: ${syncData.contacts} Kontakte, ${syncData.companies} Unternehmen, ${syncData.deals} Deals\n`);
  
  // Verbinde zur Datenbank
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('✅ Datenbankverbindung hergestellt\n');
  
  // Import Unternehmen (max 100 für den ersten Import)
  console.log('📥 Importiere Unternehmen...');
  let companiesImported = 0;
  const companiesToImport = syncData.companiesList.slice(0, 100);
  
  for (const company of companiesToImport) {
    try {
      // Prüfe ob Unternehmen bereits existiert (via hubspotId)
      const [existing] = await connection.execute(
        'SELECT id FROM companies WHERE hubspotId = ?',
        [company.hubspotId]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO companies (name, street, postalCode, city, phone, website, hubspotId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            company.name || 'Unbekannt',
            company.address || '',
            company.zip || '',
            company.city || '',
            company.phone || '',
            company.domain ? `https://${company.domain}` : '',
            company.hubspotId
          ]
        );
        companiesImported++;
      }
    } catch (error) {
      // Ignoriere Duplikate
      if (!error.message.includes('Duplicate')) {
        console.error(`  Fehler bei ${company.name}:`, error.message);
      }
    }
  }
  console.log(`✅ ${companiesImported} Unternehmen importiert\n`);
  
  // Import Kontakte (max 100 für den ersten Import)
  console.log('📥 Importiere Kontakte...');
  let contactsImported = 0;
  const contactsToImport = syncData.contactsList.slice(0, 100);
  
  for (const contact of contactsToImport) {
    try {
      // Prüfe ob Kontakt bereits existiert (via hubspotId)
      const [existing] = await connection.execute(
        'SELECT id FROM contacts WHERE hubspotId = ?',
        [contact.hubspotId]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO contacts (firstName, lastName, email, phone, position, hubspotId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            contact.firstname || '',
            contact.lastname || 'Unbekannt',
            contact.email || '',
            contact.phone || '',
            contact.jobtitle || '',
            contact.hubspotId
          ]
        );
        contactsImported++;
      }
    } catch (error) {
      // Ignoriere Duplikate
      if (!error.message.includes('Duplicate')) {
        console.error(`  Fehler bei ${contact.firstname} ${contact.lastname}:`, error.message);
      }
    }
  }
  console.log(`✅ ${contactsImported} Kontakte importiert\n`);
  
  // Speichere Sync-Status
  const syncStatus = {
    lastSync: new Date().toISOString(),
    companiesImported,
    contactsImported,
    totalCompaniesInHubSpot: syncData.companies,
    totalContactsInHubSpot: syncData.contacts,
    totalDealsInHubSpot: syncData.deals
  };
  
  fs.writeFileSync('/home/ubuntu/fafi-pm-mockup/hubspot-sync-status.json', JSON.stringify(syncStatus, null, 2));
  
  await connection.end();
  
  console.log('📊 Import-Zusammenfassung:');
  console.log(`   Unternehmen importiert: ${companiesImported}`);
  console.log(`   Kontakte importiert: ${contactsImported}`);
  console.log('\n✅ Import abgeschlossen!');
}

main().catch(console.error);
