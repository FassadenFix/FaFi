/**
 * v7.3 – Ampel-Badge Komponente
 * 
 * Zeigt den Ampel-Status (Grün/Gelb/Rot) als visuelles Badge an.
 * Kann als Punkt, Badge oder ausführliche Anzeige mit Tooltip dargestellt werden.
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export type AmpelStatus = "green" | "yellow" | "red";

interface AmpelBadgeProps {
  status: AmpelStatus;
  reasons?: string[];
  blockers?: string[];
  variant?: "dot" | "badge" | "detailed";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_CONFIG = {
  green: {
    label: "Im Plan",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
  },
  yellow: {
    label: "Achtung",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
  },
  red: {
    label: "Kritisch",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertTriangle,
  },
};

const SIZE_MAP = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function AmpelBadge({
  status,
  reasons = [],
  blockers = [],
  variant = "badge",
  size = "md",
  className = "",
}: AmpelBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Dot variant: einfacher farbiger Punkt
  if (variant === "dot") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-block rounded-full ${config.color} ${SIZE_MAP[size]} ${className}`}
              aria-label={config.label}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{config.label}</p>
            {reasons.map((r, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {r}
              </p>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Badge variant: kompaktes Badge mit Label
  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${config.bgColor} ${config.textColor} ${config.borderColor} gap-1.5 ${className}`}
            >
              <span className={`inline-block rounded-full ${config.color} w-2 h-2`} />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{config.label}</p>
              {reasons.map((r, i) => (
                <p key={i} className="text-xs">
                  {r}
                </p>
              ))}
              {blockers.length > 0 && (
                <div className="mt-1 pt-1 border-t">
                  <p className="text-xs font-medium text-red-600">Blockierungen:</p>
                  {blockers.map((b, i) => (
                    <p key={i} className="text-xs text-red-500">
                      • {b}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant: ausführliche Anzeige
  return (
    <div
      className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${config.textColor}`} />
        <span className={`font-medium text-sm ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      {reasons.length > 0 && (
        <div className="space-y-0.5 ml-6">
          {reasons.map((r, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {r}
            </p>
          ))}
        </div>
      )}
      {blockers.length > 0 && (
        <div className="mt-2 ml-6 space-y-0.5">
          <p className="text-xs font-medium text-red-600">Blockierungen:</p>
          {blockers.map((b, i) => (
            <p key={i} className="text-xs text-red-500">
              • {b}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Ampel-Zusammenfassung für Dashboard
 */
interface AmpelSummaryProps {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  className?: string;
}

export function AmpelSummary({
  greenCount,
  yellowCount,
  redCount,
  className = "",
}: AmpelSummaryProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-emerald-500 w-3 h-3" />
        <span className="text-sm font-medium">{greenCount}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-amber-500 w-3 h-3" />
        <span className="text-sm font-medium">{yellowCount}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-red-500 w-3 h-3" />
        <span className="text-sm font-medium">{redCount}</span>
      </div>
    </div>
  );
}
