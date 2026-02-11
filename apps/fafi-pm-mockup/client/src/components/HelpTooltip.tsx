/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Kontextuelle Hilfe mit Info-Icons und Tooltips
 * 
 * RESPONSIVE OPTIMIERUNG:
 * - Touch-freundliche 44px Touch-Targets
 * - Popover statt Tooltip auf Touch-Geräten
 * - Maximale Breite für Mobile
 * - Einfache, klare Sprache
 */

import { ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Info, ExternalLink, BookOpen, X, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// Hook to detect touch devices
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);
  
  return isTouch;
}

// ============================================
// Feedback Hook & Buttons
// ============================================
type FeedbackRating = "helpful" | "not_helpful";

/**
 * Hook: Lädt eigene Bewertungen und bietet submit-Funktion.
 * Nur aktiv wenn User eingeloggt ist.
 */
function useTooltipFeedback() {
  const { isAuthenticated } = useAuth();
  const { data: myFeedback } = trpc.tooltipFeedback.getMyFeedback.useQuery(
    undefined,
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 }
  );
  const utils = trpc.useUtils();
  const submitMutation = trpc.tooltipFeedback.submit.useMutation({
    onSuccess: () => {
      utils.tooltipFeedback.getMyFeedback.invalidate();
    },
  });

  const feedbackMap = useMemo(() => {
    const map = new Map<string, FeedbackRating>();
    if (myFeedback) {
      for (const fb of myFeedback) {
        map.set(fb.helpTextKey, fb.rating as FeedbackRating);
      }
    }
    return map;
  }, [myFeedback]);

  const submit = useCallback(
    (helpTextKey: string, rating: FeedbackRating) => {
      submitMutation.mutate({ helpTextKey, rating });
    },
    [submitMutation]
  );

  return { feedbackMap, submit, isAuthenticated, isSubmitting: submitMutation.isPending };
}

/**
 * TooltipFeedbackButtons – Daumen hoch/runter unter dem Hilfetext.
 * Minimale Reibung: Ein Klick reicht. Visuelles Feedback nach Klick.
 */
function TooltipFeedbackButtons({ helpTextKey }: { helpTextKey?: string }) {
  const { feedbackMap, submit, isAuthenticated, isSubmitting } = useTooltipFeedback();
  const [justSubmitted, setJustSubmitted] = useState<FeedbackRating | null>(null);

  // Kein Key = kein Feedback möglich
  if (!helpTextKey || !isAuthenticated) return null;

  const currentRating = justSubmitted || feedbackMap.get(helpTextKey);

  const handleClick = (rating: FeedbackRating) => {
    if (isSubmitting) return;
    submit(helpTextKey, rating);
    setJustSubmitted(rating);
    // Reset "Danke" Animation nach 2s
    setTimeout(() => setJustSubmitted(null), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
      <span className="text-[11px] text-muted-foreground mr-auto">Hilfreich?</span>
      <button
        type="button"
        onClick={() => handleClick("helpful")}
        disabled={isSubmitting}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200",
          "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-400",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30",
          currentRating === "helpful"
            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 font-medium"
            : "text-muted-foreground"
        )}
        aria-label="Hilfetext war hilfreich"
      >
        {currentRating === "helpful" && justSubmitted ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <ThumbsUp className={cn("w-3.5 h-3.5", currentRating === "helpful" && "fill-current")} />
        )}
        {justSubmitted === "helpful" ? "Danke!" : null}
      </button>
      <button
        type="button"
        onClick={() => handleClick("not_helpful")}
        disabled={isSubmitting}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200",
          "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30",
          currentRating === "not_helpful"
            ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 font-medium"
            : "text-muted-foreground"
        )}
        aria-label="Hilfetext war nicht hilfreich"
      >
        {currentRating === "not_helpful" && justSubmitted ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <ThumbsDown className={cn("w-3.5 h-3.5", currentRating === "not_helpful" && "fill-current")} />
        )}
        {justSubmitted === "not_helpful" ? "Danke!" : null}
      </button>
    </div>
  );
}

// Help Tooltip Props
interface HelpTooltipProps {
  content: string;
  title?: string;
  helpTextKey?: string;
  learnMoreUrl?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  variant?: "icon" | "inline";
}

