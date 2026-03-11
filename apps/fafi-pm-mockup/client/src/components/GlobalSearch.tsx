/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * GlobalSearch: Command-Palette-Style Suchfunktion – jetzt mit DB-Anbindung (KA-10)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Building2,
  FileText,
  FolderOpen,
  HardHat,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Command,
  CornerDownLeft,
  Loader2,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Search result types
interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  href: string;
}

// Quick actions - aligned with 8 navigation sections
const quickActions: SearchResult[] = [
  { id: "qa1", type: "aktion", title: "Neues Projekt erstellen", subtitle: "Erstellen & Erfassen", href: "/projekte" },
  { id: "qa2", type: "aktion", title: "Neue Baustelle anlegen", subtitle: "Erstellen & Erfassen", href: "/baustellen" },
  { id: "qa3", type: "aktion", title: "Neue Immobilie erfassen", subtitle: "Erstellen & Erfassen", href: "/immobilien" },
  { id: "qa4", type: "aktion", title: "Neues Angebot erstellen", subtitle: "Kundenberatung", href: "/angebote" },
  { id: "qa5", type: "aktion", title: "Termin finden", subtitle: "Planung", href: "/terminfinder" },
  { id: "qa6", type: "aktion", title: "Teamleitercheck starten", subtitle: "Umsetzung", href: "/teamleitercheck" },
];

// Icon mapping
const typeIcons: Record<string, React.ElementType> = {
  Projekt: FolderOpen,
  Unternehmen: Building2,
  Kontakt: Users,
  Angebot: FileText,
  Immobilie: Home,
  Baustelle: HardHat,
  aktion: Plus,
};

// Gespeicherte Filter-Kombinationen (localStorage)
const SAVED_FILTERS_KEY = "fafi-saved-filters";

interface SavedFilter {
  id: string;
  name: string;
  query: string;
  createdAt: number;
}

function getSavedFilters(): SavedFilter[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || "[]");
  } catch { return []; }
}

function saveSavedFilter(filter: SavedFilter) {
  const filters = getSavedFilters();
  filters.unshift(filter);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters.slice(0, 10)));
}

function removeSavedFilter(id: string) {
  const filters = getSavedFilters().filter(f => f.id !== id);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, navigate] = useLocation();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(getSavedFilters());

  // Debounce query for DB search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // tRPC-Suche an die DB
  const { data: searchResults, isLoading } = trpc.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleSaveFilter = () => {
    if (!query.trim()) return;
    const filter: SavedFilter = {
      id: Date.now().toString(),
      name: query.trim(),
      query: query.trim(),
      createdAt: Date.now(),
    };
    saveSavedFilter(filter);
    setSavedFilters(getSavedFilters());
  };

  const handleRemoveSavedFilter = (id: string) => {
    removeSavedFilter(id);
    setSavedFilters(getSavedFilters());
  };

  // Map DB results to SearchResult format
  const filteredResults: SearchResult[] = useMemo(() => {
    if (!searchResults || !debouncedQuery) return [];
    return searchResults.map((r) => ({
      id: `${r.type}-${r.id}`,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle || undefined,
      href: r.href,
    }));
  }, [searchResults, debouncedQuery]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [filteredResults]);

  // All navigable items (for keyboard navigation)
  const allItems = useMemo(() => {
    if (debouncedQuery.length >= 2) {
      return filteredResults;
    }
    return quickActions;
  }, [debouncedQuery, filteredResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allItems[selectedIndex]) {
            navigate(allItems[selectedIndex].href);
            onClose();
            setQuery("");
          }
          break;
        case "Escape":
          onClose();
          setQuery("");
          break;
      }
    },
    [allItems, selectedIndex, navigate, onClose]
  );

  // Handle item click
  const handleItemClick = (item: SearchResult) => {
    navigate(item.href);
    onClose();
    setQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Globale Suche</DialogTitle>
        </VisuallyHidden>
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input
            placeholder="Suchen nach Projekten, Unternehmen, Kontakten, Angeboten..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 h-14 text-base"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
          )}
          {query.trim() && !isLoading && (
            <button
              onClick={handleSaveFilter}
              className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors whitespace-nowrap"
              title="Filter speichern"
            >
              ★ Speichern
            </button>
          )}
          <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        <ScrollArea className="max-h-[400px]">
          {/* No query - show quick actions and saved filters */}
          {(!query.trim() || debouncedQuery.length < 2) && (
            <div className="p-2">
              {/* Gespeicherte Filter */}
              {savedFilters.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <FolderOpen className="w-3 h-3" />
                    Gespeicherte Filter
                  </p>
                  <div className="flex flex-wrap gap-2 px-3">
                    {savedFilters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 group"
                        onClick={() => setQuery(filter.query)}
                      >
                        {filter.name}
                        <span
                          className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleRemoveSavedFilter(filter.id); }}
                        >
                          ×
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Plus className="w-3 h-3" />
                  Schnellaktionen
                </p>
                {quickActions.map((action, index) => {
                  const Icon = typeIcons[action.type] || Plus;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      )}
                      onClick={() => handleItemClick(action)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CornerDownLeft className="w-3 h-3" />
                          Enter
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {debouncedQuery.length >= 2 && isLoading && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Suche in der Datenbank...</p>
            </div>
          )}

          {/* Search Results */}
          {debouncedQuery.length >= 2 && !isLoading && filteredResults.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1 text-xs text-muted-foreground">
                {filteredResults.length} Ergebnis{filteredResults.length !== 1 ? "se" : ""} gefunden
              </p>
              {Object.entries(groupedResults).map(([type, results]) => (
                <div key={type} className="mb-4 last:mb-0">
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    {type} ({results.length})
                  </p>
                  {results.map((result) => {
                    const Icon = typeIcons[result.type] || Search;
                    const globalIndex = allItems.findIndex((i) => i.id === result.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <div
                        key={result.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted"
                        )}
                        onClick={() => handleItemClick(result)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        {result.badge && (
                          <Badge variant={result.badgeVariant || "secondary"} className="text-xs">
                            {result.badge}
                          </Badge>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {debouncedQuery.length >= 2 && !isLoading && filteredResults.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-medium text-muted-foreground">
                Keine Ergebnisse für &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Versuchen Sie einen anderen Suchbegriff (mind. 2 Zeichen)
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer with keyboard hints */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↓</kbd>
              Navigation
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↵</kbd>
              Öffnen
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background">ESC</kbd>
              Schließen
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Powered by FaFi PM</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for global keyboard shortcut
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
