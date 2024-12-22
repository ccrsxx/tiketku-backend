import {
  generateRandomToken,
  generateRandomOTP,
  toTitleCase,
  getFirstAndLastName,
  getParsedDescriptionTicketNotification
} from '../helper';
import { jest, describe, expect } from '@jest/globals';

/**
 * @typedef {import('../helper').generateRandomToken} GenerateRandomTokenMock
 *
 * @typedef {import('../helper').generateRandomOTP} GenerateRandomOtpMock
 *
 * @typedef {import('../helper').toTitleCase} ToTitleCaseMock
 *
 * @typedef {import('../helper').getFirstAndLastName} GetFirstAndLastNameMock
 *
 * @typedef {import('../helper').getParsedDescriptionTicketNotification} GetParsedDescriptionTicketNotificationMock
 */

jest.unstable_mockModule(
  '../helper',
  () =>
    /**
     * @type {GenerateRandomTokenMock &
     *   GenerateRandomOtpMock &
     *   ToTitleCaseMock &
     *   GetFirstAndLastNameMock &
     *   GetParsedDescriptionTicketNotificationMock}
     */ ({
      generateRandomToken: jest.fn(),
      generateRandomOTP: jest.fn(),
      toTitleCase: jest.fn(),
      getFirstAndLastName: jest.fn(),
      getParsedDescriptionTicketNotification: jest.fn()
    })
);

describe('Helper functions', () => {
  describe('generateRandomToken', () => {
    it('should generate random token with default size', () => {
      const token = generateRandomToken();
      expect(token).toHaveLength(16);
      expect(typeof token).toBe('string');
    });

    it('should generate random token with custom size', () => {
      const token = generateRandomToken(16);
      expect(token).toHaveLength(22);
    });
  });

  describe('generateRandomOTP', () => {
    it('should generate 6-digit OTP', () => {
      const otp = generateRandomOTP();
      expect(otp).toHaveLength(6);
      expect(typeof otp).toBe('string');
      expect(Number(otp)).toBeLessThanOrEqual(999999);
      expect(Number(otp)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('toTitleCase', () => {
    it('should convert string to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(toTitleCase('hello WORLD')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(toTitleCase('hello')).toBe('Hello');
    });
  });

  describe('getFirstAndLastName', () => {
    it('should split full name into first and last name', () => {
      expect(getFirstAndLastName('John Doe')).toEqual({
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should handle single name', () => {
      expect(getFirstAndLastName('John')).toEqual({
        firstName: 'John',
        lastName: ''
      });
    });

    it('should handle multiple word last names', () => {
      expect(getFirstAndLastName('John van der Waals')).toEqual({
        firstName: 'John',
        lastName: 'van der Waals'
      });
    });

    it('should trim whitespace', () => {
      expect(getFirstAndLastName('John Doe')).toEqual({
        firstName: 'John',
        lastName: 'Doe'
      });
    });
  });

  describe('getParsedDescriptionTicketNotification', () => {
    it('should return description for a one-way ticket', () => {
      const description = getParsedDescriptionTicketNotification({
        code: 'A12345',
        prefix: 'Pemberitahuan',
        departureAirportCode: 'CGK',
        destinationAirportCode: 'DPS',
        returnFlight: false
      });

      expect(description).toBe(
        'Pemberitahuan untuk tiket dengan kode A12345. Dengan keberangkatan dari CGK menuju DPS.'
      );
    });

    it('should return description for a round-trip ticket', () => {
      const description = getParsedDescriptionTicketNotification({
        code: 'A12345',
        prefix: 'Pemberitahuan',
        departureAirportCode: 'CGK',
        destinationAirportCode: 'DPS',
        returnFlight: true
      });

      expect(description).toBe(
        'Pemberitahuan untuk tiket dengan kode A12345. Dengan keberangkatan dari CGK menuju DPS (PP).'
      );
    });
  });
});
