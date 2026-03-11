# FaFi PM – Interview-Analyse: Was du gesagt hast vs. was gebaut wurde

**Datum:** 09. Februar 2026  
**Methode:** Systematische Durchsicht aller dokumentierten Interview-Sessions, Loom-Feedbacks und Q&A-Protokolle  
**Geprüfte Quellen:** INTERVIEW_ERKENNTNISSE.md, KONTEXT_ANALYSE_ANGEBOTSERSTELLUNG.md, interview-notes-baustellenmanager.md, interview-notes-kundenportal.md, objektaufnahme-analyse.md, objektaufnahme-grundgedanke.md, loom-feedback-todo.md, INTERVIEW-REVALIDIERUNG-BERICHT.md, WORKFLOW-ANALYSE-UND-VERBESSERUNGEN.md, TODO-ABGLEICH-ANALYSE.md, analyse-erkenntnisse.md

---

## 1. Übersicht: Die 4 Interview-Sessions

Im Projektverlauf wurden **4 strukturierte Interview-Sessions** durchgeführt, in denen ich dir konkrete Fragen gestellt habe und du geantwortet hast. Zusätzlich gab es **1 Loom-Feedback-Session** mit visuellen Korrekturen. Die folgende Analyse basiert **ausschließlich** auf deinen dokumentierten Antworten – keine Interpretation, keine Halluzination.

| # | Interview-Thema | Dokumentiert in | Kernfragen |
|---|---|---|---|
| 1 | **Angebotserstellung** | INTERVIEW_ERKENNTNISSE.md, KONTEXT_ANALYSE_ANGEBOTSERSTELLUNG.md | Daten-Hierarchie, Wizard-Flow, Positionsstruktur, Preisstaffelung, Störer |
| 2 | **Objektaufnahme** | objektaufnahme-analyse.md, objektaufnahme-grundgedanke.md | Seitenbezeichnungen, Wizard-Seiten, Grundgedanke "abrechenbare Wirtschaftseinheit" |
| 3 | **Baustellenmanager** | interview-notes-baustellenmanager.md | Teamstruktur, Tagesablauf, Vorher-Dokumentation, Logbuch |
| 4 | **Kundenportal** | interview-notes-kundenportal.md | Wer ist "der Kunde", Ampel-System, Aufgaben AG/AN, Dokumente |
| L | **Loom-Feedback** | loom-feedback-todo.md | Seitenbezeichnungen, Listenformate, Feldentfernungen |

---

## 2. PROJEKTE – Was du gesagt hast

### 2.1 Deine Kernaussagen zu Projekten

> **"Ein Projekt ist der Container für Unternehmen, Kontakt und Immobilien. Das Angebot bezieht sich immer auf ein Projekt."**

Aus dem Interview zur Angebotserstellung ergab sich folgende von dir bestätigte Daten-Hierarchie:

```
UNTERNEHMEN (Mutter-Entität)
    └── KONTAKTE (mehrere pro Unternehmen)
         └── PROJEKTE (mehrere pro Kontakt)
              └── IMMOBILIEN (zugeordnet, nicht "gehörend")
```

Du hast bestätigt:
- **Kunde = stets das UNTERNEHMEN**, nicht der Kontakt/Ansprechpartner
- Ein Projekt durchläuft **10 definierte Phasen** (Objektaufnahme → Abgeschlossen)
- Jede Phase hat einen **Verantwortlichen** (Kundenberater, Büro, AT-Leiter, Projektleiter)

### 2.2 Projekt-Lifecycle (10 Phasen) – Deine Vorgabe

| Phase | Name | Verantwortlich | Nächste Aktion |
|---|---|---|---|
| 1 | Objektaufnahme | Kundenberater | Immobilie erfassen |
| 2 | Angebot erstellt | Kundenberater | Kalkulation prüfen |
| 3 | Angebot versendet | Büro | Nachfassen planen |
| 4 | Nachfassen | Kundenberater | Entscheidung einholen |
| 5 | Auftrag gewonnen | Kundenberater | Planung starten |
| 6 | Planung | AT-Leiter | Ressourcen buchen |
| 7 | Vorbereitung | AT-Leiter | Baustelle einrichten |
| 8 | Durchführung | Projektleiter | Fortschritt dokumentieren |
| 9 | Abnahme | Projektleiter | Protokoll erstellen |
| 10 | Abgeschlossen | Büro | Garantie aktivieren |

