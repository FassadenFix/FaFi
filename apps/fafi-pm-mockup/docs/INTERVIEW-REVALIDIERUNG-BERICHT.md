# FaFi PM – Interview-Revalidierung & Soll/Ist-Vergleich

**Datum:** 09. Februar 2026  
**Methode:** Systematische Durchsicht aller Interview-Dokumente (4 Interviews), Loom-Feedback, MVP-Spezifikation und Opus-Validierung  
**Geprüfte Dokumente:** INTERVIEW_ERKENNTNISSE.md, KONTEXT_ANALYSE_ANGEBOTSERSTELLUNG.md, interview-notes-baustellenmanager.md, interview-notes-kundenportal.md, objektaufnahme-analyse.md, objektaufnahme-grundgedanke.md, FASSADENFIX_PREISE_OFFIZIELL.md, loom-feedback-todo.md, MVP-SPEZIFIKATION-v2.md, analyse-erkenntnisse.md, WORKFLOW-ANALYSE-UND-VERBESSERUNGEN.md

---

## 1. IMMOBILIENERFASSUNG (Objektaufnahme)

### 1.1 Seitenbezeichnungen

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| **Frontseite** (Seite mit Hauseingängen) | **Eingangsseite** | **ABWEICHUNG** | Label muss auf "Frontseite" geändert werden |
| Rückseite (gegenüber den Eingängen) | Rückseite | OK | — |
| Linker Giebel (links vor dem Haus stehend) | Linker Giebel | OK | — |
| Rechter Giebel (rechts vor dem Haus stehend) | Rechter Giebel | OK | — |
| Sockel und Dach/Attika ENTFERNT | Entfernt | OK | — |

> **Interview-Zitat (Loom-Feedback):** "Frontseite: Immer die Seite wo die Hauseingänge sind"

**Abweichung A1:** Die Bezeichnung "Eingangsseite" muss auf "Frontseite" geändert werden. Das Interview und die Loom-Feedback-Notizen verwenden durchgängig "Frontseite".

### 1.2 Reinigungsfähig statt "Zu reinigen"

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| "Reinigungsfähig" statt "Zu reinigen" | "Reinigungsfähig?" mit Erklärfeld bei Nein | OK |
| Fläche trotzdem erfassen bei "Nein" | Fläche wird erfasst | OK |

### 1.3 Zuwegung vereinfacht

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Nur Ja/Nein: "Problematische Zuwegung?" | "Gibt es eine problematische Zuwegung?" Ja/Nein | OK |
| Bei "Ja" Erklärfeld öffnen | Erklärfeld vorhanden | OK |

### 1.4 Zustand und Schäden entfernt

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Kompletten Bereich "Zustand und Schäden" entfernen | Entfernt (nur Resttext in Placeholder) | OK |

### 1.5 Fotos/Videos/360° vereinfacht

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Link-Button für 360° entfernen | Entfernt | OK |
| Nur Foto-Upload und Video-Upload | Vorhanden | OK |
| Optionales Textfeld für 360°-Link darunter | Vorhanden | OK |

### 1.6 Daten-Hierarchie: Immobilie als eigenständiges Asset

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| Immobilie hat eigenen Lebenszyklus | `properties.projectId` ist nullable (optional) | OK | — |
| Kann zu mehreren Projekten gehören | Nur 1:N (eine Immobilie → ein Projekt) | **ABWEICHUNG** | Sollte M:N sein (Zwischentabelle) |
| Kann Eigentümer wechseln | Kein `companyId`-Feld in properties | **ABWEICHUNG** | Immobilie braucht eigenes `companyId`-Feld |
| Historie bleibt erhalten | Keine Historien-Tabelle | **ABWEICHUNG** | Niedrige Priorität für Mockup |

> **Interview-Zitat:** "IMMOBILIE (zentrales Asset mit eigenem Lebenszyklus) – Kann zu mehreren Projekten gehören (über die Jahre) – Kann Eigentümer wechseln – Historie bleibt erhalten"

**Abweichung A2:** Die Immobilie ist aktuell 1:N an Projekte gebunden. Laut Interview soll eine Immobilie zu mehreren Projekten gehören können (M:N-Beziehung über die Jahre). Für den Mockup ist das akzeptabel, aber die Architektur sollte dies berücksichtigen.

