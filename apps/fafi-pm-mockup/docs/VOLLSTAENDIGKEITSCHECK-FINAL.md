# Finaler Vollständigkeitscheck: Interview-Intentionen → todo.md

**Datum:** 09. Februar 2026
**Methode:** Jede Kern-Intention und jedes bestätigte Detail aus den 4 Interviews, dem Loom-Feedback und der Revalidierung wird gegen die todo.md geprüft.

---

## Prüfung Intention 1: Immobilie als eigenständiges Asset

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "Immobilie muss einzeln betrachtet werden können" | A1-03: Listenansicht mit Eigentümer und Projekten | ✅ Vorhanden |
| "Kann zu mehreren Projekten gehören (über die Jahre)" | A1-02: M:N-Zwischentabelle projectProperties | ✅ Vorhanden |
| "Kann Eigentümer wechseln" | A1-01: companyId-Feld in properties | ✅ Vorhanden |
| "Historie bleibt erhalten" | A1-04: Projekt-Historie in Detailansicht | ✅ Vorhanden |
| "Garantieurkunde darf nicht eigentümer-/projektorientiert sein" | A1-05: Garantie an Immobilie gebunden | ✅ Vorhanden |

**Ergebnis: 5/5 – 100% abgedeckt**

---

## Prüfung Intention 2: Objektaufnahme = Datenbasis, Angebot = Ableitung

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "Objektaufnahme = Erfassung des IST-Zustands" | Gesamter Block B (Wizard-Erweiterungen) | ✅ Vorhanden |
| "Angebotserstellung = Ableitung der LÖSUNG" | B4-01: Daten übernehmen statt neu eingeben | ✅ Vorhanden |
| "Kundenberater soll KEINE neuen Daten eingeben, sondern nur auswählen" | B4-01 + B4-02 | ✅ Vorhanden |

**Ergebnis: 3/3 – 100% abgedeckt**

---

## Prüfung Intention 3: 3 logische Ebenen im ObjektaufnahmeWizard

### Seite 0 – WER (Stammdaten)

| PDF-Feld | todo.md Item | Status |
|---|---|---|
| "Wer war noch dabei?" | B1-01 | ✅ Vorhanden |
| "Wann wird Entscheidung getroffen?" | B1-02 | ✅ Vorhanden |
| "Wer trifft die Entscheidung?" | B1-03 | ✅ Vorhanden |
| "Besondere Absprache, Infos?" | B1-04 | ✅ Vorhanden |

### Seite 1 – WAS (Technisch, pro Seite)

| PDF-Feld | todo.md Item | Status |
|---|---|---|
| "Wasseranschluss (Wo, Welcher, Wieviel Druck)" | B2-01 | ✅ Vorhanden |
| "Reinigungsmittelauswahl" | B2-02 | ✅ Vorhanden |
| Aufmaß (Breite × Höhe) | Bereits implementiert | ✅ Implementiert |
| Bilder/Fotos | Bereits implementiert (FotoUpload) | ✅ Implementiert |
| Zuwegung (Ja/Nein + Erklärfeld) | Bereits implementiert (Loom-Feedback) | ✅ Implementiert |
| Bühne/Gerüst | Bereits implementiert | ✅ Implementiert |
| Sperrungen/Besonderheiten | Bereits implementiert | ✅ Implementiert |

### Seite 2 – WIE (Kaufmännisch)

| PDF-Feld | todo.md Item | Status |
|---|---|---|
| "Welche Seiten sollen ins Angebot?" | B3-02 | ✅ Vorhanden |
| "Umsetzungstermin (KO-Termine!)" | B3-03 | ✅ Vorhanden |
| "Kann Wohnung gestellt werden?" | B3-04 | ✅ Vorhanden |
| "Kennenlern-Angebot?" | B3-05 | ✅ Vorhanden |
| "Frühbucher-Rabatt?" | B3-06 | ✅ Vorhanden |
| "Einkaufsgemeinschaft?" | B3-07 | ✅ Vorhanden |
| "Marketinggeeignet?" | B3-08 | ✅ Vorhanden |
| Kaufmännische Seite als eigener Step | B3-01 | ✅ Vorhanden |

