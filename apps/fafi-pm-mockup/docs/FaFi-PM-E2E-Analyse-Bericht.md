# FaFi PM – E2E-Analyse-Bericht (Realdaten-Durchlauf)

**Datum:** 09.02.2026  
**Tester:** Automatisierter Nutzertest (als Alexander Retzlaff / Büro)  
**Version:** Checkpoint 7ff6e1be (nach Maßnahmenplan v3.0)  
**Methode:** Manueller Workflow-Durchlauf mit echten Daten im Browser

---

## 1. Zusammenfassung

Der E2E-Test simulierte den kompletten FassadenFix-Workflow: Vom Dashboard über Projektanlage, Objektaufnahme, Angebotserstellung bis hin zur Prüfung aller Querschnittsfunktionen (Finanzen, Berichte, HubSpot, Kundenportal, Einstellungen). Dabei wurden **67 Findings** dokumentiert, die sich in vier Kategorien einteilen lassen.

| Schweregrad | Anzahl | Beschreibung |
|-------------|--------|--------------|
| **Critical** | 3 | Workflow-Blocker und komplett falsche Daten |
| **Major** | 8 | Funktionale Fehler mit Workaround |
| **Minor** | 12 | UX-Probleme und Inkonsistenzen |
| **OK / Info** | 44 | Korrekt funktionierende Features und Hinweise |

Der **Gesamteindruck** ist positiv: Die Anwendung ist professionell gestaltet, die Wizard-Workflows sind durchdacht, und die Kernkonzepte (Phasen-Workflow, Fassadenaufnahme pro Gebäudeseite, Preisstaffelung, Züge/Kolonnen) sind praxisnah implementiert. Die Hauptprobleme liegen in der **Vermischung von Mock-Daten und echten DB-Daten**, die zu widersprüchlichen Anzeigen führt.

---

## 2. Workflow-Durchlauf: Was funktioniert, was nicht

### 2.1 Dashboard (Phase 1)

Das Dashboard bietet einen guten Überblick mit KPI-Karten, Kanban-Board, Schnellaktionen und HubSpot-Status. Die Schriftart Raleway ist korrekt implementiert (M-01 erfolgreich). Die Navigation mit 9 Bereichen ist vollständig und logisch strukturiert.

**Probleme entdeckt:** Das Datum in der Kopfzeile zeigt "03. Feb 2026" statt dem aktuellen Datum (F-005). Der Onboarding-Dialog erscheint bei jedem Laden und hinterlässt nach dem Schließen einen visuellen Rest (F-001, F-010). Die KPI-Prozentangaben wie "+12% vs. Vormonat" werden auch bei leerer Datenbank angezeigt, was irreführend ist (F-006).

### 2.2 Projektanlage (Phase 2)

Der ProjektWizard mit 4 Schritten (Grunddaten, HubSpot, Team & Termine, Zusammenfassung) ist konzeptionell hervorragend. Die automatische Projektnummer-Generierung (2026-GEM-01 basierend auf Jahr + Unternehmenskürzel + laufende Nummer) ist praxistauglich. Der Entwurf-Button ermöglicht Zwischenspeichern.

**Probleme entdeckt:** Die Datumseingabe im Schritt "Team & Termine" übernimmt eingegebene Werte nicht visuell – die Felder zeigen weiterhin den Placeholder "tt.mm.jjjj" (F-018). In der Zusammenfassung fehlen die Termine entsprechend. Die Terminhinweise werden zwar gespeichert (als Notizen im ProjektDetail), aber in der Wizard-Zusammenfassung nicht angezeigt (F-020). Die Unternehmen-Suche im Dropdown filtert nicht (F-011).

### 2.3 Objektaufnahme / Immobilie (Phase 3)

Der ImmobilienWizard ("Objektaufnahme") ist das **Highlight** der Anwendung. Die seitenweise Fassadenerfassung (Frontseite, Rückseite, Linker Giebel, Rechter Giebel) mit automatischer Flächenberechnung, Fassadenart-Auswahl, Reinigungsfähigkeits-Toggle, Foto-Upload, 360°-Tour-URL und Zuwegungsprüfung entspricht exakt dem FassadenFix-Konzept. Die kaskadierende Dropdown-Logik (Unternehmen → Kontakte → Projekte) funktioniert einwandfrei.

**Probleme entdeckt:** Der "Immobilie hinzufügen"-Button im ProjektDetail-Tab zeigt nur einen Toast "Funktion in Entwicklung" statt den Wizard zu öffnen (F-026). Der Workaround über die globale Immobilien-Seite funktioniert, ist aber ein Workflow-Bruch. Der Default für "Reinigungsfähig" steht auf "Nein" – bei einem Fassadenreinigungsunternehmen sollte der Default "Ja" sein (F-031).

### 2.4 Angebotserstellung (Phase 4)

