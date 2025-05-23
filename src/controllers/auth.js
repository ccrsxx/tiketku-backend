import { UserService } from '../services/user.js';
import { AuthService } from '../services/auth.js';
import { OtpService } from '../services/otp.js';

/** @import {Request,Response} from 'express' */
/** @import {User} from '@prisma/client' */
/** @import {ValidOtpPayload} from '../middlewares/validation/otp.js' */
/** @import {ValidCreateUserPayload} from '../middlewares/validation/user.js' */
/** @import {ValidEmailPayload} from '../middlewares/validation/common.js' */
/** @import {ValidResetPasswordPayload} from '../middlewares/validation/auth.js' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} res
 */
async function login(req, res) {
  const userWithToken = await AuthService.login(req.body);

  res.status(200).json({ data: userWithToken });
}

/**
 * @param {Request<unknown, unknown, ValidCreateUserPayload>} req
 * @param {Response} res
 */
async function register(req, res) {
  await UserService.createUser(req.body);

  res.status(200).json({
    data: { message: 'Register success, waiting for OTP verification' }
  });
}

/**
 * @param {Request<unknown, unknown, ValidEmailPayload>} req
 * @param {Response} res
 */
async function sendPasswordResetEmail(req, res) {
  await AuthService.sendPasswordResetEmail(req.body.email);

  res
    .status(200)
    .json({ message: 'Password reset email sent if email exists' });
}

/**
 * @param {Request<unknown, unknown, ValidResetPasswordPayload>} req
 * @param {Response} res
 */
async function resetPassword(req, res) {
  await AuthService.resetPassword(req.body);

  res.status(200).json({ message: 'Password reset successful' });
}

/**
 * @param {Request<{ token: string }>} req
 * @param {Response} res
 */
async function verifyPasswordResetToken(req, res) {
  await AuthService.verifyPasswordResetToken(req.params.token);

  res.status(200).json({ message: 'Password reset token is valid' });
}

/**
 * @param {Request<unknown, unknown, ValidEmailPayload>} _req
 * @param {Response<unknown, { user: User }>} res
 */
async function sendUserVerificationOtp(_req, res) {
  const { id: userId, name, email } = res.locals.user;

  await OtpService.sendUserVerificationOtp(name, email, userId);

  res.status(201).json({ message: 'OTP sent successfully' });
}

/**
 * @param {Request<unknown, unknown, ValidOtpPayload>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function verifyUserVerificationOtp(req, res) {
  const payload = req.body;

  await OtpService.verifyUserVerificationOtp(payload);

  res.status(200).json({ message: 'OTP verified successfully' });
}

export const AuthController = {
  login,
  register,
  sendPasswordResetEmail,
  resetPassword,
  verifyPasswordResetToken,
  sendUserVerificationOtp,
  verifyUserVerificationOtp
};
