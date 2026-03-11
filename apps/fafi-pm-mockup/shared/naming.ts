/**
 * FaFi PM – Automatisches Benennungssystem
 * 
 * Einheitliche, sprechende Bezeichnungen für alle Entitäten:
 * Schema: {Jahr}_{Unternehmen}_{Kontext}_{Laufnummer}_{Version}
 * 
 * Beispiele:
 *   2026_Kreiswohnungswerk-Roding_Angebot_0001_v1
 *   2026_Sonnenhof-eG_Rechnung_0012
 *   2026_Hausverwaltung-Mueller_Objektaufnahme_003
 *   2026_Industrie-GmbH_Foto-Baustelle_042
 */

// ============================================
// KONTEXT-KÜRZEL (was ist es?)
// ============================================
export const ENTITY_CONTEXT = {
  // Geschäftsdokumente
  angebot: "Angebot",
  rechnung: "Rechnung",
  auftrag: "Auftrag",
  garantie: "Garantie",
  mahnung: "Mahnung",
  
  // Projektphasen-Dokumente
  objektaufnahme: "Objektaufnahme",
  abnahmeprotokoll: "Abnahmeprotokoll",
  auftragsbestaetigung: "Auftragsbestaetigung",
  
  // Fotos nach Kontext
  foto_objektaufnahme: "Foto-Objektaufnahme",
  foto_vorher: "Foto-Vorher",
  foto_nachher: "Foto-Nachher",
  foto_baustelle: "Foto-Baustelle",
  foto_ereignis: "Foto-Ereignis",
  foto_abnahme: "Foto-Abnahme",
  foto_schaden: "Foto-Schaden",
  foto_allgemein: "Foto-Allgemein",
  
  // Sonstige
  dokument: "Dokument",
  protokoll: "Protokoll",
  bericht: "Bericht",
  sonstiges: "Sonstiges",
} as const;

export type EntityContext = keyof typeof ENTITY_CONTEXT;

// ============================================
// SLUG-FUNKTION für Unternehmensnamen
// ============================================

/** Deutsche Umlaut-Ersetzungen */
const UMLAUT_MAP: Record<string, string> = {
  "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss",
  "Ä": "Ae", "Ö": "Oe", "Ü": "Ue",
};

/**
 * Erzeugt einen URL-sicheren, lesbaren Slug aus einem Unternehmensnamen.
 * 
 * "Kreiswohnungswerk Roding GmbH" → "Kreiswohnungswerk-Roding-GmbH"
 * "Müller & Söhne OHG" → "Mueller-und-Soehne-OHG"
 * "WG Sonnenhof eG" → "WG-Sonnenhof-eG"
 */
export function slugifyCompanyName(name: string): string {
  if (!name || name.trim() === "") return "Unbekannt";
  
  let slug = name.trim();
  
  // 1. Umlaute ersetzen
  for (const [umlaut, replacement] of Object.entries(UMLAUT_MAP)) {
    slug = slug.replace(new RegExp(umlaut, "g"), replacement);
  }
  
  // 2. & durch "und" ersetzen
  slug = slug.replace(/\s*&\s*/g, "-und-");
  
  // 3. Leerzeichen und Sonderzeichen durch Bindestriche ersetzen
  slug = slug.replace(/[^a-zA-Z0-9-]/g, "-");
  
  // 4. Mehrfache Bindestriche zusammenfassen
  slug = slug.replace(/-+/g, "-");
  
  // 5. Führende/abschließende Bindestriche entfernen
  slug = slug.replace(/^-|-$/g, "");
  
  // 6. Auf max. 50 Zeichen begrenzen (am Wortende)
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
    const lastDash = slug.lastIndexOf("-");
    if (lastDash > 30) slug = slug.substring(0, lastDash);
  }
  
  return slug || "Unbekannt";
}

// ============================================
// LAUFNUMMER-FORMATIERUNG
// ============================================

/**
 * Formatiert eine Laufnummer mit führenden Nullen.
 * 
 * padNumber(1, 4) → "0001"
 * padNumber(42, 3) → "042"
 */
export function padNumber(num: number, digits: number): string {
  return String(Math.max(0, Math.floor(num))).padStart(digits, "0");
}

// ============================================
// ZENTRALE BENENNUNGSFUNKTION
// ============================================

export interface EntityNameParams {
  /** Jahr (default: aktuelles Jahr) */
  year?: number;
  /** Unternehmensname (wird zu Slug konvertiert) */
  companyName: string;
  /** Kontext/Typ der Entität */
  context: EntityContext;
  /** Laufende Nummer */
  sequenceNumber: number;
  /** Anzahl Stellen für die Laufnummer (default: 3, Angebote/Rechnungen: 4) */
  sequenceDigits?: number;
  /** Versionsnummer (optional, z.B. für Angebote) */
  version?: number;
  /** Dateiendung (optional, z.B. ".pdf", ".jpg") */
  extension?: string;
}

