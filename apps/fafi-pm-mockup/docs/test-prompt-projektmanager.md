# FassadenFix Projektmanager - Optimierter Test-Prompt v1.0

**Autor:** Manus AI  
**Version:** 1.0  
**Datum:** 04. Februar 2026  
**Anwendung:** FassadenFix Projektmanager

---

## ZIEL

Umfassender, nachvollziehbarer Test des **FassadenFix Projektmanagers** – einer Desktop-optimierten Webanwendung für die digitale Projektverwaltung, Angebotserstellung und Baustellenkoordination von Fassadenreinigungsprojekten.

Du prüfst JEDE Funktion, JEDES Feature, JEDEN Button, jede Interaktion gegen die definierten **FassadenFix Skills** als verbindliche Referenz (Source of Truth).

---

## 0) INPUTS / SPEZIFIKATION

### 0.1 FassadenFix Skills (Source of Truth)

Lies und aktiviere folgende Skills als verbindliche Referenz:

| Skill | Pfad | Prüfbereich |
|-------|------|-------------|
| fassadenfix-branding | `/home/ubuntu/skills/fassadenfix-branding/SKILL.md` | Farben, Typografie, UI-Komponenten |
| fassadenfix-identity | `/home/ubuntu/skills/fassadenfix-identity/SKILL.md` | Claim, Tonalität, Markensprache |
| fassadenfix-assets | `/home/ubuntu/skills/fassadenfix-assets/SKILL.md` | Logo-Dateien, Favicons, Icons |
| fassadenfix-copywriting | `/home/ubuntu/skills/fassadenfix-copywriting/SKILL.md` | CTA-Texte, Formulierungen |
| ff-angebotsmanager | `/home/ubuntu/skills/ff-angebotsmanager/SKILL.md` | Angebotserstellung, Workflow |
| ff-preisrechner | `/home/ubuntu/skills/ff-preisrechner/SKILL.md` | Preiskalkulation, Staffelung |
| ff-buehnenrechner | `/home/ubuntu/skills/ff-buehnenrechner/SKILL.md` | Bühnentage, Übernachtungen |
| ff-pm-angebotswizard | `/home/ubuntu/skills/ff-pm-angebotswizard/SKILL.md` | Wizard-Workflow, PDF-Export |

### 0.2 Projekt-Pfad

Projektverzeichnis: `/home/ubuntu/fafi-pm-mockup`

### 0.3 Zielgruppe

Die Anwendung richtet sich an **Projektleiter, Geschäftsführung und Backoffice** von FassadenFix:
- Männlich/Weiblich, 30-55 Jahre
- Büro- und Außendienst-Mitarbeiter
- Primäre Nutzung auf Desktop/Laptop im Büro
- Sprachstil: professionell, klar, effizient

---

## 1) TEST-STRATEGIE

### Ebene A: Feature-Inventur (Coverage-Sicherung)
### Ebene B: Funktionales Testing (Happy Paths + Edge Cases)
### Ebene C: Skill-Compliance (FassadenFix Corporate Design)
### Ebene D: Nicht-funktionale Tests (UX, Accessibility, Performance)

### Deliverables

1. **Feature/Button Inventar** (Seitenbaum + Komponentenliste)
2. **Testfall-Katalog** mit IDs (TC-001 …)
3. **Skill-Compliance-Matrix** (Skill → Anforderung → Umsetzung → Status)
4. **Bug Reports** im Standardformat
5. **Risiko- & Prioritätenliste** (Blocker/Critical/Major/Minor)
6. **Empfehlungen** (Quick Fixes + Architektur)

---

## 2) SETUP & SAFETY

- Verwende ausschließlich Testdaten (Projektnummer: FF-TEST-*)
- Keine destruktiven Aktionen ohne Dokumentation
- Jede Beobachtung muss reproduzierbar sein: Schritte + Screenshots
- Teste primär auf Desktop-Viewport (1920px) und Tablet (1024px)

---

## 3) INVENTUR: SEITENBAUM UND ELEMENTE

### 3.1 Erwartete Seiten (8 Navigationsbereiche)

#### Bereich 1: Erstellen & Erfassen
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Projekte | `/projekte` | Projektübersicht, Anlegen, Bearbeiten |
| Baustellen | `/baustellen` | Baustellenliste mit Phasen-Filter |
| Immobilien | `/immobilien` | Immobilienverwaltung mit Zuordnungen |

#### Bereich 2: Kundenberatung
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Unternehmen & Kontakte | `/unternehmen` | CRM-Funktionen, HubSpot-Integration |
| Angebote | `/angebote` | Angebotserstellung mit 7-Schritt-Wizard |
| Aufträge | `/auftraege` | Auftragsverwaltung |
| Garantien & Inspektionen | `/garantien` | Garantieverwaltung |

