# FaFi PM – Maßnahmen- und Umsetzungsplan (Offene Aufgaben)

**Stand:** 11. Februar 2026  
**Gesamtfortschritt:** 844 von 860 Aufgaben erledigt (**98,1 %**)  
**Verbleibend:** 16 offene Aufgaben in 2 Kategorien

---

## Zusammenfassung

Die FaFi PM Anwendung befindet sich in einem fortgeschrittenen Reifegrad. Von 860 erfassten Aufgaben sind 844 abgeschlossen. Die verbleibenden 16 offenen Aufgaben verteilen sich auf zwei klar abgrenzbare Maßnahmenpakete, die unterschiedliche Absichten verfolgen und voneinander unabhängig bearbeitet werden können.

| Maßnahme | Aufgaben | Absicht | Priorität |
|---|---|---|---|
| **M1: Finale Generalprobe mit Realdaten** | 13 (GP-E2E-01 bis GP-E2E-13) | Jeden Kernprozess mit echten Eingaben durchspielen, um Produktivtauglichkeit zu beweisen | **HOCH** – Qualitätssicherung vor Rollout |
| **M2: Echte Datenanbindung für verbleibende Mock-Seiten** | 3 (KA-34, KA-37, KA-38) | Seiten, die noch Demo-Daten zeigen, auf echte DB-Daten umstellen | **MITTEL** – Kann nach Veröffentlichung erfolgen |

---

## Maßnahme 1: Finale Generalprobe mit Realdaten-E2E-Tests

### Absicht

> Kein Mitarbeiter soll die App öffnen und auf einen Workflow stoßen, der im Ernstfall abbricht. Die Generalprobe soll jeden Kernprozess einmal mit realistischen Eingaben durchspielen – von der Unternehmensanlage bis zur Garantie – und dabei Brüche, Fehler und Inkonsistenzen identifizieren, bevor echte Nutzer die Anwendung verwenden.

### Kontext

Die bisherigen E2E-Tests (E2E-01 bis E2E-10, GP-01 bis GP-07) haben die Grundfunktionen visuell und über Vitest-Tests geprüft. Diese finale Generalprobe geht einen Schritt weiter: Sie simuliert einen **kompletten Geschäftsvorfall** mit realistischen Daten, um die End-to-End-Durchgängigkeit zu beweisen.

### Aufgaben und Vorgehen

Die 13 Aufgaben bilden einen sequenziellen Workflow ab. Jeder Schritt baut auf dem vorherigen auf.

| Nr. | Aufgabe | Beschreibung | Abhängigkeit |
|---|---|---|---|
| GP-E2E-01 | Unternehmen anlegen | Neues Unternehmen mit realistischen Stammdaten (Name, Adresse, Branche) über die Kontakte-Seite anlegen | – |
| GP-E2E-02 | Kontakt zuordnen | Ansprechpartner zum Unternehmen hinzufügen (Name, Telefon, E-Mail, Rolle) | GP-E2E-01 |
| GP-E2E-03 | Projekt erstellen | Neues Projekt anlegen, Unternehmen zuordnen, Phasenstatus prüfen | GP-E2E-01 |
| GP-E2E-04 | Immobilie hinzufügen | Immobilie zum Projekt hinzufügen (Adresse, Fläche, Fassadentyp, Gebäudeseiten) | GP-E2E-03 |
| GP-E2E-05 | Angebot erstellen | AngebotWizard durchlaufen: Unternehmen/Projekt vorausgewählt, Immobilien selektiert, Kalkulation mit Bibliothek-Preisen, PDF-Vorschau | GP-E2E-04 |
| GP-E2E-06 | Baustelle anlegen | BaustelleWizard: Projekt auswählen, Bauleiter und Team aus HR-DB zuweisen, Bautagebuch-Eintrag erstellen | GP-E2E-03 |
| GP-E2E-07 | Einsatzplanung | Zug erstellen, echte Mitarbeiter aus HR-DB zuweisen, Kalenderansicht prüfen | GP-E2E-06 |
| GP-E2E-08 | Aufgabe erstellen | Aufgabe im Vorbereitungsboard anlegen, Status-Update durchführen, Countdown prüfen | GP-E2E-03 |
| GP-E2E-09 | Rechnung + Mahnwesen | Rechnung erstellen, Fälligkeit setzen, Mahnstufen-Logik prüfen | GP-E2E-05 |
| GP-E2E-10 | Garantie + Kundenportal | Garantie anlegen, Kundenportal-Token generieren, Ampel-Status prüfen | GP-E2E-06 |
| GP-E2E-11 | Querschnitts-Tests | GlobalSearch mit echten Daten, Bibliothek-Einträge, Vorlagen, Archiv-Verknüpfungen | Alle vorherigen |
| GP-E2E-12 | Befunde beheben | Alle identifizierten Fehler dokumentieren und kritische sofort beheben | GP-E2E-11 |
| GP-E2E-13 | Generalprobe-Bericht | Abschlussbericht mit Befunden, Bewertung und Empfehlung (Go/No-Go) | GP-E2E-12 |

