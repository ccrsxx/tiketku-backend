import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { io } from '../loaders/socket.js';
import { appEnv } from '../utils/env.js';
import { HttpError } from '../utils/error.js';
import { prisma } from '../utils/db.js';
import { generateRandomToken } from '../utils/helper.js';
import { sendResetPasswordEmail } from '../utils/emails/mail.js';

/** @import {ValidLoginPayload, ValidResetPasswordPayload} from '../middlewares/validation/auth.js' */

export class AuthService {
  /** @param {ValidLoginPayload} payload */
  static async login(payload) {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new HttpError(
        401,
        'Email or password is incorrect, please try again'
      );
    }

    const isMatch = await this.isPasswordMatch(password, user.password);

    if (!isMatch) {
      throw new HttpError(
        401,
        'Email or password is incorrect, please try again'
      );
    }

    const token = await this.generateToken(user.id);

    const userWithToken = {
      ...user,
      token
    };

    return userWithToken;
  }

  /**
   * @param {string} password
   * @param {number} salt
   */
  static async hashPassword(password, salt = 10) {
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  /**
   * @param {string} password
   * @param {string} hashedPassword
   */
  static async isPasswordMatch(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }

  /** @param {string} id */
  static async generateToken(id) {
    const token = jwt.sign({ id }, appEnv.JWT_SECRET, {
      expiresIn: '1d'
    });

    return token;
  }

  /** @param {string} token */
  static async verifyToken(token) {
    try {
      const decodedToken = jwt.verify(token, appEnv.JWT_SECRET);

      const validToken = typeof decodedToken === 'object' && decodedToken.id;

      if (!validToken) {
        throw new HttpError(401, 'Invalid token');
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decodedToken.id
        }
      });

      if (!user) {
        throw new HttpError(401, 'Invalid token');
      }

      return user;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new HttpError(401, 'Invalid token');
      }

      throw err;
    }
  }

  /** @param {string} email */
  static async sendPasswordResetEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) return null;

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiredAt: {
            gte: new Date()
          }
        },
        data: {
          used: true
        }
      });

      const nextHourDate = new Date();

      nextHourDate.setHours(nextHourDate.getHours() + 1);

      const newVerifyResetPassword = await tx.passwordReset.create({
        data: {
          used: false,
          token: generateRandomToken(),
          userId: user.id,
          expiredAt: nextHourDate
        }
      });

      await sendResetPasswordEmail({
        name: user.name,
        email: user.email,
        token: newVerifyResetPassword.token
      });
    });
  }

  /** @param {ValidResetPasswordPayload} payload */
  static async resetPassword({ token, password }) {
    const resetPasswordData = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiredAt: {
          gte: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!resetPasswordData) {
      throw new HttpError(400, 'Invalid or expired token');
    }

    const hashedPassword = await this.hashPassword(password);

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.update({
        where: {
          id: resetPasswordData.id
        },
        data: {
          used: true
        }
      });

      await tx.user.update({
        where: {
          id: resetPasswordData.userId
        },
        data: {
          password: hashedPassword
        }
      });

      io.emit(
        'notifications:password-reset',
        `A user has reset their password with email ${resetPasswordData.user.email}`
      );
    });
  }

  /** @param {string} token */
  static async verifyPasswordResetToken(token) {
    const resetPasswordData = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiredAt: {
          gte: new Date()
        }
      }
    });

    if (!resetPasswordData) {
      throw new HttpError(400, 'Invalid or expired token');
    }
  }
}
