/**
 * GateInteraction – Klickbare Qualitäts-Gate-Karten mit Dialogen
 * 
 * Vorher-Doku: Foto-Upload (Drag & Drop + Datei-Auswahl), Galerie, Abschluss-Button
 * Teamleitercheck: Sicherheits-Checkliste, Notizfeld, Bestätigungs-Button
 * Nachher-Doku: Analog Vorher-Doku, nur nach Fertigstellung aktiv
 */

import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import {
  Camera, ClipboardCheck, ShieldCheck, CheckCircle2, AlertTriangle,
  Upload, ImagePlus, Loader2, Trash2, X, ChevronRight,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface GateStatus {
  vorherDoku: {
    status: string;
    completedAt: Date | string | null;
    photoCount: number;
  };
  teamleiterCheck: {
    status: string;
    completedAt: Date | string | null;
    checkData: any;
  };
  nachherDoku: {
    status: string;
    completedAt: Date | string | null;
    photoCount: number;
  };
}

interface GateInteractionProps {
  constructionSiteId: number;
  projectId: number;
  siteStatus: string;
  siteName: string;
}

// ============================================
// TEAMLEITERCHECK ITEMS
// ============================================

const ARBEITSBEGINN_CHECK_ITEMS = [
  { id: "psa_helm", category: "PSA", label: "Schutzhelme vorhanden und getragen" },
  { id: "psa_schuhe", category: "PSA", label: "Sicherheitsschuhe vorhanden" },
  { id: "psa_handschuhe", category: "PSA", label: "Schutzhandschuhe vorhanden" },
  { id: "psa_brille", category: "PSA", label: "Schutzbrillen vorhanden" },
  { id: "absperrung_bereich", category: "Absperrung", label: "Arbeitsbereich abgesperrt" },
  { id: "absperrung_schilder", category: "Absperrung", label: "Warnschilder aufgestellt" },
  { id: "absperrung_fussgaenger", category: "Absperrung", label: "Fußgänger-Umleitung eingerichtet" },
  { id: "geraete_hubsteiger", category: "Geräte", label: "Hubsteiger geprüft und einsatzbereit" },
  { id: "geraete_hochdruck", category: "Geräte", label: "Hochdruckreiniger geprüft" },
  { id: "geraete_wasser", category: "Geräte", label: "Wasseranschluss vorhanden und getestet" },
  { id: "wetter_check", category: "Wetter", label: "Wetterbedingungen geprüft – Arbeit möglich" },
  { id: "wetter_wind", category: "Wetter", label: "Windgeschwindigkeit unter Grenzwert" },
  { id: "team_einweisung", category: "Team", label: "Team-Einweisung durchgeführt" },
  { id: "team_ersthelfer", category: "Team", label: "Ersthelfer benannt und anwesend" },
  { id: "team_notruf", category: "Team", label: "Notrufnummern ausgehängt" },
];

// ============================================
// PHOTO UPLOAD DIALOG
// ============================================

function PhotoUploadDialog({
  open,
  onOpenChange,
  constructionSiteId,
  gateType,
  siteName,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  constructionSiteId: number;
  gateType: "vorher" | "nachher";
  siteName: string;
  onComplete: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos = [], refetch: refetchPhotos } = trpc.gate.getPhotos.useQuery(
    { constructionSiteId, gateType },
    { enabled: open }
  );

  const uploadMutation = trpc.gate.uploadPhoto.useMutation({
    onSuccess: () => {
      refetchPhotos();
      toast.success("Foto hochgeladen");
    },
    onError: (err) => toast.error(`Upload fehlgeschlagen: ${err.message}`),
  });

  const completeMutation = gateType === "vorher"
    ? trpc.gate.completePreDocumentation.useMutation({
        onSuccess: () => {
          toast.success("Vorher-Dokumentation abgeschlossen!");
          onComplete();
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      })
    : trpc.gate.completePostDocumentation.useMutation({
        onSuccess: () => {
          toast.success("Nachher-Dokumentation abgeschlossen!");
          onComplete();
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} ist kein Bild`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} ist zu groß (max. 10 MB)`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        await uploadMutation.mutateAsync({
          constructionSiteId,
          gateType,
          fileData: base64,
          contentType: file.type,
        });
      } catch {
        // Error handled by mutation onError
      }
    }
    setUploading(false);
  }, [constructionSiteId, gateType, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleComplete = () => {
    setCompleting(true);
    completeMutation.mutate({ constructionSiteId });
  };

  const title = gateType === "vorher" ? "Vorher-Dokumentation" : "Nachher-Dokumentation";
  const description = gateType === "vorher"
    ? "Laden Sie Fotos des Ist-Zustands hoch, bevor die Arbeiten beginnen. Diese dienen als Nachweis bei Reklamationen."
    : "Laden Sie Fotos des Ergebnisses hoch. Diese werden für die Abnahme und Garantie benötigt.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {title}
            <HelpTooltip
              content={gateType === "vorher" ? HELP_TEXTS.vorherDokuGate.text : HELP_TEXTS.nachherDokuGate.text}
              helpTextKey={gateType === "vorher" ? "vorherDokuGate" : "nachherDokuGate"}
            />
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Fotos hierher ziehen</p>
                  <p className="text-sm text-muted-foreground">
                    oder klicken zum Auswählen (auch aus der Galerie)
                  </p>
                  <p className="text-xs text-muted-foreground">JPG, PNG – max. 10 MB pro Bild</p>
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Hochgeladene Fotos ({photos.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo: any) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
                      <img
                        src={photo.photoUrl}
                        alt={photo.fileName}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-xs text-white truncate">{photo.fileName}</p>
                        {photo.uploadedByName && (
                          <p className="text-xs text-white/70">{photo.uploadedByName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          <Button
            onClick={handleComplete}
            disabled={photos.length === 0 || completing}
            className="ff-button"
          >
            {completing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Dokumentation abschließen ({photos.length} Fotos)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// TEAMLEITERCHECK DIALOG
// ============================================

function TeamleiterCheckDialog({
  open,
  onOpenChange,
  constructionSiteId,
  projectId,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  constructionSiteId: number;
  projectId: number;
  onComplete: () => void;
}) {
  const [checkItems, setCheckItems] = useState(
    ARBEITSBEGINN_CHECK_ITEMS.map(item => ({ ...item, checked: false, notes: "" }))
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existingCheck } = trpc.gate.getTeamleiterCheck.useQuery(
    { constructionSiteId },
    { enabled: open }
  );

  const submitMutation = trpc.gate.submitTeamleiterCheck.useMutation({
    onSuccess: () => {
      toast.success("Teamleitercheck abgeschlossen! Arbeit kann beginnen.");
      onComplete();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleItem = (id: string) => {
    setCheckItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const allChecked = checkItems.every(item => item.checked);
  const checkedCount = checkItems.filter(item => item.checked).length;
  const progress = Math.round((checkedCount / checkItems.length) * 100);

  const handleSubmit = () => {
    setSubmitting(true);
    submitMutation.mutate({
      constructionSiteId,
      projectId,
      checkItems: checkItems.map(({ id, category, label, checked, notes }) => ({
        id, category, label, checked, notes: notes || undefined,
      })),
      notes: notes || undefined,
    });
  };

  // Group items by category
  const categories = Array.from(new Set(checkItems.map(item => item.category)));

  const isAlreadyCompleted = !!existingCheck;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Teamleitercheck – Arbeitsbeginn
            <HelpTooltip
              content={HELP_TEXTS.teamleitercheck.text}
              helpTextKey="teamleitercheck"
            />
          </DialogTitle>
          <DialogDescription>
            Alle Punkte müssen abgehakt werden, bevor die Arbeit beginnen kann.
          </DialogDescription>
        </DialogHeader>

        {isAlreadyCompleted && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Check bereits abgeschlossen
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                am {existingCheck.completedAt ? new Date(existingCheck.completedAt).toLocaleString("de-DE") : "–"}
              </p>
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 p-1">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {checkedCount}/{checkItems.length}
              </span>
            </div>

            {/* Checklist by category */}
            {categories.map(category => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </h4>
                {checkItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        item.checked
                          ? "bg-green-50 dark:bg-green-950/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={isAlreadyCompleted}
                      />
                      <span className={`text-sm ${item.checked ? "text-green-700 dark:text-green-300" : ""}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
              </div>
            ))}

            {/* Notes */}
            {!isAlreadyCompleted && (
              <div className="space-y-2">
                <Label htmlFor="check-notes">Anmerkungen (optional)</Label>
                <Textarea
                  id="check-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Besonderheiten, Abweichungen, Hinweise..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
          {!isAlreadyCompleted && (
            <Button
              onClick={handleSubmit}
              disabled={!allChecked || submitting}
              className="ff-button"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {allChecked ? "Check bestätigen" : `Noch ${checkItems.length - checkedCount} Punkte offen`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// WORKFLOW PROGRESS BAR
// ============================================

function GateProgressBar({ gateStatus }: { gateStatus: GateStatus }) {
  const gates = [
    {
      label: "Vorher-Doku",
      status: gateStatus.vorherDoku.status,
      icon: Camera,
      detail: `${gateStatus.vorherDoku.photoCount} Fotos`,
    },
    {
      label: "Teamleitercheck",
      status: gateStatus.teamleiterCheck.status,
      icon: ClipboardCheck,
      detail: gateStatus.teamleiterCheck.status === "completed" ? "Erledigt" : "Ausstehend",
    },
    {
      label: "Nachher-Doku",
      status: gateStatus.nachherDoku.status,
      icon: Camera,
      detail: `${gateStatus.nachherDoku.photoCount} Fotos`,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-amber-500";
      default: return "bg-muted-foreground/30";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "completed": return "border-green-500 bg-green-50 dark:bg-green-950/30";
      case "in_progress": return "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
      default: return "border-muted-foreground/30 bg-muted/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in_progress": return <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const completedCount = gates.filter(g => g.status === "completed").length;

  return (
    <div className="space-y-3">
      {/* Overall Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Gate-Fortschritt
        </span>
        <Badge
          variant="outline"
          className={
            completedCount === 3
              ? "bg-green-100 text-green-800 border-green-300"
              : completedCount > 0
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : ""
          }
        >
          {completedCount}/3 Gates erledigt
        </Badge>
      </div>

      {/* Step Indicators with Connecting Lines */}
      <div className="flex items-center">
        {gates.map((gate, index) => (
          <div key={gate.label} className="flex items-center flex-1">
            {/* Gate Step */}
            <div className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 flex-1 transition-all ${getStatusBorder(gate.status)}`}>
              <gate.icon className={`w-4 h-4 shrink-0 ${
                gate.status === "completed" ? "text-green-600" :
                gate.status === "in_progress" ? "text-amber-600" : "text-muted-foreground/50"
              }`} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{gate.label}</p>
                <p className="text-xs text-muted-foreground">{gate.detail}</p>
              </div>
              {getStatusIcon(gate.status)}
            </div>

            {/* Connecting Arrow */}
            {index < gates.length - 1 && (
              <div className="px-1 shrink-0">
                <ChevronRight className={`w-4 h-4 ${
                  gates[index].status === "completed" ? "text-green-500" : "text-muted-foreground/30"
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
        {gates.map((gate, index) => (
          <div
            key={gate.label}
            className={`flex-1 transition-all duration-500 ${getStatusColor(gate.status)} ${
              index > 0 ? "ml-0.5" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT: GATE INTERACTION
// ============================================

export default function GateInteraction({
  constructionSiteId,
  projectId,
  siteStatus,
  siteName,
}: GateInteractionProps) {
  const [vorherDialogOpen, setVorherDialogOpen] = useState(false);
  const [teamleiterDialogOpen, setTeamleiterDialogOpen] = useState(false);
  const [nachherDialogOpen, setNachherDialogOpen] = useState(false);

  const { data: gateStatus, refetch: refetchGateStatus } = trpc.gate.getGateStatus.useQuery(
    { constructionSiteId },
    { enabled: !!constructionSiteId }
  );

  const handleGateComplete = () => {
    refetchGateStatus();
  };

  if (!gateStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflow Progress Bar */}
      <GateProgressBar gateStatus={gateStatus} />

      {/* Clickable Gate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gate 1: Vorher-Dokumentation */}
        <button
          className={`rounded-lg border-2 p-4 space-y-2 text-left transition-all hover:shadow-md cursor-pointer ${
            gateStatus.vorherDoku.status === "completed"
              ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
              : gateStatus.vorherDoku.status === "in_progress"
                ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                : "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 hover:border-primary"
          }`}
          onClick={() => setVorherDialogOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className={`w-5 h-5 ${
                gateStatus.vorherDoku.status === "completed" ? "text-green-600" : "text-amber-600"
              }`} />
              <span className="font-medium text-sm">Vorher-Dokumentation</span>
              <HelpTooltip
                content={HELP_TEXTS.vorherDokuGate.text}
                helpTextKey="vorherDokuGate"
              />
            </div>
            {gateStatus.vorherDoku.status === "completed" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {gateStatus.vorherDoku.status === "completed"
              ? `${gateStatus.vorherDoku.photoCount} Fotos dokumentiert`
              : gateStatus.vorherDoku.photoCount > 0
                ? `${gateStatus.vorherDoku.photoCount} Fotos – noch nicht abgeschlossen`
                : "Fotos müssen vor Baustart gemacht werden"}
          </p>
          {gateStatus.vorherDoku.status !== "completed" && (
            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
              <Upload className="w-3 h-3 mr-1" />
              Klicken zum Hochladen
            </Badge>
          )}
          {gateStatus.vorherDoku.status === "completed" && gateStatus.vorherDoku.completedAt && (
            <p className="text-xs text-green-600">
              Abgeschlossen am {new Date(gateStatus.vorherDoku.completedAt).toLocaleDateString("de-DE")}
            </p>
          )}
        </button>

        {/* Gate 2: Teamleitercheck */}
        <button
          className={`rounded-lg border-2 p-4 space-y-2 text-left transition-all hover:shadow-md cursor-pointer ${
            gateStatus.teamleiterCheck.status === "completed"
              ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
              : "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 hover:border-primary"
          }`}
          onClick={() => setTeamleiterDialogOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className={`w-5 h-5 ${
                gateStatus.teamleiterCheck.status === "completed" ? "text-green-600" : "text-amber-600"
              }`} />
              <span className="font-medium text-sm">Teamleitercheck</span>
              <HelpTooltip
                content={HELP_TEXTS.teamleitercheck.text}
                helpTextKey="teamleitercheck"
              />
            </div>
            {gateStatus.teamleiterCheck.status === "completed" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {gateStatus.teamleiterCheck.status === "completed"
              ? "Sicherheitscheck wurde durchgeführt"
              : "Sicherheits-Checkliste vor Arbeitsbeginn"}
          </p>
          {gateStatus.teamleiterCheck.status !== "completed" && (
            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
              <ClipboardCheck className="w-3 h-3 mr-1" />
              Klicken zum Abhaken
            </Badge>
          )}
          {gateStatus.teamleiterCheck.status === "completed" && gateStatus.teamleiterCheck.completedAt && (
            <p className="text-xs text-green-600">
              Abgeschlossen am {new Date(gateStatus.teamleiterCheck.completedAt).toLocaleDateString("de-DE")}
            </p>
          )}
        </button>

        {/* Gate 3: Nachher-Dokumentation */}
        <button
          className={`rounded-lg border-2 p-4 space-y-2 text-left transition-all hover:shadow-md cursor-pointer ${
            gateStatus.nachherDoku.status === "completed"
              ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
              : siteStatus === "aktiv" || siteStatus === "abgeschlossen"
                ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 hover:border-primary"
                : "border-gray-200 bg-muted/30 opacity-60"
          }`}
          onClick={() => {
            if (siteStatus === "aktiv" || siteStatus === "abgeschlossen") {
              setNachherDialogOpen(true);
            } else {
              toast.info("Nachher-Dokumentation wird erst nach Arbeitsbeginn freigeschaltet.");
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className={`w-5 h-5 ${
                gateStatus.nachherDoku.status === "completed"
                  ? "text-green-600"
                  : siteStatus === "aktiv" || siteStatus === "abgeschlossen"
                    ? "text-amber-600"
                    : "text-muted-foreground"
              }`} />
              <span className="font-medium text-sm">Nachher-Dokumentation</span>
              <HelpTooltip
                content={HELP_TEXTS.nachherDokuGate.text}
                helpTextKey="nachherDokuGate"
              />
            </div>
            {gateStatus.nachherDoku.status === "completed" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {gateStatus.nachherDoku.status === "completed"
              ? `${gateStatus.nachherDoku.photoCount} Fotos dokumentiert`
              : siteStatus === "aktiv"
                ? "Wird nach Fertigstellung fällig"
                : "Wird nach Arbeitsbeginn freigeschaltet"}
          </p>
          {gateStatus.nachherDoku.status === "completed" && gateStatus.nachherDoku.completedAt && (
            <p className="text-xs text-green-600">
              Abgeschlossen am {new Date(gateStatus.nachherDoku.completedAt).toLocaleDateString("de-DE")}
            </p>
          )}
          {siteStatus === "aktiv" && gateStatus.nachherDoku.status !== "completed" && (
            <Badge variant="outline" className="text-xs">
              Wird benötigt vor Abnahme
            </Badge>
          )}
        </button>
      </div>

      {/* Dialogs */}
      <PhotoUploadDialog
        open={vorherDialogOpen}
        onOpenChange={setVorherDialogOpen}
        constructionSiteId={constructionSiteId}
        gateType="vorher"
        siteName={siteName}
        onComplete={handleGateComplete}
      />

      <TeamleiterCheckDialog
        open={teamleiterDialogOpen}
        onOpenChange={setTeamleiterDialogOpen}
        constructionSiteId={constructionSiteId}
        projectId={projectId}
        onComplete={handleGateComplete}
      />

      <PhotoUploadDialog
        open={nachherDialogOpen}
        onOpenChange={setNachherDialogOpen}
        constructionSiteId={constructionSiteId}
        gateType="nachher"
        siteName={siteName}
        onComplete={handleGateComplete}
      />
    </div>
  );
}
