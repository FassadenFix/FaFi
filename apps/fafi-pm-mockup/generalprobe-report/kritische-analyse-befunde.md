# Kritische Analyse – Befunde vor Veröffentlichung

## 1. HARDCODIERTE MOCK-DATEN (KRITISCH)

### Seiten mit komplett hardcodierten Daten (kein DB-Zugriff):
- Finanzen.tsx: 5 Arrays (umsatzEntwicklung, kostenverteilung, projektRentabilitaet, zahlungsStatus, quartalsvergleich) - ALLES erfunden
- Einsatzplanung.tsx: mockMitarbeiter (8 Personen), mockProjekte (5 Projekte), initialZuege (3 Züge) - ALLES erfunden
- Ressourcen.tsx: teamMembers (6 Personen), teamBookings, buehnenBookings, waschbusBookings, mietbuehnenBookings - ALLES erfunden
- CustomerPortal.tsx: mockProject, phases, documents, photos - ALLES erfunden
- PDFEntwuerfe.tsx: mockData (Kundendaten, Positionen) - kein tRPC
- Berichtswesen.tsx: mitarbeiterLeistung (4 Personen mit Umsätzen) - ERFUNDEN

### Komponenten mit hardcodierten Mock-Daten:
- DashboardWidgets.tsx: ConstructionSitesWidget (Sonnenhof, Campus), WeatherWidget (8°C fest), TeamAvailabilityWidget (3 Namen)
- FotoGalerie.tsx: MOCK_FOTOS als Default-Parameter
- HubSpotKundensuche.tsx: MOCK_HUBSPOT_KONTAKTE (komplett statisch statt echte HubSpot-Suche)
- AngebotWizard.tsx: MOCK_UNTERNEHMEN (statt DB-Abfrage)
- ProjektZuordnungStep.tsx: MOCK_UNTERNEHMEN (statt DB-Abfrage)
- ImmobilienPDFExport.tsx: MOCK_FOTOS
- OfflineMode.tsx: MOCK_SYNC_QUEUE
- AngebotVersionierung.tsx: MOCK_VERSIONEN
- BaustelleWizard.tsx: Hardcodierte Mitarbeiternamen im Select
- GlobalSearch.tsx: Hardcodierte recentSearches ["Sonnenhof", "Bürokomplex", "ANG-2026"]
- TeamsIntegration.tsx: Hardcodierte Chat-Nachrichten und Meetings

## 2. DATENBANK-ZUSTAND

| Tabelle | Zeilen | Bewertung |
|---------|--------|-----------|
| projects | 4 | OK - echte Daten |
| companies | 2800 | OK - HubSpot-Sync |
| contacts | 5220 | OK - HubSpot-Sync |
| properties | 6 | OK - echte Daten |
| offers | 1 | OK |
| orders | 0 | Leer |
| invoices | 0 | Leer |
| constructionSites | 0 | Leer |
| tasks | 2 | Wenig |
| employees | 30 | OK - Personio-Import |
| documents | 235 | OK |
| warranties | 0 | Leer |
| users | 3 | OK |
| activityLogs | 28 | OK |
| notifications | 0 | Leer |
| photos | 0 | Leer |

## 3. ZUGRIFFSRECHTE (PROBLEMATISCH)

- HR-Bereich: Admin-only Check vorhanden (ctx.user.role !== "admin")
- Bibliothek: Hat eigene libraryViewProcedure/libraryEditProcedure mit Permission-Check
- ABER: Sidebar zeigt ALLE Seiten für ALLE Rollen an (getFilteredNavSections filtert nur nach fafiRole)
- Seiten wie Finanzen, Berichte, HR sind in der Sidebar für JEDEN sichtbar
- Kein "ausgegraut" für nicht-freigegebene Seiten (Anforderung des Nutzers!)

## 4. WILLKOMMENSTOUR & HELFER

- Onboarding.tsx: 902 Zeilen, rollenbasierte Tour-Steps vorhanden
- HelpTooltip.tsx: Umfangreiche Helfer-Tooltips implementiert
- Tour ist rollenbasiert (gf, kundenberater, at_leiter, projektleiter, buero)
- ABER: Tour zeigt auf Seiten, die Mock-Daten haben → irreführend

## 5. RESPONSIVITÄT

- Mobile Sidebar: Sheet-basiert (lg:hidden), funktioniert
- Touch-Targets: touch-target CSS-Klasse vorhanden
- iPad-Optimierung: BuildingVisualization touch-optimiert
- ABER: Kein systematischer iPad-Test durchgeführt
- Dashboard KPI-Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 → OK

## 6. DESIGN-KONSISTENZ

- FassadenFix CI: #77bc1f und #4e5758 konsequent verwendet
- "Organic Flow" Design-Sprache durchgängig
- Dark Mode: Toggle vorhanden
- ABER: Einige Seiten (Finanzen, Berichte) nutzen hardcodierte Farben statt CSS-Variablen

## 7. FEHLENDE MATERIALIEN-SEITE

- Sidebar-Link /materialien existiert
- App.tsx hat KEINE Route für /materialien
- → 404 beim Klick auf "Materialien" in der Sidebar
