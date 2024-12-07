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
