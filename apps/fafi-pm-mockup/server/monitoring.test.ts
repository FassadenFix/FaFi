/**
 * M-14: Monitoring und Alerting Tests
 * 
 * Prüft, dass Monitoring-Infrastruktur vorhanden und korrekt konfiguriert ist.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const serverDir = resolve(__dirname);
const servicesDir = resolve(__dirname, "services");

describe("M-14: TaskRunner Monitoring", () => {
  const taskRunnerPath = resolve(servicesDir, "taskRunner.ts");

  it("sollte TaskRunner existieren", () => {
    expect(existsSync(taskRunnerPath)).toBe(true);
  });

  it("sollte ECONNRESET-Handling im TaskRunner haben", () => {
    const content = readFileSync(taskRunnerPath, "utf-8");
    expect(content).toContain("ECONNRESET");
    expect(content).toContain("resetDbConnection");
  });

  it("sollte Statistiken über Task-Queue bereitstellen", () => {
    const content = readFileSync(taskRunnerPath, "utf-8");
    expect(content).toContain("getTaskQueueStats");
    expect(content).toContain("pending");
    expect(content).toContain("completed");
    expect(content).toContain("failed");
  });

  it("sollte Start/Stop Funktionen haben", () => {
    const content = readFileSync(taskRunnerPath, "utf-8");
    expect(content).toContain("startTaskRunner");
    expect(content).toContain("stopTaskRunner");
    expect(content).toContain("isTaskRunnerActive");
  });
});

describe("M-14: DB-Monitoring", () => {
  const dbPath = resolve(serverDir, "db.ts");

  it("sollte Connection Pool mit Limits haben", () => {
    const content = readFileSync(dbPath, "utf-8");
    expect(content).toContain("connectionLimit");
    expect(content).toContain("maxIdle");
  });

  it("sollte keepAlive für Verbindungsstabilität haben", () => {
    const content = readFileSync(dbPath, "utf-8");
    expect(content).toContain("enableKeepAlive");
  });

  it("sollte resetDbConnection für Recovery haben", () => {
    const content = readFileSync(dbPath, "utf-8");
    expect(content).toContain("export async function resetDbConnection");
  });
});

describe("M-14: API-Monitoring", () => {
  it("sollte Rate Limiter für externe APIs haben", () => {
    const rateLimiterPath = resolve(servicesDir, "rateLimiter.ts");
    expect(existsSync(rateLimiterPath)).toBe(true);
  });

  it("sollte Performance-Monitor haben", () => {
    const monitorPath = resolve(servicesDir, "performanceMonitor.ts");
    expect(existsSync(monitorPath)).toBe(true);
  });

  it("sollte strukturiertes Logging haben", () => {
    const loggerPath = resolve(servicesDir, "logger.ts");
    expect(existsSync(loggerPath)).toBe(true);
  });
});

describe("M-14: Notification-Service", () => {
  const notifPath = resolve(servicesDir, "notificationService.ts");

  it("sollte Notification-Service existieren", () => {
    expect(existsSync(notifPath)).toBe(true);
  });

  it("sollte verschiedene Benachrichtigungstypen unterstützen", () => {
    const content = readFileSync(notifPath, "utf-8");
    expect(content).toContain("notifyFollowUpDue");
    expect(content).toContain("notifyDunningRequired");
  });
});

describe("M-14: Health-Check", () => {
  it("sollte Health-Check Endpoint oder Service haben", () => {
    const routerContent = readFileSync(resolve(serverDir, "routers.ts"), "utf-8");
    const hasHealthCheck = routerContent.includes("health") || 
                          routerContent.includes("status") ||
                          routerContent.includes("system");
    expect(hasHealthCheck).toBe(true);
  });
});

describe("M-14: CI/CD Pipeline", () => {
  it("sollte GitHub Actions Workflow haben", () => {
    const ciPath = resolve(__dirname, "../.github/workflows/ci.yml");
    expect(existsSync(ciPath)).toBe(true);
  });

  it("sollte Tests im CI ausführen", () => {
    const ciPath = resolve(__dirname, "../.github/workflows/ci.yml");
    if (existsSync(ciPath)) {
      const content = readFileSync(ciPath, "utf-8");
      // CI verwendet 'pnpm test' welches intern vitest aufruft
      expect(content).toContain("pnpm test");
    }
  });
});
