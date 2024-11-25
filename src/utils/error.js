/**
 * @typedef {Object} HttpErrorOptions
 * @property {string} message
 * @property {string[]} [errors]
 */

export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {HttpErrorOptions} options
   */
  constructor(statusCode, { message, errors }) {
    super(message);
    this.errors = errors;
    this.statusCode = statusCode;
  }
}
