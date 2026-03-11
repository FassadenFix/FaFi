/**
 * Nachher-Dokumentation Wizard (v7.0d)
 * 
 * - Pro Gebäudeseite: Pflicht-Übersichtsfoto
 * - Automatische Dateibenennung mit Kontext "Nachher"
 * - Verknüpfung mit Vorher-Fotos für Vergleich
 * - Vorher/Nachher-Vergleichsansicht
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, AlertTriangle,
  Building2, Loader2, ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import FotoUpload, { PhotoUploadResult } from "@/components/FotoUpload";

interface NachherDokuWizardProps {
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
}

const SIDES = [
  { key: "front", label: "Frontseite", side: "front" as const },
  { key: "back", label: "Rückseite", side: "back" as const },
  { key: "left_gable", label: "Linker Giebel", side: "left_gable" as const },
  { key: "right_gable", label: "Rechter Giebel", side: "right_gable" as const },
];

export default function NachherDokuWizard({
  isOpen, onClose, constructionSiteId, constructionSiteName,
  projectId, companyName, address, onComplete,
}: NachherDokuWizardProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-4 = sides, 5 = comparison, 6 = summary
  const [sidesDocs, setSidesDocs] = useState<SideDocumentation[]>(
    SIDES.map(s => ({ key: s.key, label: s.label, photos: [], notes: "" }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  const utils = trpc.useUtils();
  const updateSiteMutation = trpc.constructionSite.update.useMutation();

  // Lade Vorher-Fotos für Vergleich
  const { data: vorherPhotos = [] } = trpc.photo.list.useQuery({
    constructionSiteId,
    context: "vorher_dokumentation",
  });

  const totalPhotos = sidesDocs.reduce((sum, s) => sum + s.photos.length, 0);
  const completedSides = sidesDocs.filter(s => s.photos.length >= 1).length;
  const allSidesHavePhotos = completedSides === SIDES.length;
  const progressPercent = (completedSides / SIDES.length) * 100;

  const updateSidePhotos = (sideIndex: number, photos: PhotoUploadResult[]) => {
    setSidesDocs(prev => prev.map((s, i) => i === sideIndex ? { ...s, photos } : s));
  };

  const updateSideNotes = (sideIndex: number, notes: string) => {
    setSidesDocs(prev => prev.map((s, i) => i === sideIndex ? { ...s, notes } : s));
  };

  // Vorher-Fotos nach Seite gruppieren
  const vorherPhotosBySide = useMemo(() => {
    const map: Record<string, any[]> = {};
    vorherPhotos.forEach((p: any) => {
      if (p.side) {
        if (!map[p.side]) map[p.side] = [];
        map[p.side].push(p);
      }
    });
    return map;
  }, [vorherPhotos]);

  const handleComplete = async () => {
    if (!allSidesHavePhotos) {
      toast.error("Bitte laden Sie mindestens ein Foto pro Gebäudeseite hoch.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSiteMutation.mutateAsync({
        id: constructionSiteId,
        postDocumentationStatus: "completed",
        postDocumentationCompletedAt: new Date(),
      });

      utils.constructionSite.invalidate();
      toast.success("Nachher-Dokumentation abgeschlossen", {
        description: `${totalPhotos} Fotos dokumentiert. Abnahme kann gestartet werden.`,
      });
      onComplete?.();
      onClose();
    } catch (error) {
      toast.error("Fehler beim Abschließen der Nachher-Dokumentation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIntro = currentStep === 0;
  const isComparison = currentStep === SIDES.length + 1;
  const isSummary = currentStep === SIDES.length + 2;
  const currentSideIndex = currentStep - 1;
  const totalSteps = SIDES.length + 2; // sides + comparison + summary

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-green-500" />
            Nachher-Dokumentation
          </DialogTitle>
          <DialogDescription>
            {constructionSiteName} – {address || "Adresse nicht angegeben"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span>{completedSides}/{SIDES.length} Seiten dokumentiert</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Intro */}
        {isIntro && (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Nachher-Dokumentation</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Dokumentieren Sie das Ergebnis der Arbeiten. Alle Gebäudeseiten müssen fotografiert werden.
                      Im Anschluss können Sie die Vorher/Nachher-Fotos vergleichen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {SIDES.map((side, idx) => (
                <div key={side.key} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{side.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {vorherPhotosBySide[side.key]?.length || 0} Vorher-Foto(s) vorhanden
                    </p>
                  </div>
                  {sidesDocs[idx].photos.length > 0 ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {sidesDocs[idx].photos.length} Fotos
                    </Badge>
                  ) : (
                    <Badge variant="outline">Ausstehend</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side Documentation */}
        {!isIntro && !isComparison && !isSummary && currentSideIndex >= 0 && currentSideIndex < SIDES.length && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{SIDES[currentSideIndex].label}</h3>
              <Badge variant="outline" className="ml-auto">
                Schritt {currentStep} von {totalSteps}
              </Badge>
            </div>

            {/* Vorher-Foto Referenz */}
            {vorherPhotosBySide[SIDES[currentSideIndex].key]?.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Vorher-Referenz:</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {vorherPhotosBySide[SIDES[currentSideIndex].key].map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.thumbnailUrl || photo.url}
                        alt="Vorher"
                        className="w-20 h-20 rounded object-cover flex-shrink-0 border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <FotoUpload
              context="nachher_dokumentation"
              side={SIDES[currentSideIndex].side}
              constructionSiteId={constructionSiteId}
              projectId={projectId}
              companyName={companyName}
              address={address}
              maxPhotos={10}
              required={true}
              label={`Nachher-Fotos ${SIDES[currentSideIndex].label}`}
              description="Mindestens 1 Übersichtsfoto des Ergebnisses."
              existingPhotos={sidesDocs[currentSideIndex].photos}
              onPhotosChange={(photos) => updateSidePhotos(currentSideIndex, photos)}
            />

            <div>
              <Label className="text-sm font-medium">Anmerkungen (optional)</Label>
              <Textarea
                placeholder="Ergebnis, besondere Stellen, Restarbeiten..."
                value={sidesDocs[currentSideIndex].notes}
                onChange={(e) => updateSideNotes(currentSideIndex, e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Vorher/Nachher Vergleich */}
        {isComparison && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Vorher / Nachher Vergleich</h3>
            </div>

            {SIDES.map((side, idx) => {
              const vorherPhoto = vorherPhotosBySide[side.key]?.[0];
              const nachherPhoto = sidesDocs[idx].photos[0];

              if (!vorherPhoto && !nachherPhoto) return null;

              return (
                <Card key={side.key}>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-3">{side.label}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 text-center">Vorher</p>
                        {vorherPhoto ? (
                          <img
                            src={vorherPhoto.thumbnailUrl || vorherPhoto.url}
                            alt="Vorher"
                            className="w-full h-40 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-full h-40 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            Kein Foto
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 text-center">Nachher</p>
                        {nachherPhoto ? (
                          <img
                            src={nachherPhoto.thumbnailUrl || nachherPhoto.url}
                            alt="Nachher"
                            className="w-full h-40 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-full h-40 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            Kein Foto
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
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
                    <p className="text-sm text-muted-foreground">Nachher-Fotos</p>
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
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(idx + 1)}>
                  Bearbeiten
                </Button>
              </div>
            ))}

            {!allSidesHavePhotos && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Nicht alle Seiten dokumentiert.
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
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Wird gespeichert...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" />Dokumentation abschließen</>
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
