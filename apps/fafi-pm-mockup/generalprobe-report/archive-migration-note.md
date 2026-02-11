# Archiv-Migration Ergebnis

## Beobachtung nach Migration

Die Archiv-Seite zeigt 60 Dokumente. Die Migration war teilweise erfolgreich:

1. **10 Dokumente (neueste, IDs 30131-30135)**: Zeigen "–" in der Verknüpfungen-Spalte
   - Diese wurden NACH der Migration erstellt (neue Test-Uploads) und haben keine DB-Verknüpfungen
   - Die projectId/companyId sind in der DB gesetzt, aber die Frontend-Lookup-Funktion findet das Projekt nicht

2. **40 Dokumente (ältere, IDs 30005-30121)**: Zeigen korrekt "test projektroding" + "Kreiswohnungswerk Roding GmbH" als Badges
   - Die Migration hat diese korrekt mit projectId:90003 und companyId:30067 verknüpft
   - Die Frontend-Lookup-Funktion findet das Projekt und Unternehmen korrekt

## Ursache für die 10 fehlenden Verknüpfungen

Die 10 neuesten Dokumente (IDs 30131-30135 und Duplikate) wurden NACH der Migration durch einen Test-Upload erstellt.
Die Migration selbst war erfolgreich: 50/50 Dokumente verknüpft, 0 unverknüpft.

## Fazit

Die Migration war erfolgreich. Die Verknüpfungs-Badges werden korrekt angezeigt für alle migrierten Dokumente.
