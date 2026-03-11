<div align="center">
  <img src="https://fassadenfix.de/wp-content/uploads/2023/03/FassadenFix_Logo_bunt_transparent.png" alt="FassadenFix Logo" width="250">

  # FaFi PM – MVP-Spezifikation v2.0
  
  **Die zentrale Workflow-Plattform für professionelle Fassadensanierung**
  
  [![FassadenFix](https://img.shields.io/badge/FassadenFix-Projekt-77bc1f?style=flat-square)](https://fassadenfix.de)
  [![Version](https://img.shields.io/badge/Version-5.1-77bc1f?style=flat-square)]()
  [![Status](https://img.shields.io/badge/Status-Produktionsreif-77bc1f?style=flat-square)]()
</div>

---

## 1. Vision & Grundgedanke

### 1.1 Warum FaFi PM?

FaFi PM ist nicht einfach eine weitere Projektmanagement-Software. Es ist die **digitale Schaltzentrale**, die den gesamten Wertschöpfungsprozess der FassadenFix GmbH abbildet – von der ersten Kundenanfrage bis zur 5-Jahres-Garantieabwicklung.

> **"Unser Herz schlägt grün"** – Diese Philosophie spiegelt sich in jedem Aspekt der Software wider: Weniger Papier, effizientere Prozesse, transparente Kommunikation und messbare Ergebnisse.

### 1.2 Der Mehrwert

| Bereich | Vorher (Hero-Software) | Nachher (FaFi PM) |
|---------|------------------------|-------------------|
| **Angebotserstellung** | 45+ Minuten, manuell | **< 10 Minuten**, automatisiert |
| **Datenqualität** | Verstreut, inkonsistent | **Zentral**, validiert |
| **CRM-Integration** | Keine | **HubSpot-Sync** in Echtzeit |
| **Mobilität** | Desktop-only | **iPad-optimiert**, responsive |
| **Transparenz** | Silos, E-Mail-Chaos | **Echtzeit-Dashboard**, Aktivitäten-Feed |

### 1.3 Zielgruppe

Die Software ist konzipiert für **Handwerker und Praktiker** (männlich, 25-50 Jahre), die keine Akademiker sind. Daher gilt:

- **Klare, intuitive Sprache** – Keine Fachbegriffe ohne Erklärung
- **Sofort erfassbarer Nutzen** – Jede Funktion erklärt sich selbst
- **Touch-optimiert** – Große Buttons, einfache Navigation
- **Fehlertoleranz** – Entwürfe speichern, Rückgängig-Funktion

---

## 2. Systemarchitektur

### 2.1 Technologie-Stack

| Komponente | Technologie | Version | Begründung |
|------------|-------------|---------|------------|
| **Frontend** | React + TypeScript | 19.x / 5.9 | Moderne UI, Typsicherheit |
| **Styling** | Tailwind CSS | 4.x | CI-konforme Gestaltung |
| **API** | tRPC | 11.x | End-to-End Typsicherheit |
| **Datenbank** | TiDB Serverless | - | MySQL-kompatibel, skalierbar |
| **ORM** | Drizzle | 0.44 | Typsichere Queries |
| **Auth** | Manus OAuth | - | SSO, sichere Sessions |
| **CRM** | HubSpot MCP | - | Bidirektionaler Sync |
| **E-Mail** | Outlook MCP | - | Angebots-Versand |

### 2.2 Datenmodell

Das System umfasst **28 Datenbank-Tabellen** in 6 Domänen:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FaFi PM Datenmodell                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  KERN-ENTITÄTEN          FINANZEN           OPERATIONS          │
│  ├── projects            ├── orders          ├── constructionSites
│  ├── properties          ├── invoices        ├── appointments    │
│  ├── companies           ├── payments        ├── tasks           │
│  ├── contacts            ├── budgets         ├── activityLogs    │
│  └── offers              └── warranties      └── documents       │
│                                                                 │
│  CRM-SYNC                TEAM               SYSTEM              │
│  ├── syncStatus          ├── users           ├── textBlocks      │
│  └── hubspotCache        ├── teamMembers     └── customerReports │
│                          └── roles                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Kernmodule & Workflows

### 3.1 Dashboard (Cockpit)

Das Dashboard ist die **zentrale Anlaufstelle** für alle Mitarbeiter. Es zeigt auf einen Blick:

| Widget | Funktion | Datenquelle |
|--------|----------|-------------|
| **KPI-Cards** | Offene Angebote, Projekte, Baustellen, Aufgaben | Echtzeit-Aggregation |
| **Kanban-Board** | Projekte nach Phase (Angebot → Abschluss) | projects.phase |
| **HubSpot-Status** | Sync-Status, Kontakte, Deals | hubspotCache |
| **Aktivitäten-Feed** | Letzte Aktionen aller Benutzer | activityLogs |
| **Schnellaktionen** | Neues Projekt, Objektaufnahme, Angebot | Wizard-Trigger |

### 3.2 Projekt-Lifecycle (10 Phasen)

Jedes Projekt durchläuft einen definierten Lebenszyklus:

| Phase | Name | Verantwortlich | Nächste Aktion |
|-------|------|----------------|----------------|
| 1 | Objektaufnahme | Kundenberater | Immobilie erfassen |
| 2 | Angebot erstellt | Kundenberater | Kalkulation prüfen |
| 3 | Angebot versendet | Büro | Nachfassen planen |
| 4 | Nachfassen | Kundenberater | Entscheidung einholen |
| 5 | Auftrag gewonnen | Kundenberater | Planung starten |
| 6 | Planung | AT-Leiter | Ressourcen buchen |
| 7 | Vorbereitung | AT-Leiter | Baustelle einrichten |
| 8 | Durchführung | Projektleiter | Fortschritt dokumentieren |
| 9 | Abnahme | Projektleiter | Protokoll erstellen |
| 10 | Abgeschlossen | Büro | Garantie aktivieren |

### 3.3 Objektaufnahme-Wizard (5 Schritte)

Der Wizard führt durch die strukturierte Erfassung einer Immobilie:

**Schritt 1: Stammdaten**
- Adresse (Straße, PLZ, Ort)
- HubSpot-Verknüpfung (Company, Contact)
- Ansprechpartner vor Ort

**Schritt 2: Technische Aufnahme**
- Seitenweise Erfassung (Nord, Ost, Süd, West, Dach, Sockel)
- Pro Seite: Aufmaß (Breite × Höhe = Fläche automatisch)
- Pro Seite: Fotos, Videos, 360°-Tour
- Pro Seite: Zustand, Schäden, Besonderheiten

**Schritt 3: Ressourcen & Logistik**
- Bühnentyp-Auswahl pro Seite
- Sperrungen (Gehweg, Parkplatz, Straße)
- Wasseranschluss (Standort, Typ, Zoll)
- Reinigungsmittel-Auswahl

**Schritt 4: Kaufmännische Daten**
- Wunschtermine
- Rabatt-Optionen (Frühbucher, Treue)
- Marketing-Quelle

**Schritt 5: Zusammenfassung**
- Alle Daten auf einen Blick
- Entwurf speichern oder abschließen

### 3.4 Angebots-Generator (Kernmodul)

Der Angebots-Generator ist das **Herzstück** des MVP. Er ermöglicht die Erstellung CI-konformer PDF-Angebote in unter 10 Minuten.

**Preisstaffelung:**

| Gesamtfläche | Preis/m² | Frühbucher-Rabatt |
|--------------|----------|-------------------|
| bis 1.000 m² | 10,50 € | 6% (Code: FRÜHBUCHER) |
| 1.001–3.000 m² | 9,75 € | 4,5% |
| 3.001–5.000 m² | 9,25 € | 3% |
| ab 5.001 m² | 8,75 € | 1,5% |

**PDF-Positionierung (X.1–X.5):**

| Position | Inhalt |
|----------|--------|
| X.1 | Eckdaten/Stammdaten der Immobilie |
| X.2 | FassadenFix Systemreinigung (m²) |
| X.3 | Arbeitshöhe/Bühnentechnik |
| X.4 | Baustelleneinrichtung |
| X.5 | Übernachtungskosten |

### 3.5 HubSpot-Integration

Die bidirektionale Synchronisation mit HubSpot umfasst:

| Objekt | Import (HubSpot → FaFi) | Export (FaFi → HubSpot) |
|--------|-------------------------|-------------------------|
| **Companies** | ✅ Automatisch | ✅ Bei Neuanlage |
| **Contacts** | ✅ Automatisch | ✅ Bei Neuanlage |
| **Deals** | ✅ Automatisch | ✅ Bei Angebotsversand |
| **Engagements** | – | ✅ E-Mail-Tracking |

---

## 4. Benutzerrollen & Berechtigungen

### 4.1 Rollenmodell

| Rolle | Beschreibung | Berechtigungen |
|-------|--------------|----------------|
| **Admin** | Systemadministrator | Vollzugriff, Benutzerverwaltung |
| **Geschäftsführung** | Strategische Übersicht | Dashboard, Reports, alle Projekte |
| **Kundenberater** | Vertrieb, Angebote | Projekte, Angebote, Kontakte |
| **AT-Leiter** | Arbeitsvorbereitung | Planung, Ressourcen, Baustellen |
| **Projektleiter** | Baustellenleitung | Baustellen, Logbuch, Abnahme |
| **Büro** | Administration | Rechnungen, Dokumente, Garantien |

### 4.2 Authentifizierung

- **Manus OAuth** für Single Sign-On
- **JWT-Sessions** mit automatischer Verlängerung
- **Rollenbasierte Zugriffskontrolle** (RBAC)

---

## 5. CI-Konformität

### 5.1 Verpflichtende Farben

| Farbe | Pantone | HEX | RGB | Verwendung |
|-------|---------|-----|-----|------------|
| **FassadenFix Grün** | **368 C** | `#77bc1f` | R119 G188 B31 | Primärfarbe, Buttons, Akzente |
| **Dunkelgrau** | **445 C** | `#4e5758` | R78 G87 B88 | Sidebar, Text, Sekundär |

### 5.2 Typografie

| Element | Schriftart | Gewicht |
|---------|------------|---------|
| **Logo** | Raleway | Bold 700 |
| **Headlines** | Raleway | Bold 700 |
| **Body** | Raleway | Regular 400 |

### 5.3 UI-Komponenten

| Komponente | Spezifikation |
|------------|---------------|
| **Border-Radius Buttons** | 8px |
| **Border-Radius Cards** | 12px |
| **Touch-Targets** | min. 44–56px |
| **Spacing** | 4px Raster |

---

## 6. Metriken & Erfolgskriterien

### 6.1 Aktuelle Kennzahlen (Stand: 05.02.2026)

| Metrik | Wert |
|--------|------|
| **Datenbank-Tabellen** | 28 |
| **tRPC-Router** | 31 |
| **Frontend-Seiten** | 45 |
| **Unit-Tests** | 137 (100% bestanden) |
| **HubSpot-Sync** | 1.000+ Kontakte, Unternehmen, Deals |

### 6.2 Ziel-KPIs

| KPI | Ziel | Aktuell |
|-----|------|---------|
| **Angebotserstellung** | < 10 Min | ✅ Erreicht |
| **Test-Abdeckung** | > 80% | ✅ 100% |
| **TypeScript-Fehler** | 0 | ✅ 0 |
| **Mobile-Optimierung** | iPad-ready | ✅ Erreicht |

---

## 7. Roadmap

| Phase | Zeitraum | Inhalt | Status |
|-------|----------|--------|--------|
| **MVP v1** | Q4 2025 | Kernmodule, Angebots-Generator | ✅ Abgeschlossen |
| **MVP v2** | Q1 2026 | HubSpot-Sync, 13 Mockup-Seiten, PDF-Export | ✅ Abgeschlossen |
| **Phase 2** | Q2 2026 | Mobile App, Offline-Modus, Ressourcenplanung | ⏳ Geplant |
| **Phase 3** | Q3 2026 | Kundenportal, Marketing Intelligence | ⏳ Geplant |

---

## 8. Anhang

### 8.1 Glossar

| Begriff | Definition |
|---------|------------|
| **AT-Leiter** | Arbeitsvorbereitung-Teamleiter |
| **Bühne** | Hebebühne für Fassadenarbeiten |
| **Frühbucher** | Rabatt bei Buchung > 6 Monate im Voraus |
| **Objektaufnahme** | Strukturierte Erfassung einer Immobilie |
| **Störer** | Grafisches Highlight-Element im PDF |

### 8.2 Referenzen

- FassadenFix Katalog 2025
- Logo-Finale.pdf (CI-Richtlinien)
- HubSpot MCP-Dokumentation

---

<div align="center">
  <sub>Erstellt mit 💚 von FassadenFix | Version 2.0 | Februar 2026</sub>
</div>
