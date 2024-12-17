import { prisma } from '../utils/db.js';
import { midtrans } from '../utils/midtrans.js';
import { HttpError } from '../utils/error.js';
import { sendTransactionTicketEmail } from '../utils/emails/mail.js';
import {
  toTitleCase,
  generateRandomToken,
  getFirstAndLastName
} from '../utils/helper.js';
import {
  MAX_OFFSET_LIMIT,
  generateOffsetPaginationMeta
} from '../utils/pagination.js';
import { z } from 'zod';
import { validPageCountSchema } from '../utils/validation.js';

/** @import {Prisma,Flight} from '@prisma/client' */
/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidTransactionPayload,ValidPassengerPayload} from '../middlewares/validation/transaction.js' */

/**
 * @param {OmittedModel<'user'>} user
 * @param {ValidTransactionPayload} payload
 */
async function createTransaction(
  user,
  { passengers, returnFlightId, departureFlightId }
) {
  const departureFlightData = await checkFlightAvailability(
    'departure',
    departureFlightId,
    passengers
  );

  /** @type {Flight | null} */
  let returnFlightData = null;

  if (returnFlightId) {
    returnFlightData = await checkFlightAvailability(
      'return',
      returnFlightId,
      passengers,
      departureFlightData
    );
  }

  let flightPrice = 0;

  let flightSeatsToBeBooked = [];

  for (const { departureFlightSeatId, returnFlightSeatId } of passengers) {
    if (departureFlightSeatId) {
      flightPrice += departureFlightData.price;
      flightSeatsToBeBooked.push(departureFlightSeatId);
    }

    if (returnFlightData && returnFlightSeatId) {
      flightPrice += returnFlightData.price;
      flightSeatsToBeBooked.push(returnFlightSeatId);
    }
  }

  const next15MinutesDate = new Date();

  next15MinutesDate.setMinutes(next15MinutesDate.getMinutes() + 15);

  const createdTransaction = await prisma.$transaction(async (tx) => {
    const transactionCreation = await tx.transaction.create({
      data: {
        code: generateRandomToken(4),
        user: {
          connect: {
            id: user.id
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
          create: passengers.map(
            ({ departureFlightSeatId, returnFlightSeatId, ...rest }) => ({
              passenger: {
                create: {
                  ...rest,
                  birthDate: new Date(rest.birthDate),
                  identityExpirationDate: new Date(rest.identityExpirationDate)
                }
              },
              ...(departureFlightSeatId && {
                departureFlightSeat: {
                  connect: {
                    id: departureFlightSeatId
                  }
                }
              }),
              ...(returnFlightData &&
                returnFlightSeatId && {
                  returnFlightSeat: {
                    connect: {
                      id: returnFlightSeatId
                    }
                  }
                })
            })
          )
        },
        payment: {
          create: {
            amount: flightPrice,
            status: 'PENDING',
            snapToken: '',
            snapRedirectUrl: '',
            expiredAt: next15MinutesDate
          }
        }
      },
      omit: {
        paymentId: false
      }
    });

    const { firstName, lastName } = getFirstAndLastName(user.name);

    const transactionResponse = await midtrans.snap.createTransaction({
      transaction_details: {
        order_id: transactionCreation.id,
        gross_amount: flightPrice
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: user.phoneNumber
      }
    });

    await tx.payment.update({
      where: {
        id: transactionCreation.paymentId
      },
      data: {
        snapToken: transactionResponse.token,
        snapRedirectUrl: transactionResponse.redirect_url
      }
    });

    await tx.flightSeat.updateMany({
      where: {
        id: {
          in: flightSeatsToBeBooked
        }
      },
      data: {
        status: 'HELD'
      }
    });

    return {
      transactionId: transactionCreation.id,
      snapToken: transactionResponse.token,
      snapRedirectUrl: transactionResponse.redirect_url
    };
  });

  return createdTransaction;
}

/**
 * @param {'departure' | 'return'} flightType
 * @param {string} flightId
 * @param {ValidPassengerPayload[]} passengers
 * @param {Flight} [departureFlight]
 * @returns {Promise<Flight>}
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
    include: { flightSeats: true },
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

  const flightSeatsFromBody = /** @type {string[]} */ (
    passengers
      .map(({ departureFlightSeatId, returnFlightSeatId }) =>
        flightType === 'departure' ? departureFlightSeatId : returnFlightSeatId
      )
      .filter(Boolean)
  );

  const isFlightSeatValid = flightSeatsFromBody.every((flightSeatId) =>
    flight.flightSeats.some(({ id }) => id === flightSeatId)
  );

  if (!isFlightSeatValid) {
    throw new HttpError(400, {
      message: `Invalid ${formattedFlightType} flight seats selected`
    });
  }

  const flightSeatsAvailability = flightSeatsFromBody.filter((flightSeatId) =>
    flight.flightSeats.some(
      ({ id, status }) => id === flightSeatId && status === 'AVAILABLE'
    )
  );

  const isFlightSeatsAvailable =
    flightSeatsFromBody.length === flightSeatsAvailability.length;

  if (!isFlightSeatsAvailable) {
    throw new HttpError(409, {
      message: `Selected ${flightType} flight seats are no longer available`
    });
  }

  return flight;
}

