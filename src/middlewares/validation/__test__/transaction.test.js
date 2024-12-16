import { HttpError } from '../../../utils/error.js';
import { PassengerType } from '@prisma/client';
import { jest } from '@jest/globals';

/**
 * @typedef {{
 *   TransactionValidationMiddleware: {
 *     isValidTransactionPayload: jest.Mock;
 *   };
 * }} TransactionValidationMiddlewareMock
 */

const { TransactionValidationMiddleware } =
  /** @type {TransactionValidationMiddlewareMock} */ (
    /** @type {unknown} */ (await import('../transaction.js'))
  );

describe('Transaction Validation Middleware', () => {
  describe('isValidTransactionPayload', () => {
    it('should call next() if the transaction payload is valid', () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab',
              returnFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ac'
            }
          ]
        }
      };
      const next = jest.fn();

      TransactionValidationMiddleware.isValidTransactionPayload(req, {}, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() if the transaction payload is valid with baby have no seat', () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab',
              returnFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ac'
            },
            {
              type: PassengerType.INFANT,
              name: 'Baby John',
              birthDate: '2015-01-01',
              identityNumber: '0000000000000000',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01'
            }
          ]
        }
      };
      const next = jest.fn();

      TransactionValidationMiddleware.isValidTransactionPayload(req, {}, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw HttpError if departure and return flights are the same', () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab',
              returnFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab'
            }
          ]
        }
      };
      const next = jest.fn();

      try {
        TransactionValidationMiddleware.isValidTransactionPayload(
          req,
          {},
          next
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          'Departure and return flights must be different'
        );
      }
    });

    it('should throw HttpError if two passengers share the same flight seat', async () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab',
              returnFlightSeatId: '0193b4e8-e3e5-73b3-8b02-9f6fb6d70e10'
            },
            {
              type: PassengerType.ADULT,
              name: 'Jane Doe',
              birthDate: '1985-01-01',
              identityNumber: '0987654321',
              identityNationality: 'US',
              identityExpirationDate: '2035-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab',
              returnFlightSeatId: '0193b4e8-e3e5-7d9b-9bb8-582b0cd5cdec'
            }
          ]
        }
      };

      const next = jest.fn();

      try {
        await TransactionValidationMiddleware.isValidTransactionPayload(
          req,
          {},
          next
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          'Departure flight seat must be unique between passengers'
        );
      }
    });

    it('should throw HttpError if no departure flight seat is provided for adults and children', () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: null,
              returnFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ac'
            }
          ]
        }
      };
      const next = jest.fn();

      expect(() =>
        TransactionValidationMiddleware.isValidTransactionPayload(req, {}, next)
      ).toThrow(HttpError);
    });

    it('should throw HttpError if no return flight seat is provided but returnFlightId exists', async () => {
      const req = {
        body: {
          departureFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000',
          passengers: [
            {
              type: PassengerType.ADULT,
              name: 'John Doe',
              birthDate: '1980-01-01',
              identityNumber: '1234567890',
              identityNationality: 'US',
              identityExpirationDate: '2030-01-01',
              departureFlightSeatId: 'd1e2c3f4-5678-90ab-cdef-1234567890ab'
            }
          ]
        }
      };

      const next = jest.fn();

      try {
        await TransactionValidationMiddleware.isValidTransactionPayload(
          req,
          {},
          next
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Return flight must have at least one seat');
      }
    });
  });
});
