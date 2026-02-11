/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Projekt Wizard - Neues Projekt erstellen
 * 
 * DB-INTEGRATION: Speichert Projekt sofort in der Datenbank
 * - Unternehmen und Kontakte aus DB laden
 * - HubSpot-Deals aus DB/HubSpot laden
 * - Projekt wird beim Abschluss via tRPC project.create gespeichert
 * - Projektnummer wird automatisch generiert
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { WizardDialog, WizardStep } from "@/components/Wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  Link2,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { trpc } from "@/lib/trpc";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { de } from "date-fns/locale";

interface ProjektWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (projectId?: number) => void;
}

// Wizard-State
interface ProjektFormData {
  // Grunddaten
  projektname: string;
  beschreibung: string;
  // Unternehmen & Kontakt
  companyId: number | null;
  contactId: number | null;
  // HubSpot
  hubspotDealId: string | null;
  // Team
  kundenberaterId: number | null;
  projektleiterId: number | null;
  // Termine
  startDatum: string;
  endDatum: string;
  notizen: string;
}

const INITIAL_FORM_DATA: ProjektFormData = {
  projektname: "",
  beschreibung: "",
  companyId: null,
  contactId: null,
  hubspotDealId: null,
  kundenberaterId: null,
  projektleiterId: null,
  startDatum: "",
  endDatum: "",
  notizen: "",
};

