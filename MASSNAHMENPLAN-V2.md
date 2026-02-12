# FaFi PM - Substantierter Massnahmenplan v2.0

## Strategieempfehlung: Modulare In-Place-Migration (NICHT Rewrite)

### Warum KEIN Rewrite von Grund auf?

| Kriterium | Rewrite | Modulare Migration |
|---|---|---|
| **Risiko** | Sehr hoch ("Second System Syndrome") | Niedrig, kontrollierbar |
| **Zeitaufwand** | 3-6 Monate | 4-8 Wochen (priorisiert) |
| **Produktions-Downtime** | Unvermeidbar | Null |
| **Domain-Wissen** | Geht verloren (200+ DB-Funktionen) | Bleibt erhalten |
| **137+ Tests** | Muessen neu geschrieben werden | Bleiben valide |
| **43 Router** | Muessen neu implementiert werden | Werden refactored |
| **HubSpot-Integration** | Muss komplett neu gebaut werden | Bleibt funktional |

**Empfehlung:** Die Anwendung ist funktional solide. Das Problem ist Architektur-Debt, nicht fehlerhafter Code. Ein Rewrite wuerde 3-6 Monate dauern und identische Features reproduzieren. Stattdessen: Modulare Migration auf einem Feature-Branch mit sofortigen Security-Hotfixes.

### Vorgehensweise

```
Phase 0: Security-Hotfixes          (Tag 1-2)    - SOFORT, auf main deployen
Phase 1: Architektur-Fundament      (Tag 3-5)    - Verzeichnisstruktur + Build
Phase 2: Server-Modularisierung     (Tag 6-12)   - Router + DB aufteilen
Phase 3: Service-Konsolidierung     (Tag 13-17)  - Duplikate eliminieren
Phase 4: Frontend-Optimierung       (Tag 18-22)  - Code-Splitting + Bundle
Phase 5: Backend-Vereinigung        (Tag 23-26)  - fassadenfix-backend integrieren
Phase 6: Test & Qualitaet           (Tag 27-30)  - Abdeckung + CI/CD
Phase 7: Cleanup & Dokumentation    (Tag 31-33)  - Aufraumen
```

---

## Phase 0: Security-Hotfixes (KRITISCH - Tag 1-2)

### 0.1 CORS-Fix im fassadenfix-backend
**Datei:** `fassadenfix-backend/server.js:33-44`
**Problem:** CORS ist effektiv deaktiviert - `callback(null, true)` wird IMMER aufgerufen.
**Fix:** Den Else-Zweig mit `callback(new Error('Not allowed by CORS'))` ersetzen.

### 0.2 Auth-Middleware fuer Backend-API
**Datei:** `fassadenfix-backend/server.js`
**Problem:** Alle Endpunkte (HubSpot, AI, Deals) sind vollstaendig oeffentlich.
**Fix:** API-Key-basierte Authentifizierung fuer alle `/api/hubspot/*` und `/api/ai/*` Routen.

### 0.3 Upload-Endpunkte absichern
**Datei:** `fafi-pm/server/_core/index.ts:100, 143`
**Problem:** `/api/upload` und `/api/photos/upload` haben KEINE `requireAuth`-Middleware.
**Fix:** `requireAuth` vor die Upload-Handler setzen (wie bei PDF-Endpunkten ab Zeile 267).

### 0.4 Rate-Limiting fuer AI-Endpunkt
**Datei:** `fassadenfix-backend/server.js:487`
**Problem:** OpenAI-API-Endpunkt ohne Rate-Limit - Kostenrisiko durch Missbrauch.
**Fix:** `express-rate-limit` mit max 10 Requests/Minute pro IP.

### 0.5 Input-Validierung Backend
**Datei:** `fassadenfix-backend/server.js:317-406`
**Problem:** POST-Bodies werden ohne Validierung an HubSpot weitergereicht.
**Fix:** Zod-Schema-Validierung fuer alle Mutations-Endpunkte.

