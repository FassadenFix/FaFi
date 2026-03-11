/**
 * Mobile Optimierungen für FassadenFix Projektmanager
 * - Responsive Tabellen mit horizontalem Scroll
 * - Mobile-optimierte Wizards
 * - Bottom Navigation für Tablets/Smartphones
 * - Touch-optimierte Buttons
 */

import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  HardHat,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Responsive Table Wrapper
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0", className)}>
      <div className="min-w-[600px] md:min-w-0">
        {children}
      </div>
    </div>
  );
}

// Mobile Card View für Tabellendaten
interface MobileCardProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

export function MobileCard({ title, subtitle, status, actions, children, onClick }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 space-y-3",
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {status && <div className="flex-shrink-0">{status}</div>}
      </div>
      {children && <div className="text-sm text-muted-foreground">{children}</div>}
      {actions && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {actions}
        </div>
      )}
    </div>
  );
}

// Bottom Navigation für Mobile
interface BottomNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const bottomNavItems: BottomNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderKanban, label: "Projekte", href: "/projekte" },
  { icon: HardHat, label: "Baustellen", href: "/baustellen", badge: 4 },
  { icon: FileText, label: "Angebote", href: "/angebote" },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-label={item.label}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground"
            aria-label="Mehr anzeigen"
          >
            {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="text-xs">Mehr</span>
          </button>
        </div>
      </nav>

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border z-50 md:hidden p-4 space-y-2 safe-area-bottom">
          <Link href="/immobilien">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors">
              Immobilien
            </button>
          </Link>
          <Link href="/teamleitercheck">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors">
              Teamleitercheck
            </button>
          </Link>
          <Link href="/finanzen">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors">
              Finanzen
            </button>
          </Link>
          <Link href="/einstellungen">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors">
              Einstellungen
            </button>
          </Link>
        </div>
      )}
    </>
  );
}

// Mobile Wizard Header
interface MobileWizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onClose?: () => void;
}

export function MobileWizardHeader({ currentStep, totalSteps, title, onClose }: MobileWizardHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sticky top-0 bg-background z-10 border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Schritt {currentStep} von {totalSteps}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Touch-optimierte Action Buttons
interface TouchActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "destructive";
  disabled?: boolean;
}

export function TouchActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
}: TouchActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors min-h-[48px]",
        variant === "default" && "bg-muted hover:bg-muted/80 text-foreground",
        variant === "primary" && "bg-primary hover:bg-primary/90 text-primary-foreground",
        variant === "destructive" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

// Scroll to Top Button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add scroll listener
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", toggleVisibility);
  }

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40"
      aria-label="Nach oben scrollen"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

// iPad-optimierte Container
export function TabletContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-4xl mx-auto px-4 md:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

// Safe Area Padding für iOS
export function SafeAreaWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="pb-20 md:pb-0">
      {children}
    </div>
  );
}
