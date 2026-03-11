# FaFi PM – Vollständiger Abarbeitungs- und Umsetzungsplan

**Stand:** 09. Februar 2026
**Grundlage:** todo.md – 109 offene Roh-Punkte → 63 konsolidierte einzigartige Punkte
**Methode:** Duplikat-Konsolidierung über 6 Sektionen, Abhängigkeitsanalyse, intentionsbasierte Priorisierung

---

## Vorbemerkung

Die todo.md enthält offene Punkte aus 6 verschiedenen Quellen (E2E-Tests v2/v3/v4, Interview-Analyse, Intentionsbasierter Maßnahmenplan, Backlog). Viele Punkte wurden in mehreren Sektionen erfasst, weil sie aus unterschiedlichen Perspektiven identifiziert wurden. Dieser Plan konsolidiert alle Duplikate und ordnet die 63 einzigartigen Punkte in eine logische Abarbeitungsreihenfolge mit klaren Abhängigkeiten.

Die Reihenfolge folgt dem Prinzip: **Erst das Fundament stabilisieren, dann die Struktur korrigieren, dann die Inhalte ergänzen.**

---

## Sprint 1: Sofort-Korrekturen und Crash-Fixes (Aufwand: ~4h)

**Intention:** Grundlegende Stabilität herstellen – kein Nutzer soll auf Crashes oder offensichtlich falsche Daten stoßen.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 1 | G-01 | "Eingangsseite" → "Frontseite" global ersetzen (26 Stellen) | 30min | keine |
| 2 | V4-NAV-06 = V2-F-006 | Header-Datum dynamisieren (statisches "03. Feb" → `new Date()`) | 15min | keine |
| 3 | V4-FEAT-03 = V2-F-008 = V3-S8-F-001/002 | Dashboard-KPIs korrigieren: echte Projektzahlen, Fake-"+12%" entfernen | 2h | keine |
| 4 | V4-GATE-04 | Baustellenmanager-Route registrieren: /mobile → BaustellenManager.tsx | 30min | keine |
| 5 | V4-NAV-10 | Immobilien-Entwurf-Duplikate bereinigen (Auto-Save-Bug) | 30min | keine |

**Ergebnis Sprint 1:** Keine Crashes, korrekte Zahlen, alle Routen erreichbar.

---

## Sprint 2: Kalender-Bugs komplett beheben (Aufwand: ~4h)

**Intention:** Der Kalender ist ein zentrales Werkzeug im ProjektWizard. Wenn Datumseingaben unzuverlässig sind, kann kein Projekt korrekt erfasst werden.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 6 | V3-S2-F-005 = V2-F-019/021 | Kalender-Popovers: Controlled State einführen, damit Start-Kalender schließt wenn Ende-Kalender öffnet | 2h | keine |
| 7 | V2-F-023 | Kalender-Popover Auto-Close nach Datumsauswahl | 30min | Nr. 6 |
| 8 | V2-F-020 | Ende-Kalender startet beim Monat des Startdatums (nicht beim aktuellen Monat) | 30min | Nr. 6 |
| 9 | V2-F-025 | Terminhinweise in Zusammenfassung anzeigen | 30min | keine |
| 10 | V2-F-028 | Beschreibung und Terminhinweise getrennt anzeigen | 30min | keine |

**Ergebnis Sprint 2:** Zuverlässige Datumseingabe in allen Wizards.

---

## Sprint 3: Sidebar-Navigation überarbeiten (Aufwand: ~12h)

**Intention:** Die Navigation muss dem 10-Phasen-Workflow folgen (Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss). Aktuell suggeriert "Erstellen & Erfassen" eine einmalige Aktion, obwohl Projekte über ihren gesamten Lifecycle verwaltet werden. Doppelte Einträge verwirren.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 11 | E-01 = IA-NAV-01 = V4-NAV-01 | Sidebar-Sektion "Erstellen & Erfassen" umbenennen → workflow-orientierter Name | 2h | keine |
| 12 | C-07 = IA-NAV-02 = V4-NAV-02 | Doppelte Baustellen-Einträge zusammenführen (Baustellen + Baustellenmanager) | 2h | Nr. 11 |
| 13 | E-04 = IA-NAV-03 | "Projektvorbereitung" vs. "Planung" zusammenführen oder klar differenzieren | 2h | Nr. 11 |
| 14 | E-02 = IA-NAV-04 = V4-NAV-04 | "Offene/Überfällige Projekte" als Filter in Projekte-Seite integrieren statt eigene Menüpunkte | 2h | Nr. 11 |
| 15 | E-03 = IA-NAV-05 = V4-NAV-08 | Sidebar-Reihenfolge an 10-Phasen-Workflow anpassen | 3h | Nr. 11-14 |
| 16 | V4-NAV-03 | Konsistente Benennung: URL = Sidebar-Label = Seitentitel | 1h | Nr. 15 |

