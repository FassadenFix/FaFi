# Skill & Agent Hub - Version 2.1

**Ein universelles, dynamisch erweiterbares Multi-Agent-Orchestrierungssystem mit vollständiger bidirektionaler Integration für 13+ KI-Plattformen.**

Dieses Repository enthält die vollständige Architektur und Implementierung eines zentralen Hubs, der als "Single Source of Truth" für wiederverwendbare **Skills** (atomare Fähigkeiten) und **Agents** (orchestrierende Einheiten) dient. Das System ermöglicht es, Fähigkeiten plattformübergreifend zu teilen, zu entdecken und dynamisch zu kombinieren.

## Kernkonzept: Vollständige Bidirektionalität

Der Hub ist nicht nur eine Bibliothek, aus der Skills exportiert werden. Er integriert auch die Kernfähigkeiten jeder angebundenen Plattform als **importierte Skills**. Das ermöglicht eine echte Cross-Plattform-Orchestrierung, bei der ein Agent, der auf Manus läuft, eine DALL-E-Bildgenerierung (OpenAI) anstoßen, das Ergebnis mit Gemini Vision (Google) analysieren und die Resultate in einem Microsoft 365-Dokument ablegen kann.

## Unterstützte Plattformen (Alle Bidirektional)

Das System integriert 13 führende KI- und Business-Plattformen vollständig bidirektional.

| Kategorie | Plattform | Export | Import | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Original 5** | Antigravity | ✓ | ✓ | **Vollständig** |
| | Claude Cowork & Code | ✓ | ✓ | **Vollständig** |
| | Manus 1.6 | ✓ | ✓ | **Vollständig** |
| | ChatGPT Codex (OpenAI) | ✓ | ✓ | **Vollständig** |
| **Microsoft** | Microsoft 365 Copilot | ✓ | ✓ | **Vollständig** |
| **Google** | Gemini | ✓ | ✓ | **Vollständig** |
| | NotebookLM | ✓ | ✓ | **Vollständig** |
| | Google AI Studio | ✓ | ✓ | **Vollständig** |
| **Suche & Analyse** | Perplexity AI | ✓ | ✓ | **Vollständig** |
| **Enterprise AI** | Abacus AI | ✓ | ✓ | **Vollständig** |
| **CRM & Business**| HubSpot & Breeze | ✓ | ✓ | **Vollständig** |

## Architektur-Highlights

1.  **Dynamische Registry**: Neue Skills/Agents werden durch Hinzufügen eines `manifest.json`-Verzeichnisses automatisch erkannt und registriert. Kein Code muss geändert werden.
2.  **Semantische Discovery**: Ein `DiscoveryService` findet passende Skills basierend auf natürlichsprachlichen Beschreibungen, Tags, Fähigkeiten und Ein-/Ausgabetypen.
3.  **Multi-Strategie-Orchestrierung**: Ein `Orchestrator` kann Skills sequentiell, parallel, bedingt oder vollständig dynamisch zur Laufzeit kombinieren.
4.  **Universeller API-Server**: Eine REST-API (`api_server.py`) stellt alle Funktionen bereit und generiert plattformspezifische Kataloge, Manifeste und Konfigurationen.
5.  **Bidirektionale Adapter**: Jeder Adapter ist dafür verantwortlich, Hub-Skills in das plattformspezifische Format zu übersetzen (Export) und Plattform-Fähigkeiten als Hub-Skills verfügbar zu machen (Import).

## Erste Schritte

1.  **Repository klonen**:
    ```bash
    gh repo clone FassadenFix/FaFi skill-agent-hub
    cd skill-agent-hub
    ```

2.  **Abhängigkeiten installieren**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **API-Schlüssel konfigurieren**:
    Setzen Sie die Umgebungsvariablen für die Plattformen, die Sie nutzen möchten (z.B. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, etc.).

4.  **API-Server starten**:
    ```bash
    python3 adapters/api_server.py
    ```
    Der Server startet auf `http://localhost:5000` und registriert automatisch alle vorhandenen Skills und Agents.

5.  **Plattform-Katalog abrufen**:
    Rufen Sie den Katalog für Ihre Zielplattform ab, um die Integration zu starten.
    ```bash
    # Beispiel für OpenAI / ChatGPT
    curl http://localhost:5000/api/v1/catalog/chatgpt_codex
    
    # Beispiel für Claude
    curl http://localhost:5000/api/v1/catalog/claude
    
    # Beispiel für Manus
    curl http://localhost:5000/api/v1/catalog/manus
    ```

## Verzeichnisstruktur

```
/skill-agent-hub
├── adapters/             # Plattform-Adapter (bidirektional)
├── agents/               # Definitionen für orchestrierende Agents
├── core/                 # Kern-Schema (manifest_schema.json)
├── docs/                 # Dokumentation und Diagramme
├── orchestrator/         # Discovery und Orchestrator-Logik
├── registry/             # Skill/Agent-Registry (SQLite-basiert)
└── skills/               # Definitionen für atomare Skills
    ├── native/           # Eigene, plattformunabhängige Skills
    └── imported/         # Importierte Skills von externen Plattformen
```

## Weiterführende Informationen

-   **`docs/NUTZUNGSANLEITUNG.md`**: Detaillierte Anleitung zur Integration in jede Plattform, zum Erstellen eigener Skills und zur Nutzung der bidirektionalen Fähigkeiten.
-   **`docs/architecture_v3.png`**: Visualisierung der finalen Systemarchitektur.
