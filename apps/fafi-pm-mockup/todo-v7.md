# FaFi PM – Todo-Liste v7.0+

**Stand:** 08. Februar 2026
**Projekt:** FassadenFix Projektmanager (FaFi PM)
**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)
**Aktueller Stand:** 28 DB-Tabellen, 29 tRPC-Router, 35+ Seiten, 215 Unit-Tests

---

## Abhängigkeiten & Kritischer Pfad

```
Foto-Upload (v7.0a) ──→ ObjektaufnahmeWizard Fotos (v7.0a)
                    ├──→ Vorher-Dokumentation (v7.0b)
                    ├──→ Ereignismelder Fotos (v7.0c)
                    └──→ Nachher-Dokumentation (v7.0d)

Vorher-Dokumentation (v7.0b) ──→ Baustellen-Tagesablauf (v7.0c)

Microsoft SSO (v7.1a) ──→ Graph API E-Mail (v7.1b)

HubSpot Bidi-Sync (v7.2) kann parallel zu v7.1 laufen
Kundenportal Ampel (v7.3) kann parallel zu v7.1/v7.2 laufen
```

---

## v7.0 – Foto-Upload & Baustellen-Manager Überarbeitung

**Ziel:** Echten S3-Foto-Upload implementieren, Baustellen-Manager mit neuem Workflow (Vorher-Doku → Tagesablauf → Nachher-Doku)
**Abhängigkeit:** Keine – kann sofort gestartet werden
**Geschätzter Aufwand:** 6-8 Tage

### v7.0a – Foto-Upload Infrastruktur (Voraussetzung für alles Weitere)

- [ ] S3-Upload tRPC-Router: `photo.upload` Prozedur (multipart/form-data → storagePut) (3h)
- [ ] Automatische Dateibenennung nach Schema: `Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN.jpg` (2h)
- [ ] Wiederverwendbare `FotoUpload`-Komponente mit Kamera/Galerie-Auswahl, Vorschau, Beschreibungstext (4h)
- [ ] Thumbnail-Generierung clientseitig (Canvas API, max 400px) für schnelle Vorschau (2h)
- [ ] Originale in voller Auflösung speichern (keine Komprimierung – versicherungsrelevant) (0h, nur Konfiguration)
- [ ] `photos`-Tabelle erstellen: id, url, thumbnailUrl, filename, context, companyName, address, side, category, description, propertyId, constructionSiteId, logEntryId, uploadedBy, createdAt (1h)
- [ ] DB-Migration durchführen (pnpm db:push) (15min)
- [ ] ObjektaufnahmeWizard: FotoUpload-Komponente pro Gebäudeseite integrieren (3h)
- [ ] ObjektaufnahmeWizard: Foto-URLs in Property-Daten speichern (1h)
- [ ] Foto-Galerie in Immobilien-Detailansicht anzeigen (2h)
- [ ] Unit-Tests für Photo-Router (upload, list, delete) (2h)

### v7.0b – Vorher-Dokumentation (Pflicht vor Baustellenstart)

- [ ] `preDocumentationStatus` Feld zu `constructionSites` Tabelle hinzufügen (enum: pending/in_progress/completed) (30min)
- [ ] `preDocumentationCompletedAt` Timestamp-Feld hinzufügen (15min)
- [ ] DB-Migration durchführen (15min)
- [ ] Vorher-Dokumentation Wizard erstellen (analog ObjektaufnahmeWizard) (6h)
  - Pro Gebäudeseite: Pflicht-Übersichtsfoto + optionale Schadensfotos
  - Beschreibungstext pro Foto automatisch vorausgefüllt (Kontext: "Vorher")
  - Zusammenfassung mit allen Fotos vor Abschluss
- [ ] Baustellenstart-Blockierung: "Baustelle starten" Button nur aktiv wenn preDocumentationStatus = completed (1h)
- [ ] tRPC-Prozedur: `constructionSite.completePreDocumentation` (Status setzen, Aktivitätslog) (1h)
- [ ] Baustellen-Detailansicht: Vorher-Fotos Tab anzeigen (2h)
- [ ] Unit-Tests für Vorher-Dokumentation (3h)

