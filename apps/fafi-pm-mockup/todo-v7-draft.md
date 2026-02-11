# FaFi PM Todo-Liste v7.0+

**Stand:** Januar 2025  
**Projekt:** FassadenFix Projektmanager  
**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)

---

## 📋 Meilenstein v7.0 - Baustellen-Manager Überarbeitung (Prio 1)
**Ziel:** Neuen Baustellen-Workflow mit Vorher-Dokumentation und strukturiertem Tagesablauf implementieren  
**Schätzung:** 5-7 Tage

### 🔴 Kritisch - Foto-Upload Infrastruktur
- [ ] S3-Bucket Konfiguration und Credentials Setup (2h)
- [ ] S3-Upload tRPC-Router erweitern (`s3Upload`, `getSignedUrl`) (3h)
- [ ] Foto-Upload Komponente mit automatischer Dateibenennung (4h)
  - Format: `Kontext_Unternehmen_Adresse_Gebäudeseite_Kategorie_Nummer.jpg`
  - Kategorien: Übersicht, Schaden, Detail, Vorher, Nachher
- [ ] Thumbnail-Generierung (clientseitig mit Canvas API) (2h)
- [ ] Foto-Galerie Komponente mit Beschreibungstext (3h)

### 🔴 Kritisch - Vorher-Dokumentation
- [ ] `preDocumentationStatus` zu `constructionSites` Tabelle hinzufügen (30min)
- [ ] Vorher-Dokumentation Wizard erstellen (6h)
  - Pflicht-Fotos pro Gebäudeseite
  - Schadenserfassung (optional, nur bei Bedarf)
  - Blockierung des Baustellenstarts ohne Dokumentation
- [ ] Baustellen-Status auf "bereit für Start" nach Dokumentation setzen (1h)

### 🟡 Wichtig - Baustellen-Tagesablauf
- [ ] Erweiterte `constructionSiteLogs` Tabelle um neue Felder (1h)
  - `workDayStarted`, `workDayEnded`, `plannedAreas`, `completedAreas`
- [ ] "Arbeitstag beginnen" Komponente (3h)
  - Planungsfrage für den Tag
  - Zeitstempel automatisch
- [ ] Ereignismelder-Komponente überarbeiten (4h)
  - Kategorien: Schaden, Sicherheitsvorfall, Geräteausfall, Sonstiges
  - Foto-Upload Integration
- [ ] "Arbeitstag beenden" Komponente (5h)
  - Logbuch-Ergebnisse
  - Erreichte Bereiche vs. Planung
  - Planungsfrage für nächsten Tag
  - Witterungsdaten (9/13/17 Uhr Integration)
- [ ] Automatische Bautagebuch-Generierung aus Abschlussmeldung (3h)

### 🟡 Wichtig - Teamleiter Checks Überarbeitung
- [ ] `teamleiterChecks` Tabelle erweitern um `constructionSiteId` (30min)
- [ ] Pro-Baustelle Check-System statt Pro-Projekt (2h)
- [ ] Check-Übersicht für Teamleiter Dashboard (3h)

---

## 📋 Meilenstein v7.1 - Microsoft 365 Integration (Prio 2)
**Ziel:** SSO und E-Mail-Versand über Microsoft Graph API  
**Schätzung:** 4-5 Tage

### 🔴 Kritisch - Microsoft SSO Setup
- [ ] Azure App Registration für FaFi PM (1h)
- [ ] MSAL (Microsoft Authentication Library) Integration (3h)
- [ ] SSO Login-Flow für Mitarbeiter (4h)
  - Fallback auf lokale Auth für externe Benutzer
- [ ] User-Token Management und Refresh (2h)
- [ ] `users` Tabelle um `microsoftId` und `accessToken` erweitern (30min)

### 🟡 Wichtig - Microsoft Graph E-Mail Integration  
- [ ] Graph API Client Setup (2h)
- [ ] E-Mail Template System überarbeiten für Graph API (3h)
- [ ] E-Mail Vorschau & Bearbeitung Komponente (4h)
- [ ] E-Mail Versand via Graph API (3h)
  - Im Namen des jeweiligen Mitarbeiters
  - Automatisches Speichern in "Gesendete Elemente"
