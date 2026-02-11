# Abgleich Durchlauf 2: 100% Vollständigkeitscheck

**Methode:** Jeder Punkt aus pasted_content.txt Zeile für Zeile gegen todo.md geprüft.

---

## Abschnitt 2: PROJEKTE (Zeile 23-71)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 2.1 Daten-Hierarchie | Unternehmen → Kontakte → Projekte → Immobilien | ✅ Implementiert | Architektur |
| 2.1 Kunde = Unternehmen | Bestätigt | ✅ Implementiert | v7.3 K-05 |
| 2.1 10 Phasen | Definiert | ✅ | Phase -1 |
| 2.1 Verantwortliche pro Phase | KB, Büro, AT, PL | ✅ | Phase -1 |
| 2.2 Phasen-Tabelle | 10 Phasen mit Verantwortlichen | ✅ | Phase -1 |
| 2.3 "Erstellen & Erfassen" irreführend | Umbenennen | ✅ | IA-NAV-01 |
| 2.3 Projekte als zentraler Einstiegspunkt | Lifecycle-Steuerung | ✅ | IA-IMM-02 |
| 2.4 ProjektWizard 5 Schritte | Implementiert | ✅ | Archiv |
| 2.4 Automatische Phasensteuerung | Bei Aktionen Phase auto-wechseln | ✅ | Phase 0a |

**→ PROJEKTE: 9/9 = 100% ✅**

---

## Abschnitt 3: IMMOBILIEN (Zeile 74-168)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 3.1 Eigenständiges Asset | Eigener Lebenszyklus | ✅ | IA-IMM-01 |
| 3.1 M:N zu Projekten | Zwischentabelle | ✅ | A2 (Zeile 417) |
| 3.1 Eigentümer wechselbar | companyId-Feld | ✅ | A3 (Zeile 418) |
| 3.1 Historie erhalten | Über Projekte hinweg | ✅ | IA-IMM-01 |
| 3.1 4 Seiten erfassen | Front, Rück, Links, Rechts | ✅ | Implementiert |
| 3.2 "Frontseite" statt "Eingangsseite" | Loom-Korrektur | ✅ | A1 (Zeile 360) |
| 3.2 Seitenbezeichnungen | Front/Rück/Links/Rechts | ✅ | Implementiert |
| 3.2 Sockel/Dach entfernen | Loom-Korrektur | ✅ | Implementiert |
| 3.3 Stamm: "Wer war noch dabei?" | Checkbox-Gruppe | ✅ | IA-WIZ-01 |
| 3.3 Stamm: "Wann Entscheidung?" | Datepicker | ✅ | IA-WIZ-02 |
| 3.3 Stamm: "Wer entscheidet?" | Textfeld | ✅ | IA-WIZ-03 |
| 3.3 Stamm: "Besondere Absprache?" | Textarea | ✅ | IA-WIZ-04 |
| 3.3 Tech: Wasseranschluss | Pro Seite | ✅ | IA-WIZ-05 |
| 3.3 Tech: Reinigungsmittelauswahl | Pro Seite | ✅ | IA-WIZ-06 |
| 3.3 Kaufm: Komplette Seite | Neuer Step | ✅ | IA-WIZ-07 |
| 3.3 Kaufm: "Welche Seiten ins Angebot?" | Checkbox | ✅ | IA-WIZ-08 |
| 3.3 Kaufm: "Umsetzungstermin" | KO-Termine | ✅ | IA-WIZ-09 |
| 3.3 Kaufm: "Wohnung gestellt?" | Toggle | ✅ | IA-WIZ-10 |
| 3.3 Kaufm: "Kennenlern-Angebot?" | Toggle | ✅ | IA-WIZ-11 |
| 3.3 Kaufm: "Frühbucher-Rabatt?" | Toggle | ✅ | IA-WIZ-12 |
| 3.3 Kaufm: "Einkaufsgemeinschaft?" | Toggle | ✅ | IA-WIZ-13 |
| 3.3 Kaufm: "Marketinggeeignet?" | Toggle | ✅ | IA-WIZ-14 |
| 3.4 Loom: "Reinigungsfähig" | Umgesetzt | ✅ | Implementiert |
| 3.4 Loom: Fläche bei Nein | Umgesetzt | ✅ | Implementiert |
| 3.4 Loom: Zuwegung vereinfacht | Umgesetzt | ✅ | Implementiert |
| 3.4 Loom: Zustand/Schäden entfernt | Umgesetzt | ✅ | Implementiert |
| 3.4 Loom: 360°-Link entfernt | Umgesetzt | ✅ | Implementiert |
| 3.5 Immobilien-Listenformat | Loom | ✅ | Loom-Feedback (Zeile 373) |
| 3.5 Zuordnungsinformationen | Loom | ✅ | Loom-Feedback (Zeile 374) |
| 3.5 1:N statt M:N Abweichung | Architektur | ✅ | A2 (Zeile 417) |
| 3.5 Kein companyId Abweichung | Architektur | ✅ | A3 (Zeile 418) |
| 3.6 Kaufmännische Seite fehlt | Im Wizard | ✅ | IA-WIZ-07 bis IA-WIZ-14 |

