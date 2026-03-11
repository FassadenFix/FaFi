# Loom Feedback Änderungen - TODO

## Status: In Bearbeitung

---

## Änderungen

### 1. Baustellen-Übersicht umstellen
- [ ] Listenformat wie Projekte (Auflistung → Details erst bei Klick)
- [ ] Filterung nach Phase/Status hinzufügen
- **Datei:** `client/src/pages/Baustellen.tsx`

### 2. Immobilien-Übersicht umstellen  
- [ ] Von Objektaufnahme-Format zu Listenformat ändern
- [ ] Zuordnungsinformationen anzeigen:
  - Baustelle
  - Projekt
  - Unternehmen/Kontakt
  - Zuständiger Mitarbeiter
- **Datei:** `client/src/pages/Immobilien.tsx`

### 3. Felder entfernen
- [x] "Sockel" aus SEITEN_CONFIG entfernen
- [x] "Dach/Attika" aus SEITEN_CONFIG entfernen
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

### 4. Seitenbezeichnungen ändern
- [x] Nordseite → Frontseite
- [x] Ostseite → Rechter Giebel
- [x] Südseite → Rückseite
- [x] Westseite → Linker Giebel
- [x] Erklärungstext hinzufügen
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

### 5. "Zu reinigen" → "Reinigungsfähig"
- [x] Label ändern
- [x] Bei "Nein" Erklärfeld öffnen
- [x] Fläche trotzdem erfassen
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

### 6. Fotos/Videos/360° vereinfachen
- [x] Link-Button für 360° entfernen
- [x] Nur Foto-Upload und Video-Upload Buttons
- [x] Darunter optionales Textfeld für 360°-Link
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

### 7. "Zustand und Schäden" entfernen
- [x] Kompletten Bereich entfernen (aus Inspektionsthematik)
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

### 8. Zuwegung vereinfachen
- [x] Nur Ja/Nein-Frage: "Problematische Zuwegung?"
- [x] Bei "Ja" Erklärfeld öffnen
- **Datei:** `client/src/components/ObjektaufnahmeWizard.tsx`

---

## Hinweise

**Frontseite:** Immer die Seite wo die Hauseingänge sind
**Rückseite:** Die gegenüberliegende Seite der Eingänge
**Linker Giebel:** Perspektive vor dem Haus stehend, auf die Eingänge schauend - links
**Rechter Giebel:** Perspektive vor dem Haus stehend, auf die Eingänge schauend - rechts