- [ ] Vollständige E-Mail Protokollierung im Aktivitätslog (2h)
  - Empfänger, Betreff, Inhalt, Anhänge, Zeitstempel, Absender

### 🟢 Nice-to-have
- [ ] E-Mail Anhänge aus Dokumenten-Archiv (2h)
- [ ] E-Mail Vorlagen pro Rolle/Kontext (1h)

---

## 📋 Meilenstein v7.2 - HubSpot Bidirektionaler Sync (Prio 2)
**Ziel:** Vollständige Synchronisation zwischen FaFi PM und HubSpot  
**Schätzung:** 3-4 Tage

### 🔴 Kritisch - FaFi → HubSpot Sync
- [ ] HubSpot Deal Update API Integration (3h)
- [ ] Projekt-Status zu HubSpot Deal-Stage Mapping (2h)
- [ ] Angebot-Status zu HubSpot Deal Properties Mapping (2h)  
- [ ] Automatische Deal-Updates bei Statusänderungen (4h)
  - Projekt erstellt/geändert
  - Angebot erstellt/angenommen/abgelehnt
  - Auftrag gestartet/abgeschlossen
- [ ] Sync-Status Tracking erweitern für bidirektionale Sync (2h)

### 🟡 Wichtig - Sync-Verbesserungen
- [ ] Conflict Resolution bei gleichzeitigen Änderungen (3h)
- [ ] HubSpot Sync Dashboard-Widget erweitern (2h)
- [ ] Error Handling und Retry-Logik (2h)
- [ ] Sync-Protokoll im Aktivitätslog (1h)

### 🟢 Nice-to-have
- [ ] Manueller Sync-Button pro Datensatz (1h)
- [ ] Sync-Performance Optimierung (2h)

---

## 📋 Meilenstein v7.3 - Kundenportal Ampel-System (Prio 3)
**Ziel:** Kundenportal mit neuem UX-Konzept (Ampeln statt Fortschrittsbalken)  
**Schätzung:** 4-5 Tage

### 🔴 Kritisch - Ampel-System Grundlage
- [ ] Ampel-Logik Definition und Tabellenerweiterungen (2h)
  - `projectPhaseStatus` (green/yellow/red) zu `projects`
  - `constructionSiteStatus` zu `constructionSites`
- [ ] Ampel-Komponente erstellen (2h)
- [ ] Ampel-Status Berechnungslogik (4h)
  - Automatische Statusermittlung basierend auf Aufgaben/Terminen
  - Manuelle Override-Möglichkeit

### 🟡 Wichtig - Portal-Überarbeitung
- [ ] Kundenportal-Startseite auf Unternehmen umstellen (3h)
  - Ein Zugang pro Unternehmen
  - Aktuelles Projekt direkt in Detailansicht
- [ ] Aufgaben-Unterscheidung im Portal (2h)
  - Auftraggeberseite vs. Auftragnehmerseite
- [ ] 3-Ebenen Dokumenten-System (4h)
  - Projektbezogen, Baustellenbezogen, Allgemeine FassadenFix-Dokumente
- [ ] Pro-Baustelle Ampel-Anzeige (3h)
- [ ] Token-basierter Zugang überarbeiten (2h)

### 🟢 Nice-to-have
- [ ] Mobile-optimierte Portal-Ansicht (3h)
- [ ] Push-Benachrichtigungen bei Status-Änderungen (2h)

---

## 📋 Meilenstein v7.4 - PDF-Generierung & Bereinigung (Prio 3)
**Ziel:** Fehlende PDF-Generatoren und Code-Qualität  
**Schätzung:** 3-4 Tage

### 🟡 Wichtig - PDF-Generatoren
- [ ] Rechnungs-PDF Generator (4h)
  - Corporate Design Integration
  - Mehrwertsteuer-Berechnung
  - Zahlungsbedingungen
