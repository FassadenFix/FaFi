# FaFi PM – Intentionsbasierter Maßnahmenplan

**Datum:** 09. Februar 2026
**Grundlage:** 8 Kern-Intentionen aus 4 Interview-Sessions, 1 Loom-Feedback, bestätigt durch Nutzer
**Methode:** Jede Maßnahme ist einer Kern-Intention zugeordnet und bewahrt den Sinn und die Absicht der Original-Antworten

---

## Leitsatz

> Die Anweisungen und der konzeptionelle Ansatz des Nutzers haben stets Vorrang. Das Verständnis des übergeordneten Ziels und des Kontexts ist entscheidend.

---

## MASSNAHMENBLOCK A: Immobilie als eigenständiges Asset (Intention 1)

**Kern-Intention:** Die Immobilie ist das zentrale Wirtschaftsobjekt. Sie existiert unabhängig von Projekten und Unternehmen. Ein Gebäude bleibt dasselbe Gebäude, egal wem es gehört oder in welchem Projekt es gerade ist.

**Nutzer-Zitat:** *"Immobilie muss einzeln betrachtet werden können. z.B. Verkauf der Unterlagen dürfen nicht für Eigentümer oder Projekt orientiert sein (Bsp. Garantieurkunde)"*

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| A1-01 | Datenmodell: `properties` um `companyId`-Feld erweitern (aktueller Eigentümer) | *"Kann Eigentümer wechseln"* – Immobilie braucht eigene Eigentümer-Zuordnung, unabhängig vom Projekt | 1h |
| A1-02 | Datenmodell: M:N-Zwischentabelle `projectProperties` statt 1:N | *"Kann zu mehreren Projekten gehören (über die Jahre)"* – Dasselbe Gebäude wird alle 5 Jahre erneut gereinigt | 3h |
| A1-03 | Immobilien-Listenansicht: Aktuellen Eigentümer (Unternehmen) und zugeordnete Projekte anzeigen | *"Immobilie muss einzeln betrachtet werden können"* – Eigenständige Ansicht, nicht nur als Unterpunkt | 2h |
| A1-04 | Immobilien-Detailansicht: Projekt-Historie anzeigen (welche Projekte über die Jahre) | *"Historie bleibt erhalten"* – Lebenszyklus über Projekte hinweg sichtbar | 2h |
| A1-05 | Garantieurkunde: An Immobilie gebunden, nicht an Projekt oder Unternehmen | *"Garantieurkunde darf nicht eigentümer- oder projektorientiert sein"* – Garantie gehört zum Gebäude | 1h |

---

## MASSNAHMENBLOCK B: Objektaufnahme = Datenbasis (Intention 2 + 3)

**Kern-Intention:** Die Objektaufnahme erfasst den IST-Zustand. Das Angebot ist nur eine Ableitung. Keine Doppeleingabe. 3 logische Ebenen: WER (Stammdaten) → WAS (Technisch, pro Seite) → WIE (Kaufmännisch).

**Nutzer-Zitat:** *"Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."*

### B.1 Stammdaten-Erweiterung (Seite 0 – WER)

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| B1-01 | Feld "Wer war noch dabei?" hinzufügen (Checkbox-Gruppe: Hausmeister, techn. Mitarbeiter, Eigentümervertreter, Mieter) | Aus PDF-Vorlage Seite 0: *"Wer war noch zur Objektaufnahme ggf. dabei?"* | 1h |
| B1-02 | Feld "Wann wird Entscheidung getroffen?" (Datepicker) | Aus PDF-Vorlage Seite 0: *"Wann wird Entscheidung getroffen?"* | 30min |
| B1-03 | Feld "Wer trifft die Entscheidung?" (Textfeld) | Aus PDF-Vorlage Seite 0: *"Wer trifft die Entscheidung?"* | 30min |
| B1-04 | Feld "Besondere Absprache, Infos?" (Textarea) | Aus PDF-Vorlage Seite 0: *"Besondere Absprache, Infos?"* | 30min |

