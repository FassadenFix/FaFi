# FaFi PM – Vollständiger Testplan für Generalprobe

**Datum:** 05. Februar 2026  
**Version:** 4.6 (Produktionsrelease)  
**Erstellt von:** Manus AI

---

## Übersicht

Dieser Testplan beschreibt eine vollständige Generalprobe des FaFi PM Projektmanagement-Systems. Er umfasst alle Funktionen, Schaltflächen und Workflows in mindestens 10 unterschiedlichen Konstellationen, um die Produktionsreife unter realistischen Bedingungen zu validieren.

---

## 1. Testumgebung und Voraussetzungen

### 1.1 Technische Voraussetzungen

| Komponente | Anforderung | Status prüfen |
|------------|-------------|---------------|
| Browser | Chrome/Safari aktuell | [ ] |
| Bildschirm Desktop | Min. 1920x1080 | [ ] |
| Bildschirm Mobil | iPhone/iPad Safari | [ ] |
| Internetverbindung | Stabil, min. 10 Mbit/s | [ ] |
| HubSpot-Account | Verbunden und aktiv | [ ] |
| Outlook-Account | Verbunden für E-Mail | [ ] |

### 1.2 Testdaten-Vorbereitung

| Testdaten | Anzahl | Quelle |
|-----------|--------|--------|
| Unternehmen | Min. 10 verschiedene | HubSpot + manuell |
| Kontakte | Min. 20 verschiedene | HubSpot + manuell |
| Projekte | Min. 5 verschiedene | Manuell erstellen |
| Immobilien | Min. 10 verschiedene | Manuell erstellen |
| Deals | Min. 5 verschiedene | HubSpot |

---

## 2. Authentifizierung und Benutzerverwaltung

### Test 2.1: Login-Flow

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 2.1.1 | App ohne Login öffnen | Redirect zur Login-Seite | [ ] |
| 2.1.2 | Login mit gültigen Credentials | Erfolgreicher Login, Dashboard | [ ] |
| 2.1.3 | Login mit ungültigen Credentials | Fehlermeldung anzeigen | [ ] |
| 2.1.4 | Session-Timeout simulieren | Automatischer Redirect zu Login | [ ] |
| 2.1.5 | Logout-Button klicken | Session beendet, Login-Seite | [ ] |

### Test 2.2: Benutzerrollen

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 2.2.1 | Als Admin einloggen | Alle Menüpunkte sichtbar | [ ] |
| 2.2.2 | Als Kundenberater einloggen | Eingeschränkte Menüpunkte | [ ] |
| 2.2.3 | Als Projektleiter einloggen | Projektbezogene Funktionen | [ ] |

---

## 3. Dashboard-Tests

### Test 3.1: KPI-Widgets

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.1.1 | Dashboard laden | Alle 4 KPI-Widgets sichtbar | [ ] |
| 3.1.2 | Projekte-Widget prüfen | Korrekte Anzahl aus DB | [ ] |
| 3.1.3 | Angebote-Widget prüfen | Offene Angebote + Wert | [ ] |
| 3.1.4 | Aufträge-Widget prüfen | Aufträge diesen Monat | [ ] |
| 3.1.5 | Conversion-Widget prüfen | Prozentsatz korrekt | [ ] |
| 3.1.6 | Refresh-Button klicken | Daten aktualisieren | [ ] |

### Test 3.2: Projekt-Kanban

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.2.1 | Kanban-Board laden | Alle Phasen-Spalten sichtbar | [ ] |
| 3.2.2 | Projekt per Drag&Drop verschieben | Phase aktualisiert | [ ] |
| 3.2.3 | Projekt-Karte klicken | Detail-Dialog öffnet | [ ] |
| 3.2.4 | Filter nach Phase anwenden | Nur gefilterte Projekte | [ ] |

### Test 3.3: Aktivitätslog

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.3.1 | Aktivitätslog laden | Letzte 10 Aktivitäten | [ ] |
| 3.3.2 | Aktivität mit Icon prüfen | Korrektes Icon pro Typ | [ ] |
| 3.3.3 | Zeitstempel prüfen | Relative Zeit (vor X Min) | [ ] |
| 3.3.4 | Aktivität anklicken | Navigation zum Objekt | [ ] |

