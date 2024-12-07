import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { MAX_CURSOR_LIMIT } from '../utils/pagination.js';

/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidFlightQueryParams, ValidFavoriteFlightQueryParams} from '../middlewares/validation/flight.js' */

/** @param {string} id */
async function getFlight(id) {
  const flight = await prisma.flight.findUnique({
    where: { id },
    include: {
      airline: true,
      airplane: true,
      flightSeats: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  if (!flight) {
    throw new HttpError(404, { message: 'Flight not found' });
  }

  return flight;
}

/** @param {ValidFlightQueryParams} query */
async function getFlights({
  returnDate,
  departureDate,
  departureAirportId,
  destinationAirportId
}) {
  const departureParsedDate = new Date(departureDate);
  const nextDayAfterDepartureDate = new Date(departureDate);

  nextDayAfterDepartureDate.setDate(nextDayAfterDepartureDate.getDate() + 1);

  const departureFlights = await prisma.flight.findMany({
    where: {
      departureAirportId,
      destinationAirportId,
      departureTimestamp: {
        gte: departureParsedDate,
        lte: nextDayAfterDepartureDate
      }
    },
    include: {
      airline: true,
      airplane: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  /** @type {OmittedModel<'flight'>[]} */
  let returnFlights = [];

  if (returnDate) {
    const returnParsedDate = new Date(returnDate);

    const nextDayAfterReturnDate = new Date(returnDate);

    nextDayAfterReturnDate.setDate(nextDayAfterReturnDate.getDate() + 1);

    returnFlights = await prisma.flight.findMany({
      where: {
        departureAirportId: destinationAirportId,
        destinationAirportId: departureAirportId,
        departureTimestamp: {
          gte: returnParsedDate,
          lte: nextDayAfterReturnDate
        }
      },
      include: {
        airline: true,
        airplane: true,
        departureAirport: true,
        destinationAirport: true
      }
    });
  }

  return { departureFlights, returnFlights };
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
