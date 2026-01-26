// ============================================
// PERFORMANCE MONITOR
// Überwacht Performance-Metriken
// ============================================

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.enabled = true;
        this.init();
    }

    /**
     * Initialisiert Performance-Monitoring
     */
    init() {
        if (!this.enabled) return;

        // Performance Observer für Navigation Timing
        if ('PerformanceObserver' in window) {
            try {
                // Beobachte Navigations-Events
                const navObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordNavigationTiming(entry);
                    }
                });
                navObserver.observe({ entryTypes: ['navigation'] });

                // Beobachte Paint-Events
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordPaintTiming(entry);
                    }
                });
                paintObserver.observe({ entryTypes: ['paint'] });

                // Beobachte Resource-Loading
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordResourceTiming(entry);
                    }
                });
                resourceObserver.observe({ entryTypes: ['resource'] });

            } catch (error) {
                console.warn('[Performance] Observer init failed:', error);
            }
        }

        // Core Web Vitals mit web-vitals library (optional)
        this.measureCoreWebVitals();

        console.log('[Performance] Monitor initialized');
    }

    /**
     * Zeichnet Navigation Timing auf
     * @param {PerformanceNavigationTiming} entry
     */
    recordNavigationTiming(entry) {
        this.metrics.navigation = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.fetchStart,
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            ttfb: entry.responseStart - entry.requestStart,
            download: entry.responseEnd - entry.responseStart,
            domProcessing: entry.domComplete - entry.domInteractive
        };

        console.log('[Performance] Navigation Timing:', this.metrics.navigation);
    }

    /**
     * Zeichnet Paint Timing auf
     * @param {PerformancePaintTiming} entry
     */
    recordPaintTiming(entry) {
        if (!this.metrics.paint) {
            this.metrics.paint = {};
        }

        this.metrics.paint[entry.name] = Math.round(entry.startTime);

        console.log(`[Performance] ${entry.name}:`, Math.round(entry.startTime), 'ms');
    }

    /**
     * Zeichnet Resource Timing auf
     * @param {PerformanceResourceTiming} entry
     */
    recordResourceTiming(entry) {
        if (!this.metrics.resources) {
            this.metrics.resources = [];
        }

        // Nur langsame Resources loggen (> 500ms)
        const duration = entry.responseEnd - entry.fetchStart;
        if (duration > 500) {
            this.metrics.resources.push({
                name: entry.name,
                duration: Math.round(duration),
                size: entry.transferSize,
                cached: entry.transferSize === 0
            });

            console.warn('[Performance] Slow resource:', entry.name, Math.round(duration), 'ms');
        }
    }

    /**
     * Misst Core Web Vitals (FCP, LCP, FID, CLS)
     */
    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
                    console.log('[Performance] LCP:', this.metrics.lcp, 'ms');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }
        }

        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
                        console.log('[Performance] FID:', this.metrics.fid, 'ms');
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }
        }

        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.cls = Math.round(clsValue * 1000) / 1000;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // CLS not supported
            }
        }
    }

    /**
     * Startet Custom-Messung
     * @param {string} name - Messungs-Name
     */
    startMeasure(name) {
        if (!this.enabled) return;
        performance.mark(`${name}-start`);
    }

    /**
     * Beendet Custom-Messung
     * @param {string} name - Messungs-Name
     * @returns {number|null} Duration in ms
     */
    endMeasure(name) {
        if (!this.enabled) return null;

        try {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);

            const measure = performance.getEntriesByName(name)[0];
            const duration = Math.round(measure.duration);

            if (!this.metrics.custom) {
                this.metrics.custom = {};
            }
            this.metrics.custom[name] = duration;

            console.log(`[Performance] ${name}:`, duration, 'ms');

            // Cleanup
            performance.clearMarks(`${name}-start`);
            performance.clearMarks(`${name}-end`);
            performance.clearMeasures(name);

            return duration;
        } catch (error) {
            console.warn('[Performance] Measure failed:', name, error);
            return null;
        }
    }

    /**
     * Misst Funktion-Ausführungszeit
     * @param {string} name - Name
     * @param {Function} fn - Funktion
     * @returns {Promise<*>} Ergebnis
     */
    async measureFunction(name, fn) {
        this.startMeasure(name);
        try {
            const result = await fn();
            this.endMeasure(name);
            return result;
        } catch (error) {
            this.endMeasure(name);
            throw error;
        }
    }

    /**
     * Gibt Performance-Report zurück
     * @returns {object} Report
     */
    getReport() {
        const report = {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: this.getConnectionInfo(),
            memory: this.getMemoryInfo(),
            storage: null // Wird async geladen
        };

        // Storage Info async laden
        this.getStorageInfo().then(storage => {
            report.storage = storage;
        });

        return report;
    }

    /**
     * Gibt Connection-Info zurück
     * @returns {object|null}
     */
    getConnectionInfo() {
        if (!('connection' in navigator)) {
            return null;
        }

        const conn = navigator.connection;
        return {
            effectiveType: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
            saveData: conn.saveData
        };
    }

    /**
     * Gibt Memory-Info zurück
     * @returns {object|null}
     */
    getMemoryInfo() {
        if (!('memory' in performance)) {
            return null;
        }

        const mem = performance.memory;
        return {
            usedJSHeapSize: Math.round(mem.usedJSHeapSize / 1024 / 1024), // MB
            totalJSHeapSize: Math.round(mem.totalJSHeapSize / 1024 / 1024), // MB
            jsHeapSizeLimit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024) // MB
        };
    }

    /**
     * Gibt Storage-Info zurück
     * @returns {Promise<object>}
     */
    async getStorageInfo() {
        if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
            return null;
        }

        try {
            const estimate = await navigator.storage.estimate();
            return {
                usage: Math.round(estimate.usage / 1024 / 1024), // MB
                quota: Math.round(estimate.quota / 1024 / 1024), // MB
                percentage: Math.round((estimate.usage / estimate.quota) * 100)
            };
        } catch (error) {
            console.warn('[Performance] Storage estimate failed:', error);
            return null;
        }
    }

    /**
     * Loggt Performance-Report
     */
    logReport() {
        const report = this.getReport();
        console.log('[Performance] Report:', report);

        // Warnungen bei schlechter Performance
        if (report.paint?.['first-contentful-paint'] > 2000) {
            console.warn('[Performance] Slow First Contentful Paint:', report.paint['first-contentful-paint'], 'ms');
        }

        if (report.lcp > 2500) {
            console.warn('[Performance] Slow Largest Contentful Paint:', report.lcp, 'ms');
        }

        if (report.fid > 100) {
            console.warn('[Performance] High First Input Delay:', report.fid, 'ms');
        }

        if (report.cls > 0.1) {
            console.warn('[Performance] High Cumulative Layout Shift:', report.cls);
        }

        return report;
    }

    /**
     * Exportiert Report als JSON
     * @returns {string}
     */
    exportReport() {
        return JSON.stringify(this.getReport(), null, 2);
    }

    /**
     * Aktiviert/Deaktiviert Monitoring
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Globale Instanz
const performanceMonitor = new PerformanceMonitor();

// Log Report nach Page Load
window.addEventListener('load', () => {
    setTimeout(() => {
        performanceMonitor.logReport();
    }, 1000);
});
