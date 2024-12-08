import { TransactionService } from '../services/transaction.js';

/** @import {User} from '@prisma/client' */
/** @import {Request,Response} from 'express' */
/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidTransactionPayload,ValidMyTransactionsQueryParams} from '../middlewares/validation/transaction.js' */

/**
 * @param {Request<unknown, unknown, ValidTransactionPayload>} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 */
async function createTransaction(req, res) {
  const transaction = await TransactionService.createTransaction(
    res.locals.user,
    req.body
  );

  res.status(201).json({ data: transaction });
}

/**
 * @param {Request<
 *   unknown,
 *   unknown,
 *   unknown,
 *   ValidMyTransactionsQueryParams
 * >} req
 * @param {Response<unknown, { user: User }>} res
 */
async function getMyTransactions(req, res) {
  const { meta, transactions } = await TransactionService.getMyTransactions(
    res.locals.user.id,
    req.query
  );

  res.status(200).json({ meta, data: transactions });
}

export const TransactionController = {
  getMyTransactions,
  createTransaction
};
