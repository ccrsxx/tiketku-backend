import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { generateRandomToken } from '../utils/helper.js';

/** @import {ValidBookingPayload,ValidPassengerPayload} from '../middlewares/validation/booking.js' */
/** @import {Flight,FlightSeat} from '@prisma/client' */

/** @param {string} userId */
async function getMyBookings(userId) {
  const bookings = await prisma.transaction.findMany({
    where: {
      userId
    },
    include: {
      payment: true,
      bookings: true,
      returnFlight: true,
      departureFlight: true
    }
  });

  return bookings;
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

  /** @type {Awaited<ReturnType<typeof checkFlightAvailability>> | null} */
  let returnFlightData = null;

  if (returnFlightId) {
    returnFlightData = await checkFlightAvailability(
      'return',
      returnFlightId,
      passengers
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
 *   Partial<Record<'departureFlightSeat' | 'returnFlightSeat', FlightSeat>>} PassengerWithFlightSeat
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
 * @returns {Promise<FlightAvailability>}
 */
async function checkFlightAvailability(flightType, flightId, passengers) {
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    include: { airplane: true }
  });

  if (!flight) {
    throw new HttpError(404, { message: 'Flight not found' });
  }

  const flightSeatsFromBody = /** @type {{ row: number; column: number }[]} */ (
    passengers
      .map(({ departureFlightSeat, returnFlightSeat }) =>
        flightType === 'departure' ? departureFlightSeat : returnFlightSeat
      )
      .filter(Boolean)
  );

  for (const flightSeat of flightSeatsFromBody) {
    if (!flightSeat) continue;

    const isValidFlightSeat =
      flight.airplane.maxRow >= flightSeat.row &&
      flight.airplane.maxColumn >= flightSeat.column;

    if (!isValidFlightSeat) {
      throw new HttpError(400, {
        message: 'Invalid flight seats selected'
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
      message: 'Selected flight seats are no longer available'
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
