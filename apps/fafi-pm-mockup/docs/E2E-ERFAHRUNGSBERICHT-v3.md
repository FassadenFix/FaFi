# FaFi PM – E2E-Erfahrungsbericht v3.0

**Datum:** 09. Februar 2026
**Tester:** Manus AI (simuliert verschiedene FassadenFix-Mitarbeiterrollen)
**Version:** a651352a → nach Bugfix
**Methode:** 13 Realdaten-Szenarien mit unterschiedlichen Rollen, Situationen und Edge Cases

---

## 1. Zusammenfassung

Der FaFi PM wurde in 13 Szenarien aus der Perspektive von sechs verschiedenen Mitarbeiterrollen getestet. Dabei wurden insgesamt **54 Findings** dokumentiert, davon **3 kritische Bugs** (1 sofort behoben), **12 Major-Issues**, **14 Minor-Issues** und **25 positive Bestätigungen**. Der kritischste Fund war ein **Crash-Bug im Angebots-Wizard**, der den gesamten Geschäftsprozess ab Phase 5 blockierte. Dieser wurde während des Tests behoben. Der zweitkritischste Fund ist ein **Kalender-Bug**, bei dem das Startdatum beim Setzen des Enddatums überschrieben wird.

Die folgende Tabelle gibt einen Überblick über die Testabdeckung und die Ergebnisse pro Szenario.

| Nr. | Szenario | Rolle | Ergebnis | Kritische Findings |
|-----|----------|-------|----------|-------------------|
| 1 | Neukunde Großprojekt anlegen | Kundenberaterin | Erfolgreich | Lange Firmennamen, fehlende PLZ-Validierung |
| 2 | Projekt für Neukunden erstellen | Kundenberater | Teilweise | Kalender-Bug überschreibt Startdatum |
| 3 | Kontaktperson anlegen | Kundenberaterin | Gescheitert | "Neuer Kontakt" nicht implementiert |
| 4 | Globale Suche testen | AT-Leiter | Gescheitert | Suche findet echte Daten nicht |
| 5 | Phasenwechsel durchführen | Projektleiter | Korrekt blockiert | Workflow-Validierung funktioniert |
| 6 | Angebot erstellen | Kundenberaterin | Crash (behoben) | SelectItem value="" Crash |
| 7 | Immobilien-Zuordnung prüfen | Büro | Teilweise | Auto-Zuordnung fehlt |
| 8 | Dashboard-KPIs validieren | Geschäftsführung | Teilweise | KPIs laden langsam, Skeleton-Loader |
| 9 | Einsatzplanung testen | AT-Leiter | Logikbrüche | Einsätze für leeren Zug |
| 10 | Auftrag erstellen | Kundenberaterin | Nicht möglich | Funktion nicht implementiert |
| 11 | Garantien prüfen | Projektleiter | Korrekt leer | Nur am Workflow-Ende erreichbar |
| 12 | Finanzen prüfen | Geschäftsführung | Mock-Daten | KPIs ohne Bezug zu echten Daten |
| 13 | Dashboard-Vollansicht | Geschäftsführung | Teilweise | KPI "Projekte" zeigt 0 statt 3 |

---

## 2. Nutzererfahrungen nach Rolle

### 2.1 Kundenberaterin Lisa Weber

Als Kundenberaterin ist mein Hauptziel, Neukunden zu erfassen, Projekte anzulegen und Angebote zu erstellen. Die **Unternehmenserfassung** funktioniert grundsätzlich gut: Ich kann ein Unternehmen mit allen relevanten Daten anlegen, und der Zähler aktualisiert sich sofort. Allerdings fehlt eine **PLZ-Validierung** – ich könnte "ABCDE" als PLZ eingeben, und das System würde es akzeptieren. Auch die **Pflichtfeld-Markierung** ist unklar: Nur der Firmenname hat ein Sternchen, obwohl Adressdaten für die Angebotserstellung zwingend nötig sind.

Die **Projekterfassung** hat mich dagegen frustriert. Der Kalender für Start- und Enddatum hat einen gravierenden Bug: Wenn ich das Startdatum auf den 4. Mai setze und dann im selben Kalender (der sich nicht schließt) ein Enddatum wähle, wird mein Startdatum überschrieben. Ich habe dreimal von vorne angefangen, bis ich verstanden habe, dass ich den Startdatum-Kalender erst manuell schließen muss, bevor ich das Enddatum setze. Das ist ein **Workflow-Killer** für den Alltag.

Die **Angebotserstellung** war zunächst komplett blockiert durch einen Crash-Bug (SelectItem mit leerem Value). Nach dem Fix funktioniert der erste Schritt, aber da keine Immobilien mit Seiten erfasst sind, kann ich den Wizard nicht vollständig durchlaufen. Das zeigt einen **konzeptionellen Engpass**: Ohne Objektaufnahme kein Angebot, ohne Angebot kein Phasenwechsel – der gesamte Workflow hängt an der korrekten Reihenfolge, und das System gibt mir keine klare Anleitung, was als nächstes zu tun ist.