---

## Phase 1: Architektur-Fundament (Tag 3-5)

### 1.1 Neue Verzeichnisstruktur
```
server/
  routers/           # NEU: 10 Domain-Router-Dateien
    company.ts
    contact.ts
    project.ts
    property.ts
    offer.ts
    order.ts
    construction.ts
    finance.ts       # invoice, payment, budget, dunning
    team.ts          # teamMember, hr, user
    integration.ts   # hubspot, email, weather
    library.ts
    portal.ts
    system.ts        # dashboard, notification, calendar, search
  db/                # NEU: Domain-basierte DB-Queries
    companies.ts
    contacts.ts
    projects.ts
    properties.ts
    offers.ts
    orders.ts
    construction.ts
    finance.ts
    team.ts
    documents.ts
    photos.ts
    library.ts
    search.ts
    index.ts         # Re-exports alles (Abwaertskompatibilitaet)
  services/          # BESTEHEND: Konsolidiert
  workflow/          # BESTEHEND
  _core/             # BESTEHEND
  tests/             # NEU: Alle Tests gesammelt
    unit/
    integration/
    e2e/
```

### 1.2 Barrel-Export-Strategie (Zero-Breakage)
```typescript
// server/db/index.ts - Garantiert Abwaertskompatibilitaet
export * from './companies';
export * from './contacts';
export * from './projects';
// ... etc.
// Bestehende Imports `import * as db from './db'` funktionieren weiter!
```

### 1.3 Schema aufteilen
**Datei:** `drizzle/schema.ts` (1.770 Zeilen, 28 Tabellen)
**Ziel:** Pro Domain eine Schema-Datei mit Re-Export:
```
drizzle/
  schema/
    companies.ts    # companies, contacts
    projects.ts     # projects, properties, constructionSites
    finance.ts      # offers, orders, invoices, payments, budgets
    operations.ts   # tasks, activityLogs, calendarEvents
    documents.ts    # documents, photos, textBlocks
    team.ts         # users, teamMembers
    system.ts       # notifications, dashboardWidgets, tooltipFeedback
    index.ts        # Re-export aller Schemas
```

---

## Phase 2: Server-Modularisierung (Tag 6-12)

### 2.1 Router-Aufteilung (routers.ts: 6.085 Zeilen -> 10 Dateien)

| Neuer Router-File | Enthaltene Router | Zeilen (ca.) |
|---|---|---|
| `routers/company.ts` | company, contact | ~250 |
| `routers/project.ts` | project, projectFilter | ~340 |
| `routers/property.ts` | property | ~220 |
| `routers/offer.ts` | offer, offerTemplate, textBlock | ~400 |
| `routers/construction.ts` | constructionSite, constructionSiteFilter, weather, teamleiterCheck | ~350 |
| `routers/order.ts` | order | ~530 |
| `routers/finance.ts` | invoice, payment, budget, dunning, followUp, finance | ~700 |
| `routers/team.ts` | teamMember, user, hr, appointment | ~500 |
| `routers/integration.ts` | hubspot, email, emailTemplate | ~550 |
| `routers/system.ts` | dashboard, notification, calendar, task, activityLog, search, report, deployment, resource, tooltipFeedback | ~700 |
| `routers/library.ts` | library, gate | ~650 |
| `routers/portal.ts` | portal, customerReport, document, photo | ~600 |

**Gesamtersparnis:** 0 Zeilen (Refactoring, nicht Loeschen) - aber massive Lesbarkeitsverbesserung.

### 2.2 DB-Aufteilung (db.ts: 3.694 Zeilen -> 13 Dateien)

