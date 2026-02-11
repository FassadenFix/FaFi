/**
 * FaFi PM - Bereinigungsskript
 * 
 * Löscht alle Seed-/Testdaten, behält aber:
 * - HubSpot-synchronisierte Unternehmen (companies mit hubspotId)
 * - HubSpot-synchronisierte Kontakte (contacts mit hubspotId)
 * - System-User (users)
 * - Textbausteine (text_blocks)
 * - Sync-Status (syncStatus)
 * 
 * Reihenfolge beachtet Foreign-Key-Constraints (abhängige zuerst löschen)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

async function cleanup() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("🧹 FaFi PM - Seed-Daten Bereinigung");
  console.log("====================================\n");

  try {
    // Zuerst: Zähle was da ist
    const tables = [
      'constructionSiteLogs', 'teamleiterChecks', 'constructionSites',
      'documents', 'warranties', 'invoices', 'orders',
      'offers', 'tasks', 'activityLogs', 'properties', 'projects',
      'dashboardWidgets', 'notifications', 'payments', 'teamMembers',
      'offer_templates', 'email_templates'
    ];

    console.log("📊 Aktuelle Datensätze:");
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
        console.log(`   ${table}: ${rows[0].cnt}`);
      } catch (e) {
        // Tabelle existiert möglicherweise nicht
      }
    }

    // Unternehmen und Kontakte separat zählen
    const [companyCount] = await connection.execute(`SELECT COUNT(*) as total, SUM(CASE WHEN hubspotId IS NOT NULL THEN 1 ELSE 0 END) as hubspot FROM companies`);
    const [contactCount] = await connection.execute(`SELECT COUNT(*) as total, SUM(CASE WHEN hubspotId IS NOT NULL THEN 1 ELSE 0 END) as hubspot FROM contacts`);
    
    console.log(`\n   companies: ${companyCount[0].total} (davon ${companyCount[0].hubspot} HubSpot → werden BEHALTEN)`);
    console.log(`   contacts: ${contactCount[0].total} (davon ${contactCount[0].hubspot} HubSpot → werden BEHALTEN)`);

    console.log("\n🗑️  Lösche Testdaten (Foreign-Key-Reihenfolge)...\n");

    // 1. Abhängige Tabellen zuerst (tiefste Ebene)
    const deleteOrder = [
      { table: 'constructionSiteLogs', label: 'Baustellen-Logbuch' },
      { table: 'teamleiterChecks', label: 'Teamleiter-Checks' },
      { table: 'payments', label: 'Zahlungen' },
      { table: 'documents', label: 'Dokumente' },
      { table: 'warranties', label: 'Garantien' },
      { table: 'invoices', label: 'Rechnungen' },
      { table: 'orders', label: 'Aufträge' },
      { table: 'offers', label: 'Angebote' },
      { table: 'tasks', label: 'Aufgaben' },
      { table: 'activityLogs', label: 'Aktivitätslogs' },
      { table: 'notifications', label: 'Benachrichtigungen' },
      { table: 'dashboardWidgets', label: 'Dashboard-Widgets' },
      { table: 'teamMembers', label: 'Team-Mitglieder' },
      { table: 'constructionSites', label: 'Baustellen' },
      { table: 'properties', label: 'Immobilien' },
      { table: 'projects', label: 'Projekte' },
    ];

    let totalDeleted = 0;

    for (const { table, label } of deleteOrder) {
      try {
        const [result] = await connection.execute(`DELETE FROM \`${table}\``);
        const deleted = result.affectedRows;
        totalDeleted += deleted;
        if (deleted > 0) {
          console.log(`   ✅ ${label} (${table}): ${deleted} Einträge gelöscht`);
        } else {
          console.log(`   ⏭️  ${label} (${table}): keine Daten`);
        }
      } catch (e) {
        console.log(`   ⚠️  ${label} (${table}): ${e.message}`);
      }
    }

    // 2. Kontakte ohne HubSpot-ID löschen
    const [contactResult] = await connection.execute(`DELETE FROM contacts WHERE hubspotId IS NULL`);
    if (contactResult.affectedRows > 0) {
      totalDeleted += contactResult.affectedRows;
      console.log(`   ✅ Kontakte (ohne HubSpot): ${contactResult.affectedRows} Einträge gelöscht`);
    }

    // 3. Unternehmen ohne HubSpot-ID löschen
    const [companyResult] = await connection.execute(`DELETE FROM companies WHERE hubspotId IS NULL`);
    if (companyResult.affectedRows > 0) {
      totalDeleted += companyResult.affectedRows;
      console.log(`   ✅ Unternehmen (ohne HubSpot): ${companyResult.affectedRows} Einträge gelöscht`);
    }

    // Nachher: Zähle was übrig ist
    console.log("\n📊 Verbleibende Datensätze:");
    const [remainingCompanies] = await connection.execute(`SELECT COUNT(*) as cnt FROM companies`);
    const [remainingContacts] = await connection.execute(`SELECT COUNT(*) as cnt FROM contacts`);
    const [remainingUsers] = await connection.execute(`SELECT COUNT(*) as cnt FROM users`);
    const [remainingTextBlocks] = await connection.execute(`SELECT COUNT(*) as cnt FROM text_blocks`);
    
    console.log(`   companies (HubSpot): ${remainingCompanies[0].cnt}`);
    console.log(`   contacts (HubSpot): ${remainingContacts[0].cnt}`);
    console.log(`   users: ${remainingUsers[0].cnt}`);
    console.log(`   text_blocks: ${remainingTextBlocks[0].cnt}`);

    console.log(`\n✅ Bereinigung abgeschlossen! ${totalDeleted} Testdaten-Einträge gelöscht.`);
    console.log("   HubSpot-Unternehmen und -Kontakte wurden beibehalten.");

  } catch (error) {
    console.error("❌ Fehler bei der Bereinigung:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

cleanup().catch(console.error);
