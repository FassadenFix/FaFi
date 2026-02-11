// Seed-Skript für Testdaten in FaFi PM
// Ausführen mit: node scripts/seed-testdata.mjs

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL nicht gefunden');
  process.exit(1);
}

async function seedTestData() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('🌱 Starte Testdaten-Seed...\n');

  try {
    // 1. Hole existierende IDs für Referenzen
    const [projects] = await connection.execute('SELECT id, name FROM projects LIMIT 5');
    const [companies] = await connection.execute('SELECT id, name FROM companies LIMIT 5');
    const [contacts] = await connection.execute('SELECT id, firstName, lastName FROM contacts LIMIT 5');
    const [properties] = await connection.execute('SELECT id, street FROM properties LIMIT 5');
    const [users] = await connection.execute('SELECT id, name FROM users LIMIT 3');

    console.log(`📊 Gefundene Referenzen:`);
    console.log(`   - ${projects.length} Projekte`);
    console.log(`   - ${companies.length} Unternehmen`);
    console.log(`   - ${contacts.length} Kontakte`);
    console.log(`   - ${properties.length} Immobilien`);
    console.log(`   - ${users.length} Benutzer\n`);

    // 2. Aufträge einfügen
    console.log('📝 Füge Aufträge ein...');
    const orderData = [
      {
        orderNumber: 'A-2026-001',
        projectId: projects[0]?.id || null,
        companyId: companies[0]?.id || null,
        contactId: contacts[0]?.id || null,
        status: 'in_durchfuehrung',
        netTotal: '45000.00',
        vatAmount: '8550.00',
        grossTotal: '53550.00',
        orderDate: new Date('2026-01-15'),
        plannedStartDate: new Date('2026-02-01'),
        plannedEndDate: new Date('2026-03-15'),
        notes: 'Großprojekt Wohnanlage Sonnenhof - 12 Gebäude'
      },
      {
        orderNumber: 'A-2026-002',
        projectId: projects[1]?.id || null,
        companyId: companies[1]?.id || null,
        contactId: contacts[1]?.id || null,
        status: 'bestaetigt',
        netTotal: '12500.00',
        vatAmount: '2375.00',
        grossTotal: '14875.00',
        orderDate: new Date('2026-01-28'),
        plannedStartDate: new Date('2026-04-01'),
        plannedEndDate: new Date('2026-04-15'),
        notes: 'Mehrfamilienhaus Bergstraße'
      },
      {
        orderNumber: 'A-2026-003',
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        contactId: contacts[2]?.id || null,
        status: 'abgeschlossen',
        netTotal: '8900.00',
        vatAmount: '1691.00',
        grossTotal: '10591.00',
        orderDate: new Date('2025-11-10'),
        plannedStartDate: new Date('2025-12-01'),
        plannedEndDate: new Date('2025-12-20'),
        actualStartDate: new Date('2025-12-01'),
        actualEndDate: new Date('2025-12-18'),
        notes: 'Bürogebäude Westend - erfolgreich abgeschlossen'
      },
      {
        orderNumber: 'A-2026-004',
        projectId: projects[0]?.id || null,
        companyId: companies[3]?.id || null,
        contactId: contacts[3]?.id || null,
        status: 'in_vorbereitung',
        netTotal: '28000.00',
        vatAmount: '5320.00',
        grossTotal: '33320.00',
        orderDate: new Date('2026-02-01'),
        plannedStartDate: new Date('2026-05-01'),
        plannedEndDate: new Date('2026-06-30'),
        notes: 'Gewerbepark Ost - Vorbereitung läuft'
      },
      {
        orderNumber: 'A-2026-005',
        projectId: projects[1]?.id || null,
        companyId: companies[4]?.id || null,
        contactId: contacts[4]?.id || null,
        status: 'storniert',
        netTotal: '5500.00',
        vatAmount: '1045.00',
        grossTotal: '6545.00',
        orderDate: new Date('2026-01-05'),
        notes: 'Storniert wegen Eigentümerwechsel'
      }
    ];

    for (const order of orderData) {
      try {
        await connection.execute(
          `INSERT INTO orders (orderNumber, projectId, companyId, contactId, status, netTotal, vatAmount, grossTotal, orderDate, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [order.orderNumber, order.projectId, order.companyId, order.contactId, order.status, order.netTotal, order.vatAmount, order.grossTotal, order.orderDate, order.plannedStartDate || null, order.plannedEndDate || null, order.actualStartDate || null, order.actualEndDate || null, order.notes]
        );
      } catch (e) {
        console.log(`   ⚠️ Auftrag ${order.orderNumber} existiert bereits`);
      }
    }
    console.log('   ✅ 5 Aufträge eingefügt\n');

    // Hole die eingefügten Auftrags-IDs
    const [orders] = await connection.execute('SELECT id, orderNumber FROM orders LIMIT 5');

    // 3. Rechnungen einfügen
    console.log('💰 Füge Rechnungen ein...');
    const invoiceData = [
      {
        invoiceNumber: 'R-2026-001',
        orderId: orders[0]?.id || null,
        projectId: projects[0]?.id || null,
        companyId: companies[0]?.id || null,
        invoiceType: 'abschlagsrechnung',
        status: 'bezahlt',
        netTotal: '15000.00',
        vatAmount: '2850.00',
        grossTotal: '17850.00',
        invoiceDate: new Date('2026-01-20'),
        dueDate: new Date('2026-01-27'),
        paidDate: new Date('2026-01-25'),
        paidAmount: '17850.00',
        description: '1. Abschlagsrechnung - 30% nach Auftragserteilung'
      },
      {
        invoiceNumber: 'R-2026-002',
        orderId: orders[0]?.id || null,
        projectId: projects[0]?.id || null,
        companyId: companies[0]?.id || null,
        invoiceType: 'abschlagsrechnung',
        status: 'versendet',
        netTotal: '15000.00',
        vatAmount: '2850.00',
        grossTotal: '17850.00',
        invoiceDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-08'),
        description: '2. Abschlagsrechnung - 30% bei Arbeitsbeginn'
      },
      {
        invoiceNumber: 'R-2026-003',
        orderId: orders[2]?.id || null,
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        invoiceType: 'schlussrechnung',
        status: 'bezahlt',
        netTotal: '8900.00',
        vatAmount: '1691.00',
        grossTotal: '10591.00',
        invoiceDate: new Date('2025-12-20'),
        dueDate: new Date('2025-12-27'),
        paidDate: new Date('2025-12-24'),
        paidAmount: '10591.00',
        description: 'Schlussrechnung Bürogebäude Westend'
      },
      {
        invoiceNumber: 'R-2026-004',
        orderId: orders[1]?.id || null,
        projectId: projects[1]?.id || null,
        companyId: companies[1]?.id || null,
        invoiceType: 'abschlagsrechnung',
        status: 'ueberfaellig',
        netTotal: '4166.67',
        vatAmount: '791.67',
        grossTotal: '4958.34',
        invoiceDate: new Date('2026-01-10'),
        dueDate: new Date('2026-01-17'),
        description: '1. Abschlagsrechnung - ÜBERFÄLLIG seit 19 Tagen'
      },
      {
        invoiceNumber: 'R-2026-005',
        orderId: orders[3]?.id || null,
        projectId: projects[0]?.id || null,
        companyId: companies[3]?.id || null,
        invoiceType: 'abschlagsrechnung',
        status: 'entwurf',
        netTotal: '9333.33',
        vatAmount: '1773.33',
        grossTotal: '11106.66',
        invoiceDate: new Date('2026-02-05'),
        dueDate: new Date('2026-02-12'),
        description: '1. Abschlagsrechnung Gewerbepark Ost - Entwurf'
      }
    ];

    for (const invoice of invoiceData) {
      try {
        await connection.execute(
          `INSERT INTO invoices (invoiceNumber, orderId, projectId, companyId, invoiceType, status, netTotal, vatAmount, grossTotal, invoiceDate, dueDate, paidDate, paidAmount, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [invoice.invoiceNumber, invoice.orderId, invoice.projectId, invoice.companyId, invoice.invoiceType, invoice.status, invoice.netTotal, invoice.vatAmount, invoice.grossTotal, invoice.invoiceDate, invoice.dueDate, invoice.paidDate || null, invoice.paidAmount || null, invoice.description]
        );
      } catch (e) {
        console.log(`   ⚠️ Rechnung ${invoice.invoiceNumber} existiert bereits`);
      }
    }
    console.log('   ✅ 5 Rechnungen eingefügt\n');

    // Hole die eingefügten Rechnungs-IDs
    const [invoices] = await connection.execute('SELECT id, invoiceNumber FROM invoices LIMIT 5');

    // 4. Garantien einfügen
    console.log('🛡️ Füge Garantien ein...');
    const warrantyData = [
      {
        warrantyNumber: 'G-2026-001',
        orderId: orders[2]?.id || null,
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        propertyId: properties[0]?.id || null,
        warrantyType: 'algenfrei_garantie',
        status: 'aktiv',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2030-12-20'),
        durationYears: 5,
        certificateNumber: 'CERT-2025-001',
        notes: '5-Jahres Algenfrei-Garantie für Bürogebäude Westend'
      },
      {
        warrantyNumber: 'G-2026-002',
        orderId: orders[2]?.id || null,
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        propertyId: properties[1]?.id || null,
        warrantyType: 'ergebnisgarantie',
        status: 'aktiv',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2026-12-20'),
        durationYears: 1,
        certificateNumber: 'CERT-2025-002',
        notes: '1-Jahres Ergebnisgarantie'
      },
      {
        warrantyNumber: 'G-2023-015',
        orderId: null,
        projectId: projects[0]?.id || null,
        companyId: companies[0]?.id || null,
        propertyId: properties[2]?.id || null,
        warrantyType: 'algenfrei_garantie',
        status: 'abgelaufen',
        startDate: new Date('2018-06-15'),
        endDate: new Date('2023-06-15'),
        durationYears: 5,
        certificateNumber: 'CERT-2018-015',
        notes: 'Garantie abgelaufen - Erneuerung empfohlen'
      },
      {
        warrantyNumber: 'G-2024-008',
        orderId: null,
        projectId: projects[1]?.id || null,
        companyId: companies[1]?.id || null,
        propertyId: properties[3]?.id || null,
        warrantyType: 'algenfrei_garantie',
        status: 'beansprucht',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2029-03-10'),
        durationYears: 5,
        certificateNumber: 'CERT-2024-008',
        claimDate: new Date('2026-01-15'),
        claimDescription: 'Leichter Algenbefall an Nordseite nach 2 Jahren',
        notes: 'Garantiefall in Bearbeitung - Nachbesserung geplant'
      },
      {
        warrantyNumber: 'G-2022-042',
        orderId: null,
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        propertyId: properties[0]?.id || null,
        warrantyType: 'materialgarantie',
        status: 'erfuellt',
        startDate: new Date('2022-09-01'),
        endDate: new Date('2024-09-01'),
        durationYears: 2,
        certificateNumber: 'CERT-2022-042',
        claimDate: new Date('2023-05-20'),
        claimDescription: 'Materialfehler bei Imprägnierung',
        claimResolution: 'Kostenlose Nachbehandlung durchgeführt am 15.06.2023',
        notes: 'Garantiefall erfolgreich abgeschlossen'
      }
    ];

    for (const warranty of warrantyData) {
      try {
        await connection.execute(
          `INSERT INTO warranties (warrantyNumber, orderId, projectId, companyId, propertyId, warrantyType, status, startDate, endDate, durationYears, certificateNumber, claimDate, claimDescription, claimResolution, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [warranty.warrantyNumber, warranty.orderId, warranty.projectId, warranty.companyId, warranty.propertyId, warranty.warrantyType, warranty.status, warranty.startDate, warranty.endDate, warranty.durationYears, warranty.certificateNumber, warranty.claimDate || null, warranty.claimDescription || null, warranty.claimResolution || null, warranty.notes]
        );
      } catch (e) {
        console.log(`   ⚠️ Garantie ${warranty.warrantyNumber} existiert bereits`);
      }
    }
    console.log('   ✅ 5 Garantien eingefügt\n');

    // 5. Zahlungen einfügen
    console.log('💳 Füge Zahlungen ein...');
    const paymentData = [
      {
        paymentNumber: 'Z-2026-001',
        invoiceId: invoices[0]?.id || null,
        companyId: companies[0]?.id || null,
        amount: '17850.00',
        paymentMethod: 'ueberweisung',
        status: 'eingegangen',
        paymentDate: new Date('2026-01-25'),
        reference: 'R-2026-001 / Sonnenhof 1. AR',
        notes: 'Zahlung pünktlich eingegangen'
      },
      {
        paymentNumber: 'Z-2025-089',
        invoiceId: invoices[2]?.id || null,
        companyId: companies[2]?.id || null,
        amount: '10591.00',
        paymentMethod: 'ueberweisung',
        status: 'eingegangen',
        paymentDate: new Date('2025-12-24'),
        reference: 'R-2026-003 / Westend SR',
        notes: 'Schlussrechnung bezahlt'
      },
      {
        paymentNumber: 'Z-2026-002',
        invoiceId: invoices[1]?.id || null,
        companyId: companies[0]?.id || null,
        amount: '17850.00',
        paymentMethod: 'ueberweisung',
        status: 'ausstehend',
        expectedDate: new Date('2026-02-08'),
        reference: 'R-2026-002 / Sonnenhof 2. AR',
        notes: 'Fällig am 08.02.2026'
      },
      {
        paymentNumber: 'Z-2026-003',
        invoiceId: invoices[3]?.id || null,
        companyId: companies[1]?.id || null,
        amount: '4958.34',
        paymentMethod: 'ueberweisung',
        status: 'ausstehend',
        expectedDate: new Date('2026-01-17'),
        reference: 'R-2026-004 / Bergstraße 1. AR',
        notes: 'ÜBERFÄLLIG - Mahnung versenden'
      },
      {
        paymentNumber: 'Z-2025-045',
        invoiceId: null,
        companyId: companies[3]?.id || null,
        amount: '500.00',
        paymentMethod: 'bar',
        status: 'eingegangen',
        paymentDate: new Date('2025-11-15'),
        reference: 'Anzahlung Gewerbepark',
        notes: 'Baranzahlung bei Vertragsunterzeichnung'
      }
    ];

    for (const payment of paymentData) {
      try {
        await connection.execute(
          `INSERT INTO payments (paymentNumber, invoiceId, companyId, amount, paymentMethod, status, paymentDate, expectedDate, reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [payment.paymentNumber, payment.invoiceId, payment.companyId, payment.amount, payment.paymentMethod, payment.status, payment.paymentDate || null, payment.expectedDate || null, payment.reference, payment.notes]
        );
      } catch (e) {
        console.log(`   ⚠️ Zahlung ${payment.paymentNumber} existiert bereits`);
      }
    }
    console.log('   ✅ 5 Zahlungen eingefügt\n');

    // 6. Budgets einfügen
    console.log('📊 Füge Budgets ein...');
    const budgetData = [
      {
        name: 'Projekt Sonnenhof 2026',
        projectId: projects[0]?.id || null,
        category: 'projekt',
        plannedAmount: '53550.00',
        actualAmount: '17850.00',
        status: 'aktiv',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        notes: 'Budget für Wohnanlage Sonnenhof - 33% verbraucht'
      },
      {
        name: 'Marketing Q1 2026',
        projectId: null,
        category: 'marketing',
        plannedAmount: '15000.00',
        actualAmount: '4500.00',
        status: 'aktiv',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        notes: 'Quartalbudget Marketing - 30% verbraucht'
      },
      {
        name: 'Geräte & Wartung 2026',
        projectId: null,
        category: 'material',
        plannedAmount: '25000.00',
        actualAmount: '8200.00',
        status: 'aktiv',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        notes: 'Jahresbudget für Geräte und Wartung'
      }
    ];

    for (const budget of budgetData) {
      try {
        await connection.execute(
          `INSERT INTO budgets (name, projectId, category, plannedAmount, actualAmount, status, startDate, endDate, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE actualAmount = VALUES(actualAmount)`,
          [budget.name, budget.projectId, budget.category, budget.plannedAmount, budget.actualAmount, budget.status, budget.startDate, budget.endDate, budget.notes]
        );
      } catch (e) {
        console.log(`   ⚠️ Budget ${budget.name} existiert bereits`);
      }
    }
    console.log('   ✅ 3 Budgets eingefügt\n');

    // 7. Termine einfügen
    console.log('📅 Füge Termine ein...');
    const appointmentData = [
      {
        title: 'Baustellenbegehung Sonnenhof',
        appointmentType: 'baustellenbegehung',
        projectId: projects[0]?.id || null,
        companyId: companies[0]?.id || null,
        contactId: contacts[0]?.id || null,
        startTime: new Date('2026-02-10T09:00:00'),
        endTime: new Date('2026-02-10T11:00:00'),
        location: 'Sonnenhofweg 1-12, 12345 Musterstadt',
        status: 'bestaetigt',
        notes: 'Wöchentliche Baustellenbegehung mit Auftraggeber'
      },
      {
        title: 'Objektbesichtigung Neukunde',
        appointmentType: 'besichtigung',
        projectId: null,
        companyId: companies[4]?.id || null,
        contactId: contacts[4]?.id || null,
        startTime: new Date('2026-02-07T14:00:00'),
        endTime: new Date('2026-02-07T15:30:00'),
        location: 'Hauptstraße 42, 10115 Berlin',
        status: 'bestaetigt',
        notes: 'Erstbesichtigung für potentielles Neugeschäft'
      },
      {
        title: 'Abnahme Bürogebäude Westend',
        appointmentType: 'abnahme',
        projectId: projects[2]?.id || null,
        companyId: companies[2]?.id || null,
        contactId: contacts[2]?.id || null,
        startTime: new Date('2026-02-12T10:00:00'),
        endTime: new Date('2026-02-12T12:00:00'),
        location: 'Westendstraße 45, 60325 Frankfurt',
        status: 'geplant',
        notes: 'Finale Abnahme nach Garantiefall-Nachbesserung'
      },
      {
        title: 'Kundenbesprechung Gewerbepark',
        appointmentType: 'kundenbesprechung',
        projectId: projects[0]?.id || null,
        companyId: companies[3]?.id || null,
        contactId: contacts[3]?.id || null,
        startTime: new Date('2026-02-06T11:00:00'),
        endTime: new Date('2026-02-06T12:00:00'),
        location: 'Online (Teams)',
        status: 'bestaetigt',
        notes: 'Besprechung Projektstart und Zeitplanung'
      },
      {
        title: 'Garantie-Inspektion Bergstraße',
        appointmentType: 'inspektion',
        projectId: projects[1]?.id || null,
        companyId: companies[1]?.id || null,
        contactId: contacts[1]?.id || null,
        startTime: new Date('2026-02-20T09:00:00'),
        endTime: new Date('2026-02-20T10:00:00'),
        location: 'Bergstraße 10-20, 04103 Leipzig',
        status: 'geplant',
        notes: 'Jährliche Garantie-Inspektion'
      }
    ];

    for (const appointment of appointmentData) {
      try {
        await connection.execute(
          `INSERT INTO appointments (title, appointmentType, projectId, companyId, contactId, startTime, endTime, location, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [appointment.title, appointment.appointmentType, appointment.projectId, appointment.companyId, appointment.contactId, appointment.startTime, appointment.endTime, appointment.location, appointment.status, appointment.notes]
        );
      } catch (e) {
        console.log(`   ⚠️ Termin "${appointment.title}" existiert bereits`);
      }
    }
    console.log('   ✅ 5 Termine eingefügt\n');

    // 8. Kundenmeldungen einfügen
    console.log('📢 Füge Kundenmeldungen ein...');
    const customerReportData = [
      {
        reportNumber: 'KM-2026-001',
        companyId: companies[1]?.id || null,
        contactId: contacts[1]?.id || null,
        projectId: projects[1]?.id || null,
        reportType: 'reklamation',
        status: 'in_bearbeitung',
        priority: 'hoch',
        subject: 'Algenbefall nach 2 Jahren',
        description: 'An der Nordseite des Gebäudes Bergstraße 15 ist erneut leichter Algenbefall sichtbar. Bitte um Prüfung im Rahmen der Garantie.',
        assignedToId: users[0]?.id || null,
        createdAt: new Date('2026-01-15')
      },
      {
        reportNumber: 'KM-2026-002',
        companyId: companies[0]?.id || null,
        contactId: contacts[0]?.id || null,
        projectId: projects[0]?.id || null,
        reportType: 'anfrage',
        status: 'neu',
        priority: 'mittel',
        subject: 'Zusätzliche Reinigung Tiefgarage',
        description: 'Anfrage zur Erweiterung des Auftrags um die Reinigung der Tiefgarageneinfahrt.',
        assignedToId: null,
        createdAt: new Date('2026-02-03')
      },
      {
        reportNumber: 'KM-2026-003',
        companyId: companies[2]?.id || null,
        contactId: contacts[2]?.id || null,
        projectId: projects[2]?.id || null,
        reportType: 'lob',
        status: 'geschlossen',
        priority: 'niedrig',
        subject: 'Hervorragende Arbeit',
        description: 'Wir möchten uns für die professionelle und saubere Arbeit bedanken. Das Ergebnis übertrifft unsere Erwartungen.',
        resolution: 'Dankesschreiben an Team weitergeleitet. Referenz für Marketing angefragt.',
        assignedToId: users[0]?.id || null,
        createdAt: new Date('2025-12-22'),
        resolvedAt: new Date('2025-12-23')
      }
    ];

    for (const report of customerReportData) {
      try {
        await connection.execute(
          `INSERT INTO customer_reports (reportNumber, companyId, contactId, projectId, reportType, status, priority, subject, description, resolution, assignedToId, createdAt, resolvedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [report.reportNumber, report.companyId, report.contactId, report.projectId, report.reportType, report.status, report.priority, report.subject, report.description, report.resolution || null, report.assignedToId, report.createdAt, report.resolvedAt || null]
        );
      } catch (e) {
        console.log(`   ⚠️ Kundenmeldung ${report.reportNumber} existiert bereits`);
      }
    }
    console.log('   ✅ 3 Kundenmeldungen eingefügt\n');

    // 9. Teammitglieder einfügen
    console.log('👥 Füge Teammitglieder ein...');
    const teamMemberData = [
      {
        oderId: users[0]?.id || null,
        department: 'geschaeftsfuehrung',
        position: 'Geschäftsführer',
        phone: '+49 170 1234567',
        skills: 'Projektmanagement, Vertrieb, Strategie',
        status: 'aktiv',
        startDate: new Date('2020-01-01')
      },
      {
        oderId: users[1]?.id || null,
        department: 'vertrieb',
        position: 'Kundenberater',
        phone: '+49 170 2345678',
        skills: 'Kundenberatung, Angebotserstellung, HubSpot',
        status: 'aktiv',
        startDate: new Date('2022-03-15')
      },
      {
        oderId: users[2]?.id || null,
        department: 'technik',
        position: 'Projektleiter',
        phone: '+49 170 3456789',
        skills: 'Projektleitung, Baustellenmanagement, Qualitätskontrolle',
        status: 'aktiv',
        startDate: new Date('2021-06-01')
      }
    ];

    // Nur einfügen wenn users existieren
    if (users.length > 0) {
      for (let i = 0; i < Math.min(teamMemberData.length, users.length); i++) {
        const member = teamMemberData[i];
        try {
          await connection.execute(
            `INSERT INTO team_members (userId, department, position, phone, skills, status, startDate)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [users[i]?.id, member.department, member.position, member.phone, member.skills, member.status, member.startDate]
          );
        } catch (e) {
          console.log(`   ⚠️ Teammitglied existiert bereits`);
        }
      }
      console.log(`   ✅ ${Math.min(teamMemberData.length, users.length)} Teammitglieder eingefügt\n`);
    } else {
      console.log('   ⚠️ Keine Benutzer gefunden - Teammitglieder übersprungen\n');
    }

    // Zusammenfassung
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ TESTDATEN-SEED ABGESCHLOSSEN');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('Eingefügte Datensätze:');
    console.log('  • 5 Aufträge (verschiedene Status)');
    console.log('  • 5 Rechnungen (bezahlt, offen, überfällig)');
    console.log('  • 5 Garantien (aktiv, abgelaufen, beansprucht)');
    console.log('  • 5 Zahlungen');
    console.log('  • 3 Budgets');
    console.log('  • 5 Termine');
    console.log('  • 3 Kundenmeldungen');
    console.log('  • 3 Teammitglieder');
    console.log('');

  } catch (error) {
    console.error('❌ Fehler beim Seed:', error);
  } finally {
    await connection.end();
  }
}

seedTestData();
