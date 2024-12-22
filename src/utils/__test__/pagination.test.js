import { generateOffsetPaginationMeta } from '../pagination.js';

/**
 * @typedef {Object} PaginationTestOptions
 * @property {number | null | undefined} page
 * @property {number} limit
 * @property {number} recordCount
 */

/** @typedef {Object} GeneratedOffsetPaginationMeta */
/** @typedef {Object} OffsetPaginationMeta */
/** @typedef {Object} GeneratedOffsetPaginationMeta */

describe('generateOffsetPaginationMeta', () => {
  /**
   * Helper function to generate pagination inputs
   *
   * @param {PaginationTestOptions} options
   * @returns {GeneratedOffsetPaginationMeta}
   */
  const generateTestMeta = ({ page, limit, recordCount }) => {
    return generateOffsetPaginationMeta({
      page,
      limit,
      recordCount
    });
  };

  it('should generate correct pagination meta with valid inputs', () => {
    const result = generateTestMeta({
      page: 2,
      limit: 10,
      recordCount: 25
    });

    expect(result).toEqual({
      limit: 10,
      offset: 10,
      offPageLimit: false,
      meta: {
        page: 2,
        limit: 10,
        pageCount: 3,
        recordCount: 25
      }
    });
  });

  it('should default to page 1 when page is null', () => {
    const result = generateTestMeta({
      page: null,
      limit: 10,
      recordCount: 25
    });

    expect(result.meta.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('should handle empty recordset', () => {
    const result = generateTestMeta({
      page: 1,
      limit: 10,
      recordCount: 0
    });

    expect(result).toEqual({
      limit: 10,
      offset: 0,
      offPageLimit: true,
      meta: {
        page: 1,
        limit: 10,
        pageCount: 0,
        recordCount: 0
      }
    });
  });

  it('should set offPageLimit true when page exceeds pageCount', () => {
    const result = generateTestMeta({
      page: 4,
      limit: 10,
      recordCount: 25
    });

    expect(result.offPageLimit).toBe(true);
  });

  it('should calculate correct offset for different pages', () => {
    const result = generateTestMeta({
      page: 3,
      limit: 5,
      recordCount: 25
    });

    expect(result.offset).toBe(10);
    expect(result.meta.pageCount).toBe(5);
  });
});
