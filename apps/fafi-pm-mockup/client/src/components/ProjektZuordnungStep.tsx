/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Projekt-Zuordnung Step für den Angebot-Wizard
 * - Automatische Projektnummerierung (Jahr-Unternehmen-Fortlaufend)
 * - Zuordnung über Projekt ODER Kunde
 * - Immobiliendaten automatisch aus Objektaufnahme laden
 * - LOOM FEEDBACK: Vollständige Datenübernahme aus Immobilienerfassung
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  Building2,
  FolderKanban,
  Home,
  User,
  Search,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Ruler,
  Plus,
  Truck,
  Droplets,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RequiredLabel, RequiredFieldHint } from "@/components/Wizard";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface Unternehmen {
  id: string;
  name: string;
  kuerzel: string;
  kontakte: Kontakt[];
  projekte: Projekt[];
}

export interface Kontakt {
  id: string;
  name: string;
  email: string;
  telefon: string;
  position: string;
}

export interface Projekt {
  id: string;
  nummer: string;
  name: string;
  unternehmenId: string;
  status: "offen" | "aktiv" | "abgeschlossen";
  immobilien: ImmobilieAusObjektaufnahme[];
}

export interface ImmobilieAusObjektaufnahme {
  id: string;
  adresse: string;
  seiten: SeiteAusObjektaufnahme[];
  besonderheiten: string[];
  zugaenglichkeit: {
    ok: boolean;
    hinweis?: string;
  };
  sperrungen: string[];
  fassadenart: string;
  // LOOM FEEDBACK: Erweiterte Daten aus Objektaufnahme
  wasseranschluss?: {
    vorhanden: boolean;
    ort?: string;
    typ?: string;
    zoll?: string;
  };
  reinigungsmittel?: string;
  buehnentyp?: string;
  maxHoehe?: number;
  schaeden?: SchadenAusObjektaufnahme[];
}

