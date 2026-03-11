# Prüfung Code-Qualität und Tests

## TypeScript
- `tsc --noEmit`: EXIT 0 – keine TypeScript-Fehler

## Build
- `pnpm build`: Erfolgreich in 19.69s
- Build-Größe: 6.3MB (64 Assets)
- Warnung: index-BIf2eFzn.js ist 2.167 KB (>500KB) – Code-Splitting empfohlen
- PieChart-FLSAGk9f.js ist 446 KB – Chart-Bibliothek groß

## Tests
- 46 Testdateien, 994 Tests, alle bestanden
- Dauer: 6.50s
- WARNUNG: FK-Constraint-Fehler in dunning-Tests (documents.invoiceId → invoices.id)
  - Test besteht trotzdem, aber die Fehlermeldung deutet auf einen Bug im Mahnlauf hin
  - Bei Mahnung-Erstellung wird invoiceId=1 referenziert, die nicht existiert
