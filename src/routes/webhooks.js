import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.js';
import { AuthMiddleware } from '../middlewares/auth.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/webhooks', router);

  router.post('/midtrans', WebhookController.manageMidtransNotification);

  router.post(
    '/invalidate-pending-transactions',
    AuthMiddleware.isWebhookAuthorized,
    WebhookController.invalidatePendingTransactions
  );
};
