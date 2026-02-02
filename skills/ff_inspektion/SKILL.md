---
name: ff-inspektion
description: Erstellt und verarbeitet Ff Inspektion. Verwenden für: digitale Inspektionsprotokolle, Zustandserfassung mit Bewertungsskala, Fotodokumentation von Schäden und Erstellung von Inspektionsberichten.
---

# Skill: FassadenFix Jährliche Inspektion

Dieser Skill digitalisiert die jährliche Inspektion von Fassaden zur Kontrolle der "5 Jahre algenfrei"-Garantie.

## Workflow

Der Skill führt einen Prüfer durch den standardisierten Inspektionsprozess und generiert ein digitales Protokoll.

1.  **Projektdaten laden:** Der Skill lädt die ursprünglichen Projektdaten (Auftraggeber, Anschrift, Umsetzungsdatum) anhand der Projektnummer.
2.  **Zustand bewerten:** Der Zustand der Fassade wird auf einer Skala von 0 (neuwertig) bis 4 (starker Neubefall) bewertet.
3.  **Nacharbeiten definieren:** Festlegung, ob und welche Bereiche (Eingangsseite, Rückseite, Giebel) kostenfreie Nacharbeiten erfordern.
4.  **Schäden und Gefahren erfassen:** Dokumentation von spezifischen Schäden (Löcher, Risse, Graffiti) und weiteren Gefahren (Vogelnester, Bewuchs, etc.) mit Fotomöglichkeit.
5.  **Empfehlungen geben:** Formulierung von Maßnahmen, um einen Neubefall weiter hinauszuzögern.
6.  **Protokoll generieren:** Erstellung eines digitalen Inspektionsprotokolls im PDF-Format, inklusive digitaler Unterschriften von Prüfer und Empfänger.

## Verwendung

-   **Als mobile App für Prüfer:** Eine Tablet-Anwendung, die den Prüfer vor Ort durch die Inspektion leitet.
-   **Als Teil eines Agents:** Der `ff-projekt-manager`-Agent kann diesen Skill jährlich automatisch aufrufen und einen Prüfer mit der Durchführung beauftragen.

## Kernfunktionalität

-   **Geführter Inspektionsprozess:** Schritt-für-Schritt-Anleitung für den Prüfer.
-   **Bewertungsskala:** Visuelle Skala zur einfachen und schnellen Zustandserfassung.
-   **Checklisten für Schäden/Gefahren:** Schnelle Auswahl vordefinierter Punkte.
-   **Fotodokumentation:** Direkte Zuordnung von Fotos zu spezifischen Schäden.
-   **Digitale Unterschriften:** Rechtssichere Abnahme des Protokolls.
-   **PDF-Generierung:** Automatisierte Erstellung des finalen Inspektionsberichts.

## Referenzen

-   **Original-Vorlage:** `/home/ubuntu/vorlagen_fassadenfix_strukturiert/01_projekt_dokumentation/inspektion/FF-INS-001_Inspektionsprotokoll.pdf`
-   **Daten-Struktur (Beispiel):**

```json
{
  "projekt": {
    "projektnummer": "FF-2025-123",
    "auftraggeber": "Wohnbau GmbH",
    "anschrift": "Sonnenallee 10, 80331 München",
    "umsetzungsdatum": "2025-05-10"
  },
  "inspektion": {
    "datum": "2026-05-12",
    "zustand_fassade": 2,
    "nacharbeiten_kostenfrei": {
      "notwendig": true,
      "bereiche": ["Eingangsseite", "Giebel links"]
    }
  },
  "schaeden": {
    "vorhanden": true,
    "arten": ["Löcher"],
    "beschreibung": "Einzelne Spechtlöcher an der Westfassade."
  },
  "gefahren": {
    "vorhanden": true,
    "arten": ["Wachstum von Bäumen, Hecken und Rankpflanzen"],
    "beschreibung": "Efeu nähert sich dem Sockelbereich."
  },
  "empfehlungen": "Regelmäßiger Rückschnitt des Efeus wird empfohlen, um Kontakt mit der Fassade zu vermeiden.",
  "unterschriften": {
    "empfaenger": {
      "name": "Herr Schmidt",
      "funktion": "Hausverwaltung",
      "signatur": "..."
    },
    "pruefer": {
      "name": "Max Mustermann",
      "funktion": "FassadenFix Prüfer",
      "signatur": "..."
    }
  }
}
```
}
```
