/**
 * DemoBanner – Zeigt einen deutlichen Hinweis auf Vorschau-/Demo-Seiten
 * Absicht: Kein Mitarbeiter soll erfundene Daten für echte halten
 */
import { AlertTriangle, Eye } from "lucide-react";

interface DemoBannerProps {
  /** Kurze Beschreibung was auf dieser Seite Demo ist */
  description?: string;
}

export function DemoBanner({ description = "Die angezeigten Daten sind Beispieldaten und werden nach dem Produktivstart durch echte Daten ersetzt." }: DemoBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-700/30 px-4 py-3 flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Vorschau-Ansicht
        </p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

export default DemoBanner;