Der AngebotsWizard mit 5 Schritten und integrierter Preisstaffelung (unter 500 m² = 10,50 €/m²) ist konzeptionell korrekt. Die Kaskadierung Unternehmen → Projekte → Immobilien → Seiten ist logisch.

**Probleme entdeckt:** Die Unternehmenssuche filtert nicht (F-035) – identisch zum ProjektWizard. Gravierender: Das Unternehmen "Gemeinnützige Wohnungsbaugenossenschaft Neustrelitz eG", das bei der Immobilie zugeordnet wurde, erscheint nicht im Angebots-Dropdown (F-037). Dies ist ein **Workflow-Bruch**: Der Nutzer kann kein Angebot für das Projekt erstellen, dem er gerade eine Immobilie zugeordnet hat. Die Ursache liegt vermutlich in einem Frontend-Rendering-Problem bei der Dropdown-Komponente.

### 2.5 Planung und Einsatzplanung (Phase 6)

Der Terminfinder mit Kalender-UI, Schnellbuchung-Buttons und Tagesansicht ist professionell implementiert (F-042). Die Einsatzplanung mit dem Zug-System (Alpha, Bravo, Charlie) und Drag-and-Drop-Konzept ist praxisnah für Fassadenreinigung (F-060).

**Probleme entdeckt:** Die Mitarbeiter-Daten in der Einsatzplanung sind Mock-Daten (F-060). Der Ressourcenplaner zeigt ebenfalls Mock-Mitarbeiter und -Einsätze (F-048). Die Route wurde korrekt auf /materialien umbenannt (M-02), aber der Seitentitel zeigt noch "Ressourcen" (F-049).

### 2.6 Querschnittsfunktionen (Phase 9)

Die Finanzübersicht mit Charts, Quartalsvergleich und 4 Tabs ist beeindruckend gestaltet (F-043). Das Berichtswesen bietet Umsatz-, Conversion-, Projekt- und Mitarbeiter-Auswertungen mit Excel/PDF-Export (F-064). Die HubSpot-Integration zeigt "Verbunden" mit Kontakte-, Unternehmen-, Deals- und Sync-Protokoll-Tabs (F-065). Die Einstellungen mit 6 Tabs (Profil, System, Benachrichtigungen, Integrationen, Sicherheit, Backup) sind vollständig (F-051).

**Probleme entdeckt:** Finanzen (3.10 Mio €), Berichte (1.25 Mio €, 28 Projekte) und Kundenportal ("WG Sonnenhof eG") zeigen komplett Mock-Daten, die nicht mit der DB übereinstimmen (F-043, F-046, F-062). Das Kundenportal ist das gravierendste Beispiel: Es begrüßt ein nicht existierendes Unternehmen und zeigt fiktive Projekte (F-046). Die Sidebar-Badge "Baustellen 4" zeigt Mock-Daten, während die Seite korrekt 0 Baustellen anzeigt (F-061).

---

## 3. Kernproblem: Mock-Daten vs. Echte Daten

Das zentrale, übergreifende Problem der Anwendung ist die **inkonsistente Datenquelle**. Einige Bereiche lesen korrekt aus der Datenbank, andere verwenden hardcodierte Mock-Daten. Dies führt zu widersprüchlichen Anzeigen, die das Vertrauen des Nutzers untergraben.

| Bereich | Datenquelle | Korrekt? |
|---------|-------------|----------|
| Projekte (Liste, Detail, Wizard) | DB | Ja |
| Immobilien (Liste, Wizard) | DB | Ja |
| Angebote (Liste, Wizard) | DB | Ja |
| Aufträge (Liste) | DB | Ja |
| Baustellen (Liste) | DB | Ja |
| Terminfinder | DB | Ja |
| HubSpot Integration | HubSpot API | Ja |
| Einstellungen / Profil | OAuth + DB | Ja |
| **Sidebar Badge "Baustellen 4"** | **Mock** | **Nein** |
| **Dashboard KPI-Prozente** | **Mock** | **Nein** |
| **Finanzübersicht (3.10 Mio €)** | **Mock** | **Nein** |
| **Berichte KPIs (1.25 Mio €, 28 Projekte)** | **Mock** | **Nein** |
| **Kundenportal (WG Sonnenhof)** | **Mock** | **Nein** |
| **Einsatzplanung (Mitarbeiter)** | **Mock** | **Nein** |
| **Ressourcenplaner (Kalender)** | **Mock** | **Nein** |

Die DB-basierten Bereiche funktionieren korrekt und konsistent. Die Mock-basierten Bereiche zeigen plausible, aber fiktive Daten, die nicht zum tatsächlichen Datenbestand passen.

---

## 4. Konzeptionelle Bewertung

### 4.1 Was konzeptionell hervorragend ist