### v7.0c – Baustellen-Tagesablauf

- [ ] `constructionSiteLogs` Tabelle erweitern: workDayStarted, workDayEnded, plannedAreas, completedAreas, weatherMorning, weatherNoon, weatherEvening, planningOnTrack (boolean) (1h)
- [ ] DB-Migration durchführen (15min)
- [ ] "Arbeitstag beginnen" Komponente (3h)
  - Zeitstempel automatisch
  - Planungsfrage: "Wird die Baustellenplanung zeitlich beibehalten?" (Ja/Nein + Begründung)
  - Geplante Bereiche für den Tag auswählen
- [ ] Ereignismelder-Komponente (jederzeit verfügbar, prominent platziert) (4h)
  - Kategorien: Schaden, Sicherheitsvorfall, Geräteausfall, Kundenkontakt, Sonstiges
  - Foto-Upload Integration (FotoUpload-Komponente wiederverwenden)
  - Dringlichkeit (normal/hoch/kritisch)
  - Sofortige Speicherung als Logbuch-Eintrag
  - Bei Dringlichkeit "kritisch": Benachrichtigung an GF/Büro
- [ ] "Arbeitstag beenden" Komponente (5h)
  - Erreichte Bereiche vs. Planung markieren
  - Logbuch-Ergebnisse zusammenfassen
  - Planungsfrage für nächsten Tag
  - Witterungsdaten automatisch aus Open-Meteo API (9/13/17 Uhr – bestehende weatherRouter nutzen)
  - Fotos des Tagesfortschritts (optional)
- [ ] Automatische Bautagebuch-Generierung aus Abschlussmeldung (3h)
  - Strukturierter Eintrag: Datum, Team, Wetter, geplant vs. erreicht, Vorkommnisse, Fotos
  - Als Dokument im Archiv speichern (Kategorie: bautagebuch)
- [ ] BaustellenWizard DB-Integration (aktuell nur Mock-Callback) (3h)
  - trpc.constructionSite.create Mutation aufrufen
  - Projekte und Immobilien aus DB laden
  - Sofortige DB-Speicherung
- [ ] Unit-Tests für Tagesablauf-Prozeduren (3h)

### v7.0d – Nachher-Dokumentation

- [ ] `postDocumentationStatus` Feld zu `constructionSites` hinzufügen (enum: pending/in_progress/completed) (30min)
- [ ] DB-Migration durchführen (15min)
- [ ] Nachher-Dokumentation Wizard (analog Vorher-Doku) (4h)
  - Pro Gebäudeseite: Pflicht-Übersichtsfoto
  - Automatische Dateibenennung mit Kontext "Nachher"
  - Verknüpfung mit Vorher-Fotos für Vergleich
- [ ] Vorher/Nachher-Vergleichsansicht (Side-by-Side oder Slider) (3h)
- [ ] Abnahme-Wizard: Nachher-Doku als Voraussetzung prüfen (1h)
- [ ] Unit-Tests für Nachher-Dokumentation (2h)

---

## v7.1 – Microsoft 365 Integration (SSO + E-Mail)

**Ziel:** Mitarbeiter-Login über Microsoft 365 SSO, E-Mail-Versand über Graph API im Namen des Mitarbeiters
**Abhängigkeit:** Keine – kann parallel zu v7.0 gestartet werden (SSO-Setup erfordert Azure Admin-Zugang)
**Geschätzter Aufwand:** 5-6 Tage

### v7.1a – Microsoft SSO Setup (Voraussetzung für E-Mail)

- [ ] Azure App Registration für FaFi PM erstellen (erfordert Azure Admin-Zugang des Kunden) (1h)
  - Redirect URIs konfigurieren
  - API-Berechtigungen: User.Read, Mail.Send, Mail.ReadWrite
- [ ] MSAL (Microsoft Authentication Library) als npm-Paket installieren (30min)
- [ ] SSO Login-Flow implementieren (4h)
  - "Mit Microsoft anmelden" Button auf Login-Seite
  - OAuth2 Authorization Code Flow mit PKCE
  - Fallback auf bestehende Manus OAuth für externe Benutzer
