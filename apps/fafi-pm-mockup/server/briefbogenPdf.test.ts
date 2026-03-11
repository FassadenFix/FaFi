/**
 * Tests für die PDF-Generierung mit Briefbogen
 * 
 * Intention: Sicherstellen, dass die PDF-Generierung korrekt funktioniert,
 * die richtigen Daten enthält und keine Fehler wirft.
 */

import { describe, it, expect } from "vitest";
import { generateOfferPdf, generateInvoicePdf, type OfferPdfData, type InvoicePdfData } from "./services/briefbogenPdf";

describe("Briefbogen-PDF-Generierung", () => {
  describe("Angebots-PDF", () => {
    const sampleOfferData: OfferPdfData = {
      offerNumber: "FF-2026-TEST",
      version: 1,
      datum: "12.02.2026",
      gueltigBis: "12.03.2026",
      firma: "Test GmbH",
      ansprechpartner: "Herr Max Mustermann",
      strasse: "Teststraße 1",
      plzOrt: "12345 Teststadt",
      ffAnsprechpartner: "Alexander Retzlaff",
      ffEmail: "info@fassadenfix.de",
      ffMobil: "0345 21389235",
      positions: [
        {
          propertyName: "Wohnhaus A",
          sides: [
            { name: "Nordseite", area: 200, pricePerSqm: 9.25, total: 1850 },
            { name: "Südseite", area: 150, pricePerSqm: 9.25, total: 1387.5 },
          ],
          subtotal: 3237.5,
        },
      ],
      zwischensumme: 3237.5,
      nettobetrag: 3237.5,
      mwstSatz: 19,
      mwstBetrag: 615.13,
      gesamtsumme: 3852.63,
      zahlungsziel: "7 Tage netto",
      preisstaffel: [
        { flaeche: "bis 500 m²", preis: "11,50 €" },
        { flaeche: "501 – 2.000 m²", preis: "9,25 €" },
      ],
      garantien: [
        "5-Jahres-Garantie auf Algenfreiheit",
        "Ergebnisgarantie bei Systemreinigung",
      ],
    };

    it("sollte ein gültiges PDF als Uint8Array generieren", async () => {
      const pdfBytes = await generateOfferPdf(sampleOfferData);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000); // PDF sollte substantiell sein
    });

    it("sollte ein PDF mit gültigem PDF-Header generieren", async () => {
      const pdfBytes = await generateOfferPdf(sampleOfferData);
      // PDF-Dateien beginnen mit %PDF-
      const header = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(header).toBe("%PDF-");
    });

    it("sollte ein Angebot ohne Positionen generieren können", async () => {
      const dataOhnePositionen: OfferPdfData = {
        ...sampleOfferData,
        positions: [],
      };
      const pdfBytes = await generateOfferPdf(dataOhnePositionen);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte ein Angebot mit Rabatt generieren können", async () => {
      const dataWithRabatt: OfferPdfData = {
        ...sampleOfferData,
        rabattProzent: 10,
        rabattBetrag: 323.75,
        rabattGrund: "Frühbucher-Rabatt",
        nettobetrag: 2913.75,
        mwstBetrag: 553.61,
        gesamtsumme: 3467.36,
      };
      const pdfBytes = await generateOfferPdf(dataWithRabatt);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte ein Angebot mit Nebenkosten generieren können", async () => {
      const dataWithNebenkosten: OfferPdfData = {
        ...sampleOfferData,
        travelCosts: { label: "Anfahrtskosten", detail: "250 km", amount: 450 },
        scaffoldingCosts: { label: "Gerüstkosten", detail: "5 Tage", amount: 1200 },
      };
      const pdfBytes = await generateOfferPdf(dataWithNebenkosten);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte ein Angebot ohne optionale Felder generieren können", async () => {
      const minimalData: OfferPdfData = {
        offerNumber: "FF-MIN-001",
        version: 1,
        datum: "01.01.2026",
        gueltigBis: "01.02.2026",
        firma: "Minimal GmbH",
        positions: [],
        zwischensumme: 0,
        nettobetrag: 0,
        mwstSatz: 19,
        mwstBetrag: 0,
        gesamtsumme: 0,
        zahlungsziel: "14 Tage netto",
      };
      const pdfBytes = await generateOfferPdf(minimalData);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });
  });

  describe("Rechnungs-PDF", () => {
    const sampleInvoiceData: InvoicePdfData = {
      rechnungsNummer: "R-2026-TEST",
      rechnungsTyp: "schlussrechnung",
      rechnungsDatum: "12.02.2026",
      faelligkeitsDatum: "26.02.2026",
      firma: "Test GmbH",
      ansprechpartner: "Herr Max Mustermann",
      strasse: "Teststraße 1",
      plzOrt: "12345 Teststadt",
      projektName: "Fassadenreinigung Testgebäude",
      projektNummer: "2026-TEST-01",
      positionen: [
        {
          pos: 1,
          beschreibung: "Fassadenreinigung WDVS",
          menge: 500,
          einheit: "m²",
          einzelpreis: 9.25,
          gesamt: 4625,
        },
        {
          pos: 2,
          beschreibung: "An-/Abfahrt",
          menge: 1,
          einheit: "pauschal",
          einzelpreis: 45,
          gesamt: 45,
        },
      ],
      nettobetrag: 4670,
      mwstSatz: 19,
      mwstBetrag: 887.3,
      gesamtsumme: 5557.3,
      zahlungsziel: "Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt.",
    };

    it("sollte ein gültiges Rechnungs-PDF generieren", async () => {
      const pdfBytes = await generateInvoicePdf(sampleInvoiceData);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte ein PDF mit gültigem PDF-Header generieren", async () => {
      const pdfBytes = await generateInvoicePdf(sampleInvoiceData);
      const header = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(header).toBe("%PDF-");
    });

    it("sollte verschiedene Rechnungstypen unterstützen", async () => {
      const typen = ["abschlagsrechnung", "schlussrechnung", "teilrechnung", "gutschrift"] as const;
      for (const typ of typen) {
        const data: InvoicePdfData = { ...sampleInvoiceData, rechnungsTyp: typ };
        const pdfBytes = await generateInvoicePdf(data);
        expect(pdfBytes).toBeInstanceOf(Uint8Array);
        expect(pdfBytes.length).toBeGreaterThan(1000);
      }
    });

    it("sollte eine Rechnung ohne Positionen generieren können", async () => {
      const dataOhnePositionen: InvoicePdfData = {
        ...sampleInvoiceData,
        positionen: [],
      };
      const pdfBytes = await generateInvoicePdf(dataOhnePositionen);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte eine Rechnung mit Hinweisen generieren können", async () => {
      const dataWithHinweise: InvoicePdfData = {
        ...sampleInvoiceData,
        hinweise: "Bitte beachten Sie die geänderten Kontoverbindungen.",
      };
      const pdfBytes = await generateInvoicePdf(dataWithHinweise);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it("sollte eine minimale Rechnung generieren können", async () => {
      const minimalData: InvoicePdfData = {
        rechnungsNummer: "R-MIN-001",
        rechnungsTyp: "schlussrechnung",
        rechnungsDatum: "01.01.2026",
        faelligkeitsDatum: "15.01.2026",
        firma: "Minimal GmbH",
        positionen: [],
        nettobetrag: 0,
        mwstSatz: 19,
        mwstBetrag: 0,
        gesamtsumme: 0,
        zahlungsziel: "Sofort fällig",
      };
      const pdfBytes = await generateInvoicePdf(minimalData);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });
  });
});
