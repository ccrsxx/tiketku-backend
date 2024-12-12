import { prisma } from '../../../db.js';
import { faker } from '@faker-js/faker';
import { logger } from '../../../../loaders/pino.js';
import { FlightClassType } from '@prisma/client';

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
  /** @type {Prisma.FlightCreateManyInput[]} */
  const fixedFlights = [
    // Soekarno Hatta International (CGK) to Tokyo International Airport (HND)
    {
      id: '1234e86a-1325-43f1-be92-ce129e61712a',
      type: 'BUSINESS',
      price: 4000530,
      discount: null,
      flightNumber: 'GI1721',
      arrivalTimestamp: '2025-01-10T12:00:00Z',
      departureTimestamp: '2025-01-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Tokyo International Airport (HND) to Soekarno Hatta International (CGK)
    {
      id: '1234e86b-1325-43f1-be92-ce129e61712b',
      type: 'BUSINESS',
      price: 3830530,
      discount: 12,
      flightNumber: 'GI1823',
      arrivalTimestamp: '2025-01-11T12:00:00Z',
      departureTimestamp: '2025-01-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Juanda International Airport (SUB)
    {
      id: '1234e86c-1325-43f1-be92-ce129e61712c',
      type: 'ECONOMY',
      price: 1010980,
      discount: null,
      flightNumber: 'LI1351',
      arrivalTimestamp: '2025-02-10T12:00:00Z',
      departureTimestamp: '2025-02-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Juanda International Airport (SUB) to Soekarno Hatta International (CGK)
    {
      id: '1234e86d-1325-43f1-be92-ce129e61712d',
      type: 'ECONOMY',
      price: 1050000,
      discount: null,
      flightNumber: 'LI1633',
      arrivalTimestamp: '2025-02-11T12:00:00Z',
      departureTimestamp: '2025-02-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Los Angeles International Airport (LAX) to Soekarno Hatta International (CGK)
    {
      id: '1234e86e-1325-43f1-be92-ce129e61712e',
      type: 'FIRST_CLASS',
      price: 5040872,
      discount: 20,
      flightNumber: 'EM6578',
      arrivalTimestamp: '2025-03-10T12:00:00Z',
      departureTimestamp: '2025-03-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Los Angeles International Airport (LAX)
    {
      id: '1234e86f-1325-43f1-be92-ce129e61712f',
      type: 'FIRST_CLASS',
      price: 5100528,
      discount: null,
      flightNumber: 'EM6634',
      arrivalTimestamp: '2025-03-11T12:00:00Z',
      departureTimestamp: '2025-03-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Schiphol (AMS) to Soekarno Hatta International (CGK)
    {
      id: '1234e861-1325-43f1-be92-ce129e617121',
      type: 'PREMIUM',
      price: 2050500,
      discount: null,
      flightNumber: 'SA5934',
      arrivalTimestamp: '2025-04-10T12:00:00Z',
      departureTimestamp: '2025-04-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Schiphol (AMS)
    {
      id: '1234e870-1325-43f1-be92-ce129e617130',
      type: 'PREMIUM',
      price: 2340504,
      discount: null,
      flightNumber: 'SA5347',
      arrivalTimestamp: '2025-04-11T12:00:00Z',
      departureTimestamp: '2025-04-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    }
  ];

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
