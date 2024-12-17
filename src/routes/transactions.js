import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { TransactionController } from '../controllers/transaction.js';
import { TransactionValidationMiddleware } from '../middlewares/validation/transaction.js';
import { MidtransController } from '../controllers/midtrans.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/transactions', router);

  router.get(
    '/me',
    AuthMiddleware.isAuthorized,
    TransactionController.getMyTransactions
  );

  router.post(
    '/',
    TransactionValidationMiddleware.isValidTransactionPayload,
    AuthMiddleware.isAuthorized,
    TransactionController.createTransaction
  );

  router.get(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    AuthMiddleware.isAuthorized,
    TransactionController.getTransaction
  );

  router.post(
    '/:id/cancel',
    CommonValidationMiddleware.isValidParamsIdUuid,
    AuthMiddleware.isAuthorized,
    TransactionController.cancelTransaction
  );

  router.post(
    '/:id/print',
    CommonValidationMiddleware.isValidParamsIdUuid,
    AuthMiddleware.isAuthorized,
    TransactionController.sendTransactionTicketEmail
  );

  router.post('/notification', MidtransController.manageMidtransNotification);
};
