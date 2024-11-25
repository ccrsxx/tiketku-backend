import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError, validStringSchema } from '../../utils/validation.js';

/** @import {Request,Response,NextFunction} from 'express' */

const validLoginPayload = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

/** @typedef {z.infer<typeof validLoginPayload>} ValidLoginPayload */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidLoginPayload(req, _res, next) {
  const { error } = validLoginPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

const validResetPasswordPayload = z.object({
  token: z.string(),
  password: z.string().min(8)
});

/** @typedef {z.infer<typeof validResetPasswordPayload>} ValidResetPasswordPayload */

/**
 * @param {Request<unknown, unknown, ValidResetPasswordPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidResetPasswordPayload(req, _res, next) {
  const { error } = validResetPasswordPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

/**
 * @param {Request<{ token: string }>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidTokenParams(req, _res, next) {
  const { error } = validStringSchema.safeParse(req.params.token);

  if (error) {
    throw new HttpError(
      400,
      formatZodError(error, { preferSingleError: true })
    );
  }

  next();
}

export const AuthValidationMiddleware = {
  isValidLoginPayload,
  isValidResetPasswordPayload,
  isValidTokenParams
};
