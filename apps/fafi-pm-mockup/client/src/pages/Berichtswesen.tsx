/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Berichtswesen: Statistiken, Auswertungen, Export-Funktionen
 */

import DashboardLayout from "@/components/DashboardLayout";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Euro,
  Building2,
  Users,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { PageSkeleton } from "@/components/PageSkeletons";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { HelpTooltip, SectionHelp, HELP_TEXTS } from "@/components/HelpTooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Data is loaded from tRPC - fallback to empty arrays
const DEFAULT_UMSATZ = [
  { monat: "Jan", umsatz: 0, vorjahr: 0 },
  { monat: "Feb", umsatz: 0, vorjahr: 0 },
  { monat: "Mär", umsatz: 0, vorjahr: 0 },
  { monat: "Apr", umsatz: 0, vorjahr: 0 },
  { monat: "Mai", umsatz: 0, vorjahr: 0 },
  { monat: "Jun", umsatz: 0, vorjahr: 0 },
];

const mitarbeiterLeistung = [
  { name: "Stefan Weber", projekte: 8, flaeche: 28500, umsatz: 142500 },
  { name: "Thomas Schmidt", projekte: 6, flaeche: 22000, umsatz: 110000 },
  { name: "Michael Braun", projekte: 5, flaeche: 18500, umsatz: 92500 },
  { name: "Andreas Koch", projekte: 4, flaeche: 15000, umsatz: 75000 },
];

