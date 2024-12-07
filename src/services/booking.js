import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { toTitleCase, generateRandomToken } from '../utils/helper.js';
import {
  MAX_OFFSET_LIMIT,
  generateOffsetPaginationMeta
} from '../utils/pagination.js';

/** @import {Prisma,Flight} from '@prisma/client' */
/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidBookingPayload,ValidFlightSeatPayload,ValidPassengerPayload,ValidMyBookingsQueryParams} from '../middlewares/validation/booking.js' */

/**
 * @param {string} userId
 * @param {ValidMyBookingsQueryParams} query
 */
async function getMyBookings(
  userId,
  { bookingCode, startDate, endDate, page }
) {
  /** @type {Prisma.TransactionWhereInput} */
  const bookingWhereFilter = {
    userId,
    code: bookingCode,
    createdAt: {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    }
  };

  const bookingsCount = await prisma.transaction.count({
    where: bookingWhereFilter
  });

  const paginationMeta = generateOffsetPaginationMeta({
    page,
    limit: MAX_OFFSET_LIMIT,
    recordCount: bookingsCount
  });

  if (paginationMeta.offPageLimit) {
    return {
      meta: paginationMeta.meta,
      bookings: []
    };
  }

  const bookings = await prisma.transaction.findMany({
    where: bookingWhereFilter,
    take: paginationMeta.limit,
    skip: paginationMeta.offset,
    include: {
      payment: true,
      bookings: true,
      returnFlight: true,
      departureFlight: true
    }
  });

  return {
    meta: paginationMeta.meta,
    bookings
  };
}

/**
 * @param {string} userId
 * @param {ValidBookingPayload} payload
 */
async function createBooking(
  userId,
  { passengers, returnFlightId, departureFlightId }
) {
  const departureFlightData = await checkFlightAvailability(
    'departure',
    departureFlightId,
    passengers
  );

  /** @type {FlightAvailability | null} */
  let returnFlightData = null;

  if (returnFlightId) {
    returnFlightData = await checkFlightAvailability(
      'return',
      returnFlightId,
      passengers,
      departureFlightData.flight
    );
  }

  let flightPrice = departureFlightData.flight.price;
  let mergedPassengers = departureFlightData.passengers;

  if (returnFlightData) {
    flightPrice += returnFlightData.flight.price;
    mergedPassengers.push(...returnFlightData.passengers);
  }

  const bookingCreateAction = prisma.transaction.create({
    data: {
      code: generateRandomToken(4),
      user: {
        connect: {
          id: userId
        }
      },
      departureFlight: {
        connect: {
          id: departureFlightId
        }
      },
      ...(returnFlightId && {
        returnFlight: {
          connect: {
            id: returnFlightId
          }
        }
      }),
      bookings: {
        create: mergedPassengers.map(
          ({ departureFlightSeat, returnFlightSeat, ...rest }) => ({
            passenger: {
              create: {
                ...rest,
                birthDate: new Date(rest.birthDate),
                identityExpirationDate: new Date(rest.identityExpirationDate)
              }
            },
            ...(departureFlightSeat && {
              departureFlightSeat: {
                connect: {
                  id: departureFlightSeat.id
                }
              }
            }),
            ...(returnFlightSeat && {
              returnFlightSeat: {
                connect: {
                  id: returnFlightSeat.id
                }
              }
            })
          })
        )
      },
      payment: {
        create: {
          amount: flightPrice,
          method: 'CREDIT_CARD',
          status: 'PENDING'
        }
      }
    }
  });

  let flightSeatsToBeBooked = [];

  for (const { departureFlightSeat, returnFlightSeat } of mergedPassengers) {
    if (departureFlightSeat) {
      flightSeatsToBeBooked.push(departureFlightSeat.id);
    }

    if (returnFlightSeat) {
      flightSeatsToBeBooked.push(returnFlightSeat.id);
    }
  }

  const flightSeatsUpdateAction = prisma.flightSeat.updateMany({
    where: {
      id: {
        in: flightSeatsToBeBooked
      }
    },
    data: {
      status: 'BOOKED'
    }
  });

  await prisma.$transaction([bookingCreateAction, flightSeatsUpdateAction]);
}

/**
 * @typedef {ValidPassengerPayload &
 *   Partial<
 *     Record<
 *       'departureFlightSeat' | 'returnFlightSeat',
 *       OmittedModel<'flightSeat'>
 *     >
 *   >} PassengerWithFlightSeat
 */

/**
 * @typedef {Object} FlightAvailability
 * @property {Flight} flight
 * @property {PassengerWithFlightSeat[]} passengers
 */

/**
 * @param {'departure' | 'return'} flightType
 * @param {string} flightId
 * @param {ValidPassengerPayload[]} passengers
 * @param {Flight} [departureFlight]
 * @returns {Promise<FlightAvailability>}
 */
async function checkFlightAvailability(
  flightType,
  flightId,
  passengers,
  departureFlight
) {
  const formattedFlightType = toTitleCase(flightType);

  const flight = await prisma.flight.findUnique({
    where: {
      id: flightId,
      ...(departureFlight && {
        departureAirportId: departureFlight.destinationAirportId,
        destinationAirportId: departureFlight.departureAirportId
      })
    },
    include: { airplane: true },
    omit: {
      airlineId: false,
      createdAt: false,
      updatedAt: false,
      airplaneId: false,
      departureAirportId: false,
      destinationAirportId: false
    }
  });

  if (!flight) {
    throw new HttpError(404, {
      message: `${formattedFlightType} flight not found`
    });
  }

  const flightSeatsFromBody = /** @type {ValidFlightSeatPayload[]} */ (
    passengers
      .map(({ departureFlightSeat, returnFlightSeat }) =>
        flightType === 'departure' ? departureFlightSeat : returnFlightSeat
      )
      .filter(Boolean)
  );

  for (const flightSeat of flightSeatsFromBody) {
    const isValidFlightSeat =
      flight.airplane.maxRow >= flightSeat.row &&
      flight.airplane.maxColumn >= flightSeat.column;

    if (!isValidFlightSeat) {
      throw new HttpError(400, {
        message: `Invalid ${flightType} flight seats selected`
      });
    }
  }

  const flightSeatsAvailability = await prisma.flightSeat.findMany({
    where: {
      flightId: flightId,
      status: 'AVAILABLE',
      OR: flightSeatsFromBody
    }
  });

  const isFlightSeatsAvailable =
    flightSeatsFromBody.length === flightSeatsAvailability.length;

  if (!isFlightSeatsAvailable) {
    throw new HttpError(409, {
      message: `Selected ${flightType} flight seats are no longer available`
    });
  }

  const passengerWithFlightSeatsIds = /** @type {PassengerWithFlightSeat[]} */ (
    passengers.map((passenger) => {
      const flightSeatKey = /** @type {const} */ (`${flightType}FlightSeat`);

      const flightSeat = flightSeatsAvailability.find(
        ({ row, column }) =>
          row === passenger[flightSeatKey]?.row &&
          column === passenger[flightSeatKey]?.column
      );

      if (flightSeat) passenger[flightSeatKey] = flightSeat;

      return passenger;
    })
  );

  return {
    flight,
    passengers: passengerWithFlightSeatsIds
  };
}

export const BookingService = {
  createBooking,
  getMyBookings
};
