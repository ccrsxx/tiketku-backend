import { AirportService } from '../services/airport.js';

/** @import {Request, Response} from 'express' */

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function getAirports(_req, res) {
  const airports = await AirportService.getAirports();
  res.status(200).json({ data: airports });
}

export const AirportController = {
  getAirports
};
