# E2E-Test v4.0 – Intentionsbasierter Abgleich

**Datum:** 09. Februar 2026
**Methode:** Jeder Workflow wird aus der jeweiligen Nutzerperspektive durchlaufen und gegen die 8 Kern-Intentionen aus den Interviews abgeglichen.

---

## Testszenarien-Matrix

| # | Szenario | Rolle | Prüft Intention | Kernfrage |
|---|----------|-------|-----------------|-----------|
| 1 | Neues Unternehmen + Kontakt anlegen | KB | I1, I6 | Ist die Hierarchie Unternehmen→Kontakte korrekt? |
| 2 | Neues Projekt erstellen und Unternehmen zuordnen | KB | I6 | Folgt der Workflow dem 10-Phasen-Modell? |
| 3 | Objektaufnahme: Alle 4 Seiten komplett durchlaufen | KB | I2, I3 | Sind die 3 Ebenen (WER/WAS/WIE) abgebildet? |
| 4 | Immobilie als eigenständiges Asset prüfen | KB | I1 | Kann die Immobilie unabhängig vom Projekt existieren? |
| 5 | Angebot aus Objektaufnahme-Daten ableiten | KB | I2 | Werden Daten übernommen oder doppelt eingegeben? |
| 6 | Angebots-Wizard: Preislogik und Frühbucher | KB | I7, I8 | Ist Frühbucher dynamisch? Übernachtung automatisch? |
| 7 | Baustellen-Tagesablauf: Vorher-Doku als Gate | PL/ATL | I4 | Ist die Vorher-Doku ein Pflicht-Gate? |
| 8 | Baustellen-Tagesablauf: Morgen/Abend-Workflow | PL/ATL | I4 | Wird die Planungsfrage MORGENS UND ABENDS gestellt? |
| 9 | Teamzuweisung und Projektstruktur | PL/ATL | I4 | Stimmt die 4er-Team-Struktur? |
| 10 | Dashboard und Navigation: Workflow-Logik | GF | I6 | Folgt die Sidebar dem 10-Phasen-Workflow? |
| 11 | KPI-Dashboard: Echte vs. Mock-Daten | GF | I6 | Zeigen die KPIs reale Werte? |
| 12 | Kundenportal: Arbeitsplattform mit Ampel | Kunde | I5 | Ist es eine Arbeitsplattform oder nur Info-Seite? |

---

## Findings


### SZENARIO 1: Neues Unternehmen + Kontakt anlegen (Rolle: Kundenberater)
**Prüft: Intention 1 (Immobilie als Asset) + Intention 6 (Navigation folgt Workflow)**

#### Erster Eindruck – Sidebar-Navigation (Intention 6)

**FINDING V4-001 | INTENTION 6 | ABWEICHUNG**
Die Sidebar-Sektion heißt immer noch "ERSTELLEN & ERFASSEN". Laut Interview-Intention 6 suggeriert dies eine einmalige Aktion, aber Projekte werden über ihren gesamten Lifecycle verwaltet. Die Sidebar müsste den Workflow widerspiegeln, nicht eine willkürliche Gruppierung.
- **Interview-Vorgabe:** "Erstellen & Erfassen" → umbenennen in etwas, das den Lifecycle widerspiegelt
- **IST:** "ERSTELLEN & ERFASSEN" mit Projekte, Baustellen, Immobilien
- **SOLL:** z.B. "PROJEKTMANAGEMENT" mit workflow-orientierter Reihenfolge

**FINDING V4-002 | INTENTION 6 | ABWEICHUNG**
Die Sidebar hat separate Sektionen "PLANUNG" (Terminfinder, Team einplanen, Ressourcenplaner) und "PROJEKTVORBEREITUNG" und "UMSETZUNG". Laut Interview überlappen sich "Projektvorbereitung" und "Planung" thematisch. Die Reihenfolge folgt NICHT dem 10-Phasen-Workflow.
- **Interview-Vorgabe:** Reihenfolge an 10-Phasen anpassen (Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss)
- **IST:** Willkürliche Gruppierung (Erstellen, Kundenberatung, Planung, Projektvorbereitung, Umsetzung, Finanzen, Kundenportal, Unternehmenssystem, System)
- **SOLL:** Workflow-orientierte Gruppierung

**FINDING V4-003 | INTENTION 6 | POSITIV**
Das Dashboard zeigt "Montag, 9. Februar 2026" – das Datum ist jetzt dynamisch (war vorher statisch "03. Feb 2026"). ✅

**FINDING V4-004 | INTENTION 6 | ABWEICHUNG**
Die KPI-Karten im Dashboard zeigen nur Skeleton-Loader (grüne Platzhalter), keine echten Daten. Für die Geschäftsführung (Intention 6) ist das Dashboard der zentrale Einstiegspunkt – wenn hier keine echten Zahlen stehen, verliert es seinen Sinn.


**FINDING V4-005 | INTENTION 6 | ABWEICHUNG**
Dashboard-KPI "Projekte" zeigt "0" und darunter "0 Aufträge". Aber es gibt 3 Projekte (sichtbar in "Nächste Schritte"). Die KPI-Karte zeigt die falsche Zahl. Zusätzlich: "+12% vs. Vormonat" ist bei 0 Projekten unsinnig – das ist ein statischer Platzhalter.
- **Interview-Vorgabe (I6):** Dashboard soll echte operative Zahlen zeigen
- **IST:** KPIs zeigen 0 trotz 3 existierender Projekte, "+12%" ist Fake
- **SOLL:** Echte Zählung der Projekte, echte Trend-Berechnung oder Trend ausblenden

