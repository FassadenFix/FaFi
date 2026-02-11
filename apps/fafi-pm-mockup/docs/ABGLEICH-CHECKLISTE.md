# Abgleich-Checkliste: Interview-Analyse → todo.md + Maßnahmenplan

Jeder einzelne Punkt aus der Interview-Analyse (pasted_content.txt) wird hier nummeriert und gegen todo.md und Maßnahmenplan geprüft.

---

## Abschnitt 2: PROJEKTE

### 2.3 Navigation
- [ ] P-NAV-01: Sidebar-Sektion "Erstellen & Erfassen" umbenennen (irreführend, suggeriert einmalige Aktion)
- [ ] P-NAV-02: Projekte als zentraler Einstiegspunkt mit Lifecycle-Steuerung (kontextabhängige Aktionen je Phase)

### 2.4 ProjektWizard
- [ ] P-WIZ-01: Automatische Phasensteuerung fehlt (Angebot erstellt → Phase auto-wechseln)
- [ ] P-WIZ-02: Angebot versendet → Phase auto-wechseln
- [ ] P-WIZ-03: Auftrag gewonnen → Phase auto-wechseln

---

## Abschnitt 3: IMMOBILIEN

### 3.1 Grundgedanke
- [ ] I-ARCH-01: Immobilie M:N zu Projekten (Zwischentabelle statt 1:N)
- [ ] I-ARCH-02: Immobilie eigenes companyId-Feld (Eigentümer wechselbar)
- [ ] I-ARCH-03: Immobilie als eigenständiges Asset mit eigenem Lebenszyklus + Historie

### 3.2 Seitenbezeichnungen
- [ ] I-LABEL-01: "Eingangsseite" → "Frontseite" global ersetzen (26 Referenzen in 11 Dateien)

### 3.3 Wizard-Seiten (Stammdaten - Seite 0)
- [ ] I-WIZ-01: Feld "Wer war noch dabei?" (Hausmeister, techn. Mitarbeiter, Eigentümervertreter, Mieter)
- [ ] I-WIZ-02: Feld "Wann wird Entscheidung getroffen?"
- [ ] I-WIZ-03: Feld "Wer trifft die Entscheidung?"
- [ ] I-WIZ-04: Feld "Besondere Absprache, Infos?"

### 3.3 Wizard-Seiten (Technische Aufnahme - Seite 1, PRO SEITE)
- [ ] I-WIZ-05: Wasseranschluss-Feld (Wo, Welcher, Wieviel Zoll?)
- [ ] I-WIZ-06: Reinigungsmittelauswahl-Feld

### 3.3 Wizard-Seiten (Kaufmännische Aufnahme - Seite 2)
- [ ] I-WIZ-07: Kaufmännische Wizard-Seite komplett (fehlt im aktuellen Wizard)
- [ ] I-WIZ-08: Feld "Welche Seiten sollen ins Angebot?"
- [ ] I-WIZ-09: Feld "Umsetzungstermin (KO-Termine, keine Wunschtermine)"
- [ ] I-WIZ-10: Feld "Kann Wohnung gestellt werden?"
- [ ] I-WIZ-11: Feld "Kennenlern-Angebot?"
- [ ] I-WIZ-12: Feld "Frühbucher-Rabatt?"
- [ ] I-WIZ-13: Feld "Einkaufsgemeinschaft?"
- [ ] I-WIZ-14: Feld "Marketinggeeignet?"

### 3.5 Navigation
- [ ] I-NAV-01: Immobilien-Übersicht von Objektaufnahme-Format zu Listenformat ändern (Loom)
- [ ] I-NAV-02: Zuordnungsinformationen anzeigen (Baustelle, Projekt, Unternehmen, Mitarbeiter) (Loom)

---

## Abschnitt 4: ANGEBOTE

### 4.7 Navigation
- [ ] A-NAV-01: Direkter Workflow-Übergang Projekt → Angebot (Button in ProjektDetail "Angebot für dieses Projekt erstellen")

### 4.8 AngebotWizard
- [ ] A-WIZ-01: Keine Doppeleingabe – Daten aus Objektaufnahme übernehmen statt neu eingeben
- [ ] A-WIZ-02: Frühbucher dynamisch berechnen (aktuell hardcoded 2024/2025)
- [ ] A-WIZ-03: Übernachtung automatisch basierend auf Entfernung vorschlagen (>100km)

---

## Abschnitt 5: BAUSTELLEN

