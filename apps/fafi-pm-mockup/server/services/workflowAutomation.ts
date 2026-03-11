/**
 * FaFi PM – Workflow-Automatisierungen
 * 
 * Automatische Aufgaben-Generierung bei Phasenwechsel,
 * Dokumenten-Kette, Rechnungsentwurf nach Abnahme,
 * Garantie-Aktivierung nach Zahlungseingang.
 */

import type { ProjectPhase } from "../../shared/schemas/workflow";

// ============================================
// PHASEN-SPEZIFISCHE AUFGABEN
// ============================================

export interface PhaseTask {
  title: string;
  role: string; // assignedRole
  daysOffset: number; // Tage ab Phasenwechsel (negativ = vor Deadline)
  priority: "niedrig" | "normal" | "hoch" | "dringend";
  responsibleParty: "auftraggeber" | "auftragnehmer";
  description?: string;
}

/**
 * Definiert die automatisch zu erstellenden Aufgaben pro Phasenwechsel.
 * Jede Phase hat eine Liste von Aufgaben, die bei Eintritt erstellt werden.
 */
export const PHASE_AUTO_TASKS: Record<string, PhaseTask[]> = {
  objektaufnahme: [
    { title: "Objektaufnahme durchführen", role: "kundenberater", daysOffset: 3, priority: "hoch", responsibleParty: "auftragnehmer", description: "Gebäudeseiten erfassen, Fotos machen, Fassadenart dokumentieren" },
    { title: "Kundentermin vereinbaren", role: "kundenberater", daysOffset: 1, priority: "hoch", responsibleParty: "auftragnehmer", description: "Termin für Vor-Ort-Besichtigung mit dem Kunden abstimmen" },
  ],
  angebot_erstellt: [
    { title: "Angebot prüfen und freigeben", role: "gf", daysOffset: 2, priority: "hoch", responsibleParty: "auftragnehmer", description: "Angebot auf Vollständigkeit und Kalkulation prüfen" },
    { title: "Angebot an Kunden versenden", role: "buero", daysOffset: 3, priority: "hoch", responsibleParty: "auftragnehmer", description: "Freigegebenes Angebot per E-Mail an den Kunden senden" },
  ],
  angebot_versendet: [
    { title: "Nachfass-Termin planen (7 Tage)", role: "kundenberater", daysOffset: 7, priority: "normal", responsibleParty: "auftragnehmer", description: "Ersten Nachfass-Anruf beim Kunden durchführen" },
  ],
  nachfassen: [
    { title: "Kunden kontaktieren", role: "kundenberater", daysOffset: 1, priority: "hoch", responsibleParty: "auftragnehmer", description: "Telefonisch oder per E-Mail nachfassen" },
    { title: "Rückmeldung zum Angebot geben", role: "kundenberater", daysOffset: 5, priority: "normal", responsibleParty: "auftraggeber", description: "Kunde soll Rückmeldung zum Angebot geben" },
  ],
  auftrag_gewonnen: [
    { title: "Auftragsbestätigung erstellen", role: "buero", daysOffset: 1, priority: "dringend", responsibleParty: "auftragnehmer", description: "Auftragsbestätigung aus Angebot generieren und versenden" },
    { title: "Baustelle anlegen und planen", role: "projektleiter", daysOffset: 3, priority: "hoch", responsibleParty: "auftragnehmer", description: "Baustelle im System anlegen, Team und Geräte zuweisen" },
    { title: "Vollmacht/Genehmigungen einholen", role: "buero", daysOffset: 5, priority: "normal", responsibleParty: "auftraggeber", description: "Kunde muss ggf. Vollmachten und Genehmigungen bereitstellen" },
  ],
  planung: [
    { title: "Ressourcen buchen (Team + Geräte)", role: "at_leiter", daysOffset: 5, priority: "hoch", responsibleParty: "auftragnehmer", description: "Team und Arbeitsbühne für den Einsatzzeitraum reservieren" },
    { title: "Straßensperre beantragen (falls nötig)", role: "buero", daysOffset: 14, priority: "normal", responsibleParty: "auftragnehmer", description: "Bei Bedarf Straßensperrung bei der Gemeinde beantragen" },
    { title: "Bewohnerinformation erstellen", role: "buero", daysOffset: 7, priority: "normal", responsibleParty: "auftragnehmer", description: "Aushang für Mieter/Bewohner vorbereiten" },
  ],
  vorbereitung: [
    { title: "Vorher-Dokumentation durchführen", role: "at_leiter", daysOffset: 2, priority: "dringend", responsibleParty: "auftragnehmer", description: "Alle Gebäudeseiten fotografisch dokumentieren (Pflicht vor Start)" },
    { title: "Baustelleneinrichtung vorbereiten", role: "at_leiter", daysOffset: 1, priority: "hoch", responsibleParty: "auftragnehmer", description: "Material, Geräte und Absperrungen vorbereiten" },
    { title: "Bewohnerinformation verteilen", role: "buero", daysOffset: 3, priority: "normal", responsibleParty: "auftraggeber", description: "Aushang an alle betroffenen Mieter/Bewohner verteilen" },
  ],
  durchfuehrung: [
    { title: "Täglichen Baubericht erstellen", role: "at_leiter", daysOffset: 1, priority: "hoch", responsibleParty: "auftragnehmer", description: "Arbeitsbeginn, Fortschritt und Arbeitsende dokumentieren" },
    { title: "Qualitätskontrolle durchführen", role: "projektleiter", daysOffset: 7, priority: "normal", responsibleParty: "auftragnehmer", description: "Zwischenkontrolle der Reinigungsqualität" },
  ],
  abnahme: [
    { title: "Nachher-Dokumentation durchführen", role: "at_leiter", daysOffset: 1, priority: "dringend", responsibleParty: "auftragnehmer", description: "Alle Gebäudeseiten nach Reinigung fotografisch dokumentieren" },
    { title: "Abnahme-Termin vereinbaren", role: "projektleiter", daysOffset: 2, priority: "hoch", responsibleParty: "auftragnehmer", description: "Termin für gemeinsame Abnahme mit dem Kunden abstimmen" },
    { title: "Abnahme bestätigen", role: "projektleiter", daysOffset: 5, priority: "hoch", responsibleParty: "auftraggeber", description: "Kunde bestätigt die ordnungsgemäße Durchführung" },
  ],
  abgeschlossen: [
    { title: "Rechnung erstellen und versenden", role: "buero", daysOffset: 2, priority: "dringend", responsibleParty: "auftragnehmer", description: "Schlussrechnung aus Auftragsdaten generieren" },
    { title: "Garantieurkunde erstellen", role: "buero", daysOffset: 3, priority: "normal", responsibleParty: "auftragnehmer", description: "Garantieurkunde nach Zahlungseingang aktivieren" },
    { title: "Kundenfeedback einholen", role: "kundenberater", daysOffset: 7, priority: "niedrig", responsibleParty: "auftragnehmer", description: "Kundenzufriedenheit erfragen und dokumentieren" },
  ],
};