/**
 * Generiert einen automatischen, sprechenden Entitätsnamen.
 * 
 * generateEntityName({
 *   companyName: "Kreiswohnungswerk Roding GmbH",
 *   context: "angebot",
 *   sequenceNumber: 1,
 *   version: 1,
 * })
 * → "2026_Kreiswohnungswerk-Roding-GmbH_Angebot_0001_v1"
 * 
 * generateEntityName({
 *   companyName: "WG Sonnenhof eG",
 *   context: "foto_baustelle",
 *   sequenceNumber: 42,
 *   extension: ".jpg",
 * })
 * → "2026_WG-Sonnenhof-eG_Foto-Baustelle_042.jpg"
 */
export function generateEntityName(params: EntityNameParams): string {
  const {
    year = new Date().getFullYear(),
    companyName,
    context,
    sequenceNumber,
    sequenceDigits = getDefaultDigits(context),
    version,
    extension,
  } = params;
  
  const slug = slugifyCompanyName(companyName);
  const contextLabel = ENTITY_CONTEXT[context];
  const seqStr = padNumber(sequenceNumber, sequenceDigits);
  
  let name = `${year}_${slug}_${contextLabel}_${seqStr}`;
  
  if (version !== undefined && version > 0) {
    name += `_v${version}`;
  }
  
  if (extension) {
    // Sicherstellen, dass Extension mit Punkt beginnt
    const ext = extension.startsWith(".") ? extension : `.${extension}`;
    name += ext;
  }
  
  return name;
}

/**
 * Gibt die Standard-Stellenanzahl für die Laufnummer zurück.
 * Angebote und Rechnungen haben 4 Stellen (hohes Volumen),
 * alle anderen 3 Stellen.
 */
function getDefaultDigits(context: EntityContext): number {
  switch (context) {
    case "angebot":
    case "rechnung":
      return 4;
    default:
      return 3;
  }
}

// ============================================
// KONTEXT-MAPPING FÜR FOTOS
// ============================================

/** Mappt den Foto-Kontext (aus dem photos-Schema) auf den EntityContext */
export function mapPhotoContextToEntityContext(
  photoContext: string
): EntityContext {
  const mapping: Record<string, EntityContext> = {
    objektaufnahme: "foto_objektaufnahme",
    vorher_dokumentation: "foto_vorher",
    nachher_dokumentation: "foto_nachher",
    baustelle_fortschritt: "foto_baustelle",
    ereignis: "foto_ereignis",
    abnahme: "foto_abnahme",
    schaden: "foto_schaden",
    allgemein: "foto_allgemein",
  };
  return mapping[photoContext] || "foto_allgemein";
}

/** Mappt die Dokument-Kategorie auf den EntityContext */
export function mapDocumentCategoryToEntityContext(
  category: string
): EntityContext {
  const mapping: Record<string, EntityContext> = {
    angebot: "angebot",
    auftragsbestaetigung: "auftragsbestaetigung",
    rechnung: "rechnung",
    garantie: "garantie",
    abnahmeprotokoll: "abnahmeprotokoll",
    foto: "foto_allgemein",
    protokoll: "protokoll",
    bericht: "bericht",
  };
  return mapping[category] || "dokument";
}

// ============================================
// DISPLAY-NAME FÜR BESTEHENDE NUMMERN
// ============================================

/**
 * Erzeugt einen sprechenden Display-Namen aus einer bestehenden Nummer.
 * 
 * generateDisplayName("FF-2026-0042", "Kreiswohnungswerk Roding GmbH", "angebot")
 * → "2026_Kreiswohnungswerk-Roding-GmbH_Angebot_0042"
 */
export function generateDisplayName(
  existingNumber: string,
  companyName: string,
  context: EntityContext,
  version?: number,
): string {
  // Extrahiere die Laufnummer aus der bestehenden Nummer
  const numMatch = existingNumber.match(/(\d+)$/);
  const seqNum = numMatch ? parseInt(numMatch[1]) : 0;
  
  // Extrahiere das Jahr
  const yearMatch = existingNumber.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  return generateEntityName({
    year,
    companyName,
    context,
    sequenceNumber: seqNum,
    version,
  });
}

// ============================================
// DATEINAME FÜR DOWNLOADS
// ============================================

/**
 * Erzeugt einen sauberen Dateinamen für Downloads.
 * 
 * generateDownloadFilename({
 *   companyName: "Müller & Söhne",
 *   context: "angebot",
 *   sequenceNumber: 42,
 *   version: 2,
 *   extension: ".pdf",
 * })
 * → "2026_Mueller-und-Soehne_Angebot_0042_v2.pdf"
 */
export function generateDownloadFilename(params: EntityNameParams): string {
  return generateEntityName({
    ...params,
    extension: params.extension || ".pdf",
  });
}
