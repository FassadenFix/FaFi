/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Breadcrumb: Dynamische Pfadnavigation für 8 thematische Bereiche
 */

import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Route configuration with labels and parent relationships
interface RouteConfig {
  label: string;
  parent?: string;
  icon?: React.ElementType;
}

const routeConfig: Record<string, RouteConfig> = {
  // Root
  "/": { label: "Übersicht", icon: Home },
  
  // Bereich 1: Erstellen & Erfassen
  "/projekte": { label: "Projekte", parent: "/" },
  "/projekte/:id": { label: "Projekt-Detail", parent: "/projekte" },
  "/baustellen": { label: "Baustellen", parent: "/" },
  "/immobilien": { label: "Immobilien", parent: "/" },
  
  // Bereich 2: Kundenberatung
  "/kontakte": { label: "Unternehmen & Kontakte", parent: "/" },
  "/angebote": { label: "Angebote", parent: "/" },
  "/auftraege": { label: "Aufträge", parent: "/" },
  "/garantien": { label: "Garantien & Inspektionen", parent: "/" },
  
  // Bereich 3: Planung
  "/terminfinder": { label: "Terminfinder", parent: "/" },
  "/einsatzplanung": { label: "Team einplanen", parent: "/" },
  "/ressourcen": { label: "Ressourcenplaner", parent: "/" },
  
  // Bereich 4: Projektvorbereitung
  "/projekte-offen": { label: "Offene Projekte", parent: "/" },
  "/projekte-ueberfaellig": { label: "Überfällige Projekte", parent: "/" },
  "/baustellen-offen": { label: "Offene Baustellen", parent: "/" },
  "/baustellen-ueberfaellig": { label: "Überfällige Baustellen", parent: "/" },
  
  // Bereich 5: Umsetzung
  "/teamleitercheck": { label: "Teamleitercheck", parent: "/" },
  "/mobile": { label: "Baustellenmanager", parent: "/" },
  "/berichte": { label: "Auswertung & Abschluss", parent: "/" },
  
  // Bereich 6: Finanzen
  "/finanzen": { label: "Finanzübersicht", parent: "/" },
  "/rechnungen": { label: "Rechnungen", parent: "/" },
  "/zahlungen": { label: "Zahlungen", parent: "/" },
  "/budgets": { label: "Budgets", parent: "/" },
  
  // Bereich 7: Kundenportal
  "/kundenportal": { label: "Portal-Übersicht", parent: "/" },
  "/dokumente": { label: "Dokumente teilen", parent: "/" },
  "/kundenmeldungen": { label: "Kundenmeldungen", parent: "/" },
  
  // Bereich 8: System & Unternehmen
  "/team": { label: "Mitarbeiter", parent: "/" },
  "/hubspot": { label: "HubSpot", parent: "/" },
  "/sprachsteuerung": { label: "Spracheingabe", parent: "/" },
  "/einstellungen": { label: "Einstellungen", parent: "/" },
  
  // Other
  "/benachrichtigungen": { label: "Benachrichtigungen", parent: "/" },
  "/login": { label: "Anmelden" },
};

// Dynamic route patterns
const dynamicRoutes: { pattern: RegExp; config: RouteConfig; getLabel?: (path: string) => string }[] = [
  {
    pattern: /^\/projekte\/(\d+)$/,
    config: { label: "Projekt-Detail", parent: "/projekte" },
    getLabel: (path: string) => {
      const match = path.match(/^\/projekte\/(\d+)$/);
      if (match) {
        // In a real app, we'd fetch the project name
        const projectNames: Record<string, string> = {
          "1": "Wohnanlage Sonnenhof",
          "2": "Bürokomplex Zentrum",
          "3": "Mehrfamilienhaus Parkstraße",
        };
        return projectNames[match[1]] || `Projekt ${match[1]}`;
      }
      return "Projekt-Detail";
    },
  },
];

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

function getBreadcrumbItems(path: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  // Check for dynamic routes first
  let currentConfig: RouteConfig | undefined;
  let currentLabel: string | undefined;
  
  for (const route of dynamicRoutes) {
    if (route.pattern.test(path)) {
      currentConfig = route.config;
      currentLabel = route.getLabel ? route.getLabel(path) : route.config.label;
      break;
    }
  }
  
  // Fall back to static routes
  if (!currentConfig) {
    currentConfig = routeConfig[path];
    currentLabel = currentConfig?.label;
  }
  
  if (!currentConfig || !currentLabel) {
    return [{ label: "Übersicht", href: "/", isLast: true }];
  }
  
  // Build breadcrumb chain from current to root
  const chain: { label: string; href: string }[] = [];
  let currentPath = path;
  let config = currentConfig;
  let label = currentLabel;
  
  while (config) {
    chain.unshift({ label, href: currentPath });
    
    if (config.parent) {
      currentPath = config.parent;
      config = routeConfig[currentPath];
      label = config?.label || "";
    } else {
      break;
    }
  }
  
  // Mark last item
  return chain.map((item, index) => ({
    ...item,
    isLast: index === chain.length - 1,
  }));
}

export default function Breadcrumb() {
  const [location] = useLocation();
  const items = getBreadcrumbItems(location);
  
  // Don't show breadcrumb on dashboard
  if (location === "/") {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          )}
          {item.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <Link href={item.href}>
              <span
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                  index === 0 && "flex items-center gap-1"
                )}
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