**→ IMMOBILIEN: 32/32 = 100% ✅**

---

## Abschnitt 4: ANGEBOTE (Zeile 171-270)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 4.1 Objektaufnahme = Datenbasis | Konzept | ✅ | Implementiert |
| 4.1 Keine Doppeleingabe | Nur auswählen | ✅ | IA-ANG-02 |
| 4.2 Wizard 5 Schritte | Implementiert | ✅ | Archiv |
| 4.3 Positionsstruktur X.1-X.5 | PDF | ✅ | Implementiert |
| 4.3 Kopfposition = Immobilie | PDF | ✅ | Implementiert |
| 4.3 Fläche zusammengezogen | Nicht pro Seite | ✅ | Implementiert |
| 4.4 Preisstaffelung 4 Stufen | 10,50/9,75/9,25/8,75 | ✅ | Implementiert |
| 4.4 Basiert auf Gesamtfläche | Alle Immobilien | ✅ | Implementiert |
| 4.5 Frühbucher dynamisch | Nicht hardcoded | ✅ | A4 (Zeile 361) |
| 4.5 Frühbucher 4 Stufen | 6%/4,5%/3%/1,5% | ✅ | Implementiert |
| 4.6 Störer 2-Spalten | Layout | ✅ | Implementiert |
| 4.7 Angebote unter Kundenberatung | Korrekt | ✅ | Implementiert |
| 4.7 Button "Angebot erstellen" in ProjektDetail | Direkter Workflow | ✅ | IA-ANG-01 |
| 4.8 Doppeleingabe eliminieren | Daten aus Objektaufnahme | ✅ | IA-ANG-02 |
| 4.8 Frühbucher hardcoded | Dynamisch berechnen | ✅ | A4 (Zeile 361) |
| 4.8 Übernachtung automatisch | Bei >100km | ✅ | A5 (Zeile 362) |

**→ ANGEBOTE: 16/16 = 100% ✅**

---

