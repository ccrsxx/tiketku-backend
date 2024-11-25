import Joi from 'joi';
import { HttpError } from '../../utils/error.js';

/** @import {Request,Response,NextFunction} from 'express' */

/**
 * @typedef {Object} ValidLoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidLoginPayload(req, _res, next) {
  /** @type {Joi.ObjectSchema<ValidLoginPayload>} */
  const validLoginPayload = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  }).required();

  const { error } = validLoginPayload.validate(req.body);

  if (error) {
    throw new HttpError(400, error.message);
  }

  next();
}

/**
 * @typedef {Object} ValidResetPasswordPayload
 * @property {string} token
 * @property {string} password
 */

/**
 * @param {Request<unknown, unknown, ValidResetPasswordPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidResetPasswordPayload(req, _res, next) {
  /** @type {Joi.ObjectSchema<ValidResetPasswordPayload>} */
  const validResetPasswordPayload = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required()
  }).required();

  const { error } = validResetPasswordPayload.validate(req.body);

  if (error) {
    throw new HttpError(400, error.message);
  }

  next();
}

/**
 * @param {Request<{ token: string }>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidTokenParams(req, _res, next) {
  const validTokenSchema = Joi.string().required();

  const { error } = validTokenSchema.validate(req.params.token);

  if (error) {
    throw new HttpError(400, error.message);
  }

  next();
}

export const AuthValidationMiddleware = {
  isValidLoginPayload,
  isValidResetPasswordPayload,
  isValidTokenParams
};
