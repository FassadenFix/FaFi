# Generalprobe – E2E-Realdaten-Tests (11.02.2026)

## Testdaten-Szenario
**Fiktiver Kunde:** Hausverwaltung Grünberg & Partner GmbH
**Ansprechpartner:** Dr. Hans-Peter Müller-Hohenstein
**Projekt:** Wohnanlage „Am Stadtpark" – 6 Mehrfamilienhäuser, Fassadenreinigung
**Adresse:** Am Alten Botanischen Garten 15/2, 04103 Leipzig

---

## Befunde

| Nr | Workflow | Seite | Befund | Schwere | Status |
|----|----------|-------|--------|---------|--------|

| 1 | Kontakte-Übersicht | /kontakte | KPI-Karten laden korrekt: 2799 Unternehmen, 5220 Kontakte, 0 Entscheider. Verwaist-Tab (941) sichtbar. Warnung korrekt. Initial kurz Skeleton sichtbar (normal bei 5000+ Datensätzen). | Info | OK |

| 2 | Unternehmen anlegen | /kontakte | Formular: Alle Felder korrekt ausfüllbar. Sonderzeichen (&) im Firmennamen OK. PLZ mit führender Null (04109) OK. Kategorie-Dropdown funktioniert. | Info | OK |

| 3 | Unternehmen anlegen | /kontakte | ERFOLG: Unternehmen "Hausverwaltung Grünberg & Partner GmbH" angelegt. Toast "Unternehmen erfolgreich angelegt" erscheint. Zähler aktualisiert: 2799→2800. Formular wird zurückgesetzt. Dialog bleibt offen für nächste Eingabe. | Info | OK |

| 4 | Neues Projekt | /projekte | Wizard öffnet korrekt: 4-Schritt-Wizard (Grunddaten, HubSpot, Team & Termine, Zusatz). Fortschrittsanzeige 25%. Unternehmen werden geladen. | Info | OK |

