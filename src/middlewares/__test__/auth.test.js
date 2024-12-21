import { jest } from '@jest/globals';
import { getFunctionThrownError } from '../../utils/jest.js';
import { HttpError } from '../../utils/error.js';
import { setupExpressMock } from '../../utils/jest.js';

/** @import {GeneratedPrismaMock} from '../../utils/jest.js' */

/**
 * @typedef {{
 *   AuthMiddleware: Record<
 *     keyof import('../auth.js')['AuthMiddleware'],
 *     jest.Mock
 *   >;
 * }} AuthMiddlewareMock
 */

/**
 * @typedef {{
 *   AuthService: Record<
 *     keyof import('../../services/auth.js')['AuthService'],
 *     jest.Mock
 *   >;
 * }} AuthServiceMock
 */

const oldAuthService = await import('../../services/auth.js');

jest.unstable_mockModule(
  '../../services/auth.js',
  () =>
    /** @type {AuthServiceMock} */ ({
      AuthService: {
        ...oldAuthService.AuthService,
        verifyToken: jest.fn(),
        getAuthorizationBearerToken: jest.fn(
          oldAuthService.AuthService.getAuthorizationBearerToken
        )
      }
    })
);

jest.unstable_mockModule('../../utils/env.js', () => ({
  appEnv: {
    WEBHOOK_SECRET: 'valid_webhook_token'
  }
}));

const { AuthMiddleware } = /** @type {AuthMiddlewareMock} */ (
  /** @type {unknown} */ (await import('../auth.js'))
);

const { AuthService } = /** @type {AuthServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/auth.js'))
);

describe('Auth middleware', () => {
  describe('isAuthorized', () => {
    it('should call next if token is valid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          get: jest.fn().mockReturnValue('Bearer token')
        }
      });

      const user = { id: '1', email: 'test@gmail.com' };

      AuthService.verifyToken.mockImplementationOnce(() => user);

      await AuthMiddleware.isAuthorized(req, res, next);

      expect(res.locals).toHaveProperty('user', user);
    });

    it('should throw a 401 http error if authorization is empty', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          get: jest.fn().mockReturnValue(undefined)
        }
      });

      const promise = AuthMiddleware.isAuthorized(req, res, next);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });

    it('should throw a 401 http error if authorization is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          get: jest.fn().mockReturnValue('Invalid token')
        }
      });

      const promise = AuthMiddleware.isAuthorized(req, res, next);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });
  });

  describe('isWebhookAuthorized', () => {
    it('should call next if webhook token is valid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          get: jest.fn().mockReturnValue('Bearer valid_webhook_token')
        }
      });

      await AuthMiddleware.isWebhookAuthorized(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw a 401 error if webhook token is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          get: jest.fn().mockReturnValue('Bearer invalid_token')
        }
      });

      const promise = AuthMiddleware.isWebhookAuthorized(req, res, next);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });
  });
});
