/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * OBJEKTAUFNAHME WIZARD - Überarbeitet nach Loom-Feedback (04.02.2026):
 * 
 * ÄNDERUNGEN (NEU):
 * 1. Stammdaten: "Unternehmen" als separates Feld hinzugefügt
 * 2. "Welcher Auftrag" → "Welches Projekt" (Auftrag entsteht erst nach Angebotsannahme)
 * 3. Automatische Filterung: Unternehmen filtert Kontakte und Projekte
 * 4. Fassadenart als neues Pflichtfeld pro Seite (WDVS, Putz, Klinker, etc.)
 * 5. Besonderheiten als Checkboxen statt Freitext (Graffiti, Schilder, etc.)
 * 6. Foto/Video-Upload bei Besonderheiten
 * 
 * VORHERIGE ÄNDERUNGEN:
 * - Seitenbezeichnungen: Frontseite, Rückseite, Linker Giebel, Rechter Giebel
 * - Sockel und Dach/Attika ENTFERNT
 * - "Zu reinigen" → "Reinigungsfähig" (mit Erklärfeld bei Nein)
 * - Fotos/Videos vereinfacht: Nur Upload-Buttons + optionales 360°-Link-Feld
 * - Zuwegung vereinfacht: Nur Ja/Nein mit Erklärfeld
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { WizardDialog, WizardStep } from "@/components/Wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Building2,
  Users,
  Camera,
  Upload,
  Link2,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Ruler,
  Car,
  FileCheck,
  Video,
  Globe,
  AlertCircle,
  Info,
  Briefcase,
  FolderKanban,
  Layers,
  ImagePlus,
  Search,
  Plus,
  Trash2,
  SplitSquareVertical,
} from "lucide-react";
import { toast } from "sonner";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { cn } from "@/lib/utils";
import { useAutoSave, AutoSaveIndicator } from "@/hooks/useAutoSave";
import BaustellenFotoUpload, { FotoMetadata, QuickFotoUpload } from "@/components/BaustellenFotoUpload";
import FotoUpload, { PhotoUploadResult } from "@/components/FotoUpload";
import { useWizardValidation, ValidationFeedback } from "@/hooks/useWizardValidation";
import { trpc } from "@/lib/trpc";

// Seiten-Typen
type SeiteKey = "front" | "rueck" | "links" | "rechts";

// NEU: Fassadenart-Optionen
const FASSADENART_OPTIONEN = [
  { value: "wdvs", label: "WDVS (Wärmedämmverbundsystem)" },
  { value: "putz", label: "Putz / Mineralputz" },
  { value: "klinker", label: "Klinker / Verblender" },
  { value: "beton", label: "Sichtbeton" },
  { value: "holz", label: "Holzfassade" },
  { value: "metall", label: "Metallfassade / Trapezblech" },
  { value: "glas", label: "Glasfassade" },
  { value: "naturstein", label: "Naturstein" },
  { value: "faserzement", label: "Faserzementplatten" },
  { value: "hpl", label: "HPL-Platten" },
  { value: "sonstige", label: "Sonstige" },
];

// NEU: Besonderheiten als Checkbox-Optionen
const BESONDERHEITEN_OPTIONEN = [
  { id: "graffiti", label: "Graffiti", beschreibung: "Schmierereien oder Tags vorhanden" },
  { id: "schilder", label: "Schilder/Werbung", beschreibung: "Werbetafeln, Firmenschilder" },
  { id: "balkone", label: "Balkone", beschreibung: "Balkone oder Loggien vorhanden" },
  { id: "markisen", label: "Markisen/Jalousien", beschreibung: "Außenliegende Beschattung" },
  { id: "klimaanlagen", label: "Klimaanlagen", beschreibung: "Außengeräte an der Fassade" },
  { id: "leitungen", label: "Leitungen/Rohre", beschreibung: "Sichtbare Leitungen" },
  { id: "bewuchs", label: "Bewuchs/Pflanzen", beschreibung: "Efeu, Kletterpflanzen" },
  { id: "schwerzugaenglich", label: "Schwer zugänglich", beschreibung: "Bereiche nicht erreichbar" },
  { id: "denkmalschutz", label: "Denkmalschutz", beschreibung: "Besondere Auflagen" },
  { id: "sonstiges", label: "Sonstiges", beschreibung: "Andere Besonderheiten" },
];

// DB-Daten werden jetzt über tRPC geladen statt Mock-Daten

// Teilfläche für Aufmaß-Untergliederung (Loom-Feedback 09.02.2026)
interface Teilflaeche {
  breite: number;
  hoehe: number;
  flaeche: number;
  bemerkung: string;
}

interface SeiteData {
  key: SeiteKey;
  label: string;
  beschreibung: string;
  // icon is NOT stored in data (breaks JSON serialization for auto-save)
  breite: number;
  hoehe: number;
  flaeche: number;
  // Loom-Feedback: Teilflächen für unterbrochene Fassaden (z.B. Fahrstuhlschächte)
  hasSubAreas: boolean;
  subAreas: Teilflaeche[];
  reinigungsfaehig: boolean | null;
  ausschlussgrund: string;
  fassadenart: string; // NEU
  bilder: string[];
  video: string;
  tour360: string;
  zuwegungProblematisch: boolean | null;
  zuwegungBeschreibung: string;
  besonderheiten: string[]; // GEÄNDERT: Array von IDs statt Freitext
  besonderheitenSonstiges: string; // NEU: Freitext für "Sonstiges"
  besonderheitenFotos: string[]; // NEU: Fotos zu Besonderheiten
  // Sprint 5b: Technische Felder pro Seite (WAS)
  wasseranschlussVorhanden: boolean | null; // Nr.26: Wasseranschluss
  wasseranschlussOrt: string;
  wasseranschlussZoll: string;
  reinigungsmittel: string; // Nr.27: Reinigungsmittelauswahl
}

interface ObjektaufnahmeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Record<string, unknown>) => void;
  /** Pre-fill project ID when opened from ProjektDetail */
  initialProjectId?: number;
  /** Pre-fill company ID when opened from ProjektDetail */
  initialCompanyId?: number;
}

// Initial state for a side
const createEmptyTeilflaeche = (): Teilflaeche => ({
  breite: 0,
  hoehe: 0,
  flaeche: 0,
  bemerkung: "",
});

const createEmptySeite = (key: SeiteKey, label: string, beschreibung: string): SeiteData => ({
  key,
  label,
  beschreibung,
  breite: 0,
  hoehe: 0,
  flaeche: 0,
  hasSubAreas: false,
  subAreas: [],
  reinigungsfaehig: true,
  ausschlussgrund: "",
  fassadenart: "",
  bilder: [],
  video: "",
  tour360: "",
  zuwegungProblematisch: null,
  zuwegungBeschreibung: "",
  besonderheiten: [],
  besonderheitenSonstiges: "",
  besonderheitenFotos: [],
  // Sprint 5b
  wasseranschlussVorhanden: null,
  wasseranschlussOrt: "",
  wasseranschlussZoll: "",
  reinigungsmittel: "",
});

const SEITEN_CONFIG: { key: SeiteKey; label: string; beschreibung: string }[] = [
  { 
    key: "front", 
    label: "Frontseite", 
    beschreibung: "Die Seite mit den Hauseingängen (Frontseite)",
  },
  { 
    key: "rueck", 
    label: "Rückseite", 
    beschreibung: "Die Seite gegenüber den Eingängen",
  },
  { 
    key: "links", 
    label: "Linker Giebel", 
    beschreibung: "Links, wenn man vor dem Haus auf die Eingänge schaut",
  },
  { 
    key: "rechts", 
    label: "Rechter Giebel", 
    beschreibung: "Rechts, wenn man vor dem Haus auf die Eingänge schaut",
  },
];

// Icon-Lookup zur Renderzeit (nicht in Daten speichern, da JSON.stringify React-Elemente zerstört)
const SEITE_ICONS: Record<SeiteKey, React.ReactNode> = {
  front: <ArrowUp className="w-5 h-5" />,
  rueck: <ArrowDown className="w-5 h-5" />,
  links: <ArrowLeft className="w-5 h-5" />,
  rechts: <ArrowRight className="w-5 h-5" />,
};

function getSeiteIcon(key: SeiteKey): React.ReactNode {
  return SEITE_ICONS[key];
}

