# FaFi PM – Intentionsabgleich-Bericht E2E-Test v4.0

**Datum:** 09. Februar 2026
**Methode:** 13 Szenarien aus 5 Nutzerperspektiven, jeder Workflow gegen die 8 Kern-Intentionen aus den Interviews abgeglichen
**Findings:** 71 dokumentiert (V4-001 bis V4-071)
**Grundlage:** Ausschließlich das gemeinsam erzielte und abgeglichene Verständnis aus den Interviews

---

## 1. Gesamtbewertung pro Intention

### Intention 1: Immobilie als eigenständiges Asset
> **Interview-Vorgabe:** "Die Immobilie gehört dem UNTERNEHMEN, nicht dem Projekt. Sie existiert einmal und wird Projekten zugeordnet."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| Immobilie als eigene Entität | ✅ Umgesetzt | Eigene Tabelle, eigene Übersicht, eigene Wizard-Klickstrecke |
| Zuordnung zu Unternehmen | ✅ Umgesetzt | companyId-Feld vorhanden und funktional |
| Zuordnung zu Projekt (1:N) | ⚠️ Teilweise | Feld vorhanden, aber automatische Zuordnung beim Erstellen aus Projekt-Kontext fehlt |
| Duplikat-Erkennung | ❌ Fehlt | Gleiche Adresse kann mehrfach angelegt werden (V4-023) |
| Wiederverwendung über Projekte | ⚠️ Unklar | Konzeptionell vorgesehen, aber UI bietet keine "Bestehende Immobilie zuordnen"-Funktion |

**Fazit:** Die Grundstruktur stimmt, aber die **automatische Zuordnung** und die **Duplikat-Erkennung** fehlen. 3 von 4 Immobilien sind verwaist (V4-021, V4-061). Das widerspricht der Kern-Intention: Wenn Immobilien regelmäßig verwaisen, funktioniert das Asset-Konzept nicht.

---

### Intention 2: Objektaufnahme = Datenbasis, Angebot = Ableitung
> **Interview-Vorgabe:** "Die Qualität des Angebots hängt von der Qualität der Objektaufnahme ab. Die Objektaufnahme liefert ALLE Daten, die das Angebot braucht."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| ObjektaufnahmeWizard als Datenerfassung | ✅ Umgesetzt | 4 Seiten pro Immobilie, Flächen, Fassadentyp, Schäden |
| 3 logische Ebenen (WER/WAS/WIE) | ⚠️ Teilweise | WER (Stammdaten) ✅, WAS (Seiten) ✅, WIE (kaufmännisch) ❌ fehlt |
| Kaufmännische Felder | ❌ Fehlt | "Wer entscheidet?", "Marketinggeeignet?", "Einkaufsgemeinschaft?", "KO-Termine?" fehlen komplett |
| Datenübernahme ins Angebot | ⚠️ Teilweise | Flächen werden übernommen, aber Wizard erlaubt Angebot OHNE Immobilien (V4-026) |
| Gate: Objektaufnahme vor Angebot | ❌ Fehlt | Angebots-Wizard blockiert NICHT bei 0 Immobilien (V4-026) |
| Fotodokumentation | ❌ Nicht funktional | Upload-Felder vorhanden, aber 0 Fotos gespeichert (V4-064) |

**Fazit:** Die Objektaufnahme erfasst technische Daten korrekt (Seiten, Flächen, Fassadentyp). Aber die **kaufmännische Ebene fehlt komplett**, die **Fotodokumentation funktioniert nicht**, und das **Gate** (Objektaufnahme muss abgeschlossen sein, bevor Angebot erstellt wird) ist nicht implementiert. Das untergräbt die Kern-Intention: Wenn das Angebot ohne vollständige Objektaufnahme erstellt werden kann, ist die Datenqualität nicht gewährleistet.

---

### Intention 3: 3 logische Ebenen (Projekt → Immobilie → Seiten)
> **Interview-Vorgabe:** "3 Ebenen: Projekt (WER), Immobilie (WAS), Seiten (WIE). Die Seiten sind die kleinste Einheit."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| Projekt-Ebene | ✅ Umgesetzt | Projekte mit 10-Phasen-Workflow |
| Immobilien-Ebene | ✅ Umgesetzt | Eigene Entität mit Adresse, Fläche |
| Seiten-Ebene | ✅ Umgesetzt | 4 Seiten pro Immobilie im Wizard |
| Sichtbarkeit der 3 Ebenen | ⚠️ Teilweise | Seiten nur im Wizard sichtbar, nicht in der Übersicht (V4-022) |
| Zuordnungskette Projekt→Immobilie→Seiten | ⚠️ Teilweise | Seiten→Immobilie ✅, Immobilie→Projekt ⚠️ (oft nicht zugeordnet) |

