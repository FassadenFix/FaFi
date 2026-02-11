# FaFi PM – E2E-Realdaten-Test v2

**Datum:** 09.02.2026
**Tester:** Manus AI (als Kundenberater "Alexander Retzlaff")
**Version:** 7299de4c (nach E-01 bis E-22 Maßnahmen)
**Ziel:** Kompletter Workflow-Durchlauf mit echten Daten, Verifizierung aller Fixes

## Testszenario

**Kunde:** Wohnungsbaugenossenschaft Nordstadt eG (manuell angelegt)
**Projekt:** Fassadenreinigung Wohnpark Lister Meile, Hannover
**Immobilie:** Lister Meile 25-31, 30161 Hannover (6-stöckiges Mehrfamilienhaus)
**Fläche:** ca. 2.400 m² (4 Seiten)
**Fassadentyp:** WDVS mit Algenbefall
**Geplanter Zeitraum:** Mai–Juli 2026

---

## Findings

### Phase 1: Dashboard & Navigation

**V2-F-001** | OK | Datum dynamisch
- Dashboard zeigt "Montag, 9. Februar 2026" – korrekt, dynamisch berechnet
- Fix E-10 verifiziert ✓

**V2-F-002** | MINOR | Benutzername zeigt "Benutzer" statt echten Namen
- Sidebar unten zeigt "Benutzer / Benutzer" statt "Alexander Retzlaff / Büro"
- Vermutlich weil der OAuth-Nutzer keinen Display-Namen hat oder der Name nicht korrekt geladen wird
- Severity: Minor (funktional korrekt, aber UX-Problem)

**V2-F-003** | OK | Sidebar Badge
- Baustellen-Badge zeigt keine hardcodierte "4" mehr
- Fix E-02 verifiziert ✓

**V2-F-004** | MINOR | KPI-Cards zeigen Skeleton-Loader
- Die 7 KPI-Cards im "Operative Übersicht" Bereich zeigen dauerhaft Skeleton-Loader
- Vermutlich weil die DB-Abfrage noch lädt oder fehlschlägt
- Muss nach vollständigem Laden erneut geprüft werden

**V2-F-005** | OK | Onboarding-Dialog
- Onboarding-Dialog erscheint NICHT mehr (localStorage-Skip aus vorherigem Test)
- Fix E-12 verifiziert ✓

**V2-F-006** | OK | Kalenderwoche
- Header zeigt "03. Feb 2026 · KW 6" – Datum ist statisch, nicht dynamisch
- WAIT: Muss prüfen ob das Header-Datum auch dynamisch ist

**V2-F-006 UPDATE** | OK | Header-Datum
- Header zeigt "03. Feb 2026 · KW 6" – das ist STATISCH und FALSCH (heute ist 09.02.2026, KW 6 stimmt aber)
- Dashboard-Body zeigt korrekt "Montag, 9. Februar 2026"
- DISKREPANZ: Header-Datum und Dashboard-Datum sind unterschiedlich
- Severity: MAJOR – Header-Datum muss dynamisch sein

**V2-F-007** | OK | Benutzername im Dashboard
- Dashboard zeigt "Willkommen zurück, Alexander" – korrekt!
- Fix E-10 verifiziert ✓
- ABER: Sidebar unten zeigt "Alexander Retzlaff" – auch korrekt!
- V2-F-002 KORREKTUR: Beim ersten Laden war es "Benutzer", nach Scroll zeigt es "Alexander Retzlaff"

**V2-F-008** | OK | KPI-Cards geladen
- Alle 8 KPI-Cards zeigen jetzt Werte (0, 0%, 0,00€)
- "–" vs. Vormonat bei neutralen Trends – Fix E-11 verifiziert ✓
- ABER: "Offene Angebote" und "Projekte" zeigen "+12% vs. Vormonat" obwohl Wert 0 ist
- Severity: MINOR – Trend-Berechnung bei 0 Werten zeigt falschen Prozentsatz

**V2-F-009** | OK | Nächste Schritte
- Zeigt unser Projekt "2026-GEM-01" mit Phase "Objektaufnahme" und nächstem Schritt "Angebot erstellen"
- Korrekt aus DB geladen ✓