| Neuer DB-File | Funktionen | Zeilen (ca.) |
|---|---|---|
| `db/connection.ts` | getDb, resetDbConnection | ~70 |
| `db/companies.ts` | 7 Funktionen | ~100 |
| `db/contacts.ts` | 8 Funktionen | ~110 |
| `db/projects.ts` | 12 Funktionen | ~250 |
| `db/properties.ts` | 12 Funktionen | ~230 |
| `db/construction.ts` | 11 Funktionen | ~200 |
| `db/offers.ts` | 18 Funktionen | ~350 |
| `db/orders.ts` | 10 Funktionen | ~180 |
| `db/finance.ts` | invoices, payments, budgets, warranties: 32 Fktn | ~500 |
| `db/team.ts` | users, teamMembers, employees: 20 Fktn | ~300 |
| `db/documents.ts` | documents, archive: 20 Fktn | ~400 |
| `db/photos.ts` | photos, gatePhotos: 15 Fktn | ~250 |
| `db/system.ts` | tasks, notifications, calendar, dashboard, search: 30 Fktn | ~450 |
| `db/library.ts` | library CRUDs: 7 Fktn | ~150 |

---

## Phase 3: Service-Konsolidierung (Tag 13-17)

### 3.1 Notification-System vereinheitlichen (KRITISCH)
**Problem:** Zwei parallel existierende Systeme:
- `services/notificationService.ts` (5.0K) - DB-basiert, Priority normal/high/critical
- `services/notifications.ts` (6.8K) - Wrapper, Priority low/normal/high/urgent

**Massnahme:**
1. Standardisiertes Priority-Enum: `low | normal | high | critical`
2. Alle Funktionen in `notificationService.ts` konsolidieren
3. `notifications.ts` als Fassade beibehalten (Abwaertskompatibilitaet), aber intern delegieren
4. Doppelte `notifyTaskOverdue()` eliminieren

### 3.2 PDF-System bereinigen (KRITISCH)
**Problem:** Zwei PDF-Generatoren:
- `services/pdfGenerator.ts` (14K) - HTML-basiert, UNBENUTZT in Produktion
- `services/briefbogenPdf.ts` (32K) - pdf-lib-basiert, AKTIV

**Massnahme:**
1. Warranty-PDF aus `pdfGenerator.ts` nach `briefbogenPdf.ts` migrieren
2. `pdfGenerator.ts` komplett loeschen (14K toter Code)
3. `pdfRouteHandler.ts` bleibt als einziger Einstiegspunkt

### 3.3 Email-System konsolidieren
**Problem:** Zwei Sende-Mechanismen:
- `email.ts` - Outlook MCP CLI (fragil, Shell-Aufruf)
- `microsoft365.ts` - Graph API (stabil, direkte API)

**Massnahme:**
1. Standardisierung auf Microsoft Graph API
2. Outlook MCP nur als Fallback beibehalten
3. Email-Template-Generierung in eigene Datei extrahieren
4. HubSpot-Engagement-Erstellung entkoppeln

### 3.4 Error-Handling vereinheitlichen
**Problem:** Zwei Error-Hierarchien:
- `shared/errors.ts` - AppError mit Fehlercodes 1001-5004
- `shared/_core/errors.ts` - HttpError mit StatusCodes

**Massnahme:**
1. `AppError` um HTTP-StatusCode erweitern
2. `HttpError` Convenience-Konstruktoren als statische Methoden in `AppError`
3. `_core/errors.ts` loeschen

---

## Phase 4: Frontend-Optimierung (Tag 18-22)

### 4.1 Code-Splitting / Lazy Loading
**Problem:** 48 Pages (26.030 Zeilen) werden alle im Haupt-Bundle geladen.

**Massnahme:**
```typescript
// VORHER (App.tsx)
import Dashboard from './pages/Dashboard';
import Projekte from './pages/Projekte';

// NACHHER
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projekte = lazy(() => import('./pages/Projekte'));
```

Erwartete Bundle-Reduktion: ~40-50%

### 4.2 Dependency-Bereinigung

