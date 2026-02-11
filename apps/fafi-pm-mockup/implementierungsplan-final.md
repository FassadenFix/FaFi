# FaFi PM – Finaler Implementierungsplan

*Erstellt am 08. Februar 2026*
*Validiert und verfeinert durch Claude Opus 4 (claude-opus-4-20250514)*
*Basierend auf vollständiger Code-Review, Systemanalyse und 6 Interview-Erkenntnissen*

---

## 1. Executive Summary

### Gesamtbewertung

Das FaFi PM System verfügt über eine **solide technische Basis** mit 28 Datenbanktabellen, 29 tRPC-Routern, 35+ Seiten und 215 bestandenen Unit-Tests. Die Kernprozesse – Projektanlage, Angebotserstellung, Auftragsannahme und Abnahme – existieren und sind mit der Datenbank verbunden. Allerdings offenbart die Analyse **5 kritische Workflow-Brüche**, die den produktiven Einsatz verhindern.

> **Kernproblem:** Das System sagt nicht "Was ist der nächste Schritt?" – es erwartet, dass der Nutzer den Prozess auswendig kennt. Für eine Software, die "wie selbstverständlich" funktionieren soll, ist das der gravierendste Mangel.

### Bereits vorhandene Infrastruktur (kein Handlungsbedarf)

Die Opus-4-Validierung hat einige Punkte als fehlend identifiziert, die im Manus-Template jedoch **bereits implementiert** sind:

| Bereich | Status | Details |
|---|---|---|
| **Authentifizierung** | Vorhanden | Manus OAuth mit Session-Cookie, `protectedProcedure`, `ctx.user`, Rollen (admin/user) |
| **S3-Storage** | Vorhanden | `storagePut`/`storageGet` Helfer, Bucket konfiguriert |
| **LLM-Integration** | Vorhanden | `invokeLLM` Helfer mit Anthropic-API |
| **Benachrichtigungen** | Vorhanden | `notifyOwner` Helfer für Owner-Alerts |
| **JWT/Sessions** | Vorhanden | `JWT_SECRET` konfiguriert, Session-Cookie-Handling |
| **tRPC-Middleware** | Vorhanden | `publicProcedure`, `protectedProcedure` mit Auth-Context |

### Die 3 strategischen Prioritäten

| Priorität | Beschreibung | Begründung |
|---|---|---|
| **P1: Workflow reparieren** | Automatische Phasenübergänge, Nächster-Schritt-Navigation, Phasen-Validierung | Ohne durchgängigen Workflow ist das System nicht produktionsreif |
| **P2: Proaktives System** | Nachfass-Erinnerungen, Mahnlauf, Aufgaben-Alerts, HubSpot Auto-Sync | Ohne Automatisierung gehen Aufträge und Zahlungen verloren |
| **P3: Baustellendokumentation** | Foto-Upload, Vorher/Nachher-Doku, Tagesberichte, Mobile App | Rechtssicherheit und professioneller Auftritt bei Kunden |

### Geschätzter Gesamtaufwand und Timeline (Opus-4-korrigiert)

| Phase | Zeitraum | Aufwand (Original) | Aufwand (Opus-korrigiert) | Ergebnis |
|---|---|---|---|---|
| Phase 0: Architektur-Vorentscheidungen | Woche 0 | – | 2 Tage | State-Machine-Design, Event-Konzept |
| Phase 1: Workflow-Reparatur | Woche 1–3 | 6 Tage | 8–10 Tage | Durchgängiger Prozess ohne Brüche |
| Phase 2: Automatisierung | Woche 4–5 | 5 Tage | 6–7 Tage | Proaktives System mit Erinnerungen |
| Phase 3: Mobile Baustelle (v7.0) | Woche 6–9 | 6–8 Tage | 8–10 Tage | Vollständige Baustellendokumentation |
| Phase 4: Integrationen (v7.1–v7.2) | Woche 10–13 | 8–10 Tage | 8–10 Tage | M365 SSO, HubSpot Bidi-Sync |
| Phase 5: Reporting & Management | Woche 14–17 | 6 Tage | 8–10 Tage | Echte KPIs und Geschäftssteuerung |
| Phase 6: Kundenportal (v7.3) | Woche 18–20 | 4–5 Tage | 5–6 Tage | Professionelles Kundenportal |
| Phase 7: Mock-Seiten & Optimierung | Woche 21–24 | 4–5 Tage | 5–6 Tage | Alle Seiten echt, Code-Qualität |
| Infrastruktur (parallel) | Durchgehend | – | 4–5 Tage | Error-Handling, Monitoring, Tests |
| **Gesamt** | **~24 Wochen** | **~48 Tage** | **~58–66 Tage** | **Produktionsreifes System** |

