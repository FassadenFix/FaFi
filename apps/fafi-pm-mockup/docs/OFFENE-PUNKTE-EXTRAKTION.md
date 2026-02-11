# Extraktion aller offenen Punkte aus todo.md

**Stand:** 09. Februar 2026
**Methode:** Systematische Durchsicht aller Zeilen mit `- [ ]`

---

## Sektion 1: Interviews (Zukunft/Backlog) – Zeile 432-433
1. `[ ] Mieter/Bewohner-Portal (separates Portal, nicht Kundenportal) (20h+)` [Backlog]
2. `[ ] Teamleiter-Chat (optional, in App integrierbar) (8h+)` [Backlog]

## Sektion 2: E2E-Test v2 Bugfixes – Zeilen 567-576
3. `[ ] V2-F-006: Header-Datum statisch statt dynamisch`
4. `[ ] V2-F-008: KPI Trend-Prozente bei 0 Werten (+12% obwohl Wert 0)`
5. `[ ] V2-F-019/V2-F-021: Kalender-Popovers gleichzeitig offen`
6. `[ ] V2-F-020: Ende-Kalender startet bei aktuellem Monat statt nach Startdatum`
7. `[ ] V2-F-023: Kalender-Popover Auto-Close nach Datumsauswahl`
8. `[ ] V2-F-025: Terminhinweise fehlen in Zusammenfassung`
9. `[ ] V2-F-028: Beschreibung und Terminhinweise getrennt anzeigen`
10. `[ ] V2-F-043: Fassadenart Pflichtfeld-Validierung im Wizard`
11. `[ ] V2-F-046: Immobilien-Zähler aktualisiert nicht nach Speichern`
12. `[ ] V2-F-053: Immobilie nicht automatisch dem Projekt zugeordnet`

## Sektion 3: E2E-Test v3 Bugfixes – Zeilen 587-594
13. `[ ] V3-S2-F-005: CRITICAL Kalender-Startdatum wird überschrieben`
14. `[ ] V3-S8-F-001: MAJOR KPI "Projekte" zeigt 0 statt 3`
15. `[ ] V3-S8-F-002: MAJOR "+12% vs. Vormonat" bei 0 Werten`
16. `[ ] V3-S9-F-003: MAJOR Einsatzkalender zeigt Einsätze für Zug ohne Mitglieder`
17. `[ ] V3-S3-F-001: OBSERVATION Kontakt anlegen zeigt nur Toast statt Formular`
18. `[ ] V3-S9-F-001: MINOR Einsatzkalender ohne Monatsname/Navigation`
19. `[ ] V3-S13-F-001: MINOR Benachrichtigungs-Badge suggeriert Nachrichten`
20. `[ ] V3-S12-F-001: OBSERVATION Finanzen-Charts zeigen keine Daten`

## Sektion 4: Interview-Analyse Maßnahmenplan – Zeilen 612-662
### PRIO 1 – Sidebar/Navigation
21. `[ ] IA-NAV-01: Sidebar "Erstellen & Erfassen" umbenennen → "Projektmanagement"`
22. `[ ] IA-NAV-02: Doppelte Baustellen-Einträge zusammenführen`
23. `[ ] IA-NAV-03: "Projektvorbereitung" vs. "Planung" zusammenführen`
24. `[ ] IA-NAV-04: "Offene/Überfällige Projekte" als Filter statt Menüpunkte`
25. `[ ] IA-NAV-05: Sidebar-Reihenfolge an 10-Phasen-Workflow`

