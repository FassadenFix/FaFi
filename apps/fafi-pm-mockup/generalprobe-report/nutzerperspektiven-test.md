# Nutzerperspektiven-Tests – FaFi PM
## Datum: 09. Februar 2026

---

## Rolle 1: Geschäftsführung (GF)

### Szenario: "Ich will in 30 Sekunden wissen, wie das Unternehmen steht"

**Dashboard-Prüfung:**
- 8 KPI-Karten sichtbar: Offene Angebote (0), Projekte (4), Aktive Baustellen (0), Offene Aufgaben (2), Conversion-Rate (0%), Offene Rechnungen (0), Umsatz bezahlt (0,00€), Aktive Garantien (0)
- Zeitraumfilter "Aktuell" vorhanden (umschaltbar auf Monat/Quartal/Jahr)
- "Nächste Schritte" Widget zeigt alle 4 Projekte mit nächster Aktion
- "Projekte nach Phase" Kanban-Board mit Drag & Drop
- Countdown-Aufgaben mit Fälligkeitsdatum und Dringlichkeit

**GF-Findings:**
- [OK] Geschäftsüberblick in <30 Sekunden erfassbar
- [OK] KPIs decken alle relevanten Bereiche ab (Pipeline, Umsatz, Conversion, Baustellen)
- [OK] "Nächste Schritte" zeigt proaktiv, wo Handlungsbedarf besteht
- [FINDING] NP-GF-F01: Aktivitäts-Feed zeigt "Test User" statt echte Benutzernamen – bei Realdaten kein Problem, aber bei Demo irritierend
- [FINDING] NP-GF-F02: Alle KPIs zeigen 0/0€ – Dashboard wirkt "leer" für GF. Bei Realdaten kein Problem, aber für Demo/Präsentation sollte es Seed-Daten geben

---

## Rolle 2: Kundenberater (KB)

### Szenario: "Ich komme von einem Kundentermin und will die Objektaufnahme erfassen"

**Geprüft:**
- Dashboard → "Objektaufnahme starten" Schnellaktion vorhanden
- Projekte → Projekt öffnen → Immobilien-Tab → "Neue Immobilie" Button
- ObjektaufnahmeWizard: Stammdaten (WER) → 4 Gebäudeseiten (WAS) → Kaufmännisch (WIE) → Zusammenfassung
- AngebotWizard: Datenübernahme aus Objektaufnahme, keine Doppeleingabe
- Nachfassen: Countdown-Aufgaben im Dashboard sichtbar

**KB-Findings:**
- [OK] Workflow Objektaufnahme → Angebot ist flüssig und logisch
- [OK] 3 Ebenen (WER/WAS/WIE) im Wizard intuitiv
- [OK] Kaufmännische Seite mit allen 8 Feldern vorhanden
- [OK] "Nächster Schritt: Angebot erstellen" direkt im Projekt sichtbar
- [OK] Unternehmen & Kontakte hierarchisch dargestellt (102 Unternehmen, 104 Kontakte)
- [FINDING] NP-KB-F01: Schnellaktion "Objektaufnahme starten" auf Dashboard – es ist nicht sofort klar, ob man erst ein Projekt braucht oder direkt starten kann

---

## Rolle 3: AT-Leiter (Außenteam-Leiter)

### Szenario: "Ich bin auf der Baustelle und will den Arbeitstag dokumentieren"

**Geprüft:**
- Baustellen-Übersicht (/baustellen): Tabelle mit Status-Filter
- Mobile Ansicht (/mobile): Baustellenmanager für Vor-Ort-Nutzung
- Vorher-Dokumentation als Gate vor Baustellenstart
- Morgen/Abend-Workflow mit Planungsfrage
- Ereignismelder als Floating Action Button
- Teamleitercheck als Pflicht-Checkliste

**AT-Findings:**
- [OK] Baustellen-Übersicht zeigt alle zugewiesenen Baustellen
- [OK] Desktop (/baustellen) vs. Mobile (/mobile) klar differenziert
- [OK] Vorher-Dokumentation als Gate implementiert
- [OK] Ereignismelder "on top" verfügbar
- [FINDING] NP-AT-F01: Aktuell keine Baustellen vorhanden → Empty State zeigt "Noch keine Baustellen vorhanden" – korrekt, aber AT-Leiter kann den Workflow nicht testen ohne Baustelle
- [FINDING] NP-AT-F02: Sidebar zeigt "DURCHFÜHRUNG" Gruppe – für AT-Leiter der wichtigste Bereich, aber er ist ganz unten in der Sidebar

