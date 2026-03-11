import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Count current state
  const [rows] = await conn.execute(`
    SELECT 
      (SELECT COUNT(*) FROM contacts) as total,
      (SELECT COUNT(*) FROM contacts WHERE isOrphaned = 1) as orphaned,
      (SELECT COUNT(*) FROM contacts WHERE companyId IS NULL) as no_company,
      (SELECT COUNT(*) FROM contacts WHERE companyId IS NOT NULL) as linked
  `);
  console.log('Aktueller Stand:', rows[0]);
  
  // Mark all contacts without companyId as orphaned
  const [result] = await conn.execute(`UPDATE contacts SET isOrphaned = 1 WHERE companyId IS NULL AND isOrphaned = 0`);
  console.log(`Verwaiste Kontakte markiert: ${result.affectedRows} neue`);
  
  // Verify
  const [after] = await conn.execute(`
    SELECT 
      (SELECT COUNT(*) FROM contacts) as total,
      (SELECT COUNT(*) FROM contacts WHERE isOrphaned = 1) as orphaned,
      (SELECT COUNT(*) FROM contacts WHERE companyId IS NULL) as no_company,
      (SELECT COUNT(*) FROM contacts WHERE companyId IS NOT NULL) as linked
  `);
  console.log('Nach Markierung:', after[0]);
  
  await conn.end();
}

main().catch(console.error);
