# FaFi PM – E2E-Realdaten-Test v3.0 – Findings

**Datum:** 09.02.2026
**Version:** a651352a

---

## Szenario 1: Kundenberaterin Lisa Weber – Neukunde Großprojekt

### S1-F-001 | MAJOR | Benutzername zeigt "Benutzer / Benutzer" statt Rollenname
- Sidebar unten zeigt "Benutzer / Benutzer" statt "Lisa Weber / Kundenberaterin"
- Erst nach Scroll/Interaktion wechselt es zu "Alexander Retzlaff / Büro"
- Problem: Es gibt keine Rollenwahl – alle Nutzer sehen dasselbe
- Für den Test: Ich kann mich nicht als "Lisa Weber" einloggen, da es nur einen OAuth-User gibt
- LOGIKBRUCH: Ein PM-Tool für verschiedene Rollen hat keine Rollenumschaltung

### S1-F-002 | MAJOR | KPI-Cards zeigen Skeleton-Loader für mehrere Sekunden
- Die 8 KPI-Cards in "Operative Übersicht" zeigen Skeleton-Loader
- Ladezeit: ca. 3-5 Sekunden bis Daten erscheinen
- Bei schlechter Verbindung könnte das noch länger dauern
- UX: Nutzer könnte denken, die Seite ist kaputt

### S1-F-003 | MINOR | Header zeigt statisch "03. Feb 2026 · KW 6"
- Bekannter Bug aus v2, immer noch nicht behoben
- Heute ist 09.02.2026, Header zeigt 03.02.2026

### S1-F-004 | MAJOR | Manuelle URL /unternehmen gibt 404 – korrekte Route ist /kontakte
- Sidebar-Link geht korrekt zu /kontakte, aber intuitiv tippt man /unternehmen ein
- Die Route heißt /kontakte, der Sidebar-Link heißt "Unternehmen & Kontakte" – Inkonsistenz
- Kein Redirect von /unternehmen → /kontakte vorhanden

### S1-F-005 | UI | MINOR – Firmenname-Feld: Langer Name abgeschnitten
- Eingabe: "Städtische Wohnungsbau- und Immobilienverwaltungsgesellschaft der Landeshauptstadt München mbH & Co. KG" (95 Zeichen)
- Im Input-Feld sieht man nur den Anfang, kein Tooltip oder Mehrzeilig
- Sonderzeichen (ü, ö, &, Bindestrich) werden korrekt akzeptiert

### S1-F-006 | LOGIK | MINOR – Keine PLZ-Validierung
- PLZ "80335" wird akzeptiert (korrekt), aber auch "ABCDE" oder "1" würde durchgehen
- Keine Prüfung auf 5-stellige Ziffern (deutsche PLZ)

### S1-F-007 | UX | MINOR – Pflichtfeld-Markierung unklar
- Nur Firmenname hat "*", Straße/PLZ/Ort/Telefon/E-Mail nicht
- Unklar welche Felder wirklich Pflicht sind


### S1-F-008 | OK | Unternehmen erfolgreich angelegt
- Zähler springt von 101 auf 102 ✓
- Toast "Unternehmen erfolgreich angelegt" erscheint ✓
- Formular wird zurückgesetzt ✓
- Neues Unternehmen erscheint alphabetisch korrekt in der Liste ✓
- Kategorie "Öffentlich" wird korrekt als Badge angezeigt ✓
- Langer Firmenname wird in der Liste vollständig angezeigt ✓

### S1-F-009 | UX | MINOR – Dialog bleibt nach Anlegen offen
- Nach erfolgreichem Anlegen bleibt der Dialog offen (leeres Formular)
- Nutzer muss manuell schließen oder kann gleich das nächste Unternehmen anlegen
- Für Massenerfassung praktisch, für Einzelerfassung irritierend
- Besser: Option "Schließen nach Anlegen" oder Auto-Close mit Undo-Option


---

## Szenario 2: Kundenberater Max – Großprojekt München anlegen

**Rolle:** Kundenberater | **Ziel:** Neues Projekt für den gerade angelegten Kunden erstellen

