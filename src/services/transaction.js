import { prisma } from '../utils/db.js';
import snap, { midtransParameter } from '../utils/midtrans.js';
import { HttpError } from '../utils/error.js';
import { generateRandomToken, toTitleCase } from '../utils/helper.js';
import { UserService } from './user.js';

/** @import {Flight,FlightSeat} from '@prisma/client' */
/** @import {ValidTransactionPayload,ValidFlightSeatPayload,ValidPassengerPayload} from '../middlewares/validation/transaction.js' */

/** @param {string} userId */
async function getMyTransaction(userId) {
  const transactions = await prisma.transaction.findMany({
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

  return transactions;
}

/**
 * @param {string} userId
 * @param {ValidTransactionPayload} payload
 */
async function createTransaction(
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

  let response = {};

  await prisma.$transaction(async (tx) => {
    const bookingCreateAction = await tx.transaction.create({
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

    await tx.flightSeat.updateMany({
      where: {
        id: {
          in: flightSeatsToBeBooked
        }
      },
      data: {
        status: 'BOOKED'
      }
    });

    const user = await UserService.getUser(bookingCreateAction.userId);

    const name = user.name.split(' ');
    const first_name = name[0];
    const last_name = name[1];

    const parameter = midtransParameter(
      bookingCreateAction.id,
      flightPrice,
      first_name,
      last_name,
      user.email,
      user.phoneNumber
    );

    await snap.createTransaction(parameter).then((transaction) => {
      response = {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      };
    });
  });

  return response;
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
    include: { airplane: true }
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

export const TransactionService = {
  createTransaction,
  getMyTransaction
};
