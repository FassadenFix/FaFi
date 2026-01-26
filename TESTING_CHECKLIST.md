# ✅ FassadenFix PWA - Testing Checklist

## 🔧 Lokale Entwicklungsumgebung (Schritt 1)

### Setup-Test

- [ ] **Python Server starten**
  ```bash
  cd objekterfassung-pwa
  python3 -m http.server 8888
  ```
  - [ ] Server läuft auf `http://localhost:8888`
  - [ ] Keine Fehler beim Start

- [ ] **App im Browser öffnen**
  - [ ] Chrome: `http://localhost:8888`
  - [ ] Firefox: `http://localhost:8888`
  - [ ] Safari: `http://localhost:8888`

### Console-Check

- [ ] **Browser DevTools öffnen** (F12)
  - [ ] Keine kritischen Fehler (rote Meldungen) in Console
  - [ ] Service Worker registriert: `SW registered: ...`
  - [ ] Performance Monitor initialisiert: `[Performance] Monitor initialized`
  - [ ] Error Handler initialisiert: `[ErrorHandler] Initialized`
  - [ ] Alle Scripts geladen (keine 404-Fehler)

### Basis-Funktionalität

- [ ] **Immobilien-Liste**
  - [ ] "Neue Immobilie erstellen" Button sichtbar
  - [ ] FAB (+ Button) erscheint rechts unten
  - [ ] Standard-Immobilie "Immobilie #1" vorhanden

- [ ] **Neue Immobilie erstellen**
  - [ ] FAB klicken → Neue Immobilie erscheint
  - [ ] Immobilie hat Nummer #2
  - [ ] 4 Seiten-Cards vorhanden (Frontseite, Rückseite, Giebel links, Giebel rechts)

- [ ] **Stammdaten eingeben**
  - [ ] Adresse: Straße, Hausnummer, PLZ, Ort eingeben
  - [ ] Datum auswählen (Datum-Picker funktioniert)
  - [ ] FF-Mitarbeiter Dropdown wird angezeigt
  - [ ] GPS-Button sichtbar

---

## 📱 Mobile Responsiveness (Schritt 2)

### Chrome DevTools Mobile Emulation

- [ ] **DevTools öffnen** → Toggle Device Toolbar (Ctrl+Shift+M / Cmd+Shift+M)
- [ ] **iPhone 12 Pro** auswählen
- [ ] **Samsung Galaxy S21** auswählen
- [ ] **iPad** auswählen

### Touch-Targets

- [ ] **Buttons mindestens 48px hoch**
  - [ ] "Neue Immobilie erstellen" Button
  - [ ] FAB (Floating Action Button)
  - [ ] Seiten-Cards klickbar
  - [ ] Entscheidungs-Buttons (Ja/Nein/Offen)

- [ ] **Inputs gut bedienbar**
  - [ ] Text-Inputs mindestens 44px hoch
  - [ ] Dropdown-Menüs groß genug
  - [ ] Number-Inputs (Breite/Höhe) touch-friendly

### Layout

- [ ] **Kein horizontales Scrollen** bei Viewport-Breiten:
  - [ ] 320px (iPhone SE)
  - [ ] 375px (iPhone 12)
  - [ ] 414px (iPhone 12 Pro Max)
  - [ ] 768px (iPad)

- [ ] **Text lesbar**
  - [ ] Schriftgröße ≥ 16px für Body-Text
  - [ ] Kontrast ausreichend (kein graues auf grau)

---

## 🎨 UI/UX Tests (Schritt 3)

### Seiten-Erfassung Workflow

- [ ] **Seite öffnen** (z.B. Frontseite klicken)
  - [ ] Seiten-Detail-View öffnet sich
  - [ ] Header zeigt "Frontseite - Immobilie #1"
  - [ ] Zurück-Button funktioniert

- [ ] **Entscheidung: "Zur Reinigung"**
  - [ ] 3 Buttons: ✓ Ja | ✗ Nein | ○ Offen
  - [ ] Button-Klick ändert visuellen Status (Farbe)
  - [ ] "Ja" → Grün, "Nein" → Rot, "Offen" → Orange

- [ ] **Dimensionen eingeben**
  - [ ] Breite: 10 m
  - [ ] Höhe: 5 m
  - [ ] **Automatische Berechnung**: Fläche = 50 m²
  - [ ] Fläche wird sofort aktualisiert

