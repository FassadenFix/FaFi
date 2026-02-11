/**
 * PDF Download Service für FassadenFix Angebote
 * Verwendet jsPDF für echten PDF-Export im Corporate Design
 */

import jsPDF from "jspdf";
import "jspdf-autotable";

// FassadenFix CI-Farben
const FF_GREEN = "#77bc1f";
const FF_GRAY = "#4e5758";

// Logo URL (CDN)
const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/NdqxCZFIYPDyNxFo.png";

interface AngebotPosition {
  pos: number;
  menge: string;
  bezeichnung: string;
  einzelpreis: number;
  gesamt: number;
}

interface AngebotData {
  angebotNummer: string;
  datum: string;
  gueltigBis: string;
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  ffAnsprechpartner: string;
  ffEmail: string;
  ffTelefon: string;
  positionen: AngebotPosition[];
  nettobetrag: number;
  mwst: number;
  gesamtsumme: number;
  preisstaffel: { flaeche: string; preis: string }[];
  garantien: string[];
  zahlungsziel: string;
  leistungsort: string;
  sperrungen: string;
}

export async function generateAngebotPDF(data: AngebotData): Promise<void> {
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

  // Text-Logo als Fallback
  doc.setFontSize(24);
  doc.setTextColor(green.r, green.g, green.b);
  doc.text("FASSADENFIX", pageWidth / 2, yPos + 10, { align: "center" });
  yPos += 20;

  // Firmenzeile
  doc.setFontSize(8);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("FASSADENFIX - Immobiliengruppe Retzlaff oHG - An der Saalebahn 8a - 06118 Halle", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Kundenadresse
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(data.firma, margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.ansprechpartner, margin, yPos + 5);
  doc.text(data.strasse, margin, yPos + 10);
  doc.text(data.plz + " " + data.ort, margin, yPos + 15);

  // Angebotsdaten rechts
  const rightCol = pageWidth - margin - 50;
  doc.setFontSize(9);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Angebotsnummer", rightCol, yPos);
  doc.text("Datum", rightCol, yPos + 5);
  doc.text("Gueltig bis", rightCol, yPos + 10);
  doc.text("Ihr Ansprechpartner", rightCol, yPos + 15);

  doc.setTextColor(0, 0, 0);
  doc.text(data.angebotNummer, pageWidth - margin, yPos, { align: "right" });
  doc.text(data.datum, pageWidth - margin, yPos + 5, { align: "right" });
  doc.text(data.gueltigBis, pageWidth - margin, yPos + 10, { align: "right" });
  doc.text(data.ffAnsprechpartner, pageWidth - margin, yPos + 15, { align: "right" });

  yPos += 35;

  // Angebot-Titel
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Angebot Nr. " + data.angebotNummer, margin, yPos);
  yPos += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 80, yPos);
  yPos += 10;

  // Einleitungstext
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Vielen Dank fuer Ihr Interesse an unserer FassadenFix Systemreinigung!", margin, yPos);
  yPos += 10;

  // Positionstabelle
  const tableData = data.positionen.map((pos) => [
    pos.pos.toString(),
    pos.menge,
    pos.bezeichnung,
    pos.einzelpreis.toFixed(2) + " EUR",
    pos.gesamt.toFixed(2) + " EUR",
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [["Pos", "Menge", "Bezeichnung", "Einzelpreis", "Gesamt"]],
    body: tableData,
    theme: "plain",
    headStyles: { fillColor: [255, 255, 255], textColor: [green.r, green.g, green.b], fontStyle: "bold" },
    bodyStyles: { textColor: [gray.r, gray.g, gray.b] },
    columnStyles: { 0: { cellWidth: 15, textColor: [green.r, green.g, green.b] }, 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Summen
  const summenX = pageWidth - margin - 60;
  doc.setFontSize(10);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Nettobetrag", summenX, yPos);
  doc.text(data.nettobetrag.toFixed(2) + " EUR", pageWidth - margin, yPos, { align: "right" });
  doc.text("zzgl. 19% MwSt.", summenX, yPos + 6);
  doc.text(data.mwst.toFixed(2) + " EUR", pageWidth - margin, yPos + 6, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Gesamtsumme", summenX, yPos + 14);
  doc.text(data.gesamtsumme.toFixed(2) + " EUR", pageWidth - margin, yPos + 14, { align: "right" });

  yPos += 25;

  // Stoerer
  const stoererHeight = 40;
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(1);
  doc.rect(margin, yPos, pageWidth - 2 * margin, stoererHeight);
  doc.setFillColor(green.r, green.g, green.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Das FassadenFix Versprechen", margin + 5, yPos + 5.5);

  // Preisstaffel links
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray.r, gray.g, gray.b);
  let staffelY = yPos + 14;
  data.preisstaffel.forEach((item) => {
    doc.text(item.flaeche, margin + 5, staffelY);
    doc.setTextColor(green.r, green.g, green.b);
    doc.text(item.preis, margin + 40, staffelY);
    doc.setTextColor(gray.r, gray.g, gray.b);
    staffelY += 4;
  });

  // Garantien rechts
  const rightColX = pageWidth / 2 + 10;
  let garantieY = yPos + 14;
  data.garantien.forEach((garantie) => {
    doc.setTextColor(green.r, green.g, green.b);
    doc.text("*", rightColX, garantieY);
    doc.setTextColor(gray.r, gray.g, gray.b);
    doc.text(garantie, rightColX + 4, garantieY);
    garantieY += 4;
  });

  yPos += stoererHeight + 10;

  // Bedingungen
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Angebotsbedingungen", margin, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Gueltigkeit: " + data.gueltigBis + " | Zahlung: " + data.zahlungsziel + " | Leistungsort: " + data.leistungsort, margin, yPos);
  yPos += 4;
  doc.text("Sperrungen: " + data.sperrungen + ". Es gelten unsere AGB (www.fassadenfix.de/agb).", margin, yPos);

  // Gruene Linie
  yPos += 8;
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(2);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("FASSADENFIX | Immobiliengruppe Retzlaff oHG | An der Saalebahn 8a | 06118 Halle | Tel: 0345 218392 35 | www.fassadenfix.de", pageWidth / 2, footerY, { align: "center" });

  // Gruene Linie unten
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(3);
  doc.line(0, pageHeight - 3, pageWidth, pageHeight - 3);

  // Speichern
  const filename = "Angebot-" + data.angebotNummer + "-" + data.firma.replace(/\\s+/g, "_") + ".pdf";
  doc.save(filename);
}

export type { AngebotData, AngebotPosition };
