import { z } from 'zod';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import {
  MAX_OFFSET_LIMIT,
  MAX_CURSOR_LIMIT,
  generateOffsetPaginationMeta
} from '../utils/pagination.js';
import { Continent, FlightClassType } from '@prisma/client';
import {
  validCursorSchema,
  validPageCountSchema
} from '../utils/validation.js';
import * as typedSql from '@prisma/client/sql';

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
  page: z
    .string()
    .transform((value) => validPageCountSchema.safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validFlightQueryParams>} ValidFlightQueryParams */

/** @param {ValidFlightQueryParams} query */
async function getFlights(query) {
  const {
    type,
    page,
    sortBy,
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

  /** @type {Prisma.FlightWhereInput} */
  const flightWhereFilter = {
    type,
    departureAirportId,
    destinationAirportId,
    ...(departureParsedDate && {
      departureTimestamp: {
        gte: departureParsedDate,
        lte: /** @type {Date} */ (nextDayAfterDepartureDate)
      }
    })
  };

  const flightsCount = await prisma.flight.count({
    where: flightWhereFilter
  });

  const paginationMeta = generateOffsetPaginationMeta({
    page,
    limit: MAX_OFFSET_LIMIT,
    recordCount: flightsCount
  });

  if (paginationMeta.offPageLimit) {
    return {
      meta: paginationMeta.meta,
      flights: []
    };
  }

  /** @type {Prisma.FlightOrderByWithRelationInput | undefined} */
  let orderByClause;

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
    take: MAX_CURSOR_LIMIT,
    skip: paginationMeta.offset,
    where: flightWhereFilter,
    orderBy: orderByClause,
    include: {
      airline: true,
      airplane: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  return {
    flights,
    meta: paginationMeta.meta
  };
}

const validFavoriteFlightQueryParams = z.object({
  continent: z
    .string()
    .transform((value) => z.nativeEnum(Continent).safeParse(value).data)
    .optional(),
  nextCursorId: z
    .string()
    .transform((value) => validCursorSchema.safeParse(value).data)
    .optional(),
  nextCursorPrice: z
    .string()
    .transform((value) => z.coerce.number().safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validFavoriteFlightQueryParams>} ValidFavoriteFlightQueryParams */

/** @param {ValidFavoriteFlightQueryParams} query */
async function getFavoriteFlights(query) {
  const { continent, nextCursorId, nextCursorPrice } =
    validFavoriteFlightQueryParams.safeParse(query).data ?? {};

  const flights = await prisma.$queryRawTyped(
    typedSql.getFavoriteFlights(
      nextCursorId ?? '00000000-0000-0000-0000-000000000000',
      nextCursorPrice ?? 0,
      // @ts-expect-error
      continent ?? null
    )
  );

  const { id = null, price = null } = flights[MAX_CURSOR_LIMIT - 1] ?? {};

  return {
    flights,
    meta: {
      limit: MAX_CURSOR_LIMIT,
      nextCursorId: id,
      nextCursorPrice: price
    }
  };
}

export const FlightService = {
  getFlight,
  getFlights,
  getFavoriteFlights
};
