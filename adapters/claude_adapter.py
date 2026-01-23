"""
Claude Adapter
==============
Adapter für Claude-basierte Plattformen (Claude Cowork, Claude Code).
Formatiert Skills und Agents als Tool-Definitionen im Anthropic-Format.
"""

import json
from typing import Dict, List, Any
from adapters.base_adapter import BaseAdapter


class ClaudeAdapter(BaseAdapter):
    """
    Adapter für Claude (Cowork und Code).
    Generiert Tool-Definitionen im Anthropic-kompatiblen Format.
    """
    
    @property
    def platform_name(self) -> str:
        return "Claude"
    
    def format_skill_definition(self, skill: Dict) -> str:
        """
        Formatiert einen Skill als Claude Tool-Definition.
        
        Claude verwendet ein JSON-Schema-basiertes Format für Tools.
        """
        interface = skill.get('interface', {})
        
        # Baue Input-Schema
        properties = {}
        required = []
        
        for inp in interface.get('inputs', []):
            prop = {
                'type': self._map_type(inp['type']),
                'description': inp.get('description', '')
            }
            if 'default' in inp:
                prop['default'] = inp['default']
            if 'enum' in inp:
                prop['enum'] = inp['enum']
            
            properties[inp['name']] = prop
            
            if inp.get('required', True):
                required.append(inp['name'])
        
        tool_definition = {
            'name': f"skill_{skill['name']}",
            'description': skill.get('description', ''),
            'input_schema': {
                'type': 'object',
                'properties': properties,
                'required': required
            }
        }
        
        return json.dumps(tool_definition, indent=2, ensure_ascii=False)
    
    def format_agent_definition(self, agent: Dict) -> str:
        """
        Formatiert einen Agent als Claude Tool-Definition.
        Agents werden als komplexere Tools mit Orchestrierungsfähigkeit dargestellt.
        """
        interface = agent.get('interface', {})
        
        properties = {}
        required = []
        
        for inp in interface.get('inputs', []):
            properties[inp['name']] = {
                'type': self._map_type(inp['type']),
                'description': inp.get('description', '')
            }
            if inp.get('required', True):
                required.append(inp['name'])
        
        # Füge spezielle Agent-Eigenschaften hinzu
        tool_definition = {
            'name': f"agent_{agent['name']}",
            'description': f"[AGENT] {agent.get('description', '')} - Orchestriert mehrere Skills zur Aufgabenerfüllung.",
            'input_schema': {
                'type': 'object',
                'properties': properties,
                'required': required
            }
        }
        
        return json.dumps(tool_definition, indent=2, ensure_ascii=False)
    
    def _build_catalog(self, skills: List[str], agents: List[str]) -> str:
        """Baut den Claude-spezifischen Katalog."""
        all_tools = skills + agents
        
        catalog = {
            'tools': [json.loads(t) for t in all_tools]
        }
        
        return json.dumps(catalog, indent=2, ensure_ascii=False)
    
    def _map_type(self, hub_type: str) -> str:
        """Mappt Hub-Typen auf JSON-Schema-Typen."""
        type_mapping = {
            'string': 'string',
            'number': 'number',
            'boolean': 'boolean',
            'array': 'array',
            'object': 'object',
            'file': 'string'  # Dateipfade als Strings
        }
        return type_mapping.get(hub_type, 'string')
    
    def generate_mcp_server_config(self) -> Dict:
        """
        Generiert eine MCP-Server-Konfiguration für Claude.
        Ermöglicht die Integration als Model Context Protocol Server.
        """
        return {
            'name': 'skill-agent-hub',
            'version': '1.0.0',
            'description': 'Zentraler Skill und Agent Hub für Multi-Plattform-Orchestrierung',
            'tools': self._get_mcp_tools(),
            'resources': self._get_mcp_resources()
        }
    
    def _get_mcp_tools(self) -> List[Dict]:
        """Generiert MCP-Tool-Definitionen."""
        tools = []
        
        # Discovery-Tool
        tools.append({
            'name': 'hub_discover',
            'description': 'Sucht nach passenden Skills und Agents basierend auf einer Aufgabenbeschreibung',
            'inputSchema': {
                'type': 'object',
                'properties': {
                    'query': {
                        'type': 'string',
                        'description': 'Natürlichsprachliche Beschreibung der gesuchten Fähigkeit'
                    },
                    'type': {
                        'type': 'string',
                        'enum': ['skill', 'agent', 'all'],
                        'description': 'Art der gesuchten Einheit'
                    }
                },
                'required': ['query']
            }
        })
        
        # Execute-Tool
        tools.append({
            'name': 'hub_execute',
            'description': 'Führt einen Skill oder Agent aus dem Hub aus',
            'inputSchema': {
                'type': 'object',
                'properties': {
                    'name': {
                        'type': 'string',
                        'description': 'Name des Skills oder Agents'
                    },
                    'inputs': {
                        'type': 'object',
                        'description': 'Input-Parameter für die Ausführung'
                    }
                },
                'required': ['name']
            }
        })
        
        # List-Tool
        tools.append({
            'name': 'hub_list',
            'description': 'Listet alle verfügbaren Skills und Agents auf',
            'inputSchema': {
                'type': 'object',
                'properties': {
                    'type': {
                        'type': 'string',
                        'enum': ['skill', 'agent', 'all'],
                        'description': 'Filterung nach Typ'
                    }
                }
            }
        })
        
        return tools
    
    def _get_mcp_resources(self) -> List[Dict]:
        """Generiert MCP-Resource-Definitionen."""
        return [
            {
                'uri': 'hub://catalog',
                'name': 'Skill & Agent Katalog',
                'description': 'Vollständiger Katalog aller verfügbaren Skills und Agents',
                'mimeType': 'application/json'
            },
            {
                'uri': 'hub://schema',
                'name': 'Manifest Schema',
                'description': 'JSON-Schema für Skill/Agent-Manifeste',
                'mimeType': 'application/json'
            }
        ]


