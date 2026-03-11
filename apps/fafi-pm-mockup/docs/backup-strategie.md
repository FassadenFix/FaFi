# FaFi PM – Backup-Strategie

## Übersicht

Dieses Dokument beschreibt die Backup-Strategie für die FaFi PM Projektmanagement-Software.

## 1. Datenbank (TiDB/MySQL)

### Automatische Backups
- **Häufigkeit:** Täglich um 02:00 Uhr UTC
- **Aufbewahrung:** 30 Tage rollierend
- **Methode:** `mysqldump` mit `--single-transaction` für konsistente Snapshots
- **Speicherort:** S3-Bucket (separater Backup-Bucket)

### Backup-Umfang
- Alle Tabellen inkl. Schema
- Indizes und Constraints
- Stored Procedures (falls vorhanden)

### Wiederherstellung
1. Backup-Datei aus S3 herunterladen
2. `mysql -u root -p < backup_YYYY-MM-DD.sql`
3. Migrations erneut ausführen: `pnpm db:push`

## 2. Datei-Storage (S3)

### Automatische Replikation
- S3-Bucket mit Versionierung aktiviert
- Cross-Region-Replikation empfohlen für Produktionsumgebung
- Lifecycle-Regeln: Alte Versionen nach 90 Tagen in Glacier

### Kritische Dateien
- Fotos (Vorher/Nachher-Dokumentation) – versicherungsrelevant
- PDF-Dokumente (Angebote, Rechnungen, Garantien)
- Bautagebücher

## 3. Anwendungscode

### Git-basiert
- Alle Änderungen über Git versioniert
- Manus Checkpoint-System für Deployment-Snapshots
- GitHub-Export für externe Sicherung

## 4. Konfiguration & Secrets

### Umgebungsvariablen
- Über Manus Secret Management verwaltet
- Dokumentiert in `webdev_request_secrets`
- Keine Secrets im Code oder `.env`-Dateien

## 5. Monitoring der Backups

### Health-Check
- `/api/health` Endpoint prüft DB-Verbindung
- Performance-Metriken über `performanceMonitor.ts`
- Rate-Limit-Status über `rateLimiter.ts`

### Alerting (empfohlen für Produktion)
- DB-Verbindungsfehler → Sofortige Benachrichtigung
- Backup-Fehler → E-Mail an Admin
- Speicherplatz < 10% → Warnung

## 6. Disaster Recovery

### RTO (Recovery Time Objective)
- **Ziel:** < 4 Stunden
- DB-Wiederherstellung: ~30 Minuten
- S3-Dateien: Sofort verfügbar (Versionierung)
- Anwendung: Manus Rollback-Checkpoint

### RPO (Recovery Point Objective)
- **Ziel:** < 24 Stunden (tägliches Backup)
- Für kritische Daten: Echtzeit-Replikation empfohlen

## 7. Verantwortlichkeiten

| Bereich | Verantwortlich | Häufigkeit |
|---------|---------------|------------|
| DB-Backup | Automatisiert / Admin | Täglich |
| S3-Versionierung | AWS/Manus | Automatisch |
| Code-Backup | Git/GitHub | Bei jedem Commit |
| Backup-Test | Admin | Monatlich |
| DR-Test | Team | Quartalsweise |
