import { z } from "zod";

/**
 * FaFi PM Workflow Schemas
 * 
 * Definiert alle erlaubten Phasenübergänge, Voraussetzungen und Validierung
 * für den FassadenFix Projektmanagement-Workflow.
 */

// ============================================
// PHASE TYPES
// ============================================

export const ProjectPhaseEnum = z.enum([
  "objektaufnahme",
  "angebot_erstellt",
  "angebot_versendet",
  "nachfassen",
  "auftrag_gewonnen",
  "planung",
  "vorbereitung",
  "durchfuehrung",
  "abnahme",
  "abgeschlossen",
  "verloren",
]);

export type ProjectPhase = z.infer<typeof ProjectPhaseEnum>;

// ============================================
// TRIGGER TYPES
// ============================================

export const TransitionTriggerEnum = z.enum([
  "auto",     // Automatisch durch System-Aktion (z.B. Angebot gespeichert)
  "manual",   // Manuell durch Benutzer
  "system",   // System-Event (z.B. Timer abgelaufen)
]);

export type TransitionTrigger = z.infer<typeof TransitionTriggerEnum>;

// ============================================
// PHASE TRANSITION DEFINITION
// ============================================

export interface PhaseTransitionDef {
  from: ProjectPhase;
  to: ProjectPhase;
  label: string;
  description: string;
  guardName: string; // Name der Guard-Funktion
  autoTrigger: boolean; // Wird automatisch ausgelöst?
  requiresConfirmation: boolean; // Braucht Benutzer-Bestätigung?
}

// ============================================
// ERLAUBTE PHASENÜBERGÄNGE
// ============================================

