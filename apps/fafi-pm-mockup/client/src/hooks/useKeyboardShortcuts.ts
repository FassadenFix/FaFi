/**
 * Keyboard Shortcuts Hook für FaFi PM
 * Zentrale Verwaltung aller Tastenkombinationen
 */
import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook für globale Keyboard Shortcuts
 * Wird im DashboardLayout eingebunden
 */
export function useKeyboardShortcuts() {
  const [, navigate] = useLocation();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: "1", alt: true, description: "Dashboard", action: () => navigate("/") },
    { key: "2", alt: true, description: "Projekte", action: () => navigate("/projekte") },
    { key: "3", alt: true, description: "Angebote", action: () => navigate("/angebote") },
    { key: "4", alt: true, description: "Aufträge", action: () => navigate("/auftraege") },
    { key: "5", alt: true, description: "Baustellen", action: () => navigate("/baustellen") },
    { key: "6", alt: true, description: "Finanzen", action: () => navigate("/finanzen") },
    
    // Schnellaktionen
    { key: "n", alt: true, description: "Neues Projekt", action: () => {
      // Dispatch custom event für ProjektWizard
      window.dispatchEvent(new CustomEvent("fafi:open-wizard", { detail: { type: "projekt" } }));
    }},
    { key: "b", alt: true, description: "Benachrichtigungen", action: () => navigate("/benachrichtigungen") },
    { key: "e", alt: true, description: "Einstellungen", action: () => navigate("/einstellungen") },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignoriere Tastatureingaben in Formularen
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

      if (e.key === shortcut.key && ctrlMatch && altMatch && shiftMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

/**
 * Hook für Escape-Taste (z.B. Dialoge/Wizards schließen)
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [callback, enabled]);
}
