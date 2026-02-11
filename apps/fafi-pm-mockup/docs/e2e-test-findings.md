# E2E-Test Findings – Realdaten-Durchlauf

## Testdatum: 09.02.2026
## Tester: Automatisierter Nutzertest (als Alexander Retzlaff / Büro)

---

## Phase 1: Dashboard

### F-001: Onboarding-Dialog überlagert Dashboard
- **Schwere:** Minor
- **Beschreibung:** Beim ersten Laden erscheint ein Onboarding-Dialog "Hey, schön dass du da bist!" der das Dashboard überlagert. Das ist korrekt für Erstnutzer, aber der Dialog erscheint bei jedem Laden – es gibt keinen "Nicht mehr anzeigen"-Mechanismus.
- **Erwartung:** Dialog sollte nur beim ersten Login erscheinen oder eine "Nicht mehr anzeigen"-Option haben.
- **Status:** Zu prüfen ob localStorage-Flag gesetzt wird.

### F-002: KPI-Karten zeigen Skeleton-Loader
- **Schwere:** Info
- **Beschreibung:** Die KPI-Karten im Dashboard zeigen Skeleton-Loader (graue Platzhalter). Das deutet darauf hin, dass entweder die Daten noch laden oder keine Daten vorhanden sind.
- **Erwartung:** Bei leerer Datenbank sollten die KPIs "0" anzeigen, nicht Skeleton-Loader.

### F-003: Schriftart Raleway sichtbar
- **Schwere:** OK
- **Beschreibung:** Die Schriftart ist korrekt auf Raleway umgestellt. Gut lesbar.

### F-004: Navigation vollständig
- **Schwere:** OK
- **Beschreibung:** Alle 9 Navigationsbereiche sind sichtbar und aufklappbar.

### F-005: Datum zeigt "03. Feb 2026 · KW 6"
- **Schwere:** Bug
- **Beschreibung:** Das Datum in der Kopfzeile zeigt "03. Feb 2026" statt dem aktuellen Datum (09. Feb 2026). Das Datum scheint hardcodiert oder falsch berechnet zu sein.
- **Erwartung:** Aktuelles Datum dynamisch anzeigen.

### F-006: KPIs zeigen korrekt "0" bei leerer Datenbank
- **Schwere:** OK
- **Beschreibung:** Alle KPI-Karten zeigen korrekt "0" Werte. Offene Angebote: 0, Projekte: 0, Aktive Baustellen: 0, etc. Die Prozent-Angaben "+12% vs. Vormonat" bei leeren Daten sind allerdings irreführend.
- **Erwartung:** Bei 0 Daten sollte "+12%" nicht angezeigt werden, sondern "–" oder "0%".

### F-007: "Projekte nach Phase" Kanban-Board korrekt
- **Schwere:** OK
- **Beschreibung:** Das Kanban-Board zeigt 4 Phasen (Angebot, Planung, Durchführung, Abschluss) mit je "0 Projekte". Drag & Drop Hinweis vorhanden.

### F-008: Schnellaktionen vorhanden und logisch
- **Schwere:** OK
- **Beschreibung:** 4 Schnellaktionen: Neues Projekt anlegen, Objektaufnahme starten, Angebot erstellen, HubSpot synchronisieren. Logisch korrekt.

### F-009: HubSpot Sync zeigt "Verbunden" mit Hub ID
- **Schwere:** OK
- **Beschreibung:** HubSpot-Integration zeigt "Verbunden", Hub ID: 26519608, 1000+ Unternehmen/Kontakte/Deals.

### F-010: Onboarding-Dialog bleibt nach "Später" sichtbar
- **Schwere:** Bug
- **Beschreibung:** Nach Klick auf "Später" bleibt ein leerer Dialog-Rest sichtbar (zwei Buttons ohne Text). Der Dialog wird nicht korrekt geschlossen.
- **Erwartung:** Dialog sollte vollständig verschwinden.

---

## Phase 2: Projekt anlegen (ProjektWizard)

### F-011: Unternehmen-Suche im Wizard funktioniert nicht (KORRIGIERT)
- **Schwere:** Minor (UX)
- **Beschreibung:** Die Suchfunktion im Unternehmen-Feld des ProjektWizards filtert nicht korrekt. Wenn man Text in das Suchfeld eingibt, werden keine Ergebnisse angezeigt. Aber: Klickt man direkt auf den Select-Button ("Unternehmen wählen..."), öffnet sich das Dropdown korrekt mit allen 100 HubSpot-Unternehmen.
- **Erwartung:** Die Suchfunktion sollte die Dropdown-Liste filtern.
- **Workaround:** Direkt auf den Select-Button klicken statt die Suche zu verwenden.

### F-012: Wizard zeigt 4 Schritte (Grunddaten, HubSpot, Team & Termine, Zusammenfassung)
- **Schwere:** OK
- **Beschreibung:** Wizard-Struktur ist logisch: Grunddaten → HubSpot-Verknüpfung → Team & Termine → Zusammenfassung.

### F-013: Entwurf-Button vorhanden
- **Schwere:** OK
- **Beschreibung:** "Entwurf"-Button ist sichtbar, ermöglicht Zwischenspeichern.