export const PHASE_TRANSITIONS: PhaseTransitionDef[] = [
  // Vertriebsphase
  {
    from: "objektaufnahme",
    to: "angebot_erstellt",
    label: "Angebot erstellt",
    description: "Mindestens eine Objektaufnahme und ein Angebot müssen vorhanden sein",
    guardName: "hasOffer",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  {
    from: "angebot_erstellt",
    to: "angebot_versendet",
    label: "Angebot versendet",
    description: "Das Angebot wurde per E-Mail an den Kunden versendet",
    guardName: "offerIsSent",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  {
    from: "angebot_versendet",
    to: "nachfassen",
    label: "Nachfassen fällig",
    description: "7+ Tage seit Angebotsversand ohne Rückmeldung",
    guardName: "followUpDue",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  {
    from: "angebot_versendet",
    to: "auftrag_gewonnen",
    label: "Auftrag gewonnen",
    description: "Kunde hat das Angebot angenommen, Auftrag existiert",
    guardName: "hasOrder",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  {
    from: "nachfassen",
    to: "auftrag_gewonnen",
    label: "Auftrag gewonnen",
    description: "Kunde hat nach Nachfassen zugesagt",
    guardName: "hasOrder",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  // Verloren aus Vertriebsphasen
  {
    from: "angebot_versendet",
    to: "verloren",
    label: "Auftrag verloren",
    description: "Kunde hat abgelehnt oder nicht reagiert",
    guardName: "always",
    autoTrigger: false,
    requiresConfirmation: true,
  },
  {
    from: "nachfassen",
    to: "verloren",
    label: "Auftrag verloren",
    description: "Nachfassen war erfolglos",
    guardName: "always",
    autoTrigger: false,
    requiresConfirmation: true,
  },

  // Ausführungsphase
  {
    from: "auftrag_gewonnen",
    to: "planung",
    label: "Planung starten",
    description: "Baustelle wurde angelegt, Planung beginnt",
    guardName: "hasConstructionSite",
    autoTrigger: false,
    requiresConfirmation: false,
  },
  {
    from: "planung",
    to: "vorbereitung",
    label: "Vorbereitung starten",
    description: "Einsatzplan erstellt, Team und Geräte zugewiesen",
    guardName: "hasTeamAssigned",
    autoTrigger: false,
    requiresConfirmation: false,
  },
  {
    from: "vorbereitung",
    to: "durchfuehrung",
    label: "Durchführung starten",
    description: "Baustelle wurde gestartet",
    guardName: "constructionSiteActive",
    autoTrigger: true,
    requiresConfirmation: false,
  },
  {
    from: "durchfuehrung",
    to: "abnahme",
    label: "Abnahme einleiten",
    description: "Arbeiten abgeschlossen, bereit für Abnahme",
    guardName: "constructionSiteComplete",
    autoTrigger: false,
    requiresConfirmation: true,
  },
  {
    from: "abnahme",
    to: "abgeschlossen",
    label: "Projekt abschließen",
    description: "Abnahmeprotokoll erstellt und unterschrieben",
    guardName: "hasAcceptanceProtocol",
    autoTrigger: true,
    requiresConfirmation: false,
  },
];

// ============================================
// PHASEN-METADATEN
// ============================================

export interface PhaseMetadata {
  phase: ProjectPhase;
  label: string;
  color: string;
  category: "vertrieb" | "ausfuehrung" | "abschluss" | "sonder";
  order: number;
  nextStepLabel: string;
  nextStepRoute: (projectId: number) => string;
}

export const PHASE_METADATA: PhaseMetadata[] = [
  {
    phase: "objektaufnahme",
    label: "Objektaufnahme",
    color: "#77bc1f",
    category: "vertrieb",
    order: 1,
    nextStepLabel: "Angebot erstellen",
    nextStepRoute: (pid) => `/angebote/neu?projektId=${pid}`,
  },
  {
    phase: "angebot_erstellt",
    label: "Angebot erstellt",
    color: "#77bc1f",
    category: "vertrieb",
    order: 2,
    nextStepLabel: "Angebot versenden",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "angebot_versendet",
    label: "Angebot versendet",
    color: "#77bc1f",
    category: "vertrieb",
    order: 3,
    nextStepLabel: "Nachfassen",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "nachfassen",
    label: "Nachfassen",
    color: "#f59e0b",
    category: "vertrieb",
    order: 4,
    nextStepLabel: "Kunde kontaktieren",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "auftrag_gewonnen",
    label: "Auftrag gewonnen",
    color: "#77bc1f",
    category: "vertrieb",
    order: 5,
    nextStepLabel: "Baustelle planen",
    nextStepRoute: (pid) => `/baustellen/neu?projektId=${pid}`,
  },
  {
    phase: "planung",
    label: "Planung",
    color: "#3b82f6",
    category: "ausfuehrung",
    order: 6,
    nextStepLabel: "Vorbereitung starten",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "vorbereitung",
    label: "Vorbereitung",
    color: "#3b82f6",
    category: "ausfuehrung",
    order: 7,
    nextStepLabel: "Durchführung starten",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "durchfuehrung",
    label: "Durchführung",
    color: "#3b82f6",
    category: "ausfuehrung",
    order: 8,
    nextStepLabel: "Tagesbericht erstellen",
    nextStepRoute: (pid) => `/baustellen?projektId=${pid}`,
  },
  {
    phase: "abnahme",
    label: "Abnahme",
    color: "#8b5cf6",
    category: "abschluss",
    order: 9,
    nextStepLabel: "Abnahme durchführen",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "abgeschlossen",
    label: "Abgeschlossen",
    color: "#10b981",
    category: "abschluss",
    order: 10,
    nextStepLabel: "Projekt abgeschlossen",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
  {
    phase: "verloren",
    label: "Verloren",
    color: "#ef4444",
    category: "sonder",
    order: 99,
    nextStepLabel: "Projekt verloren",
    nextStepRoute: (pid) => `/projekte/${pid}`,
  },
];

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const AdvancePhaseInputSchema = z.object({
  projectId: z.number().int().positive(),
  targetPhase: ProjectPhaseEnum,
  trigger: TransitionTriggerEnum.default("manual"),
  reason: z.string().optional(), // Pflicht bei "verloren"
});

export type AdvancePhaseInput = z.infer<typeof AdvancePhaseInputSchema>;

export const PhaseTransitionResultSchema = z.object({
  success: z.boolean(),
  fromPhase: ProjectPhaseEnum,
  toPhase: ProjectPhaseEnum,
  message: z.string(),
});

export type PhaseTransitionResult = z.infer<typeof PhaseTransitionResultSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gibt alle erlaubten Ziel-Phasen für eine gegebene Phase zurück
 */
export function getAllowedTransitions(currentPhase: ProjectPhase): PhaseTransitionDef[] {
  return PHASE_TRANSITIONS.filter((t) => t.from === currentPhase);
}

/**
 * Prüft ob ein Übergang grundsätzlich erlaubt ist (ohne Guard-Check)
 */
export function isTransitionAllowed(from: ProjectPhase, to: ProjectPhase): boolean {
  return PHASE_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

/**
 * Gibt die Metadaten einer Phase zurück
 */
export function getPhaseMetadata(phase: ProjectPhase): PhaseMetadata | undefined {
  return PHASE_METADATA.find((m) => m.phase === phase);
}

/**
 * Gibt die nächste logische Phase zurück (ohne Sonderphasen)
 */
export function getNextPhase(currentPhase: ProjectPhase): ProjectPhase | null {
  const current = PHASE_METADATA.find((m) => m.phase === currentPhase);
  if (!current || current.order >= 10) return null;
  const next = PHASE_METADATA.find((m) => m.order === current.order + 1);
  return next?.phase ?? null;
}
