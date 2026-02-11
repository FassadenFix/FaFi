#!/usr/bin/env python3
"""
FaFi PM – Accessibility & Performance Audit
Testet alle Hauptseiten mit axe-core via Playwright
"""
import json
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

# All main routes to test
PAGES = [
    ("/", "Dashboard"),
    ("/projekte", "Projekte"),
    ("/immobilien", "Immobilien"),
    ("/baustellen", "Baustellen"),
    ("/kontakte", "Unternehmen & Kontakte"),
    ("/angebote", "Angebote"),
    ("/auftraege", "Aufträge"),
    ("/garantien", "Garantien"),
    ("/finanzen", "Finanzen"),
    ("/kundenportal", "Kundenportal"),
    ("/archiv", "Archiv"),
    ("/vorbereitungsaufgaben", "Vorbereitungsaufgaben"),
]

AXE_CORE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"

def run_axe_on_page(page, url, name):
    """Run axe-core on a single page and return results"""
    full_url = f"{BASE_URL}{url}"
    print(f"  Testing: {name} ({url})...", end=" ", flush=True)
    
    try:
        page.goto(full_url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)  # Wait for React to render
        
        # Inject axe-core
        page.add_script_tag(url=AXE_CORE_CDN)
        page.wait_for_timeout(1000)
        
        # Run axe-core
        results = page.evaluate("""
            async () => {
                const results = await axe.run(document, {
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                    }
                });
                return {
                    violations: results.violations.map(v => ({
                        id: v.id,
                        impact: v.impact,
                        description: v.description,
                        help: v.help,
                        helpUrl: v.helpUrl,
                        tags: v.tags,
                        nodes: v.nodes.length
                    })),
                    passes: results.passes.length,
                    incomplete: results.incomplete.length,
                    inapplicable: results.inapplicable.length
                };
            }
        """)
        
        violations = results["violations"]
        critical = sum(1 for v in violations if v["impact"] == "critical")
        serious = sum(1 for v in violations if v["impact"] == "serious")
        moderate = sum(1 for v in violations if v["impact"] == "moderate")
        minor = sum(1 for v in violations if v["impact"] == "minor")
        
        status = "PASS" if critical == 0 and serious == 0 else "FAIL"
        print(f"{status} ({len(violations)} violations: {critical}C/{serious}S/{moderate}M/{minor}m, {results['passes']} passes)")
        
        return {
            "page": name,
            "url": url,
            "status": status,
            "violations": violations,
            "passes": results["passes"],
            "incomplete": results["incomplete"],
            "summary": {
                "critical": critical,
                "serious": serious,
                "moderate": moderate,
                "minor": minor,
                "total": len(violations)
            }
        }
    except Exception as e:
        print(f"ERROR: {e}")
        return {
            "page": name,
            "url": url,
            "status": "ERROR",
            "error": str(e),
            "violations": [],
            "passes": 0,
            "summary": {"critical": 0, "serious": 0, "moderate": 0, "minor": 0, "total": 0}
        }


def measure_performance(page, url, name):
    """Measure basic performance metrics for a page"""
    full_url = f"{BASE_URL}{url}"
    print(f"  Perf: {name} ({url})...", end=" ", flush=True)
    
    try:
        # Navigate and measure timing
        page.goto(full_url, wait_until="networkidle", timeout=30000)
        
        metrics = page.evaluate("""
            () => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                const fcp = paint.find(p => p.name === 'first-contentful-paint');
                const lcp = new Promise(resolve => {
                    new PerformanceObserver(list => {
                        const entries = list.getEntries();
                        resolve(entries[entries.length - 1]?.startTime || 0);
                    }).observe({type: 'largest-contentful-paint', buffered: true});
                    setTimeout(() => resolve(0), 3000);
                });
                
                return {
                    domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.startTime : 0,
                    loadComplete: perf ? perf.loadEventEnd - perf.startTime : 0,
                    fcp: fcp ? fcp.startTime : 0,
                    transferSize: perf ? perf.transferSize : 0,
                    domInteractive: perf ? perf.domInteractive - perf.startTime : 0,
                };
            }
        """)
        
        # Wait a bit for LCP
        page.wait_for_timeout(2000)
        
        lcp = page.evaluate("""
            () => {
                const entries = performance.getEntriesByType('largest-contentful-paint');
                return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
            }
        """)
        metrics["lcp"] = lcp
        
        print(f"FCP: {metrics['fcp']:.0f}ms, LCP: {lcp:.0f}ms, DOM: {metrics['domContentLoaded']:.0f}ms")
        
        return {
            "page": name,
            "url": url,
            **metrics
        }
    except Exception as e:
        print(f"ERROR: {e}")
        return {"page": name, "url": url, "error": str(e)}


