/**
 * E-Mail Service Tests
 */

import { describe, it, expect } from 'vitest';
import { generateOfferEmailContent, OfferEmailData } from './email';

describe('E-Mail Service', () => {
  describe('generateOfferEmailContent', () => {
    const testData: OfferEmailData = {
      recipient: {
        name: 'Max Mustermann',
        email: 'max@example.com',
      },
      offerNumber: 'FF-2026-0001',
      projectName: 'Wohnanlage Sonnenhof',
      totalAmount: '25.500,00 €',
      validUntil: '15.03.2026',
      senderName: 'Anna Schmidt',
      senderEmail: 'anna@fassadenfix.de',
      senderPhone: '+49 345 123456',
    };

    it('should generate correct subject line', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.subject).toBe('Ihr Angebot FF-2026-0001 für Wohnanlage Sonnenhof – FassadenFix');
    });

    it('should include recipient name in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('Max Mustermann');
    });

    it('should include offer number in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('FF-2026-0001');
    });

    it('should include project name in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('Wohnanlage Sonnenhof');
    });

    it('should include total amount in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('25.500,00 €');
    });

    it('should include valid until date in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('15.03.2026');
    });

    it('should include sender information in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('Anna Schmidt');
      expect(result.htmlBody).toContain('+49 345 123456');
      expect(result.htmlBody).toContain('anna@fassadenfix.de');
    });

    it('should include FassadenFix branding in HTML body', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.htmlBody).toContain('FASSADENFIX');
      expect(result.htmlBody).toContain('#77bc1f'); // FassadenFix green
    });

    it('should generate text body with all information', () => {
      const result = generateOfferEmailContent(testData);

      expect(result.textBody).toContain('Max Mustermann');
      expect(result.textBody).toContain('FF-2026-0001');
      expect(result.textBody).toContain('Wohnanlage Sonnenhof');
      expect(result.textBody).toContain('25.500,00 €');
      expect(result.textBody).toContain('15.03.2026');
      expect(result.textBody).toContain('Anna Schmidt');
    });

    it('should handle missing optional sender fields', () => {
      const minimalData: OfferEmailData = {
        recipient: {
          name: 'Test User',
          email: 'test@example.com',
        },
        offerNumber: 'FF-2026-0002',
        projectName: 'Test Project',
        totalAmount: '10.000,00 €',
        validUntil: '01.04.2026',
        senderName: 'Test Sender',
      };

      const result = generateOfferEmailContent(minimalData);

      expect(result.subject).toContain('FF-2026-0002');
      expect(result.htmlBody).toContain('Test Sender');
      expect(result.textBody).toContain('Test Sender');
    });
  });
});
