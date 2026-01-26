# FassadenFix Angebotsgenerator

Professioneller Angebotsgenerator mit HubSpot-Integration für die Fassadenreinigungsbranche.

## 🏗️ Architektur

```
angebotsgenerator/
├── index.html              # Haupt-Einstiegspunkt
├── css/styles.css          # Styling
├── js/
│   ├── constants.js        # Zentrale Konstanten
│   ├── state.js            # App-State Management
│   ├── orchestrator.js     # Workflow-Koordination
│   ├── app.js              # Core-Logik
│   ├── ui.js               # UI-Rendering
│   ├── preview.js          # PDF-Vorschau
│   ├── hubspot.js          # HubSpot-Integration
│   └── pdf.js              # PDF-Export
├── blocks/                 # Modulare Block-Architektur
│   ├── auftraggeber/       # Block 1: Kundendaten
│   ├── objekterfassung/    # Block 2: Immobilien
│   └── angebot/            # Block 3: Angebotserstellung
├── backend/                # Node.js API-Server
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
└── data/                   # JSON-Konfiguration
```

## 🚀 Schnellstart

### Lokale Entwicklung

```bash
# Frontend starten
cd angebotsgenerator
python3 -m http.server 8080

# Backend starten (separates Terminal)
cd backend
npm install
cp .env.example .env  # HubSpot-Credentials eintragen
npm start
```

### Mit Docker

```bash
cd angebotsgenerator
docker-compose up -d
```

- Frontend: <http://localhost:8080>
- Backend: <http://localhost:3001>

## ⚙️ Konfiguration

### Backend (.env)

```env
HUBSPOT_ACCESS_TOKEN=pat-eu1-xxxx
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

## 📊 Features

- **3-Schritt-Workflow**: Auftraggeber → Objekte → Angebot
- **HubSpot-Integration**: Companies, Contacts, Deals synchronisieren
- **PDF-Export**: Professionelle Angebots-PDFs generieren
- **Preisstaffel**: Automatische Preisberechnung nach m²
- **Frühbucherrabatt**: Zeitlich begrenzte Rabattaktionen

## 🧪 Tests

```bash
npm test
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)

1. Repository mit Vercel/Netlify verbinden
2. Build-Command: (leer - statische Dateien)
3. Publish-Directory: `/`

### Backend (Railway/Render)

1. Repository verbinden
2. Root-Directory: `backend/`
3. Start-Command: `npm start`
4. Environment-Variables setzen

## 📝 Lizenz

Proprietär - FassadenFix GmbH

## 👥 Team

- Entwicklung: Alexander Retzlaff
- Design: FassadenFix Team
