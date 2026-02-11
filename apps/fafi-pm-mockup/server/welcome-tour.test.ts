/**
 * Welcome Tour – Konfigurationsvalidierung
 * Prüft: Tour-Steps, Konsistenz, Vollständigkeit, Sprache
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Read the Onboarding component source
const onboardingSource = fs.readFileSync(
  path.resolve(__dirname, "../client/src/components/Onboarding.tsx"),
  "utf-8"
);

// Read the DashboardLayout for data-tour attributes
const dashboardLayoutSource = fs.readFileSync(
  path.resolve(__dirname, "../client/src/components/DashboardLayout.tsx"),
  "utf-8"
);

// Read the Dashboard page for data-tour attributes
const dashboardSource = fs.readFileSync(
  path.resolve(__dirname, "../client/src/pages/Dashboard.tsx"),
  "utf-8"
);

// Read the Einstellungen page for restart button
const einstellungenSource = fs.readFileSync(
  path.resolve(__dirname, "../client/src/pages/Einstellungen.tsx"),
  "utf-8"
);

describe("Welcome Tour – Konfiguration", () => {
  it("sollte mindestens 10 Tour-Steps haben", () => {
    // Count tour step objects by looking for id: patterns
    const stepMatches = onboardingSource.match(/id:\s*"/g);
    expect(stepMatches).toBeTruthy();
    expect(stepMatches!.length).toBeGreaterThanOrEqual(10);
  });

  it("sollte einen Welcome-Step und einen Completion-Step haben", () => {
    expect(onboardingSource).toContain('id: "welcome"');
    expect(onboardingSource).toContain('id: "complete"');
  });

  it("sollte Dashboard-KPIs als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("dashboard-kpis");
  });

  it("sollte Countdown-Aufgaben als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("countdown-tasks");
  });

  it("sollte Kanban-Board als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("kanban-board");
  });

  it("sollte Schnellaktionen als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("quick-actions");
  });

  it("sollte Navigation-Items als Tour-Ziele haben (Projekte, Immobilien, Angebote, Baustellen)", () => {
    expect(onboardingSource).toContain("nav-projekte");
    expect(onboardingSource).toContain("nav-immobilien");
    expect(onboardingSource).toContain("nav-angebote");
    expect(onboardingSource).toContain("nav-baustellen");
  });

  it("sollte Einsatzplanung als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("nav-einsatzplanung");
  });

  it("sollte Finanzen-Sektion als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("section-finanzen");
  });

  it("sollte Archiv/Unternehmenssystem als Tour-Ziel haben", () => {
    expect(onboardingSource).toContain("section-unternehmenssystem");
  });
});

describe("Welcome Tour – data-tour Attribute vorhanden", () => {
  it("Dashboard sollte data-tour='dashboard-kpis' haben", () => {
    expect(dashboardSource).toContain('data-tour="dashboard-kpis"');
  });

  it("Dashboard sollte data-tour='kanban-board' haben", () => {
    expect(dashboardSource).toContain('data-tour="kanban-board"');
  });

  it("Dashboard sollte data-tour='countdown-tasks' haben", () => {
    expect(dashboardSource).toContain('data-tour="countdown-tasks"');
  });

  it("Dashboard sollte data-tour='activity-log' haben", () => {
    expect(dashboardSource).toContain('data-tour="activity-log"');
  });

  it("Dashboard sollte data-tour='quick-actions' haben", () => {
    expect(dashboardSource).toContain('data-tour="quick-actions"');
  });

  it("DashboardLayout sollte data-tour für Nav-Items generieren", () => {
    expect(dashboardLayoutSource).toContain("data-tour={`nav-${item.label");
  });

  it("DashboardLayout sollte data-tour für Sektions-Header generieren", () => {
    expect(dashboardLayoutSource).toContain("data-tour={`section-${section.id}`}");
  });
});

describe("Welcome Tour – Sprache & Tonalität", () => {
  it("sollte handwerkernahe Sprache verwenden (Du-Form)", () => {
    // Check for Du-Form in descriptions
    expect(onboardingSource).toMatch(/\bdu\b|\bdir\b|\bdein\b/i);
  });

  it("sollte keine akademische Sprache verwenden", () => {
    // Should not contain overly formal language
    expect(onboardingSource).not.toContain("Implementierung");
    expect(onboardingSource).not.toContain("Funktionalität");
    expect(onboardingSource).not.toContain("Applikation");
  });

  it("sollte nutzenorientierte Beschreibungen haben", () => {
    // Descriptions should explain what the user gets, not what the feature does
    expect(onboardingSource).toContain("sofort");
    expect(onboardingSource).toContain("einen Klick");
  });

  it("sollte den Welcome-Dialog mit persönlicher Begrüßung haben", () => {
    expect(onboardingSource).toContain("schön dass du da bist");
  });

  it("sollte den Abschluss-Dialog mit Ermutigung haben", () => {
    expect(onboardingSource).toContain("startklar");
  });
});

describe("Welcome Tour – Neustart-Funktion", () => {
  it("sollte localStorage-Keys für Onboarding verwenden", () => {
    expect(onboardingSource).toContain("fafi-onboarding-completed");
    expect(onboardingSource).toContain("fafi-onboarding-skipped");
  });

  it("sollte useOnboarding Hook exportieren", () => {
    expect(onboardingSource).toContain("export function useOnboarding");
  });

  it("sollte restartOnboarding Funktion haben", () => {
    expect(onboardingSource).toContain("restartOnboarding");
  });

  it("Einstellungen sollte Tour-Neustart-Button haben", () => {
    expect(einstellungenSource).toContain("Einführungstour");
    expect(einstellungenSource).toContain("Tour starten");
    expect(einstellungenSource).toContain("fafi-onboarding-completed");
  });
});

describe("Welcome Tour – Spotlight & Navigation", () => {
  it("sollte SpotlightOverlay Komponente haben", () => {
    expect(onboardingSource).toContain("SpotlightOverlay");
  });

  it("sollte TourTooltip Komponente haben", () => {
    expect(onboardingSource).toContain("TourTooltip");
  });

  it("sollte Progress-Anzeige haben", () => {
    expect(onboardingSource).toContain("Progress");
    expect(onboardingSource).toContain("Schritt");
  });

  it("sollte Vor/Zurück-Navigation haben", () => {
    expect(onboardingSource).toContain("Zurück");
    expect(onboardingSource).toContain("Weiter");
    expect(onboardingSource).toContain("Fertig!");
  });

  it("sollte Tour-Beenden-Option haben", () => {
    expect(onboardingSource).toContain("Tour beenden");
  });

  it("sollte Route-Navigation für Steps unterstützen", () => {
    expect(onboardingSource).toContain("route");
    expect(onboardingSource).toContain("setLocation");
  });
});