### Test 3.4: Countdown-Aufgaben

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.4.1 | Aufgaben-Widget laden | Dringende Aufgaben oben | [ ] |
| 3.4.2 | Überfällige Aufgabe prüfen | Rot markiert | [ ] |
| 3.4.3 | Aufgabe als erledigt markieren | Status aktualisiert | [ ] |

### Test 3.5: HubSpot-Sync-Widget

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.5.1 | Widget laden | Verbindungsstatus anzeigen | [ ] |
| 3.5.2 | Sync-Button klicken | Synchronisation startet | [ ] |
| 3.5.3 | Sync-Fortschritt prüfen | Fortschrittsanzeige | [ ] |
| 3.5.4 | Sync abgeschlossen | Erfolgsmeldung + Statistik | [ ] |

### Test 3.6: Schnellaktionen

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 3.6.1 | "Neues Projekt" klicken | Wizard öffnet | [ ] |
| 3.6.2 | "Neues Angebot" klicken | Angebots-Wizard öffnet | [ ] |
| 3.6.3 | "Neue Immobilie" klicken | Objektaufnahme-Wizard öffnet | [ ] |

---

## 4. Navigation und Sidebar-Tests

### Test 4.1: Desktop-Navigation

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 4.1.1 | Sidebar-Menüpunkte klicken | Korrekte Seite lädt | [ ] |
| 4.1.2 | Untermenü aufklappen | Untermenüpunkte sichtbar | [ ] |
| 4.1.3 | Aktiver Menüpunkt | Visuell hervorgehoben | [ ] |
| 4.1.4 | Sidebar einklappen | Nur Icons sichtbar | [ ] |
| 4.1.5 | Sidebar ausklappen | Volle Breite mit Labels | [ ] |

### Test 4.2: Mobile Navigation

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 4.2.1 | Hamburger-Menü klicken | Sidebar öffnet als Overlay | [ ] |
| 4.2.2 | Menüpunkt auswählen | Sidebar schließt, Seite lädt | [ ] |
| 4.2.3 | Außerhalb klicken | Sidebar schließt | [ ] |
| 4.2.4 | Swipe-Geste | Sidebar schließt | [ ] |

### Test 4.3: Globale Suche

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 4.3.1 | Suchfeld klicken | Such-Dialog öffnet | [ ] |
| 4.3.2 | Suchbegriff eingeben | Ergebnisse in Echtzeit | [ ] |
| 4.3.3 | Ergebnis anklicken | Navigation zum Objekt | [ ] |
| 4.3.4 | ESC drücken | Dialog schließt | [ ] |
| 4.3.5 | Tastenkürzel Cmd/Ctrl+K | Such-Dialog öffnet | [ ] |

---

## 5. Projekt-Modul Tests

### Test 5.1: Projektliste

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.1.1 | Projektliste laden | Alle Projekte aus DB | [ ] |
| 5.1.2 | Nach Name sortieren | Alphabetische Sortierung | [ ] |
| 5.1.3 | Nach Status filtern | Nur gefilterte Projekte | [ ] |
| 5.1.4 | Suchfeld nutzen | Projekte gefiltert | [ ] |
| 5.1.5 | Pagination testen | Seitenwechsel funktioniert | [ ] |

### Test 5.2: Neues Projekt Wizard (10 Varianten)

**Variante A: Minimalprojekt**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.A1 | Wizard starten | Schritt 1 anzeigen | [ ] |
| 5.2.A2 | Nur Pflichtfelder ausfüllen | Weiter-Button aktiv | [ ] |
| 5.2.A3 | Projekt speichern | Projekt in DB erstellt | [ ] |

**Variante B: Vollständiges Projekt mit HubSpot-Deal**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.B1 | Alle Felder ausfüllen | Alle Daten erfasst | [ ] |
| 5.2.B2 | HubSpot-Deal auswählen | Deal verknüpft | [ ] |
| 5.2.B3 | Projekt speichern | Mit Deal-ID gespeichert | [ ] |

