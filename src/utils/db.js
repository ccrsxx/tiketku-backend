import { PrismaClient } from '@prisma/client';
import { appEnv } from './env.js';

const omittedTimestampFields = {
  createdAt: true,
  updatedAt: true
};

export const prisma = new PrismaClient({
  datasourceUrl: appEnv.DATABASE_URL,
  omit: {
    user: {
      password: true,
      ...omittedTimestampFields
    },
    otp: omittedTimestampFields,
    flight: omittedTimestampFields,
    airline: omittedTimestampFields,
    airport: omittedTimestampFields,
    booking: omittedTimestampFields,
    payment: omittedTimestampFields,
    airplane: omittedTimestampFields,
    passenger: omittedTimestampFields,
    flightSeat: omittedTimestampFields,
    transaction: omittedTimestampFields,
    notification: omittedTimestampFields,
    passwordReset: omittedTimestampFields
  }
});