**FINDING V4-006 | INTENTION 6 | ABWEICHUNG**
Alle 3 Projekte stehen in Phase "Objektaufnahme" mit "Nächster Schritt: Angebot erstellen". Aber die Objektaufnahme ist noch nicht abgeschlossen – es fehlen noch Immobilien/Seiten. Der "Nächste Schritt" sollte kontextabhängig sein: Wenn die Objektaufnahme noch nicht fertig ist, sollte der nächste Schritt "Objektaufnahme abschließen" sein, nicht "Angebot erstellen".
- **Interview-Vorgabe (I2):** Objektaufnahme = Datenbasis, Angebot = Ableitung. Erst wenn die Datenbasis vollständig ist, kann das Angebot erstellt werden.
- **IST:** "Angebot erstellen" wird als nächster Schritt angezeigt, obwohl die Objektaufnahme unvollständig ist
- **SOLL:** Kontextabhängiger nächster Schritt basierend auf Vollständigkeit der Objektaufnahme

**FINDING V4-007 | INTENTION 6 | TEILWEISE**
Die Sidebar-Sektion "KUNDENBERATUNG" ist zugeklappt. Darunter befinden sich: Unternehmen & Kontakte, Angebote, Aufträge, Garantien & Inspektionen. Das ist eine sinnvolle Gruppierung für den Kundenberater, aber sie folgt nicht dem 10-Phasen-Workflow. "Garantien & Inspektionen" gehört eher ans Ende des Workflows (nach Abnahme), nicht in die Kundenberatung.


#### Kontakte-Seite (Intention 1 + 5)

**FINDING V4-008 | INTENTION 1 | POSITIV ✅**
Die Kontakte-Seite zeigt "Unternehmen & Kontakte" mit hierarchischer Ansicht: Unternehmen als Eltern, Kontakte als Kinder. 102 Unternehmen, 104 Kontakte. Die Hierarchie Unternehmen→Kontakte ist korrekt abgebildet. Jedes Unternehmen zeigt Kategorie, Ort und Anzahl Kontakte.

**FINDING V4-009 | INTENTION 5 | POSITIV ✅**
"Kunden, Ansprechpartner und Entscheider hierarchisch verwalten" – die Beschreibung ist korrekt. Die Ansicht zeigt Unternehmen mit aufklappbaren Kontakten. Das entspricht der Interview-Vorgabe: "Der Kunde ist stets das UNTERNEHMEN, nicht der Kontakt."

**FINDING V4-010 | INTENTION 1 | ABWEICHUNG**
Die KPI-Karte "Hauptkontakte" zeigt "0". Was ist ein "Hauptkontakt"? Dieses Konzept wurde in den Interviews nicht definiert. Es gibt keine klare Zuordnung, wer der "Hauptkontakt" eines Unternehmens ist. Entweder entfernen oder als "Entscheider" definieren (Interview: "Wer trifft die Entscheidung?").

**FINDING V4-011 | INTENTION 6 | ABWEICHUNG**
Breadcrumb zeigt "Übersicht > Unternehmen > Kontakte" – aber die Seite heißt "Unternehmen & Kontakte". Die Breadcrumb-Struktur suggeriert eine Hierarchie (Unternehmen als Eltern, Kontakte als Kinder), was korrekt ist, aber die Darstellung ist verwirrend.


### SZENARIO 2: Projektübersicht und Phasen-Workflow (Rolle: Kundenberater)
**Prüft: Intention 6 (Navigation folgt Workflow)**

**FINDING V4-012 | INTENTION 6 | TEILWEISE**
Projektübersicht zeigt 3 Projekte, alle in Phase "Objektaufnahme". Die KPI-Karten zeigen: 3 Gesamt, 0 In Bearbeitung, 0 Angebote, 0 Abgeschlossen. Die Kategorisierung "In Bearbeitung" ist unklar – was bedeutet das im 10-Phasen-Modell? "Objektaufnahme" IST "In Bearbeitung" im Sinne des Workflows. Die KPIs sollten die 10 Phasen widerspiegeln, nicht eine eigene Kategorisierung.
- **Interview-Vorgabe (I6):** 10-Phasen-Workflow als Rückgrat
- **IST:** Eigene Kategorien (Gesamt, In Bearbeitung, Angebote, Abgeschlossen)
- **SOLL:** KPIs sollten die 10 Phasen abbilden oder zumindest die Hauptgruppen (Akquise, Planung, Umsetzung, Abschluss)

**FINDING V4-013 | INTENTION 2 | POSITIV ✅**
Alle 3 Projekte zeigen die Phase "Objektaufnahme" korrekt an. Das entspricht der Realität: Projekte beginnen mit der Objektaufnahme.

**FINDING V4-014 | INTENTION 6 | ABWEICHUNG**
Der Phasen-Filter zeigt "Alle Phasen" als Dropdown. Aber es gibt keinen visuellen Hinweis, welche Phasen verfügbar sind und wie viele Projekte in welcher Phase stehen. Ein Phasen-Balken oder eine Kanban-Ansicht wäre workflow-orientierter.


### SZENARIO 2+3: ProjektDetail und Objektaufnahme-Workflow (Rolle: Kundenberater)
**Prüft: Intention 2 (Objektaufnahme=Datenbasis), Intention 3 (3 Ebenen), Intention 6 (Workflow)**

