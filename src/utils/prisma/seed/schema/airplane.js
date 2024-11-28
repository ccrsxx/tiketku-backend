import { prisma } from '../../../db.js';

/** @import {Prisma} from '@prisma/client' */

export async function seedAirplane() {
  /** @type {Prisma.AirplaneCreateInput[]} */
  const airplanes = [
    {
      id: '573abca2-1bc7-4635-9948-08be534e5227',
      name: 'Boeing 737',
      maxRow: 30,
      maxColumn: 6
    },
    {
      id: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      name: 'Airbus A320',
      maxRow: 28,
      maxColumn: 6
    },
    {
      id: 'ac27b4ab-a957-47f8-a98d-05909a5be3aa',
      name: 'Embraer E190',
      maxRow: 12,
      maxColumn: 6
    },
    {
      id: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      name: 'Airbus A380',
      maxRow: 40,
      maxColumn: 10
    },
    {
      id: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      name: 'Boeing 757',
      maxRow: 38,
      maxColumn: 6
    }
  ];

  for (const airplane of airplanes) {
    await prisma.airplane.upsert({
      where: { id: airplane.id },
      update: {},
      create: airplane
    });
  }
}
