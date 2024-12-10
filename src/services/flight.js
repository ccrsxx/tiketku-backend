import { z } from 'zod';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { MAX_CURSOR_LIMIT } from '../utils/pagination.js';

/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidFlightQueryParams, ValidFavoriteFlightQueryParams} from '../middlewares/validation/flight.js' */

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

/** @param {ValidFlightQueryParams} query */
async function getFlights({
  nextCursor,
  departureDate,
  departureAirportId,
  destinationAirportId
}) {
  const departureParsedDate = new Date(departureDate);
  const nextDayAfterDepartureDate = new Date(departureDate);

  nextDayAfterDepartureDate.setDate(nextDayAfterDepartureDate.getDate() + 1);

  const flights = await prisma.flight.findMany({
    where: {
      departureAirportId,
      destinationAirportId,
      departureTimestamp: {
        gte: departureParsedDate,
        lte: nextDayAfterDepartureDate
      }
    },
    take: MAX_CURSOR_LIMIT,
    ...(nextCursor && {
      cursor: { id: nextCursor },
      skip: 1
    }),
    orderBy: {
      id: 'asc'
    },
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

/** @param {ValidFavoriteFlightQueryParams} query */
async function getFavoriteFlights({ continent, nextCursor }) {
  const flights = await prisma.flight.findMany({
    where: continent
      ? {
          destinationAirport: {
            continent
          }
        }
      : undefined,
    take: MAX_CURSOR_LIMIT,
    ...(nextCursor && {
      cursor: { id: nextCursor },
      skip: 1
    }),
    orderBy: {
      id: 'asc'
    },
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