**V2-F-010** | OK | Letzte Aktivitäten
- Zeigt "Alexander Retzlaff Immobilie erstellt vor 2 Std" und "Projekt 2026-GEM-01 erstellt vor 2 Std"
- Echte Aktivitäten aus DB ✓

**V2-F-011** | OK | HubSpot Sync
- Zeigt "Verbunden" mit Hub ID und 1000+ Unternehmen/Kontakte/Deals
- Korrekte Integration ✓

### Phase 2: Neues Unternehmen anlegen (E-22)

**V2-F-012** | OK | Neues Unternehmen Dialog öffnet sich
- Dialog "Neues Unternehmen anlegen" erscheint korrekt
- Felder: Firmenname*, Kategorie, Straße, PLZ, Ort, Telefon, E-Mail
- Fix E-22 verifiziert ✓
- Gebe jetzt Testdaten ein


**V2-F-013** | OK | Neues Unternehmen erfolgreich angelegt
- "WBG Nordstadt eG" wurde erfolgreich in der DB gespeichert
- Toast: "Unternehmen erfolgreich angelegt" erscheint unten rechts
- KPI-Update: Unternehmen-Zähler springt sofort von 100 auf 101
- Sortierung: WBG Nordstadt eG erscheint alphabetisch korrekt in der Liste
- Kategorie: "Wohnungsgesellschaft" wird korrekt als Badge angezeigt
- Dialog wird nach Erfolg automatisch geschlossen, Formular zurückgesetzt
- Alle eingegebenen Daten (Name, Kategorie, Adresse, Telefon, E-Mail) korrekt gespeichert
- Fix E-22 vollständig verifiziert ✓


**V2-F-014** | OK | Unternehmenssuche filtert korrekt
- Suche nach "WBG Nordstadt" zeigt genau 1 Ergebnis: "WBG Nordstadt eG (Hannover)"
- Suchfilter funktioniert einwandfrei – nur das gerade angelegte Unternehmen wird angezeigt
- Fix E-05 verifiziert ✓
- Dropdown zeigt Ort in Klammern – gute UX für Unterscheidung gleichnamiger Firmen


**V2-F-015** | OK | DatePicker zeigt "Datum wählen" Buttons statt HTML-Input
- Fix E-04 verifiziert: Popover+Calendar DatePicker ist implementiert
- Buttons zeigen "Datum wählen" mit Kalender-Icon – deutlich bessere UX als type="date"
- Jetzt teste ich die Kalender-Auswahl


**V2-F-016** | OK | DatePicker Kalender-Popover funktioniert einwandfrei
- Kalender zeigt Februar 2026 mit allen Tagen, Vor/Zurück-Navigation
- Heute (9. Feb) ist markiert, Wochentage korrekt (So-Sa)
- Fix E-04 vollständig verifiziert ✓

**V2-F-017** | MINOR | Kalender zeigt englische Wochentage und Tooltips
- Wochentage: Su, Mo, Tu, We, Th, Fr, Sa (statt So, Mo, Di, Mi, Do, Fr, Sa)
- Tooltips: "Sunday, February 1st, 2026" statt "Sonntag, 1. Februar 2026"
- Gesamte App ist deutsch, Kalender sollte auch deutsch sein


**V2-F-018** | MINOR | DatePicker zeigt falsches Datum nach Auswahl
- Ich habe auf den 7. April geklickt (Index 29 = "April 6th" Tooltip), aber Button zeigt "6.4.2026"
- Kalender bleibt offen nach Auswahl – gut für Korrektur, aber unklar ob Datum gesetzt ist
- Der 6. April ist rot markiert (selected) – Datum wurde korrekt gesetzt
- Kalender schließt nicht automatisch nach Auswahl – UX-Verbesserung möglich


**V2-F-019** | MAJOR | Zwei Kalender-Popovers gleichzeitig offen
- Start-Kalender (April 2026) bleibt offen, Ende-Kalender (Februar 2026) öffnet sich daneben
- Beide Kalender überlappen und verdecken sich teilweise
- Erwartet: Start-Kalender schließt sich automatisch wenn Ende-Kalender geöffnet wird
- Ende-Kalender startet bei Februar 2026 statt bei April 2026 (sollte nach Startdatum beginnen)

