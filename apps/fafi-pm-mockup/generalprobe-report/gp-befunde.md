# Generalprobe Befunde

## 1. Dashboard - OK
- Dashboard lädt korrekt mit Hero-Banner, Sidebar, Suchleiste
- KPI-Karten zeigen echte Daten: 0 Offene Angebote, 4 Projekte, 0 Baustellen, 2 Aufgaben (2 dringend), 0% Conversion
- Nächste Schritte: 4 Projekte mit korrekten Phasen und nächsten Aktionen
- Kanban-Board: Projekte per Phase (1 in Angebot erstellt)
- Countdown-Aufgaben: 2 dringend (Angebot prüfen, Angebot versenden)
- Letzte Aktivitäten: Test User Aufgabenänderungen sichtbar
- HubSpot Sync: Verbunden, Hub ID 26519608, 1000+ Unternehmen/Kontakte/Deals
- Benutzer: Alexander Retzlaff, Datum korrekt: 11. Feb 2026, KW 7
- BEFUND-01 (gering): Offene Angebote zeigt 0, obwohl 1 gesamt - Zählung prüfen

## 2. Projekte - OK
- Projektliste lädt korrekt: 4 Projekte sichtbar
- KPI-Karten: 4 Gesamt, 0 In Bearbeitung, 1 Angebote, 0 Abgeschlossen
- Suche und Filter (Alle Phasen, Sortierung) vorhanden
- Neues Projekt Button sichtbar
- Projekte: Grüner Weg (Objektaufnahme), Olympiadorf München (Objektaufnahme), Lister Meile (Objektaufnahme), test projektroding (Angebot erstellt)
- Projektnummern korrekt generiert: 2026-GEM-01, 2026-STD-01, 2026-WBG-01, 2026-KRE-01

## 2b. Projekt-Detail - OK
- Projekt-Detail lädt korrekt: "Fassadenreinigung Wohnanlage Grüner Weg" (2026-GEM-01)
- Phase: Objektaufnahme (grün markiert im Zeitstrahl)
- Workflow-Hinweis: "Angebot erstellt – Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot."
- KPI-Karten: 1 Immobilie, Gesamtfläche –, 0% Fortschritt, 0 Dokumente
- Projektzeitstrahl: 10 Phasen korrekt dargestellt
- Tabs: Übersicht, Immobilien (1), Angebote (0), Aufträge (0), Baustellen (0), Finanzen, Dokumente (0), Aufgaben (0), Teams
- Notizen: Realdaten sichtbar (Algenbefall, WDVS, 4.200 m², Frostgefahr-Hinweis)
- Schnellzugriff-Button "Angebot" oben rechts

## 3. Unternehmen & Kontakte - OK
- 2800 Unternehmen, 5220 Kontakte, 0 Entscheider geladen
- Verwaiste-Kontakte-Warnung: 941 verwaiste Kontakte korrekt angezeigt (Amber-Banner)
- Tabs: Hierarchisch (2800), Alle Kontakte (5220), Verwaist (941)
- Unternehmen-Liste: Hierarchische Darstellung mit Kategorie-Badges, PLZ, Kontakt-Anzahl
- Suche und Bereinigen-Button vorhanden
- BEFUND: hrRouter-Fehler war historisch (vor Server-Neustart um 18:26). Nach Neustart: Server läuft fehlerfrei, hr.employees.stats antwortet mit 401 (protectedProcedure korrekt)

## 4. Angebote - OK (1 Befund)
- 1 Angebot vorhanden (FF-2026-0001), Gesamtwert 0€
- Tabelle: Angebotsnr., Projekt, Kunde, Status, Fläche, Preis, Gültig bis, Aktionen
- Aktions-Buttons: PDF-Vorschau, Versionshistorie, Download, Versenden, Neue Version, Mehr
- BEFUND: Angebot zeigt "Kein Projekt" und "Kein Kunde" - wurde ohne Zuordnung erstellt

## 5. Immobilien - OK
- 6 Immobilien geladen, 3.0k m² reinigungsfähig, 0 Fotos, 2 mit Projekt
- Tabelle: Adresse, Eigentümer, Fläche, Zuordnungen, Fotos
- Entwurf-Badge korrekt angezeigt (Emil-Schuster-Straße)
- Projekt-Zuordnung funktioniert (test projektroding, Fassadenreinigung Wohnanlage Grüner Weg)
- Suche vorhanden, Neue Immobilie Button vorhanden

## 6. Baustellen - OK (leer, erwartungsgemäß)
- 0 Baustellen, 0 Aktiv, 0 Geplant, 0 Pausiert
- Leerer Zustand korrekt: "Noch keine Baustellen vorhanden" mit Filter-zurücksetzen-Button
- Tabelle-Header: Baustelle, Projekt, Zeitraum, Fortschritt, Status
- Neue Baustelle Button vorhanden

## 7. HR Dashboard (/hr) - HERVORRAGEND
- 30 Mitarbeiter gesamt (23 aktiv, 7 inaktiv), 113 Dokumente (9 Kategorien), 0 Onboarding
- Abteilungsverteilung: Anwendungstechnik (20), Administration (3), Vertrieb (3), Marketing (2), GF (1), IT (1)
- Top Positionen: Anwendungstechniker (17), Kundenberater (3), etc.
- Neueste Mitarbeiter: Dirk Brodhagen, Michal Kopec, Rocco Seitz, Marco Nepaschings, Fritz Düring
- Dokumente nach Kategorie: Sonstige (62), Arbeitsverträge (32), Zertifikate (9), etc.
- Status-Übersicht: 23 Aktiv, 7 Inaktiv, 0 Onboarding, 0 Beurlaubt
- Alle Daten korrekt aus Personio-Import geladen

## 8. HR Mitarbeiterliste (/hr/mitarbeiter) - HERVORRAGEND
- 30 von 30 Mitarbeitern angezeigt, alle echten Personio-Daten korrekt
- Initialen-Avatar, Name, Status-Badge (Aktiv grün, Inaktiv rot), Position, Abteilung, E-Mail, Eintrittsdatum
- Sortierung: Name (aktiv), Position, Abteilung, Eintrittsdatum, Status
- Filter: Alle Status, Alle Abteilungen
- Suche: Name, E-Mail, Position
- Alle 30 Mitarbeiter mit korrekten Daten: Alexander Retzlaff (GF), Dustin Holz (Standortleiter), etc.