### S2-F-001 | MAJOR | Unternehmenssuche filtert nicht das Dropdown
- Suchfeld "Unternehmen suchen..." nimmt Eingabe "München" an
- Aber das Dropdown "Unternehmen wählen..." zeigt weiterhin alle 102 Unternehmen
- Die Suche filtert die Dropdown-Liste NICHT – man muss trotzdem scrollen
- LOGIKBRUCH: Suchfeld suggeriert Filterung, liefert aber keine
- Nutzer erwartet: Tippe "München" → Dropdown zeigt nur Unternehmen mit "München" im Namen


### S2-F-001 KORREKTUR | OK/UX | Unternehmenssuche funktioniert – aber UX verwirrend
- KORREKTUR: Die Suche filtert das Dropdown DOCH korrekt!
- Aber erst wenn man das Dropdown explizit öffnet (Klick auf "Unternehmen wählen...")
- Das Suchfeld und das Dropdown sind visuell getrennt – Nutzer erwartet Live-Filterung
- Ergebnis zeigt korrekt: "Städtische Wohnungsbau- und Immobilienverw... (München)"
- UX-Verbesserung: Dropdown sollte sich automatisch öffnen wenn man im Suchfeld tippt

### S2-F-002 | OK | Langer Firmenname wird im Dropdown abgekürzt
- Der extrem lange Name wird korrekt mit "..." abgekürzt
- Ort "(München)" wird als Zusatzinfo angezeigt – sehr hilfreich bei 102 Unternehmen


### S2-F-003 | OK | HubSpot-Schritt korrekt als optional markiert
- "Optional" Badge neben "HubSpot" Überschrift ✓
- Hilfetext erklärt CRM-Integration klar ✓
- Schritt kann übersprungen werden ✓


### S2-F-004 | OK | Kalender-Lokalisierung funktioniert
- Deutsche Wochentage: Mo, Di, Mi, Do, Fr, Sa, So ✓
- Deutsche Tooltips: "Montag, 26. Januar 2026" ✓
- "Today" Tooltip auf 9. Februar 2026 – ABER: Mischung Deutsch/Englisch ("Today" statt "Heute")
- Woche beginnt mit Montag (europäisch korrekt) ✓

### S2-F-005 | MINOR | "Today" statt "Heute" im Kalender-Tooltip
- Tooltip zeigt "Today, Montag, 9. Februar 2026" – das "Today" ist englisch
- Sollte "Heute, Montag, 9. Februar 2026" sein für konsistente Lokalisierung


### S2-F-006 | MINOR | Kalender-Navigation Buttons nicht lokalisiert
- "Go to the Previous Month" / "Go to the Next Month" sind englisch
- Sollte "Vorheriger Monat" / "Nächster Monat" sein
- Monatsname im Header zeigt nur "2026" ohne Monatsname – schwer zu orientieren


### S2-F-007 | OK | Startdatum korrekt gesetzt
- 4.5.2026 wird korrekt angezeigt ✓
- Kalender bleibt offen nach Auswahl – zeigt jetzt den Enddatum-Kalender
- ABER: Kalender-Header zeigt nur "2026" ohne Monatsname – verwirrend

### S2-F-008 | MAJOR | Kalender-Header zeigt keinen Monatsnamen
- Im Kalender-Header steht nur "2026" – der Monatsname fehlt komplett
- Nutzer muss die Tage zählen um zu wissen in welchem Monat er ist
- KRITISCH für Usability: Ohne Monatsnamen ist Navigation im Kalender sehr schwierig


### S2-F-009 | CRITICAL | Startdatum springt beim Enddatum-Klick auf falsches Datum!
- Startdatum wurde auf 4.5.2026 gesetzt (korrekt)
- Dann im SELBEN Kalender (der sich nicht geschlossen hat) auf 1. Juli geklickt
- Ergebnis: Startdatum springt auf 1.7.2026 – das Enddatum bleibt "Datum wählen"!
- LOGIKBRUCH: Der Kalender hat den Klick als NEUES Startdatum interpretiert, nicht als Enddatum
- URSACHE: Start-Kalender schließt sich nicht nach Auswahl, bleibt offen
- Nutzer denkt er wählt Enddatum, setzt aber versehentlich Startdatum um
- REPRODUZIERBAR: Startdatum wählen → Kalender bleibt offen → Weiteren Tag klicken → Startdatum überschrieben


