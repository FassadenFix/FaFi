import { logger } from './logger';
/**
 * HubSpot Sync Service
 * 
 * Synchronisiert Kontakte und Unternehmen zwischen HubSpot und der lokalen Datenbank.
 * Nutzt den HubSpot MCP-Server für API-Zugriff.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================
// TYPES
// ============================================

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    company?: string;
    createdate?: string;
    lastmodifieddate?: string;
    hs_object_id?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    domain?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    createdate?: string;
    hs_lastmodifieddate?: string;
    hs_object_id?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotListResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

export interface SyncResult {
  success: boolean;
  contactsImported: number;
  companiesImported: number;
  errors: string[];
  timestamp: string;
}

// ============================================
// MCP HELPER
// ============================================

async function callHubSpotMCP(toolName: string, input: Record<string, unknown>): Promise<unknown> {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const command = `manus-mcp-cli tool call ${toolName} --server hubspot --input '${inputJson}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    
    // Parse the output - MCP CLI returns the result after "Tool execution result:"
    const resultMatch = stdout.match(/Tool execution result:\s*([\s\S]*)/);
    if (resultMatch && resultMatch[1]) {
      const jsonStr = resultMatch[1].trim();
      // Try to parse as JSON
      try {
        return JSON.parse(jsonStr);
      } catch {
        // If not JSON, return as string
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
// HUBSPOT API FUNCTIONS
// ============================================

/**
 * Holt alle Kontakte aus HubSpot (paginiert)
 */
export async function fetchHubSpotContacts(limit: number = 100): Promise<HubSpotContact[]> {
  const allContacts: HubSpotContact[] = [];
  let after: string | undefined;
  
  do {
    const input: Record<string, unknown> = {
      objectType: 'contacts',
      limit: Math.min(limit, 100),
      properties: ['firstname', 'lastname', 'email', 'phone', 'company'],
    };
    
    if (after) {
      input.after = after;
    }
    
    const response = await callHubSpotMCP('hubspot-list-objects', input) as HubSpotListResponse<HubSpotContact>;
    
    if (response?.results) {
      allContacts.push(...response.results);
    }
    
    after = response?.paging?.next?.after;
    
    // Limit to prevent infinite loops
    if (allContacts.length >= limit) {
      break;
    }
  } while (after);
  
  return allContacts.slice(0, limit);
}

/**
 * Holt alle Unternehmen aus HubSpot (paginiert)
 */
export async function fetchHubSpotCompanies(limit: number = 100): Promise<HubSpotCompany[]> {
  const allCompanies: HubSpotCompany[] = [];
  let after: string | undefined;
  
  do {
    const input: Record<string, unknown> = {
      objectType: 'companies',
      limit: Math.min(limit, 100),
      properties: ['name', 'domain', 'phone', 'city', 'state', 'country'],
    };
    
    if (after) {
      input.after = after;
    }
    
    const response = await callHubSpotMCP('hubspot-list-objects', input) as HubSpotListResponse<HubSpotCompany>;
    
    if (response?.results) {
      allCompanies.push(...response.results);
    }
    
    after = response?.paging?.next?.after;
    
    // Limit to prevent infinite loops
    if (allCompanies.length >= limit) {
      break;
    }
  } while (after);
  
  return allCompanies.slice(0, limit);
}

/**
 * Sucht Kontakte in HubSpot
 */
export async function searchHubSpotContacts(query: string): Promise<HubSpotContact[]> {
  const response = await callHubSpotMCP('hubspot-search-objects', {
    objectType: 'contacts',
    query,
    properties: ['firstname', 'lastname', 'email', 'phone', 'company'],
    limit: 20,
  }) as HubSpotListResponse<HubSpotContact>;
  
  return response?.results || [];
}

/**
 * Sucht Unternehmen in HubSpot
 */
