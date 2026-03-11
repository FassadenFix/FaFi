# Design-Konsistenz-Prüfung – FaFi PM Generalprobe

## 1. Dashboard (/)
- FassadenFix Logo: Korrekt im Sidebar-Header, grün (#77bc1f)
- Sidebar: Dunkler Hintergrund (#4e5758), weiße Schrift, grüner aktiver Zustand
- Navigation: 4 Gruppen (Projektmanagement, Kundenberatung, Planung & Einsatz, Durchführung)
- Hero-Banner: Hintergrundbild mit Text-Overlay, gut lesbar
- KPI-Karten: Skeleton-Loading konsistent
- Suchleiste: Oben zentriert mit ⌘K Shortcut
- Datum: Oben rechts "09. Feb 2026 · KW 7"
- Dark/Light Toggle: Vorhanden
- Benachrichtigungs-Badge: Rotes Badge mit "3"
- Benutzer-Info: Unten links mit Avatar-Initial, Name und Rolle
- **Bewertung: OK**

## 2. Projekte (/projekte)
- 4 KPI-Karten (Gesamt, In Bearbeitung, Angebote, Abgeschlossen) mit farbigen Icons
- Suchfeld und Filter (Phasen, Sortierung)
- Projekt-Karten mit Phasen-Badge, Projektnummer, Zeitraum
- "Neues Projekt" Button grün (CI-konform)
- Breadcrumb-Navigation vorhanden
- **Bewertung: OK**

## 3. Vorbereitungsaufgaben (/vorbereitungsaufgaben)
- Kanban-Board mit 3 Spalten (Offen, In Bearbeitung, Erledigt)
- Farbige Spalten-Header (Orange, Blau, Grün)
- Ampel-Legende rechts oben (Im Plan, Bald fällig, Überfällig)
- 7 KPI-Karten (Gesamt, Offen, In Arbeit, Erledigt, Überfällig, AG offen, AN offen)
- Filter: Baustellen + Verantwortliche
- Empty State mit Erklärungstext
- **Bewertung: OK**

## 4. Archiv (/archiv)
- 8 Statistik-Karten (Gesamt, Dokumente, Fotos, Angebote, Rechnungen, Garantien, Mahnungen, Auto-Archiv)
- 7 Quellen-Tabs mit Zähler
- Volltextsuche-Feld mit beschreibendem Placeholder
- Tabelle mit Dateiname, Quelle, Kategorie, Verknüpfungen, Größe, Erstellt, Aktionen
- "Datei hochladen" Button grün
- **Befund: 35 Dokumente vorhanden, alle als "Archiv-Dokument" kategorisiert, alle 500KB**
- **Befund: Verknüpfungen-Spalte zeigt "–" für alle Einträge → Verknüpfungen fehlen**
- **Bewertung: MINOR – Verknüpfungen sollten angezeigt werden**

## 5. Angebote (/angebote)
- 4 KPI-Karten (Gesamt, Diesen Monat, Gesamtwert, Angenommen)
- Tabelle mit Angebotsnr., Projekt, Kunde, Status, Fläche, Preis, Gültig bis, Aktionen
- Aktionen-Spalte: PDF-Vorschau, Versionshistorie, Download, Kopieren, Neue Version, Mehr
- Status-Badge "Entwurf" korrekt
- **Befund: 1 Angebot ohne Projekt/Kunde-Zuordnung → "Kein Projekt", "Kein Kunde"**
- **Bewertung: OK (Testdaten-Problem)**

## 6. Baustellen (/baustellen)
- 4 KPI-Karten (Gesamt, Aktiv, Geplant, Pausiert) mit farbigen Icons
- Tabelle mit Baustelle, Projekt, Zeitraum, Fortschritt, Status
- Empty State: "Noch keine Baustellen vorhanden"
- **Bewertung: OK**

## 7. Unternehmen & Kontakte (/kontakte)
- Route ist /kontakte (nicht /unternehmen) – Sidebar-Link korrekt konfiguriert
- 3 KPI-Karten: 102 Unternehmen, 104 Kontakte, 0 Entscheider
- Tabs: Unternehmen (102) / Alle Kontakte (104)
- Hierarchische Darstellung: Unternehmen mit Typ-Badge, PLZ/Ort, Kontakt-Anzahl
- Alle aufklappen/zuklappen Buttons
- **Bewertung: OK**

## Zusammenfassung Design-Konsistenz
- CI-Farben: Durchgängig korrekt (#77bc1f, #4e5758)
- Typografie: Konsistent
- Abstände: Gleichmäßig
- KPI-Karten: Einheitliches Design über alle Seiten
- Buttons: Grün für primäre Aktionen, konsistent
- Sidebar: Stabil, alle Gruppen korrekt
- 404-Seite: Gut gestaltet (aber sollte nicht auftreten)
- **1 MINOR: Archiv-Verknüpfungen fehlen bei den meisten Einträgen**
- **Kein CRITICAL Bug gefunden**
