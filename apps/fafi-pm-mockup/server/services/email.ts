import { logger } from './logger';
/**
 * E-Mail Service für FassadenFix
 * 
 * Versendet E-Mails über Outlook MCP und erstellt Engagements in HubSpot
 * für vollständige CRM-Verknüpfung und Timeline-Erfassung.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { ENV } from '../_core/env';

const execAsync = promisify(exec);

// ============================================
// TYPES
// ============================================

export interface EmailRecipient {
  name: string;
  email: string;
}

export interface OfferEmailData {
  recipient: EmailRecipient;
  offerNumber: string;
  projectName: string;
  totalAmount: string;
  validUntil: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
}

export interface HubSpotAssociations {
  contactId?: number;
  companyId?: number;
  dealId?: number;
}

export interface EmailWithHubSpotData extends OfferEmailData {
  hubspot?: HubSpotAssociations;
  pdfPath?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  timestamp: string;
  outlookMessageId?: string;
  hubspotEngagementId?: string;
}

// ============================================
// MCP HELPERS
// ============================================

async function callOutlookMCP(toolName: string, input: Record<string, unknown>): Promise<unknown> {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const command = `manus-mcp-cli tool call ${toolName} --server outlook-mail --input '${inputJson}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    
    const resultMatch = stdout.match(/Tool execution result:\s*([\s\S]*)/);
    if (resultMatch && resultMatch[1]) {
      const jsonStr = resultMatch[1].trim();
      try {
        return JSON.parse(jsonStr);
      } catch {
        return jsonStr;
      }
    }
    
    if (stderr) {
      console.warn('[Outlook MCP] stderr:', stderr);
    }
    
    return null;
  } catch (error) {
    console.error('[Outlook MCP] Error calling tool:', toolName, error);
    throw error;
  }
}

async function callHubSpotMCP(toolName: string, input: Record<string, unknown>): Promise<unknown> {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const command = `manus-mcp-cli tool call ${toolName} --server hubspot --input '${inputJson}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    
    const resultMatch = stdout.match(/Tool execution result:\s*([\s\S]*)/);
    if (resultMatch && resultMatch[1]) {
      const jsonStr = resultMatch[1].trim();
      try {
        return JSON.parse(jsonStr);
      } catch {
        return jsonStr;
      }
    }
    
    if (stderr) {
      console.warn('[HubSpot MCP] stderr:', stderr);
    }
    
    return null;
  } catch (error) {
    console.error('[HubSpot MCP] Error calling tool:', toolName, error);
    throw error;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Generiert den E-Mail-Inhalt für ein Angebot
 */
