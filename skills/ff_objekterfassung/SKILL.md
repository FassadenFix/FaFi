---
name: ff-objekterfassung
description: Erstellt und verarbeitet Ff Objekterfassung. Verwenden für: Erfassung von Objektdaten, Zustandsdokumentation vor Ort, Foto-Uploads, automatische Flächenberechnung und PDF-Generierung.
---

# Skill: FassadenFix Objekterfassung

Dieser Skill digitalisiert den Prozess der Objekterfassung für Fassadenprojekte und ersetzt die manuelle Dateneingabe über PDF-Formulare.

## Workflow

Der Skill führt den Anwender durch einen schrittweisen Prozess, um alle relevanten Objektdaten digital zu erfassen. Das Ergebnis ist ein strukturiertes Datenobjekt und ein automatisch generiertes PDF-Dokument.

1.  **Projektdaten abfragen:** Der Skill fragt nach grundlegenden Projektdaten wie Anschrift, Art der Immobilie und Putzart.
2.  **Schäden dokumentieren:** Erfassung von vorhandenen Schäden und Besonderheiten.
3.  **Massen ermitteln:** Eingabe der gemessenen Werte zur Flächenberechnung.
4.  **Fotos hinzufügen:** Möglichkeit zum Upload von Fotos zur visuellen Dokumentation.
5.  **Checkliste abarbeiten:** Abarbeiten einer kurzen Checkliste (z.B. 360-Grad-Rundgang).
6.  **PDF generieren:** Aus den erfassten Daten wird ein PDF-Dokument generiert, das dem ursprünglichen Formular `FF-OBJ-001_Objektdatenblatt.pdf` entspricht.

## Verwendung

Dieser Skill kann auf verschiedene Weisen genutzt werden:

-   **Als interaktive Web-Anwendung:** Ein einfacher Web-Client, der die Schritte des Workflows als Formular abbildet.
-   **Als CLI-Tool:** Ein Kommandozeilen-Skript, das den Benutzer durch die einzelnen Abfragen führt.
-   **Als Teil eines Agents:** Der `ff-projekt-manager`-Agent kann diesen Skill aufrufen, um die Objekterfassung als ersten Schritt in einem neuen Projekt zu starten.

## Kernfunktionalität

-   **Formular-basierte Dateneingabe:** Strukturierte Erfassung aller relevanten Felder.
-   **Foto-Upload:** Integration für die visuelle Dokumentation.
-   **Automatische Flächenberechnung:** Optionale Berechnung der Gesamtfläche aus den gemessenen Werten.
-   **PDF-Generierung:** Erstellung eines standardisierten PDF-Protokolls.

## Referenzen

-   **Original-Vorlage:** `/home/ubuntu/vorlagen_fassadenfix_strukturiert/01_projekt_dokumentation/objektaufnahme/FF-OBJ-001_Objektdatenblatt.pdf`
-   **Daten-Struktur (Beispiel):**

```json
{
  "projekt": {
    "anschrift": "Musterstraße 1, 12345 Musterstadt",
    "art_immobilie": "Mehrfamilienhaus",
    "putzart": "Silikatputz",
    "datum": "2026-02-02"
  },
  "zustand": {
    "vorhandene_schaeden": "- Risse an der Nordseite\n- Abplatzungen am Sockel",
    "notizen": "Spechtlöcher an der Westfassade vorhanden."
  },
  "masse": {
    "gemessene_werte": "Nord: 10x15m; Süd: 10x15m; West: 8x15m; Ost: 8x15m",
    "gesamtflaeche_qm": 540,
    "zu_reinigende_flaeche_qm": 500
  },
  "checklist": {
    "360_grad_rundgang": true,
    "gruenverschnitt_notwendig": false,
    "strassensperrung_notwendig": "ja, für 2 Tage"
  },
  "durchgefuehrt_durch": "Max Mustermann"
}
```