export async function searchHubSpotCompanies(query: string): Promise<HubSpotCompany[]> {
  const response = await callHubSpotMCP('hubspot-search-objects', {
    objectType: 'companies',
    query,
    properties: ['name', 'domain', 'phone', 'city', 'state', 'country'],
    limit: 20,
  }) as HubSpotListResponse<HubSpotCompany>;
  
  return response?.results || [];
}

/**
 * Holt HubSpot Account-Informationen
 */
export async function getHubSpotAccountInfo(): Promise<{
  hubId: number;
  accountType: string;
  timeZone: string;
  uiDomain: string;
} | null> {
  try {
    const response = await callHubSpotMCP('hubspot-get-user-details', {}) as {
      TokenInfo?: { hubId: number };
      AccountInfo?: {
        accountType: string;
        timeZone: string;
        uiDomain: string;
      };
    };
    
    if (response) {
      // Parse the response - it comes as a formatted string
      const tokenMatch = String(response).match(/"hubId":\s*(\d+)/);
      const accountTypeMatch = String(response).match(/"accountType":\s*"([^"]+)"/);
      const timeZoneMatch = String(response).match(/"timeZone":\s*"([^"]+)"/);
      const uiDomainMatch = String(response).match(/"uiDomain":\s*"([^"]+)"/);
      
      return {
        hubId: tokenMatch ? parseInt(tokenMatch[1]) : 0,
        accountType: accountTypeMatch ? accountTypeMatch[1] : 'unknown',
        timeZone: timeZoneMatch ? timeZoneMatch[1] : 'Europe/Berlin',
        uiDomain: uiDomainMatch ? uiDomainMatch[1] : 'app.hubspot.com',
      };
    }
    
    return null;
  } catch (error) {
    console.error('[HubSpot] Error getting account info:', error);
    return null;
  }
}

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Konvertiert HubSpot-Kontakt zu lokalem Format
 */
export function hubspotContactToLocal(contact: HubSpotContact): {
  hubspotId: string;
  firstName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
} {
  return {
    hubspotId: contact.id,
    firstName: contact.properties.firstname || null,
    lastName: contact.properties.lastname || 'Unbekannt',
    email: contact.properties.email || null,
    phone: contact.properties.phone || null,
  };
}

/**
 * Konvertiert HubSpot-Unternehmen zu lokalem Format
 */
export function hubspotCompanyToLocal(company: HubSpotCompany): {
  hubspotId: string;
  name: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
} {
  return {
    hubspotId: company.id,
    name: company.properties.name || 'Unbekannt',
    phone: company.properties.phone || null,
    city: company.properties.city || null,
    country: company.properties.country || null,
    website: company.properties.domain ? `https://${company.properties.domain}` : null,
  };
}

/**
 * Führt einen vollständigen Sync durch
 */
export async function performFullSync(
  importContacts: (contacts: ReturnType<typeof hubspotContactToLocal>[]) => Promise<number>,
  importCompanies: (companies: ReturnType<typeof hubspotCompanyToLocal>[]) => Promise<number>
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    contactsImported: 0,
    companiesImported: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Sync Companies first (contacts may reference them)
    logger.hubspot(' Fetching companies...');
    const hubspotCompanies = await fetchHubSpotCompanies(500);
    const localCompanies = hubspotCompanies.map(hubspotCompanyToLocal);
    result.companiesImported = await importCompanies(localCompanies);
    logger.hubspot(`Imported ${result.companiesImported} companies`);
    
    // Sync Contacts
    logger.hubspot(' Fetching contacts...');
    const hubspotContacts = await fetchHubSpotContacts(500);
    const localContacts = hubspotContacts.map(hubspotContactToLocal);
    result.contactsImported = await importContacts(localContacts);
    logger.hubspot(`Imported ${result.contactsImported} contacts`);
    
    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);
    console.error('[HubSpot Sync] Error:', errorMessage);
  }
  
  return result;
}


