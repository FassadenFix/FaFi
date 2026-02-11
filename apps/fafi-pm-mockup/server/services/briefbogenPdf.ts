/**
 * PDF-Generierung mit echtem FassadenFix Briefbogen als Hintergrund
 * 
 * Intention: Professionelle, druckfertige PDFs die exakt dem Corporate Design
 * entsprechen, weil der echte Briefbogen als Hintergrund-Layer dient.
 * 
 * Technologie: pdf-lib + @pdf-lib/fontkit für Server-seitige Generierung
 * Fonts: Raleway (Regular, SemiBold, Bold) – eingebettet im PDF
 * Briefbogen: FF_Briefbogen.pdf wird als Hintergrund-Seite eingebettet
 */

import { PDFDocument, PDFFont, PDFPage, PDFEmbeddedPage, rgb, type Color } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ============================================
// KONSTANTEN
// ============================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** CI-Farben als pdf-lib RGB */
const CI = {
  green: rgb(0.467, 0.737, 0.122),    // #77bc1f
  gray: rgb(0.306, 0.341, 0.345),      // #4e5758
  textGray: rgb(0.42, 0.46, 0.47),     // #6b7577
  lightGray: rgb(0.898, 0.906, 0.914), // #e5e7eb
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
};

/** Layout-Konstanten (in PDF-Punkten, Y=0 ist unten) */
const LAYOUT = {
  /** Linker Seitenrand */
  marginLeft: 57,
  /** Rechter Rand (max X für Text, wegen Badges rechts) */
  maxTextX: 475,
  /** Rechte Spalte für Metadaten */
  metaLabelX: 370,
  metaValueX: 465,
  /** Y-Position für den Adressblock (unter Absenderzeile) */
  addressY: 690,
  /** Y-Position für den Titel */
  titleY: 620,
  /** Y-Position für den Einleitungstext */
  introY: 595,
  /** Y-Position für den Tabellenstart */
  tableStartY: 560,
  /** Y-Position für den Footer-Bereich (nicht überschreiben) */
  footerY: 75,
  /** Zeilenhöhe in der Tabelle */
  tableRowHeight: 16,
  /** Zeilenhöhe für normalen Text */
  lineHeight: 13,
  /** Spaltenbreiten für Positionstabelle */
  col: {
    pos: 57,
    menge: 100,
    bezeichnung: 155,
    einzelpreis: 370,
    gesamt: 440,
  },
};

// ============================================
// TYPEN
// ============================================

interface FontSet {
  regular: PDFFont;
  semiBold: PDFFont;
  bold: PDFFont;
}

/** Angebots-Position (Immobilie mit Seiten) */
export interface OfferPdfPosition {
  propertyName: string;
  sides: {
    name: string;
    area: number;
    pricePerSqm: number;
    total: number;
  }[];
  subtotal: number;
}

/** Nebenkosten-Position */
export interface CostPosition {
  label: string;
  detail?: string;
  amount: number;
}

/** Vollständige Angebotsdaten für PDF */
export interface OfferPdfData {
  offerNumber: string;
  version: number;
  datum: string;
  gueltigBis: string;
  // Kunde
  firma: string;
  ansprechpartner?: string;
  strasse?: string;
  plzOrt?: string;
  // FassadenFix Ansprechpartner
  ffAnsprechpartner?: string;
  ffEmail?: string;
  ffMobil?: string;
  // Positionen
  positions: OfferPdfPosition[];
  // Nebenkosten
  scaffoldingCosts?: CostPosition;
  travelCosts?: CostPosition;
  overnightCosts?: CostPosition;
  setupCosts?: CostPosition;
  // Beträge
  zwischensumme: number;
  rabattProzent?: number;
  rabattBetrag?: number;
  rabattGrund?: string;
  nettobetrag: number;
  mwstSatz: number;
  mwstBetrag: number;
  gesamtsumme: number;
  // Texte
  einleitungstext?: string;
  abschlusstext?: string;
  zahlungsziel?: string;
  // Preisstaffel für Störer
  preisstaffel?: { flaeche: string; preis: string }[];
  garantien?: string[];
}

/** Vollständige Rechnungsdaten für PDF */
export interface InvoicePdfData {
  rechnungsNummer: string;
  rechnungsTyp: string;
  rechnungsDatum: string;
  faelligkeitsDatum: string;
  // Kunde
  firma: string;
  ansprechpartner?: string;
  strasse?: string;
  plzOrt?: string;
  // Projekt
  projektName?: string;
  projektNummer?: string;
  // Positionen
  positionen: {
    pos: number;
    beschreibung: string;
    menge: number;
    einheit: string;
    einzelpreis: number;
    gesamt: number;
  }[];
  // Beträge
  nettobetrag: number;
  mwstSatz: number;
  mwstBetrag: number;
  gesamtsumme: number;
  // Zahlungsinfo
  zahlungsziel?: string;
  hinweise?: string;
}

