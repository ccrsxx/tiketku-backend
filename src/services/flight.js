import { prisma } from '../utils/db.js';

/** @import {Flight} from '@prisma/client' */
/** @import {ValidFlightQueryParams, ValidFavoriteFlightQueryParams} from '../middlewares/validation/flight.js' */

/** @param {ValidFlightQueryParams} query */
async function getFlights(query) {
  const {
    departureAirportId,
    destinationAirportId,
    departureDate,
    returnDate
  } = query;

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
async function getFavoriteFlights(query) {
  const { continent } = query;

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
  getFlights,
  getFavoriteFlights
};