export interface SeiteAusObjektaufnahme {
  name: string;
  breite?: number;
  hoehe?: number;
  flaeche: number;
  reinigungsfaehig: boolean;
  hinweis?: string;
  fassadenart: string;
  besonderheiten: string[];
  // LOOM FEEDBACK: Erweiterte Daten pro Seite
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

// LOOM FEEDBACK: Schäden für Aufgabenerstellung
export interface SchadenAusObjektaufnahme {
  id: string;
  seite: string;
  typ: string;
  beschreibung: string;
  foto?: string;
  verantwortlich?: "auftraggeber" | "auftragnehmer" | "unentschieden";
}

export interface ProjektZuordnung {
  zuordnungTyp: "projekt" | "kunde";
  unternehmenId: string;
  projektId: string;
  kontaktId: string;
  neuesProjekt: boolean;
  projektNummer: string;
  projektName: string;
  ausgewaehlteImmobilien: string[];
}

interface ProjektZuordnungStepProps {
  zuordnung: ProjektZuordnung;
  setZuordnung: (zuordnung: ProjektZuordnung) => void;
  onImmobilienSelected: (immobilien: ImmobilieAusObjektaufnahme[]) => void;
}

// ============================================
// MOCK DATA entfernt – KA-21: Jetzt DB-Anbindung via tRPC
// ============================================

// Alte Mock-Daten gelöscht – werden jetzt aus der DB geladen (KA-21)

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateProjektNummer(unternehmen: Unternehmen | undefined): string {
  if (!unternehmen) return "";
  
  const year = new Date().getFullYear();
  const existingCount = unternehmen.projekte.length;
  const nextNumber = String(existingCount + 1).padStart(2, "0");
  
  return `${year}-${unternehmen.kuerzel}-${nextNumber}`;
}

// ============================================
// COMPONENT
// ============================================

export default function ProjektZuordnungStep({
  zuordnung,
  setZuordnung,
  onImmobilienSelected,
}: ProjektZuordnungStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC: Unternehmen aus DB laden
  const { data: dbCompanies, isLoading: companiesLoading } = trpc.company.search.useQuery(
    { query: debouncedSearch },
    { enabled: debouncedSearch.length >= 2 }
  );
  const { data: allCompanies } = trpc.company.list.useQuery();

  // tRPC: Kontakte des ausgewählten Unternehmens
  const selectedCompanyId = zuordnung.unternehmenId ? Number(zuordnung.unternehmenId) : undefined;
  const { data: dbContacts } = trpc.contact.getByCompanyId.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  // tRPC: Projekte des ausgewählten Unternehmens
  const { data: dbProjects } = trpc.project.getByCompanyId.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  // tRPC: Immobilien des ausgewählten Projekts
  const selectedProjectId = zuordnung.projektId ? Number(zuordnung.projektId) : undefined;
  const { data: dbProperties } = trpc.property.getByProjectId.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Map DB-Daten auf interne Typen
  const filteredUnternehmen: Unternehmen[] = useMemo(() => {
    const companies = debouncedSearch.length >= 2 ? dbCompanies : allCompanies;
    if (!companies) return [];
    return companies.map((c: any) => ({
      id: String(c.id),
      name: c.name || "Unbenannt",
      kuerzel: (c.name || "XX").substring(0, 3).toUpperCase(),
      kontakte: [],
      projekte: [],
    }));
  }, [dbCompanies, allCompanies, debouncedSearch]);

  // Ausgewähltes Unternehmen
  const selectedUnternehmen: Unternehmen | undefined = useMemo(() => {
    if (!zuordnung.unternehmenId) return undefined;
    const fromList = filteredUnternehmen.find(u => u.id === zuordnung.unternehmenId);
    if (fromList) {
      return {
        ...fromList,
        kontakte: (dbContacts || []).map((c: any) => ({
          id: String(c.id),
          name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unbekannt",
          email: c.email || "",
          telefon: c.phone || "",
          position: c.position || "",
        })),
        projekte: (dbProjects || []).map((p: any) => ({
          id: String(p.id),
          nummer: p.projectNumber || "",
          name: p.name || "",
          unternehmenId: String(p.companyId),
          status: (p.phase === "abgeschlossen" ? "abgeschlossen" : p.phase === "durchfuehrung" || p.phase === "planung" ? "aktiv" : "offen") as "offen" | "aktiv" | "abgeschlossen",
          immobilien: [],
        })),
      };
    }
    return undefined;
  }, [zuordnung.unternehmenId, filteredUnternehmen, dbContacts, dbProjects]);

  // Gefilterte Projekte des Unternehmens
  const projekte = useMemo(() => {
    return selectedUnternehmen?.projekte || [];
  }, [selectedUnternehmen]);

  // Gefilterte Kontakte des Unternehmens
  const kontakte = useMemo(() => {
    return selectedUnternehmen?.kontakte || [];
  }, [selectedUnternehmen]);

  // Ausgewähltes Projekt
  const selectedProjekt = useMemo(() => {
    return projekte.find(p => p.id === zuordnung.projektId);
  }, [projekte, zuordnung.projektId]);

  // Automatische Projektnummer generieren
  useEffect(() => {
    if (zuordnung.neuesProjekt && selectedUnternehmen) {
      const nummer = generateProjektNummer(selectedUnternehmen);
      setZuordnung({ ...zuordnung, projektNummer: nummer });
    }
  }, [zuordnung.neuesProjekt, selectedUnternehmen]);

  // Immobilien an Parent weitergeben
  useEffect(() => {
    if (selectedProjekt) {
      const ausgewaehlte = selectedProjekt.immobilien.filter(
        i => zuordnung.ausgewaehlteImmobilien.includes(i.id)
      );
      onImmobilienSelected(ausgewaehlte);
    }
  }, [selectedProjekt, zuordnung.ausgewaehlteImmobilien]);

  // Gesamtfläche berechnen (nur reinigungsfähige Seiten)
  const gesamtflaeche = useMemo(() => {
    if (!selectedProjekt) return 0;
    return selectedProjekt.immobilien
      .filter(i => zuordnung.ausgewaehlteImmobilien.includes(i.id))
      .reduce((sum, immo) => {
        return sum + immo.seiten
          .filter(s => s.reinigungsfaehig)
          .reduce((sSum, s) => sSum + s.flaeche, 0);
      }, 0);
  }, [selectedProjekt, zuordnung.ausgewaehlteImmobilien]);

  // Alle Schäden aus ausgewählten Immobilien
  const alleSchaeden = useMemo(() => {
    if (!selectedProjekt) return [];
    return selectedProjekt.immobilien
      .filter(i => zuordnung.ausgewaehlteImmobilien.includes(i.id))
      .flatMap(immo => (immo.schaeden || []).map(s => ({ ...s, immobilie: immo.adresse })));
  }, [selectedProjekt, zuordnung.ausgewaehlteImmobilien]);

  // Alle Sperrungen aus ausgewählten Immobilien
  const alleSperrungen = useMemo(() => {
    if (!selectedProjekt) return [];
    return selectedProjekt.immobilien
      .filter(i => zuordnung.ausgewaehlteImmobilien.includes(i.id))
      .flatMap(immo => immo.sperrungen.map(s => ({ sperrung: s, immobilie: immo.adresse })));
  }, [selectedProjekt, zuordnung.ausgewaehlteImmobilien]);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-primary">Schritt 1 von 7: Projekt-Zuordnung</p>
            <p className="text-sm text-muted-foreground">
              Wähle ein bestehendes Projekt oder erstelle ein neues. Die Immobiliendaten werden automatisch aus der Objektaufnahme geladen.
            </p>
          </div>
        </div>
      </div>

      {/* Zuordnungstyp */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-primary" />
            Wie möchtest du zuordnen?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={zuordnung.zuordnungTyp}
            onValueChange={(value) => setZuordnung({ 
              ...zuordnung, 
              zuordnungTyp: value as "projekt" | "kunde",
              projektId: "",
              ausgewaehlteImmobilien: [],
            })}
            className="grid grid-cols-2 gap-4"
          >
            <div className={cn(
              "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
              zuordnung.zuordnungTyp === "projekt" 
                ? "border-primary bg-primary/5" 
                : "border-muted hover:border-primary/50"
            )}>
              <RadioGroupItem value="projekt" id="zuordnung-projekt" />
              <label htmlFor="zuordnung-projekt" className="cursor-pointer flex-1">
                <div className="font-medium">Über Projekt</div>
                <div className="text-xs text-muted-foreground">Bestehendes Projekt auswählen</div>
              </label>
            </div>
            <div className={cn(
              "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
              zuordnung.zuordnungTyp === "kunde" 
                ? "border-primary bg-primary/5" 
                : "border-muted hover:border-primary/50"
            )}>
              <RadioGroupItem value="kunde" id="zuordnung-kunde" />
              <label htmlFor="zuordnung-kunde" className="cursor-pointer flex-1">
                <div className="font-medium">Über Kunde</div>
                <div className="text-xs text-muted-foreground">Erst Unternehmen, dann Projekt</div>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Unternehmen auswählen */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <RequiredLabel>Unternehmen</RequiredLabel>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Unternehmen suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={zuordnung.unternehmenId}
            onValueChange={(value) => setZuordnung({
              ...zuordnung,
              unternehmenId: value,
              projektId: "",
              kontaktId: "",
              ausgewaehlteImmobilien: [],
              neuesProjekt: false,
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unternehmen auswählen" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Neues Unternehmen erstellen Dialog öffnen
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Neues Unternehmen erstellen
                </Button>
              </div>
              {filteredUnternehmen.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <div className="flex items-center gap-2">
                    <span>{u.name}</span>
                    <Badge variant="secondary" className="text-xs">{u.kuerzel}</Badge>
                    <Badge variant="outline" className="text-xs">{u.projekte.length} Projekte</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUnternehmen && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{selectedUnternehmen.kontakte.length} Kontakt(e), {selectedUnternehmen.projekte.length} Projekt(e)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kontakt auswählen */}
      {selectedUnternehmen && (
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <RequiredLabel>Ansprechpartner</RequiredLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={zuordnung.kontaktId}
              onValueChange={(value) => setZuordnung({ ...zuordnung, kontaktId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ansprechpartner auswählen" />
              </SelectTrigger>
              <SelectContent>
                {kontakte.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    <div className="flex items-center gap-2">
                      <span>{k.name}</span>
                      <span className="text-muted-foreground text-xs">({k.position})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Projekt auswählen oder neu erstellen */}
      {selectedUnternehmen && (
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              Projekt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projekte.length > 0 ? (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neues-projekt"
                    checked={zuordnung.neuesProjekt}
                    onCheckedChange={(checked) => setZuordnung({
                      ...zuordnung,
                      neuesProjekt: !!checked,
                      projektId: "",
                      ausgewaehlteImmobilien: [],
                    })}
                  />
                  <label htmlFor="neues-projekt" className="text-sm cursor-pointer">
                    Neues Projekt erstellen
                  </label>
                </div>

                {!zuordnung.neuesProjekt && (
                  <Select
                    value={zuordnung.projektId}
                    onValueChange={(value) => {
                      const projekt = projekte.find(p => p.id === value);
                      setZuordnung({
                        ...zuordnung,
                        projektId: value,
                        projektNummer: projekt?.nummer || "",
                        projektName: projekt?.name || "",
                        ausgewaehlteImmobilien: projekt?.immobilien.map(i => i.id) || [],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bestehendes Projekt auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {projekte.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{p.nummer}</Badge>
                            <span>{p.name}</span>
                            <Badge 
                              variant={p.status === "offen" ? "secondary" : p.status === "aktiv" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {p.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Keine bestehenden Projekte. Ein neues Projekt wird automatisch erstellt.</span>
                </div>
              </div>
            )}

            {(zuordnung.neuesProjekt || projekte.length === 0) && (
              <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Sparkles className="w-4 h-4" />
                  Neues Projekt
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Projektnummer (automatisch)</Label>
                    <Input
                      value={zuordnung.projektNummer}
                      readOnly
                      className="mt-1 bg-muted font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: Jahr-Kürzel-Fortlaufend
                    </p>
                  </div>
                  <div>
                    <Label><RequiredLabel>Projektname</RequiredLabel></Label>
                    <Input
                      value={zuordnung.projektName}
                      onChange={(e) => setZuordnung({ ...zuordnung, projektName: e.target.value })}
                      placeholder="z.B. Wohnanlage Sonnenhof"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Immobilien aus Projekt - LOOM FEEDBACK: Erweiterte Anzeige */}
      {selectedProjekt && selectedProjekt.immobilien.length > 0 && (
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              Immobilien aus Objektaufnahme
              <Badge variant="secondary">{selectedProjekt.immobilien.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wähle die Immobilien aus, die in dieses Angebot aufgenommen werden sollen.
              Alle Daten aus der Objektaufnahme werden automatisch übernommen.
            </p>

            <Accordion type="multiple" className="space-y-2">
              {selectedProjekt.immobilien.map((immo) => {
                const isSelected = zuordnung.ausgewaehlteImmobilien.includes(immo.id);
                const reinigungsflaecheGesamt = immo.seiten
                  .filter(s => s.reinigungsfaehig)
                  .reduce((sum, s) => sum + s.flaeche, 0);
                const nichtReinigbar = immo.seiten.filter(s => !s.reinigungsfaehig);

                return (
                  <AccordionItem 
                    key={immo.id} 
                    value={immo.id}
                    className={cn(
                      "rounded-xl border-2 transition-all overflow-hidden",
                      isSelected ? "border-primary bg-primary/5" : "border-muted"
                    )}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={(e) => {
                        // Nur wenn nicht auf Accordion-Trigger geklickt
                        if (!(e.target as HTMLElement).closest('[data-accordion-trigger]')) {
                          const newSelected = isSelected
                            ? zuordnung.ausgewaehlteImmobilien.filter(id => id !== immo.id)
                            : [...zuordnung.ausgewaehlteImmobilien, immo.id];
                          setZuordnung({ ...zuordnung, ausgewaehlteImmobilien: newSelected });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} className="mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{immo.adresse}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">{immo.fassadenart}</Badge>
                              {immo.maxHoehe && (
                                <Badge variant="secondary" className="text-xs">max. {immo.maxHoehe}m</Badge>
                              )}
                              {immo.buehnentyp && (
                                <Badge variant="secondary" className="text-xs">{immo.buehnentyp}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {reinigungsflaecheGesamt.toLocaleString("de-DE")} m²
                          </div>
                          <div className="text-xs text-muted-foreground">reinigungsfähig</div>
                        </div>
                      </div>
                    </div>
                    
                    <AccordionTrigger 
                      data-accordion-trigger
                      className="px-4 py-2 bg-muted/30 text-sm hover:no-underline"
                    >
                      Details aus Objektaufnahme anzeigen
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4">
                      {/* Seiten-Übersicht mit allen Daten */}
                      <div className="mt-3 space-y-3">
                        <div className="text-sm font-medium">Fassadenseiten:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {immo.seiten.map((seite) => (
                            <div
                              key={seite.name}
                              className={cn(
                                "text-xs p-3 rounded-lg border",
                                seite.reinigungsfaehig 
                                  ? "bg-green-50 border-green-200" 
                                  : "bg-red-50 border-red-200"
                              )}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-sm">{seite.name}</div>
                                <Badge 
                                  variant={seite.reinigungsfaehig ? "default" : "destructive"} 
                                  className="text-[10px]"
                                >
                                  {seite.reinigungsfaehig ? "Reinigbar" : "Nicht reinigbar"}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-muted-foreground">
                                {seite.breite && seite.hoehe && (
                                  <div>Abmessung: {seite.breite}m × {seite.hoehe}m = <span className="font-medium text-foreground">{seite.flaeche} m²</span></div>
                                )}
                                {!seite.breite && <div>Fläche: <span className="font-medium text-foreground">{seite.flaeche} m²</span></div>}
                                <div>Fassadenart: {seite.fassadenart}</div>
                                {seite.zugaenglichkeit && <div>Zugänglichkeit: {seite.zugaenglichkeit}</div>}
                                {seite.buehnentyp && <div>Bühne: {seite.buehnentyp}</div>}
                                {seite.reinigungsmittel && <div>Reinigungsmittel: {seite.reinigungsmittel}</div>}
                                {seite.wasseranschluss?.vorhanden && (
                                  <div>Wasser: {seite.wasseranschluss.ort} ({seite.wasseranschluss.typ}, {seite.wasseranschluss.zoll}")</div>
                                )}
                                {seite.sperrungen && seite.sperrungen.length > 0 && (
                                  <div className="flex items-center gap-1 text-amber-600">
                                    <AlertTriangle className="w-3 h-3" />
                                    Sperrungen: {seite.sperrungen.join(", ")}
                                  </div>
                                )}
                                {seite.besonderheiten.length > 0 && (
                                  <div>Besonderheiten: {seite.besonderheiten.join(", ")}</div>
                                )}
                                {!seite.reinigungsfaehig && seite.hinweis && (
                                  <div className="text-red-600 mt-1">{seite.hinweis}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Wasseranschluss Gesamt */}
                        {immo.wasseranschluss?.vorhanden && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span>Wasseranschluss: {immo.wasseranschluss.ort} ({immo.wasseranschluss.typ}, {immo.wasseranschluss.zoll}")</span>
                          </div>
                        )}

                        {/* Sperrungen */}
                        {immo.sperrungen.length > 0 && (
                          <div className="p-2 bg-amber-50 rounded-lg text-sm">
                            <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                              <Truck className="w-4 h-4" />
                              Erforderliche Sperrungen:
                            </div>
                            <ul className="list-disc list-inside text-amber-600 text-xs">
                              {immo.sperrungen.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Schäden */}
                        {immo.schaeden && immo.schaeden.length > 0 && (
                          <div className="p-2 bg-red-50 rounded-lg text-sm">
                            <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              Erfasste Schäden:
                            </div>
                            <ul className="space-y-1 text-xs">
                              {immo.schaeden.map((s) => (
                                <li key={s.id} className="flex items-center justify-between">
                                  <span>{s.seite}: {s.typ} - {s.beschreibung}</span>
                                  <Badge 
                                    variant={s.verantwortlich === "auftragnehmer" ? "default" : s.verantwortlich === "auftraggeber" ? "secondary" : "outline"}
                                    className="text-[10px]"
                                  >
                                    {s.verantwortlich === "auftragnehmer" ? "FassadenFix" : s.verantwortlich === "auftraggeber" ? "Kunde" : "Offen"}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Besonderheiten */}
                        {immo.besonderheiten.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {immo.besonderheiten.map((b, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{b}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Gesamtfläche */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-primary" />
                  <span className="font-medium">Gesamtfläche (reinigungsfähig):</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {gesamtflaeche.toLocaleString("de-DE")} m²
                </div>
              </div>
            </div>

            {/* LOOM FEEDBACK: Zusammenfassung Sperrungen & Schäden */}
            {(alleSperrungen.length > 0 || alleSchaeden.length > 0) && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                    <ClipboardList className="w-4 h-4" />
                    Aufgaben aus Objektaufnahme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {alleSperrungen.length > 0 && (
                    <div>
                      <div className="font-medium text-amber-700 mb-1">Sperrungen beantragen:</div>
                      <ul className="list-disc list-inside text-amber-600 text-xs">
                        {alleSperrungen.map((s, i) => (
                          <li key={i}>{s.sperrung} ({s.immobilie})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {alleSchaeden.length > 0 && (
                    <div>
                      <div className="font-medium text-amber-700 mb-1">Schäden / Besonderheiten:</div>
                      <ul className="space-y-1 text-xs">
                        {alleSchaeden.map((s, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{s.typ}: {s.beschreibung} ({s.immobilie})</span>
                            <Badge 
                              variant={s.verantwortlich === "auftragnehmer" ? "default" : s.verantwortlich === "auftraggeber" ? "secondary" : "outline"}
                              className="text-[10px]"
                            >
                              {s.verantwortlich === "auftragnehmer" ? "FassadenFix" : s.verantwortlich === "auftraggeber" ? "Kunde" : "Klären"}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-amber-600 italic">
                    Diese Aufgaben werden automatisch in die Baustellenvorbereitung übernommen.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
