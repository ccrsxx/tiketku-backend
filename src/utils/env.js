import Joi from 'joi';
import dotenv from 'dotenv';
import { logger } from '../loaders/pino.js';
import { access } from 'fs/promises';
import { validStringSchema } from './validation.js';

/**
 * @typedef {Object} EnvSchema
 * @property {string} PORT - The port for the application.
 * @property {string} JWT_SECRET - The secret for the JWT token.
 * @property {string} SENTRY_DSN - The DSN for the Sentry service.
 * @property {string} DATABASE_URL - The URL for the database connection.
 * @property {string} FRONTEND_URL - The URL for the frontend application.
 * @property {string} EMAIL_ADDRESS - The email address for the email service.
 * @property {string} EMAIL_API_KEY - The API key for the email service.
 * @property {string} IMAGEKIT_PUBLIC_KEY - The public key for the ImageKit.
 * @property {string} IMAGEKIT_PRIVATE_KEY - The private key for the ImageKit.
 * @property {string} IMAGEKIT_URL_ENDPOINT - The URL endpoint for the ImageKit.
 */

/** @type {Joi.ObjectSchema<EnvSchema>} */
export const envSchema = Joi.object({
  PORT: validStringSchema.required(),
  SENTRY_DSN: validStringSchema.required(),
  JWT_SECRET: validStringSchema.required(),
  DATABASE_URL: validStringSchema.required(),
  FRONTEND_URL: validStringSchema.required(),
  EMAIL_ADDRESS: validStringSchema.required(),
  EMAIL_API_KEY: validStringSchema.required(),
  IMAGEKIT_PUBLIC_KEY: validStringSchema.required(),
  IMAGEKIT_PRIVATE_KEY: validStringSchema.required(),
  IMAGEKIT_URL_ENDPOINT: validStringSchema.required()
})
  .options({ stripUnknown: true })
  .required();

/** @returns {EnvSchema} */
function validateEnv() {
  const PORT = process.env.PORT ?? process.env.HOST_PORT;

  const mergedEnv = {
    ...process.env,
    PORT
  };

  const { value, error } = envSchema.validate(mergedEnv);

  const shouldThrowError = error && process.env.CI !== 'true';

  if (shouldThrowError) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return value;
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