- [ ] **Details (Akkordeon)**
  - [ ] Bühne: Auswahl zwischen "Keine", "Standard (390€)", "Sonder (Anfrage)"
  - [ ] Reinigungsprodukt: Checkbox für "Zusätzlich erforderlich"
  - [ ] Zugänglichkeit: Radio-Buttons für "Ungehindert" / "Eingeschränkt"
  - [ ] Schäden: Checkboxes für Graffiti, Löcher, Risse

- [ ] **Alle 4 Seiten durchgehen**
  - [ ] Frontseite: Entscheidung + Dimensionen
  - [ ] Rückseite: Entscheidung + Dimensionen
  - [ ] Linker Giebel: Entscheidung + Dimensionen
  - [ ] Rechter Giebel: Entscheidung + Dimensionen

### Validierung

- [ ] **Unvollständige Seite** (zuReinigen = null)
  - [ ] Button "Objekterfassung abschließen" disabled
  - [ ] Button zeigt: "⚠️ Noch X Seite(n) ohne Entscheidung"

- [ ] **Alle Seiten auf "Nein"**
  - [ ] Button disabled
  - [ ] Button zeigt: "⚠️ Mindestens 1 Seite zur Reinigung auswählen"

- [ ] **Mindestens 1 Seite "Ja"**
  - [ ] Button enabled
  - [ ] Button zeigt: "✓ Objekterfassung abschließen"

### Statistiken

- [ ] **Live-Update der Statistiken**
  - [ ] Anzahl Immobilien korrekt
  - [ ] Gesamtfläche (m²) wird live berechnet
  - [ ] Nach Änderung sofort aktualisiert

---

## 📸 Erweiterte Features (Schritt 4)

### Kamera-Integration

- [ ] **Foto-Button klicken** (in Seiten-Detail)
  - [ ] Browser fragt nach Kamera-Berechtigung
  - [ ] Kamera-Stream erscheint
  - [ ] Rückkamera wird bevorzugt (Mobile)

- [ ] **Foto aufnehmen**
  - [ ] Capture-Button funktioniert
  - [ ] Foto wird in Galerie angezeigt
  - [ ] Thumbnail sichtbar (200px max)
  - [ ] Foto klicken → Vollbild-Ansicht

- [ ] **Foto-Kompression**
  - [ ] DevTools → Network Tab → Foto-Upload
  - [ ] Dateigröße < 500 KB (bei 1920px Breite)
  - [ ] JPEG Quality ~85%

### GPS-Integration

- [ ] **GPS-Button klicken**
  - [ ] Browser fragt nach Standort-Berechtigung
  - [ ] Koordinaten werden angezeigt (z.B. 52.520008, 13.404954)
  - [ ] Genauigkeit angezeigt (< 20m = gut)
  - [ ] Koordinaten in `adresse.lat` und `adresse.lng` gespeichert

### Sprachnotizen (falls implementiert)

- [ ] **Audio-Record Button**
  - [ ] Mikrofon-Berechtigung wird angefragt
  - [ ] Aufnahme startet (Waveform-Visualisierung)
  - [ ] Stopp-Button funktioniert
  - [ ] Audio-Datei wird angezeigt
  - [ ] Abspielen funktioniert

---

## 💾 Offline-Funktionalität (Schritt 5)

### Service Worker

- [ ] **Application Tab** (Chrome DevTools)
  - [ ] Service Workers → Status: "Activated and is running"
  - [ ] Cache Storage → `fassadenfix-static-v1.2.1` vorhanden
  - [ ] Cache Storage → Alle wichtigen Dateien gecacht

### Offline-Modus aktivieren

- [ ] **DevTools → Network Tab**
  - [ ] "Offline" Checkbox aktivieren
  - [ ] **ODER**: Flugmodus aktivieren (Mobile)

### Offline-Tests

- [ ] **App neu laden** (F5)
  - [ ] App lädt trotz Offline
  - [ ] Keine "Keine Internetverbindung"-Fehler
  - [ ] Offline-Indicator erscheint: "⚠️ Offline-Modus"

