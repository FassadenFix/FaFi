/**
 * Detail-Dialoge für FassadenFix Projektmanager
 * Wiederverwendbare Komponenten für Projekt-, Baustellen- und Unternehmens-Details
 */

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Euro,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Projekt-Detail-Dialog
// ============================================

export interface ProjektDetail {
  id: string;
  projektNummer: string;
  name: string;
  kunde: string;
  kundenNummer?: string;
  status: "planung" | "aktiv" | "abgeschlossen" | "pausiert";
  startdatum: string;
  enddatum?: string;
  gesamtflaeche: number;
  gesamtpreis: number;
  ansprechpartner: string;
  telefon?: string;
  email?: string;
  adresse: string;
  beschreibung?: string;
  immobilien: { id: string; name: string; flaeche: number }[];
  angebote: { id: string; nummer: string; status: string; betrag: number }[];
  baustellen: { id: string; name: string; phase: string }[];
  notizen?: string;
}

interface ProjektDetailDialogProps {
  projekt: ProjektDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (projekt: ProjektDetail) => void;
  onDelete?: (projektId: string) => void;
}

export function ProjektDetailDialog({
  projekt,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProjektDetailDialogProps) {
  if (!projekt) return null;

  const statusColors: Record<string, string> = {
    planung: "bg-blue-100 text-blue-700",
    aktiv: "bg-green-100 text-green-700",
    abgeschlossen: "bg-gray-100 text-gray-700",
    pausiert: "bg-amber-100 text-amber-700",
  };

  const statusLabels: Record<string, string> = {
    planung: "In Planung",
    aktiv: "Aktiv",
    abgeschlossen: "Abgeschlossen",
    pausiert: "Pausiert",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{projekt.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {projekt.projektNummer} • {projekt.kunde}
              </p>
            </div>
            <Badge className={cn("ml-4", statusColors[projekt.status])}>
              {statusLabels[projekt.status]}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="uebersicht" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="immobilien">Immobilien</TabsTrigger>
            <TabsTrigger value="angebote">Angebote</TabsTrigger>
            <TabsTrigger value="baustellen">Baustellen</TabsTrigger>
          </TabsList>

          <TabsContent value="uebersicht" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Euro}
                label="Gesamtwert"
                value={`${projekt.gesamtpreis.toLocaleString("de-DE")} €`}
              />
              <StatCard
                icon={Building2}
                label="Fläche"
                value={`${projekt.gesamtflaeche.toLocaleString("de-DE")} m²`}
              />
              <StatCard
                icon={Calendar}
                label="Start"
                value={new Date(projekt.startdatum).toLocaleDateString("de-DE")}
              />
              <StatCard
                icon={Clock}
                label="Immobilien"
                value={projekt.immobilien.length.toString()}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kontaktdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={User} label="Ansprechpartner" value={projekt.ansprechpartner} />
                <InfoRow icon={MapPin} label="Adresse" value={projekt.adresse} />
                {projekt.telefon && <InfoRow icon={Phone} label="Telefon" value={projekt.telefon} />}
                {projekt.email && <InfoRow icon={Mail} label="E-Mail" value={projekt.email} />}
              </CardContent>
            </Card>

            {projekt.beschreibung && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{projekt.beschreibung}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="immobilien" className="mt-4">
            <div className="space-y-2">
              {projekt.immobilien.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Immobilien zugeordnet
                </p>
              ) : (
                projekt.immobilien.map((immo) => (
                  <div
                    key={immo.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{immo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {immo.flaeche.toLocaleString("de-DE")} m²
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="angebote" className="mt-4">
            <div className="space-y-2">
              {projekt.angebote.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Angebote vorhanden
                </p>
              ) : (
                projekt.angebote.map((angebot) => (
                  <div
                    key={angebot.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{angebot.nummer}</p>
                      <p className="text-sm text-muted-foreground">
                        {angebot.betrag.toLocaleString("de-DE")} €
                      </p>
                    </div>
                    <Badge variant={angebot.status === "angenommen" ? "default" : "secondary"}>
                      {angebot.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="baustellen" className="mt-4">
            <div className="space-y-2">
              {projekt.baustellen.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Baustellen vorhanden
                </p>
              ) : (
                projekt.baustellen.map((baustelle) => (
                  <div
                    key={baustelle.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{baustelle.name}</p>
                      <p className="text-sm text-muted-foreground">{baustelle.phase}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(projekt)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(projekt.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Unternehmen-Detail-Dialog
// ============================================

export interface UnternehmenDetail {
  id: string;
  name: string;
  kategorie: "A" | "B" | "C";
  branche?: string;
  adresse: string;
  plz: string;
  ort: string;
  telefon?: string;
  email?: string;
  website?: string;
  ansprechpartner: { id: string; name: string; position: string; email?: string; telefon?: string }[];
  projekte: { id: string; name: string; status: string }[];
  umsatzGesamt: number;
  letzterKontakt?: string;
  notizen?: string;
}

interface UnternehmenDetailDialogProps {
  unternehmen: UnternehmenDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (unternehmen: UnternehmenDetail) => void;
}

export function UnternehmenDetailDialog({
  unternehmen,
  open,
  onOpenChange,
  onEdit,
}: UnternehmenDetailDialogProps) {
  if (!unternehmen) return null;

  const kategorieColors: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-gray-100 text-gray-700",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{unternehmen.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{unternehmen.branche}</p>
            </div>
            <Badge className={cn("ml-4", kategorieColors[unternehmen.kategorie])}>
              Kategorie {unternehmen.kategorie}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="uebersicht" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="kontakte">Kontakte</TabsTrigger>
            <TabsTrigger value="projekte">Projekte</TabsTrigger>
          </TabsList>

          <TabsContent value="uebersicht" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Euro}
                label="Gesamtumsatz"
                value={`${unternehmen.umsatzGesamt.toLocaleString("de-DE")} €`}
              />
              <StatCard
                icon={FileText}
                label="Projekte"
                value={unternehmen.projekte.length.toString()}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kontaktdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  icon={MapPin}
                  label="Adresse"
                  value={`${unternehmen.adresse}, ${unternehmen.plz} ${unternehmen.ort}`}
                />
                {unternehmen.telefon && (
                  <InfoRow icon={Phone} label="Telefon" value={unternehmen.telefon} />
                )}
                {unternehmen.email && (
                  <InfoRow icon={Mail} label="E-Mail" value={unternehmen.email} />
                )}
                {unternehmen.website && (
                  <InfoRow icon={ExternalLink} label="Website" value={unternehmen.website} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kontakte" className="mt-4">
            <div className="space-y-2">
              {unternehmen.ansprechpartner.map((kontakt) => (
                <div
                  key={kontakt.id}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{kontakt.name}</p>
                      <p className="text-sm text-muted-foreground">{kontakt.position}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    {kontakt.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {kontakt.email}
                      </span>
                    )}
                    {kontakt.telefon && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {kontakt.telefon}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projekte" className="mt-4">
            <div className="space-y-2">
              {unternehmen.projekte.map((projekt) => (
                <div
                  key={projekt.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <p className="font-medium">{projekt.name}</p>
                  <Badge variant="secondary">{projekt.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(unternehmen)}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Hilfsfunktionen
// ============================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
