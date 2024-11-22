import { HttpError } from '../../../utils/error.js';
import {
  getFunctionThrownError,
  setupExpressMock
} from '../../../utils/jest.js';

/**
 * @typedef {{
 *   UserValidationMiddleware: Record<
 *     keyof import('../user.js')['UserValidationMiddleware'],
 *     jest.Mock
 *   >;
 * }} UserValidationMiddlewareMock
 */

const { UserValidationMiddleware } =
  /** @type {UserValidationMiddlewareMock} */ (
    /** @type {unknown} */ (await import('../user.js'))
  );

describe('User validation middleware', () => {
  describe('Is valid params user id', () => {
    it('should call next() if the params id is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          params: {
            id: '4370e6f4-fdc1-47e4-917b-fa56d83f94c5'
          }
        }
      });

      UserValidationMiddleware.isValidParamsUserId(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 400 http error if the params id is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          params: {
            id: 'invalid'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        UserValidationMiddleware.isValidParamsUserId(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', '"value" must be a valid GUID');

      expect(next).not.toHaveBeenCalled();
    });
  });
});
