import { getDb } from "../db";
import { projects, activityLogs, workflowHistory, tasks } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getPhaseAutoTasks } from "../services/workflowAutomation";
import {
  type ProjectPhase,
  type TransitionTrigger,
  type PhaseTransitionResult,
  PHASE_TRANSITIONS,
  isTransitionAllowed,
  getPhaseMetadata,
} from "../../shared/schemas/workflow";
import { checkGuard } from "./guards";

/**
 * FaFi PM Workflow State Machine
 * 
 * Leichtgewichtige State-Machine für Phasenübergänge.
 * Validiert Übergänge, prüft Guards und führt Seiteneffekte aus.
 */

// ============================================
// CORE: PHASE TRANSITION
// ============================================

/**
 * Führt einen Phasenübergang für ein Projekt durch.
 * 
 * 1. Prüft ob der Übergang grundsätzlich erlaubt ist
 * 2. Führt die Guard-Funktion aus (DB-Voraussetzungen)
 * 3. Aktualisiert die Projektphase
 * 4. Erstellt History-Eintrag
 * 5. Erstellt Activity-Log-Eintrag
 */
export async function advanceProjectPhase(
  projectId: number,
  targetPhase: ProjectPhase,
  trigger: TransitionTrigger,
  userId: number | null,
  reason?: string,
): Promise<PhaseTransitionResult> {
  // 1. Projekt laden und aktuelle Phase ermitteln
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      fromPhase: "objektaufnahme" as ProjectPhase,
      toPhase: targetPhase,
      message: "Datenbankverbindung nicht verfügbar",
    };
  }
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (!project) {
    return {
      success: false,
      fromPhase: "objektaufnahme",
      toPhase: targetPhase,
      message: `Projekt mit ID ${projectId} nicht gefunden`,
    };
  }

  const currentPhase = project.phase as ProjectPhase;

  // Wenn bereits in der Zielphase → kein Fehler, einfach ignorieren
  if (currentPhase === targetPhase) {
    return {
      success: true,
      fromPhase: currentPhase,
      toPhase: targetPhase,
      message: `Projekt ist bereits in Phase "${getPhaseMetadata(targetPhase)?.label}"`,
    };
  }

  // 2. Prüfe ob der Übergang grundsätzlich erlaubt ist
  if (!isTransitionAllowed(currentPhase, targetPhase)) {
    return {
      success: false,
      fromPhase: currentPhase,
      toPhase: targetPhase,
      message: `Übergang von "${getPhaseMetadata(currentPhase)?.label}" nach "${getPhaseMetadata(targetPhase)?.label}" ist nicht erlaubt`,
    };
  }

  // 3. Finde die Transition-Definition
  const transition = PHASE_TRANSITIONS.find(
    (t) => t.from === currentPhase && t.to === targetPhase
  );

  if (!transition) {
    return {
      success: false,
      fromPhase: currentPhase,
      toPhase: targetPhase,
      message: `Keine Transition-Definition gefunden`,
    };
  }

  // 4. Prüfe Guard-Funktion (DB-Voraussetzungen)
  const guardResult = await checkGuard(transition.guardName, projectId);
  
  if (!guardResult.passed) {
    return {
      success: false,
      fromPhase: currentPhase,
      toPhase: targetPhase,
      message: guardResult.message,
    };
  }

  // 5. Pflicht-Begründung bei "verloren"
  if (targetPhase === "verloren" && !reason) {
    return {
      success: false,
      fromPhase: currentPhase,
      toPhase: targetPhase,
      message: `Beim Übergang zu "Verloren" ist eine Begründung erforderlich`,
    };
  }

  // 6. Phase aktualisieren
  await db!
    .update(projects)
    .set({ phase: targetPhase })
    .where(eq(projects.id, projectId));

  // 7. Workflow-History-Eintrag erstellen
  await db!.insert(workflowHistory).values({
    projectId,
    fromPhase: currentPhase,
    toPhase: targetPhase,
    triggeredBy: trigger,
    userId: userId,
    metadata: {
      reason: reason || null,
      guardName: transition.guardName,
      label: transition.label,
    },
  });

  // 8. Activity-Log-Eintrag erstellen
  await db!.insert(activityLogs).values({
    userId: userId,
    userName: null, // Wird ggf. vom Aufrufer gesetzt
    action: "status_changed",
    entityType: "project",
    entityId: projectId,
    entityName: project.name,
    details: `Phase: ${getPhaseMetadata(currentPhase)?.label} → ${getPhaseMetadata(targetPhase)?.label}${reason ? ` (${reason})` : ""}`,
    metadata: {
      fromPhase: currentPhase,
      toPhase: targetPhase,
      trigger,
    },
  });

  // 9. Automatische Aufgaben für die neue Phase erstellen
  const autoTasks = getPhaseAutoTasks(targetPhase);
  if (autoTasks.length > 0) {
    for (const autoTask of autoTasks) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + autoTask.daysOffset);
      await db!.insert(tasks).values({
        projectId,
        title: autoTask.title,
        description: autoTask.description || null,
        status: "offen",
        priority: autoTask.priority,
        dueDate,
        assignedRole: autoTask.role,
        responsibleParty: autoTask.responsibleParty,
        createdById: userId,
      });
    }
  }

  return {
    success: true,
    fromPhase: currentPhase,
    toPhase: targetPhase,
    message: `Phase erfolgreich geändert: ${getPhaseMetadata(currentPhase)?.label} → ${getPhaseMetadata(targetPhase)?.label}${autoTasks.length > 0 ? ` (${autoTasks.length} Aufgaben erstellt)` : ""}`,
  };
}

