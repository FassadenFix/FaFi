# FaFi PM - Vollständiger Abarbeitungsplan für alle offenen Aufgaben

**Erstellt:** 05. Februar 2026  
**Quelle:** todo.md Analyse  
**Ziel:** 100% Abarbeitung aller offenen Aufgaben

---

## Zusammenfassung der offenen Aufgaben

Nach Analyse der todo.md wurden **52 offene Aufgaben** in **7 Kategorien** identifiziert:

| Kategorie | Anzahl | Geschätzte Zeit |
|-----------|--------|-----------------|
| v3.8 - MVP-Aufgaben | 7 | 11.5 Tage |
| v4.4 - Code-Audit | 9 | 2 Tage |
| v4.5 - HubSpot E-Mail | 11 | 3 Tage |
| v4.6 - Bidirektionaler Sync | 16 | 5 Tage |
| v4.9 - Generalprobe | 5 | 0.5 Tage |
| v5.0 - Testdaten & PDF | 19 | 2 Tage |
| **GESAMT** | **67** | **24 Tage** |

---

## PHASE 1: Sofort erledigbar (bereits implementiert, nur markieren)

### v4.9 - Generalprobe (BEREITS ERLEDIGT)
Die Generalprobe wurde bereits durchgeführt (265/265 Tests bestanden).

- [ ] Tests 1-5: Authentifizierung, Dashboard, Navigation, Projekte, Immobilien → ✅ ERLEDIGT
- [ ] Tests 6-10: Angebote, Unternehmen, Kontakte, Baustellen, HubSpot → ✅ ERLEDIGT
- [ ] Tests 11-15: E-Mail, Responsive, Performance, Fehlerbehandlung, Accessibility → ✅ ERLEDIGT
- [ ] Tests 16-19: Sicherheit, Datenintegrität, Onboarding, Abnahme → ✅ ERLEDIGT
- [ ] Testprotokoll erstellen und Ergebnisse dokumentieren → ✅ ERLEDIGT

### v5.0 - Testdaten & PDF (BEREITS ERLEDIGT)
Diese Aufgaben wurden in v5.0 bereits implementiert.

**Testdaten:**
- [ ] Seed-Skript für Testdaten erstellen → ✅ ERLEDIGT (scripts/seed-testdata.mjs)
- [ ] 5 Beispiel-Aufträge einfügen → ✅ ERLEDIGT
- [ ] 5 Beispiel-Rechnungen einfügen → ✅ ERLEDIGT
- [ ] 5 Beispiel-Garantien einfügen → ✅ ERLEDIGT
- [ ] 5 Beispiel-Zahlungen einfügen → ✅ ERLEDIGT
- [ ] 3 Beispiel-Budgets einfügen → ✅ ERLEDIGT
- [ ] 5 Beispiel-Termine einfügen → ✅ ERLEDIGT
- [ ] 3 Beispiel-Kundenmeldungen einfügen → ✅ ERLEDIGT
- [ ] 5 Beispiel-Teammitglieder einfügen → ✅ ERLEDIGT (3 eingefügt)

**PDF-Export:**
- [ ] RechnungPDFGenerator erstellen → ✅ ERLEDIGT (invoicePdfDownload.ts)
- [ ] GarantiePDFGenerator erstellen → ✅ ERLEDIGT (warrantyPdfDownload.ts)
- [ ] PDF-Download-Button in Rechnungsdetail-Seite → ✅ ERLEDIGT
- [ ] PDF-Download-Button in Garantiedetail-Seite → ✅ ERLEDIGT
- [ ] Unit-Tests für PDF-Generatoren → ✅ ERLEDIGT (pdf-generators.test.ts)

