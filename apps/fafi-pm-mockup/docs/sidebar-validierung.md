# Sidebar-Navigation Validierung (09.02.2026)

## Aktuelle Struktur (nach Sprint 3 Umstrukturierung)

| Sektion | Items | Sichtbar für |
|---|---|---|
| **PROJEKTMANAGEMENT** | Dashboard, Projekte, Immobilien, Baustellen | Alle |
| **KUNDENBERATUNG** | Unternehmen & Kontakte, Angebote, Aufträge, Garantien & Inspektionen | GF, KB, Büro |
| **PLANUNG & EINSATZ** | Terminfinder, Einsatzplanung, Ressourcenplaner | GF, KB, PL |
| **DURCHFÜHRUNG** | Teamleitercheck, Baustellenmanager, Auswertung & Abschluss | GF, AT-L, PL |
| **FINANZEN** | Finanzübersicht, Rechnungen, Zahlungen, Budgets | GF, Büro |
| **KUNDENPORTAL** | Portal-Übersicht, Dokumente teilen, Kundenmeldungen | GF, KB |
| **UNTERNEHMENSSYSTEM** | Archiv, Vorlagen & Textbausteine, Materialien & Geräte, Bibliothek | GF, Büro |
| **SYSTEM & EINSTELLUNGEN** | Mitarbeiter, HubSpot, Spracheingabe, Einstellungen | GF |

## Validierungsergebnis

### Positiv
- Keine Duplikate mehr (Baustellen + Baustellenmanager klar getrennt: Verwaltung vs. Vor-Ort)
- Workflow-Reihenfolge stimmt: Projektmanagement → Kundenberatung → Planung → Durchführung → Abschluss
- "Erstellen & Erfassen" erfolgreich umbenannt zu "Projektmanagement"
- "Offene/Überfällige Projekte" als Filter in Projekte-Seite integriert (nicht mehr als eigene Menüpunkte)
- Rollenbasierte Sichtbarkeit funktioniert korrekt

### Verbesserungspotenzial
- Dashboard-KPIs zeigen korrekte Zahlen (4 Projekte, 0 Baustellen, 2 Aufgaben)
- Datum dynamisch: "09. Feb 2026" korrekt
- Benutzername "Alexander" korrekt angezeigt