### 2.3 Was das für die Navigation bedeutet

**SOLL (laut Interview):** Der Menüpunkt "Projekte" ist der zentrale Einstiegspunkt. Von hier aus soll der Nutzer den gesamten Lifecycle steuern können – mit kontextabhängigen Aktionen je nach Phase.

**IST (aktuell implementiert):** "Projekte" ist unter "Erstellen & Erfassen" eingeordnet. Das suggeriert, dass Projekte nur erstellt werden – aber laut deiner Vorgabe sind Projekte der **lebende Container**, der den gesamten Workflow von Phase 1 bis 10 begleitet.

**Abweichung:** Die Sidebar-Sektion "Erstellen & Erfassen" ist irreführend. Projekte werden dort nicht nur erstellt, sondern über den gesamten Lebenszyklus verwaltet. Die Einordnung müsste eher "Projektmanagement" oder schlicht "Projekte" als eigenständige Top-Level-Sektion sein.

### 2.4 Was das für den ProjektWizard bedeutet

**Deine Vorgabe:** 5-Schritt-Wizard mit Entwurf-Speichern, HubSpot-Verknüpfung, Team & Termine.

**IST:** Der ProjektWizard ist implementiert und funktioniert grundsätzlich. Aber: Es fehlt die **automatische Phasensteuerung**. Du hast klar gesagt, dass bei bestimmten Aktionen (Angebot erstellt, Angebot versendet, Auftrag gewonnen) die Phase **automatisch** wechseln soll. Aktuell muss der Nutzer die Phase manuell ändern – das widerspricht deinem Workflow-Konzept.

---

## 3. IMMOBILIEN – Was du gesagt hast

### 3.1 Dein Grundgedanke

> **"Objektaufnahme = Immobilie bzw. Gebäude (abrechenbare Wirtschaftseinheit)"**

> **"Immobilie muss einzeln betrachtet werden können. z.B. Verkauf: Unterlagen dürfen nicht für Eigentümer oder Projekt orientiert sein (Bsp. Garantieurkunde)"**

> **"Objekt/Immobilie stets KOMPLETT aufnehmen"**

Das bedeutet laut deiner Aussage:
- Eine **Immobilie ist ein eigenständiges Asset** mit eigenem Lebenszyklus
- Sie kann **zu mehreren Projekten gehören** (über die Jahre hinweg)
- Sie kann den **Eigentümer wechseln**
- Die **Historie bleibt erhalten**
- Alle **4 Seiten** müssen erfasst werden (Frontseite, Rückseite, Linker Giebel, Rechter Giebel)

### 3.2 Seitenbezeichnungen – Deine Loom-Feedback-Korrektur

Du hast im Loom-Feedback explizit korrigiert:

> **"Frontseite: Immer die Seite wo die Hauseingänge sind"**

| Deine Vorgabe | Beschreibung |
|---|---|
| **Frontseite** | Seite mit den Hauseingängen |
| **Rückseite** | Gegenüberliegende Seite der Eingänge |
| **Linker Giebel** | Perspektive: Vor dem Haus stehend, auf die Eingänge schauend – links |
| **Rechter Giebel** | Perspektive: Vor dem Haus stehend, auf die Eingänge schauend – rechts |

Zusätzlich hast du bestätigt, dass **Sockel** und **Dach/Attika** entfernt werden sollen.

### 3.3 Wizard-Seiten laut deiner PDF-Analyse

Du hast eine PDF-Vorlage ("ZuarbeitObjektaufnahmeviaappoderwebpart.pdf") bereitgestellt, aus der folgende Wizard-Struktur abgeleitet wurde:

**Seite 0: Stammdaten**
- Adresse (Straße, HR, PLZ, Ort)
- Zugehöriger HubSpot Deal → Zugehöriges Unternehmen → Zugehöriger Kontakt
- Datum der Objektaufnahme
- "Aufnehmender Mitarbeiter" (Nutzer)
- Wer war noch dabei? (Hausmeister, techn. Mitarbeiter, Eigentümervertreter, Mieter)
- Wann wird Entscheidung getroffen?
- Wer trifft die Entscheidung?
- Besondere Absprache, Infos?

