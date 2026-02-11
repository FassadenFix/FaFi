/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Interaktiver Onboarding-Flow für neue Benutzer
 * 
 * Überarbeitet: 09.02.2026
 * - Rollenspezifische Tour-Varianten (GF, Kundenberater, AT-Leiter, Projektleiter, Büro)
 * - Interaktive Steps: Nutzer klickt selbst statt nur zu lesen
 * - Tour-Dauer und Statistik dynamisch nach Rolle
 * - Sprache handwerkernah, direkt, nutzenorientiert
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Rocket,
  LayoutDashboard,
  FolderKanban,
  FileText,
  HardHat,
  Building2,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  Zap,
  Shield,
  PartyPopper,
  Clock,
  Wallet,
  Globe,
  Archive,
  CalendarSearch,
  ClipboardList,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

type FaFiRole = 'gf' | 'kundenberater' | 'at_leiter' | 'projektleiter' | 'buero';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: string;
  route?: string;
  /** Wenn gesetzt, nur für diese Rollen sichtbar. Leer = alle Rollen. */
  roles?: FaFiRole[];
  /** Interaktiver Step: Nutzer muss selbst klicken */
  interactive?: boolean;
  /** CSS-Selector des Elements, auf das der Nutzer klicken soll */
  interactiveTarget?: string;
  /** Aufforderungstext für interaktive Steps */
  interactivePrompt?: string;
}

// ─── Rollenspezifische Welcome-Texte ─────────────────────────────────────────

const roleWelcomeTexts: Record<FaFiRole | 'default', { subtitle: string; features: string[] }> = {
  gf: {
    subtitle: "Als Geschäftsführer hast du den vollen Überblick – KPIs, Finanzen, Team und alle Projekte.",
    features: ["Alle Bereiche freigeschaltet", "Finanzen & Umsatz im Blick", "Team & Einstellungen verwalten"],
  },
  kundenberater: {
    subtitle: "Als Kundenberater erstellst du Angebote, pflegst Kontakte und begleitest Projekte bis zum Auftrag.",
    features: ["Angebote in wenigen Klicks", "Kontakte & Unternehmen verwalten", "Projekte vom Erstgespräch bis zum Auftrag"],
  },
  at_leiter: {
    subtitle: "Als AT-Leiter steuerst du die Baustellen, dein Team und die tägliche Durchführung.",
    features: ["Baustellen-Übersicht & Manager", "Teamleitercheck vor Arbeitsbeginn", "Fortschritt direkt dokumentieren"],
  },
  projektleiter: {
    subtitle: "Als Projektleiter planst du Einsätze, koordinierst Ressourcen und sorgst für reibungslose Abläufe.",
    features: ["Einsatzplanung & Ressourcen", "Vorbereitungsaufgaben-Board", "Projekt-Detail mit allen Tabs"],
  },
  buero: {
    subtitle: "Im Büro kümmerst du dich um Rechnungen, Dokumente und das Unternehmenssystem.",
    features: ["Rechnungen & Zahlungen", "Archiv & Dokumentenverwaltung", "Vorlagen & Textbausteine"],
  },
  default: {
    subtitle: "Das ist dein neues Werkzeug für alle Projekte – von der ersten Objektaufnahme bis zur fertigen Abnahme.",
    features: ["Kurze Einführung in 2 Minuten", "Schritt für Schritt durch alle Bereiche", "Jederzeit wiederholbar"],
  },
};

// ─── Tour Steps Configuration ────────────────────────────────────────────────