### S2-F-010 | MAJOR | Enddatum-Kalender startet bei Februar statt beim Startdatum
- Enddatum-Kalender öffnet sich bei Februar 2026 (aktueller Monat)
- Startdatum ist 1.7.2026 – Enddatum-Kalender sollte bei Juli starten
- Nutzer muss 5 Monate vorwärts navigieren um zum Juli zu kommen
- LOGIKBRUCH: Enddatum muss NACH Startdatum liegen, Kalender sollte dort starten

### S2-F-011 | MAJOR | Beide Kalender gleichzeitig offen
- Start-Kalender und End-Kalender können gleichzeitig sichtbar sein
- Verwirrend: Welcher Kalender gehört zu welchem Feld?
- Lösung: Nur ein Kalender gleichzeitig offen, der andere schließt sich automatisch


### S2-F-012 | MAJOR | Keine Validierung: Enddatum fehlt, Kundenberater fehlt
- Wizard springt zur Zusammenfassung obwohl:
  - Kein Kundenberater gewählt (Pflichtfeld?)
  - Kein Enddatum gesetzt
  - Kein Projektleiter gewählt
- Zusammenfassung zeigt: Geplantes Ende: "—", Ansprechpartner: "—"
- LOGIKBRUCH: Startdatum zeigt 1.7.2026 statt 4.5.2026 (Bug S2-F-009 bestätigt)
- Positiv: Zusammenfassung zeigt alle Daten übersichtlich ✓
- Positiv: Status "Objektaufnahme" wird automatisch gesetzt ✓
- Positiv: Hinweis "Nach dem Erstellen können Sie Immobilien hinzufügen" ✓

### S2-F-013 | OK | Zusammenfassung ist gut strukturiert
- Projektübersicht mit allen relevanten Feldern ✓
- Beschreibungstext wird vollständig angezeigt ✓
- Unternehmen wird mit vollem Namen angezeigt ✓
- "Fast fertig!" Indikator bei 100% ✓


### S2-F-014 | OK | Projekt erfolgreich erstellt
- Toast: "Fassadenreinigung Wohnkomplex Olympiadorf München (2026-STD-01) wurde erfolgreich angelegt." ✓
- Projektnummer 2026-STD-01 automatisch generiert ✓
- Projekt erscheint in der Liste ✓
- Zähler springt von 2 auf 3 ✓

### S2-F-015 | UX | Neues Projekt erscheint ausgegraut/verblasst
- Das neue Projekt "Fassadenreinigung Wohnkomplex Olympiadorf München" erscheint deutlich blasser als die anderen
- Kein farbiges Icon, Text ist grau statt schwarz
- Datum zeigt "1.7.2026 – offen" (bestätigt Bug S2-F-009: falsches Startdatum)
- Warum ist es ausgegraut? Kein visueller Hinweis warum – verwirrend für Nutzer

### S2-F-016 | MINOR | Projektnummer-Logik: STD statt SWI oder MÜN
- Projektnummer "2026-STD-01" – das Kürzel "STD" kommt von "Städtische..."
- Aber "STD" ist ein unglückliches Kürzel (Assoziation: Standardzeit, Sexually Transmitted Disease)
- Besser wäre ein Kürzel aus dem Firmennamen oder Ortsnamen: "MÜN" oder "SWI"


---

## Szenario 3: Kontaktperson anlegen (als Lisa Weber, Kundenberaterin)
**Ziel:** Ansprechpartner für den München-Kunden anlegen
**Rolle:** Kundenberaterin Lisa Weber

### S3-F-001 | MAJOR | "Neuer Kontakt" Button zeigt nur Toast statt Formular
- Klick auf "Neuer Kontakt" zeigt Toast: "Kontakt hinzufügen - Funktion in Entwicklung"
- KEIN Formular, kein Dialog, kein Wizard
- LOGIKBRUCH: 100 Kontakte existieren bereits in der DB, aber man kann keine neuen anlegen?
- Woher kommen die 100 Kontakte? Vermutlich Seed-Daten, aber Nutzer kann keine eigenen erstellen
- KRITISCH für Workflow: Ohne Kontakte kann kein Ansprechpartner zugewiesen werden

