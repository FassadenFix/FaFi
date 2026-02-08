# FassadenFix Konnektoren-Bibliothek

**Version:** 1.0.0
**Datum:** 2026-02-08
**Autor:** Manus AI

---

## Übersicht

Diese Bibliothek enthält eine Sammlung von Python API-Clients und MCP-Konfigurationen, um die zentralen Anwendungen der FassadenFix Systemlandschaft an Manus anzubinden. Ziel ist es, eine nahtlose Integration zu schaffen, die manuelle Arbeit reduziert, Prozesse automatisiert und eine zentrale Datenbasis für KI-gestützte Workflows ermöglicht.

Die Konnektoren wurden auf Basis einer umfassenden Analyse der Systemlandschaft entwickelt und decken die kritischsten Integrationslücken ab.

### Enthaltene Konnektoren

| Anwendung | Typ | Priorität | Status |
| :--- | :--- | :--- | :--- |
| **HERO Handwerkersoftware** | GraphQL API Client | **Hoch** | ✅ Fertiggestellt |
| **Google Ads** | MCP Server Config | **Hoch** | ✅ Fertiggestellt |
| **Sipgate VoIP** | REST API Client | Mittel | ✅ Fertiggestellt |
| **WhatsApp Business** | Cloud API Client | Mittel | ✅ Fertiggestellt |
| **Make.com** | MCP Server Config | Mittel | ✅ Fertiggestellt |
| **Ricoh360 Tours** | REST API Client | Niedrig | ✅ Fertiggestellt |

---

## Erste Schritte

### 1. Umgebungsvariablen konfigurieren

Kopieren Sie die Vorlage `.env.template` in diesem Verzeichnis zu einer neuen Datei namens `.env`:

```bash
cp .env.template .env
```

Öffnen Sie die `.env`-Datei und tragen Sie die erforderlichen API-Schlüssel und Zugangsdaten für jede Anwendung ein. Detaillierte Anweisungen zur Beschaffung der einzelnen Schlüssel finden Sie als Kommentare in der `.env.template`-Datei.

> **WICHTIG:** Die `.env`-Datei enthält sensible Zugangsdaten und darf **niemals** in ein Git-Repository eingecheckt werden. Sie ist bereits in der `.gitignore`-Datei des Projekts eingetragen.

### 2. Python-Abhängigkeiten installieren

Die erforderlichen Python-Pakete für die API-Clients wurden bereits installiert. Falls eine Neuinstallation notwendig ist, können Sie die Pakete wie folgt installieren:

```bash
sudo pip3 install gql aiohttp requests-toolbelt
```

### 3. API-Clients verwenden

Die Python-Clients können direkt in Ihren Skripten und Manus-Skills importiert und verwendet werden. Die Clients laden die Zugangsdaten automatisch aus der `.env`-Datei.

**Beispiel: HERO Software Client**

```python
import os
from dotenv import load_dotenv
from connectors.hero_software import get_hero_client

# .env-Datei laden
load_dotenv()

# HERO Client initialisieren (API-Key wird automatisch geladen)
hero_client = get_hero_client()

# Alle Kunden-Kontakte abrufen
contacts = hero_client.get_contacts(category="customer")

for contact in contacts:
    print(f"Kunde: {contact.company_name or contact.first_name + ' ' + contact.last_name}")
```

### 4. MCP-Server in Manus konfigurieren

Die Konnektoren für **Google Ads** und **Make.com** sind als MCP-Server konzipiert. Um diese in Manus zu nutzen, müssen sie in den MCP-Einstellungen Ihrer Manus-Instanz konfiguriert werden.

Die notwendigen Konfigurations-JSONs und Anleitungen finden Sie in den jeweiligen `mcp_setup.py`-Dateien der Konnektoren:

- `connectors/google_ads/mcp_setup.py`
- `connectors/make_com/mcp_setup.py`

---

## Detaillierte Dokumentation

Eine umfassende Analyse der Systemlandschaft, die Gap-Analyse und die detaillierte Integrations-Roadmap finden Sie im Dokument `Integrations-Roadmap.md`.