**Ergebnis Sprint 3:** Klare, workflow-orientierte Navigation ohne Duplikate.

---

## Sprint 4: Immobilien-Datenmodell korrigieren (Aufwand: ~9h)

**Intention:** "Immobilie muss einzeln betrachtet werden können. Garantieurkunde darf nicht eigentümer- oder projektorientiert sein." Die Immobilie ist ein eigenständiges Asset mit eigenem Lebenszyklus – sie überlebt Projekte und Eigentümerwechsel.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 17 | A1-01 = IA-IMM-01 (Teil) | `properties` um `companyId`-Feld erweitern (aktueller Eigentümer) | 1h | keine |
| 18 | A1-02 = IA-IMM-01 (Teil) | M:N-Zwischentabelle `projectProperties` statt 1:N | 3h | Nr. 17 |
| 19 | A1-03 | Immobilien-Listenansicht: Aktuellen Eigentümer und zugeordnete Projekte anzeigen | 2h | Nr. 18 |
| 20 | A1-04 | Immobilien-Detailansicht: Projekt-Historie anzeigen | 2h | Nr. 18 |
| 21 | A1-05 | Garantieurkunde: An Immobilie gebunden, nicht an Projekt oder Unternehmen | 1h | Nr. 18 |

> **Hinweis:** A1-01 und A1-02 wurden laut todo.md bereits als erledigt markiert (Interview-Revalidierung A2/A3, Zeile 417-418). Hier muss geprüft werden, ob die Implementierung tatsächlich korrekt ist oder ob die Markierung voreilig war. Die E2E-Tests v4 zeigen, dass die Immobilien-Zuordnung noch nicht korrekt funktioniert.

**Ergebnis Sprint 4:** Immobilie als eigenständiges Asset mit korrekter M:N-Zuordnung.

---

## Sprint 5: ObjektaufnahmeWizard erweitern (Aufwand: ~14h)

**Intention:** "Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung." Alle relevanten Informationen müssen bei der Objektaufnahme erfasst werden, damit das Angebot automatisch abgeleitet werden kann.

### Sprint 5a: Stammdaten-Erweiterung (WER) – 2.5h

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 22 | B1-01 = IA-WIZ-01 | Feld "Wer war noch dabei?" (Checkbox: Hausmeister, techn. MA, Eigentümervertreter, Mieter) | 1h | keine |
| 23 | B1-02 = IA-WIZ-02 | Feld "Wann wird Entscheidung getroffen?" (Datepicker) | 30min | keine |
| 24 | B1-03 = IA-WIZ-03 | Feld "Wer trifft die Entscheidung?" (Textfeld) | 30min | keine |
| 25 | B1-04 = IA-WIZ-04 | Feld "Besondere Absprache, Infos?" (Textarea) | 30min | keine |

### Sprint 5b: Technische Felder pro Seite (WAS) – 2h

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 26 | B2-01 = IA-WIZ-05 | Feld "Wasseranschluss" pro Gebäudeseite (Wo? Welcher? Wieviel Zoll?) | 1h | keine |
| 27 | B2-02 = IA-WIZ-06 | Feld "Reinigungsmittelauswahl" pro Gebäudeseite (Select/Dropdown) | 1h | keine |

