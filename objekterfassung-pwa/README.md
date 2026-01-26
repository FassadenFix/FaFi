# FassadenFix Objekterfassung PWA

Mobile-First Progressive Web App zur Erfassung von Immobilien und Objekten vor Ort.

## 🎉 Status: Production-Ready (Phase 1-6 abgeschlossen)

## Übersicht

Diese PWA ermöglicht die mobile Erfassung von Immobilien für Fassadenreinigung mit:

- 📱 **Mobile-First Design** - Optimiert für Smartphone/Tablet mit Touch-Bedienung
- 📷 **Foto-Erfassung** - Kamera-Integration mit JPEG-Kompression (85%) & Thumbnails
- ✏️ **Foto-Annotation** - Canvas-basiertes Markup-Tool (Stift, Pfeile, Text, Highlighter)
- 📍 **GPS-Tracking** - Automatische Standorterfassung mit Genauigkeits-Rating
- 🎤 **Sprachnotizen** - MediaRecorder API mit Waveform-Visualisierung
- 🔄 **Offline-First** - Vollständige Funktionalität ohne Internet + Background Sync
- 🏢 **HubSpot-Integration** - Firmendaten, Kontakte & FF-Mitarbeiter mit Caching
- 💾 **JSON-Export** - Download oder Clipboard für Angebotsgenerator
- ⚡ **Performance** - Animationen, Skeleton Screens, Error-Handling

## Features nach Phase

### ✅ Phase 1-2: Foundation & UI
- IndexedDB-Storage mit LocalStorage-Fallback
- Service Worker v1.2.0 für Offline-Caching
- Mobile-optimierte Touch-UI mit 72px Touch-Targets
- 4 Seiten-Erfassung (Frontseite, Rückseite, Linker/Rechter Giebel)
- 3-State Decision Buttons (Ja/Nein/Später)
- Live-Validierung mit visuellem Feedback
- Workflow-Erzwingung (alle Seiten müssen entschieden sein)

### ✅ Phase 3: Erweiterte Features
- **Kamera**: MediaDevices API, Auto-Kompression (JPEG 85%, max 1920px), Thumbnails (200px)
- **Foto-Annotation**: Canvas mit Touch-Gesten, 4 Werkzeuge (Pen, Arrow, Text, Highlighter), 6 Farben, Undo/Redo
- **GPS**: Geolocation API mit 4-Tier Genauigkeits-Rating (excellent/good/fair/poor), Google Maps Integration
- **Audio**: MediaRecorder API mit automatischer Codec-Erkennung (WebM/Opus → OGG → MP4), Waveform-Visualisierung

### ✅ Phase 4: Offline & Sync
- Background Sync API mit intelligenter Queue
- Automatic Sync bei Reconnect mit Retry-Logic
- JSON-Export mit Meta-Statistiken (Fotos, Audio, Größe)
- Download als Datei + Zwischenablage
- Sync-Status-Badge in UI (🔄 Synchronisiere / ⏳ X ausstehend / ✅ Synchronisiert)

### ✅ Phase 5: HubSpot-Integration
- Company-Suche mit Typeahead (min. 2 Zeichen)
- Contact-Suche (gefiltert nach ausgewählter Company)
- Owners/FF-Mitarbeiter Dropdown (dynamisch aus HubSpot)
- 24h Offline-Caching in IndexedDB
- Auto-Fill von Firmendaten (Adresse, PLZ, Ort)
- Expired Cache Cleanup alle 12h

### ✅ Phase 6: Polish & Testing
- **UI-Polish**: Smooth Animations (fadeIn, slideUp, scaleIn), Card-Animation-Delays, Button-Hover-Effekte
- **Loading-States**: Skeleton Screens für Immobilien-Liste & Details
- **Error-Handling**: Global Error-Handler mit user-freundlichen Messages, Unhandled Promise Rejection Handler
- **Performance**: PerformanceMonitor für Core Web Vitals (LCP, FID, CLS), Resource Timing Tracking
- **Accessibility**: Focus-Visible für Keyboard-Navigation, ARIA-Support, Reduce-Motion Support

## Technologie-Stack

- **Frontend**: Vanilla JavaScript (ES6+), keine Frameworks
- **Storage**: IndexedDB (FassadenFixDB) + LocalStorage-Fallback
- **Offline**: Service Worker v1.2.0 mit Cache-Strategien
- **CSS**: Custom CSS mit FassadenFix Brand Guidelines, CSS-Variablen, CSS Grid/Flexbox
- **APIs**: MediaDevices, Geolocation, MediaRecorder, Background Sync
- **Build**: Kein Build-Prozess erforderlich (Static Deployment)