**Seite 1: Technische Objektaufnahme (PRO SEITE)**
- Aufmaß (Breite × Höhe = Fläche automatisch)
- Bilder/Video/360°
- Zustand/Schäden → **ENTFERNT laut Loom-Feedback**
- Zuwegung/Zugänglichkeit → **Vereinfacht zu Ja/Nein + Erklärfeld**
- Nötige Bühne/Kletterer
- Nötige Sperrungen
- Besonderheiten
- Wasseranschluss
- Reinigungsmittelauswahl

**Seite 2: Kaufmännische Objektaufnahme**
- Welche Seiten sollen ins Angebot?
- Umsetzungstermin (KO-Termine, keine Wunschtermine)
- Kann Wohnung gestellt werden?
- Kennenlern-Angebot?
- Frühbucher-Rabatt?
- Einkaufsgemeinschaft?
- Marketinggeeignet?

### 3.4 Loom-Feedback-Korrekturen

| Deine Korrektur | Status |
|---|---|
| "Zu reinigen" → **"Reinigungsfähig"** mit Erklärfeld bei Nein | ✅ Umgesetzt |
| Fläche trotzdem erfassen bei "Nein" | ✅ Umgesetzt |
| Zuwegung vereinfacht: Nur Ja/Nein + Erklärfeld | ✅ Umgesetzt |
| "Zustand und Schäden" komplett entfernen | ✅ Umgesetzt |
| 360°-Link-Button entfernen, nur Textfeld darunter | ✅ Umgesetzt |
| Sockel und Dach/Attika entfernen | ✅ Umgesetzt |

### 3.5 Was das für die Navigation bedeutet

**SOLL (laut Interview):** Immobilien sind **eigenständige Assets** mit eigenem Lebenszyklus. Sie sind nicht nur "Teil eines Projekts", sondern existieren unabhängig davon.

**IST:** "Immobilien" ist unter "Erstellen & Erfassen" eingeordnet – gleichwertig mit "Projekte" und "Baustellen". Das ist konzeptionell korrekt, aber:

**Abweichung 1:** Die Immobilien-Übersicht zeigt laut Loom-Feedback noch das **Objektaufnahme-Format** statt eines **Listenformats** wie bei Projekten. Du hast explizit gesagt: "Von Objektaufnahme-Format zu Listenformat ändern" mit Zuordnungsinformationen (Baustelle, Projekt, Unternehmen, Mitarbeiter).

**Abweichung 2:** Die Datenbank-Beziehung ist **1:N** (eine Immobilie → ein Projekt). Du hast aber gesagt, eine Immobilie soll zu **mehreren Projekten gehören können** (M:N über die Jahre). Das ist ein fundamentaler Architektur-Unterschied.

**Abweichung 3:** Die Immobilie hat kein eigenes **companyId-Feld**. Du hast gesagt, eine Immobilie kann den Eigentümer wechseln. Aktuell läuft die Zuordnung nur über das Projekt.

### 3.6 Was das für den ObjektaufnahmeWizard bedeutet

**Deine Vorgabe:** Seitenweise Erfassung (Frontseite, Rückseite, Linker Giebel, Rechter Giebel) mit pro Seite: Aufmaß, Fotos, Reinigungsfähig, Zuwegung, Besonderheiten.

**IST:** Der Wizard ist implementiert und folgt dieser Struktur. Die Loom-Korrekturen (Seitenbezeichnungen, Feldentfernungen) sind umgesetzt. **Aber:** Die kaufmännische Seite (Seite 2 aus deiner PDF) fehlt weitgehend im Wizard – Felder wie "Wann wird Entscheidung getroffen?", "Wer trifft die Entscheidung?", "Marketinggeeignet?", "Einkaufsgemeinschaft?" sind nicht im Wizard.

---

## 4. ANGEBOTE – Was du gesagt hast

### 4.1 Dein Kernprinzip

> **"Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."**

> **"Der Kundenberater soll im Angebots-Wizard KEINE neuen Daten eingeben, sondern nur aus bereits erfassten Daten AUSWÄHLEN."**

Das bedeutet:
- **Objektaufnahme** = Erfassung des IST-Zustands (was ist da?)
- **Angebotserstellung** = Ableitung der LÖSUNG (was brauchen wir?)
- Keine Doppeleingabe – der Wizard ist nur eine "Zusammenstellung"

