import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError } from '../../utils/validation.js';

/** @import {Request,Response,NextFunction} from 'express' */

const validOtpPayload = z.object({
  otp: z.string(),
  email: z.string()
});

/** @typedef {z.infer<typeof validOtpPayload>} ValidOtpPayload */

/**
 * @param {Request<unknown, unknown, ValidOtpPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidOtpPayload(req, _res, next) {
  const { error } = validOtpPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

export const OtpValidationMiddleware = {
  isValidOtpPayload
};