## Installation

### Voraussetzungen

- Webserver mit **HTTPS** (für PWA zwingend erforderlich!)
- Moderner Browser:
  - Chrome 90+
  - Safari 14+
  - Firefox 88+
  - Edge 90+
- Optional: Backend-Server für HubSpot-Integration

### Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/fassadenfix/objekterfassung-pwa.git
cd objekterfassung-pwa

# 2. Lokalen Server starten
# Option A: Python
python3 -m http.server 8888

# Option B: Node.js
npx serve -p 8888

# Option C: PHP
php -S localhost:8888

# 3. Im Browser öffnen
open http://localhost:8888
```

**⚠️ Wichtig**: Service Worker funktioniert nur über HTTPS oder localhost!

### Backend-Setup (Optional für HubSpot)

```bash
cd ../angebotsgenerator/backend
npm install
cp .env.example .env
# .env bearbeiten: HUBSPOT_ACCESS_TOKEN eintragen
npm start
```

Backend läuft dann auf `http://localhost:3001`

## Projekt-Struktur

```
objekterfassung-pwa/
├── index.html                         # Single Page Application
├── manifest.json                      # PWA Manifest
├── sw.js                              # Service Worker v1.2.0
├── README.md                          # Diese Datei
│
├── css/
│   ├── variables.css                 # Brand Colors (--ff-green, etc.)
│   ├── mobile.css                    # Mobile-First Base Styles
│   └── components.css                # UI + Animationen (3037 Zeilen)
│
├── js/
│   ├── app.js                        # App-Initialisierung
│   │
│   ├── core/
│   │   ├── state.js                  # Event-based State Management
│   │   ├── storage.js                # IndexedDB Wrapper (366 Zeilen)
│   │   ├── sync.js                   # Background Sync Manager (366 Zeilen)
│   │   └── router.js                 # Client-Side Routing
│   │
│   ├── models/
│   │   ├── immobilie.js              # createEmptyImmobilie() - 100% kompatibel
│   │   ├── seite.js                  # createEmptySeite() - 100% kompatibel
│   │   └── validation.js             # validateBlock(), getStats()
│   │
│   ├── utils/
│   │   ├── formatting.js             # formatCurrency(), formatDate(), etc.
│   │   ├── error-handler.js          # Global Error-Handling (218 Zeilen)
│   │   └── performance-monitor.js    # Core Web Vitals Tracking (361 Zeilen)
│   │
│   ├── ui/
│   │   ├── wizard.js                 # Multi-Step Workflow
│   │   ├── renderer.js               # UI Rendering Engine
│   │   └── components/
│   │       ├── immobilien-list.js    # Liste mit FAB + Export
│   │       ├── immobilien-detail.js  # Stammdaten + HubSpot-Suche (692 Zeilen)
│   │       ├── seiten-form.js        # Seiten-Erfassung (573 Zeilen)
│   │       └── validation-feedback.js # Validierungs-UI
│   │
│   ├── features/
│   │   ├── camera.js                 # Kamera + Kompression (454 Zeilen)
│   │   ├── annotation.js             # Canvas Markup-Tool (650 Zeilen)
│   │   ├── geolocation.js            # GPS-Integration (457 Zeilen)
│   │   ├── audio.js                  # Sprachnotizen (523 Zeilen)
│   │   └── export.js                 # JSON-Export (286 Zeilen)
│   │
│   └── integrations/
│       ├── hubspot.js                # HubSpot API + Cache (465 Zeilen)
│       └── backend.js                # Backend-API Wrapper
│
├── data/
│   └── constants.js                  # SEITEN_TYPEN, BUEHNEN_PREISE (aus Angebotsgenerator)
│
└── assets/
    └── icons/                        # PWA Icons (512x512, 192x192, etc.)
```

**Gesamt-Codezeilen**: ~8.000 Zeilen JavaScript + ~3.000 Zeilen CSS

## Datenmodell

### Immobilie (100% kompatibel mit Angebotsgenerator)

