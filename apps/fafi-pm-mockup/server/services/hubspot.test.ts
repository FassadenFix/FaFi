/**
 * HubSpot Service Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  hubspotContactToLocal, 
  hubspotCompanyToLocal,
  HubSpotContact,
  HubSpotCompany
} from './hubspot';

describe('HubSpot Service', () => {
  describe('hubspotContactToLocal', () => {
    it('should convert HubSpot contact to local format', () => {
      const hubspotContact: HubSpotContact = {
        id: '12345',
        properties: {
          firstname: 'Max',
          lastname: 'Mustermann',
          email: 'max@example.com',
          phone: '+49123456789',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotContactToLocal(hubspotContact);

      expect(result.hubspotId).toBe('12345');
      expect(result.firstName).toBe('Max');
      expect(result.lastName).toBe('Mustermann');
      expect(result.email).toBe('max@example.com');
      expect(result.phone).toBe('+49123456789');
    });

    it('should handle missing optional fields', () => {
      const hubspotContact: HubSpotContact = {
        id: '67890',
        properties: {
          lastname: 'Schmidt',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotContactToLocal(hubspotContact);

      expect(result.hubspotId).toBe('67890');
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBe('Schmidt');
      expect(result.email).toBeNull();
      expect(result.phone).toBeNull();
    });

    it('should use "Unbekannt" for missing lastname', () => {
      const hubspotContact: HubSpotContact = {
        id: '99999',
        properties: {
          firstname: 'Test',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotContactToLocal(hubspotContact);

      expect(result.lastName).toBe('Unbekannt');
    });
  });

  describe('hubspotCompanyToLocal', () => {
    it('should convert HubSpot company to local format', () => {
      const hubspotCompany: HubSpotCompany = {
        id: '54321',
        properties: {
          name: 'Test GmbH',
          domain: 'test-gmbh.de',
          phone: '+49987654321',
          city: 'Berlin',
          country: 'Germany',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotCompanyToLocal(hubspotCompany);

      expect(result.hubspotId).toBe('54321');
      expect(result.name).toBe('Test GmbH');
      expect(result.phone).toBe('+49987654321');
      expect(result.city).toBe('Berlin');
      expect(result.country).toBe('Germany');
      expect(result.website).toBe('https://test-gmbh.de');
    });

    it('should handle missing optional fields', () => {
      const hubspotCompany: HubSpotCompany = {
        id: '11111',
        properties: {
          name: 'Minimal Company',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotCompanyToLocal(hubspotCompany);

      expect(result.hubspotId).toBe('11111');
      expect(result.name).toBe('Minimal Company');
      expect(result.phone).toBeNull();
      expect(result.city).toBeNull();
      expect(result.country).toBeNull();
      expect(result.website).toBeNull();
    });

    it('should use "Unbekannt" for missing company name', () => {
      const hubspotCompany: HubSpotCompany = {
        id: '22222',
        properties: {},
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        archived: false,
      };

      const result = hubspotCompanyToLocal(hubspotCompany);

      expect(result.name).toBe('Unbekannt');
    });
  });
});
