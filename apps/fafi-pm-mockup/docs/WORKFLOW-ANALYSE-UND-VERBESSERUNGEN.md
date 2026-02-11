<div align="center">
  <img src="https://fassadenfix.de/wp-content/uploads/2023/03/FassadenFix_Logo_bunt_transparent.png" alt="FassadenFix Logo" width="200">

  # FaFi PM – Workflow-Analyse & Verbesserungsvorschläge
  
  **Soll-Ist-Vergleich: Zielsetzung vs. Umsetzung**
  
  Stand: 05. Februar 2026
</div>

---

## Executive Summary

Diese Analyse prüft, ob die implementierten Workflows im FaFi PM die ursprünglichen Zielsetzungen erfüllen und identifiziert **Prozessbrüche**, **Inkonsistenzen** und **Verbesserungspotenziale**. Die Bewertung erfolgt aus der Perspektive der Zielgruppe: Handwerker und Praktiker, die ein intuitives Alltagswerkzeug benötigen.

**Gesamtbewertung:** ⭐⭐⭐⭐ (4/5) – Solide Basis mit identifizierten Optimierungspotenzialen

---

## 1. Der ideale Workflow (SOLL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FaFi PM – Idealer Prozessablauf                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VERTRIEB                    PLANUNG                    AUSFÜHRUNG          │
│  ─────────                   ───────                    ──────────          │
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ Objekt-  │──▶│ Angebot  │──▶│ Auftrag  │──▶│ Planung  │──▶│ Baustelle│  │
│  │ aufnahme │   │ erstellen│   │ gewonnen │   │          │   │ einrichten│ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│       │              │              │              │              │         │
│       ▼              ▼              ▼              ▼              ▼         │
│  [Immobilie]    [PDF-Export]   [Deal→HubSpot]  [Ressourcen]  [Logbuch]     │
│  [HubSpot-Sync] [E-Mail]       [Auftragsbestät][Termine]     [Fortschritt] │
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐                 │
│  │ Durch-   │──▶│ Abnahme  │──▶│ Rechnung │──▶│ Garantie │                 │
│  │ führung  │   │          │   │          │   │          │                 │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘                 │
│       │              │              │              │                        │
│       ▼              ▼              ▼              ▼                        │
│  [Tagesberichte] [Protokoll]   [PDF-Rechnung] [Zertifikat]                 │
│  [Fotos]         [Mängelliste] [Zahlungseing] [Inspektionen]               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Identifizierte Prozessbrüche & Inkonsistenzen

### 🔴 KRITISCH: Fehlende Übergänge zwischen Phasen

| Bruch | Beschreibung | Auswirkung | Priorität |
|-------|--------------|------------|-----------|
| **Angebot → Auftrag** | Kein automatischer Workflow bei Auftragsannahme | Benutzer muss manuell Status ändern, Deal in HubSpot aktualisieren, Auftragsbestätigung erstellen | 🔴 Hoch |
| **Auftrag → Baustelle** | Baustelle muss separat angelegt werden | Daten aus Objektaufnahme werden nicht automatisch übernommen | 🔴 Hoch |
| **Abnahme → Rechnung** | Kein automatischer Rechnungsentwurf | Nach Abnahme muss Rechnung komplett manuell erstellt werden | 🔴 Hoch |
| **Rechnung → Garantie** | Garantie wird nicht automatisch aktiviert | Nach Zahlungseingang muss Garantiezertifikat manuell erstellt werden | 🟡 Mittel |

### 🟡 MITTEL: Fehlende Automatisierungen

| Lücke | Beschreibung | Lösung |
|-------|--------------|--------|
| **Aufgaben-Generierung** | Phasenwechsel erzeugt keine automatischen Tasks | Bei Statusänderung sollten rollenspezifische Aufgaben erstellt werden |
| **Erinnerungen** | Keine automatischen Erinnerungen für überfällige Aktionen | Countdown-Widget zeigt Tasks, aber keine Push-Benachrichtigungen |
| **Dokumenten-Kette** | Dokumente sind nicht automatisch verknüpft | Angebot → Auftragsbestätigung → Rechnung sollten eine Kette bilden |

