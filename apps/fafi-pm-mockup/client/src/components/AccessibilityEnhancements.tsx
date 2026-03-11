/**
 * Accessibility Enhancements für FassadenFix Projektmanager
 * - ARIA-Labels für Icon-Buttons
 * - Alt-Texte für Bilder
 * - Hilfsfunktionen für Barrierefreiheit
 */

import { ReactNode } from "react";

// Wrapper für Icon-Buttons mit ARIA-Label
interface IconButtonProps {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function IconButton({ children, label, onClick, className = "", disabled = false }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={label}
      title={label}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// Wrapper für Bilder mit Alt-Text
interface AccessibleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function AccessibleImage({ src, alt, className = "", width, height }: AccessibleImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

// Visually Hidden Text für Screenreader
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Live Region für dynamische Ankündigungen
interface LiveRegionProps {
  children: ReactNode;
  politeness?: "polite" | "assertive";
}

export function LiveRegion({ children, politeness = "polite" }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Standard ARIA-Labels für häufig verwendete Aktionen
export const ariaLabels = {
  // Navigation
  openMenu: "Menü öffnen",
  closeMenu: "Menü schließen",
  toggleSidebar: "Seitenleiste ein-/ausblenden",
  goBack: "Zurück",
  goHome: "Zur Startseite",
  
  // Aktionen
  save: "Speichern",
  delete: "Löschen",
  edit: "Bearbeiten",
  cancel: "Abbrechen",
  confirm: "Bestätigen",
  close: "Schließen",
  search: "Suchen",
  filter: "Filtern",
  sort: "Sortieren",
  refresh: "Aktualisieren",
  download: "Herunterladen",
  upload: "Hochladen",
  print: "Drucken",
  share: "Teilen",
  copy: "Kopieren",
  
  // Wizard
  nextStep: "Weiter zum nächsten Schritt",
  previousStep: "Zurück zum vorherigen Schritt",
  completeWizard: "Wizard abschließen",
  
  // Tabellen
  sortAscending: "Aufsteigend sortieren",
  sortDescending: "Absteigend sortieren",
  expandRow: "Zeile erweitern",
  collapseRow: "Zeile einklappen",
  
  // Formulare
  clearInput: "Eingabe löschen",
  showPassword: "Passwort anzeigen",
  hidePassword: "Passwort verbergen",
  selectDate: "Datum auswählen",
  selectTime: "Uhrzeit auswählen",
  
  // Status
  loading: "Wird geladen...",
  saving: "Wird gespeichert...",
  success: "Erfolgreich",
  error: "Fehler",
  warning: "Warnung",
  info: "Information",
  
  // Benachrichtigungen
  notifications: "Benachrichtigungen",
  markAsRead: "Als gelesen markieren",
  markAllAsRead: "Alle als gelesen markieren",
  
  // Theme
  toggleDarkMode: "Dunkelmodus umschalten",
  toggleLightMode: "Hellmodus umschalten",
  
  // Fotos
  viewPhoto: "Foto ansehen",
  deletePhoto: "Foto löschen",
  downloadPhoto: "Foto herunterladen",
  previousPhoto: "Vorheriges Foto",
  nextPhoto: "Nächstes Foto",
  closeGallery: "Galerie schließen",
  
  // Projekte
  viewProject: "Projekt ansehen",
  editProject: "Projekt bearbeiten",
  deleteProject: "Projekt löschen",
  
  // Baustellen
  viewSite: "Baustelle ansehen",
  editSite: "Baustelle bearbeiten",
  
  // Angebote
  viewOffer: "Angebot ansehen",
  editOffer: "Angebot bearbeiten",
  downloadOffer: "Angebot herunterladen",
  sendOffer: "Angebot senden",
  
  // Versionen
  viewHistory: "Versionshistorie anzeigen",
  restoreVersion: "Version wiederherstellen",
  compareVersions: "Versionen vergleichen",
};

// Hilfsfunktion für dynamische ARIA-Labels
export function getAriaLabel(action: string, item?: string): string {
  if (item) {
    return `${action}: ${item}`;
  }
  return action;
}
