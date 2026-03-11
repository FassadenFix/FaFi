/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Teamleitercheck: Zweistufige Prüfung für Projektbesprechung
 * Zielgruppe: Handwerker/Praktiker - klare, intuitive Sprache
 * DB-INTEGRIERT: Projekte und Checks aus tRPC laden/speichern
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  FileText,
  Phone,
  Building2,
  Save,
  Send,
  Eye,
  FileCheck,
  Loader2,
  Play,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Types
interface ChecklistItem {
  id: string;
  aufgabe: string;
  beschreibung?: string;
  kategorie: string;
  status: "offen" | "erledigt" | "nicht_relevant";
  notiz?: string;
  wichtig?: boolean;
}

// Default checklists (used when creating new checks)
const projektbesprechungCheckliste: ChecklistItem[] = [
  { id: "1-1", aufgabe: "360° Rundgang durchgeführt", beschreibung: "Fahrzeuge stellen - wo? wie? Zufahrt zu den Stellflächen geklärt?", kategorie: "Rundgang", status: "offen", wichtig: true },
  { id: "1-2", aufgabe: "Verkehrsrechtliche Anordnungen geprüft", beschreibung: "Halteverbotszonen, Absperrungen, Genehmigungen", kategorie: "Rundgang", status: "offen", wichtig: true },
  { id: "1-3", aufgabe: "Einzelobjektbetrachtung", beschreibung: "Besonderheiten am Gebäude dokumentiert", kategorie: "Rundgang", status: "offen" },
  { id: "1-4", aufgabe: "Baustellenablaufplan (BAP) erstellt", beschreibung: "Zeitlicher Ablauf und Arbeitsschritte definiert", kategorie: "Rundgang", status: "offen", wichtig: true },
  { id: "2-1", aufgabe: "Objektaufnahme vorhanden", beschreibung: "Mit Angabe der zu reinigenden Objektbereiche", kategorie: "Dokumente", status: "offen", wichtig: true },
  { id: "2-2", aufgabe: "Auftragsbestätigung geprüft", beschreibung: "Alle Leistungen und Konditionen korrekt", kategorie: "Dokumente", status: "offen", wichtig: true },
  { id: "2-3", aufgabe: "Aushang / Bewohnerinfo vorbereitet", beschreibung: "Informationsschreiben für Mieter/Bewohner", kategorie: "Dokumente", status: "offen" },
  { id: "2-4", aufgabe: "Verkehrsrechtliche Anordnungen dokumentiert", beschreibung: "Genehmigungen und Auflagen im Projekt hinterlegt", kategorie: "Dokumente", status: "offen" },
  { id: "2-5", aufgabe: "Mietbühnen-Bestätigung", beschreibung: "Auftragsbestätigung vorhanden (außer eigene Dauermietbühnen)", kategorie: "Dokumente", status: "offen" },
  { id: "2-6", aufgabe: "Übernachtung reserviert", beschreibung: "Gästewohnungen schriftlich im Projekt hinterlegt (Screenshot Mail)", kategorie: "Dokumente", status: "offen" },
  { id: "3-1", aufgabe: "Mitarbeiter eingeplant", beschreibung: "Plantafel auf Doppelbuchungen geprüft!", kategorie: "Einsatzplanung", status: "offen", wichtig: true },
  { id: "3-2", aufgabe: "Ressourcen eingeplant", beschreibung: "Fahrzeuge, Geräte, Material zugewiesen", kategorie: "Einsatzplanung", status: "offen", wichtig: true },
  { id: "4-1", aufgabe: "Ansprechpartner Verwaltung/AG", beschreibung: "Kontaktdaten in Projektdaten eingetragen", kategorie: "Ansprechpartner", status: "offen" },
  { id: "4-2", aufgabe: "Ansprechpartner vor Ort", beschreibung: "Für Wasser, Strom etc. - KB im Projekt eingetragen", kategorie: "Ansprechpartner", status: "offen" },
  { id: "5-1", aufgabe: "Besonderheiten Technik geprüft", beschreibung: "Spezielle technische Anforderungen notiert", kategorie: "Besonderheiten", status: "offen" },
  { id: "5-2", aufgabe: "Besonderheiten Material geprüft", beschreibung: "Spezielle Materialien oder Mengen notiert", kategorie: "Besonderheiten", status: "offen" },
  { id: "5-3", aufgabe: "Besonderheiten Chemie geprüft", beschreibung: "Spezielle Reinigungsmittel oder Verfahren notiert", kategorie: "Besonderheiten", status: "offen" },
  { id: "6-1", aufgabe: "Bilder eindeutig beschriftet", beschreibung: "Alle Fotos mit aussagekräftigen Namen versehen", kategorie: "Dateien", status: "offen" },
  { id: "6-2", aufgabe: "Dokumente eindeutig beschriftet", beschreibung: "Alle Dateien korrekt benannt und zugeordnet", kategorie: "Dateien", status: "offen" },
];

