// Seed-Script: 14 HubSpot-Textbausteine aus dem Produktkatalog
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Zuerst bestehende Textbausteine löschen (falls vorhanden)
await conn.execute('DELETE FROM text_blocks');
console.log('Bestehende Textbausteine gelöscht');

const textbausteine = [
  {
    name: 'Anschreiben Standard',
    category: 'einleitung',
    content: `Sehr geehrte/r {{contact.salutation}} {{contact.lastname}},

bezugnehmend auf unser Gespräch und die Besichtigung Ihres Objektes übersenden wir Ihnen unser Angebot für die Fassadenreinigung.

Wir setzen ausschließlich umweltverträgliche Reinigungsmittel ein und garantieren eine schonende Behandlung Ihrer Fassade. Die Arbeiten werden von unserem erfahrenen Fachpersonal termingerecht ausgeführt.`,
    placeholders: JSON.stringify(['contact.salutation', 'contact.lastname']),
    sortOrder: 1,
  },
  {
    name: 'Anschreiben Bestandskunde',
    category: 'einleitung',
    content: `Sehr geehrte/r {{contact.salutation}} {{contact.lastname}},

wir bedanken uns für Ihr erneutes Vertrauen und freuen uns, Ihnen auch in diesem Jahr ein Angebot für die Fassadenreinigung unterbreiten zu dürfen.

Wie gewohnt setzen wir auf höchste Qualität und termingerechte Ausführung. Gerne berücksichtigen wir dabei Ihre bisherigen Erfahrungen und Wünsche.`,
    placeholders: JSON.stringify(['contact.salutation', 'contact.lastname']),
    sortOrder: 2,
  },
  {
    name: 'Anschreiben Graffiti',
    category: 'einleitung',
    content: `Sehr geehrte/r {{contact.salutation}} {{contact.lastname}},

bezugnehmend auf Ihre Anfrage zur Graffitientfernung an Ihrem Objekt übersenden wir Ihnen unser Angebot.

Wir setzen ausschließlich umweltverträgliche Reinigungsmittel ein und garantieren eine schonende Behandlung des Untergrundes. Nach der Entfernung empfehlen wir optional einen Graffitischutz aufzutragen.`,
    placeholders: JSON.stringify(['contact.salutation', 'contact.lastname']),
    sortOrder: 3,
  },
  {
    name: 'Anschreiben Großprojekt',
    category: 'einleitung',
    content: `Sehr geehrte Damen und Herren,

wir bedanken uns für die Möglichkeit, Ihnen ein Angebot für die umfangreichen Fassadenarbeiten unterbreiten zu dürfen.

Nach eingehender Begutachtung und Aufmaß vor Ort haben wir den Leistungsumfang detailliert ermittelt. Die nachfolgend aufgeführten Arbeiten werden von unserem erfahrenen Fachpersonal termingerecht und in höchster Qualität ausgeführt.`,
    placeholders: JSON.stringify([]),
    sortOrder: 4,
  },
  {
    name: 'Anschreiben Sanierung',
    category: 'einleitung',
    content: `Sehr geehrte/r {{contact.salutation}} {{contact.lastname}},

wie besprochen übersenden wir Ihnen unser Angebot für die Fassadensanierung an Ihrem Objekt.

Unsere qualifizierten Mitarbeiter verfügen über langjährige Erfahrung in der Fassadensanierung und setzen ausschließlich hochwertige Materialien namhafter Hersteller ein.`,
    placeholders: JSON.stringify(['contact.salutation', 'contact.lastname']),
    sortOrder: 5,
  },
  {
    name: 'Zusammenfassung Standard',
    category: 'abschluss',
    content: `Zusammenfassung der Leistungen:

Die oben aufgeführten Arbeiten werden fachgerecht und termingerecht ausgeführt. Die Gewährleistungsfrist beträgt 2 Jahre ab Abnahme.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.`,
    placeholders: JSON.stringify([]),
    sortOrder: 6,
  },
  {
    name: 'Zusammenfassung mit Termin',
    category: 'abschluss',
    content: `Zusammenfassung der Leistungen:

Die oben aufgeführten Arbeiten werden fachgerecht ausgeführt. Der voraussichtliche Ausführungszeitraum beträgt {{quote.custom.ausfuehrungszeitraum}}.

Die Gewährleistungsfrist beträgt 2 Jahre ab Abnahme.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.`,
    placeholders: JSON.stringify(['quote.custom.ausfuehrungszeitraum']),
    sortOrder: 7,
  },
  {
    name: 'Zahlungsbedingungen Standard',
    category: 'konditionen',
    content: `Zahlungsbedingungen:
• Zahlbar innerhalb von 14 Tagen nach Rechnungsstellung netto
• Bei Aufträgen über 10.000 €: 30% Anzahlung bei Auftragserteilung
• Skonto: 2% bei Zahlung innerhalb von 7 Tagen

Gewährleistung:
• 2 Jahre auf alle ausgeführten Arbeiten gemäß VOB/B
• Ausgenommen sind Schäden durch unsachgemäße Nutzung oder höhere Gewalt`,
    placeholders: JSON.stringify([]),
    sortOrder: 8,
  },
  {
    name: 'Zahlungsbedingungen Großprojekt',
    category: 'konditionen',
    content: `Zahlungsbedingungen für Großprojekte:
• 30% Anzahlung bei Auftragserteilung
• 40% nach Abschluss der Hauptarbeiten (Zwischenrechnung)
• 30% nach Abnahme und Fertigstellung

Gewährleistung:
• 2 Jahre auf alle ausgeführten Arbeiten gemäß VOB/B
• Ausgenommen sind Schäden durch unsachgemäße Nutzung oder höhere Gewalt`,
    placeholders: JSON.stringify([]),
    sortOrder: 9,
  },
  {
    name: 'Gerüst-Hinweis',
    category: 'sonstiges',
    content: `Hinweis zur Gerüststellung:

Das Gerüst wird von unserem zertifizierten Partner gemäß DIN EN 12810/12811 aufgestellt und geprüft. Die Gerüststandzeit ist im Angebotspreis für max. 4 Wochen kalkuliert. Jede weitere Woche wird mit 2,50 €/lfd.m berechnet.

Die Verankerung erfolgt nach den Vorgaben des Gerüstbauers. Eventuell notwendige Bohrlöcher werden nach Abbau fachgerecht verschlossen.`,
    placeholders: JSON.stringify([]),
    sortOrder: 10,
  },
  {
    name: 'Ausführungshinweis Wetter',
    category: 'sonstiges',
    content: `Hinweis zur Ausführung:

Die Arbeiten können nur bei geeigneten Witterungsbedingungen durchgeführt werden (kein Regen, Temperaturen über 5°C). Bei ungünstiger Witterung kann es zu Verzögerungen kommen, die nicht zu unseren Lasten gehen.`,
    placeholders: JSON.stringify([]),
    sortOrder: 11,
  },
  {
    name: 'Ausführungshinweis Denkmal',
    category: 'sonstiges',
    content: `Hinweis Denkmalschutz:

Das Objekt steht unter Denkmalschutz. Alle Arbeiten werden nach den Vorgaben der zuständigen Denkmalschutzbehörde ausgeführt. Eventuell erforderliche Genehmigungen sind vom Auftraggeber einzuholen.`,
    placeholders: JSON.stringify([]),
    sortOrder: 12,
  },
  {
    name: 'AGB-Verweis',
    category: 'konditionen',
    content: `Es gelten unsere Allgemeinen Geschäftsbedingungen (siehe Anhang). Mit Annahme dieses Angebots erkennen Sie diese als verbindlich an.

Dieses Angebot ist {{quote.hs_expiration_date}} gültig.`,
    placeholders: JSON.stringify(['quote.hs_expiration_date']),
    sortOrder: 13,
  },
  {
    name: 'Abschluss freundlich',
    category: 'abschluss',
    content: `Wir würden uns freuen, den Auftrag für Sie ausführen zu dürfen und stehen für Rückfragen jederzeit zur Verfügung.

Mit freundlichen Grüßen
Alexander Retzlaff
FassadenFix`,
    placeholders: JSON.stringify([]),
    sortOrder: 14,
  },
];

// Mapping der Kategorien auf die DB-Enum-Werte
const categoryMap = {
  'einleitung': 'einleitung',
  'abschluss': 'abschluss',
  'konditionen': 'konditionen',
  'sonstiges': 'sonstiges',
};

let inserted = 0;
for (const tb of textbausteine) {
  const cat = categoryMap[tb.category] || 'sonstiges';
  await conn.execute(
    `INSERT INTO text_blocks (name, category, content, placeholders, isActive, usageCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 1, 0, NOW(), NOW())`,
    [tb.name, cat, tb.content, tb.placeholders]
  );
  inserted++;
  console.log(`✅ ${tb.name} (${cat})`);
}

console.log(`\n✅ ${inserted} Textbausteine eingefügt`);
await conn.end();
process.exit(0);
