/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * - Listenansicht mit organischen Karten
 * - Fließende Filter-Animationen
 * - Vollständige DB-Anbindung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import ProjektWizard from "@/components/ProjektWizard";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Phase configuration (same as ProjektDetail)
const PHASE_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  objektaufnahme: { label: "Objektaufnahme", color: "#77bc1f", order: 1 },
  angebot_erstellt: { label: "Angebot erstellt", color: "#77bc1f", order: 2 },
  angebot_versendet: { label: "Angebot versendet", color: "#77bc1f", order: 3 },
  nachfassen: { label: "Nachfassen", color: "#f59e0b", order: 4 },
  auftrag_gewonnen: { label: "Auftrag gewonnen", color: "#77bc1f", order: 5 },
  planung: { label: "Planung", color: "#3b82f6", order: 6 },
  vorbereitung: { label: "Vorbereitung", color: "#3b82f6", order: 7 },
  durchfuehrung: { label: "Durchführung", color: "#3b82f6", order: 8 },
  abnahme: { label: "Abnahme", color: "#8b5cf6", order: 9 },
  abgeschlossen: { label: "Abgeschlossen", color: "#10b981", order: 10 },
  verloren: { label: "Verloren", color: "#ef4444", order: 99 },
};

const PHASE_OPTIONS = Object.entries(PHASE_CONFIG)
  .filter(([, v]) => v.order <= 10)
  .sort((a, b) => a[1].order - b[1].order);

export default function Projekte() {
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isProjektWizardOpen, setIsProjektWizardOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleBulkPhaseChange = (targetPhase: string) => {
    toast.success(`${selectedIds.size} Projekte würden auf "${PHASE_CONFIG[targetPhase]?.label}" geändert`, { description: "Bulk-Aktion (Mockup)" });
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const { data: projectsRaw = [], isLoading, refetch } = trpc.project.list.useQuery();

  const filteredProjects = useMemo(() => {
    return projectsRaw
      .filter((project) => {
        const matchesSearch =
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPhase = phaseFilter === "all" || project.phase === phaseFilter;
        return matchesSearch && matchesPhase;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "flaeche") return parseFloat(b.totalArea || "0") - parseFloat(a.totalArea || "0");
        if (sortBy === "phase") return (PHASE_CONFIG[a.phase]?.order || 0) - (PHASE_CONFIG[b.phase]?.order || 0);
        if (sortBy === "datum") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [projectsRaw, searchQuery, phaseFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    gesamt: projectsRaw.length,
    inBearbeitung: projectsRaw.filter(p => ["planung", "vorbereitung", "durchfuehrung"].includes(p.phase)).length,
    angebote: projectsRaw.filter(p => ["angebot_erstellt", "angebot_versendet", "nachfassen"].includes(p.phase)).length,
    abgeschlossen: projectsRaw.filter(p => p.phase === "abgeschlossen").length,
  }), [projectsRaw]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold">Projektübersicht</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie alle Ihre Fassadenreinigungs-Projekte
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={bulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            >
              {bulkMode ? "Auswahl beenden" : "Mehrfachauswahl"}
            </Button>
            <Button onClick={() => setIsProjektWizardOpen(true)} className="gap-2 ff-button">
              <Plus className="w-4 h-4" />
              Neues Projekt
            </Button>
          </div>
        </div>

        {/* Bulk-Aktionen Toolbar */}
        {bulkMode && selectedIds.size > 0 && (
          <Card className="ff-card border-primary/50 bg-primary/5 animate-fade-in-up">
            <CardContent className="p-3 flex items-center gap-4">
              <span className="text-sm font-medium">{selectedIds.size} ausgewählt</span>
              <Select onValueChange={handleBulkPhaseChange}>
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue placeholder="Phase ändern..." />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_OPTIONS.map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Auswahl aufheben
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="ff-card animate-fade-in-up animate-delay-100">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Projekt oder Projektnummer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Phase filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Phasen</SelectItem>
                  {PHASE_OPTIONS.map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sortieren" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="datum">Datum</SelectItem>
                  <SelectItem value="flaeche">Fläche</SelectItem>
                  <SelectItem value="phase">Phase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 animate-fade-in-up animate-delay-200">
          {[
            { label: "Gesamt", value: stats.gesamt, color: "bg-primary/10 text-primary" },
            { label: "In Bearbeitung", value: stats.inBearbeitung, color: "bg-blue-500/10 text-blue-500" },
            { label: "Angebote", value: stats.angebote, color: "bg-amber-500/10 text-amber-500" },
            { label: "Abgeschlossen", value: stats.abgeschlossen, color: "bg-green-500/10 text-green-500" },
          ].map((stat) => (
            <Card key={stat.label} className="ff-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold", stat.color)}>
                  {stat.value}
                </div>
                <span className="font-medium text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, index) => {
              const phase = PHASE_CONFIG[project.phase];
              const totalArea = parseFloat(project.totalArea || "0");
              const progress = project.progress || 0;
              return (
                <Link key={project.id} href={`/projekte/${project.id}`}>
                  <Card
                    className={cn(
                      "ff-card cursor-pointer animate-fade-in-up",
                      `animate-delay-${Math.min((index + 3) * 100, 1000)}`
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Bulk Checkbox */}
                        {bulkMode && (
                          <div className="flex-shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(project.id); }}>
                            <Checkbox checked={selectedIds.has(project.id)} />
                          </div>
                        )}
                        {/* Project Icon */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>

                        {/* Project Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                {phase && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: `${phase.color}15`,
                                      color: phase.color,
                                    }}
                                  >
                                    {phase.label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">
                              {project.projectNumber}
                            </span>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                            {(project.propertyCount ?? 0) > 0 && (
                              <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {project.propertyCount} Immobilien
                              </span>
                            )}
                            {totalArea > 0 && (
                              <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {totalArea.toLocaleString("de-DE")} m²
                              </span>
                            )}
                            {project.startDate && (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(project.startDate).toLocaleDateString("de-DE")} –{" "}
                                {project.endDate
                                  ? new Date(project.endDate).toLocaleDateString("de-DE")
                                  : "offen"}
                              </span>
                            )}
                          </div>

                          {/* Progress */}
                          {progress > 0 && (
                            <div className="mt-3 max-w-md">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Fortschritt</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {filteredProjects.length === 0 && (
              <Card className="ff-card">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Keine Projekte gefunden</h3>
                  <p className="text-muted-foreground">
                    {projectsRaw.length === 0
                      ? "Erstellen Sie Ihr erstes Projekt mit dem Button oben."
                      : "Passen Sie Ihre Filterkriterien an."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Wizard */}
      <ProjektWizard
        isOpen={isProjektWizardOpen}
        onClose={() => setIsProjektWizardOpen(false)}
        onComplete={() => {
          refetch();
          setIsProjektWizardOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
