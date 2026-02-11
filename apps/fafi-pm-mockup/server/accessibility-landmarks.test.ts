/**
 * Accessibility Landmarks Test
 * 
 * Prüft, dass alle Layout-Komponenten korrekte WCAG 2.1 AA Landmarks enthalten:
 * - <main> mit id="main-content" und role="main"
 * - <aside> oder <nav> für Sidebar
 * - <header> für Kopfzeile
 * - aria-label für alle Landmarks
 * - Skip-to-content Link
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const dashboardLayoutPath = resolve(__dirname, "../client/src/components/DashboardLayout.tsx");
const skeletonPath = resolve(__dirname, "../client/src/components/DashboardLayoutSkeleton.tsx");
const skipContentPath = resolve(__dirname, "../client/src/components/SkipToContent.tsx");
const indexHtmlPath = resolve(__dirname, "../client/index.html");

describe("WCAG 2.1 AA – Landmarks", () => {
  const dashboardLayout = readFileSync(dashboardLayoutPath, "utf-8");
  const skeleton = readFileSync(skeletonPath, "utf-8");

  it("DashboardLayout sollte ein <main> Element mit id='main-content' haben", () => {
    expect(dashboardLayout).toContain('id="main-content"');
    expect(dashboardLayout).toContain('role="main"');
    expect(dashboardLayout).toMatch(/<main\s/);
  });

  it("DashboardLayout sollte ein <aside> für die Sidebar haben", () => {
    expect(dashboardLayout).toMatch(/<aside\s/);
    expect(dashboardLayout).toContain('aria-label');
  });

  it("DashboardLayout sollte ein <header> für die Kopfzeile haben", () => {
    expect(dashboardLayout).toMatch(/<header\s/);
    expect(dashboardLayout).toContain('aria-label="Kopfzeile"');
  });

  it("DashboardLayout sollte ein <nav> für die Navigation haben", () => {
    expect(dashboardLayout).toMatch(/<nav\s/);
  });

  it("DashboardLayoutSkeleton sollte ein <main> Element haben", () => {
    expect(skeleton).toContain('id="main-content"');
    expect(skeleton).toContain('role="main"');
    expect(skeleton).toMatch(/<main\s/);
  });

  it("DashboardLayoutSkeleton sollte ein <nav> für die Navigation haben", () => {
    expect(skeleton).toMatch(/<nav\s/);
    expect(skeleton).toContain('aria-label');
  });
});

describe("WCAG 2.1 AA – Skip Navigation", () => {
  it("SkipToContent Komponente sollte existieren", () => {
    const skipContent = readFileSync(skipContentPath, "utf-8");
    expect(skipContent).toContain('#main-content');
    expect(skipContent).toContain('Zum Hauptinhalt springen');
  });
});

describe("WCAG 2.1 AA – HTML Lang Attribut", () => {
  it("index.html sollte lang='de' haben", () => {
    const indexHtml = readFileSync(indexHtmlPath, "utf-8");
    expect(indexHtml).toMatch(/<html\s+lang="de"/);
  });

  it("index.html sollte ein Viewport-Meta-Tag haben", () => {
    const indexHtml = readFileSync(indexHtmlPath, "utf-8");
    expect(indexHtml).toContain('name="viewport"');
    expect(indexHtml).toContain('width=device-width');
  });
});

describe("WCAG 2.1 AA – Farbkontrast-Variablen", () => {
  const cssContent = readFileSync(resolve(__dirname, "../client/src/index.css"), "utf-8");

  it("sollte separate background und foreground CSS-Variablen definieren", () => {
    expect(cssContent).toContain("--background:");
    expect(cssContent).toContain("--foreground:");
    expect(cssContent).toContain("--card:");
    expect(cssContent).toContain("--card-foreground:");
    expect(cssContent).toContain("--popover:");
    expect(cssContent).toContain("--popover-foreground:");
  });

  it("sollte Dark-Mode-Variablen definieren", () => {
    expect(cssContent).toContain(".dark");
  });
});