- [ ] `users` Tabelle erweitern: microsoftId, microsoftAccessToken, microsoftRefreshToken, microsoftTokenExpiry (30min)
- [ ] DB-Migration durchführen (15min)
- [ ] Token-Refresh Middleware: Automatische Erneuerung abgelaufener Tokens (2h)
- [ ] User-Profil automatisch aus Microsoft-Daten befüllen: Name, E-Mail (v.nachname@fassadenfix.de), Profilbild (1h)
- [ ] fafiRole-Zuweisung: Admin weist Rolle nach erstem Login zu (1h)
- [ ] Unit-Tests für SSO-Flow (2h)

### v7.1b – Microsoft Graph E-Mail-Versand

- [ ] Graph API Client Setup mit User-Token (delegierte Berechtigungen) (2h)
- [ ] E-Mail-Versand tRPC-Prozedur: `email.sendViaGraph` (3h)
  - Empfänger, CC, BCC
  - Betreff und HTML-Body aus Template
  - PDF-Anhänge aus Dokumenten-Archiv/S3
  - Versand über Graph API mit Token des eingeloggten Mitarbeiters
  - E-Mail erscheint in Outlook "Gesendete Elemente"
- [ ] E-Mail Vorschau & Bearbeitung Komponente überarbeiten (4h)
  - Vorgefülltes Template anzeigen
  - Text, Empfänger, CC bearbeitbar
  - Anhänge hinzufügen/entfernen
  - "Senden" Button mit Bestätigung
- [ ] Vollständige E-Mail-Protokollierung im Aktivitätslog (2h)
  - Empfänger, Betreff, Inhalt (HTML), Anhänge, Zeitstempel, Absender
  - Verknüpfung zu: Projekt, Angebot, Auftrag, Unternehmen, Kontakt
  - E-Mail in der Chronologie aller verknüpften Entitäten sichtbar
- [ ] Bestehende Manus Notification API durch Graph API ersetzen (2h)
- [ ] "Per E-Mail senden" Buttons aktivieren: Angebot, Rechnung, Auftragsbestätigung (2h)
- [ ] Unit-Tests für E-Mail-Versand und Protokollierung (3h)

---

## v7.2 – HubSpot Bidirektionaler Sync

**Ziel:** Vollständige bidirektionale Synchronisation: HubSpot ↔ FaFi PM
**Abhängigkeit:** Keine – kann parallel zu v7.1 laufen
**Geschätzter Aufwand:** 3-4 Tage

### Kritisch – FaFi → HubSpot Sync

- [ ] HubSpot Deal Update API Integration (bestehender hubspot-service erweitern) (3h)
- [ ] Status-Mapping definieren und implementieren (2h)

| FaFi-Aktion | HubSpot-Update |
|---|---|
| Projekt erstellt | Neuer Deal anlegen (falls nicht vorhanden) |
| Angebot erstellt | Deal-Stage → "Angebot erstellt" |
| Angebot versendet | Deal-Stage → "Angebot versendet" |
| Auftrag angenommen | Deal-Stage → "Auftrag gewonnen", Deal-Betrag aktualisieren |
| Projekt abgeschlossen | Deal-Stage → "Abgeschlossen gewonnen" |
| Angebot abgelehnt | Deal-Stage → "Verloren" |

- [ ] Automatische Trigger bei Statusänderungen in tRPC-Prozeduren einbauen (4h)
  - offer.updateStatus → HubSpot Deal-Stage Update
  - order.acceptFromOffer → HubSpot Deal "Auftrag gewonnen"
  - constructionSite.complete → HubSpot Deal "Abgeschlossen"
- [ ] Sync-Status Tracking: lastSyncedAt, syncDirection, syncError pro Entität (2h)
- [ ] Sync-Protokoll im Aktivitätslog (jede Sync-Aktion dokumentieren) (1h)

### Wichtig – Sync-Robustheit

