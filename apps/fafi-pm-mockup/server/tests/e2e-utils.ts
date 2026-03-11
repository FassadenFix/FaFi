/**
 * E2E-Test-Utilities und Fixtures
 * Wiederverwendbare Helfer für alle E2E-Tests
 */

// ============================================
// Test-Fixtures: Realistische Testdaten
// ============================================

export const TEST_COMPANY = {
  name: "Test Wohnbau GmbH",
  email: "test@wohnbau.de",
  phone: "030-12345678",
  address: "Teststraße 1, 10115 Berlin",
  city: "Berlin",
  postalCode: "10115",
  industry: "Wohnungswirtschaft",
};

export const TEST_CONTACT = {
  firstName: "Max",
  lastName: "Testmann",
  email: "max@wohnbau.de",
  phone: "030-87654321",
  position: "Hausverwalter",
};

export const TEST_PROJECT = {
  name: "Testwohnanlage Musterweg",
  description: "Fassadenreinigung von 5 Mehrfamilienhäusern",
  phase: "objektaufnahme" as const,
  estimatedArea: 4500,
  estimatedValue: 22500,
};

export const TEST_PROPERTY = {
  address: "Musterweg 1-5",
  city: "Berlin",
  postalCode: "10115",
  buildingType: "Mehrfamilienhaus",
  floors: 5,
  constructionYear: 1985,
  facadeType: "WDVS (Wärmedämmverbundsystem)",
  facadeArea: 900,
  facadeCondition: "mittel",
};

export const TEST_OFFER = {
  title: "Angebot Fassadenreinigung Musterweg",
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
  totalNet: 22500,
  taxRate: 19,
  totalGross: 26775,
};

export const TEST_CONSTRUCTION_SITE = {
  name: "Baustelle Musterweg",
  address: "Musterweg 1-5, 10115 Berlin",
  status: "geplant" as const,
  plannedStart: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  plannedEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
};

// ============================================
// Workflow-Simulation Helpers
// ============================================

/**
 * Simuliert den vollständigen Projekt-Lebenszyklus
 */
export function getProjectLifecyclePhases(): string[] {
  return [
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
  ];
}

/**
 * Simuliert einen Baustellen-Tagesablauf
 */
export function getDayWorkflowSteps(): Array<{
  step: string;
  type: string;
  description: string;
}> {
  return [
    { step: "morgen_planung", type: "arbeitsbeginn", description: "Tagesplanung und Teamleitercheck" },
    { step: "arbeit_vormittag", type: "fortschritt", description: "Reinigungsarbeiten Vormittag" },
    { step: "mittagspause", type: "pause", description: "Mittagspause 12:00-12:45" },
    { step: "arbeit_nachmittag", type: "fortschritt", description: "Reinigungsarbeiten Nachmittag" },
    { step: "abend_abschluss", type: "arbeitsende", description: "Tagesabschluss und Dokumentation" },
  ];
}

/**
 * Simuliert Kundenportal-Navigation
 */
export function getCustomerPortalPages(): Array<{
  path: string;
  title: string;
  requiresAuth: boolean;
}> {
  return [
    { path: "/kundenportal", title: "Kundenportal Startseite", requiresAuth: false },
    { path: "/kundenportal/projekte", title: "Meine Projekte", requiresAuth: true },
    { path: "/kundenportal/dokumente", title: "Dokumente", requiresAuth: true },
    { path: "/kundenportal/nachrichten", title: "Nachrichten", requiresAuth: true },
    { path: "/kundenportal/feedback", title: "Feedback", requiresAuth: true },
  ];
}

// ============================================
// Assertion Helpers
// ============================================

/**
 * Prüft ob ein Phasenübergang gültig ist
 */
export function isValidPhaseTransition(from: string, to: string): boolean {
  const validTransitions: Record<string, string[]> = {
    objektaufnahme: ["angebot_erstellt"],
    angebot_erstellt: ["angebot_versendet"],
    angebot_versendet: ["nachfassen", "auftrag_gewonnen", "verloren"],
    nachfassen: ["auftrag_gewonnen", "verloren"],
    auftrag_gewonnen: ["planung"],
    planung: ["vorbereitung"],
    vorbereitung: ["durchfuehrung"],
    durchfuehrung: ["abnahme"],
    abnahme: ["abgeschlossen"],
  };
  return validTransitions[from]?.includes(to) || false;
}

/**
 * Prüft ob eine Ampel-Farbe gültig ist
 */
export function isValidAmpelStatus(status: string): boolean {
  return ["gruen", "gelb", "rot"].includes(status);
}

/**
 * Generiert eine zufällige Projektnummer
 */
export function generateTestProjectNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `FF-${year}-${num}`;
}

// ============================================
// Mock-Data Generators
// ============================================

/**
 * Generiert N Testprojekte mit verschiedenen Phasen
 */
export function generateTestProjects(count: number) {
  const phases = getProjectLifecyclePhases();
  return Array.from({ length: count }, (_, i) => ({
    ...TEST_PROJECT,
    name: `Testprojekt ${i + 1}`,
    phase: phases[i % phases.length],
    estimatedValue: Math.floor(Math.random() * 50000) + 5000,
  }));
}

/**
 * Generiert Testaufgaben für ein Projekt
 */
export function generateTestTasks(projectId: number, count: number) {
  const statuses = ["offen", "in_bearbeitung", "erledigt"] as const;
  return Array.from({ length: count }, (_, i) => ({
    projectId,
    title: `Testaufgabe ${i + 1}`,
    description: `Beschreibung für Aufgabe ${i + 1}`,
    status: statuses[i % statuses.length],
    dueDate: new Date(Date.now() + (i - 2) * 24 * 60 * 60 * 1000),
    priority: i % 3 === 0 ? "hoch" : i % 3 === 1 ? "mittel" : "niedrig",
  }));
}
