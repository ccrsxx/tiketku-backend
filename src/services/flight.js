import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @import {Flight} from '@prisma/client' */
/** @import {ValidFlightQueryParams, ValidFavoriteFlightQueryParams} from '../middlewares/validation/flight.js' */

/** @param {string} id */
async function getFlight(id) {
  const flight = await prisma.flight.findUnique({
    where: { id },
    include: {
      airline: true,
      airplane: true,
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

  /** @type {Flight[]} */
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
async function getFavoriteFlights({ continent }) {
  const flights = await prisma.flight.findMany({
    where: continent
      ? {
          destinationAirport: {
            continent
          }
        }
      : undefined,
    include: {
      departureAirport: true,
      destinationAirport: true
    },
    orderBy: {
      price: 'asc'
    },
    // Select only unique flights sorted by lowest starting price
    distinct: ['departureAirportId', 'destinationAirportId']
  });

  return flights;
}

export const FlightService = {
  getFlight,
  getFlights,
  getFavoriteFlights
};
