# FassadenFix Angebot PDF-Vorlage Design-Analyse

## Layout-Struktur

### Header-Bereich
- **Logo**: Oben zentriert, FassadenFix Logo mit Icon (grün) und Schriftzug (dunkelgrau)
- **Firmenzeile**: Unter Logo, klein, grau: "FASSADENFIX • Immobiliengruppe Retzlaff OHG • An der Saalebahn 8a • 06118 Halle"

### Adressblock (zweispaltig)
| Links (Empfänger) | Rechts (Metadaten) |
|-------------------|-------------------|
| Firmenname (fett) | Angebotnummer |
| Ansprechpartner | Kundennummer |
| Straße | Datum (fett rechts) |
| PLZ Ort | Ihr Ansprechpartner |
| | E-Mail |
| | Mobil |

### Angebots-Titel
- **"Angebot Nr."** – Raleway Bold, dunkelgrau, unterstrichen mit grüner Linie

### Einleitungstext
- Standard-Begrüßung: "Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!"
- "Nachfolgend unser individuelles Angebot für Sie:"

### Positionstabelle
| Pos | Menge | Bezeichnung | Einzelpreis | Gesamt |
|-----|-------|-------------|-------------|--------|
| (grün) | | | | |

- Header-Zeile: "Pos" in Grün (#77bc1f), Rest in Dunkelgrau
- Trennlinie unter Header: grün

### Summenblock (rechtsbündig)
```
Nettobetrag          0,00 €
zzgl. 19% MwSt.      0,00 €
─────────────────────────────
Gesamtsumme          0,00 €  (fett)
```

---

## STÖRER-ELEMENT ("Das FassadenFix Versprechen")

### Struktur
- **Container**: Abgerundete Ecken, hellgrauer Hintergrund (#f5f5f5)
- **Header-Bar**: Grüner Balken (#77bc1f) mit weißem Text "Das FassadenFix Versprechen"
- **Zwei-Spalten-Layout** im Container:

#### Linke Spalte: "Transparente Preisstaffel"
| FLÄCHE | €/M² |
|--------|------|
| 500 – 999 m² | 10,50 € |
| 1.000 – 2.499 m² | 9,75 € |
| 2.500 – 4.999 m² | 9,25 € |
| ab 5.000 m² | 8,75 € |

#### Rechte Spalte: "Unsere Garantien"
- ✓ 5-Jahres-Garantie auf Algenfreiheit
- ✓ Ergebnisgarantie bei Systemreinigung
- ✓ Jährliche Inspektion inklusive
- ✓ Pauschalfestpreis – keine versteckten Kosten

### Footer des Störers
- Grüner Text, zentriert: "FassadenFix – der sichere Weg zur sauberen Fassade"

---

## Angebotsbedingungen

### Struktur
- **Überschrift**: "Angebotsbedingungen" (fett, dunkelgrau)
- **Inline-Felder** (grün hervorgehoben):
  - Gültigkeit: 04.03.2026 (4 Wochen)
  - Zahlung: 7 Tage netto
  - Leistungsort: wie vereinbart
- **Zusatztext**: "Sperrungen: Beantragung und Verantwortung beim AG. Es gelten unsere AGB (www.fassadenfix.de/agb)."
- **Trennlinie**: Grün, unter dem Block

---

## Footer

### Struktur (4 Spalten)
| Firma | Kontakt | Rechtliches | Bank |
|-------|---------|-------------|------|
| FASSADENFIX | Tel: 0345 21839235 | Geschäftsführer: A. Retzlaff | Commerzbank Halle |
| Immobiliengruppe Retzlaff oHG | info@fassadenfix.de | HRA 4244 · AG Stendal | DE49 8004 0000 0325 0123 00 |
| An der Saalebahn 8a | www.fassadenfix.de | USt-ID: DE265643072 | BIC: COBADEFFXXX |
| 06118 Halle (Saale) | | | |

### Design
- Grüner Balken oben (Akzentlinie)
- Grauer Text (#4e5758)
- Raleway Font

---

## CI-Farben (bestätigt)

| Farbe | HEX | Pantone | Verwendung |
|-------|-----|---------|------------|
| FassadenFix Grün | #77bc1f | 368 C | Akzente, Buttons, Störer-Header |
| Dunkelgrau | #4e5758 | 445 C | Text, Sekundärelemente |
| Hellgrau | #f5f5f5 | - | Störer-Hintergrund |
| Weiß | #ffffff | - | Haupthintergrund |

---

## Dynamische Inhalte für Störer

### Linke Spalte (Multiselect)
- Preisstaffel Standard
- Preisstaffel Großprojekt
- Frühbucher-Rabatte
- Mengenrabatte

### Rechte Spalte (Multiselect)
- 5-Jahres-Garantie
- Ergebnisgarantie
- Jährliche Inspektion
- Pauschalfestpreis
- Kostenlose Musterfläche
- Umweltfreundliche Reinigung

### Angebotsbedingungen (Multiselect)
- Gültigkeit (7/14/21/30 Tage)
- Zahlungsziel (7/14/21/30 Tage netto)
- Leistungsort
- Sperrungen
- AGB-Verweis
- Wettervorbehalt
- Zugänglichkeit