---

## 2. Phase 0: Architektur-Vorentscheidungen (VOR der Implementierung)

**Opus-4-Empfehlung:** Vor dem Coding müssen zentrale Architektur-Entscheidungen getroffen werden, um spätere Refactorings zu vermeiden.

### 2.1 State-Machine für Workflow-Phasen

**Entscheidung:** Eigene leichtgewichtige State-Machine in `server/workflow/stateMachine.ts` statt XState (zu komplex für den Anwendungsfall).

```typescript
// server/workflow/stateMachine.ts
export interface PhaseTransition {
  from: ProjectPhase;
  to: ProjectPhase;
  guard: (projectId: number) => Promise<boolean>;
  action: (projectId: number, userId: number) => Promise<void>;
  label: string;
}

export const WORKFLOW_TRANSITIONS: PhaseTransition[] = [
  {
    from: 'objektaufnahme', to: 'angebot_erstellt',
    guard: async (pid) => (await getOffersByProjectId(pid)).length > 0,
    action: async (pid, uid) => await logActivity(pid, uid, 'phase_changed', 'angebot_erstellt'),
    label: 'Angebot erstellt'
  },
  // ... weitere Übergänge
];
```

**Begründung:** Eine eigene Implementierung ist für 11 Phasenübergänge übersichtlicher als XState und vermeidet eine zusätzliche Abhängigkeit. Die Guard-Funktionen prüfen Voraussetzungen, die Action-Funktionen führen Seiteneffekte aus (Logging, HubSpot-Update).

### 2.2 Event-System für Audit-Trail

**Entscheidung:** Workflow-History-Tabelle in MySQL statt separatem Event-Store.