export const allTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Willkommen bei FaFi PM!",
    description: "Das ist dein Werkzeug für alle Projekte – von der Objektaufnahme bis zur Abnahme. Wir zeigen dir kurz, wo du was findest.",
    icon: Rocket,
    position: "center",
    // Alle Rollen sehen den Welcome-Step
  },
  {
    id: "dashboard-kpis",
    title: "Deine Zahlen auf einen Blick",
    description: "Hier siehst du sofort: Wie viele Angebote offen sind, welche Baustellen laufen und wie der Umsatz steht.",
    icon: LayoutDashboard,
    targetSelector: "[data-tour='dashboard-kpis']",
    position: "bottom",
    route: "/",
    // Alle Rollen sehen KPIs
  },
  {
    id: "countdown",
    title: "Was steht an?",
    description: "Die Countdown-Aufgaben zeigen dir, was bald fällig ist. Rot heißt: Muss heute erledigt werden.",
    icon: Clock,
    targetSelector: "[data-tour='countdown-tasks']",
    position: "left",
    route: "/",
  },
  {
    id: "kanban",
    title: "Projekte verschieben",
    description: "Zieh Projekte einfach von einer Spalte in die nächste – von Objektaufnahme bis Abgeschlossen.",
    icon: FolderKanban,
    targetSelector: "[data-tour='kanban-board']",
    position: "top",
    route: "/",
  },
  {
    id: "quick-actions",
    title: "Schnellaktionen",
    description: "Neues Projekt anlegen, Angebot erstellen oder Immobilie erfassen – die wichtigsten Aktionen sind immer nur einen Klick entfernt.",
    icon: Zap,
    targetSelector: "[data-tour='quick-actions']",
    position: "left",
    route: "/",
  },
  {
    id: "nav-projekte",
    title: "Alle Projekte",
    description: "Hier findest du alle Projekte auf einen Blick. Filtern nach Phase, Kundenberater oder Zeitraum.",
    icon: FolderKanban,
    targetSelector: "[data-tour='nav-projekte']",
    position: "right",
    interactive: true,
    interactiveTarget: "[data-tour='nav-projekte']",
    interactivePrompt: "Klick jetzt auf 'Projekte' in der Seitenleiste",
  },
  {
    id: "immobilien",
    title: "Gebäude aufnehmen",
    description: "Neue Immobilie? Hier trägst du alles ein: Adresse, Fassadentyp, Maße pro Seite – auch mit Teilflächen. Fotos direkt dazu.",
    icon: Building2,
    targetSelector: "[data-tour='nav-immobilien']",
    position: "right",
  },
  {
    id: "angebote",
    title: "Angebote erstellen",
    description: "Erstell Angebote in wenigen Klicks. Die Flächen werden automatisch aus der Objektaufnahme übernommen, der Preis berechnet sich von selbst.",
    icon: FileText,
    targetSelector: "[data-tour='nav-angebote']",
    position: "right",
    roles: ['gf', 'kundenberater', 'buero'],
    interactive: true,
    interactiveTarget: "[data-tour='nav-angebote']",
    interactivePrompt: "Klick auf 'Angebote' - dort erstellst du neue Angebote",
  },
  {
    id: "baustellen",
    title: "Baustellen im Blick",
    description: "Hier siehst du den Fortschritt jeder Baustelle. Wetter, Team, Geräte – alles an einem Ort. Funktioniert auch unterwegs auf dem Tablet.",
    icon: HardHat,
    targetSelector: "[data-tour='nav-baustellen']",
    position: "right",
    roles: ['gf', 'at_leiter', 'projektleiter'],
  },
  {
    id: "einsatzplanung",
    title: "Team & Einsätze planen (Vorschau)",
    description: "Wer fährt wohin? Dieser Bereich zeigt dir eine Vorschau, wie du später Teams auf Baustellen einteilst und Termine planst. Wird bald mit echten Daten befüllt.",
    icon: Shield,
    targetSelector: "[data-tour='nav-einsatzplanung']",
    position: "right",
    roles: ['gf', 'projektleiter'],
  },
  {
    id: "vorbereitungsaufgaben",
    title: "Vorbereitungsaufgaben",
    description: "Bewohnerinfo, Straßensperre, Material bestellen – alle Aufgaben vor dem Einsatz auf einem Board. Zieh sie auf ‚Erledigt', wenn's gemacht ist.",
    icon: ClipboardList,
    targetSelector: "[data-tour='nav-vorbereitungsaufgaben']",
    position: "right",
    roles: ['gf', 'kundenberater', 'projektleiter'],
  },
  {
    id: "finanzen",
    title: "Finanzen & Rechnungen (Vorschau)",
    description: "Dieser Bereich zeigt dir eine Vorschau des Finanzmoduls. Rechnungen, Zahlungen und Mahnungen werden hier später mit echten Daten angezeigt.",
    icon: Wallet,
    targetSelector: "[data-tour='section-finanzen']",
    position: "right",
    roles: ['gf', 'buero'],
  },
  {
    id: "archiv",
    title: "Archiv & Dokumente",
    description: "Alle Dokumente an einem Ort: Angebote, Rechnungen, Protokolle, Fotos. Automatisch benannt und dem richtigen Projekt zugeordnet.",
    icon: Archive,
    targetSelector: "[data-tour='section-unternehmenssystem']",
    position: "right",
    roles: ['gf', 'buero'],
  },
  {
    id: "complete",
    title: "Du bist startklar!",
    description: "Das war's schon. Bei Fragen einfach melden – wir helfen gern. Jetzt kann's losgehen!",
    icon: PartyPopper,
    position: "center",
    // Alle Rollen sehen den Abschluss
  },
];

