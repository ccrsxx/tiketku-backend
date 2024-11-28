import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { formatZodError, validStringSchema } from '../../utils/validation.js';
import { Continent } from '@prisma/client';

/** @import {Request,Response,NextFunction} from 'express' */

const validFlightPayload = z.object({
  departureAirportId: validStringSchema,
  destinationAirportId: validStringSchema,
  departureDate: validStringSchema,
  returnDate: validStringSchema.optional()
});

/** @typedef {z.infer<typeof validFlightPayload>} ValidFlightPayload */

/**
 * @param {Request<unknown, unknown, unknown, ValidFlightPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidFlightPayload(req, _res, next) {
  const { error } = validFlightPayload.safeParse(req.query);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

const validFavoriteFlightPayload = z.object({
  continent: z
    .enum([
      Continent.ASIA,
      Continent.EUROPE,
      Continent.AFRICA,
      Continent.AMERICA,
      Continent.AUSTRALIA
    ])
    .optional()
});

/** @typedef {z.infer<typeof validFavoriteFlightPayload>} ValidFavoriteFlightPayload */

/**
 * @param {Request<unknown, unknown, unknown, ValidFavoriteFlightPayload>} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidFavoriteFlightPayload(req, _res, next) {
  const { error } = validFavoriteFlightPayload.safeParse(req.query);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  next();
}

export const FlightValidationMiddleware = {
  isValidFlightPayload,
  isValidFavoriteFlightPayload
};
