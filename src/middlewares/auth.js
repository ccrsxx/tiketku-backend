import { appEnv } from '../utils/env.js';
import { HttpError } from '../utils/error.js';
import { AuthService } from '../services/auth.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {OmittedModel} from '../utils/db.js' */

/**
 * @param {Request} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 * @param {NextFunction} next
 */
async function isAuthorized(req, res, next) {
  const token = AuthService.getAuthorizationBearerToken(req);

  const user = await AuthService.verifyToken(token);

  res.locals.user = user;

  next();
}

/**
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
async function isWebhookAuthorized(req, _res, next) {
  const token = AuthService.getAuthorizationBearerToken(req);

  const validWebhookSecret = appEnv.WEBHOOK_SECRET === token;

  if (!validWebhookSecret) {
    throw new HttpError(401, { message: 'Invalid token' });
  }

  next();
}

export const AuthMiddleware = {
  isAuthorized,
  isWebhookAuthorized
};
