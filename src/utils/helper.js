import { randomBytes, randomInt } from 'crypto';
import { validPageCountSchema } from './validation.js';

/** @returns {string} */
export function generateRandomToken(size = 12) {
  return randomBytes(size).toString('base64url');
}

/** @returns {string} */
export function generateRandomOTP() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} pageCount
 * @property {number} recordCount
 */

/**
 * @typedef {Object} GeneratedPaginationMeta
 * @property {number} limit
 * @property {number} offset
 * @property {boolean} offPageLimit
 * @property {PaginationMeta} meta
 */

/**
 * @typedef {Object} PaginationMetaOptions
 * @property {number | null | undefined} page
 * @property {number} limit
 * @property {number} recordCount
 */

/**
 * @param {PaginationMetaOptions} options
 * @returns {GeneratedPaginationMeta}
 */
export function generatePaginationMeta({ page, limit, recordCount }) {
  const parsedPage = validPageCountSchema.safeParse(page).data ?? 1;

  const pageCount = Math.ceil(recordCount / limit);

  const offset = (parsedPage - 1) * limit;

  const offPageLimit = parsedPage > pageCount;

  return {
    limit,
    offset,
    offPageLimit,
    meta: {
      page: parsedPage,
      limit,
      pageCount,
      recordCount
    }
  };
}