// Step 1: Grunddaten & Unternehmen
function GrunddatenStep({
  formData,
  onUpdate,
  companies,
  contacts,
  companiesLoading,
}: {
  formData: ProjektFormData;
  onUpdate: (data: Partial<ProjektFormData>) => void;
  companies: Array<{ id: number; name: string; category?: string | null; city?: string | null }>;
  contacts: Array<{ id: number; firstName?: string | null; lastName: string; position?: string | null; companyId?: number | null }>;
  companiesLoading: boolean;
}) {
  // Kontakte filtern nach ausgewähltem Unternehmen
  const filteredContacts = useMemo(() => {
    if (!formData.companyId) return contacts;
    return contacts.filter(c => c.companyId === formData.companyId);
  }, [contacts, formData.companyId]);

  const [companySearch, setCompanySearch] = useState("");
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies.slice(0, 50);
    const q = companySearch.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.city && c.city.toLowerCase().includes(q))
    ).slice(0, 50);
  }, [companies, companySearch]);

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <FolderOpen className="w-4 h-4" />
            Projektinformationen
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="projektname">Projektname *</Label>
                <HelpTooltip content={HELP_TEXTS.projektName.text} title={HELP_TEXTS.projektName.title} />
              </div>
              <Input 
                id="projektname" 
                placeholder="z.B. Wohnanlage Sonnenhof" 
                value={formData.projektname}
                onChange={(e) => onUpdate({ projektname: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="beschreibung">Beschreibung</Label>
              <Textarea 
                id="beschreibung" 
                placeholder="Kurze Beschreibung des Projekts..." 
                rows={3}
                value={formData.beschreibung}
                onChange={(e) => onUpdate({ beschreibung: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Building2 className="w-4 h-4" />
            Unternehmen & Ansprechpartner
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="unternehmen">Unternehmen *</Label>
              {companiesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Unternehmen werden geladen...
                </div>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Unternehmen suchen..." 
                      className="pl-9"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={formData.companyId?.toString() || ""} 
                    onValueChange={(v) => {
                      const id = parseInt(v);
                      onUpdate({ companyId: id, contactId: null });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unternehmen wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCompanies.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()} title={`${c.name}${c.city ? ` (${c.city})` : ''}`}>
                          <span className="truncate max-w-[300px] inline-block">{c.name}</span>
                          {c.city && <span className="text-muted-foreground ml-2 shrink-0">({c.city})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="ansprechpartner">Ansprechpartner</Label>
              <Select 
                value={formData.contactId?.toString() || ""} 
                onValueChange={(v) => onUpdate({ contactId: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ansprechpartner wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredContacts.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <span>{c.firstName} {c.lastName}</span>
                      {c.position && <span className="text-muted-foreground ml-2">({c.position})</span>}
                    </SelectItem>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      {formData.companyId ? "Keine Kontakte für dieses Unternehmen" : "Bitte zuerst Unternehmen wählen"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 2: HubSpot-Verknüpfung
function HubSpotStep({
  formData,
  onUpdate,
  deals,
  dealsLoading,
}: {
  formData: ProjektFormData;
  onUpdate: (data: Partial<ProjektFormData>) => void;
  deals: Array<{ hubspotId: string; name: string; amount?: number | null; stage?: string | null }>;
  dealsLoading: boolean;
}) {
  const [dealSearch, setDealSearch] = useState("");
  const filteredDeals = useMemo(() => {
    if (!dealSearch) return deals.slice(0, 50);
    const q = dealSearch.toLowerCase();
    return deals.filter(d => d.name.toLowerCase().includes(q)).slice(0, 50);
  }, [deals, dealSearch]);

  const selectedDeal = deals.find(d => d.hubspotId === formData.hubspotDealId);

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Link2 className="w-4 h-4" />
            HubSpot-Verknüpfung
            <HelpTooltip content={HELP_TEXTS.hubspotDeal.text} title={HELP_TEXTS.hubspotDeal.title} />
          </div>
          <p className="text-sm text-muted-foreground">
            Optional: Verknüpfen Sie das Projekt mit einem HubSpot-Deal für CRM-Integration.
          </p>
          {dealsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Deals werden geladen...
            </div>
          ) : (
            <>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Deal suchen..." 
                  className="pl-9"
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                />
              </div>
              <Select 
                value={formData.hubspotDealId || ""} 
                onValueChange={(v) => onUpdate({ hubspotDealId: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Deal auswählen (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Deal</SelectItem>
                  {filteredDeals.map(d => (
                    <SelectItem key={d.hubspotId} value={d.hubspotId}>
                      <span>{d.name}</span>
                      {d.amount && <span className="text-muted-foreground ml-2">({d.amount.toLocaleString('de-DE')} €)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {selectedDeal && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="font-medium text-sm">{selectedDeal.name}</div>
              <div className="flex gap-2 mt-1">
                {selectedDeal.amount && (
                  <Badge variant="outline" className="text-xs">{selectedDeal.amount.toLocaleString('de-DE')} €</Badge>
                )}
                {selectedDeal.stage && (
                  <Badge variant="secondary" className="text-xs">{selectedDeal.stage}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 3: Team & Termine
function TeamTermineStep({
  formData,
  onUpdate,
  users,
}: {
  formData: ProjektFormData;
  onUpdate: (data: Partial<ProjektFormData>) => void;
  users: Array<{ id: number; name?: string | null; role?: string | null }>;
}) {
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Users className="w-4 h-4" />
            Projektteam
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kundenberater">Kundenberater</Label>
              <Select 
                value={formData.kundenberaterId?.toString() || ""} 
                onValueChange={(v) => onUpdate({ kundenberaterId: v ? parseInt(v) : null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nicht zugewiesen</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name || 'Unbekannt'}
                      {u.role && <span className="text-muted-foreground ml-2">({u.role})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="projektleiter">Projektleiter</Label>
              <Select 
                value={formData.projektleiterId?.toString() || ""} 
                onValueChange={(v) => onUpdate({ projektleiterId: v ? parseInt(v) : null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nicht zugewiesen</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name || 'Unbekannt'}
                      {u.role && <span className="text-muted-foreground ml-2">({u.role})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="w-4 h-4" />
            Zeitplanung
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Geplanter Start</Label>
              <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDatum && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {formData.startDatum
                      ? new Date(formData.startDatum + 'T12:00:00').toLocaleDateString("de-DE")
                      : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                   <CalendarComponent
                     mode="single"
                     locale={de}
                     defaultMonth={formData.startDatum ? new Date(formData.startDatum + 'T12:00:00') : undefined}
                     selected={formData.startDatum ? new Date(formData.startDatum + 'T12:00:00') : undefined}
                     onSelect={(date: Date | undefined) => {
                       if (date) {
                         const y = date.getFullYear();
                         const m = String(date.getMonth() + 1).padStart(2, '0');
                         const d = String(date.getDate()).padStart(2, '0');
                         onUpdate({ startDatum: `${y}-${m}-${d}` });
                       } else {
                         onUpdate({ startDatum: '' });
                       }
                       setStartPopoverOpen(false);
                     }}
                   />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Geplantes Ende</Label>
              <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDatum && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {formData.endDatum
                      ? new Date(formData.endDatum + 'T12:00:00').toLocaleDateString("de-DE")
                      : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                   <CalendarComponent
                     mode="single"
                     locale={de}
                     defaultMonth={formData.endDatum ? new Date(formData.endDatum + 'T12:00:00') : new Date(formData.startDatum ? formData.startDatum + 'T12:00:00' : Date.now())}
                     disabled={formData.startDatum ? { before: new Date(formData.startDatum + 'T12:00:00') } : undefined}
                     selected={formData.endDatum ? new Date(formData.endDatum + 'T12:00:00') : undefined}
                     onSelect={(date: Date | undefined) => {
                       if (date) {
                         const y = date.getFullYear();
                         const m = String(date.getMonth() + 1).padStart(2, '0');
                         const d = String(date.getDate()).padStart(2, '0');
                         onUpdate({ endDatum: `${y}-${m}-${d}` });
                       } else {
                         onUpdate({ endDatum: '' });
                       }
                       setEndPopoverOpen(false);
                     }}
                   />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label htmlFor="notizen">Terminhinweise</Label>
            <Textarea 
              id="notizen" 
              placeholder="Besondere Terminwünsche oder Einschränkungen..." 
              rows={2}
              value={formData.notizen}
              onChange={(e) => onUpdate({ notizen: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 4: Zusammenfassung
function ZusammenfassungStep({
  formData,
  companies,
  contacts,
  deals,
  isSaving,
  saveError,
}: {
  formData: ProjektFormData;
  companies: Array<{ id: number; name: string }>;
  contacts: Array<{ id: number; firstName?: string | null; lastName: string }>;
  deals: Array<{ hubspotId: string; name: string }>;
  isSaving: boolean;
  saveError: string | null;
}) {
  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const selectedContact = contacts.find(c => c.id === formData.contactId);
  const selectedDeal = deals.find(d => d.hubspotId === formData.hubspotDealId);

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-1">
            <AlertCircle className="w-5 h-5" />
            Fehler beim Speichern
          </div>
          <p className="text-sm text-red-500">{saveError}</p>
        </div>
      )}

      {isSaving && (
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Projekt wird gespeichert...
          </div>
        </div>
      )}

      {!isSaving && !saveError && (
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 text-primary font-medium mb-2">
            <CheckCircle2 className="w-5 h-5" />
            Projekt erstellen
          </div>
          <p className="text-sm text-muted-foreground">
            Überprüfen Sie die Projektdaten und erstellen Sie das Projekt.
          </p>
        </div>
      )}

      <Card className="ff-card">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Projektübersicht</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Projektname:</span>
            <span className="font-medium">{formData.projektname || "—"}</span>
            
            <span className="text-muted-foreground">Beschreibung:</span>
            <span>{formData.beschreibung || "—"}</span>
            
            <span className="text-muted-foreground">Unternehmen:</span>
            <span>{selectedCompany?.name || "—"}</span>
            
            <span className="text-muted-foreground">Ansprechpartner:</span>
            <span>{selectedContact ? `${selectedContact.firstName || ''} ${selectedContact.lastName}`.trim() : "—"}</span>
            
            <span className="text-muted-foreground">HubSpot-Deal:</span>
            <span>{selectedDeal?.name || "Kein Deal verknüpft"}</span>
            
            <span className="text-muted-foreground">Geplanter Start:</span>
            <span>{formData.startDatum ? new Date(formData.startDatum).toLocaleDateString('de-DE') : "—"}</span>
            
            <span className="text-muted-foreground">Geplantes Ende:</span>
            <span>{formData.endDatum ? new Date(formData.endDatum).toLocaleDateString('de-DE') : "—"}</span>
            
            <span className="text-muted-foreground">Status:</span>
            <Badge className="w-fit bg-primary/20 text-primary border-primary/30">Objektaufnahme</Badge>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Nach dem Erstellen können Sie Immobilien zum Projekt hinzufügen und die Objektaufnahme starten.
      </p>
    </div>
  );
}

export default function ProjektWizard({
  isOpen,
  onClose,
  onComplete,
}: ProjektWizardProps) {
  const [formData, setFormData] = useState<ProjektFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Daten aus der DB laden
  const { data: companiesData, isLoading: companiesLoading } = trpc.company.list.useQuery(undefined, { enabled: isOpen });
  const { data: contactsData } = trpc.contact.list.useQuery(undefined, { enabled: isOpen });
  const { data: usersData } = trpc.auth.me.useQuery(undefined, { enabled: isOpen });

  // HubSpot Deals - try to load, gracefully handle errors
  const { data: dealsData, isLoading: dealsLoading } = trpc.hubspot.getDeals.useQuery(
    { limit: 100 },
    { enabled: isOpen, retry: false }
  );

  const companies = useMemo(() => companiesData || [], [companiesData]);
  const contactsList = useMemo(() => contactsData || [], [contactsData]);
  const deals = useMemo(() => dealsData || [], [dealsData]);
  
  // Users - wir brauchen alle User, nicht nur den aktuellen
  const { data: allUsersData } = trpc.user.list.useQuery(undefined, { enabled: isOpen });
  const allUsers = useMemo(() => allUsersData || [], [allUsersData]);

  // tRPC Mutations
  const generateNumber = trpc.project.generateNumber.useMutation();
  const createProject = trpc.project.create.useMutation();
  const utils = trpc.useUtils();

  const onUpdate = useCallback((data: Partial<ProjektFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setSaveError(null);
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setIsSaving(false);
      setSaveError(null);
    }
  }, [isOpen]);

  const handleComplete = useCallback(async () => {
    if (!formData.projektname.trim()) {
      toast.error("Projektname ist erforderlich");
      return;
    }
    if (!formData.companyId) {
      toast.error("Bitte wählen Sie ein Unternehmen");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Projektnummer generieren
      const company = companies.find(c => c.id === formData.companyId);
      const shortName = company?.name
        ? company.name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'PRJ'
        : 'PRJ';
      
      const projectNumber = await generateNumber.mutateAsync({ companyShortName: shortName });

      // Projekt erstellen
      const project = await createProject.mutateAsync({
        projectNumber,
        name: formData.projektname.trim(),
        companyId: formData.companyId,
        contactId: formData.contactId || undefined,
        phase: "objektaufnahme",
        startDate: formData.startDatum ? new Date(formData.startDatum) : undefined,
        endDate: formData.endDatum ? new Date(formData.endDatum) : undefined,
        kundenberaterId: formData.kundenberaterId || undefined,
        projektleiterId: formData.projektleiterId || undefined,
        notes: [formData.beschreibung, formData.notizen].filter(Boolean).join('\n\n') || undefined,
        hubspotDealId: formData.hubspotDealId && formData.hubspotDealId !== "none" ? formData.hubspotDealId : undefined,
      });

      // Cache invalidieren
      await utils.project.list.invalidate();
      
      toast.success("Projekt erstellt", {
        description: `${formData.projektname} (${projectNumber}) wurde erfolgreich angelegt.`,
      });

      onComplete(project.id);
      onClose();
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Projekts:", error);
      const message = error?.message || "Unbekannter Fehler beim Speichern";
      setSaveError(message);
      toast.error("Fehler beim Erstellen", { description: message });
    } finally {
      setIsSaving(false);
    }
  }, [formData, companies, generateNumber, createProject, utils, onComplete, onClose]);

  const steps: WizardStep[] = [
    {
      id: "grunddaten",
      title: "Grunddaten",
      description: "Projektname, Unternehmen & Kontakt",
      icon: FolderOpen,
      content: (
        <GrunddatenStep
          formData={formData}
          onUpdate={onUpdate}
          companies={companies}
          contacts={contactsList}
          companiesLoading={companiesLoading}
        />
      ),
    },
    {
      id: "hubspot",
      title: "HubSpot",
      description: "Deal-Verknüpfung (optional)",
      icon: Link2,
      isOptional: true,
      content: (
        <HubSpotStep
          formData={formData}
          onUpdate={onUpdate}
          deals={deals}
          dealsLoading={dealsLoading}
        />
      ),
    },
    {
      id: "team",
      title: "Team & Termine",
      description: "Projektteam und Zeitplanung",
      icon: Users,
      content: (
        <TeamTermineStep
          formData={formData}
          onUpdate={onUpdate}
          users={allUsers}
        />
      ),
    },
    {
      id: "zusammenfassung",
      title: "Zusammenfassung",
      description: "Überprüfen und erstellen",
      icon: CheckCircle2,
      content: (
        <ZusammenfassungStep
          formData={formData}
          companies={companies}
          contacts={contactsList}
          deals={deals}
          isSaving={isSaving}
          saveError={saveError}
        />
      ),
    },
  ];

  return (
    <WizardDialog
      isOpen={isOpen}
      title="Neues Projekt"
      description="Erstellen Sie ein neues Projekt in wenigen Schritten"
      steps={steps}
      onComplete={handleComplete}
      onCancel={onClose}
    />
  );
}
