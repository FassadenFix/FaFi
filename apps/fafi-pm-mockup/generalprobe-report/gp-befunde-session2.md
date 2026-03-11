# Generalprobe Session 2 – E2E-Befunde

## Datum: 11. Februar 2026

## 1. Dashboard (/)
- **Status: FUNKTIONIERT** – Willkommen-Banner mit Datum, KPIs laden korrekt
- KPIs: 0 Offene Angebote, 4 Projekte, 0 Aktive Baustellen, 2 Offene Aufgaben (2 dringend)
- Nächste Schritte: 4 Projekte mit korrekten Phasen und nächsten Aktionen
- Projekte nach Phase: Kanban-Board mit Drag & Drop
- Countdown-Aufgaben: 2 dringend (Angebot prüfen, Angebot versenden)
- Meine Aufgaben: 2 Aufgaben, 1 überfällig
- Letzte Aktivitäten: Chronologisch korrekt
- Schnellaktionen: 4 Buttons vorhanden
- HubSpot Sync: Verbunden, Hub ID 26519608, 1000+ Unternehmen/Kontakte/Deals

## 2. HR-Bereich
- **HR Dashboard (/hr): FUNKTIONIERT** – 30 Mitarbeiter, 113 Dokumente, Statistiken korrekt
- **HR Mitarbeiterliste (/hr/mitarbeiter): FUNKTIONIERT** – Alle 30 Mitarbeiter mit korrekten Daten
- **HR Mitarbeiter-Detail: ZU PRÜFEN** – Seite lädt, aber möglicherweise leere Anzeige (Skeleton-Loading)

## 3. Tests
- **1033 Tests bestanden** (48 Testdateien, 0 Fehler)
- **TypeScript: 0 Fehler**
- **Server: Läuft stabil** seit 18:36 Uhr ohne Fehler

## 4. Bibliothek (/bibliothek) - FUNKTIONIERT mit Hinweis
- 4 Kategorien: Lager & Fuhrpark (47), Marketing & Vertrieb (24), Leistungen & Technik (24), HR & Personal (17)
- Fahrzeuge-Tab: 9 echte Fahrzeuge + 12 Test-Toggle-Vehicle (Testdaten-Reste aus Vitest)
- **BEFUND: 12 "Test-Toggle-Vehicle" Einträge** sollten vor Veröffentlichung bereinigt werden
- Bühnentechnik, Reinigungsmittel: Korrekt befüllt

## 5. Unternehmen & Kontakte (/kontakte) - FUNKTIONIERT
- Hierarchische Ansicht und Alle-Kontakte-Tab vorhanden
- Neues Unternehmen / Neuer Kontakt Buttons funktionieren
- **HINWEIS: Sidebar-Link zeigt "/kontakte" korrekt, nicht "/unternehmen"**

## 6. Projekte (/projekte) - FUNKTIONIERT
- 4 Projekte angezeigt mit korrekten Phasen-Badges
- KPIs: 4 Gesamt, 0 In Bearbeitung, 1 Angebote, 0 Abgeschlossen
- Suche, Phasen-Filter, Sortierung vorhanden

## 7. Angebote (/angebote) - FUNKTIONIERT
- Seite lädt korrekt, KPIs und Suchfunktion vorhanden
- "Neues Angebot" Button vorhanden

## 8. HR Mitarbeiter-Detail (/hr/mitarbeiter/19) - FUNKTIONIERT
- Alexander Retzlaff: Alle Stammdaten korrekt (GF, Zentrale, 40h, Personio-ID 27328007)
- Tabs: Stammdaten, Vergütung, Dokumente (0)
- Eintrittsdatum 01.12.2008, Probezeit-Ende 31.05.2009 korrekt

## 9. Dashboard (/) - FUNKTIONIERT
- Hero-Banner mit Datum korrekt
- KPIs: Offene Angebote (0/1), Projekte (4), Aktive Baustellen (0), Offene Aufgaben (2 dringend)
- Conversion-Rate, Rechnungen, Umsatz, Garantien angezeigt
- "Nächste Schritte" zeigt alle 4 Projekte mit nächsten Aktionen
- Kanban-Board: 1 Projekt in "Angebot"
- Countdown-Aufgaben: 2 dringend (1 überfällig)
- Letzte Aktivitäten: "Test User" Einträge (aus Vitest-Runs)
- HubSpot Sync: Verbunden (Hub ID: 26519608, 1000+ Unternehmen/Kontakte/Deals)
- **BEFUND: "Test User" in Aktivitäten** - Testdaten-Reste aus Vitest

## 10. Baustellen (/baustellen) - FUNKTIONIERT
- 0 Baustellen (korrekt, da keine Projekte in Durchführung)
- Suche, Status-Filter, "Neue Baustelle" Button vorhanden
- Empty State korrekt dargestellt

## 11. Einstellungen (/einstellungen) - FUNKTIONIERT
- 6 Tabs: Profil, System, Benachrichtigungen, Integrationen, Sicherheit, Backup
- Profil: Alexander Retzlaff, Administrator, korrekte Daten
- Passwort-Änderung vorhanden

## 12. Finanzen (/finanzen) - FUNKTIONIERT
- KPIs: 3.10 Mio € Umsatz, 2.21 Mio € Kosten, 884 T€ Gewinn, 29% Marge
- Charts: Umsatzentwicklung, Quartalsvergleich
- 4 Tabs: Umsatzentwicklung, Kostenverteilung, Projektrentabilität, Zahlungsstatus
- Export: Excel + PDF Buttons

## 13. Berichtswesen (/berichte) - FUNKTIONIERT
- KPIs: 1.25 Mio € Umsatz, 28 Projekte, 77% Conversion, 115.000 m²
- 4 Tabs: Umsatz, Conversion, Projekte, Mitarbeiter
- Export: Excel + PDF-Bericht

## 14. Kundenportal (/kundenportal) - FUNKTIONIERT
- Hero-Banner mit Willkommenstext
- KPIs: 4 Projekte, 0 Garantien, 230 Dokumente
- 6 Tabs: Meine Projekte, Garantien, Dokumente, Aufgaben, Kontakt, Feedback
- Aktuelles Projekt "test projektroding" korrekt angezeigt

## 15. Testdaten-Bereinigung
- 24 Test-Einträge aus Vitest (Test-Toggle-Vehicle, Test-Toggle-Equipment, Test-Toggle-Discount) aus DB gelöscht
- Bibliothek zeigt jetzt nur echte Stammdaten (23 Lager, 12 Marketing, 24 Leistungen, 17 HR)
- **OFFEN: "Test User" Aktivitäten im Dashboard bereinigen**
