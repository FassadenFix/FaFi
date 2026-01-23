# Nutzungsanleitung: Multi-Agent-Orchestrierungssystem

**Autor:** Manus AI
**Version:** 1.0
**Datum:** 23. Januar 2026

Dieses Dokument beschreibt, wie Sie das Multi-Agent-Orchestrierungssystem in Ihre verschiedenen KI-Arbeitsumgebungen integrieren und nutzen können. Das System wurde entwickelt, um eine zentrale, dynamisch erweiterbare Bibliothek von Skills und Agents bereitzustellen, auf die von Antigravity, Claude (Cowork/Code), Manus und ChatGPT Codex zugegriffen werden kann.

## Systemübersicht

Das System besteht aus mehreren Kernkomponenten, die zusammenarbeiten, um eine nahtlose Integration zu ermöglichen.

![Architektur-Diagramm](architecture.png)

| Komponente | Funktion | Speicherort |
| :--- | :--- | :--- |
| **Registry** | Indiziert und verwaltet alle Skills/Agents | `/registry/registry.py` |
| **Discovery** | Findet passende Skills für eine Aufgabe | `/orchestrator/discovery.py` |
| **Orchestrator** | Führt Skills aus und koordiniert Agents | `/orchestrator/orchestrator.py` |
| **Adapter** | Übersetzt Formate für jede Plattform | `/adapters/*.py` |
| **API-Server** | Zentraler REST-Endpunkt | `/adapters/api_server.py` |

## Schnellstart

### 1. API-Server starten

Der API-Server ist der zentrale Zugangspunkt für alle Plattformen. Er muss auf einem Server laufen, der von Ihren KI-Tools erreichbar ist.

```bash
# Navigieren Sie zum Projektverzeichnis
cd /pfad/zu/skill-agent-hub

# Starten Sie den Server
python3 adapters/api_server.py
```

Der Server läuft standardmäßig auf `http://localhost:5000`. Für den Produktionseinsatz sollten Sie einen WSGI-Server wie Gunicorn verwenden und den Dienst hinter einem Reverse-Proxy (z.B. Nginx) betreiben.

### 2. Verfügbare Skills und Agents abrufen

Sobald der Server läuft, können Sie die verfügbaren Fähigkeiten abfragen.

```bash
# Liste aller Skills und Agents
curl http://localhost:5000/api/v1/registry/list

# Katalog für eine spezifische Plattform (z.B. ChatGPT Codex)
curl http://localhost:5000/api/v1/catalog/chatgpt_codex
```

## Integration in die verschiedenen Plattformen

### Integration mit ChatGPT Codex (OpenAI)

Die Integration mit ChatGPT Codex erfolgt über das **Function Calling**-Feature. Der Adapter generiert automatisch die korrekten Tool-Definitionen.

1.  **Katalog abrufen:** Rufen Sie den Endpunkt `/api/v1/catalog/chatgpt_codex` auf, um die Tool-Definitionen im OpenAI-Format zu erhalten.
2.  **Tools konfigurieren:** Verwenden Sie die erhaltenen Tool-Definitionen im `tools`-Parameter Ihrer API-Anfragen an OpenAI.
3.  **Ausführung:** Wenn das Modell einen Tool-Aufruf generiert, senden Sie die Argumente an den entsprechenden `/api/v1/execute/skill/<name>`-Endpunkt des Hubs.

**Beispiel für die Konfiguration eines OpenAI Assistants:**

Der Endpunkt `/api/v1/instructions/chatgpt_codex` liefert einen vorbereiteten Text, der als Teil der System-Anweisungen für einen Assistant verwendet werden kann.

### Integration mit Claude (Cowork & Code)

Claude unterstützt ebenfalls Tool-Definitionen. Der `ClaudeAdapter` generiert das passende Format.

1.  **Katalog abrufen:** Nutzen Sie `/api/v1/catalog/claude`.
2.  **MCP-Server (optional):** Für eine tiefere Integration kann der Hub als MCP-Server (Model Context Protocol) konfiguriert werden. Die Datei `/adapters/claude_adapter.py` enthält eine Methode `generate_mcp_server_config()`, die die notwendige Konfiguration generiert.

### Integration mit Manus

Manus kann den Hub direkt über die REST-API nutzen.

1.  **Katalog abrufen:** Nutzen Sie `/api/v1/catalog/manus`.
2.  **Anweisungen generieren:** Der Endpunkt `/api/v1/instructions/manus` liefert einen Markdown-Text, der alle verfügbaren Skills und Agents beschreibt und als Erweiterung für den System-Prompt verwendet werden kann.

### Integration mit Antigravity

Antigravity verwendet ein eigenes Action- und Workflow-Format.

1.  **Katalog abrufen:** Nutzen Sie `/api/v1/catalog/antigravity`.
2.  **Manifest generieren:** Der `AntigravityAdapter` kann ein Paket-Manifest generieren, das in Antigravity importiert werden kann.

## Einen neuen Skill hinzufügen

Das Hinzufügen neuer Fähigkeiten ist der Kern der dynamischen Erweiterbarkeit des Systems.

### Schritt 1: Verzeichnis erstellen

Erstellen Sie ein neues Verzeichnis unter `/skills/` mit dem Namen Ihres Skills (in `snake_case`).

