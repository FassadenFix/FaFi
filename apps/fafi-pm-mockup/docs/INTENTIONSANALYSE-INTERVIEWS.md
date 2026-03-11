# Intentionsanalyse: Was wollte der Nutzer wirklich?

**Methode:** Extraktion der übergeordneten Intentionen aus 4 Interview-Sessions, 1 Loom-Feedback-Session und 11 Projektdokumenten. Fokus auf den **Sinn und die Absicht** hinter den Antworten, nicht nur auf einzelne Feature-Punkte.

**Quellen (chronologisch):**
1. `KONTEXT_ANALYSE_ANGEBOTSERSTELLUNG.md` – Meine Fragen VOR dem Interview
2. `INTERVIEW_ERKENNTNISSE.md` – Interview 1: Angebotserstellung (bestätigt)
3. `objektaufnahme-analyse.md` + `objektaufnahme-grundgedanke.md` – Interview 2: Objektaufnahme (aus PDF)
4. `interview-notes-baustellenmanager.md` – Interview 3: Baustellenmanager
5. `interview-notes-kundenportal.md` – Interview 4: Kundenportal
6. `loom-feedback-todo.md` – Loom-Korrektur-Session
7. `INTERVIEW-REVALIDIERUNG-BERICHT.md` – Nachprüfung aller Erkenntnisse

---

## INTENTION 1: IMMOBILIE ALS EIGENSTÄNDIGES, UNABHÄNGIGES ASSET

### Was der Nutzer gesagt hat:
> "Objektaufnahme = Immobilie bzw. Gebäude (abrechenbare Wirtschaftseinheit)"
> "Immobilie muss einzeln betrachtet werden können"
> "z.B. Verkauf der Unterlagen dürfen nicht für Eigentümer oder Projekt orientiert sein (Bsp. Garantieurkunde)"
> "IMMOBILIE (zentrales Asset mit eigenem Lebenszyklus) – Kann zu mehreren Projekten gehören (über die Jahre) – Kann Eigentümer wechseln – Historie bleibt erhalten"

### Die tiefere Intention:
Die Immobilie ist das **zentrale Wirtschaftsobjekt** des gesamten Geschäftsmodells. Sie existiert **unabhängig** von Projekten, Unternehmen und Kontakten. Ein Gebäude in der Musterstraße 5 bleibt dasselbe Gebäude, egal ob es 2024 der WBG Nordstadt gehört und 2027 der Städtischen Wohnungsbau. Die Garantieurkunde gehört zur **Immobilie**, nicht zum Kunden. Das bedeutet:

- **M:N-Beziehung zu Projekten** ist keine technische Spielerei, sondern bildet die Realität ab: Dasselbe Gebäude wird alle 5 Jahre erneut gereinigt → neues Projekt, selbe Immobilie
- **Eigenes companyId-Feld** ist nötig, weil der aktuelle Eigentümer sich ändern kann, ohne dass die Immobilie-Daten verloren gehen
- **Objekt/Immobilie stets KOMPLETT aufnehmen** – alle 4 Seiten, immer, auch wenn eine Seite nicht reinigungsfähig ist → die Fläche wird trotzdem erfasst (für die Gesamtdokumentation)

### Implikation für Navigation & Wizards:
- "Immobilien" verdient einen **prominenten eigenen Menüpunkt**, nicht nur als Unterpunkt von Projekten
- Der ObjektaufnahmeWizard muss die Immobilie als **eigenständiges Objekt** behandeln, das einem Projekt **zugeordnet** wird (nicht "gehört")
- Die Immobilien-Listenansicht muss zeigen: Welchem Unternehmen gehört sie AKTUELL? Welchen Projekten war sie zugeordnet?

---

## INTENTION 2: OBJEKTAUFNAHME = DATENBASIS, ANGEBOT = ABLEITUNG

### Was der Nutzer gesagt hat:
> "Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."
> "Objektaufnahme = Erfassung des IST-Zustands (was ist da?)"
> "Angebotserstellung = Ableitung der LÖSUNG (was brauchen wir?)"

### Die tiefere Intention:
Es gibt eine **strikte Trennung** zwischen Datenerfassung (Objektaufnahme) und Datenverwendung (Angebot). Der Kundenberater soll im Angebots-Wizard **KEINE neuen Daten eingeben**, sondern nur aus bereits erfassten Daten **auswählen**. Das ist keine UX-Präferenz, sondern ein **Geschäftsprinzip**: Die Qualität des Angebots hängt von der Qualität der Objektaufnahme ab. Wenn die Objektaufnahme vollständig ist, "schreibt sich das Angebot fast von selbst".