```javascript
{
    id: 1706287200000,
    nummer: "2024-001",
    hubspotAssociations: {
        companyId: "12345",
        companyName: "Beispiel GmbH",
        contactId: "67890",
        contactName: "Max Mustermann"
    },
    adresse: {
        strasse: "Hauptstraße",
        hausnummer: "123",
        plz: "10115",
        ort: "Berlin",
        lat: 52.520008,           // NEU: GPS-Koordinate
        lng: 13.404954,           // NEU: GPS-Koordinate
        gpsAccuracy: 15,          // NEU: Genauigkeit in Metern
        gpsQuality: "good"        // NEU: excellent/good/fair/poor
    },
    datumObjektaufnahme: "2026-01-26",
    ffMitarbeiter: "owner-id-123",
    agMitarbeiter: {
        name: "Max Mustermann",
        email: "max@beispiel.de",
        telefon: "+49 123 456789",
        position: "",
        hubspotContactId: null
    },
    seiten: {
        frontseite: createEmptySeite('frontseite'),
        rueckseite: createEmptySeite('rueckseite'),
        linkerGiebel: createEmptySeite('linkerGiebel'),
        rechterGiebel: createEmptySeite('rechterGiebel')
    }
}
```

### Seite (100% kompatibel mit Angebotsgenerator)

```javascript
{
    typ: "frontseite",
    zuReinigen: true,               // ⚠️ PFLICHT! null/true/false
    aktiv: true,
    breite: 20,
    hoehe: 15,
    flaeche: 300,                  // Auto-berechnet: breite × höhe
    letzteSanierung: "",
    farbwerte: "",
    balkone: false,
    link360: "",
    buehne: {
        typ: "standard",            // "keine", "standard", "sonder"
        tage: 1,
        preis: 390,
        beschreibung: ""
    },
    reinigungsprodukt: {
        standard: true,
        zusaetzlichErforderlich: false,
        zusaetzlichProdukte: [],
        anwendung: "zusaetzlich",
        begruendung: ""
    },
    zugaenglichkeit: {
        typ: "ungehindert",
        einschraenkungen: [],
        sonstigesBeschreibung: ""
    },
    schaeden: {
        vorhanden: false,
        graffiti: { aktiv: false, beschreibung: "", fotos: [] },
        loecher: { aktiv: false, beschreibung: "", fotos: [] },
        risse: { aktiv: false, beschreibung: "", fotos: [] },
        weitereBesonderheiten: ""
    },
    fotos: [                        // NEU: Erweiterte Foto-Metadaten
        {
            id: "photo-123",
            url: "data:image/jpeg;base64,...",
            thumbnail: "data:image/jpeg;base64,...",
            timestamp: "2026-01-26T14:30:00Z",
            originalSize: 2048576,
            compressedSize: 245760,
            width: 1920,
            height: 1080,
            annotated: false,       // NEU: Wurde annotiert?
            originalPhotoId: null   // NEU: Original-Foto bei Annotation
        }
    ],
    audioNotes: [                   // NEU: Sprachnotizen
        {
            id: "audio-456",
            url: "data:audio/webm;base64,...",
            mimeType: "audio/webm;codecs=opus",
            duration: 45,
            size: 102400,
            timestamp: "2026-01-26T14:35:00Z"
        }
    ]
}
```

## Workflow

### 1️⃣ Immobilie erstellen

**App öffnen** → **FAB-Button (+)** → **Stammdaten eingeben**

- **HubSpot Company suchen** (optional)
  - Typeahead-Suche ab 2 Zeichen
  - Auto-Fill von Adresse bei Auswahl
- **Adresse** manuell eingeben (wenn nicht in HubSpot)
- **GPS-Position erfassen** (📍 Button)
  - Genauigkeits-Anzeige (excellent ≤10m, good ≤20m, fair ≤50m, poor >50m)
  - Link zu Google Maps für Überprüfung
- **Datum** der Objektaufnahme (max. heute)
- **FF-Mitarbeiter** auswählen (aus HubSpot Owners)
- **HubSpot Contact suchen** (optional)
  - Gefiltert nach ausgewählter Company
  - Auto-Fill von AG-Mitarbeiter-Daten
- **Anwesender Kunde** (optional, manuell)

### 2️⃣ Seiten erfassen (4x wiederholen)

Für jede Seite (**Frontseite, Rückseite, Linker Giebel, Rechter Giebel**):

**A) Entscheidung treffen** ⚠️ **PFLICHTFELD!**

Große Touch-Buttons (min. 64px Höhe):
- ✅ **Ja, zur Reinigung** (Grün)
- ❌ **Nein, nicht zur Reinigung** (Rot)
- ⏳ **Später entscheiden** (Orange)

**B) Dimensionen eingeben** (wenn zuReinigen=true)

- **Breite** × **Höhe** → Fläche wird auto-berechnet
- Live-Anzeige: "300 m²"

**C) Fotos aufnehmen** (optional)

- **📷 Kamera öffnen**
  - Rückkamera bevorzugt (facingMode: environment)
  - Foto aufnehmen
  - Auto-Kompression (JPEG 85%, max 1920px)
  - Thumbnail-Generierung (200px)
