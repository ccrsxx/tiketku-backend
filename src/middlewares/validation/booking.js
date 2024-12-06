/** @import {Request,Response,NextFunction} from 'express' */

import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { PassengerType } from '@prisma/client';
import { formatZodError, validStringSchema } from '../../utils/validation.js';

const validFlightSeatPayload = z.object({
  row: z.number().int().positive(),
  column: z.number().int().positive()
});

const ValidPassengerPayload = z
  .object({
    type: z.nativeEnum(PassengerType),
    name: validStringSchema,
    birthDate: z.string().date(),
    familyName: validStringSchema.optional(),
    identityNumber: validStringSchema,
    identityNationality: validStringSchema,
    identityExpirationDate: z.string().date(),
    departureFlightSeat: validFlightSeatPayload.optional(),
    returnFlightSeat: validFlightSeatPayload.optional()
  })
  .refine(
    ({ type, departureFlightSeat }) =>
      type === 'INFANT' ? true : Boolean(departureFlightSeat),
    {
      message: 'Departure flight seat is required for adults and children'
    }
  );

const validBookingPayload = z.object({
  departureFlightId: z.string().uuid(),
  returnFlightId: z.string().uuid().optional(),
  passengers: z.array(ValidPassengerPayload)
});

/** @typedef {z.infer<typeof validFlightSeatPayload>} ValidFlightSeatPayload */

/** @typedef {z.infer<typeof ValidPassengerPayload>} ValidPassengerPayload */

/** @typedef {z.infer<typeof validBookingPayload>} ValidBookingPayload */

/**
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidBookingPayload(req, _res, next) {
  const { data, error } = validBookingPayload.safeParse(req.body);

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
    /** @type {ValidFlightSeatPayload[]} */
    const parsedFlightSeats = [];

    for (const { returnFlightSeat, departureFlightSeat } of data.passengers) {
      /** @type {ValidBookingPayload['passengers'][0]['departureFlightSeat']} */
      const flightSeat =
        flightType === 'departure' ? departureFlightSeat : returnFlightSeat;

      if (!flightSeat) continue;

      const flightSeatExists = parsedFlightSeats.find(
        ({ row, column }) =>
          row === flightSeat.row && column === flightSeat.column
      );

      if (flightSeatExists) {
        throw new HttpError(400, {
          message: 'Flight seat must be unique between passengers'
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
        message: 'Departure and return flights must have at least one seat'
      });
    }
  }

  next();
}

export const BookingValidationMiddleware = {
  isValidBookingPayload
};
