import { midtrans } from '../utils/midtrans.js';
import { logger } from '../loaders/pino.js';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @import {NotificationPayload} from 'midtrans-client' */

/** @param {NotificationPayload} payload */
export async function manageMidtransNotification(payload) {
  const validPayload = await checkMidtransTransactionValidity(
    payload.transaction_id
  );

  logger.info(validPayload, 'Received midtrans notification');

  const {
    order_id: orderId,
    fraud_status: fraudStatus,
    payment_type: paymentType,
    transaction_status: transactionStatus
  } = validPayload;

  logger.info(
    `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
  );

  const validPaymentMethod = midtrans.validatePaymentMethod(paymentType);

  if (!validPaymentMethod) {
    logger.error(`Invalid payment method: ${paymentType}`);
    return;
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: orderId
    },
    include: {
      payment: true,
      bookings: {
        omit: {
          returnFlightSeatId: false,
          departureFlightSeatId: false
        }
      },
      departureFlight: {
        include: {
          departureAirport: {
            select: {
              code: true
            }
          },
          destinationAirport: {
            select: {
              code: true
            }
          }
        }
      },
      returnFlight: {
        include: {
          departureAirport: {
            select: {
              code: true
            }
          },
          destinationAirport: {
            select: {
              code: true
            }
          }
        }
      }
    },
    omit: {
      userId: false
    }
  });

  if (!transaction) {
    logger.error(`Transaction not found: ${orderId}`);
    return;
  }

  let isPaymentStillValid = transaction.payment.status === 'PENDING';

  // Handle a case where credit card is denied, but can be reattempted with valid credit card or other payment method
  const isCreditCardPreviouslyDenied =
    transaction.payment.status === 'FAILED' &&
    transaction.payment.method === 'CREDIT_CARD';

  if (isCreditCardPreviouslyDenied) {
    // As long as the transaction is still within the expired time, it can be reattempted
    isPaymentStillValid = new Date() < transaction.payment.expiredAt;
  }

  if (!isPaymentStillValid) {
    logger.warn(`Transaction ${orderId} has already been processed`);
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

  /**
   * Refactored logic for handling midtrans notification. Reference:
   * https://docs.midtrans.com/docs/https-notification-webhooks#example-on-handling-http-notifications
   */

  /**
   * TODO: Handle page expiry when user hasn't choose a payment method
   *
   * Currently, midtrans doesn't send a notification when the user hasn't choose
   * a payment method and the page expires.
   *
   * It can be handled by running a cron job to check the transaction status
   * that is still pending and the expired time has passed.
   *
   * If so, update the transaction status to 'FAILED' and make the flight seats
   * available again.
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

    const addNotificationAction = prisma.notification.create({
      data: {
        userId: transaction.userId,
        name: 'Notifikasi',
        description:
          `Pembayaran berhasil untuk tiket dengan kode ${transaction.code}. Dengan keberangkatan dari ${transaction.departureFlight.departureAirport.code} menuju ${transaction.departureFlight.destinationAirport.code}` +
          (transaction.returnFlight
            ? ` dan penerbangan kembali dari ${transaction.returnFlight?.departureAirport.code} menuju ${transaction.returnFlight?.destinationAirport.code}`
            : '')
      }
    });

    await prisma.$transaction([
      updateTransactionAction,
      updateFlightSeatsAction,
      addNotificationAction
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

    const addNotificationAction = prisma.notification.create({
      data: {
        userId: transaction.userId,
        name: 'Notifikasi',
        description:
          `Pembayaran gagal untuk tiket dengan kode ${transaction.code}. Dengan keberangkatan dari ${transaction.departureFlight.departureAirport.code} menuju ${transaction.departureFlight.destinationAirport.code}` +
          (transaction.returnFlight
            ? ` dan penerbangan kembali dari ${transaction.returnFlight?.departureAirport.code} menuju ${transaction.returnFlight?.destinationAirport.code}`
            : '')
      }
    });

    await prisma.$transaction([
      updateTransactionAction,
      updateFlightSeatsAction,
      addNotificationAction
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

/**
 * @param {string} transactionId
 * @returns {Promise<NotificationPayload>}
 */
export async function checkMidtransTransactionValidity(transactionId) {
  try {
    const validPayload = await midtrans.core.transaction.status(transactionId);
    return validPayload;
  } catch (err) {
    if (err instanceof midtrans.MidtransError) {
      if (err.ApiResponse && typeof err.ApiResponse === 'object') {
        throw new HttpError(parseInt(err.ApiResponse.status_code, 10), {
          message: err.ApiResponse.status_message
        });
      }
    }

    throw err;
  }
}

export const MidtransService = {
  manageMidtransNotification
};
