/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * 
 * GEBÄUDE-VISUALISIERUNG
 * Interaktive Ansicht mit klickbaren Gebäudeseiten
 * Touch-optimiert für iPad
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type SeiteKey = "nord" | "ost" | "sued" | "west" | "dach" | "sockel";

interface SeiteStatus {
  key: SeiteKey;
  label: string;
  status: "offen" | "in-arbeit" | "fertig";
}

interface BuildingVisualizationProps {
  seiten: SeiteStatus[];
  activeSeite: SeiteKey | null;
  onSeiteClick: (seite: SeiteKey) => void;
}

export function BuildingVisualization({
  seiten,
  activeSeite,
  onSeiteClick,
}: BuildingVisualizationProps) {
  const [hoveredSeite, setHoveredSeite] = useState<SeiteKey | null>(null);

  const getStatusColor = (status: "offen" | "in-arbeit" | "fertig") => {
    switch (status) {
      case "fertig":
        return "#77bc1f"; // FassadenFix Grün
      case "in-arbeit":
        return "#f59e0b"; // Amber
      case "offen":
        return "#9ca3af"; // Grau
    }
  };

  const getStatusIcon = (status: "offen" | "in-arbeit" | "fertig") => {
    switch (status) {
      case "fertig":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in-arbeit":
        return <Clock className="w-4 h-4" />;
      case "offen":
        return <Circle className="w-4 h-4" />;
    }
  };

  const getSeiteStatus = (key: SeiteKey) => {
    return seiten.find((s) => s.key === key)?.status || "offen";
  };

  const isActive = (key: SeiteKey) => activeSeite === key;
  const isHovered = (key: SeiteKey) => hoveredSeite === key;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Legende */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#77bc1f]" />
          <span>Fertig</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>In Arbeit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Offen</span>
        </div>
      </div>

      {/* 3D-isometrische Gebäudeansicht */}
      <svg
        viewBox="0 0 300 280"
        className="w-full h-auto"
        style={{ touchAction: "manipulation" }}
      >
        {/* Dach */}
        <g
          onClick={() => onSeiteClick("dach")}
          onMouseEnter={() => setHoveredSeite("dach")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
          style={{ 
            transform: isActive("dach") || isHovered("dach") ? "translateY(-4px)" : "none",
            transformOrigin: "center"
          }}
        >
          <polygon
            points="150,10 250,50 150,90 50,50"
            fill={getStatusColor(getSeiteStatus("dach"))}
            fillOpacity={isActive("dach") ? 1 : 0.7}
            stroke={isActive("dach") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("dach") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="150"
            y="55"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            className="pointer-events-none"
          >
            DACH
          </text>
        </g>

        {/* Nordseite (hinten links) */}
        <g
          onClick={() => onSeiteClick("nord")}
          onMouseEnter={() => setHoveredSeite("nord")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
        >
          <polygon
            points="50,50 150,90 150,200 50,160"
            fill={getStatusColor(getSeiteStatus("nord"))}
            fillOpacity={isActive("nord") ? 1 : 0.6}
            stroke={isActive("nord") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("nord") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="90"
            y="130"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="bold"
            className="pointer-events-none"
            transform="rotate(-25, 90, 130)"
          >
            NORD
          </text>
        </g>

        {/* Ostseite (hinten rechts) */}
        <g
          onClick={() => onSeiteClick("ost")}
          onMouseEnter={() => setHoveredSeite("ost")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
        >
          <polygon
            points="150,90 250,50 250,160 150,200"
            fill={getStatusColor(getSeiteStatus("ost"))}
            fillOpacity={isActive("ost") ? 1 : 0.6}
            stroke={isActive("ost") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("ost") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="210"
            y="130"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="bold"
            className="pointer-events-none"
            transform="rotate(25, 210, 130)"
          >
            OST
          </text>
        </g>

        {/* Südseite (vorne rechts) - prominent */}
        <g
          onClick={() => onSeiteClick("sued")}
          onMouseEnter={() => setHoveredSeite("sued")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
        >
          <polygon
            points="150,200 250,160 250,230 150,270"
            fill={getStatusColor(getSeiteStatus("sued"))}
            fillOpacity={isActive("sued") ? 1 : 0.8}
            stroke={isActive("sued") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("sued") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="200"
            y="215"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            className="pointer-events-none"
            transform="rotate(25, 200, 215)"
          >
            SÜD
          </text>
        </g>

        {/* Westseite (vorne links) - prominent */}
        <g
          onClick={() => onSeiteClick("west")}
          onMouseEnter={() => setHoveredSeite("west")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
        >
          <polygon
            points="50,160 150,200 150,270 50,230"
            fill={getStatusColor(getSeiteStatus("west"))}
            fillOpacity={isActive("west") ? 1 : 0.8}
            stroke={isActive("west") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("west") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="100"
            y="215"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            className="pointer-events-none"
            transform="rotate(-25, 100, 215)"
          >
            WEST
          </text>
        </g>

        {/* Sockel (Basis) */}
        <g
          onClick={() => onSeiteClick("sockel")}
          onMouseEnter={() => setHoveredSeite("sockel")}
          onMouseLeave={() => setHoveredSeite(null)}
          className="cursor-pointer transition-all duration-200"
        >
          <polygon
            points="50,230 150,270 250,230 150,190"
            fill={getStatusColor(getSeiteStatus("sockel"))}
            fillOpacity={isActive("sockel") ? 1 : 0.5}
            stroke={isActive("sockel") ? "#4e5758" : "#fff"}
            strokeWidth={isActive("sockel") ? 3 : 1}
            className="transition-all duration-200"
          />
          <text
            x="150"
            y="235"
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
            className="pointer-events-none"
          >
            SOCKEL
          </text>
        </g>
      </svg>

      {/* Status-Übersicht als Liste */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {seiten.map((seite) => (
          <button
            key={seite.key}
            onClick={() => onSeiteClick(seite.key)}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-sm transition-all",
              "border-2",
              isActive(seite.key)
                ? "border-primary bg-primary/10 font-medium"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span style={{ color: getStatusColor(seite.status) }}>
              {getStatusIcon(seite.status)}
            </span>
            <span className="truncate">{seite.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BuildingVisualization;
