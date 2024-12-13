import { prisma } from '../../../db.js';

/** @import {Prisma} from '@prisma/client' */

export async function seedUser() {
  /** @type {Prisma.UserCreateInput[]} */
  const users = [
    {
      id: '3ef88357-fa12-4da1-9db1-9ddd1b089307',
      name: 'Emilia',
      admin: true,
      email: 'emilia@risalamin.com',
      verified: true,
      password: '$2b$10$snPO3t3zk1vV5H3MpdhJgeUSii2yZWYWVI8KtOtuv9k8YXpN4Uaxm',
      phoneNumber: '+628123456789'
    },
    {
      id: '3ef88357-fa12-4da1-9db1-9ddd1b089308',
      name: 'Rem',
      admin: true,
      email: 'rem@risalamin.com',
      verified: true,
      password: '$2b$10$h85XBtInvK0EDwEJOgXP8.O9xjzsKtzkzvkwFFda5RXCFShe1TLGy',
      phoneNumber: '+628123456799'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }
}
