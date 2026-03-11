# Opus 4 Validierung – Teil 2

# Konkreter Maßnahmenplan für FaFi PM

## 1. ERGÄNZTE AUFGABEN

### Phase -1: Auth & Security (60h) [NEU]
- [ ] Lucia Auth Setup mit MySQL Session Store implementieren (15h) [Phase -1]
- [ ] Login/Logout/Register Pages mit Formvalidierung erstellen (8h) [Phase -1]
- [ ] JWT Token-Refresh-Mechanismus implementieren (5h) [Phase -1]
- [ ] Role-Based Access Control (RBAC) in DB-Schema ergänzen (10h) [Phase -1]
- [ ] Auth-Middleware für alle tRPC-Router einbauen (12h) [Phase -1]
- [ ] Password-Reset-Flow mit E-Mail-Versand (10h) [Phase -1]

### Phase 0: Workflow-Reparatur (85h erweitert)
- [ ] State-Machine-Pattern für Phasenübergänge implementieren (25h) [Phase 0]
- [ ] Zod-Validation-Schemas für alle 11 Phasenübergänge erstellen (15h) [Phase 0]
- [ ] Workflow-History-Tabelle mit User-Tracking hinzufügen (8h) [Phase 0]
- [ ] Rollback-Mechanismus für fehlerhafte Übergänge (10h) [Phase 0]

### Infrastruktur & DevOps (40h) [NEU]
- [ ] Docker-Compose Setup für lokale Entwicklung (8h) [Infrastruktur]
- [ ] GitHub Actions CI/CD Pipeline einrichten (12h) [Infrastruktur]
- [ ] Cypress E2E-Tests für kritische User-Flows (20h) [Infrastruktur]

### Error-Handling & Monitoring (30h) [NEU]
- [ ] React Error Boundary für alle Routen implementieren (5h) [Monitoring]
- [ ] Sentry Integration Frontend + Backend (8h) [Monitoring]
- [ ] Winston Logger mit Rotating File Strategy (7h) [Monitoring]
- [ ] Health-Check Endpoints für Monitoring (5h) [Monitoring]
- [ ] Custom Error Classes mit Error Codes (5h) [Monitoring]

### Performance & Caching (25h) [NEU]
- [ ] Redis-Integration für Session-Cache einrichten (8h) [Performance]
- [ ] React Query Cache-Strategien definieren (5h) [Performance]
- [ ] DB-Indizes für häufige Queries erstellen (7h) [Performance]
- [ ] API Response Compression aktivieren (5h) [Performance]

### Datenmigration (40h) [NEU]
- [ ] Legacy-Datenbank-Schema analysieren und mappen (15h) [Migration]
- [ ] ETL-Scripts für Datenübertragung schreiben (20h) [Migration]
- [ ] Backup/Restore-Strategie mit Cron-Jobs (5h) [Migration]

## 2. IMPLEMENTIERUNGSREIHENFOLGE PHASE 0

1. **DB-Schema für Workflow-History erweitern** (3h)
   - Begründung: Basis für alle weiteren Workflow-Features
   - Dateien: `db/schema/workflow-history.ts`, `db/migrations/add-workflow-history.sql`

2. **Zod-Schemas für Phasenvalidierung** (15h)
   - Begründung: Definiert Contract zwischen Frontend/Backend
   - Dateien: `shared/schemas/workflow/*.ts` (11 Dateien, eine pro Übergang)

3. **State-Machine-Pattern implementieren** (25h)
   - Begründung: Zentrale Logik für konsistente Übergänge
   - Dateien: `server/workflow/stateMachine.ts`, `server/workflow/transitions/*.ts`

4. **tRPC-Router für Workflow anpassen** (8h)
   - Begründung: API-Layer muss State-Machine nutzen
   - Dateien: `server/routers/workflow.ts`, `server/routers/workflow-history.ts`

5. **React-Komponenten refactoren** (20h)
   - Begründung: UI muss neue Validierungen nutzen
   - Dateien: `client/components/workflow/PhaseTransition.tsx`, `client/pages/projekte/[id]/workflow.tsx`

6. **Rollback-Mechanismus** (10h)
   - Begründung: Fehlerbehandlung für Prod-Stabilität
   - Dateien: `server/workflow/rollback.ts`, `server/routers/workflow-rollback.ts`

7. **Integration-Tests** (4h)
   - Begründung: Sicherstellen dass alle Teile zusammenspielen
   - Dateien: `tests/integration/workflow/*.test.ts`

## 3. ARCHITEKTUR-VORENTSCHEIDUNGEN

### Authentication
**Entscheidung**: Lucia Auth v3 mit MySQL Session Store
- Begründung: TypeScript-first, funktioniert gut mit tRPC, Session-basiert (sicherer als nur JWT)
- Alternative verworfen: NextAuth (zu Next.js-spezifisch), Supabase Auth (externe Abhängigkeit)

### State Management
**Entscheidung**: Zustand für Workflows
- Frontend: React Query für Server-State, Zustand für komplexe UI-States
- Backend: XState für Workflow State-Machine
- Begründung: Klare Trennung Server/Client-State, XState visualisierbar

### Error Handling
**Entscheidung**: Sentry + Custom Error Classes
- Sentry für Prod-Monitoring
- Custom Error Classes mit Error Codes für API
- React Error Boundaries mit Fallback UI
- Begründung: Industry Standard, gute DX

### Caching Strategy
**Entscheidung**: Redis für Sessions, React Query für API-Cache
- Redis: Session-Store, temporäre Daten
- React Query: 5min staleTime für Listen, 1min für Details
- Begründung: Einfach, performant, kein Over-Engineering

### Mobile Architecture
**Entscheidung**: PWA mit Offline-First
- Service Worker für Offline-Support
- IndexedDB für lokale Datenhaltung
- Background Sync API für Queue
- Begründung: Ein Codebase, trotzdem App-like

## 4. AKTUALISIERTE RISIKO-MATRIX

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|------------|
| **Auth-System Verzögerung** | Hoch (80%) | Kritisch | - Lucia Auth Boilerplate vorbereiten<br>- Auth-Experte einplanen<br>- Fallback: Basic Auth für Entwicklung |
| **State-Machine Komplexität** | Mittel (60%) | Hoch | - XState Visualizer nutzen<br>- Schrittweise Migration<br>- Alte Logik parallel laufen lassen |
| **Legacy-Daten inkompatibel** | Hoch (70%) | Hoch | - Mapping-Tabelle erstellen<br>- Testmigration mit Subset<br>- Rollback-Plan vorbereiten |
| **Performance-Probleme Mobile** | Mittel (50%) | Mittel | - Lazy Loading konsequent<br>- Service Worker Caching<br>- Pagination für Listen |
| **TiDB Inkompatibilitäten** | Niedrig (30%) | Mittel | - MySQL-Kompatibilitätsmodus<br>- Drizzle Queries testen<br>- Fallback auf MySQL |
| **E2E-Tests zu langsam** | Mittel (40%) | Niedrig | - Parallelisierung in CI<br>- Kritische Paths priorisieren<br>- Smoke Tests für PRs |

### Neue Gesamtaufwandsschätzung
- Original: 220h
- Mit Ergänzungen: 440h (+220h)
- Empfohlener Buffer: +20% = 528h

### Kritischer Pfad
1. Auth-System (blockiert alles)
2. Workflow-Reparatur (blockiert Automatisierung)
3. Error-Handling (blockiert Go-Live)
