/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Reusable Wizard Component with Step Indicator
 * 
 * OPTIMIERUNGEN (Loom Feedback v3.3):
 * - Deutlichere Fortschrittsanzeige mit Prozent und visuellen Indikatoren
 * - Pflichtfeld-Markierung mit rotem Stern
 * - Großer grüner "Fertig"-Button (min. 56px Höhe)
 * - Weniger visuelle Ablenkung, klarer Fokus
 */

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Save, X, Sparkles } from "lucide-react";
import { useState, ReactNode } from "react";
import { toast } from "sonner";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  content: ReactNode;
  isOptional?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  title: string;
  description?: string;
  onComplete: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  initialStep?: number;
  showDraftButton?: boolean;
}

/**
 * Pflichtfeld-Label Komponente
 * Verwendung: <RequiredLabel>Feldname</RequiredLabel>
 */
export function RequiredLabel({ children, required = true }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      {required && <span className="text-red-500 font-bold">*</span>}
    </span>
  );
}

/**
 * Pflichtfeld-Hinweis Komponente
 * Zeigt "* Pflichtfeld" am Ende eines Formulars
 */
export function RequiredFieldHint() {
  return (
    <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
      <span className="text-red-500 font-bold">*</span>
      <span>Pflichtfeld</span>
    </p>
  );
}

export default function Wizard({
  steps,
  title,
  description,
  onComplete,
  onCancel,
  onSaveDraft,
  initialStep = 0,
  showDraftButton = true,
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (!isLastStep) {
      setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete wizard
      setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));
      onComplete({});
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow clicking on completed steps or the next step
    if (completedSteps.has(index) || index === currentStep + 1 || index <= currentStep) {
      setCurrentStep(index);
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    } else {
      toast.success("Entwurf gespeichert", {
        description: "Du kannst später fortfahren.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Kompakter und fokussierter */}
      <div className="flex-shrink-0 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-destructive/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* OPTIMIERT: Deutlichere Fortschrittsanzeige */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">
                Schritt {currentStep + 1} von {steps.length}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{currentStepData.title}</span>
            </div>
            {/* Große Prozentanzeige */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              {isLastStep && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Fast fertig!
                </span>
              )}
            </div>
          </div>
          {/* Dickerer Fortschrittsbalken mit Animation */}
          <Progress value={progress} className="h-3 transition-all duration-500" />
        </div>

        {/* Step Indicators - Kompakter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable = isCompleted || index <= currentStep + 1;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all min-w-fit text-sm",
                  "border",
                  isCurrent && "border-primary bg-primary/10 shadow-sm",
                  isCompleted && !isCurrent && "border-primary/40 bg-primary/5",
                  !isCurrent && !isCompleted && "border-transparent bg-muted/40",
                  isClickable && "cursor-pointer hover:bg-primary/10",
                  !isClickable && "cursor-not-allowed opacity-40"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                    isCurrent && "bg-primary text-primary-foreground",
                    isCompleted && !isCurrent && "bg-primary/70 text-primary-foreground",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : Icon ? (
                    <Icon className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium whitespace-nowrap hidden sm:inline",
                    isCurrent && "text-primary",
                    isCompleted && !isCurrent && "text-primary/70",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - min-h-0 ist wichtig für Flex-Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto pb-20">
          {/* Step Title mit optionalem Badge */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              {currentStepData.isOptional && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Optional
                </span>
              )}
            </div>
            {currentStepData.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Step Content */}
          <div className="animate-fade-in-up">{currentStepData.content}</div>
        </div>
      </div>

      {/* Footer - OPTIMIERT: Großer grüner Fertig-Button */}
      <div className="flex-shrink-0 border-t bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </Button>
            {showDraftButton && (
              <Button variant="ghost" onClick={handleSaveDraft} className="gap-2 hidden sm:flex">
                <Save className="w-4 h-4" />
                Entwurf
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCancel} className="hidden sm:flex">
              Abbrechen
            </Button>
            {/* OPTIMIERT: Großer grüner Fertig-Button (min. 56px Höhe) */}
            {isLastStep ? (
              <Button 
                onClick={handleNext} 
                className="gap-2 h-14 px-8 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  backgroundColor: '#77bc1f',
                  minHeight: '56px',
                }}
              >
                <Sparkles className="w-5 h-5" />
                Fertig!
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2 ff-button">
                Weiter
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wizard Dialog Wrapper
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface WizardDialogProps extends WizardProps {
  isOpen: boolean;
}

export function WizardDialog({ isOpen, onCancel, ...props }: WizardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col [&>div]:flex-1 [&>div]:min-h-0">
        {/* Hidden title for accessibility - actual title is shown in Wizard header */}
        <VisuallyHidden>
          <DialogTitle>{props.title}</DialogTitle>
        </VisuallyHidden>
        <Wizard {...props} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
}
