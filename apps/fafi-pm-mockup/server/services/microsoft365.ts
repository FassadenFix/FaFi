/**
 * Microsoft 365 Integration Service (v7.1)
 * 
 * SSO Login-Flow (OAuth2 Authorization Code Flow mit PKCE)
 * Graph API E-Mail-Versand im Namen des Mitarbeiters
 * Token-Refresh Middleware
 */

import * as db from "../db";

// ============================================
// Configuration
// ============================================

interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

function getConfig(): MicrosoftConfig {
  return {
    clientId: process.env.MS365_CLIENT_ID || "",
    clientSecret: process.env.MS365_CLIENT_SECRET || "",
    tenantId: process.env.MS365_TENANT_ID || "common",
    redirectUri: "", // Set dynamically from frontend origin
    scopes: [
      "openid",
      "profile",
      "email",
      "User.Read",
      "Mail.Send",
      "Mail.ReadWrite",
      "Calendars.ReadWrite",
      "offline_access",
    ],
  };
}

// ============================================
// SSO Login Flow
// ============================================

/**
 * Generiert die Microsoft Login-URL für den SSO-Flow
 */
export function getLoginUrl(origin: string, state?: string): string {
  const config = getConfig();
  const redirectUri = `${origin}/api/auth/microsoft/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: config.scopes.join(" "),
    state: state || "",
  });

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Tauscht den Authorization Code gegen Tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  origin: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idToken: string;
} | null> {
  const config = getConfig();
  if (!config.clientId) return null;

  const redirectUri = `${origin}/api/auth/microsoft/callback`;

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          scope: config.scopes.join(" "),
        }),
      },
    );

    if (!response.ok) {
      console.error("[MS365] Token exchange failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || "",
      expiresIn: data.expires_in || 3600,
      idToken: data.id_token || "",
    };
  } catch (error) {
    console.error("[MS365] Token exchange error:", error);
    return null;
  }
}

/**
 * Erneuert den Access Token mit dem Refresh Token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const config = getConfig();
  if (!config.clientId || !refreshToken) return null;

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: config.scopes.join(" "),
        }),
      },
    );

    if (!response.ok) {
      console.error("[MS365] Token refresh failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 3600,
    };
  } catch (error) {
    console.error("[MS365] Token refresh error:", error);
    return null;
  }
}

/**
 * Holt das Microsoft-Profil des Benutzers
 */
export async function getMicrosoftProfile(
  accessToken: string,
): Promise<{
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
} | null> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error("[MS365] Profile fetch failed:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[MS365] Profile fetch error:", error);
    return null;
  }
}

// ============================================
// Graph API E-Mail-Versand
// ============================================

interface EmailAttachment {
  name: string;
  contentType: string;
  contentBytes: string; // Base64 encoded
}

interface SendEmailParams {
  accessToken: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlBody: string;
  attachments?: EmailAttachment[];
  saveToSentItems?: boolean;
}

/**
 * Sendet eine E-Mail über Microsoft Graph API im Namen des Benutzers
 */
export async function sendEmailViaGraph(params: SendEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const {
    accessToken,
    to,
    cc = [],
    bcc = [],
    subject,
    htmlBody,
    attachments = [],
    saveToSentItems = true,
  } = params;

  const message: any = {
    subject,
    body: {
      contentType: "HTML",
      content: htmlBody,
    },
    toRecipients: to.map((email) => ({
      emailAddress: { address: email },
    })),
  };

  if (cc.length > 0) {
    message.ccRecipients = cc.map((email) => ({
      emailAddress: { address: email },
    }));
  }

  if (bcc.length > 0) {
    message.bccRecipients = bcc.map((email) => ({
      emailAddress: { address: email },
    }));
  }

  if (attachments.length > 0) {
    message.attachments = attachments.map((att) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: att.name,
      contentType: att.contentType,
      contentBytes: att.contentBytes,
    }));
  }

  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/sendMail",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          saveToSentItems,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MS365] Send email failed:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("[MS365] Send email error:", error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// Token Management
// ============================================

/**
 * Prüft ob der Token eines Benutzers noch gültig ist und erneuert ihn ggf.
 */
export async function ensureValidToken(
  userId: number,
): Promise<string | null> {
  const user = await db.getUserById(userId);
  if (!user || !user.microsoftRefreshToken) return null;

  // Prüfe ob Token noch gültig (mit 5 Min Puffer)
  if (user.microsoftTokenExpiry && user.microsoftAccessToken) {
    const expiry = new Date(user.microsoftTokenExpiry);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    if (expiry > now) {
      return user.microsoftAccessToken;
    }
  }

  // Token erneuern
  const tokens = await refreshAccessToken(user.microsoftRefreshToken);
  if (!tokens) return null;

  // Tokens in DB speichern
  const expiry = new Date();
  expiry.setSeconds(expiry.getSeconds() + tokens.expiresIn);

  await db.updateUser(userId, {
    microsoftAccessToken: tokens.accessToken,
    microsoftRefreshToken: tokens.refreshToken,
    microsoftTokenExpiry: expiry,
  });

  return tokens.accessToken;
}

/**
 * Prüft ob Microsoft 365 Integration konfiguriert ist
 */
export function isConfigured(): boolean {
  return !!(process.env.MS365_CLIENT_ID && process.env.MS365_CLIENT_SECRET);
}

/**
 * Status-Mapping für FaFi → HubSpot (v7.2 Vorbereitung)
 */
// ============================================
// Outlook-Kalender-Sync
// ============================================

interface CalendarEvent {
  subject: string;
  body?: { contentType: "text" | "html"; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  categories?: string[];
}

/**
 * Erstellt einen Kalender-Eintrag in Outlook über die Graph API
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: (errorData as any)?.error?.message || `HTTP ${response.status}` };
    }

    const data = await response.json() as { id: string };
    return { success: true, eventId: data.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Synchronisiert Baustellen-Termine in den Outlook-Kalender
 */
export async function syncConstructionSiteToCalendar(
  accessToken: string,
  site: {
    name: string;
    address: string;
    startDate: Date;
    endDate: Date;
    projectLeader?: string;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const event: CalendarEvent = {
    subject: `🏗️ Baustelle: ${site.name}`,
    body: {
      contentType: "html",
      content: `<p><strong>Baustelle:</strong> ${site.name}</p>
        <p><strong>Adresse:</strong> ${site.address}</p>
        ${site.projectLeader ? `<p><strong>Projektleiter:</strong> ${site.projectLeader}</p>` : ""}
        <p><em>Automatisch synchronisiert von FaFi PM</em></p>`,
    },
    start: {
      dateTime: site.startDate.toISOString().split("T")[0] + "T08:00:00",
      timeZone: "Europe/Berlin",
    },
    end: {
      dateTime: site.endDate.toISOString().split("T")[0] + "T17:00:00",
      timeZone: "Europe/Berlin",
    },
    location: { displayName: site.address },
    categories: ["FassadenFix Baustelle"],
  };

  return createCalendarEvent(accessToken, event);
}

/**
 * Löscht einen Kalender-Eintrag aus Outlook
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { success: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export const FAFI_TO_HUBSPOT_STAGE: Record<string, string> = {
  angebot_erstellt: "Angebot erstellt",
  angebot_versendet: "Angebot versendet",
  auftrag_gewonnen: "Auftrag gewonnen",
  abgeschlossen: "Abgeschlossen gewonnen",
  verloren: "Verloren",
};
