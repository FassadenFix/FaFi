/**
 * Sprachsteuerung Demo Page
 * 
 * Design: Handwerker-optimiert, große Touch-Targets
 * Sprache: Du-Ansprache
 */

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  VoiceInputButton, 
  VoiceInputMini, 
  VoiceInputInline,
  VoiceInputDemo 
} from '@/components/VoiceInput';
import { 
  Mic, 
  MessageSquare, 
  AlertTriangle, 
  Camera, 
  Check, 
  X,
  FileText,
  Lightbulb
} from 'lucide-react';

const VOICE_COMMANDS = [
  { trigger: 'Neuer Schaden', description: 'Öffnet die Schadensmeldung', icon: AlertTriangle },
  { trigger: 'Foto machen', description: 'Startet die Kamera', icon: Camera },
  { trigger: 'Speichern', description: 'Speichert die aktuelle Eingabe', icon: Check },
  { trigger: 'Abbrechen', description: 'Verwirft die Eingabe', icon: X },
  { trigger: 'Neue Notiz', description: 'Erstellt eine neue Notiz', icon: FileText },
];

export default function Sprachsteuerung() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic className="h-8 w-8 text-primary" />
            Spracheingabe
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Diktiere Notizen und Schadensbeschreibungen – schneller als Tippen!
          </p>
        </div>

        {/* Hauptbereich */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Demo-Bereich */}
          <div className="lg:col-span-2">
            <VoiceInputDemo />
          </div>

          {/* Sprachbefehle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sprachbefehle
              </CardTitle>
              <CardDescription>
                Diese Befehle werden automatisch erkannt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VOICE_COMMANDS.map((cmd) => (
                  <div 
                    key={cmd.trigger}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <cmd.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">"{cmd.trigger}"</p>
                      <p className="text-sm text-muted-foreground">{cmd.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Tipps für gute Erkennung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium">Sprich deutlich</p>
                    <p className="text-sm text-muted-foreground">
                      Normale Lautstärke, nicht zu schnell
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium">Halte das Gerät nah</p>
                    <p className="text-sm text-muted-foreground">
                      Etwa 30 cm Abstand zum Mikrofon
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium">Vermeide Hintergrundlärm</p>
                    <p className="text-sm text-muted-foreground">
                      Maschinen kurz ausschalten wenn möglich
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium">Korrigiere nachher</p>
                    <p className="text-sm text-muted-foreground">
                      Du kannst den Text vor dem Speichern bearbeiten
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inline-Beispiel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Beispiel: Schadensbeschreibung mit Spracheingabe</CardTitle>
              <CardDescription>
                Tippe auf das Mikrofon-Symbol rechts unten im Textfeld
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceInputInline
                value=""
                onChange={() => {}}
                placeholder="Beschreibe den Schaden hier oder nutze die Spracheingabe..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Verfügbarkeit */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Wo kannst du die Spracheingabe nutzen?</h3>
                <p className="text-muted-foreground mt-1">
                  Die Spracheingabe ist überall verfügbar, wo du Text eingeben kannst:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge>Baustellenlogbuch</Badge>
                  <Badge>Schadensmeldung</Badge>
                  <Badge>Objektaufnahme</Badge>
                  <Badge>Notizen</Badge>
                  <Badge>Projektbeschreibungen</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