### F-014: Unternehmen & Kontakte Seite zeigt 100 Unternehmen aus HubSpot
- **Schwere:** OK
- **Beschreibung:** Die Kontakte-Seite zeigt 100 Unternehmen und 100 Kontakte aus HubSpot. Alle sind als "Hausverwaltung" kategorisiert. Suche und Filter vorhanden.
- **Korrektur F-011:** Das Problem liegt nicht darin, dass keine Unternehmen existieren, sondern dass das Dropdown im ProjektWizard die HubSpot-Unternehmen nicht lädt. Die Suche im Wizard funktioniert nicht.

### F-016: Unternehmen-Select zeigt abgeschnittenen Text
- **Schwere:** Minor (UX)
- **Beschreibung:** Nach Auswahl eines Unternehmens ("Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG") wird der Name im Select-Button abgeschnitten. Der volle Name ist nicht lesbar. Kein Tooltip bei Hover.
- **Erwartung:** Langer Firmenname sollte entweder umbrechen oder per Tooltip vollständig angezeigt werden.

### F-015: "Neues Unternehmen" zeigt Toast "Funktion in Entwicklung"
- **Schwere:** Major (Workflow-Blocker)
- **Beschreibung:** Der Button "Neues Unternehmen" auf der Kontakte-Seite zeigt einen Toast "Unternehmen hinzufügen - Funktion in Entwicklung". Man kann kein neues Unternehmen manuell anlegen.
- **Logik-Problem:** Wenn das ProjektWizard-Dropdown die HubSpot-Unternehmen nicht lädt UND man kein neues Unternehmen anlegen kann, ist der Projekt-Erstellungs-Workflow komplett blockiert.
- **Workaround:** Existierendes HubSpot-Unternehmen im ProjektWizard verwenden (falls Dropdown funktioniert).

### F-017: HubSpot-Schritt (Schritt 2) korrekt
- **Schwere:** OK
- **Beschreibung:** Schritt 2 zeigt HubSpot-Deal-Verknüpfung (optional). Deal-Suche und Select vorhanden. "Optional"-Badge korrekt angezeigt. Fortschrittsbalken zeigt 50%.

### F-018: Datumseingabe nimmt Wert nicht an
- **Schwere:** Major (UX)
- **Beschreibung:** Im Schritt 3 (Team & Termine) zeigen die Datumsfelder "Geplanter Start" und "Geplantes Ende" nach Eingabe von "2026-04-01" und "2026-06-30" weiterhin "tt.mm.jjjj" als Placeholder. Die Werte werden offenbar nicht übernommen. Möglicherweise ein Problem mit dem nativen Date-Input und dem Browser-Format.
- **Erwartung:** Nach Eingabe sollte das Datum sichtbar im Feld stehen.
- **Logik-Problem:** Wenn Termine nicht gesetzt werden können, ist die Zeitplanung im Wizard wirkungslos.
- **Bestätigt in Zusammenfassung:** Schritt 4 zeigt "Geplanter Start: —" und "Geplantes Ende: —" – die Datumswerte wurden nicht gespeichert.

### F-019: Zusammenfassung (Schritt 4) zeigt korrekte Daten
- **Schwere:** OK (mit Einschränkung F-018)
- **Beschreibung:** Zusammenfassung zeigt: Projektname korrekt, Beschreibung korrekt, Unternehmen korrekt ("Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG"), Ansprechpartner "—", HubSpot-Deal "Kein Deal verknüpft", Status "Objektaufnahme". Geplanter Start und Ende fehlen (s. F-018).
- **Positiv:** "Fast fertig!" Text und 100% Fortschrittsbalken motivierend. "Fertig!"-Button gut sichtbar in Grün.

### F-020: Zusammenfassung zeigt Terminhinweise nicht
- **Schwere:** Minor (UX)
- **Beschreibung:** Die eingegebenen Terminhinweise ("Nicht vor April starten – Frostgefahr...") werden in der Zusammenfassung nicht angezeigt. Der Nutzer kann nicht prüfen, ob seine Notizen gespeichert wurden.
- **Erwartung:** Terminhinweise sollten in der Zusammenfassung sichtbar sein.

### F-021: Projekt erfolgreich erstellt
- **Schwere:** OK
- **Beschreibung:** Projekt "Fassadenreinigung Wohnanlage Grüner Weg" wurde erfolgreich erstellt. Projektnummer: 2026-GEM-01. Status: "Objektaufnahme". Toast-Meldung "Projekt erstellt" erscheint. Projekt erscheint in der Übersicht mit korrektem Namen, Phase und Nummer. KPI-Zähler zeigt "1 Gesamt".
- **Positiv:** Automatische Projektnummer-Generierung (2026-GEM-01) basiert auf Unternehmensnamen und Jahr. Saubere Weiterleitung zur Projektübersicht.

### F-022: Projektnummer-Logik
- **Schwere:** Info (Konzeptionell)
- **Beschreibung:** Projektnummer "2026-GEM-01" leitet sich ab aus: Jahr (2026) + Kürzel des Unternehmens (GEM für "Gemeinnützige...") + laufende Nummer (01). Das ist eine sinnvolle Konvention.