**Variante C: Projekt mit neuem Deal**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.C1 | "Neuen Deal erstellen" wählen | Deal-Formular erscheint | [ ] |
| 5.2.C2 | Deal-Daten eingeben | Validierung erfolgreich | [ ] |
| 5.2.C3 | Projekt speichern | Deal in HubSpot erstellt | [ ] |

**Variante D: Projekt mit bestehendem Unternehmen**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.D1 | Unternehmen aus Dropdown wählen | Kontakte laden automatisch | [ ] |
| 5.2.D2 | Ansprechpartner auswählen | Kontaktdaten übernommen | [ ] |
| 5.2.D3 | Projekt speichern | Verknüpfungen korrekt | [ ] |

**Variante E: Projekt mit neuem Unternehmen**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.E1 | "Neues Unternehmen" klicken | Formular erscheint | [ ] |
| 5.2.E2 | Unternehmensdaten eingeben | Validierung erfolgreich | [ ] |
| 5.2.E3 | Projekt speichern | Unternehmen + Projekt erstellt | [ ] |

**Variante F: Wizard abbrechen**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.F1 | Wizard starten, Daten eingeben | Daten im Formular | [ ] |
| 5.2.F2 | Abbrechen klicken | Bestätigungsdialog | [ ] |
| 5.2.F3 | Abbruch bestätigen | Keine Daten gespeichert | [ ] |

**Variante G: Wizard mit Zurück-Navigation**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.G1 | Bis Schritt 3 navigieren | Daten in allen Schritten | [ ] |
| 5.2.G2 | Zurück zu Schritt 1 | Daten erhalten | [ ] |
| 5.2.G3 | Änderung vornehmen | Daten aktualisiert | [ ] |
| 5.2.G4 | Bis Ende navigieren | Alle Daten korrekt | [ ] |

**Variante H: Validierungsfehler**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.H1 | Pflichtfeld leer lassen | Weiter-Button deaktiviert | [ ] |
| 5.2.H2 | Ungültige E-Mail eingeben | Fehlermeldung anzeigen | [ ] |
| 5.2.H3 | Fehler korrigieren | Fehlermeldung verschwindet | [ ] |

**Variante I: Projekt mit mehreren Immobilien**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.I1 | Projekt erstellen | Projekt gespeichert | [ ] |
| 5.2.I2 | 3 Immobilien hinzufügen | Alle verknüpft | [ ] |
| 5.2.I3 | Projekt-Detail prüfen | 3 Immobilien angezeigt | [ ] |

**Variante J: Projekt duplizieren**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.2.J1 | Bestehendes Projekt öffnen | Detail-Ansicht | [ ] |
| 5.2.J2 | "Duplizieren" klicken | Wizard mit Daten | [ ] |
| 5.2.J3 | Namen ändern, speichern | Neues Projekt erstellt | [ ] |

### Test 5.3: Projekt-Detail

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 5.3.1 | Projekt öffnen | Alle Daten angezeigt | [ ] |
| 5.3.2 | Status ändern | Status aktualisiert | [ ] |
| 5.3.3 | Immobilien-Tab öffnen | Verknüpfte Immobilien | [ ] |
| 5.3.4 | Angebote-Tab öffnen | Verknüpfte Angebote | [ ] |
| 5.3.5 | Aktivitäten-Tab öffnen | Projekt-Timeline | [ ] |
| 5.3.6 | Bearbeiten klicken | Edit-Modus aktiv | [ ] |
| 5.3.7 | Änderungen speichern | Daten aktualisiert | [ ] |
| 5.3.8 | Projekt löschen | Bestätigungsdialog | [ ] |

---

## 6. Immobilien/Objektaufnahme-Tests

### Test 6.1: Objektaufnahme-Wizard (10 Varianten)

