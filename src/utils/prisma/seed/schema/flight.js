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
      id: '757f8d38-4df2-4a81-a8df-281fe6121822',
      type: 'BUSINESS',
      price: 4000530,
      discount: null,
      flightNumber: 'GI1721',
      departureTimestamp: '2025-01-10T12:00:00Z',
      arrivalTimestamp: '2025-01-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '4d38a83b-669c-4285-8853-c04846a774f8',
      type: 'ECONOMY',
      price: 6000530,
      discount: null,
      flightNumber: 'GI1722',
      departureTimestamp: '2025-01-10T13:00:00Z',
      arrivalTimestamp: '2025-01-10T17:00:00Z',
      durationMinutes: 240,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'a620f9fe-1c0d-4d06-b377-761cf9aebd42',
      type: 'FIRST_CLASS',
      price: 8000530,
      discount: null,
      flightNumber: 'GI1723',
      departureTimestamp: '2025-01-10T14:00:00Z',
      arrivalTimestamp: '2025-01-10T17:00:00Z',
      durationMinutes: 180,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '347e59fc-1c73-4f15-85fb-6e4e87d600d6',
      type: 'PREMIUM',
      price: 10000530,
      discount: null,
      flightNumber: 'GI1724',
      departureTimestamp: '2025-01-10T15:00:00Z',
      arrivalTimestamp: '2025-01-10T17:00:00Z',
      durationMinutes: 120,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Tokyo International Airport (HND) to Soekarno Hatta International (CGK)
    {
      id: '54dfeb40-06e7-4da6-8fb0-72a071b15dc1',
      type: 'BUSINESS',
      price: 3830530,
      discount: 12,
      flightNumber: 'GI1823',
      departureTimestamp: '2025-01-11T12:00:00Z',
      arrivalTimestamp: '2025-01-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '4f8c8f60-3225-4a63-b770-2751a72eb10e',
      type: 'ECONOMY',
      price: 4830530,
      discount: 12,
      flightNumber: 'GI1824',
      departureTimestamp: '2025-01-11T13:00:00Z',
      arrivalTimestamp: '2025-01-11T17:00:00Z',
      durationMinutes: 240,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '7215cee1-b710-43e1-acf1-3503732d1b1a',
      type: 'FIRST_CLASS',
      price: 5830530,
      discount: 12,
      flightNumber: 'GI1825',
      departureTimestamp: '2025-01-11T14:00:00Z',
      arrivalTimestamp: '2025-01-11T17:00:00Z',
      durationMinutes: 180,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '3e46cde4-249e-433f-a0cf-cf6cddb53078',
      type: 'PREMIUM',
      price: 6830530,
      discount: 12,
      flightNumber: 'GI1826',
      departureTimestamp: '2025-01-11T15:00:00Z',
      arrivalTimestamp: '2025-01-11T17:00:00Z',
      durationMinutes: 120,
      airlineId: '75321628-bb7e-43d3-8113-9287db630ff3',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '2515393b-108d-451e-a919-2bfa2e1c336f',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Juanda International Airport (SUB)
    {
      id: '98b897cd-55c4-4796-b7ed-0cb41b1310f4',
      type: 'BUSINESS',
      price: 1010980,
      discount: null,
      flightNumber: 'LI1351',
      departureTimestamp: '2025-02-10T12:00:00Z',
      arrivalTimestamp: '2025-02-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '29bcecaa-b369-4947-9883-cfb0860dfad8',
      type: 'ECONOMY',
      price: 1110980,
      discount: null,
      flightNumber: 'LI1352',
      departureTimestamp: '2025-02-10T13:00:00Z',
      arrivalTimestamp: '2025-02-10T17:00:00Z',
      durationMinutes: 240,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'd9ebf68d-a6e8-49b8-97ec-b6986ecaee3d',
      type: 'FIRST_CLASS',
      price: 1210980,
      discount: null,
      flightNumber: 'LI1353',
      departureTimestamp: '2025-02-10T14:00:00Z',
      arrivalTimestamp: '2025-02-10T17:00:00Z',
      durationMinutes: 180,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '1f172bf7-652f-4699-ab5b-ad97399a01fd',
      type: 'PREMIUM',
      price: 1310980,
      discount: null,
      flightNumber: 'LI1354',
      departureTimestamp: '2025-02-10T15:00:00Z',
      arrivalTimestamp: '2025-02-10T17:00:00Z',
      durationMinutes: 120,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Juanda International Airport (SUB) to Soekarno Hatta International (CGK)
    {
      id: 'ec123b86-0da7-44c1-9648-bdd695f185a7',
      type: 'BUSINESS',
      price: 1050000,
      discount: null,
      flightNumber: 'LI1633',
      departureTimestamp: '2025-02-11T12:00:00Z',
      arrivalTimestamp: '2025-02-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'd89706d7-25da-40a3-aeb6-a02c1add57f5',
      type: 'ECONOMY',
      price: 1150000,
      discount: null,
      flightNumber: 'LI1634',
      departureTimestamp: '2025-02-11T13:00:00Z',
      arrivalTimestamp: '2025-02-11T17:00:00Z',
      durationMinutes: 240,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '07b6b395-9411-498c-bbba-592cf3c75de6',
      type: 'FIRST_CLASS',
      price: 1250000,
      discount: null,
      flightNumber: 'LI1635',
      departureTimestamp: '2025-02-11T14:00:00Z',
      arrivalTimestamp: '2025-02-11T17:00:00Z',
      durationMinutes: 180,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'a16522d0-0d41-4b94-a701-6da902174e6f',
      type: 'PREMIUM',
      price: 1350000,
      discount: null,
      flightNumber: 'LI1636',
      departureTimestamp: '2025-02-11T15:00:00Z',
      arrivalTimestamp: '2025-02-11T17:00:00Z',
      durationMinutes: 120,
      airlineId: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Los Angeles International Airport (LAX) to Soekarno Hatta International (CGK)
    {
      id: '2e6fd7a0-00c7-4ad4-89dc-60fbfd6dea98',
      type: 'BUSINESS',
      price: 5040872,
      discount: 20,
      flightNumber: 'EM6578',
      departureTimestamp: '2025-03-10T12:00:00Z',
      arrivalTimestamp: '2025-03-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '993ce435-f91b-4eb1-916d-41b1a4838798',
      type: 'ECONOMY',
      price: 6040872,
      discount: 20,
      flightNumber: 'EM6579',
      departureTimestamp: '2025-03-10T13:00:00Z',
      arrivalTimestamp: '2025-03-10T17:00:00Z',
      durationMinutes: 240,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'da947faf-0749-48c4-8b05-1595e2ad3421',
      type: 'FIRST_CLASS',
      price: 7040872,
      discount: 20,
      flightNumber: 'EM6580',
      departureTimestamp: '2025-03-10T14:00:00Z',
      arrivalTimestamp: '2025-03-10T17:00:00Z',
      durationMinutes: 180,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '21e875a6-9831-4227-ad87-7d1a014fc835',
      type: 'PREMIUM',
      price: 8040872,
      discount: 20,
      flightNumber: 'EM6578',
      departureTimestamp: '2025-03-10T15:00:00Z',
      arrivalTimestamp: '2025-03-10T17:00:00Z',
      durationMinutes: 120,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: '573abca2-1bc7-4635-9948-08be534e5227',
      departureAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Los Angeles International Airport (LAX)
    {
      id: '42d1554b-487d-47fd-bbd3-e47efc5023b2',
      type: 'BUSINESS',
      price: 5100528,
      discount: null,
      flightNumber: 'EM6634',
      departureTimestamp: '2025-03-11T12:00:00Z',
      arrivalTimestamp: '2025-03-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'f849538f-97ee-4f07-ab1b-49c1c8d21cdd',
      type: 'ECONOMY',
      price: 6100528,
      discount: null,
      flightNumber: 'EM6635',
      departureTimestamp: '2025-03-11T13:00:00Z',
      arrivalTimestamp: '2025-03-11T17:00:00Z',
      durationMinutes: 240,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'cd29d37d-c3b5-431f-bf3d-8e10b6755fc5',
      type: 'FIRST_CLASS',
      price: 7100528,
      discount: null,
      flightNumber: 'EM6636',
      departureTimestamp: '2025-03-11T14:00:00Z',
      arrivalTimestamp: '2025-03-11T17:00:00Z',
      durationMinutes: 180,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '00ccbfc5-dfeb-44fa-8f45-6146abe7c2aa',
      type: 'FIRST_CLASS',
      price: 8100528,
      discount: null,
      flightNumber: 'EM6637',
      departureTimestamp: '2025-03-11T15:00:00Z',
      arrivalTimestamp: '2025-03-11T17:00:00Z',
      durationMinutes: 120,
      airlineId: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      airplaneId: 'd8767ecb-4635-4194-9a8c-478390178fb3',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Schiphol (AMS) to Soekarno Hatta International (CGK)
    {
      id: '0e5cbce1-cc7a-4e56-8b5a-c72f313213bc',
      type: 'BUSINESS',
      price: 2050500,
      discount: null,
      flightNumber: 'SA5934',
      departureTimestamp: '2025-04-10T12:00:00Z',
      arrivalTimestamp: '2025-04-10T17:00:00Z',
      durationMinutes: 300,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: '966caefb-ca5f-402f-8bf5-6e1900b6fd52',
      type: 'ECONOMY',
      price: 2150500,
      discount: null,
      flightNumber: 'SA5935',
      departureTimestamp: '2025-04-10T13:00:00Z',
      arrivalTimestamp: '2025-04-10T17:00:00Z',
      durationMinutes: 240,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'df67ee46-7e33-4869-b279-26e8162324ca',
      type: 'FIRST_CLASS',
      price: 2250500,
      discount: null,
      flightNumber: 'SA5936',
      departureTimestamp: '2025-04-10T14:00:00Z',
      arrivalTimestamp: '2025-04-10T17:00:00Z',
      durationMinutes: 180,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'e789a5d3-46d7-4576-97fb-75201f22fc28',
      type: 'PREMIUM',
      price: 2350500,
      discount: null,
      flightNumber: 'SA5937',
      departureTimestamp: '2025-04-10T15:00:00Z',
      arrivalTimestamp: '2025-04-10T17:00:00Z',
      durationMinutes: 120,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: '4b99f2f9-ac08-49fc-ae7b-035ac2dfa1d2',
      departureAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      destinationAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    // Soekarno Hatta International (CGK) to Schiphol (AMS)
    {
      id: '2ad55dd1-227f-4400-bed4-2c69474a0d9c',
      type: 'BUSINESS',
      price: 2340504,
      discount: null,
      flightNumber: 'SA5347',
      departureTimestamp: '2025-04-11T12:00:00Z',
      arrivalTimestamp: '2025-04-11T17:00:00Z',
      durationMinutes: 300,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'e9490805-f381-4bcc-afb1-730005a5fced',
      type: 'ECONOMY',
      price: 2340504,
      discount: null,
      flightNumber: 'SA5348',
      departureTimestamp: '2025-04-11T13:00:00Z',
      arrivalTimestamp: '2025-04-11T17:00:00Z',
      durationMinutes: 240,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'b98f3551-2fa9-4fbc-b428-cc5998fc536a',
      type: 'FIRST_CLASS',
      price: 2340504,
      discount: null,
      flightNumber: 'SA5349',
      departureTimestamp: '2025-04-11T14:00:00Z',
      arrivalTimestamp: '2025-04-11T17:00:00Z',
      durationMinutes: 180,
      airlineId: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      airplaneId: 'cdb6f274-91f7-4c19-ada6-c9d1ac6b641b',
      departureAirportId: '947654bd-9806-4a69-a9b6-351824b45da8',
      destinationAirportId: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      createdAt: '2024-12-10T12:00:00Z',
      updatedAt: '2024-12-10T12:00:00Z'
    },
    {
      id: 'aecc4c93-cead-46b3-8ab7-60271097941a',
      type: 'PREMIUM',
      price: 2340504,
      discount: null,
      flightNumber: 'SA5350',
      departureTimestamp: '2025-04-11T15:00:00Z',
      arrivalTimestamp: '2025-04-11T17:00:00Z',
      durationMinutes: 120,
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
