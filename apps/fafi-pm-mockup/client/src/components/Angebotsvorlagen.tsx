/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Angebotsvorlagen - Textbausteine für verschiedene Angebotstypen
 * Basierend auf FassadenFix_Textbausteine_HubSpot.xlsx
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Paintbrush,
  Building2,
  Wrench,
  CheckCircle2,
  Copy,
  Edit,
  Plus,
  Save,
  Trash2,
  Tag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface Textbaustein {
  id: string;
  name: string;
  kategorie: "angebot" | "graffiti" | "grossprojekt" | "sanierung" | "hinweis" | "abschluss";
  tag: string;
  text: string;
  beschreibung?: string;
  isCustom?: boolean;
}

interface AngebotsvorlagenProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (vorlage: Textbaustein) => void;
  currentTextTyp?: string;
}

// ============================================
// TEXTBAUSTEINE (aus HubSpot-Datenbank)
// ============================================

const TEXTBAUSTEINE: Textbaustein[] = [
  // Angebot Standard
  {
    id: "tb-001",
    name: "Standard-Angebot",
    kategorie: "angebot",
    tag: "#angebot",
    beschreibung: "Standardtext für Fassadenreinigung",
    text: `Sehr geehrte Damen und Herren,

vielen Dank für Ihr Interesse an unseren Dienstleistungen. Gerne unterbreiten wir Ihnen folgendes Angebot für die professionelle Fassadenreinigung Ihrer Immobilie.

Unsere Fassadenreinigung im Systemverfahren entfernt zuverlässig Algen, Pilze, Flechten und andere biologische Verschmutzungen. Das Ergebnis ist eine saubere, gepflegte Fassade – ganz ohne Neuanstrich.

**Unsere Leistungen umfassen:**
• Professionelle Fassadenreinigung im Systemverfahren
• Einsatz umweltverträglicher Reinigungsmittel
• Schonende Behandlung aller Fassadentypen
• Dokumentation vor und nach der Reinigung`,
  },
  // Graffiti
  {
    id: "tb-002",
    name: "Graffiti-Entfernung",
    kategorie: "graffiti",
    tag: "#graffiti",
    beschreibung: "Spezialtext für Graffiti-Entfernung",
    text: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage zur Graffiti-Entfernung. Gerne unterbreiten wir Ihnen folgendes Angebot für die fachgerechte Beseitigung der Schmierereien an Ihrer Fassade.

Unsere Spezialisten entfernen Graffiti schonend und rückstandsfrei – angepasst an den jeweiligen Untergrund.

**Unsere Leistungen umfassen:**
• Fachgerechte Graffiti-Entfernung
• Untergrundspezifische Reinigungsmethoden
• Optional: Graffiti-Schutz-Beschichtung
• Dokumentation der Maßnahme`,
  },
  // Großprojekt
  {
    id: "tb-003",
    name: "Großprojekt",
    kategorie: "grossprojekt",
    tag: "#grossprojekt",
    beschreibung: "Text für umfangreiche Projekte mit mehreren Objekten",
    text: `Sehr geehrte Damen und Herren,

vielen Dank für Ihr Vertrauen und die Möglichkeit, Ihnen ein Angebot für dieses umfangreiche Projekt zu unterbreiten.

Als erfahrener Partner für Großprojekte in der Fassadenreinigung bieten wir Ihnen eine professionelle Abwicklung mit optimierter Logistik und termingerechter Ausführung.

**Unsere Leistungen umfassen:**
• Professionelle Fassadenreinigung im Systemverfahren
• Koordinierte Abwicklung aller Teilobjekte
• Dediziertes Projektmanagement
• Regelmäßige Statusberichte
• Flexible Terminplanung`,
  },
  // Sanierung
  {
    id: "tb-004",
    name: "Sanierung",
    kategorie: "sanierung",
    tag: "#sanierung",
    beschreibung: "Text für Sanierungsprojekte mit Zusatzleistungen",
    text: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage zur Fassadensanierung. Gerne unterbreiten wir Ihnen folgendes Angebot für die umfassende Aufarbeitung Ihrer Fassade.

Unsere Sanierungsleistungen gehen über die reine Reinigung hinaus und umfassen bei Bedarf auch Ausbesserungsarbeiten und Schutzbehandlungen.

**Unsere Leistungen umfassen:**
• Professionelle Fassadenreinigung
• Ausbesserung kleinerer Schäden
• Algenschutz-Imprägnierung
• Langfristiger Fassadenschutz`,
  },
  // Hinweise
  {
    id: "tb-005",
    name: "Wetter-Hinweis",
    kategorie: "hinweis",
    tag: "#wetter",
    beschreibung: "Hinweis zu Wetterbedingungen",
    text: `**Hinweis zu Wetterbedingungen:**
Die Arbeiten können nur bei geeigneten Wetterbedingungen durchgeführt werden. Bei Regen, Frost oder extremer Hitze kann es zu Verschiebungen kommen. Wir informieren Sie rechtzeitig über eventuelle Terminänderungen.`,
  },
  {
    id: "tb-006",
    name: "Gerüst-Hinweis",
    kategorie: "hinweis",
    tag: "#geruest",
    beschreibung: "Hinweis zu Gerüstarbeiten",
    text: `**Hinweis zu Gerüstarbeiten:**
Für die Durchführung der Arbeiten setzen wir eine Hubarbeitsbühne ein. Bitte stellen Sie sicher, dass die Zufahrt und der Aufstellbereich frei zugänglich sind. Eine Straßensperrung ist ggf. erforderlich und wird von uns beantragt.`,
  },
  {
    id: "tb-007",
    name: "Denkmalschutz-Hinweis",
    kategorie: "hinweis",
    tag: "#denkmal",
    beschreibung: "Hinweis für denkmalgeschützte Gebäude",
    text: `**Hinweis zum Denkmalschutz:**
Bei denkmalgeschützten Gebäuden stimmen wir die Reinigungsmethode vorab mit der zuständigen Denkmalschutzbehörde ab. Alle eingesetzten Verfahren sind schonend und reversibel.`,
  },
  // Abschluss
  {
    id: "tb-008",
    name: "Standard-Abschluss",
    kategorie: "abschluss",
    tag: "#abschluss",
    beschreibung: "Standardmäßiger Abschlusstext",
    text: `Wir freuen uns auf Ihre Rückmeldung und stehen Ihnen für Rückfragen jederzeit zur Verfügung.

Mit freundlichen Grüßen`,
  },
  {
    id: "tb-009",
    name: "Terminvorschlag",
    kategorie: "abschluss",
    tag: "#terminvorschlag",
    beschreibung: "Abschluss mit Terminvorschlag",
    text: `Gerne würden wir die Arbeiten im [ZEITRAUM] durchführen. Bitte teilen Sie uns mit, ob dieser Zeitraum für Sie passend ist.

Wir freuen uns auf Ihre Rückmeldung und stehen Ihnen für Rückfragen jederzeit zur Verfügung.

Mit freundlichen Grüßen`,
  },
  {
    id: "tb-010",
    name: "Zahlungsbedingungen Standard",
    kategorie: "hinweis",
    tag: "#zahlung",
    beschreibung: "Standard-Zahlungsbedingungen",
    text: `**Zahlungsbedingungen:**
Die Rechnung ist zahlbar innerhalb von 30 Tagen nach Rechnungsstellung ohne Abzug. Bei Zahlung innerhalb von 14 Tagen gewähren wir 2% Skonto.`,
  },
  {
    id: "tb-011",
    name: "Zahlungsbedingungen Großprojekt",
    kategorie: "hinweis",
    tag: "#zahlunggross",
    beschreibung: "Zahlungsbedingungen für Großprojekte",
    text: `**Zahlungsbedingungen:**
Bei Großprojekten bieten wir Ihnen folgende Zahlungsmodalitäten an:
• 30% Anzahlung bei Auftragserteilung
• 40% nach Fertigstellung der ersten Hälfte
• 30% nach Abnahme aller Arbeiten
Die Rechnungen sind jeweils innerhalb von 14 Tagen zahlbar.`,
  },
  {
    id: "tb-012",
    name: "AGB-Verweis",
    kategorie: "hinweis",
    tag: "#agb",
    beschreibung: "Verweis auf Allgemeine Geschäftsbedingungen",
    text: `Es gelten unsere Allgemeinen Geschäftsbedingungen, die diesem Angebot beiliegen bzw. unter www.fassadenfix.de/agb abrufbar sind.`,
  },
];

