# Layout-Optimierung: Kaufmännisches Angebot auf 2 Seiten

**Ziel:** Kompaktes, professionelles Angebot mit optimaler Scanbarkeit  
**Erstellt:** 05. Februar 2026

---

## Aktuelle Analyse: Platzverbrauch

| Element | Aktuell | Optimiert | Einsparung |
|---------|---------|-----------|------------|
| Header (Logo + Firmenzeile) | ~80px | ~50px | -30px |
| Adressblock | ~100px | ~70px | -30px |
| Einleitungstext | ~60px | ~30px | -30px |
| Positionstabelle (1 Immo) | ~180px | ~140px | -40px |
| Störer (2-Spalten) | ~200px | ~120px | -80px |
| Angebotsbedingungen | ~100px | ~60px | -40px |
| Footer | ~80px | ~50px | -30px |
| **GESAMT** | ~800px | ~520px | **-280px** |

**Ergebnis:** ~35% Platzeinsparung ermöglicht 2-Seiten-Layout

---

## Optimierungsmaßnahmen im Detail

### 1. HEADER KOMPRIMIEREN

**Aktuell:**
```
[Logo 64px hoch]
[Firmenzeile 9px, mb-6]
```

**Optimiert:**
```
[Logo 40px hoch, links] [Firmenzeile rechts daneben]
```

**Code-Änderung:**
```tsx
// VORHER
<div className="flex justify-center mb-6">
  <img src={LOGO} className="h-16" />
</div>
<div className="text-center text-[9px] mb-6">
  FASSADENFIX • ...
</div>

// NACHHER
<div className="flex items-center justify-between mb-4">
  <img src={LOGO} className="h-10" />
  <div className="text-[8px] text-right" style={{ color: CI_COLORS.textGray }}>
    FASSADENFIX • Immobiliengruppe Retzlaff OHG<br/>
    An der Saalebahn 8a • 06118 Halle
  </div>
</div>
```

---

### 2. ADRESSBLOCK VERDICHTEN

**Aktuell:** 6 Zeilen Metadaten rechts

**Optimiert:** 4 Zeilen (Kundennummer entfernen, E-Mail/Mobil zusammenfassen)

```tsx
// VORHER
Angebotsnummer    ANG-2026-001
Kundennummer      [leer]
Datum             05.02.2026
Ihr Ansprechpartner  Alexander Retzlaff
E-Mail            a.retzlaff@fassadenfix.de
Mobil             0176 70408430

// NACHHER
Angebot           ANG-2026-001
Datum             05.02.2026
Gültig bis        05.03.2026 ⏰
Ansprechpartner   A. Retzlaff | 0176 70408430
```

**Urgency-Integration:** Gültigkeitsdatum direkt im Header!

---

### 3. EINLEITUNGSTEXT KÜRZEN

**Aktuell:**
> Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!
> Nachfolgend unser individuelles Angebot für Sie:

**Optimiert:**
> Ihr Angebot für die FassadenFix Systemreinigung:

**Begründung:** Im kaufmännischen Angebot ist Kürze Trumpf. Die emotionale Ansprache erfolgt im "Angebot Exklusiv".

---

### 4. POSITIONSTABELLE OPTIMIEREN

**Aktuelle Probleme:**
- Zu viel Padding (py-2, py-1.5)
- Seiten-Details in 8px kaum lesbar
- Leerzeilen zwischen Immobilien verschwenden Platz

**Optimierungen:**

| Aspekt | Aktuell | Optimiert |
|--------|---------|-----------|
| Zeilen-Padding | py-2 / py-1.5 | py-1 |
| Schriftgröße Tabelle | 10-11px | 10px einheitlich |
| Seiten-Details | Inline unter Position | Entfernen (nur Gesamtfläche) |
| Leerzeilen | py-1 Spacer | Entfernen |
| Besonderheiten | 8px inline | 9px, eigene Zeile wenn nötig |

