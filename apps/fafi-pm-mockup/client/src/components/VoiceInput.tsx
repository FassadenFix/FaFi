/**
 * VoiceInput Component - Sprachsteuerung für Notizen und Schadensbeschreibungen
 * 
 * Design: Handwerker-optimiert mit großen Touch-Targets
 * Sprache: Du-Ansprache, klar und direkt
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  Square, 
  Check, 
  X, 
  RotateCcw,
  Camera,
  AlertTriangle,
  FileText,
  Send
} from 'lucide-react';

// Sprachbefehle die erkannt werden
const VOICE_COMMANDS = [
  { trigger: 'neuer schaden', action: 'new_damage', label: 'Neuer Schaden', icon: AlertTriangle },
  { trigger: 'foto machen', action: 'take_photo', label: 'Foto machen', icon: Camera },
  { trigger: 'speichern', action: 'save', label: 'Speichern', icon: Check },
  { trigger: 'abbrechen', action: 'cancel', label: 'Abbrechen', icon: X },
  { trigger: 'neue notiz', action: 'new_note', label: 'Neue Notiz', icon: FileText },
];

interface VoiceInputProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  placeholder?: string;
  className?: string;
}

// Wellenform-Animation Komponente
function WaveformAnimation({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-primary rounded-full transition-all duration-150 ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: isActive ? `${Math.random() * 32 + 16}px` : '8px',
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Haupt-Sprachsteuerungs-Button
export function VoiceInputButton({ 
  onTranscript, 
  onCommand,
  className = '' 
}: VoiceInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={`h-14 px-6 gap-3 text-lg font-semibold ${className}`}
      >
        <Mic className="h-6 w-6" />
        Spracheingabe
      </Button>

      <VoiceInputDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onTranscript={onTranscript}
        onCommand={onCommand}
      />
    </>
  );
}

// Kompakter Mikrofon-Button für Inline-Nutzung
export function VoiceInputMini({ 
  onTranscript,
  onCommand,
  className = '' 
}: VoiceInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon"
        className={`h-12 w-12 rounded-full ${className}`}
        title="Spracheingabe starten"
      >
        <Mic className="h-5 w-5" />
      </Button>

      <VoiceInputDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onTranscript={onTranscript}
        onCommand={onCommand}
      />
    </>
  );
}

// Vollbild-Spracheingabe Dialog
interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
}

export function VoiceInputDialog({ 
  open, 
  onOpenChange, 
  onTranscript,
  onCommand 
}: VoiceInputDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [detectedCommand, setDetectedCommand] = useState<string | null>(null);

  // Simulierte Spracherkennung (Demo-Modus)
  const simulateRecording = useCallback(() => {
    const demoTexts = [
      'Riss in der Fassade, etwa 50 Zentimeter lang, Nordseite oben links.',
      'Putz bröckelt ab, Fläche circa 2 Quadratmeter, muss vor Reinigung repariert werden.',
      'Fensterbank hat Wasserflecken, Reinigung mit Spezialreiniger empfohlen.',
      'Graffiti an der Ostseite entdeckt, Größe etwa 1 mal 2 Meter.',
      'Moos und Algen im Sockelbereich, Hochdruckreinigung notwendig.',
    ];
    
    const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
    const words = randomText.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setInterimTranscript(words.slice(0, currentIndex + 1).join(' '));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTranscript(randomText);
        setInterimTranscript('');
        setIsRecording(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setInterimTranscript('');
    setDetectedCommand(null);
    
    // Demo-Simulation starten
    const cleanup = simulateRecording();
    
    // Nach 5 Sekunden automatisch stoppen
    setTimeout(() => {
      cleanup();
    }, 5000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (interimTranscript) {
      setTranscript(interimTranscript);
      setInterimTranscript('');
    }
  };

  const handleConfirm = () => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
      toast.success('Text übernommen!');
    }
    onOpenChange(false);
    setTranscript('');
  };

  const handleCommand = (command: typeof VOICE_COMMANDS[0]) => {
    setDetectedCommand(command.action);
    if (onCommand) {
      onCommand(command.action);
    }
    toast.success(`Befehl "${command.label}" erkannt!`);
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setIsRecording(false);
      setTranscript('');
      setInterimTranscript('');
      setDetectedCommand(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mic className="h-6 w-6 text-primary" />
            Spracheingabe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Aufnahme-Status */}
          <div className="flex flex-col items-center gap-4">
            {/* Großer Mikrofon-Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isRecording ? (
                <Square className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>

            {/* Status-Text */}
            <p className="text-lg font-medium text-center">
              {isRecording ? (
                <span className="text-red-500 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Ich höre zu...
                </span>
              ) : transcript ? (
                'Fertig! Prüfe den Text.'
              ) : (
                'Tippe zum Starten'
              )}
            </p>

            {/* Wellenform während Aufnahme */}
            {isRecording && <WaveformAnimation isActive={isRecording} />}
          </div>

          {/* Live-Transkription */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <Textarea
                value={transcript || interimTranscript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Dein gesprochener Text erscheint hier..."
                className="min-h-[120px] text-lg border-0 bg-transparent resize-none focus-visible:ring-0"
                readOnly={isRecording}
              />
              {interimTranscript && !transcript && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  (wird noch erkannt...)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Schnellbefehle */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Oder sag einen Befehl:
            </p>
            <div className="flex flex-wrap gap-2">
              {VOICE_COMMANDS.slice(0, 4).map((cmd) => (
                <Badge
                  key={cmd.action}
                  variant={detectedCommand === cmd.action ? 'default' : 'outline'}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10"
                  onClick={() => handleCommand(cmd)}
                >
                  <cmd.icon className="h-4 w-4 mr-1.5" />
                  "{cmd.trigger}"
                </Badge>
              ))}
            </div>
          </div>

          {/* Aktions-Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetTranscript}
              disabled={!transcript && !interimTranscript}
              className="flex-1 h-12"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Neu starten
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!transcript}
              className="flex-1 h-12"
            >
              <Check className="h-5 w-5 mr-2" />
              Übernehmen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline-Spracheingabe für Textfelder
export function VoiceInputInline({
  value,
  onChange,
  placeholder = 'Beschreibung eingeben oder diktieren...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isRecording, setIsRecording] = useState(false);

  const handleTranscript = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
  };

  return (
    <div className={`relative ${className}`}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-14 min-h-[100px] text-base"
      />
      <VoiceInputMini
        onTranscript={handleTranscript}
        className="absolute right-2 bottom-2"
      />
    </div>
  );
}

// Demo-Komponente für Showcase
export function VoiceInputDemo() {
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  const handleTranscript = (text: string) => {
    setCurrentNote(text);
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case 'new_damage':
        toast.info('Schadensmeldung wird geöffnet...');
        break;
      case 'take_photo':
        toast.info('Kamera wird geöffnet...');
        break;
      case 'save':
        if (currentNote) {
          setNotes([...notes, currentNote]);
          setCurrentNote('');
          toast.success('Notiz gespeichert!');
        }
        break;
      case 'cancel':
        setCurrentNote('');
        toast.info('Eingabe abgebrochen');
        break;
    }
  };

  const saveNote = () => {
    if (currentNote) {
      setNotes([...notes, currentNote]);
      setCurrentNote('');
      toast.success('Notiz gespeichert!');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Spracheingabe Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tippe auf den Button und sprich deine Notiz oder Schadensbeschreibung. 
            Der Text wird automatisch erkannt.
          </p>

          <div className="flex gap-3">
            <VoiceInputButton
              onTranscript={handleTranscript}
              onCommand={handleCommand}
            />
          </div>

          {currentNote && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="font-medium mb-2">Erkannter Text:</p>
                <p className="text-lg">{currentNote}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={saveNote} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Als Notiz speichern
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentNote('')}
                  >
                    Verwerfen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {notes.length > 0 && (
            <div>
              <p className="font-medium mb-2">Gespeicherte Notizen:</p>
              <div className="space-y-2">
                {notes.map((note, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="p-3 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p>{note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VoiceInputButton;
