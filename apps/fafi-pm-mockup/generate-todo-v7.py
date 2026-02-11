#!/usr/bin/env python3
"""
Generiert eine neue, umfassende Todo-Liste für FaFi PM v7.0
basierend auf allen Interview-Erkenntnissen, überarbeitet durch Claude.
"""

import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# Lade den Kontext
with open("/home/ubuntu/fafi-pm-mockup/claude-todo-context.md", "r") as f:
    context = f.read()

# Lade die alte Todo
with open("/home/ubuntu/fafi-pm-mockup/todo.md", "r") as f:
    old_todo = f.read()

prompt = f"""Du bist ein erfahrener Projektmanager und technischer Architekt. Erstelle eine neue, umfassende Todo-Liste für das FaFi PM Projekt (FassadenFix Projektmanager).

## Kontext
{context}

## Bisherige Todo-Liste (Auszug der offenen Punkte)
Die erledigten Punkte aus der alten Todo sind im Kontext bereits zusammengefasst. Hier die noch offenen:

### Offene Punkte aus v4.4-v6.2:
- HubSpot bidirektionaler Sync (FaFi → HubSpot)
- E-Mail-Versand über Microsoft Graph API
- Foto-Upload nach S3
- Baustellen-Wizard DB-Integration
- PDF-Generatoren (Rechnungen, Garantien)
- Code-Audit & Bereinigung
- Responsive UI-Optimierung
- E2E-Tests

## Deine Aufgabe

Erstelle eine NEUE, sauber strukturierte Todo-Liste (todo-v7.md) die:

1. **Alle erledigten Punkte als Archiv-Zusammenfassung** am Ende enthält (kompakt, nicht einzeln aufgelistet)
2. **Alle offenen Aufgaben** klar priorisiert nach Dringlichkeit und Abhängigkeiten
3. **Alle neuen Anforderungen aus dem Interview** (Fragen 1-6) als konkrete, umsetzbare Aufgaben
4. **Klare Phasen/Meilensteine** definiert (v7.0, v7.1, v7.2 etc.)
5. **Technische Abhängigkeiten** berücksichtigt (z.B. Microsoft SSO muss vor Graph API E-Mail kommen)
6. **Realistische Schätzungen** für den Aufwand gibt

### Struktur-Vorgaben:
- Verwende Markdown mit Checkboxen [ ] für offene und [x] für erledigte Aufgaben
- Gruppiere nach Meilensteinen/Versionen
- Jeder Meilenstein hat ein klares Ziel
- Priorisierung: 🔴 Kritisch (blockiert andere), 🟡 Wichtig (nächster Schritt), 🟢 Nice-to-have
- Schätzungen in Stunden oder Tagen

### Inhaltliche Vorgaben:
- Der Baustellen-Manager muss komplett überarbeitet werden (neues Verständnis aus Interview)
- Das Kundenportal braucht Ampel-System statt Fortschrittsbalken
- Microsoft 365 SSO ist Voraussetzung für E-Mail-Versand
- Foto-Upload ist Voraussetzung für Vorher-Dokumentation im Baustellen-Manager
- HubSpot bidirektionaler Sync muss die Deal-Updates bei Statusänderungen enthalten
- Feingranulare Berechtigungen kommen NICHT in diese Phase (nur Sidebar-Sichtbarkeit)

Schreibe die komplette Todo-Liste als Markdown. Sei präzise und konkret bei den Aufgaben – keine vagen Beschreibungen, sondern technisch umsetzbare Schritte.
"""

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=8000,
    messages=[
        {"role": "user", "content": prompt}
    ]
)

result = message.content[0].text

with open("/home/ubuntu/fafi-pm-mockup/todo-v7-draft.md", "w") as f:
    f.write(result)

print(f"✅ Todo v7 Draft erstellt ({len(result)} Zeichen)")
print(f"Token verwendet: {message.usage.input_tokens} input, {message.usage.output_tokens} output")
