import { HttpError } from '../../../utils/error.js';
import { Continent } from '@prisma/client';
import { jest } from '@jest/globals';

/**
 * @typedef {{
 *   FlightValidationMiddleware: Record<
 *     keyof import('../flight.js')['FlightValidationMiddleware'],
 *     jest.Mock
 *   >;
 * }} FlightValidationMiddlewareMock
 */

const { FlightValidationMiddleware } =
  /** @type {FlightValidationMiddlewareMock} */ (
    /** @type {unknown} */ (await import('../flight.js'))
  );

describe('Flight Validation Middleware', () => {
  describe('isValidFlightQueryParams', () => {
    it('should call next() if query params are valid', () => {
      const req = {
        query: {
          departureAirportId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          destinationAirportId: '550e8400-e29b-41d4-a716-446655440000',
          departureDate: '2024-12-11'
        }
      };
      const next = jest.fn();

      FlightValidationMiddleware.isValidFlightQueryParams(req, {}, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw an HttpError if query params are invalid', () => {
      const req = {
        query: {
          departureAirportId: 'invalid-uuid',
          destinationAirportId: '550e8400-e29b-41d4-a716-446655440000',
          departureDate: '2024-12-11'
        }
      };
      const next = jest.fn();

      expect(() =>
        FlightValidationMiddleware.isValidFlightQueryParams(req, {}, next)
      ).toThrow(HttpError);
    });
  });

  describe('isValidFavoriteFlightQueryParams', () => {
    it('should call next() if query params are valid', () => {
      const req = {
        query: {
          continent: Continent.ASIA
        }
      };
      const next = jest.fn();

      FlightValidationMiddleware.isValidFavoriteFlightQueryParams(
        req,
        {},
        next
      );

      expect(next).toHaveBeenCalled();
    });

    it('should throw an HttpError if query params are invalid', () => {
      const req = {
        query: {
          continent: 'ANTARTIKA'
        }
      };
      const next = jest.fn();

      expect(() =>
        FlightValidationMiddleware.isValidFavoriteFlightQueryParams(
          req,
          {},
          next
        )
      ).toThrow(HttpError);
    });
  });

  describe('isValidFlightDetailQueryParams', () => {
    it('should call next() if the return flight is different from the departure flight', () => {
      const req = {
        params: {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        },
        query: {
          returnFlightId: '550e8400-e29b-41d4-a716-446655440000'
        }
      };
      const next = jest.fn();

      FlightValidationMiddleware.isValidFlightDetailQueryParams(req, {}, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw an HttpError if the return flight is the same as the departure flight', () => {
      const req = {
        params: {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        },
        query: {
          returnFlightId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        }
      };
      const next = jest.fn();

      expect(() =>
        FlightValidationMiddleware.isValidFlightDetailQueryParams(req, {}, next)
      ).toThrow(HttpError);
    });
  });
});