/**
 * Gibt die automatisch zu erstellenden Aufgaben für eine Phase zurück.
 */
export function getPhaseAutoTasks(phase: string): PhaseTask[] {
  return PHASE_AUTO_TASKS[phase] || [];
}

// ============================================
// DOKUMENTEN-KETTE
// ============================================

export interface DocumentChainLink {
  fromCategory: string;
  toCategory: string;
  trigger: string;
  description: string;
}

/**
 * Definiert die automatische Dokumenten-Verknüpfung.
 * Wenn ein Dokument einer Kategorie erstellt wird, wird es automatisch
 * mit dem vorherigen Dokument in der Kette verknüpft.
 */
export const DOCUMENT_CHAIN: DocumentChainLink[] = [
  { fromCategory: "angebot", toCategory: "auftragsbestaetigung", trigger: "acceptFromOffer", description: "Auftragsbestätigung wird aus Angebot generiert" },
  { fromCategory: "auftragsbestaetigung", toCategory: "rechnung", trigger: "createInvoice", description: "Rechnung referenziert Auftragsbestätigung" },
  { fromCategory: "rechnung", toCategory: "garantie", trigger: "createWarranty", description: "Garantie wird nach Zahlungseingang aktiviert" },
];

/**
 * Findet das vorherige Dokument in der Kette für eine gegebene Kategorie.
 */
export function findPreviousInChain(category: string): DocumentChainLink | undefined {
  return DOCUMENT_CHAIN.find(link => link.toCategory === category);
}

/**
 * Findet das nächste Dokument in der Kette für eine gegebene Kategorie.
 */
export function findNextInChain(category: string): DocumentChainLink | undefined {
  return DOCUMENT_CHAIN.find(link => link.fromCategory === category);
}

// ============================================
// SIDEBAR-HERVORHEBUNG
// ============================================

/**
 * Gibt den empfohlenen Sidebar-Menüpunkt für die aktuelle Projektphase zurück.
 * Wird für kontextabhängige Hervorhebung der nächsten Aktion verwendet.
 */
export function getHighlightedSidebarItem(phase: string): string | null {
  const mapping: Record<string, string> = {
    objektaufnahme: "Immobilien",
    angebot_erstellt: "Angebote",
    angebot_versendet: "Angebote",
    nachfassen: "Projekte",
    auftrag_gewonnen: "Aufträge",
    planung: "Einsatzplanung",
    vorbereitung: "Baustellen",
    durchfuehrung: "Baustellen",
    abnahme: "Baustellen",
    abgeschlossen: "Projekte",
  };
  return mapping[phase] || null;
}