**Abweichung A3:** Die Immobilie hat kein eigenes `companyId`-Feld. Laut Interview kann eine Immobilie den Eigentümer wechseln. Die Zuordnung läuft aktuell nur über das Projekt.

---

## 2. ANGEBOTSGESTALTUNG

### 2.1 Wizard-Flow (5 Schritte)

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Schritt 1: Projekt & Immobilien auswählen | Schritt 1: Projekt (Unternehmen & Projekt wählen) | OK |
| Schritt 2: Immobilien & Seiten auswählen | Schritt 2: Immobilien & Seiten | OK |
| Schritt 3: Kalkulation prüfen | Schritt 3: Kalkulation | OK |
| Schritt 4: Rabatt & Konditionen | Schritt 4: Konditionen (Rabatt & Bedingungen) | OK |
| Schritt 5: Zusammenfassung & PDF | Schritt 5: Zusammenfassung (Prüfen & erstellen) | OK |

### 2.2 Positionsstruktur im PDF (X.1–X.5)

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| X.1 = Stammdaten/Eckdaten der Immobilie | Implementiert | OK |
| X.2 = FassadenFix Systemreinigung (m²) | Implementiert | OK |
| X.3 = Arbeitshöhe/Bühnentechnik | Implementiert | OK |
| X.4 = Baustelleneinrichtung | Implementiert | OK |
| X.5 = Übernachtungskosten | Implementiert | OK |
| Kopfposition = Immobilie mit Kurzinfo | Implementiert | OK |
| Fläche pro Immobilie zusammengezogen | Implementiert | OK |

### 2.3 Störer-Layout (2 Spalten)

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Linke Spalte: Preisstaffel-Transparenz | Implementiert mit Staffel-Tabelle | OK |
| Rechte Spalte: 4 Leistungen | Implementiert (Pauschalfestpreis, Ergebnis, 5J-Garantie, Inspektion) | OK |
| Gesamtfläche + aktive Staffel hervorgehoben | Implementiert | OK |
| "Je mehr Fläche, desto günstiger" | Implementiert als Fußnote | OK |

### 2.4 Textbausteine-System

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Datenbank-gestützt mit Platzhaltern | textBlocks-Tabelle in Schema | OK |
| Select/Multiselect für Auswahl | StoererBedingungStep mit Auswahl | OK |

### 2.5 Baustelleneinrichtung-Pauschale

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Pauschale 199€ pro Immobilie | 199€ pro Immobilie implementiert | OK |

---

## 3. PREISGESTALTUNG

### 3.1 Preisstaffelung

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| 500–999 m² → 10,50 €/m² | 10.50 implementiert | OK |
| 1.000–2.499 m² → 9,75 €/m² | 9.75 implementiert | OK |
| 2.500–4.999 m² → 9,25 €/m² | 9.25 implementiert | OK |
| ab 5.000 m² → 8,75 €/m² (Bestpreis) | 8.75 implementiert | OK |
| Basiert auf GESAMTFLÄCHE aller Immobilien | Gesamtfläche wird berechnet | OK |
| Gleicher Preis/m² für alle Immobilien | Einheitlicher Preis | OK |
| Mindestfläche 500 m² | MINDESTFLAECHE = 500 | OK |

### 3.2 Frühbucher-Rabatt

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| bis 31.12. → 6% | "31.12.2024" hardcoded | **ABWEICHUNG** | Jahreszahl hardcoded statt dynamisch |
| bis 31.01. → 4,5% | "31.01.2025" hardcoded | **ABWEICHUNG** | Jahreszahl hardcoded statt dynamisch |
| bis 28.02. → 3% | "28.02.2025" hardcoded | **ABWEICHUNG** | Jahreszahl hardcoded statt dynamisch |
| bis 31.03. → 1,5% | "31.03.2025" hardcoded | **ABWEICHUNG** | Jahreszahl hardcoded statt dynamisch |
| Rabattcode: "FRÜHBUCHER" | Implementiert | OK | — |
| Auf Beauftragungsdatum bezogen | beauftragungsDatum-Feld vorhanden | OK | — |

> **Interview-Vorgabe:** Die Frühbucher-Rabatte beziehen sich auf das Beauftragungsdatum relativ zur nächsten Saison. Die Daten sollten dynamisch berechnet werden (aktuelles Jahr + nächstes Jahr), nicht hardcoded auf 2024/2025.

