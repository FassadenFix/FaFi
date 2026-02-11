import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  onSave?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseAutoSaveReturn<T> {
  status: SaveStatus;
  lastSaved: Date | null;
  saveNow: () => void;
  loadSaved: () => T | null;
  clearSaved: () => void;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>({
  key,
  data,
  debounceMs = 1000,
  onSave,
  onError,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>("");
  const storageKey = "fafi-autosave-" + key;

  const saveData = useCallback(async (dataToSave: T) => {
    try {
      setStatus("saving");
      
      const savePayload = {
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: 1,
      };
      localStorage.setItem(storageKey, JSON.stringify(savePayload));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStatus("saved");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      lastDataRef.current = JSON.stringify(dataToSave);
      
      onSave?.(dataToSave);
      
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setStatus("error");
      onError?.(error as Error);
      toast.error("Speichern fehlgeschlagen", {
        description: "Die Daten konnten nicht gespeichert werden.",
      });
    }
  }, [storageKey, onSave, onError]);

  useEffect(() => {
    if (!enabled) return;
    
    const currentData = JSON.stringify(data);
    
    if (currentData === lastDataRef.current) return;
    
    setHasUnsavedChanges(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, saveData]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [data, saveData]);

  const loadSaved = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      lastDataRef.current = JSON.stringify(parsed.data);
      return parsed.data;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey);
    lastDataRef.current = "";
    setLastSaved(null);
    setHasUnsavedChanges(false);
  }, [storageKey]);

  return {
    status,
    lastSaved,
    saveNow,
    loadSaved,
    clearSaved,
    hasUnsavedChanges,
  };
}

export function AutoSaveIndicator({ 
  status, 
  lastSaved 
}: { 
  status: SaveStatus; 
  lastSaved: Date | null;
}) {
  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Speichert...";
      case "saved":
        return "Gespeichert";
      case "error":
        return "Fehler beim Speichern";
      default:
        if (lastSaved) {
          return "Zuletzt: " + lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        }
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return "text-amber-500";
      case "saved":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (status === "idle" && !lastSaved) return null;

  return (
    <div className={"flex items-center gap-2 text-xs " + getStatusColor()}>
      {status === "saving" && (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {status === "saved" && (
        <span className="text-green-500">✓</span>
      )}
      {status === "error" && (
        <span className="text-red-500">✗</span>
      )}
      <span>{getStatusText()}</span>
    </div>
  );
}

export default useAutoSave;
