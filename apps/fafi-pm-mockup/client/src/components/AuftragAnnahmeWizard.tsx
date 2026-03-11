/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Auftrag-Annahme-Wizard: Automatisiert den Übergang von Angebot → Auftrag
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Building2,
  CalendarDays,
  CheckCircle2,
  Users,
  HardHat,
  ListChecks,
} from "lucide-react";

interface AuftragAnnahmeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  projectId: number;
  projectName: string;
  offerId: number;
  offerNumber: string;
  offerTotal: string;
  companyName: string;
}

export default function AuftragAnnahmeWizard({
  isOpen,
  onClose,
  onComplete,
  projectId,
  projectName,
  offerId,
  offerNumber,
  offerTotal,
  companyName,
}: AuftragAnnahmeWizardProps) {
  // Form state
  const [baustelleName, setBaustelleName] = useState(projectName);
  const [baustelleAddress, setBaustelleAddress] = useState("");
  const [projektleiterId, setProjektleiterId] = useState<number | undefined>();
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [createDefaultTasks, setCreateDefaultTasks] = useState(true);
  const [notes, setNotes] = useState("");

  // Load users for Projektleiter selection
  const { data: users } = trpc.user.list.useQuery();

  const acceptMutation = trpc.order.acceptFromOffer.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Auftrag ${result.order.orderNumber} erstellt! Baustelle ${result.constructionSite.siteNumber} angelegt. ${result.tasksCreated} Aufgaben erstellt.`,
        { duration: 6000 }
      );
      onComplete();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleComplete = () => {
    acceptMutation.mutate({
      projectId,
      offerId,
      baustelleName,
      baustelleAddress: baustelleAddress || undefined,
      projektleiterId,
      plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : undefined,
      plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
      createDefaultTasks,
      notes: notes || undefined,
    });
  };

  // Default tasks preview
  const defaultTasks = [
    { title: "Bewohnerinfo erstellen", role: "Büro", days: "14 Tage vor Start" },
    { title: "Straßensperre beantragen", role: "Büro", days: "21 Tage vor Start" },
    { title: "Ressourcen buchen", role: "AT-Leiter", days: "7 Tage vor Start" },
    { title: "Material bestellen", role: "AT-Leiter", days: "10 Tage vor Start" },
    { title: "Team einteilen", role: "Projektleiter", days: "5 Tage vor Start" },
    { title: "Kick-off Meeting planen", role: "Projektleiter", days: "3 Tage vor Start" },
  ];

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "confirm",
        title: "Auftrag bestätigen",
        icon: FileText,
        content: (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-[#77bc1f] mx-auto mb-3" />
              <h3 className="text-xl font-bold">Auftrag annehmen</h3>
              <p className="text-muted-foreground mt-1">
                Folgende Daten werden aus dem Angebot übernommen
              </p>
            </div>

            <Card className="border-[#77bc1f]/30 bg-[#77bc1f]/5">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Projekt</p>
                    <p className="font-semibold">{projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kunde</p>
                    <p className="font-semibold">{companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Angebot</p>
                    <p className="font-semibold">{offerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auftragswert</p>
                    <p className="font-semibold text-[#77bc1f]">
                      {parseFloat(offerTotal || "0").toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Was passiert automatisch:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">1</Badge>
                  Angebot wird als "angenommen" markiert
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">2</Badge>
                  Projekt-Phase wechselt zu "Auftrag gewonnen"
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">3</Badge>
                  Auftrag mit allen Daten aus dem Angebot wird erstellt
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">4</Badge>
                  Baustelle wird automatisch angelegt
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/30">5</Badge>
                  Planungsaufgaben werden erstellt
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "baustelle",
        title: "Baustelle konfigurieren",
        icon: Building2,
        content: (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HardHat className="w-5 h-5 text-[#77bc1f]" />
                Baustelle einrichten
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Die Baustelle wird automatisch mit dem Projekt verknüpft
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Baustellenname *</Label>
                <Input
                  value={baustelleName}
                  onChange={(e) => setBaustelleName(e.target.value)}
                  placeholder="z.B. Wohnanlage Sonnenhof"
                />
              </div>

              <div>
                <Label>Adresse</Label>
                <Input
                  value={baustelleAddress}
                  onChange={(e) => setBaustelleAddress(e.target.value)}
                  placeholder="z.B. Sonnenhofweg 1-12, 12345 Musterstadt"
                />
              </div>

              <div>
                <Label>Projektleiter</Label>
                <Select
                  value={projektleiterId?.toString() || ""}
                  onValueChange={(v) => setProjektleiterId(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projektleiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "zeitplanung",
        title: "Zeitplanung",
        icon: CalendarDays,
        content: (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#77bc1f]" />
                Zeitplanung festlegen
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Die Aufgaben-Fälligkeiten werden automatisch berechnet
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Geplanter Start</Label>
                <Input
                  type="date"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Geplantes Ende</Label>
                <Input
                  type="date"
                  value={plannedEndDate}
                  onChange={(e) => setPlannedEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Notizen zum Auftrag</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Besonderheiten, Absprachen, Hinweise..."
                rows={3}
              />
            </div>
          </div>
        ),
      },
      {
        id: "aufgaben",
        title: "Aufgaben & Zusammenfassung",
        icon: ListChecks,
        content: (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#77bc1f]" />
                Planungsaufgaben
              </h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold">Standard-Aufgaben erstellen</p>
                <p className="text-sm text-muted-foreground">
                  6 Aufgaben für die Baustellenvorbereitung
                </p>
              </div>
              <Switch
                checked={createDefaultTasks}
                onCheckedChange={setCreateDefaultTasks}
              />
            </div>

            {createDefaultTasks && (
              <div className="space-y-2">
                {defaultTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#77bc1f]/10 text-[#77bc1f] flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.days}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Card className="border-[#77bc1f]/30 bg-[#77bc1f]/5">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Zusammenfassung</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Projekt:</span>{" "}
                    <span className="font-medium">{projectName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Baustelle:</span>{" "}
                    <span className="font-medium">{baustelleName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    <span className="font-medium">
                      {plannedStartDate
                        ? new Date(plannedStartDate).toLocaleDateString("de-DE")
                        : "Nicht festgelegt"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aufgaben:</span>{" "}
                    <span className="font-medium">
                      {createDefaultTasks ? "6 Aufgaben" : "Keine"}
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
      baustelleName,
      baustelleAddress,
      projektleiterId,
      plannedStartDate,
      plannedEndDate,
      createDefaultTasks,
      notes,
      users,
      projectName,
      companyName,
      offerNumber,
      offerTotal,
      defaultTasks,
    ]
  );

  return (
    <WizardDialog
      isOpen={isOpen}
      steps={steps}
      title="Auftrag annehmen"
      description={`Angebot ${offerNumber} → Auftrag für ${companyName}`}
      onComplete={handleComplete}
      onCancel={onClose}
      showDraftButton={false}
    />
  );
}