// ============================================
// KATEGORIE CONFIG
// ============================================

const KATEGORIE_CONFIG = {
  angebot: { label: "Angebot", icon: FileText, color: "bg-blue-100 text-blue-700" },
  graffiti: { label: "Graffiti", icon: Paintbrush, color: "bg-purple-100 text-purple-700" },
  grossprojekt: { label: "Großprojekt", icon: Building2, color: "bg-amber-100 text-amber-700" },
  sanierung: { label: "Sanierung", icon: Wrench, color: "bg-green-100 text-green-700" },
  hinweis: { label: "Hinweis", icon: Tag, color: "bg-gray-100 text-gray-700" },
  abschluss: { label: "Abschluss", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
};

// ============================================
// TEXTBAUSTEIN CARD
// ============================================

function TextbausteinCard({
  baustein,
  onSelect,
  onCopy,
  isSelected,
}: {
  baustein: Textbaustein;
  onSelect: () => void;
  onCopy: () => void;
  isSelected?: boolean;
}) {
  const config = KATEGORIE_CONFIG[baustein.kategorie];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded", config.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{baustein.name}</CardTitle>
              <CardDescription className="text-xs">{baustein.beschreibung}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs font-mono">
              {baustein.tag}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">
          {baustein.text.substring(0, 200)}...
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Angebotsvorlagen({
  isOpen,
  onClose,
  onSelect,
  currentTextTyp,
}: AngebotsvorlagenProps) {
  const [selectedBaustein, setSelectedBaustein] = useState<Textbaustein | null>(null);
  const [activeTab, setActiveTab] = useState("alle");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const handleCopy = (baustein: Textbaustein) => {
    navigator.clipboard.writeText(baustein.text);
    toast.success("Kopiert", {
      description: `"${baustein.name}" wurde in die Zwischenablage kopiert.`,
    });
  };

  const handleSelect = (baustein: Textbaustein) => {
    setSelectedBaustein(baustein);
    setEditedText(baustein.text);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (selectedBaustein) {
      const finalBaustein = isEditing
        ? { ...selectedBaustein, text: editedText }
        : selectedBaustein;
      onSelect(finalBaustein);
      toast.success("Vorlage übernommen", {
        description: `"${selectedBaustein.name}" wurde als Angebotstext ausgewählt.`,
      });
      onClose();
    }
  };

  const filteredBausteine = activeTab === "alle"
    ? TEXTBAUSTEINE
    : TEXTBAUSTEINE.filter(b => b.kategorie === activeTab);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Angebotsvorlagen & Textbausteine
          </DialogTitle>
          <DialogDescription>
            Wähle eine Vorlage aus oder passe sie individuell an
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Vorlagen-Liste */}
          <div className="w-1/2 border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4 grid grid-cols-4">
                <TabsTrigger value="alle" className="text-xs">Alle</TabsTrigger>
                <TabsTrigger value="angebot" className="text-xs">Angebot</TabsTrigger>
                <TabsTrigger value="hinweis" className="text-xs">Hinweise</TabsTrigger>
                <TabsTrigger value="abschluss" className="text-xs">Abschluss</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {filteredBausteine.map((baustein) => (
                    <TextbausteinCard
                      key={baustein.id}
                      baustein={baustein}
                      onSelect={() => handleSelect(baustein)}
                      onCopy={() => handleCopy(baustein)}
                      isSelected={selectedBaustein?.id === baustein.id}
                    />
                  ))}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right: Vorschau & Bearbeitung */}
          <div className="w-1/2 flex flex-col">
            {selectedBaustein ? (
              <>
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedBaustein.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedBaustein.beschreibung}</p>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? "Bearbeiten" : "Anpassen"}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {isEditing ? (
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-sm" dangerouslySetInnerHTML={{
                        __html: selectedBaustein.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/•/g, '&bull;')
                      }} />
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Wähle eine Vorlage aus</p>
                  <p className="text-sm">um die Vorschau zu sehen</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-card flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredBausteine.length} Vorlagen verfügbar
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedBaustein}
              className="gap-2 ff-button"
            >
              <CheckCircle2 className="w-4 h-4" />
              Vorlage übernehmen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export types
export type { Textbaustein };
