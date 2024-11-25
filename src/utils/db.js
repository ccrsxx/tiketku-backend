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
    notification: omittedTimestampFields,
    passwordReset: omittedTimestampFields
  }
});

// @ts-expect-error
BigInt.prototype.toJSON = function () {
  return this.toString();
};