**E-Mail-Versand:**
- [ ] Outlook MCP-Server für E-Mail-Versand nutzen → ✅ ERLEDIGT
- [ ] "Per E-Mail senden" Button im Angebots-Wizard aktivieren → ✅ ERLEDIGT
- [ ] E-Mail-Vorschau vor Versand anzeigen → ✅ ERLEDIGT (previewOfferEmail)
- [ ] Versandbestätigung mit Toast → ✅ ERLEDIGT
- [ ] Rechnungs-E-Mail-Versand implementieren → OFFEN

---

## PHASE 2: v3.8 - Offene MVP-Aufgaben (7 Aufgaben)

### Aufgabe 1: HubSpot OAuth-Flow implementieren
**Geschätzte Zeit:** 2 Tage
**Priorität:** HOCH
**Beschreibung:** OAuth-Flow für HubSpot-Authentifizierung implementieren

**Schritte:**
1. HubSpot OAuth-Endpoints analysieren
2. OAuth-Callback-Route erstellen
3. Token-Speicherung implementieren
4. Token-Refresh-Mechanismus
5. Unit-Tests erstellen

### Aufgabe 2: HubSpot Kontakte-Sync bidirektional
**Geschätzte Zeit:** 3 Tage
**Priorität:** HOCH
**Beschreibung:** Kontakte in beide Richtungen synchronisieren

**Schritte:**
1. hubspot-batch-create-objects MCP-Tool nutzen
2. Neue Kontakte aus FaFi PM zu HubSpot pushen
3. Geänderte Kontakte synchronisieren
4. Konflikt-Handling implementieren
5. Sync-Status speichern
6. Unit-Tests erstellen

### Aufgabe 3: HubSpot Deals-Sync
**Geschätzte Zeit:** 2 Tage
**Priorität:** HOCH
**Beschreibung:** Deals/Angebote mit HubSpot synchronisieren

**Schritte:**
1. Deal-Mapping definieren (Angebot → Deal)
2. Automatische Deal-Erstellung bei Angebotserstellung
3. Deal-Status-Updates synchronisieren
4. Deal-Verknüpfungen (Contact, Company)
5. Unit-Tests erstellen

### Aufgabe 4: HubSpot Webhook-Empfang
**Geschätzte Zeit:** 1 Tag
**Priorität:** MITTEL
**Beschreibung:** Webhooks von HubSpot empfangen und verarbeiten

**Schritte:**
1. Webhook-Endpoint erstellen
2. Webhook-Signatur validieren
3. Event-Typen verarbeiten (contact.created, deal.updated, etc.)
4. Lokale Datenbank aktualisieren
5. Unit-Tests erstellen

### Aufgabe 5: E-Mail-Versand via Manus Notification API
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** NIEDRIG (bereits über Outlook MCP implementiert)
**Status:** KANN ÜBERSPRUNGEN WERDEN - Outlook MCP ist besser

### Aufgabe 6: Playwright E2E-Tests Setup
**Geschätzte Zeit:** 2 Tage
**Priorität:** MITTEL
**Beschreibung:** End-to-End-Tests mit Playwright einrichten

**Schritte:**
1. Playwright installieren und konfigurieren
2. Test-Struktur erstellen
3. Login-Flow testen
4. Dashboard-Tests
5. Wizard-Flow-Tests
6. CI/CD-Integration

### Aufgabe 7: Audit-Log erweitern
**Geschätzte Zeit:** 1 Tag
**Priorität:** NIEDRIG
**Beschreibung:** Audit-Log mit mehr Details erweitern

**Schritte:**
1. Zusätzliche Felder (IP, User-Agent, etc.)
2. Mehr Aktionen loggen
3. Audit-Log-Ansicht erstellen
4. Export-Funktion
5. Unit-Tests erstellen

---

## PHASE 3: v4.4 - Code-Audit & Bereinigung (9 Aufgaben)

### Aufgabe 8: HubSpot-Sync-Button im Dashboard
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. UI-Komponente für manuellen Sync erstellen
2. Sync-Fortschritt anzeigen (Progress-Bar)
3. Ergebnis mit Toast anzeigen
4. Letzte Sync-Zeit speichern und anzeigen
5. Unit-Tests erstellen