### PRIO 2 – ObjektaufnahmeWizard Felder
26. `[ ] IA-WIZ-01: Feld "Wer war noch dabei?"`
27. `[ ] IA-WIZ-02: Feld "Wann wird Entscheidung getroffen?"`
28. `[ ] IA-WIZ-03: Feld "Wer trifft die Entscheidung?"`
29. `[ ] IA-WIZ-04: Feld "Besondere Absprache, Infos?"`
30. `[ ] IA-WIZ-05: Feld "Wasseranschluss" pro Seite`
31. `[ ] IA-WIZ-06: Feld "Reinigungsmittelauswahl" pro Seite`
32. `[ ] IA-WIZ-07: Kaufmännische Wizard-Seite als neuen Step`
33. `[ ] IA-WIZ-08: Kaufm. "Welche Seiten sollen ins Angebot?"`
34. `[ ] IA-WIZ-09: Kaufm. "Umsetzungstermin" (KO-Termine)`
35. `[ ] IA-WIZ-10: Kaufm. "Kann Wohnung gestellt werden?"`
36. `[ ] IA-WIZ-11: Kaufm. "Kennenlern-Angebot?"`
37. `[ ] IA-WIZ-12: Kaufm. "Frühbucher-Rabatt?"`
38. `[ ] IA-WIZ-13: Kaufm. "Einkaufsgemeinschaft?"`
39. `[ ] IA-WIZ-14: Kaufm. "Marketinggeeignet?"`

### PRIO 3 – Angebots-Workflow
40. `[ ] IA-ANG-01: Button "Angebot erstellen" in ProjektDetail`
41. `[ ] IA-ANG-02: Doppeleingabe eliminieren – Daten aus Objektaufnahme übernehmen`

### PRIO 4 – Baustellen
42. `[ ] IA-BAU-01: Desktop vs. Mobile klar differenzieren`
43. `[ ] IA-BAU-02: Abschlussfrage MORGENS UND ABENDS`
44. `[ ] IA-BAU-03: Teamstruktur 4 Personen abbilden`
45. `[ ] IA-BAU-04: Teamleiter bekommt Projekt zugewiesen`

### PRIO 5 – Kundenportal
46. `[ ] IA-KP-01: Startseite direkt in Detailansicht`

### PRIO 6 – Konzeptionell
47. `[ ] IA-IMM-01: Immobilie als eigenständiges Asset dokumentieren`
48. `[ ] IA-IMM-02: Projekte als zentraler Einstiegspunkt dokumentieren`

## Sektion 5: Intentionsbasierter Maßnahmenplan – Zeilen 684-750
### Block A: Immobilie als Asset
49. `[ ] A1-01: companyId-Feld erweitern`
50. `[ ] A1-02: M:N-Zwischentabelle projectProperties`
51. `[ ] A1-03: Immobilien-Liste: Eigentümer + Projekte anzeigen`
52. `[ ] A1-04: Immobilien-Detail: Projekt-Historie`
53. `[ ] A1-05: Garantieurkunde an Immobilie gebunden`

### Block B.1: Stammdaten WER
54. `[ ] B1-01: "Wer war noch dabei?"`
55. `[ ] B1-02: "Wann wird Entscheidung getroffen?"`
56. `[ ] B1-03: "Wer trifft die Entscheidung?"`
57. `[ ] B1-04: "Besondere Absprache, Infos?"`

### Block B.2: Technisch WAS
58. `[ ] B2-01: "Wasseranschluss" pro Seite`
59. `[ ] B2-02: "Reinigungsmittelauswahl" pro Seite`

### Block B.3: Kaufmännisch WIE
60. `[ ] B3-01: Kaufmännische Wizard-Seite`
61. `[ ] B3-02: "Welche Seiten ins Angebot?"`
62. `[ ] B3-03: "Umsetzungstermin" (KO-Termine)`
63. `[ ] B3-04: "Kann Wohnung gestellt werden?"`
64. `[ ] B3-05: "Kennenlern-Angebot?"`
65. `[ ] B3-06: "Frühbucher-Rabatt?"`
66. `[ ] B3-07: "Einkaufsgemeinschaft?"`
67. `[ ] B3-08: "Marketinggeeignet?"`

### Block B.4: Datenfluss
68. `[ ] B4-01: AngebotWizard Daten aus Objektaufnahme übernehmen`
69. `[ ] B4-02: Button "Angebot erstellen" in ProjektDetail`

### Block C: Baustelle
70. `[ ] C-01: Desktop vs. Mobile differenzieren`
71. `[ ] C-02: Vorher-Doku als Gate`
72. `[ ] C-03: Abschlussfrage MORGENS UND ABENDS`
73. `[ ] C-04: Teamstruktur 4 Personen`
74. `[ ] C-05: Teamleiter bekommt Projekt`
75. `[ ] C-06: Ereignismelder Floating Action Button`
76. `[ ] C-07: Doppelte Baustellen-Einträge zusammenführen`