```typescript
// drizzle/schema.ts - Neue Tabelle
export const workflowHistory = mysqlTable('workflow_history', {
  id: int('id').primaryKey().autoincrement(),
  projectId: int('project_id').notNull(),
  fromPhase: varchar('from_phase', { length: 50 }).notNull(),
  toPhase: varchar('to_phase', { length: 50 }).notNull(),
  triggeredBy: varchar('triggered_by', { length: 20 }).notNull(), // 'auto' | 'manual' | 'system'
  userId: int('user_id'),
  metadata: json('metadata'), // Zusätzliche Infos zum Übergang
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Begründung:** Ein vollständiges Event-Sourcing wäre Over-Engineering. Eine History-Tabelle reicht für den Audit-Trail und ist mit Drizzle ORM einfach abzufragen.

### 2.3 Automatisierung: Aufgaben-basiert statt Cron-Jobs

**Entscheidung:** Aufgaben-basiertes System mit `scheduledTasks`-Tabelle statt externer Queue (Bull/BullMQ).

**Begründung:** Das System läuft auf Manus-Hosting ohne Redis-Zugang. Eine DB-basierte Task-Queue ist einfacher zu implementieren und zu debuggen. Für die geplanten Automatisierungen (Nachfass-Erinnerungen, Mahnlauf, HubSpot-Sync) reicht ein periodischer Check alle 5 Minuten.

```typescript
// drizzle/schema.ts
export const scheduledTasks = mysqlTable('scheduled_tasks', {
  id: int('id').primaryKey().autoincrement(),
  type: varchar('type', { length: 50 }).notNull(), // 'follow_up' | 'dunning' | 'hubspot_sync'
  entityId: int('entity_id'),
  dueAt: timestamp('due_at').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending' | 'completed' | 'failed'
  attempts: int('attempts').default(0),
  lastAttemptAt: timestamp('last_attempt_at'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Aufwand Phase 0:** 2 Tage | **Abhängigkeiten:** Keine

---

## 3. Phase 1: Workflow-Reparatur (KRITISCH)

**Ziel:** Nutzer können den Prozess Ende-zu-Ende ohne Brüche durchlaufen.

**Opus-4-Korrektur:** Aufwand von 47h auf 65–80h erhöht, da State-Machine-Pattern und Zod-Validierung zusätzlichen Aufwand erfordern.

### 3.1 Automatische Phasenübergänge (10h → 15h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/workflow/stateMachine.ts` | State-Machine mit allen 11 Übergängen + Guards + Actions | 6h |
| `server/routers/offer.ts` | `saveFromWizard`: Phase automatisch auf "angebot_erstellt" | 1h |
| `server/routers/email.ts` | `sendOfferEmail`: Phase auf "angebot_versendet" + Status "versendet" | 1h |
| `server/routers/project.ts` | `advancePhase` Prozedur: Nutzt State-Machine für validierte Übergänge | 3h |
| `server/db.ts` | `updateProjectPhase` mit automatischem History-Eintrag | 2h |
| `drizzle/schema.ts` | `workflowHistory` Tabelle + Migration | 2h |

### 3.2 Phasen-Validierung (6h → 10h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `shared/schemas/workflow.ts` | Zod-Schemas für alle Phasenübergänge mit Voraussetzungen | 4h |
| `server/workflow/guards.ts` | Guard-Funktionen: Prüft DB-Voraussetzungen pro Übergang | 4h |
| `server/routers/project.ts` | `update` Prozedur: Phasen-Validierung über State-Machine | 2h |

**Erlaubte Phasenübergänge und Voraussetzungen:**

| Von | Nach | Guard-Funktion | Voraussetzung |
|---|---|---|---|
| `objektaufnahme` | `angebot_erstellt` | `hasOffer(pid)` | Mind. 1 Angebot existiert |
| `angebot_erstellt` | `angebot_versendet` | `offerIsSent(pid)` | Angebot Status "versendet" |
| `angebot_versendet` | `nachfassen` | `followUpDue(pid)` | 7+ Tage seit Versand ODER manuell |
| `angebot_versendet` | `auftrag_gewonnen` | `hasOrder(pid)` | Auftrag existiert |
| `nachfassen` | `auftrag_gewonnen` | `hasOrder(pid)` | Auftrag existiert |
| `auftrag_gewonnen` | `planung` | `hasConstructionSite(pid)` | Baustelle existiert |
| `planung` | `vorbereitung` | `hasDeploymentPlan(pid)` | Einsatzplan erstellt |
| `vorbereitung` | `durchfuehrung` | `hasBeforeDocumentation(pid)` | Vorher-Doku abgeschlossen |
| `durchfuehrung` | `abnahme` | `hasAfterDocumentation(pid)` | Nachher-Doku abgeschlossen |
| `abnahme` | `abgeschlossen` | `hasAcceptanceProtocol(pid)` | Abnahmeprotokoll erstellt |
| *jede Phase* | `verloren` | `always()` | Immer erlaubt (mit Begründung) |

### 3.3 "Nächster Schritt"-Navigation (11h → 14h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/project.ts` | `getNextSteps`: Berechnet nächsten Schritt pro Projekt | 3h |
| `server/workflow/nextSteps.ts` | Phasen-Logik mit Countdown-Berechnung | 3h |
| `client/src/pages/Dashboard.tsx` | "Nächste Schritte" Widget (Top 5, nach Dringlichkeit sortiert) | 4h |
| `client/src/components/NextStepCard.tsx` | Projekt + Phase-Badge + Countdown + Aktions-Button | 2h |
| `client/src/components/NextStepCard.tsx` | Responsive Design für Mobile | 2h |

**Nächster-Schritt-Logik:**

| Phase | Nächster Schritt | Button | Navigation |
|---|---|---|---|
| `objektaufnahme` | Angebot erstellen | "Angebot erstellen" | `/angebote/neu?projektId=X` |
| `angebot_erstellt` | Angebot versenden | "Angebot versenden" | `/angebote?projektId=X` |
| `angebot_versendet` | Nachfassen (Countdown) | "Nachfassen (seit X Tagen)" | `/projekte/X` |
| `auftrag_gewonnen` | Baustelle planen | "Baustelle vorbereiten" | `/baustellen?projektId=X` |
| `durchfuehrung` | Tagesbericht | "Tagesbericht erstellen" | `/baustellen/X` |
| `abnahme` | Abnahme durchführen | "Abnahme starten" | `/auftraege/X/abnahme` |

### 3.4 Workflow-Buttons in Detail-Ansichten (8h → 10h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/components/WorkflowActionBar.tsx` | Wiederverwendbare Komponente für phasenabhängige Aktionen | 3h |
| `client/src/pages/ProjektDetail.tsx` | Kontextuelle Buttons basierend auf Phase | 3h |
| `client/src/pages/Angebote.tsx` | "Als versendet markieren" + "Auftrag annehmen" Buttons | 2h |
| `client/src/pages/BaustellenDetail.tsx` | "Abnahme starten" Button | 2h |

### 3.5 Nachfass-System (11h → 14h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `drizzle/schema.ts` | `followUpReminders` Tabelle + `offers` Felder erweitern | 1h |
| `server/routers/followUp.ts` | Router: list, complete, dismiss, createCustom | 3h |
| `server/routers/email.ts` | `sendOfferEmail`: 3 Erinnerungen erstellen (7/14/30 Tage) | 2h |
| `client/src/pages/Dashboard.tsx` | "Nachfassen fällig" Widget mit Countdown | 3h |
| `client/src/pages/Angebote.tsx` | Nachfass-Status Badge und "Nachgefasst" Button | 2h |
| `server/routers/followUp.test.ts` | Unit-Tests | 3h |

### 3.6 Unit-Tests Phase 1 (6h → 8h)

| Datei | Aufwand |
|---|---|
| `server/workflow/stateMachine.test.ts` | 3h |
| `server/workflow/guards.test.ts` | 3h |
| `server/routers/followUp.test.ts` | 2h |

**Gesamt Phase 1:** 65–80h (~8–10 Tage)

---

## 4. Phase 2: Automatisierung & Proaktives System

**Ziel:** Das System arbeitet proaktiv – weniger vergessene Termine, bessere Liquidität.

**Opus-4-Korrektur:** Aufwand von 41h auf 50–55h erhöht.

### 4.1 Automatischer Mahnlauf (12h → 15h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `drizzle/schema.ts` | `dunningEntries` Tabelle + `invoices` Felder | 1h |
| `server/routers/dunning.ts` | Router: checkOverdue, createReminder, sendDunning, getHistory | 4h |
| `server/services/dunning.ts` | Mahnlauf-Logik: 30/60/90 Tage Stufen | 4h |
| `client/src/pages/RechnungDetail.tsx` | Mahnhistorie-Tab, "Mahnung senden" Button | 3h |
| `client/src/pages/Dashboard.tsx` | "Überfällige Rechnungen" Widget | 2h |
| Tests | 1h |

### 4.2 Aufgaben-Erinnerungen (7h → 8h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/task.ts` | `getOverdueTasks` mit Eskalationsstufen | 2h |
| `server/routers/task.ts` | `getMyTasks` nach Rolle | 2h |
| `client/src/pages/Dashboard.tsx` | "Überfällige Aufgaben" Widget | 2h |
| `client/src/components/TaskAlertBanner.tsx` | Banner für kritische Aufgaben | 2h |

### 4.3 HubSpot Auto-Sync (8h → 10h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/services/hubspot-sync-job.ts` | Periodischer Sync (DB-basierte Task-Queue) | 4h |
| `server/routers/hubspot.ts` | `getSyncStatus`, `triggerManualSync` | 2h |
| `client/src/pages/HubSpotIntegration.tsx` | Mock durch echte Sync-Verwaltung | 3h |
| Tests | 1h |

### 4.4 Benachrichtigungssystem (8h → 10h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/services/notification.ts` | Service mit Prioritäten (normal/hoch/kritisch) | 3h |
| `server/routers/notification.ts` | `getUnread`, `markAsRead`, `getPreferences` | 2h |
| `client/src/pages/Benachrichtigungen.tsx` | Mock durch echte Liste | 3h |
| `client/src/components/DashboardLayout.tsx` | Glocke mit Zähler | 2h |

### 4.5 Scheduled-Tasks-Engine (NEU, Opus-Empfehlung) (8h)

| Datei | Änderung | Aufwand |
|---|---|---|
| `drizzle/schema.ts` | `scheduledTasks` Tabelle | 1h |
| `server/services/taskRunner.ts` | Periodischer Check alle 5 Min, Task-Ausführung | 4h |
| `server/services/taskRunner.test.ts` | Unit-Tests | 3h |

**Gesamt Phase 2:** 50–55h (~6–7 Tage)

---

## 5. Phasen 3–7: Übersicht (Details in bestehender todo.md)

### Phase 3: Mobile Baustelle & Foto-Upload (v7.0)

Wie in todo.md v7.0a–v7.0d geplant, **plus** Opus-4-Ergänzungen:

| Ergänzung | Aufwand | Begründung |
|---|---|---|
| PWA-Manifest und Service Worker Grundgerüst | 4h | Basis für Offline-Fähigkeit |
| IndexedDB für lokale Foto-Zwischenspeicherung | 6h | Offline-Upload auf Baustelle |
| Background Sync API für Upload-Queue | 4h | Automatischer Upload bei Verbindung |
| GPS-Koordinaten bei Foto-Upload | 1h | Gebäude-Zuordnung |
| Foto-Wasserzeichen (Datum, GPS, Baustelle) | 2h | Rechtssicherheit |
| Bautagebuch-PDF-Export | 3h | Dokumentation für Kunden |

**Opus-4-Korrektur:** Aufwand von 48h auf 65–80h (Offline-Sync ist komplex).

### Phase 4: Integrationen (v7.1–v7.2)

Wie in todo.md geplant. Keine wesentlichen Opus-4-Korrekturen.

### Phase 5: Reporting & Management

Wie in todo.md Phase 4 geplant. **Opus-4-Korrektur:** Aufwand von 47h auf 60–70h (Report-Engine und DB-Views aufwändiger als geschätzt).

### Phase 6: Kundenportal (v7.3 + Ergänzungen)

Wie in todo.md v7.3 + Phase 5 geplant. Keine wesentlichen Korrekturen.

### Phase 7: Mock-Seiten & Optimierung

Wie in todo.md Phase 6 geplant. Keine wesentlichen Korrekturen.

---

## 6. Infrastruktur-Aufgaben (parallel, Opus-4-Empfehlung)

Diese Aufgaben können **parallel** zu den Feature-Phasen umgesetzt werden:

### 6.1 Error-Handling & Monitoring (15h)

| Aufgabe | Aufwand |
|---|---|
| React Error Boundary für alle Routen | 3h |
| Custom Error Classes mit Error Codes in tRPC | 3h |
| Strukturiertes Logging im Backend (Console-basiert, kein Sentry nötig auf Manus) | 3h |
| Health-Check Endpoint `/api/health` | 2h |
| Error-Tracking Dashboard-Widget | 4h |

### 6.2 Performance (10h)

| Aufgabe | Aufwand |
|---|---|
| DB-Indizes für häufige Queries (projects.phase, offers.status, tasks.dueDate) | 3h |
| React Query Cache-Strategien (staleTime, cacheTime pro Entität) | 3h |
| Lazy Loading für schwere Seiten (Berichtswesen, Einsatzplanung) | 2h |
| API Response Compression (gzip) | 2h |

### 6.3 Testing-Erweiterung (15h)

| Aufgabe | Aufwand |
|---|---|
| E2E-Test: Projekt erstellen → Angebot → Auftrag → Abnahme | 6h |
| E2E-Test: Baustellen-Tagesablauf | 4h |
| E2E-Test: Kundenportal-Navigation | 3h |
| Test-Utilities und Fixtures | 2h |

**Gesamt Infrastruktur:** 40h (~5 Tage, parallel)

---

## 7. Neue Aufgaben für todo.md (Opus-4-Ergänzungen)

Die folgenden Aufgaben wurden von Opus 4 identifiziert und fehlen in der bestehenden todo.md:

### Architektur-Vorentscheidungen (Phase 0, NEU)

```
- [ ] State-Machine-Pattern für Phasenübergänge designen und implementieren (6h) [Phase 0]
- [ ] workflowHistory Tabelle erstellen + Migration (2h) [Phase 0]
- [ ] scheduledTasks Tabelle für DB-basierte Task-Queue erstellen (1h) [Phase 0]
- [ ] Zod-Schemas für alle 11 Phasenübergänge definieren (4h) [Phase 0]
- [ ] Guard-Funktionen für Phasen-Voraussetzungen implementieren (4h) [Phase 0]
```

### Infrastruktur (parallel, NEU)

```
- [ ] React Error Boundary für alle Routen implementieren (3h) [Infrastruktur]
- [ ] Custom Error Classes mit Error Codes für tRPC (3h) [Infrastruktur]
- [ ] Strukturiertes Backend-Logging (3h) [Infrastruktur]
- [ ] Health-Check Endpoint /api/health (2h) [Infrastruktur]
- [ ] DB-Indizes für projects.phase, offers.status, tasks.dueDate (3h) [Infrastruktur]
- [ ] React Query Cache-Strategien definieren (3h) [Infrastruktur]
- [ ] Lazy Loading für schwere Seiten (2h) [Infrastruktur]
- [ ] API Response Compression (2h) [Infrastruktur]
- [ ] E2E-Test: Projekt → Angebot → Auftrag → Abnahme (6h) [Infrastruktur]
- [ ] E2E-Test: Baustellen-Tagesablauf (4h) [Infrastruktur]
- [ ] E2E-Test: Kundenportal-Navigation (3h) [Infrastruktur]
```

### Ergänzungen zu Phase 2 (NEU)

```
- [ ] Scheduled-Tasks-Engine: DB-basierte Task-Queue mit 5-Min-Check (4h) [Phase 2]
- [ ] taskRunner Service: Periodischer Check und Task-Ausführung (4h) [Phase 2]
- [ ] taskRunner Unit-Tests (3h) [Phase 2]
```

### Ergänzungen zu Phase 3/v7.0 (NEU)

```
- [ ] PWA-Manifest und Service Worker Grundgerüst (4h) [Phase 3]
- [ ] IndexedDB für lokale Foto-Zwischenspeicherung (6h) [Phase 3]
- [ ] Background Sync API für Upload-Queue (4h) [Phase 3]
```

---

## 8. Risiken und Abhängigkeiten (Opus-4-aktualisiert)

### Technische Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|---|---|---|---|
| **State-Machine Komplexität** | Mittel (60%) | Hoch | Schrittweise Migration, alte Logik parallel laufen lassen |
| **Offline-Foto-Upload** | Hoch (80%) | Hoch | Service Worker + IndexedDB + Background Sync |
| **HubSpot API-Rate-Limits** | Mittel (50%) | Mittel | Batching, exponentielles Backoff, Sync-Queue |
| **Große Foto-Dateien** (>10MB) | Hoch (80%) | Mittel | Chunked Upload, Komprimierung, Fortschrittsanzeige |
| **DB-Migrationen bei laufendem Betrieb** | Mittel (40%) | Hoch | Nur additive Änderungen, keine Breaking Changes |
| **Performance bei wachsenden Daten** | Mittel (50%) | Mittel | DB-Indizes, Pagination, React Query Cache |
| **TiDB Inkompatibilitäten** | Niedrig (30%) | Mittel | MySQL-Kompatibilitätsmodus, Drizzle-Queries testen |

### Externe Abhängigkeiten

| Abhängigkeit | Benötigt für | Status | Aktion |
|---|---|---|---|
| **Azure Admin-Zugang** | Microsoft 365 SSO (v7.1) | Ausstehend | Kunde muss App Registration erstellen |
| **HubSpot Private App Token** | HubSpot Bidi-Sync (v7.2) | Vorhanden | Token-Gültigkeit prüfen |
| **S3-Bucket** | Foto-Upload (v7.0) | Vorhanden (Manus) | Storage-Limits prüfen |
| **Open-Meteo API** | Wetterdaten (v7.0c) | Frei verfügbar | Keine Aktion nötig |

### Empfohlene Parallelisierung

```
Woche 0:      [Phase 0: Architektur-Vorentscheidungen]
               └── State-Machine Design, DB-Schema, Zod-Schemas

Woche 1-3:    [Phase 1: Workflow-Reparatur]
               ├── Team A: State-Machine + Guards + Phasenübergänge
               └── Team B: Nächster-Schritt + Workflow-Buttons + Nachfass

Woche 4-5:    [Phase 2: Automatisierung]
               ├── Team A: Mahnlauf + Scheduled-Tasks-Engine
               └── Team B: Aufgaben-Erinnerungen + Benachrichtigungen

Woche 6-9:    [Phase 3: v7.0 Mobile Baustelle]
               ├── Team A: Foto-Upload + PWA + Offline
               └── Team B: Vorher-Doku + Tagesablauf + Nachher-Doku

Woche 10-13:  [Phase 4: v7.1 + v7.2]
               ├── Team A: Microsoft 365 SSO + Graph API
               └── Team B: HubSpot Bidi-Sync + Auto-Sync

Woche 14-17:  [Phase 5: Reporting]
               ├── Team A: Berichtswesen + Finanzdashboard
               └── Team B: Einsatzplanung + Ressourcen

Woche 18-20:  [Phase 6: Kundenportal]
               └── Alle: Ampel-System + Login + Feedback + Chat

Woche 21-24:  [Phase 7: Optimierung]
               └── Alle: Mock-Seiten ersetzen, Code-Qualität, Performance

PARALLEL:      [Infrastruktur]
               └── Error-Handling, Monitoring, DB-Indizes, E2E-Tests
```

---

## 9. Meilenstein-Übersicht (Opus-4-korrigiert)

| # | Meilenstein | Aufwand (Original) | Aufwand (Korrigiert) | Abhängigkeit | Ergebnis |
|---|---|---|---|---|---|
| M0 | Architektur-Design | – | 16h (2d) | Keine | State-Machine, DB-Schema |
| M1 | Workflow durchgängig | 47h (6d) | 75h (9d) | M0 | Prozess ohne Brüche |
| M2 | Proaktives System | 41h (5d) | 55h (7d) | M1 | Mahnlauf, Erinnerungen |
| M3 | Foto-Upload & Vorher-Doku | 48h (6d) | 65h (8d) | Keine | S3-Upload, PWA |
| M4 | Mobile Baustellenapp | 40h (5d) | 55h (7d) | M3 | Offline, Tagesberichte |
| M5 | Microsoft 365 | 40h (5d) | 40h (5d) | Azure Admin | SSO + E-Mail |
| M6 | HubSpot Bidi-Sync | 28h (3.5d) | 32h (4d) | Keine | Auto-Sync |
| M7 | Reporting & Finanzen | 47h (6d) | 65h (8d) | M1, M2 | Echte KPIs |
| M8 | Kundenportal | 36h (4.5d) | 44h (5.5d) | Keine | Ampel, Login, Chat |
| M9 | Mock-Seiten ersetzt | 35h (4.5d) | 40h (5d) | M1–M8 | Alle Seiten echt |
| M10 | Infrastruktur | – | 40h (5d) | Parallel | Error-Handling, Tests |
| **Gesamt** | | **~386h (48d)** | **~527h (66d)** | | **Produktionsreifes System** |

---

## 10. Sofort-Maßnahmen (Top 5)

Wenn nur begrenzte Ressourcen verfügbar sind:

1. **Architektur-Vorentscheidungen** (16h) – State-Machine designen, bevor Code geschrieben wird
2. **Automatische Phasenübergänge** (15h) – Behebt den gravierendsten Workflow-Bruch
3. **"Nächster Schritt"-Widget** (14h) – Drastisch verbesserte Benutzerführung
4. **Nachfass-System** (14h) – Verhindert Auftragsverluste
5. **Phasen-Validierung** (10h) – Qualitätssicherung, keine willkürlichen Sprünge

Diese 5 Maßnahmen (69h ≈ 9 Arbeitstage) transformieren FaFi PM von einem "gut geplanten Haus ohne Treppe" zu einem System, das Nutzer intuitiv durch den gesamten Prozess führt.

---

*Dieser Implementierungsplan wurde erstellt und anschließend von Claude Opus 4 (claude-opus-4-20250514) kritisch validiert und verfeinert. Die Aufwandsschätzungen wurden um durchschnittlich 37% nach oben korrigiert, 3 Architektur-Vorentscheidungen und 14 zusätzliche Infrastruktur-Aufgaben wurden ergänzt.*