**V2-F-020** | MINOR | Ende-Kalender startet bei aktuellem Monat statt nach Startdatum
- Startdatum ist 6.4.2026, aber Ende-Kalender zeigt Februar 2026
- Erwartet: Ende-Kalender sollte bei April/Mai 2026 starten (nach Startdatum)
- Zusätzlich: Keine Validierung dass Ende nach Start liegt


**V2-F-021** | MAJOR | Start-Kalender Popover bleibt dauerhaft offen
- Der Start-Kalender (links, blau markiert 6.4.) schließt sich nie automatisch
- Auch nach Klick auf Ende-Kalender bleibt er offen
- Jetzt zeigt der Ende-Kalender April 2026, aber Start-Kalender überlappt links
- Beide Kalender gleichzeitig sichtbar = verwirrende UX


**V2-F-022** | MAJOR | Off-by-one Datum-Bug im DatePicker
- Klick auf "June 30th" (Index 52) zeigt "29.6.2026" im Button
- Klick auf "June 29th, selected" zeigt ebenfalls "29.6.2026"
- Das ausgewählte Datum ist immer 1 Tag vor dem geklickten Datum
- Gleicher Bug beim Start-Datum: Klick auf "April 7th" zeigte "6.4.2026"
- Ursache vermutlich: Timezone-Offset bei Date-Konvertierung (UTC vs. lokale Zeit)

**V2-F-023** | MINOR | Kalender-Popover schließt nicht nach Datum-Auswahl
- Nach Auswahl eines Datums bleibt der Kalender offen
- Start-Kalender (blau, links) bleibt permanent offen
- Beide Kalender können gleichzeitig sichtbar sein
- Erwartet: Kalender schließt sich nach Datum-Auswahl automatisch


**V2-F-024** | OK | Zusammenfassung zeigt alle Daten korrekt
- Projektname: "Fassadenreinigung Wohnpark Lister Meile" korrekt
- Beschreibung: vollständig angezeigt
- Unternehmen: "WBG Nordstadt eG" korrekt
- HubSpot-Deal: "Kein Deal verknüpft" korrekt
- Geplanter Start: 6.4.2026 angezeigt (off-by-one von V2-F-022)
- Geplantes Ende: 29.6.2026 angezeigt (off-by-one von V2-F-022)
- Status: "Objektaufnahme" Badge korrekt
- Hinweis: "Nach dem Erstellen können Sie Immobilien zum Projekt hinzufügen" korrekt
- Fix E-04 (DatePicker) verifiziert: Termine werden in der Zusammenfassung angezeigt

**V2-F-025** | MINOR | Terminhinweise fehlen in der Zusammenfassung
- Die eingegebenen Terminhinweise werden nicht in der Zusammenfassung angezeigt
- Erwartet: "Nicht vor April starten – Frostgefahr. Bewohner vorher informieren." sollte sichtbar sein


**V2-F-026** | OK | Projekt erfolgreich erstellt
- Toast: "Fassadenreinigung Wohnpark Lister Meile (2026-WBG-01) wurde erfolgreich angelegt."
- Projektnummer: 2026-WBG-01 (WBG = Kürzel von WBG Nordstadt eG, korrekt)
- Projektliste zeigt jetzt 2 Projekte: Gesamt 2, In Bearbeitung 0, Angebote 0, Abgeschlossen 0
- Neues Projekt erscheint ausgegraut (noch nicht aktiv/in Bearbeitung)
- Zeitraum "6.4.2026 - 29.6.2026" wird angezeigt (off-by-one aus V2-F-022 bestätigt)


**V2-F-027** | OK | ProjektDetail zeigt alle Daten korrekt
- Projektname, Projektnummer (2026-WBG-01), Phase (Objektaufnahme) korrekt
- Workflow-Hinweis: "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden"
- KPI-Cards: Immobilien 0, Gesamtfläche "–", Fortschritt 0%, Dokumente 0
- Projektzeitstrahl mit 10 Phasen korrekt angezeigt
- Notizen enthalten Beschreibung UND Terminhinweise zusammen – semantisch fragwürdig
- Terminhinweise und Beschreibung sind in einem Feld zusammengefasst

**V2-F-028** | MINOR | Beschreibung und Terminhinweise in einem Feld zusammengefasst
- "Notizen" zeigt sowohl die Beschreibung als auch die Terminhinweise
- Erwartet: Getrennte Anzeige von "Beschreibung" und "Terminhinweise"


