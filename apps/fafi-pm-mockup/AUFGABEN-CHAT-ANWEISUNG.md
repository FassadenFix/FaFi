# Anweisung: FaFi PM Implementierung – Aufgaben-Chat

*Diese Anweisung als erste Nachricht in einen neuen Chat innerhalb des Projekts "sandbox - projektmanager - vorab test" einfügen.*

---

## Auftrag

Implementiere die offenen Aufgaben des FaFi PM (FassadenFix Projektmanager) gemäß der `todo.md` und dem `implementierungsplan-final.md`. Arbeite die Phasen **in der vorgegebenen Reihenfolge** ab, beginnend mit **Phase -1 (Architektur-Vorentscheidungen)**. Nutze ausschließlich die **Anthropic Claude Opus 4** API (claude-opus-4-20250514) für komplexe Architektur- und Logik-Entscheidungen.

---

## Kontext und Pflichtlektüre

Lies **vor dem ersten Codieren** diese Dateien vollständig:

| Datei | Inhalt | Priorität |
|---|---|---|
| `todo.md` | **193 offene Aufgaben** über alle Phasen, mit Aufwandsschätzungen | PFLICHT |
| `implementierungsplan-final.md` | Opus-4-validierter Plan mit Architektur-Entscheidungen, Code-Beispielen, Reihenfolge | PFLICHT |
| `opus-validierung.md` | Kritische Analyse von Claude Opus 4 mit Lücken, Risiken, Korrekturen | PFLICHT |
| `analyse-erkenntnisse.md` | Code-Review-Ergebnisse: 5 Workflow-Brüche, 11 Mock-Seiten, Schema-Probleme | EMPFOHLEN |
| `drizzle/schema.ts` | Aktuelles DB-Schema (28 Tabellen, 1059 Zeilen) | VOR JEDER DB-ÄNDERUNG |
| `server/routers.ts` | Alle tRPC-Router (29 Router, 3362 Zeilen) | VOR JEDER ROUTER-ÄNDERUNG |
| `shared/const.ts` | Shared Constants (Phasen, Mock-Daten, Typen) | VOR JEDER KONSTANTEN-ÄNDERUNG |

---

## Phasen-Reihenfolge (strikt einhalten)

### Phase -1: Architektur-Vorentscheidungen (~2 Tage)
1. State-Machine-Pattern für Phasenübergänge designen → `server/workflow/stateMachine.ts`
2. `workflowHistory` Tabelle erstellen → `drizzle/schema.ts` + `pnpm db:push`
3. `scheduledTasks` Tabelle erstellen → `drizzle/schema.ts` + `pnpm db:push`
4. Zod-Schemas für alle 11 Phasenübergänge → `shared/schemas/workflow.ts`
5. Guard-Funktionen implementieren → `server/workflow/guards.ts`

### Phase 0: Workflow-Reparatur (~8–10 Tage)
- 0a: Automatische Phasenübergänge (saveFromWizard, sendOfferEmail, advancePhase)
- 0b: Phasen-Validierung (PHASE_TRANSITIONS Map, validatePhaseTransition)
- 0c: "Nächster Schritt"-Navigation (Dashboard-Widget, NextStepCard)
- 0d: Workflow-Buttons in Detail-Ansichten (WorkflowActionBar)
- 0e: Nachfass-System (followUpReminders Tabelle, followUp Router)
- 0f: Unit-Tests für Phase 0

### Phase 0.5: Automatisierung (~6–7 Tage)
- 0.5a: Automatischer Mahnlauf (dunningEntries, Mahnstufen 30/60/90)
- 0.5b: Aufgaben-Erinnerungen (Eskalationsstufen gelb/orange/rot)
- 0.5c: HubSpot Auto-Sync (periodischer Sync)
- 0.5d: Benachrichtigungssystem (Prioritäten, Glocke mit Zähler)
- 0.5e: Scheduled-Tasks-Engine (DB-basierte Task-Queue)
- 0.5f: Unit-Tests für Phase 0.5

### Danach: v7.0 → v7.1 → v7.2 → v7.3 → Phase 4 → Phase 5 → Phase 6
(Details in todo.md)

---

## Technische Regeln

### Anthropic Claude Opus 4 Nutzung
- **API-Key:** Ist als Umgebungsvariable `ANTHROPIC_API_KEY` verfügbar
- **Modell:** `claude-opus-4-20250514`
- **Wann nutzen:** Für komplexe Architektur-Entscheidungen, State-Machine-Design, Zod-Schema-Generierung, Code-Reviews
- **SDK:** `pip3 install anthropic` (muss nach Sandbox-Reset neu installiert werden)
- **Achtung:** API-Guthaben ist begrenzt. Nutze Opus 4 gezielt für Architektur-Fragen, nicht für einfaches Coding.

### Build Loop (4 Schritte pro Feature)
1. Schema in `drizzle/schema.ts` aktualisieren → `pnpm db:push`
2. DB-Helfer in `server/db.ts` hinzufügen
3. tRPC-Prozedur in `server/routers.ts` erstellen (oder neuen Router-File)
4. UI mit `trpc.*.useQuery/useMutation` anbinden