- **✏️ Foto annotieren** (optional)
  - Canvas-basiertes Markup-Tool
  - Werkzeuge: Pen, Arrow, Text, Highlighter
  - 6 Farben: Rot, Grün, Blau, Gelb, Orange, Schwarz
  - Linienbreite: 1-10px
  - Undo/Redo
  - Speichern als neues annotiertes Foto
- **🗑️ Foto löschen** (mit Bestätigung)

**D) Details erfassen** (Akkordeon, optional)

- **Bühne**: keine / standard (390€) / sonder (Anfrage)
- **Reinigungsprodukt**: Standard + Optional Zusatzprodukt
- **Zugänglichkeit**: ungehindert / eingeschränkt
- **Schäden**: Graffiti / Löcher / Risse (jeweils mit Fotos)
- **🎤 Sprachnotizen** aufnehmen (optional)
  - MediaRecorder mit Waveform-Visualisierung
  - Timer-Anzeige
  - Pause/Stop/Play Controls
  - Speichern als Audio-Datei (WebM/Opus oder Fallback)

**E) Speichern**

- Auto-Save bei jeder Änderung
- Gespeichert in IndexedDB
- Bei Offline: Queue für Sync

### 3️⃣ Validierung & Export

**Completion Status**:
- ✅ 4/4 Seiten entschieden
- ✅ 2 Seiten aktiv (zuReinigen=true)
- ✅ 300 m² Gesamtfläche

**Export-Button aktiviert** (nur wenn valid):

1. **Validierung prüfen**
   - Min. 1 Immobilie
   - ALLE Seiten entschieden (zuReinigen !== null)
   - Min. 1 Seite zur Reinigung (zuReinigen=true)

2. **Export-Modal öffnen**
   - **Stats anzeigen**:
     - X Immobilie(n)
     - X m² gesamt
     - X Aktive Seiten
     - X Foto(s)
     - X Sprachnotiz(en)
     - X KB Größe
   - **Hinweis**: Format kompatibel mit Angebotsgenerator

3. **Export-Option wählen**:
   - 💾 **Als Datei herunterladen** → `fassadenfix-objekterfassung-2026-01-26.json`
   - 📋 **In Zwischenablage kopieren** → Direkt einfügen im Angebotsgenerator

## API-Dokumentation

### HubSpot API (Backend-Proxy erforderlich)

**Base URL**: `http://localhost:3001` (Dev) oder `https://api.fassadenfix.de` (Prod)

#### Company-Suche

```http
GET /api/hubspot/companies/search?query=GmbH

Response:
{
  "results": [
    {
      "id": "12345",
      "name": "Beispiel GmbH",
      "city": "Berlin",
      "address": "Hauptstraße 123",
      "zip": "10115",
      "phone": "+49 30 123456",
      "domain": "beispiel.de"
    }
  ],
  "mock": false
}
```

#### Company-Details

```http
GET /api/hubspot/companies/:id

Response:
{
  "name": "Beispiel GmbH",
  "city": "Berlin",
  "address": "Hauptstraße 123",
  "zip": "10115",
  "phone": "+49 30 123456",
  "domain": "beispiel.de"
}
```

#### Contact-Suche

```http
GET /api/hubspot/contacts/search?query=Mustermann&companyId=12345

Response:
{
  "results": [
    {
      "id": "67890",
      "firstname": "Max",
      "lastname": "Mustermann",
      "email": "max@beispiel.de",
      "phone": "+49 30 123456",
      "mobile": "+49 170 1234567",
      "jobtitle": "Geschäftsführer",
      "salutation": "Herr"
    }
  ],
  "mock": false
}
```

#### Owners (FF-Mitarbeiter)

```http
GET /api/hubspot/owners

Response:
{
  "results": [
    {
      "id": "owner-123",
      "email": "mitarbeiter@fassadenfix.de",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe"
    }
  ],
  "mock": false
}
```

### Storage-Manager API

```javascript
// Immobilie speichern
await storageManager.saveImmobilie(immo);

// Alle Immobilien laden
const immobilien = await storageManager.loadAllImmobilien();

// Immobilie laden (einzeln)
const immo = await storageManager.loadImmobilie(immoId);

// Immobilie löschen
await storageManager.deleteImmobilie(immoId);

// Alle löschen
await storageManager.deleteAllImmobilien();

// Stats abrufen
const stats = await storageManager.getStats();
// { count: 5, totalSize: 2048576, photos: 24, audioNotes: 5 }
```

### Sync-Manager API