| Dependency | Problem | Massnahme |
|---|---|---|
| `jspdf` + `pdf-lib` | Zwei PDF-Libraries (zusammen ~500KB) | jspdf entfernen, pdf-lib behalten |
| `axios` | Unnoetig neben tRPC/fetch | Entfernen, fetch nutzen |
| `framer-motion` | 212KB gzipped fuer Animationen | Pruefen ob Tailwind-Animate reicht |
| `"add": "^2.0.6"` | Versehentlich installiert | Entfernen |
| `"pnpm"` als devDep | Unnoetig | Entfernen |

### 4.3 Grosse Page-Komponenten aufteilen

| Page | Zeilen | Massnahme |
|---|---|---|
| `Bibliothek.tsx` | 1.295 | In Tabs/Sections aufteilen |
| `Kontakte.tsx` | 1.291 | Tabelle + Dialoge extrahieren |
| `ProjektDetail.tsx` | 1.055 | Tabs als eigene Komponenten |
| `Dashboard.tsx` | 1.003 | Widgets als eigene Komponenten |
| `Archiv.tsx` | 985 | Filter + Liste trennen |
| `Einstellungen.tsx` | 900 | Sections als eigene Komponenten |

### 4.4 Bundle-Analyse & Tree-Shaking
- Radix UI: 23 einzelne Packages - pruefen ob `@radix-ui/primitives` ausreicht
- Recharts: Nur verwendete Chart-Typen importieren
- Lucide Icons: Named Imports statt Wildcard

---

## Phase 5: Backend-Vereinigung (Tag 23-26)

### 5.1 fassadenfix-backend in fafi-pm integrieren
**Problem:** Separates Backend-Repo (635 Zeilen JS) mit:
- HubSpot-Proxy (bereits in fafi-pm vorhanden via tRPC hubspotRouter)
- AI-Textoptimierung (einzigartig)
- Mock-Daten (mit echten Firmen-/Mitarbeiternamen)

**Massnahme:**
1. AI-Textoptimierung als neuen tRPC-Router in fafi-pm
2. HubSpot-Proxy loeschen (Duplikat des hubspotRouter)
3. Mock-Daten anonymisieren
4. `fassadenfix-backend` Repo archivieren

### 5.2 API-Architektur vereinheitlichen
- Alle API-Endpunkte laufen ueber tRPC
- Express-Routen nur fuer File-Uploads und PDF-Downloads
- Health-Check bleibt als Express-Route

---

## Phase 6: Test & Qualitaet (Tag 27-30)

### 6.1 Fehlende Tests ergaenzen

| Router (ohne Tests) | Prioritaet | Geschaetzter Aufwand |
|---|---|---|
| `finance` | HOCH - Finanzkritisch | 4h |
| `calendar` | MITTEL - Terminplanung | 2h |
| `emailTemplate` | MITTEL - E-Mail-System | 2h |
| `offerTemplate` | MITTEL - Angebote | 2h |
| `followUp` | MITTEL - Wiedervorlage | 2h |
| `resource` | NIEDRIG - Ressourcen | 1h |
| `deployment` | NIEDRIG - Intern | 1h |
| `textBlock` | NIEDRIG - CMS | 1h |

### 6.2 Test-Reorganisation
**Problem:** 54 Test-Dateien liegen unsortiert in `server/`.

**Massnahme:**
```
server/tests/
  unit/              # Router-spezifische Tests
    company.test.ts
    project.test.ts
    ...
  integration/       # Cross-Domain Tests
    hubspot-import.test.ts
    workflow.test.ts
    ...
  e2e/               # End-to-End-Szenarien
    e2e-project-lifecycle.test.ts
    e2e-customer-portal.test.ts
    ...
```

### 6.3 CI/CD-Pipeline einrichten
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  quality:
    steps:
      - pnpm install
      - pnpm check          # TypeScript
      - pnpm format --check  # Prettier
      - pnpm test            # Vitest (137+ Tests)
      - pnpm build           # Vite Build