/**
 * HelpTooltip - Info-Icon mit Tooltip/Popover
 * 
 * Auf Touch-Geräten wird ein Popover verwendet (Tap-to-open).
 * Auf Desktop wird ein Hover-Tooltip verwendet.
 */
export function HelpTooltip({
  content,
  title,
  helpTextKey,
  learnMoreUrl,
  side = "top",
  className,
  variant = "icon",
}: HelpTooltipProps) {
  const isTouch = useIsTouchDevice();
  const [open, setOpen] = useState(false);

  // Touch-Geräte: Popover mit Tap-to-open
  if (isTouch) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Hilfe anzeigen"
            className={cn(
              // 44px Touch-Target für iPad/Mobile
              "inline-flex items-center justify-center",
              "min-w-[44px] min-h-[44px] -m-2.5",
              "rounded-full touch-manipulation",
              "text-muted-foreground active:text-primary active:bg-primary/10",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              className
            )}
          >
            {variant === "inline" ? (
              <Info className="w-4 h-4" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side={side} 
          className={cn(
            "w-[calc(100vw-2rem)] max-w-xs p-4",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          sideOffset={8}
        >
          <div className="relative">
            {/* Schließen-Button für Touch */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-1 -right-1 p-1.5 rounded-full hover:bg-muted"
              aria-label="Schließen"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {title && (
              <p className="font-semibold text-foreground mb-2 pr-6">{title}</p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1.5 mt-3 font-medium"
              >
                Mehr erfahren <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <TooltipFeedbackButtons helpTextKey={helpTextKey} />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop: Hover-Tooltip – Feedback nur im Popover-Modus (Touch)
  // Für Desktop verwenden wir ein Popover statt Tooltip wenn helpTextKey gesetzt ist
  if (helpTextKey) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Hilfe anzeigen"
            className={cn(
              variant === "inline"
                ? "inline-flex items-center cursor-help"
                : "inline-flex items-center justify-center w-6 h-6 rounded-full",
              "text-muted-foreground hover:text-primary hover:bg-primary/10",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              className
            )}
          >
            {variant === "inline" ? (
              <Info className="w-3.5 h-3.5" />
            ) : (
              <HelpCircle className="w-4 h-4" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          className="max-w-xs p-3 animate-in fade-in-0 zoom-in-95 duration-150"
          sideOffset={6}
        >
          {title && <p className="font-semibold text-foreground mb-1 text-sm">{title}</p>}
          <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline"
            >
              Mehr erfahren <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <TooltipFeedbackButtons helpTextKey={helpTextKey} />
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === "inline") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center cursor-help", className)}>
            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-sm leading-relaxed">{content}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline"
            >
              Mehr erfahren <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Hilfe anzeigen"
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full",
            "text-muted-foreground hover:text-primary hover:bg-primary/10",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            className
          )}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-xs animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm leading-relaxed">{content}</p>
        {learnMoreUrl && (
          <a
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline"
          >
            Mehr erfahren <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Extended Help Popover Props
interface HelpPopoverProps {
  title: string;
  content: ReactNode;
  examples?: string[];
  tips?: string[];
  learnMoreUrl?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * HelpPopover - Ausführliche Hilfe mit Beispielen
 * 
 * Für komplexe Erklärungen mit Beispielen und Tipps.
 * Responsive: Volle Breite auf Mobile.
 */
export function HelpPopover({
  title,
  content,
  examples,
  tips,
  learnMoreUrl,
  children,
  className,
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <button
            type="button"
            aria-label="Hilfe anzeigen"
            className={cn(
              // 44px Touch-Target
              "inline-flex items-center justify-center",
              "min-w-[44px] min-h-[44px] -m-2.5",
              "rounded-full touch-manipulation",
              "text-muted-foreground hover:text-primary hover:bg-primary/10",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              className
            )}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-[calc(100vw-2rem)] max-w-sm p-4",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )} 
        side="top"
        sideOffset={8}
      >
        <div className="space-y-3 relative">
          {/* Schließen-Button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute -top-1 -right-1 p-1.5 rounded-full hover:bg-muted md:hidden"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-start gap-2 pr-6">
            <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <h4 className="font-semibold text-foreground">{title}</h4>
          </div>
          
          <div className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </div>

          {examples && examples.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Beispiele
              </p>
              <ul className="text-sm space-y-1">
                {examples.map((example, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips && tips.length > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg space-y-1.5">
              <p className="text-xs font-medium text-primary">Tipps</p>
              <ul className="text-sm space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary shrink-0">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center gap-1.5 font-medium"
            >
              Dokumentation öffnen <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Form Field with Help Props
interface FormFieldWithHelpProps {
  label: string;
  helpText: string;
  helpTitle?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormFieldWithHelp - Formularfeld mit Hilfe-Icon
 * 
 * Label und Hilfe-Icon in einer Zeile.
 * Touch-optimiert mit 44px Touch-Target.
 */
export function FormFieldWithHelp({
  label,
  helpText,
  helpTitle,
  required,
  error,
  children,
  className,
}: FormFieldWithHelpProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        <Label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <HelpTooltip content={helpText} title={helpTitle} />
      </div>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// Input with Help Props
interface InputWithHelpProps {
  label: string;
  helpText: string;
  helpTitle?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
}

/**
 * InputWithHelp - Eingabefeld mit Hilfe
 */
export function InputWithHelp({
  label,
  helpText,
  helpTitle,
  required,
  error,
  placeholder,
  value,
  onChange,
  type = "text",
  className,
}: InputWithHelpProps) {
  return (
    <FormFieldWithHelp
      label={label}
      helpText={helpText}
      helpTitle={helpTitle}
      required={required}
      error={error}
      className={className}
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "h-11", // Größere Höhe für Touch
          error && "border-destructive"
        )}
      />
    </FormFieldWithHelp>
  );
}

// Textarea with Help Props
interface TextareaWithHelpProps {
  label: string;
  helpText: string;
  helpTitle?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
}

/**
 * TextareaWithHelp - Textbereich mit Hilfe
 */
export function TextareaWithHelp({
  label,
  helpText,
  helpTitle,
  required,
  error,
  placeholder,
  value,
  onChange,
  rows = 3,
  className,
}: TextareaWithHelpProps) {
  return (
    <FormFieldWithHelp
      label={label}
      helpText={helpText}
      helpTitle={helpTitle}
      required={required}
      error={error}
      className={className}
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        className={cn(error && "border-destructive")}
      />
    </FormFieldWithHelp>
  );
}

// Select with Help Props
interface SelectWithHelpProps {
  label: string;
  helpText: string;
  helpTitle?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

/**
 * SelectWithHelp - Auswahlfeld mit Hilfe
 */
export function SelectWithHelp({
  label,
  helpText,
  helpTitle,
  required,
  error,
  placeholder,
  value,
  onChange,
  options,
  className,
}: SelectWithHelpProps) {
  return (
    <FormFieldWithHelp
      label={label}
      helpText={helpText}
      helpTitle={helpTitle}
      required={required}
      error={error}
      className={className}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-11", error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWithHelp>
  );
}

// ============================================
// SectionHelp – Ausklappbarer Info-Banner für Bereiche
// ============================================
interface SectionHelpProps {
  title: string;
  description: string;
  helpTextKey?: string;
  tips?: string[];
  defaultOpen?: boolean;
  className?: string;
}

/**
 * SectionHelp – Kompakter Info-Banner am Kopf eines Bereichs.
 * Zeigt einen kurzen Erklärungstext mit optionalen Tipps.
 * Kann vom Nutzer geschlossen werden (bleibt in localStorage gespeichert).
 */
export function SectionHelp({
  title,
  description,
  helpTextKey,
  tips,
  defaultOpen = true,
  className,
}: SectionHelpProps) {
  const storageKey = `sectionHelp_${title.replace(/\s/g, '_')}`;
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : defaultOpen;
  });

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(storageKey, String(next));
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1",
          className
        )}
        aria-label="Hilfe anzeigen"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Was bedeutet das?</span>
      </button>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm",
      className
    )}>
      <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground">{title}</p>
          <button
            onClick={toggle}
            className="p-1 rounded hover:bg-muted text-muted-foreground shrink-0"
            aria-label="Hilfe schließen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        {tips && tips.length > 0 && (
          <div className="mt-2 space-y-1">
            {tips.map((tip, i) => (
              <p key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary shrink-0 mt-0.5">→</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
        {helpTextKey && <TooltipFeedbackButtons helpTextKey={helpTextKey} />}
      </div>
    </div>
  );
}

// Vordefinierte Hilfe-Texte für häufige Felder
// Einfache, klare Sprache - Du-Ansprache - max. 15 Wörter pro Satz
export const HELP_TEXTS = {
  // ============================================
  // Projekt
  // ============================================
  projektName: {
    title: "Projektname",
    text: "Gib dem Projekt einen Namen, z.B. 'Wohnanlage Sonnenhof' oder 'Musterstraße 5'.",
  },
  hubspotDeal: {
    title: "HubSpot",
    text: "Verknüpf das Projekt mit HubSpot. Dann sind Kundendaten immer aktuell.",
  },
  projektwert: {
    title: "Projektwert",
    text: "Was ist das Projekt wert? Trag den Betrag in Euro ein.",
  },
  projektPhase: {
    title: "Projektphase",
    text: "Jedes Projekt durchläuft 10 Phasen: Von der Objektaufnahme bis zum Abschluss. Die Phase zeigt dir, wo das Projekt gerade steht.",
  },
  naechsterSchritt: {
    title: "Nächster Schritt",
    text: "Das System schlägt dir den nächsten logischen Schritt vor. Basiert auf der aktuellen Phase und offenen Aufgaben.",
  },
  workflowButton: {
    title: "Workflow-Aktion",
    text: "Mit diesem Button bringst du das Projekt in die nächste Phase. Z.B. 'Auftrag bestätigen' erstellt automatisch eine Baustelle.",
  },

  // ============================================
  // Immobilie
  // ============================================
  aufmass: {
    title: "Aufmaß",
    text: "Wie viel m² Fassade? Miss Länge mal Höhe von jeder Seite.",
  },
  tour360: {
    title: "360°-Tour",
    text: "Link zur Rundumansicht. Mach die Aufnahme mit der Ricoh 360-App.",
  },
  fassadentyp: {
    title: "Fassadentyp",
    text: "Aus was ist die Fassade? Putz, Klinker, Holz? Davon hängt der Preis ab.",
  },
  zustand: {
    title: "Zustand",
    text: "Wie sieht's aus? 1 Stern = richtig dreckig, 5 Sterne = fast wie neu.",
  },
  teilbereiche: {
    title: "Teilbereiche",
    text: "Hat die Fassadenseite Vorsprünge oder Unterbrechungen? Dann teile sie in Teilbereiche mit eigenen Maßen auf.",
  },

  // ============================================
  // Angebot
  // ============================================
  rabatt: {
    title: "Rabatt",
    text: "Preisnachlass in %. Stammkunden: 5%, Großauftrag: 10%.",
  },
  zahlungsziel: {
    title: "Zahlungsziel",
    text: "Wie viele Tage hat der Kunde zum Zahlen? Normal sind 14 Tage.",
  },
  gueltigkeitsdauer: {
    title: "Gültigkeit",
    text: "Wie lange gilt das Angebot? Danach musst du ein neues machen.",
  },
  gueltigkeit: {
    title: "Gültigkeit",
    text: "Wie lange gilt das Angebot? Danach musst du ein neues machen.",
  },

  // ============================================
  // Baustelle & Gates
  // ============================================
  buehnentyp: {
    title: "Bühne",
    text: "Welche Bühne brauchst du? Hängt von der Höhe und dem Platz ab.",
  },
  sperrungen: {
    title: "Sperrungen",
    text: "Muss der Gehweg oder Parkplatz gesperrt werden? Genehmigung früh beantragen!",
  },
  wasseranschluss: {
    title: "Wasser",
    text: "Gibt's Wasser vor Ort? Wenn nicht, Tank mitnehmen.",
  },
  vorherDokuGate: {
    title: "Vorher-Dokumentation",
    text: "Bevor die Baustelle starten kann, müssen Vorher-Fotos gemacht werden. Das schützt bei Reklamationen und ist Pflicht.",
  },
  nachherDokuGate: {
    title: "Nachher-Dokumentation",
    text: "Vor der Abnahme müssen Nachher-Fotos gemacht werden. Damit kannst du dem Kunden das Ergebnis zeigen.",
  },
  teamleitercheck: {
    title: "Teamleitercheck",
    text: "Checkliste vor Arbeitsbeginn: Sicherheitsausrüstung, Absperrungen, Wetter. Sicherheit geht immer vor!",
  },

  // ============================================
  // Einsatzplanung
  // ============================================
  zug: {
    title: "Zug / Trupp",
    text: "Ein Zug = 4 Personen: Teamleiter + 3 Facharbeiter. Der Teamleiter ist verantwortlich für seinen Zug.",
  },
  zugGruppe: {
    title: "Zug / Trupp",
    text: "Ein Zug = 4 Personen: Teamleiter + 3 Facharbeiter. Der Teamleiter ist verantwortlich für seinen Zug.",
  },
  verfuegbarkeit: {
    title: "Verfügbarkeit",
    text: "Grün = frei und einsetzbar. Rot = schon auf einer anderen Baustelle eingeplant.",
  },
  einsatzkalender: {
    title: "Einsatzkalender",
    text: "Zeigt dir, wann welcher Zug wo im Einsatz ist. Hilft bei der Planung neuer Projekte.",
  },

  // ============================================
  // Dashboard – KPIs
  // ============================================
  conversionRate: {
    title: "Erfolgsquote (Conversion)",
    text: "Von 10 Angeboten werden z.B. 7 zu Aufträgen = 70% Conversion. Je höher, desto besser.",
  },
  countdown: {
    title: "Countdown-Aufgaben",
    text: "Aufgaben mit Frist. Rot = überfällig, muss sofort erledigt werden. Gelb = bald fällig. Grün = noch Zeit.",
  },
  offeneAngebote: {
    title: "Offene Angebote",
    text: "Angebote, die rausgeschickt wurden, aber noch keine Antwort haben. Nachfassen nicht vergessen!",
  },
  aktiveBaustellen: {
    title: "Aktive Baustellen",
    text: "Baustellen, auf denen gerade gearbeitet wird. Klick für Details und Tagesberichte.",
  },
  offeneAufgaben: {
    title: "Offene Aufgaben",
    text: "Alle Aufgaben, die noch nicht erledigt sind. Dringende Aufgaben werden rot markiert.",
  },
  offeneRechnungen: {
    title: "Offene Rechnungen",
    text: "Rechnungen, die noch nicht bezahlt wurden. Der Betrag zeigt die Summe aller offenen Posten.",
  },
  umsatzBezahlt: {
    title: "Umsatz (bezahlt)",
    text: "Summe aller bezahlten Rechnungen. Das ist das Geld, das tatsächlich auf dem Konto ist.",
  },
  aktiveGarantien: {
    title: "Aktive Garantien",
    text: "Laufende Garantien für abgeschlossene Projekte. Bei Problemen greift die Garantie.",
  },
  kanbanBoard: {
    title: "Projekte nach Phase",
    text: "Jede Spalte = eine Phase. Projekte per Drag & Drop in die nächste Phase schieben.",
  },

  // ============================================
  // Vorbereitungsaufgaben – AG/AN & Ampel
  // ============================================
  agVerantwortung: {
    title: "AG (Auftraggeber)",
    text: "Der Kunde ist zuständig. Z.B. Bewohner informieren, Parkplätze freiräumen, Schlüssel bereitstellen.",
  },
  anVerantwortung: {
    title: "AN (Auftragnehmer = FassadenFix)",
    text: "Wir sind zuständig. Z.B. Material bestellen, Bühne organisieren, Team einteilen.",
  },
  ampelSystem: {
    title: "Ampelsystem",
    text: "Grün = im Zeitplan. Gelb = in den nächsten 3 Tagen fällig. Rot = überfällig, sofort handeln!",
  },
  dragDropHinweis: {
    title: "Drag & Drop",
    text: "Aufgaben mit der Maus greifen und zwischen den Spalten verschieben. Geht auch per Klick auf die Karte.",
  },

  // ============================================
  // Finanzen – Fachbegriffe
  // ============================================
  mahnstufe1: {
    title: "Mahnstufe 1 – Zahlungserinnerung",
    text: "Freundliche Erinnerung nach 30 Tagen. Passiert automatisch, kein Stress.",
  },
  mahnstufe2: {
    title: "Mahnstufe 2 – Mahnung",
    text: "Deutlichere Mahnung nach 60 Tagen. Jetzt wird's ernst, Frist setzen.",
  },
  mahnstufe3: {
    title: "Mahnstufe 3 – Letzte Mahnung",
    text: "Letzte Warnung nach 90 Tagen. Danach geht's zum Anwalt oder Inkasso.",
  },
  offenePosten: {
    title: "Offene Posten",
    text: "Rechnungen, die noch nicht bezahlt sind. Je weniger, desto besser für die Liquidität.",
  },
  zahlungszielFinanzen: {
    title: "Zahlungsziel",
    text: "Frist, bis wann der Kunde zahlen muss. Üblich sind 14 oder 30 Tage nach Rechnungsdatum.",
  },
  gesamtumsatz: {
    title: "Gesamtumsatz",
    text: "Alle Einnahmen zusammen – egal ob schon bezahlt oder noch offen.",
  },
  gewinn: {
    title: "Gewinn",
    text: "Was übrig bleibt nach Abzug aller Kosten. Umsatz minus Kosten = Gewinn.",
  },
  marge: {
    title: "Marge",
    text: "Gewinn in Prozent vom Umsatz. 30% Marge heißt: Von 100€ Umsatz bleiben 30€ Gewinn.",
  },

  // ============================================
  // Berichtswesen – Kennzahlen
  // ============================================
  conversionRateReport: {
    title: "Conversion Rate",
    text: "Wie viel Prozent der Angebote werden zu Aufträgen? Beispiel: 77% heißt, 77 von 100 Angeboten werden angenommen.",
  },
  pipelineWert: {
    title: "Pipeline-Wert",
    text: "Summe aller offenen Angebote. Zeigt dir, wie viel Umsatz noch kommen könnte.",
  },
  umsatzTrend: {
    title: "Umsatz-Trend",
    text: "Vergleich zum Vormonat oder Vorjahr. Pfeil hoch = mehr Umsatz, Pfeil runter = weniger.",
  },
  bearbeiteteFlaeche: {
    title: "Bearbeitete Fläche",
    text: "Wie viele Quadratmeter Fassade wurden gereinigt? Zeigt die Produktivität des Teams.",
  },

  // ============================================
  // Archiv – Benennung & Quellen
  // ============================================
  automatischeBenennung: {
    title: "Automatische Benennung",
    text: "Jede Datei bekommt automatisch einen Namen: Jahr_Firma_Typ_Nummer_Version. So findest du alles sofort.",
  },
  autoArchiv: {
    title: "Auto-Archiv",
    text: "Dokumente, die automatisch archiviert wurden – z.B. beim Erstellen eines Angebots-PDFs oder Foto-Upload.",
  },
  quellenTabs: {
    title: "Quellen-Filter",
    text: "Filtere nach Herkunft: Dokumente, Fotos, Angebots-PDFs, Rechnungen, Garantien oder Mahnungen.",
  },
  verknuepfungsBadges: {
    title: "Verknüpfungen",
    text: "Die farbigen Badges zeigen, wozu die Datei gehört. Klick drauf, um direkt zur Detailseite zu springen.",
  },

  // ============================================
  // Kundenportal – Ampel
  // ============================================
  projektAmpel: {
    title: "Projekt-Status (Ampel)",
    text: "Grün = alles läuft nach Plan. Gelb = kleine Verzögerung möglich. Rot = es gibt ein Problem, wir melden uns.",
  },
  baustellenAmpel: {
    title: "Baustellen-Fortschritt",
    text: "Zeigt dir, wie weit die Arbeiten an deinem Gebäude sind. Der Balken füllt sich mit dem Fortschritt.",
  },

  // ============================================
  // Allgemein
  // ============================================
  pflichtfeld: {
    title: "Muss ausgefüllt werden",
    text: "Ohne das geht's nicht weiter. Bitte ausfüllen.",
  },
  suche: {
    title: "Suche",
    text: "Was suchst du? Tipp: Drück Strg+K für Schnellsuche.",
  },
};