```javascript
// Item in Queue hinzufügen
await syncManager.enqueue('create', immobilieData);
await syncManager.enqueue('update', immobilieData);
await syncManager.enqueue('delete', { id: immoId });

// Manuelle Synchronisation triggern
await syncManager.triggerSync();

// Status abrufen
const status = await syncManager.getStatus();
// {
//   isSyncing: false,
//   lastSyncTime: "2026-01-26T15:00:00Z",
//   queueLength: 0,
//   isOnline: true
// }

// Listener registrieren
syncManager.addListener((event) => {
  if (event.type === 'sync_complete') {
    console.log(`Sync complete: ${event.succeeded} succeeded, ${event.failed} failed`);
  }
});
```

### HubSpot-Integration API

```javascript
// Company suchen
const companies = await hubspotIntegration.searchCompanies('GmbH');

// Company-Details laden
const company = await hubspotIntegration.getCompanyDetails('12345');

// Contact suchen
const contacts = await hubspotIntegration.searchContacts('Mustermann', '12345');

// Owners laden
const owners = await hubspotIntegration.getOwners();

// Cache-Statistiken
const cacheStats = await hubspotIntegration.getCacheStats();
// { total: 45, valid: 40, expired: 5, oldestTimestamp: 1706287200000 }

// Cache aufräumen
await hubspotIntegration.cleanExpiredCache();
```

## Performance

### Lighthouse Scores (Target)

- 🟢 **Performance**: ≥ 95
- 🟢 **PWA**: ≥ 90
- 🟢 **Accessibility**: ≥ 95
- 🟢 **Best Practices**: ≥ 95
- 🟢 **SEO**: ≥ 90

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

### Optimierungen

- ✅ JPEG-Kompression (85% Quality) statt PNG
- ✅ Thumbnail-Generierung (200px) für Galerie
- ✅ Service Worker mit Cache-First Strategy
- ✅ CSS-Animationen mit `will-change` für Hardware-Acceleration
- ✅ IndexedDB statt localStorage für große Daten (Fotos, Audio)
- ✅ Debounced Search (300ms) für HubSpot-Suche
- ✅ Lazy-Loading für Fotos (Base64 erst bei Anzeige dekodieren)
- ✅ Resource Timing Monitoring (warnt bei >500ms)
- ✅ Skeleton Screens für Loading-States
- ✅ Reduce-Motion Support für Accessibility

### Performance-Monitor

```javascript
// Performance-Report abrufen
const report = performanceMonitor.getReport();
console.log(report);
// {
//   navigation: { domContentLoaded: 234, ttfb: 45, ... },
//   paint: { "first-contentful-paint": 456, ... },
//   lcp: 1234,
//   fid: 23,
//   cls: 0.05,
//   custom: { "loadImmobilien": 123, ... },
//   connection: { effectiveType: "4g", downlink: 10, rtt: 50 },
//   memory: { usedJSHeapSize: 45, totalJSHeapSize: 512 },
//   storage: { usage: 2, quota: 5000, percentage: 0.04 }
// }

// Custom Measurement
performanceMonitor.startMeasure('loadImmobilien');
await storageManager.loadAllImmobilien();
performanceMonitor.endMeasure('loadImmobilien');
// [Performance] loadImmobilien: 123 ms

// Report exportieren
const json = performanceMonitor.exportReport();
```

## Browser-Kompatibilität

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| **Service Worker** | ✅ 90+ | ✅ 14+ | ✅ 88+ | ✅ 90+ |
| **IndexedDB** | ✅ | ✅ | ✅ | ✅ |
| **MediaDevices (Camera)** | ✅ | ✅ | ✅ | ✅ |
| **Geolocation API** | ✅ | ✅ | ✅ | ✅ |
| **MediaRecorder (Audio)** | ✅ | ⚠️ 14.5+ | ✅ | ✅ |
| **Background Sync** | ✅ | ❌ (Fallback) | ❌ (Fallback) | ✅ |
| **Canvas API** | ✅ | ✅ | ✅ | ✅ |
| **Touch Events** | ✅ | ✅ | ✅ | ✅ |

**Hinweise**:
- Safari: MediaRecorder erst ab iOS 14.5 (April 2021)
- Firefox/Safari: Kein Background Sync → Automatischer Fallback zu direkter Synchronisation
- Alle modernen Browser unterstützen PWA-Installation

## Offline-Funktionalität

### 1. Installation

**Beim ersten Besuch:**
- Service Worker registriert sich automatisch
- Statische Assets werden gecached (~500 KB)
- IndexedDB wird initialisiert
- HubSpot Owners werden preloaded (wenn online)

