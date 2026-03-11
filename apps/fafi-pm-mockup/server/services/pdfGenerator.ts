/**
 * v7.4 – PDF-Generierung für Rechnungen und Garantie-Zertifikate
 * 
 * Generiert HTML-basierte PDFs im FassadenFix Corporate Design.
 * Verwendet den invokeLLM Helper für dynamische Inhalte.
 */

// FassadenFix Corporate Design Konstanten
const FF_COLORS = {
  primary: "#77bc1f",
  primaryDark: "#5a9416",
  dark: "#4e5758",
  text: "#333333",
  lightGray: "#f5f5f5",
  border: "#e0e0e0",
};

const FF_LOGO_URL = "https://private-us-east-1.manuscdn.com/sessionFile/cs4QqQHzfMcOxObkV0dfii/sandbox/V5qE9DnH5E250rsH5Zmn4N-fafi-logo_1770072096000_na1fn_ZmFmaS1sb2dv.svg";

// ============================================
// RECHNUNGS-PDF
// ============================================

interface InvoicePosition {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface InvoicePdfData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  invoiceType: string;
  // Kunde
  companyName: string;
  companyAddress: string;
  contactName?: string;
  // Projekt
  projectName?: string;
  projectNumber?: string;
  // Positionen
  positions: InvoicePosition[];
  netTotal: number;
  vatRate: number;
  vatAmount: number;
  grossTotal: number;
  // Zahlungsbedingungen
  paymentTerms?: string;
  bankName?: string;
  iban?: string;
  bic?: string;
  notes?: string;
}

export function generateInvoiceHtml(data: InvoicePdfData): string {
  const positionsHtml = data.positions.map(p => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border}; text-align: center;">${p.position}</td>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border};">${p.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border}; text-align: right;">${p.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border}; text-align: center;">${p.unit}</td>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border}; text-align: right;">${formatCurrency(p.unitPrice)}</td>
      <td style="padding: 8px; border-bottom: 1px solid ${FF_COLORS.border}; text-align: right; font-weight: 500;">${formatCurrency(p.totalPrice)}</td>
    </tr>
  `).join("");

  const invoiceTypeLabel = {
    abschlagsrechnung: "Abschlagsrechnung",
    schlussrechnung: "Schlussrechnung",
    teilrechnung: "Teilrechnung",
    gutschrift: "Gutschrift",
  }[data.invoiceType] || "Rechnung";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; color: ${FF_COLORS.text}; margin: 0; padding: 40px; font-size: 10pt; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo { height: 50px; }
    .company-info { text-align: right; font-size: 8pt; color: ${FF_COLORS.dark}; line-height: 1.6; }
    .recipient { margin-bottom: 30px; line-height: 1.6; }
    .invoice-title { font-size: 18pt; font-weight: 700; color: ${FF_COLORS.primary}; margin-bottom: 5px; }
    .invoice-meta { display: flex; gap: 40px; margin-bottom: 30px; }
    .meta-item { }
    .meta-label { font-size: 8pt; color: ${FF_COLORS.dark}; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: ${FF_COLORS.lightGray}; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 9pt; border-bottom: 2px solid ${FF_COLORS.primary}; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals-row.total { border-top: 2px solid ${FF_COLORS.primary}; font-weight: 700; font-size: 12pt; padding-top: 10px; margin-top: 5px; }
    .payment-info { margin-top: 30px; padding: 15px; background: ${FF_COLORS.lightGray}; border-radius: 6px; font-size: 9pt; }
    .payment-info h4 { margin: 0 0 8px 0; color: ${FF_COLORS.primary}; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid ${FF_COLORS.border}; font-size: 7pt; color: ${FF_COLORS.dark}; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${FF_LOGO_URL}" alt="FassadenFix" class="logo" />
    <div class="company-info">
      FassadenFix GmbH<br>
      Musterstraße 1, 12345 Musterstadt<br>
      Tel: +49 123 456789<br>
      info@fassadenfix.de<br>
      USt-IdNr: DE123456789
    </div>
  </div>

  <div class="recipient">
    <strong>${data.companyName}</strong><br>
    ${data.contactName ? `z.Hd. ${data.contactName}<br>` : ""}
    ${data.companyAddress}
  </div>

  <div class="invoice-title">${invoiceTypeLabel} ${data.invoiceNumber}</div>
  
  <div class="invoice-meta">
    <div class="meta-item">
      <div class="meta-label">Rechnungsdatum</div>
      <div class="meta-value">${data.invoiceDate}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Fälligkeitsdatum</div>
      <div class="meta-value">${data.dueDate}</div>
    </div>
    ${data.projectNumber ? `
    <div class="meta-item">
      <div class="meta-label">Projekt</div>
      <div class="meta-value">${data.projectNumber}${data.projectName ? ` – ${data.projectName}` : ""}</div>
    </div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">Pos.</th>
        <th>Beschreibung</th>
        <th style="width: 60px; text-align: right;">Menge</th>
        <th style="width: 50px; text-align: center;">Einheit</th>
        <th style="width: 90px; text-align: right;">Einzelpreis</th>
        <th style="width: 90px; text-align: right;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${positionsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Nettobetrag</span>
      <span>${formatCurrency(data.netTotal)}</span>
    </div>
    <div class="totals-row">
      <span>MwSt. ${data.vatRate}%</span>
      <span>${formatCurrency(data.vatAmount)}</span>
    </div>
    <div class="totals-row total">
      <span>Gesamtbetrag</span>
      <span>${formatCurrency(data.grossTotal)}</span>
    </div>
  </div>

  <div class="payment-info">
    <h4>Zahlungsinformationen</h4>
    ${data.paymentTerms || "Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt."}<br><br>
    <strong>Bankverbindung:</strong><br>
    ${data.bankName || "Sparkasse Musterstadt"}<br>
    IBAN: ${data.iban || "DE89 3704 0044 0532 0130 00"}<br>
    BIC: ${data.bic || "COBADEFFXXX"}
  </div>

  ${data.notes ? `<div style="margin-top: 20px; font-size: 9pt; color: ${FF_COLORS.dark};">${data.notes}</div>` : ""}

  <div class="footer">
    FassadenFix GmbH · Geschäftsführer: Alexander Retzlaff · Amtsgericht Musterstadt HRB 12345 · Steuernummer: 123/456/78901
  </div>