### Implikation für Wizards:
- Der AngebotWizard darf **keine Felder enthalten, die bereits in der Objektaufnahme erfasst wurden** (Reinigungsmittel, Besonderheiten, Sperrungen)
- Stattdessen: Daten aus der Objektaufnahme **anzeigen und auswählen** (Checkbox: "Diese Seite ins Angebot aufnehmen?")
- Die kaufmännische Wizard-Seite im ObjektaufnahmeWizard ist der Ort, wo die **Brücke zum Angebot** geschlagen wird ("Welche Seiten sollen ins Angebot?", "Kennenlern-Angebot?", "Frühbucher?")

---

## INTENTION 3: WIZARD-SEITEN DER OBJEKTAUFNAHME = 3 LOGISCHE EBENEN

### Was der Nutzer gesagt hat (aus PDF-Analyse):
> **Seite 0: Stammdaten** – Adresse, HubSpot, Ansprechpartner, "Wer war noch dabei?", "Wann Entscheidung?", "Wer entscheidet?", "Besondere Absprache?"
> **Seite 1: Technische Objektaufnahme** – PRO SEITE: Aufmaß, Bilder, Zustand, Zuwegung, Bühne, Sperrungen, Besonderheiten, Wasseranschluss, Reinigungsmittelauswahl
> **Seite 2: Kaufmännische Objektaufnahme** – Welche Seiten ins Angebot?, Umsetzungstermin (KO-Termine!), Wohnung gestellt?, Kennenlern-Angebot?, Frühbucher?, Einkaufsgemeinschaft?, Marketinggeeignet?

### Die tiefere Intention:
Die 3 Ebenen spiegeln **3 verschiedene Perspektiven** wider:
1. **WER** (Stammdaten) – Wer ist beteiligt, wer entscheidet, was wurde besprochen?
2. **WAS** (Technisch) – Was ist der IST-Zustand des Gebäudes, pro Seite?
3. **WIE** (Kaufmännisch) – Wie soll das Angebot aussehen, welche Konditionen?

Die kaufmännische Seite ist dabei **besonders wichtig**, weil sie die Brücke zwischen Objektaufnahme und Angebot bildet. Der Kundenberater trifft hier vor Ort die **kaufmännischen Vorentscheidungen**, die dann im Angebot nur noch bestätigt werden müssen.

### Besonders wichtig – "Umsetzungstermin":
> "Vorsicht: Wir wollen kein Wunschkonzert signalisieren. Wir wollen wissen ob es ggf. KO-Termine bei der Planung gibt, wie weitere Bauarbeit o.ä."

Das ist KEIN Wunschtermin des Kunden, sondern die Frage: **Gibt es harte Deadlines**, die die Planung beeinflussen? (z.B. "Ab Mai wird das Dach saniert, also muss die Fassade vorher fertig sein")

### Implikation für den ObjektaufnahmeWizard:
- Die aktuelle Implementierung hat Stammdaten + 4 Gebäudeseiten + Zusammenfassung
- Es **fehlt komplett**: Die kaufmännische Seite (Seite 2 aus der PDF)
- Die Stammdaten-Seite muss um 4 Felder erweitert werden (Wer dabei?, Entscheidung wann/wer?, Besondere Absprache?)
- Pro Gebäudeseite fehlen: Wasseranschluss-Details und Reinigungsmittelauswahl

---

## INTENTION 4: BAUSTELLE = TÄGLICHER ARBEITSPLATZ MIT PFLICHT-DOKUMENTATION

### Was der Nutzer gesagt hat:
> "Vorher-Dokumentation (PFLICHT vor Baustellenstart)"
> "Als Wizard-Strecke (wie in PDF-Formularen vorgesehen)"
> "Jede Immobilie/Baustelle innerhalb des Projektes einzeln vorher dokumentieren"
> "Erst nach vollständiger Dokumentation kann Baustelle gestartet werden"
> "Abschlussfrage: Wird Baustellenplanung zeitlich beibehalten? → Diese Frage soll MORGENS UND ABENDS gestellt werden"

### Die tiefere Intention:
Die Baustelle ist der **tägliche Arbeitsplatz** des Teams. Der Baustellenmanager ist eine **Tagesablauf-App**, nicht ein Verwaltungstool. Der Ablauf ist strikt:

