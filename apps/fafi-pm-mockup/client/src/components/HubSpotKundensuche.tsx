/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * HubSpot-Integration für Kundensuche und -auswahl
 * KA-20: Jetzt mit tRPC-Anbindung an die DB statt Mock-Daten
 */

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Plus,
  History,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// ============================================
// TYPES
// ============================================

export interface HubSpotKontakt {
  id: string;
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  letztesAngebot?: string;
  anzahlProjekte?: number;
  kategorie?: "A" | "B" | "C";
  hubspotUrl?: string;
}

interface HubSpotKundensucheProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (kunde: HubSpotKontakt) => void;
}

// ============================================
// KONTAKT CARD COMPONENT
// ============================================

function KontaktCard({
  kontakt,
  onSelect,
  isSelected,
}: {
  kontakt: HubSpotKontakt;
  onSelect: () => void;
  isSelected?: boolean;
}) {
  const kategorieColors = {
    A: "bg-green-100 text-green-700",
    B: "bg-amber-100 text-amber-700",
    C: "bg-gray-100 text-gray-700",
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{kontakt.firma}</h4>
              {kontakt.kategorie && (
                <Badge className={cn("text-xs", kategorieColors[kontakt.kategorie])}>
                  {kontakt.kategorie}
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {kontakt.ansprechpartner && (
                <p className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {kontakt.ansprechpartner}
                </p>
              )}
              {(kontakt.strasse || kontakt.ort) && (
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[kontakt.strasse, `${kontakt.plz} ${kontakt.ort}`].filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3">
                {kontakt.telefon && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {kontakt.telefon}
                  </span>
                )}
                {kontakt.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {kontakt.email}
                  </span>
                )}
              </div>
            </div>
            {kontakt.anzahlProjekte && kontakt.anzahlProjekte > 0 && (
              <p className="text-xs text-primary mt-2">
                {kontakt.anzahlProjekte} Projekt{kontakt.anzahlProjekte > 1 ? "e" : ""} durchgeführt
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {isSelected ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            )}
            {kontakt.hubspotUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(kontakt.hubspotUrl, "_blank");
                }}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HubSpotKundensuche({
  isOpen,
  onClose,
  onSelect,
}: HubSpotKundensucheProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedKontakt, setSelectedKontakt] = useState<HubSpotKontakt | null>(null);
  const [activeTab, setActiveTab] = useState("suche");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // tRPC: Unternehmen aus DB suchen
  const { data: companyResults, isLoading: searchLoading } = trpc.company.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  // tRPC: Alle Unternehmen für "Top-Kunden" Tab (nur die ersten 10)
  const { data: allCompanies } = trpc.company.list.useQuery(undefined, {
    enabled: isOpen,
  });

  // Map DB companies to HubSpotKontakt format
  const mapCompanyToKontakt = (company: any): HubSpotKontakt => ({
    id: String(company.id),
    firma: company.name || "Unbenanntes Unternehmen",
    ansprechpartner: company.contactPerson || "",
    strasse: company.street || "",
    plz: company.postalCode || "",
    ort: company.city || "",
    telefon: company.phone || "",
    email: company.email || "",
    anzahlProjekte: company.projectCount || 0,
    kategorie: company.category === "wohnungsgesellschaft" ? "A" : company.category === "hausverwaltung" ? "B" : "C",
    hubspotUrl: company.hubspotCompanyId ? `https://app.hubspot.com/contacts/company/${company.hubspotCompanyId}` : undefined,
  });

  const searchResults: HubSpotKontakt[] = useMemo(() => {
    if (!companyResults) return [];
    return companyResults.map(mapCompanyToKontakt);
  }, [companyResults]);

  const topKunden: HubSpotKontakt[] = useMemo(() => {
    if (!allCompanies) return [];
    return allCompanies
      .filter((c: any) => c.category === "wohnungsgesellschaft" || c.category === "hausverwaltung")
      .slice(0, 10)
      .map(mapCompanyToKontakt);
  }, [allCompanies]);

  const letzteAuswahl: HubSpotKontakt[] = useMemo(() => {
    if (!allCompanies) return [];
    // Zeige die zuletzt aktualisierten Unternehmen
    return [...allCompanies]
      .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 5)
      .map(mapCompanyToKontakt);
  }, [allCompanies]);

  // Handle selection
  const handleSelect = (kontakt: HubSpotKontakt) => {
    setSelectedKontakt(kontakt);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedKontakt) {
      onSelect(selectedKontakt);
      toast.success("Kunde übernommen", {
        description: `${selectedKontakt.firma} wurde als Kunde ausgewählt.`,
      });
      onClose();
    }
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setSelectedKontakt(null);
      setActiveTab("suche");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Kunde auswählen
          </DialogTitle>
          <DialogDescription>
            Suche nach Unternehmen in der Datenbank ({allCompanies?.length || "..."} Unternehmen verfügbar)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 grid grid-cols-3">
            <TabsTrigger value="suche" className="gap-2">
              <Search className="w-4 h-4" />
              Suche
            </TabsTrigger>
            <TabsTrigger value="letzte" className="gap-2">
              <History className="w-4 h-4" />
              Zuletzt aktualisiert
            </TabsTrigger>
            <TabsTrigger value="favoriten" className="gap-2">
              <Star className="w-4 h-4" />
              Top-Kunden
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="suche" className="h-full m-0 p-4 flex flex-col gap-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Firma, Ansprechpartner, Ort oder PLZ... (min. 2 Zeichen)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {searchLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary self-center" />
                )}
              </div>

              {/* Search Results */}
              <ScrollArea className="flex-1">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3 pr-4">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length} Ergebnis{searchResults.length > 1 ? "se" : ""} gefunden
                    </p>
                    {searchResults.map((kontakt) => (
                      <KontaktCard
                        key={kontakt.id}
                        kontakt={kontakt}
                        onSelect={() => handleSelect(kontakt)}
                        isSelected={selectedKontakt?.id === kontakt.id}
                      />
                    ))}
                  </div>
                ) : debouncedQuery.length >= 2 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Ergebnisse für &ldquo;{debouncedQuery}&rdquo;</p>
                    <p className="text-sm mt-1">Versuche einen anderen Suchbegriff</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Gib einen Suchbegriff ein</p>
                    <p className="text-sm mt-1">z.B. Firmenname, Ansprechpartner oder Ort (mind. 2 Zeichen)</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="letzte" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Zuletzt aktualisierte Unternehmen
                  </p>
                  {letzteAuswahl.length > 0 ? (
                    letzteAuswahl.map((kontakt) => (
                      <KontaktCard
                        key={kontakt.id}
                        kontakt={kontakt}
                        onSelect={() => handleSelect(kontakt)}
                        isSelected={selectedKontakt?.id === kontakt.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Keine kürzlich aktualisierten Unternehmen</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favoriten" className="h-full m-0 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Top-Kunden (Wohnungsgesellschaften & Hausverwaltungen)
                  </p>
                  {topKunden.length > 0 ? (
                    topKunden.map((kontakt) => (
                      <KontaktCard
                        key={kontakt.id}
                        kontakt={kontakt}
                        onSelect={() => handleSelect(kontakt)}
                        isSelected={selectedKontakt?.id === kontakt.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Keine Top-Kunden gefunden</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-card">
          <div className="text-sm text-muted-foreground">
            {selectedKontakt ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <strong>{selectedKontakt.firma}</strong> ausgewählt
              </span>
            ) : (
              "Wähle einen Kunden aus"
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedKontakt}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Übernehmen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