**FINDING V4-015 | INTENTION 6 | POSITIV ✅**
Der Projektzeitstrahl zeigt alle 10 Phasen korrekt: 1.Objektaufnahme → 2.Angebot erstellt → 3.Angebot versendet → 4.Nachfassen → 5.Auftrag gewonnen → 6.Planung → 7.Vorbereitung → 8.Durchführung → 9.Abnahme → 10.Abgeschlossen. Phase 1 ist grün markiert (aktiv). Das entspricht exakt dem 10-Phasen-Workflow aus den Interviews.

**FINDING V4-016 | INTENTION 6 | POSITIV ✅**
Der Workflow-Bereich zeigt: "Noch nicht möglich: Angebot erstellt – Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot." Das ist eine korrekte Gate-Logik: Man kann nicht zur nächsten Phase wechseln, wenn die Voraussetzung nicht erfüllt ist.

**FINDING V4-017 | INTENTION 2 | ABWEICHUNG**
Der Workflow sagt "Erstellen Sie zuerst ein Angebot", aber die Objektaufnahme ist noch nicht abgeschlossen (0 Immobilien). Laut Interview-Intention 2 ist die Objektaufnahme die DATENBASIS und das Angebot die ABLEITUNG. Der Workflow sollte ZUERST prüfen: "Objektaufnahme abschließen (0 Immobilien erfasst)" und DANN erst "Angebot erstellen" ermöglichen.
- **Interview-Vorgabe (I2):** "Die Qualität des Angebots hängt von der Qualität der Objektaufnahme ab"
- **IST:** Workflow springt direkt zu "Angebot erstellen" ohne Objektaufnahme-Prüfung
- **SOLL:** Gate: "Objektaufnahme abschließen" → dann "Angebot erstellen"

**FINDING V4-018 | INTENTION 5 | ABWEICHUNG**
Der Projektzeitstrahl verwendet einen linearen Fortschrittsbalken. Laut Interview-Intention 5 wurde ein AMPEL-System (Grün/Gelb/Rot) bevorzugt, kein Zeitstrahl. Allerdings: Das Ampel-System wurde explizit für das KUNDENPORTAL gefordert, nicht für die interne Ansicht. Der Zeitstrahl ist für die interne Verwaltung akzeptabel.
- **Bewertung:** KEIN Fehler – Zeitstrahl ist für interne Ansicht korrekt, Ampel nur für Kundenportal

**FINDING V4-019 | INTENTION 1 | ABWEICHUNG**
Immobilien zeigt "0" – obwohl in einem früheren Test eine Immobilie erfasst wurde. Die Zuordnung Immobilie→Projekt scheint nicht zu funktionieren oder die Immobilie wurde einem anderen Projekt zugeordnet.
- **Interview-Vorgabe (I1):** Immobilie als eigenständiges Asset, das einem Projekt ZUGEORDNET wird
- **IST:** 0 Immobilien trotz vorheriger Erfassung
- **SOLL:** Klare Zuordnung und Anzeige

**FINDING V4-020 | INTENTION 2 | POSITIV ✅**
Der "Angebot"-Button oben rechts ist vorhanden. Das ermöglicht den direkten Einstieg in die Angebotserstellung aus dem Projekt heraus – entspricht der Interview-Vorgabe, dass das Angebot aus dem Projekt-Kontext erstellt wird.


### SZENARIO 3: Immobilien-Übersicht und 3-Ebenen-Modell (Rolle: Kundenberater)
**Prüft: Intention 1 (Immobilie als Asset), Intention 3 (3 logische Ebenen)**

**FINDING V4-021 | INTENTION 1 | KRITISCH ⚠️**
4 Immobilien existieren, aber nur 1 ist einem Projekt zugeordnet ("Grüner Weg" → "Fassadenreinigung Wohnanlage Grüner Weg"). Die Immobilie "Lister Meile 25-31" ist NICHT dem Projekt "Lister Meile" zugeordnet, obwohl sie im Kontext dieses Projekts erstellt wurde. Das widerspricht Intention 1: "Die Immobilie gehört dem Unternehmen, nicht dem Projekt."
- **Interview-Vorgabe (I1):** Immobilie gehört dem UNTERNEHMEN und wird einem PROJEKT zugeordnet
- **IST:** Immobilie "Lister Meile" existiert, ist aber keinem Projekt zugeordnet
- **SOLL:** Automatische Zuordnung beim Erstellen aus dem Projekt-Kontext, ODER manuelle Zuordnung

**FINDING V4-022 | INTENTION 3 | ABWEICHUNG**
Die Immobilien-Tabelle zeigt: Adresse, Fläche, Zuordnungen, Fotos. Es fehlt die 3-Ebenen-Struktur:
- **Ebene 1 (Projekt):** Welches Projekt? → Nur als "Zuordnung" gezeigt
- **Ebene 2 (Immobilie):** Adresse, Fläche → ✅ vorhanden
- **Ebene 3 (Seiten):** Welche Seiten hat die Immobilie? → ❌ NICHT sichtbar
Die Seiten-Ebene ist in der Übersicht unsichtbar. Man muss die Immobilie öffnen, um die Seiten zu sehen. Laut Interview-Intention 3 sind die 3 Ebenen das zentrale Datenmodell.

**FINDING V4-023 | INTENTION 1 | ABWEICHUNG**
Es gibt 2x "An der Saalebahn 8a, Halle (Saale)" – eine als "Entwurf" und eine ohne Status. Das deutet auf ein Duplikat hin. Es gibt keine Duplikat-Erkennung. Laut Intention 1 ist die Immobilie ein "Asset, das einmal existiert und wiederverwendet wird". Duplikate widersprechen diesem Prinzip.
- **Interview-Vorgabe (I1):** "Eine Immobilie existiert einmal und kann mehreren Projekten zugeordnet werden"
- **IST:** Duplikate möglich, keine Warnung
- **SOLL:** Duplikat-Erkennung bei gleicher Adresse

