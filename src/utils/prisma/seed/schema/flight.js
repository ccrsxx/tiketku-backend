import { prisma } from '../../../db.js';
import { faker } from '@faker-js/faker';
import { logger } from '../../../../loaders/pino.js';
import { FlightClassType } from '@prisma/client';
import { fixedFlights } from './data/flight.js';

/** @import {OmittedModel} from '../../../db.js' */

/** @import {Prisma} from '@prisma/client' */

export async function seedFlight() {
  await seedFixedFlight();

  const seedEvent = await prisma.event.findFirst({
    where: {
      type: 'SEED_FLIGHT',
      expiredAt: {
        not: null
      }
    },
    select: {
      expiredAt: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let shouldSeed = false;

  if (!seedEvent) shouldSeed = true;
  else {
    const { expiredAt, createdAt } = seedEvent;

    if (!expiredAt) shouldSeed = false;
    else {
      logger.info(
        `Last flight seed was at ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}.`
      );

      logger.info(
        `Flight seed will expire at ${expiredAt.toLocaleDateString()} ${expiredAt.toLocaleTimeString()}.`
      );

      shouldSeed = new Date() > expiredAt;
    }
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

  // Add +1 day from current date for the next 7 days
  const futureFlightDates = Array.from({ length: 7 }, (_, i) =>
    faker.date.soon({ days: i + 1 })
  );

  /** @type {Prisma.FlightCreateManyInput[]} */
  const normalFlights = [];

  const MAX_DAILY_FLIGHTS = 3;

  for (const flightDate of futureFlightDates) {
    for (const _ of Array.from({ length: MAX_DAILY_FLIGHTS })) {
      const randomNormalFlight = createFlight(flightDate, {
        airlines,
        airports,
        airplanes
      });

      normalFlights.push(randomNormalFlight);
    }
  }

  /** @type {Prisma.FlightCreateManyInput[]} */
  const roundTripFlights = [];

  for (const normalFlight of normalFlights) {
    const { departureAirportId, destinationAirportId, departureTimestamp } =
      normalFlight;

    // Add +1 day from normal flight for the next 7 days
    const roundTripFlightDates = Array.from({ length: 7 }, (_, i) =>
      faker.date.soon({ days: i + 2, refDate: departureTimestamp })
    );

    for (const flightDate of roundTripFlightDates) {
      const roundTripFlight = createFlight(flightDate, {
        airlines,
        airports,
        airplanes
      });

      roundTripFlight.departureAirportId = destinationAirportId;
      roundTripFlight.destinationAirportId = departureAirportId;

      roundTripFlights.push(roundTripFlight);
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
      data: normalFlights
    })
  ]);

  await prisma.flight.createMany({
    data: roundTripFlights
  });
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

/**
 * @typedef {Object} NeededModels
 * @property {OmittedModel<'airline'>[]} airlines
 * @property {OmittedModel<'airport'>[]} airports
 * @property {OmittedModel<'airplane'>[]} airplanes
 */

/**
 * @param {Date} flightDate
 * @param {NeededModels} models
 * @returns {Prisma.FlightCreateManyInput}
 */
function createFlight(flightDate, models) {
  const { airlines, airports, airplanes } = models;

  // Randomly select unique departure airports
  const departureAirport = faker.helpers.arrayElement(airports);

  /** @type {OmittedModel<'airport'>} */
  let destinationAirport;

  // Ensure destination airport is different from departure airport
  do {
    destinationAirport = faker.helpers.arrayElement(airports);
  } while (destinationAirport.id === departureAirport.id);

  const flightClassType = Object.values(FlightClassType);

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

  // Add duration minutes between departure and arrival time
  const durationMinutes = getMinutesBetweenDates(
    departureTimestamp,
    arrivalTimestamp
  );

  // Add random price for flight
  const flightPrice = faker.number.int({ min: 800_000, max: 10_000_000 });

  const flightNumber = faker.number
    .int({ min: 1, max: 9999 })
    .toString()
    .padStart(4, '0');

  // Random flight number with airline code
  const flightNumberWithAirlineCode = `${airline.code}${flightNumber}`;

  // Add probability of 20% for discount
  const discount = faker.datatype.boolean({ probability: 0.2 })
    ? faker.number.int({ min: 5, max: 50 })
    : null;

  return {
    id: crypto.randomUUID(),
    type: flightClass,
    price: flightPrice,
    discount: discount,
    airlineId: airline.id,
    airplaneId: airplane.id,
    flightNumber: flightNumberWithAirlineCode,
    arrivalTimestamp: arrivalTimestamp,
    departureTimestamp: departureTimestamp,
    durationMinutes: durationMinutes,
    departureAirportId: departureAirport.id,
    destinationAirportId: destinationAirport.id
  };
}

async function seedFixedFlight() {
  for (const flight of fixedFlights) {
    await prisma.flight.upsert({
      where: {
        id: flight.id
      },
      update: flight,
      create: flight
    });
  }
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
function getMinutesBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diff = end.getTime() - start.getTime();

  return diff / 60000;
}
