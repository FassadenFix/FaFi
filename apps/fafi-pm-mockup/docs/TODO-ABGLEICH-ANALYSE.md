# Todo-Abgleich: Alle Quellen vs. aktuelle todo.md

**Datum:** 09. Februar 2026
**Methode:** Systematischer Abgleich aller Projektdokumente gegen die aktuelle todo.md (199 Items: 187 erledigt, 12 offen)

---

## 1. DUPLIKATE IN DER AKTUELLEN TODO.MD

### D1: E2E-Tests (doppelt vorhanden)
- **Zeile 373:** `[ ] E2E-Tests für kritische User-Journeys (6h)` (unter v7.4)
- **Zeilen 505-508:** `[ ] E2E-Test: Projekt → Angebot → Auftrag → Abnahme (6h)`, `[ ] E2E-Test: Baustellen-Tagesablauf (4h)`, `[ ] E2E-Test: Kundenportal-Navigation (3h)`, `[ ] Test-Utilities und Fixtures erstellen (2h)` (unter INFRASTRUKTUR)
- **Empfehlung:** Zeile 373 entfernen (ist die ältere, weniger detaillierte Version). Die 4 Items unter INFRASTRUKTUR behalten.

---

## 2. FEHLENDE ITEMS (in Quellen vorhanden, aber NICHT in todo.md)

### Aus Loom-Feedback (loom-feedback-todo.md)
- **L1:** `[ ] Baustellen-Übersicht: Listenformat wie Projekte (Auflistung → Details erst bei Klick)` – FEHLT in todo.md
- **L2:** `[ ] Baustellen-Übersicht: Filterung nach Phase/Status hinzufügen` – FEHLT in todo.md
- **L3:** `[ ] Immobilien-Übersicht: Von Objektaufnahme-Format zu Listenformat ändern` – FEHLT in todo.md
- **L4:** `[ ] Immobilien-Übersicht: Zuordnungsinformationen anzeigen (Baustelle, Projekt, Unternehmen, Mitarbeiter)` – FEHLT in todo.md

### Aus Workflow-Analyse (WORKFLOW-ANALYSE-UND-VERBESSERUNGEN.md)
- **W1:** `[ ] Angebot → Auftrag: Automatischer Workflow bei Auftragsannahme (Status, HubSpot, Auftragsbestätigung)` – TEILWEISE in Phase 0 enthalten, aber der Punkt "Auftragsbestätigung automatisch erstellen" fehlt
- **W2:** `[ ] Auftrag → Baustelle: Daten aus Objektaufnahme automatisch in Baustelle übernehmen` – FEHLT als explizites Item
- **W3:** `[ ] Abnahme → Rechnung: Automatischer Rechnungsentwurf nach Abnahme` – TEILWEISE (Abnahme-Wizard erstellt Rechnung, aber kein automatischer Entwurf)
- **W4:** `[ ] Rechnung → Garantie: Garantie automatisch nach Zahlungseingang aktivieren` – FEHLT als explizites Item
- **W5:** `[ ] Aufgaben-Generierung: Phasenwechsel erzeugt automatische rollenspezifische Tasks` – FEHLT
- **W6:** `[ ] Dokumenten-Kette: Angebot → Auftragsbestätigung → Rechnung automatisch verknüpfen` – FEHLT
- **W7:** `[ ] Kontextabhängige Sidebar-Hervorhebung der nächsten Aktion` – FEHLT
- **W8:** `[ ] Projekt-Detail: Prominente CTA für aktuelle Phase` – TEILWEISE (WorkflowActionBar existiert)

### Aus Maßnahmenplan (OFFENE_AUFGABEN_MASSNAHMENPLAN.md)
- **M1:** `[ ] Wizard-Vereinfachung: Weniger Felder pro Schritt (max 5-6)` – FEHLT
- **M2:** `[ ] Wizard-Vereinfachung: Pflichtfelder klar markieren (roter Stern)` – FEHLT
- **M3:** `[ ] Wizard-Vereinfachung: Fortschritt deutlich anzeigen (Prozentanzeige)` – FEHLT
- **M4:** `[ ] Wizard-Vereinfachung: "Fertig"-Button groß und grün (min 56px)` – FEHLT
- **M5:** `[ ] Angebotsabschluss: Markenidentität und Marketing-Skills nutzen` – FEHLT
- **M6:** `[ ] Angebotsabschluss: Attraktive und ästhetische Darstellung` – FEHLT
- **M7:** `[ ] Angebotsabschluss: Dynamische Textbausteine für Angebotsbedingungen` – FEHLT (Textbausteine existieren, aber dynamische Auswahl?)