**FINDING V4-024 | INTENTION 1 | POSITIV ✅**
KPI "3.0k m² Reinigungsfähig" – die Gesamtfläche wird korrekt berechnet und angezeigt. Das zeigt, dass die Seiten-Daten (Fläche, reinigungsfähig) korrekt aggregiert werden.


### SZENARIO 4: Angebots-Wizard (Rolle: Kundenberater)
**Prüft: Intention 2 (Angebot=Ableitung aus Objektaufnahme), Intention 7 (Preislogik)**

**FINDING V4-025 | INTENTION 2 | POSITIV**
Der Angebots-Wizard hat den vorherigen Entwurf wiederhergestellt (Auto-Save funktioniert). WBG Nordstadt eG ist vorausgewählt, Projekt "Lister Meile" ist geladen. "Projektdaten geladen" zeigt: Projektnummer 2026-WBG-01, Entfernung 50km, Immobilien: 0. Das ist korrekt.

**FINDING V4-026 | INTENTION 2 | KRITISCH**
"Immobilien: 0" – Der Wizard zeigt korrekt, dass das Projekt keine Immobilien hat. ABER: Er lässt trotzdem "Weiter" klicken. Laut Intention 2 ist das Angebot eine ABLEITUNG der Objektaufnahme. Wenn es keine Immobilien gibt, kann kein Angebot erstellt werden. Der Wizard sollte hier BLOCKIEREN.
- Interview-Vorgabe (I2): "Die Qualitaet des Angebots haengt von der Qualitaet der Objektaufnahme ab"
- IST: Wizard erlaubt Fortfahren ohne Immobilien
- SOLL: Gate: "Objektaufnahme erforderlich - 0 Immobilien erfasst"

**FINDING V4-027 | INTENTION 2 | POSITIV**
Der 5-Schritt-Wizard (Projekt, Immobilien und Seiten, Kalkulation) folgt der logischen Reihenfolge.

**FINDING V4-028 | INTENTION 7 | ZU PRUEFEN**
Die Angebots-Wizard-Schritte zeigen nur 3 sichtbare Steps. Laut Interview-Intention 7 sollte die Preislogik die FassadenFix-Preisstaffelung verwenden. Muss im Kalkulations-Step geprueft werden.


### SZENARIO 5: Baustellen-Seite (Rolle: AT-Leiter)
**Prüft: Intention 4 (Vorher-Doku als Gate), Intention 6 (Navigation)**

**FINDING V4-029 | INTENTION 4 | NEUTRAL**
Baustellen-Seite zeigt 0 Baustellen. Das ist korrekt, weil noch kein Projekt die Phase "Durchfuehrung" erreicht hat. Baustellen entstehen erst, wenn ein Auftrag gewonnen wurde und die Planung abgeschlossen ist.

**FINDING V4-030 | INTENTION 6 | ABWEICHUNG**
In der Sidebar gibt es ZWEI separate Eintraege fuer Baustellen:
1. "Baustellen" unter "ERSTELLEN & ERFASSEN" (aktuell sichtbar)
2. "Baustellenmanager" unter "UMSETZUNG" (vermutet, muss geprueft werden)
Laut Interview-Intention 6 sollte es EINEN Einstiegspunkt geben, nicht zwei. Die Baustellen-Uebersicht und der Baustellenmanager sollten zusammengefuehrt werden.
- Interview-Vorgabe (I6): "Keine doppelten Menuepunkte"
- IST: 2 separate Eintraege
- SOLL: 1 Einstiegspunkt mit Tabs/Filtern

**FINDING V4-031 | INTENTION 4 | ZU PRUEFEN**
Die Baustellen-Seite hat einen "Neue Baustelle" Button. Aber laut Intention 4 sollte eine Baustelle AUTOMATISCH entstehen, wenn ein Projekt die Phase "Durchfuehrung" erreicht. Manuelles Erstellen widerspricht dem Workflow-Prinzip.


**FINDING V4-032 | INTENTION 6 | BESTAETIGT**
UMSETZUNG-Sektion aufgeklappt. Dort stehen: Teamleitercheck, Baustellenmanager, Auswertung und Abschluss. Das bestaetigt V4-030: Es gibt ZWEI Baustellen-Eintraege in der Sidebar:
1. "Baustellen" unter "ERSTELLEN & ERFASSEN" (Uebersicht/Verwaltung)
2. "Baustellenmanager" unter "UMSETZUNG" (operativer Einsatz)
Laut Interview-Intention 4 ist der Baustellenmanager das ZENTRALE TOOL fuer den AT-Leiter. Die Baustellen-Uebersicht ist eine Verwaltungsansicht. Die Frage ist: Braucht der AT-Leiter beides? Oder reicht der Baustellenmanager mit integrierter Uebersicht?

**FINDING V4-033 | INTENTION 4 | POSITIV**
"Teamleitercheck" als eigener Menuepunkt unter UMSETZUNG ist korrekt. Laut Interview-Intention 4 ist die Vorher-Dokumentation (Teamleitercheck) ein PFLICHT-GATE vor dem Arbeitsbeginn. Dass es einen eigenen Menuepunkt hat, zeigt die Wichtigkeit.

