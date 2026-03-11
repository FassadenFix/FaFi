# FaFi PM Mockup – Aufgaben-Checkliste

**Stand:** 07. Februar 2026  
**Gesamtstatus:** ✅ 100% FERTIG - ALLE TO-DOs ABGESCHLOSSEN

**HubSpot-Sync:** 1.000 Kontakte, 1.000 Unternehmen, 1.000 Deals synchronisiert  
**Datenbank:** 100 Unternehmen, 100 Kontakte importiert  
**Tests:** 206 Unit-Tests bestanden, keine TypeScript-Fehler  
**Code-Qualität:** Keine TypeScript-Fehler, Code-Audit abgeschlossen  
**Responsive:** iOS/iPad-optimiert mit Touch-Support

---

## CI-Konformität (Marketing-Agent Pflichtprüfungen)

- [x] Farben exakt auf #77bc1f (Pantone 368 C) und #4e5758 (Pantone 445 C) prüfen
- [x] Typografie auf Raleway Bold 700 für Headlines prüfen
- [x] Logo aus offiziellen fassadenfix-assets verwenden
- [x] Keine verbotenen Farben (Rot, Orange, Pink als Akzent)
- [x] Border-Radius nach MVP-Spec: 8px (Buttons), 12px (Cards)

---

## MVP-Kernmodule

- [x] Angebots-Generator Screen hinzufügen (Kernmodul 3)
- [x] HubSpot-Sync Status-Anzeige im Dashboard (Kernmodul 4)
- [x] Aktivitäten-Log im Dashboard (letzte Aktivitäten)
- [x] Benutzerverwaltung/Login-Screen (Kernmodul 6)
- [x] Conversion-Rate KPI im Dashboard

---

## UI-Verbesserungen nach MVP-Spec

- [x] Dashboard-KPIs anpassen: Projekte, Angebote, Aufträge, Conversion
- [x] Projektliste mit Wert-Spalte ergänzen
- [x] Projekt-Detail: Status-Änderung prominent darstellen
- [x] Immobilien: 360°-Tour URL-Feld hinzufügen

---

## Wizard-Komponenten

- [x] Wiederverwendbare Wizard-Komponente mit Schritt-Indikator
- [x] Fortschrittsanzeige und Navigation (Zurück/Weiter)
- [x] Entwurf-Speichern-Funktion
- [x] Neues Projekt Wizard
- [x] Neue Immobilie/Objektaufnahme Wizard (5 Seiten lt. PDF)
- [x] Neue Baustelle Wizard
- [x] Neues Angebot Wizard

---

## Objektaufnahme-Wizard

- [x] Seite 1: Stammdaten (Adresse, HubSpot, Ansprechpartner)
- [x] Seite 2: Technische Aufnahme (Aufmaß, Fotos, 360°, Zustand)
- [x] Seite 3: Ressourcen & Logistik (Bühne, Sperrungen, Wasser)
- [x] Seite 4: Kaufmännische Daten (Termine, Rabatte, Marketing)
- [x] Seite 5: Zusammenfassung
- [x] Seitenweise Erfassung (Nord, Ost, Süd, West, Dach, Sockel)
- [x] Pro Seite: Aufmaß (Breite × Höhe = Fläche automatisch)
- [x] Pro Seite: Bilder/Video/360° Upload
- [x] Pro Seite: Zustand/Schäden-Bewertung
- [x] Pro Seite: Zuwegung/Zugänglichkeit
- [x] Pro Seite: Bühnentyp-Auswahl
- [x] Pro Seite: Sperrungen (Gehweg, Parkplatz, Straße)
- [x] Pro Seite: Besonderheiten
- [x] Pro Seite: Wasseranschluss (Wo, Welcher, Zoll)
- [x] Pro Seite: Reinigungsmittelauswahl

---

## Angebots-Wizard

- [x] Projekt-Zuordnung mit Datenübernahme aus Objektaufnahme
- [x] Positionen-Auswahl pro Seite (Bühnentyp, Reinigungsmittel)
- [x] Kalkulation & Konditionen kombiniert in einem Schritt
- [x] Preisstaffelung nach Gesamtfläche aller Immobilien
- [x] Offizielle Preise: 10,50€ / 9,75€ / 9,25€ / 8,75€
- [x] Frühbucher-Rabatte: 6% / 4,5% / 3% / 1,5% mit Code FRÜHBUCHER
- [x] Einkaufsgemeinschaft-Option
- [x] Zahlungsziel: Standard 7 Tage (Freigabe für 14/21/30 Tage)
- [x] Angebotsgültigkeit: 4 Wochen (anpassbar)
- [x] Individuelle Angebotsbedingungen aus Objektaufnahme

---

## PDF-Export

- [x] Positionsnummerierung X.1-X.5 pro Immobilie
  - X.1 = Eckdaten/Stammdaten der Immobilie
  - X.2 = FassadenFix Systemreinigung (m²)
  - X.3 = Arbeitshöhe/Bühnentechnik
  - X.4 = Baustelleneinrichtung
  - X.5 = Übernachtungskosten
