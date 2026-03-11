# FaFi PM – Vollständiger Test-Prompt v3.0

**Autor:** Manus AI
**Version:** 3.0
**Datum:** 09. Februar 2026
**Anwendung:** FassadenFix Projektmanagement-Software (FaFi PM)
**Basis:** Optimiert aus Test-Prompt v2.0 (Baustellenmanager) auf die gesamte Anwendung

---

## ZIEL

Umfassender, nachvollziehbarer Test der **FassadenFix Projektmanagement-Software (FaFi PM)** – einer Full-Stack-Webanwendung fuer die digitale Verwaltung von Fassadenreinigungsprojekten mit CRM, Angebots-/Auftrags-/Baustellenmanagement, Kundenportal und Integrationen.

Du pruefst JEDE Funktion, JEDES Feature, JEDEN Button, jede Interaktion gegen die definierten **FassadenFix Skills** als verbindliche Referenz (Source of Truth) und gegen die **Konzeptionsdokumente** (Interviews, MVP-Spezifikation, Implementierungsplan).

---

## 0) INPUTS / SPEZIFIKATION

### 0.1 FassadenFix Skills (Source of Truth)

Lies und aktiviere folgende Skills als verbindliche Referenz:

| Skill | Pfad | Pruefbereich |
|-------|------|-------------|
| fassadenfix-branding | `/home/ubuntu/skills/fassadenfix-branding/SKILL.md` | Farben (#77bc1f, #4e5758), Typografie (Raleway), UI-Komponenten, Spacing, Shadows |
| fassadenfix-identity | `/home/ubuntu/skills/fassadenfix-identity/SKILL.md` | Claim, Tonalitaet, Markensprache, USPs, Vision/Mission |
| fassadenfix-assets | `/home/ubuntu/skills/fassadenfix-assets/SKILL.md` | Logo-Dateien, Favicons, Icons, PWA-Icons |
| fassadenfix-copywriting | `/home/ubuntu/skills/fassadenfix-copywriting/SKILL.md` | CTA-Texte, Formulierungen, Tonalitaet, Sprachstil |
| fassadenfix-image-select | `/home/ubuntu/skills/fassadenfix-image-select/SKILL.md` | Bildauswahl, Qualitaetskriterien, Farbharmonie |

### 0.2 Implementierter Feature-Stand

Lies die aktuelle Feature-Liste aus `/home/ubuntu/fafi-pm-mockup/todo.md` als Referenz fuer implementierte Funktionen. Aktueller Stand: 222/224 Items erledigt (99,1%).

### 0.3 Technischer Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Frontend | React 19 + Tailwind CSS 4 | Aktuell |
| Backend | Express 4 + tRPC 11 | Aktuell |
| Datenbank | MySQL (TiDB) via Drizzle ORM | 37 Tabellen |
| Auth | Manus OAuth + Microsoft 365 SSO | JWT |
| Integrationen | HubSpot CRM, Microsoft Graph, Open-Meteo | API |
| Tests | Vitest (485 Unit-Tests, 23 Dateien) + Playwright (49 E2E) | Aktuell |

### 0.4 Zielgruppen

Die Anwendung richtet sich an **5 Benutzerrollen** bei FassadenFix:

| Rolle | Abkuerzung | Zugriff | Profil |
|-------|-----------|---------|--------|
| Geschaeftsfuehrung | GF | Vollzugriff auf alle Bereiche | Strategisch, KPI-orientiert |
| Kundenberater | KB | Erstellen, Kundenberatung, Planung | Vertrieb, Kundenkontakt |
| AT-Leiter | ATL | Erstellen, Umsetzung, Baustellen | Operativ, Baustelle |
| Projektleiter | PL | Erstellen, Planung, Umsetzung, Vorbereitung | Koordination |
| Buero | Buero | Erstellen, Kundenberatung, Finanzen, System | Verwaltung |

Zusaetzlich: Kundenportal-Nutzer (extern, token-basiert, pro Unternehmen)

---

## 1) TEST-STRATEGIE

### Ebene A: Feature-Inventur (Coverage-Sicherung)
Alle 45 Seiten, 38 tRPC-Router, 37 DB-Tabellen systematisch erfassen und gegen todo.md abgleichen.

### Ebene B: Funktionales Testing (Happy Paths + Edge Cases)
Kernprozesse end-to-end testen: Projekt -> Angebot -> Auftrag -> Baustelle -> Abnahme -> Rechnung -> Garantie.

### Ebene C: Skill-Compliance (FassadenFix Corporate Design)
Jede Seite gegen die 5 FassadenFix Skills pruefen (Farben, Typografie, Logos, Texte, Bilder).

### Ebene D: Nicht-funktionale Tests (UX, Accessibility, Performance, Offline)
Responsive Design, Keyboard-Navigation, Loading States, Offline-Faehigkeit.

### Ebene E: Integrations-Tests
HubSpot Bidi-Sync, Microsoft 365 SSO/E-Mail, Open-Meteo Wetter, Workflow-Automatisierungen.

### Ebene F: Rollenbasierte Zugriffskontrolle
Jede Rolle einzeln testen: Sieht der Nutzer nur die fuer ihn freigegebenen Bereiche?

### Deliverables

1. **Feature/Button-Inventar** (Seitenbaum + Komponentenliste pro Navigationsbereich)
2. **Testfall-Katalog** mit IDs (TC-001 ...) gruppiert nach Bereich
3. **Skill-Compliance-Matrix** (Skill -> Anforderung -> Umsetzung -> Status)
4. **Bug Reports** im Standardformat (siehe Abschnitt 9)
5. **Risiko- und Prioritaetenliste** (Blocker/Critical/Major/Minor)
6. **Empfehlungen** (Quick Fixes + Mid-Term + Structural)
7. **Massnahmenplan** mit priorisierten Aufgaben und Aufwandsschaetzungen

---

## 2) SETUP UND SAFETY

- Verwende ausschliesslich Testdaten (Projektnummer: FF-TEST-*)
- Keine destruktiven Aktionen ohne Dokumentation
- Jede Beobachtung muss reproduzierbar sein: Schritte + Screenshots
- Teste primaer auf Desktop (1920px), dann iPad (768px), dann Mobile (375px)
- Pruefe sowohl Light- als auch Dark-Mode

---

## 3) INVENTUR: VOLLSTAENDIGER SEITENBAUM

### 3.1 Bereich 1 - Erstellen und Erfassen

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Dashboard | `/` | KPI-Widgets, Naechste Schritte, Nachfassen, Aktivitaeten, Zeitraumfilter | dashboard |
| Projekte | `/projekte` | Projektliste mit Phasen-Filter, Bulk-Aktionen, Suche | project |
| ProjektDetail | `/projekte/:id` | Phasenuebergaenge, WorkflowActionBar, Tabs, Tiefenverknuepfung | project |
| Baustellen | `/baustellen` | Baustellenliste mit Status-Filter, Tabellen-Format | constructionSite |
| Immobilien | `/immobilien` | Immobilienliste mit Zuordnungen, M:N zu Projekten | property |

### 3.2 Bereich 2 - Kundenberatung

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Unternehmen und Kontakte | `/kontakte` | Hierarchische Gruppierung (Unternehmen -> Kontakte), Collapsible | company, contact |
| Angebote | `/angebote` | Angebotsliste, Versionierung, Nachfass-Badges, Status-Filter | offer |
| Auftraege | `/auftraege` | Auftragsliste, Status-Tracking | order |
| AuftragDetail | `/auftraege/:id` | Auftragsdetails, verknuepfte Dokumente | order |
| Garantien und Inspektionen | `/garantien` | Garantieliste, Inspektionsplanung | warranty |
| GarantieDetail | `/garantien/:id` | Garantiedetails, PDF-Export | warranty |

### 3.3 Bereich 3 - Planung

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Terminfinder | `/terminfinder` | Terminplanung, Kalenderansicht | appointment |
| Team einplanen | `/einsatzplanung` | Kalender-basierte Einsatzplanung, Konfliktpruefung | deployment |
| Ressourcenplaner | `/ressourcen` | Teamverfuegbarkeit, Geraeteauslastung | resource |

### 3.4 Bereich 4 - Projektvorbereitung

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Offene Projekte | `/projekte-offen` | Gefilterte Projektliste (offene Phase) | project |
| Ueberfaellige Projekte | `/projekte-ueberfaellig` | Projekte mit ueberschrittenem Zeitplan | project |
| Offene Baustellen | `/baustellen-offen` | Baustellen in Vorbereitung | constructionSite |
| Ueberfaellige Baustellen | `/baustellen-ueberfaellig` | Baustellen mit Verzug | constructionSite |

### 3.5 Bereich 5 - Umsetzung

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Teamleitercheck | `/teamleitercheck` | Checklisten-basierte Baustellenkontrolle | teamleiterCheck |
| Baustellenmanager | `/mobile` | Mobile Baustellenansicht, Foto-Upload, GPS, Wetter | constructionSite, photo |
| Auswertung und Abschluss | `/berichte` | Berichtswesen mit Diagrammen, Pipeline, Conversion | report |

### 3.6 Bereich 6 - Finanzen

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Finanzuebersicht | `/finanzen` | Umsatz, Aussenstaende, Cashflow, Budget-Vergleich | finance |
| Rechnungen | `/rechnungen` | Rechnungsliste, Mahnlauf-Status | invoice |
| RechnungDetail | `/rechnungen/:id` | Rechnungsdetails, Mahnhistorie, PDF-Export | invoice, dunning |
| Zahlungen | `/zahlungen` | Zahlungsuebersicht, Zuordnung | payment |
| Budgets | `/budgets` | Budgetplanung und -kontrolle | budget |

### 3.7 Bereich 7 - Kundenportal

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Portal-Uebersicht | `/kundenportal` | Portal-Verwaltung, Token-Generierung | portal |
| Kundenportal (extern) | `/portal/:token` | Ampel-System, Dokumente, Feedback, Nachrichten | portal |
| Dokumente teilen | `/dokumente` | Dokumenten-Freigabe fuer Kunden | document |
| Kundenmeldungen | `/kundenmeldungen` | Eingehende Kundenanfragen | portal |

### 3.8 Bereich 8 - Unternehmenssystem

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Archiv | `/archiv` | Zentrales Dokumentenarchiv mit Entitaets-Verknuepfungen | document |
| Vorlagen und Textbausteine | `/vorlagen` | Vorlagen-Verwaltung, Textbausteine | textBlock, offerTemplate, emailTemplate |
| Bibliothek | `/bibliothek` | Wissensdatenbank, Anleitungen | - |

### 3.9 Bereich 9 - System und Einstellungen

| Seite | Route | Kernfunktion | Router |
|-------|-------|--------------|--------|
| Mitarbeiter | `/team` | Team-Verwaltung, Rollen-Zuweisung | teamMember |
| HubSpot | `/hubspot` | Sync-Status, Mapping, Protokoll, Fehler-Log | hubspot |
| Spracheingabe | `/sprachsteuerung` | Platzhalter (Kommt in zukuenftiger Version) | - |
| Einstellungen | `/einstellungen` | Profil, Benachrichtigungen, Theme | user |

### 3.10 Uebergreifende Komponenten

| Komponente | Ort | Kernfunktion |
|------------|-----|--------------|
| DashboardLayout | Sidebar | 8 Navigationsbereiche, rollenbasiert, collapsible |
| GlobalSearch | Header (Cmd+K) | Suche ueber Projekte, Kontakte, Angebote, Filter speichern |
| NotificationDropdown | Header (Glocke) | Live-Badge, Benachrichtigungsliste, markAsRead |
| Breadcrumb | Header | Kontextuelle Brotkruemel-Navigation |
| OfflineIndicator | Header | Offline-Status-Anzeige |
| Onboarding | Overlay | Erstnutzer-Tour |
| ErrorBoundary | Global | Fehlerbehandlung mit deutscher Fehlermeldung |
| KeyboardShortcuts | Global | Alt+1-6 Navigation, Alt+N Neues Projekt, Alt+B Benachrichtigungen |

### 3.11 Wizards (Formular-Workflows)

| Wizard | Ausloeser | Schritte | Kernfunktion |
|--------|----------|----------|--------------|
| ProjektWizard | Neues Projekt | ~5 | Projekt anlegen mit Kundenzuordnung |
| ObjektaufnahmeWizard | Immobilie erfassen | ~6 | Gebaeudedaten, Fotos pro Seite (Frontseite!), Entwurf-Funktion |
| AngebotWizard | Neues Angebot | ~7 | Preiskalkulation, Fruehbucher-Rabatt (dynamisch), Stoerer, PDF-Vorschau |
| BaustellenWizard | Neue Baustelle | ~4 | Baustelle aus Projekt erstellen, Uebernachtungs-Empfehlung |
| VorherDokuWizard | Vorher-Doku starten | ~4 | Pflicht-Fotodokumentation vor Baustellenstart |
| NachherDokuWizard | Nachher-Doku | ~4 | Ergebnis-Fotos, Vorher/Nachher-Vergleich |
| AuftragAnnahmeWizard | Auftrag annehmen | ~3 | Auftragsbestaetigung generieren |
| AbnahmeWizard | Abnahme starten | ~3 | Abnahmeprotokoll, Nachher-Doku Voraussetzung |

---

## 4) FUNKTIONALES TESTING

### 4.1 Kernprozess: Projekt-Lebenszyklus (End-to-End)

| TC-ID | Testfall | Erwartetes Ergebnis | Phase |
|-------|----------|---------------------|-------|
| TC-001 | Neues Projekt anlegen (ProjektWizard) | Projekt mit Phase Objektaufnahme erstellt | OBJEKTAUFNAHME |
| TC-002 | Immobilie erfassen (ObjektaufnahmeWizard) | Immobilie mit Fotos pro Seite (Frontseite!) gespeichert | OBJEKTAUFNAHME |
| TC-003 | Entwurf speichern und fortsetzen | Entwurf wird beim erneuten Oeffnen geladen | OBJEKTAUFNAHME |
| TC-004 | Angebot erstellen (AngebotWizard) | Angebot mit Preiskalkulation, Phase -> Angebot erstellt | ANGEBOT_ERSTELLT |
| TC-005 | Fruehbucher-Rabatt pruefen | Dynamisch berechnet basierend auf aktuellem Saisonjahr | ANGEBOT_ERSTELLT |
| TC-006 | Angebot versenden | Phase -> Angebot versendet, 3 Nachfass-Erinnerungen (7/14/30 Tage) | ANGEBOT_VERSENDET |
| TC-007 | Nachfassen (7 Tage) | Nachfass-Widget im Dashboard, Badge in Angebotsliste | NACHFASSEN |
| TC-008 | Auftrag annehmen | Phase -> Auftrag gewonnen, Auftragsbestaetigung generiert | AUFTRAG_GEWONNEN |
| TC-009 | Baustelle erstellen | Daten aus Objektaufnahme uebernommen, Uebernachtungs-Empfehlung | PLANUNG |
| TC-010 | Vorher-Dokumentation | Pflicht-Fotos, Baustellenstart blockiert bis abgeschlossen | VORBEREITUNG |
| TC-011 | Baustelle starten | Phase -> Durchfuehrung, nur wenn Vorher-Doku complete | DURCHFUEHRUNG |
| TC-012 | Taegliche Meldung | Wetter, Fortschritt, Fotos, Bautagebuch | DURCHFUEHRUNG |
| TC-013 | Nachher-Dokumentation | Ergebnis-Fotos, Vorher/Nachher-Vergleich | DURCHFUEHRUNG |
| TC-014 | Abnahme durchfuehren | Nachher-Doku als Voraussetzung, Abnahmeprotokoll | ABNAHME |
| TC-015 | Projekt abschliessen | Phase -> Abgeschlossen, Rechnungsentwurf automatisch | ABGESCHLOSSEN |
| TC-016 | Rechnung erstellen und versenden | PDF im Corporate Design, Mahnlauf-Tracking | ABGESCHLOSSEN |
| TC-017 | Garantie aktivieren | Garantie nach Zahlungseingang, 5 Jahre, jaehrliche Inspektion | ABGESCHLOSSEN |

### 4.2 Workflow-Automatisierungen

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-020 | Phasenuebergang validieren | Keine willkuerlichen Spruenge, Guards pruefen Voraussetzungen |
| TC-021 | Auto-Tasks bei Phasenwechsel | Rollenspezifische Aufgaben werden automatisch erstellt |
| TC-022 | Dokumenten-Kette | Angebot -> Auftragsbestaetigung -> Rechnung automatisch verknuepft |
| TC-023 | Nachfass-System | 3 Erinnerungen (7/14/30 Tage) nach Angebotsversand |
| TC-024 | Mahnlauf | Automatische Mahnstufen 30/60/90 Tage bei ueberfaelligen Rechnungen |
| TC-025 | Scheduled Tasks Engine | TaskRunner verarbeitet faellige Tasks alle 5 Minuten |

### 4.3 Dashboard und KPIs

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-030 | KPI-Widgets laden | Projekte, Angebote, Auftraege, Conversion-Rate mit echten Daten |
| TC-031 | Zeitraumfilter | Aktuell/Monat/Quartal/Jahr wechselbar |
| TC-032 | Naechste-Schritte-Widget | Zeigt pro Projekt den naechsten Workflow-Schritt |
| TC-033 | Nachfassen-Widget | Faellige Nachfass-Erinnerungen mit Countdown |
| TC-034 | Ueberfaellige Aufgaben | Eskalationsfarben (gelb/orange/rot) |
| TC-035 | Letzte Aktivitaeten | Chronologisch, gruppiert, mit Entitaets-Links |

### 4.4 CRM: Unternehmen und Kontakte

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-040 | Hierarchische Anzeige | Unternehmen als Gruppen, Kontakte darunter, collapsible |
| TC-041 | Unternehmen erstellen | Mit Kategorie (Wohnungsgesellschaft, Hausverwaltung, etc.) |
| TC-042 | Kontakt zu Unternehmen zuordnen | Kontakt erscheint unter dem Unternehmen |
| TC-043 | HubSpot-Sync-Status | Sync-Badge pro Kontakt/Unternehmen |

### 4.5 Angebotswesen

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-050 | AngebotWizard durchlaufen | Alle Schritte, Pflichtfelder mit rotem Stern |
| TC-051 | Preiskalkulation | Preisstaffelung nach Flaeche, korrekte Berechnung |
| TC-052 | Fruehbucher-Rabatt | Dynamisch basierend auf Saisonjahr (nicht hardcoded) |
| TC-053 | Angebots-Versionierung | Neue Version erstellt, alte als obsolet markiert |
| TC-054 | PDF-Vorschau | Corporate Design, Logo, Stoerer, Bedingungen |
| TC-055 | Angebot per E-Mail versenden | E-Mail-Vorschau, Graph API Versand |

### 4.6 Baustellenmanagement

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-060 | Baustelle anlegen | Daten aus Projekt/Objektaufnahme uebernommen |
| TC-061 | Uebernachtungs-Empfehlung | Automatisch basierend auf Entfernung/Dauer |
| TC-062 | Vorher-Dokumentation (Pflicht) | Baustellenstart blockiert bis Vorher-Doku abgeschlossen |
| TC-063 | Arbeitstag beginnen | Planungsfrage, Wetter-Uebernahme |
| TC-064 | Ereignis melden | Kategorien, Foto-Upload, Dringlichkeit |
| TC-065 | Arbeitstag beenden | Bereiche, Logbuch, Wetter, Fotos, Bautagebuch |
| TC-066 | Nachher-Dokumentation | Ergebnis-Fotos, Vorher/Nachher-Vergleich (Side-by-Side) |
| TC-067 | GPS-Auto-Erfassung | GPS-Koordinaten automatisch bei Foto-Upload |
| TC-068 | Wetterdaten-Integration | Open-Meteo automatisch 3x taeglich |

### 4.7 Foto-Upload und Dokumentation

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-070 | Kamera-Aufnahme | Foto wird aufgenommen und hochgeladen (S3) |
| TC-071 | Galerie-Upload | Foto aus Mediathek hochgeladen |
| TC-072 | Automatische Benennung | Format: Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN.jpg |
| TC-073 | Foto-Komprimierung | Client-seitig >500KB, 80% JPEG |
| TC-074 | Wasserzeichen | Datum, Uhrzeit, GPS, Baustellenname |
| TC-075 | Foto-Vorschau (Thumbnail) | 400px Thumbnail clientseitig generiert |
| TC-076 | Seiten-Bezeichnung | Frontseite (nicht Eingangsseite), Rueckseite, Linker/Rechter Giebel |

### 4.8 Kundenportal

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-080 | Token-basierter Zugang | Pro Unternehmen, nicht pro Projekt |
| TC-081 | Ampel-System | Gruen/Gelb/Rot pro Projekt und Baustelle |
| TC-082 | Dokumenten-Zugriff | 3-Ebenen-System (oeffentlich/eingeschraenkt/vertraulich) |
| TC-083 | Feedback-Formular | Sterne-Bewertung nach Projektabschluss |
| TC-084 | Nachrichten-System | Kunde zu FassadenFix bidirektional |
| TC-085 | Vorher/Nachher-Fotos | Im Portal sichtbar |
| TC-086 | Aufgaben-Unterscheidung | Auftraggeber vs. Auftragnehmer klar getrennt |

### 4.9 Finanzen und Mahnwesen

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-090 | Finanzuebersicht | Umsatz, Aussenstaende, Cashflow mit Diagrammen |
| TC-091 | Rechnung erstellen | PDF im Corporate Design |
| TC-092 | Mahnlauf | Automatische Stufen 30/60/90 Tage |
| TC-093 | Zahlungseingang buchen | Rechnung als bezahlt markiert |
| TC-094 | Budget-Kontrolle | Soll/Ist-Vergleich |

### 4.10 Integrationen

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-100 | HubSpot -> FaFi Sync | Unternehmen und Kontakte importiert |
| TC-101 | FaFi -> HubSpot Sync | Statusaenderungen werden zurueckgespielt |
| TC-102 | Sync-Konfliktloesung | Timestamp-basiert (neuere Aenderung gewinnt) |
| TC-103 | Microsoft 365 SSO | Login ueber Microsoft-Konto |
| TC-104 | E-Mail via Graph API | Angebote/Rechnungen per Outlook versenden |
| TC-105 | Outlook-Kalender-Sync | Baustellen-Termine im Outlook-Kalender |
| TC-106 | Open-Meteo Wetter | Aktuelle Wetterdaten fuer Baustellenort |

### 4.11 Edge Cases

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-110 | Pflichtfelder leer absenden | Validierungsfehler mit hilfreicher Meldung |
| TC-111 | Doppelklick auf Submit | Keine Duplikate (Button-Deaktivierung) |
| TC-112 | Offline-Modus | Daten lokal in IndexedDB gespeichert |
| TC-113 | Sync nach Online | Automatische Synchronisation via Service Worker |
| TC-114 | Ungueltiger Portal-Token | Fehlermeldung, kein Zugriff |
| TC-115 | Phasensprung versuchen | Guard-Funktion blockiert, Fehlermeldung |
| TC-116 | Leere Listen | Empty States mit konstruktivem Text und CTA |
| TC-117 | Sehr lange Texte | Keine Layout-Brueche, Textueberlauf behandelt |

---

## 5) SKILL-COMPLIANCE-PRUEFUNG

### 5.1 fassadenfix-branding

| Anforderung | Soll-Wert | Pruefpunkte (alle Seiten) |
|-------------|-----------|--------------------------|
| Primaerfarbe | #77bc1f (Pantone 368 C) | CTA-Buttons, Akzente, Status-Badges, Sidebar-Active, Links |
| Sekundaerfarbe | #4e5758 (Pantone 445 C) | Fliesstext, Sidebar-Hintergrund, Footer, sekundaere Elemente |
| Schriftart | Raleway (Google Fonts) | Alle Texte, Headlines, Buttons, Labels, Inputs |
| Schriftgewichte | 400 (Body), 500 (Labels), 600 (H3/H4), 700 (H1/H2/Buttons) | Konsistent ueber alle Seiten |
| Border-Radius | 8px (Buttons), 12px (Cards) | UI-Komponenten, Wizards, Dialoge |
| Shadows | rgba(78, 87, 88, 0.1) | Cards, Dropdowns, Modals |
| Spacing | 8px-Grid (4/8/16/24/32/48/64px) | Konsistentes Spacing-System |
| Dark Mode | Korrekte Farbumkehr, Lesbarkeit | Alle Seiten im Dark Mode pruefen |

### 5.2 fassadenfix-assets

| Asset | Soll-Datei | Verwendung | Pruefpunkt |
|-------|------------|------------|-----------|
| Header-Logo | FassadenFix_Logo_bunt_transparent_300px.png | Sidebar-Header | Korrekte Datei, Mindestgroesse 120px |
| Favicon | FassadenFix_Logo_96x96.jpg | Browser-Tab | Korrekt eingebunden |
| PWA-Icons | 192x192, 512x512 | App-Installation | In manifest.json referenziert |
| PDF-Logo | FassadenFix_Logo_bunt_1000px.png | Angebots-/Rechnungs-PDFs | Hochaufloesend |

### 5.3 fassadenfix-identity

| Anforderung | Pruefpunkt |
|-------------|-----------|
| Claim | Ihr sicherer Weg zur sauberen Fassade - auf Login-Seite oder Onboarding |
| Tonalitaet | Professionell, vertrauenswuerdig, handlungsorientiert - alle Texte |
| Ansprache | Sie-Form in Kundenportal, Du-Form intern (Handwerker-Kontext) |
| USPs | Pauschalfestpreis-Garantie, 5 Jahre Garantie - in Angeboten referenziert |
| Vision | Gemeinsam fuer eine bessere Zukunft - optional in About/Footer |

### 5.4 fassadenfix-copywriting

| Element | Anforderung | Pruefpunkte |
|---------|-------------|------------|
| CTA-Buttons | Aktivierend, klar, handlungsorientiert | Projekt anlegen, Angebot erstellen, Baustelle starten |
| Leere Zustaende | Konstruktiv, mit Handlungsaufforderung | Noch keine Projekte - Jetzt erstes Projekt anlegen |
| Fehlermeldungen | Hilfreich, loesungsorientiert, deutsch | Bitte fuellen Sie alle Pflichtfelder aus |
| Wizard-Texte | Klar, schrittweise, ermutigend | Fortschrittsbalken mit Prozentanzeige |
| Tooltips | Kurz, informativ | Erklaerungen bei komplexen Feldern |

### 5.5 fassadenfix-image-select

| Anforderung | Pruefpunkt |
|-------------|-----------|
| Hero-Bilder | Professionell, Farbharmonie mit #77bc1f |
| Keine verbotenen Farben | Kein dominantes Rot, Orange, Pink, Neon |
| Bildqualitaet | Scharf, hochaufloesend, keine Pixelartefakte |
| Baustellenbilder | Authentisch, professionell, sauber |

---

## 6) ROLLENBASIERTE ZUGRIFFSKONTROLLE

### 6.1 Sichtbarkeits-Matrix

| Bereich | GF | KB | ATL | PL | Buero |
|---------|----|----|-----|----|----|
| Erstellen und Erfassen | Alle | Alle | Projekte, Baustellen, Immobilien | Alle | Alle |
| Kundenberatung | Alle | Alle | - | - | Alle |
| Planung | Alle | Terminfinder | - | Alle | - |
| Projektvorbereitung | Alle | - | - | Alle | Alle |
| Umsetzung | Alle | - | Alle | Alle | - |
| Finanzen | Alle | - | - | - | Alle |
| Kundenportal | Alle | Alle | - | - | - |
| Unternehmenssystem | Alle | - | - | - | Alle |
| System und Einstellungen | Alle | - | - | - | - |

### 6.2 Testfaelle Rollenbeschraenkung

| TC-ID | Testfall | Erwartetes Ergebnis |
|-------|----------|---------------------|
| TC-120 | ATL sieht keine Finanzen | Sidebar-Bereich Finanzen nicht sichtbar |
| TC-121 | KB sieht keine Umsetzung | Sidebar-Bereich Umsetzung nicht sichtbar |
| TC-122 | Buero sieht kein System | Sidebar-Bereich System und Einstellungen nicht sichtbar |
| TC-123 | GF sieht alles | Alle 9 Bereiche sichtbar |
| TC-124 | Sidebar-Highlight | Naechste Aktion pro Projekt kontextabhaengig hervorgehoben |

---

## 7) NICHT-FUNKTIONALE TESTS

### 7.1 Responsive Design

| Viewport | Pruefpunkte |
|----------|------------|
| Desktop (1920px) | Sidebar-Navigation, volle Tabellen, Dashboard-Grid |
| Laptop (1366px) | Sidebar collapsible, Tabellen scrollbar |
| iPad Landscape (1024px) | Tablet-optimierte Ansicht, Touch-Targets >= 44px |
| iPad Portrait (768px) | Hamburger-Menue, angepasste Cards |
| Mobile (375px) | Bottom-Navigation oder Hamburger, gestapelte Cards |

### 7.2 Offline-Faehigkeit

| Funktion | Pruefpunkt |
|----------|-----------|
| Service Worker | Registrierung erfolgreich (sw.js) |
| Cache-First | Statische Assets gecached |
| IndexedDB | Foto-Upload-Queue bei Offline |
| Background Sync | Automatische Synchronisation nach Reconnect |
| Offline-Indikator | Visuell sichtbar (OfflineBanner + OfflineIndicator) |

### 7.3 PWA-Compliance

| Eigenschaft | Soll-Wert |
|-------------|-----------|
| name | FaFi PM - FassadenFix Projektmanagement |
| short_name | FaFi PM |
| theme_color | #77bc1f |
| background_color | #ffffff |
| display | standalone |
| Icons | 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 |

### 7.4 Accessibility (WCAG 2.1 AA)

| Kriterium | Pruefpunkt |
|-----------|-----------|
| Farbkontrast | Mindestens 4.5:1 fuer Text, 3:1 fuer grosse Elemente |
| Tastaturnavigation | Tab-Order logisch, alle Interaktionen erreichbar |
| Fokus-Indikatoren | Sichtbar bei Tab-Navigation |
| Touch-Targets | Mindestens 44x44px auf Touch-Geraeten |
| Skip-to-Content | SkipToContent-Komponente vorhanden |
| ARIA-Labels | Fuer Icons, Buttons ohne Text, interaktive Elemente |
| Keyboard Shortcuts | Alt+1-6, Alt+N, Alt+B, Alt+E dokumentiert |

### 7.5 Performance

| Metrik | Zielwert |
|--------|----------|
| First Contentful Paint | < 2s |
| Time to Interactive | < 3s |
| tRPC Response | < 500ms |
| Lazy Loading | Schwere Seiten werden erst bei Navigation geladen |
| React Query Cache | staleTime 2min, gcTime 10min, retry 1 |
| gzip Compression | Aktiviert fuer alle Responses |

### 7.6 Sicherheit

| Pruefpunkt | Erwartung |
|-----------|-----------|
| Auth-geschuetzte Routen | protectedProcedure fuer alle schreibenden Operationen |
| Portal-Token-Validierung | Ungueltige Tokens werden abgelehnt |
| SQL Injection | Drizzle ORM parametrisierte Queries |
| XSS | React automatisches Escaping |
| CORS | Korrekt konfiguriert |

---

## 8) INTERVIEW-SPEZIFISCHE PRUEFPUNKTE

Diese Punkte stammen direkt aus den Interviews mit dem Auftraggeber und muessen besonders sorgfaeltig geprueft werden:

| ID | Interview-Anforderung | Pruefpunkt | Quelle |
|----|----------------------|-----------|--------|
| INT-01 | Frontseite statt Eingangsseite | Ueberall im ObjektaufnahmeWizard und Foto-Upload | Interview Baustellenmanager |
| INT-02 | Dynamische Fruehbucher-Daten | Basierend auf aktuellem Saisonjahr, nicht hardcoded | Interview Kundenportal |
| INT-03 | Automatische Uebernachtungs-Empfehlung | Basierend auf Entfernung und Projektdauer | Interview Baustellenmanager |
| INT-04 | Hierarchische CRM-Anzeige | Unternehmen als Gruppen, Kontakte darunter, collapsible | Interview CRM |
| INT-05 | Ampel-System im Kundenportal | Gruen/Gelb/Rot visuell pro Projekt und Baustelle | Interview Kundenportal |
| INT-06 | Immobilie M:N zu Projekten | Eine Immobilie kann mehreren Projekten zugeordnet sein | Interview Architektur |
| INT-07 | Verantwortungsseite bei Aufgaben | Auftraggeber vs. Auftragnehmer klar getrennt | Interview Workflow |
| INT-08 | Feedback-Formular | Sterne-Bewertung nach Projektabschluss im Kundenportal | Interview Kundenportal |

---

## 9) BUG-REPORT FORMAT

Jeder Bug wird wie folgt dokumentiert:

- BUG-ID und Titel
- Schweregrad: Blocker / Critical / Major / Minor / Trivial
- Komponente: Seite/Element
- Viewport: Mobile/Tablet/Desktop
- Bereich: Navigationsbereich 1-9
- Schritte zur Reproduktion (nummeriert)
- Erwartetes Ergebnis
- Tatsaechliches Ergebnis
- Evidenz (Screenshot/Log/Code-Referenz)
- Impact (Auswirkung auf Nutzer/Prozess)
- Fix-Vorschlag (Empfehlung mit Datei-Referenz)
- Skill-Referenz (welcher FassadenFix Skill wird verletzt, falls zutreffend)

---

## 10) OUTPUT-STRUKTUR

### A) Executive Summary (max 15 Bulletpoints)
Gesamtbewertung der Anwendung, kritische Findings nach Bereich, Top-Empfehlungen.

### B) Coverage-Statistik
Seiten getestet (X/45), Router geprueft (X/38), Testfaelle ausgefuehrt (X/~120), Wizards durchlaufen (X/8).

### C) Skill-Compliance-Matrix
Pro Skill: Compliance-Rate, kritische Abweichungen, Status.

### D) Bugliste nach Severity
Blocker, Critical, Major, Minor, Trivial mit Anzahl und Beispielen.

### E) Top 10 Abweichungen von FassadenFix Skills

### F) Interview-Compliance-Check
Alle 8 Interview-Anforderungen (INT-01 bis INT-08) einzeln bewertet.

### G) Massnahmenplan
Priorisiert nach Quick Wins (1-2 Tage), Mid-Term (1-2 Wochen), Structural (groesser).

### H) Empfehlungen fuer naechste Entwicklungsphase

---

## 11) ARBEITSWEISE

1. Erst Skills laden - Alle 5 FassadenFix Skills als Referenz aktivieren
2. Dann Inventur - Alle 45 Seiten und Elemente systematisch erfassen
3. Dann Testkatalog - Testfaelle pro Bereich definieren
4. Dann Ausfuehrung - Systematisch testen, Bereich fuer Bereich
5. Alles dokumentieren - Screenshots, Steps, Expected vs Actual
6. Nichts auslassen - Jede Funktion, jeden Button, jedes Formularfeld pruefen
7. Keine Vermutungen - Nur beobachtete Fakten, Code-Referenzen angeben
8. Rollen testen - Mindestens GF und eine eingeschraenkte Rolle (z.B. ATL) pruefen
9. Dark Mode - Jede Seite auch im Dark Mode pruefen
10. Offline - Mindestens Foto-Upload offline testen

---

## 12) SPEZIFISCHE PRUEFPUNKTE (CHECKLISTE)

### Projekt-Lebenszyklus
- [ ] Kann Projekt anlegen und durch alle 10 Phasen fuehren
- [ ] Phasenuebergaenge werden validiert (keine Spruenge)
- [ ] Auto-Tasks werden bei Phasenwechsel generiert
- [ ] Dokumenten-Kette funktioniert (Angebot -> AB -> Rechnung)
- [ ] Nachfass-System erstellt 3 Erinnerungen

### Wizards
- [ ] Alle 8 Wizards durchlaufbar
- [ ] Pflichtfelder mit rotem Stern markiert
- [ ] Fortschrittsbalken mit Prozentanzeige
- [ ] Fertig-Button gross und gruen (min. 56px)
- [ ] Entwurf-Funktion (speichern/laden) im ObjektaufnahmeWizard

### Baustellenmanagement
- [ ] Vorher-Dokumentation blockiert Baustellenstart
- [ ] Taegliche Meldungen mit Wetter-Uebernahme
- [ ] Nachher-Dokumentation mit Vorher/Nachher-Vergleich
- [ ] GPS-Auto-Erfassung bei Foto-Upload
- [ ] Foto-Komprimierung und Wasserzeichen

### Kundenportal
- [ ] Token-basierter Zugang pro Unternehmen
- [ ] Ampel-System (Gruen/Gelb/Rot) visuell korrekt
- [ ] Feedback-Formular mit Sterne-Bewertung
- [ ] Nachrichten-System bidirektional
- [ ] Dokumenten-Zugriff mit 3-Ebenen-System

### Integrationen
- [ ] HubSpot bidirektionaler Sync funktioniert
- [ ] Microsoft 365 SSO Login
- [ ] E-Mail-Versand via Graph API
- [ ] Outlook-Kalender-Sync
- [ ] Open-Meteo Wetterdaten

### Rollenbasierte Zugriffskontrolle
- [ ] GF sieht alle 9 Bereiche
- [ ] Eingeschraenkte Rollen sehen nur freigegebene Bereiche
- [ ] Sidebar-Items werden korrekt gefiltert

### Corporate Design
- [ ] Primaerfarbe #77bc1f durchgaengig
- [ ] Sekundaerfarbe #4e5758 fuer Text
- [ ] Raleway als einzige Schriftart
- [ ] Offizielles Logo im Header
- [ ] Favicon korrekt
- [ ] Dark Mode funktional

---

*Dieser Test-Prompt v3.0 wurde optimiert fuer die vollstaendige FassadenFix Projektmanagement-Software (FaFi PM) und deckt alle 9 Navigationsbereiche, 45 Seiten, 38 Router, 37 DB-Tabellen und 8 Wizards ab. Er basiert auf dem Test-Prompt v2.0 (Baustellenmanager) und erweitert diesen um CRM, Angebotswesen, Finanzen, Kundenportal, Integrationen und rollenbasierte Zugriffskontrolle.*
