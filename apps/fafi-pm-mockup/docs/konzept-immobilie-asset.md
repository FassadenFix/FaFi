# Konzeptdokument: Immobilie als eigenständiges Asset

**Stand:** 09. Februar 2026
**Bezug:** Interview-Analyse IA-IMM-01, Abarbeitungsplan Nr. 67

---

## 1. Grundgedanke

> Die Immobilie ist kein Anhängsel eines Projekts, sondern ein **eigenständiges Asset mit eigenem Lebenszyklus**. Projekte kommen und gehen – die Immobilie bleibt.

### Warum ist das wichtig?

FassadenFix reinigt Fassaden. Die Fassade gehört zur Immobilie. Ein Projekt ist lediglich ein **zeitlich begrenzter Auftrag**, der an einer oder mehreren Immobilien durchgeführt wird. Die Immobilie existiert vor dem Projekt, während des Projekts und nach dem Projekt.

---

## 2. Lebenszyklus einer Immobilie

```
┌─────────────────────────────────────────────────────────────┐
│                    IMMOBILIEN-LEBENSZYKLUS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ERFASSUNG (Objektaufnahme)                              │
│     └── Adresse, Fassadenart, 4 Seiten, Fotos, Maße       │
│                                                             │
│  2. ZUORDNUNG (zu Projekt)                                  │
│     └── Immobilie wird einem Projekt zugewiesen             │
│     └── Mehrere Immobilien pro Projekt möglich              │
│                                                             │
│  3. BEARBEITUNG (Durchführung)                              │
│     └── Reinigung, Dokumentation, Vorher/Nachher-Fotos     │
│                                                             │
│  4. ABSCHLUSS (Abnahme)                                    │
│     └── Abnahmeprotokoll, Garantieurkunde                  │
│                                                             │
│  5. NACHBETREUUNG (Garantie)                                │
│     └── Garantiezeitraum, Inspektionen, Schadensmeldungen  │
│                                                             │
│  6. WIEDERHOLUNG (neues Projekt)                            │
│     └── Gleiche Immobilie, neues Projekt, alte Daten        │
│         bleiben erhalten als Referenz                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Datenmodell

### 3.1 Immobilie (Property)

Die Immobilie speichert alle **zeitunabhängigen** Informationen:

| Feld | Beschreibung | Lebenszyklus |
|------|-------------|-------------|
| Adresse | Straße, PLZ, Ort | Permanent |
| Fassadenart | WDVS, Putz, Klinker etc. | Permanent (kann sich ändern) |
| 4 Gebäudeseiten | Front, Rück, Links, Rechts | Permanent |
| Fläche pro Seite | m² | Permanent |
| Höhe | Maximalhöhe in Metern | Permanent |
| Fotos | Vorher-Zustand | Pro Projekt neu |
| Besonderheiten | Balkone, Markisen, Hindernisse | Permanent |
| Zuwegung | Zufahrt, Stellfläche | Permanent |
| Wasseranschluss | Verfügbarkeit, Position, Zoll | Permanent |

### 3.2 Beziehung Immobilie ↔ Projekt

```
UNTERNEHMEN (Kunde)
    ├── PROJEKT 1 (2024)
    │     ├── Immobilie A (Musterstr. 1)
    │     └── Immobilie B (Musterstr. 3)
    │
    ├── PROJEKT 2 (2025)
    │     ├── Immobilie A (Musterstr. 1)  ← GLEICHE Immobilie!
    │     └── Immobilie C (Bergstr. 5)
    │
    └── PROJEKT 3 (2026)
          └── Immobilie B (Musterstr. 3)  ← GLEICHE Immobilie!
```

### 3.3 Implementierung im aktuellen System

Im aktuellen MVP ist die Immobilie über die `properties`-Tabelle abgebildet:

- `properties.projectId` verknüpft die Immobilie mit einem Projekt
- `propertySides` speichert die 4 Gebäudeseiten mit allen Details
- `photos` speichert Fotos mit Kontext (Objektaufnahme, Baustelle, Abnahme)

**Zukünftige Erweiterung:** Die Immobilie sollte von der Projekt-Zuordnung entkoppelt werden, sodass eine Immobilie in mehreren Projekten referenziert werden kann, ohne Daten zu duplizieren.

---

## 4. Geschäftliche Bedeutung

### 4.1 Wiederkehrende Aufträge

Wenn ein Kunde nach 2-3 Jahren erneut eine Reinigung beauftragt, sind alle Daten der Immobilie bereits vorhanden:
- Fassadenart und Besonderheiten bekannt
- Vorher/Nachher-Fotos als Referenz
- Zuwegung und Wasseranschluss dokumentiert
- Preiskalkulation kann auf historischen Daten basieren

### 4.2 Versicherungsrelevanz

Die Fotodokumentation pro Immobilie dient als **Beweissicherung**:
- Vorher-Zustand dokumentiert (vor Reinigung)
- Nachher-Zustand dokumentiert (nach Reinigung)
- Schäden, die vor der Reinigung bestanden, sind nachweisbar
- Garantieansprüche können anhand der Dokumentation geprüft werden

### 4.3 Angebotserstellung

Die Immobilie liefert alle Daten für die automatische Angebotserstellung:
- Fläche → Preisstaffel
- Höhe → Bühnentyp und -kosten
- Fassadenart → Reinigungsmittel
- Entfernung → Übernachtung
- Besonderheiten → Sonderposten

---

## 5. Abgrenzung zum Projekt

| Aspekt | Immobilie | Projekt |
|--------|-----------|---------|
| Lebensdauer | Unbegrenzt | Zeitlich begrenzt |
| Zugehörigkeit | Zum Unternehmen/Standort | Zum Auftrag |
| Daten | Physische Eigenschaften | Planung, Durchführung, Abrechnung |
| Fotos | Zustandsdokumentation | Arbeitsdokumentation |
| Wiederverwendung | Ja, über Projekte hinweg | Nein, einmalig |

---

## 6. Fazit

Die Immobilie als eigenständiges Asset zu behandeln ist der Schlüssel für:
1. **Effizienz** bei wiederkehrenden Aufträgen
2. **Rechtssicherheit** durch lückenlose Dokumentation
3. **Automatisierung** der Angebotserstellung
4. **Kundenbindung** durch Wissensaufbau über den Bestand
