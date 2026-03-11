<div align="center">
  <img src="https://fassadenfix.de/wp-content/uploads/2023/03/FassadenFix_Logo_bunt_transparent.png" alt="FassadenFix Logo" width="300">
  
  # FaFi PM – Projektmanagement-Software
  
  **Die zentrale Workflow-Plattform für professionelle Fassadensanierung. Von der Objektaufnahme zum versandfertigen Angebot in unter 10 Minuten.**
  
  [![FassadenFix](https://img.shields.io/badge/FassadenFix-Projekt-77bc1f?style=flat-square)](https://fassadenfix.de)
  [![Status](https://img.shields.io/badge/Status-Produktionsreif-77bc1f?style=flat-square)]()
  [![Version](https://img.shields.io/badge/Version-5.1-77bc1f?style=flat-square)]()
  [![CI](https://img.shields.io/badge/CI-konform-77bc1f?style=flat-square)]()
  [![Tests](https://img.shields.io/badge/Tests-137%20passed-77bc1f?style=flat-square)]()
</div>

---

## Übersicht

FaFi PM ist die maßgeschneiderte Projektmanagement-Software für die FassadenFix GmbH. Sie digitalisiert den gesamten Wertschöpfungsprozess von der ersten Kundenanfrage bis zur 5-Jahres-Garantieabwicklung und ersetzt die veraltete Hero-Software durch eine moderne, auf die Unternehmensprozesse zugeschnittene Lösung.

> **"Unser Herz schlägt grün"** – Diese Philosophie spiegelt sich in jedem Aspekt der Software wider: Weniger Papier, effizientere Prozesse, transparente Kommunikation und messbare Ergebnisse.

---

## Funktionen

| Modul | Beschreibung | Status |
|-------|--------------|--------|
| **Dashboard** | KPIs, Kanban-Board, HubSpot-Status, Aktivitäten-Feed | ✅ |
| **Projektverwaltung** | 10-Phasen-Lifecycle, Zeitstrahl, Status-Tracking | ✅ |
| **Immobilienverwaltung** | 5-Schritt-Wizard, seitenweise Erfassung | ✅ |
| **Angebots-Generator** | Automatische Kalkulation, CI-konformes PDF | ✅ |
| **HubSpot-Integration** | Bidirektionaler Sync (Kontakte, Deals, Unternehmen) | ✅ |
| **Baustellen-Manager** | Logbuch, Fortschritt, Wetter-Integration | ✅ |
| **Dokumenten-Archiv** | S3-Storage, PDF-Generierung, E-Mail-Versand | ✅ |
| **Garantie-Verwaltung** | Zertifikate, Inspektionen, Garantiefälle | ✅ |

---

## Schnellstart

### Voraussetzungen

- Node.js 22.x oder höher
- pnpm 10.x oder höher
- Manus-Account für OAuth

### Installation

```bash
# Repository klonen
gh repo clone FassadenFix/FaFi

# Abhängigkeiten installieren
cd fafi-pm-mockup && pnpm install

# Datenbank-Schema synchronisieren
pnpm db:push

# Entwicklungsserver starten
pnpm dev
```

### Umgebungsvariablen

Die folgenden Variablen werden automatisch von Manus bereitgestellt:

| Variable | Beschreibung |
|----------|--------------|
| `DATABASE_URL` | TiDB Serverless Verbindung |
| `JWT_SECRET` | Session-Signierung |
| `VITE_APP_ID` | Manus OAuth Application ID |
| `OAUTH_SERVER_URL` | Manus OAuth Backend |
| `BUILT_IN_FORGE_API_KEY` | Manus API (LLM, Storage) |

---

## Architektur

### Technologie-Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| **Frontend** | React + TypeScript | 19.x / 5.9 |
| **Styling** | Tailwind CSS | 4.x |
| **API** | tRPC | 11.x |
| **Datenbank** | TiDB Serverless + Drizzle ORM | 0.44 |
| **Auth** | Manus OAuth | - |
| **CRM** | HubSpot MCP | - |
| **E-Mail** | Outlook MCP | - |

### Projektstruktur

```
fafi-pm-mockup/
├── client/
│   ├── public/           # Statische Assets (Logo, Favicon)
│   └── src/
│       ├── components/   # Wiederverwendbare Komponenten
│       ├── pages/        # 45 Seiten-Komponenten
│       ├── contexts/     # React Contexts (Auth, Theme)
│       └── services/     # PDF-Generatoren, API-Clients
├── server/
│   ├── routers.ts        # 31 tRPC-Router
│   ├── db.ts             # Query Helpers
│   ├── services/         # HubSpot, E-Mail, PDF
│   └── storage.ts        # S3 Integration
├── drizzle/
│   └── schema.ts         # 28 Datenbank-Tabellen
└── docs/
    └── MVP-SPEZIFIKATION-v2.md
```

### Datenmodell

Das System umfasst 28 Tabellen in 6 Domänen:

| Domäne | Tabellen |
|--------|----------|
| **Kern** | projects, properties, companies, contacts, offers |
| **Finanzen** | orders, invoices, payments, budgets, warranties |
| **Operations** | constructionSites, appointments, tasks, activityLogs |
| **CRM-Sync** | syncStatus, hubspotCache |
| **Team** | users, teamMembers, roles |
| **System** | textBlocks, documents, customerReports |

---

## Design-System (CI-konform)

### Farben

| Farbe | Pantone | HEX | Verwendung |
|-------|---------|-----|------------|
| **FassadenFix Grün** | 368 C | `#77bc1f` | Primärfarbe, Buttons, Akzente |
| **Dunkelgrau** | 445 C | `#4e5758` | Sidebar, Text, Sekundär |

### Typografie

| Element | Schriftart | Gewicht |
|---------|------------|---------|
| **Headlines** | Raleway | Bold 700 |
| **Body** | Raleway | Regular 400 |

### UI-Komponenten

| Komponente | Spezifikation |
|------------|---------------|
| **Border-Radius Buttons** | 8px |
| **Border-Radius Cards** | 12px |
| **Touch-Targets** | min. 44–56px (iPad-optimiert) |

---

## Kernworkflows

### Angebots-Generator

Der Kern des Systems: Von der Objektaufnahme zum CI-konformen PDF-Angebot in 5 Schritten.

**Preisstaffelung:**

| Gesamtfläche | Preis/m² | Frühbucher-Rabatt |
|--------------|----------|-------------------|
| bis 1.000 m² | 10,50 € | 6% |
| 1.001–3.000 m² | 9,75 € | 4,5% |
| 3.001–5.000 m² | 9,25 € | 3% |
| ab 5.001 m² | 8,75 € | 1,5% |

### HubSpot-Integration

| Objekt | Import | Export |
|--------|--------|--------|
| **Companies** | ✅ Auto | ✅ Bei Neuanlage |
| **Contacts** | ✅ Auto | ✅ Bei Neuanlage |
| **Deals** | ✅ Auto | ✅ Bei Angebotsversand |
| **Engagements** | – | ✅ E-Mail-Tracking |

---

## Tests

```bash
# Alle Tests ausführen
pnpm test

# Ergebnis: 137 Tests in 6 Dateien
# - auth.logout.test.ts
# - mockup-pages.test.ts
# - detail-pages.test.ts
# - pdf-generators.test.ts
# - textblocks.test.ts
# - offers.test.ts
```

---

## Metriken

| Metrik | Wert |
|--------|------|
| **Datenbank-Tabellen** | 28 |
| **tRPC-Router** | 31 |
| **Frontend-Seiten** | 45 |
| **Unit-Tests** | 137 (100% bestanden) |
| **HubSpot-Sync** | 1.000+ Kontakte, Unternehmen, Deals |
| **TypeScript-Fehler** | 0 |

---

## Roadmap

| Phase | Zeitraum | Inhalt | Status |
|-------|----------|--------|--------|
| **MVP v1** | Q4 2025 | Kernmodule, Angebots-Generator | ✅ |
| **MVP v2** | Q1 2026 | HubSpot-Sync, 13 Mockup-Seiten, PDF-Export | ✅ |
| **Phase 2** | Q2 2026 | Mobile App, Offline-Modus, Ressourcenplanung | ⏳ |
| **Phase 3** | Q3 2026 | Kundenportal, Marketing Intelligence | ⏳ |

---

## Dokumentation

- [MVP-Spezifikation v2.0](docs/MVP-SPEZIFIKATION-v2.md) – Vollständige Systemdokumentation
- [Testprotokoll Generalprobe](testprotokoll-generalprobe.md) – 265 Testfälle
- [Abarbeitungsplan](abarbeitungsplan-offene-aufgaben.md) – Aufgaben-Tracking

---

## Lizenz

Dieses Projekt ist proprietär und gehört der FassadenFix GmbH. Alle Rechte vorbehalten.

---

## Kontakt

**FassadenFix GmbH**
- Website: [www.fassadenfix.de](https://www.fassadenfix.de)
- E-Mail: [kontakt@fassadenfix.de](mailto:kontakt@fassadenfix.de)

---

<div align="center">
  <sub>Erstellt mit 💚 von FassadenFix | Version 5.1 | Februar 2026</sub>
</div>
