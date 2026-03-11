/**
 * Angebots-Versionierung
 * 
 * Ermöglicht das Nachverfolgen von Änderungen und Vergleichen
 * verschiedener Versionen eines Angebots.
 * 
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  GitCompare,
  Clock,
  User,
  FileText,
  Euro,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Check,
  X,
  Eye,
  RotateCcw,
  Download,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface AngebotVersion {
  id: string;
  versionNummer: number;
  angebotNummer: string;
  erstelltAm: string;
  erstelltVon: string;
  aenderungsgrund: string;
  status: 'entwurf' | 'gesendet' | 'angenommen' | 'abgelehnt' | 'abgelaufen';
  daten: {
    kunde: string;
    projektName: string;
    gesamtflaeche: number;
    summeNetto: number;
    summeBrutto: number;
    gueltigBis: string;
    positionen: Array<{
      bezeichnung: string;
      menge: number;
      einheit: string;
      einzelpreis: number;
      gesamt: number;
    }>;
    garantien: string[];
    bedingungen: string[];
  };
}

export interface VersionsAenderung {
  feld: string;
  feldLabel: string;
  altWert: string | number;
  neuWert: string | number;
  typ: 'geaendert' | 'hinzugefuegt' | 'entfernt';
  kategorie: 'preis' | 'kunde' | 'leistung' | 'kondition';
}

interface AngebotVersionierungProps {
  angebotNummer: string;
  versionen: AngebotVersion[];
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (version: AngebotVersion) => void;
}

// ============================================
// MOCK DATA
// ============================================

export const MOCK_VERSIONEN: AngebotVersion[] = [
  {
    id: "v3",
    versionNummer: 3,
    angebotNummer: "ANG-2026-1234",
    erstelltAm: "2026-02-04T10:30:00",
    erstelltVon: "Alexander Retzlaff",
    aenderungsgrund: "Preisnachlass nach Kundenrückfrage",
    status: 'gesendet',
    daten: {
      kunde: "3A Immobilien",
      projektName: "Wohnanlage Sonnenhof",
      gesamtflaeche: 2850,
      summeNetto: 26362.50,
      summeBrutto: 31371.38,
      gueltigBis: "2026-03-04",
      positionen: [
        { bezeichnung: "Fassadenreinigung Nord", menge: 1200, einheit: "m²", einzelpreis: 9.25, gesamt: 11100 },
        { bezeichnung: "Fassadenreinigung Süd", menge: 1650, einheit: "m²", einzelpreis: 9.25, gesamt: 15262.50 },
        { bezeichnung: "Hubarbeitsbühne", menge: 6, einheit: "Tage", einzelpreis: 280, gesamt: 1680 },
      ],
      garantien: ['5-jahres-garantie', 'ergebnisgarantie', 'inspektion', 'pauschalfestpreis'],
      bedingungen: ['gueltigkeit-30', 'zahlung-14', 'leistungsort', 'agb'],
    },
  },
  {
    id: "v2",
    versionNummer: 2,
    angebotNummer: "ANG-2026-1234",
    erstelltAm: "2026-02-02T14:15:00",
    erstelltVon: "Alexander Retzlaff",
    aenderungsgrund: "Zusätzliche Fläche Südseite hinzugefügt",
    status: 'abgelaufen',
    daten: {
      kunde: "3A Immobilien",
      projektName: "Wohnanlage Sonnenhof",
      gesamtflaeche: 2850,
      summeNetto: 27825.00,
      summeBrutto: 33111.75,
      gueltigBis: "2026-03-02",
      positionen: [
        { bezeichnung: "Fassadenreinigung Nord", menge: 1200, einheit: "m²", einzelpreis: 9.75, gesamt: 11700 },
        { bezeichnung: "Fassadenreinigung Süd", menge: 1650, einheit: "m²", einzelpreis: 9.75, gesamt: 16087.50 },
        { bezeichnung: "Hubarbeitsbühne", menge: 6, einheit: "Tage", einzelpreis: 280, gesamt: 1680 },
      ],
      garantien: ['5-jahres-garantie', 'ergebnisgarantie', 'inspektion'],
      bedingungen: ['gueltigkeit-30', 'zahlung-7', 'leistungsort', 'agb'],
    },
  },
  {
    id: "v1",
    versionNummer: 1,
    angebotNummer: "ANG-2026-1234",
    erstelltAm: "2026-01-28T09:00:00",
    erstelltVon: "Sebastian Siebenhühner",
    aenderungsgrund: "Erstversion",
    status: 'abgelaufen',
    daten: {
      kunde: "3A Immobilien",
      projektName: "Wohnanlage Sonnenhof",
      gesamtflaeche: 1200,
      summeNetto: 13380.00,
      summeBrutto: 15922.20,
      gueltigBis: "2026-02-28",
      positionen: [
        { bezeichnung: "Fassadenreinigung Nord", menge: 1200, einheit: "m²", einzelpreis: 9.75, gesamt: 11700 },
        { bezeichnung: "Hubarbeitsbühne", menge: 3, einheit: "Tage", einzelpreis: 280, gesamt: 840 },
      ],
      garantien: ['5-jahres-garantie', 'ergebnisgarantie'],
      bedingungen: ['gueltigkeit-30', 'zahlung-7', 'leistungsort'],
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function berechneAenderungen(altVersion: AngebotVersion, neuVersion: AngebotVersion): VersionsAenderung[] {
  const aenderungen: VersionsAenderung[] = [];

  // Preis-Änderungen
  if (altVersion.daten.summeNetto !== neuVersion.daten.summeNetto) {
    aenderungen.push({
      feld: 'summeNetto',
      feldLabel: 'Nettobetrag',
      altWert: altVersion.daten.summeNetto,
      neuWert: neuVersion.daten.summeNetto,
      typ: 'geaendert',
      kategorie: 'preis',
    });
  }

  // Flächen-Änderungen
  if (altVersion.daten.gesamtflaeche !== neuVersion.daten.gesamtflaeche) {
    aenderungen.push({
      feld: 'gesamtflaeche',
      feldLabel: 'Gesamtfläche',
      altWert: altVersion.daten.gesamtflaeche,
      neuWert: neuVersion.daten.gesamtflaeche,
      typ: 'geaendert',
      kategorie: 'leistung',
    });
  }

  // Gültigkeit
  if (altVersion.daten.gueltigBis !== neuVersion.daten.gueltigBis) {
    aenderungen.push({
      feld: 'gueltigBis',
      feldLabel: 'Gültig bis',
      altWert: new Date(altVersion.daten.gueltigBis).toLocaleDateString('de-DE'),
      neuWert: new Date(neuVersion.daten.gueltigBis).toLocaleDateString('de-DE'),
      typ: 'geaendert',
      kategorie: 'kondition',
    });
  }

  // Positionen
  const altPositionen = altVersion.daten.positionen.length;
  const neuPositionen = neuVersion.daten.positionen.length;
  if (altPositionen !== neuPositionen) {
    aenderungen.push({
      feld: 'positionen',
      feldLabel: 'Positionen',
      altWert: altPositionen,
      neuWert: neuPositionen,
      typ: neuPositionen > altPositionen ? 'hinzugefuegt' : 'entfernt',
      kategorie: 'leistung',
    });
  }

  // Garantien
  const altGarantien = altVersion.daten.garantien.length;
  const neuGarantien = neuVersion.daten.garantien.length;
  if (altGarantien !== neuGarantien) {
    aenderungen.push({
      feld: 'garantien',
      feldLabel: 'Garantien',
      altWert: altGarantien,
      neuWert: neuGarantien,
      typ: neuGarantien > altGarantien ? 'hinzugefuegt' : 'entfernt',
      kategorie: 'kondition',
    });
  }

  return aenderungen;
}

function getStatusBadge(status: AngebotVersion['status']) {
  const config = {
    entwurf: { label: 'Entwurf', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700' },
    gesendet: { label: 'Gesendet', variant: 'default' as const, className: 'bg-blue-100 text-blue-700' },
    angenommen: { label: 'Angenommen', variant: 'default' as const, className: 'bg-green-100 text-green-700' },
    abgelehnt: { label: 'Abgelehnt', variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
    abgelaufen: { label: 'Abgelaufen', variant: 'secondary' as const, className: 'bg-amber-100 text-amber-700' },
  };
  return config[status];
}

function formatPreis(wert: number): string {
  return wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatDatum(datum: string): string {
  return new Date(datum).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// SUB-COMPONENTS
// ============================================

function VersionTimeline({ 
  versionen, 
  selectedVersion, 
  onSelectVersion 
}: { 
  versionen: AngebotVersion[]; 
  selectedVersion: AngebotVersion | null;
  onSelectVersion: (v: AngebotVersion) => void;
}) {
  return (
    <div className="space-y-4">
      {versionen.map((version, index) => {
        const isSelected = selectedVersion?.id === version.id;
        const isLatest = index === 0;
        const statusConfig = getStatusBadge(version.status);

        return (
          <div
            key={version.id}
            className={cn(
              "relative pl-6 pb-4 cursor-pointer transition-all",
              index < versionen.length - 1 && "border-l-2 border-muted ml-2"
            )}
            onClick={() => onSelectVersion(version)}
          >
            {/* Timeline Dot */}
            <div
              className={cn(
                "absolute left-0 top-0 w-4 h-4 rounded-full border-2 -translate-x-1/2",
                isSelected
                  ? "bg-primary border-primary"
                  : isLatest
                  ? "bg-primary/20 border-primary"
                  : "bg-muted border-muted-foreground/30"
              )}
            />

            {/* Version Card */}
            <div
              className={cn(
                "p-3 rounded-lg border transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">v{version.versionNummer}</span>
                  {isLatest && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      Aktuell
                    </Badge>
                  )}
                </div>
                <Badge className={cn("text-[10px]", statusConfig.className)}>
                  {statusConfig.label}
                </Badge>
              </div>

              <p className="text-sm font-medium mb-1">{version.aenderungsgrund}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDatum(version.erstelltAm)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {version.erstelltVon}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-muted flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {version.daten.gesamtflaeche.toLocaleString('de-DE')} m²
                </span>
                <span className="font-semibold text-primary">
                  {formatPreis(version.daten.summeBrutto)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VersionDetails({ version }: { version: AngebotVersion }) {
  const statusConfig = getStatusBadge(version.status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            Version {version.versionNummer}
            <Badge className={cn("text-xs", statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">{version.aenderungsgrund}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">{formatDatum(version.erstelltAm)}</p>
          <p className="font-medium">{version.erstelltVon}</p>
        </div>
      </div>

      <Separator />

      {/* Übersicht */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileText className="w-4 h-4" />
              Projekt
            </div>
            <p className="font-semibold">{version.daten.projektName}</p>
            <p className="text-sm text-muted-foreground">{version.daten.kunde}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Euro className="w-4 h-4" />
              Gesamtbetrag
            </div>
            <p className="font-bold text-xl text-primary">{formatPreis(version.daten.summeBrutto)}</p>
            <p className="text-sm text-muted-foreground">
              netto: {formatPreis(version.daten.summeNetto)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Positionen */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Positionen ({version.daten.positionen.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Bezeichnung</th>
                <th className="text-right p-2 font-medium">Menge</th>
                <th className="text-right p-2 font-medium">Einzelpreis</th>
                <th className="text-right p-2 font-medium">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {version.daten.positionen.map((pos, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{pos.bezeichnung}</td>
                  <td className="p-2 text-right">{pos.menge} {pos.einheit}</td>
                  <td className="p-2 text-right">{formatPreis(pos.einzelpreis)}</td>
                  <td className="p-2 text-right font-medium">{formatPreis(pos.gesamt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Konditionen */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">Gültig bis</p>
          <p className="font-medium">{new Date(version.daten.gueltigBis).toLocaleDateString('de-DE')}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Garantien</p>
          <p className="font-medium">{version.daten.garantien.length} ausgewählt</p>
        </div>
      </div>
    </div>
  );
}

function VersionVergleich({ 
  altVersion, 
  neuVersion 
}: { 
  altVersion: AngebotVersion; 
  neuVersion: AngebotVersion;
}) {
  const aenderungen = berechneAenderungen(altVersion, neuVersion);
  
  const preisAenderung = neuVersion.daten.summeNetto - altVersion.daten.summeNetto;
  const preisAenderungProzent = ((preisAenderung / altVersion.daten.summeNetto) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="text-center flex-1">
          <Badge variant="secondary" className="mb-1">v{altVersion.versionNummer}</Badge>
          <p className="text-sm text-muted-foreground">{formatDatum(altVersion.erstelltAm)}</p>
        </div>
        <div className="px-4">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center flex-1">
          <Badge className="mb-1 bg-primary">v{neuVersion.versionNummer}</Badge>
          <p className="text-sm text-muted-foreground">{formatDatum(neuVersion.erstelltAm)}</p>
        </div>
      </div>

      {/* Preis-Differenz Highlight */}
      <Card className={cn(
        "border-2",
        preisAenderung < 0 ? "border-green-200 bg-green-50" : preisAenderung > 0 ? "border-red-200 bg-red-50" : "border-muted"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preisänderung</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {preisAenderung < 0 ? (
                  <ArrowDown className="w-5 h-5 text-green-600" />
                ) : preisAenderung > 0 ? (
                  <ArrowUp className="w-5 h-5 text-red-600" />
                ) : (
                  <Minus className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={preisAenderung < 0 ? "text-green-600" : preisAenderung > 0 ? "text-red-600" : ""}>
                  {preisAenderung >= 0 ? '+' : ''}{formatPreis(preisAenderung)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Prozentual</p>
              <p className={cn(
                "text-xl font-bold",
                preisAenderung < 0 ? "text-green-600" : preisAenderung > 0 ? "text-red-600" : ""
              )}>
                {Number(preisAenderungProzent) >= 0 ? '+' : ''}{preisAenderungProzent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Änderungsliste */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Änderungen ({aenderungen.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {aenderungen.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              Keine Änderungen gefunden
            </p>
          ) : (
            <div className="divide-y">
              {aenderungen.map((aenderung, index) => (
                <div key={index} className="p-3 flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    aenderung.typ === 'hinzugefuegt' && "bg-green-100 text-green-600",
                    aenderung.typ === 'entfernt' && "bg-red-100 text-red-600",
                    aenderung.typ === 'geaendert' && "bg-blue-100 text-blue-600"
                  )}>
                    {aenderung.typ === 'hinzugefuegt' && <Check className="w-4 h-4" />}
                    {aenderung.typ === 'entfernt' && <X className="w-4 h-4" />}
                    {aenderung.typ === 'geaendert' && <ArrowRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{aenderung.feldLabel}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground line-through">
                        {typeof aenderung.altWert === 'number' && aenderung.kategorie === 'preis'
                          ? formatPreis(aenderung.altWert)
                          : typeof aenderung.altWert === 'number'
                          ? aenderung.altWert.toLocaleString('de-DE')
                          : aenderung.altWert}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="font-medium text-primary">
                        {typeof aenderung.neuWert === 'number' && aenderung.kategorie === 'preis'
                          ? formatPreis(aenderung.neuWert)
                          : typeof aenderung.neuWert === 'number'
                          ? aenderung.neuWert.toLocaleString('de-DE')
                          : aenderung.neuWert}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {aenderung.kategorie}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Änderungsgrund */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Änderungsgrund (v{neuVersion.versionNummer})</p>
        <p className="text-sm font-medium">{neuVersion.aenderungsgrund}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AngebotVersionierung({
  angebotNummer,
  versionen,
  isOpen,
  onClose,
  onRestoreVersion,
}: AngebotVersionierungProps) {
  const [selectedVersion, setSelectedVersion] = useState<AngebotVersion | null>(
    versionen.length > 0 ? versionen[0] : null
  );
  const [compareVersion, setCompareVersion] = useState<AngebotVersion | null>(
    versionen.length > 1 ? versionen[1] : null
  );
  const [activeTab, setActiveTab] = useState<'historie' | 'vergleich'>('historie');

  const handleRestoreVersion = (version: AngebotVersion) => {
    if (onRestoreVersion) {
      onRestoreVersion(version);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Versionshistorie – {angebotNummer}
            <Badge variant="secondary" className="ml-2">
              {versionen.length} Version{versionen.length !== 1 ? 'en' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'historie' | 'vergleich')} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="historie" className="gap-2">
              <History className="w-4 h-4" />
              Historie
            </TabsTrigger>
            <TabsTrigger value="vergleich" className="gap-2">
              <GitCompare className="w-4 h-4" />
              Vergleich
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historie" className="flex-1 flex overflow-hidden m-0 p-4 pt-2">
            {/* Timeline */}
            <div className="w-80 flex-shrink-0 pr-4 border-r">
              <ScrollArea className="h-full">
                <VersionTimeline
                  versionen={versionen}
                  selectedVersion={selectedVersion}
                  onSelectVersion={setSelectedVersion}
                />
              </ScrollArea>
            </div>

            {/* Details */}
            <div className="flex-1 pl-4 overflow-auto">
              {selectedVersion ? (
                <>
                  <VersionDetails version={selectedVersion} />
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      PDF anzeigen
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportieren
                    </Button>
                    {selectedVersion.versionNummer < versionen[0].versionNummer && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 ml-auto"
                        onClick={() => handleRestoreVersion(selectedVersion)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Wiederherstellen
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Wähle eine Version aus der Timeline</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vergleich" className="flex-1 overflow-hidden m-0 p-4 pt-2">
            {versionen.length < 2 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nicht genügend Versionen</p>
                <p className="text-sm">Mindestens 2 Versionen werden für einen Vergleich benötigt.</p>
              </div>
            ) : (
              <div className="flex h-full gap-4">
                {/* Version Selector */}
                <div className="w-64 flex-shrink-0 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Alte Version</p>
                    <div className="space-y-2">
                      {versionen.slice(1).map((v) => (
                        <div
                          key={v.id}
                          className={cn(
                            "p-2 rounded border cursor-pointer transition-all",
                            compareVersion?.id === v.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30"
                          )}
                          onClick={() => setCompareVersion(v)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">v{v.versionNummer}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPreis(v.daten.summeBrutto)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Neue Version</p>
                    <div className="space-y-2">
                      {versionen.slice(0, -1).map((v) => (
                        <div
                          key={v.id}
                          className={cn(
                            "p-2 rounded border cursor-pointer transition-all",
                            selectedVersion?.id === v.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30"
                          )}
                          onClick={() => setSelectedVersion(v)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">v{v.versionNummer}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPreis(v.daten.summeBrutto)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comparison View */}
                <div className="flex-1 overflow-auto">
                  {compareVersion && selectedVersion && compareVersion.id !== selectedVersion.id ? (
                    <VersionVergleich
                      altVersion={compareVersion}
                      neuVersion={selectedVersion}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Wähle zwei verschiedene Versionen zum Vergleichen</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