**FINDING V4-034 | INTENTION 4 | ZU PRUEFEN**
"Auswertung & Abschluss" als Menuepunkt unter UMSETZUNG. Laut Interview gehoert die Auswertung zum Abschluss des Projekts (Phase 10). Ob dies hier korrekt platziert ist, haengt davon ab, ob die Auswertung pro Baustelle oder pro Projekt erfolgt.


### SZENARIO 6: Kundenportal (Rolle: Kunde/Geschaeftsfuehrung)
**Prueft: Intention 5 (Transparenz, Ampel-System, Vertrauen)**

**FINDING V4-035 | INTENTION 5 | POSITIV**
Kundenportal zeigt: 3 Projekte, 0 Aktive Garantien, 0 Dokumente, Naechste Inspektion: -. Die Tabs sind: Meine Projekte, Garantien, Dokumente, Kontakt, Feedback. Das entspricht der Interview-Vorgabe: "Der Kunde soll sehen, was passiert, ohne anrufen zu muessen."

**FINDING V4-036 | INTENTION 5 | ABWEICHUNG**
"Derzeit keine aktiven Projekte" – aber es gibt 3 Projekte (KPI zeigt "3 Projekte"). Der Widerspruch: Die Projekte sind in Phase "Objektaufnahme", was noch nicht als "aktiv" gilt. Aber fuer den KUNDEN ist ein Projekt aktiv, sobald er davon weiss. Die Logik sollte sein: Projekte ab Phase 1 (Objektaufnahme) sind fuer den Kunden sichtbar.
- Interview-Vorgabe (I5): "Der Kunde soll den Fortschritt sehen"
- IST: 3 Projekte in KPI, aber "keine aktiven Projekte" in der Liste
- SOLL: Projekte ab Objektaufnahme als "aktiv" anzeigen

**FINDING V4-037 | INTENTION 5 | ABWEICHUNG**
Es fehlt das AMPEL-SYSTEM. Laut Interview-Intention 5 wurde explizit ein Ampel-System (Gruen/Gelb/Rot) fuer den Kunden gefordert:
- Gruen: Alles im Plan
- Gelb: Verzoegerung moeglich
- Rot: Problem, Kontaktaufnahme noetig
Stattdessen gibt es nur eine leere Projektliste. Das Ampel-System ist das KERN-FEATURE des Kundenportals.

**FINDING V4-038 | INTENTION 5 | POSITIV**
"Feedback"-Tab ist vorhanden. Laut Interview-Intention 5 soll der Kunde Feedback geben koennen. Das ist korrekt implementiert.


### SZENARIO 7: Projektuebersicht und Phasenwechsel (Rolle: Geschaeftsfuehrung)
**Prueft: Intention 8 (10-Phasen-Workflow), Intention 6 (Navigation)**

**FINDING V4-039 | INTENTION 8 | ABWEICHUNG**
KPIs zeigen: 3 Gesamt, 0 In Bearbeitung, 0 Angebote, 0 Abgeschlossen. Alle 3 Projekte sind in Phase "Objektaufnahme" (Phase 1). Die KPI-Kategorien passen NICHT zum 10-Phasen-Modell:
- "In Bearbeitung" ist unklar: Ab welcher Phase gilt ein Projekt als "in Bearbeitung"? Phase 6 (Planung)? Phase 8 (Durchfuehrung)?
- "Angebote" als KPI-Kategorie ist verwirrend: Meint es "Projekte in Angebotsphase" oder "Anzahl erstellter Angebote"?
- Interview-Vorgabe (I8): 10 Phasen sind das Rueckgrat. KPIs sollten die Phasen-Verteilung zeigen.
- SOLL: KPIs nach Phasen-Gruppen: Akquise (1-4), Planung (5-7), Umsetzung (8-9), Abgeschlossen (10)

**FINDING V4-040 | INTENTION 8 | POSITIV**
Alle 3 Projekte zeigen den Phase-Badge "Objektaufnahme" in Gruen. Das ist korrekt und entspricht dem 10-Phasen-Modell.

**FINDING V4-041 | INTENTION 8 | ABWEICHUNG**
Projekt "Olympiadorf Muenchen" zeigt "1.7.2026 - offen". Das Startdatum 1.7.2026 ist FALSCH - es sollte 4.5.2026 sein (der Kalender-Bug V3-S2-F-005 hat das Startdatum ueberschrieben). "offen" als Enddatum ist korrekt, weil kein Enddatum gesetzt wurde.


### SZENARIO 7 (Fortsetzung): ProjektDetail Lister Meile
**Prueft: Intention 8 (10-Phasen-Workflow), Intention 2 (Angebot=Ableitung)**

**FINDING V4-042 | INTENTION 8 | POSITIV**
Der Projektzeitstrahl zeigt alle 10 Phasen korrekt: 1-Objektaufnahme (gruen/aktiv), 2-Angebot erstellt, 3-Angebot versendet, 4-Nachfassen, 5-Auftrag gewonnen, 6-Planung, 7-Vorbereitung, 8-Durchfuehrung, 9-Abnahme, 10-Abgeschlossen. Das ist 1:1 das 10-Phasen-Modell aus den Interviews.

**FINDING V4-043 | INTENTION 8 | POSITIV**
Workflow-Hinweis: "Noch nicht moeglich: Angebot erstellt - Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot." Das ist ein GATE: Phase 2 kann erst erreicht werden, wenn ein Angebot existiert. Das entspricht der Interview-Intention: "Jede Phase hat Voraussetzungen."

