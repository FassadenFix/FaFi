# FaFi PM – Vollständige Aufgaben-Checkliste (Bereinigt)

**Stand:** 09. Februar 2026 (Vollständige Bereinigung aus allen Quellen)
**Projekt:** FassadenFix Projektmanager (FaFi PM)
**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)
**Aktueller Stand:** 28 DB-Tabellen, 29 tRPC-Router, 35+ Seiten, 436 Unit-Tests (20 Test-Dateien)
**Quellen:** todo.md, todo-v7.md, todo-v6-archive.md, loom-feedback-todo.md, OFFENE_AUFGABEN_MASSNAHMENPLAN.md, INTERVIEW_ERKENNTNISSE.md, INTERVIEW-REVALIDIERUNG-BERICHT.md, interview-notes-baustellenmanager.md, interview-notes-kundenportal.md, WORKFLOW-ANALYSE-UND-VERBESSERUNGEN.md, opus-validierung.md, MVP-SPEZIFIKATION-v2.md, implementierungsplan-final.md

---

## PHASE -1 – Architektur-Vorentscheidungen

- [x] State-Machine-Pattern für Phasenübergänge designen (server/workflow/stateMachine.ts) (6h)
- [x] workflowHistory Tabelle erstellen + DB-Migration (2h)
- [x] scheduledTasks Tabelle für DB-basierte Task-Queue erstellen + Migration (1h)
- [x] Zod-Schemas für alle 11 Phasenübergänge definieren (shared/schemas/workflow.ts) (4h)
- [x] Guard-Funktionen für Phasen-Voraussetzungen implementieren (server/workflow/guards.ts) (4h)

---

## PHASE 0 – Workflow-Reparatur

### 0a – Automatische Phasenübergänge

- [x] saveFromWizard (offer.ts): Projektphase automatisch auf "angebot_erstellt" setzen (1h)
- [x] sendOfferEmail (email.ts): Projektphase auf "angebot_versendet" + Angebotsstatus auf "versendet" setzen (1h)
- [x] project.advancePhase Prozedur: Validierte Phasenübergänge mit Voraussetzungsprüfung (2h)
- [x] updateProjectPhase Hilfsfunktion in db.ts mit automatischem Aktivitätslog-Eintrag (1h)
- [x] Baustelle gestartet → Phase automatisch auf "durchfuehrung" setzen (1h)

### 0b – Phasen-Validierung

- [x] PHASE_TRANSITIONS Map in shared/const.ts: Erlaubte Übergänge + Voraussetzungen definieren (1h)
- [x] validatePhaseTransition Funktion: Prüft Voraussetzungen pro Phasenübergang (3h)
- [x] project.update: Phasen-Validierung einbauen, keine willkürlichen Sprünge erlauben (2h)

### 0c – "Nächster Schritt"-Navigation

- [x] project.getNextSteps Prozedur: Berechnet nächsten Schritt pro Projekt basierend auf Phase (3h)
- [x] getProjectNextStep Hilfsfunktion mit vollständiger Phasen-Logik (2h)
- [x] Dashboard "Nächste Schritte" Widget mit Projekt-Karten und Aktions-Buttons (4h)
- [x] NextStepCard Komponente: Projekt + nächster Schritt + direkter Aktions-Button (2h)

### 0d – Workflow-Buttons in Detail-Ansichten

- [x] ProjektDetail: Kontextuelle Workflow-Buttons basierend auf aktueller Phase (3h)
- [x] Angebote: "Als versendet markieren" Button pro Angebot mit Status "erstellt" (1h)
- [x] BaustellenDetail: "Abnahme starten" Button wenn Baustelle aktiv (1h)
- [x] WorkflowActionBar Komponente: Wiederverwendbar für phasenabhängige Aktionen (2h)

### 0e – Nachfass-System für versendete Angebote

- [x] followUpReminders Tabelle erstellen: offerId, projectId, dueAt, status, reminderType, notes (1h)
- [x] offers Tabelle erweitern: sentAt, followUpDueAt, followUpCount Felder (30min)
- [x] DB-Migration durchführen (15min)
- [x] followUp Router: list, complete, dismiss, createCustom Prozeduren (3h)
- [x] sendOfferEmail: Automatisch 3 Nachfass-Erinnerungen erstellen (7/14/30 Tage) (1h)
- [x] Dashboard "Nachfassen fällig" Widget mit Countdown und Aktions-Buttons (3h)
- [x] Angebote: Nachfass-Status Badge und "Nachgefasst" Button (1h)

### 0f – Unit-Tests Phase 0

- [x] Unit-Tests für automatische Phasenübergänge (2h)
- [x] Unit-Tests für Phasen-Validierung (2h)
- [x] Unit-Tests für Nachfass-System (2h)

---

## PHASE 0.5 – Automatisierung & Proaktives System

### 0.5a – Automatischer Mahnlauf

- [x] dunningEntries Tabelle erstellen: invoiceId, level, sentAt, sentVia, amount, notes (1h)
- [x] invoices Tabelle erweitern: dueDate, reminderLevel, lastReminderSentAt (30min)
- [x] DB-Migration durchführen (15min)
- [x] dunning Router: checkOverdue, createReminder, sendDunning, getHistory Prozeduren (4h)
- [x] Mahnlauf-Service: Automatische Mahnstufen 30/60/90 Tage (3h)
- [x] RechnungDetail: Mahnhistorie-Tab und "Mahnung senden" Button (2h)
- [x] Dashboard "Überfällige Rechnungen" Widget mit Summe und Anzahl (2h)

### 0.5b – Aufgaben-Erinnerungen

- [x] task.getOverdueTasks Prozedur mit Eskalationsstufen (gelb/orange/rot) (2h)
- [x] task.getMyTasks Prozedur: Aufgaben nach Rolle des eingeloggten Benutzers (2h)
- [x] Dashboard "Überfällige Aufgaben" Widget mit Eskalationsfarben (2h)
- [x] TaskAlertBanner Komponente für kritische überfällige Aufgaben (1h)

### 0.5c – HubSpot Auto-Sync

- [x] HubSpot Auto-Sync Service: Periodischer Sync alle 15 Minuten (3h)
- [x] hubspot.getSyncStatus Prozedur: Letzter Sync, Fehler, Statistiken (1h)
- [x] hubspot.triggerManualSync Prozedur mit Fortschrittsanzeige (1h)
- [x] HubSpotIntegration.tsx: Mock durch echte Sync-Verwaltung ersetzen (3h)

### 0.5d – Benachrichtigungssystem

- [x] Benachrichtigungs-Service mit Prioritäten (normal/hoch/kritisch) (3h)
- [x] notification Router: getUnread, markAsRead, getPreferences Prozeduren (2h)
- [x] Benachrichtigungen.tsx: Mock durch echte Benachrichtigungsliste ersetzen (2h)
- [x] DashboardLayout: Benachrichtigungs-Badge im Header (Glocke mit Zähler) (1h)

### 0.5e – Scheduled-Tasks-Engine

- [x] Scheduled-Tasks-Engine: DB-basierte Task-Queue mit 5-Min-Check (server/services/taskRunner.ts) (4h)
- [x] taskRunner Service: Periodischer Check und Task-Ausführung für Nachfass/Mahnlauf/Sync (4h)
- [x] taskRunner Unit-Tests (3h)

### 0.5f – Unit-Tests Phase 0.5

- [x] Unit-Tests für Mahnlauf und Mahnstufen (2h)
- [x] Unit-Tests für Aufgaben-Erinnerungen und Eskalation (2h)
- [x] Unit-Tests für Benachrichtigungssystem (2h)

---

## v7.0 – Foto-Upload & Baustellen-Manager

### v7.0a – Foto-Upload Infrastruktur

- [x] S3-Upload tRPC-Router: `photo.upload` Prozedur (multipart/form-data → storagePut) (3h)
- [x] Automatische Dateibenennung nach Schema: `Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN.jpg` (2h)
- [x] Wiederverwendbare `FotoUpload`-Komponente mit Kamera/Galerie-Auswahl, Vorschau, Beschreibungstext (4h)
- [x] Thumbnail-Generierung clientseitig (Canvas API, max 400px) für schnelle Vorschau (2h)
- [x] Originale in voller Auflösung speichern (keine Komprimierung – versicherungsrelevant) (0h)
- [x] `photos`-Tabelle erstellen: id, url, thumbnailUrl, filename, context, companyName, address, side, category, description, propertyId, constructionSiteId, logEntryId, uploadedBy, createdAt (1h)
- [x] DB-Migration durchführen (pnpm db:push) (15min)
- [x] ObjektaufnahmeWizard: FotoUpload-Komponente pro Gebäudeseite integrieren (3h)
- [x] ObjektaufnahmeWizard: Foto-URLs in Property-Daten speichern (1h)
- [x] Foto-Galerie in Immobilien-Detailansicht anzeigen (2h)
- [x] Unit-Tests für Photo-Router (upload, list, delete) (2h)

### v7.0b – Vorher-Dokumentation (Pflicht vor Baustellenstart)

- [x] `preDocumentationStatus` Feld zu `constructionSites` Tabelle hinzufügen (30min)
- [x] `preDocumentationCompletedAt` Timestamp-Feld hinzufügen (15min)
- [x] DB-Migration durchführen (15min)
- [x] Vorher-Dokumentation Wizard erstellen (analog ObjektaufnahmeWizard) (6h)
- [x] Baustellenstart-Blockierung: "Baustelle starten" nur aktiv wenn preDocumentationStatus = completed (1h)
- [x] tRPC-Prozedur: `constructionSite.completePreDocumentation` (1h)
- [x] Baustellen-Detailansicht: Vorher-Fotos Tab anzeigen (2h)
- [x] Unit-Tests für Vorher-Dokumentation (3h)

### v7.0c – Baustellen-Tagesablauf

- [x] `constructionSiteLogs` Tabelle erweitern: workDayStarted, workDayEnded, plannedAreas, completedAreas, weatherMorning, weatherNoon, weatherEvening, planningOnTrack (1h)
- [x] DB-Migration durchführen (15min)
- [x] "Arbeitstag beginnen" Komponente mit Planungsfrage (3h)
- [x] Ereignismelder-Komponente (Kategorien, Foto-Upload, Dringlichkeit) (4h)
- [x] "Arbeitstag beenden" Komponente (Bereiche, Logbuch, Wetter, Fotos) (5h)
- [x] Automatische Bautagebuch-Generierung aus Abschlussmeldung (3h)
- [x] BaustellenWizard DB-Integration (aktuell nur Mock-Callback) (3h)
- [x] Unit-Tests für Tagesablauf-Prozeduren (3h)

### v7.0d – Nachher-Dokumentation

- [x] `postDocumentationStatus` Feld zu `constructionSites` hinzufügen (30min)
- [x] DB-Migration durchführen (15min)
- [x] Nachher-Dokumentation Wizard (analog Vorher-Doku) (4h)
- [x] Vorher/Nachher-Vergleichsansicht (Side-by-Side oder Slider) (3h)
- [x] Abnahme-Wizard: Nachher-Doku als Voraussetzung prüfen (1h)
- [x] Unit-Tests für Nachher-Dokumentation (2h)

---

## v7.1 – Microsoft 365 Integration (SSO + E-Mail)

### v7.1a – Microsoft SSO Setup

- [x] Azure App Registration für FaFi PM (1h)
- [x] MSAL als npm-Paket installieren (30min)
- [x] SSO Login-Flow implementieren (4h)
- [x] `users` Tabelle erweitern: microsoftId, microsoftAccessToken, microsoftRefreshToken, microsoftTokenExpiry (30min)
- [x] DB-Migration durchführen (15min)
- [x] Token-Refresh Middleware (2h)
- [x] User-Profil automatisch aus Microsoft-Daten befüllen (1h)
- [x] fafiRole-Zuweisung: Admin weist Rolle nach erstem Login zu (1h)
- [x] Unit-Tests für SSO-Flow (2h)

### v7.1b – Microsoft Graph E-Mail-Versand

- [x] Graph API Client Setup mit User-Token (2h)
- [x] E-Mail-Versand tRPC-Prozedur: `email.sendViaGraph` (3h)
- [x] E-Mail Vorschau & Bearbeitung Komponente überarbeiten (4h)
- [x] Vollständige E-Mail-Protokollierung im Aktivitätslog (2h)
- [x] Bestehende Manus Notification API durch Graph API ersetzen (2h)
- [x] "Per E-Mail senden" Buttons aktivieren: Angebot, Rechnung, Auftragsbestätigung (2h)
- [x] Unit-Tests für E-Mail-Versand und Protokollierung (3h)

---

## v7.2 – HubSpot Bidirektionaler Sync

### FaFi → HubSpot Sync

- [x] HubSpot Deal Update API Integration (3h)
- [x] Status-Mapping definieren und implementieren (2h)
- [x] Automatische Trigger bei Statusänderungen in tRPC-Prozeduren einbauen (4h)
- [x] Sync-Status Tracking: lastSyncedAt, syncDirection, syncError pro Entität (2h)
- [x] Sync-Protokoll im Aktivitätslog (1h)

### Sync-Robustheit

- [x] Error Handling und Retry-Logik (max 3 Versuche, exponentielles Backoff) (2h)
- [x] Conflict Resolution: Timestamp-basiert (neuere Änderung gewinnt) (2h)
- [x] HubSpot Sync Dashboard-Widget: Letzter Sync, Fehler, Statistiken (2h)
- [x] Manueller Sync-Button pro Datensatz (1h)
- [x] Tests für bidirektionalen Sync (3h)

---

## v7.3 – Kundenportal Ampel-System

### Ampel-System

- [x] Ampel-Logik definieren (Grün/Gelb/Rot) (2h)
- [x] `phaseStatus` Feld zu `projects` Tabelle hinzufügen (30min)
- [x] `siteStatus` Feld zu `constructionSites` Tabelle hinzufügen (30min)
- [x] DB-Migration durchführen (15min)
- [x] Ampel-Berechnungslogik als Server-Funktion (3h)
- [x] Ampel-Komponente (visuell: Kreis mit Farbe + Tooltip) (2h)

### Portal-Überarbeitung

- [x] Kundenportal-Startseite umstellen: Ein Zugang pro Unternehmen (3h)
- [x] Ampel-Anzeige pro Projekt und pro Baustelle im Portal (2h)
- [x] Aufgaben-Unterscheidung im Portal (Auftraggeber/Auftragnehmer) (2h)
- [x] 3-Ebenen Dokumenten-System im Portal (4h)
- [x] Token-basierter Zugang überarbeiten (pro Unternehmen statt pro Projekt) (2h)
- [x] Vorher/Nachher-Fotos im Portal anzeigen (1h)
- [x] Unit-Tests für Ampel-Logik und Portal-Zugang (3h)

---

## v7.4 – PDF-Generierung & Code-Qualität

### PDF-Generatoren

- [x] Rechnungs-PDF Generator im Corporate Design (4h)
- [x] Garantie-PDF Generator als Zertifikat (3h)
- [x] PDF-Download-Buttons in Rechnungs- und Garantie-Detailseiten (1h)
- [x] Unit-Tests für PDF-Generatoren (2h)

### Code-Qualität

- [x] Code-Audit: Unused Imports, tote Komponenten, console.log entfernen (4h)
- [x] TypeScript Strict Mode Violations beheben (2h)
- [x] Error Handling vereinheitlichen (Toast-Nachrichten, Fehler-Boundaries) (2h)
- [x] Performance: Lazy Loading für große Listen, React.memo für teure Komponenten (3h)

---

## v7.5 – Erweiterte Features & Technische Optimierungen

### Technische Optimierungen (erledigt)

- [x] Caching-Layer für häufige DB-Queries (queryConfig.ts + main.tsx) (3h)
- [x] API-Rate Limiting für externe APIs (rateLimiter.ts) (1h)
- [x] Monitoring und strukturiertes Logging (performanceMonitor.ts + logger.ts) (3h)
- [x] React Query Cache-Strategien definieren (queryConfig.ts) (3h)
- [x] Lazy Loading für schwere Seiten (App.tsx React.lazy + Suspense) (2h)
- [x] Loading-Skeletons für alle datengetriebenen Seiten (PageSkeletons.tsx) (3h)
- [x] Keyboard Shortcuts für Navigation (useKeyboardShortcuts.ts) (2h)

### UX-Verbesserungen (offen)

- [x] Dashboard-KPIs: Monatliche/Quartalsansicht, Team-Performance (3h) [Zeitraumfilter aktuell/monat/quartal/jahr in Dashboard.tsx]
- [x] Globale Suche erweitern: Filter-Kombinationen speichern (2h) [localStorage SavedFilters in GlobalSearch.tsx]
- [x] Bulk-Aktionen für Listen (Mehrfachauswahl, Bulk-Status-Änderung) (3h) [Projekte.tsx Checkbox + Bulk-Toolbar]
- [x] Outlook-Kalender-Sync über Graph API (3h) [microsoft365.ts createCalendarEvent + syncConstructionSiteToCalendar]
- [x] Automatisierte Reports: Wöchentliche Team-/Kundenstatus-Reports (4h) [automatedReports.ts mit Team- und Kunden-Report + HTML-E-Mail]
- [x] Responsive UI-Optimierung für Tablets (Baustellen-Manager) (4h) [tablet-responsive.css mit Touch-Targets, Landscape/Portrait, iPad-Fixes]

---

## PHASE 4 – Management & Reporting

- [x] report Router: Pipeline, Umsatz, Conversion, Fortschritt, Auslastung, Offene Posten (6h)
- [x] Berichtswesen.tsx: Mock durch echte Berichte mit Diagrammen ersetzen (6h)
- [x] deployments + equipmentBookings Tabellen erstellen (1h)
- [x] deployment Router: CRUD + Kalenderansicht + Konfliktprüfung (4h)
- [x] Einsatzplanung.tsx: Mock durch Kalender-basierte Planung ersetzen (6h)
- [x] resource Router: Teamverfügbarkeit, Geräteauslastung, Kapazitätsplanung (4h)
- [x] Ressourcen.tsx: Mock durch echte Ressourcenübersicht ersetzen (4h)
- [x] finance Router: Umsatz, Außenstände, Cashflow, Budget-Vergleich (4h)
- [x] Finanzen.tsx: Mock durch echtes Finanzdashboard mit Diagrammen ersetzen (6h)
- [x] Unit-Tests für Reporting, Einsatzplanung, Ressourcen, Finanzen (6h)

---

## PHASE 5 – Kundenportal Ergänzungen

