/**
 * Excel Export Service für FassadenFix Projektmanager
 * Exportiert Daten als XLSX-Dateien
 */

// Einfacher CSV-Export (funktioniert ohne zusätzliche Bibliothek)
export function exportToCSV(data: Record<string, unknown>[], filename: string, headers?: string[]): void {
  if (data.length === 0) {
    console.warn("Keine Daten zum Exportieren");
    return;
  }

  // Headers aus erstem Objekt ableiten, falls nicht angegeben
  const csvHeaders = headers || Object.keys(data[0]);
  
  // CSV-Zeilen erstellen
  const csvRows = [
    csvHeaders.join(";"), // Header-Zeile mit Semikolon für deutsche Excel-Versionen
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Werte escapen
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Anführungszeichen verdoppeln und Wert in Anführungszeichen setzen
          if (stringValue.includes(";") || stringValue.includes('"') || stringValue.includes("\n")) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
          }
          return stringValue;
        })
        .join(";")
    ),
  ];

  // BOM für UTF-8 (damit Excel Umlaute korrekt anzeigt)
  const BOM = "\uFEFF";
  const csvContent = BOM + csvRows.join("\n");
  
  // Download auslösen
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : filename + ".csv");
}

// Projekte exportieren
export interface ProjektExportData {
  projektNummer: string;
  name: string;
  kunde: string;
  status: string;
  startdatum: string;
  enddatum: string;
  gesamtflaeche: number;
  gesamtpreis: number;
  ansprechpartner: string;
}

export function exportProjekte(projekte: ProjektExportData[]): void {
  const headers = [
    "Projekt-Nr.",
    "Projektname",
    "Kunde",
    "Status",
    "Startdatum",
    "Enddatum",
    "Fläche (m²)",
    "Preis (€)",
    "Ansprechpartner",
  ];
  
  const data = projekte.map((p) => ({
    "Projekt-Nr.": p.projektNummer,
    "Projektname": p.name,
    "Kunde": p.kunde,
    "Status": p.status,
    "Startdatum": p.startdatum,
    "Enddatum": p.enddatum,
    "Fläche (m²)": p.gesamtflaeche,
    "Preis (€)": p.gesamtpreis,
    "Ansprechpartner": p.ansprechpartner,
  }));
  
  exportToCSV(data, "FassadenFix_Projekte_" + formatDate(new Date()) + ".csv", headers);
}

// Angebote exportieren
export interface AngebotExportData {
  angebotNummer: string;
  projektName: string;
  kunde: string;
  status: string;
  datum: string;
  gueltigBis: string;
  nettobetrag: number;
  mwst: number;
  gesamtsumme: number;
}

export function exportAngebote(angebote: AngebotExportData[]): void {
  const headers = [
    "Angebot-Nr.",
    "Projekt",
    "Kunde",
    "Status",
    "Datum",
    "Gültig bis",
    "Netto (€)",
    "MwSt. (€)",
    "Gesamt (€)",
  ];
  
  const data = angebote.map((a) => ({
    "Angebot-Nr.": a.angebotNummer,
    "Projekt": a.projektName,
    "Kunde": a.kunde,
    "Status": a.status,
    "Datum": a.datum,
    "Gültig bis": a.gueltigBis,
    "Netto (€)": a.nettobetrag,
    "MwSt. (€)": a.mwst,
    "Gesamt (€)": a.gesamtsumme,
  }));
  
  exportToCSV(data, "FassadenFix_Angebote_" + formatDate(new Date()) + ".csv", headers);
}

// Baustellen exportieren
export interface BaustelleExportData {
  baustellenNummer: string;
  projektName: string;
  adresse: string;
  phase: string;
  status: string;
  startdatum: string;
  enddatum: string;
  teamleiter: string;
  mitarbeiterAnzahl: number;
}

export function exportBaustellen(baustellen: BaustelleExportData[]): void {
  const headers = [
    "Baustellen-Nr.",
    "Projekt",
    "Adresse",
    "Phase",
    "Status",
    "Start",
    "Ende",
    "Teamleiter",
    "Mitarbeiter",
  ];
  
  const data = baustellen.map((b) => ({
    "Baustellen-Nr.": b.baustellenNummer,
    "Projekt": b.projektName,
    "Adresse": b.adresse,
    "Phase": b.phase,
    "Status": b.status,
    "Start": b.startdatum,
    "Ende": b.enddatum,
    "Teamleiter": b.teamleiter,
    "Mitarbeiter": b.mitarbeiterAnzahl,
  }));
  
  exportToCSV(data, "FassadenFix_Baustellen_" + formatDate(new Date()) + ".csv", headers);
}

// Finanzbericht exportieren
export interface FinanzExportData {
  monat: string;
  umsatz: number;
  kosten: number;
  gewinn: number;
  marge: number;
  offeneRechnungen: number;
  bezahlteRechnungen: number;
}

export function exportFinanzbericht(daten: FinanzExportData[]): void {
  const headers = [
    "Monat",
    "Umsatz (€)",
    "Kosten (€)",
    "Gewinn (€)",
    "Marge (%)",
    "Offene Rechnungen (€)",
    "Bezahlt (€)",
  ];
  
  const data = daten.map((d) => ({
    "Monat": d.monat,
    "Umsatz (€)": d.umsatz,
    "Kosten (€)": d.kosten,
    "Gewinn (€)": d.gewinn,
    "Marge (%)": d.marge,
    "Offene Rechnungen (€)": d.offeneRechnungen,
    "Bezahlt (€)": d.bezahlteRechnungen,
  }));
  
  exportToCSV(data, "FassadenFix_Finanzbericht_" + formatDate(new Date()) + ".csv", headers);
}

// Teamleitercheck exportieren
export interface ChecklistExportData {
  baustelle: string;
  datum: string;
  teamleiter: string;
  kategorie: string;
  checkpunkt: string;
  status: string;
  notiz: string;
}

export function exportTeamleitercheck(checks: ChecklistExportData[]): void {
  const headers = [
    "Baustelle",
    "Datum",
    "Teamleiter",
    "Kategorie",
    "Checkpunkt",
    "Status",
    "Notiz",
  ];
  
  const data = checks.map((c) => ({
    "Baustelle": c.baustelle,
    "Datum": c.datum,
    "Teamleiter": c.teamleiter,
    "Kategorie": c.kategorie,
    "Checkpunkt": c.checkpunkt,
    "Status": c.status,
    "Notiz": c.notiz,
  }));
  
  exportToCSV(data, "FassadenFix_Teamleitercheck_" + formatDate(new Date()) + ".csv", headers);
}

// Hilfsfunktionen
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
