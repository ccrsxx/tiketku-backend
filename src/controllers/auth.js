import { UserService } from '../services/user.js';
import { AuthService } from '../services/auth.js';

/** @import {Request,Response} from 'express' */
/** @import {ValidResetPasswordPayload} from '../middlewares/validation/auth.js' */
/** @import {ValidUserPayload} from '../middlewares/validation/user.js' */
/** @import {ValidEmailPayload} from '../middlewares/validation/common.js' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} res
 */
async function login(req, res) {
  const userWithToken = await AuthService.login(req.body);

  res.status(200).json({ data: userWithToken });
}

/**
 * @param {Request<unknown, unknown, ValidUserPayload>} req
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

export const AuthController = {
  login,
  register,
  sendPasswordResetEmail,
  resetPassword,
  verifyPasswordResetToken
};