### Block D: Kundenportal
77. `[ ] D-01: Startseite direkt Detailansicht`
78. `[ ] D-02: Ampel-System ins Portal`
79. `[ ] D-03: Jede Baustelle mit Ampel`
80. `[ ] D-04: Aufgaben Verantwortungsseite`
81. `[ ] D-05: Dokumente 3 Ebenen`

### Block E: Navigation
82. `[ ] E-01: "Erstellen & Erfassen" umbenennen`
83. `[ ] E-02: Filter statt Menüpunkte`
84. `[ ] E-03: Sidebar-Reihenfolge Workflow`
85. `[ ] E-04: Projektvorbereitung/Planung zusammenführen`
86. `[ ] E-05: CRM hierarchische Ansicht`

### Block F: Preislogik
87. `[ ] F-01: Frühbucher dynamisch berechnen`
88. `[ ] F-02: Übernachtung automatisch vorschlagen`

### Block G: Korrekturen
89. `[ ] G-01: "Eingangsseite" → "Frontseite" global`

## Sektion 6: E2E-Test v4 Findings – Zeilen 776-799
### PRIO 1: Gates
90. `[ ] V4-GATE-01: Angebots-Wizard blockiert bei 0 Immobilien`
91. `[ ] V4-GATE-02: "Arbeitstag beginnen" Gate-Button`
92. `[ ] V4-GATE-03: Kontextabhängiger "Nächster Schritt"`
93. `[ ] V4-GATE-04: Baustellenmanager-Route /mobile`
94. `[ ] V4-GATE-05: Automatische Immobilien-Zuordnung`

### PRIO 2: Kern-Features
95. `[ ] V4-FEAT-01: Kaufmännische Wizard-Seite`
96. `[ ] V4-FEAT-02: Ampel-System im Kundenportal`
97. `[ ] V4-FEAT-03: Dashboard-KPIs korrigieren`
98. `[ ] V4-FEAT-04: Fotodokumentation funktional`
99. `[ ] V4-FEAT-05: Kundenportal Projekte ab Phase 1`

### PRIO 3: Navigation
100. `[ ] V4-NAV-01: Sidebar umbenennen`
101. `[ ] V4-NAV-02: Doppelte Baustellen zusammenführen`
102. `[ ] V4-NAV-03: Konsistente Benennung`
103. `[ ] V4-NAV-04: Filter statt Sidebar-Sektion`
104. `[ ] V4-NAV-05: Duplikat-Erkennung Immobilien`
105. `[ ] V4-NAV-06: Header-Datum dynamisieren`
106. `[ ] V4-NAV-07: "Hauptkontakte" KPI entfernen/definieren`
107. `[ ] V4-NAV-08: Sidebar-Reihenfolge Workflow`
108. `[ ] V4-NAV-09: Morgen/Abend-Workflow Baustellenmanager`
109. `[ ] V4-NAV-10: Immobilien-Entwurf-Duplikate bereinigen`

---

## DUPLIKAT-ANALYSE

Die folgenden Punkte tauchen in mehreren Sektionen auf und müssen konsolidiert werden:

### Duplikat-Cluster 1: Sidebar "Erstellen & Erfassen" umbenennen
- IA-NAV-01 (Sektion 4) = E-01 (Sektion 5) = V4-NAV-01 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 2: Doppelte Baustellen-Einträge zusammenführen
- IA-NAV-02 (Sektion 4) = C-07 (Sektion 5) = V4-NAV-02 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 3: Sidebar-Reihenfolge an Workflow
- IA-NAV-05 (Sektion 4) = E-03 (Sektion 5) = V4-NAV-08 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 4: Filter statt Menüpunkte
- IA-NAV-04 (Sektion 4) = E-02 (Sektion 5) = V4-NAV-04 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 5: Projektvorbereitung/Planung zusammenführen
- IA-NAV-03 (Sektion 4) = E-04 (Sektion 5)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 6: ObjektaufnahmeWizard Stammdaten-Felder
- IA-WIZ-01..04 (Sektion 4) = B1-01..04 (Sektion 5)
→ **4 konsolidierte Punkte**

