/**
 * HR-04/HR-05: Seed-Script für Mitarbeiter und Dokumente
 * Importiert 30 Mitarbeiter aus Personio-Export und 113 Dokument-Referenzen
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const conn = await mysql.createConnection(dbUrl);

  // Load JSON data
  const employees = JSON.parse(readFileSync(resolve("/home/ubuntu/upload/employees_for_import.json"), "utf-8"));
  const documents = JSON.parse(readFileSync(resolve("/home/ubuntu/upload/documents_for_import.json"), "utf-8"));

  console.log(`Importing ${employees.length} employees and ${documents.length} documents...`);

  // Map personio_employee_id -> our DB id
  const personioToDbId = new Map();

  // Check if employees already exist
  const [existing] = await conn.query("SELECT COUNT(*) as cnt FROM employees");
  if (existing[0].cnt > 0) {
    console.log(`employees table already has ${existing[0].cnt} rows. Checking for updates...`);
    // Get existing personio IDs
    const [existingRows] = await conn.query("SELECT id, personioId FROM employees WHERE personioId IS NOT NULL");
    for (const row of existingRows) {
      personioToDbId.set(String(row.personioId), row.id);
    }
  }

  // Insert employees
  let insertedEmps = 0;
  let skippedEmps = 0;
  for (const emp of employees) {
    const personioId = String(emp.id);
    
    if (personioToDbId.has(personioId)) {
      skippedEmps++;
      continue;
    }

    const [result] = await conn.query(
      `INSERT INTO employees (
        firstName, lastName, email, gender, status, position,
        supervisor, employmentType, weeklyWorkingHours, hireDate,
        terminationDate, terminationType, probationPeriodEnd,
        subcompany, office, department, fixSalary, fixSalaryInterval,
        hourlySalary, workSchedule, lastWorkingDay, personioId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp.first_name,
        emp.last_name,
        emp.email || null,
        emp.gender || null,
        emp.status === "active" ? "active" : emp.status === "inactive" ? "inactive" : emp.status === "onboarding" ? "onboarding" : "inactive",
        emp.position || null,
        emp.supervisor || null,
        emp.employment_type || null,
        emp.weekly_working_hours || null,
        emp.hire_date || null,
        emp.termination_date || null,
        emp.termination_type || null,
        emp.probation_period_end || null,
        emp.subcompany || null,
        emp.office || null,
        emp.department || null,
        emp.fix_salary || null,
        emp.fix_salary_interval || null,
        emp.hourly_salary || null,
        emp.work_schedule || null,
        emp.last_working_day || null,
        personioId,
      ]
    );
    personioToDbId.set(personioId, result.insertId);
    insertedEmps++;
  }
  console.log(`Employees: ${insertedEmps} inserted, ${skippedEmps} skipped (already exist)`);

  // Insert documents
  const [existingDocs] = await conn.query("SELECT COUNT(*) as cnt FROM employee_documents");
  if (existingDocs[0].cnt > 0) {
    console.log(`employee_documents table already has ${existingDocs[0].cnt} rows. Skipping document import.`);
    await conn.end();
    return;
  }

  let insertedDocs = 0;
  let skippedDocs = 0;
  for (const doc of documents) {
    const personioId = String(doc.personio_employee_id);
    const employeeId = personioToDbId.get(personioId);
    
    if (!employeeId) {
      console.warn(`  Skipping doc "${doc.filename}" - no employee found for personio_id ${personioId}`);
      skippedDocs++;
      continue;
    }

    await conn.query(
      `INSERT INTO employee_documents (
        employeeId, filename, category, fileUrl, fileKey, mimeType, sizeBytes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        doc.filename,
        doc.category,
        doc.cdn_url,
        doc.filepath || null,
        doc.filename.endsWith(".pdf") ? "application/pdf" : 
          doc.filename.endsWith(".jpg") || doc.filename.endsWith(".jpeg") ? "image/jpeg" :
          doc.filename.endsWith(".png") ? "image/png" : "application/octet-stream",
        doc.size_bytes || null,
      ]
    );
    insertedDocs++;
  }
  console.log(`Documents: ${insertedDocs} inserted, ${skippedDocs} skipped (no matching employee)`);

  await conn.end();
  console.log("HR seed complete!");
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
