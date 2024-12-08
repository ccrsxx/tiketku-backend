import { midtrans } from '../utils/midtrans.js';
import { logger } from '../loaders/pino.js';
import { prisma } from '../utils/db.js';

/** @import {NotificationPayload} from 'midtrans-client' */

/** @param {NotificationPayload} payload */
export async function manageMidtransNotification(payload) {
  logger.info(payload, 'Received midtrans notification');

  const validPayload = await midtrans.core.transaction.status(
    payload.transaction_id
  );

  const {
    order_id: orderId,
    fraud_status: fraudStatus,
    payment_type: paymentType,
    transaction_status: transactionStatus
  } = validPayload;

  logger.info(
    `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
  );

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: orderId
    },
    include: {
      payment: true,
      bookings: true
    }
  });

  if (!transaction) {
    logger.error(`Transaction not found: ${orderId}`);
    return;
  }

  if (transaction.payment.status !== 'PENDING') {
    logger.error(`Transaction ${orderId} has already been processed`);
    return;
  }

  const bookingFlightSeats = [];

  for (const booking of transaction.bookings) {
    const { departureFlightSeatId, returnFlightSeatId } = booking;

    if (departureFlightSeatId) {
      bookingFlightSeats.push(departureFlightSeatId);
    }

    if (returnFlightSeatId) {
      bookingFlightSeats.push(returnFlightSeatId);
    }
  }

  if (!bookingFlightSeats.length) {
    logger.error(`No flight seats found for transaction: ${orderId}`);
    return;
  }

  const validPaymentMethod = midtrans.validatePaymentMethod(paymentType);

  if (!validPaymentMethod) {
    logger.error(`Invalid payment method: ${paymentType}`);
    return;
  }

  /**
   * Refactored logic for handling midtrans notification. Reference:
   * https://docs.midtrans.com/docs/https-notification-webhooks#example-on-handling-http-notifications
   */

  const isSuccess =
    (transactionStatus === 'capture' && fraudStatus === 'accept') ||
    transactionStatus === 'settlement';

  const isFailure =
    transactionStatus === 'deny' ||
    transactionStatus === 'cancel' ||
    transactionStatus === 'expire';

  const isPending = transactionStatus === 'pending';

  if (isSuccess) {
    const updateTransactionAction = prisma.transaction.update({
      where: {
        id: orderId
      },
      data: {
        payment: {
          update: {
            status: 'SUCCESS',
            method: validPaymentMethod
          }
        }
      }
    });

    const updateFlightSeatsAction = prisma.flightSeat.updateMany({
      where: {
        id: {
          in: bookingFlightSeats
        }
      },
      data: {
        status: 'BOOKED'
      }
    });

    await prisma.$transaction([
      updateTransactionAction,
      updateFlightSeatsAction
    ]);

    logger.info(`Transaction ${orderId} succeeded`);

    return;
  } else if (isFailure) {
    const updateTransactionAction = prisma.transaction.update({
      where: {
        id: orderId
      },
      data: {
        payment: {
          update: {
            status: 'FAILED',
            method: validPaymentMethod
          }
        }
      }
    });

    const updateFlightSeatsAction = prisma.flightSeat.updateMany({
      where: {
        id: {
          in: bookingFlightSeats
        }
      },
      data: {
        status: 'AVAILABLE'
      }
    });

    await prisma.$transaction([
      updateTransactionAction,
      updateFlightSeatsAction
    ]);

    logger.info(`Transaction ${orderId} failed`);

    return;
  } else if (isPending) {
    await prisma.transaction.update({
      where: {
        id: orderId
      },
      data: {
        payment: {
          update: {
            status: 'PENDING',
            method: validPaymentMethod
          }
        }
      }
    });

    logger.info(
      `Transaction ${orderId} with payment method ${paymentType} is pending`
    );

    return;
  }

  logger.warn(`Unhandled transaction status: ${transactionStatus}`);
}

export const MidtransService = {
  manageMidtransNotification
};
