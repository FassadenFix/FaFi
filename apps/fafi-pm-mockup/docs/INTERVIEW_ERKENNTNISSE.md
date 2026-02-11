# Interview-Erkenntnisse: Angebotserstellung

**Datum:** 05. Februar 2026  
**Status:** Bestätigt durch Benutzer

---

## Kernprinzip

> **"Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."**

- **Objektaufnahme** = Erfassung des IST-Zustands (was ist da?)
- **Angebotserstellung** = Ableitung der LÖSUNG (was brauchen wir?)

---

## Daten-Hierarchie

```
IMMOBILIE (zentrales Asset mit eigenem Lebenszyklus)
    ├── Kann zu mehreren Projekten gehören (über die Jahre)
    ├── Kann Eigentümer wechseln
    └── Historie bleibt erhalten

UNTERNEHMEN
    └── KONTAKTE (mehrere pro Unternehmen)
         └── PROJEKTE (mehrere pro Kontakt)
              └── IMMOBILIEN (zugeordnet, nicht "gehörend")
```

---

## Wizard-Flow (5 Schritte)

### Schritt 1: Projekt & Immobilien
- Projekt auswählen
- Immobilien dem Projekt zuordnen/entfernen (flexibel)
- Pro Immobilie: Seiten auswählen (Checkbox)

### Schritt 2: Positionen pro Immobilie
- Pro Seite: Bühnentechnik auswählen (Höhe berücksichtigen)
- Reinigungsmittel auswählen
- Baustelleneinrichtung (Pauschale 199€)
- Übernachtung (Eventualposition)

### Schritt 3: Kalkulation & Konditionen
- Automatische Preisberechnung (Gesamtfläche → Staffel)
- Rabatt auswählen
- Zahlungsziel (7 Tage Standard)
- Gültigkeit (4 Wochen Standard)

### Schritt 4: Individuelle Bedingungen & Störer
- Besonderheiten aus Objektaufnahme (Sperrungen, Grünschnitt)
- Störer mit 2-Spalten-Layout

### Schritt 5: Zusammenfassung & PDF
- Prüfen
- PDF generieren

---

## Positionsstruktur im PDF

```
Pos. 1: Sonnenhofweg 1-5, 12345 Leipzig
        Seiten: Frontseite (800 m²), Rückseite (1.200 m²)
        Besonderheiten: Straßensperrung erforderlich, Algenbefall stark

  1.1   FassadenFix Systemreinigung       2.000 m²  ×  9,25€  =  18.500,00€
  1.2   Hubarbeitsbühne 18m               4 Tage    ×  280€   =   1.120,00€
  1.3   Baustelleneinrichtung             1 Pausch.           =     199,00€
  1.4   Übernachtung (Eventualpos.)       3 Nächte  ×  XX€    =     XXX,XX€

Pos. 2: Sonnenhofweg 6-10, 12345 Leipzig
        ...
```

**Wichtig:**
- Kopfposition = Immobilie mit Kurzinfo (Seiten, Besonderheiten)
- Unterpositionen = Die eigentlichen Leistungen
- Fläche pro Immobilie wird zusammengezogen (nicht pro Seite einzeln)

---

## Preisstaffelung

- Basiert auf **GESAMTFLÄCHE aller Immobilien** im Angebot
- Gleicher Preis/m² für alle Immobilien
- Staffeln:
  - 500-999 m² → 10,50 €/m²
  - 1.000-2.499 m² → 9,75 €/m²
  - 2.500-4.999 m² → 9,25 €/m²
  - ab 5.000 m² → 8,75 €/m²

**Verkaufsargument:** "Je mehr Fläche, desto günstiger der Quadratmeterpreis"

---

## Störer-Layout (2 Spalten)

```
┌─────────────────────────────────────────────────────────────────┐
│  LINKE SPALTE                    RECHTE SPALTE                  │
│  ─────────────                   ─────────────                  │
│                                                                 │
│  Preisstaffel-Transparenz        Unsere Leistungen:             │
│                                                                 │
│  Ihre Gesamtfläche: 2.800 m²     ✓ Pauschalfestpreisgarantie    │
│  → Staffel: 9,25 €/m²              Nachträge existieren nicht   │
│                                                                 │
│  [Staffel-Visualisierung]        ✓ Ergebnisgarantie             │
│                                                                 │
│                                  ✓ 5 Jahre Algenfrei-Garantie   │
│                                                                 │
│                                  ✓ Jährliche Inspektion         │
│                                    (Exklusiv-Leistung)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priorität

**Funktionsfähiger Angebots-Generator bis heute Vormittag!**

Störer-Auswählbarkeit kommt später.