### Duplikat-Cluster 7: Technische Felder pro Seite
- IA-WIZ-05..06 (Sektion 4) = B2-01..02 (Sektion 5)
→ **2 konsolidierte Punkte**

### Duplikat-Cluster 8: Kaufmännische Wizard-Seite
- IA-WIZ-07..14 (Sektion 4) = B3-01..08 (Sektion 5) = V4-FEAT-01 (Sektion 6)
→ **8 konsolidierte Punkte** (1 Wizard-Seite + 7 Felder)

### Duplikat-Cluster 9: Angebot aus ProjektDetail + Datenfluss
- IA-ANG-01 (Sektion 4) = B4-02 (Sektion 5)
- IA-ANG-02 (Sektion 4) = B4-01 (Sektion 5)
→ **2 konsolidierte Punkte**

### Duplikat-Cluster 10: Desktop vs. Mobile Baustelle
- IA-BAU-01 (Sektion 4) = C-01 (Sektion 5)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 11: Morgen/Abend-Frage
- IA-BAU-02 (Sektion 4) = C-03 (Sektion 5) = V4-NAV-09 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 12: Teamstruktur
- IA-BAU-03 (Sektion 4) = C-04 (Sektion 5)
- IA-BAU-04 (Sektion 4) = C-05 (Sektion 5)
→ **2 konsolidierte Punkte**

### Duplikat-Cluster 13: Kundenportal Startseite
- IA-KP-01 (Sektion 4) = D-01 (Sektion 5)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 14: Ampel-System Portal
- V4-FEAT-02 (Sektion 6) = D-02 + D-03 (Sektion 5)
→ **2 konsolidierte Punkte** (System + pro Baustelle)

### Duplikat-Cluster 15: Dashboard-KPIs
- V2-F-008 (Sektion 2) = V3-S8-F-001 + V3-S8-F-002 (Sektion 3) = V4-FEAT-03 (Sektion 6)
→ **1 konsolidierter Punkt** (KPIs korrigieren)

### Duplikat-Cluster 16: Header-Datum
- V2-F-006 (Sektion 2) = V4-NAV-06 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 17: Kalender-Bug
- V2-F-019/021/023 (Sektion 2) = V3-S2-F-005 (Sektion 3)
→ **1 konsolidierter Punkt** (Kalender-Popover komplett fixen)

### Duplikat-Cluster 18: Immobilien-Zuordnung
- V2-F-053 (Sektion 2) = V4-GATE-05 (Sektion 6)
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 19: Baustellenmanager-Route
- V4-GATE-04 (Sektion 6) = IA-BAU-01 (Sektion 4) teilweise
→ **1 konsolidierter Punkt**

### Duplikat-Cluster 20: Konzeptionelle Dokumentation
- IA-IMM-01 + IA-IMM-02 (Sektion 4) ≈ A1-01..05 (Sektion 5) – Überlappung Konzept vs. Implementierung
→ Konzept-Doku als Vorstufe, Implementierung als Umsetzung → **beide behalten, aber sequenziell**

### Duplikat-Cluster 21: "Eingangsseite" → "Frontseite"
- G-01 (Sektion 5) – steht nur einmal, kein Duplikat
→ **1 Punkt**

---

## KONSOLIDIERTE ZÄHLUNG

| Kategorie | Roh-Punkte | Duplikate | Konsolidiert |
|---|---|---|---|
| Backlog (Zukunft) | 2 | 0 | 2 |
| E2E-Test v2 Bugs | 10 | 4 | 6 |
| E2E-Test v3 Bugs | 8 | 2 | 6 |
| Interview-Analyse (IA-*) | 28 | 28 | 0 (alle in Intentions-Blöcken) |
| Intentionsbasiert (A-G) | 41 | 0 | 41 (Referenz-Satz) |
| E2E-Test v4 (V4-*) | 20 | 12 | 8 |
| **GESAMT ROH** | **109** | **46** | **63 einzigartige Punkte** |

---

## ZUSAMMENFASSUNG

**109 offene Roh-Punkte** in der todo.md, davon **46 Duplikate** über verschiedene Sektionen hinweg.
**63 einzigartige, konsolidierte Punkte** bleiben übrig für den Abarbeitungsplan.