// ============================================
// DEAL TYPES
// ============================================

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    createdate?: string;
    hs_lastmodifieddate?: string;
    hs_object_id?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface CreateDealInput {
  dealname: string;
  amount?: number;
  pipeline?: string;
  dealstage?: string;
  closedate?: string;
  description?: string;
  // Associations
  contactId?: number;
  companyId?: number;
}

// ============================================
// DEAL FUNCTIONS
// ============================================

/**
 * Holt alle Deals aus HubSpot (paginiert)
 */
export async function fetchHubSpotDeals(limit: number = 100): Promise<HubSpotDeal[]> {
  const allDeals: HubSpotDeal[] = [];
  let after: string | undefined;
  
  do {
    const input: Record<string, unknown> = {
      objectType: 'deals',
      limit: Math.min(limit, 100),
      properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'description'],
    };
    
    if (after) {
      input.after = after;
    }
    
    const response = await callHubSpotMCP('hubspot-list-objects', input) as HubSpotListResponse<HubSpotDeal>;
    
    if (response?.results) {
      allDeals.push(...response.results);
    }
    
    after = response?.paging?.next?.after;
    
    if (allDeals.length >= limit) {
      break;
    }
  } while (after);
  
  return allDeals.slice(0, limit);
}

/**
 * Sucht Deals in HubSpot
 */
export async function searchHubSpotDeals(query: string): Promise<HubSpotDeal[]> {
  const response = await callHubSpotMCP('hubspot-search-objects', {
    objectType: 'deals',
    query,
    properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'description'],
    limit: 20,
  }) as HubSpotListResponse<HubSpotDeal>;
  
  return response?.results || [];
}

/**
 * Holt Deals, die mit einem Unternehmen verknüpft sind
 */
export async function getDealsForCompany(hubspotCompanyId: string): Promise<HubSpotDeal[]> {
  try {
    // Get associated deal IDs
    const associations = await callHubSpotMCP('hubspot-list-associations', {
      fromObjectType: 'companies',
      toObjectType: 'deals',
      objectId: hubspotCompanyId,
    }) as { results?: { toObjectId: string }[] };
    
    if (!associations?.results?.length) {
      return [];
    }
    
    // Fetch deal details
    const dealIds = associations.results.map(a => a.toObjectId);
    const dealsResponse = await callHubSpotMCP('hubspot-batch-read-objects', {
      objectType: 'deals',
      ids: dealIds,
      properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'description'],
    }) as { results?: HubSpotDeal[] };
    
    return dealsResponse?.results || [];
  } catch (error) {
    console.error('[HubSpot] Error getting deals for company:', error);
    return [];
  }
}

/**
 * Erstellt einen neuen Deal in HubSpot
 */
export async function createHubSpotDeal(input: CreateDealInput): Promise<HubSpotDeal | null> {
  try {
    const associations: { types: { associationCategory: string; associationTypeId: number }[]; to: { id: string } }[] = [];
    
    // Add company association if provided
    if (input.companyId) {
      associations.push({
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }], // Primary company
        to: { id: String(input.companyId) },
      });
    }
    
    // Add contact association if provided
    if (input.contactId) {
      associations.push({
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }], // Deal to contact
        to: { id: String(input.contactId) },
      });
    }
    
    const createInput: Record<string, unknown> = {
      objectType: 'deals',
      inputs: [{
        properties: {
          dealname: input.dealname,
          amount: input.amount ? String(input.amount) : undefined,
          pipeline: input.pipeline || '69732845', // Default FassadenFix pipeline
          dealstage: input.dealstage || '167387631', // Default stage
          closedate: input.closedate,
          description: input.description,
        },
        associations: associations.length > 0 ? associations : undefined,
      }],
    };
    
    const response = await callHubSpotMCP('hubspot-batch-create-objects', createInput) as {
      results?: HubSpotDeal[];
    };
    
    return response?.results?.[0] || null;
  } catch (error) {
    console.error('[HubSpot] Error creating deal:', error);
    return null;
  }
}