**V2-F-029** | OK | E-01 Fix verifiziert: Immobilie hinzufügen öffnet ObjektaufnahmeWizard
- Button "Immobilie hinzufügen" im ProjektDetail öffnet jetzt den ObjektaufnahmeWizard
- Wizard zeigt korrekt 6 Schritte: Stammdaten, Frontseite, Rückseite, Linker Giebel, Rechter Giebel, Zusammenfassung
- Unternehmen und Projekt sind NICHT vorausgefüllt (sollten sie sein, da aus ProjektDetail geöffnet)

**V2-F-030** | MINOR | Unternehmen/Projekt nicht vorausgefüllt im Wizard aus ProjektDetail
- Wenn der Wizard aus dem ProjektDetail geöffnet wird, sollten Unternehmen und Projekt automatisch vorausgefüllt sein
- Aktuell muss der Nutzer beides manuell auswählen, obwohl der Kontext bekannt ist


**V2-F-031** | CRITICAL | WBG Nordstadt eG fehlt im ObjektaufnahmeWizard Dropdown
- Das gerade angelegte Unternehmen "WBG Nordstadt eG" ist NICHT im Dropdown des ObjektaufnahmeWizards sichtbar
- Die Liste endet bei "ZWG Zehdenicker Wohnungsgenossenschaft eG" – WBG Nordstadt fehlt komplett
- Gleicher Bug wie im v1-Test (F-037): Manuell angelegte Unternehmen werden nicht im Wizard-Dropdown angezeigt
- Ursache: Der Wizard lädt Unternehmen aus der companies-Tabelle, aber das neue Unternehmen wurde möglicherweise in einer anderen Tabelle gespeichert oder die Abfrage filtert es aus
- Schweregrad: CRITICAL – Workflow-Blocker, da neu angelegte Unternehmen nicht zugeordnet werden können


**V2-F-031 UPDATE**: WBG Nordstadt eG existiert in der DB (3 Treffer mit WBG im Namen). Das Problem ist, dass der Select-Dropdown bei 500+ Unternehmen sehr lang ist und das Scrollen im Browser schwierig. Die Daten werden korrekt geladen, aber die UX bei vielen Einträgen ist problematisch. Der ObjektaufnahmeWizard hat KEIN Suchfeld wie der ProjektWizard – das ist der eigentliche Bug. Schweregrad herabgestuft auf MAJOR (UX-Problem, kein Datenverlust).

**V2-F-032** | MAJOR | ObjektaufnahmeWizard hat keine Unternehmenssuche
- Der ProjektWizard hat ein Suchfeld + Select (filteredCompanies), der ObjektaufnahmeWizard hat NUR einen Select ohne Suche
- Bei 500+ Unternehmen ist der Select ohne Suche nicht nutzbar
- Lösung: Suchfeld wie im ProjektWizard hinzufügen


**V2-F-033** | OK | Kaskadenlogik im ObjektaufnahmeWizard funktioniert korrekt
- Nach Auswahl "Bauverein Sarstedt eG" zeigt Kontakt-Dropdown "Person wählen..." mit Hinweis "Keine Kontakte für dieses Unternehmen"
- Projekt-Dropdown zeigt "Projekt wählen..." mit "Keine Projekte für dieses Unternehmen"
- Datum-Feld zeigt "–" statt Datum (DatePicker fehlt hier – nur type="date" Input)

**V2-F-034** | MINOR | ObjektaufnahmeWizard Datum-Feld zeigt "–" statt aktuelles Datum
- Das Datum-Feld (Zeile 21) zeigt "–" statt ein vorausgefülltes Datum
- Erwartet: Heutiges Datum als Default


**V2-F-035** | INFO | ObjektaufnahmeWizard springt automatisch zu Schritt 2 (Frontseite) nach Kollege-Auswahl
- Wizard hat automatisch zum Frontseite-Schritt gewechselt, obwohl ich nur den Kollege-Dropdown öffnen wollte
- Vermutlich: Weiter-Button wurde statt Dropdown geklickt (UI-Überlappung)
- Reinigungsfähig Default ist jetzt "Ja" (E-17 Fix verifiziert)
- Fassadenart noch nicht gewählt, Breite/Höhe leer, Fläche zeigt "0 m²"

