import { TransactionService } from '../services/transaction.js';

/** @import {User} from '@prisma/client' */
/** @import {Request,Response} from 'express' */
/** @import {OmittedModel} from '../utils/db.js' */
/** @import {ValidTransactionPayload} from '../middlewares/validation/transaction.js' */
/** @import {ValidMyTransactionsQueryParams} from '../services/transaction.js' */

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
 * @param {Request<{ id: string }>} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 */
async function getTransaction(req, res) {
  const transaction = await TransactionService.getTransaction(
    res.locals.user.id,
    req.params.id
  );

  res.status(200).json({ data: transaction });
}

/**
 * @param {Request<{ id: string }>} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 */
async function cancelTransaction(req, res) {
  await TransactionService.cancelTransaction(res.locals.user.id, req.params.id);

  res.status(200).json({ message: 'Transaction has been canceled' });
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

/**
 * @param {Request<{ id: string }>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function sendTransactionTicketEmail(req, res) {
  await TransactionService.sendTransactionTicket(
    res.locals.user.id,
    req.params.id
  );

  res
    .status(200)
    .json({ message: 'Transaction ticket email sent successfully' });
}

export const TransactionController = {
  getTransaction,
  getMyTransactions,
  createTransaction,
  cancelTransaction,
  sendTransactionTicketEmail
};
