import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Image,
  Video,
  File,
  Download,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  HardDrive,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CompanyArchiveProps {
  companyId: number;
  companyName: string;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  dokument: <FileText className="h-4 w-4 text-blue-500" />,
  bild: <Image className="h-4 w-4 text-green-500" />,
  video: <Video className="h-4 w-4 text-purple-500" />,
  sonstiges: <File className="h-4 w-4 text-gray-500" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  angebot: "bg-[#77bc1f]/10 text-[#77bc1f] border-[#77bc1f]/20",
  vertrag: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  rechnung: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  protokoll: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  foto: "bg-green-500/10 text-green-500 border-green-500/20",
  sonstiges: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CompanyArchive({ companyId, companyName }: CompanyArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("alle");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("alle");

  const { data: documents, isLoading } = trpc.document.searchArchive.useQuery({
    companyId,
    category: categoryFilter !== "alle" ? categoryFilter : undefined,
    fileType: fileTypeFilter !== "alle" ? fileTypeFilter : undefined,
    query: searchQuery || undefined,
  });

  const filteredDocuments = documents || [];

  // Statistiken berechnen
  const stats = {
    total: filteredDocuments.length,
    totalSize: filteredDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
    byCategory: filteredDocuments.reduce((acc, doc) => {
      const cat = doc.category || "sonstiges";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#4e5758]/5 border-[#4e5758]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#77bc1f]/10">
                <FolderOpen className="h-5 w-5 text-[#77bc1f]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokumente</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#4e5758]/5 border-[#4e5758]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <HardDrive className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Speicher</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#4e5758]/5 border-[#4e5758]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#77bc1f]/10">
                <FileText className="h-5 w-5 text-[#77bc1f]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Angebote</p>
                <p className="text-2xl font-bold">{stats.byCategory["angebot"] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#4e5758]/5 border-[#4e5758]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Protokolle</p>
                <p className="text-2xl font-bold">{stats.byCategory["protokoll"] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter-Leiste */}
      <Card className="border-[#4e5758]/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#77bc1f]" />
            Archiv durchsuchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dokumente suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Kategorien</SelectItem>
                <SelectItem value="angebot">Angebote</SelectItem>
                <SelectItem value="vertrag">Verträge</SelectItem>
                <SelectItem value="rechnung">Rechnungen</SelectItem>
                <SelectItem value="protokoll">Protokolle</SelectItem>
                <SelectItem value="foto">Fotos</SelectItem>
                <SelectItem value="sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Dateityp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Typen</SelectItem>
                <SelectItem value="dokument">Dokumente</SelectItem>
                <SelectItem value="bild">Bilder</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dokumenten-Tabelle */}
      <Card className="border-[#4e5758]/20">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Dokumente werden geladen...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Keine Dokumente im Archiv gefunden
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Dokumente werden automatisch beim Erstellen von Angeboten gespeichert
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="hidden md:table-cell">Größe</TableHead>
                  <TableHead className="hidden md:table-cell">Datum</TableHead>
                  <TableHead className="w-[100px]">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-[#4e5758]/5">
                    <TableCell>
                      {FILE_TYPE_ICONS[doc.fileType || "sonstiges"]}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[doc.category || "sonstiges"]}
                      >
                        {doc.category || "Sonstiges"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatFileSize(doc.fileSize)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {doc.createdAt
                        ? format(new Date(doc.createdAt), "dd.MM.yyyy", { locale: de })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#77bc1f] hover:text-[#77bc1f] hover:bg-[#77bc1f]/10"
                        onClick={() => {
                          if (doc.s3Url) {
                            window.open(doc.s3Url, "_blank");
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanyArchive;
