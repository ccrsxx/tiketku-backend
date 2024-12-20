import { logger } from '../../loaders/pino.js';
import { prisma } from '../../utils/db.js';

async function invalidatePendingTransactions() {
  logger.info('Invalidating pending transactions');

  const transactions = await prisma.transaction.findMany({
    where: {
      payment: {
        status: 'PENDING',
        OR: [
          {
            expiredAt: {
              lte: new Date()
            }
          },
          {
            method: null,
            expiredAtWithoutMethod: {
              lte: new Date()
            }
          }
        ]
      }
    },
    include: {
      payment: true,
      bookings: {
        omit: {
          returnFlightSeatId: false,
          departureFlightSeatId: false
        }
      }
    },
    take: 100
  });

  if (!transactions.length) {
    logger.info('No pending transactions found');
    return;
  }

  logger.info(`Found ${transactions.length} pending transactions`);

  /** @type {string[]} */
  const flightsSeatsToBeReleased = [];

  for (const transaction of transactions) {
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
  }

  logger.info(
    `Found ${flightsSeatsToBeReleased.length} flight seats to be released`
  );

  const updateSeatAction = prisma.flightSeat.updateMany({
    where: {
      id: {
        in: flightsSeatsToBeReleased
      }
    },
    data: {
      status: 'AVAILABLE'
    }
  });

  const updatePaymentAction = prisma.payment.updateMany({
    where: {
      id: {
        in: transactions.map(({ payment: { id } }) => id)
      }
    },
    data: {
      status: 'FAILED'
    }
  });

  await prisma.$transaction([updateSeatAction, updatePaymentAction]);

  logger.info('Pending transactions invalidated');
}

export const WebhookTransactionService = {
  invalidatePendingTransactions
};
