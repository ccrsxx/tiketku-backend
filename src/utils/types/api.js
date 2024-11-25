/**
 * @template [T=unknown] Default is `unknown`
 * @typedef {Object} SuccessResponse
 * @property {T} data
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message
 * @property {string[]} [errors]
 */

/** @typedef {SuccessResponse | ErrorResponse} ApiResponse */
