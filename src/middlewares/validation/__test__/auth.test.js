import { HttpError } from '../../../utils/error.js';
import {
  getFunctionThrownError,
  setupExpressMock
} from '../../../utils/jest.js';

/**
 * @typedef {{
 *   AuthValidationMiddleware: Record<
 *     keyof import('../auth.js')['AuthValidationMiddleware'],
 *     jest.Mock
 *   >;
 * }} AuthValidationMiddlewareMock
 */

const { AuthValidationMiddleware } =
  /** @type {AuthValidationMiddlewareMock} */ (
    /** @type {unknown} */ (await import('../auth.js'))
  );

describe('User validation middleware', () => {
  describe('Is valid user payload', () => {
    it('should call next() if the payload is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            email: 'email@test.com',
            password: 'valid-password'
          }
        }
      });

      AuthValidationMiddleware.isValidLoginPayload(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 400 http error if the payload is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            email: 'invalid email',
            password: 'short'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        AuthValidationMiddleware.isValidLoginPayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', '"email" must be a valid email');

      expect(next).not.toHaveBeenCalled();
    });
  });
});
