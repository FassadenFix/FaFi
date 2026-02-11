/**
 * Störer & Bedingungen Step
 * 
 * Vorletzter Schritt im Angebot-Wizard für die Auswahl von:
 * - Preisstaffel für den Störer (linke Spalte)
 * - Garantien für den Störer (rechte Spalte)
 * - Angebotsbedingungen (unterhalb des Störers)
 * 
 * OPTIMIERT v3.7:
 * - Premium-Variante des FassadenFix Versprechen aktiviert
 * - iPad-Touch-Targets auf min. 44px erhöht
 * - Größere Checkboxen und bessere Abstände
 * 
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Award, FileCheck, ListChecks, Eye, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequiredLabel, RequiredFieldHint } from "@/components/Wizard";
import { 
  FassadenFixVersprechen, 
  GARANTIE_OPTIONS, 
  BEDINGUNGEN_OPTIONS 
} from "@/components/FassadenFixVersprechen";
import { useLibraryDiscounts } from "@/hooks/useLibrary";

// Export types for use in parent component
export interface StoererConfig {
  preisstaffelId: string;
  garantien: string[];
  usePremiumVariant?: boolean;
}

export interface BedingungenConfig {
  gueltigkeitId: string;
  zahlungId: string;
  sonstigeBedingungen: string[];
}

interface StoererBedingungStepProps {
  stoererConfig: StoererConfig;
  setStoererConfig: (config: StoererConfig) => void;
  bedingungenConfig: BedingungenConfig;
  setBedingungenConfig: (config: BedingungenConfig) => void;
}

export function StoererBedingungStep({
  stoererConfig,
  setStoererConfig,
  bedingungenConfig,
  setBedingungenConfig,
}: StoererBedingungStepProps) {
  const [showPreview, setShowPreview] = useState(true); // Default: Vorschau anzeigen
  const { preisstaffelOptions: PREISSTAFFEL_OPTIONS } = useLibraryDiscounts();

  // Get selected Preisstaffel data
  const selectedPreisstaffel = PREISSTAFFEL_OPTIONS.find(p => p.id === stoererConfig.preisstaffelId);

  // Filter Bedingungen by Kategorie
  const gueltigkeitOptionen = BEDINGUNGEN_OPTIONS.filter(b => b.kategorie === 'gueltigkeit');
  const zahlungOptionen = BEDINGUNGEN_OPTIONS.filter(b => b.kategorie === 'zahlung');
  const sonstigeOptionen = BEDINGUNGEN_OPTIONS.filter(b => b.kategorie === 'sonstiges');

  // Default to premium variant
  const usePremium = stoererConfig.usePremiumVariant ?? true;

  const toggleGarantie = (id: string) => {
    const newGarantien = stoererConfig.garantien.includes(id)
      ? stoererConfig.garantien.filter(g => g !== id)
      : [...stoererConfig.garantien, id];
    setStoererConfig({ ...stoererConfig, garantien: newGarantien });
  };

  const toggleSonstigeBedingung = (id: string) => {
    const newBedingungen = bedingungenConfig.sonstigeBedingungen.includes(id)
      ? bedingungenConfig.sonstigeBedingungen.filter(b => b !== id)
      : [...bedingungenConfig.sonstigeBedingungen, id];
    setBedingungenConfig({ ...bedingungenConfig, sonstigeBedingungen: newBedingungen });
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Schritt 5 von 6: Störer & Bedingungen</p>
            <p className="text-sm text-muted-foreground">
              Wähle die Inhalte für das "FassadenFix Versprechen" und die Angebotsbedingungen.
            </p>
          </div>
        </div>
      </div>

      {/* Störer Configuration */}
      <Card className="ff-card">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Award className="w-5 h-5" />
              Das FassadenFix Versprechen (Störer)
            </div>
            <div className="flex items-center gap-4">
              {/* Premium-Variante Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id="premium-variant"
                  checked={usePremium}
                  onCheckedChange={(checked) => 
                    setStoererConfig({ ...stoererConfig, usePremiumVariant: checked })
                  }
                />
                <Label 
                  htmlFor="premium-variant" 
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Premium
                </Label>
              </div>
              {/* Vorschau Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] px-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Ausblenden' : 'Vorschau'}
              </button>
            </div>
          </div>

          {/* Preview - PREMIUM VARIANTE */}
          {showPreview && selectedPreisstaffel && (
            <div className="border rounded-xl p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Vorschau im Angebot:
              </p>
              <FassadenFixVersprechen
                preisstaffel={selectedPreisstaffel.data}
                preisstaffelTitel={
                  stoererConfig.preisstaffelId === 'fruehbucher' 
                    ? 'Frühbucher-Rabatte' 
                    : 'Transparente Preisstaffel'
                }
                garantien={stoererConfig.garantien}
                variant={usePremium ? 'premium' : 'default'}
                compact={false}
              />
            </div>
          )}

          <Separator />

          {/* Preisstaffel Selection - iPad-optimiert */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <ListChecks className="w-5 h-5 text-primary" />
              <RequiredLabel>Linke Spalte: Preisstaffel</RequiredLabel>
            </Label>
            <Select
              value={stoererConfig.preisstaffelId}
              onValueChange={(v) => setStoererConfig({ ...stoererConfig, preisstaffelId: v })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Preisstaffel auswählen" />
              </SelectTrigger>
              <SelectContent>
                {PREISSTAFFEL_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="py-3 text-base">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreisstaffel && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {selectedPreisstaffel.data.map((item, i) => (
                  <span key={i}>
                    {item.flaeche}: <span className="text-primary font-medium">{item.preis}</span>
                    {i < selectedPreisstaffel.data.length - 1 && ' · '}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Garantien Selection (Multiselect) - iPad-optimiert */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-primary" />
              Rechte Spalte: Garantien & Leistungen
              <Badge variant="secondary" className="ml-auto">
                {stoererConfig.garantien.length} ausgewählt
              </Badge>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {GARANTIE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all min-h-[56px]",
                      "active:scale-[0.98] touch-manipulation",
                      stoererConfig.garantien.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted hover:border-primary/30"
                    )}
                    onClick={() => toggleGarantie(option.id)}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      stoererConfig.garantien.includes(option.id)
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {stoererConfig.garantien.includes(option.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-base flex-1">{option.label}</span>
                    <Checkbox
                      checked={stoererConfig.garantien.includes(option.id)}
                      onCheckedChange={() => toggleGarantie(option.id)}
                      className="w-6 h-6"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Angebotsbedingungen Configuration */}
      <Card className="ff-card">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-2 text-primary font-medium">
            <FileCheck className="w-5 h-5" />
            Angebotsbedingungen
          </div>

          {/* Gültigkeit & Zahlungsziel - iPad-optimiert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">
                <RequiredLabel>Gültigkeit</RequiredLabel>
              </Label>
              <Select
                value={bedingungenConfig.gueltigkeitId}
                onValueChange={(v) => setBedingungenConfig({ ...bedingungenConfig, gueltigkeitId: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Gültigkeit wählen" />
                </SelectTrigger>
                <SelectContent>
                  {gueltigkeitOptionen.map((option) => (
                    <SelectItem key={option.id} value={option.id} className="py-3 text-base">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zahlungsziel */}
            <div className="space-y-2">
              <Label className="text-base">
                <RequiredLabel>Zahlungsziel</RequiredLabel>
              </Label>
              <Select
                value={bedingungenConfig.zahlungId}
                onValueChange={(v) => setBedingungenConfig({ ...bedingungenConfig, zahlungId: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Zahlungsziel wählen" />
                </SelectTrigger>
                <SelectContent>
                  {zahlungOptionen.map((option) => (
                    <SelectItem key={option.id} value={option.id} className="py-3 text-base">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Sonstige Bedingungen (Multiselect) - iPad-optimiert */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              Zusätzliche Bedingungen
              <Badge variant="secondary" className="ml-auto">
                {bedingungenConfig.sonstigeBedingungen.length} ausgewählt
              </Badge>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {sonstigeOptionen.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all min-h-[56px]",
                    "active:scale-[0.98] touch-manipulation",
                    bedingungenConfig.sonstigeBedingungen.includes(option.id)
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-primary/30"
                  )}
                  onClick={() => toggleSonstigeBedingung(option.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    bedingungenConfig.sonstigeBedingungen.includes(option.id)
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {bedingungenConfig.sonstigeBedingungen.includes(option.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-base flex-1">{option.label}</span>
                  <Checkbox
                    checked={bedingungenConfig.sonstigeBedingungen.includes(option.id)}
                    onCheckedChange={() => toggleSonstigeBedingung(option.id)}
                    className="w-6 h-6"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pflichtfeld-Hinweis */}
          <RequiredFieldHint />
        </CardContent>
      </Card>
    </div>
  );
}

export default StoererBedingungStep;