**Kompakte Positionsstruktur:**
```
┌──────┬──────────────────────────────────────────────────────┐
│ 1.1  │ Sonnenallee 22-30, 06118 Halle (Schilder Rückseite) │
├──────┼──────────────────────────────────────────────────────┤
│ 1.2  │ FassadenFix Systemreinigung  1.280 m² × 9,75 €/m²  = 12.480,00 € │
│ 1.3  │ Hubarbeitsbühne (max. 14m)   3 Tage pauschal       = inkl.       │
│ 1.4  │ Baustelleneinrichtung        1 Psch.               = 199,00 €    │
├──────┼──────────────────────────────────────────────────────┤
│ A    │ Anfahrt (Hin- und Rückfahrt) 120 km × 0,50 €/km    = 60,00 €     │
└──────┴──────────────────────────────────────────────────────┘
```

---

### 5. STÖRER DRASTISCH KOMPRIMIEREN

**Aktuell:** 2-Spalten-Layout mit ~200px Höhe

**Problem:** Der Störer nimmt fast 1/4 der Seite ein!

**Lösung:** Einzeilige Kompaktversion

**Optimierter Störer (Inline-Variante):**
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Pauschalfestpreis  ✓ Ergebnisgarantie  ✓ 5J Algenfrei  ✓ Inspektion inkl. │
│ Preisstaffel: 1.280 m² = 9,75 €/m² (Staffel 1.001-2.000 m²)                  │
└─────────────────────────────────────────────────────────────┘
```

**Höhe:** ~40px statt ~200px = **160px Einsparung!**

**Alternative: Kompakte 2-Zeilen-Box:**
```
┌─────────────────────────────────────────────────────────────┐
│ DAS FASSADENFIX VERSPRECHEN                                 │
├─────────────────────────────────────────────────────────────┤
│ ✓ Pauschalfestpreis    ✓ Ergebnisgarantie                  │
│ ✓ 5 Jahre Algenfrei    ✓ Jährliche Inspektion inkl.        │
│─────────────────────────────────────────────────────────────│
│ Ihre Staffel: 1.280 m² → 9,75 €/m² (je mehr, desto günstiger) │
└─────────────────────────────────────────────────────────────┘
```

**Höhe:** ~80px = **120px Einsparung**

---

### 6. ANGEBOTSBEDINGUNGEN KOMPRIMIEREN

**Aktuell:** Mehrzeilig mit Überschrift

**Optimiert:** Einzeilig unter dem Summenblock

```
// VORHER
Angebotsbedingungen
Gültigkeit: 05.03.2026 (4 Wochen) · Zahlung: 7 Tage netto · Leistungsort: wie vereinbart
[Zusatzbedingungen in 9px]
[Individuelle Bedingungen in Box]

// NACHHER (direkt unter Gesamtsumme)
Gültig bis 05.03.2026 | Zahlung 7 Tage netto | Es gelten unsere AGB
```

**Individuelle Bedingungen:** Nur wenn vorhanden, als kompakte Liste

---

### 7. FOOTER KOMPRIMIEREN

**Aktuell:** 4-Spalten-Grid, ~80px

**Optimiert:** 2-Zeilen horizontal

```
// VORHER
[Firma]     [Kontakt]     [Rechtliches]     [Bank]
4 Zeilen    3 Zeilen      3 Zeilen          3 Zeilen