#### Bereich 3: Planung
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Terminfinder | `/terminfinder` | Terminplanung |
| Team einplanen | `/team-einplanen` | Ressourcenplanung |
| Ressourcenplaner | `/ressourcenplaner` | Geräte- und Materialplanung |

#### Bereich 4: Projektvorbereitung
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Übersicht | `/vorbereitung` | Dashboard Projektvorbereitung |
| Offene Projekte | `/offene-projekte` | Projekte in Vorbereitung |
| Überfällige Projekte | `/ueberfaellige-projekte` | Verzögerte Projekte |
| Offene Baustellen | `/offene-baustellen` | Baustellen in Vorbereitung |
| Überfällige Baustellen | `/ueberfaellige-baustellen` | Verzögerte Baustellen |

#### Bereich 5: Umsetzung
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Teamleitercheck | `/teamleitercheck` | Zweistufige Checkliste (Projektbesprechung + Freitag-Check) |
| Baustellenmanager | `/baustellenmanager` | Vor-Ort-Dokumentation |
| Auswertung & Abschluss | `/auswertung` | Projektabschluss |

#### Bereich 6: Finanzen
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Finanzübersicht | `/finanzen` | Dashboard mit Umsatz/Kosten-Diagrammen |
| Rechnungen | `/rechnungen` | Rechnungsverwaltung |
| Zahlungen | `/zahlungen` | Zahlungseingänge |
| Budgets | `/budgets` | Budgetplanung |

#### Bereich 7: Kundenportal
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Portal-Übersicht | `/kundenportal` | Kundenportal-Dashboard |
| Dokumente teilen | `/dokumente-teilen` | Dokumentenfreigabe |
| Kundenmeldungen | `/kundenmeldungen` | Kundenanfragen |

#### Bereich 8: System & Unternehmen
| Seite | Route | Kernfunktion |
|-------|-------|--------------|
| Mitarbeiter | `/mitarbeiter` | Mitarbeiterverwaltung |
| HubSpot | `/hubspot` | CRM-Integration |
| Spracheingabe | `/spracheingabe` | Voice-to-Text |
| Einstellungen | `/einstellungen` | Systemeinstellungen |

### 3.2 Für JEDE Seite dokumentieren

- Alle Buttons, Links, Tabs, Dropdowns
- Alle Formularfelder mit Validierungen
- Alle Status-Anzeigen und Badges
- Loading States und Empty States
- Auto-Save-Indikator und Entwurf-Status

---

## 4) FUNKTIONALES TESTING

### 4.1 Angebot-Wizard (Kernprozess)

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-001 | Projekt-Zuordnung Step | Unternehmen/Projekt auswählen, Auto-Projektnummer |
| TC-002 | Kundendaten Step | HubSpot-Integration, Datenübernahme |
| TC-003 | Immobilien Step | Flächen erfassen, Multi-Objekt-Support |
| TC-004 | Preiskalkulation Step | Automatische Berechnung nach Staffelung |
| TC-005 | Konditionen Step | Textbausteine, Vorlagen |
| TC-006 | Störer & Bedingungen Step | Multiselect für Garantien, Preisstaffel |
| TC-007 | Zusammenfassung Step | PDF-Vorschau im Corporate Design |

### 4.2 Objektaufnahme-Wizard

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-010 | Stammdaten erfassen | Unternehmen, Kontakt, Projekt zuordnen |
| TC-011 | Frontseite erfassen | Fassadenart, Aufmaß, Besonderheiten |
| TC-012 | Rückseite erfassen | Analog Frontseite |
| TC-013 | Linker Giebel erfassen | Analog Frontseite |
| TC-014 | Rechter Giebel erfassen | Analog Frontseite |
| TC-015 | Zusammenfassung | Gesamtfläche, Besonderheiten-Übersicht |

### 4.3 Teamleitercheck (Zweistufig)

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-020 | Stufe 1: Projektbesprechung | 19 Checkpunkte in 6 Kategorien |
| TC-021 | Stufe 2: Freitag-Check | 6 finale Prüfpunkte |
| TC-022 | Notizen pro Checkpunkt | Freitext-Eingabe möglich |
| TC-023 | Status-Toggle | Offen/Erledigt/Nicht relevant |

### 4.4 Finanz-Dashboard

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-030 | Umsatzentwicklung-Chart | ComposedChart mit Vorjahresvergleich |
| TC-031 | Kostenverteilung-Chart | Donut-Chart mit 6 Kategorien |
| TC-032 | Projektrentabilität-Chart | Balkendiagramm Umsatz vs. Kosten |
| TC-033 | Zahlungsstatus-Chart | Donut-Chart mit 4 Status |

