/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Kontakte-Seite mit hierarchischer Darstellung:
 * UNTERNEHMEN → KONTAKTE (gemäß Interview-Vorgabe)
 * 
 * Interview-Erkenntnis: "Der Kunde ist stets das UNTERNEHMEN, nicht der Kontakt."
 * Die Seite zeigt Unternehmen als übergeordnete Entitäten mit zugeordneten Kontakten.
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Contact,
  Plus,
  Search,
  Edit,
  Mail,
  Phone,
  Building2,
  User,
  MapPin,
  ChevronDown,
  ChevronRight,
  Globe,
  Briefcase,
  FolderKanban,
  ExternalLink,
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, UserX, Link2, Home } from "lucide-react";

// Kategorie-Labels
const CATEGORY_LABELS: Record<string, string> = {
  wohnungsgesellschaft: "Wohnungsgesellschaft",
  hausverwaltung: "Hausverwaltung",
  privatperson: "Privatperson",
  gewerbe: "Gewerbe",
  oeffentlich: "Öffentlich",
};

// Kategorie-Farben
const CATEGORY_COLORS: Record<string, string> = {
  wohnungsgesellschaft: "bg-green-100 text-green-700",
  hausverwaltung: "bg-blue-100 text-blue-700",
  privatperson: "bg-orange-100 text-orange-700",
  gewerbe: "bg-purple-100 text-purple-700",
  oeffentlich: "bg-cyan-100 text-cyan-700",
};