// NACHHER
FASSADENFIX · Immobiliengruppe Retzlaff oHG · An der Saalebahn 8a · 06118 Halle
Tel: 0345 21839235 · info@fassadenfix.de · HRA 4244 AG Stendal · USt-ID: DE265643072
```

**Höhe:** ~30px statt ~80px = **50px Einsparung**

---

## Optimiertes 2-Seiten-Layout (Mockup)

### SEITE 1

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo 40px]                    FASSADENFIX · Immo. Retzlaff │
│                                An der Saalebahn 8a · Halle  │
├─────────────────────────────────────────────────────────────┤
│ WBG Musterstadt GmbH           Angebot    ANG-2026-001     │
│ Herr Müller                    Datum      05.02.2026       │
│ Musterstraße 1                 Gültig bis 05.03.2026 ⏰    │
│ 06118 Halle                    Ansprechp. A. Retzlaff      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ANGEBOT NR. ANG-2026-001                                   │
│ ─────────────────────────                                   │
│ Ihr Angebot für die FassadenFix Systemreinigung:           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Pos │ Menge      │ Bezeichnung              │ EP    │ Gesamt│
│─────┼────────────┼──────────────────────────┼───────┼───────│
│ 1.1 │            │ Sonnenallee 22-30, Halle │       │       │
│ 1.2 │ 1.280 m²   │ FassadenFix Systemrein.  │ 9,75€ │12.480€│
│ 1.3 │ 3 Tage     │ Hubarbeitsbühne (14m)    │ psch. │ inkl. │
│ 1.4 │ 1 Psch.    │ Baustelleneinrichtung    │ 199€  │  199€ │
│─────┼────────────┼──────────────────────────┼───────┼───────│
│ A   │ 120 km     │ Anfahrt (Hin- u. Rück)   │ 0,50€ │   60€ │
├─────────────────────────────────────────────────────────────┤
│                                    Nettobetrag   12.739,00€ │
│                                    zzgl. 19% MwSt 2.420,41€ │
│                                    ═══════════════════════  │
│                                    GESAMTSUMME  15.159,41€  │
├─────────────────────────────────────────────────────────────┤
│ DAS FASSADENFIX VERSPRECHEN                                 │
│ ✓ Pauschalfestpreis  ✓ Ergebnisgarantie  ✓ 5J Algenfrei   │
│ ✓ Jährliche Inspektion inkl.                               │
│ Ihre Staffel: 1.280 m² → 9,75 €/m² (je mehr, desto günstiger)│
├─────────────────────────────────────────────────────────────┤
│ Gültig bis 05.03.2026 | Zahlung 7 Tage netto | AGB gelten  │
├─────────────────────────────────────────────────────────────┤
│ FASSADENFIX · Immo. Retzlaff oHG · An der Saalebahn 8a     │
│ Tel: 0345 21839235 · info@fassadenfix.de · HRA 4244        │
└─────────────────────────────────────────────────────────────┘
```

### SEITE 2 (nur bei mehreren Immobilien)

Fortsetzung der Positionstabelle + Summenblock + Störer + Footer

---

## Typografie-Optimierung

| Element | Aktuell | Optimiert |
|---------|---------|-----------|
| Logo | 64px | 40px |
| Firmenname (Kunde) | 13px bold | 12px bold |
| Angebots-Titel | 18px | 16px |
| Tabellen-Header | 11px | 10px |
| Tabellen-Body | 10-11px | 10px |
| Positionsnummern | 10px | 11px bold |
| Gesamtsumme | 12px | 14px bold |
| Störer-Text | 9-10px | 10px |
| Footer | 8px | 8px |

---

## Urgency-Elemente

**Position 1:** Im Metadaten-Block (Header rechts)
```
Gültig bis    05.03.2026 ⏰
```

**Position 2:** Im Angebotsbedingungen-Block
```
Gültig bis 05.03.2026 | Zahlung 7 Tage netto
```

**Optional (bei Frühbucher):** Banner unter Titel
```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 FRÜHBUCHER-RABATT: 6% bei Beauftragung bis 28.02.2026   │
└─────────────────────────────────────────────────────────────┘
```

---

## Zusammenfassung der Änderungen

| Bereich | Änderung | Impact |
|---------|----------|--------|
| Header | Logo + Firmenzeile horizontal | -30px |
| Adressblock | 4 statt 6 Zeilen, Urgency integriert | -30px |
| Einleitung | 1 Zeile statt 2 | -30px |
| Positionstabelle | Weniger Padding, keine Spacer | -40px |
| Störer | Kompakte 4-Zeilen-Box | -120px |
| Bedingungen | Inline unter Summe | -40px |
| Footer | 2 Zeilen horizontal | -50px |
| **GESAMT** | | **-340px** |

**Ergebnis:** Das Angebot passt jetzt auf 1-2 Seiten (je nach Immobilien-Anzahl)
