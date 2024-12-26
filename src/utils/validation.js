import { z } from 'zod';
import isMobilePhone from 'validator/lib/isMobilePhone.js';

/** @import {ZodError} from 'zod' */

export const validStringSchema = z.string().trim().min(1);

export const phoneNumberSchema = z
  .string()
  .trim()
  .refine((val) => isMobilePhone.default(val, 'id-ID', { strictMode: true }), {
    message: 'Invalid phone number'
  });

export const validPageCountSchema = z.coerce
  .number()
  .int()
  .positive()
  .default(1);

export const validCursorSchema = z.string().uuid();

const VALID_UTC_TIMEZONES = /** @type {const} */ ([
  'UTC-12',
  'UTC-11',
  'UTC-10',
  'UTC-9:30',
  'UTC-9',
  'UTC-8',
  'UTC-7',
  'UTC-6',
  'UTC-5',
  'UTC-4',
  'UTC-3:30',
  'UTC-3',
  'UTC-2',
  'UTC-1',
  'UTC+0',
  'UTC+1',
  'UTC+2',
  'UTC+3',
  'UTC+3:30',
  'UTC+4',
  'UTC+4:30',
  'UTC+5',
  'UTC+5:30',
  'UTC+5:45',
  'UTC+6',
  'UTC+6:30',
  'UTC+7',
  'UTC+8',
  'UTC+8:30',
  'UTC+8:45',
  'UTC+9',
  'UTC+9:30',
  'UTC+10',
  'UTC+10:30',
  'UTC+11',
  'UTC+12',
  'UTC+12:45',
  'UTC+13',
  'UTC+14'
]);

/** @typedef {(typeof VALID_UTC_TIMEZONES)[number]} ValidUtcTimezone */

export const validUtcTimezoneSchema = z.enum(VALID_UTC_TIMEZONES);

/**
 * @template {boolean} T
 * @typedef {{
 *   message: string;
 *   errors: T extends true ? undefined : string[];
 * }} FormattedZodError<T>
 */

/**
 * @template {boolean} T
 * @typedef {{ preferSingleError?: T; errorMessage?: string }} FormatZodErrorOptions
 */

/**
 * @template {boolean} [T=false] Default is `false`
 * @param {ZodError} error - The ZodError to format.
 * @param {FormatZodErrorOptions<T>} [formatZodErrorOptions]
 * @returns {FormattedZodError<T>} The formatted error.
 */
export function formatZodError(error, formatZodErrorOptions = {}) {
  const errors = error.errors.map(({ message, path }) => {
    const name = path.join('.');

    const result = name ? `${name} ${message}` : message;

    return result;
  });

  let parsedMessage = formatZodErrorOptions.errorMessage ?? 'Invalid body';

  /** @type {string[] | undefined} */
  let parsedErrors = errors;

  if (formatZodErrorOptions.preferSingleError) {
    parsedMessage = errors[0];
    parsedErrors = undefined;
  }

  return /** @type {FormattedZodError<T>} */ ({
    message: parsedMessage,
    errors: parsedErrors
  });
}
