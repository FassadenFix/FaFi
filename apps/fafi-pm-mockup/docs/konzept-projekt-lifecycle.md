# Konzeptdokument: Projekte als zentraler Einstiegspunkt mit Lifecycle-Steuerung

**Stand:** 09. Februar 2026
**Bezug:** Interview-Analyse IA-IMM-02, Abarbeitungsplan Nr. 68
**Abhängigkeit:** Konzeptdokument "Immobilie als eigenständiges Asset" (Nr. 67)

---

## 1. Grundgedanke

> Das **Projekt** ist der zentrale Einstiegspunkt für alle operativen Tätigkeiten. Jede Aktion – von der Objektaufnahme bis zur Garantie – findet im Kontext eines Projekts statt. Das Projekt steuert den gesamten Lebenszyklus eines Auftrags.

### Warum ist das wichtig?

FassadenFix arbeitet projektbasiert. Ein Projekt bündelt:
- **Wer** (Kunde/Unternehmen)
- **Was** (Immobilien/Fassaden)
- **Wann** (Zeitraum)
- **Wie** (Team, Ressourcen, Methoden)
- **Wieviel** (Angebot, Rechnung)

Ohne Projekt gibt es keinen Kontext für operative Entscheidungen.

---

## 2. Projekt-Lifecycle (Phasenmodell)

Das Projekt durchläuft einen definierten Lifecycle mit 10 Phasen + 1 Sonderstatus:

```
┌────────────────────────────────────────────────────────────────────┐
│                      PROJEKT-LIFECYCLE                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  AKQUISE-PHASE (Vertrieb)                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│  │ 1. OBJEKT-   │──▶│ 2. ANGEBOT   │──▶│ 3. ANGEBOT   │          │
│  │    AUFNAHME   │   │    ERSTELLT   │   │    VERSENDET  │          │
│  └──────────────┘   └──────────────┘   └──────────────┘          │
│         │                                      │                   │
│         │                              ┌───────┴───────┐          │
│         │                              ▼               ▼          │
│         │                     ┌──────────────┐  ┌──────────┐     │
│         │                     │ 4. NACH-     │  │ 99.      │     │
│         │                     │    FASSEN     │  │ VERLOREN │     │
│         │                     └──────┬───────┘  └──────────┘     │
│         │                            │                            │
│  AUFTRAGS-PHASE (Planung)            ▼                            │
│  ┌──────────────┐   ┌──────────────┐                              │
│  │ 5. AUFTRAG   │──▶│ 6. PLANUNG   │                              │
│  │    GEWONNEN   │   │              │                              │
│  └──────────────┘   └──────┬───────┘                              │
│                            │                                       │
│  DURCHFÜHRUNGS-PHASE       ▼                                       │
│  ┌──────────────┐   ┌──────────────┐                              │
│  │ 7. VORBE-    │──▶│ 8. DURCH-    │                              │
│  │    REITUNG    │   │    FÜHRUNG    │                              │
│  └──────────────┘   └──────┬───────┘                              │
│                            │                                       │
│  ABSCHLUSS-PHASE           ▼                                       │
│  ┌──────────────┐   ┌──────────────┐                              │
│  │ 9. ABNAHME   │──▶│ 10. ABGE-   │                              │
│  │              │   │     SCHLOSSEN │                              │
│  └──────────────┘   └──────────────┘                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Gates und Bedingungen

Jeder Phasenübergang ist durch **Gates** geschützt. Ein Gate prüft, ob bestimmte Voraussetzungen erfüllt sind, bevor das Projekt in die nächste Phase wechseln kann.

### 3.1 Gate-Übersicht

| Übergang | Gate | Bedingung |
|----------|------|-----------|
| 1 → 2 | hasProperty | Mindestens 1 Immobilie erfasst |
| 2 → 3 | hasOffer | Angebot erstellt und freigegeben |
| 3 → 4 | manual | Manuell durch Kundenberater |
| 4 → 5 | manual | Kunde hat zugesagt |
| 5 → 6 | manual | Auftrag bestätigt |
| 6 → 7 | hasTeam | Team zugeordnet |
| 7 → 8 | hasPreDocumentation | Vorher-Dokumentation vollständig |
| 8 → 9 | manual | Arbeiten abgeschlossen |
| 9 → 10 | hasAcceptance | Abnahmeprotokoll erstellt |
| * → 99 | manual | Projekt verloren (jederzeit möglich) |

### 3.2 Implementierung

Die Gates sind im Workflow-System als **Guards** implementiert:

```typescript
// server/workflow/guards.ts
export const guards = {
  hasProperty: async (projectId) => {
    const properties = await db.getPropertiesByProjectId(projectId);
    return properties.length > 0;
  },
  hasOffer: async (projectId) => {
    const offers = await db.getOffersByProjectId(projectId);
    return offers.some(o => o.status !== 'entwurf');
  },
  // ...
};
```

---

## 4. Projekt als Navigations-Hub

### 4.1 Alles erreichbar über das Projekt

Von der Projektdetailseite aus sind alle relevanten Informationen und Aktionen erreichbar:

```
PROJEKT-DETAIL
├── Übersicht (Phase, Fortschritt, Team)
├── Immobilien (Objektaufnahme, Fotos, Seiten)
├── Angebote (Erstellen, Versenden, Status)
├── Baustelle (Arbeitstage, Logbuch, Fotos)
├── Dokumente (Angebote, Protokolle, Garantien)
├── Kommunikation (Kundenportal, E-Mails)
├── Finanzen (Rechnungen, Zahlungen)
└── Workflow (Phasensteuerung, Gates)
```

### 4.2 Kontextuelle Aktionen

Die verfügbaren Aktionen hängen von der aktuellen Phase ab:

| Phase | Primäre Aktion | Sekundäre Aktionen |
|-------|---------------|-------------------|
| 1. Objektaufnahme | Immobilie erfassen | Fotos hochladen |
| 2. Angebot erstellt | Angebot prüfen | PDF generieren |
| 3. Angebot versendet | Nachfassen planen | Status tracken |
| 4. Nachfassen | Kunde kontaktieren | Angebot anpassen |
| 5. Auftrag gewonnen | Planung starten | Team zuordnen |
| 6. Planung | Ressourcen buchen | Zeitplan erstellen |
| 7. Vorbereitung | Vorher-Doku | Material bestellen |
| 8. Durchführung | Arbeitstag führen | Logbuch schreiben |
| 9. Abnahme | Protokoll erstellen | Garantie ausstellen |
| 10. Abgeschlossen | Rechnung erstellen | Feedback einholen |

---

## 5. Beziehung Projekt ↔ Immobilie

Wie im Konzeptdokument "Immobilie als eigenständiges Asset" beschrieben, ist die Beziehung zwischen Projekt und Immobilie eine **n:m-Beziehung**:

- Ein Projekt kann mehrere Immobilien umfassen
- Eine Immobilie kann in mehreren Projekten vorkommen (über die Zeit)

### 5.1 Aktuelle Implementierung (MVP)

Im MVP ist die Beziehung als **1:n** implementiert (ein Projekt hat mehrere Immobilien, aber jede Immobilie gehört zu genau einem Projekt). Dies ist für den MVP ausreichend, sollte aber in einer zukünftigen Version zu einer echten n:m-Beziehung erweitert werden.

### 5.2 Zukünftige Erweiterung

```
projects ──┐
           ├── project_properties (Zuordnungstabelle)