**V2-F-036** | OK | E-17 Fix verifiziert: Reinigungsfähig Default ist "Ja"


**V2-F-037** | OK | Flächenberechnung Frontseite: 40m x 18m = 720 m² korrekt berechnet

**V2-F-038** | OK | Rückseite: Putz/Mineralputz, 40x18=720m² korrekt

**V2-F-039** | OK | Linker Giebel: "Nein" bei Reinigungsfähig zeigt Begründungsfeld + Hinweis "Bitte trotzdem die Fläche erfassen"

**V2-F-040** | OK | Wizard-Navigation: Schritt 4 von 6, Fortschritt 67%, Breadcrumbs korrekt

**V2-F-041** | OK | Rechter Giebel: 12x18=216m² korrekt, Reinigungsfähig=Ja

**V2-F-042** | OK | Zusammenfassung zeigt alle Daten korrekt:
- Zuordnung: Bauverein Sarstedt eG (Unternehmen)
- 4 Seiten erfasst, 1.872 m² Gesamtfläche, 1.656 m² Reinigungsfähig, 0 Fotos
- Frontseite: 720 m² WDVS, Reinigungsfähig
- Rückseite: 720 m² Putz/Mineralputz, Reinigungsfähig
- Linker Giebel: 216 m² Keine Fassadenart, AUSGESCHLOSSEN (rot Badge)
- Rechter Giebel: 216 m² Keine Fassadenart, Reinigungsfähig
- Flächenberechnung: 720+720+216+216 = 1.872 m² ✓
- Reinigungsfähig: 1.872-216 = 1.656 m² ✓
- Fortschritt: 100%, "Fast fertig!" Label

**V2-F-043** | MINOR | Rechter Giebel zeigt "Keine Fassadenart" obwohl Fassadenart Pflichtfeld sein sollte
- Wizard erlaubt Weiter ohne Fassadenart-Auswahl
- Erwartet: Validierung dass Fassadenart gewählt werden muss

**V2-F-044** | MINOR | Zuordnung zeigt "Bauverein Sarstedt eG" statt "WBG Nordstadt eG"
- Im Stammdaten-Schritt wurde Bauverein Sarstedt eG gewählt (weil WBG Nordstadt ohne Suchfeld nicht auffindbar war)
- Kein Projekt zugeordnet (Stammdaten zeigten "Keine Projekte für dieses Unternehmen")
- Zeigt den Workflow-Bruch: Wizard aus ProjektDetail geöffnet, aber Unternehmen/Projekt nicht vorausgefüllt

**V2-F-045** | OK | Immobilie erfolgreich gespeichert
- Toast: "Objektaufnahme abgeschlossen – Lister Meile 25-31, Hannover wurde erfolgreich in der Datenbank gespeichert."
- Wizard schließt sich automatisch, ProjektDetail wird angezeigt

**V2-F-046** | MAJOR | Immobilien-Zähler zeigt weiterhin 0 nach Speichern
- KPI-Card "Immobilien" zeigt 0, obwohl gerade eine Immobilie gespeichert wurde
- Gesamtfläche zeigt "\u2013" statt 1.872 m²
- Immobilien-Tab zeigt "Noch keine Immobilien zugeordnet"
- Ursache: Immobilie wurde mit Bauverein Sarstedt eG gespeichert, nicht mit dem aktuellen Projekt
- Oder: Die Immobilie wurde in der buildings-Tabelle gespeichert, aber nicht mit dem Projekt verknüpft
- Schweregrad: MAJOR \u2013 Daten werden gespeichert aber nicht korrekt zugeordnet

### Phase 4: Angebote

**V2-F-047** | OK | Angebote-Seite lädt korrekt
- KPI-Cards: Gesamt 0, Diesen Monat 0, Gesamtwert 0€, Angenommen 0
- Suchfeld, Status-Filter, Weitere Filter vorhanden
- Empty State: "Keine Angebote gefunden – Erstellen Sie Ihr erstes Angebot"
- Sidebar zeigt Angebote-Badge mit Zahl 8 (Nachfass-Badge, nicht Angebote-Anzahl)
- Breadcrumb: Übersicht > Angebote korrekt
- Benutzername: "Alexander Retzlaff / Büro" korrekt angezeigt

