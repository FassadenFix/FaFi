# E2E-Regressionstest – 09.02.2026

## Testumgebung
- URL: https://3000-i991sfx3m0uhp2tz90lm2-c94213ce.us2.manus.computer/
- User: Alexander Retzlaff (admin, buero)
- Datum: 09.02.2026

## Test 1: Dashboard
- **Status:** ✅ PASS
- **Datum:** Dynamisch "Montag, 9. Februar 2026" (korrekt)
- **Sidebar:** 4 Sektionen (PROJEKTMANAGEMENT, KUNDENBERATUNG, PLANUNG & EINSATZ, DURCHFÜHRUNG)
- **KPIs:** 8 KPI-Karten korrekt geladen:
  - Offene Angebote: 0 (1 gesamt)
  - Projekte: 4 (0 Aufträge)
  - Aktive Baustellen: 0
  - Offene Aufgaben: 2 (2 dringend)
  - Conversion-Rate: 0% (0 von 1)
  - Offene Rechnungen: 0 (0,00 €)
  - Umsatz (bezahlt): 0,00 €
  - Aktive Garantien: 0
- **Nächste Schritte:** 4 Projekte mit korrekten nächsten Aktionen
- **Countdown-Aufgaben:** 2 dringende Aufgaben korrekt angezeigt
- **Letzte Aktivitäten:** 5 Einträge mit korrekten Timestamps
- **HubSpot:** Verbunden (Hub ID: 26519608, 1000+ Unternehmen/Kontakte/Deals)
- **KEIN SQL-FEHLER MEHR** (gross_total Fix wirkt)

## Test 2: Projekte-Seite
- **Status:** ✅ PASS
- **Projekte:** 4 Projekte korrekt angezeigt (3x Objektaufnahme, 1x Angebot erstellt)
- **KPIs:** 4 Gesamt, 0 In Bearbeitung, 1 Angebote, 0 Abgeschlossen
- **Suche:** Suchfeld vorhanden
- **Filter:** Phasen-Filter und Sortierung vorhanden
- **Mehrfachauswahl:** Button vorhanden
- **Neues Projekt:** Button vorhanden

## Test 3: ProjektDetail
- **Status:** ✅ PASS
- **Projekt:** "Fassadenreinigung Wohnanlage Grüner Weg" (2026-GEM-01)
- **Phase:** Objektaufnahme (korrekt)
- **Workflow-Gate:** "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden" (Gate funktioniert)
- **Angebot-Button:** Vorhanden (oben rechts)
- **Projektzeitstrahl:** 10 Phasen korrekt angezeigt, Phase 1 aktiv
- **Tabs:** Übersicht, Immobilien (1), Angebote (0), Aufträge (0), Baustellen (0), Finanzen, Dokumente (0), Aufgaben (0), Teams
- **Projektdaten:** Projektnummer + Notizen korrekt

## Test 4: Unternehmen & Kontakte (CRM)
- **Status:** ✅ PASS
- **Hierarchie:** 102 Unternehmen, 104 Kontakte, 0 Entscheider (KPI korrekt umbenannt)
- **Neuer Kontakt Button:** Vorhanden (echtes Formular statt Toast)
- **Projekte unter Unternehmen:** Sichtbar bei zugeordneten Unternehmen (z.B. "1 Projekt")
- **Tabs:** Unternehmen (102), Alle Kontakte (104)
- **Alle aufklappen/zuklappen:** Buttons vorhanden

## Test 5: Finanzen
- **Status:** ✅ PASS (SQL-Fehler behoben!)
- **KPIs:** Gesamtumsatz 3.10 Mio €, Gesamtkosten 2.21 Mio €, Gewinn 884 T€, Marge 29%
- **Charts:** Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus
- **Export:** Excel + PDF Buttons vorhanden
- **Zeitfilter:** "Dieses Jahr" Dropdown vorhanden

## Test 6: Einsatzplanung
- **Status:** ✅ PASS
- **Kalender:** Monatsnavigation mit "Februar 2026" und Pfeilen (< >)
- **Filter:** "1 Züge ohne Mitglieder ausgeblendet" (Zug Charlie korrekt gefiltert)
- **Züge:** Alpha (3 Mitglieder, 3 Projekte), Bravo (3 Mitglieder, 2 Projekte), Charlie (0 Mitglieder, ausgeblendet)
- **Einsätze:** Korrekt im Kalender angezeigt

## Test 7: Kundenportal
- **Status:** ✅ PASS
- **Startseite:** Aktuelles Projekt direkt in Detailansicht (test projektroding)
- **Ampel:** "In Vorbereitung" (gelb) korrekt angezeigt
- **Tabs:** Meine Projekte, Garantien, Dokumente, Aufgaben, Kontakt, Feedback
- **Projektverlauf:** 7-Phasen-Timeline korrekt
- **Bewohnerinfo-Button:** Vorhanden

## Test 8: Baustellen
- **Status:** ✅ PASS
- **Ansicht:** Desktop-Verwaltung korrekt (Tabelle mit Spalten: Baustelle, Projekt, Zeitraum, Fortschritt, Status)
- **KPIs:** 0 Gesamt, 0 Aktiv, 0 Geplant, 0 Pausiert (keine Baustellen angelegt)
- **Filter:** Status-Dropdown + Suche vorhanden
- **Neue Baustelle:** Button vorhanden

## Test 9: Angebote
- **Status:** ✅ PASS
- **Angebote:** 1 Entwurf (FF-2026-0001)
- **KPIs:** 1 Gesamt, 1 Diesen Monat, 0 € Gesamtwert, 0 Angenommen
- **Aktionen:** PDF-Vorschau, Versionshistorie, Neue Version, Download
- **Filter:** Status-Dropdown + Suche + Weitere Filter

## Test 10: Immobilien
- **Status:** ✅ PASS
- **Immobilien:** 5 erfasst, 3.0k m² reinigungsfähig, 0 Fotos, 2 mit Projekt
- **Zuordnungen:** "test projektroding" und "Fassadenreinigung Wohnanlage Grüner Weg" korrekt verlinkt
- **Duplikat:** "An der Saalebahn 8a" erscheint 2x (Duplikat-Warnung sollte beim Anlegen greifen)
- **Flächen:** Korrekt angezeigt (1.872 m² / 1.656 m² reinigungsfähig, 1.368 m² / 1.368 m²)

## Test 11: Dashboard nach SQL-Fix (Neustart)

Der SQL-Fehler bei `gross_total` und `open_amount` ist nach dem Server-Neustart vollständig behoben. Alle 8 KPI-Karten laden fehlerfrei und zeigen korrekte Daten aus der Datenbank an. Die "Operative Übersicht" zeigt: 0 Offene Angebote (1 gesamt), 4 Projekte (0 Aufträge), 0 Aktive Baustellen, 2 Offene Aufgaben (2 dringend), 0% Conversion-Rate, 0 Offene Rechnungen (0,00 EUR offen), 0,00 EUR Umsatz (bezahlt), 0 Aktive Garantien. Die "Nächste Schritte"-Sektion zeigt alle 4 Projekte mit korrekten Workflow-Aktionen. HubSpot-Sync ist verbunden (Hub ID: 26519608) mit 1000+ Unternehmen, Kontakte und Deals.

**Ergebnis:** PASS – Kein SQL-Fehler mehr, alle API-Requests mit Status 200, keine Browser-Console-Errors.

