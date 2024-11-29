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
      password: '$2b$10$LelKPXseavu7buKzPpFji.m6G.RJFDuuZa0tCTwhPmtsSPCcJSK9u',
      phoneNumber: '+628123456789'
    },
    {
      id: '3ef88357-fa12-4da1-9db1-9ddd1b089308',
      name: 'Rem',
      admin: true,
      email: 'rem@risalamin.com',
      password: '$2b$10$ALPZuUZuceGHRjMA0qKlp.F/Ex9p8RSMAHC6/Jg6N9Aro/G4NJ5jm',
      phoneNumber: '+628123456799'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user
    });
  }
}
