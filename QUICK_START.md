# 🚀 FassadenFix PWA & Angebotsgenerator - Quick Start

## 📦 Was wurde erstellt?

### 1. Objekterfassung PWA (Phase 1-6 ✅ COMPLETED)
**Location**: `/objekterfassung-pwa/`

Mobile-First Progressive Web App zur Erfassung von Immobilien vor Ort:
- ✅ Offline-funktionsfähig (Service Worker)
- ✅ Kamera-Integration mit Kompression
- ✅ GPS-Tracking
- ✅ Sprachnotizen
- ✅ HubSpot-Integration
- ✅ JSON-Export

### 2. Deployment-Konfiguration ✅ READY
- **GitHub Actions Workflow**: `.github/workflows/deploy.yml`
- **Render Config**: `backend/render.yaml`
- **API Configuration**: `js/config/api.config.js`
- **Environment Variables**: `backend/.env.example`

### 3. Dokumentation ✅ COMPLETE
- **DEPLOYMENT.md**: Vollständige Deployment-Anleitung
- **TESTING_CHECKLIST.md**: 250+ Tests
- **objekterfassung-pwa/README.md**: Technische Dokumentation (1100+ Zeilen)

---

## 🎯 Nächste Schritte (4 Schritte zum Go-Live)

### ✅ Schritt 1: Lokales Testing

```bash
# PWA starten
cd objekterfassung-pwa
./start.sh              # macOS/Linux
# ODER start.bat       # Windows

# Browser öffnen: http://localhost:8888
```

