# Gegenprüfung: Implementierungsplan vs. Code

## Phase 0: Architektur-Vorentscheidungen
- [ ] State-Machine für Phasenübergänge → stateMachine.ts
- [ ] workflowHistory Tabelle → schema.ts
- [ ] scheduledTasks Tabelle → schema.ts
- [ ] Zod-Schemas für Phasenübergänge → workflow.ts
- [ ] Guard-Funktionen → stateMachine.ts

## Phase 1: Workflow-Reparatur
- [ ] Automatische Phasenübergänge (Angebot→versendet→nachfassen→gewonnen)
- [ ] Phasen-Validierung (Guards prüfen Voraussetzungen)
- [ ] "Nächster Schritt"-Navigation im Dashboard
- [ ] NextStepCard Komponente
- [ ] Workflow-Buttons in Detail-Ansichten (WorkflowActionBar)
- [ ] Nachfass-System (followUpReminders Tabelle + Router)
- [ ] Nachfass-Erinnerungen (7/14/30 Tage nach Versand)

## Phase 2: Automatisierung
- [ ] Automatischer Mahnlauf (dunningEntries Tabelle + 30/60/90 Tage)
- [ ] Aufgaben-Erinnerungen (getOverdueTasks, TaskAlertBanner)
- [ ] HubSpot Auto-Sync (periodischer Sync-Job)
- [ ] Benachrichtigungssystem (Prioritäten, getUnread, markAsRead)
- [ ] Scheduled-Tasks-Engine (taskRunner Service)

## Phase 3: Mobile Baustelle (v7.0)
- [ ] Foto-Upload mit S3
- [ ] Vorher/Nachher-Dokumentation
- [ ] Tagesberichte
- [ ] PWA-Manifest + Service Worker
- [ ] IndexedDB für Offline-Foto-Queue
- [ ] Background Sync API
- [ ] GPS-Koordinaten bei Foto-Upload
- [ ] Foto-Wasserzeichen
- [ ] Bautagebuch-PDF-Export

## Phase 4: Integrationen (v7.1-v7.2)
- [ ] Microsoft 365 SSO
- [ ] HubSpot Bidirektionaler Sync
- [ ] E-Mail-Integration (Outlook)

## Phase 5: Reporting & Management
- [ ] Berichtswesen mit echten Daten
- [ ] Finanzdashboard
- [ ] Einsatzplanung
- [ ] Ressourcenverwaltung

## Phase 6: Kundenportal (v7.3)
- [ ] Ampel-System
- [ ] Kundenportal-Login
- [ ] Feedback-Formular

## Phase 7: Mock-Seiten & Optimierung
- [ ] Mock-Seiten durch echte Daten ersetzen

## Infrastruktur
- [ ] React Error Boundary
- [ ] Custom Error Classes
- [ ] Strukturiertes Logging
- [ ] Health-Check /api/health
- [ ] DB-Indizes
- [ ] React Query Cache
- [ ] Lazy Loading
- [ ] API Response Compression
- [ ] E2E-Tests (3 Journeys)
- [ ] CI/CD-Pipeline
