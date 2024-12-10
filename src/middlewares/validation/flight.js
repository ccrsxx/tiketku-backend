import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError, validCursorSchema } from '../../utils/validation.js';
import { Continent } from '@prisma/client';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {ValidFlightDetailQueryParams} from '../../services/flight.js' */

const validFlightQueryParams = z.object({
  departureAirportId: z.string().uuid(),
  destinationAirportId: z.string().uuid(),
  departureDate: z.string().date(),
  nextCursor: validCursorSchema.optional()
});

/** @typedef {z.infer<typeof validFlightQueryParams>} ValidFlightQueryParams */

/**
 * @param {Request<unknown, unknown, unknown, ValidFlightQueryParams>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidFlightQueryParams(req, _res, next) {
  const { error } = validFlightQueryParams.safeParse(req.query);

  if (error) {
    throw new HttpError(
      400,
      formatZodError(error, {
        errorMessage: 'Invalid query params'
      })
    );
  }

  next();
}

const validFavoriteFlightQueryParams = z.object({
  continent: z.nativeEnum(Continent).optional(),
  nextCursor: validCursorSchema.optional()
});

/** @typedef {z.infer<typeof validFavoriteFlightQueryParams>} ValidFavoriteFlightQueryParams */

/**
 * @param {Request<
 *   unknown,
 *   unknown,
 *   unknown,
 *   ValidFavoriteFlightQueryParams
 * >} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidFavoriteFlightQueryParams(req, _res, next) {
  const { error } = validFavoriteFlightQueryParams.safeParse(req.query);

  if (error) {
    throw new HttpError(
      400,
      formatZodError(error, {
        errorMessage: 'Invalid query params'
      })
    );
  }

  next();
}

/**
 * @param {Request<
 *   { id: string },
 *   unknown,
 *   unknown,
 *   ValidFlightDetailQueryParams
 * >} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidFlightDetailQueryParams(req, _res, next) {
  const sameDestinationOnBothFlights =
    req.query.returnFlightId === req.params.id;

  if (sameDestinationOnBothFlights) {
    throw new HttpError(400, {
      message: 'Return flight must be different from the departure flight'
    });
  }

  next();
}

export const FlightValidationMiddleware = {
  isValidFlightQueryParams,
  isValidFavoriteFlightQueryParams,
  isValidFlightDetailQueryParams
};
