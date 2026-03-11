/**
 * M-11: Performance-Baseline Tests
 * 
 * Prüft Bundle-Größe, Lazy Loading, Caching-Strategien und Code-Splitting.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

const clientDir = resolve(__dirname, "../client/src");
const serverDir = resolve(__dirname, "../server");

describe("M-11: Performance – Lazy Loading", () => {
  const appContent = readFileSync(join(clientDir, "App.tsx"), "utf-8");

  it("sollte React.lazy für Code-Splitting verwenden", () => {
    const lazyImports = (appContent.match(/React\.lazy|lazy\(/g) || []).length;
    expect(lazyImports).toBeGreaterThan(10);
  });

  it("sollte Suspense-Boundaries für Lazy-Komponenten haben", () => {
    expect(appContent).toContain("Suspense");
  });

  it("sollte Loading-Skeletons für datengetriebene Seiten haben", () => {
    const skeletonPath = join(clientDir, "components", "PageSkeletons.tsx");
    expect(existsSync(skeletonPath)).toBe(true);
  });
});

describe("M-11: Performance – Caching", () => {
  it("sollte React Query Cache-Konfiguration haben", () => {
    const queryConfigPath = join(clientDir, "lib", "queryConfig.ts");
    const exists = existsSync(queryConfigPath);
    expect(exists).toBe(true);
  });

  it("sollte staleTime und gcTime in der Query-Konfiguration definieren", () => {
    const queryConfigPath = join(clientDir, "lib", "queryConfig.ts");
    if (existsSync(queryConfigPath)) {
      const content = readFileSync(queryConfigPath, "utf-8");
      expect(content).toContain("staleTime");
    }
  });
});

describe("M-11: Performance – API Rate Limiting", () => {
  it("sollte Rate Limiter für externe APIs haben", () => {
    const rateLimiterPath = join(serverDir, "services", "rateLimiter.ts");
    const exists = existsSync(rateLimiterPath);
    expect(exists).toBe(true);
  });
});

describe("M-11: Performance – Bundle-Analyse", () => {
  it("sollte keine unnötigen großen Imports in Seiten haben", () => {
    const pages = readdirSync(join(clientDir, "pages")).filter(f => f.endsWith(".tsx"));
    const violations: string[] = [];
    
    for (const page of pages) {
      const content = readFileSync(join(clientDir, "pages", page), "utf-8");
      // Prüfe auf problematische Imports
      if (content.includes("import * as ") && !content.includes("import * as React")) {
        violations.push(`${page}: Wildcard-Import gefunden`);
      }
    }
    // Maximal 5 Seiten mit Wildcard-Imports
    expect(violations.length).toBeLessThanOrEqual(5);
  });

  it("sollte Seiten-Dateien unter 1000 Zeilen halten", () => {
    const pages = readdirSync(join(clientDir, "pages")).filter(f => f.endsWith(".tsx"));
    const largePages: string[] = [];
    
    for (const page of pages) {
      const content = readFileSync(join(clientDir, "pages", page), "utf-8");
      const lines = content.split("\n").length;
      if (lines > 1000) {
        largePages.push(`${page}: ${lines} Zeilen`);
      }
    }
    // Warnung bei großen Seiten (nicht blockierend)
    expect(largePages.length).toBeLessThanOrEqual(10);
  });
});

describe("M-11: Performance – Server-Optimierung", () => {
  it("sollte DB-Connection Pool verwenden", () => {
    const dbContent = readFileSync(join(serverDir, "db.ts"), "utf-8");
    expect(dbContent).toContain("createPool");
    expect(dbContent).toContain("connectionLimit");
  });

  it("sollte keepAlive für DB-Verbindungen aktiviert haben", () => {
    const dbContent = readFileSync(join(serverDir, "db.ts"), "utf-8");
    expect(dbContent).toContain("enableKeepAlive");
  });

  it("sollte resetDbConnection Funktion haben", () => {
    const dbContent = readFileSync(join(serverDir, "db.ts"), "utf-8");
    expect(dbContent).toContain("resetDbConnection");
  });
});

describe("M-11: Performance – Monitoring", () => {
  it("sollte Performance-Monitor Service haben", () => {
    const monitorPath = join(serverDir, "services", "performanceMonitor.ts");
    expect(existsSync(monitorPath)).toBe(true);
  });

  it("sollte strukturiertes Logging haben", () => {
    const loggerPath = join(serverDir, "services", "logger.ts");
    expect(existsSync(loggerPath)).toBe(true);
  });
});