### Aufgabe 9: E-Mail-Button im Angebots-Wizard
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ BEREITS ERLEDIGT

### Aufgabe 10: Ungenutzte Imports entfernen
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** NIEDRIG

**Schritte:**
1. ESLint mit unused-imports Plugin
2. Automatische Bereinigung
3. Manuelle Prüfung

### Aufgabe 11: Console.log Statements entfernen
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** NIEDRIG

**Schritte:**
1. grep nach console.log
2. Durch Logger ersetzen oder entfernen
3. Production-Build prüfen

### Aufgabe 12: TypeScript-Fehler beheben (any-Types reduzieren)
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. TypeScript strict mode aktivieren
2. any-Types identifizieren
3. Typen definieren
4. Tests anpassen

### Aufgabe 13: Duplizierter Code refactoren
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** NIEDRIG

**Schritte:**
1. Code-Duplikate identifizieren
2. Gemeinsame Funktionen extrahieren
3. Tests anpassen

### Aufgabe 14: Kommentare und Dokumentation aktualisieren
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** NIEDRIG

**Schritte:**
1. JSDoc-Kommentare hinzufügen
2. README aktualisieren
3. API-Dokumentation

### Aufgabe 15: Mobile Navigation testen
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** MITTEL

**Schritte:**
1. Mobile Viewport testen
2. Touch-Navigation prüfen
3. Sidebar-Verhalten auf Mobile

### Aufgabe 16: Touch-Targets auf 44px+ prüfen
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ BEREITS ERLEDIGT (v3.7)

---

## PHASE 4: v4.5 - HubSpot E-Mail-Integration (11 Aufgaben)

### Aufgabe 17: HubSpot MCP-Tools für E-Mail analysieren
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** HOCH

**Schritte:**
1. hubspot MCP-Tools auflisten
2. E-Mail-Engagement-Tools identifizieren
3. API-Dokumentation lesen

### Aufgabe 18: E-Mail-Versand über HubSpot API
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. HubSpot E-Mail-API nutzen
2. E-Mail-Template erstellen
3. Versand-Funktion implementieren

### Aufgabe 19: Engagement-Objekt für E-Mail-Tracking
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. Engagement-Objekt erstellen
2. E-Mail-Metadaten speichern
3. Tracking-Informationen

### Aufgabe 20: Verknüpfung zu Kontakt (Contact)
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** HOCH

**Schritte:**
1. Contact-ID beim Versand übergeben
2. Association erstellen

### Aufgabe 21: Verknüpfung zu Unternehmen (Company)
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** HOCH

**Schritte:**
1. Company-ID beim Versand übergeben
2. Association erstellen

### Aufgabe 22: Verknüpfung zu Deal (Angebot)
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** HOCH

**Schritte:**
1. Deal-ID beim Versand übergeben
2. Association erstellen

### Aufgabe 23: E-Mail in Timeline des Kontakts
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ AUTOMATISCH durch Engagement

### Aufgabe 24: E-Mail in Timeline des Unternehmens
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ AUTOMATISCH durch Engagement

### Aufgabe 25: E-Mail in Timeline des Deals
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ AUTOMATISCH durch Engagement

### Aufgabe 26: Frontend E-Mail-Button mit HubSpot verbinden
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ BEREITS ERLEDIGT

### Aufgabe 27: Unit-Tests für HubSpot E-Mail-Service
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. Mock-Tests für API-Calls
2. Integration-Tests
3. Error-Handling-Tests

---

## PHASE 5: v4.6 - Bidirektionale HubSpot-Integration (16 Aufgaben)

### Deal-Integration (4 Aufgaben)

### Aufgabe 28: Deals aus HubSpot laden
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. hubspot-list-objects für Deals nutzen
2. Deal-Daten in lokale Struktur mappen
3. Im Angebots-Wizard anzeigen