const validMyTransactionsQueryParams = z.object({
  bookingCode: z
    .string()
    .transform((value) => z.string().trim().length(6).safeParse(value).data)
    .optional(),
  startDate: z
    .string()
    .transform((value) => z.string().date().safeParse(value).data)
    .optional(),
  endDate: z
    .string()
    .transform((value) => z.string().date().safeParse(value).data)
    .optional(),
  page: validPageCountSchema
    .transform((value) => validPageCountSchema.safeParse(value).data)
    .optional()
});

/** @typedef {z.infer<typeof validMyTransactionsQueryParams>} ValidMyTransactionsQueryParams */

/**
 * @param {string} userId
 * @param {ValidMyTransactionsQueryParams} query
 */
async function getMyTransactions(userId, query) {
  const { bookingCode, startDate, endDate, page } =
    validMyTransactionsQueryParams.safeParse(query).data ?? {};

  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate) {
    parsedStartDate = new Date(startDate);
  }

  if (endDate) {
    parsedEndDate = new Date(endDate);
  }

  // Check if start date is greater than end date, if true then set end date to null
  if (parsedStartDate && parsedEndDate && parsedStartDate >= parsedEndDate) {
    parsedEndDate = null;
  }

  /** @type {Prisma.TransactionWhereInput} */
  const transactionWhereFilter = {
    userId,
    code: bookingCode,
    createdAt: {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    }
  };

  const transactionsCount = await prisma.transaction.count({
    where: transactionWhereFilter
  });

  const paginationMeta = generateOffsetPaginationMeta({
    page,
    limit: MAX_OFFSET_LIMIT,
    recordCount: transactionsCount
  });

  if (paginationMeta.offPageLimit) {
    return {
      meta: paginationMeta.meta,
      transactions: []
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: transactionWhereFilter,
    take: paginationMeta.limit,
    skip: paginationMeta.offset,
    include: {
      payment: true,
      bookings: {
        include: {
          passenger: true
        }
      },
      returnFlight: {
        include: {
          airline: true,
          departureAirport: true,
          destinationAirport: true
        }
      },
      departureFlight: {
        include: {
          airline: true,
          departureAirport: true,
          destinationAirport: true
        }
      }
    }
  });

  return {
    meta: paginationMeta.meta,
    transactions
  };
}

/**
 * @param {string} userId
 * @param {string} transactionId
 */
async function getTransaction(userId, transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId: userId
    },
    include: {
      payment: true,
      bookings: {
        include: {
          passenger: true
        }
      },
      returnFlight: {
        include: {
          airline: true,
          departureAirport: true,
          destinationAirport: true
        }
      },
      departureFlight: {
        include: {
          airline: true,
          departureAirport: true,
          destinationAirport: true
        }
      }
    }
  });

  if (!transaction) {
    throw new HttpError(404, {
      message: 'Transaction not found'
    });
  }

  return transaction;
}

/**
 * @param {string} userId
 * @param {string} transactionId
 */
async function cancelTransaction(userId, transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId: userId
    },
    include: {
      payment: true,
      bookings: {
        omit: {
          returnFlightSeatId: false,
          departureFlightSeatId: false
        }
      }
    }
  });

  if (!transaction) {
    throw new HttpError(404, {
      message: 'Transaction not found'
    });
  }

  const isPaymentAlreadyFinished = transaction.payment.status !== 'PENDING';

  if (isPaymentAlreadyFinished) {
    throw new HttpError(409, {
      message: 'Transaction already success or failed'
    });
  }

  /** @type {string[]} */
  const flightsSeatsToBeReleased = [];

  for (const {
    returnFlightSeatId,
    departureFlightSeatId
  } of transaction.bookings) {
    if (departureFlightSeatId) {
      flightsSeatsToBeReleased.push(departureFlightSeatId);
    }

    if (returnFlightSeatId) {
      flightsSeatsToBeReleased.push(returnFlightSeatId);
    }
  }

  await prisma.$transaction([
    prisma.flightSeat.updateMany({
      where: {
        id: {
          in: flightsSeatsToBeReleased
        }
      },
      data: {
        status: 'AVAILABLE'
      }
    }),
    prisma.transaction.update({
      where: {
        id: transactionId
      },
      data: {
        payment: {
          update: {
            status: 'FAILED'
          }
        }
      }
    })
  ]);
}

/**
 * @param {string} userId
 * @param {string} transactionId
 */
async function sendTransactionTicket(userId, transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId: userId,
      payment: {
        status: 'SUCCESS'
      }
    },
    include: {
      user: true,
      payment: true,
      bookings: {
        include: {
          passenger: true
        }
      },
      returnFlight: {
        include: {
          airline: true,
          airplane: true,
          departureAirport: true,
          destinationAirport: true
        }
      },
      departureFlight: {
        include: {
          airline: true,
          airplane: true,
          departureAirport: true,
          destinationAirport: true
        }
      }
    }
  });

  if (!transaction) {
    throw new HttpError(404, {
      message: 'Transaction not found'
    });
  }

  await sendTransactionTicketEmail(transaction);
}

export const TransactionService = {
  getTransaction,
  getMyTransactions,
  createTransaction,
  cancelTransaction,
  sendTransactionTicket
};
