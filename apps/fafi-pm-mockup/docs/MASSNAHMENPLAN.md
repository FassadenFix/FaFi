# FassadenFix Projektmanager - Maßnahmenplan

**Erstellt:** 04. Februar 2026  
**Basis:** Testbericht v.cd03ec02  
**Status:** Aktiv  

---

## Übersicht

Dieser Maßnahmenplan priorisiert alle offenen Punkte aus den Testberichten in vier Phasen:

| Phase | Zeitraum | Fokus | Aufwand |
|-------|----------|-------|---------|
| **Phase 1** | Sofort | Kritische Fixes vor Go-Live | 1-2 Tage |
| **Phase 2** | KW 7-8 | Wichtige Funktionen | 3-5 Tage |
| **Phase 3** | KW 9-12 | Erweiterungen | 5-10 Tage |
| **Phase 4** | Q2 2026 | Nice-to-have | Laufend |

---

## Phase 1: Kritisch (vor Go-Live)

> **Ziel:** Produktionsreife erreichen  
> **Zeitraum:** Sofort (1-2 Tage)

### 1.1 Corporate Design Compliance

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 1.1.1 | **Schriftart auf Roboto wechseln** | Google Font Roboto in index.html einbinden, CSS-Variablen anpassen | 30 min | ⬜ Offen |
| 1.1.2 | **Favicon prüfen** | FassadenFix Favicon aus Assets-Skill einbinden | 15 min | ⬜ Offen |

### 1.2 Accessibility

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 1.2.1 | **ARIA-Labels für Icon-Buttons** | Alle Icon-only Buttons mit aria-label versehen | 1 Std | ⬜ Offen |
| 1.2.2 | **Alt-Texte für Bilder** | Alle img-Tags mit beschreibenden alt-Attributen | 1 Std | ⬜ Offen |
| 1.2.3 | **Skip-to-Content Link** | Am Seitenanfang für Screenreader-Nutzer | 30 min | ⬜ Offen |

### 1.3 PDF-Export

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 1.3.1 | **jsPDF Integration** | Echten PDF-Download statt HTML-Vorschau | 2 Std | ⬜ Offen |
| 1.3.2 | **PDF-Dateiname** | Automatische Benennung: `Angebot-{Nummer}-{Kunde}.pdf` | 15 min | ⬜ Offen |

---

## Phase 2: Wichtig (kurzfristig)

> **Ziel:** Kernfunktionen vervollständigen  
> **Zeitraum:** KW 7-8 (3-5 Tage)

### 2.1 Mobile-Optimierung

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 2.1.1 | **Tabellen responsive** | Card-Layout für Mobile statt horizontalem Scroll | 3 Std | ⬜ Offen |
| 2.1.2 | **Wizard-Dialoge Touch** | Größere Buttons, Swipe-Gesten für Schritte | 2 Std | ⬜ Offen |
| 2.1.3 | **Bottom-Navigation** | Mobile-Navigation am unteren Bildschirmrand | 2 Std | ⬜ Offen |
| 2.1.4 | **iPad-Optimierung** | Tablet-spezifisches Layout (768-1024px) | 2 Std | ⬜ Offen |

### 2.2 Integrationen aktivieren

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 2.2.1 | **HubSpot API anbinden** | Mock-Daten durch echte HubSpot MCP-Calls ersetzen | 4 Std | ⬜ Offen |
| 2.2.2 | **Excel-Export** | Finanzdaten und Listen als XLSX exportieren | 2 Std | ⬜ Offen |
| 2.2.3 | **Outlook-Kalender** | Termine mit Outlook synchronisieren | 3 Std | ⬜ Offen |

### 2.3 Fehlende Dialoge

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 2.3.1 | **Baustellen Detail-Dialog** | Vollständige Detailansicht mit allen Infos | 2 Std | ⬜ Offen |
| 2.3.2 | **Foto-Galerie Dialog** | Lightbox mit Zoom, Navigation, Download | 1 Std | ⬜ Offen |
| 2.3.3 | **Projekt Detail-Dialog** | Projektübersicht mit verknüpften Elementen | 2 Std | ⬜ Offen |

---

## Phase 3: Erweiterungen (mittelfristig)

> **Ziel:** Funktionsumfang erweitern  
> **Zeitraum:** KW 9-12 (5-10 Tage)

