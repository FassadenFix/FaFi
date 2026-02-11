/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Vorlagen-Seite für Templates und Textbausteine
 * - Angebotsvorlagen
 * - Textbausteine für Angebote (mit tRPC-Integration)
 * - E-Mail-Vorlagen
 * - Dokumentvorlagen
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileStack,
  FileText,
  Mail,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  BookTemplate,
  MessageSquare,
  FileCheck,
  Sparkles,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Kategorien für Textbausteine (muss mit DB-Enum übereinstimmen)
const TEXTBAUSTEIN_KATEGORIEN = [
  { value: "einleitung", label: "Einleitung" },
  { value: "abschluss", label: "Abschluss" },
  { value: "rabatt", label: "Rabatt" },
  { value: "konditionen", label: "Konditionen" },
  { value: "versprechen", label: "Versprechen" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

type TextBlockCategory = typeof TEXTBAUSTEIN_KATEGORIEN[number]["value"];

// Mock-Daten für Angebotsvorlagen (später auch tRPC)
const ANGEBOTSVORLAGEN = [
  {
    id: "AV-001",
    name: "Standard Fassadenreinigung",
    beschreibung: "Standardvorlage für Fassadenreinigung mit WDVS",
    kategorie: "Fassadenreinigung",
    verwendungen: 45,
    aktualisiert: "2026-01-15",
  },
  {
    id: "AV-002",
    name: "Großprojekt Wohnanlage",
    beschreibung: "Vorlage für Wohnanlagen ab 5.000 m²",
    kategorie: "Großprojekt",
    verwendungen: 12,
    aktualisiert: "2026-01-20",
  },
  {
    id: "AV-003",
    name: "Gewerbeimmobilie",
    beschreibung: "Vorlage für Gewerbe- und Industriegebäude",
    kategorie: "Gewerbe",
    verwendungen: 8,
    aktualisiert: "2026-02-01",
  },
];

const EMAIL_VORLAGEN = [
  {
    id: "EV-001",
    name: "Angebotsversand",
    betreff: "Ihr Angebot für Fassadenreinigung - [PROJEKT]",
    kategorie: "Angebot",
    verwendungen: 56,
  },
  {
    id: "EV-002",
    name: "Nachfassen",
    betreff: "Rückfrage zu unserem Angebot - [PROJEKT]",
    kategorie: "Nachfassen",
    verwendungen: 23,
  },
  {
    id: "EV-003",
    name: "Auftragsbestätigung",
    betreff: "Auftragsbestätigung - [PROJEKT]",
    kategorie: "Auftrag",
    verwendungen: 34,
  },
];

export default function Vorlagen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("angebotsvorlagen");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBaustein, setEditingBaustein] = useState<{
    id?: number;
    name: string;
    category: TextBlockCategory;
    content: string;
    placeholders: string;
  } | null>(null);

  // tRPC queries and mutations for Textbausteine
  const { data: textbausteine = [], isLoading, refetch } = trpc.textBlock.list.useQuery();
  
  const createTextBlock = trpc.textBlock.create.useMutation({
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setEditingBaustein(null);
      toast.success("Textbaustein erstellt", {
        description: "Der Textbaustein wurde erfolgreich gespeichert.",
      });
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const updateTextBlock = trpc.textBlock.update.useMutation({
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setEditingBaustein(null);
      toast.success("Textbaustein aktualisiert", {
        description: "Die Änderungen wurden gespeichert.",
      });
    },
    onError: (error) => {
      toast.error("Fehler", { description: error.message });
    },
  });

  const deleteTextBlock = trpc.textBlock.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Textbaustein gelöscht");
    },
  });

  const handleCreate = () => {
    if (activeTab === "textbausteine") {
      setEditingBaustein({
        name: "",
        category: "einleitung",
        content: "",
        placeholders: "",
      });
      setDialogOpen(true);
    } else {
      toast.info("Neue Vorlage erstellen", {
        description: "Diese Funktion wird bald verfügbar sein.",
      });
    }
  };

  const handleEdit = (baustein: typeof textbausteine[0]) => {
    setEditingBaustein({
      id: baustein.id,
      name: baustein.name,
      category: baustein.category as TextBlockCategory,
      content: baustein.content,
      placeholders: Array.isArray(baustein.placeholders) ? baustein.placeholders.join(", ") : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingBaustein) return;

    // Convert comma-separated placeholders string to array
    const placeholdersArray = editingBaustein.placeholders
      ? editingBaustein.placeholders.split(",").map(p => p.trim()).filter(Boolean)
      : undefined;

    if (editingBaustein.id) {
      updateTextBlock.mutate({
        id: editingBaustein.id,
        name: editingBaustein.name,
        category: editingBaustein.category,
        content: editingBaustein.content,
        placeholders: placeholdersArray,
      });
    } else {
      createTextBlock.mutate({
        name: editingBaustein.name,
        category: editingBaustein.category,
        content: editingBaustein.content,
        placeholders: placeholdersArray,
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      deleteTextBlock.mutate({ id });
    }
  };

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert", {
      description: `${name} wurde in die Zwischenablage kopiert.`,
    });
  };

  const handleEditVorlage = (name: string) => {
    toast.info("Vorlage bearbeiten", {
      description: `${name} wird zur Bearbeitung geöffnet...`,
    });
  };

  // Filter Textbausteine
  const filteredTextbausteine = textbausteine.filter(tb =>
    tb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tb.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileStack className="w-7 h-7 text-primary" />
              Vorlagen & Textbausteine
            </h1>
            <p className="text-muted-foreground mt-1">
              Templates und Textbausteine für Angebote und Kommunikation
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            {activeTab === "textbausteine" ? "Neuer Textbaustein" : "Neue Vorlage"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="angebotsvorlagen" className="gap-2">
              <BookTemplate className="w-4 h-4" />
              Angebotsvorlagen
            </TabsTrigger>
            <TabsTrigger value="textbausteine" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Textbausteine
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              E-Mail-Vorlagen
            </TabsTrigger>
          </TabsList>

          {/* Angebotsvorlagen */}
          <TabsContent value="angebotsvorlagen" className="mt-6">
            <div className="grid gap-4">
              {ANGEBOTSVORLAGEN.map((vorlage) => (
                <Card key={vorlage.id} className="ff-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <BookTemplate className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{vorlage.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vorlage.beschreibung}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline">{vorlage.kategorie}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {vorlage.verwendungen}× verwendet
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Aktualisiert: {new Date(vorlage.aktualisiert).toLocaleDateString("de-DE")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVorlage(vorlage.name)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(vorlage.beschreibung, vorlage.name)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Textbausteine */}
          <TabsContent value="textbausteine" className="mt-6">
            <div className="space-y-4">
              {/* Suche */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Textbaustein suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Textbausteine Liste */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTextbausteine.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Textbausteine gefunden</p>
                  <p className="text-sm mt-1">Erstellen Sie Ihren ersten Textbaustein</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredTextbausteine.map((baustein) => (
                    <Card key={baustein.id} className="ff-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{baustein.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {baustein.category}
                              </Badge>
                              {baustein.isActive && (
                                <Badge variant="default" className="text-xs bg-primary">
                                  Aktiv
                                </Badge>
                              )}
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                              {baustein.content}
                            </div>
                            {baustein.placeholders && Array.isArray(baustein.placeholders) && baustein.placeholders.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Platzhalter: {baustein.placeholders.join(", ")}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {baustein.usageCount || 0}× verwendet
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(baustein.content, baustein.name)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Kopieren
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(baustein)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Bearbeiten
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(baustein.id, baustein.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Löschen
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* E-Mail-Vorlagen */}
          <TabsContent value="email" className="mt-6">
            <div className="grid gap-4">
              {EMAIL_VORLAGEN.map((vorlage) => (
                <Card key={vorlage.id} className="ff-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10">
                          <Mail className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{vorlage.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Betreff: {vorlage.betreff}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline">{vorlage.kategorie}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {vorlage.verwendungen}× verwendet
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVorlage(vorlage.name)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog für Textbaustein erstellen/bearbeiten */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {editingBaustein?.id ? "Textbaustein bearbeiten" : "Neuer Textbaustein"}
              </DialogTitle>
              <DialogDescription>
                Erstellen Sie wiederverwendbare Textbausteine für Ihre Angebote
              </DialogDescription>
            </DialogHeader>

            {editingBaustein && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingBaustein.name}
                    onChange={(e) => setEditingBaustein({ ...editingBaustein, name: e.target.value })}
                    placeholder="z.B. FassadenFix Versprechen"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select
                    value={editingBaustein.category}
                    onValueChange={(value) => setEditingBaustein({ ...editingBaustein, category: value as TextBlockCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXTBAUSTEIN_KATEGORIEN.map((kat) => (
                        <SelectItem key={kat.value} value={kat.value}>{kat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Inhalt</Label>
                  <Textarea
                    id="content"
                    value={editingBaustein.content}
                    onChange={(e) => setEditingBaustein({ ...editingBaustein, content: e.target.value })}
                    placeholder="Der Text des Bausteins..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Verwenden Sie [PLATZHALTER] für dynamische Werte
                  </p>
                </div>

                <div>
                  <Label htmlFor="placeholders">Platzhalter (optional)</Label>
                  <Input
                    id="placeholders"
                    value={editingBaustein.placeholders}
                    onChange={(e) => setEditingBaustein({ ...editingBaustein, placeholders: e.target.value })}
                    placeholder="z.B. [DATUM], [PROZENT], [PROJEKT]"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSave}
                disabled={!editingBaustein?.name || !editingBaustein?.content || createTextBlock.isPending || updateTextBlock.isPending}
                className="gap-2"
              >
                {(createTextBlock.isPending || updateTextBlock.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Speichern
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
