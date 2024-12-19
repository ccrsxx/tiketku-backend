import { prisma } from '../../../db.js';
import { users } from './data/user.js';

export async function seedUser() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }
}