## Abschnitt 5: BAUSTELLEN (Zeile 273-334)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 5.1 Teamstruktur 4 Personen | TL+AT1, PL+AT2 | ✅ | IA-BAU-03 |
| 5.1 TL bekommt Projekt zugewiesen | Projekt = mehrere Baustellen | ✅ | IA-BAU-04 |
| 5.1 Begriffe TL/PL missverständlich | Hinweis | ✅ | Dokumentiert |
| 5.1 Teamleiter-Chat optional | Später | ✅ | Backlog (Zeile 433) |
| 5.1 Vorher-Doku PFLICHT | Gate vor Baustellenstart | ✅ | v7.0b (Zeile 138) |
| 5.1 Vorher-Doku als Wizard | Wie PDF-Formulare | ✅ | v7.0b (Zeile 137) |
| 5.1 Jede Immobilie einzeln dokumentieren | Pro Baustelle | ✅ | v7.0b |
| 5.1 Täglicher Ablauf Morgen/Abend | Arbeitstag beginnen/beenden | ✅ | v7.0c (Zeile 147-149) |
| 5.1 Logbuch-Ergebnisse auswählen | Vorkommnisse, Ereignisse | ✅ | v7.0c |
| 5.1 Abschlussfrage MORGENS UND ABENDS | Nicht nur abends | ✅ | IA-BAU-02 |
| 5.1 Bautagebuch automatisch | Bereiche + Witterung 3x | ✅ | v7.0c (Zeile 150) |
| 5.1 Foto-Upload kontextbezogen | S3 + Benennung | ✅ | v7.0a (Zeile 121) |
| 5.1 Ereignismelder "on top" | Jederzeit verfügbar | ✅ | v7.0c (Zeile 148) |
| 5.2 Desktop vs. Mobile Unterscheidung | Klar dokumentieren | ✅ | IA-BAU-01 |
| 5.2 Doppelte Baustellen-Einträge | Zusammenführen | ✅ | IA-NAV-02 |
| 5.2 Baustellen-Listenformat | Loom | ✅ | Loom-Feedback (Zeile 371) |
| 5.2 Filterung nach Phase/Status | Loom | ✅ | Loom-Feedback (Zeile 372) |
| 5.3 VorherDokuWizard als Gate | Pflicht | ✅ | v7.0b (Zeile 138) |
| 5.3 Tagesablauf als Wizard | Morgen/Abend | ✅ | v7.0c |
| 5.3 Ereignismelder eigenständig | "on top" | ✅ | v7.0c (Zeile 148) |
| 5.3 Guard-Logik fehlt | Arbeitstag erst nach Doku | ✅ | v7.0b (Zeile 138) |

**→ BAUSTELLEN: 21/21 = 100% ✅**

---

## Abschnitt 6: KUNDENPORTAL (Zeile 337-381)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 6.1 Kunde = Unternehmen | Bestätigt | ✅ | v7.3 (Zeile 224) |
| 6.1 Ein Zugang pro Unternehmen | Token-basiert | ✅ | v7.3 (Zeile 228) |
| 6.1 Mieter separates Portal | Später | ✅ | Backlog (Zeile 432) |
| 6.1 Alle Projekte anzeigen | Laufend + abgeschlossen | ✅ | v7.3 (Zeile 224) |
| 6.1 Aktuelles Projekt direkt öffnen | Detailansicht auf Startseite | ✅ | IA-KP-01 |
| 6.1 Ampel-System | Grün/Gelb/Rot | ✅ | v7.3 (Zeile 215-221) |
| 6.1 Baustellen einzeln mit eigener Ampel | Pro Baustelle | ✅ | v7.3 (Zeile 225) |
| 6.1 AG/AN-Aufgaben unterscheiden | Auftraggeber/Auftragnehmer | ✅ | A8 (Zeile 365) |
| 6.1 Dokumenten-Karte | Auflistung + Anzahl | ✅ | v7.3 (Zeile 227) |
| 6.1 3 Dokumenten-Ebenen | Projekt/Baustelle/Allgemein | ✅ | v7.3 (Zeile 227) |

**→ KUNDENPORTAL: 10/10 = 100% ✅**

---

## Abschnitt 7: NAVIGATION (Zeile 384-424)