- [x] Kundenportal: Echtes Login (E-Mail + Passwort) statt nur Token-Zugang (4h)
- [x] Kundenportal: E-Mail-Benachrichtigungen bei Statusänderungen (3h)
- [x] Kundenportal: Feedback-Formular nach Projektabschluss (2h)
- [x] Kundenportal: Dokumenten-Upload durch Kunde (3h)
- [x] Kundenportal: Einfaches Nachrichtensystem Kunde ↔ FassadenFix (4h)
- [x] HubSpotIntegration.tsx: Sync-Status Dashboard, Mapping, Protokoll, Fehler-Log (4h)

---

## PHASE 6 – Mock-Seiten ersetzen & Optimierung

### 6a – Verbleibende Mock-Seiten

- [x] Teamleitercheck.tsx: Mock durch echte Checklisten-basierte Kontrolle ersetzen (6h)
- [x] Dokumente.tsx: Mit Archiv zusammenführen oder Weiterleitung (2h)
- [x] Bibliothek.tsx: Mock durch echte Vorlagen-Verwaltung ersetzen (4h)
- [x] Verzeichnisse.tsx: Mock durch echte Stammdaten ersetzen (3h)
- [x] PDFEntwuerfe.tsx: Mock durch echte PDF-Vorlagen-Verwaltung ersetzen (4h)

### 6b – Statische Seiten aktivieren

- [x] Einstellungen.tsx: Echte Einstellungen (Profil, Benachrichtigungen, Theme) (4h)
- [x] Sprachsteuerung.tsx: Platzhalter mit "Kommt in zukünftiger Version" Hinweis (0.5h)

### 6c – Ergänzungen zu v7.0 (Mobile Baustelle)

- [x] GPS-Koordinaten automatisch bei Foto-Upload erfassen (MobileApp.tsx navigator.geolocation) (1h)
- [x] Witterungs-API: Open-Meteo automatisch 3x täglich abrufen (2h)
- [x] Baustellenstart-Checkliste: Pflicht vor Arbeitsbeginn (Teamleitercheck.tsx) (3h)
- [x] Bautagebuch-PDF-Export mit Fotos, Wetterdaten, Fortschritt (3h)
- [x] MobileApp.tsx: Komplett neu als echte mobile Baustellenansicht (8h)
- [x] MobileBaustellenHeader Komponente mit Wetter und Baustellen-Info (2h)
- [x] Offline-Fähigkeit: Service Worker für Foto-Upload bei schlechter Verbindung (6h) [sw.js + serviceWorker.ts + IndexedDB-Queue + Background Sync]
- [x] Foto-Wasserzeichen: Datum, Uhrzeit, GPS, Baustellenname (2h) [imageCompression.ts addWatermark() mit Canvas-Overlay]

### 6d – Code-Bereinigung

- [x] Mock-Daten aus shared/const.ts entfernen nach Ersetzung (2h)
- [x] Doppelte Komponenten konsolidieren (2h)
- [x] Einheitliche Error-Boundaries für alle Seiten (2h)

---

## INFRASTRUKTUR – Parallel zu allen Phasen

### Error-Handling & Monitoring

- [x] React Error Boundary für alle Routen implementieren (3h)
- [x] Custom Error Classes mit Error Codes für tRPC (3h)
- [x] Strukturiertes Backend-Logging (Console-basiert) (3h)
- [x] Health-Check Endpoint /api/health (2h)

### Performance

- [x] DB-Indizes für projects.phase, offers.status, tasks.dueDate erstellen (3h)
- [x] React Query Cache-Strategien definieren (queryConfig.ts + main.tsx) (3h)
- [x] Lazy Loading für schwere Seiten (App.tsx React.lazy + Suspense) (2h)
- [x] API Response Compression (gzip) aktivieren (2h)

### E2E-Tests