**Variante A: Einfamilienhaus**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.A1 | Seite 1: Stammdaten | Adresse, Ansprechpartner | [ ] |
| 6.1.A2 | Seite 2: 4 Seiten erfassen | Nord, Ost, Süd, West | [ ] |
| 6.1.A3 | Seite 3: Ressourcen | Bühne, Wasser, Strom | [ ] |
| 6.1.A4 | Seite 4: Kaufmännisch | Termine, Rabatte | [ ] |
| 6.1.A5 | Seite 5: Zusammenfassung | Alle Daten korrekt | [ ] |
| 6.1.A6 | Speichern | Immobilie erstellt | [ ] |

**Variante B: Mehrfamilienhaus mit 6 Seiten**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.B1 | Alle 6 Seiten erfassen | Nord, Ost, Süd, West, Dach, Sockel | [ ] |
| 6.1.B2 | Fotos pro Seite hochladen | Fotos gespeichert | [ ] |
| 6.1.B3 | Schäden dokumentieren | Schadenstypen erfasst | [ ] |

**Variante C: Gewerbeimmobilie**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.C1 | Große Flächen eingeben | Berechnung korrekt | [ ] |
| 6.1.C2 | Spezielle Anforderungen | Notizen erfasst | [ ] |
| 6.1.C3 | 360°-Tour URL | URL gespeichert | [ ] |

**Variante D: Mit Foto-Upload**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.D1 | Fotos per Drag&Drop | Upload startet | [ ] |
| 6.1.D2 | Mehrere Fotos gleichzeitig | Alle hochgeladen | [ ] |
| 6.1.D3 | Foto löschen | Foto entfernt | [ ] |
| 6.1.D4 | Foto-Galerie öffnen | Lightbox anzeigen | [ ] |

**Variante E: Mit Schadenserfassung**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.E1 | Schadenstyp auswählen | Algen, Moos, etc. | [ ] |
| 6.1.E2 | Schweregrad angeben | Leicht/Mittel/Schwer | [ ] |
| 6.1.E3 | Schadensfoto hochladen | Foto verknüpft | [ ] |

**Variante F: Mit Ressourcenplanung**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.F1 | Bühnentyp auswählen | Auswahl gespeichert | [ ] |
| 6.1.F2 | Straßensperrung markieren | Checkbox aktiv | [ ] |
| 6.1.F3 | Wasseranschluss angeben | Entfernung erfasst | [ ] |

**Variante G: Mit Marketing-Einwilligung**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.G1 | Foto-Einwilligung einholen | Checkbox aktiv | [ ] |
| 6.1.G2 | Referenz-Erlaubnis | Checkbox aktiv | [ ] |
| 6.1.G3 | Speichern | Einwilligungen erfasst | [ ] |

**Variante H: Entwurf speichern**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.H1 | Teilweise ausfüllen | Daten im Formular | [ ] |
| 6.1.H2 | "Als Entwurf speichern" | Entwurf gespeichert | [ ] |
| 6.1.H3 | Später fortsetzen | Daten wiederhergestellt | [ ] |

**Variante I: Validierungsfehler**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.I1 | Ungültige Fläche eingeben | Fehlermeldung | [ ] |
| 6.1.I2 | Pflichtfeld leer | Weiter blockiert | [ ] |
| 6.1.I3 | Fehler korrigieren | Weiter möglich | [ ] |

**Variante J: Immobilie bearbeiten**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 6.1.J1 | Bestehende Immobilie öffnen | Daten angezeigt | [ ] |
| 6.1.J2 | Fläche ändern | Änderung möglich | [ ] |
| 6.1.J3 | Speichern | Daten aktualisiert | [ ] |

---

## 7. Angebots-Modul Tests

### Test 7.1: Angebotsliste

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.1.1 | Angebotsliste laden | Alle Angebote aus DB | [ ] |
| 7.1.2 | Statistiken prüfen | Korrekte Berechnung | [ ] |
| 7.1.3 | Nach Status filtern | Gefilterte Liste | [ ] |
| 7.1.4 | Angebot öffnen | Detail-Ansicht | [ ] |

### Test 7.2: Angebots-Wizard (10 Varianten)