### 5.2 Navigation
- [ ] B-NAV-01: Doppelte Baustellen-Einträge zusammenführen (Baustellen + Baustellenmanager)
- [ ] B-NAV-02: Klare Unterscheidung Desktop-Verwaltung vs. Mobile Vor-Ort-Ansicht
- [ ] B-NAV-03: Baustellen-Übersicht Listenformat wie Projekte (Loom)
- [ ] B-NAV-04: Filterung nach Phase/Status in Baustellen-Übersicht (Loom)

### 5.3 Wizard-Klickstrecken
- [ ] B-WIZ-01: Vorher-Dokumentation als PFLICHT-Gate (Arbeitstag beginnen erst nach vollständiger Doku)
- [ ] B-WIZ-02: Tagesablauf-Wizard strukturieren (Morgen-/Abendmeldung mit Logbuch)
- [ ] B-WIZ-03: Ereignismelder als eigenständige "on top"-Funktion implementieren
- [ ] B-WIZ-04: Abschlussfrage "Wird Baustellenplanung zeitlich beibehalten?" MORGENS UND ABENDS
- [ ] B-WIZ-05: Bautagebuch-Eintrag automatisch bei Abschlussmeldung (Bereiche + Witterung 9/13/17 Uhr)
- [ ] B-WIZ-06: Foto-Upload kontextbezogene Benennung (Baustellenlogbuch_Unternehmen_Adresse_Datum_...)

---

## Abschnitt 6: KUNDENPORTAL

- [ ] K-PORT-01: Ampel-System im Frontend aktivieren (Backend existiert, Frontend nutzt es nicht)
- [ ] K-PORT-02: AG/AN-Aufgaben unterscheiden (Auftraggeber vs. Auftragnehmer)
- [ ] K-PORT-03: Dokumenten-Karte mit Auflistung und Anzahl, Durchklick zu Einzeldokumenten
- [ ] K-PORT-04: Aktuelles Projekt direkt in Detailansicht öffnen auf Startseite

---

## Abschnitt 7: NAVIGATION GESAMT

### 7.2 Konzeptionelle Probleme
- [ ] NAV-01: "Erstellen & Erfassen" irreführend → umbenennen (= P-NAV-01)
- [ ] NAV-02: Doppelte Baustellen-Einträge (= B-NAV-01)
- [ ] NAV-03: "Projektvorbereitung" vs. "Planung" überlappen sich → zusammenführen oder differenzieren
- [ ] NAV-04: "Offene Projekte" und "Überfällige Projekte" sind Filter-Ansichten, keine eigenständigen Menüpunkte
- [ ] NAV-05: Hierarchische CRM-Darstellung (Unternehmen → Kontakte → Projekte) fehlt
- [ ] NAV-06: Sidebar-Reihenfolge folgt nicht dem 10-Phasen-Workflow

---

## Abschnitt 8: ABWEICHUNGSTABELLE (14 Punkte)

- [ ] ABW-01: Immobilie 1:N statt M:N (= I-ARCH-01) – ARCHITEKTUR
- [ ] ABW-02: Kein companyId bei Immobilie (= I-ARCH-02) – ARCHITEKTUR
- [ ] ABW-03: Frühbucher hardcoded (= A-WIZ-02) – KRITISCH
- [ ] ABW-04: Übernachtung manuell (= A-WIZ-03) – MITTEL
- [ ] ABW-05: Vorher-Doku kein Gate (= B-WIZ-01) – KRITISCH
- [ ] ABW-06: Ereignismelder fehlt (= B-WIZ-03) – HOCH
- [ ] ABW-07: Ampel nicht im Portal (= K-PORT-01) – HOCH
- [ ] ABW-08: AG/AN-Aufgaben fehlen (= K-PORT-02) – HOCH
- [ ] ABW-09: Kaufmännische Wizard-Seite (= I-WIZ-07) – MITTEL
- [ ] ABW-10: Sidebar-Struktur (= NAV-01 bis NAV-06) – KONZEPTIONELL
- [ ] ABW-11: Baustellen-Listenformat (= B-NAV-03) – MITTEL
- [ ] ABW-12: Immobilien-Listenformat (= I-NAV-01) – MITTEL
- [ ] ABW-13: Phasenübergänge automatisch (= P-WIZ-01/02/03) – KRITISCH
- [ ] ABW-14: "Eingangsseite" global (= I-LABEL-01) – KRITISCH

---

**Gesamt: 48 eindeutige Punkte (nach Deduplizierung der Abweichungstabelle: 34 unique)**
