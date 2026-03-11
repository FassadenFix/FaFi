/**
 * Shared Hooks für Bibliothek-Daten
 * 
 * Intention: EINE Quelle der Wahrheit – alle Dropdowns im System laden aus der Bibliothek.
 * Diese Hooks mappen die DB-Daten auf die Formate, die die bestehenden Komponenten erwarten.
 * Wenn die Bibliothek leer ist, werden Fallback-Defaults zurückgegeben, damit das System
 * auch ohne gepflegte Stammdaten funktioniert.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

// ─── Types (kompatibel mit bestehenden Komponenten) ─────────────────────────

/** Format für AngebotPositionenStep BUEHNEN_OPTIONEN */
export interface BuehnenOption {
  id: string;
  name: string;
  maxHoehe: number;
  preisProTag: number;
  beschreibung: string;
}

/** Format für AngebotPositionenStep REINIGUNGSMITTEL_OPTIONEN */
export interface ReinigungsmittelOption {
  id: string;
  name: string;
  fuerFassadenarten: string[];
  preisProLiter: number;
  beschreibung: string;
}

/** Format für ImmobilienSeitenAuswahlStep BUEHNENTYPEN */
export interface BuehnenTyp {
  id: string;
  label: string;
  maxHoehe: number;
  preisProTag: number;
}

/** Format für ImmobilienSeitenAuswahlStep REINIGUNGSMITTEL */
export interface ReinigungsmittelSimple {
  id: string;
  label: string;
}

/** Format für AngebotWizard PREISSTAFFELUNG */
export interface Preisstaffel {
  minFlaeche: number;
  preis: number;
  label: string;
}

/** Format für AngebotWizard RABATT_AKTIONEN */
export interface RabattAktion {
  id: string;
  label: string;
  prozent: number;
  dynamic?: boolean;
}

/** Format für FassadenFixVersprechen PREISSTAFFEL_OPTIONS */
export interface PreisstaffelOption {
  id: string;
  label: string;
  data: { flaeche: string; preis: string }[];
}

// ─── Fallback-Defaults (werden verwendet wenn Bibliothek leer ist) ──────────

const FALLBACK_BUEHNEN: BuehnenOption[] = [
  { id: "teleskoplanze", name: "Teleskoplanzen", maxHoehe: 8, preisProTag: 45, beschreibung: "Für niedrige Höhen bis 8m, kostengünstig" },
  { id: "hubsteiger-8", name: "Hubsteiger 8m", maxHoehe: 8, preisProTag: 180, beschreibung: "Kompakter Hubsteiger für enge Bereiche" },
  { id: "hubsteiger-12", name: "Hubsteiger 12m", maxHoehe: 12, preisProTag: 220, beschreibung: "Standard für 2-3 Geschosse" },
  { id: "hubsteiger-14", name: "Hubsteiger 14m", maxHoehe: 14, preisProTag: 250, beschreibung: "Für höhere Giebel und Spitzen" },
  { id: "hubsteiger-18", name: "Hubsteiger 18m", maxHoehe: 18, preisProTag: 280, beschreibung: "Standard für Mehrfamilienhäuser" },
  { id: "hubsteiger-24", name: "Hubsteiger 24m", maxHoehe: 24, preisProTag: 350, beschreibung: "Für hohe Gebäude und Gewerbe" },
  { id: "hubsteiger-30", name: "Hubsteiger 30m", maxHoehe: 30, preisProTag: 450, beschreibung: "Spezial für sehr hohe Gebäude" },
];