### B.2 Technische Aufnahme pro Seite (Seite 1 – WAS)

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| B2-01 | Feld "Wasseranschluss" pro Gebäudeseite (Wo? Welcher? Wieviel Zoll?) | Aus PDF-Vorlage Seite 1: *"Wasseranschluss (Wo, Welcher, Wieviel Druck)"* | 1h |
| B2-02 | Feld "Reinigungsmittelauswahl" pro Gebäudeseite (Select/Dropdown) | Aus PDF-Vorlage Seite 1: *"Reinigungsmittelauswahl? (Für Anwendungstechnik)"* | 1h |

### B.3 Kaufmännische Objektaufnahme (Seite 2 – WIE) – KOMPLETT NEU

**Nutzer-Zitat:** *"Vorsicht: Wir wollen kein Wunschkonzert signalisieren. Wir wollen wissen ob es ggf. KO-Termine bei der Planung gibt"*

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| B3-01 | Kaufmännische Wizard-Seite als neuen Step nach den 4 Gebäudeseiten hinzufügen | Aus PDF-Vorlage: Seite 2 "Kaufmännische Objektaufnahme" ist eine eigenständige Ebene | 4h |
| B3-02 | Feld "Welche Seiten sollen ins Angebot?" (Checkbox pro erfasste Seite) | *"Welche Seiten sollen ins Angebot?"* – Brücke zur Angebotserstellung | 30min |
| B3-03 | Feld "Umsetzungstermin" (Datepicker) mit Hinweis "KO-Termine, keine Wunschtermine" | *"Wir wollen kein Wunschkonzert signalisieren"* – Label muss klar machen: Nur harte Deadlines | 30min |
| B3-04 | Feld "Kann Wohnung gestellt werden?" (Ja/Nein Toggle) | Aus PDF-Vorlage Seite 2 | 15min |
| B3-05 | Feld "Kennenlern-Angebot?" (Ja/Nein Toggle) | Aus PDF-Vorlage Seite 2 | 15min |
| B3-06 | Feld "Frühbucher-Rabatt?" (Ja/Nein Toggle + automatische Berechnung) | Aus PDF-Vorlage Seite 2: *"Frühbucher-Rabatt? → wenn ja, welcher?"* | 30min |
| B3-07 | Feld "Einkaufsgemeinschaft?" (Ja/Nein Toggle + Textfeld für Details) | Aus PDF-Vorlage Seite 2: *"Einkaufsgemeinschaft? → wenn ja, mit welchem Unternehmen + Deal"* | 30min |
| B3-08 | Feld "Marketinggeeignet?" (Ja/Nein Toggle) + automatische Info an Marketing | Aus PDF-Vorlage Seite 2: *"Marketinggeeignet? → wenn ja, Info an Marketingabteilung mit Infotext automatisiert"* | 30min |

### B.4 Datenfluss Objektaufnahme → Angebot (Keine Doppeleingabe)

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| B4-01 | AngebotWizard: Daten aus Objektaufnahme übernehmen statt neu eingeben | *"Der Kundenberater soll KEINE neuen Daten eingeben, sondern nur auswählen"* | 3h |
| B4-02 | Button "Angebot für dieses Projekt erstellen" in ProjektDetail | Direkter Workflow-Übergang, Daten werden automatisch geladen | 1h |

---

## MASSNAHMENBLOCK C: Baustelle als Tagesablauf-App (Intention 4)

**Kern-Intention:** Der Baustellenmanager ist eine Tagesablauf-App mit strikter Pflicht-Dokumentation als Gate. Vorher-Doku → Morgen-Meldung → Ereignismelder (on top) → Abend-Meldung → Bautagebuch.