Besonders enttäuschend war der Versuch, einen **Kontakt** anzulegen. Der Button "Neuer Kontakt" zeigt nur einen Toast "Funktion in Entwicklung". Es existieren 100 Kontakte in der Datenbank, aber ich kann keine neuen erstellen. Das ist ein fundamentaler Widerspruch.

### 2.2 AT-Leiter Max Mustermann

Als AT-Leiter brauche ich vor allem die **Einsatzplanung** und die **globale Suche**, um schnell Projekte und Baustellen zu finden. Die globale Suche (Cmd+K) hat eine schöne UI mit Schnellaktionen und Keyboard-Navigation, aber sie **findet meine echten Daten nicht**. Ich habe nach "München" gesucht – obwohl ein Projekt und ein Unternehmen mit "München" existieren, zeigt die Suche "Keine Ergebnisse". Die Suche scheint nur vordefinierte Vorschläge zu kennen, nicht die tatsächliche Datenbank. Für den Alltag ist das unbrauchbar.

Die **Einsatzplanung** zeigt drei Züge mit Mitarbeitern und einen Kalender. Allerdings gibt es einen klaren **Logikbruch**: Zug Charlie hat 0 Mitglieder und 0 Projekte, aber im Kalender sind trotzdem Einsätze für Zug Charlie eingetragen. Ein leerer Zug kann keine Einsätze haben. Außerdem ist Jürgen Wagner gleichzeitig Mitglied in Zug Bravo und Leiter von Zug Charlie – ein Mitarbeiter kann nicht in zwei Zügen gleichzeitig sein. Der Kalender zeigt auch nur Zugnamen ohne Projektbezug oder Ort, was für die tägliche Planung wenig hilfreich ist.

### 2.3 Projektleiter Thomas Braun

Als Projektleiter möchte ich den **Projektstatus** verwalten und **Phasenwechsel** durchführen. Die gute Nachricht: Die **Workflow-Validierung funktioniert korrekt**. Wenn ich versuche, von "Objektaufnahme" zu "Angebot erstellt" zu wechseln, sagt mir das System: "Noch nicht möglich – Kein Angebot vorhanden." Das ist logisch richtig und verhindert inkonsistente Zustände.

Die **Projektdetailseite** ist gut strukturiert mit Tabs für Übersicht, Immobilien, Angebote, Aufträge, Baustellen, Finanzen, Dokumente, Aufgaben und Teams. Allerdings ist der **Schnellzugriff-Bereich komplett leer** – hier sollten mindestens "Immobilie erfassen" oder "Angebot erstellen" stehen, um den Nutzer durch den Workflow zu leiten.

### 2.4 Geschäftsführung

Als Geschäftsführer schaue ich primär auf das **Dashboard** und die **Finanzen**. Das Dashboard zeigt nach dem Laden korrekte KPIs (0 Angebote, 0 Aufträge, 0 Baustellen), aber es gibt zwei störende Probleme. Erstens zeigt die KPI-Karte "Projekte" den Wert "0 Aufträge" – obwohl 3 Projekte existieren. Die Karte heißt "Projekte", zeigt aber Aufträge. Das ist eine **irreführende Beschriftung**. Zweitens zeigen alle KPI-Karten "+12% vs. Vormonat", obwohl die Werte bei 0 stehen. Null kann nicht 12% mehr sein als im Vormonat – das sind **statische Platzhalter-Prozentwerte**, die nie durch echte Berechnungen ersetzt wurden.

Die **Finanzen-Seite** zeigt beeindruckende Zahlen (3,10 Mio € Umsatz, 884 T€ Gewinn), die aber **keinen Bezug zu den echten Daten** haben. Drei Projekte in Phase "Objektaufnahme" können keinen Umsatz generiert haben. Die Charts sind zudem leer – keine Balken oder Linien sichtbar. Für eine Geschäftsführung, die datenbasierte Entscheidungen treffen will, ist das Dashboard in diesem Zustand nicht nutzbar.

### 2.5 Büro-Mitarbeiterin

Als Büro-Mitarbeiterin verwalte ich **Immobilien** und **Dokumente**. Die Immobilien-Übersicht zeigt 3 erfasste Objekte mit Flächen und Zuordnungen. Allerdings ist die im ProjektDetail erstellte Immobilie "Lister Meile" **nicht automatisch dem Projekt zugeordnet** – sie steht als "Nicht zugeordnet" in der Liste. Der Nutzer erwartet, dass eine im Kontext eines Projekts erstellte Immobilie automatisch diesem Projekt zugeordnet wird. Dieses Problem wurde bereits im v2-Test identifiziert (V2-F-053) und ist noch nicht behoben.

