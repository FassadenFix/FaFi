# FaFi PM – Kontext für Todo-Überarbeitung

## Was ist FaFi PM?
FaFi PM (FassadenFix Projektmanager) ist ein internes Projektmanagement-Tool für die Firma FassadenFix, die professionelle Fassadenreinigung anbietet. Es verwaltet den gesamten Lebenszyklus eines Projekts: von der Kundenakquise über Objektaufnahme, Angebotserstellung, Auftragsabwicklung, Baustellenmanagement bis zur Abnahme und Garantie.

## Aktueller technischer Stand
- **Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)
- **28 DB-Tabellen:** users, companies, contacts, projects, properties, constructionSites, offers, tasks, activityLogs, constructionSiteLogs, teamleiterChecks, dashboardWidgets, notifications, customerPortalTokens, calendarEvents, documents, textBlocks, offerTemplates, emailTemplates, orders, warranties, appointments, invoices, payments, budgets, customerReports, teamMembers, syncStatus
- **29 tRPC-Router:** company, contact, project, property, constructionSite, offer, task, activityLog, notification, dashboard, calendar, teamleiterCheck, weather, document, textBlock, offerTemplate, emailTemplate, user, hubspot, email, order, warranty, appointment, invoice, payment, budget, customerReport, teamMember, projectFilter, constructionSiteFilter
- **35+ Seiten/Routen** implementiert
- **215 Unit-Tests** bestanden
- **HubSpot-Integration:** 100 Unternehmen, 100 Kontakte synchronisiert

## Was bereits funktioniert (DB-angebunden, nicht nur Mockup):
- Dashboard mit echten KPIs, Kanban, Aktivitätslog, Meine-Aufgaben-Widget
- ProjektWizard → speichert direkt in DB
- ObjektaufnahmeWizard → speichert in DB, Entwurfs-Funktion
- AngebotWizard → speichert via saveFromWizard, Versionierung mit obsolet-Status
- Auftrag-Annahme-Wizard → erstellt Auftrag + Baustelle + Aufgaben
- Abnahme-Wizard → Protokoll, Garantie, Rechnung
- Alle Detail-Seiten (Projekt, Auftrag, Rechnung, Garantie) mit Tiefenverknüpfung
- Rollenbasierte Sidebar (GF, Kundenberater, AT-Leiter, Projektleiter, Büro)
- Zentrales Dokumenten-Archiv mit Verknüpfungen
- PDF-Export für Angebote (CI-konform)
- HubSpot-Sync (Unternehmen, Kontakte, Deals – aktuell nur HubSpot→FaFi)

## Interview-Erkenntnisse (Fragen 1-6) – Neue Anforderungen

### 1. HubSpot-Anbindung (BIDIREKTIONAL)
- Bidirektionaler Sync: HubSpot → FaFi (Unternehmen, Kontakte, Deals) UND FaFi → HubSpot (Projektstatus, Angebotsstatus, Deal-Updates)
- Fester API-Key über Private App, KEIN OAuth pro Nutzer
- Nachvollziehbarkeit über FaFi-Aktivitätslog
- Keine zusätzlichen HubSpot-Lizenzen nötig

### 2. E-Mail-Versand über Microsoft 365
- SSO über Microsoft 365 (Entra ID) für Mitarbeiter-Login
- E-Mail-Versand über Microsoft Graph API im Namen des jeweiligen Mitarbeiters
- Ablauf: Template vorgefüllt → Vorschau mit Bearbeitungsmöglichkeit → Bestätigung → Versand
- E-Mail erscheint in Outlook "Gesendete Elemente" des Mitarbeiters
- Jede versendete E-Mail wird vollständig im Aktivitätslog protokolliert (Empfänger, Betreff, Inhalt, Anhänge, Zeitstempel, Absender)

### 3. Foto-Upload
- Einfacher Upload mit Beschreibungstext, KEINE Schadensmarkierungen in dieser Phase
- Automatische Dateibenennung: Kontext_Unternehmen_Adresse_Gebäudeseite_Kategorie_Nummer.jpg
- Kategorien: Übersicht, Schaden, Detail, Vorher, Nachher
- Beschreibungstext automatisch vorausgefüllt
- Schadensfotos nur bei Bedarf
- Originale in voller Auflösung speichern (versicherungsrelevant), Thumbnails für Vorschau

### 4. Baustellen-Manager (KOMPLETT NEUES VERSTÄNDNIS)
- Teamstruktur: 4 Personen (Teamleiter + AT, Projektleiter/Stellvertreter + AT)
- Teamleiter bekommt Projekt zugewiesen, Projekt = mehrere Baustellen/Immobilien
- Ablauf:
  1. Vorher-Dokumentation (PFLICHT-Wizard pro Immobilie, erst danach Baustellenstart möglich)
  2. Morgens: "Arbeitstag beginnen" + Planungsfrage
  3. Tagsüber: Ereignismelder jederzeit verfügbar (Schaden, Sicherheitsvorfall, Geräteausfall etc.)
  4. Abends: "Arbeitstag beenden" + Logbuch-Ergebnisse + erreichte Bereiche + Planungsfrage + Witterung (9/13/17 Uhr)
  5. Bautagebuch-Eintrag automatisch aus Abschlussmeldung

### 5. Kundenportal (KOMPLETT NEUES VERSTÄNDNIS)
- Kunde = UNTERNEHMEN (nicht Kontakt/Ansprechpartner)
- Jedes Unternehmen hat EINEN zentralen Zugang
- Startseite: Aktuelles Projekt direkt in Detailansicht
- AMPEL-SYSTEM statt Fortschrittsbalken (Grün/Gelb/Rot pro Phase)
- Jede Baustelle hat eigene Ampel
- Aufgaben mit Unterscheidung: Auftraggeberseite vs. Auftragnehmerseite
- Dokumente auf 3 Ebenen: Projektbezogen, Baustellenbezogen, Allgemeine FassadenFix-Dokumente
- Login im zweiten Schritt, erstmal Token-basierter Zugang
- Mieter/Bewohner-Portal ist separates Thema (später)

### 6. Rollenkonzept
- MVP: Sichtbarkeit der Menüpunkte als Berechtigungssteuerung (bereits implementiert)
- Feingranulare Aktions-Berechtigungen im zweiten Schritt
- Architektur vorbereitet (fafiRole im Backend-Kontext)

## Was noch OFFEN ist (aus alter Todo):
- HubSpot bidirektionaler Sync (FaFi → HubSpot)
- E-Mail-Versand (aktuell nur Manus Notification API, soll Microsoft Graph werden)
- Foto-Upload nach S3 (ObjektaufnahmeWizard, Baustellen-Logbuch)
- Baustellen-Wizard DB-Integration
- PDF-Generatoren für Rechnungen und Garantien
- Code-Audit & Bereinigung
- E2E-Tests
- HubSpot-Sync-Button im Dashboard