- [ ] **Neue Immobilie erstellen** (offline)
  - [ ] Funktioniert ohne Internet
  - [ ] Daten werden in IndexedDB gespeichert

- [ ] **Fotos aufnehmen** (offline)
  - [ ] Kamera funktioniert
  - [ ] Fotos werden lokal gespeichert (IndexedDB)

- [ ] **Daten bearbeiten** (offline)
  - [ ] Dimensionen ändern
  - [ ] Entscheidungen ändern
  - [ ] Alle Änderungen werden gespeichert

### Sync nach Reconnect

- [ ] **Wieder online gehen**
  - [ ] Offline-Indicator verschwindet
  - [ ] Sync-Status: "Synchronisation läuft..."
  - [ ] Sync-Status: "✓ Synchronisiert" (nach Abschluss)

---

## 🔗 HubSpot-Integration (Schritt 6)

### Backend lokal starten

```bash
cd ../angebotsgenerator/backend
npm install
node server.js
```

- [ ] Server läuft auf `http://localhost:3001`
- [ ] Console zeigt: "Backend läuft auf Port 3001"

### API-Verbindung testen

- [ ] **Health Check**
  ```bash
  curl http://localhost:3001/api/health
  ```
  - [ ] Response: `{"status":"ok","hubspot":true}`

### PWA mit Backend verbinden

- [ ] **api.config.js prüfen**
  - [ ] `BASE_URL` zeigt auf `http://localhost:3001`
  - [ ] PWA neu laden

### Company-Suche

- [ ] **Immobilie öffnen** → Stammdaten
  - [ ] "Firma (HubSpot)" Sektion vorhanden
  - [ ] Suchfeld: "Firmenname eingeben..."

- [ ] **Suche nach Firma** (z.B. "GmbH")
  - [ ] Nach 300ms: Suche startet automatisch
  - [ ] Dropdown mit Ergebnissen erscheint
  - [ ] Firmen werden angezeigt (Name, Stadt, PLZ)

- [ ] **Firma auswählen**
  - [ ] Firma klicken
  - [ ] Adresse wird automatisch gefüllt (Auto-Fill)
  - [ ] "Ausgewählte Firma: XY GmbH" erscheint

### FF-Mitarbeiter Dropdown

- [ ] **Dropdown öffnen**
  - [ ] Zeigt "Lädt..." während Daten geladen werden
  - [ ] Liste von FF-Mitarbeitern erscheint
  - [ ] Mitarbeiter auswählbar

### Offline-Caching

- [ ] **Erste Suche** → Daten werden gecacht
- [ ] **DevTools → Application → IndexedDB**
  - [ ] `FassadenFixDB` → `hubspot_cache` Store
  - [ ] Einträge für Companies, Owners sichtbar

- [ ] **Offline gehen** (Flugmodus)
- [ ] **Zweite Suche** (gleicher Begriff)
  - [ ] Ergebnisse werden aus Cache geladen
  - [ ] Console: `[HubSpot] Cache hit: companies_search_gmbh`

---

## ⚡ Performance-Tests (Schritt 7)

### Lighthouse (Chrome)

```bash
npm install -g lighthouse
lighthouse http://localhost:8888 --view
```

**Erwartete Scores**:
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 90
- [ ] SEO: ≥ 80
- [ ] PWA: ≥ 90

### Core Web Vitals

- [ ] **LCP (Largest Contentful Paint)**: < 2.5s
  - [ ] Console: `[Performance] LCP: XXX ms`

- [ ] **FID (First Input Delay)**: < 100ms
  - [ ] Button-Klick reagiert sofort

- [ ] **CLS (Cumulative Layout Shift)**: < 0.1
  - [ ] Kein Layout-Shift beim Laden

### Manueller Performance-Test

- [ ] **Ladezeit**
  - [ ] App lädt in < 2 Sekunden (3G Throttling)
  - [ ] First Paint < 1.5s

- [ ] **Smooth Scrolling**
  - [ ] Keine Ruckler beim Scrollen
  - [ ] Animationen flüssig (60 FPS)

- [ ] **Memory-Leaks**
  - [ ] DevTools → Performance → Memory
  - [ ] App 5 Min. nutzen → Memory sollte nicht ständig steigen

---

## 🌐 Browser-Kompatibilität (Schritt 8)

### Desktop-Browser

