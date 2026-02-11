/**
 * Baustellen-Detailansicht mit Bearbeitungsmodus
 * Zeigt alle Daten einer Baustelle inkl. zugrunde liegendem Auftrag,
 * Immobilien, Seiten, Aufgaben mit AG/AN-Verantwortlichkeit
 */

import DashboardLayout from "@/components/DashboardLayout";
import GateInteraction from "@/components/GateInteraction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  HardHat, ArrowLeft, Edit, Save, X, Loader2, Building2,
  FolderKanban, FileText, Calendar, MapPin, Users, CheckCircle2,
  AlertTriangle, ClipboardList, Shield, Wrench, ListChecks,
  Camera, ClipboardCheck, ShieldCheck,
} from "lucide-react";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation, Link } from "wouter";
import { PROJECT_PHASES } from "@shared/const";

interface OrderPosition {
  propertyId: number;
  propertyName: string;
  sides: { side: string; area: number; facadeType?: string }[];
  totalArea: number;
}

interface SpecialCondition {
  type: string;
  description: string;
  responsibility: 'ag' | 'an';
  propertyId?: number;
  side?: string;
}

export default function BaustellenDetail() {
  const [, params] = useRoute("/baustellen/:id");
  const [, navigate] = useLocation();
  const siteId = params?.id ? parseInt(params.id) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: site, isLoading, refetch } = trpc.constructionSite.getById.useQuery(
    { id: siteId! },
    { enabled: !!siteId }
  );
  const { data: projects = [] } = trpc.project.list.useQuery();
  const { data: properties = [] } = trpc.property.list.useQuery();
  const { data: tasks = [] } = trpc.task.list.useQuery();

  const updateMutation = trpc.constructionSite.update.useMutation({
    onSuccess: () => {
      toast.success("Baustelle aktualisiert");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  // Related data
  const project = useMemo(() => projects.find(p => p.id === site?.projectId), [projects, site]);
  const siteProperties = useMemo(() => {
    if (!site) return [];
    return properties.filter(p => p.constructionSiteId === site.id || p.projectId === site.projectId);
  }, [properties, site]);
  const siteTasks = useMemo(() => {
    if (!site) return [];
    return tasks.filter(t => t.constructionSiteId === site.id);
  }, [tasks, site]);

  // Parse order positions and special conditions from site data
  const orderPositions: OrderPosition[] = useMemo(() => {
    if (!site) return [];
    try {
      const order = (site as any).order;
      if (order?.positions) return JSON.parse(typeof order.positions === 'string' ? order.positions : JSON.stringify(order.positions));
    } catch {}
    return [];
  }, [site]);

  const specialConditions: SpecialCondition[] = useMemo(() => {
    if (!site) return [];
    try {
      const order = (site as any).order;
      if (order?.specialConditions) return JSON.parse(typeof order.specialConditions === 'string' ? order.specialConditions : JSON.stringify(order.specialConditions));
    } catch {}
    return [];
  }, [site]);

  useEffect(() => {
    if (site && !editData) {
      setEditData({
        name: site.name || '',
        address: site.address || '',
        status: site.status || 'geplant',
        startDate: site.startDate || '',
        endDate: site.endDate || '',
        notes: site.notes || '',
      });
    }
  }, [site]);

  const handleSave = () => {
    if (!siteId || !editData) return;
    updateMutation.mutate({
      id: siteId,
      name: editData.name,
      address: editData.address,
      status: editData.status,
      startDate: editData.startDate || null,
      endDate: editData.endDate || null,
      notes: editData.notes,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (site) {
      setEditData({
        name: site.name || '',
        address: site.address || '',
        status: site.status || 'geplant',
        startDate: site.startDate || '',
        endDate: site.endDate || '',
        notes: site.notes || '',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!site) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <HardHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">Baustelle nicht gefunden</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/baustellen")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    geplant: 'bg-blue-100 text-blue-800',
    aktiv: 'bg-green-100 text-green-800',
    pausiert: 'bg-amber-100 text-amber-800',
    abgeschlossen: 'bg-gray-100 text-gray-800',
  };

  const phase = project ? PROJECT_PHASES.find(ph => ph.id === Number(project.phase)) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/baustellen")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <HardHat className="w-7 h-7 text-primary" />
                {isEditing ? (
                  <Input
                    value={editData?.name || ''}
                    onChange={(e) => setEditData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold h-auto py-0 border-primary"
                  />
                ) : (
                  site.name
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[site.status] || 'bg-gray-100 text-gray-800'}>
                  {site.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{site.siteNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="ff-button">
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Speichern
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Projekt</p>
              {project ? (
                <Link href={`/projekte/${project.id}`}>
                  <p className="text-sm font-medium text-primary hover:underline cursor-pointer">{project.name}</p>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Kein Projekt</p>
              )}
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Immobilien</p>
              <p className="text-2xl font-bold">{siteProperties.length}</p>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aufgaben</p>
              <p className="text-2xl font-bold">{siteTasks.length}</p>
              <p className="text-xs text-muted-foreground">
                {siteTasks.filter(t => t.status === 'erledigt').length} erledigt
              </p>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Startdatum</p>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData?.startDate || ''}
                  onChange={(e) => setEditData((prev: any) => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium">
                  {site.startDate ? new Date(site.startDate).toLocaleDateString('de-DE') : 'Nicht festgelegt'}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Enddatum</p>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData?.endDate || ''}
                  onChange={(e) => setEditData((prev: any) => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium">
                  {site.endDate ? new Date(site.endDate).toLocaleDateString('de-DE') : 'Nicht festgelegt'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Qualitäts-Gates – Interaktiv */}
        <Card className="ff-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Qualitäts-Gates
              <HelpTooltip
                content="Qualitäts-Gates sind Pflicht-Schritte, die vor dem nächsten Arbeitsschritt erledigt sein müssen. Sie sichern die Qualität und schützen bei Reklamationen."
                helpTextKey="qualitaetsGates"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GateInteraction
              constructionSiteId={site.id}
              projectId={site.projectId}
              siteStatus={site.status}
              siteName={site.name || 'Baustelle'}
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="uebersicht" className="space-y-4">
          <TabsList>
            <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="immobilien">Immobilien & Seiten</TabsTrigger>
            <TabsTrigger value="aufgaben">Aufgaben</TabsTrigger>
            <TabsTrigger value="auftrag">Auftragsdaten</TabsTrigger>
          </TabsList>

          {/* Übersicht Tab */}
          <TabsContent value="uebersicht" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adresse */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input
                      value={editData?.address || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse der Baustelle"
                    />
                  ) : (
                    <p className="text-sm">{site.address || 'Keine Adresse hinterlegt'}</p>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Select
                      value={editData?.status || 'geplant'}
                      onValueChange={(v) => setEditData((prev: any) => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geplant">Geplant</SelectItem>
                        <SelectItem value="aktiv">Aktiv</SelectItem>
                        <SelectItem value="pausiert">Pausiert</SelectItem>
                        <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${statusColors[site.status]} text-sm`}>{site.status}</Badge>
                  )}
                </CardContent>
              </Card>

              {/* Notizen */}
              <Card className="ff-card col-span-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notizen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData?.notes || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notizen zur Baustelle..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{site.notes || 'Keine Notizen'}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Immobilien & Seiten Tab */}
          <TabsContent value="immobilien" className="space-y-4">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Zugeordnete Immobilien ({siteProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {siteProperties.length > 0 ? (
                  <div className="space-y-4">
                    {siteProperties.map(prop => {
                      // Find order positions for this property
                      const propPositions = orderPositions.filter(op => op.propertyId === prop.id);
                      const sides = [
                        { key: 'frontSide', label: 'Frontseite', data: prop.frontSide as any },
                        { key: 'backSide', label: 'Rückseite', data: prop.backSide as any },
                        { key: 'leftGable', label: 'Giebel links', data: prop.leftGable as any },
                        { key: 'rightGable', label: 'Giebel rechts', data: prop.rightGable as any },
                      ].filter(s => s.data?.area);

                      return (
                        <div key={prop.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Link href={`/immobilien/${prop.id}`}>
                              <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">{prop.name}</span>
                              </div>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              {prop.street}, {prop.postalCode} {prop.city}
                            </span>
                          </div>

                          {/* Seiten die im Auftrag enthalten sind */}
                          {propPositions.length > 0 ? (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Im Auftrag enthaltene Seiten:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {propPositions.flatMap(pp => pp.sides).map((s, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/10">
                                    <CheckCircle2 className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium">{s.side}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">{s.area} m²</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Erfasste Gebäudeseiten:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {sides.map(s => (
                                  <div key={s.key} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                    <span className="text-xs font-medium">{s.label}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">{s.data.area} m²</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Keine Immobilien zugeordnet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Immobilien werden über den Auftrag automatisch zugeordnet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aufgaben Tab */}
          <TabsContent value="aufgaben" className="space-y-4">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  Vorbereitungsaufgaben aus Auftrag
                  <Badge variant="outline" className="ml-2">
                    {specialConditions.length} Besonderheiten
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {specialConditions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aufgabe</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Verantwortlich</TableHead>
                        <TableHead>Immobilie/Seite</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specialConditions.map((sc, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{sc.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{sc.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={sc.responsibility === 'ag'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                              }
                            >
                              {sc.responsibility === 'ag' ? 'Auftraggeber' : 'FassadenFix (AN)'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {sc.side || '–'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-4">
                    Keine Besonderheiten aus dem Auftrag. Aufgaben werden automatisch generiert, wenn ein Angebot mit Besonderheiten bestätigt wird.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reguläre Aufgaben */}
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Alle Aufgaben ({siteTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {siteTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aufgabe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priorität</TableHead>
                        <TableHead>Fällig</TableHead>
                        <TableHead>Verantwortlich</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {siteTasks.map(task => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant={task.status === 'erledigt' ? 'default' : task.status === 'in_bearbeitung' ? 'secondary' : 'outline'}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={task.priority === 'hoch' ? 'destructive' : task.priority === 'normal' ? 'default' : 'secondary'}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : '–'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(task as any).responsibility === 'ag' ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">AG</Badge>
                            ) : (task as any).responsibility === 'an' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">AN</Badge>
                            ) : (
                              <span className="text-muted-foreground">–</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auftragsdaten Tab */}
          <TabsContent value="auftrag" className="space-y-4">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Zugrunde liegender Auftrag
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(site as any)?.orderId ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Auftragsnummer</p>
                        <Link href={`/auftraege/${(site as any).orderId}`}>
                          <p className="font-medium text-primary hover:underline cursor-pointer">
                            Auftrag #{(site as any).orderId}
                          </p>
                        </Link>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Angebotsnummer</p>
                        <p className="font-medium">
                          {(site as any)?.offerId ? `Angebot #${(site as any).offerId}` : '–'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Projekt</p>
                        {project ? (
                          <Link href={`/projekte/${project.id}`}>
                            <p className="font-medium text-primary hover:underline cursor-pointer">{project.name}</p>
                          </Link>
                        ) : (
                          <p className="text-muted-foreground">–</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phase</p>
                        {phase && (
                          <Badge variant="outline" style={{ borderColor: phase.color, color: phase.color }}>
                            {phase.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Positionen aus dem Auftrag */}
                    {orderPositions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Auftragspositionen</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Immobilie</TableHead>
                              <TableHead>Seiten</TableHead>
                              <TableHead>Gesamtfläche</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderPositions.map((pos, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{pos.propertyName}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {pos.sides.map((s, j) => (
                                      <Badge key={j} variant="secondary" className="text-xs">
                                        {s.side} ({s.area} m²)
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>{pos.totalArea.toLocaleString('de-DE')} m²</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Kein Auftrag zugeordnet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Baustellen werden normalerweise aus einem bestätigten Angebot erstellt. Dabei werden Auftrag, Projekt und Immobilien automatisch verknüpft.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