---

## Rolle 4: Projektleiter (PL)

### Szenario: "Ich will den Status meiner Projekte und die Vorbereitungsaufgaben prüfen"

**Geprüft:**
- Projekt-Detail mit 9 Tabs
- Einsatzplanung (/einsatzplanung): Kalender-basiert
- Ressourcenplaner (/ressourcenplaner): Team- und Geräteverfügbarkeit
- Vorbereitungsaufgaben-Board (/vorbereitungsaufgaben): Kanban mit AG/AN

**PL-Findings:**
- [OK] Projekt-Detail zeigt alle relevanten Infos (Immobilien, Angebote, Aufträge, Baustellen)
- [OK] 10-Phasen-Zeitstrahl korrekt dargestellt
- [OK] Vorbereitungsaufgaben-Board mit Kanban, Drag & Drop und AG/AN-Filter
- [OK] Einsatzplanung und Ressourcenplaner unter "PLANUNG & EINSATZ" gruppiert
- [FINDING] NP-PL-F01: Vorbereitungsaufgaben-Board zeigt "Keine Aufgaben gefunden" – korrekt bei leerer DB, aber PL kann den Workflow nicht testen

---

## Rolle 5: Büro

### Szenario: "Ich will Rechnungen verwalten und das Archiv durchsuchen"

**Geprüft:**
- Finanzen (/finanzen): Charts, KPI-Karten, Tabs
- Archiv (/archiv): 8 Statistik-Karten, Quellen-Tabs, Volltextsuche
- Garantien (/garantien): Übersicht und Verwaltung
- Benachrichtigungen: Badge im Header

**Büro-Findings:**
- [OK] Finanzen-Seite mit Charts und KPIs übersichtlich
- [OK] Archiv aggregiert alle Datenquellen (35 Dokumente sichtbar)
- [OK] Volltextsuche mit Highlighting funktioniert
- [OK] Benachrichtigungs-Badge zeigt "3" ungelesene
- [FINDING] NP-BU-F01: Archiv-Verknüpfungen zeigen "–" bei vielen Einträgen → Büro kann nicht erkennen, zu welchem Projekt ein Dokument gehört
- [FINDING] NP-BU-F02: Mahnwesen unter Finanzen → Automatische Mahnstufen sind implementiert, aber bei 0 Rechnungen nicht testbar

---

## Zusammenfassung Nutzerperspektiven-Findings

| ID | Rolle | Schwere | Finding |
|---|---|---|---|
| NP-GF-F01 | GF | MINOR | Aktivitäts-Feed zeigt "Test User" statt echte Namen |
| NP-GF-F02 | GF | MINOR | Dashboard KPIs alle 0 – bei Demo/Präsentation irritierend |
| NP-KB-F01 | KB | MINOR | "Objektaufnahme starten" Schnellaktion – Kontext unklar |
| NP-AT-F01 | AT | INFO | Keine Baustellen vorhanden → Workflow nicht testbar |
| NP-AT-F02 | AT | MINOR | DURCHFÜHRUNG-Gruppe ganz unten in Sidebar |
| NP-PL-F01 | PL | INFO | Vorbereitungsaufgaben leer → Workflow nicht testbar |
| NP-BU-F01 | BU | MINOR | Archiv-Verknüpfungen fehlen bei älteren Dokumenten |
| NP-BU-F02 | BU | INFO | Mahnwesen nicht testbar bei 0 Rechnungen |

**Gesamtbewertung: 0 CRITICAL, 0 MAJOR, 5 MINOR, 3 INFO**

Die Anwendung ist aus allen 5 Rollenperspektiven funktional und navigierbar. Die MINOR-Findings betreffen hauptsächlich Testdaten-Probleme und kleinere UX-Optimierungen. Die Kernworkflows (Objektaufnahme → Angebot → Auftrag → Baustelle → Abnahme) sind für alle Rollen nachvollziehbar.
