#!/usr/bin/env python3
"""Generiert einen umfassenden Analysebericht des FaFi PM mit Claude."""

import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# Lade die Analyse-Erkenntnisse
with open("/home/ubuntu/fafi-pm-mockup/analyse-erkenntnisse.md", "r") as f:
    erkenntnisse = f.read()

prompt = f"""Du bist ein erfahrener Software-Architekt und UX-Berater, der ein Projektmanagement-Tool für ein Fassadenreinigungs-Unternehmen (FassadenFix) analysiert. Das Tool heißt "FaFi PM" und soll den gesamten Geschäftsprozess abbilden:

Objektaufnahme → Angebotserstellung → Angebotsversand → Nachfassen → Auftragsannahme → Planung → Vorbereitung → Durchführung → Abnahme → Rechnungslegung → Garantie

Die Zielgruppe sind Handwerker und Praktiker (männlich, 25-50 Jahre), keine Akademiker. Die Sprache muss klar, direkt und intuitiv sein.

Hier sind meine detaillierten Analyse-Erkenntnisse aus der Code-Review:

{erkenntnisse}

Erstelle einen umfassenden Analysebericht auf Deutsch mit folgender Struktur:

## 1. Gesamtbewertung
Eine ehrliche Einschätzung des aktuellen Stands. Was funktioniert gut, was ist kritisch?

## 2. Workflow-Brüche und Inkonsistenzen
Gehe den gesamten Prozess von Objektaufnahme bis Garantie durch und identifiziere jeden Bruch in der Logik. Erkläre warum das ein Problem ist und wie es den Nutzer betrifft.

## 3. Benutzerführung – Wo verliert sich der Nutzer?
Analysiere die Navigation und den Workflow aus Sicht eines AT-Leiters, eines Kundenberaters und der Geschäftsführung. Wo muss der Nutzer selbst wissen was als nächstes kommt? Wo fehlt die Führung?

## 4. Die 10 kritischsten Verbesserungsvorschläge
Priorisiert nach Impact. Für jeden Vorschlag: Was ist das Problem, was ist die Lösung, welchen Effekt hat es.

## 5. Fehlende Kernfunktionen
Was fehlt komplett, um den Geschäftsprozess abzubilden?

## 6. Empfohlene Umsetzungsreihenfolge
In welcher Reihenfolge sollten die Verbesserungen umgesetzt werden? Was hat die höchste Priorität?

Schreibe den Bericht professionell aber verständlich. Verwende Tabellen wo sinnvoll. Sei ehrlich und konkret – keine allgemeinen Floskeln. Der Bericht richtet sich an den Geschäftsführer von FassadenFix.
"""

print("Sende Anfrage an Claude...")
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=8000,
    messages=[{"role": "user", "content": prompt}]
)

result = response.content[0].text

with open("/home/ubuntu/fafi-pm-mockup/fafi-pm-analyse-bericht.md", "w") as f:
    f.write(f"# FaFi PM – Umfassende Analyse und Verbesserungsvorschläge\n\n")
    f.write(f"*Erstellt am 08.02.2026 auf Basis einer vollständigen Code-Review*\n\n---\n\n")
    f.write(result)

print("Bericht erfolgreich erstellt: fafi-pm-analyse-bericht.md")
print(f"Tokens: {response.usage.input_tokens} input, {response.usage.output_tokens} output")