### 🟢 GERING: UX-Verbesserungen

| Bereich | Problem | Verbesserung |
|---------|---------|--------------|
| **Navigation** | Sidebar zeigt alle Module gleichwertig | Kontextabhängige Hervorhebung der nächsten Aktion |
| **Projekt-Detail** | Viele Tabs, aber kein "Nächster Schritt"-Hinweis | Prominente CTA für die aktuelle Phase |
| **Baustellen-Logbuch** | Separate Seite, nicht im Kontext | Inline-Erfassung direkt in der Baustellen-Ansicht |

---

## 3. Detailanalyse pro Workflow-Phase

### Phase 1-2: Objektaufnahme & Angebotserstellung ✅ GUT

**Was funktioniert:**
- 5-Schritt-Wizard führt strukturiert durch die Erfassung
- Seitenweise Aufnahme (Nord/Ost/Süd/West/Dach/Sockel) ist logisch
- Automatische Flächenberechnung (Breite × Höhe)
- Preisstaffelung wird korrekt angewendet
- PDF-Export im CI-Design funktioniert
- E-Mail-Versand über Outlook integriert

**Was fehlt:**
- ❌ Keine Vorlagen für wiederkehrende Objekttypen (z.B. "Standardwohnblock 8-Familien")
- ❌ Keine Duplikat-Erkennung bei ähnlichen Adressen
- ❌ Kein "Schnell-Angebot" für Bestandskunden

### Phase 3-4: Angebot versendet & Nachfassen 🟡 VERBESSERUNGSBEDARF

**Was funktioniert:**
- Angebot wird per E-Mail versendet
- HubSpot-Engagement wird erstellt
- Status kann manuell geändert werden

**Was fehlt:**
- ❌ **Kein automatisches Nachfass-Datum** – System sollte nach 7 Tagen erinnern
- ❌ **Keine Wiedervorlage-Funktion** – "Erneut kontaktieren am..."
- ❌ **Kein Angebots-Tracking** – Wurde das PDF geöffnet? (technisch schwierig, aber wünschenswert)
- ❌ **Keine Konkurrenz-Notiz** – Feld für "Kunde hat auch Angebot von..."

### Phase 5: Auftrag gewonnen 🔴 KRITISCHER BRUCH

**Das Problem:**
Wenn ein Kunde zusagt, muss der Benutzer aktuell:
1. Projekt-Status manuell auf "Auftrag gewonnen" ändern
2. HubSpot-Deal manuell aktualisieren
3. Auftragsbestätigung manuell erstellen (kein Wizard!)
4. Baustelle separat anlegen
5. Ressourcen separat planen

**Die Lösung:**
Ein **"Auftrag-Annahme-Wizard"** sollte automatisch:
1. Status ändern
2. HubSpot-Deal auf "Won" setzen
3. Auftragsbestätigung aus Angebot generieren
4. Baustelle mit allen Daten aus Objektaufnahme anlegen
5. Standard-Aufgaben für AT-Leiter erstellen

### Phase 6-7: Planung & Vorbereitung 🟡 VERBESSERUNGSBEDARF

**Was funktioniert:**
- Baustellen-Seite existiert
- Logbuch kann geführt werden
- Wetter-Widget zeigt aktuelle Bedingungen

**Was fehlt:**
- ❌ **Keine Ressourcen-Planung** – Welche Bühne? Welches Team?
- ❌ **Keine Kalender-Integration** – Termine nur als Liste, nicht im Kalender
- ❌ **Keine Checklisten** – "Vor Baustellenstart zu erledigen"
- ❌ **Keine Material-Liste** – Automatisch aus Objektaufnahme generieren

### Phase 8: Durchführung 🟡 VERBESSERUNGSBEDARF

**Was funktioniert:**
- Logbuch-Einträge können erstellt werden
- Fortschritt kann dokumentiert werden
- Fotos können hochgeladen werden