**Nutzer-Zitat:** *"Erst nach vollständiger Dokumentation kann Baustelle gestartet werden"*

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| C-01 | Desktop vs. Mobile klar differenzieren: /baustellen = Verwaltung, /mobile = Vor-Ort-App | *"Teamleiter bekommt Projekt zugewiesen"* – Desktop für Planung, Mobile für Ausführung | 1h |
| C-02 | Vorher-Dokumentation als Gate implementieren: "Arbeitstag beginnen" erst nach Doku aktiv | *"PFLICHT vor Baustellenstart"*, *"Erst nach vollständiger Dokumentation kann Baustelle gestartet werden"* | 3h |
| C-03 | Abschlussfrage "Wird Planung beibehalten?" MORGENS UND ABENDS stellen | *"Diese Frage soll MORGENS UND ABENDS gestellt werden"* – Nicht nur abends! | 1h |
| C-04 | Teamstruktur: 4 Personen (TL+AT1 als 2er-Team 1, PL+AT2 als 2er-Team 2) in Zuweisung abbilden | *"Ein Team besteht aus 4 Personen"* – Zuweisung an Teamleiter, der das Projekt bekommt | 3h |
| C-05 | Teamleiter bekommt Projekt zugewiesen, Projekt = mehrere Baustellen (= Immobilien) | *"Teamleiter bekommt das Projekt zugewiesen"*, *"Projekt besteht aus mehreren Baustellen"* | 2h |
| C-06 | Ereignismelder "on top" – jederzeit verfügbar, nicht nur im Logbuch | *"Ereignismelder 'on top'"* – Floating Action Button oder ähnlich, immer erreichbar | 2h |
| C-07 | Doppelte Baustellen-Einträge in Sidebar zusammenführen oder klar differenzieren | "Baustellen" und "Baustellenmanager" sind konzeptionell dasselbe Thema | 2h |

---

## MASSNAHMENBLOCK D: Kundenportal als Arbeitsplattform (Intention 5)

**Kern-Intention:** Das Portal ist keine passive Info-Seite, sondern eine aktive Arbeitsplattform. Ampel statt Zeitstrahl. AG/AN-Aufgaben klar getrennt. Kunde = Unternehmen.

**Nutzer-Zitat:** *"Ziel: Kunde nutzt Portal als Workplattform, sieht was noch fehlt und von wem"*

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| D-01 | Startseite: Aktuelles Projekt direkt in Detailansicht (nicht erst Projektliste) | *"Auf der Startseite wird das AKTUELLE Projekt direkt in der Detailansicht geöffnet"* | 2h |
| D-02 | Ampel-System aus Backend ins Portal-Frontend integrieren | *"KEIN Zeitstrahl, sondern AMPEL-System (Grün/Gelb/Rot) pro Phase"* | 2h |
| D-03 | Jede Baustelle mit eigener Ampel anzeigen | *"Jede Baustelle hat eigene Ampel"* | 1h |
| D-04 | Aufgaben: Feld "Verantwortungsseite" (Auftraggeber/Auftragnehmer) hinzufügen | *"WICHTIG: Unterscheidung Aufgaben auf AUFTRAGGEBERSEITE vs. AUFTRAGNEHMERSEITE"* | 1h |
| D-05 | Dokumente auf 3 Ebenen: Projekt / Baustelle / Allgemein | *"Projektbezogene, Baustellenbezogene, Allgemeine FassadenFix-Dokumente"* | 2h |

---

## MASSNAHMENBLOCK E: Navigation folgt dem Workflow (Intention 6)

**Kern-Intention:** Die Sidebar muss den 10-Phasen-Workflow widerspiegeln, nicht eine willkürliche Gruppierung. Der Nutzer soll geführt werden.

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| E-01 | "Erstellen & Erfassen" umbenennen → "Projektmanagement" oder ähnlich | Suggeriert einmalige Aktion, Projekte werden aber über gesamten Lifecycle verwaltet | 2h |
| E-02 | "Offene Projekte" und "Überfällige Projekte" als Filter in Projekte-Seite integrieren, nicht als Menüpunkte | Das sind Filter-Ansichten, keine eigenständigen Funktionen | 2h |
| E-03 | Sidebar-Reihenfolge an 10-Phasen-Workflow anpassen | Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss | 3h |
| E-04 | "Projektvorbereitung" vs. "Planung" zusammenführen oder klar differenzieren | Thematische Überlappung, verwirrend für Nutzer | 2h |
| E-05 | CRM-Darstellung: Hierarchische Ansicht Unternehmen → Kontakte → Projekte | *"Der Kunde ist stets das UNTERNEHMEN"* – Unternehmen als übergeordnete Entität | 3h |

