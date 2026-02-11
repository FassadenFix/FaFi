# Abgleich-Matrix: Interview-Analyse → todo.md

Systematischer 1:1-Abgleich jedes Punktes aus der Interview-Analyse gegen die aktuelle todo.md.

**Legende:** ✅ = in todo.md vorhanden und [x] | ⚠️ = in todo.md vorhanden aber [ ] | ❌ = FEHLT komplett

---

## PROJEKTE (Abschnitt 2)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| P-01 | Sidebar "Erstellen & Erfassen" umbenennen → irreführend | ❌ FEHLT | Abschnitt 2.3 |
| P-02 | Projekte als zentraler Einstiegspunkt mit Lifecycle-Steuerung | ❌ FEHLT (konzeptionell) | Abschnitt 2.3 |
| P-03 | Automatische Phasensteuerung (Angebot erstellt → Phase auto) | ✅ Phase 0a | Zeile 25-29 |
| P-04 | Automatische Phasensteuerung (Angebot versendet → Phase auto) | ✅ Phase 0a | Zeile 26 |
| P-05 | Automatische Phasensteuerung (Auftrag gewonnen → Phase auto) | ✅ Phase 0a | Zeile 29 |
| P-06 | 10-Phasen-Lifecycle definiert | ✅ Phase -1 | Zeile 13-17 |
| P-07 | Kontextabhängige Aktionen je Phase | ✅ Phase 0d | Zeile 44-49 |

---

## IMMOBILIEN (Abschnitt 3)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| I-01 | Immobilie M:N zu Projekten (Zwischentabelle) | ✅ Architektur A2 | Zeile 417 |
| I-02 | Immobilie eigenes companyId-Feld (Eigentümer wechselbar) | ✅ Architektur A3 | Zeile 418 |
| I-03 | Immobilie als eigenständiges Asset mit eigenem Lebenszyklus + Historie | ❌ FEHLT (konzeptionell, kein Todo) | Abschnitt 3.1 |
| I-04 | "Eingangsseite" → "Frontseite" global ersetzen (26 Referenzen) | ✅ Interview-Reval. A1 | Zeile 360 |
| I-05 | Stammdaten: "Wer war noch dabei?" (Hausmeister, techn. MA, etc.) | ❌ FEHLT | Abschnitt 3.3 Seite 0 |
| I-06 | Stammdaten: "Wann wird Entscheidung getroffen?" | ❌ FEHLT | Abschnitt 3.3 Seite 0 |
| I-07 | Stammdaten: "Wer trifft die Entscheidung?" | ❌ FEHLT | Abschnitt 3.3 Seite 0 |
| I-08 | Stammdaten: "Besondere Absprache, Infos?" | ❌ FEHLT | Abschnitt 3.3 Seite 0 |
| I-09 | Technische Aufnahme: Wasseranschluss-Feld | ❌ FEHLT | Abschnitt 3.3 Seite 1 |
| I-10 | Technische Aufnahme: Reinigungsmittelauswahl-Feld | ❌ FEHLT | Abschnitt 3.3 Seite 1 |
| I-11 | Kaufmännische Wizard-Seite komplett (fehlt im Wizard) | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-12 | Kaufm.: "Welche Seiten sollen ins Angebot?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-13 | Kaufm.: "Umsetzungstermin (KO-Termine)" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-14 | Kaufm.: "Kann Wohnung gestellt werden?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-15 | Kaufm.: "Kennenlern-Angebot?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-16 | Kaufm.: "Frühbucher-Rabatt?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-17 | Kaufm.: "Einkaufsgemeinschaft?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-18 | Kaufm.: "Marketinggeeignet?" | ❌ FEHLT | Abschnitt 3.3 Seite 2 |
| I-19 | Immobilien-Übersicht Listenformat (Loom) | ✅ Loom-Feedback | Zeile 373 |
| I-20 | Zuordnungsinformationen anzeigen (Loom) | ✅ Loom-Feedback | Zeile 374 |

---

## ANGEBOTE (Abschnitt 4)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| A-01 | Direkter Workflow-Übergang Projekt → Angebot (Button in ProjektDetail) | ❌ FEHLT | Abschnitt 4.7 |
| A-02 | Keine Doppeleingabe – Daten aus Objektaufnahme übernehmen | ❌ FEHLT (teilweise impl.) | Abschnitt 4.8 |
| A-03 | Frühbucher dynamisch berechnen (hardcoded 2024/2025) | ✅ Interview-Reval. A4 | Zeile 361 |
| A-04 | Übernachtung automatisch bei >100km | ✅ Interview-Reval. A5 | Zeile 362 |
| A-05 | Preisstaffelung (10,50/9,75/9,25/8,75) | ✅ (implementiert) | — |
| A-06 | Positionsstruktur X.1–X.5 im PDF | ✅ (implementiert) | — |
| A-07 | Störer 2-Spalten-Layout | ✅ (implementiert) | — |
| A-08 | Baustelleneinrichtung 199€ Pauschale | ✅ (implementiert) | — |

---

