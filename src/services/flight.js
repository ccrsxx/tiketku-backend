import { z } from 'zod';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { MAX_CURSOR_LIMIT } from '../utils/pagination.js';
import { Continent, FlightClassType } from '@prisma/client';
import { validCursorSchema } from '../utils/validation.js';

/** @import {Prisma} from '@prisma/client' */
/** @import {OmittedModel} from '../utils/db.js' */

const validFlightDetailQueryParams = z.object({
  returnFlightId: z
    .string()
    .transform((value) => z.string().uuid().safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validFlightDetailQueryParams>} ValidFlightDetailQueryParams */

/**
 * @param {string} departureFlightId
 * @param {ValidFlightDetailQueryParams} query
 */
async function getFlight(departureFlightId, query) {
  const departureFlight = await prisma.flight.findUnique({
    where: { id: departureFlightId },
    include: {
      airline: true,
      airplane: true,
      flightSeats: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  if (!departureFlight) {
    throw new HttpError(404, { message: 'Flight not found' });
  }

  let returnFlight = null;

  const returnFlightId =
    validFlightDetailQueryParams.safeParse(query).data?.returnFlightId;

  if (returnFlightId) {
    returnFlight = await prisma.flight.findUnique({
      where: {
        id: returnFlightId
      },
      include: {
        airline: true,
        airplane: true,
        flightSeats: true,
        departureAirport: true,
        destinationAirport: true
      }
    });

    if (!returnFlight) {
      throw new HttpError(404, { message: 'Return flight not found' });
    }

    if (
      returnFlight.departureAirport.id !== departureFlight.destinationAirport.id
    ) {
      throw new HttpError(400, {
        message:
          'Return flight must have the same destination as the departure flight'
      });
    }
  }

  /**
   * @param {OmittedModel<'flightSeat'>} firstFlightSeats
   * @param {OmittedModel<'flightSeat'>} secondFlightSeats
   */
  function handleSortFlightSeat(firstFlightSeats, secondFlightSeats) {
    if (firstFlightSeats.row === secondFlightSeats.row) {
      return firstFlightSeats.column - secondFlightSeats.column;
    }

    return firstFlightSeats.row - secondFlightSeats.row;
  }

  departureFlight.flightSeats.sort(handleSortFlightSeat);

  if (returnFlight) {
    returnFlight.flightSeats.sort(handleSortFlightSeat);
  }

  return { departureFlight, returnFlight };
}

const VALID_SORT_BY = /** @type {const} */ ([
  'cheapestPrice',
  'shortestDuration',
  'earliestDeparture',
  'latestDeparture',
  'earliestReturn',
  'latestReturn'
]);

const validFlightQueryParams = z.object({
  type: z
    .string()
    .transform((value) => z.nativeEnum(FlightClassType).safeParse(value).data)
    .optional(),
  sortBy: z
    .string()
    .transform((value) => z.enum(VALID_SORT_BY).safeParse(value).data)
    .optional(),
  departureDate: z
    .string()
    .transform((value) => z.string().date().safeParse(value).data)
    .optional(),
  departureAirportId: z
    .string()
    .transform((value) => z.string().uuid().safeParse(value).data)
    .optional(),
  destinationAirportId: z
    .string()
    .transform((value) => z.string().uuid().safeParse(value).data)
    .optional(),
  nextCursor: validCursorSchema
    .transform((value) => validCursorSchema.safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validFlightQueryParams>} ValidFlightQueryParams */

/** @param {ValidFlightQueryParams} query */
async function getFlights(query) {
  const {
    type,
    sortBy,
    nextCursor,
    departureDate,
    departureAirportId,
    destinationAirportId
  } = validFlightQueryParams.safeParse(query).data ?? {};

  /** @type {Date | null} */
  let departureParsedDate = null;

  /** @type {Date | null} */
  let nextDayAfterDepartureDate = null;

  if (departureDate) {
    departureParsedDate = new Date(departureDate);

    nextDayAfterDepartureDate = new Date(departureParsedDate);
    nextDayAfterDepartureDate.setDate(nextDayAfterDepartureDate.getDate() + 1);
  }

  /** @type {Prisma.FlightOrderByWithRelationInput} */
  let orderByClause = {
    id: 'asc'
  };

  switch (sortBy) {
    case 'cheapestPrice':
      orderByClause = {
        price: 'asc'
      };
      break;
    case 'shortestDuration':
      orderByClause = {
        durationMinutes: 'asc'
      };
      break;
    case 'earliestDeparture':
      orderByClause = {
        departureTimestamp: 'asc'
      };
      break;
    case 'latestDeparture':
      orderByClause = {
        departureTimestamp: 'desc'
      };
      break;
    case 'earliestReturn':
      orderByClause = {
        arrivalTimestamp: 'asc'
      };
      break;
    case 'latestReturn':
      orderByClause = {
        arrivalTimestamp: 'desc'
      };
      break;
  }

  const flights = await prisma.flight.findMany({
    where: {
      type,
      departureAirportId,
      destinationAirportId,
      ...(departureParsedDate && {
        departureTimestamp: {
          gte: departureParsedDate,
          lte: /** @type {Date} */ (nextDayAfterDepartureDate)
        }
      })
    },
    take: MAX_CURSOR_LIMIT,
    ...(nextCursor && {
      cursor: { id: nextCursor },
      skip: 1
    }),
    orderBy: orderByClause,
    include: {
      airline: true,
      airplane: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  const parsedNextCursor = flights[MAX_CURSOR_LIMIT - 1]?.id ?? null;

  return {
    flights,
    meta: {
      limit: MAX_CURSOR_LIMIT,
      nextCursor: parsedNextCursor
    }
  };
}

const validFavoriteFlightQueryParams = z.object({
  continent: z
    .string()
    .transform((value) => z.nativeEnum(Continent).safeParse(value).data)
    .optional(),
  nextCursor: validCursorSchema
    .transform((value) => validCursorSchema.safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validFavoriteFlightQueryParams>} ValidFavoriteFlightQueryParams */

/** @param {ValidFavoriteFlightQueryParams} query */
async function getFavoriteFlights(query) {
  const { continent, nextCursor } =
    validFavoriteFlightQueryParams.safeParse(query).data ?? {};

  const flights = await prisma.flight.findMany({
    ...(continent && {
      where: {
        destinationAirport: {
          continent
        }
      }
    }),
    ...(nextCursor && {
      cursor: { id: nextCursor },
      skip: 1
    }),
    orderBy: {
      id: 'asc'
    },
    take: MAX_CURSOR_LIMIT,
    include: {
      departureAirport: true,
      destinationAirport: true
    },
    // Select only unique flights sorted by lowest starting price
    distinct: ['departureAirportId', 'destinationAirportId']
  });

  const parsedNextCursor = flights[MAX_CURSOR_LIMIT - 1]?.id ?? null;

  return {
    flights,
    meta: {
      limit: MAX_CURSOR_LIMIT,
      nextCursor: parsedNextCursor
    }
  };
}

export const FlightService = {
  getFlight,
  getFlights,
  getFavoriteFlights
};
