/**
 * Baustellen-Tagesablauf Manager (v7.0c)
 * 
 * - "Arbeitstag beginnen" mit Planungsfrage
 * - Ereignismelder (jederzeit verfügbar)
 * - "Arbeitstag beenden" mit Zusammenfassung
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Play, Square, AlertTriangle, Camera, Clock, Sun, Cloud,
  CheckCircle2, Loader2, Plus, Trash2, CloudRain, Wind,
  Thermometer, Droplets, FileText, TrendingUp, Coffee
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import FotoUpload, { PhotoUploadResult } from "@/components/FotoUpload";

// ============================================
// ARBEITSTAG BEGINNEN
// ============================================
interface ArbeitstageStartProps {
  isOpen: boolean;
  onClose: () => void;
  constructionSiteId: number;
  constructionSiteName: string;
  projectId: number;
  onComplete?: () => void;
}

export function ArbeitstageStart({
  isOpen, onClose, constructionSiteId, constructionSiteName, projectId, onComplete
}: ArbeitstageStartProps) {
  const [planningOnTrack, setPlanningOnTrack] = useState<boolean | null>(null);
  const [planningDeviation, setPlanningDeviation] = useState("");
  const [plannedAreas, setPlannedAreas] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLogMutation = trpc.constructionSite.createLog.useMutation();
  const utils = trpc.useUtils();

  const addArea = () => setPlannedAreas(prev => [...prev, ""]);
  const removeArea = (idx: number) => setPlannedAreas(prev => prev.filter((_, i) => i !== idx));
  const updateArea = (idx: number, val: string) => setPlannedAreas(prev => prev.map((a, i) => i === idx ? val : a));

  const handleSubmit = async () => {
    if (planningOnTrack === null) {
      toast.error("Bitte beantworten Sie die Planungsfrage.");
      return;
    }
    const areas = plannedAreas.filter(a => a.trim());
    if (areas.length === 0) {
      toast.error("Bitte geben Sie mindestens einen geplanten Bereich an.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLogMutation.mutateAsync({
        constructionSiteId,
        logType: "arbeitsbeginn",
        entry: `Arbeitsbeginn ${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr. ${planningOnTrack ? "Planung wird eingehalten." : `Planabweichung: ${planningDeviation}`}${notes ? ` Notizen: ${notes}` : ""}`,
        plannedAreas: areas,
        planningOnTrack,
        planningDeviation: planningOnTrack ? undefined : planningDeviation,
        workDayStarted: new Date(),
      });

      utils.constructionSite.invalidate();
      toast.success("Arbeitstag gestartet", {
        description: `${areas.length} Bereiche geplant für heute.`,
      });
      onComplete?.();
      onClose();
    } catch (error) {
      toast.error("Fehler beim Starten des Arbeitstags");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Arbeitstag beginnen
          </DialogTitle>
          <DialogDescription>{constructionSiteName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Zeitstempel */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Start: {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Planungsfrage */}
          <div className="space-y-2">
            <Label className="font-medium">Wird die Baustellenplanung zeitlich beibehalten?</Label>
            <RadioGroup
              value={planningOnTrack === null ? "" : planningOnTrack ? "ja" : "nein"}
              onValueChange={(v) => setPlanningOnTrack(v === "ja")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="plan-ja" />
                <Label htmlFor="plan-ja">Ja, alles nach Plan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nein" id="plan-nein" />
                <Label htmlFor="plan-nein">Nein, es gibt Abweichungen</Label>
              </div>
            </RadioGroup>
            {planningOnTrack === false && (
              <Textarea
                placeholder="Bitte beschreiben Sie die Abweichung..."
                value={planningDeviation}
                onChange={(e) => setPlanningDeviation(e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Geplante Bereiche */}
          <div className="space-y-2">
            <Label className="font-medium">Geplante Bereiche für heute</Label>
            {plannedAreas.map((area, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Bereich ${idx + 1} (z.B. "Gebäude 3, Nordseite")`}
                  value={area}
                  onChange={(e) => updateArea(idx, e.target.value)}
                />
                {plannedAreas.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeArea(idx)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addArea}>
              <Plus className="h-4 w-4 mr-1" /> Bereich hinzufügen
            </Button>
          </div>

          {/* Notizen */}
          <div>
            <Label className="font-medium">Notizen (optional)</Label>
            <Textarea
              placeholder="Besondere Hinweise für den Tag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Arbeitstag starten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// EREIGNISMELDER
// ============================================
interface EreignismelderProps {
  isOpen: boolean;
  onClose: () => void;
  constructionSiteId: number;
  constructionSiteName: string;
  projectId: number;
  companyName?: string;
  address?: string;
  onComplete?: () => void;
}

const EREIGNIS_KATEGORIEN = [
  { value: "problem", label: "Schaden", icon: AlertTriangle, color: "text-red-500" },
  { value: "sicherheit", label: "Sicherheitsvorfall", icon: AlertTriangle, color: "text-orange-500" },
  { value: "geraeteausfall", label: "Geräteausfall", icon: AlertTriangle, color: "text-amber-500" },
  { value: "kundenkontakt", label: "Kundenkontakt", icon: FileText, color: "text-blue-500" },
  { value: "fortschritt", label: "Fortschritt", icon: TrendingUp, color: "text-green-500" },
  { value: "sonstiges", label: "Sonstiges", icon: FileText, color: "text-gray-500" },
] as const;

export function Ereignismelder({
  isOpen, onClose, constructionSiteId, constructionSiteName, projectId,
  companyName, address, onComplete
}: EreignismelderProps) {
  const [kategorie, setKategorie] = useState<string>("");
  const [urgency, setUrgency] = useState<"normal" | "hoch" | "kritisch">("normal");
  const [beschreibung, setBeschreibung] = useState("");
  const [photos, setPhotos] = useState<PhotoUploadResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLogMutation = trpc.constructionSite.createLog.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!kategorie) {
      toast.error("Bitte wählen Sie eine Kategorie.");
      return;
    }
    if (!beschreibung.trim()) {
      toast.error("Bitte geben Sie eine Beschreibung ein.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLogMutation.mutateAsync({
        constructionSiteId,
        logType: kategorie as any,
        entry: beschreibung,
        urgency,
        photos: photos.map(p => p.url),
      });

      utils.constructionSite.invalidate();

      if (urgency === "kritisch") {
        toast.warning("Kritisches Ereignis gemeldet", {
          description: "Geschäftsführung und Büro werden benachrichtigt.",
        });
      } else {
        toast.success("Ereignis dokumentiert");
      }

      // Reset
      setKategorie("");
      setUrgency("normal");
      setBeschreibung("");
      setPhotos([]);
      onComplete?.();
      onClose();
    } catch (error) {
      toast.error("Fehler beim Speichern des Ereignisses");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Ereignis melden
          </DialogTitle>
          <DialogDescription>{constructionSiteName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Kategorie */}
          <div className="space-y-2">
            <Label className="font-medium">Kategorie</Label>
            <div className="grid grid-cols-2 gap-2">
              {EREIGNIS_KATEGORIEN.map(kat => {
                const Icon = kat.icon;
                return (
                  <Button
                    key={kat.value}
                    variant={kategorie === kat.value ? "default" : "outline"}
                    className="justify-start h-auto py-2"
                    onClick={() => setKategorie(kat.value)}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${kategorie === kat.value ? "" : kat.color}`} />
                    {kat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Dringlichkeit */}
          <div className="space-y-2">
            <Label className="font-medium">Dringlichkeit</Label>
            <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="urg-normal" />
                <Label htmlFor="urg-normal" className="flex items-center gap-1">
                  <Badge variant="secondary">Normal</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hoch" id="urg-hoch" />
                <Label htmlFor="urg-hoch" className="flex items-center gap-1">
                  <Badge className="bg-orange-100 text-orange-700">Hoch</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kritisch" id="urg-kritisch" />
                <Label htmlFor="urg-kritisch" className="flex items-center gap-1">
                  <Badge className="bg-red-100 text-red-700">Kritisch</Badge>
                  <span className="text-xs text-muted-foreground">(benachrichtigt GF/Büro)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Beschreibung */}
          <div>
            <Label className="font-medium">Beschreibung</Label>
            <Textarea
              placeholder="Was ist passiert? Beschreiben Sie das Ereignis möglichst genau..."
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
            />
          </div>

          {/* Foto-Upload */}
          <FotoUpload
            context="ereignis"
            constructionSiteId={constructionSiteId}
            projectId={projectId}
            companyName={companyName}
            address={address}
            maxPhotos={5}
            label="Fotos (optional)"
            description="Dokumentieren Sie das Ereignis mit Fotos."
            existingPhotos={photos}
            onPhotosChange={setPhotos}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={urgency === "kritisch" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
            Ereignis melden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// ARBEITSTAG BEENDEN
// ============================================
interface ArbeitstageEndeProps {
  isOpen: boolean;
  onClose: () => void;
  constructionSiteId: number;
  constructionSiteName: string;
  projectId: number;
  companyName?: string;
  address?: string;
  todayStartLog?: any; // The arbeitsbeginn log entry from today
  onComplete?: () => void;
}

export function ArbeitstageEnde({
  isOpen, onClose, constructionSiteId, constructionSiteName, projectId,
  companyName, address, todayStartLog, onComplete
}: ArbeitstageEndeProps) {
  const [completedAreas, setCompletedAreas] = useState<string[]>([]);
  const [planningOnTrack, setPlanningOnTrack] = useState<boolean | null>(null);
  const [planningDeviation, setPlanningDeviation] = useState("");
  const [nextDayPlanning, setNextDayPlanning] = useState("");
  const [photos, setPhotos] = useState<PhotoUploadResult[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLogMutation = trpc.constructionSite.createLog.useMutation();
  const utils = trpc.useUtils();

  const plannedAreas: string[] = todayStartLog?.plannedAreas || [];

  const toggleArea = (area: string) => {
    setCompletedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async () => {
    if (planningOnTrack === null) {
      toast.error("Bitte beantworten Sie die Planungsfrage.");
      return;
    }

    setIsSubmitting(true);
    try {
      const erreicht = completedAreas.length;
      const geplant = plannedAreas.length;
      const summary = `Arbeitsende ${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr. ${erreicht}/${geplant} Bereiche abgeschlossen. ${planningOnTrack ? "Planung eingehalten." : `Abweichung: ${planningDeviation}`}${nextDayPlanning ? ` Planung morgen: ${nextDayPlanning}` : ""}`;

      await createLogMutation.mutateAsync({
        constructionSiteId,
        logType: "arbeitsende",
        entry: summary,
        completedAreas,
        planningOnTrack,
        planningDeviation: planningOnTrack ? undefined : planningDeviation,
        workDayEnded: new Date(),
        photos: photos.map(p => p.url),
        metadata: {
          nextDayPlanning,
          plannedAreasCount: geplant,
          completedAreasCount: erreicht,
        },
      });

      utils.constructionSite.invalidate();
      toast.success("Arbeitstag beendet", {
        description: `${erreicht}/${geplant} Bereiche abgeschlossen. Bautagebuch wird erstellt.`,
      });
      onComplete?.();
      onClose();
    } catch (error) {
      toast.error("Fehler beim Beenden des Arbeitstags");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-red-500" />
            Arbeitstag beenden
          </DialogTitle>
          <DialogDescription>{constructionSiteName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Zeitstempel */}
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  Ende: {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                </p>
                {todayStartLog?.workDayStarted && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Start: {new Date(todayStartLog.workDayStarted).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Erreichte Bereiche */}
          {plannedAreas.length > 0 && (
            <div className="space-y-2">
              <Label className="font-medium">Erreichte Bereiche (vs. Planung)</Label>
              {plannedAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={completedAreas.includes(area)}
                    onCheckedChange={() => toggleArea(area)}
                    id={`area-${idx}`}
                  />
                  <Label htmlFor={`area-${idx}`} className="text-sm">{area}</Label>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                {completedAreas.length}/{plannedAreas.length} Bereiche abgeschlossen
              </p>
            </div>
          )}

          {/* Planungsfrage */}
          <div className="space-y-2">
            <Label className="font-medium">Wird die Gesamtplanung weiterhin eingehalten?</Label>
            <RadioGroup
              value={planningOnTrack === null ? "" : planningOnTrack ? "ja" : "nein"}
              onValueChange={(v) => setPlanningOnTrack(v === "ja")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="end-plan-ja" />
                <Label htmlFor="end-plan-ja">Ja, alles im Zeitplan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nein" id="end-plan-nein" />
                <Label htmlFor="end-plan-nein">Nein, Verzögerung</Label>
              </div>
            </RadioGroup>
            {planningOnTrack === false && (
              <Textarea
                placeholder="Bitte beschreiben Sie die Verzögerung..."
                value={planningDeviation}
                onChange={(e) => setPlanningDeviation(e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Planung nächster Tag */}
          <div>
            <Label className="font-medium">Planung für morgen (optional)</Label>
            <Textarea
              placeholder="Welche Bereiche sind für morgen geplant?"
              value={nextDayPlanning}
              onChange={(e) => setNextDayPlanning(e.target.value)}
              rows={2}
            />
          </div>

          {/* Fotos */}
          <FotoUpload
            context="baustelle_fortschritt"
            constructionSiteId={constructionSiteId}
            projectId={projectId}
            companyName={companyName}
            address={address}
            maxPhotos={5}
            label="Tagesfortschritt-Fotos (optional)"
            description="Dokumentieren Sie den Fortschritt des Tages."
            existingPhotos={photos}
            onPhotosChange={setPhotos}
          />

          {/* Notizen */}
          <div>
            <Label className="font-medium">Notizen (optional)</Label>
            <Textarea
              placeholder="Sonstige Anmerkungen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
            Arbeitstag beenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
