import { prisma } from '../../../db.js';
import { faker } from '@faker-js/faker';
import { logger } from '../../../../loaders/pino.js';
import { FlightClassType } from '@prisma/client';

/** @import {Prisma,Airport} from '@prisma/client' */

export async function seedFlight() {
  const seedEvent = await prisma.event.findFirst({
    where: {
      type: 'SEED_FLIGHT'
    },
    select: {
      expiredAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let shouldSeed = false;

  if (!seedEvent) shouldSeed = true;
  else {
    const { expiredAt } = seedEvent;

    if (!expiredAt) shouldSeed = false;
    else shouldSeed = new Date() > expiredAt;
  }

  if (!shouldSeed) {
    logger.info('Skipping flight seed because it is not expired yet.');
    return;
  }

  // Fetch necessary data for relations
  const airports = await prisma.airport.findMany();
  const airlines = await prisma.airline.findMany();
  const airplanes = await prisma.airplane.findMany();

  const allDataExists =
    airports.length > 2 && airlines.length && airplanes.length;

  if (!allDataExists) {
    throw new Error(
      'Cannot seed flights because airports, airlines, or airplanes are missing.'
    );
  }

  const flightClassType = Object.values(FlightClassType);

  const futureFlightDates = Array.from({ length: 7 }, (_, i) =>
    faker.date.soon({ days: i + 1 })
  );

  /** @type {Prisma.FlightCreateManyInput[]} */
  const flights = [];

  const MAX_DAILY_FLIGHTS = 5;

  for (const flightDate of futureFlightDates) {
    for (const _ of Array.from({ length: MAX_DAILY_FLIGHTS })) {
      // Randomly select unique airports
      const departureAirport = faker.helpers.arrayElement(airports);

      /** @type {Airport} */
      let destinationAirport;

      // Ensure destination airport is different from departure airport
      do {
        destinationAirport = faker.helpers.arrayElement(airports);
      } while (destinationAirport.id === departureAirport.id);

      const airline = faker.helpers.arrayElement(airlines);
      const airplane = faker.helpers.arrayElement(airplanes);
      const flightClass = faker.helpers.arrayElement(flightClassType);

      // Generate random departure and arrival times on same day
      const departureTimestamp = roundToNearestFiveMinutes(
        faker.date.between({
          from: flightDate,
          to: faker.date.soon({ refDate: flightDate, days: 1 })
        })
      );

      let arrivalTimestamp = new Date(departureTimestamp);

      // Add random 1-5 hours to arrival time
      arrivalTimestamp.setHours(
        arrivalTimestamp.getHours() + faker.number.int({ min: 1, max: 6 })
      );

      // Add random 0-60 minutes to arrival time
      arrivalTimestamp.setMinutes(
        arrivalTimestamp.getMinutes() + faker.number.int({ min: 0, max: 60 })
      );

      arrivalTimestamp = roundToNearestFiveMinutes(arrivalTimestamp);

      // Add random price for flight
      const flightPrice = faker.number.int({ min: 800_000, max: 10_000_000 });

      // Add probability of 20% for discount
      const discount = faker.datatype.boolean({ probability: 0.2 })
        ? faker.number.int({ min: 5, max: 50 })
        : null;

      flights.push({
        id: crypto.randomUUID(),
        type: flightClass,
        price: flightPrice,
        discount: discount,
        airlineId: airline.id,
        airplaneId: airplane.id,
        arrivalTimestamp: arrivalTimestamp,
        departureTimestamp: departureTimestamp,
        departureAirportId: departureAirport.id,
        destinationAirportId: destinationAirport.id
      });
    }
  }

  const nextWeek = new Date();

  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.$transaction([
    prisma.event.create({
      data: {
        type: 'SEED_FLIGHT',
        expiredAt: nextWeek
      }
    }),
    prisma.flight.createMany({
      data: flights
    })
  ]);
}

/**
 * @param {Date} date
 * @returns {Date}
 */
function roundToNearestFiveMinutes(date) {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;

  // Set seconds and milliseconds to 0 for clean time
  date.setMinutes(roundedMinutes, 0, 0);

  return date;
}
