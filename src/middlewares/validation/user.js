import Joi from 'joi';
import { validStringSchema } from '../../utils/validation.js';
import { HttpError } from '../../utils/error.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {Prisma} from '@prisma/client' */

/** @typedef {Prisma.UserCreateInput} ValidUserPayload */

export class UserValidationMiddleware {
  /**
   * @param {Request<unknown, ValidUserPayload>} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  static isValidUserCreatePayload(req, _res, next) {
    /** @type {Joi.ObjectSchema<ValidUserPayload>} */
    const validUserPayload = Joi.object({
      name: validStringSchema.required(),
      email: Joi.string().email().required(),
      address: validStringSchema.required(),
      password: validStringSchema.min(8).required(),
      identityType: validStringSchema.required(),
      identityNumber: validStringSchema.required()
    }).required();

    const { error } = validUserPayload.validate(req.body);

    if (error) {
      throw new HttpError(400, error.message);
    }

    next();
  }

  /**
   * @param {Request<unknown, ValidUserPayload>} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  static isValidUserUpdatePayload(req, _res, next) {
    /** @type {Joi.ObjectSchema<ValidUserPayload>} */
    const validProfilePayload = Joi.object({
      image: Joi.string().uri(),
      address: validStringSchema,
      identityType: validStringSchema,
      identityNumber: validStringSchema
    }).required();

    const body = req.body;

    const validPayload = body && Object.keys(body).length;

    if (!validPayload) {
      throw new HttpError(400, 'Profile payload is required');
    }

    const { error } = validProfilePayload.validate(req.body);

    if (error) {
      throw new HttpError(400, error.message);
    }

    next();
  }

  /**
   * @param {Request<{ id: string }>} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  static isValidParamsUserId(req, _res, next) {
    const validUserId = Joi.string().uuid().required();

    const { error } = validUserId.validate(req.params.id);

    if (error) {
      throw new HttpError(400, error.message);
    }

    next();
  }
}
