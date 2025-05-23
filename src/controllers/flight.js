import { FlightService } from '../services/flight.js';

/** @import {Request,Response} from 'express' */
/** @import {ValidFlightQueryParams,ValidFavoriteFlightQueryParams} from '../services/flight.js' */

/**
 * @param {Request} req
 * @param {Response} res
 */
async function getFlight(req, res) {
  const flight = await FlightService.getFlight(req.params.id, req.query);

  res.status(200).json(flight);
}

/**
 * @param {Request<unknown, unknown, unknown, ValidFlightQueryParams>} req
 * @param {Response} res
 */
async function getFlights(req, res) {
  const { meta, flights } = await FlightService.getFlights(req.query);

  res.status(200).json({ meta, data: flights });
}

/**
 * @param {Request<
 *   unknown,
 *   unknown,
 *   unknown,
 *   ValidFavoriteFlightQueryParams
 * >} req
 * @param {Response} res
 */
async function getFavoriteFlights(req, res) {
  const { meta, flights } = await FlightService.getFavoriteFlights(req.query);

  res.status(200).json({ meta, data: flights });
}

export const FlightController = {
  getFlight,
  getFlights,
  getFavoriteFlights
};
