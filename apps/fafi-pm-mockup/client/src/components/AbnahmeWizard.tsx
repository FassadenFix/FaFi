/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Abnahme-Wizard: Strukturierter Abnahme-Prozess mit Protokoll
 */

import { WizardDialog, WizardStep } from "@/components/Wizard";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  FileText,
  Shield,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Defect {
  description: string;
  severity: "gering" | "mittel" | "schwer";
  location: string;
}

interface AbnahmeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  orderId: number;
  orderNumber: string;
  projectId: number;
  projectName: string;
  companyName: string;
  orderTotal: string;
}

export default function AbnahmeWizard({
  isOpen,
  onClose,
  onComplete,
  orderId,
  orderNumber,
  projectId,
  projectName,
  companyName,
  orderTotal,
}: AbnahmeWizardProps) {
  // Form state
  const [acceptanceDate, setAcceptanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [acceptedBy, setAcceptedBy] = useState("");
  const [overallRating, setOverallRating] = useState<
    "einwandfrei" | "mit_maengeln" | "abgelehnt"
  >("einwandfrei");
  const [defects, setDefects] = useState<Defect[]>([]);
  const [notes, setNotes] = useState("");
  const [createInvoice, setCreateInvoice] = useState(true);
  const [createWarranty, setCreateWarranty] = useState(true);
  const [warrantyYears, setWarrantyYears] = useState(5);

  const completeMutation = trpc.order.completeWithAcceptance.useMutation({
    onSuccess: (result) => {
      const parts = [`Abnahme: ${result.acceptance.rating}`];
      if (result.invoice) parts.push(`Rechnung ${result.invoice.invoiceNumber} erstellt`);
      if (result.warranty) parts.push("Garantie aktiviert");
      toast.success(parts.join(". "), { duration: 6000 });
      onComplete();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleComplete = () => {
    completeMutation.mutate({
      orderId,
      projectId,
      acceptanceDate: new Date(acceptanceDate),
      acceptedBy,
      overallRating,
      defects: defects.length > 0 ? defects : undefined,
      notes: notes || undefined,
      createInvoice,
      createWarranty: createWarranty && overallRating === "einwandfrei",
      warrantyYears,
    });
  };

  const addDefect = () => {
    setDefects([...defects, { description: "", severity: "gering", location: "" }]);
  };

  const removeDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
  };

  const updateDefect = (index: number, field: keyof Defect, value: string) => {
    const updated = [...defects];
    updated[index] = { ...updated[index], [field]: value };
    setDefects(updated);
  };

  const ratingConfig = {
    einwandfrei: {
      icon: CheckCircle2,
      color: "text-[#77bc1f]",
      bg: "bg-[#77bc1f]/10",
      border: "border-[#77bc1f]/30",
      label: "Einwandfrei",
      desc: "Alle Arbeiten ordnungsgemäß ausgeführt",
    },
    mit_maengeln: {
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "Mit Mängeln",
      desc: "Nachbesserung erforderlich",
    },
    abgelehnt: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Abgelehnt",
      desc: "Abnahme wird verweigert",
    },
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "protokoll",
        title: "Abnahmeprotokoll",
        icon: ClipboardCheck,
        content: (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <ClipboardCheck className="w-16 h-16 text-[#77bc1f] mx-auto mb-3" />
              <h3 className="text-xl font-bold">Abnahmeprotokoll</h3>
              <p className="text-muted-foreground mt-1">
                Dokumentieren Sie die Abnahme für {projectName}
              </p>
            </div>

            <Card className="border-[#77bc1f]/30 bg-[#77bc1f]/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Auftrag:</span>{" "}
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kunde:</span>{" "}
                    <span className="font-medium">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auftragswert:</span>{" "}
                    <span className="font-medium text-[#77bc1f]">
                      {parseFloat(orderTotal || "0").toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Abnahmedatum *</Label>
                <Input
                  type="date"
                  value={acceptanceDate}
                  onChange={(e) => setAcceptanceDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Abgenommen durch *</Label>
                <Input
                  value={acceptedBy}
                  onChange={(e) => setAcceptedBy(e.target.value)}
                  placeholder="Name des Abnehmenden"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "bewertung",
        title: "Bewertung",
        icon: FileText,
        content: (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Gesamtbewertung</h3>

            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(ratingConfig) as [string, typeof ratingConfig.einwandfrei][]).map(
                ([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = overallRating === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setOverallRating(key as typeof overallRating)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? `${config.border} ${config.bg} ring-2 ring-offset-2 ${config.border}`
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? config.color : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-semibold text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{config.desc}</p>
                    </button>
                  );
                }
              )}
            </div>

            {overallRating === "mit_maengeln" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Mängelliste
                  </h4>
                  <Button size="sm" variant="outline" onClick={addDefect}>
                    <Plus className="w-4 h-4 mr-1" />
                    Mangel hinzufügen
                  </Button>
                </div>

                {defects.map((defect, i) => (
                  <Card key={i} className="border-amber-200">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Mangel {i + 1}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => removeDefect(i)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Beschreibung des Mangels"
                        value={defect.description}
                        onChange={(e) => updateDefect(i, "description", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={defect.severity}
                          onValueChange={(v) => updateDefect(i, "severity", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gering">Gering</SelectItem>
                            <SelectItem value="mittel">Mittel</SelectItem>
                            <SelectItem value="schwer">Schwer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Ort / Bereich"
                          value={defect.location}
                          onChange={(e) => updateDefect(i, "location", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {defects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Klicken Sie "Mangel hinzufügen" um Mängel zu dokumentieren
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Anmerkungen</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Weitere Anmerkungen zur Abnahme..."
                rows={3}
              />
            </div>
          </div>
        ),
      },
      {
        id: "folgeschritte",
        title: "Folgeschritte",
        icon: Shield,
        content: (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Automatische Folgeschritte</h3>

            {overallRating !== "abgelehnt" && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Rechnung automatisch erstellen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Schlussrechnung über{" "}
                    {parseFloat(orderTotal || "0").toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
                <Switch checked={createInvoice} onCheckedChange={setCreateInvoice} />
              </div>
            )}

            {overallRating === "einwandfrei" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Garantie aktivieren
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Algenfrei-Garantie für den Kunden
                    </p>
                  </div>
                  <Switch checked={createWarranty} onCheckedChange={setCreateWarranty} />
                </div>

                {createWarranty && (
                  <div className="ml-4">
                    <Label>Garantiedauer (Jahre)</Label>
                    <Select
                      value={warrantyYears.toString()}
                      onValueChange={(v) => setWarrantyYears(parseInt(v))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Jahre</SelectItem>
                        <SelectItem value="5">5 Jahre</SelectItem>
                        <SelectItem value="7">7 Jahre</SelectItem>
                        <SelectItem value="10">10 Jahre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {overallRating === "abgelehnt" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-700 font-semibold">Abnahme abgelehnt</p>
                  <p className="text-sm text-red-600 mt-1">
                    Das Projekt wird zurück in die Durchführungsphase gesetzt. Es werden keine
                    Rechnungen oder Garantien erstellt.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-[#77bc1f]/30 bg-[#77bc1f]/5">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Zusammenfassung</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bewertung:</span>
                    <Badge
                      className={`${ratingConfig[overallRating].bg} ${ratingConfig[overallRating].color} border ${ratingConfig[overallRating].border}`}
                    >
                      {ratingConfig[overallRating].label}
                    </Badge>
                  </div>
                  {defects.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mängel:</span>
                      <span>{defects.length} dokumentiert</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rechnung:</span>
                    <span>{createInvoice && overallRating !== "abgelehnt" ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Garantie:</span>
                    <span>
                      {createWarranty && overallRating === "einwandfrei"
                        ? `${warrantyYears} Jahre`
                        : "Nein"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      },
    ],
    [
      acceptanceDate,
      acceptedBy,
      overallRating,
      defects,
      notes,
      createInvoice,
      createWarranty,
      warrantyYears,
      projectName,
      companyName,
      orderNumber,
      orderTotal,
    ]
  );

  return (
    <WizardDialog
      isOpen={isOpen}
      steps={steps}
      title="Abnahme durchführen"
      description={`Auftrag ${orderNumber} – ${companyName}`}
      onComplete={handleComplete}
      onCancel={onClose}
      showDraftButton={false}
    />
  );
}