### Sprint 5c: Kaufmännische Wizard-Seite – KOMPLETT NEU (WIE) – 7h

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 28 | B3-01 = IA-WIZ-07 = V4-FEAT-01 | Kaufmännische Wizard-Seite als neuen Step nach den 4 Gebäudeseiten | 4h | Nr. 22-27 |
| 29 | B3-02 = IA-WIZ-08 | Feld "Welche Seiten sollen ins Angebot?" (Checkbox pro erfasste Seite) | 30min | Nr. 28 |
| 30 | B3-03 = IA-WIZ-09 | Feld "Umsetzungstermin" mit Hinweis "KO-Termine, keine Wunschtermine" | 30min | Nr. 28 |
| 31 | B3-04 = IA-WIZ-10 | Feld "Kann Wohnung gestellt werden?" (Ja/Nein Toggle) | 15min | Nr. 28 |
| 32 | B3-05 = IA-WIZ-11 | Feld "Kennenlern-Angebot?" (Ja/Nein Toggle) | 15min | Nr. 28 |
| 33 | B3-06 = IA-WIZ-12 | Feld "Frühbucher-Rabatt?" (Ja/Nein + automatische Berechnung) | 30min | Nr. 28 |
| 34 | B3-07 = IA-WIZ-13 | Feld "Einkaufsgemeinschaft?" (Ja/Nein + Textfeld) | 30min | Nr. 28 |
| 35 | B3-08 = IA-WIZ-14 | Feld "Marketinggeeignet?" (Ja/Nein + automatische Info) | 30min | Nr. 28 |

### Sprint 5d: Validierung und Kleinigkeiten – 2.5h

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 36 | V2-F-043 | Fassadenart Pflichtfeld-Validierung im Wizard | 30min | keine |
| 37 | V2-F-046 | Immobilien-Zähler aktualisiert nach Speichern (invalidate Query) | 30min | keine |
| 38 | V4-GATE-05 = V2-F-053 | Automatische Immobilien-Zuordnung beim Erstellen aus Projekt-Kontext | 1h | Nr. 18 |
| 39 | V4-NAV-05 | Duplikat-Erkennung bei Immobilien (gleiche Adresse warnen) | 30min | keine |

**Ergebnis Sprint 5:** Vollständiger ObjektaufnahmeWizard mit allen 3 Ebenen (WER/WAS/WIE).

---

## Sprint 6: Angebots-Workflow – Keine Doppeleingabe (Aufwand: ~6h)

**Intention:** "Der Kundenberater soll KEINE neuen Daten eingeben, sondern nur auswählen." Das Angebot ist die Ableitung der Objektaufnahme, nicht eine Neueingabe.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 40 | B4-02 = IA-ANG-01 | Button "Angebot für dieses Projekt erstellen" in ProjektDetail | 1h | keine |
| 41 | B4-01 = IA-ANG-02 | AngebotWizard: Daten aus Objektaufnahme übernehmen statt neu eingeben | 3h | Nr. 28-35 (kaufm. Felder müssen existieren) |
| 42 | V4-GATE-01 | Gate: Angebots-Wizard blockiert bei 0 Immobilien → "Objektaufnahme erforderlich" | 1h | Nr. 40 |
| 43 | V4-GATE-03 | Kontextabhängiger "Nächster Schritt" prüft Objektaufnahme-Vollständigkeit | 1h | Nr. 42 |

**Ergebnis Sprint 6:** Nahtloser Übergang Objektaufnahme → Angebot ohne Doppeleingabe.

---

## Sprint 7: Baustellen-Workflow korrigieren (Aufwand: ~14h)

**Intention:** "Erst nach vollständiger Dokumentation kann Baustelle gestartet werden." Die Baustelle ist ein Tagesablauf-Tool mit klarer Morgen-/Abend-Struktur und Teamzuweisung.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 44 | C-01 = IA-BAU-01 | Desktop vs. Mobile klar differenzieren: /baustellen = Verwaltung, /mobile = Vor-Ort | 1h | Nr. 4 (Route muss existieren) |
| 45 | C-02 | Vorher-Dokumentation als Gate: "Arbeitstag beginnen" erst nach Doku aktiv | 3h | keine |
| 46 | V4-GATE-02 | "Arbeitstag beginnen" Gate-Button im Teamleitercheck – erst aktiv wenn Pflicht-Punkte erledigt | 2h | Nr. 45 |
| 47 | C-03 = IA-BAU-02 = V4-NAV-09 | Abschlussfrage "Wird Planung beibehalten?" MORGENS UND ABENDS stellen | 1h | keine |
| 48 | C-04 = IA-BAU-03 | Teamstruktur: 4 Personen (TL+AT1 als Team 1, PL+AT2 als Team 2) in Zuweisung | 3h | keine |
| 49 | C-05 = IA-BAU-04 | Teamleiter bekommt Projekt zugewiesen, Projekt = mehrere Baustellen | 2h | Nr. 48 |
| 50 | C-06 | Ereignismelder "on top" – jederzeit verfügbar (Floating Action Button) | 2h | keine |