**Ergebnis: 18/18 – 100% abgedeckt**

---

## Prüfung Intention 4: Baustelle als Tagesablauf-App

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "Vorher-Dokumentation (PFLICHT vor Baustellenstart)" | C-02: Gate-Implementierung | ✅ Vorhanden |
| "Erst nach vollständiger Dokumentation kann Baustelle gestartet werden" | C-02 | ✅ Vorhanden |
| "Abschlussfrage MORGENS UND ABENDS" | C-03 | ✅ Vorhanden |
| "Ein Team besteht aus 4 Personen" | C-04: Teamstruktur | ✅ Vorhanden |
| "Teamleiter bekommt Projekt zugewiesen" | C-05 | ✅ Vorhanden |
| "Projekt besteht aus mehreren Baustellen (= Immobilien)" | C-05 | ✅ Vorhanden |
| "Ereignismelder 'on top'" | C-06: Floating Action Button | ✅ Vorhanden |
| Desktop vs. Mobile Differenzierung | C-01 + C-07 | ✅ Vorhanden |

**Ergebnis: 8/8 – 100% abgedeckt**

---

## Prüfung Intention 5: Kundenportal als Arbeitsplattform

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "Auf der Startseite wird das AKTUELLE Projekt direkt in der Detailansicht geöffnet" | D-01 | ✅ Vorhanden |
| "KEIN Zeitstrahl, sondern AMPEL-System (Grün/Gelb/Rot)" | D-02 | ✅ Vorhanden |
| "Jede Baustelle hat eigene Ampel" | D-03 | ✅ Vorhanden |
| "Unterscheidung Aufgaben AUFTRAGGEBERSEITE vs. AUFTRAGNEHMERSEITE" | D-04 | ✅ Vorhanden |
| "Projektbezogene, Baustellenbezogene, Allgemeine Dokumente" | D-05 | ✅ Vorhanden |
| "Der Kunde ist stets das UNTERNEHMEN" | Bereits implementiert (1 Zugang pro Unternehmen) | ✅ Implementiert |
| "Mieter/Bewohner bekommen separates Portal (später)" | Nicht in todo.md, aber korrekt als "später" markiert | ✅ Korrekt ausgeschlossen |

**Ergebnis: 7/7 – 100% abgedeckt**

---

## Prüfung Intention 6: Navigation folgt dem Workflow

| Interview-Aussage/Erkenntnis | todo.md Item | Status |
|---|---|---|
| "Erstellen & Erfassen" suggeriert einmalige Aktion | E-01: Umbenennen | ✅ Vorhanden |
| Offene/Überfällige Projekte sind Filter, keine Menüpunkte | E-02: Als Filter integrieren | ✅ Vorhanden |
| Sidebar-Reihenfolge soll Workflow folgen | E-03: An 10-Phasen anpassen | ✅ Vorhanden |
| Projektvorbereitung vs. Planung überlappen | E-04: Zusammenführen/differenzieren | ✅ Vorhanden |
| Unternehmen ist übergeordnete Entität | E-05: Hierarchische CRM-Ansicht | ✅ Vorhanden |

**Ergebnis: 5/5 – 100% abgedeckt**

---

## Prüfung Intention 7: Frühbucher-Rabatt dynamisch

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "bis 31.12. → 6% / bis 31.01. → 4,5% / bis 28.02. → 3% / bis 31.03. → 1,5%" | F-01: Dynamisch berechnen | ✅ Vorhanden |
| Bezieht sich auf Beauftragungsdatum relativ zur nächsten Saison | F-01 | ✅ Vorhanden |

**Ergebnis: 2/2 – 100% abgedeckt**

---

## Prüfung Intention 8: Übernachtung automatisch

