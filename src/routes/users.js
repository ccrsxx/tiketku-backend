import { Router } from 'express';
import { UserController } from '../controllers/user.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';
import { AuthMiddleware } from '../middlewares/auth.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/users', router);

  router.get('/', UserController.getUsers);

  router.get('/me', AuthMiddleware.isAuthorized, UserController.getCurrentUser);

  router.post('/', AuthMiddleware.isAuthorized, UserController.createUser);

  router.put(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    UserController.updateUser
  );

  router.get(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    UserController.getUser
  );
};
