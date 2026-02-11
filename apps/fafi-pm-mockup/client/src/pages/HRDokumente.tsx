import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Search, FileText, Download, ArrowLeft, Filter, ExternalLink,
  FolderOpen, User
} from "lucide-react";

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HRDokumente() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const { data: documents, isLoading } = trpc.hr.documents.list.useQuery({});
  const { data: employees } = trpc.hr.employees.list.useQuery({});
  const { data: docStats } = trpc.hr.documents.stats.useQuery();

  // Kategorien extrahieren
  const categories = useMemo(() => {
    if (!documents) return [];
    const cats = new Set(documents.map(d => d.category).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [documents]);

  // Mitarbeiter-Map für schnelle Namensauflösung
  const employeeMap = useMemo(() => {
    if (!employees) return new Map<number, string>();
    return new Map(employees.map(e => [e.id, `${e.firstName} ${e.lastName}`]));
  }, [employees]);

  // Filtern
  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    let result = [...documents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.filename.toLowerCase().includes(q) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (d.employeeId && employeeMap.get(d.employeeId)?.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(d => d.category === categoryFilter);
    }

    if (employeeFilter !== "all") {
      result = result.filter(d => d.employeeId?.toString() === employeeFilter);
    }

    return result;
  }, [documents, searchQuery, categoryFilter, employeeFilter, employeeMap]);

  // Nach Kategorie gruppieren
  const groupedDocs = useMemo(() => {
    const groups: Record<string, typeof filteredDocs> = {};
    for (const doc of filteredDocs) {
      const cat = doc.category || "Sonstige";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(doc);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredDocs]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
          {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
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
            <h1 className="text-2xl font-bold">HR Dokumente</h1>
            <p className="text-muted-foreground">
              {filteredDocs.length} von {documents?.length || 0} Dokumenten
              {docStats && ` · ${docStats.categories?.length || 0} Kategorien`}
            </p>
          </div>
        </div>
      </div>

      {/* Kategorie-Statistik */}
      {docStats?.categories && docStats.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {docStats.categories.map((cat) => (
            <Button
              key={cat.name}
              variant={categoryFilter === cat.name ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(categoryFilter === cat.name ? "all" : cat.name)}
              className="text-xs"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              {cat.name} ({cat.count})
            </Button>
          ))}
        </div>
      )}

      {/* Filter-Leiste */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Dateiname, Kategorie, Mitarbeiter suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[220px]">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Mitarbeiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {employees?.map(e => (
              <SelectItem key={e.id} value={e.id.toString()}>
                {e.firstName} {e.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dokumente nach Kategorie */}
      {groupedDocs.length > 0 ? (
        groupedDocs.map(([category, docs]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {category}
                <Badge variant="outline">{docs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-red-50 dark:bg-red-950/30">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                          {doc.employeeId && employeeMap.has(doc.employeeId) && (
                            <>
                              <span>·</span>
                              <Link href={`/hr/mitarbeiter/${doc.employeeId}`}>
                                <span className="hover:underline cursor-pointer flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {employeeMap.get(doc.employeeId)}
                                </span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Öffnen
                          </Button>
                        </a>
                      )}
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} download={doc.filename}>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">Keine Dokumente gefunden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Versuche andere Suchbegriffe oder Filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
