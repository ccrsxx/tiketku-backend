import cors from 'cors';
import { appEnv } from '../utils/env.js';
import { HttpError } from '../utils/error.js';

/** @import {Application,Request,Response,NextFunction} from 'express' */

const ALLOWED_ORIGINS = appEnv.VALID_ORIGINS.split(',');

if (!ALLOWED_ORIGINS.length) {
  throw new Error('No allowed origins provided');
}

/** @type {cors.CorsOptions} */
export const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
};

/** @type {cors.CorsOptions} */
export const corsOptionsWithOrigin = {
  ...corsOptions,
  origin: (origin, callback) => {
    const isOriginAllowed = origin && ALLOWED_ORIGINS.includes(origin);

    if (isOriginAllowed) callback(null, true);
    else callback(new HttpError(403, { message: 'Forbidden by CORS' }));
  }
};

const WHITELISTED_CORS_ORIGIN_PATHS = /** @type {const} */ (['/docs']);

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
function customCors(req, res, next) {
  const isWhitelistedCorsOriginPath = WHITELISTED_CORS_ORIGIN_PATHS.some(
    (path) => req.path.startsWith(path)
  );

  if (isWhitelistedCorsOriginPath) {
    return cors(corsOptions)(req, res, next);
  }

  return cors(corsOptionsWithOrigin)(req, res, next);
}

/** @param {Application} app */
export default (app) => {
  app.use(customCors);
};
