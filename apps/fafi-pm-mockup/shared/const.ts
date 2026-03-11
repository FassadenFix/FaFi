export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Re-export IMAGES from dedicated module for backward compatibility
export { IMAGES } from "./images";

/**
 * Projektphasen gemäß Konzeptionsdokument.
 * Für erweiterte Phasen-Metadaten (Guards, Transitions) siehe shared/schemas/workflow.ts.
 */
export const PROJECT_PHASES = [
  { id: 1, name: "OBJEKTAUFNAHME", label: "Objektaufnahme", color: "#77bc1f" },
  { id: 2, name: "ANGEBOT_ERSTELLT", label: "Angebot erstellt", color: "#77bc1f" },
  { id: 3, name: "ANGEBOT_VERSENDET", label: "Angebot versendet", color: "#77bc1f" },
  { id: 4, name: "NACHFASSEN", label: "Nachfassen", color: "#f59e0b" },
  { id: 5, name: "AUFTRAG_GEWONNEN", label: "Auftrag gewonnen", color: "#77bc1f" },
  { id: 6, name: "PLANUNG", label: "Planung", color: "#3b82f6" },
  { id: 7, name: "VORBEREITUNG", label: "Vorbereitung", color: "#3b82f6" },
  { id: 8, name: "DURCHFUEHRUNG", label: "Durchführung", color: "#3b82f6" },
  { id: 9, name: "ABNAHME", label: "Abnahme", color: "#8b5cf6" },
  { id: 10, name: "ABGESCHLOSSEN", label: "Abgeschlossen", color: "#10b981" },
  { id: 99, name: "VERLOREN", label: "Verloren", color: "#ef4444" },
];
