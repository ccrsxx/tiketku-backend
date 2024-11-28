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

/**
 * @template {boolean} T
 * @typedef {{
 *   message: string;
 *   errors: T extends true ? undefined : string[];
 * }} FormattedZodError<T>
 */

/**
 * @template {boolean} T
 * @typedef {{ preferSingleError?: T }} FormatZodErrorOptions
 */

// TODO: Remove generic and detect if `preferSingleError` is `true` or `false` based on the type of `errors`
// TODO: It can be detected if zod schema is not an object, the path inside errors will be empty

/**
 * @template {boolean} [T=false] Default is `false`
 * @param {ZodError} error - The ZodError to format.
 * @param {FormatZodErrorOptions<T>} [formatZodErrorOptions]
 * @returns {FormattedZodError<T>} The formatted error.
 */
export function formatZodError(error, formatZodErrorOptions = {}) {
  const errors = error.errors.map(({ message, path: [name] }) =>
    name ? `${name} ${message}` : message
  );

  let parsedMessage = 'Invalid body';

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
