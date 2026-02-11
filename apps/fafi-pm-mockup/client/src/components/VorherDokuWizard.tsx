/**
 * Vorher-Dokumentation Wizard (v7.0b)
 * 
 * Pflicht vor Baustellenstart:
 * - Pro Gebäudeseite: Pflicht-Übersichtsfoto + optionale Schadensfotos
 * - Beschreibungstext pro Foto automatisch vorausgefüllt (Kontext: "Vorher")
 * - Zusammenfassung mit allen Fotos vor Abschluss
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, AlertTriangle,
  Building2, ChevronRight, Image as ImageIcon, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import FotoUpload, { PhotoUploadResult } from "@/components/FotoUpload";

interface VorherDokuWizardProps {
  isOpen: boolean;
  onClose: () => void;
  constructionSiteId: number;
  constructionSiteName: string;
  projectId: number;
  companyName?: string;
  address?: string;
  onComplete?: () => void;
}

interface SideDocumentation {
  key: string;
  label: string;
  photos: PhotoUploadResult[];
  notes: string;
  completed: boolean;
}

const SIDES = [
  { key: "front", label: "Frontseite", side: "front" as const },
  { key: "back", label: "Rückseite", side: "back" as const },
  { key: "left_gable", label: "Linker Giebel", side: "left_gable" as const },
  { key: "right_gable", label: "Rechter Giebel", side: "right_gable" as const },
];

export default function VorherDokuWizard({
  isOpen,
  onClose,
  constructionSiteId,
  constructionSiteName,
  projectId,
  companyName,
  address,
  onComplete,
}: VorherDokuWizardProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-4 = sides, 5 = summary
  const [sidesDocs, setSidesDocs] = useState<SideDocumentation[]>(
    SIDES.map(s => ({ key: s.key, label: s.label, photos: [], notes: "", completed: false }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const updateSiteMutation = trpc.constructionSite.update.useMutation();

  const totalPhotos = sidesDocs.reduce((sum, s) => sum + s.photos.length, 0);
  const completedSides = sidesDocs.filter(s => s.photos.length >= 1).length;
  const allSidesHavePhotos = completedSides === SIDES.length;
  const progressPercent = (completedSides / SIDES.length) * 100;

  const updateSidePhotos = (sideIndex: number, photos: PhotoUploadResult[]) => {
    setSidesDocs(prev => prev.map((s, i) => 
      i === sideIndex ? { ...s, photos, completed: photos.length >= 1 } : s
    ));
  };

  const updateSideNotes = (sideIndex: number, notes: string) => {
    setSidesDocs(prev => prev.map((s, i) => 
      i === sideIndex ? { ...s, notes } : s
    ));
  };

  const handleComplete = async () => {
    if (!allSidesHavePhotos) {
      toast.error("Bitte laden Sie mindestens ein Foto pro Gebäudeseite hoch.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSiteMutation.mutateAsync({
        id: constructionSiteId,
        preDocumentationStatus: "completed",
        preDocumentationCompletedAt: new Date(),
      });
      
      utils.constructionSite.invalidate();
      toast.success("Vorher-Dokumentation abgeschlossen", {
        description: `${totalPhotos} Fotos dokumentiert. Baustellenstart ist jetzt möglich.`,
      });
      onComplete?.();
      onClose();
    } catch (error) {
      toast.error("Fehler beim Abschließen der Vorher-Dokumentation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSideIndex = currentStep - 1;
  const isIntro = currentStep === 0;
  const isSummary = currentStep === SIDES.length + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-500" />
            Vorher-Dokumentation
          </DialogTitle>
          <DialogDescription>
            {constructionSiteName} – {address || "Adresse nicht angegeben"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span>{completedSides}/{SIDES.length} Seiten dokumentiert</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step: Intro */}
        {isIntro && (
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Pflichtdokumentation vor Baustellenstart</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Bevor die Baustelle gestartet werden kann, müssen alle Gebäudeseiten fotografisch dokumentiert werden.
                      Dies dient der Beweissicherung und dem Vergleich nach Abschluss der Arbeiten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-medium">Folgende Seiten müssen dokumentiert werden:</p>
              {SIDES.map((side, idx) => (
                <div key={side.key} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{side.label}</p>
                    <p className="text-xs text-muted-foreground">Mindestens 1 Übersichtsfoto erforderlich</p>
                  </div>
                  {sidesDocs[idx].photos.length > 0 ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {sidesDocs[idx].photos.length} Fotos
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Ausstehend</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps: Side Documentation */}
        {!isIntro && !isSummary && currentSideIndex >= 0 && currentSideIndex < SIDES.length && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{SIDES[currentSideIndex].label}</h3>
              <Badge variant="outline" className="ml-auto">
                Schritt {currentStep} von {SIDES.length}
              </Badge>
            </div>

            <FotoUpload
              context="vorher_dokumentation"
              side={SIDES[currentSideIndex].side}
              constructionSiteId={constructionSiteId}
              projectId={projectId}
              companyName={companyName}
              address={address}
              maxPhotos={10}
              required={true}
              showCategoryInput={true}
              label={`Fotos ${SIDES[currentSideIndex].label}`}
              description="Mindestens 1 Übersichtsfoto. Zusätzliche Detailfotos von Schäden oder Besonderheiten empfohlen."
              existingPhotos={sidesDocs[currentSideIndex].photos}
              onPhotosChange={(photos) => updateSidePhotos(currentSideIndex, photos)}
            />

            <div>
              <Label className="text-sm font-medium">Anmerkungen (optional)</Label>
              <Textarea
                placeholder="Besondere Merkmale, vorhandene Schäden, Verschmutzungsgrad..."
                value={sidesDocs[currentSideIndex].notes}
                onChange={(e) => updateSideNotes(currentSideIndex, e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step: Summary */}
        {isSummary && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Zusammenfassung</h3>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{totalPhotos}</p>
                    <p className="text-sm text-muted-foreground">Fotos gesamt</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedSides}/{SIDES.length}</p>
                    <p className="text-sm text-muted-foreground">Seiten dokumentiert</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sidesDocs.map((side, idx) => (
              <div key={side.key} className="flex items-center gap-3 p-3 rounded-lg border">
                {side.photos.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{side.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {side.photos.length} Foto(s){side.notes ? " • Anmerkungen vorhanden" : ""}
                  </p>
                </div>
                {side.photos.length > 0 && side.photos[0] && (
                  <img
                    src={side.photos[0].thumbnailUrl || side.photos[0].url}
                    alt={side.label}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(idx + 1)}
                >
                  Bearbeiten
                </Button>
              </div>
            ))}

            {!allSidesHavePhotos && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Nicht alle Seiten haben mindestens ein Foto. Bitte vervollständigen Sie die Dokumentation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) onClose();
              else setCurrentStep(prev => prev - 1);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Abbrechen" : "Zurück"}
          </Button>

          {isSummary ? (
            <Button
              onClick={handleComplete}
              disabled={!allSidesHavePhotos || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Dokumentation abschließen
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Weiter
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