### S3-F-002 | OBSERVATION | 102 Unternehmen, 100 Kontakte, 0 Hauptkontakte
- Hauptkontakte-Zähler zeigt 0 – keines der 100 Kontakte ist als Hauptkontakt markiert
- Alle Unternehmen zeigen "0 Kontakte" – die 100 Kontakte sind keinem Unternehmen zugeordnet
- LOGIKBRUCH: Kontakte existieren, sind aber nicht mit Unternehmen verknüpft


### S3-F-003 | OK | Kontaktliste zeigt echte Daten mit Rollen und Kontaktinfos
- 100 Kontakte mit Namen, Position, E-Mail, Telefon ✓
- Initialen-Avatar (HB, SB, AB...) ✓
- Positionen wie "Technischer Vorstand", "Geschäftsführung", "MitarbeiterIn Technik" ✓
- Kontaktdaten sind echte Daten (nicht Platzhalter) ✓

### S3-F-004 | MINOR | Kontakte nicht mit Unternehmen verknüpft
- Kein Unternehmensname bei den Kontakten sichtbar
- Schloss-Icon und "—" bei jedem Kontakt – bedeutung unklar
- Nutzer kann nicht erkennen welcher Kontakt zu welchem Unternehmen gehört

### S3-F-005 | UX | Kontakt "Derya" hat keinen Nachnamen
- Nur Vorname "Derya" – sieht unprofessionell aus
- Daten-Qualitätsproblem aus dem Import/Seed

---

## Szenario 4: Suche und Navigation testen (als Max Mustermann, AT-Leiter)
**Ziel:** Globale Suche und Navigation auf Effizienz prüfen
**Rolle:** AT-Leiter Max Mustermann


### S4-F-001 | MAJOR | Globale Suche findet "München" nicht
- Suche nach "München" ergibt: "Keine Ergebnisse für 'München'"
- ABER: Es gibt ein Projekt "Fassadenreinigung Wohnkomplex Olympiadorf München"
- UND: Ein Unternehmen "Städtische Wohnungsbau-... München mbH & Co. KG"
- LOGIKBRUCH: Globale Suche durchsucht offenbar nicht Projekte und Unternehmen
- Suche scheint nur vordefinierte Schnellaktionen und Favoriten zu kennen

### S4-F-002 | OK | Globale Suche hat gute UX-Features
- Cmd+K Shortcut funktioniert ✓
- Schnellaktionen (Neues Projekt, Baustelle, Immobilie, Angebot, Termin) ✓
- Suchvorschläge (Sonnenhof, Bürokomplex, ANG-2026) ✓
- "★ Speichern" Button für Suchfilter ✓
- Keyboard-Navigation-Hinweise am unteren Rand ✓

### S4-F-003 | MINOR | Suchvorschläge sind statisch/veraltet
- Vorschläge "Sonnenhof", "Bürokomplex", "ANG-2026" – das sind Mock-Daten
- Aktuelle Projekte (Grüner Weg, Lister Meile, München) fehlen in Vorschlägen


---

## Szenario 5: Phasenwechsel testen (als Projektleiter Thomas Braun)
**Ziel:** Phase von "Objektaufnahme" zu "Angebot erstellt" wechseln
**Rolle:** Projektleiter Thomas Braun

### S5-F-001 | OK | Workflow-Validierung funktioniert korrekt
- Projekt "Lister Meile" ist in Phase "Objektaufnahme"
- Workflow zeigt: "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot."
- LOGISCH KORREKT: Man kann nicht zu "Angebot erstellt" wechseln ohne Angebot
- Projektzeitstrahl zeigt alle 10 Phasen visuell ✓

### S5-F-002 | OBSERVATION | Alle 3 Projekte stehen in Phase "Objektaufnahme"
- Alle 3 neu erstellten Projekte stehen in Phase 1 "Objektaufnahme"
- Kein Projekt hat Immobilien (0), keine Angebote (0), keine Aufträge (0)
- KPI-Zähler: 3 Gesamt, 0 In Bearbeitung, 0 Angebote, 0 Abgeschlossen
- LOGIKBRUCH: "In Bearbeitung" sollte die 3 Projekte zählen, die in "Objektaufnahme" sind

