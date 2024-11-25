import { OtpService } from '../services/otp.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {User} from '@prisma/client' */
/** @import {ValidEmailPayload} from '../middlewares/validation/common.js' */
/** @import {ValidOtpPayload} from '../middlewares/validation/otp.js' */

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

export const OtpController = {
  sendUserVerificationOtp,
  verifyUserVerificationOtp
};