class ClaudeCoworkAdapter(ClaudeAdapter):
    """Spezialisierter Adapter für Claude Cowork."""
    
    @property
    def platform_name(self) -> str:
        return "Claude Cowork"
    
    def generate_workspace_integration(self) -> str:
        """
        Generiert Integrationsanweisungen für Claude Cowork Workspaces.
        """
        return """
# Claude Cowork Integration

## Setup

1. Füge den Skill-Hub als MCP-Server hinzu:
   ```json
   {
     "mcpServers": {
       "skill-hub": {
         "command": "python",
         "args": ["/path/to/skill-agent-hub/adapters/mcp_server.py"]
       }
     }
   }
   ```

2. Die Skills und Agents sind dann über die MCP-Tools verfügbar:
   - `hub_discover`: Finde passende Skills
   - `hub_execute`: Führe Skills aus
   - `hub_list`: Liste alle verfügbaren Skills

## Verwendung in Projekten

Referenziere Skills in deinen Projekt-Anweisungen:
```
Nutze den Skill 'text_summarizer' aus dem Hub, um lange Texte zusammenzufassen.
```
"""


class ClaudeCodeAdapter(ClaudeAdapter):
    """Spezialisierter Adapter für Claude Code (CLI/IDE)."""
    
    @property
    def platform_name(self) -> str:
        return "Claude Code"
    
    def generate_slash_commands(self) -> List[Dict]:
        """
        Generiert Slash-Command-Definitionen für Claude Code.
        """
        commands = []
        
        for skill in self.get_all_skills():
            commands.append({
                'command': f"/skill-{skill['name']}",
                'description': skill.get('description', ''),
                'usage': f"/skill-{skill['name']} <inputs>"
            })
        
        for agent in self.get_all_agents():
            commands.append({
                'command': f"/agent-{agent['name']}",
                'description': f"[Agent] {agent.get('description', '')}",
                'usage': f"/agent-{agent['name']} <inputs>"
            })
        
        return commands