**Fazit:** Das 3-Ebenen-Modell ist **strukturell korrekt implementiert**, aber die **Sichtbarkeit** der Seiten-Ebene in der Übersicht fehlt, und die **Zuordnungskette** bricht häufig zwischen Immobilie und Projekt.

---

### Intention 4: Vorher-Dokumentation als Pflicht-Gate
> **Interview-Vorgabe:** "Der AT-Leiter drückt 'Arbeitstag beginnen' erst, wenn die Vorher-Doku komplett ist. Das ist ein PFLICHT-GATE."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| Teamleitercheck als Checkliste | ✅ Hervorragend | 19 Prüfpunkte in 6 Kategorien, Pflicht-Markierungen (V4-050, V4-051) |
| Zweistufiges System | ✅ Umgesetzt | Stufe 1: Projektbesprechung, Stufe 2: Freitag-Check |
| "Arbeitstag beginnen" als Gate-Button | ❌ Fehlt | Kein expliziter Gate-Button, der erst aktiv wird wenn alle Pflicht-Punkte erledigt sind (V4-053) |
| Baustellenmanager als AT-Leiter-Arbeitsplatz | ❌ 404-Fehler | Route /mobile nicht registriert (V4-048, V4-049) |
| Morgen/Abend-Workflow | ❌ Fehlt | Keine Unterscheidung zwischen Morgen-Routine und Abend-Abschluss |
| Vorher/Nachher-Fotodokumentation | ⚠️ Unklar | Teamleitercheck hat Foto-Punkte, aber kein Upload-Workflow |

**Fazit:** Der Teamleitercheck ist **das am besten implementierte Feature** – die Checkliste mit 19 Punkten und Pflicht-Markierungen ist exzellent. Aber der **Gate-Button fehlt**, der **Baustellenmanager ist nicht erreichbar** (404), und der **Morgen/Abend-Workflow** ist nicht implementiert. Das Gate-Prinzip ist konzeptionell vorhanden, aber nicht durchgesetzt.

---

### Intention 5: Kundenportal als Arbeitsplattform mit Ampel-System
> **Interview-Vorgabe:** "Der Kunde soll den Fortschritt sehen, ohne anrufen zu müssen. Ampel-System: Grün/Gelb/Rot."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| Kundenportal als eigene Sektion | ✅ Umgesetzt | Sidebar-Sektion mit 3 Unterpunkten |
| Projektfortschritt sichtbar | ❌ Nicht funktional | "Keine aktiven Projekte" trotz 3 existierender Projekte (V4-036) |
| Ampel-System (Grün/Gelb/Rot) | ❌ Fehlt | Kein Ampel-System implementiert (V4-037) |
| Vorher/Nachher-Fotos | ❌ Fehlt | Keine Foto-Ansicht |
| Dokumente herunterladen | ⚠️ Vorhanden | "Dokumente teilen" als Menüpunkt, aber nicht getestet |
| Feedback-Funktion | ✅ Vorhanden | Feedback-Tab existiert (V4-038) |

**Fazit:** Das Kundenportal ist **strukturell angelegt** (richtige Menüpunkte), aber **funktional nicht nutzbar**. Das Ampel-System – das Kern-Feature laut Interview – fehlt komplett. Die Seite zeigt entweder einen Spinner oder "keine aktiven Projekte".

---

### Intention 6: Navigation folgt dem 10-Phasen-Workflow
> **Interview-Vorgabe:** "Die Sidebar muss den Workflow widerspiegeln, nicht eine willkürliche Gruppierung."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| 10-Phasen-Zeitstrahl im ProjektDetail | ✅ Hervorragend | Alle 10 Phasen korrekt, aktive Phase grün markiert (V4-015, V4-042) |
| Gate-Logik zwischen Phasen | ✅ Umgesetzt | "Noch nicht möglich: Angebot erstellt" (V4-016, V4-043) |
| Sidebar-Sektionsnamen | ❌ Abweichung | "ERSTELLEN & ERFASSEN" statt Workflow-Name (V4-001) |
| Sidebar-Reihenfolge | ❌ Abweichung | Folgt funktionaler Gruppierung, nicht 10-Phasen-Workflow (V4-002) |
| Doppelte Menüpunkte | ❌ Vorhanden | "Baustellen" 2x (V4-030, V4-032) |
| Konsistente Benennung | ❌ Abweichung | 3 Namen für dieselbe Funktion: URL/Sidebar/Seitentitel (V4-067) |
| Dashboard-KPIs | ❌ Falsch | "Projekte: 0" trotz 3 Projekte, "+12%" ist Fake (V4-005) |
| Zu viele Menüpunkte | ⚠️ Problematisch | 9 Sektionen, 31 Menüpunkte für ein MVP (V4-071) |