### Durchführung

Die Generalprobe sollte in zwei Durchläufen erfolgen:

**Durchlauf 1 – Automatisiert (Vitest):** Die Kernprozesse (Unternehmen → Projekt → Immobilie → Angebot → Baustelle) werden über tRPC-Prozeduren direkt getestet. Dies deckt die Datenintegrität und Backend-Logik ab.

**Durchlauf 2 – Visuell (Browser):** Dieselben Schritte werden manuell im Browser durchgespielt, um UI-Probleme, fehlende Validierungen und UX-Brüche zu identifizieren. Besonderer Fokus auf: Wizard-Durchgängigkeit, Datenübernahme zwischen Steps, korrekte Anzeige der Bibliothek-Preise, HR-Mitarbeiter in Einsatzplanung.

### Geschätzter Aufwand

Automatisierte Tests: ca. 4 Stunden. Visueller Durchlauf: ca. 3 Stunden. Befunde beheben: ca. 2–6 Stunden (abhängig von Befunden). Bericht: ca. 1 Stunde. **Gesamt: 10–14 Stunden.**

---

## Maßnahme 2: Echte Datenanbindung für verbleibende Mock-Seiten

### Absicht

> Drei Seiten zeigen noch Demo-Daten mit DemoBanner. Sie sind funktional nutzbar als Vorschau, aber nicht produktiv. Die Absicht ist, diese Seiten schrittweise auf echte DB-Daten umzustellen, damit sie im Arbeitsalltag einen echten Mehrwert bieten.

### Kontext

Diese Aufgaben wurden bewusst als "KANN NACH VERÖFFENTLICHUNG" eingestuft. Die betroffenen Seiten sind mit einem DemoBanner gekennzeichnet, sodass kein Nutzer die Demo-Daten für echt halten kann. Die Priorisierung richtet sich nach dem Nutzen für den täglichen Arbeitsablauf.

### Aufgaben im Detail

| Nr. | Aufgabe | Absicht | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| KA-34 | **Finanzen-Modul dynamisieren** | Die Geschäftsführung soll echte Umsätze, Außenstände und Cashflow-Daten sehen – nicht erfundene Zahlen. Umsätze aus Aufträgen/Rechnungen aggregieren, Außenstände aus offenen Rechnungen berechnen, Cashflow aus Zahlungseingängen ableiten. | ~8h | Rechnungen und Aufträge müssen in der DB vorhanden sein |
| KA-37 | **PDF-Entwürfe an Backend anbinden** | Die PDF-Entwürfe-Seite zeigt 8 Mock-Datensätze ohne jede Backend-Anbindung. Sie soll echte Angebots-PDFs, Rechnungs-PDFs und Bautagebuch-Exporte aus dem Archiv laden und als Vorschau anzeigen. | ~6h | Archiv-Verknüpfungen müssen korrekt sein (bereits durch ARCH-MIG erledigt) |
| KA-38 | **CustomerPortal dynamisieren** | Das Kundenportal zeigt ein fiktives Projekt "Sonnenhof". Es soll stattdessen die echten Projekte des eingeloggten Kunden anzeigen, mit Ampel-Status, Dokumenten-Download und Fortschrittsanzeige. | ~8h | Kundenportal-Token-Logik muss funktionieren (bereits implementiert) |

### Empfohlene Reihenfolge

1. **KA-34 (Finanzen)** zuerst – höchster Nutzen für die Geschäftsführung, da Finanzdaten täglich relevant sind
2. **KA-38 (CustomerPortal)** danach – externer Kundennutzen, stärkt das Vertrauen der Auftraggeber
3. **KA-37 (PDF-Entwürfe)** zuletzt – internes Werkzeug, DemoBanner ist akzeptabel

### Geschätzter Aufwand

**Gesamt: ca. 22 Stunden** (8h + 6h + 8h), verteilt auf 3–4 Arbeitstage.

---

## Gesamtübersicht

| Kennzahl | Wert |
|---|---|
| Aufgaben gesamt | 860 |
| Erledigt | 844 (98,1 %) |
| Offen | 16 (1,9 %) |
| davon Generalprobe (M1) | 13 |
| davon Datenanbindung (M2) | 3 |
| Geschätzter Restaufwand | 32–36 Stunden |

### Empfehlung

**Maßnahme 1 (Generalprobe)** sollte vor dem Rollout an echte Nutzer durchgeführt werden. Sie ist die letzte Qualitätssicherungsstufe und stellt sicher, dass der Kernworkflow durchgängig funktioniert.

**Maßnahme 2 (Datenanbindung)** kann nach dem initialen Rollout erfolgen. Die betroffenen Seiten sind klar als Vorschau gekennzeichnet und blockieren keinen Arbeitsablauf. Die schrittweise Umstellung ermöglicht es, Nutzerfeedback aus dem Produktivbetrieb in die Implementierung einfließen zu lassen.
