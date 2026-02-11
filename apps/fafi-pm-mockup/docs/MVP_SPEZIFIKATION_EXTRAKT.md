# FaFi PM – MVP-Spezifikation (Extrakt)

> Quelle: FaFi_PM_–_MVP-Spezifikation.pdf (22 Seiten)

---

## Übersicht

**Projektziel:** Digitale Transformation der Vertriebsprozesse bei FassadenFix
**Problemstellung:** Hero-Software ist veraltet, nicht anpassbar, keine Integration
**Lösung:** Maßgeschneiderte Projektmanagement-Software "FaFi PM"

---

## Fünf Epics (User Stories)

### EPIC 01: Projektverwaltung
> "Als Kundenberater möchte ich neue Projekte anlegen und den Status aktualisieren, um den Vertriebsprozess transparent zu dokumentieren."

### EPIC 02: Immobilienverwaltung
> "Als Kundenberater möchte ich Immobilien strukturiert erfassen und Fotos hochladen, um eine fundierte Kalkulationsbasis zu haben."

### EPIC 03: Angebots-Generator
> "Als Kundenberater möchte ich mit einem Klick ein CI-konformes PDF-Angebot erstellen, um Zeit zu sparen und Fehler zu vermeiden."

### EPIC 04: HubSpot-Integration
> "Als Administrator möchte ich, dass alle Kontakte und Deals automatisch synchronisiert werden, um Dateninseln zu verhindern."

### EPIC 05: Benutzerverwaltung
> "Als Administrator möchte ich Benutzerrollen verwalten, um sicherzustellen, dass Mitarbeiter nur auf relevante Daten zugreifen."

---

## Datenmodell (Core Entities)

| Entity | Felder |
|--------|--------|
| **Projekte** | ID, Name, Kunde, Status, Phasen (1-10), Erstellt/Geändert |
| **Immobilien** | ID, Projekt-FK, Adresse, Fläche, Fassadentyp, Fotos |
| **Angebote** | ID, Projekt-FK, Nummer, Positionen, Summe, Status |
| **Kontakte** | ID, Firma, Ansprechpartner, E-Mail, Telefon, HubSpot-ID |
| **Benutzer** | ID, Name, E-Mail, Rolle (Admin/Sales/Office) |

---

## Projektphasen (10 Phasen)

1. **Objektaufnahme** - Erfassung der Immobiliendaten
2. **Angebot erstellt** - Kalkulation und PDF-Generierung
3. **Angebot versendet** - Versand an Kunden
4. **Nachfassen** - Follow-up bei offenen Angeboten
5. **Auftrag gewonnen** - Auftragsbestätigung
6. **Planung** - Ressourcen und Zeitplanung
7. **Vorbereitung** - Materialbestellung, Genehmigungen
8. **Durchführung** - Aktive Baustelle
9. **Abnahme** - Qualitätskontrolle
10. **Abgeschlossen** - Projekt fertig

---

## API-Design (25+ RESTful Endpunkte)

### Projekte (8 Endpunkte)
- GET /projects - Liste abrufen
- POST /projects - Erstellen
- PATCH /projects/:id/status - Status ändern
- GET /projects/:id/timeline - Zeitstrahl

### Immobilien (6 Endpunkte)
- GET /projects/:id/properties - Liste
- POST /properties - Erfassen
- POST /properties/:id/photos - Upload
- PUT /properties/:id - Update

### Angebote (6 Endpunkte)
- POST /projects/:id/offers - Generieren
- GET /offers/:id/pdf - Export PDF
- POST /offers/:id/send - Versenden

### HubSpot (5 Endpunkte)
- POST /hubspot/sync - Manueller Sync
- POST /hubspot/webhook - Webhook In
- GET /hubspot/status - Sync Status

---

## UI-Konzept

### Dashboard als Startpunkt
- **KPI-Karten:** Projekte Gesamt, Angebote (Monat), Aufträge Gewonnen, Conversion Rate
- **Kanban-Board:** Objektaufnahme, Angebot Erstellt, Nachfassen
- **Aktivitäten-Feed:** Letzte Aktionen der Benutzer
- **Schnellaktionen:** Suche, + Neues Projekt

### Angebots-Generator (5 Schritte, unter 10 Minuten)
1. **Projekt auswählen** - Alle Projektdaten werden automatisch geladen
2. **Immobilien wählen** - Checkbox-Liste aller erfassten Objekte
3. **Kalkulation prüfen** - Automatische Preisberechnung nach Fläche und Typ
4. **Rabatt festlegen** - Kennenlernangebot, Frühbucher oder Treuerabatt
5. **PDF generieren** - CI-konformes Angebot mit einem Klick

### Automatische Berechnung
- Gesamtfläche: ∑ aus Immobilien
- Grundpreis: € / m² (Fassadentyp)
- Rabatt: % oder Festbetrag
- Endpreis (inkl. MwSt.): Automatisch kalkuliert

---

## Sicherheit und Authentifizierung

### Authentifizierung
- Manus-OAuth (Google/Microsoft)
- Session Management (HttpOnly & Secure Cookies)
- Token Rotation (kurzlebige Access-Tokens)

### Autorisierung (RBAC)
- **Admin:** Vollzugriff auf alle Module
- **Sales:** Zugriff auf eigene Leads, Angebote, Kunden
- **Office:** Verwaltung von Stammdaten und Dokumenten

### Datenschutz
- TLS 1.3 für Transit, AES-256 für gespeicherte Daten
- DSGVO-Konformität
- Audit Logs

---

## Deployment und Infrastruktur

### CI/CD Pipeline
Local Dev → GitHub → GitHub Actions → Cloudflare

### Komponenten
- **Frontend Hosting:** Cloudflare Pages
- **Backend Logic:** Cloudflare Workers (Serverless)
- **Datenbank:** TiDB Serverless (MySQL-kompatibel)
- **File Storage:** Cloudflare R2

### Zero-Downtime
Updates werden ohne Unterbrechung ausgerollt.

---

## Zeitplan – 8 Wochen bis MVP

### Sprint 01: Foundation (Woche 1-2)
- Setup Repo & CI/CD
- DB Schema & Auth
- HubSpot Sync Basis
- UI Framework Setup

### Sprint 02: Core Data (Woche 3-4)
- Projekt-CRUD
- Immobilien-Erfassung
- Foto-Upload (R2)
- Listenansichten

### Sprint 03: Logic & Value (Woche 5-6)
- Angebots-Kalkulation
- PDF-Generierung
- E-Mail-Versand
- Rabatt-Logik

### Sprint 04: Polish & Launch (Woche 7-8)
- Dashboard & KPIs
- E2E Testing
- User Acceptance
- Production Deploy

---

## Nächste Schritte (Post-MVP)

### Phase 2: Erweiterung & Mobile
- Native App für Baustellen-Doku (Offline-Modus)
- Ressourcenplanung (Mitarbeiter, Fahrzeuge)
- Countdown-System für Fristen

### Phase 3: Kundenportal
- Self-Service Login für Auftraggeber
- Projekt-Transparenz (Live-Status, Dokumente, Garantie)
- Marketing Intelligence (IP-Tracking)

---

## Zusammenfassung

**Volle Unabhängigkeit:** Ablösung von Hero durch maßgeschneiderte Software
**Maximale Effizienz:** Reduzierung der Zeit für Angebotserstellung um bis zu 50%
**Datenhoheit & Integration:** Nahtlose Synchronisation mit HubSpot als "Single Source of Truth"
