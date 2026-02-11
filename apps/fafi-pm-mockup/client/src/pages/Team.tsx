/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * Team-Seite mit echter Datenbank-Anbindung
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Plus,
  Search,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building2,
  UserCircle,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Role configuration
const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700" },
  gf: { label: "Geschäftsführung", color: "bg-red-100 text-red-700" },
  kundenberater: { label: "Kundenberater", color: "bg-blue-100 text-blue-700" },
  at_leiter: { label: "AT-Leiter", color: "bg-amber-100 text-amber-700" },
  projektleiter: { label: "Projektleiter", color: "bg-green-100 text-green-700" },
  buero: { label: "Büro", color: "bg-gray-100 text-gray-700" },
  user: { label: "Mitarbeiter", color: "bg-slate-100 text-slate-700" },
};

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700" },
  inaktiv: { label: "Inaktiv", color: "bg-gray-100 text-gray-700" },
  urlaub: { label: "Im Urlaub", color: "bg-amber-100 text-amber-700" },
  krank: { label: "Krank", color: "bg-red-100 text-red-700" },
};

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("alle");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch team members from database
  const { data: teamMembers, isLoading, refetch } = trpc.teamMember.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();

  // Get user data by userId
  const getUserData = (userId: number) => {
    return users?.find(u => u.id === userId);
  };

  // Filter team members
  const filteredMembers = teamMembers?.filter((member) => {
    const user = getUserData(member.userId);
    const matchesSearch = 
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "alle" || user?.fafiRole === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  // Stats
  const totalMembers = teamMembers?.length || 0;
  const activeMembers = teamMembers?.filter(m => !m.exitDate).length || 0;
  const onVacation = 0; // Would need separate vacation tracking

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleViewDetails = (member: any) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Team
            </h1>
            <p className="text-muted-foreground mt-1">
              Teammitglieder verwalten und Rollen zuweisen
            </p>
          </div>
          <Button className="gap-2 ff-button" onClick={() => toast.info("Mitarbeiter hinzufügen - Funktion in Entwicklung")}>
            <Plus className="w-4 h-4" />
            Mitarbeiter hinzufügen
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          <Card className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setRoleFilter("alle")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalMembers}</p>}
                  <p className="text-xs text-muted-foreground">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeMembers}</p>}
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{onVacation}</p>}
                  <p className="text-xs text-muted-foreground">Im Urlaub</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="ff-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">
                      {users?.filter(u => u.fafiRole === "gf" || u.role === "admin").length || 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="ff-card animate-fade-in-up animate-delay-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Teammitglieder durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Rolle filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Rollen</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up animate-delay-300">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="ff-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : filteredMembers.length === 0 ? (
            <Card className="ff-card md:col-span-2 lg:col-span-3">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Teammitglieder gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter !== "alle"
                    ? "Versuche andere Suchkriterien oder Filter."
                    : "Füge dein erstes Teammitglied hinzu."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMembers.map((member) => {
              const user = getUserData(member.userId);
              const role = roleConfig[user?.fafiRole || "user"];
              const isActive = !member.exitDate;
              const status = isActive ? statusConfig["aktiv"] : statusConfig["inaktiv"];
              
              return (
                <Card
                  key={member.id}
                  className="ff-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => handleViewDetails({ ...member, user })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(user?.name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold truncate">{user?.name || "—"}</h3>
                            <p className="text-sm text-muted-foreground truncate">{member.position || "—"}</p>
                          </div>
                          <Badge className={cn("ml-2 shrink-0", status?.color)}>{status?.label}</Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          <Badge className={role?.color}>{role?.label}</Badge>
                          {user?.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          )}
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
                <UserCircle className="w-5 h-5 text-primary" />
                Mitarbeiterprofil
              </DialogTitle>
              <DialogDescription>
                Detailansicht und Kontaktinformationen
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedMember.user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedMember.user?.name || null)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedMember.user?.name || "—"}</h3>
                    <p className="text-muted-foreground">{selectedMember.position || "—"}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={roleConfig[selectedMember.user?.fafiRole || "user"]?.color}>
                        {roleConfig[selectedMember.user?.fafiRole || "user"]?.label}
                      </Badge>
                      <Badge className={!selectedMember.exitDate ? statusConfig["aktiv"]?.color : statusConfig["inaktiv"]?.color}>
                        {!selectedMember.exitDate ? statusConfig["aktiv"]?.label : statusConfig["inaktiv"]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedMember.user?.email && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" /> E-Mail
                      </p>
                      <p className="font-medium">{selectedMember.user.email}</p>
                    </div>
                  )}
                  {(selectedMember.workPhone || selectedMember.user?.phone) && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Telefon
                      </p>
                      <p className="font-medium">{selectedMember.workPhone || selectedMember.user?.phone}</p>
                    </div>
                  )}
                  {selectedMember.department && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> Abteilung
                      </p>
                      <p className="font-medium">{selectedMember.department}</p>
                    </div>
                  )}
                  {selectedMember.employeeNumber && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <UserCircle className="w-4 h-4" /> Personalnummer
                      </p>
                      <p className="font-medium">{selectedMember.employeeNumber}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Dabei seit
                    </p>
                    <p className="font-medium">{formatDate(selectedMember.hireDate)}</p>
                  </div>
                </div>
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
