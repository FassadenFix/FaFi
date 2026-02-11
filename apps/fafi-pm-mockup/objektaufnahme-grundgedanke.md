# Objektaufnahme - Grundgedanke (aus PDF-Analyse)

## Kernkonzept

**Objektaufnahme = Immobilie bzw. Gebäude (abrechenbare Wirtschaftseinheit)**

### Hintergrund
- Immobilie muss einzeln betrachtet werden können
- z.B. Verkauf: Unterlagen dürfen nicht für Eigentümer oder Projekt orientiert sein
- Beispiel: Garantieurkunde

## Zentrale Anforderung

**Objekt/Immobilie stets KOMPLETT aufnehmen**

d.h. **ALLE Seiten** müssen erfasst werden:

### Musst-Erfassungs-Felder (pro Seite):
1. **Aufmaß** - Breite × Höhe = Fläche
2. **Bilder/Video/360°** - direkt via Upload? als Link? vor Ort mit Checkbox? ggf. API mit Ricoh Theta Tours
3. **Zustand/Schäden** - Bewertung und Dokumentation
4. **Zuwegung/Zugänglichkeit** - Wie erreichbar?
5. **Nötige Bühne/Klettern/etc.** - Gerüst-/Bühnentyp
6. **Nötige Sperrungen** - Gehweg, Parkplätze, Straße, etc.
7. **Besonderheiten** - Sonderfälle
8. **Wasseranschluss** - Wo, Welcher, Wieviel Zoll?
9. **Reinigungsmittelauswahl?** - Für Anwendungstechnik

## Abweichungen zur aktuellen Umsetzung

### Aktueller Wizard (5 Schritte):
1. Stammdaten (Adresse, HubSpot, Ansprechpartner)
2. Technische Aufnahme (Aufmaß, Fotos, 360°, Zustand)
3. Ressourcen & Logistik (Bühne, Sperrungen, Wasser)
4. Kaufmännische Daten (Termine, Rabatte, Marketing)
5. Zusammenfassung

### Problem:
- **Keine seitenweise Erfassung!**
- Alle Felder werden für die gesamte Immobilie erfasst, nicht pro Seite
- Das Konzept "ALLE Seiten" fehlt komplett

### Lösung:
- Wizard muss **pro Objektseite** durchlaufen werden
- Seiten: Nord, Ost, Süd, West (+ ggf. Dach, Sockel)
- Jede Seite hat eigene Werte für:
  - Aufmaß (Breite × Höhe)
  - Bilder/360°
  - Zustand/Schäden
  - Bühnentyp
  - Sperrungen
  - Besonderheiten
- Entscheidung pro Seite: "Zu reinigen?" (Ja/Nein/Undecided)
- Erst wenn alle Seiten entschieden sind, kann fortgefahren werden
