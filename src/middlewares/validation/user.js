import { z } from 'zod';
import {
  formatZodError,
  phoneNumberSchema,
  validStringSchema
} from '../../utils/validation.js';
import { prisma } from '../../utils/db.js';
import { HttpError } from '../../utils/error.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {OmittedModel} from '../../utils/db.js' */
/** @import {ValidEmailPayload} from './common.js' */

const validCreateUserPayload = z.object({
  name: validStringSchema,
  email: z.string().email(),
  password: z.string().trim().min(8),
  phoneNumber: phoneNumberSchema
});

/** @typedef {z.infer<typeof validCreateUserPayload>} ValidCreateUserPayload */

/**
 * @param {Request<unknown, ValidCreateUserPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidUserCreatePayload(req, _res, next) {
  const { error } = validCreateUserPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

const validUpdateUserPayload = z.object({
  name: validStringSchema,
  image: z.string().url().optional(),
  phoneNumber: phoneNumberSchema
});

/** @typedef {z.infer<typeof validUpdateUserPayload>} ValidUpdateUserPayload */

/**
 * @param {Request<unknown, ValidCreateUserPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidUserUpdatePayload(req, _res, next) {
  const { error } = validUpdateUserPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

/**
 * @param {Request<unknown, ValidEmailPayload>} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 * @param {NextFunction} next
 */
export async function isUnverifiedUserExistsPayload(req, res, next) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, verified: false }
  });

  if (!user) {
    throw new HttpError(404, { message: 'User not found' });
  }

  res.locals.user = user;

  next();
}

export const UserValidationMiddleware = {
  isValidUserCreatePayload,
  isValidUserUpdatePayload,
  isUnverifiedUserExistsPayload
};
