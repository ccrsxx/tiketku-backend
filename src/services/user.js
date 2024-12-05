import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { AuthService } from './auth.js';
import { OtpService } from './otp.js';

/** @import {Prisma} from '@prisma/client' */
/** @import {ValidUserPayload} from '../middlewares/validation/user.js' */

/** @param {string} id */
async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (!user) {
    throw new HttpError(404, { message: 'User not found' });
  }

  return user;
}

async function getUsers() {
  const users = await prisma.user.findMany();

  return users;
}

/** @param {ValidUserPayload} payload */
export async function createUser(payload) {
  const { email, phoneNumber, password } = payload;

  const encryptedPassword = await AuthService.hashPassword(password);

  /** @type {Prisma.UserCreateInput} */
  const parsedUserWithEncryptedPassword = {
    ...payload,
    image: null,
    admin: false,
    password: encryptedPassword
  };

  const verifiedUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phoneNumber }],
      verified: true
    }
  });

  if (verifiedUser) {
    let errorMessage = 'Phone number already exists';

    if (verifiedUser.email === email) {
      errorMessage = 'Email already exists';
    }

    throw new HttpError(409, { message: errorMessage });
  }

  let user = null;

  const unverifiedUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phoneNumber }],
      verified: false
    }
  });

  if (unverifiedUser) {
    const updatedUser = await prisma.user.update({
      where: {
        id: unverifiedUser.id
      },
      data: parsedUserWithEncryptedPassword
    });

    user = updatedUser;
  } else {
    const newUser = await prisma.user.create({
      data: parsedUserWithEncryptedPassword
    });

    user = newUser;
  }

  await OtpService.sendUserVerificationOtp(user.name, user.email, user.id);

  return user;
}

/**
 * Updates an existing user in the database with the provided data.
 *
 * @param {string} id
 * @param {Object} payload
 * @param {string} [payload.name]
 * @param {string} [payload.email]
 * @param {string} [payload.phoneNumber]
 * @param {string} [payload.image]
 * @param {string} [payload.password]
 * @returns {Promise<Object>}
 */
async function updatedUser(payload, id) {
  const { name, email, phoneNumber, image, password } = payload;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, phoneNumber, image, password }
    });
    return updatedUser;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return {};
  }
}

export const UserService = {
  getUser,
  getUsers,
  createUser,
  updatedUser
};
