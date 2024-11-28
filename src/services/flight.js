import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @param {string} id */
async function getFlight(id) {
  const flight = await prisma.flight.findUnique({
    where: { id },
    include: {
      airline: true,
      airplane: true,
      departureAirport: true,
      destinationAirport: true
    }
  });

  if (!flight) {
    throw new HttpError(404, { message: 'Flight not found' });
  }

  return flight;
}

export const FlightService = {
  getFlight
};