### 4.5 Auto-Save und Offline-Modus

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-040 | Auto-Save bei Feldwechsel | Speichert nach 1.5s Debounce |
| TC-041 | Entwurf-Status anzeigen | Indikator sichtbar |
| TC-042 | Entwurf fortsetzen | Gespeicherte Daten werden geladen |
| TC-043 | Offline-Indikator | Verbindungsstatus im Header |
| TC-044 | Offline-Queue | Ausstehende Aktionen anzeigen |

### 4.6 Foto-Upload

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-050 | Galerie-Upload | Foto aus Mediathek hochgeladen |
| TC-051 | Kamera-Aufnahme | Foto wird aufgenommen |
| TC-052 | Automatische Benennung | Format: PROJEKT_SEITE_KATEGORIE_DATUM_NR.jpg |
| TC-053 | Kategorie-Auswahl | Dropdown mit 8 Kategorien |
| TC-054 | Preview-Grid | Thumbnails werden angezeigt |
| TC-055 | Lightbox | Vollbild-Ansicht mit Navigation |

### 4.7 Angebots-Versionierung

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-060 | Versionshistorie anzeigen | Timeline mit allen Versionen |
| TC-061 | Version vergleichen | Diff-Ansicht mit Preisänderungen |
| TC-062 | Version wiederherstellen | Ältere Version aktivieren |

### 4.8 PDF-Export

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-070 | Angebot-PDF | Corporate Design, offizielles Logo |
| TC-071 | Störer-Element | Dynamische Inhalte (Preisstaffel, Garantien) |
| TC-072 | Immobilien-PDF | Alle Daten und Fotos |

### 4.9 Edge Cases

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-080 | Pflichtfelder leer | Validierungsfehler angezeigt |
| TC-081 | Doppelklick auf Submit | Keine Duplikate |
| TC-082 | Browser-Refresh | Auto-Save Daten bleiben erhalten |
| TC-083 | Session-Timeout | Graceful Handling |

---

## 5) SKILL-COMPLIANCE-PRÜFUNG

### 5.1 fassadenfix-branding

| Anforderung | Soll-Wert | Prüfpunkt |
|-------------|-----------|-----------|
| Primärfarbe | #77bc1f (Pantone 368 C) | Buttons, Akzente, Status-Badges |
| Sekundärfarbe | #4e5758 (Pantone 445 C) | Text, Footer, sekundäre Elemente |
| Schriftart | Raleway | Alle Texte |
| Schriftgewichte | 400-700 | Headlines, Body, Labels |
| Border-Radius | 8px (Buttons), 12px (Cards) | UI-Komponenten |

### 5.2 fassadenfix-assets

| Asset | Soll-Datei | Verwendung |
|-------|------------|------------|
| Header-Logo | FassadenFix_Logo_bunt_transparent_300px.png | Header/Sidebar |
| PDF-Logo | FassadenFix_Logo_dokumente.png | PDF-Exporte |
| Favicon | FassadenFix_Logo_96x96.jpg | Browser-Tab |

### 5.3 fassadenfix-identity

| Anforderung | Prüfpunkt |
|-------------|-----------|
| Claim | "Ihr sicherer Weg zur sauberen Fassade" |
| Tonalität | Professionell, vertrauenswürdig, handlungsorientiert |
| Ansprache | Sie-Form, klar, direkt |

### 5.4 ff-preisrechner

| Anforderung | Prüfpunkt |
|-------------|-----------|
| Preisstaffel 500-999 m² | 10,50 €/m² |
| Preisstaffel 1.000-2.499 m² | 9,75 €/m² |
| Preisstaffel 2.500-4.999 m² | 9,25 €/m² |
| Preisstaffel ab 5.000 m² | 8,75 €/m² |
| Frühbucher-Rabatt | 3-6% je nach Vorlaufzeit |

### 5.5 ff-buehnenrechner

| Anforderung | Prüfpunkt |
|-------------|-----------|
| Leistung pro Tag | 500 m² |
| Übernachtung | Ab 100 km Entfernung |
| Kosten pro Bühnentag | 350 € |

---

## 6) NICHT-FUNKTIONALE TESTS

### 6.1 Desktop-Responsiveness

| Viewport | Prüfpunkte |
|----------|------------|
| Full HD (1920px) | Sidebar-Navigation, optimale Darstellung |
| Laptop (1366px) | Vollständige Funktionalität |
| Tablet (1024px) | Responsive Anpassung |

### 6.2 Offline-Fähigkeit

| Funktion | Prüfpunkt |
|----------|-----------|
| LocalStorage | Daten lokal gespeichert |
| Offline-Queue | Ausstehende Aktionen |
| Sync | Automatische Synchronisation |
| Offline-Indikator | Visuell sichtbar im Header |

