import { jest } from '@jest/globals';
import { HttpError } from '../../utils/error.js';
import { getFunctionThrownError } from '../../utils/jest.js';
import { generatePrismaMock } from '../../utils/jest.js';

/** @import {GeneratedPrismaMock} from '../../utils/jest.js' */

/** @typedef {{ default: Record<keyof import('bcrypt'), jest.Mock> }} BcryptMock */
/** @typedef {{ default: Record<keyof import('jsonwebtoken'), jest.Mock> }} JwtMock */
/**
 * @typedef {{
 *   default: Record<
 *     keyof import('../../utils/emails/core/mail.js'),
 *     jest.Mock
 *   >;
 * }} MailMock
 */

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

jest.unstable_mockModule('../../utils/emails/core/password-reset.js', () => ({
  sendResetPasswordEmail: jest.fn()
}));

jest.unstable_mockModule('../../utils/db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    passwordReset: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

const { prisma } = /** @type {GeneratedPrismaMock} */ (
  /** @type {unknown} */ (await import('../../utils/db.js'))
);

const { default: bcrypt } = /** @type {BcryptMock} */ (
  /** @type {unknown} */ (await import('bcrypt'))
);

const { default: jwt } = /** @type {JwtMock} */ (
  /** @type {unknown} */ (await import('jsonwebtoken'))
);

const { sendResetPasswordEmail } = /** @type {MailMock} */ (
  /** @type {unknown} */ (
    await import('../../utils/emails/core/password-reset.js')
  )
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

      const { password: _, ...userWithoutPassword } = user;

      const userWithToken = {
        ...userWithoutPassword,
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

  describe('Send password reset email', () => {
    it('should send password reset email if user exists', async () => {
      const email = 'test@email.com';
      const token = 'resetToken';
      const user = { id: 'userId', name: 'Test User', email };

      prisma.user.findUnique.mockResolvedValue(user);

      prisma.passwordReset.updateMany.mockResolvedValue({ count: 1 });

      const nextHourDate = new Date();

      nextHourDate.setHours(nextHourDate.getHours() + 1);

      prisma.passwordReset.create.mockResolvedValue({
        used: false,
        token,
        userId: user.id,
        expiredAt: nextHourDate
      });

      prisma.$transaction.mockImplementation((callback) => callback(prisma));

      await AuthService.sendPasswordResetEmail(email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });

      expect(prisma.passwordReset.updateMany).toHaveBeenCalledWith({
        where: {
          userId: user.id,
          used: false,
          expiredAt: {
            gte: expect.any(Date)
          }
        },
        data: {
          used: true
        }
      });

      expect(prisma.passwordReset.create).toHaveBeenCalledWith({
        data: {
          used: false,
          token: expect.any(String),
          userId: user.id,
          expiredAt: expect.any(Date)
        }
      });

      expect(sendResetPasswordEmail).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
        token
      });
    });

    it('should return null if user does not exist', async () => {
      const email = 'test@email.com';

      prisma.user.findUnique.mockImplementation(() => null);

      const result = await AuthService.sendPasswordResetEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('Reset password', () => {
    it('should reset password if token is valid', async () => {
      const token = 'resetToken';
      const password = 'newPassword';
      const hashedPassword = 'hashedPassword';
      const user = { id: 'id', email: 'test@email.com', name: 'test' };

      prisma.passwordReset.findFirst.mockImplementation(() => ({
        id: 'resetId',
        token,
        userId: user.id,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        used: false,
        user
      }));

      bcrypt.hash.mockImplementation(() => hashedPassword);

      const updatePasswordResetMock = jest.fn();
      const updateUserMock = jest.fn();
      const createNotificationMock = jest.fn();

      prisma.$transaction.mockImplementation(async (callback) => {
        await callback({
          passwordReset: {
            update: updatePasswordResetMock
          },
          user: {
            update: updateUserMock
          },
          notification: {
            create: createNotificationMock
          }
        });
      });

      await AuthService.resetPassword({ token, password });

      expect(prisma.passwordReset.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expiredAt: {
            gte: expect.any(Date)
          }
        },
        include: {
          user: true
        }
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);

      expect(prisma.$transaction).toHaveBeenCalled();

      expect(updatePasswordResetMock).toHaveBeenCalledWith({
        where: {
          id: 'resetId'
        },
        data: {
          used: true
        }
      });

      expect(updateUserMock).toHaveBeenCalledWith({
        where: {
          id: user.id
        },
        data: {
          password: hashedPassword
        }
      });

      expect(createNotificationMock).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          name: 'Notifikasi',
          description: 'Password berhasil diganti!'
        }
      });
    });

    it('should throw http 400 error if token is invalid or expired', async () => {
      const token = 'invalidToken';
      const password = 'newPassword';

      prisma.passwordReset.findFirst.mockImplementation(() => null);

      const promise = AuthService.resetPassword({ token, password });

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Verify password reset token', () => {
    it('should verify password reset token if token is valid', async () => {
      const token = 'resetToken';

      prisma.passwordReset.findFirst.mockImplementation(() => ({
        id: 'resetId',
        userId: 'userId',
        used: false,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000)
      }));

      await AuthService.verifyPasswordResetToken(token);

      expect(prisma.passwordReset.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expiredAt: {
            gte: expect.any(Date)
          }
        }
      });
    });

    it('should throw http 400 error if token is invalid or expired', async () => {
      const token = 'invalidToken';

      prisma.passwordReset.findFirst.mockImplementation(() => null);

      const promise = AuthService.verifyPasswordResetToken(token);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid or expired token');
    });
  });
});