1. **VOR dem ersten Arbeitstag**: Vorher-Dokumentation als Pflicht-Gate (Fotos, Zustand, Checkliste)
2. **Jeden Morgen**: "Arbeitstag beginnen" + Frage "Wird Planung beibehalten?"
3. **Während des Tages**: Ereignismelder "on top" (jederzeit verfügbar für Vorkommnisse)
4. **Jeden Abend**: "Arbeitstag beenden" + Logbuch-Ergebnisse + Frage "Wird Planung beibehalten?" + Bautagebuch automatisch

Die Vorher-Dokumentation ist ein **GATE** – ohne sie kann der "Arbeitstag beginnen"-Button nicht gedrückt werden. Das ist keine optionale Funktion, sondern eine **Geschäftsregel**.

### Teamstruktur (bestätigt):
> "Ein Team besteht aus 4 Personen: Teamleiter + AT1 (2er-Team 1) + Projektleiter/Stellvertreter + AT2 (2er-Team 2)"
> "Teamleiter bekommt das Projekt zugewiesen"
> "Projekt besteht aus mehreren Baustellen (= Immobilien)"
> "Begriffe 'Teamleiter' und 'Projektleiter' sind aktuell missverständlich, nicht zu viel hineininterpretieren"

### Implikation für Navigation & Wizards:
- "Baustellen" in der Sidebar muss die **Desktop-Verwaltungssicht** sein (Übersicht, Planung, Zuweisung)
- "Baustellenmanager" muss die **Mobile-Vor-Ort-Sicht** sein (Tagesablauf, Fotos, Logbuch)
- Die Vorher-Dokumentation braucht einen eigenen Wizard mit Gate-Logik
- Der Tagesablauf (Morgen/Abend) braucht einen strukturierten Wizard
- Der Ereignismelder muss **jederzeit** verfügbar sein ("on top"), nicht nur im Logbuch

---

## INTENTION 5: KUNDENPORTAL = ARBEITSPLATTFORM MIT AMPEL-SYSTEM

### Was der Nutzer gesagt hat:
> "Der Kunde ist stets das UNTERNEHMEN, nicht der Kontakt/Ansprechpartner"
> "Jedes Unternehmen hat EINEN zentralen Zugang zum Portal"
> "KEIN Zeitstrahl/Fortschrittsbalken, sondern AMPEL-System (Grün/Gelb/Rot) pro Phase"
> "Auf der Startseite wird das AKTUELLE Projekt direkt in der Detailansicht geöffnet"
> "WICHTIG: Unterscheidung Aufgaben auf AUFTRAGGEBERSEITE (Kunde) vs. AUFTRAGNEHMERSEITE (FassadenFix)"
> "Ziel: Kunde nutzt Portal als Workplattform, sieht was noch fehlt und von wem"
> "Mieter/Bewohner bekommen ein separates eigenes Portal (später, nicht jetzt)"

### Die tiefere Intention:
Das Kundenportal ist **keine passive Informationsseite**, sondern eine **aktive Arbeitsplattform**. Der Kunde soll:
- Sofort sehen, **wo sein Projekt steht** (Ampel, nicht Zeitstrahl)
- Sofort sehen, **was ER noch tun muss** (Aufgaben Auftraggeber-Seite)
- Sofort sehen, **was FassadenFix tut** (Aufgaben Auftragnehmer-Seite)
- **Jede Baustelle einzeln** mit eigener Ampel verfolgen können

Die Ampel ist bewusst gewählt statt eines Zeitstrahls, weil sie **sofort verständlich** ist (Grün = alles gut, Gelb = Achtung, Rot = dringend) – passend zur Zielgruppe "Handwerker und Praktiker".

### Implikation:
- Kundenportal-Startseite zeigt das aktuelle Projekt **direkt in Detailansicht** (nicht erst Projektliste)
- Aufgaben brauchen ein Feld "Verantwortungsseite" (Auftraggeber/Auftragnehmer)
- Ampel-System aus dem Backend muss ins Frontend integriert werden
- Dokumente auf 3 Ebenen: Projekt / Baustelle / Allgemein

---

## INTENTION 6: NAVIGATION MUSS DEM 10-PHASEN-WORKFLOW FOLGEN

### Was aus den Interviews hervorgeht:
Der 10-Phasen-Workflow ist das **Rückgrat** des gesamten Systems:
1. Objektaufnahme → 2. Angebot erstellt → 3. Angebot versendet → 4. Nachfassen → 5. Auftrag gewonnen → 6. Planung → 7. Vorbereitung → 8. Durchführung → 9. Abnahme → 10. Abgeschlossen

Jede Phase hat einen **Verantwortlichen** (KB, Büro, AT-Leiter, Projektleiter) und eine **nächste Aktion**.

