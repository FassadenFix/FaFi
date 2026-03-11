# Kontext-Analyse: Angebotserstellung bei FassadenFix

**Stand:** 05. Februar 2026  
**Zweck:** Dokumentation meines Verständnisses für das Interview mit dem Benutzer

---

## 1. Mein Verständnis des Gesamtprozesses

### Der Geschäftsprozess (wie ich ihn verstehe)

```
KUNDENANFRAGE
     ↓
OBJEKTAUFNAHME (vor Ort)
  - Immobilien erfassen
  - Seiten vermessen (Frontseite, Rückseite, Giebel)
  - Flächen pro Seite
  - Fassadenart
  - Besonderheiten (Sperrungen, Graffiti, etc.)
  - Zugänglichkeit prüfen
  - Wasseranschluss
  - Fotos machen
     ↓
PROJEKT ANLEGEN
  - Unternehmen zuordnen
  - Kontakt zuordnen
  - Immobilien dem Projekt zuweisen
     ↓
ANGEBOT ERSTELLEN
  - Projekt auswählen → Alle Daten werden geladen
  - Immobilien auswählen (Checkbox)
  - Kalkulation prüfen (automatisch nach Preisstaffel)
  - Rabatt festlegen
  - PDF generieren
     ↓
ANGEBOT VERSENDEN
     ↓
NACHFASSEN / AUFTRAG
```

### Kernprinzip (wie ich es verstehe)

> **"Die Objektaufnahme ist die Datenbasis. Das Angebot ist nur noch eine Zusammenstellung."**

Der Kundenberater soll im Angebots-Wizard **KEINE neuen Daten eingeben**, sondern nur aus bereits erfassten Daten **auswählen**.

---

## 2. Die Skills und ihre Rollen

| Skill | Rolle | Input | Output |
|-------|-------|-------|--------|
| **ff-angebotsmanager** | Orchestrator | Benutzer-Dialog | Koordiniert die anderen Skills |
| **ff-preisrechner** | Kalkulation | Gesamtfläche, Datum | Preis/m², Rabatt, Gesamtpreis |
| **ff-buehnenrechner** | Logistik | Fläche, Entfernung, Höhe | Bühnentage, Übernachtung |
| **ff-angebot-generator** | PDF-Erstellung | Alle Daten | PDF-Datei |

### Wichtige Berechnungslogik

1. **Preisstaffelung basiert auf GESAMTFLÄCHE** (alle Immobilien zusammen)
   - 500-999 m² → 10,50 €/m²
   - 1.000-2.499 m² → 9,75 €/m²
   - 2.500-4.999 m² → 9,25 €/m²
   - ab 5.000 m² → 8,75 €/m²

2. **Frühbucher-Rabatt** (auf Beauftragungsdatum)
   - bis 31.12. → 6%
   - bis 31.01. → 4,5%
   - bis 28.02. → 3%
   - bis 31.03. → 1,5%

3. **Bühnentage** = Gesamtfläche / 500 m² (aufgerundet)

4. **Übernachtung** erforderlich wenn:
   - Entfernung > 100 km ODER
   - Entfernung > 50 km UND Projektdauer > 1 Tag

---

## 3. MVP-Spezifikation: Angebots-Generator (5 Schritte)

Laut MVP-Spec soll der Wizard so aussehen:

1. **Projekt auswählen** → Alle Projektdaten werden automatisch geladen
2. **Immobilien wählen** → Checkbox-Liste aller erfassten Objekte
3. **Kalkulation prüfen** → Automatische Preisberechnung nach Fläche
4. **Rabatt festlegen** → Kennenlernangebot, Frühbucher, Treuerabatt
5. **PDF generieren** → CI-konformes Angebot mit einem Klick

---

## 4. Loom-Feedback (was ich verstanden habe)

### Strukturelle Änderungen
- Kundendaten-Step entfernen (kommt aus Projektzuordnung)
- Immobilien-Step entfernen (kommt aus Objektaufnahme)
- Kalkulation + Konditionen zusammenführen

### Datenfluss
- Unternehmen → Kontakt → Projekt → Immobilien (automatisch laden)
- Gesamtfläche aus ausgewählten Immobilien berechnen

### Objektaufnahme-Änderungen
- Seitenbezeichnungen: Frontseite, Rückseite, Linker/Rechter Giebel
- "Reinigungsfähig" statt "Zu reinigen"
- Vereinfachte Zuwegung (Ja/Nein)

---

## 5. Offene Fragen für das Interview

### Zum Gesamtprozess
1. Habe ich den Workflow richtig verstanden?
2. Wann genau wird die Objektaufnahme durchgeführt? Vor dem Angebot?
3. Kann ein Angebot mehrere Projekte umfassen oder immer nur ein Projekt?

### Zur Projektzuordnung
4. Wie ist die Hierarchie: Unternehmen → Kontakt → Projekt → Immobilien?
5. Kann eine Immobilie zu mehreren Projekten gehören?
6. Wer legt Projekte an - der Kundenberater vor Ort oder das Büro?

### Zur Objektaufnahme
7. Werden alle Immobilien-Daten VOR der Angebotserstellung erfasst?
8. Was passiert, wenn während der Objektaufnahme neue Informationen kommen?
9. Wie werden "Aufgaben in Verantwortung des Auftraggebers" erfasst?

### Zum Angebots-Wizard
10. Soll der Kundenberater im Wizard überhaupt noch Daten eingeben können?
11. Was ist, wenn Daten aus der Objektaufnahme fehlen oder falsch sind?
12. Wie funktioniert die Auswahl von Seiten pro Immobilie (alle oder einzelne)?

### Zum PDF-Angebot
13. Wie soll die Positionstabelle aussehen? (X.1-X.5 pro Immobilie?)
14. Was genau soll der "Störer" unterhalb der Gesamtsumme enthalten?
15. Welche Textbausteine sollen dynamisch auswählbar sein?

---

## 6. Meine Hypothesen (zu prüfen)

### Hypothese 1: Objektaufnahme ist Pflicht
Die Objektaufnahme MUSS vor der Angebotserstellung erfolgen. Ohne erfasste Immobilien kann kein Angebot erstellt werden.

### Hypothese 2: Keine Doppeleingabe
Im Angebots-Wizard werden KEINE Daten eingegeben, die bereits in der Objektaufnahme erfasst wurden. Der Wizard ist nur eine "Zusammenstellung".

### Hypothese 3: Projekt = Container
Ein Projekt ist der Container für Unternehmen, Kontakt und Immobilien. Das Angebot bezieht sich immer auf ein Projekt.

### Hypothese 4: Gesamtfläche bestimmt Preis
Die Preisstaffelung basiert auf der GESAMTFLÄCHE aller ausgewählten Immobilien, nicht auf einzelnen Immobilien.

### Hypothese 5: Automatische Übernahme
Sperrungen, Besonderheiten und "Aufgaben Auftraggeber" aus der Objektaufnahme werden automatisch ins Angebot übernommen.

---

## 7. Was ich noch nicht verstehe

1. **Datenmodell:** Wie genau hängen Unternehmen, Kontakte, Projekte und Immobilien zusammen?

2. **Workflow:** Wer macht was wann? (Kundenberater vor Ort vs. Büro)

3. **Bestandsdaten:** Woher kommen die Unternehmen und Kontakte? (HubSpot?)

4. **Änderungen:** Was passiert, wenn sich nach der Objektaufnahme etwas ändert?

5. **Positionen:** Wie werden die Positionen im Angebot strukturiert? (pro Immobilie oder gesamt?)
