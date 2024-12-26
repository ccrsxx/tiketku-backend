import { logger } from '../../../../loaders/pino.js';
import { prisma } from '../../../db.js';

/** @import {Prisma} from '@prisma/client' */

export async function seedFlightSeat() {
  const flights = await prisma.flight.findMany({
    select: {
      id: true,
      airplane: {
        select: {
          maxRow: true,
          maxColumn: true
        }
      }
    },
    where: {
      flightSeats: {
        none: {}
      }
    }
  });

  if (!flights.length) {
    logger.info('Skipping flight seats seed because it is already seeded.');
    return;
  }

  const promises = [];

  for (const {
    id,
    airplane: { maxRow, maxColumn }
  } of flights) {
    /** @type {Prisma.FlightSeatUncheckedCreateInput[]} */
    const flightSeats = [];

    for (const [rowIndex] of Array.from({ length: maxRow }).entries()) {
      for (const [columnIndex] of Array.from({ length: maxColumn }).entries()) {
        flightSeats.push({
          row: rowIndex + 1,
          column: columnIndex + 1,
          flightId: id
        });
      }
    }

    const promise = prisma.flightSeat.createMany({
      data: flightSeats
    });

    promises.push(promise);
  }

  const CHUNK_SIZE = 1_000;

  const totalChunks = Math.ceil(promises.length / CHUNK_SIZE);

  logger.info(
    `Seeding ${promises.length} flight seats in ${totalChunks} with 2000 chunks.`
  );

  for (let i = 0; i < promises.length; i += CHUNK_SIZE) {
    logger.info(`Seeding chunk ${i / CHUNK_SIZE + 1}/${totalChunks}.`);

    await Promise.all(promises.slice(i, i + CHUNK_SIZE));
  }

  logger.info('Flight seats seed completed.');
}
