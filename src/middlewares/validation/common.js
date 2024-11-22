import Joi from 'joi';
import { HttpError } from '../../utils/error.js';

/** @import {Request,Response,NextFunction} from 'express' */

/** @typedef {{ email: string }} ValidEmailPayload */

export class CommonValidationMiddleware {
  /**
   * @param {Request<{ id: string }>} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  static isValidParamsIdUuid(req, _res, next) {
    const validUserId = Joi.string().uuid().required();

    const { error } = validUserId.validate(req.params.id);

    if (error) {
      throw new HttpError(400, error.message);
    }

    next();
  }

  /**
   * @param {Request<unknown, unknown, ValidEmailPayload>} req
   * @param {Response} _res
   * @param {NextFunction} next
   */
  static isValidEmail(req, _res, next) {
    const validEmailSchema = Joi.object({
      email: Joi.string().email().required()
    }).required();

    const { error } = validEmailSchema.validate(req.body);

    if (error) {
      throw new HttpError(400, error.message);
    }

    next();
  }
}