- [ ] **Chrome** (neueste Version)
  - [ ] App lädt korrekt
  - [ ] Alle Features funktionieren
  - [ ] Service Worker aktiviert

- [ ] **Firefox** (neueste Version)
  - [ ] App lädt korrekt
  - [ ] Alle Features funktionieren
  - [ ] Service Worker aktiviert

- [ ] **Safari** (macOS)
  - [ ] App lädt korrekt
  - [ ] Kamera-Zugriff funktioniert
  - [ ] Service Worker aktiviert

- [ ] **Edge** (Chromium-basiert)
  - [ ] App lädt korrekt
  - [ ] Alle Features funktionieren

### Mobile Browser

- [ ] **iOS Safari** (iPhone)
  - [ ] PWA installierbar ("Zum Home-Bildschirm")
  - [ ] Kamera (Rückkamera) funktioniert
  - [ ] GPS funktioniert
  - [ ] Offline-Modus funktioniert
  - [ ] Touch-Gesten funktionieren

- [ ] **Chrome Android**
  - [ ] PWA installierbar ("App installieren")
  - [ ] Kamera funktioniert
  - [ ] GPS funktioniert
  - [ ] Offline-Modus funktioniert

---

## 🔒 Sicherheits-Tests (Schritt 9)

### CSP (Content Security Policy)

- [ ] **DevTools → Console**
  - [ ] Keine CSP-Verletzungen
  - [ ] Keine "unsafe-eval" Warnungen

### XSS-Protection

- [ ] **Eingabefeld-Test**
  - [ ] `<script>alert('XSS')</script>` in Textfeld eingeben
  - [ ] Kein Alert erscheint (Input escaped)

### HTTPS-Only

- [ ] **Production**: Nur HTTPS-URLs
  - [ ] Keine HTTP-Assets geladen
  - [ ] Mixed Content Warnings überprüfen

---

## 📤 Export-Funktionalität (Schritt 10)

### JSON-Export

- [ ] **"Exportieren" Button** (in Immobilien-Liste)
  - [ ] Button klicken
  - [ ] JSON-Download startet
  - [ ] Dateiname: `fassadenfix-immobilien-2026-01-26.json`

### JSON-Struktur validieren

- [ ] **JSON öffnen** (in Editor)
  - [ ] `version: "1.0"`
  - [ ] `source: "objekterfassung-pwa"`
  - [ ] `immobilien` Array vorhanden
  - [ ] Alle Immobilien enthalten:
    - [ ] `id`, `nummer`, `adresse`
    - [ ] `seiten` mit allen 4 Seiten
    - [ ] GPS-Koordinaten (`lat`, `lng`)
    - [ ] Fotos als Base64

### Import in Angebotsgenerator (falls implementiert)

- [ ] **Angebotsgenerator öffnen**
- [ ] **"Import" Button klicken**
- [ ] **JSON-Datei auswählen**
  - [ ] Import erfolgreich
  - [ ] Immobilien erscheinen in Liste
  - [ ] Positionen werden automatisch generiert
  - [ ] Fotos werden angezeigt

---

## ✅ Abschluss-Checkliste

### Vor Deployment

- [ ] Alle Tests bestanden (siehe oben)
- [ ] Keine kritischen Fehler in Console
- [ ] README.md aktualisiert
- [ ] DEPLOYMENT.md erstellt
- [ ] `.env.example` Datei vorhanden (Backend)
- [ ] `.gitignore` konfiguriert

### GitHub Pages Vorbereitung

- [ ] Git Repository initialisiert
- [ ] Alle Dateien commitet
- [ ] GitHub Actions Workflow vorhanden (`.github/workflows/deploy.yml`)

### Render Backend Vorbereitung

- [ ] `render.yaml` konfiguriert
- [ ] Environment Variables dokumentiert
- [ ] Health-Endpoint funktioniert (`/api/health`)
- [ ] CORS konfiguriert für GitHub Pages URL

---

## 🎉 Ready for Deployment!

Wenn alle Checkboxen ✅ sind, ist die App bereit für:
1. **GitHub Pages Deployment** (PWA Frontend)
2. **Render Deployment** (Backend API)

Siehe **DEPLOYMENT.md** für detaillierte Deployment-Anleitung.