### S5-F-003 | OK | Projektdaten korrekt angezeigt
- Projektnummer: 2026-WBG-01 ✓
- Zeitraum: 6.4.2026 – 29.6.2026 ✓
- Notizen vollständig angezeigt ✓
- Tabs: Übersicht, Immobilien, Angebote, Aufträge, Baustellen, Finanzen, Dokumente, Aufgaben, Teams ✓

### S5-F-004 | MINOR | Schnellzugriff-Bereich leer
- "Schnellzugriff" Card ist komplett leer – keine Aktionen, keine Links
- Sollte mindestens "Immobilie erfassen" oder "Angebot erstellen" anbieten


---

## Szenario 6: Angebot erstellen (als Lisa Weber, Kundenberaterin)
**Ziel:** Angebot für Projekt "Lister Meile" erstellen
**Rolle:** Kundenberaterin Lisa Weber

### S6-F-001 | OK | Angebots-Wizard öffnet sich korrekt
- 5-Schritt-Wizard: Projekt → Immobilien & Seiten → Kalkulation → ... → ...
- Fortschrittsanzeige: 20% bei Schritt 1 ✓
- "Entwurf wiederhergestellt" Toast – speichert Zwischenstände ✓

### S6-F-002 | OK | Unternehmenssuche im Angebots-Wizard funktioniert
- Suchfeld vorhanden ✓
- Zeigt automatisch erstes Unternehmen: "Gemeinnützige Wohnbaugenossenschaft e.G. Hauzenberg"
- Info: "0 Kontakt(e), 0 Projekt(e) verfügbar" ✓

### S6-F-003 | OBSERVATION | Angebots-Wizard zeigt nur ein Unternehmen
- Dropdown zeigt nur "Gemeinnützige Wohnbaugenossenschaft e.G. Hauzenberg"
- Muss erst suchen um andere zu finden – Verhalten wie erwartet


### S6-F-004 | CRITICAL | Angebots-Wizard crasht bei Projektauswahl
- Nach Auswahl von "WBG Nordstadt eG" und Projekt "Lister Meile" → CRASH
- Fehler: "A <Select.Item /> must have a value prop that is not an empty string"
- Kompletter Whitescreen mit Error Boundary
- URSACHE: Wenn ein Projekt ausgewählt wird, werden Immobilien geladen. Da 0 Immobilien existieren, wird vermutlich ein leerer Select.Item generiert
- WORKFLOW-BLOCKER: Angebotserstellung ist komplett unmöglich!
- Ohne Angebot kann kein Phasenwechsel stattfinden → gesamter Workflow blockiert


---

## Szenario 7: Immobilien-Zuordnung prüfen (als Büro-Mitarbeiterin)
**Ziel:** Immobilien einem Projekt zuordnen und Datenintegrität prüfen
**Rolle:** Büro

### S7-F-001 | OK | Immobilien-Übersicht zeigt 3 erfasste Objekte
- 3 Immobilien, 3.0k m² Reinigungsfähig, 0 Fotos, 1 Mit Projekt ✓
- Tabelle mit Adresse, Fläche, Zuordnungen, Fotos ✓

### S7-F-002 | MAJOR | "Lister Meile" Immobilie ist "Nicht zugeordnet"
- Immobilie "Lister Meile 25-31, Hannover" wurde im Kontext des Projekts "Lister Meile" erstellt
- ABER: Zuordnung zeigt "Nicht zugeordnet" – Immobilie wurde nicht automatisch dem Projekt zugeordnet
- LOGIKBRUCH: Nutzer erwartet, dass eine im ProjektDetail erstellte Immobilie automatisch zugeordnet wird
- Bestätigt Finding V2-F-053 aus dem vorherigen Test

### S7-F-003 | OK | "Grüner Weg" Immobilie ist korrekt zugeordnet
- "Grüner Weg 1-8, Hannover" → "Fassadenreinigung Wohnanlage Grüner Weg" ✓
- Link zum Projekt funktioniert ✓

### S7-F-004 | OBSERVATION | "An der Saalebahn" hat keine Flächendaten
- Dritte Immobilie hat keine m²-Angabe – nur Adresse
- Vermutlich unvollständig erfasst (kein Wizard durchlaufen?)


---