---

## 3. Identifizierte Logikbrüche

Die folgende Tabelle fasst die gravierendsten Logikbrüche zusammen, die während des Tests aufgefallen sind.

| Nr. | Logikbruch | Schwere | Bereich |
|-----|-----------|---------|---------|
| L1 | Startdatum wird beim Enddatum-Klick überschrieben | CRITICAL | ProjektWizard |
| L2 | KPI "Projekte" zeigt Aufträge-Zahl statt Projekte-Zahl | MAJOR | Dashboard |
| L3 | "+12% vs. Vormonat" bei Wert 0 | MAJOR | Dashboard |
| L4 | Einsätze für Zug ohne Mitglieder | MAJOR | Einsatzplanung |
| L5 | Mitarbeiter gleichzeitig in zwei Zügen | MAJOR | Einsatzplanung |
| L6 | Finanzdaten ohne Bezug zu echten Projekten | MAJOR | Finanzen |
| L7 | 100 Kontakte existieren, aber keine neuen anlegbar | MAJOR | Kontakte |
| L8 | Globale Suche findet echte Daten nicht | MAJOR | Navigation |
| L9 | Immobilie nicht automatisch dem Projekt zugeordnet | MAJOR | Immobilien |
| L10 | Benutzername wechselt zwischen "Benutzer" und echtem Namen | MINOR | Sidebar |

---

## 4. UI-Schwächen

### 4.1 Kalender-Komponente

Der Kalender ist die größte UI-Schwäche der Anwendung. Folgende Probleme wurden identifiziert:

Der **Monatsname fehlt im Header** – es steht nur "2026", ohne dass der Nutzer weiß, in welchem Monat er sich befindet. Die **Navigation** zwischen Monaten erfordert einzelne Klicks (kein Monats- oder Jahres-Dropdown). Die **Lokalisierung** ist unvollständig: Wochentage und Datumsformat sind deutsch, aber Tooltips wie "Today" und "Go to the Previous Month" sind englisch. Der Kalender **schließt sich nicht automatisch** nach einer Datumsauswahl, was zum kritischen Bug führt, dass das Startdatum überschrieben wird. Außerdem startet der **Enddatum-Kalender** beim aktuellen Monat statt beim bereits gewählten Startdatum.

### 4.2 Formular-Validierung

Die Formular-Validierung ist über die gesamte Anwendung hinweg inkonsistent. PLZ-Felder akzeptieren beliebige Zeichenketten. E-Mail-Felder haben keine Format-Validierung. Pflichtfelder sind nicht einheitlich markiert. Der ProjektWizard erlaubt das Erstellen eines Projekts ohne Enddatum, Kundenberater oder Projektleiter – Felder, die für den weiteren Workflow essentiell sind.

### 4.3 Feedback und Ladezustände

Die KPI-Cards im Dashboard zeigen Skeleton-Loader für 3-5 Sekunden, was bei schlechter Verbindung noch länger dauern kann. Es gibt keinen Hinweis, ob die Daten noch laden oder ob ein Fehler aufgetreten ist. Der Unterschied zwischen "lädt noch" und "keine Daten vorhanden" ist für den Nutzer nicht erkennbar.

### 4.4 Navigation und Konsistenz

Die Route `/kontakte` heißt im Sidebar "Unternehmen & Kontakte", aber die intuitive URL `/unternehmen` gibt einen 404-Fehler. Es fehlt ein Redirect. Die Benachrichtigungs-Glocke (Badge "3") suggeriert ungelesene Nachrichten, zeigt aber tatsächlich ausstehende Offline-Sync-Änderungen – eine irreführende Metapher.

---

## 5. Workflow-Analyse: Der kritische Pfad

Der FaFi PM bildet einen linearen Geschäftsprozess ab, der zwingend in der richtigen Reihenfolge durchlaufen werden muss. Die folgende Darstellung zeigt den Ist-Zustand des Workflows mit den identifizierten Blockaden.

```
Objektaufnahme → Angebot erstellt → Angebot versendet → Nachfassen → Auftrag gewonnen
     ✓               ⚠ (Fix)            ⚠                  ⚠              ✗
     
→ Planung → Vorbereitung → Durchführung → Abnahme → Abgeschlossen
     ✗          ✗              ✗             ✗           ✗
```

**Legende:** ✓ = funktioniert, ⚠ = funktioniert mit Einschränkungen, ✗ = nicht erreichbar/nicht implementiert

Der Workflow hat eine **Kaskaden-Abhängigkeit**: Jede Phase setzt die vorherige voraus. Da der Angebots-Wizard bis zum Fix gecrasht ist und die Auftragserstellung noch nicht implementiert ist, sind alle Phasen ab "Auftrag gewonnen" unerreichbar. Das bedeutet, dass **60% des Geschäftsprozesses** derzeit nicht durchlaufen werden können.

