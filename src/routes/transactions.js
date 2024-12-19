import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { TransactionController } from '../controllers/transaction.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';
import { TransactionValidationMiddleware } from '../middlewares/validation/transaction.js';

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
};
