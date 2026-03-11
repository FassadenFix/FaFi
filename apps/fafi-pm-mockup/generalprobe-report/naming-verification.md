# Naming System Verification

## Archiv-Seite (09.02.2026)

Die Archiv-Tabelle zeigt:
- **Dateiname-Spalte**: Zeigt den Originalnamen + displayName als Subtitle
  - "Objektaufnahme: objektaufnahme_test_001.jpg" mit "Objektaufnahme-Foto" als Subtitle
  - "Allgemein: allgemein_test_001.jpg" mit "Allgemein-Foto" als Subtitle
- **Verknüpfungen**: Zeigen noch "–" (Dash) bei einigen Einträgen
- **Quelle**: "Archiv-Dokument" Badge korrekt
- **Kategorie**: "foto" korrekt

## Beobachtung
Die displayName-Spalte zeigt den Originalnamen als Haupttext und den displayName als Subtitle.
Das ist korrekt implementiert - der Fallback auf den Originalnamen funktioniert.

Die 75 Dokumente sind alle vorhanden, Migration war erfolgreich.

## Angebote-Seite

Die Angebote-Tabelle zeigt korrekt:
- **Hauptzeile**: `2026_Kreiswohnungswerk-Roding-GmbH_Angebot_0001_v1`
- **Subtitle**: `FF-2026-0001` (technische Nummer als Referenz)
- Das Schema Jahr_Unternehmen_Kontext_Laufnummer_Version ist korrekt implementiert und sichtbar.