// ============================================
// AUTO-ADVANCE: Automatische Phasenübergänge
// ============================================

/**
 * Prüft ob ein automatischer Phasenübergang möglich ist und führt ihn durch.
 * Wird nach relevanten Aktionen aufgerufen (z.B. Angebot gespeichert, E-Mail versendet).
 * 
 * @param projectId - Projekt-ID
 * @param targetPhase - Optionale Zielphase (wenn nicht angegeben, wird die nächste auto-trigger Phase gesucht)
 * @param userId - User-ID des auslösenden Benutzers
 * @param reason - Optionale Begründung für den Übergang
 */
export async function tryAutoAdvance(
  projectId: number,
  targetPhase?: ProjectPhase | string,
  userId?: number | null,
  reason?: string,
): Promise<PhaseTransitionResult | null> {
  const db = await getDb();
  if (!db) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (!project) return null;

  const currentPhase = project.phase as ProjectPhase;

  // Wenn eine Zielphase angegeben ist, versuche direkt diesen Übergang
  if (targetPhase) {
    // Nur wenn der Übergang erlaubt ist und die Phase noch nicht erreicht ist
    if (currentPhase === targetPhase) return null;
    if (!isTransitionAllowed(currentPhase, targetPhase as ProjectPhase)) return null;
    
    return advanceProjectPhase(projectId, targetPhase as ProjectPhase, "auto", userId ?? null, reason);
  }

  // Finde alle auto-trigger Übergänge für die aktuelle Phase
  const autoTransitions = PHASE_TRANSITIONS.filter(
    (t) => t.from === currentPhase && t.autoTrigger
  );

  // Prüfe jeden möglichen Auto-Übergang
  for (const transition of autoTransitions) {
    const guardResult = await checkGuard(transition.guardName, projectId);
    
    if (guardResult.passed) {
      return advanceProjectPhase(projectId, transition.to, "auto", userId ?? null, reason);
    }
  }

  return null; // Kein Auto-Übergang möglich
}

// ============================================
// QUERY: Workflow-Status
// ============================================

/**
 * Gibt den aktuellen Workflow-Status eines Projekts zurück,
 * inklusive erlaubter nächster Schritte.
 */
export async function getWorkflowStatus(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  
  if (!project) return null;

  const currentPhase = project.phase as ProjectPhase;
  const metadata = getPhaseMetadata(currentPhase);
  const allowedTransitions = PHASE_TRANSITIONS.filter((t) => t.from === currentPhase);

  // Prüfe Guards für alle erlaubten Übergänge
  const transitionsWithStatus = await Promise.all(
    allowedTransitions.map(async (t) => {
      const guardResult = await checkGuard(t.guardName, projectId);
      return {
        ...t,
        guardPassed: guardResult.passed,
        guardMessage: guardResult.message,
      };
    })
  );

  return {
    projectId,
    projectName: project.name,
    currentPhase,
    phaseLabel: metadata?.label ?? currentPhase,
    phaseColor: metadata?.color ?? "#6b7280",
    phaseCategory: metadata?.category ?? "sonder",
    nextStepLabel: metadata?.nextStepLabel ?? "",
    nextStepRoute: metadata?.nextStepRoute(projectId) ?? "",
    allowedTransitions: transitionsWithStatus,
  };
}