</body>
</html>`;
}

// ============================================
// GARANTIE-PDF (Zertifikat)
// ============================================

interface WarrantyPdfData {
  warrantyNumber: string;
  issueDate: string;
  expiryDate: string;
  warrantyYears: number;
  // Kunde
  companyName: string;
  companyAddress: string;
  contactName?: string;
  // Projekt
  projectName: string;
  projectNumber: string;
  // Immobilie
  propertyAddress: string;
  totalArea: number;
  // Leistungen
  services: string[];
  // Fotos
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  // Bedingungen
  conditions?: string[];
}

export function generateWarrantyHtml(data: WarrantyPdfData): string {
  const servicesHtml = data.services.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join("");
  const conditionsHtml = (data.conditions || [
    "Die Garantie gilt für die durchgeführte Fassadenreinigung und Imprägnierung.",
    "Ausgenommen sind Schäden durch höhere Gewalt, mechanische Einwirkung oder bauliche Veränderungen.",
    "Die Garantie erlischt bei unsachgemäßer Nachbehandlung durch Dritte.",
    "Mängelansprüche sind unverzüglich nach Feststellung schriftlich anzuzeigen.",
  ]).map(c => `<li style="margin-bottom: 4px; font-size: 8pt;">${c}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; color: ${FF_COLORS.text}; margin: 0; padding: 0; }
    .certificate { padding: 40px; position: relative; }
    .border-frame { border: 3px solid ${FF_COLORS.primary}; border-radius: 12px; padding: 40px; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { height: 60px; margin-bottom: 15px; }
    .title { font-size: 24pt; font-weight: 700; color: ${FF_COLORS.primary}; margin: 0; }
    .subtitle { font-size: 11pt; color: ${FF_COLORS.dark}; margin-top: 5px; }
    .warranty-number { font-size: 10pt; color: ${FF_COLORS.dark}; margin-top: 10px; letter-spacing: 1px; }
    .divider { height: 2px; background: linear-gradient(90deg, transparent, ${FF_COLORS.primary}, transparent); margin: 25px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .info-block h4 { margin: 0 0 5px 0; font-size: 9pt; color: ${FF_COLORS.primary}; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-block p { margin: 0; line-height: 1.6; font-size: 10pt; }
    .validity { text-align: center; background: ${FF_COLORS.lightGray}; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
    .validity-period { font-size: 14pt; font-weight: 700; color: ${FF_COLORS.primary}; }
    .services { margin-bottom: 25px; }
    .services h4 { color: ${FF_COLORS.primary}; margin-bottom: 8px; }
    .services ul { margin: 0; padding-left: 20px; }
    .photos { display: flex; gap: 20px; margin-bottom: 25px; }
    .photo-box { flex: 1; text-align: center; }
    .photo-box img { max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid ${FF_COLORS.border}; }
    .photo-label { font-size: 8pt; color: ${FF_COLORS.dark}; margin-top: 5px; text-transform: uppercase; }
    .conditions { font-size: 8pt; color: ${FF_COLORS.dark}; }
    .conditions h4 { color: ${FF_COLORS.dark}; font-size: 9pt; }
    .signature { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
    .sig-block { text-align: center; width: 200px; }
    .sig-line { border-top: 1px solid ${FF_COLORS.dark}; margin-top: 40px; padding-top: 5px; font-size: 8pt; color: ${FF_COLORS.dark}; }
    .seal { position: absolute; bottom: 80px; right: 80px; width: 100px; height: 100px; border: 3px solid ${FF_COLORS.primary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8pt; font-weight: 700; color: ${FF_COLORS.primary}; transform: rotate(-15deg); opacity: 0.3; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-frame">
      <div class="header">
        <img src="${FF_LOGO_URL}" alt="FassadenFix" class="logo" /><br>
        <h1 class="title">GARANTIEURKUNDE</h1>
        <div class="subtitle">Qualitätsgarantie für professionelle Fassadenreinigung</div>
        <div class="warranty-number">Nr. ${data.warrantyNumber}</div>
      </div>

      <div class="divider"></div>

      <div class="info-grid">
        <div class="info-block">
          <h4>Auftraggeber</h4>
          <p>
            <strong>${data.companyName}</strong><br>
            ${data.contactName ? `${data.contactName}<br>` : ""}
            ${data.companyAddress}
          </p>
        </div>
        <div class="info-block">
          <h4>Objekt</h4>
          <p>
            <strong>${data.projectName}</strong><br>
            Projekt-Nr.: ${data.projectNumber}<br>
            ${data.propertyAddress}<br>
            Fläche: ${data.totalArea.toLocaleString("de-DE")} m²
          </p>
        </div>
      </div>

      <div class="validity">
        <div style="font-size: 9pt; color: ${FF_COLORS.dark};">Garantiezeitraum</div>
        <div class="validity-period">${data.warrantyYears} Jahre</div>
        <div style="font-size: 9pt; margin-top: 5px;">
          ${data.issueDate} – ${data.expiryDate}
        </div>
      </div>

      <div class="services">
        <h4>Durchgeführte Leistungen</h4>
        <ul>${servicesHtml}</ul>
      </div>

      ${data.beforePhotoUrl || data.afterPhotoUrl ? `
      <div class="photos">
        ${data.beforePhotoUrl ? `
        <div class="photo-box">
          <img src="${data.beforePhotoUrl}" alt="Vorher" />
          <div class="photo-label">Vorher</div>
        </div>` : ""}
        ${data.afterPhotoUrl ? `
        <div class="photo-box">
          <img src="${data.afterPhotoUrl}" alt="Nachher" />
          <div class="photo-label">Nachher</div>
        </div>` : ""}
      </div>` : ""}

      <div class="conditions">
        <h4>Garantiebedingungen</h4>
        <ol style="padding-left: 15px;">${conditionsHtml}</ol>
      </div>

      <div class="signature">
        <div class="sig-block">
          <div class="sig-line">Ort, Datum</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">Geschäftsführung FassadenFix GmbH</div>
        </div>
      </div>
    </div>

    <div class="seal">QUALITÄT<br>GARANTIERT</div>
  </div>
</body>
</html>`;
}

// ============================================
// HELPER
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export { type InvoicePdfData, type WarrantyPdfData, type InvoicePosition };