**Fazit:** Der **10-Phasen-Zeitstrahl im ProjektDetail ist exzellent** – er bildet den Workflow 1:1 ab. Aber die **Sidebar-Navigation widerspricht dem Workflow-Prinzip**: Sie gruppiert nach Funktionen statt nach Phasen, hat doppelte Einträge und inkonsistente Benennungen. Die KPIs zeigen falsche Zahlen.

---

### Intention 7: Automatisierung und Preislogik
> **Interview-Vorgabe:** "Frühbucher-Rabatt dynamisch berechnen, Übernachtung automatisch aus Entfernung ableiten."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| Preisstaffelung nach Fläche | ✅ Umgesetzt | Im Angebots-Wizard vorhanden |
| Frühbucher-Rabatt dynamisch | ❌ Hardcoded | Statisch 10%, nicht dynamisch berechnet |
| Übernachtung aus Entfernung | ⚠️ Teilweise | Entfernung wird erfasst, aber Automatik unklar |
| Züge/Gruppen-System | ✅ Umgesetzt | Zug Alpha/Bravo/Charlie mit Mitgliedern (V4-066) |
| Einsatzkalender | ✅ Vorhanden | Tab im Einsatzplanung-Bereich |

**Fazit:** Die Grundstruktur der Preislogik ist vorhanden, aber die **dynamische Berechnung** (Frühbucher abhängig vom Buchungszeitpunkt, Übernachtung abhängig von der Entfernung) fehlt.

---

### Intention 8: 10-Phasen-Workflow als Rückgrat
> **Interview-Vorgabe:** "Jede Phase hat Voraussetzungen. Man kann nicht zur nächsten Phase wechseln, wenn die Voraussetzung nicht erfüllt ist."

| Aspekt | Status | Bewertung |
|--------|--------|-----------|
| 10 Phasen definiert | ✅ Umgesetzt | Alle 10 Phasen korrekt in shared/const.ts |
| Phasen-Zeitstrahl | ✅ Hervorragend | Visuell korrekt, aktive Phase markiert |
| Gate-Logik Phase 1→2 | ⚠️ Teilweise | "Angebot erstellen" als Gate, aber Objektaufnahme-Vollständigkeit nicht geprüft (V4-017, V4-047) |
| Kontextabhängiger "Nächster Schritt" | ❌ Fehlt | Zeigt immer "Angebot erstellen", auch wenn Objektaufnahme unvollständig (V4-006) |
| Phasen-basierte KPIs | ❌ Fehlt | KPIs zeigen eigene Kategorien statt Phasen-Verteilung (V4-012, V4-039) |

**Fazit:** Der 10-Phasen-Workflow ist **strukturell korrekt implementiert** und der Zeitstrahl ist exzellent. Aber die **Gate-Logik ist unvollständig** (Objektaufnahme-Vollständigkeit wird nicht geprüft) und die **KPIs spiegeln die Phasen nicht wider**.

---

## 2. Zusammenfassung: Was entspricht den Interviews, was weicht ab?

### Entspricht den Interviews (Stärken)

1. **10-Phasen-Zeitstrahl** – 1:1 aus den Interviews übernommen, visuell klar, Gate-Logik vorhanden
2. **Teamleitercheck** – 19 Prüfpunkte in 6 Kategorien, Pflicht-Markierungen, zweistufiges System
3. **Unternehmen→Kontakte Hierarchie** – Korrekt als Eltern-Kind-Beziehung implementiert
4. **3-Ebenen-Datenmodell** – Projekt→Immobilie→Seiten strukturell vorhanden
5. **ObjektaufnahmeWizard** – Technische Datenerfassung (Seiten, Flächen, Fassadentyp) funktioniert
6. **Züge/Gruppen-System** – Einsatzplanung mit Zug-Konzept korrekt umgesetzt
7. **Schnellaktionen im Dashboard** – Die 4 häufigsten Aktionen sind direkt zugänglich

### Weicht ab von den Interviews (Schwächen)

