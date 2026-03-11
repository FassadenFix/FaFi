/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Angebot Positionen Step - Auswahl von Bühnentyp und Reinigungsmittel pro Seite
 * - Pro Immobilie: Übernachtung, Baustelleneinrichtung
 * - Pro Seite: Bühnentyp, Reinigungsmittel (individuell wegen unterschiedlicher Anforderungen)
 * - Vorauswahl basierend auf Objektaufnahme, manuell anpassbar
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Info,
  MapPin,
  Ruler,
  Truck,
  Droplets,
  AlertTriangle,
  Moon,
  Wrench,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RequiredLabel, RequiredFieldHint } from "@/components/Wizard";
import type { ImmobilieAusObjektaufnahme, SeiteAusObjektaufnahme } from "./ProjektZuordnungStep";
import {
  useLibraryEquipment,
  useLibraryCleaningAgents,
  getBuehnenVorauswahlFromLibrary,
  getReinigungsmittelVorauswahlFromLibrary,
  type BuehnenOption,
  type ReinigungsmittelOption,
} from "@/hooks/useLibrary";

// ============================================
// TYPES
// ============================================

// BuehnenOption und ReinigungsmittelOption kommen aus useLibrary

export interface SeitePosition {
  seiteName: string;
  buehnentyp: string;
  reinigungsmittel: string;
  flaeche: number;
  hoehe: number;
  abweichungVonStandard: boolean;
  hinweis?: string;
}

export interface ImmobiliePosition {
  immobilieId: string;
  adresse: string;
  uebernachtung: boolean;
  uebernachtungNaechte: number;
  baustelleneinrichtung: boolean;
  seiten: SeitePosition[];
}

export interface PositionenConfig {
  immobilien: ImmobiliePosition[];
}

interface AngebotPositionenStepProps {
  immobilien: ImmobilieAusObjektaufnahme[];
  config: PositionenConfig;
  setConfig: (config: PositionenConfig) => void;
  entfernungKm: number;
}

// ============================================
// CONSTANTS (Re-exportiert aus useLibrary für Abwärtskompatibilität)
// ============================================

// BUEHNEN_OPTIONEN und REINIGUNGSMITTEL_OPTIONEN kommen jetzt aus der Bibliothek
// Typen werden oben importiert und unten re-exportiert

// ============================================
// HELPER FUNCTIONS
// ============================================

// getBuehnenVorauswahl und getReinigungsmittelVorauswahl kommen jetzt aus useLibrary
// Lokale Wrapper die die Bibliothek-Daten verwenden werden in der Komponente erstellt

function berechneUebernachtungVorauswahl(entfernungKm: number, buehnenTage: number): { erforderlich: boolean; naechte: number } {
  if (entfernungKm > 100) {
    return { erforderlich: true, naechte: buehnenTage };
  }
  if (entfernungKm > 50 && buehnenTage > 1) {
    return { erforderlich: true, naechte: buehnenTage - 1 };
  }
  return { erforderlich: false, naechte: 0 };
}

// ============================================
// COMPONENT
// ============================================