**FINDING V4-044 | INTENTION 2 | ABWEICHUNG**
Immobilien: 0, Gesamtflaeche: -. Das Projekt hat KEINE Immobilien zugeordnet. Aber es gibt eine Immobilie "Lister Meile 25-31" in der Immobilien-Uebersicht, die im Kontext dieses Projekts erstellt wurde. Die automatische Zuordnung fehlt.
- Interview-Vorgabe (I2): "Die Objektaufnahme liefert die Daten fuer das Angebot"
- IST: Immobilie existiert, ist aber nicht dem Projekt zugeordnet
- SOLL: Automatische Zuordnung beim Erstellen aus dem Projekt-Kontext

**FINDING V4-045 | INTENTION 8 | POSITIV**
Tabs im ProjektDetail: Uebersicht, Immobilien (0), Angebote (0), Auftraege (0), Baustellen (0), Finanzen, Dokumente (0), Aufgaben (0), Teams. Das bildet den kompletten Lebenszyklus eines Projekts ab. Jeder Tab entspricht einem Aspekt des 10-Phasen-Workflows.

**FINDING V4-046 | INTENTION 8 | POSITIV**
"Angebot" Button oben rechts als Schnellzugriff. Das ermoeglicht den direkten Sprung vom Projekt zur Angebotserstellung. Entspricht dem Workflow: Projekt -> Objektaufnahme -> Angebot.

**FINDING V4-047 | INTENTION 2 | ABWEICHUNG**
Der Workflow-Hinweis sagt "Erstellen Sie zuerst ein Angebot" - aber die VORAUSSETZUNG fuer ein Angebot ist die Objektaufnahme (Immobilien). Der Hinweis sollte lauten: "Fuehren Sie zuerst eine Objektaufnahme durch (0 Immobilien erfasst)."


### SZENARIO 8: Baustellenmanager (Rolle: AT-Leiter)
**Prueft: Intention 4 (Vorher-Doku als Gate, Arbeitstag-Workflow)**

**FINDING V4-048 | INTENTION 4 | KRITISCH**
/baustellenmanager gibt 404! Der Sidebar-Link "Baustellenmanager" unter UMSETZUNG fuehrt zu einer nicht existierenden Seite. Das ist der ZENTRALE Arbeitsplatz des AT-Leiters laut Interview-Intention 4. Ohne Baustellenmanager kann der AT-Leiter:
- Keinen Arbeitstag beginnen
- Keine Vorher-Dokumentation durchfuehren
- Kein Logbuch fuehren
- Keine Nachher-Dokumentation erstellen
Das widerspricht fundamental der Interview-Vorgabe: "Der AT-Leiter arbeitet hauptsaechlich im Baustellenmanager."


**FINDING V4-049 | INTENTION 4 | ERKLAERUNG**
Baustellenmanager-Link geht auf /mobile, nicht /baustellenmanager. Die Route /mobile existiert aber nicht in App.tsx. Der Sidebar-Link ist korrekt (/mobile), aber die Route wurde nie registriert. Das ist ein Implementierungsluecke, kein Design-Fehler.


### SZENARIO 9: Teamleitercheck (Rolle: AT-Leiter)
**Prueft: Intention 4 (Vorher-Doku als Gate vor Arbeitsbeginn)**

**FINDING V4-050 | INTENTION 4 | POSITIV**
Der Teamleitercheck ist HERVORRAGEND implementiert! Zweistufiges System:
- Stufe 1: Projektbesprechung (19 Punkte) - Vorab-Pruefung aller Unterlagen
- Stufe 2: Freitag-Check - Erst nach Abschluss von Stufe 1 verfuegbar
Das ist exakt die Interview-Vorgabe: "Vorher-Dokumentation als Pflicht-Gate."

**FINDING V4-051 | INTENTION 4 | POSITIV**
Die Checkliste ist in 6 Kategorien gegliedert:
1. Rundgang (0/4): 360-Grad-Rundgang, Verkehrsrecht, Einzelobjektbetrachtung, BAP
2. Dokumente (0/6): Objektaufnahme, Auftragsbestaetigung, Bewohnerinfo, Verkehrsrecht, Mietbuehnen, Uebernachtung
3. Einsatzplanung (0/2): Mitarbeiter, Ressourcen
4. Ansprechpartner (0/2): Verwaltung/AG, vor Ort
5. Besonderheiten (0/3): Technik, Material, Chemie
6. Dateien (0/2): Bilder, Dokumente beschriftet
Das deckt alle im Interview genannten Pruefpunkte ab.

**FINDING V4-052 | INTENTION 4 | POSITIV**
Pflicht-Markierungen (rot "Pflicht") bei kritischen Punkten. Das entspricht der Interview-Vorgabe: "Bestimmte Punkte MUESSEN erledigt sein, bevor der Arbeitstag beginnen kann."

**FINDING V4-053 | INTENTION 4 | ABWEICHUNG**
Es fehlt der "Arbeitstag beginnen" Button, der erst aktiv wird, wenn alle Pflicht-Punkte erledigt sind. Der Teamleitercheck hat "Projektbesprechung abschliessen" und "Als Entwurf speichern", aber KEINEN expliziten Gate-Button fuer den Arbeitsbeginn.
- Interview-Vorgabe (I4): "Der AT-Leiter drueckt 'Arbeitstag beginnen' erst, wenn die Vorher-Doku komplett ist"
- IST: Checkliste ohne Gate-Funktion
- SOLL: "Arbeitstag beginnen" Button, der erst aktiv wird wenn alle Pflicht-Punkte erledigt sind

**FINDING V4-054 | INTENTION 4 | ABWEICHUNG**
Der Teamleitercheck zeigt nur das Muenchen-Projekt. Es gibt keine Moeglichkeit, zwischen Projekten zu wechseln (ausser ueber das Dropdown oben). Laut Interview-Intention 4 sollte der AT-Leiter ALLE seine heutigen Baustellen sehen, nicht nur eine.


