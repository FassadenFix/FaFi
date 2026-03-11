/**
 * API Rate Limiter für externe APIs (HubSpot, Microsoft Graph)
 * Einfache Token-Bucket-Implementierung
 */
import { createLogger } from "./logger";

const log = createLogger("rateLimiter");

interface RateLimitConfig {
  maxRequests: number;     // Max Requests pro Zeitfenster
  windowMs: number;        // Zeitfenster in Millisekunden
  retryAfterMs?: number;   // Wartezeit bei Überschreitung
}

interface BucketState {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, BucketState>();

/**
 * Vorkonfigurierte Limits für externe APIs
 */
export const API_LIMITS: Record<string, RateLimitConfig> = {
  hubspot: {
    maxRequests: 100,       // HubSpot: 100 Requests/10s (API-Tier)
    windowMs: 10_000,
    retryAfterMs: 1_000,
  },
  microsoft_graph: {
    maxRequests: 10_000,    // Graph API: 10.000/10min (großzügig)
    windowMs: 600_000,
    retryAfterMs: 2_000,
  },
  open_meteo: {
    maxRequests: 10,        // Open-Meteo: Fair-Use ~10/min
    windowMs: 60_000,
    retryAfterMs: 5_000,
  },
};

/**
 * Prüft ob ein API-Aufruf erlaubt ist (Token Bucket)
 */
export function checkRateLimit(apiName: string): { allowed: boolean; retryAfterMs?: number } {
  const config = API_LIMITS[apiName];
  if (!config) return { allowed: true };

  const now = Date.now();
  let bucket = buckets.get(apiName);

  if (!bucket) {
    bucket = { tokens: config.maxRequests, lastRefill: now };
    buckets.set(apiName, bucket);
  }

  // Tokens auffüllen basierend auf vergangener Zeit
  const elapsed = now - bucket.lastRefill;
  const refillRate = config.maxRequests / config.windowMs;
  const newTokens = elapsed * refillRate;
  bucket.tokens = Math.min(config.maxRequests, bucket.tokens + newTokens);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  log.warn(`Rate limit erreicht für ${apiName}`, {
    tokens: bucket.tokens,
    maxRequests: config.maxRequests,
  });

  return {
    allowed: false,
    retryAfterMs: config.retryAfterMs || 1000,
  };
}

/**
 * Wrapper für rate-limitierte API-Aufrufe mit automatischem Retry
 */
export async function withRateLimit<T>(
  apiName: string,
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { allowed, retryAfterMs } = checkRateLimit(apiName);

    if (allowed) {
      try {
        return await fn();
      } catch (error: any) {
        // Bei 429 Too Many Requests: warten und retry
        if (error?.status === 429 || error?.response?.status === 429) {
          const waitMs = retryAfterMs || 2000;
          log.warn(`429 von ${apiName}, warte ${waitMs}ms (Versuch ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
        throw error;
      }
    }

    if (attempt < maxRetries) {
      const waitMs = retryAfterMs || 1000;
      log.info(`Rate limit ${apiName}: warte ${waitMs}ms vor Retry`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  throw new Error(`Rate limit für ${apiName} überschritten nach ${maxRetries + 1} Versuchen`);
}

/**
 * Setzt den Rate Limiter für eine API zurück (z.B. nach langer Pause)
 */
export function resetRateLimit(apiName: string): void {
  buckets.delete(apiName);
}

/**
 * Gibt den aktuellen Status aller Rate Limiter zurück
 */
export function getRateLimitStatus(): Record<string, { tokens: number; maxRequests: number; usage: string }> {
  const status: Record<string, { tokens: number; maxRequests: number; usage: string }> = {};

  for (const [name, config] of Object.entries(API_LIMITS)) {
    const bucket = buckets.get(name);
    const tokens = bucket ? Math.floor(bucket.tokens) : config.maxRequests;
    const usagePercent = Math.round(((config.maxRequests - tokens) / config.maxRequests) * 100);
    status[name] = {
      tokens,
      maxRequests: config.maxRequests,
      usage: `${usagePercent}%`,
    };
  }

  return status;
}
