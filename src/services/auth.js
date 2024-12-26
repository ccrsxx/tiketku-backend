import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { appEnv } from '../utils/env.js';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { generateRandomToken } from '../utils/helper.js';
import { sendResetPasswordEmail } from '../utils/emails/core/password-reset.js';

/** @import {Request} from 'express' */
/** @import {ValidLoginPayload,ValidResetPasswordPayload} from '../middlewares/validation/auth.js' */

/** @param {ValidLoginPayload} payload */
async function login(payload) {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
      verified: true
    },
    omit: {
      password: false
    }
  });

  if (!user) {
    throw new HttpError(401, {
      message: 'Email or password is incorrect, please try again'
    });
  }

  const isMatch = await isPasswordMatch(password, user.password);

  if (!isMatch) {
    throw new HttpError(401, {
      message: 'Email or password is incorrect, please try again'
    });
  }

  const token = await generateToken(user.id);

  const { password: _, ...userWithoutPassword } = user;

  const userWithToken = {
    ...userWithoutPassword,
    token
  };

  return userWithToken;
}

/**
 * @param {string} password
 * @param {number} salt
 */
async function hashPassword(password, salt = 10) {
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * @param {string} password
 * @param {string} hashedPassword
 */
async function isPasswordMatch(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

/** @param {string} id */
async function generateToken(id) {
  const token = jwt.sign({ id }, appEnv.JWT_SECRET, {
    expiresIn: '7d'
  });

  return token;
}

/** @param {string} token */
async function verifyToken(token) {
  try {
    const decodedToken = jwt.verify(token, appEnv.JWT_SECRET);

    const validToken = typeof decodedToken === 'object' && decodedToken.id;

    if (!validToken) {
      throw new HttpError(401, { message: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id
      }
    });

    if (!user) {
      throw new HttpError(401, { message: 'Invalid token' });
    }

    return user;
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, { message: 'Invalid token' });
    }

    throw err;
  }
}

/** @param {string} email */
async function sendPasswordResetEmail(email) {
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
async function resetPassword({ token, password }) {
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
    throw new HttpError(400, { message: 'Invalid or expired token' });
  }

  const hashedPassword = await hashPassword(password);

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

    await tx.notification.create({
      data: {
        userId: resetPasswordData.userId,
        name: 'Notifikasi',
        description: 'Password berhasil diganti!'
      }
    });
  });
}

/** @param {string} token */
async function verifyPasswordResetToken(token) {
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
    throw new HttpError(400, { message: 'Invalid or expired token' });
  }
}

/** @param {Request} req */
function getAuthorizationBearerToken(req) {
  const authorization = req.get('authorization');

  if (!authorization) {
    throw new HttpError(401, { message: 'Invalid token' });
  }

  const [type, token] = authorization.split(' ');

  if (type.toLocaleLowerCase() !== 'bearer') {
    throw new HttpError(401, { message: 'Invalid token' });
  }

  return token;
}

export const AuthService = {
  login,
  hashPassword,
  isPasswordMatch,
  generateToken,
  verifyToken,
  sendPasswordResetEmail,
  resetPassword,
  verifyPasswordResetToken,
  getAuthorizationBearerToken
};
