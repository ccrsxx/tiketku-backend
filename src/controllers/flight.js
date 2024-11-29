import { FlightService } from '../services/flight.js';

/** @import {Request, Response} from 'express' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} res
 */
async function getFlight(req, res) {
  const flight = await FlightService.getFlight(req.params.id);

  res.status(200).json({ data: flight });
}

export const FlightController = {
  getFlight
};
