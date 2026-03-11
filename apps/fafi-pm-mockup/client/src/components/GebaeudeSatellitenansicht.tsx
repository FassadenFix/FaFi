/**
 * Gebäude-Satellitenansicht Komponente
 * Interaktive Gebäudeansicht mit Satellitenbildern zur Seitenauswahl
 * Nutzt Google Maps für Adressvalidierung und Visualisierung
 * 
 * Features:
 * - Satellitenbild des Gebäudes
 * - Adressvalidierung
 * - Interaktive Seitenauswahl durch Klick auf Gebäudeseiten
 * - Vogelperspektive / Schrägansicht
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Building2,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { MapView } from "@/components/Map";

// Gebäudeseiten
export type GebaeudeSeiteName = "frontseite" | "rueckseite" | "linker_giebel" | "rechter_giebel";

export interface GebaeudeSeiteDaten {
  name: GebaeudeSeiteName;
  label: string;
  ausgewaehlt: boolean;
  reinigungsfaehig: boolean;
  flaeche: number;
}

interface GebaeudeSatellitenansichtProps {
  adresse: string;
  onAdresseValidiert?: (validiert: boolean, koordinaten?: { lat: number; lng: number }) => void;
  seiten: GebaeudeSeiteDaten[];
  onSeitenChange: (seiten: GebaeudeSeiteDaten[]) => void;
  readOnly?: boolean;
}

const SEITEN_CONFIG: Record<GebaeudeSeiteName, { label: string; position: { top: string; left: string; rotation: number } }> = {
  frontseite: { label: "Frontseite", position: { top: "80%", left: "50%", rotation: 0 } },
  rueckseite: { label: "Rückseite", position: { top: "20%", left: "50%", rotation: 180 } },
  linker_giebel: { label: "Linker Giebel", position: { top: "50%", left: "15%", rotation: -90 } },
  rechter_giebel: { label: "Rechter Giebel", position: { top: "50%", left: "85%", rotation: 90 } },
};

export function GebaeudeSatellitenansicht({
  adresse,
  onAdresseValidiert,
  seiten,
  onSeitenChange,
  readOnly = false,
}: GebaeudeSatellitenansichtProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [koordinaten, setKoordinaten] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [heading, setHeading] = useState(0);
  const [zoom, setZoom] = useState(19);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Adresse validieren
  const validateAdresse = useCallback(async () => {
    if (!adresse.trim() || !geocoderRef.current) return;
    
    setIsValidating(true);
    setValidationError(null);
    
    try {
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode({ address: adresse + ", Deutschland" }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error("Adresse nicht gefunden"));
          }
        });
      });
      
      const location = result[0].geometry.location;
      const coords = { lat: location.lat(), lng: location.lng() };
      
      setKoordinaten(coords);
      setIsValidated(true);
      onAdresseValidiert?.(true, coords);
      
      // Karte auf Adresse zentrieren
      if (mapRef.current) {
        mapRef.current.setCenter(coords);
        mapRef.current.setZoom(zoom);
      }
      
      toast.success("Adresse validiert", {
        description: result[0].formatted_address,
      });
    } catch (error) {
      setValidationError("Adresse konnte nicht gefunden werden");
      setIsValidated(false);
      onAdresseValidiert?.(false);
      toast.error("Adresse nicht gefunden", {
        description: "Bitte überprüfe die Eingabe",
      });
    } finally {
      setIsValidating(false);
    }
  }, [adresse, zoom, onAdresseValidiert]);

  // Map initialisieren
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    setMapReady(true);
    
    // Satellitenmodus aktivieren
    map.setMapTypeId("satellite");
    map.setTilt(45); // Schrägansicht
    
    // Wenn Adresse vorhanden, validieren
    if (adresse.trim()) {
      setTimeout(validateAdresse, 500);
    }
  }, [adresse, validateAdresse]);

  // Seite auswählen/abwählen
  const toggleSeite = useCallback((name: GebaeudeSeiteName) => {
    if (readOnly) return;
    
    const updatedSeiten = seiten.map(s => 
      s.name === name ? { ...s, ausgewaehlt: !s.ausgewaehlt } : s
    );
    onSeitenChange(updatedSeiten);
  }, [seiten, onSeitenChange, readOnly]);

  // Karte drehen
  const rotateMap = useCallback((degrees: number) => {
    const newHeading = (heading + degrees) % 360;
    setHeading(newHeading);
    if (mapRef.current) {
      mapRef.current.setHeading(newHeading);
    }
  }, [heading]);

  return (
    <div className="space-y-4">
      {/* Adress-Validierung */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Adresse & Standort
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={adresse}
                readOnly
                className="bg-muted"
              />
            </div>
            <Button
              onClick={validateAdresse}
              disabled={isValidating || !adresse.trim() || !mapReady}
              variant={isValidated ? "outline" : "default"}
              className={isValidated ? "" : "bg-[#77bc1f] hover:bg-[#77bc1f]/90"}
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isValidated ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  Validiert
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-1" />
                  Validieren
                </>
              )}
            </Button>
          </div>
          
          {validationError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {validationError}
            </div>
          )}
          
          {koordinaten && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono">
                {koordinaten.lat.toFixed(6)}, {koordinaten.lng.toFixed(6)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Karten-Steuerung */}
      <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => rotateMap(-45)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => rotateMap(45)}>
            <RotateCcw className="w-4 h-4 scale-x-[-1]" />
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            <Compass className="w-3 h-3 inline mr-1" />
            {heading}°
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => {
            const newZoom = Math.max(15, zoom - 1);
            setZoom(newZoom);
            mapRef.current?.setZoom(newZoom);
          }}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-8 text-center">{zoom}</span>
          <Button variant="ghost" size="icon" onClick={() => {
            const newZoom = Math.min(21, zoom + 1);
            setZoom(newZoom);
            mapRef.current?.setZoom(newZoom);
          }}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Karte mit Gebäudeseiten-Overlay */}
      <div className="relative">
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapView onMapReady={handleMapReady} />
        </div>
        
        {/* Gebäudeseiten-Overlay (nur wenn validiert) */}
        {isValidated && (
          <div className="absolute inset-0 pointer-events-none">
            {seiten.map((seite) => {
              const config = SEITEN_CONFIG[seite.name];
              const isSelected = seite.ausgewaehlt;
              const isReinigungsfaehig = seite.reinigungsfaehig;
              
              return (
                <div
                  key={seite.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{ top: config.position.top, left: config.position.left }}
                >
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSeite(seite.name)}
                    disabled={readOnly || !isReinigungsfaehig}
                    className={
                      isSelected 
                        ? "bg-[#77bc1f] hover:bg-[#77bc1f]/90 shadow-lg" 
                        : isReinigungsfaehig 
                          ? "bg-white/90 hover:bg-white shadow-lg" 
                          : "bg-gray-300/90 opacity-50 cursor-not-allowed"
                    }
                    style={{ transform: "rotate(" + config.position.rotation + "deg)" }}
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    {config.label}
                    {seite.flaeche > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {seite.flaeche} m²
                      </Badge>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Hinweis wenn nicht validiert */}
        {!isValidated && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <div className="bg-white/95 p-4 rounded-lg text-center max-w-xs">
              <Eye className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Adresse validieren</p>
              <p className="text-xs text-muted-foreground mt-1">
                Validiere die Adresse, um das Gebäude auf der Karte anzuzeigen und Seiten auszuwählen.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Seiten-Übersicht */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Gebäudeseiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {seiten.map((seite) => {
              const config = SEITEN_CONFIG[seite.name];
              
              return (
                <div
                  key={seite.name}
                  className={"flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors " + 
                    (seite.ausgewaehlt 
                      ? "bg-[#77bc1f]/10 border-[#77bc1f]" 
                      : seite.reinigungsfaehig 
                        ? "hover:bg-muted/50" 
                        : "opacity-50 cursor-not-allowed bg-muted"
                    )
                  }
                  onClick={() => seite.reinigungsfaehig && toggleSeite(seite.name)}
                >
                  <div className="flex items-center gap-2">
                    <div className={"w-3 h-3 rounded-full " + (seite.ausgewaehlt ? "bg-[#77bc1f]" : "bg-gray-300")} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {seite.flaeche > 0 && (
                      <span className="text-xs text-muted-foreground">{seite.flaeche} m²</span>
                    )}
                    {!seite.reinigungsfaehig && (
                      <Badge variant="outline" className="text-xs">Nicht reinigbar</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GebaeudeSatellitenansicht;
