# FaFi PM – Todo-Liste v7.0+

**Stand:** 09. Februar 2026 (Phase v7.5 abgeschlossen)
**Projekt:** FassadenFix Projektmanager (FaFi PM)
**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)
**Aktueller Stand:** 28 DB-Tabellen, 29 tRPC-Router, 35+ Seiten, 412 Unit-Tests (19 Test-Dateien)
**Implementierungsplan:** Siehe `implementierungsplan-final.md` (Opus-4-validiert)
**Opus-Validierung:** Siehe `opus-validierung.md` für kritische Analyse
**Verbleibend:** 11 offene Items (E2E-Tests, UX-Nice-to-haves, Responsive-Optimierung)

---

## PHASE -1 – Architektur-Vorentscheidungen (VOR Phase 0, Opus-4-Empfehlung)

- [x] State-Machine-Pattern für Phasenübergänge designen (server/workflow/stateMachine.ts) (6h)
- [x] workflowHistory Tabelle erstellen + DB-Migration (2h)
- [x] scheduledTasks Tabelle für DB-basierte Task-Queue erstellen + Migration (1h)
- [x] Zod-Schemas für alle 11 Phasenübergänge definieren (shared/schemas/workflow.ts) (4h)
- [x] Guard-Funktionen für Phasen-Voraussetzungen implementieren (server/workflow/guards.ts) (4h)

---

## PHASE 0 – Workflow-Reparatur (KRITISCH – Sofort, nach Phase -1)

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

## PHASE 0.5 – Automatisierung & Proaktives System (nach Phase 0)

### 0.5a – Automatischer Mahnlauf

- [x] dunningEntries Tabelle erstellen: invoiceId, level, sentAt, sentVia, amount, notes (1h)
- [x] invoices Tabelle erweitern: dueDate, reminderLevel, lastReminderSentAt (30min) [bereits vorhanden]
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

### 0.5e – Scheduled-Tasks-Engine (Opus-4-Empfehlung, NEU)

- [x] Scheduled-Tasks-Engine: DB-basierte Task-Queue mit 5-Min-Check (server/services/taskRunner.ts) (4h)
- [x] taskRunner Service: Periodischer Check und Task-Ausführung für Nachfass/Mahnlauf/Sync (4h)
- [x] taskRunner Unit-Tests (3h)

### 0.5f – Unit-Tests Phase 0.5

- [x] Unit-Tests für Mahnlauf und Mahnstufen (2h)
- [x] Unit-Tests für Aufgaben-Erinnerungen und Eskalation (2h)
- [x] Unit-Tests für Benachrichtigungssystem (2h)

---

## Abhängigkeiten & Kritischer Pfad

```
PHASE 0 (Workflow-Reparatur) ──→ PHASE 0.5 (Automatisierung)
                            └──→ v7.0 (parallel möglich)

Foto-Upload (v7.0a) ──→ ObjektaufnahmeWizard Fotos (v7.0a)
                    ├──→ Vorher-Dokumentation (v7.0b)
                    ├──→ Ereignismelder Fotos (v7.0c)
                    └──→ Nachher-Dokumentation (v7.0d)

Vorher-Dokumentation (v7.0b) ──→ Baustellen-Tagesablauf (v7.0c)

Microsoft SSO (v7.1a) ──→ Graph API E-Mail (v7.1b)

HubSpot Bidi-Sync (v7.2) kann parallel zu v7.1 laufen
Kundenportal Ampel (v7.3) kann parallel zu v7.1/v7.2 laufen

PHASE 4 (Reporting) nach Phase 0 + 0.5
PHASE 5 (Kundenportal) nach v7.3
PHASE 6 (Mock-Seiten) nach Phase 1-5
```

---

## v7.0 – Foto-Upload & Baustellen-Manager Überarbeitung

**Ziel:** Echten S3-Foto-Upload implementieren, Baustellen-Manager mit neuem Workflow (Vorher-Doku → Tagesablauf → Nachher-Doku)
**Abhängigkeit:** Keine – kann sofort gestartet werden
**Geschätzter Aufwand:** 6-8 Tage

### v7.0a – Foto-Upload Infrastruktur (Voraussetzung für alles Weitere)

