# FassadenFix Intranet

SharePoint-basiertes Intranet für die FassadenFix GmbH.

## Struktur

```
FassadenFix Intranet (Hub-Site)
├── Start
├── Unternehmen
│   ├── Unternehmen - Überblick
│   ├── Organisation & Werte
│   └── Arbeitsschutz & Pflichtunterweisungen
├── Abteilungen
│   ├── Anwendungstechnik
│   ├── Verwaltung
│   ├── Vertrieb
│   └── Operative Teams
├── Teams (erweiterbar nach 2-Pizza-Prinzip)
└── Mein Bereich
    ├── Urlaub beantragen
    ├── Krankmeldung
    ├── Meine Aufgaben
    ├── Meine Dokumente
    └── Mein Kalender
```

## Voraussetzungen

- Microsoft 365 Business mit SharePoint Online
- SharePoint Administrator-Rechte
- PowerShell 5.1 oder höher

### PnP PowerShell installieren

```powershell
Install-Module -Name PnP.PowerShell -Scope CurrentUser
```

## Schnellstart

1. Konfiguration anpassen:
   ```
   config/settings.json → Tenant-URL eintragen
   ```

2. Deployment starten:
   ```powershell
   cd scripts
   .\Deploy-Intranet.ps1
   ```

## Skripte

| Skript | Beschreibung |
|--------|--------------|
| `Deploy-Intranet.ps1` | Master-Skript - führt alle Schritte aus |
| `01-Create-HubSite.ps1` | Erstellt Communication Site als Hub |
| `02-Create-Pages.ps1` | Legt Seitenstruktur an |
| `03-Setup-Navigation.ps1` | Konfiguriert Top-Navigation |
| `04-Setup-Permissions.ps1` | Richtet Berechtigungen ein |
| `05-Create-TeamTemplate.ps1` | Erstellt Team-Bereiche |
| `06-Setup-MeinBereich.ps1` | Konfiguriert persönliche Seite |

## Team-Bereich erstellen

Neues Team nach 2-Pizza-Prinzip anlegen:

```powershell
.\05-Create-TeamTemplate.ps1 -TeamName "Fassadenbau Nord"
```

Jedes Team erhält:
- Eigene Seite
- Dokumentenbibliothek
- Aufgabenliste
- Berechtigungsgruppe

## Berechtigungskonzept

| Bereich | Gruppe | Berechtigung |
|---------|--------|--------------|
| Hub-Site | Alle Mitarbeiter | Lesen |
| Abteilungen | Abteilungsgruppe | Lesen/Bearbeiten |
| Teams | Team-Gruppe | Vollzugriff |
| Administration | Besitzer | Vollzugriff |

## Projektstruktur

```
FaFi/
├── README.md
├── SETUP.md
├── config/
│   └── settings.json
├── docs/
│   └── BILDER-ANLEITUNG.md
├── scripts/
│   ├── Deploy-Intranet.ps1
│   ├── 01-Create-HubSite.ps1
│   ├── 02-Create-Pages.ps1
│   ├── 03-Setup-Navigation.ps1
│   ├── 04-Setup-Permissions.ps1
│   ├── 05-Create-TeamTemplate.ps1
│   └── 06-Setup-MeinBereich.ps1
└── templates/
    └── mein-bereich-template.json
```

## Corporate Design

| Element | Wert |
|---------|------|
| **Primarfarbe** | #77BC1F (Pantone 368 C) |
| **Sekundarfarbe** | #4E5758 (Pantone 445 C) |
| **Schriftart** | Raleway Bold |

## Design-Prinzipien

- Schlicht und übersichtlich
- Keine Überfrachtung
- Fokus auf Navigation und Klarheit
- Skalierbar für zukünftige Erweiterungen

## Dokumentation

- [Bilder-Upload-Anleitung](docs/BILDER-ANLEITUNG.md) - Anleitung zum manuellen Hochladen von Bildern in SharePoint
