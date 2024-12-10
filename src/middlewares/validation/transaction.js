/** @import {Request,Response,NextFunction} from 'express' */

import { z } from 'zod';
import { HttpError } from '../../utils/error.js';
import { PassengerType } from '@prisma/client';
import {
  formatZodError,
  validStringSchema,
  validPageCountSchema
} from '../../utils/validation.js';
import { toTitleCase } from '../../utils/helper.js';

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

const validTransactionPayload = z.object({
  departureFlightId: z.string().uuid(),
  returnFlightId: z.string().uuid().optional(),
  passengers: z.array(ValidPassengerPayload)
});

/** @typedef {z.infer<typeof ValidPassengerPayload>} ValidPassengerPayload */

/** @typedef {z.infer<typeof validFlightSeatPayload>} ValidFlightSeatPayload */

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

    /** @type {ValidFlightSeatPayload[]} */
    const parsedFlightSeats = [];

    for (const { returnFlightSeat, departureFlightSeat } of data.passengers) {
      /** @type {ValidTransactionPayload['passengers'][0]['departureFlightSeat']} */
      const flightSeat =
        flightType === 'departure' ? departureFlightSeat : returnFlightSeat;

      if (!flightSeat) continue;

      const flightSeatExists = parsedFlightSeats.find(
        ({ row, column }) =>
          row === flightSeat.row && column === flightSeat.column
      );

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

const validMyTransactionsQueryParams = z
  .object({
    bookingCode: z.string().trim().length(6).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    page: validPageCountSchema.optional()
  })
  .refine(
    ({ startDate, endDate }) => {
      if (!startDate || !endDate) return true;

      return startDate < endDate;
    },
    {
      message: 'Start date must be before end date'
    }
  );

/** @typedef {z.infer<typeof validMyTransactionsQueryParams>} ValidMyTransactionsQueryParams */

/**
 * @param {Request<
 *   unknown,
 *   unknown,
 *   unknown,
 *   ValidMyTransactionsQueryParams
 * >} req
 * @param {Response} _res
 * @param {NextFunction} next
 */
function isValidMyTransactionsQueryParams(req, _res, next) {
  const { error } = validMyTransactionsQueryParams.safeParse(req.query);

  if (error) {
    throw new HttpError(
      400,
      formatZodError(error, { errorMessage: 'Invalid query params' })
    );
  }

  next();
}

export const TransactionValidationMiddleware = {
  isValidTransactionPayload,
  isValidMyTransactionsQueryParams
};
