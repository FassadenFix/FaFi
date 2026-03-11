/**
 * TaskDetailDialog – Aufgaben-Detailansicht
 * Sheet/Drawer mit Aufgaben-Info, Kommentar-Timeline und Foto-Upload
 * 
 * Intention: Dokumentation und Kommunikation direkt an der Aufgabe –
 * Nachweise, Rückfragen und Fortschritt zentral erfassen
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Calendar, User, Building2, MessageSquare, Paperclip,
  Send, Image as ImageIcon, X, Loader2, CheckCircle2,
  Clock, ArrowRight, AlertTriangle, ChevronRight, FileText
} from "lucide-react";

type TaskStatus = "offen" | "in_bearbeitung" | "erledigt" | "abgebrochen";

interface TaskDetailDialogProps {
  task: {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: string;
    dueDate: Date | null;
    assignedRole: string | null;
    responsibleParty: string | null;
    completedAt: Date | null;
    createdAt: Date;
    constructionSiteId: number | null;
    projectId: number | null;
    siteName?: string | null;
    siteNumber?: string | null;
    projectName?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onUpdate: () => void;
}

// Ampel-Status berechnen
function getTrafficLightStatus(task: { status: string; dueDate: Date | null }): "green" | "yellow" | "red" {
  if (task.status === "erledigt") return "green";
  if (!task.dueDate) return "yellow";
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "red";
  if (diffDays <= 3) return "yellow";
  return "green";
}

export default function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onUpdate,
}: TaskDetailDialogProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aufgabe mit Kommentaren laden
  const { data: taskWithComments, refetch: refetchComments } = trpc.task.getWithComments.useQuery(
    { id: task?.id ?? 0 },
    { enabled: !!task?.id && open }
  );

  // Mutations
  const addComment = trpc.task.addComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setPendingAttachments([]);
      refetchComments();
      onUpdate();
    },
  });

  const uploadAttachment = trpc.task.uploadAttachment.useMutation();

  // Datei-Upload Handler
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !task) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      // Max 5MB pro Datei
      if (file.size > 5 * 1024 * 1024) {
        alert(`Datei "${file.name}" ist zu groß (max. 5 MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const result = await uploadAttachment.mutateAsync({
          taskId: task.id,
          fileName: file.name,
          contentType: file.type,
          base64Data: base64,
        });
        newUrls.push(result.url);
      } catch (err) {
        console.error("Upload fehlgeschlagen:", err);
      }
    }

    setPendingAttachments(prev => [...prev, ...newUrls]);
    setIsUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [task, uploadAttachment]);

  // Kommentar absenden
  const handleSendComment = useCallback(async () => {
    if (!task || (!commentText.trim() && pendingAttachments.length === 0)) return;
    setIsSending(true);
    try {
      await addComment.mutateAsync({
        taskId: task.id,
        text: commentText.trim() || "(Foto-Nachweis)",
        attachmentUrls: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      });
    } finally {
      setIsSending(false);
    }
  }, [task, commentText, pendingAttachments, addComment]);

  // Anhang entfernen
  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (!task) return null;

  const trafficLight = getTrafficLightStatus(task);
  const comments = taskWithComments?.comments ?? [];

  const statusLabels: Record<string, string> = {
    offen: "Offen",
    in_bearbeitung: "In Bearbeitung",
    erledigt: "Erledigt",
    abgebrochen: "Abgebrochen",
  };

  const statusColors: Record<string, string> = {
    offen: "bg-amber-100 text-amber-700",
    in_bearbeitung: "bg-blue-100 text-blue-700",
    erledigt: "bg-green-100 text-green-700",
    abgebrochen: "bg-slate-100 text-slate-700",
  };

  const priorityColors: Record<string, string> = {
    niedrig: "bg-slate-100 text-slate-700",
    normal: "bg-blue-100 text-blue-700",
    hoch: "bg-orange-100 text-orange-700",
    dringend: "bg-red-100 text-red-700",
  };

  const trafficLightColors = {
    green: "bg-green-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
  };

  const nextStatus: Record<string, TaskStatus | null> = {
    offen: "in_bearbeitung",
    in_bearbeitung: "erledigt",
    erledigt: null,
    abgebrochen: null,
  };

  const nextStatusLabel: Record<string, string> = {
    offen: "Aufgabe starten",
    in_bearbeitung: "Als erledigt markieren",
    erledigt: "",
    abgebrochen: "",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-start gap-3">
            <div className={cn("w-4 h-4 rounded-full mt-1 shrink-0", trafficLightColors[trafficLight])} />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left text-lg leading-tight">{task.title}</SheetTitle>
              {task.siteName && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{task.siteNumber}: {task.siteName}</span>
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Meta-Informationen */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <div className="mt-1">
                  <Badge className={cn("text-xs", statusColors[task.status] || "")}>
                    {statusLabels[task.status] || task.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Priorität</label>
                <div className="mt-1">
                  <Badge className={cn("text-xs", priorityColors[task.priority] || "")}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Fällig am</label>
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {task.dueDate ? (
                    <span className={cn(
                      trafficLight === 'red' && 'text-red-600 font-medium',
                      trafficLight === 'yellow' && 'text-amber-600'
                    )}>
                      {format(new Date(task.dueDate), "dd. MMMM yyyy", { locale: de })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Kein Datum</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Verantwortlich</label>
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{task.assignedRole || "Nicht zugewiesen"}</span>
                  {task.responsibleParty && (
                    <Badge variant="outline" className={cn("text-xs ml-1",
                      task.responsibleParty === 'auftraggeber' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}>
                      {task.responsibleParty === 'auftraggeber' ? 'AG' : 'AN'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Beschreibung */}
            {task.description && (
              <>
                <Separator />
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Beschreibung</label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              </>
            )}

            {/* Status-Wechsel Button */}
            {nextStatus[task.status] && (
              <>
                <Separator />
                <Button
                  className="w-full"
                  onClick={() => {
                    onStatusChange(task.id, nextStatus[task.status]!);
                    onUpdate();
                  }}
                >
                  {task.status === 'offen' ? <ArrowRight className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {nextStatusLabel[task.status]}
                </Button>
              </>
            )}

            <Separator />

            {/* Kommentar-Timeline */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4" />
                Kommentare & Nachweise
                {comments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
                )}
              </h3>

              {comments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Noch keine Kommentare.</p>
                  <p className="text-xs mt-1">Fügen Sie Notizen oder Foto-Nachweise hinzu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                        {(comment.userName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                        
                        {/* Anhänge anzeigen */}
                        {comment.attachmentUrls && comment.attachmentUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {comment.attachmentUrls.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                {isImageUrl(url) ? (
                                  <img
                                    src={url}
                                    alt={`Anhang ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border hover:ring-2 hover:ring-primary/50 transition-all"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Anhang {idx + 1}</span>
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Kommentar-Eingabe (fixiert am unteren Rand) */}
        <div className="border-t p-4 shrink-0 bg-background">
          {/* Pending Attachments Preview */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {pendingAttachments.map((url, idx) => (
                <div key={idx} className="relative group">
                  {isImageUrl(url) ? (
                    <img
                      src={url}
                      alt={`Upload ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Kommentar oder Nachweis hinzufügen..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSendComment();
                }
              }}
            />
            <div className="flex flex-col gap-1.5">
              {/* Foto-Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </Button>
              {/* Senden Button */}
              <Button
                size="icon"
                className="h-[30px] w-[30px]"
                onClick={handleSendComment}
                disabled={isSending || (!commentText.trim() && pendingAttachments.length === 0)}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Strg+Enter zum Senden. Fotos als Nachweise anhängen (max. 5 MB).
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Hilfsfunktionen
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}
