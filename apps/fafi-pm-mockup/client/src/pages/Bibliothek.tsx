/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Bibliothek – Zentrale Stammdaten-Plattform
 * 4 Kategorien: Lager & Fuhrpark | Marketing & Vertrieb | Leistungen & Technik | HR & Personal
 * Verweis-Prinzip: Alle Dropdowns im System laden aus der Bibliothek, nie hardcoded
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Warehouse,
  Megaphone,
  Wrench,
  Users,
  Truck,
  Construction,
  Droplets,
  Percent,
  Shield,
  HardHat,
  Laptop,
  Plus,
  Search,
  Edit,
  Power,
  PowerOff,
  History,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { HelpTooltip } from "@/components/HelpTooltip";


// ─── Types ───────────────────────────────────────────────────────────────────
type CategoryId = "lager" | "marketing" | "leistungen" | "hr";
type SubTabId = string;

interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  description: string;
  subTabs: { id: SubTabId; label: string; icon: React.ReactNode }[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "lager",
    label: "Lager & Fuhrpark",
    icon: <Warehouse className="w-4 h-4" />,
    description: "Fahrzeuge, Bühnentechnik, Reinigungsmittel – alles was auf die Baustelle muss",
    subTabs: [
      { id: "vehicles", label: "Fahrzeuge", icon: <Truck className="w-4 h-4" /> },
      { id: "equipment", label: "Bühnentechnik", icon: <Construction className="w-4 h-4" /> },
      { id: "cleaningAgents", label: "Reinigungsmittel", icon: <Droplets className="w-4 h-4" /> },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Vertrieb",
    icon: <Megaphone className="w-4 h-4" />,
    description: "Rabatte, Preisstaffeln, Aktionen – die Basis für jede Angebotskalkulation",
    subTabs: [
      { id: "discounts", label: "Rabatte & Aktionen", icon: <Percent className="w-4 h-4" /> },
    ],
  },
  {
    id: "leistungen",
    label: "Leistungen & Technik",
    icon: <Wrench className="w-4 h-4" />,
    description: "Leistungskatalog, Garantien, Zusatzleistungen – was wir anbieten",
    subTabs: [
      { id: "services", label: "Leistungskatalog", icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    id: "hr",
    label: "HR & Personal",
    icon: <Users className="w-4 h-4" />,
    description: "Arbeitskleidung, Arbeitsmittel – Stammdaten für Mitarbeiterausstattung",
    subTabs: [
      { id: "workClothing", label: "Arbeitskleidung & PSA", icon: <HardHat className="w-4 h-4" /> },
      { id: "assets", label: "Arbeitsmittel", icon: <Laptop className="w-4 h-4" /> },
    ],
  },
];

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    aktiv: { variant: "default", label: "Aktiv" },
    inaktiv: { variant: "secondary", label: "Inaktiv" },
    werkstatt: { variant: "outline", label: "Werkstatt" },
    verkauft: { variant: "destructive", label: "Verkauft" },
    abgelaufen: { variant: "destructive", label: "Abgelaufen" },
    bestellt: { variant: "outline", label: "Bestellt" },
    verloren: { variant: "destructive", label: "Verloren" },
    defekt: { variant: "destructive", label: "Defekt" },
    zurueckgegeben: { variant: "secondary", label: "Zurückgegeben" },
  };
  const c = config[status] || { variant: "outline" as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// ─── Vehicles Table ──────────────────────────────────────────────────────────
function VehiclesTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.vehicles.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.vehicles.deactivate.useMutation({
    onSuccess: () => { utils.library.vehicles.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((v: any) =>
      [v.name, v.licensePlate, v.manufacturer, v.model, v.vehicleType]
        .filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Fahrzeuge" />;

  const vehicleTypeLabels: Record<string, string> = {
    waschbus: "Waschbus", dienstwagen: "Dienstwagen", poolfahrzeug: "Poolfahrzeug",
    anhaenger: "Anhänger", transporter: "Transporter",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bezeichnung</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Kennzeichen</TableHead>
          <TableHead>Baujahr</TableHead>
          <TableHead>TÜV</TableHead>
          <TableHead>Tageskosten</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((v: any) => (
          <TableRow key={v.id}>
            <TableCell className="font-medium">{v.name}</TableCell>
            <TableCell><Badge variant="outline">{vehicleTypeLabels[v.vehicleType] || v.vehicleType}</Badge></TableCell>
            <TableCell className="font-mono">{v.licensePlate || "–"}</TableCell>
            <TableCell>{v.year || "–"}</TableCell>
            <TableCell>
              {v.tuevDate ? (
                <Badge variant={new Date(v.tuevDate) > new Date() ? "default" : "destructive"}>
                  {new Date(v.tuevDate).toLocaleDateString("de-DE", { month: "2-digit", year: "numeric" })}
                </Badge>
              ) : "–"}
            </TableCell>
            <TableCell>{v.dailyCost ? `${Number(v.dailyCost).toFixed(2)} €` : "–"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={v.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: v.id });
                    toast.success(v.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{v.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(v)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Equipment Table ─────────────────────────────────────────────────────────
function EquipmentTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.equipment.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.equipment.deactivate.useMutation({
    onSuccess: () => { utils.library.equipment.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((e: any) =>
      [e.name, e.manufacturer, e.equipmentType].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Bühnentechnik" />;

  const eqTypeLabels: Record<string, string> = {
    gelenkteleskop: "Gelenkteleskop", teleskop: "Teleskop", scherenlift: "Scherenlift",
    anhaengerlift: "Anhängerlift", hochdruckreiniger: "Hochdruckreiniger",
    sprühgeraet: "Sprühgerät", sonstiges: "Sonstiges",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bezeichnung</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Hersteller</TableHead>
          <TableHead>Max. Höhe</TableHead>
          <TableHead>Eigentum</TableHead>
          <TableHead>Tagespreis</TableHead>
          <TableHead>Prüfdatum</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((e: any) => (
          <TableRow key={e.id}>
            <TableCell className="font-medium">{e.name}</TableCell>
            <TableCell><Badge variant="outline">{eqTypeLabels[e.equipmentType] || e.equipmentType}</Badge></TableCell>
            <TableCell>{e.manufacturer || "–"}</TableCell>
            <TableCell>{e.maxHeight ? `${e.maxHeight}m` : "–"}</TableCell>
            <TableCell><Badge variant={e.ownership === "eigen" ? "default" : "secondary"}>{e.ownership === "eigen" ? "Eigen" : e.ownership === "dauermiete" ? "Dauermiete" : "Tagesmiete"}</Badge></TableCell>
            <TableCell>{e.dailyRate ? `${Number(e.dailyRate).toFixed(2)} €` : "–"}</TableCell>
            <TableCell>
              {e.lastInspection ? (
                <Badge variant={new Date(e.lastInspection) > new Date(Date.now() - 365*24*60*60*1000) ? "default" : "destructive"}>
                  {new Date(e.lastInspection).toLocaleDateString("de-DE")}
                </Badge>
              ) : "–"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={e.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: e.id });
                    toast.success(e.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{e.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(e)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Cleaning Agents Table ───────────────────────────────────────────────────
function CleaningAgentsTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.cleaningAgents.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.cleaningAgents.deactivate.useMutation({
    onSuccess: () => { utils.library.cleaningAgents.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a: any) =>
      [a.name, a.articleNumber, a.applicationArea].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Reinigungsmittel" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produkt</TableHead>
          <TableHead>Artikelnr.</TableHead>
          <TableHead>Anwendung</TableHead>
          <TableHead>Gebinde</TableHead>
          <TableHead>EK-Preis</TableHead>
          <TableHead>Bestand</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((a: any) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.name}</TableCell>
            <TableCell className="font-mono text-muted-foreground">{a.articleNumber || "–"}</TableCell>
            <TableCell>{a.applicationArea || "–"}</TableCell>
            <TableCell>{a.containerSize || "–"}</TableCell>
            <TableCell className="font-medium">{a.purchasePrice ? `${Number(a.purchasePrice).toFixed(2)} €` : "–"}</TableCell>
            <TableCell>
              {a.currentStock !== null && a.currentStock !== undefined ? (
                <Badge variant={a.minStock && a.currentStock <= a.minStock ? "destructive" : "default"}>
                  {a.currentStock} {a.containerSize ? "Stk." : ""}
                </Badge>
              ) : "–"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={a.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: a.id });
                    toast.success(a.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{a.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(a)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Discounts Table ─────────────────────────────────────────────────────────
function DiscountsTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.discounts.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.discounts.deactivate.useMutation({
    onSuccess: () => { utils.library.discounts.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((d: any) =>
      [d.name, d.discountType, d.code].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Rabatte & Aktionen" />;

  const typeLabels: Record<string, string> = {
    fruehbucher: "Frühbucher", mengenrabatt: "Mengenrabatt", einkaufsgemeinschaft: "Einkaufsgemeinschaft",
    sonderaktion: "Sonderaktion", preisstaffel: "Preisstaffel", treuebonus: "Treuebonus",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aktion</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Rabatt</TableHead>
          <TableHead>Gültig</TableHead>
          <TableHead>Bedingung</TableHead>
          <TableHead>Kombinierbar</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((d: any) => (
          <TableRow key={d.id}>
            <TableCell className="font-medium">{d.name}</TableCell>
            <TableCell><Badge variant="outline">{typeLabels[d.discountType] || d.discountType}</Badge></TableCell>
            <TableCell className="font-medium text-primary">
              {d.percentage ? `${Number(d.percentage)}%` : d.fixedAmount ? `${Number(d.fixedAmount)} €` : d.pricePerSqm ? `${Number(d.pricePerSqm)} €/m²` : "–"}
            </TableCell>
            <TableCell className="text-sm">
              {d.validFrom || d.validUntil ? (
                <span>
                  {d.validFrom ? new Date(d.validFrom).toLocaleDateString("de-DE") : "–"}
                  {" → "}
                  {d.validUntil ? new Date(d.validUntil).toLocaleDateString("de-DE") : "offen"}
                </span>
              ) : "unbegrenzt"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{d.conditions || "–"}</TableCell>
            <TableCell>{d.combinable ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={d.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: d.id });
                    toast.success(d.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{d.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(d)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Services Table ──────────────────────────────────────────────────────────
function ServicesTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.services.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.services.deactivate.useMutation({
    onSuccess: () => { utils.library.services.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((s: any) =>
      [s.name, s.serviceType, s.description].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Leistungen" />;

  const typeLabels: Record<string, string> = {
    reinigung: "Reinigung", impraegnierung: "Imprägnierung", garantie: "Garantie",
    zusatzleistung: "Zusatzleistung", wartung: "Wartung", beratung: "Beratung",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Leistung</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead>Preis</TableHead>
          <TableHead>Im Angebot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((s: any) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell><Badge variant={s.serviceType === "garantie" ? "default" : "outline"}>{typeLabels[s.serviceType] || s.serviceType}</Badge></TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{s.description || "–"}</TableCell>
            <TableCell className="font-medium">
              {s.basePrice ? `${Number(s.basePrice).toFixed(2)} € ${s.pricingUnit ? `/ ${s.pricingUnit}` : ""}` : "inklusive"}
            </TableCell>
            <TableCell>{s.includedInOffer ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: s.id });
                    toast.success(s.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{s.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(s)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Work Clothing Table ─────────────────────────────────────────────────────
function WorkClothingTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.workClothing.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.workClothing.deactivate.useMutation({
    onSuccess: () => { utils.library.workClothing.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((w: any) =>
      [w.name, w.clothingType, w.supplier].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Arbeitskleidung" />;

  const typeLabels: Record<string, string> = {
    sicherheitsschuhe: "Sicherheitsschuhe", arbeitshose: "Arbeitshose", arbeitsjacke: "Arbeitsjacke",
    helm: "Helm", handschuhe: "Handschuhe", schutzbrille: "Schutzbrille",
    warnweste: "Warnweste", regenkleidung: "Regenkleidung", sonstiges: "Sonstiges",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Artikel</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Größe</TableHead>
          <TableHead>Lieferant</TableHead>
          <TableHead>EK-Preis</TableHead>
          <TableHead>Bestand</TableHead>
          <TableHead>PSA</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((w: any) => (
          <TableRow key={w.id}>
            <TableCell className="font-medium">{w.name}</TableCell>
            <TableCell><Badge variant="outline">{typeLabels[w.clothingType] || w.clothingType}</Badge></TableCell>
            <TableCell>{w.size || "–"}</TableCell>
            <TableCell>{w.supplier || "–"}</TableCell>
            <TableCell>{w.purchasePrice ? `${Number(w.purchasePrice).toFixed(2)} €` : "–"}</TableCell>
            <TableCell>
              {w.currentStock !== null && w.currentStock !== undefined ? (
                <Badge variant={w.minStock && w.currentStock <= w.minStock ? "destructive" : "default"}>
                  {w.currentStock}
                </Badge>
              ) : "–"}
            </TableCell>
            <TableCell>{w.isPSA ? <Shield className="w-4 h-4 text-amber-500" /> : "–"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={w.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: w.id });
                    toast.success(w.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{w.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(w)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Assets Table ────────────────────────────────────────────────────────────
function AssetsTable({ searchTerm, onEdit }: { searchTerm: string; onEdit: (item: any) => void }) {
  const { data, isLoading } = trpc.library.assets.list.useQuery();
  const utils = trpc.useUtils();
  const deactivate = trpc.library.assets.deactivate.useMutation({
    onSuccess: () => { utils.library.assets.list.invalidate(); },
    onError: (e: any) => toast.error("Fehler", { description: e.message }),
  });
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a: any) =>
      [a.name, a.assetType, a.serialNumber, a.assignedToName].filter(Boolean).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) return <LoadingSkeleton />;
  if (!filtered.length) return <EmptyState entity="Arbeitsmittel" />;

  const typeLabels: Record<string, string> = {
    laptop: "Laptop", smartphone: "Smartphone", tablet: "Tablet", schluessel: "Schlüssel",
    tankkarte: "Tankkarte", kreditkarte: "Kreditkarte", werkzeug: "Werkzeug",
    sonstiges: "Sonstiges",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bezeichnung</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Seriennr.</TableHead>
          <TableHead>Zugewiesen an</TableHead>
          <TableHead>Kaufdatum</TableHead>
          <TableHead>Garantie bis</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((a: any) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.name}</TableCell>
            <TableCell><Badge variant="outline">{typeLabels[a.assetType] || a.assetType}</Badge></TableCell>
            <TableCell className="font-mono text-sm">{a.serialNumber || "–"}</TableCell>
            <TableCell>{a.assignedToName || <span className="text-muted-foreground">nicht zugewiesen</span>}</TableCell>
            <TableCell>{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("de-DE") : "–"}</TableCell>
            <TableCell>
              {a.warrantyUntil ? (
                <Badge variant={new Date(a.warrantyUntil) > new Date() ? "default" : "destructive"}>
                  {new Date(a.warrantyUntil).toLocaleDateString("de-DE")}
                </Badge>
              ) : "–"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={a.status === "aktiv"}
                  onCheckedChange={() => {
                    deactivate.mutate({ id: a.id });
                    toast.success(a.status === "aktiv" ? "Deaktiviert" : "Aktiviert");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs text-muted-foreground">{a.status === "aktiv" ? "Aktiv" : "Inaktiv"}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(a)}><Edit className="w-4 h-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Lade Daten...</span>
    </div>
  );
}

function EmptyState({ entity }: { entity: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">Keine {entity} vorhanden</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Klicke auf "Neuer Eintrag" um den ersten Datensatz anzulegen.</p>
    </div>
  );
}

// ─── Create/Edit Dialog ──────────────────────────────────────────────────────
function EntityDialog({
  open,
  onClose,
  entityType,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  entityType: SubTabId;
  editItem: any | null;
}) {
  const utils = trpc.useUtils();
  const isEdit = !!editItem;

  // Mutations for each entity type
  const vehicleCreate = trpc.library.vehicles.create.useMutation({ onSuccess: () => { utils.library.vehicles.list.invalidate(); onClose(); toast.success("Fahrzeug angelegt"); } });
  const vehicleUpdate = trpc.library.vehicles.update.useMutation({ onSuccess: () => { utils.library.vehicles.list.invalidate(); onClose(); toast.success("Fahrzeug aktualisiert"); } });
  const equipmentCreate = trpc.library.equipment.create.useMutation({ onSuccess: () => { utils.library.equipment.list.invalidate(); onClose(); toast.success("Gerät angelegt"); } });
  const equipmentUpdate = trpc.library.equipment.update.useMutation({ onSuccess: () => { utils.library.equipment.list.invalidate(); onClose(); toast.success("Gerät aktualisiert"); } });
  const cleaningCreate = trpc.library.cleaningAgents.create.useMutation({ onSuccess: () => { utils.library.cleaningAgents.list.invalidate(); onClose(); toast.success("Reinigungsmittel angelegt"); } });
  const cleaningUpdate = trpc.library.cleaningAgents.update.useMutation({ onSuccess: () => { utils.library.cleaningAgents.list.invalidate(); onClose(); toast.success("Reinigungsmittel aktualisiert"); } });
  const discountCreate = trpc.library.discounts.create.useMutation({ onSuccess: () => { utils.library.discounts.list.invalidate(); onClose(); toast.success("Rabatt angelegt"); } });
  const discountUpdate = trpc.library.discounts.update.useMutation({ onSuccess: () => { utils.library.discounts.list.invalidate(); onClose(); toast.success("Rabatt aktualisiert"); } });
  const serviceCreate = trpc.library.services.create.useMutation({ onSuccess: () => { utils.library.services.list.invalidate(); onClose(); toast.success("Leistung angelegt"); } });
  const serviceUpdate = trpc.library.services.update.useMutation({ onSuccess: () => { utils.library.services.list.invalidate(); onClose(); toast.success("Leistung aktualisiert"); } });
  const clothingCreate = trpc.library.workClothing.create.useMutation({ onSuccess: () => { utils.library.workClothing.list.invalidate(); onClose(); toast.success("Arbeitskleidung angelegt"); } });
  const clothingUpdate = trpc.library.workClothing.update.useMutation({ onSuccess: () => { utils.library.workClothing.list.invalidate(); onClose(); toast.success("Arbeitskleidung aktualisiert"); } });
  const assetCreate = trpc.library.assets.create.useMutation({ onSuccess: () => { utils.library.assets.list.invalidate(); onClose(); toast.success("Arbeitsmittel angelegt"); } });
  const assetUpdate = trpc.library.assets.update.useMutation({ onSuccess: () => { utils.library.assets.list.invalidate(); onClose(); toast.success("Arbeitsmittel aktualisiert"); } });

  const [formData, setFormData] = useState<Record<string, any>>(() => editItem || {});

  // Reset form when dialog opens with new item
  const dialogKey = `${entityType}-${editItem?.id || "new"}-${open}`;
  useState(() => { setFormData(editItem || {}); });

  const set = (key: string, value: any) => setFormData((prev: Record<string, any>) => ({ ...prev, [key]: value }));

  const isLoading = vehicleCreate.isPending || vehicleUpdate.isPending || equipmentCreate.isPending || equipmentUpdate.isPending ||
    cleaningCreate.isPending || cleaningUpdate.isPending || discountCreate.isPending || discountUpdate.isPending ||
    serviceCreate.isPending || serviceUpdate.isPending || clothingCreate.isPending || clothingUpdate.isPending ||
    assetCreate.isPending || assetUpdate.isPending;

  const handleSubmit = () => {
    const name = formData.name?.trim();
    if (!name) { toast.error("Name ist erforderlich"); return; }

    try {
      switch (entityType) {
        case "vehicles":
          if (isEdit) vehicleUpdate.mutate({ id: editItem.id, name, vehicleType: formData.vehicleType, licensePlate: formData.licensePlate, manufacturer: formData.manufacturer, model: formData.model, year: formData.year ? Number(formData.year) : undefined, capacity: formData.capacity, dailyCost: formData.dailyCost, fuelType: formData.fuelType, notes: formData.notes });
          else vehicleCreate.mutate({ name, vehicleType: formData.vehicleType || "waschbus", licensePlate: formData.licensePlate, manufacturer: formData.manufacturer, model: formData.model, year: formData.year ? Number(formData.year) : undefined, capacity: formData.capacity, dailyCost: formData.dailyCost, fuelType: formData.fuelType, notes: formData.notes });
          break;
        case "equipment":
          if (isEdit) equipmentUpdate.mutate({ id: editItem.id, name, equipmentType: formData.equipmentType, manufacturer: formData.manufacturer, maxHeight: formData.maxHeight ? String(formData.maxHeight) : undefined, ownership: formData.ownership, dailyRate: formData.dailyRate, notes: formData.notes });
          else equipmentCreate.mutate({ name, equipmentType: formData.equipmentType || "gelenkteleskop", manufacturer: formData.manufacturer, maxHeight: formData.maxHeight ? String(formData.maxHeight) : undefined, ownership: formData.ownership || "eigen", dailyRate: formData.dailyRate, notes: formData.notes });
          break;
        case "cleaningAgents":
          if (isEdit) cleaningUpdate.mutate({ id: editItem.id, name, articleNumber: formData.articleNumber, applicationArea: formData.applicationArea, containerSize: formData.containerSize, purchasePrice: formData.purchasePrice, minStock: formData.minStock ? Number(formData.minStock) : undefined, currentStock: formData.currentStock ? Number(formData.currentStock) : undefined, notes: formData.notes });
          else cleaningCreate.mutate({ name, articleNumber: formData.articleNumber, applicationArea: formData.applicationArea, containerSize: formData.containerSize, purchasePrice: formData.purchasePrice, notes: formData.notes });
          break;
        case "discounts":
          if (isEdit) discountUpdate.mutate({ id: editItem.id, name, discountType: formData.discountType, percentage: formData.percentage, conditions: formData.conditions, combinable: formData.combinable, code: formData.code, description: formData.description, notes: formData.notes });
          else discountCreate.mutate({ name, discountType: formData.discountType || "fruehbucher", percentage: formData.percentage, conditions: formData.conditions, combinable: formData.combinable ?? true, code: formData.code, description: formData.description, notes: formData.notes });
          break;
        case "services":
          if (isEdit) serviceUpdate.mutate({ id: editItem.id, name, serviceType: formData.serviceType, description: formData.description, scope: formData.scope, basePrice: formData.basePrice, pricingUnit: formData.pricingUnit, duration: formData.duration, includedInOffer: formData.includedInOffer, notes: formData.notes });
          else serviceCreate.mutate({ name, serviceType: formData.serviceType || "reinigung", description: formData.description, scope: formData.scope, basePrice: formData.basePrice, pricingUnit: formData.pricingUnit, duration: formData.duration, includedInOffer: formData.includedInOffer ?? true, notes: formData.notes });
          break;
        case "workClothing":
          if (isEdit) clothingUpdate.mutate({ id: editItem.id, name, clothingType: formData.clothingType, size: formData.size, supplier: formData.supplier, articleNumber: formData.articleNumber, purchasePrice: formData.purchasePrice, minStock: formData.minStock ? Number(formData.minStock) : undefined, currentStock: formData.currentStock ? Number(formData.currentStock) : undefined, isPSA: formData.isPSA, notes: formData.notes });
          else clothingCreate.mutate({ name, clothingType: formData.clothingType || "sicherheitsschuhe", size: formData.size, supplier: formData.supplier, articleNumber: formData.articleNumber, purchasePrice: formData.purchasePrice, isPSA: formData.isPSA ?? false, notes: formData.notes });
          break;
        case "assets":
          if (isEdit) assetUpdate.mutate({ id: editItem.id, name, assetType: formData.assetType, serialNumber: formData.serialNumber, inventoryNumber: formData.inventoryNumber, manufacturer: formData.manufacturer, model: formData.model, assignedToName: formData.assignedToName, cardNumber: formData.cardNumber, description: formData.description, notes: formData.notes });
          else assetCreate.mutate({ name, assetType: formData.assetType || "laptop", serialNumber: formData.serialNumber, inventoryNumber: formData.inventoryNumber, manufacturer: formData.manufacturer, model: formData.model, assignedToName: formData.assignedToName, cardNumber: formData.cardNumber, description: formData.description, notes: formData.notes });
          break;
      }
    } catch (err: any) {
      toast.error("Fehler beim Speichern", { description: err.message });
    }
  };

  const entityLabels: Record<string, string> = {
    vehicles: "Fahrzeug", equipment: "Gerät", cleaningAgents: "Reinigungsmittel",
    discounts: "Rabatt/Aktion", services: "Leistung", workClothing: "Arbeitskleidung", assets: "Arbeitsmittel",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `${entityLabels[entityType]} bearbeiten` : `Neues ${entityLabels[entityType]} anlegen`}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Änderungen werden im Änderungsprotokoll dokumentiert." : "Füllen Sie die Pflichtfelder aus. Alle weiteren Felder sind optional."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Common: Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Bezeichnung *</Label>
            <Input id="name" value={formData.name || ""} onChange={(e) => set("name", e.target.value)} placeholder={`z.B. ${entityType === "vehicles" ? "Waschbus 1 - MAN TGE" : entityType === "equipment" ? "Hubsteiger 18m" : entityType === "cleaningAgents" ? "FassadenFix Pro" : entityType === "discounts" ? "Frühbucher-Rabatt 2026" : entityType === "services" ? "Fassadenreinigung Standard" : entityType === "workClothing" ? "Sicherheitsschuhe S3" : "Laptop Dell Latitude"}`} />
          </div>

          {/* Entity-specific fields */}
          {entityType === "vehicles" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Fahrzeugtyp *</Label>
                  <Select value={formData.vehicleType || "waschbus"} onValueChange={(v) => set("vehicleType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waschbus">Waschbus</SelectItem>
                      <SelectItem value="dienstwagen">Dienstwagen</SelectItem>
                      <SelectItem value="poolfahrzeug">Poolfahrzeug</SelectItem>
                      <SelectItem value="anhaenger">Anhänger</SelectItem>
                      <SelectItem value="transporter">Transporter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kennzeichen</Label>
                  <Input value={formData.licensePlate || ""} onChange={(e) => set("licensePlate", e.target.value)} placeholder="L-FF 101" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Hersteller</Label>
                  <Input value={formData.manufacturer || ""} onChange={(e) => set("manufacturer", e.target.value)} placeholder="Mercedes" />
                </div>
                <div className="grid gap-2">
                  <Label>Modell</Label>
                  <Input value={formData.model || ""} onChange={(e) => set("model", e.target.value)} placeholder="Sprinter" />
                </div>
                <div className="grid gap-2">
                  <Label>Baujahr</Label>
                  <Input type="number" value={formData.year || ""} onChange={(e) => set("year", e.target.value)} placeholder="2024" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Kapazität</Label>
                  <Input value={formData.capacity || ""} onChange={(e) => set("capacity", e.target.value)} placeholder="3.500L" />
                </div>
                <div className="grid gap-2">
                  <Label>Tageskosten (€)</Label>
                  <Input value={formData.dailyCost || ""} onChange={(e) => set("dailyCost", e.target.value)} placeholder="120.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Kraftstoff</Label>
                  <Select value={formData.fuelType || ""} onValueChange={(v) => set("fuelType", v)}>
                    <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="benzin">Benzin</SelectItem>
                      <SelectItem value="elektro">Elektro</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {entityType === "equipment" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Gerätetyp *</Label>
                  <Select value={formData.equipmentType || "gelenkteleskop"} onValueChange={(v) => set("equipmentType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gelenkteleskop">Gelenkteleskop</SelectItem>
                      <SelectItem value="teleskop">Teleskop</SelectItem>
                      <SelectItem value="scherenlift">Scherenlift</SelectItem>
                      <SelectItem value="anhaengerlift">Anhängerlift</SelectItem>
                      <SelectItem value="hochdruckreiniger">Hochdruckreiniger</SelectItem>
                      <SelectItem value="sprühgeraet">Sprühgerät</SelectItem>
                      <SelectItem value="sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Hersteller</Label>
                  <Input value={formData.manufacturer || ""} onChange={(e) => set("manufacturer", e.target.value)} placeholder="Genie" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Max. Höhe (m)</Label>
                  <Input type="number" value={formData.maxHeight || ""} onChange={(e) => set("maxHeight", e.target.value)} placeholder="18" />
                </div>
                <div className="grid gap-2">
                  <Label>Eigentum</Label>
                  <Select value={formData.ownership || "eigen"} onValueChange={(v) => set("ownership", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eigen">Eigen</SelectItem>
                      <SelectItem value="dauermiete">Dauermiete</SelectItem>
                      <SelectItem value="tagesmiete">Tagesmiete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tagespreis (€)</Label>
                  <Input value={formData.dailyRate || ""} onChange={(e) => set("dailyRate", e.target.value)} placeholder="450.00" />
                </div>
              </div>
            </>
          )}

          {entityType === "cleaningAgents" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Artikelnummer</Label>
                  <Input value={formData.articleNumber || ""} onChange={(e) => set("articleNumber", e.target.value)} placeholder="FF-PRO-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Anwendungsgebiet</Label>
                  <Input value={formData.applicationArea || ""} onChange={(e) => set("applicationArea", e.target.value)} placeholder="WDVS, Putz" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Gebindegröße</Label>
                  <Input value={formData.containerSize || ""} onChange={(e) => set("containerSize", e.target.value)} placeholder="25L Kanister" />
                </div>
                <div className="grid gap-2">
                  <Label>EK-Preis (€)</Label>
                  <Input value={formData.purchasePrice || ""} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="89.90" />
                </div>
                <div className="grid gap-2">
                  <Label>Mindestbestand</Label>
                  <Input type="number" value={formData.minStock || ""} onChange={(e) => set("minStock", e.target.value)} placeholder="5" />
                </div>
              </div>
            </>
          )}

          {entityType === "discounts" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Rabatt-Typ *</Label>
                  <Select value={formData.discountType || "fruehbucher"} onValueChange={(v) => set("discountType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fruehbucher">Frühbucher</SelectItem>
                      <SelectItem value="mengenrabatt">Mengenrabatt</SelectItem>
                      <SelectItem value="einkaufsgemeinschaft">Einkaufsgemeinschaft</SelectItem>
                      <SelectItem value="sonderaktion">Sonderaktion</SelectItem>
                      <SelectItem value="preisstaffel">Preisstaffel</SelectItem>
                      <SelectItem value="treuebonus">Treuebonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Rabatt (%)</Label>
                  <Input value={formData.percentage || ""} onChange={(e) => set("percentage", e.target.value)} placeholder="6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Aktionscode</Label>
                  <Input value={formData.code || ""} onChange={(e) => set("code", e.target.value)} placeholder="FRÜHBUCHER2026" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={formData.combinable ?? true} onCheckedChange={(v) => set("combinable", v)} />
                  <Label>Mit anderen Rabatten kombinierbar</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Bedingungen</Label>
                <Textarea value={formData.conditions || ""} onChange={(e) => set("conditions", e.target.value)} placeholder="z.B. Buchung bis 31.12. des Vorjahres" rows={2} />
              </div>
              <div className="grid gap-2">
                <Label>Störer-Text (für Angebot)</Label>
                <Input value={formData.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="z.B. 🔥 Jetzt 6% Frühbucher-Rabatt sichern!" />
              </div>
            </>
          )}

          {entityType === "services" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Leistungstyp *</Label>
                  <Select value={formData.serviceType || "reinigung"} onValueChange={(v) => set("serviceType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reinigung">Reinigung</SelectItem>
                      <SelectItem value="impraegnierung">Imprägnierung</SelectItem>
                      <SelectItem value="garantie">Garantie</SelectItem>
                      <SelectItem value="zusatzleistung">Zusatzleistung</SelectItem>
                      <SelectItem value="wartung">Wartung</SelectItem>
                      <SelectItem value="beratung">Beratung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Dauer / Laufzeit</Label>
                  <Input value={formData.duration || ""} onChange={(e) => set("duration", e.target.value)} placeholder="z.B. 5 Jahre" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Grundpreis (€)</Label>
                  <Input value={formData.basePrice || ""} onChange={(e) => set("basePrice", e.target.value)} placeholder="2.50" />
                </div>
                <div className="grid gap-2">
                  <Label>Preiseinheit</Label>
                  <Input value={formData.pricingUnit || ""} onChange={(e) => set("pricingUnit", e.target.value)} placeholder="pro m²" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={formData.includedInOffer ?? true} onCheckedChange={(v) => set("includedInOffer", v)} />
                  <Label>Im Angebot</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Beschreibung</Label>
                <Textarea value={formData.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Leistungsbeschreibung..." rows={2} />
              </div>
              <div className="grid gap-2">
                <Label>Leistungsumfang</Label>
                <Textarea value={formData.scope || ""} onChange={(e) => set("scope", e.target.value)} placeholder="Detaillierter Umfang..." rows={2} />
              </div>
            </>
          )}

          {entityType === "workClothing" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Bekleidungstyp *</Label>
                  <Select value={formData.clothingType || "sicherheitsschuhe"} onValueChange={(v) => set("clothingType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sicherheitsschuhe">Sicherheitsschuhe</SelectItem>
                      <SelectItem value="arbeitshose">Arbeitshose</SelectItem>
                      <SelectItem value="arbeitsjacke">Arbeitsjacke</SelectItem>
                      <SelectItem value="helm">Helm</SelectItem>
                      <SelectItem value="handschuhe">Handschuhe</SelectItem>
                      <SelectItem value="schutzbrille">Schutzbrille</SelectItem>
                      <SelectItem value="warnweste">Warnweste</SelectItem>
                      <SelectItem value="regenkleidung">Regenkleidung</SelectItem>
                      <SelectItem value="sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Größe</Label>
                  <Input value={formData.size || ""} onChange={(e) => set("size", e.target.value)} placeholder="XL / 44" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Lieferant</Label>
                  <Input value={formData.supplier || ""} onChange={(e) => set("supplier", e.target.value)} placeholder="Engelbert Strauss" />
                </div>
                <div className="grid gap-2">
                  <Label>EK-Preis (€)</Label>
                  <Input value={formData.purchasePrice || ""} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="89.90" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={formData.isPSA ?? false} onCheckedChange={(v) => set("isPSA", v)} />
                  <Label>PSA-Pflicht</Label>
                </div>
              </div>
            </>
          )}

          {entityType === "assets" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Typ *</Label>
                  <Select value={formData.assetType || "laptop"} onValueChange={(v) => set("assetType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="smartphone">Smartphone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="schluessel">Schlüssel</SelectItem>
                      <SelectItem value="tankkarte">Tankkarte</SelectItem>
                      <SelectItem value="kreditkarte">Kreditkarte</SelectItem>
                      <SelectItem value="werkzeug">Werkzeug</SelectItem>
                      <SelectItem value="sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Seriennummer</Label>
                  <Input value={formData.serialNumber || ""} onChange={(e) => set("serialNumber", e.target.value)} placeholder="SN-12345" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Hersteller</Label>
                  <Input value={formData.manufacturer || ""} onChange={(e) => set("manufacturer", e.target.value)} placeholder="Dell" />
                </div>
                <div className="grid gap-2">
                  <Label>Modell</Label>
                  <Input value={formData.model || ""} onChange={(e) => set("model", e.target.value)} placeholder="Latitude 5540" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Zugewiesen an</Label>
                  <Input value={formData.assignedToName || ""} onChange={(e) => set("assignedToName", e.target.value)} placeholder="Max Mustermann" />
                </div>
                <div className="grid gap-2">
                  <Label>Kartennummer (Tankkarte etc.)</Label>
                  <Input value={formData.cardNumber || ""} onChange={(e) => set("cardNumber", e.target.value)} placeholder="XXXX-XXXX-XXXX" />
                </div>
              </div>
            </>
          )}

          {/* Common: Notes */}
          <div className="grid gap-2">
            <Label>Notizen</Label>
            <Textarea value={formData.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Zusätzliche Informationen..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="ff-button">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Speichern" : "Anlegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Bibliothek() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("lager");
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("vehicles");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory)!;

  const handleCategoryChange = (catId: CategoryId) => {
    setActiveCategory(catId);
    const cat = CATEGORIES.find((c) => c.id === catId)!;
    setActiveSubTab(cat.subTabs[0].id);
    setSearchTerm("");
  };

  const handleNewEntry = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  // Count badges per category
  const vehiclesQuery = trpc.library.vehicles.list.useQuery();
  const equipmentQuery = trpc.library.equipment.list.useQuery();
  const cleaningQuery = trpc.library.cleaningAgents.list.useQuery();
  const discountsQuery = trpc.library.discounts.list.useQuery();
  const servicesQuery = trpc.library.services.list.useQuery();
  const clothingQuery = trpc.library.workClothing.list.useQuery();
  const assetsQuery = trpc.library.assets.list.useQuery();

  const counts: Record<CategoryId, number> = {
    lager: (vehiclesQuery.data?.length || 0) + (equipmentQuery.data?.length || 0) + (cleaningQuery.data?.length || 0),
    marketing: discountsQuery.data?.length || 0,
    leistungen: servicesQuery.data?.length || 0,
    hr: (clothingQuery.data?.length || 0) + (assetsQuery.data?.length || 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Bibliothek</h1>
              <HelpTooltip
                content="Die Bibliothek ist die zentrale Stammdaten-Plattform. Alle Dropdowns im System (Angebote, Einsatzplanung etc.) laden ihre Daten von hier. Wenn du hier etwas änderst, wirkt es sich automatisch auf alle neuen Vorgänge aus – ohne Code-Änderung."
                helpTextKey="bibliothekZentral"
              />
            </div>
            <p className="text-muted-foreground">
              Zentrale Stammdaten – Was, Wie, Wer, Preis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button onClick={handleNewEntry} className="gap-2 ff-button">
              <Plus className="w-4 h-4" />
              Neuer Eintrag
            </Button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeCategory === cat.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${activeCategory === cat.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {cat.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">{counts[cat.id]}</Badge>
                </div>
                <h3 className="font-medium text-sm">{cat.label}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sub-Tabs for active category */}
        <Card className="ff-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentCategory.icon}
                <CardTitle className="text-lg">{currentCategory.label}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentCategory.subTabs.length > 1 ? (
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                <TabsList className="mb-4">
                  {currentCategory.subTabs.map((st) => (
                    <TabsTrigger key={st.id} value={st.id} className="gap-2">
                      {st.icon}
                      {st.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {currentCategory.subTabs.map((st) => (
                  <TabsContent key={st.id} value={st.id}>
                    <EntityTableSwitch entityType={st.id} searchTerm={searchTerm} onEdit={handleEdit} />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <EntityTableSwitch entityType={currentCategory.subTabs[0].id} searchTerm={searchTerm} onEdit={handleEdit} />
            )}
          </CardContent>
        </Card>

        {/* Entity Dialog */}
        <EntityDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          entityType={activeSubTab}
          editItem={editItem}
        />
      </div>
    </DashboardLayout>
  );
}

// ─── Table Router ────────────────────────────────────────────────────────────
function EntityTableSwitch({ entityType, searchTerm, onEdit }: { entityType: string; searchTerm: string; onEdit: (item: any) => void }) {
  switch (entityType) {
    case "vehicles": return <VehiclesTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "equipment": return <EquipmentTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "cleaningAgents": return <CleaningAgentsTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "discounts": return <DiscountsTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "services": return <ServicesTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "workClothing": return <WorkClothingTable searchTerm={searchTerm} onEdit={onEdit} />;
    case "assets": return <AssetsTable searchTerm={searchTerm} onEdit={onEdit} />;
    default: return <EmptyState entity="Daten" />;
  }
}
