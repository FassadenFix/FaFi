# Footer-Vergleich: Iteration 1

## Aktueller Stand nach Korrektur

### Korrigierte Werte:
- Spaltenbreiten: 32% 25% 25% 18% (statt 28% 20% 26% 26%)
- Zeilenabstand: 1.3 (statt 1.4)
- IBAN-Hintergrund: #c8e6c9 (hellgrün)
- FASSADENFIX: Grün (#77bc1f)

## Verbleibende Abweichungen

### 1. Abstand zur grünen Trennlinie
- Original: ca. 20-25px
- Aktuell: 32px
- **Korrektur:** marginTop auf 24px reduzieren

### 2. Zeilenabstände innerhalb der Spalten
- Original: Zeilen sind enger zusammen
- Aktuell: marginBottom: 1px/2px
- **Korrektur:** marginBottom auf 0 setzen, nur Zeilenabstand verwenden

### 3. Schriftgröße
- Original: ca. 7-8px (sehr klein)
- Aktuell: 8px
- **Prüfen:** Eventuell 7px

### 4. Grüne Trennlinie
- Original: Vorhanden, ca. 2px Höhe
- Aktuell: Vorhanden
- **Status:** OK

## Nächste Korrekturen
1. marginTop: 32px → 24px
2. marginBottom bei allen p-Tags: entfernen oder auf 0
3. Schriftgröße: 8px → 7px testen