**PWA-Installation:**
- Chrome/Edge: "Installieren" in Adressleiste
- Safari iOS: "Zum Home-Bildschirm" → Funktioniert wie native App

### 2. Offline-Nutzung

**Voll funktionsfähig offline:**
- ✅ Immobilien erstellen/bearbeiten/löschen
- ✅ Fotos aufnehmen (Kamera funktioniert offline!)
- ✅ Fotos annotieren
- ✅ GPS-Position erfassen
- ✅ Sprachnotizen aufnehmen
- ✅ JSON-Export (Download + Clipboard)

**Eingeschränkt offline:**
- ⚠️ HubSpot-Suche: Nutzt 24h-Cache, keine Live-Suche
- ⚠️ Neue Owners: Werden beim nächsten Online-Zugriff geladen

**Nicht verfügbar offline:**
- ❌ Backend-Sync (wird automatisch bei Reconnect nachgeholt)

### 3. Synchronisation

**Automatisch bei Netzwerk-Reconnect:**
1. Browser erkennt Online-Status
2. Service Worker triggert Background Sync
3. Sync-Queue wird abgearbeitet (FIFO)
4. Erfolgreich gesyncte Items werden aus Queue entfernt
5. Fehlerhafte Items bleiben in Queue (Retry bei nächstem Sync)

**Sync-Status in UI:**
- 🔄 **Synchronisiere...** (während Sync läuft)
- ⏳ **X ausstehend** (Items in Queue)
- ✅ **Synchronisiert** (Queue leer, letzter Sync erfolgreich)

**Manueller Sync:**
- Sync-Button in Header (🔄)
- Pull-to-Refresh in Immobilien-Liste (optional)

## Sicherheit

### Implementierte Maßnahmen

- ✅ **HTTPS-Only** (PWA-Anforderung)
- ✅ **Same-Origin Policy** (Browser-Standard)
- ✅ **Input-Sanitization** (`escapeHtml()` für alle User-Inputs)
- ✅ **XSS-Schutz** (keine `innerHTML` mit User-Content)
- ✅ **CSP** (Content Security Policy) via HTTP-Header (empfohlen)
- ✅ **Keine API-Keys im Frontend** (nur Backend hat HubSpot-Token)
- ✅ **Keine sensiblen Daten in localStorage** (nur Session-Daten, keine Passwörter)
- ✅ **IndexedDB-Verschlüsselung** (durch Browser, kein Custom-Crypto)

### Empfohlene HTTP-Header (Server-Konfiguration)

```nginx
# Content-Security-Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:3001 https://api.fassadenfix.de; worker-src 'self';" always;

# X-Frame-Options
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options
add_header X-Content-Type-Options "nosniff" always;

# Referrer-Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions-Policy
add_header Permissions-Policy "camera=(self), microphone=(self), geolocation=(self)" always;
```

## Deployment

### Option 1: GitHub Pages (Empfohlen für Static Hosting)

```bash
# 1. Repository auf GitHub pushen
git push origin main

# 2. GitHub Pages aktivieren
# Settings → Pages → Source: main branch → Save

# 3. URL: https://fassadenfix.github.io/objekterfassung-pwa/
```

**Vorteil**: Kostenlos, automatisches HTTPS, einfaches Deployment

### Option 2: Vercel

```bash
# 1. Vercel CLI installieren
npm i -g vercel

# 2. Deployen
vercel --prod

# 3. Custom Domain (optional)
vercel domains add objekterfassung.fassadenfix.de
```

**Vorteil**: Serverless, automatische HTTPS, Preview-Deployments

### Option 3: Netlify

```bash
# 1. Netlify CLI installieren
npm i -g netlify-cli

# 2. Deployen
netlify deploy --prod

# 3. Custom Domain (optional)
netlify domains:add objekterfassung.fassadenfix.de
```

**Vorteil**: Form-Handling, serverless Functions, Split-Testing

### Option 4: Nginx (Self-Hosted)

