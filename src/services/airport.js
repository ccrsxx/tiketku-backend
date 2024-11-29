import { prisma } from '../utils/db.js';

async function getAirports() {
  const airports = await prisma.airport.findMany();

  return airports;
}

export const AirportService = {
  getAirports
};