Die Workflow-Validierung selbst funktioniert korrekt – das System verhindert ungültige Phasensprünge. Das Problem liegt nicht in der Validierung, sondern in der **fehlenden Implementierung** der nachgelagerten Schritte (Auftragsbestätigung, Baustellenstart, Abnahme).

---

## 6. Was gut funktioniert

Trotz der identifizierten Probleme gibt es zahlreiche Bereiche, die bereits solide funktionieren und eine gute Basis bilden.

Die **Unternehmenserfassung** ist robust: Lange Firmennamen, Sonderzeichen und Umlaute werden korrekt verarbeitet. Die Kategorisierung (Privat, Gewerbe, Öffentlich, WEG) ist sinnvoll. Der Zähler aktualisiert sich in Echtzeit. Die **Projekterfassung** funktioniert grundsätzlich (abgesehen vom Kalender-Bug), und die automatische Projektnummern-Generierung (2026-WBG-01) ist praktisch.

Die **Workflow-Validierung** ist ein Highlight: Das System verhindert logisch ungültige Phasenübergänge und gibt klare Fehlermeldungen. Die **Aktivitätsprotokollierung** funktioniert ebenfalls gut – jede Aktion wird mit Zeitstempel und Benutzer protokolliert. Die **HubSpot-Integration** ist als optionaler Schritt korrekt eingebunden und blockiert den Workflow nicht.

Die **Objektaufnahme** (ObjektaufnahmeWizard) ist der am besten ausgearbeitete Teil der Anwendung: 4-Seiten-Erfassung mit Fassadenart, Maßen, Reinigungsfähigkeit und Begründung. Die Zusammenfassung zeigt alle Daten übersichtlich. Die Unternehmenssuche funktioniert nach dem v2-Fix korrekt.

---

## 7. Priorisierte Handlungsempfehlungen

Die folgende Tabelle listet die empfohlenen Maßnahmen in der Reihenfolge ihrer Priorität.

| Prio | Maßnahme | Aufwand | Auswirkung |
|------|----------|---------|------------|
| P0 | Kalender-Bug fixen: Auto-Close nach Datumsauswahl, Controlled Popover State | 2h | Verhindert Datenverlust |
| P0 | Kalender: Monatsnamen im Header anzeigen | 30min | Grundlegende Usability |
| P1 | KPI "Projekte" korrigieren: Projekte-Zahl statt Aufträge-Zahl anzeigen | 30min | Korrekte Geschäftsdaten |
| P1 | Statische Prozentwerte durch echte Berechnung ersetzen oder entfernen | 1h | Glaubwürdigkeit |
| P1 | Globale Suche: Echte DB-Abfrage statt statische Vorschläge | 3h | Kernfunktionalität |
| P2 | Kontakt-Formular implementieren (statt Toast) | 3h | Workflow-Vollständigkeit |
| P2 | Immobilien-Auto-Zuordnung bei Erstellung aus ProjektDetail | 1h | Datenintegrität |
| P2 | Einsatzplanung: Validierung (keine Einsätze für leere Züge) | 2h | Logische Konsistenz |
| P3 | Formular-Validierung: PLZ (5 Ziffern), E-Mail-Format | 2h | Datenqualität |
| P3 | Kalender vollständig lokalisieren (Today→Heute, Navigation-Tooltips) | 1h | Professioneller Eindruck |

---

## 8. Fazit

Der FaFi PM zeigt in seiner aktuellen Version eine **ambitionierte und durchdachte Architektur** mit 28 Datenbanktabellen, 29 tRPC-Routern und über 35 Seiten. Die Workflow-Engine mit Phasenvalidierung ist ein echtes Alleinstellungsmerkmal. Die Objektaufnahme und Unternehmenserfassung sind praxistauglich.

Die Hauptschwächen liegen in drei Bereichen: Erstens in der **Kalender-Komponente**, die durch fehlende Auto-Close-Logik und fehlende Monatsnamen die tägliche Arbeit erschwert. Zweitens in der **Datenkonsistenz** – KPIs, Finanzdaten und Suchfunktion greifen teilweise auf statische Mock-Daten statt auf echte Datenbankwerte zu. Drittens in der **Workflow-Vollständigkeit** – der Geschäftsprozess kann derzeit nur bis zur Angebotsphase durchlaufen werden, da Auftragsbestätigung und nachfolgende Schritte noch nicht implementiert sind.

Für einen MVP-Test mit echten Nutzern sollten mindestens die P0- und P1-Maßnahmen umgesetzt werden. Der Kalender-Bug (P0) ist dabei der dringendste Punkt, da er zu Datenverlust führt und das Vertrauen der Nutzer in die Anwendung untergräbt.
