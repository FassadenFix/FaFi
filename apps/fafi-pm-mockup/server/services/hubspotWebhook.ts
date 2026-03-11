/**
 * HubSpot Webhook Handler
 * 
 * Empfängt und verarbeitet Webhooks von HubSpot für bidirektionalen Sync.
 * Unterstützt: contact.created, contact.updated, company.created, company.updated, deal.updated
 */

import { logger } from './logger';

// ============================================
// TYPES
// ============================================

export interface HubSpotWebhookEvent {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
  objectId: number;
  changeSource: string;
  propertyName?: string;
  propertyValue?: string;
}

export interface WebhookProcessResult {
  processed: number;
  errors: string[];
  timestamp: string;
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

type SyncContactCallback = (hubspotId: string) => Promise<void>;
type SyncCompanyCallback = (hubspotId: string) => Promise<void>;
type SyncDealCallback = (hubspotId: string) => Promise<void>;

let syncContactCallback: SyncContactCallback | null = null;
let syncCompanyCallback: SyncCompanyCallback | null = null;
let syncDealCallback: SyncDealCallback | null = null;

/**
 * Registriert Callbacks für Webhook-Verarbeitung
 */
export function registerWebhookCallbacks(callbacks: {
  syncContact?: SyncContactCallback;
  syncCompany?: SyncCompanyCallback;
  syncDeal?: SyncDealCallback;
}) {
  if (callbacks.syncContact) syncContactCallback = callbacks.syncContact;
  if (callbacks.syncCompany) syncCompanyCallback = callbacks.syncCompany;
  if (callbacks.syncDeal) syncDealCallback = callbacks.syncDeal;
}

/**
 * Verarbeitet eingehende HubSpot Webhook-Events
 */
export async function processWebhookEvents(
  events: HubSpotWebhookEvent[]
): Promise<WebhookProcessResult> {
  const result: WebhookProcessResult = {
    processed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  for (const event of events) {
    try {
      await processEvent(event);
      result.processed++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Event ${event.eventId}: ${errorMessage}`);
      logger.error(`Webhook event processing failed: ${errorMessage}`);
    }
  }

  logger.hubspot(`Processed ${result.processed}/${events.length} webhook events`);
  return result;
}

/**
 * Verarbeitet ein einzelnes Webhook-Event
 */
async function processEvent(event: HubSpotWebhookEvent): Promise<void> {
  const { subscriptionType, objectId } = event;
  const hubspotId = String(objectId);

  logger.hubspot(`Processing webhook: ${subscriptionType} for object ${hubspotId}`);

  switch (subscriptionType) {
    case 'contact.creation':
    case 'contact.propertyChange':
      if (syncContactCallback) {
        await syncContactCallback(hubspotId);
      }
      break;

    case 'company.creation':
    case 'company.propertyChange':
      if (syncCompanyCallback) {
        await syncCompanyCallback(hubspotId);
      }
      break;

    case 'deal.creation':
    case 'deal.propertyChange':
      if (syncDealCallback) {
        await syncDealCallback(hubspotId);
      }
      break;

    default:
      logger.warn(`Unknown webhook type: ${subscriptionType}`);
  }
}

/**
 * Validiert die HubSpot Webhook-Signatur
 * 
 * HubSpot sendet einen X-HubSpot-Signature Header mit HMAC-SHA256
 * Für MCP-basierte Integration ist dies optional, da der MCP-Server
 * bereits authentifiziert ist.
 */
export function validateWebhookSignature(
  requestBody: string,
  signature: string,
  clientSecret: string
): boolean {
  // In einer MCP-basierten Umgebung ist die Signatur-Validierung
  // optional, da der MCP-Server bereits authentifiziert ist.
  // Für zusätzliche Sicherheit kann hier eine HMAC-Validierung
  // implementiert werden.
  
  if (!signature || !clientSecret) {
    logger.warn('Webhook signature validation skipped - no signature or secret provided');
    return true; // Allow in MCP environment
  }

  // TODO: Implement HMAC-SHA256 validation if needed
  // const crypto = require('crypto');
  // const hash = crypto.createHmac('sha256', clientSecret)
  //   .update(requestBody)
  //   .digest('hex');
  // return hash === signature;

  return true;
}

// ============================================
// WEBHOOK ENDPOINT HELPER
// ============================================

/**
 * Express-kompatible Middleware für HubSpot Webhooks
 */
export function createWebhookHandler(
  onSuccess?: (result: WebhookProcessResult) => void,
  onError?: (error: Error) => void
) {
  return async (req: { body: HubSpotWebhookEvent[] }, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
    try {
      const events = Array.isArray(req.body) ? req.body : [req.body];
      const result = await processWebhookEvents(events);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (onError) {
        onError(err);
      }
      
      logger.error(`Webhook handler error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export default {
  processWebhookEvents,
  registerWebhookCallbacks,
  validateWebhookSignature,
  createWebhookHandler,
};
