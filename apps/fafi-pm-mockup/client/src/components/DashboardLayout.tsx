/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * - Sidebar mit FassadenFix Grau (#4e5758)
 * - 8 thematische Navigationsbereiche
 * - Weiche Übergänge und organische Formen
 * - Großzügige Whitespace
 */

import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  FileText,
  HardHat,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Smartphone,
  Globe,
  Sun,
  Moon,
  BarChart3,
  Link as LinkIcon,
  Shield,
  FolderOpen,
  Bell,
  Mic,
  Building,
  Briefcase,
  FileCheck,
  CalendarSearch,
  UserCheck,
  Wrench,
  ClipboardCheck,
  Wallet,
  DollarSign,
  Receipt,
  CreditCard,
  PiggyBank,
  AlertCircle,
  Clock,
  ListTodo,
  CheckSquare,
  ClipboardList,
  Cog,
  Database,
  Users2,
  Archive,
  FileStack,
  Package,
  Boxes,
  Image,
  Video,
  FileSpreadsheet,
  BookTemplate,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { GlobalSearch, useGlobalSearch } from "@/components/GlobalSearch";
import Breadcrumb from "@/components/Breadcrumb";
import { SkipToContent } from "@/components/SkipToContent";
import { OfflineIndicator, OfflineBanner } from "@/components/OfflineMode";
import { useAuth } from "@/_core/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { trpc } from "@/lib/trpc";

// Rollen-Typ für FaFi
type FaFiRole = 'gf' | 'kundenberater' | 'at_leiter' | 'projektleiter' | 'buero';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  isPreview?: boolean; // Vorschau-Seite mit Demo-Daten
  roles?: FaFiRole[]; // Wenn gesetzt, nur für diese Rollen sichtbar
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  roles?: FaFiRole[]; // Wenn gesetzt, nur für diese Rollen sichtbar
}

// Rollenbasierte Sichtbarkeit:
// - gf: Geschäftsführung → sieht ALLES
// - kundenberater: Erstellen, Kundenberatung, Planung
// - at_leiter: Erstellen, Umsetzung, Baustellen
// - projektleiter: Erstellen, Planung, Umsetzung, Vorbereitung
// - buero: Erstellen, Kundenberatung, Finanzen, Unternehmenssystem