/**
 * Aktualisiert einen Deal in HubSpot
 */
export async function updateHubSpotDeal(dealId: string, properties: Record<string, string>): Promise<boolean> {
  try {
    await callHubSpotMCP('hubspot-batch-update-objects', {
      objectType: 'deals',
      inputs: [{
        id: dealId,
        properties,
      }],
    });
    return true;
  } catch (error) {
    console.error('[HubSpot] Error updating deal:', error);
    return false;
  }
}

// ============================================
// BIDIRECTIONAL SYNC - PUSH TO HUBSPOT
// ============================================

/**
 * Erstellt einen Kontakt in HubSpot
 */
export async function createHubSpotContact(contact: {
  firstName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId?: string;
}): Promise<string | null> {
  try {
    const associations = contact.companyId ? [{
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 279 }], // Contact to company
      to: { id: contact.companyId },
    }] : undefined;
    
    const response = await callHubSpotMCP('hubspot-batch-create-objects', {
      objectType: 'contacts',
      inputs: [{
        properties: {
          firstname: contact.firstName || '',
          lastname: contact.lastName,
          email: contact.email || '',
          phone: contact.phone || '',
        },
        associations,
      }],
    }) as { results?: { id: string }[] };
    
    return response?.results?.[0]?.id || null;
  } catch (error) {
    console.error('[HubSpot] Error creating contact:', error);
    return null;
  }
}

/**
 * Erstellt ein Unternehmen in HubSpot
 */
export async function createHubSpotCompany(company: {
  name: string;
  phone?: string;
  city?: string;
  country?: string;
  website?: string;
}): Promise<string | null> {
  try {
    const response = await callHubSpotMCP('hubspot-batch-create-objects', {
      objectType: 'companies',
      inputs: [{
        properties: {
          name: company.name,
          phone: company.phone || '',
          city: company.city || '',
          country: company.country || 'Deutschland',
          domain: company.website?.replace(/^https?:\/\//, '') || '',
        },
      }],
    }) as { results?: { id: string }[] };
    
    return response?.results?.[0]?.id || null;
  } catch (error) {
    console.error('[HubSpot] Error creating company:', error);
    return null;
  }
}

/**
 * Erstellt ein Engagement (Note) in HubSpot für Timeline-Tracking
 */
export async function createHubSpotEngagement(input: {
  type: 'NOTE' | 'TASK';
  body: string;
  contactIds?: number[];
  companyIds?: number[];
  dealIds?: number[];
}): Promise<boolean> {
  try {
    const associations: Record<string, number[]> = {};
    
    if (input.contactIds?.length) {
      associations.contactIds = input.contactIds;
    }
    if (input.companyIds?.length) {
      associations.companyIds = input.companyIds;
    }
    if (input.dealIds?.length) {
      associations.dealIds = input.dealIds;
    }
    
    await callHubSpotMCP('hubspot-create-engagement', {
      engagementType: input.type,
      body: input.body,
      associations,
    });
    
    return true;
  } catch (error) {
    console.error('[HubSpot] Error creating engagement:', error);
    return false;
  }
}

/**
 * Erstellt Assoziationen zwischen HubSpot-Objekten
 */
export async function createHubSpotAssociation(
  fromType: string,
  fromId: string,
  toType: string,
  toId: string,
  associationTypeId: number
): Promise<boolean> {
  try {
    await callHubSpotMCP('hubspot-batch-create-associations', {
      fromObjectType: fromType,
      toObjectType: toType,
      associations: [{
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId }],
      }],
      inputs: [{
        from: { id: fromId },
        to: { id: toId },
      }],
    });
    return true;
  } catch (error) {
    console.error('[HubSpot] Error creating association:', error);
    return false;
  }
}

// ============================================
// SYNC STATUS
// ============================================

