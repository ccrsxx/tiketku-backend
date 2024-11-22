import { jest } from '@jest/globals';
import { HttpError } from '../../utils/error.js';
import { getFunctionThrownError } from '../../utils/jest.js';
import { generatePrismaMock } from '../../utils/jest.js';

/** @import {GeneratedPrismaMock} from '../../utils/jest.js' */

/** @typedef {{ default: Record<keyof import('bcrypt'), jest.Mock> }} BcryptMock */
/** @typedef {{ default: Record<keyof import('jsonwebtoken'), jest.Mock> }} JwtMock */

/**
 * @typedef {{
 *   AuthService: Record<
 *     keyof import('../../services/auth.js')['AuthService'],
 *     jest.Mock
 *   >;
 * }} AuthServiceMock
 */

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);

jest.unstable_mockModule(
  'bcrypt',
  () =>
    /** @type {BcryptMock} */ ({
      default: {
        hash: jest.fn(),
        compare: jest.fn()
      }
    })
);

const oldJwt = await import('jsonwebtoken');

jest.unstable_mockModule(
  'jsonwebtoken',
  () =>
    /** @type {JwtMock} */ (
      /** @type {unknown} */ ({
        default: {
          ...oldJwt.default,
          sign: jest.fn(),
          verify: jest.fn()
        }
      })
    )
);

const { prisma } = /** @type {GeneratedPrismaMock} */ (
  /** @type {unknown} */ (await import('../../utils/db.js'))
);

const { default: bcrypt } = /** @type {BcryptMock} */ (
  /** @type {unknown} */ (await import('bcrypt'))
);

const { default: jwt } = /** @type {JwtMock} */ (
  /** @type {unknown} */ (await import('jsonwebtoken'))
);

const { AuthService } = /** @type {AuthServiceMock} */ (
  /** @type {unknown} */ (await import('../auth.js'))
);

describe('Auth service', () => {
  describe('Login', () => {
    it('should login', async () => {
      const user = { email: 'test@email.com', password: 'password' };
      const token = 'token';

      prisma.user.findUnique.mockImplementation(() => user);

      bcrypt.compare.mockImplementation(() => true);
      jwt.sign.mockImplementation(() => token);

      const result = await AuthService.login(user);

      const userWithToken = {
        ...user,
        token
      };

      expect(result).toEqual(userWithToken);
    });

    it('should throw http 401 error if user does not exist', async () => {
      const user = { email: 'email', password: 'password' };

      prisma.user.findUnique.mockImplementation(() => null);

      const promise = AuthService.login(user);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty(
        'message',
        'Email or password is incorrect, please try again'
      );
    });

    it('should throw http 401 error if password does not match', async () => {
      const user = { email: 'email', password: 'password' };

      prisma.user.findUnique.mockImplementation(() => user);

      bcrypt.compare.mockImplementation(() => false);

      const promise = AuthService.login(user);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty(
        'message',
        'Email or password is incorrect, please try again'
      );
    });
  });

  describe('Hash password', () => {
    it('should hash a password', async () => {
      const password = 'password';
      const hashedPassword = 'hashedPassword';

      bcrypt.hash.mockImplementation(() => hashedPassword);

      const result = await AuthService.hashPassword(password);

      expect(result).toBe(hashedPassword);
    });
  });

  describe('Is password match', () => {
    it('should return true if password matches', async () => {
      const password = 'password';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockImplementation(() => true);

      const result = await AuthService.isPasswordMatch(
        password,
        hashedPassword
      );

      expect(result).toBe(true);
    });

    it('should return false if password does not match', async () => {
      const password = 'password';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockImplementation(() => false);

      const result = await AuthService.isPasswordMatch(
        password,
        hashedPassword
      );

      expect(result).toBe(false);
    });
  });

  describe('Generate token', () => {
    it('should generate a token', async () => {
      const id = 'id';
      const token = 'token';

      jwt.sign.mockImplementation(() => token);

      const result = await AuthService.generateToken(id);

      expect(result).toBe(token);
    });
  });

  describe('Verify token', () => {
    it('should verify a token', async () => {
      const user = { id: 'id', name: 'test' };
      const token = 'token';

      jwt.verify.mockImplementation(() => ({ id: 'id' }));

      prisma.user.findUnique.mockImplementation(() => user);

      const result = await AuthService.verifyToken(token);

      expect(result).toEqual(user);
    });

    it('should throw http 401 error if token is invalid when verifying', async () => {
      jwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError();
      });

      const promise = AuthService.verifyToken('token');

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });

    it('should throw http 401 error if token result is malformed', async () => {
      jwt.verify.mockImplementation(() => 'invalid token');

      const promise = AuthService.verifyToken('token');

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });

    it('should throw http 401 error if token is invalid when finding user', async () => {
      jwt.verify.mockImplementation(() => ({ id: 'id' }));

      prisma.user.findUnique.mockImplementation(() => null);

      const promise = AuthService.verifyToken('token');

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);

      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('message', 'Invalid token');
    });
  });
});
