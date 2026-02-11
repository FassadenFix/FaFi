# FaFi PM – Kritische Analyse vor Veröffentlichung

**Datum:** 11. Februar 2026  
**Autor:** Manus AI  
**Fragestellung:** Würde ich meine Hand ins Feuer legen, dass der Zustand genau so ist, wie ich es mir selbst erwarten würde?

---

## Ehrliche Antwort: Nein.

Die Anwendung ist **technisch stabil** (48 Test-Suites, 1033 Tests bestehen, TypeScript 0 Fehler, Server läuft fehlerfrei) und das **Design ist durchgängig professionell** im FassadenFix CI. Aber es gibt eine Reihe von Punkten, bei denen ein Mitarbeiter, der die App zum ersten Mal öffnet, sofort merken würde: "Das sind keine echten Daten" oder "Das funktioniert ja gar nicht richtig." Und genau das wäre bei einer Veröffentlichung ein Problem für die Akzeptanz.

---

## Bereich 1: Hardcodierte Mock-Daten – Das größte Problem

Die Anwendung hat zwei Gesichter: Seiten, die echte Daten aus der Datenbank laden, und Seiten, die komplett erfundene Zahlen und Namen anzeigen. Ein Mitarbeiter kann das nicht unterscheiden. Er sieht "Stefan Weber, 8 Projekte, 142.500 € Umsatz" und denkt entweder "Stimmt das?" oder "Wer ist Stefan Weber überhaupt?"

### Seiten mit komplett erfundenen Daten (kein DB-Zugriff oder nur Fassade)

| Seite | Was ist hardcodiert | Auswirkung |
|-------|-------------------|------------|
| **Finanzen** | 5 komplette Datensätze: Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus, Quartalsvergleich – alles erfundene Zahlen | Mitarbeiter sieht falsche Finanzdaten, GF könnte das für echte Zahlen halten |
| **Einsatzplanung** | 8 Mock-Mitarbeiter (Stefan Weber, Thomas Schmidt...), 5 Mock-Projekte, 3 Züge | Drag & Drop funktioniert, aber die Daten sind komplett fiktiv |
| **Ressourcenplaner** | 6 Mock-Teammitglieder, alle Buchungen (wer wann wo arbeitet) hardcodiert | Kalender zeigt erfundene Zuordnungen |
| **Berichtswesen** | mitarbeiterLeistung mit 4 fiktiven Personen und Umsätzen | Bericht zeigt falsche Leistungsdaten |
| **CustomerPortal** | Komplettes Mock-Projekt "Sonnenhof" mit Phasen, Dokumenten, Fotos | Kunde sieht Demo-Daten statt seinem Projekt |
| **PDFEntwuerfe** | Komplett ohne tRPC, 8 Mock-Datensätze | Keine echte PDF-Generierung |
| **Einstellungen** | handleSave() zeigt nur Toast "Gespeichert" – speichert nichts in der DB | Nutzer denkt er hat gespeichert, aber beim Neuladen ist alles weg |

### Komponenten mit hardcodierten Mock-Daten

| Komponente | Problem |
|-----------|---------|
| **GlobalSearch** | Sucht nicht in der DB, sondern filtert 12 hardcodierte Einträge (Sonnenhof, Bürokomplex, ANG-2026...) |
| **DashboardWidgets** | Baustellen-Widget zeigt immer "Sonnenhof 65%, Campus 95%", Wetter immer "8°C Wolkig", Team immer "Anna Schmidt, Thomas Braun" |
| **HubSpotKundensuche** | Sucht nicht in HubSpot, sondern filtert 6 hardcodierte Kontakte |
| **ProjektZuordnungStep** | Nutzt MOCK_UNTERNEHMEN statt DB-Abfrage für Unternehmensauswahl |
| **FotoGalerie** | MOCK_FOTOS als Default-Parameter |
| **AngebotWizard** | MOCK_UNTERNEHMEN definiert (wird aber nicht mehr genutzt – DB-Abfrage ist aktiv) |

### Toter Code

Der `MOCK_UNTERNEHMEN`-Array im AngebotWizard (Zeile 314) wird nirgends mehr referenziert – die DB-Anbindung ist aktiv. Das ist toter Code, der aufgeräumt werden sollte.

---

## Bereich 2: Datenbank – Zustand

Die Datenbank hat 50 Tabellen. Der aktuelle Füllstand:

| Tabelle | Zeilen | Bewertung |
|---------|--------|-----------|
| companies | 2.800 | Echte HubSpot-Daten |
| contacts | 5.220 | Echte HubSpot-Daten |
| documents | 235 | Echte Dokumente |
| employees | 30 | Personio-Import |
| projects | 4 | Wenige, aber echte Daten |
| properties | 6 | Echte Daten |
| activityLogs | 28 | Echte Logs |
| users | 3 | Nur 3 Benutzer angelegt |
| offers | 1 | Nur 1 Angebot |
| tasks | 2 | Fast leer |
| **orders** | **0** | **Leer** |
| **invoices** | **0** | **Leer** |
| **constructionSites** | **0** | **Leer** |
| **warranties** | **0** | **Leer** |
| **notifications** | **0** | **Leer** |
| **photos** | **0** | **Leer** |