```nginx
server {
    listen 443 ssl http2;
    server_name objekterfassung.fassadenfix.de;

    ssl_certificate /etc/letsencrypt/live/objekterfassung.fassadenfix.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/objekterfassung.fassadenfix.de/privkey.pem;

    root /var/www/objekterfassung-pwa;
    index index.html;

    # Security Headers (siehe oben)

    # Service Worker caching
    location /sw.js {
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
    }

    # Static Assets (lange Cache-Dauer)
    location ~* \.(css|js|jpg|jpeg|png|webp|svg|woff2|ico)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA Routing (alle Routes zu index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Vorteil**: Volle Kontrolle, Custom-Konfiguration, eigene Server

## Troubleshooting

### Service Worker aktualisiert nicht

**Problem**: Änderungen im Code werden nicht angezeigt.

**Lösung**:
```javascript
// In Browser-Console:
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});
location.reload(true); // Hard-Reload
```

Oder in Chrome DevTools:
1. Application → Service Workers
2. "Unregister" klicken
3. "Update on reload" aktivieren
4. Seite neu laden

### IndexedDB Fehler / Quota Exceeded

**Problem**: "QuotaExceededError" beim Speichern von Fotos.

**Lösung**:
```javascript
// 1. Alte Daten exportieren
const exportData = await exportAsJSON();
console.log(JSON.stringify(exportData));

// 2. Cache löschen
caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
});

// 3. IndexedDB löschen
indexedDB.deleteDatabase('FassadenFixDB');

// 4. Seite neu laden
location.reload();
```

**Prävention**:
- Regelmäßig exportieren und alte Immobilien löschen
- Foto-Kompression aktiviert (85% Quality)
- Storage-Quota überwachen: `navigator.storage.estimate()`

### Kamera funktioniert nicht

**Mögliche Ursachen:**

1. **HTTP statt HTTPS**
   - Lösung: Nur über HTTPS oder localhost nutzen

2. **Browser-Berechtigung verweigert**
   - Chrome: Adressleiste → 🔒 → "Kamera" → "Zulassen"
   - iOS Safari: Einstellungen → Safari → Kamera → "Fragen" oder "Zulassen"

3. **Kein Gerät angeschlossen** (Desktop)
   - Lösung: Webcam anschließen oder Mobile nutzen

4. **Kamera bereits in Verwendung**
   - Lösung: Andere App schließen (Zoom, Teams, etc.)

### GPS-Position nicht verfügbar

**Mögliche Ursachen:**

1. **Standortdienste deaktiviert**
   - iOS: Einstellungen → Datenschutz → Ortungsdienste → Safari → "Beim Verwenden"
   - Android: Einstellungen → Standort → An

2. **Berechtigung verweigert**
   - Browser-Berechtigung in Adressleiste aktivieren

3. **Schlechter GPS-Empfang**
   - Ins Freie gehen oder näher ans Fenster
   - Genauigkeits-Warnung beachten (poor >50m)

### HubSpot-Suche findet nichts

**Mögliche Ursachen:**

1. **Backend nicht erreichbar**
   - Prüfen: `http://localhost:3001/api/hubspot/owners`
   - Lösung: Backend starten oder Mock-Modus nutzen

2. **CORS-Fehler**
   - Browser-Console prüfen
   - Backend CORS-Config prüfen (siehe server.js)

3. **HubSpot-Token ungültig**
   - .env-Datei prüfen: `HUBSPOT_ACCESS_TOKEN`
   - Token neu generieren in HubSpot

### Background Sync funktioniert nicht

**Normal bei Safari/Firefox** (kein Background Sync API Support).

**Automatischer Fallback:**
- Direkter Sync bei Online-Status
- Keine Funktion verloren

**In Chrome testen:**
1. DevTools → Application → Background Sync
2. "sync-immobilien" sollte angezeigt werden
3. Bei Offline → Online automatisch ausgelöst

## Entwicklung

### Debug-Modus aktivieren

```javascript
// In Browser-Console:
localStorage.setItem('DEBUG', 'true');
location.reload();

// Deaktivieren:
localStorage.removeItem('DEBUG');
```

### State inspizieren

```javascript
// Alle Immobilien
console.log(AppState.immobilien);

// Statistiken
console.log(getStats(AppState.immobilien));

// Validierung
console.log(validateBlock(AppState.immobilien));

// Sync-Status
syncManager.getStatus().then(console.log);

// HubSpot Cache-Stats
hubspotIntegration.getCacheStats().then(console.log);

// Performance-Report
console.log(performanceMonitor.getReport());

// Fehler-Log
console.log(errorHandler.getErrors());
```

### Storage löschen (Reset)

```javascript
// IndexedDB löschen
indexedDB.deleteDatabase('FassadenFixDB');

// Service Worker deregistrieren
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
});

// Cache löschen
caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
});

// LocalStorage löschen
localStorage.clear();

// Seite neu laden
location.reload();
```

### Performance testen

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:8888 --view

