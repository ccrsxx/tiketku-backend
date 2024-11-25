import {
  getFunctionThrownError,
  setupExpressMock
} from '../../../utils/jest.js';
import { HttpError } from '../../../utils/error.js';

/**
 * @typedef {{
 *   CommonValidationMiddleware: Record<
 *     keyof import('../common.js')['CommonValidationMiddleware'],
 *     jest.Mock
 *   >;
 * }} CommonValidationMiddlewareMock
 */

const { CommonValidationMiddleware } =
  /** @type {CommonValidationMiddlewareMock} */ (
    /** @type {unknown} */ (await import('../common.js'))
  );

describe('Common validation middleware', () => {
  describe('Is valid params id uuid', () => {
    it('should call next() if the params id is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          params: {
            id: '4370e6f4-fdc1-47e4-917b-fa56d83f94c5'
          }
        }
      });

      CommonValidationMiddleware.isValidParamsIdUuid(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throws an http error if the params id is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          params: {
            id: 'invalid'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        CommonValidationMiddleware.isValidParamsIdUuid(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid uuid');
    });
  });
});
