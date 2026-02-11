# Frontend-UX Prüfung – Befunde

## Dashboard
- KPI-Widgets zeigen Skeleton-Loader (Platzhalter) – Daten laden korrekt
- Willkommens-Banner mit Datum und Hero-Bild korrekt
- Sidebar-Navigation vollständig: 4 Bereiche (Projektmanagement, Kundenberatung, Planung & Einsatz, Durchführung)
- Benutzer "Benutzer" unten links (Rolle: Benutzer) – kein Admin-Zugang sichtbar
- Nächste Schritte, Schnellaktionen, HubSpot-Sync Widget vorhanden
- BEFUND: KPI-Widgets zeigen nur Skeleton – evtl. Ladeproblem oder fehlende Daten
- BEFUND: HubSpot zeigt "Nicht verbunden" – erwartet, da kein API-Key konfiguriert

## Projekte-Seite
- 4 Projekte korrekt angezeigt mit Phase-Badges, Suche, Filter
- KPI-Karten: 4 Gesamt, 0 In Bearbeitung, 1 Angebote, 0 Abgeschlossen
- Breadcrumb-Navigation vorhanden

## Angebote-Seite
- KPI-Karten zeigen Skeleton-Loader (Daten laden)
- Angebotsliste zeigt Skeleton-Loader – 1 Angebot in DB vorhanden
- "Neues Angebot" Button vorhanden

## Immobilien-Seite
- 6 Immobilien korrekt angezeigt mit Tabelle
- KPIs: 6 Immobilien, 3.0k m² Reinigungsfähig, 0 Fotos, 2 Mit Projekt
- Eigentümer-Spalte: Meist "Kein Eigentümer" – Datenqualität-Hinweis
- Duplikat: "An der Saalebahn 8a" erscheint zweimal

## Baustellen-Seite
- Leer (0 Baustellen) – korrekt, da keine Baustellen in DB
- Empty-State mit "Noch keine Baustellen vorhanden" korrekt

## Browser-Konsole
- WARNUNG: "Popover is changing from uncontrolled to controlled" – Radix-UI Warnung (nicht kritisch)
- FEHLER (historisch, 15:17 Uhr): "getBasispreis is not defined" im AngebotWizard – wurde wahrscheinlich schon gefixt
- Keine aktuellen Fehler bei Seitennavigation

## AngebotWizard
- Öffnet korrekt als Modal-Dialog über Angebote-Seite
- 5-Schritt-Wizard: Projekt, Immobilien & Seiten, Kalkulation, (2 weitere)
- Unternehmen-Suche, Entwurf-Speicherung, Weiter/Zurück-Navigation vorhanden
- getBasispreis-Bug wurde behoben (nur noch als Kommentar im Code)
- BEFUND: /angebote/neu gibt 404 – Wizard ist nur über Button auf /angebote erreichbar (kein Deep-Link)

## Kontakte-Seite (Verwaist-Tab)
- Amber-Warnbanner "941 verwaiste Kontakte" korrekt angezeigt
- 3 Tabs: Hierarchisch (2799), Alle Kontakte (5220), Verwaist (941)
- Bereinigen-Button vorhanden
- KPIs: 2799 Unternehmen, 5220 Kontakte, 0 Entscheider

## Performance
- Haupt-Bundle: 2.17 MB (index-BIf2eFzn.js) – KRITISCH, Code-Splitting empfohlen
- PieChart: 446 KB (Recharts-Bibliothek)
- html2canvas: 202 KB
- CSS: 191 KB
- Baustellen: 169 KB, Angebote: 136 KB, Bibliothek: 130 KB
- Große Komponenten: AngebotWizard (2167 Zeilen), ObjektaufnahmeWizard (2121 Zeilen)

## Security
- 149 publicProcedure vs 147 protectedProcedure – viele Lese-Endpunkte sind öffentlich
- BEFUND: Alle list/getById-Endpunkte sind publicProcedure – Daten ohne Login abrufbar
- Schreiboperationen (create/update/delete) korrekt als protectedProcedure

## Browser-Konsole
- Keine aktuellen Fehler
- Warnung: Popover uncontrolled→controlled (Radix-UI, nicht kritisch)