**Abweichung A4:** Die Frühbucher-Rabatt-Daten sind auf 2024/2025 hardcoded. Da wir Februar 2026 haben, sind alle Frühbucher-Rabatte "abgelaufen". Die Daten müssen dynamisch auf die aktuelle/nächste Saison berechnet werden.

### 3.3 Einkaufsgemeinschaft

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Kumulierte m² als Berechnungsgrundlage | Implementiert (einkaufsgemeinschaftFlaeche) | OK |
| Rechnungslegung einzeln je Unternehmen | Nicht im Mockup-Scope | — |

### 3.4 Bühnentage-Berechnung

| Interview-Vorgabe | Implementierung (Ist) | Status |
|---|---|---|
| Gesamtfläche / 500 m² (aufgerundet) | `Math.ceil(seite.flaeche / 500)` pro Seite | OK |

### 3.5 Übernachtungs-Logik

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| Entfernung > 100 km → Übernachtung | Manuell pro Immobilie konfigurierbar | **TEILWEISE** | Keine automatische Berechnung |
| Entfernung > 50 km UND Dauer > 1 Tag | Nicht automatisch | **ABWEICHUNG** | Sollte automatisch vorgeschlagen werden |

**Abweichung A5:** Die Übernachtungs-Logik ist manuell pro Immobilie konfigurierbar, aber es fehlt die automatische Berechnung basierend auf Entfernung (>100km oder >50km + >1 Tag). Das System sollte automatisch vorschlagen, ob Übernachtung erforderlich ist.

---

## 4. CRM-DATENBANK: UNTERNEHMEN & KONTAKTE

### 4.1 Daten-Hierarchie

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| UNTERNEHMEN → KONTAKTE (mehrere pro Unternehmen) | contacts.companyId → companies.id | OK | — |
| KONTAKTE → PROJEKTE (mehrere pro Kontakt) | projects.contactId → contacts.id | OK | — |
| PROJEKTE → IMMOBILIEN (zugeordnet) | properties.projectId → projects.id | OK | — |
| Kunde = stets das UNTERNEHMEN | companies-Tabelle als Hauptentität | OK | — |
| Jedes Unternehmen hat EINEN zentralen Portal-Zugang | customerPortalAccess mit companyId | OK | — |

### 4.2 CRM-Darstellung: Hierarchische Ansicht

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| Unternehmen als übergeordnete Entität | Kontakte-Seite zeigt flache Liste | **ABWEICHUNG** | Keine hierarchische Gruppierung nach Unternehmen |
| Kontakte hierarchisch unter Unternehmen | Kontakte werden mit Unternehmensname angezeigt, aber nicht gruppiert | **ABWEICHUNG** | Sollte Unternehmen → Kontakte → Projekte zeigen |
| Separate Unternehmen-Seite | Keine eigene Unternehmen-Seite | **ABWEICHUNG** | Sidebar hat "Unternehmen & Kontakte" als einen Punkt |

> **Interview-Erkenntnis:** "Der Kunde ist stets das UNTERNEHMEN, nicht der Kontakt/Ansprechpartner. Jedes Unternehmen hat EINEN zentralen Zugang zum Portal."

**Abweichung A6:** Die Kontakte-Seite zeigt eine flache Liste aller Kontakte. Es fehlt die hierarchische Darstellung: Unternehmen als übergeordnete Entität mit darunter zugeordneten Kontakten. Die Sidebar zeigt "Unternehmen & Kontakte" als einen Menüpunkt, aber es gibt keine separate Unternehmen-Ansicht mit Drill-Down zu Kontakten und deren Projekten.

### 4.3 Kundenportal: Ampel-System

| Interview-Vorgabe | Implementierung (Ist) | Status | Abweichung |
|---|---|---|---|
| KEIN Zeitstrahl, sondern AMPEL-System | Kundenportal ist Mock-basiert | **ABWEICHUNG** | Ampel-System existiert im Backend (ampelSystem.ts), aber nicht im Kundenportal-Frontend |
| Grün/Gelb/Rot pro Phase | calculateProjectAmpel() und calculateSiteAmpel() implementiert | **TEILWEISE** | Backend OK, Frontend fehlt |
| Jede Baustelle hat eigene Ampel | Backend-Logik vorhanden | **TEILWEISE** | Nicht im Kundenportal dargestellt |
| Aufgaben auf AUFTRAGGEBERSEITE vs. AUFTRAGNEHMERSEITE | Nicht unterschieden | **ABWEICHUNG** | Aufgaben haben kein Feld für "Verantwortungsseite" |