### F-023: ProjektDetail-Seite – Hervorragend strukturiert
- **Schwere:** OK
- **Beschreibung:** Die ProjektDetail-Seite zeigt:
  - Header: Projektname + Phase-Badge "Objektaufnahme" + Projektnummer
  - Workflow-Hinweis: "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden"
  - KPI-Karten: Immobilien (0), Gesamtfläche (–), Fortschritt (0%), Dokumente (0)
  - Projektzeitstrahl: 10 Phasen visuell dargestellt, Phase 1 grün markiert
  - Tabs: Übersicht, Immobilien, Angebote, Aufträge, Baustellen, Finanzen, Dokumente, Aufgaben, Teams
  - Projektdaten: Projektnummer + Notizen (inkl. Terminhinweise!)
- **Positiv:** Terminhinweise wurden doch gespeichert (als Teil der Notizen). Workflow-Logik zeigt korrekt an, was als Nächstes zu tun ist.

### F-024: Workflow-Logik korrekt implementiert
- **Schwere:** OK
- **Beschreibung:** Der Workflow zeigt "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot." Das ist logisch korrekt: Ohne Angebot kann die Phase nicht zu "Angebot erstellt" wechseln. Der "Angebot"-Button oben rechts ermöglicht den direkten Sprung zur Angebotserstellung.

### F-025: Breadcrumb zeigt Projekt-ID statt Name
- **Schwere:** Minor (UX)
- **Beschreibung:** Die Breadcrumb zeigt "Übersicht > Projekte > Projekt 60001" statt den Projektnamen oder die Projektnummer. "60001" ist die interne DB-ID und für den Nutzer nicht aussagekräftig.
- **Erwartung:** Breadcrumb sollte "Projekte > 2026-GEM-01" oder den Projektnamen zeigen.

---

## Phase 3: Immobilie erfassen

### F-026: "Immobilie hinzufügen" zeigt Toast statt Wizard
- **Schwere:** Critical (Workflow-Blocker)
- **Beschreibung:** Der Button "Immobilie hinzufügen" im Immobilien-Tab des Projekts zeigt einen Toast: "Immobilie hinzufügen – Diese Funktion wird in der finalen Version verfügbar sein." Es öffnet sich kein ImmobilienWizard.
- **Logik-Problem:** Ohne Immobilien kann keine Fläche erfasst werden → kein Angebot erstellt werden → kein Auftrag gewonnen werden. Der gesamte Workflow ist ab hier blockiert.
- **Erwartung:** Der ImmobilienWizard sollte sich öffnen (Adresse, Fassadentyp, Fläche, Schadensart).
- **Workaround:** Immobilie über die globale Immobilien-Seite (Sidebar) anlegen und dem Projekt zuordnen.

### F-027: Globale Immobilien-Seite zeigt existierende Immobilie
- **Schwere:** OK
- **Beschreibung:** Die Immobilien-Seite zeigt 1 Immobilie: "An der Saalebahn 8a, 06118 Halle (Saale)". Status: "Nicht zugeordnet". KPIs: 1 Immobilie, 0 m² Reinigungsfähig, 0 Fotos, 0 Mit Projekt. "Neue Immobilie"-Button vorhanden.
- **Frage:** Woher kommt diese Immobilie? Sie wurde nicht im Test angelegt. Möglicherweise aus einem früheren Test oder als Seed-Daten.

### F-028: ImmobilienWizard öffnet sich korrekt über globale Seite
- **Schwere:** OK
- **Beschreibung:** Der "Neue Immobilie"-Button auf der globalen Immobilien-Seite öffnet den Wizard "Objektaufnahme" mit 6 Schritten (Stammdaten, Frontseite, Rückseite, Linker Giebel, ...). Schritt 1 zeigt:
  - Adresse: Straße & Nr., PLZ, Ort (alle Pflichtfelder)
  - Unternehmen & Ansprechpartner (kaskadierend: erst Unternehmen, dann Ansprechpartner)
  - Projekt-Zuordnung (optional, kaskadierend: erst Unternehmen)
  - Aufnahmedatum (vorbelegt mit heute: 09.02.2026) und Aufnehmender
- **Positiv:** Sehr gut strukturierter Wizard. Kaskadierende Dropdowns logisch. Datum vorbelegt. Hilfe-Icons vorhanden.
- **Konzeptionell korrekt:** "Erfasse alle Seiten der Immobilie" – das entspricht dem FassadenFix-Konzept der Fassadenaufnahme pro Gebäudeseite.

### F-029: Kaskadierende Dropdowns funktionieren korrekt
- **Schwere:** OK
- **Beschreibung:** Nach Auswahl von "Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG" werden:
  - Ansprechpartner-Dropdown aktiv: zeigt "Keine Kontakte für dieses Unternehmen" (korrekt, da keine Kontakte hinterlegt)
  - Projekt-Dropdown aktiv: zeigt "Projekt wählen..." (sollte unser Projekt anbieten)
- **Positiv:** Kaskadierende Logik funktioniert einwandfrei. Autosave "Zuletzt 06:32" sichtbar.

### F-030: Frontseite-Wizard – Schritt 2 von 6
- **Schwere:** OK / Minor
- **Beschreibung:** Schritt 2 "Frontseite" zeigt:
  - Aufmaß: Breite (m), Höhe (m), Fläche (m²) – automatisch berechnet
  - Fotos: Galerie + Kamera Buttons, Drag&Drop Zone, Video-Upload, 360°-Tour URL
  - Zuwegung: "Nein, alles OK" / "Ja, problematisch" Toggle
  - Fortschrittsbalken zeigt 33%
