/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Angebot Wizard - Basierend auf ff-angebotsmanager Skill
 * 
 * MVP-SPEC WORKFLOW (5 Schritte, unter 10 Minuten):
 * 1. Projekt auswählen → Alle Projektdaten werden automatisch geladen
 * 2. Immobilien wählen → Checkbox-Liste aller erfassten Objekte
 * 3. Kalkulation prüfen → Automatische Preisberechnung nach Fläche
 * 4. Rabatt & Konditionen → Frühbucher, Treuerabatt, Bedingungen
 * 5. Zusammenfassung → CI-konformes Angebot mit einem Klick
 * 
 * LOOM FEEDBACK:
 * - Kundendaten-Step entfernt (kommt aus Projektzuordnung)
 * - Immobilien-Step entfernt (kommt aus Objektaufnahme)
 * - Positionen-Step in Kalkulation integriert
 * - Störer-Step in Konditionen integriert
 */

import { useState, useMemo, useEffect } from "react";
import { WizardDialog, WizardStep, RequiredLabel, RequiredFieldHint } from "@/components/Wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Building2,
  Calculator,
  Percent,
  CheckCircle2,
  Euro,
  MapPin,
  Ruler,
  Calendar,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  Info,
  AlertCircle,
  Truck,
  Home,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
  Search,
  FileDown,
  Award,
  FolderKanban,
  AlertTriangle,
  Droplets,
  ClipboardList,
  Tag,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { cn } from "@/lib/utils";
import { useAutoSave, AutoSaveIndicator } from "@/hooks/useAutoSave";
import HubSpotKundensuche, { type HubSpotKontakt } from "@/components/HubSpotKundensuche";
import AngebotPDFGenerator from "@/components/AngebotPDFGenerator";
import { FassadenFixVersprechen } from "@/components/FassadenFixVersprechen";
import ImmobilienSeitenAuswahlStep, { type SelectedSeite } from "@/components/ImmobilienSeitenAuswahlStep";
import {
  useLibraryDiscounts,
  getPreisProQm,
  getPreisstaffelLabel,
  type Preisstaffel,
  type RabattAktion,
} from "@/hooks/useLibrary";

// ============================================
// TYPES
// ============================================

interface Immobilie {
  id: string;
  adresse: string;
  seiten: {
    name: string;
    flaeche: number;
    selected: boolean;
  }[];
  maxHoehe: number;
  besonderheiten: string;
}

interface Kunde {
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
}

interface Kalkulation {
  gesamtflaeche: number;
  basispreisProQm: number;
  rabattProzent: number;
  rabattTyp: string;
  endpreisProQm: number;
  reinigungGesamt: number;
  buehnenTage: number;
  buehnenKosten: number;
  baustelleneinrichtung: number;
  uebernachtungErforderlich: boolean;
  uebernachtungNaechte: number;
  uebernachtungKosten: number;
  anfahrtKosten: number;
  summeNetto: number;
  mwst: number;
  summeBrutto: number;
}

interface AngebotData {
  projektName: string;
  kunde: Kunde;
  immobilien: Immobilie[];
  entfernungKm: number;
  beauftragungsDatum: string;
  kalkulation: Kalkulation;
  textTyp: string;
  gueltigBis: string;
  zahlungsziel: number;
  ansprechpartnerFF: string;
   // Textbausteine
  einleitungText?: string;
  abschlussText?: string;
  abschlussTextTitel?: string;
  // Zusatzleistungen aus Leistungskatalog
  zusatzleistungen?: {
    serviceId: number;
    name: string;
    menge: number;
    einheit: string;
    einzelpreis: number;
    gesamtpreis: number;
  }[];
}
interface AngebotWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: AngebotData) => void;
}

// ============================================
// TYPES FÜR PROJEKTZUORDNUNG
// ============================================

interface Unternehmen {
  id: string;
  name: string;
  kuerzel: string;
  kontakte: Kontakt[];
  projekte: Projekt[];
}

interface Kontakt {
  id: string;
  name: string;
  email: string;
  telefon: string;
  position: string;
}

interface Projekt {
  id: string;
  nummer: string;
  name: string;
  phase?: string; // Aus Datenbank
  unternehmenId?: string; // Optional für DB-Kompatibilität
  status?: "offen" | "aktiv" | "abgeschlossen"; // Optional für DB-Kompatibilität
  immobilien: ImmobilieAusObjektaufnahme[];
  entfernungKm: number;
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
  schaeden?: SchadenAusObjektaufnahme[];
}

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

interface SchadenAusObjektaufnahme {
  id: string;
  seite: string;
  typ: string;
  beschreibung: string;
  foto?: string;
  verantwortlich?: "auftraggeber" | "auftragnehmer" | "unentschieden";
}

// ============================================
// PREISSTAFFELUNG kommt jetzt aus der Bibliothek via useLibraryDiscounts()
// Fallback-Werte sind im Hook definiert;

// Nr.57: Frühbucher-Daten dynamisch berechnen relativ zur aktuellen Saison
// Saison = April-Oktober. Frühbucher-Rabatte gelten für die nächste Saison.
function berechneFruehbucherRabatte() {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Saison läuft April-Oktober. Frühbucher-Rabatte gelten für Beauftragung VOR der Saison.
  // Wenn wir in der Saison sind (Apr-Okt), beziehen sich Rabatte auf nächstes Jahr.
  // Wenn wir außerhalb sind (Nov-März), beziehen sie sich auf die kommende Saison.
  const saisonJahr = now.getMonth() >= 3 ? currentYear + 1 : currentYear;
  return [
    { bisDatum: `${saisonJahr - 1}-12-31`, rabatt: 6.0, label: `bis 31.12.${saisonJahr - 1} (6%)`, code: "FRÜHBUCHER" },
    { bisDatum: `${saisonJahr}-01-31`, rabatt: 4.5, label: `bis 31.01.${saisonJahr} (4,5%)`, code: "FRÜHBUCHER" },
    { bisDatum: `${saisonJahr}-02-28`, rabatt: 3.0, label: `bis 28.02.${saisonJahr} (3%)`, code: "FRÜHBUCHER" },
    { bisDatum: `${saisonJahr}-03-31`, rabatt: 1.5, label: `bis 31.03.${saisonJahr} (1,5%)`, code: "FRÜHBUCHER" },
  ];
}
const FRUEHBUCHER_RABATTE = berechneFruehbucherRabatte();

// RABATT_AKTIONEN kommt jetzt aus der Bibliothek via useLibraryDiscounts()
// Fallback-Werte sind im Hook definiert

const FESTPREISE = {
  buehneProTag: 280,
  baustelleneinrichtung: 199,
  anfahrtRegional: 45,
  anfahrtProKm: 0.85,
  uebernachtungProNacht: 85,
};

const FF_ANSPRECHPARTNER = [
  { name: "Alexander Retzlaff", telefon: "0176 70408430", email: "a.retzlaff@fassadenfix.de", region: "Alle" },
  { name: "Sebastian Siebenhühner", telefon: "0159 26468 63", email: "s.siebenhuehner@fassadenfix.de", region: "Alle" },
  { name: "Ronny Ries", telefon: "0159 26468 61", email: "r.ries@fassadenfix.de", region: "SÜD" },
];

// MOCK_UNTERNEHMEN entfernt (KP-13) – Unternehmen werden via trpc.company.list geladen

// ============================================
// HELPER FUNCTIONS
// ============================================

// getBasispreis und getPreisstaffelLabel werden jetzt innerhalb der Komponente als Closures verwendet
// da sie Zugriff auf die Bibliothek-Daten (PREISSTAFFELUNG) benötigen}

function getFruehbucherRabatt(beauftragungsDatum: string): number {
  if (!beauftragungsDatum) return 0;
  const datum = new Date(beauftragungsDatum);
  for (const rabatt of FRUEHBUCHER_RABATTE) {
    if (datum <= new Date(rabatt.bisDatum)) {
      return rabatt.rabatt;
    }
  }
  return 0;
}

function berechneBuehnenTage(gesamtflaeche: number): number {
  return Math.ceil(gesamtflaeche / 500);
}

function berechneUebernachtung(entfernungKm: number, buehnenTage: number): { erforderlich: boolean; naechte: number } {
  if (entfernungKm > 100) {
    return { erforderlich: true, naechte: buehnenTage };
  }
  if (entfernungKm > 50 && buehnenTage > 1) {
    return { erforderlich: true, naechte: buehnenTage - 1 };
  }
  return { erforderlich: false, naechte: 0 };
}

// berechneAnfahrt entfernt – Anfahrtskosten werden jetzt dynamisch aus der Bibliothek geladen (KW-3)

// ============================================
// STEP 1: PROJEKT AUSWÄHLEN
// ============================================

interface ProjektAuswahlStepProps {
  unternehmen: Unternehmen[];
  selectedUnternehmenId: string;
  setSelectedUnternehmenId: (id: string) => void;
  selectedProjektId: string;
  setSelectedProjektId: (id: string) => void;
  selectedKontaktId: string;
  setSelectedKontaktId: (id: string) => void;
  // HubSpot Deal Integration
  selectedHubSpotDealId: string | null;
  setSelectedHubSpotDealId: (id: string | null) => void;
  createNewDeal: boolean;
  setCreateNewDeal: (create: boolean) => void;
}