### Die tiefere Intention:
Die Sidebar-Navigation soll den Nutzer **durch den Workflow führen**, nicht nur Seiten auflisten. "Erstellen & Erfassen" suggeriert eine einmalige Aktion, aber Projekte werden über ihren gesamten Lifecycle verwaltet. Die Sidebar muss die **Phasen des Workflows** widerspiegeln, nicht eine willkürliche Gruppierung von Funktionen.

### Implikation:
- "Erstellen & Erfassen" → umbenennen in etwas, das den Lifecycle widerspiegelt (z.B. "Projektmanagement")
- "Offene Projekte" und "Überfällige Projekte" sind **Filter-Ansichten**, keine eigenständigen Menüpunkte
- Die Reihenfolge der Sidebar-Einträge sollte dem Workflow folgen
- Doppelte Einträge (Baustellen + Baustellenmanager) müssen klar differenziert werden

---

## INTENTION 7: FRÜHBUCHER-RABATT = DYNAMISCH, NICHT STATISCH

### Was der Nutzer gesagt hat:
> Frühbucher-Rabatt bezieht sich auf das **Beauftragungsdatum** relativ zur nächsten Saison
> bis 31.12. → 6% / bis 31.01. → 4,5% / bis 28.02. → 3% / bis 31.03. → 1,5%

### Die tiefere Intention:
Die Daten sind **relativ zur aktuellen/nächsten Saison**, nicht absolute Jahreszahlen. "bis 31.12." bedeutet "bis zum 31. Dezember des aktuellen Jahres" (oder des Vorjahres, wenn wir bereits im neuen Jahr sind und die Saison noch nicht begonnen hat). Die Logik muss **dynamisch** berechnen, welche Frühbucher-Stufe aktuell gilt.

### Implikation:
- Hardcoded "31.12.2024" → muss durch dynamische Berechnung ersetzt werden
- Die Saison-Logik muss definiert werden: Wann beginnt/endet eine "Saison"?
- Im Angebot muss klar stehen: "Bei Beauftragung bis [dynamisches Datum]: [X]% Frühbucher-Rabatt"

---

## INTENTION 8: ÜBERNACHTUNG = AUTOMATISCH BERECHNET

### Was der Nutzer gesagt hat:
> Entfernung > 100 km → Übernachtung
> Entfernung > 50 km UND Dauer > 1 Tag → Übernachtung

### Die tiefere Intention:
Die Übernachtungslogik soll **automatisch vorschlagen**, ob Übernachtung erforderlich ist – basierend auf der Entfernung zwischen FassadenFix-Standort und Baustelle. Der Kundenberater soll das nicht manuell entscheiden müssen, sondern nur bestätigen oder überschreiben.

### Implikation:
- Entfernungsberechnung (Google Maps API oder ähnlich) einbauen
- Automatischer Vorschlag im AngebotWizard: "Übernachtung empfohlen (Entfernung: 127 km)"
- Manuelles Überschreiben muss möglich bleiben

---

## ZUSAMMENFASSUNG: 8 KERN-INTENTIONEN

| # | Intention | Kernaussage | Status in Implementierung |
|---|-----------|-------------|--------------------------|
| 1 | Immobilie als eigenständiges Asset | Unabhängig von Projekten, eigener Lebenszyklus, M:N | **Teilweise** – 1:N statt M:N, kein companyId |
| 2 | Objektaufnahme = Datenbasis | Keine Doppeleingabe im Angebot | **Teilweise** – AngebotWizard hat noch eigene Felder |
| 3 | 3 logische Ebenen im Wizard | Stammdaten + Technisch + Kaufmännisch | **Fehlt** – Kaufmännische Seite nicht implementiert |
| 4 | Baustelle = Tagesablauf-App | Vorher-Doku als Gate, Morgen/Abend-Workflow | **Fehlt** – Nur Mock-basiert |
| 5 | Kundenportal = Arbeitsplattform | Ampel-System, AG/AN-Aufgaben | **Fehlt** – Nur Mock-basiert |
| 6 | Navigation folgt Workflow | Sidebar = 10-Phasen-Lifecycle | **Abweichung** – Willkürliche Gruppierung |
| 7 | Frühbucher dynamisch | Relativ zur Saison, nicht hardcoded | **Abweichung** – Hardcoded auf 2024/2025 |
| 8 | Übernachtung automatisch | Entfernungsbasiert, nicht manuell | **Abweichung** – Nur manuell |

---

*Erstellt am 09.02.2026 – Basierend ausschließlich auf den bestätigten Interview-Erkenntnissen*
