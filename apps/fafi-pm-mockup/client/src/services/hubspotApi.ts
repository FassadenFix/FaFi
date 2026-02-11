/**
 * HubSpot API Integration Service
 * Verbindet den Projektmanager mit HubSpot CRM
 * 
 * HINWEIS: Für echte API-Aufrufe ist ein Backend-Upgrade erforderlich.
 * Diese Implementierung nutzt den HubSpot MCP Server.
 */

export interface HubSpotContact {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
  createdate: string;
  lastmodifieddate: string;
}

export interface HubSpotCompany {
  id: string;
  name: string;
  domain?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  industry?: string;
  numberofemployees?: number;
  annualrevenue?: number;
  createdate: string;
}

export interface HubSpotDeal {
  id: string;
  dealname: string;
  amount?: number;
  dealstage: string;
  pipeline: string;
  closedate?: string;
  createdate: string;
  associatedCompanyId?: string;
  associatedContactIds?: string[];
}

// Mock-Daten für Frontend-Demo (ohne Backend)
const mockContacts: HubSpotContact[] = [
  {
    id: "hs-1",
    firstname: "Daniela",
    lastname: "Brehmer",
    email: "d.brehmer@3a-immobilien.de",
    phone: "+49 345 1234567",
    company: "3A Immobilien",
    jobtitle: "Geschäftsführerin",
    createdate: "2024-01-15",
    lastmodifieddate: "2026-01-28",
  },
  {
    id: "hs-2",
    firstname: "Thomas",
    lastname: "Müller",
    email: "t.mueller@wbg-halle.de",
    phone: "+49 345 9876543",
    company: "WBG Halle",
    jobtitle: "Technischer Leiter",
    createdate: "2023-06-20",
    lastmodifieddate: "2026-02-01",
  },
  {
    id: "hs-3",
    firstname: "Sandra",
    lastname: "Weber",
    email: "s.weber@stadtwerke-leipzig.de",
    phone: "+49 341 5551234",
    company: "Stadtwerke Leipzig",
    jobtitle: "Facility Managerin",
    createdate: "2024-03-10",
    lastmodifieddate: "2026-01-15",
  },
];

const mockCompanies: HubSpotCompany[] = [
  {
    id: "hsc-1",
    name: "3A Immobilien",
    domain: "3a-immobilien.de",
    phone: "+49 345 1234567",
    address: "Herrenstraße 20",
    city: "Halle (Saale)",
    zip: "06108",
    industry: "Immobilienverwaltung",
    numberofemployees: 25,
    annualrevenue: 2500000,
    createdate: "2022-05-15",
  },
  {
    id: "hsc-2",
    name: "WBG Halle",
    domain: "wbg-halle.de",
    phone: "+49 345 9876543",
    address: "Große Steinstraße 12",
    city: "Halle (Saale)",
    zip: "06108",
    industry: "Wohnungsbaugesellschaft",
    numberofemployees: 150,
    annualrevenue: 45000000,
    createdate: "2021-03-20",
  },
  {
    id: "hsc-3",
    name: "Stadtwerke Leipzig",
    domain: "stadtwerke-leipzig.de",
    phone: "+49 341 5551234",
    address: "Augustusplatz 1",
    city: "Leipzig",
    zip: "04109",
    industry: "Energieversorgung",
    numberofemployees: 2500,
    annualrevenue: 850000000,
    createdate: "2020-11-10",
  },
];

// API-Funktionen (nutzen Mock-Daten, bis Backend verfügbar)
export async function searchContacts(query: string): Promise<HubSpotContact[]> {
  // Simulierte Verzögerung
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const lowerQuery = query.toLowerCase();
  return mockContacts.filter(
    (contact) =>
      contact.firstname.toLowerCase().includes(lowerQuery) ||
      contact.lastname.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery) ||
      (contact.company && contact.company.toLowerCase().includes(lowerQuery))
  );
}

export async function searchCompanies(query: string): Promise<HubSpotCompany[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const lowerQuery = query.toLowerCase();
  return mockCompanies.filter(
    (company) =>
      company.name.toLowerCase().includes(lowerQuery) ||
      (company.city && company.city.toLowerCase().includes(lowerQuery)) ||
      (company.industry && company.industry.toLowerCase().includes(lowerQuery))
  );
}

export async function getContactById(id: string): Promise<HubSpotContact | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockContacts.find((c) => c.id === id) || null;
}

export async function getCompanyById(id: string): Promise<HubSpotCompany | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockCompanies.find((c) => c.id === id) || null;
}

export async function getRecentContacts(limit: number = 5): Promise<HubSpotContact[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockContacts
    .sort((a, b) => new Date(b.lastmodifieddate).getTime() - new Date(a.lastmodifieddate).getTime())
    .slice(0, limit);
}

export async function getTopCompanies(limit: number = 5): Promise<HubSpotCompany[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockCompanies
    .sort((a, b) => (b.annualrevenue || 0) - (a.annualrevenue || 0))
    .slice(0, limit);
}

// Sync-Status für UI-Anzeige
export interface HubSpotSyncStatus {
  lastSync: Date | null;
  isConnected: boolean;
  contactCount: number;
  companyCount: number;
  dealCount: number;
}

export async function getSyncStatus(): Promise<HubSpotSyncStatus> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    lastSync: new Date(),
    isConnected: true,
    contactCount: mockContacts.length,
    companyCount: mockCompanies.length,
    dealCount: 12,
  };
}

// Für echte Integration: MCP-Aufruf (erfordert Backend)
export async function callHubSpotMCP(action: string, params: Record<string, unknown>): Promise<unknown> {
  // HubSpot MCP Call logged in dev mode only
  // In echter Implementierung: Backend-API aufrufen, die MCP nutzt
  throw new Error("HubSpot MCP erfordert Backend-Upgrade. Nutze webdev_add_feature mit feature='web-db-user'.");
}
