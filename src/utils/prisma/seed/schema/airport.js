import { prisma } from '../../../db.js';
import { airports } from './data/airport.js';

export async function seedAirport() {
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { id: airport.id },
      update: airport,
      create: airport
    });
  }
}
