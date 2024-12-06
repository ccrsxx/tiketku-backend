import { Router } from 'express';
import { NotificationController } from '../controllers/notification.js';
import { AuthMiddleware } from '../middlewares/auth.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';
import { NotificationMiddleware } from '../middlewares/notification.js';

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

  router.post(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    AuthMiddleware.isAuthorized,
    NotificationMiddleware.isNotificationExists,
    NotificationController.readNotification
  );

  router.delete(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    AuthMiddleware.isAuthorized,
    NotificationMiddleware.isNotificationExists,
    NotificationController.deleteNotification
  );
};