const FALLBACK_REINIGUNGSMITTEL: ReinigungsmittelOption[] = [
  { id: "ff-pro", name: "FassadenFix Pro", fuerFassadenarten: ["WDVS", "Putz", "Beton"], preisProLiter: 12.50, beschreibung: "Standard für mineralische Fassaden" },
  { id: "ff-anti-graffiti", name: "FassadenFix Anti-Graffiti", fuerFassadenarten: ["WDVS", "Putz", "Beton", "Klinker"], preisProLiter: 18.90, beschreibung: "Spezial für Graffiti-Entfernung" },
  { id: "ff-klinker", name: "FassadenFix Klinker", fuerFassadenarten: ["Klinker", "Ziegel"], preisProLiter: 14.50, beschreibung: "Schonend für Klinker und Ziegel" },
  { id: "ff-schindel", name: "FassadenFix Schindel", fuerFassadenarten: ["Holz", "Schindel", "Eternit"], preisProLiter: 16.80, beschreibung: "Für Holz- und Schindelfassaden" },
  { id: "ff-glas", name: "FassadenFix Glas", fuerFassadenarten: ["Glas", "Alu", "Metall"], preisProLiter: 9.90, beschreibung: "Für Glas- und Metallfassaden" },
  { id: "ff-naturstein", name: "FassadenFix Naturstein", fuerFassadenarten: ["Naturstein", "Sandstein"], preisProLiter: 22.50, beschreibung: "pH-neutral für empfindliche Steine" },
];

const FALLBACK_PREISSTAFFELUNG: Preisstaffel[] = [
  { minFlaeche: 5000, preis: 8.75, label: "ab 5.000 m² (Bestpreis)" },
  { minFlaeche: 2500, preis: 9.25, label: "2.500 – 4.999 m²" },
  { minFlaeche: 1000, preis: 9.75, label: "1.000 – 2.499 m²" },
  { minFlaeche: 500, preis: 10.50, label: "500 – 999 m²" },
];

const FALLBACK_RABATT_AKTIONEN: RabattAktion[] = [
  { id: "keine", label: "Kein Rabatt", prozent: 0 },
  { id: "fruehbucher", label: "Frühbucher-Rabatt", prozent: 0, dynamic: true },
  { id: "kennenlernen", label: "Kennenlernangebot", prozent: 5 },
  { id: "treue", label: "Treuerabatt (Bestandskunde)", prozent: 3 },
  { id: "einkaufsgemeinschaft", label: "Einkaufsgemeinschaft", prozent: 8 },
];

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Equipment aus der Bibliothek als BuehnenOptionen (Format für AngebotPositionenStep)
 * Mappt: name, maxHeight → maxHoehe, dailyRate → preisProTag, description → beschreibung
 */
export function useLibraryEquipment() {
  const { data, isLoading, error } = trpc.library.equipment.list.useQuery(
    { status: "aktiv" },
    { staleTime: 5 * 60 * 1000 } // 5 Min Cache
  );

  const buehnenOptionen = useMemo<BuehnenOption[]>(() => {
    if (!data || data.length === 0) return FALLBACK_BUEHNEN;
    return data
      .filter((e: any) => e.maxHeight) // Nur Geräte mit Höhe = Bühnen
      .map((e: any) => ({
        id: `lib-${e.id}`,
        name: e.name,
        maxHoehe: Number(e.maxHeight) || 0,
        preisProTag: Number(e.dailyRate) || 0,
        beschreibung: e.description || e.notes || "",
      }))
      .sort((a: BuehnenOption, b: BuehnenOption) => a.maxHoehe - b.maxHoehe);
  }, [data]);

  /** Einfaches Format für ImmobilienSeitenAuswahlStep */
  const buehnenTypen = useMemo<BuehnenTyp[]>(() => {
    return buehnenOptionen.map((b) => ({
      id: b.id,
      label: b.name,
      maxHoehe: b.maxHoehe,
      preisProTag: b.preisProTag,
    }));
  }, [buehnenOptionen]);

  /** Alle Geräte (auch ohne Höhe) für BaustelleWizard */
  const alleGeraete = useMemo<string[]>(() => {
    if (!data || data.length === 0) return ["Hubsteiger 18m", "Hubsteiger 24m", "Hochdruckreiniger", "Sprühgerät", "Gerüst", "Absperrungen"];
    return data.map((e: any) => e.name);
  }, [data]);

  return { buehnenOptionen, buehnenTypen, alleGeraete, isLoading, error, raw: data };
}

/**
 * Reinigungsmittel aus der Bibliothek (Format für AngebotPositionenStep)
 * Mappt: name, applicationArea → fuerFassadenarten, purchasePrice → preisProLiter
 */
