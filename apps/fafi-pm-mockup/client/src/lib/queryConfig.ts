/**
 * React Query / tRPC Cache-Strategien für FaFi PM
 * Definiert staleTime und cacheTime pro Entitätstyp
 */

/**
 * Cache-Konfiguration für verschiedene Datentypen
 * 
 * - REALTIME: Daten die häufig aktualisiert werden (Dashboard, Benachrichtigungen)
 * - STANDARD: Normale Geschäftsdaten (Projekte, Angebote, Aufträge)
 * - STATIC: Selten geänderte Daten (Einstellungen, Stammdaten)
 * - EXTERNAL: Externe API-Daten (HubSpot, Wetter)
 */
export const CACHE_CONFIG = {
  /** Dashboard-KPIs, Benachrichtigungen: 30 Sekunden stale */
  REALTIME: {
    staleTime: 30 * 1000,        // 30s
    gcTime: 2 * 60 * 1000,       // 2min garbage collection
    refetchOnWindowFocus: true,
  },
  
  /** Projekte, Angebote, Aufträge: 2 Minuten stale */
  STANDARD: {
    staleTime: 2 * 60 * 1000,    // 2min
    gcTime: 10 * 60 * 1000,      // 10min
    refetchOnWindowFocus: true,
  },
  
  /** Einstellungen, Stammdaten, Vorlagen: 10 Minuten stale */
  STATIC: {
    staleTime: 10 * 60 * 1000,   // 10min
    gcTime: 30 * 60 * 1000,      // 30min
    refetchOnWindowFocus: false,
  },
  
  /** HubSpot-Daten, Wetter: 5 Minuten stale */
  EXTERNAL: {
    staleTime: 5 * 60 * 1000,    // 5min
    gcTime: 15 * 60 * 1000,      // 15min
    refetchOnWindowFocus: false,
  },
  
  /** Reports, Statistiken: 5 Minuten stale */
  REPORTS: {
    staleTime: 5 * 60 * 1000,    // 5min
    gcTime: 20 * 60 * 1000,      // 20min
    refetchOnWindowFocus: false,
  },
} as const;

/**
 * Mapping von tRPC-Router-Pfaden zu Cache-Konfigurationen
 * Wird für automatische Cache-Zuweisung verwendet
 */
export const ROUTER_CACHE_MAP: Record<string, typeof CACHE_CONFIG[keyof typeof CACHE_CONFIG]> = {
  // Realtime
  "notification": CACHE_CONFIG.REALTIME,
  "dashboard": CACHE_CONFIG.REALTIME,
  "task": CACHE_CONFIG.REALTIME,
  
  // Standard
  "project": CACHE_CONFIG.STANDARD,
  "offer": CACHE_CONFIG.STANDARD,
  "order": CACHE_CONFIG.STANDARD,
  "invoice": CACHE_CONFIG.STANDARD,
  "warranty": CACHE_CONFIG.STANDARD,
  "constructionSite": CACHE_CONFIG.STANDARD,
  "property": CACHE_CONFIG.STANDARD,
  "photo": CACHE_CONFIG.STANDARD,
  "document": CACHE_CONFIG.STANDARD,
  "deployment": CACHE_CONFIG.STANDARD,
  
  // Static
  "company": CACHE_CONFIG.STATIC,
  "contact": CACHE_CONFIG.STATIC,
  "user": CACHE_CONFIG.STATIC,
  "settings": CACHE_CONFIG.STATIC,
  "template": CACHE_CONFIG.STATIC,
  
  // External
  "hubspot": CACHE_CONFIG.EXTERNAL,
  "weather": CACHE_CONFIG.EXTERNAL,
  
  // Reports
  "report": CACHE_CONFIG.REPORTS,
  "finance": CACHE_CONFIG.REPORTS,
  "resource": CACHE_CONFIG.REPORTS,
};
