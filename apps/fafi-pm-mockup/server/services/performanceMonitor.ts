/**
 * Performance-Monitoring für FaFi PM
 * Misst API-Response-Zeiten, DB-Queries und externe API-Aufrufe
 */
import { createLogger } from "./logger";

const log = createLogger("performance");

interface MetricEntry {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Ringbuffer für die letzten N Metriken
const MAX_METRICS = 1000;
const metrics: MetricEntry[] = [];
let metricsIndex = 0;

/**
 * Misst die Ausführungszeit einer Funktion
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    
    recordMetric(name, duration, metadata);
    
    // Warnung bei langsamen Operationen
    if (duration > 5000) {
      log.warn(`Langsame Operation: ${name} (${duration}ms)`, { ...metadata, duration });
    } else if (duration > 1000) {
      log.info(`Langsame Operation: ${name} (${duration}ms)`, { ...metadata, duration });
    }
    
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    recordMetric(`${name}:error`, duration, metadata);
    throw error;
  }
}

/**
 * Synchrone Zeitmessung
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = Math.round(performance.now() - start);
    recordMetric(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    recordMetric(`${name}:error`, duration, metadata);
    throw error;
  }
}

function recordMetric(name: string, duration: number, metadata?: Record<string, unknown>) {
  const entry: MetricEntry = {
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  };
  
  if (metrics.length < MAX_METRICS) {
    metrics.push(entry);
  } else {
    metrics[metricsIndex % MAX_METRICS] = entry;
  }
  metricsIndex++;
}

/**
 * Gibt Statistiken für eine bestimmte Metrik zurück
 */
export function getMetricStats(name: string, windowMs = 60_000): {
  count: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
} {
  const now = Date.now();
  const relevant = metrics.filter(
    m => m.name === name && (now - m.timestamp) <= windowMs
  );
  
  if (relevant.length === 0) {
    return { count: 0, avgMs: 0, minMs: 0, maxMs: 0, p95Ms: 0 };
  }
  
  const durations = relevant.map(m => m.duration).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);
  const p95Index = Math.floor(durations.length * 0.95);
  
  return {
    count: durations.length,
    avgMs: Math.round(sum / durations.length),
    minMs: durations[0],
    maxMs: durations[durations.length - 1],
    p95Ms: durations[p95Index] || durations[durations.length - 1],
  };
}

/**
 * Gibt alle gesammelten Metriken als Zusammenfassung zurück
 */
export function getPerformanceSummary(windowMs = 300_000): Record<string, {
  count: number;
  avgMs: number;
  maxMs: number;
}> {
  const now = Date.now();
  const relevant = metrics.filter(m => (now - m.timestamp) <= windowMs);
  
  const grouped: Record<string, number[]> = {};
  for (const m of relevant) {
    if (!grouped[m.name]) grouped[m.name] = [];
    grouped[m.name].push(m.duration);
  }
  
  const summary: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
  for (const [name, durations] of Object.entries(grouped)) {
    const sum = durations.reduce((a, b) => a + b, 0);
    summary[name] = {
      count: durations.length,
      avgMs: Math.round(sum / durations.length),
      maxMs: Math.max(...durations),
    };
  }
  
  return summary;
}

/**
 * Setzt alle Metriken zurück
 */
export function resetMetrics(): void {
  metrics.length = 0;
  metricsIndex = 0;
}