export interface SyncStatus {
  lastSync: string | null;
  contactsTotal: number;
  companiesTotal: number;
  dealsTotal: number;
  pendingPush: number;
  errors: string[];
}

/**
 * Holt den aktuellen Sync-Status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const [contacts, companies, deals] = await Promise.all([
      fetchHubSpotContacts(1),
      fetchHubSpotCompanies(1),
      fetchHubSpotDeals(1),
    ]);
    
    return {
      lastSync: new Date().toISOString(),
      contactsTotal: contacts.length > 0 ? 500 : 0, // Estimate
      companiesTotal: companies.length > 0 ? 500 : 0,
      dealsTotal: deals.length > 0 ? 500 : 0,
      pendingPush: 0,
      errors: [],
    };
  } catch (error) {
    return {
      lastSync: null,
      contactsTotal: 0,
      companiesTotal: 0,
      dealsTotal: 0,
      pendingPush: 0,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}


// ============================================
// AUTO-SYNC SERVICE (Phase 0.5c)
// ============================================

let autoSyncInterval: ReturnType<typeof setInterval> | null = null;
let lastAutoSyncResult: {
  timestamp: string;
  success: boolean;
  companiesImported: number;
  contactsImported: number;
  errors: string[];
} | null = null;

/**
 * Startet den periodischen Auto-Sync (alle 15 Minuten)
 */
export function startAutoSync(syncFn: () => Promise<{
  success: boolean;
  companiesImported: number;
  contactsImported: number;
  errors: string[];
}>) {
  if (autoSyncInterval) {
    console.log('[HubSpot Auto-Sync] Bereits aktiv, wird neugestartet');
    stopAutoSync();
  }
  
  const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 Minuten
  
  console.log('[HubSpot Auto-Sync] Gestartet – Intervall: 15 Minuten');
  
  autoSyncInterval = setInterval(async () => {
    try {
      console.log('[HubSpot Auto-Sync] Starte automatischen Sync...');
      const result = await syncFn();
      lastAutoSyncResult = {
        timestamp: new Date().toISOString(),
        ...result,
      };
      console.log(`[HubSpot Auto-Sync] Abgeschlossen: ${result.companiesImported} Unternehmen, ${result.contactsImported} Kontakte`);
    } catch (error) {
      console.error('[HubSpot Auto-Sync] Fehler:', error);
      lastAutoSyncResult = {
        timestamp: new Date().toISOString(),
        success: false,
        companiesImported: 0,
        contactsImported: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }, SYNC_INTERVAL_MS);
}

/**
 * Stoppt den Auto-Sync
 */
export function stopAutoSync() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
    console.log('[HubSpot Auto-Sync] Gestoppt');
  }
}

/**
 * Gibt den Auto-Sync-Status zurück
 */
export function getAutoSyncStatus() {
  return {
    active: autoSyncInterval !== null,
    intervalMinutes: 15,
    lastResult: lastAutoSyncResult,
  };
}


// ============================================
// v7.2 – BIDIREKTIONALER SYNC (FaFi → HubSpot)
// ============================================

/**
 * FaFi-Aktion → HubSpot Deal-Stage Mapping
 */
export const FAFI_TO_HUBSPOT_STAGE_MAP: Record<string, string> = {
  objektaufnahme: "appointmentscheduled",
  angebot_erstellt: "qualifiedtobuy",
  angebot_versendet: "presentationscheduled",
  nachfassen: "presentationscheduled",
  auftrag_gewonnen: "closedwon",
  planung: "closedwon",
  vorbereitung: "closedwon",
  durchfuehrung: "closedwon",
  abnahme: "closedwon",
  abgeschlossen: "closedwon",
  verloren: "closedlost",
};

/**
 * Sync-Ergebnis für einzelne Entität
 */