| Punkt | Inhalt | In todo.md? | Wo? |
|---|---|---|---|
| 7.2 Problem 1: "Erstellen & Erfassen" irreführend | Umbenennen | ✅ | IA-NAV-01 |
| 7.2 Problem 2: Doppelte Baustellen | Zusammenführen | ✅ | IA-NAV-02 |
| 7.2 Problem 3: Projektvorbereitung vs. Planung | Überlappung | ✅ | IA-NAV-03 |
| 7.2 Problem 4: Hierarchische CRM-Darstellung | Unternehmen→Kontakte→Projekte | ✅ | A6 (Zeile 363) |
| 7.2 Problem 5: Sidebar folgt nicht Workflow | Reihenfolge anpassen | ✅ | IA-NAV-05 |
| 7.2 "Offene/Überfällige" sind Filter | Keine Menüpunkte | ✅ | IA-NAV-04 |
| 7.3 ProjektWizard | Fehlende auto Phasensteuerung | ✅ | Phase 0a |
| 7.3 ObjektaufnahmeWizard | Kaufmännische Seite fehlt | ✅ | IA-WIZ-07 |
| 7.3 AngebotWizard | Frühbucher/Übernachtung | ✅ | A4/A5 |
| 7.3 VorherDokuWizard | Nicht als Gate | ✅ | v7.0b |
| 7.3 Tagesablauf-Wizard | Nicht strukturiert | ✅ | v7.0c |
| 7.3 Ereignismelder | Fehlt komplett | ✅ | v7.0c |

**→ NAVIGATION: 12/12 = 100% ✅**

---

## Abschnitt 8: ABWEICHUNGSTABELLE (Zeile 427-461, 14 Punkte)

| # | Abweichung | In todo.md? | Wo? |
|---|---|---|---|
| 1 | Immobilie 1:N statt M:N | ✅ | A2 (Zeile 417) |
| 2 | Kein companyId | ✅ | A3 (Zeile 418) |
| 3 | Frühbucher hardcoded | ✅ | A4 (Zeile 361) |
| 4 | Übernachtung manuell | ✅ | A5 (Zeile 362) |
| 5 | Vorher-Doku kein Gate | ✅ | v7.0b (Zeile 138) |
| 6 | Ereignismelder fehlt | ✅ | v7.0c (Zeile 148) |
| 7 | Ampel nicht im Portal | ✅ | v7.3 + A7 |
| 8 | AG/AN-Aufgaben fehlen | ✅ | A8 (Zeile 365) |
| 9 | Kaufmännische Wizard-Seite | ✅ | IA-WIZ-07 |
| 10 | Sidebar-Struktur | ✅ | IA-NAV-01 bis IA-NAV-05 |
| 11 | Baustellen-Listenformat | ✅ | Loom-Feedback (Zeile 371) |
| 12 | Immobilien-Listenformat | ✅ | Loom-Feedback (Zeile 373) |
| 13 | Phasenübergänge automatisch | ✅ | Phase 0a |
| 14 | "Eingangsseite" global | ✅ | A1 (Zeile 360) |

**→ ABWEICHUNGSTABELLE: 14/14 = 100% ✅**

---

## GESAMTERGEBNIS DURCHLAUF 2

| Abschnitt | Punkte | Abgedeckt | Prozent |
|---|---|---|---|
| Projekte | 9 | 9 | 100% |
| Immobilien | 32 | 32 | 100% |
| Angebote | 16 | 16 | 100% |
| Baustellen | 21 | 21 | 100% |
| Kundenportal | 10 | 10 | 100% |
| Navigation | 12 | 12 | 100% |
| Abweichungstabelle | 14 | 14 | 100% |
| **GESAMT** | **114** | **114** | **100%** |

**Ergebnis: 100% Vollständigkeit erreicht. Alle Punkte aus der Interview-Analyse sind in der todo.md abgedeckt.**

- 28 neue Maßnahmen als IA-* Items hinzugefügt (Zeile 605-676)
- 86 Punkte waren bereits in bestehenden todo-Einträgen abgedeckt (implementiert oder als offene Items)
- 0 fehlende Punkte nach Durchlauf 2
