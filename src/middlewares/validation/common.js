import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError } from '../../utils/validation.js';

/** @import {Request,Response,NextFunction} from 'express' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidParamsIdUuid(req, _res, next) {
  const validUuidSchema = z.string().uuid();

  const { error } = validUuidSchema.safeParse(req.params.id);

  if (error) {
    throw new HttpError(
      400,
      formatZodError(error, {
        preferSingleError: true
      })
    );
  }

  next();
}

const validEmailSchema = z.object({
  email: z.string().email()
});

/** @typedef {z.infer<typeof validEmailSchema>} ValidEmailPayload */

/**
 * @param {Request<unknown, unknown, ValidEmailPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidEmailPayload(req, _res, next) {
  const { error } = validEmailSchema.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

export const CommonValidationMiddleware = {
  isValidParamsIdUuid,
  isValidEmailPayload
};