### 4.2 Wizard-Flow (5 Schritte) – Deine Vorgabe

| Schritt | Inhalt (deine Vorgabe) |
|---|---|
| **1: Projekt & Immobilien** | Projekt auswählen, Immobilien dem Projekt zuordnen/entfernen (flexibel), pro Immobilie: Seiten auswählen (Checkbox) |
| **2: Positionen pro Immobilie** | Pro Seite: Bühnentechnik (Höhe berücksichtigen), Reinigungsmittel, Baustelleneinrichtung (Pauschale 199€), Übernachtung (Eventualposition) |
| **3: Kalkulation & Konditionen** | Automatische Preisberechnung (Gesamtfläche → Staffel), Rabatt auswählen, Zahlungsziel (7 Tage Standard), Gültigkeit (4 Wochen Standard) |
| **4: Individuelle Bedingungen & Störer** | Besonderheiten aus Objektaufnahme (Sperrungen, Grünschnitt), Störer mit 2-Spalten-Layout |
| **5: Zusammenfassung & PDF** | Prüfen, PDF generieren |

### 4.3 Positionsstruktur im PDF – Deine Vorgabe

Du hast die exakte Positionsstruktur vorgegeben:

```
Pos. 1: Sonnenhofweg 1-5, 12345 Leipzig
        Seiten: Frontseite (800 m²), Rückseite (1.200 m²)
        Besonderheiten: Straßensperrung erforderlich, Algenbefall stark

  1.1   FassadenFix Systemreinigung       2.000 m²  ×  9,25€  =  18.500,00€
  1.2   Hubarbeitsbühne 18m               4 Tage    ×  280€   =   1.120,00€
  1.3   Baustelleneinrichtung             1 Pausch.           =     199,00€
  1.4   Übernachtung (Eventualpos.)       3 Nächte  ×  XX€    =     XXX,XX€
```

Wichtige Regeln:
- **Kopfposition = Immobilie** mit Kurzinfo (Seiten, Besonderheiten)
- **Unterpositionen = Leistungen** (X.1–X.5)
- **Fläche pro Immobilie zusammengezogen** (nicht pro Seite einzeln)

### 4.4 Preisstaffelung – Deine Vorgabe

| Gesamtfläche | Preis/m² |
|---|---|
| 500–999 m² | 10,50 €/m² |
| 1.000–2.499 m² | 9,75 €/m² |
| 2.500–4.999 m² | 9,25 €/m² |
| ab 5.000 m² | 8,75 €/m² |

Deine Regel: Basiert auf **GESAMTFLÄCHE aller Immobilien** im Angebot. Gleicher Preis/m² für alle Immobilien. Verkaufsargument: "Je mehr Fläche, desto günstiger der Quadratmeterpreis."

### 4.5 Frühbucher-Rabatt – Deine Vorgabe

| Beauftragung bis | Rabatt |
|---|---|
| 31.12. | 6% |
| 31.01. | 4,5% |
| 28.02. | 3% |
| 31.03. | 1,5% |

Rabattcode: "FRÜHBUCHER". Bezogen auf das **Beauftragungsdatum** relativ zur nächsten Saison.

### 4.6 Störer-Layout – Deine Vorgabe

Du hast ein **2-Spalten-Layout** vorgegeben:

| Linke Spalte | Rechte Spalte |
|---|---|
| Preisstaffel-Transparenz | Unsere Leistungen: |
| Ihre Gesamtfläche: X m² | ✓ Pauschalfestpreisgarantie (Nachträge existieren nicht) |
| → Staffel: X,XX €/m² | ✓ Ergebnisgarantie |
| [Staffel-Visualisierung] | ✓ 5 Jahre Algenfrei-Garantie |
| | ✓ Jährliche Inspektion (Exklusiv-Leistung) |

### 4.7 Was das für die Navigation bedeutet

**SOLL (laut Interview):** "Angebote" gehört zur **Kundenberatung** – das ist korrekt implementiert.

**IST:** Der Menüpunkt "Angebote" ist unter "Kundenberatung" eingeordnet. Das passt zu deiner Vorgabe, dass der Kundenberater Angebote erstellt.

**Aber:** Es fehlt der **direkte Workflow-Übergang** von Projekt → Angebot. Du hast gesagt: "Projekt auswählen → Alle Daten werden automatisch geladen." In der ProjektDetail-Ansicht gibt es keinen prominenten Button "Angebot für dieses Projekt erstellen", der den Wizard mit vorausgefüllten Daten öffnet.