---

## MASSNAHMENBLOCK F: Preislogik korrekt abbilden (Intention 7 + 8)

**Kern-Intention:** Frühbucher-Rabatte sind dynamisch (relativ zur Saison). Übernachtung wird automatisch berechnet (Entfernung).

| ID | Maßnahme | Begründung aus Interview | Aufwand |
|---|---|---|---|
| F-01 | Frühbucher-Daten dynamisch berechnen (aktuelles/nächstes Saisonjahr) | Hardcoded "31.12.2024" → muss relativ zur aktuellen Saison sein | 1h |
| F-02 | Übernachtung automatisch vorschlagen basierend auf Entfernung (>100km oder >50km + >1 Tag) | *"Entfernung > 100 km → Übernachtung"* – Automatischer Vorschlag, manuell überschreibbar | 2h |

---

## MASSNAHMENBLOCK G: Sonstige bestätigte Korrekturen

| ID | Maßnahme | Begründung | Aufwand |
|---|---|---|---|
| G-01 | "Eingangsseite" → "Frontseite" global ersetzen (26 Stellen im Code) | Loom-Feedback: *"Frontseite: Immer die Seite wo die Hauseingänge sind"* | 30min |

---

## PRIORISIERUNG NACH GESCHÄFTSWERT

| Priorität | Block | Intention | Maßnahmen | Aufwand |
|---|---|---|---|---|
| **P0 – Sofort** | G | Korrekturen | 1 | 30min |
| **P0 – Sofort** | F | Preislogik | 2 | 3h |
| **P1 – Hoch** | B.3 | Kaufmännische Wizard-Seite | 8 | ~7h |
| **P1 – Hoch** | B.1+B.2 | Stammdaten + Technische Felder | 6 | ~4.5h |
| **P1 – Hoch** | E | Navigation/Sidebar | 5 | ~12h |
| **P2 – Mittel** | A | Immobilie als Asset | 5 | ~9h |
| **P2 – Mittel** | B.4 | Datenfluss Objektaufnahme→Angebot | 2 | ~4h |
| **P2 – Mittel** | C | Baustelle Tagesablauf | 7 | ~14h |
| **P3 – Später** | D | Kundenportal | 5 | ~8h |
| | | **GESAMT** | **41** | **~62h** |

---

## ABHÄNGIGKEITEN

```
G-01 (Frontseite) ──────────────────────────────────────────── keine Abhängigkeit
F-01 (Frühbucher) ──────────────────────────────────────────── keine Abhängigkeit
F-02 (Übernachtung) ────────────────────────────────────────── keine Abhängigkeit

B1-01..B1-04 (Stammdaten) ──────────────────────────────────── keine Abhängigkeit
B2-01..B2-02 (Technisch) ──────────────────────────────────── keine Abhängigkeit
B3-01..B3-08 (Kaufmännisch) ────────────────────────────────── hängt ab von B1+B2 (Wizard-Struktur)

A1-01 (companyId) ──────────────────────────────────────────── keine Abhängigkeit
A1-02 (M:N) ────────────────────────────────────────────────── hängt ab von A1-01
A1-03..A1-05 ───────────────────────────────────────────────── hängt ab von A1-01 + A1-02

B4-01 (Datenfluss) ─────────────────────────────────────────── hängt ab von B3 (kaufm. Daten)
B4-02 (Button ProjektDetail) ───────────────────────────────── keine Abhängigkeit

E-01..E-05 (Navigation) ────────────────────────────────────── keine Abhängigkeit (UI-only)

C-01..C-07 (Baustelle) ─────────────────────────────────────── teilweise abhängig von A1-02 (M:N)

D-01..D-05 (Kundenportal) ──────────────────────────────────── abhängig von C (Baustellen-Daten)
```

---

*Erstellt am 09.02.2026 – Intentionsbasiert, ausschließlich auf bestätigten Interview-Erkenntnissen*
