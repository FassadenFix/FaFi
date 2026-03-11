# Typografie-Audit: FassadenFix Angebots-PDF

## CI-Vorgaben (aus fassadenfix-branding Skill)

### Offizielle Schriftart
- **Schriftart:** Raleway (Google Fonts)
- **Gewichte:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Offizielle Farben
| Farbe | HEX | Verwendung |
|-------|-----|------------|
| **FassadenFix Grün** | `#77bc1f` | Primärfarbe, Akzente, CTAs |
| **Dunkelgrau** | `#4e5758` | Fließtext, Sekundärelemente |
| **Hellgrau (Text)** | `#6b7577` | Sekundärtext, Labels |

### Offizielle Schriftgrößen (rem → px bei 16px Base)
| Verwendung | rem | px |
|------------|-----|-----|
| H1 | 3rem | 48px |
| H2 | 2.25rem | 36px |
| H3 | 1.875rem | 30px |
| H4 | 1.5rem | 24px |
| Body | 1rem | 16px |
| Small | 0.875rem | 14px |
| XS | 0.75rem | 12px |

### Zeilenabstand
- **Body:** line-height: 1.6

---

## Identifizierte Unregelmäßigkeiten im aktuellen PDF

### 1. SCHRIFTGRÖSSEN - Wildwuchs

| Element | Aktuell | Problem | CI-konform |
|---------|---------|---------|------------|
| Basis | 11px | Zu klein, nicht im CI-System | 12px (0.75rem) oder 14px (0.875rem) |
| Firmenzeile | 9px | Zu klein | 10px oder 11px |
| Adresse Empfänger | 11px (Standard) | OK | OK |
| Firma Empfänger | 13px | Nicht im System | 14px (0.875rem) |
| Metadaten-Tabelle | 10px | OK | OK |
| Angebots-Titel | 18px | Nicht im System | 18px oder 20px |
| Positionstabelle Header | 10px (implizit) | OK | OK |
| Positionstabelle Body | 10px | OK | OK |
| Besonderheiten | 8px | Zu klein! | 10px |
| Störer Header | 12px | OK | OK |
| Störer Überschriften | 10px | OK | OK |
| Störer Leistungen | 9px | Zu klein | 10px |
| Störer Sublabels | 7px | Viel zu klein! | 9px |
| Staffel-Tabelle | 8px | Zu klein | 9px oder 10px |
| Bedingungen | 10px | OK | OK |
| Bedingungen Zusatz | 9px | Grenzwertig | 9px OK |
| Footer | 8px | Zu klein | 9px |

**Fazit:** 7 verschiedene Schriftgrößen (7px, 8px, 9px, 10px, 11px, 13px, 18px) - zu viele!

### 2. SCHRIFTGEWICHTE - Inkonsistent

| Element | Aktuell | Problem |
|---------|---------|---------|
| Firma Empfänger | font-bold (700) | OK |
| Metadaten Labels | Normal (400) | OK |
| Metadaten Werte | font-medium (500) / font-bold | Inkonsistent! |
| Angebots-Titel | font-bold (700) | OK |
| Tabellen-Header | font-semibold (600) | OK |
| Positionsnummern | font-bold (700) | OK |
| Störer Header | font-bold (700) | OK |
| Störer Leistungen | font-semibold (600) | OK |
| Bedingungen Labels | font-medium (500) | OK |

**Fazit:** Metadaten-Werte inkonsistent (mal medium, mal bold)

### 3. FARBEN - Leichte Abweichungen

| Element | Aktuell | Problem | CI-konform |
|---------|---------|---------|------------|
| Basis-Text | #4e5758 | ✅ | ✅ |
| Sekundär-Text | #6b7577 | ✅ | ✅ |
| Grün | #77bc1f | ✅ | ✅ |
| Hintergrund Störer | #f8faf5 | Nicht im CI | #f9fafb (gray-50) |
| Hintergrund Zeilen | #f5f5f5 | Nicht im CI | #f3f4f6 (gray-100) |

**Fazit:** Hintergrundfarben leicht abweichend

### 4. ZEILENABSTÄNDE - Inkonsistent

| Element | Aktuell | Problem |
|---------|---------|---------|
| Basis | line-height: 1.5 | CI sagt 1.6 |
| Tabellen | py-1.5, py-2 | Inkonsistent |
| Störer-Items | space-y-2, space-y-3 | Inkonsistent |

**Fazit:** Zeilenabstand 1.5 statt 1.6, Padding inkonsistent

### 5. ABSTÄNDE - Uneinheitlich

| Element | Aktuell | Problem |
|---------|---------|---------|
| mb-4, mb-6, mb-8 | Verschiedene | Kein System |
| py-1, py-1.5, py-2, py-3 | Verschiedene | Kein 8px-Grid |
| px-4, px-5 | Verschiedene | Kein System |

**Fazit:** Kein einheitliches 8px-Grid-System

---

## Empfohlene Vereinheitlichung

### Schriftgrößen-System (PDF-optimiert)

| Verwendung | Größe | Gewicht |
|------------|-------|---------|
| **Angebots-Titel** | 18px | Bold (700) |
| **Firma Empfänger** | 14px | Bold (700) |
| **Basis-Text** | 11px | Regular (400) |
| **Tabellen-Header** | 10px | SemiBold (600) |
| **Tabellen-Body** | 10px | Regular (400) |
| **Sekundär-Text** | 9px | Regular (400) |
| **Footer** | 8px | Regular (400) |

**Nur 5 Schriftgrößen:** 8px, 9px, 10px, 11px, 14px, 18px

### Farben-System

```css
--text-primary: #4e5758;     /* Haupttext */
--text-secondary: #6b7577;   /* Labels, Sekundärtext */
--accent: #77bc1f;           /* Grün */
--bg-highlight: #f3f4f6;     /* Zeilen-Highlight */
--bg-störer: #f9fafb;        /* Störer-Hintergrund */
```

### Abstands-System (8px-Grid)

```css
--space-1: 4px;   /* py-1 */
--space-2: 8px;   /* py-2 */
--space-3: 12px;  /* py-3 */
--space-4: 16px;  /* py-4 */
--space-6: 24px;  /* py-6 */
--space-8: 32px;  /* py-8 */
```

---

## Checkliste für Entwurf B

- [ ] Schriftgrößen auf 5 reduzieren
- [ ] Alle 7px → 9px
- [ ] Alle 8px → 9px (außer Footer)
- [ ] Alle 13px → 14px
- [ ] Zeilenabstand auf 1.6
- [ ] Padding auf 8px-Grid
- [ ] Hintergrundfarben CI-konform
- [ ] Störer kompakter (ohne Preisstaffel-Tabelle)
- [ ] Gesamtfläche in Kalkulationstabelle