## Szenario 8: Dashboard prüfen (als Geschäftsführung)
**Ziel:** Dashboard-KPIs und Aktivitäten auf Korrektheit prüfen
**Rolle:** Geschäftsführung

### S8-F-001 | OK | Dashboard-Datum ist jetzt dynamisch
- "Montag, 9. Februar 2026" – korrektes aktuelles Datum ✓ (vorher statisch "03. Feb")
- Begrüßung "Willkommen zurück" ✓

### S8-F-002 | MINOR | KPI-Cards laden als Skeleton
- Operative Übersicht zeigt 7 Skeleton-Cards (Ladeanimation)
- Daten laden offenbar langsam oder gar nicht
- Nach einigen Sekunden sollten echte Zahlen erscheinen

### S8-F-003 | OK | Nächste Schritte Sektion vorhanden
- "Aktive Projekte und ihre nächsten Aktionen" ✓
- "Alle Projekte" Link ✓
- Projekte nach Phase Sektion ✓

### S8-F-004 | OBSERVATION | Benutzer zeigt "Benutzer" statt Name
- Unten links: "B Benutzer / Benutzer" – kein richtiger Name
- LOGIKBRUCH: Sollte den eingeloggten Nutzer zeigen (z.B. "Alexander Retzlaff")
- Wechselt zwischen "Alexander Retzlaff" und "Benutzer" – inkonsistent

### S8-F-005 | OK | Schnellaktionen vorhanden
- Neues Projekt anlegen, Objektaufnahme starten, Angebot erstellen, HubSpot synchronisieren ✓
- HubSpot Sync zeigt "Nicht verbunden" – korrekt da nicht konfiguriert ✓


---

## Szenario 9: Einsatzplanung testen (als AT-Leiter)
**Ziel:** Züge verwalten, Mitarbeiter zuordnen, Kalender prüfen
**Rolle:** AT-Leiter

### S9-F-001 | OK | Einsatzplanung zeigt 3 Züge + verfügbare Mitarbeiter
- Zug Alpha: 3 Mitglieder, 3 Projekte, Leiter Stefan Weber ✓
- Zug Bravo: 3 Mitglieder, 2 Projekte, Leiter Peter Hoffmann ✓
- Zug Charlie: 0 Mitglieder, 0 Projekte, Leiter Jürgen Wagner ✓
- Verfügbare Mitarbeiter: 2 nicht zugeordnet (Koch, Becker – beide "Urlaub") ✓

### S9-F-002 | MINOR | Jürgen Wagner ist gleichzeitig in Zug Bravo UND Leiter von Zug Charlie
- Jürgen Wagner (Vorarbeiter) ist Mitglied in Zug Bravo
- Gleichzeitig ist er Leiter von Zug Charlie
- LOGIKBRUCH: Ein Mitarbeiter kann nicht gleichzeitig in zwei Zügen sein
- Entweder ist er in Bravo ODER leitet Charlie – beides gleichzeitig ist widersprüchlich

### S9-F-003 | OK | Tabs vorhanden
- "Züge & Mitarbeiter" – aktiv ✓
- "Projekt-Zuordnung" ✓
- "Einsatzkalender" ✓


### S9-F-004 | OK | Einsatzkalender zeigt Monatsansicht
- Kalender zeigt Februar 2026 mit Mo-So Spalten ✓
- Farbcodierte Einsätze: Zug Alpha (grün), Zug Bravo (blau), Zug Charlie (orange) ✓
- Einsätze verteilt über den Monat ✓

### S9-F-005 | MAJOR | Einsatzkalender zeigt Einsätze für Zug Charlie (0 Mitglieder!)
- Zug Charlie hat 0 Mitglieder und 0 Projekte
- ABER: Im Kalender sind Einsätze für Zug Charlie eingetragen (5., 17., 20.)
- LOGIKBRUCH: Ein Zug ohne Mitglieder kann keine Einsätze haben
- Entweder müssen die Einsätze gelöscht werden oder Mitglieder zugeordnet sein

### S9-F-006 | MINOR | Kein Monatsname/Jahr im Kalender-Header
- Kalender zeigt nur "Einsatzkalender / Übersicht aller geplanten Einsätze"
- Kein Monatsname (Februar 2026) sichtbar
- Keine Navigation (vor/zurück) zwischen Monaten