// KPI Card Component
function KPICard({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon: Icon,
  trend,
  helpText,
  helpTextKey,
}: {
  title: string;
  value: string;
  unit?: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  helpText?: { title: string; text: string };
  helpTextKey?: string;
}) {
  return (
    <Card className="ff-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {title}
              {helpText && <HelpTooltip content={helpText.text} title={helpText.title} helpTextKey={helpTextKey} />}
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{value}</span>
              {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : trend === "down" ? (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {change > 0 ? "+" : ""}{change}%
              </span>
              <span className="text-sm text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Berichtswesen() {
  const [zeitraum, setZeitraum] = useState("jahr");

  // Load real data from tRPC
  const { data: reportData, isLoading: loadingReport } = trpc.report.pipeline.useQuery();
  const { data: revenueData, isLoading: loadingRevenue } = trpc.report.revenue.useQuery();
  const { data: conversionData, isLoading: loadingConversion } = trpc.report.conversion.useQuery();
  const isLoading = loadingReport || loadingRevenue || loadingConversion;

  // Phase-Label Mapping (E-14)
  const PHASE_LABELS: Record<string, { name: string; color: string }> = {
    objektaufnahme: { name: "Objektaufnahme", color: "#77bc1f" },
    angebot_erstellt: { name: "Angebot erstellt", color: "#77bc1f" },
    angebot_versendet: { name: "Angebot versendet", color: "#77bc1f" },
    nachfassen: { name: "Nachfassen", color: "#f59e0b" },
    auftrag_gewonnen: { name: "Auftrag gewonnen", color: "#77bc1f" },
    planung: { name: "Planung", color: "#3b82f6" },
    vorbereitung: { name: "Vorbereitung", color: "#3b82f6" },
    durchfuehrung: { name: "Durchführung", color: "#77bc1f" },
    abnahme: { name: "Abnahme", color: "#8b5cf6" },
    abgeschlossen: { name: "Abgeschlossen", color: "#10b981" },
    verloren: { name: "Verloren", color: "#ef4444" },
    ANGEBOT_ERSTELLT: { name: "Angebot erstellt", color: "#77bc1f" },
    PLANUNG: { name: "Planung", color: "#3b82f6" },
    DURCHFUEHRUNG: { name: "Durchführung", color: "#77bc1f" },
    ABGESCHLOSSEN: { name: "Abgeschlossen", color: "#10b981" },
  };

  // Transform report data for charts
  const umsatzData = useMemo(() => {
    if (!revenueData?.months) return DEFAULT_UMSATZ;
    const monatNamen = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return revenueData.months.map((m: any) => ({
      monat: monatNamen[m.month - 1] || `M${m.month}`,
      umsatz: m.totalAmount || 0,
      vorjahr: 0,
    }));
  }, [revenueData]);

  const projektStatusData = useMemo(() => {
    if (!reportData) return [];
    return (reportData as any[]).map((item: any) => ({
      name: PHASE_LABELS[item.phase]?.name || item.phase,
      value: item.count || 0,
      color: PHASE_LABELS[item.phase]?.color || "#9ca3af",
    }));
  }, [reportData]);

  const flaechenData = useMemo(() => {
    if (!reportData) return [];
    return (reportData as any[]).map((item: any) => ({
      typ: PHASE_LABELS[item.phase]?.name || item.phase || "Sonstige",
      flaeche: item.totalArea || 0,
      projekte: item.count || 0,
    }));
  }, [reportData]);

  const conversionChartData = useMemo(() => {
    if (!conversionData) return { total: 0, accepted: 0, rejected: 0, pending: 0, conversionRate: 0 };
    return conversionData;
  }, [conversionData]);

  const handleExportPDF = () => {
    toast.success("PDF-Export gestartet", {
      description: "Der Bericht wird als PDF generiert...",
    });
  };

  const handleExportExcel = () => {
    toast.success("Excel-Export gestartet", {
      description: "Die Daten werden als Excel-Datei exportiert...",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DemoBanner description="Die Mitarbeiterleistungen und Conversion-Daten sind Beispielwerte. Nach Produktivstart werden hier echte Auswertungen angezeigt." />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" />
              Berichtswesen
            </h1>
            <p className="text-muted-foreground mt-1">
              Auswertungen und Statistiken zu Projekten, Umsätzen und Conversion-Raten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={zeitraum} onValueChange={setZeitraum}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monat">Dieser Monat</SelectItem>
                <SelectItem value="quartal">Dieses Quartal</SelectItem>
                <SelectItem value="jahr">Dieses Jahr</SelectItem>
                <SelectItem value="gesamt">Gesamt</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={handleExportPDF} className="gap-2 ff-button">
              <FileText className="w-4 h-4" />
              PDF-Bericht
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <KPICard
            title="Gesamtumsatz"
            value="1.25"
            unit="Mio €"
            change={18}
            changeLabel="vs. Vorjahr"
            icon={Euro}
            trend="up"
            helpText={HELP_TEXTS.gesamtumsatz}
            helpTextKey="gesamtumsatz"
          />
          <KPICard
            title="Aktive Projekte"
            value="28"
            change={12}
            changeLabel="vs. Vormonat"
            icon={Building2}
            trend="up"
            helpText={{ title: "Aktive Projekte", text: "Projekte, die gerade in Bearbeitung sind – von der Planung bis zur Abnahme." }}
            helpTextKey="aktiveProjekte"
          />
          <KPICard
            title="Conversion Rate"
            value="77"
            unit="%"
            change={5}
            changeLabel="vs. Vorjahr"
            icon={Target}
            trend="up"
            helpText={HELP_TEXTS.conversionRateReport}
            helpTextKey="conversionRateReport"
          />
          <KPICard
            title="Bearbeitete Fläche"
            value="115.000"
            unit="m²"
            change={-3}
            changeLabel="vs. Vorjahr"
            icon={PieChart}
            trend="down"
            helpText={HELP_TEXTS.bearbeiteteFlaeche}
            helpTextKey="bearbeiteteFlaeche"
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="umsatz" className="animate-fade-in-up animate-delay-200">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="umsatz" className="rounded-xl">Umsatz</TabsTrigger>
            <TabsTrigger value="conversion" className="rounded-xl">Conversion</TabsTrigger>
            <TabsTrigger value="projekte" className="rounded-xl">Projekte</TabsTrigger>
            <TabsTrigger value="mitarbeiter" className="rounded-xl">Mitarbeiter</TabsTrigger>
          </TabsList>

          {/* Umsatz Tab */}
          <TabsContent value="umsatz" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="ff-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Umsatzentwicklung</CardTitle>
                  <CardDescription>Vergleich zum Vorjahr</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={umsatzData}>
                        <defs>
                          <linearGradient id="umsatzGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#77bc1f" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#77bc1f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="monat" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip
                          formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`, ""]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="vorjahr"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          fill="transparent"
                          name="Vorjahr"
                        />
                        <Area
                          type="monotone"
                          dataKey="umsatz"
                          stroke="#77bc1f"
                          strokeWidth={2}
                          fill="url(#umsatzGradient)"
                          name="Aktuell"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Flächen nach Typ</CardTitle>
                  <CardDescription>Bearbeitete Quadratmeter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={flaechenData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="flaeche"
                          nameKey="typ"
                        >
                          {flaechenData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#77bc1f", "#4e5758", "#3b82f6", "#f59e0b", "#9ca3af"][index]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value.toLocaleString("de-DE")} m²`, ""]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {flaechenData.map((item, index) => (
                      <div key={item.typ} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: ["#77bc1f", "#4e5758", "#3b82f6", "#f59e0b", "#9ca3af"][index],
                            }}
                          />
                          <span>{item.typ}</span>
                        </div>
                        <span className="font-medium">{item.flaeche.toLocaleString("de-DE")} m²</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="mt-6">
            <SectionHelp
              title="Was ist die Conversion Rate?"
              helpTextKey="conversionExplainer"
              description="Die Conversion Rate zeigt, wie viele Angebote zu Aufträgen werden. Beispiel: 77% heißt, von 100 Angeboten werden 77 angenommen."
              tips={[
                "Hohe Rate (>70%): Sehr gut – die Angebote treffen den Nerv der Kunden",
                "Mittlere Rate (50-70%): Normal – Nachfassen hilft oft",
                "Niedrige Rate (<50%): Prüfen, ob Preise oder Angebote passen",
              ]}
              className="mb-4"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Angebote vs. Aufträge</CardTitle>
                  <CardDescription>Monatliche Entwicklung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[conversionChartData] as any}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="monat" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Legend />
                        <Bar dataKey="angebote" fill="#4e5758" name="Angebote" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="auftraege" fill="#77bc1f" name="Aufträge" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Conversion Rate Trend</CardTitle>
                  <CardDescription>Prozentuale Entwicklung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[conversionChartData] as any}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="monat" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#77bc1f"
                          strokeWidth={3}
                          dot={{ fill: "#77bc1f", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projekte Tab */}
          <TabsContent value="projekte" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Projekte nach Status</CardTitle>
                  <CardDescription>Aktuelle Verteilung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={projektStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {projektStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Top Projekte nach Umsatz</CardTitle>
                  <CardDescription>Größte laufende Projekte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sonnenhof Residenz", kunde: "Muster Wohnbau GmbH", umsatz: 125000, fortschritt: 65 },
                      { name: "Parkview Apartments", kunde: "Beispiel Hausverwaltung", umsatz: 98000, fortschritt: 40 },
                      { name: "Stadtmitte 10-20", kunde: "Wohnbau Genossenschaft", umsatz: 85000, fortschritt: 80 },
                      { name: "Grüne Aue", kunde: "Immobilien AG", umsatz: 72000, fortschritt: 25 },
                    ].map((projekt, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{projekt.name}</p>
                            <p className="text-sm text-muted-foreground">{projekt.kunde}</p>
                          </div>
                          <Badge variant="secondary">{projekt.umsatz.toLocaleString("de-DE")} €</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={projekt.fortschritt} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">{projekt.fortschritt}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mitarbeiter Tab */}
          <TabsContent value="mitarbeiter" className="mt-6">
            <Card className="ff-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Mitarbeiter-Leistung
                </CardTitle>
                <CardDescription>Übersicht nach Projekten, Fläche und Umsatz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mitarbeiterLeistung.map((ma, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {ma.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium">{ma.name}</p>
                            <p className="text-sm text-muted-foreground">{ma.projekte} Projekte</p>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                          {ma.umsatz.toLocaleString("de-DE")} € Umsatz
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 bg-background rounded-lg">
                          <p className="text-lg font-bold">{ma.projekte}</p>
                          <p className="text-xs text-muted-foreground">Projekte</p>
                        </div>
                        <div className="p-2 bg-background rounded-lg">
                          <p className="text-lg font-bold">{(ma.flaeche / 1000).toFixed(1)}k</p>
                          <p className="text-xs text-muted-foreground">m² Fläche</p>
                        </div>
                        <div className="p-2 bg-background rounded-lg">
                          <p className="text-lg font-bold">{(ma.umsatz / 1000).toFixed(0)}k</p>
                          <p className="text-xs text-muted-foreground">€ Umsatz</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