// Sidebar-Navigation nach 10-Phasen-Workflow: Objektaufnahme → Angebot → Auftrag → Planung → Vorbereitung → Durchführung → Abnahme → Abschluss
const navSections: NavSection[] = [
  {
    id: "projektmanagement",
    title: "Projektmanagement",
    collapsible: true,
    defaultOpen: true,
    // Alle Rollen sehen diesen Bereich – zentraler Einstieg
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: FolderKanban, label: "Projekte", href: "/projekte" },
      { icon: Building2, label: "Immobilien", href: "/immobilien" },
      { icon: HardHat, label: "Baustellen", href: "/baustellen", roles: ['gf', 'at_leiter', 'projektleiter'] },
    ],
  },
  {
    id: "kundenberatung",
    title: "Kundenberatung",
    collapsible: true,
    defaultOpen: true,
    roles: ['gf', 'kundenberater', 'buero'],
    items: [
      { icon: Building, label: "Unternehmen & Kontakte", href: "/kontakte" },
      { icon: FileText, label: "Angebote", href: "/angebote" },
      { icon: Briefcase, label: "Auftr\u00e4ge", href: "/auftraege" },
      { icon: FileCheck, label: "Garantien & Inspektionen", href: "/garantien" },
    ],
  },
  {
    id: "planung",
    title: "Planung & Einsatz",
    collapsible: true,
    defaultOpen: true,
    roles: ['gf', 'kundenberater', 'projektleiter'],
    items: [
      { icon: CalendarSearch, label: "Terminfinder", href: "/terminfinder" },
      { icon: Shield, label: "Einsatzplanung", href: "/einsatzplanung", roles: ['gf', 'projektleiter'], isPreview: true },
      { icon: Calendar, label: "Ressourcenplaner", href: "/ressourcen", roles: ['gf', 'projektleiter'], isPreview: true },
      { icon: ClipboardList, label: "Vorbereitungsaufgaben", href: "/vorbereitungsaufgaben" },
    ],
  },
  {
    id: "umsetzung",
    title: "Durchf\u00fchrung",
    collapsible: true,
    defaultOpen: false,
    roles: ['gf', 'at_leiter', 'projektleiter'],
    items: [
      { icon: ClipboardCheck, label: "Teamleitercheck", href: "/teamleitercheck" },
      { icon: Smartphone, label: "Baustellenmanager", href: "/mobile" },
      { icon: BarChart3, label: "Auswertung & Abschluss", href: "/berichte", roles: ['gf', 'projektleiter'], isPreview: true },
    ],
  },
  {
    id: "finanzen",
    title: "Finanzen",
    collapsible: true,
    defaultOpen: false,
    roles: ['gf', 'buero'],
    items: [
      { icon: Wallet, label: "Finanzübersicht", href: "/finanzen", isPreview: true },
      { icon: Receipt, label: "Rechnungen", href: "/rechnungen" },
      { icon: CreditCard, label: "Zahlungen", href: "/zahlungen" },
      { icon: PiggyBank, label: "Budgets", href: "/budgets" },
    ],
  },
  {
    id: "kundenportal",
    title: "Kundenportal",
    collapsible: true,
    defaultOpen: false,
    roles: ['gf', 'kundenberater'],
    items: [
      { icon: Globe, label: "Portal-Übersicht", href: "/kundenportal", isPreview: true },
      { icon: FolderOpen, label: "Dokumente teilen", href: "/dokumente" },
      { icon: Bell, label: "Kundenmeldungen", href: "/kundenmeldungen" },
    ],
  },
  {
    id: "unternehmenssystem",
    title: "Unternehmenssystem",
    collapsible: true,
    defaultOpen: false,
    roles: ['gf', 'buero'],
    items: [
      { icon: Archive, label: "Archiv", href: "/archiv" },
      { icon: FileStack, label: "Vorlagen & Textbausteine", href: "/vorlagen" },
      { icon: Package, label: "Materialien & Geräte", href: "/materialien" },
      { icon: Library, label: "Bibliothek", href: "/bibliothek" },
      { icon: Users2, label: "HR Dashboard", href: "/hr" },
      { icon: UserCheck, label: "Mitarbeiter", href: "/hr/mitarbeiter" },
      { icon: FileCheck, label: "HR Dokumente", href: "/hr/dokumente" },
    ],
  },
  {
    id: "system",
    title: "System & Einstellungen",
    collapsible: true,
    defaultOpen: false,
    roles: ['gf'], // Nur GF sieht System-Einstellungen
    items: [
      { icon: Users2, label: "Mitarbeiter", href: "/team" },
      { icon: LinkIcon, label: "HubSpot", href: "/hubspot" },
      { icon: Mic, label: "Spracheingabe", href: "/sprachsteuerung" },
      { icon: Cog, label: "Einstellungen", href: "/einstellungen" },
    ],
  },
];

/**
 * Filtert die Navigations-Sections basierend auf der Benutzerrolle.
 * GF (Geschäftsführung) sieht immer alles.
 * Admins sehen ebenfalls alles.
 */