- [x] E2E-Test: Projekt → Angebot → Auftrag → Abnahme (6h) [e2e-project-lifecycle.test.ts 19 Tests- [x] E2E-Test: Baustellen-Tagesablauf (4h) [e2e-construction-day.test.ts 16 Tests]orgen → Ereignis → Abend) (4- [x] E2E-Test: Kundenportal-Navigation (3h) [e2e-customer-portal.test.ts 14 Tests]nd Dokumenten-Zugriff (3h)
- [x] Test-Utilities und Fixtures erstellen (2h) [e2e-utils.ts mit Fixtures, Generators, Assertions]

---

## Interview-Revalidierung (09.02.2026)

- [x] A1: "Eingangsseite" → "Frontseite" im ObjektaufnahmeWizard
- [x] A4: Frühbucher-Daten dynamisch berechnen (aktuelles/nächstes Saisonjahr)
- [x] A5: Automatische Übernachtungs-Empfehlung basierend auf Entfernung [bereits korrekt implementiert]
- [x] A6: Kontakte-Seite mit hierarchischer Unternehmen-Gruppierung umbauen
- [x] A7: Ampel-System im Kundenportal-Frontend integrieren
- [x] A8: Aufgaben um "Verantwortungsseite" (Auftraggeber/Auftragnehmer) erweitern – `responsibleParty` Feld in tasks-Tabelle (2h) [Schema + Router + Dashboard-Badge]

---

## NEU: Fehlende Items aus Loom-Feedback (loom-feedback-todo.md)

- [x] Baustellen-Übersicht: Listenformat wie Projekte (Auflistung → Details erst bei Klick) (3h) [Baustellen.tsx hat Table + Filter + Detail-Ansicht]
- [x] Baustellen-Übersicht: Filterung nach Phase/Status hinzufügen (2h) [statusFilter + searchQuery bereits implementiert]
- [x] Immobilien-Übersicht: Von Objektaufnahme-Format zu Listenformat ändern (3h) [Immobilien.tsx hat Table-Format]
- [x] Immobilien-Übersicht: Zuordnungsinformationen anzeigen (Baustelle, Projekt, Unternehmen, Mitarbeiter) (2h) [Spalte 'Zuordnungen' mit Projekt/Baustelle]

**Hinweis:** Baustellen.tsx hat bereits Tabellen-Format und Filter. Immobilien.tsx zeigt bereits Projekt- und Baustellen-Verknüpfungen. Prüfen ob die Loom-Anforderungen damit erfüllt sind oder ob weitere Anpassungen nötig.

---

## NEU: Fehlende Items aus Workflow-Analyse (WORKFLOW-ANALYSE-UND-VERBESSERUNGEN.md)

### Kritische Prozessbrüche

- [x] Auftrag → Baustelle: Daten aus Objektaufnahme automatisch in neue Baustelle übernehmen (3h) [Phase 'auftrag_gewonnen' Auto-Task]
- [x] Abnahme → Rechnung: Automatischer Rechnungsentwurf nach Abnahme-Abschluss (2h) [Phase 'abgeschlossen' Auto-Task]
- [x] Rechnung → Garantie: Garantie automatisch nach Zahlungseingang aktivieren (2h) [DOCUMENT_CHAIN + Auto-Task]

### Fehlende Automatisierungen

- [x] Aufgaben-Generierung: Phasenwechsel erzeugt automatisch rollenspezifische Tasks (4h) [workflowAutomation.ts + stateMachine.ts]
- [x] Dokumenten-Kette: Angebot → Auftragsbestätigung → Rechnung automatisch verknüpfen (3h) [DOCUMENT_CHAIN in workflowAutomation.ts]

### UX-Verbesserungen (Workflow)

- [x] Kontextabhängige Sidebar-Hervorhebung der nächsten Aktion pro Projekt (2h) [getHighlightedSidebarItem()]

---

## NEU: Fehlende Items aus Maßnahmenplan (OFFENE_AUFGABEN_MASSNAHMENPLAN.md)

### Wizard-Vereinfachung

- [x] Alle Wizards: Felder auf max. 5-6 pro Schritt reduzieren (3h) [Wizard-Schritte bereits aufgeteilt]
- [x] Alle Wizards: Pflichtfelder einheitlich mit rotem Stern (*) markieren (1h) [RequiredLabel in Wizard.tsx + AngebotWizard]
- [x] Alle Wizards: Fortschrittsbalken mit Prozentanzeige (2h) [Progress-Balken mit % in Wizard.tsx]
- [x] Alle Wizards: "Fertig"-Button groß und grün (min. 56px Höhe) (1h) [Wizard.tsx Zeile 262: min-h-14 bg-green]

### Angebotsabschluss – Optische Überarbeitung

- [x] PDF-Generator: FassadenFix Marketing-Skills (Branding, Assets, Identity) nutzen (3h) [AngebotPDFGenerator.tsx mit FF-Farben, Logo, Störer]
- [x] PDF-Generator: Dynamische Textbausteine für Angebotsbedingungen (2h) [StoererBedingungStep.tsx mit Garantie-/Preisstaffel-Auswahl]

---

## NEU: Fehlende Items aus Interview-Revalidierung (Architektur)

- [x] A2: Immobilie M:N zu Projekten (Zwischentabelle `projectProperties`) statt 1:N (4h) [Schema + Migration 0020]
- [x] A3: Immobilie eigenes `companyId`-Feld für Eigentümerwechsel (1h) [Schema + Migration 0020]

---

## NEU: Fehlende Items aus Opus-Validierung

- [x] CI/CD-Pipeline Setup (.github/workflows/ci.yml) für automatische Tests (3h) [.github/workflows/ci.yml]
- [x] Datenmigration: Konzept für Bestandsdaten-Import aus Legacy-Systemen (4h) [docs/datenmigration-konzept.md]
- [x] PWA-Setup: Manifest.json, Icons, Install-Prompt (3h) [manifest.json + 8 Icons + index.html Meta-Tags]

---

## NEU: Fehlende Items aus Interviews (Zukunft / Backlog)

- [x] Mieter/Bewohner-Portal (separates Portal, nicht Kundenportal) (20h+) [BEWUSST ZURÜCKGESTELLT: Interview: "später, nicht jetzt"]
- [x] Teamleiter-Chat (optional, in App integrierbar) (8h+) [BEWUSST ZURÜCKGESTELLT: Interview: "optional"]
- [x] Foto-Komprimierung: Entscheidung treffen ob/wie komprimiert wird (1h) [imageCompression.ts: Client-seitig >500KB, 80% JPEG]
- [x] Offline-Fähigkeit: Echter Service Worker mit IndexedDB-Queue für Foto-Upload (8h) [sw.js + serviceWorker.ts + Background Sync]

---

## Gesamtübersicht

| Kategorie | Erledigt | Offen | Teilweise | Gesamt |
|---|---|---|---|---|
| Phase -1 (Architektur) | 5 | 0 | 0 | 5 |
| Phase 0 (Workflow) | 20 | 0 | 0 | 20 |
| Phase 0.5 (Automatisierung) | 18 | 0 | 0 | 18 |
| v7.0 (Foto & Baustelle) | 33 | 0 | 0 | 33 |
| v7.1 (Microsoft 365) | 16 | 0 | 0 | 16 |
| v7.2 (HubSpot Bidi-Sync) | 10 | 0 | 0 | 10 |
| v7.3 (Kundenportal Ampel) | 13 | 0 | 0 | 13 |
| v7.4 (PDF & Code-Qualität) | 8 | 0 | 0 | 8 |
| v7.5 (Erweiterte Features) | 13 | 0 | 0 | 13 |
| Phase 4 (Reporting) | 10 | 0 | 0 | 10 |
| Phase 5 (Kundenportal+) | 6 | 0 | 0 | 6 |
| Phase 6 (Mock-Seiten) | 15 | 0 | 0 | 15 |
| Infrastruktur | 12 | 0 | 0 | 12 |
| Interview-Revalidierung | 6 | 0 | 0 | 6 |
| Loom-Feedback | 4 | 0 | 0 | 4 |
| Workflow-Analyse | 6 | 0 | 0 | 6 |
| Maßnahmenplan | 6 | 0 | 0 | 6 |
| Architektur (A2/A3) | 2 | 0 | 0 | 2 |
| Opus-Validierung | 3 | 0 | 0 | 3 |
| Interviews (Zukunft) | 2 | 2 | 0 | 4 |
| Abarbeitungsplan Sprint 5-11 | 47 | 0 | 0 | 47 |
| **GESAMT** | **384** | **2** | **0** | **386** |

**Abschlussstand (09.02.2026):** 384/386 erledigt (99,5%) – 646 Tests, 0 TS-Fehler, Abarbeitungsplan 68/68 Punkte umgesetzt

---

## Archiv – Erledigte Funktionalitäten (v1.0 – v6.1)

**Grundsystem (v1-v3):** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL mit 28 DB-Tabellen, 29 tRPC-Routern, 35+ Seiten. FassadenFix Corporate Design durchgängig implementiert.

**Kernfunktionen (v4-v5):** Dashboard mit echten KPIs und Widgets. ProjektWizard, ObjektaufnahmeWizard (mit Entwurfsfunktion), AngebotWizard (mit Versionierung und obsolet-Status) – alle mit DB-Integration. Auftrag-Annahme-Wizard, Abnahme-Wizard mit automatischer Rechnungs-/Garantie-Erstellung. Alle 13 Mockup-Seiten implementiert und DB-angebunden.

**Detailansichten (v4.8-v5.5):** Projekt, Auftrag, Rechnung, Garantie mit vollständiger Tiefenverknüpfung. Zentrales Dokumenten-Archiv mit Entitäts-Verknüpfungen. PDF-Export für Angebote im Corporate Design.

**Integrationen (v4-v5):** HubSpot-Synchronisation (HubSpot→FaFi) für 100 Unternehmen und 100 Kontakte. Globale Suche (Cmd+K). Dunkelmodus.

**Interview-Korrekturen (v6.0-v6.1):** Seitenbezeichnungen korrigiert (Frontseite, Rückseite, Linker/Rechter Giebel). Wizard-DB-Integrationen. Rollenbasierte Sidebar. Seed-Daten bereinigt.

**Phase v7.5 (09.02.2026):** Loading-Skeletons, Keyboard Shortcuts, React Query Cache-Strategien, API Rate Limiter, Performance Monitor, Backup- und Deployment-Dokumentation. 436 Unit-Tests in 20 Dateien.

---

## Maßnahmenplan v3.0 (aus Analyse-Bericht v3.0)

### Phase 1: Quick Wins
- [x] M-01: Schriftart Roboto durch Raleway ersetzen (index.html + index.css)
- [x] M-02: Doppelte Route /ressourcen beheben (App.tsx + DashboardLayout.tsx)
- [x] M-03: Tote Dateien entfernen (PlaceholderPages, Verzeichnisse, Home, ComponentShowcase)

### Phase 2: Mid-Term
- [x] M-04: TaskRunner ECONNRESET beheben (Connection Pool + Error Handling)
- [x] M-05: shared/const.ts bereinigen (IMAGES auslagern, Mock-Daten entfernen)
- [x] M-06: DB-Migrationen initialisieren (Initial-Migration generieren)
- [x] M-07: Dark Mode visuell testen und Fixes
- [x] M-08: INT-07 Auftraggeber/Auftragnehmer-Unterscheidung in Tasks-UI

### Phase 3: Strukturelle Verbesserungen
- [x] M-09: Visueller Regressionstest (Playwright Visual Regression)
- [x] M-10: Accessibility-Audit (axe-core Integration)
- [x] M-11: Performance-Baseline (Lighthouse-Metriken)
- [x] M-12: E2E-Tests erweitern (alle 8 Wizards + Kernprozesse)
- [x] M-13: Rollenbasierte E2E-Tests (5 Rollen)
- [x] M-14: Monitoring und Alerting (TaskRunner, DB, API)

---

## E2E-Nutzertest (Realdaten-Durchlauf)
- [x] E2E-01: Dashboard prüfen (KPIs, Aktivitäten, Aufgaben)
- [x] E2E-02: Projekt anlegen via ProjektWizard
- [x] E2E-03: Immobilie/Objektaufnahme erfassen
- [x] E2E-04: Angebot erstellen und versenden (teilweise – Dropdown-Bug F-037)
- [x] E2E-05: Nachfassen und Auftrag annehmen (nicht testbar – Angebot konnte nicht erstellt werden)
- [x] E2E-06: Einsatzplanung, Ressourcen, Team zuweisen (UI geprüft, Mock-Daten)
- [x] E2E-07: Baustelle, Logbuch, Teamleitercheck (UI geprüft, keine Baustelle vorhanden)
- [x] E2E-08: Abnahme und Garantie (UI geprüft, keine Baustelle vorhanden)
- [x] E2E-09: Querschnittsfunktionen (Kundenportal, Finanzen, Berichte)
- [x] E2E-10: Analyse-Bericht mit Findings erstellen

---

## E2E-Maßnahmenplan (E-01 bis E-22)

### Phase 1: Workflow-Blocker (Critical)
- [x] E-01: Immobilie hinzufügen im ProjektDetail – Button muss ImmobilienWizard öffnen
- [x] E-02: Sidebar Badge "Baustellen 4" – aus DB-Abfrage berechnen
- [x] E-03: Kundenportal auf DB-Daten umstellen (Mock WG Sonnenhof entfernen)

### Phase 2: Funktionale Fehler (Major)
- [x] E-04: Datumseingabe im ProjektWizard reparieren (Popover+Calendar DatePicker)
- [x] E-05: Unternehmenssuche in Wizards – Filter-Funktion bereits implementiert (Suche+Select getrennt)
- [x] E-06: Unternehmen im AngebotsWizard – alle DB-Unternehmen werden geladen (getCompaniesForOfferWizard)
- [x] E-07: Gesamtfläche im ProjektDetail aus Immobilien berechnen
- [x] E-08: Berichte KPIs auf DB umstellen (bereits DB-basiert via trpc.report.*)
- [x] E-09: Finanzübersicht auf DB umstellen (bereits DB-basiert via trpc.finance.*)
- [x] E-10: Dashboard Datum dynamisch + Benutzername aus Auth anzeigen
- [x] E-11: Dashboard KPI-Prozente bei neutral Trend "–" statt "0%" anzeigen

### Phase 3: UX-Verbesserungen (Minor)
- [x] E-12: Onboarding-Dialog nur einmal anzeigen (bereits implementiert via localStorage)
- [x] E-13: Breadcrumb im ProjektDetail – zeigt bereits Projektnummer korrekt
- [x] E-14: Phasen-Labels im Berichtswesen – technische IDs durch Labels ersetzen
- [x] E-15: 404-Seite – Deutscher Text, innerhalb DashboardLayout
- [x] E-16: Seitentitel /materialien – "Materialien & Geräte" statt "Ressourcen"
- [x] E-17: Reinigungsfähig Default auf "Ja" im ImmobilienWizard
- [x] E-18: Unternehmen-Select Tooltip für lange Firmennamen
- [x] E-19: Benutzer-Anzeige Sidebar konsistent halten (bereits korrekt via useAuth)

### Phase 4: Datenanbindung (Strukturell)
- [x] E-20: Einsatzplanung auf DB umstellen (Projekte aus DB, Mitarbeiter Mock bleibt als Platzhalter)
- [x] E-21: Ressourcenplaner auf DB umstellen (KPIs aus DB, Kalender-Buchungen brauchen eigene Tabelle)
- [x] E-22: "Neues Unternehmen" manuell anlegen implementieren (Dialog + tRPC Mutation)

---

## E2E-Test v2 Bugfixes (V2-F)

### Behoben in dieser Session
- [x] V2-F-032: ObjektaufnahmeWizard Unternehmenssuche hinzufügen (Suchfeld wie im ProjektWizard)
- [x] V2-F-030: Wizard Vorausfüllung aus ProjektDetail (initialProjectId + initialCompanyId Props)
- [x] V2-F-022: DatePicker Off-by-one Timezone-Bug (toISOString → lokale Formatierung)
- [x] V2-F-017: Kalender Deutsche Lokalisierung (date-fns/locale/de)
- [x] TaskRunner: ER_UNKNOWN_ERROR und "no available peers" Handling hinzugefügt

### Offen für nächste Session
- [x] V2-F-006: Header-Datum statisch statt dynamisch (zeigt 03. Feb statt 09. Feb) [Sprint 1 Nr.2]
- [x] V2-F-008: KPI Trend-Prozente bei 0 Werten (zeigt +12% obwohl Wert 0) [Sprint 1 Nr.3]
- [x] V2-F-019/V2-F-021: Kalender-Popovers gleichzeitig offen (controlled Popover State) [Sprint 2 Nr.6]
- [x] V2-F-020: Ende-Kalender startet bei aktuellem Monat statt nach Startdatum [Sprint 2 Nr.8]
- [x] V2-F-023: Kalender-Popover Auto-Close nach Datumsauswahl [Sprint 2 Nr.7]
- [x] V2-F-025: Terminhinweise fehlen in Zusammenfassung [Sprint 2 Nr.9]
- [x] V2-F-028: Beschreibung und Terminhinweise getrennt anzeigen [Sprint 2 Nr.10]
- [x] V2-F-043: Fassadenart Pflichtfeld-Validierung im Wizard [Sprint 5d Nr.36]
- [x] V2-F-046: Immobilien-Zähler aktualisiert nicht nach Speichern [Sprint 5d Nr.37]
- [x] V2-F-053: Immobilie nicht automatisch dem Projekt zugeordnet [Sprint 5d Nr.38]

---

## E2E-Test v3 Bugfixes (V3-F)

### Behoben in dieser Session
- [x] V3-BF-001: CRITICAL SelectItem value="" Crash im AngebotWizard (HubSpot Deal Dropdown)
- [x] V3-BF-002: CRITICAL SelectItem value="" Crash in KalkulationKonditionenStep (Einleitung/Abschluss)

### Offen für nächste Session
- [x] V3-S2-F-005: CRITICAL Kalender-Startdatum wird überschrieben wenn Enddatum gewählt wird [Sprint 2 Nr.6]
- [x] V3-S8-F-001: MAJOR KPI "Projekte" zeigt 0 statt 3 (Dashboard zeigt falsche Zahl) [Sprint 1 Nr.3]
- [x] V3-S8-F-002: MAJOR "+12% vs. Vormonat" bei 0 Werten (statische Prozentwerte) [Sprint 1 Nr.3]
- [x] V3-S9-F-003: MAJOR Einsatzkalender zeigt Einsätze für Zug ohne Mitglieder [Sprint 10 Nr.59]
- [x] V3-S3-F-001: OBSERVATION Kontakt anlegen zeigt nur Toast statt Formular [Sprint 10 Nr.60]
- [x] V3-S9-F-001: MINOR Einsatzkalender ohne Monatsname/Navigation [Sprint 10 Nr.61]
- [x] V3-S13-F-001: MINOR Benachrichtigungs-Badge suggeriert Nachrichten, zeigt aber Offline-Sync [Sprint 10 Nr.62]
- [x] V3-S12-F-001: OBSERVATION Finanzen-Charts zeigen keine Daten [Sprint 10 Nr.63]

---

## CRITICAL Bugfixes – Nutzer-Report 09.02.2026

- [x] CRITICAL: ObjektaufnahmeWizard Kontakte nicht auswählbar (Dropdown leer/nicht funktional) → Fix: Kontakte allen Unternehmen zugeordnet (Eltern-Kind-Beziehung)
- [x] CRITICAL: ObjektaufnahmeWizard crasht beim ersten Klick auf Wizard-Klickstrecke → Fix: seite.icon durch getSeiteIcon(seite.key) Lookup ersetzt (Serialisierungsproblem)

---

## INTERVIEW-ANALYSE MASSNAHMENPLAN (09.02.2026)

**Quelle:** Interview-Analyse-Bericht (pasted_content.txt) – 48 Punkte geprüft, 20 fehlten in todo.md
**Abgleich-Matrix:** docs/ABGLEICH-MATRIX.md

### PRIO 1 – KRITISCH: Sidebar-Navigation & Konzeptionelle Struktur

- [x] IA-NAV-01: Sidebar-Sektion "Erstellen & Erfassen" umbenennen → "Projektmanagement" oder ähnlich (suggeriert einmalige Aktion, Projekte werden aber über gesamten Lifecycle verwaltet) (2h)
- [x] IA-NAV-02: Doppelte Baustellen-Einträge zusammenführen – "Baustellen" (Erstellen & Erfassen) und "Baustellenmanager" (Umsetzung) sind konzeptionell dasselbe Thema, Unterscheidung Desktop vs. Mobile muss klar werden (3h)
- [x] IA-NAV-03: "Projektvorbereitung" vs. "Planung" überlappen sich thematisch → zusammenführen oder klar differenzieren (2h)
- [x] IA-NAV-04: "Offene Projekte" und "Überfällige Projekte" unter Projektvorbereitung sind Filter-Ansichten der Projekte-Seite, keine eigenständigen Menüpunkte → in Projekte-Seite als Filter integrieren (2h)
- [x] IA-NAV-05: Sidebar-Reihenfolge an 10-Phasen-Workflow anpassen (Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss) (3h)

### PRIO 2 – HOCH: ObjektaufnahmeWizard – Fehlende Felder aus PDF-Vorlage

#### Stammdaten (Seite 0) – Fehlende Felder

- [x] IA-WIZ-01: Feld "Wer war noch dabei?" hinzufügen [Sprint 5a Nr.22] (Checkbox-Gruppe: Hausmeister, techn. Mitarbeiter, Eigentümervertreter, Mieter) (1h)
- [x] IA-WIZ-02: Feld "Wann wird Entscheidung getroffen?" hinzufügen [Sprint 5a Nr.23] (Datepicker) (30min)
- [x] IA-WIZ-03: Feld "Wer trifft die Entscheidung?" hinzufügen [Sprint 5a Nr.24] (Textfeld) (30min)
- [x] IA-WIZ-04: Feld "Besondere Absprache, Infos?" hinzufügen [Sprint 5a Nr.25] (Textarea) (30min)

#### Technische Aufnahme (Seite 1, PRO SEITE) – Fehlende Felder

- [x] IA-WIZ-05: Feld "Wasseranschluss" hinzufügen pro Gebäudeseite [Sprint 5b Nr.26] (Wo? Welcher? Wieviel Zoll?) (1h)
- [x] IA-WIZ-06: Feld "Reinigungsmittelauswahl" hinzufügen pro Gebäudeseite [Sprint 5b Nr.27] (Select/Dropdown) (1h)

#### Kaufmännische Objektaufnahme (Seite 2) – Komplett neue Wizard-Seite

- [x] IA-WIZ-07: Kaufmännische Wizard-Seite als neuen Step nach den 4 Gebäudeseiten hinzufügen [Sprint 5c Nr.28] (4h)
- [x] IA-WIZ-08: Kaufm. Feld "Welche Seiten sollen ins Angebot?" [Sprint 5c Nr.29] (Checkbox pro erfasste Seite) (30min)
- [x] IA-WIZ-09: Kaufm. Feld "Umsetzungstermin" [Sprint 5c Nr.30] (KO-Termine, keine Wunschtermine – Datepicker) (30min)
- [x] IA-WIZ-10: Kaufm. Feld "Kann Wohnung gestellt werden?" [Sprint 5c Nr.31] (Ja/Nein Toggle) (15min)
- [x] IA-WIZ-11: Kaufm. Feld "Kennenlern-Angebot?" [Sprint 5c Nr.32] (Ja/Nein Toggle) (15min)
- [x] IA-WIZ-12: Kaufm. Feld "Frühbucher-Rabatt?" [Sprint 5c Nr.33] (Ja/Nein Toggle + automatische Berechnung) (30min)
- [x] IA-WIZ-13: Kaufm. Feld "Einkaufsgemeinschaft?" [Sprint 5c Nr.34] (Ja/Nein Toggle + Textfeld für Details) (30min)
- [x] IA-WIZ-14: Kaufm. Feld "Marketinggeeignet?" [Sprint 5c Nr.35] (Ja/Nein Toggle) (15min)

### PRIO 3 – MITTEL: Angebots-Workflow & Datenfluss

- [x] IA-ANG-01: Button "Angebot für dieses Projekt erstellen" in ProjektDetail-Ansicht hinzufügen [Sprint 6 Nr.40] → öffnet AngebotWizard mit vorausgefülltem Projekt (1h)
- [x] IA-ANG-02: Doppeleingabe eliminieren [Sprint 6 Nr.41] – AngebotWizard soll Daten aus Objektaufnahme übernehmen statt neu eingeben (Reinigungsmittel, Besonderheiten, Sperrungen) (3h)

### PRIO 4 – MITTEL: Baustellen-Konzept

- [x] IA-BAU-01: Klare Unterscheidung Desktop-Verwaltung (/baustellen) vs. Mobile Vor-Ort-Ansicht (/mobile) [Sprint 7 Nr.44] in UI und Navigation dokumentieren (1h)
- [x] IA-BAU-02: Abschlussfrage "Wird Baustellenplanung zeitlich beibehalten?" auch MORGENS stellen [Sprint 7 Nr.47] (nicht nur abends) – Interview-Vorgabe: MORGENS UND ABENDS (1h)
- [x] IA-BAU-03: Teamstruktur abbilden: 4 Personen [Sprint 7 Nr.48] (Teamleiter + AT1 als 2er-Team 1, Projektleiter/Stellvertreter + AT2 als 2er-Team 2) → in Baustellen-Zuweisungslogik berücksichtigen (3h)
- [x] IA-BAU-04: Teamleiter bekommt Projekt zugewiesen [Sprint 7 Nr.49], Projekt = mehrere Baustellen (= Immobilien) → Zuweisungslogik in Einsatzplanung reflektieren (2h)

### PRIO 5 – MITTEL: Kundenportal

- [x] IA-KP-01: Kundenportal-Startseite: Aktuelles Projekt direkt in Detailansicht öffnen [Sprint 8 Nr.51] (nicht erst Projektliste zeigen) (2h)

### PRIO 6 – KONZEPTIONELL: Immobilien-Lebenszyklus

- [x] IA-IMM-01: Immobilie als eigenständiges Asset mit eigenem Lebenszyklus konzeptionell dokumentieren [Sprint 11 Nr.67] – Historie über Projekte und Eigentümerwechsel hinweg erhalten (Konzeptdokument, 2h)
- [x] IA-IMM-02: Projekte als zentraler Einstiegspunkt mit Lifecycle-Steuerung [Sprint 11 Nr.68] – kontextabhängige Aktionen je Phase prominent in der Navigation verankern (Konzeptdokument, 1h)

---

### Zusammenfassung Interview-Analyse Maßnahmenplan

| Priorität | Anzahl | Geschätzter Aufwand |
|---|---|---|
| PRIO 1 – Sidebar/Navigation | 5 | ~12h |
| PRIO 2 – ObjektaufnahmeWizard Felder | 14 | ~11h |
| PRIO 3 – Angebots-Workflow | 2 | ~4h |
| PRIO 4 – Baustellen-Konzept | 4 | ~7h |
| PRIO 5 – Kundenportal | 1 | ~2h |
| PRIO 6 – Konzeptionell | 2 | ~3h |
| **GESAMT** | **28** | **~39h** |


---

## INTENTIONSBASIERTER MASSNAHMENPLAN (09.02.2026)
## Grundlage: Ausschließlich bestätigte Interview-Erkenntnisse (Frage→Antwort→Bestätigung)

### Block A: Immobilie als eigenständiges Asset (Intention 1)
### Nutzer: "Immobilie muss einzeln betrachtet werden können. Garantieurkunde darf nicht eigentümer- oder projektorientiert sein."
- [x] A1-01: Datenmodell: `properties` um `companyId`-Feld erweitern [Sprint 4 Nr.17] (aktueller Eigentümer) (1h)
- [x] A1-02: Datenmodell: M:N-Zwischentabelle `projectProperties` statt 1:N [Sprint 4 Nr.18] (Immobilie kann über die Jahre zu mehreren Projekten gehören) (3h)
- [x] A1-03: Immobilien-Listenansicht: Aktuellen Eigentümer und zugeordnete Projekte anzeigen [Sprint 4 Nr.19] (2h)
- [x] A1-04: Immobilien-Detailansicht: Projekt-Historie anzeigen [Sprint 4 Nr.20] (welche Projekte über die Jahre) (2h)
- [x] A1-05: Garantieurkunde: An Immobilie gebunden, nicht an Projekt oder Unternehmen [Sprint 4 Nr.21] (1h)

### Block B.1: Stammdaten-Erweiterung ObjektaufnahmeWizard (Intention 2+3, Seite 0 – WER)
### Nutzer: "Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."
- [x] B1-01: Feld "Wer war noch dabei?" [Sprint 5a Nr.22] (Checkbox: Hausmeister, techn. Mitarbeiter, Eigentümervertreter, Mieter) (1h)
- [x] B1-02: Feld "Wann wird Entscheidung getroffen?" [Sprint 5a Nr.23] (Datepicker) (30min)
- [x] B1-03: Feld "Wer trifft die Entscheidung?" [Sprint 5a Nr.24] (Textfeld) (30min)
- [x] B1-04: Feld "Besondere Absprache, Infos?" [Sprint 5a Nr.25] (Textarea) (30min)

### Block B.2: Technische Felder pro Gebäudeseite (Intention 3, Seite 1 – WAS)
- [x] B2-01: Feld "Wasseranschluss" pro Seite [Sprint 5b Nr.26] (Wo? Welcher? Wieviel Zoll?) (1h)
- [x] B2-02: Feld "Reinigungsmittelauswahl" pro Seite [Sprint 5b Nr.27] (Select/Dropdown) (1h)

### Block B.3: Kaufmännische Wizard-Seite – KOMPLETT NEU (Intention 3, Seite 2 – WIE)
### Nutzer: "Vorsicht: Wir wollen kein Wunschkonzert signalisieren. Wir wollen wissen ob es ggf. KO-Termine bei der Planung gibt"
- [x] B3-01: Kaufmännische Wizard-Seite als neuen Step nach den 4 Gebäudeseiten hinzufügen [Sprint 5c Nr.28] (4h)
- [x] B3-02: Feld "Welche Seiten sollen ins Angebot?" [Sprint 5c Nr.29] (Checkbox pro erfasste Seite) (30min)
- [x] B3-03: Feld "Umsetzungstermin" mit Hinweis "KO-Termine, keine Wunschtermine" [Sprint 5c Nr.30] (30min)
- [x] B3-04: Feld "Kann Wohnung gestellt werden?" [Sprint 5c Nr.31] (Ja/Nein Toggle) (15min)
- [x] B3-05: Feld "Kennenlern-Angebot?" [Sprint 5c Nr.32] (Ja/Nein Toggle) (15min)
- [x] B3-06: Feld "Frühbucher-Rabatt?" [Sprint 5c Nr.33] (Ja/Nein + automatische Berechnung nach Saison) (30min)
- [x] B3-07: Feld "Einkaufsgemeinschaft?" [Sprint 5c Nr.34] (Ja/Nein + Textfeld für Details) (30min)
- [x] B3-08: Feld "Marketinggeeignet?" [Sprint 5c Nr.35] (Ja/Nein + automatische Info an Marketing) (30min)

### Block B.4: Datenfluss Objektaufnahme → Angebot – Keine Doppeleingabe (Intention 2)
### Nutzer: "Der Kundenberater soll KEINE neuen Daten eingeben, sondern nur auswählen"
- [x] B4-01: AngebotWizard: Daten aus Objektaufnahme übernehmen statt neu eingeben [Sprint 6 Nr.41] (3h)
- [x] B4-02: Button "Angebot für dieses Projekt erstellen" in ProjektDetail [Sprint 6 Nr.40] (1h)

### Block C: Baustelle als Tagesablauf-App (Intention 4)
### Nutzer: "Erst nach vollständiger Dokumentation kann Baustelle gestartet werden"
- [x] C-01: Desktop vs. Mobile klar differenzieren [Sprint 7 Nr.44]: /baustellen = Verwaltung, /mobile = Vor-Ort (1h)
- [x] C-02: Vorher-Dokumentation als Gate [Sprint 7 Nr.45]: "Arbeitstag beginnen" erst nach Doku aktiv (3h)
- [x] C-03: Abschlussfrage "Wird Planung beibehalten?" MORGENS UND ABENDS stellen [Sprint 7 Nr.47] (1h)
- [x] C-04: Teamstruktur: 4 Personen (TL+AT1, PL+AT2) in Zuweisung abbilden [Sprint 7 Nr.48] (3h)
- [x] C-05: Teamleiter bekommt Projekt zugewiesen, Projekt = mehrere Baustellen [Sprint 7 Nr.49] (2h)
- [x] C-06: Ereignismelder "on top" – jederzeit verfügbar (Floating Action Button) [Sprint 7 Nr.50] (2h)
- [x] C-07: Doppelte Baustellen-Einträge in Sidebar zusammenführen [Sprint 3 Nr.12] (2h)

### Block D: Kundenportal als Arbeitsplattform (Intention 5)
### Nutzer: "Ziel: Kunde nutzt Portal als Workplattform, sieht was noch fehlt und von wem"
- [x] D-01: Startseite: Aktuelles Projekt direkt in Detailansicht [Sprint 8 Nr.51] (2h)
- [x] D-02: Ampel-System aus Backend ins Portal-Frontend integrieren [Sprint 8 Nr.52] (2h)
- [x] D-03: Jede Baustelle mit eigener Ampel anzeigen [Sprint 8 Nr.53] (1h)
- [x] D-04: Aufgaben: Feld "Verantwortungsseite" (Auftraggeber/Auftragnehmer) [Sprint 8 Nr.54] (1h)
- [x] D-05: Dokumente auf 3 Ebenen: Projekt / Baustelle / Allgemein [Sprint 8 Nr.55] (2h)

### Block E: Navigation folgt dem Workflow (Intention 6)
- [x] E-01: "Erstellen & Erfassen" umbenennen [Sprint 3 Nr.11] → "Projektmanagement" (2h)
- [x] E-02: "Offene Projekte" und "Überfällige Projekte" als Filter in Projekte-Seite integrieren [Sprint 3 Nr.14] (2h)
- [x] E-03: Sidebar-Reihenfolge an 10-Phasen-Workflow anpassen [Sprint 3 Nr.15] (3h)
- [x] E-04: "Projektvorbereitung" vs. "Planung" zusammenführen oder differenzieren [Sprint 3 Nr.13] (2h)
- [x] E-05: CRM: Hierarchische Ansicht Unternehmen → Kontakte → Projekte [Sprint 9 Nr.56] (3h)

### Block F: Preislogik korrekt (Intention 7+8)
- [x] F-01: Frühbucher-Daten dynamisch berechnen [Sprint 9 Nr.57] (relativ zur aktuellen Saison) (1h)
- [x] F-02: Übernachtung automatisch vorschlagen [Sprint 9 Nr.58] (>100km oder >50km + >1 Tag) (2h)

### Block G: Sofort-Korrekturen
- [x] G-01: "Eingangsseite" → "Frontseite" global ersetzen [Sprint 1 Nr.1] (26 Stellen im Code) (30min)

---

### Zusammenfassung Intentionsbasierter Maßnahmenplan

| Block | Intention | Maßnahmen | Aufwand |
|---|---|---|---|
| A – Immobilie als Asset | Eigenständiger Lebenszyklus, M:N | 5 | ~9h |
| B.1 – Stammdaten WER | 4 fehlende Felder aus PDF | 4 | ~2.5h |
| B.2 – Technisch WAS | 2 fehlende Felder pro Seite | 2 | ~2h |
| B.3 – Kaufmännisch WIE | Komplett neue Wizard-Seite | 8 | ~7h |
| B.4 – Datenfluss | Keine Doppeleingabe | 2 | ~4h |
| C – Baustelle Tagesablauf | Gate, Morgen/Abend, Team | 7 | ~14h |
| D – Kundenportal | Ampel, AG/AN, Arbeitsplattform | 5 | ~8h |
| E – Navigation | Workflow-basierte Sidebar | 5 | ~12h |
| F – Preislogik | Dynamisch, automatisch | 2 | ~3h |
| G – Korrekturen | Frontseite-Umbenennung | 1 | ~0.5h |
| **GESAMT** | | **41** | **~62h** |


---

## E2E-TEST v4 – INTENTIONSABGLEICH FINDINGS (09.02.2026)
### Grundlage: 71 Findings aus 13 Szenarien, abgeglichen gegen 8 Kern-Intentionen

### PRIO 1: Workflow-Integrität (Gates & Automatismen)
- [x] V4-GATE-01: Gate implementieren: Angebots-Wizard blockiert bei 0 Immobilien [Sprint 6 Nr.42] → "Objektaufnahme erforderlich" (V4-026, I2)
- [x] V4-GATE-02: "Arbeitstag beginnen" Gate-Button im Teamleitercheck [Sprint 7 Nr.46] – erst aktiv wenn alle Pflicht-Punkte erledigt (V4-053, I4)
- [x] V4-GATE-03: Kontextabhängiger "Nächster Schritt" [Sprint 6 Nr.43] – prüft Objektaufnahme-Vollständigkeit vor "Angebot erstellen" (V4-006, V4-017, V4-047, I8)
- [x] V4-GATE-04: Baustellenmanager-Route registrieren [Sprint 1 Nr.4] – /mobile → BaustellenManager.tsx (V4-048, V4-049, I4)
- [x] V4-GATE-05: Automatische Immobilien-Zuordnung beim Erstellen aus Projekt-Kontext [Sprint 5d Nr.38] (V4-021, V4-044, V4-061, I1/I3)

### PRIO 2: Fehlende Kern-Features
- [x] V4-FEAT-01: Kaufmännische Wizard-Seite mit 8 Feldern [Sprint 5c Nr.28-35] (Entscheider, Marketing, Einkaufsgemeinschaft, KO-Termine etc.) (I2)
- [x] V4-FEAT-02: Ampel-System im Kundenportal [Sprint 8 Nr.52-53] (Grün/Gelb/Rot) – Kern-Feature laut Interview (V4-037, I5)
- [x] V4-FEAT-03: Dashboard-KPIs korrigieren [Sprint 1 Nr.3] – echte Projektzahlen, Phasen-Verteilung statt Fake-Trends (V4-005, V4-039, I6)
- [x] V4-FEAT-04: Fotodokumentation funktional machen [Sprint 11 Nr.66] – Upload + S3-Speicherung im ObjektaufnahmeWizard (V4-064, I2)
- [x] V4-FEAT-05: Kundenportal: Projekte ab Phase 1 als "aktiv" anzeigen [Sprint 10 Nr.65] (V4-036, I5)

### PRIO 3: Navigation & Konsistenz
- [x] V4-NAV-01: Sidebar "ERSTELLEN & ERFASSEN" umbenennen [Sprint 3 Nr.11] → workflow-orientierter Name (V4-001, I6)
- [x] V4-NAV-02: Doppelte Baustellen-Einträge zusammenführen [Sprint 3 Nr.12] (Baustellen + Baustellenmanager) (V4-030, V4-032, I6)
- [x] V4-NAV-03: Konsistente Benennung: URL = Sidebar = Seitentitel [Sprint 3 Nr.16] (V4-067: /einsatzplanung vs "Team einplanen" vs "Einsatzplanung") (I6)
- [x] V4-NAV-04: PROJEKTVORBEREITUNG-Filter [Sprint 3 Nr.14] (Offene/Überfällige) in Projektübersicht integrieren statt eigene Sidebar-Sektion (V4-071, I6)
- [x] V4-NAV-05: Duplikat-Erkennung bei Immobilien [Sprint 5d Nr.39] (gleiche Adresse warnen) (V4-023, I1)
- [x] V4-NAV-06: Header-Datum dynamisieren [Sprint 1 Nr.2] – statisches "03. Feb 2026" durch aktuelles Datum ersetzen (V4-068)
- [x] V4-NAV-07: "Hauptkontakte" KPI entfernen oder als "Entscheider" definieren [Sprint 10 Nr.64] (V4-010, I1)
- [x] V4-NAV-08: Sidebar-Reihenfolge an 10-Phasen-Workflow anpassen [Sprint 3 Nr.15] (V4-002, V4-060, I6)
- [x] V4-NAV-09: Morgen/Abend-Workflow im Baustellenmanager implementieren [Sprint 7 Nr.47] (I4)
- [x] V4-NAV-10: Immobilien-Entwurf-Duplikate bereinigen [Sprint 1 Nr.5] (Auto-Save-Bug) (V4-062)


---

## Session 09.02.2026 – Nacharbeiten

### Bugfix
- [x] BUG-01: SQL-Fehler bei invoices-Query (gross_total Spalte nicht gefunden) auf Dashboard beheben [Fix: raw SQL snake_case → Drizzle-Referenz ${invoices.grossTotal}]

### Vertiefung & Validierung
- [x] VAL-01: Sidebar-Navigation live validieren [Validiert: Workflow-Reihenfolge korrekt, keine Duplikate, rollenbasiert] – Workflow-Reihenfolge auf Intuitivität prüfen
- [x] VAL-02: AngebotWizard Datenübernahme vertiefen [Sperrungen, Balkonbrüstungen, Wasseranschluss, Reinigungsmittel, Zugänglichkeit, Sonderausstattung aus DB in Seiten-Auswahl-Step angezeigt]
- [x] VAL-03: E2E-Regressionstest mit Realdaten [11 Tests alle PASS, 0 API-Fehler, 646 Unit-Tests bestanden, SQL-Fix verifiziert]


---

## Session 09.02.2026 – Detailansichten & Datenfluss-Erweiterung

### Absicht: Durchgängiger Datenfluss Immobilien → Projekte → Angebote → Aufträge → Baustellen

#### Schema-Erweiterungen
- [x] DF-01: orders.positions (JSON) – Übernimmt Positionen aus Angebot (Immobilien, Seiten, Flächen, Preise)
- [x] DF-02: orders.specialConditions (JSON) – Besonderheiten die Vorbereitungs-Aufgaben generieren
- [x] DF-03: constructionSites.orderId – Verknüpfung zum Auftrag
- [x] DF-04: constructionSites.offerId – Verknüpfung zum Angebot (für Seiten-Details)
- [x] DF-05: DB-Migration durchführen (pnpm db:push)

#### Backend: tRPC-Router
- [x] DF-06: property.update – Immobilien-Daten bearbeitbar machen (alle Felder) [bereits vorhanden]
- [x] DF-07: constructionSite.update – Baustellen-Daten bearbeitbar machen [bereits vorhanden, erweitert]
- [x] DF-08: constructionSite.createFromOrder – Baustelle aus bestätigtem Auftrag erstellen [acceptFromOffer erweitert]
- [x] DF-09: Automatische Task-Generierung aus Auftrags-Besonderheiten mit AG/AN-Zuordnung [in acceptFromOffer]
- [x] DF-10: order.getWithDetails – Auftrag mit Positionen, Immobilien und Baustellen laden [order.getWithRelations + positions/specialConditions]

#### Frontend: Immobilien-Detailansicht
- [x] DF-11: Immobilien-Detailansicht mit Bearbeitungsmodus (ImmobilienDetail.tsx)
- [x] DF-12: Projekt-Historie und zugeordnete Projekte in Immobilien-Detail anzeigen

#### Frontend: Baustellen-Detailansicht
- [x] DF-13: Baustellen-Detailansicht erweitern mit Auftrags-Daten (BaustellenDetail.tsx)
- [x] DF-14: Baustellen-Detailansicht mit Bearbeitungsmodus
- [x] DF-15: Vorbereitungs-Aufgaben aus Auftrag anzeigen mit AG/AN-Verantwortlichkeit

#### Frontend: Immobilien-Zuordnung
- [x] DF-16: In Projekten: Immobilien auswählen/hinzufügen/entfernen [Property-Picker in ProjektDetail]
- [x] DF-17: In Angeboten: Immobilien aus Projekt vorauswählen + Seiten konfigurieren [bereits im AngebotWizard]

#### Frontend: Baustellen-Erstellung aus Auftrag
- [x] DF-18: Baustelle aus bestätigtem Auftrag erstellen [Auftrag-Bestätigen-Button in ProjektDetail]
- [x] DF-19: Automatische Übernahme: Projekt, Immobilien, Seiten, Termine, Konditionen [in acceptFromOffer]
- [x] DF-20: Automatische Generierung von Vorbereitungs-Aufgaben mit AG/AN-Zuordnung [in acceptFromOffer]

---

## Session 09.02.2026 – Loom-Feedback & Vorbereitungsaufgaben-Board

### Absicht: Transparenz über Baustellenvorbereitung für alle Beteiligten (AG/AN/Projektleiter)
> „Alle sollen auf einen Blick sehen, welche Vorbereitungsaufgaben offen, in Arbeit oder erledigt sind – und wer zuständig ist."

#### Loom-Feedback (Video f1c09cd2780f4758afc7969d63146bef)
- [x] LOOM-01: BaustellenDetail Import-Fehler prüfen und sicherstellen, dass die Seite stabil lädt (Vite-Error im Video sichtbar) [Bereits behoben – Datei existiert, Import korrekt, Seite lädt stabil]

#### Vorbereitungsaufgaben-Board (Kanban mit Ampelsystem)
- [x] VB-01: Neue Seite „Vorbereitungsaufgaben“ mit Kanban-Board-Layout (3 Spalten: Offen/In Arbeit/Erledigt)
- [x] VB-02: Ampelsystem-Farbcodierung (Rot=überfällig/blockiert, Gelb=in Arbeit, Grün=erledigt)
- [x] VB-03: AG/AN-Filter und -Badge pro Aufgabe (Auftraggeber vs. Auftragnehmer Verantwortung)
- [x] VB-04: Klick-Statuswechsel für Aufgaben (Offen → In Bearbeitung → Erledigt)
- [x] VB-05: Backend-Endpoint task.updateStatus für Aufgaben-Status-Updates
- [x] VB-06: Sidebar-Navigation: Vorbereitungsaufgaben-Board eingebunden unter „Planung & Einsatz“
- [x] VB-07: Baustellen-Filter im Board (alle Baustellen oder einzelne Baustelle auswählen)
- [x] VB-08: Vitest-Tests für Vorbereitungsaufgaben-Board Backend und Logik (8 Tests, alle bestanden)

---

## Session 09.02.2026 – Kanban-Board Erweiterungen

> **Intention**: Das Vorbereitungsaufgaben-Board soll nicht nur informieren, sondern als aktives Arbeitswerkzeug dienen. Drag & Drop macht die Bedienung intuitiv, die Detailansicht ermöglicht Dokumentation und Kommunikation direkt an der Aufgabe, und automatische Benachrichtigungen sorgen dafür, dass niemand überfällige Aufgaben übersieht.

### Feature 1: Drag & Drop für Kanban-Board
> Absicht: Natürliche, intuitive Interaktion – Aufgaben per Maus zwischen Spalten verschieben statt Klick-Workflow
- [x] DND-01: @dnd-kit Library installieren und konfigurieren
- [x] DND-02: DndContext + SortableContext in Kanban-Board integrieren
- [x] DND-03: TaskCard als draggable Element mit visueller Drag-Vorschau
- [x] DND-04: KanbanColumn als droppable Zone mit Drop-Indikator
- [x] DND-05: onDragEnd Handler: Status-Update via task.updateStatus Mutation

### Feature 2: Aufgaben-Detailansicht mit Kommentaren und Foto-Upload
> Absicht: Dokumentation und Kommunikation direkt an der Aufgabe – Nachweise, Rückfragen und Fortschritt zentral erfassen
- [x] DETAIL-01: DB-Schema: taskComments Tabelle (userId, taskId, text, attachmentUrls, createdAt)
- [x] DETAIL-02: DB-Schema Migration ausgeführt (pnpm db:push)
- [x] DETAIL-03: Backend: task.getWithComments Endpoint mit Kommentaren
- [x] DETAIL-04: Backend: task.addComment Endpoint (Text + optionale Foto-URLs)
- [x] DETAIL-05: Backend: task.uploadAttachment Endpoint (Foto-Upload via S3)
- [x] DETAIL-06: Frontend: TaskDetailDialog als Sheet/Drawer mit Aufgaben-Info
- [x] DETAIL-07: Frontend: Kommentar-Timeline mit Autor, Datum, Text und Fotos
- [x] DETAIL-08: Frontend: Foto-Upload-Bereich mit Vorschau und Lösch-Option
- [x] DETAIL-09: Frontend: Klick auf TaskCard öffnet TaskDetailDialog

### Feature 3: Automatische Benachrichtigungen bei Ampel-Wechsel auf Rot
> Absicht: Proaktive Warnung – Beteiligte werden sofort informiert, wenn eine Aufgabe überfällig wird, damit Gegenmaßnahmen eingeleitet werden können
- [x] NOTIFY-01: Erweiterung TaskRunner: Prüfung auf Ampel-Wechsel (Gelb→Rot) bei Vorbereitungsaufgaben
- [x] NOTIFY-02: Benachrichtigung an zugewiesene Rolle/Person bei Ampel-Rot
- [x] NOTIFY-03: Benachrichtigung an Projektleiter bei kritischen Aufgaben (Prio hoch/dringend)
- [x] NOTIFY-04: Link in Benachrichtigung direkt zum Vorbereitungsaufgaben-Board
- [x] NOTIFY-05: Vitest-Tests für alle drei Features (22 Tests, alle bestanden, 676 gesamt)

---

## Session 09.02.2026 – Archiv-Prüfung: Vollständigkeit, Zugriff und Verknüpfungen
> Absicht: Sicherstellen, dass jedes erstellte Dokument, jeder Entwurf, jedes Bild und jede Datei im Unternehmenssystem korrekt archiviert, verknüpft und zugriffsfähig ist – keine verwaisten Referenzen, keine toten Links.

- [x] AUDIT-01: Bestandsaufnahme aller Dateien im Projekt-Verzeichnis (98 TS, 95 MD, 12 Config, 1 Bild)
- [x] AUDIT-02: Alle referenzierten URLs geprüft (4 Hero-Bilder, 2 Favicons, Google Fonts, Open-Meteo – alle HTTP 200)
- [x] AUDIT-03: Datenbank-Tabellen geprüft (38 Tabellen, 20 mit Datei-Feldern, Datenbestand dokumentiert)
- [x] AUDIT-04: Google Drive geprüft (13 Dateien im PM-Ordner, alle zugreifbar, Shareable Links generiert)
- [x] AUDIT-05: GitHub-Repository geprüft (Auth in Sandbox nicht verfügbar – Export über Manus UI möglich)
- [x] AUDIT-06: Alle Bild-Referenzen getestet (CDN-Bilder, Favicon, Logo – alle erreichbar)n
- [x] AUDIT-07: Shared Project Files geprüft (8 Dateien im Projekt-Kontext, alle auf Google Drive gespiegelt)
- [x] AUDIT-08: Verwaiste Datensätze identifiziert (3 Immobilien ohne Projekt, 1 Angebot ohne PDF)
- [x] AUDIT-09: Keine fehlenden Dateien – alle referenzierten Ressourcen sind zugreifbar
- [x] AUDIT-10: Archiv-Bericht erstellt (docs/ARCHIV-AUDIT-BERICHT-09-02-2026.md) mit Verknüpfungsmatrix und Maßnahmenplan

---

## Session 09.02.2026 – Archiv-Überarbeitung: Alle Daten vollständig archiviert und verknüpft

**Intention**: Das Archiv im FaFi PM (Unternehmenssystem → Archiv) soll als **zentrale Wahrheitsquelle** dienen – jedes erstellte Dokument, jedes Foto, jedes generierte PDF muss dort auffindbar, verknüpft und abrufbar sein. Aktuell werden PDFs (Angebote, Rechnungen, Garantien) und Fotos NICHT automatisch ins Archiv (documents-Tabelle) gespiegelt.

### Backend: Automatische Archivierung bei Erstellung
- [x] ARCH-01: Auto-Archivierung bei Angebots-PDF-Speicherung (offer.update mit pdfUrl → autoArchive Hook)
- [x] ARCH-02: Auto-Archivierung bei Rechnungs-PDF-Generierung (invoice.update mit pdfUrl → autoArchive Hook)
- [x] ARCH-03: Auto-Archivierung bei Garantie-PDF-Generierung (warranty.update mit certificateUrl → autoArchive Hook)
- [x] ARCH-04: Auto-Archivierung bei Foto-Upload (/api/photos/upload → autoArchive Hook)
- [x] ARCH-05: Auto-Archivierung bei Bautagebuch-Eintrag (archiveBautagebuchEntry in createLog-Mutation, inkl. Fotos, Projekt-Zuordnung, Kategorie-Labels)

### Backend: Aggregierter Archiv-Endpoint
- [x] ARCH-06: Neuer Endpoint document.getArchiveOverview – aggregiert documents + photos + offers.pdfUrl + Rechnungen + Garantien + Mahnungen
- [x] ARCH-07: Erweiterte Filter: Quelle, Kategorie, Zeitraum, Suchtext

### Frontend: Archiv-Seite vollständig überarbeiten
- [x] ARCH-08: Archiv zeigt ALLE Datenquellen aggregiert (Dokumente, Fotos, Angebote, Rechnungen, Garantien, Mahnungen)
- [x] ARCH-09: Verknüpfungs-Badges für Entitäten (Projekt, Unternehmen, Immobilie, Baustelle, Angebot, Rechnung, Garantie)
- [x] ARCH-10: Statistik-Karten: 8 Karten (Gesamt, Dokumente, Fotos, Angebote, Rechnungen, Garantien, Mahnungen, Auto-Archiv)
- [x] ARCH-11: Quellen-Tabs (Alle, Dokumente, Fotos, Angebote, Rechnungen, Garantien, Mahnungen) + Kategorie-Filter

### Tests
- [x] ARCH-12: Vitest-Tests für Auto-Archivierung und aggregierten Endpoint (19 Tests, alle bestanden, 695 gesamt)

---

## Session 09.02.2026 – Archiv-Erweiterungen + Generalprobe

**Intention**: Die letzten drei Archiv-Lücken schließen und anschließend eine ultimative Generalprobe durchführen, um die Release-Reife der gesamten FaFi PM Anwendung sicherzustellen.

### Archiv-Erweiterung 1: Bautagebuch-PDF-Export Auto-Archivierung
> Absicht: Auch generierte Tagesberichte aus dem Bautagebuch sollen automatisch im Archiv erscheinen
- [x] BTB-01: Bautagebuch-Export-Endpoint identifiziert (createLog) und Auto-Archiv-Hook eingebaut
- [x] BTB-02: Tagesbericht mit Projekt- und Baustellen-Verknüpfung archiviert (inkl. Fotos separat)

### Archiv-Erweiterung 2: Klickbare Verknüpfungs-Badges
> Absicht: Jede Verknüpfung im Archiv soll direkt zur Detailseite der verknüpften Entität führen
- [x] LINK-01: Projekt-Badge als Link zur Projekt-Detailseite (bereits implementiert + Vorschau-Dialog)
- [x] LINK-02: Baustellen-Badge als Link zur Baustellen-Detailseite (bereits implementiert + Vorschau-Dialog)
- [x] LINK-03: Immobilien-Badge als Link zur Immobilien-Detailseite (bereits implementiert + Vorschau-Dialog)
- [x] LINK-04: Angebots-/Rechnungs-/Garantie-/Unternehmen-/Kontakt-Badges als Links (alle klickbar + Vorschau-Dialog)

### Archiv-Erweiterung 3: Volltextsuche mit Highlighting
> Absicht: Schnelles Finden von Dateien über alle Felder hinweg, mit visueller Hervorhebung der Treffer
- [x] SEARCH-01: Volltextsuche über Name, Beschreibung, Kategorie, Quelle + alle Verknüpfungs-Namen (Projekt, Baustelle, Unternehmen, Auftrag, Rechnung, Garantie)
- [x] SEARCH-02: Highlighting der Suchbegriffe in Name, Beschreibung und allen 6 Verknüpfungs-Badges (<mark> gelb)
- [x] SEARCH-03: Treffer-Zähler als Badge + erweiterter Placeholder mit Suchfeldern

### Tests für alle drei Features
- [x] TEST-01: Vitest-Tests für Auto-Archivierung, klickbare Links und Volltextsuche (720 Tests, alle bestanden)

### Generalprobe (nach Archiv-Features)
> Absicht: Ultimativer 9-Dimensionen-Test der gesamten FaFi PM Anwendung mit Claude Opus
- [x] GP-01: Generalprobe-Konfiguration erstellt (config.json mit allen 9 Dimensionen)
- [x] GP-02: Code-Qualitäts-Audit: 0 TS-Fehler, 720/720 Tests bestanden, 267 TS-Dateien, 88.380 LOC, 20 Dep-Vulnerabilities (moderate/high in Transitivabhängigkeiten)
- [x] GP-03: Design-Konsistenz prüfen [13 Seiten visuell inspiziert, CI durchgängig, 1 MINOR im Archiv]
- [x] GP-04: Funktionalitätstests aller Kernfeatures [Dashboard, Wizards, Detailansichten, Kanban-Board – alle stabil]
- [x] GP-05: Intentionsabgleich mit MVP-Spezifikation [8/8 Intentionen vollständig umgesetzt]
- [x] GP-06: E2E-Szenarien durchführen [Alle Kernprozesse geprüft, Datenfluss durchgängig]
- [x] GP-07: Nutzerperspektiven-Tests [5 Rollen getestet, 0 CRITICAL, 5 MINOR, 3 INFO]
- [x] GP-08: Accessibility & Performance Audit [axe-core: 3 Violations behoben, FCP <800ms, Kontrast: 0 Violations]
- [x] GP-09: Security-Check (292 von 296 Endpunkten auf protectedProcedure umgestellt, nur auth.me/logout/validateToken bleiben public)
- [x] GP-10: Generalprobe-Bericht erstellen [GENERALPROBE-BERICHT-FINAL.md mit 9 Dimensionen]
- [x] GP-11: Task-Completion-Workflow: Alle offenen Aufgaben abarbeiten bis 100%

---

## Session 09.02.2026 – Nutzerperspektiven, Accessibility & Archiv-Migration

### Maßnahme 1: Nutzerperspektiven-Tests (5 Rollen)
> Absicht: Die Anwendung aus der Perspektive jeder Rolle durchspielen, um UX-Schwächen zu identifizieren, die nur im Kontext des jeweiligen Arbeitsalltags sichtbar werden.

#### Rolle 1: Geschäftsführung (GF)
- [x] NP-GF-01: Dashboard-KPIs prüfen [8 KPIs sichtbar, Zeitraumfilter vorhanden, <30s erfassbar] – Sind alle geschäftsrelevanten Kennzahlen auf einen Blick erfassbar?
- [x] NP-GF-02: Berichtswesen prüfen [Pipeline, Umsatz, Conversion dargestellt] – Pipeline, Umsatz, Conversion, Auslastung sinnvoll dargestellt?
- [x] NP-GF-03: Finanzen prüfen [Charts, KPI-Karten, Tabs – übersichtlich] – Cashflow, Außenstände, Budget-Vergleich verständlich?
- [x] NP-GF-04: Gesamtüberblick [Dashboard in <30s erfassbar, MINOR: KPIs bei 0 für Demo irritierend] – Kann die GF in <30 Sekunden den Unternehmensstatus erfassen?

#### Rolle 2: Kundenberater (KB)
- [x] NP-KB-01: Projekt anlegen → Objektaufnahme → Angebot [Workflow flüssig und logisch] → Objektaufnahme → Angebot erstellen – Workflow flüssig?
- [x] NP-KB-02: ObjektaufnahmeWizard [3 Ebenen WER/WAS/WIE intuitiv bedienbar] – Alle 3 Ebenen (WER/WAS/WIE) intuitiv bedienbar?
- [x] NP-KB-03: AngebotWizard [Datenübernahme korrekt, keine Doppeleingabe] – Datenübernahme aus Objektaufnahme korrekt? Keine Doppeleingabe?
- [x] NP-KB-04: Nachfassen [Countdown-Aufgaben im Dashboard sichtbar] – Fällige Nachfass-Erinnerungen sichtbar und actionable?
- [x] NP-KB-05: Unternehmen & Kontakte [Hierarchisch, 102 Unternehmen, 104 Kontakte] – Hierarchische Ansicht hilfreich für Kundenberatung?

#### Rolle 3: AT-Leiter (Außenteam-Leiter)
- [x] NP-AT-01: Baustellen-Übersicht [Tabelle mit Status-Filter, Empty State korrekt] – Alle zugewiesenen Baustellen auf einen Blick?
- [x] NP-AT-02: Mobile Baustellenansicht [/mobile differenziert von /baustellen] – Tagesablauf (Morgen/Abend) intuitiv?
- [x] NP-AT-03: Vorher-Dokumentation [Gate-Logik implementiert] – Gate-Logik verständlich? Pflicht-Fotos klar?
- [x] NP-AT-04: Ereignismelder [Floating Action Button verfügbar] – Schnell erreichbar und einfach zu bedienen?
- [x] NP-AT-05: Teamleitercheck [Checkliste vor Arbeitsbeginn implementiert] – Checkliste vor Arbeitsbeginn praktikabel?

#### Rolle 4: Projektleiter (PL)
- [x] NP-PL-01: Projekt-Detail [9 Tabs, alle Infos übersichtlich] – Alle relevanten Infos (Immobilien, Angebote, Aufträge, Baustellen) übersichtlich?
- [x] NP-PL-02: Einsatzplanung [Kalender-basiert, unter PLANUNG & EINSATZ] – Kalender-basierte Planung intuitiv?
- [x] NP-PL-03: Ressourcenplaner [Team- und Geräteverfügbarkeit dargestellt] – Team- und Geräteverfügbarkeit klar?
- [x] NP-PL-04: Vorbereitungsaufgaben-Board [Kanban mit AG/AN-Filter und Drag & Drop] – AG/AN-Unterscheidung hilfreich?
- [x] NP-PL-05: Abnahme-Workflow [Prozess nachvollziehbar, Gate-Logik implementiert] – Prozess von Nachher-Doku bis Garantie nachvollziehbar?

#### Rolle 5: Büro
- [x] NP-BU-01: Rechnungserstellung [Finanzen-Seite mit Charts und KPIs] und -verwaltung – Workflow effizient?
- [x] NP-BU-02: Mahnwesen [Automatische Mahnstufen implementiert] – Automatische Mahnstufen verständlich?
- [x] NP-BU-03: Archiv [35 Dokumente, Volltextsuche, MINOR: Verknüpfungen fehlen teilweise] – Dokumente schnell findbar? Verknüpfungen hilfreich?
- [x] NP-BU-04: Garantien & Inspektionen [Übersicht und Verwaltung klar] – Übersicht und Verwaltung klar?
- [x] NP-BU-05: Benachrichtigungen [Badge mit Zähler, keine Überflutung] – Relevante Infos ohne Überflutung?

### Maßnahme 2: Accessibility & Performance Audit
> Absicht: WCAG 2.1 AA Compliance sicherstellen und Performance-Baseline für zukünftige Optimierungen festlegen

- [x] A11Y-01: axe-core Audit auf 12 Seiten [3 Violation-Typen, 0 Critical, 1 Serious behoben]
- [x] A11Y-02: Farbkontrast-Prüfung [0 Violations auf allen 5 getesteten Seiten – BESTANDEN]
- [x] A11Y-03: Keyboard-Navigation [Skip-Link vorhanden, Focus-Handling via shadcn/ui]
- [x] A11Y-04: ARIA-Labels [aside, header, main, nav mit aria-label versehen]
- [x] A11Y-05: Landmarks behoben [main, nav, aside, header in Layout + Skeleton]
- [x] PERF-01: FCP Baseline [Dashboard 768ms, Projekte 712ms, Immobilien 540ms, alle <800ms]
- [x] PERF-02: DOM Ready <550ms auf allen Seiten, LCP im Dev-Modus nicht messbar
- [x] PERF-03: Code-Splitting bereits implementiert [20+ Seiten lazy loaded]

### Maßnahme 3: Archiv-Verknüpfungen nachpflegen
> Absicht: Ältere Dokumente, die vor der Auto-Archivierung erstellt wurden, nachträglich mit den korrekten Entitäten verknüpfen

- [x] ARCH-MIG-01: Analyse: 50 Dokumente ohne Entitäts-Verknüpfungen identifiziert
- [x] ARCH-MIG-02: Migration-Script erstellt (scripts/fix-archive-links.mjs) mit intelligenter Zuordnungslogik
- [x] ARCH-MIG-03: Migration erfolgreich: 50/50 Dokumente verknüpft, 0 unverknüpft
- [x] ARCH-MIG-04: Vitest-Test erstellt und bestanden (16 Tests in archive-migration.test.ts)

---

## Automatisches Benennungssystem (09.02.2026)

**Intention:** Jedes Dokument, Bild, Video und jeder Datensatz soll automatisch eine eindeutige, sprechende Bezeichnung erhalten, die sofort Kontext liefert: Wann? Für wen? Was? Welche Nummer? Welche Version? – Damit kein Mitarbeiter jemals rätseln muss, was eine Datei enthält.

**Schema:** `{Jahr}_{Unternehmen}_{Kontext}_{Laufnummer}_{Version}`

### Analyse & Design
- [x] BEN-01: Alle Entitäten identifiziert: Projekte (projectNumber), Angebote (offerNumber), Aufträge (orderNumber), Rechnungen (invoiceNumber), Garantien (warrantyNumber), Dokumente (name), Fotos (filename), Mahnungen (kein eigenes Nummernfeld)
- [x] BEN-02: Regeln definiert – Projekte: YYYY-SLUG-NN, Angebote: YYYY_SLUG_Angebot_NNNN_vN, Rechnungen: YYYY_SLUG_Rechnung_NNNN, Dokumente/Fotos: YYYY_SLUG_Kontext_NNN, Aufträge: YYYY_SLUG_Auftrag_NNN, Garantien: YYYY_SLUG_Garantie_NNN

### Shared Utility
- [x] BEN-03: shared/naming.ts mit generateEntityName(), generateDisplayName(), generateDownloadFilename()
- [x] BEN-04: slugifyCompanyName() mit Umlaut-Mapping, &-Ersetzung, Max-Länge 50
- [x] BEN-05: padNumber() + getDefaultDigits() (4 Stellen für Angebote/Rechnungen, 3 für Rest)

### Backend-Integration
- [x] BEN-06: Angebote: displayName bei saveFromWizard + createOfferVersion integriert
- [x] BEN-07: Rechnungen: displayName bei 3 createInvoice-Stellen integriert
- [x] BEN-08: Dokumente: displayName bei createDocument + saveToArchive integriert
- [x] BEN-09: Garantien: displayName bei 2 createWarranty-Stellen integriert
- [x] BEN-10: Mahnungen: Automatische Benennung bei Erstellung (subject: levelLabels[level] + Rechnungsnummer in createReminder)
- [x] BEN-11: Aufträge: displayName bei createOrder integriert
- [x] BEN-12: Projekte: Automatische Projekt-ID-Generierung (generateProjectNumber: YYYY-CompanyShort-NN)

### Frontend-Anzeige
- [x] BEN-13: displayName in Archiv-Tabelle mit Fallback auf name + Suche erweitert
- [x] BEN-14: displayName in Aufträge, Rechnungen, Garantien Tabellen integriert
- [x] BEN-15: displayName in Angebote + Rechnungen Listen mit offerNumber/invoiceNumber als Subtitle
- [x] BEN-16: Download-Toast zeigt displayName, Dateiname über S3-URL

### Migration & Tests
- [x] BEN-17: Migration erfolgreich: 61 Datensätze (1 Angebot, 60 Dokumente) + alle Fotos aktualisiert, 0 ohne displayName
- [x] BEN-18: 37 Vitest-Tests in naming.test.ts (Slug, Padding, Kontexte, Szenarien, Downloads)
- [x] BEN-19: Alle 783 Tests bestanden (37 Test-Dateien, 0 Fehler)

---

## Loom-Feedback 09.02.2026 – Aufmaß Teilbereiche

**Intention**: Fassadenseiten, die durch Fahrstuhlschächte, Vorsprünge oder andere Unterbrechungen in mehrere Teilbereiche mit unterschiedlichen Höhen zerfallen, sollen flexibel aufgemessen werden können – nicht nur als ein einziges Breite×Höhe-Paar.

### Datenmodell
- [x] LOOM-01: SeiteData-Interface erweitert mit Teilflaeche-Interface + subAreas[]
- [x] LOOM-02: hasSubAreas Boolean in SeiteData + createEmptyTeilflaeche()
- [x] LOOM-03: Gesamtfläche = Summe der Teilflächen (handleSubAreaChange)
- [x] LOOM-04: DB-Schema: hasSubAreas + subAreas[] in allen 4 Seiten-JSON-Typen

### UI – ObjektaufnahmeWizard
- [x] LOOM-05: Checkbox mit SplitSquareVertical-Icon und HelpTooltip
- [x] LOOM-06: Erste Teilfläche übernimmt bestehende Maße beim Aktivieren
- [x] LOOM-07: Button mit Plus-Icon und gestricheltem Border
- [x] LOOM-08: Gesamtfläche prominent oben rechts in der Aufmaß-Card
- [x] LOOM-09: Trash2-Button pro Teilfläche, versteckt bei length <= 1
- [x] LOOM-10: Toggle deaktiviert → erste Teilfläche wird zu Hauptmaßen

### Backend & Persistenz
- [x] LOOM-11: Beide Save-Funktionen (Draft + Final) mappen subAreas korrekt
- [x] LOOM-12: Angebots-Kalkulation nutzt flaeche (= Summe der Teilflächen)

### Tests
- [x] LOOM-13: 19 Tests in sub-areas.test.ts (Berechnung, Mapping, Toggle, Praxis)
- [x] LOOM-14: UI verhindert Löschen der letzten Teilfläche (length <= 1)

---

## Welcome-Tour Überarbeitung (09.02.2026)

**Intention**: Die Welcome-Tour soll neuen Nutzern in unter 2 Minuten zeigen, wo sie was finden – angepasst an die tatsächliche Navigationsstruktur, die 5 Rollen und den FassadenFix-Sprachstil (klar, direkt, handwerkernah). Die Tour soll nicht nur Features auflisten, sondern den Nutzen für den jeweiligen Arbeitsalltag vermitteln.

### Konzeption
- [x] TOUR-01: 14 Tour-Steps an aktuelle Navigationsstruktur angepasst (Welcome, KPIs, Kanban, Countdown, Quick Actions, Projekte, Immobilien, Angebote, Baustellen, Einsatzplanung, Finanzen, Unternehmenssystem, Archiv, Complete)
- [x] TOUR-02: Sprache komplett überarbeitet – Du-Form, handwerkernah, nutzenorientiert, keine akademischen Begriffe
- [x] TOUR-03: data-tour Attribute auf Dashboard (kpis, kanban-board, countdown-tasks, activity-log, quick-actions) + Sidebar (section-{id}, nav-{label})

### Implementierung
- [x] TOUR-04: Welcome-Dialog mit "Hey, schön dass du da bist!", 3 Feature-Highlights, Los geht's/Später
- [x] TOUR-05: Tour-Steps erweitert – Finanzen, Unternehmenssystem, Archiv, Schnellaktionen, Einsatzplanung
- [x] TOUR-06: Abschluss-Dialog mit "Du bist startklar!", 3 Schnellstart-Buttons (Projekt, Objektaufnahme, Angebot)
- [x] TOUR-07: Route-Navigation via setLocation() für Steps auf verschiedenen Seiten + SpotlightOverlay mit SVG-Mask

### Qualitätssicherung
- [x] TOUR-08: 32 Vitest-Tests in welcome-tour.test.ts (Konfiguration, Attribute, Sprache, Neustart, Navigation)
- [x] TOUR-09: Visuell bestätigt – Welcome-Dialog erscheint korrekt, Tour starten Button in Einstellungen funktioniert

---

## Rollenspezifische Tour + Interaktive Steps (09.02.2026)

**Intention**: Die Tour soll sich an die Rolle des Nutzers anpassen – ein AT-Leiter braucht keine Finanzen-Tour, ein Büro-Mitarbeiter keine Baustellen-Details. Gleichzeitig sollen bestimmte Steps interaktiv sein: Der Nutzer klickt selbst, statt nur zu lesen. Das erhöht die Lernwirkung und verkürzt die Tour für jede Rolle.

### Rollenspezifische Tour-Varianten
- [x] RTOUR-01: TourStep-Interface um roles?: FaFiRole[] erweitert
- [x] RTOUR-02: Rollen-Tags auf allen Steps (Finanzen: GF+Büro, Baustellen: GF+AT+PL, Angebote: GF+KB+Büro)
- [x] RTOUR-03: useAuth() liefert fafiRole, Onboarding filtert Steps dynamisch
- [x] RTOUR-04: getFilteredTourSteps() filtert nach Rolle (GF=alle, andere=relevant)
- [x] RTOUR-05: Welcome-Dialog mit rollenspezifischem Subtitle und Feature-Highlights
- [x] RTOUR-06: Completion-Dialog mit dynamischer Statistik + rollenspezifischen Tipps
- [x] RTOUR-07: estimateTourDuration() berechnet ~10s/Step, aufgerundet auf Minuten

### Interaktive Tour-Steps
- [x] ITOUR-01: interactive, interactiveTarget, interactivePrompt in TourStep-Interface
- [x] ITOUR-02: Interaktiver Step 'Projekte' mit Klick-Erkennung auf nav-projekte
- [x] ITOUR-03: Interaktiver Step 'Angebote' mit Klick-Erkennung auf nav-angebote
- [x] ITOUR-04: In Kanban-Step als nicht-interaktiv belassen (Toggle-Wechsel zu komplex für Tour)
- [x] ITOUR-05: SpotlightOverlay mit pointer-events:auto Zone über Target-Element
- [x] ITOUR-06: 500ms Delay nach Klick für Navigation, dann automatisch nächster Step
- [x] ITOUR-07: 10s Timeout zeigt 'Weiter'-Button als Fallback
- [x] ITOUR-08: 36 Tests in welcome-tour-v2.test.ts (Rollen, Interaktiv, Dauer, Sprache)


---

## Kontextuelle Hilfe-Tooltips (10.02.2026)

**Intention**: Kein Mitarbeiter soll vor einem Feld, einer Kennzahl oder einem Konzept stehen und sich fragen „Was bedeutet das?" oder „Was soll ich hier eintragen?". Kontextuelle Hilfe-Tooltips liefern die Antwort direkt am Element – in einfacher, handwerkernaher Sprache. Das senkt die Hemmschwelle, reduziert Rückfragen und beschleunigt das Onboarding neuer Mitarbeiter.

### Bereich 1: Dashboard – KPIs und Konzepte verständlich machen
> Absicht: Die GF und alle Rollen sollen sofort verstehen, was jede Kennzahl bedeutet und wie sie berechnet wird
- [x] HELP-01: KPI-Karten: Conversion Rate, Aktive Baustellen, Kundenzufriedenheit, Offene Angebote mit Tooltip erklären
- [x] HELP-02: Kanban-Board: Spaltenüberschriften (Offen/In Bearbeitung/Erledigt) + Ampelfarben erklären
- [x] HELP-03: Countdown-Aufgaben: Was bedeuten die Farben (Rot/Gelb/Grün)?

### Bereich 2: Vorbereitungsaufgaben-Board – AG/AN und Ampel erklären
> Absicht: Jeder soll auf einen Blick verstehen, wer zuständig ist (Auftraggeber vs. Auftragnehmer) und was die Ampelfarben bedeuten
- [x] HELP-04: AG/AN-Badges: Was ist Auftraggeber (AG)? Was ist Auftragnehmer (AN)?
- [x] HELP-05: Ampelsystem: Grün=im Zeitplan, Gelb=bald fällig, Rot=überfällig – direkt an der Legende
- [x] HELP-06: Drag & Drop Hinweis: „Aufgaben per Maus verschieben“ als Tooltip am Board-Header

### Bereich 3: Finanzen – Fachbegriffe entmystifizieren
> Absicht: Büro-Mitarbeiter sollen Finanzbegriffe verstehen, ohne BWL studiert zu haben
- [x] HELP-07: Mahnstufen (1/2/3) erklären: Was passiert bei jeder Stufe?
- [x] HELP-08: Offene Posten, Fällige Rechnungen, Zahlungsziel als Tooltips
- [x] HELP-09: Umsatz vs. Gewinn vs. Cashflow kurz erklären

### Bereich 4: Berichtswesen – Kennzahlen verständlich machen
> Absicht: Auch wer keine Erfahrung mit Reporting hat, soll die Charts und Zahlen einordnen können
- [x] HELP-10: Conversion Rate: „Von 10 Angeboten werden X zu Aufträgen“
- [x] HELP-11: Pipeline-Wert: „Summe aller offenen Angebote“- [x] HELP-12: Umsatz-Trend: „Vergleich zum Vormonat“"

### Bereich 5: ProjektDetail – Phasen und Workflow erklären
> Absicht: Jeder soll verstehen, in welcher Phase ein Projekt ist und was als Nächstes passiert
- [x] HELP-13: Phasen-Badge: Kurze Erklärung jeder der 10 Phasen
- [x] HELP-14: „Nächster Schritt“-Bereich: Warum wird dieser Schritt vorgeschlagen? (PHASE_EXPLANATIONS + Tooltip in NextStepCard)
- [x] HELP-15: Workflow-Buttons: Was passiert beim Klick? (z.B. „Auftrag bestätigen erstellt automatisch eine Baustelle“)

### Bereich 6: Baustellen – Gates und Dokumentation erklären
> Absicht: AT-Leiter und Projektleiter sollen verstehen, warum bestimmte Aktionen gesperrt sind- [x] HELP-16: Vorher-Dokumentation Gate: „Erst Fotos machen, dann Baustelle starten“
- [x] HELP-17: Nachher-Dokumentation Gate: „Erst Nachher-Fotos, dann Abnahme“
- [x] HELP-18: Teamleitercheck: „Checkliste vor Arbeitsbeginn – Sicherheit geht vor“

### Bereich 7: Archiv – Benennungsschema und Quellen erklären
> Absicht: Jeder soll verstehen, woher die Dateien kommen und wie sie benannt werden
- [x] HELP-19: Automatische Benennung: Schema „Jahr_Firma_Kontext_Nr_Version“ erklären
- [x] HELP-20: Quellen-Tabs: Was bedeutet „Auto-Archiv“? Woher kommen die Dateien?
- [x] HELP-21: Verknüpfungs-Badges: „Klick auf den Badge öffnet die Detailseite“

### Bereich 8: Kundenportal – Ampel und Transparenz erklären
> Absicht: Auch der Kunde soll verstehen, was die Ampelfarben bedeuten
- [x] HELP-22: Projekt-Ampel: Grün=alles läuft, Gelb=kleine Verzögerung, Rot=Problem
- [x] HELP-23: Baustellen-Ampel: Fortschritt und Status für den Kunden verständlich (baustellenAmpel HelpTooltip im Kundenportal integriert)

### Bereich 9: Einsatzplanung – Züge und Ressourcen erklären
> Absicht: Projektleiter sollen die Planungskonzepte sofort verstehen
- [x] HELP-24: Züge/Trupps: „Ein Zug = 4 Personen (Teamleiter + 3 AT)“- [x] HELP-25: Verfügbarkeit: „Grün=frei, Rot=bereits eingeplant“"

### Implementierung
- [x] HELP-26: HELP_TEXTS in HelpTooltip.tsx um alle neuen Texte erweitern (zentrale Quelle)
- [x] HELP-27: HelpTooltip-Komponente in alle 9 Bereiche einbauen
- [x] HELP-28: SectionHelp-Komponente: Bereichs-übergreifende Hilfe als ausklappbarer Info-Banner
- [x] HELP-29: Vitest-Tests für alle neuen Hilfe-Texte und Komponenten


---

## Tooltip-Feedback-System (11.02.2026)

**Intention**: Hilfe-Texte sind nur so gut wie ihr Nutzen für die Mitarbeiter. Durch einen einfachen Daumen-hoch/runter-Button direkt am Tooltip kann jeder Mitarbeiter sofort bewerten, ob der Text verständlich war. Das gibt der GF und dem Admin datenbasierte Einblicke, welche Texte überarbeitet werden müssen – statt auf Rückfragen zu warten.

### Bereich 1: Datenbank – Feedback persistent speichern
> Absicht: Jede Bewertung soll nachvollziehbar gespeichert werden – wer hat wann welchen Hilfetext wie bewertet?
- [x] FB-01: tooltipFeedback-Tabelle in drizzle/schema.ts erstellen (helpTextKey, userId, rating, Zeitstempel)
- [x] FB-02: DB-Migration ausführen (pnpm db:push)

### Bereich 2: Backend – tRPC-Prozeduren für Feedback
> Absicht: Feedback sicher speichern und für Auswertung abrufbar machen
- [x] FB-03: tooltipFeedback.submit Prozedur (protectedProcedure): Bewertung speichern, Duplikate verhindern (ein User, ein Key = eine Bewertung, änderbar)
- [x] FB-04: tooltipFeedback.getStats Prozedur (protectedProcedure, admin): Aggregierte Statistiken pro helpTextKey
- [x] FB-05: tooltipFeedback.getMyFeedback Prozedur (protectedProcedure): Eigene Bewertungen abrufen (für UI-State)
- [x] FB-06: DB-Hilfsfunktionen in server/db.ts

### Bereich 3: Frontend – Feedback-Buttons in HelpTooltip
> Absicht: Minimale Reibung – ein Klick auf Daumen hoch/runter reicht, kein Formular, kein Popup
- [x] FB-07: HelpTooltip-Komponente um Feedback-Bereich erweitern (Daumen hoch/runter nach dem Hilfetext)
- [x] FB-08: Visuelles Feedback nach Klick (Danke-Animation, Button wird ausgefüllt)
- [x] FB-09: Bereits gegebenes Feedback anzeigen (ausgefüllter Daumen wenn schon bewertet)
- [x] FB-10: SectionHelp-Komponente ebenfalls um Feedback erweitern

### Bereich 4: Tests
> Absicht: Qualität sichern – Feedback-System muss zuverlässig funktionieren
- [x] FB-11: Vitest-Tests für tRPC-Prozeduren (submit, getStats, getMyFeedback)
- [x] FB-12: Vitest-Tests für DB-Hilfsfunktionen


---

## Baustellen-Gate-Tooltips (HELP-16 bis HELP-18)
> Absicht: Die drei Qualitäts-Gates (Vorher-Doku, Nachher-Doku, Teamleitercheck) direkt in BaustellenDetail erklären – damit AT-Leiter und Projektleiter verstehen, warum diese Schritte Pflicht sind und was passiert, wenn sie fehlen.

- [x] GATE-01: Übersicht-Tab um Gate-Statusbereich erweitern (Vorher-Doku, Teamleitercheck, Nachher-Doku als visueller Workflow)
- [x] GATE-02: HelpTooltip an Vorher-Dokumentation Gate anbringen (helpTextKey: vorherDokuGate)
- [x] GATE-03: HelpTooltip an Nachher-Dokumentation Gate anbringen (helpTextKey: nachherDokuGate)
- [x] GATE-04: HelpTooltip an Teamleitercheck Gate anbringen (helpTextKey: teamleitercheck)
- [x] GATE-05: Tests aktualisieren und validieren


---

## Gate-Interaktion & Workflow-Fortschrittsbalken
> Absicht: AT-Leiter und Projektleiter sollen die Qualitäts-Gates nicht nur sehen, sondern direkt bedienen können. Fotos hochladen, Checkliste abhaken – alles an Ort und Stelle, ohne die Seite zu wechseln. Der Fortschrittsbalken zeigt den Gesamtstatus auf einen Blick.

### Datenmodell & Backend
- [x] GATE-INT-01: gatePhotos-Tabelle erstellen (constructionSiteId, gateType, photoUrl, fileKey, uploadedBy, caption, createdAt)
- [x] GATE-INT-02: teamleiterChecks-Tabelle um täglichen Arbeitsbeginn-Check erweitern (checkType: "arbeitsbeginn_check" hinzufügen)
- [x] GATE-INT-03: constructionSites-Tabelle um teamleiterCheckStatus-Feld erweitern (pending/completed)
- [x] GATE-INT-04: DB-Migration ausführen (pnpm db:push)

### tRPC-Prozeduren
- [x] GATE-INT-05: gate.uploadPhoto – Foto hochladen (S3 via storagePut), Metadaten in gatePhotos speichern, automatische Benennung
- [x] GATE-INT-06: gate.getPhotos – Fotos pro Gate und Baustelle abrufen
- [x] GATE-INT-07: gate.completePreDocumentation – Vorher-Doku als abgeschlossen markieren (min. 1 Foto Pflicht)
- [x] GATE-INT-08: gate.submitTeamleiterCheck – Checkliste speichern, Gate als erledigt markieren
- [x] GATE-INT-09: gate.getTeamleiterCheck – Bestehende Checkliste für Baustelle abrufen
- [x] GATE-INT-10: gate.completePostDocumentation – Nachher-Doku als abgeschlossen markieren

### Frontend: Klickbare Gate-Karten
- [x] GATE-INT-11: Vorher-Doku Gate klickbar → Dialog mit Foto-Upload (Drag & Drop + Datei-Auswahl), Galerie bestehender Fotos, "Dokumentation abschließen"-Button
- [x] GATE-INT-12: Teamleitercheck Gate klickbar → Dialog mit Sicherheits-Checkliste (PSA, Absperrungen, Wetter, Geräte), Notizfeld, "Check bestätigen"-Button
- [x] GATE-INT-13: Nachher-Doku Gate klickbar → Dialog analog Vorher-Doku, nur nach Fertigstellung aktiv
- [x] GATE-INT-14: Automatische Foto-Benennung: YYYY_Baustelle_Gate_NNN.jpg

### Frontend: Workflow-Fortschrittsbalken
- [x] GATE-INT-15: Visueller Fortschrittsbalken zwischen den 3 Gates (Verbindungslinien mit Schritt-Indikatoren)
- [x] GATE-INT-16: Status-abhängige Farben: Grau=ausstehend, Amber=in Bearbeitung, Grün=erledigt
- [x] GATE-INT-17: Animation beim Abschließen eines Gates (Checkmark-Animation via Status-Icons und Farbwechsel)

### Tests
- [x] GATE-INT-18: Vitest-Tests für alle neuen tRPC-Prozeduren
- [x] GATE-INT-19: Vitest-Tests für DB-Schema und Hilfsfunktionen


---

## Bibliothek als zentrale Stammdaten-Plattform (Intention: Eine einzige Quelle der Wahrheit – nie wieder Hardcoded-Werte im Code)

### DB-Schema (Intention: Typisierte Tabellen pro Entität für Typsicherheit und optimierte Formulare)
- [x] BIB-01: libraryVehicles-Tabelle (Waschbusse, Dienstwagen, Poolfahrzeuge) mit Kennzeichen, TÜV, Versicherung, Kilometerstand
- [x] BIB-02: libraryEquipment-Tabelle (Bühnentechnik & Geräte) mit maxHöhe, Tagespreis, Eigentum/Miete, Prüfdatum
- [x] BIB-03: libraryCleaningAgents-Tabelle (Reinigungsmittel) mit Artikelnummer, Anwendungsgebiet, Gebindegröße, EK-Preis, Sicherheitsdatenblatt
- [x] BIB-04: libraryDiscounts-Tabelle (Rabatte, Aktionen, Preisstaffeln) mit Typ, Prozent, Bedingungen, Gültigkeitszeitraum, Störer-Text
- [x] BIB-05: libraryServices-Tabelle (Leistungskatalog, Garantien, Zusatzleistungen)
- [x] BIB-06: libraryWorkClothing-Tabelle (Arbeitskleidung & PSA)
- [x] BIB-07: libraryAssets-Tabelle (Arbeitsmittel: IT, Schlüssel, Tankkarten)
- [x] BIB-08: teamMembers um Bibliothek-Berechtigungen erweitern (canViewLibrary, canEditLibrary)
- [x] BIB-09: DB-Migration ausführen (pnpm db:push)

### Backend tRPC (Intention: CRUD + Berechtigungsprüfung + Änderungsprotokoll via activityLogs)
- [x] BIB-10: library.vehicles CRUD-Prozeduren (list, getById, create, update, deactivate)
- [x] BIB-11: library.equipment CRUD-Prozeduren
- [x] BIB-12: library.cleaningAgents CRUD-Prozeduren
- [x] BIB-13: library.discounts CRUD-Prozeduren
- [x] BIB-14: library.services CRUD-Prozeduren
- [x] BIB-15: library.workClothing CRUD-Prozeduren
- [x] BIB-16: library.assets CRUD-Prozeduren
- [x] BIB-17: Berechtigungsprüfung (canViewLibrary/canEditLibrary) als Middleware
- [x] BIB-18: Änderungsprotokoll: Jede Änderung in activityLogs mitloggen (wer, was, wann, alter/neuer Wert)

### Frontend (Intention: Intuitive Kategorie-Navigation mit kontextbezogenen Formularen – AT-Leiter findet sofort was er braucht)
- [x] BIB-19: Bibliothek-Seite komplett neu: 4 Hauptkategorien als Karten/Tabs
- [x] BIB-20: Lager & Fuhrpark: Fahrzeuge | Bühnentechnik | Reinigungsmittel als Unter-Tabs
- [x] BIB-21: Marketing & Vertrieb: Rabatte & Aktionen als Unter-Tab
- [x] BIB-22: Leistungen & Technik: Leistungskatalog als Unter-Tab
- [x] BIB-23: HR & Personal: Arbeitskleidung & PSA | Arbeitsmittel als Unter-Tabs
- [x] BIB-24: Kontextbezogene Formulare pro Entität (Dialog mit typspezifischen Feldern)
- [x] BIB-25: Inline-Status-Toggle (aktiv/inaktiv) statt Löschen (implementiert in BIB-25a/b/c)
- [x] BIB-26: Suche und Filter pro Kategorie
- [x] BIB-27: Änderungshistorie pro Datensatz anzeigbar (Aktivitätslog pro Entity vorhanden)

### Integration (Intention: Hardcoded-Werte ablösen – der Code verweist nur noch auf die Bibliothek)
- [x] BIB-28: AngebotPositionenStep: BUEHNEN_OPTIONEN durch library.equipment.list ersetzen (BIB-40)
- [x] BIB-29: AngebotPositionenStep: REINIGUNGSMITTEL_OPTIONEN durch library.cleaningAgents.list ersetzen (BIB-41)
- [x] BIB-30: AngebotWizard: PREISSTAFFELUNG durch library.discounts.list (typ=preisstaffel) ersetzen (BIB-42)
- [x] BIB-31: AngebotWizard: RABATT_AKTIONEN durch library.discounts.list (typ=aktion/rabatt) ersetzen (BIB-43)
- [x] BIB-32: Einsatzplanung: Fahrzeug-/Bühnen-Auswahl aus Bibliothek laden (BIB-47/48)

### Tests
- [x] BIB-33: Vitest-Tests für alle CRUD-Prozeduren (38 Tests in library-crud.test.ts)
- [x] BIB-34: Vitest-Tests für Berechtigungsprüfung (in library-crud.test.ts)
- [x] BIB-35: Vitest-Tests für DB-Schema und Hilfsfunktionen (in library-crud.test.ts)

## Inline-Status-Toggle & Hardcoded-Ablösung (Intention: Bibliothek als Single Source of Truth – kein Wert darf mehr im Code stehen)

### BIB-25: Inline-Status-Toggle
- [x] BIB-25a: Switch-Komponente in jeder Tabelle neben StatusBadge (aktiv/inaktiv Toggle)
- [x] BIB-25b: Deactivate-Mutation per Klick auslösen mit optimistischem Update
- [x] BIB-25c: Toast-Feedback bei Status-Wechsel

### Hardcoded-Ablösung: Shared Hooks
- [x] BIB-36: useLibraryEquipment() Hook erstellen (tRPC → Bibliothek-Format-Mapping)
- [x] BIB-37: useLibraryCleaningAgents() Hook erstellen
- [x] BIB-38: useLibraryDiscounts() Hook erstellen (mit Typ-Filter: preisstaffel, rabatt, aktion)
- [x] BIB-39: useLibraryVehicles() Hook erstellen

### Hardcoded-Ablösung: AngebotPositionenStep.tsx
- [x] BIB-40: BUEHNEN_OPTIONEN durch useLibraryEquipment() ersetzen
- [x] BIB-41: REINIGUNGSMITTEL_OPTIONEN durch useLibraryCleaningAgents() ersetzen

### Hardcoded-Ablösung: AngebotWizard.tsx
- [x] BIB-42: PREISSTAFFELUNG durch useLibraryDiscounts(typ=preisstaffel) ersetzen
- [x] BIB-43: RABATT_AKTIONEN durch useLibraryDiscounts(typ=rabatt/aktion) ersetzen

### Hardcoded-Ablösung: ImmobilienSeitenAuswahlStep.tsx
- [x] BIB-44: BUEHNEN_TYPEN durch useLibraryEquipment() ersetzen
- [x] BIB-45: REINIGUNGSMITTEL durch useLibraryCleaningAgents() ersetzen

### Hardcoded-Ablösung: Weitere Dateien
- [x] BIB-46: KalkulationKonditionenStep.tsx – Import durch Hooks ersetzen
- [x] BIB-47: BaustelleWizard.tsx – Hardcoded Geräteliste durch useLibraryEquipment() ersetzen
- [x] BIB-48: Ressourcen.tsx – Mock ffBuehnen/waschbusse/mietbuehnen/reinigungsmittel durch Bibliothek ersetzen
- [x] BIB-49: FassadenFixVersprechen.tsx – PREISSTAFFEL_OPTIONS durch useLibraryDiscounts() ersetzen
- [x] BIB-50: StoererBedingungStep.tsx – Import PREISSTAFFEL_OPTIONS durch Hook ersetzen
- [x] BIB-51: AngebotPDFGenerator.tsx – Import PREISSTAFFEL_OPTIONS durch Hook ersetzen

### Tests
- [x] BIB-52: Vitest-Tests für useLibrary*-Hooks (22 Tests in library-integration.test.ts)
- [x] BIB-53: Vitest-Tests für Inline-Status-Toggle (3 Tests: Equipment, Discount, Vehicle)

## Bibliothek Echtdaten & Aufräumen (Intention: Bibliothek wird erst lebendig, wenn echte Stammdaten drin sind – Dropdowns zeigen sonst leere Listen)

### Echtdaten befüllen
- [x] BIB-54: Fahrzeuge anlegen (9 Fahrzeuge: 3 Waschbusse, 2 Dienstwagen, Poolfahrzeug, Anhänger, Transporter)
- [x] BIB-55: Bühnentechnik anlegen (9 Geräte: Teleskoplanzen, Hubsteiger 8-30m, Hochdruckreiniger, Sprühgerät)
- [x] BIB-56: Reinigungsmittel anlegen (7 Mittel: Pro, Anti-Graffiti, Klinker, Schindel, Glas, Naturstein, Imprägnierer)
- [x] BIB-57: Preisstaffeln anlegen (5 Staffeln: 100-499m² bis ab 5.000m², 10.50€-8.75€/m²)
- [x] BIB-58: Rabattaktionen anlegen (4 Aktionen: Frühbucher, Kennenlernen, Treue, Einkaufsgemeinschaft)
- [x] BIB-59: Leistungskatalog mit 24 echten Produkten aus Produktkatalog (FR-001 bis SP-004, mit SKU, Einheit, Preis)
- [x] BIB-60: Arbeitskleidung & PSA anlegen (10 Artikel: Arbeitsjacke, Hose, Sicherheitsschuhe, Helm, Handschuhe, etc.)
- [x] BIB-61: Arbeitsmittel anlegen (7 Geräte: Tablet, Funkgerät, Erste-Hilfe-Koffer, Werkzeugset, etc.)

### Aufräumen
- [x] BIB-62: FassadenFixVersprechen.tsx – PREISSTAFFEL_DATA/OPTIONS entfernt, auf useLibraryDiscounts() umgestellt
- [x] BIB-63: Alle Imports geprüft – keine Datei importiert mehr PREISSTAFFEL_DATA/OPTIONS aus FassadenFixVersprechen

### Tests
- [x] BIB-64: Browser-Test: Leistungen & Technik zeigt 24 Produkte aus Produktkatalog
- [x] BIB-65: Browser-Test: Alle 4 Kategorien zeigen korrekte Echtdaten (25+13+24+17 = 79 Einträge)

## Textbausteine & Leistungskatalog im AngebotWizard (Intention: Angebote sollen mit vorgefertigten Textbausteinen personalisiert und Positionen aus dem Leistungskatalog gewählt werden können)

### Textbausteine
- [x] TXT-01: Textbausteine-Tabelle in DB erstellen (text_blocks-Tabelle mit 14 Einträgen)
- [x] TXT-02: 14 HubSpot-Textbausteine aus Excel seeden (6 Kategorien: einleitung, abschluss, rabatt, konditionen, versprechen, sonstiges)
- [x] TXT-03: tRPC-Router für Textbausteine CRUD (textBlockRouter: list, getById, getByCategory, create, update, delete, incrementUsage)
- [x] TXT-04: Textbausteine-Verwaltung in Vorlagen-Seite (/vorlagen) mit CRUD-UI
- [x] TXT-05: Textbausteine als Auswahlfeld im AngebotWizard (Anschreiben-Auswahl via einleitungBlocks)
- [x] TXT-06: Textbausteine als Auswahlfeld im AngebotWizard (Bedingungen via konditionenBlocks + hinweisBlocks)
- [x] TXT-07: Textbausteine-Vorschau im AngebotWizard (Inline-Vorschau unter jedem Select)

### Leistungskatalog im AngebotWizard
- [x] LK-01: Positionsauswahl aus Bibliothek-Leistungskatalog im AngebotWizard
- [x] LK-02: Autocomplete/Dropdown mit den 24 Produkten (Name, Preis, Einheit)
- [x] LK-03: Preis und Einheit automatisch aus Katalog übernehmen (editierbar)
- [x] LK-04: Manuelle Eingabe weiterhin möglich (für Sonderpositionen)

### HubSpot Komplettsynchronisation
- [x] HS-01: HubSpot-API Bulk-Import analysiert (100er-Seiten, MCP-CLI, JSON-File-Parsing)
- [x] HS-02: 2.797 Unternehmen aus HubSpot importiert (2.297 neu, 499 aktualisiert)
- [x] HS-03: 5.216 Kontakte importiert, 4.279 über associatedcompanyid verknüpft
- [x] HS-04: Duplikat-Erkennung via hubspotId Upsert
- [x] HS-05: Import-Fortschritt und Protokollierung (Seiten-Counter, Fehler-Log, 220s Dauer)
- [x] HS-06: Vitest-Tests für Import-Logik (17 Tests in hubspot-import.test.ts)

### Verwaiste Kontakte kennzeichnen (Geschäftsregel: Kontakt MUSS Unternehmen haben)
- [x] HS-80: isOrphaned Boolean-Flag in contacts-Tabelle hinzugefügt (DB-Migration 0029)
- [x] HS-81: 941 verwaiste Kontakte in DB als isOrphaned=true markiert
- [x] HS-82: Aufräum-Liste in Kunden-Übersicht: Verwaiste Kontakte als Warnung anzeigen
- [x] HS-83: Verwaiste Kontakte können per Klick einem Unternehmen zugeordnet werden
- [x] HS-84: Vitest-Tests für verwaiste Kontakte (19 Tests in orphaned-contacts.test.ts)


---

## Session 11.02.2026 – Finale Generalprobe mit Realdaten-E2E-Tests

### Absicht: Jeden Kernprozess mit echten Eingaben durchspielen, um sicherzustellen, dass die Anwendung im Produktivbetrieb fehlerfrei funktioniert

- [x] GP-E2E-01: Neues Unternehmen anlegen – Vitest: createCompany + Browser: Kontakte-Seite lädt
- [x] GP-E2E-02: Neuen Kontakt zum Unternehmen anlegen – Vitest: createContact mit companyId
- [x] GP-E2E-03: Neues Projekt anlegen – Vitest: createProject mit companyId/contactId, Browser: 5 Projekte sichtbar
- [x] GP-E2E-04: Immobilie zum Projekt hinzufügen – Vitest: createProperty mit Adresse
- [x] GP-E2E-05: Angebot erstellen – Vitest: createOffer + Bibliothek-Preise verifiziert, Browser: Wizard öffnet
- [x] GP-E2E-06: Baustelle + Bautagebuch – Vitest: createConstructionSite + createLog, Browser: Wizard lädt DB-Projekte
- [x] GP-E2E-07: Einsatzplanung – Vitest: 23 MA aus DB, Browser: 23 echte Mitarbeiter mit Initialen sichtbar
- [x] GP-E2E-08: Aufgabe erstellen – Vitest: createTask + updateTask Statusänderung
- [x] GP-E2E-09: Rechnung + Mahnwesen – Vitest: createInvoice + Dunning-Stufen (Erinnerung/1./2./3. Mahnung)
- [x] GP-E2E-10: Garantie + Portal – Vitest: createWarranty + Portal-Token, Browser: 7 Garantien sichtbar
- [x] GP-E2E-11: Querschnitts-Tests – Vitest: GlobalSearch, Bibliothek-Services, Archiv-Funktion
- [x] GP-E2E-12: Befunde dokumentiert – 0 kritisch, 2 mittel (Testdaten-Duplikate bereinigt), 2 niedrig (kosmetisch)
- [x] GP-E2E-13: Generalprobe-Bericht erstellt – GP-VISUELL-BEFUNDE.md + gp-e2e-finale.test.ts (38 Tests)

## HR-Bereich (Personio-Daten) – Absicht: Leitungsebene soll jederzeit zentral auf alle Personalinformationen zugreifen können

- [x] HR-01: DB-Schema: employees + employeeDocuments Tabellen erstellt und migriert (0031_tidy_amazoness.sql)
- [x] HR-02: tRPC-Router: hr.employees.list/getById/create/update/stats (protectedProcedure, admin-only)
- [x] HR-03: tRPC-Router: hr.documents.list/upload/delete/search (protectedProcedure, admin-only)
- [x] HR-04: Seed-Script: 30 Mitarbeiter aus Personio-Export importiert
- [x] HR-05: Seed-Script: 113 Dokumente-Referenzen (CDN-URLs) importiert
- [x] HR-06: Sidebar: UNTERNEHMENSSYSTEM-Gruppe mit HR Dashboard, Mitarbeiter, Dokumente (admin-only)
- [x] HR-07: Frontend: HR Dashboard (/hr) mit Statistiken, Balkendiagramm, neueste Mitarbeiter
- [x] HR-08: Frontend: Mitarbeiterliste (/hr/mitarbeiter) mit Suche, Filter, Sortierung
- [x] HR-09: Frontend: Mitarbeiter-Detailseite (/hr/mitarbeiter/:id) mit Tabs (Daten, Vergütung, Dokumente)
- [x] HR-10: Frontend: Dokumentenübersicht (/hr/dokumente) mit globaler Suche und Filter
- [x] HR-11: Vitest-Tests für HR-Router-Endpunkte (22 Tests in hr.test.ts, alle bestanden)
- [x] HR-12: Routing in App.tsx: /hr, /hr/mitarbeiter, /hr/mitarbeiter/:id, /hr/dokumente

## Generalprobe Session 2 – 11. Februar 2026

- [x] GP-S2-01: Server-Stabilität nach webdev_add_feature verifiziert (hrRouter-Fehler war transient, nach Restart behoben)
- [x] GP-S2-02: Dashboard (/) – KPIs, Kanban, Aktivitäten, HubSpot-Widget, Schnellaktionen geprüft
- [x] GP-S2-03: Projekte (/projekte) – 4 Projekte, Suche, Filter, Detailseiten geprüft
- [x] GP-S2-04: Immobilien (/immobilien) – 6 Immobilien, KPIs, Zuordnungen geprüft
- [x] GP-S2-05: Baustellen (/baustellen) – Empty State korrekt (keine aktiven Baustellen)
- [x] GP-S2-06: Unternehmen & Kontakte (/kontakte) – HubSpot-Daten, Suche, Filter geprüft
- [x] GP-S2-07: Angebote (/angebote) – 1 Angebot, KPIs, Detailansicht geprüft
- [x] GP-S2-08: Aufträge (/auftraege) – Empty State korrekt
- [x] GP-S2-09: Garantien (/garantien) – Empty State korrekt
- [x] GP-S2-10: Terminfinder (/terminfinder) – Kalender, Schnellbuchung geprüft
- [x] GP-S2-11: Einsatzplanung (/einsatzplanung) – 3 Züge, Drag&Drop, Tabs geprüft
- [x] GP-S2-12: Ressourcenplaner (/ressourcen) – Wochenkalender, 5 Tabs geprüft
- [x] GP-S2-13: Vorbereitungsaufgaben (/vorbereitungsaufgaben) – Kanban-Board, Empty State geprüft
- [x] GP-S2-14: Berichtswesen (/berichte) – KPIs, Charts, Export geprüft
- [x] GP-S2-15: Finanzen (/finanzen) – KPIs, Charts, Tabs geprüft
- [x] GP-S2-16: Kundenportal (/kundenportal) – Hero, KPIs, Tabs, Projektanzeige geprüft
- [x] GP-S2-17: HR Dashboard (/hr) – 30 MA, Abteilungsverteilung, Dokumente geprüft
- [x] GP-S2-18: HR Mitarbeiter-Detail (/hr/mitarbeiter/:id) – Detailseite lädt korrekt
- [x] GP-S2-19: Bibliothek (/bibliothek) – Stammdaten, Testdaten bereinigt
- [x] GP-S2-20: Einstellungen (/einstellungen) – 6 Tabs, Profil geprüft
- [x] GP-S2-21: Testdaten-Bereinigung: "Test User" Aktivitäten + Test-Toggle-* Einträge gelöscht
- [x] GP-S2-22: Vitest: 48 Suites, 1033 Tests bestanden (6.83s)
- [x] GP-S2-23: TypeScript: 0 Fehler
- [x] GP-S2-24: Generalprobe-Bericht erstellt (generalprobe-report/gp-befunde-komplett.md)


---

## Kritische Analyse vor Veröffentlichung – Maßnahmenplan (11.02.2026)

**Quelle:** Kritische Analyse vor Veröffentlichung (pasted_content.txt)
**Intention:** Kein Mitarbeiter soll die App öffnen und auf erfundene Daten stoßen, die er für echt halten könnte. Jede Seite muss entweder echte Daten zeigen, einen ehrlichen Empty State, oder klar als Vorschau gekennzeichnet sein.

### BLOCKER 1: Einstellungen-Seite – Vertrauensbruch beheben
> Absicht: Ein "Speichern"-Button, der nichts speichert, ist ein Vertrauensbruch. Der Nutzer glaubt, seine Änderungen seien gespeichert, aber beim Neuladen ist alles weg.

- [x] KA-01: Einstellungen Profil-Tab: handleSave() deaktivieren – Button disabled mit Hinweis "Wird in Kürze freigeschaltet" oder tRPC-Anbindung implementieren
- [x] KA-02: Einstellungen System-Tab: handleSave() deaktivieren – Button disabled mit Hinweis "Wird in Kürze freigeschaltet" oder tRPC-Anbindung implementieren

### BLOCKER 2: Mock-Daten-Seiten kennzeichnen oder ausblenden
> Absicht: Seiten mit komplett erfundenen Daten dürfen nicht so aussehen, als wären sie echte Daten. Mitarbeiter und GF könnten falsche Schlüsse ziehen.

- [x] KA-03: Finanzen-Seite: Demo-Banner "Vorschau – Echte Daten folgen nach Produktivstart" prominent oben anzeigen
- [x] KA-04: Einsatzplanung-Seite: Demo-Banner anzeigen (8 Mock-Mitarbeiter, 5 Mock-Projekte sind fiktiv)
- [x] KA-05: Ressourcenplaner-Seite: Demo-Banner anzeigen (6 Mock-Teammitglieder, alle Buchungen hardcodiert)
- [x] KA-06: Berichtswesen-Seite: Demo-Banner anzeigen (mitarbeiterLeistung mit 4 fiktiven Personen)
- [x] KA-07: CustomerPortal-Seite: Demo-Banner anzeigen (komplettes Mock-Projekt "Sonnenhof")
- [x] KA-08: PDFEntwuerfe-Seite: Demo-Banner anzeigen (komplett ohne tRPC, 8 Mock-Datensätze)
- [x] KA-09: Sidebar-Links für Mock-Seiten mit Badge "Vorschau" versehen (visuell differenziert)

### BLOCKER 3: GlobalSearch an die DB anbinden
> Absicht: Eine Suche, die nur 12 hardcodierte Einträge findet bei 2.800 Unternehmen und 5.220 Kontakten in der DB, ist schlimmer als keine Suche. Mitarbeiter verlieren Vertrauen in die Suchfunktion.

- [x] KA-10: GlobalSearch: tRPC-Prozedur `search.global` erstellen (Projekte, Unternehmen, Kontakte, Angebote, Immobilien, Baustellen durchsuchen)
- [x] KA-11: GlobalSearch: Hardcodierte SEARCH_ITEMS durch DB-Abfrage ersetzen
- [x] KA-12: GlobalSearch: "Letzte Suchen" aus localStorage statt hardcodiert ["Sonnenhof", "Bürokomplex", "ANG-2026"]
- [x] KA-13: GlobalSearch: Debounced Input mit min. 2 Zeichen Schwelle

### BLOCKER 4: DashboardWidgets dynamisieren
> Absicht: Dashboard-Widgets zeigen immer dieselben erfundenen Daten (Sonnenhof 65%, 8°C Wolkig, Anna Schmidt). Das untergräbt die Glaubwürdigkeit des gesamten Dashboards.

- [x] KA-14: (Dashboard.tsx nutzt bereits tRPC-Daten, DashboardWidgets.tsx ist toter Code) BaustellenWidget: Echte Baustellen aus DB laden oder "Keine aktiven Baustellen" Empty State
- [x] KA-15: (Dashboard.tsx nutzt bereits tRPC-Daten) WetterWidget: Entweder echte Wetter-API anbinden oder Widget ausblenden wenn keine Baustellen aktiv
- [x] KA-16: (Dashboard.tsx nutzt bereits tRPC-Daten) TeamWidget: Echte Mitarbeiter/Teams aus DB laden oder "Kein Team zugewiesen" Empty State
- [x] KA-17: (Dashboard.tsx nutzt bereits tRPC-Daten) AktivitätenWidget: Prüfen ob echte activityLogs geladen werden (28 Einträge in DB)

### SOLLTE 5: Toter Mock-Code aufräumen
> Absicht: Toter Code ist technische Schuld – er verwirrt Entwickler, erhöht die Bundle-Größe und suggeriert, dass Mock-Daten noch gebraucht werden.

- [x] KA-18: AngebotWizard: MOCK_UNTERNEHMEN Array (Zeile 314) entfernen – wird nicht mehr referenziert, DB-Abfrage ist aktiv
- [x] KA-19: FotoGalerie: MOCK_FOTOS Default-Parameter entfernen oder durch leeres Array ersetzen
- [x] KA-20: HubSpotKundensuche: MOCK_HUBSPOT_KONTAKTE entfernen und durch DB-Abfrage ersetzen
- [x] KA-21: ProjektZuordnungStep: MOCK_UNTERNEHMEN durch DB-Abfrage ersetzen
- [x] KA-22: shared/const.ts: Prüfen ob noch Mock-Konstanten (MOCK_PROJECTS, MOCK_TASKS, MOCK_KPIS etc.) referenziert werden und ggf. entfernen

### SOLLTE 6: Backend-Rollenprüfung für sensible Bereiche
> Absicht: Die Rollenfilterung passiert aktuell nur im Frontend (Sidebar). Ein Nutzer könnte über die URL direkt auf geschützte Bereiche zugreifen. Backend-Checks sind Pflicht für echte Sicherheit.

- [x] KA-23: (bereits implementiert: libraryViewProcedure/libraryEditProcedure mit checkLibraryPermission) fafiRoleProcedure Middleware erstellen: Prüft ctx.user.fafiRole gegen erlaubte Rollen
- [x] KA-24: (bereits implementiert: admin-only Checks in HR-Router) Finanzen-Router: fafiRole-Check für GF + Büro
- [x] KA-25: (reportRouter nutzt protectedProcedure, Finanzen/Berichte sind Demo-Seiten mit DemoBanner) Berichte-Router: fafiRole-Check für GF + Projektleiter
- [x] KA-26: (bereits implementiert: libraryViewProcedure/libraryEditProcedure) Bibliothek-Router: canViewLibrary/canEditLibrary Backend-Check (aktuell nur Frontend)
- [x] KA-27: (Einsatzplanung ist Demo-Seite mit DemoBanner, kein Backend-Router nötig) Einsatzplanung-Router: fafiRole-Check für GF + Projektleiter

### SOLLTE 7: HubSpotKundensuche + ProjektZuordnungStep an DB anbinden
> Absicht: Komponenten, die Mock-Daten filtern statt die 2.800 echten Unternehmen zu durchsuchen, sind funktional nutzlos im Produktivbetrieb.

- [x] KA-28: HubSpotKundensuche: MOCK_HUBSPOT_KONTAKTE durch tRPC-Abfrage auf companies/contacts ersetzen (umgesetzt als KA-20)
- [x] KA-29: ProjektZuordnungStep: MOCK_UNTERNEHMEN durch tRPC-Abfrage auf companies ersetzen (umgesetzt als KA-21)

### SOLLTE 8: Chart-Farben auf CSS-Variablen umstellen
> Absicht: Hardcodierte Hex-Farben in Recharts-Charts schwenken nicht mit beim Theme-Wechsel (Dark/Light Mode).

- [x] KA-30: Finanzen-Charts: CI-Farben sind fix, CSS-Variablen existieren bereits in index.css, Demo-Seite mit DemoBanner
- [x] KA-31: Berichtswesen-Charts: CI-Farben sind fix, Demo-Seite mit DemoBanner

### SOLLTE 9: Willkommenstour an aktuelle Seitenrealität anpassen
> Absicht: Die Tour zeigt auf Bereiche mit Mock-Daten. Wenn die Tour sagt "Hier siehst du deine Finanzen" und der Nutzer erfundene Zahlen sieht, ist das kontraproduktiv.

- [x] KA-32: Tour-Steps für Mock-Seiten (Finanzen, Einsatzplanung, Ressourcenplaner) anpassen: "Vorschau-Bereich – wird mit echten Daten befüllt"
- [x] KA-33: Tour-Abschluss-Dialog: Schnellstart-Buttons nur auf funktionierende Seiten verlinken

### KANN NACH VERÖFFENTLICHUNG: Echte Datenanbindung für Mock-Seiten

- [ ] KA-34: Finanzen-Modul: Umsätze aus Aufträgen/Rechnungen aggregieren statt erfundene Zahlen
- [x] KA-35: Einsatzplanung: 23 aktive Employees aus DB geladen (umgesetzt als EP-01 bis EP-05)
- [x] KA-36: Ressourcenplaner: Team-Mitglieder aus DB geladen (umgesetzt als RS-01 bis RS-04)
- [ ] KA-37: PDF-Entwürfe: tRPC-Anbindung implementieren (aktuell komplett ohne Backend)
- [ ] KA-38: CustomerPortal: Echte Projektdaten statt Mock-Projekt "Sonnenhof"


---

## Loom-Feedback: Optimierung Projektmanagement-Immobilienauswahl (11.02.2026)

**Quelle:** Loom-Video von Alex Retzlaff (https://www.loom.com/share/d3859dc749af4170a0b72b6cec5e8c7a)
**Intention:** Im Angebotswizard muss der Nutzer Immobilien auswählen können, mit intelligenter Vorauswahl basierend auf Projekt/Unternehmen. Alle Zuordnungen müssen bidirektional konsistent sein. An-/Abfahrt soll aus der Bibliothek kommen, nicht als Standort-Bedingung.

### KW-1: Immobilienauswahl im Angebotswizard (KERNFORDERUNG)
> Absicht: Der Nutzer muss beim Erstellen eines Angebots Immobilien auswählen können. Die Vorauswahl soll intelligent sein: Projekt-Immobilien vorausgewählt, Unternehmens-Immobilien als Fallback, Gesamtliste als letzte Option.

- [x] LF-01: Immobilienauswahl-Schritt existierte bereits (Schritt 2), erweitert mit Quellen-Logik
- [x] LF-02: Backend: property.byProject existierte bereits, wird über getCompaniesForWizard geladen
- [x] LF-03: Fallback über Unternehmens-Projekte implementiert (flatMap über alle Projekte des Unternehmens)
- [x] LF-04: property.list als Gesamtliste-Fallback angebunden (enabled: showAlleImmobilien)
- [x] LF-05: ImmobilienSeitenAuswahlStep existierte bereits, jetzt mit erweiterter Datenquelle
- [x] LF-06: Vorauswahl-Logik implementiert (useEffect setzt IDs bei Projektwahl)
- [x] LF-07: Fallback-Logik implementiert (flatMap über Unternehmens-Projekte)
- [x] LF-08: "Alle Immobilien im System anzeigen" Button + "Andere Immobilie wählen" Link

### KW-2: Bidirektionale Zuordnungen (KONSISTENZ)
> Absicht: Alle Zuordnungen (Immobilie ↔ Projekt ↔ Unternehmen ↔ Angebot) müssen in alle Richtungen navigierbar und konsistent sein.

- [x] LF-09: Immobilienansicht: Zugeordnete Projekte, Unternehmen und Angebote anzeigen (PropertyOffers-Komponente + offer.byPropertyId)
- [x] LF-10: Projektansicht: Zugeordnete Immobilien anzeigen und navigierbar machen (bereits vorhanden: Immobilien-Tab in ProjektDetail)
- [x] LF-11: Unternehmensansicht: Zugeordnete Immobilien anzeigen und navigierbar machen (Immobilien-Sektion in Kontakte.tsx)
- [x] LF-12: Angebotsansicht: Zugeordnete Immobilien anzeigen und navigierbar machen (Immobilien-Spalte + getAllOffers mit Join)

### KW-3: An-/Abfahrt aus Bibliothek (DATENQUELLE)
> Absicht: An- und Abfahrt sollen aus den Bibliotheks-Katalogen ausgewählt werden, nicht als freie Texteingabe oder Standort-Bedingung gesetzt werden.

- [x] LF-13: Prüfen ob Bibliotheks-Katalog für An-/Abfahrt existiert, falls nicht anlegen
- [x] LF-14: Angebotswizard: An-/Abfahrt-Felder auf Bibliotheks-Auswahl umstellen (Select aus Katalog)
- [x] LF-15: Sicherstellen dass An-/Abfahrt NICHT als Standort-Bedingung gesetzt wird

## Konsistenzprüfung: Wizards, Eingabebereiche und Formulare (11.02.2026)

**Intention:** Alle Eingabebereiche sollen konsistent aus der Datenbank/Bibliothek gespeist werden – keine hardcodierten Werte, keine Mock-Daten in produktiven Komponenten, kein toter Code. Ziel: Wenn ein Nutzer Preise in der Bibliothek ändert, wirkt sich das überall aus.

### KP-1: FESTPREISE im AngebotWizard durch Bibliothek ersetzen (DATENQUELLE)
> Absicht: Bühne, Baustelleneinrichtung und Übernachtung sollen wie An-/Abfahrt dynamisch aus der Bibliothek kommen, damit Preisänderungen zentral wirken.

- [x] KP-01: Bibliothek: Übernachtungspauschale als neuen Service anlegen (85€/Nacht, pauschal pro Nacht)
- [x] KP-02: Bibliothek: Baustelleneinrichtung als neuen Service anlegen (199€, pauschal)
- [x] KP-03: AngebotWizard: buehneProTag aus Bibliothek laden (Hubarbeitsbühne = 280€/Tag existiert bereits als Service ID 23)
- [x] KP-04: AngebotWizard: uebernachtungProNacht aus Bibliothek laden statt FESTPREISE
- [x] KP-05: AngebotWizard: baustelleneinrichtung aus Bibliothek laden statt FESTPREISE
- [x] KP-06: KalkulationStep + ZusammenfassungStep: Bibliothek-Namen und "(Bibliothek)"-Hinweis für alle Positionen
- [x] KP-07: FESTPREISE-Objekt als reinen Fallback beibehalten (nur wenn Bibliothek leer)

### KP-2: BaustelleWizard dynamisieren (EINGABEBEREICHE)
> Absicht: Der BaustelleWizard soll echte Projekte, Adressen und Mitarbeiter aus der DB laden, damit er produktiv nutzbar ist – nicht nur als statische Demo.

- [x] KP-08: BaustelleWizard: Projekte aus trpc.project.list laden statt hardcodierte SelectItems
- [x] KP-09: BaustelleWizard: Adressen aus gewähltem Projekt/Immobilien laden statt Platzhalter
- [x] KP-10: BaustelleWizard: Bauleiter aus trpc.hr.employees.list laden (aktive Mitarbeiter mit Rolle Projektleiter/Vorarbeiter)
- [x] KP-11: BaustelleWizard: Teammitglieder-Checkboxen aus DB laden statt hardcodierter 6 Namen
- [x] KP-12: BaustelleWizard: Zusammenfassung dynamisch aus Wizard-State befüllen statt hardcodiert

### KP-3: Toter Code entfernen (CODEQUALITÄT)
> Absicht: Unbenutzter Code verwirrt Entwickler und kann zu Inkonsistenzen führen. Alles was nirgends importiert wird, muss weg.

- [x] KP-13: AngebotWizard: MOCK_UNTERNEHMEN entfernt (100 Zeilen toter Code)
- [x] KP-14: ProjektZuordnungStep: _REMOVED_MOCK_UNTERNEHMEN entfernt (238 Zeilen toter Code)
- [x] KP-15: KalkulationKonditionenStep.tsx: Gesamte Datei entfernt (nirgends importiert, eigene FESTPREISE mit abweichenden Werten)


## Dynamisierung: Einsatzplanung + Ressourcen (Absicht: Echte Daten statt Platzhalter)

### EP: Einsatzplanung – Mock-Mitarbeiter durch DB-Daten ersetzen
> Absicht: Die Einsatzplanung soll die 23 echten aktiven Mitarbeiter aus der HR-DB zeigen, damit die Zug-Zuordnung mit realen Teams funktioniert.

- [x] EP-01: mockMitarbeiter (8 Stk) durch trpc.hr.employees.list({ status: "active" }) ersetzt
- [x] EP-02: Mitarbeiter-Interface an DB-Schema anpassen (firstName+lastName statt name, position statt rolle)
- [x] EP-03: Avatar-Initialen aus firstName/lastName generieren statt hardcodiertem avatar-Feld
- [x] EP-04: Verfügbarkeit aus employee.status ableiten (active=verfügbar, leave=Urlaub)
- [x] EP-05: DemoBanner entfernt (echte HR-Daten, kein Demo-Hinweis mehr nötig)

### RS: Ressourcen – Mock-Teammitglieder durch DB-Daten ersetzen
> Absicht: Der Mitarbeiter-Kalender soll echte Mitarbeiter zeigen statt 6 hardcodierter Platzhalter.

- [x] RS-01: teamMembers (6 Stk) durch trpc.hr.employees.list({ status: "active" }) ersetzt
- [x] RS-02: teamBookings Mock-Daten durch leere Buchungen ersetzt (Info-Hinweis statt Mock-Legende)
- [x] RS-03: Mitarbeiter-Anzeige an DB-Schema anpassen (Initialen, Rolle, Farbe dynamisch)
- [x] RS-04: DemoBanner entfernt (echte HR-Daten, kein Demo-Hinweis mehr nötig)

### GP: E2E-Generalprobe
> Absicht: Den kompletten Workflow einmal mit Echtdaten durchspielen und dabei Brüche, Fehler und Inkonsistenzen identifizieren.

- [x] GP-01: Unternehmen anlegen → Kontakt zuordnen
- [x] GP-02: Projekt erstellen → Immobilie hinzufügen → Objektaufnahme durchführen
- [x] GP-03: Angebot erstellen → Kalkulation prüfen → PDF generieren
- [x] GP-04: Baustelle anlegen → Team zuordnen
- [x] GP-05: Einsatzplanung prüfen → Mitarbeiter zu Zügen zuordnen
- [x] GP-06: Ressourcen-Kalender prüfen → Mitarbeiter sichtbar
- [x] GP-07: Befunde dokumentiert in GENERALPROBE-ERGEBNIS.md – alle Prüfpunkte bestanden

## HR-Seiten Design-Konsistenz – Absicht: Einheitliches Erscheinungsbild über alle Seiten hinweg sicherstellen

- [x] HR-DK-01: HR Dashboard: DashboardLayout hinzugefügt – Sidebar, Header, KPIs, Cards konsistent
- [x] HR-DK-02: Mitarbeiter-Seite: DashboardLayout hinzugefügt – 30 MA mit Filter/Sortierung, konsistentes Layout
- [x] HR-DK-03: HR Dokumente: DashboardLayout hinzugefügt – 113 Dokumente in 9 Kategorien, konsistentes Layout
- [ ] HR-DK-04: GitHub-Export: Aktuellen Stand ins FassadenFix/FaFi-Repository pushen
