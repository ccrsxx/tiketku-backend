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

  const promises = [];

  for (const { id, airplane } of flights) {
    /** @type {Prisma.FlightSeatUncheckedCreateInput[]} */
    const flightSeats = [];

    for (const [rowIndex] of Array.from({
      length: airplane.maxRow
    }).entries()) {
      for (const [columnIndex] of Array.from({
        length: airplane.maxColumn
      }).entries()) {
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

  await Promise.all(promises);
}