function ProjektAuswahlStep({
  unternehmen,
  selectedUnternehmenId,
  setSelectedUnternehmenId,
  selectedProjektId,
  setSelectedProjektId,
  selectedKontaktId,
  setSelectedKontaktId,
  selectedHubSpotDealId,
  setSelectedHubSpotDealId,
  createNewDeal,
  setCreateNewDeal,
}: ProjektAuswahlStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredUnternehmen = useMemo(() => {
    if (!searchTerm) return unternehmen;
    return unternehmen.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.kuerzel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [unternehmen, searchTerm]);

  const selectedUnternehmen = unternehmen.find(u => u.id === selectedUnternehmenId);
  const projekte = selectedUnternehmen?.projekte || [];
  const kontakte = selectedUnternehmen?.kontakte || [];
  const selectedProjekt = projekte.find(p => p.id === selectedProjektId);

  return (
    <div className="space-y-4">
      {/* Unternehmen auswählen */}
      <Card className="ff-card border-primary/20">
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
              className="pl-9 h-12"
            />
          </div>
          
          <Select
            value={selectedUnternehmenId}
            onValueChange={(value) => {
              setSelectedUnternehmenId(value);
              setSelectedProjektId("");
              setSelectedKontaktId("");
            }}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Unternehmen auswählen" />
            </SelectTrigger>
            <SelectContent>
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
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedUnternehmen.kontakte.length} Kontakt(e), {selectedUnternehmen.projekte.length} Projekt(e) verfügbar</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ansprechpartner auswählen */}
      {selectedUnternehmen && kontakte.length > 0 && (
        <Card className="ff-card border-primary/20">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <RequiredLabel>Ansprechpartner</RequiredLabel>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <Select
              value={selectedKontaktId}
              onValueChange={setSelectedKontaktId}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Ansprechpartner auswählen" />
              </SelectTrigger>
              <SelectContent>
                {kontakte.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{k.name}</span>
                      <span className="text-muted-foreground text-xs">({k.position})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedKontaktId && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                {(() => {
                  const kontakt = kontakte.find(k => k.id === selectedKontaktId);
                  if (!kontakt) return null;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{kontakt.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{kontakt.telefon}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projekt auswählen */}
      {selectedUnternehmen && projekte.length > 0 && (
        <Card className="ff-card border-primary/20">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <RequiredLabel>Projekt</RequiredLabel>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            <Select
              value={selectedProjektId}
              onValueChange={setSelectedProjektId}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Projekt auswählen" />
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
                      <Badge variant="secondary" className="text-xs">
                        {p.immobilien.length} Immobilien
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProjekt && (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-medium mb-3">
                  <Sparkles className="w-4 h-4" />
                  Projektdaten geladen
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Projektnummer:</span>
                    <span className="ml-2 font-mono">{selectedProjekt.nummer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entfernung:</span>
                    <span className="ml-2 font-medium">{selectedProjekt.entfernungKm} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Immobilien:</span>
                    <span className="ml-2 font-medium">{selectedProjekt.immobilien.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className="ml-2 text-xs">{selectedProjekt.status}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* HubSpot Deal Auswahl */}
      {selectedUnternehmen && selectedProjekt && (
        <Card className="ff-card border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>HubSpot Deal-Verknüpfung</span>
              <Badge variant="outline" className="text-xs bg-orange-100">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            <div className="flex items-center gap-3">
              <Switch
                id="createNewDeal"
                checked={createNewDeal}
                onCheckedChange={(checked) => {
                  setCreateNewDeal(checked);
                  if (checked) setSelectedHubSpotDealId(null);
                }}
              />
              <label htmlFor="createNewDeal" className="text-sm cursor-pointer">
                Neuen Deal in HubSpot erstellen
              </label>
            </div>
            
            {!createNewDeal && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Oder bestehenden Deal auswählen:</Label>
                <Select
                  value={selectedHubSpotDealId || "none"}
                  onValueChange={(value) => setSelectedHubSpotDealId(value === "none" ? null : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Deal aus HubSpot wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Kein Deal ausgewählt</span>
                    </SelectItem>
                    {/* Deals werden dynamisch geladen */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Deals werden automatisch aus HubSpot geladen, wenn das Unternehmen eine HubSpot-ID hat.
                </p>
              </div>
            )}
            
            {createNewDeal && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ein neuer Deal wird beim Speichern des Angebots in HubSpot erstellt.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <RequiredFieldHint />
    </div>
  );
}

// ============================================
// STEP 2: IMMOBILIEN WÄHLEN
// ============================================

interface ImmobilienAuswahlStepProps {
  immobilien: any[];
  selectedImmobilienIds: string[];
  setSelectedImmobilienIds: (ids: string[]) => void;
  gesamtflaeche: number;
  preisstaffelung: Preisstaffel[];
}

function ImmobilienAuswahlStep({
  immobilien,
  selectedImmobilienIds,
  setSelectedImmobilienIds,
  gesamtflaeche,
  preisstaffelung: PREISSTAFFELUNG,
}: ImmobilienAuswahlStepProps) {
  const toggleImmobilie = (id: string) => {
    if (selectedImmobilienIds.includes(id)) {
      setSelectedImmobilienIds(selectedImmobilienIds.filter(i => i !== id));
    } else {
      setSelectedImmobilienIds([...selectedImmobilienIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedImmobilienIds(immobilien.map(i => i.id));
  };

  const deselectAll = () => {
    setSelectedImmobilienIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Schritt 2 von 5: Immobilien wählen</p>
            <p className="text-sm text-muted-foreground">
              Wähle die Immobilien aus, die in dieses Angebot aufgenommen werden sollen.
              Alle Daten stammen aus der Objektaufnahme.
            </p>
          </div>
        </div>
      </div>

      {/* Schnellauswahl */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll} className="gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Alle auswählen
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll} className="gap-1">
          Auswahl aufheben
        </Button>
      </div>

      {/* Immobilien-Liste */}
      <div className="space-y-3">
        {immobilien.map((immo) => {
          const isSelected = selectedImmobilienIds.includes(immo.id);
          const reinigungsflaecheGesamt = immo.seiten
            .filter((s: any) => s.reinigungsfaehig)
            .reduce((sum: number, s: any) => sum + s.flaeche, 0);
          const nichtReinigbar = immo.seiten.filter((s: any) => !s.reinigungsfaehig);

          return (
            <Card 
              key={immo.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
              )}
              onClick={() => toggleImmobilie(immo.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{immo.adresse}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{immo.fassadenart}</Badge>
                        {immo.maxHoehe && (
                          <Badge variant="secondary" className="text-xs">max. {immo.maxHoehe}m</Badge>
                        )}
                        {immo.buehnentyp && (
                          <Badge variant="secondary" className="text-xs">{immo.buehnentyp}</Badge>
                        )}
                        {immo.sperrungen && immo.sperrungen.length > 0 && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {immo.sperrungen.length} Sperrung(en)
                          </Badge>
                        )}
                      </div>
                      
                      {/* Seiten-Übersicht */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {immo.seiten.map((seite: any) => (
                          <div 
                            key={seite.name}
                            className={cn(
                              "p-2 rounded border",
                              seite.reinigungsfaehig 
                                ? "bg-green-50 border-green-200 text-green-700" 
                                : "bg-red-50 border-red-200 text-red-700"
                            )}
                          >
                            <div className="font-medium">{seite.name}</div>
                            <div>{seite.flaeche} m²</div>
                            {!seite.reinigungsfaehig && (
                              <div className="text-[10px] mt-1">Nicht reinigbar</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {reinigungsflaecheGesamt.toLocaleString("de-DE")} m²
                    </div>
                    <div className="text-xs text-muted-foreground">reinigungsfähig</div>
                    {nichtReinigbar.length > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        {nichtReinigbar.reduce((sum: number, s: any) => sum + s.flaeche, 0)} m² ausgeschlossen
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gesamtfläche */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              <span className="font-medium">Gesamtfläche (reinigungsfähig):</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {gesamtflaeche.toLocaleString("de-DE")} m²
              </div>
              <div className="text-sm text-muted-foreground">
                Preisstaffel: {getPreisstaffelLabel(gesamtflaeche, PREISSTAFFELUNG)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedImmobilienIds.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Bitte wähle mindestens eine Immobilie aus.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP 3: KALKULATION PRÜFEN
// ============================================

interface ZusatzleistungAuswahl {
  serviceId: number;
  name: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
}

// LK-01 bis LK-04: Sonderpositionen (manuell oder aus Katalog)
interface Sonderposition {
  id: string;
  name: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  ausKatalog: boolean;
  serviceId?: number;
}
interface BiblioPreise {
  anfahrtRegional: number;
  anfahrtProKm: number;
  regionalName: string;
  ueberregionalName: string;
  regionalUnit: string;
  ueberregionalUnit: string;
  buehneProTag: number;
  buehneName: string;
  uebernachtungProNacht: number;
  uebernachtungName: string;
  baustelleneinrichtung: number;
  baustelleneinrichtungName: string;
}
// Legacy-Alias für Kompatibilität
type AnfahrtPreise = BiblioPreise;
interface KalkulationStepProps {
  gesamtflaeche: number;
  entfernungKm: number;
  kalkulation: Kalkulation;
  preisstaffelung: Preisstaffel[];
  zusatzleistungen: ZusatzleistungAuswahl[];
  setZusatzleistungen: (z: ZusatzleistungAuswahl[]) => void;
  sonderpositionen: Sonderposition[];
  setSonderpositionen: (s: Sonderposition[]) => void;
  anfahrtPreise: AnfahrtPreise;
}
function KalkulationStep({
  gesamtflaeche,
  entfernungKm,
  kalkulation,
  preisstaffelung: PREISSTAFFELUNG,
  zusatzleistungen,
  setZusatzleistungen,
  sonderpositionen,
  setSonderpositionen,
  anfahrtPreise,
}: KalkulationStepProps) {
  // Leistungskatalog aus Bibliothek laden (LK-01)
  const { data: services } = trpc.library.services.list.useQuery();
  const zusatzServices = (services || []).filter((s: any) => s.serviceType === 'zusatzleistung' && s.status === 'aktiv');
  const alleServices = (services || []).filter((s: any) => s.status === 'aktiv');
  // LK-02: Autocomplete-Suche für Katalogprodukte
  const [katalogSuche, setKatalogSuche] = useState('');
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false);
  const katalogErgebnisse = useMemo(() => {
    if (!katalogSuche || katalogSuche.length < 2) return [];
    const q = katalogSuche.toLowerCase();
    return alleServices.filter((s: any) =>
      s.name.toLowerCase().includes(q) ||
      (s.sku && s.sku.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [katalogSuche, alleServices]);
  // LK-04: Sonderposition manuell hinzufügen
  const addSonderposition = (service?: any) => {
    const id = `sp-${Date.now()}`;
    if (service) {
      // LK-03: Preis und Einheit aus Katalog übernehmen
      const preis = parseFloat(service.basePrice || '0');
      setSonderpositionen([...sonderpositionen, {
        id, name: service.name, menge: 1, einheit: service.pricingUnit || 'Stk.',
        einzelpreis: preis, gesamtpreis: preis, ausKatalog: true, serviceId: service.id,
      }]);
    } else {
      setSonderpositionen([...sonderpositionen, {
        id, name: '', menge: 1, einheit: 'Stk.', einzelpreis: 0, gesamtpreis: 0, ausKatalog: false,
      }]);
    }
    setKatalogSuche(''); setShowKatalogDropdown(false);
  };
  const updateSonderposition = (id: string, field: keyof Sonderposition, value: any) => {
    setSonderpositionen(sonderpositionen.map(sp => {
      if (sp.id !== id) return sp;
      const updated = { ...sp, [field]: value };
      if (field === 'menge' || field === 'einzelpreis') {
        updated.gesamtpreis = (field === 'menge' ? value : updated.menge) * (field === 'einzelpreis' ? value : updated.einzelpreis);
      }
      return updated;
    }));
  };
  const removeSonderposition = (id: string) => setSonderpositionen(sonderpositionen.filter(sp => sp.id !== id));
  const sonderpositionenSumme = sonderpositionen.reduce((sum, sp) => sum + sp.gesamtpreis, 0);
  const zusatzleistungenSumme = zusatzleistungen.reduce((sum, z) => sum + z.gesamtpreis, 0);

  const toggleZusatzleistung = (service: any) => {
    const existing = zusatzleistungen.find(z => z.serviceId === service.id);
    if (existing) {
      setZusatzleistungen(zusatzleistungen.filter(z => z.serviceId !== service.id));
    } else {
      const preis = parseFloat(service.basePrice || '0');
      setZusatzleistungen([...zusatzleistungen, {
        serviceId: service.id,
        name: service.name,
        menge: 1,
        einheit: service.pricingUnit || 'pauschal',
        einzelpreis: preis,
        gesamtpreis: preis,
      }]);
    }
  };

  const updateMenge = (serviceId: number, menge: number) => {
    setZusatzleistungen(zusatzleistungen.map(z => 
      z.serviceId === serviceId 
        ? { ...z, menge, gesamtpreis: z.einzelpreis * menge }
        : z
    ));
  };
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Schritt 3 von 5: Kalkulation prüfen</p>
            <p className="text-sm text-muted-foreground">
              Die Preise werden automatisch nach der FassadenFix Preisstaffelung berechnet.
            </p>
          </div>
        </div>
      </div>

      {/* Preisstaffel-Info */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Preisstaffelung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {PREISSTAFFELUNG.map((staffel) => {
              const isActive = gesamtflaeche >= staffel.minFlaeche && 
                (PREISSTAFFELUNG.findIndex(s => s.minFlaeche === staffel.minFlaeche) === 0 ||
                 gesamtflaeche < PREISSTAFFELUNG[PREISSTAFFELUNG.findIndex(s => s.minFlaeche === staffel.minFlaeche) - 1].minFlaeche);
              return (
                <div 
                  key={staffel.minFlaeche}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all",
                    gesamtflaeche >= staffel.minFlaeche && kalkulation.basispreisProQm === staffel.preis
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-muted"
                  )}
                >
                  <div className="text-lg font-bold">{staffel.preis.toFixed(2)} €</div>
                  <div className="text-xs opacity-80">ab {staffel.minFlaeche.toLocaleString("de-DE")} m²</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Bei <strong>{gesamtflaeche.toLocaleString("de-DE")} m²</strong> gilt der Preis von <strong>{kalkulation.basispreisProQm.toFixed(2)} €/m²</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kostenübersicht */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Kostenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Menge</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">FassadenFix Systemreinigung</TableCell>
                <TableCell className="text-right">{gesamtflaeche.toLocaleString("de-DE")} m² × {kalkulation.basispreisProQm.toFixed(2)} €</TableCell>
                <TableCell className="text-right font-medium">
                  {kalkulation.reinigungGesamt.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {anfahrtPreise.buehneName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">{kalkulation.buehnenTage} Tag(e) × {anfahrtPreise.buehneProTag.toFixed(2)} €</TableCell>
                <TableCell className="text-right">
                  {kalkulation.buehnenKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {anfahrtPreise.baustelleneinrichtungName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">Pauschale</TableCell>
                <TableCell className="text-right">
                  {kalkulation.baustelleneinrichtung.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {entfernungKm <= 30 ? anfahrtPreise.regionalName : anfahrtPreise.ueberregionalName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">
                  {entfernungKm <= 30 
                    ? anfahrtPreise.regionalUnit
                    : `${entfernungKm} km × ${anfahrtPreise.anfahrtProKm.toFixed(2)} €`}
                </TableCell>
                <TableCell className="text-right">
                  {kalkulation.anfahrtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              {kalkulation.uebernachtungErforderlich && (
                <TableRow className="text-amber-600">
                  <TableCell>
                  {anfahrtPreise.uebernachtungName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                  <TableCell className="text-right">{kalkulation.uebernachtungNaechte} Nacht(e) × {anfahrtPreise.uebernachtungProNacht.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">
                    {kalkulation.uebernachtungKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <Separator className="my-4" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Summe netto</span>
              <span className="font-medium">{kalkulation.summeNetto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">zzgl. 19% MwSt.</span>
              <span>{kalkulation.mwst.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold text-primary pt-2">
              <span>Gesamtbetrag brutto</span>
              <span>{kalkulation.summeBrutto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LK-01 bis LK-04: Sonderpositionen aus Leistungskatalog oder manuell */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Weitere Positionen
          </CardTitle>
          <p className="text-sm text-muted-foreground">Positionen aus dem Leistungskatalog hinzufügen oder manuell eingeben.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Katalog-Suche mit Autocomplete (LK-02) */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Produkt suchen (Name oder Artikelnr.)..."
                  value={katalogSuche}
                  onChange={e => { setKatalogSuche(e.target.value); setShowKatalogDropdown(true); }}
                  onFocus={() => setShowKatalogDropdown(true)}
                  onBlur={() => setTimeout(() => setShowKatalogDropdown(false), 200)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => addSonderposition()} className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-1" /> Freie Position
              </Button>
            </div>
            {showKatalogDropdown && katalogErgebnisse.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-16 mt-1 bg-popover text-popover-foreground border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {katalogErgebnisse.map((service: any) => (
                  <button key={service.id} className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors flex items-center justify-between gap-3 border-b last:border-b-0"
                    onMouseDown={() => addSonderposition(service)}>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{service.name}</div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        {service.sku && <span className="font-mono">{service.sku}</span>}
                        <span>{service.serviceType === 'hauptleistung' ? 'Hauptleistung' : service.serviceType === 'zusatzleistung' ? 'Zusatz' : service.serviceType}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium text-sm">{parseFloat(service.basePrice || '0') > 0 ? `${parseFloat(service.basePrice).toFixed(2)} \u20ac` : '\u2013'}</div>
                      <div className="text-xs text-muted-foreground">{service.pricingUnit || 'Stk.'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Liste der Sonderpositionen */}
          {sonderpositionen.length > 0 && (
            <div className="space-y-2">
              {sonderpositionen.map((sp) => (
                <div key={sp.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {sp.ausKatalog ? <Badge variant="outline" className="text-xs">Katalog</Badge> : <Badge variant="secondary" className="text-xs">Manuell</Badge>}
                        <Input value={sp.name} onChange={e => updateSonderposition(sp.id, 'name', e.target.value)} placeholder="Positionsbezeichnung" className="h-8 text-sm font-medium" readOnly={sp.ausKatalog} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1"><Label className="text-xs text-muted-foreground">Menge:</Label>
                          <Input type="number" min={1} value={sp.menge} onChange={e => updateSonderposition(sp.id, 'menge', Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-8 text-sm" />
                        </div>
                        <div className="flex items-center gap-1"><Label className="text-xs text-muted-foreground">Einheit:</Label>
                          <Input value={sp.einheit} onChange={e => updateSonderposition(sp.id, 'einheit', e.target.value)} className="w-20 h-8 text-sm" />
                        </div>
                        <div className="flex items-center gap-1"><Label className="text-xs text-muted-foreground">Preis/E.:</Label>
                          <Input type="number" step="0.01" min={0} value={sp.einzelpreis} onChange={e => updateSonderposition(sp.id, 'einzelpreis', Math.max(0, parseFloat(e.target.value) || 0))} className="w-24 h-8 text-sm" />
                        </div>
                        <span className="text-sm font-medium ml-auto">= {sp.gesamtpreis.toFixed(2)} \u20ac</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeSonderposition(sp.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {sonderpositionenSumme > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-sm text-blue-700">Sonderpositionen gesamt:</span>
                  <span className="font-bold text-blue-700">{sonderpositionenSumme.toLocaleString("de-DE", { minimumFractionDigits: 2 })} \u20ac netto</span>
                </div>
              )}
            </div>
          )}
          {sonderpositionen.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">Keine weiteren Positionen. Nutzen Sie die Suche oder f\u00fcgen Sie eine freie Position hinzu.</p>
          )}
        </CardContent>
      </Card>

      {/* Zusatzleistungen aus Leistungskatalog */}
      {zusatzServices.length > 0 && (
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Zusatzleistungen aus Leistungskatalog
            </CardTitle>
            <p className="text-sm text-muted-foreground">Optionale Leistungen zum Angebot hinzufügen.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {zusatzServices.map((service: any) => {
              const isSelected = zusatzleistungen.some(z => z.serviceId === service.id);
              const selected = zusatzleistungen.find(z => z.serviceId === service.id);
              const preis = parseFloat(service.basePrice || '0');
              return (
                <div 
                  key={service.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  )}
                  onClick={() => toggleZusatzleistung(service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <div>
                        <div className="font-medium text-sm">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">{service.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {preis > 0 ? `${preis.toFixed(2)} €` : 'auf Anfrage'}
                      </div>
                      <div className="text-xs text-muted-foreground">{service.pricingUnit || 'pauschal'}</div>
                    </div>
                  </div>
                  {isSelected && selected && preis > 0 && service.pricingUnit !== 'pauschal' && (
                    <div className="mt-2 pt-2 border-t border-muted flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      <Label className="text-xs">Menge:</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        value={selected.menge} 
                        onChange={e => updateMenge(service.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">{service.pricingUnit}</span>
                      <span className="ml-auto font-medium text-sm">
                        = {selected.gesamtpreis.toFixed(2)} €
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {zusatzleistungenSumme > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 flex justify-between items-center">
                <span className="font-medium text-sm">Zusatzleistungen gesamt:</span>
                <span className="font-bold text-primary">
                  {zusatzleistungenSumme.toLocaleString("de-DE", { minimumFractionDigits: 2 })} € netto
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// STEP 4: RABATT & KONDITIONEN
// ============================================

interface RabattKonditionenStepProps {
  rabattAktionId: string;
  setRabattAktionId: (id: string) => void;
  beauftragungsDatum: string;
  setBeauftragungsDatum: (datum: string) => void;
  zahlungsziel: number;
  setZahlungsziel: (tage: number) => void;
  gueltigBis: string;
  setGueltigBis: (datum: string) => void;
  ansprechpartnerFF: string;
  setAnsprechpartnerFF: (name: string) => void;
  kalkulation: Kalkulation;
  premiumStoerer: boolean;
  setPremiumStoerer: (value: boolean) => void;
  rabattAktionen: RabattAktion[];
  // Textbausteine
  einleitungBlockId: string;
  setEinleitungBlockId: (id: string) => void;
  abschlussBlockId: string;
  setAbschlussBlockId: (id: string) => void;
  konditionenBlockId: string;
  setKonditionenBlockId: (id: string) => void;
}

function RabattKonditionenStep({
  rabattAktionId,
  setRabattAktionId,
  beauftragungsDatum,
  setBeauftragungsDatum,
  zahlungsziel,
  setZahlungsziel,
  gueltigBis,
  setGueltigBis,
  ansprechpartnerFF,
  setAnsprechpartnerFF,
  kalkulation,
  premiumStoerer,
  setPremiumStoerer,
  rabattAktionen: RABATT_AKTIONEN,
  einleitungBlockId,
  setEinleitungBlockId,
  abschlussBlockId,
  setAbschlussBlockId,
  konditionenBlockId,
  setKonditionenBlockId,
}: RabattKonditionenStepProps) {
  // Textbausteine laden
  const { data: einleitungBlocks } = trpc.textBlock.getByCategory.useQuery({ category: 'einleitung' });
  const { data: abschlussBlocks } = trpc.textBlock.getByCategory.useQuery({ category: 'abschluss' });
  const { data: konditionenBlocks } = trpc.textBlock.getByCategory.useQuery({ category: 'konditionen' });
  const { data: hinweisBlocks } = trpc.textBlock.getByCategory.useQuery({ category: 'sonstiges' });
  
  const fruehbucherRabatt = getFruehbucherRabatt(beauftragungsDatum);
  const selectedRabatt = RABATT_AKTIONEN.find(r => r.id === rabattAktionId);
  const effektiverRabatt = rabattAktionId === "fruehbucher" ? fruehbucherRabatt : (selectedRabatt?.prozent || 0);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary">Schritt 4 von 5: Rabatt & Konditionen</p>
            <p className="text-sm text-muted-foreground">
              Wähle einen Rabatt und lege die Angebotsbedingungen fest.
            </p>
          </div>
        </div>
      </div>

      {/* Rabatt-Auswahl */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            Rabatt-Aktion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={rabattAktionId} onValueChange={setRabattAktionId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Rabatt auswählen" />
            </SelectTrigger>
            <SelectContent>
              {RABATT_AKTIONEN.map((rabatt) => (
                <SelectItem key={rabatt.id} value={rabatt.id}>
                  <div className="flex items-center gap-2">
                    <span>{rabatt.label}</span>
                    {rabatt.prozent > 0 && (
                      <Badge variant="secondary" className="text-xs">{rabatt.prozent}%</Badge>
                    )}
                    {rabatt.dynamic && (
                      <Badge variant="outline" className="text-xs">bis 6%</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {rabattAktionId === "fruehbucher" && (
            <div className="space-y-3">
              <div>
                <Label>Beauftragungsdatum (für Frühbucher-Rabatt)</Label>
                <Input
                  type="date"
                  value={beauftragungsDatum}
                  onChange={(e) => setBeauftragungsDatum(e.target.value)}
                  className="mt-1 h-12"
                />
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="font-medium text-green-700 mb-2">Frühbucher-Staffelung (Code: FRÜHBUCHER)</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                  {FRUEHBUCHER_RABATTE.map((r) => (
                    <div key={r.bisDatum} className={cn(
                      "p-2 rounded",
                      beauftragungsDatum && new Date(beauftragungsDatum) <= new Date(r.bisDatum) && fruehbucherRabatt === r.rabatt
                        ? "bg-green-100 font-medium"
                        : ""
                    )}>
                      {r.label}
                    </div>
                  ))}
                </div>
                {fruehbucherRabatt > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200 font-medium text-green-700">
                    Aktueller Rabatt: {fruehbucherRabatt}%
                  </div>
                )}
              </div>
            </div>
          )}

          {effektiverRabatt > 0 && (
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">Rabatt:</span>
                <span className="text-2xl font-bold text-primary">-{effektiverRabatt}%</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Ersparnis: {(kalkulation.summeNetto * effektiverRabatt / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} € netto
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Konditionen */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Angebots-Konditionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label><RequiredLabel>Gültig bis</RequiredLabel></Label>
              <Input
                type="date"
                value={gueltigBis}
                onChange={(e) => setGueltigBis(e.target.value)}
                className="mt-1 h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">Standard: 4 Wochen</p>
            </div>
            <div>
              <Label><RequiredLabel>Zahlungsziel</RequiredLabel></Label>
              <Select value={String(zahlungsziel)} onValueChange={(v) => setZahlungsziel(Number(v))}>
                <SelectTrigger className="mt-1 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Tage (Standard)</SelectItem>
                  <SelectItem value="14">14 Tage</SelectItem>
                  <SelectItem value="21">21 Tage</SelectItem>
                  <SelectItem value="30">30 Tage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label><RequiredLabel>FassadenFix Ansprechpartner</RequiredLabel></Label>
            <Select value={ansprechpartnerFF} onValueChange={setAnsprechpartnerFF}>
              <SelectTrigger className="mt-1 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FF_ANSPRECHPARTNER.map((ap) => (
                  <SelectItem key={ap.name} value={ap.name}>
                    <div className="flex items-center gap-2">
                      <span>{ap.name}</span>
                      <Badge variant="outline" className="text-xs">{ap.region}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Textbausteine */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Textbausteine für Angebot
          </CardTitle>
          <p className="text-sm text-muted-foreground">Wähle vorgefertigte Texte für Einleitung, Abschluss und Konditionen.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Einleitung / Anschreiben */}
          <div>
            <Label>Anschreiben / Einleitung</Label>
            <Select value={einleitungBlockId} onValueChange={setEinleitungBlockId}>
              <SelectTrigger className="mt-1 h-12">
                <SelectValue placeholder="Anschreiben wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Anschreiben</SelectItem>
                {einleitungBlocks?.map((block: any) => (
                  <SelectItem key={block.id} value={String(block.id)}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {einleitungBlockId && einleitungBlockId !== 'none' && einleitungBlocks && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-line max-h-32 overflow-y-auto">
                {einleitungBlocks.find((b: any) => String(b.id) === einleitungBlockId)?.content}
              </div>
            )}
          </div>

          {/* Konditionen / Zahlungsbedingungen */}
          <div>
            <Label>Zahlungsbedingungen & Konditionen</Label>
            <Select value={konditionenBlockId} onValueChange={setKonditionenBlockId}>
              <SelectTrigger className="mt-1 h-12">
                <SelectValue placeholder="Konditionen wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Standard-Konditionen</SelectItem>
                {konditionenBlocks?.map((block: any) => (
                  <SelectItem key={block.id} value={String(block.id)}>
                    {block.name}
                  </SelectItem>
                ))}
                {hinweisBlocks?.map((block: any) => (
                  <SelectItem key={block.id} value={String(block.id)}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {konditionenBlockId && konditionenBlockId !== 'none' && (() => {
              const allBlocks = [...(konditionenBlocks || []), ...(hinweisBlocks || [])];
              const selected = allBlocks.find((b: any) => String(b.id) === konditionenBlockId);
              return selected ? (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-line max-h-32 overflow-y-auto">
                  {selected.content}
                </div>
              ) : null;
            })()}
          </div>

          {/* Abschluss */}
          <div>
            <Label>Abschluss / Grußformel</Label>
            <Select value={abschlussBlockId} onValueChange={setAbschlussBlockId}>
              <SelectTrigger className="mt-1 h-12">
                <SelectValue placeholder="Abschluss wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Abschlusstext</SelectItem>
                {abschlussBlocks?.map((block: any) => (
                  <SelectItem key={block.id} value={String(block.id)}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {abschlussBlockId && abschlussBlockId !== 'none' && abschlussBlocks && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-line max-h-32 overflow-y-auto">
                {abschlussBlocks.find((b: any) => String(b.id) === abschlussBlockId)?.content}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Störer-Variante */}
      <Card className="ff-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            FassadenFix Versprechen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <div className="font-medium">Premium-Störer im PDF</div>
              <div className="text-sm text-muted-foreground">
                Mit Gradient-Header und Icons für maximale Wirkung
              </div>
            </div>
            <Switch
              checked={premiumStoerer}
              onCheckedChange={setPremiumStoerer}
            />
          </div>
        </CardContent>
      </Card>

      <RequiredFieldHint />
    </div>
  );
}

// ============================================
// STEP 5: ZUSAMMENFASSUNG
// ============================================

interface ZusammenfassungStepProps {
  projektName: string;
  kunde: Kunde;
  immobilien: ImmobilieAusObjektaufnahme[];
  selectedImmobilienIds: string[];
  kalkulation: Kalkulation;
  rabattAktionId: string;
  effektiverRabatt: number;
  gueltigBis: string;
  zahlungsziel: number;
  ansprechpartnerFF: string;
  entfernungKm: number;
  anfahrtPreise: AnfahrtPreise;
}

function ZusammenfassungStep({
  projektName,
  kunde,
  immobilien,
  selectedImmobilienIds,
  kalkulation,
  rabattAktionId,
  effektiverRabatt,
  gueltigBis,
  zahlungsziel,
  ansprechpartnerFF,
  entfernungKm,
  anfahrtPreise,
}: ZusammenfassungStepProps) {
  const selectedImmobilien = immobilien.filter(i => selectedImmobilienIds.includes(i.id));
  const ansprechpartner = FF_ANSPRECHPARTNER.find(a => a.name === ansprechpartnerFF);
  
  // Berechne Endpreis mit Rabatt
  const rabattBetrag = kalkulation.summeNetto * effektiverRabatt / 100;
  const nettoNachRabatt = kalkulation.summeNetto - rabattBetrag;
  const mwstNachRabatt = nettoNachRabatt * 0.19;
  const bruttoNachRabatt = nettoNachRabatt + mwstNachRabatt;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-700">Schritt 5 von 5: Zusammenfassung</p>
            <p className="text-sm text-green-600">
              Prüfe alle Angaben und erstelle das Angebot mit einem Klick.
            </p>
          </div>
        </div>
      </div>

      {/* Projekt & Kunde */}
      <Card className="ff-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Projekt & Kunde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Projekt:</span>
            <span className="font-medium">{projektName}</span>
            <span className="text-muted-foreground">Kunde:</span>
            <span className="font-medium">{kunde.firma}</span>
            <span className="text-muted-foreground">Ansprechpartner:</span>
            <span>{kunde.ansprechpartner}</span>
            <span className="text-muted-foreground">Entfernung:</span>
            <span>{entfernungKm} km</span>
          </div>
        </CardContent>
      </Card>

      {/* Immobilien */}
      <Card className="ff-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Immobilien ({selectedImmobilien.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {selectedImmobilien.map((immo, idx) => {
              const flaeche = immo.seiten.filter(s => s.reinigungsfaehig).reduce((sum, s) => sum + s.flaeche, 0);
              return (
                <div key={immo.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                    <span>{immo.adresse}</span>
                  </div>
                  <span className="font-medium">{flaeche.toLocaleString("de-DE")} m²</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Kalkulation */}
      <Card className="ff-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Kalkulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>FassadenFix Systemreinigung</TableCell>
                <TableCell className="text-right">{kalkulation.gesamtflaeche.toLocaleString("de-DE")} m²</TableCell>
                <TableCell className="text-right font-medium">
                  {kalkulation.reinigungGesamt.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {anfahrtPreise.buehneName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">{kalkulation.buehnenTage} Tag(e) × {anfahrtPreise.buehneProTag.toFixed(2)} €</TableCell>
                <TableCell className="text-right">
                  {kalkulation.buehnenKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {anfahrtPreise.baustelleneinrichtungName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">Pauschale</TableCell>
                <TableCell className="text-right">
                  {kalkulation.baustelleneinrichtung.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {entfernungKm <= 30 ? anfahrtPreise.regionalName : anfahrtPreise.ueberregionalName}
                  <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                </TableCell>
                <TableCell className="text-right">
                  {entfernungKm <= 30 
                    ? anfahrtPreise.regionalUnit
                    : `${entfernungKm} km × ${anfahrtPreise.anfahrtProKm.toFixed(2)} €`}
                </TableCell>
                <TableCell className="text-right">
                  {kalkulation.anfahrtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </TableCell>
              </TableRow>
              {kalkulation.uebernachtungErforderlich && (
                <TableRow>
                  <TableCell>
                    {anfahrtPreise.uebernachtungName}
                    <span className="text-xs text-muted-foreground ml-1">(Bibliothek)</span>
                  </TableCell>
                  <TableCell className="text-right">{kalkulation.uebernachtungNaechte} Nacht(e) × {anfahrtPreise.uebernachtungProNacht.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">
                    {kalkulation.uebernachtungKosten.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <Separator className="my-3" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Summe netto</span>
              <span>{kalkulation.summeNetto.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
            {effektiverRabatt > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Rabatt ({effektiverRabatt}%)</span>
                <span>-{rabattBetrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
              </div>
            )}
            {effektiverRabatt > 0 && (
              <div className="flex justify-between font-medium">
                <span>Netto nach Rabatt</span>
                <span>{nettoNachRabatt.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>zzgl. 19% MwSt.</span>
              <span>{(effektiverRabatt > 0 ? mwstNachRabatt : kalkulation.mwst).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold text-primary pt-2">
              <span>Gesamtbetrag brutto</span>
              <span>{(effektiverRabatt > 0 ? bruttoNachRabatt : kalkulation.summeBrutto).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Konditionen */}
      <Card className="ff-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Konditionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Gültig bis:</span>
            <span className="font-medium">{new Date(gueltigBis).toLocaleDateString("de-DE")}</span>
            <span className="text-muted-foreground">Zahlungsziel:</span>
            <span>{zahlungsziel} Tage</span>
            <span className="text-muted-foreground">Ansprechpartner:</span>
            <span className="font-medium">{ansprechpartner?.name}</span>
            <span className="text-muted-foreground">Telefon:</span>
            <span>{ansprechpartner?.telefon}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bestätigung */}
      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-xl">
        <Checkbox id="bestaetigung" />
        <label htmlFor="bestaetigung" className="text-sm cursor-pointer">
          Ich bestätige, dass alle Angaben korrekt sind und das Angebot erstellt werden kann.
        </label>
      </div>
    </div>
  );
}

// ============================================
// MAIN WIZARD COMPONENT
// ============================================

/**
 * KW-1: Client-seitige Hilfsfunktion zum Parsen von Seiten aus Property-Daten
 * (Spiegelung der Server-Funktion parseSeitenFromProperty)
 */
function parseSeitenFromPropertyClient(prop: any) {
  const seiten: any[] = [];
  const sideConfigs = [
    { key: 'frontSide', name: 'Frontseite' },
    { key: 'backSide', name: 'Rückseite' },
    { key: 'leftGable', name: 'Linker Giebel' },
    { key: 'rightGable', name: 'Rechter Giebel' },
  ];
  for (const config of sideConfigs) {
    const sideData = prop[config.key];
    if (sideData) {
      try {
        const parsed = typeof sideData === 'string' ? JSON.parse(sideData) : sideData;
        if (parsed && typeof parsed === 'object') {
          seiten.push({
            id: `${prop.id}-${config.key}`,
            name: config.name,
            flaeche: Number(parsed.area || 0),
            reinigungsfaehig: parsed.cleanable !== false,
            besonderheiten: parsed.notes || parsed.notCleanableReason || '',
            buehnentyp: parsed.scaffoldType || 'standard',
            fassadenart: parsed.facadeType || 'WDVS',
          });
        }
      } catch (e) {
        console.warn(`Failed to parse ${config.key}:`, e);
      }
    }
  }
  return seiten;
}

export default function AngebotWizard({
  isOpen,
  onClose,
  onComplete,
}: AngebotWizardProps) {
  // Bibliothek-Daten laden
  const { preisstaffelung: PREISSTAFFELUNG, rabattAktionen: RABATT_AKTIONEN, preisstaffelOptions: PREISSTAFFEL_OPTIONS } = useLibraryDiscounts();
  
  // Alle Preise aus Bibliothek laden (KW-3 + KP-1)
  const { data: allServices } = trpc.library.services.list.useQuery();
  const anfahrtPreise = useMemo<BiblioPreise>(() => {
    const services = (allServices || []).filter((s: any) => s.status === 'aktiv');
    const regional = services.find((s: any) => s.name.includes('Regional') && s.name.includes('Abfahrt'));
    const ueberregional = services.find((s: any) => s.name.includes('berregional') && s.name.includes('Abfahrt'));
    const buehne = services.find((s: any) => s.name.includes('Hubarbeitsbühne'));
    const uebernachtung = services.find((s: any) => s.name.includes('bernachtung'));
    const baustelleneinrichtung = services.find((s: any) => s.name.includes('Baustelleneinrichtung'));
    return {
      anfahrtRegional: regional ? parseFloat(regional.basePrice || '45') : FESTPREISE.anfahrtRegional,
      anfahrtProKm: ueberregional ? parseFloat(ueberregional.basePrice || '0.85') : FESTPREISE.anfahrtProKm,
      regionalName: regional?.name || 'An-/Abfahrt Regional',
      ueberregionalName: ueberregional?.name || 'An-/Abfahrt Überregional',
      regionalUnit: regional?.pricingUnit || 'pauschal',
      ueberregionalUnit: ueberregional?.pricingUnit || 'pro km',
      buehneProTag: buehne ? parseFloat(buehne.basePrice || '280') : FESTPREISE.buehneProTag,
      buehneName: buehne?.name || 'Hubarbeitsbühne',
      uebernachtungProNacht: uebernachtung ? parseFloat(uebernachtung.basePrice || '85') : FESTPREISE.uebernachtungProNacht,
      uebernachtungName: uebernachtung?.name || 'Übernachtungspauschale',
      baustelleneinrichtung: baustelleneinrichtung ? parseFloat(baustelleneinrichtung.basePrice || '199') : FESTPREISE.baustelleneinrichtung,
      baustelleneinrichtungName: baustelleneinrichtung?.name || 'Baustelleneinrichtung',
    };
  }, [allServices]);

  // State für Projektzuordnung
  const [selectedUnternehmenId, setSelectedUnternehmenId] = useState("");
  const [selectedProjektId, setSelectedProjektId] = useState("");
  const [selectedKontaktId, setSelectedKontaktId] = useState("");
  const [selectedImmobilienIds, setSelectedImmobilienIds] = useState<string[]>([]);
  // NEU: State für Seiten-Auswahl (gemäß Interview)
  const [selectedSeiten, setSelectedSeiten] = useState<SelectedSeite[]>([]);
  
  // State für Rabatt & Konditionen
  const [rabattAktionId, setRabattAktionId] = useState("keine");
  const [beauftragungsDatum, setBeauftragungsDatum] = useState("");
  const [zahlungsziel, setZahlungsziel] = useState(7);
  const [gueltigBis, setGueltigBis] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 28);
    return date.toISOString().split("T")[0];
  });
  const [ansprechpartnerFF, setAnsprechpartnerFF] = useState(FF_ANSPRECHPARTNER[0].name);
  const [premiumStoerer, setPremiumStoerer] = useState(true);
  
  // Textbausteine State
  const [zusatzleistungen, setZusatzleistungen] = useState<ZusatzleistungAuswahl[]>([]);
  // LK-01: Sonderpositionen aus Leistungskatalog oder manuell
  const [sonderpositionen, setSonderpositionen] = useState<Sonderposition[]>([]);
  const [einleitungBlockId, setEinleitungBlockId] = useState("none");
  const [abschlussBlockId, setAbschlussBlockId] = useState("none");
  const [konditionenBlockId, setKonditionenBlockId] = useState("none");
  
  // PDF Preview State
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [angebotNummer, setAngebotNummer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // tRPC Mutations
  const saveFromWizard = trpc.offer.saveFromWizard.useMutation();
  const utils = trpc.useUtils();
  
  // HubSpot Deal State
  const [selectedHubSpotDealId, setSelectedHubSpotDealId] = useState<string | null>(null);
  const [createNewDeal, setCreateNewDeal] = useState(false);

  // Lade Unternehmen aus der Datenbank
  const { data: unternehmenData, isLoading: isLoadingUnternehmen } = trpc.offer.getCompaniesForWizard.useQuery();
  const unternehmenListe: Unternehmen[] = (unternehmenData || []) as Unternehmen[];

  // Abgeleitete Daten
  const selectedUnternehmen = unternehmenListe.find(u => u.id === selectedUnternehmenId);
  const selectedProjekt = selectedUnternehmen?.projekte.find(p => p.id === selectedProjektId);
  const selectedKontakt = selectedUnternehmen?.kontakte.find(k => k.id === selectedKontaktId);
  const entfernungKm = selectedProjekt?.entfernungKm || 50;

  // KW-1 Loom-Feedback: Erweiterte Immobilien-Logik
  // 1. Projekt ausgewählt → dessen Immobilien (vorausgewählt)
  // 2. Kein Projekt, aber Unternehmen → alle Immobilien aller Projekte des Unternehmens
  // 3. Keine passende → aus allen Immobilien im System auswählen
  const [showAlleImmobilien, setShowAlleImmobilien] = useState(false);
  const { data: alleImmobilienRaw } = trpc.property.list.useQuery(undefined, {
    enabled: showAlleImmobilien,
  });

  const immobilienAusProjekt = useMemo(() => {
    // Fall 1: Projekt ausgewählt → dessen Immobilien
    if (selectedProjekt?.immobilien && selectedProjekt.immobilien.length > 0) {
      return selectedProjekt.immobilien;
    }
    // Fall 2: Kein Projekt, aber Unternehmen → alle Immobilien aller Projekte
    if (selectedUnternehmen?.projekte) {
      const alleUnternehmensImmobilien = selectedUnternehmen.projekte.flatMap(p => p.immobilien || []);
      if (alleUnternehmensImmobilien.length > 0) {
        return alleUnternehmensImmobilien;
      }
    }
    // Fall 3: "Alle Immobilien" aktiviert → aus DB laden und konvertieren
    if (showAlleImmobilien && alleImmobilienRaw) {
      return (alleImmobilienRaw as any[]).map((prop: any) => ({
        id: String(prop.id),
        name: prop.name || prop.street || 'Unbenannt',
        adresse: [prop.street, prop.postalCode, prop.city].filter(Boolean).join(', '),
        plz: prop.postalCode || '',
        ort: prop.city || '',
        fassadentyp: 'WDVS',
        besonderheiten: prop.accessNotes || '',
        sperrungen: [],
        balkonBruestung: [],
        sonderausstattung: prop.specialFeatures || [],
        seiten: parseSeitenFromPropertyClient(prop),
        maxHoehe: undefined,
      }));
    }
    return [];
  }, [selectedProjekt, selectedUnternehmen, showAlleImmobilien, alleImmobilienRaw]);

  // Immobilien-Quelle für Anzeige
  const immobilienQuelle = selectedProjekt?.immobilien?.length ? 'projekt' 
    : selectedUnternehmen?.projekte?.some(p => (p.immobilien || []).length > 0) ? 'unternehmen'
    : showAlleImmobilien ? 'alle' : 'keine';

  // Automatisch alle Immobilien auswählen wenn Projekt gewählt wird
  useEffect(() => {
    if (selectedProjekt && selectedProjekt.immobilien.length > 0 && selectedImmobilienIds.length === 0) {
      setSelectedImmobilienIds(selectedProjekt.immobilien.map(i => i.id));
    }
  }, [selectedProjektId]);

  // Reset "Alle Immobilien" wenn ein Projekt ausgewählt wird
  useEffect(() => {
    if (selectedProjektId) {
      setShowAlleImmobilien(false);
    }
  }, [selectedProjektId]);

  // Gesamtfläche berechnen (NEU: basiert auf selectedSeiten)
  const gesamtflaeche = useMemo(() => {
    // Wenn selectedSeiten vorhanden, nutze diese
    if (selectedSeiten.length > 0) {
      return selectedSeiten.reduce((sum, s) => sum + s.flaeche, 0);
    }
    // Fallback: alte Logik mit selectedImmobilienIds
    return immobilienAusProjekt
      .filter(i => selectedImmobilienIds.includes(i.id))
      .reduce((sum, immo) => {
        return sum + immo.seiten
          .filter(s => s.reinigungsfaehig)
          .reduce((sSum, s) => sSum + s.flaeche, 0);
      }, 0);
  }, [immobilienAusProjekt, selectedImmobilienIds, selectedSeiten]);

  // Kalkulation berechnen
  const kalkulation = useMemo<Kalkulation>(() => {
    const basispreisProQm = getPreisProQm(gesamtflaeche, PREISSTAFFELUNG);
    const reinigungGesamt = gesamtflaeche * basispreisProQm;
    const buehnenTage = berechneBuehnenTage(gesamtflaeche);
    const buehnenKosten = buehnenTage * anfahrtPreise.buehneProTag;
    const baustelleneinrichtung = anfahrtPreise.baustelleneinrichtung;
    // An-/Abfahrt aus Bibliothek (KW-3)
    const anfahrtKosten = entfernungKm <= 30 
      ? anfahrtPreise.anfahrtRegional 
      : Math.round(entfernungKm * anfahrtPreise.anfahrtProKm * 100) / 100;
    const uebernachtung = berechneUebernachtung(entfernungKm, buehnenTage);
    const uebernachtungKosten = uebernachtung.naechte * anfahrtPreise.uebernachtungProNacht;
    
    const summeNetto = reinigungGesamt + buehnenKosten + baustelleneinrichtung + anfahrtKosten + uebernachtungKosten;
    const mwst = summeNetto * 0.19;
    const summeBrutto = summeNetto + mwst;

    return {
      gesamtflaeche,
      basispreisProQm,
      rabattProzent: 0,
      rabattTyp: "",
      endpreisProQm: basispreisProQm,
      reinigungGesamt,
      buehnenTage,
      buehnenKosten,
      baustelleneinrichtung,
      uebernachtungErforderlich: uebernachtung.erforderlich,
      uebernachtungNaechte: uebernachtung.naechte,
      uebernachtungKosten,
      anfahrtKosten,
      summeNetto,
      mwst,
      summeBrutto,
    };
  }, [gesamtflaeche, entfernungKm, anfahrtPreise]);

  // Effektiver Rabatt
  const effektiverRabatt = useMemo(() => {
    if (rabattAktionId === "fruehbucher") {
      return getFruehbucherRabatt(beauftragungsDatum);
    }
    return RABATT_AKTIONEN.find(r => r.id === rabattAktionId)?.prozent || 0;
  }, [rabattAktionId, beauftragungsDatum]);

  // Kunde aus Kontakt erstellen
  const kunde: Kunde = useMemo(() => ({
    firma: selectedUnternehmen?.name || "",
    ansprechpartner: selectedKontakt?.name || "",
    strasse: "",
    plz: "",
    ort: "",
    telefon: selectedKontakt?.telefon || "",
    email: selectedKontakt?.email || "",
  }), [selectedUnternehmen, selectedKontakt]);

  // Immobilien für PDF konvertieren (NEU: basiert auf selectedSeiten)
  const immobilienForPDF: Immobilie[] = useMemo(() => {
    // Gruppiere selectedSeiten nach Immobilie
    const seitenByImmobilie = new Map<string, SelectedSeite[]>();
    selectedSeiten.forEach(seite => {
      const existing = seitenByImmobilie.get(seite.immobilieId) || [];
      seitenByImmobilie.set(seite.immobilieId, [...existing, seite]);
    });

    // Konvertiere zu PDF-Format
    return immobilienAusProjekt
      .filter(immo => seitenByImmobilie.has(immo.id))
      .map(immo => {
        const ausgewaehlteSeiten = seitenByImmobilie.get(immo.id) || [];
        return {
          id: immo.id,
          adresse: immo.adresse,
          seiten: ausgewaehlteSeiten.map(s => ({
            name: s.seiteName,
            flaeche: s.flaeche,
            selected: true,
          })),
          maxHoehe: immo.maxHoehe || 15,
          besonderheiten: Array.isArray(immo.besonderheiten) ? immo.besonderheiten.join(", ") : (immo.besonderheiten || ""),
        };
      });
  }, [immobilienAusProjekt, selectedSeiten]);

  // AngebotData für PDF
  // Textbausteine laden für PDF
  const { data: allTextBlocks } = trpc.textBlock.list.useQuery();
  const getTextBlockContent = (blockId: string) => {
    if (!blockId || blockId === 'none' || !allTextBlocks) return undefined;
    return allTextBlocks.find((b: any) => String(b.id) === blockId)?.content;
  };
  const getTextBlockName = (blockId: string) => {
    if (!blockId || blockId === 'none' || !allTextBlocks) return undefined;
    return allTextBlocks.find((b: any) => String(b.id) === blockId)?.name;
  };

  const angebotData: AngebotData = {
    projektName: selectedProjekt?.name || "",
    kunde,
    immobilien: immobilienForPDF,
    entfernungKm,
    beauftragungsDatum,
    kalkulation,
    textTyp: "standard",
    gueltigBis,
    zahlungsziel,
    ansprechpartnerFF,
    einleitungText: getTextBlockContent(einleitungBlockId),
    abschlussText: getTextBlockContent(abschlussBlockId),
    abschlussTextTitel: getTextBlockName(abschlussBlockId),
    zusatzleistungen: zusatzleistungen.length > 0 ? zusatzleistungen : undefined,
  };

  // AutoSave
  const wizardData = useMemo(() => ({
    selectedUnternehmenId,
    selectedProjektId,
    selectedKontaktId,
    selectedImmobilienIds,
    rabattAktionId,
    beauftragungsDatum,
    zahlungsziel,
    gueltigBis,
    ansprechpartnerFF,
    premiumStoerer,
  }), [selectedUnternehmenId, selectedProjektId, selectedKontaktId, selectedImmobilienIds, rabattAktionId, beauftragungsDatum, zahlungsziel, gueltigBis, ansprechpartnerFF, premiumStoerer]);

  const { status: saveStatus, lastSaved, loadSaved, clearSaved } = useAutoSave({
    key: "angebot-wizard-v2",
    data: wizardData,
    debounceMs: 1500,
    enabled: isOpen,
  });

  // Gespeicherte Daten laden
  useEffect(() => {
    if (isOpen) {
      const saved = loadSaved();
      if (saved) {
        if (saved.selectedUnternehmenId) setSelectedUnternehmenId(saved.selectedUnternehmenId);
        if (saved.selectedProjektId) setSelectedProjektId(saved.selectedProjektId);
        if (saved.selectedKontaktId) setSelectedKontaktId(saved.selectedKontaktId);
        if (saved.selectedImmobilienIds) setSelectedImmobilienIds(saved.selectedImmobilienIds);
        if (saved.rabattAktionId) setRabattAktionId(saved.rabattAktionId);
        if (saved.beauftragungsDatum) setBeauftragungsDatum(saved.beauftragungsDatum);
        if (saved.zahlungsziel) setZahlungsziel(saved.zahlungsziel);
        if (saved.gueltigBis) setGueltigBis(saved.gueltigBis);
        if (saved.ansprechpartnerFF) setAnsprechpartnerFF(saved.ansprechpartnerFF);
        if (saved.premiumStoerer !== undefined) setPremiumStoerer(saved.premiumStoerer);
        toast.info("Entwurf wiederhergestellt", {
          description: "Deine vorherigen Eingaben wurden geladen.",
        });
      }
    }
  }, [isOpen, loadSaved]);

  // Wizard Steps (5 Schritte gemäß MVP-Spec)
  const steps: WizardStep[] = [
    {
      id: "projekt",
      title: "Projekt",
      description: "Unternehmen & Projekt wählen",
      icon: FolderKanban,
      content: (
        <div>
          <div className="flex justify-end mb-4">
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
          <ProjektAuswahlStep
            unternehmen={unternehmenListe}
            selectedUnternehmenId={selectedUnternehmenId}
            setSelectedUnternehmenId={setSelectedUnternehmenId}
            selectedProjektId={selectedProjektId}
            setSelectedProjektId={setSelectedProjektId}
            selectedKontaktId={selectedKontaktId}
            setSelectedKontaktId={setSelectedKontaktId}
            selectedHubSpotDealId={selectedHubSpotDealId}
            setSelectedHubSpotDealId={setSelectedHubSpotDealId}
            createNewDeal={createNewDeal}
            setCreateNewDeal={setCreateNewDeal}
          />
        </div>
      ),
    },
    {
      id: "immobilien",
      title: "Immobilien & Seiten",
      description: "Seiten auswählen",
      icon: Home,
      content: (
        <div className="space-y-4">
          {/* KW-1: Quellen-Hinweis */}
          {immobilienQuelle === 'projekt' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Info className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Immobilien aus Projekt <strong>{selectedProjekt?.name}</strong> (vorausgewählt)</span>
            </div>
          )}
          {immobilienQuelle === 'unternehmen' && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Kein Projekt ausgewählt – zeige alle Immobilien von <strong>{selectedUnternehmen?.name}</strong></span>
            </div>
          )}
          {immobilienQuelle === 'alle' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Alle erfassten Immobilien im System werden angezeigt</span>
            </div>
          )}
          {immobilienQuelle === 'keine' && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">Keine Immobilien verfügbar. Wähle zuerst ein Projekt oder lade alle Immobilien.</p>
              <Button variant="outline" size="sm" onClick={() => setShowAlleImmobilien(true)}>
                <Building2 className="w-4 h-4 mr-2" />
                Alle Immobilien im System anzeigen
              </Button>
            </div>
          )}
          {immobilienAusProjekt.length > 0 && (
            <ImmobilienSeitenAuswahlStep
              immobilien={immobilienAusProjekt}
              selectedSeiten={selectedSeiten}
              setSelectedSeiten={setSelectedSeiten}
              gesamtflaeche={gesamtflaeche}
            />
          )}
          {/* Button um alle Immobilien zu laden, wenn aktuelle Quelle nicht ausreicht */}
          {immobilienQuelle !== 'alle' && immobilienQuelle !== 'keine' && (
            <div className="flex justify-center pt-2">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowAlleImmobilien(true)}>
                Andere Immobilie aus dem System wählen
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "kalkulation",
      title: "Kalkulation",
      description: "Preise prüfen",
      icon: Calculator,
      content: (
        <KalkulationStep
          gesamtflaeche={gesamtflaeche}
          entfernungKm={entfernungKm}
          kalkulation={kalkulation}
          preisstaffelung={PREISSTAFFELUNG}
          zusatzleistungen={zusatzleistungen}
          setZusatzleistungen={setZusatzleistungen}
          sonderpositionen={sonderpositionen}
          setSonderpositionen={setSonderpositionen}
          anfahrtPreise={anfahrtPreise}
        />
      ),
    },
    {
      id: "konditionen",
      title: "Konditionen",
      description: "Rabatt & Bedingungen",
      icon: Percent,
      content: (
        <RabattKonditionenStep
          rabattAktionId={rabattAktionId}
          setRabattAktionId={setRabattAktionId}
          beauftragungsDatum={beauftragungsDatum}
          setBeauftragungsDatum={setBeauftragungsDatum}
          zahlungsziel={zahlungsziel}
          setZahlungsziel={setZahlungsziel}
          gueltigBis={gueltigBis}
          setGueltigBis={setGueltigBis}
          ansprechpartnerFF={ansprechpartnerFF}
          setAnsprechpartnerFF={setAnsprechpartnerFF}
          kalkulation={kalkulation}
          premiumStoerer={premiumStoerer}
          setPremiumStoerer={setPremiumStoerer}
          rabattAktionen={RABATT_AKTIONEN}
          einleitungBlockId={einleitungBlockId}
          setEinleitungBlockId={setEinleitungBlockId}
          abschlussBlockId={abschlussBlockId}
          setAbschlussBlockId={setAbschlussBlockId}
          konditionenBlockId={konditionenBlockId}
          setKonditionenBlockId={setKonditionenBlockId}
        />
      ),
    },
    {
      id: "zusammenfassung",
      title: "Zusammenfassung",
      description: "Prüfen & erstellen",
      icon: CheckCircle2,
      content: (
        <ZusammenfassungStep
          projektName={selectedProjekt?.name || ""}
          kunde={kunde}
          immobilien={immobilienAusProjekt}
          selectedImmobilienIds={selectedImmobilienIds}
          kalkulation={kalkulation}
          rabattAktionId={rabattAktionId}
          effektiverRabatt={effektiverRabatt}
          gueltigBis={gueltigBis}
          zahlungsziel={zahlungsziel}
          ansprechpartnerFF={ansprechpartnerFF}
          entfernungKm={entfernungKm}
          anfahrtPreise={anfahrtPreise}
        />
      ),
    },
  ];

  const handleComplete = async () => {
    if (!selectedProjektId || !selectedUnternehmenId || !selectedKontaktId) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    setIsSaving(true);
    try {
      // Angebot in der Datenbank speichern
      const result = await saveFromWizard.mutateAsync({
        projectId: parseInt(selectedProjektId.replace(/\D/g, '') || '0') || 1,
        companyId: parseInt(selectedUnternehmenId.replace(/\D/g, '') || '0') || 1,
        contactId: parseInt(selectedKontaktId.replace(/\D/g, '') || '0') || 1,
        totalArea: gesamtflaeche,
        pricePerSqm: kalkulation.basispreisProQm,
        basePrice: kalkulation.reinigungGesamt,
        discount: effektiverRabatt,
        discountReason: rabattAktionId !== 'keine' ? rabattAktionId : undefined,
        netTotal: kalkulation.summeNetto * (1 - effektiverRabatt / 100),
        vatAmount: kalkulation.mwst * (1 - effektiverRabatt / 100),
        grossTotal: kalkulation.summeBrutto * (1 - effektiverRabatt / 100),
        scaffoldingDays: kalkulation.buehnenTage,
        overnightStays: kalkulation.uebernachtungNaechte,
        distanceKm: entfernungKm,
        positions: immobilienForPDF,
        validUntil: new Date(gueltigBis),
      });

      setAngebotNummer(result.offerNumber);
      
      // Cache invalidieren
      await utils.offer.list.invalidate();
      
      clearSaved();
      
      toast.success("Angebot erstellt!", {
        description: `Das Angebot ${result.offerNumber} wurde in der Datenbank gespeichert.`,
      });
      
      setIsPDFPreviewOpen(true);
      onComplete(angebotData);
    } catch (error: any) {
      console.error("Fehler beim Speichern des Angebots:", error);
      toast.error("Fehler beim Speichern", {
        description: error?.message || "Unbekannter Fehler",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <WizardDialog
        isOpen={isOpen}
        onCancel={onClose}
        onComplete={handleComplete}
        steps={steps}
        title="Neues Angebot erstellen"
        description="Erstelle in 5 Schritten ein vollständiges Angebot nach FassadenFix Preisstaffelung."
      />

      {/* PDF Preview Dialog */}
      <AngebotPDFGenerator
        data={angebotData}
        angebotNummer={angebotNummer}
        isOpen={isPDFPreviewOpen}
        onClose={() => {
          setIsPDFPreviewOpen(false);
          onClose();
        }}
        stoererConfig={{
          preisstaffelId: 'standard',
          garantien: ['5-jahres-garantie', 'ergebnisgarantie', 'inspektion', 'pauschalfestpreis'],
          usePremiumVariant: premiumStoerer,
        }}
        bedingungenConfig={{
          gueltigkeitId: 'gueltigkeit-30',
          zahlungId: `zahlung-${zahlungsziel}`,
          sonstigeBedingungen: ['leistungsort', 'sperrungen', 'agb'],
        }}
      />
    </>
  );
}