- **Positiv:** Sehr praxisnah! Kamera-Button für Vor-Ort-Aufnahmen, 360°-Tour Integration, Zuwegungsprüfung
- **Minor:** Fläche zeigt "0 m²" statt leer – könnte verwirrend sein wenn noch keine Maße eingegeben
- **Konzeptionell:** Entspricht exakt dem FassadenFix-Konzept der seitenweisen Fassadenaufnahme

### F-031: Flächenberechnung automatisch + Fassadenart + Reinigungsfähigkeit
- **Schwere:** OK
- **Beschreibung:** Nach Eingabe von Breite 45m und Höhe 12m zeigt Fläche automatisch "540 m²" – korrekt!
  - "Seite 1 von 4" Anzeige oben
  - Reinigungsfähig? Ja/Nein Toggle (Standard: Nein)
  - Fassadenart-Dropdown (Pflichtfeld)
  - Beschreibung der Seite: "Die Seite mit den Hauseingängen (Frontseite)"
- **Positiv:** Automatische Flächenberechnung sofort nach Eingabe. Sehr gute UX.
- **Finding:** Reinigungsfähig steht auf "Nein" als Default – bei Fassadenreinigung sollte der Default "Ja" sein (Minor)

### F-032: Zusammenfassung Objektaufnahme – hervorragend
- **Schwere:** OK
- **Beschreibung:** Zusammenfassung zeigt:
  - Zuordnung: Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG → Fassadenreinigung Wohnanlage Grüner Weg
  - 4 Seiten erfasst | 1.368 m² Gesamtfläche | 1.368 m² Reinigungsfähig | 0 Fotos
  - Frontseite: 540 m² · WDVS · Reinigungsfähig · 0 Fotos
  - Rückseite: 540 m² · WDVS · Reinigungsfähig · 0 Fotos
  - Linker Giebel: 144 m² · WDVS · Reinigungsfähig · 0 Fotos
  - Rechter Giebel: 144 m² · WDVS · Reinigungsfähig · 0 Fotos
- **Positiv:** Flächenberechnung korrekt (540+540+144+144=1.368). Alle Seiten mit Fassadenart und Reinigungsfähigkeit. Fortschrittsbalken 100%.
- **Konzeptionell:** Entspricht exakt dem FassadenFix-Workflow. Entwurf-Button ermöglicht Zwischenspeichern.
- **Finding:** Unternehmen zeigt "Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG" statt "Spar- und Bauverein" – das war der falsche Eintrag, den ich im Dropdown gewählt habe. Kein Bug, sondern Bedienfehler.

### F-033: Immobilie erfolgreich gespeichert
- **Schwere:** OK
- **Beschreibung:** Toast "Objektaufnahme abgeschlossen" + "Grüner Weg 1-8, Hannover wurde erfolgreich in der Datenbank gespeichert"
  - Immobilien-Übersicht zeigt jetzt: 2 Immobilien | 1.4k m² Reinigungsfähig | 0 Fotos | 1 Mit Projekt
  - Tabelle: Grüner Weg 1-8, 30159 Hannover | 1.368 m² | 1.368 m² reinigungsfähig | Fassadenreinigung Wohnanlage Grüner Weg | 0 Fotos
- **Positiv:** Speicherung funktioniert einwandfrei. Zuordnung zum Projekt korrekt. KPI-Karten aktualisiert.

---

## Phase 4: Angebot erstellen

### F-034: AngebotsWizard öffnet sich korrekt
- **Schwere:** OK
- **Beschreibung:** "Neues Angebot erstellen" Wizard mit 5 Schritten:
  1. Projekt (Unternehmen & Projekt wählen)
  2. Immobilien & Seiten
  3. Kalkulation
  4. (weitere Schritte)
  5. (weitere Schritte)
- **Positiv:** Klare Struktur, Fortschrittsbalken 20%, Unternehmen-Suche mit Dropdown
- **Hinweis:** "Erstelle in 5 Schritten ein vollständiges Angebot nach FassadenFix Preisstaffelung" – gute Beschreibung

### F-035: Unternehmenssuche im AngebotsWizard filtert nicht (BUG)
- **Schwere:** Major
- **Beschreibung:** Eingabe von "Neustrelitz" in das Suchfeld filtert die Dropdown-Liste NICHT. Alle Unternehmen bleiben sichtbar, die Suche hat keinen Effekt.
- **Erwartung:** Dropdown sollte nur "Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG" anzeigen
- **Tatsächlich:** Alle ~50 Unternehmen werden weiterhin angezeigt
- **Auswirkung:** Bei vielen Unternehmen muss der Nutzer manuell scrollen – schlechte UX
- **Workaround:** Manuell durch die Liste scrollen

### F-036: Unternehmen-Auswahl zeigt kaskadierend Kontakte und Projekte
- **Schwere:** OK (mit Hinweis)
- **Beschreibung:** Nach Auswahl "Gemeinnützige Wohnbaugenossenschaft e.G. Hauzenberg" zeigt:
  - "0 Kontakt(e), 0 Projekt(e) verfügbar" + Spinner lädt Projekte
- **Konzeptionell:** Kaskadenlogik funktioniert: Unternehmen → zeigt zugehörige Kontakte + Projekte
- **Hinweis:** Ich habe absichtlich ein falsches Unternehmen gewählt (Hauzenberg statt Neustrelitz), weil die Suche nicht filtert (F-035). Jetzt muss ich zurück und das richtige wählen.
- **Finding:** Kein Projekt-Dropdown erscheint, wenn das Unternehmen 0 Projekte hat – logisch korrekt

