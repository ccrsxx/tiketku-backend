import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { MAX_CURSOR_LIMIT } from '../utils/pagination.js';

/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidFlightQueryParams, ValidFavoriteFlightQueryParams, ValidFlightDetailQueryParams} from '../middlewares/validation/flight.js' */

/**
 * @param {string} departureFlightId
 * @param {ValidFlightDetailQueryParams} query
 */
async function getFlight(departureFlightId, query) {
  const { returnFlightId } = query;
  let price = 0;

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

  price += departureFlight.price;

  let returnFlight = null;

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

    price += returnFlight.price;
  }

  return { departureFlight, returnFlight, price };
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
