/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Vollständige DB-Anbindung mit Verknüpfungen zu Projekten
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  HardHat, MapPin, Calendar, Users, Wrench, Cloud, Sun, CloudRain,
  Clock, Plus, Building2, Search, MoreHorizontal, Eye, Edit, Trash2,
  User, CheckCircle2, PauseCircle, PlayCircle, Loader2, ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import BaustelleWizard from "@/components/BaustelleWizard";
import VorherDokuWizard from "@/components/VorherDokuWizard";
import FotoGalerieView from "@/components/FotoGalerieView";
import { ArbeitstageStart, Ereignismelder, ArbeitstageEnde } from "@/components/ArbeitstageManager";
import NachherDokuWizard from "@/components/NachherDokuWizard";
import { Camera, AlertTriangle as AlertTriangleIcon, Play as PlayIcon2, Square as SquareIcon } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700", icon: PlayCircle },
  pausiert: { label: "Pausiert", color: "bg-amber-100 text-amber-700", icon: PauseCircle },
  geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700", icon: Clock },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
};

export default function Baustellen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [selectedBaustelle, setSelectedBaustelle] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBaustelleWizardOpen, setIsBaustelleWizardOpen] = useState(false);
  const [isVorherDokuOpen, setIsVorherDokuOpen] = useState(false);
  const [isArbeitsbeginnOpen, setIsArbeitsbeginnOpen] = useState(false);
  const [isEreignismelderOpen, setIsEreignismelderOpen] = useState(false);
  const [isArbeitsendeOpen, setIsArbeitsendeOpen] = useState(false);
  const [isNachherDokuOpen, setIsNachherDokuOpen] = useState(false);

  const { data: baustellenRaw = [], isLoading, refetch } = trpc.constructionSite.list.useQuery();
  const { data: projects = [] } = trpc.project.list.useQuery();

  // Enrich with project names
  const baustellen = useMemo(() => {
    return baustellenRaw.map(b => {
      const project = projects.find(p => p.id === b.projectId);
      return { ...b, projektName: project?.name || `Projekt #${b.projectId}` };
    });
  }, [baustellenRaw, projects]);

  const filteredBaustellen = useMemo(() => {
    return baustellen.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.projektName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.siteNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "alle" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [baustellen, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    gesamt: baustellen.length,
    aktiv: baustellen.filter(b => b.status === "aktiv").length,
    geplant: baustellen.filter(b => b.status === "geplant").length,
    pausiert: baustellen.filter(b => b.status === "pausiert").length,
  }), [baustellen]);

  const [, navigate] = useLocation();

  const handleViewDetails = (baustelle: any) => {
    navigate(`/baustellen/${baustelle.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardHat className="w-7 h-7 text-primary" />
              Baustellen
            </h1>
            <p className="text-muted-foreground mt-1">
              Übersicht aller Baustellen mit Status und Fortschritt
            </p>
          </div>
          <Button onClick={() => setIsBaustelleWizardOpen(true)} className="gap-2 ff-button">
            <Plus className="w-4 h-4" />
            Neue Baustelle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.gesamt}</p>
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all", statusFilter === "aktiv" && "ring-2 ring-green-500")} onClick={() => setStatusFilter(statusFilter === "aktiv" ? "alle" : "aktiv")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aktiv}</p>
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all", statusFilter === "geplant" && "ring-2 ring-blue-500")} onClick={() => setStatusFilter(statusFilter === "geplant" ? "alle" : "geplant")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.geplant}</p>
                  <p className="text-xs text-muted-foreground">Geplant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("ff-card cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all", statusFilter === "pausiert" && "ring-2 ring-amber-500")} onClick={() => setStatusFilter(statusFilter === "pausiert" ? "alle" : "pausiert")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <PauseCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pausiert}</p>
                  <p className="text-xs text-muted-foreground">Pausiert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Baustelle, Projekt oder Adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="geplant">Geplant</SelectItem>
                  <SelectItem value="pausiert">Pausiert</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Baustellen Table */}
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
                    <TableHead>Baustelle</TableHead>
                    <TableHead>Projekt</TableHead>
                    <TableHead>Zeitraum</TableHead>
                    <TableHead>Fortschritt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBaustellen.map((baustelle) => {
                    const status = statusConfig[baustelle.status] || statusConfig.geplant;
                    const StatusIcon = status.icon;
                    const progress = baustelle.progress || 0;
                    const totalArea = parseFloat(baustelle.totalArea || "0");
                    return (
                      <TableRow
                        key={baustelle.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(baustelle)}
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <HardHat className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{baustelle.name}</p>
                              {baustelle.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {baustelle.address}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground font-mono">{baustelle.siteNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/projekte/${baustelle.projectId}`} onClick={(e) => e.stopPropagation()}>
                            <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                              <Building2 className="w-3 h-3" />
                              {baustelle.projektName}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            {baustelle.startDate ? (
                              <>
                                <p className="text-sm font-medium">
                                  {new Date(baustelle.startDate).toLocaleDateString("de-DE")}
                                </p>
                                {baustelle.endDate && (
                                  <p className="text-xs text-muted-foreground">
                                    bis {new Date(baustelle.endDate).toLocaleDateString("de-DE")}
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Nicht geplant</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              {totalArea > 0 && (
                                <span className="text-muted-foreground">{totalArea.toLocaleString("de-DE")} m²</span>
                              )}
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", status.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(baustelle); }}>
                                <Eye className="w-4 h-4 mr-2" />
                                Details anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Feature kommt bald"); }}>
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
              {filteredBaustellen.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <HardHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{baustellen.length === 0 ? "Noch keine Baustellen vorhanden" : "Keine Baustellen gefunden"}</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setStatusFilter("alle"); }}>
                    Filter zurücksetzen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            {selectedBaustelle && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig[selectedBaustelle.status]?.color || ""}>
                      {statusConfig[selectedBaustelle.status]?.label || selectedBaustelle.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{selectedBaustelle.siteNumber}</span>
                  </div>
                  <DialogTitle className="text-xl">{selectedBaustelle.name}</DialogTitle>
                  {selectedBaustelle.address && (
                    <DialogDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedBaustelle.address}
                    </DialogDescription>
                  )}
                </DialogHeader>

                {/* v7.0c: Tagesablauf-Buttons */}
                {selectedBaustelle.status === 'aktiv' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Nr.45: Gate – Arbeitstag erst nach Vorher-Doku */}
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={selectedBaustelle.preDocumentationStatus !== 'completed'}
                      onClick={() => {
                        if (selectedBaustelle.preDocumentationStatus !== 'completed') {
                          toast.warning("Vorher-Dokumentation erforderlich", {
                            description: "Die Vorher-Dokumentation muss abgeschlossen sein, bevor der Arbeitstag gestartet werden kann.",
                          });
                          return;
                        }
                        setIsDetailOpen(false);
                        setIsArbeitsbeginnOpen(true);
                      }}
                    >
                      <PlayIcon2 className="h-4 w-4 mr-1" />
                      Arbeitstag beginnen
                      {selectedBaustelle.preDocumentationStatus !== 'completed' && (
                        <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 border-amber-400 text-amber-600">
                          Doku fehlt
                        </Badge>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => { setIsDetailOpen(false); setIsEreignismelderOpen(true); }}
                    >
                      <AlertTriangleIcon className="h-4 w-4 mr-1" />
                      Ereignis melden
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => { setIsDetailOpen(false); setIsArbeitsendeOpen(true); }}
                    >
                      <SquareIcon className="h-4 w-4 mr-1" />
                      Arbeitstag beenden
                    </Button>
                  </div>
                )}

                <div className="space-y-6 mt-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Fortschritt</span>
                      <span className="text-2xl font-bold text-primary">{selectedBaustelle.progress || 0}%</span>
                    </div>
                    <Progress value={selectedBaustelle.progress || 0} className="h-3" />
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="ff-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Projekt</p>
                        <Link href={`/projekte/${selectedBaustelle.projectId}`}>
                          <p className="font-medium text-primary hover:underline cursor-pointer">
                            {selectedBaustelle.projektName}
                          </p>
                        </Link>
                      </CardContent>
                    </Card>
                    <Card className="ff-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Fläche</p>
                        <p className="font-medium">{parseFloat(selectedBaustelle.totalArea || "0").toLocaleString("de-DE")} m²</p>
                      </CardContent>
                    </Card>
                    <Card className="ff-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="font-medium">
                          {selectedBaustelle.startDate
                            ? new Date(selectedBaustelle.startDate).toLocaleDateString("de-DE")
                            : "–"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="ff-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Ende</p>
                        <p className="font-medium">
                          {selectedBaustelle.endDate
                            ? new Date(selectedBaustelle.endDate).toLocaleDateString("de-DE")
                            : "–"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Equipment */}
                  {selectedBaustelle.equipment && selectedBaustelle.equipment.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Geräte ({selectedBaustelle.equipment.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBaustelle.equipment.map((geraet: string, i: number) => (
                          <Badge key={i} variant="outline" className="gap-1">
                            <Wrench className="w-3 h-3" />
                            {geraet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* v7.0d: Nachher-Dokumentation Status */}
                  {selectedBaustelle.preDocumentationStatus === 'completed' && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-green-500" />
                        Nachher-Dokumentation
                      </h4>
                      {selectedBaustelle.postDocumentationStatus === 'completed' ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">Abgeschlossen</p>
                            {selectedBaustelle.postDocumentationCompletedAt && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                am {new Date(selectedBaustelle.postDocumentationCompletedAt).toLocaleDateString("de-DE")}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                          <Camera className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Ausstehend</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Muss vor Abnahme abgeschlossen werden</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsDetailOpen(false);
                              setIsNachherDokuOpen(true);
                            }}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Starten
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* v7.0b: Vorher-Dokumentation Status */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Vorher-Dokumentation
                    </h4>
                    {selectedBaustelle.preDocumentationStatus === 'completed' ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Abgeschlossen</p>
                          {selectedBaustelle.preDocumentationCompletedAt && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              am {new Date(selectedBaustelle.preDocumentationCompletedAt).toLocaleDateString("de-DE")}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                        <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Ausstehend</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Muss vor Baustellenstart abgeschlossen werden</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsDetailOpen(false);
                            setIsVorherDokuOpen(true);
                          }}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Starten
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Fotos */}
                  <FotoGalerieView
                    constructionSiteId={selectedBaustelle.id}
                    title="Baustellen-Fotos"
                    compact={true}
                  />

                  {/* Notes */}
                  {selectedBaustelle.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notizen</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBaustelle.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Nr.50: Floating Action Button – Ereignismelder jederzeit verfügbar */}
        {baustellen.filter(b => b.status === 'aktiv').length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                const aktiveBaustelle = baustellen.find(b => b.status === 'aktiv');
                if (aktiveBaustelle) {
                  setSelectedBaustelle(aktiveBaustelle);
                  setIsEreignismelderOpen(true);
                } else {
                  toast.info("Keine aktive Baustelle vorhanden");
                }
              }}
              title="Ereignis melden"
            >
              <AlertTriangleIcon className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Baustelle Wizard */}
        <BaustelleWizard
          isOpen={isBaustelleWizardOpen}
          onClose={() => setIsBaustelleWizardOpen(false)}
          onComplete={() => {
            refetch();
            setIsBaustelleWizardOpen(false);
            toast.success("Baustelle erstellt");
          }}
        />

        {/* Vorher-Dokumentation Wizard */}
        {selectedBaustelle && (
          <VorherDokuWizard
            isOpen={isVorherDokuOpen}
            onClose={() => setIsVorherDokuOpen(false)}
            constructionSiteId={selectedBaustelle.id}
            constructionSiteName={selectedBaustelle.name}
            projectId={selectedBaustelle.projectId}
            companyName={selectedBaustelle.projektName}
            address={selectedBaustelle.address}
            onComplete={() => {
              refetch();
              setIsVorherDokuOpen(false);
            }}
          />
        )}

        {/* v7.0c: Tagesablauf-Dialoge */}
        {selectedBaustelle && (
          <>
            <ArbeitstageStart
              isOpen={isArbeitsbeginnOpen}
              onClose={() => setIsArbeitsbeginnOpen(false)}
              constructionSiteId={selectedBaustelle.id}
              constructionSiteName={selectedBaustelle.name}
              projectId={selectedBaustelle.projectId}
              onComplete={() => { refetch(); setIsArbeitsbeginnOpen(false); }}
            />
            <Ereignismelder
              isOpen={isEreignismelderOpen}
              onClose={() => setIsEreignismelderOpen(false)}
              constructionSiteId={selectedBaustelle.id}
              constructionSiteName={selectedBaustelle.name}
              projectId={selectedBaustelle.projectId}
              companyName={selectedBaustelle.projektName}
              address={selectedBaustelle.address}
              onComplete={() => { refetch(); setIsEreignismelderOpen(false); }}
            />
            <ArbeitstageEnde
              isOpen={isArbeitsendeOpen}
              onClose={() => setIsArbeitsendeOpen(false)}
              constructionSiteId={selectedBaustelle.id}
              constructionSiteName={selectedBaustelle.name}
              projectId={selectedBaustelle.projectId}
              companyName={selectedBaustelle.projektName}
              address={selectedBaustelle.address}
              onComplete={() => { refetch(); setIsArbeitsendeOpen(false); }}
            />
            <NachherDokuWizard
              isOpen={isNachherDokuOpen}
              onClose={() => setIsNachherDokuOpen(false)}
              constructionSiteId={selectedBaustelle.id}
              constructionSiteName={selectedBaustelle.name}
              projectId={selectedBaustelle.projectId}
              companyName={selectedBaustelle.projektName}
              address={selectedBaustelle.address}
              onComplete={() => { refetch(); setIsNachherDokuOpen(false); }}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
