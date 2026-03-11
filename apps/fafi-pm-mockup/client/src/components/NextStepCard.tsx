import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight, Clock, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NextStep {
  projectId: number;
  projectName: string;
  projectNumber: string;
  currentPhase: string;
  phaseLabel: string;
  phaseColor: string;
  nextStepLabel: string;
  nextStepRoute: string;
  companyName: string | null;
  allowedTransitions: Array<{
    to: string;
    label: string;
    description: string;
  }>;
  startDate: string | null;
  endDate: string | null;
}

// HELP-14: Erklärungen warum ein Schritt vorgeschlagen wird, basierend auf Phase
const PHASE_EXPLANATIONS: Record<string, string> = {
  OBJEKTAUFNAHME: "Das Projekt befindet sich in der Objektaufnahme. Der nächste Schritt ist die Erstellung eines Angebots, sobald alle Fassadendaten erfasst sind.",
  ANGEBOT_ERSTELLT: "Das Angebot wurde erstellt und muss nun an den Kunden versendet werden, damit der Vertriebsprozess voranschreitet.",
  ANGEBOT_VERSENDET: "Das Angebot wurde versendet. Jetzt sollte der Kunde nachgefasst werden, um eine Entscheidung herbeizuführen.",
  NACHFASSEN: "Der Kunde wurde kontaktiert. Je nach Rückmeldung wird der Auftrag gewonnen oder das Projekt als verloren markiert.",
  AUFTRAG_GEWONNEN: "Der Auftrag ist bestätigt. Jetzt muss die Planung beginnen: Ressourcen, Zeitplan und Logistik festlegen.",
  PLANUNG: "Die Planung läuft. Sobald alle Ressourcen gebucht und der Zeitplan steht, kann die Vorbereitung starten.",
  VORBEREITUNG: "Alle Vorbereitungen (Bewohnerinfo, Straßensperre, Material) müssen abgeschlossen sein, bevor die Durchführung beginnt.",
  DURCHFUEHRUNG: "Die Arbeiten laufen. Nach Abschluss aller Reinigungsarbeiten folgt die Abnahme mit dem Kunden.",
  ABNAHME: "Die Arbeiten sind abgeschlossen. Die gemeinsame Abnahme mit dem Kunden steht an, danach wird das Projekt abgeschlossen.",
  ABGESCHLOSSEN: "Das Projekt ist abgeschlossen. Garantieurkunde und Rechnung sollten erstellt werden.",
};

interface NextStepCardProps {
  step: NextStep;
  onAdvance?: (projectId: number, targetPhase: string) => void;
}

export function NextStepCard({ step, onAdvance }: NextStepCardProps) {
  const explanation = PHASE_EXPLANATIONS[step.currentPhase] || 
    `Basierend auf der aktuellen Phase "${step.phaseLabel}" und den offenen Aufgaben wird dieser Schritt als nächstes empfohlen.`;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4" style={{ borderLeftColor: step.phaseColor }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Projekt-Info */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">{step.projectNumber}</span>
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 font-medium border-0"
                style={{ backgroundColor: `${step.phaseColor}15`, color: step.phaseColor }}
              >
                {step.phaseLabel}
              </Badge>
            </div>
            
            <Link href={`/projekte/${step.projectId}`}>
              <h4 className="font-semibold text-sm truncate hover:text-primary cursor-pointer transition-colors">
                {step.projectName}
              </h4>
            </Link>
            
            {step.companyName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{step.companyName}</p>
            )}
            
            {/* Nächster Schritt mit Erklärung (HELP-14) */}
            {step.nextStepLabel && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                <span className="text-muted-foreground">Nächster Schritt:</span>
                <span className="font-medium text-foreground">{step.nextStepLabel}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground/60 hover:text-primary cursor-help shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p className="font-medium mb-1">Warum dieser Schritt?</p>
                      <p>{explanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            {/* Zeitinfo */}
            {(step.startDate || step.endDate) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                {step.startDate && <span>{new Date(step.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>}
                {step.startDate && step.endDate && <span>–</span>}
                {step.endDate && <span>{new Date(step.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>}
              </div>
            )}
          </div>
          
          {/* Aktions-Button */}
          <div className="flex flex-col gap-1 shrink-0">
            {step.nextStepRoute && (
              <Link href={step.nextStepRoute}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <span>Öffnen</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            
            {/* Schnell-Advance Button für den ersten erlaubten Übergang */}
            {step.allowedTransitions.length > 0 && onAdvance && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-[10px] text-muted-foreground hover:text-primary px-1.5"
                onClick={() => onAdvance(step.projectId, step.allowedTransitions[0].to)}
                title={step.allowedTransitions[0].description}
              >
                {step.allowedTransitions[0].label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NextStepsWidgetProps {
  steps: NextStep[];
  isLoading?: boolean;
  onAdvance?: (projectId: number, targetPhase: string) => void;
}

export function NextStepsWidget({ steps, isLoading, onAdvance }: NextStepsWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground text-sm">
            Keine aktiven Projekte mit offenen Schritten.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <NextStepCard key={step.projectId} step={step} onAdvance={onAdvance} />
      ))}
    </div>
  );
}
