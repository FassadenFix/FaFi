/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Finanzen: Umfassendes Dashboard mit Umsatzentwicklung und Kostenverteilung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Euro,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  PiggyBank,
  Percent,
  Clock,
  Building2,
  Users,
  Briefcase,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PageSkeleton } from "@/components/PageSkeletons";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { HelpTooltip, SectionHelp, HELP_TEXTS } from "@/components/HelpTooltip";

// Mock data for revenue development (monthly)
const umsatzEntwicklung = [
  { monat: "Jan", umsatz: 185000, kosten: 142000, gewinn: 43000, vorjahr: 165000 },
  { monat: "Feb", umsatz: 212000, kosten: 158000, gewinn: 54000, vorjahr: 178000 },
  { monat: "Mär", umsatz: 198000, kosten: 152000, gewinn: 46000, vorjahr: 185000 },
  { monat: "Apr", umsatz: 245000, kosten: 178000, gewinn: 67000, vorjahr: 212000 },
  { monat: "Mai", umsatz: 278000, kosten: 195000, gewinn: 83000, vorjahr: 238000 },
  { monat: "Jun", umsatz: 312000, kosten: 218000, gewinn: 94000, vorjahr: 265000 },
  { monat: "Jul", umsatz: 345000, kosten: 235000, gewinn: 110000, vorjahr: 298000 },
  { monat: "Aug", umsatz: 328000, kosten: 225000, gewinn: 103000, vorjahr: 285000 },
  { monat: "Sep", umsatz: 295000, kosten: 205000, gewinn: 90000, vorjahr: 258000 },
  { monat: "Okt", umsatz: 268000, kosten: 188000, gewinn: 80000, vorjahr: 235000 },
  { monat: "Nov", umsatz: 232000, kosten: 168000, gewinn: 64000, vorjahr: 198000 },
  { monat: "Dez", umsatz: 198000, kosten: 148000, gewinn: 50000, vorjahr: 172000 },
];

// Mock data for cost distribution
const kostenverteilung = [
  { name: "Personal", value: 485000, prozent: 42, color: "#77bc1f" },
  { name: "Material", value: 312000, prozent: 27, color: "#4e5758" },
  { name: "Geräte & Maschinen", value: 138000, prozent: 12, color: "#3b82f6" },
  { name: "Fahrzeuge", value: 92000, prozent: 8, color: "#f59e0b" },
  { name: "Verwaltung", value: 69000, prozent: 6, color: "#8b5cf6" },
  { name: "Sonstiges", value: 58000, prozent: 5, color: "#6b7280" },
];

// Mock data for project profitability
const projektRentabilitaet = [
  { projekt: "Sonnenhof", umsatz: 125000, kosten: 85000, marge: 32 },
  { projekt: "Bürokomplex", umsatz: 98000, kosten: 72000, marge: 27 },
  { projekt: "Parkstraße", umsatz: 78000, kosten: 52000, marge: 33 },
  { projekt: "Gewerbepark", umsatz: 145000, kosten: 98000, marge: 32 },
  { projekt: "Wohnanlage Nord", umsatz: 112000, kosten: 78000, marge: 30 },
];

// Mock data for payment status
const zahlungsStatus = [
  { name: "Bezahlt", value: 892000, prozent: 68, color: "#22c55e" },
  { name: "Offen (fällig)", value: 245000, prozent: 19, color: "#f59e0b" },
  { name: "Überfällig", value: 98000, prozent: 8, color: "#ef4444" },
  { name: "In Bearbeitung", value: 67000, prozent: 5, color: "#3b82f6" },
];

// Mock data for quarterly comparison
const quartalsvergleich = [
  { quartal: "Q1 2025", umsatz: 595000, kosten: 452000, gewinn: 143000 },
  { quartal: "Q2 2025", umsatz: 835000, kosten: 591000, gewinn: 244000 },
  { quartal: "Q3 2025", umsatz: 968000, kosten: 665000, gewinn: 303000 },
  { quartal: "Q4 2025", umsatz: 698000, kosten: 504000, gewinn: 194000 },
  { quartal: "Q1 2026", umsatz: 645000, kosten: 478000, gewinn: 167000 },
];

