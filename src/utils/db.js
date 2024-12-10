import { PrismaClient } from '@prisma/client';
import { appEnv } from './env.js';

/** @import {Prisma} from '@prisma/client' */
/** @import {ModelName} from './types/prisma.js' */

const omittedTimestampFields = /** @type {const} */ ({
  createdAt: true,
  updatedAt: true
});

/** @satisfies {Prisma.GlobalOmitConfig} */
const omitConfig = {
  user: {
    ...omittedTimestampFields,
    password: true
  },
  otp: omittedTimestampFields,
  flight: {
    ...omittedTimestampFields,
    airlineId: true,
    airplaneId: true,
    departureAirportId: true,
    destinationAirportId: true
  },
  airline: omittedTimestampFields,
  airport: omittedTimestampFields,
  booking: {
    ...omittedTimestampFields,
    passengerId: true,
    transactionId: true,
    returnFlightSeatId: true,
    departureFlightSeatId: true
  },
  payment: omittedTimestampFields,
  airplane: omittedTimestampFields,
  passenger: {
    ...omittedTimestampFields,
    birthDate: true,
    familyName: true,
    identityNumber: true,
    identityNationality: true,
    identityExpirationDate: true
  },
  flightSeat: {
    ...omittedTimestampFields,
    flightId: true
  },
  transaction: {
    ...omittedTimestampFields,
    userId: true,
    paymentId: true,
    returnFlightId: true,
    departureFlightId: true
  },
  notification: omittedTimestampFields,
  passwordReset: omittedTimestampFields
};

export const prisma = new PrismaClient({
  datasourceUrl: appEnv.DATABASE_URL,
  omit: omitConfig
});

/** @typedef {typeof prisma} GeneratedPrismaClient */

/**
 * @template {ModelName} Model
 * @typedef {NonNullable<
 *   Awaited<ReturnType<GeneratedPrismaClient[Model]['findUnique']>>
 * >} OmittedModel
 */