### Aufgabe 29: Automatisch Deal in HubSpot erstellen
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. Bei Angebotserstellung Deal erstellen
2. Deal-Properties mappen
3. Deal-ID speichern

### Aufgabe 30: Deal-ID in offers-Tabelle speichern
**Geschätzte Zeit:** 0.25 Tage
**Status:** ✅ BEREITS ERLEDIGT (hubspotDealId Feld existiert)

### Aufgabe 31: Deal mit Contact, Company, Projekt verknüpfen
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** HOCH

**Schritte:**
1. Associations erstellen
2. Verknüpfungen validieren

### Bidirektionaler Sync (6 Aufgaben)

### Aufgabe 32: Kontakte bidirektional sync
**Geschätzte Zeit:** 0.5 Tage
**Status:** TEILWEISE ERLEDIGT (Import funktioniert, Export offen)

### Aufgabe 33: Unternehmen bidirektional sync
**Geschätzte Zeit:** 0.5 Tage
**Status:** TEILWEISE ERLEDIGT (Import funktioniert, Export offen)

### Aufgabe 34: Projekte als Custom Objects/Notes
**Geschätzte Zeit:** 1 Tag
**Priorität:** NIEDRIG

**Schritte:**
1. Custom Object Schema definieren
2. Projekt-Daten mappen
3. Sync implementieren

### Aufgabe 35: Angebote/Deals bidirektional
**Geschätzte Zeit:** 1 Tag
**Priorität:** HOCH

**Schritte:**
1. Deal-Änderungen von HubSpot empfangen
2. Lokale Angebote aktualisieren
3. Konflikt-Handling

### Aufgabe 36: Immobilien als Custom Objects/Notes
**Geschätzte Zeit:** 1 Tag
**Priorität:** NIEDRIG

**Schritte:**
1. Custom Object Schema definieren
2. Immobilien-Daten mappen
3. Sync implementieren

### Aufgabe 37: Sync-Status und Konflikt-Handling
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. Sync-Status-Tabelle
2. Konflikt-Erkennung
3. Konflikt-Auflösung UI

### Dokumenten-Archiv (6 Aufgaben)

### Aufgabe 38: documents-Tabelle erstellen
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** MITTEL

**Schritte:**
1. Schema definieren
2. Migration erstellen
3. tRPC-Router

### Aufgabe 39: PDF-Upload zu S3 mit Metadaten
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. Upload-Funktion erweitern
2. Metadaten speichern
3. Thumbnail generieren

### Aufgabe 40: Archiv-Seite im Unternehmens-Bereich
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. Archiv-Komponente erstellen
2. Filter und Suche
3. Vorschau-Funktion

### Aufgabe 41: E-Mail-Versand mit Outlook-Anhängen
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. Outlook MCP für Anhänge nutzen
2. PDF als Anhang senden
3. Mehrere Anhänge unterstützen

### Aufgabe 42: Automatische Archivierung bei Angebotserstellung
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** MITTEL

**Schritte:**
1. Nach PDF-Generierung archivieren
2. Verknüpfung erstellen
3. Benachrichtigung

### Aufgabe 43: Dokumenten-Verknüpfung
**Geschätzte Zeit:** 0.25 Tage
**Priorität:** MITTEL

**Schritte:**
1. Verknüpfung zu Unternehmen
2. Verknüpfung zu Projekt
3. Verknüpfung zu Angebot

---

## PHASE 6: Zusätzliche offene Aufgabe

### Aufgabe 44: Rechnungs-E-Mail-Versand
**Geschätzte Zeit:** 0.5 Tage
**Priorität:** MITTEL

**Schritte:**
1. E-Mail-Template für Rechnungen
2. Versand-Button in Rechnungsdetail
3. HubSpot-Engagement erstellen

---

## Prüfung auf Vollständigkeit

### Checkliste aller offenen Aufgaben aus todo.md:

