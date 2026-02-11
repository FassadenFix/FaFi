# FaFi PM Mockup - Offene Aufgaben & Maßnahmenplan

**Stand:** 05. Februar 2026  
**Gesamtstatus:** 95% abgeschlossen

---

## Zusammenfassung

| Kategorie | Erledigt | Offen | Status |
|-----------|----------|-------|--------|
| CI-Konformität | 5/5 | 0 | ✅ 100% |
| MVP-Kernmodule | 5/5 | 0 | ✅ 100% |
| UI-Verbesserungen | 4/4 | 0 | ✅ 100% |
| Backend/Datenbank | 35/35 | 0 | ✅ 100% |
| Wizard-Vereinfachung | 0/4 | 4 | ⚠️ 0% |
| Angebotsabschluss | 2/6 | 4 | ⚠️ 33% |
| Loom Feedback 2 | 4/13 | 9 | ⚠️ 31% |
| Finale Prüfung | 2/3 | 1 | ⚠️ 67% |

---

## OFFENE AUFGABEN (nach Priorität)

### 🔴 KRITISCH - Sofort umsetzen

#### 1. Wizard-Vereinfachung (v3.3)
**Zeilen 299-302 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Weniger Felder pro Schritt | [ ] | 2h |
| Pflichtfelder klar markieren | [ ] | 1h |
| Fortschritt deutlich anzeigen | [ ] | 1h |
| "Fertig"-Button groß und grün | [ ] | 0.5h |

**Maßnahme:** Alle Wizard-Komponenten (Projekt, Immobilie, Baustelle, Angebot) überarbeiten:
- Felder auf max. 5-6 pro Schritt reduzieren
- Pflichtfelder mit rotem Stern (*) und "Pflichtfeld" Label
- Fortschrittsbalken mit Prozentanzeige
- Großer grüner "Fertig"-Button (min. 56px Höhe)

---

#### 2. Angebotsabschluss - Optische Überarbeitung (Loom Feedback 3)
**Zeilen 604-607 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Markenidentität und Marketing-Skills nutzen | [ ] | 2h |
| Attraktive und ästhetische Darstellung | [ ] | 3h |
| "Störer"-Element unterhalb der Gesamtsumme | [ ] | 2h |
| Dynamische Textbausteine für Angebotsbedingungen | [ ] | 2h |

**Maßnahme:** PDF-Generator mit FassadenFix Skills erweitern:
- fassadenfix-branding für CI-konforme Farben
- fassadenfix-assets für Logo und Icons
- fassadenfix-identity für Tonalität
- Störer-Element als wiederverwendbare Komponente

---

### 🟡 WICHTIG - Diese Woche umsetzen

#### 3. Loom Feedback 2 - Wizard-Schritte zusammenführen
**Zeilen 503-506 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| "Kalkulation" und "Konditionen" zu einem Schritt zusammenführen | [ ] | 2h |
| Doppelte Informationen vermeiden | [ ] | 1h |

**Maßnahme:** KalkulationKonditionenStep.tsx bereits implementiert - prüfen ob vollständig integriert.

---

#### 4. Loom Feedback 2 - Positionen pro Immobilie im PDF
**Zeilen 507-509 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Jede Immobilie einzeln aufschlüsseln (m², Bühne, BE, Übernachtung) | [ ] | 2h |
| Bereits im Positionen-Schritt implementiert → in PDF übernehmen | [ ] | 1h |

**Maßnahme:** AngebotPDFGenerator.tsx erweitern - X.1-X.5 Schema bereits implementiert, prüfen ob vollständig.

---

#### 5. Loom Feedback 2 - Preisstaffelung
**Zeilen 511-513 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Preisstaffel basierend auf Gesamtfläche aller Immobilien | [ ] | 1h |
| Nicht pro Immobilie, sondern Gesamtprojekt | [ ] | 0.5h |

**Maßnahme:** KalkulationKonditionenStep.tsx prüfen - Preisstaffelung sollte bereits auf Gesamtfläche basieren.

---

#### 6. Loom Feedback 2 - Rabatte und Aktionen erweitern
**Zeilen 515-522 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Dropdown für Rabattaktionen | [ ] | 1h |
| Rabatt auf Gesamtprojekt anwenden | [ ] | 0.5h |
| Verweis auf PDF "Preise und Rabatte" | [ ] | 0.5h |

