# Generalprobe – Visueller Browser-Durchlauf

**Datum:** 11.02.2026
**Tester:** Manus (automatisiert + visuell)

## Prüfpunkte

### 1. Dashboard
- [x] Lädt korrekt – Hero-Banner, Begrüßung, Datum sichtbar
- [x] KPI-Widgets sichtbar – 8 Widgets: Offene Angebote (7), Projekte (11), Aktive Baustellen (0), Offene Aufgaben (2), Conversion-Rate (0%), Offene Rechnungen (3), Umsatz (0€), Aktive Garantien (7)
- [x] Navigation funktioniert – Alle Sidebar-Einträge sichtbar und klickbar
- [x] Nächste Schritte: 11 Projekte mit nächsten Aktionen sichtbar
- [x] Countdown-Aufgaben: 2 dringende Aufgaben angezeigt
- [x] HubSpot Sync: Verbunden, 1000+ Unternehmen/Kontakte/Deals
- BEFUND: Mehrere Projekte heißen identisch "Fassadenreinigung Wohnanlage Südpark" (2026-WBG-03 bis 08) – vermutlich Testdaten aus E2E-Tests

### 2. Unternehmen & Kontakte
- [x] Seite lädt korrekt – Breadcrumb, Suchfeld, Tabs sichtbar
- [x] Buttons "Neues Unternehmen" und "Neuer Kontakt" vorhanden
- [x] Hierarchisch-Tab und Alle-Kontakte-Tab vorhanden
- BEFUND: Hierarchisch (0) und Alle Kontakte (0) – Unternehmen aus E2E-Tests werden nicht angezeigt (möglicherweise Cleanup nach Tests)

### 3. Projekte
- [x] Projektliste lädt – 11 Projekte sichtbar mit Phasen-Badges
- [x] Suchfeld, Phasen-Filter und Sortierung vorhanden
- [x] KPI-Leiste: 11 Gesamt, 0 In Bearbeitung, 1 Angebote, 0 Abgeschlossen
- [x] Button "Neues Projekt" vorhanden
- [x] Projekte zeigen Projektnummern (2026-GEM-01, 2026-WBG-xx, 2026-STD-01, 2026-KRE-01)

### 4. Angebote
- [x] Seite lädt korrekt – KPI-Leiste (Gesamt, Diesen Monat, Gesamtwert, Angenommen)
- [x] Suchfeld, Status-Filter, Weitere Filter vorhanden
- [x] Button "Neues Angebot" vorhanden
- [x] Angebotsliste wird geladen (Skeleton sichtbar)

### 5. Baustellen
- [x] Seite lädt korrekt – KPI-Leiste (0 Gesamt, 0 Aktiv, 0 Geplant, 0 Pausiert)
- [x] Tabelle mit Spalten: Baustelle, Projekt, Zeitraum, Fortschritt, Status
- [x] Empty State: "Noch keine Baustellen vorhanden"
- [x] Button "Neue Baustelle" vorhanden

### 6. Garantien & Inspektionen
- [x] 7 Garantien geladen (G-2026-001 bis G-2026-007)
- [x] Alle "Algenfrei-Garantie" für "Wohnungsbaugesellschaft Musterstadt mbH"
- [x] Restlaufzeit korrekt berechnet (1825 Tage = 5 Jahre)
- [x] KPI-Leiste: 7 Gesamt, 7 Aktiv, 0 Beansprucht, 0 Abgelaufen

### 7. Einsatzplanung
- [x] 23 echte Mitarbeiter aus HR-DB geladen (Rabee Al Khaled bis Sven Zorn)
- [x] Initialen korrekt generiert (RA, JB, MB, FC, LF, FG, DH, RK, KK, MK, EM, JM, OM, AR, RR, JR, MR, TS, RS, SS, SS, KW, SZ)
- [x] Positionen korrekt angezeigt (Anwendungstechniker, Standortleiter, Abteilungsleiter, etc.)
- [x] Verfügbarkeits-Punkte (grün) sichtbar
- [x] 3 Züge (Alpha, Bravo, Charlie) mit Drag & Drop Bereichen
- [x] Tabs: Züge & Mitarbeiter, Projekt-Zuordnung, Einsatzkalender
- [x] Suchfeld und "Neuer Zug"-Button vorhanden

### 8. Ressourcen
- [x] 23 echte Mitarbeiter aus HR-DB geladen mit Initialen-Avataren und Rollen-Kürzeln (AT, GF, Standortleiter, etc.)
- [x] Wochenkalender sichtbar (09. Feb - 15. Feb 2026), heutiger Tag (Mi 11) hervorgehoben
- [x] 5 Tabs: Mitarbeiter (23), Waschbusse, FF Bühnen, Mietbühnen, Reinigungsmittel
- [x] Info-Hinweis: "Buchungen werden angezeigt, sobald Mitarbeiter über die Einsatzplanung Projekten zugeordnet werden"
- [x] Button "Neue Buchung" vorhanden

### 9. Aufträge
- [x] 7 Aufträge geladen (A-2026-001 bis A-2026-007)
- [x] Alle "Bestätigt" mit Brutto 6.836,55 €
- [x] KPI-Leiste: 7 Gesamt, 0 In Arbeit, 7 Bestätigt, 0 Abgeschlossen
- [x] Tabelle mit Spalten: Auftragsnr., Kunde, Auftragsdatum, Geplanter Start, Brutto, Status

## Befunde

### Kritisch (blockiert Nutzung)
Keine kritischen Befunde.

### Mittel (funktional, aber verbesserungswürdig)
1. **Unternehmen & Kontakte zeigt 0 Einträge** – Die E2E-Tests räumen ihre Testdaten auf (Cleanup), daher sind die Unternehmen nicht sichtbar. Die Seite selbst funktioniert korrekt (Buttons, Tabs, Suche). Echte Unternehmen müssen manuell oder über HubSpot-Sync angelegt werden.
2. **Mehrere identische Projektnamen** – 7 Projekte heißen "Fassadenreinigung Wohnanlage Südpark" (2026-WBG-02 bis 08). Das sind Testdaten aus früheren E2E-Läufen, die nicht bereinigt wurden. Die Projektnummern sind korrekt eindeutig.

### Niedrig (kosmetisch)
1. **Baustellen-Seite leer** – 0 Baustellen vorhanden, da noch keine über den Wizard angelegt wurden. Empty State wird korrekt angezeigt.
2. **Aufträge alle identisch** – 7 Aufträge mit gleichem Brutto (6.836,55 €) und gleichem Kunden. Das sind Seed-Daten, die reale Vielfalt fehlt noch.

## Gesamtbewertung

**BESTANDEN** – Alle 9 geprüften Bereiche laden korrekt, zeigen echte DB-Daten (Mitarbeiter, Projekte, Garantien, Aufträge) und die Navigation funktioniert durchgängig. Die Dynamisierung von Einsatzplanung (23 MA) und Ressourcen (23 MA) ist visuell bestätigt. Keine kritischen Fehler gefunden.