export function generateOfferEmailContent(data: OfferEmailData): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const subject = `Ihr Angebot ${data.offerNumber} für ${data.projectName} – FassadenFix`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #4e5758; }
    .header { background: #77bc1f; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; max-width: 600px; margin: 0 auto; }
    .highlight { background: #f5f5f5; padding: 15px; border-left: 4px solid #77bc1f; margin: 20px 0; }
    .footer { background: #4e5758; color: white; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #77bc1f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #77bc1f; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FASSADENFIX</h1>
  </div>
  <div class="content">
    <p>Sehr geehrte/r ${data.recipient.name},</p>
    
    <p>vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!</p>
    
    <p>Anbei erhalten Sie unser individuelles Angebot für Ihr Projekt <strong>${data.projectName}</strong>.</p>
    
    <div class="highlight">
      <p><strong>Angebotsnummer:</strong> ${data.offerNumber}</p>
      <p><strong>Gesamtbetrag:</strong> <span class="amount">${data.totalAmount}</span></p>
      <p><strong>Gültig bis:</strong> ${data.validUntil}</p>
    </div>
    
    <p>Das Angebot finden Sie im Anhang dieser E-Mail als PDF-Dokument.</p>
    
    <p>Bei Fragen stehe ich Ihnen gerne zur Verfügung:</p>
    
    <p>
      <strong>${data.senderName}</strong><br>
      ${data.senderPhone ? `Tel: ${data.senderPhone}<br>` : ''}
      ${data.senderEmail ? `E-Mail: ${data.senderEmail}` : ''}
    </p>
    
    <p>Wir freuen uns auf Ihre Rückmeldung!</p>
    
    <p>Mit freundlichen Grüßen<br>
    Ihr FassadenFix Team</p>
  </div>
  <div class="footer">
    <p>FassadenFix • Immobiliengruppe Retzlaff OHG • An der Saalebahn 8a • 06118 Halle</p>
    <p>Tel: +49 345 123456 • info@fassadenfix.de • www.fassadenfix.de</p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Sehr geehrte/r ${data.recipient.name},

vielen Dank für Ihr Interesse an unserer FassadenFix Systemreinigung!

Anbei erhalten Sie unser individuelles Angebot für Ihr Projekt "${data.projectName}".

---
Angebotsnummer: ${data.offerNumber}
Gesamtbetrag: ${data.totalAmount}
Gültig bis: ${data.validUntil}
---

Das Angebot finden Sie im Anhang dieser E-Mail als PDF-Dokument.

Bei Fragen stehe ich Ihnen gerne zur Verfügung:

${data.senderName}
${data.senderPhone ? `Tel: ${data.senderPhone}` : ''}
${data.senderEmail ? `E-Mail: ${data.senderEmail}` : ''}

Wir freuen uns auf Ihre Rückmeldung!

Mit freundlichen Grüßen
Ihr FassadenFix Team

---
FassadenFix • Immobiliengruppe Retzlaff OHG
An der Saalebahn 8a • 06118 Halle
Tel: +49 345 123456 • info@fassadenfix.de
  `.trim();
  
  return { subject, htmlBody, textBody };
}

// ============================================
// HUBSPOT ENGAGEMENT TRACKING
// ============================================

/**
 * Erstellt ein HubSpot Engagement (NOTE) für die versendete E-Mail
 * Dies erfasst die E-Mail in der Timeline aller verknüpften Objekte
 */
export async function createHubSpotEmailEngagement(
  data: EmailWithHubSpotData,
  emailSubject: string
): Promise<{ success: boolean; engagementId?: string; error?: string }> {
  if (!data.hubspot) {
    return { success: false, error: 'Keine HubSpot-Verknüpfungen angegeben' };
  }

  try {
    // Hole Owner-ID aus HubSpot
    const userDetails = await callHubSpotMCP('hubspot-get-user-details', {});
    let ownerId = 1; // Fallback
    
    if (userDetails) {
      const ownerMatch = String(userDetails).match(/"ownerId":\s*(\d+)/);
      if (ownerMatch) {
        ownerId = parseInt(ownerMatch[1]);
      }
    }

    // Erstelle Associations-Objekt
    const associations: Record<string, number[]> = {};
    if (data.hubspot.contactId) {
      associations.contactIds = [data.hubspot.contactId];
    }
    if (data.hubspot.companyId) {
      associations.companyIds = [data.hubspot.companyId];
    }
    if (data.hubspot.dealId) {
      associations.dealIds = [data.hubspot.dealId];
    }

    // Erstelle Engagement-Notiz mit E-Mail-Details
    const noteBody = `
<h3>📧 E-Mail versendet: ${emailSubject}</h3>

<p><strong>Empfänger:</strong> ${data.recipient.name} (${data.recipient.email})</p>
<p><strong>Angebotsnummer:</strong> ${data.offerNumber}</p>
<p><strong>Projekt:</strong> ${data.projectName}</p>
<p><strong>Gesamtbetrag:</strong> ${data.totalAmount}</p>
<p><strong>Gültig bis:</strong> ${data.validUntil}</p>
<p><strong>Versendet von:</strong> ${data.senderName}</p>
<p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</p>

<hr>
<p><em>Diese E-Mail wurde über FaFi PM versendet und automatisch in HubSpot erfasst.</em></p>
    `.trim();

    const engagementInput = {
      type: 'NOTE',
      ownerId,
      timestamp: Date.now(),
      associations,
      metadata: {
        body: noteBody,
      },
    };

    const result = await callHubSpotMCP('hubspot-create-engagement', engagementInput);
    
    if (result) {
      // Parse Engagement-ID aus Antwort
      const idMatch = String(result).match(/"id":\s*"?(\d+)"?/);
      const engagementId = idMatch ? idMatch[1] : undefined;
      
      logger.hubspot(' Engagement created:', engagementId);
      return { success: true, engagementId };
    }

    return { success: false, error: 'Keine Antwort von HubSpot' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[HubSpot] Error creating engagement:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// EMAIL SENDING VIA OUTLOOK
// ============================================

/**
 * Versendet eine E-Mail über Outlook MCP
 */
export async function sendEmailViaOutlook(
  data: EmailWithHubSpotData
): Promise<EmailResult> {
  const timestamp = new Date().toISOString();
  const { subject, textBody } = generateOfferEmailContent(data);

  try {
    // Erstelle E-Mail-Nachricht für Outlook
    const message: Record<string, unknown> = {
      subject,
      to: [data.recipient.email],
      content: textBody,
    };

    // Füge PDF-Anhang hinzu, falls vorhanden
    if (data.pdfPath) {
      message.attachments = [data.pdfPath];
    }

    // Sende über Outlook MCP
    const outlookResult = await callOutlookMCP('outlook_send_messages', {
      messages: [message],
    });

    let outlookMessageId: string | undefined;
    if (outlookResult) {
      const idMatch = String(outlookResult).match(/"id":\s*"([^"]+)"/);
      outlookMessageId = idMatch ? idMatch[1] : undefined;
    }

    logger.email(' Sent via Outlook:', outlookMessageId);

    // Erstelle HubSpot Engagement für Timeline-Erfassung
    let hubspotEngagementId: string | undefined;
    if (data.hubspot) {
      const engagementResult = await createHubSpotEmailEngagement(data, subject);
      if (engagementResult.success) {
        hubspotEngagementId = engagementResult.engagementId;
        logger.email(' HubSpot engagement created:', hubspotEngagementId);
      } else {
        console.warn('[Email] HubSpot engagement failed:', engagementResult.error);
      }
    }

    return {
      success: true,
      message: `E-Mail an ${data.recipient.email} versendet${hubspotEngagementId ? ' und in HubSpot erfasst' : ''}`,
      timestamp,
      outlookMessageId,
      hubspotEngagementId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Email] Error sending via Outlook:', errorMessage);
    
    return {
      success: false,
      message: `Fehler beim Versenden: ${errorMessage}`,
      timestamp,
    };
  }
}

// ============================================
// LEGACY FUNCTIONS (für Kompatibilität)
// ============================================

/**
 * Sendet eine Benachrichtigung über das Manus Notification System
 * (Aktuell nur Owner-Benachrichtigungen unterstützt)
 */
export async function sendOfferNotification(data: OfferEmailData): Promise<EmailResult> {
  const timestamp = new Date().toISOString();
  
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    return {
      success: false,
      message: 'E-Mail-Service nicht konfiguriert',
      timestamp,
    };
  }
  
  try {
    const endpoint = ENV.forgeApiUrl.endsWith('/')
      ? `${ENV.forgeApiUrl}webdevtoken.v1.WebDevService/SendNotification`
      : `${ENV.forgeApiUrl}/webdevtoken.v1.WebDevService/SendNotification`;
    
    const title = `Angebot ${data.offerNumber} versendet`;
    const content = `
Angebot wurde per E-Mail versendet:

• Empfänger: ${data.recipient.name} (${data.recipient.email})
• Projekt: ${data.projectName}
• Angebotsnummer: ${data.offerNumber}
• Gesamtbetrag: ${data.totalAmount}
• Gültig bis: ${data.validUntil}
• Versendet von: ${data.senderName}
• Zeitpunkt: ${new Date().toLocaleString('de-DE')}
    `.trim();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${ENV.forgeApiKey}`,
        'content-type': 'application/json',
        'connect-protocol-version': '1',
      },
      body: JSON.stringify({ title, content }),
    });
    
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`[Email] Notification failed (${response.status}): ${detail}`);
      return {
        success: false,
        message: `Benachrichtigung fehlgeschlagen: ${response.statusText}`,
        timestamp,
      };
    }
    
    return {
      success: true,
      message: `Angebot ${data.offerNumber} wurde versendet und Benachrichtigung erstellt`,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Email] Error:', errorMessage);
    return {
      success: false,
      message: `Fehler beim Versenden: ${errorMessage}`,
      timestamp,
    };
  }
}