**Hinweis:** Rabatte wurden bereits nach offiziellen FassadenFix-Dokumenten korrigiert (Zeilen 558-582). Diese Aufgaben könnten bereits erledigt sein - Prüfung erforderlich.

---

#### 7. Loom Feedback 2 - Grundbedingungen anpassen
**Zeilen 524-527 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Zahlungsziel: Standard 7 Tage | [ ] | 0.5h |
| Angebotsgültigkeit: 4 Wochen | [ ] | 0.5h |
| Ansprechpartner früher im Wizard erfassen | [ ] | 1h |

**Hinweis:** Zahlungsziel und Gültigkeit wurden bereits implementiert (Zeilen 542-546). Prüfen ob vollständig.

---

#### 8. Loom Feedback 2 - Individuelle Angebotsbedingungen
**Zeilen 529-532 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Umbenennung: "Zusätzliche Bedingungen" → "Individuelle Angebotsbedingungen" | [ ] | 0.5h |
| Aufgaben aus Objektaufnahme automatisch einfügen | [ ] | 1h |
| Verantwortung Auftraggeber kennzeichnen | [ ] | 0.5h |

**Hinweis:** Individuelle Bedingungen wurden bereits implementiert (Zeilen 658-663). Prüfen ob Umbenennung erfolgt ist.

---

### 🟢 NIEDRIG - Bei Gelegenheit

#### 9. Finale Prüfung - Checkpoint erstellen
**Zeile 37 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Checkpoint erstellen | [ ] | 0.5h |

**Maßnahme:** Nach Abschluss aller kritischen Aufgaben einen finalen Checkpoint erstellen.

---

#### 10. Angebotspositionen-Auswahl (Loom Feedback)
**Zeilen 462-465 in todo.md**

| Aufgabe | Status | Aufwand |
|---------|--------|---------|
| Pro Seite: Übernachtung ja/nein | [ ] | 1h |
| Pro Seite: Bühnenauswahl mit Vorauswahl | [ ] | 1h |
| Checkbox für Positionen | [ ] | 1h |
| Sperrungen/Besonderheiten als Position | [ ] | 1h |

**Hinweis:** Diese Aufgaben könnten durch AngebotPositionenStep.tsx bereits abgedeckt sein (Zeilen 477-496). Prüfung erforderlich.

---

## MASSNAHMENPLAN

### Phase 1: Prüfung (1-2 Stunden)
1. **Doppelte Einträge identifizieren:** Einige Aufgaben erscheinen mehrfach in todo.md (z.B. Loom Feedback 2 ab Zeile 501 und 534)
2. **Bereits implementierte Funktionen prüfen:** Viele "offene" Aufgaben wurden möglicherweise bereits umgesetzt
3. **todo.md bereinigen:** Doppelte Einträge entfernen, erledigte Aufgaben markieren

### Phase 2: Wizard-Vereinfachung (4-5 Stunden)
1. Alle Wizard-Komponenten analysieren
2. Felder pro Schritt auf max. 5-6 reduzieren
3. Pflichtfeld-Markierung einheitlich implementieren
4. Fortschrittsanzeige verbessern
5. "Fertig"-Button optimieren

### Phase 3: PDF-Angebotsabschluss (6-8 Stunden)
1. FassadenFix Skills lesen und verstehen
2. Störer-Element als wiederverwendbare Komponente erstellen
3. Dynamische Textbausteine integrieren
4. CI-konforme Gestaltung sicherstellen

### Phase 4: Finale Tests & Checkpoint (2 Stunden)
1. Alle Wizards durchspielen
2. PDF-Export testen
3. Finalen Checkpoint erstellen

---

## GESCHÄTZTER GESAMTAUFWAND

| Phase | Aufwand |
|-------|---------|
| Phase 1: Prüfung | 1-2h |
| Phase 2: Wizard-Vereinfachung | 4-5h |
| Phase 3: PDF-Angebotsabschluss | 6-8h |
| Phase 4: Finale Tests | 2h |
| **Gesamt** | **13-17h** |

---

## EMPFEHLUNG

1. **Sofort:** todo.md bereinigen und doppelte Einträge konsolidieren
2. **Diese Woche:** Wizard-Vereinfachung umsetzen (höchste Nutzerrelevanz)
3. **Nächste Woche:** PDF-Angebotsabschluss mit FassadenFix Skills optimieren
4. **Abschluss:** Finalen Checkpoint erstellen und Projekt als "Feature Complete" markieren
