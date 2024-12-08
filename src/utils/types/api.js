/** @import {CursorPaginationMeta,OffsetPaginationMeta} from '../pagination.js' */

/**
 * @template [T=unknown] Default is `unknown`
 * @typedef {Object} SuccessResponse
 * @property {T | T[]} data
 * @property {CursorPaginationMeta | OffsetPaginationMeta} [meta]
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message
 * @property {string[]} [errors]
 */

/** @typedef {SuccessResponse | ErrorResponse} ApiResponse */