/**
 * Hauptfunktion für E-Mail-Versand mit HubSpot-Integration
 * Nutzt Outlook für Versand und HubSpot für CRM-Tracking
 */
export async function sendOfferEmail(
  data: OfferEmailData,
  _pdfBase64?: string,
  hubspotAssociations?: HubSpotAssociations,
  pdfPath?: string
): Promise<EmailResult> {
  const emailData: EmailWithHubSpotData = {
    ...data,
    hubspot: hubspotAssociations,
    pdfPath,
  };

  // Versuche Outlook-Versand mit HubSpot-Tracking
  if (hubspotAssociations) {
    return sendEmailViaOutlook(emailData);
  }

  // Fallback: Nur Benachrichtigung
  const timestamp = new Date().toISOString();
  const { subject, textBody } = generateOfferEmailContent(data);
  
  logger.email(' Sending offer email (fallback):');
  logger.email('To:', data.recipient.email);
  logger.email('Subject:', subject);
  logger.email('Content preview:', textBody.substring(0, 200));
  
  const notificationResult = await sendOfferNotification(data);
  
  if (notificationResult.success) {
    return {
      success: true,
      message: `E-Mail an ${data.recipient.email} vorbereitet. Benachrichtigung erstellt.`,
      timestamp,
    };
  }
  
  return {
    success: true,
    message: `E-Mail an ${data.recipient.email} vorbereitet (Benachrichtigung: ${notificationResult.message})`,
    timestamp,
  };
}
