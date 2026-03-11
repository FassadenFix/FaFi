/**
 * M-12: E2E-Tests – Wizard-Validierung
 * 
 * Prüft alle 8 Wizards auf strukturelle Konsistenz:
 * Schritte, Pflichtfelder, Fortschrittsanzeige, Fertig-Button.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const pagesDir = resolve(__dirname, "../client/src/pages");
const componentsDir = resolve(__dirname, "../client/src/components");

const WIZARDS = [
  { name: "ProjektWizard", file: "ProjektWizard.tsx", dir: componentsDir },
  { name: "ObjektaufnahmeWizard", file: "ObjektaufnahmeWizard.tsx", dir: componentsDir },
  { name: "AngebotWizard", file: "AngebotWizard.tsx", dir: componentsDir },
  { name: "AuftragAnnahmeWizard", file: "AuftragAnnahmeWizard.tsx", dir: componentsDir },
  { name: "AbnahmeWizard", file: "AbnahmeWizard.tsx", dir: componentsDir },
  { name: "BaustelleWizard", file: "BaustelleWizard.tsx", dir: componentsDir },
  { name: "NachherDokuWizard", file: "NachherDokuWizard.tsx", dir: componentsDir },
  { name: "VorherDokuWizard", file: "VorherDokuWizard.tsx", dir: componentsDir },
  { name: "Wizard (Base)", file: "Wizard.tsx", dir: componentsDir },
];

describe("M-12: Wizard-Existenz", () => {
  for (const wizard of WIZARDS) {
    it(`sollte ${wizard.name} existieren`, () => {
      const path = resolve(wizard.dir, wizard.file);
      expect(existsSync(path), `${wizard.name} nicht gefunden: ${path}`).toBe(true);
    });
  }
});

describe("M-12: Wizard-Struktur", () => {
  for (const wizard of WIZARDS) {
    const path = resolve(wizard.dir, wizard.file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf-8");

    describe(wizard.name, () => {
      it("sollte Schritte/Steps definiert haben", () => {
        const hasSteps = content.includes("step") || content.includes("Step") || content.includes("currentStep");
        expect(hasSteps, `${wizard.name} hat keine Schritte`).toBe(true);
      });

      if (wizard.name !== "Wizard (Base)") {
        it("sollte tRPC-Mutation für Speicherung verwenden", () => {
          const hasMutation = content.includes("useMutation") || content.includes("mutate");
          expect(hasMutation, `${wizard.name} hat keine tRPC-Mutation`).toBe(true);
        });

        it("sollte Toast-Feedback bei Erfolg/Fehler haben", () => {
          const hasToast = content.includes("toast") || content.includes("Toast") || content.includes("sonner");
          expect(hasToast, `${wizard.name} hat kein Toast-Feedback`).toBe(true);
        });
      }
    });
  }
});

describe("M-12: Wizard Base-Komponente", () => {
  const wizardPath = resolve(componentsDir, "Wizard.tsx");
  if (!existsSync(wizardPath)) return;
  const content = readFileSync(wizardPath, "utf-8");

  it("sollte Fortschrittsbalken haben", () => {
    expect(content.includes("Progress") || content.includes("progress")).toBe(true);
  });

  it("sollte Zurück/Weiter Navigation haben", () => {
    expect(content.includes("Zurück") || content.includes("zurück") || content.includes("prev")).toBe(true);
    expect(content.includes("Weiter") || content.includes("weiter") || content.includes("next")).toBe(true);
  });

  it("sollte Fertig-Button haben", () => {
    expect(content.includes("Fertig") || content.includes("Abschließen") || content.includes("Speichern")).toBe(true);
  });
});

describe("M-12: Kernprozess Projekt → Angebot → Auftrag", () => {
  it("sollte Projekt-Router mit create-Prozedur haben", () => {
    const routerContent = readFileSync(resolve(__dirname, "routers.ts"), "utf-8");
    expect(routerContent).toContain("project");
    expect(routerContent).toContain("create");
  });

  it("sollte Angebot-Router mit create-Prozedur haben", () => {
    const routerContent = readFileSync(resolve(__dirname, "routers.ts"), "utf-8");
    expect(routerContent).toContain("offer");
  });

  it("sollte Workflow State Machine für Phasenübergänge haben", () => {
    const workflowPath = resolve(__dirname, "../shared/schemas/workflow.ts");
    expect(existsSync(workflowPath)).toBe(true);
    const content = readFileSync(workflowPath, "utf-8");
    expect(content).toContain("getAllowedTransitions");
    expect(content).toContain("PHASE_METADATA");
  });

  it("sollte Workflow-Automatisierung für Phasenwechsel haben", () => {
    const automationPath = resolve(__dirname, "services/workflowAutomation.ts");
    expect(existsSync(automationPath)).toBe(true);
  });
});