**Variante A: Einzelimmobilie, alle Seiten**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.A1 | Unternehmen auswählen | Kontakte laden | [ ] |
| 7.2.A2 | Ansprechpartner wählen | Daten übernommen | [ ] |
| 7.2.A3 | Projekt auswählen | Immobilien laden | [ ] |
| 7.2.A4 | HubSpot-Deal auswählen | Deal verknüpft | [ ] |
| 7.2.A5 | Alle Seiten auswählen | Fläche berechnet | [ ] |
| 7.2.A6 | Kalkulation prüfen | Preis korrekt | [ ] |
| 7.2.A7 | Konditionen festlegen | Rabatt angewendet | [ ] |
| 7.2.A8 | Zusammenfassung | Alle Daten korrekt | [ ] |
| 7.2.A9 | PDF-Vorschau | PDF generiert | [ ] |
| 7.2.A10 | Angebot speichern | In DB gespeichert | [ ] |

**Variante B: Mehrere Immobilien**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.B1 | 3 Immobilien auswählen | Alle in Liste | [ ] |
| 7.2.B2 | Verschiedene Seiten pro Immobilie | Individuelle Auswahl | [ ] |
| 7.2.B3 | Gesamtfläche prüfen | Summe korrekt | [ ] |
| 7.2.B4 | Gesamtpreis prüfen | Summe korrekt | [ ] |

**Variante C: Mit Frühbucher-Rabatt**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.C1 | Frühbucher aktivieren | Rabatt berechnet | [ ] |
| 7.2.C2 | Rabatt in PDF prüfen | Korrekt ausgewiesen | [ ] |

**Variante D: Mit Mengenrabatt**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.D1 | Große Fläche (>5000m²) | Staffelpreis aktiv | [ ] |
| 7.2.D2 | Preis pro m² prüfen | Reduzierter Preis | [ ] |

**Variante E: Neuen Deal erstellen**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.E1 | "Neuen Deal erstellen" | Formular erscheint | [ ] |
| 7.2.E2 | Deal-Daten eingeben | Validierung OK | [ ] |
| 7.2.E3 | Angebot speichern | Deal in HubSpot | [ ] |

**Variante F: PDF-Download**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.F1 | PDF-Vorschau öffnen | PDF angezeigt | [ ] |
| 7.2.F2 | "PDF herunterladen" | Download startet | [ ] |
| 7.2.F3 | PDF öffnen | Korrekt formatiert | [ ] |
| 7.2.F4 | Logo prüfen | FassadenFix Logo | [ ] |
| 7.2.F5 | Farben prüfen | CI-konform | [ ] |

**Variante G: E-Mail-Versand**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.G1 | "Per E-Mail senden" | Dialog öffnet | [ ] |
| 7.2.G2 | Empfänger prüfen | Kontakt-E-Mail | [ ] |
| 7.2.G3 | E-Mail senden | Versand erfolgreich | [ ] |
| 7.2.G4 | HubSpot-Engagement prüfen | In Timeline | [ ] |

**Variante H: Angebot bearbeiten**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.H1 | Bestehendes Angebot öffnen | Daten geladen | [ ] |
| 7.2.H2 | Fläche ändern | Neuberechnung | [ ] |
| 7.2.H3 | Neue Version speichern | Version erstellt | [ ] |

**Variante I: Angebot duplizieren**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.I1 | "Duplizieren" klicken | Wizard mit Daten | [ ] |
| 7.2.I2 | Änderungen vornehmen | Daten aktualisiert | [ ] |
| 7.2.I3 | Als neues Angebot speichern | Neue ID | [ ] |

**Variante J: Angebot-Status ändern**

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 7.2.J1 | Status "Versendet" setzen | Status aktualisiert | [ ] |
| 7.2.J2 | Status "Angenommen" setzen | Auftrag erstellt | [ ] |
| 7.2.J3 | Status "Abgelehnt" setzen | Grund erfassen | [ ] |

---

## 8. Unternehmen & Kontakte Tests

### Test 8.1: Unternehmensliste

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 8.1.1 | Liste laden | Alle Unternehmen | [ ] |
| 8.1.2 | Suche nutzen | Gefilterte Liste | [ ] |
| 8.1.3 | Sortierung ändern | Korrekte Reihenfolge | [ ] |

