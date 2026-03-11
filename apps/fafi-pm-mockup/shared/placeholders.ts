/**
 * Platzhalter-Ersetzung für Textbausteine
 * 
 * Unterstützte Platzhalter:
 * - [DATUM] → Aktuelles Datum
 * - [PROJEKT] → Projektname
 * - [KUNDE] → Kundenname/Unternehmen
 * - [ANSPRECHPARTNER] → Ansprechpartner FassadenFix
 * - [FLAECHE] → Gesamtfläche in m²
 * - [PREIS] → Gesamtpreis brutto
 * - [RABATT] → Rabattaktion (falls vorhanden)
 * - [GUELTIG_BIS] → Angebots-Gültigkeitsdatum
 * - [PROZENT] → Rabattprozent
 */

export interface PlaceholderContext {
  datum?: string;
  projekt?: string;
  kunde?: string;
  ansprechpartner?: string;
  flaeche?: number;
  preis?: number;
  rabatt?: string;
  gueltigBis?: string;
  prozent?: number;
}

/**
 * Formatiert ein Datum im deutschen Format
 */
function formatDateDE(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString("de-DE");
  try {
    return new Date(dateStr).toLocaleDateString("de-DE");
  } catch {
    return dateStr;
  }
}

/**
 * Formatiert einen Preis im deutschen Format
 */
function formatPriceDE(price?: number): string {
  if (price === undefined || price === null) return "0,00 €";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Formatiert eine Fläche im deutschen Format
 */
function formatAreaDE(area?: number): string {
  if (area === undefined || area === null) return "0 m²";
  return `${new Intl.NumberFormat("de-DE").format(area)} m²`;
}

/**
 * Ersetzt alle Platzhalter in einem Text
 */
export function replacePlaceholders(text: string, context: PlaceholderContext): string {
  if (!text) return "";

  let result = text;

  // Datum
  result = result.replace(/\[DATUM\]/gi, formatDateDE());

  // Projekt
  result = result.replace(/\[PROJEKT\]/gi, context.projekt || "Ihr Projekt");

  // Kunde
  result = result.replace(/\[KUNDE\]/gi, context.kunde || "Sehr geehrte Damen und Herren");

  // Ansprechpartner
  result = result.replace(/\[ANSPRECHPARTNER\]/gi, context.ansprechpartner || "FassadenFix Team");

  // Fläche
  result = result.replace(/\[FLAECHE\]/gi, formatAreaDE(context.flaeche));
  result = result.replace(/\[FLÄCHE\]/gi, formatAreaDE(context.flaeche));

  // Preis
  result = result.replace(/\[PREIS\]/gi, formatPriceDE(context.preis));

  // Rabatt
  result = result.replace(/\[RABATT\]/gi, context.rabatt || "");

  // Gültig bis
  result = result.replace(/\[GUELTIG_BIS\]/gi, formatDateDE(context.gueltigBis));
  result = result.replace(/\[GÜLTIG_BIS\]/gi, formatDateDE(context.gueltigBis));

  // Prozent
  if (context.prozent !== undefined) {
    result = result.replace(/\[PROZENT\]/gi, `${context.prozent}%`);
  } else {
    result = result.replace(/\[PROZENT\]/gi, "");
  }

  return result;
}

/**
 * Liste aller verfügbaren Platzhalter mit Beschreibung
 */
export const AVAILABLE_PLACEHOLDERS = [
  { placeholder: "[DATUM]", description: "Aktuelles Datum im Format TT.MM.JJJJ" },
  { placeholder: "[PROJEKT]", description: "Name des Projekts" },
  { placeholder: "[KUNDE]", description: "Name des Kunden/Unternehmens" },
  { placeholder: "[ANSPRECHPARTNER]", description: "FassadenFix Ansprechpartner" },
  { placeholder: "[FLAECHE]", description: "Gesamtfläche in m²" },
  { placeholder: "[PREIS]", description: "Gesamtpreis brutto" },
  { placeholder: "[RABATT]", description: "Name der Rabattaktion" },
  { placeholder: "[GUELTIG_BIS]", description: "Angebots-Gültigkeitsdatum" },
  { placeholder: "[PROZENT]", description: "Rabattprozent der Aktion" },
] as const;

/**
 * Prüft, ob ein Text Platzhalter enthält
 */
export function hasPlaceholders(text: string): boolean {
  return /\[[A-ZÄÖÜ_]+\]/i.test(text);
}

/**
 * Extrahiert alle Platzhalter aus einem Text
 */
export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\[[A-ZÄÖÜ_]+\]/gi);
  return matches ? Array.from(new Set(matches)) : [];
}
