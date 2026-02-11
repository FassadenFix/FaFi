/**
 * Immobilien & Seiten Auswahl Step
 * 
 * Gemäß Interview-Erkenntnisse:
 * - Immobilien aus Projekt auswählen
 * - Pro Immobilie: Einzelne Seiten auswählen (Checkbox)
 * - Bühnentechnik pro Seite anzeigen/auswählen
 * - Reinigungsmittel pro Seite anzeigen
 * - Gesamtfläche berechnet sich aus ausgewählten Seiten
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Ruler,
  ChevronDown,
  Droplets,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLibraryEquipment,
  useLibraryCleaningAgents,
  useLibraryDiscounts,
  getPreisProQm as getPreisProQmFromLib,
  getPreisstaffelLabel as getPreisstaffelLabelFromLib,
} from "@/hooks/useLibrary";

// ============================================
// TYPES
// ============================================

interface SeiteAusObjektaufnahme {
  id?: string; // Aus Datenbank
  name: string;
  himmelsrichtung?: string; // Aus Datenbank
  breite?: number;
  hoehe?: number;
  flaeche: number;
  reinigungsfaehig: boolean;
  hinweis?: string;
  fassadenart?: string; // Optional für DB-Kompatibilität
  besonderheiten?: string | string[]; // String aus DB oder Array
  zugaenglichkeit?: string;
  buehnentyp?: string;
  sperrungen?: string[];
  wasseranschluss?: {
    vorhanden: boolean;
    ort?: string;
    typ?: string;
    zoll?: string;
  };
  reinigungsmittel?: string;
}

interface ImmobilieAusObjektaufnahme {
  id: string;
  name?: string; // Aus Datenbank
  adresse: string;
  plz?: string; // Aus Datenbank
  ort?: string; // Aus Datenbank
  seiten: SeiteAusObjektaufnahme[];
  besonderheiten?: string | string[]; // String aus DB oder Array
  zugaenglichkeit?: {
    ok: boolean;
    hinweis?: string;
  };
  sperrungen?: string[];
  fassadenart?: string;
  fassadentyp?: string; // Alias aus DB
  wasseranschluss?: {
    vorhanden: boolean;
    ort?: string;
    typ?: string;
    zoll?: string;
  };
  reinigungsmittel?: string;
  buehnentyp?: string;
  maxHoehe?: number;
}

// Ausgewählte Seite mit Bühnentechnik-Zuordnung
export interface SelectedSeite {
  immobilieId: string;
  seiteName: string;
  flaeche: number;
  buehnentyp: string;
  reinigungsmittel: string;
  fassadenart?: string; // Optional für DB-Kompatibilität
  besonderheiten: string[];
  sperrungen: string[];
}

export interface ImmobilienSeitenAuswahlStepProps {
  immobilien: ImmobilieAusObjektaufnahme[];
  selectedSeiten: SelectedSeite[];
  setSelectedSeiten: (seiten: SelectedSeite[]) => void;
  gesamtflaeche: number;
}

// ============================================
// CONSTANTS
// ============================================

// BUEHNENTYPEN, REINIGUNGSMITTEL und PREISSTAFFELUNG kommen jetzt aus der Bibliothek

// ============================================
// COMPONENT
// ============================================

export default function ImmobilienSeitenAuswahlStep({
  immobilien,
  selectedSeiten,
  setSelectedSeiten,
  gesamtflaeche,
}: ImmobilienSeitenAuswahlStepProps) {
  // Bibliothek-Daten laden
  const { buehnenOptionen } = useLibraryEquipment();
  const { reinigungsmittelOptionen } = useLibraryCleaningAgents();
  const { preisstaffelung } = useLibraryDiscounts();
  
  // Mapping auf lokale Formate
  const BUEHNENTYPEN = buehnenOptionen.map(b => ({ id: b.id, label: b.name, maxHoehe: b.maxHoehe, preisProTag: b.preisProTag }));
  const REINIGUNGSMITTEL = reinigungsmittelOptionen.map(r => ({ id: r.id, label: r.name }));
  const getPreisstaffelLabel = (flaeche: number) => getPreisstaffelLabelFromLib(flaeche, preisstaffelung);
  const getPreisProQm = (flaeche: number) => getPreisProQmFromLib(flaeche, preisstaffelung);
  const [expandedImmobilien, setExpandedImmobilien] = useState<string[]>(
    immobilien.map(i => i.id) // Alle standardmäßig aufgeklappt
  );

  // Prüfen ob eine Seite ausgewählt ist
  const isSeiteSelected = (immobilieId: string, seiteName: string): boolean => {
    return selectedSeiten.some(
      s => s.immobilieId === immobilieId && s.seiteName === seiteName
    );
  };

  // Seite auswählen/abwählen
  const toggleSeite = (
    immobilie: ImmobilieAusObjektaufnahme,
    seite: SeiteAusObjektaufnahme
  ) => {
    if (!seite.reinigungsfaehig) return; // Nicht reinigbare Seiten können nicht ausgewählt werden

    const isSelected = isSeiteSelected(immobilie.id, seite.name);

    if (isSelected) {
      // Abwählen
      setSelectedSeiten(
        selectedSeiten.filter(
          s => !(s.immobilieId === immobilie.id && s.seiteName === seite.name)
        )
      );
    } else {
      // Auswählen mit Standardwerten aus Objektaufnahme
      const newSeite: SelectedSeite = {
        immobilieId: immobilie.id,
        seiteName: seite.name,
        flaeche: seite.flaeche,
        buehnentyp: seite.buehnentyp || immobilie.buehnentyp || "hubsteiger-18m",
        reinigungsmittel: seite.reinigungsmittel || immobilie.reinigungsmittel || "fassadenfix-pro",
        fassadenart: seite.fassadenart,
        besonderheiten: Array.isArray(seite.besonderheiten) ? seite.besonderheiten : (seite.besonderheiten ? [seite.besonderheiten] : []),
        sperrungen: seite.sperrungen || [],
      };
      setSelectedSeiten([...selectedSeiten, newSeite]);
    }
  };

  // Bühnentechnik für eine Seite ändern
  const updateBuehnentyp = (immobilieId: string, seiteName: string, buehnentyp: string) => {
    setSelectedSeiten(
      selectedSeiten.map(s =>
        s.immobilieId === immobilieId && s.seiteName === seiteName
          ? { ...s, buehnentyp }
          : s
      )
    );
  };

  // Reinigungsmittel für eine Seite ändern
  const updateReinigungsmittel = (immobilieId: string, seiteName: string, reinigungsmittel: string) => {
    setSelectedSeiten(
      selectedSeiten.map(s =>
        s.immobilieId === immobilieId && s.seiteName === seiteName
          ? { ...s, reinigungsmittel }
          : s
      )
    );
  };

  // Alle reinigungsfähigen Seiten einer Immobilie auswählen
  const selectAllSeitenOfImmobilie = (immobilie: ImmobilieAusObjektaufnahme) => {
    const reinigungsfaehigeSeiten = immobilie.seiten.filter(s => s.reinigungsfaehig);
    const newSeiten = reinigungsfaehigeSeiten
      .filter(seite => !isSeiteSelected(immobilie.id, seite.name))
      .map(seite => ({
        immobilieId: immobilie.id,
        seiteName: seite.name,
        flaeche: seite.flaeche,
        buehnentyp: seite.buehnentyp || immobilie.buehnentyp || "hubsteiger-18m",
        reinigungsmittel: seite.reinigungsmittel || immobilie.reinigungsmittel || "fassadenfix-pro",
        fassadenart: seite.fassadenart,
        besonderheiten: Array.isArray(seite.besonderheiten) ? seite.besonderheiten : (seite.besonderheiten ? [seite.besonderheiten] : []),
        sperrungen: seite.sperrungen || [],
      }));
    setSelectedSeiten([...selectedSeiten, ...newSeiten]);
  };

  // Alle Seiten einer Immobilie abwählen
  const deselectAllSeitenOfImmobilie = (immobilieId: string) => {
    setSelectedSeiten(selectedSeiten.filter(s => s.immobilieId !== immobilieId));
  };

  // Alle reinigungsfähigen Seiten aller Immobilien auswählen
  const selectAll = () => {
    const allSeiten: SelectedSeite[] = [];
    immobilien.forEach(immobilie => {
      immobilie.seiten
        .filter(seite => seite.reinigungsfaehig)
        .forEach(seite => {
          if (!isSeiteSelected(immobilie.id, seite.name)) {
            allSeiten.push({
              immobilieId: immobilie.id,
              seiteName: seite.name,
              flaeche: seite.flaeche,
              buehnentyp: seite.buehnentyp || immobilie.buehnentyp || "hubsteiger-18m",
              reinigungsmittel: seite.reinigungsmittel || immobilie.reinigungsmittel || "fassadenfix-pro",
              fassadenart: seite.fassadenart,
              besonderheiten: Array.isArray(seite.besonderheiten) ? seite.besonderheiten : (seite.besonderheiten ? [seite.besonderheiten] : []),
              sperrungen: seite.sperrungen || [],
            });
          }
        });
    });
    setSelectedSeiten([...selectedSeiten, ...allSeiten]);
  };

  // Alle abwählen
  const deselectAll = () => {
    setSelectedSeiten([]);
  };

  // Anzahl ausgewählter Seiten pro Immobilie
  const getSelectedSeitenCount = (immobilieId: string): number => {
    return selectedSeiten.filter(s => s.immobilieId === immobilieId).length;
  };

  // Fläche pro Immobilie (nur ausgewählte Seiten)
  const getSelectedFlaecheOfImmobilie = (immobilieId: string): number => {
    return selectedSeiten
      .filter(s => s.immobilieId === immobilieId)
      .reduce((sum, s) => sum + s.flaeche, 0);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Schritt 2 von 5: Immobilien & Seiten wählen</p>
            <p className="text-sm text-muted-foreground">
              Wähle die Seiten aus, die gereinigt werden sollen. Du kannst pro Seite die Bühnentechnik anpassen.
              Alle Daten stammen aus der Objektaufnahme.
            </p>
          </div>
        </div>
      </div>

      {/* Schnellauswahl */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={selectAll} className="gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Alle Seiten auswählen
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll} className="gap-1">
          Auswahl aufheben
        </Button>
      </div>

      {/* Immobilien-Liste mit Seiten-Auswahl */}
      <Accordion
        type="multiple"
        value={expandedImmobilien}
        onValueChange={setExpandedImmobilien}
        className="space-y-3"
      >
        {immobilien.map((immobilie, immoIndex) => {
          const selectedCount = getSelectedSeitenCount(immobilie.id);
          const reinigungsfaehigCount = immobilie.seiten.filter(s => s.reinigungsfaehig).length;
          const selectedFlaeche = getSelectedFlaecheOfImmobilie(immobilie.id);
          const hasSelection = selectedCount > 0;

          return (
            <AccordionItem
              key={immobilie.id}
              value={immobilie.id}
              className={cn(
                "border-2 rounded-xl overflow-hidden transition-all",
                hasSelection ? "border-primary bg-primary/5" : "border-muted"
              )}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={hasSelection ? "default" : "secondary"} className="text-xs">
                      {immoIndex + 1}
                    </Badge>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{immobilie.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{immobilie.fassadenart}</Badge>
                        {immobilie.maxHoehe && (
                          <span>max. {immobilie.maxHoehe}m</span>
                        )}
                        {immobilie.sperrungen && immobilie.sperrungen.length > 0 && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {immobilie.sperrungen.length} Sperrung(en)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {selectedFlaeche.toLocaleString("de-DE")} m²
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedCount}/{reinigungsfaehigCount} Seiten
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                {/* Schnellauswahl für diese Immobilie */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllSeitenOfImmobilie(immobilie)}
                    className="gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Alle Seiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deselectAllSeitenOfImmobilie(immobilie.id)}
                    className="gap-1 text-xs"
                  >
                    Keine
                  </Button>
                </div>

                {/* Seiten-Liste */}
                <div className="space-y-2">
                  {immobilie.seiten.map((seite) => {
                    const isSelected = isSeiteSelected(immobilie.id, seite.name);
                    const selectedSeite = selectedSeiten.find(
                      s => s.immobilieId === immobilie.id && s.seiteName === seite.name
                    );

                    return (
                      <div
                        key={seite.name}
                        className={cn(
                          "p-3 rounded-lg border transition-all",
                          !seite.reinigungsfaehig
                            ? "bg-red-50 border-red-200 opacity-60"
                            : isSelected
                            ? "bg-green-50 border-green-300"
                            : "bg-muted/30 border-muted hover:border-primary/50 cursor-pointer"
                        )}
                        onClick={() => toggleSeite(immobilie, seite)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              disabled={!seite.reinigungsfaehig}
                              className="mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{seite.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {seite.flaeche.toLocaleString("de-DE")} m²
                                </Badge>
                                {!seite.reinigungsfaehig && (
                                  <Badge variant="destructive" className="text-xs">
                                    Nicht reinigbar
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Details aus Objektaufnahme */}
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{seite.fassadenart}</span>
                                {seite.hoehe && <span>H: {seite.hoehe}m</span>}
                                {seite.breite && <span>B: {seite.breite}m</span>}
                                {seite.besonderheiten && (
                                  <span className="text-amber-600">
                                    {Array.isArray(seite.besonderheiten) 
                                      ? seite.besonderheiten.join(", ") 
                                      : seite.besonderheiten}
                                  </span>
                                )}
                              </div>

                              {/* Hinweis wenn nicht reinigbar */}
                              {!seite.reinigungsfaehig && seite.hinweis && (
                                <div className="mt-1 text-xs text-red-600">
                                  {seite.hinweis}
                                </div>
                              )}

                              {/* Sperrungen */}
                              {seite.sperrungen && seite.sperrungen.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  Sperrungen: {seite.sperrungen.join(", ")}
                                </div>
                              )}

                              {/* Wasseranschluss aus Objektaufnahme */}
                              {seite.wasseranschluss && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                  <Droplets className="w-3 h-3" />
                                  Wasser: {seite.wasseranschluss.vorhanden ? `Ja${seite.wasseranschluss.ort ? ` (${seite.wasseranschluss.ort})` : ''}${seite.wasseranschluss.zoll ? ` ${seite.wasseranschluss.zoll}"` : ''}` : 'Nicht vorhanden'}
                                </div>
                              )}

                              {/* Zugänglichkeit */}
                              {seite.zugaenglichkeit && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Truck className="w-3 h-3" />
                                  Zugang: {seite.zugaenglichkeit}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bühnentechnik & Reinigungsmittel Auswahl (nur wenn ausgewählt) */}
                          {isSelected && selectedSeite && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {/* Bühnentechnik */}
                              <Select
                                value={selectedSeite.buehnentyp}
                                onValueChange={(v) => updateBuehnentyp(immobilie.id, seite.name, v)}
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <Truck className="w-3 h-3 mr-1" />
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {BUEHNENTYPEN.map((bt) => (
                                    <SelectItem key={bt.id} value={bt.id} className="text-xs">
                                      {bt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Reinigungsmittel */}
                              <Select
                                value={selectedSeite.reinigungsmittel}
                                onValueChange={(v) => updateReinigungsmittel(immobilie.id, seite.name, v)}
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <Droplets className="w-3 h-3 mr-1" />
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {REINIGUNGSMITTEL.map((rm) => (
                                    <SelectItem key={rm.id} value={rm.id} className="text-xs">
                                      {rm.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Besonderheiten der Immobilie */}
                {immobilie.besonderheiten && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <div className="font-medium text-amber-700 mb-1">Besonderheiten:</div>
                    <ul className="list-disc list-inside text-amber-600 text-xs">
                      {(Array.isArray(immobilie.besonderheiten) 
                        ? immobilie.besonderheiten 
                        : [immobilie.besonderheiten]
                      ).map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sonderausstattung / Balkonbrüstungen (aus Objektaufnahme) */}
                {(immobilie as any).sonderausstattung && (immobilie as any).sonderausstattung.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="font-medium text-blue-700 mb-1">Sonderausstattung (aus Objektaufnahme):</div>
                    <div className="flex flex-wrap gap-1">
                      {((immobilie as any).sonderausstattung as string[]).map((feature: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-blue-600 border-blue-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wasseranschluss der Immobilie */}
                {immobilie.wasseranschluss && (
                  <div className="mt-2 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-sky-600" />
                      <span className="font-medium text-sky-700">
                        Wasseranschluss: {immobilie.wasseranschluss.vorhanden ? 'Vorhanden' : 'Nicht vorhanden'}
                        {immobilie.wasseranschluss.ort && ` – ${immobilie.wasseranschluss.ort}`}
                        {immobilie.wasseranschluss.zoll && ` (${immobilie.wasseranschluss.zoll}")`}
                      </span>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Gesamtfläche & Preisstaffel */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              <span className="font-medium">Gesamtfläche (ausgewählt):</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {gesamtflaeche.toLocaleString("de-DE")} m²
              </div>
              <div className="text-sm text-muted-foreground">
                Preisstaffel: {getPreisstaffelLabel(gesamtflaeche)} → {getPreisProQm(gesamtflaeche).toFixed(2)} €/m²
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnung wenn keine Seite ausgewählt */}
      {selectedSeiten.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Bitte wähle mindestens eine Seite aus.</span>
          </div>
        </div>
      )}
    </div>
  );
}