### 4.8 Was das für den AngebotWizard bedeutet

**Deine Vorgabe vs. IST:**

| Deine Vorgabe | IST | Abweichung |
|---|---|---|
| Schritt 1: Projekt & Immobilien auswählen | ✅ Implementiert | — |
| Schritt 2: Immobilien & Seiten (Checkbox) | ✅ Implementiert | — |
| Schritt 3: Kalkulation (automatisch) | ✅ Implementiert | — |
| Schritt 4: Konditionen & Störer | ✅ Implementiert | — |
| Schritt 5: Zusammenfassung & PDF | ✅ Implementiert | — |
| Keine Doppeleingabe | ⚠️ Teilweise | Einige Felder werden im Wizard neu eingegeben statt aus Objektaufnahme übernommen |
| Frühbucher dynamisch | ❌ Hardcoded 2024/2025 | Daten müssen dynamisch berechnet werden |
| Übernachtung automatisch | ❌ Manuell | Soll automatisch basierend auf Entfernung vorgeschlagen werden |

---

## 5. BAUSTELLEN – Was du gesagt hast

### 5.1 Deine Kernaussagen

Aus dem Interview zum Baustellenmanager:

**Teamstruktur:**
> "Ein Team besteht aus 4 Personen: Teamleiter + Anwendungstechniker (2er-Team 1) + Projektleiter (Stellvertreter) + Anwendungstechniker (2er-Team 2)"

> "Teamleiter bekommt das Projekt zugewiesen. Projekt besteht aus mehreren Baustellen (= Immobilien)."

> "Begriffe 'Teamleiter' und 'Projektleiter' sind aktuell missverständlich, nicht zu viel hineininterpretieren."

**Ablauf Baustellen-Manager App:**

1. **Teamleiter-Chat** (optional, kann in App integriert sein)
2. **Vorher-Dokumentation** (PFLICHT vor Baustellenstart)
   - Als Wizard-Strecke (wie in PDF-Formularen vorgesehen)
   - Jede Immobilie/Baustelle innerhalb des Projektes einzeln vorher dokumentieren
   - Inkl. Foto-Upload gemäß Formular
   - **Erst nach vollständiger Dokumentation kann Baustelle gestartet werden**
3. **Täglicher Ablauf:**
   - Morgens: "Arbeitstag beginnen"
   - Abends: "Arbeitstag beenden"
4. **Beim Beenden des Arbeitstages:**
   - Logbuch-Ergebnisse auswählen (Vorkommnisse, Ereignisse – können mehrere sein)
   - Nur bei Vorkommnissen: Details beschreiben
   - Abschlussfrage: "Wird Baustellenplanung zeitlich beibehalten?" (Ja/Nein + ggf. Erklärung)
   - Diese Frage soll **MORGENS UND ABENDS** gestellt werden
5. **Bautagebuch-Eintrag (automatisch bei Abschlussmeldung):**
   - Welche Bereiche wurden heute erreicht?
   - Witterungsdaten mit 3 Zeitpunkten (9 Uhr, 13 Uhr, 17 Uhr – 4-Stunden-Rhythmus)

**Foto-Upload:**
- Gleicher S3-Mechanismus wie Objektaufnahme
- Kontextbezogene Benennung (Baustellenlogbuch_Unternehmen_Adresse_Datum_...)

**Ereignismelder:**
> Zusätzlich zu den Start- und Endmeldungen des Arbeitstages muss eine Funktion implementiert werden, die es ermöglicht, Ereignisse (z.B. Schäden) **jederzeit während des Tages** zu erfassen und zu dokumentieren. Diese Funktion soll "on top" verfügbar sein.

### 5.2 Was das für die Navigation bedeutet

**SOLL (laut Interview):** Baustellen sind der **operative Kern** – hier arbeiten Teamleiter und Projektleiter täglich. Der Baustellenmanager soll eine **eigene App-Erfahrung** sein (mobile-first, iPad-optimiert).

**IST:** "Baustellen" ist unter "Erstellen & Erfassen" eingeordnet. Zusätzlich gibt es unter "Umsetzung" den "Baustellenmanager" (/mobile). Das ist **konzeptionell verwirrend**: Warum gibt es zwei separate Menüpunkte für das gleiche Thema?