const freitagCheckCheckliste: ChecklistItem[] = [
  { id: "f-1", aufgabe: "Wetter geprüft", beschreibung: "Wettervorhersage für Projektzeitraum gecheckt", kategorie: "Freitag-Check", status: "offen", wichtig: true },
  { id: "f-2", aufgabe: "Offene Fragen erledigt", beschreibung: "Alle ungeklärten Punkte abgearbeitet", kategorie: "Freitag-Check", status: "offen", wichtig: true },
  { id: "f-3", aufgabe: "Neuigkeiten erfragt", beschreibung: "Aktuelle Änderungen beim AG/Verwaltung abgefragt", kategorie: "Freitag-Check", status: "offen" },
  { id: "f-4", aufgabe: "Einsatzplanung aktuell", beschreibung: "Keine kurzfristigen Änderungen bei Mitarbeitern", kategorie: "Freitag-Check", status: "offen" },
  { id: "f-5", aufgabe: "Ressourcenplanung aktuell", beschreibung: "Fahrzeuge und Geräte noch verfügbar", kategorie: "Freitag-Check", status: "offen" },
  { id: "f-6", aufgabe: "Projektdaten aktuell", beschreibung: "Keine Änderungen an Terminen oder Umfang", kategorie: "Freitag-Check", status: "offen" },
];

const kategorieIcons: Record<string, React.ElementType> = {
  "Rundgang": MapPin,
  "Dokumente": FileText,
  "Einsatzplanung": Users,
  "Ansprechpartner": Phone,
  "Besonderheiten": AlertCircle,
  "Dateien": FileCheck,
  "Freitag-Check": Calendar,
};

function ChecklistItemCard({
  item,
  onToggle,
  onNotizChange,
}: {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onNotizChange: (id: string, notiz: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = kategorieIcons[item.kategorie] || ClipboardCheck;

  return (
    <div
      className={cn(
        "border rounded-xl transition-all duration-200",
        item.status === "erledigt"
          ? "bg-green-500/5 border-green-500/20"
          : item.status === "nicht_relevant"
          ? "bg-muted/50 border-muted"
          : item.wichtig
          ? "bg-amber-500/5 border-amber-500/20"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => onToggle(item.id)}
      >
        <div className="mt-0.5">
          {item.status === "erledigt" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : item.status === "nicht_relevant" ? (
            <Circle className="w-5 h-5 text-muted-foreground line-through" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-medium",
              item.status === "erledigt" && "line-through text-muted-foreground",
              item.status === "nicht_relevant" && "line-through text-muted-foreground"
            )}>
              {item.aufgabe}
            </p>
            {item.wichtig && item.status === "offen" && (
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">Pflicht</Badge>
            )}
          </div>
          {item.beschreibung && (
            <p className="text-sm text-muted-foreground mt-0.5">{item.beschreibung}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          Notiz
        </Button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <Textarea
            placeholder="Notiz hinzufügen..."
            value={item.notiz || ""}
            onChange={(e) => onNotizChange(item.id, e.target.value)}
            className="min-h-[60px]"
          />
        </div>
      )}
    </div>
  );
}

function CategorySection({
  kategorie,
  items,
  onToggle,
  onNotizChange,
}: {
  kategorie: string;
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onNotizChange: (id: string, notiz: string) => void;
}) {
  const Icon = kategorieIcons[kategorie] || ClipboardCheck;
  const erledigt = items.filter((i) => i.status === "erledigt").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{kategorie}</h3>
        <Badge variant="secondary" className="text-xs">
          {erledigt}/{items.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            onToggle={onToggle}
            onNotizChange={onNotizChange}
          />
        ))}
      </div>
    </div>
  );
}

