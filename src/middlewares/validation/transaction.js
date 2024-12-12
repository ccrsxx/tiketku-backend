/** @import {Request,Response,NextFunction} from 'express' */

import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { PassengerType } from '@prisma/client';
import { formatZodError, validStringSchema } from '../../utils/validation.js';
import { toTitleCase } from '../../utils/helper.js';

const ValidPassengerPayload = z
  .object({
    type: z.nativeEnum(PassengerType),
    name: validStringSchema,
    birthDate: z.string().date(),
    familyName: validStringSchema.optional(),
    identityNumber: validStringSchema,
    identityNationality: validStringSchema,
    identityExpirationDate: z.string().date(),
    departureFlightSeatId: z.string().uuid().optional(),
    returnFlightSeatId: z.string().uuid().optional()
  })
  .refine(
    ({ type, departureFlightSeatId }) =>
      type === 'INFANT' ? true : Boolean(departureFlightSeatId),
    {
      message: 'Departure flight seat is required for adults and children'
    }
  );

const validTransactionPayload = z.object({
  departureFlightId: z.string().uuid(),
  returnFlightId: z.string().uuid().optional(),
  passengers: z.array(ValidPassengerPayload)
});

/** @typedef {z.infer<typeof ValidPassengerPayload>} ValidPassengerPayload */

/** @typedef {z.infer<typeof validTransactionPayload>} ValidTransactionPayload */

/**
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidTransactionPayload(req, _res, next) {
  const { data, error } = validTransactionPayload.safeParse(req.body);

  if (error) {
    throw new HttpError(400, formatZodError(error));
  }

  const isFlightIdsDuplicate = data.departureFlightId === data.returnFlightId;

  if (isFlightIdsDuplicate) {
    throw new HttpError(400, {
      message: 'Departure and return flights must be different'
    });
  }

  // Check duplicate flight seats
  for (const flightType of /** @type {const} */ (['departure', 'return'])) {
    const formattedFlightType = toTitleCase(flightType);

    /** @type {string[]} */
    const parsedFlightSeats = [];

    for (const {
      returnFlightSeatId,
      departureFlightSeatId
    } of data.passengers) {
      const flightSeat =
        flightType === 'departure' ? departureFlightSeatId : returnFlightSeatId;

      if (!flightSeat) continue;

      const flightSeatExists = parsedFlightSeats.includes(flightSeat);

      if (flightSeatExists) {
        throw new HttpError(400, {
          message: `${formattedFlightType} flight seat must be unique between passengers`
        });
      }

      parsedFlightSeats.push(flightSeat);
    }

    let validFlightSeats = true;

    const needToCheckReturnFlightSeats =
      flightType === 'return' && data.returnFlightId;

    const checkFlightSeats =
      flightType === 'departure' || needToCheckReturnFlightSeats;

    if (checkFlightSeats) {
      validFlightSeats = Boolean(parsedFlightSeats.length);
    }

    if (!validFlightSeats) {
      throw new HttpError(400, {
        message: `${formattedFlightType} flight must have at least one seat`
      });
    }
  }

  next();
}

export const TransactionValidationMiddleware = {
  isValidTransactionPayload
};