// NEU: Stammdaten Step mit Unternehmen, Projekt und automatischer Filterung
interface StammdatenStepProps {
  selectedUnternehmen: string;
  setSelectedUnternehmen: (id: string) => void;
  selectedKontakt: string;
  setSelectedKontakt: (id: string) => void;
  selectedProjekt: string;
  setSelectedProjekt: (id: string) => void;
  // Adress-Felder
  strasse: string;
  setStrasse: (v: string) => void;
  plz: string;
  setPlz: (v: string) => void;
  ort: string;
  setOrt: (v: string) => void;
}

function StammdatenStep({
  selectedUnternehmen,
  setSelectedUnternehmen,
  selectedKontakt,
  setSelectedKontakt,
  selectedProjekt,
  setSelectedProjekt,
  strasse,
  setStrasse,
  plz,
  setPlz,
  ort,
  setOrt,
}: StammdatenStepProps) {
  // Daten aus der Datenbank laden
  const { data: companiesData } = trpc.company.list.useQuery();
  const { data: contactsData } = trpc.contact.list.useQuery();
  const { data: projectsData } = trpc.project.list.useQuery();

  const companies = useMemo(() => companiesData || [], [companiesData]);
  const allContacts = useMemo(() => contactsData || [], [contactsData]);
  const allProjects = useMemo(() => projectsData || [], [projectsData]);

  // Unternehmenssuche (wie im ProjektWizard)
  const [companySearch, setCompanySearch] = useState("");
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies.slice(0, 50);
    const q = companySearch.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.city && c.city.toLowerCase().includes(q))
    ).slice(0, 50);
  }, [companies, companySearch]);

  // Gefilterte Kontakte und Projekte basierend auf gewähltem Unternehmen
  const companyId = selectedUnternehmen ? parseInt(selectedUnternehmen) : null;
  const filteredKontakte = useMemo(() => {
    if (!companyId) return allContacts;
    return allContacts.filter(c => c.companyId === companyId);
  }, [allContacts, companyId]);
  const filteredProjekte = useMemo(() => {
    if (!companyId) return allProjects;
    return allProjects.filter(p => p.companyId === companyId);
  }, [allProjects, companyId]);

  // Reset Kontakt und Projekt wenn Unternehmen wechselt
  const handleUnternehmenChange = (value: string) => {
    setSelectedUnternehmen(value);
    setSelectedKontakt("");
    setSelectedProjekt("");
  };

  return (
    <div className="space-y-6">
      {/* Adresse */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <MapPin className="w-4 h-4" />
            Wo ist das Objekt?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="strasse">Straße & Nr. *</Label>
              <Input id="strasse" placeholder="Musterstraße 1-5" className="h-11" value={strasse} onChange={(e) => setStrasse(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="plz">PLZ *</Label>
              <Input id="plz" placeholder="12345" className="h-11" value={plz} onChange={(e) => setPlz(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ort">Ort *</Label>
              <Input id="ort" placeholder="Musterstadt" className="h-11" value={ort} onChange={(e) => setOrt(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEU: Unternehmen & Kontakt - mit automatischer Filterung */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Briefcase className="w-4 h-4" />
            Unternehmen & Ansprechpartner
            <HelpTooltip 
              content="Wähle zuerst das Unternehmen aus HubSpot. Danach werden nur noch die zugehörigen Kontakte und Projekte angezeigt." 
              title="Automatische Filterung"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unternehmen - Hauptauswahl mit Suchfeld */}
            <div>
              <Label htmlFor="unternehmen">Welches Unternehmen? *</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Unternehmen suchen..." 
                  className="pl-9"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>
              <Select value={selectedUnternehmen} onValueChange={handleUnternehmenChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Unternehmen wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()} title={`${c.name}${c.city ? ` (${c.city})` : ''}`}>
                      <span className="truncate max-w-[300px] inline-block">{c.name}</span>
                      {c.city && <span className="text-muted-foreground ml-2 shrink-0">({c.city})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {companySearch && filteredCompanies.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Keine Unternehmen für "{companySearch}" gefunden</p>
              )}
            </div>
            
            {/* Kontakt - gefiltert nach Unternehmen */}
            <div>
              <Label htmlFor="kontakt">Wer ist der Ansprechpartner?</Label>
              <Select 
                value={selectedKontakt} 
                onValueChange={setSelectedKontakt}
                disabled={!selectedUnternehmen}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={selectedUnternehmen ? "Person wählen..." : "Erst Unternehmen wählen"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredKontakte.map((k: any) => (
                    <SelectItem key={k.id} value={k.id.toString()}>
                      {k.firstName || ''} {k.lastName}{k.position ? ` (${k.position})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUnternehmen && filteredKontakte.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Keine Kontakte für dieses Unternehmen</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEU: Projekt-Zuordnung - NICHT Auftrag! */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <FolderKanban className="w-4 h-4" />
            Projekt-Zuordnung
            <HelpTooltip 
              content="Ordne diese Immobilie einem bestehenden Projekt zu. Ein Auftrag entsteht erst, wenn ein Angebot angenommen wird." 
              title="Projekt vs. Auftrag"
            />
          </div>
          <div>
            <Label htmlFor="projekt">Welches Projekt? (optional)</Label>
            <Select 
              value={selectedProjekt} 
              onValueChange={setSelectedProjekt}
              disabled={!selectedUnternehmen}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={selectedUnternehmen ? "Projekt wählen..." : "Erst Unternehmen wählen"} />
              </SelectTrigger>
              <SelectContent>
                {filteredProjekte.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} ({p.projectNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUnternehmen && filteredProjekte.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Keine Projekte für dieses Unternehmen</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              <Info className="w-3 h-3 inline mr-1" />
              Die Immobilie kann auch später einem Projekt zugeordnet werden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wann und wer? */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="w-4 h-4" />
            Wann und wer?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="datum">Wann warst du vor Ort? *</Label>
              <Input id="datum" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-11" />
            </div>
            <div>
              <Label htmlFor="mitarbeiter">Wer hat aufgenommen? *</Label>
              <Select>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Kollege wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">Max Mustermann</SelectItem>
                  <SelectItem value="m2">Anna Schmidt</SelectItem>
                  <SelectItem value="m3">Thomas Braun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nr.22: Anwesende Personen – Checkboxen (Interview-Vorgabe) */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Users className="w-4 h-4" />
            Wer war noch dabei?
            <HelpTooltip 
              content="Wähle aus, welche Personen bei der Objektaufnahme anwesend waren. Diese Info hilft bei der Nachbereitung."
              title="Anwesende Personen"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Wer war bei der Objektaufnahme vor Ort dabei?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "hausmeister", label: "Hausmeister" },
              { id: "techn_ma", label: "Techn. Mitarbeiter" },
              { id: "eigentuemer", label: "Eigentümervertreter" },
              { id: "mieter", label: "Mieter/Bewohner" },
              { id: "verwalter", label: "Verwalter" },
              { id: "architekt", label: "Architekt" },
            ].map((person) => (
              <div key={person.id} className="flex items-center space-x-2">
                <Checkbox id={`anwesend-${person.id}`} />
                <Label htmlFor={`anwesend-${person.id}`} className="text-sm cursor-pointer">
                  {person.label}
                </Label>
              </div>
            ))}
          </div>
          <div>
            <Label htmlFor="anwesend-sonstige">Sonstige Anwesende</Label>
            <Input id="anwesend-sonstige" placeholder="Name und Funktion" className="h-11" />
          </div>
        </CardContent>
      </Card>

      {/* Nr.23-25: Kaufmännische Stammdaten (Interview-Vorgabe) */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Briefcase className="w-4 h-4" />
            Entscheidung & Absprachen
            <HelpTooltip 
              content="Diese Informationen helfen dem Kundenberater beim Nachfassen und bei der Angebotserstellung."
              title="Kaufmännische Infos"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nr.24: Wer trifft die Entscheidung? */}
            <div>
              <Label htmlFor="entscheider">Wer trifft die Entscheidung? *</Label>
              <Input id="entscheider" placeholder="Name / Gremium" className="h-11" />
            </div>
            {/* Nr.23: Wann wird Entscheidung getroffen? */}
            <div>
              <Label htmlFor="entscheidungsdatum">Wann wird entschieden?</Label>
              <Input id="entscheidungsdatum" type="date" className="h-11" />
            </div>
          </div>
          {/* Nr.25: Besondere Absprachen */}
          <div>
            <Label htmlFor="absprachen">Besondere Absprachen / Infos</Label>
            <Textarea 
              id="absprachen" 
              placeholder="z.B. Termin nur nach Rücksprache, Budget-Obergrenze, besondere Anforderungen..." 
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Seiten-Erfassungs-Komponente mit Fassadenart und Besonderheiten-Checkboxen
interface SeiteErfassungProps {
  seite: SeiteData;
  onUpdate: (updates: Partial<SeiteData>) => void;
  projektName?: string;
}

function SeiteErfassung({ seite, onUpdate, projektName }: SeiteErfassungProps) {
  // Fläche automatisch berechnen (einfacher Modus)
  const handleDimensionChange = (field: "breite" | "hoehe", value: number) => {
    const updates: Partial<SeiteData> = { [field]: value };
    if (field === "breite") {
      updates.flaeche = value * seite.hoehe;
    } else {
      updates.flaeche = seite.breite * value;
    }
    onUpdate(updates);
  };

  // Teilflächen-Verwaltung (Loom-Feedback)
  const handleToggleSubAreas = (enabled: boolean) => {
    if (enabled) {
      // Aktivieren: Bestehende Maße als erste Teilfläche übernehmen
      const firstSubArea: Teilflaeche = {
        breite: seite.breite || 0,
        hoehe: seite.hoehe || 0,
        flaeche: (seite.breite || 0) * (seite.hoehe || 0),
        bemerkung: "",
      };
      onUpdate({
        hasSubAreas: true,
        subAreas: [firstSubArea],
        // Gesamtfläche bleibt gleich
      });
    } else {
      // Deaktivieren: Zurück zum einfachen Modus, Gesamtfläche beibehalten
      const totalArea = seite.subAreas.reduce((sum, sa) => sum + sa.flaeche, 0);
      // Erste Teilfläche als Hauptmaße übernehmen (oder 0)
      const first = seite.subAreas[0];
      onUpdate({
        hasSubAreas: false,
        subAreas: [],
        breite: first?.breite || 0,
        hoehe: first?.hoehe || 0,
        flaeche: totalArea,
      });
    }
  };

  const handleSubAreaChange = (index: number, field: "breite" | "hoehe" | "bemerkung", value: number | string) => {
    const newSubAreas = [...seite.subAreas];
    const sa = { ...newSubAreas[index] };
    if (field === "bemerkung") {
      sa.bemerkung = value as string;
    } else {
      sa[field] = value as number;
      sa.flaeche = (field === "breite" ? (value as number) : sa.breite) * (field === "hoehe" ? (value as number) : sa.hoehe);
    }
    newSubAreas[index] = sa;
    // Gesamtfläche = Summe aller Teilflächen
    const totalArea = newSubAreas.reduce((sum, s) => sum + s.flaeche, 0);
    onUpdate({ subAreas: newSubAreas, flaeche: totalArea });
  };

  const addSubArea = () => {
    onUpdate({ subAreas: [...seite.subAreas, createEmptyTeilflaeche()] });
  };

  const removeSubArea = (index: number) => {
    if (seite.subAreas.length <= 1) return; // Mindestens eine Teilfläche
    const newSubAreas = seite.subAreas.filter((_, i) => i !== index);
    const totalArea = newSubAreas.reduce((sum, s) => sum + s.flaeche, 0);
    onUpdate({ subAreas: newSubAreas, flaeche: totalArea });
  };

  const handlePhotoUpload = () => {
    toast.success("Foto hochgeladen", {
      description: "Das Foto wurde erfolgreich hinzugefügt.",
    });
    onUpdate({ bilder: [...seite.bilder, `foto_${Date.now()}.jpg`] });
  };

  const handleVideoUpload = () => {
    toast.success("Video hochgeladen", {
      description: "Das Video wurde erfolgreich hinzugefügt.",
    });
    onUpdate({ video: `video_${Date.now()}.mp4` });
  };

  const handleBesonderheitenFotoUpload = () => {
    toast.success("Besonderheiten-Foto hochgeladen", {
      description: "Das Foto wurde den Besonderheiten hinzugefügt.",
    });
    onUpdate({ besonderheitenFotos: [...seite.besonderheitenFotos, `besonderheit_${Date.now()}.jpg`] });
  };

  const toggleBesonderheit = (id: string) => {
    const newBesonderheiten = seite.besonderheiten.includes(id)
      ? seite.besonderheiten.filter(b => b !== id)
      : [...seite.besonderheiten, id];
    onUpdate({ besonderheiten: newBesonderheiten });
  };

  return (
    <div className="space-y-6">
      {/* Header mit Seiten-Info */}
      <div className="p-4 bg-primary/5 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {getSeiteIcon(seite.key)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{seite.label}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                {seite.beschreibung}
              </p>
            </div>
          </div>
          
          {/* Reinigungsfähig Toggle */}
          <div className="flex flex-col items-end gap-2">
            <Label className="text-sm font-medium">
              Reinigungsfähig?
              <HelpTooltip 
                content="Ist die Fassadenseite für die Fassadenreinigung geeignet? Bei Ausschluss bitte Grund angeben." 
                title="Reinigungsfähigkeit"
              />
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={seite.reinigungsfaehig === true ? "default" : "outline"}
                className={cn(
                  "gap-1",
                  seite.reinigungsfaehig === true && "bg-primary"
                )}
                onClick={() => onUpdate({ reinigungsfaehig: true, ausschlussgrund: "" })}
              >
                <CheckCircle2 className="w-4 h-4" />
                Ja
              </Button>
              <Button
                type="button"
                size="sm"
                variant={seite.reinigungsfaehig === false ? "destructive" : "outline"}
                className="gap-1"
                onClick={() => onUpdate({ reinigungsfaehig: false })}
              >
                <XCircle className="w-4 h-4" />
                Nein
              </Button>
            </div>
          </div>
        </div>
        
        {/* Erklärfeld wenn nicht reinigungsfähig */}
        {seite.reinigungsfaehig === false && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Label className="text-sm font-medium text-red-700 flex items-center gap-1 mb-2">
              <AlertCircle className="w-4 h-4" />
              Warum ist diese Seite nicht reinigungsfähig?
            </Label>
            <Textarea
              placeholder="z.B. Zu große Schäden, Fassade nicht geeignet, Denkmalschutz..."
              value={seite.ausschlussgrund}
              onChange={(e) => onUpdate({ ausschlussgrund: e.target.value })}
              className="min-h-[80px] bg-white"
            />
            <p className="text-xs text-red-600 mt-2">
              Bitte trotzdem die Fläche erfassen (Breite x Höhe)
            </p>
          </div>
        )}
      </div>

      {/* NEU: Fassadenart - Pflichtfeld */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Layers className="w-4 h-4" />
            Fassadenart *
            <HelpTooltip 
              content="Welche Art von Fassade hat diese Seite? WDVS ist am häufigsten bei Wohngebäuden." 
              title="Fassadenart"
            />
          </div>
          <Select 
            value={seite.fassadenart} 
            onValueChange={(value) => onUpdate({ fassadenart: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Fassadenart wählen..." />
            </SelectTrigger>
            <SelectContent>
              {FASSADENART_OPTIONEN.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Aufmaß */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Ruler className="w-4 h-4" />
              Aufmaß *
              <HelpTooltip 
                content="Messen Sie Breite und Höhe dieser Seite. Bei unterbrochenen Fassaden (z.B. Fahrstuhlschächte) können Sie Teilbereiche erfassen." 
                title="Aufmaß"
              />
            </div>
            {/* Gesamtfläche immer sichtbar */}
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Gesamtfläche</span>
              <div className="text-lg font-bold text-primary">
                {seite.flaeche.toLocaleString("de-DE")} m²
              </div>
            </div>
          </div>

          {/* Toggle: Teilbereiche */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id={`subAreas-${seite.key}`}
              checked={seite.hasSubAreas}
              onCheckedChange={(checked) => handleToggleSubAreas(!!checked)}
            />
            <label htmlFor={`subAreas-${seite.key}`} className="text-sm cursor-pointer flex items-center gap-2">
              <SplitSquareVertical className="w-4 h-4 text-muted-foreground" />
              Seite in Teilbereiche aufmessen
            </label>
            <HelpTooltip
              content="Aktivieren Sie dies, wenn die Fassadenseite durch Fahrstuhlschächte, Vorsprünge oder andere Unterbrechungen in Bereiche mit unterschiedlichen Höhen zerfällt."
              title="Teilbereiche"
            />
          </div>

          {/* Einfacher Modus (kein Teilbereich) */}
          {!seite.hasSubAreas && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Breite (m)</Label>
                <Input
                  type="number"
                  placeholder="z.B. 25"
                  value={seite.breite || ""}
                  onChange={(e) => handleDimensionChange("breite", parseFloat(e.target.value) || 0)}
                  className="h-11"
                />
              </div>
              <div>
                <Label>Höhe (m)</Label>
                <Input
                  type="number"
                  placeholder="z.B. 15"
                  value={seite.hoehe || ""}
                  onChange={(e) => handleDimensionChange("hoehe", parseFloat(e.target.value) || 0)}
                  className="h-11"
                />
              </div>
              <div>
                <Label>Fläche (m²)</Label>
                <div className="h-11 px-3 flex items-center bg-muted rounded-lg font-medium text-lg">
                  {seite.flaeche.toLocaleString("de-DE")} m²
                </div>
              </div>
            </div>
          )}

          {/* Teilbereiche-Modus */}
          {seite.hasSubAreas && (
            <div className="space-y-3">
              {seite.subAreas.map((subArea, index) => (
                <div key={index} className="p-3 border border-border rounded-lg bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Teilfläche {index + 1}
                    </span>
                    {seite.subAreas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeSubArea(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Breite (m)</Label>
                      <Input
                        type="number"
                        placeholder="z.B. 25"
                        value={subArea.breite || ""}
                        onChange={(e) => handleSubAreaChange(index, "breite", parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Höhe (m)</Label>
                      <Input
                        type="number"
                        placeholder="z.B. 15"
                        value={subArea.hoehe || ""}
                        onChange={(e) => handleSubAreaChange(index, "hoehe", parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fläche (m²)</Label>
                      <div className="h-10 px-3 flex items-center bg-muted rounded-lg font-medium">
                        {subArea.flaeche.toLocaleString("de-DE")} m²
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Bemerkung (optional)</Label>
                    <Input
                      placeholder="z.B. Bereich links neben Fahrstuhlschacht"
                      value={subArea.bemerkung}
                      onChange={(e) => handleSubAreaChange(index, "bemerkung", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              ))}

              {/* Button: Weitere Teilfläche hinzufügen */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 border-dashed"
                onClick={addSubArea}
              >
                <Plus className="w-4 h-4" />
                Weitere Teilfläche hinzufügen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos & Videos - NEU: Mit BaustellenFotoUpload */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <FotoUpload
            context="objektaufnahme"
            side={seite.key === "front" ? "front" : seite.key === "rueck" ? "back" : seite.key === "links" ? "left_gable" : "right_gable"}
            companyName={projektName}
            showCategoryInput={true}
            maxPhotos={10}
            label={`Fotos ${seite.label}`}
            description="Übersichtsfotos und Detailaufnahmen der Fassadenseite"
            onPhotosChange={(photos) => {
              const urls = photos.map(p => p.url);
              onUpdate({ bilder: urls });
            }}
          />
          
          {/* Video Upload */}
          <div className="pt-2 border-t">
            <div 
              className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={handleVideoUpload}
            >
              <Video className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium">Video hochladen</p>
              <p className="text-xs text-muted-foreground">MP4 bis 100MB</p>
              {seite.video && (
                <Badge variant="secondary" className="mt-2">1 Video</Badge>
              )}
            </div>
          </div>
          
          {/* 360° Tour Link */}
          <div className="pt-2">
            <Label className="flex items-center gap-2 mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              360° Tour URL (optional)
            </Label>
            <Input
              placeholder="https://theta360.com/... oder Ricoh 360 Link einfügen"
              value={seite.tour360}
              onChange={(e) => onUpdate({ tour360: e.target.value })}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zuwegung */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Car className="w-4 h-4" />
            Zuwegung
          </div>
          
          <div>
            <Label className="mb-2 block">Gibt es eine problematische Zuwegung?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={seite.zuwegungProblematisch === false ? "default" : "outline"}
                className={cn(
                  "gap-1",
                  seite.zuwegungProblematisch === false && "bg-primary"
                )}
                onClick={() => onUpdate({ zuwegungProblematisch: false, zuwegungBeschreibung: "" })}
              >
                <CheckCircle2 className="w-4 h-4" />
                Nein, alles OK
              </Button>
              <Button
                type="button"
                size="sm"
                variant={seite.zuwegungProblematisch === true ? "destructive" : "outline"}
                className="gap-1"
                onClick={() => onUpdate({ zuwegungProblematisch: true })}
              >
                <AlertCircle className="w-4 h-4" />
                Ja, problematisch
              </Button>
            </div>
          </div>
          
          {seite.zuwegungProblematisch === true && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Label className="text-sm font-medium text-amber-700 mb-2 block">
                Was ist das Problem?
              </Label>
              <Textarea
                placeholder="z.B. Enge Einfahrt, Parkverbot, Baustelle blockiert..."
                value={seite.zuwegungBeschreibung}
                onChange={(e) => onUpdate({ zuwegungBeschreibung: e.target.value })}
                className="min-h-[80px] bg-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEU: Besonderheiten als Checkboxen */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Building2 className="w-4 h-4" />
            Besonderheiten
            <HelpTooltip 
              content="Wähle alle zutreffenden Besonderheiten aus. Bei Bedarf kannst du Fotos zur Dokumentation hochladen." 
              title="Besonderheiten"
            />
          </div>
          
          {/* Checkbox-Grid */}
          <div className="grid grid-cols-2 gap-3">
            {BESONDERHEITEN_OPTIONEN.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  seite.besonderheiten.includes(option.id)
                    ? "bg-primary/5 border-primary"
                    : "bg-background hover:bg-muted/50"
                )}
                onClick={() => toggleBesonderheit(option.id)}
              >
                <Checkbox
                  id={`besonderheit-${option.id}`}
                  checked={seite.besonderheiten.includes(option.id)}
                  onCheckedChange={() => toggleBesonderheit(option.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`besonderheit-${option.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{option.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sonstiges Textfeld - nur wenn "Sonstiges" ausgewählt */}
          {seite.besonderheiten.includes("sonstiges") && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">
                Was für sonstige Besonderheiten?
              </Label>
              <Textarea
                placeholder="Beschreibe die sonstigen Besonderheiten..."
                value={seite.besonderheitenSonstiges}
                onChange={(e) => onUpdate({ besonderheitenSonstiges: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Foto-Upload für Besonderheiten */}
          {seite.besonderheiten.length > 0 && (
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Fotos zu Besonderheiten (optional)
              </Label>
              <div 
                className="border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={handleBesonderheitenFotoUpload}
              >
                <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm">Fotos zu Besonderheiten hochladen</p>
                {seite.besonderheitenFotos.length > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {seite.besonderheitenFotos.length} Foto(s)
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nr.26: Wasseranschluss (Interview-Vorgabe: Wo? Welcher? Wieviel Zoll?) */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Building2 className="w-4 h-4" />
            Wasseranschluss
            <HelpTooltip 
              content="Gibt es an dieser Seite einen Wasseranschluss für die Reinigung? Wenn ja: Wo genau, und welche Größe (Zoll)?"
              title="Wasseranschluss"
            />
          </div>
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              size="sm"
              variant={seite.wasseranschlussVorhanden === true ? "default" : "outline"}
              className={cn("gap-1", seite.wasseranschlussVorhanden === true && "bg-primary")}
              onClick={() => onUpdate({ wasseranschlussVorhanden: true })}
            >
              <CheckCircle2 className="w-4 h-4" />
              Ja
            </Button>
            <Button
              type="button"
              size="sm"
              variant={seite.wasseranschlussVorhanden === false ? "destructive" : "outline"}
              className="gap-1"
              onClick={() => onUpdate({ wasseranschlussVorhanden: false, wasseranschlussOrt: "", wasseranschlussZoll: "" })}
            >
              <XCircle className="w-4 h-4" />
              Nein
            </Button>
          </div>
          {seite.wasseranschlussVorhanden === true && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-primary/5 rounded-lg">
              <div>
                <Label htmlFor={`wasser-ort-${seite.key}`}>Wo genau?</Label>
                <Input 
                  id={`wasser-ort-${seite.key}`}
                  placeholder="z.B. Keller links, Außenwand Ecke" 
                  className="h-11"
                  value={seite.wasseranschlussOrt}
                  onChange={(e) => onUpdate({ wasseranschlussOrt: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`wasser-zoll-${seite.key}`}>Welche Größe (Zoll)?</Label>
                <Select value={seite.wasseranschlussZoll} onValueChange={(v) => onUpdate({ wasseranschlussZoll: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Zoll wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">1/2 Zoll (Standard)</SelectItem>
                    <SelectItem value="0.75">3/4 Zoll</SelectItem>
                    <SelectItem value="1">1 Zoll</SelectItem>
                    <SelectItem value="1.25">1 1/4 Zoll</SelectItem>
                    <SelectItem value="1.5">1 1/2 Zoll</SelectItem>
                    <SelectItem value="2">2 Zoll</SelectItem>
                    <SelectItem value="unbekannt">Unbekannt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nr.27: Reinigungsmittelauswahl (Interview-Vorgabe) */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Layers className="w-4 h-4" />
            Reinigungsmittel-Empfehlung
            <HelpTooltip 
              content="Welches Reinigungsmittel wird für diese Fassadenseite empfohlen? Basierend auf Fassadenart und Verschmutzungsgrad."
              title="Reinigungsmittel"
            />
          </div>
          <Select value={seite.reinigungsmittel} onValueChange={(v) => onUpdate({ reinigungsmittel: v })}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Reinigungsmittel wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard-Reiniger (leichte Verschmutzung)</SelectItem>
              <SelectItem value="algen">Algen- & Moos-Entferner</SelectItem>
              <SelectItem value="graffiti">Graffiti-Entferner</SelectItem>
              <SelectItem value="klinker">Klinker-Reiniger</SelectItem>
              <SelectItem value="beton">Beton-Reiniger</SelectItem>
              <SelectItem value="holz">Holz-Reiniger</SelectItem>
              <SelectItem value="impraegnierung">Imprägnierung / Versiegelung</SelectItem>
              <SelectItem value="sonder">Sondermittel (siehe Notizen)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}

// Sprint 5c: Kaufmännische Wizard-Seite (Nr.28-35)
// Intention: "Die Objektaufnahme ist die Datenbasis. Das Angebot ist die Ableitung der Lösung."
interface KaufmaennischeDatenProps {
  seiten: SeiteData[];
  kaufmaennisch: KaufmaennischeData;
  onUpdate: (updates: Partial<KaufmaennischeData>) => void;
}

interface KaufmaennischeData {
  // Nr.29: Welche Seiten sollen ins Angebot?
  seitenImAngebot: SeiteKey[];
  // Nr.30: Umsetzungstermin (KO-Termine)
  umsetzungstermin: string;
  umsetzungsterminHinweis: string;
  // Nr.31: Kann Wohnung gestellt werden?
  wohnungMoeglich: boolean | null;
  // Nr.32: Kennenlern-Angebot?
  kennenlernAngebot: boolean;
  // Nr.33: Frühbucher-Rabatt?
  fruehbucherRabatt: boolean;
  // Nr.34: Einkaufsgemeinschaft?
  einkaufsgemeinschaft: boolean;
  einkaufsgemeinschaftDetails: string;
  // Nr.35: Marketinggeeignet?
  marketingGeeignet: boolean;
}

const createEmptyKaufmaennisch = (): KaufmaennischeData => ({
  seitenImAngebot: ["front", "rueck", "links", "rechts"],
  umsetzungstermin: "",
  umsetzungsterminHinweis: "",
  wohnungMoeglich: null,
  kennenlernAngebot: false,
  fruehbucherRabatt: false,
  einkaufsgemeinschaft: false,
  einkaufsgemeinschaftDetails: "",
  marketingGeeignet: false,
});

function KaufmaennischeSeite({ seiten, kaufmaennisch, onUpdate }: KaufmaennischeDatenProps) {
  const reinigungsfaehigeSeiten = seiten.filter(s => s.reinigungsfaehig === true);
  const ausgewaehlteFlaeche = seiten
    .filter(s => kaufmaennisch.seitenImAngebot.includes(s.key) && s.reinigungsfaehig === true)
    .reduce((sum, s) => sum + s.flaeche, 0);

  const toggleSeiteImAngebot = (key: SeiteKey) => {
    const current = kaufmaennisch.seitenImAngebot;
    if (current.includes(key)) {
      onUpdate({ seitenImAngebot: current.filter(k => k !== key) });
    } else {
      onUpdate({ seitenImAngebot: [...current, key] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Nr.29: Welche Seiten sollen ins Angebot? */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <FileCheck className="w-4 h-4" />
            Welche Seiten sollen ins Angebot?
            <HelpTooltip 
              content="Wähle aus, welche der erfassten Gebäudeseiten im Angebot berücksichtigt werden sollen. Nicht-reinigungsfähige Seiten sind automatisch ausgeschlossen."
              title="Seiten im Angebot"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seiten.map((seite) => {
              const isSelected = kaufmaennisch.seitenImAngebot.includes(seite.key);
              const isDisabled = seite.reinigungsfaehig === false;
              return (
                <div
                  key={seite.key}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isDisabled && "opacity-50 cursor-not-allowed bg-muted",
                    !isDisabled && isSelected && "bg-primary/5 border-primary",
                    !isDisabled && !isSelected && "bg-background hover:bg-muted/50"
                  )}
                  onClick={() => !isDisabled && toggleSeiteImAngebot(seite.key)}
                >
                  <Checkbox
                    checked={isSelected && !isDisabled}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && toggleSeiteImAngebot(seite.key)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{seite.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {seite.flaeche.toLocaleString("de-DE")} m²
                      {isDisabled && " – nicht reinigungsfähig"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-primary/5 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Ausgewählte Angebotsfläche</p>
            <p className="text-xl font-bold text-primary">{ausgewaehlteFlaeche.toLocaleString("de-DE")} m²</p>
          </div>
        </CardContent>
      </Card>

      {/* Nr.30: Umsetzungstermin (KO-Termine) */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="w-4 h-4" />
            Umsetzungstermin
            <HelpTooltip 
              content="Gibt es feste Termine, die eingehalten werden müssen? Das sind KO-Termine, keine Wünsche."
              title="KO-Termine"
            />
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Achtung: Hier nur verbindliche KO-Termine eintragen, keine Wunschtermine!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ko-termin">KO-Termin (falls vorhanden)</Label>
              <Input 
                id="ko-termin" 
                type="date" 
                className="h-11"
                value={kaufmaennisch.umsetzungstermin}
                onChange={(e) => onUpdate({ umsetzungstermin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ko-hinweis">Hinweis zum Termin</Label>
              <Input 
                id="ko-hinweis" 
                placeholder="z.B. Vor Eigentümerversammlung, vor Mieterfest..." 
                className="h-11"
                value={kaufmaennisch.umsetzungsterminHinweis}
                onChange={(e) => onUpdate({ umsetzungsterminHinweis: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nr.31-35: Toggle-Felder */}
      <Card className="ff-card">
        <CardContent className="p-4 space-y-5">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Briefcase className="w-4 h-4" />
            Kaufmännische Optionen
          </div>

          {/* Nr.31: Wohnung */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Kann eine Wohnung gestellt werden?</p>
              <p className="text-xs text-muted-foreground">Für Übernachtung des Reinigungsteams vor Ort</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={kaufmaennisch.wohnungMoeglich === true ? "default" : "outline"}
                className={cn("gap-1", kaufmaennisch.wohnungMoeglich === true && "bg-primary")}
                onClick={() => onUpdate({ wohnungMoeglich: true })}
              >
                Ja
              </Button>
              <Button
                type="button"
                size="sm"
                variant={kaufmaennisch.wohnungMoeglich === false ? "destructive" : "outline"}
                className="gap-1"
                onClick={() => onUpdate({ wohnungMoeglich: false })}
              >
                Nein
              </Button>
            </div>
          </div>

          {/* Nr.32: Kennenlern-Angebot */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Kennenlern-Angebot?</p>
              <p className="text-xs text-muted-foreground">Reduzierter Preis für Erstauftrag zur Kundengewinnung</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="kennenlern"
                checked={kaufmaennisch.kennenlernAngebot}
                onCheckedChange={(checked) => onUpdate({ kennenlernAngebot: checked === true })}
              />
              <Label htmlFor="kennenlern" className="text-sm cursor-pointer">Ja</Label>
            </div>
          </div>

          {/* Nr.33: Frühbucher-Rabatt */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Frühbucher-Rabatt?</p>
              <p className="text-xs text-muted-foreground">Automatische Berechnung basierend auf Buchungszeitpunkt</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="fruehbucher"
                checked={kaufmaennisch.fruehbucherRabatt}
                onCheckedChange={(checked) => onUpdate({ fruehbucherRabatt: checked === true })}
              />
              <Label htmlFor="fruehbucher" className="text-sm cursor-pointer">Ja</Label>
            </div>
          </div>
          {kaufmaennisch.fruehbucherRabatt && (
            <div className="ml-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Frühbucher-Rabatt wird im Angebot automatisch berechnet (bis 31.12. des Vorjahres: 5%, bis 31.01.: 3%)
              </p>
            </div>
          )}

          {/* Nr.34: Einkaufsgemeinschaft */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Einkaufsgemeinschaft?</p>
              <p className="text-xs text-muted-foreground">Mehrere Objekte werden gemeinsam beauftragt</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="einkauf"
                checked={kaufmaennisch.einkaufsgemeinschaft}
                onCheckedChange={(checked) => onUpdate({ einkaufsgemeinschaft: checked === true })}
              />
              <Label htmlFor="einkauf" className="text-sm cursor-pointer">Ja</Label>
            </div>
          </div>
          {kaufmaennisch.einkaufsgemeinschaft && (
            <div className="ml-4">
              <Label htmlFor="einkauf-details">Details zur Einkaufsgemeinschaft</Label>
              <Input
                id="einkauf-details"
                placeholder="z.B. 3 Objekte der WBG Nordstadt"
                className="h-11"
                value={kaufmaennisch.einkaufsgemeinschaftDetails}
                onChange={(e) => onUpdate({ einkaufsgemeinschaftDetails: e.target.value })}
              />
            </div>
          )}

          {/* Nr.35: Marketinggeeignet */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Marketinggeeignet?</p>
              <p className="text-xs text-muted-foreground">Objekt eignet sich für Vorher/Nachher-Fotos und Referenzen</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="marketing"
                checked={kaufmaennisch.marketingGeeignet}
                onCheckedChange={(checked) => onUpdate({ marketingGeeignet: checked === true })}
              />
              <Label htmlFor="marketing" className="text-sm cursor-pointer">Ja</Label>
            </div>
          </div>
          {kaufmaennisch.marketingGeeignet && (
            <div className="ml-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <Info className="w-4 h-4 inline mr-1" />
                Das Marketing-Team wird automatisch informiert. Bitte besonders gute Vorher-Fotos machen!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Zusammenfassung
interface ZusammenfassungProps {
  seiten: SeiteData[];
  selectedUnternehmen: string;
  selectedProjekt: string;
  strasse: string;
  ort: string;
  isSaving: boolean;
}

function Zusammenfassung({ seiten, selectedUnternehmen, selectedProjekt, strasse, ort, isSaving }: ZusammenfassungProps) {
  const gesamtFlaeche = seiten.reduce((sum, s) => sum + s.flaeche, 0);
  const reinigungsfaehigeFlaeche = seiten
    .filter((s) => s.reinigungsfaehig === true)
    .reduce((sum, s) => sum + s.flaeche, 0);
  const ausgeschlosseneSeiten = seiten.filter((s) => s.reinigungsfaehig === false);
  const problematischeZuwegung = seiten.filter((s) => s.zuwegungProblematisch === true);
  const alleBesonderheiten = seiten.flatMap(s => s.besonderheiten);
  const uniqueBesonderheiten = Array.from(new Set(alleBesonderheiten));

  // Daten aus der DB laden
  const { data: companiesData } = trpc.company.list.useQuery();
  const { data: projectsData } = trpc.project.list.useQuery();
  const companyId = selectedUnternehmen ? parseInt(selectedUnternehmen) : null;
  const unternehmenName = companiesData?.find(c => c.id === companyId)?.name;
  const projektId = selectedProjekt ? parseInt(selectedProjekt) : null;
  const projektName = projectsData?.find(p => p.id === projektId)?.name;

  return (
    <div className="space-y-6">
      {/* Zuordnung */}
      {(unternehmenName || projektName) && (
        <Card className="ff-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary font-medium mb-3">
              <Link2 className="w-4 h-4" />
              Zuordnung
            </div>
            <div className="grid grid-cols-2 gap-4">
              {unternehmenName && (
                <div>
                  <p className="text-xs text-muted-foreground">Unternehmen</p>
                  <p className="font-medium">{unternehmenName}</p>
                </div>
              )}
              {projektName && (
                <div>
                  <p className="text-xs text-muted-foreground">Projekt</p>
                  <p className="font-medium">{projektName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Übersicht */}
      <Card className="ff-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary font-medium mb-4">
            <FileCheck className="w-5 h-5" />
            Zusammenfassung
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold text-primary">{seiten.length}</p>
              <p className="text-sm text-muted-foreground">Seiten erfasst</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{gesamtFlaeche.toLocaleString("de-DE")} m²</p>
              <p className="text-sm text-muted-foreground">Gesamtfläche</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{reinigungsfaehigeFlaeche.toLocaleString("de-DE")} m²</p>
              <p className="text-sm text-muted-foreground">Reinigungsfähig</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{seiten.reduce((sum, s) => sum + s.bilder.length, 0)}</p>
              <p className="text-sm text-muted-foreground">Fotos</p>
            </div>
          </div>

          {/* Seiten-Übersicht */}
          <div className="space-y-3">
            {seiten.map((seite) => (
              <div
                key={seite.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  seite.reinigungsfaehig === true && "bg-green-50 border-green-200",
                  seite.reinigungsfaehig === false && "bg-red-50 border-red-200",
                  seite.reinigungsfaehig === null && "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    {getSeiteIcon(seite.key)}
                  </div>
                  <div>
                    <p className="font-medium">{seite.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {seite.flaeche.toLocaleString("de-DE")} m² • {seite.fassadenart ? FASSADENART_OPTIONEN.find(f => f.value === seite.fassadenart)?.label : "Keine Fassadenart"} • {seite.bilder.length} Fotos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {seite.reinigungsfaehig === true && (
                    <Badge className="bg-green-100 text-green-700">Reinigungsfähig</Badge>
                  )}
                  {seite.reinigungsfaehig === false && (
                    <Badge variant="destructive">Ausgeschlossen</Badge>
                  )}
                  {seite.zuwegungProblematisch && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Zuwegung!
                    </Badge>
                  )}
                  {seite.besonderheiten.length > 0 && (
                    <Badge variant="outline">
                      {seite.besonderheiten.length} Besonderheit(en)
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Besonderheiten-Übersicht */}
      {uniqueBesonderheiten.length > 0 && (
        <Card className="ff-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary font-medium mb-3">
              <Building2 className="w-4 h-4" />
              Erfasste Besonderheiten
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueBesonderheiten.map((id) => {
                const option = BESONDERHEITEN_OPTIONEN.find(o => o.id === id);
                return option ? (
                  <Badge key={id} variant="secondary">
                    {option.label}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnungen */}
      {(ausgeschlosseneSeiten.length > 0 || problematischeZuwegung.length > 0) && (
        <Card className="ff-card border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600 font-medium mb-3">
              <AlertCircle className="w-4 h-4" />
              Hinweise
            </div>
            
            {ausgeschlosseneSeiten.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium">Ausgeschlossene Seiten:</p>
                {ausgeschlosseneSeiten.map((seite) => (
                  <p key={seite.key} className="text-sm text-muted-foreground ml-4">
                    • {seite.label}: {seite.ausschlussgrund || "Kein Grund angegeben"}
                  </p>
                ))}
              </div>
            )}
            
            {problematischeZuwegung.length > 0 && (
              <div>
                <p className="text-sm font-medium">Problematische Zuwegung:</p>
                {problematischeZuwegung.map((seite) => (
                  <p key={seite.key} className="text-sm text-muted-foreground ml-4">
                    • {seite.label}: {seite.zuwegungBeschreibung || "Keine Details angegeben"}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main Wizard Component
export default function ObjektaufnahmeWizard({
  isOpen,
  onClose,
  onComplete,
  initialProjectId,
  initialCompanyId,
}: ObjektaufnahmeWizardProps) {
  // State für Stammdaten
  const [selectedUnternehmen, setSelectedUnternehmen] = useState("");
  const [selectedKontakt, setSelectedKontakt] = useState("");
  const [selectedProjekt, setSelectedProjekt] = useState("");

  // Pre-fill when opened from ProjektDetail
  useEffect(() => {
    if (isOpen && initialCompanyId) {
      setSelectedUnternehmen(initialCompanyId.toString());
    }
    if (isOpen && initialProjectId) {
      setSelectedProjekt(initialProjectId.toString());
    }
  }, [isOpen, initialCompanyId, initialProjectId]);
  const [strasse, setStrasse] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Sprint 5c: Kaufmännische Daten State
  const [kaufmaennisch, setKaufmaennisch] = useState<KaufmaennischeData>(createEmptyKaufmaennisch());
  const updateKaufmaennisch = useCallback((updates: Partial<KaufmaennischeData>) => {
    setKaufmaennisch(prev => ({ ...prev, ...updates }));
  }, []);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [showDraftPicker, setShowDraftPicker] = useState(false);

  // tRPC Mutations & Queries
  const createProperty = trpc.property.create.useMutation();
  const saveDraftMutation = trpc.property.saveDraft.useMutation();
  const finalizeDraftMutation = trpc.property.finalizeDraft.useMutation();
  const deleteDraftMutation = trpc.property.deleteDraft.useMutation();
  const { data: existingDrafts } = trpc.property.listDrafts.useQuery(undefined, {
    enabled: isOpen,
  });
  const utils = trpc.useUtils();

  // Initialize sides
  const [seiten, setSeiten] = useState<SeiteData[]>(
    SEITEN_CONFIG.map((config) => createEmptySeite(config.key, config.label, config.beschreibung))
  );

  // Auto-Save Hook - speichert automatisch bei Änderungen
  const wizardData = useMemo(() => ({
    selectedUnternehmen,
    selectedKontakt,
    selectedProjekt,
    strasse,
    plz,
    ort,
    seiten,
    kaufmaennisch,
  }), [selectedUnternehmen, selectedKontakt, selectedProjekt, strasse, plz, ort, seiten, kaufmaennisch]);

  const { status: saveStatus, lastSaved, loadSaved, clearSaved } = useAutoSave({
    key: "objektaufnahme-wizard",
    data: wizardData,
    debounceMs: 1500,
    enabled: isOpen,
  });

  // Gespeicherte Daten beim Öffnen laden (localStorage oder DB-Entwurf)
  useEffect(() => {
    if (isOpen) {
      // Zuerst prüfen ob es DB-Entwürfe gibt
      if (existingDrafts && existingDrafts.length > 0 && !draftId) {
        setShowDraftPicker(true);
      } else {
        // Fallback: localStorage
        const saved = loadSaved();
        if (saved) {
          if (saved.selectedUnternehmen) setSelectedUnternehmen(saved.selectedUnternehmen);
          if (saved.selectedKontakt) setSelectedKontakt(saved.selectedKontakt);
          if (saved.selectedProjekt) setSelectedProjekt(saved.selectedProjekt);
          if (saved.strasse) setStrasse(saved.strasse);
          if (saved.plz) setPlz(saved.plz);
          if (saved.ort) setOrt(saved.ort);
          if (saved.seiten) setSeiten(saved.seiten);
          if (saved.kaufmaennisch) setKaufmaennisch(saved.kaufmaennisch);
          toast.info("Entwurf wiederhergestellt", {
            description: "Deine vorherigen Eingaben wurden geladen.",
          });
        }
      }
    }
  }, [isOpen, loadSaved, existingDrafts]);

  // DB-Entwurf laden
  const loadDraft = useCallback((draft: any) => {
    setDraftId(draft.id);
    if (draft.projectId) setSelectedProjekt(String(draft.projectId));
    if (draft.street) setStrasse(draft.street);
    if (draft.postalCode) setPlz(draft.postalCode);
    if (draft.city) setOrt(draft.city);
    // Wizard-Daten wiederherstellen
    if (draft.wizardData) {
      const wd = draft.wizardData;
      if (wd.selectedUnternehmen) setSelectedUnternehmen(wd.selectedUnternehmen);
      if (wd.selectedKontakt) setSelectedKontakt(wd.selectedKontakt);
      if (wd.seiten) setSeiten(wd.seiten);
    }
    setShowDraftPicker(false);
    toast.info("Entwurf geladen", {
      description: `"${draft.name}" wird fortgesetzt.`,
    });
  }, []);

  // Entwurf in DB speichern (Auto-Save bei Seitenwechsel)
  const saveCurrentDraft = useCallback(async () => {
    if (!strasse.trim()) return; // Mindestens Straße muss eingegeben sein
    
    const propertyName = strasse.trim() + (ort ? `, ${ort}` : '');
    const seitenMap: Record<string, any> = {};
    for (const seite of seiten) {
      const dbKey = seite.key === 'front' ? 'frontSide' : seite.key === 'rueck' ? 'backSide' : seite.key === 'links' ? 'leftGable' : 'rightGable';
      seitenMap[dbKey] = {
        area: seite.flaeche,
        facadeType: seite.fassadenart || 'unbekannt',
        cleanable: seite.reinigungsfaehig === true,
        notCleanableReason: seite.reinigungsfaehig === false ? seite.ausschlussgrund : undefined,
        notes: seite.besonderheiten.length > 0 ? seite.besonderheiten.join(', ') : undefined,
        // Loom-Feedback: Teilflächen
        hasSubAreas: seite.hasSubAreas || false,
        subAreas: seite.hasSubAreas ? seite.subAreas.map(sa => ({
          width: sa.breite,
          height: sa.hoehe,
          area: sa.flaeche,
          note: sa.bemerkung,
        })) : undefined,
      };
    }

    try {
      const result = await saveDraftMutation.mutateAsync({
        id: draftId || undefined,
        projectId: selectedProjekt ? parseInt(selectedProjekt) : undefined,
        name: propertyName,
        street: strasse.trim(),
        postalCode: plz.trim() || undefined,
        city: ort.trim() || undefined,
        frontSide: seitenMap.frontSide,
        backSide: seitenMap.backSide,
        leftGable: seitenMap.leftGable,
        rightGable: seitenMap.rightGable,
        wizardData: { selectedUnternehmen, selectedKontakt, selectedProjekt, seiten },
      });
      if (!draftId && result?.id) {
        setDraftId(result.id);
      }
      await utils.property.listDrafts.invalidate();
    } catch (e) {
      // Stilles Fehlschlagen beim Auto-Save
      console.warn('Entwurf konnte nicht gespeichert werden:', e);
    }
  }, [strasse, ort, plz, seiten, selectedUnternehmen, selectedKontakt, selectedProjekt, draftId, saveDraftMutation, utils]);

  // Validierung Hook
  const { validateStep, getFieldError, hasError } = useWizardValidation({
    steps: [
      {
        stepId: "stammdaten",
        rules: [
          { field: "selectedUnternehmen", label: "Unternehmen", required: true },
        ],
      },
    ],
    data: { selectedUnternehmen, selectedKontakt, selectedProjekt },
  });

  const updateSeite = useCallback((key: SeiteKey, updates: Partial<SeiteData>) => {
    setSeiten((prev) =>
      prev.map((seite) => (seite.key === key ? { ...seite, ...updates } : seite))
    );
  }, []);

  const handleComplete = async () => {
    if (!strasse.trim()) {
      toast.error("Bitte Straße eingeben");
      return;
    }

    // Nr.36: Fassadenart Pflichtfeld-Validierung
    const seitenOhneFassadenart = seiten.filter(
      s => s.reinigungsfaehig === true && !s.fassadenart
    );
    if (seitenOhneFassadenart.length > 0) {
      toast.error("Fassadenart fehlt", {
        description: `Bitte wähle die Fassadenart für: ${seitenOhneFassadenart.map(s => s.label).join(", ")}`,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Fassadenseiten-Daten für die DB aufbereiten
      const seitenMap: Record<string, any> = {};
      for (const seite of seiten) {
        const dbKey = seite.key === 'front' ? 'frontSide' : seite.key === 'rueck' ? 'backSide' : seite.key === 'links' ? 'leftGable' : 'rightGable';
        seitenMap[dbKey] = {
          area: seite.flaeche,
          facadeType: seite.fassadenart || 'unbekannt',
          cleanable: seite.reinigungsfaehig === true,
          notCleanableReason: seite.reinigungsfaehig === false ? seite.ausschlussgrund : undefined,
          notes: seite.besonderheiten.length > 0 ? seite.besonderheiten.join(', ') : undefined,
          // Loom-Feedback: Teilflächen
          hasSubAreas: seite.hasSubAreas || false,
          subAreas: seite.hasSubAreas ? seite.subAreas.map(sa => ({
            width: sa.breite,
            height: sa.hoehe,
            area: sa.flaeche,
            note: sa.bemerkung,
          })) : undefined,
        };
      }

      const gesamtFlaeche = seiten.reduce((sum, s) => sum + s.flaeche, 0);
      const reinigungsfaehigeFlaeche = seiten
        .filter((s) => s.reinigungsfaehig === true)
        .reduce((sum, s) => sum + s.flaeche, 0);

      // Immobilienname aus Adresse generieren
      const propertyName = strasse.trim() + (ort ? `, ${ort}` : '');

      let property: any;
      if (draftId) {
        // Bestehenden Entwurf finalisieren
        await createProperty.mutateAsync({
          projectId: selectedProjekt ? parseInt(selectedProjekt) : undefined,
          name: propertyName,
          street: strasse.trim(),
          postalCode: plz.trim() || undefined,
          city: ort.trim() || undefined,
          frontSide: seitenMap.frontSide,
          backSide: seitenMap.backSide,
          leftGable: seitenMap.leftGable,
          rightGable: seitenMap.rightGable,
          totalCleanableArea: reinigungsfaehigeFlaeche.toString(),
          specialFeatures: seiten.flatMap(s => s.besonderheiten),
          accessNotes: seiten.filter(s => s.zuwegungProblematisch).map(s => `${s.label}: ${s.zuwegungBeschreibung}`).join('; ') || undefined,
        });
        // Entwurf löschen da wir eine saubere Property erstellt haben
        try { await deleteDraftMutation.mutateAsync({ id: draftId }); } catch {}
        property = { id: draftId };
      } else {
        property = await createProperty.mutateAsync({
          projectId: selectedProjekt ? parseInt(selectedProjekt) : undefined,
          name: propertyName,
          street: strasse.trim(),
          postalCode: plz.trim() || undefined,
          city: ort.trim() || undefined,
          frontSide: seitenMap.frontSide,
          backSide: seitenMap.backSide,
          leftGable: seitenMap.leftGable,
          rightGable: seitenMap.rightGable,
          totalCleanableArea: reinigungsfaehigeFlaeche.toString(),
          specialFeatures: seiten.flatMap(s => s.besonderheiten),
          accessNotes: seiten.filter(s => s.zuwegungProblematisch).map(s => `${s.label}: ${s.zuwegungBeschreibung}`).join('; ') || undefined,
        });
      }

      // Cache invalidieren (Nr.37: Immobilien-Zähler aktualisieren)
      await utils.property.list.invalidate();
      if (selectedProjekt) {
        await utils.property.getByProjectId.invalidate({ projectId: parseInt(selectedProjekt) });
        // Auch Projekt-Daten invalidieren damit Zähler aktualisiert werden
        await utils.project.list.invalidate();
        await utils.project.getWithRelations.invalidate({ id: parseInt(selectedProjekt) });
      }

      const data = {
        unternehmen: selectedUnternehmen,
        kontakt: selectedKontakt,
        projekt: selectedProjekt,
        seiten,
        gesamtFlaeche,
        reinigungsfaehigeFlaeche,
        propertyId: property.id,
      };
      onComplete(data);
      clearSaved();
      // Nr.39: Duplikat-Warnung anzeigen
      if (property.duplicateWarning) {
        toast.warning("Mögliches Duplikat erkannt", {
          description: property.duplicateWarning,
          duration: 8000,
        });
      }
      toast.success("Objektaufnahme abgeschlossen", {
        description: `${propertyName} wurde erfolgreich in der Datenbank gespeichert.`,
      });
      onClose();
    } catch (error: any) {
      console.error("Fehler beim Speichern der Objektaufnahme:", error);
      toast.error("Fehler beim Speichern", {
        description: error?.message || "Unbekannter Fehler",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Build steps
  const steps: WizardStep[] = [
    {
      id: "stammdaten",
      title: "Stammdaten",
      description: "Adresse und Zuordnung",
      icon: MapPin,
      content: (
        <StammdatenStep
          selectedUnternehmen={selectedUnternehmen}
          setSelectedUnternehmen={setSelectedUnternehmen}
          selectedKontakt={selectedKontakt}
          setSelectedKontakt={setSelectedKontakt}
          selectedProjekt={selectedProjekt}
          setSelectedProjekt={setSelectedProjekt}
          strasse={strasse}
          setStrasse={setStrasse}
          plz={plz}
          setPlz={setPlz}
          ort={ort}
          setOrt={setOrt}
        />
      ),
    },
    ...seiten.map((seite, index) => {
      const iconMap: Record<SeiteKey, React.ElementType> = {
        front: ArrowUp,
        rueck: ArrowDown,
        links: ArrowLeft,
        rechts: ArrowRight,
      };
      return {
        id: seite.key,
        title: seite.label,
        description: `Seite ${index + 1} von ${seiten.length}`,
        icon: iconMap[seite.key],
        content: (
          <SeiteErfassung
            seite={seite}
            onUpdate={(updates) => updateSeite(seite.key, updates)}
            projektName={strasse ? `${strasse}${ort ? `, ${ort}` : ''}` : undefined}
          />
        ),
      };
    }),
    // Sprint 5c: Kaufmännische Seite als neuer Step (Nr.28)
    {
      id: "kaufmaennisch",
      title: "Kaufmännisches",
      description: "Angebots-Optionen",
      icon: Briefcase,
      content: (
        <KaufmaennischeSeite
          seiten={seiten}
          kaufmaennisch={kaufmaennisch}
          onUpdate={updateKaufmaennisch}
        />
      ),
    },
    {
      id: "zusammenfassung",
      title: "Zusammenfassung",
      description: "Prüfen & Abschließen",
      icon: FileCheck,
      content: (
        <Zusammenfassung 
          seiten={seiten} 
          selectedUnternehmen={selectedUnternehmen}
          selectedProjekt={selectedProjekt}
          strasse={strasse}
          ort={ort}
          isSaving={isSaving}
        />
      ),
    },
  ];

  // Add AutoSaveIndicator to the first step content
  const stepsWithAutoSave = steps.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        content: (
          <div>
            <div className="flex justify-end mb-4">
              <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            </div>
            {step.content}
          </div>
        ),
      };
    }
    return step;
  });

  // Entwurf-Auswahl Dialog
  if (showDraftPicker && existingDrafts && existingDrafts.length > 0) {
    return (
      <WizardDialog
        isOpen={isOpen}
        onCancel={() => { setShowDraftPicker(false); onClose(); }}
        onComplete={() => { setShowDraftPicker(false); }}
        title="Objektaufnahme"
        description="Du hast offene Entwürfe"
        steps={[
          {
            id: "drafts",
            title: "Entwürfe",
            description: "Fortsetzen oder neu starten",
            icon: FileCheck,
            content: (
              <div className="space-y-4">
                <p className="text-muted-foreground">Du hast {existingDrafts.length} offene Objektaufnahme(n). Möchtest du eine fortsetzen?</p>
                <div className="space-y-3">
                  {existingDrafts.map((draft) => (
                    <Card key={draft.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadDraft(draft)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{draft.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {draft.street}{draft.city ? `, ${draft.city}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Zuletzt bearbeitet: {new Date(draft.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Entwurf
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => { setShowDraftPicker(false); }}
                >
                  Neue Objektaufnahme starten
                </Button>
              </div>
            ),
          },
        ]}
      />
    );
  }

  return (
    <WizardDialog
      isOpen={isOpen}
      onCancel={async () => {
        // Beim Abbrechen: Entwurf in DB speichern wenn Daten vorhanden
        if (strasse.trim()) {
          await saveCurrentDraft();
          toast.info("Entwurf gespeichert", {
            description: "Du kannst später weitermachen.",
          });
        }
        onClose();
      }}
      onComplete={handleComplete}
      title={draftId ? "Objektaufnahme (Entwurf)" : "Objektaufnahme"}
      description={draftId ? "Entwurf wird fortgesetzt" : "Erfasse alle Seiten der Immobilie"}
      steps={stepsWithAutoSave}
    />
  );
}