export function useLibraryCleaningAgents() {
  const { data, isLoading, error } = trpc.library.cleaningAgents.list.useQuery(
    { status: "aktiv" },
    { staleTime: 5 * 60 * 1000 }
  );

  const reinigungsmittelOptionen = useMemo<ReinigungsmittelOption[]>(() => {
    if (!data || data.length === 0) return FALLBACK_REINIGUNGSMITTEL;
    return data.map((a: any) => ({
      id: `lib-${a.id}`,
      name: a.name,
      fuerFassadenarten: a.applicationArea ? a.applicationArea.split(",").map((s: string) => s.trim()) : [],
      preisProLiter: Number(a.purchasePrice) || 0,
      beschreibung: a.description || a.notes || "",
    }));
  }, [data]);

  /** Einfaches Format für ImmobilienSeitenAuswahlStep */
  const reinigungsmittelSimple = useMemo<ReinigungsmittelSimple[]>(() => {
    return reinigungsmittelOptionen.map((r) => ({
      id: r.id,
      label: r.name,
    }));
  }, [reinigungsmittelOptionen]);

  return { reinigungsmittelOptionen, reinigungsmittelSimple, isLoading, error, raw: data };
}

/**
 * Rabatte & Preisstaffeln aus der Bibliothek
 * Separiert nach discountType für verschiedene Verwendungszwecke
 */
export function useLibraryDiscounts() {
  const { data, isLoading, error } = trpc.library.discounts.list.useQuery(
    { status: "aktiv" },
    { staleTime: 5 * 60 * 1000 }
  );

  /** Preisstaffelung (Format für AngebotWizard) */
  const preisstaffelung = useMemo<Preisstaffel[]>(() => {
    if (!data) return FALLBACK_PREISSTAFFELUNG;
    const staffeln = data
      .filter((d: any) => d.discountType === "preisstaffel")
      .map((d: any) => ({
        minFlaeche: d.minFlaeche || 0,
        preis: Number(d.pricePerSqm) || 0,
        label: d.name || `ab ${d.minFlaeche} m²`,
      }))
      .sort((a: Preisstaffel, b: Preisstaffel) => b.minFlaeche - a.minFlaeche); // Absteigend
    return staffeln.length > 0 ? staffeln : FALLBACK_PREISSTAFFELUNG;
  }, [data]);

  /** Rabatt-Aktionen (Format für AngebotWizard) */
  const rabattAktionen = useMemo<RabattAktion[]>(() => {
    if (!data) return FALLBACK_RABATT_AKTIONEN;
    const aktionen = data
      .filter((d: any) => d.discountType !== "preisstaffel")
      .map((d: any) => ({
        id: `lib-${d.id}`,
        label: d.name,
        prozent: Number(d.percentage) || 0,
        dynamic: d.discountType === "fruehbucher",
      }));
    // Immer "Kein Rabatt" als erste Option
    const result: RabattAktion[] = [{ id: "keine", label: "Kein Rabatt", prozent: 0 }];
    if (aktionen.length > 0) {
      result.push(...aktionen);
    } else {
      result.push(...FALLBACK_RABATT_AKTIONEN.slice(1));
    }
    return result;
  }, [data]);

  /** Preisstaffel-Optionen (Format für FassadenFixVersprechen/StoererBedingungStep) */
  const preisstaffelOptions = useMemo<PreisstaffelOption[]>(() => {
    const staffelData = preisstaffelung.map((s) => ({
      flaeche: s.label.replace(/\(.*\)/, "").trim(),
      preis: `${s.preis.toFixed(2).replace(".", ",")} €`,
    }));
    return [{ id: "standard", label: "Standard-Preisstaffel", data: staffelData }];
  }, [preisstaffelung]);

  /** Preisstaffel-Daten (Format für AngebotPDFGenerator PREISSTAFFEL_DATA) */
  const preisstaffelData = useMemo(() => {
    const sorted = [...preisstaffelung].sort((a, b) => a.minFlaeche - b.minFlaeche); // Aufsteigend
    return sorted.map((s, i) => ({
      minFlaeche: s.minFlaeche,
      maxFlaeche: i < sorted.length - 1 ? sorted[i + 1].minFlaeche - 1 : Infinity,
      preis: s.preis,
      label: s.label.replace(/\(.*\)/, "").trim(),
    }));
  }, [preisstaffelung]);

  return { preisstaffelung, rabattAktionen, preisstaffelOptions, preisstaffelData, isLoading, error, raw: data };
}