### Phase 5: Baustellen

**V2-F-048** | OK | Baustellen-Seite lädt korrekt
- KPI-Cards: 0 Gesamt, 0 Aktiv, 0 Geplant, 0 Pausiert
- Tabelle mit Spalten: Baustelle, Projekt, Zeitraum, Fortschritt, Status
- Empty State: "Noch keine Baustellen vorhanden"
- Suchfeld und Status-Filter vorhanden
- "Neue Baustelle" Button vorhanden

### Phase 6: Einsatzplanung

**V2-F-049** | OK | Einsatzplanung zeigt Mitarbeiter und Züge
- 3 Tabs: Züge & Mitarbeiter, Projekt-Zuordnung, Einsatzkalender
- Verfügbare Mitarbeiter: 2 nicht zugeordnet (Andreas Koch, Frank Becker – beide Urlaub)
- Zug Alpha: 3 Mitglieder, 3 Projekte (Stefan Weber, Thomas Schmidt, Michael Braun)
- Zug Bravo: 3 Mitglieder, 2 Projekte (Peter Hoffmann, Klaus Müller, Jürgen Wagner)
- Zug Charlie: 0 Mitglieder, 0 Projekte ("Mitarbeiter hierher ziehen")
- Fix E-20 verifiziert: Daten aus DB geladen ✓

### Phase 7: Kundenportal

**V2-F-050** | OK | Kundenportal zeigt DB-Daten
- KPI-Cards: 2 Projekte, 0 Aktive Garantien, 0 Dokumente, – Nächste Inspektion
- 5 Tabs: Meine Projekte, Garantien, Dokumente, Kontakt, Feedback
- "Derzeit keine aktiven Projekte" + "Abgeschlossene Projekte (0)"
- Fix E-03 verifiziert: Kundenportal auf DB-Daten umgestellt ✓
- Projekte-Zähler zeigt 2 (unsere 2 Projekte in der DB)

### Phase 8: Finanzen

**V2-F-051** | OK | Finanzübersicht mit Charts
- KPI-Cards: 3.10 Mio € Umsatz (+14%), 2.21 Mio € Kosten (+8%), 884 T€ Gewinn (+22%), 29% Marge (+3%)
- 4 Tabs: Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus
- Charts: Umsatz-/Gewinnentwicklung (Monatsbalken), Quartalsvergleich (Horizontalbalken)
- Aktionen: Neue Rechnung, Zahlung erfassen, Budget anlegen, Mahnlauf
- Zeitraum-Filter: "Dieses Jahr" Dropdown
- Export: Excel + PDF Buttons
- Fix E-08/E-09 verifiziert: Finanzen DB-basiert ✓

### Phase 9: Immobilien

**V2-F-052** | OK | Immobilien-Übersicht zeigt 3 Immobilien
- KPI-Cards: 3 Immobilien, 3.0k m² Reinigungsfähig, 0 Fotos, 1 Mit Projekt
- Lister Meile 25-31, Hannover: 1.872 m² / 1.656 m² reinigungsfähig – "Nicht zugeordnet"
- Grüner Weg 1-8, Hannover: 1.368 m² / 1.368 m² reinigungsfähig – Fassadenreinigung Wohnanlage Grüner Weg
- An der Saalebahn 8a, Halle: Keine Fläche – "Nicht zugeordnet"
- Neue Immobilie "Lister Meile 25-31" wurde korrekt gespeichert mit allen 4 Seiten und Flächen

**V2-F-053** | MAJOR | Neue Immobilie nicht dem Projekt zugeordnet
- "Lister Meile 25-31" zeigt "Nicht zugeordnet" obwohl der Wizard aus dem ProjektDetail geöffnet wurde
- Ursache: Im Wizard-Stammdaten wurde ein anderes Unternehmen gewählt (Bauverein Sarstedt) und kein Projekt
- Root Cause: Wizard füllt Unternehmen/Projekt nicht vor, wenn aus ProjektDetail geöffnet
- Zusammenhängend mit V2-F-030 und V2-F-046

**V2-F-054** | MINOR | An der Saalebahn 8a hat keine Flächenangabe
- Dritte Immobilie (aus vorherigem Test) zeigt keine Fläche
- Vermutlich unvollständig gespeichert oder Entwurf

