import { prisma } from '../../../db.js';
import { airplanes } from './data/airplane.js';

export async function seedAirplane() {
  for (const airplane of airplanes) {
    await prisma.airplane.upsert({
      where: { id: airplane.id },
      update: airplane,
      create: airplane
    });
  }
}
