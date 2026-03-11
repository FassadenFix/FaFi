/**
 * PDF Download Service für FassadenFix Rechnungen
 * Verwendet jsPDF für echten PDF-Export im Corporate Design
 */

import jsPDF from "jspdf";
import "jspdf-autotable";

// FassadenFix CI-Farben
const FF_GREEN = "#77bc1f";
const FF_GRAY = "#4e5758";

interface RechnungPosition {
  pos: number;
  menge: string;
  bezeichnung: string;
  einzelpreis: number;
  gesamt: number;
}

interface RechnungData {
  rechnungNummer: string;
  auftragNummer?: string;
  datum: string;
  faelligBis: string;
  rechnungsTyp: string;
  firma: string;
  ansprechpartner: string;
  strasse: string;
  plz: string;
  ort: string;
  ffAnsprechpartner: string;
  ffEmail: string;
  ffTelefon: string;
  positionen: RechnungPosition[];
  nettobetrag: number;
  mwst: number;
  gesamtsumme: number;
  zahlungsziel: string;
  bankverbindung: {
    bank: string;
    iban: string;
    bic: string;
  };
  leistungszeitraum?: string;
  projektName?: string;
}

export async function generateRechnungPDF(data: RechnungData): Promise<void> {
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

  // Text-Logo
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

  // Rechnungsdaten rechts
  const rightCol = pageWidth - margin - 50;
  doc.setFontSize(9);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Rechnungsnummer", rightCol, yPos);
  doc.text("Rechnungsdatum", rightCol, yPos + 5);
  doc.text("Faellig bis", rightCol, yPos + 10);
  doc.text("Ihr Ansprechpartner", rightCol, yPos + 15);
  if (data.auftragNummer) {
    doc.text("Auftragsnummer", rightCol, yPos + 20);
  }

  doc.setTextColor(0, 0, 0);
  doc.text(data.rechnungNummer, pageWidth - margin, yPos, { align: "right" });
  doc.text(data.datum, pageWidth - margin, yPos + 5, { align: "right" });
  doc.text(data.faelligBis, pageWidth - margin, yPos + 10, { align: "right" });
  doc.text(data.ffAnsprechpartner, pageWidth - margin, yPos + 15, { align: "right" });
  if (data.auftragNummer) {
    doc.text(data.auftragNummer, pageWidth - margin, yPos + 20, { align: "right" });
  }

  yPos += 35;

  // Rechnungs-Titel
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const rechnungsTitel = data.rechnungsTyp === "abschlagsrechnung" ? "Abschlagsrechnung" :
                         data.rechnungsTyp === "schlussrechnung" ? "Schlussrechnung" :
                         data.rechnungsTyp === "teilrechnung" ? "Teilrechnung" :
                         data.rechnungsTyp === "gutschrift" ? "Gutschrift" : "Rechnung";
  doc.text(rechnungsTitel + " Nr. " + data.rechnungNummer, margin, yPos);
  yPos += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 100, yPos);
  yPos += 10;

  // Projekt-Info wenn vorhanden
  if (data.projektName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray.r, gray.g, gray.b);
    doc.text("Projekt: " + data.projektName, margin, yPos);
    yPos += 5;
  }

  // Leistungszeitraum wenn vorhanden
  if (data.leistungszeitraum) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray.r, gray.g, gray.b);
    doc.text("Leistungszeitraum: " + data.leistungszeitraum, margin, yPos);
    yPos += 5;
  }

  yPos += 5;

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
  
  // Trennlinie
  yPos += 10;
  doc.setDrawColor(gray.r, gray.g, gray.b);
  doc.setLineWidth(0.3);
  doc.line(summenX, yPos, pageWidth - margin, yPos);
  yPos += 4;
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text("Rechnungsbetrag", summenX, yPos);
  doc.text(data.gesamtsumme.toFixed(2) + " EUR", pageWidth - margin, yPos, { align: "right" });

  yPos += 15;

  // Zahlungshinweis Box
  const zahlungsBoxHeight = 30;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, zahlungsBoxHeight, "F");
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, pageWidth - 2 * margin, zahlungsBoxHeight);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(green.r, green.g, green.b);
  doc.text("Zahlungshinweis", margin + 5, yPos + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("Bitte ueberweisen Sie den Rechnungsbetrag bis zum " + data.faelligBis + " auf folgendes Konto:", margin + 5, yPos + 14);
  doc.text(data.bankverbindung.bank + " | IBAN: " + data.bankverbindung.iban + " | BIC: " + data.bankverbindung.bic, margin + 5, yPos + 20);
  doc.text("Verwendungszweck: " + data.rechnungNummer, margin + 5, yPos + 26);

  yPos += zahlungsBoxHeight + 15;

  // Grüne Linie
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(2);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setTextColor(gray.r, gray.g, gray.b);
  doc.text("FASSADENFIX | Immobiliengruppe Retzlaff oHG | An der Saalebahn 8a | 06118 Halle | Tel: 0345 218392 35 | www.fassadenfix.de", pageWidth / 2, footerY, { align: "center" });

  // Grüne Linie unten
  doc.setDrawColor(green.r, green.g, green.b);
  doc.setLineWidth(3);
  doc.line(0, pageHeight - 3, pageWidth, pageHeight - 3);

  // Speichern
  const filename = "Rechnung-" + data.rechnungNummer + "-" + data.firma.replace(/\s+/g, "_") + ".pdf";
  doc.save(filename);
}

export type { RechnungData, RechnungPosition };
