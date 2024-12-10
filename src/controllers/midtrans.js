import { MidtransService } from '../services/midtrans.js';

/** @import {Request,Response} from 'express' */
/** @import {NotificationPayload} from 'midtrans-client' */

/**
 * @param {Request<unknown, unknown, NotificationPayload>} req
 * @param {Response} res
 */
async function manageMidtransNotification(req, res) {
  await MidtransService.manageMidtransNotification(req.body);

  res
    .status(200)
    .json({ message: 'Midtrans notification successfully handled' });
}

export const MidtransController = {
  manageMidtransNotification
};
