# 🚀 FassadenFix Deployment-Anleitung

## Übersicht

Diese Anleitung beschreibt das Deployment der FassadenFix Objekterfassung PWA auf **GitHub Pages** (Frontend) und **Render** (Backend).

---

## 📋 Voraussetzungen

### GitHub Account
- GitHub Account erstellt
- Git installiert auf lokalem Rechner

### Render Account
- Kostenloses Konto auf [render.com](https://render.com) erstellen
- GitHub Account mit Render verknüpfen

### HubSpot API
- HubSpot Private App erstellt
- Access Token verfügbar
- Erforderliche Scopes:
  - `crm.objects.companies.read`
  - `crm.objects.contacts.read`
  - `crm.objects.deals.read` + `.write`
  - `crm.schemas.contacts.read`
  - `crm.objects.owners.read`

---

## 🎯 Teil 1: PWA auf GitHub Pages deployen

### Schritt 1: GitHub Repository erstellen

```bash
# Im Projektverzeichnis
cd "objekterfassung-pwa"

# Git initialisieren (falls noch nicht geschehen)
git init

# Dateien hinzufügen
git add .
git commit -m "Initial commit: FassadenFix Objekterfassung PWA v1.2.0"

# Remote Repository hinzufügen (ersetze USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/USERNAME/fassadenfix-objekterfassung.git

# Push zu GitHub
git branch -M main
git push -u origin main
```

### Schritt 2: GitHub Pages aktivieren

1. Gehe zu deinem GitHub Repository
2. Klicke auf **Settings** (⚙️)
3. Scroll zu **Pages** (linkes Menü)
4. Bei **Source** wähle:
   - **Source**: `GitHub Actions` (empfohlen)
5. GitHub Actions Workflow wird automatisch erkannt (`.github/workflows/deploy.yml`)
6. Nach dem nächsten Push wird die App automatisch deployt

### Schritt 3: URL testen

Die PWA ist nach ~2 Minuten verfügbar unter:
```
https://USERNAME.github.io/fassadenfix-objekterfassung/
```

**Wichtig**: HTTPS ist zwingend erforderlich für PWA-Features (Service Worker, Kamera, GPS)!

### Schritt 4: PWA installierbar machen

Nach dem ersten Besuch erscheint der "Zum Homescreen hinzufügen"-Dialog automatisch.

**iOS Safari**: Teilen-Button → "Zum Home-Bildschirm"
**Android Chrome**: Browser-Menü → "App installieren"

---

## 🖥️ Teil 2: Backend auf Render deployen

### Schritt 1: Backend auf GitHub pushen

```bash
# Ins Backend-Verzeichnis wechseln
cd ../angebotsgenerator/backend

# Git initialisieren
git init
git add .
git commit -m "Initial commit: FassadenFix Backend API"

# Remote Repository (separates Repo für Backend empfohlen)
git remote add origin https://github.com/USERNAME/fassadenfix-backend.git
git branch -M main
git push -u origin main
```

### Schritt 2: Render Service erstellen

1. Gehe zu [render.com/dashboard](https://dashboard.render.com)
2. Klicke auf **New +** → **Web Service**
3. Verbinde dein GitHub Repository:
   - **Repository**: `fassadenfix-backend`
4. Konfiguration:
   - **Name**: `fassadenfix-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (für Start ausreichend)

### Schritt 3: Environment Variables setzen

Im Render Dashboard unter **Environment**:

```bash
NODE_ENV=production
PORT=10000
HUBSPOT_ACCESS_TOKEN=pat-eu1-XXXXXX-XXXXXX-XXXXXX
HUBSPOT_PORTAL_ID=12345678
ALLOWED_ORIGINS=https://USERNAME.github.io
```

**HubSpot Access Token abrufen**:
1. HubSpot → Settings → Integrations → Private Apps
2. App erstellen mit erforderlichen Scopes (siehe oben)
3. Access Token kopieren

### Schritt 4: Deployment starten

- Klicke auf **Create Web Service**
- Render deployed automatisch (dauert ~5 Min.)
- Backend ist verfügbar unter: `https://fassadenfix-api.onrender.com`

### Schritt 5: Health Check testen

```bash
curl https://fassadenfix-api.onrender.com/api/health
```

Erwartete Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T15:00:00.000Z",
  "hubspot": true,
  "openai": false
}
```

---

## 🔗 Teil 3: Frontend mit Backend verbinden

### Schritt 1: Backend-URL in PWA konfigurieren

Erstelle oder aktualisiere `/objekterfassung-pwa/js/config/api.config.js`:

```javascript
// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://fassadenfix-api.onrender.com',
    ENDPOINTS: {
        COMPANIES_SEARCH: '/api/hubspot/companies/search',
        COMPANIES_DETAILS: '/api/hubspot/companies',
        CONTACTS_SEARCH: '/api/hubspot/contacts/search',
        COMPANY_CONTACTS: '/api/hubspot/companies/:id/contacts',
        OWNERS: '/api/hubspot/owners',
        HEALTH: '/api/health'
    },
    TIMEOUT: 10000,
    RETRY: 3
};