**Testing-Checkliste abarbeiten**: Siehe [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

**Wichtigste Tests**:
- [ ] App lädt ohne Fehler
- [ ] Service Worker registriert
- [ ] Offline-Modus funktioniert (Flugmodus aktivieren)
- [ ] Kamera funktioniert
- [ ] GPS-Koordinaten werden erfasst
- [ ] Immobilien speichern funktioniert
- [ ] JSON-Export erstellt valide Datei

---

### ✅ Schritt 2: Backend Testing (mit HubSpot)

```bash
cd angebotsgenerator/backend
npm install

# .env Datei erstellen (aus .env.example kopieren)
cp .env.example .env
# .env bearbeiten und HubSpot Access Token einfügen

node server.js
# Backend läuft: http://localhost:3001
```

**HubSpot Access Token erstellen**:
1. HubSpot → Settings → Integrations → Private Apps
2. Neue App erstellen: "FassadenFix Objekterfassung"
3. Scopes auswählen:
   - `crm.objects.companies.read`
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read` + `.write`
   - `crm.objects.owners.read`
4. Access Token kopieren → in `.env` einfügen

**Testing**:
```bash
# Health Check
curl http://localhost:3001/api/health

# HubSpot Owners laden
curl http://localhost:3001/api/hubspot/owners
```

**PWA mit Backend verbinden**:
- PWA neu laden: `http://localhost:8888`
- Neue Immobilie → Stammdaten
- Firma suchen (z.B. "GmbH") → sollte HubSpot-Firmen anzeigen
- FF-Mitarbeiter Dropdown → sollte Owner anzeigen

---

### 🚀 Schritt 3: Deployment auf GitHub Pages + Render

**Siehe vollständige Anleitung**: [DEPLOYMENT.md](./DEPLOYMENT.md)

#### 3.1 PWA auf GitHub Pages deployen

```bash
cd objekterfassung-pwa

# Git initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "Initial commit: FassadenFix PWA v1.2.1"

# GitHub Repository erstellen und verknüpfen
# (Ersetze USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/USERNAME/fassadenfix-objekterfassung.git
git branch -M main
git push -u origin main
```

**GitHub Pages aktivieren**:
1. GitHub Repository → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Workflow wird automatisch ausgeführt (`.github/workflows/deploy.yml`)
4. Nach ~2 Minuten: `https://USERNAME.github.io/fassadenfix-objekterfassung/`

#### 3.2 Backend auf Render deployen

```bash
cd angebotsgenerator/backend

# Git initialisieren
git init
git add .
git commit -m "Initial commit: FassadenFix Backend"

# GitHub Repository erstellen (separates Repo empfohlen)
git remote add origin https://github.com/USERNAME/fassadenfix-backend.git
git branch -M main
git push -u origin main
```

**Render Service erstellen**:
1. [render.com/dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. GitHub Repository verbinden: `fassadenfix-backend`
3. Konfiguration:
   - **Name**: `fassadenfix-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. **Environment Variables** setzen:
   ```
   NODE_ENV=production
   PORT=10000
   HUBSPOT_ACCESS_TOKEN=pat-eu1-XXXXXX...
   ALLOWED_ORIGINS=https://USERNAME.github.io
   ```
5. **Create Web Service** klicken
6. Nach ~5 Min.: `https://fassadenfix-api.onrender.com`

#### 3.3 Frontend mit Backend verbinden

**PWA-Konfiguration aktualisieren**:

Öffne: `/objekterfassung-pwa/js/config/api.config.js`

```javascript
// Zeile 12-14: BASE_URL aktualisieren
BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://fassadenfix-api.onrender.com',  // ← Deine Render-URL
```

**Pushen und deployen**:
```bash
cd objekterfassung-pwa
git add js/config/api.config.js
git commit -m "Connect to Render backend"
git push

# GitHub Actions deployed automatisch nach ~2 Min.
```

---

### ✅ Schritt 4: Production Testing

**PWA Testing (auf Mobile)**:
1. Öffne `https://USERNAME.github.io/fassadenfix-objekterfassung/` auf Smartphone
2. "Zum Homescreen hinzufügen" (iOS) oder "App installieren" (Android)
3. App öffnen → sollte wie native App aussehen
4. Offline gehen (Flugmodus)
5. App sollte weiterhin funktionieren
6. Neue Immobilie erstellen → funktioniert offline
7. Online gehen → automatische Synchronisation

**Backend Testing**:
```bash
# Health Check
curl https://fassadenfix-api.onrender.com/api/health

# Response sollte sein:
# {"status":"ok","hubspot":true,"timestamp":"..."}
```

**HubSpot Integration Testing**:
- PWA öffnen
- Neue Immobilie → Stammdaten
- Firma suchen → HubSpot-Firmen sollten erscheinen
- FF-Mitarbeiter Dropdown → sollte Owners zeigen

---

## ✅ Verification Checklist

### PWA Deployment
- [ ] App läuft unter `https://USERNAME.github.io/...`
- [ ] Service Worker registriert (DevTools → Application)
- [ ] Installierbar auf iOS + Android
- [ ] Funktioniert offline
- [ ] Lighthouse PWA Score ≥ 90

### Backend Deployment
- [ ] Health Endpoint erreichbar: `/api/health`
- [ ] HubSpot Owners laden: `/api/hubspot/owners`
- [ ] CORS erlaubt GitHub Pages URL
- [ ] Render Service Status: "Live" (grün)

### Integration
- [ ] PWA kann HubSpot-Daten laden
- [ ] Company-Suche funktioniert
- [ ] FF-Mitarbeiter Dropdown funktioniert
- [ ] Keine CORS-Fehler in Console

---

## 🐛 Troubleshooting

### Problem: PWA lädt nicht

**Lösung**:
- GitHub → Actions → neuester Workflow → Status prüfen
- Bei Fehler: Logs anschauen
- Branch prüfen: Sollte `main` sein

### Problem: Backend 503 Error

**Lösung**:
- Render Dashboard → Service Status prüfen
- Environment Variables prüfen (HUBSPOT_ACCESS_TOKEN gesetzt?)
- Cold Start abwarten (~30 Sek. nach 15 Min. Inaktivität)

### Problem: CORS-Fehler

**Symptom**: `Access to fetch ... has been blocked by CORS policy`

**Lösung**:
1. Render Dashboard → Environment
2. `ALLOWED_ORIGINS` prüfen → sollte GitHub Pages URL enthalten
3. Service neu starten (Manual Deploy)

### Problem: HubSpot 401 Unauthorized

**Ursache**: Access Token falsch/abgelaufen

**Lösung**:
1. HubSpot → Private Apps → Neues Token generieren
2. Render → Environment → `HUBSPOT_ACCESS_TOKEN` aktualisieren
3. Service neu starten

---

## 📊 Performance-Check

### Lighthouse Test (PWA)

```bash
npm install -g lighthouse
lighthouse https://USERNAME.github.io/fassadenfix-objekterfassung/ --view
```

**Erwartete Scores**:
- Performance: ≥ 90
- PWA: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90

### Backend Response Time

```bash
time curl https://fassadenfix-api.onrender.com/api/health

# Sollte < 500ms sein (nach Cold Start)
```

---

## 📄 Weitere Dokumentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Vollständige Deployment-Anleitung (inkl. Custom Domains, Monitoring)
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)**: Ausführliche Testing-Checkliste (250+ Tests)
- **[objekterfassung-pwa/README.md](./objekterfassung-pwa/README.md)**: Technische Dokumentation (1100+ Zeilen)

---

## 🎉 Fertig!

Nach Abschluss aller 4 Schritte ist die App produktionsbereit:

- **PWA**: `https://USERNAME.github.io/fassadenfix-objekterfassung/`
- **Backend**: `https://fassadenfix-api.onrender.com`

### Beta-Testing empfohlen

Vor Rollout an alle Außendienstler:
1. 3-5 Beta-Tester einladen
2. Feedback sammeln (Usability, Bugs)
3. Iterationen basierend auf Feedback
4. Dann: Rollout an alle Mitarbeiter

**Viel Erfolg! 🚀**