### S9-F-007 | OBSERVATION | Einsätze sind nur Zug-Namen ohne Projektbezug
- Kalender zeigt nur "Zug Alpha", "Zug Bravo", "Zug Charlie"
- Kein Projektname, kein Ort, keine Details
- Als AT-Leiter möchte ich wissen: WO ist welcher Zug an welchem Tag?


---

## Szenario 10: Aufträge erstellen (als Kundenberaterin Lisa Weber)
**Ziel:** Auftrag aus Angebot erstellen
**Rolle:** Kundenberaterin

### S10-F-001 | OK | Aufträge-Seite zeigt korrekt "Keine Aufträge gefunden"
- KPIs: 0 Gesamt, 0 In Arbeit, 0 Bestätigt, 0 Abgeschlossen ✓
- Suchfeld und Status-Filter vorhanden ✓

### S10-F-002 | OK | "Neuer Auftrag" zeigt Toast "Funktion in Entwicklung"
- Korrektes Placeholder-Verhalten für noch nicht implementierte Funktion ✓

### S10-F-003 | MAJOR | Workflow-Sackgasse: Kein Weg vom Angebot zum Auftrag
- Angebots-Wizard crasht (S6-F-004) → kein Angebot erstellbar
- Ohne Angebot kein Auftrag möglich
- Ohne Auftrag kein Phasenwechsel zu "Auftrag gewonnen"
- GESAMTER WORKFLOW AB PHASE 5 BLOCKIERT


---

## Szenario 11: Garantien & Inspektionen (als Projektleiter)
**Ziel:** Garantie für abgeschlossenes Projekt erstellen
**Rolle:** Projektleiter

### S11-F-001 | OK | Garantien-Seite zeigt korrekt leeren Zustand
- KPIs: 0 Gesamt, 0 Aktiv, 0 Beansprucht, 0 Abgelaufen ✓
- "Neue Garantie" Button vorhanden ✓

### S11-F-002 | OBSERVATION | Garantien nur am Ende des Workflows erreichbar
- Garantien können erst nach Abnahme erstellt werden (Phase 9)
- Da kein Projekt über Phase 1 hinauskommt, ist diese Funktion unerreichbar
- Korrekt als Mockup, aber zeigt die Workflow-Blockade

---

## Szenario 12: Finanzen prüfen (als Geschäftsführung)
**Ziel:** Finanzübersicht und Rentabilität prüfen
**Rolle:** Geschäftsführung

### S12-F-001 | OK | Finanzübersicht mit beeindruckenden KPIs
- Gesamtumsatz: 3.10 Mio € (+14% vs. Vorjahr) ✓
- Gesamtkosten: 2.21 Mio € (+8% vs. Vorjahr) ✓
- Gewinn: 884 T€ (+22% vs. Vorjahr) ✓
- Marge: 29% (+3% vs. Vorjahr) ✓

### S12-F-002 | MAJOR | Finanzdaten sind komplett statisch/Mock
- Die Finanzdaten stimmen nicht mit den echten Projektdaten überein
- 3 Projekte in Phase "Objektaufnahme" → 0 € Umsatz erwartet
- ABER: Dashboard zeigt 3.10 Mio € Umsatz
- LOGIKBRUCH: Finanz-KPIs haben keinen Bezug zu den echten Daten
- Charts zeigen Monatsdaten für Jan-Dez, aber es ist erst Februar

### S12-F-003 | OK | Tabs und Schnellaktionen vorhanden
- Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus ✓
- Neue Rechnung, Zahlung erfassen, Budget anlegen, Mahnlauf ✓
- Excel/PDF Export Buttons ✓

### S12-F-004 | MINOR | Charts zeigen keine Daten
- Umsatz- und Gewinnentwicklung Chart ist leer (keine Balken/Linien sichtbar)
- Quartalsvergleich Chart zeigt Labels aber keine Balken
- Vermutlich Chart-Rendering-Problem oder fehlende Daten


---

## Szenario 13: Benachrichtigungen und Dashboard-Vollansicht
**Ziel:** Benachrichtigungen prüfen, Dashboard-KPIs validieren
**Rolle:** Geschäftsführung

