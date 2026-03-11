# Analyse: Datenfluss Immobilien → Projekte → Angebote → Aufträge → Baustellen

## IST-Zustand (Schema-Analyse)

### Vorhandene Tabellen und Verknüpfungen
1. **properties** → projectId (1:N), companyId (Eigentümer)
2. **projectProperties** → M:N Zwischentabelle (projectId, propertyId)
3. **offers** → projectId, companyId, contactId, positions (JSON mit propertyId + Seiten)
4. **orders** → projectId, offerId, companyId, contactId
5. **constructionSites** → projectId (KEIN offerId/orderId!)
6. **tasks** → projectId, constructionSiteId, responsibleParty (AG/AN)

### Fehlende Verknüpfungen
- **constructionSites** hat KEIN `orderId` → Baustelle kann nicht auf Auftrag zurückgeführt werden
- **constructionSites** hat KEIN `offerId` → Seiten/Konditionen aus Angebot nicht verfügbar
- **orders** hat KEINE `positions` → Auftragsdetails (welche Seiten, welche Immobilien) fehlen
- **Keine automatische Aufgaben-Generierung** aus Angebots-Besonderheiten

### Was fehlt für den gewünschten Datenfluss

#### Schema-Erweiterungen nötig:
1. `orders.positions` (JSON) → Übernimmt Positionen aus Angebot (welche Immobilien, welche Seiten, Flächen, Preise)
2. `orders.specialConditions` (JSON) → Besonderheiten die Aufgaben generieren (Grünschnitt, Sperrungen etc.)
3. `constructionSites.orderId` → Verknüpfung zum Auftrag
4. `constructionSites.offerId` → Verknüpfung zum Angebot (für Seiten-Details)
5. Automatische Task-Generierung aus Auftrags-Besonderheiten mit AG/AN-Zuordnung

#### Frontend-Erweiterungen nötig:
1. **Immobilien-Detailansicht**: Bearbeitungsmodus für alle Felder
2. **Baustellen-Detailansicht**: Bearbeitungsmodus + Auftrags-Daten anzeigen
3. **Projekt-Detail**: Immobilien hinzufügen/entfernen
4. **Angebot-Wizard**: Immobilien aus Projekt vorauswählen
5. **Baustellen-Erstellung**: Aus bestätigtem Auftrag mit automatischer Aufgaben-Generierung