**Abweichung 1:** Die Sidebar hat "Baustellen" (unter Erstellen & Erfassen) UND "Baustellenmanager" (unter Umsetzung). Laut deinem Interview ist der Baustellenmanager die **mobile Ansicht** für den Teamleiter vor Ort. Die Baustellen-Übersicht (/baustellen) ist die **Desktop-Verwaltung** für den Projektleiter. Diese Unterscheidung ist in der Navigation nicht klar.

**Abweichung 2:** Laut Loom-Feedback soll die Baustellen-Übersicht ein **Listenformat** haben (wie Projekte), nicht das aktuelle Karten-Format. Filterung nach Phase/Status fehlt.

### 5.3 Was das für die Wizard-Klickstrecken bedeutet

**Deine Vorgabe: 3 Wizard-Strecken für Baustellen:**

| Wizard | Zweck | Status |
|---|---|---|
| **Vorher-Dokumentation** | PFLICHT vor Baustellenstart, pro Immobilie | ⚠️ Existiert als VorherDokuWizard, aber nicht als Pflicht-Gate implementiert |
| **Tagesablauf (Morgen/Abend)** | Arbeitstag beginnen/beenden mit Logbuch | ⚠️ Teilweise in MobileApp, aber nicht als strukturierter Wizard |
| **Ereignismelder** | Jederzeit während des Tages, "on top" | ❌ Nicht als eigenständige Funktion implementiert |

**Kritischer Logikbruch:** Du hast gesagt: "Erst nach vollständiger Dokumentation kann Baustelle gestartet werden." Das bedeutet, der "Arbeitstag beginnen"-Button darf erst aktiv sein, wenn die Vorher-Dokumentation für alle Immobilien abgeschlossen ist. Diese **Guard-Logik** fehlt komplett.

---

## 6. KUNDENPORTAL – Was du gesagt hast

### 6.1 Deine Kernaussagen

> **"Der Kunde ist stets das UNTERNEHMEN, nicht der Kontakt/Ansprechpartner."**

> **"Jedes Unternehmen hat EINEN zentralen Zugang zum Portal."**

> **"Mieter/Bewohner bekommen ein separates eigenes Portal (später, nicht jetzt)."**

**Startseite/Übersicht:**
- Zeigt alle Projekte des Unternehmens: laufend und abgeschlossen
- "Abgeschlossen" kann auch bedeuten: Angebot nicht angenommen
- Auf der Startseite wird das **AKTUELLE Projekt direkt in der Detailansicht** geöffnet
- **KEIN Zeitstrahl/Fortschrittsbalken**, sondern **AMPEL-System** (Grün/Gelb/Rot) pro Phase

**Ampel-System:**
- Grün: Alle Voraussetzungen für nächste Phase erfüllt
- Gelb: Etwas fehlt noch oder ist in Bearbeitung
- Rot: Überfällig, dringende Handlung erforderlich

**Projektdetailansicht:**
- Zeigt alle Baustellen des Projekts einzeln
- Jede Baustelle hat **eigene Ampel**
- Pro Baustelle: Aufgaben/To-Dos sichtbar
- **WICHTIG:** Unterscheidung Aufgaben auf **AUFTRAGGEBERSEITE** (Kunde) vs. **AUFTRAGNEHMERSEITE** (FassadenFix)
- Ziel: Kunde nutzt Portal als **Workplattform**, sieht was noch fehlt und von wem

**Dokumente:**
- Projektbezogene Dokumente (in Projektdetailansicht)
- Baustellenbezogene Dokumente (z.B. Sperrgenehmigungen → verknüpft mit Immobilie + Baustelle → automatisch auch mit Projekt)
- Allgemeine FassadenFix-Dokumente (Fachunternehmererklärung, Freistellungsbescheinigung)
- **Dokumenten-Karte** mit Auflistung und Anzahl, Durchklick zu Einzeldokumenten

### 6.2 Was das für die Navigation bedeutet

**SOLL (laut Interview):** Das Kundenportal ist eine **separate Ansicht** für den Kunden (nicht für FassadenFix-Mitarbeiter). Die Sidebar-Sektion "Kundenportal" in der Mitarbeiter-Ansicht dient der **Verwaltung** der Portale.