### SZENARIO 10: Dashboard als Geschaeftsfuehrung
**Prueft: Intention 6 (Navigation), Intention 8 (10-Phasen-Workflow)**

**FINDING V4-055 | INTENTION 6 | POSITIV**
Dashboard-Header zeigt jetzt: "Montag, 9. Februar 2026" - das dynamische Datum funktioniert! (War vorher statisch "03. Feb 2026"). Guter Fix.

**FINDING V4-056 | INTENTION 6 | ABWEICHUNG**
Dashboard zeigt "Operative Uebersicht" mit 8 Skeleton-Karten (noch ladend). Die KPIs laden sehr langsam oder gar nicht. Fuer die Geschaeftsfuehrung muss das Dashboard SOFORT die wichtigsten Zahlen zeigen.

**FINDING V4-057 | INTENTION 6 | POSITIV**
"Naechste Schritte" Sektion zeigt "Aktive Projekte und ihre naechsten Aktionen" mit Link "Alle Projekte". Das ist der richtige Ansatz: Die GF will wissen, was als naechstes passieren muss.

**FINDING V4-058 | INTENTION 6 | POSITIV**
Schnellaktionen vorhanden: "Neues Projekt anlegen", "Objektaufnahme starten", "Angebot erstellen", "HubSpot synchronisieren". Das sind die 4 haeufigsten Aktionen und entsprechen dem Workflow.

**FINDING V4-059 | INTENTION 6 | ABWEICHUNG**
Benutzer-Anzeige unten links zeigt "Benutzer" statt den echten Namen. Vorher war es "Alexander Retzlaff / Buero". Das hat sich geaendert - moeglicherweise durch den Auth-Wechsel.

**FINDING V4-060 | INTENTION 6 | SIDEBAR-ANALYSE**
Die Sidebar hat 9 Sektionen mit insgesamt ~20 Menuepunkten:
1. ERSTELLEN & ERFASSEN: Projekte, Baustellen, Immobilien
2. KUNDENBERATUNG: Unternehmen & Kontakte, Angebote, Auftraege, Garantien & Inspektionen
3. PLANUNG: Terminfinder, Team einplanen, Ressourcenplaner
4. PROJEKTVORBEREITUNG: (zugeklappt)
5. UMSETZUNG: Teamleitercheck, Baustellenmanager, Auswertung & Abschluss
6. FINANZEN: (zugeklappt)
7. KUNDENPORTAL: (zugeklappt)
8. UNTERNEHMENSSYSTEM: (zugeklappt)
9. SYSTEM & EINSTELLUNGEN: (zugeklappt)

PROBLEM: Die Sektionsnamen folgen NICHT dem 10-Phasen-Workflow. "ERSTELLEN & ERFASSEN" ist kein Phase-Name. Die Sidebar sollte die Phasen-Gruppen widerspiegeln:
- Akquise (Phase 1-4): Objektaufnahme, Angebote, Nachfassen
- Auftrag (Phase 5): Auftragsbestaetigung
- Planung (Phase 6-7): Terminfinder, Team, Ressourcen
- Umsetzung (Phase 8-9): Baustellenmanager, Teamleitercheck
- Abschluss (Phase 10): Abnahme, Garantien


### SZENARIO 11: Immobilien-Uebersicht und Zuordnung (Rolle: Kundenberater)
**Prueft: Intention 3 (Immobilie gehoert zu genau 1 Projekt), Intention 2 (Objektaufnahme liefert Angebotsdaten)**

**FINDING V4-061 | INTENTION 3 | ABWEICHUNG**
4 Immobilien in der Uebersicht, aber nur 1 ist einem Projekt zugeordnet ("Gruener Weg" → "Fassadenreinigung Wohnanlage Gruener Weg"). Die anderen 3 sind "Nicht zugeordnet":
- "An der Saalebahn 8a, Halle (Saale)" - Entwurf, nicht zugeordnet (DOPPELT vorhanden!)
- "Lister Meile 25-31, Hannover" - 1.872m², nicht zugeordnet (sollte Projekt "Lister Meile" zugeordnet sein!)
- Interview-Vorgabe (I3): "Jede Immobilie gehoert zu genau einem Projekt (1:N)"
- IST: 3 von 4 Immobilien sind verwaist
- SOLL: Automatische Zuordnung beim Erstellen aus dem Projekt-Kontext

**FINDING V4-062 | INTENTION 3 | BUG**
"An der Saalebahn 8a" existiert DOPPELT - einmal als "Entwurf" (ohne Flaeche) und einmal als fertig (ohne Flaeche). Das deutet auf einen Auto-Save-Bug hin: Der Wizard hat einen Entwurf gespeichert UND eine fertige Version.

**FINDING V4-063 | INTENTION 2 | POSITIV**
KPI-Karten zeigen: 4 Immobilien, 3.0k m² Reinigungsfaehig, 0 Fotos, 1 Mit Projekt. Die Flaechen-Aggregation funktioniert korrekt.

**FINDING V4-064 | INTENTION 2 | ABWEICHUNG**
Spalte "Fotos" zeigt ueberall 0. Laut Interview-Intention 2 ist die Fotodokumentation ein ZENTRALER Bestandteil der Objektaufnahme. Der ObjektaufnahmeWizard hat zwar Foto-Upload-Felder, aber keine Fotos wurden gespeichert. Das deutet darauf hin, dass der Foto-Upload im Wizard nicht funktioniert oder nicht getestet wurde.