Der **Phasen-Workflow** mit 10 Stufen und automatischen Gates (kein Phasenwechsel ohne Angebot) ist die konzeptionelle Stärke der Anwendung. Er bildet den realen Geschäftsprozess der Fassadenreinigung korrekt ab und verhindert Fehler durch fehlende Voraussetzungen.

Die **seitenweise Fassadenaufnahme** (4 Gebäudeseiten mit individuellen Maßen, Fassadenart, Reinigungsfähigkeit) ist praxisnah und einzigartig. Die automatische Flächenberechnung und die Zusammenfassung mit Gesamtfläche sind für die Angebotskalkulation essenziell.

Das **Zug-System** in der Einsatzplanung (Alpha, Bravo, Charlie mit Leitern und Mitgliedern) bildet die reale Kolonnenstruktur eines Fassadenreinigungsunternehmens ab.

### 4.2 Was konzeptionell fehlt oder inkonsistent ist

Die **Datumseingabe** im ProjektWizard ist funktionslos (F-018). Termine sind für die Projektplanung essenziell – ohne funktionierende Datumseingabe kann keine Zeitplanung stattfinden.

Der **Workflow-Bruch bei der Immobilienzuordnung** (F-026) zwingt den Nutzer, die globale Immobilien-Seite zu verwenden statt direkt im Projekt zu arbeiten. Dies widerspricht dem Konzept des projektzentrischen Workflows.

Die **Unternehmenszuordnung** zwischen ProjektWizard und AngebotsWizard ist inkonsistent (F-037). Ein Unternehmen, das bei der Immobilie zugeordnet wurde, erscheint nicht im Angebots-Dropdown.

### 4.3 Semantische Bewertung

Die **Bezeichnungen** sind durchgehend deutsch und fachlich korrekt: "Objektaufnahme", "Nachfassen", "Auftrag gewonnen", "Abnahme" – alle Begriffe entsprechen dem Branchenvokabular der Fassadenreinigung.

Eine **semantische Inkonsistenz** besteht bei den Phasen-Labels im Berichtswesen: Dort werden technische IDs ("objektaufnahme", "angebot_erstellt") statt der benutzerfreundlichen Labels ("Objektaufnahme", "Angebot erstellt") angezeigt (F-063).

Die **404-Seite** zeigt englischen Text ("Page Not Found") in einer durchgehend deutschen Anwendung (F-057).

---

## 5. Priorisierter Maßnahmenplan

### Phase 1: Workflow-Blocker beheben (Critical, sofort)

| Nr. | Maßnahme | Finding | Aufwand |
|-----|----------|---------|---------|
| E-01 | **Immobilie hinzufügen im ProjektDetail** – Button muss ImmobilienWizard öffnen statt Toast | F-026 | 2 Std |
| E-02 | **Sidebar Badge "Baustellen 4"** – Badge aus DB-Abfrage berechnen statt Mock-Daten | F-061 | 1 Std |
| E-03 | **Kundenportal auf DB-Daten umstellen** – Mock-Daten (WG Sonnenhof) durch echte Projektdaten des eingeloggten Kunden ersetzen | F-046, F-047 | 8 Std |

### Phase 2: Funktionale Fehler beheben (Major, diese Woche)

| Nr. | Maßnahme | Finding | Aufwand |
|-----|----------|---------|---------|
| E-04 | **Datumseingabe im ProjektWizard** – Date-Input reparieren, damit eingegebene Termine übernommen und in Zusammenfassung angezeigt werden | F-018, F-020 | 2 Std |
| E-05 | **Unternehmenssuche in Wizards** – Filter-Funktion in ProjektWizard und AngebotsWizard implementieren, damit Dropdown-Liste bei Texteingabe gefiltert wird | F-011, F-035 | 3 Std |
| E-06 | **Unternehmen im AngebotsWizard** – Sicherstellen, dass alle DB-Unternehmen im Dropdown erscheinen (Neustrelitz fehlt) | F-037 | 2 Std |
| E-07 | **Gesamtfläche im ProjektDetail** – Fläche aus zugeordneten Immobilien-Seiten berechnen und anzeigen | F-053 | 1 Std |
| E-08 | **Berichte KPIs auf DB umstellen** – Mock-Werte (1.25 Mio €, 28 Projekte, 77%) durch echte DB-Aggregationen ersetzen | F-062 | 4 Std |
| E-09 | **Finanzübersicht auf DB umstellen** – Mock-Werte (3.10 Mio €) durch echte Rechnungs-/Auftragsdaten ersetzen | F-043, F-044 | 6 Std |
| E-10 | **Dashboard Datum** – Aktuelles Datum dynamisch anzeigen statt hardcodiert | F-005 | 0.5 Std |
| E-11 | **Dashboard KPI-Prozente** – Bei 0 Daten "–" statt "+12%" anzeigen | F-006 | 1 Std |

