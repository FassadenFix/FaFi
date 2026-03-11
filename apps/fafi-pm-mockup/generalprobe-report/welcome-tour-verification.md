# Welcome Tour – Visuelle Verifikation

## Einstellungen > System > Darstellung
- **"Tour starten" Button** ist sichtbar unter der Darstellungs-Sektion
- Label: "Einführungstour"
- Beschreibung: "Zeigt die Willkommens-Tour erneut an, die dir alle Bereiche erklärt"
- Button: "Tour starten" (outline variant)
- Funktionalität: Löscht localStorage-Keys und leitet auf Dashboard um

## Dashboard data-tour Attribute
- data-tour="dashboard-kpis" ✓
- data-tour="kanban-board" ✓
- data-tour="countdown-tasks" ✓
- data-tour="activity-log" ✓
- data-tour="quick-actions" ✓

## Sidebar data-tour Attribute
- Nav-Items: data-tour="nav-{label}" ✓
- Section-Headers: data-tour="section-{id}" ✓

## Welcome-Dialog Visuell Bestätigt
Der Welcome-Dialog erscheint korrekt auf dem Dashboard mit:
- Überschrift: "Hey, schön dass du da bist!"
- Beschreibung: "Das ist dein neues Werkzeug für alle Projekte..."
- 3 Feature-Highlights: Kurze Einführung, Schritt für Schritt, Jederzeit wiederholbar
- "Los geht's" Button + "Später" Link
- Semi-transparentes Overlay über dem Dashboard

## Tests
- 32 Tests in welcome-tour.test.ts ✓
- 834 Tests gesamt ✓