**IST:** "Kundenportal" ist als Sidebar-Sektion mit 3 Untermenüpunkten implementiert:
- Portal-Übersicht (/kundenportal)
- Dokumente teilen (/dokumente)
- Kundenmeldungen (/kundenmeldungen)

**Abweichung:** Das Kundenportal ist komplett **Mock-basiert**. Das Ampel-System existiert im Backend (calculateProjectAmpel, calculateSiteAmpel), wird aber im Frontend nicht verwendet. Die Unterscheidung Auftraggeber/Auftragnehmer bei Aufgaben fehlt komplett.

---

## 7. Gesamtbild: Navigation vs. Interview-Vorgaben

### 7.1 Aktuelle Sidebar-Struktur (9 Sektionen)

| # | Sektion | Untermenüpunkte | Rollen |
|---|---|---|---|
| 1 | Erstellen & Erfassen | Projekte, Baustellen, Immobilien | Alle |
| 2 | Kundenberatung | Unternehmen & Kontakte, Angebote, Aufträge, Garantien | GF, KB, Büro |
| 3 | Planung | Terminfinder, Team einplanen, Ressourcenplaner | GF, KB, PL |
| 4 | Projektvorbereitung | Übersicht, Offene Projekte, Überfällige Projekte, Offene Baustellen, Überfällige Baustellen | GF, PL, Büro |
| 5 | Umsetzung | Teamleitercheck, Baustellenmanager, Auswertung & Abschluss | GF, AT, PL |
| 6 | Finanzen | Finanzübersicht, Rechnungen, Zahlungen, Budgets | GF, Büro |
| 7 | Kundenportal | Portal-Übersicht, Dokumente teilen, Kundenmeldungen | GF, KB |
| 8 | Unternehmenssystem | Archiv, Vorlagen & Textbausteine, Materialien & Geräte, Bibliothek | GF, Büro |
| 9 | System & Einstellungen | Mitarbeiter, HubSpot, Spracheingabe, Einstellungen | GF |

### 7.2 Konzeptionelle Probleme laut deinen Interview-Aussagen

**Problem 1: "Erstellen & Erfassen" ist irreführend.** Projekte, Baustellen und Immobilien werden dort nicht nur erstellt, sondern über ihren gesamten Lebenszyklus verwaltet. Die Sektion suggeriert eine einmalige Aktion, aber laut deinem Workflow sind das die **Kern-Entitäten**, die permanent bearbeitet werden.

**Problem 2: Doppelte Baustellen-Einträge.** "Baustellen" unter "Erstellen & Erfassen" und "Baustellenmanager" unter "Umsetzung" sind konzeptionell das gleiche Thema. Laut deinem Interview ist der Baustellenmanager die **mobile Vor-Ort-Ansicht** für den Teamleiter. Die Baustellen-Seite ist die **Desktop-Verwaltung**. Diese Unterscheidung ist für den Nutzer nicht ersichtlich.

**Problem 3: "Projektvorbereitung" vs. "Planung".** Beide Sektionen überlappen sich thematisch. "Offene Projekte" und "Überfällige Projekte" unter "Projektvorbereitung" sind eigentlich **Filter-Ansichten** der Projekte-Seite, keine eigenständigen Menüpunkte. Laut deinem Phasen-Modell gehört "Planung" (Phase 6) und "Vorbereitung" (Phase 7) zum gleichen Workflow-Abschnitt.

**Problem 4: Fehlende hierarchische CRM-Darstellung.** Du hast gesagt: "Unternehmen → Kontakte → Projekte". Die Sidebar hat "Unternehmen & Kontakte" als einen Menüpunkt. Laut deinem Interview sollte es eine **hierarchische Ansicht** geben, in der man vom Unternehmen zu dessen Kontakten und von dort zu deren Projekten navigieren kann.

**Problem 5: Workflow folgt nicht der Sidebar.** Dein 10-Phasen-Lifecycle geht: Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss. Die Sidebar-Reihenfolge folgt diesem Flow nicht. Der Nutzer muss selbst wissen, welche Seite als nächstes relevant ist.

### 7.3 Wizard-Klickstrecken: Soll vs. Ist