**Was fehlt:**
- ❌ **Kein Tagesbericht-Template** – Strukturierte Erfassung (Wetter, Team, Fortschritt, Probleme)
- ❌ **Keine Zeiterfassung** – Stunden pro Mitarbeiter
- ❌ **Keine Abweichungs-Meldung** – "Mehr Fläche als geplant"

### Phase 9: Abnahme 🔴 KRITISCHER BRUCH

**Das Problem:**
Nach Abschluss der Arbeiten gibt es keinen strukturierten Abnahme-Prozess:
1. Kein Abnahme-Protokoll-Wizard
2. Keine Mängelliste mit Foto-Upload
3. Keine digitale Unterschrift des Kunden
4. Keine automatische Weiterleitung zur Rechnungsstellung

**Die Lösung:**
Ein **"Abnahme-Wizard"** sollte:
1. Checkliste aller gereinigten Flächen
2. Foto-Dokumentation (Vorher/Nachher)
3. Mängelliste mit Nachbesserungstermin
4. Digitale Unterschrift (Touch-optimiert für iPad)
5. Automatische Rechnung-Erstellung nach Unterschrift

### Phase 10: Rechnung & Garantie 🔴 KRITISCHER BRUCH

**Das Problem:**
Die Rechnungsseite existiert, aber:
1. Keine Verknüpfung zum Auftrag/Angebot
2. Keine automatische Übernahme der Positionen
3. Kein Mahnwesen-Workflow
4. Garantie muss separat aktiviert werden

**Die Lösung:**
- Rechnung sollte aus Auftrag generiert werden (1-Klick)
- Zahlungserinnerungen automatisch nach 7/14/21 Tagen
- Bei Zahlungseingang: Garantie automatisch aktivieren
- Garantiezertifikat automatisch per E-Mail senden

---

## 4. Benutzerfreundlichkeits-Analyse

### Was die Zielgruppe braucht (Handwerker, 25-50 Jahre):

| Anforderung | Aktueller Stand | Bewertung |
|-------------|-----------------|-----------|
| **Große Touch-Targets** | ✅ 44-56px Buttons | ⭐⭐⭐⭐⭐ |
| **Klare Sprache** | ✅ Deutsche Begriffe, keine Anglizismen | ⭐⭐⭐⭐⭐ |
| **Wenige Klicks** | 🟡 Zu viele manuelle Schritte zwischen Phasen | ⭐⭐⭐ |
| **Offline-Fähigkeit** | ❌ Nicht implementiert | ⭐ |
| **Fehlertoleranz** | ✅ Entwürfe speichern | ⭐⭐⭐⭐ |
| **Visuelle Führung** | 🟡 Kein "Nächster Schritt"-Indikator | ⭐⭐⭐ |

### Konkrete UX-Probleme:

1. **Zu viele gleichwertige Menüpunkte** – Die Sidebar zeigt 15+ Einträge ohne Priorisierung
2. **Kein kontextabhängiger Fokus** – Dashboard zeigt alles, aber nicht "Was muss ICH jetzt tun?"
3. **Fehlende Bestätigungen** – Nach wichtigen Aktionen (Angebot versendet) fehlt ein "Erfolgs-Screen"
4. **Keine Gamification** – Keine Fortschrittsbalken, keine "Erledigt"-Animationen

---

## 5. Priorisierte Verbesserungsvorschläge

### 🔴 SOFORT (Sprint 1-2)

| # | Verbesserung | Aufwand | Impact |
|---|--------------|---------|--------|
| 1 | **Auftrag-Annahme-Wizard** – Automatisiert Statusänderung, Baustellen-Anlage, Aufgaben-Erstellung | 3 Tage | Sehr hoch |
| 2 | **Abnahme-Wizard** – Strukturiertes Protokoll mit Unterschrift | 2 Tage | Sehr hoch |
| 3 | **Rechnung aus Auftrag generieren** – 1-Klick-Rechnungserstellung | 1 Tag | Hoch |
| 4 | **Automatische Nachfass-Erinnerung** – 7 Tage nach Angebotsversand | 0.5 Tage | Hoch |

