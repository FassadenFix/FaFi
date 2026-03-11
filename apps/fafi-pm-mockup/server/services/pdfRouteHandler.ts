/**
 * PDF Route Handler
 * 
 * Intention: Brücke zwischen Datenbank und PDF-Generator.
 * Lädt die Daten aus der DB, transformiert sie in das Format
 * das der briefbogenPdf-Generator erwartet, und gibt die
 * fertigen PDF-Bytes zurück.
 */

import * as db from "../db";
import { generateOfferPdf, generateInvoicePdf, type OfferPdfData, type InvoicePdfData } from "./briefbogenPdf";

/**
 * Generiert ein Angebots-PDF aus der Datenbank
 */
export async function generateOfferPdfFromDb(offerId: number): Promise<Uint8Array | null> {
  console.log(`[PDF] Generating offer PDF for ID: ${offerId}`);
  const offer = await db.getOfferById(offerId);
  console.log(`[PDF] Offer found:`, offer ? `ID=${offer.id}, Nr=${offer.offerNumber}` : 'null');
  if (!offer) return null;

  // Firma und Kontakt laden
  const company = offer.companyId ? await db.getCompanyById(offer.companyId) : null;
  const contact = offer.contactId ? await db.getContactById(offer.contactId) : null;

  // Positionen aus JSON extrahieren
  const positions = (offer.positions as any[] || []).map((p: any) => ({
    propertyName: p.propertyName || "Immobilie",
    sides: (p.sides || []).map((s: any) => ({
      name: s.name || "Fassade",
      area: s.area || 0,
      pricePerSqm: s.pricePerSqm || 0,
      total: s.total || 0,
    })),
    subtotal: p.subtotal || 0,
  }));

  // Ansprechpartner-Name zusammensetzen
  const ansprechpartnerName = contact
    ? [
        contact.salutation === "herr" ? "Herr" : contact.salutation === "frau" ? "Frau" : "",
        contact.firstName,
        contact.lastName,
      ].filter(Boolean).join(" ")
    : undefined;

  // Adresse zusammensetzen
  const plzOrt = company
    ? [company.postalCode, company.city].filter(Boolean).join(" ")
    : undefined;

  // Beträge parsen
  const basePrice = parseFloat(String(offer.basePrice || 0));
  const discount = parseFloat(String(offer.discount || 0));
  const netTotal = parseFloat(String(offer.netTotal || 0));
  const vatRate = parseFloat(String(offer.vatRate || 19));
  const vatAmount = parseFloat(String(offer.vatAmount || 0));
  const grossTotal = parseFloat(String(offer.grossTotal || 0));
  const travelCosts = parseFloat(String(offer.travelCosts || 0));

  // Rabattbetrag berechnen
  const rabattBetrag = discount > 0 ? basePrice * (discount / 100) : 0;

  // Nebenkosten
  const costPositions: OfferPdfData["travelCosts"][] = [];
  if (travelCosts > 0) {
    costPositions.push({
      label: "Anfahrtskosten",
      detail: offer.distanceKm ? `${offer.distanceKm} km` : undefined,
      amount: travelCosts,
    });
  }

  // Textbausteine
  const textBlocks = offer.textBlocks as string[] | null;

  const pdfData: OfferPdfData = {
    offerNumber: offer.offerNumber,
    version: offer.version,
    datum: new Date(offer.createdAt).toLocaleDateString("de-DE"),
    gueltigBis: offer.validUntil
      ? new Date(offer.validUntil).toLocaleDateString("de-DE")
      : new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString("de-DE"),
    firma: company?.name || "Unbekannt",
    ansprechpartner: ansprechpartnerName,
    strasse: company?.street || undefined,
    plzOrt,
    ffAnsprechpartner: "Alexander Retzlaff",
    ffEmail: "info@fassadenfix.de",
    ffMobil: "0345 21389235",
    positions,
    travelCosts: travelCosts > 0 ? {
      label: "Anfahrtskosten",
      detail: offer.distanceKm ? `${offer.distanceKm} km` : undefined,
      amount: travelCosts,
    } : undefined,
    zwischensumme: basePrice,
    rabattProzent: discount > 0 ? discount : undefined,
    rabattBetrag: rabattBetrag > 0 ? rabattBetrag : undefined,
    rabattGrund: offer.discountReason || undefined,
    nettobetrag: netTotal,
    mwstSatz: vatRate,
    mwstBetrag: vatAmount,
    gesamtsumme: grossTotal,
    einleitungstext: textBlocks?.[0] || undefined,
    abschlusstext: textBlocks?.[1] || offer.customText || undefined,
    zahlungsziel: "7 Tage netto",
    preisstaffel: [
      { flaeche: "bis 500 m²", preis: "11,50 €" },
      { flaeche: "501 – 2.000 m²", preis: "9,25 €" },
      { flaeche: "2.001 – 5.000 m²", preis: "7,90 €" },
      { flaeche: "ab 5.001 m²", preis: "6,50 €" },
    ],
    garantien: [
      "5-Jahres-Garantie auf Algenfreiheit",
      "Ergebnisgarantie bei Systemreinigung",
      "Jährliche Inspektion inklusive",
      "Pauschalfestpreis – keine versteckten Kosten",
    ],
  };

  return generateOfferPdf(pdfData);
}

/**
 * Generiert ein Rechnungs-PDF aus der Datenbank
 */
export async function generateInvoicePdfFromDb(invoiceId: number): Promise<Uint8Array | null> {
  const invoiceData = await db.getInvoiceWithRelations(invoiceId);
  if (!invoiceData) return null;

  // Kontakt laden
  const contact = invoiceData.contactId ? await db.getContactById(invoiceData.contactId) : null;
  const ansprechpartnerName = contact
    ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
    : undefined;

  // Adresse zusammensetzen
  const company = invoiceData.company;
  const plzOrt = company
    ? [company.postalCode, company.city].filter(Boolean).join(" ")
    : undefined;

  // Positionen transformieren
  const positionen = (invoiceData.positions as any[] || []).map((p: any, i: number) => ({
    pos: p.position || i + 1,
    beschreibung: p.description || p.text || "Fassadenreinigung",
    menge: p.quantity || p.area || 1,
    einheit: p.unit || "m²",
    einzelpreis: p.unitPrice || p.pricePerUnit || 0,
    gesamt: p.total || p.totalPrice || 0,
  }));

  const pdfData: InvoicePdfData = {
    rechnungsNummer: invoiceData.invoiceNumber,
    rechnungsTyp: invoiceData.invoiceType,
    rechnungsDatum: new Date(invoiceData.invoiceDate || invoiceData.createdAt).toLocaleDateString("de-DE"),
    faelligkeitsDatum: invoiceData.dueDate
      ? new Date(invoiceData.dueDate).toLocaleDateString("de-DE")
      : "Auf Anfrage",
    firma: company?.name || "Unbekannt",
    ansprechpartner: ansprechpartnerName,
    strasse: company?.street || undefined,
    plzOrt,
    projektName: invoiceData.project?.name || undefined,
    projektNummer: invoiceData.project?.projectNumber || undefined,
    positionen,
    nettobetrag: parseFloat(String(invoiceData.netTotal || 0)),
    mwstSatz: parseFloat(String(invoiceData.vatRate || 19)),
    mwstBetrag: parseFloat(String(invoiceData.vatAmount || 0)),
    gesamtsumme: parseFloat(String(invoiceData.grossTotal || 0)),
    zahlungsziel: "Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt.",
    hinweise: invoiceData.notes || undefined,
  };

  return generateInvoicePdf(pdfData);
}