- [x] S3-Upload tRPC-Router: `photo.upload` Prozedur (multipart/form-data → storagePut) (3h)
- [x] Automatische Dateibenennung nach Schema: `Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN.jpg` (2h)
- [x] Wiederverwendbare `FotoUpload`-Komponente mit Kamera/Galerie-Auswahl, Vorschau, Beschreibungstext (4h)
- [x] Thumbnail-Generierung clientseitig (Canvas API, max 400px) für schnelle Vorschau (2h)
- [x] Originale in voller Auflösung speichern (keine Komprimierung – versicherungsrelevant) (0h, nur Konfiguration)
- [x] `photos`-Tabelle erstellen: id, url, thumbnailUrl, filename, context, companyName, address, side, category, description, propertyId, constructionSiteId, logEntryId, uploadedBy, createdAt (1h)
- [x] DB-Migration durchführen (pnpm db:push) (15min)
- [x] ObjektaufnahmeWizard: FotoUpload-Komponente pro Gebäudeseite integrieren (3h)
- [x] ObjektaufnahmeWizard: Foto-URLs in Property-Daten speichern (1h)
- [x] Foto-Galerie in Immobilien-Detailansicht anzeigen (2h)
- [x] Unit-Tests für Photo-Router (upload, list, delete) (2h)

### v7.0b – Vorher-Dokumentation (Pflicht vor Baustellenstart)

- [x] `preDocumentationStatus` Feld zu `constructionSites` Tabelle hinzufügen (enum: pending/in_progress/completed) (30min)
- [x] `preDocumentationCompletedAt` Timestamp-Feld hinzufügen (15min)
- [x] DB-Migration durchführen (15min)
- [x] Vorher-Dokumentation Wizard erstellen (analog ObjektaufnahmeWizard) (6h)
  - Pro Gebäudeseite: Pflicht-Übersichtsfoto + optionale Schadensfotos
  - Beschreibungstext pro Foto automatisch vorausgefüllt (Kontext: "Vorher")
  - Zusammenfassung mit allen Fotos vor Abschluss
- [x] Baustellenstart-Blockierung: "Baustelle starten" Button nur aktiv wenn preDocumentationStatus = completed (1h)
- [x] tRPC-Prozedur: `constructionSite.completePreDocumentation` (Status setzen, Aktivitätslog) (1h)
- [x] Baustellen-Detailansicht: Vorher-Fotos Tab anzeigen (2h)
- [x] Unit-Tests für Vorher-Dokumentation (3h)

### v7.0c – Baustellen-Tagesablauf

- [x] `constructionSiteLogs` Tabelle erweitern: workDayStarted, workDayEnded, plannedAreas, completedAreas, weatherMorning, weatherNoon, weatherEvening, planningOnTrack (boolean) (1h)
- [x] DB-Migration durchführen (15min)
- [x] "Arbeitstag beginnen" Komponente (3h)
  - Zeitstempel automatisch
  - Planungsfrage: "Wird die Baustellenplanung zeitlich beibehalten?" (Ja/Nein + Begründung)
  - Geplante Bereiche für den Tag auswählen
- [x] Ereignismelder-Komponente (jederzeit verfügbar, prominent platziert) (4h)
  - Kategorien: Schaden, Sicherheitsvorfall, Geräteausfall, Kundenkontakt, Sonstiges
  - Foto-Upload Integration (FotoUpload-Komponente wiederverwenden)
  - Dringlichkeit (normal/hoch/kritisch)
  - Sofortige Speicherung als Logbuch-Eintrag
  - Bei Dringlichkeit "kritisch": Benachrichtigung an GF/Büro
- [x] "Arbeitstag beenden" Komponente (5h)
  - Erreichte Bereiche vs. Planung markieren
  - Logbuch-Ergebnisse zusammenfassen
  - Planungsfrage für nächsten Tag
  - Witterungsdaten automatisch aus Open-Meteo API (9/13/17 Uhr – bestehende weatherRouter nutzen)
  - Fotos des Tagesfortschritts (optional)
- [x] Automatische Bautagebuch-Generierung aus Abschlussmeldung (3h)
  - Strukturierter Eintrag: Datum, Team, Wetter, geplant vs. erreicht, Vorkommnisse, Fotos
  - Als Dokument im Archiv speichern (Kategorie: bautagebuch)
- [x] BaustellenWizard DB-Integration (aktuell nur Mock-Callback) (3h)
  - trpc.constructionSite.create Mutation aufrufen
  - Projekte und Immobilien aus DB laden
  - Sofortige DB-Speicherung
- [x] Unit-Tests für Tagesablauf-Prozeduren (3h)

### v7.0d – Nachher-Dokumentation

- [x] `postDocumentationStatus` Feld zu `constructionSites` hinzufügen (enum: pending/in_progress/completed) (30min)
- [x] DB-Migration durchführen (15min)
- [x] Nachher-Dokumentation Wizard (analog Vorher-Doku) (4h)
  - Pro Gebäudeseite: Pflicht-Übersichtsfoto
  - Automatische Dateibenennung mit Kontext "Nachher"
  - Verknüpfung mit Vorher-Fotos für Vergleich
- [x] Vorher/Nachher-Vergleichsansicht (Side-by-Side oder Slider) (3h)
- [x] Abnahme-Wizard: Nachher-Doku als Voraussetzung prüfen (1h)
- [x] Unit-Tests für Nachher-Dokumentation (2h)

---

## v7.1 – Microsoft 365 Integration (SSO + E-Mail)

**Ziel:** Mitarbeiter-Login über Microsoft 365 SSO, E-Mail-Versand über Graph API im Namen des Mitarbeiters
**Abhängigkeit:** Keine – kann parallel zu v7.0 gestartet werden (SSO-Setup erfordert Azure Admin-Zugang)
**Geschätzter Aufwand:** 5-6 Tage

### v7.1a – Microsoft SSO Setup (Voraussetzung für E-Mail)

- [x] Azure App Registration für FaFi PM erstellen (erfordert Azure Admin-Zugang des Kunden) (1h)
  - Redirect URIs konfigurieren
  - API-Berechtigungen: User.Read, Mail.Send, Mail.ReadWrite
- [x] MSAL (Microsoft Authentication Library) als npm-Paket installieren (30min)
- [x] SSO Login-Flow implementieren (4h)
  - "Mit Microsoft anmelden" Button auf Login-Seite
  - OAuth2 Authorization Code Flow mit PKCE
  - Fallback auf bestehende Manus OAuth für externe Benutzer
- [x] `users` Tabelle erweitern: microsoftId, microsoftAccessToken, microsoftRefreshToken, microsoftTokenExpiry (30min)
- [x] DB-Migration durchführen (15min)
- [x] Token-Refresh Middleware: Automatische Erneuerung abgelaufener Tokens (2h)
- [x] User-Profil automatisch aus Microsoft-Daten befüllen: Name, E-Mail (v.nachname@fassadenfix.de), Profilbild (1h)
- [x] fafiRole-Zuweisung: Admin weist Rolle nach erstem Login zu (1h)
- [x] Unit-Tests für SSO-Flow (2h) [v7-integrations.test.ts]

### v7.1b – Microsoft Graph E-Mail-Versand

- [x] Graph API Client Setup mit User-Token (delegierte Berechtigungen) (2h)
- [x] E-Mail-Versand tRPC-Prozedur: `email.sendViaGraph` (3h)
  - Empfänger, CC, BCC
  - Betreff und HTML-Body aus Template
  - PDF-Anhänge aus Dokumenten-Archiv/S3
  - Versand über Graph API mit Token des eingeloggten Mitarbeiters
  - E-Mail erscheint in Outlook "Gesendete Elemente"
- [x] E-Mail Vorschau & Bearbeitung Komponente überarbeiten (4h)
  - Vorgefülltes Template anzeigen
  - Text, Empfänger, CC bearbeitbar
  - Anhänge hinzufügen/entfernen
  - "Senden" Button mit Bestätigung
- [x] Vollständige E-Mail-Protokollierung im Aktivitätslog (2h)
  - Empfänger, Betreff, Inhalt (HTML), Anhänge, Zeitstempel, Absender
  - Verknüpfung zu: Projekt, Angebot, Auftrag, Unternehmen, Kontakt
  - E-Mail in der Chronologie aller verknüpften Entitäten sichtbar
- [x] Bestehende Manus Notification API durch Graph API ersetzen (2h)
- [x] "Per E-Mail senden" Buttons aktivieren: Angebot, Rechnung, Auftragsbestätigung (2h)
- [x] Unit-Tests für E-Mail-Versand und Protokollierung (3h) [email.test.ts]

---

