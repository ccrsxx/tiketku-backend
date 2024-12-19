import { WebhookMidtransService } from '../services/webhook/midtrans.js';
import { WebhookTransactionService } from '../services/webhook/transaction.js';

/** @import {Request,Response} from 'express' */
/** @import {NotificationPayload} from 'midtrans-client' */

/**
 * @param {Request<unknown, unknown, NotificationPayload>} req
 * @param {Response} res
 */
async function manageMidtransNotification(req, res) {
  await WebhookMidtransService.manageMidtransNotification(req.body);

  res
    .status(200)
    .json({ message: 'Midtrans notification successfully handled' });
}

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function invalidatePendingTransactions(_req, res) {
  await WebhookTransactionService.invalidatePendingTransactions();

  res.status(200).json({ message: 'Pending payments invalidated' });
}

export const WebhookController = {
  manageMidtransNotification,
  invalidatePendingTransactions
};