**Ergebnis Sprint 7:** Baustelle als strukturierter Tagesablauf mit Gates und Teamstruktur.

---

## Sprint 8: Kundenportal als Arbeitsplattform (Aufwand: ~8h)

**Intention:** "Ziel: Kunde nutzt Portal als Workplattform, sieht was noch fehlt und von wem." Das Portal soll Transparenz schaffen und den Kunden aktiv einbinden.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 51 | D-01 = IA-KP-01 | Startseite: Aktuelles Projekt direkt in Detailansicht öffnen | 2h | keine |
| 52 | D-02 = V4-FEAT-02 | Ampel-System aus Backend ins Portal-Frontend integrieren | 2h | keine |
| 53 | D-03 | Jede Baustelle mit eigener Ampel anzeigen | 1h | Nr. 52 |
| 54 | D-04 | Aufgaben: Feld "Verantwortungsseite" (Auftraggeber/Auftragnehmer) | 1h | keine |
| 55 | D-05 | Dokumente auf 3 Ebenen: Projekt / Baustelle / Allgemein | 2h | keine |

**Ergebnis Sprint 8:** Kundenportal als echte Arbeitsplattform mit Ampel und Transparenz.

---

## Sprint 9: CRM und Preislogik (Aufwand: ~6h)

**Intention:** CRM muss die Hierarchie Unternehmen → Kontakte → Projekte abbilden. Preise müssen dynamisch und automatisch berechnet werden.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 56 | E-05 | CRM: Hierarchische Ansicht Unternehmen → Kontakte → Projekte | 3h | keine |
| 57 | F-01 | Frühbucher-Daten dynamisch berechnen (relativ zur aktuellen Saison) | 1h | keine |
| 58 | F-02 | Übernachtung automatisch vorschlagen (>100km oder >50km + >1 Tag) | 2h | keine |

**Ergebnis Sprint 9:** CRM mit korrekter Hierarchie, automatische Preisberechnung.

---

## Sprint 10: Verbleibende E2E-Bugs und UX (Aufwand: ~6h)

**Intention:** Restliche Findings aus den E2E-Tests beheben, die nicht in den thematischen Sprints abgedeckt wurden.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 59 | V3-S9-F-003 | Einsatzkalender: Einsätze für Zug ohne Mitglieder nicht anzeigen | 1h | keine |
| 60 | V3-S3-F-001 | Kontakt anlegen: Echtes Formular statt nur Toast | 1h | keine |
| 61 | V3-S9-F-001 | Einsatzkalender: Monatsname und Navigation hinzufügen | 1h | keine |
| 62 | V3-S13-F-001 | Benachrichtigungs-Badge: Inhalt korrigieren (nicht Offline-Sync anzeigen) | 30min | keine |
| 63 | V3-S12-F-001 | Finanzen-Charts: Daten korrekt laden und anzeigen | 1h | keine |
| 64 | V4-NAV-07 | "Hauptkontakte" KPI entfernen oder als "Entscheider" definieren | 30min | keine |
| 65 | V4-FEAT-05 | Kundenportal: Projekte ab Phase 1 als "aktiv" anzeigen | 1h | keine |

**Ergebnis Sprint 10:** Alle bekannten E2E-Bugs behoben.

---

## Sprint 11: Fotodokumentation und Konzeptdokumentation (Aufwand: ~5h)

**Intention:** Fotos sind versicherungsrelevant und müssen zuverlässig gespeichert werden. Die konzeptionellen Grundlagen müssen dokumentiert sein.

| Nr. | ID (Referenz) | Maßnahme | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| 66 | V4-FEAT-04 | Fotodokumentation funktional: Upload + S3-Speicherung im ObjektaufnahmeWizard | 3h | keine |
| 67 | IA-IMM-01 | Konzeptdokument: Immobilie als eigenständiges Asset mit Lebenszyklus | 1h | Nr. 17-21 |
| 68 | IA-IMM-02 | Konzeptdokument: Projekte als zentraler Einstiegspunkt mit Lifecycle-Steuerung | 1h | Nr. 67 |