### Test 8.2: Unternehmens-Detail

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 8.2.1 | Unternehmen öffnen | Stammdaten angezeigt | [ ] |
| 8.2.2 | Kontakte-Tab | Verknüpfte Kontakte | [ ] |
| 8.2.3 | Projekte-Tab | Verknüpfte Projekte | [ ] |
| 8.2.4 | Angebote-Tab | Verknüpfte Angebote | [ ] |
| 8.2.5 | Archiv-Tab | Dokumente angezeigt | [ ] |
| 8.2.6 | HubSpot-Link | Öffnet HubSpot | [ ] |

### Test 8.3: Dokumenten-Archiv

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 8.3.1 | Archiv öffnen | Dokumente angezeigt | [ ] |
| 8.3.2 | Dokument hochladen | Upload erfolgreich | [ ] |
| 8.3.3 | Dokument herunterladen | Download startet | [ ] |
| 8.3.4 | Dokument löschen | Bestätigung, gelöscht | [ ] |
| 8.3.5 | Nach Typ filtern | Gefilterte Liste | [ ] |

---

## 9. Baustellen-Modul Tests

### Test 9.1: Baustellenliste

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 9.1.1 | Liste laden | Aktive Baustellen | [ ] |
| 9.1.2 | Status-Filter | Gefilterte Liste | [ ] |
| 9.1.3 | Karten-Ansicht | Baustellen auf Karte | [ ] |

### Test 9.2: Baustellen-Detail

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 9.2.1 | Baustelle öffnen | Alle Daten angezeigt | [ ] |
| 9.2.2 | Wetter-Widget | Aktuelle Wetterdaten | [ ] |
| 9.2.3 | Fortschritt aktualisieren | Prozent gespeichert | [ ] |
| 9.2.4 | Team anzeigen | Zugewiesene Mitarbeiter | [ ] |

### Test 9.3: Logbuch

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 9.3.1 | Logbuch öffnen | Einträge chronologisch | [ ] |
| 9.3.2 | Neuen Eintrag erstellen | Formular öffnet | [ ] |
| 9.3.3 | Typ auswählen | Icon korrekt | [ ] |
| 9.3.4 | Foto hinzufügen | Upload erfolgreich | [ ] |
| 9.3.5 | Eintrag speichern | In Liste angezeigt | [ ] |

---

## 10. HubSpot-Integration Tests

### Test 10.1: Verbindung

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 10.1.1 | Verbindungsstatus prüfen | "Verbunden" anzeigen | [ ] |
| 10.1.2 | Account-Info abrufen | Hub-ID angezeigt | [ ] |

### Test 10.2: Synchronisation

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 10.2.1 | Kontakte synchronisieren | Import erfolgreich | [ ] |
| 10.2.2 | Unternehmen synchronisieren | Import erfolgreich | [ ] |
| 10.2.3 | Deals synchronisieren | Import erfolgreich | [ ] |
| 10.2.4 | Sync-Statistik prüfen | Zahlen korrekt | [ ] |

### Test 10.3: Bidirektionaler Sync

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 10.3.1 | Neuen Kontakt in FaFi erstellen | Kontakt gespeichert | [ ] |
| 10.3.2 | Sync zu HubSpot | Kontakt in HubSpot | [ ] |
| 10.3.3 | Kontakt in HubSpot ändern | Änderung sichtbar | [ ] |
| 10.3.4 | Sync zu FaFi | Änderung übernommen | [ ] |

### Test 10.4: Deal-Integration

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 10.4.1 | Deal aus HubSpot laden | Deals in Dropdown | [ ] |
| 10.4.2 | Deal mit Angebot verknüpfen | Verknüpfung gespeichert | [ ] |
| 10.4.3 | Neuen Deal erstellen | Deal in HubSpot | [ ] |

### Test 10.5: Engagement-Tracking

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 10.5.1 | E-Mail über FaFi senden | E-Mail versendet | [ ] |
| 10.5.2 | HubSpot-Timeline prüfen | E-Mail als Engagement | [ ] |
| 10.5.3 | Verknüpfungen prüfen | Contact, Company, Deal | [ ] |

