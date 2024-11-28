import { prisma } from '../../db.js';
import { logger } from '../../../loaders/pino.js';
import { seedUser } from './schema/user.js';
import { seedAirport } from './schema/airport.js';
import { seedAirline } from './schema/airline.js';
import { seedAirplane } from './schema/airplane.js';
import { seedFlight } from './schema/flight.js';
import { seedFlightSeat } from './schema/flight-seat.js';

async function main() {
  try {
    await seedUser();
    await seedAirport();
    await seedAirline();
    await seedAirplane();
    await seedFlight();
    await seedFlightSeat();

    await prisma.$disconnect();
  } catch (err) {
    logger.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void main();