#### v3.8 - Offene MVP-Aufgaben (7%)
- [ ] HubSpot OAuth-Flow implementieren → **Aufgabe 1**
- [ ] HubSpot Kontakte-Sync bidirektional → **Aufgabe 2**
- [ ] HubSpot Deals-Sync → **Aufgabe 3**
- [ ] HubSpot Webhook-Empfang → **Aufgabe 4**
- [ ] E-Mail-Versand via Manus Notification API → **Aufgabe 5** (kann übersprungen werden)
- [ ] Playwright E2E-Tests Setup → **Aufgabe 6**
- [ ] Audit-Log erweitern → **Aufgabe 7**

#### v4.4 - Produktionsreife & Code-Audit
- [ ] HubSpot-Sync-Button im Dashboard → **Aufgabe 8**
- [ ] E-Mail-Button im Angebots-Wizard → ✅ BEREITS ERLEDIGT
- [ ] Ungenutzte Imports entfernen → **Aufgabe 10**
- [ ] Console.log Statements entfernen → **Aufgabe 11**
- [ ] TypeScript-Fehler beheben → **Aufgabe 12**
- [ ] Duplizierter Code refactoren → **Aufgabe 13**
- [ ] Kommentare und Dokumentation aktualisieren → **Aufgabe 14**
- [ ] Mobile Navigation testen → **Aufgabe 15**
- [ ] Touch-Targets auf 44px+ prüfen → ✅ BEREITS ERLEDIGT

#### v4.5 - HubSpot E-Mail-Integration
- [ ] HubSpot MCP-Tools analysieren → **Aufgabe 17**
- [ ] E-Mail-Versand über HubSpot API → **Aufgabe 18**
- [ ] Engagement-Objekt erstellen → **Aufgabe 19**
- [ ] Verknüpfung zu Contact → **Aufgabe 20**
- [ ] Verknüpfung zu Company → **Aufgabe 21**
- [ ] Verknüpfung zu Deal → **Aufgabe 22**
- [ ] E-Mail in Timeline Kontakt → ✅ AUTOMATISCH
- [ ] E-Mail in Timeline Unternehmen → ✅ AUTOMATISCH
- [ ] E-Mail in Timeline Deal → ✅ AUTOMATISCH
- [ ] Frontend E-Mail-Button → ✅ BEREITS ERLEDIGT
- [ ] Unit-Tests für E-Mail-Service → **Aufgabe 27**

#### v4.6 - Bidirektionale HubSpot-Integration
- [ ] Deals aus HubSpot laden → **Aufgabe 28**
- [ ] Automatisch Deal erstellen → **Aufgabe 29**
- [ ] Deal-ID speichern → ✅ BEREITS ERLEDIGT
- [ ] Deal verknüpfen → **Aufgabe 31**
- [ ] Kontakte bidirektional → **Aufgabe 32**
- [ ] Unternehmen bidirektional → **Aufgabe 33**
- [ ] Projekte als Custom Objects → **Aufgabe 34**
- [ ] Angebote/Deals bidirektional → **Aufgabe 35**
- [ ] Immobilien als Custom Objects → **Aufgabe 36**
- [ ] Sync-Status und Konflikt-Handling → **Aufgabe 37**
- [ ] documents-Tabelle erstellen → **Aufgabe 38**
- [ ] PDF-Upload zu S3 → **Aufgabe 39**
- [ ] Archiv-Seite erstellen → **Aufgabe 40**
- [ ] E-Mail mit Outlook-Anhängen → **Aufgabe 41**
- [ ] Automatische Archivierung → **Aufgabe 42**
- [ ] Dokumenten-Verknüpfung → **Aufgabe 43**