---

## 11. E-Mail-Versand Tests

### Test 11.1: Angebots-E-Mail

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 11.1.1 | E-Mail-Button klicken | Dialog öffnet | [ ] |
| 11.1.2 | Empfänger prüfen | Korrekte E-Mail | [ ] |
| 11.1.3 | Betreff prüfen | Angebotsnummer enthalten | [ ] |
| 11.1.4 | E-Mail senden | Versand erfolgreich | [ ] |
| 11.1.5 | Bestätigung anzeigen | Toast-Nachricht | [ ] |

### Test 11.2: E-Mail-Vorschau

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 11.2.1 | Vorschau öffnen | HTML-E-Mail angezeigt | [ ] |
| 11.2.2 | CI-Farben prüfen | #77bc1f, #4e5758 | [ ] |
| 11.2.3 | Logo prüfen | FassadenFix Logo | [ ] |

---

## 12. Responsive Design Tests

### Test 12.1: Desktop (1920x1080)

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 12.1.1 | Dashboard | Vollständig sichtbar | [ ] |
| 12.1.2 | Tabellen | Alle Spalten sichtbar | [ ] |
| 12.1.3 | Dialoge | Zentriert, lesbar | [ ] |

### Test 12.2: Tablet (iPad)

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 12.2.1 | Sidebar | Einklappbar | [ ] |
| 12.2.2 | Tabellen | Horizontal scrollbar | [ ] |
| 12.2.3 | Touch-Gesten | Funktionieren | [ ] |

### Test 12.3: Mobile (iPhone)

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 12.3.1 | Navigation | Hamburger-Menü | [ ] |
| 12.3.2 | Formulare | Touch-optimiert | [ ] |
| 12.3.3 | Buttons | Min. 44px Touch-Target | [ ] |
| 12.3.4 | Schriftgröße | Lesbar ohne Zoom | [ ] |

---

## 13. Performance Tests

### Test 13.1: Ladezeiten

| Seite | Max. Ladezeit | Gemessen | ✓/✗ |
|-------|---------------|----------|-----|
| Dashboard | < 2s | [ ] s | [ ] |
| Projektliste | < 2s | [ ] s | [ ] |
| Angebots-Wizard | < 3s | [ ] s | [ ] |
| PDF-Generierung | < 5s | [ ] s | [ ] |

### Test 13.2: Datenmenge

| Test | Erwartung | Ergebnis | ✓/✗ |
|------|-----------|----------|-----|
| 100 Projekte laden | < 3s | [ ] s | [ ] |
| 1000 Kontakte laden | < 5s | [ ] s | [ ] |
| Große PDF (50 Seiten) | < 10s | [ ] s | [ ] |

---

## 14. Fehlerbehandlung Tests

### Test 14.1: Netzwerkfehler

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 14.1.1 | Offline gehen | Fehlermeldung anzeigen | [ ] |
| 14.1.2 | Wieder online | Automatische Wiederherstellung | [ ] |
| 14.1.3 | Timeout simulieren | Retry-Option anbieten | [ ] |

### Test 14.2: Validierungsfehler

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 14.2.1 | Ungültige Eingabe | Inline-Fehlermeldung | [ ] |
| 14.2.2 | Pflichtfeld leer | Feld rot markiert | [ ] |
| 14.2.3 | Fehler korrigieren | Markierung verschwindet | [ ] |

### Test 14.3: Serverfehler

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 14.3.1 | 500-Fehler simulieren | Benutzerfreundliche Meldung | [ ] |
| 14.3.2 | 404-Fehler | Not-Found-Seite | [ ] |
| 14.3.3 | 401-Fehler | Redirect zu Login | [ ] |

---

## 15. Accessibility Tests

### Test 15.1: Tastaturnavigation

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 15.1.1 | Tab durch Formular | Alle Felder erreichbar | [ ] |
| 15.1.2 | Enter auf Button | Aktion ausgeführt | [ ] |
| 15.1.3 | ESC in Dialog | Dialog schließt | [ ] |
| 15.1.4 | Pfeiltasten in Dropdown | Navigation funktioniert | [ ] |

