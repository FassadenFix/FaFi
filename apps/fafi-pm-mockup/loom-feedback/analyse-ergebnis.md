# Loom-Feedback Analyse-Ergebnis

## Aktueller Stand

### KW-1: Immobilienauswahl im Angebotswizard
**Status: Teilweise bereits implementiert!**

Der Angebotswizard hat bereits 5 Schritte:
1. **Projekt** (Unternehmen, Ansprechpartner, Projekt auswählen) ✅
2. **Immobilien & Seiten** (ImmobilienSeitenAuswahlStep) ✅ 
3. **Kalkulation** ✅
4. **Rabatt & Konditionen** ✅
5. **Zusammenfassung** ✅

**Was fehlt (Loom-Feedback):**
- Die Immobilien in Schritt 2 kommen NUR aus dem ausgewählten Projekt (`immobilienAusProjekt = selectedProjekt?.immobilien || []`)
- Wenn kein Projekt ausgewählt → leere Liste, kein Fallback
- Es fehlt: Fallback auf Unternehmens-Immobilien (alle Projekte des Unternehmens)
- Es fehlt: Möglichkeit, aus ALLEN Immobilien auszuwählen
- Die Vorauswahl-Logik (Projekt-Immobilien vorausgewählt) existiert bereits via useEffect

**Lösung:**
- `immobilienAusProjekt` erweitern: Wenn Projekt ausgewählt → dessen Immobilien (vorausgewählt)
- Wenn kein Projekt, aber Unternehmen → alle Immobilien aller Projekte des Unternehmens
- Button "Aus allen Immobilien auswählen" → tRPC-Query auf property.list
- Backend: getCompaniesForOfferWizard liefert bereits Immobilien pro Projekt

### KW-2: Bidirektionale Zuordnungen
**Status: Teilweise implementiert**

| Richtung | Status | Details |
|----------|--------|---------|
| Immobilie → Projekt | ✅ | Badge mit Link in Immobilien.tsx |
| Immobilie → Baustelle | ✅ | Badge in Immobilien.tsx |
| Immobilie → Unternehmen | ❌ | Fehlt komplett |
| Immobilie → Angebote | ❌ | Fehlt komplett |
| Projekt → Immobilien | ✅ | Tab in ProjektDetail.tsx |
| Projekt → Angebote | ✅ | Tab in ProjektDetail.tsx |
| Unternehmen → Immobilien | ❌ | Fehlt in Kontakte.tsx |
| Angebot → Immobilien | ❌ | Fehlt in Angebote.tsx |

### KW-3: An-/Abfahrt aus Bibliothek
**Status: Hardcodiert**

- FESTPREISE.anfahrtRegional = 45€ und FESTPREISE.anfahrtProKm = 0.85€ sind hardcodiert
- Keine Bibliotheks-Tabelle für An-/Abfahrt vorhanden
- libraryServices hat serviceType-Enum: hauptleistung, zusatzleistung, garantie, wartung, inspektion
- An-/Abfahrt passt NICHT in die bestehenden Bibliotheks-Kategorien
- Lösung: Neuen Eintrag in libraryServices als "zusatzleistung" mit pricingUnit "pro km" und "pauschal" anlegen
- ODER: FESTPREISE in Bibliothek-Tabelle auslagern (neuer Typ "festpreis" oder "logistik")
