# FaFi PM – Deployment-Prozess

## Übersicht

FaFi PM wird über das Manus-Hosting-System deployed. Dieses Dokument beschreibt den Prozess.

## 1. Voraussetzungen

### Umgebungsvariablen (über Manus Secrets)
- `DATABASE_URL` – TiDB/MySQL Verbindungsstring
- `JWT_SECRET` – Session-Cookie-Signierung
- `VITE_APP_ID` – Manus OAuth App ID
- `OAUTH_SERVER_URL` – OAuth Backend URL
- HubSpot API Key (optional)
- Microsoft 365 Azure App Credentials (optional)

### Build-Anforderungen
- Node.js 22+
- pnpm
- TypeScript 5.9+

## 2. Build-Prozess

```bash
# Dependencies installieren
pnpm install

# TypeScript-Check
npx tsc --noEmit

# Tests ausführen
pnpm test

# Build
pnpm build
```

## 3. Deployment-Schritte

### Über Manus UI
1. Checkpoint erstellen: `webdev_save_checkpoint`
2. "Publish" Button in der Manus Management UI klicken
3. Deployment wird automatisch durchgeführt

### Datenbank-Migration
```bash
pnpm db:push
```

## 4. Post-Deployment-Checks

1. `/api/health` Endpoint prüfen
2. Login-Flow testen
3. Dashboard-KPIs verifizieren
4. HubSpot-Sync prüfen (falls konfiguriert)

## 5. Rollback

### Über Manus UI
- Ältere Checkpoints in der Management UI auswählen
- "Rollback" Button klicken

### Manuell
- `webdev_rollback_checkpoint` mit Version-ID

## 6. Monitoring nach Deployment

- Health-Check: `GET /api/health`
- Performance-Metriken im Health-Check Response
- Browser-Console auf Fehler prüfen
- Server-Logs in `.manus-logs/devserver.log`