# Lighthouse in Chrome DevTools
# F12 → Lighthouse → Generate Report
```

## Testing

### Manuelle Test-Checkliste

**Basis-Funktionalität:**
- [ ] App lädt ohne Fehler
- [ ] Service Worker registriert sich
- [ ] IndexedDB wird initialisiert
- [ ] Neue Immobilie erstellen (FAB-Button)
- [ ] Immobilien-Liste anzeigen
- [ ] Immobilie bearbeiten
- [ ] Immobilie löschen

**Seiten-Erfassung:**
- [ ] Alle 4 Seiten anzeigen
- [ ] Entscheidung treffen (Ja/Nein/Später)
- [ ] Dimensionen eingeben → Fläche berechnet
- [ ] Foto aufnehmen
- [ ] Foto annotieren (alle 4 Werkzeuge)
- [ ] Foto löschen
- [ ] Sprachnotiz aufnehmen
- [ ] Sprachnotiz abspielen

**GPS:**
- [ ] GPS-Position erfassen
- [ ] Genauigkeits-Anzeige korrekt
- [ ] Google Maps Link funktioniert

**HubSpot:**
- [ ] Company-Suche funktioniert
- [ ] Company auswählen → Auto-Fill
- [ ] Contact-Suche funktioniert
- [ ] FF-Mitarbeiter Dropdown lädt

**Export:**
- [ ] Validierung zeigt Fehler bei unvollständigen Daten
- [ ] Export-Button aktiviert bei vollständigen Daten
- [ ] JSON-Download funktioniert
- [ ] Clipboard-Copy funktioniert

**Offline:**
- [ ] App funktioniert offline
- [ ] Daten werden lokal gespeichert
- [ ] Sync-Queue zeigt ausstehende Items
- [ ] Automatischer Sync bei Reconnect

**Performance:**
- [ ] FCP < 2s
- [ ] Smooth Animationen
- [ ] Keine Layout-Shifts
- [ ] Skeleton Screens bei Loading

### Browser-Testing

**Desktop:**
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Edge 90+
- [ ] Safari 14+

**Mobile:**
- [ ] iOS Safari 14+
- [ ] Chrome Android
- [ ] Samsung Internet

### Test-Daten generieren

```javascript
// In Browser-Console:
for (let i = 1; i <= 5; i++) {
    const immo = createEmptyImmobilie(i);
    immo.adresse.strasse = `Teststraße ${i}`;
    immo.adresse.hausnummer = `${i}`;
    immo.adresse.plz = `1011${i}`;
    immo.adresse.ort = "Berlin";
    immo.datumObjektaufnahme = "2026-01-26";

    // Seiten zufällig befüllen
    Object.keys(immo.seiten).forEach(key => {
        immo.seiten[key].zuReinigen = Math.random() > 0.3;
        if (immo.seiten[key].zuReinigen) {
            immo.seiten[key].breite = Math.floor(Math.random() * 20) + 10;
            immo.seiten[key].hoehe = Math.floor(Math.random() * 15) + 10;
            immo.seiten[key].flaeche = immo.seiten[key].breite * immo.seiten[key].hoehe;
        }
    });

    await storageManager.saveImmobilie(immo);
}

console.log('5 Test-Immobilien erstellt');
updateState('immobilien', AppState.immobilien);
renderImmobilienList();
```

## Lizenz

Copyright © 2026 FassadenFix GmbH. Alle Rechte vorbehalten.

Proprietäre Software - Keine Weitergabe oder Verwendung ohne ausdrückliche Genehmigung.

## Support

**Bei technischen Fragen:**
- GitHub Issues: https://github.com/fassadenfix/objekterfassung-pwa/issues
- E-Mail: support@fassadenfix.de
- Telefon: +49 (0) 123 456789

**Entwickler-Kontakt:**
- r.blaesche@fassadenfix.de

## Changelog

### v1.2.0 (2026-01-26) - Production-Ready

**Neu:**
- ✅ Phase 5: HubSpot-Integration mit Offline-Caching
- ✅ Phase 6: UI-Polish, Animationen, Error-Handling, Performance-Monitoring

**Verbesserungen:**
- Service Worker v1.2.0
- Smooth Animations & Transitions
- Skeleton Screens
- Global Error-Handler
- Performance-Monitor (Core Web Vitals)

### v1.1.0 (2026-01-25) - Feature-Complete

**Neu:**
- ✅ Phase 3: Kamera, GPS, Audio, Annotation
- ✅ Phase 4: Offline & Sync, Export

### v1.0.0 (2026-01-24) - MVP

**Neu:**
- ✅ Phase 1-2: Foundation & UI
- IndexedDB-Storage
- Service Worker
- Mobile-optimierte Touch-UI
- 4 Seiten-Erfassung mit Validierung

---

**Made with ❤️ by FassadenFix Development Team**