- [ ] Error Handling und Retry-Logik (max 3 Versuche, exponentielles Backoff) (2h)
- [ ] Conflict Resolution: Timestamp-basiert (neuere Änderung gewinnt) (2h)
- [ ] HubSpot Sync Dashboard-Widget: Letzter Sync, Fehler, Statistiken (2h)
- [ ] Manueller Sync-Button pro Datensatz (1h)

### Unit-Tests

- [ ] Tests für bidirektionalen Sync (Status-Mapping, Trigger, Error Handling) (3h)

---

## v7.3 – Kundenportal Ampel-System

**Ziel:** Kundenportal überarbeiten: Ampel-System statt Fortschrittsbalken, Unternehmenszugang, 3-Ebenen-Dokumente
**Abhängigkeit:** Keine – kann parallel laufen
**Geschätzter Aufwand:** 4-5 Tage

### Kritisch – Ampel-System

- [ ] Ampel-Logik definieren (2h)
  - Grün: Alle Voraussetzungen für nächste Phase erfüllt, keine überfälligen Aufgaben
  - Gelb: Aufgaben in Bearbeitung, aber noch nicht überfällig
  - Rot: Überfällige Aufgaben oder blockierende Probleme
- [ ] `phaseStatus` Feld (green/yellow/red) zu `projects` Tabelle hinzufügen (30min)
- [ ] `siteStatus` Feld (green/yellow/red) zu `constructionSites` Tabelle hinzufügen (30min)
- [ ] DB-Migration durchführen (15min)
- [ ] Ampel-Berechnungslogik als Server-Funktion (automatisch aus Aufgaben/Terminen) (3h)
- [ ] Ampel-Komponente (visuell: Kreis mit Farbe + Tooltip mit Erklärung) (2h)

### Wichtig – Portal-Überarbeitung

- [ ] Kundenportal-Startseite umstellen: Ein Zugang pro Unternehmen (3h)
  - Aktuelles/laufendes Projekt direkt in Detailansicht
  - Übersicht aller Projekte (laufend + abgeschlossen)
- [ ] Ampel-Anzeige pro Projekt und pro Baustelle im Portal (2h)
- [ ] Aufgaben-Unterscheidung im Portal (2h)
  - "Liegt auf Ihrer Seite" (Auftraggeber muss handeln)
  - "Liegt auf unserer Seite" (FassadenFix arbeitet daran)
  - `responsibleParty` Feld (enum: auftraggeber/auftragnehmer) zu `tasks` hinzufügen
- [ ] 3-Ebenen Dokumenten-System im Portal (4h)
  - Projektbezogen: Angebote, Aufträge, Verträge
  - Baustellenbezogen: Sperrgenehmigungen, behördliche Dokumente (verknüpft mit Immobilie)
  - Allgemein: Fachunternehmererklärung, Freistellungsbescheinigung (FassadenFix-Dokumente)
- [ ] Token-basierter Zugang überarbeiten (pro Unternehmen statt pro Projekt) (2h)
- [ ] Vorher/Nachher-Fotos im Portal anzeigen (1h)
- [ ] Unit-Tests für Ampel-Logik und Portal-Zugang (3h)

---

## v7.4 – PDF-Generierung & Code-Qualität

**Ziel:** Fehlende PDF-Generatoren, Code-Bereinigung, Performance
**Abhängigkeit:** Keine
**Geschätzter Aufwand:** 3-4 Tage

### PDF-Generatoren

- [ ] Rechnungs-PDF Generator im Corporate Design (4h)
  - FassadenFix Logo, Farben, Typografie
  - Positionen, Mehrwertsteuer, Gesamtbetrag
  - Zahlungsbedingungen, Bankverbindung
- [ ] Garantie-PDF Generator als Zertifikat (3h)
  - Garantiebedingungen
  - Foto-Integration aus Abnahme (Nachher-Fotos)
  - Gültigkeitszeitraum
- [ ] PDF-Download-Buttons in Rechnungs- und Garantie-Detailseiten (1h)
- [ ] Unit-Tests für PDF-Generatoren (2h)

### Code-Qualität