**Abweichung A7:** Das Kundenportal ist komplett Mock-basiert und nutzt nicht das implementierte Ampel-System aus dem Backend. Die Ampel-Logik (calculateProjectAmpel, calculateSiteAmpel) existiert, wird aber im Portal-Frontend nicht verwendet.

**Abweichung A8:** Aufgaben unterscheiden nicht zwischen Auftraggeber- und Auftragnehmerseite. Laut Interview soll der Kunde im Portal sehen, welche Aufgaben von ihm (Auftraggeber) und welche von FassadenFix (Auftragnehmer) zu erledigen sind.

---

## 5. ZUSAMMENFASSUNG DER ABWEICHUNGEN

### Kritische Abweichungen (sofort umsetzen)

| ID | Bereich | Abweichung | Aufwand |
|---|---|---|---|
| **A1** | Objektaufnahme | "Eingangsseite" → "Frontseite" | 5 Min |
| **A4** | Preisgestaltung | Frühbucher-Daten hardcoded auf 2024/2025, müssen dynamisch sein | 30 Min |
| **A6** | CRM-Darstellung | Kontakte-Seite: Keine hierarchische Gruppierung nach Unternehmen | 2-3 Std |

### Mittlere Abweichungen (sollte umgesetzt werden)

| ID | Bereich | Abweichung | Aufwand |
|---|---|---|---|
| **A5** | Preisgestaltung | Übernachtung: Keine automatische Berechnung basierend auf Entfernung | 1 Std |
| **A7** | Kundenportal | Ampel-System nicht im Frontend integriert | 2 Std |
| **A8** | Kundenportal | Aufgaben: Keine Unterscheidung Auftraggeber/Auftragnehmer | 1 Std |

### Niedrige Abweichungen (Architektur-Hinweise für später)

| ID | Bereich | Abweichung | Aufwand |
|---|---|---|---|
| **A2** | Datenmodell | Immobilie 1:N statt M:N zu Projekten | 3-4 Std |
| **A3** | Datenmodell | Immobilie hat kein eigenes companyId-Feld | 1 Std |

### Korrekt implementierte Bereiche

Die folgenden Interview-Vorgaben sind **korrekt umgesetzt**:

- Seitenbezeichnungen (Rückseite, Linker/Rechter Giebel) mit korrekten Beschreibungen
- Sockel und Dach/Attika entfernt
- "Reinigungsfähig" statt "Zu reinigen" mit Erklärfeld
- Zuwegung vereinfacht (Ja/Nein + Erklärfeld)
- Zustand und Schäden entfernt
- Fotos/Videos/360° vereinfacht
- Angebots-Wizard 5 Schritte korrekt
- Positionsstruktur X.1–X.5 pro Immobilie
- Störer 2-Spalten-Layout (Preisstaffel + Leistungen)
- Preisstaffelung (10,50 / 9,75 / 9,25 / 8,75)
- Einkaufsgemeinschaft mit kumulierten m²
- Bühnentage-Berechnung (Fläche / 500 aufgerundet)
- Baustelleneinrichtung 199€ Pauschale
- Daten-Hierarchie: Unternehmen → Kontakte → Projekte → Immobilien
- Textbausteine-System mit Platzhaltern
- Rabattcode "FRÜHBUCHER"
- 4 Leistungen im Störer (Pauschalfestpreis, Ergebnis, 5J-Garantie, Inspektion)

---

## 6. UMSETZUNGSPLAN

### Sofort (in dieser Session):

1. **A1:** "Eingangsseite" → "Frontseite" im ObjektaufnahmeWizard
2. **A4:** Frühbucher-Daten dynamisch berechnen (aktuelles/nächstes Saisonjahr)
3. **A5:** Automatische Übernachtungs-Empfehlung basierend auf Entfernung
4. **A6:** Kontakte-Seite mit hierarchischer Unternehmen-Gruppierung umbauen

### Nächste Session:

5. **A7:** Ampel-System im Kundenportal-Frontend integrieren
6. **A8:** Aufgaben-Tabelle um "Verantwortungsseite" (Auftraggeber/Auftragnehmer) erweitern

---

*Erstellt am 09.02.2026 durch systematische Interview-Revalidierung*
