# FaFi PM - Massnahmenplan v3.0

**Autor:** Manus AI
**Datum:** 09. Februar 2026
**Basis:** Analyse-Bericht v3.0 (Test-Prompt v3.0 gegen aktuellen Code-Stand)
**Status:** 14 Findings identifiziert, priorisiert nach Schweregrad und Aufwand

---

## Zusammenfassung

Aus der systematischen Analyse des FaFi PM gegen den Test-Prompt v3.0 und die FassadenFix Skills ergeben sich **14 konkrete Massnahmen**, die in drei Prioritaetsstufen gegliedert sind. Der Gesamtaufwand betraegt schaetzungsweise **8-12 Stunden**, wobei die Quick Wins innerhalb von **2 Stunden** umsetzbar sind und den groessten Impact haben.

---

## Phase 1: Quick Wins (Sofort umsetzbar, 1-2 Stunden)

Diese Massnahmen haben den hoechsten Impact bei geringstem Aufwand und sollten **sofort** umgesetzt werden.

| Nr | Massnahme | Bug-Ref | Aufwand | Impact | Dateien |
|----|-----------|---------|---------|--------|---------|
| M-01 | **Schriftart Roboto durch Raleway ersetzen** | BUG-001 | 15 Min | Critical - Fundamentale CI-Verletzung behoben | `client/index.html`, `client/src/index.css` |
| M-02 | **Doppelte Route /ressourcen beheben** | BUG-002 | 30 Min | Major - Routing-Fehler behoben | `client/src/App.tsx`, DashboardLayout.tsx |
| M-03 | **Tote Dateien entfernen** | BUG-006/007/008 | 15 Min | Minor - Code-Hygiene | `PlaceholderPages.tsx`, `Verzeichnisse.tsx`, `Home.tsx`, `ComponentShowcase.tsx` |

### M-01: Schriftart Roboto durch Raleway ersetzen

**Schritt 1:** Google Fonts Import in `client/index.html` aendern:
```html
<!-- ALT -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />

<!-- NEU -->
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Schritt 2:** Font-Family in `client/src/index.css` aendern:
```css
/* Zeile 158 - Body */
font-family: 'Raleway', sans-serif;