### Test 15.2: Screenreader

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 15.2.1 | Dialoge | DialogTitle vorhanden | [ ] |
| 15.2.2 | Bilder | Alt-Text vorhanden | [ ] |
| 15.2.3 | Formulare | Labels verknüpft | [ ] |

---

## 16. Sicherheits-Tests

### Test 16.1: Authentifizierung

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 16.1.1 | Geschützte Route ohne Login | Redirect zu Login | [ ] |
| 16.1.2 | API ohne Token | 401 Unauthorized | [ ] |
| 16.1.3 | Abgelaufener Token | Automatischer Refresh | [ ] |

### Test 16.2: Autorisierung

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 16.2.1 | Admin-Funktion als User | 403 Forbidden | [ ] |
| 16.2.2 | Fremdes Projekt bearbeiten | Zugriff verweigert | [ ] |

---

## 17. Datenintegrität Tests

### Test 17.1: CRUD-Operationen

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 17.1.1 | Create: Neues Projekt | ID generiert, gespeichert | [ ] |
| 17.1.2 | Read: Projekt laden | Alle Felder korrekt | [ ] |
| 17.1.3 | Update: Projekt ändern | Änderungen persistiert | [ ] |
| 17.1.4 | Delete: Projekt löschen | Aus DB entfernt | [ ] |

### Test 17.2: Referenzielle Integrität

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 17.2.1 | Projekt mit Immobilien löschen | Warnung anzeigen | [ ] |
| 17.2.2 | Unternehmen mit Projekten löschen | Warnung anzeigen | [ ] |
| 17.2.3 | Cascade-Delete prüfen | Verknüpfungen bereinigt | [ ] |

---

## 18. Onboarding Tests

### Test 18.1: Willkommens-Dialog

| Schritt | Aktion | Erwartetes Ergebnis | ✓/✗ |
|---------|--------|---------------------|-----|
| 18.1.1 | Erster Login | Dialog erscheint | [ ] |
| 18.1.2 | "Los geht's" klicken | Tour startet | [ ] |
| 18.1.3 | "Später" klicken | Dialog schließt | [ ] |
| 18.1.4 | Zweiter Login | Dialog erscheint NICHT | [ ] |
| 18.1.5 | localStorage löschen | Dialog erscheint wieder | [ ] |

---

## 19. Testprotokoll

### Zusammenfassung

| Kategorie | Gesamt | Bestanden | Fehlgeschlagen |
|-----------|--------|-----------|----------------|
| Authentifizierung | | | |
| Dashboard | | | |
| Navigation | | | |
| Projekte | | | |
| Immobilien | | | |
| Angebote | | | |
| Unternehmen | | | |
| Baustellen | | | |
| HubSpot | | | |
| E-Mail | | | |
| Responsive | | | |
| Performance | | | |
| Fehlerbehandlung | | | |
| Accessibility | | | |
| Sicherheit | | | |
| Datenintegrität | | | |
| Onboarding | | | |
| **GESAMT** | | | |

### Gefundene Fehler

| ID | Beschreibung | Schweregrad | Status |
|----|--------------|-------------|--------|
| | | | |

### Tester-Notizen

_Hier Notizen während des Tests eintragen_

---

## 20. Abnahmekriterien

Die Generalprobe gilt als **bestanden**, wenn:

1. **Alle kritischen Tests** (Authentifizierung, CRUD, HubSpot-Sync) bestanden
2. **Mindestens 95%** aller Tests bestanden
3. **Keine Blocker-Fehler** (Schweregrad: Kritisch)
4. **Alle 10 Workflow-Varianten** pro Modul erfolgreich durchlaufen
5. **Responsive Design** auf Desktop, Tablet und Mobile funktioniert
6. **Performance-Ziele** eingehalten

---

**Testplan erstellt am:** 05. Februar 2026  
**Geschätzte Testdauer:** 4-6 Stunden für vollständige Durchführung