/**
 * Filtert Tour-Steps nach Rolle.
 * GF und Admin sehen alle Steps.
 * Andere Rollen sehen nur Steps ohne roles-Einschränkung oder Steps, die ihre Rolle enthalten.
 */
export function getFilteredTourSteps(role: FaFiRole | null | undefined): TourStep[] {
  // GF oder keine Rolle → alle Steps
  if (!role || role === 'gf') return allTourSteps;

  return allTourSteps.filter(step => {
    // Steps ohne Rollen-Einschränkung → für alle sichtbar
    if (!step.roles || step.roles.length === 0) return true;
    // Step nur sichtbar, wenn die Rolle enthalten ist
    return step.roles.includes(role);
  });
}

/**
 * Berechnet die geschätzte Tour-Dauer basierend auf der Anzahl der Steps.
 * ~10 Sekunden pro Step, aufgerundet auf volle Minuten.
 */
export function estimateTourDuration(stepCount: number): number {
  return Math.max(1, Math.ceil((stepCount * 10) / 60));
}

// ─── Spotlight Overlay ───────────────────────────────────────────────────────

function SpotlightOverlay({
  targetRect,
  visible,
  interactive,
}: {
  targetRect: DOMRect | null;
  visible: boolean;
  interactive?: boolean;
}) {
  if (!visible || !targetRect) return null;

  const padding = 8;
  const borderRadius = 12;

  return (
    <div className={cn("fixed inset-0 z-[9998]", interactive ? "pointer-events-none" : "pointer-events-none")}>
      <svg className="w-full h-full" style={{ pointerEvents: interactive ? 'none' : 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - padding}
              y={targetRect.top - padding}
              width={targetRect.width + padding * 2}
              height={targetRect.height + padding * 2}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      {/* Highlight border */}
      <div
        className={cn(
          "absolute border-2 rounded-xl",
          interactive
            ? "border-amber-400 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.4)]"
            : "border-primary animate-pulse"
        )}
        style={{
          left: targetRect.left - padding,
          top: targetRect.top - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      />
      {/* Interactive click-through zone: allow pointer events only on the target element */}
      {interactive && (
        <div
          className="absolute z-[9999] cursor-pointer"
          style={{
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  );
}

// ─── Tour Tooltip ────────────────────────────────────────────────────────────

function TourTooltip({
  step,
  currentIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  waitingForClick,
  interactiveTimeout,
}: {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  waitingForClick?: boolean;
  interactiveTimeout?: boolean;
}) {
  const Icon = step.icon;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;
  const isCentered = step.position === "center" || !targetRect;

  const getPosition = () => {
    if (isCentered || !targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const tooltipWidth = 400;
    const tooltipHeight = 280;
    const gap = 16;

    let left = 0;
    let top = 0;

    switch (step.position) {
      case "bottom":
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.bottom + gap;
        break;
      case "top":
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.top - tooltipHeight - gap;
        break;
      case "right":
        left = targetRect.right + gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case "left":
        left = targetRect.left - tooltipWidth - gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      default:
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.bottom + gap;
    }

    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    return { left: `${left}px`, top: `${top}px` };
  };

  const position = getPosition();

  return (
    <Card
      className={cn(
        "fixed z-[10000] w-[400px] shadow-2xl border-primary/20 animate-fade-in-up",
        isCentered && "max-w-[90vw]"
      )}
      style={position}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Schritt {currentIndex + 1} von {totalSteps}
              </p>
              <h3 className="font-bold text-lg">{step.title}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-2 -mr-2"
            onClick={onSkip}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        {/* Interactive prompt */}
        {waitingForClick && step.interactivePrompt && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 text-sm">
            <MousePointerClick className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-bounce" />
            <span className="font-medium text-amber-800 dark:text-amber-300">{step.interactivePrompt}</span>
          </div>
        )}

        {/* Action hint (non-interactive) */}
        {step.action && !waitingForClick && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl mb-4 text-sm">
            <Target className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{step.action}</span>
          </div>
        )}

        {/* Progress */}
        <Progress value={((currentIndex + 1) / totalSteps) * 100} className="h-1.5 mb-4" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground text-sm"
          >
            Tour beenden
          </Button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
            )}
            {isLast ? (
              <Button onClick={onComplete} className="ff-button gap-2" size="sm">
                <CheckCircle2 className="w-4 h-4" />
                Fertig!
              </Button>
            ) : waitingForClick && !interactiveTimeout ? (
              // Interaktiver Step: Kein Weiter-Button, Nutzer muss klicken
              <Button variant="outline" size="sm" disabled className="gap-1 opacity-60">
                <MousePointerClick className="w-4 h-4" />
                Warte auf Klick…
              </Button>
            ) : (
              <Button onClick={onNext} className="ff-button gap-2" size="sm">
                Weiter
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Welcome Dialog ──────────────────────────────────────────────────────────

function WelcomeDialog({
  open,
  onStart,
  onSkip,
  role,
  stepCount,
}: {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
  role: FaFiRole | null;
  stepCount: number;
}) {
  const welcomeText = roleWelcomeTexts[role || 'default'] || roleWelcomeTexts.default;
  const duration = estimateTourDuration(stepCount);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            Hey, schön dass du da bist!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {welcomeText.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {welcomeText.features.map((feature, i) => {
            const icons = [Zap, Target, CheckCircle2];
            const FeatureIcon = icons[i % icons.length];
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <FeatureIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{feature}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {stepCount} Bereiche · ca. {duration} {duration === 1 ? 'Minute' : 'Minuten'} · jederzeit wiederholbar
        </p>

        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={onStart} className="ff-button w-full gap-2">
            <Rocket className="w-4 h-4" />
            Los geht's!
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Später
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Completion Dialog ───────────────────────────────────────────────────────

function CompletionDialog({
  open,
  onClose,
  stepCount,
  role,
}: {
  open: boolean;
  onClose: () => void;
  stepCount: number;
  role: FaFiRole | null;
}) {
  const duration = estimateTourDuration(stepCount);

  // Rollenspezifische Tipps
  const roleTips: Record<FaFiRole | 'default', { steps: string[] }> = {
    gf: {
      steps: [
        "Schau dir das **Dashboard** an – dort siehst du alle KPIs auf einen Blick",
        "Prüfe die **Projekte** – alle laufenden Projekte auf einen Blick",
        "Unter **Einstellungen** kannst du das Team verwalten",
      ],
    },
    kundenberater: {
      steps: [
        "Starte mit einer **Objektaufnahme** – das ist der erste Schritt für jedes Projekt",
        "Erstelle dein erstes **Angebot** – die Flächen werden automatisch übernommen",
        "Nutze **Unternehmen & Kontakte** für deine Kundenpflege",
      ],
    },
    at_leiter: {
      steps: [
        "Öffne den **Baustellenmanager** – dort steuerst du den Tagesablauf",
        "Mach den **Teamleitercheck** vor jedem Arbeitsbeginn",
        "Dokumentiere Fortschritte direkt auf der **Baustelle**",
      ],
    },
    projektleiter: {
      steps: [
        "Plane deinen nächsten Einsatz über die **Projekte**",
        "Check die **Vorbereitungsaufgaben** – was muss noch erledigt werden?",
        "Nutze die **Baustellenübersicht** für den Überblick über alle Einsätze",
      ],
    },
    buero: {
      steps: [
        "Prüfe offene **Aufträge** und deren Status",
        "Nutze das **Archiv** – alle Dokumente automatisch sortiert",
        "Erstelle **Vorlagen** für wiederkehrende Dokumente",
      ],
    },
    default: {
      steps: [
        "Schau dir das **Dashboard** an – dort siehst du alles auf einen Blick",
        "Nutze die **Schnellaktionen** unten rechts für häufige Aufgaben",
        "Bei jedem **Fragezeichen-Icon** findest du eine kurze Erklärung",
      ],
    },
  };

  const tips = roleTips[role || 'default'] || roleTips.default;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <VisuallyHidden>
          <DialogTitle>Einführung abgeschlossen</DialogTitle>
        </VisuallyHidden>
        <div className="py-6">
          <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit">
            <PartyPopper className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Top, du bist startklar!</h2>
          <p className="text-muted-foreground mb-6">
            Du kennst jetzt die wichtigsten Bereiche. Einfach loslegen – bei Fragen sind wir da.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold text-primary">{stepCount}</p>
              <p className="text-xs text-muted-foreground">Bereiche</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold text-primary">{duration}</p>
              <p className="text-xs text-muted-foreground">{duration === 1 ? 'Minute' : 'Minuten'}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground">Bereit</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <p className="text-sm font-medium text-foreground">Tipp zum Einstieg:</p>
            {tips.steps.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold">{i + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            ))}
          </div>

          <Button onClick={onClose} className="ff-button w-full gap-2">
            <Zap className="w-4 h-4" />
            Jetzt loslegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Onboarding Component ───────────────────────────────────────────────

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userRole = (user as any)?.fafiRole as FaFiRole | null || null;

  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [interactiveTimeout, setInteractiveTimeout] = useState(false);
  const interactiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get role-filtered steps
  const filteredSteps = getFilteredTourSteps(userRole);
  const currentStep = filteredSteps[currentStepIndex];

  // Check if onboarding should be shown
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("fafi-onboarding-completed");
    const hasSkippedOnboarding = localStorage.getItem("fafi-onboarding-skipped");

    if (!hasSeenOnboarding && !hasSkippedOnboarding) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update target element position
  useEffect(() => {
    if (!showTour || !currentStep?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.targetSelector!);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updatePosition, 300);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [showTour, currentStep]);

  // Navigate to route if specified
  useEffect(() => {
    if (showTour && currentStep?.route) {
      setLocation(currentStep.route);
    }
  }, [showTour, currentStep, setLocation]);

  // Handle interactive steps
  useEffect(() => {
    if (!showTour || !currentStep?.interactive || !currentStep?.interactiveTarget) {
      setWaitingForClick(false);
      setInteractiveTimeout(false);
      if (interactiveTimeoutRef.current) {
        clearTimeout(interactiveTimeoutRef.current);
        interactiveTimeoutRef.current = null;
      }
      return;
    }

    setWaitingForClick(true);
    setInteractiveTimeout(false);

    // Set a 10-second timeout to show the "Weiter" button as fallback
    interactiveTimeoutRef.current = setTimeout(() => {
      setInteractiveTimeout(true);
    }, 10000);

    // Listen for clicks on the interactive target
    const handleClick = (e: MouseEvent) => {
      const target = document.querySelector(currentStep.interactiveTarget!);
      if (target && (target === e.target || target.contains(e.target as Node))) {
        // User clicked the target! Advance to next step after a brief success flash
        setWaitingForClick(false);
        if (interactiveTimeoutRef.current) {
          clearTimeout(interactiveTimeoutRef.current);
          interactiveTimeoutRef.current = null;
        }
        // Brief delay to let the navigation happen, then advance
        setTimeout(() => {
          if (currentStepIndex < filteredSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
          }
        }, 500);
      }
    };

    // Use capture phase to catch the click before the link navigates
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (interactiveTimeoutRef.current) {
        clearTimeout(interactiveTimeoutRef.current);
        interactiveTimeoutRef.current = null;
      }
    };
  }, [showTour, currentStep, currentStepIndex, filteredSteps.length]);

  const handleStart = useCallback(() => {
    setShowWelcome(false);
    setShowTour(true);
    setCurrentStepIndex(0);
  }, []);

  const handleSkip = useCallback(() => {
    setShowWelcome(false);
    setShowTour(false);
    setWaitingForClick(false);
    localStorage.setItem("fafi-onboarding-skipped", "true");
  }, []);

  const handleNext = useCallback(() => {
    if (currentStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, filteredSteps.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(() => {
    setShowTour(false);
    setShowCompletion(true);
    setWaitingForClick(false);
    localStorage.setItem("fafi-onboarding-completed", "true");
  }, []);

  const handleCloseCompletion = useCallback(() => {
    setShowCompletion(false);
    setLocation("/");
  }, [setLocation]);

  if (!currentStep) return null;

  return (
    <>
      {/* Welcome Dialog */}
      <WelcomeDialog
        open={showWelcome}
        onStart={handleStart}
        onSkip={handleSkip}
        role={userRole}
        stepCount={filteredSteps.length}
      />

      {/* Tour Overlay */}
      {showTour && (
        <>
          <SpotlightOverlay
            targetRect={targetRect}
            visible={!!currentStep.targetSelector}
            interactive={waitingForClick}
          />
          <TourTooltip
            step={currentStep}
            currentIndex={currentStepIndex}
            totalSteps={filteredSteps.length}
            targetRect={targetRect}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onComplete={handleComplete}
            waitingForClick={waitingForClick}
            interactiveTimeout={interactiveTimeout}
          />
        </>
      )}

      {/* Completion Dialog */}
      <CompletionDialog
        open={showCompletion}
        onClose={handleCloseCompletion}
        stepCount={filteredSteps.length}
        role={userRole}
      />
    </>
  );
}

// ─── Hook to restart onboarding ──────────────────────────────────────────────

export function useOnboarding() {
  const restartOnboarding = useCallback(() => {
    localStorage.removeItem("fafi-onboarding-completed");
    localStorage.removeItem("fafi-onboarding-skipped");
    window.location.reload();
  }, []);

  return { restartOnboarding };
}

export default Onboarding;
