/**
 * Unit-Tests für v7.1 (Microsoft 365), v7.2 (HubSpot Bidi-Sync), v7.3 (Ampel-System)
 * und Phase 4 Router (Reporting, Einsatzplanung, Ressourcen, Finanzen)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// v7.3 – Ampel-System Tests
// ============================================

import { calculateProjectAmpel, calculateSiteAmpel } from './ampelSystem';

describe('v7.3 – Ampel-System', () => {
  const now = new Date('2026-02-09T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  describe('calculateProjectAmpel', () => {
    it('sollte grün sein wenn keine Aufgaben vorhanden', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const result = calculateProjectAmpel(project, []);
      expect(result.status).toBe('green');
      expect(result.overdueTasks).toBe(0);
      expect(result.pendingTasks).toBe(0);
      expect(result.reasons).toContain('Alle Voraussetzungen erfüllt');
    });

    it('sollte rot sein bei überfälligen Aufgaben', () => {
      const project = { id: 1, phase: 'durchfuehrung', startDate: null, endDate: null, progress: 50 };
      const tasks = [
        { id: 1, title: 'Bewohnerinfo', status: 'offen', dueDate: new Date('2026-02-01'), priority: 'normal' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      expect(result.status).toBe('red');
      expect(result.overdueTasks).toBe(1);
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('sollte rot sein bei dringenden offenen Aufgaben', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const tasks = [
        { id: 1, title: 'Dringend', status: 'offen', dueDate: new Date('2026-02-15'), priority: 'dringend' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      expect(result.status).toBe('red');
      expect(result.reasons).toContain('1 dringende offene Aufgabe(n)');
    });

    it('sollte rot sein bei überschrittenem Endtermin', () => {
      const project = { id: 1, phase: 'durchfuehrung', startDate: new Date('2025-12-01'), endDate: new Date('2026-01-31'), progress: 80 };
      const result = calculateProjectAmpel(project, []);
      expect(result.status).toBe('red');
      expect(result.reasons).toContain('Projekt-Endtermin überschritten');
    });

    it('sollte gelb sein bei bald fälligen Aufgaben', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const tasks = [
        { id: 1, title: 'Bald fällig', status: 'in_bearbeitung', dueDate: new Date('2026-02-11'), priority: 'normal' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      expect(result.status).toBe('yellow');
      expect(result.pendingTasks).toBe(1);
    });

    it('sollte grün bleiben bei erledigten Aufgaben', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const tasks = [
        { id: 1, title: 'Erledigt', status: 'erledigt', dueDate: new Date('2026-01-01'), priority: 'normal' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      expect(result.status).toBe('green');
    });

    it('sollte grün bleiben bei abgebrochenen Aufgaben', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const tasks = [
        { id: 1, title: 'Abgebrochen', status: 'abgebrochen', dueDate: new Date('2026-01-01'), priority: 'normal' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      expect(result.status).toBe('green');
    });

    it('sollte Aufgaben ohne Fälligkeitsdatum ignorieren', () => {
      const project = { id: 1, phase: 'planung', startDate: null, endDate: null, progress: 0 };
      const tasks = [
        { id: 1, title: 'Ohne Datum', status: 'offen', dueDate: null, priority: 'normal' },
      ];
      const result = calculateProjectAmpel(project, tasks);
      // Gelb weil pending, aber nicht rot weil nicht überfällig
      expect(result.status).not.toBe('red');
      expect(result.pendingTasks).toBe(1);
    });
  });

  describe('calculateSiteAmpel', () => {
    it('sollte grün sein bei neuer Baustelle ohne Aufgaben', () => {
      const site = { id: 1, status: 'geplant', startDate: null, endDate: null, progress: 0, preDocumentationStatus: 'pending', postDocumentationStatus: 'pending' };
      const result = calculateSiteAmpel(site, []);
      expect(result.status).toBe('green');
    });

    it('sollte rot sein bei aktiver Baustelle ohne Vorher-Doku', () => {
      const site = { id: 1, status: 'aktiv', startDate: new Date('2026-02-01'), endDate: new Date('2026-03-01'), progress: 10, preDocumentationStatus: 'pending', postDocumentationStatus: 'pending' };
      const result = calculateSiteAmpel(site, []);
      expect(result.status).toBe('red');
      expect(result.reasons).toContain('Vorher-Dokumentation nicht abgeschlossen');
    });

    it('sollte grün sein bei aktiver Baustelle mit abgeschlossener Vorher-Doku', () => {
      const site = { id: 1, status: 'aktiv', startDate: new Date('2026-02-01'), endDate: new Date('2026-04-01'), progress: 30, preDocumentationStatus: 'completed', postDocumentationStatus: 'pending' };
      const result = calculateSiteAmpel(site, []);
      expect(result.status).toBe('green');
    });

    it('sollte rot sein bei überschrittenem Endtermin', () => {
      const site = { id: 1, status: 'aktiv', startDate: new Date('2025-11-01'), endDate: new Date('2026-01-31'), progress: 80, preDocumentationStatus: 'completed', postDocumentationStatus: 'pending' };
      const result = calculateSiteAmpel(site, []);
      expect(result.status).toBe('red');
      expect(result.reasons).toContain('Baustellen-Endtermin überschritten');
    });

    it('sollte gelb sein bei pausierter Baustelle', () => {
      const site = { id: 1, status: 'pausiert', startDate: new Date('2026-01-01'), endDate: new Date('2026-04-01'), progress: 40, preDocumentationStatus: 'completed', postDocumentationStatus: 'pending' };
      const result = calculateSiteAmpel(site, []);
      expect(result.status).toBe('yellow');
      expect(result.reasons).toContain('Baustelle ist pausiert');
    });

    it('sollte rot sein bei überfälligen Aufgaben auf Baustelle', () => {
      const site = { id: 1, status: 'aktiv', startDate: new Date('2026-01-01'), endDate: new Date('2026-04-01'), progress: 30, preDocumentationStatus: 'completed', postDocumentationStatus: 'pending' };
      const tasks = [
        { id: 1, title: 'Sicherheitscheck', status: 'offen', dueDate: new Date('2026-02-05'), priority: 'dringend' },
      ];
      const result = calculateSiteAmpel(site, tasks);
      expect(result.status).toBe('red');
      expect(result.overdueTasks).toBe(1);
    });
  });
});

// ============================================
// v7.2 – HubSpot Bidirektionaler Sync Tests
// ============================================

import { hubspotContactToLocal, hubspotCompanyToLocal } from './hubspot';

describe('v7.2 – HubSpot Bidi-Sync', () => {
  describe('Status-Mapping', () => {
    it('sollte HubSpot-Kontakt korrekt konvertieren', () => {
      const contact = {
        id: '123',
        properties: { firstname: 'Max', lastname: 'Muster', email: 'max@test.de', phone: '+49123' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        archived: false,
      };
      const result = hubspotContactToLocal(contact);
      expect(result.hubspotId).toBe('123');
      expect(result.firstName).toBe('Max');
      expect(result.lastName).toBe('Muster');
      expect(result.email).toBe('max@test.de');
    });

    it('sollte HubSpot-Unternehmen korrekt konvertieren', () => {
      const company = {
        id: '456',
        properties: { name: 'Test GmbH', domain: 'test.de', city: 'Berlin' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        archived: false,
      };
      const result = hubspotCompanyToLocal(company);
      expect(result.hubspotId).toBe('456');
      expect(result.name).toBe('Test GmbH');
      expect(result.city).toBe('Berlin');
    });

    it('sollte fehlende Felder mit Defaults füllen', () => {
      const contact = {
        id: '789',
        properties: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        archived: false,
      };
      const result = hubspotContactToLocal(contact);
      expect(result.lastName).toBe('Unbekannt');
      expect(result.firstName).toBeNull();
      expect(result.email).toBeNull();
    });
  });
});

// ============================================
// v7.1 – Microsoft 365 Integration Tests
// ============================================

describe('v7.1 – Microsoft 365 Integration', () => {
  describe('SSO Service', () => {
    it('sollte Microsoft SSO Service Modul exportieren', async () => {
      const module = await import('./microsoft365');
      expect(module).toBeDefined();
      // Service sollte Funktionen für Token-Management haben
      expect(typeof module.getLoginUrl).toBe('function');
      expect(typeof module.isConfigured).toBe('function');
    });

    it('sollte Login-URL generieren', async () => {
      const { getLoginUrl } = await import('./microsoft365');
      // Ohne Konfiguration sollte es trotzdem eine URL zurückgeben
      const url = getLoginUrl('https://test.example.com');
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('sollte isConfigured korrekt melden', async () => {
      const { isConfigured } = await import('./microsoft365');
      // Ohne env vars sollte es false sein
      const result = isConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('E-Mail Service', () => {
    it('sollte E-Mail Service Modul exportieren', async () => {
      const module = await import('./email');
      expect(module).toBeDefined();
    });
  });
});

// ============================================
// Rate Limiter Tests
// ============================================

import { checkRateLimit, resetRateLimit, getRateLimitStatus, withRateLimit } from './rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimit('hubspot');
    resetRateLimit('microsoft_graph');
    resetRateLimit('open_meteo');
    resetRateLimit('test_api');
  });

  describe('checkRateLimit', () => {
    it('sollte Anfragen innerhalb des Limits erlauben', () => {
      const result = checkRateLimit('hubspot');
      expect(result.allowed).toBe(true);
    });

    it('sollte unbekannte APIs immer erlauben', () => {
      const result = checkRateLimit('unknown_api');
      expect(result.allowed).toBe(true);
    });

    it('sollte nach vielen Anfragen blockieren', () => {
      // HubSpot: 100 Requests/10s
      for (let i = 0; i < 100; i++) {
        checkRateLimit('hubspot');
      }
      const result = checkRateLimit('hubspot');
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });
  });

  describe('getRateLimitStatus', () => {
    it('sollte Status für alle konfigurierten APIs zurückgeben', () => {
      const status = getRateLimitStatus();
      expect(status.hubspot).toBeDefined();
      expect(status.microsoft_graph).toBeDefined();
      expect(status.open_meteo).toBeDefined();
      expect(status.hubspot.maxRequests).toBe(100);
    });

    it('sollte Nutzung korrekt berechnen', () => {
      // 10 Anfragen an HubSpot
      for (let i = 0; i < 10; i++) {
        checkRateLimit('hubspot');
      }
      const status = getRateLimitStatus();
      expect(status.hubspot.tokens).toBeLessThan(100);
    });
  });

  describe('withRateLimit', () => {
    it('sollte Funktion ausführen wenn Rate Limit nicht erreicht', async () => {
      const result = await withRateLimit('hubspot', async () => 'success');
      expect(result).toBe('success');
    });

    it('sollte Fehler weiterleiten bei nicht-429 Fehlern', async () => {
      await expect(
        withRateLimit('hubspot', async () => { throw new Error('DB Error'); })
      ).rejects.toThrow('DB Error');
    });
  });
});

// ============================================
// Performance Monitor Tests
// ============================================

import { measure, measureSync, getMetricStats, getPerformanceSummary, resetMetrics } from './performanceMonitor';

describe('Performance Monitor', () => {
  beforeEach(() => {
    resetMetrics();
  });

  describe('measure', () => {
    it('sollte Ausführungszeit messen', async () => {
      const result = await measure('test-op', async () => {
        return 42;
      });
      expect(result).toBe(42);
    });

    it('sollte Fehler weiterleiten', async () => {
      await expect(
        measure('test-error', async () => { throw new Error('Test'); })
      ).rejects.toThrow('Test');
    });
  });

  describe('measureSync', () => {
    it('sollte synchrone Funktionen messen', () => {
      const result = measureSync('sync-op', () => 'hello');
      expect(result).toBe('hello');
    });
  });

  describe('getMetricStats', () => {
    it('sollte leere Statistiken für unbekannte Metriken zurückgeben', () => {
      const stats = getMetricStats('unknown');
      expect(stats.count).toBe(0);
      expect(stats.avgMs).toBe(0);
    });

    it('sollte Statistiken nach Messung zurückgeben', async () => {
      await measure('test-metric', async () => 1);
      await measure('test-metric', async () => 2);
      const stats = getMetricStats('test-metric');
      expect(stats.count).toBe(2);
      expect(stats.avgMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPerformanceSummary', () => {
    it('sollte leere Zusammenfassung ohne Metriken zurückgeben', () => {
      const summary = getPerformanceSummary();
      expect(Object.keys(summary).length).toBe(0);
    });

    it('sollte gruppierte Zusammenfassung zurückgeben', async () => {
      await measure('op-a', async () => 1);
      await measure('op-b', async () => 2);
      await measure('op-a', async () => 3);
      const summary = getPerformanceSummary();
      expect(summary['op-a']).toBeDefined();
      expect(summary['op-a'].count).toBe(2);
      expect(summary['op-b']).toBeDefined();
      expect(summary['op-b'].count).toBe(1);
    });
  });
});

// ============================================
// Custom Error Classes Tests
// ============================================

import { AppError, ErrorCode, ERROR_MESSAGES, toTRPCErrorCode } from '../../shared/errors';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('sollte mit ErrorCode erstellt werden', () => {
      const error = new AppError(ErrorCode.NOT_FOUND);
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.NOT_FOUND]);
      expect(error.name).toBe('AppError');
    });

    it('sollte benutzerdefinierte Nachricht akzeptieren', () => {
      const error = new AppError(ErrorCode.VALIDATION_FAILED, 'Feld X ist ungültig');
      expect(error.message).toBe('Feld X ist ungültig');
      expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
    });

    it('sollte Details akzeptieren', () => {
      const error = new AppError(ErrorCode.DUPLICATE_ENTRY, undefined, { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });

    it('sollte JSON-Serialisierung unterstützen', () => {
      const error = new AppError(ErrorCode.FORBIDDEN, 'Kein Zugriff', { role: 'user' });
      const json = error.toJSON();
      expect(json.name).toBe('AppError');
      expect(json.code).toBe(ErrorCode.FORBIDDEN);
      expect(json.message).toBe('Kein Zugriff');
      expect(json.details).toEqual({ role: 'user' });
    });
  });

  describe('toTRPCErrorCode', () => {
    it('sollte Auth-Fehler auf UNAUTHORIZED mappen', () => {
      expect(toTRPCErrorCode(ErrorCode.UNAUTHORIZED)).toBe('UNAUTHORIZED');
    });

    it('sollte Validierungsfehler auf BAD_REQUEST mappen', () => {
      expect(toTRPCErrorCode(ErrorCode.VALIDATION_FAILED)).toBe('BAD_REQUEST');
      expect(toTRPCErrorCode(ErrorCode.MISSING_REQUIRED_FIELD)).toBe('BAD_REQUEST');
      expect(toTRPCErrorCode(ErrorCode.INVALID_FORMAT)).toBe('BAD_REQUEST');
    });

    it('sollte NOT_FOUND korrekt mappen', () => {
      expect(toTRPCErrorCode(ErrorCode.NOT_FOUND)).toBe('NOT_FOUND');
    });

    it('sollte Konflikte auf CONFLICT mappen', () => {
      expect(toTRPCErrorCode(ErrorCode.RESOURCE_CONFLICT)).toBe('CONFLICT');
      expect(toTRPCErrorCode(ErrorCode.ALREADY_EXISTS)).toBe('CONFLICT');
    });

    it('sollte externe Fehler auf INTERNAL_SERVER_ERROR mappen', () => {
      expect(toTRPCErrorCode(ErrorCode.HUBSPOT_SYNC_FAILED)).toBe('INTERNAL_SERVER_ERROR');
      expect(toTRPCErrorCode(ErrorCode.EMAIL_SEND_FAILED)).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('ErrorCode Vollständigkeit', () => {
    it('sollte für jeden ErrorCode eine Nachricht haben', () => {
      const codes = Object.values(ErrorCode).filter(v => typeof v === 'number') as number[];
      for (const code of codes) {
        expect(ERROR_MESSAGES[code as ErrorCode]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code as ErrorCode]).toBe('string');
        expect(ERROR_MESSAGES[code as ErrorCode].length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================
// Logger Tests
// ============================================

import { createLogger } from './logger';

describe('Strukturiertes Logging', () => {
  it('sollte Logger mit Modul-Name erstellen', () => {
    const log = createLogger('test-module');
    expect(log).toBeDefined();
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.debug).toBe('function');
    expect(typeof log.timed).toBe('function');
  });

  it('sollte info-Nachrichten loggen', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const log = createLogger('test');
    log.info('Test-Nachricht', { key: 'value' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sollte error-Nachrichten loggen', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = createLogger('test');
    log.error('Fehler aufgetreten', new Error('Test'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sollte warn-Nachrichten loggen', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = createLogger('test');
    log.warn('Warnung');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sollte Zeitmessung unterstützen', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const log = createLogger('test');
    const start = Date.now() - 150;
    log.timed('Operation abgeschlossen', start);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
