import { prisma } from '../utils/db.js';
import { sendOtpEmail } from '../utils/emails/mail.js';
import { HttpError } from '../utils/error.js';
import { generateRandomOTP } from '../utils/helper.js';

/** @import {Prisma} from '@prisma/client' */
/** @import {ValidOtpPayload} from '../middlewares/validation/otp.js' */
/** @import {PrismaTransaction} from '../utils/types/prisma.js' */

/**
 * @param {string} name
 * @param {string} email
 * @param {string} userId
 */
async function sendUserVerificationOtp(name, email, userId) {
  await prisma.$transaction(async (tx) => {
    await invalidateAllUserOtps(tx, userId);

    const nextFiveMinutesDate = new Date();

    nextFiveMinutesDate.setMinutes(nextFiveMinutesDate.getMinutes() + 5);

    /** @type {Prisma.OtpUncheckedCreateInput} */
    const payload = {
      otp: generateRandomOTP(),
      used: false,
      userId: userId,
      expiredAt: nextFiveMinutesDate
    };

    const { otp } = await tx.otp.create({
      data: payload
    });

    await sendOtpEmail({
      otp,
      name,
      email
    });
  });
}

/** @param {ValidOtpPayload} payload */
async function verifyUserVerificationOtp({ otp, email }) {
  const verifyOtpData = await prisma.otp.findFirst({
    where: {
      otp,
      used: false,
      user: {
        email
      },
      expiredAt: {
        gte: new Date()
      }
    }
  });

  if (!verifyOtpData) {
    throw new HttpError(401, { message: 'OTP is invalid' });
  }

  const userId = verifyOtpData.userId;

  await prisma.$transaction(async (tx) => {
    await invalidateAllUserOtps(tx, userId);

    await tx.user.update({
      where: { id: userId },
      data: {
        verified: true
      }
    });

    await tx.notification.create({
      data: {
        userId,
        name: 'Notifikasi',
        description: 'Selamat datang di TiketKu!'
      }
    });
  });
}

/**
 * @param {PrismaTransaction} tx
 * @param {string} userId
 */
function invalidateAllUserOtps(tx, userId) {
  return tx.otp.updateMany({
    where: {
      userId,
      expiredAt: {
        gte: new Date()
      }
    },
    data: {
      used: true
    }
  });
}

export const OtpService = {
  sendUserVerificationOtp,
  verifyUserVerificationOtp
};