// ============================================
// KERN-FUNKTIONEN
// ============================================

/** CDN-URLs als Fallback für Deployment (wenn lokale Dateien nicht verfügbar) */
const CDN_URLS = {
  briefbogen: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/eJzlQhQpuwUvPHjo.pdf",
  ralewayRegular: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/TJBrgXEHqrwKUTbA.ttf",
  ralewaySemiBold: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/wxAqeWZTbCvEukRY.ttf",
  ralewayBold: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/ysukcLJpiEMREskw.ttf",
};

/** Lädt eine Datei lokal oder über CDN-Fallback */
async function loadAsset(localPath: string, cdnUrl: string): Promise<Buffer> {
  try {
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch {
    // Lokale Datei nicht verfügbar, CDN-Fallback nutzen
  }
  const response = await fetch(cdnUrl);
  if (!response.ok) throw new Error(`CDN fetch failed: ${cdnUrl} (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

/** Lädt den Briefbogen und die Fonts, erstellt ein neues PDF-Dokument */
async function createDocumentWithBriefbogen(): Promise<{
  doc: PDFDocument;
  briefbogenPage: PDFEmbeddedPage;
  fonts: FontSet;
  pageWidth: number;
  pageHeight: number;
}> {
  const briefbogenPath = path.join(__dirname, "FF_Briefbogen.pdf");
  const briefbogenBytes = await loadAsset(briefbogenPath, CDN_URLS.briefbogen);
  const briefbogenDoc = await PDFDocument.load(briefbogenBytes);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Fonts laden (lokal oder CDN)
  const fontsDir = path.join(__dirname, "fonts");
  const regularBytes = await loadAsset(path.join(fontsDir, "Raleway-Regular.ttf"), CDN_URLS.ralewayRegular);
  const semiBoldBytes = await loadAsset(path.join(fontsDir, "Raleway-SemiBold.ttf"), CDN_URLS.ralewaySemiBold);
  const boldBytes = await loadAsset(path.join(fontsDir, "Raleway-Bold.ttf"), CDN_URLS.ralewayBold);

  const fonts: FontSet = {
    regular: await doc.embedFont(regularBytes),
    semiBold: await doc.embedFont(semiBoldBytes),
    bold: await doc.embedFont(boldBytes),
  };

  // Briefbogen einbetten
  const [briefbogenPage] = await doc.embedPages(briefbogenDoc.getPages());

  return {
    doc,
    briefbogenPage,
    fonts,
    pageWidth: briefbogenPage.width,
    pageHeight: briefbogenPage.height,
  };
}

/** Erstellt eine neue Seite mit Briefbogen-Hintergrund */
function addPageWithBriefbogen(
  doc: PDFDocument,
  briefbogenPage: PDFEmbeddedPage,
): PDFPage {
  const page = doc.addPage([briefbogenPage.width, briefbogenPage.height]);
  page.drawPage(briefbogenPage, { x: 0, y: 0 });
  return page;
}

// ============================================
// HILFS-FUNKTIONEN
// ============================================

/** Formatiert einen Betrag als deutsches Währungsformat */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " €";
}

/** Formatiert eine Zahl im deutschen Format */
function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/** Zeichnet Text rechtsbündig */
function drawTextRight(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: Color,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: x - textWidth, y, size, font, color });
}

/** Bricht langen Text in Zeilen um */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/** Zeichnet eine horizontale Linie */
function drawLine(
  page: PDFPage,
  x1: number,
  y: number,
  x2: number,
  thickness: number,
  color: Color,
) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness,
    color,
  });
}

// ============================================
// ANGEBOTS-PDF GENERIERUNG
// ============================================

export async function generateOfferPdf(data: OfferPdfData): Promise<Uint8Array> {
  const { doc, briefbogenPage, fonts, pageWidth, pageHeight } = await createDocumentWithBriefbogen();
  let page = addPageWithBriefbogen(doc, briefbogenPage);
  let y = LAYOUT.addressY;

  // ---- ADRESSBLOCK LINKS ----
  page.drawText(data.firma, { x: LAYOUT.marginLeft, y, size: 11, font: fonts.bold, color: CI.gray });
  y -= 14;
  if (data.ansprechpartner) {
    page.drawText(data.ansprechpartner, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
    y -= 12;
  }
  if (data.strasse) {
    page.drawText(data.strasse, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
    y -= 12;
  }
  if (data.plzOrt) {
    page.drawText(data.plzOrt, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
  }

  // ---- METADATEN RECHTS ----
  const metaItems: [string, string, PDFFont][] = [
    ["Angebotsnummer", data.offerNumber, fonts.semiBold],
    ["Datum", data.datum, fonts.bold],
    ["Gültig bis", data.gueltigBis, fonts.semiBold],
  ];
  if (data.ffAnsprechpartner) {
    metaItems.push(["Ihr Ansprechpartner", data.ffAnsprechpartner, fonts.semiBold]);
  }
  if (data.ffEmail) {
    metaItems.push(["E-Mail", data.ffEmail, fonts.regular]);
  }
  if (data.ffMobil) {
    metaItems.push(["Mobil", data.ffMobil, fonts.regular]);
  }

  let metaY = LAYOUT.addressY;
  const metaValueStartX = 455; // Feste X-Position für Werte (linksbündig, genug Abstand zu Labels)
  for (const [label, value, valueFont] of metaItems) {
    page.drawText(label, { x: LAYOUT.metaLabelX, y: metaY, size: 8, font: fonts.regular, color: CI.textGray });
    page.drawText(value, { x: metaValueStartX, y: metaY, size: 8, font: valueFont, color: CI.gray });
    metaY -= 14;
  }

  // ---- TITEL ----
  y = LAYOUT.titleY;
  const titleText = `Angebot Nr. ${data.offerNumber}`;
  page.drawText(titleText, { x: LAYOUT.marginLeft, y, size: 16, font: fonts.bold, color: CI.gray });
  const titleWidth = fonts.bold.widthOfTextAtSize(titleText, 16);
  drawLine(page, LAYOUT.marginLeft, y - 4, LAYOUT.marginLeft + titleWidth, 2, CI.green);

  // ---- EINLEITUNGSTEXT ----
  y = LAYOUT.introY;
  const introText = data.einleitungstext || "Vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!\nNachfolgend unser individuelles Angebot für Sie:";
  const introLines = introText.split("\n");
  for (const line of introLines) {
    const wrapped = wrapText(line, fonts.regular, 9, LAYOUT.maxTextX - LAYOUT.marginLeft);
    for (const wLine of wrapped) {
      page.drawText(wLine, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
      y -= LAYOUT.lineHeight;
    }
  }
  y -= 5;

  // ---- POSITIONSTABELLE ----
  // Tabellen-Header
  drawLine(page, LAYOUT.marginLeft, y + 2, LAYOUT.maxTextX, 1.5, CI.green);
  y -= 10;
  page.drawText("Pos", { x: LAYOUT.col.pos, y, size: 8, font: fonts.semiBold, color: CI.green });
  page.drawText("Menge", { x: LAYOUT.col.menge, y, size: 8, font: fonts.semiBold, color: CI.gray });
  page.drawText("Bezeichnung", { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
  drawTextRight(page, "Einzelpreis", LAYOUT.col.einzelpreis + 50, y, 8, fonts.semiBold, CI.gray);
  drawTextRight(page, "Gesamt", LAYOUT.maxTextX, y, 8, fonts.semiBold, CI.gray);
  y -= 4;
  drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 0.5, CI.lightGray);
  y -= 4;

  let posNr = 1;

  // Immobilien-Positionen
  for (const pos of data.positions) {
    // Prüfe ob genug Platz auf der Seite ist
    const neededHeight = (pos.sides.length + 2) * LAYOUT.tableRowHeight;
    if (y - neededHeight < LAYOUT.footerY + 60) {
      // Neue Seite
      page = addPageWithBriefbogen(doc, briefbogenPage);
      y = pageHeight - 100; // Unter dem Logo starten
      // Tabellen-Header wiederholen
      drawLine(page, LAYOUT.marginLeft, y + 2, LAYOUT.maxTextX, 1.5, CI.green);
      y -= 10;
      page.drawText("Pos", { x: LAYOUT.col.pos, y, size: 8, font: fonts.semiBold, color: CI.green });
      page.drawText("Menge", { x: LAYOUT.col.menge, y, size: 8, font: fonts.semiBold, color: CI.gray });
      page.drawText("Bezeichnung", { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
      drawTextRight(page, "Einzelpreis", LAYOUT.col.einzelpreis + 50, y, 8, fonts.semiBold, CI.gray);
      drawTextRight(page, "Gesamt", LAYOUT.maxTextX, y, 8, fonts.semiBold, CI.gray);
      y -= 4;
      drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 0.5, CI.lightGray);
      y -= 4;
    }

    // Immobilien-Name als Gruppenüberschrift
    y -= 2;
    page.drawText(pos.propertyName, { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
    y -= LAYOUT.tableRowHeight;

    // Einzelne Seiten
    for (const side of pos.sides) {
      page.drawText(String(posNr), { x: LAYOUT.col.pos + 5, y, size: 8, font: fonts.regular, color: CI.green });
      page.drawText(`${formatNumber(side.area, 0)} m²`, { x: LAYOUT.col.menge, y, size: 8, font: fonts.regular, color: CI.gray });
      page.drawText(`Fassadenreinigung ${side.name}`, { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.regular, color: CI.gray });
      drawTextRight(page, `${formatNumber(side.pricePerSqm)} €`, LAYOUT.col.einzelpreis + 50, y, 8, fonts.regular, CI.gray);
      drawTextRight(page, formatCurrency(side.total), LAYOUT.maxTextX, y, 8, fonts.regular, CI.gray);
      y -= LAYOUT.tableRowHeight;
      posNr++;
    }

    // Zwischensumme pro Immobilie
    drawLine(page, LAYOUT.col.gesamt - 10, y + 12, LAYOUT.maxTextX, 0.3, CI.lightGray);
    drawTextRight(page, `Zwischensumme: ${formatCurrency(pos.subtotal)}`, LAYOUT.maxTextX, y, 8, fonts.semiBold, CI.gray);
    y -= LAYOUT.tableRowHeight + 4;
  }

  // ---- NEBENKOSTEN ----
  const nebenkostenItems: CostPosition[] = [];
  if (data.scaffoldingCosts) nebenkostenItems.push(data.scaffoldingCosts);
  if (data.travelCosts) nebenkostenItems.push(data.travelCosts);
  if (data.overnightCosts) nebenkostenItems.push(data.overnightCosts);
  if (data.setupCosts) nebenkostenItems.push(data.setupCosts);

  if (nebenkostenItems.length > 0) {
    // Prüfe Platz
    if (y - (nebenkostenItems.length * LAYOUT.tableRowHeight + 30) < LAYOUT.footerY + 60) {
      page = addPageWithBriefbogen(doc, briefbogenPage);
      y = pageHeight - 100;
    }

    y -= 4;
    drawLine(page, LAYOUT.marginLeft, y + 2, LAYOUT.maxTextX, 0.5, CI.lightGray);
    y -= 4;
    page.drawText("Nebenkosten", { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
    y -= LAYOUT.tableRowHeight;

    for (const item of nebenkostenItems) {
      page.drawText(String(posNr), { x: LAYOUT.col.pos + 5, y, size: 8, font: fonts.regular, color: CI.green });
      page.drawText(item.label, { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.regular, color: CI.gray });
      if (item.detail) {
        page.drawText(item.detail, { x: LAYOUT.col.menge, y, size: 7, font: fonts.regular, color: CI.textGray });
      }
      drawTextRight(page, formatCurrency(item.amount), LAYOUT.maxTextX, y, 8, fonts.regular, CI.gray);
      y -= LAYOUT.tableRowHeight;
      posNr++;
    }
  }

  // ---- SUMMENBLOCK ----
  // Prüfe Platz für Summenblock + Störer + Bedingungen
  if (y - 200 < LAYOUT.footerY) {
    page = addPageWithBriefbogen(doc, briefbogenPage);
    y = pageHeight - 100;
  }

  y -= 10;
  drawLine(page, LAYOUT.marginLeft, y + 4, LAYOUT.maxTextX, 1, CI.green);
  y -= 8;

  const sumLabelX = 340;
  const sumValueX = LAYOUT.maxTextX;

  // Zwischensumme (wenn Rabatt)
  if (data.rabattProzent && data.rabattProzent > 0) {
    page.drawText("Zwischensumme", { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.gray });
    drawTextRight(page, formatCurrency(data.zwischensumme), sumValueX, y, 9, fonts.regular, CI.gray);
    y -= 14;
    const rabattText = `Rabatt ${formatNumber(data.rabattProzent, 0)}%${data.rabattGrund ? ` (${data.rabattGrund})` : ""}`;
    page.drawText(rabattText, { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.green });
    drawTextRight(page, `- ${formatCurrency(data.rabattBetrag || 0)}`, sumValueX, y, 9, fonts.regular, CI.green);
    y -= 14;
  }

  // Nettobetrag
  page.drawText("Nettobetrag", { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.gray });
  drawTextRight(page, formatCurrency(data.nettobetrag), sumValueX, y, 9, fonts.regular, CI.gray);
  y -= 14;

  // MwSt
  page.drawText(`zzgl. ${formatNumber(data.mwstSatz, 0)}% MwSt.`, { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.gray });
  drawTextRight(page, formatCurrency(data.mwstBetrag), sumValueX, y, 9, fonts.regular, CI.gray);
  y -= 4;
  drawLine(page, sumLabelX, y, sumValueX, 1, CI.gray);
  y -= 14;

  // Gesamtsumme
  page.drawText("Gesamtsumme", { x: 290, y, size: 13, font: fonts.bold, color: CI.gray });
  drawTextRight(page, formatCurrency(data.gesamtsumme), sumValueX, y, 13, fonts.bold, CI.gray);
  y -= 24;

  // ---- STÖRER: DAS FASSADENFIX VERSPRECHEN ----
  if (data.preisstaffel && data.preisstaffel.length > 0) {
    if (y - 120 < LAYOUT.footerY) {
      page = addPageWithBriefbogen(doc, briefbogenPage);
      y = pageHeight - 100;
    }

    const stoererX = LAYOUT.marginLeft;
    const stoererW = LAYOUT.maxTextX - LAYOUT.marginLeft;
    const stoererH = 110;

    // Grüner Header
    page.drawRectangle({
      x: stoererX, y: y - 16,
      width: stoererW, height: 18,
      color: CI.green,
    });
    page.drawText("Das FassadenFix Versprechen", {
      x: stoererX + 8, y: y - 12,
      size: 9, font: fonts.semiBold, color: CI.white,
    });
    y -= 20;

    // Rahmen
    page.drawRectangle({
      x: stoererX, y: y - stoererH + 16,
      width: stoererW, height: stoererH,
      borderColor: CI.lightGray,
      borderWidth: 0.5,
      color: CI.white,
    });

    // Linke Spalte: Preisstaffel
    const leftColX = stoererX + 10;
    let staffelY = y - 4;
    page.drawText("Transparente Preisstaffel", {
      x: leftColX, y: staffelY,
      size: 8, font: fonts.semiBold, color: CI.gray,
    });
    staffelY -= 12;
    page.drawText("FLÄCHE", { x: leftColX, y: staffelY, size: 7, font: fonts.regular, color: CI.textGray });
    page.drawText("€/M²", { x: leftColX + 120, y: staffelY, size: 7, font: fonts.regular, color: CI.textGray });
    staffelY -= 10;

    for (const s of data.preisstaffel) {
      page.drawText(s.flaeche, { x: leftColX, y: staffelY, size: 7, font: fonts.regular, color: CI.gray });
      page.drawText(s.preis, { x: leftColX + 120, y: staffelY, size: 7, font: fonts.semiBold, color: CI.green });
      staffelY -= 10;
    }

    // Mittellinie
    const midX = stoererX + stoererW / 2;
    page.drawLine({
      start: { x: midX, y: y - 4 },
      end: { x: midX, y: y - stoererH + 20 },
      thickness: 0.5,
      color: CI.lightGray,
    });

    // Rechte Spalte: Garantien
    const rightColX = midX + 10;
    let garantieY = y - 4;
    page.drawText("Unsere Garantien", {
      x: rightColX, y: garantieY,
      size: 8, font: fonts.semiBold, color: CI.gray,
    });
    garantieY -= 14;

    const garantien = data.garantien || [
      "5-Jahres-Garantie auf Algenfreiheit",
      "Ergebnisgarantie bei Systemreinigung",
      "Jährliche Inspektion inklusive",
      "Pauschalfestpreis – keine versteckten Kosten",
    ];
    for (const g of garantien) {
      // Häkchen-Symbol
      page.drawText("✓", { x: rightColX, y: garantieY, size: 8, font: fonts.bold, color: CI.green });
      page.drawText(g, { x: rightColX + 12, y: garantieY, size: 7, font: fonts.regular, color: CI.gray });
      garantieY -= 11;
    }

    // Footer-Zeile
    const footerLineY = y - stoererH + 18;
    page.drawRectangle({
      x: stoererX, y: footerLineY - 2,
      width: stoererW, height: 14,
      color: rgb(0.95, 0.96, 0.97),
    });
    const sloganText = "FassadenFix – der sichere Weg zur sauberen Fassade";
    const sloganWidth = fonts.regular.widthOfTextAtSize(sloganText, 7);
    page.drawText(sloganText, {
      x: stoererX + (stoererW - sloganWidth) / 2, y: footerLineY + 1,
      size: 7, font: fonts.regular, color: CI.green,
    });

    y = footerLineY - 12;
  }

  // ---- ANGEBOTSBEDINGUNGEN ----
  if (y - 60 < LAYOUT.footerY) {
    page = addPageWithBriefbogen(doc, briefbogenPage);
    y = pageHeight - 100;
  }

  y -= 8;
  page.drawText("Angebotsbedingungen", { x: LAYOUT.marginLeft, y, size: 9, font: fonts.bold, color: CI.gray });
  y -= 14;

  const bedingungParts: string[] = [];
  bedingungParts.push(`Gültigkeit: ${data.gueltigBis}`);
  bedingungParts.push(`Zahlung: ${data.zahlungsziel || "7 Tage netto"}`);
  bedingungParts.push("Leistungsort: wie vereinbart");
  const bedingungText = bedingungParts.join("  ·  ");

  // Zeichne mit farbigen Labels
  let bx = LAYOUT.marginLeft;
  for (let i = 0; i < bedingungParts.length; i++) {
    const [label, ...valueParts] = bedingungParts[i].split(": ");
    const value = valueParts.join(": ");
    page.drawText(`${label}: `, { x: bx, y, size: 8, font: fonts.semiBold, color: CI.green });
    bx += fonts.semiBold.widthOfTextAtSize(`${label}: `, 8);
    page.drawText(value, { x: bx, y, size: 8, font: fonts.regular, color: CI.gray });
    bx += fonts.regular.widthOfTextAtSize(value, 8);
    if (i < bedingungParts.length - 1) {
      page.drawText("  ·  ", { x: bx, y, size: 8, font: fonts.regular, color: CI.textGray });
      bx += fonts.regular.widthOfTextAtSize("  ·  ", 8);
    }
  }
  y -= 12;

  page.drawText("Sperrungen: Beantragung und Verantwortung beim AG. Es gelten unsere AGB (www.fassadenfix.de/agb).", {
    x: LAYOUT.marginLeft, y, size: 7, font: fonts.regular, color: CI.textGray,
  });
  y -= 6;
  drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 2, CI.green);

  // ---- ABSCHLUSSTEXT ----
  if (data.abschlusstext) {
    y -= 14;
    const abschlussLines = wrapText(data.abschlusstext, fonts.regular, 8, LAYOUT.maxTextX - LAYOUT.marginLeft);
    for (const line of abschlussLines) {
      if (y < LAYOUT.footerY) {
        page = addPageWithBriefbogen(doc, briefbogenPage);
        y = pageHeight - 100;
      }
      page.drawText(line, { x: LAYOUT.marginLeft, y, size: 8, font: fonts.regular, color: CI.gray });
      y -= 11;
    }
  }

  return doc.save();
}

// ============================================
// RECHNUNGS-PDF GENERIERUNG
// ============================================

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const { doc, briefbogenPage, fonts, pageWidth, pageHeight } = await createDocumentWithBriefbogen();
  let page = addPageWithBriefbogen(doc, briefbogenPage);
  let y = LAYOUT.addressY;

  // ---- ADRESSBLOCK LINKS ----
  page.drawText(data.firma, { x: LAYOUT.marginLeft, y, size: 11, font: fonts.bold, color: CI.gray });
  y -= 14;
  if (data.ansprechpartner) {
    page.drawText(`z.Hd. ${data.ansprechpartner}`, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
    y -= 12;
  }
  if (data.strasse) {
    page.drawText(data.strasse, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
    y -= 12;
  }
  if (data.plzOrt) {
    page.drawText(data.plzOrt, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
  }

  // ---- METADATEN RECHTS ----
  const rechnungsTypLabel: Record<string, string> = {
    abschlagsrechnung: "Abschlagsrechnung",
    schlussrechnung: "Schlussrechnung",
    teilrechnung: "Teilrechnung",
    gutschrift: "Gutschrift",
  };
  const typLabel = rechnungsTypLabel[data.rechnungsTyp] || "Rechnung";

  const metaItems: [string, string, PDFFont][] = [
    ["Rechnungsnummer", data.rechnungsNummer, fonts.semiBold],
    ["Rechnungsdatum", data.rechnungsDatum, fonts.bold],
    ["Fälligkeitsdatum", data.faelligkeitsDatum, fonts.semiBold],
  ];
  if (data.projektNummer) {
    metaItems.push(["Projekt", `${data.projektNummer}${data.projektName ? ` – ${data.projektName}` : ""}`, fonts.regular]);
  }

  let metaY = LAYOUT.addressY;
  const metaValueStartX = 455; // Feste X-Position für Werte (linksbündig, genug Abstand zu Labels)
  for (const [label, value, valueFont] of metaItems) {
    page.drawText(label, { x: LAYOUT.metaLabelX, y: metaY, size: 8, font: fonts.regular, color: CI.textGray });
    page.drawText(value, { x: metaValueStartX, y: metaY, size: 8, font: valueFont, color: CI.gray });
    metaY -= 14;
  }

  // ---- TITEL ----
  y = LAYOUT.titleY;
  const titleText = `${typLabel} ${data.rechnungsNummer}`;
  page.drawText(titleText, { x: LAYOUT.marginLeft, y, size: 16, font: fonts.bold, color: CI.gray });
  const titleWidth = fonts.bold.widthOfTextAtSize(titleText, 16);
  drawLine(page, LAYOUT.marginLeft, y - 4, LAYOUT.marginLeft + titleWidth, 2, CI.green);

  // ---- EINLEITUNGSTEXT ----
  y = LAYOUT.introY;
  const introText = data.projektName
    ? `Für das Projekt "${data.projektName}" stellen wir Ihnen folgende Leistungen in Rechnung:`
    : "Wir stellen Ihnen folgende Leistungen in Rechnung:";
  const introWrapped = wrapText(introText, fonts.regular, 9, LAYOUT.maxTextX - LAYOUT.marginLeft);
  for (const line of introWrapped) {
    page.drawText(line, { x: LAYOUT.marginLeft, y, size: 9, font: fonts.regular, color: CI.gray });
    y -= LAYOUT.lineHeight;
  }
  y -= 5;

  // ---- POSITIONSTABELLE ----
  drawLine(page, LAYOUT.marginLeft, y + 2, LAYOUT.maxTextX, 1.5, CI.green);
  y -= 10;
  page.drawText("Pos", { x: LAYOUT.col.pos, y, size: 8, font: fonts.semiBold, color: CI.green });
  page.drawText("Menge", { x: LAYOUT.col.menge, y, size: 8, font: fonts.semiBold, color: CI.gray });
  page.drawText("Bezeichnung", { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
  drawTextRight(page, "Einzelpreis", LAYOUT.col.einzelpreis + 50, y, 8, fonts.semiBold, CI.gray);
  drawTextRight(page, "Gesamt", LAYOUT.maxTextX, y, 8, fonts.semiBold, CI.gray);
  y -= 4;
  drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 0.5, CI.lightGray);
  y -= 4;

  for (const pos of data.positionen) {
    // Prüfe Platz
    if (y - LAYOUT.tableRowHeight < LAYOUT.footerY + 60) {
      page = addPageWithBriefbogen(doc, briefbogenPage);
      y = pageHeight - 100;
      // Header wiederholen
      drawLine(page, LAYOUT.marginLeft, y + 2, LAYOUT.maxTextX, 1.5, CI.green);
      y -= 10;
      page.drawText("Pos", { x: LAYOUT.col.pos, y, size: 8, font: fonts.semiBold, color: CI.green });
      page.drawText("Menge", { x: LAYOUT.col.menge, y, size: 8, font: fonts.semiBold, color: CI.gray });
      page.drawText("Bezeichnung", { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.semiBold, color: CI.gray });
      drawTextRight(page, "Einzelpreis", LAYOUT.col.einzelpreis + 50, y, 8, fonts.semiBold, CI.gray);
      drawTextRight(page, "Gesamt", LAYOUT.maxTextX, y, 8, fonts.semiBold, CI.gray);
      y -= 4;
      drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 0.5, CI.lightGray);
      y -= 4;
    }

    y -= 2;
    page.drawText(String(pos.pos), { x: LAYOUT.col.pos + 5, y, size: 8, font: fonts.regular, color: CI.green });
    page.drawText(`${formatNumber(pos.menge, pos.einheit === "m²" ? 0 : 1)} ${pos.einheit}`, {
      x: LAYOUT.col.menge, y, size: 8, font: fonts.regular, color: CI.gray,
    });

    // Bezeichnung ggf. umbrechen
    const beschrLines = wrapText(pos.beschreibung, fonts.regular, 8, LAYOUT.col.einzelpreis - LAYOUT.col.bezeichnung - 10);
    page.drawText(beschrLines[0], { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.regular, color: CI.gray });
    drawTextRight(page, formatCurrency(pos.einzelpreis), LAYOUT.col.einzelpreis + 50, y, 8, fonts.regular, CI.gray);
    drawTextRight(page, formatCurrency(pos.gesamt), LAYOUT.maxTextX, y, 8, fonts.regular, CI.gray);

    // Weitere Zeilen der Bezeichnung
    for (let i = 1; i < beschrLines.length; i++) {
      y -= 10;
      page.drawText(beschrLines[i], { x: LAYOUT.col.bezeichnung, y, size: 8, font: fonts.regular, color: CI.gray });
    }

    y -= LAYOUT.tableRowHeight;
    drawLine(page, LAYOUT.marginLeft, y + 10, LAYOUT.maxTextX, 0.3, CI.lightGray);
  }

  // ---- SUMMENBLOCK ----
  if (y - 80 < LAYOUT.footerY) {
    page = addPageWithBriefbogen(doc, briefbogenPage);
    y = pageHeight - 100;
  }

  y -= 10;
  drawLine(page, LAYOUT.marginLeft, y + 4, LAYOUT.maxTextX, 1, CI.green);
  y -= 8;

  const sumLabelX = 340;
  const sumValueX = LAYOUT.maxTextX;

  page.drawText("Nettobetrag", { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.gray });
  drawTextRight(page, formatCurrency(data.nettobetrag), sumValueX, y, 9, fonts.regular, CI.gray);
  y -= 14;

  page.drawText(`zzgl. ${formatNumber(data.mwstSatz, 0)}% MwSt.`, { x: sumLabelX, y, size: 9, font: fonts.regular, color: CI.gray });
  drawTextRight(page, formatCurrency(data.mwstBetrag), sumValueX, y, 9, fonts.regular, CI.gray);
  y -= 4;
  drawLine(page, sumLabelX, y, sumValueX, 1, CI.gray);
  y -= 14;

  page.drawText("Rechnungsbetrag", { x: 275, y, size: 13, font: fonts.bold, color: CI.gray });
  drawTextRight(page, formatCurrency(data.gesamtsumme), sumValueX, y, 13, fonts.bold, CI.gray);
  y -= 30;

  // ---- ZAHLUNGSINFORMATIONEN ----
  if (y - 60 < LAYOUT.footerY) {
    page = addPageWithBriefbogen(doc, briefbogenPage);
    y = pageHeight - 100;
  }

  // Zahlungsinfo-Box
  const boxX = LAYOUT.marginLeft;
  const boxW = LAYOUT.maxTextX - LAYOUT.marginLeft;
  const boxH = 50;
  page.drawRectangle({
    x: boxX, y: y - boxH,
    width: boxW, height: boxH,
    color: rgb(0.96, 0.97, 0.97),
    borderColor: CI.lightGray,
    borderWidth: 0.5,
  });

  page.drawText("Zahlungsinformationen", {
    x: boxX + 10, y: y - 14,
    size: 9, font: fonts.semiBold, color: CI.green,
  });
  page.drawText(data.zahlungsziel || "Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt.", {
    x: boxX + 10, y: y - 28,
    size: 8, font: fonts.regular, color: CI.gray,
  });
  page.drawText("Bitte geben Sie bei der Überweisung die Rechnungsnummer als Verwendungszweck an.", {
    x: boxX + 10, y: y - 40,
    size: 7, font: fonts.regular, color: CI.textGray,
  });

  y -= boxH + 10;

  // ---- HINWEISE ----
  if (data.hinweise) {
    const hinweisLines = wrapText(data.hinweise, fonts.regular, 8, boxW);
    for (const line of hinweisLines) {
      if (y < LAYOUT.footerY) {
        page = addPageWithBriefbogen(doc, briefbogenPage);
        y = pageHeight - 100;
      }
      page.drawText(line, { x: LAYOUT.marginLeft, y, size: 8, font: fonts.regular, color: CI.gray });
      y -= 11;
    }
  }

  // ---- ABSCHLUSS ----
  y -= 10;
  if (y > LAYOUT.footerY + 20) {
    drawLine(page, LAYOUT.marginLeft, y, LAYOUT.maxTextX, 2, CI.green);
  }

  return doc.save();
}

// ============================================
// BRIEFBOGEN-URL FÜR FRONTEND-REFERENZ
// ============================================

export const BRIEFBOGEN_CDN_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663199947920/UykTIqoKwhcfFlpp.pdf";