### 🟡 KURZFRISTIG (Sprint 3-4)

| # | Verbesserung | Aufwand | Impact |
|---|--------------|---------|--------|
| 5 | **"Meine Aufgaben"-Widget** – Rollenspezifische To-Do-Liste im Dashboard | 1 Tag | Hoch |
| 6 | **Phasen-Automatisierung** – Aufgaben automatisch bei Statuswechsel erstellen | 2 Tage | Mittel |
| 7 | **Mahnwesen-Workflow** – Automatische Zahlungserinnerungen | 1 Tag | Mittel |
| 8 | **Garantie-Aktivierung** – Automatisch bei Zahlungseingang | 0.5 Tage | Mittel |

### 🟢 MITTELFRISTIG (Sprint 5-8)

| # | Verbesserung | Aufwand | Impact |
|---|--------------|---------|--------|
| 9 | **Ressourcen-Planung** – Team- und Geräte-Zuweisung | 5 Tage | Mittel |
| 10 | **Kalender-Integration** – Termine im Kalender-View | 3 Tage | Mittel |
| 11 | **Tagesbericht-Template** – Strukturierte Baustellendoku | 2 Tage | Mittel |
| 12 | **Offline-Modus** – Datenerfassung ohne Internet | 10 Tage | Hoch |

---

## 6. Workflow-Optimierung: Vorher/Nachher

### Aktueller Workflow (IST):

```
Objektaufnahme ──[manuell]──▶ Angebot ──[manuell]──▶ Status ändern
                                                          │
                                                    [manuell]
                                                          ▼
Rechnung erstellen ◀──[manuell]── Abnahme ◀──[manuell]── Baustelle anlegen
       │
 [manuell]
       ▼
Garantie aktivieren
```

**Probleme:** 6 manuelle Übergänge, keine Automatisierung, hohe Fehleranfälligkeit

### Optimierter Workflow (SOLL):

```
Objektaufnahme ──[auto]──▶ Angebot ──[Wizard]──▶ Auftrag-Annahme-Wizard
                                                        │
                                                   [automatisch]
                                                        ▼
                                               ┌─ Baustelle anlegen
                                               ├─ Aufgaben erstellen
                                               └─ HubSpot aktualisieren
                                                        │
                                                   [Workflow]
                                                        ▼
Garantie aktivieren ◀──[auto]── Rechnung ◀──[Wizard]── Abnahme-Wizard
```

**Verbesserungen:** Nur 2 Wizard-Interaktionen, Rest automatisiert

---

## 7. Fazit & Empfehlung

### Stärken des aktuellen Systems:
- ✅ Solide technische Basis (28 Tabellen, 31 Router, 137 Tests)
- ✅ CI-konforme Gestaltung
- ✅ HubSpot-Integration funktioniert
- ✅ PDF-Generierung im Corporate Design
- ✅ Touch-optimiert für iPad

### Schwächen:
- ❌ Zu viele manuelle Übergänge zwischen Phasen
- ❌ Fehlende Wizards für kritische Prozesse (Auftrag-Annahme, Abnahme)
- ❌ Keine automatische Aufgaben-Generierung
- ❌ Kein "Nächster Schritt"-Indikator für Benutzer

### Empfehlung:

**Priorität 1:** Implementiere den **Auftrag-Annahme-Wizard** und den **Abnahme-Wizard**. Diese beiden Komponenten schließen die kritischsten Prozessbrüche und machen den Workflow "rund".

**Priorität 2:** Füge ein **"Meine Aufgaben"-Widget** zum Dashboard hinzu, das rollenspezifisch die nächsten Schritte anzeigt. Dies beantwortet die Frage "Was muss ich jetzt tun?" sofort.

**Priorität 3:** Automatisiere die **Aufgaben-Generierung** bei Phasenwechsel. Wenn ein Projekt in Phase 6 (Planung) wechselt, sollte automatisch eine Aufgabe "Ressourcen buchen" für den AT-Leiter erstellt werden.

---

<div align="center">
  <sub>Analyse erstellt von Manus AI | Februar 2026</sub>
</div>