/* Zeile 174 - Headlines */
font-family: 'Raleway', sans-serif;
```

**Schritt 3:** Visuell pruefen, dass alle Texte korrekt dargestellt werden.

### M-02: Doppelte Route /ressourcen beheben

**Option A (Empfohlen):** Route in Bereich 8 umbenennen:
```tsx
// App.tsx Zeile 142 - Bereich 8: Unternehmenssystem
<Route path="/materialien" component={Ressourcen} />
```
Und in DashboardLayout.tsx den Sidebar-Link anpassen:
```tsx
// Bereich "Unternehmenssystem"
{ icon: Package, label: "Materialien & Geraete", href: "/materialien" }
```

**Option B:** Beide Routen auf dieselbe Seite zeigen lassen (wenn gewuenscht), aber die doppelte Definition entfernen.

### M-03: Tote Dateien entfernen

```bash
rm client/src/pages/PlaceholderPages.tsx
rm client/src/pages/Verzeichnisse.tsx
rm client/src/pages/Home.tsx
rm client/src/pages/ComponentShowcase.tsx
```

Sicherstellen, dass keine Imports auf diese Dateien verweisen.

---

## Phase 2: Mid-Term (1-2 Tage)

Diese Massnahmen verbessern die Stabilitaet und Wartbarkeit der Anwendung.

| Nr | Massnahme | Bug-Ref | Aufwand | Impact | Dateien |
|----|-----------|---------|---------|--------|---------|
| M-04 | **TaskRunner ECONNRESET beheben** | BUG-004 | 2 Std | Major - Zuverlaessigkeit der Hintergrundprozesse | `server/services/taskRunner.ts`, DB-Config |
| M-05 | **shared/const.ts bereinigen** | BUG-003 | 1 Std | Major - Code-Organisation | `shared/const.ts`, neue Dateien |
| M-06 | **DB-Migrationen initialisieren** | BUG-005 | 30 Min | Major - Produktionsreife | `drizzle/migrations/` |
| M-07 | **Dark Mode visuell testen** | BUG-010 | 2 Std | Minor - UX-Qualitaet | Alle Seiten |
| M-08 | **INT-07 Auftraggeber/Auftragnehmer** | INT-07 | 2 Std | Minor - Interview-Compliance | Tasks-UI, Aufgaben-Komponenten |

### M-04: TaskRunner ECONNRESET beheben

**Ursache:** Die TiDB-Verbindung wird bei Inaktivitaet geschlossen, der Connection Pool erkennt dies nicht rechtzeitig.

**Loesung:**
1. In der Drizzle-Konfiguration `connectionLimit` und `connectTimeout` pruefen
2. `enableKeepAlive: true` und `keepAliveInitialDelay: 10000` setzen
3. Try-Catch im TaskRunner verstaerken:
```typescript
// server/services/taskRunner.ts - processDueTasks()
try {
  const dueTasks = await db.select()...;
} catch (error) {
  if (error.message?.includes('ECONNRESET')) {
    console.warn('[TaskRunner] DB-Verbindung unterbrochen, naechster Versuch in 5 Min');
    return { ...stats, errors: 1 };
  }
  throw error;
}
```

### M-05: shared/const.ts bereinigen

1. `IMAGES`-Konstante in `shared/images.ts` auslagern
2. `PROJECT_PHASES` pruefen ob in `shared/schemas/workflow.ts` bereits als `PHASE_METADATA` vorhanden
3. Alle Imports aktualisieren
4. Alte Mock-Konstanten (`MOCK_PROJECTS`, `MOCK_TASKS`, etc.) endgueltig entfernen

### M-06: DB-Migrationen initialisieren

```bash
cd /home/ubuntu/fafi-pm-mockup
pnpm drizzle-kit generate  # Generiert Initial-Migration
```

### M-07: Dark Mode visuell testen

Systematisch alle 45 Seiten im Dark Mode pruefen:
- Textlesbarkeit (Kontrast >= 4.5:1)
- Korrekte Farbumkehr aller semantischen Farben
- Keine hartcodierten Farben die im Dark Mode unsichtbar werden
- Sidebar, Modals, Wizards, PDFs

### M-08: Auftraggeber/Auftragnehmer-Unterscheidung

In der Aufgaben-UI eine visuelle Unterscheidung einfuehren:
- Badge oder Icon fuer "Auftraggeber-Aufgabe" vs. "Auftragnehmer-Aufgabe"
- Filter in der Aufgabenliste
- Feld `responsibility: 'auftraggeber' | 'auftragnehmer'` in Tasks-Schema

---

## Phase 3: Strukturelle Verbesserungen (1-2 Wochen)

Diese Massnahmen betreffen die langfristige Qualitaet und Skalierbarkeit.

| Nr | Massnahme | Aufwand | Impact | Beschreibung |
|----|-----------|---------|--------|-------------|
| M-09 | **Visueller Regressionstest** | 4 Std | Hoch | Playwright Visual Regression fuer alle 45 Seiten einrichten |
| M-10 | **Accessibility-Audit** | 4 Std | Mittel | WCAG 2.1 AA Compliance pruefen (axe-core) |
| M-11 | **Performance-Baseline** | 2 Std | Mittel | Lighthouse CI fuer FCP, TTI, Bundle-Size |
| M-12 | **E2E-Tests erweitern** | 8 Std | Hoch | Playwright-Tests fuer alle 8 Wizards und Kernprozesse |
| M-13 | **Rollenbasierte E2E-Tests** | 4 Std | Mittel | Jede der 5 Rollen einzeln testen |
| M-14 | **Monitoring und Alerting** | 4 Std | Hoch | TaskRunner-Fehler, DB-Verbindungen, API-Latenz ueberwachen |

---

## Priorisierungs-Matrix

| Prioritaet | Massnahmen | Gesamtaufwand | Empfohlener Zeitraum |
|-----------|-----------|---------------|---------------------|
| **Sofort** (Quick Wins) | M-01, M-02, M-03 | ~1 Stunde | Heute |
| **Diese Woche** (Mid-Term) | M-04, M-05, M-06, M-07, M-08 | ~8 Stunden | KW 7 |
| **Naechste 2 Wochen** (Structural) | M-09 bis M-14 | ~26 Stunden | KW 8-9 |

---

## Abhaengigkeiten

```
M-01 (Schriftart) ──> M-07 (Dark Mode Test) ──> M-09 (Visual Regression)
M-02 (Route)      ──> M-12 (E2E-Tests)
M-04 (TaskRunner)  ──> M-14 (Monitoring)
M-05 (const.ts)   ──> M-06 (Migrationen)
M-08 (INT-07)     ──> M-13 (Rollen-Tests)
```

---

## Empfehlungen fuer die naechste Entwicklungsphase

Basierend auf der Analyse empfehle ich folgende strategische Schwerpunkte:

**Kurzfristig (vor Go-Live):**
Die Quick Wins (M-01 bis M-03) muessen vor jedem Go-Live oder jeder Demo umgesetzt werden. Die Schriftart-Korrektur (M-01) ist die wichtigste einzelne Massnahme, da sie die gesamte visuelle Erscheinung der Anwendung betrifft und eine fundamentale CI-Verletzung darstellt.

**Mittelfristig (Stabilisierung):**
Der TaskRunner-Fehler (M-04) und die DB-Migrationen (M-06) sind fuer den Produktivbetrieb essentiell. Ohne Migrationen gibt es keine Moeglichkeit, Schema-Aenderungen nachvollziehbar und rueckgaengig machbar durchzufuehren.

**Langfristig (Qualitaetssicherung):**
Die Einrichtung von Visual Regression Tests (M-09) und erweiterter E2E-Tests (M-12) wuerde die Qualitaetssicherung erheblich verbessern und Regressionen bei zukuenftigen Aenderungen verhindern.

---

## Offene Fragen an den Auftraggeber

Bevor die Massnahmen umgesetzt werden, sollten folgende Punkte geklaert werden:

1. **M-02 (Route /ressourcen):** Soll der Bereich "Unternehmenssystem > Ressourcen" in "Materialien & Geraete" umbenannt werden, oder soll eine kontextabhaengige Ressourcen-Seite erstellt werden?

2. **M-08 (Auftraggeber/Auftragnehmer):** Wie genau soll die Unterscheidung in der UI dargestellt werden? Badge, Farbe, separater Tab?

3. **Prioritaet:** Sollen die Quick Wins sofort umgesetzt werden, oder soll zuerst das Interview zu den offenen Fragen stattfinden?

---

*Dieser Massnahmenplan basiert auf dem Analyse-Bericht v3.0 und ist nach dem Prinzip "Hoechster Impact bei geringstem Aufwand zuerst" priorisiert. Alle Aufwandsschaetzungen sind konservativ und beinhalten Testing.*
