import { HttpError } from '../../utils/error.js';
import { FlightClassType, Continent } from '@prisma/client';
import { jest } from '@jest/globals';
import { generatePrismaMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   default: Record<keyof import('../../utils/db.js'), jest.Mock>;
 * }} GeneratedPrismaMock
 */

/**
 * @typedef {{
 *   FlightService: Record<
 *     keyof import('../flight.js')['FlightService'],
 *     jest.Mock
 *   >;
 * }} FlightServiceMock
 */

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);

jest.unstable_mockModule('../../utils/db.js', () => ({
  prisma: {
    flight: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    $queryRawTyped: jest.fn()
  }
}));

const { prisma } = /** @type {GeneratedPrismaMock} */ (
  /** @type {unknown} */ (await import('../../utils/db.js'))
);

const { FlightService } = /** @type {FlightServiceMock} */ (
  /** @type {unknown} */ (await import('../flight.js'))
);

const MAX_CURSOR_LIMIT = 10;

describe('FlightService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getFlight', () => {
    it('should get departure flight details', async () => {
      const mockFlight = {
        id: '1',
        airline: {},
        airplane: {},
        flightSeats: [],
        departureAirport: { id: 'dep1' },
        destinationAirport: { id: 'dest1' }
      };

      prisma.flight.findUnique.mockResolvedValueOnce(mockFlight);

      const result = await FlightService.getFlight('1', {});

      expect(result).toEqual({
        departureFlight: mockFlight,
        returnFlight: null
      });
    });

    it('should get return flight details', async () => {
      const departureMockFlight = {
        id: '1',
        airline: {},
        airplane: {},
        flightSeats: [
          { row: 1, column: 1 },
          { row: 1, column: 2 },
          { row: 5, column: 1 }
        ],
        departureAirport: { id: 'dep1' },
        destinationAirport: { id: 'dest1' }
      };

      const returnMockFlight = {
        id: '1234e86b-1325-43f1-be92-ce129e61712b',
        airline: {},
        airplane: {},
        flightSeats: [
          { row: 1, column: 1 },
          { row: 1, column: 2 },
          { row: 5, column: 1 }
        ],
        departureAirport: { id: 'dest1' },
        destinationAirport: { id: 'dep1' }
      };

      prisma.flight.findUnique
        .mockImplementationOnce(() => Promise.resolve(departureMockFlight))
        .mockImplementationOnce(() => Promise.resolve(returnMockFlight));

      const result = await FlightService.getFlight('1', {
        returnFlightId: returnMockFlight.id
      });

      expect(result).toEqual({
        departureFlight: departureMockFlight,
        returnFlight: returnMockFlight
      });
    });

    it('should throw error if flight not found', async () => {
      prisma.flight.findUnique.mockResolvedValueOnce(null);

      await expect(FlightService.getFlight('1', {})).rejects.toThrow(HttpError);
    });

    it('should throw error if return flight not found', async () => {
      prisma.flight.findUnique
        .mockImplementationOnce(() => Promise.resolve('1'))
        .mockImplementationOnce(() => Promise.resolve(null));

      await expect(
        FlightService.getFlight('1', {
          returnFlightId: '1234e86b-1325-43f1-be92-ce129e61712c'
        })
      ).rejects.toThrow(
        new HttpError(404, { message: 'Return flight not found' })
      );
    });

    it('should throw error if return flight has different destination', async () => {
      const departureMockFlight = {
        id: '1',
        airline: {},
        airplane: {},
        flightSeats: [
          { row: 10, column: 2 },
          { row: 5, column: 1 }
        ],
        departureAirport: { id: 'dep1' },
        destinationAirport: { id: 'dest1' }
      };

      const returnMockFlight = {
        id: '1234e86b-1325-43f1-be92-ce129e61712b',
        airline: {},
        airplane: {},
        flightSeats: [
          { row: 10, column: 2 },
          { row: 5, column: 1 }
        ],
        departureAirport: { id: 'dest2' },
        destinationAirport: { id: 'dep1' }
      };

      prisma.flight.findUnique
        .mockImplementationOnce(() => Promise.resolve(departureMockFlight))
        .mockImplementationOnce(() => Promise.resolve(returnMockFlight));

      await expect(
        FlightService.getFlight('1', {
          returnFlightId: '1234e86b-1325-43f1-be92-ce129e61712b'
        })
      ).rejects.toThrow(
        new HttpError(400, {
          message:
            'Return flight must have the same destination as the departure flight'
        })
      );
    });

    it('should sort flight seats by row and column', async () => {
      const mockFlight = {
        id: '1',
        flightSeats: [
          { row: 10, column: 2 },
          { row: 5, column: 1 }
        ],
        departureAirport: { id: 'dep1' },
        destinationAirport: { id: 'dest1' }
      };

      prisma.flight.findUnique.mockResolvedValueOnce(mockFlight);

      const result = await FlightService.getFlight('1', {});
      expect(result.departureFlight.flightSeats).toEqual([
        { row: 5, column: 1 },
        { row: 10, column: 2 }
      ]);
    });
  });

  describe('getFlights', () => {
    it('should get flights list with filters', async () => {
      const mockFlights = [
        {
          id: '1',
          airline: {},
          airplane: {},
          departureAirport: {},
          destinationAirport: {}
        }
      ];

      prisma.flight.count.mockResolvedValueOnce(1);
      prisma.flight.findMany.mockResolvedValueOnce(mockFlights);

      const result = await FlightService.getFlights({
        type: FlightClassType.ECONOMY,
        departureDate: '2023-12-25'
      });

      expect(result).toEqual({
        flights: mockFlights,
        meta: expect.any(Object)
      });
    });

    it('should filter flights by departureDate', async () => {
      const mockFlights = [
        { id: '1', departureTimestamp: new Date('2023-12-25') }
      ];
      const query = { departureDate: '2023-12-25' };

      prisma.flight.findMany.mockResolvedValueOnce(mockFlights);

      const result = await FlightService.getFlights(query);
      expect(result.flights).toEqual(mockFlights);
      expect(prisma.flight.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departureTimestamp: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date)
            })
          })
        })
      );
    });

    it('should sort by cheapestPrice', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'cheapestPrice'
      };

      prisma.flight.findMany.mockResolvedValue([
        { price: 50, departureTimestamp: new Date() },
        { price: 100, departureTimestamp: new Date() }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].price).toBeLessThan(result.flights[1].price);
    });

    it('should sort by shortestDuration', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'shortestDuration'
      };

      prisma.flight.findMany.mockResolvedValue([
        { durationMinutes: 200, departureTimestamp: new Date() },
        { durationMinutes: 300, departureTimestamp: new Date() }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].durationMinutes).toBeLessThan(
        result.flights[1].durationMinutes
      );
    });

    it('should sort by earliestDeparture', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'earliestDeparture'
      };

      prisma.flight.findMany.mockResolvedValue([
        { departureTimestamp: new Date('2024-12-20T10:00:00Z') },
        { departureTimestamp: new Date('2024-12-21T10:00:00Z') }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].departureTimestamp.getTime()).toBeLessThan(
        result.flights[1].departureTimestamp.getTime()
      );
    });

    it('should sort by latestDeparture', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'latestDeparture'
      };

      prisma.flight.findMany.mockResolvedValue([
        { departureTimestamp: new Date('2024-12-21T10:30:00Z') },
        { departureTimestamp: new Date('2024-12-21T10:00:00Z') }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].departureTimestamp.getTime()).toBeGreaterThan(
        result.flights[1].departureTimestamp.getTime()
      );
    });

    it('should sort by earliestReturn', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'earliestReturn'
      };

      prisma.flight.findMany.mockResolvedValue([
        { arrivalTimestamp: new Date('2024-12-21T10:00:00Z') },
        { arrivalTimestamp: new Date('2024-12-22T10:00:00Z') }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].arrivalTimestamp.getTime()).toBeLessThan(
        result.flights[1].arrivalTimestamp.getTime()
      );
    });

    it('should sort by latestReturn', async () => {
      const query = {
        type: FlightClassType.ECONOMY,
        page: '1',
        departureDate: '2024-12-20',
        sortBy: 'latestReturn'
      };

      prisma.flight.findMany.mockResolvedValue([
        { arrivalTimestamp: new Date('2024-12-22T10:00:00Z') },
        { arrivalTimestamp: new Date('2024-12-21T10:00:00Z') }
      ]);

      const result = await FlightService.getFlights(query);

      expect(result.flights[0].arrivalTimestamp.getTime()).toBeGreaterThan(
        result.flights[1].arrivalTimestamp.getTime()
      );
    });
  });

  describe('getFavoriteFlights', () => {
    it('should get favorite flights', async () => {
      const mockFlights = [
        {
          id: '1',
          price: 100
        }
      ];

      prisma.$queryRawTyped.mockResolvedValueOnce(mockFlights);

      const result = await FlightService.getFavoriteFlights({
        continent: Continent.ASIA
      });

      expect(result).toEqual({
        flights: mockFlights,
        meta: {
          limit: expect.any(Number),
          nextCursorId: null,
          nextCursorPrice: null
        }
      });
    });

    it('should return favorite flights with pagination', async () => {
      const mockFavoriteFlights = [{ id: '1', price: 100 }];
      const query = { continent: Continent.ASIA };

      prisma.$queryRawTyped.mockResolvedValueOnce(mockFavoriteFlights);

      const result = await FlightService.getFavoriteFlights(query);
      expect(result.flights).toEqual(mockFavoriteFlights);
      expect(result.meta.limit).toBe(MAX_CURSOR_LIMIT);
      expect(result.meta.nextCursorId).toBeNull();
    });

    it('should fetch favorite flights using cursor and return correct meta', async () => {
      const mockFlights = [{ id: '1', price: 150 }];

      prisma.$queryRawTyped.mockResolvedValueOnce(mockFlights);

      const result = await FlightService.getFavoriteFlights({
        nextCursorId: '1',
        nextCursorPrice: 150
      });
      expect(result.flights.length).toBe(1);
      expect(result.meta.nextCursorId).toBeNull();
    });

    it('should apply MAX_CURSOR_LIMIT correctly', async () => {
      const mockFlights = Array(MAX_CURSOR_LIMIT).fill({ id: '1', price: 100 });

      prisma.$queryRawTyped.mockResolvedValueOnce(mockFlights);

      const result = await FlightService.getFavoriteFlights({
        continent: Continent.ASIA
      });

      expect(result.flights.length).toBe(MAX_CURSOR_LIMIT);
    });
  });
});
