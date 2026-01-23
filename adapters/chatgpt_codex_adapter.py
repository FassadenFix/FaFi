"""
ChatGPT Codex Adapter
=====================
Adapter für ChatGPT Codex (OpenAI).
Formatiert Skills und Agents im OpenAI Function Calling Format.
"""

import json
from typing import Dict, List, Any
from adapters.base_adapter import BaseAdapter


class ChatGPTCodexAdapter(BaseAdapter):
    """
    Adapter für ChatGPT Codex.
    Generiert Definitionen im OpenAI Function Calling Format.
    """
    
    @property
    def platform_name(self) -> str:
        return "ChatGPT Codex"
    
    def format_skill_definition(self, skill: Dict) -> str:
        """
        Formatiert einen Skill im OpenAI Function Calling Format.
        """
        interface = skill.get('interface', {})
        
        # Baue Parameter-Schema nach OpenAI-Spezifikation
        properties = {}
        required = []
        
        for inp in interface.get('inputs', []):
            prop = {
                'type': self._map_type(inp['type']),
                'description': inp.get('description', '')
            }
            
            if inp['type'] == 'array':
                prop['items'] = {'type': 'string'}  # Default
            
            if 'enum' in inp:
                prop['enum'] = inp['enum']
            
            properties[inp['name']] = prop
            
            if inp.get('required', True):
                required.append(inp['name'])
        
        # OpenAI Function Format
        function_def = {
            'type': 'function',
            'function': {
                'name': skill['name'],
                'description': skill.get('description', ''),
                'parameters': {
                    'type': 'object',
                    'properties': properties,
                    'required': required,
                    'additionalProperties': False
                }
            }
        }
        
        return json.dumps(function_def, indent=2, ensure_ascii=False)
    
    def format_agent_definition(self, agent: Dict) -> str:
        """
        Formatiert einen Agent im OpenAI Function Calling Format.
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
        
        function_def = {
            'type': 'function',
            'function': {
                'name': f"agent_{agent['name']}",
                'description': f"[Multi-Step Agent] {agent.get('description', '')}",
                'parameters': {
                    'type': 'object',
                    'properties': properties,
                    'required': required,
                    'additionalProperties': False
                }
            }
        }
        
        return json.dumps(function_def, indent=2, ensure_ascii=False)
    
    def _build_catalog(self, skills: List[str], agents: List[str]) -> str:
        """Baut den OpenAI-kompatiblen Katalog."""
        tools = []
        
        for s in skills:
            tools.append(json.loads(s))
        
        for a in agents:
            tools.append(json.loads(a))
        
        return json.dumps({'tools': tools}, indent=2, ensure_ascii=False)
    
    def _map_type(self, hub_type: str) -> str:
        """Mappt Hub-Typen auf JSON-Schema-Typen für OpenAI."""
        type_mapping = {
            'string': 'string',
            'number': 'number',
            'boolean': 'boolean',
            'array': 'array',
            'object': 'object',
            'file': 'string'
        }
        return type_mapping.get(hub_type, 'string')
    
    def generate_openai_tools_array(self) -> List[Dict]:
        """
        Generiert ein Array von Tools für die OpenAI API.
        Kann direkt im `tools`-Parameter verwendet werden.
        """
        tools = []
        
        for skill in self.get_all_skills():
            tools.append(json.loads(self.format_skill_definition(skill)))
        
        for agent in self.get_all_agents():
            tools.append(json.loads(self.format_agent_definition(agent)))
        
        return tools
    
    def generate_assistant_instructions(self) -> str:
        """
        Generiert Anweisungen für einen OpenAI Assistant.
        """
        skills = self.get_all_skills()
        agents = self.get_all_agents()
        
        instructions = """
You have access to a Skill & Agent Hub that provides reusable capabilities.

## Available Skills

"""
        for skill in skills:
            instructions += f"- **{skill['name']}**: {skill.get('description', '')}\n"
        
        instructions += """

## Available Agents

"""
        for agent in agents:
            instructions += f"- **{agent['name']}**: {agent.get('description', '')}\n"
        
        instructions += """

## Usage Guidelines

1. When a task matches a skill's capability, use that skill
2. For complex multi-step tasks, consider using an agent
3. Skills can be chained - output from one can be input to another
4. If unsure which skill to use, describe the task and I'll help select

## Extending the Hub

New skills can be added by creating a manifest.json in the skills directory.
The hub automatically discovers and registers new capabilities.
"""
        
        return instructions
    
    def generate_gpt_action_schema(self) -> Dict:
        """
        Generiert ein Schema für GPT Actions (Custom GPTs).
        """
        paths = {}
        
        # Skill-Endpunkte
        for skill in self.get_all_skills():
            interface = skill.get('interface', {})
            
            request_body = {
                'type': 'object',
                'properties': {},
                'required': []
            }
            
            for inp in interface.get('inputs', []):
                request_body['properties'][inp['name']] = {
                    'type': self._map_type(inp['type']),
                    'description': inp.get('description', '')
                }
                if inp.get('required', True):
                    request_body['required'].append(inp['name'])
            
            paths[f"/skills/{skill['name']}/execute"] = {
                'post': {
                    'operationId': f"execute_{skill['name']}",
                    'summary': skill.get('description', ''),
                    'requestBody': {
                        'required': True,
                        'content': {
                            'application/json': {
                                'schema': request_body
                            }
                        }
                    },
                    'responses': {
                        '200': {
                            'description': 'Successful execution',
                            'content': {
                                'application/json': {
                                    'schema': {'type': 'object'}
                                }
                            }
                        }
                    }
                }
            }
        
        return {
            'openapi': '3.1.0',
            'info': {
                'title': 'Skill & Agent Hub API',
                'version': '1.0.0',
                'description': 'API für den Zugriff auf den zentralen Skill & Agent Hub'
            },
            'servers': [
                {'url': 'https://skill-hub.example.com/api/v1'}
            ],
            'paths': paths
        }
