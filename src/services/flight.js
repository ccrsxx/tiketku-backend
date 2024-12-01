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
  const departureFlights = await prisma.flight.findMany({
    where: {
      departureAirportId,
      destinationAirportId,
      departureTimestamp: {
        gte: new Date(departureDate)
      }
    },
    include: {
      airline: {
        select: {
          name: true,
          code: true
        }
      },
      airplane: {
        select: {
          name: true
        }
      },
      departureAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          city: true
        }
      },
      destinationAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          city: true
        }
      }
    }
  });

  /** @type {Flight[]} */
  let returnFlights = [];

  if (returnDate) {
    returnFlights = await prisma.flight.findMany({
      where: {
        departureAirportId: destinationAirportId,
        destinationAirportId: departureAirportId,
        departureTimestamp: {
          gte: new Date(returnDate)
        }
      },
      include: {
        airline: {
          select: {
            name: true,
            code: true
          }
        },
        airplane: {
          select: {
            name: true
          }
        },
        departureAirport: {
          select: {
            name: true,
            type: true,
            code: true,
            city: true
          }
        },
        destinationAirport: {
          select: {
            name: true,
            type: true,
            code: true,
            city: true
          }
        }
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
          departureAirport: {
            continent
          }
        }
      : {},
    include: {
      departureAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          city: true,
          continent: true
        }
      },
      destinationAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          city: true,
          continent: true
        }
      }
    },
    orderBy: {
      price: 'asc'
    },
    distinct: ['departureAirportId', 'destinationAirportId']
  });

  return flights;
}

export const FlightService = {
  getFlight,
  getFlights,
  getFavoriteFlights
};