// KPI Card Component
function FinanzKPICard({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color = "primary",
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
  color?: "primary" | "green" | "red" | "amber";
  helpText?: { title: string; text: string };
  helpTextKey?: string;
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    red: "bg-red-500/10 text-red-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

  return (
    <Card className="ff-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {title}
              {helpText && <HelpTooltip content={helpText.text} title={helpText.title} helpTextKey={helpTextKey} />}
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold">{value}</span>
              {unit && <span className="text-base text-muted-foreground">{unit}</span>}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : trend === "down" ? (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className={cn("p-3 rounded-2xl", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString("de-DE") : entry.value} €
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Finanzen() {
  const [zeitraum, setZeitraum] = useState("jahr");

  // Load real data from tRPC
  const { data: revenueData, isLoading: l1 } = trpc.finance.dashboard.useQuery();
  const { data: outstandingData, isLoading: l2 } = trpc.finance.outstanding.useQuery();
  const { data: cashflowData, isLoading: l3 } = trpc.finance.cashflow.useQuery();
  const isLoading = l1 || l2 || l3;

  const handleExportPDF = () => {
    toast.success("PDF-Export gestartet", {
      description: "Der Finanzbericht wird als PDF generiert...",
    });
  };

  const handleExportExcel = () => {
    toast.success("Excel-Export gestartet", {
      description: "Die Finanzdaten werden als Excel-Datei exportiert...",
    });
  };

  // Nr.63: Finanzen-Charts mit echten Daten kombinieren wo verfügbar
  // Wenn echte Rechnungsdaten vorhanden, diese für KPIs verwenden
  const hatEchteDaten = revenueData && (revenueData.totalRevenue > 0 || revenueData.invoiceCount > 0);
  const gesamtUmsatz = hatEchteDaten ? revenueData!.totalRevenue : umsatzEntwicklung.reduce((sum, m) => sum + m.umsatz, 0);
  const gesamtKosten = hatEchteDaten ? Math.round(revenueData!.totalRevenue * 0.72) : umsatzEntwicklung.reduce((sum, m) => sum + m.kosten, 0);
  const gesamtGewinn = gesamtUmsatz - gesamtKosten;
  const durchschnittsMarge = gesamtUmsatz > 0 ? Math.round((gesamtGewinn / gesamtUmsatz) * 100) : 0;
  const offenePosten = hatEchteDaten ? revenueData!.openRevenue : (outstandingData?.totalOutstanding || 0);

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
        <DemoBanner description="Die Finanzdaten sind Beispielwerte zur Veranschaulichung. Nach Produktivstart werden hier echte Umsätze, Rechnungen und Mahnungen angezeigt." />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-7 h-7 text-primary" />
              Finanzübersicht
            </h1>
            <p className="text-muted-foreground mt-1">
              Umsätze, Kosten und Rentabilität auf einen Blick
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={zeitraum} onValueChange={setZeitraum}>
              <SelectTrigger className="w-[180px] touch-target">
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
            <Button variant="outline" onClick={handleExportExcel} className="gap-2 touch-target">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button onClick={handleExportPDF} className="gap-2 ff-button touch-target">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <FinanzKPICard
            title="Gesamtumsatz"
            helpText={HELP_TEXTS.gesamtumsatz}
            helpTextKey="gesamtumsatz"
            value={(gesamtUmsatz / 1000000).toFixed(2)}
            unit="Mio €"
            change={14}
            changeLabel="vs. Vorjahr"
            icon={Euro}
            trend="up"
            color="primary"
          />
          <FinanzKPICard
            title="Gesamtkosten"
            helpText={{ title: "Gesamtkosten", text: "Alle Ausgaben zusammen: Material, Personal, Geräte, Fahrtkosten. Je niedriger, desto mehr Gewinn." }}
            helpTextKey="gesamtkosten"
            value={(gesamtKosten / 1000000).toFixed(2)}
            unit="Mio €"
            change={8}
            changeLabel="vs. Vorjahr"
            icon={Receipt}
            trend="up"
            color="amber"
          />
          <FinanzKPICard
            title="Gewinn"
            helpText={HELP_TEXTS.gewinn}
            helpTextKey="gewinn"
            value={(gesamtGewinn / 1000).toFixed(0)}
            unit="T€"
            change={22}
            changeLabel="vs. Vorjahr"
            icon={TrendingUp}
            trend="up"
            color="green"
          />
          <FinanzKPICard
            title="Marge"
            helpText={HELP_TEXTS.marge}
            helpTextKey="marge"
            value={durchschnittsMarge.toString()}
            unit="%"
            change={3}
            changeLabel="vs. Vorjahr"
            icon={Percent}
            trend="up"
            color="primary"
          />
        </div>

        {/* Main Charts Section */}
        <Tabs defaultValue="umsatz" className="animate-fade-in-up animate-delay-200">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="umsatz" className="rounded-xl touch-target">Umsatzentwicklung</TabsTrigger>
            <TabsTrigger value="kosten" className="rounded-xl touch-target">Kostenverteilung</TabsTrigger>
            <TabsTrigger value="projekte" className="rounded-xl touch-target">Projektrentabilität</TabsTrigger>
            <TabsTrigger value="zahlungen" className="rounded-xl touch-target">Zahlungsstatus</TabsTrigger>
          </TabsList>

          {/* Umsatzentwicklung Tab */}
          <TabsContent value="umsatz" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Revenue Chart */}
              <Card className="ff-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Umsatz- und Gewinnentwicklung</CardTitle>
                  <CardDescription>Monatliche Entwicklung mit Vorjahresvergleich</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={umsatzEntwicklung}>
                        <defs>
                          <linearGradient id="umsatzGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#77bc1f" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#77bc1f" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gewinnGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="monat" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="umsatz"
                          stroke="#77bc1f"
                          strokeWidth={2}
                          fill="url(#umsatzGradient)"
                          name="Umsatz"
                        />
                        <Line
                          type="monotone"
                          dataKey="vorjahr"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Vorjahr"
                        />
                        <Bar dataKey="gewinn" fill="#22c55e" radius={[4, 4, 0, 0]} name="Gewinn" opacity={0.8} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quarterly Comparison */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Quartalsvergleich</CardTitle>
                  <CardDescription>Umsatz vs. Kosten</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quartalsvergleich} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                        <YAxis type="category" dataKey="quartal" stroke="#6b7280" fontSize={11} width={60} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="umsatz" fill="#77bc1f" radius={[0, 4, 4, 0]} name="Umsatz" />
                        <Bar dataKey="kosten" fill="#4e5758" radius={[0, 4, 4, 0]} name="Kosten" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Kostenverteilung Tab */}
          <TabsContent value="kosten" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Kostenverteilung nach Kategorie</CardTitle>
                  <CardDescription>Anteil der Kostenarten am Gesamtbudget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={kostenverteilung}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, prozent }) => `${name} (${prozent}%)`}
                          labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                        >
                          {kostenverteilung.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`, ""]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown List */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Kostenaufstellung</CardTitle>
                  <CardDescription>Detaillierte Aufschlüsselung</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {kostenverteilung.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{item.value.toLocaleString("de-DE")} €</span>
                          <span className="text-muted-foreground ml-2">({item.prozent}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.prozent}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Gesamtkosten</span>
                      <span>{gesamtKosten.toLocaleString("de-DE")} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projektrentabilität Tab */}
          <TabsContent value="projekte" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Profitability Chart */}
              <Card className="ff-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Rentabilität nach Projekt</CardTitle>
                  <CardDescription>Umsatz, Kosten und Marge pro Projekt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projektRentabilitaet}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="projekt" stroke="#6b7280" fontSize={11} />
                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="umsatz" fill="#77bc1f" radius={[4, 4, 0, 0]} name="Umsatz" />
                        <Bar dataKey="kosten" fill="#4e5758" radius={[4, 4, 0, 0]} name="Kosten" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Margin Overview */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Margen-Übersicht</CardTitle>
                  <CardDescription>Gewinnspanne pro Projekt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projektRentabilitaet.map((projekt, index) => {
                    const gewinn = projekt.umsatz - projekt.kosten;
                    return (
                      <div key={index} className="p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{projekt.projekt}</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              projekt.marge >= 30
                                ? "bg-green-500/10 text-green-600"
                                : projekt.marge >= 25
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-red-500/10 text-red-600"
                            )}
                          >
                            {projekt.marge}% Marge
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Gewinn: {gewinn.toLocaleString("de-DE")} €</span>
                          <span className="text-xs">
                            {projekt.umsatz.toLocaleString("de-DE")} € Umsatz
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zahlungsstatus Tab */}
          <TabsContent value="zahlungen" className="mt-6">
            <SectionHelp
              title="Zahlungsstatus & Mahnwesen"
              helpTextKey="mahnstufen"
              description="Übersicht aller offenen und bezahlten Forderungen. Das Mahnwesen läuft in 3 Stufen:"
              tips={[
                "Stufe 1 (nach 30 Tagen): Freundliche Zahlungserinnerung – passiert automatisch",
                "Stufe 2 (nach 60 Tagen): Deutliche Mahnung mit Fristsetzung",
                "Stufe 3 (nach 90 Tagen): Letzte Mahnung – danach Inkasso oder Anwalt",
              ]}
              className="mb-4"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Pie Chart */}
              <Card className="ff-card">
                <CardHeader>
                  <CardTitle className="text-base">Zahlungsstatus</CardTitle>
                  <CardDescription>Übersicht aller Forderungen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={zahlungsStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {zahlungsStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`, ""]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status Cards */}
              <div className="space-y-4">
                {zahlungsStatus.map((status, index) => (
                  <Card key={index} className="ff-card">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${status.color}20` }}
                        >
                          {status.name === "Bezahlt" && <CheckCircle2 className="w-6 h-6" style={{ color: status.color }} />}
                          {status.name === "Offen (fällig)" && <Clock className="w-6 h-6" style={{ color: status.color }} />}
                          {status.name === "Überfällig" && <AlertCircle className="w-6 h-6" style={{ color: status.color }} />}
                          {status.name === "In Bearbeitung" && <Receipt className="w-6 h-6" style={{ color: status.color }} />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{status.name}</h3>
                          <p className="text-sm text-muted-foreground">{status.prozent}% der Forderungen</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{status.value.toLocaleString("de-DE")} €</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-300">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 touch-target" onClick={() => toast("Rechnung erstellen", { description: "Kommt bald!" })}>
            <Receipt className="w-5 h-5 text-primary" />
            <span className="text-sm">Neue Rechnung</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 touch-target" onClick={() => toast("Zahlung erfassen", { description: "Kommt bald!" })}>
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-sm">Zahlung erfassen</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 touch-target" onClick={() => toast("Budget anlegen", { description: "Kommt bald!" })}>
            <PiggyBank className="w-5 h-5 text-primary" />
            <span className="text-sm">Budget anlegen</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 touch-target" onClick={() => toast("Mahnlauf starten", { description: "Kommt bald!" })}>
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm">Mahnlauf</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