```

### 6.4 Input-Validierung standardisieren
- Alle tRPC-Router-Inputs: Bereits Zod-validiert (gut)
- Express-Upload-Endpunkte: Zod-Validierung fuer Metadata
- parseInt-Aufrufe: Durch z.coerce.number() ersetzen

---

## Phase 7: Cleanup & Dokumentation (Tag 31-33)

### 7.1 Root-Verzeichnis aufraeumen
**Problem:** 25+ .md-Dateien (500KB+) im Root.

**Massnahme:**
```
docs/
  archiv/            # Alte Berichte
    GENERALPROBE-BERICHT.md
    GENERALPROBE-ERGEBNIS.md
    GP-VISUELL-BEFUNDE.md
    TESTPLAN-GENERALPROBE.md
    ...
  planung/           # Aktive Planung
    MASSNAHMENPLAN-V2.md
    abarbeitungsplan-offene-aufgaben.md
  spezifikation/     # Specs
    MVP-SPEZIFIKATION-v2.md
```

**Zu loeschen:**
- `todo.md` (115KB!) - in Issue-Tracker migrieren
- Doppelte Dateien (TESTPLAN gross/klein)
- Veraltete Berichte

### 7.2 Leere Repos konsolidieren
- `FassadenFix/fafi-pm-mockup` -> Archivieren oder README mit Verweis auf fafi-pm
- `FassadenFix/fafi-projektmanager` -> Archivieren oder loeschen

### 7.3 package.json bereinigen
- Lizenz-Widerspruch beheben: "MIT" -> "UNLICENSED" (proprietaer)
- `"add": "^2.0.6"` aus devDependencies entfernen
- `"pnpm"` aus devDependencies entfernen
- wouter-Patch pruefen ob noch noetig

### 7.4 Git-Hygiene
- `.gitignore` um `registry.db`, `.manus-logs/`, `*.log` erweitern
- Seed-Daten mit echten Firmennamen anonymisieren
- `hubspot-sync-data.json` (724KB) aus Git-History entfernen wenn moeglich

---

## Zusammenfassung: Aufwandsschaetzung

| Phase | Aufwand | Risiko | Impact |
|---|---|---|---|
| Phase 0: Security | 1-2 Tage | Minimal | **Kritisch** - Muss sofort passieren |
| Phase 1: Architektur | 2-3 Tage | Niedrig | Hoch - Fundament fuer alles Weitere |
| Phase 2: Server-Split | 5-7 Tage | Mittel | Hoch - Wartbarkeit x10 |
| Phase 3: Services | 3-5 Tage | Mittel | Mittel - Eliminiert Duplikate |
| Phase 4: Frontend | 3-5 Tage | Niedrig | Mittel - Performance + Bundle |
| Phase 5: Backend-Merge | 2-4 Tage | Niedrig | Mittel - Ein System statt drei |
| Phase 6: Tests/CI | 3-4 Tage | Minimal | Hoch - Qualitaetssicherung |
| Phase 7: Cleanup | 2-3 Tage | Minimal | Niedrig - Ordnung |
| **GESAMT** | **21-33 Tage** | | |

---

## Metriken (Vorher/Nachher)

| Metrik | Vorher | Nachher (Ziel) |
|---|---|---|
| Groesste Datei | 6.085 Zeilen (routers.ts) | max. 600 Zeilen |
| DB-Monolith | 3.694 Zeilen (db.ts) | max. 400 Zeilen pro Modul |
| Schema-Monolith | 1.770 Zeilen | max. 300 Zeilen pro Domain |
| Offene Security-Issues | 5 | 0 |
| Test-Abdeckung Router | 81% (35/43) | 100% (43/43) |
| Doppelte Services | 3 (PDF, Notification, Email) | 0 |
| npm Dependencies | 90 | ~75 (nach Bereinigung) |
| .md-Dateien im Root | 25+ | 3 (README, CHANGELOG, CONTRIBUTING) |
| Separate Backends | 2 | 1 |
| Leere Repos | 2 | 0 |
