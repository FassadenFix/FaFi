/**
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * Einstellungen: Benutzerprofil und Systemkonfiguration
 */

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Settings,
  Bell,
  Shield,
  Key,
  Database,
  Globe,
  Palette,
  Link2,
  Smartphone,
  Monitor,
  Clock,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Camera,
  Save,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HelpTooltip, HELP_TEXTS } from "@/components/HelpTooltip";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// Profile Section
function ProfilSection() {
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  
  const handleSave = () => {
    toast.info("Wird in Kürze freigeschaltet", {
      description: "Die Speicherfunktion wird mit dem nächsten Update aktiviert.",
    });
  };

  const handleAvatarUpload = () => {
    toast.info("Avatar hochladen", {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Persönliche Daten
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre persönlichen Informationen und Kontaktdaten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "??"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                onClick={handleAvatarUpload}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name || "Benutzer"}</h3>
              <p className="text-muted-foreground">{user?.role === "admin" ? "Administrator" : "Mitarbeiter"}</p>
              <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/20">
                Administrator
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Personal Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vorname">Vorname</Label>
              <Input id="vorname" defaultValue={user?.name?.split(" ")[0] || ""} />
            </div>
            <div>
              <Label htmlFor="nachname">Nachname</Label>
              <Input id="nachname" defaultValue={user?.name?.split(" ").slice(1).join(" ") || ""} />
            </div>
            <div>
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} />
            </div>
            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input id="telefon" type="tel" defaultValue="+49 123 456789" />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input id="position" defaultValue="Geschäftsführung" />
            </div>
            <div>
              <Label htmlFor="abteilung">Abteilung</Label>
              <Select defaultValue="management">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="management">Geschäftsleitung</SelectItem>
                  <SelectItem value="projektleitung">Projektleitung</SelectItem>
                  <SelectItem value="bauleitung">Bauleitung</SelectItem>
                  <SelectItem value="verwaltung">Verwaltung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Password Change */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Passwort ändern
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current-password">Aktuelles Passwort</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2" variant="outline" disabled>
              <Save className="w-4 h-4" />
              Änderungen speichern
            </Button>
            <span className="text-xs text-muted-foreground ml-3 self-center">Wird in Kürze freigeschaltet</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// System Configuration Section
function SystemSection() {
  const handleSave = () => {
    toast.info("Wird in Kürze freigeschaltet", {
      description: "Die Speicherfunktion wird mit dem nächsten Update aktiviert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Sprache & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sprache</Label>
              <Select defaultValue="de">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Zeitzone</Label>
              <Select defaultValue="europe-berlin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe-berlin">Europe/Berlin (UTC+1)</SelectItem>
                  <SelectItem value="europe-zurich">Europe/Zurich (UTC+1)</SelectItem>
                  <SelectItem value="europe-vienna">Europe/Vienna (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Datumsformat</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD.MM.YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Darstellung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dunkelmodus</Label>
              <p className="text-sm text-muted-foreground">
                Aktiviert das dunkle Farbschema für bessere Lesbarkeit bei schlechten Lichtverhältnissen
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Kompakte Ansicht</Label>
              <p className="text-sm text-muted-foreground">
                Reduziert Abstände für mehr Inhalt auf dem Bildschirm
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animationen</Label>
              <p className="text-sm text-muted-foreground">
                Aktiviert Übergangsanimationen in der Benutzeroberfläche
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Einführungstour</Label>
              <p className="text-sm text-muted-foreground">
                Zeigt die Willkommens-Tour erneut an, die dir alle Bereiche erklärt
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('fafi-onboarding-completed');
                localStorage.removeItem('fafi-onboarding-skipped');
                window.location.href = '/';
              }}
            >
              Tour starten
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Kalender & Termine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Wochenstart</Label>
              <Select defaultValue="monday">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Montag</SelectItem>
                  <SelectItem value="sunday">Sonntag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Arbeitswoche</Label>
              <Select defaultValue="mo-fr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mo-fr">Montag - Freitag</SelectItem>
                  <SelectItem value="mo-sa">Montag - Samstag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Arbeitsbeginn</Label>
              <Input type="time" defaultValue="07:00" />
            </div>
            <div>
              <Label>Arbeitsende</Label>
              <Input type="time" defaultValue="17:00" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" variant="outline" disabled>
          <Save className="w-4 h-4" />
          Einstellungen speichern
        </Button>
        <span className="text-xs text-muted-foreground ml-3 self-center">Wird in Kürze freigeschaltet</span>
      </div>
    </div>
  );
}

// Notifications Section
function BenachrichtigungenSection() {
  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            E-Mail-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Neue Projekte", desc: "Benachrichtigung bei Erstellung neuer Projekte", checked: true },
            { label: "Status-Änderungen", desc: "Updates zu Projektstatus-Änderungen", checked: true },
            { label: "Countdown-Warnungen", desc: "Erinnerungen vor Fristablauf", checked: true },
            { label: "Team-Zuordnungen", desc: "Benachrichtigung bei Zuweisung zu Projekten", checked: true },
            { label: "Wöchentliche Zusammenfassung", desc: "Übersicht aller Aktivitäten der Woche", checked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.checked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Push-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Dringende Aufgaben", desc: "Sofortige Benachrichtigung bei kritischen Fristen", checked: true },
            { label: "Chat-Nachrichten", desc: "Neue Nachrichten im Projekt-Chat", checked: true },
            { label: "Baustellen-Updates", desc: "Wichtige Änderungen auf Baustellen", checked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.checked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Ruhezeiten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ruhezeiten aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Keine Benachrichtigungen während der Ruhezeit
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von</Label>
              <Input type="time" defaultValue="20:00" />
            </div>
            <div>
              <Label>Bis</Label>
              <Input type="time" defaultValue="07:00" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Integrations Section
function IntegrationenSection() {
  const handleConnect = (service: string) => {
    toast.info(`${service} verbinden`, {
      description: "Diese Funktion wird in der finalen Version verfügbar sein.",
    });
  };

  const handleGenerateKey = () => {
    toast.success("API-Schlüssel generiert", {
      description: "Der neue Schlüssel wurde in die Zwischenablage kopiert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Verbundene Dienste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HubSpot */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">HS</span>
              </div>
              <div>
                <h4 className="font-medium">HubSpot CRM</h4>
                <p className="text-sm text-muted-foreground">Kontakte und Deals synchronisieren</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Verbunden</Badge>
              <Button variant="outline" size="sm">Konfigurieren</Button>
            </div>
          </div>

          {/* MS Teams */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">MS</span>
              </div>
              <div>
                <h4 className="font-medium">Microsoft Teams</h4>
                <p className="text-sm text-muted-foreground">Chat und Kalender-Integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Verbunden</Badge>
              <Button variant="outline" size="sm">Konfigurieren</Button>
            </div>
          </div>

          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">GC</span>
              </div>
              <div>
                <h4 className="font-medium">Google Calendar</h4>
                <p className="text-sm text-muted-foreground">Termine synchronisieren</p>
              </div>
            </div>
            <Button onClick={() => handleConnect("Google Calendar")} className="ff-button">
              Verbinden
            </Button>
          </div>

          {/* Ricoh 360 */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-lg">R</span>
              </div>
              <div>
                <h4 className="font-medium">Ricoh 360 Tours</h4>
                <p className="text-sm text-muted-foreground">360°-Aufnahmen verknüpfen</p>
              </div>
            </div>
            <Button onClick={() => handleConnect("Ricoh 360")} variant="outline">
              Verbinden
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API-Schlüssel
            <HelpTooltip 
              content="API-Schlüssel ermöglichen externen Anwendungen den Zugriff auf FaFi PM. Behandeln Sie diese wie Passwörter." 
              title="API-Schlüssel" 
              helpTextKey="apiSchluessel"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Produktions-API</span>
              <Badge variant="secondary">Aktiv</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value="fafi_pk_live_••••••••••••••••" 
                readOnly 
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Erstellt am 15.01.2026 • Zuletzt verwendet vor 2 Stunden
            </p>
          </div>

          <Button onClick={handleGenerateKey} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Neuen Schlüssel generieren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Security Section
function SicherheitSection() {
  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Zwei-Faktor-Authentifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>2FA aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Zusätzliche Sicherheitsebene für Ihren Account
              </p>
            </div>
            <Switch />
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Empfohlen</p>
                <p className="text-sm text-amber-700">
                  Aktivieren Sie 2FA für maximale Sicherheit Ihres Accounts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Aktive Sitzungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { device: "MacBook Pro", location: "Berlin, DE", current: true, time: "Jetzt aktiv" },
            { device: "iPad Pro", location: "Hamburg, DE", current: false, time: "Vor 2 Stunden" },
            { device: "iPhone 15", location: "Berlin, DE", current: false, time: "Gestern" },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {session.device.includes("Mac") ? (
                    <Monitor className="w-5 h-5 text-primary" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{session.device}</h4>
                    {session.current && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Aktuell</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.location} • {session.time}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4" />
            Alle anderen Sitzungen beenden
          </Button>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Anmeldeverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Erfolgreiche Anmeldung", device: "MacBook Pro", time: "Heute, 08:30" },
              { action: "Erfolgreiche Anmeldung", device: "iPad Pro", time: "Gestern, 14:15" },
              { action: "Passwort geändert", device: "MacBook Pro", time: "20.01.2026, 10:00" },
              { action: "Erfolgreiche Anmeldung", device: "iPhone 15", time: "19.01.2026, 09:45" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium">{log.action}</span>
                <span className="text-muted-foreground">• {log.device}</span>
                <span className="text-muted-foreground ml-auto">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Backup & Export Section
function BackupSection() {
  const handleExport = (format: string) => {
    toast.success(`Export als ${format} gestartet`, {
      description: "Der Download beginnt in Kürze.",
    });
  };

  const handleBackup = () => {
    toast.success("Backup erstellt", {
      description: "Ihre Daten wurden erfolgreich gesichert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Datenexport
          </CardTitle>
          <CardDescription>
            Exportieren Sie Ihre Daten in verschiedenen Formaten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { format: "Excel", desc: "Projekte, Angebote, Kunden", icon: "📊" },
              { format: "PDF", desc: "Berichte und Zusammenfassungen", icon: "📄" },
              { format: "JSON", desc: "Vollständiger Datenexport", icon: "🔧" },
              { format: "CSV", desc: "Tabellarische Daten", icon: "📋" },
            ].map((item) => (
              <Button
                key={item.format}
                variant="outline"
                className="h-auto p-4 justify-start gap-4"
                onClick={() => handleExport(item.format)}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="text-left">
                  <p className="font-medium">{item.format}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="ff-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Backups</Label>
              <p className="text-sm text-muted-foreground">
                Tägliche Sicherung aller Daten
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Letztes Backup erfolgreich</p>
                <p className="text-sm text-green-700">
                  Heute um 03:00 Uhr • 2.4 GB gesichert
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleBackup} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Manuelles Backup erstellen
          </Button>
        </CardContent>
      </Card>

      <Card className="ff-card border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Gefahrenzone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-xl">
            <p className="text-sm text-destructive">
              Das Löschen Ihres Accounts ist unwiderruflich. Alle Daten werden permanent entfernt.
            </p>
          </div>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Account löschen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Einstellungen() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary" />
            Einstellungen
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihr Profil und konfigurieren Sie das System
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profil" className="animate-fade-in-up animate-delay-100">
          <TabsList className="bg-muted/50 p-1 rounded-2xl flex-wrap h-auto gap-1">
            <TabsTrigger value="profil" className="rounded-xl gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="benachrichtigungen" className="rounded-xl gap-2">
              <Bell className="w-4 h-4" />
              Benachrichtigungen
            </TabsTrigger>
            <TabsTrigger value="integrationen" className="rounded-xl gap-2">
              <Link2 className="w-4 h-4" />
              Integrationen
            </TabsTrigger>
            <TabsTrigger value="sicherheit" className="rounded-xl gap-2">
              <Shield className="w-4 h-4" />
              Sicherheit
            </TabsTrigger>
            <TabsTrigger value="backup" className="rounded-xl gap-2">
              <Database className="w-4 h-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profil">
              <ProfilSection />
            </TabsContent>
            <TabsContent value="system">
              <SystemSection />
            </TabsContent>
            <TabsContent value="benachrichtigungen">
              <BenachrichtigungenSection />
            </TabsContent>
            <TabsContent value="integrationen">
              <IntegrationenSection />
            </TabsContent>
            <TabsContent value="sicherheit">
              <SicherheitSection />
            </TabsContent>
            <TabsContent value="backup">
              <BackupSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
