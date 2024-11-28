import { prisma } from '../utils/db.js';

/** @import {Continent, Prisma} from '@prisma/client' */

/**
 * @param {string} departureAirportId
 * @param {string} destinationAirportId
 * @param {Date} departureDate
 * @param {Date | undefined} returnDate
 */
async function getFlights(
  departureAirportId,
  destinationAirportId,
  departureDate,
  returnDate
) {
  const departureFlights = await prisma.flight.findMany({
    where: {
      departureAirportId,
      destinationAirportId,
      departureTimestamp: {
        gte: departureDate
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
          location: true
        }
      },
      destinationAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          location: true
        }
      }
    }
  });

  const returnFlights = returnDate
    ? await prisma.flight.findMany({
        where: {
          departureAirportId: destinationAirportId,
          destinationAirportId: departureAirportId,
          departureTimestamp: {
            gte: returnDate
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
              location: true
            }
          },
          destinationAirport: {
            select: {
              name: true,
              type: true,
              code: true,
              location: true
            }
          }
        }
      })
    : [];

  return { departureFlights, returnFlights };
}

/** @param {Continent | undefined} continent */
async function getFavoriteFlights(continent) {
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
          location: true,
          continent: true
        }
      },
      destinationAirport: {
        select: {
          name: true,
          type: true,
          code: true,
          location: true,
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
