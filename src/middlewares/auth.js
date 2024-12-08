import { AuthService } from '../services/auth.js';
import { HttpError } from '../utils/error.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {OmittedModel} from '../utils/db.js' */

/**
 * @param {Request<unknown, unknown, unknown, unknown>} req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 * @param {NextFunction} next
 */
async function isAuthorized(req, res, next) {
  const authorization = req.get('authorization');

  if (!authorization) {
    throw new HttpError(401, { message: 'Invalid token' });
  }

  const [type, token] = authorization.split(' ');

  if (type.toLocaleLowerCase() !== 'bearer') {
    throw new HttpError(401, { message: 'Invalid token' });
  }

  const user = await AuthService.verifyToken(token);

  res.locals.user = user;

  next();
}

export const AuthMiddleware = {
  isAuthorized
};
