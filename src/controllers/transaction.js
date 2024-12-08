import { TransactionService } from '../services/transaction.js';

/** @import {User} from '@prisma/client' */
/** @import {Request,Response} from 'express' */
/** @import {ValidTransactionPayload} from '../middlewares/validation/transaction.js' */

/**
 * @param {Request<unknown, unknown, ValidTransactionPayload>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function createTransaction(req, res) {
  const transaction = await TransactionService.createTransaction(
    res.locals.user.id,
    req.body
  );

  res.status(201).json({ data: transaction });
}

/**
 * @param {Request} _req
 * @param {Response<unknown, { user: User }>} res
 */
async function getMyTransaction(_req, res) {
  const bookings = await TransactionService.getMyTransaction(
    res.locals.user.id
  );

  res.status(200).json({ data: bookings });
}

export const TransactionController = {
  getMyTransaction,
  createTransaction
};