### F-037: Dropdown-Navigation – End-Taste funktioniert, Suche nicht
- **Schwere:** Major (Bestätigung F-035)
- **Beschreibung:** End-Taste springt korrekt ans Ende der Liste (ZWG Zehdenicker). Aber Neustrelitz ist NICHT in der sichtbaren Liste! Die Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG, die bei der Immobilie zugeordnet wurde, erscheint nicht im Angebots-Dropdown.
- **Analyse:** Der AngebotsWizard lädt aus der LOKALEN DB (getCompaniesForOfferWizard). Neustrelitz und Spar-und-Bauverein existieren BEIDE in der DB (2 Treffer). Die Funktion lädt ALLE Unternehmen per `db.select().from(companies)`. Trotzdem erscheint Neustrelitz nicht im Dropdown. Mögliche Ursache: Frontend-Rendering-Problem oder die Dropdown-Komponente schneidet bei zu vielen Einträgen ab.
- **Auswirkung:** Nutzer kann kein Angebot für das zugeordnete Unternehmen erstellen – Workflow-Bruch!
- **Workaround:** Anderes Unternehmen wählen oder Unternehmen in HubSpot anlegen

### F-038: Schritt 2 "Immobilien & Seiten" zeigt 0 m² (erwartet)
- **Schwere:** Info (Konsequenz aus F-037)
- **Beschreibung:** Schritt 2 zeigt:
  - "Gesamtfläche (ausgewählt): 0 m²"
  - "Preisstaffel: unter 500 m² (individuell) → 10,50 €/m²"
  - "Bitte wähle mindestens eine Seite aus."
  - "Alle Seiten auswählen" / "Auswahl aufheben" Buttons
- **Positiv:** Preisstaffel-Logik ist korrekt implementiert (unter 500 m² = 10,50 €/m²)
- **Positiv:** Fortschrittsbalken korrekt auf 40%
- **Problem:** Keine Immobilien/Seiten verfügbar, weil Hauzenberg 0 Projekte hat
- **Konzeptionell korrekt:** Der Wizard zeigt nur Seiten aus Immobilien des gewählten Unternehmens
- **Workflow-Bruch:** Ohne zugeordnete Immobilien kann kein Angebot erstellt werden


### F-039: Aufträge-Seite – Struktur korrekt, Empty State gut
- **Schwere:** OK
- **Beschreibung:** Aufträge-Seite zeigt:
  - KPI-Karten: Gesamt 0, In Arbeit 0, Bestätigt 0, Abgeschlossen 0
  - Suchfeld + Status-Filter
  - Empty State: "Keine Aufträge gefunden – Erstelle deinen ersten Auftrag."
  - "Neuer Auftrag" Button oben rechts
- **Positiv:** Konsistentes Layout wie Angebote-Seite
- **Konzeptionell:** Aufträge entstehen aus angenommenen Angeboten – ohne Angebote keine Aufträge (logisch korrekt)


### F-040: Baustellen-Badge zeigt "4" aber 0 Baustellen vorhanden (BUG)
- **Schwere:** Major
- **Beschreibung:** Die Sidebar zeigt "Baustellen 4" (Badge mit Zahl 4), aber die Baustellen-Seite zeigt "0 Gesamt, 0 Aktiv, 0 Geplant, 0 Pausiert" und "Noch keine Baustellen vorhanden".
- **Ursache:** Das Badge "4" stammt vermutlich aus Mock-Daten (MOCK_BAUSTELLEN in shared/const.ts hatte 4 Einträge). Die Badge-Zahl wurde nicht an die echte DB-Abfrage angebunden.
- **Auswirkung:** Verwirrend für den Nutzer – suggeriert 4 aktive Baustellen, die nicht existieren
- **Fix:** Badge sollte aus der DB geladen werden oder entfernt werden

### F-041: Baustellen-Tabelle hat Spaltenheader aber keine Daten
- **Schwere:** OK (Empty State)
- **Beschreibung:** Tabelle zeigt Spalten: Baustelle, Projekt, Zeitraum, Fortschritt, Status
- **Positiv:** Professionelle Tabellenstruktur, konsistentes Layout


### F-042: Terminfinder – Hervorragendes Kalender-UI
- **Schwere:** OK (Positiv)
- **Beschreibung:** Terminfinder zeigt:
  - KPI-Karten: Heute 0, Diese Woche 0, Bestätigt 0, Gesamt 0
  - Vollständiger Kalender (Februar 2026) mit Tagesauswahl (heute 9. Feb markiert)
  - "Termine am Mo., 09.02." mit Empty State "Keine Termine"
  - Schnellbuchung: Besichtigungstermin, Kundenbesprechung, Baustellenbegehung
  - "Neuer Termin" Button
- **Positiv:** Sehr professionelle Kalender-Implementierung mit Wochentag-Header
- **Positiv:** Schnellbuchung-Buttons für häufige Termintypen – exzellente UX
- **Positiv:** Heutiger Tag rot hervorgehoben – gute visuelle Orientierung