```bash
mkdir skills/mein_neuer_skill
```

### Schritt 2: `manifest.json` anlegen

Erstellen Sie eine `manifest.json`-Datei, die den Skill beschreibt. Diese Datei ist das Herzstück der Registrierung.

```json
{
  "manifest_version": "1.0",
  "type": "skill",
  "name": "mein_neuer_skill",
  "version": "1.0.0",
  "description": "Eine kurze Beschreibung dessen, was der Skill tut.",
  "author": "Ihr Name",
  "tags": ["kategorie1", "kategorie2"],
  "capabilities": ["fähigkeit1", "fähigkeit2"],
  "implementation": {
    "language": "python",
    "entrypoint": "main.py"
  },
  "interface": {
    "inputs": [
      {
        "name": "eingabe_parameter",
        "type": "string",
        "description": "Beschreibung des Parameters",
        "required": true
      }
    ],
    "outputs": [
      {
        "name": "ausgabe_parameter",
        "type": "string",
        "description": "Beschreibung der Ausgabe"
      }
    ]
  }
}
```

### Schritt 3: Implementierung erstellen

Erstellen Sie die `main.py`-Datei mit einer `execute`-Funktion.

```python
from typing import Dict, Any

def execute(eingabe_parameter: str) -> Dict[str, Any]:
    # Ihre Logik hier
    ergebnis = f"Verarbeitet: {eingabe_parameter}"
    return {
        "ausgabe_parameter": ergebnis
    }
```

### Schritt 4: Registry aktualisieren

Starten Sie den API-Server neu oder rufen Sie den Scan-Endpunkt auf.

```bash
curl -X POST http://localhost:5000/api/v1/registry/scan
```

Der neue Skill ist nun im gesamten System verfügbar und kann von allen Plattformen genutzt werden.

## Einen neuen Agent erstellen

Agents orchestrieren mehrere Skills, um komplexere Aufgaben zu erfüllen.

### Schritt 1: Verzeichnis erstellen

```bash
mkdir agents/mein_neuer_agent
```

### Schritt 2: `manifest.json` anlegen

Die Manifest-Datei für einen Agent enthält zusätzlich einen `orchestration`-Block.

```json
{
  "manifest_version": "1.0",
  "type": "agent",
  "name": "mein_neuer_agent",
  "version": "1.0.0",
  "description": "Beschreibung des Agents und seiner Aufgabe.",
  "author": "Ihr Name",
  "tags": ["orchestration"],
  "capabilities": ["komplexe_aufgabe"],
  "interface": {
    "inputs": [{ "name": "aufgabe", "type": "string", "required": true }],
    "outputs": [{ "name": "ergebnis", "type": "string" }]
  },
  "dependencies": [
    { "name": "skill_a", "version": "1.0.0" },
    { "name": "skill_b", "version": "1.0.0" }
  ],
  "orchestration": {
    "strategy": "sequential",
    "steps": [
      {
        "skill": "skill_a",
        "input_mapping": { "text": "$aufgabe" },
        "output_mapping": { "result": "$zwischenergebnis" }
      },
      {
        "skill": "skill_b",
        "input_mapping": { "data": "$zwischenergebnis" },
        "output_mapping": { "final": "$ergebnis" }
      }
    ]
  }
}
```

Die `strategy` kann `sequential`, `parallel`, `conditional` oder `dynamic` sein. Bei `dynamic` plant der Orchestrator die Schritte zur Laufzeit basierend auf der `goal_description`.

## API-Referenz

| Endpunkt | Methode | Beschreibung |
| :--- | :--- | :--- |
| `/api/v1/health` | GET | Health-Check |
| `/api/v1/info` | GET | Systeminformationen |
| `/api/v1/registry/scan` | POST | Scannt und registriert alle Skills/Agents |
| `/api/v1/registry/list` | GET | Listet alle Entities auf (optional `?type=skill` oder `?type=agent`) |
| `/api/v1/registry/get/<name>` | GET | Holt Details zu einer Entity |
| `/api/v1/discover` | POST | Sucht nach Skills (Body: `{"query": "..."}`) |
| `/api/v1/suggest-composition` | POST | Schlägt eine Skill-Komposition vor |
| `/api/v1/execute/skill/<name>` | POST | Führt einen Skill aus |
| `/api/v1/execute/agent/<name>` | POST | Führt einen Agent aus |
| `/api/v1/execute/task` | POST | Führt eine Aufgabe dynamisch aus |
| `/api/v1/catalog/<platform>` | GET | Gibt den Katalog für eine Plattform zurück |
| `/api/v1/instructions/<platform>` | GET | Gibt Integrationsanweisungen zurück |

## Fehlerbehebung

| Problem | Lösung |
| :--- | :--- |
| Skill wird nicht gefunden | Führen Sie `/api/v1/registry/scan` aus, um die Registry zu aktualisieren. |
| `execute`-Funktion nicht gefunden | Stellen Sie sicher, dass Ihre `main.py` eine Funktion namens `execute` oder `main` enthält. |
| Fehler bei der Ausführung | Prüfen Sie die Logs des API-Servers und den `execution_log` in der Antwort. |
| Plattform-Katalog ist leer | Stellen Sie sicher, dass Skills registriert sind und der richtige Plattformname verwendet wird. |