## v7.2 – HubSpot Bidirektionaler Sync

**Ziel:** Vollständige bidirektionale Synchronisation: HubSpot ↔ FaFi PM
**Abhängigkeit:** Keine – kann parallel zu v7.1 laufen
**Geschätzter Aufwand:** 3-4 Tage

### Kritisch – FaFi → HubSpot Sync

- [x] HubSpot Deal Update API Integration (bestehender hubspot-service erweitern) (3h)
- [x] Status-Mapping definieren und implementieren (2h)

| FaFi-Aktion | HubSpot-Update |
|---|---|
| Projekt erstellt | Neuer Deal anlegen (falls nicht vorhanden) |
| Angebot erstellt | Deal-Stage → "Angebot erstellt" |
| Angebot versendet | Deal-Stage → "Angebot versendet" |
| Auftrag angenommen | Deal-Stage → "Auftrag gewonnen", Deal-Betrag aktualisieren |
| Projekt abgeschlossen | Deal-Stage → "Abgeschlossen gewonnen" |
| Angebot abgelehnt | Deal-Stage → "Verloren" |

- [x] Automatische Trigger bei Statusänderungen in tRPC-Prozeduren einbauen (4h)
  - offer.updateStatus → HubSpot Deal-Stage Update
  - order.acceptFromOffer → HubSpot Deal "Auftrag gewonnen"
  - constructionSite.complete → HubSpot Deal "Abgeschlossen"
- [x] Sync-Status Tracking: lastSyncedAt, syncDirection, syncError pro Entität (2h)
- [x] Sync-Protokoll im Aktivitätslog (jede Sync-Aktion dokumentieren) (1h)

### Wichtig – Sync-Robustheit

- [x] Error Handling und Retry-Logik (max 3 Versuche, exponentielles Backoff) (2h)
- [x] Conflict Resolution: Timestamp-basiert (neuere Änderung gewinnt) (2h)
- [x] HubSpot Sync Dashboard-Widget: Letzter Sync, Fehler, Statistiken (2h)
- [x] Manueller Sync-Button pro Datensatz (1h)

### Unit-Tests

- [x] Tests für bidirektionalen Sync (Status-Mapping, Trigger, Error Handling) (3h) [v7-integrations.test.ts + hubspot.test.ts]

---

## v7.3 – Kundenportal Ampel-System

**Ziel:** Kundenportal überarbeiten: Ampel-System statt Fortschrittsbalken, Unternehmenszugang, 3-Ebenen-Dokumente
**Abhängigkeit:** Keine – kann parallel laufen
**Geschätzter Aufwand:** 4-5 Tage

### Kritisch – Ampel-System

- [x] Ampel-Logik definieren (2h)
  - Grün: Alle Voraussetzungen für nächste Phase erfüllt, keine überfälligen Aufgaben
  - Gelb: Aufgaben in Bearbeitung, aber noch nicht überfällig
  - Rot: Überfällige Aufgaben oder blockierende Probleme
- [x] `phaseStatus` Feld (green/yellow/red) zu `projects` Tabelle hinzufügen (30min)
- [x] `siteStatus` Feld (green/yellow/red) zu `constructionSites` Tabelle hinzufügen (30min)
- [x] DB-Migration durchführen (15min)
- [x] Ampel-Berechnungslogik als Server-Funktion (automatisch aus Aufgaben/Terminen) (3h)
- [x] Ampel-Komponente (visuell: Kreis mit Farbe + Tooltip mit Erklärung) (2h)

### Wichtig – Portal-Überarbeitung

- [x] Kundenportal-Startseite umstellen: Ein Zugang pro Unternehmen (3h)
  - Aktuelles/laufendes Projekt direkt in Detailansicht
  - Übersicht aller Projekte (laufend + abgeschlossen)
- [x] Ampel-Anzeige pro Projekt und pro Baustelle im Portal (2h)
- [x] Aufgaben-Unterscheidung im Portal (2h)
  - "Liegt auf Ihrer Seite" (Auftraggeber muss handeln)
  - "Liegt auf unserer Seite" (FassadenFix arbeitet daran)
  - `responsibleParty` Feld (enum: auftraggeber/auftragnehmer) zu `tasks` hinzufügen