### F-043: Finanzübersicht – Beeindruckendes Dashboard, aber Mock-Daten (KONZEPTIONELL)
- **Schwere:** Minor (Konzeptionell)
- **Beschreibung:** Finanzübersicht zeigt:
  - KPI-Karten: Gesamtumsatz 3.10 Mio €, Gesamtkosten 2.21 Mio €, Gewinn 884 T€, Marge 29%
  - Umsatz-/Gewinnentwicklung Chart (Monatlich, 12 Monate)
  - Quartalsvergleich Chart (Q1-2025 bis Q1-2026)
  - 4 Tabs: Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus
  - Schnellaktionen: Neue Rechnung, Zahlung erfassen, Budget anlegen, Mahnlauf
  - Export: Excel + PDF Buttons
- **Positiv:** Sehr professionelle Finanz-Darstellung mit Charts und Vorjahresvergleich
- **Konzeptionell:** Die Daten (3.10 Mio €) sind NICHT aus der DB berechnet, sondern Mock-Daten. Da wir gerade erst 1 Projekt angelegt haben, sollten die Finanzen 0 € zeigen.
- **Auswirkung:** Für ein Mockup/Demo akzeptabel, aber für Produktivbetrieb müssen die Finanzdaten aus echten Rechnungen/Aufträgen berechnet werden.

### F-044: Finanz-Charts zeigen Daten trotz leerer DB
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Die Umsatz- und Gewinnentwicklung zeigt Linien mit Werten, obwohl keine Rechnungen/Aufträge existieren. Der Quartalsvergleich zeigt ebenfalls Balken.
- **Auswirkung:** Inkonsistenz zwischen Finanzansicht (zeigt Millionen) und Aufträge/Angebote (zeigt 0)


### F-045: Garantien & Inspektionen – Konsistent, Empty State korrekt
- **Schwere:** OK
- **Beschreibung:** Zeigt 0 Gesamt, 0 Aktiv, 0 Beansprucht, 0 Abgelaufen. Empty State korrekt.

### F-046: Kundenportal – Beeindruckend, aber KOMPLETT Mock-Daten (CRITICAL)
- **Schwere:** Critical (Konzeptionell)
- **Beschreibung:** Das Kundenportal zeigt:
  - "Willkommen, WG Sonnenhof eG" – ein Unternehmen das NICHT in der DB existiert
  - "2 Projekte, 1 Aktive Garantien, 5 Dokumente, Jul 2026 Nächste Inspektion"
  - "Wohnanlage Sonnenhof P-2026-001" mit 65% Fortschritt – existiert NICHT in der DB
  - Projektverlauf: Auftrag erteilt (05.12.2025), Planung (10.01.2026), Durchführung (15.01.2026)
  - "Abgeschlossene Projekte: Parkanlage West" – existiert NICHT
  - 5 Tabs: Meine Projekte, Garantien, Dokumente, Kontakt, Feedback
  - "Bewohnerinfo" Button
- **Problem:** Das GESAMTE Kundenportal zeigt hardcodierte Mock-Daten statt echter DB-Daten!
- **Auswirkung:** Für ein Mockup/Demo verständlich, aber für Produktivbetrieb KOMPLETT unbrauchbar
- **Konzeptionell:** Das Kundenportal sollte die Projekte des eingeloggten Kunden aus der DB laden

### F-047: Kundenportal zeigt "WG Sonnenhof eG" – Inkonsistenz mit DB
- **Schwere:** Major (Konsistenz)
- **Beschreibung:** Das Kundenportal begrüßt "WG Sonnenhof eG", aber unser Testprojekt ist für "Spar- und Bauverein eG" angelegt. Das Portal zeigt keine Verbindung zu echten Daten.
- **Auswirkung:** Nutzer sieht falsche Daten – Vertrauensverlust


### F-048: Ressourcen/Materialien – Hervorragender Mitarbeiter-Kalender, aber Mock-Daten
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Die Ressourcen-Seite (/materialien) zeigt:
  - Wochenansicht 09.-15. Feb 2026 mit Mitarbeiter-Kalender
  - 6 Mitarbeiter: Thomas Braun (Bauleiter), Max Müller (Facharbeiter), Anna Schmidt (Facharbeiter), Peter Weber (Facharbeiter), Lisa Braun (Auszubildende), Tom Fischer (Facharbeiter)
  - Farbkodierte Einsätze: Sonnenhof (grün), Parkstraße (blau), Zentrum (lila), Schulung (orange), Verfügbar (grau)
  - 5 Tabs: Mitarbeiter, Waschbusse, FF Bühnen, Mietbühnen, Reinigungsmittel
  - "Neue Buchung" Button
- **Positiv:** Exzellentes Kalender-UI mit Farbkodierung und Legende
- **Problem:** Die Mitarbeiter-Daten (Thomas Braun, Max Müller etc.) und Einsätze (Sonnenhof, Parkstraße) sind Mock-Daten, die nicht aus der DB kommen
- **Konzeptionell:** Für ein Mockup akzeptabel, aber die Einsätze sollten aus echten Baustellen-Zuordnungen kommen

### F-049: Route /materialien zeigt noch "Ressourcen" als Seitentitel
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Die Route wurde von /ressourcen auf /materialien umbenannt (M-02), aber der Seitentitel zeigt noch "Ressourcen" statt "Materialien & Geräte". Auch die Breadcrumb zeigt nur "Übersicht".
- **Fix:** Seitentitel in der Komponente aktualisieren

