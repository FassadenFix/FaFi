/**
 * PDF Download Service für FassadenFix Garantiezertifikate
 * Verwendet jsPDF für echten PDF-Export im Corporate Design
 */

import jsPDF from "jspdf";

// FassadenFix CI-Farben
const FF_GREEN = "#77bc1f";
const FF_GRAY = "#4e5758";

interface GarantieData {
  zertifikatNummer: string;
  garantieNummer: string;
  garantieTyp: string;
  ausstellungsDatum: string;
  startDatum: string;
  endDatum: string;
  laufzeitJahre: number;
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  objektAdresse: string;
  objektBeschreibung: string;
  auftragNummer?: string;
  projektName?: string;
  leistungen: string[];
  bedingungen: string[];
}

export async function generateGarantiePDF(data: GarantieData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  };

  const green = hexToRgb(FF_GREEN);
  const gray = hexToRgb(FF_GRAY);

  // Dekorativer Rahmen
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Text-Logo
  yPos = 25;
  doc.setFontSize(28);
  doc.setTextColor(green.r, green.g, green.b);
  doc.text("FASSADENFIX", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // Untertitel
  doc.setFontSize(10);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Ihr sicherer Weg zur sauberen Fassade", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Zertifikat-Titel
  const garantieTitel = data.garantieTyp === "algenfrei_garantie" ? "Algenfrei-Garantie" :
                        data.garantieTyp === "ergebnisgarantie" ? "Ergebnisgarantie" :
                        data.garantieTyp === "materialgarantie" ? "Materialgarantie" : "Garantie";
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("GARANTIEZERTIFIKAT", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(16);
  doc.setTextColor(green.r, green.g, green.b);
  doc.text(garantieTitel, pageWidth / 2, yPos, { align: "center" });
  yPos += 5;
  
  // Dekorative Linie
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
  yPos += 15;

  // Zertifikat-Nummer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Zertifikat-Nr.: " + data.zertifikatNummer, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Haupttext
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Hiermit bescheinigen wir, dass fuer das Objekt", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  // Objekt-Box
  const objektBoxY = yPos;
  const objektBoxHeight = 25;
  doc.setFillColor(245, 250, 240);
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 20, objektBoxY, pageWidth - 2 * margin - 40, objektBoxHeight, 3, 3, "FD");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(data.objektAdresse, pageWidth / 2, objektBoxY + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text(data.objektBeschreibung, pageWidth / 2, objektBoxY + 18, { align: "center" });
  
  yPos = objektBoxY + objektBoxHeight + 12;

  // Garantie-Details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("eine " + data.laufzeitJahre + "-jaehrige " + garantieTitel + " besteht.", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Garantiezeitraum Box
  const zeitraumBoxY = yPos;
  const zeitraumBoxHeight = 20;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(1);
  doc.roundedRect(margin + 30, zeitraumBoxY, pageWidth - 2 * margin - 60, zeitraumBoxHeight, 3, 3, "D");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(green.r, green.g, green.b);
  doc.text("Garantiezeitraum: " + data.startDatum + " bis " + data.endDatum, pageWidth / 2, zeitraumBoxY + 12, { align: "center" });
  
  yPos = zeitraumBoxY + zeitraumBoxHeight + 15;

  // Garantieleistungen
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Garantieleistungen:", margin + 20, yPos);
  yPos += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray.r, gray.g, gray.b);
  data.leistungen.forEach((leistung) => {
    doc.setTextColor(green.r, green.g, green.b);
    doc.text("✓", margin + 22, yPos);
    doc.setTextColor(gray.r, gray.g, gray.b);
    doc.text(leistung, margin + 28, yPos);
    yPos += 5;
  });
  
  yPos += 10;

  // Garantiebedingungen
  doc.setFontSize(8);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Garantiebedingungen:", margin + 20, yPos);
  yPos += 4;
  data.bedingungen.forEach((bedingung) => {
    doc.text("• " + bedingung, margin + 22, yPos);
    yPos += 4;
  });

  // Kunde
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Garantienehmer:", margin + 20, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text(data.firma, margin + 20, yPos);
  yPos += 4;
  doc.text(data.ansprechpartner, margin + 20, yPos);
  yPos += 4;
  doc.text(data.strasse + ", " + data.plz + " " + data.ort, margin + 20, yPos);

  // Unterschrift-Bereich
  const signatureY = pageHeight - 55;
  doc.setDrawColor(gray.r, gray.g, gray.b);
  doc.setLineWidth(0.3);
  doc.line(margin + 20, signatureY, margin + 80, signatureY);
  doc.line(pageWidth - margin - 80, signatureY, pageWidth - margin - 20, signatureY);
  
  doc.setFontSize(8);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Ort, Datum", margin + 50, signatureY + 5, { align: "center" });
  doc.text("Unterschrift / Stempel", pageWidth - margin - 50, signatureY + 5, { align: "center" });

  // Ausstellungsdatum
  doc.setFontSize(9);
  doc.text("Halle, " + data.ausstellungsDatum, margin + 50, signatureY - 5, { align: "center" });

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(7);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("FASSADENFIX | Immobiliengruppe Retzlaff oHG | An der Saalebahn 8a | 06118 Halle | Tel: 0345 218392 35 | www.fassadenfix.de", pageWidth / 2, footerY, { align: "center" });

  // Speichern
  const filename = "Garantiezertifikat-" + data.zertifikatNummer + ".pdf";
  doc.save(filename);
}

export type { GarantieData };