- [ ] Code-Audit: Unused Imports, tote Komponenten, console.log entfernen (4h)
- [ ] TypeScript Strict Mode Violations beheben (2h)
- [ ] Error Handling vereinheitlichen (Toast-Nachrichten, Fehler-Boundaries) (2h)
- [ ] Performance: Lazy Loading für große Listen, React.memo für teure Komponenten (3h)

### Tests

- [ ] E2E-Tests für kritische User-Journeys (6h)
  - Projekt erstellen → Objektaufnahme → Angebot → Auftrag → Baustelle → Abnahme
  - Baustellen-Tagesablauf (Morgen → Ereignis → Abend)
  - Kundenportal-Navigation und Dokumenten-Zugriff

---

## v7.5 – Erweiterte Features (Nice-to-have)

**Ziel:** UX-Verbesserungen und technische Optimierungen
**Abhängigkeit:** Alle vorherigen Meilensteine
**Geschätzter Aufwand:** 3-4 Tage

### UX-Verbesserungen

- [ ] Dashboard-KPIs: Monatliche/Quartalsansicht, Team-Performance (3h)
- [ ] Globale Suche erweitern: Filter-Kombinationen speichern (2h)
- [ ] Bulk-Aktionen für Listen (Mehrfachauswahl, Bulk-Status-Änderung) (3h)
- [ ] Outlook-Kalender-Sync über Graph API (3h)
- [ ] Automatisierte Reports: Wöchentliche Team-/Kundenstatus-Reports (4h)

### Technische Optimierungen

- [ ] Caching-Layer für häufige DB-Queries (3h)
- [ ] API-Rate Limiting für externe APIs (HubSpot, Graph) (1h)
- [ ] Monitoring und strukturiertes Logging (3h)
- [ ] Responsive UI-Optimierung für Tablets (Baustellen-Manager) (4h)

---

## Gesamtübersicht

| Meilenstein | Aufwand | Priorität | Abhängigkeit |
|---|---|---|---|
| v7.0 Foto-Upload & Baustellen-Manager | 6-8 Tage | Kritisch | Keine |
| v7.1 Microsoft 365 (SSO + E-Mail) | 5-6 Tage | Kritisch | Azure Admin-Zugang |
| v7.2 HubSpot Bidi-Sync | 3-4 Tage | Wichtig | Keine (parallel zu v7.1) |
| v7.3 Kundenportal Ampel | 4-5 Tage | Wichtig | Keine (parallel) |
| v7.4 PDF & Code-Qualität | 3-4 Tage | Wichtig | Keine |
| v7.5 Erweiterte Features | 3-4 Tage | Nice-to-have | Alle vorherigen |
| **Gesamt** | **24-31 Tage** | | |

---

## Archiv – Erledigte Funktionalitäten (v1.0 – v6.1)

**Grundsystem (v1-v3):** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL mit 28 DB-Tabellen, 29 tRPC-Routern, 35+ Seiten. FassadenFix Corporate Design durchgängig implementiert.

**Kernfunktionen (v4-v5):** Dashboard mit echten KPIs und Widgets. ProjektWizard, ObjektaufnahmeWizard (mit Entwurfsfunktion), AngebotWizard (mit Versionierung und obsolet-Status) – alle mit DB-Integration. Auftrag-Annahme-Wizard, Abnahme-Wizard mit automatischer Rechnungs-/Garantie-Erstellung. Alle 13 Mockup-Seiten implementiert und DB-angebunden.

**Detailansichten (v4.8-v5.5):** Projekt, Auftrag, Rechnung, Garantie mit vollständiger Tiefenverknüpfung. Zentrales Dokumenten-Archiv mit Entitäts-Verknüpfungen. PDF-Export für Angebote im Corporate Design.

**Integrationen (v4-v5):** HubSpot-Synchronisation (HubSpot→FaFi) für 100 Unternehmen und 100 Kontakte. Globale Suche (Cmd+K). Dunkelmodus.

**Interview-Korrekturen (v6.0-v6.1):** "Frontseite" → "Eingangsseite" umbenannt. Wizard-DB-Integrationen. Rollenbasierte Sidebar. Seed-Daten bereinigt. 215 Unit-Tests bestanden.