**Ergebnis Sprint 11:** Funktionale Fotodokumentation, konzeptionelle Grundlagen dokumentiert.

---

## Backlog (Zukunft – nicht im aktuellen Scope)

| Nr. | ID | Maßnahme | Aufwand | Status |
|---|---|---|---|---|
| 69 | Backlog-01 | Mieter/Bewohner-Portal (separates Portal) | 20h+ | Interview: "später, nicht jetzt" |
| 70 | Backlog-02 | Teamleiter-Chat (optional) | 8h+ | Interview: "optional" |

---

## Gesamtübersicht

| Sprint | Thema | Punkte | Aufwand | Abhängigkeiten |
|---|---|---|---|---|
| 1 | Sofort-Korrekturen | 5 | ~4h | keine |
| 2 | Kalender-Bugs | 5 | ~4h | keine |
| 3 | Sidebar-Navigation | 6 | ~12h | keine |
| 4 | Immobilien-Datenmodell | 5 | ~9h | keine |
| 5 | ObjektaufnahmeWizard | 18 | ~14h | Sprint 4 (M:N-Modell) |
| 6 | Angebots-Workflow | 4 | ~6h | Sprint 5 (kaufm. Felder) |
| 7 | Baustellen-Workflow | 7 | ~14h | Sprint 1 (Route) |
| 8 | Kundenportal | 5 | ~8h | keine |
| 9 | CRM und Preislogik | 3 | ~6h | keine |
| 10 | Verbleibende Bugs | 7 | ~6h | keine |
| 11 | Foto + Konzeptdoku | 3 | ~5h | Sprint 4 |
| Backlog | Zukunft | 2 | ~28h | – |
| **GESAMT (ohne Backlog)** | | **68** | **~88h** | |

---

## Abhängigkeitsgraph

```
Sprint 1 (Sofort) ──────────────────────────────────────→ Sprint 7 (Baustelle)
     │
     ├── Sprint 2 (Kalender) [parallel möglich]
     │
     ├── Sprint 3 (Sidebar) [parallel möglich]
     │
     └── Sprint 4 (Immobilien-Datenmodell)
              │
              ├── Sprint 5 (ObjektaufnahmeWizard)
              │        │
              │        └── Sprint 6 (Angebots-Workflow)
              │
              └── Sprint 11 (Foto + Konzeptdoku)

Sprint 8 (Kundenportal) [unabhängig, parallel möglich]
Sprint 9 (CRM + Preislogik) [unabhängig, parallel möglich]
Sprint 10 (Verbleibende Bugs) [unabhängig, parallel möglich]
```

**Kritischer Pfad:** Sprint 1 → Sprint 4 → Sprint 5 → Sprint 6 (~33h)

**Parallelisierbar:** Sprints 2, 3, 7, 8, 9, 10 können unabhängig voneinander bearbeitet werden.

---

## Empfohlene Abarbeitungsreihenfolge

**Woche 1 (Mo-Fr, ~40h):**
- Sprint 1: Sofort-Korrekturen (4h) → Montag Vormittag
- Sprint 2: Kalender-Bugs (4h) → Montag Nachmittag
- Sprint 3: Sidebar-Navigation (12h) → Dienstag + Mittwoch Vormittag
- Sprint 4: Immobilien-Datenmodell (9h) → Mittwoch Nachmittag + Donnerstag
- Sprint 10: Verbleibende Bugs (6h) → Freitag

**Woche 2 (Mo-Fr, ~48h):**
- Sprint 5: ObjektaufnahmeWizard (14h) → Montag + Dienstag
- Sprint 6: Angebots-Workflow (6h) → Mittwoch Vormittag
- Sprint 7: Baustellen-Workflow (14h) → Mittwoch Nachmittag + Donnerstag
- Sprint 8: Kundenportal (8h) → Freitag

**Woche 3 (Mo-Mi, ~17h):**
- Sprint 9: CRM und Preislogik (6h) → Montag
- Sprint 11: Foto + Konzeptdoku (5h) → Dienstag
- Abschluss-E2E-Test + Puffer (6h) → Mittwoch
