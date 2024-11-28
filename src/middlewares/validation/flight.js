import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError, validStringSchema } from '../../utils/validation.js';
import { Continent } from '@prisma/client';

/** @import {Request,Response,NextFunction} from 'express' */

const validFlightQueryParams = z.object({
  departureAirportId: validStringSchema,
  destinationAirportId: validStringSchema,
  departureDate: validStringSchema,
  returnDate: validStringSchema.optional()
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
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

const validFavoriteFlightQueryParams = z.object({
  continent: z.nativeEnum(Continent).optional()
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
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

export const FlightValidationMiddleware = {
  isValidFlightQueryParams,
  isValidFavoriteFlightQueryParams
};
