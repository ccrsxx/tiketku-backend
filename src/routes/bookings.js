import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { TransactionController } from '../controllers/transaction.js';
import { TransactionValidationMiddleware } from '../middlewares/validation/transaction.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/bookings', router);

  router.get(
    '/me',
    AuthMiddleware.isAuthorized,
    TransactionController.getMyTransaction
  );

  router.post(
    '/',
    TransactionValidationMiddleware.isValidTransactionPayload,
    AuthMiddleware.isAuthorized,
    TransactionController.createTransaction
  );
};