1. **Sidebar-Navigation** – Folgt funktionaler Gruppierung statt 10-Phasen-Workflow (9 Sektionen, 31 Menüpunkte, doppelte Einträge)
2. **Kaufmännische Wizard-Seite** – 8 Felder aus der PDF-Vorlage fehlen komplett
3. **Gate: Objektaufnahme vor Angebot** – Angebot kann ohne Immobilien erstellt werden
4. **"Arbeitstag beginnen" Gate-Button** – Teamleitercheck hat kein Gate, das den Arbeitsbeginn blockiert
5. **Ampel-System im Kundenportal** – Kern-Feature fehlt komplett
6. **Baustellenmanager** – 404-Fehler, zentraler AT-Leiter-Arbeitsplatz nicht erreichbar
7. **Immobilien-Zuordnung** – 75% der Immobilien sind verwaist (nicht dem Projekt zugeordnet)
8. **Dashboard-KPIs** – Zeigen falsche Zahlen (0 statt 3 Projekte, Fake-Trends)
9. **Fotodokumentation** – Upload-Felder vorhanden, aber 0 Fotos gespeichert
10. **Kontextabhängiger "Nächster Schritt"** – Zeigt immer "Angebot erstellen", auch wenn Objektaufnahme unvollständig

---

## 3. Priorisierte Handlungsempfehlungen

### Priorität 1: Workflow-Integrität (Kern-Intentionen 2, 4, 8)

Diese Punkte betreffen die **Grundlogik** des Systems. Ohne sie funktioniert der Workflow nicht wie in den Interviews definiert.

| # | Maßnahme | Intention | Aufwand |
|---|----------|-----------|---------|
| 1 | Gate implementieren: Objektaufnahme-Vollständigkeit prüfen vor Angebot | I2, I8 | 3h |
| 2 | "Arbeitstag beginnen" Gate-Button im Teamleitercheck | I4 | 2h |
| 3 | Kontextabhängiger "Nächster Schritt" basierend auf Datenvollständigkeit | I8 | 4h |
| 4 | Baustellenmanager-Route registrieren (/mobile → BaustellenManager.tsx) | I4 | 30min |
| 5 | Automatische Immobilien-Zuordnung beim Erstellen aus Projekt-Kontext | I1, I3 | 2h |

### Priorität 2: Fehlende Kern-Features (Intentionen 2, 5)

Diese Features wurden in den Interviews explizit besprochen und bestätigt.

| # | Maßnahme | Intention | Aufwand |
|---|----------|-----------|---------|
| 6 | Kaufmännische Wizard-Seite mit 8 Feldern | I2 | 5h |
| 7 | Ampel-System im Kundenportal (Grün/Gelb/Rot) | I5 | 4h |
| 8 | Dashboard-KPIs korrigieren (echte Zahlen, Phasen-Verteilung) | I6 | 3h |
| 9 | Fotodokumentation funktional machen (Upload + Speicherung) | I2 | 4h |

### Priorität 3: Navigation und Konsistenz (Intention 6)

Diese Punkte betreffen die Benutzerführung und das Gesamterlebnis.

| # | Maßnahme | Intention | Aufwand |
|---|----------|-----------|---------|
| 10 | Sidebar-Sektionen umbenennen und an 10-Phasen-Workflow anpassen | I6 | 4h |
| 11 | Doppelte Baustellen-Einträge zusammenführen | I6 | 2h |
| 12 | Konsistente Benennung (URL = Sidebar = Seitentitel) | I6 | 2h |
| 13 | PROJEKTVORBEREITUNG-Filter in die Projektübersicht integrieren | I6 | 3h |
| 14 | Duplikat-Erkennung bei Immobilien (gleiche Adresse) | I1 | 2h |
| 15 | Header-Datum dynamisieren (statisches "03. Feb 2026" ersetzen) | I6 | 30min |

**Geschätzter Gesamtaufwand:** ~40,5 Stunden

---

## 4. Fazit

Das FaFi PM hat eine **solide technische Grundstruktur**, die die Interview-Intentionen in vielen Bereichen korrekt abbildet. Der 10-Phasen-Zeitstrahl und der Teamleitercheck sind hervorragend implementiert. Die 3-Ebenen-Datenstruktur (Projekt→Immobilie→Seiten) ist korrekt angelegt.

Die **kritischen Lücken** liegen nicht in fehlenden Features, sondern in fehlenden **Gates und Automatismen**: Das System erlaubt Aktionen, die laut Interview-Vorgabe erst nach Erfüllung von Voraussetzungen möglich sein sollten. Das untergräbt die Kern-Intention des Workflows: Jede Phase hat Voraussetzungen, und das System muss diese durchsetzen.

Die **Sidebar-Navigation** ist das größte strukturelle Problem: Sie folgt einer funktionalen Gruppierung statt dem 10-Phasen-Workflow und hat mit 9 Sektionen und 31 Menüpunkten zu viele Einträge für ein MVP.

**Kernaussage:** Die Datenstruktur stimmt, der Workflow ist definiert, aber die **Durchsetzung der Workflow-Regeln** und die **Navigation** müssen überarbeitet werden, damit das System den in den Interviews definierten Absichten entspricht.