### Aus Interview-Revalidierung (INTERVIEW-REVALIDIERUNG-BERICHT.md)
- **I1:** `[ ] A2: Immobilie M:N zu Projekten (Zwischentabelle) statt 1:N` – FEHLT (nur als Architektur-Hinweis erwähnt)
- **I2:** `[ ] A3: Immobilie eigenes companyId-Feld (Eigentümer wechseln)` – FEHLT

### Aus Opus-Validierung (opus-validierung.md)
- **O1:** `[ ] CI/CD-Pipeline Setup (.github/workflows/ci.yml)` – FEHLT
- **O2:** `[ ] Datenmigration: Konzept für Bestandsdaten-Import` – FEHLT
- **O3:** `[ ] PWA-Setup: Service Worker, Manifest, Icons` – TEILWEISE (Service Worker als erledigt markiert in 6c, aber kein vollständiges PWA-Manifest)

### Aus Kundenportal-Interview (interview-notes-kundenportal.md)
- **K1:** `[ ] Mieter/Bewohner-Portal (separates Portal, später)` – FEHLT als Zukunfts-Item
- **K2:** `[ ] Dokumenten-Karte im Portal: Auflistung mit Anzahl, Durchklick zu Einzeldokumenten` – FEHLT als explizites UI-Item

### Aus Baustellen-Interview (interview-notes-baustellenmanager.md)
- **B1:** `[ ] Teamleiter-Chat (optional, in App integrierbar)` – FEHLT als Zukunfts-Item
- **B2:** `[ ] Planungsfrage MORGENS UND ABENDS stellen` – Morgens implementiert, ABENDS unklar ob auch implementiert
- **B3:** `[ ] Foto-Komprimierung: Frage noch offen (Interview-Notiz)` – FEHLT als offene Entscheidung

---

## 3. FALSCH MARKIERTE ITEMS (als erledigt markiert, aber Implementierung fraglich)

### F1: Offline-Fähigkeit (Zeile 470)
- `[x] Offline-Fähigkeit: Service Worker für Foto-Upload bei schlechter Verbindung (6h)`
- **Prüfung:** Service Worker ist als Platzhalter implementiert, aber echte Offline-Queue für Foto-Upload ist fraglich. Keine IndexedDB-basierte Queue gefunden.
- **Empfehlung:** Als [~] (teilweise) markieren oder in "Nice-to-have" verschieben

### F2: GPS-Koordinaten (Zeile 471)
- `[x] GPS-Koordinaten automatisch bei Foto-Upload erfassen (1h)`
- **Prüfung:** GPS-Logik existiert im Code, aber tatsächliche Geolocation API Integration unklar
- **Empfehlung:** Verifizieren

### F3: Foto-Wasserzeichen (Zeile 474)
- `[x] Foto-Wasserzeichen: Datum, Uhrzeit, GPS, Baustellenname (2h)`
- **Prüfung:** Canvas-basiertes Wasserzeichen existiert, aber Qualität und Vollständigkeit unklar
- **Empfehlung:** Verifizieren

### F4: Archiv-Text (Zeile 543)
- `Interview-Korrekturen (v6.0-v6.1): "Frontseite" → "Eingangsseite" umbenannt`
- **Problem:** Inkonsistent! Es sollte heißen "Eingangsseite" → "Frontseite" (die Korrektur ging in die andere Richtung)
- **Empfehlung:** Text korrigieren

---

## 4. ZUSAMMENFASSUNG

| Kategorie | Anzahl |
|---|---|
| Duplikate in aktueller todo.md | 1 (E2E-Tests doppelt) |
| Fehlende Items aus Loom-Feedback | 4 |
| Fehlende Items aus Workflow-Analyse | 8 |
| Fehlende Items aus Maßnahmenplan | 7 |
| Fehlende Items aus Interview-Revalidierung | 2 |
| Fehlende Items aus Opus-Validierung | 3 |
| Fehlende Items aus Kundenportal-Interview | 2 |
| Fehlende Items aus Baustellen-Interview | 3 |
| Falsch markierte Items | 4 |
| **Gesamt fehlende/problematische Items** | **~33** |

### Effektive Gesamtzahl nach Bereinigung
- Aktuelle Items: 199
- Minus Duplikate: -1
- Plus fehlende Items: +29 (einige überlappen sich)
- **Bereinigte Gesamtzahl: ~227 Items**
