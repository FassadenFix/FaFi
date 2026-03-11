import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar,
  FileText, Download, Clock, User, DollarSign, Shield,
  MapPin, Users, ExternalLink
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Aktiv", variant: "default" },
  inactive: { label: "Inaktiv", variant: "destructive" },
  onboarding: { label: "Onboarding", variant: "secondary" },
  leave: { label: "Beurlaubt", variant: "outline" },
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: any }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "–";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(num);
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HRMitarbeiterDetail() {
  const [, params] = useRoute("/hr/mitarbeiter/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: employee, isLoading } = trpc.hr.employees.getById.useQuery({ id }, { enabled: id > 0 });
  const { data: documents, isLoading: docsLoading } = trpc.hr.documents.list.useQuery(
    { employeeId: id },
    { enabled: id > 0 }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link href="/hr/mitarbeiter">
            <Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Zurück</Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">Mitarbeiter nicht gefunden</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = STATUS_LABELS[employee.status] || STATUS_LABELS.inactive;

  // Dokumente nach Kategorie gruppieren
  const docsByCategory: Record<string, typeof documents> = {};
  if (documents) {
    for (const doc of documents) {
      const cat = doc.category || "Sonstige";
      if (!docsByCategory[cat]) docsByCategory[cat] = [];
      docsByCategory[cat]!.push(doc);
    }
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/hr/mitarbeiter">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <p className="text-muted-foreground">{employee.position || "Keine Position"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stammdaten" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stammdaten">
            <User className="h-4 w-4 mr-2" />
            Stammdaten
          </TabsTrigger>
          <TabsTrigger value="verguetung">
            <DollarSign className="h-4 w-4 mr-2" />
            Vergütung
          </TabsTrigger>
          <TabsTrigger value="dokumente">
            <FileText className="h-4 w-4 mr-2" />
            Dokumente ({documents?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Stammdaten */}
        <TabsContent value="stammdaten" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Persönliche Daten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Vorname" value={employee.firstName} icon={User} />
                <InfoRow label="Nachname" value={employee.lastName} icon={User} />
                <InfoRow label="E-Mail" value={employee.email} icon={Mail} />
                <InfoRow label="Geschlecht" value={
                  employee.gender === "male" ? "Männlich" : 
                  employee.gender === "female" ? "Weiblich" : 
                  employee.gender === "diverse" ? "Divers" : employee.gender
                } icon={User} />
                <InfoRow label="Personio-ID" value={employee.personioId?.toString()} icon={Shield} />
              </CardContent>
            </Card>

            {/* Beschäftigungsdaten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Beschäftigung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Position" value={employee.position} icon={Briefcase} />
                <InfoRow label="Abteilung" value={employee.department} icon={Building2} />
                <InfoRow label="Standort" value={employee.office} icon={MapPin} />
                <InfoRow label="Unternehmen" value={employee.subcompany} icon={Building2} />
                <InfoRow label="Vorgesetzter" value={employee.supervisor} icon={Users} />
                <InfoRow label="Beschäftigungsart" value={
                  employee.employmentType === "internal" ? "Intern" : employee.employmentType
                } icon={Briefcase} />
              </CardContent>
            </Card>

            {/* Zeitliche Daten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zeitliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Eintrittsdatum" value={formatDate(employee.hireDate)} icon={Calendar} />
                <InfoRow label="Probezeit-Ende" value={formatDate(employee.probationPeriodEnd)} icon={Clock} />
                {employee.terminationDate && (
                  <>
                    <Separator className="my-2" />
                    <InfoRow label="Kündigungsdatum" value={formatDate(employee.terminationDate)} icon={Calendar} />
                    <InfoRow label="Kündigungsart" value={
                      employee.terminationType === "fired" ? "Gekündigt (AG)" :
                      employee.terminationType === "resigned" ? "Eigenkündigung" :
                      employee.terminationType === "mutual" ? "Aufhebung" :
                      employee.terminationType
                    } icon={Shield} />
                    <InfoRow label="Letzter Arbeitstag" value={formatDate(employee.lastWorkingDay)} icon={Calendar} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Arbeitszeit */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arbeitszeit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Wochenstunden" value={employee.weeklyWorkingHours ? `${employee.weeklyWorkingHours}h` : null} icon={Clock} />
                <InfoRow label="Arbeitszeitmodell" value={employee.workSchedule} icon={Calendar} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Vergütung */}
        <TabsContent value="verguetung" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vergütungsdaten</CardTitle>
              <CardDescription>Gehalts- und Vergütungsinformationen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Festgehalt</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(employee.fixSalary)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {employee.fixSalaryInterval === "monthly" ? "Monatlich" : 
                       employee.fixSalaryInterval === "yearly" ? "Jährlich" : 
                       employee.fixSalaryInterval || "–"}
                    </p>
                  </div>
                  {employee.hourlySalary && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Stundenlohn</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(employee.hourlySalary)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Pro Stunde</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Wochenstunden</p>
                    <p className="text-2xl font-bold mt-1">{employee.weeklyWorkingHours || "–"}h</p>
                    <p className="text-xs text-muted-foreground mt-1">Pro Woche</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Beschäftigungsart</p>
                    <p className="text-lg font-bold mt-1">
                      {employee.employmentType === "internal" ? "Festanstellung" : employee.employmentType || "–"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dokumente */}
        <TabsContent value="dokumente" className="space-y-4">
          {docsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : documents && documents.length > 0 ? (
            Object.entries(docsByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, docs]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {category}
                    <Badge variant="outline" className="ml-2">{docs!.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {docs!.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-red-50 dark:bg-red-950/30">
                            <FileText className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.sizeBytes)} · {doc.mimeType || "PDF"}
                            </p>
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
                <p className="text-lg font-medium">Keine Dokumente vorhanden</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Für diesen Mitarbeiter wurden noch keine Dokumente hinterlegt
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
