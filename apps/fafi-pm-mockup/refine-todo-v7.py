#!/usr/bin/env python3
"""
Zweite Überarbeitung: Claude verfeinert und ergänzt die Todo-Liste
mit Fokus auf technische Vollständigkeit und fehlende Details.
"""

import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

with open("/home/ubuntu/fafi-pm-mockup/todo-v7-draft.md", "r") as f:
    draft = f.read()

with open("/home/ubuntu/fafi-pm-mockup/claude-todo-context.md", "r") as f:
    context = f.read()

prompt = f"""Du bist ein erfahrener Projektmanager und technischer Architekt. Überarbeite und verfeinere die folgende Todo-Liste für das FaFi PM Projekt.

## Kontext
{context}

## Aktueller Entwurf
{draft}

## Deine Aufgabe: Überarbeitung und Verfeinerung

Prüfe den Entwurf auf folgende Punkte und erstelle eine verbesserte Version:

### 1. Fehlende Aufgaben ergänzen
- Ist der **Witterungsdaten-Abruf** (Open-Meteo API, 3x täglich: 9/13/17 Uhr) im Baustellen-Manager enthalten?
- Ist die **Nachher-Dokumentation** (analog zur Vorher-Doku, nach Baustellenabschluss) enthalten?
- Ist die **Baustellen-Wizard DB-Integration** (aktuell speichert der Wizard nicht in die DB) enthalten?
- Sind die **Foto-Upload-Integrationen** für ALLE relevanten Stellen enthalten? (ObjektaufnahmeWizard, Vorher-Doku, Ereignismelder, Nachher-Doku, Abnahme)
- Ist die **E-Mail-Protokollierung im Aktivitätslog** mit allen Verknüpfungen (Projekt, Angebot, Auftrag, Unternehmen, Kontakt) enthalten?
- Fehlt die **Anbindung des BaustellenWizard an die DB** (aktuell nur Mock)?

### 2. Technische Abhängigkeiten prüfen
- Microsoft SSO MUSS vor Graph API E-Mail kommen
- Foto-Upload MUSS vor Vorher-Dokumentation kommen
- Vorher-Dokumentation MUSS vor Baustellen-Tagesablauf kommen
- HubSpot bidirektionaler Sync kann parallel zu Microsoft laufen

### 3. Realismus prüfen
- Sind die Zeitschätzungen realistisch?
- Gibt es versteckte Komplexität (z.B. Microsoft SSO erfordert Azure Admin-Zugang)?
- Sind die Abhängigkeiten korrekt dargestellt?

### 4. Formatierung verbessern
- Datum korrigieren auf 08. Februar 2026
- Klare Trennung zwischen "muss jetzt" und "kann später"
- Jeder Meilenstein mit konkretem Ziel und Abhängigkeiten
- Aufwandsschätzungen konsistent

### 5. Zusätzliche Aspekte
- Die bestehende Witterungs-API (Open-Meteo) ist bereits integriert – sie muss nur in den Baustellen-Tagesablauf eingebunden werden
- Der bestehende Foto-Upload-Mechanismus (BaustellenFotoUpload-Komponente) existiert bereits als UI, aber ohne echten S3-Upload
- Die bestehende E-Mail-Integration (Manus Notification API) muss durch Microsoft Graph ersetzt werden
- Das Kundenportal hat bereits eine Token-basierte Zugangsseite (/portal/:token) – diese muss überarbeitet werden

Schreibe die KOMPLETTE überarbeitete Todo-Liste als Markdown. Behalte die gute Struktur bei, aber ergänze und korrigiere wo nötig.
"""

import time

for attempt in range(3):
    try:
        print(f"Versuch {attempt+1}/3...")
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            timeout=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        break
    except Exception as e:
        print(f"Fehler: {e}")
        if attempt < 2:
            print("Warte 10s und versuche erneut...")
            time.sleep(10)
        else:
            raise

result = message.content[0].text

with open("/home/ubuntu/fafi-pm-mockup/todo-v7-refined.md", "w") as f:
    f.write(result)

print(f"✅ Todo v7 Refined erstellt ({len(result)} Zeichen)")
print(f"Token verwendet: {message.usage.input_tokens} input, {message.usage.output_tokens} output")
