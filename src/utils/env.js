import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../loaders/pino.js';
import { access } from 'fs/promises';
import { validStringSchema } from './validation.js';

const envSchema = z.object({
  PORT: validStringSchema,
  SENTRY_DSN: validStringSchema,
  JWT_SECRET: validStringSchema,
  DIRECT_URL: validStringSchema,
  DATABASE_URL: validStringSchema,
  FRONTEND_URL: validStringSchema,
  EMAIL_ADDRESS: validStringSchema,
  EMAIL_API_KEY: validStringSchema,
  IMAGEKIT_PUBLIC_KEY: validStringSchema,
  IMAGEKIT_PRIVATE_KEY: validStringSchema,
  IMAGEKIT_URL_ENDPOINT: validStringSchema
});

/** @typedef {z.infer<typeof envSchema>} EnvSchema */

/** @returns {EnvSchema} */
function validateEnv() {
  const PORT = process.env.PORT ?? process.env.HOST_PORT;

  const mergedEnv = {
    ...process.env,
    PORT
  };

  let { data, error } = envSchema.safeParse(mergedEnv);

  const runningOnCi = process.env.CI === 'true';

  if (runningOnCi) {
    data = /** @type {EnvSchema} */ (process.env);
  }

  const shouldThrowError = error && !runningOnCi;

  if (shouldThrowError) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return /** @type {EnvSchema} */ (data);
}

async function loadEnv() {
  const isRunningInDevelopment = process.env.NODE_ENV === 'development';

  let envPath = undefined;

  if (isRunningInDevelopment) {
    const isLocalEnvExists = await access('.env.local')
      .then(() => true)
      .catch(() => false);

    if (!isLocalEnvExists) {
      throw new Error('Local environment file (.env.local) is missing');
    }

    envPath = '.env.local';

    logger.info(`Loading environment variables from ${envPath}`);
  } else {
    logger.info('Loading environment variables from .env or process.env');
  }

  dotenv.config({ path: envPath });
}

await loadEnv();

export const appEnv = validateEnv();
