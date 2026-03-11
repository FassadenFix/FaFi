/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Baustellen Offen - Gefilterte Baustellenansicht
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
  HardHat,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700" },
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700" },
  pausiert: { label: "Pausiert", color: "bg-orange-100 text-orange-700" },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700" },
};

export default function BaustellenOffen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch construction sites from database
  const { data: sites, isLoading } = trpc.constructionSite.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();

  // Filter for open construction sites (not abgeschlossen)
  const openSites = sites?.filter(s => s.status !== "abgeschlossen") || [];

  // Filter by search
  const filteredSites = openSites.filter((site) => {
    const project = projects?.find(p => p.id === site.projectId);
    const matchesSearch = 
      site.siteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const totalOpen = openSites.length;
  const activeSites = openSites.filter(s => s.status === "aktiv").length;
  const plannedSites = openSites.filter(s => s.status === "geplant").length;

  // Get project name by ID
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return "—";
    const project = projects?.find(p => p.id === projectId);
    return project?.name || "—";
  };

  // Get user name by ID
  const getUserName = (userId: number | null) => {
    if (!userId) return "—";
    const user = users?.find(u => u.id === userId);
    return user?.name || "—";
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
              <HardHat className="w-7 h-7 text-primary" />
              Offene Baustellen
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle aktiven und geplanten Baustellen
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setLocation("/baustellen")}>
            Alle Baustellen anzeigen
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-primary" />
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
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeSites}</p>}
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{plannedSites}</p>}
                  <p className="text-xs text-muted-foreground">Geplant</p>
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
                placeholder="Baustellen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sites Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="p-12 text-center">
                <HardHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine offenen Baustellen</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Versuche andere Suchkriterien."
                    : "Alle Baustellen sind abgeschlossen."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Baustellennr.</TableHead>
                    <TableHead>Projekt</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projektleiter</TableHead>
                    <TableHead>Fortschritt</TableHead>
                    <TableHead>Startdatum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => {
                    const status = statusConfig[site.status || "geplant"];
                    
                    return (
                      <TableRow
                        key={site.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/baustellen/${site.id}`)}
                      >
                        <TableCell className="font-medium">{site.siteNumber}</TableCell>
                        <TableCell>{getProjectName(site.projectId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{site.address || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {getUserName(site.projektleiterId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={site.progress || 0} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{site.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(site.startDate)}</TableCell>
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