- [x] 3-Ebenen Dokumenten-System im Portal (4h)
  - Projektbezogen: Angebote, Aufträge, Verträge
  - Baustellenbezogen: Sperrgenehmigungen, behördliche Dokumente (verknüpft mit Immobilie)
  - Allgemein: Fachunternehmerererklärung, Freistellungsbescheinigung (FassadenFix-Dokumente)
- [x] Token-basierter Zugang überarbeiten (pro Unternehmen statt pro Projekt) (2h)
- [x] Vorher/Nachher-Fotos im Portal anzeigen (1h)
- [x] Unit-Tests für Ampel-Logik und Portal-Zugang (3h) [v7-integrations.test.ts]

---

## v7.4 – PDF-Generierung & Code-Qualität

**Ziel:** Fehlende PDF-Generatoren, Code-Bereinigung, Performance
**Abhängigkeit:** Keine
**Geschätzter Aufwand:** 3-4 Tage

### PDF-Generatoren

- [x] Rechnungs-PDF Generator im Corporate Design (4h)
  - FassadenFix Logo, Farben, Typografie
  - Positionen, Mehrwertsteuer, Gesamtbetrag
  - Zahlungsbedingungen, Bankverbindung
- [x] Garantie-PDF Generator als Zertifikat (3h)
  - Garantiebedingungen
  - Foto-Integration aus Abnahme (Nachher-Fotos)
  - Gültigkeitszeitraum
- [x] PDF-Download-Buttons in Rechnungs- und Garantie-Detailseiten (1h)
- [x] Unit-Tests für PDF-Generatoren (2h) [pdf-generators.test.ts]

### Code-Qualität

- [x] Code-Audit: Unused Imports, tote Komponenten, console.log entfernen (4h)
- [x] TypeScript Strict Mode Violations beheben (2h)
- [x] Error Handling vereinheitlichen (Toast-Nachrichten, Fehler-Boundaries) (2h)
- [x] Performance: Lazy Loading für große Listen, React.memo für teure Komponenten (3h)

### Tests

- [ ] E2E-Tests für kritische User-Journeys (6h)
  - Projekt erstellen → Objektaufnahme → Angebot → Auftrag → Baustelle → Abnahme
  - Baustellen-Tagesablauf (Morgen → Ereignis → Abend)
  - Kundenportal-Navigation und Dokumenten-Zugriff

---

## v7.5 – Erweiterte Features (Nice-to-have)

**Ziel:** UX-Verbesserungen und technische Optimierungen
**Abhängigkeit:** Alle vorherigen Meilensteine
**Geschätzter Aufwand:** 3-4 Tage

### UX-Verbesserungen

- [ ] Dashboard-KPIs: Monatliche/Quartalsansicht, Team-Performance (3h)
- [ ] Globale Suche erweitern: Filter-Kombinationen speichern (2h)
- [ ] Bulk-Aktionen für Listen (Mehrfachauswahl, Bulk-Status-Änderung) (3h)
- [ ] Outlook-Kalender-Sync über Graph API (3h)
- [ ] Automatisierte Reports: Wöchentliche Team-/Kundenstatus-Reports (4h)

### Technische Optimierungen

- [x] Caching-Layer für häufige DB-Queries (3h) [queryConfig.ts + main.tsx QueryClient defaults]
- [x] API-Rate Limiting für externe APIs (HubSpot, Graph) (1h) [rateLimiter.ts]
- [x] Monitoring und strukturiertes Logging (3h) [performanceMonitor.ts + logger.ts + /api/health erweitert]
- [ ] Responsive UI-Optimierung für Tablets (Baustellen-Manager) (4h)

---

## PHASE 4 – Management & Reporting (nach Phase 0 + 0.5)

**Ziel:** Echte Geschäftssteuerung statt Mock-Seiten
**Geschätzter Aufwand:** 8–10 Tage

### 4a – Echtes Berichtswesen

- [x] report Router: Pipeline, Umsatz, Conversion, Fortschritt, Auslastung, Offene Posten (6h)
- [x] Berichtswesen.tsx: Mock durch echte Berichte mit Diagrammen ersetzen (6h)

### 4b – Einsatzplanung mit DB

- [x] deployments + equipmentBookings Tabellen erstellen (1h)
- [x] DB-Migration durchführen (15min)
- [x] deployment Router: CRUD + Kalenderansicht + Konfliktprüfung (4h)
- [x] Einsatzplanung.tsx: Mock durch Kalender-basierte Planung ersetzen (6h)

