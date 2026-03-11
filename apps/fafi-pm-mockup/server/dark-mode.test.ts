/**
 * M-07: Dark Mode CSS-Variablen Konsistenz-Test
 * Prüft, dass alle CSS-Variablen in Light und Dark Mode korrekt definiert sind.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const cssContent = readFileSync(resolve(__dirname, "../client/src/index.css"), "utf-8");

// Extrahiere CSS-Variablen aus einem Block
function extractVariables(block: string): Map<string, string> {
  const vars = new Map<string, string>();
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(block)) !== null) {
    vars.set(match[1], match[2].trim());
  }
  return vars;
}

// Finde :root und .dark Blöcke
function findBlock(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 's');
  const match = regex.exec(css);
  return match ? match[1] : "";
}

describe("M-07: Dark Mode CSS-Variablen", () => {
  const rootVars = extractVariables(findBlock(cssContent, ":root"));
  const darkVars = extractVariables(findBlock(cssContent, ".dark"));

  it("sollte :root (Light Mode) Variablen definiert haben", () => {
    expect(rootVars.size).toBeGreaterThan(10);
  });

  it("sollte .dark (Dark Mode) Variablen definiert haben", () => {
    expect(darkVars.size).toBeGreaterThan(10);
  });

  const requiredPairs = [
    "background", "foreground",
    "card", "card-foreground",
    "popover", "popover-foreground",
    "primary", "primary-foreground",
    "secondary", "secondary-foreground",
    "muted", "muted-foreground",
    "accent", "accent-foreground",
    "destructive", "destructive-foreground",
    "border", "input", "ring",
    "sidebar", "sidebar-foreground",
    "sidebar-primary", "sidebar-primary-foreground",
    "sidebar-accent", "sidebar-accent-foreground",
    "sidebar-border", "sidebar-ring",
  ];

  for (const varName of requiredPairs) {
    it(`sollte --${varName} in :root definiert haben`, () => {
      expect(rootVars.has(varName), `--${varName} fehlt in :root`).toBe(true);
    });

    it(`sollte --${varName} in .dark definiert haben`, () => {
      expect(darkVars.has(varName), `--${varName} fehlt in .dark`).toBe(true);
    });
  }

  it("sollte unterschiedliche Hintergrundfarben für Light und Dark haben", () => {
    expect(rootVars.get("background")).not.toBe(darkVars.get("background"));
  });

  it("sollte unterschiedliche Vordergrundfarben für Light und Dark haben", () => {
    expect(rootVars.get("foreground")).not.toBe(darkVars.get("foreground"));
  });

  it("sollte FassadenFix Primärfarbe in beiden Modi haben", () => {
    // Primärfarbe sollte in beiden Modi FassadenFix-Grün sein
    expect(rootVars.get("primary")).toContain("0.72");
    expect(darkVars.get("primary")).toContain("0.72");
  });
});

describe("M-07: Schriftart-Konsistenz", () => {
  it("sollte Raleway als Schriftart verwenden (nicht Roboto)", () => {
    expect(cssContent).toContain("Raleway");
    expect(cssContent).not.toContain("Roboto");
  });

  it("sollte Raleway in body und Headings verwenden", () => {
    const bodyMatch = cssContent.match(/body\s*\{[^}]*font-family:\s*'([^']+)'/s);
    expect(bodyMatch?.[1]).toBe("Raleway");
    
    const headingMatch = cssContent.match(/h1.*h6\s*\{[^}]*font-family:\s*'([^']+)'/s);
    expect(headingMatch?.[1]).toBe("Raleway");
  });
});

describe("M-07: Google Fonts Import", () => {
  const htmlContent = readFileSync(resolve(__dirname, "../client/index.html"), "utf-8");

  it("sollte Raleway von Google Fonts laden", () => {
    expect(htmlContent).toContain("family=Raleway");
  });

  it("sollte nicht mehr Roboto laden", () => {
    expect(htmlContent).not.toContain("family=Roboto");
  });
});