// Export (falls Module-System verwendet wird)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
```

### Schritt 2: HubSpot-Integration aktualisieren

In `/objekterfassung-pwa/js/integrations/hubspot.js` die API-Calls aktualisieren:

```javascript
// Beispiel: searchCompanies() Methode
async searchCompanies(query) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES_SEARCH}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    // ... rest bleibt gleich
}
```

### Schritt 3: Service Worker Cache aktualisieren

In `/objekterfassung-pwa/sw.js` die Version erhöhen:

```javascript
const CACHE_VERSION = 'v1.2.1'; // Version erhöhen
```

### Schritt 4: Pushen und neu deployen

```bash
cd objekterfassung-pwa
git add .
git commit -m "Connect to Render backend API"
git push
```

GitHub Actions deployed automatisch nach ~2 Min.

---

## ✅ Verification Checklist

### PWA (GitHub Pages)

- [ ] PWA lädt unter `https://USERNAME.github.io/...`
- [ ] Service Worker registriert (Console: "SW registered")
- [ ] Manifest.json lädt korrekt
- [ ] Icons werden angezeigt (32x32, 192x192)
- [ ] "Installieren"-Prompt erscheint auf Mobile
- [ ] Offline-Funktionalität: App öffnet ohne Internet
- [ ] Lighthouse PWA Score ≥ 90

**Testing**:
```bash
# Lighthouse Test
npm install -g lighthouse
lighthouse https://USERNAME.github.io/fassadenfix-objekterfassung/ --view
```

### Backend (Render)

- [ ] `/api/health` gibt Status 200 zurück
- [ ] HubSpot-Integration funktioniert: `/api/hubspot/owners` gibt Owners zurück
- [ ] CORS erlaubt Requests von GitHub Pages
- [ ] Logs zeigen keine Errors (Render Dashboard → Logs)
- [ ] Render Service Status: "Live" (grün)

**Testing**:
```bash
# Health Check
curl https://fassadenfix-api.onrender.com/api/health

# HubSpot Test (sollte Owners zurückgeben)
curl https://fassadenfix-api.onrender.com/api/hubspot/owners

# CORS Test (mit Browser DevTools → Network Tab)
# Origin-Header sollte erlaubt sein
```

### Integration

- [ ] PWA kann HubSpot-Daten laden
- [ ] Company-Suche funktioniert
- [ ] FF-Mitarbeiter Dropdown wird befüllt
- [ ] Offline-Caching: Daten verfügbar nach Reload ohne Internet
- [ ] Keine CORS-Fehler in Browser Console

**Testing**:
1. PWA auf Mobile öffnen
2. Neue Immobilie erstellen
3. Firma suchen → sollte Firmen aus HubSpot anzeigen
4. FF-Mitarbeiter Dropdown → sollte Mitarbeiter anzeigen
5. Offline gehen (Flugmodus)
6. App neu laden → sollte weiterhin funktionieren
7. Firma suchen → sollte gecachte Ergebnisse zeigen

---

## 🔧 Troubleshooting

### Problem: PWA lädt nicht auf GitHub Pages

**Lösung 1**: Branch überprüfen
```bash
# Stelle sicher, dass du auf "main" branch bist
git branch
git checkout main
git push
```

**Lösung 2**: GitHub Actions Workflow überprüfen
- GitHub Repository → Actions → neuester Workflow
- Sollte "✅ Success" zeigen
- Bei Fehler: Logs anschauen

### Problem: Backend 503 Service Unavailable

**Lösung 1**: Render Service prüfen
- Render Dashboard → Service Status sollte "Live" sein
- Logs checken auf Startup-Fehler