def check_color_contrast(page, url, name):
    """Check color contrast ratios on the page"""
    full_url = f"{BASE_URL}{url}"
    
    try:
        page.goto(full_url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        # Inject axe-core and run only color-contrast rule
        page.add_script_tag(url=AXE_CORE_CDN)
        page.wait_for_timeout(1000)
        
        results = page.evaluate("""
            async () => {
                const results = await axe.run(document, {
                    runOnly: {
                        type: 'rule',
                        values: ['color-contrast']
                    }
                });
                return {
                    violations: results.violations.map(v => ({
                        nodes: v.nodes.map(n => ({
                            html: n.html.substring(0, 100),
                            failureSummary: n.failureSummary,
                            impact: n.impact
                        }))
                    })),
                    passes: results.passes.length
                };
            }
        """)
        
        total_violations = sum(len(v["nodes"]) for v in results["violations"])
        return {
            "page": name,
            "url": url,
            "contrast_violations": total_violations,
            "contrast_passes": results["passes"]
        }
    except Exception as e:
        return {"page": name, "url": url, "error": str(e)}


def main():
    print("=" * 60)
    print("FaFi PM – Accessibility & Performance Audit")
    print("=" * 60)
    
    all_results = {
        "accessibility": [],
        "performance": [],
        "contrast": [],
        "summary": {}
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        # Phase 1: Accessibility Audit
        print("\n--- Phase 1: Accessibility Audit (axe-core WCAG 2.1 AA) ---")
        for url, name in PAGES:
            result = run_axe_on_page(page, url, name)
            all_results["accessibility"].append(result)
        
        # Phase 2: Performance Metrics
        print("\n--- Phase 2: Performance Metrics ---")
        for url, name in PAGES[:5]:  # Test top 5 pages for performance
            result = measure_performance(page, url, name)
            all_results["performance"].append(result)
        
        # Phase 3: Color Contrast
        print("\n--- Phase 3: Color Contrast Check ---")
        for url, name in PAGES[:5]:  # Test top 5 pages
            result = check_color_contrast(page, url, name)
            all_results["contrast"].append(result)
            violations = result.get("contrast_violations", 0)
            print(f"  {name}: {violations} contrast violations")
        
        browser.close()
    
    # Summary
    total_violations = sum(r["summary"]["total"] for r in all_results["accessibility"])
    total_critical = sum(r["summary"]["critical"] for r in all_results["accessibility"])
    total_serious = sum(r["summary"]["serious"] for r in all_results["accessibility"])
    total_moderate = sum(r["summary"]["moderate"] for r in all_results["accessibility"])
    total_minor = sum(r["summary"]["minor"] for r in all_results["accessibility"])
    pages_pass = sum(1 for r in all_results["accessibility"] if r["status"] == "PASS")
    pages_fail = sum(1 for r in all_results["accessibility"] if r["status"] == "FAIL")
    
    all_results["summary"] = {
        "total_pages": len(PAGES),
        "pages_pass": pages_pass,
        "pages_fail": pages_fail,
        "total_violations": total_violations,
        "critical": total_critical,
        "serious": total_serious,
        "moderate": total_moderate,
        "minor": total_minor,
    }
    
    print("\n" + "=" * 60)
    print("ZUSAMMENFASSUNG")
    print("=" * 60)
    print(f"Seiten getestet: {len(PAGES)}")
    print(f"Bestanden: {pages_pass} | Nicht bestanden: {pages_fail}")
    print(f"Violations gesamt: {total_violations}")
    print(f"  Critical: {total_critical}")
    print(f"  Serious: {total_serious}")
    print(f"  Moderate: {total_moderate}")
    print(f"  Minor: {total_minor}")
    
    # Save results
    output_path = "generalprobe-report/accessibility-audit.json"
    with open(output_path, "w") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    print(f"\nReport gespeichert: {output_path}")
    
    return 0 if total_critical == 0 and total_serious == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
