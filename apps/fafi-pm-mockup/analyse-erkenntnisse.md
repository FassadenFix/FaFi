# FaFi PM Analyse-Erkenntnisse

## 1. Seiten-Status (DB vs. Mock)

### Voll DB-angebunden (20 Seiten):
- Dashboard, Projekte, ProjektDetail, Immobilien, Baustellen, Angebote, Auftraege, AuftragDetail
- Kontakte, Rechnungen, RechnungDetail, Zahlungen, Budgets, Garantien, GarantieDetail
- Team, Terminfinder, Archiv, Kundenmeldungen, BaustellenOffen/Ueberfaellig, ProjekteOffen/Ueberfaellig

### Rein Mock-basiert (11 Seiten):
- MobileApp (Baustellenmanager), Teamleitercheck, Einsatzplanung, Ressourcen
- Berichtswesen, Finanzen, Dokumente, Bibliothek, Verzeichnisse
- HubSpotIntegration, Kundenportal, PDFEntwuerfe

### Statisch/Platzhalter (5 Seiten):
- Benachrichtigungen, Einstellungen, Sprachsteuerung, Login, Home

## 2. Workflow-Analyse: Phasenübergänge

### Automatische Phasenübergänge:
- ProjektWizard → setzt Phase auf "objektaufnahme" ✅
- saveFromWizard (Angebot) → setzt Phase NICHT automatisch auf "angebot_erstellt" ❌ BRUCH
- sendOffer (E-Mail) → setzt Phase NICHT auf "angebot_versendet" ❌ BRUCH
- Kein automatischer Übergang angebot_versendet → nachfassen (nach X Tagen) ❌ BRUCH
- acceptFromOffer → setzt Phase auf "auftrag_gewonnen" ✅
- acceptFromOffer → erstellt Auftrag, Baustelle, 6 Standardaufgaben ✅
- completeWithAcceptance → setzt Phase auf "abgeschlossen" (oder "abnahme" bei Mängeln) ✅
- Kein automatischer Übergang auftrag_gewonnen → planung → vorbereitung → durchfuehrung ❌ BRUCH

### Manuelle Phasenänderung:
- project.update erlaubt beliebige Phasenänderung ohne Validierung ❌ BRUCH
- Keine Prüfung ob Voraussetzungen für nächste Phase erfüllt sind ❌ BRUCH

## 3. Fehlende Workflow-Verbindungen

### Objektaufnahme → Angebot:
- ObjektaufnahmeWizard erstellt Property, aber verknüpft nicht automatisch mit Angebot
- Kein "Angebot aus Objektaufnahme erstellen"-Button
- AngebotWizard lädt Immobilien, aber der Übergang ist nicht geführt

### Angebot → Auftrag:
- AuftragAnnahmeWizard existiert und ist gut implementiert
- ABER: Kein automatischer Phasenübergang nach Angebotserstellung/-versand

### Auftrag → Baustelle → Durchführung:
- Baustelle wird automatisch bei Auftragsannahme erstellt ✅
- ABER: Kein Workflow für Vorher-Dokumentation als Pflicht vor Baustellenstart ❌
- ABER: Kein Tagesablauf (Morgen-/Abendmeldung, Ereignismelder) ❌
- MobileApp ist komplett Mock-basiert ❌

### Durchführung → Abnahme:
- AbnahmeWizard existiert mit Protokoll, Bewertung, Folgeschritten ✅
- Erstellt automatisch Rechnung und Garantie ✅
- ABER: Keine Nachher-Dokumentation als Pflicht vor Abnahme ❌

### Abnahme → Rechnung:
- Rechnung wird automatisch bei Abnahme erstellt ✅
- RechnungDetail hat Mahnwesen ✅
- ABER: Kein automatischer Mahnlauf (zeitgesteuert) ❌

## 4. Benutzerführung - Probleme

### Kein geführter Workflow:
- Dashboard zeigt Schnellaktionen, aber kein "Nächster Schritt" für bestehende Projekte
- ProjektDetail hat "Status ändern" Button der nur Toast zeigt
- Keine visuelle Anzeige "Was muss als nächstes getan werden?"
- Keine Aufgaben-Übersicht die zeigt welche Aufgaben überfällig sind

### Fehlende Verknüpfungen:
- Von ProjektDetail kein direkter Link zu "Angebot erstellen für dieses Projekt"
- Von Angebote kein direkter Link zu "Auftrag annehmen"
- Von Baustelle kein Link zu "Abnahme starten"

### Inkonsistente Navigation:
- Sidebar hat Sektionen (Erstellen, Kundenberatung, Planung, Umsetzung, etc.)
- Aber der Workflow-Fluss folgt nicht der Sidebar-Reihenfolge
- Nutzer muss selbst wissen welche Seite als nächstes relevant ist

## 5. Datenbank-Schema Probleme

### Fehlende Tabellen:
- Keine Tabelle für Vorher/Nachher-Dokumentation
- Keine Tabelle für Tagesberichte/Morgenmeldungen/Abendmeldungen
- Keine Tabelle für Ereignismeldungen auf der Baustelle
- Keine Tabelle für Witterungsdaten (3x täglich)

### Schema-Inkonsistenzen:
- offers.status hat "obsolet" ✅ (kürzlich hinzugefügt)
- properties.isDraft ✅ (kürzlich hinzugefügt)
- Aber: Kein Feld für "Vorher-Dokumentation abgeschlossen" bei constructionSites

## 6. E-Mail-Service
- sendOfferEmail existiert aber ist simuliert (kein echter SMTP/Graph API)
- Setzt Angebots-Status NICHT auf "versendet"
- Setzt Projekt-Phase NICHT auf "angebot_versendet"
- Kein E-Mail-Verlauf in der Aktivitätshistorie (nur Aktivitätslog)

## 7. HubSpot-Integration
- Sync-Funktionen existieren (Unternehmen, Kontakte, Deals)
- Bidirektional: acceptFromOffer aktualisiert HubSpot-Deal ✅
- completeWithAcceptance erstellt HubSpot-Engagement ✅
- ABER: Kein automatischer Sync-Job (nur manuell) ❌
- ABER: HubSpotIntegration-Seite ist Mock-basiert ❌
