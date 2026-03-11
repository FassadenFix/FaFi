/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Kundenportal - Öffentliche Ansicht für Kunden
 * Zeigt Projektstatus, Dokumente und Fortschritt
 */

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  HardHat,
  Cloud,
  Sun,
  CloudRain,
  AlertTriangle,
  Image as ImageIcon,
  ChevronRight,
  Shield,
  Star,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// ============================================
// TYPES
// ============================================

interface ProjectPhase {
  id: number;
  name: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  url?: string;
}

interface Photo {
  id: number;
  url: string;
  caption: string;
  date: string;
  type: "vorher" | "nachher" | "fortschritt";
}

// ============================================
// CUSTOMER PORTAL COMPONENT
// ============================================

export default function CustomerPortal() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  // In real app, validate token via tRPC
  // const { data: portalData, isLoading } = trpc.customerPortal.validate.useQuery({ token: params.token });
  
  // Mock data for demonstration
  const mockProject = {
    id: 1,
    name: "Wohnanlage Sonnenhof",
    kunde: "WG Sonnenhof eG",
    adresse: "Sonnenhofweg 1-12, 12345 Musterstadt",
    phase: 8,
    phaseName: "Durchführung",
    fortschritt: 65,
    startDatum: "2026-01-15",
    endDatum: "2026-03-20",
    flaeche: 8500,
    immobilien: 12,
    projektleiter: {
      name: "Anna Schmidt",
      telefon: "+49 123 456789",
      email: "a.schmidt@fassadenfix.de",
    },
    kundenberater: {
      name: "Max Mustermann",
      telefon: "+49 123 456780",
      email: "m.mustermann@fassadenfix.de",
    },
  };

  const phases: ProjectPhase[] = [
    { id: 1, name: "objektaufnahme", label: "Objektaufnahme", completed: true, current: false },
    { id: 2, name: "angebot", label: "Angebot", completed: true, current: false },
    { id: 3, name: "auftrag", label: "Auftrag", completed: true, current: false },
    { id: 4, name: "planung", label: "Planung", completed: true, current: false },
    { id: 5, name: "vorbereitung", label: "Vorbereitung", completed: true, current: false },
    { id: 6, name: "durchfuehrung", label: "Durchführung", completed: false, current: true },
    { id: 7, name: "abnahme", label: "Abnahme", completed: false, current: false },
    { id: 8, name: "abgeschlossen", label: "Fertig", completed: false, current: false },
  ];

  const documents: Document[] = [
    { id: 1, name: "Angebot FF-2026-0042", type: "angebot", date: "2025-12-15" },
    { id: 2, name: "Auftragsbestätigung", type: "auftrag", date: "2026-01-05" },
    { id: 3, name: "Bewohnerinformation", type: "info", date: "2026-01-10" },
    { id: 4, name: "Zwischenbericht KW 5", type: "bericht", date: "2026-02-01" },
  ];

  const photos: Photo[] = [
    { id: 1, url: "/placeholder-before.jpg", caption: "Gebäude 1 - Nordseite vor Reinigung", date: "2026-01-15", type: "vorher" },
    { id: 2, url: "/placeholder-after.jpg", caption: "Gebäude 1 - Nordseite nach Reinigung", date: "2026-02-01", type: "nachher" },
    { id: 3, url: "/placeholder-progress.jpg", caption: "Arbeiten an Gebäude 3", date: "2026-02-03", type: "fortschritt" },
  ];

  const weather = {
    temp: 8,
    condition: "wolkig",
    suitable: true,
    nextWorkDay: "Morgen, 05.02.2026",
  };

  // Simulate token validation
  useEffect(() => {
    // In real app, this would be handled by tRPC query
    setTimeout(() => {
      setIsValidToken(params.token?.length > 5);
    }, 500);
  }, [params.token]);

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf5] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#77bc1f] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Portal wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf5] to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle>Ungültiger Zugangslink</CardTitle>
            <CardDescription>
              Der verwendete Link ist ungültig oder abgelaufen. Bitte kontaktieren Sie Ihren Ansprechpartner bei FassadenFix.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => setLocation("/")}>
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf5] to-white">
      {/* Demo Banner */}
      <div className="container pt-4">
        <DemoBanner description="Das Kundenportal zeigt Beispieldaten. Nach Produktivstart sehen Ihre Kunden hier echte Projektfortschritte und Dokumente." />
      </div>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#77bc1f] rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#4e5758]">FassadenFix</h1>
                <p className="text-xs text-muted-foreground">Kundenportal</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">
              <Shield className="w-3 h-3 mr-1" />
              Sicherer Zugang
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#4e5758]">{mockProject.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {mockProject.adresse}
              </p>
            </div>
            <Badge className="bg-[#77bc1f] text-white text-sm px-3 py-1">
              {mockProject.phaseName}
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardHat className="w-5 h-5 text-[#77bc1f]" />
              Projektfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesamtfortschritt</span>
                <span className="text-2xl font-bold text-[#77bc1f]">{mockProject.fortschritt}%</span>
              </div>
              <Progress value={mockProject.fortschritt} className="h-3" />
            </div>

            {/* Phase Timeline */}
            <div className="relative">
              <div className="flex justify-between">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex flex-col items-center relative z-10">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                        phase.completed
                          ? "bg-[#77bc1f] border-[#77bc1f] text-white"
                          : phase.current
                          ? "bg-white border-[#77bc1f] text-[#77bc1f]"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      )}
                    >
                      {phase.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 text-center max-w-[60px]",
                        phase.current ? "font-medium text-[#77bc1f]" : "text-muted-foreground"
                      )}
                    >
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connecting Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-[#77bc1f] transition-all"
                  style={{ width: `${(phases.filter(p => p.completed).length / (phases.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Key Dates */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projektstart</p>
                  <p className="font-medium">{new Date(mockProject.startDatum).toLocaleDateString("de-DE")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Geplante Fertigstellung</p>
                  <p className="font-medium">{new Date(mockProject.endDatum).toLocaleDateString("de-DE")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Documents, Photos, Contact */}
        <Tabs defaultValue="aktuell" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="aktuell">Aktuell</TabsTrigger>
            <TabsTrigger value="dokumente">Dokumente</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
            <TabsTrigger value="kontakt">Kontakt</TabsTrigger>
          </TabsList>

          {/* Current Status Tab */}
          <TabsContent value="aktuell" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weather Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    Wetter am Standort
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {weather.condition === "sonnig" ? (
                        <Sun className="w-12 h-12 text-yellow-500" />
                      ) : weather.condition === "regnerisch" ? (
                        <CloudRain className="w-12 h-12 text-blue-500" />
                      ) : (
                        <Cloud className="w-12 h-12 text-gray-400" />
                      )}
                      <div>
                        <p className="text-3xl font-bold">{weather.temp}°C</p>
                        <p className="text-muted-foreground capitalize">{weather.condition}</p>
                      </div>
                    </div>
                    <Badge variant={weather.suitable ? "default" : "destructive"} className={weather.suitable ? "bg-[#77bc1f]" : ""}>
                      {weather.suitable ? "Arbeiten möglich" : "Arbeiten pausiert"}
                    </Badge>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Nächster Arbeitstag: <span className="font-medium text-foreground">{weather.nextWorkDay}</span>
                  </p>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#77bc1f]" />
                    Projektdaten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Fläche gesamt</p>
                      <p className="text-xl font-bold">{mockProject.flaeche.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Immobilien</p>
                      <p className="text-xl font-bold">{mockProject.immobilien}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gereinigt</p>
                      <p className="text-xl font-bold text-[#77bc1f]">
                        {Math.round(mockProject.flaeche * mockProject.fortschritt / 100).toLocaleString()} m²
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verbleibend</p>
                      <p className="text-xl font-bold">
                        {Math.round(mockProject.flaeche * (100 - mockProject.fortschritt) / 100).toLocaleString()} m²
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest Update */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Letzte Aktualisierung</CardTitle>
                <CardDescription>03. Februar 2026, 17:00 Uhr</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Die Arbeiten an Gebäude 1-3 wurden erfolgreich abgeschlossen. Der Algenbefall wurde vollständig entfernt 
                  und die Imprägnierung aufgetragen. Morgen beginnen die Arbeiten an Gebäude 4-6. 
                  Ein Hubsteiger-Ausfall wurde behoben, das Ersatzgerät ist eingetroffen.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="dokumente">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#77bc1f]" />
                  Projektdokumente
                </CardTitle>
                <CardDescription>
                  Alle relevanten Dokumente zu Ihrem Projekt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <FileText className="w-5 h-5 text-[#77bc1f]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="fotos">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#77bc1f]" />
                  Projektfotos
                </CardTitle>
                <CardDescription>
                  Vorher-Nachher-Vergleiche und Fortschrittsbilder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "absolute top-2 left-2",
                          photo.type === "vorher" && "bg-orange-500",
                          photo.type === "nachher" && "bg-[#77bc1f]",
                          photo.type === "fortschritt" && "bg-blue-500"
                        )}
                      >
                        {photo.type === "vorher" ? "Vorher" : photo.type === "nachher" ? "Nachher" : "Fortschritt"}
                      </Badge>
                      <p className="text-sm mt-2 font-medium">{photo.caption}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(photo.date).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="kontakt">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Manager */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Projektleitung</CardTitle>
                  <CardDescription>Ihr Ansprechpartner vor Ort</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#77bc1f] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {mockProject.projektleiter.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{mockProject.projektleiter.name}</p>
                      <p className="text-sm text-muted-foreground">Projektleiterin</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={`tel:${mockProject.projektleiter.telefon}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-[#77bc1f]" />
                      <span>{mockProject.projektleiter.telefon}</span>
                    </a>
                    <a
                      href={`mailto:${mockProject.projektleiter.email}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Mail className="w-5 h-5 text-[#77bc1f]" />
                      <span>{mockProject.projektleiter.email}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Advisor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kundenberatung</CardTitle>
                  <CardDescription>Für Fragen zu Angebot & Vertrag</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#4e5758] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {mockProject.kundenberater.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{mockProject.kundenberater.name}</p>
                      <p className="text-sm text-muted-foreground">Kundenberater</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={`tel:${mockProject.kundenberater.telefon}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-[#77bc1f]" />
                      <span>{mockProject.kundenberater.telefon}</span>
                    </a>
                    <a
                      href={`mailto:${mockProject.kundenberater.email}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Mail className="w-5 h-5 text-[#77bc1f]" />
                      <span>{mockProject.kundenberater.email}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company Info */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#77bc1f] rounded-lg flex items-center justify-center">
                      <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">FassadenFix GmbH</p>
                      <p className="text-sm text-muted-foreground">Professionelle Fassadenreinigung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-sm text-muted-foreground ml-2">4.9/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-[#4e5758] text-white py-8 mt-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#77bc1f] rounded flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">FassadenFix GmbH</span>
            </div>
            <p className="text-sm text-white/70">
              © 2026 FassadenFix. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
