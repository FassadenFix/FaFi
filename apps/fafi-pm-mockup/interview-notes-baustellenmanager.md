# Interview-Notizen: Baustellen-Manager (Frage 4)

## Kernerkenntnisse

### Teamstruktur
- Ein Team besteht aus 4 Personen: Teamleiter + Anwendungstechniker (2er-Team 1) + Projektleiter (Stellvertreter) + Anwendungstechniker (2er-Team 2)
- Teamleiter bekommt das Projekt zugewiesen
- Projekt besteht aus mehreren Baustellen (= Immobilien)
- Begriffe "Teamleiter" und "Projektleiter" sind aktuell missverständlich, nicht zu viel hineininterpretieren

### Ablauf Baustellen-Manager App

1. **Teamleiter-Chat** (optional, kann in App integriert sein)
2. **Vorher-Dokumentation** (PFLICHT vor Baustellenstart)
   - Als Wizard-Strecke (wie in PDF-Formularen vorgesehen)
   - Jede Immobilie/Baustelle innerhalb des Projektes einzeln vorher dokumentieren
   - Inkl. Foto-Upload gemäß Formular
   - Erst nach vollständiger Dokumentation kann Baustelle gestartet werden
3. **Täglicher Ablauf:**
   - Morgens: "Arbeitstag beginnen"
   - Abends: "Arbeitstag beenden"
4. **Beim Beenden des Arbeitstages:**
   - Logbuch-Ergebnisse auswählen (Vorkommnisse, Ereignisse – können mehrere sein)
   - Nur bei Vorkommnissen: Details beschreiben
   - Abschlussfrage: Wird Baustellenplanung zeitlich beibehalten? (Ja/Nein + ggf. Erklärung)
   - Diese Frage soll MORGENS UND ABENDS gestellt werden
5. **Bautagebuch-Eintrag (automatisch bei Abschlussmeldung):**
   - Welche Bereiche wurden heute erreicht?
   - Witterungsdaten mit 3 Zeitpunkten (9 Uhr, 13 Uhr, 17 Uhr – 4-Stunden-Rhythmus)

### Foto-Upload
- Gleicher S3-Mechanismus wie Objektaufnahme
- Kontextbezogene Benennung (Baustellenlogbuch_Unternehmen_Adresse_Datum_...)
- Frage nach Komprimierung noch offen
