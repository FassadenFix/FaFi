/**
 * TXT-02: Seeding der 14 HubSpot-Textbausteine
 * Kategorien: Anschreiben, Bedingungen, Fußnoten, Leistungsbeschreibung
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const TEXTBAUSTEINE = [
  // Anschreiben (4 Varianten)
  {
    kategorie: 'anschreiben',
    titel: 'Standard-Anschreiben Hausverwaltung',
    inhalt: `Sehr geehrte Damen und Herren,

vielen Dank für Ihr Interesse an unseren Leistungen im Bereich der professionellen Fassadenreinigung. Gerne unterbreiten wir Ihnen nachfolgendes Angebot für die Reinigung der Fassadenflächen an den genannten Objekten.

Als Spezialist für schonende und nachhaltige Fassadenreinigung setzen wir auf umweltfreundliche Reinigungsverfahren, die Ihre Fassade langfristig schützen und den Wert Ihrer Immobilie erhalten.`,
    sortierung: 1,
    tags: ['hausverwaltung', 'standard'],
  },
  {
    kategorie: 'anschreiben',
    titel: 'Anschreiben Wohnungsgenossenschaft',
    inhalt: `Sehr geehrte Damen und Herren,

wir bedanken uns herzlich für die Möglichkeit, Ihnen ein Angebot für die professionelle Fassadenreinigung Ihrer Wohnanlage unterbreiten zu dürfen. Nach eingehender Besichtigung und Begutachtung der Fassadenflächen haben wir folgendes Leistungspaket für Sie zusammengestellt.

Unser Ziel ist es, Ihren Bewohnern ein gepflegtes und ansprechendes Wohnumfeld zu bieten – nachhaltig, schonend und zu fairen Konditionen.`,
    sortierung: 2,
    tags: ['genossenschaft', 'wohnanlage'],
  },
  {
    kategorie: 'anschreiben',
    titel: 'Anschreiben Gewerbe/Industrie',
    inhalt: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage zur professionellen Reinigung Ihrer Gewerbefassade. Als erfahrener Partner für Fassadenreinigung im gewerblichen Bereich wissen wir um die besonderen Anforderungen an Sauberkeit und Repräsentativität Ihrer Geschäftsräume.

Nachfolgend finden Sie unser detailliertes Angebot, das speziell auf die Gegebenheiten Ihres Objekts abgestimmt ist.`,
    sortierung: 3,
    tags: ['gewerbe', 'industrie'],
  },
  {
    kategorie: 'anschreiben',
    titel: 'Anschreiben Nachfass/Erinnerung',
    inhalt: `Sehr geehrte Damen und Herren,

wir möchten uns in Erinnerung bringen und Bezug auf unser kürzlich übersandtes Angebot nehmen. Gerne stehen wir Ihnen für Rückfragen zur Verfügung und würden uns freuen, Sie von unserer Arbeit überzeugen zu dürfen.

Sollten sich seit unserer letzten Besichtigung Änderungen ergeben haben, passen wir unser Angebot selbstverständlich gerne an.`,
    sortierung: 4,
    tags: ['nachfass', 'erinnerung'],
  },

  // Bedingungen (4 Varianten)
  {
    kategorie: 'bedingungen',
    titel: 'Standard-Bedingungen',
    inhalt: `• Angebotsgültigkeit: 30 Tage ab Angebotsdatum
• Zahlungsbedingungen: 14 Tage netto nach Rechnungsstellung
• Ausführungszeitraum: Nach Vereinbarung, abhängig von Witterung
• Mindesttemperatur: +5°C für optimale Reinigungsergebnisse
• Wasseranschluss und Stromanschluss müssen bauseits gestellt werden
• Stellfläche für Hubarbeitsbühne muss frei zugänglich sein`,
    sortierung: 1,
    tags: ['standard'],
  },
  {
    kategorie: 'bedingungen',
    titel: 'Erweiterte Bedingungen (Großprojekt)',
    inhalt: `• Angebotsgültigkeit: 60 Tage ab Angebotsdatum
• Zahlungsbedingungen: 30% Anzahlung bei Auftragserteilung, 70% nach Abnahme
• Ausführungszeitraum: Gemäß Bauzeitenplan, witterungsabhängig
• Mindesttemperatur: +5°C, Windstärke max. 6 Beaufort
• Wasser- und Stromanschluss bauseits, Wasserverbrauch ca. 500l/Tag
• Stellflächen für Hubarbeitsbühnen müssen frei und tragfähig sein
• Bewohnerinformation erfolgt durch FassadenFix (Aushang 7 Tage vorher)
• Abnahme erfolgt gemeinsam mit Auftraggeber`,
    sortierung: 2,
    tags: ['großprojekt', 'erweitert'],
  },
  {
    kategorie: 'bedingungen',
    titel: 'Bedingungen mit Frühbucher-Rabatt',
    inhalt: `• Angebotsgültigkeit: 14 Tage ab Angebotsdatum (Frühbucher-Aktion)
• Frühbucher-Rabatt: 10% bei Beauftragung innerhalb der Angebotsfrist
• Zahlungsbedingungen: 14 Tage netto nach Rechnungsstellung
• Ausführungszeitraum: Flexibel nach Absprache im vereinbarten Quartal
• Wasseranschluss und Stromanschluss müssen bauseits gestellt werden
• Bei Beauftragung nach Ablauf der Frist gilt der reguläre Preis`,
    sortierung: 3,
    tags: ['frühbucher', 'rabatt'],
  },
  {
    kategorie: 'bedingungen',
    titel: 'Bedingungen Wartungsvertrag',
    inhalt: `• Vertragslaufzeit: 3 Jahre mit jährlicher Reinigung
• Preisstabilität: Festpreis für die gesamte Vertragslaufzeit
• Zahlungsbedingungen: Jährliche Abrechnung, 14 Tage netto
• Terminierung: Automatische Planung im optimalen Reinigungszeitraum
• Kostenlose Nachbesichtigung 6 Monate nach Reinigung
• Kündigungsfrist: 3 Monate zum Vertragsende`,
    sortierung: 4,
    tags: ['wartungsvertrag', 'langzeit'],
  },

  // Fußnoten (3 Varianten)
  {
    kategorie: 'fussnoten',
    titel: 'Standard-Fußnote',
    inhalt: `Alle Preise verstehen sich zzgl. der gesetzlichen MwSt. von 19%. Die Reinigung erfolgt nach dem aktuellen Stand der Technik unter Verwendung umweltverträglicher Reinigungsmittel. Eine Gewährleistung von 24 Monaten auf die durchgeführten Arbeiten ist im Preis enthalten.`,
    sortierung: 1,
    tags: ['standard'],
  },
  {
    kategorie: 'fussnoten',
    titel: 'Fußnote mit Garantie-Hinweis',
    inhalt: `Alle Preise verstehen sich zzgl. der gesetzlichen MwSt. von 19%. Auf die durchgeführten Reinigungsarbeiten gewähren wir eine Garantie von 24 Monaten. Sollten innerhalb dieses Zeitraums erneut Verschmutzungen auftreten, die auf unsere Arbeit zurückzuführen sind, beseitigen wir diese kostenfrei. Die FassadenFix Garantieurkunde wird nach erfolgreicher Abnahme ausgestellt.`,
    sortierung: 2,
    tags: ['garantie'],
  },
  {
    kategorie: 'fussnoten',
    titel: 'Fußnote mit Versicherungshinweis',
    inhalt: `Alle Preise verstehen sich zzgl. der gesetzlichen MwSt. von 19%. FassadenFix ist umfassend betriebshaftpflichtversichert (Deckungssumme 5 Mio. €). Sämtliche Mitarbeiter sind sozialversicherungspflichtig beschäftigt. Wir arbeiten ausschließlich mit eigenen, geschulten Fachkräften – ohne Subunternehmer.`,
    sortierung: 3,
    tags: ['versicherung', 'sicherheit'],
  },

  // Leistungsbeschreibung (3 Varianten)
  {
    kategorie: 'leistungsbeschreibung',
    titel: 'Leistungsbeschreibung WDVS-Reinigung',
    inhalt: `Die Fassadenreinigung umfasst folgende Leistungen:
1. Vorbehandlung: Aufbringen eines biologisch abbaubaren Spezialreinigers auf die betroffenen Fassadenflächen
2. Einwirkzeit: Kontrollierte Einwirkphase des Reinigers (je nach Verschmutzungsgrad 30-60 Minuten)
3. Reinigung: Schonende Niederdruckreinigung mit max. 60 bar (WDVS-geeignet)
4. Nachbehandlung: Auftragen eines Langzeitschutzes gegen erneuten Algen- und Pilzbefall
5. Dokumentation: Vorher/Nachher-Fotodokumentation aller gereinigten Flächen`,
    sortierung: 1,
    tags: ['wdvs', 'algen', 'standard'],
  },
  {
    kategorie: 'leistungsbeschreibung',
    titel: 'Leistungsbeschreibung Klinker-Reinigung',
    inhalt: `Die Klinker-Fassadenreinigung umfasst folgende Leistungen:
1. Analyse: Bestimmung des Verschmutzungstyps und Auswahl des geeigneten Reinigungsverfahrens
2. Vorbehandlung: Aufbringen eines klinkergeeigneten Spezialreinigers
3. Reinigung: Hochdruckreinigung mit angepasstem Druck (bis 150 bar) und Flachstrahldüse
4. Fugenpflege: Kontrolle und ggf. Nachbehandlung der Fugen
5. Imprägnierung: Optional – Hydrophobierung zum Schutz vor Feuchtigkeit
6. Dokumentation: Vorher/Nachher-Fotodokumentation`,
    sortierung: 2,
    tags: ['klinker', 'hochdruck'],
  },
  {
    kategorie: 'leistungsbeschreibung',
    titel: 'Leistungsbeschreibung Graffiti-Entfernung',
    inhalt: `Die Graffiti-Entfernung umfasst folgende Leistungen:
1. Analyse: Bestimmung des Untergrunds und der verwendeten Farben/Lacke
2. Testfläche: Anlegen einer Probefläche zur Ermittlung des optimalen Verfahrens
3. Entfernung: Fachgerechte Entfernung mittels Spezialchemie und/oder Heißdampf
4. Nachbehandlung: Reinigung der behandelten Fläche
5. Graffiti-Schutz: Auftragen eines Opferschicht-Systems für künftigen Schutz
6. Dokumentation: Vorher/Nachher-Fotodokumentation`,
    sortierung: 3,
    tags: ['graffiti', 'spezial'],
  },
];

async function seed() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Seeding Textbausteine...');
  
  for (const tb of TEXTBAUSTEINE) {
    await conn.execute(
      `INSERT INTO textbausteine (kategorie, titel, inhalt, sortierung, aktiv, tags, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, true, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE inhalt = VALUES(inhalt), sortierung = VALUES(sortierung), tags = VALUES(tags), updatedAt = NOW()`,
      [tb.kategorie, tb.titel, tb.inhalt, tb.sortierung, JSON.stringify(tb.tags)]
    );
    console.log(`  ✓ ${tb.kategorie}: ${tb.titel}`);
  }
  
  const [rows] = await conn.execute('SELECT COUNT(*) as count FROM textbausteine');
  console.log(`\nGesamt: ${rows[0].count} Textbausteine in DB`);
  
  await conn.end();
}

seed().catch(console.error);
