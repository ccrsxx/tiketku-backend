import { HttpError } from '../utils/error.js';
import { logger } from '../loaders/pino.js';

/** @import {Application,Request,Response,NextFunction, RequestHandler} from 'express' */
/** @import {ResponseWithSentry} from '../utils/types/sentry.js' */

/** @param {Application} app */
export default (app) => {
  app.use(notFound);
  app.use(errorHandler);
};

/**
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
export function notFound(req, _res, next) {
  const notFoundError = new HttpError(
    404,
    `Route not found - ${req.originalUrl}`
  );

  next(notFoundError);
}

/**
 * @param {Error} err
 * @param {Request} _req
 * @param {ResponseWithSentry} res
 * @param {NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    logger.info(err, 'Expected error handler');
    res.status(err.statusCode).json({ error: { message: err.message } });
    return;
  }

  if (err instanceof Error) {
    logger.error(err, 'Unexpected error handler');
    res.status(500).json({ error: { message: err.message } });
    return;
  }

  logger.error(err, 'Unknown error handler');
  res.status(500).json({ error: { message: 'Internal server error' } });
}