Das bedeutet: Seiten wie Aufträge, Rechnungen, Baustellen, Garantien und Fotos zeigen "Noch keine Daten vorhanden" – was korrekt ist, aber in Kombination mit den Mock-Daten auf anderen Seiten inkonsistent wirkt.

---

## Bereich 3: Zugriffsrechte – Teilweise implementiert

Die rollenbasierte Navigation ist grundsätzlich implementiert. Die Sidebar filtert Menüpunkte nach `fafiRole` (gf, kundenberater, at_leiter, projektleiter, buero). Das ist gut.

**Was fehlt:**

Deine Anforderung war: "Seiten, die noch nicht voll funktionsfähig sind, sollen ausgegraut dargestellt werden." Das ist **nicht umgesetzt**. Alle Sidebar-Links sind voll anklickbar, egal ob die Seite dahinter echte Daten zeigt oder nur Mock-Daten. Ein Kundenberater klickt auf "Finanzen" und sieht erfundene Umsatzzahlen – das ist irreführend.

Auf Backend-Ebene nutzen alle Prozeduren `protectedProcedure` (301 Stück), nur 4 sind `publicProcedure` (Kundenportal-Token-Validierung, Auth). Das ist sauber. Admin-Checks gibt es 7 (HR-Bereich). Aber: **Kein einziger Backend-Endpunkt prüft `fafiRole`** – die Rollenfilterung passiert nur im Frontend (Sidebar). Ein Kundenberater könnte theoretisch über die URL direkt auf `/hr` navigieren und HR-Daten sehen (die Sidebar versteckt es nur visuell).

---

## Bereich 4: Willkommenstour & Helfer

Die Willkommenstour (Onboarding.tsx, 902 Zeilen) ist **gut implementiert**: rollenbasiert, interaktive Steps, WelcomeDialog. Die HelpTooltips (HelpTooltip.tsx) sind umfangreich und an den richtigen Stellen eingebaut (AngebotWizard, BaustelleWizard, ObjektaufnahmeWizard).

**Problem:** Die Tour zeigt auf Bereiche, die Mock-Daten haben. Wenn die Tour sagt "Hier siehst du deine Finanzen" und der Nutzer sieht erfundene Zahlen, ist das kontraproduktiv.

---

## Bereich 5: Design & Layout