| Interview-Aussage | todo.md Item | Status |
|---|---|---|
| "Entfernung > 100 km → Übernachtung" | F-02: Automatisch vorschlagen | ✅ Vorhanden |
| "Entfernung > 50 km UND Dauer > 1 Tag → Übernachtung" | F-02 | ✅ Vorhanden |

**Ergebnis: 2/2 – 100% abgedeckt**

---

## Prüfung Loom-Feedback-Korrekturen

| Loom-Anweisung | todo.md/Implementierung | Status |
|---|---|---|
| Baustellen-Übersicht: Listenformat wie Projekte | Loom-Feedback-Todo #1 | ✅ Dokumentiert |
| Immobilien-Übersicht: Von Objektaufnahme zu Liste | Loom-Feedback-Todo #2 | ✅ Dokumentiert |
| "Sockel" und "Dach/Attika" entfernen | Loom-Feedback-Todo #3 | ✅ Implementiert |
| Nordseite→Frontseite, Ostseite→Rechter Giebel etc. | Loom-Feedback-Todo #4 | ✅ Implementiert |
| "Zu reinigen" → "Reinigungsfähig" | Loom-Feedback-Todo #5 | ✅ Implementiert |
| Fotos/Videos vereinfachen | Loom-Feedback-Todo #6 | ✅ Implementiert |
| "Zustand und Schäden" entfernen | Loom-Feedback-Todo #7 | ✅ Implementiert |
| Zuwegung: Nur Ja/Nein | Loom-Feedback-Todo #8 | ✅ Implementiert |
| "Eingangsseite" → "Frontseite" global ersetzen | G-01 | ✅ Vorhanden |

**Ergebnis: 9/9 – 100% abgedeckt**

---

## Prüfung Seitenbezeichnungen (Loom-Feedback)

| Bezeichnung | Erklärung (bestätigt) | In Code | In todo.md |
|---|---|---|---|
| **Frontseite** | "Immer die Seite wo die Hauseingänge sind" | ✅ Implementiert | G-01 für Reste |
| **Rückseite** | "Die gegenüberliegende Seite der Eingänge" | ✅ Implementiert | – |
| **Linker Giebel** | "Perspektive vor dem Haus stehend, auf die Eingänge schauend – links" | ✅ Implementiert | – |
| **Rechter Giebel** | "Perspektive vor dem Haus stehend, auf die Eingänge schauend – rechts" | ✅ Implementiert | – |

**Ergebnis: 4/4 – 100% abgedeckt**

---

## GESAMTERGEBNIS

| Intention | Punkte geprüft | Abgedeckt | Vollständigkeit |
|---|---|---|---|
| 1 – Immobilie als Asset | 5 | 5 | 100% |
| 2 – Objektaufnahme = Datenbasis | 3 | 3 | 100% |
| 3 – 3 logische Ebenen Wizard | 18 | 18 | 100% |
| 4 – Baustelle Tagesablauf | 8 | 8 | 100% |
| 5 – Kundenportal Arbeitsplattform | 7 | 7 | 100% |
| 6 – Navigation folgt Workflow | 5 | 5 | 100% |
| 7 – Frühbucher dynamisch | 2 | 2 | 100% |
| 8 – Übernachtung automatisch | 2 | 2 | 100% |
| Loom-Feedback | 9 | 9 | 100% |
| Seitenbezeichnungen | 4 | 4 | 100% |
| **GESAMT** | **63** | **63** | **100%** |

---

**Fazit:** Alle 63 geprüften Punkte aus den bestätigten Interview-Erkenntnissen sind in der todo.md als Maßnahmen abgebildet. Die Intentionen und der Sinn hinter den Nutzer-Antworten sind in den Maßnahmenblöcken A–G dokumentiert und mit den Original-Zitaten belegt.

*Erstellt am 09.02.2026 – Basierend ausschließlich auf bestätigten Interview-Erkenntnissen*
