import { Router } from 'express';
import { NotificationController } from '../controllers/notification.js';
import { AuthMiddleware } from '../middlewares/auth.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/notifications', router);

  router.get(
    '/',
    AuthMiddleware.isAuthorized,
    NotificationController.getNotifications
  );

  router.post(
    '/read-all',
    AuthMiddleware.isAuthorized,
    NotificationController.readAllNotifications
  );

  router.put(
    '/:id',
    AuthMiddleware.isAuthorized,
    NotificationController.readNotification
  );

  router.delete(
    '/:id',
    AuthMiddleware.isAuthorized,
    NotificationController.deleteNotification
  );
};