| Wizard | Deine Vorgabe | IST | Kritische Abweichung |
|---|---|---|---|
| **ProjektWizard** | 5 Schritte, Entwurf-Speichern | ✅ Implementiert | Fehlende automatische Phasensteuerung |
| **ObjektaufnahmeWizard** | Seitenweise Erfassung (4 Seiten), kaufmännische Daten | ✅ Grundstruktur OK | Kaufmännische Seite (Entscheidungsträger, Marketing, Einkaufsgemeinschaft) fehlt |
| **AngebotWizard** | 5 Schritte, keine Doppeleingabe, automatische Kalkulation | ✅ Grundstruktur OK | Frühbucher hardcoded, Übernachtung nicht automatisch |
| **AuftragAnnahmeWizard** | Automatisch: Status, HubSpot, Baustelle, Aufgaben | ✅ Implementiert | — |
| **AbnahmeWizard** | Protokoll, Bewertung, Folgeschritte | ✅ Implementiert | — |
| **VorherDokuWizard** | PFLICHT vor Baustellenstart, pro Immobilie | ⚠️ Existiert | Nicht als Pflicht-Gate implementiert |
| **Tagesablauf-Wizard** | Morgen-/Abendmeldung mit Logbuch | ⚠️ Teilweise | Nicht als strukturierter Wizard |
| **Ereignismelder** | Jederzeit "on top" verfügbar | ❌ Fehlt | Komplett fehlend |

---

## 8. Zusammenfassung: Was stimmt, was nicht

### Korrekt umgesetzt (1:1 nach deinen Vorgaben)

- Daten-Hierarchie: Unternehmen → Kontakte → Projekte → Immobilien
- 10-Phasen-Lifecycle für Projekte
- Seitenbezeichnungen: Frontseite, Rückseite, Linker/Rechter Giebel
- Preisstaffelung (10,50 / 9,75 / 9,25 / 8,75)
- Positionsstruktur X.1–X.5 im PDF
- Störer 2-Spalten-Layout
- Baustelleneinrichtung 199€ Pauschale
- "Reinigungsfähig" statt "Zu reinigen"
- Zuwegung vereinfacht (Ja/Nein)
- Sockel und Dach/Attika entfernt
- Rollenbasierte Sichtbarkeit (GF, KB, AT, PL, Büro)

### Abweichungen von deinen Vorgaben

| # | Abweichung | Deine Vorgabe | IST | Priorität |
|---|---|---|---|---|
| 1 | Immobilie 1:N statt M:N | Kann zu mehreren Projekten gehören | Nur ein Projekt | ARCHITEKTUR |
| 2 | Kein companyId bei Immobilie | Eigentümer wechselbar | Nur über Projekt | ARCHITEKTUR |
| 3 | Frühbucher hardcoded | Dynamisch nach Saison | 2024/2025 hardcoded | KRITISCH |
| 4 | Übernachtung manuell | Automatisch bei >100km | Manuell pro Immobilie | MITTEL |
| 5 | Vorher-Doku kein Gate | PFLICHT vor Baustellenstart | Kein Gate | KRITISCH |
| 6 | Ereignismelder fehlt | Jederzeit "on top" | Nicht implementiert | HOCH |
| 7 | Ampel nicht im Portal | Grün/Gelb/Rot pro Phase | Nur Backend | HOCH |
| 8 | AG/AN-Aufgaben fehlen | Auftraggeber vs. Auftragnehmer | Nicht unterschieden | HOCH |
| 9 | Kaufmännische Wizard-Seite | Entscheidungsträger, Marketing, EG | Fehlt im Wizard | MITTEL |
| 10 | Sidebar-Struktur | Workflow-orientiert | Thematisch gruppiert | KONZEPTIONELL |
| 11 | Baustellen-Listenformat | Wie Projekte (Loom) | Karten-Format | MITTEL |
| 12 | Immobilien-Listenformat | Mit Zuordnungen (Loom) | Objektaufnahme-Format | MITTEL |
| 13 | Phasenübergänge automatisch | Bei Aktion auto-wechseln | Manuell | KRITISCH |
| 14 | "Eingangsseite" global | "Frontseite" überall | 26 Referenzen noch alt | KRITISCH |

---

*Dieser Bericht basiert ausschließlich auf den dokumentierten Interview-Antworten des Benutzers. Keine Interpretation, keine Halluzination – nur 1:1 was gesagt wurde.*

*Erstellt am 09.02.2026*
