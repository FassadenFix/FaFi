/**
 * Immobilien-Detailansicht mit Bearbeitungsmodus
 * Zeigt alle Daten einer Immobilie und erlaubt deren Bearbeitung
 */

import DashboardLayout from "@/components/DashboardLayout";
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
  Building2, MapPin, Ruler, Edit, Save, X, ArrowLeft,
  Camera, FolderKanban, HardHat, History, FileText, CheckCircle2,
  AlertTriangle, Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { PROJECT_PHASES } from "@shared/const";

const FASSADENTYPEN = [
  "WDVS (Wärmedämmverbundsystem)",
  "Putzfassade",
  "Klinker",
  "Sichtbeton",
  "Holzfassade",
  "Metallfassade",
  "Glasfassade",
  "Naturstein",
];

interface SideData {
  area?: number;
  facadeType?: string;
  damageTypes?: string[];
  damageLevel?: string;
  besonderheiten?: string;
  wasseranschluss?: string;
  wasseranschlussOrt?: string;
  wasseranschlussZoll?: string;
  reinigungsmittel?: string;
  zugaenglichkeit?: string;
  balkonbruesting?: string;
  sonderausstattung?: string;
}

// Hilfskomponente: Angebote für eine Immobilie
function PropertyOffers({ propertyId }: { propertyId: number }) {
  const { data: propertyOffers = [], isLoading } = trpc.offer.byPropertyId.useQuery(
    { propertyId },
    { enabled: !!propertyId }
  );
  if (isLoading) return <p className="text-sm text-muted-foreground">Lade Angebote...</p>;
  if (propertyOffers.length === 0) return <p className="text-sm text-muted-foreground italic">Kein Angebot für diese Immobilie</p>;
  return (
    <div className="space-y-2">
      {(propertyOffers as any[]).map((offer: any) => (
        <Link key={offer.id} href={`/angebote`}>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
            <div>
              <p className="font-medium text-sm">{offer.displayName || offer.offerNumber}</p>
              <p className="text-xs text-muted-foreground">
                {offer.project?.name || 'Kein Projekt'} • {offer.company?.name || 'Kein Kunde'}
              </p>
            </div>
            <Badge variant={offer.status === 'angenommen' ? 'default' : 'secondary'} className="text-[10px]">
              {offer.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ImmobilienDetail() {
  const [, params] = useRoute("/immobilien/:id");
  const [, navigate] = useLocation();
  const propertyId = params?.id ? parseInt(params.id) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data: property, isLoading, refetch } = trpc.property.getById.useQuery(
    { id: propertyId! },
    { enabled: !!propertyId }
  );
  const { data: projects = [] } = trpc.project.list.useQuery();
  const { data: constructionSites = [] } = trpc.constructionSite.list.useQuery();
  const { data: companies = [] } = trpc.company.list.useQuery();

  const updateMutation = trpc.property.update.useMutation({
    onSuccess: () => {
      toast.success("Immobilie aktualisiert");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  // Find related data
  const project = useMemo(() => projects.find(p => p.id === property?.projectId), [projects, property]);
  const site = useMemo(() => constructionSites.find(cs => cs.id === property?.constructionSiteId), [constructionSites, property]);
  const company = useMemo(() => companies.find(c => c.id === (property as any)?.companyId), [companies, property]);

  // Find all projects this property is linked to (via projectProperties M:N)
  const linkedProjects = useMemo(() => {
    if (!property) return [];
    // Direct project link
    const directProject = projects.find(p => p.id === property.projectId);
    const result = directProject ? [directProject] : [];
    return result;
  }, [property, projects]);

  useEffect(() => {
    if (property && !editData) {
      setEditData({
        name: property.name || '',
        street: property.street || '',
        postalCode: property.postalCode || '',
        city: property.city || '',
        totalCleanableArea: property.totalCleanableArea || '',
        specialFeatures: property.specialFeatures || [],
        accessNotes: property.accessNotes || '',
        companyId: (property as any).companyId || null,
        frontSide: property.frontSide || {},
        backSide: property.backSide || {},
        leftGable: property.leftGable || {},
        rightGable: property.rightGable || {},
      });
    }
  }, [property]);

  const handleSave = () => {
    if (!propertyId || !editData) return;
    updateMutation.mutate({
      id: propertyId,
      name: editData.name,
      street: editData.street,
      postalCode: editData.postalCode,
      city: editData.city,
      totalCleanableArea: editData.totalCleanableArea,
      specialFeatures: editData.specialFeatures,
      accessNotes: editData.accessNotes,
      companyId: editData.companyId,
      frontSide: editData.frontSide,
      backSide: editData.backSide,
      leftGable: editData.leftGable,
      rightGable: editData.rightGable,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (property) {
      setEditData({
        name: property.name || '',
        street: property.street || '',
        postalCode: property.postalCode || '',
        city: property.city || '',
        totalCleanableArea: property.totalCleanableArea || '',
        specialFeatures: property.specialFeatures || [],
        accessNotes: property.accessNotes || '',
        companyId: (property as any).companyId || null,
        frontSide: property.frontSide || {},
        backSide: property.backSide || {},
        leftGable: property.leftGable || {},
        rightGable: property.rightGable || {},
      });
    }
  };

  const updateSide = (side: string, field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [side]: { ...prev[side], [field]: value },
    }));
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

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">Immobilie nicht gefunden</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/immobilien")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const sides: { key: string; label: string; data: SideData | null }[] = [
    { key: "frontSide", label: "Frontseite", data: property.frontSide as SideData },
    { key: "backSide", label: "Rückseite", data: property.backSide as SideData },
    { key: "leftGable", label: "Giebel links", data: property.leftGable as SideData },
    { key: "rightGable", label: "Giebel rechts", data: property.rightGable as SideData },
  ];

  const totalArea = sides.reduce((sum, s) => sum + (s.data?.area || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/immobilien")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-7 h-7 text-primary" />
                {isEditing ? (
                  <Input
                    value={editData?.name || ''}
                    onChange={(e) => setEditData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold h-auto py-0 border-primary"
                  />
                ) : (
                  property.name
                )}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <span className="flex gap-2">
                    <Input
                      value={editData?.street || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, street: e.target.value }))}
                      placeholder="Straße"
                      className="w-48"
                    />
                    <Input
                      value={editData?.postalCode || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="PLZ"
                      className="w-20"
                    />
                    <Input
                      value={editData?.city || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, city: e.target.value }))}
                      placeholder="Ort"
                      className="w-36"
                    />
                  </span>
                ) : (
                  `${property.street || ''}, ${property.postalCode || ''} ${property.city || ''}`
                )}
              </p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Gesamtfläche</p>
              <p className="text-2xl font-bold">{totalArea.toLocaleString("de-DE")} m²</p>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Reinigungsfähig</p>
              <p className="text-2xl font-bold text-primary">
                {isEditing ? (
                  <Input
                    value={editData?.totalCleanableArea || ''}
                    onChange={(e) => setEditData((prev: any) => ({ ...prev, totalCleanableArea: e.target.value }))}
                    className="w-24 inline"
                    placeholder="m²"
                  />
                ) : (
                  `${parseFloat(property.totalCleanableArea || "0").toLocaleString("de-DE")} m²`
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Eigentümer</p>
              {isEditing ? (
                <Select
                  value={editData?.companyId?.toString() || "none"}
                  onValueChange={(v) => setEditData((prev: any) => ({ ...prev, companyId: v === "none" ? null : parseInt(v) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Eigentümer wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Eigentümer</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-medium">{company?.name || "Nicht zugeordnet"}</p>
              )}
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Fotos</p>
              <p className="text-2xl font-bold">{property.photos?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="seiten" className="space-y-4">
          <TabsList>
            <TabsTrigger value="seiten">Gebäudeseiten</TabsTrigger>
            <TabsTrigger value="zuordnungen">Zuordnungen</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
            <TabsTrigger value="historie">Projekt-Historie</TabsTrigger>
          </TabsList>

          {/* Gebäudeseiten Tab */}
          <TabsContent value="seiten" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sides.map(({ key, label, data }) => (
                <Card key={key} className="ff-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${data?.area ? 'bg-primary' : 'bg-muted'}`} />
                      {label}
                      {data?.area ? (
                        <Badge variant="outline" className="ml-auto">{data.area.toLocaleString("de-DE")} m²</Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-auto">Nicht erfasst</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Fläche (m²)</Label>
                            <Input
                              type="number"
                              value={editData?.[key]?.area || ''}
                              onChange={(e) => updateSide(key, 'area', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fassadenart</Label>
                            <Select
                              value={editData?.[key]?.facadeType || ""}
                              onValueChange={(v) => updateSide(key, 'facadeType', v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                              <SelectContent>
                                {FASSADENTYPEN.map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Besonderheiten</Label>
                          <Textarea
                            value={editData?.[key]?.besonderheiten || ''}
                            onChange={(e) => updateSide(key, 'besonderheiten', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Wasseranschluss</Label>
                            <Select
                              value={editData?.[key]?.wasseranschluss || "unbekannt"}
                              onValueChange={(v) => updateSide(key, 'wasseranschluss', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ja">Ja</SelectItem>
                                <SelectItem value="nein">Nein</SelectItem>
                                <SelectItem value="unbekannt">Unbekannt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Reinigungsmittel</Label>
                            <Select
                              value={editData?.[key]?.reinigungsmittel || ""}
                              onValueChange={(v) => updateSide(key, 'reinigungsmittel', v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Algenentferner Standard">Algenentferner Standard</SelectItem>
                                <SelectItem value="Algenentferner Premium">Algenentferner Premium</SelectItem>
                                <SelectItem value="Klinkerreiniger">Klinkerreiniger</SelectItem>
                                <SelectItem value="Betonreiniger">Betonreiniger</SelectItem>
                                <SelectItem value="Spezialreiniger">Spezialreiniger</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    ) : data ? (
                      <div className="space-y-2 text-sm">
                        {data.facadeType && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fassadenart</span>
                            <span className="font-medium">{data.facadeType}</span>
                          </div>
                        )}
                        {data.damageTypes && data.damageTypes.length > 0 && (
                          <div>
                            <span className="text-muted-foreground text-xs">Schadensarten</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {data.damageTypes.map((d, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.damageLevel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Schadensgrad</span>
                            <Badge variant={data.damageLevel === 'schwer' ? 'destructive' : data.damageLevel === 'mittel' ? 'default' : 'secondary'}>
                              {data.damageLevel}
                            </Badge>
                          </div>
                        )}
                        {data.wasseranschluss && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wasseranschluss</span>
                            <span>{data.wasseranschluss === 'ja' ? '✓ Ja' : data.wasseranschluss === 'nein' ? '✗ Nein' : 'Unbekannt'}
                              {data.wasseranschlussOrt && ` (${data.wasseranschlussOrt})`}
                            </span>
                          </div>
                        )}
                        {data.reinigungsmittel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reinigungsmittel</span>
                            <span className="font-medium">{data.reinigungsmittel}</span>
                          </div>
                        )}
                        {data.besonderheiten && (
                          <div>
                            <span className="text-muted-foreground text-xs">Besonderheiten</span>
                            <p className="text-sm mt-1">{data.besonderheiten}</p>
                          </div>
                        )}
                        {data.zugaenglichkeit && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Zugänglichkeit</span>
                            <span>{data.zugaenglichkeit}</span>
                          </div>
                        )}
                        {data.balkonbruesting && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Balkonbrüstung</span>
                            <span>{data.balkonbruesting}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Keine Daten erfasst</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Besonderheiten & Zugang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Besonderheiten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={(editData?.specialFeatures || []).join(', ')}
                      onChange={(e) => setEditData((prev: any) => ({
                        ...prev,
                        specialFeatures: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                      }))}
                      placeholder="Kommagetrennte Besonderheiten..."
                      rows={3}
                    />
                  ) : property.specialFeatures && property.specialFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {property.specialFeatures.map((f: string, i: number) => (
                        <Badge key={i} variant="secondary">{f}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Keine Besonderheiten</p>
                  )}
                </CardContent>
              </Card>
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Zugangsinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData?.accessNotes || ''}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, accessNotes: e.target.value }))}
                      placeholder="Zugangshinweise, Schlüssel, Kontakt..."
                      rows={3}
                    />
                  ) : property.accessNotes ? (
                    <p className="text-sm whitespace-pre-wrap">{property.accessNotes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Keine Zugangsinformationen</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zuordnungen Tab */}
          <TabsContent value="zuordnungen" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projekte */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-primary" />
                    Zugeordnete Projekte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedProjects.length > 0 ? (
                    <div className="space-y-2">
                      {linkedProjects.map(p => {
                        const phase = PROJECT_PHASES.find(ph => ph.id === Number(p.phase));
                        return (
                          <Link key={p.id} href={`/projekte/${p.id}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                              <div>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.projectNumber}</p>
                              </div>
                              <Badge
                                variant="outline"
                                style={{ borderColor: phase?.color, color: phase?.color }}
                              >
                                {phase?.label || p.phase}
                              </Badge>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Keinem Projekt zugeordnet</p>
                  )}
                </CardContent>
              </Card>

              {/* Baustellen */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-primary" />
                    Zugeordnete Baustellen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {site ? (
                    <Link href={`/baustellen/${site.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                        <div>
                          <p className="font-medium">{site.name}</p>
                          <p className="text-xs text-muted-foreground">{site.siteNumber}</p>
                        </div>
                        <Badge variant={site.status === 'aktiv' ? 'default' : 'secondary'}>
                          {site.status}
                        </Badge>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Keiner Baustelle zugeordnet</p>
                  )}
                </CardContent>
              </Card>

              {/* Angebote */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Zugeordnete Angebote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertyOffers propertyId={property.id} />
                </CardContent>
              </Card>

              {/* Eigentümer */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Eigentümer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {company ? (
                    <Link href={`/kontakte`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.category || 'Unternehmen'}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Kein Eigentümer zugeordnet</p>
                  )}
                </CardContent>
              </Card>

              {/* Garantien */}
              <Card className="ff-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Garantien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    Garantien werden nach Abnahme automatisch erstellt und an diese Immobilie gebunden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fotos Tab */}
          <TabsContent value="fotos" className="space-y-4">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" />
                  Fotodokumentation ({property.photos?.length || 0} Fotos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property.photos && property.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {property.photos.map((photo: any, i: number) => (
                      <div key={i} className="group relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Foto ${i + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs truncate">{photo.caption || photo.category || `Foto ${i + 1}`}</p>
                            {photo.side && (
                              <Badge variant="secondary" className="text-xs mt-1">{photo.side}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Noch keine Fotos hochgeladen</p>
                    <p className="text-xs text-muted-foreground mt-1">Fotos werden über die Objektaufnahme erfasst</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historie Tab */}
          <TabsContent value="historie" className="space-y-4">
            <Card className="ff-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Projekt-Historie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedProjects.length > 0 ? (
                  <div className="space-y-4">
                    {linkedProjects.map(p => {
                      const phase = PROJECT_PHASES.find(ph => ph.id === Number(p.phase));
                      return (
                        <div key={p.id} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: phase?.color || '#ccc' }} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Link href={`/projekte/${p.id}`}>
                                <span className="font-medium hover:text-primary cursor-pointer">{p.name}</span>
                              </Link>
                              <Badge variant="outline" style={{ borderColor: phase?.color, color: phase?.color }}>
                                {phase?.label || p.phase}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {p.projectNumber} · Erstellt: {new Date(p.createdAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Keine Projekt-Historie vorhanden</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sobald diese Immobilie einem Projekt zugeordnet wird, erscheint hier die Historie.
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
