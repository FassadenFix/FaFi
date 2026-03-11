/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Projekte Offen - Gefilterte Projektansicht
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Search,
  Building2,
  Calendar,
  User,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// Phase configuration
const phaseConfig: Record<string, { label: string; color: string }> = {
  objektaufnahme: { label: "Objektaufnahme", color: "bg-blue-100 text-blue-700" },
  angebot_erstellt: { label: "Angebot erstellt", color: "bg-amber-100 text-amber-700" },
  angebot_versendet: { label: "Angebot versendet", color: "bg-amber-100 text-amber-700" },
  nachfassen: { label: "Nachfassen", color: "bg-orange-100 text-orange-700" },
  auftrag_gewonnen: { label: "Auftrag gewonnen", color: "bg-green-100 text-green-700" },
  planung: { label: "Planung", color: "bg-purple-100 text-purple-700" },
  vorbereitung: { label: "Vorbereitung", color: "bg-purple-100 text-purple-700" },
  durchfuehrung: { label: "Durchführung", color: "bg-primary/20 text-primary" },
  abnahme: { label: "Abnahme", color: "bg-teal-100 text-teal-700" },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700" },
  verloren: { label: "Verloren", color: "bg-red-100 text-red-700" },
};

export default function ProjekteOffen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch projects from database
  const { data: projects, isLoading } = trpc.project.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();

  // Filter for open projects (not abgeschlossen or verloren)
  const openProjects = projects?.filter(p => 
    p.phase !== "abgeschlossen" && p.phase !== "verloren"
  ) || [];

  // Filter by search
  const filteredProjects = openProjects.filter((project) => {
    const matchesSearch = 
      project.projectNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const totalOpen = openProjects.length;
  const inPlanning = openProjects.filter(p => 
    ["objektaufnahme", "angebot_erstellt", "angebot_versendet", "nachfassen"].includes(p.phase || "")
  ).length;
  const inExecution = openProjects.filter(p => 
    ["auftrag_gewonnen", "planung", "vorbereitung", "durchfuehrung", "abnahme"].includes(p.phase || "")
  ).length;

  // Get company name by ID
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-primary" />
              Offene Projekte
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle aktiven Projekte in Bearbeitung
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setLocation("/projekte")}>
            Alle Projekte anzeigen
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalOpen}</p>}
                  <p className="text-xs text-muted-foreground">Offen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{inPlanning}</p>}
                  <p className="text-xs text-muted-foreground">In Planung</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{inExecution}</p>}
                  <p className="text-xs text-muted-foreground">In Ausführung</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Projekte durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine offenen Projekte</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Versuche andere Suchkriterien."
                    : "Alle Projekte sind abgeschlossen."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projektnr.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Fortschritt</TableHead>
                    <TableHead>Startdatum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const phase = phaseConfig[project.phase || "objektaufnahme"];
                    
                    return (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/projekte/${project.id}`)}
                      >
                        <TableCell className="font-medium">{project.projectNumber}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {getCompanyName(project.companyId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={phase?.color}>{phase?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress || 0} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{project.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
