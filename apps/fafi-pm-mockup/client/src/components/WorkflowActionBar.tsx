import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TransitionInfo {
  to: string;
  label: string;
  description: string;
  guardPassed: boolean;
  guardMessage?: string;
}

interface WorkflowStatusData {
  currentPhase: string;
  phaseLabel: string;
  phaseColor: string;
  allowedTransitions: TransitionInfo[];
}

interface WorkflowActionBarProps {
  projectId: number;
  compact?: boolean;
}

export function WorkflowActionBar({ projectId, compact = false }: WorkflowActionBarProps) {

  const [reason, setReason] = useState("");
  const [advancingTo, setAdvancingTo] = useState<string | null>(null);

  const { data: workflowStatus, isLoading, refetch } = trpc.project.getWorkflowStatus.useQuery(
    { projectId },
    { staleTime: 10_000 }
  );

  const advanceMutation = trpc.project.advancePhase.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Phase geändert", {
          description: result.message,
        });
        refetch();
      } else {
        toast.error("Übergang nicht möglich", {
          description: result.message,
        });
      }
      setAdvancingTo(null);
      setReason("");
    },
    onError: (error) => {
      toast.error("Fehler", {
        description: error.message,
      });
      setAdvancingTo(null);
    },
  });

  if (isLoading || !workflowStatus) {
    return null;
  }

  const status = workflowStatus as WorkflowStatusData;
  const passedTransitions = status.allowedTransitions.filter((t) => t.guardPassed);
  const blockedTransitions = status.allowedTransitions.filter((t) => !t.guardPassed);

  const handleAdvance = (targetPhase: string) => {
    setAdvancingTo(targetPhase);
    advanceMutation.mutate({
      projectId,
      targetPhase: targetPhase as "objektaufnahme" | "angebot_erstellt" | "angebot_versendet" | "nachfassen" | "auftrag_gewonnen" | "planung" | "vorbereitung" | "durchfuehrung" | "abnahme" | "abgeschlossen" | "verloren",
      trigger: "manual",
      reason: reason || undefined,
    });
  };

  // Prüfe ob "verloren" eine Option ist (braucht Begründung)
  const isVerlorenTarget = (phase: string) => phase === "verloren";

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="text-xs font-medium border-0 px-2 py-0.5"
          style={{ backgroundColor: `${status.phaseColor}15`, color: status.phaseColor }}
        >
          {status.phaseLabel}
        </Badge>
        
        {passedTransitions.map((transition) => (
          isVerlorenTarget(transition.to) ? (
            <AlertDialog key={transition.to}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-6 text-xs gap-1">
                  <XCircle className="h-3 w-3" />
                  {transition.label}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Projekt als verloren markieren?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bitte geben Sie eine Begründung an. Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Begründung eingeben..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setReason("")}>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAdvance(transition.to)}
                    disabled={!reason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Als verloren markieren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              key={transition.to}
              size="sm"
              variant="outline"
              className="h-6 text-xs gap-1 hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleAdvance(transition.to)}
              disabled={advanceMutation.isPending}
              title={transition.description}
            >
              {advancingTo === transition.to ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
              {transition.label}
            </Button>
          )
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">Workflow</h4>
          <Badge
            variant="outline"
            className="text-xs font-medium border-0"
            style={{ backgroundColor: `${status.phaseColor}15`, color: status.phaseColor }}
          >
            {status.phaseLabel}
          </Badge>
        </div>
      </div>

      {/* Mögliche Übergänge */}
      {passedTransitions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Nächste Schritte:</p>
          <div className="flex flex-wrap gap-2">
            {passedTransitions.map((transition) => (
              isVerlorenTarget(transition.to) ? (
                <AlertDialog key={transition.to}>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      {transition.label}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Projekt als verloren markieren?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {transition.description}. Bitte geben Sie eine Begründung an.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      placeholder="Begründung eingeben..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setReason("")}>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleAdvance(transition.to)}
                        disabled={!reason.trim()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Als verloren markieren
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  key={transition.to}
                  size="sm"
                  variant="outline"
                  className="gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAdvance(transition.to)}
                  disabled={advanceMutation.isPending}
                  title={transition.description}
                >
                  {advancingTo === transition.to ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {transition.label}
                </Button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Blockierte Übergänge */}
      {blockedTransitions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Noch nicht möglich:</p>
          {blockedTransitions.map((transition) => (
            <div key={transition.to} className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
              <div>
                <span className="font-medium">{transition.label}</span>
                {transition.guardMessage && (
                  <span className="ml-1">– {transition.guardMessage}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End-Zustand */}
      {status.allowedTransitions.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Projekt ist in einem End-Zustand. Keine weiteren Übergänge möglich.</span>
        </div>
      )}
    </div>
  );
}
