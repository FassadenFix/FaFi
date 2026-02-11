# FaFi PM – E2E-Realdaten-Testmatrix v3.0

**Datum:** 09.02.2026
**Methodik:** 10+ Szenarien mit unterschiedlichen Rollen, Situationen und Edge Cases

---

## Testszenarien

### Szenario 1: Kundenberater – Neukunde mit Großprojekt
**Rolle:** Lisa Weber (Kundenberaterin)
**Situation:** Neuer Großkunde (Städtische Wohnungsbau GmbH) meldet sich mit 8 Gebäuden
**Aktionen:** Unternehmen anlegen → Projekt erstellen → 1 Immobilie erfassen → Angebot prüfen
**Edge Case:** Sehr langer Firmenname, viele Immobilien, große Flächen (>10.000 m²)

### Szenario 2: Kundenberater – Bestandskunde mit Folgeauftrag
**Rolle:** Max Mustermann (Kundenberater)
**Situation:** Bestandskunde aus HubSpot bestellt Nachreinigung
**Aktionen:** Bestandskunde suchen → Neues Projekt für bestehenden Kunden → Immobilie zuordnen
**Edge Case:** Kunde existiert bereits in DB, doppelte Anlage vermeiden

### Szenario 3: Kundenberater – Kleinstauftrag Privatperson
**Rolle:** Lisa Weber (Kundenberaterin)
**Situation:** Privatperson (kein Unternehmen) will Einfamilienhaus reinigen lassen
**Edge Case:** Kein Unternehmen vorhanden, nur 2 Seiten reinigungsfähig, kleine Fläche (<100 m²)

### Szenario 4: AT-Leiter – Einsatzplanung für nächste Woche
**Rolle:** Thomas Braun (AT-Leiter)
**Situation:** Muss 3 Projekte auf 2 Züge verteilen
**Aktionen:** Einsatzplanung → Züge prüfen → Mitarbeiter zuordnen → Kalender prüfen
**Edge Case:** Mitarbeiter im Urlaub, Überschneidungen

### Szenario 5: Projektleiter – Baustelle starten und Tagesablauf
**Rolle:** Anna Schmidt (Projektleiterin)
**Situation:** Baustelle "Wohnanlage Grüner Weg" soll heute starten
**Aktionen:** Baustelle öffnen → Vorher-Doku prüfen → Arbeitstag starten → Logbuch
**Edge Case:** Vorher-Doku noch nicht abgeschlossen

### Szenario 6: Büro – Rechnung erstellen und Mahnwesen
**Rolle:** Sabine Meier (Büro)
**Situation:** Projekt abgeschlossen, Rechnung muss erstellt werden
**Aktionen:** Finanzen → Rechnung erstellen → Zahlungseingang → Mahnlauf prüfen
**Edge Case:** Rechnung ohne Auftrag, überfällige Zahlung

### Szenario 7: Geschäftsführung – Dashboard und Berichte
**Rolle:** Alexander Retzlaff (Geschäftsführer)
**Situation:** Montagsmeeting, braucht Überblick über alle Projekte
**Aktionen:** Dashboard KPIs → Berichte → Conversion Rate → Umsatzentwicklung
**Edge Case:** Leere Daten vs. echte Daten, Trend-Berechnung

### Szenario 8: Kundenberater – Angebot erstellen mit Sonderkonditionen
**Rolle:** Max Mustermann (Kundenberater)
**Situation:** Großkunde will Mengenrabatt, Frühbucher-Aktion
**Aktionen:** Angebots-Wizard → Positionen → Rabatt → PDF-Vorschau → Versand
**Edge Case:** Negativer Rabatt, 0€-Position, sehr lange Beschreibung

### Szenario 9: Kundenberater – Objektaufnahme mit Sonderfällen
**Rolle:** Lisa Weber (Kundenberaterin)
**Situation:** Gebäude mit nur 2 reinigungsfähigen Seiten, Denkmalschutz
**Aktionen:** ObjektaufnahmeWizard → 2 Seiten Nein → Besonderheiten → Fotos
**Edge Case:** Alle Seiten "nicht reinigungsfähig", Sonderzeichen in Adresse

### Szenario 10: AT-Leiter – Nachfass-Workflow für offene Angebote
**Rolle:** Thomas Braun (AT-Leiter)
**Situation:** 3 Angebote seit 2 Wochen ohne Rückmeldung
**Aktionen:** Dashboard Nachfassen → Angebot öffnen → Status prüfen → Nachfassen
**Edge Case:** Angebot ohne Projekt, abgelaufenes Angebot

### Szenario 11: Kundenportal – Kundensicht auf laufendes Projekt
**Rolle:** Kunde (externe Sicht)
**Situation:** Kunde will Fortschritt seines Projekts sehen
**Aktionen:** Kundenportal → Projekte → Garantien → Dokumente → Feedback
**Edge Case:** Keine Projekte zugeordnet, leere Tabs

### Szenario 12: Kundenberater – Schnelle Suche und Navigation
**Rolle:** Max Mustermann (Kundenberater)
**Situation:** Kunde ruft an, braucht sofort Info zu seinem Projekt
**Aktionen:** Globale Suche → Unternehmen finden → Projekt öffnen → Details
**Edge Case:** Suche nach Teilbegriff, Sonderzeichen, leere Suche

---

## Findings-Log

(wird während der Tests befüllt)
