# Datenmigrations-Konzept: Bestandsdaten-Import

**Stand:** 09.02.2026  
**Autor:** FaFi PM System  
**Ziel:** Strukturiertes Konzept für den Import von Bestandsdaten aus Legacy-Systemen

---

## 1. Datenquellen

### 1.1 HubSpot CRM (Primärquelle)
- **Unternehmen:** Name, Adresse, Branche, Kontaktdaten
- **Kontakte:** Name, E-Mail, Telefon, Position, Unternehmenszuordnung
- **Deals:** Projektnamen, Werte, Phasen, Zuordnungen
- **Import-Methode:** HubSpot API v3 (bereits integriert via `server/services/hubspot.ts`)

### 1.2 Excel/CSV-Dateien
- **Projektlisten:** Historische Projekte mit Flächen, Preisen, Daten
- **Immobilien-Datenbank:** Adressen, Fassadentypen, Flächen
- **Preislisten:** Staffelpreise, Sonderkonditionen
- **Import-Methode:** CSV-Parser mit Validierung

### 1.3 E-Mail-Archiv (Microsoft 365)
- **Kundenkommunikation:** E-Mail-Verläufe zu Projekten
- **Import-Methode:** Microsoft Graph API (bereits integriert via `server/services/microsoft365.ts`)

---

## 2. Migrations-Strategie

### Phase 1: Vorbereitung (1 Tag)
1. Backup der aktuellen Datenbank erstellen
2. Migrations-Skript-Verzeichnis anlegen
3. Validierungsregeln definieren
4. Duplikat-Erkennungslogik implementieren

### Phase 2: Unternehmen & Kontakte (1 Tag)
1. HubSpot-Unternehmen abrufen und mappen
2. Duplikate erkennen (Name + PLZ)
3. Kontakte mit Unternehmenszuordnung importieren
4. Hauptkontakt-Markierung setzen

### Phase 3: Projekte & Immobilien (1-2 Tage)
1. Historische Projekte aus Excel importieren
2. Phasen-Mapping: Legacy-Status → FaFi-Phasen
3. Immobilien mit Fassadendaten anlegen
4. Projekt-Immobilien-Zuordnung (M:N via `projectProperties`)

### Phase 4: Dokumente & Fotos (1 Tag)
1. Bestehende Angebote/Rechnungen als PDF-Referenzen
2. Fotos in S3 hochladen und Metadaten speichern
3. Dokumenten-Kette rekonstruieren

### Phase 5: Validierung (1 Tag)
1. Datenintegrität prüfen (Foreign Keys, Pflichtfelder)
2. Stichproben-Vergleich mit Quelldaten
3. Benutzer-Review der importierten Daten

---

## 3. Technische Umsetzung

### 3.1 Migrations-Skript-Struktur

```
scripts/migration/
  ├── 01-import-companies.mjs     # Unternehmen aus HubSpot/CSV
  ├── 02-import-contacts.mjs      # Kontakte mit Zuordnung
  ├── 03-import-projects.mjs      # Projekte mit Phasen-Mapping
  ├── 04-import-properties.mjs    # Immobilien mit Fassadendaten
  ├── 05-import-documents.mjs     # Dokumente und Fotos
  ├── 06-validate.mjs             # Validierung und Bericht
  ├── lib/
  │   ├── csv-parser.mjs          # CSV-Import-Helfer
  │   ├── duplicate-check.mjs     # Duplikat-Erkennung
  │   └── mapping.mjs             # Feld-Mapping-Regeln
  └── data/
      ├── companies.csv           # Beispiel-Import-Datei
      └── mapping-rules.json      # Konfigurierbare Mapping-Regeln
```

### 3.2 Duplikat-Erkennung

| Entität | Schlüssel | Strategie |
|---------|-----------|-----------|
| Unternehmen | Name + PLZ | Fuzzy-Match (Levenshtein ≤ 2) |
| Kontakte | E-Mail | Exakter Match |
| Projekte | Projektname + Unternehmen | Exakter Match |
| Immobilien | Straße + PLZ + Hausnummer | Exakter Match |

### 3.3 Phasen-Mapping

| Legacy-Status | FaFi-Phase |
|---------------|------------|
| "Neu" / "Anfrage" | objektaufnahme |
| "Angebot erstellt" | angebot_erstellt |
| "Angebot versendet" | angebot_versendet |
| "Wartet auf Rückmeldung" | nachfassen |
| "Beauftragt" / "Gewonnen" | auftrag_gewonnen |
| "In Planung" | planung |
| "In Arbeit" / "Aktiv" | durchfuehrung |
| "Abnahme" | abnahme |
| "Fertig" / "Abgeschlossen" | abgeschlossen |
| "Verloren" / "Storniert" | verloren |

---

## 4. Rollback-Strategie

1. Vor jedem Import-Schritt: Datenbank-Snapshot erstellen
2. Jeder Import-Schritt ist idempotent (kann wiederholt werden)
3. Bei Fehler: Rollback auf letzten Snapshot
4. Import-Log mit allen Änderungen für Audit-Trail

---

## 5. Zeitplan

| Phase | Aufwand | Abhängigkeiten |
|-------|---------|----------------|
| Vorbereitung | 4h | Keine |
| Unternehmen & Kontakte | 6h | HubSpot-API-Zugang |
| Projekte & Immobilien | 8h | Phase 2 abgeschlossen |
| Dokumente & Fotos | 4h | S3-Zugang |
| Validierung | 4h | Alle Phasen abgeschlossen |
| **Gesamt** | **~26h** | |
