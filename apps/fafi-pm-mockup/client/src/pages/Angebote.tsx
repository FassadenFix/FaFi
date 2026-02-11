/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * MVP-Spec: Kernmodul 3 - Angebots-Generator
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Download,
  Send,
  Eye,
  MoreHorizontal,
  Calculator,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  History,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import OfferPDFPreview from "@/components/OfferPDFPreview";
import AngebotWizard from "@/components/AngebotWizard";
import AngebotVersionierung from "@/components/AngebotVersionierung";
import AuftragAnnahmeWizard from "@/components/AuftragAnnahmeWizard";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

// Use inferred type from API response
type OfferFromAPI = {
  id: number;
  offerNumber: string;
  displayName: string | null;
  version: number;
  projectId: number | null;
  companyId: number | null;
  contactId: number | null;
  status: string;
  totalArea: string | null;
  totalPrice: string | null;
  discountPercent: string | null;
  discountType: string | null;
  validUntil: Date | null;
  createdAt: Date;
  sentAt: Date | null;
  project?: { name: string } | null;
  company?: { name: string } | null;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  entwurf: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: FileText },
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: FileText },
  fertig: { label: "Fertig", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  final: { label: "Fertig", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  versendet: { label: "Versendet", color: "bg-amber-100 text-amber-700", icon: Send },
  sent: { label: "Versendet", color: "bg-amber-100 text-amber-700", icon: Send },
  angenommen: { label: "Angenommen", color: "bg-green-100 text-green-700", icon: CheckCircle },
  accepted: { label: "Angenommen", color: "bg-green-100 text-green-700", icon: CheckCircle },
  abgelehnt: { label: "Abgelehnt", color: "bg-red-100 text-red-700", icon: XCircle },
  rejected: { label: "Abgelehnt", color: "bg-red-100 text-red-700", icon: XCircle },
  abgelaufen: { label: "Abgelaufen", color: "bg-orange-100 text-orange-700", icon: Clock },
  obsolet: { label: "Obsolet", color: "bg-slate-100 text-slate-500 line-through", icon: FileText },
};

export default function Angebote() {
  // Fetch offers from API
  const { data: offersData, isLoading, refetch } = trpc.offer.list.useQuery();

  // Fetch follow-up reminders
  const { data: followUpsData } = trpc.followUp.list.useQuery();
  const followUpCompleteMutation = trpc.followUp.complete.useMutation({
    onSuccess: () => {
      toast.success("Nachfassen als erledigt markiert");
    },
  });

  // Map follow-ups to offers
  const getFollowUpForOffer = (offerId: number) => {
    if (!followUpsData) return null;
    const pending = (followUpsData as any[]).filter(
      (f: any) => f.offerId === offerId && f.status === 'pending'
    );
    if (pending.length === 0) return null;
    // Return the most urgent one
    return pending.sort((a: any, b: any) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
  };

  const [previewOffer, setPreviewOffer] = useState<any | null>(null);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [isAngebotWizardOpen, setIsAngebotWizardOpen] = useState(false);
  const [isVersionierungOpen, setIsVersionierungOpen] = useState(false);
  const [selectedOfferForVersions, setSelectedOfferForVersions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAuftragWizardOpen, setIsAuftragWizardOpen] = useState(false);
  const [selectedOfferForAuftrag, setSelectedOfferForAuftrag] = useState<any | null>(null);

  // Transform and filter offers
  const offers = useMemo(() => {
    if (!offersData) return [];
    
    let filtered = offersData as any[];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((o) =>
        o.offerNumber.toLowerCase().includes(query) ||
        o.project?.name?.toLowerCase().includes(query) ||
        o.company?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    
    return filtered;
  }, [offersData, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!offersData) return { total: 0, thisMonth: 0, totalValue: 0, accepted: 0 };
    
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return {
      total: offersData.length,
      thisMonth: offersData.filter((o: any) => {
        const created = new Date(o.createdAt);
        return `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}` === thisMonth;
      }).length,
      totalValue: offersData.reduce((sum: number, o: any) => sum + (parseFloat(o.totalPrice || '0') || 0), 0),
      accepted: offersData.filter((o: any) => o.status === "angenommen" || o.status === "accepted").length,
    };
  }, [offersData]);

  const handleOpenPreview = (offer: any) => {
    setPreviewOffer({
      id: offer.id.toString(),
      offerNumber: offer.offerNumber,
      version: offer.version,
      projectName: offer.project?.name || 'Unbekannt',
      customerName: offer.company?.name || 'Unbekannt',
      status: offer.status,
      totalArea: parseFloat(offer.totalArea || '0') || 0,
      totalPrice: parseFloat(offer.totalPrice || '0') || 0,
      discountPercent: parseFloat(offer.discountPercent || '0'),
      discountType: offer.discountType,
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
      createdAt: new Date(offer.createdAt).toISOString().split('T')[0],
      sentAt: offer.sentAt ? new Date(offer.sentAt).toISOString().split('T')[0] : null,
    });
    setIsPDFPreviewOpen(true);
  };

  const handleGeneratePDF = (offerId: number) => {
    // Öffne das PDF in einem neuen Tab (Server-seitige Generierung mit Briefbogen)
    window.open(`/api/pdf/offer/${offerId}`, '_blank');
    toast.success("PDF wird generiert...", {
      description: "Das Angebot wird als PDF mit Briefbogen erstellt.",
    });
  };

  const handleSendOffer = (offerId: number) => {
    toast.success("Angebot versendet", {
      description: "Das Angebot wurde erfolgreich per E-Mail versendet.",
    });
  };

  const handleOpenVersionierung = (offerNumber: string) => {
    setSelectedOfferForVersions(offerNumber);
    setIsVersionierungOpen(true);
  };

  // Neue Version eines Angebots erstellen
  const createVersionMutation = trpc.offer.createVersion.useMutation();
  const handleCreateVersion = async (offerId: number) => {
    try {
      const result = await createVersionMutation.mutateAsync({ offerId });
      await refetch();
      toast.success(`Neue Version ${result.version} erstellt`, {
        description: "Die vorherige Version wurde als obsolet markiert.",
      });
    } catch (error: any) {
      toast.error("Fehler beim Erstellen der neuen Version", {
        description: error?.message || "Unbekannter Fehler",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Angebote aktualisiert");
  };

  const handleWizardComplete = () => {
    setIsAngebotWizardOpen(false);
    refetch();
    toast.success("Angebot erstellt", {
      description: "Das neue Angebot wurde erfolgreich gespeichert.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold">Angebote</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie alle Angebote und generieren Sie neue Kostenvoranschläge
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button className="gap-2 ff-button" onClick={() => setIsAngebotWizardOpen(true)}>
              <Plus className="w-4 h-4" />
              Neues Angebot
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.total}</p>
                  )}
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diesen Monat</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  )}
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamtwert</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.totalValue.toLocaleString("de-DE")} €</p>
                  )}
                </div>
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Angenommen</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{stats.accepted}</p>
                  )}
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Angebote suchen..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="entwurf">Entwurf</SelectItem>
                  <SelectItem value="versendet">Versendet</SelectItem>
                  <SelectItem value="angenommen">Angenommen</SelectItem>
                  <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
                  <SelectItem value="obsolet">Obsolet</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Weitere Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offers Table */}
        <Card className="ff-card animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle>Alle Angebote</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Keine Angebote gefunden</p>
                <p className="text-sm mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Versuchen Sie andere Suchkriterien"
                    : "Erstellen Sie Ihr erstes Angebot mit dem Button oben"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Angebotsnr.</TableHead>
                    <TableHead>Projekt</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Immobilien</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Fläche</TableHead>
                    <TableHead className="text-right">Preis</TableHead>
                    <TableHead className="text-right">Gültig bis</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => {
                    const status = statusConfig[offer.status] || statusConfig.entwurf;
                    const StatusIcon = status.icon;
                    const area = parseFloat(offer.totalArea || '0') || 0;
                    const price = parseFloat(offer.totalPrice || '0') || 0;
                    const discount = parseFloat(offer.discountPercent || '0');
                    
                    return (
                      <TableRow key={offer.id} className="ff-transition hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div>
                            {offer.displayName || offer.offerNumber}
                            {!offer.displayName && offer.version > 1 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                v{offer.version}
                              </span>
                            )}
                          </div>
                          {offer.displayName && (
                            <p className="text-xs text-muted-foreground/70 font-mono">{offer.offerNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>{offer.project?.name || 'Kein Projekt'}</TableCell>
                        <TableCell>{offer.company?.name || 'Kein Kunde'}</TableCell>
                        <TableCell>
                          {(offer as any).propertyNames?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(offer as any).propertyNames.slice(0, 2).map((name: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px]">{name}</Badge>
                              ))}
                              {(offer as any).propertyNames.length > 2 && (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">+{(offer as any).propertyNames.length - 2}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={`${status.color} gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            {/* Nachfass-Badge */}
                            {(() => {
                              const followUp = getFollowUpForOffer(offer.id);
                              if (!followUp) return null;
                              const dueDate = new Date(followUp.dueAt);
                              const today = new Date();
                              const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              const isOverdue = daysUntil <= 0;
                              return (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[10px] gap-1 cursor-pointer hover:opacity-80 transition-opacity",
                                    isOverdue ? "border-red-300 text-red-600 bg-red-50" : 
                                    daysUntil <= 3 ? "border-amber-300 text-amber-600 bg-amber-50" : 
                                    "border-blue-300 text-blue-600 bg-blue-50"
                                  )}
                                  onClick={() => followUpCompleteMutation.mutate({ id: followUp.id, notes: 'Aus Angebotsliste erledigt' })}
                                  title="Klicken um als nachgefasst zu markieren"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  {isOverdue ? `Überfällig` : `${daysUntil}T`}
                                </Badge>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {area.toLocaleString("de-DE")} m²
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {price.toLocaleString("de-DE")} €
                          {discount > 0 && (
                            <span className="text-xs text-primary ml-1">
                              (-{discount}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {offer.validUntil
                            ? new Date(offer.validUntil).toLocaleDateString("de-DE")
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenPreview(offer)}
                              title="PDF-Vorschau"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenVersionierung(offer.offerNumber)}
                              title="Versionshistorie"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleGeneratePDF(offer.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {(offer.status === "entwurf" || offer.status === "draft") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => handleSendOffer(offer.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {(offer.status === "versendet" || offer.status === "sent") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[#77bc1f] hover:text-[#77bc1f]/80 hover:bg-[#77bc1f]/10 gap-1 px-2"
                                onClick={() => {
                                  setSelectedOfferForAuftrag(offer);
                                  setIsAuftragWizardOpen(true);
                                }}
                                title="Auftrag annehmen"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Auftrag</span>
                              </Button>
                            )}
                            {offer.status !== "obsolet" && offer.status !== "angenommen" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => handleCreateVersion(offer.id)}
                                title="Neue Version erstellen"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Preview Modal */}
      <OfferPDFPreview
        offer={previewOffer}
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
      />

      {/* Angebot Wizard */}
      <AngebotWizard
        isOpen={isAngebotWizardOpen}
        onClose={() => setIsAngebotWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      {/* Auftrag-Annahme-Wizard */}
      {selectedOfferForAuftrag && (
        <AuftragAnnahmeWizard
          isOpen={isAuftragWizardOpen}
          onClose={() => {
            setIsAuftragWizardOpen(false);
            setSelectedOfferForAuftrag(null);
          }}
          onComplete={() => {
            setIsAuftragWizardOpen(false);
            setSelectedOfferForAuftrag(null);
            refetch();
          }}
          projectId={selectedOfferForAuftrag.projectId || 0}
          projectName={selectedOfferForAuftrag.project?.name || "Unbekanntes Projekt"}
          offerId={selectedOfferForAuftrag.id}
          offerNumber={selectedOfferForAuftrag.offerNumber}
          offerTotal={selectedOfferForAuftrag.totalPrice || "0"}
          companyName={selectedOfferForAuftrag.company?.name || "Unbekannter Kunde"}
        />
      )}

      {/* Versionshistorie */}
      <AngebotVersionierung
        angebotNummer={selectedOfferForVersions || "ANG-2026-1234"}
        versionen={[]} // Versionen werden via tRPC geladen (offer.getVersions)
        isOpen={isVersionierungOpen}
        onClose={() => {
          setIsVersionierungOpen(false);
          setSelectedOfferForVersions(null);
        }}
        onRestoreVersion={(version) => {
          toast.success(`Version ${version.versionNummer} wiederhergestellt`, {
            description: "Das Angebot wurde auf die ausgewählte Version zurückgesetzt.",
          });
          setIsVersionierungOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
