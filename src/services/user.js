import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { AuthService } from './auth.js';
import { OtpService } from './otp.js';

/** @import {Prisma} from '@prisma/client' */
/** @import {ValidCreateUserPayload,ValidUpdateUserPayload} from '../middlewares/validation/user.js' */

/** @param {ValidCreateUserPayload} payload */
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
 * @param {string} userId
 * @param {ValidUpdateUserPayload} payload
 */
async function updateUser(userId, { name, image, phoneNumber }) {
  const existingUserByPhoneNumber = await prisma.user.findUnique({
    where: { phoneNumber }
  });

  let isAbleToUpdate = true;

  if (existingUserByPhoneNumber) {
    isAbleToUpdate = existingUserByPhoneNumber.id === userId;
  }

  if (!isAbleToUpdate) {
    throw new HttpError(409, {
      message: 'Phone number already exists'
    });
  }

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name,
      image,
      phoneNumber
    }
  });
}

export const UserService = {
  createUser,
  updateUser
};
