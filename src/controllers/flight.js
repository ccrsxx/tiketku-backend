import { FlightService } from '../services/flight.js';

/** @import {Request,Response} from 'express' */
/** @import {ValidFlightPayload, ValidFavoriteFlightPayload} from '../middlewares/validation/flight.js' */

/**
 * @param {Request<unknown, unknown, unknown, ValidFlightPayload>} req
 * @param {Response} res
 */
async function getFlights(req, res) {
  const {
    departureAirportId,
    destinationAirportId,
    departureDate,
    returnDate
  } = req.query;

  const flights = await FlightService.getFlights(
    departureAirportId,
    destinationAirportId,
    new Date(departureDate),
    returnDate ? new Date(returnDate) : undefined
  );

  res.status(200).json({ data: flights });
}

/**
 * @param {Request<unknown, unknown, unknown, ValidFavoriteFlightPayload>} req
 * @param {Response} res
 */
async function getFavoriteFlights(req, res) {
  const { continent } = req.query;

  const flights = await FlightService.getFavoriteFlights(continent);

  res.status(200).json({ data: flights });
}

export const FlightController = {
  getFlights,
  getFavoriteFlights
};