- [ ] Garantie-PDF Generator (3h)
  - Garantiebedingungen automatisch einfügen
  - Foto-Integration aus Abnahme
- [ ] PDF-Template System für beide (2h)

### 🟡 Wichtig - Code-Qualität
- [ ] Code-Audit und Refactoring (6h)
  - Unused imports/components entfernen
  - TypeScript Strict Mode Violations beheben
  - Console.log Bereinigung
- [ ] Error Handling Vereinheitlichung (3h)
- [ ] Performance-Optimierungen (3h)
  - Lazy Loading für große Listen
  - Unnötige Re-renders eliminieren

### 🟢 Nice-to-have
- [ ] E2E-Tests für kritische User-Journeys (8h)
  - ProjektWizard bis Auftrag
  - Baustellen-Tagesablauf
  - Kundenportal-Navigation
- [ ] Responsive UI-Optimierung für Tablets (4h)

---

## 📋 Meilenstein v7.5 - Erweiterte Features (Prio 4)
**Ziel:** Zusätzliche Funktionalitäten und Optimierungen  
**Schätzung:** 3-4 Tage

### 🟢 Nice-to-have - UX-Verbesserungen
- [ ] Erweiterte Dashboard-KPIs (3h)
  - Monatliche/Quartalsansicht
  - Team-Performance Metriken
- [ ] Bessere Suchfunktionalität (2h)
  - Global Search über alle Entitäten
  - Filter-Kombinationen speichern
- [ ] Bulk-Aktionen für Listen (3h)
  - Mehrere Projekte gleichzeitig bearbeiten
  - Bulk-E-Mail Versand
- [ ] Erweiterte Kalender-Integration (3h)
  - Outlook-Sync
  - Team-Kalender Übersicht
- [ ] Automatisierte Reports (4h)
  - Wöchentliche Team-Reports
  - Kundenstatus-Reports

### 🟢 Nice-to-have - Technische Optimierungen
- [ ] Caching-Layer für häufige DB-Queries (3h)
- [ ] API-Rate Limiting (1h)
- [ ] Monitoring und Logging-System (3h)
- [ ] Backup-Strategy für S3 und DB (2h)

---

## 🏆 Archiv - Bereits erledigte Funktionalitäten

**Grundsystem:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB) mit 28 DB-Tabellen, 29 tRPC-Routern, 35+ implementierten Seiten und 215 bestehenden Unit-Tests.

**Kernfunktionen:** Vollständiges Dashboard mit echten KPIs und Widgets, ProjektWizard mit DB-Integration, ObjektaufnahmeWizard mit Entwurfsfunktion, AngebotWizard mit Versionierung, Auftrag-Annahme-Wizard mit automatischer Baustellen- und Aufgabenerstellung, Abnahme-Wizard mit Protokoll-/Garantie-/Rechnungsgenerierung.

**Detailansichten:** Alle Haupt-Entitäten (Projekt, Auftrag, Rechnung, Garantie) mit Tiefenverknüpfung und vollständiger CRUD-Funktionalität.

**Benutzerführung:** Rollenbasierte Sidebar für alle 5 Rollen (GF, Kundenberater, AT-Leiter, Projektleiter, Büro) mit entsprechenden Sichtbarkeitsberechtigungen.

**Dokumentation:** Zentrales Dokumenten-Archiv mit Entitäts-Verknüpfungen und S3-Integration, PDF-Export für Angebote mit Corporate Design.

**Externe Integrationen:** HubSpot-Synchronisation (unidirektional HubSpot→FaFi) für 100 Unternehmen und 100 Kontakte, bestehende E-Mail-API über Manus Notification Service.

---

**Gesamtaufwand Schätzung:** 22-27 Arbeitstage für alle Meilensteine  
**Kritischer Pfad:** v7.0 → v7.1 → v7.2 (Microsoft SSO vor Graph API, Foto-Upload vor Vorher-Dokumentation)