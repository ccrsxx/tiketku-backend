import { validPageCountSchema } from './validation.js';

export const MAX_OFFSET_LIMIT = 10;

export const MAX_CURSOR_LIMIT = 10;

/**
 * @typedef {Object} CursorPaginationMeta
 * @property {number} limit
 * @property {string} nextCursor
 */

/**
 * @typedef {Object} OffsetPaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} pageCount
 * @property {number} recordCount
 */

/**
 * @typedef {Object} GeneratedOffsetPaginationMeta
 * @property {number} limit
 * @property {number} offset
 * @property {boolean} offPageLimit
 * @property {OffsetPaginationMeta} meta
 */

/**
 * @typedef {Object} PaginationOffsetMetaOptions
 * @property {number | null | undefined} page
 * @property {number} limit
 * @property {number} recordCount
 */

/**
 * @param {PaginationOffsetMetaOptions} options
 * @returns {GeneratedOffsetPaginationMeta}
 */
export function generateOffsetPaginationMeta({ page, limit, recordCount }) {
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