### 3.1 Backend-Integration

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 3.1.1 | **Upgrade auf web-db-user** | Backend, Datenbank, Auth aktivieren | 1 Std | ⬜ Offen |
| 3.1.2 | **Datenbank-Schema** | Tabellen für Projekte, Baustellen, Immobilien | 3 Std | ⬜ Offen |
| 3.1.3 | **API-Endpunkte** | CRUD für alle Entitäten | 4 Std | ⬜ Offen |
| 3.1.4 | **Offline-Sync aktivieren** | LocalStorage mit Backend synchronisieren | 3 Std | ⬜ Offen |

### 3.2 Automatisierungen

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 3.2.1 | **Wetterdaten automatisch** | OpenWeather API für Baustellenort | 2 Std | ⬜ Offen |
| 3.2.2 | **Push-Benachrichtigungen** | Bei neuen Aufgaben, Statusänderungen | 3 Std | ⬜ Offen |
| 3.2.3 | **E-Mail-Versand** | Angebote direkt per E-Mail senden | 2 Std | ⬜ Offen |

### 3.3 Erweiterte Features

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 3.3.1 | **Logbuch pro Baustelle** | Aktivitäten-Historie (was, wann, wer) | 3 Std | ⬜ Offen |
| 3.3.2 | **Foto-Annotation** | Schäden auf Fotos markieren | 2 Std | ✅ Komponente vorhanden |
| 3.3.3 | **Gebäude-Satellitenansicht** | Google Maps Integration | 2 Std | ✅ Komponente vorhanden |
| 3.3.4 | **Bühnentage pro Seite** | Detaillierte Kostenaufschlüsselung | 1 Std | ✅ Komponente vorhanden |

---

## Phase 4: Nice-to-have (langfristig)

> **Ziel:** Optimierungen und Extras  
> **Zeitraum:** Q2 2026 (laufend)

### 4.1 UX-Verbesserungen

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 4.1.1 | **Drag & Drop Planung** | Baustellen im Kalender verschieben | 4 Std | ⬜ Offen |
| 4.1.2 | **Dashboards personalisieren** | Widgets anordnen und filtern | 4 Std | ⬜ Offen |
| 4.1.3 | **Tastenkürzel erweitern** | Mehr Keyboard-Shortcuts | 2 Std | ⬜ Offen |

### 4.2 Reporting

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 4.2.1 | **Automatische Reports** | Wöchentliche Zusammenfassung per E-Mail | 3 Std | ⬜ Offen |
| 4.2.2 | **Vergleichsanalysen** | Monat vs. Vormonat, Jahr vs. Vorjahr | 3 Std | ⬜ Offen |
| 4.2.3 | **Export-Formate** | PDF, Excel, CSV für alle Listen | 2 Std | ⬜ Offen |

### 4.3 Kundenportal

| # | Aufgabe | Beschreibung | Aufwand | Status |
|---|---------|--------------|---------|--------|
| 4.3.1 | **Kunden-Login** | Separater Bereich für Kunden | 4 Std | ⬜ Offen |
| 4.3.2 | **Dokumenten-Sharing** | Angebote, Rechnungen teilen | 2 Std | ⬜ Offen |
| 4.3.3 | **Status-Tracking** | Kunden sehen Projektfortschritt | 3 Std | ⬜ Offen |

---

## Zusammenfassung

| Phase | Aufgaben | Geschätzt | Priorität |
|-------|----------|-----------|-----------|
| Phase 1 | 7 Aufgaben | 6 Stunden | 🔴 Kritisch |
| Phase 2 | 10 Aufgaben | 23 Stunden | 🟠 Wichtig |
| Phase 3 | 10 Aufgaben | 25 Stunden | 🟡 Mittel |
| Phase 4 | 9 Aufgaben | 27 Stunden | 🟢 Niedrig |
| **Gesamt** | **36 Aufgaben** | **~81 Stunden** | - |

---

## Nächste Schritte

1. **Phase 1 starten** – Schriftart, ARIA-Labels, PDF-Download
2. **Pilotbetrieb planen** – 2-3 Teamleiter als Testnutzer
3. **Feedback sammeln** – Nach 1 Woche Pilotbetrieb evaluieren

---

*Erstellt am 04.02.2026 | FassadenFix Projektmanager*

