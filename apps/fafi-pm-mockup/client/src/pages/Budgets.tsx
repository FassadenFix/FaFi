/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Budgets-Seite mit echter Datenbank-Anbindung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PiggyBank,
  Plus,
  Search,
  Edit,
  Euro,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Calendar,
  Target,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700", icon: Calendar },
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  ueberschritten: { label: "Überschritten", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
};

// Budget type configuration
const budgetTypeConfig: Record<string, { label: string; color: string }> = {
  projekt: { label: "Projektbudget", color: "bg-blue-100 text-blue-700" },
  abteilung: { label: "Abteilungsbudget", color: "bg-purple-100 text-purple-700" },
  marketing: { label: "Marketing", color: "bg-amber-100 text-amber-700" },
  personal: { label: "Personal", color: "bg-green-100 text-green-700" },
  material: { label: "Material", color: "bg-slate-100 text-slate-700" },
};

export default function Budgets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch budgets from database
  const { data: budgets, isLoading, refetch } = trpc.budget.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();

  // Filter budgets
  const filteredBudgets = budgets?.filter((budget) => {
    const matchesSearch = 
      budget.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "alle" || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const totalBudgets = budgets?.length || 0;
  const activeBudgets = budgets?.filter(b => b.status === "aktiv").length || 0;
  const exceededBudgets = budgets?.filter(b => b.status === "ueberschritten").length || 0;
  
  const totalPlanned = budgets?.reduce((sum, b) => sum + parseFloat(b.plannedAmount || "0"), 0) || 0;
  const totalActual = budgets?.reduce((sum, b) => sum + parseFloat(b.actualAmount || "0"), 0) || 0;
  const totalRemaining = totalPlanned - totalActual;

  // Get project name by ID
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return "—";
    const project = projects?.find(p => p.id === projectId);
    return project?.name || "—";
  };

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  // Calculate usage percentage
  const getUsagePercentage = (planned: string | null, actual: string | null) => {
    if (!planned || !actual) return 0;
    const plannedNum = parseFloat(planned);
    const actualNum = parseFloat(actual);
    if (plannedNum === 0) return 0;
    return Math.round((actualNum / plannedNum) * 100);
  };

  // Get usage color
  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-primary";
  };

  const handleViewDetails = (budget: any) => {
    setSelectedBudget(budget);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PiggyBank className="w-7 h-7 text-primary" />
              Budgets
            </h1>
            <p className="text-muted-foreground mt-1">
              Projektbudgets planen und überwachen
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Budget erstellen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Neues Budget
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setStatusFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalBudgets}</p>}
                  <p className="text-xs text-muted-foreground">Budgets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-lg font-bold">{formatCurrency(totalPlanned.toString())}</p>}
                  <p className="text-xs text-muted-foreground">Geplant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-lg font-bold">{formatCurrency(totalActual.toString())}</p>}
                  <p className="text-xs text-muted-foreground">Ausgegeben</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  totalRemaining >= 0 ? "bg-green-100" : "bg-red-100"
                )}>
                  <Euro className={cn(
                    "w-5 h-5",
                    totalRemaining >= 0 ? "text-green-600" : "text-red-600"
                  )} />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : (
                    <p className={cn(
                      "text-lg font-bold",
                      totalRemaining >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(totalRemaining.toString())}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Verfügbar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning for exceeded budgets */}
        {exceededBudgets > 0 && (
          <Card className="ff-card bg-red-50 border-red-200 animate-fade-in-up animate-delay-150">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">{exceededBudgets} Budget(s) überschritten</p>
                  <p className="text-sm text-red-700">Bitte prüfe die betroffenen Budgets und ergreife Maßnahmen.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Budgets durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  <SelectItem value="geplant">Geplant</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="ueberschritten">Überschritten</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budgets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up animate-delay-300">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="ff-card">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-2 w-full mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : filteredBudgets.length === 0 ? (
            <Card className="ff-card md:col-span-2 lg:col-span-3">
              <CardContent className="p-12 text-center">
                <PiggyBank className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Budgets gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Erstelle dein erstes Budget."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBudgets.map((budget) => {
              const status = statusConfig[budget.status || "geplant"];
              const StatusIcon = status?.icon || CheckCircle2;
              const budgetType = budgetTypeConfig[budget.budgetType || "projekt"];
              const usagePercentage = getUsagePercentage(budget.plannedAmount, budget.actualAmount);
              const usageColor = getUsageColor(usagePercentage);
              
              return (
                <Card
                  key={budget.id}
                  className={cn(
                    "ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
                    budget.status === "ueberschritten" && "border-red-300"
                  )}
                  onClick={() => handleViewDetails(budget)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{budget.name}</h3>
                        {budget.projectId && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <FolderKanban className="w-3 h-3" />
                            {getProjectName(budget.projectId)}
                          </p>
                        )}
                      </div>
                      <Badge className={cn("gap-1", status?.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Verbraucht</span>
                        <span className="font-medium">{usagePercentage}%</span>
                      </div>
                      <Progress value={Math.min(usagePercentage, 100)} className={cn("h-2", usageColor)} />
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Ausgegeben</p>
                          <p className="font-semibold">{formatCurrency(budget.actualAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">von</p>
                          <p className="font-semibold">{formatCurrency(budget.plannedAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                {selectedBudget?.name}
              </DialogTitle>
              <DialogDescription>
                Budgetdetails und Übersicht
              </DialogDescription>
            </DialogHeader>
            {selectedBudget && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Budgettyp</p>
                    <Badge className={budgetTypeConfig[selectedBudget.budgetType]?.color}>
                      {budgetTypeConfig[selectedBudget.budgetType]?.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusConfig[selectedBudget.status]?.color}>
                      {statusConfig[selectedBudget.status]?.label}
                    </Badge>
                  </div>
                  {selectedBudget.projectId && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <FolderKanban className="w-4 h-4" /> Projekt
                      </p>
                      <p className="font-medium">{getProjectName(selectedBudget.projectId)}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4" /> Budgetübersicht
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verbrauch</span>
                      <span className="font-medium">
                        {getUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(getUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount), 100)} 
                      className={cn("h-3", getUsageColor(getUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount)))} 
                    />
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Geplant</p>
                        <p className="text-lg font-semibold text-blue-800">{formatCurrency(selectedBudget.plannedAmount)}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-700">Ausgegeben</p>
                        <p className="text-lg font-semibold text-amber-800">{formatCurrency(selectedBudget.actualAmount)}</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg",
                        parseFloat(selectedBudget.plannedAmount || "0") - parseFloat(selectedBudget.actualAmount || "0") >= 0
                          ? "bg-green-50"
                          : "bg-red-50"
                      )}>
                        <p className={cn(
                          "text-sm",
                          parseFloat(selectedBudget.plannedAmount || "0") - parseFloat(selectedBudget.actualAmount || "0") >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        )}>Verfügbar</p>
                        <p className={cn(
                          "text-lg font-semibold",
                          parseFloat(selectedBudget.plannedAmount || "0") - parseFloat(selectedBudget.actualAmount || "0") >= 0
                            ? "text-green-800"
                            : "text-red-800"
                        )}>
                          {formatCurrency((parseFloat(selectedBudget.plannedAmount || "0") - parseFloat(selectedBudget.actualAmount || "0")).toString())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedBudget.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Notizen</h4>
                    <p className="text-sm text-muted-foreground">{selectedBudget.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Schließen
              </Button>
              <Button onClick={() => toast.info("Bearbeiten - Funktion in Entwicklung")}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