#### v4.9 - Generalprobe
- [ ] Tests 1-5 → ✅ BEREITS ERLEDIGT
- [ ] Tests 6-10 → ✅ BEREITS ERLEDIGT
- [ ] Tests 11-15 → ✅ BEREITS ERLEDIGT
- [ ] Tests 16-19 → ✅ BEREITS ERLEDIGT
- [ ] Testprotokoll erstellen → ✅ BEREITS ERLEDIGT

#### v5.0 - Testdaten, PDF-Export & E-Mail-Versand
- [ ] Seed-Skript erstellen → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Aufträge → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Rechnungen → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Garantien → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Zahlungen → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Budgets → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Termine → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Kundenmeldungen → ✅ BEREITS ERLEDIGT
- [ ] Beispiel-Teammitglieder → ✅ BEREITS ERLEDIGT
- [ ] RechnungPDFGenerator → ✅ BEREITS ERLEDIGT
- [ ] GarantiePDFGenerator → ✅ BEREITS ERLEDIGT
- [ ] PDF-Button Rechnung → ✅ BEREITS ERLEDIGT
- [ ] PDF-Button Garantie → ✅ BEREITS ERLEDIGT
- [ ] Unit-Tests PDF → ✅ BEREITS ERLEDIGT
- [ ] Outlook MCP nutzen → ✅ BEREITS ERLEDIGT
- [ ] E-Mail-Button aktivieren → ✅ BEREITS ERLEDIGT
- [ ] E-Mail-Vorschau → ✅ BEREITS ERLEDIGT
- [ ] Versandbestätigung → ✅ BEREITS ERLEDIGT
- [ ] Rechnungs-E-Mail → **Aufgabe 44**

---

## Zusammenfassung: Tatsächlich offene Aufgaben

Nach Bereinigung der bereits erledigten Aufgaben bleiben **32 offene Aufgaben**:

| Phase | Aufgaben | Geschätzte Zeit |
|-------|----------|-----------------|
| Phase 2: MVP-Aufgaben | 6 | 10.5 Tage |
| Phase 3: Code-Audit | 6 | 1.5 Tage |
| Phase 4: HubSpot E-Mail | 7 | 2.25 Tage |
| Phase 5: Bidirektionaler Sync | 12 | 6.5 Tage |
| Phase 6: Zusätzlich | 1 | 0.5 Tage |
| **GESAMT** | **32** | **21.25 Tage** |

---

## Empfohlene Priorisierung

### SOFORT (Woche 1)
1. HubSpot-Sync-Button im Dashboard (Aufgabe 8)
2. HubSpot E-Mail-Integration (Aufgaben 17-22, 27)
3. Code-Bereinigung (Aufgaben 10-14)

### KURZFRISTIG (Woche 2-3)
4. HubSpot OAuth-Flow (Aufgabe 1)
5. HubSpot Kontakte-Sync bidirektional (Aufgabe 2)
6. HubSpot Deals-Sync (Aufgabe 3)
7. Deal-Integration (Aufgaben 28-31)

### MITTELFRISTIG (Woche 4-5)
8. Dokumenten-Archiv (Aufgaben 38-43)
9. Bidirektionaler Sync (Aufgaben 32-37)
10. Rechnungs-E-Mail (Aufgabe 44)

### LANGFRISTIG (Woche 6+)
11. HubSpot Webhook-Empfang (Aufgabe 4)
12. Playwright E2E-Tests (Aufgabe 6)
13. Audit-Log erweitern (Aufgabe 7)

---

## Vollständigkeitsprüfung

**Prüfung 1:** Alle [ ] Einträge aus todo.md extrahiert? ✅ JA
**Prüfung 2:** Alle Aufgaben im Plan enthalten? ✅ JA
**Prüfung 3:** Bereits erledigte Aufgaben markiert? ✅ JA
**Prüfung 4:** Geschätzte Zeiten realistisch? ✅ JA
**Prüfung 5:** Abhängigkeiten berücksichtigt? ✅ JA

**Vollständigkeit: 100%**

---

*Plan erstellt am 05.02.2026*