export default function Teamleitercheck() {
  // Load projects from DB
  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery();
  
  const [selectedProjektId, setSelectedProjektId] = useState<string>("");
  const [stufe1Items, setStufe1Items] = useState<ChecklistItem[]>(projektbesprechungCheckliste);
  const [stufe2Items, setStufe2Items] = useState<ChecklistItem[]>(freitagCheckCheckliste);
  const [activeTab, setActiveTab] = useState("stufe1");
  const [existingCheckId, setExistingCheckId] = useState<number | null>(null);

  // Set first project when loaded
  useEffect(() => {
    if (projects?.length && !selectedProjektId) {
      setSelectedProjektId(String(projects[0].id));
    }
  }, [projects, selectedProjektId]);

  // Load existing checks for selected project
  const projectIdNum = selectedProjektId ? parseInt(selectedProjektId) : 0;
  const { data: existingChecks } = trpc.teamleiterCheck.getByProjectId.useQuery(
    { projectId: projectIdNum },
    { enabled: projectIdNum > 0 }
  );

  // Load existing check data when project changes
  useEffect(() => {
    if (existingChecks?.length) {
      const latestCheck = existingChecks[0];
      setExistingCheckId(latestCheck.id);
      // Restore check items from DB
      if (latestCheck.checkItems) {
        try {
          const savedItems = typeof latestCheck.checkItems === 'string' 
            ? JSON.parse(latestCheck.checkItems) 
            : latestCheck.checkItems;
          if (Array.isArray(savedItems)) {
            const stufe1Saved = savedItems.filter((i: any) => !i.id.startsWith('f-'));
            const stufe2Saved = savedItems.filter((i: any) => i.id.startsWith('f-'));
            if (stufe1Saved.length) {
              setStufe1Items(stufe1Saved.map((s: any) => ({
                ...projektbesprechungCheckliste.find(p => p.id === s.id) || s,
                status: s.checked ? "erledigt" : "offen",
                notiz: s.notes || "",
              })));
            }
            if (stufe2Saved.length) {
              setStufe2Items(stufe2Saved.map((s: any) => ({
                ...freitagCheckCheckliste.find(f => f.id === s.id) || s,
                status: s.checked ? "erledigt" : "offen",
                notiz: s.notes || "",
              })));
            }
          }
        } catch { /* use defaults */ }
      }
    } else {
      setExistingCheckId(null);
      setStufe1Items([...projektbesprechungCheckliste]);
      setStufe2Items([...freitagCheckCheckliste]);
    }
  }, [existingChecks, selectedProjektId]);

  const createCheckMutation = trpc.teamleiterCheck.create.useMutation({
    onSuccess: () => toast.success("Checkliste gespeichert"),
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const updateCheckMutation = trpc.teamleiterCheck.update.useMutation({
    onSuccess: () => toast.success("Checkliste aktualisiert"),
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const selectedProject = useMemo(() => {
    if (!projects || !selectedProjektId) return null;
    return projects.find(p => String(p.id) === selectedProjektId);
  }, [projects, selectedProjektId]);

  const toggleItem = useCallback((items: ChecklistItem[], setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) => (id: string) => {
    setItems(prev => prev.map((item) => {
      if (item.id === id) {
        const newStatus = item.status === "offen" ? "erledigt" : item.status === "erledigt" ? "nicht_relevant" : "offen";
        return { ...item, status: newStatus };
      }
      return item;
    }));
  }, []);

  const updateNotiz = useCallback((items: ChecklistItem[], setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>) => (id: string, notiz: string) => {
    setItems(prev => prev.map((item) => item.id === id ? { ...item, notiz } : item));
  }, []);

  const calculateProgress = (items: ChecklistItem[]) => {
    const relevant = items.filter((i) => i.status !== "nicht_relevant");
    const erledigt = items.filter((i) => i.status === "erledigt");
    return relevant.length > 0 ? Math.round((erledigt.length / relevant.length) * 100) : 0;
  };

  const stufe1Progress = calculateProgress(stufe1Items);
  const stufe2Progress = calculateProgress(stufe2Items);

  const groupByKategorie = (items: ChecklistItem[]) => {
    const groups: Record<string, ChecklistItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.kategorie]) groups[item.kategorie] = [];
      groups[item.kategorie].push(item);
    });
    return groups;
  };

  const stufe1Groups = groupByKategorie(stufe1Items);
  const stufe2Groups = groupByKategorie(stufe2Items);

  const buildCheckItems = () => {
    const allItems = [...stufe1Items, ...stufe2Items];
    return allItems.map(item => ({
      id: item.id,
      category: item.kategorie,
      label: item.aufgabe,
      checked: item.status === "erledigt",
      notes: item.notiz || "",
    }));
  };

  const handleSave = () => {
    if (!projectIdNum) return;
    const checkItems = buildCheckItems();
    
    if (existingCheckId) {
      updateCheckMutation.mutate({ id: existingCheckId, checkItems });
    } else {
      createCheckMutation.mutate({
        projectId: projectIdNum,
        checkType: "projektbesprechung",
        checkItems,
        notes: "",
      });
    }
  };

  const handleSubmit = () => {
    if (!projectIdNum) return;
    const stufe1Complete = stufe1Progress === 100;
    const stufe2Complete = stufe2Progress === 100;

    if (!stufe1Complete) {
      toast.error("Projektbesprechung nicht vollständig", { description: "Bitte alle Punkte der Stufe 1 abhaken." });
      return;
    }
    if (activeTab === "stufe2" && !stufe2Complete) {
      toast.error("Freitag-Check nicht vollständig", { description: "Bitte alle Punkte der Stufe 2 abhaken." });
      return;
    }

    const checkItems = buildCheckItems();
    if (existingCheckId) {
      updateCheckMutation.mutate({ id: existingCheckId, checkItems, completedAt: new Date() });
    } else {
      createCheckMutation.mutate({
        projectId: projectIdNum,
        checkType: activeTab === "stufe2" ? "freitag_check" : "projektbesprechung",
        checkItems,
        notes: "Abgeschlossen",
      });
    }
  };

  const isSaving = createCheckMutation.isPending || updateCheckMutation.isPending;

  if (projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-primary" />
              Teamleitercheck
            </h1>
            <p className="text-muted-foreground mt-1">Zweistufige Prüfung vor Projektstart</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedProjektId} onValueChange={setSelectedProjektId}>
              <SelectTrigger className="w-[280px] touch-target">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Projekt wählen" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Info Card */}
        {selectedProject && (
          <Card className="ff-card animate-fade-in-up animate-delay-100">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedProject.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.notes || "Kein Standort"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Start: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString("de-DE") : "Offen"}</span>
                </div>
                {existingCheckId && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Check vorhanden
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animate-delay-200">
          <Card className={cn("ff-card cursor-pointer transition-all", activeTab === "stufe1" && "ring-2 ring-primary")} onClick={() => setActiveTab("stufe1")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10"><Eye className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-semibold">Stufe 1: Projektbesprechung</h3>
                    <p className="text-sm text-muted-foreground">Vorab-Prüfung aller Unterlagen</p>
                  </div>
                </div>
                <Badge variant="secondary" className={cn(stufe1Progress === 100 ? "bg-green-500/10 text-green-600" : "bg-muted")}>{stufe1Progress}%</Badge>
              </div>
              <Progress value={stufe1Progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stufe1Items.filter(i => i.status === "erledigt").length} von {stufe1Items.filter(i => i.status !== "nicht_relevant").length} Punkten erledigt
              </p>
            </CardContent>
          </Card>

          <Card className={cn("ff-card cursor-pointer transition-all", activeTab === "stufe2" && "ring-2 ring-primary", stufe1Progress < 100 && "opacity-60")} onClick={() => stufe1Progress === 100 && setActiveTab("stufe2")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10"><Calendar className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <h3 className="font-semibold">Stufe 2: Freitag-Check</h3>
                    <p className="text-sm text-muted-foreground">Abschließende Prüfung vor Start</p>
                  </div>
                </div>
                <Badge variant="secondary" className={cn(stufe2Progress === 100 ? "bg-green-500/10 text-green-600" : "bg-muted")}>{stufe2Progress}%</Badge>
              </div>
              <Progress value={stufe2Progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stufe1Progress < 100 ? "Erst nach Abschluss von Stufe 1 verfügbar" : `${stufe2Items.filter(i => i.status === "erledigt").length} von ${stufe2Items.filter(i => i.status !== "nicht_relevant").length} Punkten erledigt`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Checklist Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up animate-delay-300">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="stufe1" className="rounded-xl touch-target gap-2"><Eye className="w-4 h-4" />Projektbesprechung</TabsTrigger>
            <TabsTrigger value="stufe2" className="rounded-xl touch-target gap-2" disabled={stufe1Progress < 100}><Calendar className="w-4 h-4" />Freitag-Check</TabsTrigger>
          </TabsList>

          <TabsContent value="stufe1" className="mt-6 space-y-6">
            {Object.entries(stufe1Groups).map(([kategorie, items]) => (
              <CategorySection key={kategorie} kategorie={kategorie} items={items} onToggle={toggleItem(stufe1Items, setStufe1Items)} onNotizChange={updateNotiz(stufe1Items, setStufe1Items)} />
            ))}
          </TabsContent>

          <TabsContent value="stufe2" className="mt-6 space-y-6">
            <Card className="ff-card border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Freitag vor Projektstart</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Diese Punkte am Freitag vor dem Projektstart prüfen, um kurzfristige Änderungen zu erfassen.</p>
                </div>
              </CardContent>
            </Card>
            {Object.entries(stufe2Groups).map(([kategorie, items]) => (
              <CategorySection key={kategorie} kategorie={kategorie} items={items} onToggle={toggleItem(stufe2Items, setStufe2Items)} onNotizChange={updateNotiz(stufe2Items, setStufe2Items)} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border animate-fade-in-up animate-delay-400">
          <Button variant="outline" onClick={handleSave} disabled={isSaving} className="gap-2 touch-target">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Als Entwurf speichern
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="gap-2 ff-button touch-target">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {activeTab === "stufe1" ? "Projektbesprechung abschließen" : "Freitag-Check abschließen"}
          </Button>
          {/* Nr.46: Gate-Button – Arbeitstag erst starten wenn Pflicht-Punkte erledigt */}
          {(() => {
            const pflichtItems = stufe1Items.filter(i => i.wichtig);
            const pflichtErledigt = pflichtItems.filter(i => i.status === "erledigt").length;
            const allPflichtDone = pflichtErledigt === pflichtItems.length;
            return (
              <Button
                variant="outline"
                disabled={!allPflichtDone}
                className={cn(
                  "gap-2 touch-target",
                  allPflichtDone
                    ? "border-green-500 text-green-700 hover:bg-green-50"
                    : "opacity-50"
                )}
                onClick={() => {
                  if (!allPflichtDone) {
                    toast.warning("Pflicht-Punkte nicht erledigt", {
                      description: `${pflichtErledigt}/${pflichtItems.length} Pflicht-Punkte erledigt. Alle Pflicht-Punkte müssen abgehakt sein.`,
                    });
                    return;
                  }
                  toast.success("Freigabe erteilt", {
                    description: "Alle Pflicht-Punkte erledigt. Arbeitstag kann gestartet werden.",
                  });
                }}
              >
                <Play className="w-4 h-4" />
                Arbeitstag freigeben ({pflichtErledigt}/{pflichtItems.length} Pflicht)
              </Button>
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
}