**Lösung 2**: Environment Variables prüfen
- HUBSPOT_ACCESS_TOKEN korrekt gesetzt?
- TOKEN mit `pat-eu1-` beginnt (EU-Region)?

**Lösung 3**: Cold Start abwarten
- Render Free Plan: Cold Start dauert ~30 Sek.
- Nach 15 Min. Inaktivität schläft Service ein

### Problem: CORS-Fehler in Browser

**Symptom**:
```
Access to fetch at 'https://fassadenfix-api.onrender.com/api/hubspot/owners'
from origin 'https://USERNAME.github.io' has been blocked by CORS policy
```

**Lösung**:
1. Render Dashboard → Environment → `ALLOWED_ORIGINS` prüfen
2. Sollte GitHub Pages URL enthalten: `https://USERNAME.github.io`
3. Service neu starten (Manual Deploy)

### Problem: HubSpot API 401 Unauthorized

**Ursache**: Access Token abgelaufen oder falsch

**Lösung**:
1. HubSpot → Settings → Private Apps
2. Neues Access Token generieren
3. Render → Environment → `HUBSPOT_ACCESS_TOKEN` aktualisieren
4. Service neu starten

### Problem: Service Worker registriert sich nicht

**Ursache**: HTTPS erforderlich

**Lösung**:
- GitHub Pages nutzt automatisch HTTPS
- Nie HTTP-URLs verwenden
- LocalStorage für Service Worker muss erlaubt sein

---

## 📊 Performance-Optimierung (Optional)

### Backend: Upgrade zu Render Paid Plan

**Vorteile**:
- Kein Cold Start
- Mehr Memory (512 MB → 1 GB)
- Bessere Verfügbarkeit

**Kosten**: $7/Monat

### PWA: CDN für Assets

Assets über CDN ausliefern für schnellere Ladezeiten:

1. Bilder zu [Cloudinary](https://cloudinary.com) hochladen (kostenlos)
2. URLs in HTML/CSS ersetzen
3. Cache-Headers optimieren

### Backend: Redis für Caching

Für häufige HubSpot-Requests:

1. Render → Add Redis (kostenpflichtig)
2. `node-cache` implementieren
3. HubSpot-Responses 24h cachen

---

## 🔐 Sicherheit

### API Keys schützen

- ✅ **Niemals** API Keys in Frontend-Code
- ✅ **Immer** über Backend-Proxy
- ✅ Environment Variables verwenden
- ✅ `.env` in `.gitignore`

### HTTPS erzwingen

GitHub Pages und Render nutzen automatisch HTTPS.

**Zusätzlich**: Content Security Policy (CSP) in HTML:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               connect-src 'self' https://fassadenfix-api.onrender.com;
               img-src 'self' data: blob:;">
```

### Rate Limiting (Backend)

Empfehlung für Production:

```bash
npm install express-rate-limit
```

```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 Monitoring

### Render Dashboard

- Logs: Echtzeit-Logs anschauen
- Metrics: CPU, Memory, Response Time
- Events: Deployments, Restarts

### Browser DevTools

PWA Performance:
1. Chrome DevTools → Application → Service Workers
2. Lighthouse → Performance, PWA, Accessibility
3. Network Tab → Offline-Modus testen

### Uptime Monitoring (Optional)

**Kostenlose Tools**:
- [UptimeRobot](https://uptimerobot.com): Pingt `/api/health` alle 5 Min.
- [StatusCake](https://www.statuscake.com): Erweiterte Monitoring-Features

---

## 🎉 Fertig!

Die App ist jetzt live:

- **PWA**: `https://USERNAME.github.io/fassadenfix-objekterfassung/`
- **Backend**: `https://fassadenfix-api.onrender.com`

### Nächste Schritte

1. **Beta-Testing**: App mit 3-5 FassadenFix-Mitarbeitern testen
2. **Feedback sammeln**: Usability-Probleme identifizieren
3. **Iterieren**: Verbesserungen basierend auf Feedback
4. **Rollout**: App an alle Außendienstler verteilen

### Custom Domain (Optional)

**GitHub Pages**:
```
objekterfassung.fassadenfix.de → GitHub Pages
```

**Render**:
```
api.fassadenfix.de → Render Backend
```

Siehe: [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) und [Render Custom Domains](https://render.com/docs/custom-domains)

---

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues: `https://github.com/USERNAME/fassadenfix-objekterfassung/issues`
- Render Support: `https://render.com/support`

**Viel Erfolg! 🚀**
