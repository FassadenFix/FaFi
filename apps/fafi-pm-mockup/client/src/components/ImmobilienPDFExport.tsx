/*
 * ImmobilienPDFExport Component
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Generiert PDF-Bericht für Immobilien mit:
 * - Alle erfassten Daten
 * - Fotos nach Seiten gruppiert
 * - Zuordnungsinformationen
 * - FassadenFix Corporate Design
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Printer,
  Building2,
  MapPin,
  Ruler,
  Camera,
  User,
  Calendar,
  HardHat,
  FolderKanban,
  Users,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// FassadenFix CI Colors
const FF_COLORS = {
  primary: "#77bc1f",
  secondary: "#4e5758",
  lightGreen: "#e8f5d9",
  darkGray: "#333333",
  lightGray: "#f5f5f5",
  border: "#e0e0e0",
};

// Official FassadenFix Logo URL
const FF_LOGO_URL = "https://manus-storage-test.oss-cn-beijing.aliyuncs.com/fassadenfix/logo-dokumente.png";

// Immobilie data type
interface ImmobilieData {
  id: string;
  adresse: string;
  plz: string;
  ort: string;
  gesamtFlaeche: number;
  reinigungsfaehigeFlaeche: number;
  seitenErfasst: number;
  fotos: number;
  tour360?: string;
  status: string;
  baustelle?: { id: string; name: string } | null;
  projekt: { id: string; name: string };
  unternehmen: { id: string; name: string };
  kontakt: { name: string; rolle: string };
  mitarbeiter?: { name: string; rolle: string } | null;
  erfasstAm: string;
  erfasstVon: string;
}

// Foto data type
interface FotoData {
  id: string;
  url: string;
  titel: string;
  beschreibung?: string;
  seite: string;
  aufgenommenAm: string;
  aufgenommenVon: string;
}

// Mock fotos for demo
const MOCK_FOTOS: FotoData[] = [
  {
    id: "foto-001",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    titel: "Frontseite Übersicht",
    beschreibung: "Gesamtansicht der Frontfassade",
    seite: "Frontseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
  },
  {
    id: "foto-002",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    titel: "Frontseite Detail",
    beschreibung: "Detailaufnahme Algenbefall",
    seite: "Frontseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
  },
  {
    id: "foto-003",
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400",
    titel: "Rückseite Übersicht",
    beschreibung: "Rückfassade mit Balkonen",
    seite: "Rückseite",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Anna Schmidt",
  },
  {
    id: "foto-004",
    url: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=400",
    titel: "Linker Giebel",
    beschreibung: "Giebelseite links",
    seite: "Linker Giebel",
    aufgenommenAm: "2026-01-28",
    aufgenommenVon: "Thomas Braun",
  },
];

interface ImmobilienPDFExportProps {
  immobilie: ImmobilieData;
  fotos?: FotoData[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ImmobilienPDFExport({
  immobilie,
  fotos = MOCK_FOTOS,
  isOpen,
  onClose,
}: ImmobilienPDFExportProps) {
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeZuordnungen, setIncludeZuordnungen] = useState(true);
  const [includeTour360, setIncludeTour360] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Group fotos by seite
  const fotosBySeite = fotos.reduce((acc, foto) => {
    if (!acc[foto.seite]) {
      acc[foto.seite] = [];
    }
    acc[foto.seite].push(foto);
    return acc;
  }, {} as Record<string, FotoData[]>);

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
      toast.success("PDF erstellt", {
        description: "Der Immobilien-Bericht wurde erfolgreich generiert.",
      });
    }, 1500);
  };

  const handleDownload = () => {
    toast.success("Download gestartet", {
      description: `Immobilien-Bericht_${immobilie.id}.pdf wird heruntergeladen.`,
    });
  };

  const handlePrint = () => {
    window.print();
    toast.info("Druckvorschau", {
      description: "Die Druckvorschau wurde geöffnet.",
    });
  };

  // PDF Preview Component
  const PDFPreview = () => (
    <div 
      className="bg-white text-black rounded-lg shadow-lg overflow-hidden"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header with Logo */}
      <div className="p-8 border-b-4" style={{ borderColor: FF_COLORS.primary }}>
        <div className="flex items-center justify-between">
          <img 
            src={FF_LOGO_URL} 
            alt="FassadenFix" 
            className="h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 50'%3E%3Ctext x='10' y='35' font-family='Arial' font-size='24' font-weight='bold' fill='%2377bc1f'%3EFASSADENFIX%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="text-right text-sm" style={{ color: FF_COLORS.secondary }}>
            <p>Immobilien-Bericht</p>
            <p className="font-bold">{immobilie.id}</p>
            <p>{new Date().toLocaleDateString("de-DE")}</p>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: FF_COLORS.darkGray }}>
          Objektdokumentation
        </h1>
        <div className="flex items-center gap-2 text-lg" style={{ color: FF_COLORS.secondary }}>
          <MapPin className="w-5 h-5" style={{ color: FF_COLORS.primary }} />
          <span className="font-medium">{immobilie.adresse}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: FF_COLORS.secondary }}>
          {immobilie.plz} {immobilie.ort}
        </p>
      </div>

      {/* Key Data Section */}
      <div className="px-8 py-4">
        <div 
          className="grid grid-cols-2 gap-4 p-4 rounded-lg"
          style={{ backgroundColor: FF_COLORS.lightGray }}
        >
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: FF_COLORS.secondary }}>
              Gesamtfläche
            </p>
            <p className="text-xl font-bold" style={{ color: FF_COLORS.darkGray }}>
              {immobilie.gesamtFlaeche.toLocaleString()} m²
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: FF_COLORS.secondary }}>
              Reinigungsfähig
            </p>
            <p className="text-xl font-bold" style={{ color: FF_COLORS.primary }}>
              {immobilie.reinigungsfaehigeFlaeche.toLocaleString()} m²
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: FF_COLORS.secondary }}>
              Erfasste Seiten
            </p>
            <p className="text-xl font-bold" style={{ color: FF_COLORS.darkGray }}>
              {immobilie.seitenErfasst}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: FF_COLORS.secondary }}>
              Dokumentierte Fotos
            </p>
            <p className="text-xl font-bold" style={{ color: FF_COLORS.darkGray }}>
              {fotos.length}
            </p>
          </div>
        </div>
      </div>

      {/* Zuordnungen Section */}
      {includeZuordnungen && (
        <div className="px-8 py-4">
          <h2 
            className="text-lg font-bold mb-3 pb-2 border-b-2"
            style={{ color: FF_COLORS.darkGray, borderColor: FF_COLORS.primary }}
          >
            Zuordnungen
          </h2>
          <div className="space-y-2">
            {immobilie.baustelle && (
              <div className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: FF_COLORS.lightGray }}>
                <HardHat className="w-4 h-4" style={{ color: FF_COLORS.primary }} />
                <div>
                  <p className="text-xs" style={{ color: FF_COLORS.secondary }}>Baustelle</p>
                  <p className="font-medium text-sm">{immobilie.baustelle.name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: FF_COLORS.lightGray }}>
              <FolderKanban className="w-4 h-4" style={{ color: FF_COLORS.primary }} />
              <div>
                <p className="text-xs" style={{ color: FF_COLORS.secondary }}>Projekt</p>
                <p className="font-medium text-sm">{immobilie.projekt.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: FF_COLORS.lightGray }}>
              <Users className="w-4 h-4" style={{ color: FF_COLORS.primary }} />
              <div>
                <p className="text-xs" style={{ color: FF_COLORS.secondary }}>Unternehmen</p>
                <p className="font-medium text-sm">{immobilie.unternehmen.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kontakt Section */}
      <div className="px-8 py-4">
        <h2 
          className="text-lg font-bold mb-3 pb-2 border-b-2"
          style={{ color: FF_COLORS.darkGray, borderColor: FF_COLORS.primary }}
        >
          Ansprechpartner
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded" style={{ backgroundColor: FF_COLORS.lightGray }}>
            <p className="text-xs mb-1" style={{ color: FF_COLORS.secondary }}>Kunde</p>
            <p className="font-medium">{immobilie.kontakt.name}</p>
            <p className="text-sm" style={{ color: FF_COLORS.secondary }}>{immobilie.kontakt.rolle}</p>
          </div>
          {immobilie.mitarbeiter && (
            <div className="p-3 rounded" style={{ backgroundColor: FF_COLORS.lightGray }}>
              <p className="text-xs mb-1" style={{ color: FF_COLORS.secondary }}>FassadenFix</p>
              <p className="font-medium">{immobilie.mitarbeiter.name}</p>
              <p className="text-sm" style={{ color: FF_COLORS.secondary }}>{immobilie.mitarbeiter.rolle}</p>
            </div>
          )}
        </div>
      </div>

      {/* 360° Tour Link */}
      {includeTour360 && immobilie.tour360 && (
        <div className="px-8 py-4">
          <div 
            className="p-4 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: FF_COLORS.lightGreen, border: `1px solid ${FF_COLORS.primary}` }}
          >
            <Globe className="w-6 h-6" style={{ color: FF_COLORS.primary }} />
            <div>
              <p className="font-medium" style={{ color: FF_COLORS.darkGray }}>360° Rundgang verfügbar</p>
              <p className="text-sm" style={{ color: FF_COLORS.secondary }}>{immobilie.tour360}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photos Section */}
      {includePhotos && fotos.length > 0 && (
        <div className="px-8 py-4">
          <h2 
            className="text-lg font-bold mb-3 pb-2 border-b-2"
            style={{ color: FF_COLORS.darkGray, borderColor: FF_COLORS.primary }}
          >
            Fotodokumentation
          </h2>
          {Object.entries(fotosBySeite).map(([seite, seiteFotos]) => (
            <div key={seite} className="mb-6">
              <h3 
                className="text-sm font-bold mb-2 flex items-center gap-2"
                style={{ color: FF_COLORS.secondary }}
              >
                <MapPin className="w-4 h-4" style={{ color: FF_COLORS.primary }} />
                {seite} ({seiteFotos.length} Fotos)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {seiteFotos.map((foto) => (
                  <div 
                    key={foto.id} 
                    className="rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${FF_COLORS.border}` }}
                  >
                    <img 
                      src={foto.url} 
                      alt={foto.titel}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="font-medium text-sm">{foto.titel}</p>
                      {foto.beschreibung && (
                        <p className="text-xs mt-1" style={{ color: FF_COLORS.secondary }}>
                          {foto.beschreibung}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: FF_COLORS.secondary }}>
                        {new Date(foto.aufgenommenAm).toLocaleDateString("de-DE")} • {foto.aufgenommenVon}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div 
        className="px-8 py-4 mt-4"
        style={{ backgroundColor: FF_COLORS.lightGray, borderTop: `2px solid ${FF_COLORS.primary}` }}
      >
        <div className="flex items-center justify-between text-xs" style={{ color: FF_COLORS.secondary }}>
          <div>
            <p className="font-bold" style={{ color: FF_COLORS.darkGray }}>FASSADENFIX</p>
            <p>Immobiliengruppe Retzlaff oHG</p>
            <p>An der Saalebahn 8a • 06118 Halle (Saale)</p>
          </div>
          <div className="text-right">
            <p>Tel: 0345 218392 35</p>
            <p>info@fassadenfix.de</p>
            <p>www.fassadenfix.de</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-center text-xs" style={{ borderColor: FF_COLORS.border, color: FF_COLORS.secondary }}>
          <p>Erstellt am {new Date().toLocaleDateString("de-DE")} um {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</p>
          <p>Erfasst von {immobilie.erfasstVon} am {new Date(immobilie.erfasstAm).toLocaleDateString("de-DE")}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={showPreview ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
        {!showPreview ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                PDF-Bericht exportieren
              </DialogTitle>
              <DialogDescription>
                Wählen Sie die Inhalte für den Immobilien-Bericht
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Immobilie Info */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{immobilie.adresse}</p>
                    <p className="text-sm text-muted-foreground">{immobilie.plz} {immobilie.ort}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="photos" 
                    checked={includePhotos}
                    onCheckedChange={(checked) => setIncludePhotos(checked as boolean)}
                  />
                  <Label htmlFor="photos" className="flex items-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    Fotos einschließen ({fotos.length} Fotos)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="zuordnungen" 
                    checked={includeZuordnungen}
                    onCheckedChange={(checked) => setIncludeZuordnungen(checked as boolean)}
                  />
                  <Label htmlFor="zuordnungen" className="flex items-center gap-2 cursor-pointer">
                    <FolderKanban className="w-4 h-4 text-muted-foreground" />
                    Zuordnungen einschließen
                  </Label>
                </div>
                {immobilie.tour360 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tour360" 
                      checked={includeTour360}
                      onCheckedChange={(checked) => setIncludeTour360(checked as boolean)}
                    />
                    <Label htmlFor="tour360" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      360° Tour-Link einschließen
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleGeneratePDF} 
                className="gap-2 ff-button"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    PDF erstellen
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                PDF-Vorschau
              </DialogTitle>
              <DialogDescription>
                Immobilien-Bericht für {immobilie.adresse}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <PDFPreview />
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Zurück
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Drucken
              </Button>
              <Button onClick={handleDownload} className="gap-2 ff-button">
                <Download className="w-4 h-4" />
                PDF herunterladen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