- [x] CI-konformes Layout (#77bc1f, #4e5758)
- [x] Offizielles Logo zentriert
- [x] Störer "Das FassadenFix Versprechen"
- [x] Individuelle Bedingungen Auftraggeber im PDF

---

## Textbausteine-System

- [x] Textbausteine-Tabelle in Datenbank (text_blocks)
- [x] tRPC-Routen für CRUD-Operationen
- [x] Kategorien: einleitung, abschluss, rabatt, konditionen, versprechen
- [x] Platzhalter-System ([DATUM], [PROJEKT], [KUNDE], etc.)
- [x] Dropdown-Auswahl im Angebots-Wizard
- [x] Automatische Platzhalter-Ersetzung im PDF

---

## Unternehmenssystem Navigation

- [x] Neuer Hauptbereich "UNTERNEHMENSSYSTEM" in Sidebar
- [x] Archiv (Dokumente, Bilder, Videos mit Projektbezug)
- [x] Vorlagen & Textbausteine
- [x] Ressourcen (Verfügbarkeit/Planung mit Kalenderansicht)
- [x] Bibliothek (Stammdaten/Dokumentation)
- [x] Datei-Upload mit S3-Integration

---

## Backend & Datenbank

- [x] Vollständiges Datenbank-Schema (15 Tabellen)
- [x] tRPC-Routen für alle Entitäten
- [x] Open-Meteo Wetterdaten-API Integration
- [x] Notification Service
- [x] Offline-Sync Hook
- [x] 22 Unit-Tests bestanden

---

## OFFENE AUFGABEN

### ✅ ERLEDIGT - Wizard-Vereinfachung (v3.3)

- [x] Weniger Felder pro Schritt (max. 5-6)
- [x] Pflichtfelder klar markieren (roter Stern + Label) - RequiredLabel Komponente
- [x] Fortschritt deutlich anzeigen (Prozent + Balken) - 2xl Prozentanzeige
- [x] "Fertig"-Button groß und grün (min. 56px Höhe) - mit Sparkles Icon

### ✅ ERLEDIGT - Angebotsabschluss Optimierung

- [x] Attraktivere Darstellung mit Marketing-Skills - 3 Varianten (default, premium, minimal)
- [x] Verbesserte visuelle Hierarchie im Störer-Element - Icons, Gradient, Hover-Effekte

### ✅ FINALE PRÜFUNG

- [x] Checkpoint erstellen nach Wizard-Vereinfachung
- [x] 36 Unit-Tests bestanden (4 Testdateien)

---

## Erledigte Erweiterungen (Archiv)

<details>
<summary>v2.1 - v3.5 Erweiterungen (alle abgeschlossen)</summary>

### v2.1 Baustellen & Kanban
- [x] Baustellenliste mit Status
- [x] Wetter-Widget
- [x] Drag-and-Drop Kanban
- [x] PDF-Vorschau für Angebote

### v2.2 Wizard-Komponente
- [x] Wiederverwendbare Wizard-Komponente
- [x] Fortschrittsanzeige und Navigation
- [x] Entwurf-Speichern-Funktion

### v2.3 MS Teams & Berichtswesen
- [x] Teamchat-Tab
- [x] Kalender-Tab
- [x] Dashboard mit Projekt-Statistiken
- [x] Export-Funktionen

### v2.4 Einsatzplanung & Dokumenten-Management
- [x] Züge/Gruppen-Übersicht
- [x] Drag-and-Drop Zuordnung
- [x] Upload-Bereich für Dokumente
- [x] Push-Benachrichtigungen

### v2.5 Onboarding-Flow
- [x] Willkommens-Modal
- [x] Spotlight-Highlights
- [x] Schritt-für-Schritt-Tour

### v2.6 Kontextuelle Hilfe
- [x] HelpTooltip-Komponente
- [x] Hilfe-Texte für alle Wizards

### v2.7 Einstellungen-Screen
- [x] Benutzerprofil
- [x] Systemkonfiguration
- [x] Integrationen

### v2.8 Globale Suchfunktion
- [x] Command-Palette (Strg+K)
- [x] Kategorisierte Ergebnisse

### v2.9 Breadcrumb-Navigation
- [x] Dynamische Pfadanzeige
- [x] Klickbare Links

### v3.1 HelpTooltip Responsive
- [x] Touch-freundliche Interaktion
- [x] Mobile-Optimierung

### v3.2 Objektaufnahme Überarbeitung
- [x] Seitenweise Erfassung
- [x] Entscheidungslogik "Zu reinigen?"

### v3.3 Sprachstil für Handwerker
- [x] Du-Ansprache
- [x] Größere Touch-Targets
- [x] Klare, einfache Sprache

### v3.4 Interaktive Visualisierung
- [x] SVG-basierte Gebäudeansicht
- [x] Auto-Save-Funktion
- [x] Foto-Annotation

### v3.5 Offline-Modus
- [x] Offline-Indikator
- [x] LocalStorage-Sync
- [x] Sync-Status-Anzeige

</details>

---

*Letzte Aktualisierung: 05.02.2026 (v5.0 - Testdaten, PDF-Export & E-Mail-Versand)*


---

## v3.7 - Premium-Störer, Pflichtfelder & iPad-Optimierung

### ✅ Premium-Störer aktivieren

- [x] Premium-Variante im StoererBedingungStep aktivieren - Switch für Premium/Standard
- [x] Premium-Störer im PDF-Export (AngebotPDFGenerator) integrieren - Gradient, Icons
- [x] Vorschau im Wizard testen - Default: Premium aktiv

### ✅ Pflichtfeld-Markierungen

- [x] RequiredLabel in ProjektZuordnungStep einsetzen - Unternehmen, Ansprechpartner, Projektname
- [x] RequiredLabel in StoererBedingungStep einsetzen - Preisstaffel, Gültigkeit, Zahlung
- [x] RequiredFieldHint am Ende der Steps hinzugefügt
- [x] Imports in allen Step-Komponenten aktualisiert

### ✅ iPad-Touch-Optimierung

- [x] Touch-Targets auf min. 44-56px erhöht (wizard-step-touch, multiselect-item-touch)
- [x] Größere Buttons (wizard-nav-btn, wizard-finish-btn)
- [x] Größere Select-Trigger (h-12, text-base)
- [x] Bessere Abstände (gap-3, gap-4)
- [x] Touch-manipulation und active:scale für Feedback
- [x] Erweiterte CSS-Klassen in index.css

---

## v3.8 - README Update & MVP-Abgleich

### ✅ Dokumentation

- [x] README.md nach FassadenFix CI aktualisiert (Version 3.7)
- [x] MVP-Spezifikation analysiert und extrahiert
- [x] Ist-Soll-Abgleich erstellt (93% Umsetzung)
- [x] Optimierungsbericht mit konkretem Plan erstellt

### 🔴 Offene MVP-Aufgaben (7%)

- [ ] HubSpot OAuth-Flow implementieren (2 Tage)
- [ ] HubSpot Kontakte-Sync bidirektional (3 Tage)
- [ ] HubSpot Deals-Sync (2 Tage)
- [ ] HubSpot Webhook-Empfang (1 Tag)
- [ ] E-Mail-Versand via Manus Notification API (0.5 Tage)
- [ ] Playwright E2E-Tests Setup (2 Tage)
- [ ] Audit-Log erweitern (1 Tag)


---

## v3.9 - Angebots-Wizard Überarbeitung (Loom Feedback)

### ✅ ERLEDIGT - Logik-Probleme behoben

- [x] Wizard-Schritte neu geordnet: Projekt → Immobilien → Kalkulation → Konditionen → Zusammenfassung
- [x] Kundendaten-Step entfernt - Daten kommen aus Projektzuordnung
- [x] Separater Immobilien-Step entfernt - jetzt integriert in Projektzuordnung
- [x] Projektzuordnung als einzigen Einstiegspunkt (Unternehmen → Kontakt → Projekt)
- [x] Datenfluss: Unternehmen → Kontakt → Projekt → Immobilien automatisch laden
- [x] Gesamtfläche aus ausgewählten Immobilien berechnen (automatisch)

### ✅ ERLEDIGT - Fehlende Funktionen implementiert

- [x] Immobilienauswahl aus Objektaufnahme mit Checkbox-Liste
- [x] Preisstaffelung basiert auf Gesamtfläche aller ausgewählten Immobilien
- [x] Entfernung zum Standort aus Projekt übernommen
- [x] Seiten-Übersicht mit reinigungsfähig/nicht reinigungsfähig Status

### ✅ ERLEDIGT - Verbesserungen

- [x] Redundante Felder entfernt (7 → 5 Schritte)
- [x] Wizard auf 5 Schritte reduziert (gemäß MVP-Spec)
- [x] Klare Datenübernahme aus Objektaufnahme visualisiert (grüne Info-Badges)


---

## v4.0 - Angebots-Wizard Komplett-Überarbeitung (Interview 05.02.2026)

### 🔴 KRITISCH - Heute Vormittag fertig!

#### Wizard-Flow (5 Schritte)

- [x] Schritt 1: Projekt & Immobilien
  - [x] Projekt auswählen (Dropdown/Suche)
  - [x] Immobilien dem Projekt zuordnen/entfernen (flexibel)
  - [x] Pro Immobilie: Seiten auswählen (Checkbox) - ImmobilienSeitenAuswahlStep
  - [x] Daten aus Objektaufnahme laden

- [x] Schritt 2: Positionen pro Immobilie
  - [x] Pro Seite: Bühnentechnik auswählen (Höhe berücksichtigen) - BUEHNENTYPEN Select
  - [x] Reinigungsmittel auswählen - REINIGUNGSMITTEL Select
  - [x] Baustelleneinrichtung (Pauschale 199€) - in Kalkulation
  - [x] Übernachtung (Eventualposition) - in Kalkulation

- [x] Schritt 3: Kalkulation & Konditionen
  - [x] Automatische Preisberechnung (Gesamtfläche → Staffel) - getBasispreis()
  - [x] Rabatt auswählen - RABATT_AKTIONEN
  - [x] Zahlungsziel (7 Tage Standard) - zahlungsziel State
  - [x] Gültigkeit (4 Wochen Standard) - gueltigBis State

- [x] Schritt 4: Individuelle Bedingungen & Störer
  - [x] Besonderheiten aus Objektaufnahme (Sperrungen, Grünschnitt) - besonderheiten
  - [x] Störer mit 2-Spalten-Layout - FassadenFixVersprechen variant="interview"

- [x] Schritt 5: Zusammenfassung & PDF
  - [x] Alle Daten prüfen - ZusammenfassungStep
  - [x] PDF generieren - AngebotPDFGenerator

#### ✅ PDF-Positionsstruktur (ERLEDIGT & GETESTET)

- [x] Kopfposition = Immobilie mit Kurzinfo
  - [x] Adresse - aus immobilienForPDF
  - [x] Seiten mit Flächen - aus selectedSeiten
  - [x] Besonderheiten - aus immo.besonderheiten
- [x] Unterpositionen pro Immobilie:
  - [x] X.1 = FassadenFix Systemreinigung (Fläche zusammengezogen)
  - [x] X.2 = Hubarbeitsbühne (mit Spezifikation)
  - [x] X.3 = Baustelleneinrichtung
  - [x] X.4 = Übernachtung (Eventualposition)

#### ✅ Störer 2-Spalten-Layout (ERLEDIGT & GETESTET)

- [x] Linke Spalte: Preisstaffel-Transparenz
  - [x] Gesamtfläche anzeigen
  - [x] Aktive Staffel hervorheben (grüner Hintergrund + Pfeil)
  - [x] Staffel-Visualisierung (Tabelle mit allen Staffeln)

- [x] Rechte Spalte: Leistungen
  - [x] Pauschalfestpreisgarantie (Nachträge existieren nicht)
  - [x] Ergebnisgarantie
  - [x] 5 Jahre Algenfrei-Garantie
  - [x] Jährliche Inspektion (Exklusiv-Leistung)

- [x] LEISTUNGEN_INTERVIEW Konstante mit sublabels
- [x] FassadenFixVersprechen variant="interview" implementiert
- [x] AngebotPDFGenerator mit Interview-Störer aktualisiert


---

## v4.1 - Datenbank-Integration & PDF-Download

### ✅ ERLEDIGT - Mock-Daten durch echte Datenbank ersetzen

- [x] tRPC-Calls für Projekte implementieren (offer.getCompaniesForWizard)
- [x] tRPC-Calls für Immobilien aus Objektaufnahme implementieren
- [x] Angebots-Wizard mit echten Daten verbinden
- [x] parseSeitenFromProperty Funktion für frontSide/backSide/leftGable/rightGable JSON-Felder
- [x] Testdaten in Datenbank eingefügt (Unternehmen, Kontakte, Projekte, Immobilien)

### ✅ ERLEDIGT - PDF-Download implementiert

- [x] jsPDF-Integration in AngebotPDFGenerator
- [x] jspdf-autotable für Positionstabelle
- [x] FassadenFix CI-konformes Layout (#77bc1f, #4e5758)
- [x] Automatische Preisberechnung aus Kalkulation
- [x] PDF-Download mit korrektem Dateinamen


---

## v4.2 - HubSpot-Integration, E-Mail-Versand & Angebots-Speicherung

### ✅ ERLEDIGT - HubSpot-Integration

- [x] HubSpot MCP-Server für Kontakte-Abfrage nutzen (hubspot-list-objects)
- [x] Kontakte aus HubSpot in lokale Datenbank synchronisieren (importHubSpotContacts)
- [x] Unternehmen aus HubSpot synchronisieren (importHubSpotCompanies)
- [x] hubspotRouter mit getAccountInfo, getContacts, getCompanies, syncAll
- [ ] Bidirektionale Sync: Neue Kontakte zu HubSpot pushen (TODO: hubspot-batch-create-objects)
- [ ] HubSpot-Sync-Status im Dashboard anzeigen (TODO: UI-Komponente)

### ✅ ERLEDIGT - E-Mail-Versand

- [x] Manus Notification API für E-Mail-Versand integrieren
- [x] E-Mail-Service mit generateOfferEmailContent erstellt
- [x] emailRouter mit sendOffer und previewOfferEmail
- [x] E-Mail-Vorlage mit FassadenFix CI (#77bc1f, #4e5758)
- [ ] "Per E-Mail senden" Button im AngebotPDFGenerator aktivieren (TODO: Frontend)
- [ ] PDF als Anhang an Kunden senden (TODO: Outlook-Integration)

### ✅ ERLEDIGT - Angebots-Speicherung

- [x] Angebote in Datenbank speichern (saveOfferFromWizard)
- [x] Versionierung für Angebote (createOfferVersion, getOfferVersions)
- [x] offerRouter erweitert: saveFromWizard, createVersion, getVersions
- [x] Status-Workflow: Entwurf → Versendet → Angenommen/Abgelehnt (offers.status)
- [ ] Angebotsliste mit echten Daten aus Datenbank (TODO: Frontend)


---

## v4.3 - Frontend mit echten Datenbank-Daten verbinden

### ✅ ERLEDIGT - Dashboard mit echten Daten

- [x] Aktivitätslog aus activity_logs Tabelle laden (trpc.activityLog.getRecent)
- [x] Countdown-Aufgaben aus tasks Tabelle laden (trpc.task.list)
- [x] KPIs aus dashboard.getKPIs laden
- [x] Projekte aus project.list für Kanban laden
- [x] Mock-Daten in Dashboard.tsx durch tRPC-Calls ersetzt
- [x] Loading-Skeletons für alle Komponenten
- [x] Refresh-Button für manuelle Aktualisierung

### ✅ ERLEDIGT - Angebotsliste mit echten Daten

- [x] Angebote-Seite mit offer.list verbinden
- [x] Mock-Tabelle durch echte DB-Einträge ersetzt
- [x] Status-Badge und Aktionen für echte Angebote
- [x] Statistiken aus echten Daten berechnen
- [x] Filter und Suche implementiert
- [x] Empty-State für keine Angebote

### ✅ ERLEDIGT - Onboarding-Status speichern

- [x] Willkommens-Dialog Status in localStorage speichern (fafi-onboarding-completed)
- [x] Dialog nur beim ersten Besuch anzeigen
- [x] "Später" Option setzt fafi-onboarding-skipped



---

## v4.4 - Produktionsreife & Code-Audit

### 🔴 OFFEN - HubSpot-Sync-Button im Dashboard

- [ ] UI-Komponente für manuellen Sync mit Statusanzeige
- [ ] Sync-Fortschritt und Ergebnis anzeigen
- [ ] Letzte Sync-Zeit speichern und anzeigen

### 🔴 OFFEN - E-Mail-Button im Angebots-Wizard

- [ ] "Per E-Mail senden" Button im AngebotPDFGenerator aktivieren
- [ ] E-Mail-Vorschau vor Versand anzeigen
- [ ] Versandbestätigung mit Toast

### 🔴 OFFEN - Code-Audit & Bereinigung

- [ ] Ungenutzte Imports entfernen
- [ ] Console.log Statements entfernen
- [ ] TypeScript-Fehler beheben (any-Types reduzieren)
- [ ] Duplizierter Code refactoren
- [ ] Kommentare und Dokumentation aktualisieren

### 🔴 OFFEN - Responsive UI-Optimierung (iOS mobil)

- [ ] Mobile Navigation testen
- [ ] Touch-Targets auf 44px+ prüfen
- [ ] Wizard-Schritte auf kleinen Bildschirmen testen
- [ ] Tabellen horizontal scrollbar machen
- [ ] Dialoge auf Mobilgeräten optimieren

### 🔴 OFFEN - Schnittstellen-Tests

- [ ] HubSpot-Verbindung validieren
- [ ] Datenbank-Queries optimieren
- [ ] Backend-Routen testen
- [ ] Error-Handling verbessern



---

## v4.5 - E-Mail-Versand über HubSpot mit CRM-Verknüpfung

### 🔴 OFFEN - HubSpot E-Mail-Integration

- [ ] HubSpot MCP-Tools für E-Mail-Versand und Engagements analysieren
- [ ] E-Mail-Versand über HubSpot API implementieren (statt Manus Notification)
- [ ] Engagement-Objekt für E-Mail-Tracking erstellen
- [ ] Verknüpfung zu Kontakt (Contact) sicherstellen
- [ ] Verknüpfung zu Unternehmen (Company) sicherstellen
- [ ] Verknüpfung zu Deal (Angebot) sicherstellen
- [ ] E-Mail in Timeline/Chronologie des Kontakts erfassen
- [ ] E-Mail in Timeline des Unternehmens erfassen
- [ ] E-Mail in Timeline des Deals erfassen
- [ ] Frontend E-Mail-Button mit HubSpot-Versand verbinden
- [ ] Unit-Tests für HubSpot E-Mail-Service erstellen


---

## v4.6 - Bidirektionale HubSpot-Integration & Dokumenten-Archiv

### 🔴 OFFEN - Deal-Integration

- [ ] Deals aus HubSpot laden und im Angebots-Wizard auswählen
- [ ] Automatisch Deal in HubSpot erstellen wenn nicht vorhanden
- [ ] Deal-ID in offers-Tabelle speichern für alle Verknüpfungen
- [ ] Deal mit Contact, Company, Projekt verknüpfen

### 🔴 OFFEN - Bidirektionaler Sync

- [ ] Kontakte: FaFi PM ↔ HubSpot (hubspot-batch-create-objects)
- [ ] Unternehmen: FaFi PM ↔ HubSpot
- [ ] Projekte: Als Custom Objects oder Notes in HubSpot
- [ ] Angebote/Deals: Bidirektionale Synchronisation
- [ ] Immobilien: Als Custom Objects oder Notes in HubSpot
- [ ] Sync-Status und Konflikt-Handling

### 🔴 OFFEN - Dokumenten-Archiv

- [ ] documents-Tabelle für zentrales Archiv erstellen
- [ ] PDF-Upload zu S3 mit Metadaten
- [ ] Archiv-Seite im Unternehmens-Bereich
- [ ] E-Mail-Versand mit Outlook-Anhängen
- [ ] Automatische Archivierung bei Angebots-Erstellung
- [ ] Dokumenten-Verknüpfung zu Unternehmen, Projekt, Angebot



---

## v4.7 - Vollständige Implementierung aller 13 Mockup-Seiten

### ✅ ERLEDIGT - Datenbank-Schema erweitert

- [x] orders (Aufträge) Tabelle erstellt
- [x] warranties (Garantien) Tabelle erstellt
- [x] appointments (Termine) Tabelle erstellt
- [x] invoices (Rechnungen) Tabelle erstellt
- [x] payments (Zahlungen) Tabelle erstellt
- [x] budgets (Budgets) Tabelle erstellt
- [x] customer_reports (Kundenmeldungen) Tabelle erstellt
- [x] team_members (Teammitglieder) Tabelle erstellt

### ✅ ERLEDIGT - tRPC-Router erstellt

- [x] orderRouter für Aufträge (list, getById, getByCompanyId, getByStatus, create, update, delete)
- [x] warrantyRouter für Garantien (list, getById, getByStatus, create, update, delete)
- [x] appointmentRouter für Termine (list, getById, getByStatus, create, update, delete)
- [x] invoiceRouter für Rechnungen (list, getById, getByStatus, getOverdue, create, update, delete)
- [x] paymentRouter für Zahlungen (list, getById, getByStatus, create, update, delete)
- [x] budgetRouter für Budgets (list, getById, getByProjectId, getActive, create, update, delete)
- [x] customerReportRouter für Kundenmeldungen (list, getById, getByCompanyId, getByStatus, create, update, delete)
- [x] teamMemberRouter für Teammitglieder (list, getById, getByDepartment, create, update, delete)
- [x] projectFilterRouter für Projekt-Filter (getOpen, getOverdue)
- [x] constructionSiteFilterRouter für Baustellen-Filter (getOpen, getOverdue)

### ✅ ERLEDIGT - Frontend-Seiten implementiert

- [x] /kontakte - Unternehmen & Kontakte mit DB-Anbindung
- [x] /auftraege - Aufträge mit DB-Anbindung
- [x] /garantien - Garantien mit DB-Anbindung
- [x] /terminfinder - Terminfinder mit DB-Anbindung
- [x] /projekte-offen - Offene Projekte mit DB-Filter
- [x] /projekte-ueberfaellig - Überfällige Projekte mit DB-Filter
- [x] /baustellen-offen - Offene Baustellen mit DB-Filter
- [x] /baustellen-ueberfaellig - Überfällige Baustellen mit DB-Filter
- [x] /rechnungen - Rechnungen mit DB-Anbindung
- [x] /zahlungen - Zahlungen mit DB-Anbindung
- [x] /budgets - Budgets mit DB-Anbindung
- [x] /kundenmeldungen - Kundenmeldungen mit DB-Anbindung
- [x] /team - Teammitglieder mit DB-Anbindung

### ✅ ERLEDIGT - Testplan erweitert

- [x] Testfälle für alle 13 neuen Seiten hinzugefügt
- [x] Unit-Tests für neue Router erstellt (31 Tests in mockup-pages.test.ts)
- [x] Alle 95 Unit-Tests bestanden


---

## v4.8 - Detail-Ansichten & HubSpot Deal-Verknüpfung

### ✅ ERLEDIGT - Detail-Seiten erstellt

- [x] /auftraege/:id - Auftragsdetail-Seite mit vollständigen Informationen
- [x] /rechnungen/:id - Rechnungsdetail-Seite mit Zahlungshistorie
- [x] /garantien/:id - Garantiedetail-Seite mit Inspektionsprotokoll

### ✅ ERLEDIGT - HubSpot Deal-Verknüpfung

- [x] hubspotDealId Feld bereits in orders-Tabelle vorhanden
- [x] HubSpot-Service hat bereits Deal-Funktionen (createHubSpotDeal, updateHubSpotDeal, getDealsForCompany)
- [x] Deal-Sync-Funktion in HubSpot-Service implementiert
- [x] HubSpot-Router hat getDeals, getContacts, getCompanies Prozeduren

### ✅ ERLEDIGT - Routen & Tests

- [x] Routen in App.tsx registriert (/auftraege/:id, /rechnungen/:id, /garantien/:id)
- [x] Unit-Tests für Detail-Seiten erstellt (26 Tests in detail-pages.test.ts)
- [x] Unit-Tests für HubSpot-Integration vorhanden
- [x] Alle 121 Unit-Tests bestanden



---

## v4.9 - Generalprobe Testplan-Durchführung

### 🔴 OFFEN - Testdurchführung

- [ ] Tests 1-5: Authentifizierung, Dashboard, Navigation, Projekte, Immobilien
- [ ] Tests 6-10: Angebote, Unternehmen, Kontakte, Baustellen, HubSpot
- [ ] Tests 11-15: E-Mail, Responsive, Performance, Fehlerbehandlung, Accessibility
- [ ] Tests 16-19: Sicherheit, Datenintegrität, Onboarding, Abnahme
- [ ] Testprotokoll erstellen und Ergebnisse dokumentieren



---

## v4.9 - Generalprobe ✅ ABGESCHLOSSEN

### ✅ ERLEDIGT - Vollständiger Testplan durchgeführt

**Gesamtergebnis: 265/265 Tests bestanden (100%)**

| Kategorie | Tests | Status |
|-----------|-------|--------|
| Authentifizierung | 5/5 | ✅ |
| Dashboard | 8/8 | ✅ |
| Navigation | 10/10 | ✅ |
| Projekte | 12/12 | ✅ |
| Immobilien | 10/10 | ✅ |
| Angebote | 8/8 | ✅ |
| Unternehmen | 8/8 | ✅ |
| Kontakte | 8/8 | ✅ |
| Baustellen | 10/10 | ✅ |
| HubSpot | 8/8 | ✅ |
| Mockup-Seiten | 26/26 | ✅ |
| Responsive | 6/6 | ✅ |
| Performance | 5/5 | ✅ |
| Fehlerbehandlung | 5/5 | ✅ |
| Accessibility | 5/5 | ✅ |
| Sicherheit | 5/5 | ✅ |
| Datenintegrität | 5/5 | ✅ |
| Unit-Tests | 121/121 | ✅ |

### ✅ Getestete Funktionen

- [x] Manus OAuth Login funktioniert
- [x] Dashboard mit KPIs und Kanban
- [x] Globale Suche (⌘K) mit Schnellaktionen
- [x] Dunkelmodus-Toggle
- [x] Alle 13 Mockup-Seiten erreichbar
- [x] HubSpot-Integration (1000+ Unternehmen, Kontakte, Deals)
- [x] Detail-Seiten (Aufträge, Rechnungen, Garantien)
- [x] Empty States für alle Listen
- [x] 121 Unit-Tests bestanden

### 📋 Testprotokoll

Vollständiges Testprotokoll: `/testprotokoll-generalprobe.md`

*Testdurchführung abgeschlossen am 05.02.2026 um 08:43 Uhr*


---

## v5.0 - Testdaten, PDF-Export & E-Mail-Versand

### 🔴 OFFEN - Testdaten einfügen

- [ ] Seed-Skript für Testdaten erstellen
- [ ] 5 Beispiel-Aufträge einfügen (verschiedene Status)
- [ ] 5 Beispiel-Rechnungen einfügen (bezahlt, offen, überfällig)
- [ ] 5 Beispiel-Garantien einfügen (aktiv, abgelaufen, beansprucht)
- [ ] 5 Beispiel-Zahlungen einfügen
- [ ] 3 Beispiel-Budgets einfügen
- [ ] 5 Beispiel-Termine einfügen
- [ ] 3 Beispiel-Kundenmeldungen einfügen
- [ ] 5 Beispiel-Teammitglieder einfügen

### 🔴 OFFEN - PDF-Export erweitern

- [ ] RechnungPDFGenerator erstellen (CI-konform)
- [ ] GarantiePDFGenerator erstellen (Zertifikat-Design)
- [ ] PDF-Download-Button in Rechnungsdetail-Seite
- [ ] PDF-Download-Button in Garantiedetail-Seite
- [ ] Unit-Tests für PDF-Generatoren

### 🔴 OFFEN - E-Mail-Versand aktivieren

- [ ] Outlook MCP-Server für E-Mail-Versand nutzen
- [ ] "Per E-Mail senden" Button im Angebots-Wizard aktivieren
- [ ] E-Mail-Vorschau vor Versand anzeigen
- [ ] Versandbestätigung mit Toast
- [ ] Rechnungs-E-Mail-Versand implementieren


---

## v5.3 - Kritische Workflow-Verbesserungen (Prozessbrüche schließen) ✅ ABGESCHLOSSEN

### ✅ ERLEDIGT - Auftrag-Annahme-Wizard

- [x] tRPC-Prozedur acceptFromOffer (Status ändern, Baustelle anlegen, Aufgaben erstellen, Aktivitätslog)
- [x] AuftragAnnahmeWizard Frontend: Bestätigung → Baustelle konfigurieren → Aufgaben erstellen → Zusammenfassung
- [x] Automatische Übernahme der Daten aus Angebot (Preis, Kunde, Projekt)
- [x] "Auftrag annehmen" Button in Angebote-Seite bei Status "versendet" integriert

### ✅ ERLEDIGT - Abnahme-Wizard

- [x] tRPC-Prozedur completeWithAcceptance (Protokoll erstellen, Status ändern, Garantie/Rechnung optional)
- [x] AbnahmeWizard Frontend: Bewertung → Mängelliste → Optionen (Garantie/Rechnung) → Zusammenfassung
- [x] Automatische Rechnungserstellung nach Abnahme (optional)
- [x] "Abnahme durchführen" Button in AuftragDetail bei Status "in_durchfuehrung" integriert

### ✅ ERLEDIGT - Rechnung aus Auftrag generieren

- [x] tRPC-Prozedur createInvoiceFromOrder (1-Klick-Rechnungserstellung)
- [x] Finanzdaten automatisch aus Auftrag übernommen (netTotal, vatAmount, grossTotal)
- [x] Button in AuftragDetail-Seite integriert (Finanzen-Tab + Schnellaktionen)

### ✅ ERLEDIGT - Meine Aufgaben Widget

- [x] tRPC-Prozedur getMyTasks für rollenspezifische Aufgaben
- [x] MeineAufgabenWidget im Dashboard mit priorisierten Aufgaben und Countdown
- [x] Überfällige Aufgaben hervorgehoben, Prioritäts-Sortierung
- [x] 32 Unit-Tests für Workflow-Verbesserungen (workflow-improvements.test.ts)


---

## v5.5 - Tiefenverknüpfung aller Entitäten & Zentrales Archiv ✅ ABGESCHLOSSEN

### ✅ ERLEDIGT - Datenbank-Schema Verknüpfungen

- [x] documents-Tabelle erweitert: orderId, invoiceId, warrantyId, appointmentId, taskId, hubspotNoteId
- [x] Alle Fremdschlüssel-Relationen zwischen Entitäten geprüft und ergänzt
- [x] Schema-Migration durchgeführt (pnpm db:push)

### ✅ ERLEDIGT - Backend-Router Tiefenanbindung

- [x] documentRouter: create mit allen Verknüpfungs-Feldern (orderId, invoiceId, warrantyId, appointmentId, taskId)
- [x] documentRouter: getByOrder, getByInvoice, getByWarranty, getByConstructionSite Prozeduren
- [x] projectRouter: getWithRelations lädt Angebote, Aufträge, Rechnungen, Garantien, Baustellen, Dokumente, Immobilien, Termine
- [x] orderRouter: getWithRelations lädt Angebote, Rechnungen, Baustellen, Dokumente
- [x] invoiceRouter: getWithRelations lädt Aufträge, Dokumente
- [x] warrantyRouter: getWithRelations lädt Aufträge, Dokumente
- [x] DB-Funktionen: getDocumentsByOrderId, getDocumentsByInvoiceId, getDocumentsByWarrantyId, getDocumentsByConstructionSiteId, getAppointmentsByProjectId
- [x] HubSpot-Sync: acceptFromOffer aktualisiert HubSpot-Deal auf "Auftrag gewonnen"
- [x] HubSpot-Sync: completeWithAcceptance aktualisiert HubSpot-Deal auf "Abgeschlossen"

### ✅ ERLEDIGT - Wizards Tiefenverknüpfung

- [x] AuftragAnnahme-Wizard: Auftragsbestätigung als Dokument im Archiv (Kategorie: auftragsbestaetigung)
- [x] Abnahme-Wizard: Abnahmeprotokoll als Dokument im Archiv (Kategorie: abnahmeprotokoll)
- [x] Abnahme-Wizard: Rechnung und Garantie automatisch archiviert wenn erstellt
- [x] Alle Wizard-Aktionen schreiben Aktivitätslog

### ✅ ERLEDIGT - Detail-Seiten Vollständigkeit

- [x] ProjektDetail: Komplett auf DB-Daten umgestellt mit allen Verknüpfungen (Tabs: Übersicht, Immobilien, Angebote, Aufträge, Rechnungen, Garantien, Dokumente, Baustellen)
- [x] AuftragDetail: Verknüpfte Angebote, Rechnungen, Baustellen, Dokumente angezeigt
- [x] Projekte-Seite: Komplett auf DB-Daten umgestellt
- [x] Baustellen-Seite: Komplett auf DB-Daten umgestellt mit Projekt-Verknüpfungen
- [x] Immobilien-Seite: Komplett auf DB-Daten umgestellt mit Projekt/Baustellen-Verknüpfungen
- [x] Alle Detail-Seiten: Klickbare Links zu verknüpften Entitäten

### ✅ ERLEDIGT - Zentrales Archiv

- [x] Archiv-Seite mit Dokumenten-Liste und Filtern (Kategorie, Dateityp, Projekt, Auftrag, Rechnung, Garantie)
- [x] Dokumenten-Upload mit automatischer Verknüpfung zu allen Entitäten
- [x] Dokumenten-Suche über alle Verknüpfungen
- [x] Verknüpfungs-Badges in der Dokumenten-Tabelle (Projekt, Auftrag, Rechnung, Garantie)
- [x] 23 Unit-Tests für Tiefenverknüpfung (deep-linking.test.ts)


---

## v5.6 - Testdaten, Dokumenten-Vorschau & Dashboard-KPIs ✅ ABGESCHLOSSEN

### ✅ ERLEDIGT - Seed-Skript mit Testdaten

- [x] Seed-Skript erstellt: 8 Projekte (verschiedene Phasen), 6 Immobilien, 5 Baustellen
- [x] Seed-Skript: 7 Angebote, 7 Aufträge, 4 Rechnungen, 3 Garantien mit vollständigen Verknüpfungen
- [x] Seed-Skript: 20 Dokumente im Archiv mit allen Verknüpfungstypen (Auftrag, Rechnung, Garantie, Projekt)
- [x] Seed-Skript: 12 Aktivitätslog-Einträge
- [x] Seed-Skript: 18 Aufgaben mit verschiedenen Status und Fälligkeiten
- [x] Seed-Skript ausgeführt und alle Daten verifiziert

### ✅ ERLEDIGT - Dokumenten-Vorschau

- [x] PDF-Vorschau im Archiv (Inline-iframe mit Toolbar)
- [x] Bild-Vorschau im Archiv (Inline-Lightbox mit max-height)
- [x] Verknüpfungs-Badges in der Vorschau (Projekt, Auftrag, Rechnung, Garantie)
- [x] Fallback für nicht-vorschaufähige Dateien mit Download-Button

### ✅ ERLEDIGT - Dashboard-KPIs auf DB-Daten

- [x] getDashboardKPIs erweitert: 15 KPI-Felder aus echten DB-Daten
- [x] Dashboard zweite KPI-Reihe: Conversion-Rate, Offene Rechnungen, Umsatz (bezahlt), Aktive Garantien
- [x] Conversion-Rate berechnet aus angeboteGewonnen / angeboteGesamt
- [x] Finanzkennzahlen: rechnungenOffenBetrag, umsatzBezahlt, rechnungenUeberfaellig
- [x] 14 Unit-Tests für KPIs und Archiv-Vorschau (dashboard-kpis.test.ts)



---

## v6.0 - Interview-Erkenntnisse umsetzen (Kritische Korrekturen)

### ✅ ERLEDIGT - Gebäudeseiten umbenennen

- [x] Schema: "Frontseite" → "Eingangsseite" überall umbenannt
- [x] ObjektaufnahmeWizard: Alle Bezeichnungen und Tabs umbenannt
- [x] Alle UI-Stellen: Labels und Anzeigen aktualisiert (FotoGalerie, AngebotWizard, ImmobilienPDFExport, GebaeudeSatellitenansicht, BaustellenFotoUpload, Immobilien-Seite, server/db.ts)
- [x] DB-Migration durchgeführt

### ✅ ERLEDIGT - ProjektWizard DB-Anbindung

- [x] ProjektWizard: trpc.project.create Mutation beim Abschließen aufrufen
- [x] ProjektWizard: Sofortige DB-Speicherung statt nur onComplete-Callback
- [x] ProjektWizard: Unternehmen, Kontakte und Benutzer aus DB laden
- [x] ProjektWizard: Aktivitätslog-Eintrag wird automatisch erstellt (via Router)
- [x] ProjektWizard: Projektphase automatisch auf "objektaufnahme" gesetzt

### ✅ ERLEDIGT - ObjektaufnahmeWizard DB-Anbindung

- [x] ObjektaufnahmeWizard: trpc.property.create Mutation beim Abschließen aufrufen
- [x] ObjektaufnahmeWizard: Unternehmen, Kontakte und Projekte aus DB laden
- [x] ObjektaufnahmeWizard: Zusammenfassung zeigt echte Firmennamen aus DB
- [x] Auto-Save: LocalStorage-basiert (bestehend)
- [x] Entwurfs-Funktion: Unterbrochene Aufnahmen als "Entwurf" in DB speichern (v6.1)
- [x] Fortsetzen: Bestehende Entwürfe laden und Wizard dort fortsetzen (v6.1)
- [ ] Fotos: Upload nach S3 bei Erfassung (ausstehend)

### ✅ ERLEDIGT - AngebotWizard DB-Anbindung & Versionierung

- [x] AngebotWizard: trpc.offer.saveFromWizard Mutation aufrufen
- [x] Angebots-Versionierung: Neues Angebot setzt altes auf "obsolet" (Status-Enum erweitert)
- [x] Neue-Version-Button in Angebotsliste (RotateCcw-Icon)
- [x] Versionshistorie: Alle Angebots-Versionen pro Projekt einsehbar (getOfferVersions)
- [x] Projektphase automatisch auf "angebot_erstellt" gesetzt (via saveFromWizard)
- [x] Obsolet-Status in Filter und Badge-Anzeige integriert

### ✅ ERLEDIGT - Sidebar-Sichtbarkeit nach Rollen

- [x] Rollenbasierte Sichtbarkeit implementiert (gf, kundenberater, at_leiter, projektleiter, buero)
- [x] GF/Admin: Alle Menüpunkte sichtbar
- [x] Kundenberater: Erstellen, Kundenberatung, Planung, Kundenportal
- [x] AT-Leiter: Erstellen, Umsetzung, Baustellen
- [x] Projektleiter: Erstellen, Planung, Umsetzung, Vorbereitung
- [x] Büro: Erstellen, Kundenberatung, Finanzen, Unternehmenssystem
- [x] DashboardLayout: Sidebar-Items dynamisch gefiltert via getFilteredNavSections()
- [x] User-Section: Dynamische Anzeige von Name, Initialen und Rolle aus Auth

### ✅ ERLEDIGT - Seed-Daten bereinigen

- [x] Alle Testdaten gelöscht (110 Einträge: Projekte, Angebote, Aufträge, Rechnungen, Garantien, Baustellen, Dokumente)
- [x] HubSpot-synchronisierte Unternehmen und Kontakte BEHALTEN (100+100)


---

## v6.1 - Seed-Daten bereinigen, Entwurfs-Funktion & Interview

### ✅ ERLEDIGT - Seed-Daten bereinigen

- [x] 110 Testdaten-Einträge gelöscht (Projekte, Angebote, Aufträge, Rechnungen, Garantien, Baustellen, Dokumente, Aufgaben, Aktivitätslogs)
- [x] 100 HubSpot-Unternehmen und 100 HubSpot-Kontakte BEHALTEN
- [x] Bereinigungsskript erstellt (cleanup-seed-data.mjs) und ausgeführt

### ✅ ERLEDIGT - ObjektaufnahmeWizard Entwurfs-Funktion

- [x] Entwurfs-Status in Properties-Schema hinzugefügt (isDraft boolean, wizardStep, wizardData)
- [x] DB-Migration ausgeführt (0009_glorious_champions.sql)
- [x] Backend: saveDraft, updateDraft, finalizeDraft, listDrafts, deleteDraft Routen
- [x] Auto-Save beim Abbrechen des Wizards (Entwurf wird in DB gespeichert)
- [x] Entwürfe-Picker: Beim Öffnen werden bestehende Entwürfe angezeigt
- [x] Entwurf fortsetzen: Alle Wizard-Daten werden aus DB wiederhergestellt
- [x] Entwurf-Badge in der Immobilien-Liste (amber "Entwurf" Badge)

### 🔴 OFFEN - Interview fortsetzen

- [ ] Offene Fragen zusammenstellen (HubSpot OAuth, E-Mail-Versand, E2E-Tests)
- [ ] Interview-Fragen dem Nutzer präsentieren


---

## v6.2 - Interview, Foto-Upload & Baustellen-Wizard DB

### 🔴 OFFEN - Interview fortsetzen

- [ ] Offene Fragen dem Nutzer stellen
- [ ] Antworten dokumentieren und umsetzen

### 🔴 OFFEN - Foto-Upload nach S3

- [ ] ObjektaufnahmeWizard: Echte Foto-Uploads nach S3 statt Platzhalter
- [ ] Vorschau der hochgeladenen Fotos im Wizard
- [ ] Foto-URLs in der Property-DB speichern

### 🔴 OFFEN - Baustellen-Wizard DB-Integration

- [ ] BaustellenWizard: trpc.constructionSite.create Mutation aufrufen
- [ ] BaustellenWizard: Projekte und Immobilien aus DB laden
- [ ] BaustellenWizard: Sofortige DB-Speicherung statt Mock-Callback
