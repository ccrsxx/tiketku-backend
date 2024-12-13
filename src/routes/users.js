import { Router } from 'express';
import { UserController } from '../controllers/user.js';
import { AuthMiddleware } from '../middlewares/auth.js';
import { UserValidationMiddleware } from '../middlewares/validation/user.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/users', router);

  router.get('/me', AuthMiddleware.isAuthorized, UserController.getCurrentUser);

  router.patch(
    '/me',
    AuthMiddleware.isAuthorized,
    UserValidationMiddleware.isValidUserUpdatePayload,
    UserController.updateCurrentUser
  );
};