function getFilteredNavSections(userRole: string | null | undefined, isAdmin: boolean): NavSection[] {
  // Admin oder GF sieht alles
  if (isAdmin || userRole === 'gf' || !userRole) return navSections;
  
  const role = userRole as FaFiRole;
  
  return navSections
    .filter(section => !section.roles || section.roles.includes(role))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(role)),
    }))
    .filter(section => section.items.length > 0);
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Collapsible Navigation Section Component
function NavSectionComponent({ section }: { section: NavSection }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true);

  // Check if any item in this section is active
  const hasActiveItem = section.items.some((item) => location === item.href);

  return (
    <div className="mb-2">
      {section.collapsible ? (
        <button
          data-tour={`section-${section.id}`}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors",
            hasActiveItem
              ? "text-sidebar-foreground/80 bg-sidebar-accent/30"
              : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/20"
          )}
        >
          <span>{section.title}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              !isOpen && "-rotate-90"
            )}
          />
        </button>
      ) : (
        <p data-tour={`section-${section.id}`} className="text-xs uppercase tracking-wider text-sidebar-foreground/40 font-semibold px-3 py-2">
          {section.title}
        </p>
      )}

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-0.5 mt-1">
          {section.items.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-tour={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 touch-target",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.isPreview && (
                    <span className="ml-auto bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                      Vorschau
                    </span>
                  )}
                  {item.badge && !item.isPreview && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.isPreview && <ChevronRight className="w-4 h-4 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const globalSearch = useGlobalSearch();
  const { user } = useAuth();

  // E-02: Baustellen-Badge dynamisch aus DB berechnen
  const { data: constructionSites } = trpc.constructionSite.list.useQuery(undefined, {
    staleTime: 60_000, // 1 Minute Cache
  });
  const activeBaustellenCount = constructionSites?.filter(
    (cs: any) => cs.status === 'aktiv' || cs.status === 'geplant'
  ).length || 0;

  // Rollenbasierte Navigation filtern
  const userFafiRole = (user as any)?.fafiRole || null;
  const isAdmin = user?.role === 'admin';
  const filteredSections = getFilteredNavSections(userFafiRole, isAdmin).map(section => ({
    ...section,
    items: section.items.map(item => {
      if (item.href === '/baustellen') {
        return { ...item, badge: activeBaustellenCount > 0 ? activeBaustellenCount : undefined };
      }
      return item;
    }),
  }));

  // Benutzer-Anzeige
  const userName = user?.name || 'Benutzer';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const roleLabels: Record<string, string> = {
    gf: 'Geschäftsführung',
    kundenberater: 'Kundenberater',
    at_leiter: 'AT-Leiter',
    projektleiter: 'Projektleiter',
    buero: 'Büro',
  };
  const userRoleLabel = roleLabels[userFafiRole || ''] || (isAdmin ? 'Admin' : 'Benutzer');

  const handleLogout = () => {
    toast("Abmelden", {
      description: "Kommt bald!",
    });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/">
          <img
            src="/logo.png"
            alt="FassadenFix"
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>
        <p className="text-xs text-sidebar-foreground/60 mt-2 font-medium">
          Projektmanagement
        </p>
      </div>

      {/* Main Navigation - rollenbasiert gefiltert */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {filteredSections.map((section) => (
          <NavSectionComponent key={section.id} section={section} />
        ))}
      </nav>

      {/* User Section - dynamisch aus Auth */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            {userInitials || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60">{userRoleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors touch-target"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SkipToContent />
      <div className="flex h-screen bg-background">
      
      {/* Mobile Menu Button - nur auf kleinen Screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl bg-sidebar text-sidebar-foreground border-0 shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Hauptnavigation der Anwendung</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Sidebar - versteckt auf mobil */}
      <aside aria-label="Hauptnavigation" className="hidden lg:flex w-72 bg-sidebar text-sidebar-foreground flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content - Padding für mobile Menu-Button */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header aria-label="Kopfzeile" className="h-16 bg-card border-b border-border flex items-center justify-between px-6 pl-20 lg:pl-6">
          {/* Search */}
          <button
            onClick={globalSearch.open}
            className="relative w-96 flex items-center gap-3 pl-10 pr-4 py-2.5 bg-muted rounded-xl border-0 hover:bg-muted/80 transition-all text-left cursor-pointer touch-target"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">Was suchst du?</span>
            <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Nr.62: Offline-Indikator nur bei tatsächlichem Offline-Status sichtbar */}
            <OfflineIndicator />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl touch-target"
              title={theme === "dark" ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            <div className="h-8 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{(() => {
                const now = new Date();
                const day = now.getDate().toString().padStart(2, '0');
                const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
                return `${day}. ${months[now.getMonth()]} ${now.getFullYear()}`;
              })()}</span>
              <span className="mx-2">•</span>
              <span>{(() => {
                const now = new Date();
                const oneJan = new Date(now.getFullYear(), 0, 1);
                const days = Math.floor((now.getTime() - oneJan.getTime()) / 86400000);
                return `KW ${Math.ceil((days + oneJan.getDay() + 1) / 7)}`;
              })()}</span>
            </div>
          </div>
        </header>

        {/* Offline Banner */}
        <OfflineBanner />

        {/* Breadcrumb */}
        <div className="px-6 py-3 bg-background border-b border-border/50">
          <Breadcrumb />
        </div>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6 bg-background" role="main" aria-label="Hauptinhalt">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