export default function AngebotPositionenStep({
  immobilien,
  config,
  setConfig,
  entfernungKm,
}: AngebotPositionenStepProps) {
  // Bibliothek-Daten laden
  const { buehnenOptionen: BUEHNEN_OPTIONEN } = useLibraryEquipment();
  const { reinigungsmittelOptionen: REINIGUNGSMITTEL_OPTIONEN } = useLibraryCleaningAgents();
  
  // Initialisiere Config wenn leer
  useEffect(() => {
    if (config.immobilien.length === 0 && immobilien.length > 0) {
      const initialConfig: ImmobiliePosition[] = immobilien.map(immo => {
        const reinigbareSeiten = immo.seiten.filter(s => s.reinigungsfaehig);
        const gesamtflaeche = reinigbareSeiten.reduce((sum, s) => sum + s.flaeche, 0);
        const buehnenTage = Math.ceil(gesamtflaeche / 500);
        const uebernachtung = berechneUebernachtungVorauswahl(entfernungKm, buehnenTage);
        
        return {
          immobilieId: immo.id,
          adresse: immo.adresse,
          uebernachtung: uebernachtung.erforderlich,
          uebernachtungNaechte: uebernachtung.naechte,
          baustelleneinrichtung: true, // Standard: immer Baustelleneinrichtung
          seiten: reinigbareSeiten.map(seite => {
            const hoehe = seite.hoehe || immo.maxHoehe || 15;
            const buehnenVorauswahl = seite.buehnentyp 
              ? BUEHNEN_OPTIONEN.find(b => seite.buehnentyp?.toLowerCase().includes(b.name.toLowerCase().split(" ")[0]))?.id || getBuehnenVorauswahlFromLibrary(hoehe, BUEHNEN_OPTIONEN)
              : getBuehnenVorauswahlFromLibrary(hoehe, BUEHNEN_OPTIONEN);
            const reinigungsmittelVorauswahl = seite.reinigungsmittel
              ? REINIGUNGSMITTEL_OPTIONEN.find(r => seite.reinigungsmittel?.toLowerCase().includes(r.name.toLowerCase().split(" ")[1]))?.id || getReinigungsmittelVorauswahlFromLibrary(seite.fassadenart, seite.besonderheiten, REINIGUNGSMITTEL_OPTIONEN)
              : getReinigungsmittelVorauswahlFromLibrary(seite.fassadenart, seite.besonderheiten, REINIGUNGSMITTEL_OPTIONEN);
            
            return {
              seiteName: seite.name,
              buehnentyp: buehnenVorauswahl,
              reinigungsmittel: reinigungsmittelVorauswahl,
              flaeche: seite.flaeche,
              hoehe: hoehe,
              abweichungVonStandard: false,
            };
          }),
        };
      });
      
      setConfig({ immobilien: initialConfig });
    }
  }, [immobilien, config.immobilien.length, entfernungKm, BUEHNEN_OPTIONEN, REINIGUNGSMITTEL_OPTIONEN]);

  // Update Immobilie
  const updateImmobilie = (immobilieId: string, updates: Partial<ImmobiliePosition>) => {
    setConfig({
      immobilien: config.immobilien.map(immo =>
        immo.immobilieId === immobilieId ? { ...immo, ...updates } : immo
      ),
    });
  };

  // Update Seite
  const updateSeite = (immobilieId: string, seiteName: string, updates: Partial<SeitePosition>) => {
    setConfig({
      immobilien: config.immobilien.map(immo =>
        immo.immobilieId === immobilieId
          ? {
              ...immo,
              seiten: immo.seiten.map(seite =>
                seite.seiteName === seiteName ? { ...seite, ...updates } : seite
              ),
            }
          : immo
      ),
    });
  };

  // Gesamtkosten berechnen
  const gesamtKosten = useMemo(() => {
    let buehnenKosten = 0;
    let reinigungsmittelKosten = 0;
    let uebernachtungKosten = 0;
    let baustelleneinrichtungKosten = 0;
    
    config.immobilien.forEach(immo => {
      if (immo.uebernachtung) {
        uebernachtungKosten += immo.uebernachtungNaechte * 85; // 85€ pro Nacht
      }
      if (immo.baustelleneinrichtung) {
        baustelleneinrichtungKosten += 199; // Pauschale
      }
      
      immo.seiten.forEach(seite => {
        const buehne = BUEHNEN_OPTIONEN.find(b => b.id === seite.buehnentyp);
        const reinigungsmittel = REINIGUNGSMITTEL_OPTIONEN.find(r => r.id === seite.reinigungsmittel);
        
        if (buehne) {
          const tage = Math.ceil(seite.flaeche / 500);
          buehnenKosten += tage * buehne.preisProTag;
        }
        if (reinigungsmittel) {
          // Ca. 0.1 Liter pro m²
          reinigungsmittelKosten += seite.flaeche * 0.1 * reinigungsmittel.preisProLiter;
        }
      });
    });
    
    return {
      buehnen: Math.round(buehnenKosten),
      reinigungsmittel: Math.round(reinigungsmittelKosten),
      uebernachtung: Math.round(uebernachtungKosten),
      baustelleneinrichtung: Math.round(baustelleneinrichtungKosten),
      gesamt: Math.round(buehnenKosten + reinigungsmittelKosten + uebernachtungKosten + baustelleneinrichtungKosten),
    };
  }, [config]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-primary">Schritt 2 von 7: Angebotspositionen</p>
              <p className="text-sm text-muted-foreground">
                Wähle Bühnentyp und Reinigungsmittel pro Seite. Übernachtung und Baustelleneinrichtung gelten pro Immobilie.
                Die Vorauswahl basiert auf der Objektaufnahme, kann aber angepasst werden.
              </p>
            </div>
          </div>
        </div>

        {/* Immobilien mit Positionen */}
        <Accordion type="multiple" defaultValue={config.immobilien.map(i => i.immobilieId)} className="space-y-4">
          {config.immobilien.map((immoConfig) => {
            const immoData = immobilien.find(i => i.id === immoConfig.immobilieId);
            const gesamtflaeche = immoConfig.seiten.reduce((sum, s) => sum + s.flaeche, 0);
            
            return (
              <AccordionItem
                key={immoConfig.immobilieId}
                value={immoConfig.immobilieId}
                className="rounded-xl border-2 border-muted overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{immoConfig.adresse}</div>
                        <div className="text-xs text-muted-foreground">
                          {immoConfig.seiten.length} Seiten · {gesamtflaeche.toLocaleString("de-DE")} m²
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {immoConfig.uebernachtung && (
                        <Badge variant="secondary" className="text-xs">
                          <Moon className="w-3 h-3 mr-1" />
                          {immoConfig.uebernachtungNaechte} Nächte
                        </Badge>
                      )}
                      {immoConfig.baustelleneinrichtung && (
                        <Badge variant="outline" className="text-xs">
                          <Wrench className="w-3 h-3 mr-1" />
                          BE
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  {/* Immobilie-Level Optionen */}
                  <Card className="mb-4 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4 text-primary" />
                        Optionen für gesamte Immobilie
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Übernachtung */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                          <Checkbox
                            id={`uebernachtung-${immoConfig.immobilieId}`}
                            checked={immoConfig.uebernachtung}
                            onCheckedChange={(checked) => updateImmobilie(immoConfig.immobilieId, { 
                              uebernachtung: !!checked,
                              uebernachtungNaechte: checked ? Math.max(1, immoConfig.uebernachtungNaechte) : 0,
                            })}
                          />
                          <div className="flex-1">
                            <label htmlFor={`uebernachtung-${immoConfig.immobilieId}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              Übernachtung
                            </label>
                            {immoConfig.uebernachtung && (
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={immoConfig.uebernachtungNaechte}
                                  onChange={(e) => updateImmobilie(immoConfig.immobilieId, { 
                                    uebernachtungNaechte: parseInt(e.target.value) || 1 
                                  })}
                                  className="w-20 h-8"
                                />
                                <span className="text-xs text-muted-foreground">Nächte × 85 €</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Entfernung: {entfernungKm} km
                              {entfernungKm > 100 
                                ? <span className="text-amber-600 font-medium"> → Automatisch vorgeschlagen (&gt;100 km)</span>
                                : entfernungKm > 50 
                                  ? <span className="text-amber-600"> → Empfohlen bei &gt;1 Arbeitstag (&gt;50 km)</span>
                                  : " (nicht erforderlich)"
                              }
                            </p>
                          </div>
                        </div>

                        {/* Baustelleneinrichtung */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                          <Checkbox
                            id={`be-${immoConfig.immobilieId}`}
                            checked={immoConfig.baustelleneinrichtung}
                            onCheckedChange={(checked) => updateImmobilie(immoConfig.immobilieId, { 
                              baustelleneinrichtung: !!checked 
                            })}
                          />
                          <div className="flex-1">
                            <label htmlFor={`be-${immoConfig.immobilieId}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                              <Wrench className="w-4 h-4" />
                              Baustelleneinrichtung
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Pauschale: 199 € (Absperrung, Schilder, etc.)
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seiten-Level Optionen */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-primary" />
                      Positionen pro Seite
                    </div>
                    
                    {immoConfig.seiten.map((seiteConfig) => {
                      const seiteData = immoData?.seiten.find(s => s.name === seiteConfig.seiteName);
                      const buehne = BUEHNEN_OPTIONEN.find(b => b.id === seiteConfig.buehnentyp);
                      const reinigungsmittel = REINIGUNGSMITTEL_OPTIONEN.find(r => r.id === seiteConfig.reinigungsmittel);
                      
                      // Prüfe ob Abweichung von Standard
                      const standardBuehne = getBuehnenVorauswahlFromLibrary(seiteConfig.hoehe, BUEHNEN_OPTIONEN);
                      const standardReinigungsmittel = getReinigungsmittelVorauswahlFromLibrary(
                        seiteData?.fassadenart || "", 
                        seiteData?.besonderheiten || [],
                        REINIGUNGSMITTEL_OPTIONEN
                      );
                      const hatAbweichung = seiteConfig.buehnentyp !== standardBuehne || 
                                           seiteConfig.reinigungsmittel !== standardReinigungsmittel;
                      
                      return (
                        <Card 
                          key={seiteConfig.seiteName} 
                          className={cn(
                            "transition-all",
                            hatAbweichung && "border-amber-300 bg-amber-50/30"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {seiteConfig.seiteName}
                                  {hatAbweichung && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          Angepasst
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Abweichung von der Standardauswahl</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                  <span>{seiteConfig.flaeche} m²</span>
                                  <span>·</span>
                                  <span>Höhe: {seiteConfig.hoehe}m</span>
                                  {seiteData && (
                                    <>
                                      <span>·</span>
                                      <span>{seiteData.fassadenart}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Bühnentyp */}
                              <div>
                                <Label className="text-xs mb-1.5 flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  Bühnentyp
                                </Label>
                                <Select
                                  value={seiteConfig.buehnentyp}
                                  onValueChange={(value) => updateSeite(
                                    immoConfig.immobilieId, 
                                    seiteConfig.seiteName, 
                                    { buehnentyp: value }
                                  )}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BUEHNEN_OPTIONEN.map((option) => (
                                      <SelectItem key={option.id} value={option.id}>
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <span>{option.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            bis {option.maxHoehe}m · {option.preisProTag}€/Tag
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {buehne && seiteConfig.hoehe > buehne.maxHoehe && (
                                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Höhe überschreitet Bühnenreichweite!
                                  </p>
                                )}
                                {seiteConfig.hoehe <= 8 && seiteConfig.buehnentyp !== "teleskoplanze" && (
                                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Teleskoplanzen wären hier möglich (günstiger)
                                  </p>
                                )}
                              </div>

                              {/* Reinigungsmittel */}
                              <div>
                                <Label className="text-xs mb-1.5 flex items-center gap-1">
                                  <Droplets className="w-3 h-3" />
                                  Reinigungsmittel
                                </Label>
                                <Select
                                  value={seiteConfig.reinigungsmittel}
                                  onValueChange={(value) => updateSeite(
                                    immoConfig.immobilieId, 
                                    seiteConfig.seiteName, 
                                    { reinigungsmittel: value }
                                  )}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {REINIGUNGSMITTEL_OPTIONEN.map((option) => (
                                      <SelectItem key={option.id} value={option.id}>
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <span>{option.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {option.preisProLiter}€/L
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {reinigungsmittel && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {reinigungsmittel.beschreibung}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Besonderheiten aus Objektaufnahme */}
                            {seiteData && seiteData.besonderheiten.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {seiteData.besonderheiten.map((b, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {b}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Kosten-Zusammenfassung */}
        <Card className="ff-card bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Positions-Zusammenfassung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bühnen (geschätzt)</span>
                <span className="font-medium">{gesamtKosten.buehnen.toLocaleString("de-DE")} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reinigungsmittel (geschätzt)</span>
                <span className="font-medium">{gesamtKosten.reinigungsmittel.toLocaleString("de-DE")} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Übernachtung</span>
                <span className="font-medium">{gesamtKosten.uebernachtung.toLocaleString("de-DE")} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Baustelleneinrichtung</span>
                <span className="font-medium">{gesamtKosten.baustelleneinrichtung.toLocaleString("de-DE")} €</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-medium">Zusatzkosten gesamt</span>
                <span className="font-bold text-primary">{gesamtKosten.gesamt.toLocaleString("de-DE")} €</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Die finalen Kosten werden im nächsten Schritt mit der Flächenreinigung kalkuliert.
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