Das Design ist **durchgängig professionell**: FassadenFix CI (#77bc1f, #4e5758), "Organic Flow" Designsprache, Dark Mode Toggle, konsistente Typografie. Die Sidebar-Navigation ist klar strukturiert mit 8 Sektionen.

**Kleinigkeiten:**

Einige Seiten (Finanzen, Berichtswesen) nutzen hardcodierte Hex-Farben in Recharts-Charts statt CSS-Variablen. Das ist kein Blocker, aber bei einem Theme-Wechsel würden die Chart-Farben nicht mitschwenken.

---

## Bereich 6: Responsivität

Die mobile Sidebar ist als Sheet implementiert (`lg:hidden`), Touch-Targets sind vorhanden (`touch-target` CSS-Klasse), BuildingVisualization ist explizit touch-optimiert. Das Dashboard-Grid ist responsive (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

**Was fehlt:** Ein systematischer iPad-Test wurde nicht durchgeführt. Die Anforderung war, dass iPad die höchste Priorität hat. Ich kann nicht garantieren, dass alle Tabellen, Wizards und Drag & Drop-Bereiche auf dem iPad korrekt funktionieren.

---

## Bereich 7: Einstellungen – Speichert nichts

Die Einstellungen-Seite hat keinerlei tRPC-Anbindung. Beide `handleSave()`-Funktionen zeigen nur einen Toast "Gespeichert" – es wird nichts in der Datenbank gespeichert. Das ist **irreführend**: Der Nutzer glaubt, seine Änderungen seien gespeichert.

---

## Bereich 8: Globale Suche – Komplett statisch

Die GlobalSearch-Komponente hat **keinen einzigen tRPC-Aufruf**. Sie filtert 12 hardcodierte Einträge (Projekte, Angebote, Dokumente, Baustellen, Mitarbeiter). Die "Letzte Suchen" sind hardcodiert als `["Sonnenhof", "Bürokomplex", "ANG-2026"]`. Bei 2.800 Unternehmen und 5.220 Kontakten in der DB ist das ein massiver Funktionsverlust.

---

## Mein Urteil: Was ich vor der Veröffentlichung tun würde

### MUSS vor Veröffentlichung (Blocker)

1. **Einstellungen-Seite: Speichern deaktivieren oder anbinden.** Entweder den Save-Button entfernen/deaktivieren mit Hinweis "Kommt bald" oder die tRPC-Anbindung implementieren. Ein Button, der "Gespeichert" sagt aber nichts speichert, ist ein Vertrauensbruch.

2. **Mock-Daten-Seiten kennzeichnen oder ausblenden.** Finanzen, Einsatzplanung, Ressourcenplaner, Berichtswesen – diese Seiten sollten entweder:
   - In der Sidebar ausgegraut werden mit Badge "Vorschau"
   - Oder einen deutlichen Banner "Demo-Ansicht – Echte Daten folgen" bekommen
   - Oder komplett aus der Navigation entfernt werden

3. **GlobalSearch an die DB anbinden.** Eine Suche, die nur 12 hardcodierte Einträge findet, ist schlimmer als keine Suche. Entweder echte DB-Suche implementieren oder die Suchleiste als "Kommt bald" markieren.

4. **DashboardWidgets dynamisieren.** Baustellen-Widget, Wetter-Widget, Team-Widget – diese zeigen immer dieselben erfundenen Daten. Entweder an die DB anbinden oder mit "Keine Daten" anzeigen.

### SOLLTE vor Veröffentlichung

5. **Toter Mock-Code aufräumen.** MOCK_UNTERNEHMEN im AngebotWizard, MOCK_FOTOS-Defaults, MOCK_HUBSPOT_KONTAKTE – alles entfernen, was nicht mehr genutzt wird oder durch DB-Abfragen ersetzt wurde.

6. **Backend-Rollenprüfung für sensible Bereiche.** Aktuell prüft nur der HR-Bereich `ctx.user.role`. Finanzen, Berichte, Bibliothek sollten ebenfalls `fafiRole`-basierte Backend-Checks haben.

7. **iPad-Testdurchlauf.** Mindestens die Kernseiten (Dashboard, Projekte, Immobilien-Detail, AngebotWizard, Baustellen) auf iPad-Auflösung (1024x768) testen.

8. **HubSpotKundensuche an echte HubSpot-API anbinden.** Die Komponente filtert aktuell 6 hardcodierte Kontakte statt die 2.800 echten Unternehmen aus der DB zu durchsuchen.

### KANN nach Veröffentlichung

9. **Finanzen-Modul mit echten Daten.** Umsätze aus Aufträgen/Rechnungen aggregieren statt erfundene Zahlen.

10. **Einsatzplanung mit echten Mitarbeitern.** Die 30 Employees aus der DB laden statt 8 Mock-Mitarbeiter.

11. **Ressourcenplaner mit echten Buchungen.** Fahrzeuge und Bühnen kommen schon aus der Bibliothek – Team-Mitglieder und Buchungen fehlen noch.

12. **PDF-Entwürfe an tRPC anbinden.** Aktuell komplett ohne Backend.

---

## Zusammenfassung

| Bereich | Status | Veröffentlichungsbereit? |
|---------|--------|------------------------|
| Technische Stabilität | 1033 Tests bestehen, 0 TS-Fehler | Ja |
| Design & CI | Durchgängig professionell | Ja |
| Dashboard | Echte Daten + Mock-Widgets | Teilweise |
| Projekte, Immobilien, Angebote | DB-angebunden, funktional | Ja |
| Kontakte & Unternehmen | 2.800+ echte Daten | Ja |
| HR & Mitarbeiter | DB-angebunden, Admin-geschützt | Ja |
| Bibliothek | DB-angebunden, Permission-System | Ja |
| Baustellen | DB-angebunden, aber 0 Daten | Ja (zeigt Empty State) |
| Finanzen | Komplett erfundene Zahlen | **Nein** |
| Einsatzplanung | Komplett erfundene Daten | **Nein** |
| Ressourcenplaner | Teilweise Mock, teilweise DB | **Nein** |
| Berichtswesen | Teilweise erfundene Daten | **Nein** |
| Einstellungen | Speichert nichts | **Nein** |
| Globale Suche | Komplett statisch | **Nein** |
| CustomerPortal | Komplett Mock | **Nein** |
| Zugriffsrechte | Frontend-Filter, kein Backend-Check | Teilweise |
| Willkommenstour | Gut implementiert | Ja |
| Helfer-Tooltips | Umfangreich | Ja |
| Responsivität | Grundstruktur da, iPad ungetestet | Teilweise |

**Meine ehrliche Einschätzung:** Ich würde die Veröffentlichung nicht blockieren, aber die 4 MUSS-Punkte vorher umsetzen. Das sind zusammen etwa 4-6 Stunden Arbeit. Danach wäre die App in einem Zustand, in dem ein Mitarbeiter sie öffnen kann, ohne auf erfundene Daten zu stoßen, die er für echt halten könnte.
