/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Vollständige DB-Anbindung mit Verknüpfungen zu Projekten und Baustellen
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2, MapPin, Ruler, Plus, Search, MoreHorizontal, Eye, Edit,
  HardHat, FolderKanban, Camera, Loader2, FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import ObjektaufnahmeWizard from "@/components/ObjektaufnahmeWizard";

export default function Immobilien() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedImmobilie, setSelectedImmobilie] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: propertiesRaw = [], isLoading, refetch } = trpc.property.list.useQuery();
  const { data: projects = [] } = trpc.project.list.useQuery();
  const { data: constructionSites = [] } = trpc.constructionSite.list.useQuery();

  // Enrich with project, construction site and company names
  const properties = useMemo(() => {
    return propertiesRaw.map(p => {
      const project = projects.find(pr => pr.id === p.projectId);
      const site = constructionSites.find(cs => cs.id === p.constructionSiteId);
      return {
        ...p,
        projektName: project?.name || null,
        baustelleName: site?.name || null,
        baustelleId: site?.id || null,
        eigentuemerName: (p as any).companyName || null,
      };
    });
  }, [propertiesRaw, projects, constructionSites]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.street || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.projektName || "").toLowerCase().includes(q) ||
        (p.eigentuemerName || "").toLowerCase().includes(q)
      );
    });
  }, [properties, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalArea = properties.reduce((sum, p) => sum + parseFloat(p.totalCleanableArea || "0"), 0);
    const totalPhotos = properties.reduce((sum, p) => sum + (p.photos?.length || 0), 0);
    return {
      gesamt: properties.length,
      totalArea,
      totalPhotos,
      mitProjekt: properties.filter(p => p.projectId).length,
    };
  }, [properties]);

  const handleViewDetails = (immo: any) => {
    navigate(`/immobilien/${immo.id}`);
  };

  // Calculate total area from sides
  const getSideArea = (side: any) => side?.area || 0;
  const getTotalArea = (immo: any) => {
    return getSideArea(immo.frontSide) + getSideArea(immo.backSide) +
      getSideArea(immo.leftGable) + getSideArea(immo.rightGable);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              Immobilien
            </h1>
            <p className="text-muted-foreground mt-1">
              Übersicht aller erfassten Objekte mit Zuordnungen
            </p>
          </div>
          <Button onClick={() => setIsWizardOpen(true)} className="gap-2 ff-button">
            <Plus className="w-4 h-4" />
            Neue Immobilie
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.gesamt}</p>
                  <p className="text-xs text-muted-foreground">Immobilien</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalArea > 1000 ? `${(stats.totalArea / 1000).toFixed(1)}k` : stats.totalArea.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">m² Reinigungsfähig</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPhotos}</p>
                  <p className="text-xs text-muted-foreground">Fotos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.mitProjekt}</p>
                  <p className="text-xs text-muted-foreground">Mit Projekt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Adresse, Ort oder Projekt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="ff-card animate-fade-in-up animate-delay-300">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Eigentümer</TableHead>
                    <TableHead>Fläche</TableHead>
                    <TableHead>Zuordnungen</TableHead>
                    <TableHead>Fotos</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((immo) => {
                    const totalArea = getTotalArea(immo);
                    const cleanableArea = parseFloat(immo.totalCleanableArea || "0");
                    return (
                      <TableRow
                        key={immo.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(immo)}
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {immo.name}
                                {(immo as any).isDraft && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                    Entwurf
                                  </Badge>
                                )}
                              </p>
                              {immo.street && (
                                <p className="text-sm text-muted-foreground">
                                  {immo.street}, {immo.postalCode} {immo.city}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {immo.eigentuemerName ? (
                            <span className="text-sm font-medium">{immo.eigentuemerName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Kein Eigentümer</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            {totalArea > 0 && <p className="font-medium">{totalArea.toLocaleString("de-DE")} m²</p>}
                            {cleanableArea > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {cleanableArea.toLocaleString("de-DE")} m² reinigungsfähig
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {immo.projektName && (
                              <Link href={`/projekte/${immo.projectId}`} onClick={(e) => e.stopPropagation()}>
                                <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-muted">
                                  <FolderKanban className="w-3 h-3" />
                                  {immo.projektName}
                                </Badge>
                              </Link>
                            )}
                            {immo.baustelleName && (
                              <div>
                                <Badge variant="outline" className="gap-1 text-xs bg-primary/5">
                                  <HardHat className="w-3 h-3" />
                                  {immo.baustelleName}
                                </Badge>
                              </div>
                            )}
                            {!immo.projektName && !immo.baustelleName && (
                              <span className="text-xs text-muted-foreground">Nicht zugeordnet</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Camera className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{immo.photos?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(immo); }}>
                                <Eye className="w-4 h-4 mr-2" />
                                Details anzeigen
                              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/immobilien/${immo.id}`); }}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredProperties.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{properties.length === 0 ? "Noch keine Immobilien erfasst" : "Keine Immobilien gefunden"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            {selectedImmobilie && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedImmobilie.name}</DialogTitle>
                  {selectedImmobilie.street && (
                    <DialogDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedImmobilie.street}, {selectedImmobilie.postalCode} {selectedImmobilie.city}
                    </DialogDescription>
                  )}
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Eigentümer */}
                  {selectedImmobilie.eigentuemerName && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Eigentümer:</span>
                      <span className="text-sm">{selectedImmobilie.eigentuemerName}</span>
                    </div>
                  )}

                  {/* Verknüpfungen */}
                  <div className="flex flex-wrap gap-2">
                    {selectedImmobilie.projektName && (
                      <Link href={`/projekte/${selectedImmobilie.projectId}`}>
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                          <FolderKanban className="w-3 h-3" />
                          Projekt: {selectedImmobilie.projektName}
                        </Badge>
                      </Link>
                    )}
                    {selectedImmobilie.baustelleName && (
                      <Badge variant="outline" className="gap-1 bg-primary/5">
                        <HardHat className="w-3 h-3" />
                        Baustelle: {selectedImmobilie.baustelleName}
                      </Badge>
                    )}
                  </div>

                  {/* Flächen */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Frontseite", data: selectedImmobilie.frontSide },
                      { label: "Rückseite", data: selectedImmobilie.backSide },
                      { label: "Giebel links", data: selectedImmobilie.leftGable },
                      { label: "Giebel rechts", data: selectedImmobilie.rightGable },
                    ].map(({ label, data }) => (
                      <Card key={label} className="ff-card">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          {data ? (
                            <>
                              <p className="font-medium">{data.area?.toLocaleString("de-DE")} m²</p>
                              <p className="text-xs text-muted-foreground">{data.facadeType}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nicht erfasst</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Reinigungsfähige Fläche */}
                  <Card className="ff-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Reinigungsfähige Gesamtfläche</p>
                          <p className="text-2xl font-bold text-primary">
                            {parseFloat(selectedImmobilie.totalCleanableArea || "0").toLocaleString("de-DE")} m²
                          </p>
                        </div>
                        <Ruler className="w-8 h-8 text-primary/30" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Besonderheiten */}
                  {selectedImmobilie.specialFeatures && selectedImmobilie.specialFeatures.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Besonderheiten</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImmobilie.specialFeatures.map((f: string, i: number) => (
                          <Badge key={i} variant="secondary">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fotos */}
                  {selectedImmobilie.photos && selectedImmobilie.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" />
                        Fotos ({selectedImmobilie.photos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImmobilie.photos.slice(0, 6).map((photo: any, i: number) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <img src={photo.url} alt={photo.caption || `Foto ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zugangsinformationen */}
                  {selectedImmobilie.accessNotes && (
                    <div>
                      <h4 className="font-medium mb-2">Zugangsinformationen</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedImmobilie.accessNotes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Wizard */}
        <ObjektaufnahmeWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={() => {
            refetch();
            setIsWizardOpen(false);
            toast.success("Immobilie erfasst");
          }}
        />
      </div>
    </DashboardLayout>
  );
}
