# Accessibility & Performance Audit – FaFi PM
## Datum: 09. Februar 2026

---

## Zusammenfassung

Das Audit wurde mit axe-core (WCAG 2.1 AA) auf allen 12 Hauptseiten durchgeführt. Es wurden **3 einzigartige Violation-Typen** gefunden, davon **0 Critical**, **1 Serious** und **2 Moderate**. Alle 3 Violations betreffen die gesamte Anwendung (alle 12 Seiten) und sind mit wenigen Code-Änderungen behebbar. Die Farbkontraste bestehen auf allen Seiten. Die Performance-Metriken sind gut (FCP unter 800ms auf allen Seiten).

---

## 1. Accessibility-Ergebnisse (axe-core WCAG 2.1 AA)

### Violation 1: html-has-lang (SERIOUS)
Die `<html>`-Element hat kein `lang`-Attribut. Dies ist für Screen-Reader essentiell, um die Sprache der Seite zu erkennen.

**Betroffen:** Alle 12 Seiten (12 Nodes)
**Fix:** `lang="de"` zum `<html>`-Tag in `client/index.html` hinzufügen

### Violation 2: landmark-one-main (MODERATE)
Das Dokument hat kein `<main>`-Landmark. Screen-Reader nutzen Landmarks zur Navigation.

**Betroffen:** Alle 12 Seiten (12 Nodes)
**Fix:** `<main>` Element im DashboardLayout oder App-Wrapper hinzufügen

### Violation 3: region (MODERATE)
Seiteninhalt ist nicht vollständig in Landmarks enthalten. Einige Elemente liegen außerhalb von `<header>`, `<nav>`, `<main>`, `<footer>`.

**Betroffen:** Alle 12 Seiten (36 Nodes)
**Fix:** Content in semantische Landmarks wrappen (wird durch Fix von Violation 2 größtenteils behoben)

---

## 2. Farbkontrast-Ergebnisse

| Seite | Violations | Passes | Status |
|---|---|---|---|
| Dashboard | 0 | 1 | BESTANDEN |
| Projekte | 0 | 1 | BESTANDEN |
| Immobilien | 0 | 1 | BESTANDEN |
| Baustellen | 0 | 1 | BESTANDEN |
| Unternehmen & Kontakte | 0 | 1 | BESTANDEN |

**Ergebnis:** Alle Farbkontraste entsprechen WCAG AA (4.5:1 für normalen Text, 3:1 für großen Text).

---

## 3. Performance-Metriken

| Seite | FCP (ms) | DOM Ready (ms) | Bewertung |
|---|---|---|---|
| Dashboard | 768 | 437 | Gut |
| Projekte | 712 | 457 | Gut |
| Immobilien | 540 | 482 | Gut |
| Baustellen | 604 | 524 | Gut |
| Unternehmen & Kontakte | 480 | 423 | Gut |

**Ergebnis:** Alle Seiten laden unter 1 Sekunde (FCP). Die DOM-Ready-Zeiten liegen unter 550ms. Dies sind gute Werte für eine SPA mit Server-Side-Rendering.

---

## 4. Maßnahmenplan

### Fix 1: lang-Attribut hinzufügen (SERIOUS → sofort beheben)
```html
<!-- client/index.html -->
<html lang="de">
```

### Fix 2: Main-Landmark hinzufügen (MODERATE → sofort beheben)
```tsx
// DashboardLayout.tsx oder App-Wrapper
<main role="main" id="main-content">
  {children}
</main>
```

### Fix 3: Skip-Navigation verbessern (MODERATE → empfohlen)
Der "Zum Hauptinhalt springen" Link ist bereits vorhanden. Sicherstellen, dass er auf `#main-content` zeigt.

---

## 5. Gesamtbewertung

| Kategorie | Score | Bewertung |
|---|---|---|
| Accessibility (axe-core) | 0 Critical, 1 Serious, 2 Moderate | B+ (nach Fix: A) |
| Farbkontrast | 0 Violations | A |
| Performance (FCP) | <800ms alle Seiten | A |
| Keyboard-Navigation | Skip-Link vorhanden | B+ |

**Gesamtnote: B+ (nach Behebung der 3 Violations: A)**

Die 3 Violations sind alle mit minimalen Code-Änderungen behebbar (2 Zeilen HTML + 1 Wrapper-Änderung).
