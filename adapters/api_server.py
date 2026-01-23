"""
Universal API Server
====================
REST API für den Zugriff auf den Skill & Agent Hub.
Ermöglicht plattformübergreifende Integration.
"""

from flask import Flask, request, jsonify
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from registry.registry import SkillAgentRegistry
from orchestrator.orchestrator import Orchestrator
from orchestrator.discovery import DiscoveryService
from adapters.claude_adapter import ClaudeAdapter, ClaudeCoworkAdapter, ClaudeCodeAdapter
from adapters.manus_adapter import ManusAdapter
from adapters.chatgpt_codex_adapter import ChatGPTCodexAdapter
from adapters.antigravity_adapter import AntigravityAdapter

app = Flask(__name__)

# Initialisiere Komponenten
base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
registry = SkillAgentRegistry(
    db_path=os.path.join(base_path, 'registry', 'registry.db'),
    base_path=base_path
)
orchestrator = Orchestrator(registry, base_path)
discovery = DiscoveryService(registry)

# Adapter-Instanzen
adapters = {
    'claude': ClaudeAdapter(),
    'claude_cowork': ClaudeCoworkAdapter(),
    'claude_code': ClaudeCodeAdapter(),
    'manus': ManusAdapter(),
    'chatgpt_codex': ChatGPTCodexAdapter(),
    'antigravity': AntigravityAdapter()
}


# ============== Registry Endpoints ==============

@app.route('/api/v1/registry/scan', methods=['POST'])
def scan_registry():
    """Scannt und registriert alle Skills und Agents."""
    count = registry.scan_and_register()
    return jsonify({
        'status': 'success',
        'registered_count': count
    })


@app.route('/api/v1/registry/list', methods=['GET'])
def list_entities():
    """Listet alle registrierten Entities auf."""
    entity_type = request.args.get('type')  # 'skill', 'agent', oder None für alle
    entities = registry.list_all(entity_type)
    return jsonify({
        'status': 'success',
        'count': len(entities),
        'entities': entities
    })


@app.route('/api/v1/registry/get/<name>', methods=['GET'])
def get_entity(name):
    """Holt eine spezifische Entity."""
    entity = registry.get_by_name(name)
    if entity:
        return jsonify({
            'status': 'success',
            'entity': entity
        })
    return jsonify({
        'status': 'error',
        'message': f"Entity '{name}' nicht gefunden"
    }), 404


# ============== Discovery Endpoints ==============

@app.route('/api/v1/discover', methods=['POST'])
def discover_skills():
    """Sucht nach passenden Skills basierend auf einer Beschreibung."""
    data = request.json or {}
    query = data.get('query', '')
    entity_type = data.get('type')
    limit = data.get('limit', 10)
    
    results = discovery.discover(
        task_description=query,
        entity_type=entity_type,
        limit=limit
    )
    
    return jsonify({
        'status': 'success',
        'count': len(results),
        'results': [{
            'entity': r.entity,
            'relevance_score': r.relevance_score,
            'match_reasons': r.match_reasons
        } for r in results]
    })


@app.route('/api/v1/suggest-composition', methods=['POST'])
def suggest_composition():
    """Schlägt eine Skill-Komposition für eine Aufgabe vor."""
    data = request.json or {}
    task = data.get('task', '')
    
    composition = discovery.suggest_composition(task)
    
    return jsonify({
        'status': 'success',
        'composition': composition
    })


# ============== Execution Endpoints ==============

@app.route('/api/v1/execute/skill/<name>', methods=['POST'])
def execute_skill(name):
    """Führt einen Skill aus."""
    inputs = request.json or {}
    
    try:
        result = orchestrator.execute_skill(name, inputs)
        return jsonify({
            'status': 'success',
            'result': result
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400


@app.route('/api/v1/execute/agent/<name>', methods=['POST'])
def execute_agent(name):
    """Führt einen Agent aus."""
    inputs = request.json or {}
    
    try:
        context = orchestrator.execute_agent(name, inputs)
        return jsonify({
            'status': context.status,
            'task_id': context.task_id,
            'outputs': context.outputs,
            'execution_log': context.execution_log
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400


@app.route('/api/v1/execute/task', methods=['POST'])
def execute_task():
    """Führt eine Aufgabe basierend auf natürlichsprachlicher Beschreibung aus."""
    data = request.json or {}
    task = data.get('task', '')
    inputs = data.get('inputs', {})
    
    try:
        context = orchestrator.execute_task(task, inputs)
        return jsonify({
            'status': context.status,
            'task_id': context.task_id,
            'outputs': context.outputs,
            'execution_log': context.execution_log
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400


# ============== Adapter Endpoints ==============

@app.route('/api/v1/catalog/<platform>', methods=['GET'])
def get_platform_catalog(platform):
    """Gibt den Katalog im plattform-spezifischen Format zurück."""
    if platform not in adapters:
        return jsonify({
            'status': 'error',
            'message': f"Unbekannte Plattform: {platform}",
            'available_platforms': list(adapters.keys())
        }), 400
    
    adapter = adapters[platform]
    catalog = adapter.get_catalog_for_platform()
    
    return jsonify({
        'status': 'success',
        'platform': platform,
        'catalog': json.loads(catalog)
    })


@app.route('/api/v1/instructions/<platform>', methods=['GET'])
def get_platform_instructions(platform):
    """Gibt Integrationsanweisungen für eine Plattform zurück."""
    if platform not in adapters:
        return jsonify({
            'status': 'error',
            'message': f"Unbekannte Plattform: {platform}"
        }), 400
    
    adapter = adapters[platform]
    instructions = adapter.generate_system_prompt_extension()
    
    return jsonify({
        'status': 'success',
        'platform': platform,
        'instructions': instructions
    })


@app.route('/api/v1/openapi-schema', methods=['GET'])
def get_openapi_schema():
    """Gibt das OpenAPI-Schema für GPT Actions zurück."""
    adapter = adapters['chatgpt_codex']
    schema = adapter.generate_gpt_action_schema()
    return jsonify(schema)


# ============== Health & Info ==============

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health-Check-Endpoint."""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    })


@app.route('/api/v1/info', methods=['GET'])
def get_info():
    """Gibt Informationen über den Hub zurück."""
    skills = registry.list_all('skill')
    agents = registry.list_all('agent')
    
    return jsonify({
        'name': 'Skill & Agent Hub',
        'version': '1.0.0',
        'statistics': {
            'total_skills': len(skills),
            'total_agents': len(agents)
        },
        'supported_platforms': list(adapters.keys()),
        'endpoints': {
            'registry': '/api/v1/registry/*',
            'discovery': '/api/v1/discover',
            'execution': '/api/v1/execute/*',
            'catalogs': '/api/v1/catalog/<platform>'
        }
    })


if __name__ == '__main__':
    # Scanne beim Start
    print("Scanne Skills und Agents...")
    count = registry.scan_and_register()
    print(f"Registriert: {count} Entities")
    
    # Starte Server
    app.run(host='0.0.0.0', port=5000, debug=True)