properties ─┘
```

Vorteile:
- Immobilie muss nicht neu erfasst werden
- Historische Daten bleiben erhalten
- Preisvergleich über Projekte hinweg möglich

---

## 6. Rollen und Verantwortlichkeiten

Jede Phase hat klare Verantwortlichkeiten:

| Phase | Hauptverantwortlich | Unterstützend |
|-------|-------------------|--------------|
| 1-4 (Akquise) | Kundenberater | Büro |
| 5-6 (Planung) | Projektleiter | AT-Leiter |
| 7-8 (Durchführung) | AT-Leiter | Teamleiter |
| 9-10 (Abschluss) | Projektleiter | Büro |

### 6.1 Rollenbasierte Sichtbarkeit

- **Geschäftsführung:** Alle Projekte, alle Phasen
- **Kundenberater:** Projekte in Phase 1-5 (eigene)
- **Projektleiter:** Projekte in Phase 5-10 (zugeordnete)
- **AT-Leiter:** Projekte in Phase 6-9 (zugeordnete)
- **Büro:** Alle Projekte (administrative Sicht)

---

## 7. Ampel-System

Jede Phase hat eine **Ampelfarbe**, die den Gesamtstatus des Projekts signalisiert:

| Farbe | Bedeutung | Phasen |
|-------|-----------|--------|
| Grün | Im Plan, keine Probleme | Alle Phasen (Standard) |
| Gelb | Aufmerksamkeit erforderlich | Nachfassen, Verzögerungen |
| Rot | Kritisch, sofortige Aktion nötig | Überfällig, Probleme |

Das Ampel-System wird automatisch berechnet basierend auf:
- Zeitliche Verzögerungen (geplant vs. tatsächlich)
- Offene Aufgaben (überfällig)
- Fehlende Dokumentation (Gates nicht erfüllt)
- Manuelle Eskalation (durch Projektleiter)

---

## 8. Fazit

Das Projekt als zentraler Einstiegspunkt mit Lifecycle-Steuerung bietet:

1. **Transparenz:** Jeder weiß, in welcher Phase ein Projekt ist
2. **Qualitätssicherung:** Gates verhindern das Überspringen wichtiger Schritte
3. **Effizienz:** Kontextuelle Aktionen reduzieren Suchaufwand
4. **Nachvollziehbarkeit:** Lückenlose Dokumentation über den gesamten Lifecycle
5. **Skalierbarkeit:** Das Phasenmodell kann um weitere Phasen erweitert werden