### SZENARIO 12: Einsatzplanung / Team einplanen (Rolle: Projektleiter)
**Prueft: Intention 7 (Automatisierung), Intention 8 (Phase 6-7 Planung)**

**FINDING V4-065 | INTENTION 7 | POSITIV**
Einsatzplanung zeigt 3 Tabs: "Zuege & Mitarbeiter", "Projekt-Zuordnung", "Einsatzkalender". Das ist eine gute Struktur fuer die Planungsphase.

**FINDING V4-066 | INTENTION 7 | POSITIV**
Zuege-System implementiert: Zug Alpha (3 Mitglieder, 3 Projekte), Zug Bravo (3 Mitglieder, 2 Projekte), Zug Charlie (0 Mitglieder). Verfuegbare Mitarbeiter (2 nicht zugeordnet) mit Status "Urlaub". Das entspricht dem FassadenFix-Konzept der Arbeitsgruppen.

**FINDING V4-067 | INTENTION 7 | ABWEICHUNG**
Breadcrumb zeigt "Team einplanen" aber die Sidebar-Sektion heisst "PLANUNG". Der Sidebar-Link "Team einplanen" ist aktiv. ABER: Die URL ist /einsatzplanung, der Breadcrumb sagt "Team einplanen", und die Seite heisst "Einsatzplanung". 3 verschiedene Namen fuer dieselbe Funktion!
- Interview-Vorgabe: Konsistente Benennung
- IST: /einsatzplanung (URL) vs "Team einplanen" (Sidebar) vs "Einsatzplanung" (Seitentitel)
- SOLL: Einheitlich "Einsatzplanung" oder "Team einplanen"

**FINDING V4-068 | INTENTION 7 | ABWEICHUNG**
Header zeigt immer noch "03. Feb 2026" rechts oben. Das Dashboard zeigt korrekt "9. Februar 2026", aber der Header-Bereich ist noch statisch. Inkonsistenz!


### SZENARIO 13: Kundenportal (Rolle: Kunde / Geschaeftsfuehrung)
**Prueft: Intention 5 (Transparenz fuer Kunden)**

**FINDING V4-069 | INTENTION 5 | ABWEICHUNG**
Kundenportal zeigt nur einen Spinner (Ladeanimation) und laedt nicht. Die Seite bleibt leer. Das Kundenportal ist nicht funktional.
- Interview-Vorgabe (I5): "Kunden sollen Fortschritt sehen, Fotos ansehen, Dokumente herunterladen"
- IST: Leere Seite mit Spinner
- SOLL: Projektfortschritt, Vorher/Nachher-Fotos, Dokumente, Kommunikation

**FINDING V4-070 | INTENTION 5 | POSITIV (Sidebar-Struktur)**
Die Sidebar zeigt unter KUNDENPORTAL 3 Unterpunkte: "Portal-Uebersicht", "Dokumente teilen", "Kundenmeldungen". Das sind die richtigen Funktionen laut Interview. Aber sie funktionieren nicht.

### VOLLSTAENDIGE SIDEBAR-ANALYSE (alle Sektionen aufgeklappt)
Aus dem Markdown-Extract der Kundenportal-Seite konnte ich die KOMPLETTE Sidebar-Struktur sehen:

1. **ERSTELLEN & ERFASSEN**: Projekte, Baustellen, Immobilien
2. **KUNDENBERATUNG**: Unternehmen & Kontakte, Angebote, Auftraege, Garantien & Inspektionen
3. **PLANUNG**: Terminfinder, Team einplanen, Ressourcenplaner
4. **PROJEKTVORBEREITUNG**: Uebersicht, Offene Projekte, Ueberfaellige Projekte, Offene Baustellen, Ueberfaellige Baustellen
5. **UMSETZUNG**: Teamleitercheck, Baustellenmanager, Auswertung & Abschluss
6. **FINANZEN**: Finanzuebersicht, Rechnungen, Zahlungen, Budgets
7. **KUNDENPORTAL**: Portal-Uebersicht, Dokumente teilen, Kundenmeldungen
8. **UNTERNEHMENSSYSTEM**: Archiv, Vorlagen & Textbausteine, Materialien & Geraete, Bibliothek
9. **SYSTEM & EINSTELLUNGEN**: Mitarbeiter, HubSpot, Spracheingabe, Einstellungen

**FINDING V4-071 | INTENTION 6 | KRITISCHE ANALYSE**
Die Sidebar hat 9 Sektionen mit 31 Menuepunkten. Das ist VIEL ZU VIEL fuer ein MVP. Laut Interview-Intention 6 sollte die Navigation dem 10-Phasen-Workflow folgen. Stattdessen folgt sie einer funktionalen Gruppierung, die den Workflow NICHT abbildet.

Konkrete Probleme:
1. "ERSTELLEN & ERFASSEN" ist kein Workflow-Schritt - es ist eine Aktion
2. "Baustellen" erscheint unter "ERSTELLEN & ERFASSEN" UND unter "UMSETZUNG" (Baustellenmanager)
3. "PROJEKTVORBEREITUNG" hat 5 Unterpunkte, die alle Filter-Ansichten sind (Offene/Ueberfaellige) - das gehoert nicht in die Navigation
4. "UNTERNEHMENSSYSTEM" mit Archiv, Vorlagen, Materialien, Bibliothek - das sind Verwaltungsfunktionen, keine Workflow-Schritte
5. "Spracheingabe" unter SYSTEM ist ein Feature, kein Menuepunkt

