import {
  getFunctionThrownError,
  setupExpressMock
} from '../../../utils/jest.js';
import { HttpError } from '../../../utils/error.js';
import { prisma } from '../../../utils/db.js';
import { jest } from '@jest/globals';

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

describe('User Validation Middleware', () => {
  describe('isValidUserCreatePayload', () => {
    it('should call next() if the user create payload is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            name: 'John Doe',
            email: 'newuser@mail.com',
            password: 'password123',
            phoneNumber: '+6281234567890'
          }
        }
      });

      UserValidationMiddleware.isValidUserCreatePayload(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw an HttpError if the user create payload is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            name: '',
            email: 'invalid-email',
            password: 'short',
            phoneNumber: '0812312345'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        UserValidationMiddleware.isValidUserCreatePayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid body');
    });
  });

  describe('isValidUserUpdatePayload', () => {
    it('should call next() if the user update payload is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            name: 'John Doe',
            phoneNumber: '+6281234567890',
            image: 'http://example.com/image.jpg'
          }
        }
      });

      UserValidationMiddleware.isValidUserUpdatePayload(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw an HttpError if the user update payload is invalid', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            name: '',
            phoneNumber: 'invalid-phone'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        UserValidationMiddleware.isValidUserUpdatePayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid body');
    });
  });

  describe('isUnverifiedUserExistsPayload', () => {
    it('should call next() if unverified user exists', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            email: 'unverified@example.com'
          }
        }
      });

      prisma.user.findUnique = jest.fn().mockResolvedValue({
        email: 'unverified@example.com',
        verified: false
      });

      await UserValidationMiddleware.isUnverifiedUserExistsPayload(
        req,
        res,
        next
      );

      expect(res.locals.user).toEqual({
        email: 'unverified@example.com',
        verified: false
      });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw an HttpError if no unverified user is found', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            email: 'nonexistent@example.com'
          }
        }
      });

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const error = await getFunctionThrownError(() =>
        UserValidationMiddleware.isUnverifiedUserExistsPayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 404);
      expect(error).toHaveProperty('message', 'User not found');
    });
  });
});