export default function Kontakte() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("unternehmen");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompanyDetailOpen, setIsCompanyDetailOpen] = useState(false);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "", category: "" as any, street: "", postalCode: "", city: "", phone: "", email: "", website: "", notes: "",
  });
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  // Nr.60: Echtes Kontakt-Formular statt nur Toast
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "", lastName: "", email: "", phone: "", position: "", companyId: null as number | null,
  });

  // Verwaiste-Kontakte-Zuordnung
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [contactToAssign, setContactToAssign] = useState<any>(null);
  const [selectedCompanyForAssign, setSelectedCompanyForAssign] = useState<string>("");
  const [assignSearch, setAssignSearch] = useState("");

  // Fetch data from database
  const utils = trpc.useUtils();
  const { data: contacts, isLoading: contactsLoading } = trpc.contact.list.useQuery();
  const { data: companies, isLoading: companiesLoading } = trpc.company.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: orphanedContacts, isLoading: orphanedLoading } = trpc.contact.listOrphaned.useQuery();
  const { data: allProperties } = trpc.property.list.useQuery();

  const assignToCompanyMutation = trpc.contact.assignToCompany.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate();
      utils.contact.listOrphaned.invalidate();
      setAssignDialogOpen(false);
      setContactToAssign(null);
      setSelectedCompanyForAssign("");
      setAssignSearch("");
      toast.success("Kontakt erfolgreich zugeordnet");
    },
    onError: (err: any) => toast.error(`Fehler: ${err.message}`),
  });

  const handleAssignContact = () => {
    if (!contactToAssign || !selectedCompanyForAssign) {
      toast.error("Bitte ein Unternehmen auswählen");
      return;
    }
    assignToCompanyMutation.mutate({
      contactId: contactToAssign.id,
      companyId: parseInt(selectedCompanyForAssign),
    });
  };

  const filteredCompaniesForAssign = useMemo(() => {
    if (!companies) return [];
    if (!assignSearch) return companies;
    const q = assignSearch.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q));
  }, [companies, assignSearch]);
  
  // Nr.60: Echte Kontakt-Erstellung mit tRPC
  const createContactMutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate();
      setIsNewContactOpen(false);
      setNewContact({ firstName: "", lastName: "", email: "", phone: "", position: "", companyId: null });
      toast.success("Kontakt erfolgreich angelegt");
    },
    onError: (err: any) => toast.error(`Fehler: ${err.message}`),
  });

  const handleCreateContact = () => {
    if (!newContact.lastName.trim()) {
      toast.error("Bitte Nachname eingeben");
      return;
    }
    createContactMutation.mutate({
      firstName: newContact.firstName || undefined,
      lastName: newContact.lastName,
      email: newContact.email || undefined,
      phone: newContact.phone || undefined,
      position: newContact.position || undefined,
      companyId: newContact.companyId || undefined,
    });
  };

  const createCompanyMutation = trpc.company.create.useMutation({
    onSuccess: () => {
      utils.company.list.invalidate();
      setIsNewCompanyOpen(false);
      setNewCompany({ name: "", category: "" as any, street: "", postalCode: "", city: "", phone: "", email: "", website: "", notes: "" });
      toast.success("Unternehmen erfolgreich angelegt");
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });
  
  const handleCreateCompany = () => {
    if (!newCompany.name.trim()) {
      toast.error("Bitte Firmennamen eingeben");
      return;
    }
    createCompanyMutation.mutate({
      name: newCompany.name,
      category: newCompany.category || undefined,
      street: newCompany.street || undefined,
      postalCode: newCompany.postalCode || undefined,
      city: newCompany.city || undefined,
      phone: newCompany.phone || undefined,
      email: newCompany.email || undefined,
      website: newCompany.website || undefined,
      notes: newCompany.notes || undefined,
    });
  };

  const isLoading = contactsLoading || companiesLoading;

  // Group contacts by company
  const companiesWithContacts = useMemo(() => {
    if (!companies || !contacts) return [];
    
    return companies
      .map(company => ({
        ...company,
        contacts: contacts.filter(c => c.companyId === company.id),
        projectCount: projects?.filter(p => p.companyId === company.id).length || 0,
      }))
      .filter(company => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        // Suche in Unternehmen und zugeordneten Kontakten
        const matchesCompany = company.name.toLowerCase().includes(q) ||
          company.city?.toLowerCase().includes(q) ||
          company.email?.toLowerCase().includes(q);
        const matchesContact = company.contacts.some(c =>
          c.firstName?.toLowerCase().includes(q) ||
          c.lastName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.position?.toLowerCase().includes(q)
        );
        return matchesCompany || matchesContact;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, contacts, projects, searchQuery]);

  // Kontakte ohne Unternehmen
  const orphanContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(c => !c.companyId).filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q);
    });
  }, [contacts, searchQuery]);

  // Flat contact list for "Alle Kontakte" tab
  const allFilteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.position?.toLowerCase().includes(q);
    });
  }, [contacts, searchQuery]);

  // Stats
  const totalCompanies = companies?.length || 0;
  const totalContacts = contacts?.length || 0;
  const primaryContacts = contacts?.filter(c => c.isPrimary).length || 0;
  const orphanedCount = orphanedContacts?.length || 0;

  // Helpers
  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return "—";
    const company = companies?.find(c => c.id === companyId);
    return company?.name || "—";
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "—";
  };

  const toggleCompanyExpanded = (companyId: number) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (companies) {
      setExpandedCompanies(new Set(companies.map(c => c.id)));
    }
  };

  const collapseAll = () => {
    setExpandedCompanies(new Set());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              Unternehmen & Kontakte
            </h1>
            <p className="text-muted-foreground mt-1">
              Kunden, Ansprechpartner und Entscheider hierarchisch verwalten
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsNewCompanyOpen(true)}>
              <Building2 className="w-4 h-4" />
              Neues Unternehmen
            </Button>
            <Button className="gap-2 ff-button" onClick={() => setIsNewContactOpen(true)}>
              <Plus className="w-4 h-4" />
              Neuer Kontakt
            </Button>
          </div>
        </div>

        {/* Verwaiste-Kontakte-Warnung */}
        {orphanedCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                {orphanedCount} verwaiste Kontakte ohne Unternehmenszuordnung
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Diese Kontakte wurden aus HubSpot importiert, haben dort aber kein Unternehmen zugeordnet.
                Bitte ordne sie einem Unternehmen zu oder bereinige die Daten in HubSpot.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0"
              onClick={() => setActiveTab("verwaist")}
            >
              <UserX className="w-4 h-4 mr-2" />
              Bereinigen
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalCompanies}</p>}
                  <p className="text-xs text-muted-foreground">Unternehmen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalContacts}</p>}
                  <p className="text-xs text-muted-foreground">Kontakte gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{primaryContacts}</p>}
                  <p className="text-xs text-muted-foreground">Entscheider</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Unternehmen oder Kontakte durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Hierarchisch / Alle Kontakte */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up animate-delay-300">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="unternehmen" className="gap-2">
                <Building2 className="w-4 h-4" />
                Hierarchisch ({companiesWithContacts.length})
              </TabsTrigger>
              <TabsTrigger value="kontakte" className="gap-2">
                <Users className="w-4 h-4" />
                Alle Kontakte ({totalContacts})
              </TabsTrigger>
              {orphanedCount > 0 && (
                <TabsTrigger value="verwaist" className="gap-2 text-amber-600">
                  <UserX className="w-4 h-4" />
                  Verwaist ({orphanedCount})
                </TabsTrigger>
              )}
            </TabsList>
            {activeTab === "unternehmen" && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={expandAll}>Alle aufklappen</Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>Alle zuklappen</Button>
              </div>
            )}
          </div>

          {/* Tab: Hierarchische Unternehmen-Ansicht */}
          <TabsContent value="unternehmen" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : companiesWithContacts.length === 0 && orphanContacts.length === 0 ? (
              <Card className="ff-card">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Unternehmen gefunden</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Versuche andere Suchbegriffe." : "Füge dein erstes Unternehmen hinzu."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {companiesWithContacts.map((company) => (
                  <Card key={company.id} className="ff-card overflow-hidden">
                    <Collapsible
                      open={expandedCompanies.has(company.id)}
                      onOpenChange={() => toggleCompanyExpanded(company.id)}
                    >
                      {/* Unternehmen-Header (klickbar) */}
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold">{company.name}</h3>
                                  {company.category && (
                                    <Badge className={cn("text-xs", CATEGORY_COLORS[company.category] || "bg-gray-100 text-gray-700")}>
                                      {CATEGORY_LABELS[company.category] || company.category}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                                  {company.city && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {company.postalCode} {company.city}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {company.contacts.length} Kontakt{company.contacts.length !== 1 ? "e" : ""}
                                  </span>
                                  {company.projectCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <FolderKanban className="w-3 h-3" />
                                      {company.projectCount} Projekt{company.projectCount !== 1 ? "e" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCompany(company);
                                  setIsCompanyDetailOpen(true);
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              {expandedCompanies.has(company.id) ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Kontakte unter dem Unternehmen */}
                      <CollapsibleContent>
                        <div className="border-t bg-muted/10">
                          {company.contacts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Noch keine Kontakte zugeordnet
                            </div>
                          ) : (
                            <div className="divide-y">
                              {company.contacts.map((contact) => (
                                <div
                                  key={contact.id}
                                  className="p-3 pl-8 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setIsDetailOpen(true);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(contact.firstName, contact.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                          {getFullName(contact.firstName, contact.lastName)}
                                        </span>
                                        {contact.isPrimary && (
                                          <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">
                                            Hauptkontakt
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {contact.position || "—"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {contact.email && (
                                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        {contact.email}
                                      </span>
                                    )}
                                    {contact.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        {contact.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Nr.56: Projekte unter dem Unternehmen anzeigen */}
                          {company.projectCount > 0 && (
                            <div className="border-t bg-blue-50/30 dark:bg-blue-950/10">
                              <div className="p-3 pl-8">
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <FolderKanban className="w-3 h-3" />
                                  Zugeordnete Projekte
                                </p>
                                <div className="space-y-1">
                                  {projects?.filter(p => p.companyId === company.id).map(projekt => (
                                    <div
                                      key={projekt.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                      onClick={() => window.location.href = `/projekte/${projekt.id}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Number(projekt.phase) >= 10 ? '#10b981' : Number(projekt.phase) >= 5 ? '#3b82f6' : '#f59e0b' }} />
                                        <span className="text-sm font-medium">{projekt.name}</span>
                                        <span className="text-xs text-muted-foreground">{projekt.projectNumber}</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {Number(projekt.phase) >= 10 ? 'Abgeschlossen' : Number(projekt.phase) >= 8 ? 'Durchführung' : Number(projekt.phase) >= 5 ? 'Auftrag' : 'Angebot'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {/* LF-11: Zugeordnete Immobilien unter dem Unternehmen anzeigen */}
                          {(() => {
                            const companyProperties = allProperties?.filter((p: any) => p.companyId === company.id) || [];
                            if (companyProperties.length === 0) return null;
                            return (
                              <div className="border-t bg-green-50/30 dark:bg-green-950/10">
                                <div className="p-3 pl-8">
                                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    Zugeordnete Immobilien ({companyProperties.length})
                                  </p>
                                  <div className="space-y-1">
                                    {companyProperties.slice(0, 5).map((prop: any) => (
                                      <div
                                        key={prop.id}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => window.location.href = `/immobilien/${prop.id}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Home className="w-3 h-3 text-primary" />
                                          <span className="text-sm font-medium">{prop.name || prop.street || 'Unbenannt'}</span>
                                          <span className="text-xs text-muted-foreground">{prop.city}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{prop.totalCleanableArea ? `${prop.totalCleanableArea} m²` : ''}</span>
                                      </div>
                                    ))}
                                    {companyProperties.length > 5 && (
                                      <p className="text-xs text-muted-foreground pl-2">+ {companyProperties.length - 5} weitere Immobilien</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="p-2 pl-8 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary"
                              onClick={() => toast.info("Kontakt zu diesem Unternehmen hinzufügen - Funktion in Entwicklung")}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Kontakt hinzufügen
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}

                {/* Kontakte ohne Unternehmen */}
                {orphanContacts.length > 0 && (
                  <Card className="ff-card border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Kontakte ohne Unternehmen ({orphanContacts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="divide-y">
                        {orphanContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="py-2 flex items-center justify-between hover:bg-muted/30 cursor-pointer px-2 rounded"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsDetailOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                                  {getInitials(contact.firstName, contact.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-sm">
                                  {getFullName(contact.firstName, contact.lastName)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {contact.position || ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {contact.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: Flache Kontaktliste */}
          <TabsContent value="kontakte" className="mt-4">
            <Card className="ff-card">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : allFilteredContacts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Contact className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keine Kontakte gefunden</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Versuche andere Suchbegriffe." : "Füge deinen ersten Kontakt hinzu."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allFilteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getFullName(contact.firstName, contact.lastName)}
                              </span>
                              {contact.isPrimary && (
                                <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                                  Hauptkontakt
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{contact.position || "—"}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {getCompanyName(contact.companyId)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {contact.email && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Verwaiste Kontakte */}
          <TabsContent value="verwaist" className="mt-4">
            <Card className="ff-card border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                  Verwaiste Kontakte bereinigen
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Diese Kontakte haben in HubSpot kein zugeordnetes Unternehmen. Ordne sie einem bestehenden Unternehmen zu,
                  damit sie als Ansprechpartner in Projekten und Angeboten verwendet werden können.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                {orphanedLoading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !orphanedContacts || orphanedContacts.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-green-700">Alle Kontakte zugeordnet</h3>
                    <p className="text-muted-foreground">Es gibt keine verwaisten Kontakte mehr. Gut gemacht!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orphanedContacts.map((contact: any) => (
                      <div
                        key={contact.id}
                        className="p-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                              {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getFullName(contact.firstName, contact.lastName)}
                              </span>
                              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">
                                Verwaist
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {contact.position && <span>{contact.position}</span>}
                              {contact.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              setContactToAssign(contact);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <Link2 className="w-3 h-3" />
                            Zuordnen
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsDetailOpen(true);
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Zuordnungs-Dialog für verwaiste Kontakte */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Kontakt einem Unternehmen zuordnen
              </DialogTitle>
              <DialogDescription>
                Ordne <strong>{contactToAssign ? getFullName(contactToAssign.firstName, contactToAssign.lastName) : ''}</strong> einem bestehenden Unternehmen zu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {contactToAssign && (
                <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-amber-100 text-amber-700">
                      {getInitials(contactToAssign.firstName, contactToAssign.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getFullName(contactToAssign.firstName, contactToAssign.lastName)}</p>
                    <p className="text-sm text-muted-foreground">
                      {[contactToAssign.position, contactToAssign.email].filter(Boolean).join(' · ') || 'Keine weiteren Infos'}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <Label>Unternehmen suchen</Label>
                <Input
                  placeholder="Unternehmen durchsuchen..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="border rounded-lg max-h-[240px] overflow-y-auto">
                  {filteredCompaniesForAssign.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">Keine Unternehmen gefunden</p>
                  ) : (
                    filteredCompaniesForAssign.map((company: any) => (
                      <div
                        key={company.id}
                        className={cn(
                          "p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0",
                          selectedCompanyForAssign === company.id.toString() && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                        onClick={() => setSelectedCompanyForAssign(company.id.toString())}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[company.city, company.category ? CATEGORY_LABELS[company.category] : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {selectedCompanyForAssign === company.id.toString() && (
                          <Badge className="bg-primary/10 text-primary text-[10px]">Ausgewählt</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAssignDialogOpen(false); setContactToAssign(null); setSelectedCompanyForAssign(""); setAssignSearch(""); }}>
                Abbrechen
              </Button>
              <Button
                onClick={handleAssignContact}
                disabled={!selectedCompanyForAssign || assignToCompanyMutation.isPending}
                className="ff-button"
              >
                {assignToCompanyMutation.isPending ? "Wird zugeordnet..." : "Zuordnen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Kontakt-Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Kontaktdetails
              </DialogTitle>
              <DialogDescription>
                Kontaktinformationen und Zuordnungen
              </DialogDescription>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedContact.firstName, selectedContact.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{getFullName(selectedContact.firstName, selectedContact.lastName)}</h3>
                    <p className="text-muted-foreground">{selectedContact.position || "—"}</p>
                    <Badge className={selectedContact.isPrimary ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                      {selectedContact.isPrimary ? "Hauptkontakt" : "Kontakt"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedContact.email && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" /> E-Mail
                      </p>
                      <p className="font-medium">{selectedContact.email}</p>
                    </div>
                  )}
                  {selectedContact.phone && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Telefon
                      </p>
                      <p className="font-medium">{selectedContact.phone}</p>
                    </div>
                  )}
                  {selectedContact.mobile && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Mobil
                      </p>
                      <p className="font-medium">{selectedContact.mobile}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> Unternehmen
                    </p>
                    <p className="font-medium">{getCompanyName(selectedContact.companyId)}</p>
                  </div>
                </div>
                
                {selectedContact.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unternehmens-Detail Dialog */}
        <Dialog open={isCompanyDetailOpen} onOpenChange={setIsCompanyDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Unternehmensdetails
              </DialogTitle>
              <DialogDescription>
                Unternehmensinformationen und zugeordnete Kontakte
              </DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCompany.name}</h3>
                    {selectedCompany.category && (
                      <Badge className={cn("mt-1", CATEGORY_COLORS[selectedCompany.category] || "bg-gray-100 text-gray-700")}>
                        {CATEGORY_LABELS[selectedCompany.category] || selectedCompany.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {(selectedCompany.street || selectedCompany.city) && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Adresse
                      </p>
                      <p className="font-medium">
                        {selectedCompany.street && <span>{selectedCompany.street}<br /></span>}
                        {selectedCompany.postalCode} {selectedCompany.city}
                      </p>
                    </div>
                  )}
                  {selectedCompany.email && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" /> E-Mail
                      </p>
                      <p className="font-medium">{selectedCompany.email}</p>
                    </div>
                  )}
                  {selectedCompany.phone && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Telefon
                      </p>
                      <p className="font-medium">{selectedCompany.phone}</p>
                    </div>
                  )}
                  {selectedCompany.website && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Globe className="w-4 h-4" /> Website
                      </p>
                      <p className="font-medium">{selectedCompany.website}</p>
                    </div>
                  )}
                </div>

                {/* Zugeordnete Kontakte */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Kontakte ({selectedCompany.contacts?.length || 0})
                  </h4>
                  {selectedCompany.contacts?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCompany.contacts.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(c.firstName, c.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{getFullName(c.firstName, c.lastName)}</span>
                            <span className="text-xs text-muted-foreground ml-2">{c.position || ""}</span>
                          </div>
                          {c.isPrimary && (
                            <Badge className="bg-purple-100 text-purple-700 text-[10px]">Hauptkontakt</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine Kontakte zugeordnet</p>
                  )}
                </div>

                {selectedCompany.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedCompany.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompanyDetailOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Neues Unternehmen Dialog */}
        <Dialog open={isNewCompanyOpen} onOpenChange={setIsNewCompanyOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neues Unternehmen anlegen</DialogTitle>
              <DialogDescription>
                Erstellen Sie ein neues Unternehmen in der lokalen Datenbank.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nc-name">Firmenname *</Label>
                <Input id="nc-name" placeholder="z.B. Muster Hausverwaltung GmbH" value={newCompany.name} onChange={(e) => setNewCompany(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Kategorie</Label>
                <Select value={newCompany.category} onValueChange={(v) => setNewCompany(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Kategorie wählen..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wohnungsgesellschaft">Wohnungsgesellschaft</SelectItem>
                    <SelectItem value="hausverwaltung">Hausverwaltung</SelectItem>
                    <SelectItem value="privatperson">Privatperson</SelectItem>
                    <SelectItem value="gewerbe">Gewerbe</SelectItem>
                    <SelectItem value="oeffentlich">Öffentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="nc-street">Straße</Label>
                  <Input id="nc-street" placeholder="Musterstr. 1" value={newCompany.street} onChange={(e) => setNewCompany(p => ({ ...p, street: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="nc-plz">PLZ</Label>
                  <Input id="nc-plz" placeholder="12345" value={newCompany.postalCode} onChange={(e) => setNewCompany(p => ({ ...p, postalCode: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="nc-city">Ort</Label>
                  <Input id="nc-city" placeholder="Musterstadt" value={newCompany.city} onChange={(e) => setNewCompany(p => ({ ...p, city: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nc-phone">Telefon</Label>
                  <Input id="nc-phone" placeholder="+49 123 456789" value={newCompany.phone} onChange={(e) => setNewCompany(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="nc-email">E-Mail</Label>
                  <Input id="nc-email" type="email" placeholder="info@firma.de" value={newCompany.email} onChange={(e) => setNewCompany(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewCompanyOpen(false)}>Abbrechen</Button>
              <Button onClick={handleCreateCompany} disabled={createCompanyMutation.isPending} className="ff-button">
                {createCompanyMutation.isPending ? "Wird angelegt..." : "Unternehmen anlegen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Nr.60: Neuer Kontakt Dialog */}
        <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
              <DialogDescription>Erstellen Sie einen neuen Kontakt und ordnen Sie ihn optional einem Unternehmen zu.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nk-vorname">Vorname</Label>
                  <Input id="nk-vorname" placeholder="Max" value={newContact.firstName} onChange={(e) => setNewContact(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="nk-nachname">Nachname *</Label>
                  <Input id="nk-nachname" placeholder="Mustermann" value={newContact.lastName} onChange={(e) => setNewContact(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="nk-position">Position</Label>
                <Input id="nk-position" placeholder="z.B. Geschäftsführer" value={newContact.position} onChange={(e) => setNewContact(p => ({ ...p, position: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nk-email">E-Mail</Label>
                  <Input id="nk-email" type="email" placeholder="max@firma.de" value={newContact.email} onChange={(e) => setNewContact(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="nk-phone">Telefon</Label>
                  <Input id="nk-phone" placeholder="+49 123 456789" value={newContact.phone} onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Unternehmen zuordnen</Label>
                <Select value={newContact.companyId?.toString() || ""} onValueChange={(v) => setNewContact(p => ({ ...p, companyId: v ? parseInt(v) : null }))}>
                  <SelectTrigger><SelectValue placeholder="Unternehmen wählen (optional)..." /></SelectTrigger>
                  <SelectContent>
                    {companies?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>Abbrechen</Button>
              <Button onClick={handleCreateContact} disabled={createContactMutation.isPending} className="ff-button">
                {createContactMutation.isPending ? "Wird angelegt..." : "Kontakt anlegen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