### 6.3 Accessibility (WCAG 2.1 AA)

| Kriterium | Prüfpunkt |
|-----------|-----------|
| Farbkontrast | Mindestens 4.5:1 |
| Tastaturnavigation | Tab-Order logisch |
| Fokus-Indikatoren | Sichtbar |
| Touch-Targets | Mindestens 44x44px |

### 6.4 Performance

| Metrik | Zielwert |
|--------|----------|
| First Contentful Paint | < 2s |
| Time to Interactive | < 3s |
| Bundle Size | < 500KB gzipped |

---

## 7) BUG-REPORT FORMAT

```markdown
## BUG-###: [Titel]

**Schweregrad:** Blocker / Critical / Major / Minor / Trivial
**Komponente:** [Seite/Element]
**Viewport:** [Desktop/Tablet]

### Schritte zur Reproduktion
1. ...
2. ...
3. ...

### Erwartetes Ergebnis
...

### Tatsächliches Ergebnis
...

### Evidenz
[Screenshot/Log]

### Impact
[Auswirkung auf Nutzer/Prozess]

### Fix-Vorschlag
[Empfehlung]
```

---

## 8) OUTPUT-STRUKTUR

### A) Executive Summary (max 10 Bulletpoints)
- Gesamtbewertung
- Kritische Findings
- Empfehlungen

### B) Coverage-Statistik
- Seitenanzahl getestet
- Elemente geprüft
- Testfälle ausgeführt

### C) Skill-Compliance-Matrix
| Skill | Compliance-Rate | Status |
|-------|-----------------|--------|
| fassadenfix-branding | X% | ✅/⚠️/❌ |
| fassadenfix-identity | X% | ✅/⚠️/❌ |
| fassadenfix-assets | X% | ✅/⚠️/❌ |
| ff-preisrechner | X% | ✅/⚠️/❌ |
| ff-buehnenrechner | X% | ✅/⚠️/❌ |

### D) Bugliste nach Severity
- Blocker: X
- Critical: X
- Major: X
- Minor: X

### E) Top 10 Abweichungen von FassadenFix Skills

### F) Empfehlungen
- **Quick Wins** (1-2 Tage)
- **Mid-Term** (1-2 Wochen)
- **Structural** (größer)

---

## ARBEITSWEISE

1. **Erst Inventur** – Alle Seiten und Elemente erfassen
2. **Dann Skills laden** – Alle FassadenFix Skills als Referenz aktivieren
3. **Dann Testkatalog** – Testfälle definieren
4. **Dann Ausführung** – Systematisch testen
5. **Alles dokumentieren** – Screenshots, Steps, Expected vs Actual
6. **Nichts auslassen** – Jede Funktion prüfen
7. **Keine Vermutungen** – Nur beobachtete Fakten

---

## SPEZIFISCHE PRÜFPUNKTE FÜR PROJEKTMANAGER

### Angebot-Workflow
- [ ] Kann Projekt zuordnen (Unternehmen → Projekt)
- [ ] Kann Kundendaten aus HubSpot laden
- [ ] Kann Immobilien/Flächen erfassen
- [ ] Kann Preise automatisch berechnen lassen
- [ ] Kann Störer-Inhalte auswählen
- [ ] Kann PDF-Vorschau generieren

### Objektaufnahme-Workflow
- [ ] Kann Stammdaten erfassen
- [ ] Kann alle 4 Seiten dokumentieren
- [ ] Kann Fotos hochladen mit Auto-Benennung
- [ ] Kann Besonderheiten als Checkboxen auswählen
- [ ] Kann Zusammenfassung prüfen

### Teamleitercheck
- [ ] Kann Stufe 1 (Projektbesprechung) durchführen
- [ ] Kann Stufe 2 (Freitag-Check) durchführen
- [ ] Kann Notizen pro Checkpunkt erfassen
- [ ] Kann Status pro Checkpunkt setzen

### Auto-Save-Verhalten
- [ ] Speichert bei Feldwechsel (nach 1.5s Debounce)
- [ ] Zeigt Entwurf-Status an
- [ ] Lädt Entwurf beim erneuten Öffnen
- [ ] Offline-Indikator funktioniert

### PDF-Export
- [ ] Offizielles FassadenFix Logo verwendet
- [ ] CI-konforme Farben (#77bc1f, #4e5758)
- [ ] Störer-Element mit dynamischen Inhalten
- [ ] Korrekte Preisstaffel-Darstellung

---

*Dieser Test-Prompt wurde für den FassadenFix Projektmanager angepasst und berücksichtigt alle implementierten Features sowie die verbindlichen FassadenFix Skills.*
