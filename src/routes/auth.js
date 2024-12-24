import { Router } from 'express';
import { AuthController } from '../controllers/auth.js';
import { OtpValidationMiddleware } from '../middlewares/validation/otp.js';
import { UserValidationMiddleware } from '../middlewares/validation/user.js';
import { AuthValidationMiddleware } from '../middlewares/validation/auth.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/auth', router);

  router.post(
    '/register',
    UserValidationMiddleware.isValidUserCreatePayload,
    AuthController.register
  );

  router.post(
    '/login',
    AuthValidationMiddleware.isValidLoginPayload,
    AuthController.login
  );

  router.post(
    '/password-reset',
    CommonValidationMiddleware.isValidEmailPayload,
    AuthController.sendPasswordResetEmail
  );

  router.get(
    '/password-reset/:token',
    AuthValidationMiddleware.isValidTokenParams,
    AuthController.verifyPasswordResetToken
  );

  router.post(
    '/password-reset/confirm',
    AuthValidationMiddleware.isValidResetPasswordPayload,
    AuthController.resetPassword
  );

  router.post(
    '/otp',
    CommonValidationMiddleware.isValidEmailPayload,
    UserValidationMiddleware.isUnverifiedUserExistsPayload,
    AuthController.sendUserVerificationOtp
  );

  router.post(
    '/otp/verify',
    OtpValidationMiddleware.isValidOtpPayload,
    UserValidationMiddleware.isUnverifiedUserExistsPayload,
    AuthController.verifyUserVerificationOtp
  );
};