export interface EntitySyncResult {
  success: boolean;
  direction: "fafi_to_hubspot" | "hubspot_to_fafi";
  entityType: string;
  entityId: string;
  hubspotId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Synchronisiert einen Projekt-Status nach HubSpot
 * Wird bei Statusänderungen in tRPC-Prozeduren aufgerufen
 */
export async function syncProjectStatusToHubSpot(params: {
  projectName: string;
  projectPhase: string;
  hubspotDealId?: string;
  hubspotCompanyId?: string;
  amount?: number;
  description?: string;
}): Promise<EntitySyncResult> {
  const result: EntitySyncResult = {
    success: false,
    direction: "fafi_to_hubspot",
    entityType: "deal",
    entityId: params.projectName,
    timestamp: new Date().toISOString(),
  };

  try {
    const dealStage = FAFI_TO_HUBSPOT_STAGE_MAP[params.projectPhase] || "appointmentscheduled";

    if (params.hubspotDealId) {
      // Update existing deal
      const properties: Record<string, string> = {
        dealstage: dealStage,
      };
      if (params.amount !== undefined) {
        properties.amount = String(params.amount);
      }
      if (params.description) {
        properties.description = params.description;
      }

      const updated = await updateHubSpotDeal(params.hubspotDealId, properties);
      result.success = updated;
      result.hubspotId = params.hubspotDealId;
    } else {
      // Create new deal
      const deal = await createHubSpotDeal({
        dealname: params.projectName,
        amount: params.amount,
        dealstage: dealStage,
        description: params.description,
        companyId: params.hubspotCompanyId ? parseInt(params.hubspotCompanyId) : undefined,
      });

      if (deal) {
        result.success = true;
        result.hubspotId = deal.id;
      }
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.error("[HubSpot Bidi-Sync] Error syncing project status:", error);
  }

  return result;
}

/**
 * Synchronisiert einen Angebotsstatus nach HubSpot
 */
export async function syncOfferStatusToHubSpot(params: {
  offerNumber: string;
  status: string;
  hubspotDealId?: string;
  amount?: number;
}): Promise<EntitySyncResult> {
  const result: EntitySyncResult = {
    success: false,
    direction: "fafi_to_hubspot",
    entityType: "deal",
    entityId: params.offerNumber,
    timestamp: new Date().toISOString(),
  };

  if (!params.hubspotDealId) {
    result.error = "Kein HubSpot Deal verknüpft";
    return result;
  }

  try {
    const stageMap: Record<string, string> = {
      entwurf: "qualifiedtobuy",
      erstellt: "qualifiedtobuy",
      versendet: "presentationscheduled",
      angenommen: "closedwon",
      abgelehnt: "closedlost",
      obsolet: "closedlost",
    };

    const dealStage = stageMap[params.status] || "qualifiedtobuy";
    const properties: Record<string, string> = { dealstage: dealStage };
    if (params.amount !== undefined) {
      properties.amount = String(params.amount);
    }

    const updated = await updateHubSpotDeal(params.hubspotDealId, properties);
    result.success = updated;
    result.hubspotId = params.hubspotDealId;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.error("[HubSpot Bidi-Sync] Error syncing offer status:", error);
  }

  return result;
}

/**
 * Retry-Logik mit exponentiellem Backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[HubSpot Retry] Versuch ${attempt + 1}/${maxRetries} fehlgeschlagen, warte ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Sync mit Retry-Logik
 */
export async function syncWithRetry(
  syncFn: () => Promise<EntitySyncResult>,
): Promise<EntitySyncResult> {
  try {
    return await withRetry(syncFn, 3, 1000);
  } catch (error) {
    return {
      success: false,
      direction: "fafi_to_hubspot",
      entityType: "unknown",
      entityId: "unknown",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Conflict Resolution: Timestamp-basiert (neuere Änderung gewinnt)
 */
export function resolveConflict(
  localUpdatedAt: Date,
  hubspotUpdatedAt: Date,
): "local_wins" | "hubspot_wins" {
  return localUpdatedAt >= hubspotUpdatedAt ? "local_wins" : "hubspot_wins";
}