## BAUSTELLEN (Abschnitt 5)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| B-01 | Doppelte Baustellen-Einträge zusammenführen (Sidebar) | ❌ FEHLT | Abschnitt 5.2 |
| B-02 | Klare Unterscheidung Desktop vs. Mobile Vor-Ort-Ansicht | ❌ FEHLT (konzeptionell) | Abschnitt 5.2 |
| B-03 | Baustellen-Übersicht Listenformat (Loom) | ✅ Loom-Feedback | Zeile 371 |
| B-04 | Filterung nach Phase/Status (Loom) | ✅ Loom-Feedback | Zeile 372 |
| B-05 | Vorher-Doku als PFLICHT-Gate (Arbeitstag erst nach Doku) | ✅ v7.0b | Zeile 138 |
| B-06 | Tagesablauf-Wizard strukturieren (Morgen/Abend) | ✅ v7.0c | Zeile 147-149 |
| B-07 | Ereignismelder als eigenständige "on top"-Funktion | ✅ v7.0c | Zeile 148 |
| B-08 | Abschlussfrage "Baustellenplanung zeitlich beibehalten?" MORGENS UND ABENDS | ❌ FEHLT (nur abends?) | Abschnitt 5.1 |
| B-09 | Bautagebuch-Eintrag automatisch (Bereiche + Witterung 9/13/17 Uhr) | ✅ v7.0c | Zeile 150 |
| B-10 | Foto-Upload kontextbezogene Benennung | ✅ v7.0a | Zeile 121 |
| B-11 | Teamstruktur: 4 Personen (TL + AT1 + PL + AT2) | ❌ FEHLT (kein Todo) | Abschnitt 5.1 |
| B-12 | Teamleiter bekommt Projekt zugewiesen, Projekt = mehrere Baustellen | ❌ FEHLT (konzeptionell) | Abschnitt 5.1 |

---

## KUNDENPORTAL (Abschnitt 6)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| K-01 | Ampel-System im Frontend aktivieren | ✅ v7.3 + A7 | Zeile 215-225, 364 |
| K-02 | AG/AN-Aufgaben unterscheiden | ✅ A8 + M-08 | Zeile 365, 497 |
| K-03 | Dokumenten-Karte mit Auflistung und Anzahl | ✅ v7.3 | Zeile 227 |
| K-04 | Aktuelles Projekt direkt in Detailansicht auf Startseite | ❌ FEHLT | Abschnitt 6.1 |
| K-05 | Kunde = UNTERNEHMEN, ein Zugang pro Unternehmen | ✅ v7.3 | Zeile 224, 228 |
| K-06 | Mieter/Bewohner separates Portal (später) | ✅ Backlog | Zeile 432 |

---

## NAVIGATION GESAMT (Abschnitt 7)

| # | Punkt aus Interview-Analyse | todo.md Status | Referenz |
|---|---|---|---|
| N-01 | "Erstellen & Erfassen" irreführend → umbenennen | ❌ FEHLT | = P-01 |
| N-02 | Doppelte Baustellen-Einträge | ❌ FEHLT | = B-01 |
| N-03 | "Projektvorbereitung" vs. "Planung" überlappen → zusammenführen | ❌ FEHLT | Abschnitt 7.2 |
| N-04 | "Offene/Überfällige Projekte" sind Filter, keine Menüpunkte | ❌ FEHLT | Abschnitt 7.2 |
| N-05 | Hierarchische CRM-Darstellung (Unternehmen → Kontakte → Projekte) | ✅ A6 | Zeile 363 |
| N-06 | Sidebar-Reihenfolge folgt nicht dem 10-Phasen-Workflow | ❌ FEHLT | Abschnitt 7.2 |

---

## ABWEICHUNGSTABELLE (Abschnitt 8, 14 Punkte)

| # | Abweichung | todo.md Status | Referenz |
|---|---|---|---|
| ABW-01 | Immobilie 1:N statt M:N | ✅ | = I-01 |
| ABW-02 | Kein companyId bei Immobilie | ✅ | = I-02 |
| ABW-03 | Frühbucher hardcoded | ✅ | = A-03 |
| ABW-04 | Übernachtung manuell | ✅ | = A-04 |
| ABW-05 | Vorher-Doku kein Gate | ✅ | = B-05 |
| ABW-06 | Ereignismelder fehlt | ✅ | = B-07 |
| ABW-07 | Ampel nicht im Portal | ✅ | = K-01 |
| ABW-08 | AG/AN-Aufgaben fehlen | ✅ | = K-02 |
| ABW-09 | Kaufmännische Wizard-Seite | ❌ FEHLT | = I-11 |
| ABW-10 | Sidebar-Struktur | ❌ FEHLT | = N-01 bis N-06 |
| ABW-11 | Baustellen-Listenformat | ✅ | = B-03 |
| ABW-12 | Immobilien-Listenformat | ✅ | = I-19 |
| ABW-13 | Phasenübergänge automatisch | ✅ | = P-03/04/05 |
| ABW-14 | "Eingangsseite" global | ✅ | = I-04 |

---

## ZUSAMMENFASSUNG

### ✅ Bereits in todo.md (28 Punkte)
P-03, P-04, P-05, P-06, P-07, I-01, I-02, I-04, I-19, I-20, A-03, A-04, A-05, A-06, A-07, A-08, B-03, B-04, B-05, B-06, B-07, B-09, B-10, K-01, K-02, K-03, K-05, K-06, N-05

### ❌ FEHLT in todo.md (20 Punkte)
P-01, P-02, I-03, I-05, I-06, I-07, I-08, I-09, I-10, I-11, I-12, I-13, I-14, I-15, I-16, I-17, I-18, A-01, A-02, B-01, B-02, B-08, B-11, B-12, K-04, N-01, N-02, N-03, N-04, N-06

**Vollständigkeit vor Ergänzung: 28/48 = 58,3%**
**Fehlende Punkte: 20 unique (nach Deduplizierung N-01=P-01, N-02=B-01)**