/**
 * Fahrzeuge aus der Bibliothek (für Ressourcen-Seite)
 */
export function useLibraryVehicles() {
  const { data, isLoading, error } = trpc.library.vehicles.list.useQuery(
    { status: "aktiv" },
    { staleTime: 5 * 60 * 1000 }
  );

  const waschbusse = useMemo(() => {
    if (!data) return [];
    return data
      .filter((v: any) => v.vehicleType === "waschbus")
      .map((v: any) => ({
        id: String(v.id),
        name: v.licensePlate || v.name,
        type: `${v.manufacturer || ""} ${v.model || ""} ${v.capacity || ""}`.trim(),
        status: v.status === "aktiv" ? "verfügbar" : v.status === "werkstatt" ? "in Wartung" : v.status,
      }));
  }, [data]);

  const alleFahrzeuge = useMemo(() => {
    if (!data) return [];
    return data.map((v: any) => ({
      id: String(v.id),
      name: v.name,
      licensePlate: v.licensePlate,
      type: v.vehicleType,
      manufacturer: v.manufacturer,
      model: v.model,
      status: v.status,
    }));
  }, [data]);

  return { waschbusse, alleFahrzeuge, isLoading, error, raw: data };
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/** Vorauswahl Bühne basierend auf Höhe (verwendet die aktuelle Bibliothek) */
export function getBuehnenVorauswahlFromLibrary(hoehe: number, buehnenOptionen: BuehnenOption[]): string {
  if (buehnenOptionen.length === 0) return "";
  // Finde die kleinste Bühne die hoch genug ist
  const passend = buehnenOptionen
    .filter((b) => b.maxHoehe >= hoehe)
    .sort((a, b) => a.maxHoehe - b.maxHoehe);
  return passend.length > 0 ? passend[0].id : buehnenOptionen[buehnenOptionen.length - 1].id;
}

/** Vorauswahl Reinigungsmittel basierend auf Fassadenart */
export function getReinigungsmittelVorauswahlFromLibrary(
  fassadenart: string,
  besonderheiten: string[],
  reinigungsmittel: ReinigungsmittelOption[]
): string {
  if (reinigungsmittel.length === 0) return "";
  // Graffiti hat Priorität
  if (besonderheiten?.includes("Graffiti")) {
    const graffiti = reinigungsmittel.find((r) => r.name.toLowerCase().includes("graffiti"));
    if (graffiti) return graffiti.id;
  }
  // Suche nach passender Fassadenart
  const passend = reinigungsmittel.find((r) =>
    r.fuerFassadenarten.some((f) => fassadenart?.toLowerCase().includes(f.toLowerCase()))
  );
  return passend ? passend.id : reinigungsmittel[0].id;
}

/** Preis pro m² basierend auf Gesamtfläche ermitteln */
export function getPreisProQm(gesamtflaeche: number, preisstaffelung: Preisstaffel[]): number {
  if (preisstaffelung.length === 0) return 10.50;
  for (const staffel of preisstaffelung) {
    if (gesamtflaeche >= staffel.minFlaeche) return staffel.preis;
  }
  return preisstaffelung[preisstaffelung.length - 1].preis;
}

/** Preisstaffel-Label für eine Fläche ermitteln */
export function getPreisstaffelLabel(gesamtflaeche: number, preisstaffelung: Preisstaffel[]): string {
  if (preisstaffelung.length === 0) return "";
  for (const staffel of preisstaffelung) {
    if (gesamtflaeche >= staffel.minFlaeche) return staffel.label;
  }
  return preisstaffelung[preisstaffelung.length - 1].label;
}
