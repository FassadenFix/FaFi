/**
 * HS-06: Vitest-Tests für HubSpot-Import-Logik
 * 
 * Testet die Konvertierungsfunktionen (hubspotContactToLocal, hubspotCompanyToLocal)
 * und die Sync-Ergebnis-Struktur. performFullSync wird nicht direkt getestet,
 * da es intern MCP-Aufrufe macht, die in Unit-Tests nicht verfügbar sind.
 */
import { describe, it, expect } from 'vitest';
import {
  hubspotContactToLocal,
  hubspotCompanyToLocal,
  type HubSpotContact,
  type HubSpotCompany,
  type SyncResult,
} from './services/hubspot';

// ============================================
// hubspotContactToLocal Tests
// ============================================
describe('hubspotContactToLocal', () => {
  it('konvertiert einen vollständigen HubSpot-Kontakt korrekt', () => {
    const contact: HubSpotContact = {
      id: '12345',
      properties: {
        firstname: 'Max',
        lastname: 'Mustermann',
        email: 'max@example.de',
        phone: '+49 170 1234567',
        company: 'Test GmbH',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      archived: false,
    };

    const result = hubspotContactToLocal(contact);

    expect(result).toEqual({
      hubspotId: '12345',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.de',
      phone: '+49 170 1234567',
    });
  });

  it('setzt fehlende Felder auf null und Nachname auf "Unbekannt"', () => {
    const contact: HubSpotContact = {
      id: '99999',
      properties: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotContactToLocal(contact);

    expect(result.hubspotId).toBe('99999');
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBe('Unbekannt');
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
  });

  it('übernimmt die HubSpot-ID korrekt', () => {
    const contact: HubSpotContact = {
      id: 'hs-abc-123',
      properties: { lastname: 'Test' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    expect(hubspotContactToLocal(contact).hubspotId).toBe('hs-abc-123');
  });

  it('behandelt leere Strings als null für optionale Felder', () => {
    const contact: HubSpotContact = {
      id: '111',
      properties: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotContactToLocal(contact);
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBe('Unbekannt');
    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
  });

  it('ignoriert das company-Feld (wird nicht in lokales Format übernommen)', () => {
    const contact: HubSpotContact = {
      id: '222',
      properties: {
        firstname: 'Anna',
        lastname: 'Müller',
        company: 'Große Firma GmbH',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotContactToLocal(contact);
    expect(result).not.toHaveProperty('company');
    expect(Object.keys(result)).toEqual(['hubspotId', 'firstName', 'lastName', 'email', 'phone']);
  });

  it('verarbeitet Batch von Kontakten korrekt', () => {
    const contacts: HubSpotContact[] = Array.from({ length: 100 }, (_, i) => ({
      id: `contact-${i}`,
      properties: {
        firstname: `Vorname-${i}`,
        lastname: `Nachname-${i}`,
        email: `user${i}@example.de`,
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    }));

    const results = contacts.map(hubspotContactToLocal);

    expect(results).toHaveLength(100);
    expect(results[0].hubspotId).toBe('contact-0');
    expect(results[99].hubspotId).toBe('contact-99');
    expect(results[50].firstName).toBe('Vorname-50');
    expect(results[50].email).toBe('user50@example.de');
  });
});

// ============================================
// hubspotCompanyToLocal Tests
// ============================================
describe('hubspotCompanyToLocal', () => {
  it('konvertiert ein vollständiges HubSpot-Unternehmen korrekt', () => {
    const company: HubSpotCompany = {
      id: '67890',
      properties: {
        name: 'WBG Musterstadt GmbH',
        domain: 'wbg-musterstadt.de',
        phone: '+49 345 1234567',
        city: 'Halle',
        country: 'Deutschland',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
      archived: false,
    };

    const result = hubspotCompanyToLocal(company);

    expect(result).toEqual({
      hubspotId: '67890',
      name: 'WBG Musterstadt GmbH',
      phone: '+49 345 1234567',
      city: 'Halle',
      country: 'Deutschland',
      website: 'https://wbg-musterstadt.de',
    });
  });

  it('setzt fehlende Felder auf null und Name auf "Unbekannt"', () => {
    const company: HubSpotCompany = {
      id: '11111',
      properties: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotCompanyToLocal(company);

    expect(result.hubspotId).toBe('11111');
    expect(result.name).toBe('Unbekannt');
    expect(result.phone).toBeNull();
    expect(result.city).toBeNull();
    expect(result.country).toBeNull();
    expect(result.website).toBeNull();
  });

  it('erstellt korrekte Website-URL aus Domain', () => {
    const company: HubSpotCompany = {
      id: '22222',
      properties: { name: 'Test', domain: 'example.com' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    expect(hubspotCompanyToLocal(company).website).toBe('https://example.com');
  });

  it('setzt website auf null wenn keine Domain vorhanden', () => {
    const company: HubSpotCompany = {
      id: '33333',
      properties: { name: 'Ohne Domain' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    expect(hubspotCompanyToLocal(company).website).toBeNull();
  });

  it('verarbeitet Batch von Unternehmen korrekt', () => {
    const companies: HubSpotCompany[] = Array.from({ length: 50 }, (_, i) => ({
      id: `company-${i}`,
      properties: {
        name: `Firma ${i} GmbH`,
        domain: `firma${i}.de`,
        city: `Stadt-${i}`,
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    }));

    const results = companies.map(hubspotCompanyToLocal);

    expect(results).toHaveLength(50);
    expect(results[0].name).toBe('Firma 0 GmbH');
    expect(results[0].website).toBe('https://firma0.de');
    expect(results[49].name).toBe('Firma 49 GmbH');
    expect(results[49].city).toBe('Stadt-49');
  });

  it('ignoriert state-Feld (wird nicht in lokales Format übernommen)', () => {
    const company: HubSpotCompany = {
      id: '44444',
      properties: {
        name: 'Test AG',
        state: 'Sachsen-Anhalt',
        city: 'Halle',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotCompanyToLocal(company);
    expect(result).not.toHaveProperty('state');
    expect(Object.keys(result)).toEqual(['hubspotId', 'name', 'phone', 'city', 'country', 'website']);
  });
});

// ============================================
// SyncResult Struktur Tests
// ============================================
describe('SyncResult Struktur', () => {
  it('hat die korrekte Struktur', () => {
    const result: SyncResult = {
      success: true,
      contactsImported: 100,
      companiesImported: 50,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    expect(result.success).toBe(true);
    expect(result.contactsImported).toBe(100);
    expect(result.companiesImported).toBe(50);
    expect(result.errors).toHaveLength(0);
    expect(result.timestamp).toBeTruthy();
  });

  it('kann Fehler enthalten', () => {
    const result: SyncResult = {
      success: false,
      contactsImported: 0,
      companiesImported: 0,
      errors: ['API nicht erreichbar', 'Rate Limit überschritten'],
      timestamp: new Date().toISOString(),
    };

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain('API nicht erreichbar');
  });
});

// ============================================
// Datenintegrität Tests (Import-Mapping)
// ============================================
describe('Import-Mapping Datenintegrität', () => {
  it('behält alle HubSpot-IDs bei der Konvertierung bei', () => {
    const ids = ['1', '12345', 'abc-def', '999999999'];
    
    ids.forEach(id => {
      const contact: HubSpotContact = {
        id,
        properties: { lastname: 'Test' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        archived: false,
      };
      expect(hubspotContactToLocal(contact).hubspotId).toBe(id);
    });
  });

  it('Kontakt- und Unternehmens-Konvertierung sind unabhängig', () => {
    const contact: HubSpotContact = {
      id: 'shared-id',
      properties: { firstname: 'Max', lastname: 'Test' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };
    const company: HubSpotCompany = {
      id: 'shared-id',
      properties: { name: 'Firma Test' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const localContact = hubspotContactToLocal(contact);
    const localCompany = hubspotCompanyToLocal(company);

    expect(localContact.hubspotId).toBe(localCompany.hubspotId);
    expect(localContact).toHaveProperty('firstName');
    expect(localContact).toHaveProperty('lastName');
    expect(localCompany).toHaveProperty('name');
    expect(localCompany).toHaveProperty('website');
    expect(localContact).not.toHaveProperty('name');
    expect(localCompany).not.toHaveProperty('firstName');
  });

  it('konvertiert Sonderzeichen in Namen korrekt', () => {
    const contact: HubSpotContact = {
      id: 'special',
      properties: {
        firstname: 'Ärger',
        lastname: 'Müller-Lüdenscheidt',
        email: 'ärger@müller.de',
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      archived: false,
    };

    const result = hubspotContactToLocal(contact);
    expect(result.firstName).toBe('Ärger');
    expect(result.lastName).toBe('Müller-Lüdenscheidt');
    expect(result.email).toBe('ärger@müller.de');
  });
});