### S13-F-001 | OK | Dashboard zeigt jetzt echte KPIs (nach Laden)
- Offene Angebote: 0 (korrekt) ✓
- Projekte: 0 Aufträge (korrekt – 3 Projekte existieren aber 0 Aufträge) ✓
- Aktive Baustellen: 0 ✓
- Offene Aufgaben: 0 ✓
- Conversion-Rate: 0% (0 von 0 Angeboten) ✓
- Offene Rechnungen: 0 ✓
- Umsatz (bezahlt): 0,00 € ✓
- Aktive Garantien: 0 ✓

### S13-F-002 | MAJOR | KPI "Projekte" zeigt 0 statt 3
- Es existieren 3 Projekte, aber KPI zeigt "0"
- Zeigt "0 Aufträge" – aber die Karte heißt "Projekte"
- LOGIKBRUCH: Nutzer erwartet hier die Anzahl der Projekte, nicht der Aufträge
- Verwirrende Beschriftung: Titel "Projekte" vs. Wert "0 Aufträge"

### S13-F-003 | MAJOR | "+12% vs. Vormonat" bei 0 Werten
- Offene Angebote: 0, aber "+12% vs. Vormonat"
- Projekte: 0, aber "+12% vs. Vormonat"
- Umsatz: 0,00 €, aber "+12% vs. Vormonat"
- LOGIKBRUCH: 0 kann nicht +12% gegenüber Vormonat sein
- Statische Prozentwerte statt echte Berechnung

### S13-F-004 | OK | Nächste Schritte zeigt alle 3 Projekte korrekt
- 2026-STD-01: München, Phase "Objektaufnahme", Nächster Schritt: Angebot erstellen ✓
- 2026-WBG-01: Lister Meile, Phase "Objektaufnahme", 06.04. – 29.06. ✓
- 2026-GEM-01: Grüner Weg, Phase "Objektaufnahme" ✓

### S13-F-005 | OK | Letzte Aktivitäten zeigen echte Aktionen
- "Alexander Retzlaff Projekt 2026-STD-01 erstellt" ✓
- "Alexander Retzlaff Unternehmen erstellt" ✓
- "Alexander Retzlaff Immobilie erstellt" ✓
- Zeitstempel "gerade eben" ✓

### S13-F-006 | OK | Benachrichtigungen-Popup funktioniert
- Klick auf Glocke (Badge "3") öffnet Popup ✓
- Zeigt: "Online", "Ausstehende Änderungen: 3"
- Musterstraße 15 – Nordseite: 3
- Wohnanlage Sonnenhof – Logbuch: 5
- Foto_Nord_001.jp...: 1
- "Offline testen" und "Jetzt synchronisieren" Buttons ✓

### S13-F-007 | MINOR | Benachrichtigungen sind Offline-Sync, nicht echte Benachrichtigungen
- Die "3" im Badge bezieht sich auf "Ausstehende Änderungen" (Offline-Sync)
- Nicht auf echte Benachrichtigungen wie "Neues Angebot eingegangen"
- Für Nutzer verwirrend: Badge suggeriert ungelesene Nachrichten

### S13-F-008 | OK | HubSpot Sync zeigt "Verbunden"
- Hub ID: 26519608 ✓
- 1000+ Unternehmen, 1000+ Kontakte, 1000+ Deals ✓
- "Jetzt synchronisieren" Button ✓


---

## BUGFIX-VERIFIKATION

### BF-001 | BEHOBEN | Angebots-Wizard Crash bei Projektauswahl (S6-F-004)
- **Ursache:** `<SelectItem value="">` in HubSpot Deal-Dropdown (Zeile 711) und KalkulationKonditionenStep (Zeilen 969, 1011)
- **Fix:** Alle `value=""` durch `value="none"` ersetzt, onValueChange-Handler angepasst
- **Verifikation:** Projekt "Lister Meile" kann jetzt ausgewählt werden ohne Crash ✓
- **Projektdaten werden korrekt geladen:** Projektnummer 2026-WBG-01, Entfernung 50 km, 0 Immobilien ✓
- **HubSpot Deal-Verknüpfung wird korrekt angezeigt** mit "Kein Deal ausgewählt" ✓

