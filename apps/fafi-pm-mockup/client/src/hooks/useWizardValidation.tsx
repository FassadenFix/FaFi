/**
 * Wizard Validation Hook
 * Erweiterte Validierung für Wizard-Schritte mit Pflichtfeldern
 * 
 * Features:
 * - Pflichtfeld-Prüfung pro Schritt
 * - Fehlermeldungen mit Feldnamen
 * - Blockiert Weiter-Button bei Fehlern
 * - Visuelle Markierung fehlender Felder
 */

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

export interface ValidationRule {
  field: string;
  label: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: unknown) => boolean;
  customMessage?: string;
}

export interface ValidationError {
  field: string;
  label: string;
  message: string;
}

export interface StepValidation {
  stepId: string;
  rules: ValidationRule[];
}

interface UseWizardValidationOptions {
  steps: StepValidation[];
  data: Record<string, unknown>;
  showToast?: boolean;
}

interface UseWizardValidationReturn {
  errors: ValidationError[];
  errorsByField: Record<string, ValidationError>;
  isStepValid: (stepId: string) => boolean;
  validateStep: (stepId: string) => boolean;
  validateField: (field: string) => ValidationError | null;
  getFieldError: (field: string) => string | undefined;
  hasError: (field: string) => boolean;
  clearErrors: () => void;
  allStepsValid: boolean;
}

export function useWizardValidation({
  steps,
  data,
  showToast = true,
}: UseWizardValidationOptions): UseWizardValidationReturn {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Errors by field für schnellen Zugriff
  const errorsByField = useMemo(() => {
    return errors.reduce((acc, error) => {
      acc[error.field] = error;
      return acc;
    }, {} as Record<string, ValidationError>);
  }, [errors]);

  // Einzelnes Feld validieren
  const validateField = useCallback((field: string): ValidationError | null => {
    // Finde die Regel für dieses Feld
    let rule: ValidationRule | undefined;
    for (const step of steps) {
      rule = step.rules.find(r => r.field === field);
      if (rule) break;
    }
    
    if (!rule) return null;
    
    const value = data[field];
    
    // Required Check
    if (rule.required) {
      if (value === undefined || value === null || value === "") {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.label + " ist ein Pflichtfeld",
        };
      }
      if (Array.isArray(value) && value.length === 0) {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.label + " muss mindestens einen Eintrag haben",
        };
      }
    }
    
    // Nur weitere Checks wenn Wert vorhanden
    if (value !== undefined && value !== null && value !== "") {
      const strValue = String(value);
      
      // MinLength Check
      if (rule.minLength && strValue.length < rule.minLength) {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.label + " muss mindestens " + rule.minLength + " Zeichen haben",
        };
      }
      
      // MaxLength Check
      if (rule.maxLength && strValue.length > rule.maxLength) {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.label + " darf maximal " + rule.maxLength + " Zeichen haben",
        };
      }
      
      // Pattern Check
      if (rule.pattern && !rule.pattern.test(strValue)) {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.patternMessage || rule.label + " hat ein ungültiges Format",
        };
      }
      
      // Custom Check
      if (rule.custom && !rule.custom(value)) {
        return {
          field: rule.field,
          label: rule.label,
          message: rule.customMessage || rule.label + " ist ungültig",
        };
      }
    }
    
    return null;
  }, [steps, data]);

  // Schritt validieren
  const validateStep = useCallback((stepId: string): boolean => {
    const step = steps.find(s => s.stepId === stepId);
    if (!step) return true;
    
    const stepErrors: ValidationError[] = [];
    
    for (const rule of step.rules) {
      const error = validateField(rule.field);
      if (error) {
        stepErrors.push(error);
      }
    }
    
    setErrors(stepErrors);
    
    if (stepErrors.length > 0 && showToast) {
      const errorCount = stepErrors.length;
      toast.error("Bitte alle Pflichtfelder ausfüllen", {
        description: errorCount + " " + (errorCount === 1 ? "Feld fehlt" : "Felder fehlen") + ": " + 
          stepErrors.slice(0, 3).map(e => e.label).join(", ") + 
          (errorCount > 3 ? " ..." : ""),
      });
    }
    
    return stepErrors.length === 0;
  }, [steps, validateField, showToast]);

  // Prüfen ob Schritt valide ist (ohne Errors zu setzen)
  const isStepValid = useCallback((stepId: string): boolean => {
    const step = steps.find(s => s.stepId === stepId);
    if (!step) return true;
    
    for (const rule of step.rules) {
      const error = validateField(rule.field);
      if (error) return false;
    }
    
    return true;
  }, [steps, validateField]);

  // Fehler für Feld abrufen
  const getFieldError = useCallback((field: string): string | undefined => {
    return errorsByField[field]?.message;
  }, [errorsByField]);

  // Prüfen ob Feld Fehler hat
  const hasError = useCallback((field: string): boolean => {
    return !!errorsByField[field];
  }, [errorsByField]);

  // Errors löschen
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Alle Schritte valide?
  const allStepsValid = useMemo(() => {
    return steps.every(step => isStepValid(step.stepId));
  }, [steps, isStepValid]);

  return {
    errors,
    errorsByField,
    isStepValid,
    validateStep,
    validateField,
    getFieldError,
    hasError,
    clearErrors,
    allStepsValid,
  };
}

// Validierungs-Feedback Komponente
export function ValidationFeedback({ 
  error 
}: { 
  error?: string;
}) {
  if (!error) return null;
  
  return (
    <p className="text-xs text-destructive mt-1">{error}</p>
  );
}

// Input mit Validierung
export function ValidatedInput({
  hasError,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      {...props}
      className={className + (hasError ? " border-destructive ring-destructive" : "")}
    />
  );
}

export default useWizardValidation;
