import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Search, Users, ArrowUpDown, ChevronRight, UserCheck, UserX, Clock,
  Mail, Phone, Building2, Briefcase, ArrowLeft, Filter
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  inactive: { label: "Inaktiv", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  onboarding: { label: "Onboarding", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  leave: { label: "Beurlaubt", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

type SortField = "name" | "position" | "department" | "hireDate" | "status";
type SortDir = "asc" | "desc";

export default function HRMitarbeiter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: employees, isLoading } = trpc.hr.employees.list.useQuery({});

  // Abteilungen extrahieren
  const departments = useMemo(() => {
    if (!employees) return [];
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts).sort() as string[];
  }, [employees]);

  // Filtern und Sortieren
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    
    let result = [...employees];
    
    // Suche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.position && e.position.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
      );
    }
    
    // Status-Filter
    if (statusFilter !== "all") {
      result = result.filter(e => e.status === statusFilter);
    }
    
    // Abteilungs-Filter
    if (departmentFilter !== "all") {
      result = result.filter(e => e.department === departmentFilter);
    }
    
    // Sortierung
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
          break;
        case "position":
          cmp = (a.position || "").localeCompare(b.position || "");
          break;
        case "department":
          cmp = (a.department || "").localeCompare(b.department || "");
          break;
        case "hireDate":
          cmp = new Date(a.hireDate || 0).getTime() - new Date(b.hireDate || 0).getTime();
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    
    return result;
  }, [employees, searchQuery, statusFilter, departmentFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/hr">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Mitarbeiter</h1>
            <p className="text-muted-foreground">{filteredEmployees.length} von {employees?.length || 0} Mitarbeitern</p>
          </div>
        </div>
      </div>

      {/* Filter-Leiste */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name, E-Mail, Position suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="leave">Beurlaubt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sortier-Buttons */}
      <div className="flex gap-2 text-sm">
        <span className="text-muted-foreground py-1">Sortieren:</span>
        {[
          { field: "name" as SortField, label: "Name" },
          { field: "position" as SortField, label: "Position" },
          { field: "department" as SortField, label: "Abteilung" },
          { field: "hireDate" as SortField, label: "Eintrittsdatum" },
          { field: "status" as SortField, label: "Status" },
        ].map(({ field, label }) => (
          <Button
            key={field}
            variant={sortField === field ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort(field)}
            className="text-xs"
          >
            {label}
            {sortField === field && (
              <ArrowUpDown className="h-3 w-3 ml-1" />
            )}
          </Button>
        ))}
      </div>

      {/* Mitarbeiterliste */}
      <div className="space-y-2">
        {filteredEmployees.map(emp => {
          const statusInfo = STATUS_LABELS[emp.status] || STATUS_LABELS.inactive;
          return (
            <Link key={emp.id} href={`/hr/mitarbeiter/${emp.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                          <Badge className={`text-xs ${statusInfo.color}`} variant="outline">
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {emp.position && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {emp.position}
                            </span>
                          )}
                          {emp.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {emp.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end text-sm">
                        {emp.email && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {emp.email}
                          </span>
                        )}
                        {emp.hireDate && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Eintritt: {new Date(emp.hireDate).toLocaleDateString("de-DE")}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filteredEmployees.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">Keine Mitarbeiter gefunden</p>
              <p className="text-sm text-muted-foreground mt-1">
                Versuche andere Suchbegriffe oder Filter
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