### F-050: Breadcrumb zeigt nur "Übersicht" ohne Seitenname
- **Schwere:** Minor (UX)
- **Beschreibung:** Die Breadcrumb auf /materialien zeigt nur "Übersicht" ohne den aktuellen Seitennamen. Auf anderen Seiten (z.B. Angebote) zeigt sie "Übersicht > Angebote".


### F-051: Einstellungen – Profil korrekt befüllt, 6 Tabs
- **Schwere:** OK (Positiv)
- **Beschreibung:** Einstellungen zeigt:
  - 6 Tabs: Profil, System, Benachrichtigungen, Integrationen, Sicherheit, Backup
  - Profil zeigt: Alexander Retzlaff, Administrator, a.retzlaff@fassadenfix.de
  - Vorname, Nachname, E-Mail, Telefon, Position, Abteilung editierbar
  - Passwort ändern Formular
  - "Änderungen speichern" Button
- **Positiv:** Profil korrekt aus OAuth-Daten befüllt (Alexander Retzlaff)
- **Positiv:** Professionelle Formular-Struktur mit Validierung


### F-052: ProjektDetail – Exzellenter Projektzeitstrahl mit 10 Phasen
- **Schwere:** OK (Positiv)
- **Beschreibung:** ProjektDetail zeigt:
  - Projektzeitstrahl mit 10 Phasen: Objektaufnahme → Angebot erstellt → Angebot versendet → Nachfassen → Auftrag gewonnen → Planung → Vorbereitung → Durchführung → Abnahme → Abgeschlossen
  - Aktuelle Phase "Objektaufnahme" grün markiert
  - Workflow-Hinweis: "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot."
  - KPI-Karten: Immobilien 1, Gesamtfläche –, Fortschritt 0%, Dokumente 0
  - 9 Tabs: Übersicht, Immobilien (1), Angebote (0), Aufträge (0), Baustellen (0), Finanzen, Dokumente (0), Aufgaben (0), Teams
  - Projektdaten: Nummer 2026-GEM-01, Notizen korrekt befüllt
  - "Angebot" Button oben rechts
- **Positiv:** Workflow-Logik korrekt – verhindert Phasenwechsel ohne Angebot
- **Positiv:** Notizen enthalten alle eingegebenen Daten inkl. Terminhinweise

### F-053: Gesamtfläche zeigt "–" statt berechneter Fläche (BUG)
- **Schwere:** Major
- **Beschreibung:** Obwohl 1 Immobilie mit 4 Seiten (Front 45×12, Rück 45×12, Links 12×12, Rechts 12×12 = 1.368 m²) zugeordnet ist, zeigt die Gesamtfläche "–" statt "1.368 m²".
- **Ursache:** Möglicherweise wird die Fläche nicht aus den Immobilien-Seiten berechnet oder die Zuordnung ist nicht korrekt
- **Auswirkung:** Wichtige Kenngröße fehlt – Nutzer kann Projektumfang nicht auf einen Blick erfassen

### F-054: Workflow-Gate korrekt implementiert
- **Schwere:** OK (Positiv)
- **Beschreibung:** Der Workflow verhindert den Phasenwechsel zu "Angebot erstellt" solange kein Angebot existiert. Das ist konzeptionell korrekt und eine wichtige Geschäftsregel.

### F-055: "Angebot" Button im ProjektDetail – Schnellzugriff
- **Schwere:** OK (Positiv)
- **Beschreibung:** Oben rechts gibt es einen "Angebot" Button, der direkt zum AngebotsWizard führt. Gute UX für den häufigsten nächsten Schritt.


### F-056: "Team einplanen" Sidebar-Link führt zu 404 (BUG)
- **Schwere:** Major
- **Beschreibung:** Der Sidebar-Link "Team einplanen" verlinkt auf /einsatzplanung, aber die tatsächliche Route in App.tsx ist /team-einplanen NICHT registriert. Die Route /einsatzplanung existiert als eigene Seite.
- **Analyse:** 
  - Sidebar: href="/einsatzplanung" (DashboardLayout.tsx Zeile 140)
  - App.tsx: Route /team → Team-Seite (Zeile 146), Route /einsatzplanung existiert NICHT
  - Es gibt /teamleitercheck (Zeile 122) als separate Route
- **Fix:** Entweder Route /einsatzplanung in App.tsx registrieren oder Sidebar-Link auf /team ändern

### F-057: 404-Seite zeigt englischen Text statt Deutsch (BUG)
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Die 404-Seite zeigt "Page Not Found – Sorry, the page you are looking for doesn't exist." statt deutscher Übersetzung.
- **Auswirkung:** Inkonsistenz mit der durchgehend deutschen UI

### F-058: 404-Seite hat keinen DashboardLayout (BUG)
- **Schwere:** Minor (UX)
- **Beschreibung:** Die 404-Seite zeigt kein Sidebar-Layout, sondern eine zentrierte Karte auf weißem Hintergrund. Der Nutzer verliert die Navigation und muss "Go Home" klicken.
- **Fix:** 404-Seite innerhalb des DashboardLayouts rendern


### F-059: Route-Vergleich Sidebar vs App.tsx – Alle Links haben Routen (OK)
- **Schwere:** OK
- **Beschreibung:** Vollständiger Vergleich aller 34 Sidebar-Links mit App.tsx-Routen zeigt: ALLE Sidebar-Links haben eine korrespondierende Route. F-056 war ein Irrtum – /einsatzplanung existiert als Route in App.tsx. Das 404-Problem muss an der Seiten-Komponente liegen.
- **Korrektur F-056:** Die Route /einsatzplanung existiert in App.tsx. Das 404 muss ein anderes Problem sein (z.B. fehlende Komponente oder Lazy-Load-Fehler).


