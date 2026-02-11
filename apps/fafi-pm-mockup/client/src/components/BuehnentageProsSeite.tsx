/**
 * Bühnentage pro Seite Komponente
 * Berechnet und zeigt Bühnentage und Kosten pro Fassadenseite an
 * Basierend auf ff-buehnenrechner Skill: 500 m²/Tag Leistung
 * 
 * Features:
 * - Automatische Berechnung pro Seite
 * - Gesamtübersicht mit Summen
 * - Kostenaufschlüsselung
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Euro,
  Ruler,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";

// Konstanten aus ff-buehnenrechner
const LEISTUNG_PRO_TAG = 500; // m² pro Tag
const BUEHNE_KOSTEN_PRO_TAG = 350; // € pro Tag

interface SeiteKalkulation {
  name: string;
  label: string;
  flaeche: number;
  buehnenTage: number;
  kosten: number;
  anteilProzent: number;
}

interface BuehnentageProsSeiteProps {
  seiten: {
    name: string;
    label: string;
    flaeche: number;
    selected: boolean;
  }[];
  showDetails?: boolean;
}

export function BuehnentageProsSeite({
  seiten,
  showDetails = true,
}: BuehnentageProsSeiteProps) {
  // Kalkulation pro Seite
  const kalkulationen = useMemo((): SeiteKalkulation[] => {
    const selectedSeiten = seiten.filter(s => s.selected && s.flaeche > 0);
    const gesamtflaeche = selectedSeiten.reduce((sum, s) => sum + s.flaeche, 0);
    
    return selectedSeiten.map(seite => {
      const buehnenTage = Math.ceil(seite.flaeche / LEISTUNG_PRO_TAG);
      const kosten = buehnenTage * BUEHNE_KOSTEN_PRO_TAG;
      const anteilProzent = gesamtflaeche > 0 ? (seite.flaeche / gesamtflaeche) * 100 : 0;
      
      return {
        name: seite.name,
        label: seite.label,
        flaeche: seite.flaeche,
        buehnenTage,
        kosten,
        anteilProzent,
      };
    });
  }, [seiten]);

  // Gesamtwerte
  const gesamt = useMemo(() => {
    return kalkulationen.reduce(
      (acc, k) => ({
        flaeche: acc.flaeche + k.flaeche,
        buehnenTage: acc.buehnenTage + k.buehnenTage,
        kosten: acc.kosten + k.kosten,
      }),
      { flaeche: 0, buehnenTage: 0, kosten: 0 }
    );
  }, [kalkulationen]);

  if (kalkulationen.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Keine Fassadenseiten ausgewählt</p>
          <p className="text-xs mt-1">Wähle mindestens eine Seite mit Flächenangabe aus</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Übersicht Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Ruler className="w-3 h-3" />
              Gesamtfläche
            </div>
            <div className="text-2xl font-bold">{gesamt.flaeche.toLocaleString("de-DE")} m²</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Bühnentage gesamt
            </div>
            <div className="text-2xl font-bold text-[#77bc1f]">{gesamt.buehnenTage} Tage</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Euro className="w-3 h-3" />
              Bühnenkosten
            </div>
            <div className="text-2xl font-bold">{gesamt.kosten.toLocaleString("de-DE")} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Detail-Tabelle */}
      {showDetails && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Aufschlüsselung pro Seite
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seite</TableHead>
                  <TableHead className="text-right">Fläche</TableHead>
                  <TableHead className="text-right">Tage</TableHead>
                  <TableHead className="text-right">Kosten</TableHead>
                  <TableHead className="w-[100px]">Anteil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kalkulationen.map((kalk) => (
                  <TableRow key={kalk.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#77bc1f]" />
                        {kalk.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {kalk.flaeche.toLocaleString("de-DE")} m²
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{kalk.buehnenTage} {kalk.buehnenTage === 1 ? "Tag" : "Tage"}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {kalk.kosten.toLocaleString("de-DE")} €
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={kalk.anteilProzent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {kalk.anteilProzent.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Gesamt</TableCell>
                  <TableCell className="text-right font-bold">
                    {gesamt.flaeche.toLocaleString("de-DE")} m²
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-[#77bc1f]">{gesamt.buehnenTage} Tage</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {gesamt.kosten.toLocaleString("de-DE")} €
                  </TableCell>
                  <TableCell>
                    <Progress value={100} className="h-2" />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            
            {/* Hinweis */}
            <div className="mt-3 p-2 bg-muted rounded-lg text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              Berechnung: {LEISTUNG_PRO_TAG} m²/Tag Reinigungsleistung × {BUEHNE_KOSTEN_PRO_TAG} €/Tag Bühnenmiete
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kompakte Ansicht für Wizard */}
      {!showDetails && (
        <div className="space-y-2">
          {kalkulationen.map((kalk) => (
            <div
              key={kalk.name}
              className="flex items-center justify-between p-2 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#77bc1f]" />
                <span className="text-sm font-medium">{kalk.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({kalk.flaeche.toLocaleString("de-DE")} m²)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {kalk.buehnenTage} {kalk.buehnenTage === 1 ? "Tag" : "Tage"}
                </Badge>
                <span className="text-sm font-medium">
                  {kalk.kosten.toLocaleString("de-DE")} €
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuehnentageProsSeite;