### 4c – Ressourcenübersicht

- [x] resource Router: Teamverfügbarkeit, Geräteauslastung, Kapazitätsplanung (4h)
- [x] Ressourcen.tsx: Mock durch echte Ressourcenübersicht ersetzen (4h)

### 4d – Finanzdashboard

- [x] finance Router: Umsatz, Außenstände, Cashflow, Budget-Vergleich (4h)
- [x] Finanzen.tsx: Mock durch echtes Finanzdashboard mit Diagrammen ersetzen (6h)

### 4e – Unit-Tests Phase 4

- [x] Unit-Tests für Reporting, Einsatzplanung, Ressourcen, Finanzen (6h) [v7-integrations.test.ts + mockup-pages.test.ts]

---

## PHASE 5 – Kundenportal Ergänzungen (nach v7.3)

**Ziel:** Professionelles Kundenportal über v7.3 Ampel-System hinaus
**Geschätzter Aufwand:** 3–4 Tage

- [x] Kundenportal: Echtes Login (E-Mail + Passwort) statt nur Token-Zugang (4h)
- [x] Kundenportal: E-Mail-Benachrichtigungen bei Statusänderungen (3h)
- [x] Kundenportal: Feedback-Formular nach Projektabschluss (2h)
- [x] Kundenportal: Dokumenten-Upload durch Kunde (Vollmachten, Genehmigungen) (3h)
- [x] Kundenportal: Einfaches Nachrichtensystem Kunde ↔ FassadenFix (4h)
- [x] HubSpotIntegration.tsx: Sync-Status Dashboard, Mapping, Protokoll, Fehler-Log (4h)

---

## PHASE 6 – Mock-Seiten ersetzen & Optimierung (nach Phase 1–5)

**Ziel:** Alle 11 Mock-Seiten durch echte Funktionalität ersetzen
**Geschätzter Aufwand:** 4–5 Tage

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

- [x] Offline-Fähigkeit: Service Worker für Foto-Upload bei schlechter Verbindung (6h)
- [x] GPS-Koordinaten automatisch bei Foto-Upload erfassen (1h)
- [x] Witterungs-API: Open-Meteo automatisch 3x täglich abrufen (2h)
- [x] Baustellenstart-Checkliste: Pflicht vor Arbeitsbeginn (3h)
- [x] Foto-Wasserzeichen: Datum, Uhrzeit, GPS, Baustellenname (2h)
- [x] Bautagebuch-PDF-Export mit Fotos, Wetterdaten, Fortschritt (3h)
- [x] MobileApp.tsx: Komplett neu als echte mobile Baustellenansicht (8h)
- [x] MobileBaustellenHeader Komponente mit Wetter und Baustellen-Info (2h)

### 6d – Code-Bereinigung

- [x] Mock-Daten aus shared/const.ts entfernen nach Ersetzung (2h)
- [x] Doppelte Komponenten konsolidieren (2h)
- [x] Einheitliche Error-Boundaries für alle Seiten (2h)

---

## INFRASTRUKTUR – Parallel zu allen Phasen (Opus-4-Empfehlung, NEU)

### Error-Handling & Monitoring

- [x] React Error Boundary für alle Routen implementieren (3h)
- [x] Custom Error Classes mit Error Codes für tRPC (3h)
- [x] Strukturiertes Backend-Logging (Console-basiert) (3h)
- [x] Health-Check Endpoint /api/health (2h)

### Performance

- [x] DB-Indizes für projects.phase, offers.status, tasks.dueDate erstellen (3h)
- [x] React Query Cache-Strategien definieren (staleTime, cacheTime pro Entität) (3h) [queryConfig.ts + main.tsx]
- [x] Lazy Loading für schwere Seiten (Berichtswesen, Einsatzplanung) (2h) [App.tsx React.lazy + Suspense]
- [x] API Response Compression (gzip) aktivieren (2h) [Express default compression via proxy]

### E2E-Tests

- [ ] E2E-Test: Projekt → Angebot → Auftrag → Abnahme (6h)
- [ ] E2E-Test: Baustellen-Tagesablauf (4h)
- [ ] E2E-Test: Kundenportal-Navigation (3h)
- [ ] Test-Utilities und Fixtures erstellen (2h)

---

## Gesamtübersicht (Opus-4-validiert und korrigiert)

| Meilenstein | Aufwand (Original) | Aufwand (Opus-korrigiert) | Priorität | Abhängigkeit |
|---|---|---|---|---|
| **Phase -1: Architektur** | **–** | **2 Tage** | **KRITISCH** | **Keine – SOFORT** |
| **Phase 0: Workflow-Reparatur** | **6 Tage** | **8–10 Tage** | **KRITISCH** | **Phase -1** |
| **Phase 0.5: Automatisierung** | **5 Tage** | **6–7 Tage** | **Wichtig** | **Phase 0** |
| v7.0 Foto-Upload & Baustelle | 6–8 Tage | 8–10 Tage | Kritisch | Keine (parallel) |
| v7.1 Microsoft 365 | 5–6 Tage | 5–6 Tage | Kritisch | Azure Admin |
| v7.2 HubSpot Bidi-Sync | 3–4 Tage | 3–4 Tage | Wichtig | Keine |
| v7.3 Kundenportal Ampel | 4–5 Tage | 5–6 Tage | Wichtig | Keine |
| **Phase 4: Reporting** | **8–10 Tage** | **8–10 Tage** | **Wichtig** | **Phase 0 + 0.5** |
| **Phase 5: Kundenportal+** | **3–4 Tage** | **3–4 Tage** | **Wichtig** | **v7.3** |
| v7.4 PDF & Code-Qualität | 3–4 Tage | 3–4 Tage | Wichtig | Keine |
| v7.5 Erweiterte Features | 3–4 Tage | 3–4 Tage | Nice-to-have | Alle |
| **Phase 6: Mock-Seiten** | **4–5 Tage** | **5–6 Tage** | **Nice-to-have** | **Phase 1–5** |
| **Infrastruktur (parallel)** | **–** | **4–5 Tage** | **Wichtig** | **Parallel** |
| **Gesamt** | **~48–54 Tage** | **~58–66 Tage** | | |

---

## Archiv – Erledigte Funktionalitäten (v1.0 – v6.1)

**Grundsystem (v1-v3):** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL mit 28 DB-Tabellen, 29 tRPC-Routern, 35+ Seiten. FassadenFix Corporate Design durchgängig implementiert.

**Kernfunktionen (v4-v5):** Dashboard mit echten KPIs und Widgets. ProjektWizard, ObjektaufnahmeWizard (mit Entwurfsfunktion), AngebotWizard (mit Versionierung und obsolet-Status) – alle mit DB-Integration. Auftrag-Annahme-Wizard, Abnahme-Wizard mit automatischer Rechnungs-/Garantie-Erstellung. Alle 13 Mockup-Seiten implementiert und DB-angebunden.

**Detailansichten (v4.8-v5.5):** Projekt, Auftrag, Rechnung, Garantie mit vollständiger Tiefenverknüpfung. Zentrales Dokumenten-Archiv mit Entitäts-Verknüpfungen. PDF-Export für Angebote im Corporate Design.

**Integrationen (v4-v5):** HubSpot-Synchronisation (HubSpot→FaFi) für 100 Unternehmen und 100 Kontakte. Globale Suche (Cmd+K). Dunkelmodus.

**Interview-Korrekturen (v6.0-v6.1):** "Frontseite" → "Eingangsseite" umbenannt. Wizard-DB-Integrationen. Rollenbasierte Sidebar. Seed-Daten bereinigt. 215 Unit-Tests bestanden.

## Interview-Revalidierung (09.02.2026)

- [x] A1: "Eingangsseite" → "Frontseite" im ObjektaufnahmeWizard
- [x] A4: Frühbucher-Daten dynamisch berechnen (aktuelles/nächstes Saisonjahr statt hardcoded 2024/2025)
- [x] A5: Automatische Übernachtungs-Empfehlung basierend auf Entfernung (>100km oder >50km + >1 Tag) [bereits korrekt implementiert]
- [x] A6: Kontakte-Seite mit hierarchischer Unternehmen-Gruppierung umbauen
- [x] A7: Ampel-System im Kundenportal-Frontend integrieren (Backend vorhanden)
- [ ] A8: Aufgaben um "Verantwortungsseite" (Auftraggeber/Auftragnehmer) erweitern [Nice-to-have für nächste Phase]
