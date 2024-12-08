import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { TransactionController } from '../controllers/transaction.js';
import { TransactionValidationMiddleware } from '../middlewares/validation/transaction.js';
import { MidtransController } from '../controllers/midtrans.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/transactions', router);

  router.get(
    '/me',
    TransactionValidationMiddleware.isValidMyTransactionsQueryParams,
    AuthMiddleware.isAuthorized,
    TransactionController.getMyTransactions
  );

  router.post(
    '/',
    TransactionValidationMiddleware.isValidTransactionPayload,
    AuthMiddleware.isAuthorized,
    TransactionController.createTransaction
  );

  router.post('/notification', MidtransController.manageMidtransNotification);
};