### Todo-Tracking (PFLICHT)
- **Vor** jeder Implementierung: Aufgabe in `todo.md` identifizieren
- **Nach** jeder Implementierung: `[ ]` → `[x]` in `todo.md` ändern
- **Vor** jedem Checkpoint: `todo.md` lesen und Vollständigkeit prüfen
- **Neue Erkenntnisse:** Sofort als neue `[ ]` Aufgaben in `todo.md` ergänzen

### Checkpoints (PFLICHT)
- Nach jeder abgeschlossenen **Sub-Phase** (z.B. 0a, 0b, 0c) einen Checkpoint speichern
- Beschreibung muss enthalten: Was wurde implementiert, welche Tests bestehen
- Vor Checkpoint: Alle lokalen Medien-Dateien mit `manus-upload-file` auf S3 hochladen

### Unit-Tests (PFLICHT)
- Jede neue Prozedur braucht mindestens einen Test in `server/*.test.ts`
- Tests mit `pnpm test` ausführen
- Referenz-Testdatei: `server/auth.logout.test.ts`
- Ziel: 215+ Tests (aktuell 215)

---

## Bereits vorhandene Infrastruktur (NICHT neu implementieren)

| Bereich | Status | Details |
|---|---|---|
| **Auth/Login** | Vorhanden | Manus OAuth, `protectedProcedure`, `ctx.user`, Rollen (admin/user) |
| **S3-Storage** | Vorhanden | `storagePut`/`storageGet` in `server/storage.ts` |
| **LLM-Integration** | Vorhanden | `invokeLLM` in `server/_core/llm.ts` |
| **Benachrichtigungen (Owner)** | Vorhanden | `notifyOwner` in `server/_core/notification.ts` |
| **JWT/Sessions** | Vorhanden | Session-Cookie-Handling in `server/_core/` |
| **HubSpot-Sync (Basis)** | Vorhanden | Sync-Funktionen existieren, aber kein Auto-Sync |
| **PDF-Export (Angebote)** | Vorhanden | `AngebotPDFGenerator.tsx` |
| **Globale Suche** | Vorhanden | Cmd+K Suche implementiert |
| **Dunkelmodus** | Vorhanden | Theme-Toggle funktioniert |

---

## Bekannte Architektur-Entscheidungen (aus Opus-4-Validierung)

Diese Entscheidungen wurden bereits getroffen und müssen umgesetzt werden:

1. **State-Machine:** Eigene leichtgewichtige Implementierung in `server/workflow/stateMachine.ts` (NICHT XState)
2. **Workflow-History:** Neue Tabelle in MySQL statt separatem Event-Store
3. **Automatisierung:** DB-basierte `scheduledTasks`-Tabelle statt externer Queue (kein Redis/Bull)
4. **Phasen-Validierung:** Zod-Schemas + Guard-Funktionen pro Übergang
5. **Caching:** React Query für API-Cache (kein Redis auf Manus-Hosting)

---

## Bekannte Probleme (aus Analyse)

### 5 Kritische Workflow-Brüche (Phase 0 behebt diese)
1. `saveFromWizard` setzt Projektphase NICHT auf "angebot_erstellt"
2. `sendOfferEmail` setzt Phase NICHT auf "angebot_versendet" und Status NICHT auf "versendet"
3. Kein automatischer Übergang angebot_versendet → nachfassen
4. Kein automatischer Übergang auftrag_gewonnen → planung → vorbereitung → durchfuehrung
5. `project.update` erlaubt beliebige Phasenänderung ohne Validierung

### 11 Mock-basierte Seiten (Phase 4–6 ersetzen diese)
MobileApp, Teamleitercheck, Einsatzplanung, Ressourcen, Berichtswesen, Finanzen, Dokumente, Bibliothek, Verzeichnisse, HubSpotIntegration, PDFEntwuerfe

---

## Qualitätskriterien

- **Jede Aufgabe** muss in `todo.md` als `[x]` markiert werden
- **Jede Prozedur** braucht einen Unit-Test
- **Jedes Feature** muss im Browser verifiziert werden (Dev-Server prüfen)
- **Kein Mock-Daten-Fallback** in neuen Features – nur echte DB-Daten
- **FassadenFix Corporate Design** beibehalten (Skill `fassadenfix-branding` lesen)
- **Responsive Design** für alle neuen Komponenten
- **Fehlerbehandlung** in jeder Prozedur (try/catch, TRPCError)

---

## Arbeitsweise

1. **Lies die todo.md** und identifiziere die nächste offene Phase
2. **Lies den implementierungsplan-final.md** für die Details dieser Phase
3. **Implementiere** Aufgabe für Aufgabe in der vorgegebenen Reihenfolge
4. **Teste** jede Änderung (Unit-Tests + Browser-Check)
5. **Markiere** erledigte Aufgaben in der todo.md
6. **Speichere** einen Checkpoint nach jeder Sub-Phase
7. **Berichte** den Fortschritt nach jedem Checkpoint
8. **Wiederhole** bis alle Aufgaben der Phase abgeschlossen sind
9. **Fahre** mit der nächsten Phase fort

Bei Unklarheiten oder Architektur-Fragen: Nutze die Anthropic API mit Claude Opus 4 für eine fundierte Entscheidung, bevor du implementierst.

---

*Erstellt am 09.02.2026 basierend auf der vollständigen Planungsphase (Analyse → Bericht → Implementierungsplan → Opus-4-Validierung).*
