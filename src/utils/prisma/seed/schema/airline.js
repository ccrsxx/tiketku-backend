import { prisma } from '../../../db.js';
import { airlines } from './data/airline.js';

export async function seedAirline() {
  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { id: airline.id },
      update: airline,
      create: airline
    });
  }
}