### Phase 3: UX-Verbesserungen (Minor, KW 8-9)

| Nr. | Maßnahme | Finding | Aufwand |
|-----|----------|---------|---------|
| E-12 | **Onboarding-Dialog** – localStorage-Flag setzen, damit Dialog nur einmal erscheint; Dialog korrekt schließen | F-001, F-010 | 1 Std |
| E-13 | **Breadcrumb im ProjektDetail** – Projektnummer/Name statt DB-ID anzeigen | F-025 | 0.5 Std |
| E-14 | **Phasen-Labels im Berichtswesen** – Technische IDs durch benutzerfreundliche Labels ersetzen | F-063 | 0.5 Std |
| E-15 | **404-Seite** – Deutschen Text verwenden und innerhalb DashboardLayout rendern | F-057, F-058 | 1 Std |
| E-16 | **Seitentitel /materialien** – "Ressourcen" durch "Materialien & Geräte" ersetzen | F-049 | 0.5 Std |
| E-17 | **Reinigungsfähig Default** – Default auf "Ja" setzen im ImmobilienWizard | F-031 | 0.5 Std |
| E-18 | **Unternehmen-Select Tooltip** – Langen Firmennamen per Tooltip vollständig anzeigen | F-016 | 0.5 Std |
| E-19 | **Benutzer-Anzeige Sidebar** – Auth-State konsistent halten (Alexander Retzlaff vs. "Benutzer") | F-067 | 1 Std |

### Phase 4: Datenanbindung (Strukturell, KW 9-10)

| Nr. | Maßnahme | Finding | Aufwand |
|-----|----------|---------|---------|
| E-20 | **Einsatzplanung auf DB umstellen** – Mock-Mitarbeiter durch echte Mitarbeiter-Tabelle ersetzen | F-060 | 8 Std |
| E-21 | **Ressourcenplaner auf DB umstellen** – Mock-Kalender durch echte Einsatz-Zuordnungen ersetzen | F-048 | 6 Std |
| E-22 | **"Neues Unternehmen" implementieren** – Manuelles Anlegen von Unternehmen (nicht nur HubSpot-Import) | F-015 | 4 Std |

---

## 6. Gesamtbewertung

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| **UI/UX-Design** | Sehr gut | Professionelles Dashboard-Layout, konsistentes Farbschema, gute Wizard-Struktur |
| **Workflow-Logik** | Gut | Phasen-Gates korrekt, aber Workflow-Brüche bei Immobilie und Angebot |
| **Datenintegrität** | Mangelhaft | Vermischung von Mock- und DB-Daten in 7 von 15 Bereichen |
| **Konzeptionelle Tiefe** | Sehr gut | Fassadenaufnahme, Preisstaffelung, Züge – branchenspezifisch und praxisnah |
| **Semantik / Sprache** | Gut | Durchgehend deutsch, fachlich korrekt, 2 Ausnahmen (404, Phasen-IDs) |
| **Technische Stabilität** | Gut | 0 TS-Fehler, 646 Tests grün, ECONNRESET behoben |
| **Produktionsreife** | Noch nicht | Mock-Daten müssen durch DB-Daten ersetzt werden |

Die Anwendung ist als **funktionaler Prototyp** mit exzellentem UI/UX-Design und durchdachter Branchenlogik zu bewerten. Der Weg zur Produktionsreife erfordert primär die **Ablösung aller Mock-Daten** durch echte Datenbankabfragen (geschätzter Aufwand: ca. 50 Arbeitsstunden für alle 22 Maßnahmen).

---

## 7. Offene Fragen für das Interview

1. **Kundenportal-Konzept:** Soll das Kundenportal als separater Login für Kunden fungieren (eigene Authentifizierung) oder als Ansicht innerhalb des Admin-Bereichs?

2. **Finanzdaten-Quelle:** Sollen die Finanzdaten aus Rechnungen/Aufträgen innerhalb von FaFi PM berechnet werden, oder gibt es eine externe Buchhaltungssoftware (DATEV, lexoffice), die angebunden werden soll?

3. **Mitarbeiter-Verwaltung:** Sollen Mitarbeiter als eigene Entität in der DB verwaltet werden (mit Qualifikationen, Verfügbarkeit, Zuordnung zu Zügen), oder reicht die Anbindung an ein externes HR-System?

4. **Mock-Daten-Strategie:** Sollen die Mock-Daten komplett entfernt werden (leere Ansichten bei neuer Installation), oder sollen Seed-Daten als Demo-Modus beibehalten werden (z.B. mit einem Toggle "Demo-Daten anzeigen")?

5. **Priorisierung:** Soll zuerst der komplette Workflow (Projekt → Angebot → Auftrag → Baustelle → Abnahme) end-to-end funktionieren, oder sollen zuerst alle Bereiche einzeln auf DB-Daten umgestellt werden?
