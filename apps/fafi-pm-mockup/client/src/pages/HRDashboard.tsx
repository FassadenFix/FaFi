import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Users, UserCheck, UserX, Clock, FileText, Briefcase,
  TrendingUp, ArrowRight, Building2, Calendar
} from "lucide-react";

function StatCard({ title, value, icon: Icon, description, color }: {
  title: string; value: string | number; icon: any; description?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.hr.employees.stats.useQuery();
  const { data: employees, isLoading: empsLoading } = trpc.hr.employees.list.useQuery({});
  const { data: docStats, isLoading: docsLoading } = trpc.hr.documents.stats.useQuery();

  const isLoading = statsLoading || empsLoading || docsLoading;

  // Berechne Abteilungsverteilung für Balkendiagramm
  const departmentCounts: Record<string, number> = {};
  const positionCounts: Record<string, number> = {};
  const statusCounts = { active: 0, inactive: 0, onboarding: 0, leave: 0 };
  
  if (employees) {
    for (const emp of employees) {
      const dept = emp.department || "Ohne Abteilung";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      
      const pos = emp.position || "Ohne Position";
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      
      if (emp.status in statusCounts) {
        statusCounts[emp.status as keyof typeof statusCounts]++;
      }
    }
  }

  const sortedDepts = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1]);
  const sortedPositions = Object.entries(positionCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxDeptCount = sortedDepts.length > 0 ? sortedDepts[0][1] : 1;
  const maxPosCount = sortedPositions.length > 0 ? sortedPositions[0][1] : 1;

  // Neueste Mitarbeiter (nach Eintrittsdatum sortiert)
  const newestEmployees = employees
    ? [...employees]
        .filter(e => e.hireDate)
        .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
        .slice(0, 5)
    : [];

  // Dokument-Kategorien
  const docCategories = docStats?.categories?.map(c => ({ category: c.name, count: c.count })) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div><h1 className="text-2xl font-bold">HR Dashboard</h1></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Personalübersicht und Statistiken</p>
        </div>
        <div className="flex gap-2">
          <Link href="/hr/mitarbeiter">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Alle Mitarbeiter
            </Button>
          </Link>
          <Link href="/hr/dokumente">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Dokumente
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mitarbeiter gesamt"
          value={stats?.total || 0}
          icon={Users}
          description={`${statusCounts.active} aktiv, ${statusCounts.inactive} inaktiv`}
          color="bg-blue-500"
        />
        <StatCard
          title="Aktive Mitarbeiter"
          value={statusCounts.active}
          icon={UserCheck}
          description="Derzeit beschäftigt"
          color="bg-green-500"
        />
        <StatCard
          title="Dokumente"
          value={docStats?.total || 0}
          icon={FileText}
          description={`${docCategories.length} Kategorien`}
          color="bg-purple-500"
        />
        <StatCard
          title="Onboarding"
          value={statusCounts.onboarding}
          icon={Clock}
          description="In Einarbeitung"
          color="bg-amber-500"
        />
      </div>

      {/* Balkendiagramme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abteilungsverteilung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Abteilungsverteilung
            </CardTitle>
            <CardDescription>Mitarbeiter pro Abteilung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedDepts.map(([dept, count]) => (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate max-w-[200px]">{dept}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {sortedDepts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Abteilungsdaten vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Positionen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Top Positionen
            </CardTitle>
            <CardDescription>Häufigste Positionen im Unternehmen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedPositions.map(([pos, count]) => (
                <div key={pos} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate max-w-[200px]">{pos}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(count / maxPosCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {sortedPositions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Positionsdaten vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Untere Reihe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neueste Mitarbeiter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Neueste Mitarbeiter
            </CardTitle>
            <CardDescription>Zuletzt eingestellte Mitarbeiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newestEmployees.map((emp) => (
                <Link key={emp.id} href={`/hr/mitarbeiter/${emp.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.position || "–"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={emp.status === "active" ? "default" : "secondary"} className="text-xs">
                        {emp.status === "active" ? "Aktiv" : emp.status === "onboarding" ? "Onboarding" : "Inaktiv"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("de-DE") : "–"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {newestEmployees.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Mitarbeiter vorhanden</p>
              )}
            </div>
            <Link href="/hr/mitarbeiter">
              <Button variant="ghost" size="sm" className="w-full mt-3">
                Alle Mitarbeiter anzeigen <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Dokumenten-Kategorien */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumente nach Kategorie
            </CardTitle>
            <CardDescription>{docStats?.total || 0} Dokumente insgesamt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docCategories.map((cat: { category: string; count: number }) => (
                <div key={cat.category} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-sm">{cat.category}</span>
                  <Badge variant="outline">{cat.count}</Badge>
                </div>
              ))}
              {docCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Dokumente vorhanden</p>
              )}
            </div>
            <Link href="/hr/dokumente">
              <Button variant="ghost" size="sm" className="w-full mt-3">
                Alle Dokumente anzeigen <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <UserCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
              <UserX className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-600">{statusCounts.inactive}</p>
              <p className="text-sm text-muted-foreground">Inaktiv</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-amber-600">{statusCounts.onboarding}</p>
              <p className="text-sm text-muted-foreground">Onboarding</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{statusCounts.leave}</p>
              <p className="text-sm text-muted-foreground">Beurlaubt</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
