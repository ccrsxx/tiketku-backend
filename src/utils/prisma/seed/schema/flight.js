import { prisma } from '../../../db.js';
import { faker } from '@faker-js/faker';
import { FlightClassType } from '@prisma/client';

/** @import {Prisma,FlightSeat,Airport} from '@prisma/client' */

/**
 * @param {Date} date
 * @returns {Date}
 */
function roundToNearestFiveMinutes(date) {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;
  date.setMinutes(roundedMinutes, 0, 0); // Set seconds and milliseconds to 0 for clean time
  return date;
}

export async function seedFlight() {
  // Fetch necessary data for relations
  const airports = await prisma.airport.findMany();
  const airlines = await prisma.airline.findMany();
  const airplanes = await prisma.airplane.findMany();

  const allDataExists = airports.length && airlines.length && airplanes.length;

  if (!allDataExists) {
    throw new Error(
      'Cannot seed flights because airports, airlines, or airplanes are missing.'
    );
  }

  const flightClassType = Object.values(FlightClassType);

  const days = Array.from({ length: 7 }, (_, i) =>
    faker.date.soon({ days: i + 1 })
  );

  /** @type {Prisma.FlightCreateManyInput[]} */
  const flights = [];

  const maxFlightsADay = 5;

  for (const flightDate of days) {
    for (const _ of Array.from({ length: maxFlightsADay })) {
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

      // Generate random departure and arrival times
      const departureTimestamp = roundToNearestFiveMinutes(
        faker.date.between({
          from: flightDate,
          to: new Date(flightDate.getTime() + 24 * 60 * 60 * 1000) // Next day
        })
      );

      const arrivalTimestamp = roundToNearestFiveMinutes(
        new Date(
          departureTimestamp.getTime() +
            faker.number.int({ min: 1, max: 5 }) * 60 * 60 * 1000
        )
      ); // Flight duration: 1-5 hours

      // Random price between 800,000 and 10,000,000
      const flightPrice = faker.number.int({ min: 800_000, max: 10_000_000 });

      const discount = faker.datatype.boolean()
        ? faker.number.int({ min: 5, max: 50 })
        : null; // 50% chance of discount

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

  await prisma.flight.createMany({
    data: flights
  });
}
