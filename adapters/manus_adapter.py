"""
Manus Adapter
=============
Adapter für Manus 1.6 und höher.
Formatiert Skills und Agents für die Integration in Manus-Workflows.
"""

import json
from typing import Dict, List, Any
from adapters.base_adapter import BaseAdapter


class ManusAdapter(BaseAdapter):
    """
    Adapter für Manus.
    Generiert Definitionen im Manus-kompatiblen Format.
    """
    
    @property
    def platform_name(self) -> str:
        return "Manus"
    
    def format_skill_definition(self, skill: Dict) -> str:
        """
        Formatiert einen Skill für Manus.
        Manus verwendet ein Function-Calling-Format ähnlich OpenAI.
        """
        interface = skill.get('interface', {})
        
        # Baue Parameter-Schema
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
        
        function_def = {
            'name': skill['name'],
            'description': skill.get('description', ''),
            'parameters': {
                'type': 'object',
                'properties': properties,
                'required': required
            }
        }
        
        return json.dumps(function_def, indent=2, ensure_ascii=False)
    
    def format_agent_definition(self, agent: Dict) -> str:
        """
        Formatiert einen Agent für Manus.
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
        
        # Agent mit Orchestrierungs-Metadaten
        function_def = {
            'name': agent['name'],
            'description': f"[Orchestrierender Agent] {agent.get('description', '')}",
            'parameters': {
                'type': 'object',
                'properties': properties,
                'required': required
            },
            'metadata': {
                'type': 'agent',
                'capabilities': agent.get('capabilities', []),
                'dependencies': agent.get('dependencies', [])
            }
        }
        
        return json.dumps(function_def, indent=2, ensure_ascii=False)
    
    def _build_catalog(self, skills: List[str], agents: List[str]) -> str:
        """Baut den Manus-spezifischen Katalog."""
        all_functions = []
        
        for s in skills:
            func = json.loads(s)
            func['_type'] = 'skill'
            all_functions.append(func)
        
        for a in agents:
            func = json.loads(a)
            func['_type'] = 'agent'
            all_functions.append(func)
        
        catalog = {
            'version': '1.0',
            'platform': 'manus',
            'functions': all_functions
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
            'file': 'string'
        }
        return type_mapping.get(hub_type, 'string')
    
    def generate_manus_instructions(self) -> str:
        """
        Generiert Anweisungen für die Integration in Manus.
        """
        skills = self.get_all_skills()
        agents = self.get_all_agents()
        
        instructions = """
# Skill-Hub Integration für Manus

## Verfügbare Skills

Die folgenden Skills können direkt aufgerufen werden:

"""
        for skill in skills:
            instructions += f"### {skill['name']}\n"
            instructions += f"{skill.get('description', 'Keine Beschreibung')}\n\n"
            
            interface = skill.get('interface', {})
            if interface.get('inputs'):
                instructions += "**Inputs:**\n"
                for inp in interface['inputs']:
                    req = "(erforderlich)" if inp.get('required', True) else "(optional)"
                    instructions += f"- `{inp['name']}` ({inp['type']}): {inp.get('description', '')} {req}\n"
            
            if interface.get('outputs'):
                instructions += "\n**Outputs:**\n"
                for out in interface['outputs']:
                    instructions += f"- `{out['name']}` ({out['type']}): {out.get('description', '')}\n"
            
            instructions += "\n---\n\n"
        
        instructions += """
## Verfügbare Agents

Die folgenden Agents orchestrieren mehrere Skills:

"""
        for agent in agents:
            instructions += f"### {agent['name']}\n"
            instructions += f"{agent.get('description', 'Keine Beschreibung')}\n\n"
            instructions += "---\n\n"
        
        instructions += """
## Verwendung

Um einen Skill oder Agent zu nutzen:

1. **Direkter Aufruf**: Rufe die entsprechende Funktion mit den benötigten Parametern auf
2. **Discovery**: Beschreibe die Aufgabe, und das System findet passende Skills
3. **Orchestrierung**: Nutze einen Agent für komplexe, mehrstufige Aufgaben

## Erweiterung

Neue Skills können durch Hinzufügen einer `manifest.json` im `skills/`-Verzeichnis registriert werden.
"""
        
        return instructions
    
    def generate_scheduled_task_template(self, skill_name: str) -> Dict:
        """
        Generiert eine Vorlage für geplante Aufgaben in Manus.
        """
        skill = self.registry.get_by_name(skill_name)
        if not skill:
            return {}
        
        return {
            'name': f"Scheduled: {skill_name}",
            'type': 'interval',
            'interval': 3600,  # Stündlich als Standard
            'repeat': True,
            'prompt': f"Führe den Skill '{skill_name}' aus dem Skill-Hub aus.",
            'playbook': f"1. Lade Skill-Definition für {skill_name}\n2. Bereite Inputs vor\n3. Führe Skill aus\n4. Verarbeite Outputs"
        }
