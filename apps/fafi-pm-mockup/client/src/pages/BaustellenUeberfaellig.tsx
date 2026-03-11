/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Baustellen Überfällig - Gefilterte Baustellenansicht für überfällige Baustellen
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
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  User,
  HardHat,
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

export default function BaustellenUeberfaellig() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch construction sites from database
  const { data: sites, isLoading } = trpc.constructionSite.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();

  // Filter for overdue construction sites (endDate in the past and not completed)
  const now = new Date();
  const overdueSites = sites?.filter(s => {
    if (s.status === "abgeschlossen") return false;
    if (!s.endDate) return false;
    return new Date(s.endDate) < now;
  }) || [];

  // Filter by search
  const filteredSites = overdueSites.filter((site) => {
    const project = projects?.find(p => p.id === site.projectId);
    const matchesSearch = 
      site.siteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const totalOverdue = overdueSites.length;
  const criticalOverdue = overdueSites.filter(s => {
    if (!s.endDate) return false;
    const daysOverdue = Math.floor((now.getTime() - new Date(s.endDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue > 7;
  }).length;

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

  // Calculate days overdue
  const getDaysOverdue = (endDate: Date | null) => {
    if (!endDate) return 0;
    const days = Math.floor((now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-500" />
              Überfällige Baustellen
            </h1>
            <p className="text-muted-foreground mt-1">
              Baustellen mit überschrittenem Enddatum
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setLocation("/baustellen")}>
            Alle Baustellen anzeigen
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Warning Banner */}
        {totalOverdue > 0 && (
          <Card className="ff-card bg-red-50 border-red-200 animate-fade-in-up animate-delay-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">{totalOverdue} Baustelle{totalOverdue > 1 ? "n" : ""} überfällig</p>
                  <p className="text-sm text-red-700">
                    {criticalOverdue > 0 && `${criticalOverdue} davon kritisch (> 7 Tage). `}
                    Bitte priorisieren.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>}
                  <p className="text-xs text-muted-foreground">Überfällig</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold text-orange-600">{criticalOverdue}</p>}
                  <p className="text-xs text-muted-foreground">Kritisch (&gt;7 Tage)</p>
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
                <HardHat className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine überfälligen Baustellen</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Versuche andere Suchkriterien."
                    : "Alle Baustellen sind im Zeitplan."}
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
                    <TableHead>Enddatum</TableHead>
                    <TableHead>Überfällig</TableHead>
                    <TableHead>Fortschritt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => {
                    const status = statusConfig[site.status || "geplant"];
                    const daysOverdue = getDaysOverdue(site.endDate);
                    const isCritical = daysOverdue > 7;
                    
                    return (
                      <TableRow
                        key={site.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          isCritical && "bg-red-50"
                        )}
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
                        <TableCell>{formatDate(site.endDate)}</TableCell>
                        <TableCell>
                          <Badge className={isCritical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                            {daysOverdue} Tag{daysOverdue !== 1 ? "e" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={site.progress || 0} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{site.progress || 0}%</span>
                          </div>
                        </TableCell>
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