### F-056 KORREKTUR: /einsatzplanung funktioniert korrekt – KEIN 404
- **Schwere:** Korrektur – F-056 war ein Testfehler (falscher URL /team-einplanen statt /einsatzplanung)
- **Beschreibung:** Die Einsatzplanung öffnet sich korrekt unter /einsatzplanung mit DashboardLayout

### F-060: Einsatzplanung – Hervorragendes Zug-System, aber Mock-Daten
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Die Einsatzplanung zeigt:
  - 3 Tabs: Züge & Mitarbeiter, Projekt-Zuordnung, Einsatzkalender
  - Verfügbare Mitarbeiter: 2 nicht zugeordnet (Andreas Koch, Frank Becker – beide "Urlaub")
  - Zug Alpha: Leiter Stefan Weber, 3 Mitglieder, 3 Projekte
  - Zug Bravo: Leiter Peter Hoffmann, 3 Mitglieder, 2 Projekte
  - Zug Charlie: Leiter Jürgen Wagner, 0 Mitglieder, 0 Projekte – "Mitarbeiter hierher ziehen"
  - Drag-and-Drop Funktionalität angedeutet
  - "Neuer Zug" Button, Mitarbeiter-Suche
- **Positiv:** Exzellentes Konzept mit Zügen (Kolonnen) – praxisnah für Fassadenreinigung
- **Problem:** Mitarbeiter-Daten sind Mock-Daten, nicht aus der DB


### F-061: Sidebar Badge "Baustellen 4" vs 0 echte Baustellen (CRITICAL)
- **Schwere:** Critical (Konsistenz)
- **Beschreibung:** Die Sidebar zeigt "Baustellen 4" als Badge, aber die Baustellen-Seite zeigt "0 Gesamt, 0 Aktiv, 0 Geplant, 0 Pausiert" und "Noch keine Baustellen vorhanden". Die Badge-Zahl kommt aus Mock-Daten (MOCK_BAUSTELLEN in shared/const.ts), während die Seite echte DB-Daten zeigt.
- **Auswirkung:** Nutzer wird irregeführt – erwartet 4 Baustellen, findet 0
- **Fix:** Badge muss aus DB-Daten berechnet werden, nicht aus Mock-Daten


### F-062: Berichtswesen – KPIs zeigen Mock-Daten, Charts zeigen echte Daten (INKONSISTENZ)
- **Schwere:** Major (Konsistenz)
- **Beschreibung:** Die KPI-Karten zeigen: Gesamtumsatz 1.25 Mio € (+18%), Aktive Projekte 28 (+12%), Conversion Rate 77% (+5%), Bearbeitete Fläche 115.000 m² (-3%). ABER: Die Charts zeigen korrekt 0 m² für alle Phasen und der Umsatz-Chart ist leer. Die KPI-Zahlen sind Mock-Daten, die Charts kommen aus der DB.
- **Auswirkung:** Widersprüchliche Darstellung – KPIs sagen "28 Projekte", DB hat 1 Projekt

### F-063: Flächen nach Typ zeigt Phasen-IDs statt Labels (BUG)
- **Schwere:** Minor (UX)
- **Beschreibung:** Die "Flächen nach Typ" Legende zeigt technische Phasen-IDs wie "objektaufnahme", "angebot_erstellt", "angebot_versendet" statt der benutzerfreundlichen Labels "Objektaufnahme", "Angebot erstellt", "Angebot versendet".
- **Fix:** PROJECT_PHASES Labels verwenden statt der technischen IDs

### F-064: Berichte Excel/PDF-Export Buttons vorhanden
- **Schwere:** OK (Positiv)
- **Beschreibung:** Excel- und PDF-Bericht Export-Buttons sind vorhanden. 4 Tabs: Umsatz, Conversion, Projekte, Mitarbeiter.


### F-065: HubSpot Integration – Verbunden, Daten laden (OK)
- **Schwere:** OK (Positiv)
- **Beschreibung:** HubSpot zeigt "Verbunden" Status, 4 Tabs (Kontakte, Unternehmen, Deals, Sync-Protokoll), "Jetzt synchronisieren" Button, Auto-Sync Toggle (deaktiviert). Kontakte werden geladen (Skeleton-Loader sichtbar).
- **Positiv:** Echte HubSpot-Integration funktioniert

### F-066: HubSpot KPI-Karten zeigen "Lade..." statt Zahlen
- **Schwere:** Minor (UX)
- **Beschreibung:** Die KPI-Karten für Kontakte, Deals, Unternehmen zeigen grüne Skeleton-Loader statt Zahlen. Entweder dauert das Laden zu lange oder die API-Antwort kommt nicht.

### F-067: Sidebar-Benutzer wechselt zwischen "Alexander Retzlaff" und "Benutzer"
- **Schwere:** Minor (Konsistenz)
- **Beschreibung:** Auf der HubSpot-Seite zeigt die Sidebar unten "Benutzer / Benutzer" statt "Alexander Retzlaff / Büro". Auf anderen Seiten zeigt sie korrekt "Alexander Retzlaff". Möglicherweise ein Auth-State-Problem.

